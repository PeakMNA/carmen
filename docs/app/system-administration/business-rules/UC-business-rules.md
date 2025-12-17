# Business Rules Management - Use Cases (UC)

**Module**: System Administration - Business Rules Management
**Version**: 1.0
**Last Updated**: 2025-01-16
**Status**: Planned Implementation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Use Case Overview

This document describes detailed use cases for the Business Rules Management module, covering rule creation, compliance monitoring, violation management, testing, and analytics.

### Use Case Summary Table

| UC ID | Use Case Name | Actor | Priority | Status |
|-------|---------------|-------|----------|--------|
| UC-BR-001 | Create Business Rule | System Administrator | P0 | Planned |
| UC-BR-002 | Configure Fractional Sales Rule | Operations Manager | P0 | Planned |
| UC-BR-003 | Monitor Food Safety Compliance | Quality Manager | P0 | Planned |
| UC-BR-004 | Manage Compliance Violations | Department Manager | P0 | Planned |
| UC-BR-005 | Execute Corrective Actions | Staff Member | P0 | Planned |
| UC-BR-006 | Test Business Rule | System Administrator | P1 | Planned |
| UC-BR-007 | Analyze Rule Performance | Operations Manager | P1 | Planned |
| UC-BR-008 | Modify Existing Rule | System Administrator | P1 | Planned |
| UC-BR-009 | Deactivate/Reactivate Rule | System Administrator | P1 | Planned |
| UC-BR-010 | Audit Rule Changes | Compliance Officer | P1 | Planned |

---

## 2. Detailed Use Cases

### UC-BR-001: Create Business Rule

**Priority**: P0 (Critical)
**Actor**: System Administrator, Operations Manager
**Description**: Define a new business rule with conditions and actions to automate business process decisions.

#### Preconditions
- User has "business_rules:create" permission
- User is logged in to Carmen system
- Business process to automate is clearly defined

#### Postconditions
- New business rule is created and saved in the system
- Rule status is set to "inactive" (requires activation)
- Audit trail entry created for rule creation
- Rule appears in business rules list

#### Main Flow

1. User navigates to **System Administration → Business Rules**
2. System displays Business Rules Management page with existing rules
3. User clicks **"+ Create Rule"** button
4. System displays Create Business Rule form with empty fields
5. User enters basic information:
   - **Rule Name**: "Pizza Slice Holding Time Limits"
   - **Description**: "Enforces maximum holding time for cut pizza slices to maintain food safety"
   - **Category**: Select "food-safety" from dropdown
   - **Priority**: Select 10 (highest)
6. User clicks **"Add Condition"** button in Conditions section
7. System displays condition configuration panel
8. User configures first condition:
   - **Field**: "item.fractionalSalesType"
   - **Operator**: "equals"
   - **Value**: "pizza-slice"
   - **Logical Operator**: "AND"
9. User clicks **"Add Condition"** again
10. User configures second condition:
    - **Field**: "item.holdingTime"
    - **Operator**: "greaterThan"
    - **Value**: 240 (minutes = 4 hours)
    - **Logical Operator**: null (last condition)
11. User clicks **"Add Action"** button in Actions section
12. System displays action configuration panel
13. User configures first action:
    - **Action Type**: "blockSale"
    - **Parameters**:
      - reason: "Exceeded safe holding time"
      - alertLevel: "critical"
14. User clicks **"Add Action"** again
15. User configures second action:
    - **Action Type**: "notifyManager"
    - **Parameters**:
      - recipient: "kitchen-manager"
      - message: "Pizza slices exceeded safe holding time at {{location}}"
      - urgency: "high"
16. User reviews complete rule configuration
17. User clicks **"Save as Draft"** button
18. System validates rule configuration:
    - All required fields present ✓
    - Conditions reference valid fields ✓
    - Actions have required parameters ✓
19. System saves rule with status="inactive"
20. System creates audit trail entry
21. System displays success message: "Business rule created successfully. Activate the rule to enable enforcement."
22. System returns to Business Rules list showing new rule

#### Alternative Flows

**A1: Save and Activate Immediately**
- At step 17, user clicks **"Save and Activate"** instead
- System performs validation (step 18)
- System prompts for activation confirmation: "This is a critical food safety rule. Activate immediately?"
- User confirms activation
- System saves rule with status="active"
- System begins evaluating rule for new events immediately
- Continues to step 21

**A2: Use Rule Template**
- At step 4, user clicks **"Use Template"** dropdown
- System displays available rule templates by category
- User selects "Food Safety - Holding Time Limits" template
- System pre-fills form with template values:
  - Category: food-safety
  - Priority: 10
  - Common conditions: item type, time threshold
  - Common actions: blockSale, notifyManager
- User customizes template values for specific use case
- Continues to step 16

**A3: Copy from Existing Rule**
- At step 3, user clicks **"⋮"** menu on existing rule
- User selects **"Copy Rule"**
- System opens Create Rule form with copied values
- User modifies rule name: "Pizza Slice Holding Time - Weekend" (from "Pizza Slice Holding Time")
- User adjusts conditions/actions as needed
- Continues to step 16

#### Exception Flows

**E1: Validation Failure - Missing Required Fields**
- At step 18, system detects missing required field (e.g., rule name is empty)
- System displays validation error: "Rule name is required"
- System highlights field in error state
- User corrects error and resubmits
- Returns to step 18

**E2: Validation Failure - Invalid Condition**
- At step 18, system detects invalid condition (e.g., field "item.invalidField" does not exist)
- System displays validation error: "Condition field 'item.invalidField' is not valid. Select from available fields."
- System provides dropdown of valid fields
- User corrects condition and resubmits
- Returns to step 18

**E3: Validation Failure - Action Parameter Missing**
- At step 18, system detects missing required action parameter
- System displays validation error: "Action 'notifyManager' requires parameter 'recipient'"
- User adds missing parameter
- Returns to step 18

**E4: Duplicate Rule Name**
- At step 18, system detects duplicate rule name
- System displays validation error: "A rule with name 'Pizza Slice Holding Time Limits' already exists. Please choose a unique name."
- User modifies rule name: "Pizza Slice Holding Time Limits - Main Kitchen"
- Returns to step 18

#### Business Rules

1. Rule name must be unique within organization (case-insensitive)
2. Rule name must be 3-100 characters
3. At least one condition must be configured
4. At least one action must be configured
5. All conditions must reference valid system fields
6. All actions must have required parameters configured
7. Priority must be between 1-10
8. New rules default to inactive status
9. Critical rules (priority 9-10) require manager approval for activation

#### UI Components

**Create Business Rule Form**:
- **Basic Information Section**:
  - Rule Name (text input, required)
  - Description (textarea, required)
  - Category (dropdown: fractional-sales, food-safety, quality-control, etc.)
  - Priority (number input: 1-10)
  - Status badge (inactive/active, read-only on create)

- **Conditions Section**:
  - Conditions list (empty on create)
  - "Add Condition" button
  - Condition configuration panel (modal or drawer):
    - Field (autocomplete dropdown of available fields)
    - Operator (dropdown: equals, contains, greaterThan, lessThan, between, in, not_equals)
    - Value (context-sensitive input based on field type)
    - Logical Operator (radio: AND/OR, disabled for last condition)

- **Actions Section**:
  - Actions list (empty on create)
  - "Add Action" button
  - Action configuration panel (modal or drawer):
    - Action Type (dropdown: blockSale, requireApproval, notifyManager, etc.)
    - Parameters (dynamic form based on action type)

- **Form Actions**:
  - "Save as Draft" button (saves inactive)
  - "Save and Activate" button (saves active, requires confirmation)
  - "Cancel" button (discard changes, confirm if changes made)

#### Acceptance Criteria

- [ ] User can create new business rule with complete configuration
- [ ] Rule name uniqueness is enforced
- [ ] Condition field autocomplete shows only valid system fields
- [ ] Action parameter form adapts to selected action type
- [ ] Validation errors are clear and actionable
- [ ] Rule is saved with correct status (inactive/active)
- [ ] Audit trail entry is created
- [ ] Success message is displayed
- [ ] User is returned to business rules list

---

### UC-BR-002: Configure Fractional Sales Rule

**Priority**: P0 (Critical)
**Actor**: Operations Manager, Kitchen Manager
**Description**: Create specialized business rule for fractional sales operations with food safety and quality standards.

#### Preconditions
- User has "business_rules:create" permission
- Fractional sales operations are enabled in system
- Recipe mapping for fractional items exists (e.g., pizza as 8 slices)

#### Postconditions
- Fractional sales rule is created with specialized configuration
- Food safety level and quality standards are defined
- Compliance requirements are documented
- Rule enforces fractional sales standards automatically

#### Main Flow

1. User follows UC-BR-001 steps 1-5 to start creating rule
2. User selects **Category**: "fractional-sales"
3. System detects fractional-sales category and displays additional configuration section: **Fractional Sales Configuration**
4. User configures fractional sales settings:
   - **Fractional Type**: Select "pizza-slice" from dropdown
   - **Food Safety Level**: Select "high"
   - **Monitoring Frequency**: Select "hourly"
5. User clicks **"Add Quality Standard"** button
6. System displays quality standard configuration panel
7. User configures quality standard #1:
   - **Standard Name**: "Maximum Holding Time"
   - **Measurement Type**: "time"
   - **Maximum Value**: 240 (minutes)
   - **Unit**: "minutes"
   - **Tolerance Level**: 0% (no tolerance for food safety)
   - **Critical Control**: ✓ (checked)
   - **Monitoring Frequency**: "hourly"
8. User clicks **"Add Quality Standard"** again
9. User configures quality standard #2:
   - **Standard Name**: "Display Temperature"
   - **Measurement Type**: "temperature"
   - **Minimum Value**: 60
   - **Maximum Value**: 65
   - **Unit**: "°C"
   - **Tolerance Level**: 5%
   - **Critical Control**: ✓ (checked)
   - **Monitoring Frequency**: "continuous"
10. User configures conditions:
    - Condition 1: item.fractionalSalesType equals "pizza-slice" AND
    - Condition 2: item.holdingTime greaterThan 240
11. User configures actions:
    - Action 1: blockSale (reason: "Exceeded safe holding time", alertLevel: "critical")
    - Action 2: quarantineItem (location: "waste_area", requirePhoto: true)
    - Action 3: logCompliance (violationType: "food-safety", riskLevel: "critical")
    - Action 4: notifyManager (recipient: "kitchen-manager", urgency: "high")
12. User adds compliance requirements:
    - "FDA Food Code 3-501.19 - Time/Temperature Control"
    - "Local Health Department holding time requirements"
13. User clicks **"Save and Activate"**
14. System validates fractional sales rule configuration
15. System saves rule with specialized fractional sales metadata
16. System displays success message with compliance confirmation
17. Rule begins enforcing fractional sales standards immediately

#### Alternative Flows

**A1: Copy from Standard Template**
- At step 3, user clicks **"Use Standard Template"** button
- System displays fractional sales templates:
  - "Pizza Slice - Holding Time & Temperature"
  - "Cake Slice - Display & Freshness"
  - "Bottle/Glass Service - Temperature & Inventory"
  - "Portion Control - Weight & Appearance"
- User selects "Pizza Slice - Holding Time & Temperature"
- System pre-fills all fractional sales configuration
- User customizes values for their operation
- Continues to step 10

**A2: Configure Multiple Fractional Types**
- At step 4, user wants to create rule for multiple fractional types
- User creates separate rule for each fractional type (pizza-slice, cake-slice)
- Each rule has type-specific quality standards
- Rules share common actions but different conditions

#### Exception Flows

**E1: Conflicting Quality Standards**
- At step 14, system detects conflicting standards (e.g., holding time >240 AND <180)
- System displays validation error: "Quality standards conflict: Maximum holding time cannot be less than minimum holding time"
- User corrects quality standard configuration
- Returns to step 14

**E2: Critical Control Without Monitoring**
- At step 14, system detects critical control point without continuous/hourly monitoring
- System displays warning: "Critical control point 'Display Temperature' should have continuous or hourly monitoring. Currently set to 'daily'."
- User adjusts monitoring frequency to "continuous"
- Returns to step 14

#### Business Rules

1. Fractional sales rules require fractional type selection
2. Food safety level must be defined (high/medium/low)
3. High food safety level requires continuous or hourly monitoring
4. Critical control points require tolerance level ≤10%
5. Quality standards must have minimum OR maximum value (or both)
6. Measurement units must match measurement type
7. Compliance requirements are recommended for food-safety category

#### UI Components

**Fractional Sales Configuration Section** (appears when category = fractional-sales):
- Fractional Type dropdown (pizza-slice, cake-slice, bottle-glass, portion-control, custom)
- Food Safety Level radio buttons (high, medium, low)
- Monitoring Frequency dropdown (continuous, hourly, shift, daily)

**Quality Standards List**:
- Table displaying configured quality standards
- Columns: Standard Name, Measurement, Range, Unit, Tolerance, Critical, Monitoring
- "Add Quality Standard" button
- Edit/Delete actions per standard

**Quality Standard Configuration Panel**:
- Standard Name (text input)
- Measurement Type (dropdown: time, temperature, appearance, weight, size, freshness)
- Minimum Value (number input, optional)
- Maximum Value (number input, optional)
- Unit (text input, context-sensitive to measurement type)
- Tolerance Level % (number input: 0-50)
- Critical Control checkbox
- Monitoring Frequency dropdown

**Compliance Requirements Section**:
- List of compliance references (text)
- "Add Compliance Requirement" button
- Free-text input for regulation/standard references

#### Acceptance Criteria

- [ ] Fractional sales configuration section appears for fractional-sales category
- [ ] Quality standards can be added, edited, and removed
- [ ] Critical control validation enforces appropriate monitoring frequency
- [ ] Food safety level affects default monitoring recommendations
- [ ] Compliance requirements are stored with rule
- [ ] Rule enforces fractional sales standards when active
- [ ] Violations trigger configured actions (blockSale, quarantineItem, etc.)

---

### UC-BR-003: Monitor Food Safety Compliance

**Priority**: P0 (Critical)
**Actor**: Quality Manager, Kitchen Manager, Food Safety Officer
**Description**: Monitor compliance with food safety rules in real-time, view violations, and track corrective actions.

#### Preconditions
- User has "compliance:view" permission
- Food safety rules are active in the system
- Locations have operational activities generating compliance data

#### Postconditions
- User understands current compliance status
- Violations requiring attention are identified
- Corrective action progress is tracked

#### Main Flow

1. User navigates to **System Administration → Business Rules → Compliance Monitoring**
2. System displays Compliance Monitoring dashboard
3. System shows **Compliance Overview** section:
   - **Overall Compliance Score**: 92.5% (Green indicator)
   - **Food Safety Score**: 94.2%
   - **Quality Control Score**: 88.7%
   - **Inventory Compliance**: 95.1%
   - **Total Active Violations**: 12
   - **Critical Violations**: 2 (Red)
   - **Major Violations**: 5 (Orange)
   - **Minor Violations**: 5 (Yellow)
4. User views **Active Violations** tab (default view)
5. System displays violations list sorted by severity (critical first):

   **Critical Violation Example**:
   - **ID**: V-001
   - **Rule**: Pizza Slice Holding Time Limits
   - **Type**: critical
   - **Description**: Pizza slices exceeded safe holding time of 4 hours at Hot Food Station
   - **Location**: Main Kitchen - Hot Food Station
   - **Detected**: 2 hours ago
   - **Status**: acknowledged (orange badge)
   - **Assigned To**: Kitchen Manager
   - **Business Impact**: safety-risk
   - **Estimated Cost**: $45

6. User clicks on violation V-001 to view details
7. System displays **Violation Detail Drawer** with:
   - Complete violation information
   - Timeline of status changes
   - Assigned corrective actions
   - Photo evidence (if available)
   - Related transactions or items

8. User views **Corrective Actions** section:

   **Action 1**:
   - **Action**: Remove expired pizza slices immediately
   - **Responsible**: kitchen-staff
   - **Target Date**: 30 minutes from detection
   - **Status**: in-progress (blue badge)
   - **Evidence Required**: ✓ (photo documentation)
   - **Verification Method**: photo_documentation

   **Action 2**:
   - **Action**: Review and retrain staff on holding time procedures
   - **Responsible**: kitchen-manager
   - **Target Date**: End of shift
   - **Status**: pending (gray badge)
   - **Evidence Required**: ✓ (training log signature)
   - **Verification Method**: training_record

9. User monitors corrective action progress
10. Kitchen staff completes Action 1 and uploads photo evidence
11. System updates Action 1 status to "completed"
12. System notification appears: "Corrective action completed: Remove expired pizza slices"
13. User reviews photo evidence in violation detail drawer
14. User verifies evidence is acceptable
15. User clicks **"Verify Corrective Action"** button for Action 1
16. System marks Action 1 as verified
17. User waits for Action 2 completion
18. Kitchen manager completes training and logs evidence
19. System updates Action 2 status to "completed"
20. User verifies Action 2
21. All corrective actions are completed and verified
22. User clicks **"Resolve Violation"** button
23. System prompts for resolution notes
24. User enters: "All corrective actions completed. Staff retrained on holding time procedures. Implemented hourly holding time checks."
25. System updates violation status to "resolved"
26. System removes violation from active violations list
27. System recalculates compliance score: 94.8% (improved)
28. System displays success message

#### Alternative Flows

**A1: Filter Violations by Location**
- At step 5, user wants to focus on specific location
- User clicks **Location Filter** dropdown
- User selects "Main Kitchen"
- System filters violations to show only Main Kitchen violations
- Violation count updates: 8 violations (was 12 total)
- Continues to step 6

**A2: Filter Violations by Rule Category**
- At step 5, user clicks **Category Filter**
- User selects "food-safety" checkbox
- System filters to show only food safety violations
- Continues to step 6

**A3: Sort Violations by Age**
- At step 5, user clicks **Sort** dropdown
- User selects "Oldest First"
- System re-sorts violations by detection timestamp (oldest at top)
- Highlights overdue violations in red
- Continues to step 6

**A4: Escalate Overdue Violation**
- At step 9, user notices Action 2 is overdue (target date passed)
- System automatically highlights overdue action in red
- User clicks **"Escalate"** button
- System prompts for escalation recipient
- User selects "General Manager"
- System sends escalation notification
- System creates audit entry for escalation

**A5: Bulk Acknowledge Violations**
- At step 5, user wants to acknowledge multiple minor violations at once
- User selects checkboxes for 5 minor violations
- User clicks **"Bulk Acknowledge"** button
- System prompts for acknowledgment note
- User enters note and confirms
- System updates all selected violations to "acknowledged" status
- System creates audit entries for each

#### Exception Flows

**E1: Evidence Upload Fails**
- At step 10, kitchen staff attempts to upload photo but upload fails
- System displays error: "Photo upload failed. Please try again or contact support."
- User retries upload
- If retry fails, user can continue without photo and add note: "Evidence to be submitted manually"
- Returns to step 11

**E2: Insufficient Evidence**
- At step 14, user reviews evidence and finds it insufficient (photo unclear)
- User clicks **"Reject Evidence"** button
- System prompts for rejection reason
- User enters: "Photo does not clearly show disposal of pizza slices. Please provide clearer evidence."
- System updates action status back to "in-progress"
- System sends notification to responsible person requesting better evidence
- Returns to step 9

**E3: Unable to Resolve Violation**
- At step 22, user determines violation cannot be fully resolved (recurring issue)
- User clicks **"Create Follow-up Task"** instead of "Resolve Violation"
- System prompts for task details
- User creates task: "Investigate recurring holding time violations at Hot Food Station"
- System assigns task to operations manager
- Violation remains active with note: "Follow-up investigation in progress"

#### Business Rules

1. Critical violations must be acknowledged within 1 hour of detection
2. Corrective actions for critical violations must have target date ≤24 hours
3. Evidence is required for all critical and major violations
4. Violations cannot be resolved until all corrective actions are completed and verified
5. Overdue corrective actions trigger automatic escalation to manager
6. Compliance score = 100 - (critical×10 + major×5 + minor×2)
7. Resolved violations remain in history for 24 months
8. Auto-close violations after 30 days with status="verified"

#### UI Components

**Compliance Monitoring Dashboard**:

**Header Section**:
- Page title: "Compliance Monitoring"
- Date range selector
- Refresh button (auto-refresh every 5 minutes)

**Overview Metrics Cards**:
- Overall Compliance Score (large percentage, color-coded)
- Food Safety Score (percentage)
- Quality Control Score (percentage)
- Inventory Compliance (percentage)
- Total Active Violations (number badge)
- Critical/Major/Minor breakdown (colored badges)

**Tabs**:
- Active Violations (default)
- Resolved Violations
- Compliance Trends
- Location Performance

**Active Violations Table**:
- Columns: Severity Icon, Violation ID, Rule Name, Description, Location, Age, Status, Assigned To, Actions
- Sortable by all columns
- Color-coded rows by severity (red=critical, orange=major, yellow=minor)
- Checkbox for bulk actions
- Clickable rows to open detail drawer

**Filters & Search**:
- Search box (violation ID, rule name, description)
- Location filter (multi-select dropdown)
- Category filter (checkboxes: food-safety, quality-control, etc.)
- Status filter (checkboxes: open, acknowledged, corrective-action, resolved)
- Severity filter (checkboxes: critical, major, minor, observation)
- Date range filter

**Violation Detail Drawer**:
- Violation header with severity badge and ID
- Violation information section (rule, description, location, timestamp, detected by, business impact, estimated cost)
- Status timeline (visual timeline showing status changes)
- Corrective Actions list (with status badges, progress indicators)
- Evidence section (photos, documents, attachments)
- Related items/transactions (links to inventory items, POS transactions)
- Action buttons: Acknowledge, Resolve, Escalate, Create Follow-up Task, Close Drawer

**Corrective Action Card** (within drawer):
- Action description
- Responsible person (with avatar)
- Target date (color-coded if overdue)
- Status badge
- Evidence required indicator
- Evidence upload button (if pending)
- Evidence preview (if uploaded)
- Verify button (if completed, for manager)

#### Acceptance Criteria

- [ ] Compliance scores are calculated correctly and update in real-time
- [ ] Violations are sorted by severity by default
- [ ] Filters work correctly and can be combined
- [ ] Violation detail drawer shows complete information
- [ ] Corrective actions can be updated with status and evidence
- [ ] Evidence upload works for images and documents
- [ ] Evidence can be verified or rejected by authorized users
- [ ] Violations can be resolved when all actions are verified
- [ ] Overdue actions are highlighted and can be escalated
- [ ] Audit trail captures all status changes
- [ ] Notifications are sent for acknowledgments, completions, escalations

---

### UC-BR-004: Manage Compliance Violations

**Priority**: P0 (Critical)
**Actor**: Department Manager, Shift Supervisor
**Description**: Acknowledge, assign, and manage compliance violations to ensure timely resolution and maintain compliance scores.

#### Preconditions
- User has "compliance:manage" permission
- Active violations exist in the system
- Users available for violation assignment

#### Postconditions
- Violations are acknowledged and assigned
- Corrective actions have responsible owners
- Progress is tracked and monitored

#### Main Flow

1. User receives notification: "New critical violation: Pizza Slice Holding Time Limits at Main Kitchen"
2. User navigates to **Business Rules → Compliance Monitoring**
3. System displays violations dashboard with new violation highlighted
4. User clicks on new violation V-003
5. System opens **Violation Detail Drawer**
6. User reviews violation details:
   - **Rule**: Pizza Slice Holding Time Limits
   - **Type**: critical
   - **Description**: Pizza slices exceeded safe holding time of 4 hours
   - **Location**: Main Kitchen - Hot Food Station
   - **Timestamp**: 5 minutes ago
   - **Status**: open (red badge)
   - **Detected By**: system (automated detection)
7. User clicks **"Acknowledge Violation"** button
8. System prompts for acknowledgment note
9. User enters: "Reviewing with kitchen staff immediately. Will implement corrective actions."
10. User clicks **"Confirm Acknowledgment"**
11. System updates violation status from "open" to "acknowledged"
12. System records acknowledgment timestamp and user
13. System displays default corrective actions (pre-configured in rule):
    - Action 1: Remove expired items immediately
    - Action 2: Document disposal with photo evidence
14. User clicks **"Assign"** button on Action 1
15. System displays user assignment dialog
16. User searches for "kitchen staff" in assignment field
17. System displays list of kitchen staff currently on shift
18. User selects "John Smith - Line Cook"
19. User sets target date: "15 minutes from now"
20. User clicks **"Assign Action"**
21. System updates Action 1:
    - Responsible: John Smith
    - Target Date: 15 minutes from now
    - Status: pending
22. System sends push notification to John Smith's device
23. User repeats steps 14-21 for Action 2, assigning to Kitchen Supervisor
24. User adds additional corrective action:
25. User clicks **"+ Add Corrective Action"** button
26. System displays add action form
27. User configures Action 3:
    - **Action**: "Review holding time procedures with entire kitchen staff"
    - **Responsible**: Kitchen Manager (self)
    - **Target Date**: End of shift (6 hours)
    - **Evidence Required**: ✓
    - **Verification Method**: "Training attendance sheet with signatures"
28. User clicks **"Add Action"**
29. System adds Action 3 to violation corrective actions list
30. User reviews all assigned actions
31. User clicks **"Update Violation Status"** button
32. User selects new status: "corrective-action" (from dropdown: acknowledged → corrective-action)
33. System updates violation status
34. System displays updated violation with status "corrective-action" (blue badge)
35. User closes violation detail drawer
36. System shows violation in table with updated status and assignments

#### Alternative Flows

**A1: Bulk Assign Violations**
- At step 4, user wants to assign multiple similar violations at once
- User selects checkboxes for 3 violations (all same rule, same location)
- User clicks **"Bulk Assign"** button in toolbar
- System displays bulk assignment dialog
- User selects assignee: "Kitchen Supervisor"
- User sets common target date
- System assigns all selected violations to Kitchen Supervisor
- System sends single notification summarizing all assignments
- Continues to step 35

**A2: Reassign Corrective Action**
- At step 30, user realizes Action 1 should be assigned to different person
- User clicks **"Reassign"** button on Action 1
- System displays reassignment dialog with reason field
- User selects new assignee: "Jane Doe - Kitchen Supervisor"
- User enters reason: "Line cook called in sick, reassigning to supervisor"
- System updates assignment
- System notifies both old assignee (John Smith) and new assignee (Jane Doe)
- System creates audit entry for reassignment

**A3: Extend Target Date**
- At step 30, user realizes target date for Action 3 is unrealistic
- User clicks **"Edit"** button on Action 3
- User extends target date from "End of shift" to "Next day"
- User enters reason: "Requires more time to schedule full staff training"
- System updates target date
- System creates audit entry with reason

#### Exception Flows

**E1: Assignment User Not Found**
- At step 18, system shows no users matching search "kitchen staff"
- System displays message: "No users found matching 'kitchen staff'. Try a different search term."
- User searches for "john smith"
- System displays matching users
- Returns to step 18

**E2: Violation Already Assigned**
- At step 7, user attempts to acknowledge violation
- System detects violation already acknowledged by another manager 2 minutes ago
- System displays warning: "Violation was already acknowledged by Sarah Johnson at 10:32 AM. View her corrective actions?"
- User clicks "View"
- System displays existing corrective actions
- User can add additional actions if needed
- Continues to step 24

**E3: Conflicting Action Assignment**
- At step 20, system detects assignee (John Smith) already has 5 overdue corrective actions
- System displays warning: "John Smith has 5 overdue corrective actions. Assign anyway or select different person?"
- User clicks **"Select Different Person"**
- Returns to step 17

#### Business Rules

1. Critical violations must be acknowledged within 1 hour
2. Acknowledged violations must have ≥1 assigned corrective action
3. Target dates must be in the future (cannot assign past date)
4. Evidence is required for critical and major violations
5. Reassignment requires reason (for audit trail)
6. Users can only be assigned actions if they have relevant permissions
7. Maximum 10 corrective actions per violation

#### UI Components

**Violation Detail Drawer** (management view):

**Header**:
- Violation ID and severity badge
- Status dropdown (editable by manager)
- Acknowledge button (if status=open)
- Close button

**Violation Information Card**:
- Rule name (link to rule details)
- Description
- Location (with icon)
- Timestamp (relative time, e.g., "5 minutes ago")
- Detected by (system/manual/audit)
- Business impact badge
- Estimated cost

**Status Timeline**:
- Visual timeline showing status progression
- Open → Acknowledged → Corrective Action → Resolved → Verified
- Timestamps and users for each status change

**Corrective Actions Section**:
- Actions list (cards with action details)
- "+ Add Corrective Action" button
- Bulk action toolbar (appears when actions selected)

**Corrective Action Card**:
- Action description (editable)
- Responsible person (avatar + name, with Assign/Reassign button)
- Target date (date picker, with overdue indicator if past)
- Status badge (pending, in-progress, completed, overdue)
- Evidence required checkbox
- Verification method (text input)
- Progress indicator (if in-progress)
- Action menu (⋮): Edit, Reassign, Extend Date, Delete

**Assignment Dialog**:
- User search field (autocomplete)
- Filtered user list (shows users on current shift, relevant department)
- Target date picker (calendar, relative time options: "15 minutes", "1 hour", "End of shift", "Tomorrow")
- Evidence required checkbox
- Assign button

**Add Corrective Action Form**:
- Action description (textarea)
- Responsible (user search)
- Target date (date picker)
- Evidence required (checkbox)
- Verification method (text input)
- Add Action button

#### Acceptance Criteria

- [ ] Violations can be acknowledged with notes
- [ ] Corrective actions can be assigned to users
- [ ] Notifications are sent to assigned users
- [ ] Target dates can be set with date picker or relative time
- [ ] Actions can be reassigned with reason
- [ ] Additional corrective actions can be added
- [ ] Violation status can be updated through workflow
- [ ] Bulk assignment works for multiple violations
- [ ] Overdue actions are clearly indicated
- [ ] Audit trail captures all changes (acknowledgment, assignments, reassignments, status updates)

---

### UC-BR-005: Execute Corrective Actions

**Priority**: P0 (Critical)
**Actor**: Staff Member, Kitchen Staff, Supervisor
**Description**: Complete assigned corrective actions, upload evidence, and update status to resolve compliance violations.

#### Preconditions
- User has assigned corrective action(s)
- User has access to Carmen mobile app or web interface
- User has necessary resources to complete action

#### Postconditions
- Corrective action is marked as completed
- Evidence is uploaded and attached
- Manager is notified of completion
- Violation progresses toward resolution

#### Main Flow

1. Kitchen staff member (John Smith) receives push notification on mobile device:
   "New corrective action assigned: Remove expired pizza slices immediately. Target: 10:45 AM (15 minutes)"
2. User opens notification, launches Carmen mobile app
3. App navigates to **My Corrective Actions** screen
4. System displays action card:
   - **Violation**: V-003 - Pizza Slice Holding Time Limits
   - **Action**: Remove expired pizza slices immediately
   - **Location**: Main Kitchen - Hot Food Station
   - **Assigned**: 10:30 AM
   - **Target Date**: 10:45 AM (13 minutes remaining)
   - **Status**: pending (gray badge)
   - **Evidence Required**: ✓ (photo documentation)
5. User reads action details
6. User goes to Hot Food Station physically
7. User identifies expired pizza slices (holding time >4 hours)
8. User removes pizza slices and disposes in waste container
9. User returns to mobile app
10. User clicks **"Start Action"** button on action card
11. System updates action status to "in-progress"
12. System starts timer to track time spent
13. User clicks **"Upload Evidence"** button
14. System opens camera interface
15. User takes photo of:
    - Disposed pizza slices in waste container
    - Digital holding time display showing time exceeded
16. User confirms photo is clear and visible
17. User clicks **"Upload Photos"** button
18. System uploads 2 photos to cloud storage
19. System displays upload progress indicator
20. Upload completes successfully
21. System attaches photos to corrective action
22. User adds completion note (optional): "Removed 12 pizza slices from display. Holding time was 4 hours 23 minutes. Disposed in waste container #3."
23. User clicks **"Mark as Completed"** button
24. System prompts for completion confirmation: "Mark action as completed? Manager will be notified for verification."
25. User clicks **"Confirm"**
26. System updates action status to "completed"
27. System stops timer (tracked 8 minutes to complete)
28. System sends notification to Kitchen Manager: "Corrective action completed by John Smith. Review evidence and verify."
29. System displays success message: "Action completed successfully. Thank you for maintaining food safety standards."
30. User sees updated action card with "completed" status (green badge)
31. Action moves to **Completed Actions** section

#### Alternative Flows

**A1: Complete Action Without Evidence (Not Required)**
- If evidence is not required for the action:
- At step 13, "Upload Evidence" button is not displayed
- User skips steps 13-21
- User proceeds directly to step 22 (add completion note)
- Note becomes more important to document completion
- Continues to step 23

**A2: Add Evidence Later**
- At step 13, user cannot take photo immediately (no camera access, poor lighting)
- User clicks **"Complete Without Evidence"** button
- System displays warning: "Evidence is required for this action. You can add evidence later but action will remain 'in-progress' until evidence is provided."
- User clicks **"Continue"**
- System marks action as "in-progress" (not completed)
- User adds note: "Action completed, will upload photo shortly"
- Later, user accesses action and clicks **"Add Evidence"**
- User uploads photos
- User marks action as completed
- Continues to step 24

**A3: Pause Action (Cannot Complete Immediately)**
- At step 10, user realizes cannot complete action immediately (need supplies, waiting for access, etc.)
- User clicks **"Pause Action"** button
- System prompts for pause reason
- User enters: "Waiting for waste container delivery from storage"
- System updates action status to "paused"
- System sends notification to manager
- Later, user resumes action:
- User clicks **"Resume Action"** button
- Continues to step 12

**A4: Request Extension**
- At step 5, user realizes cannot meet target date (13 minutes unrealistic)
- User clicks **"Request Extension"** button
- System displays extension request form
- User enters:
  - New target date: "30 minutes from now"
  - Reason: "Need to finish current food prep task before disposing items"
- User submits extension request
- System sends request to Kitchen Manager for approval
- Manager approves extension
- System updates target date
- User completes action with extended time
- Continues to step 6

#### Exception Flows

**E1: Photo Upload Fails**
- At step 18, photo upload fails due to network error
- System displays error: "Photo upload failed due to poor network connection. Retry?"
- User clicks **"Retry"**
- System retries upload
- If retry succeeds, continues to step 21
- If retry fails again, system offers "Save as Draft" option
- User saves as draft, uploads later when network improves

**E2: Unable to Complete Action**
- At step 8, user cannot find expired pizza slices (already removed by someone else)
- User clicks **"Unable to Complete"** button
- System prompts for reason
- User enters: "Pizza slices were already removed by another staff member before I arrived"
- System updates action status to "unable-to-complete"
- System sends notification to manager for investigation
- Manager reviews situation and either:
  - Marks action as completed (another person did it)
  - Reassigns to original person (misunderstanding)
  - Closes as duplicate

**E3: Evidence Rejected by Manager**
- After step 29, manager reviews evidence and rejects it
- User receives notification: "Evidence rejected for corrective action. Reason: Photo does not clearly show disposed items. Please provide clearer evidence."
- System reverts action status from "completed" to "in-progress"
- User clicks **"Add More Evidence"** button
- User takes clearer photos
- Returns to step 17

#### Business Rules

1. Action must be started before marking as in-progress
2. Evidence is required for critical and major violations
3. Completion note is required if evidence is not uploaded
4. Actions cannot be marked completed if overdue without manager approval
5. Timer tracks time spent on action for analytics
6. Photos must be >100KB and <10MB per file
7. Maximum 5 photos per action
8. Extension requests require approval for critical violations

#### UI Components

**Mobile App - My Corrective Actions Screen**:

**Header**:
- Screen title: "My Corrective Actions"
- Filter tabs: All (badge: 3), Pending (2), In Progress (1), Completed (5)
- Notifications bell icon

**Action Card** (compact mobile view):
- Violation ID and rule name
- Action description (bold)
- Location icon + location name
- Time remaining indicator (color-coded: green >1hr, orange <1hr, red overdue)
- Status badge
- Evidence required icon (if applicable)
- Primary action button (context-sensitive: "Start", "Upload Evidence", "Complete")
- Overflow menu (⋮): Pause, Request Extension, View Details

**Action Detail View** (expanded):
- Full violation information
- Complete action description
- Assigned timestamp
- Target date with countdown
- Status with status history timeline
- Evidence section:
  - Upload button (camera icon)
  - Evidence requirements description
  - Uploaded photos grid (with delete option)
- Completion note textarea
- Action buttons:
  - Start Action (if pending)
  - Upload Evidence (if in-progress and evidence required)
  - Mark as Completed (if in-progress and evidence uploaded OR not required)
  - Unable to Complete (always available)
  - Request Extension (if not overdue)

**Photo Upload Interface**:
- Camera preview (if on mobile)
- Photo library access (if on mobile)
- File upload (if on web)
- Photo thumbnail previews
- Delete photo button per thumbnail
- Upload all button

**Completion Confirmation Dialog**:
- Summary of action
- Evidence attached indicator (✓ 2 photos)
- Completion note preview
- Confirm button
- Cancel button

**Success Message**:
- Green checkmark icon
- Success message text
- Time spent on action
- Return to actions list button

#### Acceptance Criteria

- [ ] User receives notification for new assignments
- [ ] Action can be started with status update to in-progress
- [ ] Timer tracks time spent on action
- [ ] Photos can be uploaded from camera or gallery
- [ ] Multiple photos can be attached (max 5)
- [ ] Completion note can be added (required if no evidence)
- [ ] Action can be marked as completed
- [ ] Completion notification sent to manager
- [ ] Action status updates correctly
- [ ] Evidence can be added later if initially unavailable
- [ ] Extension requests can be submitted and approved
- [ ] Unable to complete option available with reason required
- [ ] Overdue actions are highlighted clearly
- [ ] Completed actions move to separate section

---

### UC-BR-006: Test Business Rule

**Priority**: P1 (High)
**Actor**: System Administrator, Quality Manager
**Description**: Test business rule with sample data and scenarios to validate correct behavior before activating in production.

#### Preconditions
- User has "business_rules:test" permission
- Business rule is configured (active or inactive)
- Test scenarios are prepared or available

#### Postconditions
- Rule is validated against test scenarios
- Test results show expected behavior
- Issues are identified for correction before production activation

#### Main Flow

1. User navigates to **Business Rules Management** page
2. User clicks on rule: "Pizza Slice Holding Time Limits"
3. System displays rule detail view
4. User clicks **"Test Rule"** button in toolbar
5. System opens **Rule Testing** panel
6. System displays two options:
   - **Quick Test**: Test with single data sample
   - **Scenario Testing**: Test with multiple predefined scenarios
7. User selects **"Scenario Testing"**
8. System displays available test scenarios:
   - "Normal Operations - Within Limits" (pass expected)
   - "Boundary Condition - Exactly 4 Hours" (pass expected)
   - "Exceeded Limit - 4 Hours 15 Minutes" (fail expected, rule should trigger)
   - "Expired - 6 Hours" (fail expected, rule should trigger)
9. User selects all 4 scenarios (checkboxes)
10. User clicks **"Run Tests"** button
11. System displays progress indicator: "Running tests... 1 of 4 scenarios"
12. System executes each scenario:

    **Scenario 1: Normal Operations - Within Limits**
    - Test Data: Pizza slice with holdingTime=180 minutes (3 hours)
    - Expected: No rule trigger, sale allowed
    - Actual: No rule trigger, sale allowed
    - Result: ✅ PASSED
    - Processing Time: 42ms

    **Scenario 2: Boundary Condition - Exactly 4 Hours**
    - Test Data: Pizza slice with holdingTime=240 minutes (4 hours)
    - Expected: No rule trigger (greaterThan means >240, not >=240)
    - Actual: No rule trigger, sale allowed
    - Result: ✅ PASSED
    - Processing Time: 38ms

    **Scenario 3: Exceeded Limit - 4 Hours 15 Minutes**
    - Test Data: Pizza slice with holdingTime=255 minutes
    - Expected: Rule triggers, sale blocked, manager notified
    - Actual: Rule triggered, actions executed:
      - ✅ blockSale action executed successfully
      - ✅ notifyManager action sent notification to kitchen-manager
    - Result: ✅ PASSED
    - Processing Time: 67ms

    **Scenario 4: Expired - 6 Hours**
    - Test Data: Pizza slice with holdingTime=360 minutes (6 hours)
    - Expected: Rule triggers, sale blocked, critical violation logged
    - Actual: Rule triggered, actions executed:
      - ✅ blockSale action executed successfully
      - ✅ logCompliance action created critical violation V-TEST-001
      - ✅ notifyManager action sent critical alert
    - Result: ✅ PASSED
    - Processing Time: 89ms

13. System completes all tests
14. System displays **Test Summary**:
    - **Total Scenarios**: 4
    - **Passed**: 4 (100%)
    - **Failed**: 0 (0%)
    - **Average Processing Time**: 59ms
    - **Overall Result**: ✅ ALL TESTS PASSED
15. User reviews detailed test results
16. User clicks **"View Test Report"** button
17. System generates comprehensive test report:
    - Test execution timestamp
    - Rule configuration snapshot
    - Scenario results with expected vs actual comparison
    - Performance metrics
    - Recommendations
18. User reviews report recommendations:
    - "Rule performs within acceptable limits (<100ms per execution)"
    - "Boundary conditions handled correctly"
    - "Actions execute as expected"
    - "Ready for production activation"
19. User clicks **"Download Report"** button
20. System downloads test report as PDF
21. User clicks **"Activate Rule"** button
22. System prompts: "All tests passed. Activate rule now?"
23. User confirms activation
24. System activates rule with status="active"
25. System displays success message: "Rule activated successfully and is now enforcing food safety standards."

#### Alternative Flows

**A1: Quick Test with Single Sample**
- At step 7, user selects **"Quick Test"**
- System displays quick test form with sample data input fields
- User enters test data manually:
  - item.fractionalSalesType: "pizza-slice"
  - item.holdingTime: 300 (minutes)
- User clicks **"Run Test"**
- System evaluates rule with provided data
- System displays result: "Rule triggered ✅"
- System shows which actions would execute
- Continues to step 15

**A2: Create Custom Test Scenario**
- At step 8, user clicks **"+ Create Scenario"** button
- System displays create scenario form
- User configures:
  - **Scenario Name**: "Edge Case - Multiple Fractional Items"
  - **Description**: "Test rule behavior when transaction has multiple pizza slices with different holding times"
  - **Test Data**: JSON structure with multiple items
  - **Expected Results**: Specify which items should trigger rule
- User saves scenario
- System adds to available scenarios list
- User selects new scenario and runs test
- Continues to step 11

**A3: Test Failed - Fix and Retest**
- At step 12, Scenario 3 fails:
  - Expected: Rule triggers
  - Actual: Rule did not trigger
  - Result: ❌ FAILED
- System highlights failure and shows diff:
  - Condition evaluation log shows holdingTime (255) not >240 detected
  - Issue: Operator should be greaterThan but configured as greaterThanOrEqual
- User clicks **"Fix Rule"** button
- System opens rule edit form with condition highlighted
- User corrects operator from "greaterThanOrEqual" to "greaterThan"
- User saves rule modification
- User clicks **"Retest"** button
- System reruns failed scenario
- Scenario now passes
- Continues to step 14

#### Exception Flows

**E1: Test Execution Error**
- At step 12, scenario execution throws error
- System catches error and displays:
  - **Error**: "Field 'item.invalidField' not found in test data"
  - **Scenario**: Scenario 3
  - **Suggestion**: "Update rule condition or test data to include required field"
- User clicks **"View Details"** for error stack trace
- User identifies issue: condition references field not in test data
- User either:
  - Updates test data to include field, OR
  - Updates rule condition to reference correct field
- Returns to step 11

**E2: Performance Threshold Exceeded**
- At step 14, system detects average processing time >100ms
- System displays warning in test summary:
  - **Performance**: 145ms average (⚠️ Exceeds 100ms threshold)
  - **Recommendation**: "Optimize rule conditions or reduce action complexity"
- User reviews performance metrics per scenario
- User identifies Scenario 4 takes 234ms (outlier)
- User clicks **"Analyze Performance"**
- System shows condition evaluation breakdown
- System recommends: "Consider caching inventory lookups for quarantineItem action"
- User notes recommendation for future optimization
- User can still activate rule with performance warning acknowledged

**E3: Conflicting Test Results**
- At step 12, results are inconsistent across runs
- User runs same tests again
- Different scenarios pass/fail on second run
- System detects non-deterministic behavior
- System displays error: "Rule produces inconsistent results. This may indicate timing dependencies or random factors."
- System suggests: "Review rule conditions for dependencies on system time, random values, or external data that may change"
- User investigates and finds condition using current timestamp
- User modifies condition to use fixed timestamp from test data
- Returns to step 11

#### Business Rules

1. All new rules should pass ≥95% of test scenarios before activation
2. Processing time should be <100ms per rule evaluation
3. Test scenarios must cover normal, boundary, and error conditions
4. Test results are retained for 90 days
5. Critical rules require ≥99% test pass rate
6. Failed tests must be resolved before production activation
7. Test data must not affect production data (isolated environment)

#### UI Components

**Rule Testing Panel**:

**Header**:
- Panel title: "Test Rule: [Rule Name]"
- Close button
- Help icon (with testing documentation link)

**Test Mode Selection**:
- Radio buttons:
  - Quick Test (single sample)
  - Scenario Testing (multiple scenarios)
- Description text for each mode

**Quick Test Form** (if Quick Test selected):
- Test data input fields (dynamic based on rule conditions)
- JSON editor option for advanced users
- "Run Test" button
- Real-time validation of test data format

**Scenario Testing View** (if Scenario Testing selected):
- Available scenarios list
  - Scenario cards showing: name, description, expected result
  - Checkbox for selection
  - Edit/Delete buttons (for custom scenarios)
- "Select All" / "Deselect All" buttons
- "+ Create Scenario" button
- "Run Selected Tests" button

**Test Execution View**:
- Progress bar showing current scenario
- Live results feed showing each scenario as it completes
- Real-time performance metrics

**Test Results View**:
- Summary metrics card:
  - Total/Passed/Failed counts with percentages
  - Average processing time
  - Overall pass/fail badge
- Detailed results table:
  - Columns: Scenario, Expected, Actual, Result, Processing Time, Actions
  - Expandable rows showing full test data and execution logs
  - Color-coded rows (green=pass, red=fail, yellow=warning)

**Scenario Result Detail** (expanded row):
- Test data used (formatted JSON)
- Expected results
- Actual results with diff highlighting
- Rule evaluation log (which conditions matched, which actions executed)
- Performance breakdown (time per condition, per action)
- Error details (if failed)

**Test Report View**:
- Professional report layout
- Executive summary
- Detailed scenario results
- Performance analysis
- Recommendations
- Rule configuration snapshot
- "Download PDF" button
- "Download CSV" button (for data analysis)

**Action Buttons**:
- "Activate Rule" (if all tests passed, rule inactive)
- "Fix Rule" (if tests failed, opens edit form)
- "Retest" (run tests again after fixes)
- "Download Report"
- "Save Scenarios" (save custom scenarios for future use)
- "Close"

#### Acceptance Criteria

- [ ] User can select test mode (quick test or scenario testing)
- [ ] Quick test allows manual test data entry
- [ ] Scenario testing displays available scenarios
- [ ] Multiple scenarios can be selected and run
- [ ] Test execution shows progress and real-time results
- [ ] Test results display expected vs actual with clear pass/fail indicators
- [ ] Performance metrics are captured and displayed
- [ ] Failed tests show detailed error information
- [ ] Test reports can be generated and downloaded
- [ ] Rules can be activated directly from test results (if passed)
- [ ] Custom scenarios can be created, saved, and reused
- [ ] Test data is isolated from production data
- [ ] Processing time warnings appear if >100ms threshold exceeded

---

### UC-BR-007: Analyze Rule Performance

**Priority**: P1 (High)
**Actor**: Operations Manager, System Administrator
**Description**: Analyze business rule performance metrics, identify optimization opportunities, and track business impact of automated rules.

#### Preconditions
- User has "analytics:view" permission
- Business rules have been active and triggering
- Sufficient historical data exists (≥7 days recommended)

#### Postconditions
- User understands rule performance and effectiveness
- Optimization opportunities are identified
- Business impact is quantified

#### Main Flow

1. User navigates to **Business Rules Management** page
2. User clicks **"Analytics"** tab
3. System displays **Rule Performance Analytics Dashboard**
4. System shows **Overview Metrics** (top section):
   - **Total Rules**: 45
   - **Active Rules**: 38 (84%)
   - **Inactive Rules**: 7 (16%)
   - **Total Triggers Today**: 1,247
   - **Success Rate**: 94.8%
   - **Avg Processing Time**: 45ms
   - **Cost Savings (MTD)**: $12,450
   - **Time Saved (MTD)**: 156 hours
5. User reviews **Category Performance** section:

   | Category | Rules | Triggers | Success Rate | Cost Savings |
   |----------|-------|----------|--------------|--------------|
   | Fractional Sales | 8 | 342 | 97.2% | $3,200 |
   | Food Safety | 12 | 498 | 96.8% | $5,400 |
   | Inventory Mgmt | 10 | 267 | 91.5% | $2,850 |
   | Waste Management | 5 | 89 | 93.2% | $950 |
   | Quality Control | 3 | 51 | 88.0% | $50 |

6. User clicks on **"Fractional Sales"** category to drill down
7. System displays fractional sales rules performance:

   **Top Performing Rules**:
   - Pizza Slice Holding Time Limits
     - Triggers: 156
     - Success Rate: 97.8%
     - Avg Processing Time: 38ms
     - Cost Savings: $1,850 (prevented 41 food safety violations)
     - Trend: ↗ increasing (35% more triggers vs last week)

   - Cake Slice Temperature Monitoring
     - Triggers: 89
     - Success Rate: 95.5%
     - Avg Processing Time: 52ms
     - Cost Savings: $720
     - Trend: → stable

8. User clicks on **"Pizza Slice Holding Time Limits"** rule
9. System displays **Rule Detail Analytics** view
10. User reviews **Performance Trends** chart:
    - Line graph showing daily triggers over last 30 days
    - Trend line indicating 15% increase in triggers
    - Peak days: Fridays and Saturdays (2x weekday average)
11. User reviews **Hourly Distribution** chart:
    - Bar chart showing triggers by hour of day
    - Peak hours: 6-8 PM (dinner rush)
    - Insight: "Most violations occur during peak service hours when staff is busiest"
12. User reviews **Success/Failure Breakdown**:
    - **Successful Triggers**: 153 (97.8%)
    - **Failed Triggers**: 3 (1.9%)
      - Error: "Manager notification failed" (2 occurrences)
      - Error: "Inventory item not found" (1 occurrence)
13. User clicks on error type: "Manager notification failed"
14. System displays error analysis:
    - **Frequency**: 2 occurrences in last 30 days
    - **Last Occurrence**: 2025-01-14 18:42:15
    - **Root Cause**: "Notification service timeout"
    - **Suggested Resolution**: "Increase notification timeout from 5s to 10s"
    - **Impact**: Low (notifications eventually sent via retry mechanism)
15. User reviews **Business Impact** section:
    - **Food Safety Violations Prevented**: 41
    - **Estimated Cost of Violations**: $1,850
    - **Labor Hours Saved**: 12 hours (vs manual monitoring)
    - **Compliance Score Impact**: +3.2% improvement in food safety compliance
16. User notes optimization opportunity
17. User clicks **"Export Analytics"** button
18. System prompts for export options:
    - **Format**: PDF or CSV
    - **Date Range**: Last 30 days (default) or custom
    - **Include**: Performance, trends, errors, business impact
19. User selects PDF format, last 30 days, all sections
20. User clicks **"Generate Report"**
21. System generates comprehensive analytics report
22. System downloads PDF: "Rule_Analytics_Pizza_Slice_Holding_Time_2025-01-16.pdf"
23. User opens report and reviews recommendations:
    - "Consider increasing staff during peak hours (6-8 PM) to reduce violations"
    - "Implement proactive alerts at 3.5 hours to prevent violations before 4-hour limit"
    - "Increase notification timeout to improve success rate to >99%"
24. User shares report with operations team
25. User schedules follow-up meeting to implement recommendations

#### Alternative Flows

**A1: Compare Rules Performance**
- At step 5, user wants to compare multiple rules
- User clicks **"Compare Rules"** button
- System displays rule selection dialog
- User selects 3 rules to compare:
  - Pizza Slice Holding Time Limits
  - Cake Slice Temperature Monitoring
  - Bottle Service Inventory Tracking
- User clicks **"Compare"**
- System displays side-by-side comparison:
  - Triggers, success rate, processing time, cost savings
  - Trend charts overlaid for visual comparison
  - Relative performance indicators (best/worst)
- User identifies Pizza Slice rule has highest business impact
- User notes Bottle Service rule has lowest success rate (needs investigation)

**A2: Filter by Date Range**
- At step 3, user wants to analyze specific time period
- User clicks **"Date Range"** selector
- User selects "Last 7 days" (vs default "Last 30 days")
- System refreshes all metrics and charts with 7-day data
- User compares 7-day vs 30-day trends
- User identifies recent spike in triggers (last 3 days)
- User investigates spike cause (new menu item introduced)

**A3: Drill Down to Specific Triggers**
- At step 9, user wants to see individual trigger details
- User clicks **"View Triggers"** button
- System displays trigger log table:
  - Timestamp, item details, trigger outcome, processing time, actions executed
  - Filter options: outcome (success/fail), date, location
- User filters to failed triggers only
- User reviews each failed trigger to understand patterns
- User identifies all failures occurred during system maintenance window
- User notes to schedule maintenance during off-peak hours

#### Exception Flows

**E1: Insufficient Data**
- At step 3, system detects insufficient historical data (<7 days)
- System displays warning: "Limited analytics data available. For accurate insights, we recommend ≥7 days of rule activity. Current data: 3 days."
- System displays available metrics with "Preliminary" badge
- User acknowledges limitation
- User proceeds with preliminary analysis
- User schedules review after 7 days for comprehensive analysis

**E2: Performance Degradation Detected**
- At step 4, system detects significant performance degradation
- System displays alert in overview metrics:
  - **Average Processing Time**: 145ms (⚠️ Up 222% from baseline of 45ms)
  - **Alert**: "Rule processing time has significantly increased. Investigation recommended."
- User clicks alert for details
- System shows performance degradation timeline
- System identifies culprit: "Inventory Threshold Rule" processing time increased from 50ms to 380ms
- System suggests: "Review inventory lookup query optimization"
- User clicks **"Investigate Rule"** button
- System displays rule with performance breakdown
- User identifies inefficient inventory query
- User creates task to optimize query

**E3: Export Generation Fails**
- At step 21, export generation fails due to large dataset
- System displays error: "Export failed: Dataset too large (>10,000 records). Try narrowing date range or selecting specific rules."
- User reduces date range from 30 days to 7 days
- User retries export
- Export succeeds with smaller dataset
- Alternatively, user requests CSV instead of PDF (handles larger datasets better)

#### Business Rules

1. Analytics data refreshed every 5 minutes
2. Historical data retained for 24 months
3. Success rate <85% triggers automatic review recommendation
4. Processing time >200ms triggers optimization review
5. Cost savings calculated based on: violations prevented × average violation cost
6. Time saved calculated based on: automation × manual effort time
7. Trends require minimum 7 days data for accuracy

#### UI Components

**Rule Performance Analytics Dashboard**:

**Header**:
- Dashboard title: "Rule Performance Analytics"
- Date range selector (dropdown: Today, Last 7 days, Last 30 days, Custom)
- Refresh button (with last updated timestamp)
- Export button

**Overview Metrics Section**:
- Metric cards in grid layout (2 rows × 4 columns):
  - Total Rules (with active/inactive breakdown)
  - Total Triggers (with today's count and trend vs yesterday)
  - Success Rate (percentage with trend indicator)
  - Avg Processing Time (milliseconds with performance indicator)
  - Cost Savings MTD (currency with trend)
  - Time Saved MTD (hours with trend)
  - Open Violations (count with severity breakdown)
  - Compliance Score (percentage with category breakdown)
- Color-coded indicators: Green (good), Yellow (warning), Red (critical)

**Category Performance Section**:
- Table or card grid showing performance by category
- Columns: Category, Rule Count, Triggers, Success Rate, Cost Savings
- Sortable by any column
- Clickable rows to drill down into category

**Rule Performance List** (when category selected):
- Table showing individual rules
- Columns: Rule Name, Triggers, Success Rate, Avg Processing Time, Cost Savings, Trend
- Color-coded success rate (green ≥95%, yellow 85-95%, red <85%)
- Trend indicators (↗ increasing, → stable, ↘ decreasing)
- Clickable rows to view rule details

**Rule Detail Analytics View**:
- Rule information header (name, category, status, priority)
- **Performance Metrics** cards:
  - Total Triggers
  - Success Rate (with failed trigger count)
  - Avg Processing Time
  - Cost Savings
- **Performance Trends** chart:
  - Line graph: triggers over time (daily or hourly)
  - Trend line with slope indicator
  - Peak day/hour highlights
- **Hourly Distribution** chart:
  - Bar chart: triggers by hour of day
  - Overlay: success vs failure by hour
- **Success/Failure Breakdown**:
  - Pie chart or donut chart
  - Success count and percentage
  - Failure count with breakdown by error type
- **Error Analysis** table:
  - Columns: Error Type, Count, Percentage, Last Occurrence
  - Clickable rows for error details
- **Business Impact** metrics:
  - Violations prevented (count)
  - Estimated cost savings (currency)
  - Labor hours saved (hours)
  - Compliance score impact (percentage points)
- **Action Buttons**:
  - View Triggers (detailed log)
  - Export Analytics
  - Optimize Rule
  - Share Report

**Compare Rules View**:
- Side-by-side comparison table
- Synchronized charts showing trends for all selected rules
- Relative performance indicators (badges: Best, Good, Needs Attention)
- Export comparison button

**Error Detail Modal**:
- Error type and description
- Frequency and percentage
- Timeline showing occurrences
- Root cause analysis (if available)
- Suggested resolution
- Impact assessment
- Related rules (if error affects multiple)
- Create ticket button (for IT support)

**Export Dialog**:
- Format selection (PDF, CSV, Excel)
- Date range selection
- Sections to include (checkboxes):
  - Overview metrics
  - Performance trends
  - Error analysis
  - Business impact
  - Recommendations
- Generate report button

#### Acceptance Criteria

- [ ] Overview metrics display current performance statistics
- [ ] Category performance shows breakdown by rule category
- [ ] Individual rule performance can be viewed in detail
- [ ] Performance trends display daily/hourly trigger patterns
- [ ] Success/failure breakdown shows error types and frequencies
- [ ] Error analysis provides root cause and resolution suggestions
- [ ] Business impact metrics quantify cost savings and efficiency gains
- [ ] Export generates comprehensive PDF or CSV reports
- [ ] Date range filtering works correctly
- [ ] Rules can be compared side-by-side
- [ ] Performance degradation alerts appear when thresholds exceeded
- [ ] Trigger log can be viewed for detailed investigation
- [ ] Analytics data refreshes every 5 minutes

---

### UC-BR-008: Modify Existing Rule

**Priority**: P1 (High)
**Actor**: System Administrator, Operations Manager
**Description**: Modify existing business rule configuration (conditions, actions, priority) with proper validation and audit trail.

#### Preconditions
- User has "business_rules:edit" permission
- Business rule exists in the system
- User understands impact of rule modification

#### Postconditions
- Rule configuration is updated
- Changes are validated and tested
- Audit trail entry created
- Affected systems notified of change

#### Main Flow

1. User navigates to **Business Rules Management** page
2. User searches for rule: "Pizza Slice Holding Time Limits"
3. System displays rule in list
4. User clicks on rule row to view details
5. System displays rule detail view (read-only mode)
6. User clicks **"Edit Rule"** button in toolbar
7. System checks if rule is active
8. System displays warning modal:
   "This rule is currently active and processing 50+ transactions per day. Modifications may affect ongoing operations. Deactivate rule before editing? (Recommended for critical rules)"
9. User reviews options:
   - **Option A**: "Deactivate and Edit" (recommended for critical changes)
   - **Option B**: "Edit While Active" (for minor changes)
   - **Option C**: "Create Copy and Edit" (safest, test changes on copy first)
10. User selects **Option A**: "Deactivate and Edit"
11. System prompts for deactivation reason
12. User enters: "Temporary deactivation to update holding time from 4 hours to 3.5 hours based on food safety consultation"
13. System deactivates rule (status = inactive)
14. System opens rule in **Edit Mode**
15. User reviews current configuration:
    - **Priority**: 10
    - **Condition 1**: item.fractionalSalesType equals "pizza-slice" AND
    - **Condition 2**: item.holdingTime greaterThan 240 (minutes)
    - **Action 1**: blockSale
    - **Action 2**: notifyManager
16. User modifies **Condition 2**:
    - Changes holdingTime threshold from 240 to 210 (3.5 hours)
    - Reason: "New food safety standard requires 3.5 hour maximum holding time"
17. User adds new **Action 3**:
    - **Action Type**: "logCompliance"
    - **Parameters**:
      - violationType: "food-safety"
      - riskLevel: "high"
      - autoNotifyHealth Dept: false
18. User clicks **"Save Changes"** button
19. System validates modifications:
    - All required fields present ✓
    - Conditions valid ✓
    - Actions properly configured ✓
    - No conflicts with other rules ✓
20. System displays **Change Summary** modal:
    - **Conditions Changed**: 1
      - item.holdingTime threshold: 240 → 210 minutes
    - **Actions Added**: 1
      - logCompliance action added
    - **Impact Assessment**:
      - Estimated additional triggers: +15% (based on current data)
      - Rules affected: 0 (no dependent rules)
      - Performance impact: Minimal (+10ms estimated)
21. System prompts: "Test changes before reactivating?"
22. User clicks **"Yes, Run Tests"**
23. System opens test panel with recommended test scenarios:
    - Existing scenarios updated with new threshold (210 instead of 240)
    - New scenarios suggested:
      - "Boundary - Exactly 3.5 Hours" (210 minutes)
      - "Just Under - 3 Hours 29 Minutes" (209 minutes)
      - "Just Over - 3 Hours 31 Minutes" (211 minutes)
24. User runs tests
25. System executes tests: 6 scenarios, all passed ✅
26. System displays test results with recommendation: "All tests passed. Ready to reactivate."
27. User clicks **"Save and Reactivate"** button
28. System prompts for reactivation note
29. User enters: "Updated holding time to 3.5 hours per new food safety guidelines. All tests passed."
30. System saves changes and reactivates rule
31. System creates audit trail entry:
    - **Action**: modified
    - **Changes**: Detailed change log
    - **Reason**: Food safety standard update
    - **Performed By**: Current user
    - **Timestamp**: Current time
    - **Approved By**: null (auto-approved, non-critical change)
    - **Business Justification**: "Align with updated food safety consultation recommendations"
    - **Impact Assessment**: "15% increase in triggers expected, minimal performance impact"
32. System sends notifications:
    - Kitchen managers: "Rule updated - New pizza slice holding time is 3.5 hours"
    - Operations team: "Pizza Slice Holding Time rule modified and reactivated"
33. System displays success message: "Rule updated successfully and reactivated. Changes are now in effect."
34. System returns to rule detail view showing updated configuration

#### Alternative Flows

**A1: Edit While Active (Minor Change)**
- At step 10, user selects **Option B**: "Edit While Active"
- System displays additional warning: "Changes take effect immediately upon save. Ensure changes are tested."
- User proceeds to edit mode
- User makes minor change (e.g., notification recipient)
- User saves changes
- System validates and applies changes immediately
- System displays notification: "Changes applied. Rule continues running with new configuration."
- No deactivation/reactivation needed

**A2: Create Copy and Edit (Safest)**
- At step 10, user selects **Option C**: "Create Copy and Edit"
- System creates copy of rule:
  - Name: "Pizza Slice Holding Time Limits (Copy)"
  - Status: inactive
  - All configuration identical to original
- System opens copy in edit mode
- User modifies copy with new configuration
- User tests copy thoroughly
- Once satisfied, user can:
  - Activate copy and deactivate original, OR
  - Merge changes back to original
- Original rule continues running unchanged during testing

**A3: Require Approval for Critical Rule**
- At step 19, system detects rule has priority 9-10 (critical)
- System adds approval requirement
- At step 30, instead of immediate save, system:
  - Creates change request with status "pending approval"
  - Sends approval request to Operations Manager
  - Displays message: "Change request submitted. Rule will update upon manager approval."
- Manager reviews and approves changes
- System applies changes and reactivates rule
- User receives notification of approval

**A4: Bulk Edit Multiple Rules**
- At step 2, user wants to update multiple similar rules
- User selects checkboxes for 3 pizza-related rules
- User clicks **"Bulk Edit"** button
- System displays bulk edit form with common fields
- User updates common setting: "notifyManager recipient" to new manager
- System applies change to all 3 selected rules
- System validates each rule independently
- System displays bulk edit summary with per-rule results
- User confirms bulk changes
- System applies changes to all rules

#### Exception Flows

**E1: Validation Failure - Invalid Configuration**
- At step 19, system detects invalid configuration
- Validation error: "Condition references field 'item.prepTime' which does not exist. Did you mean 'item.holdingTime'?"
- System highlights error in edit form
- User corrects field reference
- Returns to step 19

**E2: Conflict with Another Rule**
- At step 19, system detects conflict with another rule
- Validation warning: "Rule 'Pizza Slice Display Temperature' has overlapping conditions. Both rules may trigger for the same event. Review rule priority."
- System displays conflicting rule details
- User has options:
  - Adjust priority to control evaluation order
  - Modify conditions to eliminate overlap
  - Proceed with conflict (rules evaluated by priority)
- User adjusts priority: changes from 10 to 9 (below temperature rule)
- Returns to step 19

**E3: Performance Degradation Detected**
- At step 20, system estimates significant performance impact
- Impact assessment shows: "+150ms processing time" (exceeds 100ms threshold)
- System displays warning: "Performance impact exceeds recommended threshold. Optimize configuration or proceed with degradation?"
- User clicks **"Optimize"** button
- System suggests optimizations:
  - "Cache inventory lookups for logCompliance action"
  - "Reduce notification retries from 5 to 3"
- User applies suggestions
- System recalculates: "+45ms processing time" (acceptable)
- Continues to step 21

**E4: Test Failures**
- At step 25, tests fail
- Test results: 4 passed, 2 failed ❌
- Failed scenario: "Boundary - Exactly 3.5 Hours"
  - Expected: No trigger (user intended >210, not >=210)
  - Actual: Rule triggered
- User realizes operator should be "greaterThan" not "greaterThanOrEqual"
- User clicks **"Fix Rule"** from test results
- System reopens edit form with condition highlighted
- User corrects operator
- User reruns tests
- All tests pass ✅
- Continues to step 26

**E5: Concurrent Modification**
- At step 18, system detects another user modified rule
- System displays conflict: "Rule was modified by [User Name] at [Time] while you were editing. Review their changes before saving."
- System displays:
  - Your changes (in left column)
  - Their changes (in right column)
  - Conflicts highlighted
- User has options:
  - Overwrite their changes with yours
  - Discard your changes and use theirs
  - Merge changes manually
- User selects **"Merge Changes"**
- User reviews both sets of changes
- User combines non-conflicting changes
- Returns to step 18

#### Business Rules

1. Deactivation recommended for critical rules (priority 9-10) before editing
2. Changes to critical rules require manager approval
3. All modifications must pass validation before saving
4. Testing recommended before reactivating modified rules
5. Audit trail entry required for all modifications
6. Concurrent edits detected and user notified
7. Performance impact >100ms triggers optimization review
8. Rule version history maintained (last 10 versions)

#### UI Components

**Rule Edit Mode View**:

**Header**:
- Rule name (editable)
- Status badge (shows deactivated if temporarily deactivated for editing)
- Edit mode indicator: "Edit Mode" (orange badge)
- Save buttons: "Save as Draft", "Save and Test", "Save and Reactivate"
- Cancel button

**Deactivation Warning Modal**:
- Warning icon and message
- Current rule status and activity level
- Three options (radio buttons):
  - Deactivate and Edit (recommended for critical)
  - Edit While Active (for minor changes)
  - Create Copy and Edit (safest)
- Deactivation reason field (if deactivate selected)
- Proceed button

**Edit Form** (same as create, but pre-filled):
- Basic information section (editable)
- Conditions section (add/edit/delete conditions)
- Actions section (add/edit/delete actions)
- Change tracking indicators (modified fields highlighted in light yellow)

**Change Summary Modal**:
- Changes overview:
  - Conditions added/modified/deleted
  - Actions added/modified/deleted
  - Priority changed
  - Other configuration changes
- Impact assessment:
  - Estimated trigger volume change
  - Performance impact
  - Affected rules/systems
- Before/After comparison view (side-by-side)
- Test recommendation
- Action buttons: "Test Changes", "Save Anyway", "Cancel"

**Test Panel** (integrated into edit flow):
- Recommended test scenarios (updated to reflect changes)
- Quick test option
- Run tests button
- Test results inline

**Audit Trail Entry Preview** (before save):
- Shows what will be recorded in audit trail
- Change summary
- Reason field (user input)
- Business justification field (user input)
- Approval requirement indicator (if applicable)

**Conflict Resolution Modal** (concurrent edits):
- Three-column view:
  - Original (before any changes)
  - Your changes
  - Their changes
- Conflict indicators
- Merge options:
  - Overwrite with your changes
  - Discard your changes
  - Manual merge (select per field)
- Merge button

#### Acceptance Criteria

- [ ] User can edit existing rule configuration
- [ ] Deactivation warning appears for active critical rules
- [ ] Edit mode clearly indicates rule is being modified
- [ ] Changes are tracked and highlighted in UI
- [ ] Validation detects invalid configuration before saving
- [ ] Conflict detection identifies overlapping rules
- [ ] Impact assessment estimates trigger volume and performance changes
- [ ] Testing can be performed before reactivating
- [ ] Changes create audit trail entry with complete details
- [ ] Notifications sent to affected users/systems
- [ ] Concurrent edit conflicts are detected and resolved
- [ ] Approval workflow triggered for critical rule changes
- [ ] Rule version history maintained

---

### UC-BR-009: Deactivate/Reactivate Rule

**Priority**: P1 (High)
**Actor**: System Administrator, Operations Manager
**Description**: Temporarily deactivate business rule or reactivate previously deactivated rule with proper controls and audit trail.

#### Preconditions
- User has "business_rules:manage" permission
- Business rule exists in the system
- For critical rules (priority 9-10), manager approval may be required

#### Postconditions
- Rule status updated (active ↔ inactive)
- Rule evaluation paused or resumed
- Audit trail entry created
- Stakeholders notified of status change

#### Main Flow

1. User navigates to **Business Rules Management** page
2. User filters rules to show "Active" only
3. System displays 38 active rules
4. User searches for "Pizza Slice Holding Time Limits"
5. System highlights matching rule in list
6. User clicks **"⋮"** menu button on rule row
7. System displays context menu options:
   - View Details
   - Edit Rule
   - Test Rule
   - **Deactivate Rule** ← User selects this
   - Duplicate Rule
   - Delete Rule
8. System displays **Deactivate Rule Confirmation** modal:
   - **Rule**: Pizza Slice Holding Time Limits
   - **Current Status**: Active (processing ~156 transactions/day)
   - **Impact**: Food safety monitoring will stop. Manual monitoring required.
   - **Priority**: 10 (Critical) ⚠️
   - **Reason Required**: Yes (for audit trail)
9. User enters deactivation reason:
   "Temporary deactivation for 2 hours during kitchen equipment upgrade. Manual monitoring procedures in place."
10. System validates reason (minimum 10 characters ✓)
11. User clicks **"Deactivate"** button
12. System checks rule priority (priority 10 = critical)
13. System displays additional confirmation:
   "This is a critical food safety rule. Deactivation requires manager acknowledgment. Continue?"
14. User clicks **"I Acknowledge"** checkbox
15. User clicks **"Confirm Deactivation"**
16. System performs deactivation:
    - Updates rule status from "active" to "inactive"
    - Stops rule evaluation immediately (no new triggers)
    - Preserves rule configuration (conditions, actions unchanged)
    - Creates audit trail entry
17. System creates audit entry:
    - **Action**: deactivated
    - **Rule ID**: PSR-001
    - **Reason**: "Temporary deactivation for 2 hours during kitchen equipment upgrade. Manual monitoring procedures in place."
    - **Performed By**: Current user
    - **Timestamp**: 2025-01-16 14:30:00
    - **Approved By**: Current user (acknowledged critical rule deactivation)
    - **Business Justification**: "Equipment upgrade requires temporary system deactivation"
    - **Impact Assessment**: "Manual monitoring procedures activated"
18. System sends notifications:
    - **Kitchen Managers**: "Critical Alert: Pizza Slice Holding Time rule deactivated. Manual monitoring required."
    - **Quality Team**: "Food safety rule deactivated for 2 hours. Review manual procedures."
19. System displays success message with reminder:
   "Rule deactivated successfully. Remember to reactivate after equipment upgrade (target: 2 hours)."
20. System updates rule list showing rule with "Inactive" badge
21. User completes equipment upgrade (2 hours later)
22. User returns to Business Rules Management page
23. User filters to show "Inactive" rules
24. System displays 8 inactive rules (including PSR-001)
25. User clicks **"⋮"** menu on "Pizza Slice Holding Time Limits" rule
26. User selects **"Reactivate Rule"**
27. System displays **Reactivate Rule Confirmation** modal:
    - **Rule**: Pizza Slice Holding Time Limits
    - **Deactivated**: 2 hours ago by [User Name]
    - **Deactivation Reason**: Equipment upgrade
    - **Reactivation Note**: Required
28. User enters reactivation note:
   "Equipment upgrade completed successfully. All systems tested and operational. Resuming automated food safety monitoring."
29. User clicks **"Reactivate"** button
30. System performs reactivation:
    - Updates rule status from "inactive" to "active"
    - Resumes rule evaluation immediately
    - Validates rule configuration (still valid ✓)
    - Creates audit trail entry
31. System creates audit entry:
    - **Action**: activated
    - **Rule ID**: PSR-001
    - **Reason**: "Equipment upgrade completed successfully. All systems tested and operational. Resuming automated food safety monitoring."
    - **Performed By**: Current user
    - **Timestamp**: 2025-01-16 16:30:00
32. System sends notifications:
    - **Kitchen Managers**: "Pizza Slice Holding Time rule reactivated. Automated monitoring resumed."
    - **Quality Team**: "Food safety rule active. Manual monitoring procedures can be discontinued."
33. System displays success message:
   "Rule reactivated successfully. Automated food safety monitoring resumed."
34. System updates rule list showing rule with "Active" badge

#### Alternative Flows

**A1: Scheduled Reactivation**
- At step 11, user wants to schedule automatic reactivation
- User checks **"Schedule Reactivation"** checkbox
- System displays date/time picker
- User sets reactivation time: "2 hours from now" or specific time "16:30"
- User completes deactivation
- System schedules reactivation task
- At scheduled time, system automatically reactivates rule
- System sends notification: "Rule auto-reactivated as scheduled"

**A2: Bulk Deactivate Multiple Rules**
- At step 2, user needs to deactivate multiple related rules
- User selects checkboxes for 3 pizza-related rules
- User clicks **"Bulk Actions"** dropdown
- User selects **"Deactivate Selected"**
- System displays bulk deactivation confirmation:
  - List of 3 rules to deactivate
  - Common reason field
  - Impact summary for all rules
- User enters reason: "Weekend menu change - pizza not available"
- System deactivates all 3 rules
- System creates individual audit entries for each
- System sends consolidated notification listing all deactivated rules

**A3: Emergency Deactivation (Fast Track)**
- At step 7, critical issue requires immediate deactivation
- User clicks **"Emergency Deactivate"** button (red, prominent)
- System displays minimal confirmation (streamlined for speed):
  - Reason field (shorter minimum, 5 characters)
  - Single-click confirmation
- User enters: "Critical bug detected in rule logic"
- System immediately deactivates without additional prompts
- System sends critical alerts to all stakeholders
- System flags for urgent review

#### Exception Flows

**E1: Reactivation Validation Failure**
- At step 30, system detects rule configuration is invalid
- Validation error: "Condition references field 'item.temperature' which was removed in recent system update"
- System displays error: "Cannot reactivate rule. Configuration is no longer valid. Edit rule to fix issues before reactivating."
- System provides options:
  - Edit rule to fix issues
  - Contact support
  - Keep rule deactivated
- User clicks **"Edit Rule"**
- System opens rule in edit mode
- User updates condition to use new field name
- User saves and reactivates
- Returns to step 30

**E2: Approval Required (Critical Rule)**
- At step 11, system detects deactivation of critical rule by non-manager
- System displays: "Deactivation of critical rules requires manager approval. Submit deactivation request?"
- User clicks **"Submit Request"**
- System creates deactivation request with status "pending"
- System sends approval request to manager
- Manager reviews and approves
- System executes deactivation
- User receives notification of approval and deactivation

**E3: Dependent Rules Affected**
- At step 13, system detects other rules depend on this rule
- System displays warning: "2 other rules reference this rule and may be affected. Review dependent rules before deactivating."
- System lists dependent rules:
  - "Pizza Slice Display Temperature" (references PSR-001 for violation escalation)
  - "Pizza Inventory Reorder" (uses PSR-001 compliance data)
- User reviews impact
- User decides to:
  - Deactivate all dependent rules together, OR
  - Deactivate only selected rule (dependencies handled gracefully), OR
  - Cancel deactivation
- User selects "Deactivate all" and proceeds
- Returns to step 15

**E4: Rule Currently Executing**
- At step 16, system detects rule is currently executing for active transaction
- System delays deactivation until current execution completes
- System displays: "Rule is currently processing transaction. Deactivation will complete in ~2 seconds after execution completes."
- System waits for execution to finish
- System completes deactivation
- Continues to step 17

#### Business Rules

1. Deactivation reason required (minimum 10 characters for standard, 5 for emergency)
2. Critical rules (priority 9-10) require acknowledgment or approval for deactivation
3. Scheduled reactivation limited to 7 days in future
4. Emergency deactivation bypasses some confirmation steps
5. Dependent rules are identified and user is warned
6. Rule cannot be deleted while active (must deactivate first)
7. Audit trail mandatory for all status changes
8. Reactivation performs configuration validation before resuming

#### UI Components

**Deactivate Rule Confirmation Modal**:

**Header**:
- Modal title: "Deactivate Rule"
- Close button (X)

**Content**:
- Rule information card:
  - Rule name
  - Current status badge
  - Current activity (triggers/day)
  - Priority with critical indicator if 9-10
- Impact warning (based on rule category):
  - Food safety: "Critical - Manual monitoring required"
  - Inventory: "Stock management automation paused"
  - Waste: "Waste tracking will be manual"
- Deactivation reason field:
  - Textarea (minimum 10 characters)
  - Character counter
  - Validation feedback
- Schedule reactivation section (optional):
  - Checkbox: "Schedule automatic reactivation"
  - Date/time picker (if checked)
  - Quick options: "1 hour", "2 hours", "1 day", "Custom"
- Critical rule acknowledgment (if priority 9-10):
  - Checkbox: "I acknowledge this is a critical rule and manual procedures are in place"
  - Warning text explaining implications

**Action Buttons**:
- "Deactivate" (red, primary)
- "Emergency Deactivate" (dark red, for critical issues)
- "Cancel" (secondary)

**Reactivate Rule Confirmation Modal**:

**Header**:
- Modal title: "Reactivate Rule"
- Close button (X)

**Content**:
- Rule information card:
  - Rule name
  - Current status: Inactive
  - Deactivated: [Time ago] by [User Name]
  - Deactivation reason: [Original reason]
- Reactivation note field:
  - Textarea (required)
  - Placeholder: "Describe why rule is being reactivated and confirm readiness"
- Configuration validation status:
  - ✅ "Rule configuration is valid and ready for reactivation"
  - ❌ "Rule configuration has errors. Edit required before reactivation."
- Impact summary:
  - "Automated monitoring will resume immediately"
  - "Manual procedures can be discontinued"

**Action Buttons**:
- "Reactivate" (green, primary)
- "Edit First" (secondary, if validation issues)
- "Cancel" (secondary)

**Bulk Deactivation Modal**:
- List of selected rules (with status, priority)
- Common reason field
- Impact summary for all rules
- Individual checkbox to exclude specific rules
- Action buttons: "Deactivate All", "Cancel"

**Emergency Deactivation Dialog** (streamlined):
- Minimal UI for speed
- Rule name
- Emergency reason field (5 character minimum)
- Single confirm button: "Emergency Deactivate Now"

**Dependent Rules Warning**:
- List of dependent rules with impact description
- Options:
  - Radio: "Deactivate selected rule only"
  - Radio: "Deactivate selected rule and all dependent rules"
  - Radio: "Cancel deactivation"
- Proceed button (based on selection)

#### Acceptance Criteria

- [ ] User can deactivate active rule with reason
- [ ] Deactivation reason validation enforced
- [ ] Critical rules require acknowledgment for deactivation
- [ ] Rule evaluation stops immediately upon deactivation
- [ ] Audit trail entry created with complete details
- [ ] Notifications sent to affected stakeholders
- [ ] Scheduled reactivation works correctly
- [ ] User can reactivate deactivated rule with note
- [ ] Reactivation validation checks configuration
- [ ] Rule evaluation resumes immediately upon reactivation
- [ ] Bulk deactivation/reactivation works for multiple rules
- [ ] Emergency deactivation provides fast-track process
- [ ] Dependent rules are identified and user is warned
- [ ] Rule status badge updates correctly in UI

---

### UC-BR-010: Audit Rule Changes

**Priority**: P1 (High)
**Actor**: Compliance Officer, Operations Manager, Auditor
**Description**: Review comprehensive audit trail of all business rule changes, modifications, activations, and deactivations for compliance and forensic analysis.

#### Preconditions
- User has "audit:view" permission
- Business rules have been created, modified, activated, or deactivated
- Audit trail data exists (minimum 1 day of history)

#### Postconditions
- User understands complete change history
- Compliance requirements are met
- Audit reports generated for regulatory review

#### Main Flow

1. User navigates to **Business Rules Management** page
2. User clicks **"Audit Trail"** tab
3. System displays **Rule Audit Trail** view
4. System shows audit entries list (default: last 30 days, newest first):

   **Entry 1** (most recent):
   - **Timestamp**: 2025-01-16 16:30:15
   - **Action**: activated (green badge)
   - **Rule**: PSR-001 - Pizza Slice Holding Time Limits
   - **Performed By**: John Smith (Operations Manager)
   - **Reason**: "Equipment upgrade completed. All systems tested and operational."
   - **View Details** link

   **Entry 2**:
   - **Timestamp**: 2025-01-16 14:30:00
   - **Action**: deactivated (red badge)
   - **Rule**: PSR-001 - Pizza Slice Holding Time Limits
   - **Performed By**: John Smith (Operations Manager)
   - **Reason**: "Temporary deactivation for kitchen equipment upgrade"
   - **View Details** link

   **Entry 3**:
   - **Timestamp**: 2025-01-15 10:15:30
   - **Action**: modified (orange badge)
   - **Rule**: PSR-001 - Pizza Slice Holding Time Limits
   - **Performed By**: Sarah Johnson (System Administrator)
   - **Changes**: 2 conditions modified, 1 action added
   - **View Details** link

   **Entry 4**:
   - **Timestamp**: 2025-01-12 09:00:00
   - **Action**: created (blue badge)
   - **Rule**: PSR-001 - Pizza Slice Holding Time Limits
   - **Performed By**: System Administrator
   - **Business Justification**: "Implement automated food safety monitoring per HACCP requirements"
   - **View Details** link

5. User wants to investigate modification from Entry 3
6. User clicks **"View Details"** on Entry 3
7. System opens **Audit Entry Detail** drawer
8. System displays comprehensive change details:

   **Audit Entry Header**:
   - **ID**: AUD-2501-00347
   - **Timestamp**: 2025-01-15 10:15:30
   - **Action**: modified
   - **Rule**: PSR-001 - Pizza Slice Holding Time Limits
   - **Category**: food-safety
   - **Priority**: 10 (Critical)

   **User Information**:
   - **Performed By**: Sarah Johnson (System Administrator)
   - **User ID**: USR-0023
   - **IP Address**: 192.168.1.45
   - **User Agent**: Mozilla/5.0... (Chrome on Windows)

   **Changes Summary**:
   - **Conditions Modified**: 2
     - Condition 2: holdingTime threshold changed
   - **Actions Added**: 1
     - Action 3: logCompliance added
   - **Priority**: No change
   - **Status**: No change

   **Detailed Changes** (before → after comparison):

   **Condition 2** (Modified):
   - **Field**: item.holdingTime (no change)
   - **Operator**: greaterThan (no change)
   - **Value**: 240 → **210** (changed)
   - **Change**: Reduced holding time threshold from 4 hours to 3.5 hours

   **Action 3** (Added):
   - **Type**: logCompliance
   - **Parameters**:
     - violationType: "food-safety"
     - riskLevel: "high"
     - autoNotifyHealthDept: false
   - **Change**: New action added to log compliance violations

   **Justification & Impact**:
   - **Reason**: "Update holding time to align with new food safety consultation recommendations"
   - **Business Justification**: "Align with updated food safety consultation recommendations"
   - **Impact Assessment**: "15% increase in triggers expected based on current data. Minimal performance impact (+10ms)."
   - **Approved By**: Auto-approved (non-critical change)

   **Related Information**:
   - **Test Results**: 6 scenarios tested, all passed ✅
   - **Performance Before**: 38ms average
   - **Performance After**: 48ms average (+10ms)
   - **Related Audit Entries**: None

9. User reviews change details and understands modification rationale
10. User clicks **"Export Entry"** button
11. System generates audit entry report as PDF
12. User closes detail drawer
13. User wants to filter audit trail to focus on critical changes
14. User clicks **"Filters"** button
15. System displays filter panel
16. User configures filters:
    - **Action**: "modified" (checkbox checked)
    - **Rule Category**: "food-safety" (checkbox checked)
    - **Date Range**: "Last 90 days"
    - **Performed By**: All users (default)
    - **Priority**: 9-10 (critical only)
17. User clicks **"Apply Filters"**
18. System refreshes audit list showing only critical food safety rule modifications
19. System displays: "23 audit entries match your filters"
20. User reviews filtered results
21. User wants to generate compliance report for external auditors
22. User clicks **"Generate Report"** button
23. System displays **Audit Report Configuration** dialog
24. User selects report parameters:
    - **Report Type**: "Compliance Audit Report"
    - **Date Range**: "Q1 2025 (Jan 1 - Mar 31)"
    - **Include**:
      - ✅ All rule changes (created, modified, deleted)
      - ✅ Activation/deactivation history
      - ✅ Business justifications
      - ✅ Impact assessments
      - ✅ Approval workflows
      - ❌ Technical details (IP addresses, user agents) - Not needed for external audit
    - **Format**: PDF
    - **Group By**: Rule category
25. User clicks **"Generate Report"**
26. System processes request (15 seconds for 90 days of data)
27. System displays progress: "Generating report... Processing 347 audit entries"
28. System completes report generation
29. System downloads: "Compliance_Audit_Report_Q1_2025.pdf"
30. User opens report and reviews:
    - Executive summary (overview of changes)
    - Category breakdown (food-safety, quality-control, etc.)
    - Detailed change log (chronological)
    - Business justifications (for all critical changes)
    - Approval history (for rules requiring approval)
    - Compliance metrics (change frequency, approval rate, etc.)
31. User shares report with external auditors
32. User returns to audit trail view

#### Alternative Flows

**A1: Search for Specific Rule Changes**
- At step 3, user wants to find all changes to specific rule
- User enters rule name in search box: "Pizza Slice Holding Time"
- System filters audit trail to show only entries for that rule
- System displays: "12 audit entries for 'Pizza Slice Holding Time Limits'"
- User reviews complete change history for single rule

**A2: Track User Activity**
- At step 14, user wants to audit specific user's actions
- User filters by **Performed By**: "John Smith"
- System shows all audit entries performed by John Smith
- System displays summary:
  - Total actions: 47
  - Created: 3 rules
  - Modified: 12 rules
  - Activated: 18 times
  - Deactivated: 14 times
- User can identify unusual activity patterns

**A3: Export All Audit Data (Data Analysis)**
- At step 22, user wants raw data for analysis
- User selects **Report Type**: "Raw Data Export"
- User selects **Format**: CSV
- System exports all audit entries with all fields
- User imports into Excel/PowerBI for advanced analysis

**A4: Compare Multiple Versions**
- At step 7, user wants to compare rule across multiple changes
- User clicks **"Version History"** button in audit entry detail
- System displays version timeline showing all modifications
- User selects two versions to compare: "v1.0" and "v3.2"
- System shows side-by-side comparison highlighting all differences
- User understands cumulative changes over time

#### Exception Flows

**E1: No Audit Data Available**
- At step 3, system finds no audit data for selected period
- System displays: "No audit entries found for the selected date range. Try extending the date range."
- User extends date range from "Last 7 days" to "Last 30 days"
- System displays audit entries
- Returns to step 4

**E2: Report Generation Timeout**
- At step 26, report generation takes >60 seconds due to large dataset
- System displays: "Report generation is taking longer than expected due to large dataset (5,000+ entries). Continue?"
- User clicks **"Continue"**
- System continues processing with progress updates
- Alternatively, user can:
  - Reduce date range to speed up generation
  - Cancel and try CSV export instead (faster for large datasets)

**E3: Missing Business Justification (Old Entry)**
- At step 8, user views old audit entry (before justification was required)
- System displays: "Business justification not available for entries before 2024-12-01"
- Audit entry shows all available information except justification
- User notes limitation for historical data

**E4: Insufficient Permissions for Detail View**
- At step 7, user tries to view sensitive audit entry details
- System checks permissions: user has "audit:view" but not "audit:view_sensitive"
- System displays limited detail view:
  - Basic information shown (timestamp, action, rule, user)
  - Sensitive information hidden (IP address, user agent, business justification)
  - Message: "Full details require 'audit:view_sensitive' permission. Contact administrator."
- User can view summary but not sensitive details

#### Business Rules

1. Audit trail is immutable (entries cannot be modified or deleted)
2. All rule changes automatically create audit entries
3. Audit data retained indefinitely (no deletion)
4. Business justification required for all critical rule changes (from 2024-12-01)
5. Approval workflow tracked in audit trail
6. Impact assessment captured for modifications
7. User information (ID, IP, user agent) captured for all actions
8. Test results linked to audit entries (if tests performed)

#### UI Components

**Rule Audit Trail View**:

**Header**:
- Tab title: "Audit Trail"
- Date range selector (dropdown: Last 7 days, Last 30 days, Last 90 days, Custom)
- Search box (search by rule name, user, reason)
- Filters button
- Generate Report button
- Export button (CSV quick export)
- Refresh button (with last updated timestamp)

**Filters Panel** (collapsible sidebar):
- **Action** (checkboxes):
  - Created
  - Modified
  - Activated
  - Deactivated
  - Deleted
- **Rule Category** (checkboxes):
  - Fractional Sales
  - Food Safety
  - Quality Control
  - Inventory Management
  - Waste Management
  - Other categories...
- **Priority** (checkboxes):
  - Critical (9-10)
  - High (7-8)
  - Medium (4-6)
  - Low (1-3)
- **Performed By** (user multi-select)
- **Date Range** (date picker)
- **Apply Filters** button
- **Clear All** button

**Audit Entries List**:
- Table or timeline view (toggle option)
- Columns:
  - Timestamp (sortable, with relative time)
  - Action (badge with color: green=activated, red=deactivated, orange=modified, blue=created, gray=deleted)
  - Rule Name (with category badge)
  - Performed By (user name with avatar)
  - Reason (truncated with "View Details" link)
  - Changes Summary (e.g., "2 conditions, 1 action")
- Pagination (50 entries per page)
- Clickable rows to open detail drawer

**Audit Entry Detail Drawer**:

**Header**:
- Audit entry ID
- Action badge
- Close button

**Sections**:

1. **Entry Information**:
   - Timestamp (full date/time)
   - Action type
   - Rule name (link to rule details)
   - Rule category and priority

2. **User Information**:
   - Performed by (name, avatar, role)
   - User ID
   - IP address
   - User agent

3. **Changes** (if action = modified):
   - Changes summary counts
   - Before/After comparison table:
     - Field, Before Value, After Value, Change Description
   - Color-coded: green=added, yellow=modified, red=removed
   - Expandable sections for detailed changes

4. **Justification & Impact**:
   - Reason (user-entered)
   - Business justification
   - Impact assessment
   - Approved by (if applicable)

5. **Related Information**:
   - Test results (if available)
   - Performance metrics (before/after)
   - Related audit entries (links)
   - Dependent rules affected

6. **Actions**:
   - Export Entry (PDF)
   - View Rule (navigate to rule details)
   - View Version History
   - Copy Entry ID

**Audit Report Configuration Dialog**:

**Report Type Selection**:
- Radio buttons:
  - Compliance Audit Report (executive summary + details)
  - Technical Change Log (full technical details)
  - User Activity Report (grouped by user)
  - Raw Data Export (CSV/Excel)

**Parameters**:
- Date range (date pickers: from/to)
- Include sections (checkboxes):
  - Rule changes (created, modified, deleted)
  - Activation/deactivation history
  - Business justifications
  - Impact assessments
  - Approval workflows
  - Technical details (IP, user agent, etc.)
  - Test results
  - Performance metrics
- Group by (dropdown):
  - Chronological (default)
  - Rule category
  - User
  - Action type
- Format (radio):
  - PDF (formatted report)
  - CSV (data export)
  - Excel (data export with formatting)

**Action Buttons**:
- Generate Report (primary)
- Preview (shows report outline before generation)
- Cancel (secondary)

**Version History View** (modal):
- Timeline showing all versions of rule
- Each version shows:
  - Version number
  - Timestamp
  - User
  - Changes summary
- Compare button (select 2 versions to compare)
- Restore button (if user has permission)

**Side-by-Side Comparison View**:
- Two-column layout
- Version 1 (left) vs Version 2 (right)
- Synchronized scrolling
- Highlighted differences
- Legend: Added, Modified, Removed

#### Acceptance Criteria

- [ ] Audit trail displays all rule changes chronologically
- [ ] Audit entries show action type, rule, user, timestamp, reason
- [ ] Detail view shows complete change information (before/after)
- [ ] Filters work correctly and can be combined
- [ ] Search finds audit entries by rule name, user, or reason
- [ ] User activity can be tracked (all actions by specific user)
- [ ] Business justification and impact assessment are captured
- [ ] Approval workflow is tracked in audit trail
- [ ] Related information (test results, performance) is linked
- [ ] Audit reports can be generated in multiple formats (PDF, CSV)
- [ ] Reports include executive summary and detailed change log
- [ ] Audit trail data is immutable (no edit/delete options)
- [ ] Version history shows all changes to a rule over time
- [ ] Side-by-side comparison highlights differences between versions
- [ ] Export functionality works for individual entries and bulk data

---

**Document Control**:
- **Created**: 2025-01-16
- **Version**: 1.0
- **Status**: Planned Implementation
- **Next Review**: Upon module implementation start


Due to token limitations, I'll now save this UC document and continue with the remaining use cases in the next response. Let me update the todo list status.
