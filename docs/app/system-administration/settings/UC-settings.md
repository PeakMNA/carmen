# Settings - Use Cases (UC)

**Module**: System Administration - Settings
**Version**: 1.0
**Last Updated**: 2026-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

This document describes detailed use cases for the Settings module, covering company settings, security configuration, application settings, notification management, and user preferences.

---

## 2. Company Settings Use Cases

### UC-SET-001: Configure Company Information

**Actor**: System Administrator

**Preconditions**:
- User is authenticated with administrator role
- User has permission to modify company settings

**Main Flow**:
1. User navigates to System Administration → Settings
2. System displays Settings dashboard with six main categories
3. User clicks "Configure Company" on Company Settings card
4. System navigates to Company Settings page
5. System loads current company settings from database/mock data
6. System displays three tabs: General Information, Branding, Operational Settings
7. User selects "General Information" tab
8. System displays company information form with current values
9. User updates company name to "Hospitality Solutions Inc"
10. User updates legal name to "Hospitality Solutions Incorporated"
11. User updates tax ID to "12-3456789"
12. User updates street address, city, state, postal code, country
13. User updates phone and email contact information
14. User updates website URL to "https://hospitalitysolutions.com"
15. User clicks "Save Changes" button
16. System validates all fields
17. System saves updated company settings
18. System creates audit log entry
19. System displays success toast: "Settings Saved - Company settings have been updated successfully"
20. System refreshes settings data
21. Updated company name appears in application header and branding

**Alternative Flows**:
A1: **Validation Failure**
- At step 16, if validation fails:
  - System displays field-specific error messages
  - System highlights invalid fields
  - User corrects invalid data
  - Flow returns to step 16

A2: **Switch to Branding Tab**
- At step 7, user selects "Branding" tab instead:
  - System displays logo and brand color settings
  - User uploads logo URL
  - User uploads dark mode logo URL
  - User uploads favicon URL
  - User selects primary color using color picker
  - User selects secondary color using color picker
  - Flow continues from step 15

A3: **Switch to Operational Settings Tab**
- At step 7, user selects "Operational Settings" tab instead:
  - System displays regional defaults and operating hours
  - User selects default currency (USD)
  - User selects default timezone (America/New_York)
  - User selects default language (English)
  - User sets fiscal year start to "01-01"
  - User configures operating hours for each day
  - User enables multi-location support toggle
  - User enables multi-department support toggle
  - Flow continues from step 15

**Exception Flows**:
E1: **Insufficient Permissions**
- At step 3, if user lacks administrator role:
  - System displays error: "Insufficient permissions to modify company settings"
  - Flow ends

E2: **Concurrent Update Conflict**
- At step 17, if another user updated settings:
  - System displays warning: "Settings were modified by another user"
  - System shows current values
  - User reviews changes and decides to proceed or cancel
  - If proceed, user re-enters desired values
  - Flow returns to step 15

**Postconditions**:
- Company settings updated in database
- Audit log entry created
- Changes reflected across application
- Application header shows updated company name
- Email notifications use updated company information

**Business Rules**:
- Company name required, 3-100 characters
- Email must be valid format
- Website must be valid URL format
- Hex color codes must be 6 characters with # prefix
- Operating hours must be in HH:mm format
- Only administrators can modify company settings
- All changes logged to audit trail

**UI Components**:
- CompanySettingsPage with Tabs component
- Form inputs with validation
- Color pickers for brand colors
- Time inputs for operating hours
- Toggle switches for multi-location/department features
- Save button with confirmation

**Acceptance Criteria**:
- User can update all company information fields
- Validation prevents invalid data
- Changes save successfully and persist
- Audit log captures all modifications
- Success confirmation displayed
- Updated values immediately reflected

---

### UC-SET-002: Configure Security Policies

**Actor**: System Administrator

**Preconditions**:
- User authenticated with administrator role
- User has security configuration permissions

**Main Flow**:
1. User navigates to System Administration → Settings
2. User clicks "Configure Security" on Security Settings card
3. System displays Security Settings page with multiple sections
4. **Password Policy Configuration**:
   - User sets minimum password length to 12 characters
   - User enables require uppercase checkbox
   - User enables require lowercase checkbox
   - User enables require numbers checkbox
   - User enables require special characters checkbox
   - User sets password expiry to 90 days
   - User sets prevent reuse to 5 previous passwords
5. **Session Management**:
   - User sets session timeout to 30 minutes
   - User sets maximum concurrent sessions to 3
   - User enables "Remember Me" functionality
   - User sets Remember Me duration to 7 days
6. **Two-Factor Authentication**:
   - User enables 2FA globally
   - User selects "Required for specific roles"
   - User selects roles: Financial Manager, Purchasing Manager
   - User selects allowed methods: Authenticator App, Email
   - User sets grace period to 7 days
7. **Login Security**:
   - User sets max failed attempts to 5
   - User sets lockout duration to 15 minutes
   - User enables admin notification on lockout
8. User clicks "Save Security Settings"
9. System validates all policy values
10. System displays confirmation dialog: "Security policy changes will affect all users. Continue?"
11. User confirms
12. System saves security settings
13. System creates audit log entry
14. System notifies all users of security policy changes via email
15. System displays success message
16. New password policy applies to next password changes
17. Session timeout applies to new sessions
18. 2FA requirement applies after grace period

**Alternative Flows**:
A1: **Configure IP Access Control**
- After step 3, user configures IP access:
  - User enables IP access control
  - User adds IP addresses to whitelist
  - User adds IP ranges in CIDR format
  - System validates IP format
  - Flow continues from step 8

A2: **Configure Audit Logging**
- After step 3, user configures audit settings:
  - User enables audit logging
  - User selects events to log (all selected by default)
  - User sets retention period to 365 days
  - Flow continues from step 8

**Exception Flows**:
E1: **Invalid Policy Values**
- At step 9, if validation fails:
  - System displays specific errors
  - System highlights invalid fields
  - User corrects values
  - Flow returns to step 9

E2: **User Cancels Confirmation**
- At step 11, if user clicks "Cancel":
  - System discards changes
  - Settings remain unchanged
  - Flow ends

**Postconditions**:
- Security policies updated and active
- All users notified of policy changes
- Audit log entry created
- New policies enforced for future operations
- Admin dashboard shows updated security status

**Business Rules**:
- Password length 6-128 characters
- Session timeout 5-480 minutes
- Password expiry 0-365 days (0 = never)
- Prevent reuse 0-24 passwords
- Max concurrent sessions 1-10
- Grace period 0-30 days
- IP addresses must be valid format
- Security changes require confirmation
- Critical changes notify all administrators

---

## 3. Notification Settings Use Cases

### UC-SET-003: Configure Email Templates

**Actor**: System Administrator

**Preconditions**:
- User authenticated with administrator role
- At least one notification event type exists

**Main Flow**:
1. User navigates to System Administration → Settings
2. User clicks "Configure Notifications"
3. System displays Notification Settings page
4. User selects "Email Templates" tab
5. System displays list of email templates grouped by event type
6. User clicks "Edit" on "Purchase Request Approved" template
7. System opens email template editor
8. System displays current template with:
   - Event Type: Purchase Request Approved
   - Language: English
   - Subject: "Purchase Request #{{requestNumber}} Approved"
   - HTML Template with rich text editor
   - Text Template for plain text email
   - Available Variables list
9. User updates subject to "Great News! PR #{{requestNumber}} Approved"
10. User updates HTML template body
11. User inserts variable {{approverName}} into template
12. User clicks "Preview" button
13. System displays preview with sample data
14. User reviews preview
15. User clicks "Save Template"
16. System validates template:
    - All variables used exist in event context
    - HTML is well-formed
    - Subject not empty
17. System increments template version number
18. System saves updated template
19. System creates audit log entry
20. System displays success message
21. Updated template used for future notifications

**Alternative Flows**:
A1: **Create New Template**
- At step 6, user clicks "Create Template":
  - System displays template creation form
  - User selects event type
  - User selects language
  - User enters subject
  - User enters HTML and text templates
  - Flow continues from step 15

A2: **Test Template**
- At step 14, user clicks "Send Test":
  - System displays test email dialog
  - User enters recipient email address
  - User clicks "Send"
  - System generates email with sample data
  - System sends test email
  - System displays confirmation: "Test email sent"
  - User checks email inbox
  - Flow returns to step 14

A3: **Deactivate Template**
- At step 7, user clicks "Deactivate":
  - System confirms deactivation
  - System sets template isActive to false
  - System falls back to default template
  - Flow ends

**Exception Flows**:
E1: **Invalid Template Variables**
- At step 16, if template uses undefined variables:
  - System displays error: "Variable {{undefinedVar}} not available for this event type"
  - System highlights invalid variable
  - User removes or corrects variable
  - Flow returns to step 15

E2: **Malformed HTML**
- At step 16, if HTML is invalid:
  - System displays HTML validation errors
  - User corrects HTML
  - Flow returns to step 15

**Postconditions**:
- Email template updated and versioned
- Template active for future notifications
- Audit log entry created
- Preview validates template functionality

**Business Rules**:
- Template subject required, max 200 characters
- HTML and text templates both required
- Variables must exist in event context
- HTML must be valid and safe (XSS prevention)
- Template version increments on each save
- Only one active template per event type per language
- Deactivated templates fall back to system default

**UI Components**:
- Email template editor with rich text
- Variable insertion dropdown
- Preview modal with sample data
- Test email dialog
- Version history display

---

### UC-SET-004: Configure Notification Routing Rules

**Actor**: System Administrator

**Preconditions**:
- User authenticated with administrator role
- Email templates configured
- Users and roles exist in system

**Main Flow**:
1. User navigates to Notification Settings
2. User selects "Routing Rules" tab
3. System displays list of existing routing rules
4. User clicks "Create Routing Rule"
5. System displays routing rule creation form
6. User enters rule details:
   - Name: "High-Value Purchase Requests"
   - Event Type: Purchase Request Submitted
   - Priority: 10 (highest)
7. User adds first condition:
   - Field: "documentValue"
   - Operator: "greaterThan"
   - Value: 50000
8. User clicks "Add Condition"
9. User adds second condition with AND operator:
   - Logical Operator: AND
   - Field: "urgency"
   - Operator: "equals"
   - Value: "high"
10. User configures routing action:
    - Action Type: "notify"
    - Recipient Type: "role"
    - Recipient: "Financial Manager"
    - Channels: Email, In-App, SMS
11. User adds escalation action:
    - Action Type: "escalate"
    - Delay: 60 minutes
    - Recipient Type: "role"
    - Recipient: "CFO"
    - Channels: Email, SMS
12. User enables the rule
13. User clicks "Save Rule"
14. System validates rule configuration
15. System saves routing rule
16. System creates audit log entry
17. System displays success message
18. Rule becomes active immediately
19. Future matching events trigger notifications per rule

**Alternative Flows**:
A1: **Edit Existing Rule**
- At step 4, user clicks "Edit" on existing rule:
  - System loads rule details
  - User modifies conditions or actions
  - Flow continues from step 13

A2: **Test Routing Rule**
- At step 12, user clicks "Test Rule":
  - System displays test dialog
  - User enters sample event data
  - System evaluates rule conditions
  - System displays matched/not matched result
  - If matched, system shows which actions would trigger
  - User reviews test results
  - Flow returns to step 12

**Exception Flows**:
E1: **Invalid Condition Value**
- At step 14, if condition value invalid:
  - System displays error: "Value must be numeric for greaterThan operator"
  - User corrects value
  - Flow returns to step 13

E2: **Conflicting Rules**
- At step 14, if rule conflicts with higher priority rule:
  - System displays warning: "This rule may conflict with 'Critical Requests' rule"
  - User reviews conflict
  - User adjusts priority or conditions
  - Flow returns to step 13

**Postconditions**:
- Routing rule created and active
- Rule evaluated for matching events
- Notifications routed per rule configuration
- Audit log entry created

**Business Rules**:
- Rule name unique, 3-100 characters
- Priority 1-100 (higher = evaluated first)
- At least one condition required
- At least one action required
- Recipient must exist in system
- Escalation delay must be positive
- Rules evaluated by priority order
- Multiple rules can match same event
- Disabled rules not evaluated

---

## 4. User Preference Use Cases

### UC-SET-005: Customize Display Preferences

**Actor**: Any Authenticated User

**Preconditions**:
- User authenticated
- User preferences record exists or will be created

**Main Flow**:
1. User clicks avatar menu in application header
2. User selects "User Preferences"
3. System navigates to User Preferences page
4. System loads user's current preferences or creates default
5. User selects "Display" tab
6. System displays display preferences:
   - Theme: System (light/dark based on OS)
   - Font Size: Medium
   - High Contrast: Disabled
   - Compact Mode: Disabled
   - Show Animations: Enabled
   - Sidebar Collapsed: No
7. User changes theme to "Dark"
8. System immediately applies dark theme to UI
9. User increases font size to "Large"
10. System immediately increases all text sizes
11. User enables "Compact Mode"
12. System reduces spacing and padding in lists
13. User clicks "Save Preferences"
14. System saves user preferences to database
15. System displays success toast
16. Preferences persist across sessions

**Alternative Flows**:
A1: **Configure Regional Preferences**
- At step 5, user selects "Regional" tab:
  - User changes language to Spanish
  - System reloads UI in Spanish
  - User changes timezone to "Europe/Madrid"
  - User changes currency to EUR
  - User changes date format to "DD/MM/YYYY"
  - User changes time format to 24h
  - User changes first day of week to Monday
  - Flow continues from step 13

A2: **Configure Notification Preferences**
- At step 5, user selects "Notifications" tab:
  - User views list of notification event types
  - User clicks "Purchase Request Approved" event
  - User disables email channel
  - User enables SMS channel
  - User sets frequency to "Daily" instead of instant
  - User configures Do Not Disturb hours (22:00-08:00)
  - User enables email digest (daily at 09:00)
  - Flow continues from step 13

**Exception Flows**:
E1: **Save Failure**
- At step 14, if save fails:
  - System displays error message
  - System retains form values
  - User clicks "Save" again
  - If failure persists, system suggests refreshing page

**Postconditions**:
- User preferences saved and active
- UI reflects preference changes immediately
- Preferences persist across browser sessions
- Preferences apply across all devices for user

**Business Rules**:
- Preferences user-specific
- Display changes apply immediately
- Regional changes may require page reload
- Notification preferences override system defaults
- Accessibility settings affect UI rendering
- Invalid preferences reset to defaults

---

## 5. Application Settings Use Cases

### UC-SET-006: Configure Backup Settings

**Actor**: System Administrator

**Preconditions**:
- User authenticated with administrator role
- Storage location configured and accessible

**Main Flow**:
1. User navigates to System Administration → Settings
2. User clicks "Configure Application"
3. System displays Application Settings page
4. User selects "Backup & Data" section
5. System displays current backup configuration
6. User enables automated backups
7. User selects backup frequency: "Daily"
8. User sets backup time to "02:00" (2 AM)
9. User configures retention policy:
   - Keep daily backups: 7 days
   - Keep weekly backups: 4 weeks
   - Keep monthly backups: 12 months
10. User selects storage type: "AWS S3"
11. User enters S3 bucket path
12. User enables encryption for backups
13. User enables compression
14. User enables notification on completion
15. User enables notification on failure
16. User clicks "Test Backup Configuration"
17. System validates S3 credentials and access
18. System creates test backup file
19. System displays success: "Test backup completed successfully"
20. User clicks "Save Backup Settings"
21. System saves configuration
22. System schedules backup job for 02:00 daily
23. System displays success message
24. First automated backup runs next scheduled time

**Alternative Flows**:
A1: **Configure Email Settings**
- At step 4, user selects "Email" section:
  - User selects email provider: SMTP
  - User enters SMTP host and port
  - User enters SMTP credentials (encrypted storage)
  - User enters sender email and name
  - User clicks "Test Email Configuration"
  - System sends test email
  - System displays delivery status
  - Flow continues from step 20

A2: **Configure Data Retention**
- At step 4, user selects "Data Retention" section:
  - User sets retention for purchase requests: 2555 days (7 years)
  - User sets retention for invoices: 2555 days (7 years)
  - User sets retention for audit logs: 365 days (1 year)
  - User sets auto-archive after: 365 days
  - User sets delete archived after: 1825 days (5 years)
  - Flow continues from step 20

**Exception Flows**:
E1: **Invalid Storage Credentials**
- At step 17, if S3 credentials invalid:
  - System displays error: "Unable to connect to S3 bucket. Check credentials."
  - User verifies and updates credentials
  - Flow returns to step 16

E2: **Insufficient Storage Space**
- At step 18, if storage space insufficient:
  - System displays warning: "Storage location has limited space available"
  - System estimates space needed for backups
  - User adjusts retention policy or changes storage location
  - Flow returns to step 16

**Postconditions**:
- Backup configuration saved and active
- Backup job scheduled
- Test backup verified functionality
- Administrator notified on backup events
- Automated backups run per schedule

**Business Rules**:
- Backup time in 24-hour format
- Retention periods must be positive integers
- Storage credentials stored encrypted
- Backup files encrypted if encryption enabled
- Test backup required before enabling automated backups
- Failed backups trigger notifications
- Retention policy cannot reduce retention for regulatory documents

---

**Document Control**:
- **Created**: 2026-01-16
- **Version**: 1.0
- **Total Use Cases**: 6 comprehensive use cases
- **Coverage**: All major settings workflows
