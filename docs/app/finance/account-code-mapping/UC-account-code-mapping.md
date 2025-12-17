# Use Cases: Account Code Mapping

## Module Information
- **Module**: Finance
- **Sub-Module**: Account Code Mapping
- **Route**: `/finance/account-code-mapping`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-12
- **Owner**: Finance Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |

---

## Overview

This document describes the use cases for the Account Code Mapping sub-module, which manages the Chart of Accounts and automates general ledger account assignment for operational transactions. The use cases cover interactive financial management workflows, automated journal entry generation, and system integrations that support accurate financial recording and compliance.

**Related Documents**:
- [Business Requirements](./BR-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Data Schema](./DS-account-code-mapping.md)
- [Flow Diagrams](./FD-account-code-mapping.md)
- [Validations](./VAL-account-code-mapping.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **Financial Controller / CFO** | Senior finance executive responsible for financial strategy and compliance | Defines COA structure, approves critical mapping changes, oversees financial integrity |
| **Finance Manager** | Manages day-to-day finance operations and accounting processes | Configures mapping rules, manages accounts, reviews postings, handles exceptions |
| **Accountant** | Performs daily accounting tasks and transaction processing | Reviews journal entries, posts manual entries, reconciles accounts, investigates variances |
| **Cost Accountant** | Specializes in cost analysis and management accounting | Manages cost center allocations, analyzes dimensions, creates cost reports |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **System Administrator** | Manages system configuration and user access | Configures system parameters, manages user roles, performs system maintenance |
| **External Auditor** | Independent auditor verifying financial accuracy | Reviews COA structure, tests mapping rules, validates audit trails, certifies financials |
| **Internal Auditor** | Internal compliance officer | Monitors control effectiveness, reviews exception postings, ensures policy compliance |
| **Tax Accountant** | Specialist in tax accounting and compliance | Configures tax-related accounts, reviews tax postings, prepares tax returns |

### Operational Users (Transaction Initiators)

| Actor | Description | Impact |
|-------|-------------|--------|
| **Purchasing Manager** | Creates purchase orders and receives goods | Triggers AP and inventory journal entries |
| **Inventory Manager** | Manages stock movements and adjustments | Triggers inventory valuation journal entries |
| **Store Manager** | Processes store requisitions and wastage | Triggers cost allocation and variance entries |
| **Department Managers** | Initiate transactions for their departments | Transactions auto-posted to department cost centers |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| **Posting Engine** | Automated service that generates journal entries from operational transactions | Core Service |
| **Mapping Rule Engine** | Evaluates mapping rules and determines GL accounts | Core Service |
| **Reconciliation Service** | Compares operational balances with GL balances | Background Job |
| **Period Close Service** | Manages period closing and financial period controls | Background Job |
| **Procurement System** | Source of purchase transactions (PRs, POs, GRNs, invoices) | Internal Integration |
| **Inventory System** | Source of inventory movements and valuations | Internal Integration |
| **Sales System** | Source of sales invoices and customer receipts | Internal Integration |
| **Budgeting System** | Provides budget data for comparison and analysis | Internal Integration |
| **Reporting Engine** | Generates financial reports from GL data | Internal Service |

---

## Use Case Diagram

```
                    ┌─────────────────────────────────────────┐
                    │   Account Code Mapping System           │
                    └────────────┬────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
   ┌─────▼──────┐         ┌─────▼──────┐         ┌─────▼──────┐
   │ Financial  │         │  Finance   │         │ Accountant │
   │ Controller │         │  Manager   │         │            │
   └─────┬──────┘         └─────┬──────┘         └─────┬──────┘
         │                      │                       │
    [UC-ACM-001]           [UC-ACM-002]            [UC-ACM-005]
    [UC-ACM-006]           [UC-ACM-003]            [UC-ACM-007]
    [UC-ACM-010]           [UC-ACM-004]            [UC-ACM-008]
                           [UC-ACM-009]            [UC-ACM-011]

   ┌──────────────┐        ┌──────────────┐       ┌──────────────┐
   │     Cost     │        │   System     │       │   External   │
   │  Accountant  │        │     Admin    │       │   Auditor    │
   └──────┬───────┘        └──────┬───────┘       └──────┬───────┘
          │                       │                       │
     [UC-ACM-012]            [UC-ACM-013]            [UC-ACM-014]
     [UC-ACM-015]                                    [UC-ACM-015]

  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
  │   Posting      │      │  Mapping Rule  │      │ Reconciliation │
  │    Engine      │      │     Engine     │      │    Service     │
  │  (Automated)   │      │  (Automated)   │      │ (Background)   │
  └────────┬───────┘      └────────┬───────┘      └────────┬───────┘
           │                       │                       │
      [UC-ACM-101]            [UC-ACM-102]            [UC-ACM-103]
      [UC-ACM-104]            [UC-ACM-105]            [UC-ACM-106]
      (auto-posting)          (rule evaluation)       (reconciliation)

  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
  │  Procurement   │      │   Inventory    │      │     Sales      │
  │    System      │      │    System      │      │    System      │
  │  Integration   │      │  Integration   │      │  Integration   │
  └────────┬───────┘      └────────┬───────┘      └────────┬───────┘
           │                       │                       │
      [UC-ACM-201]            [UC-ACM-202]            [UC-ACM-203]
      (purchase posting)      (inventory posting)     (sales posting)
```

**Legend**:
- **Top Section**: Primary finance users (controllers, managers, accountants)
- **Middle Section**: Supporting actors (cost accountants, admins, auditors)
- **Bottom Section**: System actors (automated services, integrations, background jobs)

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **Chart of Accounts Management** | | | | | |
| UC-ACM-001 | Define Chart of Accounts Structure | Financial Controller | Critical | Complex | User |
| UC-ACM-002 | Add New GL Account | Finance Manager | Critical | Medium | User |
| UC-ACM-003 | Modify Existing Account | Finance Manager | High | Medium | User |
| UC-ACM-004 | Deactivate GL Account | Finance Manager | Medium | Medium | User |
| **Mapping Rule Management** | | | | | |
| UC-ACM-005 | Configure Transaction Mapping Rule | Finance Manager | Critical | Complex | User |
| UC-ACM-006 | Test Mapping Rule Against Transactions | Finance Manager | High | Medium | User |
| UC-ACM-007 | Review Unmapped Transactions | Accountant | Critical | Medium | User |
| UC-ACM-008 | Manually Post Journal Entry | Accountant | Critical | Medium | User |
| UC-ACM-009 | Configure Default Accounts by Transaction Type | Finance Manager | Critical | Medium | User |
| **Period & Reporting** | | | | | |
| UC-ACM-010 | Close Accounting Period | Financial Controller | Critical | Complex | User |
| UC-ACM-011 | Generate Trial Balance Report | Accountant | Critical | Simple | User |
| UC-ACM-012 | Generate Dimensional Cost Report | Cost Accountant | High | Medium | User |
| UC-ACM-013 | Configure Accounting Dimensions | System Admin | High | Medium | User |
| UC-ACM-014 | Export Audit Trail Report | External Auditor | Critical | Simple | User |
| UC-ACM-015 | Reconcile Account Balances | Accountant/Auditor | Critical | Complex | User |
| **Automated Posting** | | | | | |
| UC-ACM-101 | Auto-Generate Journal Entry from Transaction | Posting Engine | Critical | Complex | System |
| UC-ACM-102 | Evaluate Mapping Rules for Transaction | Mapping Rule Engine | Critical | Complex | System |
| UC-ACM-103 | Run Daily Account Reconciliation | Reconciliation Service | High | Medium | System |
| UC-ACM-104 | Post Multi-Currency Transaction | Posting Engine | High | Complex | System |
| UC-ACM-105 | Calculate Exchange Gain/Loss | Mapping Rule Engine | High | Complex | System |
| UC-ACM-106 | Execute Period-End Jobs | Period Close Service | Critical | Complex | System |
| **System Integration** | | | | | |
| UC-ACM-201 | Process Purchase Transaction Posting | Procurement Integration | Critical | Complex | Integration |
| UC-ACM-202 | Process Inventory Movement Posting | Inventory Integration | Critical | Complex | Integration |
| UC-ACM-203 | Process Sales Transaction Posting | Sales Integration | Critical | Complex | Integration |
| UC-ACM-204 | Retrieve Budget Data for Comparison | Budget Integration | Medium | Simple | Integration |

---

## Detailed Use Cases

### UC-ACM-001: Define Chart of Accounts Structure

**Actor**: Financial Controller / CFO

**Goal**: Establish a complete and compliant Chart of Accounts structure that supports all business operations and regulatory requirements.

**Priority**: Critical

**Complexity**: Complex

**Preconditions**:
- User is logged in as Financial Controller or CFO
- User has permission to configure Chart of Accounts
- Organization's accounting standards determined (IFRS/GAAP/Local)

**Main Flow**:
1. User navigates to Finance → Chart of Accounts → Structure Configuration
2. System displays COA configuration interface
3. User selects accounting standard (IFRS, GAAP, or Local standard)
4. System loads standard COA template for selected framework
5. User reviews template account structure:
   - Asset accounts (1000-1999)
   - Liability accounts (2000-2999)
   - Equity accounts (3000-3999)
   - Revenue accounts (4000-4999)
   - Expense accounts (5000-5999)
   - Cost of Goods Sold accounts (6000-6999)
6. User customizes structure for business needs:
   - Add industry-specific accounts (e.g., F&B cost accounts, rooms revenue)
   - Modify account codes to match organizational conventions
   - Define account hierarchy levels (Class → Group → Account → Sub-Account)
   - Set account naming conventions
7. User configures account code format:
   - Length: 4-10 characters
   - Type: Numeric, alphanumeric, or segmented
   - Separator: None, dash, dot
   - Example: 1100, 1-100, 1100.01
8. User defines mandatory dimensions for each account type
9. User sets up control accounts (AP, AR, Inventory, Cash)
10. User configures retained earnings account for year-end close
11. User reviews complete COA structure in tree view
12. System validates structure:
    - All mandatory account types present
    - Parent-child relationships valid
    - No duplicate account codes
    - All account types properly classified
13. User clicks "Activate Chart of Accounts"
14. System prompts for CFO approval (if user is not CFO)
15. System activates COA and enables account usage
16. System logs COA structure in audit trail
17. System displays success message: "Chart of Accounts activated successfully"

**Alternative Flows**:

**AF-001-1: Import COA from Template**
- At step 4, user selects "Import from Template"
- System displays template library (hospitality, retail, manufacturing)
- User selects hospitality template
- System imports pre-configured COA for hotel/restaurant operations
- Continue with step 6 for customization

**AF-001-2: Import COA from File**
- At step 4, user selects "Import from File"
- System displays file upload interface with format requirements
- User uploads Excel/CSV file with account data
- System validates file structure and data
- System imports accounts and builds hierarchy
- Continue with step 11 for review

**AF-001-3: Copy from Existing Organization**
- At step 3, user selects "Copy from Another Organization"
- System displays list of organizations in group
- User selects source organization
- System copies COA structure from source
- Continue with step 6 for customization

**Exception Flows**:

**EF-001-1: Validation Errors**
- At step 12, validation fails
- System displays list of validation errors with descriptions
- User corrects errors
- Return to step 11 for re-validation

**EF-001-2: Duplicate Account Codes**
- At step 12, system detects duplicate codes
- System highlights duplicate accounts in red
- System suggests next available codes
- User resolves duplicates
- Return to step 11

**EF-001-3: CFO Approval Required**
- At step 14, user is Finance Manager (not CFO)
- System sends approval request to CFO via email and system notification
- CFO reviews and approves COA structure
- System activates COA upon approval
- System notifies Finance Manager of activation

**Postconditions**:
- Chart of Accounts structure created and activated
- All accounts available for transaction posting
- Account hierarchy relationships established
- Audit trail entry created with complete structure
- Users can begin configuring mapping rules

**Business Rules**:
- BR-ACM-001: Account codes must be unique
- BR-ACM-002: Account hierarchy must be valid
- BR-ACM-004: Account types must be properly classified

---

### UC-ACM-002: Add New GL Account

**Actor**: Finance Manager

**Goal**: Create a new general ledger account to support new business requirements or transactions.

**Priority**: Critical

**Complexity**: Medium

**Preconditions**:
- User is logged in as Finance Manager
- Chart of Accounts structure exists and is active
- User has permission to manage GL accounts

**Main Flow**:
1. User navigates to Finance → Chart of Accounts → Accounts List
2. System displays hierarchical list of existing accounts
3. User clicks "Add New Account" button
4. System displays account creation form
5. User selects parent account from hierarchy tree (optional for top-level accounts)
6. User enters account code (e.g., 5150)
7. System validates account code:
   - Checks uniqueness within COA
   - Validates format against COA configuration
   - Verifies code fits within parent account range
8. User enters account name: "Marketing Expenses - Digital Media"
9. User enters account description: "Expenses for digital marketing campaigns including social media, search ads, and display advertising"
10. User selects account type from dropdown: Expense
11. User selects account category: Operating Expense
12. User selects account subcategory: Marketing & Advertising
13. User configures account properties:
    - Is Control Account: No
    - Is Bank Account: No
    - Is Tax Account: No
    - Allow Direct Posting: Yes (leaf account)
    - Requires Dimensions: Department, Cost Center
14. User sets account currency: Base currency (USD) or Multi-currency
15. User sets effective date: Today (account active immediately)
16. User adds tags for reporting: marketing, digital, variable_cost
17. User clicks "Save Account"
18. System validates all required fields populated
19. System checks business rules compliance
20. System creates account record in database
21. System logs account creation in audit trail
22. System returns to accounts list with new account visible
23. System displays success message: "Account 5150 - Marketing Expenses - Digital Media created successfully"

**Alternative Flows**:

**AF-002-1: Create Multiple Sub-Accounts in Batch**
- At step 3, user selects parent account and clicks "Add Sub-Accounts (Batch)"
- System displays batch entry grid
- User enters multiple sub-accounts:
  - 5151 - Social Media Advertising
  - 5152 - Search Engine Marketing
  - 5153 - Display Advertising
  - 5154 - Video Advertising
- System validates all accounts simultaneously
- System creates all accounts in single transaction
- System displays summary: "4 accounts created successfully"

**AF-002-2: Copy from Similar Account**
- At step 4, user clicks "Copy from Existing"
- System displays account search dialog
- User searches and selects similar account: "5140 - Print Advertising"
- System copies properties from selected account
- User modifies account code and name
- Continue with step 17 to save

**AF-002-3: Use Account Template**
- At step 4, system displays account templates based on account type selection
- User selects template: "Standard Expense Account"
- System pre-fills form with template defaults
- User modifies specific fields (code, name, dimensions)
- Continue with step 17 to save

**Exception Flows**:

**EF-002-1: Duplicate Account Code**
- At step 7, validation detects existing account with same code
- System displays error: "Account code 5150 already exists. Account: Marketing Expenses - Traditional Media. Please use a different code."
- System suggests next available codes: 5160, 5170
- User selects suggested code or enters different code
- Return to step 7 for re-validation

**EF-002-2: Invalid Account Code Format**
- At step 7, code doesn't match COA format rules
- System displays error: "Account code must be 4 digits in range 5000-5999 for Expense accounts"
- User corrects format
- Return to step 7

**EF-002-3: Required Fields Missing**
- At step 18, validation finds missing required fields
- System highlights missing fields in red
- System displays error summary: "Please complete all required fields: Account Type, Category"
- User completes required fields
- Return to step 17 to re-attempt save

**EF-002-4: Insufficient Permissions**
- At step 20, system checks user permissions
- User lacks permission to create accounts in this account range
- System displays error: "Insufficient permissions. Account creation in Expense range requires Financial Controller approval."
- System offers to submit account creation request for approval
- User submits request
- Finance Controller receives approval notification

**Postconditions**:
- New GL account created and active
- Account visible in COA hierarchy
- Account available for transaction posting immediately
- Audit trail entry created documenting account creation
- Account appears in account selection dropdowns

**Business Rules**:
- BR-ACM-001: Account code must be unique
- BR-ACM-002: Parent-child relationships must be valid
- BR-ACM-004: Account type cannot be changed after transactions exist

---

### UC-ACM-005: Configure Transaction Mapping Rule

**Actor**: Finance Manager

**Goal**: Create or modify automated mapping rules to assign GL accounts to operational transactions based on transaction attributes.

**Priority**: Critical

**Complexity**: Complex

**Preconditions**:
- User is logged in as Finance Manager
- Chart of Accounts exists with appropriate accounts
- Transaction types configured in system
- Master data exists (departments, locations, categories)

**Main Flow**:
1. User navigates to Finance → Account Mapping → Mapping Rules
2. System displays list of existing mapping rules with priority and status
3. User clicks "Create New Rule" button
4. System displays rule configuration form
5. User enters rule name: "F&B Ingredients Purchase Mapping"
6. User enters rule description: "Maps food ingredient purchases to appropriate COGS and AP accounts for F&B department"
7. User sets rule priority: 10 (high priority for specific rule)
8. User sets effective date range: Start = Today, End = (blank for no expiration)
9. User defines matching criteria using rule builder:
   - **Criterion 1**: Transaction Type = Purchase
   - **Criterion 2**: Document Type = Goods Received Note (GRN)
   - **Criterion 3**: Product Category = Food & Beverage
   - **Criterion 4**: Product Subcategory = Ingredients
   - **Criterion 5**: Department = Kitchen (optional for broader rule)
   - **Logic**: ALL criteria must match (AND operator)
10. User configures account assignments:
    - **Debit Account**: 5100 - Cost of Goods Sold - F&B
    - **Credit Account**: 2100 - Accounts Payable - Trade
    - **Tax Input Account**: 1150 - Input Tax Recoverable (if taxable)
11. User configures dimension mappings:
    - **Dimension 1 (Department)**: Source from transaction.department_id
    - **Dimension 2 (Location)**: Source from transaction.location_id
    - **Dimension 3 (Cost Center)**: Source from department.cost_center_id
    - **Dimension 4 (Project)**: Source from transaction.project_id (if present)
12. User defines conditional logic for variants:
    - IF product.is_imported = true THEN add Import Duty Account: 5110
    - IF vendor.payment_terms = 'Prepaid' THEN use Prepaid Expense Account: 1140
13. User configures posting rules:
    - **Posting Date**: Use transaction date
    - **Description Template**: "Purchase of {product_category} from {vendor_name} via {document_reference}"
    - **Exchange Rate**: Use transaction exchange rate
14. User clicks "Test Rule" button
15. System displays test dialog: "Test against historical transactions"
16. User selects test date range: Last 30 days
17. System queries recent GRN transactions matching criteria
18. System displays test results:
    - 45 transactions match rule criteria
    - Shows sample journal entries that would be generated
    - Highlights any validation warnings
19. User reviews test results and confirms mappings are correct
20. User clicks "Save and Activate Rule"
21. System validates rule configuration:
    - All required fields populated
    - No circular references in conditional logic
    - Referenced accounts exist and are active
    - Dimension sources valid
22. System checks for rule conflicts (same criteria, same priority)
23. If no conflicts, system saves rule with status = "Active"
24. System logs rule creation in audit trail
25. System displays success message: "Mapping rule activated successfully. Rule will apply to all new transactions effective immediately."
26. System re-evaluates rule priority order and updates rule execution sequence

**Alternative Flows**:

**AF-005-1: Copy from Existing Rule**
- At step 3, user selects existing rule and clicks "Copy Rule"
- System creates duplicate with " - Copy" appended to name
- System sets status to "Draft"
- User modifies criteria and accounts as needed
- Continue with step 14 to test

**AF-005-2: Create Rule from Transaction Exception**
- User navigates from unmapped transaction review (UC-ACM-007)
- System pre-fills criteria based on transaction attributes
- User reviews and adjusts criteria to create general rule
- Continue with step 10 to configure accounts

**AF-005-3: Use Rule Template**
- At step 4, user selects "Use Template"
- System displays template library: Purchase Mapping, Inventory Mapping, Sales Mapping
- User selects "Purchase Mapping - Standard"
- System pre-fills standard purchase mapping structure
- User customizes for specific category
- Continue with step 9

**AF-005-4: Configure Multi-Step Rule (Accrual)**
- At step 10, user enables "Multi-Step Posting"
- System displays accrual configuration:
  - **Step 1 (On GRN)**: Debit Inventory, Credit GRN Clearing Account
  - **Step 2 (On Invoice)**: Debit GRN Clearing, Credit Accounts Payable
- User configures each step's accounts and conditions
- System validates both steps
- Continue with step 14

**Exception Flows**:

**EF-005-1: Rule Priority Conflict**
- At step 22, system detects another rule with same priority and overlapping criteria
- System displays warning: "Rule conflict detected with Rule #23 'All F&B Purchases' (Priority 10)"
- System suggests: "Increase this rule's priority to 5 to ensure it evaluates first, or change conflicting rule to lower priority"
- User adjusts priority to 5 (higher priority = lower number)
- System re-validates
- Continue with step 23

**EF-005-2: Invalid Account Reference**
- At step 21, system detects referenced account is inactive
- System displays error: "Debit account 5100 is currently inactive. Please select active account or reactivate account 5100."
- User searches for alternative active account: 5105 - COGS - F&B - Alternative
- User updates account assignment
- Return to step 20 to re-attempt save

**EF-005-3: Missing Dimension Mapping**
- At step 21, validation finds required dimension not mapped
- System displays error: "Cost Center (Dimension 3) is required for expense accounts but no mapping defined"
- User adds dimension mapping: Source from department.default_cost_center_id
- Return to step 20

**EF-005-4: Test Results Show Errors**
- At step 18, test reveals issues with 5 of 45 transactions
- System highlights problematic transactions: "5 transactions would fail posting due to missing dimension data"
- User reviews error details: Some transactions missing department assignment
- User modifies rule to add fallback: "If department is null, use 'UNASSIGNED' department"
- User re-tests rule
- Return to step 16

**EF-005-5: Circular Reference in Logic**
- At step 21, system detects circular reference in conditional logic
- System displays error: "Circular reference detected: Condition A depends on Condition B which depends on Condition A"
- User restructures conditional logic to remove circular dependency
- Return to step 20

**Postconditions**:
- Mapping rule saved and activated
- Rule appears in priority-ordered rule list
- Rule engine will evaluate rule for all new matching transactions
- Test results documented for audit purposes
- Audit trail entry created with complete rule configuration

**Business Rules**:
- BR-ACM-005: Higher priority rules evaluate first
- BR-ACM-006: Both debit and credit accounts required
- BR-ACM-007: Rule changes apply to future transactions only
- BR-ACM-008: All required dimensions must be mapped

---

### UC-ACM-008: Manually Post Journal Entry

**Actor**: Accountant

**Goal**: Create and post a manual journal entry for transactions that cannot be automatically mapped or for adjusting entries.

**Priority**: Critical

**Complexity**: Medium

**Preconditions**:
- User is logged in as Accountant
- User has permission to post manual journal entries
- Accounting period is open for the posting date
- Chart of Accounts configured with active accounts

**Main Flow**:
1. User navigates to Finance → Journal Entries → Create Manual Entry
2. System displays manual journal entry form
3. User enters journal entry header information:
   - **Entry Date**: 2025-11-12 (transaction date)
   - **Posting Date**: 2025-11-12 (GL posting date)
   - **Reference Number**: Auto-generated JE-2501-001234
   - **Description**: "Accrual for November utilities - electricity and water"
   - **Source**: Manual Entry
4. User adds first journal entry line (debit):
   - **Line #**: 1
   - **Account**: 5300 - Utilities Expense
     - User searches account: types "utilities"
     - System displays matching accounts
     - User selects 5300
   - **Debit Amount**: $2,500.00
   - **Credit Amount**: $0.00
   - **Department**: Facilities
   - **Location**: Main Property
   - **Cost Center**: FACILITIES-OPS
   - **Line Description**: "Electricity expense for November 2025"
5. System validates line:
   - Account exists and is active
   - Account allows direct posting (is leaf account)
   - All required dimensions populated
   - Amount is positive
6. User adds second journal entry line (debit):
   - **Line #**: 2
   - **Account**: 5300 - Utilities Expense
   - **Debit Amount**: $800.00
   - **Credit Amount**: $0.00
   - **Department**: Facilities
   - **Location**: Main Property
   - **Cost Center**: FACILITIES-OPS
   - **Line Description**: "Water expense for November 2025"
7. User adds third journal entry line (credit):
   - **Line #**: 3
   - **Account**: 2300 - Accrued Expenses
   - **Debit Amount**: $0.00
   - **Credit Amount**: $3,300.00
   - **Department**: Facilities
   - **Location**: Main Property
   - **Cost Center**: FACILITIES-OPS
   - **Line Description**: "Accrual for utility bills pending receipt"
8. System calculates running totals:
   - **Total Debits**: $3,300.00
   - **Total Credits**: $3,300.00
   - **Balance**: $0.00 ✓ (Balanced)
9. System displays balance indicator: Green checkmark with "Entry is balanced"
10. User attaches supporting documents:
    - Utility bill estimate PDF
    - Email from vendor with amount
11. User adds internal notes: "Based on average usage. Will reverse upon actual bill receipt."
12. User reviews complete entry for accuracy
13. User clicks "Post Journal Entry"
14. System performs final validation:
    - Entry is balanced (debits = credits)
    - Posting date is within open period
    - All accounts valid and active
    - All required dimensions present
    - User has posting authority for this amount
15. System checks if approval required:
    - Entry amount: $3,300
    - User posting limit: $5,000
    - Approval required: No (within limit)
16. System generates unique journal entry ID: JE-2501-001234
17. System posts entry to general ledger:
    - Updates account balances
    - Creates GL transaction records
    - Links to source documents
18. System records audit trail:
    - User who posted
    - Timestamp (precise to second)
    - IP address
    - Entry details (before/after state)
19. System sends confirmation email to user
20. System displays success message: "Journal entry JE-2501-001234 posted successfully"
21. System navigates to journal entry detail view showing posted entry
22. System updates account balances immediately in reports

**Alternative Flows**:

**AF-008-1: Use Recurring Entry Template**
- At step 2, user clicks "Use Template"
- System displays saved templates: Monthly Depreciation, Rent Accrual, Interest Accrual
- User selects "Monthly Utilities Accrual"
- System loads template with pre-filled accounts and descriptions
- User updates amounts and date for current period
- Continue with step 12 to review

**AF-008-2: Reverse Previous Entry**
- User navigates to posted journal entry to reverse
- User clicks "Reverse Entry" button
- System creates new entry with:
  - All debits and credits swapped
  - Reference to original entry
  - Description prefixed with "Reversal of JE-2501-001234: "
- User confirms reversal
- System posts reversing entry
- Both original and reversal entries linked in audit trail

**AF-008-3: Copy from Previous Entry**
- At step 2, user clicks "Copy from Recent Entry"
- System displays last 20 manual entries by user
- User selects similar entry
- System copies accounts, dimensions, and structure
- User updates amounts and descriptions
- Continue with step 12

**AF-008-4: Multi-Currency Entry**
- At step 4, user selects Currency: EUR (not base currency USD)
- User enters amounts in EUR
- System prompts for exchange rate: 1.0850
- User enters exchange rate or accepts system rate
- System calculates base currency equivalents:
  - EUR 2,000 × 1.0850 = USD 2,170
- System displays both currencies on each line
- System posts to GL in base currency (USD)
- Foreign currency amounts stored for reference

**Exception Flows**:

**EF-008-1: Entry Not Balanced**
- At step 14, validation finds total debits ≠ total credits
- System displays error: "Entry is out of balance. Difference: $100.00 (Debits exceed Credits)"
- System highlights balance indicator in red
- User reviews and corrects line amounts
- Return to step 13 to re-attempt posting

**EF-008-2: Posting to Closed Period**
- At step 14, system detects posting date in closed period
- System displays error: "Cannot post to October 2025 period. Period status: Closed on 2025-11-05."
- System offers alternatives:
  - Change posting date to current open period (November)
  - Request period reopening from Financial Controller
- User changes posting date to November 1, 2025
- Return to step 13

**EF-008-3: Approval Required**
- At step 15, entry amount $12,500 exceeds user limit $5,000
- System displays: "This entry requires approval. Amount: $12,500 exceeds your posting limit: $5,000"
- System saves entry with status: "Pending Approval"
- System sends approval request to Finance Manager
- Finance Manager reviews and approves
- System posts entry automatically upon approval
- User receives notification of approval and posting

**EF-008-4: Invalid Account Selection**
- At step 5, user selects parent account that doesn't allow direct posting
- System displays error: "Account 5000 - Operating Expenses is a parent account and does not allow direct posting. Please select a sub-account."
- System displays child accounts: 5100, 5200, 5300
- User selects appropriate sub-account
- Return to step 5

**EF-008-5: Missing Required Dimension**
- At step 5, user leaves Cost Center blank
- At step 14, validation fails
- System displays error: "Cost Center (Dimension 3) is required for expense account 5300"
- System highlights missing dimension field in red
- User selects cost center: FACILITIES-OPS
- Return to step 13

**Postconditions**:
- Journal entry posted to general ledger
- Account balances updated in real-time
- Entry visible in GL reports immediately
- Audit trail entry created with full details
- Supporting documents linked to entry
- Balance verification passed (debits = credits)

**Business Rules**:
- BR-ACM-009: Entry must be balanced (debits = credits)
- BR-ACM-010: Cannot post to closed periods
- BR-ACM-011: Entries above threshold require approval
- BR-ACM-012: Posted entries cannot be modified (reversal only)

---

### UC-ACM-010: Close Accounting Period

**Actor**: Financial Controller / CFO

**Goal**: Close an accounting period to finalize all transactions and prevent further modifications, ensuring financial statement integrity.

**Priority**: Critical

**Complexity**: Complex

**Preconditions**:
- User is logged in as Financial Controller or CFO
- User has period close permissions
- All prior periods are closed (must close sequentially)
- Target period has transactions to close

**Main Flow**:
1. User navigates to Finance → Period Management → Close Period
2. System displays period close wizard
3. System shows current period status:
   - **Current Period**: November 2025
   - **Period Status**: Open
   - **Period Start**: 2025-11-01
   - **Period End**: 2025-11-30
   - **Transactions**: 1,247 transactions posted
4. User clicks "Start Period Close Process"
5. System runs **Pre-Close Validation Checks** (Phase 1):
   - ✓ All source documents posted (no pending journals)
   - ✓ Bank reconciliations completed and signed off (3 bank accounts)
   - ✓ Inventory reconciliation completed (variance: $45 < $100 threshold)
   - ✓ Accounts Payable reconciliation completed (variance: $0)
   - ✓ Accounts Receivable reconciliation completed (variance: $15 < $100 threshold)
   - ✓ Inter-company transactions reconciled (all balanced)
   - ✗ 2 unmapped transactions pending review
   - ✗ 1 manual journal entry pending approval
   - ⚠ Accrued expenses review pending (recommended but not required)
6. System displays validation results with failure reasons:
   - **Critical**: 2 unmapped transactions must be resolved
   - **Critical**: 1 manual entry must be approved or rejected
   - **Warning**: Accrued expenses review recommended before close
7. User clicks "View Unmapped Transactions"
8. System displays 2 unmapped transactions:
   - Transaction 1: Stock adjustment from physical count
   - Transaction 2: Bank charge from statement import
9. User maps both transactions using manual account assignment
10. User returns to period close wizard
11. User clicks "View Pending Approval"
12. System displays pending manual entry: Depreciation accrual $5,000
13. User reviews and approves manual entry
14. User returns to period close wizard
15. User clicks "Re-Run Validation"
16. System re-runs all validation checks
17. System displays: "✓ All validation checks passed. Ready to proceed with close."
18. User clicks "Generate Period-End Reports" (Phase 2)
19. System generates and displays reports:
    - Trial Balance (detailed by account)
    - Profit & Loss Statement
    - Balance Sheet
    - Cash Flow Statement
    - Account Activity Report
    - Variance Analysis (Actual vs Budget)
    - Dimensional Analysis (by Department, Cost Center)
20. User reviews reports for accuracy and completeness
21. User downloads reports as PDF for records
22. User clicks "Proceed to Adjusting Entries" (Phase 3)
23. System displays: "Ready to post adjusting entries. Click 'Skip' if no adjustments needed."
24. User selects "Post Adjusting Entries"
25. User posts final adjusting entries:
    - Depreciation for the month
    - Accruals for unpaid expenses
    - Prepayment adjustments
    - Bad debt provisions
26. System validates and posts adjusting entries
27. User clicks "Generate Final Trial Balance"
28. System regenerates trial balance with adjustments included
29. User reviews final trial balance: Total Debits = $5,245,678.90, Total Credits = $5,245,678.90 ✓
30. User clicks "Soft Close Period" (Phase 4)
31. System performs soft close:
    - Sets period status to "Soft Closed"
    - Prevents regular users from posting to period
    - Allows Financial Controller to post corrections with approval
32. System logs soft close action in audit trail
33. System displays: "Period soft closed. Management review required before hard close."
34. Financial Controller sends reports to management for review
35. Management reviews financial statements (may take 1-3 days)
36. After management approval, user returns to period close wizard
37. User clicks "Final Hard Close" (Phase 5)
38. System prompts: "This action will permanently close November 2025 and prevent all further changes. Continue?"
39. User confirms: "Yes, Hard Close Period"
40. System performs hard close:
    - Sets period status to "Closed"
    - Prevents all users (including Financial Controller) from posting
    - Updates current period to December 2025
    - Opens December 2025 for posting
41. System logs hard close action with timestamp and user
42. System archives period-end reports
43. System sends confirmation emails to finance team
44. System displays success message: "November 2025 period closed successfully. December 2025 is now the active period."

**Alternative Flows**:

**AF-010-1: Month-End Close (Regular)**
- Standard monthly close following steps 1-44
- Soft close on 1st business day of next month
- Hard close after management review (typically 2-3 days)

**AF-010-2: Quarter-End Close**
- At step 22, user selects "Quarter-End Close"
- System includes additional validation:
  - Tax return preparation status
  - Regulatory filing requirements
  - Dividend calculations (if applicable)
- Additional reports generated:
  - Quarterly financial statements
  - Tax worksheets
  - Comparative analysis (QoQ, YoY)
- Continue with step 30

**AF-010-3: Year-End Close**
- At step 22, user selects "Year-End Close"
- System includes year-end specific tasks:
  - **Retained Earnings Transfer**: Transfer all P&L account balances to retained earnings account
  - **Opening Balance Generation**: Create opening balances for new fiscal year
  - **Tax Closing Entries**: Provision for income tax
  - **Audit Workpapers**: Generate audit trail exports
- System prompts: "External audit required. Continue close after audit sign-off?"
- User waits for external auditor to complete audit
- External auditor signs off financial statements
- User uploads signed audit report
- System completes year-end close
- System creates new fiscal year 2026 with opening balances
- Continue with step 40

**AF-010-4: Close Multiple Periods (Catch-Up)**
- At step 3, system detects multiple open periods (October and November)
- System displays: "2 periods are open. Periods must be closed sequentially."
- System highlights October as next period to close
- User closes October first following full process
- System then allows November close
- User closes November
- System enforces sequential closing rule

**Exception Flows**:

**EF-010-1: Validation Failures Cannot Be Resolved**
- At step 6, critical validation failures detected
- User cannot resolve issues (e.g., external system unavailable for reconciliation)
- User clicks "Cancel Period Close"
- System maintains period status as "Open"
- User resolves issues and retries close later

**EF-010-2: Unmapped Transactions During Close**
- At step 6, 25 unmapped transactions detected
- Too many to resolve manually during close window
- User clicks "Bulk Map Transactions"
- System displays bulk mapping interface
- User creates mapping rule for transaction pattern
- System applies rule to all matching transactions
- User re-runs validation
- Return to step 16

**EF-010-3: Significant Variance Detected**
- At step 20, user notices significant variance in inventory account
- Variance: $15,000 (15% of inventory value)
- User clicks "Investigate Variance"
- User runs detailed inventory reconciliation report
- User identifies cause: Physical count not fully processed
- User processes remaining physical count adjustments
- User regenerates trial balance
- Return to step 20

**EF-010-4: Period Reopen Required**
- Period previously hard closed
- Material error discovered in closed period
- User clicks "Request Period Reopen"
- System displays reopen request form
- User enters reason: "Vendor invoice received late, dated November 25"
- User attaches supporting documentation
- System sends reopen request to CFO
- CFO reviews and approves
- System reopens period with status "Reopened - Closing"
- User posts correction entries
- User re-closes period following standard process
- System logs reopen and re-close in audit trail

**EF-010-5: Adjusting Entry Fails Posting**
- At step 26, adjusting entry fails due to closed sub-ledger
- System displays error: "Cannot post to Inventory sub-ledger. Inventory period already closed."
- User coordinates with Inventory Manager to reopen inventory period
- Inventory Manager reopens inventory period temporarily
- User re-posts adjusting entry
- Inventory Manager re-closes inventory period
- Return to step 27

**Postconditions**:
- Accounting period status changed to "Closed"
- All financial statements finalized for the period
- No further transactions can be posted to closed period
- Current period advanced to next period
- Audit trail complete with close process documentation
- Period-end reports archived
- Finance team notified of close completion

**Business Rules**:
- BR-ACM-013: Periods must be closed sequentially
- BR-ACM-014: Period reopen requires CFO approval
- BR-ACM-015: Year-end close transfers P&L to retained earnings

---

## System Use Cases

### UC-ACM-101: Auto-Generate Journal Entry from Transaction

**Actor**: Posting Engine (Automated Service)

**Goal**: Automatically generate balanced journal entry from operational transaction using configured mapping rules.

**Priority**: Critical

**Complexity**: Complex

**Trigger**:
- Operational transaction posted in source system (Procurement, Inventory, Sales)
- Transaction status changed to "Posted" or "Completed"
- Transaction event published to message queue

**Main Flow**:
1. Posting Engine receives transaction event from message queue
2. System retrieves complete transaction data:
   - Transaction ID, type, document type
   - Transaction date, posting date
   - Amount, currency, exchange rate
   - Department, location, vendor/customer
   - Line items with products, quantities, prices
   - Tax information
3. System validates transaction is ready for posting:
   - Status = Posted
   - Not already posted to GL (check for existing journal entry link)
   - Posting date within open period
   - All required data present
4. System calls Mapping Rule Engine (UC-ACM-102) to determine GL accounts
5. Mapping Rule Engine returns account assignments with dimensions
6. System constructs journal entry:
   - **Entry ID**: Auto-generated JE-2501-001235
   - **Posting Date**: Transaction posting date
   - **Source**: Procurement System - GRN-2501-000123
   - **Description**: Auto-generated from transaction data
   - **Lines**: Created per mapping rule response
7. For each line item in transaction:
   - Create debit line: Inventory account with item amount
   - Set dimensions: Department, Location, Cost Center from mapping
   - Create credit line: Accounts Payable with item amount
   - Link line to source transaction line
8. System handles tax posting:
   - Create separate line for input tax recoverable
   - Amount = tax amount from transaction
   - Account from mapping rule tax configuration
9. System validates complete journal entry:
   - Total debits = Total credits (balanced)
   - All required dimensions populated
   - All accounts exist and are active
   - No circular references
10. System applies multi-currency handling if applicable:
    - Record transaction currency and amount
    - Calculate base currency amount using exchange rate
    - Both currencies stored for audit
11. System performs optimistic locking check:
    - Verify transaction not processed by concurrent request
    - Check transaction version number
12. System posts journal entry to general ledger:
    - Insert journal entry header
    - Insert all journal entry lines
    - Update account balances atomically
13. System links journal entry back to source transaction:
    - Update transaction with journal_entry_id
    - Create bidirectional reference
14. System updates posting metrics:
    - Increment successful posting counter
    - Record posting duration
    - Update mapping rule effectiveness metrics
15. System logs posting in audit trail:
    - Source transaction reference
    - Generated journal entry
    - User/system who triggered
    - Timestamp
16. System publishes "Journal Entry Posted" event to message queue
17. System sends posting confirmation to source system
18. Downstream systems receive event and react:
    - Budget system: Confirm budget commitment
    - Reporting engine: Update real-time dashboards
    - Notification service: Alert finance team if high-value

**Alternative Flows**:

**AF-101-1: Batch Posting Mode**
- Multiple transactions received in batch (e.g., 1,000 inventory movements)
- System groups transactions by similarity
- System creates consolidated journal entries where appropriate
- System posts all entries in single database transaction for atomicity
- Significant performance improvement for high-volume operations

**AF-101-2: Multi-Step Posting (Accrual Basis)**
- Transaction type requires multi-step posting (e.g., GRN before invoice)
- At step 6, system determines this is Step 1 of 2-step posting
- System posts to clearing account:
  - Debit: Inventory
  - Credit: GRN Clearing Account (2500)
- System flags transaction for Step 2 posting upon invoice receipt
- When invoice received, system posts Step 2:
  - Debit: GRN Clearing Account (2500)
  - Credit: Accounts Payable (2100)

**AF-101-3: Partial Posting (Split Entry)**
- Transaction spans multiple cost centers or projects
- System creates split entry based on allocation rules
- Example: Purchase for 2 departments (60% Kitchen, 40% Restaurant)
  - Line 1: Debit 5100 - $600 - Department: Kitchen
  - Line 2: Debit 5100 - $400 - Department: Restaurant
  - Line 3: Credit 2100 - $1,000 - Vendor payable

**Exception Flows**:

**EF-101-1: No Matching Mapping Rule**
- At step 5, Mapping Rule Engine returns no matching rule
- System uses default accounts for transaction type
- System posts entry with default accounts
- System flags entry as "Default Mapping Used"
- System creates exception record for finance review
- System sends alert to Finance Manager: "Transaction {ID} posted with default mapping. Review recommended."
- Finance Manager reviews and either approves or creates specific mapping rule

**EF-101-2: Journal Entry Validation Fails (Unbalanced)**
- At step 9, total debits ($1,000) ≠ total credits ($995)
- Rounding difference: $5
- System creates rounding adjustment line:
  - Credit: 9999 - Rounding Difference Account - $5
- System re-validates: Now balanced
- System posts with rounding line included
- If rounding > $1, system alerts Finance Manager

**EF-101-3: Posting to Closed Period**
- At step 3, validation detects posting date in closed period
- System rejects posting with error
- System sends transaction back to source system with status "GL Posting Failed - Closed Period"
- Source system displays error to user
- User updates posting date to current open period
- Source system retries posting
- System successfully posts with updated date

**EF-101-4: Database Constraint Violation**
- At step 12, database insert fails due to constraint violation
- System catches exception
- System rolls back transaction (no partial posting)
- System logs error details
- System retries posting with exponential backoff (3 attempts)
- If all retries fail, system moves transaction to error queue
- System sends alert to System Administrator
- Manual intervention required

**EF-101-5: Concurrent Posting Conflict**
- At step 11, optimistic locking detects concurrent modification
- Another process already posted this transaction
- System abandons posting to prevent duplicate
- System logs duplicate attempt in audit trail
- No error notification (expected behavior for concurrent systems)

**EF-101-6: Account Inactive or Deleted**
- At step 9, validation finds mapped account is inactive
- System cannot post to inactive account
- System checks for alternative active account in account mapping
- If found, uses alternative account
- If not found, rejects posting
- System creates exception record
- System alerts Finance Manager to reactivate account or update mapping rule

**Postconditions**:
- Journal entry posted to general ledger successfully
- Account balances updated accurately
- Source transaction linked to journal entry
- Audit trail complete
- Posting metrics updated
- Downstream systems notified
- Finance team alerted if exceptions occurred

**Performance Requirements**:
- Single transaction posting: <1 second
- Batch posting: 1,000 transactions per minute
- Retry mechanism: 3 attempts with exponential backoff
- Error rate: <0.5% of transactions fail posting

**Business Rules**:
- BR-ACM-009: Journal entries must be balanced
- BR-ACM-010: Cannot post to closed periods
- Transaction posted only once (idempotent operation)

---

## Integration Use Cases

### UC-ACM-201: Process Purchase Transaction Posting

**Actor**: Procurement System Integration

**Goal**: Post GL journal entries for procurement transactions (GRNs, invoices, payments) with proper inventory and AP account assignment.

**Priority**: Critical

**Complexity**: Complex

**Trigger**:
- GRN posted in procurement system
- Purchase invoice approved
- Vendor payment processed

**Main Flow** (GRN Posting):
1. User posts Goods Received Note (GRN) in procurement system
2. Procurement system validates GRN data:
   - All items received and quality checked
   - Quantities and prices confirmed
   - Vendor and PO information complete
3. Procurement system changes GRN status to "Posted"
4. Procurement system publishes event: "GRN Posted" to message queue
5. Event includes payload:
   ```json
   {
     "event_type": "grn_posted",
     "grn_id": "GRN-2501-000123",
     "vendor_id": "VEN-12345",
     "po_id": "PO-2501-00789",
     "posting_date": "2025-11-12",
     "total_amount": 5000.00,
     "currency": "USD",
     "department_id": "KITCHEN-01",
     "location_id": "LOC-MAIN",
     "line_items": [
       {
         "product_id": "PROD-4567",
         "category": "Food & Beverage",
         "subcategory": "Vegetables",
         "quantity": 100,
         "unit_price": 50.00,
         "amount": 5000.00
       }
     ]
   }
   ```
6. Posting Engine receives event from queue
7. Posting Engine retrieves additional data:
   - Vendor payment terms and account details
   - Product category and accounting classification
   - Department cost center mapping
   - Current exchange rate (if foreign currency)
8. Posting Engine calls Mapping Rule Engine with criteria:
   - Transaction type: Purchase
   - Document type: GRN
   - Category: Food & Beverage
   - Subcategory: Vegetables
   - Department: KITCHEN-01
9. Mapping Rule Engine evaluates rules in priority order:
   - Rule #10 matches: "F&B Ingredients Purchase Mapping"
   - Returns accounts:
     * Debit: 1230 - Inventory - Raw Materials - F&B
     * Credit: 2100 - Accounts Payable - Trade
     * Tax Input: 1150 - Input Tax Recoverable
10. Posting Engine constructs journal entry JE-2501-001235:
    ```
    Line 1: Debit  1230 Inventory-Raw Materials  $5,000.00  Dept:KITCHEN-01  Loc:LOC-MAIN  CC:FOOD-COST
    Line 2: Credit 2100 Accounts Payable          $5,000.00  Dept:KITCHEN-01  Vendor:VEN-12345
    Total Debits:  $5,000.00
    Total Credits: $5,000.00
    Balanced: ✓
    ```
11. Posting Engine validates journal entry (UC-ACM-101 steps 9-10)
12. Posting Engine posts to general ledger
13. GL account balances updated:
    - 1230 Inventory increased by $5,000
    - 2100 AP increased by $5,000
14. Posting Engine links journal entry to GRN:
    - Updates GRN with journal_entry_id
    - Creates audit trail link
15. Posting Engine publishes "Journal Entry Posted" event
16. Inventory System receives event:
    - Updates inventory valuation
    - Confirms goods financially received
17. Budget System receives event:
    - Converts soft commitment to hard commitment
    - Updates available budget balance
18. Procurement System receives confirmation:
    - Updates GRN status to "Posted to GL"
    - Displays journal entry reference to user
19. Vendor ledger updated:
    - Outstanding payable: $5,000
    - Payment due date calculated from terms
20. Reporting Engine updates dashboards:
    - Real-time inventory value
    - Accounts payable aging

**Alternative Flows**:

**AF-201-1: Purchase Invoice Posting (3-Way Match)**
- Invoice received and matched to GRN and PO
- System validates 3-way match:
  * PO quantities vs GRN quantities vs Invoice quantities
  * Price variances within tolerance (typically ±5%)
- If GRN already posted to clearing account:
  - Debit: 2500 GRN Clearing Account
  - Credit: 2100 Accounts Payable
  - Variance lines if price differences
- If GRN not yet posted (invoice-first scenario):
  - Debit: 1230 Inventory
  - Credit: 2100 Accounts Payable
- System links invoice to GRN and PO in audit trail

**AF-201-2: Vendor Payment Posting**
- Payment processed in AP system
- Journal entry created:
  - Debit: 2100 Accounts Payable - $5,000
  - Credit: 1110 Bank Account - Operating - $5,000
- Bank account balance decreased
- Vendor outstanding balance cleared
- Payment recorded in cash flow statement

**AF-201-3: Purchase Return Posting**
- Goods returned to vendor
- Return document created and posted
- Journal entry reverses original GRN posting:
  - Debit: 2100 Accounts Payable
  - Credit: 1230 Inventory
- Inventory quantity and value decreased
- Vendor payable reduced or refund expected

**Exception Flows**:

**EF-201-1: Price Variance Exceeds Tolerance**
- Invoice price $5,250 vs GRN price $5,000 (variance: $250 or 5%)
- System creates variance line:
  - Debit: 6300 Purchase Price Variance - $250
  - Credit: 2100 Accounts Payable - $5,250 (total)
- Finance Manager notified of significant variance
- Variance investigated and approved/rejected

**EF-201-2: Quantity Variance (Short Delivery)**
- GRN quantity: 80 units (ordered 100)
- System posts for actual received quantity:
  - Value: 80 units × $50 = $4,000
  - PO remains open for remaining 20 units
- Vendor payable: $4,000 (not $5,000)

**EF-201-3: Foreign Currency Purchase**
- GRN in EUR 4,500 at rate 1.0850 = USD 4,882.50
- System posts:
  - Debit: 1230 Inventory - $4,882.50 (base currency)
  - Credit: 2100 AP - $4,882.50 (base currency)
  - Foreign currency stored: EUR 4,500
  - Exchange rate recorded: 1.0850
- At payment time, if rate changed to 1.1000:
  - Payment amount: EUR 4,500 × 1.1000 = USD 4,950
  - Exchange loss: $4,950 - $4,882.50 = $67.50
  - Loss posted to: 8200 Foreign Exchange Loss

**Postconditions**:
- Purchase transaction posted to GL accurately
- Inventory value updated in real-time
- Vendor payable recorded correctly
- All related systems synchronized
- Financial statements reflect transaction
- Complete audit trail from PO → GRN → Invoice → Payment

---

## Use Case Traceability Matrix

| Functional Requirement | Related Use Cases |
|------------------------|-------------------|
| FR-ACM-001: Chart of Accounts Management | UC-ACM-001, UC-ACM-002, UC-ACM-003, UC-ACM-004 |
| FR-ACM-002: Mapping Rule Configuration | UC-ACM-005, UC-ACM-006, UC-ACM-009, UC-ACM-102 |
| FR-ACM-003: Multi-Dimensional Accounting | UC-ACM-012, UC-ACM-013 |
| FR-ACM-004: Transaction Type Configuration | UC-ACM-009, UC-ACM-102 |
| FR-ACM-005: Automated Journal Entry Generation | UC-ACM-101, UC-ACM-104, UC-ACM-201, UC-ACM-202, UC-ACM-203 |
| FR-ACM-006: Account Reconciliation Support | UC-ACM-015, UC-ACM-103 |
| FR-ACM-007: Period Management | UC-ACM-010, UC-ACM-106 |
| FR-ACM-008: Exception Handling | UC-ACM-007, UC-ACM-008 |
| FR-ACM-009: Reporting and Analysis | UC-ACM-011, UC-ACM-012, UC-ACM-014 |
| FR-ACM-010: Audit Trail | UC-ACM-014, All UC-ACM-1xx, All UC-ACM-2xx |

---

**Document Control**:
- **Created**: 2025-11-12
- **Author**: Carmen ERP Documentation Team
- **Reviewed By**: Financial Controller, Finance Manager, System Architect
- **Approved By**: CFO, Technical Lead
- **Next Review**: 2025-12-12
