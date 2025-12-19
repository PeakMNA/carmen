# Use Cases: Stock Transfers View

## 1. Overview

**KEY ARCHITECTURE**: Stock Transfers are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage with INVENTORY type destinations.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Stock Transfers View                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐                                                      │
│   │Warehouse     │──────┬─► UC-01: View Stock Transfers List           │
│   │Staff         │      │                                               │
│   └──────────────┘      ├─► UC-02: View Transfer Details               │
│                         │                                               │
│   ┌──────────────┐      ├─► UC-03: Filter and Search Transfers         │
│   │Store Manager │──────┤                                               │
│   └──────────────┘      ├─► UC-04: Navigate to Source SR               │
│                         │                                               │
│                         └─► UC-05: Print Transfer Document             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Note**: All workflow actions (approve, issue, complete) are performed on the underlying Store Requisition, NOT on the Stock Transfer view.

## 2. Detailed Use Cases

---

### UC-01: View Stock Transfers List

**Actor**: Warehouse Staff, Store Manager

**Description**: View filtered list of Store Requisitions at Issue stage with INVENTORY destinations

**Preconditions**:
- User has access to Stock Transfers view
- User has store_operations.view permission

**Main Flow**:
1. User navigates to Stock Transfers list
2. System filters mockStoreRequisitions where:
   - `stage === 'issue' OR stage === 'complete'`
   - `destinationLocationType === 'INVENTORY'`
3. System displays summary cards:
   - Total Transfers (count)
   - Active (in_progress count)
   - Completed (completed count)
   - Total Value (sum)
4. System displays transfer list with columns:
   - SR Reference No
   - Date (requiredDate)
   - Status (SR status)
   - From Location
   - To Location
   - Items (count)
   - Total Value
5. User can sort by any column
6. User can paginate through results

**Alternative Flows**:
- **A1**: No transfers exist → System displays empty state message
- **A2**: User has location restriction → System filters by allowed locations

**Postconditions**:
- User has visibility of stock transfer status across locations

**Business Rules**: BR-ST-ACC-001, BR-ST-ACC-003

---

### UC-02: View Transfer Details

**Actor**: Warehouse Staff, Store Manager

**Description**: View SR detail in "transfer" layout (read-only)

**Preconditions**:
- SR exists at Issue or Complete stage
- SR destinationLocationType is INVENTORY
- User has view permission

**Main Flow**:
1. User clicks on transfer row or reference number
2. System navigates to detail page
3. System loads StoreRequisition by ID
4. System displays in "transfer" layout:
   - Header with SR reference, date, status badge
   - From Location card (source INVENTORY location)
   - Transfer Summary card (items count, total quantity, total value)
   - To Location card (destination INVENTORY location)
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
- User has complete visibility of transfer details

**Business Rules**: BR-ST-ACC-001, BR-ST-REF-001

---

### UC-03: Filter and Search Transfers

**Actor**: Warehouse Staff, Store Manager

**Description**: Filter and search stock transfers (filtered SR data)

**Preconditions**:
- User has access to Stock Transfers view

**Main Flow**:
1. User enters search term in search box
2. System filters by:
   - SR Reference number
   - From location name
   - To location name
3. User selects status filter (All, Active, Completed)
4. System updates list in real-time
5. Summary cards update to reflect filtered results

**Alternative Flows**:
- **A1**: No results match filter → System displays "No transfers found"
- **A2**: Clear filters → System shows all transfers

**Postconditions**:
- User views filtered list of transfers

**Business Rules**: BR-ST-ACC-001

---

### UC-04: Navigate to Source SR

**Actor**: Warehouse Staff, Store Manager

**Description**: Navigate from transfer view to full Store Requisition detail

**Preconditions**:
- Transfer view is displayed
- User has SR view permission

**Main Flow**:
1. User views transfer detail page
2. User clicks "View Full SR" or SR reference link
3. System navigates to Store Requisition detail page
4. User can perform SR actions (if permitted):
   - Complete (if at Issue stage)
   - Print
   - View history

**Postconditions**:
- User is on SR detail page with full action capabilities

**Business Rules**: BR-ST-ACT-002

---

### UC-05: Print Transfer Document

**Actor**: Warehouse Staff, Store Manager

**Description**: Print stock transfer document (from SR data)

**Preconditions**:
- Transfer exists (SR at Issue/Complete stage)
- User has view permission

**Main Flow**:
1. User views transfer detail page
2. User clicks "Print" button
3. System generates printable document with:
   - Header (SR reference, date, status)
   - Location information (From, To)
   - Items list with quantities
   - Signature fields
4. Browser print dialog opens
5. User prints document

**Alternative Flows**:
- **A1**: PDF export → System generates PDF for download

**Postconditions**:
- Physical document generated for signature collection

**Business Rules**: BR-ST-ACT-004

---

## 3. Use Case Relationships

```
UC-01 View Stock Transfers List
    │
    └──► includes ──► UC-03 Filter and Search Transfers
    │
    └──► extends ──► UC-02 View Transfer Details
                         │
                         ├──► extends ──► UC-04 Navigate to Source SR
                         │
                         └──► extends ──► UC-05 Print Transfer Document
```

## 4. Actor Permissions Matrix

| Use Case | Warehouse Staff | Store Manager | Finance Manager |
|----------|-----------------|---------------|-----------------|
| UC-01: View Transfers | ✓ | ✓ | View Only |
| UC-02: View Details | ✓ | ✓ | View Only |
| UC-03: Filter/Search | ✓ | ✓ | ✓ |
| UC-04: Navigate to SR | ✓ | ✓ | ✓ |
| UC-05: Print Document | ✓ | ✓ | ✓ |

**Note**: Issue/Complete actions are performed on the SR, not the transfer view.

## 5. User Journey Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Stock Transfer View Journey                             │
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
│                    │ Transfer View            │                            │
│                    │ (if dest = INVENTORY)    │                            │
│                    └──────────────────────────┘                            │
│                                                                             │
│  TRANSFER VIEW (READ-ONLY)                                                  │
│  ─────────────────────────────                                              │
│                                                                             │
│  1. VIEW LIST      2. VIEW DETAILS     3. NAVIGATE TO SR                   │
│  ─────────────     ─────────────       ─────────────────                   │
│                                                                             │
│  Browse filtered   View SR in          Go to full SR                        │
│  SR data           "transfer" layout   for actions                          │
│       │                 │                   │                               │
│       ▼                 ▼                   ▼                               │
│  ┌─────────┐       ┌─────────┐        ┌─────────┐                          │
│  │ List    │──────►│ Detail  │───────►│ SR Page │                          │
│  │ Page    │       │ Page    │        │ Actions │                          │
│  └─────────┘       └─────────┘        └─────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6. Exception Scenarios

| Scenario | Trigger | System Response |
|----------|---------|-----------------|
| SR Not Found | Invalid ID in URL | Display 404 error page |
| Not at Issue Stage | SR at earlier stage | Redirect to SR list |
| Permission Denied | User lacks permission | Hide page, display error |
| Network Timeout | API call fails | Show error toast, allow retry |

## 7. Removed Use Cases (Previous Architecture)

The following use cases have been **removed** as Stock Transfers are now view-only:

- ~~UC-03: Issue Stock Transfer~~ → Now handled via SR workflow
- ~~UC-04: Confirm Transfer Receipt~~ → **Removed entirely** (no receipt process)
- ~~Create/Edit Transfer~~ → SRs are created/edited instead
- ~~Cancel Transfer~~ → SR cancellation only
