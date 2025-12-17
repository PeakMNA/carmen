# Business Requirements: Purchase Requests

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Module Information
- **Module**: Procurement
- **Sub-Module**: Purchase Requests
- **Route**: `/procurement/purchase-requests`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-30

## Overview

The Purchase Requests sub-module enables users to create, manage, and track purchase requests throughout the approval workflow. It provides comprehensive functionality for requesting goods and services with budget control and multi-level approval workflows.

## Business Objectives

1. Streamline purchase request creation and approval process
2. Ensure budget compliance and control before commitment
3. Maintain accurate and auditable procurement records
4. Optimize vendor selection through historical data
5. Track procurement spending and commitments
6. Support multi-level approval workflows
7. Enable efficient collaboration between departments

## Key Stakeholders

- **Primary Users**: Department Managers, Requestors, Procurement Staff
- **Approvers**: Department Heads, Finance Team, Budget Controllers
- **Reviewers**: Procurement Managers, Auditors
- **Support**: System Administrators, IT Department

## Functional Requirements

### FR-PR-001: Purchase Request Creation
**Priority**: Critical

Users must be able to create purchase requests with the following capabilities:
- Auto-generated unique reference numbers
- PR type selection (General/Market List/Asset)
- Requestor information (auto-populated from user profile)
- Department and location assignment
- Delivery date specification
- Description and justification fields
- Document attachments support

**Acceptance Criteria**:
- Reference number follows format: PR-[YYYY]-[NNNNNN]
- All required fields validated before save
- Draft PRs can be saved without submission
- Requestor defaults to logged-in user

### FR-PR-002: Item Management
**Priority**: Critical

Users must be able to add and manage items in purchase requests:
- Add multiple items to a single PR
- Specify item details: name, description, quantity, unit, estimated price
- Category and subcategory assignment
- Delivery date per item
- Delivery point specification
- Job code assignment
- Vendor suggestion based on price history
- Price comparison with historical data

**Acceptance Criteria**:
- Minimum one item required per PR
- Quantity supports 3 decimal places
- Price supports 2 decimal places
- Item total calculated automatically
- Grid supports inline editing

### FR-PR-003: Financial Calculations
**Priority**: Critical

System must perform accurate financial calculations:
- Item subtotal calculation (Quantity × Unit Price)
- Discount application (percentage or fixed amount)
- Tax calculation (on net amount)
- Currency conversion (if multi-currency enabled)
- Total amount calculation (Net Amount + Tax)
- Base currency conversion for all amounts

**Calculation Rules**:
- Item subtotal = Round(Quantity × Unit Price, 2)
- Discount amount = Round(Subtotal × Discount Rate, 2)
- Net amount = Round(Subtotal - Discount, 2)
- Tax amount = Round(Net Amount × Tax Rate, 2)
- Item total = Round(Net Amount + Tax, 2)
- All rounding uses half-up (banker's) rounding

**Acceptance Criteria**:
- All monetary amounts displayed with 2 decimals
- All quantities displayed with 3 decimals
- Exchange rates displayed with 5 decimals
- Real-time calculation updates
- Base currency totals always displayed

### FR-PR-004: Budget Control
**Priority**: Critical

System must enforce budget control and validation:
- Check budget availability before submission
- Display budget information: total, committed, available
- Create soft commitment on PR submission
- Update budget availability in real-time
- Prevent submission if budget exceeded (configurable)
- Support budget categories and cost centers

**Acceptance Criteria**:
- Budget check performed on submission
- Clear error message if budget insufficient
- Budget impact displayed to user
- Soft commitment created immediately on approval
- Budget release on PR rejection/cancellation

### FR-PR-005: Approval Workflow
**Priority**: Critical

System must support multi-level approval workflows:
- Automatic routing based on amount thresholds
- Department head approval required
- Finance review for high-value PRs
- Sequential or parallel approval stages
- Email notifications to approvers
- Approval delegation support
- Rejection with comments
- Approval history tracking

**Approval Levels**:
- Level 1: Department Head (< $5,000)
- Level 2: Finance Manager ($5,000 - $50,000)
- Level 3: CFO (> $50,000)

**Acceptance Criteria**:
- PR routes to correct approver automatically
- Approvers receive email notifications
- Approval/rejection recorded with timestamp
- Comments required for rejection
- Status updated in real-time
- Full approval history visible

### FR-PR-006: Status Management
**Priority**: High

System must track and display PR status:
- Draft: Saved but not submitted
- Submitted: Awaiting approval
- Under Review: In approval process
- Approved: All approvals received
- Partially Approved: Some approvals pending
- Rejected: Approval denied
- Completed: Converted to PO
- Cancelled: Manually cancelled

**Acceptance Criteria**:
- Status clearly displayed on PR
- Status transitions logged
- Only valid status transitions allowed
- Status filters in list view
- Status indicators color-coded

### FR-PR-007: Document Management
**Priority**: Medium

Users must be able to attach supporting documents:
- Upload multiple files per PR
- Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
- Maximum file size: 10MB per file
- Document preview capability
- Document download
- Document deletion (by creator only)

**Acceptance Criteria**:
- File upload interface intuitive
- File type validation enforced
- File size limits enforced
- Documents linked to PR permanently
- Audit trail for document actions

### FR-PR-008: Comments and Collaboration
**Priority**: Medium

Users must be able to add comments and notes:
- Internal comments (visible to organization only)
- Vendor comments (visible to vendor if shared)
- Comment threading
- @mention functionality
- Comment timestamps
- Edit/delete own comments within 15 minutes

**Acceptance Criteria**:
- Comments displayed chronologically
- Comment author clearly identified
- Email notifications for @mentions
- Comment edit history tracked
- Comment visibility controls work correctly

### FR-PR-009: List View and Filtering
**Priority**: High

Users must be able to view and filter PRs:
- Paginated list view (default 20 per page)
- Sort by: Date, PR Number, Status, Total Amount, Requestor
- Filter by: Status, Date Range, Department, Location, Requestor, Amount Range
- Search by: PR Number, Item Name, Description, Vendor
- Quick filters: My PRs, Pending Approval, Recently Approved
- Export to Excel/CSV

**Acceptance Criteria**:
- List loads within 2 seconds
- Filters apply instantly
- Sort order persists in session
- Export includes all filtered data
- Column visibility customizable

### FR-PR-010: Detail View
**Priority**: High

Users must be able to view complete PR details:
- Header information (PR number, date, requestor, status)
- Item details in grid format
- Financial summary (subtotals, tax, discounts, total)
- Budget information
- Approval workflow status
- Document attachments list
- Comments thread
- Activity log
- Related documents (POs created from this PR)

**Acceptance Criteria**:
- All information clearly organized
- Item grid responsive and readable
- Financial summary accurate
- Workflow progress visually indicated
- Activity log chronological

### FR-PR-011: Edit and Modify
**Priority**: High

Users must be able to edit PRs based on status and permissions:
- Draft PRs: Full editing capability
- Submitted PRs: No editing until returned
- Rejected PRs: Full editing to resubmit
- Approved PRs: No editing (read-only)
- Item quantity adjustments during approval (by approvers)

**Acceptance Criteria**:
- Edit restrictions enforced by status
- Permission checks on all edit actions
- Audit trail for all modifications
- Version history maintained
- Concurrent edit prevention

### FR-PR-012: Copy and Template
**Priority**: Medium

Users must be able to create PRs from existing data:
- Copy from existing PR
- Create from PR template
- Recurring PR scheduling (future enhancement)

**Acceptance Criteria**:
- Copy preserves items and details
- User can modify before saving
- New reference number generated
- Template application works correctly

### FR-PR-013: Print and Export
**Priority**: Medium

Users must be able to print and export PRs:
- Print preview before printing
- PDF generation
- Email PR as PDF attachment
- Export to Excel for reporting
- Print format matches organization branding

**Acceptance Criteria**:
- Print layout professional and clear
- PDF includes all relevant information
- Email integration works correctly
- Excel export structured properly
- Branding elements included

### FR-PR-014: Notifications
**Priority**: High

System must send notifications for key events:
- PR submitted: Notify approvers
- PR approved: Notify requestor and next approver
- PR rejected: Notify requestor with comments
- PR requires action: Daily digest to pending approvers
- PR converted to PO: Notify requestor

**Acceptance Criteria**:
- Notifications sent within 1 minute
- Email template professional
- Notification preferences configurable
- Unsubscribe option available
- In-app notifications also displayed

### FR-PR-015: Mobile Responsiveness
**Priority**: Medium

Interface must be mobile-friendly:
- Responsive design for tablets and phones
- Touch-friendly controls
- Simplified mobile view
- Key actions accessible on mobile
- No horizontal scrolling required

**Acceptance Criteria**:
- Works on iOS and Android
- Touch targets minimum 44x44 pixels
- Forms usable on mobile
- List view optimized for small screens
- Approval actions work on mobile

## Business Rules

### Required Fields
- **BR-PR-001**: Reference number must be unique and auto-generated
- **BR-PR-002**: Requestor, department, delivery date are mandatory
- **BR-PR-003**: At least one item required with quantity > 0
- **BR-PR-004**: Item unit price must be > 0
- **BR-PR-005**: Description and justification required for submission

### Budget Rules
- **BR-PR-006**: Budget availability must be checked before submission
- **BR-PR-007**: Soft commitment created on submission, not approval
- **BR-PR-008**: Budget category must be valid and active
- **BR-PR-009**: Amount thresholds determine approval levels
- **BR-PR-010**: Budget must be available in base currency

### Workflow Rules
- **BR-PR-011**: Department head approval always required
- **BR-PR-012**: Finance review required for amounts > threshold
- **BR-PR-013**: All approvals required before status = Approved
- **BR-PR-014**: Rejection requires comments
- **BR-PR-015**: Approver cannot approve own PR

### Data Validation Rules
- **BR-PR-016**: Delivery date must be future date
- **BR-PR-017**: Currency must be valid and active
- **BR-PR-018**: Exchange rates updated daily (if multi-currency)
- **BR-PR-019**: Tax rates must be current and valid
- **BR-PR-020**: Item categories must be from approved list

### Display Rules
- **BR-PR-021**: All dates displayed in user's timezone
- **BR-PR-022**: All amounts displayed with 2 decimal places
- **BR-PR-023**: All quantities displayed with 3 decimal places
- **BR-PR-024**: Currency symbol displayed based on PR currency
- **BR-PR-025**: Numeric values right-aligned in grids

## Data Model

### Purchase Request Entity
```typescript
interface PurchaseRequest {
  id: string                      // UUID
  refNumber: string               // PR-YYMM-NNNN
  date: Date                      // Creation date
  type: 'General' | 'Market List' | 'Asset'
  deliveryDate: Date              // Required delivery date
  description: string             // Purpose description
  justification?: string          // Business justification
  requestorId: string             // User ID
  requestor: {
    name: string
    id: string
    department: string
    email: string
  }
  status: PRStatus                // Current status
  workflowStatus: WorkflowStatus  // Approval status
  location: string                // Location code
  department: string              // Department code
  jobCode?: string                // Project/job code
  currency: string                // Transaction currency
  baseCurrency: string            // Organization base currency
  exchangeRate: number            // Currency exchange rate

  // Financial amounts in transaction currency
  subTotalPrice: number
  discountAmount: number
  netAmount: number
  taxAmount: number
  totalAmount: number

  // Financial amounts in base currency
  baseSubTotalPrice: number
  baseDiscAmount: number
  baseNetAmount: number
  baseTaxAmount: number
  baseTotalAmount: number

  // Relationships
  items: PurchaseRequestItem[]
  attachments: Attachment[]
  comments: Comment[]
  approvalHistory: ApprovalRecord[]

  // Audit fields
  createdDate: Date
  createdBy: string
  updatedDate: Date
  updatedBy: string
}
```

### Purchase Request Item Entity
```typescript
interface PurchaseRequestItem {
  id: string
  prId: string                    // Parent PR ID
  lineNumber: number              // Sequence number

  // Item details
  itemCode?: string               // Product code (if catalog item)
  name: string                    // Item name/description
  description?: string            // Additional description
  specification?: string          // Technical specifications

  // Quantity and units
  quantityRequested: number       // Requested quantity (3 decimals)
  quantityApproved?: number       // Approved quantity (3 decimals)
  unit: string                    // Unit of measure

  // Location and delivery
  location: string                // Storage location
  deliveryDate: Date              // Required delivery date
  deliveryPoint: string           // Delivery location

  // Pricing and financial
  currency: string
  price: number                   // Unit price (2 decimals)
  subtotal: number                // Quantity × Price
  discountRate: number            // Discount percentage
  discountAmount: number          // Calculated discount
  netAmount: number               // Subtotal - Discount
  taxRate: number                 // Tax percentage
  taxAmount: number               // Calculated tax
  totalAmount: number             // Net + Tax

  // Base currency amounts
  baseSubtotal: number
  baseDiscAmount: number
  baseNetAmount: number
  baseTaxAmount: number
  baseTotalAmount: number

  // Classification
  itemCategory: string
  itemSubcategory?: string
  accountCode?: string            // GL account code
  jobCode?: string                // Project/job code

  // Vendor information
  vendorId?: number
  vendorName?: string
  pricelistNumber?: string

  // Additional fields
  foc: boolean                    // Free of charge flag
  taxIncluded: boolean            // Tax inclusive flag
  comment?: string                // Line item notes

  // Audit fields
  createdDate: Date
  createdBy: string
  updatedDate: Date
  updatedBy: string
}
```

## Integration Points

### Internal Systems
- **Budget Management**: Real-time budget availability checks
- **User Management**: User authentication and authorization
- **Department Management**: Department and location data
- **Workflow Engine**: Approval routing and notifications
- **Purchase Orders**: PR to PO conversion
- **Vendor Management**: Vendor selection and pricing
- **Accounting**: GL code validation and posting

### External Systems (Future)
- **Email Service**: Notification delivery
- **Document Storage**: Attachment management
- **ERP Integration**: Sync with external ERP systems
- **Vendor Portal**: Vendor access to PRs

## Non-Functional Requirements

### Performance
- **NFR-PR-001**: List page load time < 2 seconds for 1000 records
- **NFR-PR-002**: Detail page load time < 1 second
- **NFR-PR-003**: Save operation completes < 3 seconds
- **NFR-PR-004**: Budget check completes < 1 second
- **NFR-PR-005**: Support 100 concurrent users

### Security
- **NFR-PR-006**: All data transmitted over HTTPS/TLS
- **NFR-PR-007**: Role-based access control enforced
- **NFR-PR-008**: Audit trail for all data modifications
- **NFR-PR-009**: Session timeout after 30 minutes inactivity
- **NFR-PR-010**: Password-protected PDF exports

### Usability
- **NFR-PR-011**: Interface follows organization design system
- **NFR-PR-012**: Help text available for all fields
- **NFR-PR-013**: Error messages clear and actionable
- **NFR-PR-014**: Keyboard shortcuts for common actions
- **NFR-PR-015**: Accessibility WCAG 2.1 AA compliant

### Reliability
- **NFR-PR-016**: System availability 99.5% during business hours
- **NFR-PR-017**: Data backup every 4 hours
- **NFR-PR-018**: Disaster recovery RTO 4 hours
- **NFR-PR-019**: Automatic session recovery on network failure
- **NFR-PR-020**: Graceful degradation on service unavailability

### Scalability
- **NFR-PR-021**: Support 10,000 PRs per year
- **NFR-PR-022**: Support 50,000 PR items per year
- **NFR-PR-023**: Database query optimization for large datasets
- **NFR-PR-024**: Pagination for all list views
- **NFR-PR-025**: Archival strategy for historical data

## Success Metrics

### Efficiency Metrics
- Average time to create PR: < 5 minutes
- Average approval cycle time: < 24 hours for standard PRs
- PR resubmission rate: < 10%
- Budget check failures: < 5%

### Quality Metrics
- PR data accuracy: > 98%
- User satisfaction score: > 4.0/5.0
- System uptime: > 99.5%
- Audit compliance: 100%

### Adoption Metrics
- User adoption rate: > 90% of target users
- Mobile usage: > 30% of total usage
- Self-service rate: > 80% (users completing without support)
- Training completion rate: 100% of active users

## Dependencies

- User Management module for authentication
- Department Management for organizational structure
- Budget Management for budget control
- Workflow Engine for approvals
- Vendor Management for vendor data
- Product Management for item catalog

## Assumptions and Constraints

### Assumptions
- Users have basic computer literacy
- Internet connection available
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Email system operational for notifications
- Budget data maintained and current

### Constraints
- Must integrate with existing ERP system
- Must comply with financial approval policies
- Must support multiple currencies
- Must maintain audit trail for 7 years
- Performance limited by database capacity

## Future Enhancements

- Mobile app (iOS/Android native)
- Recurring PR scheduling
- AI-powered vendor recommendations
- Predictive budget analysis
- Advanced analytics dashboard
- OCR for document processing
- E-signature integration
- Blockchain for audit trail
- Machine learning for approval routing

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Owner | | | |
| Procurement Manager | | | |
| Finance Manager | | | |
| IT Manager | | | |
