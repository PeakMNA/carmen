# Business Requirements: Workflow Management

## Document Information
- **Module**: System Administration / Workflow Management
- **Version**: 1.0
- **Last Updated**: 2026-01-16
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

The Workflow Management module provides a comprehensive system for configuring and managing approval workflows for hospitality business processes. It enables administrators to define multi-stage approval workflows with dynamic routing, SLA management, user assignments, and automated notifications to streamline procurement and operational processes.

## Business Context

### Hospitality Industry Requirements

In hospitality operations, procurement and operational processes require structured approval workflows to ensure:
- **Financial Control**: Multi-level approvals based on monetary thresholds
- **Departmental Oversight**: Department-specific review and authorization
- **Operational Efficiency**: Automated routing and SLA monitoring
- **Compliance**: Audit trails and role-based access control
- **Communication**: Automated notifications to stakeholders

### Problem Statement

Manual approval processes in hospitality environments face several challenges:
- Inconsistent approval routing leading to delays
- Lack of visibility into approval status and bottlenecks
- Difficulty managing SLAs and escalations
- Manual notification processes causing communication gaps
- Inflexible workflows that cannot adapt to business rule changes
- Limited audit trails for compliance and analysis

### Solution Objectives

The Workflow Management system aims to:
1. Provide flexible, configurable workflows for multiple document types
2. Enable dynamic routing based on business rules (e.g., amount thresholds)
3. Automate notifications and SLA monitoring
4. Support role-based assignments with department and location context
5. Maintain comprehensive audit trails for all workflow activities
6. Integrate with procurement and operational modules

## Functional Requirements

### FR-WF-001: Workflow Configuration

**Description**: System must allow administrators to create and configure approval workflows for different document types with multiple stages, routing rules, and notifications.

**Business Need**: Different business processes (purchase requests, store requisitions) require distinct approval workflows with varying complexity and approval hierarchies.

**Requirements**:
- Create workflows for different document types (Purchase Request, Store Requisition)
- Define unique workflow name (max 100 characters)
- Select workflow type from predefined list
- Specify document reference pattern with dynamic variables (e.g., "GP-{YYYY}-{00000}")
- Add description field for workflow purpose
- Set workflow status (Active, Inactive, Draft)
- Support multiple workflows for the same document type
- Prevent duplicate workflow names across the system

**Acceptance Criteria**:
- ✅ Administrators can create new workflows via configuration interface
- ✅ Workflow names must be unique system-wide
- ✅ Only active workflows appear in document creation dropdowns
- ✅ Document reference pattern generates sequential numbers automatically
- ✅ Draft workflows can be saved and edited before activation
- ✅ System validates all required fields before saving

**Priority**: High
**Dependencies**: User Management, Permission Management

---

### FR-WF-002: Workflow Stages

**Description**: System must support configurable multi-stage approval workflows with stage-specific settings for SLA, available actions, field visibility, user assignments, and role types.

**Business Need**: Approval processes require multiple stages with different approval authorities, timeframes, and visibility requirements. Each stage may have different users assigned based on their organizational role.

**Requirements**:
- Define unlimited workflow stages in sequential order
- Configure stage properties:
  - Stage name (max 100 characters)
  - Stage description
  - SLA duration and unit (hours/days)
  - Available actions (Submit, Approve, Reject, Send Back)
  - Field visibility rules (hide price fields if needed)
  - Role type (Requester, Purchaser, Approver, Reviewer)
- Assign users to each stage
- Support role-based stage assignments
- Allow empty user assignments for stages
- Configure field-level hiding per stage (price per unit, total price)
- Define "Completed" terminal stage
- Support stage reordering

**Stage Flow**:
1. Request Creation → 2. Purchasing Review → 3. Department Approval → 4. Finance Review → 5. Final Approval → 6. Completed

**Role Types**:
- **Requester**: Users who can create and submit requests
- **Purchaser**: Purchasing staff who review requests for accuracy
- **Approver**: Department heads or managers who approve requests
- **Reviewer**: Finance or senior management who provide final review

**Acceptance Criteria**:
- ✅ Workflows support minimum 2 stages (creation + completion)
- ✅ Each stage has configurable SLA with visual indicators
- ✅ Available actions can be customized per stage
- ✅ Field visibility rules apply correctly at each stage
- ✅ Users can be assigned to stages via user assignment interface
- ✅ Role type determines user selection options
- ✅ SLA countdown starts when document enters stage
- ✅ System validates stage configuration before activation

**Priority**: High
**Dependencies**: User Management, Document Management

---

### FR-WF-003: Dynamic Routing Rules

**Description**: System must support conditional routing between stages based on document field values, enabling dynamic workflow paths that adapt to business rules.

**Business Need**: Approval requirements vary based on request characteristics (amount, category, urgency). Low-value requests should skip unnecessary approval stages, while high-value requests require additional approvals.

**Requirements**:
- Define routing rules with:
  - Rule name and description
  - Trigger stage (when to evaluate rule)
  - Condition field (document property to evaluate)
  - Operator (eq, lt, gt, lte, gte)
  - Value (threshold for comparison)
  - Action type (SKIP_STAGE, NEXT_STAGE)
  - Target stage (destination stage)
- Support multiple routing rules per workflow
- Evaluate rules in sequential order
- Support amount-based routing (common use case)
- Allow rules to skip stages or specify next stage
- Log all routing decisions for audit

**Example Routing Rules**:
- Amount ≤ 10,000 BAHT → Skip to Completed (bypass GM approval)
- Amount > 10,000 BAHT → Route to Final Approval
- Amount ≤ 5,000 BAHT → Skip to Completed (market list workflow)

**Operators**:
- `eq`: Equal to
- `lt`: Less than
- `gt`: Greater than
- `lte`: Less than or equal to
- `gte`: Greater than or equal to

**Acceptance Criteria**:
- ✅ Routing rules can be added, edited, and removed
- ✅ Rules evaluate correctly based on document field values
- ✅ Multiple rules can exist for the same trigger stage
- ✅ First matching rule determines routing path
- ✅ Routing decisions are logged in audit trail
- ✅ Invalid rules are prevented (e.g., circular routing)
- ✅ Rules display clearly in workflow configuration

**Priority**: High
**Dependencies**: Workflow Stages, Document Management

---

### FR-WF-004: Notification Configuration

**Description**: System must support automated notifications at workflow events with configurable recipients, channels, and message templates.

**Business Need**: Stakeholders need timely notifications about workflow events (submissions, approvals, rejections) to ensure responsive processing and prevent bottlenecks.

**Requirements**:
- Configure notifications for workflow events:
  - Request Submitted
  - Pending Approval
  - Request Approved
  - Request Rejected
  - Request Sent Back
  - SLA Warning
- Define notification properties:
  - Event trigger (onSubmit, onApprove, onReject, onSendBack, onSLA)
  - Recipient roles (Requester, Current Approver, Previous Approver, Next Approver, All Previous Approvers, Approver's Manager)
  - Notification channels (Email, System)
  - Event description
- Support multiple notification configurations per event
- Allow multiple recipients per notification
- Support multiple delivery channels simultaneously

**Notification Events**:
- **onSubmit**: When request is initially submitted
- **onApprove**: When approver approves request
- **onReject**: When approver rejects request
- **onSendBack**: When approver sends request back for revision
- **onSLA**: When SLA threshold is breached

**Acceptance Criteria**:
- ✅ Notifications are sent automatically when events occur
- ✅ Recipients receive notifications via configured channels
- ✅ Email notifications contain workflow context
- ✅ System notifications appear in user notification panel
- ✅ SLA warnings trigger before SLA breach
- ✅ Notification configuration prevents duplicate sends
- ✅ Failed notifications are logged and retried

**Priority**: High
**Dependencies**: User Management, Email Service, Notification Service

---

### FR-WF-005: Notification Templates

**Description**: System must support customizable email templates with dynamic variable substitution for workflow notifications.

**Business Need**: Notification content must be professional, branded, and contain relevant workflow context. Templates enable consistent communication while allowing customization per event type.

**Requirements**:
- Create notification templates with:
  - Template name
  - Event trigger association
  - Template description
  - Subject line with variables
  - Email body content with variables
- Support template variables:
  - `{{request.number}}`: Document reference number
  - `{{requester.name}}`: Requester full name
  - `{{requester.department}}`: Requester's department
  - `{{approver.name}}`: Current approver's name
  - `{{request.amount}}`: Request amount
  - `{{request.date}}`: Request date
  - `{{workflow.nextStage}}`: Name of next workflow stage
  - `{{workflow.slaRemaining}}`: Time remaining before SLA breach
  - `{{system.companyName}}`: Company name
- Support multiple templates per event type
- Allow template preview with sample data
- Support rich text formatting in email body

**Default Templates**:
1. Request Submitted Template
2. Request Approved Template
3. Request Rejected Template
4. SLA Warning Template

**Acceptance Criteria**:
- ✅ Templates can be created, edited, and deleted
- ✅ Variable substitution works correctly in subject and body
- ✅ Templates render properly in email clients
- ✅ Preview shows template with sample data
- ✅ Missing variables display gracefully
- ✅ Templates maintain consistent formatting
- ✅ Template selection links to correct event triggers

**Priority**: Medium
**Dependencies**: Notification Configuration, Email Service

---

### FR-WF-006: User Assignment to Stages

**Description**: System must allow administrators to assign users to workflow stages based on department, location, and role type, enabling role-based workflow execution.

**Business Need**: Different stages require different approval authorities. Users should be assigned to stages based on their organizational role, department, and location to ensure appropriate review and authorization.

**Requirements**:
- Assign users to workflow stages via user selection interface
- Filter assignable users by:
  - Role type (matching stage role type)
  - Department
  - Location
- Display user information:
  - User name
  - Department
  - Location
  - Avatar/initials
- Support multiple users per stage
- Allow removal of assigned users
- Support empty assignments (dynamic assignment at runtime)
- Validate user permissions before assignment

**Assignment Rules**:
- Users must have appropriate system role for stage role type
- Requester stages: Any user with request creation permission
- Purchaser stages: Users with purchasing staff role
- Approver stages: Users with approval authority
- Reviewer stages: Users with review/oversight role

**Acceptance Criteria**:
- ✅ User assignment interface shows filtered user list
- ✅ Multiple users can be assigned to same stage
- ✅ Assigned users display clearly in stage configuration
- ✅ User assignment changes are saved with workflow
- ✅ Removed users no longer appear in stage
- ✅ Empty stages are allowed and handled correctly
- ✅ System validates user permissions before assignment

**Priority**: High
**Dependencies**: User Management, Role Management

---

### FR-WF-007: Product Assignment to Workflows

**Description**: System must support assignment of products/services to workflows, enabling product-specific workflow routing and filtering.

**Business Need**: Certain products or product categories may require specific approval workflows (e.g., high-value equipment, regulated items). Product assignment enables automatic workflow selection based on requested items.

**Requirements**:
- Assign products to workflows
- Display product information:
  - Product code
  - Product name
  - Category
  - Sub-category (if applicable)
  - Item group (if applicable)
- Support multiple product assignments per workflow
- Allow product filtering by category
- Support product search by code or name
- Enable bulk product assignment
- Allow removal of assigned products

**Product Categories** (Hospitality Context):
- Service (Room Service, Laundry Service, Spa Service)
- Product (Food & Beverage, Amenities)
- Facility (Meeting Room, Equipment)

**Acceptance Criteria**:
- ✅ Products can be assigned to workflows
- ✅ Product list shows relevant product information
- ✅ Search and filter work correctly
- ✅ Multiple products can be assigned simultaneously
- ✅ Assigned products display in workflow configuration
- ✅ Product assignments are saved with workflow
- ✅ Removal of products updates workflow correctly

**Priority**: Medium
**Dependencies**: Product Management, Workflow Configuration

---

### FR-WF-008: Workflow List and Search

**Description**: System must provide a comprehensive list view of all workflows with search, filtering, and pagination capabilities for efficient workflow management.

**Business Need**: Administrators need to quickly find and access workflows among potentially many configurations. List view should provide overview and enable efficient navigation.

**Requirements**:
- Display workflow list with columns:
  - Workflow name
  - Workflow type
  - Status badge (Active, Inactive, Draft)
  - Last modified date/time
  - Actions (Edit link)
- Implement search by workflow name (case-insensitive)
- Filter by:
  - Workflow type (All, Purchase Request, Store Requisition)
  - Status (All, Active, Inactive, Draft)
- Support pagination with:
  - Configurable items per page (default: 10)
  - Page navigation (First, Previous, Next, Last)
  - Page number display
  - Total count display
- Display empty state when no workflows match filters
- Show result count ("Showing X to Y of Z workflows")

**Acceptance Criteria**:
- ✅ Workflow list displays all workflows correctly
- ✅ Search filters workflows in real-time
- ✅ Type and status filters work independently and combined
- ✅ Pagination handles large workflow lists
- ✅ Last modified dates display in local timezone
- ✅ Edit link navigates to workflow detail page
- ✅ Status badges use appropriate colors
- ✅ Empty state message displays when no results

**Priority**: High
**Dependencies**: None

---

### FR-WF-009: Workflow Detail View

**Description**: System must provide a detailed view of workflow configuration with tabbed interface for different configuration aspects (General, Stages, Routing).

**Business Need**: Workflow configuration is complex with multiple interrelated components. Tabbed interface organizes information logically and prevents overwhelming users with too much information at once.

**Requirements**:
- Display workflow header with:
  - Workflow name
  - Status badge
  - Edit/View mode toggle
  - Save/Cancel buttons (in edit mode)
  - Back to list navigation
- Organize configuration into tabs:
  - **General Tab**: Basic workflow information (name, type, description, document pattern, products)
  - **Stages Tab**: Stage configuration with SLA, actions, assignments, role types
  - **Routing Tab**: Conditional routing rules with conditions and actions
- Support edit mode toggle for entire workflow
- Validate changes before saving
- Display error alerts for missing or invalid data
- Provide back navigation to workflow list

**Tab Specifications**:

**General Tab**:
- Workflow name (editable)
- Workflow type (read-only after creation)
- Description (editable)
- Document reference pattern (editable)
- Status (editable: Active/Inactive/Draft)
- Assigned products list

**Stages Tab**:
- Sequential list of stages
- Stage configuration (name, description, SLA, actions, role type)
- User assignments per stage
- Field visibility settings
- Add/remove/reorder stages

**Routing Tab**:
- List of routing rules
- Rule configuration (name, trigger stage, condition, action)
- Add/remove routing rules
- Rule precedence order

**Acceptance Criteria**:
- ✅ Workflow detail displays correctly for all workflows
- ✅ Tab navigation works smoothly
- ✅ Edit mode enables all editable fields
- ✅ Save persists all changes across tabs
- ✅ Cancel discards unsaved changes
- ✅ Validation prevents saving invalid configurations
- ✅ Error messages guide user to fix issues
- ✅ Back navigation returns to workflow list

**Priority**: High
**Dependencies**: Workflow Configuration, Stages, Routing

---

### FR-WF-010: Role-Based Workflow Access

**Description**: System must enforce role-based access control for workflow configuration, ensuring only authorized users can create, edit, or delete workflows.

**Business Need**: Workflow configuration directly impacts business process control and approvals. Access must be restricted to prevent unauthorized modifications that could compromise financial controls or compliance.

**Requirements**:
- Define permission levels:
  - **View Workflows**: View workflow list and configuration (all authenticated users)
  - **Create Workflows**: Create new workflow configurations (administrators only)
  - **Edit Workflows**: Modify existing workflows (administrators only)
  - **Delete Workflows**: Remove workflows (administrators only)
  - **Activate/Deactivate Workflows**: Change workflow status (administrators only)
- Display action buttons based on user permissions
- Prevent unauthorized API access to workflow operations
- Audit all workflow configuration changes
- Require confirmation for destructive actions (delete, deactivate)

**Acceptance Criteria**:
- ✅ Users without permissions cannot access configuration screens
- ✅ Action buttons hide for users without appropriate permissions
- ✅ API endpoints validate permissions before execution
- ✅ All configuration changes are logged with user ID and timestamp
- ✅ Confirmation dialogs appear before destructive operations
- ✅ Permission errors display user-friendly messages

**Priority**: High
**Dependencies**: Permission Management, User Management

---

## Non-Functional Requirements

### NFR-WF-001: Performance
- Workflow list must load within 2 seconds for up to 100 workflows
- Workflow detail must load within 1 second
- Search and filter must respond within 500ms
- Stage assignment changes must save within 1 second
- Notification delivery must occur within 30 seconds of event

### NFR-WF-002: Scalability
- Support up to 50 concurrent workflows across different document types
- Handle up to 20 stages per workflow
- Support up to 10 routing rules per workflow
- Handle up to 100 user assignments per workflow
- Support up to 1000 active workflow instances simultaneously

### NFR-WF-003: Data Integrity
- All workflow configurations must be stored atomically
- Concurrent edits must be prevented via optimistic locking
- Workflow deletion must be soft delete with audit trail
- Configuration changes must maintain referential integrity
- Invalid routing rules must be prevented at save time

### NFR-WF-004: Usability
- Workflow configuration interface must be intuitive for non-technical administrators
- Error messages must be clear and actionable
- Help text must be available for complex configuration options
- Configuration must be achievable within 15 minutes for standard workflows
- Interface must be responsive on tablets (1024x768 minimum)

### NFR-WF-005: Availability
- Workflow configuration system must have 99% uptime
- Workflow execution must have 99.9% uptime
- Notification delivery must have 95% success rate
- System must degrade gracefully if notification service is unavailable

### NFR-WF-006: Security
- All workflow data must be encrypted at rest
- API communications must use HTTPS
- Sensitive workflow configuration must be access-controlled
- Audit logs must be immutable and tamper-proof
- User assignments must respect organizational boundaries

---

## Business Rules

### BR-WF-001: Workflow Naming
- Workflow names must be unique across all workflows in the system
- Workflow names must not exceed 100 characters
- Workflow names must not contain special characters (/ \ : * ? " < > |)

### BR-WF-002: Workflow Activation
- Workflows must have at least 2 stages (creation + completion) before activation
- Active workflows must have all stages properly configured
- At least one stage must be assigned users or allow dynamic assignment
- Document reference pattern must be valid and unique

### BR-WF-003: Stage Configuration
- Each stage must have a unique name within the workflow
- SLA must be positive integer or zero (for terminal stages)
- Terminal "Completed" stage must have no available actions
- Field hiding rules must not hide all fields simultaneously

### BR-WF-004: Routing Rules
- Routing rules must not create circular dependencies
- Target stages must exist in the workflow
- Condition fields must be valid document properties
- Multiple rules for same trigger stage must not conflict

### BR-WF-005: User Assignment
- Assigned users must have active status
- Users must have appropriate permissions for their assigned role type
- Users must belong to valid departments and locations
- Removal of last assigned user from active stage requires confirmation

### BR-WF-006: Workflow Modification
- Active workflows with in-progress documents cannot be deleted
- Significant changes to active workflows require version increment
- Inactive workflows can be deleted if no historical documents exist
- Draft workflows can be deleted without restrictions

### BR-WF-007: Notification Configuration
- Each notification must have at least one recipient
- Each notification must have at least one delivery channel
- Template variables must be valid for the event type
- SLA warning notifications must trigger before SLA breach (configurable lead time)

---

## Success Metrics

### Operational Metrics
- **Workflow Creation Time**: Average time to configure new workflow ≤ 15 minutes
- **Configuration Error Rate**: Configuration errors during setup < 5%
- **Search Response Time**: Average search/filter time < 500ms
- **Workflow Activation Rate**: Percentage of workflows moved from draft to active > 80%

### Business Impact Metrics
- **Approval Cycle Time**: Average time for multi-stage approvals (reduction target: 30%)
- **SLA Compliance**: Percentage of workflow instances meeting SLA targets > 90%
- **Notification Delivery**: Successful notification delivery rate > 95%
- **User Adoption**: Percentage of departments using configured workflows > 85%
- **Workflow Coverage**: Percentage of business processes with configured workflows > 70%

### Quality Metrics
- **Configuration Accuracy**: Workflows operating without routing errors > 95%
- **User Satisfaction**: Administrator satisfaction with configuration interface > 4.0/5.0
- **Audit Compliance**: 100% of workflow changes captured in audit trail
- **System Availability**: Workflow engine uptime > 99.9%

---

## Glossary

- **Workflow**: A predefined sequence of stages through which a document must pass for approval
- **Stage**: A step in the workflow where specific actions can be taken by assigned users
- **SLA (Service Level Agreement)**: Maximum time allowed for a stage to be completed
- **Routing Rule**: A conditional rule that determines the next stage based on document properties
- **Role Type**: Classification of user responsibility within workflow (Requester, Purchaser, Approver, Reviewer)
- **Document Reference Pattern**: Template for generating unique document numbers
- **Terminal Stage**: Final stage in workflow where no further actions are available
- **Dynamic Assignment**: User assignment determined at runtime based on document context
- **Event Trigger**: Workflow event that initiates a notification (onSubmit, onApprove, etc.)
- **Notification Channel**: Delivery mechanism for notifications (Email, System)
- **Template Variable**: Placeholder in notification template that is replaced with actual data
- **Workflow Type**: Category of workflow corresponding to document type
- **Field Visibility**: Configuration controlling which document fields are visible at each stage

---

## Appendix

### A. Workflow Types

| Workflow Type | Description | Common Use Cases |
|---------------|-------------|------------------|
| Purchase Request | Multi-stage approval for procurement requests | General purchases, equipment acquisition, service contracts |
| Store Requisition | Internal transfer requests between locations | Inter-department transfers, stock replenishment |

### B. Available Actions by Stage

| Stage Type | Available Actions | Description |
|------------|------------------|-------------|
| Request Creation | Submit | Submit request for approval |
| Review Stages | Approve, Reject, Send Back | Approve to next stage, reject request, or return to requester |
| Terminal Stage | None | No actions available (workflow complete) |

### C. SLA Units

| Unit | Description | Typical Use |
|------|-------------|-------------|
| hours | Hourly duration | Urgent or time-sensitive stages |
| days | Daily duration | Standard review and approval stages |

### D. Routing Operators

| Operator | Symbol | Description | Example |
|----------|--------|-------------|---------|
| Equal | eq | Exact match | Status = "Approved" |
| Less Than | lt | Value less than threshold | Amount < 10000 |
| Greater Than | gt | Value greater than threshold | Amount > 50000 |
| Less Than or Equal | lte | Value less than or equal to threshold | Amount ≤ 10000 |
| Greater Than or Equal | gte | Value greater than or equal to threshold | Amount ≥ 5000 |

### E. Common Routing Patterns

1. **Amount-Based Routing** (Most Common)
   - Low value (≤ 5,000): Skip to Completed
   - Medium value (5,001 - 10,000): Department approval only
   - High value (> 10,000): Full approval chain including GM

2. **Category-Based Routing**
   - Standard supplies: Standard workflow
   - Capital equipment: Enhanced approval workflow
   - Regulated items: Compliance review workflow

3. **Urgency-Based Routing**
   - Routine: Standard SLA
   - Urgent: Reduced SLA with escalation
   - Emergency: Direct to senior approval

---

## Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-16 | System | Initial business requirements documentation |
