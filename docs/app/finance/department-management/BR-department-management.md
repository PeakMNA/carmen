# Business Requirements: Department and Cost Center Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Department and Cost Center Management
- **Route**: `/finance/department-management`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-13

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-13 | Carmen ERP Documentation Team | Initial version |


## Overview

The Department and Cost Center Management sub-module provides comprehensive organizational financial tracking and cost allocation capabilities for hospitality operations. It enables the organization to establish department hierarchies, assign cost centers, manage departmental budgets, track expenses by department, and ensure proper financial responsibility assignment across the enterprise. This module ensures accurate cost allocation, supports department-based financial analysis, and maintains clear accountability for organizational spending.

The Department Management module integrates tightly with Account Code Mapping to ensure all departmental transactions are properly posted with appropriate account codes, and with User Management for department head assignment and user-department relationships.

## Business Objectives

1. Establish clear organizational structure with department hierarchy
2. Assign financial responsibility through department head designation
3. Enable accurate cost allocation and expense tracking by department
4. Support departmental budgeting and budget vs actual analysis
5. Facilitate department-based financial reporting and analysis
6. Maintain proper segregation of duties and approval workflows by department
7. Provide visibility into departmental financial performance
8. Support multi-location operations with location-based departments
9. Enable cross-departmental cost allocation and chargebacks
10. Ensure compliance with internal controls and audit requirements

## Key Stakeholders

### Primary Users
1. **CFO / Financial Controller**: Defines organizational structure, oversees departmental financial performance, approves department budgets
2. **Finance Manager**: Configures departments and cost centers, manages department hierarchies, assigns account codes
3. **Department Manager**: Reviews department expenses, approves department purchases, monitors budget utilization
4. **Budget Analyst**: Creates department budgets, analyzes budget vs actual, identifies variances

### System Users
1. **Purchasing Manager**: Views department budgets for procurement planning
2. **Accountant**: Posts transactions to departments, reconciles departmental accounts
3. **Operations Manager**: Views department costs for operational decisions
4. **HR Manager**: Assigns users to departments, manages department head assignments

### Supporting Roles
1. **Internal Auditor**: Reviews department controls and expense patterns
2. **External Auditor**: Verifies departmental cost allocation accuracy
3. **System Administrator**: Configures department security and permissions

## Functional Requirements

### FR-DEPT-001: Department Master Data Management
**Priority**: Critical
**User Story**: As a Finance Manager, I want to maintain a comprehensive list of departments with hierarchical structure so that the system can support multi-level organizational reporting.

**Requirements**:
- Department master data with unique department codes
- Department name, description, and active status
- Department hierarchy (parent-child relationships)
- Department type (operational, administrative, support, revenue)
- Cost center assignment (one or multiple cost centers per department)
- Account code mapping for default GL accounts
- Location association (multi-location support)
- Effective date ranges for department validity
- Department manager assignment (primary and secondary)

**Department Master Structure**:
```typescript
interface Department {
  department_id: string              // UUID
  department_code: string            // Unique code (e.g., "KITCHEN", "FB-SERVICE")
  department_name: string            // Full name (e.g., "Kitchen Operations")
  department_description: string     // Purpose and scope description
  parent_department_id?: string      // Link to parent department
  department_type: 'operational' | 'administrative' | 'support' | 'revenue'
  is_active: boolean                 // Active for transactions
  effective_date: Date               // Date from which department is active
  end_date?: Date                    // Date department becomes inactive
  location_id?: string               // Associated location (multi-location)
  cost_center_code: string           // Primary cost center
  default_expense_account: string    // Default GL account for expenses
  default_revenue_account?: string   // Default GL account for revenue (if revenue dept)
  department_head_id: string         // Primary department manager
  secondary_manager_id?: string      // Backup department manager
  approval_limit: number             // Purchase approval limit for dept head
  budget_amount?: number             // Annual budget allocation
  notes: string                      // Additional information
  created_by: string                 // User who created
  created_at: Date                   // Creation timestamp
  updated_by: string                 // User who last updated
  updated_at: Date                   // Last update timestamp
}
```

**Department Examples**:
```yaml
Department: Kitchen Operations
  Code: KITCHEN
  Type: Operational
  Parent: Food & Beverage (F&B)
  Cost Center: CC-KITCHEN-001
  Location: Main Hotel
  Department Head: John Smith (Executive Chef)
  Default Expense Account: 5100 - Food Costs
  Approval Limit: $5,000
  Budget: $500,000/year
  Active: Yes

Department: Front Office
  Code: FRONT-OFFICE
  Type: Revenue
  Parent: Rooms Division
  Cost Center: CC-FO-001
  Location: Main Hotel
  Department Head: Sarah Johnson (Front Office Manager)
  Default Revenue Account: 4100 - Room Revenue
  Default Expense Account: 5500 - Front Office Expenses
  Approval Limit: $2,000
  Budget: $180,000/year
  Active: Yes

Department: Housekeeping
  Code: HOUSEKEEPING
  Type: Operational
  Parent: Rooms Division
  Cost Center: CC-HK-001
  Location: Main Hotel
  Department Head: Maria Garcia (Housekeeping Manager)
  Default Expense Account: 5600 - Housekeeping Expenses
  Approval Limit: $3,000
  Budget: $350,000/year
  Active: Yes
```

**Acceptance Criteria**:
- Support minimum 50 departments (expandable to 200+)
- Department codes unique within organization
- Each department can have one parent (single hierarchy)
- Inactive departments cannot be used for new transactions
- Department hierarchy depth maximum 5 levels
- Bulk import supports CSV/Excel with validation
- Department changes tracked in audit trail

---

### FR-DEPT-002: Department Hierarchy Management
**Priority**: High
**User Story**: As a Finance Manager, I want to establish department hierarchies so that financial reporting can be rolled up across organizational levels.

**Requirements**:
- Parent-child relationships with unlimited children per parent
- Maximum hierarchy depth of 5 levels
- Root level departments (no parent)
- Leaf level departments (no children)
- Prevent circular references (department cannot be its own ancestor)
- Hierarchy visualization (org chart view)
- Rollup calculations (child departments aggregate to parent)
- Hierarchy-based reporting
- Bulk hierarchy updates

**Hierarchy Example**:
```
Organization
├── Rooms Division (Level 1)
│   ├── Front Office (Level 2)
│   │   ├── Reception (Level 3)
│   │   └── Concierge (Level 3)
│   └── Housekeeping (Level 2)
│       ├── Guest Rooms (Level 3)
│       └── Public Areas (Level 3)
├── Food & Beverage (Level 1)
│   ├── Kitchen (Level 2)
│   │   ├── Hot Kitchen (Level 3)
│   │   ├── Cold Kitchen (Level 3)
│   │   └── Pastry (Level 3)
│   ├── Restaurant (Level 2)
│   └── Banquet (Level 2)
├── Administration (Level 1)
│   ├── Finance (Level 2)
│   ├── HR (Level 2)
│   └── IT (Level 2)
└── Sales & Marketing (Level 1)
    ├── Sales (Level 2)
    └── Marketing (Level 2)
```

**Acceptance Criteria**:
- Hierarchy depth maximum 5 levels enforced
- Circular reference detection prevents invalid hierarchies
- Moving departments preserves child relationships
- Rollup calculations accurate across all levels
- Hierarchy changes logged in audit trail

---

### FR-DEPT-003: Cost Center Assignment
**Priority**: Critical
**User Story**: As a Budget Analyst, I want to assign cost centers to departments so that expenses can be tracked and allocated properly for financial analysis.

**Requirements**:
- One primary cost center per department (mandatory)
- Multiple cost centers per department (optional, for complex departments)
- Cost center code format validation
- Cost center description and purpose
- Link cost center to GL accounts
- Budget assignment to cost centers
- Cost center active status
- Historical cost center tracking

**Cost Center Structure**:
```typescript
interface CostCenter {
  cost_center_id: string
  cost_center_code: string           // Unique code (e.g., "CC-KITCHEN-001")
  cost_center_name: string           // Descriptive name
  description: string                // Purpose and scope
  department_id: string              // Owning department
  is_primary: boolean                // Primary cost center for department
  account_code_prefix?: string       // GL account prefix for this cost center
  budget_amount: number              // Allocated budget
  is_active: boolean
  effective_date: Date
  end_date?: Date
}
```

**Cost Center Examples**:
```yaml
Cost Center: Kitchen Operations
  Code: CC-KITCHEN-001
  Department: Kitchen
  Type: Primary
  Account Prefix: 5100-
  Budget: $500,000
  Description: Main kitchen operations and food costs
  Active: Yes

Cost Center: Banquet Kitchen
  Code: CC-KITCHEN-002
  Department: Kitchen
  Type: Secondary
  Account Prefix: 5150-
  Budget: $150,000
  Description: Banquet and event catering
  Active: Yes
```

**Acceptance Criteria**:
- Every active department must have one primary cost center
- Cost center codes unique within organization
- Budget allocation tracked at cost center level
- Inactive cost centers cannot be assigned to new transactions
- Cost center changes tracked in audit trail

---

### FR-DEPT-004: Department Head Assignment
**Priority**: High
**User Story**: As an HR Manager, I want to assign department heads (managers) to departments so that approval workflows and financial responsibility are properly established.

**Requirements**:
- Primary department head (mandatory)
- Secondary/backup department head (optional)
- User-department relationship tracking
- Multiple departments per user (user can head multiple small departments)
- Email notification on assignment
- Approval limit configuration per department head
- Delegation during absence (temporary assignment)
- Department head history tracking

**Department User Assignment**:
```typescript
interface DepartmentUser {
  assignment_id: string
  department_id: string
  user_id: string
  assignment_type: 'department_head' | 'secondary_head' | 'member' | 'delegate'
  is_primary: boolean
  approval_limit: number             // Purchase approval limit
  can_approve_expenses: boolean
  can_view_budget: boolean
  can_create_budget: boolean
  effective_date: Date
  end_date?: Date
  is_active: boolean
  notes: string
}
```

**Assignment Examples**:
```yaml
Department: Kitchen
  Primary Head: John Smith (Executive Chef)
    - Approval Limit: $5,000
    - Can Approve Expenses: Yes
    - Can View Budget: Yes
    - Can Create Budget: No
    - Effective: 2025-01-01

  Secondary Head: Jane Doe (Sous Chef)
    - Approval Limit: $2,000
    - Can Approve Expenses: Yes (when primary unavailable)
    - Can View Budget: Yes
    - Can Create Budget: No
    - Effective: 2025-01-01

  Delegate: Mike Johnson (Kitchen Manager)
    - Assignment Type: Temporary Delegate
    - Approval Limit: $5,000
    - Effective: 2025-12-01 to 2025-12-15 (John Smith vacation)
```

**Acceptance Criteria**:
- Every active department must have one primary department head
- Department heads receive email notification on assignment
- Approval limits enforced in procurement workflows
- Delegation assignments time-bound with start and end dates
- Assignment changes tracked in audit trail

---

### FR-DEPT-005: Department Budget Management
**Priority**: High
**User Story**: As a Budget Analyst, I want to create and manage department budgets so that actual expenses can be compared to budget and variances analyzed.

**Requirements**:
- Annual budget creation by department
- Monthly budget allocation (distribute annual budget across months)
- Budget revision tracking (original, revised, current)
- Budget vs actual reporting
- Variance analysis (favorable/unfavorable)
- Budget alerts when threshold exceeded (e.g., 80% utilized)
- Multi-year budget comparison
- Budget approval workflow

**Department Budget Structure**:
```typescript
interface DepartmentBudget {
  budget_id: string
  department_id: string
  fiscal_year: number                // 2025, 2026, etc.
  budget_type: 'original' | 'revised' | 'supplemental'
  budget_category: 'expense' | 'revenue' | 'both'
  annual_budget_amount: number
  budget_status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'closed'
  approval_date?: Date
  approved_by?: string
  notes: string
  created_by: string
  created_at: Date
}

interface DepartmentBudgetLine {
  budget_line_id: string
  budget_id: string
  account_code: string               // GL account
  account_name: string
  annual_amount: number
  jan_amount: number
  feb_amount: number
  mar_amount: number
  apr_amount: number
  may_amount: number
  jun_amount: number
  jul_amount: number
  aug_amount: number
  sep_amount: number
  oct_amount: number
  nov_amount: number
  dec_amount: number
}
```

**Budget Example**:
```yaml
Budget: Kitchen Operations - FY 2025
  Department: Kitchen
  Type: Original Budget
  Status: Approved
  Approval Date: 2024-12-15
  Approved By: CFO

  Budget Lines:
    Food Costs (5100):
      Annual: $300,000
      Monthly: $25,000 each month

    Kitchen Supplies (5110):
      Annual: $50,000
      Monthly Allocation:
        Jan-Mar: $3,000/month (off-season)
        Apr-Jun: $5,000/month (peak season)
        Jul-Sep: $4,000/month (high season)
        Oct-Dec: $3,000/month (off-season)

    Kitchen Labor (6100):
      Annual: $120,000
      Monthly: $10,000 each month

    Utilities (6500):
      Annual: $30,000
      Monthly Allocation:
        Jan-Mar: $3,000/month (winter)
        Apr-Jun: $2,000/month (spring)
        Jul-Sep: $3,500/month (summer cooling)
        Oct-Dec: $2,500/month (fall)

  Total Annual Budget: $500,000
```

**Acceptance Criteria**:
- Annual budget totals equal sum of monthly allocations
- Budget approval workflow enforced before activation
- Budget revisions create new version (maintain original)
- Budget vs actual reports show monthly and YTD variances
- Budget alerts configurable by department (e.g., alert at 80% utilization)

---

### FR-DEPT-006: Department-Based Transaction Posting
**Priority**: Critical
**User Story**: As an Accountant, I want to post transactions to departments so that expenses and revenues are properly allocated for departmental reporting.

**Requirements**:
- Department selection mandatory for all transactions
- Default department from user assignment
- Department validation (must be active)
- Multi-department allocation (split single transaction across departments)
- Percentage or amount-based allocation
- Department dimension in GL posting
- Department-based account code mapping
- Batch posting with department assignment

**Transaction Posting with Department**:
```yaml
Transaction: Purchase Invoice
  Vendor: Food Supplier ABC
  Invoice Date: 2025-11-12
  Total Amount: $2,500.00

  Line Items:
    Line 1: Fresh Vegetables
      Amount: $1,200.00
      Department: Kitchen (100%)
      GL Account: 5100 - Food Costs
      Cost Center: CC-KITCHEN-001

    Line 2: Restaurant Linens
      Amount: $800.00
      Department: Restaurant (100%)
      GL Account: 5200 - Restaurant Supplies
      Cost Center: CC-REST-001

    Line 3: Office Supplies (shared)
      Amount: $500.00
      Multi-Department Allocation:
        - Kitchen: 40% = $200.00
        - Restaurant: 30% = $150.00
        - Administration: 30% = $150.00

Journal Entry:
  Debit: 5100 - Food Costs (Kitchen): $1,200.00
  Debit: 5200 - Restaurant Supplies (Restaurant): $800.00
  Debit: 5300 - Office Supplies (Kitchen): $200.00
  Debit: 5300 - Office Supplies (Restaurant): $150.00
  Debit: 5300 - Office Supplies (Admin): $150.00
  Credit: 2100 - Accounts Payable: $2,500.00
```

**Acceptance Criteria**:
- All transactions require department assignment
- Multi-department allocations sum to 100%
- Department validation prevents posting to inactive departments
- GL posting includes department dimension
- Department changes tracked in audit trail

---

### FR-DEPT-007: Department-Based Reporting
**Priority**: High
**User Story**: As a Department Manager, I want to view department financial reports so that I can monitor department performance and make informed decisions.

**Requirements**:
- Department income statement (revenue, expenses, profit)
- Department expense report by account
- Budget vs actual by department
- Variance analysis (favorable/unfavorable)
- Department comparison report (compare multiple departments)
- Trend analysis (monthly, quarterly, YTD)
- Drill-down to transaction detail
- Export to Excel/PDF

**Department Report Examples**:

**Department Income Statement**:
```
Kitchen Operations - Income Statement
Period: November 2025

Revenue:
  Catering Revenue: $15,000.00
  Total Revenue: $15,000.00

Expenses:
  Food Costs: $28,500.00
  Kitchen Supplies: $4,200.00
  Kitchen Labor: $10,500.00
  Utilities: $3,100.00
  Total Expenses: $46,300.00

Net Profit/(Loss): ($31,300.00)

Note: Kitchen is a cost center, deficit absorbed by revenue departments
```

**Department Budget vs Actual**:
```
Kitchen Operations - Budget vs Actual
Period: November 2025

Account                 Budget      Actual      Variance    %
Food Costs            $25,000.00  $28,500.00  ($3,500.00) -14.0% (Unfavorable)
Kitchen Supplies       $5,000.00   $4,200.00     $800.00   16.0% (Favorable)
Kitchen Labor         $10,000.00  $10,500.00    ($500.00)  -5.0% (Unfavorable)
Utilities              $3,000.00   $3,100.00    ($100.00)  -3.3% (Unfavorable)

Total                 $43,000.00  $46,300.00  ($3,300.00)  -7.7% (Unfavorable)

YTD (Jan-Nov):
Budget: $473,000.00
Actual: $495,800.00
Variance: ($22,800.00) -4.8% (Unfavorable)
```

**Acceptance Criteria**:
- Reports real-time (reflect latest posted transactions)
- Budget vs actual shows monthly and YTD
- Variance calculations accurate (actual - budget)
- Drill-down to transaction detail from any line
- Export maintains formatting and calculations

---

### FR-DEPT-008: Cross-Department Allocations
**Priority**: Medium
**User Story**: As an Accountant, I want to allocate shared costs across departments so that indirect expenses are properly distributed for accurate cost analysis.

**Requirements**:
- Allocation pool definition (shared costs to be allocated)
- Allocation basis (headcount, square footage, revenue, custom)
- Allocation percentage or formula
- Recurring allocation schedules (monthly, quarterly)
- Allocation journal entry generation
- Allocation history and audit trail
- Reversal capability

**Allocation Example**:
```yaml
Allocation: IT Department Costs
  Source Department: IT (Administration)
  Total Monthly Cost: $20,000.00
  Allocation Basis: Headcount

  Target Departments:
    Kitchen: 25 employees (25%) = $5,000.00
    Front Office: 15 employees (15%) = $3,000.00
    Housekeeping: 30 employees (30%) = $6,000.00
    Restaurant: 20 employees (20%) = $4,000.00
    Administration: 10 employees (10%) = $2,000.00
  Total: 100 employees = 100% = $20,000.00

Journal Entry (Monthly):
  Debit: 6800 - IT Allocation (Kitchen): $5,000.00
  Debit: 6800 - IT Allocation (Front Office): $3,000.00
  Debit: 6800 - IT Allocation (Housekeeping): $6,000.00
  Debit: 6800 - IT Allocation (Restaurant): $4,000.00
  Debit: 6800 - IT Allocation (Admin): $2,000.00
  Credit: 6200 - IT Costs (IT Dept): $20,000.00
```

**Acceptance Criteria**:
- Allocation basis configurable (headcount, square footage, revenue, etc.)
- Allocation percentages sum to 100%
- Recurring allocations automated on schedule
- Allocation entries clearly marked for audit
- Allocation reversals supported

---

### FR-DEPT-009: Department Location Assignment
**Priority**: Medium
**User Story**: As a Finance Manager, I want to assign departments to locations so that multi-location operations can track costs by both department and location.

**Requirements**:
- Link departments to specific locations
- Support same department at multiple locations (e.g., Kitchen at Hotel A and Hotel B)
- Location-based department hierarchy
- Consolidated reporting across locations
- Location-specific department budgets
- Transfer transactions between department-locations

**Multi-Location Example**:
```yaml
Location: Main Hotel
  Departments:
    - Kitchen (Main)
    - Front Office (Main)
    - Housekeeping (Main)
    - Restaurant (Main)

Location: Beach Resort
  Departments:
    - Kitchen (Beach)
    - Front Office (Beach)
    - Housekeeping (Beach)
    - Restaurant (Beach)
    - Spa (Beach)

Location: City Center
  Departments:
    - Kitchen (City)
    - Front Office (City)
    - Housekeeping (City)

Consolidated Reporting:
  Kitchen (All Locations):
    - Kitchen (Main): $45,000
    - Kitchen (Beach): $38,000
    - Kitchen (City): $28,000
    Total Kitchen Costs: $111,000
```

**Acceptance Criteria**:
- Departments assigned to specific locations
- Same department name can exist at multiple locations (differentiated by location)
- Consolidated reports aggregate across locations
- Location dimension captured in all transactions

---

### FR-DEPT-010: Department Approval Workflows
**Priority**: High
**User Story**: As a Department Manager, I want purchase requests from my department to route to me for approval so that I can control department spending.

**Requirements**:
- Approval routing based on department assignment
- Multi-level approval (department head → finance manager → CFO)
- Approval limits by department head
- Delegate approval authority
- Approval notifications via email
- Approval history and audit trail
- Budget check integration (warn if over budget)

**Approval Workflow Example**:
```yaml
Purchase Request: PR-2501-001234
  Requested By: Line Cook (Kitchen)
  Department: Kitchen
  Amount: $3,800.00
  Description: Kitchen equipment repair

Approval Flow:
  Step 1: Department Head Review
    Approver: John Smith (Executive Chef)
    Approval Limit: $5,000
    Decision: Amount $3,800 < Limit $5,000
    Action: APPROVED (auto-approved within limit)
    Date: 2025-11-12 10:30

  Step 2: Budget Check
    Kitchen Budget YTD: $485,000 / $500,000 (97%)
    Warning: Department approaching budget limit
    Notification sent to: John Smith, Finance Manager

  Step 3: Finance Review (triggered by budget warning)
    Approver: Finance Manager
    Review: Budget overrun acceptable for essential equipment
    Action: APPROVED
    Date: 2025-11-12 14:15

  Final Status: APPROVED
  Purchase Order Created: PO-2501-005678
```

**Acceptance Criteria**:
- Approval routing automatic based on department
- Approval limits enforced
- Budget warnings displayed during approval
- Approvers can approve/reject with comments
- Delegation supported during absence
- Approval history retained for audit

---

## Business Rules

### Department Master Data Rules

**BR-DEPT-001: Department Code Uniqueness**
- Each department code must be unique within organization
- Department codes case-insensitive (KITCHEN = kitchen)
- Deleted departments retain code in history with "Deleted" status
- Department codes cannot be reused after deletion

**BR-DEPT-002: Department Name Uniqueness**
- Department names must be unique within same parent department
- Different parents can have same department name (e.g., "Administration" under different divisions)
- Department name changes tracked in audit trail

**BR-DEPT-003: Active Department Requirements**
- Active departments must have:
  - Department code
  - Department name
  - One primary cost center
  - One primary department head
  - At least one GL account mapping
- Inactive departments cannot be assigned to new transactions

**BR-DEPT-004: Department Hierarchy Rules**
- Maximum hierarchy depth: 5 levels
- Department cannot be its own parent (prevents circular reference)
- Department cannot be ancestor of its parent (prevents circular hierarchy)
- Moving department preserves all child relationships
- Root departments (no parent) allowed

---

### Cost Center Rules

**BR-DEPT-005: Cost Center Assignment**
- Every active department must have exactly one primary cost center
- Departments can have multiple secondary cost centers
- Cost center codes must be unique within organization
- Inactive cost centers cannot be assigned to new transactions

**BR-DEPT-006: Cost Center Budget**
- Cost center budget cannot exceed department budget
- Sum of cost center budgets within department = department total budget
- Budget amendments tracked with approval workflow

---

### Department Head Rules

**BR-DEPT-007: Department Head Assignment**
- Every active department must have one primary department head
- Department head must be an active user
- User can be department head of multiple departments
- Secondary department head optional but recommended
- Delegation assignments must be time-bound (start and end date)

**BR-DEPT-008: Approval Limit Hierarchy**
- Department head approval limit <= finance manager approval limit
- Secondary head approval limit <= primary head approval limit
- Approval limit = 0 means cannot approve (view only)

---

### Transaction Posting Rules

**BR-DEPT-009: Department Assignment Mandatory**
- All expense transactions must have department assignment
- All revenue transactions must have department assignment
- Transactions without department assignment rejected

**BR-DEPT-010: Multi-Department Allocation**
- Multi-department allocations must sum to 100%
- Each allocation percentage must be > 0% and <= 100%
- At least one department must be assigned
- Maximum 10 departments per transaction line

**BR-DEPT-011: Department Validation**
- Department must be active at transaction date
- Department must be assigned to transaction location (if multi-location)
- Department must have valid cost center

---

### Budget Rules

**BR-DEPT-012: Budget Approval**
- Department budgets require department head review
- Annual budgets > $100,000 require CFO approval
- Budget revisions require same approval as original budget
- Mid-year budget supplements require CFO approval

**BR-DEPT-013: Budget Period**
- Budget fiscal year must match organization fiscal year
- Budget cannot be created for closed fiscal years
- Budget amendments allowed only for current or future fiscal years

**BR-DEPT-014: Budget vs Actual**
- Actual expenses posted to department in real-time
- Budget vs actual calculated on demand (not stored)
- Variance = Actual - Budget (negative = unfavorable for expenses)

---

### Reporting Rules

**BR-DEPT-015: Department Reporting Access**
- Department heads can view own department reports
- Finance managers can view all department reports
- Users can view assigned department reports only
- Drill-down access respects transaction-level permissions

---

## Integration Requirements

### Internal Integrations
- **Account Code Mapping**: Department-based account code defaults, automated GL account assignment
- **User Management**: Department head assignment, user-department relationships, permission management
- **Budget Management**: Department budget creation, budget vs actual analysis
- **Procurement**: Purchase approval workflows, budget checking, department expense tracking
- **Inventory Management**: Department inventory assignment, stock requisitions by department
- **Payroll**: Department labor costs, headcount for allocation basis

### External Integrations
- **HR Systems**: Employee-department assignments, organizational chart synchronization
- **ERP Systems**: Department master data synchronization, cost center integration
- **Reporting Tools**: Department financial data export, dashboard integration

### Data Dependencies
- **Depends On**: User Management (department heads), Account Code Mapping (GL accounts), Location Management (multi-location)
- **Used By**: All financial modules requiring department assignment

---

## Non-Functional Requirements

### Performance
- **NFR-DEPT-001**: Department lookup response time <200ms
- **NFR-DEPT-002**: Department hierarchy retrieval <500ms for 200 departments
- **NFR-DEPT-003**: Budget vs actual report generation <5 seconds for 12-month period
- **NFR-DEPT-004**: Multi-department allocation calculation <1 second

### Security
- **NFR-DEPT-005**: Role-based access control for department configuration
- **NFR-DEPT-006**: Department-level data access restrictions (RLS)
- **NFR-DEPT-007**: Audit trail for all department changes
- **NFR-DEPT-008**: Department head change requires Finance Manager approval
- **NFR-DEPT-009**: Budget data encrypted at rest

### Usability
- **NFR-DEPT-010**: Department selector with search and autocomplete
- **NFR-DEPT-011**: Org chart visualization for hierarchy
- **NFR-DEPT-012**: Budget vs actual displayed with visual indicators (green/yellow/red)
- **NFR-DEPT-013**: Department reports exportable to Excel/PDF
- **NFR-DEPT-014**: Mobile-responsive department dashboards

### Reliability
- **NFR-DEPT-015**: Department data ACID compliant
- **NFR-DEPT-016**: Department hierarchy integrity enforced
- **NFR-DEPT-017**: Daily backup of department and budget data
- **NFR-DEPT-018**: Automatic budget alert emails (99.9% delivery rate)

### Scalability
- **NFR-DEPT-019**: Support minimum 50 departments (expandable to 200+)
- **NFR-DEPT-020**: Support 1,000 department users
- **NFR-DEPT-021**: Retain 10+ years of department budget history
- **NFR-DEPT-022**: Handle 10,000 daily departmental transactions

---

## Success Metrics

### Automation Metrics
- **Auto-Assignment Rate**: Target >80% of transactions auto-assign to correct department
- **Budget Alert Accuracy**: Target >95% of budget alerts actionable
- **Approval Workflow Automation**: Target >90% of approvals within limits auto-process

### Accuracy Metrics
- **Department Assignment Accuracy**: Target >99% correct department assignment
- **Budget Allocation Accuracy**: Target 100% budget totals match GL actuals
- **Cost Allocation Accuracy**: Target <1% variance in cross-department allocations

### Efficiency Metrics
- **Department Setup Time**: Target <15 minutes for new department configuration
- **Budget Creation Time**: Target <2 hours for annual department budget
- **Report Generation Time**: Target <10 seconds for department financial reports

### Compliance Metrics
- **Audit Compliance**: Target zero critical audit findings on department controls
- **Approval Compliance**: Target 100% of transactions within approval limits
- **Budget Compliance**: Target >85% of departments within budget annually

---

## Dependencies

### Module Dependencies
- **User Management**: Department head assignment, user-department relationships (Critical)
- **Account Code Mapping**: Department-based GL accounts, automated account assignment (Critical)
- **Organization Setup**: Organizational structure, fiscal year configuration (Critical)
- **Location Management**: Multi-location department assignment (High)
- **Budget Management**: Department budget creation and tracking (High)

### Technical Dependencies
- **Database**: PostgreSQL for department and budget storage (Critical)
- **Authentication**: Supabase Auth for user-department security (Critical)
- **Reporting Engine**: Department report generation (High)

### Data Dependencies
- **Master Data**: User master (department heads), Location master (multi-location)
- **Chart of Accounts**: Department expense and revenue accounts configured (Critical)
- **Accounting Periods**: Open periods for department transaction posting (Critical)

---

## Assumptions and Constraints

### Assumptions
- Organization has defined organizational structure with clear departments
- Department heads have financial management responsibility
- Budget process established with fiscal year alignment
- Users assigned to primary department for default posting
- Department structure relatively stable (changes infrequent)

### Constraints
- Department hierarchy depth limited to 5 levels (system constraint)
- Department code cannot be changed after transactions posted (data integrity)
- Historical department budgets immutable (regulatory constraint)
- Department deletion requires zero balance and no transactions (business constraint)
- Multi-department allocation limited to 10 departments (performance constraint)

### Risks
- **Organizational Restructure**: Mitigate with department merge/split tools and historical preservation
- **Budget Accuracy**: Mitigate with monthly budget reviews and variance analysis
- **Approval Workflow Delays**: Mitigate with delegation and automated escalation
- **Data Quality**: Mitigate with mandatory fields and validation rules

---

## Future Enhancements

### Phase 2 Enhancements
- **Advanced Allocations**: Activity-based costing, driver-based allocations
- **Predictive Budgeting**: Machine learning budget forecasting
- **Department Benchmarking**: Compare department performance against industry standards
- **Profitability Analysis**: Department-level profit and contribution margin analysis

### Long-term Vision
Evolution toward comprehensive departmental performance management with advanced analytics, predictive insights, automated cost optimization, and integration with operational KPIs for complete hospitality department management.

---

## References

### Related Documents
- [Technical Specification](./TS-department-management.md)
- [Use Cases](./UC-department-management.md)
- [Data Schema](./DS-department-management.md)
- [Flow Diagrams](./FD-department-management.md)
- [Validation Rules](./VAL-department-management.md)
- [Finance PRD](../../prd/output/modules/finance-prd.md)

### Standards and Guidelines
- **Organizational Design Best Practices**: Department structure and hierarchy guidelines
- **Management Accounting Standards**: Cost center management and allocation principles
- **Internal Controls Framework**: COSO framework for departmental financial controls

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Owner | | | |
| Product Manager | | | |
| Technical Lead | | | |
| Finance Stakeholder | | | |
| Department Manager Representative | | | |
| Quality Assurance | | | |

---

**Document End**

> 📝 **Document Status**: Draft - Pending Review
>
> **Next Steps**:
> - Review by Finance Manager and CFO
> - Review by Department Managers for usability
> - Technical review by Development Team
> - Approval by Product Owner and Finance Stakeholder
