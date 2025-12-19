# Use Cases: Stock Issues View

## 1. Overview

**KEY ARCHITECTURE**: Stock Issues are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage with DIRECT type destinations.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Stock Issues View                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐                                                      │
│   │Warehouse     │──────┬─► UC-01: View Stock Issues List              │
│   │Staff         │      │                                               │
│   └──────────────┘      ├─► UC-02: View Issue Details                  │
│                         │                                               │
│   ┌──────────────┐      ├─► UC-03: Filter and Search Issues            │
│   │Department    │──────┤                                               │
│   │Manager       │      ├─► UC-04: Navigate to Source SR               │
│   └──────────────┘      │                                               │
│                         └─► UC-05: Print Issue Document                │
│   ┌──────────────┐                                                      │
│   │Finance Staff │──────► UC-06: View Expense Allocation               │
│   └──────────────┘                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Note**: All workflow actions (approve, issue, complete) are performed on the underlying Store Requisition, NOT on the Stock Issue view.

## 2. Detailed Use Cases

---

### UC-01: View Stock Issues List

**Actor**: Warehouse Staff, Department Manager, Store Manager

**Description**: View filtered list of Store Requisitions at Issue stage with DIRECT destinations

**Preconditions**:
- User has access to Stock Issues view
- User has store_operations.view permission

**Main Flow**:
1. User navigates to Stock Issues list
2. System filters mockStoreRequisitions where:
   - `stage === 'issue' OR stage === 'complete'`
   - `destinationLocationType === 'DIRECT'`
3. System displays summary cards:
   - Total Issues (count)
   - Active (in_progress count)
   - Completed (completed count)
   - Total Value (sum)
4. System displays issue list with columns:
   - SR Reference No
   - Date (requiredDate)
   - Status (SR status)
   - From Location
   - To Location (DIRECT)
   - Department
   - Items (count)
   - Total Value
5. User can sort by any column
6. User can paginate through results

**Alternative Flows**:
- **A1**: No issues exist → System displays empty state message
- **A2**: User has department restriction → System filters by allowed departments

**Postconditions**:
- User has visibility of stock issue status across departments

**Business Rules**: BR-SI-ACC-001, BR-SI-ACC-003

---

### UC-02: View Issue Details

**Actor**: Warehouse Staff, Department Manager, Store Manager

**Description**: View SR detail in "issue" layout (read-only)

**Preconditions**:
- SR exists at Issue or Complete stage
- SR destinationLocationType is DIRECT
- User has view permission

**Main Flow**:
1. User clicks on issue row or reference number
2. System navigates to detail page
3. System loads StoreRequisition by ID
4. System displays in "issue" layout:
   - Header with SR reference, date, status badge
   - From Location card (source INVENTORY location)
   - Issue Summary card (items count, total quantity, total value)
   - To Location card (destination DIRECT location)
   - Department card (assigned department)
   - Expense Account card (if assigned)
   - Link to source SR
5. System displays items table:
   - Product Code
   - Product Name
   - Unit
   - Requested Qty
   - Approved Qty
   - Issued Qty
   - Unit Cost
   - Total Value
6. System displays tracking info:
   - Issued At, Issued By (if available on SR)

**Alternative Flows**:
- **A1**: SR not found → System displays 404 error
- **A2**: SR not at Issue stage → Redirect to SR detail

**Postconditions**:
- User has complete visibility of issue details

**Business Rules**: BR-SI-ACC-001, BR-SI-REF-001

---

### UC-03: Filter and Search Issues

**Actor**: Warehouse Staff, Department Manager, Store Manager

**Description**: Filter and search stock issues (filtered SR data)

**Preconditions**:
- User has access to Stock Issues view

**Main Flow**:
1. User enters search term in search box
2. System filters by:
   - SR Reference number
   - From location name
   - To location name
   - Department name
3. User selects status filter (All, Active, Completed)
4. System updates list in real-time
5. Summary cards update to reflect filtered results

**Alternative Flows**:
- **A1**: No results match filter → System displays "No issues found"
- **A2**: Clear filters → System shows all issues

**Postconditions**:
- User views filtered list of issues

**Business Rules**: BR-SI-ACC-001

---

### UC-04: Navigate to Source SR

**Actor**: Warehouse Staff, Department Manager, Store Manager

**Description**: Navigate from issue view to full Store Requisition detail

**Preconditions**:
- Issue view is displayed
- User has SR view permission

**Main Flow**:
1. User views issue detail page
2. User clicks "View Full SR" or SR reference link
3. System navigates to Store Requisition detail page
4. User can perform SR actions (if permitted):
   - Complete (if at Issue stage)
   - Print
   - View history

**Postconditions**:
- User is on SR detail page with full action capabilities

**Business Rules**: BR-SI-ACT-002

---

### UC-05: Print Issue Document

**Actor**: Warehouse Staff, Department Manager

**Description**: Print stock issue document (from SR data)

**Preconditions**:
- Issue exists (SR at Issue/Complete stage)
- User has view permission

**Main Flow**:
1. User views issue detail page
2. User clicks "Print" button
3. System generates printable document with:
   - Header (SR reference, date, status)
   - Location information (From, To)
   - Department and expense account
   - Items list with quantities and costs
   - Signature fields
4. Browser print dialog opens
5. User prints document

**Alternative Flows**:
- **A1**: PDF export → System generates PDF for download

**Postconditions**:
- Physical document generated for signature collection

**Business Rules**: BR-SI-ACT-004

---

### UC-06: View Expense Allocation

**Actor**: Finance Staff, Department Manager

**Description**: View expense allocation details for a stock issue

**Preconditions**:
- SR status is Completed or InProgress
- User has permission to view costs

**Main Flow**:
1. User views issue detail page
2. System displays expense allocation:
   - Department (from destination DIRECT location)
   - Expense Account (if assigned)
   - Total Value expensed
3. System displays items with individual costs
4. User can view breakdown by product category

**Alternative Flows**:
- **A1**: No expense account assigned → System shows department default
- **A2**: User lacks cost view permission → Cost columns hidden

**Postconditions**:
- User understands cost allocation for the issue

**Business Rules**: BR-SI-DEPT-001, BR-SI-EXP-001

---

## 3. Use Case Relationships

```
UC-01 View Stock Issues List
    │
    └──► includes ──► UC-03 Filter and Search Issues
    │
    └──► extends ──► UC-02 View Issue Details
                         │
                         ├──► extends ──► UC-04 Navigate to Source SR
                         │
                         ├──► extends ──► UC-05 Print Issue Document
                         │
                         └──► extends ──► UC-06 View Expense Allocation
```

## 4. Actor Permissions Matrix

| Use Case | Warehouse Staff | Department Manager | Store Manager | Finance Staff |
|----------|-----------------|-------------------|---------------|---------------|
| UC-01: View Issues | ✓ | ✓ (own dept) | ✓ | View Only |
| UC-02: View Details | ✓ | ✓ (own dept) | ✓ | View Only |
| UC-03: Filter/Search | ✓ | ✓ | ✓ | ✓ |
| UC-04: Navigate to SR | ✓ | ✓ | ✓ | ✓ |
| UC-05: Print Document | ✓ | ✓ | ✓ | ✓ |
| UC-06: View Expense | ✗ | ✓ (own dept) | ✓ | ✓ |

**Note**: Issue/Complete actions are performed on the SR, not the issue view.

## 5. User Journey Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Stock Issue View Journey                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SR LIFECYCLE                                                               │
│  ─────────────                                                              │
│                                                                             │
│  Draft → Submit → Approve → Issue → Complete                                │
│                              │         │                                    │
│                              ▼         ▼                                    │
│                    ┌──────────────────────────┐                            │
│                    │ Appears in Stock         │                            │
│                    │ Issue View               │                            │
│                    │ (if dest = DIRECT)       │                            │
│                    └──────────────────────────┘                            │
│                                                                             │
│  ISSUE VIEW (READ-ONLY)                                                     │
│  ──────────────────────────                                                 │
│                                                                             │
│  1. VIEW LIST      2. VIEW DETAILS     3. NAVIGATE TO SR                   │
│  ─────────────     ─────────────       ─────────────────                   │
│                                                                             │
│  Browse filtered   View SR in          Go to full SR                        │
│  SR data           "issue" layout      for actions                          │
│       │                 │                   │                               │
│       ▼                 ▼                   ▼                               │
│  ┌─────────┐       ┌─────────┐        ┌─────────┐                          │
│  │ List    │──────►│ Detail  │───────►│ SR Page │                          │
│  │ Page    │       │ Page    │        │ Actions │                          │
│  └─────────┘       └─────────┘        └─────────┘                          │
│       │                 │                                                   │
│       │                 ├──► View Expense Allocation                       │
│       │                 └──► Print Issue Document                          │
│       │                                                                     │
│       └──► Filter by Department                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6. Exception Scenarios

| Scenario | Trigger | System Response |
|----------|---------|-----------------|
| SR Not Found | Invalid ID in URL | Display 404 error page |
| Not at Issue Stage | SR at earlier stage | Redirect to SR list |
| Not DIRECT Destination | SR with INVENTORY destination | Redirect to Stock Transfers |
| Permission Denied | User lacks permission | Hide page, display error |
| Network Timeout | API call fails | Show error toast, allow retry |

## 7. Removed Use Cases (Previous Architecture)

The following use cases have been **removed** as Stock Issues are now view-only:

- ~~UC-03: Issue Stock~~ → Now handled via SR workflow
- ~~Create/Edit Issue~~ → SRs are created/edited instead
- ~~Cancel Issue~~ → SR cancellation only

## 8. Comparison: Stock Issue vs Stock Transfer Views

| Aspect | Stock Issue View | Stock Transfer View |
|--------|-----------------|---------------------|
| Destination Type | DIRECT (expense) | INVENTORY |
| Department | Required (shown) | Not applicable |
| Expense Account | Optional (shown) | Not applicable |
| Cost Treatment | Immediate expense | Cost transfer |
| Use Case Count | 6 | 5 |
| Additional UC | View Expense Allocation | - |
