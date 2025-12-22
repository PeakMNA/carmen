# Business Requirements: Store Requisitions

## Document Information
- **Module**: Store Operations
- **Component**: Store Requisitions
- **Version**: 1.4.0
- **Last Updated**: 2025-12-19
- **Status**: Active - Implementation Complete

## Related Documents
- [Use Cases](./UC-store-requisitions.md) - User workflows and scenarios
- [Technical Specification](./TS-store-requisitions.md) - System architecture and components
- [Data Definition](./DD-store-requisitions.md) - Database entity descriptions
- [Flow Diagrams](./FD-store-requisitions.md) - Visual workflow diagrams
- [Validations](./VAL-store-requisitions.md) - Validation rules and Zod schemas
- [Inventory Operations Shared Method](../../shared-methods/inventory-operations/SM-inventory-operations.md) - Inventory transaction patterns
- [Costing Methods Shared Method](../../shared-methods/inventory-valuation/SM-costing-methods.md) - FIFO/AVG costing integration

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-12-05 | Documentation Team | Added Section 10: Backend Requirements (consolidated from BE document), added shared methods references |
| 1.2.0 | 2025-12-10 | Documentation Team | Synced with implemented source code - verified status values, item approval workflow, UI tabs configuration |
| 1.3.0 | 2025-12-13 | Documentation Team | Added new requisition creation page with inline add item pattern, "Requested By" field, "Request From" terminology, Location Type handling (INVENTORY/DIRECT/CONSIGNMENT) |
| 1.4.0 | 2025-12-19 | Documentation Team | Added stage-based field editability (BR-SR-014), receipt signature requirement for Issue workflow (BR-SR-015), updated FR-SR-004 with signature capture |

## 1. Executive Summary

### 1.1 Purpose
The Store Requisitions module enables hotel departments (F&B Operations, Housekeeping, Engineering) to request inventory items from the Main Store or other storage locations. It provides a structured workflow for requesting, approving, and issuing materials needed for daily operations.

### 1.2 Scope
**In Scope**:
- Requisition creation and submission by department staff
- Multi-level approval workflow for requisitions
- Item-level approval and quantity adjustments
- Inventory issuance and stock movement tracking
- Integration with Inventory Transactions module
- Real-time inventory availability checking
- Department and location-based access control
- Document status management and audit trail

**Out of Scope**:
- Direct procurement from external vendors (handled by Purchase Requests)
- Inter-hotel transfers (different module)
- Production recipes and batch manufacturing (handled by Production module)

### 1.3 Business Value
- **Operational Efficiency**: Streamlined internal material requests reduce wait times
- **Inventory Control**: Real-time tracking of stock movements between locations
- **Cost Management**: Better visibility into departmental consumption patterns
- **Audit Compliance**: Complete audit trail for all material movements
- **Prevention of Stockouts**: Proactive monitoring of department needs

---

## 2. Functional Requirements

### FR-SR-001: Requisition Creation
**Priority**: High
**User Story**: As a Chef at the F&B Kitchen, I want to create a store requisition to request supplies from the Main Store so that I have the materials needed for daily operations.

**Requirements**:
1. User shall be able to create new requisition via dedicated creation page (`/store-operations/store-requisitions/new`) with the following information:
   - Requisition number (auto-generated: SR-YYMM-NNNN format)
   - Requisition date (defaults to current date)
   - Expected delivery date (defaults to 7 days from current date)
   - Description/purpose of requisition
   - Requesting department (selectable dropdown)
   - Requested By (auto-populated with current user name, read-only)
   - Request From (source location - store/warehouse to request from)
   - Deliver To (destination - user's current location, read-only)
   - Job Code (selectable with ability to add new)
   - Project (selectable with ability to add new)
2. User shall be able to add multiple line items using **inline add item pattern**:
   - Click "Add Item" button to reveal inline input row within the items table
   - Searchable product selection using Popover + Command component pattern
   - Product search supports name and product code matching
   - Unit of measure auto-populated from product master
   - Quantity input with validation (minimum 1)
   - Unit cost and total calculated automatically
   - Confirm (✓) or Cancel (✕) inline addition
3. Each line item shall include:
   - Product selection (searchable dropdown with product code, name, unit, and cost display)
   - Unit of measure (auto-populated)
   - Requested quantity (editable)
   - Cost per unit (from product master)
   - Line total (calculated)
   - Current inventory availability display
4. System shall validate inventory availability before submission
5. System shall save requisition as draft for later completion
6. System shall support bulk item addition via templates or past requisitions
7. System shall handle items differently based on destination **Location Type**:
   - **INVENTORY**: Standard requisition - items tracked and costed using FIFO
   - **DIRECT**: Simplified requisition - items already expensed on receipt, records for operational metrics only
   - **CONSIGNMENT**: Vendor-owned requisition - vendor notification required on issue

**Acceptance Criteria**:
- ✅ Requisition number is auto-generated and unique
- ✅ User can add/edit/remove line items before submission using inline pattern
- ✅ System displays current stock levels for each item
- ✅ Draft requisitions can be saved and resumed later
- ✅ Mandatory fields are validated before save
- ✅ "Requested By" displays current user's name
- ✅ Inline add item provides searchable product selection
- ✅ Location Type is displayed and affects processing behavior

---

### FR-SR-002: Multi-Level Approval Workflow
**Priority**: Critical
**User Story**: As a Department Manager, I want requisitions from my department to go through proper approval workflow so that we maintain control over material consumption.

**Requirements**:
1. System shall route requisitions through configurable approval workflow
2. Each workflow stage shall support:
   - Stage name and sequence
   - Assigned approver roles/users
   - Approval actions: Approve, Review (request changes), Reject
   - Comments and approval notes
3. Approvers shall receive notifications for pending approvals
4. System shall track workflow history with timestamps and approver names
5. System shall support delegation of approval authority
6. System shall allow workflow bypass for emergency requisitions (with proper authorization)
7. Requisition status shall update automatically based on workflow progress:
   - **Draft**: Initial creation, editable by requestor
   - **In Process**: Submitted and under approval workflow
   - **Complete**: All approvals received and items fully issued
   - **Reject**: Rejected by approver at any stage
   - **Void**: Cancelled by requestor/administrator

**Acceptance Criteria**:
- ✅ Requisition moves through approval stages in sequence
- ✅ Only designated approvers can action requisitions
- ✅ Approval history is recorded with timestamps
- ✅ Notifications are sent at each workflow stage
- ✅ Users can view workflow status and current stage
- ✅ Rejected requisitions cannot proceed without re-submission

---

### FR-SR-003: Item-Level Approval and Quantity Adjustment
**Priority**: High
**User Story**: As a Storekeeper, I want to approve individual line items and adjust quantities based on available stock so that I can partially fulfill requisitions when full quantities aren't available.

**Requirements**:
1. System shall allow item-level approval independent of requisition approval
2. Approver shall be able to:
   - Approve items with requested quantities
   - Modify approved quantities (with reason)
   - Reject specific items (with reason)
   - Request review/clarification for items
3. System shall track approval status for each line item:
   - **Pending**: Awaiting approval
   - **Approved**: Approved with quantities
   - **Review**: Requires requestor clarification
   - **Reject**: Item rejected
4. System shall record approval details:
   - Approved quantity vs requested quantity
   - Approver name and timestamp
   - Approval comments/reason
5. System shall support bulk approval of all items
6. Partially approved requisitions shall proceed to issuance for approved items

**Acceptance Criteria**:
- ✅ Each line item shows independent approval status
- ✅ Approved quantities can differ from requested quantities
- ✅ Reasons are mandatory for quantity adjustments and rejections
- ✅ Requestor can view approval status for each item
- ✅ Partial approvals allow issuance of approved items only

---

### FR-SR-004: Inventory Issuance and Stock Movement
**Priority**: Critical
**User Story**: As a Storekeeper, I want to issue approved items and record the stock movement so that inventory balances are accurate across locations.

**Requirements**:
1. System shall generate issuance document from approved requisition
2. Storekeeper shall record issued quantities for each approved item
3. System shall validate:
   - Issued quantity does not exceed approved quantity
   - Sufficient stock exists in source location
4. Upon issuance confirmation, system shall:
   - Create inventory transaction records
   - Reduce stock at source location (from_location)
   - Increase stock at destination location (to_location per item)
   - Update requisition status to "Complete" when all items issued
5. System shall support partial issuance:
   - Items can be issued in multiple batches
   - Track issued vs remaining quantities
   - Allow requisition closure with partially issued items
6. System shall record issuance details:
   - Issue date and time
   - Issued by (storekeeper name)
   - Received by (department representative)
   - Batch/lot numbers if applicable
7. **Receipt Signature Capture** (v1.4.0):
   - Store staff shall capture requestor's signature before completing issue
   - Signature dialog displays item summary of items to be issued
   - Digital signature captured on canvas-based signature pad
   - Timestamp recorded with signature data
   - Issue cannot complete until signature is captured

**Acceptance Criteria**:
- ✅ Stock levels update immediately upon issuance
- ✅ Inventory transactions are created for each issued item
- ✅ Issued quantities cannot exceed approved quantities
- ✅ System prevents over-issuance beyond available stock
- ✅ Partial issuance is supported with tracking
- ✅ Requisition status updates to Complete when fully issued
- ✅ Requestor signature is captured before issue completion (v1.4.0)
- ✅ Signature data and timestamp are stored with issuance record (v1.4.0)

---

### FR-SR-005: Real-Time Inventory Availability
**Priority**: High
**User Story**: As a Chef creating a requisition, I want to see real-time inventory availability so that I know if items are in stock before requesting them.

**Requirements**:
1. System shall display real-time inventory information for each item:
   - Current stock on hand at source location
   - Stock on order (incoming)
   - Reserved/allocated quantities
   - Last purchase price
   - Last vendor
2. System shall show inventory across multiple storage locations
3. System shall indicate stock status:
   - **Sufficient**: Stock meets requested quantity
   - **Low**: Partial stock available
   - **Out of Stock**: Zero stock
   - **On Order**: Stock expected soon
4. System shall allow requestors to adjust quantities based on availability
5. System shall warn when requested quantity exceeds available stock
6. System shall suggest alternative locations with available stock

**Acceptance Criteria**:
- ✅ Inventory data refreshes in real-time during requisition creation
- ✅ Stock availability is shown for each line item
- ✅ Warnings appear for insufficient stock
- ✅ Users can view stock at alternative locations
- ✅ System displays expected restock dates if available

---

### FR-SR-006: Department and Location-Based Access Control
**Priority**: High
**User Story**: As a System Administrator, I want to configure access control by department and location so that users can only request from authorized locations and approve for their departments.

**Requirements**:
1. System shall enforce role-based access control:
   - **Requestor**: Can create and submit requisitions for their department
   - **Approver**: Can approve requisitions assigned to their approval stage
   - **Storekeeper**: Can issue items and manage stock movements
   - **Manager**: Can view all requisitions for their department
   - **Administrator**: Full access to all requisitions
2. System shall restrict requisition creation based on:
   - User's assigned department
   - Authorized source locations
3. System shall filter requisition lists based on:
   - User's department
   - User's location access
   - User's role permissions
4. System shall enforce approval authority:
   - Users can only approve requisitions in their workflow stage
   - Approval limited to requisitions from assigned departments
5. System shall support read-only access for audit purposes

**Acceptance Criteria**:
- ✅ Users see only requisitions relevant to their role/department
- ✅ Unauthorized users cannot approve or issue items
- ✅ Location access is enforced at requisition creation
- ✅ Department filtering works correctly in list views
- ✅ Audit users can view but not modify requisitions

---

### FR-SR-007: Search, Filter, and Reporting
**Priority**: Medium
**User Story**: As a Department Manager, I want to search and filter requisitions by various criteria so that I can track material consumption and identify trends.

**Requirements**:
1. System shall provide comprehensive search functionality:
   - By requisition number
   - By date range
   - By department
   - By status
   - By requestor
   - By item/product
2. System shall support advanced filtering:
   - Custom filter builder with multiple conditions
   - Save frequently used filter combinations
   - Export filtered results to Excel/CSV
3. System shall provide standard reports:
   - Requisitions by department (monthly/quarterly)
   - Item consumption by department
   - Pending approvals summary
   - Average fulfillment time
   - Stock movement between locations
4. System shall display summary metrics:
   - Total requisitions (by status)
   - Total value of requisitions
   - Average processing time
   - Top requested items
5. System shall support sorting by all columns in list view

**Acceptance Criteria**:
- ✅ Search returns accurate results within 2 seconds
- ✅ Filters can be combined for complex queries
- ✅ Saved filters persist across user sessions
- ✅ Reports can be exported in multiple formats
- ✅ Summary metrics update in real-time

---

### FR-SR-008: Document Management and Audit Trail
**Priority**: Medium
**User Story**: As an Internal Auditor, I want to view complete history of all changes to requisitions so that I can verify compliance with internal controls.

**Requirements**:
1. System shall maintain complete audit trail including:
   - Creation date/time and user
   - All status changes with timestamps
   - Approval/rejection history
   - Quantity changes (requested/approved/issued)
   - Document modifications
2. System shall support document attachments:
   - Upload supporting documents (purchase justification, manager approval email)
   - Preview attachments inline
   - Download attachments
   - Track attachment history
3. System shall record all user actions in activity log:
   - Action type (created, submitted, approved, modified, cancelled)
   - User performing action
   - Timestamp
   - Changes made (before/after values)
4. System shall display timeline view of requisition lifecycle
5. System shall allow addition of comments at document and line item level
6. Audit trail shall be immutable (no deletion/modification)

**Acceptance Criteria**:
- ✅ All changes are logged with user and timestamp
- ✅ Audit trail shows complete requisition history
- ✅ Attachments are stored securely and accessible
- ✅ Comments are visible to authorized users
- ✅ Timeline view shows chronological progression
- ✅ Audit data cannot be deleted or tampered with

---

### FR-SR-009: Notifications and Alerts
**Priority**: Medium
**User Story**: As an Approver, I want to receive notifications when requisitions need my approval so that I can act promptly and avoid delays.

**Requirements**:
1. System shall send notifications for following events:
   - Requisition submitted (to approvers)
   - Requisition approved (to requestor)
   - Requisition rejected (to requestor with reasons)
   - Items issued (to requestor)
   - Requisition requires review (to requestor)
2. System shall support multiple notification channels:
   - In-app notifications (bell icon)
   - Email notifications
3. Notifications shall include:
   - Requisition number and description
   - Requestor name and department
   - Action required
   - Direct link to requisition
4. System shall allow users to configure notification preferences
5. System shall send escalation alerts for overdue approvals
6. System shall provide notification center with:
   - Unread count badge
   - List of recent notifications
   - Mark as read/unread functionality
   - Clear all option

**Acceptance Criteria**:
- ✅ Notifications are sent immediately upon triggering events
- ✅ Email notifications include requisition summary
- ✅ Links in notifications direct to correct requisition
- ✅ Users can customize notification preferences
- ✅ Escalation alerts sent after configured time period
- ✅ Notification center displays all recent notifications

---

### FR-SR-010: Emergency and Rush Requisitions
**Priority**: Medium
**User Story**: As a Kitchen Manager, I want to mark requisitions as urgent/emergency so that they receive priority processing for critical operational needs.

**Requirements**:
1. System shall support priority levels:
   - **Normal**: Standard processing
   - **Urgent**: Expedited approval (same day)
   - **Emergency**: Immediate processing (workflow bypass option)
2. Emergency requisitions shall:
   - Display prominently in approval queues (red flag icon)
   - Send immediate notifications to approvers
   - Allow workflow bypass with proper authorization
   - Require justification/reason for emergency status
3. System shall track:
   - Priority level changes with reasons
   - Time to approval for urgent/emergency requisitions
   - User who authorized emergency processing
4. System shall enforce authorization rules:
   - Only Department Managers and above can mark as Emergency
   - Emergency status requires mandatory approval from senior management
5. System shall generate reports on emergency requisition usage

**Acceptance Criteria**:
- ✅ Emergency requisitions are visually distinguished
- ✅ Urgent items appear at top of approval queues
- ✅ Emergency justification is mandatory
- ✅ Workflow bypass requires proper authorization
- ✅ Emergency usage reports are available to management

---

## 3. Non-Functional Requirements

### 3.1 Performance Requirements
| Requirement | Target | Critical Threshold |
|-------------|--------|-------------------|
| Page Load Time | < 2 seconds | < 4 seconds |
| Search Response Time | < 1 second | < 3 seconds |
| Requisition Submission | < 3 seconds | < 5 seconds |
| Inventory Availability Check | < 500ms | < 1 second |
| Report Generation | < 5 seconds | < 10 seconds |
| Concurrent Users | 100 users | 200 users |
| Database Query Response | < 200ms | < 500ms |

### 3.2 Scalability Requirements
- System shall support up to 50,000 requisitions per year
- System shall handle up to 500 line items per requisition
- System shall support 100+ locations
- System shall maintain performance with 5 years of historical data
- System shall support horizontal scaling for high-volume periods

### 3.3 Security Requirements
- All requisition data shall be encrypted at rest and in transit
- User authentication required for all operations
- Role-based access control enforced at application and database level
- Sensitive financial data (costs, values) visible only to authorized users
- Audit trail shall be tamper-proof
- Session timeout after 30 minutes of inactivity
- Failed login attempts shall be logged and rate-limited

### 3.4 Availability and Reliability
- System availability: 99.5% uptime during business hours (6 AM - 11 PM)
- Scheduled maintenance windows: Sundays 2 AM - 6 AM
- Data backup: Daily incremental, weekly full backup
- Disaster recovery: RTO < 4 hours, RPO < 1 hour
- Automated health monitoring and alerts

### 3.5 Usability Requirements
- Interface shall be intuitive for users with basic computer skills
- Maximum 3 clicks to reach any major function
- Keyboard shortcuts for common actions
- Responsive design for tablet access (kitchen/storeroom use)
- Multilingual support (English, Thai)
- Consistent UI patterns across all store operations modules
- Inline help and tooltips for complex fields

### 3.6 Compliance and Audit
- Full audit trail for all transactions (SOX compliance)
- Support for internal audit requirements
- Data retention: 7 years minimum
- Export capability for audit reports
- Compliance with hospitality industry standards

---

## 4. Data Requirements

### 4.1 Core Entities
1. **Store Requisition** (tb_store_requisition)
   - Requisition header information
   - Workflow and approval tracking
   - Status management
   - Estimated records: 50,000/year, 350,000 after 7 years

2. **Store Requisition Detail** (tb_store_requisition_detail)
   - Line items with products and quantities
   - Item-level approval tracking
   - Estimated records: 500,000/year (10 items per requisition avg)

3. **Inventory Transaction** (generated from issuance)
   - Stock movements between locations
   - Integration with inventory management

### 4.2 Data Volume Estimates
- **Daily Requisitions**: 137 requisitions/day (50,000/year ÷ 365 days)
- **Peak Load**: 200+ requisitions/day (weekends, month-end)
- **Line Items**: 1,370 line items/day average
- **Storage**: ~5GB per year (with attachments), ~35GB after 7 years

### 4.3 Data Retention
- Active requisitions: Indefinite (until completed/voided)
- Completed requisitions: 7 years minimum
- Draft requisitions: Auto-purge after 90 days of inactivity
- Audit logs: 7 years minimum
- Attachments: 7 years minimum

### 4.4 Data Quality
- Mandatory fields validated before save/submit
- Data format validation (dates, numbers, quantities)
- Referential integrity enforced (products, locations, users must exist)
- Duplicate prevention (same items in single requisition)
- Stock quantity validation against physical inventory

---

## 5. Business Rules Summary

### BR-SR-001: Requisition Number Format
- Format: SR-YYMM-NNNN where YY is 2-digit year and MM is month (e.g., SR-2501-0001)
- Year resets annually
- Sequential numbering within year
- Cannot be modified after creation

### BR-SR-002: Status Transition Rules
- **Draft → In Process**: Upon submission (requires at least 1 line item)
- **In Process → Complete**: When all approved items are fully issued
- **In Process → Reject**: Upon rejection by any approver
- **In Process → Void**: Upon cancellation by authorized user
- **Reject → Draft**: Upon resubmission with corrections (rare, typically create new requisition)
- **Complete/Void**: Terminal states, no further transitions

### BR-SR-003: Approval Authority
- Users can only approve requisitions in their assigned workflow stages
- Approvers must belong to same or higher hierarchy level as requesting department
- Emergency requisitions require senior management approval
- Self-approval is prohibited (cannot approve own requisitions)

### BR-SR-004: Quantity Validation
- Requested quantity must be > 0
- Approved quantity must be ≤ Requested quantity
- Issued quantity must be ≤ Approved quantity
- Cumulative issued quantity cannot exceed approved quantity
- Negative quantities not allowed

### BR-SR-005: Inventory Availability
- System displays real-time stock levels during requisition creation
- Warning displayed when requested quantity > available stock
- Issuance blocked if insufficient stock at source location
- Requisitions can proceed with warnings (subject to approval)

### BR-SR-006: Department and Location Rules
- Requestor must be assigned to requesting department
- Source location must be authorized for requesting department
- Destination location (per item) must be within requesting department's accessible locations
- Cross-department requisitions require additional approval level

### BR-SR-007: Workflow Assignment
- Requisition routed based on department's configured workflow
- Workflow cannot be changed after submission
- Workflow stages must be completed in sequence
- Parallel approval stages supported within same level

### BR-SR-008: Item-Level Approval Independence
- Each line item can be approved/rejected independently
- Partial approvals allowed (some items approved, others rejected)
- Rejected items do not block issuance of approved items
- Review status requires requestor action before proceeding

### BR-SR-009: Audit Trail Immutability
- All changes recorded with user, timestamp, and values
- Audit records cannot be modified or deleted
- Minimum 7-year retention for compliance
- Soft delete for requisitions (deleted_at timestamp, not physical deletion)

### BR-SR-010: Emergency Requisition Authorization
- Emergency status requires Department Manager or above
- Emergency justification is mandatory
- Emergency requisitions cannot bypass final financial approval
- Monthly reports on emergency requisition usage sent to management

### BR-SR-014: Stage-Based Field Editability (v1.4.0)
- **Workflow Stages**: Draft → Submit → Approve → Issue → Complete
- **Approve Stage**:
  - `qtyApproved` field is editable (approver can adjust approved quantities)
  - `qtyIssued` field is read-only
  - Workflow button displays "Approve" label
- **Issue Stage**:
  - `qtyApproved` field is read-only (locked after approval)
  - `qtyIssued` field is editable (store staff records actual issued quantities)
  - Workflow button displays "Issue" label
- Edit mode must be enabled to modify any quantity fields
- Stage determines which quantity fields are accessible regardless of edit mode

### BR-SR-015: Receipt Signature Requirement (v1.4.0)
- Clicking "Issue" button in Issue stage opens Receipt Signature Dialog
- Signature dialog displays summary of approved items to be issued
- Requestor must sign on digital signature canvas to confirm receipt
- Store staff captures signature (requestor signs, staff witnesses)
- Signature data (base64 PNG) and timestamp captured on confirmation
- Issue action cannot complete without valid signature
- Signature stored with issuance record for audit trail
- Clear button allows signature canvas reset before confirmation
- Cancel closes dialog without completing issue

---

## 5.1 Location Type Business Rules

Store requisition behavior varies based on the **location type** of the source and destination locations. The system supports three location types that determine inventory tracking, stock movements, and GL posting behavior.

### Location Type Definitions

| Location Type | Code | Purpose | Examples |
|---------------|------|---------|----------|
| **INVENTORY** | INV | Standard tracked warehouse locations | Main Warehouse, Central Kitchen Store, F&B Store |
| **DIRECT** | DIR | Direct expense locations (no stock balance) | Restaurant Bar Direct, Kitchen Direct, Maintenance Direct |
| **CONSIGNMENT** | CON | Vendor-owned inventory locations | Beverage Consignment, Linen Consignment |

### BR-SR-011: Location Type Processing Rules

**INVENTORY Locations (INV)**:
- ✅ Full stock check required before issue
- ✅ Creates inventory transactions and stock movements
- ✅ FIFO cost layer consumption on issue
- ✅ GL: Debit Department Expense, Credit Inventory Asset
- ✅ Complete audit trail with lot tracking

**DIRECT Locations (DIR)**:
- ❌ No stock balance to check (items already expensed on receipt)
- ❌ No inventory transactions created on issue
- ✅ Issue records for tracking and metrics only
- ✅ GL: No additional posting (already expensed at GRN)
- ⚠️ Limited workflow - simplified approval

**CONSIGNMENT Locations (CON)**:
- ✅ Full stock check required (vendor-owned stock)
- ✅ Creates inventory transactions and stock movements
- ✅ FIFO cost layer consumption on issue
- ✅ GL: Debit Department Expense, Credit Vendor Liability
- ✅ Vendor notification on consumption
- ✅ Complete audit trail with lot tracking and vendor reference

### BR-SR-012: Location Type Feature Matrix

| Feature | INVENTORY | DIRECT | CONSIGNMENT |
|---------|-----------|--------|-------------|
| **Stock Check** | ✅ Required | ❌ N/A | ✅ Required |
| **Stock Movement** | ✅ Full tracking | ❌ None | ✅ Full tracking |
| **Lot Tracking** | ✅ FIFO | ❌ None | ✅ FIFO |
| **Approval Workflow** | Multi-level | Simplified | Multi-level + Vendor |
| **Issue Creates** | Inventory Transaction | Metrics Record | Consumption Record |
| **GL Impact** | Asset → Expense | None (pre-expensed) | Liability → Expense |
| **Inventory Adjustment** | ✅ Supported | ❌ Not applicable | ✅ Supported |
| **Stock Replenishment** | ✅ Full PAR levels | ❌ Not applicable | ✅ Vendor-managed PAR |

### BR-SR-013: Location Type Validation Rules

1. **Source Location Validation**:
   - INVENTORY: Must have sufficient stock before issue approval
   - DIRECT: Warning displayed that no stock balance exists
   - CONSIGNMENT: Must have sufficient vendor-owned stock

2. **Transfer Restrictions**:
   - Cannot transfer TO a DIRECT location (items must go through GRN for expense posting)
   - Transfers FROM DIRECT locations are not permitted
   - CONSIGNMENT transfers require vendor approval notification

3. **UI Indicators**:
   - Location type badge displayed in location selection
   - Stock movement tab filters out DIRECT location items (no movements to display)
   - Alert banner when issuing from/to non-INVENTORY locations

---

## 6. User Roles and Permissions

### 6.1 Requestor (Chef, Housekeeping Staff, Engineering Technician)
**Permissions**:
- ✅ Create requisitions for own department
- ✅ Submit requisitions for approval
- ✅ View own requisitions
- ✅ Edit draft requisitions
- ✅ Cancel submitted requisitions (before approval)
- ✅ Add comments and attachments
- ✅ View inventory availability
- ❌ Cannot approve requisitions
- ❌ Cannot issue items
- ❌ Cannot view other departments' requisitions (unless authorized)

### 6.2 Department Manager (F&B Manager, Housekeeping Manager, Chief Engineer)
**Permissions**:
- ✅ All Requestor permissions
- ✅ Approve requisitions for own department
- ✅ View all requisitions for own department
- ✅ Mark requisitions as urgent/emergency
- ✅ Delegate approval authority
- ✅ View department consumption reports
- ❌ Cannot approve requisitions from other departments
- ❌ Cannot issue items (unless also Storekeeper role)

### 6.3 Storekeeper (Main Store, Kitchen Store)
**Permissions**:
- ✅ View all requisitions for assigned locations
- ✅ Issue items from approved requisitions
- ✅ Adjust issued quantities (with reasons)
- ✅ Mark items as out of stock
- ✅ Update inventory availability
- ✅ View stock movement reports
- ✅ Print picking lists
- ❌ Cannot approve requisitions (separate role)
- ❌ Cannot modify approved quantities

### 6.4 Purchasing Manager/Financial Controller
**Permissions**:
- ✅ View all requisitions across departments
- ✅ Approve high-value requisitions
- ✅ Review emergency requisitions
- ✅ View cost and consumption analytics
- ✅ Generate financial reports
- ✅ Configure approval workflows
- ✅ Override standard approval (with audit trail)
- ❌ Cannot issue items (unless also Storekeeper role)

### 6.5 System Administrator
**Permissions**:
- ✅ Full access to all requisitions
- ✅ Configure system settings
- ✅ Manage user roles and permissions
- ✅ Configure workflows
- ✅ Void requisitions (with justification)
- ✅ Access audit logs
- ✅ Generate system reports
- ✅ Manage locations and departments

### 6.6 Auditor (Read-Only)
**Permissions**:
- ✅ View all requisitions (read-only)
- ✅ View complete audit trail
- ✅ Export data for audit purposes
- ✅ Generate compliance reports
- ❌ Cannot create, modify, or delete any data
- ❌ Cannot approve or issue items

---

## 7. Integration Requirements

### 7.1 Internal Integrations

#### 7.1.1 Inventory Management Module
**Integration Points**:
- Real-time inventory balance queries
- Stock movement transactions upon issuance
- Inventory transaction creation (one transaction per issued item)
- Stock availability validation
- Product master data access

**Data Flow**:
- **Requisition Creation**: Query current stock levels
- **Item Issuance**: Create inventory transactions, update balances
- **Stock Movement**: Reduce from source, increase at destination

#### 7.1.2 Workflow Management System
**Integration Points**:
- Workflow configuration and assignment
- Approval routing and notifications
- Workflow history tracking
- Stage progression logic

**Data Flow**:
- **Submission**: Trigger workflow, identify first approver
- **Approval**: Progress to next stage or complete workflow
- **Rejection**: Return to requestor with reasons

#### 7.1.3 User Management and Authentication
**Integration Points**:
- User authentication and session management
- Role and permission verification
- Department and location assignments
- User profile data (name, email, department)

**Data Flow**:
- **Login**: Authenticate user, load permissions
- **Access Control**: Verify permissions for each operation
- **Notifications**: Retrieve user contact information

#### 7.1.4 Cost Accounting (Future)
**Integration Points** (Optional, for future implementation):
- Cost allocation to departments
- Consumption tracking by cost center
- Budget vs actual comparison
- Variance analysis

### 7.2 External Integrations
None required for initial implementation. Future considerations:
- Hotel PMS for guest-related consumption tracking
- Financial ERP for journal entries
- Mobile app for on-the-go approvals

---

## 8. Workflow Specifications

### 8.1 Standard Requisition Workflow
**Stages**:
1. **Draft** (Requestor)
   - Create requisition
   - Add items
   - Save draft

2. **Submitted** (Requestor)
   - Submit for approval
   - Requisition locked for editing

3. **Department Manager Approval** (Department Manager)
   - Review requisition
   - Approve/Reject/Request Review
   - Adjust approved quantities if needed

4. **Storekeeper Review** (Storekeeper)
   - Verify stock availability
   - Approve/Reject items
   - Mark out-of-stock items

5. **Issuance** (Storekeeper)
   - Pick items
   - Record issued quantities
   - Generate stock movement

6. **Complete** (System)
   - All items issued
   - Inventory updated
   - Requisition closed

### 8.2 Emergency Requisition Workflow
**Stages**:
1. **Draft** (Requestor)
2. **Submitted** (Requestor with Emergency flag)
3. **Senior Manager Approval** (Purchasing Manager/GM)
   - Mandatory approval for emergency status
4. **Immediate Issuance** (Storekeeper)
   - Expedited processing
5. **Complete**

### 8.3 Requisition with Review Cycle
**Stages**:
1. **Draft** (Requestor)
2. **Submitted** (Requestor)
3. **Department Manager Review** (Department Manager)
   - Request clarification on items
   - Requisition returned to requestor
4. **Revised** (Requestor)
   - Update items based on feedback
   - Resubmit for approval
5. **Department Manager Approval** (Department Manager)
6. **Storekeeper Review** (Storekeeper)
7. **Issuance** (Storekeeper)
8. **Complete**

---

## 9. Success Criteria

### 9.1 Business Success Metrics
- **Requisition Processing Time**: Average < 24 hours from submission to issuance
- **First-Time Approval Rate**: > 80% of requisitions approved without review
- **Stock Accuracy**: > 95% match between system and physical inventory
- **Emergency Requisition Rate**: < 5% of total requisitions
- **User Adoption**: > 90% of departments using system within 3 months
- **Stockout Incidents**: Reduce by 30% compared to manual process

### 9.2 System Performance Metrics
- **System Availability**: > 99.5% during business hours
- **Average Response Time**: < 2 seconds for 95% of operations
- **Error Rate**: < 0.1% of transactions fail
- **Data Accuracy**: 100% accuracy for inventory movements
- **Concurrent Users**: Support 100 simultaneous users without performance degradation

### 9.3 User Satisfaction Metrics
- **User Satisfaction Score**: > 4.0/5.0 on post-implementation survey
- **Training Time**: < 2 hours for basic user proficiency
- **Support Tickets**: < 5 tickets per 100 requisitions
- **Feature Utilization**: > 70% of users using advanced features (filters, reports) within 6 months

---

## 10. Backend Requirements

### 10.1 API Endpoints

#### BE-API-SR-001: List Store Requisitions
**Method**: GET | **Path**: `/api/store-requisitions` | **Priority**: Critical

Retrieves a paginated list of store requisitions with optional filtering and sorting.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |
| status | string | No | Filter by status (draft, pending, approved, rejected, issued, cancelled) |
| department_id | string | No | Filter by requesting department |
| location_id | string | No | Filter by location |
| date_from | string | No | Filter by date range start (ISO 8601) |
| date_to | string | No | Filter by date range end (ISO 8601) |
| search | string | No | Search by requisition number or notes |
| sort_by | string | No | Sort field (created_at, requisition_number, status) |
| sort_order | string | No | Sort direction (asc, desc) |

**Authorization**: Requires `store_requisition:read` permission

---

#### BE-API-SR-002: Get Store Requisition Detail
**Method**: GET | **Path**: `/api/store-requisitions/:id` | **Priority**: Critical

Retrieves detailed information for a specific store requisition including items, approval history, and journal entries.

**Authorization**: User must have `store_requisition:read` permission and access to the requisition's department/location

---

#### BE-API-SR-003: Create Store Requisition
**Method**: POST | **Path**: `/api/store-requisitions` | **Priority**: Critical

Creates a new store requisition with line items.

**Request Body**:
```typescript
interface CreateRequest {
  department_id: string;        // Required
  location_id: string;          // Required
  required_date: string;        // Required, ISO 8601
  priority: 'low' | 'normal' | 'high' | 'urgent';  // Required
  notes?: string;               // Optional, max 1000 chars
  items: {
    product_id: string;         // Required
    quantity: number;           // Required, > 0
    uom_id: string;             // Required
    notes?: string;             // Optional
  }[];
}
```

**Business Logic**:
1. Generate requisition number: `SR-{LOCATION}-{YYMMDD}-{SEQ}`
2. Validate all products exist and are active
3. Validate requesting department has access to products
4. Set initial status to `draft`
5. Calculate estimated costs using current inventory valuations (via SM-COSTING-METHODS)

---

#### BE-API-SR-004: Update Store Requisition
**Method**: PUT | **Path**: `/api/store-requisitions/:id` | **Priority**: High

Updates an existing store requisition. Only allowed for requisitions in `draft` status.

---

#### BE-API-SR-005: Delete Store Requisition
**Method**: DELETE | **Path**: `/api/store-requisitions/:id` | **Priority**: Medium

Soft-deletes a store requisition. Only allowed for requisitions in `draft` status.

---

#### BE-API-SR-006: Check Stock Availability
**Method**: POST | **Path**: `/api/store-requisitions/:id/check-stock` | **Priority**: High

Checks current stock availability for all items in the requisition.

**Integration**: Uses SM-INVENTORY-OPERATIONS for real-time balance queries

---

### 10.2 Server Actions

#### BE-SA-SR-001: Submit for Approval
**Action**: `submitForApproval` | **Priority**: Critical

Submits a draft requisition to the approval workflow.

**Business Logic**:
1. Verify requisition is in `draft` status
2. Validate all required fields are complete
3. Check stock availability (warning only, not blocking)
4. Determine approval routing based on total value, department, and item categories
5. Create first approval step and update status to `pending`
6. Send notification to first approver

**Approval Routing Rules**:
| Condition | Approver Level |
|-----------|----------------|
| Value < $500 | Department Manager |
| Value $500-$2000 | Department Manager → Store Manager |
| Value > $2000 | Department Manager → Store Manager → Finance |
| Contains restricted items | +Security Approval |

---

#### BE-SA-SR-002: Approve Requisition
**Action**: `approveRequisition` | **Priority**: Critical

Approves a requisition at the current approval level.

**Business Logic**:
1. Verify user is the current pending approver
2. Mark current approval step as `approved`
3. If more levels required: Create next step, notify next approver
4. If no more levels: Update status to `approved`, notify requester

---

#### BE-SA-SR-003: Reject Requisition
**Action**: `rejectRequisition` | **Priority**: Critical

Rejects a requisition with mandatory comments (minimum 10 characters).

---

#### BE-SA-SR-004: Send Back Requisition
**Action**: `sendBackRequisition` | **Priority**: High

Returns a requisition to the requester for modifications with mandatory comments.

---

#### BE-SA-SR-005: Issue Items
**Action**: `issueItems` | **Priority**: Critical

Issues approved items from inventory to the requesting department.

**Business Logic**:
1. Verify requisition is in `approved` status
2. For each item:
   - Validate issued quantity ≤ approved quantity
   - Check stock availability
   - Determine cost using SM-COSTING-METHODS (FIFO or AVG)
   - Create inventory transaction (SM-INVENTORY-OPERATIONS)
   - Update lot quantities and create journal entry
3. Generate lot numbers: `{LOCATION}-{YYMMDD}-{SEQ}`
4. Record parent_lot_no to distinguish LOT vs ADJUSTMENT transactions

---

#### BE-SA-SR-006: Cancel Requisition
**Action**: `cancelRequisition` | **Priority**: Medium

Cancels a requisition that is no longer needed (blocked if approved with partial issuance).

---

### 10.3 Database Schema

#### Store Requisitions Table
```sql
CREATE TABLE store_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_number VARCHAR(50) NOT NULL UNIQUE,
  department_id UUID NOT NULL REFERENCES departments(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  priority VARCHAR(10) NOT NULL DEFAULT 'normal',
  required_date DATE NOT NULL,
  notes TEXT,
  estimated_total DECIMAL(15,2) DEFAULT 0,
  actual_total DECIMAL(15,2) DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  issued_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT chk_status CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'issued', 'cancelled')),
  CONSTRAINT chk_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

CREATE INDEX idx_store_requisitions_status ON store_requisitions(status);
CREATE INDEX idx_store_requisitions_department ON store_requisitions(department_id);
CREATE INDEX idx_store_requisitions_location ON store_requisitions(location_id);
CREATE INDEX idx_store_requisitions_created_at ON store_requisitions(created_at DESC);
```

#### Store Requisition Items Table
```sql
CREATE TABLE store_requisition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id UUID NOT NULL REFERENCES store_requisitions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  uom_id UUID NOT NULL REFERENCES units_of_measure(id),
  requested_quantity DECIMAL(15,4) NOT NULL,
  approved_quantity DECIMAL(15,4),
  issued_quantity DECIMAL(15,4) DEFAULT 0,
  unit_cost DECIMAL(15,4),
  total_cost DECIMAL(15,2),
  notes TEXT,
  lot_id UUID REFERENCES inventory_lots(id),
  issued_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT chk_quantities CHECK (
    requested_quantity > 0 AND
    (approved_quantity IS NULL OR approved_quantity >= 0) AND
    issued_quantity >= 0
  )
);

CREATE INDEX idx_sr_items_requisition ON store_requisition_items(requisition_id);
CREATE INDEX idx_sr_items_product ON store_requisition_items(product_id);
```

#### Approval Steps Table
```sql
CREATE TABLE store_requisition_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id UUID NOT NULL REFERENCES store_requisitions(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  approver_role VARCHAR(50) NOT NULL,
  approver_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  comments TEXT,
  action_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT chk_approval_status CHECK (status IN ('pending', 'approved', 'rejected', 'current')),
  UNIQUE(requisition_id, step_number)
);
```

#### Audit Log Table
```sql
CREATE TABLE store_requisition_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id UUID NOT NULL REFERENCES store_requisitions(id),
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID NOT NULL REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sr_audit_requisition ON store_requisition_audit_log(requisition_id);
CREATE INDEX idx_sr_audit_created_at ON store_requisition_audit_log(created_at DESC);
```

---

### 10.4 Service Integrations

#### Inventory Operations Service (SM-INVENTORY-OPERATIONS)
**Integration Points**:
- **Balance Query**: Real-time stock availability checks
- **Transaction Recording**: Stock movements on issuance
- **State Management**: Location-based inventory tracking

```typescript
// Query current balance
inventoryService.getBalance(productId: string, locationId: string): Promise<InventoryBalance>

// Record stock movement
inventoryService.recordTransaction({
  product_id: string;
  location_id: string;
  transaction_type: 'ISSUE';
  quantity: number;
  reference_type: 'STORE_REQUISITION';
  reference_id: string;
  lot_id?: string;
}): Promise<InventoryTransaction>
```

#### Costing Methods Service (SM-COSTING-METHODS)
**Integration Points**:
- **FIFO Cost Determination**: Select oldest cost layers for issuance
- **AVG Cost Calculation**: Weighted average for periodic costing
- **Lot Tracking**: Cost layer and lot assignment

```typescript
// Get FIFO cost for issuance
costingService.getFIFOCost(productId: string, locationId: string, quantity: number): Promise<CostLayer[]>

// Get average cost
costingService.getAverageCost(productId: string, locationId: string): Promise<number>

// Generate lot number (format: {LOCATION}-{YYMMDD}-{SEQ})
costingService.generateLotNumber(locationId: string): Promise<string>
```

#### Workflow Engine Service
**Integration Points**:
- **Routing Determination**: Calculate approval path based on value and department
- **Step Management**: Create and track approval steps
- **Notification Dispatch**: Alert approvers of pending items

#### Journal Entry Service
**Journal Entry Pattern for Issuance**:
```
Debit:  Department Expense Account     $XXX.XX
Credit: Inventory Asset Account        $XXX.XX
Reference: Store Requisition {number}
```

#### Notification Service
**Notification Events**:
| Event | Recipients | Template |
|-------|------------|----------|
| Submitted | First Approver | `sr_pending_approval` |
| Approved (interim) | Next Approver | `sr_pending_approval` |
| Approved (final) | Requester | `sr_approved` |
| Rejected | Requester | `sr_rejected` |
| Sent Back | Requester | `sr_returned` |
| Issued | Requester | `sr_issued` |
| Reminder | Pending Approver | `sr_reminder` |

---

### 10.5 Error Handling

**Error Codes**:
| Code | Description | HTTP Status |
|------|-------------|-------------|
| SR001 | Requisition not found | 404 |
| SR002 | Invalid status transition | 400 |
| SR003 | Unauthorized action | 403 |
| SR004 | Validation error | 400 |
| SR005 | Insufficient stock | 400 |
| SR006 | Approval required | 400 |
| SR007 | Already processed | 409 |
| SR008 | Item not found | 404 |
| SR009 | Department access denied | 403 |
| SR010 | Costing method error | 500 |
| SR011 | Journal entry failed | 500 |
| SR012 | Workflow routing error | 500 |

**Error Response Format**:
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    timestamp: string;
    request_id: string;
  };
}
```

---

### 10.6 Backend Performance Requirements

**Response Time Targets**:
| Operation | Target | Maximum |
|-----------|--------|---------|
| List requisitions | 200ms | 500ms |
| Get detail | 150ms | 300ms |
| Create/Update | 300ms | 600ms |
| Submit for approval | 500ms | 1000ms |
| Issue items | 1000ms | 2000ms |
| Stock check | 200ms | 400ms |

**Throughput Requirements**:
| Metric | Requirement |
|--------|-------------|
| Concurrent users | 100+ |
| Requisitions per hour | 500+ |
| Items per requisition | Up to 100 |
| Approval steps per requisition | Up to 5 |

---

### 10.7 Backend Security Requirements

**Authentication**: JWT with 1-hour access token, 7-day refresh token

**Permission Matrix**:
| Role | Create | Read | Update | Delete | Approve | Issue |
|------|--------|------|--------|--------|---------|-------|
| Staff | Own | Own | Own Draft | Own Draft | ✗ | ✗ |
| Dept Manager | Dept | Dept | Dept Draft | Dept Draft | ✓ | ✗ |
| Store Manager | ✗ | All | ✗ | ✗ | ✓ | ✓ |
| Finance | ✗ | All | ✗ | ✗ | ✓ | ✗ |
| Admin | All | All | All | All | ✓ | ✓ |

**Data Protection**:
- Encryption at rest and TLS 1.3 in transit
- PII masking in logs
- SQL injection prevention via parameterized queries
- CSRF protection via tokens

---

### 10.8 Testing Requirements

**Coverage Targets**:
- Service layer: ≥80%
- Repository layer: ≥80%
- Validation logic: 100%

**Test Types**:
- Unit tests: Service and repository layers
- Integration tests: API endpoints and database transactions
- E2E tests: Complete approval workflow, issuance with inventory update

---

### 10.9 Backend TypeScript Interfaces

```typescript
// Store Requisition Entity
interface StoreRequisition {
  id: string;
  requisition_number: string;
  department_id: string;
  department?: Department;
  location_id: string;
  location?: Location;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'issued' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  required_date: string;
  notes?: string;
  estimated_total: number;
  actual_total: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  issued_at?: string;
  cancelled_at?: string;
}

// Store Requisition Item Entity
interface StoreRequisitionItem {
  id: string;
  requisition_id: string;
  product_id: string;
  product?: Product;
  uom_id: string;
  uom?: UnitOfMeasure;
  requested_quantity: number;
  approved_quantity?: number;
  issued_quantity: number;
  unit_cost?: number;
  total_cost?: number;
  notes?: string;
  lot_id?: string;
  issued_date?: string;
}

// Approval Step Entity
interface ApprovalStep {
  id: string;
  requisition_id: string;
  step_number: number;
  approver_role: string;
  approver_id?: string;
  approver?: User;
  status: 'pending' | 'approved' | 'rejected' | 'current';
  comments?: string;
  action_date?: string;
}

// Approval Log (for history display)
interface ApprovalLog {
  id: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Reject' | 'Review';
  by: string;
  comments: string;
}
```

---

### 10.10 Backend Architecture Diagram

```mermaid
graph TB
    subgraph API['API Layer']
        REST['REST Endpoints']
        SA['Server Actions']
    end

    subgraph Services['Service Layer']
        SRS['Store Requisition Service']
        WFS['Workflow Service']
        NS['Notification Service']
    end

    subgraph Integration['Integration Layer']
        INV['Inventory Operations<br>(SM-INVENTORY-OPERATIONS)']
        COST['Costing Methods<br>(SM-COSTING-METHODS)']
        JE['Journal Entry Service']
    end

    subgraph Data['Data Layer']
        DB[(PostgreSQL)]
        CACHE[(Redis Cache)]
    end

    REST --> SRS
    SA --> SRS
    SRS --> WFS
    SRS --> NS
    SRS --> INV
    SRS --> COST
    SRS --> JE
    SRS --> DB
    SRS --> CACHE
    WFS --> DB
    INV --> DB
    COST --> DB
    JE --> DB
```

---

## 10.11 UI Components and Patterns

### UI-SR-001: Store Requisition List Page
**Route**: `/store-operations/store-requisitions`

**Header Section**:
- Title: "Store Requisition List"
- Subtitle: "Manage and track store requisitions across all locations"
- Actions: Export button, "New Request" button (navigates to `/store-operations/store-requisitions/new`)

**Columns** (Table View):
| Column | Field | Description |
|--------|-------|-------------|
| SR # | refNo | Requisition number, clickable link to detail |
| Date | date | Formatted as DD/MM/YYYY |
| **Request From** | requestTo | Source store/warehouse code (renamed from "Request To" in v1.3.0) |
| To Location | toLocation | Destination location name |
| Store Name | storeName | Name of source store |
| **Requested By** | requestedBy | Name of user who created the requisition (added in v1.3.0) |
| Description | description | Requisition description/purpose |
| Amount | totalAmount | Total value, right-aligned with currency |
| Currency | currency | Currency code |
| Status | status | Status badge (Draft, In Process, Complete, Reject, Void) |
| Workflow Stage | workflowStage | Current workflow stage with tooltip |
| Actions | - | Dropdown menu (View, Edit, Export, Delete) |

**Features**:
- Search bar with keyword filtering
- Status filter dropdown
- Saved filters support
- Custom filter builder (Add Filters dialog)
- Table/Card view toggle
- Pagination with page navigation

### UI-SR-002: New Requisition Creation Page
**Route**: `/store-operations/store-requisitions/new`

**Header Section**:
- Back button (returns to list)
- Title: "New Store Requisition"
- Subtitle: "Create a new material request"
- Side panel toggle button
- "Save Draft" and "Submit" action buttons

**Header Info Card**:
| Field | Type | Description |
|-------|------|-------------|
| Status Badge | Display | Shows "Draft" |
| Location Type Badge | Display | Shows destination location type (INVENTORY/DIRECT/CONSIGNMENT) |
| Requisition Number | Display | Auto-generated (SR-YYMM-NNNN) |
| Request Date | Display | Current date |
| Expected Delivery | Date Input | Defaults to 7 days from now |
| **Request From (Source)** | Select | Source store/warehouse selection (required) |
| Deliver To (Destination) | Display | User's current location (read-only) |
| Department | Select | Requesting department |
| **Requested By** | Display | Current user's name (read-only, auto-populated) |
| Description | Text Input | Requisition purpose/notes |

**Tabs**:
1. **Items Tab**: Requested items table with inline add pattern
2. **Business Dimensions Tab**: Job Code and Project selection with CRUD support

**Inline Add Item Pattern** (v1.3.0):
- Click "Add Item" button to reveal inline input row within table
- Searchable product dropdown using Popover + Command components
- Product search by name or product code
- Auto-populated fields: Unit (from product), Unit Cost (from product)
- Editable field: Quantity (minimum 1)
- Calculated field: Total (Unit Cost × Quantity)
- Confirm (✓) button to add item
- Cancel (✕) button to discard

**Side Panel** (togglable):
- Comments section with add comment form
- Attachments section with add attachment button

### UI-SR-003: Store Requisition Detail Page
**Route**: `/store-operations/store-requisitions/[id]`

**Features**:
- All header information displayed
- Location Type badge and alert for non-INVENTORY locations
- Item table with inline editing capabilities
- Inline add item pattern (same as creation page)
- Approval workflow display
- Approval actions based on user role and requisition status
- Side panel for comments, attachments, activity log, stock movement

### UI-SR-004: Component Patterns

**Inline Add Item Pattern**:
Uses the Popover + Command component combination for searchable product selection:
```
┌─────────────────────────────────────────────────────────────────┐
│ # │ Description          │ Unit │ Qty │ Unit Cost │ Total │ ⋯ │
├───┼──────────────────────┼──────┼─────┼───────────┼───────┼───┤
│ 1 │ Thai Milk Tea (12)   │ Box  │ 10  │ 120.00    │1,200  │ 🗑 │
├───┼──────────────────────┼──────┼─────┼───────────┼───────┼───┤
│ - │ [🔍 Search products] │ -    │ [1] │ -         │ -     │✓✕│
└───────────────────────────────────────────────────────────────────┘
```

**Location Type Badge Component**:
Displays colored badge based on location type:
- INVENTORY: Blue badge with Package icon
- DIRECT: Amber badge with DollarSign icon
- CONSIGNMENT: Purple badge with Truck icon

**Status Badge Component**:
- Draft: Gray/Amber background
- In Process: Blue background
- Complete: Green background
- Reject: Red background
- Void: Gray strikethrough

---

## 11. Constraints and Assumptions

### 11.1 Constraints
- **Budget**: Development within allocated ERP budget
- **Timeline**: Implementation within 12 weeks
- **Technology**: Must use existing Next.js/React technology stack
- **Database**: Must use existing PostgreSQL database
- **Integration**: Must integrate with existing Inventory Management module
- **Resources**: Development team of 2-3 developers
- **Hardware**: Must run on existing server infrastructure

### 11.2 Assumptions
- Users have basic computer literacy and internet access
- Reliable network connectivity in all store locations
- Existing Inventory Management module is functional and accurate
- Workflow configurations are provided by business stakeholders
- User roles and permissions are defined and approved
- Product master data is complete and accurate
- Locations are configured in the system
- Tablets/computers available in storerooms for real-time updates

### 11.3 Dependencies
- **Inventory Management Module**: Must be operational for stock queries and updates
- **Workflow Engine**: Must be configured for approval routing
- **User Management**: Users, roles, and departments must be set up
- **Product Master**: Products must be defined with units of measure
- **Location Master**: Storage locations must be configured
- **Notification Service**: Email/in-app notification infrastructure must be available

---

## 12. Risks and Mitigation

### 12.1 Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| Integration issues with Inventory Module | Medium | High | Early integration testing, clear API contracts, fallback manual process |
| Performance degradation with large data volumes | Low | Medium | Load testing, query optimization, database indexing strategy |
| Data migration from existing system | High | High | Phased migration, extensive validation, parallel run period |
| Workflow engine complexity | Medium | Medium | Start with simple workflows, iterative enhancement, thorough testing |

### 12.2 Operational Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| User resistance to new system | Medium | High | Comprehensive training, change management, phased rollout, user champions |
| Inaccurate inventory data causing stockouts | Medium | High | Inventory reconciliation before go-live, regular cycle counts, real-time validation |
| Network connectivity issues in remote locations | Low | Medium | Offline mode for emergencies, backup manual process, regular IT support |
| Approval delays causing operational disruptions | Medium | Medium | Escalation mechanisms, notification system, emergency workflow bypass |

### 12.3 Business Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| Insufficient adoption by departments | Medium | High | Executive sponsorship, training program, early wins communication, incentives |
| Workflow process not matching operational reality | High | Medium | Extensive user consultation, pilot program, iterative refinement |
| Audit compliance requirements not met | Low | High | Early auditor involvement, compliance review checkpoints, complete audit trail |

---

## 13. Appendices

### Appendix A: Glossary
- **Requisition**: Internal document requesting materials from store
- **Issuance**: Act of releasing materials from store to requesting department
- **Stock Movement**: Transfer of inventory between locations
- **Workflow Stage**: Step in approval process requiring specific action
- **Approved Quantity**: Quantity approved by manager/storekeeper for issuance
- **Issued Quantity**: Actual quantity physically released from store
- **Source Location**: Store/warehouse from which items are requested
- **Destination Location**: Department/location receiving the items
- **Emergency Requisition**: Urgent request requiring expedited processing

### Appendix B: References
- Inventory Management Module Documentation
- Workflow Management System Specification
- Carmen ERP User Management Guide
- Hospitality Industry Best Practices for Store Management
- Internal Control Standards for Material Requisitions
- [Inventory Operations Shared Method](../../shared-methods/inventory-operations/SM-inventory-operations.md)
- [Costing Methods Shared Method](../../shared-methods/inventory-valuation/SM-costing-methods.md)

### Appendix D: Shared Method Integration

#### Inventory Operations (SM-INVENTORY-OPERATIONS)
Store Requisitions integrates with the Inventory Operations shared method for:
- **Balance Tracking**: Real-time inventory balance queries during requisition creation
- **Transaction Recording**: Stock movement transactions upon issuance
- **State Management**: Location-based inventory state tracking

#### Costing Methods (SM-COSTING-METHODS)
Store Requisitions uses the Costing Methods shared method for:
- **FIFO Costing**: First-In-First-Out cost determination for issued items
- **Periodic Average (AVG)**: Average cost calculation for inventory valuation
- **Lot Tracking**: Lot number assignment and tracking (format: {LOCATION}-{YYMMDD}-{SEQ})
- **Transaction Types**: LOT (new lots) vs ADJUSTMENT (consumption) via parent_lot_no pattern

### Appendix C: Change Log
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-12 | System | Initial document creation based on code analysis |

---

**Document Status**: Active - Ready for Implementation
**Next Review Date**: 2025-12-12
**Owner**: Store Operations Module Team
