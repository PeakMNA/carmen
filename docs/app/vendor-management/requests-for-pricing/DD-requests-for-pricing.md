# Data Definition: Requests for Pricing (Price Collection Campaigns)

## Module Information
- **Module**: Vendor Management
- **Sub-module**: Requests for Pricing (Price Collection Campaigns)
- **Version**: 3.0.0
- **Status**: Active
- **Last Updated**: 2026-01-15

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2026-01-15 | Documentation Team | Synced with current code; Updated CampaignVendorStatus with full interface including portal fields; Added CampaignAnalytics and CampaignDuplicationRequest interfaces; Updated ReminderSchedule escalationRules structure; Added tags field; Updated priority to include 'normal' |
| 2.0.0 | 2025-11-26 | System | Complete rewrite to match BR v2.0.0 and actual code implementation; Removed fictional RFQ features (evaluation scoring, awards, contracts); Updated to reflect Price Collection Campaign functionality |
| 1.2.0 | 2025-11-18 | Documentation Team | Updated Change Request reference |
| 1.1.0 | 2025-11-17 | Documentation Team | Previous version with RFQ features |
| 1.0.0 | 2025-11-15 | Documentation Team | Initial DD document |

**Note**: This document describes data structures for the Price Collection Campaign system as implemented in the actual code.

---

## Overview

The Requests for Pricing module manages campaign-based price collection from vendors. Campaigns are created from pricelist templates, vendors are invited to submit pricing, and submission progress is tracked. This module focuses on collecting pricing information rather than competitive bidding or award processes.

### Key Features
- Campaign creation from pricelist templates
- Multi-vendor invitation and selection
- Submission progress tracking
- Recurring campaign scheduling
- Reminder and escalation management
- Campaign settings configuration

---

## Entity Relationship Overview

```
PricelistTemplate (1) ──── (N) PriceCollectionCampaign
PriceCollectionCampaign (1) ──── (N) CampaignVendorInvitation
Vendor (1) ──── (N) CampaignVendorInvitation
```

---

## Core Entities

### 1. PriceCollectionCampaign

**Purpose**: Stores campaign header information including template reference, schedule, settings, and progress tracking.

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | string (UUID) | PRIMARY KEY | Unique identifier |
| `name` | string | NOT NULL | Campaign name |
| `description` | string | | Campaign description |
| `status` | enum | NOT NULL | draft, active, paused, completed, cancelled |
| `campaignType` | enum | NOT NULL | one-time, recurring, event-based |
| `selectedVendors` | string[] | NOT NULL | Array of vendor IDs |
| `selectedCategories` | string[] | | Array of category names |
| `scheduledStart` | Date | NOT NULL | Campaign start date |
| `scheduledEnd` | Date | | Campaign end date (optional) |
| `recurringPattern` | object | | Recurring schedule configuration |
| `progress` | object | NOT NULL | Progress metrics |
| `settings` | object | NOT NULL | Campaign settings |
| `template` | object | | Associated pricelist template |
| `createdBy` | string | NOT NULL | Creator email/ID |
| `createdAt` | Date | DEFAULT now() | Creation timestamp |
| `updatedAt` | Date | DEFAULT now() | Last update timestamp |

#### Status Values

| Status | Description | Color Code |
|--------|-------------|------------|
| `draft` | Campaign created but not launched | Gray |
| `active` | Campaign is live, accepting submissions | Green |
| `paused` | Campaign temporarily suspended | Yellow |
| `completed` | Campaign finished successfully | Blue |
| `cancelled` | Campaign terminated | Red |

#### Campaign Type Values

| Type | Description |
|------|-------------|
| `one-time` | Single pricing collection event |
| `recurring` | Repeated at scheduled intervals |
| `event-based` | Triggered by specific events |

#### Business Rules
1. **Timeline**: `scheduledEnd` must be after `scheduledStart` when provided
2. **Status Transitions**: draft → active → paused ↔ active → completed/cancelled
3. **Vendor Selection**: At least one vendor must be selected
4. **Template Requirement**: Campaign must have associated template

---

### 2. CampaignProgress

**Purpose**: Tracks campaign progress metrics embedded in PriceCollectionCampaign.

#### Fields

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `totalVendors` | number | Total invited vendors |
| `invitedVendors` | number | Vendors who received invitation |
| `respondedVendors` | number | Vendors who accessed portal |
| `completedSubmissions` | number | Completed submissions |
| `pendingSubmissions` | number | In-progress submissions |
| `failedSubmissions` | number | Failed submissions |
| `completionRate` | number | Percentage completed (0-100) |
| `responseRate` | number | Percentage responded (0-100) |
| `averageResponseTime` | number | Average response time in hours |
| `lastUpdated` | Date | Last metrics update timestamp |

#### Calculation Rules
- **Completion Rate**: `(completedSubmissions / totalVendors) × 100`
- **Response Rate**: `(respondedVendors / totalVendors) × 100`

---

### 3. CampaignSettings

**Purpose**: Stores campaign configuration settings embedded in PriceCollectionCampaign.

#### Fields

| Field Name | Data Type | Default | Description |
|-----------|-----------|---------|-------------|
| `portalAccessDuration` | number | 30 | Days vendor can access portal |
| `allowedSubmissionMethods` | string[] | ['manual', 'upload'] | Submission methods |
| `requireApproval` | boolean | false | Require manager approval |
| `autoReminders` | boolean | true | Enable automatic reminders |
| `reminderSchedule` | object | | Reminder configuration |
| `emailTemplate` | string | | Email template name |
| `customInstructions` | string | | Additional vendor instructions |
| `priority` | enum | 'medium' | low, normal, medium, high, urgent |

#### Reminder Schedule Structure

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `enabled` | boolean | Enable/disable reminders |
| `intervals` | number[] | Days before deadline (e.g., [14, 7, 3, 1]) |
| `escalationRules` | array | Array of escalation rules |

#### Escalation Rules Structure

Each escalation rule in the `escalationRules` array:

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `daysOverdue` | number | Days overdue before this rule triggers |
| `escalateTo` | string[] | Escalation recipient emails |
| `messageTemplate` | string | Template for escalation message |

---

### 4. RecurringPattern

**Purpose**: Defines recurring campaign schedule embedded in PriceCollectionCampaign.

#### Fields

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `frequency` | enum | weekly, monthly, quarterly, annually |
| `interval` | number | Interval between occurrences |
| `endDate` | Date | Pattern end date (optional) |
| `maxOccurrences` | number | Maximum occurrences (optional) |
| `daysOfWeek` | number[] | Days for weekly pattern (0-6, 0=Sunday) |
| `dayOfMonth` | number | Day for monthly pattern (1-31) |
| `monthOfYear` | number | Month for annual pattern (1-12) |

#### Frequency Options

| Frequency | Description | Configuration Fields |
|-----------|-------------|---------------------|
| `weekly` | Every N weeks | daysOfWeek required |
| `monthly` | Every N months | dayOfMonth required |
| `quarterly` | Every N quarters | dayOfMonth required |
| `annually` | Every N years | dayOfMonth, monthOfYear required |

---

### 5. CampaignVendorStatus

**Purpose**: Tracks individual vendor status within a campaign.

#### Fields

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `vendorId` | string | Vendor identifier |
| `vendorName` | string | Vendor display name |
| `email` | string | Vendor email address |
| `status` | enum | pending, invited, accessed, in_progress, completed, overdue, failed |
| `invitationSent` | Date | When invitation was sent (optional) |
| `portalAccessed` | Date | When portal was first accessed (optional) |
| `lastActivity` | Date | Last vendor activity timestamp (optional) |
| `submissionCompleted` | Date | When submission was completed (optional) |
| `itemsSubmitted` | number | Number of items submitted |
| `totalItemsExpected` | number | Total items expected |
| `completionRate` | number | Completion percentage (0-100) |
| `portalToken` | string | Unique portal access token (optional) |
| `portalUrl` | string | Direct portal URL for vendor (optional) |
| `remindersSent` | number | Count of reminders sent |
| `lastReminderSent` | Date | Last reminder timestamp (optional) |

#### Vendor Status Values

| Status | Description |
|--------|-------------|
| `pending` | Invitation not yet sent |
| `invited` | Invitation sent, awaiting portal access |
| `accessed` | Vendor has accessed the portal |
| `in_progress` | Vendor has started submission |
| `completed` | Submission completed |
| `overdue` | Submission past deadline |
| `failed` | Submission failed |

---

### 6. CampaignAnalytics

**Purpose**: Provides comprehensive analytics data for campaign performance tracking.

#### Overview Fields

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `campaignId` | string | Campaign identifier |
| `totalVendors` | number | Total vendors in campaign |
| `responseRate` | number | Percentage of vendors who responded |
| `completionRate` | number | Percentage of completed submissions |
| `averageResponseTime` | number | Average response time in hours |
| `totalSubmissions` | number | Total number of submissions |
| `qualityScore` | number | Overall quality score |

#### Vendor Performance Array

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `vendorId` | string | Vendor identifier |
| `vendorName` | string | Vendor display name |
| `responseTime` | number | Response time in hours |
| `completionRate` | number | Completion percentage |
| `qualityScore` | number | Vendor quality score |
| `submissionCount` | number | Number of submissions |

#### Timeline Metrics Array

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `date` | Date | Metric date |
| `invitationsSent` | number | Invitations sent on date |
| `portalAccesses` | number | Portal accesses on date |
| `submissionsReceived` | number | Submissions received on date |
| `completions` | number | Completions on date |

#### Issues and Alerts Array

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `type` | enum | overdue, non_responsive, quality_issue, technical_error |
| `description` | string | Issue description |
| `vendorId` | string | Related vendor ID (optional) |
| `severity` | enum | low, medium, high |
| `createdAt` | Date | Issue creation timestamp |

---

### 7. CampaignDuplicationRequest

**Purpose**: Defines the request structure for duplicating campaigns.

#### Fields

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `sourceCampaignId` | string | ID of campaign to duplicate |
| `newName` | string | Name for the duplicated campaign |
| `newDescription` | string | Description for duplicated campaign (optional) |
| `preserveVendors` | boolean | Whether to copy vendor selections |
| `preserveCategories` | boolean | Whether to copy category selections |
| `preserveSettings` | boolean | Whether to copy campaign settings |
| `newScheduledStart` | Date | New start date (optional) |

---

### 8. CampaignValidationResult

**Purpose**: Response structure for campaign validation.

#### Fields

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `isValid` | boolean | Whether campaign is valid |
| `errors` | array | Array of validation errors |
| `warnings` | array | Array of validation warnings |

#### Error/Warning Structure

| Field Name | Data Type | Description |
|-----------|-----------|-------------|
| `field` | string | Field name with error |
| `message` | string | Error/warning message |
| `severity` | enum | error, warning |
| `suggestion` | string | Suggested fix (warnings only) |

---

## Data Validation Rules

### Campaign Header Validation

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-CAM-001 | `name` is required and non-empty | "Campaign name is required" |
| VAL-CAM-002 | `description` is required | "Campaign description is required" |
| VAL-CAM-003 | `scheduledStart` must be provided | "Start date is required" |
| VAL-CAM-004 | `scheduledEnd > scheduledStart` when end date provided | "End date must be after start date" |
| VAL-CAM-005 | `selectedVendors.length >= 1` | "At least one vendor must be selected" |
| VAL-CAM-006 | `template` must be selected | "Template is required" |
| VAL-CAM-007 | `priority` must be valid enum value | "Invalid priority value" |

### Status Transition Validation

| Rule ID | Current Status | Allowed Transitions |
|---------|----------------|---------------------|
| VAL-STS-001 | draft | active, cancelled |
| VAL-STS-002 | active | paused, completed, cancelled |
| VAL-STS-003 | paused | active, cancelled |
| VAL-STS-004 | completed | (none - final state) |
| VAL-STS-005 | cancelled | (none - final state) |

### Settings Validation

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-SET-001 | `portalAccessDuration > 0` | "Portal access duration must be positive" |
| VAL-SET-002 | `reminderSchedule.intervals` in descending order | "Reminder intervals must be in descending order" |
| VAL-SET-003 | `escalation.overdueThreshold > 0` when enabled | "Overdue threshold must be positive" |

---

## Integration Points

### 1. Pricelist Template Integration
- **Direction**: Inbound
- **Purpose**: Campaigns created from templates
- **Key Fields**: `template.id`, `template.name`
- **Process**: Template selected during campaign creation (Step 2)

### 2. Vendor Directory Integration
- **Direction**: Inbound
- **Purpose**: Select vendors to invite
- **Key Fields**: `selectedVendors`, vendor search/filter
- **Process**: Vendors selected during campaign creation (Step 3)

### 3. Campaign List Navigation
- **Entry Points**:
  - Sidebar: Vendor Management > Requests for Pricing
  - Direct URL: `/vendor-management/campaigns`
  - Template link: `/vendor-management/campaigns/new?templateId={id}`

---

## Campaign Lifecycle

### State Machine

```
           ┌──────────┐
           │  DRAFT   │
           └────┬─────┘
                │ launch
                ▼
           ┌──────────┐
     ┌─────│  ACTIVE  │─────┐
     │     └────┬─────┘     │
pause│          │           │cancel
     │          │complete   │
     ▼          ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│  PAUSED  │ │COMPLETED │ │CANCELLED │
└────┬─────┘ └──────────┘ └──────────┘
     │ resume
     └───────►┌──────────┐
              │  ACTIVE  │
              └──────────┘
```

### Status Descriptions

**DRAFT**:
- Campaign created but not launched
- All fields can be edited
- No invitations sent

**ACTIVE**:
- Campaign is live
- Invitations sent to vendors
- Accepting submissions
- Limited editing (cannot change vendors/template)

**PAUSED**:
- Campaign temporarily suspended
- No reminders sent
- Can be resumed

**COMPLETED**:
- Campaign finished successfully
- Read-only state
- Progress metrics finalized

**CANCELLED**:
- Campaign terminated
- Read-only state
- May occur from any state

---

## UI Data Mapping

### Campaign List Page
- **Route**: `/vendor-management/campaigns`
- **Data Source**: Array of PriceCollectionCampaign
- **Display Fields**: name, status, description, scheduledStart, progress

### Campaign Create Page
- **Route**: `/vendor-management/campaigns/new`
- **Step 1**: name, description, priority, scheduledStart, scheduledEnd
- **Step 2**: template selection from available templates
- **Step 3**: vendor selection with search/filter
- **Step 4**: Review all selections, launch campaign

### Campaign Detail Page
- **Route**: `/vendor-management/campaigns/[id]`
- **Overview Tab**: Campaign details, performance summary
- **Vendors Tab**: Vendor list with individual status and actions
- **Settings Tab**: Campaign configuration display

---

## Performance Considerations

### Indexing Recommendations
1. **Campaign Status**: Index on `status` for filtering
2. **Timeline**: Composite index on `scheduledStart, scheduledEnd`
3. **Creator**: Index on `createdBy` for user-specific queries

### Query Patterns

**Active Campaigns**:
```
Filter: status = 'active' AND scheduledEnd > now()
Sort: scheduledEnd ASC (soonest deadline first)
```

**User's Campaigns**:
```
Filter: createdBy = currentUser
Sort: createdAt DESC (most recent first)
```

**Campaign Progress**:
```
Aggregation: Calculate completionRate and responseRate
Update: On each vendor submission
```

---

## Security & Access Control

### Role-Based Access

| Role | Permissions |
|------|-------------|
| Procurement Staff | Create, edit drafts, view all, invite vendors, send reminders |
| Procurement Manager | All staff permissions + delete, approve, modify active |

### Data Access Rules
- Campaigns visible based on user's department/location context
- Vendor pricing data confidential
- Progress metrics visible to campaign creators and managers

---

## Sample Data Structure

### Campaign Example

```json
{
  "id": "camp-001",
  "name": "Q1 2025 Kitchen Supplies Pricing",
  "description": "Quarterly pricing collection for kitchen supplies",
  "status": "active",
  "campaignType": "recurring",
  "selectedVendors": ['vendor-001', 'vendor-002', 'vendor-003'],
  "selectedCategories": ['Kitchen Equipment', 'Utensils'],
  "scheduledStart": "2025-01-01T00:00:00Z",
  "scheduledEnd": "2025-01-15T23:59:59Z",
  "recurringPattern": {
    "frequency": "quarterly",
    "interval": 1,
    "dayOfMonth": 1
  },
  "progress": {
    "totalVendors": 3,
    "invitedVendors": 3,
    "respondedVendors": 2,
    "completedSubmissions": 1,
    "pendingSubmissions": 1,
    "failedSubmissions": 0,
    "completionRate": 33,
    "responseRate": 67,
    "averageResponseTime": 48,
    "lastUpdated": "2025-01-10T14:30:00Z"
  },
  "settings": {
    "portalAccessDuration": 30,
    "allowedSubmissionMethods": ['manual', 'upload'],
    "requireApproval": false,
    "autoReminders": true,
    "reminderSchedule": {
      "enabled": true,
      "intervals": [7, 3, 1],
      "escalation": {
        "enabled": true,
        "overdueThreshold": 3,
        "recipients": ['manager@example.com']
      }
    },
    "priority": "medium"
  },
  "template": {
    "id": "template-001",
    "name": "Kitchen Supplies Template"
  },
  "createdBy": "user@example.com",
  "createdAt": "2024-12-20T10:00:00Z",
  "updatedAt": "2025-01-10T14:30:00Z"
}
```

---

## Related Documents
- [BR-requests-for-pricing.md](./BR-requests-for-pricing.md) - Business Requirements v2.0.0
- [FD-requests-for-pricing.md](./FD-requests-for-pricing.md) - Flow Diagrams
- [TS-requests-for-pricing.md](./TS-requests-for-pricing.md) - Technical Specification
- [UC-requests-for-pricing.md](./UC-requests-for-pricing.md) - Use Cases
- [VAL-requests-for-pricing.md](./VAL-requests-for-pricing.md) - Validations

---

**End of Data Definition Document**
