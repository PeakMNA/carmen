# Use Cases: Workflow Management

## Document Information
- **Module**: System Administration / Workflow Management
- **Version**: 1.0
- **Last Updated**: 2026-01-16
- **Status**: Active
- **Related Documents**: BR-workflow.md, TS-workflow.md, DD-workflow.md

## Overview

This document describes the use cases for the Workflow Management module, which enables administrators to configure and manage multi-stage approval workflows for hospitality business processes. The module supports workflow configuration, stage management, dynamic routing, user assignments, and notification setup.

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Use Case Index

| Use Case ID | Use Case Name | Priority | Complexity |
|-------------|---------------|----------|------------|
| UC-WF-001 | Create New Workflow | High | High |
| UC-WF-002 | Edit Existing Workflow | High | High |
| UC-WF-003 | View Workflow Details | High | Low |
| UC-WF-004 | Delete Workflow | Medium | Medium |
| UC-WF-005 | Search and Filter Workflows | High | Low |
| UC-WF-006 | Configure Workflow Stages | High | High |
| UC-WF-007 | Configure Routing Rules | High | High |
| UC-WF-008 | Configure Notifications | Medium | Medium |
| UC-WF-009 | Assign Users to Stages | High | Medium |
| UC-WF-010 | Assign Products to Workflow | Medium | Medium |
| UC-WF-011 | Activate/Deactivate Workflow | High | Low |
| UC-WF-012 | Clone Existing Workflow | Medium | Medium |

---

## UC-WF-001: Create New Workflow

### Description
Allows administrators to create a new workflow configuration for a specific document type with all required settings including stages, routing rules, and notifications.

### Actors
- **Primary**: System Administrator
- **Secondary**: Super Administrator

### Preconditions
- User has "Create Workflows" permission
- User is authenticated and authorized
- At least one workflow type exists in the system

### Postconditions
- **Success**: New workflow is created with Draft status and stored in database
- **Failure**: No workflow is created, error message displayed to user

### Main Flow
1. User navigates to Workflow Management module
2. System displays workflow list page
3. User clicks "Create Workflow" button
4. System navigates to workflow creation page with empty form
5. User enters workflow basic information:
   - Workflow Name (unique, max 100 characters)
   - Workflow Type (Purchase Request, Store Requisition)
   - Description
   - Document Reference Pattern (e.g., "GP-{YYYY}-{00000}")
6. User clicks "General" tab to configure basic settings
7. System displays general configuration form
8. User enters or updates general information
9. User clicks "Stages" tab to configure workflow stages
10. System displays empty stages list with "Add Stage" button
11. User adds workflow stages (see UC-WF-006 for details):
    - Stage 1: Request Creation (Requester role)
    - Stage 2: Purchasing Review (Purchaser role)
    - Stage 3: Department Approval (Approver role)
    - Stage 4: Finance Review (Reviewer role)
    - Stage 5: Final Approval (Approver role)
    - Stage 6: Completed (Terminal stage)
12. User configures each stage with SLA, actions, and field visibility
13. User clicks "Routing" tab to configure routing rules
14. System displays empty routing rules list with "Add Rule" button
15. User adds routing rules (see UC-WF-007 for details):
    - Rule 1: Amount ≤ 10,000 → Skip to Completed
    - Rule 2: Amount > 10,000 → Next to Final Approval
16. User reviews all configuration across tabs
17. User clicks "Save" button
18. System validates all required fields and configuration rules
19. System creates workflow with Draft status
20. System generates unique workflow ID (e.g., "WF-001")
21. System displays success message
22. System redirects to workflow detail view

### Alternative Flows

**A1: User Cancels Creation**
- At step 17, user clicks "Cancel" button
- System displays confirmation dialog: "Discard unsaved changes?"
- User confirms cancellation
- System discards all changes
- System returns to workflow list page

**A2: Duplicate Workflow Name**
- At step 18, system detects duplicate workflow name
- System displays error: "Workflow name already exists. Please use a unique name."
- System highlights workflow name field
- User enters different workflow name
- Flow continues from step 17

**A3: Invalid Document Reference Pattern**
- At step 18, system detects invalid pattern format
- System displays error: "Invalid document reference pattern. Use format: PREFIX-{YYYY}-{00000}"
- System highlights pattern field
- User corrects pattern format
- Flow continues from step 17

**A4: Missing Required Stages**
- At step 18, system detects fewer than 2 stages
- System displays error: "Workflow must have at least 2 stages (creation + completion)"
- System switches to Stages tab
- User adds missing stages
- Flow continues from step 17

**A5: Save as Draft**
- At step 17, user selects "Save as Draft" option
- System saves workflow without full validation
- System creates workflow with Draft status
- System displays message: "Workflow saved as draft. Complete configuration to activate."
- System redirects to workflow detail view

### Exception Flows

**E1: Validation Error**
- At step 18, system encounters validation errors
- System displays error summary at top of page
- System highlights all fields with errors
- System provides specific error messages for each field
- User corrects all errors
- Flow continues from step 17

**E2: Database Error**
- At step 19, database operation fails
- System logs error details
- System displays error: "Unable to create workflow. Please try again."
- System retains all user inputs
- User can retry save operation
- Flow continues from step 17

**E3: Circular Routing Detected**
- At step 18, system detects circular routing in rules
- System displays error: "Routing rules create circular dependency"
- System highlights conflicting rules
- User modifies routing rules to eliminate cycle
- Flow continues from step 17

### Business Rules
- BR-WF-001: Workflow names must be unique
- BR-WF-002: Minimum 2 stages required (creation + completion)
- BR-WF-003: Document reference pattern must include {YYYY} and {00000}
- BR-WF-004: Routing rules must not create circular dependencies
- BR-WF-005: Each stage must have unique name within workflow

### Data Requirements
- Workflow name: Required, unique, max 100 characters
- Workflow type: Required, from enum
- Description: Optional, max 500 characters
- Document reference pattern: Required, valid format
- Stages: Minimum 2 stages
- Routing rules: Optional, valid configuration

### UI Requirements
- Tabbed interface (General, Stages, Routing)
- Real-time validation feedback
- Clear save/cancel buttons
- Progress indicator during save
- Error summary at top of page
- Field-level error messages

---

## UC-WF-002: Edit Existing Workflow

### Description
Allows administrators to modify an existing workflow configuration including stages, routing rules, notifications, and user assignments.

### Actors
- **Primary**: System Administrator
- **Secondary**: Super Administrator

### Preconditions
- User has "Edit Workflows" permission
- Workflow exists in the system
- User is authenticated and authorized

### Postconditions
- **Success**: Workflow is updated with new configuration and saved to database
- **Failure**: No changes are saved, error message displayed

### Main Flow
1. User navigates to Workflow Management module
2. System displays workflow list page
3. User locates target workflow using search or filters
4. User clicks "Edit" button for the workflow
5. System loads workflow detail page in view mode
6. System displays workflow header with:
   - Workflow name
   - Status badge (Active/Inactive/Draft)
   - "Edit" button
   - "Back to List" link
7. System displays workflow tabs (General, Stages, Routing)
8. User clicks "Edit" button in workflow header
9. System switches to edit mode:
   - Enables all editable fields
   - Displays "Save" and "Cancel" buttons
   - Hides "Edit" button
10. User navigates between tabs to review configuration
11. User makes changes in General tab:
    - Updates workflow name (if needed)
    - Modifies description
    - Changes document reference pattern
    - Updates status (Active/Inactive/Draft)
12. User switches to Stages tab
13. User modifies stage configuration:
    - Edits existing stages (name, SLA, actions, role types)
    - Adds new stages
    - Removes stages (with confirmation)
    - Reorders stages using drag-and-drop
    - Assigns/removes users from stages
14. User switches to Routing tab
15. User modifies routing rules:
    - Edits existing rules (conditions, actions, target stages)
    - Adds new routing rules
    - Removes routing rules
    - Changes rule precedence order
16. User reviews all changes across tabs
17. User clicks "Save" button
18. System validates all changes against business rules
19. System checks if workflow is active with in-progress documents
20. If workflow is active, system displays warning:
    - "This workflow has active documents. Changes will apply to new documents only."
    - User confirms to proceed
21. System saves all changes
22. System increments workflow version if significant changes made
23. System updates "Last Modified" timestamp
24. System logs configuration change in audit trail
25. System displays success message: "Workflow updated successfully"
26. System switches back to view mode

### Alternative Flows

**A1: User Cancels Editing**
- At step 17, user clicks "Cancel" button
- System displays confirmation: "Discard unsaved changes?"
- User confirms cancellation
- System discards all changes
- System switches back to view mode
- System reloads original workflow configuration

**A2: Edit Draft Workflow**
- At step 5, workflow status is Draft
- System allows full editing without restrictions
- System does not require version increment
- System does not show active documents warning
- Flow continues normally to step 21

**A3: Edit Active Workflow with In-Progress Documents**
- At step 19, system finds in-progress documents using this workflow
- System displays detailed warning:
  - "This workflow has 15 active documents in progress"
  - "Changes will affect: New documents only"
  - "Active documents will continue with current configuration"
  - Option to "Create New Version" or "Update Current"
- User selects option
- If "Create New Version", system creates new workflow version
- If "Update Current", system updates workflow with version increment
- Flow continues to step 21

**A4: Change Workflow Type**
- At step 11, user attempts to change workflow type
- System displays error: "Workflow type cannot be changed after creation"
- System keeps workflow type field disabled
- User acknowledges error
- Flow continues from step 11

**A5: Remove Stage with User Assignments**
- At step 13, user attempts to remove stage with assigned users
- System displays confirmation:
  - "Stage 'Department Approval' has 5 assigned users"
  - "Removing this stage will remove all user assignments"
  - "Are you sure you want to proceed?"
- User confirms or cancels
- If confirmed, system removes stage and assignments
- Flow continues from step 13

### Exception Flows

**E1: Concurrent Edit Detected**
- At step 21, system detects another user modified workflow
- System displays error: "Workflow was modified by another user"
- System shows option to:
  - "Reload and Lose Changes"
  - "View Differences"
  - "Merge Changes Manually"
- User selects option
- System handles accordingly

**E2: Validation Error on Save**
- At step 18, validation fails
- System displays error summary
- System highlights problematic tabs with error indicator
- System shows specific error messages per field
- User corrects errors
- Flow continues from step 17

**E3: Invalid Routing Rule After Stage Removal**
- At step 18, system detects routing rules referencing removed stages
- System displays error: "Routing rules reference deleted stages"
- System lists affected rules
- System offers to automatically remove invalid rules
- User confirms automatic cleanup or manually fixes rules
- Flow continues from step 17

**E4: Database Connection Lost**
- At step 21, database connection fails
- System displays error: "Connection lost. Changes not saved."
- System caches changes locally
- System offers to retry when connection restored
- User retries save operation
- Flow continues from step 21

### Business Rules
- BR-WF-001: Workflow names must remain unique
- BR-WF-002: Minimum 2 stages must be maintained
- BR-WF-006: Active workflows with in-progress documents require version increment for significant changes
- BR-WF-004: Modified routing rules must not create circular dependencies
- BR-WF-005: Stage names must remain unique within workflow

### Data Requirements
- All fields same as Create Workflow
- Version number: Auto-incremented for significant changes
- Last modified timestamp: Auto-updated
- Last modified by: Current user ID

### UI Requirements
- Clear edit mode indicator
- Disabled fields for non-editable properties
- Tab error indicators for validation errors
- Confirmation dialogs for destructive actions
- Auto-save draft option
- Change tracking and highlighting

---

## UC-WF-003: View Workflow Details

### Description
Allows users to view complete workflow configuration including stages, routing rules, notifications, and user assignments without making changes.

### Actors
- **Primary**: System Administrator, Department Manager, Purchasing Staff
- **Secondary**: Any authenticated user with view permission

### Preconditions
- User has "View Workflows" permission
- Workflow exists in the system
- User is authenticated

### Postconditions
- **Success**: Workflow details displayed correctly
- **Failure**: Error message displayed if workflow not found

### Main Flow
1. User navigates to Workflow Management module
2. System displays workflow list page
3. User locates target workflow using search or filters
4. User clicks workflow name or "Edit" button
5. System loads workflow detail page in view mode
6. System displays workflow header:
   - Workflow ID and name
   - Status badge with color coding:
     - Active: Green badge
     - Inactive: Gray badge
     - Draft: Yellow badge
   - Last modified date and time
7. System displays General tab by default with:
   - Workflow type
   - Description
   - Document reference pattern
   - Assigned products (if any)
   - Product count
8. User can switch to other tabs to view:
   - **Stages Tab**: Complete stage configuration
   - **Routing Tab**: Conditional routing rules
9. User clicks Stages tab
10. System displays stage list with:
    - Stage sequence number
    - Stage name
    - SLA duration and unit
    - Role type badge
    - Available actions
    - Field visibility settings
    - Assigned users count
    - Expand/collapse for user details
11. User expands stage to view assigned users
12. System displays user information:
    - User avatar or initials
    - User name
    - Department
    - Location
13. User clicks Routing tab
14. System displays routing rules table:
    - Rule name
    - Trigger stage
    - Condition (field, operator, value)
    - Action type (SKIP_STAGE, NEXT_STAGE)
    - Target stage
15. User reviews complete workflow configuration
16. User clicks "Back to Workflows" to return to list

### Alternative Flows

**A1: Workflow Not Found**
- At step 5, system cannot find workflow with specified ID
- System displays error alert:
  - Alert icon
  - "Error" title
  - "Workflow not found. Please check the provided workflow ID: {id}"
- User clicks "Back to Workflows"
- System navigates to workflow list page

**A2: View from Direct Link**
- User navigates directly to workflow detail URL
- System validates workflow ID from URL
- If valid, flow continues from step 5
- If invalid, flow continues to A1

**A3: No Routing Rules Configured**
- At step 14, workflow has no routing rules
- System displays empty state message:
  - "No routing rules configured"
  - "Routing rules allow conditional workflow paths based on document properties"
  - "Edit this workflow to add routing rules"
- User acknowledges message
- User can still view other tabs

**A4: No Products Assigned**
- At step 7, workflow has no assigned products
- System displays empty state:
  - "No products assigned to this workflow"
  - "Products can be assigned to enable product-specific workflow routing"
- User acknowledges message
- User can still view complete workflow configuration

### Exception Flows

**E1: Load Error**
- At step 5, system encounters error loading workflow
- System displays error message
- System logs error details
- System offers option to retry
- User can retry or return to list

### Business Rules
- BR-WF-010: All authenticated users can view workflow configurations
- Workflow details are read-only in view mode

### Data Requirements
- Workflow ID: Required for lookup
- All workflow configuration data: Loaded from database

### UI Requirements
- Clear read-only indicators
- Responsive tabbed interface
- Collapsible sections for better organization
- Color-coded status badges
- User-friendly empty states
- Clear navigation breadcrumbs

---

## UC-WF-004: Delete Workflow

### Description
Allows administrators to delete workflow configurations that are no longer needed, with validation to prevent deletion of active workflows with in-progress documents.

### Actors
- **Primary**: System Administrator
- **Secondary**: Super Administrator

### Preconditions
- User has "Delete Workflows" permission
- Workflow exists in the system
- User is authenticated and authorized

### Postconditions
- **Success**: Workflow is soft-deleted and removed from active list
- **Failure**: Workflow not deleted, error message displayed

### Main Flow
1. User navigates to Workflow Management module
2. System displays workflow list page
3. User locates target workflow
4. User clicks "Delete" button (or selects Delete from actions menu)
5. System checks workflow status and usage:
   - Checks if workflow has in-progress documents
   - Checks if workflow is referenced in templates
   - Checks if workflow has historical document count
6. System displays confirmation dialog:
   - Workflow name
   - Workflow type
   - Current status
   - Historical document count
   - Warning message based on usage
   - "Delete" and "Cancel" buttons
7. User confirms deletion by clicking "Delete"
8. System validates deletion constraints
9. System performs soft delete:
   - Sets deleted_at timestamp to current time
   - Sets deleted_by_id to current user ID
   - Keeps all workflow data for audit trail
10. System removes workflow from active list
11. System logs deletion in audit trail
12. System displays success message: "Workflow deleted successfully"
13. System refreshes workflow list
14. Deleted workflow no longer appears in list

### Alternative Flows

**A1: User Cancels Deletion**
- At step 7, user clicks "Cancel" button
- System closes confirmation dialog
- No changes are made to workflow
- User remains on workflow list page

**A2: Delete Draft Workflow**
- At step 5, workflow status is Draft
- System checks that no documents exist
- System displays simplified confirmation:
  - "Delete draft workflow '{name}'?"
  - "This action cannot be undone"
- User confirms deletion
- Flow continues from step 8

**A3: Delete Inactive Workflow**
- At step 5, workflow status is Inactive
- System checks for historical documents
- If historical documents exist:
  - System displays warning: "This workflow has {count} historical documents"
  - "Workflow will be archived, not permanently deleted"
  - "Historical documents will remain accessible"
- User confirms deletion
- Flow continues from step 8

### Exception Flows

**E1: Active Workflow with In-Progress Documents**
- At step 8, system finds in-progress documents
- System displays error:
  - "Cannot delete active workflow"
  - "This workflow has {count} documents in progress"
  - "Please deactivate workflow and wait for all documents to complete"
  - "Or reassign documents to another workflow"
- System provides options:
  - "Deactivate Workflow" button
  - "View Active Documents" button
  - "Cancel" button
- User selects option
- Deletion is blocked

**E2: Workflow Referenced in Templates**
- At step 8, system finds workflow referenced in purchase request templates
- System displays error:
  - "Cannot delete workflow"
  - "This workflow is referenced in {count} purchase request templates"
  - "Please update or delete templates first"
- System lists affected templates
- User clicks "View Templates"
- System navigates to templates list filtered by workflow
- Deletion is blocked

**E3: Last Workflow of Type**
- At step 8, system detects this is the last active workflow of this type
- System displays warning:
  - "This is the last active workflow for '{type}'"
  - "Deleting this workflow will prevent creation of new '{type}' documents"
  - "Are you sure you want to proceed?"
- User must explicitly confirm
- If confirmed, flow continues from step 9
- If cancelled, deletion is blocked

**E4: Database Error During Deletion**
- At step 9, database operation fails
- System logs error details
- System displays error: "Unable to delete workflow. Please try again."
- Workflow remains unchanged
- User can retry deletion
- Flow returns to step 1

### Business Rules
- BR-WF-006: Active workflows with in-progress documents cannot be deleted
- BR-WF-006: Workflows referenced in active templates cannot be deleted
- Deletion is always soft delete to maintain audit trail
- Historical documents remain linked to deleted workflows

### Data Requirements
- Workflow ID: Required for deletion
- Deleted timestamp: Set to current time
- Deleted by user ID: Set to current user
- All workflow data: Retained for audit

### UI Requirements
- Clear confirmation dialog with impact summary
- Color-coded warning messages
- Document count display
- Options to view affected documents/templates
- Disable delete button for workflows that cannot be deleted
- Show tooltip explaining why delete is disabled

---

## UC-WF-005: Search and Filter Workflows

### Description
Allows users to quickly locate specific workflows using search and filter capabilities on the workflow list page.

### Actors
- **Primary**: System Administrator
- **Secondary**: All authenticated users with view permission

### Preconditions
- User is authenticated
- User has "View Workflows" permission
- Workflow list page is loaded

### Postconditions
- **Success**: Filtered workflow list displayed matching search criteria
- **Failure**: Empty list with appropriate message if no matches found

### Main Flow
1. User navigates to Workflow Management module
2. System displays workflow list page with all workflows
3. System shows total workflow count
4. System displays search and filter controls:
   - Search input field (with search icon)
   - Type filter dropdown
   - Status filter dropdown
5. User enters search term in search field
6. System filters workflows in real-time as user types:
   - Matches against workflow name (case-insensitive)
   - Uses partial matching
   - Updates result count immediately
7. System displays filtered workflows
8. User selects workflow type from type filter dropdown
9. System applies type filter:
   - "All Types" (default - shows all)
   - "Purchase Request"
   - "Store Requisition"
10. System combines type filter with search term (AND logic)
11. System updates workflow list and result count
12. User selects status from status filter dropdown
13. System applies status filter:
    - "All Statuses" (default - shows all)
    - "Active"
    - "Inactive"
    - "Draft"
14. System combines all filters (search AND type AND status)
15. System displays final filtered results
16. System shows result summary: "Showing X to Y of Z workflows"
17. User can clear filters by:
    - Clearing search field
    - Selecting "All Types"
    - Selecting "All Statuses"

### Alternative Flows

**A1: No Results Found**
- At step 7, 10, or 14, filters produce no matching workflows
- System displays empty state:
  - "No workflows found matching the current filters"
  - Current filter summary
  - "Try adjusting your search criteria" message
  - "Clear Filters" button
- User clicks "Clear Filters"
- System resets all filters to defaults
- System displays complete workflow list

**A2: Search by Workflow ID**
- At step 5, user enters workflow ID (e.g., "WF-001")
- System searches in both name and ID fields
- System displays matching workflow
- Flow continues from step 7

**A3: Quick Filter by Status Badge**
- User clicks status badge in workflow list
- System automatically sets status filter to clicked status
- System updates filtered results
- Flow continues from step 14

### Exception Flows

**E1: Search Input Error**
- At step 6, user enters special characters that cause search error
- System sanitizes input automatically
- System continues search with sanitized term
- No error displayed to user

### Business Rules
- All filters use AND logic when combined
- Search is case-insensitive
- Search uses partial matching (contains)
- Filters persist during session
- Pagination resets to page 1 when filters change

### Data Requirements
- Search term: Optional, max 100 characters
- Type filter: One of enum values or "all"
- Status filter: One of enum values or "all"

### UI Requirements
- Real-time search (no search button required)
- Clear visual distinction between filtered and unfiltered state
- Filter badge showing active filter count
- "Clear All Filters" button when filters are active
- Loading indicator during filter application
- Maintain filter state during pagination

---

## UC-WF-006: Configure Workflow Stages

### Description
Allows administrators to add, edit, remove, and reorder workflow stages with complete configuration including SLA, actions, field visibility, role types, and user assignments.

### Actors
- **Primary**: System Administrator
- **Secondary**: Super Administrator

### Preconditions
- User has "Edit Workflows" permission
- Workflow is in edit mode
- User is on Stages tab of workflow detail page

### Postconditions
- **Success**: Stages are configured and saved with workflow
- **Failure**: Invalid stage configuration prevented, error messages displayed

### Main Flow
1. User clicks "Stages" tab in workflow detail page
2. System displays current stage list (or empty list for new workflow)
3. System displays "Add Stage" button
4. User clicks "Add Stage" button
5. System displays stage configuration dialog:
   - Stage Name field
   - Stage Description field
   - SLA Duration number input
   - SLA Unit dropdown (hours, days)
   - Role Type dropdown (Requester, Purchaser, Approver, Reviewer)
   - Available Actions multi-select (Submit, Approve, Reject, Send Back)
   - Field Visibility checkboxes (Hide Price Per Unit, Hide Total Price)
6. User enters stage information:
   - Name: "Department Approval"
   - Description: "Review and approval by department head"
   - SLA: 12 hours
   - Role Type: Approver
   - Actions: [Approve, Reject, Send Back]
   - Field Visibility: Show all fields
7. User clicks "Add" button
8. System validates stage configuration:
   - Name is unique within workflow
   - SLA is positive number
   - At least one action selected (except for terminal stages)
9. System adds stage to workflow
10. System displays stage in list with sequence number
11. User repeats steps 4-10 to add all required stages
12. User reorders stages using drag-and-drop:
    - Drags stage to new position
    - System updates sequence numbers automatically
13. User clicks on stage to expand details
14. System displays stage detail panel:
    - All stage configuration
    - Assigned users section
    - "Assign Users" button
    - "Edit Stage" button
    - "Delete Stage" button
15. User clicks "Assign Users" button
16. System displays user assignment interface (see UC-WF-009)
17. User assigns users to stage
18. System saves user assignments with stage
19. User returns to stage list
20. User clicks "Edit Stage" button to modify existing stage
21. System displays stage edit dialog with current values
22. User modifies stage settings
23. User clicks "Save" button
24. System validates and saves changes
25. System updates stage in list
26. All stages are configured and user returns to workflow detail

### Alternative Flows

**A1: Add Terminal "Completed" Stage**
- At step 6, user creates terminal stage
- User enters:
  - Name: "Completed"
  - Description: "Request has been completed"
  - SLA: 0
  - Role Type: Reviewer
  - Actions: None (empty)
  - Field Visibility: Show all
- System allows zero SLA for terminal stage
- System allows empty actions for terminal stage
- Flow continues from step 7

**A2: Remove Stage**
- At step 14, user clicks "Delete Stage" button
- System checks if stage is referenced in routing rules
- If referenced, system displays warning:
  - "This stage is referenced in {count} routing rules"
  - "Removing this stage will invalidate these rules"
  - Options: "Remove Stage and Rules" or "Cancel"
- User confirms removal
- System removes stage and affected routing rules
- System updates stage sequence numbers
- Flow continues from step 19

**A3: Duplicate Stage**
- At step 14, user clicks "Duplicate" button (alternative action)
- System creates copy of stage with:
  - Name: "{Original Name} (Copy)"
  - All other settings copied
  - Empty user assignments
- System adds duplicated stage below original
- Flow continues from step 10

**A4: Reorder Stages**
- At step 12, user drags stage to new position
- System validates that terminal stage remains last
- If user tries to move terminal stage:
  - System displays error: "Completed stage must be the last stage"
  - System resets stage to original position
- Flow continues from step 13

**A5: Hide All Fields**
- At step 6 or 22, user attempts to hide all price fields
- System displays warning:
  - "Hiding all fields may prevent users from viewing critical information"
  - "Are you sure?"
- User confirms or cancels
- If confirmed, system saves configuration
- Flow continues normally

### Exception Flows

**E1: Duplicate Stage Name**
- At step 8 or 24, system detects duplicate stage name
- System displays error: "Stage name must be unique within workflow"
- System highlights stage name field
- User enters different name
- Flow continues from step 7 or 23

**E2: Invalid SLA**
- At step 8 or 24, system detects invalid SLA
- System displays error: "SLA must be a positive number (or 0 for terminal stages)"
- System highlights SLA field
- User corrects SLA value
- Flow continues from step 7 or 23

**E3: No Actions Selected for Non-Terminal Stage**
- At step 8 or 24, user submits stage without actions (non-terminal)
- System displays error: "At least one action must be selected for non-terminal stages"
- System highlights actions field
- User selects at least one action
- Flow continues from step 7 or 23

**E4: Remove Last Non-Terminal Stage**
- At step A2, user attempts to remove last non-terminal stage
- System displays error: "Cannot remove stage. Workflow must have at least one processing stage"
- Removal is blocked
- Flow returns to step 14

### Business Rules
- BR-WF-003: Each stage must have unique name within workflow
- BR-WF-003: SLA must be positive integer or zero (terminal stages only)
- BR-WF-003: Terminal stages must have no available actions
- BR-WF-002: Minimum 2 stages required (creation + completion)
- Terminal "Completed" stage must be last stage

### Data Requirements
- Stage name: Required, max 100 characters, unique within workflow
- Stage description: Optional, max 500 characters
- SLA duration: Required, integer ≥ 0
- SLA unit: Required, from enum (hours, days)
- Role type: Required, from enum
- Available actions: Required for non-terminal stages
- Field visibility: Optional, defaults to show all
- Sequence number: Auto-generated

### UI Requirements
- Drag-and-drop for stage reordering
- Expandable/collapsible stage panels
- Visual sequence indicators (1, 2, 3...)
- Role type color badges
- SLA display with unit
- User count badge per stage
- Clear add/edit/delete buttons
- Confirmation for destructive actions

---

## UC-WF-007: Configure Routing Rules

### Description
Allows administrators to create conditional routing rules that determine workflow paths based on document field values, enabling dynamic approval processes.

### Actors
- **Primary**: System Administrator
- **Secondary**: Super Administrator

### Preconditions
- User has "Edit Workflows" permission
- Workflow is in edit mode
- Workflow has at least 2 stages configured
- User is on Routing tab of workflow detail page

### Postconditions
- **Success**: Routing rules configured and saved with workflow
- **Failure**: Invalid routing rules prevented, error messages displayed

### Main Flow
1. User clicks "Routing" tab in workflow detail page
2. System displays current routing rules list (or empty list)
3. System displays available workflow stages for routing
4. System displays "Add Routing Rule" button
5. User clicks "Add Routing Rule" button
6. System displays routing rule configuration dialog:
   - Rule Name field
   - Rule Description field
   - Trigger Stage dropdown (list of workflow stages)
   - Condition section:
     - Field dropdown (amount, category, priority, etc.)
     - Operator dropdown (eq, lt, gt, lte, gte)
     - Value input field
   - Action section:
     - Action Type dropdown (SKIP_STAGE, NEXT_STAGE)
     - Target Stage dropdown (list of stages)
7. User enters routing rule:
   - Name: "Amount <= 10,000 BAHT"
   - Description: "Skip to Completed for amounts less than or equal to 10,000 BAHT"
   - Trigger Stage: "Finance Review"
   - Condition:
     - Field: "amount"
     - Operator: "lte" (Less Than or Equal)
     - Value: "10000"
   - Action:
     - Type: "SKIP_STAGE"
     - Target: "Completed"
8. User clicks "Add" button
9. System validates routing rule:
   - Rule name is unique within workflow
   - Trigger stage exists in workflow
   - Target stage exists in workflow
   - Condition field is valid document property
   - Value is appropriate for operator and field type
   - Rule does not create circular dependency
10. System adds rule to routing rules list
11. System displays rule with summary:
    - Rule name
    - Trigger stage
    - Condition display (field operator value)
    - Action display (type → target)
12. User repeats steps 5-10 to add additional rules:
    - Rule 2: "Amount > 10,000 BAHT" → Route to "Final Approval"
13. User reorders rules using drag-and-drop (rule precedence)
14. System updates rule evaluation order
15. User clicks on rule to edit
16. System displays edit dialog with current rule values
17. User modifies rule settings
18. User clicks "Save" button
19. System validates changes
20. System updates rule in list
21. All routing rules configured and user returns to workflow detail

### Alternative Flows

**A1: No Routing Rules Needed**
- At step 2, user decides not to add routing rules
- This is valid configuration (sequential workflow)
- User navigates to other tabs or saves workflow
- Workflow executes sequentially through all stages

**A2: Remove Routing Rule**
- At step 15, user clicks "Delete" button in rule panel
- System displays confirmation:
  - "Remove routing rule '{name}'?"
  - "This will restore sequential workflow for this stage"
- User confirms deletion
- System removes rule from list
- Flow continues from step 21

**A3: Duplicate Routing Rule**
- At step 15, user clicks "Duplicate" button
- System creates copy of rule with:
  - Name: "{Original Name} (Copy)"
  - All other settings copied
- System adds duplicated rule to list
- User can modify duplicate as needed
- Flow continues from step 15

**A4: Create Mutually Exclusive Rules**
- At step 12, user creates multiple rules for same trigger stage
- User creates:
  - Rule 1: amount ≤ 10000 → Skip to Completed
  - Rule 2: amount > 10000 → Next to Final Approval
- System validates rules are mutually exclusive
- System accepts both rules
- System evaluates in precedence order
- Flow continues normally

**A5: Quick Rule Templates**
- At step 6, system offers common rule templates:
  - "Low Amount Skip Approval"
  - "High Amount Additional Approval"
  - "Category-Based Routing"
- User selects template
- System pre-fills fields with template values
- User can modify as needed
- Flow continues from step 7

### Exception Flows

**E1: Circular Routing Dependency**
- At step 9 or 19, system detects circular dependency
- Example: Stage A → Stage B → Stage A (loop)
- System displays error:
  - "This routing rule creates a circular dependency"
  - Visual diagram showing the cycle
  - "Please modify the target stage to break the cycle"
- System highlights affected stages
- User modifies rule to eliminate cycle
- Flow continues from step 7 or 17

**E2: Duplicate Rule Name**
- At step 9 or 19, system detects duplicate rule name
- System displays error: "Rule name must be unique within workflow"
- System highlights rule name field
- User enters different name
- Flow continues from step 8 or 18

**E3: Invalid Target Stage**
- At step 9 or 19, target stage equals trigger stage
- System displays error: "Target stage cannot be the same as trigger stage"
- System highlights target stage field
- User selects different target stage
- Flow continues from step 7 or 17

**E4: Unreachable Stage Created**
- At step 9, new rule creates unreachable stage scenario
- System displays warning:
  - "This rule may create unreachable stages"
  - Lists potentially unreachable stages
  - Options: "Proceed Anyway" or "Modify Rule"
- User decides to proceed or modify
- If proceed, system saves rule with warning flag
- If modify, flow continues from step 7

**E5: Invalid Field Value Type**
- At step 9 or 19, value type doesn't match field type
- Example: Text value for numeric field
- System displays error: "Value must be numeric for field 'amount'"
- System highlights value field
- User enters correct value type
- Flow continues from step 7 or 17

### Business Rules
- BR-WF-004: Routing rules must not create circular dependencies
- BR-WF-004: Target stages must exist in workflow
- BR-WF-004: Multiple rules for same trigger stage must not conflict
- Rules evaluate in precedence order (first match wins)
- Skip stages must point to later stages in sequence

### Data Requirements
- Rule name: Required, max 100 characters, unique within workflow
- Rule description: Optional, max 500 characters
- Trigger stage: Required, valid stage name from workflow
- Condition field: Required, valid document property
- Operator: Required, from enum
- Condition value: Required, type matches field
- Action type: Required, from enum
- Target stage: Required, valid stage name from workflow
- Precedence order: Auto-generated, modifiable

### UI Requirements
- Visual rule builder interface
- Field type-aware value input (number, text, date picker)
- Operator dropdown filtered by field type
- Stage dropdown shows only valid target stages
- Visual representation of routing logic
- Drag-and-drop for rule precedence
- Rule validation feedback in real-time
- Warning indicators for potential issues

---

## UC-WF-008: Configure Notifications

### Description
Allows administrators to configure automated notifications for workflow events with customizable recipients, channels, and message templates.

### Actors
- **Primary**: System Administrator
- **Secondary**: Super Administrator

### Preconditions
- User has "Edit Workflows" permission
- Workflow is in edit mode
- Email service is configured and available

### Postconditions
- **Success**: Notification configuration saved with workflow
- **Failure**: Invalid notification configuration prevented

### Main Flow
1. User navigates to Notifications section in workflow detail
2. System displays current notification configurations
3. System displays "Add Notification" button
4. User clicks "Add Notification" button
5. System displays notification configuration dialog:
   - Event Name field
   - Event Trigger dropdown (onSubmit, onApprove, onReject, onSendBack, onSLA)
   - Description field
   - Recipients multi-select checklist:
     - Requester
     - Current Approver
     - Previous Approver
     - Next Approver
     - All Previous Approvers
     - Approver's Manager
   - Channels multi-select:
     - Email
     - System (in-app notification)
6. User configures notification:
   - Event: "Request Submitted"
   - Trigger: onSubmit
   - Description: "Notify when request is initially submitted"
   - Recipients: [Requester, Purchasing Staff]
   - Channels: [Email, System]
7. User clicks "Add" button
8. System validates notification configuration
9. System adds notification to list
10. User configures notification template (optional)
11. User clicks "Configure Template" button for notification
12. System displays template editor:
    - Template name field
    - Subject line with variable support
    - Email body editor with rich text
    - Variable picker for dynamic content
13. User creates email template:
    - Subject: "New Purchase Request: {{request.number}}"
    - Body: Template content with variables
14. User inserts template variables:
    - {{requester.name}}
    - {{request.amount}}
    - {{request.date}}
    - {{system.companyName}}
15. User clicks "Preview" to see sample template
16. System displays template preview with sample data
17. User clicks "Save Template"
18. System validates template and saves
19. System links template to notification
20. User repeats steps 4-19 for other events
21. All notifications configured

### Alternative Flows

**A1: Use Existing Template**
- At step 11, user selects "Use Existing Template"
- System displays list of available templates filtered by event trigger
- User selects template from list
- System links selected template to notification
- Flow continues from step 19

**A2: Edit Notification**
- At step 2, user clicks "Edit" on existing notification
- System displays edit dialog with current settings
- User modifies recipients or channels
- User clicks "Save"
- System validates and updates notification
- Flow continues from step 21

**A3: Remove Notification**
- At step 2, user clicks "Delete" on notification
- System displays confirmation:
  - "Remove notification for '{event}'?"
  - "Stakeholders will no longer receive notifications for this event"
- User confirms deletion
- System removes notification configuration
- Flow continues from step 21

**A4: SLA Warning Configuration**
- At step 6, user selects onSLA trigger
- System displays additional SLA warning settings:
  - Warning threshold (hours before SLA breach)
  - Repeat interval (for recurring warnings)
  - Escalation recipient (optional)
- User configures SLA warning parameters
- Flow continues from step 7

### Exception Flows

**E1: No Recipients Selected**
- At step 8, validation detects no recipients
- System displays error: "At least one recipient must be selected"
- System highlights recipients field
- User selects at least one recipient
- Flow continues from step 7

**E2: No Channels Selected**
- At step 8, validation detects no channels
- System displays error: "At least one notification channel must be selected"
- System highlights channels field
- User selects at least one channel
- Flow continues from step 7

**E3: Invalid Template Variable**
- At step 18, template contains invalid variable
- System displays error: "Unknown variable: {{invalid.variable}}"
- System highlights problematic variable
- User corrects or removes variable
- Flow continues from step 17

**E4: Email Service Unavailable**
- At step 8, system detects email service is down
- System displays warning:
  - "Email service is currently unavailable"
  - "Email notifications may not be delivered"
  - "System notifications will still work"
  - Options: "Continue" or "Wait for Email Service"
- User chooses to continue or wait
- If continue, notification is saved with warning flag

### Business Rules
- BR-WF-007: Each notification must have at least one recipient
- BR-WF-007: Each notification must have at least one channel
- BR-WF-007: Template variables must be valid for event type
- Multiple notifications can exist for same event with different recipients
- SLA warnings must trigger before SLA breach

### Data Requirements
- Event name: Required, max 100 characters
- Event trigger: Required, from enum
- Description: Optional, max 500 characters
- Recipients: Required, at least one selected
- Channels: Required, at least one selected
- Template (optional):
  - Template name: Max 100 characters
  - Subject line: Max 200 characters
  - Email body: Max 10,000 characters

### UI Requirements
- Clear event trigger labels with descriptions
- Visual recipient selection with role badges
- Channel selection with icons (Email, Bell)
- Template editor with rich text support
- Variable picker with search and categories
- Preview functionality with sample data
- Save/Cancel buttons
- Validation feedback

---

## UC-WF-009: Assign Users to Stages

### Description
Allows administrators to assign users to workflow stages based on role type, department, and location, enabling role-based workflow execution.

### Actors
- **Primary**: System Administrator
- **Secondary**: Super Administrator

### Preconditions
- User has "Edit Workflows" permission
- Workflow is in edit mode
- Workflow stages are configured
- Users exist in the system

### Postconditions
- **Success**: Users assigned to stage and saved with workflow
- **Failure**: Invalid user assignments prevented

### Main Flow
1. User is viewing workflow Stages tab
2. User selects stage to assign users
3. User clicks "Assign Users" button on stage
4. System displays user assignment dialog with two panels:
   - Left panel: Available users (not assigned to this stage)
   - Right panel: Assigned users (currently assigned)
5. System filters available users by stage role type:
   - Requester stage: Users with request creation permission
   - Purchaser stage: Users with purchasing staff role
   - Approver stage: Users with approval authority
   - Reviewer stage: Users with review/oversight role
6. System displays user information in available panel:
   - User avatar or initials with color variant
   - User name
   - Department
   - Location
   - Selection checkbox
7. System displays search field above available users panel
8. User enters search term to filter users
9. System filters available users by name, department, or location
10. User selects users to assign:
    - Clicks individual checkboxes
    - OR clicks "Select All" for bulk selection
11. System highlights selected users
12. User clicks "Assign" button (center chevron →)
13. System validates user selections:
    - Users have appropriate permissions
    - Users are active
    - Users belong to valid departments/locations
14. System moves selected users to assigned panel
15. System displays assigned users with:
    - User avatar
    - User name
    - Department badge
    - Location badge
    - Remove button (×)
16. User can remove assigned users:
    - Clicks remove button on individual user
    - OR selects multiple and clicks "Remove" button (center chevron ←)
17. System moves users back to available panel
18. User reviews final user assignments
19. User clicks "Save" button
20. System saves user assignments with stage
21. System closes user assignment dialog
22. System updates stage display showing assigned user count

### Alternative Flows

**A1: No Users Match Filter**
- At step 9, search produces no results
- System displays empty state:
  - "No users found matching '{search term}'"
  - "Try a different search term"
  - "Clear Search" button
- User clicks "Clear Search"
- System resets search and shows all available users
- Flow continues from step 8

**A2: Assign All Users**
- At step 10, user clicks "Select All" checkbox
- System selects all users in available panel
- System displays count: "{count} users selected"
- User clicks "Assign" button
- System assigns all users at once
- Flow continues from step 13

**A3: Remove All Assigned Users**
- At step 16, user clicks "Remove All" button
- System displays confirmation:
  - "Remove all {count} assigned users?"
  - "Stage will have no assigned users"
- User confirms removal
- System moves all users back to available panel
- Flow continues from step 18

**A4: Filter by Department**
- At step 6, user applies department filter
- System displays department dropdown
- User selects department (e.g., "Purchasing")
- System filters available users to selected department only
- Flow continues from step 9

**A5: Filter by Location**
- At step 6, user applies location filter
- System displays location dropdown
- User selects location (e.g., "Main Building")
- System filters available users to selected location only
- Flow continues from step 9

**A6: Cancel Assignment**
- At step 19, user clicks "Cancel" button
- System displays confirmation: "Discard user assignment changes?"
- User confirms cancellation
- System reverts to previous assignments
- System closes dialog without saving
- Flow returns to step 2

### Exception Flows

**E1: User Lacks Required Permission**
- At step 13, system detects user doesn't have stage role permission
- System displays error:
  - "Cannot assign {user name}"
  - "User does not have '{role type}' permission"
  - "Please assign appropriate role first"
- System removes invalid user from selection
- System continues assigning valid users
- Flow continues from step 14

**E2: User Is Inactive**
- At step 13, system detects user has inactive status
- System displays warning:
  - "Cannot assign inactive user: {user name}"
  - "Please activate user account first"
- System removes inactive user from selection
- System continues assigning active users
- Flow continues from step 14

**E3: Duplicate Assignment Attempt**
- At step 13, system detects user already assigned
- System silently skips duplicate
- System continues processing remaining users
- No error displayed

**E4: Empty Assignment Saved**
- At step 19, user saves with no assigned users
- System displays confirmation:
  - "Save stage with no assigned users?"
  - "Users can be dynamically assigned at runtime"
  - Options: "Save Anyway" or "Cancel"
- User chooses to save or continue assigning
- If save, system allows empty assignment (valid configuration)
- Flow continues from step 20 or returns to step 6

### Business Rules
- BR-WF-005: Assigned users must have active status
- BR-WF-005: Users must have appropriate permissions for role type
- BR-WF-005: Users must belong to valid departments and locations
- Empty user assignments are allowed (dynamic assignment at runtime)
- Same user can be assigned to multiple stages

### Data Requirements
- User ID: Required for assignment
- User name: Display only
- Department: Display and filter
- Location: Display and filter
- Role permissions: Validated before assignment
- Active status: Validated before assignment

### UI Requirements
- Dual-panel interface (available / assigned)
- Search with real-time filtering
- Checkbox selection with "Select All"
- Directional chevron buttons for assign/remove
- User avatars with color variants (7 colors based on ID hash)
- Department and location badges
- User count display in each panel
- Clear save/cancel buttons
- Confirmation for bulk operations
- Responsive layout for smaller screens

---

## UC-WF-010: Assign Products to Workflow

### Description
Allows administrators to assign products or services to workflows, enabling product-specific workflow routing and automatic workflow selection.

### Actors
- **Primary**: System Administrator
- **Secondary**: Super Administrator

### Preconditions
- User has "Edit Workflows" permission
- Workflow is in edit mode
- Products exist in the system
- User is on General tab or Products section

### Postconditions
- **Success**: Products assigned to workflow and saved
- **Failure**: Invalid product assignments prevented

### Main Flow
1. User views workflow General tab
2. System displays Products section with current assignments
3. System displays "Assign Products" button
4. User clicks "Assign Products" button
5. System displays product assignment dialog with dual panels:
   - Left panel: Available products
   - Right panel: Assigned products
6. System displays product information:
   - Product code
   - Product name
   - Category badge
   - Sub-category (if applicable)
   - Selection checkbox
7. System provides filter controls:
   - Category filter dropdown
   - Search field for code/name
8. User applies category filter (e.g., "Service")
9. System filters available products to selected category
10. User enters search term in search field
11. System filters products by code or name (case-insensitive)
12. User selects products to assign:
    - Clicks individual checkboxes
    - OR clicks "Select All" for bulk selection
13. System highlights selected products
14. User clicks "Assign" button (center chevron →)
15. System validates product selections
16. System moves selected products to assigned panel
17. System displays assigned products with:
    - Product code
    - Product name
    - Category badge
    - Remove button (×)
18. User can remove assigned products:
    - Clicks remove button on individual product
    - OR selects multiple and clicks "Remove" button
19. System moves products back to available panel
20. User reviews final product assignments
21. User clicks "Save" button
22. System saves product assignments with workflow
23. System closes product assignment dialog
24. System updates Products section showing assigned count

### Alternative Flows

**A1: Filter by Multiple Categories**
- At step 8, user selects "All Categories"
- System shows products from all categories
- User can see full product catalog
- Flow continues from step 10

**A2: No Products in Category**
- At step 9, category has no products
- System displays empty state:
  - "No products in '{category}' category"
  - "Try selecting a different category"
- User selects different category
- Flow continues from step 8

**A3: Assign All Products in Category**
- At step 12, user filters to specific category
- User clicks "Select All"
- System selects all products in current filtered view
- User clicks "Assign"
- System assigns all filtered products
- Flow continues from step 15

**A4: Remove All Products**
- At step 18, user clicks "Remove All" button
- System displays confirmation:
  - "Remove all {count} assigned products?"
  - "Workflow will apply to all products"
- User confirms removal
- System removes all product assignments
- Empty assignment is valid (workflow applies to all)
- Flow continues from step 20

**A5: Quick Search by Code**
- At step 10, user enters product code (e.g., "RS")
- System matches exact code first, then partial
- System displays matching products
- User selects desired product
- Flow continues from step 12

### Exception Flows

**E1: Product Already Assigned to Another Workflow**
- At step 15, system detects product assigned to different workflow
- System displays warning:
  - "Product '{name}' is already assigned to '{other workflow}'"
  - "Assigning here will remove from other workflow"
  - Options: "Proceed" or "Cancel"
- User chooses to proceed or cancel
- If proceed, system reassigns product
- If cancel, system skips this product

**E2: No Products Selected**
- At step 14, user clicks "Assign" with no selection
- System displays message: "Please select at least one product"
- System highlights available panel
- User selects products
- Flow continues from step 12

**E3: Inactive Product Selected**
- At step 15, system detects inactive product
- System displays warning:
  - "Cannot assign inactive product: '{name}'"
  - "Please activate product first or skip"
- System highlights inactive product
- User can remove from selection or activate product
- Flow continues from step 14

### Business Rules
- Products can be assigned to multiple workflows (optional exclusivity)
- Empty product assignment is valid (workflow applies to all products)
- Inactive products cannot be assigned
- Product assignments help with automatic workflow selection

### Data Requirements
- Product ID: Required for assignment
- Product code: Display and search
- Product name: Display and search
- Category: Display and filter
- Sub-category: Display (optional)
- Active status: Validated before assignment

### UI Requirements
- Dual-panel interface (available / assigned)
- Category filter dropdown
- Search with real-time filtering
- Checkbox selection with "Select All"
- Directional chevron buttons
- Product code and name display
- Category badges with colors
- Product count in each panel
- Clear save/cancel buttons

---

## UC-WF-011: Activate/Deactivate Workflow

### Description
Allows administrators to change workflow status between Active, Inactive, and Draft states to control workflow availability for new documents.

### Actors
- **Primary**: System Administrator
- **Secondary**: Super Administrator

### Preconditions
- User has "Edit Workflows" permission
- Workflow exists in the system
- User is authenticated

### Postconditions
- **Success**: Workflow status updated successfully
- **Failure**: Status change prevented, error message displayed

### Main Flow
1. User views workflow detail page
2. System displays current workflow status badge
3. User clicks "Edit" button to enter edit mode
4. System enables status dropdown in General tab
5. User clicks status dropdown
6. System displays status options:
   - Active
   - Inactive
   - Draft
7. User selects new status (e.g., "Active")
8. If changing Draft → Active, system performs activation validation:
   - Checks minimum 2 stages exist
   - Validates all stages properly configured
   - Ensures at least one stage has user assignments or allows dynamic
   - Validates document reference pattern
   - Checks no circular routing rules
9. System displays validation results
10. If validation passes, user clicks "Save" button
11. System updates workflow status
12. System updates last modified timestamp
13. System logs status change in audit trail
14. System displays success message
15. System refreshes workflow status badge
16. If activated, workflow appears in document creation dropdowns
17. If deactivated, workflow removed from dropdowns (existing documents unaffected)

### Alternative Flows

**A1: Deactivate Active Workflow**
- At step 7, user changes Active → Inactive
- System checks for in-progress documents
- If documents exist, system displays warning:
  - "{count} documents are currently in progress"
  - "These documents will continue with current workflow"
  - "New documents cannot use this workflow"
  - "Confirm deactivation?"
- User confirms deactivation
- System deactivates workflow
- In-progress documents continue normally
- Flow continues from step 11

**A2: Reactivate Inactive Workflow**
- At step 7, user changes Inactive → Active
- System performs activation validation
- System checks if configuration has changed since deactivation
- If significant changes, system suggests version increment
- User proceeds with reactivation
- Flow continues from step 11

**A3: Save as Draft from Active**
- At step 7, user changes Active → Draft
- System displays confirmation:
  - "Changing to Draft will remove workflow from document creation"
  - "In-progress documents will continue"
  - "Confirm change to Draft?"
- User confirms change
- System changes status to Draft
- Flow continues from step 11

### Exception Flows

**E1: Activation Validation Fails**
- At step 9, validation detects errors
- System displays error summary:
  - "Cannot activate workflow - please fix the following:"
  - List of validation errors with details
- Common errors:
  - "Less than 2 stages configured"
  - "Stage '{name}' has invalid SLA"
  - "Circular routing detected in rules"
  - "No users assigned and dynamic assignment not enabled"
- System highlights problematic tabs
- System prevents status change
- User must fix errors before activation
- Flow returns to step 4

**E2: Cannot Deactivate Last Workflow**
- At step 8, system detects this is last active workflow of type
- System displays error:
  - "Cannot deactivate last workflow of type '{type}'"
  - "At least one active workflow required for each type"
  - "Please activate another workflow first"
- Status change is blocked
- Flow returns to step 4

**E3: Concurrent Status Change**
- At step 11, system detects another user changed status
- System displays error:
  - "Workflow status was changed by {user name}"
  - "Current status: {current status}"
  - "Your requested change: {requested status}"
  - Options: "Reload" or "Override"
- User chooses action
- If reload, system refreshes with current status
- If override (admin only), system proceeds with change

### Business Rules
- BR-WF-002: Workflows must meet activation requirements before activation
- At least one active workflow should exist per workflow type
- Status changes don't affect in-progress documents
- Only Draft and Inactive workflows can be deleted
- Deactivation is reversible (reactivation allowed)

### Data Requirements
- Current status: Read from database
- New status: Selected by user from enum
- Last modified timestamp: Auto-updated on status change
- Last modified by: Current user ID
- Audit log entry: Created with status change details

### UI Requirements
- Clear status badge with color coding:
  - Active: Green badge
  - Inactive: Gray badge
  - Draft: Yellow badge
- Status dropdown in edit mode
- Validation feedback before activation
- Confirmation dialogs for status changes
- Impact warnings (in-progress documents, last workflow)
- Success message after status change

---

## UC-WF-012: Clone Existing Workflow

### Description
Allows administrators to create a new workflow by cloning an existing one, speeding up configuration for similar workflows.

### Actors
- **Primary**: System Administrator
- **Secondary**: Super Administrator

### Preconditions
- User has "Create Workflows" permission
- Source workflow exists in the system
- User is authenticated

### Postconditions
- **Success**: New workflow created with cloned configuration
- **Failure**: Clone operation fails, error message displayed

### Main Flow
1. User views workflow detail page of source workflow
2. System displays workflow actions menu
3. User clicks "Clone Workflow" button
4. System displays clone configuration dialog:
   - New workflow name field (prefilled with "{Original Name} (Copy)")
   - Workflow type (same as source, read-only)
   - Description field (copied from source)
   - Clone options checkboxes:
     - Clone stages ✓ (checked by default)
     - Clone routing rules ✓ (checked by default)
     - Clone notifications ✓ (checked by default)
     - Clone user assignments ☐ (unchecked by default)
     - Clone product assignments ☐ (unchecked by default)
5. User modifies new workflow name
6. User selects clone options (keeps defaults or adjusts)
7. User clicks "Clone" button
8. System validates new workflow name is unique
9. System creates new workflow with:
   - New unique workflow ID (e.g., "WF-003")
   - Specified name
   - Draft status (always starts as draft)
   - Copied description
10. If "Clone stages" selected:
    - System copies all stages with same configuration
    - System generates new stage IDs
    - System maintains stage sequence
11. If "Clone routing rules" selected:
    - System copies all routing rules
    - System updates rule IDs
    - System maintains rule precedence
12. If "Clone notifications" selected:
    - System copies notification configurations
    - System copies linked templates
    - System generates new notification IDs
13. If "Clone user assignments" selected:
    - System copies user assignments to stages
    - System validates users are still active
    - Removes inactive users with warning
14. If "Clone product assignments" selected:
    - System copies product assignments
    - System validates products are still active
    - Removes inactive products with warning
15. System saves cloned workflow
16. System displays success message
17. System navigates to new workflow detail page
18. User can review and modify cloned workflow
19. User activates workflow when ready (see UC-WF-011)

### Alternative Flows

**A1: Minimal Clone (Stages Only)**
- At step 6, user unchecks all options except "Clone stages"
- System creates workflow with stages only
- User must manually configure:
  - Routing rules
  - Notifications
  - User assignments
  - Product assignments
- Flow continues from step 7

**A2: Quick Activate After Clone**
- At step 18, user immediately activates cloned workflow
- User clicks "Edit" then changes status to "Active"
- System performs activation validation
- If validation passes, workflow is activated
- Flow continues from step 19

**A3: Clone from Inactive Workflow**
- At step 1, source workflow is inactive
- Clone operation proceeds normally
- Cloned workflow starts as Draft regardless
- User can review and modify before activation
- Flow continues normally

**A4: Modify Name Before Clone**
- At step 5, user enters custom name instead of default
- User enters: "Enhanced Purchase Workflow"
- System uses custom name for new workflow
- Flow continues from step 7

### Exception Flows

**E1: Duplicate Workflow Name**
- At step 8, system detects duplicate name
- System displays error: "Workflow name already exists"
- System suggests alternative name: "{Name} (Copy 2)"
- User enters unique name
- Flow continues from step 7

**E2: Some Users Inactive**
- At step 13, system detects inactive users in assignments
- System displays warning:
  - "{count} assigned users are inactive"
  - Lists inactive users
  - "These users will be excluded from cloned workflow"
  - Options: "Proceed" or "Cancel"
- User chooses to proceed or cancel
- If proceed, inactive users are excluded
- Flow continues from step 14

**E3: All Products Inactive**
- At step 14, all assigned products are inactive
- System displays warning:
  - "All assigned products are inactive"
  - "Cloned workflow will have no product assignments"
  - Options: "Proceed" or "Cancel"
- User chooses to proceed or cancel
- If proceed, workflow created without products
- Flow continues from step 15

**E4: Clone Operation Fails**
- At step 15, database error during clone
- System logs error details
- System displays error: "Failed to clone workflow"
- System rolls back any partial changes
- User can retry clone operation
- Flow returns to step 1

### Business Rules
- Cloned workflows always start with Draft status
- New workflow gets unique system-generated ID
- User assignments and product assignments optional in clone
- Cloned workflow name must be unique
- Source workflow remains unchanged

### Data Requirements
- Source workflow ID: Required for cloning
- New workflow name: Required, unique, max 100 characters
- Clone options: Boolean flags for what to copy
- All source workflow data: Read for cloning

### UI Requirements
- Clear "Clone" button in workflow actions
- Clone configuration dialog with options
- Prefilled fields with source data
- Visual checklist for clone options
- Name validation feedback
- Warning messages for inactive users/products
- Success message with link to new workflow
- Progress indicator during clone operation

---

## Summary

This use case document provides comprehensive coverage of the Workflow Management module functionality. The use cases cover:

- **Workflow Configuration**: Creating, editing, viewing, and deleting workflows
- **Search and Navigation**: Finding and filtering workflows efficiently
- **Stage Management**: Configuring multi-stage approval processes with SLA and role types
- **Routing Rules**: Creating conditional workflow paths based on business logic
- **Notifications**: Configuring automated stakeholder communications
- **User Assignment**: Assigning approvers and reviewers to workflow stages
- **Product Assignment**: Linking products to specific workflows
- **Workflow Lifecycle**: Activating, deactivating, and cloning workflows

Each use case follows a standardized format with clear preconditions, postconditions, main flows, alternative flows, exception flows, business rules, and UI requirements to guide implementation and testing.
