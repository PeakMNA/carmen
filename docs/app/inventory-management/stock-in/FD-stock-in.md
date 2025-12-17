# Flow Diagrams: Stock In

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Stock In
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-01-11 | System | Initial version with comprehensive Mermaid diagrams |

---

## Overview

This document provides visual representations of Stock In workflows using Mermaid diagrams. Diagrams cover the complete lifecycle from transaction creation through commitment, inventory updates, and financial posting.

**Related Documents**:
- [Business Requirements](./BR-stock-in.md)
- [Use Cases](./UC-stock-in.md)
- [Technical Specification](./TS-stock-in.md)
- [Data Definition](./DD-stock-in.md)
- [Validations](./VAL-stock-in.md)

---

## Table of Contents

1. [High-Level Process Flow](#1-high-level-process-flow)
2. [Create Transaction Flow](#2-create-transaction-flow)
3. [Add Line Items Flow](#3-add-line-items-flow)
4. [Commit Transaction Flow](#4-commit-transaction-flow)
5. [Reverse Transaction Flow](#5-reverse-transaction-flow)
6. [Data Flow Diagram](#6-data-flow-diagram)
7. [Sequence Diagram: Full Lifecycle](#7-sequence-diagram-full-lifecycle)
8. [State Diagram: Transaction Status](#8-state-diagram-transaction-status)
9. [Integration Flow: Inventory Valuation Service](#9-integration-flow-inventory-valuation-service)
10. [Integration Flow: GL Posting](#10-integration-flow-gl-posting)
11. [Component Interaction Diagram](#11-component-interaction-diagram)
12. [Error Recovery Flow](#12-error-recovery-flow)

---

## 1. High-Level Process Flow

```mermaid
graph TD
    Start([User Initiates Stock In]) --> Create[Create Transaction]
    Create --> AddItems[Add Line Items]
    AddItems --> Validate{All Items<br>Added?}
    Validate -->|No| AddItems
    Validate -->|Yes| Review[Review Transaction]
    Review --> MoreChanges{Need<br>Changes?}
    MoreChanges -->|Yes| AddItems
    MoreChanges -->|No| Commit[Commit Transaction]

    Commit --> CostCalc[Calculate Costs<br>Valuation Service]
    CostCalc --> UpdateBal[Update Inventory<br>Balances]
    UpdateBal --> CreateMov[Create Movement<br>History]
    CreateMov --> PostGL[Post to<br>General Ledger]
    PostGL --> Complete([Transaction Committed])

    Review --> Cancel{Cancel?}
    Cancel -->|Yes| Void[Void Transaction]
    Void --> End([Transaction Voided])

    Complete --> Reverse{Need<br>Reversal?}
    Reverse -->|Yes| ReverseFlow[Create Reversal<br>Transaction]
    ReverseFlow --> End2([Reversed])
    Reverse -->|No| End3([Final])

    style Create fill:#e1f5e1
    style Commit fill:#fff4e1
    style Complete fill:#e1f0ff
    style Void fill:#ffe1e1
    style ReverseFlow fill:#ffe1e1
```

---

## 2. Create Transaction Flow

```mermaid
flowchart TD
    Start([User Clicks Add New]) --> ShowForm[Display Transaction Form]
    ShowForm --> EnterData[User Enters:<br>- Type<br>- Date<br>- Location<br>- Related Doc<br>- Description]

    EnterData --> ValidateClient{Client-Side<br>Validation}
    ValidateClient -->|Invalid| ShowErrors[Display Field Errors]
    ShowErrors --> EnterData

    ValidateClient -->|Valid| Submit[User Clicks Create]
    Submit --> ServerValidate{Server-Side<br>Validation}

    ServerValidate -->|Invalid| ReturnErrors[Return Validation Errors]
    ReturnErrors --> ShowErrors

    ServerValidate -->|Valid| CheckPerms{User Has<br>Create Permission?}
    CheckPerms -->|No| PermError[Return Permission Error]
    PermError --> ShowPermError[Display: Access Denied]
    ShowPermError --> End1([Creation Cancelled])

    CheckPerms -->|Yes| CheckLocation{Location<br>Accessible?}
    CheckLocation -->|No| LocError[Return Location Error]
    LocError --> ShowLocError[Display: Invalid Location]
    ShowLocError --> End1

    CheckLocation -->|Yes| ValidateRelDoc{Related Doc<br>Exists?}
    ValidateRelDoc -->|No| DocError[Return Doc Error]
    DocError --> ShowDocError[Display: Related Doc Not Found]
    ShowDocError --> EnterData

    ValidateRelDoc -->|Yes| GenRefNo[Generate Reference Number<br>STK-IN-YYMM-NNNN]
    GenRefNo --> CreateRecord[Create Transaction Record<br>status = Saved]
    CreateRecord --> CreateActivity[Create Activity Log:<br>Created by User]
    CreateActivity --> ReturnSuccess[Return Transaction ID<br>and Ref Number]
    ReturnSuccess --> Navigate[Navigate to Detail Page]
    Navigate --> ShowSuccess[Display: Transaction Created]
    ShowSuccess --> End2([Ready for Line Items])

    style ShowForm fill:#e1f5e1
    style CreateRecord fill:#fff4e1
    style ShowSuccess fill:#e1f0ff
    style ShowErrors fill:#ffe1e1
```

---

## 3. Add Line Items Flow

```mermaid
flowchart TD
    Start([User on Detail Page]) --> ClickAdd[User Clicks Add Product]
    ClickAdd --> OpenDialog[Display Product Search Dialog]
    OpenDialog --> Search[User Searches Products]
    Search --> FetchProducts[API: Fetch Products<br>from Product Master]
    FetchProducts --> DisplayResults[Display Search Results]
    DisplayResults --> SelectProduct[User Selects Product]

    SelectProduct --> LoadDetails[Load Product Details:<br>- Code<br>- Description<br>- Available Units]
    LoadDetails --> ShowForm[Display Line Item Form]
    ShowForm --> EnterQty[User Enters:<br>- Quantity<br>- Unit<br>- Location<br>- Comment]

    EnterQty --> ValidateForm{Form<br>Validation}
    ValidateForm -->|Invalid| ShowErrors[Display Inline Errors]
    ShowErrors --> EnterQty

    ValidateForm -->|Valid| CheckDupe{Duplicate<br>Product?}
    CheckDupe -->|Yes| ShowWarning[Display: Product Already Exists<br>Update or Change Unit/Location?]
    ShowWarning --> UserChoice{User<br>Choice}
    UserChoice -->|Update Existing| EditExisting[Edit Existing Line Item]
    UserChoice -->|Change Details| EnterQty
    UserChoice -->|Cancel| End1([Cancelled])

    CheckDupe -->|No| Submit[User Clicks Add]
    Submit --> ServerAction[Server Action: addLineItem]
    ServerAction --> CreateItem[Create stock_in_item Record]
    CreateItem --> FetchInventory[Fetch Inventory Info:<br>On Hand, Reorder, etc.]
    FetchInventory --> CalcTotal[Calculate Total Qty:<br>SUM all line items]
    CalcTotal --> UpdateHeader[Update Transaction<br>total_qty]
    UpdateHeader --> AutoSave[Trigger Auto-Save]
    AutoSave --> ReturnItem[Return Line Item<br>with Inventory Context]
    ReturnItem --> UpdateUI[Update Line Item Grid]
    UpdateUI --> ShowSuccess[Display: Item Added]
    ShowSuccess --> End2([Item Added])

    EditExisting --> UpdateItem[Update Existing Item Qty]
    UpdateItem --> CalcTotal

    style OpenDialog fill:#e1f5e1
    style CreateItem fill:#fff4e1
    style ShowSuccess fill:#e1f0ff
    style ShowErrors fill:#ffe1e1
    style ShowWarning fill:#fff4e1
```

---

## 4. Commit Transaction Flow

```mermaid
flowchart TD
    Start([User Clicks Commit]) --> ShowConfirm[Display Confirmation Dialog<br>with Summary]
    ShowConfirm --> UserConfirm{User<br>Confirms?}
    UserConfirm -->|No| Cancel([Commit Cancelled])

    UserConfirm -->|Yes| BeginTx[BEGIN DATABASE TRANSACTION]
    BeginTx --> ValidateTx{Transaction<br>Committable?}
    ValidateTx -->|No| RollbackVal[ROLLBACK]
    RollbackVal --> ShowError1[Display: Cannot Commit<br>Validation Error]
    ShowError1 --> End1([Commit Failed])

    ValidateTx -->|Yes| CheckPerms{User Has<br>Commit Permission?}
    CheckPerms -->|No| RollbackPerm[ROLLBACK]
    RollbackPerm --> ShowError2[Display: Access Denied]
    ShowError2 --> End1

    CheckPerms -->|Yes| CallValuation[Call Inventory Valuation Service<br>Calculate Costs for All Items]
    CallValuation --> ValuationSuccess{Valuation<br>Success?}
    ValuationSuccess -->|No| RollbackVal1[ROLLBACK]
    RollbackVal1 --> ShowError3[Display: Cost Calculation Failed<br>Try Again Later]
    ShowError3 --> End1

    ValuationSuccess -->|Yes| UpdateCosts[Update Line Items<br>with Unit Costs & Total Costs]
    UpdateCosts --> LockBalances[SELECT inventory_balance<br>FOR UPDATE<br>Lock Rows]
    LockBalances --> UpdateBal[Update Inventory Balances:<br>on_hand_qty += qty]
    UpdateBal --> CheckNegative{Allow<br>Negative?}
    CheckNegative -->|No and Balance < 0| RollbackBal[ROLLBACK]
    RollbackBal --> ShowError4[Display: Negative Inventory<br>Not Allowed]
    ShowError4 --> End1

    CheckNegative -->|Yes or Balance >= 0| CreateMov[Create Movement Records<br>for Each Line Item]
    CreateMov --> CallGL[Call Finance Module<br>Post GL Journal Entry]
    CallGL --> GLSuccess{GL Post<br>Success?}
    GLSuccess -->|No| RollbackGL[ROLLBACK All Changes]
    RollbackGL --> ShowError5[Display: GL Posting Failed<br>Contact Finance Team]
    ShowError5 --> End1

    GLSuccess -->|Yes| UpdateStatus[Update Transaction:<br>status = Committed<br>commit_date = NOW()<br>committed_by = user<br>gl_journal_entry_number]
    UpdateStatus --> CreateActivity[Create Activity Log:<br>Committed by User]
    CreateActivity --> CommitTx[COMMIT DATABASE TRANSACTION]
    CommitTx --> RefreshUI[Refresh Transaction Detail]
    RefreshUI --> ShowSuccess[Display: Transaction Committed<br>Inventory Updated<br>GL Entry: JE-XXXX]
    ShowSuccess --> End2([Successfully Committed])

    style BeginTx fill:#fff4e1
    style CallValuation fill:#e1f0ff
    style CallGL fill:#e1f0ff
    style CommitTx fill:#e1f5e1
    style ShowSuccess fill:#e1f0ff
    style RollbackVal fill:#ffe1e1
    style RollbackVal1 fill:#ffe1e1
    style RollbackBal fill:#ffe1e1
    style RollbackGL fill:#ffe1e1
```

---

## 5. Reverse Transaction Flow

```mermaid
flowchart TD
    Start([User Clicks Reverse]) --> ShowDialog[Display Reversal Dialog<br>with Warning]
    ShowDialog --> EnterReason[User Enters Reversal Reason]
    EnterReason --> UserConfirm{User<br>Confirms?}
    UserConfirm -->|No| Cancel([Reversal Cancelled])

    UserConfirm -->|Yes| ValidatePerms{User Has<br>Reverse Permission?}
    ValidatePerms -->|No| ShowError1[Display: Access Denied<br>Manager Permission Required]
    ShowError1 --> End1([Reversal Denied])

    ValidatePerms -->|Yes| CheckReversed{Already<br>Reversed?}
    CheckReversed -->|Yes| ShowError2[Display: Already Reversed<br>View Reversal Transaction]
    ShowError2 --> End1

    CheckReversed -->|No| BeginTx[BEGIN DATABASE TRANSACTION]
    BeginTx --> CreateStockOut[Create Stock OUT Transaction<br>- Mirror-image line items<br>- Negative quantities<br>- Same costs]
    CreateStockOut --> CheckInventory{Sufficient<br>Inventory?}
    CheckInventory -->|No| RollbackInv[ROLLBACK]
    RollbackInv --> ShowError3[Display: Insufficient Inventory<br>Resolve Discrepancy First]
    ShowError3 --> End1

    CheckInventory -->|Yes| UpdateBalances[Update Inventory Balances:<br>on_hand_qty -= original_qty]
    UpdateBalances --> CreateMovements[Create Movement Records<br>with Negative Stock Out Qty]
    CreateMovements --> CallGL[Call Finance Module<br>Post GL Reversal Entry]
    CallGL --> GLSuccess{GL Reversal<br>Success?}
    GLSuccess -->|No| RollbackGL[ROLLBACK]
    RollbackGL --> ShowError4[Display: GL Reversal Failed<br>Contact Finance Team]
    ShowError4 --> End1

    GLSuccess -->|Yes| UpdateOriginal[Update Original Transaction:<br>is_reversed = true<br>reversal_transaction_id<br>reversal_date<br>reversal_by<br>reversal_reason]
    UpdateOriginal --> CreateActivity[Create Activity Logs<br>in Both Transactions]
    CreateActivity --> CommitTx[COMMIT DATABASE TRANSACTION]
    CommitTx --> RefreshUI[Refresh Transaction Detail]
    RefreshUI --> ShowSuccess[Display: Transaction Reversed<br>Reversal: STK-OUT-XXXX]
    ShowSuccess --> ProvideLink[Provide Link to<br>Reversal Transaction]
    ProvideLink --> End2([Successfully Reversed])

    style CreateStockOut fill:#ffe1e1
    style UpdateOriginal fill:#fff4e1
    style ShowSuccess fill:#e1f0ff
    style RollbackInv fill:#ffe1e1
    style RollbackGL fill:#ffe1e1
```

---

## 6. Data Flow Diagram

```mermaid
graph LR
    subgraph External Systems
        GRN[GRN Module]
        Transfer[Transfer Module]
        IssueReturn[Store Operations]
        Valuation[Inventory<br>Valuation Service]
        Finance[Finance Module<br>GL]
    end

    subgraph Stock In Module
        UI[User Interface<br>React Components]
        ServerActions[Server Actions<br>Business Logic]
        DB[(PostgreSQL<br>Database)]
    end

    subgraph Master Data
        Product[Product Master]
        Location[Location Master]
        User[User Master]
    end

    User1[User] -->|Create/Edit| UI
    UI -->|Server Action| ServerActions
    ServerActions -->|Validate| Product
    ServerActions -->|Validate| Location
    ServerActions -->|Validate| User

    GRN -->|Related Doc| ServerActions
    Transfer -->|Related Doc| ServerActions
    IssueReturn -->|Related Doc| ServerActions

    ServerActions -->|Calculate Cost| Valuation
    Valuation -->|Return Cost| ServerActions

    ServerActions -->|Post GL| Finance
    Finance -->|JE Number| ServerActions

    ServerActions -->|Read/Write| DB
    DB -->|Query Results| ServerActions
    ServerActions -->|Response| UI
    UI -->|Display| User1

    style UI fill:#e1f5e1
    style ServerActions fill:#fff4e1
    style DB fill:#e1f0ff
    style Valuation fill:#ffe1f5
    style Finance fill:#ffe1f5
```

---

## 7. Sequence Diagram: Full Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Component
    participant SA as Server Action
    participant DB as Database
    participant Val as Valuation Service
    participant GL as Finance Module

    User->>UI: Click "Add New"
    UI->>SA: createStockInTransaction(data)
    SA->>DB: Generate ref number
    DB-->>SA: STK-IN-2501-0123
    SA->>DB: INSERT stock_in_transaction
    DB-->>SA: Transaction created
    SA-->>UI: Return transaction ID
    UI->>User: Show success, navigate to detail

    User->>UI: Add product line items
    UI->>SA: addLineItem(transactionId, productData)
    SA->>DB: INSERT stock_in_item
    SA->>DB: SELECT inventory balance
    DB-->>SA: Current inventory info
    SA->>DB: UPDATE transaction.total_qty
    DB-->>SA: Updated
    SA-->>UI: Return line item with inventory context
    UI->>User: Display updated grid

    Note over UI,SA: Auto-save occurs every 30 seconds

    User->>UI: Click "Commit"
    UI->>User: Show confirmation dialog
    User->>UI: Confirm commit
    UI->>SA: commitStockInTransaction(transactionId)
    SA->>DB: BEGIN TRANSACTION
    SA->>DB: Validate transaction committable
    DB-->>SA: Valid

    SA->>Val: POST /calculate-cost (line items)
    Val->>Val: Calculate FIFO or Periodic Average
    Val-->>SA: Return costs for all items
    SA->>DB: UPDATE stock_in_item (unit_cost, total_cost)

    SA->>DB: SELECT inventory_balance FOR UPDATE
    DB-->>SA: Locked balances
    SA->>DB: UPDATE inventory_balance (on_hand_qty += qty)
    SA->>DB: INSERT stock_in_movement (for each item)

    SA->>GL: POST /journal-entry (GL data)
    GL->>GL: Validate and create JE
    GL-->>SA: JE-2501-5678
    SA->>DB: UPDATE stock_in_transaction (status, JE number)
    SA->>DB: INSERT stock_in_activity (Committed)
    SA->>DB: COMMIT TRANSACTION
    DB-->>SA: Committed

    SA-->>UI: Return committed transaction
    UI->>User: Display success with JE number

    style Val fill:#ffe1f5
    style GL fill:#ffe1f5
```

---

## 8. State Diagram: Transaction Status

```mermaid
stateDiagram-v2
    [*] --> Saved: Create Transaction

    Saved --> InProgress: User Editing<br>(Auto-save active)
    InProgress --> Saved: Auto-save Complete

    Saved --> Committed: Commit<br>(Cost calc, Balance update, GL post)
    Saved --> Void: Void<br>(User cancels)

    Committed --> Reversed: Reverse<br>(Create offsetting Stock OUT)

    Void --> [*]
    Reversed --> [*]
    Committed --> [*]: No further changes

    note right of Saved
        - Editable
        - Can add/remove line items
        - Can be voided or committed
        - Does not affect inventory
    end note

    note right of Committed
        - Immutable (except reversal)
        - Inventory updated
        - GL entry posted
        - Movement history created
    end note

    note right of Void
        - Immutable
        - Never affected inventory
        - Audit trail preserved
    end note

    note right of Reversed
        - Original transaction marked
        - Offsetting Stock OUT created
        - Inventory decreased
        - GL reversal posted
    end note
```

---

## 9. Integration Flow: Inventory Valuation Service

```mermaid
flowchart TD
    Start([Commit Process:<br>Need Cost Calculation]) --> PrepareReq[Prepare API Request:<br>- Transaction Date<br>- Line Items with Products,<br>  Locations, Quantities]
    PrepareReq --> SendReq[POST /api/valuation/calculate-cost<br>Timeout: 5 seconds]
    SendReq --> WaitResp{Response<br>Received?}

    WaitResp -->|Timeout| Retry{Retry<br>Count < 3?}
    Retry -->|Yes| Wait[Wait with Exponential Backoff<br>1s, 2s, 4s]
    Wait --> SendReq
    Retry -->|No| LogError[Log: Valuation Service Unavailable]
    LogError --> ReturnError[Return Error to User:<br>Service Unavailable]
    ReturnError --> End1([Commit Failed])

    WaitResp -->|Error Response| CheckError{Error<br>Type?}
    CheckError -->|4xx Client Error| LogClientErr[Log: Request Validation Failed]
    LogClientErr --> ReturnClientErr[Return Error: Invalid Request Data]
    ReturnClientErr --> End1
    CheckError -->|5xx Server Error| Retry

    WaitResp -->|Success| ValidateResp{Response<br>Valid?}
    ValidateResp -->|No| LogInvalid[Log: Invalid Response Structure]
    LogInvalid --> ReturnInvalid[Return Error: Invalid Cost Data]
    ReturnInvalid --> End1

    ValidateResp -->|Yes| ExtractCosts[Extract Cost Data:<br>- Unit Cost 4 decimals<br>- Total Cost<br>- Calculation Method<br>- Cost Layer ID FIFO]
    ExtractCosts --> ValidateCosts{All Items<br>Have Costs?}
    ValidateCosts -->|No| LogMissing[Log: Missing Cost for Items]
    LogMissing --> ReturnMissing[Return Error: Cost Calculation Incomplete]
    ReturnMissing --> End1

    ValidateCosts -->|Yes| CheckValues{Costs<br>Valid?}
    CheckValues -->|No unit_cost >= 0| LogNegative[Log: Negative Unit Cost]
    LogNegative --> ReturnNegative[Return Error: Invalid Cost Values]
    ReturnNegative --> End1

    CheckValues -->|Valid| LogSuccess[Log: Cost Calculation Successful<br>Request ID, Duration, Method]
    LogSuccess --> UpdateItems[Update Line Items<br>with Cost Data]
    UpdateItems --> End2([Cost Calculation Complete])

    style SendReq fill:#e1f0ff
    style ExtractCosts fill:#fff4e1
    style UpdateItems fill:#e1f5e1
    style ReturnError fill:#ffe1e1
    style ReturnClientErr fill:#ffe1e1
    style ReturnInvalid fill:#ffe1e1
    style ReturnMissing fill:#ffe1e1
    style ReturnNegative fill:#ffe1e1
```

---

## 10. Integration Flow: GL Posting

```mermaid
flowchart TD
    Start([Commit Process:<br>Ready for GL Post]) --> DetermineAccts[Determine GL Accounts<br>Based on Transaction Type]
    DetermineAccts --> TypeGRN{Transaction<br>Type?}

    TypeGRN -->|GRN| AcctGRN[Debit: Inventory Asset<br>Credit: Accounts Payable]
    TypeGRN -->|Transfer| AcctTransfer[Debit: Inventory Asset Dest<br>Credit: Inventory Asset Source]
    TypeGRN -->|Issue Return| AcctReturn[Debit: Inventory Asset<br>Credit: COGS/Dept Expense]
    TypeGRN -->|Adjustment| AcctAdj[Debit: Inventory Asset<br>Credit: Inventory Variance]
    TypeGRN -->|Credit Note| AcctCN[Debit: Accounts Payable<br>Credit: Inventory Asset]

    AcctGRN --> CalcAmounts
    AcctTransfer --> CalcAmounts
    AcctReturn --> CalcAmounts
    AcctAdj --> CalcAmounts
    AcctCN --> CalcAmounts

    CalcAmounts[Calculate GL Amounts:<br>SUM line item total_cost] --> PrepareJE[Prepare JE Request:<br>- Transaction Date<br>- Reference Number<br>- Description<br>- Lines with Accounts<br>- Idempotency Key]
    PrepareJE --> SendJE[POST /api/gl/journal-entry<br>Timeout: 10 seconds]
    SendJE --> WaitJE{Response<br>Received?}

    WaitJE -->|Timeout| RetryJE{Retry<br>Count < 2?}
    RetryJE -->|Yes| WaitDelay[Wait 2 seconds]
    WaitDelay --> SendJE
    RetryJE -->|No| LogJETimeout[Log: GL Service Timeout]
    LogJETimeout --> ReturnJEError[Return Error: GL Unavailable]
    ReturnJEError --> End1([GL Post Failed])

    WaitJE -->|Error Response| CheckJEError{Error<br>Code?}
    CheckJEError -->|403 Period Closed| LogPeriod[Log: Accounting Period Closed]
    LogPeriod --> ReturnPeriod[Return Error: Period Closed<br>Change Transaction Date]
    ReturnPeriod --> End1
    CheckJEError -->|409 Duplicate| CheckIdempotent{JE Number<br>Matches?}
    CheckIdempotent -->|Yes| LogDupe[Log: Duplicate Request Idempotent]
    LogDupe --> ExtractJE[Extract JE Number]
    ExtractJE --> End2([GL Post Success])
    CheckIdempotent -->|No| LogConflict[Log: Conflict Different JE]
    LogConflict --> ReturnConflict[Return Error: Duplicate Conflict]
    ReturnConflict --> End1
    CheckJEError -->|400/500 Other| LogOther[Log: GL Validation/System Error]
    LogOther --> ReturnOther[Return Error with Details]
    ReturnOther --> End1

    WaitJE -->|Success| ValidateJE{JE Response<br>Valid?}
    ValidateJE -->|No| LogInvalidJE[Log: Invalid JE Response]
    LogInvalidJE --> ReturnInvalidJE[Return Error: Invalid GL Response]
    ReturnInvalidJE --> End1

    ValidateJE -->|Yes| ExtractJENum[Extract JE Number:<br>JE-YYMM-NNNN]
    ExtractJENum --> LogJESuccess[Log: GL Posted Successfully<br>JE Number, Post Date]
    LogJESuccess --> StoreJE[Store JE Number<br>in Transaction Record]
    StoreJE --> End2

    style SendJE fill:#e1f0ff
    style StoreJE fill:#e1f5e1
    style ReturnJEError fill:#ffe1e1
    style ReturnPeriod fill:#ffe1e1
    style ReturnConflict fill:#ffe1e1
    style ReturnOther fill:#ffe1e1
    style ReturnInvalidJE fill:#ffe1e1
```

---

## 11. Component Interaction Diagram

```mermaid
graph TD
    subgraph 'Client Layer'
        ListPage[Stock In List Page<br>Server Component]
        DetailPage[Stock In Detail Page<br>Server Component]
        ListClient[StockInList.tsx<br>Client Component]
        DetailClient[StockInDetail.tsx<br>Client Component]
        LineGrid[LineItemGrid.tsx<br>Client Component]
        ProductSel[ProductSelector.tsx<br>Client Component]
    end

    subgraph 'Application Layer'
        ListAction[list/actions.ts<br>Server Actions]
        DetailAction[id/actions.ts<br>Server Actions]
        ValClient[api-clients/valuation-service.ts]
        GLClient[api-clients/finance-service.ts]
    end

    subgraph 'Data Layer'
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
    end

    subgraph 'External Services'
        ValService[Inventory<br>Valuation Service]
        GLService[Finance Module<br>GL API]
        ProductAPI[Product Master<br>API]
    end

    User[User] -->|Navigate| ListPage
    ListPage -->|Hydrate| ListClient
    ListClient -->|Fetch Data| ListAction
    ListAction -->|Query| Prisma
    Prisma -->|SQL| DB

    ListClient -->|Navigate to Detail| DetailPage
    DetailPage -->|Hydrate| DetailClient
    DetailClient -->|Render| LineGrid
    LineGrid -->|Open| ProductSel
    ProductSel -->|Search Products| ProductAPI

    DetailClient -->|Add Item| DetailAction
    DetailClient -->|Commit| DetailAction
    DetailAction -->|Calculate Cost| ValClient
    ValClient -->|API Call| ValService
    DetailAction -->|Post GL| GLClient
    GLClient -->|API Call| GLService
    DetailAction -->|CRUD| Prisma

    style ListClient fill:#e1f5e1
    style DetailClient fill:#e1f5e1
    style DetailAction fill:#fff4e1
    style DB fill:#e1f0ff
    style ValService fill:#ffe1f5
    style GLService fill:#ffe1f5
```

---

## 12. Error Recovery Flow

```mermaid
flowchart TD
    Start([Error Detected]) --> IdentifyError{Error<br>Category?}

    IdentifyError -->|Validation Error| ValError[Field Validation Failed]
    ValError --> DisplayField[Display Inline Error<br>Highlight Field]
    DisplayField --> UserFix[User Corrects Data]
    UserFix --> Retry1([Retry Operation])

    IdentifyError -->|Network Error| NetError[API Call Failed]
    NetError --> RetryLogic{Auto<br>Retry?}
    RetryLogic -->|Yes| ExponentialBackoff[Exponential Backoff<br>1s, 2s, 4s]
    ExponentialBackoff --> RetryAttempt{Retry<br>Success?}
    RetryAttempt -->|Yes| Success([Operation Success])
    RetryAttempt -->|No, Max Retries| NetFail[All Retries Failed]
    NetFail --> LocalStorage[Save to Local Storage]
    LocalStorage --> DisplayWarning[Display: Network Error<br>Changes Saved Locally<br>Will Retry]
    DisplayWarning --> BackgroundRetry[Background Retry Loop]
    BackgroundRetry --> BackgroundSuccess{Eventually<br>Success?}
    BackgroundSuccess -->|Yes| ClearLocal[Clear Local Storage]
    ClearLocal --> Success
    BackgroundSuccess -->|No| ManualIntervention[Require Manual Save<br>When Online]
    ManualIntervention --> End1([Pending User Action])

    IdentifyError -->|Business Rule Error| BizError[Business Rule Violation]
    BizError --> DisplayBizError[Display Business Error<br>with Explanation]
    DisplayBizError --> UserAction{User<br>Action?}
    UserAction -->|Fix Data| UserFix
    UserAction -->|Contact Support| ContactSupport[Log Issue for Support]
    ContactSupport --> End2([Awaiting Support])
    UserAction -->|Cancel| End3([Operation Cancelled])

    IdentifyError -->|System Error| SysError[Database/Server Error]
    SysError --> LogError[Log Full Error Details<br>Stack Trace, Context]
    LogError --> Rollback{Transaction<br>Active?}
    Rollback -->|Yes| PerformRollback[ROLLBACK DATABASE TRANSACTION]
    PerformRollback --> DisplaySysError[Display: System Error<br>Please Try Again]
    Rollback -->|No| DisplaySysError
    DisplaySysError --> AlertSupport[Alert Support Team<br>if Critical]
    AlertSupport --> UserRetry{User<br>Retries?}
    UserRetry -->|Yes| Retry1
    UserRetry -->|No| End3

    IdentifyError -->|Integration Error| IntError[External Service Failed]
    IntError --> CheckService{Which<br>Service?}
    CheckService -->|Valuation Service| ValFail[Cost Calculation Failed]
    ValFail --> DisplayValError[Display: Valuation Service Unavailable<br>Transaction Remains Saved<br>Retry Later]
    DisplayValError --> QueueRetry[Queue for Auto Retry<br>Every 5 minutes]
    QueueRetry --> End4([Pending Retry])
    CheckService -->|Finance GL| GLFail[GL Posting Failed]
    GLFail --> RollbackInv[Rollback Inventory Changes]
    RollbackInv --> DisplayGLError[Display: GL Posting Failed<br>Contact Finance Team]
    DisplayGLError --> CreateTicket[Create Support Ticket<br>with Transaction Details]
    CreateTicket --> End5([Awaiting Finance Resolution])

    style DisplayField fill:#ffe1e1
    style DisplayWarning fill:#fff4e1
    style DisplayBizError fill:#ffe1e1
    style DisplaySysError fill:#ffe1e1
    style DisplayValError fill:#fff4e1
    style DisplayGLError fill:#ffe1e1
    style Success fill:#e1f5e1
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version with 12 comprehensive flow diagrams |

---

## References

1. **Mermaid Documentation**: https://mermaid.js.org/
2. **Use Cases**: UC-stock-in.md
3. **Technical Specification**: TS-stock-in.md

---

**Document Control**:
- **Classification**: Internal Use
- **Review Required**: Yes
- **Approved By**: Pending
- **Next Review Date**: TBD
