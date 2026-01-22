# Requests for Pricing (Price Collection Campaigns) - Validations (VAL)

## Document Information
- **Document Type**: Validations Document
- **Module**: Vendor Management > Requests for Pricing
- **Version**: 3.0.0
- **Last Updated**: 2026-01-15
- **Document Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2026-01-15 | Documentation Team | Synced with current code; Updated priority enum to include 'normal'; Added tags validation; Updated vendor status values; Updated escalation rules structure |
| 2.0.0 | 2025-11-26 | System | Complete rewrite to match BR v2.0.0 and actual code; Removed fictional RFQ validations (bid dates, evaluation criteria, award processes); Updated to reflect Price Collection Campaign functionality |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

**Note**: This document defines validation rules for the Price Collection Campaign system as implemented in the actual code.

---

## 1. Introduction

This document defines all validation rules, error messages, and data integrity constraints for the Requests for Pricing module. It includes field-level validations, business rule validations, and form validation specifications for the Price Collection Campaign system.

---

## 2. Field-Level Validations

### 2.1 Campaign Basic Information

#### Campaign Name
**Field**: `name`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Campaign name is required" |
| Length | 3-200 characters | "Campaign name must be 3-200 characters" |
| Format | Letters, numbers, spaces, and common punctuation | "Campaign name contains invalid characters" |

#### Campaign Description
**Field**: `description`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Campaign description is required" |
| Length | 10-5000 characters | "Description must be 10-5000 characters" |
| Format | Plain text | "Description cannot contain script tags or malicious code" |

#### Priority Level
**Field**: `priority`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select priority | "Priority is required" |
| Valid | Must be one of: low, normal, medium, high, urgent | "Invalid priority level" |
| Default | Defaults to "normal" if not specified | N/A |

#### Campaign Tags
**Field**: `tags`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty array | N/A |
| Type | Must be array of strings | "Tags must be an array of strings" |
| Item Length | Each tag 1-50 characters | "Each tag must be 1-50 characters" |
| Max Items | Maximum 10 tags | "Maximum 10 tags allowed" |

### 2.2 Campaign Schedule Validations

#### Scheduled Start Date
**Field**: `scheduledStart`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide start date | "Start date is required" |
| Format | Valid date | "Invalid date format" |
| Range | Cannot be in the past (for new campaigns) | "Start date cannot be in the past" |

#### Scheduled End Date
**Field**: `scheduledEnd`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | Valid date if provided | "Invalid date format" |
| Consistency | Must be after start date if provided | "End date must be after start date" |

### 2.3 Template Selection Validations

#### Template
**Field**: `template`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select a template | "Template is required" |
| Valid | Template must exist in system | "Selected template not found" |
| Single | Exactly one template must be selected | "Please select exactly one template" |

### 2.4 Vendor Selection Validations

#### Selected Vendors
**Field**: `selectedVendors`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select at least one vendor | "At least one vendor must be selected" |
| Array | Must be array of vendor IDs | "Invalid vendor selection format" |
| Valid | All vendor IDs must exist in system | "One or more selected vendors not found" |
| Status | Recommended to select active vendors only | "Warning: Some selected vendors are not active" |

---

## 3. Campaign Settings Validations

### 3.1 Portal Access Duration
**Field**: `settings.portalAccessDuration`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide duration | "Portal access duration is required" |
| Type | Must be positive integer | "Duration must be a positive number" |
| Range | 1-365 days | "Duration must be between 1 and 365 days" |
| Default | Defaults to 30 days | N/A |

### 3.2 Submission Methods
**Field**: `settings.allowedSubmissionMethods`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select at least one method | "At least one submission method is required" |
| Valid | Must be from: manual, upload | "Invalid submission method" |
| Array | Must be array of strings | "Invalid submission methods format" |
| Default | Defaults to ['manual', 'upload'] | N/A |

### 3.3 Require Approval
**Field**: `settings.requireApproval`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Type | Must be boolean | "Require approval must be true or false" |
| Default | Defaults to false | N/A |

### 3.4 Auto Reminders
**Field**: `settings.autoReminders`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Type | Must be boolean | "Auto reminders must be true or false" |
| Default | Defaults to true | N/A |

### 3.5 Reminder Schedule
**Field**: `settings.reminderSchedule`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Conditional | Required if autoReminders is true | "Reminder schedule required when auto reminders enabled" |
| Structure | Must have enabled, intervals, escalation fields | "Invalid reminder schedule structure" |

#### Reminder Schedule - Enabled
**Field**: `settings.reminderSchedule.enabled`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Type | Must be boolean | "Enabled must be true or false" |

#### Reminder Schedule - Intervals
**Field**: `settings.reminderSchedule.intervals`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Type | Must be array of positive integers | "Intervals must be array of positive numbers" |
| Order | Should be in descending order (days before deadline) | "Reminder intervals should be in descending order" |
| Range | Each value 1-90 days | "Interval values must be between 1 and 90 days" |
| Default | Defaults to [7, 3, 1] | N/A |

#### Reminder Schedule - Escalation
**Field**: `settings.reminderSchedule.escalation`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Type | Must be object with enabled, overdueThreshold, recipients | "Invalid escalation structure" |

#### Escalation - Overdue Threshold
**Field**: `settings.reminderSchedule.escalation.overdueThreshold`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Conditional | Required if escalation.enabled is true | "Overdue threshold required when escalation enabled" |
| Type | Must be positive integer | "Threshold must be a positive number" |
| Range | 1-30 days | "Threshold must be between 1 and 30 days" |

#### Escalation - Recipients
**Field**: `settings.reminderSchedule.escalation.recipients`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Conditional | Required if escalation.enabled is true | "Recipients required when escalation enabled" |
| Type | Must be array of email strings | "Recipients must be array of email addresses" |
| Format | Each email must be valid | "Invalid email format in recipients" |

### 3.6 Email Template
**Field**: `settings.emailTemplate`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Max 100 characters if provided | "Email template name must not exceed 100 characters" |

### 3.7 Custom Instructions
**Field**: `settings.customInstructions`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Max 2000 characters if provided | "Custom instructions must not exceed 2000 characters" |

---

## 4. Recurring Pattern Validations

### 4.1 Frequency
**Field**: `recurringPattern.frequency`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Required if campaign type is recurring | "Frequency is required for recurring campaigns" |
| Valid | Must be one of: weekly, monthly, quarterly, annually | "Invalid frequency value" |

### 4.2 Interval
**Field**: `recurringPattern.interval`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Required if frequency provided | "Interval is required" |
| Type | Must be positive integer | "Interval must be a positive number" |
| Range | 1-12 based on frequency | "Interval must be between 1 and 12" |

### 4.3 Days of Week
**Field**: `recurringPattern.daysOfWeek`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Conditional | Required if frequency is weekly | "Days of week required for weekly pattern" |
| Type | Must be array of integers | "Days of week must be array of numbers" |
| Range | Each value 0-6 (0=Sunday) | "Day values must be between 0 and 6" |

### 4.4 Day of Month
**Field**: `recurringPattern.dayOfMonth`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Conditional | Required if frequency is monthly, quarterly, or annually | "Day of month required for this pattern" |
| Type | Must be positive integer | "Day of month must be a positive number" |
| Range | 1-31 | "Day of month must be between 1 and 31" |

### 4.5 Month of Year
**Field**: `recurringPattern.monthOfYear`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Conditional | Required if frequency is annually | "Month of year required for annual pattern" |
| Type | Must be positive integer | "Month must be a positive number" |
| Range | 1-12 | "Month must be between 1 and 12" |

### 4.6 End Date
**Field**: `recurringPattern.endDate`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | Valid date if provided | "Invalid date format" |
| Consistency | Must be after campaign start date | "Pattern end date must be after start date" |

### 4.7 Max Occurrences
**Field**: `recurringPattern.maxOccurrences`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive integer if provided | "Max occurrences must be a positive number" |
| Range | 1-100 | "Max occurrences must be between 1 and 100" |

---

## 5. Campaign Status Validations

### 5.1 Status Values

| Status | Valid Transitions From | Description |
|--------|----------------------|-------------|
| draft | (initial state) | Campaign created but not launched |
| active | draft, paused | Campaign is live, accepting submissions |
| paused | active | Campaign temporarily suspended |
| completed | active | Campaign finished successfully |
| cancelled | draft, active, paused | Campaign terminated |

### 5.2 Status Transition Rules

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-STS-001 | draft can only transition to active or cancelled | "Draft campaigns can only be launched or cancelled" |
| VAL-STS-002 | active can transition to paused, completed, or cancelled | "Active campaigns can be paused, completed, or cancelled" |
| VAL-STS-003 | paused can only transition to active or cancelled | "Paused campaigns can only be resumed or cancelled" |
| VAL-STS-004 | completed is a final state | "Completed campaigns cannot change status" |
| VAL-STS-005 | cancelled is a final state | "Cancelled campaigns cannot change status" |

---

## 6. Campaign Type Validations

### 6.1 Campaign Type
**Field**: `campaignType`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select campaign type | "Campaign type is required" |
| Valid | Must be one of: one-time, recurring, event-based | "Invalid campaign type" |

### 6.2 Type-Specific Requirements

| Type | Required Fields | Validation |
|------|----------------|------------|
| one-time | scheduledStart, scheduledEnd (recommended) | Standard date validations |
| recurring | scheduledStart, recurringPattern | Pattern must be fully configured |
| event-based | scheduledStart | Event trigger configuration (future) |

---

## 7. Business Rule Validations

### 7.1 Campaign Creation Rules

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-CAM-001 | Campaign name is required | "Campaign name is required" |
| VAL-CAM-002 | Campaign description is required | "Campaign description is required" |
| VAL-CAM-003 | Start date must be provided | "Start date is required" |
| VAL-CAM-004 | End date must be after start date | "End date must be after start date" |
| VAL-CAM-005 | At least one vendor must be selected | "At least one vendor must be selected" |
| VAL-CAM-006 | Template must be selected | "Template is required" |
| VAL-CAM-007 | Priority must be valid value | "Invalid priority value" |

### 7.2 Campaign Edit Rules

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-EDT-001 | Only draft campaigns can be edited | "Only draft campaigns can be edited" |
| VAL-EDT-002 | Campaign name cannot be empty after edit | "Campaign name cannot be empty" |
| VAL-EDT-003 | Vendor selection cannot be empty after edit | "At least one vendor must remain selected" |

### 7.3 Campaign Action Rules

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-ACT-001 | Cannot send reminder to completed vendor | "Cannot send reminder to vendor who completed submission" |
| VAL-ACT-002 | Cannot delete active campaign without cancelling first | "Cancel campaign before deleting" |
| VAL-ACT-003 | Duplicate campaign inherits settings from source | N/A (informational) |

---

## 8. Progress Metrics Validations

### 8.1 Progress Object
**Field**: `progress`

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| totalVendors | number | >= 0, integer | Total invited vendors |
| invitedVendors | number | >= 0, <= totalVendors | Vendors who received invitation |
| respondedVendors | number | >= 0, <= invitedVendors | Vendors who accessed portal |
| completedSubmissions | number | >= 0, <= respondedVendors | Completed submissions |
| pendingSubmissions | number | >= 0 | In-progress submissions |
| failedSubmissions | number | >= 0 | Failed submissions |
| completionRate | number | 0-100 | Percentage completed |
| responseRate | number | 0-100 | Percentage responded |
| averageResponseTime | number | >= 0 | Average response time in hours |

### 8.2 Metric Calculation Rules

| Metric | Calculation | Validation |
|--------|-------------|------------|
| completionRate | (completedSubmissions / totalVendors) × 100 | Result must be 0-100 |
| responseRate | (respondedVendors / totalVendors) × 100 | Result must be 0-100 |

---

## 9. Vendor Status Validations

### 9.1 Vendor Status in Campaign
**Field**: `vendorStatus`

| Status | Description | Valid Transitions |
|--------|-------------|-------------------|
| pending | Invitation not yet sent | invited |
| invited | Invitation sent, awaiting access | accessed |
| accessed | Portal accessed | in_progress |
| in_progress | Vendor started submission | completed, overdue |
| completed | Submission completed | (final state) |
| overdue | Past deadline without completion | completed, failed |
| failed | Submission failed | (final state) |

### 9.2 Vendor Status Rules

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-VND-001 | New vendors start with pending status | N/A |
| VAL-VND-002 | Reminder can only be sent to pending, invited, accessed, or in_progress | "Cannot send reminder to completed vendor" |
| VAL-VND-003 | Completed status is final | "Cannot change status of completed vendor" |
| VAL-VND-004 | Failed status is final | "Cannot change status of failed vendor" |
| VAL-VND-005 | Overdue can transition to completed or failed | N/A |

---

## 10. Form Validation by Wizard Step

### 10.1 Step 1 - Basic Information

| Field | Required | Validation Rule |
|-------|----------|-----------------|
| name | Yes | 3-200 characters |
| description | Yes | 10-5000 characters |
| priority | Yes | Valid enum value |
| scheduledStart | Yes | Valid date, not in past |
| scheduledEnd | No | Valid date, after start date |

### 10.2 Step 2 - Template Selection

| Field | Required | Validation Rule |
|-------|----------|-----------------|
| template | Yes | Must select exactly one |

### 10.3 Step 3 - Vendor Selection

| Field | Required | Validation Rule |
|-------|----------|-----------------|
| selectedVendors | Yes | At least one vendor |

### 10.4 Step 4 - Review

| Validation | Rule |
|------------|------|
| All steps complete | Steps 1-3 must pass validation |
| Data integrity | All selected vendors and template must exist |

---

## 11. Error Message Standards

### 11.1 Message Format

- **Required Field**: "{Field name} is required"
- **Invalid Format**: "{Field name} has invalid format"
- **Out of Range**: "{Field name} must be between {min} and {max}"
- **Invalid Value**: "Invalid {field name} value"
- **Consistency**: "{Field1} must be {relationship} {Field2}"

### 11.2 Error Display

| Location | Error Type | Display Method |
|----------|------------|----------------|
| Form field | Validation error | Inline error below field |
| Form level | Cross-field error | Error summary at top |
| Action | Business rule error | Toast notification |
| Navigation | Incomplete step | Step indicator warning |

---

## 12. Related Documents
- [BR-requests-for-pricing.md](./BR-requests-for-pricing.md) - Business Requirements v2.0.0
- [DD-requests-for-pricing.md](./DD-requests-for-pricing.md) - Data Definition
- [FD-requests-for-pricing.md](./FD-requests-for-pricing.md) - Flow Diagrams
- [TS-requests-for-pricing.md](./TS-requests-for-pricing.md) - Technical Specification
- [UC-requests-for-pricing.md](./UC-requests-for-pricing.md) - Use Cases

---

**End of Validations Document**
