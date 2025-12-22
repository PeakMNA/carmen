# Flow Diagrams: Store Requisitions

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Store Requisitions
- **Version**: 1.4.0
- **Last Updated**: 2025-12-19
- **Owner**: Store Operations Team
- **Status**: Active - Implementation Complete

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-12 | Documentation Team | Initial version |
| 1.1.0 | 2025-12-05 | Documentation Team | Synced related documents with BR, added shared methods references |
| 1.2.0 | 2025-12-10 | Documentation Team | Synced with source code - verified workflow stages and status transitions |
| 1.3.0 | 2025-12-13 | Documentation Team | Updated creation flow for dedicated page, inline add item pattern, "Requested By" field, "Request From" terminology, Location Type handling |
| 1.4.0 | 2025-12-19 | Documentation Team | Added receipt signature capture flow to Item Issuance Flow diagram, updated Issuance Sequence Diagram with signature dialog interaction |

---

## Overview

This document provides comprehensive visual workflows for the Store Requisitions module, which manages internal material requests from hotel departments (Kitchen, Housekeeping, Maintenance) to central stores. The diagrams cover the complete requisition lifecycle from creation through multi-level approval to final item issuance, including system integrations with Inventory Management and Workflow Engine modules.

**Key Processes Documented**:
- Requisition creation and submission workflow
- Multi-stage approval workflow with workflow engine integration
- Item-level approval and partial approval scenarios
- Stock issuance and inventory transaction creation
- Status transitions and state management
- System integrations (Inventory, Workflow Engine, User Management)
- Error handling and exception flows

**Related Documents**:
- [Business Requirements](./BR-store-requisitions.md) - Business rules, functional requirements, and backend specifications
- [Use Cases](./UC-store-requisitions.md) - Detailed user scenarios
- [Technical Specification](./TS-store-requisitions.md) - System architecture
- [Data Definition](./DD-store-requisitions.md) - Database entity descriptions
- [Validations](./VAL-store-requisitions.md) - Validation rules and Zod schemas
- [Backend Requirements](./BR-store-requisitions.md#10-backend-requirements) - API endpoints, database schema (Section 10 of BR)
- [Inventory Operations Shared Method](../../shared-methods/inventory-operations/SM-inventory-operations.md) - Inventory transaction patterns
- [Costing Methods Shared Method](../../shared-methods/inventory-valuation/SM-costing-methods.md) - FIFO/AVG costing integration

---

## Diagram Index

| Diagram | Type | Purpose | Complexity |
|---------|------|---------|------------|
| [High-Level Process Flow](#high-level-process-flow) | Process | End-to-end requisition lifecycle | Medium |
| [Requisition Creation Flow](#requisition-creation-flow) | Process | Create and add items to requisition | Low |
| [Approval Workflow](#approval-workflow-diagram) | Workflow | Multi-stage approval with workflow engine | High |
| [Item Issuance Flow](#item-issuance-flow) | Process | Issue items to department | Medium |
| [Context Diagram](#level-0-context-diagram) | Data Flow | System boundaries and external entities | Low |
| [System Decomposition](#level-1-system-decomposition) | Data Flow | Major processes and data stores | Medium |
| [Create Requisition Sequence](#create-requisition-sequence) | Interaction | Component interactions for creation | Medium |
| [Approval Sequence](#approval-sequence-diagram) | Interaction | Component interactions for approval | Medium |
| [Issuance Sequence](#issuance-sequence-diagram) | Interaction | Component interactions for issuance | High |
| [Status State Diagram](#requisition-status-state-diagram) | State | Status transitions for requisitions | Medium |
| [Item Status State Diagram](#line-item-status-state-diagram) | State | Status transitions for line items | Medium |
| [Inventory Integration](#inventory-integration-flow) | Integration | Integration with Inventory Management | High |
| [Workflow Engine Integration](#workflow-engine-integration) | Integration | Integration with Workflow Engine | High |
| [Error Handling Flow](#error-handling-flow) | Error | Error processing and recovery | Medium |

---

## Process Flow

### High-Level Process Flow

**Purpose**: End-to-end business process showing the complete requisition lifecycle from creation to completion

**Actors**:
- **Requestor**: Chef, Housekeeper, Engineering Technician (creates requisition)
- **Department Manager**: Approves departmental requisitions
- **Storekeeper**: Issues materials from store
- **Purchasing Manager**: Approves high-value or emergency requisitions
- **System**: Automated processes (workflow routing, inventory checks, notifications)

**Trigger**: Staff member needs materials from central store

```mermaid
flowchart TD
    Start([Requestor needs<br>materials]) --> Create[Create Requisition<br>Draft]
    Create --> AddItems[Add Line Items<br>with quantities]
    AddItems --> Check{All items<br>added?}

    Check -->|No| AddItems
    Check -->|Yes| Review[Review Requisition]
    Review --> Submit[Submit for Approval]

    Submit --> Validate{Validation<br>passed?}
    Validate -->|No| Error1[Display errors]
    Error1 --> Review

    Validate -->|Yes| InitWorkflow[Initialize Workflow<br>Engine]
    InitWorkflow --> Route[Route to First<br>Approval Stage]
    Route --> WaitApproval[Wait for Approval]

    WaitApproval --> ApproverAction{Approver<br>Decision}
    ApproverAction -->|Reject| Rejected[Mark as Rejected]
    Rejected --> NotifyReject[Notify Requestor]
    NotifyReject --> EndReject([End: Rejected])

    ApproverAction -->|Request Review| Review2[Request Clarification]
    Review2 --> WaitReviewer[Requestor Provides Info]
    WaitReviewer --> WaitApproval

    ApproverAction -->|Approve| CheckStage{More approval<br>stages?}
    CheckStage -->|Yes| NextStage[Route to Next Stage]
    NextStage --> WaitApproval

    CheckStage -->|No| AllApproved[All Approvals Complete]
    AllApproved --> CheckStock{Stock<br>available?}
    CheckStock -->|No| Backorder[Mark Backordered]
    CheckStock -->|Yes| ReadyIssue[Ready for Issuance]

    ReadyIssue --> Issue[Storekeeper Issues Items]
    Issue --> CreateTxn[Create Inventory<br>Transaction]
    CreateTxn --> UpdateStock[Update Stock Levels]
    UpdateStock --> CheckComplete{All items<br>issued?}

    CheckComplete -->|No| PartialComplete[Partially Completed]
    PartialComplete --> WaitStock[Wait for Stock]
    WaitStock --> ReadyIssue

    CheckComplete -->|Yes| Complete[Mark as Completed]
    Complete --> NotifyComplete[Notify Requestor]
    NotifyComplete --> Success([End: Success])

    Backorder --> WaitStock

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style EndReject fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style Error1 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style InitWorkflow fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style CreateTxn fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style UpdateStock fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Flow Steps**:

1. **Start**: Requestor (Chef, Housekeeper, Engineer) identifies need for materials
2. **Create**: User creates draft requisition with basic information
3. **Add Items**: User adds products with requested quantities
4. **Review**: User reviews requisition for completeness
5. **Submit**: User submits requisition for approval
6. **Validate**: System validates data against business rules
7. **Initialize Workflow**: System queries workflow engine for approval routing
8. **Route**: System routes to first approval stage (e.g., Department Manager)
9. **Wait for Approval**: System waits for approver action
10. **Approver Action**: Approver reviews and makes decision:
    - **Approve**: Continue to next stage or completion
    - **Reject**: End process with rejection notification
    - **Request Review**: Request clarification from requestor
11. **Check Stage**: System determines if more approval stages required
12. **All Approved**: All workflow stages completed successfully
13. **Check Stock**: System verifies stock availability
14. **Issue**: Storekeeper issues items to department
15. **Create Transaction**: System creates inventory transaction records
16. **Update Stock**: System updates stock levels (reduce source, increase destination)
17. **Complete**: System marks requisition as completed
18. **Notify**: System sends completion notification to requestor

**Exception Handling**:
- **Validation errors**: Display errors, return to review step
- **Rejection at any stage**: Notify requestor, end process
- **Stock unavailable**: Mark as backordered, wait for stock arrival
- **Partial issuance**: Track issued quantities, allow multiple issuance batches
- **Database failure**: Rollback transaction, log error, retry
- **Workflow engine error**: Fallback to default workflow, alert admin

---

### Requisition Creation Flow

**Purpose**: Detailed view of requisition creation process including inline item addition and validation

**Route**: `/store-operations/store-requisitions/new`

```mermaid
flowchart TD
    Start([User clicks<br>'New Requisition']) --> Navigate[Navigate to<br>/store-requisitions/new]
    Navigate --> InitForm[Initialize Form<br>with Defaults]
    InitForm --> AutoPopulate[Auto-populate:<br>- Requisition Number<br>- Date<br>- Requested By]

    AutoPopulate --> HeaderInput[User Enters Header Info:<br>- Expected Delivery Date<br>- Request From Location<br>- Description<br>- Job Code/Project]

    HeaderInput --> DetermineLocType[Determine Location Type<br>INVENTORY/DIRECT/CONSIGNMENT]
    DetermineLocType --> DisplayLocType[Display Location Type Badge]

    DisplayLocType --> SaveDraft{User saves<br>draft?}
    SaveDraft -->|Yes| ValidateHeader{Valid header<br>data?}
    ValidateHeader -->|No| HeaderError[Display validation errors]
    HeaderError --> HeaderInput

    ValidateHeader -->|Yes| GenerateSRNo[Generate SR Number<br>SR-YYMM-NNNN]
    GenerateSRNo --> SaveHeader[(Save Header<br>status=draft)]
    SaveHeader --> ItemSection[Enable Inline Item Addition]

    SaveDraft -->|No| ItemSection

    ItemSection --> ClickAddItem[User clicks 'Add Item' button]
    ClickAddItem --> ActivateInline[Activate Inline Add Row<br>isAddingItem=true]
    ActivateInline --> ShowPopover[Show Popover with<br>Command Search]
    ShowPopover --> SearchProduct[User types in<br>CommandInput]
    SearchProduct --> FilterProducts[Filter CommandList<br>in real-time]
    FilterProducts --> SelectProduct[User selects product<br>from CommandItem]
    SelectProduct --> CheckStock[Real-time Stock<br>Availability Check]
    CheckStock --> ShowStock[Display Available Qty]
    ShowStock --> EnterQty[User enters quantity<br>in inline input]
    EnterQty --> ValidateInline{Valid item<br>data?}
    ValidateInline -->|No| InlineError[Display inline error]
    InlineError --> EnterQty

    ValidateInline -->|Yes| ClickConfirm{User clicks<br>Add or Cancel?}
    ClickConfirm -->|Cancel| ResetInline[Reset inline state<br>isAddingItem=false]
    ResetInline --> ItemSection

    ClickConfirm -->|Add| SaveItem[(Save Line Item<br>sequence_no++)]
    SaveItem --> ClearInline[Clear inline row<br>Reset state]
    ClearInline --> MoreItems{Add more<br>items?}
    MoreItems -->|Yes| ClickAddItem
    MoreItems -->|No| ReviewAll[Review All Items<br>in Table]

    ReviewAll --> EditItem{Need to<br>edit items?}
    EditItem -->|Yes| InlineEdit[Edit item inline<br>or Delete]
    InlineEdit --> ReviewAll

    EditItem -->|No| ReadySubmit{Ready to<br>submit?}
    ReadySubmit -->|No| SaveDraft2[(Save Draft)]
    SaveDraft2 --> End1([End: Draft Saved])

    ReadySubmit -->|Yes| FinalValidate{Final validation<br>passed?}
    FinalValidate -->|No| ValidationErrors[Display all errors]
    ValidationErrors --> ReviewAll

    FinalValidate -->|Yes| ConfirmSubmit[Confirmation Dialog]
    ConfirmSubmit --> SubmitReq[(Submit Requisition<br>status=in_progress)]
    SubmitReq --> InitWorkflow[Initialize Workflow]
    InitWorkflow --> NotifyApprover[Notify First Approver]
    NotifyApprover --> RedirectDetail[Navigate to Detail Page]
    RedirectDetail --> Success([End: Submitted])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Navigate fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style End1 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style HeaderError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style InlineError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ValidationErrors fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style SaveHeader fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style SaveItem fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style SubmitReq fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ActivateInline fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#000
    style ShowPopover fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#000
    style DetermineLocType fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:#000
```

**Key Features**:
- **Dedicated creation page**: User navigates to `/store-requisitions/new` instead of using a modal
- **Auto-populated fields**: "Requested By" displays current user's name automatically
- **"Request From" terminology**: Source location dropdown labeled as "Request From"
- **Location Type handling**: System determines INVENTORY, DIRECT, or CONSIGNMENT based on location
- **Inline add item pattern**: Product selection uses Popover with Command component for searchable dropdown
- **Real-time stock check**: System shows available stock when selecting products
- **Sequential item addition**: Items numbered sequentially (1, 2, 3...)
- **Validation at multiple stages**: Header validation, inline item validation, final submission validation
- **SR Number generation**: System auto-generates requisition number in format SR-YYMM-NNNN

**State Management**:
```typescript
// Key inline add item state variables
isAddingItem: boolean      // Controls inline row visibility
newItemProductId: string   // Selected product ID
newItemQty: number         // Entered quantity
productSearchOpen: boolean // Controls Popover visibility
```

---

### Item Issuance Flow

**Purpose**: Process of issuing approved items from store to department with receipt signature capture and inventory transaction creation

```mermaid
flowchart TD
    Start([Storekeeper opens<br>approved requisition]) --> ViewItems[View Approved Items]
    ViewItems --> SelectItems[Select Items to Issue]
    SelectItems --> ItemLoop[For Each Selected Item]

    ItemLoop --> VerifyStock{Stock available<br>in location?}
    VerifyStock -->|No| MarkBackorder[Mark Item Backordered]
    MarkBackorder --> NextItem{More items<br>to process?}

    VerifyStock -->|Yes| EnterIssuedQty[Enter Issued Quantity<br>≤ approved_qty]
    EnterIssuedQty --> OptionalBatch[Enter Batch/Lot Number<br>if applicable]
    OptionalBatch --> ValidateIssuance{Valid issuance<br>data?}

    ValidateIssuance -->|No| IssuanceError[Display error]
    IssuanceError --> EnterIssuedQty

    ValidateIssuance -->|Yes| ClickIssue[Click Issue Button]
    ClickIssue --> ShowSignatureDialog[Display Receipt<br>Signature Dialog]
    ShowSignatureDialog --> DisplayItems[Show Items Summary:<br>- Item descriptions<br>- Qty to issue<br>- Units]

    DisplayItems --> SignatureCanvas[Requestor Signs<br>on Canvas]
    SignatureCanvas --> HasSignature{Signature<br>drawn?}

    HasSignature -->|No| WaitSignature[Wait for Signature<br>Confirm disabled]
    WaitSignature --> SignatureActions{User Action?}
    SignatureActions -->|Draw| SignatureCanvas
    SignatureActions -->|Cancel| CancelSignature[Close Dialog<br>No Action]
    CancelSignature --> ViewItems

    HasSignature -->|Yes| EnableConfirm[Enable Confirm Button]
    EnableConfirm --> ConfirmReceipt{User clicks<br>Confirm Receipt?}
    ConfirmReceipt -->|Cancel| CancelSignature
    ConfirmReceipt -->|Confirm| CaptureSignature[Capture Signature Data:<br>- Base64 PNG image<br>- Timestamp]

    CaptureSignature --> StartTxn[(BEGIN TRANSACTION)]
    StartTxn --> CreateInventoryTxn[Create Inventory Transaction:<br>- Type: store_requisition<br>- From: source location<br>- To: destination location<br>- Qty: issued_qty<br>- Ref: SR number]

    CreateInventoryTxn --> UpdateStock1[Reduce Stock at<br>Source Location]
    UpdateStock1 --> UpdateStock2[Increase Stock at<br>Destination Location]
    UpdateStock2 --> UpdateItem[Update Line Item:<br>- issued_qty<br>- inventory_transaction_id<br>- last_action=issued]

    UpdateItem --> StoreSignature[Store Receipt Data:<br>- receipt_signature<br>- receipt_timestamp<br>- received_by]

    StoreSignature --> CheckFullyIssued{issued_qty ==<br>approved_qty?}
    CheckFullyIssued -->|Yes| MarkItemComplete[Mark Item Fully Issued]
    CheckFullyIssued -->|No| MarkItemPartial[Mark Item Partially Issued]

    MarkItemComplete --> CommitTxn[(COMMIT TRANSACTION)]
    MarkItemPartial --> CommitTxn

    CommitTxn --> LogIssuance[Log Issuance in History<br>with Signature]
    LogIssuance --> NextItem

    NextItem -->|Yes| ItemLoop
    NextItem -->|No| CheckAllIssued{All items<br>fully issued?}

    CheckAllIssued -->|Yes| MarkReqComplete[(Update Requisition<br>status=completed)]
    CheckAllIssued -->|No| MarkReqPartial[(Update Requisition<br>status=in_progress)]

    MarkReqComplete --> NotifyRequestor[Notify Requestor<br>Items Issued]
    MarkReqPartial --> NotifyRequestor
    NotifyRequestor --> Success([End: Items Issued])

    StartTxn -->|Error| RollbackTxn[(ROLLBACK TRANSACTION)]
    RollbackTxn --> ErrorHandle[Log Error & Alert]
    ErrorHandle --> Fail([End: Issuance Failed])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Fail fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style IssuanceError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ShowSignatureDialog fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:#000
    style SignatureCanvas fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#000
    style CaptureSignature fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#000
    style StoreSignature fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style CreateInventoryTxn fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style UpdateStock1 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style UpdateStock2 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Receipt Signature Capture**:
- Dialog displays items summary table with quantities to be issued
- Canvas-based signature capture with mouse and touch support
- Confirm button disabled until signature is drawn
- Clear button to reset signature canvas
- Signature encoded as Base64 PNG via `canvas.toDataURL('image/png')`
- Timestamp captured at confirmation

**Transaction Safety**:
- All database operations in single transaction (BEGIN → COMMIT/ROLLBACK)
- Atomic updates: Inventory transaction + stock updates + line item update all succeed or all fail
- Rollback on any error preserves data integrity

**Partial Issuance Support**:
- Can issue less than approved quantity
- Track issued_qty separately from approved_qty
- Allow multiple issuance batches over time
- Requisition remains "in_progress" until all items fully issued

---

## Approval Workflow Diagram

### Multi-Stage Approval with Workflow Engine

**Purpose**: Dynamic approval routing based on workflow engine configuration, supporting multi-stage sequential and parallel approvals

**Usage**: Store Requisitions use workflow engine integration via tb_workflow table

```mermaid
flowchart TD
    Start([Requisition Submitted<br>status=in_progress]) --> ExtractParams[Extract Parameters:<br>- department_id<br>- from_location_id<br>- total amount<br>- priority flag]

    ExtractParams --> QueryEngine[Query Workflow Engine]
    QueryEngine --> LookupWorkflow[(Lookup tb_workflow<br>by department/type)]

    LookupWorkflow --> CheckWorkflow{Workflow<br>found?}
    CheckWorkflow -->|No| DefaultWorkflow[Use Default Workflow]
    CheckWorkflow -->|Yes| LoadWorkflow[Load Workflow Config]

    DefaultWorkflow --> DetermineType{Workflow<br>Type?}
    LoadWorkflow --> DetermineType

    DetermineType -->|Sequential| SeqStage1[Stage 1:<br>Department Manager]
    DetermineType -->|Parallel| ParStage1[Stage 1:<br>All Approvers Notified]
    DetermineType -->|Hybrid| HybridStage1[Stage 1:<br>Parallel + Sequential]

    SeqStage1 --> SeqWait1[Wait for Stage 1 Approval]
    SeqWait1 --> SeqDecision1{Stage 1<br>Decision?}

    SeqDecision1 -->|Reject| Rejected[Mark as Rejected<br>Notify Requestor]
    SeqDecision1 -->|Review| ReviewReq[Request Clarification<br>from Requestor]
    ReviewReq --> SeqWait1

    SeqDecision1 -->|Approve| RecordApproval1[Record Approval in<br>workflow_history JSON]
    RecordApproval1 --> UpdateStage1[Update workflow_current_stage]
    UpdateStage1 --> CheckNextStage{More<br>stages?}

    CheckNextStage -->|Yes| SeqStage2[Stage 2:<br>Store Manager]
    SeqStage2 --> SeqWait2[Wait for Stage 2 Approval]
    SeqWait2 --> SeqDecision2{Stage 2<br>Decision?}

    SeqDecision2 -->|Reject| Rejected
    SeqDecision2 -->|Review| ReviewReq
    SeqDecision2 -->|Approve| RecordApproval2[Record Approval]
    RecordApproval2 --> UpdateStage2[Update workflow_current_stage]
    UpdateStage2 --> CheckNextStage2{More<br>stages?}

    CheckNextStage2 -->|Yes| SeqStage3[Stage 3:<br>Purchasing Manager]
    SeqStage3 --> SeqWait3[Wait for Stage 3]
    SeqWait3 --> SeqDecision3{Stage 3<br>Decision?}

    SeqDecision3 -->|Reject| Rejected
    SeqDecision3 -->|Approve| RecordApproval3[Record Final Approval]
    RecordApproval3 --> AllApproved[All Stages Approved]

    CheckNextStage2 -->|No| AllApproved
    CheckNextStage -->|No| AllApproved

    ParStage1 --> ParWait1[Wait for All Approvers]
    ParWait1 --> ParDecision1{All<br>Approved?}
    ParDecision1 -->|No| Rejected
    ParDecision1 -->|Yes| AllApproved

    HybridStage1 --> HybridWait1[Mixed Stage Processing]
    HybridWait1 --> HybridDecision{All<br>Approved?}
    HybridDecision -->|No| Rejected
    HybridDecision -->|Yes| AllApproved

    AllApproved --> UpdateReqStatus[(Update Requisition:<br>- workflow_current_stage=Completed<br>- last_action=approved)]
    UpdateReqStatus --> NotifyAll[Notify All Parties]
    NotifyAll --> ReadyIssue([Ready for Issuance])

    Rejected --> UpdateRejected[(Update Requisition:<br>- last_action=rejected<br>- workflow_history with rejection)]
    UpdateRejected --> EndReject([End: Rejected])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style ReadyIssue fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style EndReject fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style QueryEngine fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style LookupWorkflow fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style RecordApproval1 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style RecordApproval2 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style RecordApproval3 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Workflow Engine Features**:
- **Dynamic routing**: Approval stages determined at runtime based on department, amount, priority
- **Workflow history tracking**: All approvals recorded in workflow_history JSON field
- **Current stage tracking**: workflow_current_stage, workflow_previous_stage, workflow_next_stage fields
- **Flexible stages**: Number and type of approval stages configurable per workflow
- **Review action**: Approvers can request clarification without rejecting
- **Sequential**: Each stage approves before moving to next
- **Parallel**: Multiple approvers at same stage approve concurrently
- **Hybrid**: Mix of sequential and parallel stages

**Workflow Data Storage**:
```json
workflow_history example:
[
  {
    "stage": "Department Manager Approval",
    "stage_order": 1,
    "action": "approved",
    "actor_id": "user-uuid-123",
    "actor_name": "John Smith",
    "actor_role": "Department Manager",
    "timestamp": "2025-01-16T09:15:00Z",
    "comments": "Approved for kitchen supplies",
    "approved_items": ['all']
  },
  {
    "stage": "Store Manager Review",
    "stage_order": 2,
    "action": "approved",
    "actor_id": "user-uuid-456",
    "actor_name": "Jane Doe",
    "actor_role": "Store Manager",
    "timestamp": "2025-01-16T14:30:00Z",
    "comments": "Stock available, approved for issuance",
    "approved_items": ['all']
  }
]
```

---

### Item-Level Approval Flow

**Purpose**: Approve or reject individual line items independently, support partial approvals

```mermaid
flowchart TD
    Start([Approver views<br>requisition items]) --> ReviewItems[Review Item List]
    ReviewItems --> SelectItem[Select Item to Review]

    SelectItem --> CheckStock2[Check Stock Availability<br>for Item]
    CheckStock2 --> ShowInfo[Show Product Info:<br>- Requested qty<br>- Available stock<br>- Unit cost<br>- Total]

    ShowInfo --> ApproverDecision{Approver<br>Decision?}

    ApproverDecision -->|Approve Full| ApproveFull[Approve Full Quantity]
    ApproveFull --> SetApprovedQty1[Set approved_qty =<br>requested_qty]

    ApproverDecision -->|Approve Partial| ApprovePartial[Enter Approved Quantity<br>< requested_qty]
    ApprovePartial --> EnterComments1[Enter Comments<br>explaining partial approval]
    EnterComments1 --> ValidatePartial{Valid approved<br>quantity?}
    ValidatePartial -->|No| PartialError[Error: Invalid quantity]
    PartialError --> ApprovePartial
    ValidatePartial -->|Yes| SetApprovedQty2[Set approved_qty to<br>entered value]

    ApproverDecision -->|Reject| RejectItem[Reject Item]
    RejectItem --> EnterRejectReason[Enter Rejection Reason<br>required]
    EnterRejectReason --> ValidateReject{Reason<br>provided?}
    ValidateReject -->|No| RejectError[Error: Reason required]
    RejectError --> EnterRejectReason
    ValidateReject -->|Yes| SetRejected[Set last_action=rejected<br>approved_qty=NULL]

    ApproverDecision -->|Request Review| ReviewItem[Request Clarification]
    ReviewItem --> EnterReviewQuestion[Enter Review Question]
    EnterReviewQuestion --> SetReview[Set last_action=reviewed<br>review_message]

    SetApprovedQty1 --> UpdateItem1[(Update Line Item:<br>- approved_qty<br>- approved_by_id/name<br>- approved_date_at<br>- last_action=approved)]
    SetApprovedQty2 --> UpdateItem1
    SetRejected --> UpdateItem1
    SetReview --> UpdateItem1

    UpdateItem1 --> LogItemHistory[Add to Item history JSON]
    LogItemHistory --> MoreItems{More items<br>to review?}

    MoreItems -->|Yes| SelectItem
    MoreItems -->|No| CheckAllItems{All items<br>processed?}

    CheckAllItems -->|Yes| UpdateHeader[(Update Requisition Header:<br>- last_action based on items<br>- workflow_history)]
    CheckAllItems -->|No| PartialReview[Some Items Pending]
    PartialReview --> SaveProgress[(Save Progress)]
    SaveProgress --> End1([End: Partial Review])

    UpdateHeader --> NotifyRequestor2[Notify Requestor of<br>Item Approvals/Rejections]
    NotifyRequestor2 --> Success([End: Items Reviewed])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style End1 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style PartialError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style RejectError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style UpdateItem1 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Item-Level Tracking**:
- Each item has independent approval status (approved, rejected, reviewed)
- Approver can approve full quantity or partial quantity
- Comments required for partial approvals and rejections
- Item history JSON tracks all actions on each item
- Requisition can have mixed item statuses (some approved, some rejected)

---

## Data Flow Diagram

### Level 0: Context Diagram

**Purpose**: Show the Store Requisitions system in context with external entities

```mermaid
flowchart LR
    Requestor([Requestor:<br>Chef, Housekeeper,<br>Engineer]) -->|Creates Request| System{"Store Requisitions<br>System"}
    System -->|Status Notifications| Requestor

    System <-->|Read/Write| DB[(Database:<br>tb_store_requisition<br>tb_store_requisition_detail)]

    System -->|Send for Approval| Approver([Approver:<br>Dept Manager,<br>Store Manager,<br>Purchasing Mgr])
    Approver -->|Approval Decision| System

    System <-->|Stock Check<br>Inventory Txn| InventorySys[Inventory<br>Management<br>System]

    System <-->|Workflow Query<br>Approval Routing| WorkflowEngine[Workflow<br>Engine]

    System <-->|User Info<br>Permissions| UserMgmt[User<br>Management<br>System]

    System -->|Issue Items| Storekeeper([Storekeeper])
    Storekeeper -->|Issuance Data| System

    style Requestor fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style System fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Approver fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Storekeeper fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style DB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style InventorySys fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style WorkflowEngine fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style UserMgmt fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
```

**External Entities**:
- **Requestor**: Department staff who create requisitions (Chef, Housekeeper, Engineering Technician)
- **Approver**: Managers who approve requisitions (Department Manager, Store Manager, Purchasing Manager)
- **Storekeeper**: Staff who issue materials from store to departments
- **Database**: PostgreSQL database storing requisition data
- **Inventory Management System**: External module managing stock levels and transactions
- **Workflow Engine**: External module managing approval workflows
- **User Management System**: External module managing users, roles, permissions

---

### Level 1: System Decomposition

**Purpose**: Show major processes and data stores within Store Requisitions system

```mermaid
flowchart TD
    subgraph SRS [Store Requisitions System]
        P1[1.0<br>Capture Requisition Data]
        P2[2.0<br>Validate Business Rules]
        P3[3.0<br>Manage Approval Workflow]
        P4[4.0<br>Check Inventory]
        P5[5.0<br>Issue Items]
        P6[6.0<br>Send Notifications]

        DS1[(D1: tb_store_requisition<br>Header data)]
        DS2[(D2: tb_store_requisition_detail<br>Line items)]
        DS3[(D3: Workflow History<br>JSON in header)]
        DS4[(D4: Item History<br>JSON in details)]
    end

    Requestor([Requestor]) -->|Requisition Data| P1
    P1 -->|Raw Data| P2
    P2 -->|Validated Data| DS1
    P2 -->|Validated Items| DS2
    DS1 -->|Header Info| P3
    DS2 -->|Item Info| P3
    P3 <-->|Workflow Status| DS3
    P3 <-->|Item Approvals| DS4
    P3 -->|Approved Requisition| P4
    P4 <-->|Stock Query| Inventory[Inventory System]
    P4 -->|Stock Available| P5
    P5 -->|Issuance Data| DS1
    P5 -->|Item Updates| DS2
    P5 <-->|Create Transaction| Inventory
    P5 -->|Completion| P6
    P6 -->|Email/SMS| Requestor
    P6 -->|Notification| Approver([Approver])
    P6 -->|Notification| Storekeeper([Storekeeper])

    Approver -->|Approval Decision| P3
    Storekeeper -->|Issue Items| P5

    P3 <-->|Query Workflow| WorkflowEngine[Workflow Engine]

    style Requestor fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Approver fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Storekeeper fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style P1 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style P2 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style P3 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style P4 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style P5 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style P6 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style DS1 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style DS2 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style DS3 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style DS4 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style Inventory fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style WorkflowEngine fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
```

**Data Stores**:
- **D1: tb_store_requisition**: Main requisition header data (SR number, status, workflow tracking, audit fields)
- **D2: tb_store_requisition_detail**: Line item data (products, quantities, approval status)
- **D3: Workflow History**: Approval history stored in workflow_history JSON field
- **D4: Item History**: Item-level action history stored in history JSON field

**Processes**:
1. **1.0 Capture Requisition Data**: Receive and collect user input for header and line items
2. **2.0 Validate Business Rules**: Validate against business rules (required fields, quantities, stock availability)
3. **3.0 Manage Approval Workflow**: Handle multi-stage approval workflow with workflow engine
4. **4.0 Check Inventory**: Verify stock availability and reserve stock if needed
5. **5.0 Issue Items**: Process item issuance, create inventory transactions, update stock levels
6. **6.0 Send Notifications**: Notify relevant parties at each stage (submission, approval, issuance)

---

## Sequence Diagram

### Create Requisition Sequence

**Purpose**: Time-ordered sequence of component interactions when creating a new requisition

**Scenario**: Chef creates new requisition for kitchen supplies

```mermaid
sequenceDiagram
    actor Chef
    participant UI as StoreRequisition<br>List Page
    participant DetailPage as StoreRequisition<br>Detail Page
    participant ServerAction as createRequisition<br>Server Action
    participant InvService as Inventory Service
    participant DB as Database
    participant Workflow as Workflow Engine

    Chef->>UI: Click "New Requisition"
    UI->>DetailPage: Navigate to /store-requisitions/new
    DetailPage->>Chef: Display empty form

    Chef->>DetailPage: Enter header info + items
    DetailPage->>InvService: checkStockAvailability(productId)
    InvService-->>DetailPage: Return available qty
    DetailPage->>Chef: Show available stock

    Chef->>DetailPage: Click "Submit"
    DetailPage->>ServerAction: createRequisition(formData)

    ServerAction->>ServerAction: Validate data
    ServerAction->>DB: BEGIN TRANSACTION
    ServerAction->>DB: INSERT tb_store_requisition<br>(sr_no, status=in_progress)
    DB-->>ServerAction: Return requisition id

    ServerAction->>DB: INSERT tb_store_requisition_detail<br>(items array)
    DB-->>ServerAction: Return item ids

    ServerAction->>Workflow: initiateWorkflow(requisitionId,<br>departmentId)
    Workflow->>Workflow: Lookup workflow by dept
    Workflow-->>ServerAction: Return first stage + approvers

    ServerAction->>DB: UPDATE requisition<br>(workflow_id, workflow_current_stage)
    ServerAction->>DB: COMMIT TRANSACTION
    DB-->>ServerAction: Success

    ServerAction->>Workflow: notifyApprovers(approverIds)
    Workflow-->>ServerAction: Notifications queued

    ServerAction-->>DetailPage: Return success + requisition_id
    DetailPage-->>Chef: Display success message
    DetailPage->>DetailPage: Navigate to /store-requisitions/[id]
    DetailPage-->>Chef: Show created requisition
```

**Key Interactions**:
1. Chef initiates action through UI
2. UI navigates to detail page with empty form
3. Detail page queries inventory service for stock availability
4. Chef submits completed form
5. Server action validates data
6. Server action creates requisition and items in database transaction
7. Server action initializes workflow via workflow engine
8. Workflow engine returns first approval stage and approvers
9. Server action updates requisition with workflow info
10. Server action triggers notifications to approvers
11. UI displays success and navigates to created requisition

**Timing**:
- Synchronous operations (1-10): ~500ms total
- Asynchronous operations (notifications): Background, ~5-10 seconds

---

### Approval Sequence Diagram

**Purpose**: Component interactions during approval process

**Scenario**: Department Manager approves requisition

```mermaid
sequenceDiagram
    actor Manager
    participant UI as Requisition<br>Detail Page
    participant ApprovalComp as Approval Workflow<br>Component
    participant ServerAction as approveRequisition<br>Server Action
    participant WorkflowSvc as Workflow Engine
    participant DB as Database
    participant NotifSvc as Notification Service

    Manager->>UI: Open requisition from approval queue
    UI->>DB: getRequisitionDetails(id)
    DB-->>UI: Return requisition + items + workflow
    UI->>ApprovalComp: Render approval component
    ApprovalComp-->>Manager: Show items + workflow stage

    Manager->>ApprovalComp: Review items
    Manager->>ApprovalComp: Click "Approve"
    ApprovalComp->>Manager: Show approval dialog
    Manager->>ApprovalComp: Enter comments + confirm

    ApprovalComp->>ServerAction: approveRequisition(id, comments)

    ServerAction->>ServerAction: Validate approver permission
    ServerAction->>DB: BEGIN TRANSACTION

    ServerAction->>WorkflowSvc: recordApproval(requisitionId,<br>stageId, approverId)
    WorkflowSvc->>WorkflowSvc: Validate stage + approver
    WorkflowSvc->>WorkflowSvc: Check if stage complete
    WorkflowSvc-->>ServerAction: Return next stage or 'completed'

    ServerAction->>DB: UPDATE tb_store_requisition<br>workflow_history JSON (append approval)
    ServerAction->>DB: UPDATE workflow_current_stage,<br>last_action=approved

    alt More approval stages
        ServerAction->>DB: Update workflow_next_stage
        ServerAction->>DB: COMMIT TRANSACTION
        ServerAction->>NotifSvc: notifyNextApprovers(approverIds)
        NotifSvc-->>ServerAction: Queued
        ServerAction-->>ApprovalComp: Success: Routed to next stage
    else Final stage complete
        ServerAction->>DB: Mark all items approved_qty
        ServerAction->>DB: COMMIT TRANSACTION
        ServerAction->>NotifSvc: notifyStorekeeper(requisitionId)
        NotifSvc-->>ServerAction: Queued
        ServerAction-->>ApprovalComp: Success: Ready for issuance
    end

    ApprovalComp-->>UI: Update requisition display
    UI-->>Manager: Show success message

```

**Key Decision Points**:
- **Validate approver permission**: Server action verifies user has authority for current workflow stage
- **Check stage complete**: Workflow engine determines if all approvers at current stage have approved
- **More stages?**: Workflow engine determines if additional approval stages required
- **Next stage or completed**: Routes to next approval stage or marks as ready for issuance

---

### Issuance Sequence Diagram

**Purpose**: Component interactions during item issuance with receipt signature capture and inventory transaction creation

**Scenario**: Storekeeper issues approved items to department with requestor signature

```mermaid
sequenceDiagram
    actor Storekeeper
    actor Requestor
    participant UI as Requisition<br>Detail Page
    participant IssueComp as Issue Items<br>Component
    participant SignDialog as Receipt Signature<br>Dialog
    participant ServerAction as issueItems<br>Server Action
    participant InvService as Inventory Service
    participant DB as Database
    participant NotifSvc as Notification Service

    Storekeeper->>UI: Open approved requisition
    UI->>DB: getRequisitionDetails(id)
    DB-->>UI: Return requisition with approved items
    UI->>IssueComp: Render issuance component
    IssueComp-->>Storekeeper: Show approved items

    Storekeeper->>IssueComp: Select items to issue
    IssueComp->>InvService: checkStockAvailability(items)
    InvService-->>IssueComp: Return current stock levels
    IssueComp-->>Storekeeper: Show available stock

    Storekeeper->>IssueComp: Enter issued quantities + batches
    Storekeeper->>IssueComp: Click "Issue" button
    IssueComp->>SignDialog: Open signature dialog<br>(items to issue)
    SignDialog-->>Storekeeper: Display items summary table

    Note over Requestor,SignDialog: Requestor signs for receipt

    Requestor->>SignDialog: Draw signature on canvas
    SignDialog->>SignDialog: Enable Confirm button<br>(hasSignature=true)
    Requestor->>SignDialog: Click "Confirm Receipt"
    SignDialog->>SignDialog: Capture signature data<br>(Base64 PNG + timestamp)
    SignDialog->>IssueComp: onConfirm(signatureData, timestamp)
    IssueComp->>SignDialog: Close dialog

    IssueComp->>ServerAction: issueItems(requisitionId,<br>issuanceData, signatureData)

    ServerAction->>ServerAction: Validate quantities
    ServerAction->>DB: BEGIN TRANSACTION

    loop For each item
        ServerAction->>InvService: createInventoryTransaction({<br>type: 'store_requisition',<br>from_location_id,<br>to_location_id,<br>product_id,<br>quantity: issued_qty,<br>reference: sr_no<br>})

        InvService->>DB: INSERT tb_inventory_transaction
        DB-->>InvService: Return transaction_id

        InvService->>DB: UPDATE stock levels:<br>- Reduce from_location<br>- Increase to_location
        DB-->>InvService: Stock updated

        InvService-->>ServerAction: Return transaction_id

        ServerAction->>DB: UPDATE tb_store_requisition_detail<br>(issued_qty, inventory_transaction_id,<br>receipt_signature, receipt_timestamp)
    end

    ServerAction->>ServerAction: Check if all items fully issued

    alt All items fully issued
        ServerAction->>DB: UPDATE requisition<br>status=completed
    else Partial issuance
        ServerAction->>DB: UPDATE requisition<br>status=in_progress
    end

    ServerAction->>DB: COMMIT TRANSACTION
    DB-->>ServerAction: Success

    ServerAction->>NotifSvc: notifyRequestor(requisitionId)
    NotifSvc-->>ServerAction: Queued

    ServerAction-->>IssueComp: Return success + updated data
    IssueComp-->>UI: Refresh requisition display
    UI-->>Storekeeper: Show success message

```

**Receipt Signature Sequence**:
1. Storekeeper clicks "Issue" button in Issue workflow stage
2. System displays ReceiptSignatureDialog with items summary
3. Requestor draws signature on canvas (mouse or touch)
4. System enables "Confirm Receipt" button when signature detected
5. Requestor clicks "Confirm Receipt"
6. System captures signature as Base64 PNG and timestamp
7. System proceeds with inventory transaction
8. Signature data stored with issuance record

**Transaction Flow**:
1. All issuance operations in single database transaction
2. For each item:
   - Create inventory transaction record
   - Update stock at source location (reduce)
   - Update stock at destination location (increase)
   - Update line item with issued_qty and transaction_id
3. Update requisition status (completed or in_progress)
4. Commit transaction (all succeed or all fail)
5. Send notification to requestor

**Atomicity**:
- If any step fails, entire transaction rolled back
- Stock levels remain consistent
- No partial inventory updates

---

## State Diagram

### Requisition Status State Diagram

**Purpose**: Document all possible status states and transitions for requisition header

**Entity**: tb_store_requisition (status field: doc_status)

```mermaid
stateDiagram-v2
    [*] --> draft: User creates requisition

    draft --> in_progress: User submits
    draft --> [*]: User deletes (soft delete)

    in_progress --> completed: All items approved & issued
    in_progress --> cancelled: User cancels
    in_progress --> voided: Admin voids
    in_progress --> draft: Approver returns for revision

    completed --> voided: Admin voids (rare)
    cancelled --> [*]
    voided --> [*]
    completed --> [*]
```

**State Definitions**:

| State | Description | Can Transition To | Entry Actions | Exit Actions |
|-------|-------------|-------------------|---------------|--------------|
| draft | Initial state, user editing | in_progress, Deleted | Set doc_status=draft, Generate SR number | Validate completeness |
| in_progress | Submitted, in approval workflow | completed, cancelled, voided, draft | Initialize workflow, Notify approvers, Lock editing | - |
| completed | All items approved and issued | voided | Mark all items issued, Close workflow | Archive after 12 months |
| cancelled | User cancelled before completion | None | Release reserved stock, Notify parties, Close workflow | - |
| voided | Admin voided (error correction) | None | Reverse transactions if needed, Log reason | - |

**Transition Rules**:

1. **draft → in_progress**:
   - **Trigger**: User clicks "Submit"
   - **Guards**: All required fields complete, at least 1 line item, valid source location, valid department
   - **Actions**: Generate SR number if not exists, initialize workflow, notify first approvers, set status=in_progress

2. **in_progress → completed**:
   - **Trigger**: Last item fully issued
   - **Guards**: All items have issued_qty == approved_qty, all workflow stages complete
   - **Actions**: Set status=completed, close workflow, notify requestor

3. **in_progress → cancelled**:
   - **Trigger**: User clicks "Cancel" or admin cancels
   - **Guards**: User is creator OR user is admin, no items issued yet
   - **Actions**: Set status=cancelled, release any reserved stock, notify parties, close workflow

4. **in_progress → draft**:
   - **Trigger**: Approver clicks "Return for Revision"
   - **Guards**: Workflow allows returns, no items issued
   - **Actions**: Set status=draft, clear workflow data, notify requestor

5. **Any → voided**:
   - **Trigger**: Admin voids requisition
   - **Guards**: User has admin role, reason provided
   - **Actions**: Set status=voided, reverse inventory transactions if issued, log reason, notify parties

**State Guards** (Conditions that must be met for transitions):

**Can Submit Guard**:
- **Condition Name**: Can Submit Requisition
- **Required Checks**:
  - Header: sr_date provided, from_location_id set, department_id set, requestor_id set
  - Items: At least 1 line item exists, all items have product_id and requested_qty > 0
  - Validation: No validation errors
- **Implementation**: Application validates before allowing submission

**Can Cancel Guard**:
- **Condition Name**: Can Cancel Requisition
- **Required Checks**:
  - User is creator (created_by_id) OR user has 'admin' role
  - Status is 'in_progress' (not completed/voided/cancelled)
  - No items have been issued (all issued_qty IS NULL or = 0)
- **Implementation**: Application checks user permission and issued quantities

**Can Void Guard**:
- **Condition Name**: Can Void Requisition
- **Required Checks**:
  - User has 'admin' role
  - Reason for voiding provided (mandatory for audit)
  - Status is not already 'voided'
- **Implementation**: Application restricts void action to admin users only

---

### Line Item Status State Diagram

**Purpose**: Document status states and transitions for individual line items

**Entity**: tb_store_requisition_detail (status field: last_action)

```mermaid
stateDiagram-v2
    [*] --> submitted: Item added to requisition

    submitted --> approved: Approver approves
    submitted --> rejected: Approver rejects
    submitted --> reviewed: Approver requests review

    reviewed --> approved: Requestor provides info, approver approves
    reviewed --> rejected: Requestor provides info, approver rejects
    reviewed --> submitted: Requestor provides info

    approved --> issued: Storekeeper issues item
    issued --> [*]: Item fully issued

    rejected --> [*]: Item rejected
    approved --> [*]: Requisition cancelled
```

**State Definitions**:

| State | Description | Can Transition To | Entry Actions | Exit Actions |
|-------|-------------|-------------------|---------------|--------------|
| submitted | Item added, awaiting approval | approved, rejected, reviewed | Set last_action=submitted, requested_qty set | - |
| approved | Approver approved item | issued | Set approved_qty, approved_by_id/name, approved_date_at, last_action=approved | - |
| rejected | Approver rejected item | None | Set reject_message, reject_by_id/name, reject_date_at, last_action=rejected | - |
| reviewed | Approver requests clarification | approved, rejected, submitted | Set review_message, review_by_id/name, review_date_at, last_action=reviewed | - |
| issued | Item issued to department | None | Set issued_qty, inventory_transaction_id, update stock | - |

**Item-Level Transition Rules**:

1. **submitted → approved**:
   - **Guards**: Approver has permission for current workflow stage, approved_qty ≤ requested_qty
   - **Actions**: Set approved_qty (full or partial), record approver details, update last_action=approved

2. **submitted → rejected**:
   - **Guards**: Approver has permission, rejection reason provided
   - **Actions**: Set reject_message, record rejector details, set last_action=rejected, approved_qty remains NULL

3. **submitted → reviewed**:
   - **Guards**: Approver has permission, review question provided
   - **Actions**: Set review_message, record reviewer details, set last_action=reviewed, notify requestor

4. **reviewed → approved/rejected**:
   - **Guards**: Requestor provided clarification, approver re-reviews
   - **Actions**: Follow normal approval or rejection flow

5. **approved → issued**:
   - **Guards**: Requisition workflow complete, stock available, issued_qty ≤ approved_qty
   - **Actions**: Set issued_qty, link to inventory_transaction_id, update stock levels

**Parallel Item States**:
- Different items within same requisition can have different states simultaneously
- Example: Item 1 approved, Item 2 rejected, Item 3 under review, Item 4 issued
- Requisition remains "in_progress" until all items reach terminal state (issued, rejected, or cancelled)

---

## System Integration Flow

### Inventory Integration Flow

**Purpose**: Integration with Inventory Management module for stock checks and inventory transactions

**Systems Involved**:
- **Internal**: Store Requisitions module
- **External**: Inventory Management module
- **Integration Method**: Direct service calls (shared database, service layer)

```mermaid
flowchart TD
    subgraph SR [Store Requisitions]
        SR1[Check Stock<br>Availability] --> SR2[Prepare Issuance Data]
        SR2 --> SR3[Call Inventory Service]
        SR3 --> SR4{Transaction<br>Success?}
        SR4 -->|Yes| SR5[Update Line Item<br>with Transaction ID]
        SR4 -->|Error| SR6[Retry Logic]
        SR6 -->|Max Retries| SR7[Error Handler]
        SR6 -->|Retry| SR3
        SR5 --> SR8[Complete Issuance]
        SR7 --> SR9[Alert Admin & Rollback]
    end

    subgraph INV [Inventory Management]
        INV1[Receive Stock Query] --> INV2[Calculate Available Stock]
        INV2 --> INV3[Return Stock Data]

        INV4[Receive Transaction Request] --> INV5{Validate<br>Transaction?}
        INV5 -->|Invalid| INV6[Return Error]
        INV5 -->|Valid| INV7[BEGIN Transaction]
        INV7 --> INV8[Create Transaction Record]
        INV8 --> INV9[Update Stock at Source<br>Reduce Qty]
        INV9 --> INV10[Update Stock at Destination<br>Increase Qty]
        INV10 --> INV11[COMMIT Transaction]
        INV11 --> INV12[Return Success + Transaction ID]
    end

    SR1 -.->|checkStockAvailability| INV1
    INV3 -.->|Available Qty| SR1
    SR3 -.->|createInventoryTransaction| INV4
    INV12 -.->|Transaction ID| SR4
    INV6 -.->|Error Message| SR4

    style SR1 fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style SR5 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style SR7 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style SR9 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style INV2 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style INV7 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style INV8 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style INV9 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style INV10 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style INV11 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style INV12 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

**Integration Points**:

**1. Stock Availability Check**:
- **Method**: `checkStockAvailability(productId, locationId)`
- **When**: During requisition creation (real-time), before approval, before issuance
- **Request**: `{ product_id: UUID, location_id: UUID }`
- **Response**: `{ available_qty: Decimal, on_order: Decimal, reserved: Decimal }`
- **Purpose**: Display available stock to user, validate quantities

**2. Create Inventory Transaction**:
- **Method**: `createInventoryTransaction(transactionData)`
- **When**: When storekeeper issues items
- **Request**:
```json
{
  "type": "store_requisition",
  "from_location_id": "uuid",
  "to_location_id": "uuid",
  "product_id": "uuid",
  "quantity": 10.00000,
  "reference_type": "store_requisition",
  "reference_id": "requisition_uuid",
  "reference_number": "SR-2501-0001",
  "batch_lot_number": "BATCH-123 (optional)",
  "performed_by_id": "user_uuid"
}
```
- **Response**: `{ transaction_id: UUID, success: boolean, error?: string }`
- **Purpose**: Record stock movement, update stock levels atomically

**3. Validate Stock Availability**:
- **Method**: `validateStockAvailability(productId, locationId, requestedQty)`
- **When**: Before approval, before issuance
- **Request**: `{ product_id: UUID, location_id: UUID, requested_qty: Decimal }`
- **Response**: `{ is_available: boolean, available_qty: Decimal, message?: string }`
- **Purpose**: Prevent issuing more than available stock

**Error Handling**:
- **Retry Policy**: Exponential backoff (1s, 2s, 4s) for transient errors
- **Timeout**: 10 seconds per inventory service call
- **Rollback**: Transaction rolled back if inventory update fails
- **Logging**: All inventory calls logged for audit
- **Alerting**: Admin alerted on repeated failures

---

### Workflow Engine Integration

**Purpose**: Integration with Workflow Engine for dynamic approval routing

```mermaid
flowchart TD
    subgraph SR2 [Store Requisitions]
        WF1[Requisition Submitted] --> WF2[Extract Parameters:<br>department, amount]
        WF2 --> WF3[Call Workflow Engine]
        WF3 --> WF4{Workflow<br>Returned?}
        WF4 -->|No| WF5[Use Default Workflow]
        WF4 -->|Yes| WF6[Store Workflow Data]
        WF5 --> WF6
        WF6 --> WF7[Notify First Approvers]

        WF8[Approval Action] --> WF9[Call Workflow Engine]
        WF9 --> WF10[Record Approval]
        WF10 --> WF11{More<br>Stages?}
        WF11 -->|Yes| WF12[Get Next Stage]
        WF11 -->|No| WF13[Mark Complete]
        WF12 --> WF14[Notify Next Approvers]
    end

    subgraph WFE [Workflow Engine]
        WFE1[Receive Workflow Query] --> WFE2{Lookup<br>Rules}
        WFE2 -->|Found| WFE3[Load Workflow Config]
        WFE2 -->|Not Found| WFE4[Return Error]
        WFE3 --> WFE5[Determine Stages]
        WFE5 --> WFE6[Get Approvers per Stage]
        WFE6 --> WFE7[Return Workflow Data]

        WFE8[Receive Approval Record] --> WFE9[Validate Stage + Approver]
        WFE9 --> WFE10[Update Workflow State]
        WFE10 --> WFE11{Stage<br>Complete?}
        WFE11 -->|Yes| WFE12{More<br>Stages?}
        WFE11 -->|No| WFE13[Wait More Approvals]
        WFE12 -->|Yes| WFE14[Return Next Stage]
        WFE12 -->|No| WFE15[Return Complete]
    end

    WF3 -.->|initiateWorkflow| WFE1
    WFE7 -.->|Workflow Data| WF4
    WFE4 -.->|Error| WF4
    WF9 -.->|recordApproval| WFE8
    WFE14 -.->|Next Stage Data| WF11
    WFE15 -.->|Complete Status| WF11

    style WF1 fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style WF13 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style WFE3 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style WFE10 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Integration Methods**:

**1. Initiate Workflow**:
- **Method**: `initiateWorkflow(requisitionId, departmentId, amount?, priority?)`
- **When**: When requisition submitted (status draft → in_progress)
- **Request**: `{ requisition_id: UUID, department_id: UUID, amount?: Decimal, priority?: string }`
- **Response**:
```json
{
  "workflow_id": "uuid",
  "workflow_name": "Standard Department Workflow",
  "workflow_type": "sequential",
  "stages": [
    {
      "stage_id": "uuid",
      "stage_name": "Department Manager Approval",
      "stage_order": 1,
      "approvers": [
        {'user_id': 'uuid', 'user_name': 'John Smith', 'role': 'Department Manager'}
      ]
    },
    {
      "stage_id": "uuid",
      "stage_name": "Store Manager Review",
      "stage_order": 2,
      "approvers": [...]
    }
  ]
}
```

**2. Record Approval**:
- **Method**: `recordApproval(requisitionId, stageId, approverId, comments)`
- **When**: When approver approves/rejects at a stage
- **Request**: `{ requisition_id: UUID, stage_id: UUID, approver_id: UUID, action: 'approved'|'rejected', comments?: string }`
- **Response**:
```json
{
  "stage_complete": true,
  "workflow_complete": false,
  "next_stage": {
    "stage_id": "uuid",
    "stage_name": "Store Manager Review",
    "approvers": [...]
  }
}
```

**3. Get Workflow Status**:
- **Method**: `getWorkflowStatus(requisitionId)`
- **When**: When displaying requisition details
- **Response**: Current workflow state, completed stages, pending stages

---

## Error Handling Flow

### Error Processing Flow

**Purpose**: Document how errors are handled and recovered throughout the requisition lifecycle

```mermaid
flowchart TD
    Start[Operation Start] --> Try{Try Operation}

    Try -->|Success| Success([Success])
    Try -->|Error| Classify{Error Type}

    Classify -->|Validation| E1[Validation Error Handler]
    Classify -->|Network/Timeout| E2[Network Error Handler]
    Classify -->|Business Rule| E3[Business Rule Error Handler]
    Classify -->|Database| E4[Database Error Handler]
    Classify -->|Integration| E5[Integration Error Handler]
    Classify -->|System/Unexpected| E6[System Error Handler]

    E1 --> V1[Collect Validation Errors]
    V1 --> V2[Display User-Friendly Messages]
    V2 --> V3[Highlight Error Fields]
    V3 --> UserFix1[User Corrects Data]
    UserFix1 --> Try

    E2 --> N1{Retryable?}
    N1 -->|Yes| N2[Exponential Backoff]
    N2 --> N3{Retry Count<br>< Max?}
    N3 -->|Yes| N4[Wait + Retry]
    N3 -->|No| N5[Exceed Max Retries]
    N4 --> Try
    N5 --> Log1[Log Error]
    Log1 --> Alert1[Alert Admin]
    Alert1 --> Manual1[Manual Intervention]

    N1 -->|No| N6[Non-Retryable Network Error]
    N6 --> Log1

    E3 --> B1[Display Business Error]
    B1 --> B2{User Can<br>Fix?}
    B2 -->|Yes| UserFix2[User Corrects]
    UserFix2 --> Try
    B2 -->|No| B3[Return Error to User]
    B3 --> End1([End: Error])

    E4 --> D1[Database Error Handler]
    D1 --> D2[Rollback Transaction]
    D2 --> D3{Deadlock/Lock?}
    D3 -->|Yes| D4[Retry After Delay]
    D4 --> Try
    D3 -->|No| D5[Connection/Constraint Error]
    D5 --> Log2[Log Database Error]
    Log2 --> Alert2[Alert DBA]
    Alert2 --> Manual2[Manual Intervention]

    E5 --> I1[Integration Error Handler]
    I1 --> I2{Service<br>Available?}
    I2 -->|No| I3[Use Cached Data<br>if available]
    I3 --> I4[Display Warning to User]
    I4 --> End2([End: Degraded])
    I2 -->|Yes| I5[Service Error Response]
    I5 --> Log3[Log Integration Error]
    Log3 --> Alert3[Alert Integration Team]
    Alert3 --> Manual3[Manual Intervention]

    E6 --> S1[System Error Handler]
    S1 --> S2[Capture Stack Trace]
    S2 --> S3[Log Full Error Context]
    S3 --> S4[Rollback Any Transactions]
    S4 --> S5[Display Generic Error]
    S5 --> S6[Alert On-Call Engineer]
    S6 --> Manual4[Investigate & Fix]

    Manual1 --> End3([End: Manual Fix])
    Manual2 --> End3
    Manual3 --> End3
    Manual4 --> End3

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style End1 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style End2 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style End3 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style E1 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style E3 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style E4 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style E6 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
```

**Error Types and Handling**:

**1. Validation Errors**:
- **Examples**: Missing required fields, invalid quantities, invalid dates
- **Handling**: Collect all errors, display user-friendly messages, highlight fields
- **Recovery**: User corrects data and resubmits
- **Logging**: Not logged (expected user errors)

**2. Network/Timeout Errors**:
- **Examples**: API timeout, service unavailable, connection refused
- **Handling**: Retry with exponential backoff (1s, 2s, 4s, 8s, 16s max)
- **Max Retries**: 5 attempts
- **Recovery**: If retries exhausted, alert admin for manual intervention
- **Logging**: Log all network errors with full context

**3. Business Rule Errors**:
- **Examples**: Stock not available, workflow not configured, user lacks permission
- **Handling**: Display clear business error message to user
- **Recovery**: If user can fix (e.g., select different product), allow correction; otherwise return error
- **Logging**: Log business rule violations for analytics

**4. Database Errors**:
- **Examples**: Deadlock, connection error, constraint violation, timeout
- **Handling**: Immediate transaction rollback
- **Deadlock**: Retry after short delay (200ms)
- **Other DB Errors**: Alert DBA, manual intervention
- **Recovery**: Retry for transient errors, manual fix for persistent errors
- **Logging**: Log all database errors with query context

**5. Integration Errors**:
- **Examples**: Inventory service down, workflow engine error, external API failure
- **Handling**: Use cached data if available, display warning
- **Recovery**: Degrade gracefully, retry periodically, alert integration team
- **Logging**: Log all integration failures with request/response

**6. System/Unexpected Errors**:
- **Examples**: Null pointer exception, unhandled exception, out of memory
- **Handling**: Capture full stack trace, rollback transactions, display generic error
- **Recovery**: Alert on-call engineer, investigate root cause, deploy fix
- **Logging**: Log full error context including user action, stack trace, environment

**Error Response Format** (API):
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "code": "VAL_001",
    "details": [
      {
        "field": "sr_date",
        "message": "Requisition date is required",
        "code": "REQUIRED_FIELD"
      },
      {
        "field": "items",
        "message": "At least one line item is required",
        "code": "MIN_ITEMS"
      }
    ]
  }
}
```

---

## Glossary

- **Actor**: User or system that interacts with the process (Chef, Approver, System)
- **Decision Point**: Point where flow branches based on conditions (diamond shape)
- **Fork/Join**: Parallel processing split and synchronization (concurrent activities)
- **Guard**: Condition that must be true for transition to occur (e.g., "Can Submit")
- **State**: Distinct condition or stage in lifecycle (draft, in_progress, completed)
- **Transition**: Movement from one state to another (draft → in_progress)
- **Swimlane**: Visual separation showing actor responsibilities
- **Sequence Diagram**: Shows time-ordered interactions between components
- **Data Flow Diagram**: Shows how data moves through system processes
- **State Diagram**: Shows all possible states and valid transitions
- **Integration Flow**: Shows interaction with external systems

**Store Requisitions Specific**:
- **SR Number**: Requisition business identifier (format: SR-YYMM-NNNN where YY is 2-digit year and MM is month)
- **Workflow Stage**: Approval stage in multi-level workflow
- **Item-Level Approval**: Approving individual line items independently
- **Partial Approval**: Approving less than requested quantity
- **Partial Issuance**: Issuing items in multiple batches
- **Inventory Transaction**: Record of stock movement between locations
- **Workflow Engine**: External module managing approval workflows
- **Stock Availability**: Current available quantity at location

---

## Diagram Conventions

### Notation Guide

**Flowchart Symbols**:
- **Rectangle**: Process step or action
- **Diamond**: Decision point (yes/no branch)
- **Rounded Rectangle**: Start/End point
- **Parallelogram**: Input/Output operation
- **Cylinder**: Database or data store
- **Hexagon**: Subgraph/container for related steps

**Arrow Styles**:
- **Solid Arrow** (→): Direct flow, synchronous
- **Dashed Arrow** (-.->): Return flow, callback, or asynchronous
- **Thick Arrow**: Primary or happy path
- **Thin Arrow**: Alternative or error path

**Colors** (used in diagrams):
- **Blue (#cce5ff)**: Start point, user actors, information
- **Green (#ccffcc)**: Success endpoint, positive outcomes
- **Red (#ffcccc)**: Error endpoint, failures, critical issues
- **Orange (#ffe0b3)**: Warning, validation errors, partial success
- **Purple (#e0ccff)**: Database operations, data storage
- **Gray (#e8e8e8)**: Neutral operations, system processes

**Mermaid Diagram Types Used**:
- **flowchart TD/LR**: Top-down or left-right flowcharts for processes
- **sequenceDiagram**: Time-ordered component interactions
- **stateDiagram-v2**: State machines showing status transitions
- **graph TD**: Decision trees and hierarchical flows

---

## Tools Used

- **Mermaid**: Primary diagramming tool (renders in markdown)
  - Version: Latest (compatible with GitHub/GitLab)
  - Benefits: Text-based, version controlled, renders in documentation
  - All diagrams in this document use Mermaid syntax

---

## Maintenance

### Update Triggers

Update these flow diagrams when:
- **Process changes**: Approval workflow modified, new stages added
- **New features**: Emergency requisitions, bulk requisitions
- **Business rules modified**: Quantity validations, approval thresholds changed
- **System integrations changed**: New integration with accounting system
- **State transitions updated**: New statuses added (e.g., "on_hold")
- **Database schema changes**: New tables, fields affecting flows
- **Error handling changes**: New error types, retry logic modified

### Review Schedule

- **Monthly**: Quick review for any process changes
- **Quarterly**: Comprehensive review of all diagrams
- **On Change**: Immediate update for major changes (new workflow stages, status changes)
- **Annual**: Complete documentation review with stakeholders

### Diagram Update Process

1. Identify which diagrams affected by change
2. Update Mermaid diagram source code
3. Test diagram rendering (preview in markdown viewer)
4. Update related text descriptions and flow steps
5. Cross-reference with other documents (BR, UC, TS, DS, VAL)
6. Review with team for accuracy
7. Commit changes with clear description

---

## Related Documents

- [Business Requirements](./BR-store-requisitions.md) - Functional requirements and business rules
- [Use Cases](./UC-store-requisitions.md) - Detailed user workflows and scenarios
- [Technical Specification](./TS-store-requisitions.md) - System architecture and component design
- [Data Schema](./DS-store-requisitions.md) - Database structure and relationships
- [Validations](./VAL-store-requisitions.md) - Validation rules and Zod schemas
- [Backend Requirements](./BR-store-requisitions.md#10-backend-requirements) - Backend API and service requirements (Section 10 of BR)
- [Inventory Operations Shared Method](../../shared-methods/inventory-operations/SM-inventory-operations.md) - Inventory transaction patterns
- [Costing Methods Shared Method](../../shared-methods/inventory-valuation/SM-costing-methods.md) - FIFO/AVG costing integration

---

**Document End**

> 📝 **Note to Authors**:
> - Keep diagrams focused and not overly complex (max 20-25 nodes per diagram)
> - Use consistent notation and colors throughout all diagrams
> - Update diagrams immediately when process or business rules change
> - Test diagram rendering in target platform (GitHub, GitLab, documentation site)
> - Maintain text descriptions alongside diagrams for accessibility
> - Review diagrams with stakeholders quarterly for accuracy
> - Use subgraphs to group related steps and improve readability
> - Add alt/notes to sequence diagrams for conditional flows
