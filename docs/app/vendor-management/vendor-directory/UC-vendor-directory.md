# Vendor Directory - Use Cases (UC)

## Document Information
- **Document Type**: Use Cases Document
- **Module**: Vendor Management > Vendor Directory
- **Version**: 2.2.0
- **Last Updated**: 2025-11-25
- **Document Status**: Updated

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.2.0 | 2025-11-25 | System | Added certification management use cases (UC-VD-031 to UC-VD-034); Added address management with Asian international format (UC-VD-035 to UC-VD-038); Updated address schema to 15 countries |
| 2.1.0 | 2025-11-25 | System | Added multi-address and multi-contact management with primary designation |
| 2.0.0 | 2025-11-25 | System | Updated to match actual code implementation |
| 1.0 | 2024-01-15 | System | Initial creation |

---

## 1. Introduction

### 1.1 Purpose
This document details the use cases for the Vendor Directory module, describing how different actors interact with the system to accomplish their goals. Each use case includes preconditions, main flows, alternate flows, exception handling, and postconditions.

### 1.2 Scope
This document covers all user interactions with the Vendor Directory module as defined in BR-vendor-directory.md, including vendor profile management, contact management, document management, approval workflows, performance tracking, and integrations.

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

**Vendor Manager**
- **Role**: Primary administrator of vendor data
- **Responsibilities**: Create vendors, manage profiles, approve changes, configure settings
- **Permissions**: Full access to all vendor management functions
- **Skills**: Advanced understanding of procurement processes

**Procurement Staff**
- **Role**: End users who use vendor data for purchasing
- **Responsibilities**: Search vendors, view profiles, create purchase orders
- **Permissions**: Read access to vendor directory, limited edit rights
- **Skills**: Basic procurement knowledge

**Finance Manager**
- **Role**: Financial controller for vendor relationships
- **Responsibilities**: Manage payment terms, banking details, credit limits
- **Permissions**: View/edit financial data, approve financial changes
- **Skills**: Financial management expertise

**Compliance Officer**
- **Role**: Ensures regulatory compliance
- **Responsibilities**: Verify documents, approve certifications, monitor compliance
- **Permissions**: View/approve documents, access compliance reports
- **Skills**: Regulatory and compliance knowledge

**Department Manager**
- **Role**: Manages vendor relationships for specific department
- **Responsibilities**: Request vendors, view assigned vendors, monitor performance
- **Permissions**: View vendors assigned to department, request new vendors
- **Skills**: Basic vendor relationship knowledge

### 2.2 Secondary Actors

**System Administrator**
- Configures workflows, manages permissions, performs system maintenance

**External Systems**
- ERP systems, credit check services, email/SMS services

---

## 3. Use Cases Overview

### 3.1 Use Case List

| ID | Use Case Name | Primary Actor | Priority |
|----|---------------|---------------|----------|
| UC-VD-001 | Create New Vendor Profile | Vendor Manager | Critical |
| UC-VD-002 | Edit Vendor Profile | Vendor Manager | Critical |
| UC-VD-003 | Archive/Deactivate Vendor | Vendor Manager | High |
| UC-VD-004 | Restore Archived Vendor | Vendor Manager | Medium |
| UC-VD-005 | Bulk Import Vendors | Vendor Manager | High |
| UC-VD-006 | Export Vendor List | Vendor Manager, Procurement Staff | Medium |
| UC-VD-007 | Search Vendors | All Users | Critical |
| UC-VD-008 | Filter Vendors | All Users | High |
| UC-VD-009 | Categorize Vendor | Vendor Manager | High |
| UC-VD-010 | Add Vendor Contact | Vendor Manager | Critical |
| UC-VD-011 | Edit Vendor Contact | Vendor Manager | Critical |
| UC-VD-012 | Manage Contact Roles | Vendor Manager | Medium |
| UC-VD-013 | Upload Vendor Document | Vendor Manager, Compliance Officer | High |
| UC-VD-014 | Update Document Version | Vendor Manager | High |
| UC-VD-015 | Monitor Document Expiration | Compliance Officer | High |
| UC-VD-016 | Submit Vendor for Approval | Vendor Manager | Critical |
| UC-VD-017 | Review and Approve Vendor | Compliance Officer, Finance Manager | Critical |
| UC-VD-018 | Reject Vendor Application | Approvers | High |
| UC-VD-019 | Track Vendor Performance | System | High |
| UC-VD-020 | View Vendor Scorecard | Vendor Manager, Procurement Staff | High |
| UC-VD-021 | Change Vendor Status | Vendor Manager | High |
| UC-VD-022 | Block Vendor | Vendor Manager | Critical |
| UC-VD-023 | Blacklist Vendor | Vendor Manager | Critical |
| UC-VD-024 | Assign Vendor to Locations | Vendor Manager | Medium |
| UC-VD-025 | Manage Payment Terms | Finance Manager | High |
| UC-VD-026 | Set Credit Limit | Finance Manager | High |
| UC-VD-027 | Configure Banking Details | Finance Manager | High |
| UC-VD-028 | View Vendor History | All Users | Medium |
| UC-VD-029 | Generate Vendor Report | Vendor Manager | Medium |
| UC-VD-030 | Integrate with Purchase Order | Procurement Staff | Critical |
| UC-VD-031 | Add Vendor Certification | Vendor Manager, Compliance Officer | High |
| UC-VD-032 | Edit Vendor Certification | Vendor Manager, Compliance Officer | High |
| UC-VD-033 | Delete Vendor Certification | Vendor Manager | Medium |
| UC-VD-034 | View Certification Status Dashboard | Compliance Officer, Vendor Manager | High |
| UC-VD-035 | Add Vendor Address (Asian Format) | Vendor Manager | High |
| UC-VD-036 | Edit Vendor Address | Vendor Manager | High |
| UC-VD-037 | Delete Vendor Address | Vendor Manager | Medium |
| UC-VD-038 | Set Primary Address | Vendor Manager | High |

---

## 4. Detailed Use Cases

### UC-VD-001: Create New Vendor Profile

**Primary Actor**: Vendor Manager
**Priority**: Critical
**Frequency**: Daily (2-10 vendors/day)
**Related FR**: FR-VD-001

#### Preconditions
- User is authenticated with Vendor Manager role
- User has permission to create vendors
- System is operational

#### Main Flow
1. User navigates to Vendor Directory
2. User clicks "Create New Vendor" button
3. System displays vendor creation form with tabs:
   - Basic Information
   - Addresses
   - Contacts
   - Documents
   - Financial
4. User enters required basic information:
   - Vendor Code (auto-generated or manual)
   - Company Name
   - Legal Name
   - Vendor Type
   - Business Type
   - Tax Registration Number
5. User adds primary address:
   - Address Type: Billing/Shipping/Remittance
   - Full address details
   - Mark as primary
6. User adds primary contact:
   - Name, Title, Email, Phone
   - Role: Primary
   - Communication preferences
7. User optionally adds:
   - Additional addresses
   - Additional contacts
   - Documents (contracts, certifications)
   - Payment terms
   - Banking details
8. User clicks "Save as Draft" or "Submit for Approval"
9. System validates all required fields
10. System checks for duplicate vendor code
11. System checks for duplicate company name
12. System saves vendor with status "Draft" or "Pending Approval"
13. System generates vendor ID
14. System displays success message with vendor ID
15. System sends notification if submitted for approval

#### Postconditions
- **Success**: Vendor created in database with Draft or Pending status
- **Success**: Vendor ID assigned and displayed
- **Success**: Audit log entry created
- **Success**: Notification sent if submitted for approval

#### Alternate Flows

**AF-001: Auto-generate Vendor Code**
- At step 4, if user doesn't enter vendor code:
  - System auto-generates code based on naming pattern (e.g., VEN-2401-0001)
  - System displays generated code
  - User can accept or modify
  - Continue to step 5

**AF-002: Add Multiple Addresses**
- After step 6, user clicks "Add Another Address"
  - System displays address form
  - User enters address details
  - User can add up to 10 addresses
  - One must be marked as primary
  - Continue to step 7

**AF-003: Add Multiple Contacts**
- After step 7, user clicks "Add Another Contact"
  - System displays contact form
  - User enters contact details
  - User can add unlimited contacts
  - At least one must be Primary role
  - Continue to step 8

**AF-004: Upload Documents During Creation**
- At step 7, user uploads documents:
  - User drags and drops files or clicks upload
  - System validates file type and size
  - System displays upload progress
  - User enters document metadata (type, number, expiry)
  - System associates documents with vendor
  - Continue to step 8

**AF-005: Import from Template**
- At step 3, user clicks "Import from Template"
  - System displays template selection
  - User selects similar vendor as template
  - System pre-fills form with template data
  - User modifies as needed
  - Continue to step 5

#### Exception Flows

**EF-001: Duplicate Vendor Code**
- At step 10, if vendor code already exists:
  - System highlights vendor code field in red
  - System displays error: "Vendor code already exists. Please use a unique code."
  - System suggests alternative codes
  - User corrects vendor code
  - Continue to step 10

**EF-002: Duplicate Company Name**
- At step 11, if company name exists for active vendor:
  - System displays warning dialog
  - System shows existing vendor details
  - User options: "Continue Anyway" or "View Existing Vendor"
  - If "Continue Anyway": System creates with duplicate name
  - If "View Existing": System navigates to existing vendor profile
  - End use case

**EF-003: Missing Required Fields**
- At step 9, if required fields are missing:
  - System highlights missing fields in red
  - System displays validation summary at top
  - System scrolls to first missing field
  - User completes missing fields
  - User clicks Save again
  - Continue to step 9

**EF-004: Invalid Tax Registration Number**
- At step 9, if tax number format is invalid:
  - System highlights tax number field
  - System displays error: "Invalid tax registration number format for [country]"
  - System shows expected format
  - User corrects tax number
  - Continue to step 9

**EF-005: Invalid Email Format**
- At step 6, if contact email is invalid:
  - System highlights email field
  - System displays error: "Invalid email format"
  - User corrects email
  - Continue to step 6

**EF-006: System Error During Save**
- At step 12, if system error occurs:
  - System displays error message: "Unable to save vendor. Please try again."
  - System logs error details
  - System preserves entered data
  - User can retry save
  - If persistent, contact system administrator

#### Business Rules Applied
- BR-VD-001: Vendor code must be unique
- BR-VD-002: At least one primary contact required
- BR-VD-009: Default currency must be specified

#### UI Requirements
- Form validation with real-time feedback
- Auto-save draft every 2 minutes
- Progress indicator for multi-tab form
- Duplicate detection with visual warnings
- Mobile-responsive layout

---

### UC-VD-002: Edit Vendor Profile

**Primary Actor**: Vendor Manager
**Priority**: Critical
**Frequency**: Daily (10-30 edits/day)
**Related FR**: FR-VD-001

#### Preconditions
- User is authenticated with Vendor Manager role
- User has permission to edit vendors
- Vendor exists in system
- User has access to the vendor (based on location/department permissions)

#### Main Flow
1. User searches for vendor (see UC-VD-007)
2. User opens vendor profile
3. System displays vendor details in tabs:
   - Basic Information
   - Addresses (with count badge)
   - Contacts (with count badge)
   - Documents (with count badge)
   - Financial
   - Performance
   - Audit History
4. User navigates to tab with information to edit
5. User clicks "Edit" button
6. System enables edit mode for selected section
7. User modifies field(s)
8. System performs real-time validation
9. User clicks "Save Changes"
10. System validates changes
11. System checks if changes require approval
12. If approval required:
    - System saves as "Pending Approval"
    - System creates approval request
    - System sends notification to approvers
13. If no approval required:
    - System saves changes immediately
    - System updates "Last Modified" timestamp
14. System displays success message
15. System refreshes vendor profile display
16. System logs change in audit history

#### Postconditions
- **Success**: Vendor information updated in database
- **Success**: Audit trail entry created with before/after values
- **Success**: Notification sent if approval required
- **Success**: Version history incremented

#### Alternate Flows

**AF-001: Edit Multiple Fields**
- At step 7, user modifies multiple fields:
  - System tracks all changed fields
  - System validates each field independently
  - System shows summary of changes before save
  - User confirms changes
  - Continue to step 9

**AF-002: Cancel Edit**
- At any point before step 9:
  - User clicks "Cancel"
  - System prompts: "Discard changes?"
  - If "Yes": System reverts all changes
  - If "No": Continue editing
  - End use case

**AF-003: Edit Address**
- At step 5, user edits existing address:
  - User clicks "Edit" on address card
  - System displays address edit form
  - User modifies address fields
  - User clicks "Save"
  - System validates address format
  - System updates address
  - Continue to step 14

**AF-004: Edit Contact**
- At step 5, user edits existing contact:
  - User clicks "Edit" on contact card
  - System displays contact edit form
  - User modifies contact fields
  - System validates email/phone formats
  - User clicks "Save"
  - System updates contact
  - Continue to step 14

**AF-005: Version Comparison**
- At step 3, user clicks "View History"
  - System displays version history list
  - User selects two versions to compare
  - System displays side-by-side comparison
  - User can revert to previous version
  - If revert: System creates new version with old values
  - Continue to step 14

#### Exception Flows

**EF-001: Concurrent Edit Conflict**
- At step 9, if another user modified same vendor:
  - System displays conflict warning
  - System shows other user's changes
  - User options: "Override" or "Merge" or "Cancel"
  - If "Override": User's changes saved, other changes lost
  - If "Merge": System displays merge interface
  - If "Cancel": End use case

**EF-002: Approval Rejection**
- After step 12, if change is rejected:
  - System sends rejection notification
  - System displays rejection reason
  - User can modify and resubmit
  - Or user can cancel changes
  - End use case

**EF-003: Financial Change Requires Approval**
- At step 11, if financial fields changed:
  - System identifies financial changes:
    - Payment terms
    - Credit limit
    - Banking details
    - Tax settings
  - System routes to Finance Manager approval
  - System preserves original values
  - Continue to step 12

**EF-004: Validation Error**
- At step 10, if validation fails:
  - System highlights invalid fields
  - System displays specific error messages
  - User corrects errors
  - User clicks Save again
  - Continue to step 10

**EF-005: Permission Denied**
- At step 5, if user lacks permission for specific field:
  - System displays field as read-only
  - System shows tooltip: "Contact [role] to modify this field"
  - User cannot edit restricted field
  - User can edit other permitted fields
  - Continue to step 7

**EF-006: Vendor Has Active Transactions**
- At step 11, if vendor has active POs and critical fields changed:
  - System displays warning: "This vendor has [X] active purchase orders. Changes may affect existing orders."
  - System lists impacted POs
  - User options: "Continue" or "Cancel"
  - If "Continue": System proceeds with change
  - If "Cancel": End use case

#### Business Rules Applied
- BR-VD-003: Major changes require approval
- Changes to payment terms, banking details, or credit limit require Finance Manager approval
- Changes to vendor status require workflow approval
- Changes affecting active POs display impact warning

#### UI Requirements
- Inline editing for quick changes
- Visual indication of changed fields (highlight)
- Auto-save with version control
- Concurrent edit detection
- Mobile-responsive edit forms

---

### UC-VD-003: Archive/Deactivate Vendor

**Primary Actor**: Vendor Manager
**Priority**: High
**Frequency**: Weekly (1-5 vendors/week)
**Related FR**: FR-VD-001

#### Preconditions
- User is authenticated with Vendor Manager role
- User has permission to archive vendors
- Vendor exists and is currently active
- User has access to the vendor

#### Main Flow
1. User searches for vendor to archive
2. User opens vendor profile
3. System displays vendor details and current status
4. User clicks "Archive Vendor" button
5. System checks for active transactions:
   - Active purchase orders
   - Pending invoices
   - Outstanding payments
6. System displays pre-archive checklist:
   - [ ] No active purchase orders (0 open POs)
   - [ ] No pending invoices (0 unpaid invoices)
   - [ ] No outstanding balance ($0.00 balance)
   - [ ] All documents archived
7. If blockers exist:
   - System highlights blockers in red
   - System displays warning message
   - User options: "Force Archive" or "Cancel"
8. User enters archive reason (required):
   - Business closure
   - Poor performance
   - Service no longer needed
   - Merged with another vendor
   - Other (specify)
9. User enters optional notes
10. User clicks "Confirm Archive"
11. System changes vendor status to "Inactive"
12. System sets deleted_at timestamp (soft delete)
13. System archives all associated records
14. System prevents vendor from appearing in active searches
15. System logs archive action in audit trail
16. System sends notification to stakeholders
17. System displays success message
18. System navigates to vendor list

#### Postconditions
- **Success**: Vendor status changed to "Inactive"
- **Success**: Vendor removed from active vendor lists
- **Success**: Archive reason and notes recorded
- **Success**: Audit trail entry created
- **Success**: Stakeholders notified

#### Alternate Flows

**AF-001: Force Archive with Active Transactions**
- At step 7, if user selects "Force Archive":
  - System displays confirmation dialog
  - System lists all active transactions
  - User must acknowledge impact
  - System requires management approval
  - If approved: Continue to step 8
  - If denied: End use case

**AF-002: Transfer to Replacement Vendor**
- At step 8, user selects "Merged with another vendor":
  - System prompts for replacement vendor
  - User searches and selects replacement
  - System displays data transfer options:
    - [ ] Transfer price lists
    - [ ] Transfer pending POs
    - [ ] Transfer documents
  - User selects transfer options
  - System performs data transfer
  - Continue to step 10

**AF-003: Schedule Archive Date**
- At step 9, user clicks "Schedule Archive":
  - System displays date picker
  - User selects future archive date
  - System saves as "Scheduled for Archive"
  - System creates scheduled job
  - System sends reminder before archive date
  - On archive date, system auto-archives
  - End use case

#### Exception Flows

**EF-001: Active POs Prevent Archive**
- At step 6, if active POs exist:
  - System displays error: "Cannot archive vendor with [X] active purchase orders"
  - System lists active POs with details
  - User options:
    - "Cancel POs and Archive": Requires approval
    - "Complete POs First": User must close POs
    - "Schedule Archive After PO Completion"
  - User selects option
  - If cancel POs: Requires workflow approval
  - If complete first: End use case
  - If schedule: Go to AF-003

**EF-002: Pending Invoices Prevent Archive**
- At step 6, if unpaid invoices exist:
  - System displays error: "Cannot archive vendor with [X] pending invoices"
  - System lists unpaid invoices with amounts
  - User options:
    - "Pay Invoices and Archive"
    - "Transfer to Finance for Resolution"
    - "Force Archive": Requires executive approval
  - System routes based on selection

**EF-003: Outstanding Balance Prevent Archive**
- At step 6, if outstanding balance exists:
  - System displays error: "Vendor has outstanding balance: $[amount]"
  - System shows balance details
  - User must resolve balance before archive
  - User options: "Resolve Balance" or "Cancel"
  - End use case

**EF-004: Permission Denied**
- At step 4, if user lacks archive permission:
  - System displays error: "You do not have permission to archive vendors"
  - System suggests contacting Vendor Manager
  - End use case

**EF-005: System Error During Archive**
- At step 11, if system error occurs:
  - System rolls back archive operation
  - System displays error message
  - System logs error details
  - User can retry or contact support
  - End use case

#### Business Rules Applied
- Vendors with active POs cannot be archived without approval
- Vendors with pending invoices require resolution before archive
- Archive action requires reason
- Archived vendors retained for 7 years (data retention policy)
- Soft delete used (no physical deletion)

#### UI Requirements
- Clear pre-archive checklist with visual indicators
- Prominent warnings for blockers
- Impact summary before confirmation
- Confirmation dialog with explicit consent
- Success message with undo option (24-hour window)

---

### UC-VD-007: Search Vendors

**Primary Actor**: All Users
**Priority**: Critical
**Frequency**: Very High (100+ searches/day)
**Related FR**: FR-VD-010

#### Preconditions
- User is authenticated
- User has permission to view vendors
- Vendor directory is accessible

#### Main Flow
1. User navigates to Vendor Directory
2. System displays vendor list page with:
   - Search bar (prominent at top)
   - Active filters panel (if any applied)
   - Vendor count
   - Vendor grid/list view
3. User enters search term in search bar
4. System performs real-time search as user types (debounced 300ms)
5. System searches across multiple fields:
   - Vendor code
   - Company name
   - Legal name
   - Tax registration number
   - Contact names
   - Contact email
   - Contact phone
   - Notes
6. System calculates relevance score for each match
7. System returns results sorted by relevance
8. System highlights matching terms in results
9. System displays results with key information:
   - Vendor code
   - Company name
   - Primary contact
   - Status badge
   - Rating stars
   - Last order date
10. System shows result count: "Showing X of Y vendors"
11. User can click vendor to view full profile

#### Postconditions
- **Success**: Relevant vendors displayed
- **Success**: Search term highlighted in results
- **Success**: Results sorted by relevance
- **Success**: Search logged for analytics

#### Alternate Flows

**AF-001: No Results Found**
- At step 8, if no matches found:
  - System displays "No vendors found matching '[search term]'"
  - System suggests:
    - Check spelling
    - Try different keywords
    - Use advanced filters
    - Create new vendor
  - User can adjust search or create new vendor
  - End use case

**AF-002: Quick Actions from Results**
- At step 11, instead of opening profile:
  - User hovers over vendor card
  - System displays quick action menu:
    - View Profile
    - Create PO
    - View Orders
    - View Invoices
    - Email Contact
  - User selects action
  - System performs selected action
  - End use case

**AF-003: Export Search Results**
- At step 10, user clicks "Export Results":
  - System displays export options (CSV, Excel, PDF)
  - User selects format
  - System generates file with search results
  - System downloads file
  - Continue to step 11

**AF-004: Save Search**
- At step 10, user clicks "Save Search":
  - System prompts for search name
  - User enters descriptive name
  - System saves search criteria
  - System adds to "Saved Searches" dropdown
  - User can access saved search later
  - Continue to step 11

**AF-005: Pagination**
- At step 10, if results exceed 100:
  - System displays first 100 results
  - System shows pagination controls
  - User clicks "Next" or page number
  - System loads next page of results
  - Continue to step 11

**AF-006: Clear Search**
- At any point after step 3:
  - User clicks "Clear" (X) icon in search bar
  - System clears search term
  - System displays full vendor list
  - Return to step 2

#### Exception Flows

**EF-001: Search Timeout**
- At step 6, if search takes >5 seconds:
  - System displays loading indicator
  - System shows partial results if available
  - System displays message: "Search is taking longer than expected..."
  - User can cancel search
  - If completed: Continue to step 7
  - If cancelled: End use case

**EF-002: Invalid Search Characters**
- At step 3, if special SQL characters entered:
  - System sanitizes input (prevents SQL injection)
  - System treats special characters as literals
  - Continue to step 4

**EF-003: Search Too Broad**
- At step 7, if >1000 results:
  - System displays first 100 results
  - System shows message: "Over 1000 results found. Please refine your search."
  - System suggests using filters
  - User can refine search or use filters
  - Continue to step 10

**EF-004: Permission Restricted Results**
- At step 8, if user has location/department restrictions:
  - System filters results based on user permissions
  - System only shows vendors user has access to
  - System displays count: "Showing X vendors (filtered by your access)"
  - Continue to step 9

#### Business Rules Applied
- Search returns only active vendors by default (archived excluded)
- Results limited to vendors user has permission to view
- Search is case-insensitive
- Partial matches supported (wildcard search)
- Maximum 100 results per page

#### UI Requirements
- Auto-complete suggestions as user types
- Search history dropdown (last 10 searches)
- Clear visual feedback during search
- Responsive design for mobile
- Keyboard shortcuts (/ to focus search)
- Search highlighting in results

---

### UC-VD-010: Add Vendor Contact

**Primary Actor**: Vendor Manager
**Priority**: Critical
**Frequency**: Daily (5-20 contacts/day)
**Related FR**: FR-VD-003

#### Preconditions
- User is authenticated with Vendor Manager role
- User has permission to manage vendor contacts
- Vendor exists in system
- User has access to the vendor

#### Main Flow
1. User opens vendor profile
2. User navigates to "Contacts" tab
3. System displays existing contacts (if any)
4. User clicks "Add Contact" button
5. System displays contact creation form with fields:
   - **Required**: Full Name, Email, Role
   - **Optional**: Title, Phone, Mobile, Secondary Email, Language, Availability
6. User enters contact information:
   - Full Name
   - Title (e.g., Purchasing Manager, Sales Rep)
   - Role: Primary / Sales / Accounts Payable / Technical Support / Management / Other
   - Primary Email
   - Phone Number with country code
   - Mobile Number (optional)
7. User sets communication preferences:
   - Preferred method: Email / Phone / SMS / Portal
   - Language preference
   - Best time to contact
8. User optionally marks as:
   - Preferred contact for role
   - Primary contact (if first contact)
9. User enters contact notes (optional)
10. User clicks "Save Contact"
11. System validates required fields
12. System validates email format
13. System validates phone number format
14. System checks for duplicate email within vendor
15. System saves contact with status "Active"
16. System links contact to vendor
17. If marked as Primary and no previous Primary exists:
    - System sets as primary contact
18. If marked as Primary and previous Primary exists:
    - System prompts: "Replace existing primary contact?"
    - User confirms or cancels
19. System sends welcome email to contact (optional)
20. System displays success message
21. System refreshes contacts list
22. System logs action in audit trail

#### Postconditions
- **Success**: Contact created and linked to vendor
- **Success**: Contact appears in vendor's contact list
- **Success**: Audit trail entry created
- **Success**: Welcome email sent if configured

#### Alternate Flows

**AF-001: Add Multiple Contacts**
- At step 20, user clicks "Add Another Contact":
  - System clears form
  - User enters new contact information
  - Continue from step 6

**AF-002: Import Contacts from vCard**
- At step 4, user clicks "Import vCard":
  - System displays file upload dialog
  - User selects .vcf file
  - System parses vCard data
  - System pre-fills form with extracted data
  - User reviews and adjusts data
  - Continue to step 10

**AF-003: Copy Contact from Another Vendor**
- At step 4, user clicks "Copy from Vendor":
  - System displays vendor search dialog
  - User searches and selects source vendor
  - System displays contacts from source vendor
  - User selects contact(s) to copy
  - System pre-fills form with copied data
  - User adjusts as needed
  - Continue to step 10

**AF-004: Send Test Email**
- At step 10, before saving:
  - User clicks "Send Test Email"
  - System composes test email
  - System sends to contact email
  - System displays status: "Test email sent"
  - User verifies email received
  - Continue to step 10

#### Exception Flows

**EF-001: Duplicate Email**
- At step 14, if email already exists for this vendor:
  - System displays warning: "This email already exists for contact [Name]"
  - System shows existing contact details
  - User options:
    - "Add Anyway": Creates duplicate email contact
    - "View Existing": Opens existing contact
    - "Update Existing": Updates existing contact instead
  - User selects option
  - System proceeds based on selection

**EF-002: Invalid Email Format**
- At step 12, if email format is invalid:
  - System highlights email field in red
  - System displays error: "Invalid email format"
  - System shows expected format
  - User corrects email
  - Continue to step 12

**EF-003: Invalid Phone Format**
- At step 13, if phone format is invalid:
  - System highlights phone field
  - System displays error: "Invalid phone number format for [country]"
  - System suggests correct format
  - User corrects phone number
  - Continue to step 13

**EF-004: Missing Required Fields**
- At step 11, if required fields missing:
  - System highlights missing fields
  - System displays validation summary
  - System focuses on first missing field
  - User completes missing fields
  - Continue to step 11

**EF-005: Primary Contact Already Exists**
- At step 18, if primary contact already set:
  - System displays confirmation dialog:
    - "Current primary: [Name] ([Email])"
    - "Replace with new primary contact?"
  - User options: "Yes" or "No"
  - If "Yes": System updates primary designation
  - If "No": System saves as regular contact
  - Continue to step 20

**EF-006: Email Delivery Failure**
- At step 19, if welcome email fails:
  - System logs delivery failure
  - System displays warning: "Welcome email could not be sent"
  - Contact still saved successfully
  - User can manually notify contact
  - Continue to step 20

#### Business Rules Applied
- BR-VD-002: At least one primary contact required per vendor
- Email addresses must be valid format
- Phone numbers validated based on country code
- One preferred contact per role type
- Primary contact must have valid email

#### UI Requirements
- Real-time email/phone validation
- Country code selector for phone numbers
- Role-based field requirements
- Visual indicator for primary/preferred contacts
- Mobile-responsive form
- Auto-save draft

---

### UC-VD-013: Upload Vendor Document

**Primary Actor**: Vendor Manager, Compliance Officer
**Priority**: High
**Frequency**: Daily (10-30 documents/day)
**Related FR**: FR-VD-004

#### Preconditions
- User is authenticated with appropriate role
- User has permission to upload documents
- Vendor exists in system
- User has access to the vendor

#### Main Flow
1. User opens vendor profile
2. User navigates to "Documents" tab
3. System displays existing documents organized by type:
   - Contracts (count)
   - Certifications (count)
   - Insurance (count)
   - Tax Documents (count)
   - Bank Details (count)
   - Quality Certificates (count)
   - Other (count)
4. User clicks "Upload Document" button
5. System displays document upload dialog
6. User drags and drops file or clicks "Browse"
7. System validates file:
   - File type (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG)
   - File size (<50MB)
8. System displays upload progress bar
9. System uploads file to cloud storage
10. System displays document metadata form:
    - **Document Type** (dropdown, required)
    - **Document Number** (text, required)
    - **Document Name** (text, auto-filled from filename, editable)
    - **Issue Date** (date picker, required)
    - **Expiry Date** (date picker, optional but recommended)
    - **Issuing Authority** (text, optional)
    - **Notes** (text area, optional)
11. User completes document metadata
12. User optionally marks as:
    - Requires approval
    - Confidential
    - Auto-notify before expiry
13. User clicks "Save Document"
14. System validates required metadata
15. System generates document ID
16. System saves document record
17. System links document to vendor
18. If requires approval:
    - System creates approval request
    - System routes to appropriate approver
    - System sends notification
19. If expiry date provided:
    - System schedules expiration alerts (90, 60, 30 days)
20. System displays success message
21. System refreshes documents list
22. System logs action in audit trail

#### Postconditions
- **Success**: Document uploaded and stored
- **Success**: Document metadata saved
- **Success**: Document linked to vendor
- **Success**: Approval request created if required
- **Success**: Expiry alerts scheduled if applicable
- **Success**: Audit trail entry created

#### Alternate Flows

**AF-001: Upload Multiple Documents**
- At step 6, user selects multiple files:
  - System validates each file
  - System uploads all files in parallel
  - System displays progress for each file
  - System prompts for metadata for each document
  - User completes metadata in batch form
  - Continue to step 13

**AF-002: Scan Document**
- At step 6, user clicks "Scan Document":
  - System activates scanner interface
  - User scans document
  - System saves scanned image as PDF
  - Continue to step 10

**AF-003: Link External Document**
- At step 6, user clicks "Link External URL":
  - System displays URL input dialog
  - User enters external document URL
  - System validates URL accessibility
  - System saves URL reference (not file)
  - Continue to step 10

**AF-004: Replace Existing Document**
- At step 3, user clicks "Replace" on existing document:
  - System displays file upload dialog
  - User selects new file
  - System increments version number
  - System archives old version
  - System copies metadata from old version
  - User can update metadata
  - Continue to step 13

**AF-005: Bulk Upload via ZIP**
- At step 6, user uploads ZIP file:
  - System extracts ZIP contents
  - System validates each extracted file
  - System displays batch metadata form
  - User assigns document types in bulk
  - System saves all documents
  - Continue to step 21

#### Exception Flows

**EF-001: File Type Not Allowed**
- At step 7, if file type is invalid:
  - System displays error: "File type not supported. Allowed types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG"
  - System rejects file
  - User selects different file
  - Continue to step 6

**EF-002: File Size Exceeds Limit**
- At step 7, if file size >50MB:
  - System displays error: "File size exceeds 50MB limit. Current size: [XX]MB"
  - System suggests:
    - Compress file
    - Split into multiple files
    - Contact administrator for exception
  - System rejects file
  - User adjusts file or contacts admin
  - End use case

**EF-003: Upload Failure**
- At step 9, if upload fails:
  - System displays error: "Upload failed. Please check your connection and try again."
  - System logs error details
  - System retains file for retry
  - User options: "Retry" or "Cancel"
  - If retry: Continue to step 9
  - If cancel: End use case

**EF-004: Missing Required Metadata**
- At step 14, if required fields missing:
  - System highlights missing fields
  - System displays error summary
  - User completes missing fields
  - Continue to step 14

**EF-005: Duplicate Document**
- At step 15, if document with same type and number exists:
  - System displays warning: "A document with this type and number already exists"
  - System shows existing document details
  - User options:
    - "Replace Existing": Archives old, saves new as latest version
    - "Save as New": Creates separate document
    - "Cancel": Cancels upload
  - System proceeds based on selection

**EF-006: Virus Detected**
- At step 8, if virus scan detects malware:
  - System quarantines file
  - System displays error: "File contains malicious content and has been blocked"
  - System logs security incident
  - System notifies administrator
  - End use case

**EF-007: Storage Quota Exceeded**
- At step 9, if storage quota exceeded:
  - System displays error: "Storage quota exceeded. Please contact administrator."
  - System shows current usage and quota
  - User must contact admin to increase quota
  - End use case

**EF-008: Document Approval Rejected**
- After step 18, if document is rejected:
  - System sends rejection notification
  - System displays rejection reason
  - Document marked as "Rejected"
  - User can upload revised document
  - End use case

#### Business Rules Applied
- Maximum file size: 50MB
- Allowed formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
- Contracts >$100,000 require approval
- Insurance certificates must have expiry date
- Certifications with expiry require auto-renewal alerts
- Expired documents flagged but not deleted
- Document versions retained indefinitely

#### UI Requirements
- Drag-and-drop file upload
- Progress indicator for uploads
- Preview for PDF documents
- Version history display
- Document status badges (Active, Expired, Expiring Soon, Pending Approval)
- Mobile document capture support
- OCR for scanned documents (future enhancement)

---

### UC-VD-016: Submit Vendor for Approval

**Primary Actor**: Vendor Manager
**Priority**: Critical
**Frequency**: Daily (2-10 submissions/day)
**Related FR**: FR-VD-005

#### Preconditions
- User is authenticated with Vendor Manager role
- User has permission to submit vendors for approval
- Vendor exists with status "Draft"
- Required vendor information is complete
- Required documents are uploaded

#### Main Flow
1. User opens vendor profile
2. System displays vendor status: "Draft"
3. User clicks "Submit for Approval" button
4. System performs pre-submission validation:
   - All required fields completed
   - At least one primary contact
   - Payment terms defined
   - Required documents uploaded:
     - Tax registration certificate
     - Business license
     - Insurance certificate (if applicable)
   - Bank details provided (if electronic payment)
5. System displays validation results:
   - ✓ All requirements met: [X/X]
   - ! Warnings: [Y] (optional items missing)
6. If validation passes:
   - System displays approval routing preview:
     - Stage 1: Compliance Review → [Reviewer Name]
     - Stage 2: Financial Review → [Reviewer Name]
     - Stage 3: Quality Review → [Reviewer Name]
     - Stage 4: Management Approval → [Manager Name]
7. User enters submission notes (optional):
   - Reason for vendor onboarding
   - Expected annual spend
   - Business justification
   - Urgency level
8. User clicks "Confirm Submission"
9. System changes vendor status to "Pending Approval"
10. System creates approval workflow instance
11. System assigns to first stage approver (Compliance)
12. System sends email notification to approver:
    - Vendor name and code
    - Submission notes
    - Link to review page
    - Approval deadline (SLA: 24 hours)
13. System logs submission in audit trail
14. System displays success message:
    - "Vendor submitted for approval"
    - "Approval request sent to [Approver Name]"
    - "Track status in Pending Approvals"
15. System returns to vendor profile
16. System displays approval progress indicator

#### Postconditions
- **Success**: Vendor status changed to "Pending Approval"
- **Success**: Approval workflow created and routed
- **Success**: First approver notified
- **Success**: Submission logged in audit trail
- **Success**: SLA timer started

#### Alternate Flows

**AF-001: Fast-Track Approval**
- At step 7, user marks as "Urgent":
  - System displays fast-track options:
    - Urgent (24-hour approval)
    - Critical (4-hour approval)
  - User selects urgency and provides justification
  - System reduces SLA timer accordingly
  - System adds "URGENT" flag to notification
  - Continue to step 8

**AF-002: Request Specific Approvers**
- At step 6, user clicks "Change Approvers":
  - System displays approver selection for each stage
  - User selects different approvers (if permitted)
  - System validates approver permissions
  - System updates routing
  - Continue to step 7

**AF-003: Parallel Approval Routing**
- At step 6, for certain vendor types:
  - System identifies parallel approval stages:
    - Compliance + Financial (parallel)
    - Then Quality + Management (sequential)
  - System displays parallel routing diagram
  - Continue to step 7

**AF-004: Save as Draft Instead**
- At step 8, user clicks "Save Draft":
  - System saves current state
  - Status remains "Draft"
  - No approval workflow created
  - User can continue editing
  - End use case

#### Exception Flows

**EF-001: Validation Failures**
- At step 4, if required items missing:
  - System displays validation error dialog:
    - ✗ Missing primary contact
    - ✗ Payment terms not defined
    - ✗ Required document missing: Tax registration
  - System provides "Fix Now" links to each issue
  - User must resolve issues before submission
  - End use case

**EF-002: Document Expiry Warning**
- At step 5, if documents expiring soon:
  - System displays warning:
    - "Insurance certificate expires in 15 days"
    - "Consider renewing before submission"
  - User options:
    - "Submit Anyway": Includes warning in notes
    - "Upload New Document": User uploads updated doc
    - "Cancel": Cancels submission
  - System proceeds based on selection

**EF-003: No Available Approver**
- At step 11, if assigned approver unavailable:
  - System checks for backup approver
  - If backup exists: Routes to backup
  - If no backup: System displays error:
    - "No available approver for Compliance Review"
    - "Contact system administrator"
  - Submission fails
  - End use case

**EF-004: Duplicate Submission**
- At step 9, if approval already pending:
  - System displays error: "This vendor already has a pending approval request"
  - System shows existing approval status
  - User options:
    - "View Approval Status"
    - "Withdraw and Resubmit"
  - System proceeds based on selection

**EF-005: Vendor Type Requires Additional Review**
- At step 6, for high-risk vendor types:
  - System adds additional review stages:
    - International vendor: + Compliance extra review
    - High-value vendor (>$500K annual): + Executive approval
    - Strategic vendor: + Board approval
  - System updates routing preview
  - System extends SLA accordingly
  - Continue to step 7

**EF-006: Submission Quota Exceeded**
- At step 9, if user exceeded daily submission quota:
  - System displays error: "Daily submission limit reached ([X] vendors)"
  - System suggests:
    - Try again tomorrow
    - Contact supervisor for override
  - End use case

#### Business Rules Applied
- BR-VD-003: New vendors require approval
- All required fields must be complete
- Required documents must be uploaded and valid
- Approvers cannot approve their own submissions
- International vendors require additional compliance review
- High-value vendors (annual spend >$500K) require executive approval
- SLA: 24 hours per stage (business hours)

#### UI Requirements
- Pre-submission validation checklist
- Visual approval routing diagram
- SLA countdown timer
- Real-time approval status updates
- Mobile approval support
- Email and in-app notifications
- One-click approval from email (for mobile users)

---

### UC-VD-017: Review and Approve Vendor

**Primary Actor**: Compliance Officer, Finance Manager
**Priority**: Critical
**Frequency**: Daily (2-10 reviews/day)
**Related FR**: FR-VD-005

#### Preconditions
- User is authenticated with appropriate approver role
- User has permission to approve vendors
- Vendor is in "Pending Approval" status
- Approval request assigned to user
- User is current stage approver

#### Main Flow
1. User receives approval notification via:
   - Email notification with inline approval
   - In-app notification
   - Pending approvals dashboard badge
2. User navigates to "My Approvals" page
3. System displays pending approval requests:
   - Vendor name and code
   - Submitted by
   - Submission date
   - SLA deadline
   - Urgency flag (if applicable)
4. User clicks on approval request
5. System displays vendor approval review page:
   - Vendor profile summary
   - Submission notes
   - Required documents
   - Approval checklist for current stage
   - Previous approval history (if applicable)
   - Comments from previous approvers
6. User reviews vendor information:
   - **Compliance Officer reviews**:
     - Tax registration certificate
     - Business license
     - Insurance certificates
     - Required certifications
     - Regulatory compliance
   - **Finance Manager reviews**:
     - Payment terms
     - Credit limit
     - Banking details
     - Financial health indicators
   - **Quality Manager reviews**:
     - Quality certifications
     - Industry standards compliance
     - Product/service quality history
7. User completes approval checklist:
   - [ ] All required documents present and valid
   - [ ] Information accurate and complete
   - [ ] No red flags identified
   - [ ] Complies with company policies
8. User enters approval notes (optional but recommended)
9. User selects action:
   - **Approve**: Move to next stage
   - **Reject**: Return to submitter
   - **Request Information**: Pause for clarification
10. If "Approve" selected:
    - User clicks "Approve"
    - System validates all checklist items completed
    - System records approval decision
    - System updates vendor status
    - If last stage: System sets status to "Approved"
    - If not last stage: System routes to next approver
    - System sends notification to next approver
    - System sends status update to submitter
11. System logs approval in audit trail
12. System displays success message
13. System removes from user's pending approvals
14. System updates SLA tracking

#### Postconditions
- **Success**: Approval recorded in system
- **Success**: Vendor moved to next stage or approved
- **Success**: Appropriate notifications sent
- **Success**: Audit trail updated
- **Success**: SLA tracking updated

#### Alternate Flows

**AF-001: Approve from Email**
- At step 1, user receives email:
  - User clicks "Quick Approve" link in email
  - System displays mobile-optimized review page
  - User reviews key information
  - User clicks "Approve"
  - System processes approval
  - System sends confirmation email
  - End use case

**AF-002: Approve Multiple Vendors in Batch**
- At step 3, user selects multiple approval requests:
  - System displays batch approval interface
  - User reviews each vendor summary
  - User marks each as Approve/Reject/Skip
  - User enters batch approval notes
  - System processes all selections
  - System sends notifications for each
  - End use case

**AF-003: Conditional Approval**
- At step 9, user selects "Approve with Conditions":
  - User enters conditions:
    - "Valid for 90 days (provisional)"
    - "Requires quarterly performance review"
    - "Limited to $5,000 per PO until proven"
  - System records conditions
  - System sets provisional status
  - System schedules follow-up review
  - Continue to step 10

**AF-004: Delegate Approval**
- At step 5, user clicks "Delegate":
  - System displays colleague selection
  - User selects delegate and provides reason
  - System reassigns approval request
  - System notifies delegate
  - System logs delegation
  - End use case

**AF-005: Escalate for Additional Review**
- At step 6, if user identifies risk:
  - User clicks "Escalate"
  - User selects escalation reason:
    - High risk vendor
    - Unusual circumstances
    - Requires management decision
  - System adds management review stage
  - System routes to management
  - System notifies submitter of escalation
  - End use case

#### Exception Flows

**EF-001: Reject Vendor**
- At step 9, if user selects "Reject":
  - System displays rejection dialog
  - User must enter rejection reason (required):
    - Missing documents
    - Invalid information
    - Non-compliance with policies
    - Failed verification
    - Other (specify)
  - User enters detailed rejection notes
  - User can provide guidance for resubmission
  - System changes status to "Rejected"
  - System sends rejection notification to submitter
  - System includes rejection reason and notes
  - Vendor returned to submitter for revision
  - End use case

**EF-002: Request Additional Information**
- At step 9, if user selects "Request Information":
  - System displays information request form
  - User specifies required information:
    - Missing documents list
    - Clarification questions
    - Additional verification needed
  - User sets response deadline
  - System changes status to "Information Requested"
  - System sends request to submitter
  - System pauses SLA timer
  - Approval remains assigned to current user
  - End use case

**EF-003: Approval Checklist Incomplete**
- At step 10, if required checklist items not completed:
  - System highlights incomplete items
  - System displays error: "Please complete all required checklist items"
  - User must complete checklist
  - Continue to step 10

**EF-004: Document Verification Failure**
- At step 6, if user cannot verify documents:
  - User clicks "Cannot Verify"
  - User specifies issue:
    - Document illegible
    - Document appears fraudulent
    - Document expired
    - Unable to contact issuing authority
  - System flags for security review
  - User can reject or escalate
  - Continue to step 9

**EF-005: Approval Deadline Exceeded**
- At step 4, if SLA deadline passed:
  - System displays "OVERDUE" warning
  - System has already sent escalation notifications
  - User completes approval as normal
  - System logs SLA breach
  - Approval performance tracked
  - Continue to step 5

**EF-006: Conflicting Approvals**
- At step 10, if using parallel routing and approvals conflict:
  - Stage 1: Compliance Officer approves
  - Stage 1: Finance Manager rejects
  - System escalates to management
  - Management reviews both decisions
  - Management makes final decision
  - System proceeds based on final decision

**EF-007: Approver No Longer Available**
- At step 1, if approver on leave:
  - System automatically delegates to backup approver
  - System sends notification to backup
  - Backup can accept or redirect
  - System logs automatic delegation
  - Continue with backup approver

#### Business Rules Applied
- BR-VD-003: Approval required before vendor activation
- Approvers cannot approve their own vendor submissions
- All checklist items must be completed
- Rejection requires reason and detailed notes
- SLA: 24 hours per approval stage
- Expired SLA triggers escalation notification
- Minimum 2 approvers for high-value vendors
- Management approval required for vendors >$500K annual spend

#### UI Requirements
- Mobile-responsive approval interface
- Document preview panel
- Side-by-side vendor information display
- Visual approval progress tracker
- Color-coded SLA indicators (green, yellow, red)
- Quick action buttons for common decisions
- Approval history timeline
- Real-time notification updates
- Batch approval interface for multiple vendors

---

### UC-VD-019: Track Vendor Performance

**Primary Actor**: System (Automated)
**Priority**: High
**Frequency**: Monthly (automated batch job)
**Related FR**: FR-VD-006

#### Preconditions
- System is operational
- Vendor exists with "Approved" or "Preferred" status
- Vendor has completed at least 5 transactions
- Transaction data available (POs, GRNs, invoices)
- Performance calculation job scheduled

#### Main Flow
1. System initiates monthly performance calculation job
2. System identifies vendors eligible for rating:
   - Status: Approved or Preferred
   - Minimum 5 completed orders
   - Minimum 30 days since activation
3. For each eligible vendor, system retrieves transaction data:
   - Purchase orders (last 12 months)
   - Goods received notes (GRN)
   - Quality inspection results
   - Invoice payment data
   - Issue tickets and resolutions
4. System calculates **Quality Score** (0-100):
   - Defect rate from GRN inspections
   - Reject rate (items returned)
   - Complaint count
   - Quality issue resolution time
   - Formula: Quality Score = 100 - (defect_rate × 40) - (reject_rate × 30) - (complaint_impact × 30)
5. System calculates **Delivery Performance** (0-100):
   - On-time delivery percentage
   - Early deliveries (bonus points)
   - Late deliveries (penalties)
   - Delivery accuracy (correct quantities)
   - Formula: Delivery Score = (on_time_deliveries / total_deliveries) × 100
6. System calculates **Service Level** (0-100):
   - Responsiveness (reply time to inquiries)
   - Issue resolution time
   - Order acknowledgment time
   - Communication quality
   - Formula: Service Score = 100 - (avg_response_delay_hours × 2) - (unresolved_issues × 10)
7. System calculates **Pricing Competitiveness** (0-100):
   - Price variance vs. market average
   - Price trend (increasing/decreasing)
   - Discount compliance
   - Formula: Pricing Score = 100 - (price_variance_percent × 2)
8. System applies configurable weights:
   - Quality: 35%
   - Delivery: 30%
   - Service: 20%
   - Pricing: 15%
9. System calculates **Overall Rating**:
   - Overall = (Quality × 0.35) + (Delivery × 0.30) + (Service × 0.20) + (Pricing × 0.15)
   - Scale: 0-100 converted to 1-5 stars or 1-10 scale
10. System compares new rating with previous rating
11. If rating change >10 points (or 1 star):
    - System flags as significant change
    - System generates alert notification
12. System saves performance metrics:
    - Overall rating
    - Individual metric scores
    - Calculation date
    - Data snapshot for audit
13. System updates vendor profile with new rating
14. System stores rating in performance history
15. System generates performance trend data
16. If rating falls below threshold (rating <60):
    - System flags vendor for review
    - System notifies Vendor Manager
    - System triggers performance improvement plan
17. If rating consistently high (rating ≥90 for 6 months):
    - System suggests "Preferred Vendor" nomination
    - System notifies Vendor Manager
18. System logs performance calculation in audit trail
19. System generates monthly performance report
20. System sends performance summary to vendor (optional)

#### Postconditions
- **Success**: Performance metrics calculated and stored
- **Success**: Vendor rating updated
- **Success**: Performance history recorded
- **Success**: Alerts generated for significant changes
- **Success**: Reports generated

#### Alternate Flows

**AF-001: Insufficient Transaction Data**
- At step 2, if vendor has <5 transactions:
  - System skips performance calculation
  - System logs: "Insufficient data for rating"
  - System maintains "Not Rated" status
  - End use case for this vendor

**AF-002: Manual Performance Adjustment**
- After step 13, Vendor Manager can override:
  - User opens vendor performance page
  - User clicks "Manual Adjustment"
  - User enters adjustment reason:
    - Exceptional circumstances
    - Data quality issue
    - One-time incident (fire, natural disaster)
  - User adjusts specific metric scores
  - System recalculates overall rating
  - System logs manual adjustment with reason
  - System flags as "Manual Override" in reports

**AF-003: Performance Improvement Plan Triggered**
- At step 16, if rating <60 for 2 consecutive months:
  - System creates performance improvement plan
  - System assigns Vendor Manager as owner
  - System sets 90-day review period
  - System schedules follow-up reviews
  - Vendor Manager contacts vendor
  - System tracks improvement actions
  - System monitors subsequent ratings

**AF-004: Preferred Vendor Recommendation**
- At step 17, if criteria met:
  - System generates recommendation report
  - System compiles supporting evidence:
    - 6-month rating trend
    - Transaction volume
    - Cost savings achieved
    - Innovation contributions
  - System creates approval workflow
  - Vendor Manager reviews and submits
  - Continue with approval process

#### Exception Flows

**EF-001: Data Quality Issues**
- At step 3, if transaction data incomplete/corrupted:
  - System logs data quality error
  - System flags affected vendor
  - System notifies data administrator
  - System uses previous period's rating
  - System marks rating as "Estimated"
  - End use case for this vendor

**EF-002: Calculation Error**
- At step 9, if calculation produces invalid result:
  - System logs calculation error
  - System retries calculation
  - If persistent error:
    - System flags vendor
    - System notifies administrator
    - System maintains previous rating
    - System generates error report
  - End use case for this vendor

**EF-003: Rating Dispute**
- After step 20, if vendor disputes rating:
  - Vendor submits dispute through portal
  - Vendor Manager reviews dispute
  - System pulls detailed transaction data
  - Manager verifies calculation accuracy
  - If calculation error found:
    - Manager corrects data
    - System recalculates rating
    - System notifies vendor of correction
  - If calculation correct:
    - Manager explains methodology
    - System logs dispute resolution
  - End use case

**EF-004: Extreme Rating Drop**
- At step 11, if rating drops >30 points:
  - System triggers immediate investigation
  - System sends urgent alert to management
  - System freezes new PO creation (optional)
  - Vendor Manager investigates cause
  - System creates incident report
  - Management decides on vendor status
  - Continue to step 12

**EF-005: No Transaction Activity**
- At step 3, if no transactions in 12 months:
  - System flags vendor as "Inactive"
  - System sends reactivation prompt to Vendor Manager
  - System suggests archive if no response
  - System maintains last known rating
  - End use case for this vendor

#### Business Rules Applied
- BR-VD-005: Minimum 5 transactions over 30 days required for meaningful rating
- Ratings updated monthly
- Rating changes >10 points trigger notification
- Vendors below rating threshold (60) flagged for review
- Consistently high-performing vendors (≥90 for 6 months) suggested for Preferred status
- Manual adjustments require justification and approval
- Performance data retained for 3 years

#### UI Requirements
- Performance dashboard with trend charts
- Drill-down capability to view metric details
- Comparison with historical ratings
- Benchmark comparison against category averages
- Visual indicators for rating changes (up/down arrows)
- Filter by rating range, metric, trend
- Export performance reports to PDF/Excel
- Mobile-responsive scorecard view

---

### UC-VD-022: Block Vendor

**Primary Actor**: Vendor Manager
**Priority**: Critical
**Frequency**: Weekly (1-3 vendors/week)
**Related FR**: FR-VD-007

#### Preconditions
- User is authenticated with Vendor Manager role
- User has permission to block vendors
- Vendor exists with status "Approved" or "Preferred"
- User has access to the vendor

#### Main Flow
1. User searches for vendor to block
2. User opens vendor profile
3. System displays current vendor status and recent activity
4. User clicks "Change Status" > "Block Vendor"
5. System displays block vendor confirmation dialog
6. System checks for impact:
   - Active purchase orders: [X] POs totaling $[amount]
   - Pending orders: [Y] POs totaling $[amount]
   - Outstanding invoices: [Z] invoices totaling $[amount]
7. System displays impact summary:
   - "This vendor has [X] active purchase orders"
   - "Blocking will prevent NEW orders only"
   - "Existing orders will continue"
8. User selects block reason (required):
   - Quality issues
   - Delivery failures
   - Non-compliance
   - Contract dispute
   - Financial concerns
   - Under investigation
   - Other (specify)
9. User enters detailed block notes (required):
   - Description of issue
   - Supporting evidence
   - Expected duration
   - Resolution requirements
10. User sets block parameters:
    - Block type: Temporary or Pending Review
    - Expected duration: [X] days or Until resolved
    - Notify vendor: Yes/No
11. User clicks "Confirm Block"
12. System validates required fields completed
13. System creates block approval workflow (if required):
    - Temporary block (<30 days): Manager approval
    - Extended block (>30 days): Executive approval
14. If approval not required or approved:
    - System changes vendor status to "Blocked"
    - System sets effective date
    - System records block reason and notes
15. System prevents new PO creation for this vendor
16. System allows existing PO transactions to continue
17. System sends notifications:
    - Procurement team: Vendor blocked, cannot create new POs
    - Finance team: Existing invoices can be processed
    - Vendor (if selected): Block notification with reason
18. System logs block action in audit trail
19. System displays block confirmation:
    - "Vendor blocked successfully"
    - "Effective date: [date]"
    - "Reason: [reason]"
    - "Review date: [date]" (if temporary)
20. System adds "BLOCKED" badge to vendor profile
21. System updates vendor list filters
22. If temporary block, system schedules review reminder

#### Postconditions
- **Success**: Vendor status changed to "Blocked"
- **Success**: New PO creation prevented
- **Success**: Existing POs unaffected
- **Success**: Notifications sent to stakeholders
- **Success**: Audit trail updated
- **Success**: Review scheduled if temporary

#### Alternate Flows

**AF-001: Block with Immediate Effect**
- At step 10, user selects "Immediate block":
  - System bypasses approval workflow
  - Requires executive authorization code
  - User enters authorization code
  - System applies block immediately
  - System sends urgent notification
  - Continue to step 14

**AF-002: Block All Vendor Locations**
- At step 10, vendor serves multiple locations:
  - System displays location list
  - User selects locations to block:
    - All locations
    - Specific locations only
  - System applies block to selected locations
  - Other locations remain active
  - Continue to step 11

**AF-003: Transfer Active Orders to Alternative Vendor**
- At step 6, user clicks "Transfer Orders":
  - System displays active POs
  - User selects POs to transfer
  - System displays similar vendor suggestions
  - User selects replacement vendor
  - System creates transfer workflow
  - Procurement staff notified to re-create POs
  - Continue to step 11

**AF-004: Schedule Future Block Date**
- At step 10, user clicks "Schedule Block":
  - System displays date picker
  - User selects future effective date
  - System saves as "Scheduled Block"
  - System sends advance warning notifications
  - On effective date, system applies block
  - End use case

#### Exception Flows

**EF-001: Missing Block Reason**
- At step 12, if block reason not provided:
  - System highlights reason field
  - System displays error: "Block reason is required"
  - User must provide reason
  - Continue to step 12

**EF-002: Insufficient Permission**
- At step 4, if user lacks block permission:
  - System displays error: "You do not have permission to block vendors"
  - System suggests contacting Vendor Manager
  - End use case

**EF-003: Approval Required but Denied**
- At step 13, if approval is denied:
  - System sends denial notification to user
  - System displays denial reason
  - Vendor status remains unchanged
  - User can revise request or cancel
  - End use case

**EF-004: Critical Vendor Warning**
- At step 5, if vendor is "Strategic" or "Sole Source":
  - System displays critical vendor warning:
    - "WARNING: This is a strategic/sole source vendor"
    - "Blocking will significantly impact operations"
    - "Alternative vendors: [list or None]"
  - User must acknowledge warning
  - System requires executive approval
  - Continue to step 6

**EF-005: Vendor Has Committed Future Orders**
- At step 6, if vendor has committed future deliveries:
  - System displays future commitment warning:
    - "This vendor has committed deliveries for next [X] days"
    - "Blocking may cause supply disruption"
  - System lists future scheduled deliveries
  - User options:
    - "Block Now": Accepts supply risk
    - "Schedule Block After Deliveries": Delays block
    - "Cancel": Aborts block
  - System proceeds based on selection

**EF-006: Outstanding Invoice Disputes**
- At step 6, if vendor has disputed invoices:
  - System displays dispute warning:
    - "This vendor has [X] disputed invoices"
    - "Total disputed amount: $[amount]"
  - System recommends resolving disputes first
  - User options:
    - "Block Anyway": Requires justification
    - "Resolve Disputes First": Cancels block
  - System proceeds based on selection

#### Business Rules Applied
- BR-VD-006: Blocked vendors cannot receive new POs
- Existing POs and invoices unaffected
- Temporary blocks (<30 days) require manager approval
- Extended blocks (>30 days) require executive approval
- Strategic/sole source vendors require executive approval regardless
- Block reason and notes are mandatory
- Blocked vendors can be unblocked after issue resolution
- Automatic review scheduled for temporary blocks

#### UI Requirements
- Clear visual warning for block action
- Impact summary with transaction counts
- Pre-block checklist
- Progress indicator for block process
- "BLOCKED" badge prominently displayed on vendor profile
- Filter in vendor list for blocked vendors
- Quick unblock option (with approval)
- Mobile-responsive block interface

---

### UC-VD-031: Add Vendor Certification

**Primary Actor**: Vendor Manager, Compliance Officer
**Priority**: High
**Frequency**: Weekly (5-15 certifications/week)
**Related FR**: FR-VD-002

#### Preconditions
- User is authenticated with Vendor Manager or Compliance Officer role
- User has permission to manage certifications
- Vendor exists in system
- User has access to the vendor

#### Main Flow
1. User navigates to vendor profile
2. User clicks on "Certifications" tab
3. System displays certification list with status indicators
4. User clicks "Add Certification" button
5. System displays Add Certification dialog with form:
   - Certification Type (dropdown, required) - 16 types available:
     * ISO 9001 (Quality Management)
     * ISO 14001 (Environmental Management)
     * ISO 22000 (Food Safety)
     * HACCP (Hazard Analysis Critical Control Points)
     * GMP (Good Manufacturing Practice)
     * Halal Certification
     * Kosher Certification
     * Organic Certification
     * FDA Registered
     * USDA Certified
     * Fair Trade Certified
     * Business License
     * Health & Safety License
     * Tax Registration Certificate
     * Trade License
     * Other Certification
   - Certificate Number (text, required)
   - Issuing Authority (text, required)
   - Issue Date (date picker, required)
   - Expiry Date (date picker, required)
   - Notes (textarea, optional)
   - Certificate Document (file upload, optional)
6. User fills in certification details
7. User optionally uploads certificate document (PDF, JPG, PNG)
8. User clicks "Add Certification"
9. System validates required fields
10. System validates date logic (issue date < expiry date)
11. System calculates certification status:
    - "active": Expiry date > today + 30 days
    - "expiring_soon": Today < expiry date ≤ today + 30 days
    - "expired": Expiry date < today
    - "pending": No expiry date or manual status
12. System saves certification to database
13. System closes dialog
14. System refreshes certification list with new entry
15. System displays success message: "Certification added successfully"
16. System logs action in audit trail

#### Postconditions
- **Success**: Certification record created in database
- **Success**: Certification status auto-calculated
- **Success**: Document uploaded and linked (if provided)
- **Success**: Audit trail entry created

#### Alternate Flows

**AF-001: Upload Certificate Document**
- At step 7, user uploads certificate:
  - User clicks "Upload" or drags file
  - System validates file type (PDF, JPG, PNG)
  - System validates file size (<10MB)
  - System displays upload progress
  - System shows file preview
  - Continue to step 8

**AF-002: Add Another Certification**
- After step 15, user clicks "Add Another"
  - System resets form
  - User can add additional certification
  - Repeat from step 5

**AF-003: Certificate with No Expiry**
- At step 6, for certifications without expiry (e.g., business license):
  - User leaves expiry date blank
  - User marks "No Expiry" checkbox
  - System sets status to "active"
  - Continue to step 8

#### Exception Flows

**EF-001: Duplicate Certification Type**
- At step 9, if same certification type exists for vendor:
  - System displays warning: "A [type] certification already exists for this vendor"
  - System options: "Replace Existing" or "Cancel"
  - If "Replace": System archives old certification, saves new
  - If "Cancel": User returns to form

**EF-002: Invalid Date Range**
- At step 10, if issue date ≥ expiry date:
  - System highlights both date fields in red
  - System displays error: "Issue date must be before expiry date"
  - User corrects dates
  - Continue to step 10

**EF-003: Upload Error**
- At step 7, if file upload fails:
  - System displays error: "Failed to upload document. Please try again."
  - System preserves form data
  - User can retry upload or skip document
  - Continue to step 8

**EF-004: Required Field Missing**
- At step 9, if required field is empty:
  - System highlights missing field
  - System displays error message
  - User completes field
  - Continue to step 9

#### Business Rules Applied
- BR-VD-007: Certification status auto-calculated based on 30-day threshold
- BR-VD-008: Each certification type can only have one active record per vendor
- Maximum 20 certifications per vendor
- Document file size limit: 10MB
- Supported file types: PDF, JPG, PNG

#### UI Requirements
- Modal dialog for add certification
- Dropdown with all 16 certification types
- Date pickers with validation
- File drag-and-drop upload area
- Real-time validation feedback
- Status preview based on selected dates
- Mobile-responsive form layout

---

### UC-VD-032: Edit Vendor Certification

**Primary Actor**: Vendor Manager, Compliance Officer
**Priority**: High
**Frequency**: Weekly (3-10 edits/week)
**Related FR**: FR-VD-002

#### Preconditions
- User is authenticated with Vendor Manager or Compliance Officer role
- User has permission to manage certifications
- Certification exists for the vendor
- User has access to the vendor

#### Main Flow
1. User navigates to vendor profile
2. User clicks on "Certifications" tab
3. System displays certification list with status badges
4. User locates certification to edit
5. User clicks "Edit" button on certification row/card
6. System displays Edit Certification dialog with pre-filled form:
   - Certification Type (read-only)
   - Certificate Number (editable)
   - Issuing Authority (editable)
   - Issue Date (editable)
   - Expiry Date (editable)
   - Notes (editable)
   - Current Document (display with replace option)
7. User modifies certification details
8. User optionally replaces certificate document
9. User clicks "Save Changes"
10. System validates modified fields
11. System recalculates certification status based on new dates
12. System updates certification record
13. System closes dialog
14. System refreshes certification list
15. System displays success message: "Certification updated successfully"
16. System logs change in audit trail with before/after values

#### Postconditions
- **Success**: Certification record updated in database
- **Success**: Status recalculated if dates changed
- **Success**: Document replaced if provided
- **Success**: Audit trail entry created with changes

#### Alternate Flows

**AF-001: Replace Certificate Document**
- At step 8, user replaces document:
  - User clicks "Replace Document"
  - User uploads new file
  - System validates file
  - System displays new file preview
  - Old document retained in history
  - Continue to step 9

**AF-002: Remove Certificate Document**
- At step 8, user removes document:
  - User clicks "Remove Document"
  - System prompts: "Remove document from certification?"
  - If "Yes": Document unlinked (retained in storage)
  - If "No": Document remains
  - Continue to step 9

**AF-003: Extend Expiry Date**
- At step 7, user extends expiry date:
  - User selects new expiry date (future)
  - System previews new status (likely "active")
  - Continue to step 9

#### Exception Flows

**EF-001: Concurrent Edit Conflict**
- At step 12, if another user modified same certification:
  - System displays conflict warning
  - System shows other user's changes
  - User options: "Override" or "Cancel"
  - If "Override": User's changes saved
  - If "Cancel": Dialog closes, no save

**EF-002: Validation Error**
- At step 10, if validation fails:
  - System highlights invalid fields
  - System displays specific error messages
  - User corrects errors
  - Continue to step 10

**EF-003: Status Change Warning**
- At step 11, if status changes to "expired" or "expiring_soon":
  - System displays warning: "Certification status will change to [new status]"
  - User confirms or adjusts dates
  - Continue to step 12

#### Business Rules Applied
- BR-VD-007: Status recalculated on expiry date change
- Certification type cannot be changed (create new if needed)
- Changes to expired certifications trigger compliance notification
- All changes logged with before/after values

#### UI Requirements
- Modal dialog for edit certification
- Pre-filled form with current values
- Visual indication of changed fields
- Status preview when dates change
- Document replace/remove options
- Mobile-responsive edit form

---

### UC-VD-033: Delete Vendor Certification

**Primary Actor**: Vendor Manager
**Priority**: Medium
**Frequency**: Monthly (1-5 deletions/month)
**Related FR**: FR-VD-002

#### Preconditions
- User is authenticated with Vendor Manager role
- User has permission to delete certifications
- Certification exists for the vendor
- User has access to the vendor

#### Main Flow
1. User navigates to vendor profile
2. User clicks on "Certifications" tab
3. System displays certification list
4. User locates certification to delete
5. User clicks "Delete" button on certification row/card
6. System displays Delete Confirmation dialog:
   - Title: "Delete Certification"
   - Message: "Are you sure you want to delete the [certification type] certification?"
   - Details: Certificate number, issuing authority, status
   - Warning: "This action cannot be undone."
7. User clicks "Delete" button
8. System marks certification as deleted (soft delete)
9. System removes certification from display
10. System closes dialog
11. System displays success message: "Certification deleted successfully"
12. System logs deletion in audit trail

#### Postconditions
- **Success**: Certification soft-deleted (deleted_at timestamp set)
- **Success**: Certification removed from active list
- **Success**: Associated document retained for audit
- **Success**: Audit trail entry created

#### Alternate Flows

**AF-001: Cancel Deletion**
- At step 7, user clicks "Cancel":
  - System closes dialog
  - No changes made
  - End use case

#### Exception Flows

**EF-001: Active Certification Warning**
- At step 6, if certification is active and not expired:
  - System displays additional warning: "This is an active certification. Deleting may affect vendor compliance status."
  - User must confirm twice
  - Continue to step 7

**EF-002: Required Certification**
- At step 6, if certification is required for vendor type:
  - System displays warning: "This certification is required for [vendor type] vendors"
  - System warns: "Vendor may be flagged as non-compliant"
  - User options: "Delete Anyway" or "Cancel"
  - If "Delete Anyway": Continue to step 7
  - If "Cancel": End use case

**EF-003: Deletion Error**
- At step 8, if system error occurs:
  - System displays error: "Failed to delete certification. Please try again."
  - System logs error details
  - User can retry
  - Continue to step 5

#### Business Rules Applied
- BR-VD-008: Soft delete - records retained for audit
- Deleted certifications not displayed in active list
- Compliance reports may flag deleted required certifications
- Only Vendor Manager can delete (not Compliance Officer)

#### UI Requirements
- Delete confirmation dialog
- Clear warning about irreversibility
- Display certification details before deletion
- Cancel option prominent
- Mobile-responsive dialog

---

### UC-VD-034: View Certification Status Dashboard

**Primary Actor**: Compliance Officer, Vendor Manager
**Priority**: High
**Frequency**: Daily (5-20 views/day)
**Related FR**: FR-VD-002

#### Preconditions
- User is authenticated with Compliance Officer or Vendor Manager role
- User has permission to view certifications
- User has access to the vendor(s)

#### Main Flow
1. User navigates to vendor profile
2. User clicks on "Certifications" tab
3. System displays certification dashboard:
   - Summary statistics at top:
     * Total certifications count
     * Active certifications (green badge)
     * Expiring soon certifications (yellow badge)
     * Expired certifications (red badge)
   - Certification list below with columns:
     * Type
     * Certificate Number
     * Issuing Authority
     * Issue Date
     * Expiry Date
     * Status (badge: active/expiring_soon/expired/pending)
     * Actions (View, Edit, Delete)
4. System auto-highlights certifications by status:
   - Active: Default display
   - Expiring Soon: Yellow background, sorted first
   - Expired: Red background, flagged
5. User can filter by status using status badges
6. User can click certification row to expand details
7. System displays:
   - Full certification details
   - Associated document (if any)
   - Audit history for certification
8. User can download certificate document

#### Postconditions
- **Success**: Certification dashboard displayed
- **Success**: Status indicators correctly calculated
- **Success**: Expired/expiring certifications prominently displayed

#### Alternate Flows

**AF-001: Filter by Status**
- At step 5, user clicks status badge:
  - System filters list to selected status
  - System updates count display
  - User can clear filter to see all

**AF-002: View Document**
- At step 8, user clicks "View Document":
  - System opens document in new tab/modal
  - System supports PDF viewer, image display

**AF-003: Export Certification Report**
- User clicks "Export" button:
  - System generates certification report
  - System downloads as Excel/PDF
  - Report includes all certifications with status

**AF-004: Set Expiry Reminder**
- User clicks "Set Reminder" on certification:
  - System displays reminder options (30, 60, 90 days)
  - User selects reminder timeframe
  - System creates reminder notification
  - User receives notification before expiry

#### Exception Flows

**EF-001: No Certifications**
- At step 3, if vendor has no certifications:
  - System displays empty state
  - Message: "No certifications recorded for this vendor"
  - Action button: "Add Certification"

**EF-002: Multiple Expired Certifications**
- At step 3, if multiple certifications expired:
  - System displays compliance alert banner
  - Message: "This vendor has [X] expired certifications"
  - Links to each expired certification
  - Recommendation to contact vendor for renewals

#### Business Rules Applied
- BR-VD-007: Status auto-calculated based on 30-day threshold
- Expiring soon certifications shown prominently
- Compliance alerts for vendors with expired required certifications
- Status refreshed on each page load

#### UI Requirements
- Summary statistics with status badges
- List view with sortable columns
- Color-coded status indicators
- Expandable rows for details
- Document preview/download
- Export functionality
- Mobile-responsive dashboard

---

### UC-VD-035: Add Vendor Address (Asian Format)

**Primary Actor**: Vendor Manager
**Priority**: High
**Frequency**: Weekly (10-20 addresses/week)
**Related FR**: FR-VD-003

#### Preconditions
- User is authenticated with Vendor Manager role
- User has permission to manage vendor addresses
- Vendor exists in system
- User has access to the vendor

#### Main Flow
1. User navigates to vendor profile
2. User clicks on "Addresses" tab
3. System displays address list with primary indicator
4. User clicks "Add Address" button
5. System displays Add Address dialog with Asian International Format:
   - Address Type (dropdown, required):
     * Billing
     * Shipping
     * Remittance
     * Office
     * Warehouse
   - Address Line 1 (text, required) - Street address, building name
   - Address Line 2 (text, optional) - Floor, unit, suite number
   - Sub-District (text, optional) - Tambon (Thailand), Kelurahan (Indonesia)
   - District (text, optional) - Amphoe (Thailand), Kecamatan (Indonesia)
   - City (text, required) - Main city/town name
   - Province/State (text, required) - State/Province/Region
   - Postal Code (text, required) - ZIP/Postal code
   - Country (dropdown, required) - 15 supported countries:
     * Thailand
     * Singapore
     * Malaysia
     * Indonesia
     * Vietnam
     * Philippines
     * Myanmar
     * Cambodia
     * Laos
     * Brunei
     * China
     * Japan
     * South Korea
     * India
     * United States
   - Set as Primary Address (checkbox)
6. User fills in address details
7. System dynamically adjusts field labels based on country:
   - Thailand: Province → "Province (จังหวัด)", District → "District (อำเภอ)", Sub-District → "Sub-District (ตำบล)"
   - Indonesia: Province → "Province (Provinsi)", District → "Kabupaten/Kota", Sub-District → "Kecamatan"
   - Other countries: Standard labels
8. User marks as primary if this is the main address
9. User clicks "Add Address"
10. System validates required fields
11. System validates postal code format for selected country
12. If marked as primary:
    - System updates existing primary address to non-primary
    - System sets new address as primary
13. System saves address to database
14. System closes dialog
15. System refreshes address list with new entry
16. System displays success message: "Address added successfully"
17. System logs action in audit trail

#### Postconditions
- **Success**: Address record created in database
- **Success**: Primary flag correctly set
- **Success**: Previous primary updated if needed
- **Success**: Audit trail entry created

#### Alternate Flows

**AF-001: First Address Auto-Primary**
- At step 5, if vendor has no addresses:
  - System auto-checks "Set as Primary"
  - Checkbox disabled with tooltip: "First address is automatically set as primary"
  - Continue to step 6

**AF-002: Country Change Updates Labels**
- At step 6, when user changes country:
  - System updates field labels for region-specific terminology
  - System adjusts postal code validation pattern
  - System shows/hides sub-district/district based on country norms
  - Continue to step 7

**AF-003: Add Another Address**
- After step 16, user clicks "Add Another":
  - System resets form
  - User can add additional address
  - Repeat from step 5

#### Exception Flows

**EF-001: Invalid Postal Code Format**
- At step 11, if postal code format invalid for country:
  - System highlights postal code field
  - System displays error with expected format:
    * Thailand: "5 digits (e.g., 10110)"
    * Malaysia: "5 digits (e.g., 50450)"
    * Indonesia: "5 digits (e.g., 12345)"
    * Singapore: "6 digits (e.g., 123456)"
  - User corrects postal code
  - Continue to step 11

**EF-002: Maximum Addresses Reached**
- At step 4, if vendor has 10 addresses:
  - System displays warning: "Maximum addresses reached (10)"
  - System suggests: "Delete an existing address to add a new one"
  - Button disabled
  - End use case

**EF-003: Required Field Missing**
- At step 10, if required field is empty:
  - System highlights missing field
  - System displays error message
  - User completes field
  - Continue to step 10

**EF-004: Primary Address Conflict**
- At step 12, if changing primary:
  - System prompts: "This will change the primary address from [current] to [new]. Continue?"
  - If "Yes": System updates primary designation
  - If "No": System unchecks primary checkbox

#### Business Rules Applied
- BR-VD-009: One primary address required per type (billing, shipping, etc.)
- BR-VD-010: Maximum 10 addresses per vendor
- Asian International Address format with sub-district and district fields
- Country-specific postal code validation
- First address automatically becomes primary

#### UI Requirements
- Modal dialog for add address
- Country dropdown with 15 options
- Dynamic field labels based on country
- Postal code format validation with hints
- Primary address checkbox with confirmation
- Mobile-responsive form layout
- Address preview before saving

---

### UC-VD-036: Edit Vendor Address

**Primary Actor**: Vendor Manager
**Priority**: High
**Frequency**: Weekly (5-10 edits/week)
**Related FR**: FR-VD-003

#### Preconditions
- User is authenticated with Vendor Manager role
- User has permission to manage vendor addresses
- Address exists for the vendor
- User has access to the vendor

#### Main Flow
1. User navigates to vendor profile
2. User clicks on "Addresses" tab
3. System displays address list
4. User locates address to edit
5. User clicks "Edit" button on address card
6. System displays Edit Address dialog with pre-filled form:
   - All address fields from original entry
   - Current primary status
7. User modifies address details
8. User optionally changes primary designation
9. User clicks "Save Changes"
10. System validates modified fields
11. System validates postal code format
12. If primary status changed:
    - System updates primary designations accordingly
13. System updates address record
14. System closes dialog
15. System refreshes address list
16. System displays success message: "Address updated successfully"
17. System logs change in audit trail with before/after values

#### Postconditions
- **Success**: Address record updated in database
- **Success**: Primary designation correctly managed
- **Success**: Audit trail entry created with changes

#### Alternate Flows

**AF-001: Change Country**
- At step 7, user changes country:
  - System prompts: "Changing country may require updating address format"
  - System updates field labels
  - System resets postal code validation
  - User updates address format as needed
  - Continue to step 9

**AF-002: Make Primary**
- At step 8, user marks as primary:
  - System shows warning: "This will change the primary address"
  - System shows current primary for comparison
  - User confirms
  - Continue to step 9

#### Exception Flows

**EF-001: Cannot Edit Primary Designation (Only Address)**
- At step 8, if this is the only address:
  - System disables primary checkbox
  - Tooltip: "This is the only address and must remain primary"
  - Continue to step 9

**EF-002: Concurrent Edit Conflict**
- At step 13, if another user modified same address:
  - System displays conflict warning
  - User options: "Override" or "Cancel"
  - Proceed based on selection

#### Business Rules Applied
- BR-VD-009: Primary address designation managed
- Country-specific validation applied
- Changes logged with full detail

#### UI Requirements
- Modal dialog for edit address
- Pre-filled form with current values
- Visual indication of changed fields
- Primary checkbox with confirmation
- Mobile-responsive edit form

---

### UC-VD-037: Delete Vendor Address

**Primary Actor**: Vendor Manager
**Priority**: Medium
**Frequency**: Monthly (2-5 deletions/month)
**Related FR**: FR-VD-003

#### Preconditions
- User is authenticated with Vendor Manager role
- User has permission to manage vendor addresses
- Address exists for the vendor
- Address is not the only address for the vendor
- User has access to the vendor

#### Main Flow
1. User navigates to vendor profile
2. User clicks on "Addresses" tab
3. System displays address list
4. User locates address to delete
5. User clicks "Delete" button on address card
6. System checks if address can be deleted:
   - Not the only address
   - Not primary (or another primary exists)
7. System displays Delete Confirmation dialog:
   - Title: "Delete Address"
   - Message: "Are you sure you want to delete this address?"
   - Address details preview
   - Warning: "This action cannot be undone."
8. User clicks "Delete" button
9. System marks address as deleted (soft delete)
10. System removes address from display
11. System closes dialog
12. System displays success message: "Address deleted successfully"
13. System logs deletion in audit trail

#### Postconditions
- **Success**: Address soft-deleted
- **Success**: Address removed from active list
- **Success**: Primary designation managed if needed
- **Success**: Audit trail entry created

#### Alternate Flows

**AF-001: Cancel Deletion**
- At step 8, user clicks "Cancel":
  - System closes dialog
  - No changes made
  - End use case

#### Exception Flows

**EF-001: Cannot Delete Only Address**
- At step 6, if this is the only address:
  - System displays error: "Cannot delete the only address. Vendor must have at least one address."
  - Delete button disabled
  - End use case

**EF-002: Cannot Delete Primary Address Directly**
- At step 6, if address is primary and other addresses exist:
  - System displays error: "Cannot delete the primary address. Please designate another address as primary first."
  - Suggestion: "Edit another address and mark it as primary"
  - End use case

**EF-003: Address Referenced in Active Documents**
- At step 6, if address is referenced in active POs/invoices:
  - System displays warning: "This address is referenced in [X] active documents"
  - System shows document list
  - User options: "Delete Anyway" or "Cancel"
  - If "Delete Anyway": System soft deletes, documents retain reference
  - If "Cancel": End use case

#### Business Rules Applied
- BR-VD-010: Vendor must have at least one address
- BR-VD-009: Cannot delete primary address directly
- Soft delete - records retained for historical references
- Referenced addresses retained in documents

#### UI Requirements
- Delete confirmation dialog
- Clear warning about implications
- Display address details before deletion
- Disabled delete for protected addresses
- Mobile-responsive dialog

---

### UC-VD-038: Set Primary Address

**Primary Actor**: Vendor Manager
**Priority**: High
**Frequency**: Monthly (5-10 changes/month)
**Related FR**: FR-VD-003

#### Preconditions
- User is authenticated with Vendor Manager role
- User has permission to manage vendor addresses
- Vendor has multiple addresses
- User has access to the vendor

#### Main Flow
1. User navigates to vendor profile
2. User clicks on "Addresses" tab
3. System displays address list with primary indicator
4. User identifies address to set as primary
5. User clicks "Set as Primary" action on address card
6. System displays confirmation dialog:
   - Title: "Change Primary Address"
   - Message: "Set this address as the primary address?"
   - Current primary: [address preview]
   - New primary: [address preview]
7. User clicks "Confirm"
8. System updates previous primary address:
   - Sets isPrimary to false
9. System updates selected address:
   - Sets isPrimary to true
10. System saves changes to database
11. System refreshes address list
12. System displays updated primary indicator
13. System displays success message: "Primary address updated"
14. System logs change in audit trail

#### Postconditions
- **Success**: Primary address designation transferred
- **Success**: Only one primary address per vendor
- **Success**: Audit trail entry created

#### Alternate Flows

**AF-001: Quick Set Primary (Drag)**
- At step 5, user drags address to top of list:
  - System recognizes drag gesture
  - System prompts confirmation
  - Continue to step 7

**AF-002: Cancel Change**
- At step 7, user clicks "Cancel":
  - System closes dialog
  - No changes made
  - End use case

#### Exception Flows

**EF-001: Already Primary**
- At step 5, if address is already primary:
  - "Set as Primary" action disabled or hidden
  - Tooltip: "This address is already primary"
  - End use case

**EF-002: Concurrent Change**
- At step 10, if another user changed primary:
  - System displays warning: "Primary address was changed by another user"
  - System shows current state
  - User can retry or cancel

#### Business Rules Applied
- BR-VD-009: Only one primary address per vendor
- Primary transfer is atomic (one transaction)
- Historical primary designation tracked in audit trail

#### UI Requirements
- Clear primary indicator (badge, icon, or star)
- "Set as Primary" action visible on non-primary addresses
- Confirmation dialog with before/after comparison
- Visual feedback on primary change
- Mobile-responsive interface

---

## 5. Use Case Dependencies

### 5.1 Dependency Matrix

| Use Case | Depends On | Enables |
|----------|-----------|---------|
| UC-VD-001: Create Vendor | - | UC-VD-002, UC-VD-010, UC-VD-013, UC-VD-016, UC-VD-031, UC-VD-035 |
| UC-VD-002: Edit Vendor | UC-VD-001 | UC-VD-016 |
| UC-VD-007: Search Vendors | UC-VD-001 | UC-VD-002, UC-VD-003, UC-VD-022 |
| UC-VD-010: Add Contact | UC-VD-001 | UC-VD-011, UC-VD-016 |
| UC-VD-013: Upload Document | UC-VD-001 | UC-VD-014, UC-VD-016 |
| UC-VD-016: Submit for Approval | UC-VD-001, UC-VD-010, UC-VD-013 | UC-VD-017 |
| UC-VD-017: Approve Vendor | UC-VD-016 | UC-VD-030 |
| UC-VD-019: Track Performance | UC-VD-017, transactions | UC-VD-020, UC-VD-021 |
| UC-VD-022: Block Vendor | UC-VD-017 | - |
| UC-VD-030: PO Integration | UC-VD-017 | UC-VD-019 |
| UC-VD-031: Add Certification | UC-VD-001 | UC-VD-032, UC-VD-033, UC-VD-034 |
| UC-VD-032: Edit Certification | UC-VD-031 | UC-VD-034 |
| UC-VD-033: Delete Certification | UC-VD-031 | - |
| UC-VD-034: View Certification Dashboard | UC-VD-001 | UC-VD-031 |
| UC-VD-035: Add Address (Asian Format) | UC-VD-001 | UC-VD-036, UC-VD-037, UC-VD-038 |
| UC-VD-036: Edit Address | UC-VD-035 | UC-VD-038 |
| UC-VD-037: Delete Address | UC-VD-035 | - |
| UC-VD-038: Set Primary Address | UC-VD-035 | - |

---

## 6. Success Metrics

### 6.1 Use Case Performance Targets

| Use Case | Target Time | Target Success Rate |
|----------|-------------|-------------------|
| UC-VD-001: Create Vendor | <2 minutes | >95% |
| UC-VD-002: Edit Vendor | <1 minute | >98% |
| UC-VD-007: Search Vendors | <1 second | >99% |
| UC-VD-010: Add Contact | <1 minute | >98% |
| UC-VD-013: Upload Document | <30 seconds | >95% |
| UC-VD-016: Submit for Approval | <5 minutes | >90% |
| UC-VD-017: Approve Vendor | <10 minutes | >85% |
| UC-VD-022: Block Vendor | <3 minutes | >95% |
| UC-VD-031: Add Certification | <1 minute | >98% |
| UC-VD-032: Edit Certification | <1 minute | >98% |
| UC-VD-033: Delete Certification | <30 seconds | >99% |
| UC-VD-034: View Certification Dashboard | <1 second | >99% |
| UC-VD-035: Add Address (Asian Format) | <1 minute | >98% |
| UC-VD-036: Edit Address | <1 minute | >98% |
| UC-VD-037: Delete Address | <30 seconds | >99% |
| UC-VD-038: Set Primary Address | <30 seconds | >99% |

### 6.2 User Satisfaction Targets
- Overall satisfaction: >4.0/5.0
- Ease of use: >4.2/5.0
- Time savings: >30% vs. manual process
- Error reduction: >50% fewer duplicate entries

---

## Related Documents
- BR-vendor-directory.md - Business Requirements (v2.2.0)
- TS-vendor-directory.md - Technical Specification (v2.2.0)
- DD-vendor-directory.md - Data Dictionary (v2.2.0)
- FD-vendor-directory.md - Flow Diagrams (v2.2.0)
- VAL-vendor-directory.md - Validations

---

**End of Use Cases Document**
