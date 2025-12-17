# Use Cases: My Approvals

## Module Information
- **Module**: Procurement
- **Sub-Module**: My Approvals
- **Route**: `/procurement/my-approvals`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-12
- **Owner**: Procurement & Workflow Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |

---

## Overview

This document describes the use cases for the My Approvals sub-module, which provides a centralized approval workflow interface for users to review, approve, and manage documents awaiting their authorization across the entire Carmen ERP system. The use cases cover interactive user workflows, automated system processes, and external integrations that support the approval lifecycle.

**Related Documents**:
- [Business Requirements](./BR-my-approvals.md)
- [Technical Specification](./TS-my-approvals.md)
- [Data Schema](./DS-my-approvals.md)
- [Flow Diagrams](./FD-my-approvals.md)
- [Validations](./VAL-my-approvals.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **Department Head** | Manager responsible for department operations and budget | First-level approver for department requests (PRs, wastage, requisitions) |
| **Purchasing Manager** | Procurement authority responsible for vendor selection and purchasing | Approver for purchase requests and orders within authority limit |
| **Finance Controller** | Financial oversight authority responsible for budget compliance | Approver for high-value transactions and financial impacts |
| **General Manager** | Executive authority with unlimited approval power | Final approver for strategic or high-value purchases |
| **Store Manager** | Inventory and store operations manager | Approver for inventory adjustments, transfers, and replenishment |
| **Executive Chef** | F&B operations head responsible for kitchen and menu | Approver for F&B purchase requests and recipe-related items |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **Requestor** | User who submitted the document awaiting approval | Views approval status, responds to approval questions |
| **Workflow Coordinator** | Administrative role monitoring approval workflows | Monitors SLA compliance, resolves approval bottlenecks |
| **Budget Controller** | Financial analyst monitoring budget consumption | Reviews approval patterns and budget compliance |
| **Internal Auditor** | Compliance officer reviewing approval integrity | Audits approval decisions and policy compliance |
| **Delegate Approver** | Temporary approver acting on behalf of another approver | Processes approvals during primary approver's absence |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| **Workflow Engine** | Orchestrates approval routing and level progression | Internal Module |
| **Notification Service** | Sends email, push, and SMS notifications | Internal Service |
| **Email Service (SMTP)** | Delivers approval request and confirmation emails | External Service |
| **Mobile Push Service** | Delivers real-time push notifications to mobile devices | External Service (FCM/APNS) |
| **Budget Management System** | Validates budget availability and creates commitments | Internal Module |
| **Inventory Management System** | Creates inventory transactions on approval | Internal Module |
| **Finance System** | Posts GL journal entries on approval | Internal Module |
| **SLA Monitor Service** | Tracks approval SLAs and triggers escalations | Background Job |
| **Audit Logging Service** | Records all approval actions for compliance | Internal Service |

---

## Use Case Diagram

```
                         ┌─────────────────────────────────────────┐
                         │     My Approvals System                 │
                         └────────────┬────────────────────────────┘
                                      │
      ┌───────────────────────────────┼───────────────────────────────┐
      │                               │                               │
┌─────▼──────┐                 ┌─────▼──────┐                 ┌──────▼──────┐
│ Department │                 │ Purchasing │                 │   Finance   │
│    Head    │                 │  Manager   │                 │ Controller  │
└─────┬──────┘                 └─────┬──────┘                 └──────┬──────┘
      │                               │                               │
 [UC-APPR-001]                   [UC-APPR-001]                   [UC-APPR-001]
 [UC-APPR-002]                   [UC-APPR-002]                   [UC-APPR-002]
 [UC-APPR-003]                   [UC-APPR-005]                   [UC-APPR-006]
 [UC-APPR-004]                   [UC-APPR-006]
 [UC-APPR-005]


┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│   General    │              │    Store     │              │  Executive   │
│   Manager    │              │   Manager    │              │     Chef     │
└──────┬───────┘              └──────┬───────┘              └──────┬───────┘
       │                             │                             │
  [UC-APPR-001]                 [UC-APPR-001]                 [UC-APPR-001]
  [UC-APPR-002]                 [UC-APPR-002]                 [UC-APPR-002]
  [UC-APPR-005]                 [UC-APPR-005]                 [UC-APPR-004]
  [UC-APPR-006]                                               [UC-APPR-005]


      ┌──────────────┐                    ┌──────────────┐
      │  Requestor   │                    │  Workflow    │
      │              │                    │ Coordinator  │
      └──────┬───────┘                    └──────┬───────┘
             │                                   │
        [UC-APPR-007]                       [UC-APPR-008]
        (view status)                       [UC-APPR-009]
                                           (monitoring)


  ┌────────────────┐          ┌────────────────┐          ┌────────────────┐
  │  SLA Monitor   │          │   Workflow     │          │  Notification  │
  │   Service      │          │    Engine      │          │    Service     │
  │  (Scheduled)   │          │  (Automated)   │          │  (Automated)   │
  └────────┬───────┘          └────────┬───────┘          └────────┬───────┘
           │                           │                           │
      [UC-APPR-101]                [UC-APPR-103]              [UC-APPR-102]
      [UC-APPR-104]                [UC-APPR-105]              [UC-APPR-106]
      (escalation)                 (routing)                  (notify)


  ┌────────────────┐          ┌────────────────┐          ┌────────────────┐
  │    Budget      │          │   Inventory    │          │    Finance     │
  │  Management    │          │  Management    │          │    System      │
  │   Integration  │          │   Integration  │          │  Integration   │
  └────────┬───────┘          └────────┬───────┘          └────────┬───────┘
           │                           │                           │
      [UC-APPR-201]                [UC-APPR-202]              [UC-APPR-203]
      (budget check)               (inventory txn)            (GL posting)
```

**Legend**:
- **Top Section**: Primary approver roles (department heads, managers, executives)
- **Middle Section**: Supporting actors (requestors, coordinators)
- **Bottom Section**: System actors (automated services, integrations, background jobs)

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases** | | | | | |
| UC-APPR-001 | View Unified Approval Queue | All Approvers | Critical | Medium | User |
| UC-APPR-002 | Review and Approve Document | All Approvers | Critical | Complex | User |
| UC-APPR-003 | Reject Document with Reason | All Approvers | Critical | Medium | User |
| UC-APPR-004 | Request More Information | All Approvers | High | Medium | User |
| UC-APPR-005 | Bulk Approve Documents | All Approvers | High | Complex | User |
| UC-APPR-006 | Setup Approval Delegation | All Approvers | High | Medium | User |
| UC-APPR-007 | View Approval Status (Requestor) | Requestor | Medium | Simple | User |
| UC-APPR-008 | Monitor Approval Queue (Coordinator) | Workflow Coordinator | Medium | Medium | User |
| UC-APPR-009 | Generate Approval Analytics Report | Workflow Coordinator | Medium | Medium | User |
| UC-APPR-010 | Configure Approval Rules | System Administrator | Medium | Complex | User |
| **System Use Cases** | | | | | |
| UC-APPR-101 | Auto-Escalate Overdue Approvals | SLA Monitor Service | Critical | Medium | System |
| UC-APPR-102 | Send Approval Notifications | Notification Service | Critical | Medium | System |
| UC-APPR-103 | Route to Next Approval Level | Workflow Engine | Critical | Complex | System |
| UC-APPR-104 | Generate Daily Approval Digest | SLA Monitor Service | Medium | Simple | System |
| UC-APPR-105 | Validate Approval Authority | Workflow Engine | Critical | Medium | System |
| UC-APPR-106 | Send Escalation Notifications | Notification Service | High | Medium | System |
| **Integration Use Cases** | | | | | |
| UC-APPR-201 | Update Document Status in Source Module | Workflow Engine | Critical | Medium | Integration |
| UC-APPR-202 | Create Inventory Transaction on Approval | Inventory Management | Critical | Complex | Integration |
| UC-APPR-203 | Post GL Journal Entry on Approval | Finance System | Critical | Complex | Integration |
| UC-APPR-204 | Release Budget Commitment on Rejection | Budget Management | Critical | Medium | Integration |
| UC-APPR-205 | Log Approval Action to Audit Trail | Audit Logging Service | Critical | Simple | Integration |
| **Background Job Use Cases** | | | | | |
| UC-APPR-301 | Daily SLA Compliance Report | SLA Monitor (Scheduled) | Medium | Medium | Background |
| UC-APPR-302 | Weekly Approval Metrics Calculation | Analytics Engine (Scheduled) | Low | Medium | Background |
| UC-APPR-303 | Monthly Approval Audit Archive | Audit Service (Scheduled) | Medium | Simple | Background |

**Complexity Definitions**:
- **Simple**: Single-step process with minimal logic, 1-3 scenarios, straightforward validation
- **Medium**: Multi-step process with business rules, 4-8 scenarios, moderate validation and integration
- **Complex**: Multi-step process with complex validation, multiple integrations, 9+ scenarios, extensive error handling

**Priority Definitions**:
- **Critical**: Core functionality required for system operation, blocking business workflows if unavailable
- **High**: Important functionality that significantly enhances user experience and operational efficiency
- **Medium**: Supporting functionality that adds value but is not mission-critical
- **Low**: Nice-to-have features, reporting enhancements, or future optimizations

---

## Detailed Use Cases

### UC-APPR-001: View Unified Approval Queue

**Actor**: All Approvers (Department Head, Purchasing Manager, Finance Controller, General Manager, Store Manager, Executive Chef)

**Goal**: View all documents awaiting approval in a single unified interface to efficiently manage approval responsibilities.

**Priority**: Critical

**Complexity**: Medium

**Preconditions**:
- User is logged in with an approver role
- User has approval authority configured in approval matrix
- At least one document is awaiting user's approval

**Postconditions**:
- Approval queue displayed with all pending documents
- User can filter, sort, and search the queue
- User can drill down to document details for review

---

#### Main Flow

1. User navigates to My Approvals page (`/procurement/my-approvals`)
2. System authenticates user and validates approver role
3. System queries all pending approvals assigned to user across all document types
4. System retrieves document summary information (type, reference, requestor, amount, age, SLA)
5. System calculates urgency indicators (overdue, due today, due this week)
6. System renders approval queue with:
   - Document count badges by type (e.g., PRs: 12, POs: 5, Wastage: 3)
   - Total pending count prominently displayed
   - Default sort by submission date (oldest first)
   - Visual urgency indicators (red = overdue, yellow = due today, green = on time)
7. System displays filter controls (document type, priority, amount, department, age)
8. System displays sort controls (submission date, amount, age, requestor, priority)
9. System displays search box for reference number or requestor name
10. User views queue and identifies documents requiring attention
11. System auto-refreshes queue every 30 seconds to show real-time updates
12. **[UC continues to UC-APPR-002 when user clicks on a document to review]**

**Performance Requirements**:
- Queue loads within 2 seconds for up to 500 pending documents
- Filter application completes within 500ms
- Real-time refresh every 30 seconds without page reload

---

#### Alternative Flows

**A1: Empty Approval Queue**
- **Condition**: No documents awaiting user's approval
- **Flow**:
  - 3a. System determines user has no pending approvals
  - 3b. System displays empty state message: "You have no pending approvals. Well done!"
  - 3c. System shows approval history option to review past approvals
  - 3d. System suggests checking back later or setting up notification preferences
  - **Use case ends**

**A2: Apply Document Type Filter**
- **Trigger**: User selects specific document type from filter dropdown
- **Flow**:
  - 7a. User clicks document type filter
  - 7b. System displays checkbox list of document types with pending counts
  - 7c. User selects one or more document types (e.g., Purchase Requests, Wastage)
  - 7d. User clicks Apply
  - 7e. System filters queue to show only selected document types
  - 7f. System updates URL with filter parameters for sharing/bookmarking
  - 7g. System displays active filter chips above queue
  - 7h. System shows "Clear Filters" button
  - **Main flow continues at step 10**

**A3: Apply Amount Range Filter**
- **Trigger**: User wants to prioritize high-value approvals
- **Flow**:
  - 7a. User clicks amount filter
  - 7b. System displays amount range inputs (min and max)
  - 7c. User enters amount range (e.g., $10,000 - $50,000)
  - 7d. System validates amount range (min < max)
  - 7e. System filters queue to show only documents within range
  - 7f. System displays count of filtered documents
  - **Main flow continues at step 10**

**A4: Apply Overdue Filter (Quick Filter)**
- **Trigger**: User wants to focus on overdue approvals first
- **Flow**:
  - 7a. User clicks "My Overdue" quick filter chip
  - 7b. System immediately filters queue to show only overdue approvals (SLA breached)
  - 7c. System sorts by days overdue (most overdue first)
  - 7d. System highlights overdue count in red
  - 7e. System displays "Clear Filters" button
  - **Main flow continues at step 10**

**A5: Search by Reference Number**
- **Trigger**: User knows specific document reference number
- **Flow**:
  - 9a. User enters reference number in search box (e.g., "PR-2501-001234")
  - 9b. System performs real-time search as user types (debounced 300ms)
  - 9c. System filters queue to show matching documents
  - 9d. If exact match found, system highlights it in queue
  - 9e. If no match found, system displays "No results found" message
  - 9f. System allows user to clear search and restore full queue
  - **Main flow continues at step 10**

**A6: Save Custom Filter Preset**
- **Trigger**: User has applied multiple filters and wants to save for reuse
- **Flow**:
  - 7a. User applies multiple filters (e.g., Document Type = PR, Priority = Urgent, Amount > $10K)
  - 7b. User clicks "Save Filter" button
  - 7c. System displays modal asking for preset name
  - 7d. User enters name (e.g., "High Value PRs")
  - 7e. User optionally marks as "Default View"
  - 7f. System saves filter preset to user preferences
  - 7g. System displays success confirmation
  - 7h. Saved filter appears in "My Filters" dropdown for quick access
  - **Main flow continues at step 10**

---

#### Exception Flows

**E1: System Error Loading Queue**
- **Trigger**: Database connection failure or timeout
- **Flow**:
  - 3a. System encounters error querying approval queue
  - 3b. System logs error details with request context
  - 3c. System displays user-friendly error message: "Unable to load approval queue. Please try again."
  - 3d. System provides "Retry" button
  - 3e. System optionally shows cached queue data (if available) with stale data warning
  - **Use case ends**

**E2: Session Timeout**
- **Trigger**: User session expired during queue viewing
- **Flow**:
  - 11a. System detects session expiration on auto-refresh
  - 11b. System displays session timeout modal
  - 11c. System redirects to login page
  - 11d. System preserves queue state (filters, scroll position) in session storage
  - 11e. After re-login, system restores queue state
  - **Main flow continues at step 10**

**E3: Concurrent Approval Action**
- **Trigger**: Another user approves document while current user viewing it
- **Flow**:
  - 11a. System receives real-time update that document approved by another user
  - 11b. System removes document from current user's queue immediately
  - 11c. System displays temporary notification: "Document PR-2501-001234 approved by John Doe"
  - 11d. System updates pending count
  - **Main flow continues at step 10**

**E4: Invalid Filter Parameters**
- **Trigger**: User enters invalid amount range (min > max)
- **Flow**:
  - 7a. User enters min amount > max amount (e.g., min: $50,000, max: $10,000)
  - 7b. System validates filter parameters client-side
  - 7c. System displays inline error: "Minimum amount cannot exceed maximum amount"
  - 7d. System disables Apply button until error resolved
  - 7e. User corrects filter values
  - 7f. System re-enables Apply button
  - **Main flow continues at step 7**

---

### UC-APPR-002: Review and Approve Document

**Actor**: All Approvers

**Goal**: Review complete document details and approve it to progress the workflow.

**Priority**: Critical

**Complexity**: Complex

**Preconditions**:
- User has viewed approval queue (UC-APPR-001)
- Document is in Pending Approval status
- User has sufficient approval authority for document amount
- Document is currently at approval level assigned to user

**Postconditions**:
- Document status updated to Approved or progressed to next approval level
- Approval action recorded in audit trail with timestamp and comments
- Requestor notified of approval decision
- Workflow engine routes document to next level (if multi-level) or marks complete
- Budget commitment confirmed (if applicable)
- Inventory transaction created (if applicable)
- GL journal entry posted (if applicable)

---

#### Main Flow

1. User clicks on document in approval queue to review
2. System validates user's approval authority against document amount
3. System retrieves complete document details:
   - Header information (requestor, department, dates, description, justification)
   - Line items with full details (products, quantities, prices, subtotals)
   - Attachments (photos, quotes, specifications, supporting documents)
   - Approval history (previous approvers, timestamps, comments)
   - Budget impact (available balance, commitment amount)
   - Related documents (linked POs, GRNs, invoices)
4. System displays document in detail view with tabs:
   - **Overview Tab**: Header info, totals, requestor details
   - **Line Items Tab**: Grid view of all line items with calculations
   - **Attachments Tab**: Thumbnails and viewer for attached files
   - **Approval History Tab**: Timeline of previous approval actions
   - **Related Documents Tab**: Links to related transactions
5. System calculates and displays:
   - Approval level required vs. current level
   - Time remaining until SLA deadline
   - Budget availability (available vs. requested amount)
   - Price variance for procurement items (vs. historical prices)
   - Policy compliance status (any violations flagged)
6. System displays approval recommendation:
   - **Green**: All checks passed, recommended to approve
   - **Yellow**: Minor issues detected (e.g., 10% price variance), review carefully
   - **Red**: Policy violations or critical issues (e.g., budget exceeded), requires override
7. User reviews document details thoroughly:
   - Checks line items for accuracy and reasonableness
   - Reviews attached quotes and specifications
   - Verifies budget availability
   - Reviews approval history and previous approver comments
   - Checks for price variances or policy violations
8. User decides to approve the document
9. System displays Approve confirmation modal
10. System prompts for optional approval comments (mandatory if organization policy requires)
11. User enters approval comments: "Approved. Necessary for Q4 menu launch. Budget available."
12. User clicks "Confirm Approval" button
13. System validates:
    - User still has active session
    - User has approval authority for current amount
    - Document still in Pending status (not already approved by another)
    - No concurrent modifications occurred (optimistic locking check)
14. System processes approval action:
    - Records approval in approval_actions table
    - Updates document approval level and status
    - Determines if additional approval levels required
    - If final approval level: marks document as Approved
    - If multi-level: routes to next approval level automatically
15. System triggers parallel integration processes (async):
    - **Budget System**: Confirms budget commitment (converts soft to hard commit)
    - **Inventory System**: Creates inventory transaction (if stock-related document)
    - **Finance System**: Posts GL journal entry (if finance-impacting document)
    - **Notification Service**: Sends approval confirmation to requestor
    - **Workflow Engine**: Routes to next approver (if applicable)
    - **Audit Service**: Logs approval action with full context
16. System displays success confirmation: "Document PR-2501-001234 approved successfully"
17. System removes document from user's approval queue
18. System updates queue count (-1)
19. System displays option to return to queue or review next document
20. **Use case ends**

**Performance Requirements**:
- Document detail view loads within 2 seconds
- Approval action processing completes within 2 seconds (sync)
- Integration processes complete within 30 seconds (async)
- Real-time queue update across all user sessions

---

#### Alternative Flows

**A1: Review Attached Photos**
- **Trigger**: User wants to examine attached photos (wastage, damaged goods)
- **Flow**:
  - 7a. User clicks Attachments tab
  - 7b. System displays thumbnail grid of all attached photos
  - 7c. User clicks photo thumbnail to view full-size
  - 7d. System opens photo viewer modal with zoom, rotate, and navigation controls
  - 7e. User examines photo for evidence (e.g., wastage, damage, quantity)
  - 7f. User navigates through multiple photos using arrow keys or swipe gestures
  - 7g. User closes photo viewer and returns to document review
  - **Main flow continues at step 7**

**A2: Review Price Variance Alert**
- **Trigger**: Requested price 15% higher than last purchase price
- **Flow**:
  - 5a. System detects price variance >15% for line item "Fresh Salmon Fillet"
  - 5b. System displays yellow alert icon next to line item
  - 5c. System shows variance details: "Current Price: $25.00/kg, Last Price: $20.00/kg, Variance: +25%"
  - 5d. User clicks variance alert for more details
  - 5e. System displays modal with:
     - Price history chart (last 6 months)
     - Last 5 purchase prices from different vendors
     - Market trend indicator (if available)
     - Recommended action: "Review with requestor or vendor"
  - 5f. User evaluates if price increase justified (seasonal, market conditions)
  - 5g. User decides to approve despite variance (within authority)
  - 5h. User adds comment explaining variance acceptance: "Approved. Price increase due to seasonal availability."
  - **Main flow continues at step 9**

**A3: Review Budget Availability**
- **Trigger**: Document has significant budget impact
- **Flow**:
  - 5a. System displays budget panel: "F&B Budget - Monthly Allocation"
  - 5b. System shows: Total Budget: $50,000, Committed: $38,000, Available: $12,000
  - 5c. System shows: Requested Amount: $8,500
  - 5d. System calculates: Remaining After Approval: $3,500 (7% of budget)
  - 5e. System displays yellow warning: "This approval will consume 68% of remaining budget"
  - 5f. User reviews budget impact and determines if acceptable
  - 5g. User decides budget impact is reasonable and proceeds with approval
  - **Main flow continues at step 9**

**A4: Multi-Level Approval Routing**
- **Trigger**: Document requires 3 approval levels (Dept Head → Purchasing Manager → Finance Controller)
- **Flow**:
  - 14a. System determines document at Level 1 (Department Head approval)
  - 14b. System determines Level 2 approval required (amount: $25,000)
  - 14c. System updates document status to "Partially Approved" (not final approval)
  - 14d. System routes document to Level 2 approver queue (Purchasing Manager)
  - 14e. System sends notification to Level 2 approver
  - 14f. System displays to current approver: "Approved at Level 1 of 3. Routed to Purchasing Manager for Level 2 approval."
  - 15a. Budget System maintains soft commitment (not yet hard commit)
  - 15b. Inventory/Finance integrations do NOT execute (wait for final approval)
  - **Main flow continues at step 17**

**A5: Approval with Mandatory Comments**
- **Trigger**: Organization policy requires comments for all approvals >$10,000
- **Flow**:
  - 10a. System determines document amount = $15,000 (triggers mandatory comment policy)
  - 10b. System displays comment textarea with red asterisk (mandatory field indicator)
  - 10c. System displays helper text: "Approval reason required for amounts over $10,000"
  - 10d. User attempts to confirm approval without entering comments
  - 10e. System displays validation error: "Approval comments are mandatory for this document"
  - 10f. System disables Confirm button until comments entered
  - 10g. User enters comments (minimum 20 characters): "Approved. Essential equipment upgrade for kitchen safety compliance."
  - 10h. System validates comment length and enables Confirm button
  - **Main flow continues at step 12**

**A6: Mobile Biometric Approval**
- **Trigger**: User reviewing document on mobile device with biometric authentication enabled
- **Flow**:
  - 12a. User clicks "Confirm Approval" on mobile device
  - 12b. System prompts for biometric authentication (Face ID / Touch ID)
  - 12c. System displays: "Confirm approval with Face ID"
  - 12d. User authenticates using biometric sensor
  - 12e. System validates biometric authentication success
  - 12f. System records approval action with biometric authentication indicator in audit trail
  - **Main flow continues at step 13**

---

#### Exception Flows

**E1: Insufficient Approval Authority**
- **Trigger**: Document amount exceeds user's approval limit
- **Flow**:
  - 2a. System validates user's approval authority: User limit = $20,000, Document amount = $35,000
  - 2b. System detects insufficient authority
  - 2c. System displays error message: "Your approval authority ($20,000) is insufficient for this document ($35,000). This approval requires Finance Controller or General Manager."
  - 2d. System displays "Delegate to Higher Authority" option
  - 2e. User can either:
     - Delegate to appropriate approver
     - Close and skip this document
  - **Use case ends** or continues to UC-APPR-006 (delegation)

**E2: Document Already Approved (Concurrent Action)**
- **Trigger**: Another approver approved document while current user reviewing it
- **Flow**:
  - 13a. System performs optimistic locking check using doc_version
  - 13b. System detects doc_version changed (document modified by another user)
  - 13c. System queries current document status: Status = Approved, Approved By: Jane Smith at 10:45 AM
  - 13d. System displays error modal: "This document was already approved by Jane Smith at 10:45 AM while you were reviewing it."
  - 13e. System refreshes document view to show current status
  - 13f. System removes document from user's queue
  - 13g. System displays "Return to Queue" button
  - **Use case ends**

**E3: Budget Exceeded**
- **Trigger**: Budget insufficient for requested amount
- **Flow**:
  - 5a. System checks budget availability: Available = $5,000, Requested = $8,500
  - 5b. System detects budget shortfall: -$3,500
  - 5c. System displays red alert: "BUDGET EXCEEDED. Requested amount ($8,500) exceeds available budget ($5,000) by $3,500."
  - 5d. System disables Approve button
  - 5e. System displays options:
     - **Option 1**: Request budget increase (creates budget adjustment request)
     - **Option 2**: Request requestor to reduce amount (Return to Requestor)
     - **Option 3**: Approve with policy override (requires executive authority and justification)
  - 5f. User selects Option 2: Return to Requestor
  - **Use case continues to UC-APPR-004 (Request More Information)** or **UC-APPR-003 (Reject)**

**E4: Integration Failure (Budget System Timeout)**
- **Trigger**: Budget system unavailable during approval processing
- **Flow**:
  - 15a. System attempts to create budget commitment in Budget System
  - 15b. Budget System API call times out after 5 seconds
  - 15c. System logs integration error with full context
  - 15d. System displays warning to user: "Approval recorded, but budget commitment failed due to system timeout. Finance team notified for manual processing."
  - 15e. System creates approval record with flag: budget_commit_pending = true
  - 15f. System sends alert to Finance team for manual budget commitment
  - 15g. System updates document status to "Approved - Pending Budget Commit"
  - 15h. Background job retries budget commitment every 15 minutes for up to 2 hours
  - **Use case ends with partial success**

**E5: Policy Override Required**
- **Trigger**: Document violates procurement policy (e.g., single-source vendor without quotes)
- **Flow**:
  - 6a. System detects policy violation: "Purchase Request requires 3 competitive quotes for amounts >$5,000. Only 1 quote attached."
  - 6b. System displays red alert with policy violation details
  - 6c. System disables standard Approve button
  - 6d. System displays "Approve with Policy Override" button (if user has override authority)
  - 6e. User clicks "Approve with Policy Override"
  - 6f. System displays override justification modal
  - 6g. User enters justification (mandatory, min 50 characters): "Approved with override. This vendor is the sole authorized distributor for this specialized equipment. Technical specifications require this specific brand."
  - 6h. System records policy override in approval action with justification
  - 6i. System flags approval as "Policy Override" in audit trail
  - 6j. System sends notification to Compliance Officer for review
  - **Main flow continues at step 13**

---

### UC-APPR-003: Reject Document with Reason

**Actor**: All Approvers

**Goal**: Reject a document that does not meet approval criteria and return it to requestor with clear rejection reason.

**Priority**: Critical

**Complexity**: Medium

**Preconditions**:
- User has reviewed document (UC-APPR-002 in progress)
- Document is in Pending Approval status
- User has determined document does not meet approval criteria

**Postconditions**:
- Document status updated to Rejected
- Rejection reason recorded with timestamp and approver identity
- Requestor notified of rejection with reason
- Document removed from all approval queues
- Budget commitment released (if applicable)
- Workflow terminated (does not progress to next level)

---

#### Main Flow

1. User has reviewed document and identified issues preventing approval
2. User clicks "Reject" button on document detail page
3. System displays Reject confirmation modal
4. System displays rejection reason textarea (mandatory field)
5. System displays common rejection reasons as quick-select options:
   - "Budget not available"
   - "Insufficient justification"
   - "Incorrect product specifications"
   - "Price too high - request alternate vendors"
   - "Duplicate purchase request already approved"
   - "Missing required attachments"
   - "Other (custom reason)"
6. User selects quick reason or enters custom rejection reason
7. User adds detailed explanation (mandatory, min 20 characters): "Rejected. Similar items already ordered via PR-2501-001180 last week. Please check with inventory before creating new PR."
8. System validates rejection reason (minimum length, not empty)
9. User clicks "Confirm Rejection" button
10. System validates:
    - User still has active session
    - Document still in Pending status
    - No concurrent modifications
11. System processes rejection:
    - Records rejection in approval_actions table with reason
    - Updates document status to "Rejected"
    - Timestamps rejection action
    - Records approver identity and IP address
12. System triggers parallel integration processes (async):
    - **Budget System**: Releases budget commitment (soft commit removed)
    - **Workflow Engine**: Terminates approval workflow (no further routing)
    - **Notification Service**: Sends rejection notification to requestor with reason
    - **Audit Service**: Logs rejection action with full context
13. System displays success confirmation: "Document PR-2501-001234 rejected successfully"
14. System removes document from user's approval queue
15. System updates queue count (-1)
16. System displays option to return to queue or review next document
17. **Use case ends**

**Performance Requirements**:
- Rejection processing completes within 2 seconds
- Requestor notification sent within 30 seconds
- Budget release processed within 1 minute

---

#### Alternative Flows

**A1: Select Quick Rejection Reason**
- **Trigger**: Issue matches one of predefined rejection reasons
- **Flow**:
  - 6a. User clicks quick reason: "Price too high - request alternate vendors"
  - 6b. System auto-populates rejection reason textarea
  - 6c. User optionally adds more detail: "Current quoted price $450/unit. Historical average $320/unit. Request 2 additional quotes."
  - **Main flow continues at step 8**

**A2: Reject with Recommendation**
- **Trigger**: User wants to provide constructive feedback to requestor
- **Flow**:
  - 7a. User enters rejection reason with recommendation: "Rejected due to high price. Recommendation: Contact vendors ABC Corp and XYZ Supplies for competitive quotes. Approve budget up to $350/unit."
  - 7b. System captures recommendation as structured data (optional feature)
  - 7c. Notification email to requestor highlights recommendation prominently
  - **Main flow continues at step 8**

---

#### Exception Flows

**E1: Empty Rejection Reason**
- **Trigger**: User attempts to reject without entering reason
- **Flow**:
  - 8a. System validates rejection reason textarea is empty
  - 8b. System displays error: "Rejection reason is mandatory. Please explain why this document cannot be approved."
  - 8c. System highlights rejection reason field in red
  - 8d. System disables Confirm button until reason entered
  - **Main flow continues at step 7**

**E2: Rejection Reason Too Short**
- **Trigger**: User enters reason <20 characters (e.g., "Budget issue")
- **Flow**:
  - 8a. System validates rejection reason length = 12 characters (< 20 minimum)
  - 8b. System displays warning: "Rejection reason must be at least 20 characters. Please provide more detail."
  - 8c. System shows character count: "12 / 20 characters"
  - 8d. User adds more detail: "Budget issue - quarterly allocation exhausted"
  - **Main flow continues at step 8**

---

### UC-APPR-004: Request More Information

**Actor**: All Approvers

**Goal**: Request additional information or clarification from requestor before making approval decision.

**Priority**: High

**Complexity**: Medium

**Preconditions**:
- User has reviewed document (UC-APPR-002 in progress)
- Document is in Pending Approval status
- User has identified missing or unclear information needed for approval decision

**Postconditions**:
- Document status updated to "Awaiting Information"
- Information request recorded with timestamp and approver identity
- Requestor notified with specific questions
- Document remains in user's queue but flagged as awaiting response
- SLA timer paused until requestor responds
- Budget commitment maintained (soft commit)

---

#### Main Flow

1. User has reviewed document and identified need for additional information
2. User clicks "Request More Info" button on document detail page
3. System displays Request Information modal
4. System displays information request textarea (mandatory field)
5. System displays common information request templates as quick-select:
   - "Please provide 2 additional quotes from alternate vendors"
   - "Please attach product specifications or technical datasheet"
   - "Please clarify business justification for this purchase"
   - "Please verify requested quantity is correct (seems unusually high)"
   - "Please confirm delivery date can be met"
   - "Other (custom request)"
6. User selects template or enters custom information request
7. User adds specific questions (mandatory, min 20 characters): "Please provide: 1) Specifications for the equipment model requested, 2) Quote from at least one alternate vendor for comparison, 3) Explanation for urgent delivery requirement."
8. System validates information request (minimum length, not empty, clarity)
9. User optionally sets response deadline (default: 48 business hours)
10. User clicks "Send Request" button
11. System validates:
    - User still has active session
    - Document still in Pending status
    - No concurrent modifications
12. System processes information request:
    - Records request in approval_actions table (action_type = "Request Info")
    - Updates document status to "Awaiting Information"
    - Timestamps request action
    - Records approver identity
    - Sets response deadline
13. System triggers parallel processes (async):
    - **Workflow Engine**: Pauses SLA timer until response received
    - **Notification Service**: Sends email and push notification to requestor with questions
    - **Reminder Service**: Schedules reminder notification 24 hours before deadline
    - **Audit Service**: Logs information request with full context
14. System displays success confirmation: "Information request sent to requestor. SLA timer paused until response received."
15. System updates document visual indicator in queue: "Awaiting Info" badge
16. System keeps document in user's queue for follow-up once requestor responds
17. System displays option to return to queue or review next document
18. **Use case ends** (resumes when requestor responds)

**Performance Requirements**:
- Information request processing completes within 2 seconds
- Requestor notification sent within 30 seconds
- SLA pause applied immediately

---

#### Alternative Flows

**A1: Requestor Provides Information**
- **Trigger**: Requestor responds to information request with additional details/attachments
- **Flow**:
  - (After use case ends, this is triggered when requestor responds)
  - 1a. Requestor receives notification and reviews questions
  - 1b. Requestor edits document to add requested information
  - 1c. Requestor uploads additional attachments (quotes, specifications)
  - 1d. Requestor adds response comments: "Attached specifications and alternate quote from XYZ Supplies. Urgent delivery needed for VIP event on Dec 15."
  - 1e. Requestor clicks "Submit Response" and selects approver from dropdown
  - 1f. System updates document status back to "Pending Approval"
  - 1g. System resumes SLA timer from pause point
  - 1h. System sends notification to original approver: "Requestor has provided additional information for PR-2501-001234"
  - 1i. System displays "New Info Available" badge in approver's queue
  - 1j. Approver reviews updated document (returns to UC-APPR-002)
  - **Use case resumes at UC-APPR-002 for approval decision**

**A2: Multiple Round-Trip (Clarification on Clarification)**
- **Trigger**: Requestor's response does not fully address approver's questions
- **Flow**:
  - A1-1j. Approver reviews response and finds it incomplete
  - A1-1k. Approver clicks "Request More Info" again
  - A1-1l. Approver adds follow-up question: "Thank you for the additional quote. However, the alternate quote is missing installation cost. Please confirm total installed price including labor."
  - A1-1m. System records second information request with incremented request count
  - A1-1n. System pauses SLA timer again
  - A1-1o. Requestor receives notification for follow-up question
  - **Use case repeats A1 flow**

---

#### Exception Flows

**E1: Information Request Deadline Missed**
- **Trigger**: Requestor does not respond within 48 business hours
- **Flow**:
  - (48 hours after information request sent)
  - 1a. Background job detects response deadline passed
  - 1b. System sends reminder notification to requestor: "Reminder: Information request for PR-2501-001234 is overdue. Please respond to proceed with approval."
  - 1c. System sends escalation notification to requestor's manager
  - 1d. System displays "Info Overdue" badge in approver's queue
  - 1e. Approver can choose to:
     - **Option 1**: Extend deadline by another 24-48 hours
     - **Option 2**: Proceed to reject document due to lack of response
     - **Option 3**: Escalate to requestor's manager
  - **Use case ends** or continues to UC-APPR-003 (Reject)

**E2: Requestor Recalls Document**
- **Trigger**: Requestor realizes they need to make significant changes and recalls document
- **Flow**:
  - (While document in "Awaiting Information" status)
  - 1a. Requestor clicks "Recall Document" button in their document view
  - 1b. System updates document status to "Recalled"
  - 1c. System removes document from all approval queues
  - 1d. System sends notification to approver: "PR-2501-001234 recalled by requestor"
  - 1e. System releases budget commitment
  - 1f. System allows requestor to edit and resubmit later
  - **Use case ends**

---

### UC-APPR-005: Bulk Approve Documents

**Actor**: All Approvers

**Goal**: Approve multiple similar documents simultaneously to increase approval efficiency for routine transactions.

**Priority**: High

**Complexity**: Complex

**Preconditions**:
- User has viewed approval queue (UC-APPR-001)
- Multiple documents of same type awaiting approval
- All selected documents are within user's approval authority
- Documents meet approval criteria (no policy violations)

**Postconditions**:
- All selected documents approved simultaneously
- Each approval recorded individually in audit trail
- All requestors notified of approval decisions
- Documents removed from approval queue
- Integration processes triggered for each document (budget, inventory, GL)

---

#### Main Flow

1. User views approval queue with multiple pending documents
2. User identifies multiple similar documents suitable for bulk approval (e.g., routine F&B PRs <$1,000)
3. User clicks "Select Multiple" button to enable bulk selection mode
4. System displays checkboxes next to each document in queue
5. System displays bulk action toolbar at top of queue
6. User selects multiple documents by clicking checkboxes (up to 50 documents)
7. System validates each selected document:
   - All within user's approval authority
   - All same document type (e.g., all PRs or all Wastage)
   - None have policy violations requiring individual review
8. System updates bulk action toolbar with:
   - Selected count: "15 documents selected"
   - Total amount: "Total: $12,450"
   - Document types: "All Purchase Requests"
9. User reviews selected documents in bulk selection panel:
   - Reference numbers listed
   - Requestors listed
   - Amounts listed
   - Ability to deselect individual documents
10. User clicks "Bulk Approve" button
11. System displays Bulk Approve confirmation modal
12. System shows summary:
    - Count: 15 documents
    - Total Amount: $12,450
    - Document Types: Purchase Requests (15)
    - Requestors: 8 unique requestors
    - Budget Impact: $12,450 commitment
13. System prompts for optional bulk approval comments (applied to all)
14. User enters comments: "Bulk approved. Routine F&B inventory replenishment within normal spend levels."
15. User clicks "Confirm Bulk Approval" button
16. System validates:
    - User still has active session for all documents
    - All documents still in Pending status
    - User has authority for total amount (not just individual)
    - No concurrent modifications to any selected document
17. System processes bulk approval in transaction:
    - **Atomic Transaction**: All documents approved together or none (rollback on any failure)
    - Records individual approval action for each document
    - Updates status for all documents simultaneously
    - Timestamps all approvals with same timestamp (indicating bulk action)
    - Records approver identity and bulk approval indicator
18. System displays progress bar: "Processing 15 approvals... 7 of 15 completed"
19. System triggers parallel integration processes for each document (async):
    - **Budget System**: Confirms budget commitments for all documents
    - **Inventory System**: Creates inventory transactions (if applicable)
    - **Finance System**: Posts GL journal entries (if applicable)
    - **Notification Service**: Sends individual approval confirmations to each requestor
    - **Workflow Engine**: Routes to next level (if multi-level approval)
    - **Audit Service**: Logs each approval with bulk approval indicator
20. System displays success confirmation: "15 documents approved successfully"
21. System shows detailed results:
    - Success: 15 documents approved
    - Failed: 0 documents
    - Total Amount Approved: $12,450
22. System removes all approved documents from user's queue
23. System updates queue count (-15)
24. System displays option to return to queue
25. **Use case ends**

**Performance Requirements**:
- Bulk approval of 20 documents completes within 5 seconds (sync processing)
- Integration processes complete within 30 seconds per document (async)
- Progress indicator updates in real-time during processing

---

#### Alternative Flows

**A1: Partial Bulk Approval (Some Documents Fail)**
- **Trigger**: One or more documents fail validation during bulk approval
- **Flow**:
  - 17a. System begins processing bulk approval transaction
  - 17b. Document 7 of 15 fails validation (e.g., concurrent modification detected)
  - 17c. System rolls back entire transaction (atomic operation)
  - 17d. System displays error modal: "Bulk approval failed. Document PR-2501-001240 was modified by another user during bulk approval."
  - 17e. System shows two options:
     - **Option 1**: Remove failed document and retry bulk approval with remaining 14
     - **Option 2**: Cancel bulk approval and review failed document individually
  - 17f. User selects Option 1: Remove failed document
  - 17g. System deselects PR-2501-001240 from bulk selection
  - 17h. System updates summary: 14 documents, Total: $11,850
  - 17i. User clicks "Retry Bulk Approval"
  - **Main flow continues at step 16** (retry with reduced set)

**A2: Bulk Approve with Filter**
- **Trigger**: User wants to bulk approve only specific filtered documents
- **Flow**:
  - 1a. User applies filter: Document Type = PR, Department = F&B, Amount < $1,000
  - 1b. System filters queue to 23 matching documents
  - 1c. User clicks "Select All Filtered" button
  - 1d. System selects all 23 filtered documents automatically
  - **Main flow continues at step 7**

**A3: Exclude Individual Document from Bulk Selection**
- **Trigger**: User notices one document in selection needs individual review
- **Flow**:
  - 9a. User reviews bulk selection panel
  - 9b. User notices PR-2501-001245 has higher amount than others ($2,500 vs. average $800)
  - 9c. User clicks X icon next to PR-2501-001245 to deselect
  - 9d. System removes document from bulk selection
  - 9e. System updates summary: 14 documents, Total: $9,950
  - **Main flow continues at step 10**

---

#### Exception Flows

**E1: Exceeds Bulk Approval Limit**
- **Trigger**: User attempts to select more than 50 documents
- **Flow**:
  - 6a. User selects 50 documents
  - 6b. User attempts to select 51st document
  - 6c. System displays warning: "Bulk approval limited to 50 documents per action. Please process current selection before selecting more."
  - 6d. System disables remaining checkboxes
  - 6e. System highlights "Bulk Approve" button to encourage processing current selection
  - **Main flow continues at step 10** (process current 50) or user deselects some to add others

**E2: Mixed Document Types Selected**
- **Trigger**: User selects documents of different types (PRs and Wastage)
- **Flow**:
  - 6a. User selects 10 Purchase Requests
  - 6b. User selects 3 Wastage Reports
  - 7a. System validates selected documents
  - 7b. System detects mixed document types
  - 7c. System displays error: "Bulk approval requires all documents to be the same type. Please select only Purchase Requests or only Wastage Reports."
  - 7d. System disables "Bulk Approve" button
  - 7e. System highlights mixed selection in bulk panel with different colors
  - 7f. User deselects Wastage Reports to proceed with only PRs
  - **Main flow continues at step 7**

**E3: Total Amount Exceeds Approval Authority**
- **Trigger**: Individual documents within authority, but total exceeds limit
- **Flow**:
  - 16a. System validates user approval authority: $50,000
  - 16b. System calculates total bulk approval amount: $62,000
  - 16c. System detects total exceeds authority
  - 16d. System displays error: "Total bulk approval amount ($62,000) exceeds your approval authority ($50,000). Please reduce selection or approve individually."
  - 16e. System suggests: "You can approve up to $50,000 total. Current selection exceeds by $12,000."
  - 16f. System displays "Auto-Select Within Authority" button
  - 16g. If user clicks auto-select:
     - System automatically deselects higher-amount documents until total ≤ $50,000
     - System updates summary with valid selection
  - **Main flow continues at step 10** (with reduced selection)

**E4: Integration Failure During Bulk Approval**
- **Trigger**: Budget system unavailable during bulk approval processing
- **Flow**:
  - 19a. System successfully records all 15 approval actions
  - 19b. System attempts budget commitment for all documents
  - 19c. Budget system API fails after processing 8 of 15 documents
  - 19d. System logs integration error with context
  - 19e. System displays partial success message: "15 approvals recorded successfully. Budget commitment completed for 8 documents, pending for 7 documents due to system timeout."
  - 19f. System marks 7 documents with flag: budget_commit_pending = true
  - 19g. System sends alert to Finance team for manual processing
  - 19h. Background job retries budget commitment for failed documents every 15 minutes
  - **Use case ends with partial success**

---

### UC-APPR-006: Setup Approval Delegation

**Actor**: All Approvers

**Goal**: Delegate approval authority to another user temporarily during absence to ensure business continuity.

**Priority**: High

**Complexity**: Medium

**Preconditions**:
- User has approver role with configured approval authority
- User anticipates absence (vacation, business trip, illness)
- Potential delegate user exists with equal or higher approval authority

**Postconditions**:
- Approval delegation created with start and end dates
- Delegate receives all pending and new approval requests during delegation period
- Delegation recorded in audit trail
- Delegate and manager notified of delegation
- Approval actions by delegate attributed correctly in audit trail
- Delegation expires automatically at end date

---

#### Main Flow

1. User navigates to My Approvals page
2. User clicks "Manage Delegations" button in top right
3. System displays Delegation Management panel
4. System shows active delegations (if any) and past delegations
5. User clicks "New Delegation" button
6. System displays Create Delegation modal
7. System displays delegation form fields:
   - Delegate User (search/dropdown)
   - Start Date/Time
   - End Date/Time
   - Delegation Scope (All Documents / Specific Types / Specific Departments)
   - Maximum Amount Limit
   - Delegation Reason
   - Delegation Notes
8. User searches for delegate by name: "Sarah Johnson - Purchasing Manager"
9. System displays matching users with approval authority indicators
10. User selects Sarah Johnson as delegate
11. System validates delegate has equal or higher approval authority
12. System displays delegate's current approval authority: $75,000 (higher than user's $50,000)
13. User sets delegation period:
    - Start Date: 2025-12-15 (Monday)
    - Start Time: 00:00
    - End Date: 2025-12-22 (Monday)
    - End Time: 23:59
14. User selects delegation scope: "All Documents" (default)
15. User optionally sets maximum amount limit: $50,000 (match user's own authority)
16. User enters delegation reason: "Annual leave - will be out of office"
17. User adds notes: "Contact me via email only for emergencies"
18. System calculates delegation duration: 8 days
19. System displays pending approvals that will be transferred: "12 pending approvals will be delegated to Sarah Johnson"
20. User reviews delegation summary and clicks "Create Delegation"
21. System validates:
    - End date after start date
    - Delegation period reasonable (<90 days)
    - Delegate not same as user (cannot delegate to self)
    - No overlapping delegations to same delegate for same period
22. System creates delegation record:
    - Delegation ID generated
    - Status set to "Scheduled" (before start date) or "Active" (if starting immediately)
    - All field values saved
23. System schedules delegation activation for start date/time
24. System triggers notifications:
    - **Email to Delegate**: "John Smith has delegated approval authority to you from 12/15 to 12/22"
    - **Email to User's Manager**: "John Smith created approval delegation to Sarah Johnson"
    - **Calendar Invite**: Optional calendar block for delegate (if calendar integration enabled)
25. System displays success confirmation: "Approval delegation created successfully"
26. System shows delegation details with option to edit or revoke before activation
27. **Use case ends**

**Activation (On Start Date)**:
28. **Background Job** at start date/time:
    - Updates delegation status to "Active"
    - Transfers all pending approvals from user to delegate
    - Routes all new approval requests to delegate instead of user
    - Adds "Acting for John Smith" indicator to delegate's approval queue
    - Sends activation notification to delegate: "Approval delegation is now active"

**Expiration (On End Date)**:
29. **Background Job** at end date/time:
    - Updates delegation status to "Expired"
    - Routes new approval requests back to original user
    - Keeps approval actions taken by delegate during delegation period in history
    - Sends expiration notification to user: "Approval delegation has expired. You are now receiving approval requests directly."

**Performance Requirements**:
- Delegation creation completes within 2 seconds
- Delegation activation processes within 1 minute of start time
- Delegation expiration processes within 1 minute of end time

---

#### Alternative Flows

**A1: Partial Scope Delegation (Specific Document Types)**
- **Trigger**: User wants to delegate only certain document types
- **Flow**:
  - 14a. User selects delegation scope: "Specific Document Types"
  - 14b. System displays document type checkboxes: PRs, POs, GRNs, Credit Notes, Wastage, Requisitions
  - 14c. User selects: Purchase Requests and Wastage only
  - 14d. System updates delegation scope in summary
  - 19a. System shows pending approvals to be delegated: "8 Purchase Requests and 4 Wastage Reports will be delegated"
  - **Main flow continues at step 20**

**A2: Department-Specific Delegation**
- **Trigger**: User wants to delegate only approvals for specific departments
- **Flow**:
  - 14a. User selects delegation scope: "Specific Departments"
  - 14b. System displays department multi-select dropdown
  - 14c. User selects: F&B Department and Kitchen Department
  - 14d. System updates delegation scope in summary
  - 19a. System shows pending approvals to be delegated: "10 pending approvals from F&B and Kitchen departments"
  - **Main flow continues at step 20**

**A3: Immediate Delegation (Urgent)**
- **Trigger**: User needs to delegate immediately due to unexpected absence (illness, emergency)
- **Flow**:
  - 13a. User clicks "Start Immediately" checkbox
  - 13b. System sets start date/time to current timestamp
  - 13c. System sets delegation status to "Active" immediately upon creation
  - 23a. System activates delegation without waiting for scheduled start time
  - 24a. System transfers pending approvals to delegate immediately
  - 24b. System sends urgent notification to delegate: "URGENT: John Smith delegated approval authority to you immediately due to unexpected absence"
  - **Main flow continues at step 25**

**A4: Extend Existing Delegation**
- **Trigger**: User's absence period extended and needs to extend delegation
- **Flow**:
  - 3a. User views active delegation in Delegation Management panel
  - 3b. User clicks "Extend" button next to active delegation
  - 3c. System displays Extend Delegation modal with current end date
  - 3d. User updates end date from 12/22 to 12/29 (+7 days extension)
  - 3e. System validates new end date after current end date
  - 3f. System updates delegation record with new end date
  - 3g. System sends notification to delegate: "Approval delegation extended to 12/29"
  - **Use case ends**

---

#### Exception Flows

**E1: Delegate Has Insufficient Authority**
- **Trigger**: Selected delegate has lower approval authority than user
- **Flow**:
  - 11a. System validates delegate approval authority: $20,000
  - 11b. System detects delegate authority ($20,000) < user authority ($50,000)
  - 11c. System displays error: "Sarah Johnson's approval authority ($20,000) is lower than yours ($50,000). Delegation requires delegate with equal or higher authority."
  - 11d. System suggests: "Consider delegating to Michael Brown (Purchasing Director, $100,000 authority)"
  - 11e. User can either:
     - Select different delegate with sufficient authority
     - Set maximum amount limit ≤ $20,000 (partial delegation)
  - **Main flow continues at step 8** (select different delegate)

**E2: Overlapping Delegation Period**
- **Trigger**: User already has active or scheduled delegation for same period
- **Flow**:
  - 21a. System detects existing delegation: 12/10 - 12/17 to David Lee
  - 21b. System detects new delegation overlaps: 12/15 - 12/22 to Sarah Johnson
  - 21c. System displays error: "You already have a delegation to David Lee from 12/10 to 12/17, which overlaps with this new delegation."
  - 21d. System shows options:
     - **Option 1**: Revoke existing delegation and create new one
     - **Option 2**: Adjust dates to avoid overlap (e.g., start new delegation on 12/18)
     - **Option 3**: Cancel current action
  - 21e. User selects Option 2 and adjusts start date to 12/18
  - **Main flow continues at step 20**

**E3: Delegate Refuses Delegation**
- **Trigger**: Delegate clicks "Refuse" on delegation notification
- **Flow**:
  - (After delegation created and notification sent)
  - 24a. Delegate receives notification email
  - 24b. Delegate clicks "Refuse Delegation" link
  - 24c. System displays Refuse Delegation form requesting reason
  - 24d. Delegate enters reason: "I will also be on leave during this period. Cannot accept delegation."
  - 24e. System updates delegation status to "Refused"
  - 24f. System sends notification to original user: "Sarah Johnson refused your delegation. Reason: I will also be on leave during this period."
  - 24g. System recommends alternate delegates based on approval authority and availability
  - 24h. User must create new delegation to different delegate
  - **Use case ends** (delegation cancelled)

**E4: Delegation Period Too Long**
- **Trigger**: User sets delegation period >90 days
- **Flow**:
  - 18a. System calculates delegation duration: 120 days
  - 18b. System detects duration exceeds maximum allowed (90 days)
  - 18c. System displays error: "Delegation period cannot exceed 90 days. Current period: 120 days."
  - 18d. System suggests: "For extended absences >90 days, please contact System Administrator to adjust approval authority matrix."
  - 18e. User adjusts end date to be within 90 days
  - **Main flow continues at step 20**

---

## Use Case Relationships

### Include Relationships
- UC-APPR-002 **includes** UC-APPR-001 (must view queue before reviewing document)
- UC-APPR-003 **includes** UC-APPR-002 (must review before rejecting)
- UC-APPR-004 **includes** UC-APPR-002 (must review before requesting info)
- UC-APPR-005 **includes** UC-APPR-001 (must view queue before bulk approve)

### Extend Relationships
- UC-APPR-005 **extends** UC-APPR-002 (bulk approve is extended version of single approve)
- UC-APPR-006 **extends** UC-APPR-001 (delegation affects queue visibility)

### Trigger Relationships
- UC-APPR-002 approval **triggers** UC-APPR-103 (route to next level)
- UC-APPR-002 approval **triggers** UC-APPR-202 (create inventory transaction)
- UC-APPR-002 approval **triggers** UC-APPR-203 (post GL entry)
- UC-APPR-003 rejection **triggers** UC-APPR-204 (release budget commitment)
- UC-APPR-004 info request **triggers** UC-APPR-102 (send notification)
- UC-APPR-005 bulk approve **triggers** multiple instances of UC-APPR-103, UC-APPR-202, UC-APPR-203

### Temporal Relationships
- UC-APPR-101 (SLA escalation) runs continuously in background monitoring all pending approvals
- UC-APPR-104 (daily digest) runs once per day for all approvers with pending items
- UC-APPR-301 (SLA compliance report) runs daily to generate metrics
- UC-APPR-302 (weekly metrics) runs weekly to calculate approval KPIs

---

## Glossary

- **Approval Authority**: The maximum transaction value a user is authorized to approve
- **Approval Level**: A step in multi-level approval workflow (Level 1, Level 2, Level 3)
- **Approval Queue**: List of documents awaiting an approver's review and decision
- **Atomic Transaction**: All-or-nothing database transaction (all succeed or all rollback)
- **Biometric Authentication**: Fingerprint or face recognition for secure approval
- **Bulk Approval**: Approving multiple documents simultaneously with single action
- **Business Hours**: Working hours during which SLA time is counted (excludes weekends, holidays)
- **Concurrent Modification**: Two users attempting to modify same document simultaneously
- **Delegation**: Temporary transfer of approval authority to another user
- **Escalation**: Automatic routing of overdue approval to higher authority or manager
- **Optimistic Locking**: Concurrency control using version number to detect concurrent updates
- **Policy Override**: Approval granted despite violation of standard policy rules
- **Self-Approval**: Prohibited action where requestor approves their own request
- **SLA (Service Level Agreement)**: Target time for approval completion
- **Soft Commitment**: Budget reservation created upon document submission (before approval)
- **Hard Commitment**: Budget reservation confirmed upon document approval

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Business Owner** | | | |
| **Product Manager** | | | |
| **Solution Architect** | | | |
| **Development Lead** | | | |
| **QA Lead** | | | |

---

**Document Status**: Draft - Awaiting Review
**Next Review Date**: 2025-11-19
**Document Classification**: Internal Use Only
