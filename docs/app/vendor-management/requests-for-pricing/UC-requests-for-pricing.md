# Requests for Pricing (Price Collection Campaigns) - Use Cases (UC)

## Document Information
- **Document Type**: Use Cases Document
- **Module**: Vendor Management > Requests for Pricing
- **Version**: 3.0.0
- **Last Updated**: 2026-01-15
- **Document Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2026-01-15 | Documentation Team | Synced with current code; Updated priority level to include 'normal' default; Added tags field to creation flow; Updated vendor status values |
| 2.0.0 | 2025-11-26 | System | Complete rewrite to match BR v2.0.0 and actual code; Removed fictional RFQ features (bidding, evaluation, awards, contracts, negotiations); Updated to reflect Price Collection Campaign functionality |
| 1.0 | 2024-01-15 | System | Initial use cases document |

**Note**: This document describes use cases for the Price Collection Campaign system as implemented in the actual code.

---

## 1. Introduction

### 1.1 Purpose
This document details the use cases for the Requests for Pricing module, describing how different actors interact with the system to create, manage, and track pricing collection campaigns. Each use case includes preconditions, main flows, alternate flows, exception handling, and postconditions.

### 1.2 Scope
This document covers all user interactions with the Requests for Pricing module as defined in BR-requests-for-pricing.md, including campaign creation, vendor selection and invitation, progress tracking, campaign settings management, and campaign actions.

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
- **Role**: Campaign administrator and approver
- **Responsibilities**: Create campaigns, manage settings, approve submissions, modify active campaigns
- **Permissions**: Full access to campaign management, delete authority

**Procurement Staff**
- **Role**: Campaign creator and coordinator
- **Responsibilities**: Create campaigns, invite vendors, track submissions, send reminders
- **Permissions**: Create/edit draft campaigns, view all campaigns, invite vendors

### 2.2 Secondary Actors

**System**
- Automated processes for campaign status updates, reminder scheduling, progress calculation

**Pricelist Templates Module**
- Source of pricing templates for campaigns

**Vendor Directory Module**
- Source of vendor data for invitation

---

## 3. Use Cases Overview

### 3.1 Use Case List

| ID | Use Case Name | Primary Actor | Priority |
|----|---------------|---------------|----------|
| UC-CAM-001 | View Campaign List | Procurement Staff | Critical |
| UC-CAM-002 | Create Campaign | Procurement Staff | Critical |
| UC-CAM-003 | View Campaign Detail | Procurement Staff | Critical |
| UC-CAM-004 | Edit Draft Campaign | Procurement Staff | High |
| UC-CAM-005 | Duplicate Campaign | Procurement Staff | Medium |
| UC-CAM-006 | Send Vendor Reminder | Procurement Staff | High |
| UC-CAM-007 | Mark Campaign as Expired | Procurement Manager | Medium |
| UC-CAM-008 | Delete Campaign | Procurement Manager | Medium |
| UC-CAM-009 | Export Campaign Data | Procurement Staff | Medium |
| UC-CAM-010 | Filter and Search Campaigns | Procurement Staff | High |

---

## 4. Detailed Use Cases

### UC-CAM-001: View Campaign List

**Primary Actor**: Procurement Staff
**Priority**: Critical
**Frequency**: Daily (10-50 views/day)
**Related FR**: FR-RFP-001

#### Preconditions
- User is authenticated
- User has permission to view campaigns
- System is operational

#### Main Flow
1. User navigates to Vendor Management > Requests for Pricing
2. System displays Campaign List page
3. System loads all campaigns from data source
4. System displays campaigns in default table view
5. For each campaign, system displays:
   - Campaign name (clickable link)
   - Status badge (draft/active/paused/completed/cancelled)
   - Description (truncated)
   - Scheduled start and end dates
   - Created date
   - Updated date
   - Actions dropdown menu
6. System displays campaign count
7. User reviews campaign list

#### Postconditions
- **Success**: Campaign list displayed with all campaigns
- **Success**: User can interact with campaigns via actions menu

#### Alternate Flows

**AF-001: Switch to Card View**
- At step 4, user clicks card view toggle:
  - System switches to 3-column card grid layout
  - Each card displays campaign summary
  - Cards show progress statistics
  - Continue viewing campaigns

**AF-002: Empty List**
- At step 3, if no campaigns exist:
  - System displays empty state message
  - System shows "Create New Campaign" button
  - User can create first campaign

---

### UC-CAM-002: Create Campaign

**Primary Actor**: Procurement Staff
**Priority**: Critical
**Frequency**: Weekly (3-10 campaigns/week)
**Related FR**: FR-RFP-002

#### Preconditions
- User is authenticated with Procurement Staff or Manager role
- User has permission to create campaigns
- At least one pricelist template exists
- At least one vendor exists in vendor directory

#### Main Flow
1. User clicks "Create New Campaign" button from list page
2. System navigates to /vendor-management/campaigns/new
3. System displays 4-step creation wizard with step indicator

**Step 1: Basic Information**
4. System displays basic information form
5. User enters:
   - Campaign name (required)
   - Campaign description (required)
   - Priority level (low/normal/medium/high/urgent - default: normal)
   - Tags (optional)
   - Scheduled start date (required)
   - Scheduled end date (optional)
6. User clicks "Next"
7. System validates all required fields
8. System saves step 1 data and proceeds

**Step 2: Template Selection**
9. System displays available pricelist templates in grid
10. For each template, system displays:
    - Template name
    - Validity period
    - Default currency
    - Description
11. User selects one template by clicking on it
12. System highlights selected template
13. User clicks "Next"
14. System validates template selection
15. System saves step 2 data and proceeds

**Step 3: Vendor Selection**
16. System displays vendor selection interface
17. System shows vendor list with:
    - Vendor name
    - Email
    - Status (active/inactive/pending)
    - Response rate percentage
18. User searches vendors by name/email
19. User filters vendors by status
20. User selects vendors by clicking checkboxes
21. System updates selected vendor count
22. User clicks "Next"
23. System validates at least one vendor selected
24. System saves step 3 data and proceeds

**Step 4: Review & Launch**
25. System displays campaign summary:
    - Basic information summary
    - Selected template details
    - List of selected vendors
    - Campaign settings preview
26. User reviews all selections
27. User clicks "Launch Campaign"
28. System creates campaign with status "active"
29. System sends invitations to all selected vendors
30. System navigates to campaign detail page
31. System displays success message

#### Postconditions
- **Success**: Campaign created with status "active"
- **Success**: Vendor invitations sent
- **Success**: User redirected to campaign detail page
- **Success**: Campaign appears in campaign list

#### Alternate Flows

**AF-001: Create from Template Link**
- User clicks "Create Request for Pricing" from template detail page:
  - System navigates to /vendor-management/campaigns/new?templateId={id}
  - System pre-selects template in Step 2
  - User completes remaining steps
  - Continue to step 9

**AF-002: Save as Draft**
- At step 27, user clicks "Save Draft" instead of "Launch":
  - System creates campaign with status "draft"
  - System does NOT send invitations
  - System navigates to campaign detail page
  - User can edit and launch later

**AF-003: Cancel Creation**
- At any step, user clicks "Cancel" or back button:
  - System displays confirmation dialog
  - User confirms cancellation
  - System navigates to campaign list
  - No campaign created

**AF-004: Bulk Select Vendors**
- At step 20, user clicks "Select All":
  - System selects all currently filtered vendors
  - System updates selection count
  - Continue to step 22

**AF-005: Clear Vendor Selection**
- At step 20, user clicks "Clear Selection":
  - System deselects all vendors
  - System resets selection count to 0
  - User must select vendors again

#### Exception Flows

**EF-001: Missing Required Fields in Step 1**
- At step 7, if required fields are empty:
  - System highlights missing fields in red
  - System displays inline error messages
  - User must fill required fields
  - Continue to step 5

**EF-002: No Template Selected**
- At step 14, if no template selected:
  - System displays error: "Please select a template"
  - User must select a template
  - Continue to step 11

**EF-003: No Vendors Selected**
- At step 23, if no vendors selected:
  - System displays error: "At least one vendor must be selected"
  - User must select at least one vendor
  - Continue to step 18

**EF-004: End Date Before Start Date**
- At step 7, if end date is before start date:
  - System displays error: "End date must be after start date"
  - User corrects the dates
  - Continue to step 5

---

### UC-CAM-003: View Campaign Detail

**Primary Actor**: Procurement Staff
**Priority**: Critical
**Frequency**: Daily (20-100 views/day)
**Related FR**: FR-RFP-005

#### Preconditions
- User is authenticated
- Campaign exists with valid ID
- User has permission to view campaigns

#### Main Flow
1. User clicks on campaign name from list page (or navigates via URL)
2. System navigates to /vendor-management/campaigns/[id]
3. System loads campaign data
4. System displays campaign header:
   - Back button to list
   - Campaign name
   - Status badge
   - Priority badge
   - Edit button (if draft)
   - Duplicate button
5. System displays tab navigation: Overview, Vendors, Settings
6. System displays Overview tab by default

**Overview Tab**
7. System displays Campaign Details card:
   - Associated template name
   - Scheduled start date
   - Scheduled end date
   - Creator name
   - Created date
   - Updated date
8. System displays Performance Summary card:
   - Response rate percentage
   - Average response time (hours)
   - Completion rate percentage
   - Total submissions count

#### Postconditions
- **Success**: Campaign detail displayed
- **Success**: User can navigate between tabs
- **Success**: User can perform available actions

#### Alternate Flows

**AF-001: View Vendors Tab**
- User clicks "Vendors" tab:
  - System displays vendor table with columns:
    - Vendor name
    - Status (pending/in_progress/completed)
    - Progress bar (percentage)
    - Last activity timestamp
    - Actions (Send Reminder button)
  - User can send reminders to pending/in_progress vendors

**AF-002: View Settings Tab**
- User clicks "Settings" tab:
  - System displays campaign settings in two-column layout:
    - Portal access duration (days)
    - Allowed submission methods
    - Require approval (Yes/No)
    - Auto reminders (Enabled/Disabled)
    - Email template name
    - Custom instructions
    - Priority level
  - System displays Reminder Schedule section (if enabled):
    - Reminder intervals (e.g., 7, 3, 1 days before deadline)
    - Escalation settings (if enabled)

**AF-003: Campaign Not Found**
- At step 3, if campaign doesn't exist:
  - System displays "Campaign not found" error
  - System provides link back to campaign list
  - User navigates back to list

---

### UC-CAM-004: Edit Draft Campaign

**Primary Actor**: Procurement Staff
**Priority**: High
**Frequency**: As needed
**Related FR**: FR-RFP-008

#### Preconditions
- User is authenticated
- Campaign exists with status "draft"
- User has permission to edit campaigns

#### Main Flow
1. User navigates to campaign detail page
2. User clicks "Edit" button
3. System navigates to /vendor-management/campaigns/[id]/edit
4. System loads campaign data into edit form
5. System displays edit interface similar to creation wizard
6. User modifies desired fields:
   - Campaign name
   - Description
   - Priority
   - Dates
   - Template selection
   - Vendor selection
   - Settings
7. User clicks "Save Changes"
8. System validates all changes
9. System saves updated campaign
10. System navigates to campaign detail page
11. System displays success message

#### Postconditions
- **Success**: Campaign updated with new values
- **Success**: Updated timestamp reflects change
- **Success**: User redirected to detail page

#### Alternate Flows

**AF-001: Launch After Edit**
- At step 7, user clicks "Save and Launch":
  - System saves changes
  - System changes status to "active"
  - System sends invitations to vendors
  - Continue to step 10

**AF-002: Cancel Edit**
- At any step, user clicks "Cancel":
  - System displays confirmation dialog
  - User confirms cancellation
  - System discards unsaved changes
  - System navigates to campaign detail page

#### Exception Flows

**EF-001: Campaign No Longer Draft**
- At step 4, if campaign status is no longer "draft":
  - System displays error: "Only draft campaigns can be edited"
  - System navigates to campaign detail page
  - Edit not allowed

---

### UC-CAM-005: Duplicate Campaign

**Primary Actor**: Procurement Staff
**Priority**: Medium
**Frequency**: Weekly (2-5 times/week)
**Related FR**: FR-RFP-008

#### Preconditions
- User is authenticated
- Source campaign exists
- User has permission to create campaigns

#### Main Flow
1. User navigates to campaign detail or list page
2. User clicks "Duplicate" action (from dropdown or button)
3. System creates copy of campaign with:
   - Original name + " (Copy)" suffix
   - Status reset to "draft"
   - Progress metrics reset to zero
   - All settings copied from original
   - Vendor selections copied
   - Template selection copied
4. System navigates to new campaign detail page
5. System displays success message: "Campaign duplicated successfully"

#### Postconditions
- **Success**: New campaign created with copied settings
- **Success**: New campaign has status "draft"
- **Success**: Original campaign unchanged

#### Alternate Flows

**AF-001: Edit After Duplicate**
- After step 5, user clicks "Edit":
  - User modifies duplicated campaign
  - User can rename, change dates, modify vendors
  - Continue with edit flow (UC-CAM-004)

---

### UC-CAM-006: Send Vendor Reminder

**Primary Actor**: Procurement Staff
**Priority**: High
**Frequency**: Daily (5-20 reminders/day)
**Related FR**: FR-RFP-008

#### Preconditions
- User is authenticated
- Campaign exists with status "active"
- Vendor has status "pending" or "in_progress"
- User has permission to send reminders

#### Main Flow
1. User navigates to campaign detail page
2. User clicks "Vendors" tab
3. System displays vendor list with statuses
4. User identifies vendor with pending/in_progress status
5. User clicks "Send Reminder" button for that vendor
6. System sends reminder notification to vendor
7. System increments vendor's reminder count
8. System updates vendor's last reminder date
9. System displays success message: "Reminder sent successfully"
10. System refreshes vendor list

#### Postconditions
- **Success**: Reminder notification sent to vendor
- **Success**: Vendor's reminder count incremented
- **Success**: Last reminder timestamp updated

#### Alternate Flows

**AF-001: Vendor Already Completed**
- At step 5, if vendor status is "completed":
  - Send Reminder button is disabled
  - User cannot send reminder
  - No action available

#### Exception Flows

**EF-001: Reminder Send Failed**
- At step 6, if notification fails:
  - System displays error: "Failed to send reminder"
  - System logs error details
  - User can retry

---

### UC-CAM-007: Mark Campaign as Expired

**Primary Actor**: Procurement Manager
**Priority**: Medium
**Frequency**: Weekly (1-5 times/week)
**Related FR**: FR-RFP-008

#### Preconditions
- User is authenticated as Procurement Manager
- Campaign exists
- Campaign has passed its scheduled end date

#### Main Flow
1. User navigates to campaign list or detail page
2. User opens actions dropdown menu
3. User clicks "Mark as Expired"
4. System displays confirmation dialog
5. User confirms action
6. System updates campaign status
7. System displays success toast: "Campaign marked as expired"
8. System refreshes campaign display

#### Postconditions
- **Success**: Campaign status updated
- **Success**: Campaign appears with appropriate status badge

---

### UC-CAM-008: Delete Campaign

**Primary Actor**: Procurement Manager
**Priority**: Medium
**Frequency**: Rare (1-3 times/month)
**Related FR**: FR-RFP-008

#### Preconditions
- User is authenticated as Procurement Manager
- Campaign exists
- User has delete permission

#### Main Flow
1. User navigates to campaign list or detail page
2. User opens actions dropdown menu
3. User clicks "Delete"
4. System displays confirmation dialog:
   - "Are you sure you want to delete this campaign?"
   - Campaign name displayed
   - Warning about permanent deletion
5. User clicks "Delete" to confirm
6. System removes campaign from database
7. System displays success toast: "Campaign deleted successfully"
8. System navigates to campaign list (if from detail page)
9. System removes campaign from list display

#### Postconditions
- **Success**: Campaign permanently deleted
- **Success**: Campaign no longer appears in list

#### Alternate Flows

**AF-001: Cancel Deletion**
- At step 5, user clicks "Cancel":
  - System closes confirmation dialog
  - No changes made
  - Campaign remains unchanged

---

### UC-CAM-009: Export Campaign Data

**Primary Actor**: Procurement Staff
**Priority**: Medium
**Frequency**: Weekly (5-10 exports/week)
**Related FR**: FR-RFP-008

#### Preconditions
- User is authenticated
- Campaign exists
- User has permission to export data

#### Main Flow
1. User navigates to campaign list or detail page
2. User clicks "Export" button/action
3. System generates export file
4. System triggers file download
5. System displays success message

#### Postconditions
- **Success**: Export file downloaded to user's device
- **Success**: File contains campaign data in selected format

#### Alternate Flows

**AF-001: Export from List Page**
- At step 2, user clicks "Export" from list header:
  - System exports all visible/filtered campaigns
  - System generates combined export file

**AF-002: Export Single Campaign**
- At step 2, user clicks "Export" from campaign detail or row action:
  - System exports single campaign data
  - File contains all campaign details, vendors, settings

---

### UC-CAM-010: Filter and Search Campaigns

**Primary Actor**: Procurement Staff
**Priority**: High
**Frequency**: Daily (30-100 times/day)
**Related FR**: FR-RFP-001

#### Preconditions
- User is authenticated
- User is on campaign list page

#### Main Flow

**Search by Text**
1. User types search term in search input
2. System filters campaigns in real-time
3. System matches search term against:
   - Campaign name
   - Campaign description
4. System displays matching campaigns
5. System updates result count

**Filter by Status**
6. User clicks status filter dropdown
7. System displays status options:
   - All (default)
   - Active
   - Draft
   - Paused
   - Completed
   - Cancelled
8. User selects a status
9. System filters campaigns by selected status
10. System displays filtered results
11. System updates result count

#### Postconditions
- **Success**: Campaign list filtered according to criteria
- **Success**: Result count reflects filtered results

#### Alternate Flows

**AF-001: Clear Search**
- User clears search input:
  - System removes search filter
  - System displays all campaigns (respecting status filter)

**AF-002: Clear Status Filter**
- User selects "All" status:
  - System removes status filter
  - System displays all campaigns (respecting search filter)

**AF-003: No Results Found**
- If no campaigns match filters:
  - System displays "No campaigns found" message
  - System suggests clearing filters
  - User can clear filters to see all campaigns

---

## 5. Use Case Relationships

### 5.1 Include Relationships
- UC-CAM-003 includes display of tabs and campaign data
- UC-CAM-006 requires UC-CAM-003 (must view detail to send reminder)

### 5.2 Extend Relationships
- UC-CAM-004 extends UC-CAM-003 (Edit extends View Detail for draft campaigns)
- UC-CAM-005 extends UC-CAM-003 (Duplicate extends View Detail)

### 5.3 Dependency Relationships
- UC-CAM-002 depends on templates from Pricelist Templates module
- UC-CAM-002 depends on vendors from Vendor Directory module
- UC-CAM-004 depends on UC-CAM-002 (campaign must be created first)
- UC-CAM-006 depends on UC-CAM-002 (active campaign required)

---

## 6. Non-Functional Requirements Impact

### 6.1 Performance Requirements
- Campaign list should load in <2 seconds
- Search should filter results in <500ms
- Campaign creation should complete in <3 seconds

### 6.2 Usability Requirements
- Wizard navigation should have clear step indicators
- Form validation should be real-time with inline errors
- Actions should have confirmation dialogs for destructive operations

### 6.3 Security Requirements
- All actions require authentication
- Role-based access control enforced
- Delete operations require manager role

---

## 7. Related Documents
- [BR-requests-for-pricing.md](./BR-requests-for-pricing.md) - Business Requirements v2.0.0
- [DD-requests-for-pricing.md](./DD-requests-for-pricing.md) - Data Definition
- [FD-requests-for-pricing.md](./FD-requests-for-pricing.md) - Flow Diagrams
- [TS-requests-for-pricing.md](./TS-requests-for-pricing.md) - Technical Specification
- [VAL-requests-for-pricing.md](./VAL-requests-for-pricing.md) - Validations

---

**End of Use Cases Document**
