# Use Cases: Department and Cost Center Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Department and Cost Center Management
- **Route**: `/finance/department-management`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-13
- **Owner**: Finance Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-13 | Carmen ERP Documentation Team | Initial version |

---

## Overview

This document describes the use cases for the Department and Cost Center Management sub-module, which enables organizational structure tracking, budget allocation, and financial reporting by department. The use cases cover department configuration, hierarchy management, cost center assignment, budget management, multi-department transaction allocation, and departmental reporting. These workflows ensure accurate cost tracking and responsibility accounting across the organization's structure.

**Related Documents**:
- [Business Requirements](./BR-department-management.md)
- [Technical Specification](./TS-department-management.md)
- [Data Schema](./DS-department-management.md)
- [Flow Diagrams](./FD-department-management.md)
- [Validation Rules](./VAL-department-management.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **CFO / Financial Controller** | Senior finance executive responsible for financial structure | Approves department structure, budget allocations, organizational hierarchy |
| **Finance Manager** | Manages finance operations and organizational setup | Configures departments, assigns cost centers, manages hierarchies |
| **Department Head** | Manager responsible for department operations | Reviews department budget, approves department transactions, monitors performance |
| **Accountant** | Performs daily accounting tasks | Posts transactions to departments, generates department reports, reconciles budgets |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **HR Manager** | Manages employee assignments | Assigns employees to departments, updates organizational structure |
| **Purchasing Manager** | Creates purchase orders | Charges purchases to departments, manages department approvals |
| **Financial Analyst** | Analyzes financial data | Generates department variance reports, budget analysis, trend analysis |
| **General Manager** | Overall property/business operations | Reviews cross-department performance, approves major allocations |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| **GL Posting Engine** | Posts transactions with department dimensions | Core Service |
| **Budget Engine** | Tracks budget vs actual by department | Core Service |
| **Account Code Mapping** | Maps expense/revenue accounts to default departments | Internal Integration |
| **Approval Workflow Engine** | Routes approvals based on department hierarchy | Core Service |
| **HR System** | Provides employee-department assignments | External Integration |
| **Procurement System** | Sources department-based purchase requests | Internal Integration |

---

## Use Case Diagram

```
                    ┌──────────────────────────────────────────┐
                    │  Department & Cost Center Management     │
                    └────────────┬─────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
   ┌─────▼──────┐         ┌─────▼──────┐         ┌─────▼──────┐
   │    CFO     │         │  Finance   │         │ Department │
   │            │         │  Manager   │         │    Head    │
   └─────┬──────┘         └─────┬──────┘         └─────┬──────┘
         │                      │                       │
    [UC-DEPT-001]          [UC-DEPT-002]           [UC-DEPT-009]
    [UC-DEPT-011]          [UC-DEPT-003]           [UC-DEPT-010]
                           [UC-DEPT-004]           [UC-DEPT-015]
                           [UC-DEPT-005]
                           [UC-DEPT-006]
                           [UC-DEPT-007]

   ┌──────────────┐        ┌──────────────┐       ┌──────────────┐
   │  Accountant  │        │      HR      │       │  Purchasing  │
   │              │        │   Manager    │       │   Manager    │
   └──────┬───────┘        └──────┬───────┘       └──────┬───────┘
          │                       │                       │
     [UC-DEPT-008]           [UC-DEPT-012]           [UC-DEPT-013]
     [UC-DEPT-014]           [UC-DEPT-016]           [UC-DEPT-017]
     [UC-DEPT-018]

  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
  │   GL Posting   │      │     Budget     │      │    Approval    │
  │     Engine     │      │     Engine     │      │    Workflow    │
  │  (Automated)   │      │  (Automated)   │      │    Engine      │
  └────────┬───────┘      └────────┬───────┘      └────────┬───────┘
           │                       │                       │
      [UC-DEPT-101]            [UC-DEPT-102]          [UC-DEPT-103]
   (dept dimension)       (budget tracking)        (dept approval)

  ┌────────────────┐      ┌────────────────┐
  │       HR       │      │  Procurement   │
  │     System     │      │     System     │
  │  Integration   │      │  Integration   │
  └────────┬───────┘      └────────┬───────┘
           │                       │
      [UC-DEPT-201]            [UC-DEPT-202]
   (employee sync)           (dept purchases)
```

**Legend**:
- **Top Section**: Primary finance users (CFO, managers, department heads)
- **Middle Section**: Operational users (accountants, HR, purchasing staff)
- **Bottom Section**: System actors (automated services, integrations, background jobs)

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **Department Configuration** | | | | | |
| UC-DEPT-001 | Create Department Structure | CFO / Finance Manager | Critical | Medium | User |
| UC-DEPT-002 | Configure Department Hierarchy | Finance Manager | High | Complex | User |
| UC-DEPT-003 | Assign Department Head | Finance Manager | Critical | Medium | User |
| UC-DEPT-004 | Assign Cost Center to Department | Finance Manager | High | Simple | User |
| UC-DEPT-005 | Configure Department Budget | Finance Manager | Critical | Complex | User |
| UC-DEPT-006 | Modify Department Details | Finance Manager | Medium | Simple | User |
| UC-DEPT-007 | Deactivate Department | Finance Manager | Medium | Medium | User |
| **Transaction Processing** | | | | | |
| UC-DEPT-008 | Post Transaction to Department | Accountant | Critical | Medium | User |
| UC-DEPT-009 | Approve Department Transaction | Department Head | Critical | Medium | User |
| UC-DEPT-010 | Review Department Budget Status | Department Head | High | Simple | User |
| UC-DEPT-011 | Allocate Transaction Across Departments | CFO / Accountant | High | Complex | User |
| **User Management** | | | | | |
| UC-DEPT-012 | Assign User to Department | HR Manager | High | Simple | User |
| UC-DEPT-013 | Set Department Approval Limits | Finance Manager | High | Medium | User |
| **Reporting & Analysis** | | | | | |
| UC-DEPT-014 | Generate Department Income Statement | Accountant | Critical | Medium | User |
| UC-DEPT-015 | Generate Budget vs Actual Report | Department Head | Critical | Medium | User |
| UC-DEPT-016 | Generate Department Expense Analysis | Financial Analyst | High | Medium | User |
| UC-DEPT-017 | Generate Cross-Department Allocation Report | Purchasing Manager | Medium | Medium | User |
| UC-DEPT-018 | Run Period-End Department Close | Accountant | Critical | Complex | User |
| **Automated Processes** | | | | | |
| UC-DEPT-101 | Post Transaction with Department Dimension | GL Posting Engine | Critical | Medium | System |
| UC-DEPT-102 | Track Budget vs Actual | Budget Engine | Critical | Complex | System |
| UC-DEPT-103 | Route Approval by Department | Approval Workflow | Critical | Medium | System |
| **Integration Processes** | | | | | |
| UC-DEPT-201 | Sync Employee-Department Assignments | HR Integration | High | Medium | Integration |
| UC-DEPT-202 | Post Department Purchase Request | Procurement Integration | Critical | Complex | Integration |

**Complexity Definitions**:
- **Simple**: Single-step process, minimal logic, straightforward validation
- **Medium**: Multi-step process with business rules, moderate validation
- **Complex**: Multi-step process with complex calculations, multiple integrations, extensive error handling

---

## Detailed Use Cases

### UC-DEPT-001: Create Department Structure

**Actor**: CFO / Finance Manager

**Goal**: Create a new department in the organizational structure with basic configuration.

**Priority**: Critical

**Complexity**: Medium

**Frequency**: Quarterly or as needed during organizational changes

**Preconditions**:
- User is logged in as CFO or Finance Manager
- User has permission to create departments
- Base currency configured
- GL account chart exists
- Parent department exists (if creating sub-department)

**Main Flow**:
1. User navigates to Finance → Department Management → Departments
2. System displays list of existing departments with hierarchy view
3. User clicks "Create Department" button
4. System displays department creation form
5. User enters department basic information:
   - Department Code: KITCHEN
   - Department Name: Kitchen Operations
   - Description: Main kitchen for food preparation and cooking
   - Department Type: Operational
   - Parent Department: Food & Beverage Division
   - Location: Main Property
6. User configures financial settings:
   - Primary Cost Center: CC-KITCHEN-001
   - Default Expense Account: 5100 - Cost of Goods Sold
   - Default Revenue Account: (none - expense dept)
7. User sets effective dates:
   - Effective From: 2025-11-01
   - Effective To: (leave blank - no end date)
   - Status: Active
8. User assigns department management:
   - Department Head: John Smith (Executive Chef)
   - Secondary Manager: Mary Johnson (Sous Chef)
   - Approval Limit: $5,000 per transaction
9. User configures budget allocation:
   - Annual Budget: $500,000
   - Budget Type: Expense
   - Allocation Method: Monthly equal distribution
10. System validates department data:
    - Department code unique
    - Department code format valid (uppercase, alphanumeric, max 20 chars)
    - Parent department exists and active
    - Cost center exists
    - GL accounts exist and active
    - Department head is valid user
    - Budget amount is positive
11. System displays department summary for review:
    ```
    Department: KITCHEN - Kitchen Operations
    Type: Operational
    Parent: Food & Beverage Division
    Hierarchy Level: 3 (Division → F&B → Kitchen)

    Financial Configuration:
      Primary Cost Center: CC-KITCHEN-001
      Default Expense GL: 5100 - COGS
      Annual Budget: $500,000 ($41,666.67/month)

    Management:
      Department Head: John Smith (Approval Limit: $5,000)
      Secondary Manager: Mary Johnson

    Status: Active from 2025-11-01
    ```
12. User reviews and clicks "Create Department"
13. System validates hierarchy depth (max 5 levels)
14. System creates department record
15. System creates cost center assignment
16. System creates department-user assignments (head and secondary)
17. System initializes monthly budget records
18. System creates default approval workflow based on limits
19. System logs department creation in audit trail
20. System displays success message: "Department KITCHEN created successfully"
21. System returns to department list with new department highlighted
22. System displays organization chart updated with new department

**Alternative Flows**:

**AF-001-1: Create Root-Level Department**
- At step 5, user leaves "Parent Department" blank
- System creates top-level department (hierarchy level 1)
- System validates maximum number of root departments
- Continue with step 6

**AF-001-2: Create Department with Multiple Cost Centers**
- At step 6, user clicks "Add Secondary Cost Center"
- System displays cost center selection dialog
- User adds:
  - Secondary Cost Center: CC-KITCHEN-002 (Banquet Kitchen)
  - Allocation: 30% of department budget
- System validates total allocation (primary + secondary ≤ 100%)
- Continue with step 7

**AF-001-3: Copy from Existing Department**
- At step 4, user clicks "Copy from Existing"
- System displays department selection
- User selects: HOUSEKEEPING department
- System pre-fills form with HOUSEKEEPING configuration
- User modifies copied data as needed
- Continue with step 12

**Exception Flows**:

**EF-001-1: Duplicate Department Code**
- At step 10, system detects existing department with code "KITCHEN"
- System displays error: "Department code KITCHEN already exists (Active since 2024-01-01)"
- System suggests alternatives: KITCHEN2, KITCHEN-MAIN, KIT-OPS
- User updates department code
- Retry validation

**EF-001-2: Hierarchy Depth Exceeded**
- At step 13, system detects department would be level 6 (exceeds max 5)
- Current path: Corporate → Property → Division → F&B → Restaurant → Kitchen
- System displays error: "Maximum hierarchy depth (5 levels) would be exceeded"
- System displays current hierarchy with levels
- System suggests restructuring hierarchy
- User selects different parent or restructures organization
- Use case ends

**EF-001-3: Department Head Not Found**
- At step 8, selected user "John Smith" is not in system
- System displays error: "User John Smith not found. Please create user in User Management first."
- System offers to:
  - Create user immediately
  - Assign department head later
  - Select different user
- User chooses to assign later
- System creates department without head
- Continue with step 12

**EF-001-4: Cost Center Already Assigned**
- At step 6, selected cost center CC-KITCHEN-001 is assigned to another department
- System displays warning: "Cost center CC-KITCHEN-001 is already assigned to BANQUET department"
- System displays options:
  - Create new cost center
  - Share cost center (multi-department)
  - Override assignment
- User selects "Create new cost center"
- System generates CC-KITCHEN-003
- Continue with step 7

**Postconditions**:
- **Success**: Department created and active
- **Success**: Department appears in hierarchy
- **Success**: Cost center assigned
- **Success**: Department head and secondary manager assigned
- **Success**: Budget allocation created for fiscal year
- **Success**: Approval workflow initialized
- **Success**: Audit trail entry created
- **Failure**: Department not created, system state unchanged

**Business Rules**:
- BR-DEPT-001: Department codes must be unique
- BR-DEPT-002: Department codes must be uppercase alphanumeric
- BR-DEPT-003: Hierarchy cannot exceed 5 levels
- BR-DEPT-004: Active departments must have at least one cost center

**Related Requirements**:
- FR-DEPT-001: Department Master Data Management
- FR-DEPT-002: Department Hierarchy Management
- FR-DEPT-004: Department Head Assignment

---

### UC-DEPT-002: Configure Department Hierarchy

**Actor**: Finance Manager

**Goal**: Organize departments into hierarchical structure for reporting and consolidated financial analysis.

**Priority**: High

**Complexity**: Complex

**Frequency**: Quarterly or during organizational restructuring

**Preconditions**:
- User is logged in as Finance Manager
- Multiple departments exist in system
- User has permission to modify department structure
- No open accounting periods being closed

**Main Flow**:
1. User navigates to Finance → Department Management → Hierarchy Management
2. System displays current organizational hierarchy as tree view:
   ```
   📊 Carmen Resort & Spa
   ├── 🏢 Corporate Services (CORP)
   │   ├── 💼 Finance (FIN)
   │   ├── 👥 Human Resources (HR)
   │   └── 📈 Marketing (MKT)
   ├── 🍽️ Food & Beverage Division (FB-DIV)
   │   ├── 👨‍🍳 Kitchen Operations (KITCHEN)
   │   │   ├── 🥘 Main Kitchen (MAIN-KITCHEN)
   │   │   └── 🍰 Pastry (PASTRY)
   │   ├── 🍷 Restaurant Operations (RESTAURANT)
   │   └── 🎪 Banquet Services (BANQUET)
   ├── 🛏️ Rooms Division (ROOMS-DIV)
   │   ├── 🏨 Front Office (FRONT-OFFICE)
   │   └── 🧹 Housekeeping (HOUSEKEEPING)
   └── 🎭 Recreation & Spa (REC-SPA)
       ├── 💆 Spa Operations (SPA)
       └── 🏊 Pool & Recreation (POOL)
   ```
3. User clicks "Edit Hierarchy" button
4. System enables drag-and-drop hierarchy editing mode
5. User performs restructuring operation:
   - **Action**: Move "Pastry" department from under "Kitchen" to under "Banquet Services"
   - **Reason**: Pastry now supports both banquets and restaurant
6. User drags "Pastry (PASTRY)" node
7. User drops onto "Banquet Services (BANQUET)" node
8. System validates move operation:
   - Destination is not a descendant of source (no circular reference)
   - Hierarchy depth after move ≤ 5 levels
   - User has permission to modify both departments
   - No active transactions in progress for department
9. System displays confirmation dialog:
   ```
   Move Department: Pastry (PASTRY)

   Current Parent: Kitchen Operations (KITCHEN)
     Hierarchy: FB-DIV → KITCHEN → PASTRY (Level 3)

   New Parent: Banquet Services (BANQUET)
     Hierarchy: FB-DIV → BANQUET → PASTRY (Level 3)

   Impact Analysis:
     - 15 open transactions will update hierarchy
     - 3 users assigned will retain access
     - Budget allocation unchanged
     - Reporting structure updated

   Are you sure you want to proceed?
   ```
10. User confirms move
11. System performs hierarchy update:
    - Updates parent_department_id for PASTRY
    - Updates hierarchy path
    - Updates all descendant departments (if any)
    - Recalculates hierarchy levels
    - Updates open transactions with new hierarchy
12. System validates new hierarchy structure:
    - No circular references
    - All departments reachable from root
    - Hierarchy depth constraints met
    - Budget allocations still valid
13. System regenerates organization chart
14. System logs hierarchy change in audit trail:
    - Changed by: Finance Manager
    - Department moved: PASTRY
    - Old parent: KITCHEN
    - New parent: BANQUET
    - Timestamp: 2025-11-13 14:30:00
    - Reason: Restructuring for banquet support
15. System publishes "HierarchyChanged" event
16. System displays updated hierarchy:
    ```
    🍽️ Food & Beverage Division (FB-DIV)
    ├── 👨‍🍳 Kitchen Operations (KITCHEN)
    │   └── 🥘 Main Kitchen (MAIN-KITCHEN)
    ├── 🍷 Restaurant Operations (RESTAURANT)
    └── 🎪 Banquet Services (BANQUET)
        └── 🍰 Pastry (PASTRY)  ← Moved
    ```
17. System displays success message: "Department hierarchy updated successfully"
18. System highlights changed departments in hierarchy view

**Alternative Flows**:

**AF-002-1: Move Multiple Departments Simultaneously**
- At step 5, user selects multiple departments (Ctrl+Click)
- User drags all selected departments
- User drops onto new parent
- System validates each department move
- System performs batch hierarchy update
- Continue with step 14

**AF-002-2: Create New Parent Department**
- At step 5, user clicks "Create Intermediate Department"
- User creates new "Fine Dining" department
- System inserts new department in hierarchy
- User moves RESTAURANT and BANQUET under Fine Dining
- System updates hierarchy accordingly
- Continue with step 14

**AF-002-3: Preview Hierarchy Changes**
- At step 9, user clicks "Preview Impact"
- System displays detailed impact analysis:
  - Financial reports affected
  - Budget consolidation changes
  - User access changes
  - Transaction dimension updates
- User reviews preview
- User proceeds or cancels
- If cancel, return to step 5

**Exception Flows**:

**EF-002-1: Circular Reference Detected**
- At step 8, user attempts to move FB-DIV under KITCHEN
- KITCHEN is descendant of FB-DIV
- Move would create circular reference: FB-DIV → KITCHEN → ... → FB-DIV
- System displays error: "Cannot move department. This would create a circular reference in the hierarchy."
- System highlights invalid path in red
- System prevents move operation
- Use case returns to step 5

**EF-002-2: Hierarchy Depth Exceeded**
- At step 8, move would result in 6-level hierarchy
- Current: Corp → Property → Division → Dept → Sub-Dept
- After move: Corp → Property → Division → Dept → Sub-Dept → Unit (LEVEL 6)
- System displays error: "Maximum hierarchy depth (5 levels) would be exceeded"
- System shows resulting hierarchy with levels
- System suggests:
  - Flatten hierarchy elsewhere
  - Skip intermediate levels
- User cancels or restructures differently
- Use case returns to step 5

**EF-002-3: Active Transactions Block Move**
- At step 8, system detects 25 unposted transactions for PASTRY department
- System displays warning: "25 unposted transactions exist for PASTRY department"
- System displays transaction list with amounts and dates
- System offers options:
  - Post all transactions (auto-post)
  - Move anyway (update transaction dimensions)
  - Wait until transactions posted
- User selects "Move anyway"
- System updates transaction dimensions to new hierarchy
- Continue with step 11

**EF-002-4: Budget Allocation Conflict**
- At step 11, move affects budget consolidation
- PASTRY has $50,000 allocated from KITCHEN budget
- Move to BANQUET would require budget reallocation
- System displays warning: "Budget reallocation required"
- System calculates:
  - Remove $50,000 from KITCHEN budget
  - Add $50,000 to BANQUET budget
- System requires CFO approval for budget change
- CFO reviews and approves
- System updates budget allocations
- Continue with step 12

**Postconditions**:
- **Success**: Department hierarchy updated
- **Success**: All affected transactions updated
- **Success**: Organization chart reflects new structure
- **Success**: Budget consolidation recalculated
- **Success**: Reporting hierarchy updated
- **Success**: Audit trail records change
- **Failure**: Hierarchy unchanged, rollback to previous state

**Business Rules**:
- BR-DEPT-005: Hierarchy cannot contain circular references
- BR-DEPT-006: Maximum hierarchy depth is 5 levels
- BR-DEPT-007: Moving department updates all descendant departments
- BR-DEPT-008: Hierarchy changes require audit trail

**Related Requirements**:
- FR-DEPT-002: Department Hierarchy Management
- FR-DEPT-006: Department-Based Transaction Posting

---

### UC-DEPT-008: Post Transaction to Department

**Actor**: Accountant

**Goal**: Post a financial transaction with department dimension for cost tracking and reporting.

**Priority**: Critical

**Complexity**: Medium

**Frequency**: Daily (multiple times)

**Preconditions**:
- User is logged in as Accountant
- Department exists and is active
- GL accounts configured
- User has permission to post transactions
- Transaction within user's department access

**Main Flow**:
1. User navigates to Finance → General Ledger → Journal Entry
2. System displays journal entry form
3. User enters journal entry header:
   - Entry Date: 2025-11-13
   - Description: Kitchen food supplies purchase
   - Document Type: Invoice
   - Document Number: INV-FOOD-2501-1234
4. User adds debit line:
   - GL Account: 5100 - Cost of Goods Sold
   - Department: KITCHEN - Kitchen Operations
   - Amount: $1,500.00
   - Description: Fresh produce and ingredients
5. System validates department selection:
   - Department is active
   - Department effective from ≤ transaction date
   - User has access to KITCHEN department
   - GL account 5100 allows department dimension
6. System retrieves department cost center: CC-KITCHEN-001
7. System auto-populates additional dimensions:
   - Cost Center: CC-KITCHEN-001 (from department)
   - Location: Main Property (from department)
8. System displays department budget check:
   ```
   Department: KITCHEN - Kitchen Operations
   Budget Period: November 2025

   Monthly Budget: $41,666.67
   Actual to Date: $38,200.00
   This Transaction: $1,500.00
   New Total: $39,700.00
   Remaining: $1,966.67 (4.7%)

   Status: ✅ Within Budget
   ```
9. User adds credit line:
   - GL Account: 2100 - Accounts Payable
   - Department: (none - AP is corporate level)
   - Amount: $1,500.00
   - Vendor: Fresh Foods Suppliers
10. System validates journal entry:
    - Debits = Credits ($1,500.00 = $1,500.00) ✓
    - All required fields populated ✓
    - Department dimensions valid ✓
    - GL accounts active ✓
11. System displays journal entry preview:
    ```
    Journal Entry: JE-2025-11-13-00123
    Date: 2025-11-13
    Description: Kitchen food supplies purchase

    Account                      Dept       Debit      Credit
    ─────────────────────────────────────────────────────────
    5100 - Cost of Goods Sold   KITCHEN   $1,500.00
      Cost Center: CC-KITCHEN-001
      Location: Main Property

    2100 - Accounts Payable     (None)               $1,500.00
      Vendor: Fresh Foods Suppliers
    ─────────────────────────────────────────────────────────
    Total                                 $1,500.00  $1,500.00

    Department Impact:
      KITCHEN: Expense +$1,500.00

    Budget Status: Within budget (4.7% remaining)
    ```
12. User reviews entry
13. User clicks "Post Journal Entry"
14. System checks approval requirements:
    - Transaction amount: $1,500.00
    - Department head approval limit: $5,000.00
    - $1,500 < $5,000 → No approval required
15. System posts journal entry:
    - Creates GL transaction records
    - Records department dimension on expense line
    - Updates GL account balances
    - Updates department expense totals
    - Updates cost center balances
16. System updates department budget tracking:
    - November 2025 actual: $38,200 → $39,700
    - Remaining budget: $1,966.67
17. System generates document number: JE-2025-11-13-00123
18. System logs transaction in audit trail with department details
19. System publishes "TransactionPosted" event with department dimension
20. System displays success message: "Journal entry JE-2025-11-13-00123 posted successfully. Department KITCHEN charged $1,500.00"
21. System updates department dashboard with new expense

**Alternative Flows**:

**AF-008-1: Multi-Department Allocation**
- At step 4, user clicks "Split by Department"
- System displays department allocation interface
- User allocates $1,500 across departments:
  - KITCHEN: 60% = $900.00
  - RESTAURANT: 40% = $600.00
- System creates separate GL lines for each department:
  - Line 1: 5100 / KITCHEN / $900.00
  - Line 2: 5100 / RESTAURANT / $600.00
- Continue with step 9

**AF-008-2: Transaction Exceeds Budget**
- At step 8, system calculates budget status:
  - Monthly Budget: $41,666.67
  - Actual to Date: $41,000.00
  - This Transaction: $1,500.00
  - Would Exceed By: $833.33
- System displays warning: "⚠️ Transaction exceeds monthly budget by $833.33"
- System requires:
  - Department head approval
  - Reason for budget overrun
- User enters reason: "Unexpected event catering"
- System routes to Department Head for approval
- Department Head approves with justification
- Continue with step 9

**AF-008-3: Recurring Transaction Setup**
- At step 3, user selects "Create Recurring Entry"
- User configures recurrence:
  - Frequency: Monthly
  - Start Date: 2025-11-13
  - End Date: 2026-11-13 (12 months)
  - Amount: $1,500.00 per month
  - Department: KITCHEN (constant)
- System creates recurring entry template
- System schedules automatic posting for each period
- System validates budget capacity for all periods
- Continue with step 12

**Exception Flows**:

**EF-008-1: Department Inactive**
- At step 5, system detects KITCHEN department is inactive
- System displays error: "Department KITCHEN is inactive (Effective To: 2025-10-31)"
- System suggests:
  - Select different active department
  - Reactivate KITCHEN department
- User cannot proceed with inactive department
- Use case ends

**EF-008-2: User Lacks Department Access**
- At step 5, user attempts to charge to EXECUTIVE department
- User is assigned only to KITCHEN and RESTAURANT departments
- System displays error: "You do not have access to post transactions for EXECUTIVE department"
- System displays user's authorized departments:
  - KITCHEN - Kitchen Operations
  - RESTAURANT - Restaurant Operations
- User selects authorized department or requests access
- Use case ends

**EF-008-3: GL Account Doesn't Allow Department Dimension**
- At step 4, user selects GL Account: 1010 - Cash
- Cash account is balance sheet, not departmentalized
- System displays warning: "GL Account 1010 - Cash does not support department dimensions"
- System clears department field for this line
- Continue with step 9

**EF-008-4: Approval Required But Not Obtained**
- At step 14, transaction requires approval:
  - Amount: $8,000.00
  - Department head limit: $5,000.00
  - Requires CFO approval
- System sends approval request to CFO
- User receives notification: "Entry pending CFO approval"
- Journal entry saved as Draft
- CFO reviews and approves
- System posts entry automatically after approval
- Use case ends (async completion)

**EF-008-5: Budget Completely Exhausted**
- At step 8, department has zero remaining budget:
  - Monthly Budget: $41,666.67
  - Actual to Date: $41,666.67
  - Remaining: $0.00
- System displays error: "Department KITCHEN monthly budget fully exhausted"
- System requires:
  - CFO override approval
  - Budget revision
  - Charge to different period
- System blocks posting until resolved
- Use case ends

**Postconditions**:
- **Success**: Transaction posted to GL with department dimension
- **Success**: Department expense balance updated
- **Success**: Budget vs actual tracking updated
- **Success**: Cost center balance updated
- **Success**: Audit trail includes department details
- **Success**: Department dashboard reflects new transaction
- **Failure**: Transaction not posted, system state unchanged

**Business Rules**:
- BR-DEPT-009: All expense transactions must have department dimension
- BR-DEPT-010: Revenue transactions optionally have department
- BR-DEPT-011: Balance sheet accounts do not have department dimension
- BR-DEPT-012: Transaction date must be within department active period

**Related Requirements**:
- FR-DEPT-006: Department-Based Transaction Posting
- FR-DEPT-005: Department Budget Management

---

### UC-DEPT-011: Allocate Transaction Across Departments

**Actor**: CFO / Accountant

**Goal**: Allocate shared costs or revenue across multiple departments based on allocation rules.

**Priority**: High

**Complexity**: Complex

**Frequency**: Monthly for recurring allocations, ad-hoc for special allocations

**Preconditions**:
- User is logged in as CFO or Accountant
- Multiple departments exist
- Allocation base data available (headcount, square footage, revenue, etc.)
- User has permission to create allocations
- GL accounts configured for allocation

**Main Flow**:
1. User navigates to Finance → Department Management → Cross-Department Allocations
2. System displays allocation dashboard
3. User clicks "Create Allocation" button
4. System displays allocation configuration form
5. User enters allocation header:
   - Allocation Name: Utilities Cost Allocation
   - Allocation Type: Shared Cost
   - Allocation Period: November 2025
   - Total Amount to Allocate: $10,000.00
   - Source GL Account: 6300 - Utilities Expense
6. User selects allocation method:
   - Method: Square Footage
   - Allocation Base Source: Department Master Data
7. System retrieves allocation base data:
   ```
   Department Square Footage:
   - KITCHEN: 2,500 sq ft
   - RESTAURANT: 3,500 sq ft
   - BANQUET: 2,000 sq ft
   - HOUSEKEEPING: 1,500 sq ft
   - FRONT-OFFICE: 1,000 sq ft
   - SPA: 2,500 sq ft
   ─────────────────────────
   Total: 13,000 sq ft
   ```
8. System calculates allocation percentages:
   - KITCHEN: 2,500 / 13,000 = 19.23%
   - RESTAURANT: 3,500 / 13,000 = 26.92%
   - BANQUET: 2,000 / 13,000 = 15.38%
   - HOUSEKEEPING: 1,500 / 13,000 = 11.54%
   - FRONT-OFFICE: 1,000 / 13,000 = 7.69%
   - SPA: 2,500 / 13,000 = 19.23%
   - Total: 100.00%
9. System calculates allocation amounts:
   ```
   Department Allocation Summary:

   Department         Sq Ft    %      Amount
   ──────────────────────────────────────────
   KITCHEN           2,500   19.23%  $1,923.00
   RESTAURANT        3,500   26.92%  $2,692.00
   BANQUET           2,000   15.38%  $1,538.00
   HOUSEKEEPING      1,500   11.54%  $1,154.00
   FRONT-OFFICE      1,000    7.69%    $769.00
   SPA               2,500   19.23%  $1,923.00
   ──────────────────────────────────────────
   Total            13,000  100.00% $10,000.00 ✓

   Variance due to rounding: $1.00
   ```
10. User reviews allocation calculation
11. User can override allocation for specific departments:
    - User adjusts SPA: $1,923.00 → $2,000.00
    - System recalculates other departments to balance
12. User clicks "Preview Journal Entry"
13. System generates allocation journal entry:
    ```
    Journal Entry: Utilities Cost Allocation - November 2025
    Date: 2025-11-30
    Type: Allocation Entry

    Credit: 6300 - Utilities (Corporate)        $10,000.00
      Description: Utilities cost pool

    Debit:  6300 - Utilities (KITCHEN)           $1,923.00
      Allocation: 19.23% of total (2,500 sq ft)

    Debit:  6300 - Utilities (RESTAURANT)        $2,692.00
      Allocation: 26.92% of total (3,500 sq ft)

    Debit:  6300 - Utilities (BANQUET)           $1,538.00
      Allocation: 15.38% of total (2,000 sq ft)

    Debit:  6300 - Utilities (HOUSEKEEPING)      $1,154.00
      Allocation: 11.54% of total (1,500 sq ft)

    Debit:  6300 - Utilities (FRONT-OFFICE)        $769.00
      Allocation: 7.69% of total (1,000 sq ft)

    Debit:  6300 - Utilities (SPA)               $1,923.00
      Allocation: 19.23% of total (2,500 sq ft)
    ────────────────────────────────────────────────────────
    Total Debit: $10,000.00  Total Credit: $10,000.00 ✓

    Department Budget Impact:
      Each department's November utilities expense increases
    ```
14. User reviews journal entry
15. User clicks "Post Allocation"
16. System validates allocation:
    - Total debits = total credits ✓
    - All departments active ✓
    - All amounts positive ✓
    - Allocation percentages sum to 100% ✓
17. System posts journal entry to GL
18. System updates department expense balances
19. System updates budget vs actual for each department
20. System creates allocation audit trail:
    - Allocation method: Square Footage
    - Allocation base data snapshot
    - Calculated percentages
    - Department amounts
21. System saves allocation template for future use
22. System displays success message: "Utilities allocation posted successfully. 6 departments charged totaling $10,000.00"
23. System updates department income statements with allocated costs

**Alternative Flows**:

**AF-011-1: Revenue Allocation by Percentage**
- At step 5-6, user allocates revenue instead of cost:
  - Allocation Name: Corporate Revenue Share
  - Allocation Type: Revenue
  - Total Amount: $50,000.00
  - Method: Fixed Percentage
- User manually enters percentages:
  - RESTAURANT: 40% = $20,000
  - BANQUET: 35% = $17,500
  - SPA: 25% = $12,500
- System validates percentages sum to 100%
- System creates revenue allocation entry
- Continue with step 13

**AF-011-2: Allocation by Headcount**
- At step 6, user selects method: Headcount
- System retrieves employee counts per department:
  - KITCHEN: 15 employees
  - RESTAURANT: 10 employees
  - HOUSEKEEPING: 20 employees
  - Total: 45 employees
- System calculates allocation:
  - KITCHEN: 15/45 = 33.33% = $3,333.33
  - RESTAURANT: 10/45 = 22.22% = $2,222.22
  - HOUSEKEEPING: 20/45 = 44.44% = $4,444.44
- Continue with step 9

**AF-011-3: Recurring Monthly Allocation**
- At step 5, user selects "Create Recurring Allocation"
- User configures recurrence:
  - Frequency: Monthly
  - Start: November 2025
  - End: October 2026 (12 months)
  - Amount: $10,000 per month (or formula-based)
- System creates recurring allocation template
- System schedules automatic allocation posting monthly
- Each month system:
  - Retrieves current allocation base data
  - Recalculates percentages (if base changed)
  - Posts allocation journal entry
- Continue with step 13

**AF-011-4: Tiered Allocation (Cascade)**
- At step 6, user selects "Tiered Allocation"
- User configures allocation tiers:
  - Tier 1: Allocate IT costs to divisions by headcount
  - Tier 2: Allocate division costs to departments by revenue
- System performs tier 1 allocation:
  - IT $20,000 → FB-DIV $12,000, ROOMS-DIV $8,000
- System performs tier 2 allocation:
  - FB-DIV $12,000 → KITCHEN $4,000, RESTAURANT $5,000, BANQUET $3,000
  - ROOMS-DIV $8,000 → FRONT-OFFICE $3,000, HOUSEKEEPING $5,000
- System posts cascaded allocation entries
- Continue with step 17

**Exception Flows**:

**EF-011-1: Allocation Base Data Missing**
- At step 7, system cannot retrieve square footage data
- BANQUET department missing square footage attribute
- System displays warning: "Square footage not configured for BANQUET department"
- System offers options:
  - Enter square footage now
  - Exclude BANQUET from allocation
  - Use different allocation method
- User enters square footage: 2,000 sq ft
- System saves to department master
- Retry allocation calculation

**EF-011-2: Allocation Amounts Exceed Budget**
- At step 18, allocation causes department budget overrun:
  - KITCHEN monthly budget: $41,666.67
  - KITCHEN actual before allocation: $40,500.00
  - Allocation amount: $1,923.00
  - New total: $42,423.00 (exceeds by $756.33)
- System displays warning for affected departments
- System requires approval from department heads
- Department heads review and approve overruns
- System posts allocation with approval
- Continue with step 19

**EF-011-3: Rounding Difference Too Large**
- At step 9, rounding creates $5.00 variance
- Total allocation: $10,000.00
- Sum of rounded amounts: $9,995.00
- Variance: $5.00 (exceeds $1 tolerance)
- System displays error: "Rounding variance ($5.00) exceeds tolerance ($1.00)"
- System offers options:
  - Adjust largest department (absorb variance)
  - Manual adjustment
  - Use higher precision
- User selects "Adjust largest department"
- System adds $5.00 to RESTAURANT (largest)
- Continue with step 12

**EF-011-4: Department Inactive During Allocation Period**
- At step 16, system detects PASTRY department inactive
- PASTRY effective to: 2025-11-15
- Allocation period: November 2025
- System displays warning: "PASTRY was inactive for part of allocation period"
- System offers options:
  - Exclude PASTRY entirely
  - Pro-rate based on active days (15/30 = 50%)
  - Override and include anyway
- User selects "Pro-rate based on active days"
- System adjusts PASTRY allocation: $1,500 × 50% = $750
- System redistributes remaining $750 to other departments
- Continue with step 17

**Postconditions**:
- **Success**: Allocation posted to all departments
- **Success**: Journal entry created with allocation details
- **Success**: Department budgets updated
- **Success**: Allocation template saved for future use
- **Success**: Audit trail includes allocation methodology
- **Success**: Department income statements reflect allocated costs
- **Failure**: Allocation not posted, department balances unchanged

**Business Rules**:
- BR-DEPT-013: Allocation percentages must sum to 100%
- BR-DEPT-014: Allocation amounts must be positive
- BR-DEPT-015: Allocation base data must be current and accurate
- BR-DEPT-016: All allocated departments must be active

**Related Requirements**:
- FR-DEPT-008: Cross-Department Allocations
- FR-DEPT-006: Department-Based Transaction Posting

---

### UC-DEPT-015: Generate Budget vs Actual Report

**Actor**: Department Head

**Goal**: Compare department actual expenses and revenue against budget to monitor performance.

**Priority**: Critical

**Complexity**: Medium

**Frequency**: Weekly to monthly

**Preconditions**:
- User is logged in as Department Head
- User assigned to department
- Department budget configured for period
- Transactions posted for period
- User has permission to view department reports

**Main Flow**:
1. User navigates to Finance → Department Management → Reports
2. System displays report catalog
3. User selects "Budget vs Actual Report"
4. System displays report parameter form
5. User configures report parameters:
   - Department: KITCHEN - Kitchen Operations
   - Period Type: Monthly
   - Start Period: November 2025
   - End Period: November 2025
   - Comparison: Budget vs Actual
   - View: Summary
6. User clicks "Generate Report"
7. System retrieves department budget data:
   - Annual Budget: $500,000
   - November Monthly Budget: $41,666.67
8. System retrieves actual expenses for November 2025:
   - Aggregates all transactions where department = KITCHEN
   - Filters by GL account type = Expense
   - Sums by expense category
9. System calculates variances:
   - Variance Amount = Actual - Budget
   - Variance % = (Variance Amount / Budget) × 100
   - Favorable variance: Actual < Budget (negative variance)
   - Unfavorable variance: Actual > Budget (positive variance)
10. System generates report:
    ```
    ═══════════════════════════════════════════════════════════
                    BUDGET VS ACTUAL REPORT
    ═══════════════════════════════════════════════════════════
    Department: KITCHEN - Kitchen Operations
    Department Head: John Smith (Executive Chef)
    Period: November 2025
    Report Date: 2025-11-13

    ───────────────────────────────────────────────────────────
    EXPENSE SUMMARY
    ───────────────────────────────────────────────────────────
    Category              Budget      Actual    Variance    %
    ───────────────────────────────────────────────────────────
    Food & Beverage    $30,000.00  $28,450.00  ($1,550.00)  -5.2% ✅
    Labor Costs        $ 8,333.33  $ 8,450.00     $116.67   1.4%
    Supplies           $ 2,000.00  $ 2,150.00     $150.00   7.5%
    Utilities          $ 1,666.67  $ 1,923.00     $256.33  15.4% ⚠️
    Equipment Maint    $   500.00  $   350.00    ($150.00) -30.0% ✅
    Other Expenses     $   166.67  $   200.00      $33.33  20.0%
    ───────────────────────────────────────────────────────────
    Total Expenses     $41,666.67  $41,523.00    ($143.67)  -0.3% ✅
    ───────────────────────────────────────────────────────────

    Budget Status: WITHIN BUDGET
    Remaining Budget: $143.67 (0.3%)

    ───────────────────────────────────────────────────────────
    VARIANCE ANALYSIS
    ───────────────────────────────────────────────────────────
    ✅ Favorable Variances:
      • Food & Beverage: $1,550 under budget (-5.2%)
        Reason: Lower produce prices, efficient inventory mgmt
      • Equipment Maintenance: $150 under budget (-30.0%)
        Reason: Deferred non-urgent repairs

    ⚠️ Unfavorable Variances:
      • Utilities: $256 over budget (+15.4%)
        Reason: Extended kitchen hours for event catering
        Action Required: Review energy consumption patterns

    ───────────────────────────────────────────────────────────
    YEAR-TO-DATE PERFORMANCE (Jan - Nov 2025)
    ───────────────────────────────────────────────────────────
    YTD Budget:        $458,333.33
    YTD Actual:        $455,200.00
    YTD Variance:       ($3,133.33)  -0.7% ✅

    Trend: Consistently under budget for 8 of 11 months

    ═══════════════════════════════════════════════════════════
    ```
11. System displays report in browser
12. User reviews budget performance
13. User identifies variances requiring attention
14. User clicks "Export to PDF"
15. System generates PDF version with charts:
    - Budget vs Actual bar chart by category
    - Variance trend line chart (monthly)
    - Budget utilization pie chart
16. System saves PDF to document management
17. User clicks "Add Comments"
18. User enters variance explanations:
    - Category: Utilities
    - Comment: "Overrun due to extended hours for wedding event catering. Revenue from event exceeds cost variance."
    - Action: "Will monitor next month, no corrective action needed"
19. System saves comments to report
20. System displays success message: "Report generated and saved successfully"

**Alternative Flows**:

**AF-015-1: Multi-Month Trend Analysis**
- At step 5, user selects wider date range:
  - Start Period: January 2025
  - End Period: November 2025
  - View: Trend Analysis
- System generates trend report showing:
  - Monthly budget vs actual for all 11 months
  - Cumulative variance over time
  - Trend analysis with regression
  - Forecast for remaining period
- System includes visualizations:
  - Line chart: Budget vs Actual by month
  - Area chart: Cumulative variance
- Continue with step 11

**AF-015-2: Drill-Down to Transaction Detail**
- At step 12, user clicks on "Utilities: $1,923.00"
- System displays transaction detail report:
  ```
  Utilities Transactions - November 2025

  Date        Document         Description            Amount
  ─────────────────────────────────────────────────────────
  11/05/2025  INV-UTIL-001    Electricity           $  850.00
  11/12/2025  INV-UTIL-002    Gas                   $  523.00
  11/20/2025  INV-UTIL-003    Water/Sewer           $  350.00
  11/25/2025  JE-ALLOC-001    Allocated Utilities   $  200.00
  ─────────────────────────────────────────────────────────
  Total Utilities                                   $1,923.00
  ```
- User analyzes individual transactions
- User returns to summary report
- Continue with step 13

**AF-015-3: Compare Multiple Departments**
- At step 5, user selects "All Departments" instead of single
- System generates consolidated report for all departments:
  ```
  ALL DEPARTMENTS - Budget vs Actual Summary
  November 2025

  Department       Budget        Actual      Variance     %
  ──────────────────────────────────────────────────────────
  KITCHEN       $ 41,666.67  $ 41,523.00   ($143.67)  -0.3% ✅
  RESTAURANT    $ 35,000.00  $ 36,200.00  $1,200.00   3.4%
  BANQUET       $ 25,000.00  $ 23,800.00 ($1,200.00)  -4.8% ✅
  HOUSEKEEPING  $ 30,000.00  $ 29,500.00   ($500.00)  -1.7% ✅
  FRONT-OFFICE  $ 22,000.00  $ 22,100.00    $100.00   0.5%
  SPA           $ 18,000.00  $ 17,900.00   ($100.00)  -0.6% ✅
  ──────────────────────────────────────────────────────────
  TOTAL        $171,666.67 $171,023.00   ($643.67)  -0.4% ✅
  ```
- User compares department performance
- Continue with step 11

**Exception Flows**:

**EF-015-1: No Budget Configured**
- At step 7, system detects no budget for KITCHEN in November 2025
- System displays warning: "No budget configured for KITCHEN - November 2025"
- System offers options:
  - Create budget now
  - Compare to previous period actual
  - Compare to average of other months
- User selects "Compare to previous period actual"
- System uses October 2025 actual as baseline
- System generates comparison report
- Continue with step 11

**EF-015-2: No Transactions for Period**
- At step 8, no transactions found for November 2025
- System displays message: "No actual expenses recorded for KITCHEN in November 2025"
- Report shows:
  - Budget: $41,666.67
  - Actual: $0.00
  - Variance: ($41,666.67) -100% (highly favorable but unusual)
- System highlights: "⚠️ Zero expenses may indicate missing transactions"
- User investigates and posts missing transactions
- User regenerates report
- Continue with step 11

**EF-015-3: User Lacks Department Access**
- At step 5, user selects EXECUTIVE department
- User is Department Head for KITCHEN only
- System displays error: "You do not have access to EXECUTIVE department reports"
- System restricts department selection to user's assigned departments
- User selects KITCHEN
- Continue with step 6

**Postconditions**:
- **Success**: Budget vs Actual report generated
- **Success**: Variances calculated and highlighted
- **Success**: Report saved to document management
- **Success**: User comments recorded
- **Success**: Variance analysis provided
- **Failure**: Report not generated, user notified of issue

**Business Rules**:
- BR-DEPT-017: Users can only view reports for departments they are assigned to
- BR-DEPT-018: Favorable variance is actual < budget (negative variance)
- BR-DEPT-019: Unfavorable variance is actual > budget (positive variance)
- BR-DEPT-020: Variance tolerance threshold is 5% for warnings

**Related Requirements**:
- FR-DEPT-007: Department-Based Reporting
- FR-DEPT-005: Department Budget Management

---

## System Use Cases

### UC-DEPT-101: Post Transaction with Department Dimension

**Description**: Automated system process to record department dimension on all applicable GL transactions.

**Actor**: GL Posting Engine (Automated)

**Trigger**: Journal entry posted

**Priority**: Critical

**Frequency**: Real-time (per transaction)

**Preconditions**:
- Transaction posted to GL
- GL account configured for department dimension
- Department exists and active
- Posting engine service running

**Main Flow**:
1. GL Posting Engine receives "TransactionPosted" event
2. System retrieves transaction details:
   - Transaction ID: TX-2025-11-13-00456
   - GL Account: 5100 - Cost of Goods Sold
   - Amount: $1,500.00
   - Department: KITCHEN
3. System validates department dimension:
   - GL Account 5100 allows department (Expense account = Yes)
   - Department KITCHEN is active
   - Department effective date ≤ transaction date
4. System retrieves department metadata:
   - Cost Center: CC-KITCHEN-001
   - Location: Main Property
   - Division: Food & Beverage
5. System creates dimension record:
   ```json
   {
     "transactionId": "TX-2025-11-13-00456",
     "dimensionType": "department",
     "departmentId": "DEPT-KITCHEN",
     "departmentCode": "KITCHEN",
     "departmentName": "Kitchen Operations",
     "costCenter": "CC-KITCHEN-001",
     "location": "Main Property",
     "division": "Food & Beverage",
     "hierarchyPath": "FB-DIV/KITCHEN"
   }
   ```
6. System stores dimension record linked to GL transaction
7. System updates department balance:
   - Previous balance: $38,200.00
   - Transaction: +$1,500.00
   - New balance: $39,700.00
8. System updates cost center balance
9. System updates division consolidated balance
10. System publishes "DepartmentBalanceUpdated" event
11. System logs dimension posting in audit trail
12. Process completes successfully

**Data Contract**:

**Input**:
```json
{
  "transactionId": "TX-2025-11-13-00456",
  "glAccount": "5100",
  "department": "KITCHEN",
  "amount": 1500.00,
  "transactionDate": "2025-11-13"
}
```

**Output**:
```json
{
  "success": true,
  "dimensionRecordId": "DIM-00789",
  "departmentBalance": 39700.00,
  "costCenterBalance": 39700.00,
  "divisionBalance": 125000.00
}
```

**Business Rules**:
- BR-DEPT-009: Expense accounts require department dimension
- BR-DEPT-010: Revenue accounts optionally have department
- BR-DEPT-011: Balance sheet accounts no department dimension

**SLA**:
- **Processing Time**: < 100ms per transaction
- **Availability**: 99.9% successful processing
- **Accuracy**: 100% correct dimension recording

---

### UC-DEPT-102: Track Budget vs Actual

**Description**: Automated system process to track department budget consumption and alert on variances.

**Actor**: Budget Engine (Automated)

**Trigger**:
- Transaction posted with department dimension
- Hourly batch update for summary calculations

**Priority**: Critical

**Frequency**: Real-time for transactions + hourly batch

**Preconditions**:
- Department budget configured
- Transaction posted with department
- Budget tracking service running

**Main Flow**:
1. Budget Engine receives "DepartmentBalanceUpdated" event
2. System retrieves current budget status:
   - Department: KITCHEN
   - Period: November 2025
   - Monthly Budget: $41,666.67
   - Previous Actual: $38,200.00
3. System retrieves new transaction:
   - Amount: $1,500.00
   - Category: Food & Beverage
4. System updates actual totals:
   - New Actual: $38,200.00 + $1,500.00 = $39,700.00
5. System calculates budget metrics:
   - Consumed: $39,700.00
   - Remaining: $41,666.67 - $39,700.00 = $1,966.67
   - Utilization: ($39,700 / $41,666.67) × 100 = 95.3%
   - Days Remaining in Period: 17 days
   - Daily Burn Rate: $39,700 / 13 days = $3,053.85/day
   - Projected Month-End: $3,053.85 × 30 = $91,615.38 (will exceed!)
6. System evaluates alert thresholds:
   - 75% threshold: $31,250 (passed on 11/08)
   - 90% threshold: $37,500 (passed on 11/12)
   - 95% threshold: $39,583 (just passed!)
   - 100% threshold: $41,666.67 (approaching)
7. System generates budget alert:
   ```
   ⚠️ BUDGET ALERT

   Department: KITCHEN - Kitchen Operations
   Period: November 2025
   Alert Level: 95% Threshold Exceeded

   Budget Status:
     Monthly Budget: $41,666.67
     Actual to Date: $39,700.00
     Remaining: $1,966.67 (4.7%)
     Utilization: 95.3%

   Projection:
     Days Remaining: 17 days
     Daily Burn Rate: $3,053.85
     Projected Month-End: $91,615.38
     Projected Overrun: $49,948.71 (120% over budget!)

   Action Required:
     - Review spending with Department Head
     - Consider budget revision if justified
     - Implement cost controls for remainder of month

   Sent to: John Smith (Department Head), Finance Manager
   ```
8. System sends alert notifications
9. System updates budget tracking dashboard
10. System logs budget event in audit trail
11. Process completes successfully

**Alternative Flows**:

**Alt-102A: Budget Fully Exhausted**
- At step 5, actual equals or exceeds budget:
  - Budget: $41,666.67
  - Actual: $41,700.00 (exceeded by $33.33)
- System generates critical alert
- System blocks new transactions (optional, configurable)
- System requires override approval for new expenses
- Continue with step 8

**Alt-102B: Favorable Budget Performance**
- At step 5, actual significantly under budget:
  - Budget: $41,666.67
  - Actual: $30,000.00 (72% utilization)
- System generates favorable performance notice
- System projects budget surplus
- System suggests budget reallocation opportunities
- Continue with step 9

**Business Rules**:
- BR-DEPT-012: Budget alerts at 75%, 90%, 95%, 100% thresholds
- BR-DEPT-014: Budget projections based on daily burn rate
- BR-DEPT-015: Budget overruns require department head acknowledgment

**SLA**:
- **Processing Time**: < 200ms per update
- **Alert Latency**: < 5 minutes from threshold breach
- **Accuracy**: 100% correct calculations

---

## Integration Use Cases

### UC-DEPT-202: Post Department Purchase Request

**Description**: Integration with Procurement System to post purchase requests with department charging.

**Actor**: Procurement System (Integration)

**Trigger**: Purchase request approved in Procurement System

**Integration Type**: Internal Module Integration (Event-Driven)

**Direction**: Inbound (Procurement → Finance)

**Priority**: Critical

**Frequency**: Real-time (per transaction)

**Preconditions**:
- Purchase request approved in Procurement
- Department configured in Finance
- Budget available for department
- GL accounts mapped for purchase categories

**Main Flow**:
1. Procurement System publishes "PurchaseRequestApproved" event
2. Department Management Service subscribes to event
3. Service receives event payload:
   ```json
   {
     "eventId": "evt-45678",
     "eventType": "PurchaseRequestApproved",
     "timestamp": "2025-11-13T14:00:00Z",
     "prNumber": "PR-2501-00789",
     "requestorId": "USR-JOHN-SMITH",
     "department": "KITCHEN",
     "description": "Fresh produce for weekend events",
     "requestDate": "2025-11-13",
     "requiredDate": "2025-11-15",
     "totalAmount": 2500.00,
     "currency": "USD",
     "lineItems": [
       {
         "itemDescription": "Organic vegetables",
         "quantity": 100,
         "unitPrice": 15.00,
         "total": 1500.00,
         "category": "Food & Beverage",
         "glAccount": "5100"
       },
       {
         "itemDescription": "Premium fruits",
         "quantity": 50,
         "unitPrice": 20.00,
         "total": 1000.00,
         "category": "Food & Beverage",
         "glAccount": "5100"
       }
     ],
     "approvalHistory": [
       {
         "approver": "John Smith",
         "role": "Department Head",
         "approvalDate": "2025-11-13T13:30:00Z",
         "approvalLimit": 5000.00
       }
     ]
   }
   ```
4. Service validates department and budget:
   - Department KITCHEN exists and active ✓
   - Current month budget status:
     - Budget: $41,666.67
     - Actual: $39,700.00
     - This PR: $2,500.00
     - New Total: $42,200.00
     - Would exceed by: $533.33
5. System detects budget overrun
6. System checks approval requirements:
   - Amount: $2,500.00
   - Approved by: Department Head ($5,000 limit)
   - Budget overrun: $533.33
   - Requires: Finance Manager approval for budget variance
7. System generates budget variance approval request
8. Finance Manager reviews:
   - PR details and justification
   - Budget status and variance
   - YTD performance (under budget overall)
9. Finance Manager approves variance
10. System creates encumbrance (commitment) entry:
    ```
    Encumbrance Entry: PR-2501-00789
    Date: 2025-11-13
    Description: Encumbrance for approved PR

    Debit: 5100 - COGS (Encumbrance)        $2,500.00
      Department: KITCHEN
      Cost Center: CC-KITCHEN-001
      Document: PR-2501-00789

    Credit: 5900 - Commitments               $2,500.00
      Description: Outstanding purchase commitment

    Status: Encumbered (not yet actual expense)
    ```
11. System posts encumbrance to GL
12. System updates department budget tracking:
    - Actual Expenses: $39,700.00
    - Encumbrances: $2,500.00
    - Total Committed: $42,200.00 ($533.33 over budget)
13. System sends confirmation to Procurement System
14. System logs transaction in audit trail
15. Process completes successfully

**Alternative Flows**:

**Alt-202A: Multi-Department Purchase Request**
- At step 3, PR allocates across departments:
  ```json
  "departmentAllocations": [
    {
      "department": "KITCHEN",
      "amount": 1500.00,
      "percentage": 60
    },
    {
      "department": "BANQUET",
      "amount": 1000.00,
      "percentage": 40
    }
  ]
  ```
- System validates budget for each department
- System creates separate encumbrances per department
- System updates budget tracking for both departments
- Continue with step 13

**Exception Flows**:

**Exc-202A: Department Budget Exhausted**
- At step 4, budget status shows:
  - Budget: $41,666.67
  - Actual: $41,500.00
  - This PR: $2,500.00
  - Would exceed by: $2,333.33 (5.6% over budget)
- System blocks automatic approval
- System requires CFO override for significant overrun
- System sends escalation to CFO
- CFO reviews business justification
- If approved:
  - CFO authorizes budget revision or override
  - System posts encumbrance with override flag
  - Continue with step 10
- If rejected:
  - System notifies Procurement to revise or cancel PR
  - Process ends

**Exc-202B: Department Inactive**
- At step 4, KITCHEN department is inactive
- System displays error: "Department KITCHEN is inactive (Effective To: 2025-10-31)"
- System cannot post to inactive department
- System notifies Procurement System of error
- System suggests:
  - Reactivate department
  - Change to different department
  - Cancel purchase request
- Process ends (requires manual intervention)

**Business Rules**:
- BR-DEPT-009: All purchase requests must have department
- BR-DEPT-012: Encumbrances reduce available budget
- BR-DEPT-013: Budget overruns require approval escalation

**SLA**:
- **Processing Time**: < 3 seconds per PR
- **Availability**: 99.9% successful processing
- **Budget Check**: Real-time validation

**Monitoring**:
- PR processing success rate
- Budget check performance
- Approval escalation volume
- Encumbrance posting accuracy

---

## Use Case Traceability Matrix

| Use Case | Functional Req | Business Rule | Test Case | Status |
|----------|----------------|---------------|-----------|--------|
| UC-DEPT-001 | FR-DEPT-001 | BR-DEPT-001, BR-DEPT-002, BR-DEPT-003 | TC-DEPT-001 | Planned |
| UC-DEPT-002 | FR-DEPT-002 | BR-DEPT-005, BR-DEPT-006, BR-DEPT-007 | TC-DEPT-002 | Planned |
| UC-DEPT-008 | FR-DEPT-006 | BR-DEPT-009, BR-DEPT-010, BR-DEPT-011 | TC-DEPT-008 | Planned |
| UC-DEPT-011 | FR-DEPT-008 | BR-DEPT-013, BR-DEPT-014, BR-DEPT-015 | TC-DEPT-011 | Planned |
| UC-DEPT-015 | FR-DEPT-007 | BR-DEPT-017, BR-DEPT-018, BR-DEPT-019 | TC-DEPT-015 | Planned |
| UC-DEPT-101 | FR-DEPT-006 | BR-DEPT-009, BR-DEPT-010 | TC-DEPT-101 | Planned |
| UC-DEPT-102 | FR-DEPT-005 | BR-DEPT-012, BR-DEPT-014 | TC-DEPT-102 | Planned |
| UC-DEPT-202 | FR-DEPT-006 | BR-DEPT-009, BR-DEPT-012 | TC-DEPT-202 | Planned |

---

## Appendix

### Glossary

**Department**: Organizational unit for cost tracking and responsibility accounting
**Cost Center**: Financial tracking code assigned to departments for expense allocation
**Department Head**: Primary manager responsible for department operations and budget
**Budget Allocation**: Distribution of organizational budget to departments
**Department Dimension**: GL transaction attribute specifying department
**Hierarchy**: Parent-child organizational structure of departments
**Cross-Department Allocation**: Distribution of shared costs across multiple departments
**Budget vs Actual**: Comparison of planned budget to actual expenses/revenue
**Encumbrance**: Commitment of funds (e.g., approved purchase request) reducing available budget
**Approval Limit**: Maximum transaction amount department head can approve

### Common Use Case Patterns

**Pattern: Department Transaction Posting**
1. User enters transaction with GL account
2. System prompts for department (if expense/revenue)
3. User selects department from authorized list
4. System validates department active and effective
5. System retrieves cost center from department
6. System checks budget availability
7. System posts transaction with department dimension
8. System updates department balance

**Pattern: Budget Variance Detection**
1. Transaction posted to department
2. System updates department actual total
3. System calculates remaining budget
4. System calculates utilization percentage
5. System checks threshold breaches (75%, 90%, 95%, 100%)
6. If threshold exceeded, generate alert
7. Send notification to department head and finance manager
8. Log budget event in audit trail

**Pattern: Department Hierarchy Management**
1. User selects department to move
2. User drags to new parent department
3. System validates move (no circular reference, depth limit)
4. System displays impact analysis
5. User confirms move
6. System updates parent reference
7. System recalculates hierarchy levels
8. System updates all descendant departments
9. System logs hierarchy change

---

**Document End**

> 📝 **Document Status**: Draft - Pending Review
>
> **Next Steps**:
> - Review by Finance Manager and Department Heads
> - User acceptance testing of critical workflows
> - Technical review by Development Team
> - Integration testing with Procurement and HR modules
