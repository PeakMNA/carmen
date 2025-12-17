# Flow Diagrams: Account Code Mapping

## Module Information
- **Module**: Finance
- **Sub-Module**: Account Code Mapping
- **Version**: 1.0.0
- **Last Updated**: 2025-11-12
- **Owner**: Finance & Accounting Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |

---

## Overview

This document provides comprehensive visual representations of the Account Code Mapping module's workflows, data flows, and integrations. The diagrams cover the complete financial posting lifecycle from Chart of Accounts setup through automated journal entry generation, manual posting, period closing, and financial reporting. These flows support the business objectives of automated financial posting, multi-dimensional accounting, and period-based financial management.

**Related Documents**:
- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Data Schema](./DS-account-code-mapping.md)
- [Validations](./VAL-account-code-mapping.md)

---

## Diagram Index

| Diagram | Type | Purpose | Complexity |
|---------|------|---------|------------|
| [High-Level Process Flow](#high-level-process-flow) | Process | Complete financial posting lifecycle | Medium |
| [Automated Posting Flow](#automated-journal-entry-generation-flow) | Process | Auto-generate JE from transactions | High |
| [Manual Posting Flow](#manual-journal-entry-posting-flow) | Process | Manual JE creation and posting | Medium |
| [Mapping Rule Evaluation](#mapping-rule-evaluation-flow) | Process | Rule matching algorithm | High |
| [Period Close Process](#period-close-process-flow) | Process | Month/quarter/year-end close | High |
| [Data Flow Diagram](#data-flow-diagram) | Data | Data movement through system | Medium |
| [Sequence Diagrams](#sequence-diagrams) | Interaction | Component interactions | High |
| [State Diagrams](#state-diagrams) | State | Status transitions | Medium |
| [Integration Flows](#integration-flows) | Integration | External system interactions | High |
| [Reconciliation Flow](#account-reconciliation-flow) | Process | GL to sub-ledger reconciliation | Medium |

---

## Process Flows

### High-Level Process Flow

**Purpose**: End-to-end financial management process from COA setup through reporting

**Actors**: CFO, Controller, Accountant, Posting Engine, External Systems

**Trigger**: Organization setup or fiscal period operations

```mermaid
flowchart TD
    Start([Setup Phase]) --> COA[Configure Chart of Accounts]
    COA --> Accounts[Create GL Accounts]
    Accounts --> Dims[Define Dimensions]
    Dims --> Rules[Configure Mapping Rules]

    Rules --> Operations([Operational Phase])
    Operations --> Trans[Operational Transactions]
    Trans --> Auto{Auto-Post<br>Enabled?}

    Auto -->|Yes| Engine[Posting Engine]
    Engine --> Eval[Evaluate Mapping Rules]
    Eval --> Generate[Generate Journal Entry]
    Generate --> Post1[Post to GL]

    Auto -->|No| Manual[Manual Journal Entry]
    Manual --> Validate[Validate Balanced Entry]
    Validate --> Auth{Approval<br>Required?}
    Auth -->|Yes| Approve[Route for Approval]
    Approve --> Approved{Approved?}
    Approved -->|No| Rejected([End: Rejected])
    Approved -->|Yes| Post2[Post to GL]
    Auth -->|No| Post2

    Post1 --> Balance[(Update Account Balances)]
    Post2 --> Balance
    Balance --> Reporting([Reporting Phase])

    Reporting --> TB[Generate Trial Balance]
    TB --> FS[Financial Statements]
    FS --> Close{Period<br>Close?}

    Close -->|Yes| PeriodClose[Execute Period Close]
    PeriodClose --> Lock[Lock Period]
    Lock --> NextPeriod[Open Next Period]
    NextPeriod --> Operations

    Close -->|No| Operations

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Operations fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Reporting fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Post1 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Post2 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Rejected fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style Balance fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Flow Steps**:

1. **Setup Phase**: Initial configuration of financial system
   - Configure COA structure and accounting standards
   - Create GL account hierarchy
   - Define dimensions (department, location, cost center, etc.)
   - Configure mapping rules for automated posting

2. **Operational Phase**: Day-to-day transaction processing
   - Operational transactions occur (GRN, invoices, payments)
   - Auto-posting: Posting Engine evaluates rules and generates JEs
   - Manual posting: Accountants create JEs with validation
   - All entries post to GL and update account balances

3. **Reporting Phase**: Financial reporting and period management
   - Generate trial balance and financial statements
   - Execute period close process
   - Lock period and open next period
   - Cycle returns to operational phase

---

### Automated Journal Entry Generation Flow

**Purpose**: Automatically generate and post journal entries from operational transactions

**Actors**: Posting Engine, Mapping Rule Engine, GL Database, External Systems

**Trigger**: Operational transaction posted (GRN, invoice, payment, etc.)

```mermaid
flowchart TD
    Start([Transaction Posted]) --> Event[/Event Published to Queue/]
    Event --> Consumer[Posting Engine Consumes Event]
    Consumer --> Fetch[Retrieve Transaction Details]

    Fetch --> Check1{Transaction<br>Already Posted?}
    Check1 -->|Yes| Duplicate([Ignore Duplicate])
    Check1 -->|No| Continue1[Continue Processing]

    Continue1 --> Check2{Period<br>Open?}
    Check2 -->|No| Error1[/Error: Period Closed/]
    Error1 --> Queue1[(Add to Error Queue)]
    Queue1 --> Notify1[/Notify Finance Team/]

    Check2 -->|Yes| CallMapping[Call Mapping Rule Engine]
    CallMapping --> EvalRules[Evaluate Rules by Priority]

    EvalRules --> Match{Rule<br>Matched?}
    Match -->|No| Unmapped[(Add to Unmapped Queue)]
    Unmapped --> Notify2[/Notify Finance Team/]
    Notify2 --> End1([End: Manual Review Required])

    Match -->|Yes| GetAccounts[Get Account Assignments]
    GetAccounts --> GetDims[Get Dimension Mappings]

    GetDims --> Construct[Construct Journal Entry Lines]
    Construct --> AddTax{Taxable<br>Transaction?}
    AddTax -->|Yes| TaxLine[Add Tax Line]
    AddTax -->|No| Continue2[Continue]
    TaxLine --> Continue2

    Continue2 --> MultiCurr{Foreign<br>Currency?}
    MultiCurr -->|Yes| Convert[Convert to Base Currency]
    MultiCurr -->|No| Continue3[Continue]
    Convert --> Continue3

    Continue3 --> Validate[Validate Balanced Entry]
    Validate --> Balanced{Debits =<br>Credits?}
    Balanced -->|No| Error2[/Error: Unbalanced Entry/]
    Error2 --> Queue2[(Add to Error Queue)]
    Queue2 --> Notify3[/Notify Finance Team/]

    Balanced -->|Yes| Lock[Optimistic Locking Check]
    Lock --> Conflict{Concurrent<br>Posting?}
    Conflict -->|Yes| Retry{Retry<br>Count < 3?}
    Retry -->|Yes| Wait[Wait with Backoff]
    Wait --> Lock
    Retry -->|No| Error3[/Error: Concurrent Conflict/]
    Error3 --> Queue2

    Conflict -->|No| BeginTx[Begin Database Transaction]
    BeginTx --> InsertHeader[Insert Journal Entry Header]
    InsertHeader --> InsertLines[Insert Journal Entry Lines]
    InsertLines --> UpdateBalances[Update Account Balances]
    UpdateBalances --> LinkSource[Link to Source Transaction]
    LinkSource --> Commit[Commit Transaction]

    Commit --> Published[/Publish JE Posted Event/]
    Published --> UpdateViews[Update Materialized Views]
    UpdateViews --> Notifications[/Send Notifications/]
    Notifications --> Success([End: Success])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style End1 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Duplicate fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Error1 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style Error2 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style Error3 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style Unmapped fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Queue1 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style Queue2 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style BeginTx fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Decision Points**:

| Decision | Criteria | Outcome |
|----------|----------|---------|
| Already Posted | Check source_document_id exists in journal_entries | Skip duplicate/Continue |
| Period Open | Check period status = 'Open' | Error/Continue |
| Rule Matched | Evaluate criteria against transaction | Unmapped/Account assignments |
| Taxable | Check transaction type and tax code | Add tax line/Skip |
| Foreign Currency | Check currency != base currency | Convert/Use as-is |
| Balanced | Sum(debits) = Sum(credits) | Error/Continue |
| Concurrent Posting | Version mismatch on update | Retry/Proceed |

**Exception Handling**:
- **Period Closed**: Add to error queue, notify finance team for period reopen or next period posting
- **No Rule Match**: Add to unmapped transaction queue for manual review and rule creation
- **Unbalanced Entry**: Add to error queue with details, investigate mapping rule configuration
- **Concurrent Conflict**: Retry 3 times with exponential backoff, then error queue
- **Database Failure**: Rollback transaction, log error, retry in next batch

---

### Manual Journal Entry Posting Flow

**Purpose**: Guide accountants through manual journal entry creation and posting

**Actors**: Accountant, Controller (for approval), GL Database

**Trigger**: Accountant initiates manual JE creation

```mermaid
flowchart TD
    Start([Accountant Opens JE Form]) --> Header[Enter Header Information]
    Header --> Line1[Add First Debit Line]
    Line1 --> Account1[Select Account]
    Account1 --> Amount1[Enter Amount]
    Amount1 --> Dims1[Assign Dimensions]

    Dims1 --> Line2[Add First Credit Line]
    Line2 --> Account2[Select Account]
    Account2 --> Amount2[Enter Amount]
    Amount2 --> Dims2[Assign Dimensions]

    Dims2 --> More{More<br>Lines?}
    More -->|Yes| AddLine[Add Another Line]
    AddLine --> SelectType{Debit or<br>Credit?}
    SelectType -->|Debit| Account1
    SelectType -->|Credit| Account2

    More -->|No| Calculate[Calculate Balance]
    Calculate --> Balanced{Debits =<br>Credits?}
    Balanced -->|No| Warning[/Show Balance Warning/]
    Warning --> Dims2

    Balanced -->|Yes| Attach{Attach<br>Documents?}
    Attach -->|Yes| Upload[Upload Supporting Docs]
    Attach -->|No| Continue1[Continue]
    Upload --> Continue1

    Continue1 --> Notes{Add<br>Notes?}
    Notes -->|Yes| AddNotes[Enter Internal Notes]
    Notes -->|No| Continue2[Continue]
    AddNotes --> Continue2

    Continue2 --> Submit[Click Post Journal Entry]
    Submit --> ValidateClient[Client-Side Validation]

    ValidateClient --> ClientOK{Valid?}
    ClientOK -->|No| ShowErrors[/Display Validation Errors/]
    ShowErrors --> Header

    ClientOK -->|Yes| ServerAction[Call Server Action]
    ServerAction --> ValidateServer[Server-Side Validation]

    ValidateServer --> ServerOK{Valid?}
    ServerOK -->|No| ReturnErrors[/Return Validation Errors/]
    ReturnErrors --> ShowErrors

    ServerOK -->|Yes| PeriodCheck{Period<br>Open?}
    PeriodCheck -->|No| ErrorPeriod[/Error: Period Closed/]
    ErrorPeriod --> ShowErrors

    PeriodCheck -->|Yes| AccountCheck{All Accounts<br>Active?}
    AccountCheck -->|No| ErrorAccount[/Error: Inactive Account/]
    ErrorAccount --> ShowErrors

    AccountCheck -->|Yes| AuthCheck{Amount Exceeds<br>User Authority?}
    AuthCheck -->|Yes| RouteApproval[Route for Approval]
    RouteApproval --> WaitApproval[Status: Pending Approval]
    WaitApproval --> Approver[Controller Reviews]
    Approver --> ApprovalDecision{Approved?}
    ApprovalDecision -->|No| Rejected([End: Rejected])
    ApprovalDecision -->|Yes| PostEntry[Post to GL]

    AuthCheck -->|No| PostEntry
    PostEntry --> BeginTx[Begin Transaction]
    BeginTx --> InsertHeader[Insert JE Header]
    InsertHeader --> InsertLines[Insert JE Lines]
    InsertLines --> UpdateBalances[Update Account Balances]
    UpdateBalances --> AuditLog[Record Audit Trail]
    AuditLog --> Commit[Commit Transaction]

    Commit --> Success[/Success Notification/]
    Success --> Redirect[Redirect to JE Detail Page]
    Redirect --> End([End: Success])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style End fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Rejected fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ErrorPeriod fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ErrorAccount fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ShowErrors fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style PostEntry fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style BeginTx fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Flow Steps**:

1. **Entry Creation**: Accountant opens form and enters header (date, description)
2. **Line Items**: Add debit and credit lines with accounts, amounts, dimensions
3. **Balance Validation**: System calculates and enforces balanced entry
4. **Attachments**: Optional upload of supporting documents
5. **Submission**: Client and server validation
6. **Period Check**: Verify period is open for posting
7. **Account Check**: Verify all accounts are active
8. **Authority Check**: Determine if approval required based on amount
9. **Approval (if required)**: Route to controller for review
10. **Posting**: Insert header and lines, update balances atomically
11. **Success**: Display confirmation and redirect to detail page

---

### Mapping Rule Evaluation Flow

**Purpose**: Determine which GL accounts to use for a transaction based on mapping rules

**Actors**: Mapping Rule Engine, GL Database

**Trigger**: Posting Engine requests account assignment

```mermaid
flowchart TD
    Start([Request Account Assignment]) --> Input[/Transaction Data/]
    Input --> Extract[Extract Criteria]
    Extract --> Query[Query Active Rules<br>ORDER BY Priority ASC]

    Query --> Rules[(Get Rules)]
    Rules --> Loop{More Rules<br>to Evaluate?}

    Loop -->|No| NoMatch[No Rule Matched]
    NoMatch --> DefaultRule{Use Default<br>Rule?}
    DefaultRule -->|Yes| Default[Apply Default Rule]
    Default --> ReturnDefault[Return Default Accounts]
    ReturnDefault --> End1([End: Default])
    DefaultRule -->|No| Error[Return Error]
    Error --> End2([End: Unmapped])

    Loop -->|Yes| NextRule[Get Next Rule]
    NextRule --> CheckActive{Rule<br>Active?}
    CheckActive -->|No| Loop

    CheckActive -->|Yes| CheckDates{Current Date<br>in Range?}
    CheckDates -->|No| Loop

    CheckDates -->|Yes| EvalCriteria[Evaluate Rule Criteria]
    EvalCriteria --> CheckDoc{document_type<br>Matches?}
    CheckDoc -->|No| Loop

    CheckDoc -->|Yes| CheckTrans{transaction_type<br>Matches?}
    CheckTrans -->|No| Loop

    CheckTrans -->|Yes| CheckCat{category<br>Matches?}
    CheckCat -->|No| Loop

    CheckCat -->|Yes| CheckDept{department<br>Matches?}
    CheckDept -->|No| Loop

    CheckDept -->|Yes| CheckLoc{location<br>Matches?}
    CheckLoc -->|No| Loop

    CheckLoc -->|Yes| CheckAmount{amount_range<br>Matches?}
    CheckAmount -->|No| Loop

    CheckAmount -->|Yes| CheckCondition{Conditional<br>Logic?}
    CheckCondition -->|Yes| EvalCondition[Evaluate IF-THEN Logic]
    EvalCondition --> CondResult{Condition<br>Met?}
    CondResult -->|No| Loop
    CondResult -->|Yes| Match[Rule Matched!]
    CheckCondition -->|No| Match

    Match --> GetAccounts[Extract Account IDs]
    GetAccounts --> GetDims[Extract Dimension Mappings]
    GetDims --> Resolve[Resolve Dimension Values]

    Resolve --> Validate{All Required<br>Dimensions?}
    Validate -->|No| MissingDim[/Warning: Missing Dimensions/]
    MissingDim --> Continue[Use NULL for Missing]
    Validate -->|Yes| Continue

    Continue --> Package[Package Account Assignments]
    Package --> Return[Return to Posting Engine]
    Return --> End3([End: Success])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style End1 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style End2 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style End3 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Match fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Rules fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Rule Evaluation Logic**:

1. **Priority Order**: Rules evaluated in ascending priority order (1, 2, 3...)
2. **First Match Wins**: Once a rule matches all criteria, return immediately
3. **Criteria Logic**: AND logic (all criteria must match) or OR logic (any criteria match)
4. **Conditional Logic**: IF-THEN rules for complex scenarios (e.g., imported goods add duty account)
5. **Dimension Resolution**: Map transaction attributes to dimension values
6. **Default Fallback**: If no rules match, use default rule or return unmapped error

**Criteria Matching**:
- **Exact Match**: Field value must equal criterion value
- **IN List**: Field value must be in list of allowed values
- **Range Match**: Field value must be within min/max range (for amounts)
- **Null/Any**: NULL criterion means "match any value" (wildcard)

---

### Period Close Process Flow

**Purpose**: Guide finance team through comprehensive period close process

**Actors**: Controller, Accountant, System Background Jobs

**Trigger**: End of accounting period (month, quarter, year)

```mermaid
flowchart TD
    Start([Initiate Period Close]) --> Wizard[Open Period Close Wizard]

    Wizard --> Phase1[Phase 1: Pre-Close Validation]
    Phase1 --> Check1[Check All Docs Posted]
    Check1 --> Result1{All<br>Posted?}
    Result1 -->|No| Fix1[/List Unposted Documents/]
    Fix1 --> Manual1[Manual Resolution Required]
    Manual1 --> Check1

    Result1 -->|Yes| Check2[Check Bank Reconciliations]
    Check2 --> Result2{All<br>Complete?}
    Result2 -->|No| Fix2[/List Pending Reconciliations/]
    Fix2 --> Manual2[Complete Reconciliations]
    Manual2 --> Check2

    Result2 -->|Yes| Check3[Check Inventory Reconciliation]
    Check3 --> Result3{Variance<br>Acceptable?}
    Result3 -->|No| Fix3[/Show Variance Report/]
    Fix3 --> Manual3[Investigate and Adjust]
    Manual3 --> Check3

    Result3 -->|Yes| Check4[Check AP/AR Reconciliations]
    Check4 --> Result4{All<br>Complete?}
    Result4 -->|No| Fix4[/List Pending Reconciliations/]
    Fix4 --> Manual4[Complete Reconciliations]
    Manual4 --> Check4

    Result4 -->|Yes| Check5[Check Unmapped Transactions]
    Check5 --> Result5{Any<br>Unmapped?}
    Result5 -->|Yes| Fix5[/Show Unmapped Queue/]
    Fix5 --> Manual5[Map or Create Rules]
    Manual5 --> Check5

    Result5 -->|No| Validated[All Validations Passed]
    Validated --> Phase2[Phase 2: Generate Reports]

    Phase2 --> TB[Generate Trial Balance]
    TB --> BalanceCheck{Debits =<br>Credits?}
    BalanceCheck -->|No| ImbalanceError[/Critical Error: Imbalanced/]
    ImbalanceError --> Investigate[Investigate Imbalance]
    Investigate --> TB

    BalanceCheck -->|Yes| PL[Generate P&L Statement]
    PL --> BS[Generate Balance Sheet]
    BS --> CF[Generate Cash Flow]
    CF --> Variance[Generate Variance Analysis]
    Variance --> Download[Download All Reports]

    Download --> Phase3[Phase 3: Adjusting Entries]
    Phase3 --> Depreciation[Post Depreciation]
    Depreciation --> Accruals[Post Accruals]
    Accruals --> Prepayments[Post Prepayment Adjustments]
    Prepayments --> Reclassify[Post Reclassifications]
    Reclassify --> FinalTB[Generate Final Trial Balance]

    FinalTB --> FinalCheck{Still<br>Balanced?}
    FinalCheck -->|No| ImbalanceError
    FinalCheck -->|Yes| Phase4[Phase 4: Soft Close]

    Phase4 --> SoftClose[Set Status = Soft Closed]
    SoftClose --> BlockRegular[Prevent Regular User Posting]
    BlockRegular --> AllowController[Allow Controller Corrections]
    AllowController --> MgmtReview[Management Review Period]

    MgmtReview --> Corrections{Corrections<br>Needed?}
    Corrections -->|Yes| PostCorrections[Controller Posts Adjustments]
    PostCorrections --> FinalTB

    Corrections -->|No| Approval[Request CFO Approval]
    Approval --> CFODecision{CFO<br>Approves?}
    CFODecision -->|No| Rejected([End: Reopen for Corrections])

    CFODecision -->|Yes| Phase5[Phase 5: Hard Close]
    Phase5 --> HardClose[Set Status = Closed]
    HardClose --> LockPeriod[Lock Period Permanently]
    LockPeriod --> Archive[Archive Reports]
    Archive --> NextPeriod[Update Current Period]
    NextPeriod --> OpenNext[Set Next Period = Open]
    OpenNext --> Notify[/Send Completion Notifications/]
    Notify --> Success([End: Period Closed])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Rejected fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ImbalanceError fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style Validated fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Phase1 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Phase2 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Phase3 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Phase4 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Phase5 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
```

**Phase Descriptions**:

**Phase 1: Pre-Close Validation** (2-3 days)
- Verify all operational documents posted to GL
- Complete bank reconciliations (variances < $100)
- Complete inventory reconciliation (variances < $1000 or 0.5%)
- Complete AP/AR reconciliations (match to sub-ledgers)
- Resolve all unmapped transactions (create rules or manual JEs)
- Generate validation report with all checkpoints

**Phase 2: Generate Reports** (0.5 day)
- Generate and verify trial balance (debits = credits)
- Generate Profit & Loss statement
- Generate Balance Sheet
- Generate Cash Flow statement
- Generate variance analysis vs. budget and prior period
- Download and distribute reports to management

**Phase 3: Adjusting Entries** (1-2 days)
- Post automated depreciation for fixed assets
- Post accruals for expenses incurred but not invoiced
- Post prepayment adjustments and deferrals
- Post reclassification entries for correct classification
- Generate final trial balance with adjustments

**Phase 4: Soft Close** (2-3 days)
- Set period status to "Soft Closed"
- Block regular user posting (only controllers can post)
- Allow management review and corrections
- Post any final adjustments identified in review
- Request CFO approval to proceed to hard close

**Phase 5: Hard Close** (0.5 day)
- Set period status to "Closed" (permanent lock)
- Prevent all posting to period (requires CFO to reopen)
- Archive all period reports
- Update current period pointer to next period
- Open next period for new transactions
- Send completion notifications to finance team

**Total Duration**: Typically 6-9 days depending on organization complexity

---

## Data Flow Diagram

### Level 0: Context Diagram

**Purpose**: Show the Account Code Mapping system in context with external entities

```mermaid
flowchart LR
    Accountant([Accountant]) -->|Create Manual JE| ACM
    ACM{Account Code<br>Mapping<br>System}
    ACM -->|JE Confirmation| Accountant

    Controller([Controller]) -->|Manage COA & Rules| ACM
    ACM -->|Reports| Controller

    CFO([CFO]) -->|Approve Period Close| ACM
    ACM -->|Financial Statements| CFO

    ACM <-->|Query/Update| GLDB[(GL Database)]

    Procurement([Procurement<br>System]) -->|Transaction Events| ACM
    Inventory([Inventory<br>System]) -->|Transaction Events| ACM
    Sales([Sales<br>System]) -->|Transaction Events| ACM

    ACM -->|JE Posted Events| Budget([Budget<br>System])
    ACM -->|Balance Updates| Reporting([Reporting<br>System])

    style Accountant fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Controller fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style CFO fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style ACM fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style GLDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style Procurement fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Inventory fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Sales fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Budget fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Reporting fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
```

**External Entities**:
- **Accountant**: Create manual journal entries, reconcile accounts
- **Controller**: Manage COA structure, configure mapping rules, execute period close
- **CFO**: Approve period close, review financial statements
- **Procurement System**: Publishes GRN, invoice, payment events for auto-posting
- **Inventory System**: Publishes adjustment, transfer, count events for auto-posting
- **Sales System**: Publishes invoice, receipt events for auto-posting
- **Budget System**: Consumes JE events to update budget vs. actual
- **Reporting System**: Consumes balance updates for dashboards and analytics
- **GL Database**: Persistent storage for all financial data

---

### Level 1: System Decomposition

**Purpose**: Decompose Account Code Mapping system into major subsystems

```mermaid
flowchart TD
    Input[/Transaction Events/] --> PostingEngine[Posting Engine]
    ManualInput[/Manual JE Request/] --> ManualPosting[Manual Posting Service]

    PostingEngine --> MappingEngine[Mapping Rule Engine]
    MappingEngine --> RuleDB[(Mapping Rules)]

    PostingEngine --> JEGenerator[JE Generator]
    ManualPosting --> JEGenerator

    JEGenerator --> Validator[Entry Validator]
    Validator --> Valid{Valid?}
    Valid -->|No| ErrorQueue[(Error Queue)]
    Valid -->|Yes| GLPoster[GL Poster]

    GLPoster --> EntryDB[(Journal Entries)]
    GLPoster --> BalanceUpdater[Balance Updater]
    BalanceUpdater --> BalanceDB[(Account Balances)]

    PeriodService[Period Management] --> PeriodDB[(Accounting Periods)]
    PeriodService --> CloseWizard[Period Close Wizard]
    CloseWizard --> ValidationService[Validation Service]
    ValidationService --> ReconService[Reconciliation Service]

    ReportGen[Report Generator] --> TrialBalance[Trial Balance]
    ReportGen --> FinStatements[Financial Statements]
    TrialBalance --> EntryDB
    TrialBalance --> BalanceDB
    FinStatements --> EntryDB
    FinStatements --> BalanceDB

    GLPoster --> AuditLog[(Audit Trail)]
    ManualPosting --> AuditLog
    PeriodService --> AuditLog

    style Input fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style ManualInput fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style PostingEngine fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ManualPosting fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style MappingEngine fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style JEGenerator fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Validator fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style GLPoster fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style BalanceUpdater fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style PeriodService fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ReportGen fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style RuleDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style EntryDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style BalanceDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style PeriodDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ErrorQueue fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
```

**Subsystem Descriptions**:

1. **Posting Engine**: Consumes operational transaction events, orchestrates auto-posting
2. **Mapping Rule Engine**: Evaluates mapping rules to determine account assignments
3. **JE Generator**: Constructs balanced journal entries with dimensions
4. **Entry Validator**: Validates entries against business rules before posting
5. **GL Poster**: Posts entries to database and updates account balances
6. **Balance Updater**: Maintains current account balances by dimension
7. **Period Management**: Controls period lifecycle and close process
8. **Validation Service**: Pre-close validation checks
9. **Reconciliation Service**: GL to sub-ledger reconciliation
10. **Report Generator**: Produces trial balance and financial statements

---

## Sequence Diagrams

### Sequence 1: Automated Posting from GRN

**Purpose**: Show component interactions for auto-posting a GRN transaction

```mermaid
sequenceDiagram
    participant PS as Procurement System
    participant Queue as Event Queue
    participant PE as Posting Engine
    participant ME as Mapping Engine
    participant DB as GL Database
    participant IS as Inventory System

    PS->>Queue: Publish GRN Posted Event
    Note over Queue: Event: {grn_id, vendor_id,<br>amount, department, items}

    Queue->>PE: Consume Event
    PE->>DB: Check if already posted
    DB-->>PE: Not posted

    PE->>DB: Get Period Status
    DB-->>PE: Period Open

    PE->>ME: Request Account Assignment
    Note over ME: Evaluate Rules by Priority
    ME->>DB: Query Mapping Rules
    DB-->>ME: Rules List
    ME->>ME: Match Transaction to Rule
    ME-->>PE: Account Assignments + Dimensions

    PE->>PE: Construct Journal Entry Lines
    Note over PE: Line 1: Debit Inventory $5000<br>Line 2: Credit AP $5000

    PE->>PE: Validate Balanced Entry
    Note over PE: Debits ($5000) = Credits ($5000) ✓

    PE->>DB: Begin Transaction
    PE->>DB: Insert JE Header
    DB-->>PE: JE ID

    PE->>DB: Insert JE Lines (Batch)
    PE->>DB: Update Account Balances
    PE->>DB: Link to Source (GRN ID)
    PE->>DB: Commit Transaction
    DB-->>PE: Success

    PE->>Queue: Publish JE Posted Event
    Queue->>IS: Notify Inventory System
    IS->>IS: Update Inventory Valuation

    PE->>DB: Update Materialized Views (Async)
    PE->>PS: Send Confirmation
    Note over PS: GRN status updated:<br>Posted to GL = true
```

**Key Interactions**:
1. Procurement publishes GRN event to queue
2. Posting Engine consumes event and checks preconditions
3. Mapping Engine evaluates rules and returns account assignments
4. Posting Engine constructs and validates journal entry
5. Database transaction inserts entry and updates balances atomically
6. Event published for downstream systems (Inventory, Budget, Reporting)
7. Confirmation sent back to source system

---

### Sequence 2: Manual Journal Entry with Approval

**Purpose**: Show component interactions for manual JE requiring approval

```mermaid
sequenceDiagram
    participant A as Accountant
    participant UI as Web UI
    participant SA as Server Action
    participant AS as Authority Service
    participant AW as Approval Workflow
    participant C as Controller
    participant DB as GL Database

    A->>UI: Open Manual JE Form
    UI->>UI: Initialize Form State

    A->>UI: Enter Header & Lines
    Note over UI: Entry Date: 2025-11-12<br>Desc: Accrual for utilities<br>Line 1: Debit 5300 $3300<br>Line 2: Credit 2300 $3300

    A->>UI: Click Post Entry
    UI->>UI: Client Validation
    Note over UI: Balance Check: $3300 = $3300 ✓

    UI->>SA: submitJournalEntry(entryData)
    SA->>SA: Server Validation
    SA->>DB: Check Period Status
    DB-->>SA: Open

    SA->>DB: Check Account Status
    DB-->>SA: All Active

    SA->>AS: Check User Authority
    AS->>DB: Query Authority Matrix
    DB-->>AS: User limit: $5000
    AS-->>SA: Amount $3300 < $5000 ✓

    alt Amount Within Authority
        SA->>DB: Begin Transaction
        SA->>DB: Insert JE (Status: Posted)
        SA->>DB: Update Balances
        SA->>DB: Commit
        SA-->>UI: Success Response
        UI->>UI: Show Success Toast
        UI->>A: Redirect to JE Detail
    else Amount Exceeds Authority
        SA->>AW: Create Approval Request
        AW->>DB: Insert Approval Record
        DB-->>AW: Approval ID

        AW->>C: Send Notification
        Note over C: Email: JE requires your approval

        SA-->>UI: Pending Approval Response
        UI->>UI: Show Pending Status
        UI->>A: Redirect to JE Detail

        C->>UI: Open Approval Queue
        UI->>C: Display JE Details
        C->>UI: Click Approve

        UI->>AW: approveJournalEntry(jeId)
        AW->>DB: Update Approval (Approved)
        AW->>SA: Post Approved Entry
        SA->>DB: Begin Transaction
        SA->>DB: Update JE (Status: Posted)
        SA->>DB: Update Balances
        SA->>DB: Commit
        AW->>A: Send Notification
        Note over A: Email: Your JE has been approved
    end
```

**Approval Decision Points**:
- **Within Authority**: Post immediately (status = Posted)
- **Exceeds Authority**: Create approval request (status = Pending Approval)
- **Approval Granted**: Update to Posted, post to GL
- **Approval Rejected**: Update to Rejected, notify accountant

---

## State Diagrams

### State 1: Journal Entry Status

**Purpose**: Show valid status transitions for journal entries

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Entry

    Draft --> Draft: Edit/Update
    Draft --> PendingApproval: Submit (Exceeds Authority)
    Draft --> Posted: Post (Within Authority)
    Draft --> [*]: Delete (Abandon)

    PendingApproval --> Approved: Controller Approves
    PendingApproval --> Rejected: Controller Rejects
    PendingApproval --> Draft: Return for Corrections

    Approved --> Posted: System Posts to GL

    Rejected --> [*]: Notification Sent

    Posted --> Reversed: Create Reversal Entry
    Posted --> Posted: Immutable (No Changes)

    Reversed --> [*]: Final State

    note right of Draft
        Can edit, delete
        Not yet in GL
    end note

    note right of PendingApproval
        Awaiting controller approval
        Cannot modify
    end note

    note right of Posted
        Immutable after posting
        Affects account balances
        Appears in reports
    end note

    note right of Reversed
        Original entry remains
        Reversal entry created
        Net effect = zero
    end note
```

**Status Definitions**:
- **Draft**: Entry created but not submitted, can be edited or deleted
- **Pending Approval**: Submitted for approval, waiting for controller decision
- **Approved**: Controller approved, system will post to GL
- **Rejected**: Controller rejected, no GL impact
- **Posted**: Entry posted to GL, immutable, affects balances
- **Reversed**: Entry has been reversed by subsequent reversal entry

---

### State 2: Accounting Period Status

**Purpose**: Show valid status transitions for accounting periods

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Period

    Draft --> Open: Activate Period

    Open --> Open: Transactions Posting
    Open --> SoftClosed: Initiate Soft Close
    Open --> [*]: Delete (If No Transactions)

    SoftClosed --> SoftClosed: Controller Adjustments
    SoftClosed --> Closed: CFO Approves Hard Close
    SoftClosed --> Open: Reopen (If Needed)

    Closed --> Reopened: CFO Approves Reopen

    Reopened --> Closed: Re-close After Corrections

    note right of Draft
        Period defined
        Not yet active
        No transactions allowed
    end note

    note right of Open
        Active period
        All users can post
        Current period
    end note

    note right of SoftClosed
        Regular users blocked
        Controllers can adjust
        Awaiting final approval
    end note

    note right of Closed
        Permanently locked
        No posting allowed
        Requires CFO to reopen
    end note

    note right of Reopened
        Temporarily unlocked
        Track reopen count
        Must re-close when done
    end note
```

**Status Definitions**:
- **Draft**: Period created but not activated
- **Open**: Active period accepting all transactions
- **Soft Closed**: Preliminary close, only controllers can post
- **Closed**: Permanently closed, no posting allowed
- **Reopened**: Temporarily reopened for corrections, must re-close

---

## Integration Flows

### Integration 1: Procurement System Integration

**Purpose**: Show end-to-end flow from procurement transaction to GL posting

```mermaid
flowchart LR
    subgraph Procurement
        PR[Purchase Request] --> Approve1{Approved?}
        Approve1 -->|Yes| PO[Purchase Order]
        PO --> Send[Send to Vendor]
        Send --> Receive[Receive Goods]
        Receive --> GRN[Create GRN]
        GRN --> PostGRN[Post GRN]
    end

    subgraph Events
        PostGRN --> Event1[/Publish GRN Posted Event/]
    end

    subgraph Finance
        Event1 --> PE[Posting Engine]
        PE --> Map1[Map to Accounts]
        Map1 --> JE1[Generate JE]
        JE1 --> Line1[Debit: Inventory]
        JE1 --> Line2[Credit: AP]
        Line1 --> Post1[Post to GL]
        Line2 --> Post1
        Post1 --> Balance1[(Update Balances)]
    end

    subgraph Inventory
        Balance1 --> Event2[/JE Posted Event/]
        Event2 --> UpdateInv[Update Inventory Valuation]
    end

    subgraph Reporting
        Balance1 --> Event3[/Balance Update Event/]
        Event3 --> Dashboard[Update Dashboards]
    end

    style PR fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style GRN fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Event1 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style PE fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Post1 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Balance1 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Integration Points**:
1. **GRN Posted**: Procurement publishes event when GRN is posted
2. **Auto-Posting**: Finance consumes event and generates JE
3. **Inventory Update**: Inventory updates valuation from JE posted event
4. **Reporting**: Dashboards refresh from balance update events

---

### Integration 2: Inventory System Integration

**Purpose**: Show flow from inventory transaction to GL posting

```mermaid
flowchart LR
    subgraph Inventory
        Adj[Inventory Adjustment] --> Approve2{Approved?}
        Approve2 -->|Yes| PostAdj[Post Adjustment]

        Transfer[Stock Transfer] --> Complete[Complete Transfer]
        Complete --> PostTrans[Post Transfer]
    end

    subgraph Events
        PostAdj --> Event4[/Publish Adjustment Event/]
        PostTrans --> Event5[/Publish Transfer Event/]
    end

    subgraph Finance
        Event4 --> PE2[Posting Engine]
        Event5 --> PE2

        PE2 --> Map2[Map to Accounts]
        Map2 --> JE2[Generate JE]

        JE2 --> Type{Transaction<br>Type}
        Type -->|Adjustment| Adj1[Debit/Credit: Inventory]
        Type -->|Adjustment| Adj2[Credit/Debit: Variance]
        Type -->|Transfer| Trans1[Credit: Inventory From]
        Type -->|Transfer| Trans2[Debit: Inventory To]

        Adj1 --> Post2[Post to GL]
        Adj2 --> Post2
        Trans1 --> Post2
        Trans2 --> Post2

        Post2 --> Balance2[(Update Balances)]
    end

    style Adj fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Transfer fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Event4 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Event5 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style PE2 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Post2 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Balance2 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Transaction Types**:
- **Adjustment**: Increase/decrease inventory with variance account
- **Transfer**: Move inventory between locations (same total value)
- **Count Variance**: Adjust to physical count results
- **Scrap/Wastage**: Reduce inventory with expense account

---

### Account Reconciliation Flow

**Purpose**: Reconcile GL account balance with sub-ledger total

```mermaid
flowchart TD
    Start([Initiate Reconciliation]) --> Select[Select Account to Reconcile]
    Select --> Type{Account<br>Type}

    Type -->|Inventory| InvSubledger[Query Inventory System]
    Type -->|AP| APSubledger[Query AP Sub-Ledger]
    Type -->|AR| ARSubledger[Query AR Sub-Ledger]
    Type -->|Bank| BankSubledger[Query Bank Statement]

    InvSubledger --> InvTotal[Sum Inventory Values]
    APSubledger --> APTotal[Sum Outstanding Payables]
    ARSubledger --> ARTotal[Sum Outstanding Receivables]
    BankSubledger --> BankTotal[Get Bank Balance]

    InvTotal --> Compare
    APTotal --> Compare
    ARTotal --> Compare
    BankTotal --> Compare

    Compare[Compare GL vs Sub-Ledger]
    Compare --> GLBalance[Get GL Account Balance]
    GLBalance --> Calculate[Calculate Variance]

    Calculate --> Variance{Variance<br>= 0?}
    Variance -->|Yes| Reconciled[Mark as Reconciled]
    Reconciled --> Success([End: Reconciled])

    Variance -->|No| Acceptable{Variance<br>Acceptable?}
    Acceptable -->|Yes| Document[Document Variance Reason]
    Document --> Reconciled

    Acceptable -->|No| Investigate[Investigate Variance]
    Investigate --> Find{Root Cause<br>Found?}
    Find -->|No| Escalate[Escalate to Controller]
    Escalate --> Manual([End: Manual Review])

    Find -->|Yes| Fix{Can<br>Fix?}
    Fix -->|Yes| Correct[Post Correction Entry]
    Correct --> Compare

    Fix -->|No| Escalate

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Manual fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Compare fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Reconciled fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

**Reconciliation Types**:
- **Inventory**: GL Inventory account vs. Inventory System total valuation
- **Accounts Payable**: GL AP account vs. Outstanding vendor invoices
- **Accounts Receivable**: GL AR account vs. Outstanding customer invoices
- **Bank**: GL Cash account vs. Bank statement balance
- **Variance Tolerance**: $100 or 0.5% of balance (whichever is smaller)

---

## Appendix

### Diagram Legend

**Shape Meanings**:
- **Rounded Rectangle**: Start/End points
- **Rectangle**: Process steps
- **Diamond**: Decision points
- **Parallelogram**: Input/Output
- **Cylinder**: Database storage
- **Cloud**: External systems

**Color Meanings**:
- **Light Blue** (#cce5ff): Start points, actors
- **Light Green** (#ccffcc): Success outcomes
- **Light Red** (#ffcccc): Error outcomes
- **Light Orange** (#ffe0b3): Warnings, processes
- **Light Purple** (#e0ccff): Database operations
- **Light Gray** (#e8e8e8): Standard processes

### Related Documents
- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Data Schema](./DS-account-code-mapping.md)
- [Validations](./VAL-account-code-mapping.md)

---

**Document End**
