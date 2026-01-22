# Requests for Pricing - Business Requirements (BR)

## Document Information
- **Document Type**: Business Requirements Document
- **Module**: Vendor Management > Requests for Pricing
- **Version**: 3.0.0
- **Last Updated**: 2025-01-15
- **Document Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated priority levels to include 'normal'; Added tags field; Updated CampaignVendorStatus with portal fields; Updated ReminderSchedule with escalationRules array structure; Added CampaignAnalytics and CampaignDuplicationRequest references |
| 2.0.0 | 2025-11-25 | System | Complete rewrite to match actual code implementation; Removed fictional RFQ features (bidding, evaluation, negotiation, awards, contracts); Updated to reflect price collection campaign functionality |
| 1.1 | 2025-11-18 | System | Previous version with RFQ features |
| 1.0 | 2024-01-15 | System | Initial creation |

---

## 1. Executive Summary

The Requests for Pricing module provides a campaign-based system to collect pricing information from vendors. This module enables procurement staff to create pricing collection campaigns, select vendors to invite, and track submission progress. It integrates with Pricelist Templates and the Vendor Directory.

### 1.1 Purpose
- Create pricing collection campaigns to gather vendor pricing
- Select and invite multiple vendors to submit pricing
- Track vendor response and submission progress
- Support recurring pricing collection schedules
- Integrate with pricelist templates for structured pricing requests

### 1.2 Scope
**In Scope**:
- Campaign creation and management
- Vendor selection and invitation
- Template-based pricing requests
- Progress tracking and monitoring
- Campaign settings and reminders
- Recurring campaign patterns

**Out of Scope**:
- Competitive bidding evaluation (not implemented)
- Scoring and ranking systems (not implemented)
- Negotiation workflows (not implemented)
- Award decisions and contracts (not implemented)
- Vendor portal submission interface (separate module)
- Purchase order creation (Procurement module)

---

## 2. Functional Requirements

### FR-RFP-001: Campaign List Management
**Priority**: Critical
**Description**: System shall provide a campaign list view with filtering and search capabilities.

**Requirements**:
- Display all pricing campaigns in table or card view
- Filter campaigns by status (active, draft, paused, completed, cancelled)
- Search campaigns by name and description
- Toggle between table view and card view
- Show campaign progress summary (vendors, completion rate)
- Support pagination for large campaign lists

**Business Rules**:
- Default view displays all campaigns sorted by most recent
- Card view shows 3 columns on desktop, 2 on tablet, 1 on mobile
- Search is case-insensitive and matches name/description

**Acceptance Criteria**:
- Campaign list loads in <2 seconds
- Filters update results immediately
- View toggle persists during session
- Empty state shown when no campaigns match filters

---

### FR-RFP-002: Campaign Creation Wizard
**Priority**: Critical
**Description**: System shall provide a 4-step wizard for creating pricing campaigns.

**Requirements**:
- Step 1 - Basic Information:
  - Campaign name (required)
  - Description (required)
  - Priority (low, normal, medium, high, urgent - default: normal)
  - Start date (required)
  - End date (required)
  - Tags (optional, array of strings)
- Step 2 - Template Selection:
  - Select from available pricelist templates
  - Display template details (validity period, currency)
  - Pre-select template if passed via URL parameter
- Step 3 - Vendor Selection:
  - Search vendors by name, email, or company
  - Filter vendors by status (active, inactive, pending)
  - Bulk select/deselect all filtered vendors
  - Display vendor response rate metrics
  - Show selection count summary
- Step 4 - Review & Launch:
  - Display campaign summary
  - Confirm all selections
  - Launch campaign to send invitations

**Business Rules**:
- All fields in Step 1 must be complete to proceed
- At least one template must be selected in Step 2
- At least one vendor must be selected in Step 3
- Campaign cannot be launched without completing all steps

**Acceptance Criteria**:
- Wizard step navigation with progress indicator
- Form validation prevents proceeding with incomplete data
- Template pre-selection works from URL parameter
- Vendor search filters in real-time
- Launch sends invitations to all selected vendors

---

### FR-RFP-003: Campaign Status Management
**Priority**: High
**Description**: System shall support multiple campaign statuses with appropriate transitions.

**Requirements**:
- Support campaign statuses:
  - `draft`: Campaign created but not launched
  - `active`: Campaign is live, accepting submissions
  - `paused`: Campaign temporarily suspended
  - `completed`: Campaign finished successfully
  - `cancelled`: Campaign terminated
- Status badges with color coding:
  - Active: Green
  - Draft: Gray
  - Paused: Yellow
  - Completed: Blue
  - Cancelled: Red

**Business Rules**:
- New campaigns start in `draft` status
- Draft campaigns can be edited freely
- Active campaigns have limited editing options
- Paused campaigns can be resumed
- Completed/cancelled campaigns are read-only

**Acceptance Criteria**:
- Status displayed consistently across list and detail views
- Status transitions logged with timestamp
- Appropriate actions available based on status

---

### FR-RFP-004: Campaign Types
**Priority**: High
**Description**: System shall support different campaign types for various pricing collection needs.

**Requirements**:
- One-time campaigns: Single pricing collection event
- Recurring campaigns: Repeated at scheduled intervals
  - Frequency options: weekly, monthly, quarterly, annually
  - Configurable interval (e.g., every 2 weeks)
  - Optional end date or max occurrences
  - Day of week selection for weekly patterns
  - Day of month for monthly patterns
- Event-based campaigns: Triggered by specific events

**Business Rules**:
- Recurring pattern stored with campaign
- Recurring campaigns auto-create new instances based on pattern
- Each recurring instance tracked independently

**Acceptance Criteria**:
- Campaign type selection in creation wizard
- Recurring pattern configuration options
- Pattern displayed in campaign details

---

### FR-RFP-005: Campaign Detail View
**Priority**: High
**Description**: System shall provide detailed campaign view with tabs for different aspects.

**Requirements**:
- Overview Tab:
  - Campaign details (template, schedule, creator)
  - Performance summary (response rate, avg response time, completion rate)
  - Progress statistics (submissions count)
- Vendors Tab:
  - List of invited vendors
  - Individual vendor status (pending, in progress, completed)
  - Progress bar per vendor
  - Last activity timestamp
  - Send reminder action
- Settings Tab:
  - Portal access duration
  - Submission methods (manual, upload)
  - Approval requirement
  - Auto-reminders configuration
  - Reminder schedule with intervals
  - Escalation rules
  - Email template
  - Custom instructions
  - Priority setting

**Business Rules**:
- Reminder button disabled for completed vendors
- Settings tab shows all configured options
- Performance metrics calculated from progress data

**Acceptance Criteria**:
- Tab navigation with content areas
- Vendor list with status indicators
- Settings displayed read-only in detail view

---

### FR-RFP-006: Campaign Progress Tracking
**Priority**: High
**Description**: System shall track and display campaign progress metrics.

**Requirements**:
- Track the following metrics:
  - Total vendors invited
  - Vendors who responded
  - Completed submissions
  - Pending submissions
  - Failed submissions
  - Completion rate (percentage)
  - Response rate (percentage)
  - Average response time (hours)
- Display progress in:
  - Campaign list cards
  - Campaign detail overview
  - Vendor-level status

**Business Rules**:
- Completion rate = (completedSubmissions / totalVendors) × 100
- Response rate = (respondedVendors / totalVendors) × 100
- Metrics updated when submissions received

**Acceptance Criteria**:
- Progress metrics displayed accurately
- Progress bar visualization for completion
- Metrics refresh on page load

---

### FR-RFP-007: Campaign Settings
**Priority**: Medium
**Description**: System shall support configurable campaign settings.

**Requirements**:
- Portal Access Duration: Number of days vendors can access submission portal
- Submission Methods: Manual entry, file upload, or both
- Require Approval: Flag to require manager approval of submissions
- Auto Reminders: Enable/disable automatic reminder emails
- Reminder Schedule:
  - Enable/disable reminders
  - Interval days before deadline (e.g., 7, 3, 1 days)
  - Escalation rules with overdue thresholds
  - Escalation recipients
- Email Template: Template for invitation emails
- Custom Instructions: Additional instructions for vendors
- Priority: low, normal, medium, high, urgent

**Business Rules**:
- Default portal access duration: 30 days
- Default submission methods: manual and upload
- Reminder intervals in descending order (days before deadline)
- Escalation triggers based on days overdue

**Acceptance Criteria**:
- All settings configurable during creation
- Settings displayed in campaign detail
- Reminder schedule with escalation rules

---

### FR-RFP-008: Campaign Actions
**Priority**: Medium
**Description**: System shall support various actions on campaigns.

**Requirements**:
- View: Navigate to campaign detail page
- Edit: Modify campaign settings (draft campaigns only)
- Duplicate: Create copy of campaign with new name
- Export: Download campaign data
- Mark as Expired: Update campaign status
- Delete: Remove campaign (with confirmation)
- Send Reminder: Send reminder to specific vendor

**Business Rules**:
- Edit available only for draft campaigns
- Delete requires confirmation dialog
- Duplicate copies all settings except status
- Send Reminder disabled for completed vendors

**Acceptance Criteria**:
- Actions available from dropdown menu
- Confirmation dialogs for destructive actions
- Navigation to appropriate pages after action

---

### FR-RFP-009: Campaign Templates Integration
**Priority**: Medium
**Description**: System shall integrate with pricelist templates for structured pricing requests.

**Requirements**:
- Select pricelist template during campaign creation
- Template defines:
  - Validity period
  - Default currency
  - Product categories/items
  - Custom fields
- Template can be pre-selected via URL parameter
- Display template information in campaign details

**Business Rules**:
- Campaign must have exactly one template
- Template cannot be changed after campaign launch
- Template ID passed via `?templateId=` parameter

**Acceptance Criteria**:
- Template selection step in wizard
- Template details displayed when selected
- Pre-selection from URL parameter works

---

### FR-RFP-010: Vendor Selection and Filtering
**Priority**: High
**Description**: System shall provide comprehensive vendor selection capabilities.

**Requirements**:
- Search vendors by:
  - Name
  - Email
  - Company registration number
- Filter vendors by status:
  - All statuses
  - Active
  - Inactive
  - Pending
- Bulk selection:
  - Select all filtered vendors
  - Deselect all vendors
  - Clear selection
- Display vendor metrics:
  - Response rate percentage
  - Status badge
- Selection summary:
  - Count of selected vendors
  - List of selected vendor names

**Business Rules**:
- Search is case-insensitive
- Only filtered vendors affected by bulk select
- Minimum 1 vendor required to proceed

**Acceptance Criteria**:
- Search filters vendor list in real-time
- Status filter works correctly
- Bulk select toggles all filtered vendors
- Selection count updates immediately

---

## 3. Non-Functional Requirements

### 3.1 Performance Requirements
- **Page Load**: Campaign list loads in <2 seconds
- **Search**: Vendor search filters in <500ms
- **Form Submission**: Campaign creation completes in <3 seconds
- **Pagination**: Support 100+ campaigns per page

### 3.2 Usability Requirements
- **Wizard Navigation**: Clear step indicators with progress
- **Form Validation**: Real-time validation with error messages
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: WCAG 2.1 AA compliance

### 3.3 Security Requirements
- **Authentication**: User must be logged in
- **Authorization**: Role-based access to campaigns
- **Data Protection**: Vendor pricing data confidential

---

## 4. Data Model

### 4.1 Campaign Data Definition (PriceCollectionCampaign)

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Campaign name |
| description | string | Campaign description |
| status | enum | draft, active, paused, completed, cancelled |
| campaignType | enum | one-time, recurring, event-based |
| selectedVendors | string[] | Array of vendor IDs |
| selectedCategories | string[] | Array of category names |
| scheduledStart | Date | Start date |
| scheduledEnd | Date | End date (optional) |
| recurringPattern | object | Recurring schedule (optional) |
| progress | object | Progress metrics |
| createdBy | string | Creator email |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |
| settings | object | Campaign settings |
| template | object | Associated template (optional) |

### 4.2 Progress Object (CampaignProgress)

| Field | Type | Description |
|-------|------|-------------|
| totalVendors | number | Total invited vendors |
| invitedVendors | number | Vendors who received invitation |
| respondedVendors | number | Vendors who accessed portal |
| completedSubmissions | number | Completed submissions |
| pendingSubmissions | number | In-progress submissions |
| failedSubmissions | number | Failed submissions |
| completionRate | number | Percentage completed |
| responseRate | number | Percentage responded |
| averageResponseTime | number | Avg response time (hours) |
| lastUpdated | Date | Last metrics update |

### 4.3 Settings Object (CampaignSettings)

| Field | Type | Description |
|-------|------|-------------|
| portalAccessDuration | number | Days vendor can access portal |
| allowedSubmissionMethods | string[] | ['manual', 'upload'] |
| requireApproval | boolean | Require manager approval |
| autoReminders | boolean | Enable auto reminders |
| reminderSchedule | object | Reminder configuration |
| emailTemplate | string | Email template name |
| customInstructions | string | Additional instructions |
| priority | enum | low, normal, medium, high, urgent |
| tags | string[] | Optional campaign tags |

### 4.4 Recurring Pattern Object

| Field | Type | Description |
|-------|------|-------------|
| frequency | enum | weekly, monthly, quarterly, annually |
| interval | number | Interval between occurrences |
| endDate | Date | Pattern end date (optional) |
| maxOccurrences | number | Max occurrences (optional) |
| daysOfWeek | number[] | Days for weekly (0-6) |
| dayOfMonth | number | Day for monthly (1-31) |
| monthOfYear | number | Month for annual (1-12) |

---

## 5. Business Rules Summary

### 5.1 Campaign Creation Rules
- **BR-RFP-001**: Campaign name is required
- **BR-RFP-002**: Campaign description is required
- **BR-RFP-003**: Start date must be provided
- **BR-RFP-004**: End date must be after start date
- **BR-RFP-005**: At least one template must be selected
- **BR-RFP-006**: At least one vendor must be selected

### 5.2 Campaign Status Rules
- **BR-RFP-007**: New campaigns start in draft status
- **BR-RFP-008**: Draft campaigns can be freely edited
- **BR-RFP-009**: Active campaigns have limited editing
- **BR-RFP-010**: Completed/cancelled campaigns are read-only

### 5.3 Vendor Selection Rules
- **BR-RFP-011**: Minimum 1 vendor required to launch
- **BR-RFP-012**: Only active vendors can be invited (recommended)
- **BR-RFP-013**: Vendor selection cannot change after launch

### 5.4 Progress Calculation Rules
- **BR-RFP-014**: Completion rate = completedSubmissions / totalVendors × 100
- **BR-RFP-015**: Response rate = respondedVendors / totalVendors × 100

---

## 6. User Roles and Permissions

### 6.1 Procurement Staff
**Permissions**:
- Create new campaigns
- Edit draft campaigns
- View all campaigns
- Invite vendors
- Send reminders
- Export campaign data
- Duplicate campaigns

### 6.2 Procurement Manager
**Permissions**:
- All Procurement Staff permissions
- Delete campaigns
- Approve submissions (if required)
- Cancel campaigns
- Modify active campaigns

---

## 7. User Interface Specifications

### 7.1 Campaign List Page
**Route**: `/vendor-management/campaigns`

**Layout**:
- Card container with header and content
- Header: Title, description, Export button, Create Template button
- Filters: Search input, status dropdown, saved filters, add filters, view toggle
- Content: Table or Card view based on toggle

**Table Columns**:
- Name (clickable link)
- Status (badge)
- Description (truncated)
- Validity Period
- Created date
- Updated date
- Actions (dropdown menu)

**Card Layout**:
- Name and status badges
- Description (2-line clamp)
- Validity and progress stats
- Created/Updated dates
- Vendor count and completion count

### 7.2 Campaign Creation Page
**Route**: `/vendor-management/campaigns/new`

**Layout**:
- Header with back button and title
- Step indicator (4 steps)
- Step content card
- Navigation buttons (Previous, Next/Launch)

**Steps**:
1. Basic Information form
2. Template selection cards
3. Vendor selection with search/filters
4. Review summary with launch confirmation

### 7.3 Campaign Detail Page
**Route**: `/vendor-management/campaigns/[id]`

**Layout**:
- Card container with header
- Header: Back button, title, status/priority badges, Duplicate/Edit buttons
- Tabs: Overview, Vendors, Settings

**Overview Tab**:
- Campaign Details card (template, schedule, creator)
- Performance Summary card (metrics)

**Vendors Tab**:
- Table with vendor name, status, progress bar, last activity, actions

**Settings Tab**:
- Two-column layout with all settings
- Reminder schedule section (if enabled)

---

## 8. Integration Points

### 8.1 Internal Integrations
- **Vendor Directory**: Access vendor master data for selection
- **Pricelist Templates**: Use templates for structured pricing requests
- **Mock Data**: Uses centralized mock data from lib/mock-data

### 8.2 Navigation Integration
- Entry: Vendor Management > Requests for Pricing
- Template link: Create from pricelist template detail page

---

## 9. Related Documents
- [Pricelist Templates BR](../pricelist-templates/BR-pricelist-templates.md) - Template management
- [Vendor Directory BR](../vendor-directory/BR-vendor-directory.md) - Vendor data
- [UC-requests-for-pricing.md](./UC-requests-for-pricing.md) - Use Cases
- [TS-requests-for-pricing.md](./TS-requests-for-pricing.md) - Technical Specification
- [FD-requests-for-pricing.md](./FD-requests-for-pricing.md) - Flow Diagrams
- [VAL-requests-for-pricing.md](./VAL-requests-for-pricing.md) - Validations

---

**End of Business Requirements Document**
