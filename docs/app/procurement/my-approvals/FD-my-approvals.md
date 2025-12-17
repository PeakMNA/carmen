# Flow Diagrams: My Approvals

## Module Information
- **Module**: Procurement
- **Sub-Module**: My Approvals
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

This document provides comprehensive visual workflows for the My Approvals module, which serves as the centralized approval interface for all document types requiring approval in the Carmen ERP system. The diagrams cover the complete approval lifecycle from queue loading through multi-level approval workflows to final document approval or rejection, including system integrations with Budget Management, Inventory Management, Finance Systems, and the Workflow Engine.

**Key Processes Documented**:
- Unified approval queue loading and real-time updates
- Single document review and approval workflow (approve, reject, request info)
- Bulk approval processing with atomic transactions
- Approval delegation setup, activation, and expiration
- Multi-level approval routing and workflow progression
- SLA monitoring, escalation, and deadline management
- Status transitions and state management across queue items and delegations
- System integrations (Budget, Inventory, Finance, Workflow Engine, Notifications)
- Error handling and recovery strategies

**Related Documents**:
- [Business Requirements](./BR-my-approvals.md) - Business rules and functional requirements
- [Use Cases](./UC-my-approvals.md) - Detailed user scenarios and workflows
- [Technical Specification](./TS-my-approvals.md) - System architecture and implementation
- [Data Schema](./DS-my-approvals.md) - Database structure and entities
- [Validations](./VAL-my-approvals.md) - Validation rules and schemas

---

## Diagram Index

| Diagram | Type | Purpose | Complexity |
|---------|------|---------|------------|
| [High-Level Process Flow](#high-level-approval-process-flow) | Process | End-to-end approval lifecycle | High |
| [Approval Queue Loading](#approval-queue-loading-flow) | Process | Load and display approval queue | Medium |
| [Single Document Approval](#single-document-approval-flow) | Process | Review and approve individual document | High |
| [Bulk Approval](#bulk-approval-flow) | Process | Approve multiple documents atomically | High |
| [Delegation Setup](#delegation-setup-flow) | Process | Create and activate delegation | Medium |
| [Context Diagram](#level-0-context-diagram) | Data Flow | System boundaries and external entities | Low |
| [System Decomposition](#level-1-system-decomposition) | Data Flow | Major processes and data stores | Medium |
| [View Queue Sequence](#view-queue-sequence-diagram) | Interaction | Component interactions for queue loading | Medium |
| [Approve Document Sequence](#approve-document-sequence-diagram) | Interaction | Component interactions for approval | High |
| [Bulk Approve Sequence](#bulk-approve-sequence-diagram) | Interaction | Component interactions for bulk approval | High |
| [Queue Item State](#queue-item-status-state-diagram) | State | Status transitions for approval queue items | Medium |
| [Delegation State](#delegation-status-state-diagram) | State | Status transitions for delegations | Medium |
| [Budget Integration](#budget-integration-flow) | Integration | Integration with Budget Management | High |
| [Inventory Integration](#inventory-integration-flow) | Integration | Integration with Inventory Management | High |
| [Finance Integration](#finance-integration-flow) | Integration | Integration with Finance System | High |
| [SLA Management](#sla-management-flow) | Process | SLA calculation and escalation | High |
| [Error Handling](#error-handling-flow) | Error | Error processing and recovery | Medium |

---

## Process Flow

### High-Level Approval Process Flow

**Purpose**: End-to-end business process showing the complete approval lifecycle from queue entry to final approval or rejection across all document types

**Actors**:
- **Approver**: Department Manager, Purchasing Manager, Financial Controller, General Manager (reviews and approves documents)
- **Requestor**: Staff member who submitted document for approval
- **Delegate**: User with temporary approval authority
- **System**: Automated processes (workflow routing, SLA monitoring, integrations, notifications)
- **Escalation Recipients**: Managers who receive escalation notifications

**Trigger**: Document submitted for approval and routed to approver's queue

```mermaid
flowchart TD
    Start([Document Submitted<br>for Approval]) --> RouteWorkflow[Workflow Engine<br>Routes to Approver]
    RouteWorkflow --> CreateQueue[Create Queue Item<br>status=pending]
    CreateQueue --> CalcSLA[Calculate SLA Deadline<br>based on priority]
    CalcSLA --> AssignApprover{Delegation<br>active?}

    AssignApprover -->|Yes| AssignDelegate[Assign to Delegate<br>assignee_type=delegate]
    AssignApprover -->|No| AssignPrimary[Assign to Primary<br>assignee_type=primary]

    AssignDelegate --> EnterQueue[Add to Approval Queue]
    AssignPrimary --> EnterQueue
    EnterQueue --> SSEUpdate[Push SSE Update<br>to Approver]
    SSEUpdate --> WaitReview[Wait for Approver]

    WaitReview --> MonitorSLA{SLA threshold<br>reached?}
    MonitorSLA -->|Yes| SendEscalation[Send Escalation<br>Notification]
    SendEscalation --> WaitReview
    MonitorSLA -->|No| WaitReview

    WaitReview --> ApproverAction{Approver<br>Decision}

    ApproverAction -->|Approve| RecordApprove[Record Approval Action]
    RecordApprove --> ValidateAuthority{Has approval<br>authority?}
    ValidateAuthority -->|No| AuthError[Authority Error]
    AuthError --> WaitReview
    ValidateAuthority -->|Yes| UpdateLevel[Update Approval Level]

    UpdateLevel --> CheckFinal{Final approval<br>level?}
    CheckFinal -->|No| NextLevel[Route to Next Level]
    NextLevel --> CreateQueue

    CheckFinal -->|Yes| FinalApprove[Mark Document<br>Approved]
    FinalApprove --> IntegrateBudget[Integrate with Budget<br>Confirm Commitment]
    IntegrateBudget --> IntegrateInventory[Integrate with Inventory<br>Create Transaction]
    IntegrateInventory --> IntegrateFinance[Integrate with Finance<br>Post GL Entry]
    IntegrateFinance --> CompleteWorkflow[Complete Workflow]
    CompleteWorkflow --> NotifyComplete[Notify Requestor<br>and Stakeholders]
    NotifyComplete --> RemoveQueue[Remove from Queue]
    RemoveQueue --> Success([End: Approved])

    ApproverAction -->|Reject| RecordReject[Record Rejection Action]
    RecordReject --> ValidateReason{Rejection reason<br>provided?}
    ValidateReason -->|No| ReasonError[Reason Required Error]
    ReasonError --> WaitReview
    ValidateReason -->|Yes| MarkRejected[Mark Document<br>Rejected]

    MarkRejected --> ReleaseBudget[Release Budget<br>Commitment]
    ReleaseBudget --> TerminateWorkflow[Terminate Workflow]
    TerminateWorkflow --> NotifyReject[Notify Requestor]
    NotifyReject --> RemoveQueue2[Remove from Queue]
    RemoveQueue2 --> EndReject([End: Rejected])

    ApproverAction -->|Request Info| RecordInfo[Record Info Request]
    RecordInfo --> UpdateStatus[Update status to<br>awaiting_info]
    UpdateStatus --> PauseSLA[Pause SLA Timer]
    PauseSLA --> NotifyRequestor[Notify Requestor<br>with Questions]
    NotifyRequestor --> WaitResponse[Wait for Response]

    WaitResponse --> CheckDeadline{Response<br>deadline passed?}
    CheckDeadline -->|Yes| SendReminder[Send Reminder]
    SendReminder --> WaitResponse
    CheckDeadline -->|No| WaitResponse

    WaitResponse --> RequestorResponse{Requestor<br>provides info?}
    RequestorResponse -->|Yes| ResumeSLA[Resume SLA Timer]
    ResumeSLA --> UpdatePending[Update status to<br>pending]
    UpdatePending --> WaitReview
    RequestorResponse -->|No| RequestorRecall[Requestor Recalls<br>Document]
    RequestorRecall --> EndRecall([End: Recalled])

    ApproverAction -->|Delegate| CreateDelegation[Create Delegation]
    CreateDelegation --> TransferApproval[Transfer to Delegate]
    TransferApproval --> WaitReview

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style EndReject fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style EndRecall fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style AuthError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ReasonError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style RouteWorkflow fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style IntegrateBudget fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style IntegrateInventory fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style IntegrateFinance fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Flow Steps**:

1. **Start**: Document submitted for approval by requestor
2. **Route Workflow**: Workflow engine determines approval routing based on document type and amount
3. **Create Queue Item**: System creates approval_queue_items record with status=pending
4. **Calculate SLA**: System calculates SLA deadline based on document type and priority (business hours)
5. **Assign Approver**: System checks for active delegation
   - If delegation active: Assign to delegate with assignee_type=delegate
   - If no delegation: Assign to primary approver with assignee_type=primary
6. **Enter Queue**: Queue item added to approver's approval queue
7. **SSE Update**: Real-time update pushed to approver's browser via Server-Sent Events
8. **Monitor SLA**: Background job monitors SLA progress
   - If threshold reached (e.g., 80% elapsed): Send escalation notification
9. **Approver Action**: Approver reviews and makes decision:
   - **Approve**: Record approval, validate authority, update level, route to next level or complete
   - **Reject**: Record rejection, validate reason, release budget, terminate workflow
   - **Request Info**: Record info request, pause SLA, notify requestor, wait for response
   - **Delegate**: Create delegation and transfer approval
10. **Final Approval**: When last level completes, integrate with external systems
11. **Integrations**: Budget (confirm commitment), Inventory (create transaction), Finance (post GL)
12. **Complete**: Notify stakeholders and remove from queue

**Exception Handling**:
- **Insufficient authority**: Display error, prevent approval
- **Concurrent approval**: Optimistic locking (doc_version) detects, rollback transaction, show error
- **Budget exceeded**: Allow policy override with justification or reject
- **Integration failure**: Retry with exponential backoff, flag for manual review
- **SLA breach**: Continue process, log violation, escalate to manager
- **Database failure**: Rollback transaction, log error, retry
- **Delegation conflict**: Resolve based on precedence (explicit > implicit)

---

### Approval Queue Loading Flow

**Purpose**: Detailed view of how the approval queue is loaded, filtered, sorted, and updated in real-time

```mermaid
flowchart TD
    Start([User navigates to<br>My Approvals]) --> SSRLoad[Server Component<br>Initial Load]
    SSRLoad --> QueryDB[(Query Database:<br>approver_user_id=current_user<br>status=pending)]
    QueryDB --> JoinData[JOIN users, departments,<br>locations for context]
    JoinData --> CalcUrgency[Calculate Urgency Score<br>based on SLA remaining]
    CalcUrgency --> FormatData[Format Data for Display<br>with denormalized fields]
    FormatData --> HydrateClient[Hydrate Client Component<br>with Initial Data]

    HydrateClient --> RenderQueue[Render Queue UI<br>with Filters and Sort]
    RenderQueue --> EstablishSSE[Establish SSE Connection<br>/api/approvals/sse]
    EstablishSSE --> ListenEvents[Listen for Events:<br>- approval_added<br>- approval_removed<br>- approval_updated]

    ListenEvents --> UserAction{User<br>Action}

    UserAction -->|Apply Filter| FilterClient[Client-Side Filter<br>by type, amount, priority]
    FilterClient --> UpdateDisplay[Update Display<br>with Filtered Items]
    UpdateDisplay --> UserAction

    UserAction -->|Change Sort| SortClient[Client-Side Sort<br>by date, amount, priority]
    SortClient --> UpdateDisplay

    UserAction -->|Search| SearchClient[Client-Side Search<br>by reference, requestor]
    SearchClient --> UpdateDisplay

    UserAction -->|Save Preset| SavePreset[(Save Filter Preset<br>to user_preferences)]
    SavePreset --> UserAction

    UserAction -->|Load Preset| LoadPreset[(Load Filter Preset<br>from user_preferences)]
    LoadPreset --> ApplyFilters[Apply Preset Filters]
    ApplyFilters --> UpdateDisplay

    UserAction -->|Background Refresh| RefreshData[React Query Background<br>Refetch every 30s]
    RefreshData --> QueryDB

    UserAction -->|SSE Event| SSEEvent{Event<br>Type}
    SSEEvent -->|approval_added| AddItem[Add Item to Queue<br>with animation]
    AddItem --> UpdateCounts[Update Badge Counts]
    UpdateCounts --> UpdateDisplay

    SSEEvent -->|approval_removed| RemoveItem[Remove Item from Queue<br>with transition]
    RemoveItem --> UpdateCounts

    SSEEvent -->|approval_updated| UpdateItem[Update Item Data<br>merge with existing]
    UpdateItem --> UpdateDisplay

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style QueryDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style SavePreset fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style LoadPreset fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style EstablishSSE fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Flow Steps**:

1. **SSR Load**: Server Component executes on server for initial page load
2. **Query Database**: SELECT from approval_queue_items WHERE approver_user_id AND status=pending
3. **JOIN Data**: Join with users, departments, locations for complete display context
4. **Calculate Urgency**: Compute urgency score based on SLA remaining (red: <10%, yellow: <25%, green: >25%)
5. **Format Data**: Prepare data with denormalized fields for efficient display
6. **Hydrate Client**: Pass initial data to ApprovalQueue client component
7. **Render Queue**: Display queue with filters, sorting, and search controls
8. **Establish SSE**: Open Server-Sent Events connection for real-time updates
9. **Listen Events**: Subscribe to approval_added, approval_removed, approval_updated events
10. **User Actions**: Handle user interactions (filter, sort, search, presets)
11. **Background Refresh**: React Query refetches data every 30 seconds as fallback to SSE
12. **SSE Events**: Process real-time updates and merge into existing queue data

**Performance Optimizations**:
- Server-side rendering for fast initial load
- Client-side filtering/sorting for instant feedback
- SSE for efficient real-time updates (no polling)
- React Query caching to minimize database queries
- Virtualization for queues >100 items (react-window)
- Optimistic UI updates for smooth user experience

---

### Single Document Approval Flow

**Purpose**: Detailed workflow for reviewing and approving a single document with all approval actions

```mermaid
flowchart TD
    Start([User clicks document<br>in queue]) --> OpenModal[Open Document<br>Review Modal]
    OpenModal --> FetchDetails[Fetch Complete Details:<br>- Header + Line Items<br>- Attachments<br>- Approval History<br>- Budget Impact]

    FetchDetails --> ValidateAuth{User has<br>authority?}
    ValidateAuth -->|No| ShowAuthError[Display Authority Error<br>show required level]
    ShowAuthError --> CloseModal([End: Close Modal])

    ValidateAuth -->|Yes| DisplayTabs[Display Tabbed View:<br>- Details<br>- Line Items<br>- Attachments<br>- History<br>- Budget]
    DisplayTabs --> CalcCompliance[Calculate Policy Compliance:<br>- Budget available?<br>- Quotes required?<br>- Category compliance?]
    CalcCompliance --> ShowFlags{Policy<br>violations?}

    ShowFlags -->|Yes| DisplayWarnings[Display Warning Banners<br>with override option]
    ShowFlags -->|No| DisplayReview[Display Review Content]
    DisplayWarnings --> DisplayReview

    DisplayReview --> UserReview[User Reviews Document:<br>- Check amounts<br>- Review justification<br>- Verify budget<br>- Check attachments]

    UserReview --> UserDecision{User<br>Decision}

    UserDecision -->|Approve| CheckOverride{Policy override<br>needed?}
    CheckOverride -->|Yes| EnterJustification[Enter Override<br>Justification min 50 chars]
    CheckOverride -->|No| EnterComments
    EnterJustification --> ValidateJustif{Valid<br>justification?}
    ValidateJustif -->|No| JustifError[Show Error:<br>Justification too short]
    JustifError --> EnterJustification
    ValidateJustif -->|Yes| EnterComments[Enter Optional<br>Approval Comments]

    EnterComments --> ConfirmApprove[Confirm Approval<br>Dialog]
    ConfirmApprove --> OptimisticUpdate[Optimistic UI Update<br>remove from queue]
    OptimisticUpdate --> CallServerAction[Call approveDocument<br>Server Action]

    CallServerAction --> BeginTxn[BEGIN TRANSACTION]
    BeginTxn --> LockRecord[Lock Record with<br>doc_version check]
    LockRecord --> ConcurrentCheck{Concurrent<br>modification?}
    ConcurrentCheck -->|Yes| RollbackTxn[ROLLBACK]
    RollbackTxn --> RevertOptimistic[Revert Optimistic Update<br>re-add to queue]
    RevertOptimistic --> ShowConcurrentError[Show Concurrent<br>Approval Error]
    ShowConcurrentError --> CloseModal

    ConcurrentCheck -->|No| RecordAction[INSERT approval_actions<br>with hash chain]
    RecordAction --> UpdateQueue[UPDATE approval_queue_items<br>current_level++, doc_version++]
    UpdateQueue --> CheckComplete{Final<br>level?}

    CheckComplete -->|No| RouteNext[Route to Next Level<br>create new queue item]
    RouteNext --> CommitTxn[COMMIT TRANSACTION]
    CommitTxn --> TriggerIntegrations[Trigger Async Integrations:<br>- Notification Service<br>- Audit Logging]
    TriggerIntegrations --> ShowSuccess[Show Success Toast]
    ShowSuccess --> CloseModalSuccess([End: Close Modal])

    CheckComplete -->|Yes| UpdateDocStatus[Update Document Status<br>to Approved]
    UpdateDocStatus --> CommitTxn

    CommitTxn --> IntegrateBudget[Integrate with Budget<br>confirm commitment]
    IntegrateBudget --> CheckBudgetResult{Budget<br>success?}
    CheckBudgetResult -->|No| BudgetError[Log Budget Error<br>flag for retry]
    BudgetError --> ShowPartialSuccess[Show Partial Success<br>manual review needed]
    ShowPartialSuccess --> CloseModalSuccess

    CheckBudgetResult -->|Yes| IntegrateInventory[Integrate with Inventory<br>create transaction]
    IntegrateInventory --> IntegrateFinance[Integrate with Finance<br>post GL entry]
    IntegrateFinance --> ShowSuccess

    UserDecision -->|Reject| EnterReason[Enter Rejection Reason<br>min 20 chars]
    EnterReason --> ValidateReason{Valid<br>reason?}
    ValidateReason -->|No| ReasonError[Show Error:<br>Reason too short]
    ReasonError --> EnterReason

    ValidateReason -->|Yes| ConfirmReject[Confirm Rejection<br>Dialog]
    ConfirmReject --> CallRejectAction[Call rejectDocument<br>Server Action]
    CallRejectAction --> BeginRejectTxn[BEGIN TRANSACTION]
    BeginRejectTxn --> RecordRejectAction[INSERT approval_actions<br>action_type=reject]
    RecordRejectAction --> UpdateRejectQueue[UPDATE approval_queue_items<br>status=rejected]
    UpdateRejectQueue --> UpdateDocReject[Update Document Status<br>to Rejected]
    UpdateDocReject --> ReleaseBudget[Release Budget<br>Commitment]
    ReleaseBudget --> CommitRejectTxn[COMMIT TRANSACTION]
    CommitRejectTxn --> NotifyReject[Send Rejection<br>Notification]
    NotifyReject --> ShowRejectSuccess[Show Success Toast]
    ShowRejectSuccess --> CloseModalReject([End: Close Modal])

    UserDecision -->|Request Info| EnterQuestions[Enter Information<br>Request min 20 chars]
    EnterQuestions --> SetDeadline[Set Response Deadline<br>default 48 business hours]
    SetDeadline --> ValidateInfo{Valid<br>request?}
    ValidateInfo -->|No| InfoError[Show Error:<br>Request too short]
    InfoError --> EnterQuestions

    ValidateInfo -->|Yes| ConfirmInfo[Confirm Information<br>Request Dialog]
    ConfirmInfo --> CallInfoAction[Call requestMoreInfo<br>Server Action]
    CallInfoAction --> BeginInfoTxn[BEGIN TRANSACTION]
    BeginInfoTxn --> RecordInfoAction[INSERT approval_actions<br>action_type=request_info]
    RecordInfoAction --> UpdateInfoQueue[UPDATE approval_queue_items<br>status=awaiting_info]
    UpdateInfoQueue --> PauseSLA[Pause SLA Timer<br>sla_paused_at=NOW]
    PauseSLA --> CommitInfoTxn[COMMIT TRANSACTION]
    CommitInfoTxn --> NotifyRequestor[Send Info Request<br>to Requestor]
    NotifyRequestor --> ShowInfoSuccess[Show Success Toast<br>keep in queue with flag]
    ShowInfoSuccess --> CloseModalInfo([End: Close Modal])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style CloseModalSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style CloseModalReject fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style CloseModalInfo fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style ShowAuthError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style JustifError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ReasonError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style InfoError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style RollbackTxn fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style BeginTxn fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style CommitTxn fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style IntegrateBudget fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style IntegrateInventory fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style IntegrateFinance fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Flow Steps**:

1. **Open Modal**: User clicks document row, modal opens with loading state
2. **Fetch Details**: Load complete document data including line items, attachments, history, budget
3. **Validate Authority**: Check if user has approval authority for document amount
4. **Display Content**: Show tabbed interface with all document information
5. **Calculate Compliance**: Check policy compliance (budget, quotes, categories)
6. **User Reviews**: Approver examines document details
7. **User Decision**: Approver chooses action (approve, reject, request info)

**Approve Path**:
8. Check if policy override needed
9. Enter override justification if required (min 50 chars)
10. Enter optional approval comments
11. Confirm approval
12. Optimistic UI update (remove from queue immediately)
13. Call approveDocument Server Action with atomic transaction
14. Lock record with doc_version for optimistic locking
15. Check for concurrent modifications
16. Record approval action with cryptographic hash
17. Update queue item approval level and version
18. If not final level: Route to next approver
19. If final level: Update document status to Approved
20. Integrate with Budget, Inventory, Finance systems (async)
21. Show success notification

**Reject Path**:
- Enter rejection reason (min 20 chars)
- Confirm rejection
- Record rejection action
- Update queue and document status to Rejected
- Release budget commitment
- Send rejection notification

**Request Info Path**:
- Enter information request (min 20 chars)
- Set response deadline (default 48 business hours)
- Record info request action
- Update status to awaiting_info
- Pause SLA timer
- Send notification to requestor

**Exception Handling**:
- **Insufficient authority**: Display error, prevent approval
- **Concurrent modification**: Rollback, revert optimistic update, show error
- **Budget integration failure**: Log error, flag for manual review, show partial success
- **Validation errors**: Show inline errors, prevent submission

---

### Bulk Approval Flow

**Purpose**: Atomic processing of multiple document approvals with all-or-nothing transaction guarantees

```mermaid
flowchart TD
    Start([User selects multiple<br>documents in queue]) --> EnableBulk[Enable Bulk Actions<br>Toolbar]
    EnableBulk --> SelectDocs[User Selects Documents<br>up to 50 max]
    SelectDocs --> ValidateSelection{Valid<br>selection?}

    ValidateSelection -->|Exceeds 50 limit| LimitError[Show Error:<br>Max 50 documents]
    LimitError --> SelectDocs

    ValidateSelection -->|Mixed types| TypeError[Show Error:<br>Same type required]
    TypeError --> SelectDocs

    ValidateSelection -->|Valid| DisplaySummary[Display Bulk Summary:<br>- Count<br>- Total Amount<br>- Document Types<br>- Requestors]

    DisplaySummary --> EnterBulkComments[Enter Optional<br>Bulk Comments]
    EnterBulkComments --> ReviewSummary[User Reviews Summary]
    ReviewSummary --> ConfirmBulk[Confirm Bulk Approval<br>Dialog with warning]

    ConfirmBulk --> OptimisticBulk[Optimistic UI Update<br>remove all from queue]
    OptimisticBulk --> CallBulkAction[Call bulkApproveDocuments<br>Server Action]

    CallBulkAction --> BeginAtomicTxn[BEGIN ATOMIC TRANSACTION]
    BeginAtomicTxn --> ValidateEach[Validate Each Document:<br>- User authority<br>- Status = pending<br>- No self-approval]

    ValidateEach --> ValidationResult{All valid?}
    ValidationResult -->|No| RollbackAtomicTxn[ROLLBACK TRANSACTION]
    RollbackAtomicTxn --> RevertBulkOptimistic[Revert Optimistic Update<br>re-add all to queue]
    RevertBulkOptimistic --> ShowBulkError[Show Bulk Error with<br>Failed Document List]
    ShowBulkError --> PartialRetry{Retry without<br>failed docs?}

    PartialRetry -->|Yes| RemoveFailed[Remove Failed Docs<br>from Selection]
    RemoveFailed --> DisplaySummary
    PartialRetry -->|No| CancelBulk([End: Cancel])

    ValidationResult -->|Yes| CalculateTotal[Calculate Total Amount<br>of All Documents]
    CalculateTotal --> CheckAuthority{Total within<br>user authority?}
    CheckAuthority -->|No| RollbackAtomicTxn

    CheckAuthority -->|Yes| ProcessLoop[Process Each Document<br>in Transaction]
    ProcessLoop --> RecordEachAction[INSERT approval_actions<br>for each document]
    RecordEachAction --> UpdateEachQueue[UPDATE approval_queue_items<br>for each document]
    UpdateEachQueue --> RouteEach[Route to Next Level<br>for each document]

    RouteEach --> LoopComplete{All processed?}
    LoopComplete -->|No| ProcessLoop
    LoopComplete -->|Yes| CommitAtomicTxn[COMMIT ATOMIC TRANSACTION]

    CommitAtomicTxn --> TriggerParallelIntegrations[Trigger Parallel Integrations<br>for All Documents]
    TriggerParallelIntegrations --> IntegrateBulkBudget[Budget Integration<br>for All Documents]
    IntegrateBulkBudget --> IntegrateBulkInventory[Inventory Integration<br>for All Documents]
    IntegrateBulkInventory --> IntegrateBulkFinance[Finance Integration<br>for All Documents]

    IntegrateBulkFinance --> CheckIntegrations{All integrations<br>successful?}
    CheckIntegrations -->|No| FlagPartialSuccess[Flag Failed Integrations<br>for Manual Review]
    FlagPartialSuccess --> ShowPartialSuccess[Show Partial Success<br>with Retry Option]
    ShowPartialSuccess --> EndPartial([End: Partial Success])

    CheckIntegrations -->|Yes| ShowBulkSuccess[Show Success Toast<br>with Count]
    ShowBulkSuccess --> ClearSelection[Clear Bulk Selection]
    ClearSelection --> EndSuccess([End: Success])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style EndSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style EndPartial fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style CancelBulk fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style LimitError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style TypeError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style RollbackAtomicTxn fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style BeginAtomicTxn fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style CommitAtomicTxn fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style IntegrateBulkBudget fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style IntegrateBulkInventory fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style IntegrateBulkFinance fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Flow Steps**:

1. **Select Documents**: User selects multiple documents in queue (checkbox selection)
2. **Enable Bulk Toolbar**: Toolbar appears with bulk actions
3. **Validate Selection**: Check constraints (max 50, same type, all Pending status)
4. **Display Summary**: Show count, total amount, document types, requestors
5. **Enter Comments**: User enters optional bulk approval comments
6. **Confirm Bulk**: Confirmation dialog with warning about atomic operation
7. **Optimistic Update**: Remove all selected documents from queue immediately
8. **Call Server Action**: bulkApproveDocuments with document IDs and comments
9. **Begin Transaction**: Start atomic database transaction (all or nothing)
10. **Validate Each**: Check authority, status, self-approval for each document
11. **Calculate Total**: Sum total amount across all documents
12. **Check Authority**: Verify user authority covers total amount
13. **Process Loop**: For each document, record action, update queue, route
14. **Commit Transaction**: If all successful, commit atomic transaction
15. **Parallel Integrations**: Trigger Budget, Inventory, Finance integrations for all documents
16. **Show Success**: Display success notification with count

**Exception Handling**:
- **Validation failure**: Rollback transaction, revert optimistic update, show error with failed document list
- **Exceeds 50 limit**: Show error, prevent submission
- **Mixed document types**: Show error, require same type
- **Total exceeds authority**: Rollback transaction, show error
- **Integration partial failure**: Flag for manual review, show partial success with retry option

**Performance Considerations**:
- Maximum 50 documents per bulk operation to prevent long transactions
- Parallel integration calls for all documents (not sequential)
- Background job for integration retries
- Optimistic UI for instant feedback
- Atomic transaction ensures data consistency

---

### Delegation Setup Flow

**Purpose**: Creating and activating approval delegations with scope configuration and approval transfer

```mermaid
flowchart TD
    Start([User clicks<br>'Setup Delegation']) --> OpenForm[Open Delegation<br>Setup Form]
    OpenForm --> SearchDelegate[Search and Select<br>Delegate User]

    SearchDelegate --> ValidateDelegate{Valid<br>delegate?}
    ValidateDelegate -->|Same as delegator| SelfError[Show Error:<br>Cannot delegate to self]
    SelfError --> SearchDelegate

    ValidateDelegate -->|Insufficient authority| AuthorityError[Show Error:<br>Delegate lacks authority]
    AuthorityError --> SearchDelegate

    ValidateDelegate -->|Valid| CheckOverlap[Check for Overlapping<br>Delegations]
    CheckOverlap --> OverlapResult{Overlapping<br>period found?}
    OverlapResult -->|Yes| OverlapError[Show Error:<br>Overlapping delegation exists]
    OverlapError --> SearchDelegate

    OverlapResult -->|No| SetDates[Set Start and End Dates<br>max 90 days duration]
    SetDates --> ValidateDates{Valid<br>dates?}
    ValidateDates -->|End < Start| DateError[Show Error:<br>End must be after Start]
    DateError --> SetDates
    ValidateDates -->|Duration > 90 days| DurationError[Show Error:<br>Max 90 days allowed]
    DurationError --> SetDates

    ValidateDates -->|Valid| SelectScope[Select Delegation Scope:<br>- All Documents<br>- Specific Types<br>- Specific Departments]

    SelectScope --> ScopeType{Scope<br>Type}
    ScopeType -->|All Documents| SetAmountLimit
    ScopeType -->|Specific Types| SelectTypes[Select Document Types<br>e.g., PR, PO]
    ScopeType -->|Specific Depts| SelectDepts[Select Departments<br>e.g., F&B, Kitchen]

    SelectTypes --> SetAmountLimit[Set Maximum Amount Limit<br>optional, cannot exceed<br>delegate authority]
    SelectDepts --> SetAmountLimit

    SetAmountLimit --> ValidateAmount{Valid<br>amount?}
    ValidateAmount -->|Exceeds delegate authority| AmountError[Show Error:<br>Exceeds delegate authority]
    AmountError --> SetAmountLimit

    ValidateAmount -->|Valid| EnterReason[Enter Delegation Reason<br>min 10 chars]
    EnterReason --> EnterNotes[Enter Optional Notes<br>and Instructions]
    EnterNotes --> ReviewSummary[Review Delegation Summary:<br>- Delegate Name<br>- Date Range<br>- Scope<br>- Amount Limit<br>- Pending Approvals to Transfer]

    ReviewSummary --> CheckPending[Query Pending Approvals<br>Matching Scope]
    CheckPending --> CountPending[Count Approvals<br>to Transfer]
    CountPending --> ShowTransfer[Show Transfer Count<br>in Summary]
    ShowTransfer --> ConfirmDelegation[Confirm Delegation<br>Creation]

    ConfirmDelegation --> CallCreateAction[Call createDelegation<br>Server Action]
    CallCreateAction --> BeginDelegationTxn[BEGIN TRANSACTION]
    BeginDelegationTxn --> CheckImmediate{Immediate<br>delegation?}

    CheckImmediate -->|No, Future| CreateScheduled[INSERT approval_delegations<br>status=scheduled]
    CreateScheduled --> ScheduleActivation[Schedule Background Job<br>for Activation at Start Time]
    ScheduleActivation --> ScheduleExpiration[Schedule Background Job<br>for Expiration at End Time]
    ScheduleExpiration --> CommitScheduled[COMMIT TRANSACTION]
    CommitScheduled --> NotifyScheduled[Notify Delegate and Manager<br>of Scheduled Delegation]
    NotifyScheduled --> ShowScheduledSuccess[Show Success Toast:<br>Delegation Scheduled]
    ShowScheduledSuccess --> EndScheduled([End: Scheduled])

    CheckImmediate -->|Yes, Immediate| CreateActive[INSERT approval_delegations<br>status=active]
    CreateActive --> SetActivation[Set activation_timestamp<br>to NOW]
    SetActivation --> TransferApprovals[Transfer Matching Approvals<br>to Delegate]

    TransferApprovals --> UpdateQueueItems[UPDATE approval_queue_items<br>SET approver_user_id=delegate<br>original_approver_user_id=delegator<br>assignee_type=delegate<br>delegation_id=delegation.id]

    UpdateQueueItems --> CountTransferred[COUNT transferred<br>approvals]
    CountTransferred --> UpdateTransferCount[UPDATE approval_delegations<br>approvals_transferred_count]
    UpdateTransferCount --> CommitActive[COMMIT TRANSACTION]

    CommitActive --> NotifyDelegate[Notify Delegate:<br>Delegation Active<br>+ Transferred Approvals]
    NotifyDelegate --> NotifyManager[Notify Manager:<br>Delegation Active]
    NotifyManager --> SSEUpdateDelegate[Push SSE Updates<br>to Delegate Browser]
    SSEUpdateDelegate --> ShowActiveSuccess[Show Success Toast:<br>Delegation Active<br>+ Transfer Count]
    ShowActiveSuccess --> EndActive([End: Active])

    ScheduleActivation --> ActivationJobRuns[BACKGROUND JOB:<br>At Start Time]
    ActivationJobRuns --> ActivateJob[UPDATE status to active<br>SET activation_timestamp]
    ActivateJob --> TransferApprovalsJob[Transfer Matching Approvals<br>same as immediate]
    TransferApprovalsJob --> NotifyActivation[Notify Delegate and Manager]
    NotifyActivation --> SSEActivation[Push SSE Updates]

    ScheduleExpiration --> ExpirationJobRuns[BACKGROUND JOB:<br>At End Time]
    ExpirationJobRuns --> DeactivateJob[UPDATE status to expired<br>SET deactivation_timestamp]
    DeactivateJob --> TransferBackJob[Route New Approvals<br>Back to Original Approver]
    TransferBackJob --> NotifyExpiration[Notify Delegator and Manager]

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style EndScheduled fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style EndActive fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style SelfError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style AuthorityError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style OverlapError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style DateError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style DurationError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style AmountError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style BeginDelegationTxn fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style CommitScheduled fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style CommitActive fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Flow Steps**:

1. **Open Form**: User clicks "Setup Delegation" button
2. **Search Delegate**: User searches and selects delegate user
3. **Validate Delegate**: Check delegate is not self, has sufficient authority
4. **Check Overlap**: Query existing delegations for date range overlap
5. **Set Dates**: User enters start and end dates (max 90 days duration)
6. **Validate Dates**: Check end > start and duration ≤ 90 days
7. **Select Scope**: User chooses delegation scope (all documents, specific types, specific departments)
8. **Set Amount Limit**: Optional amount cap (cannot exceed delegate's authority)
9. **Enter Reason**: User enters delegation reason (min 10 chars)
10. **Enter Notes**: Optional notes and instructions for delegate
11. **Review Summary**: Display complete delegation configuration
12. **Query Pending**: Count pending approvals matching delegation scope
13. **Show Transfer Count**: Display how many approvals will be transferred
14. **Confirm**: User confirms delegation creation
15. **Call Server Action**: createDelegation with atomic transaction

**Immediate Delegation Path** (start_datetime ≤ NOW):
16. Create with status=active
17. Set activation_timestamp to NOW
18. Transfer matching pending approvals to delegate
19. Update approval_queue_items with delegate info
20. Count transferred approvals
21. Commit transaction
22. Notify delegate and manager
23. Push SSE updates to delegate browser

**Scheduled Delegation Path** (start_datetime > NOW):
16. Create with status=scheduled
17. Schedule background job for activation at start time
18. Schedule background job for expiration at end time
19. Commit transaction
20. Notify delegate and manager of scheduled delegation

**Background Jobs**:
- **Activation Job** (runs at start_datetime):
  - Update status to active
  - Transfer matching approvals to delegate
  - Notify delegate and manager
  - Push SSE updates
- **Expiration Job** (runs at end_datetime):
  - Update status to expired
  - Route new approvals back to original approver
  - Notify delegator and manager

**Exception Handling**:
- **Cannot delegate to self**: Show error, prevent submission
- **Delegate lacks authority**: Show error, select different delegate
- **Overlapping delegation**: Show error, adjust dates or revoke existing
- **Invalid dates**: Show inline validation errors
- **Amount exceeds delegate authority**: Show error, reduce amount

---

## Data Flow Diagrams

### Level 0: Context Diagram

**Purpose**: Shows My Approvals system boundaries and interactions with external entities

```mermaid
flowchart TB
    subgraph External['External Entities']
        Approver[👤 Approver<br>Reviews & Approves]
        Requestor[👤 Requestor<br>Submits Documents]
        Admin[👤 System Admin<br>Configures SLA & Authority]
    end

    subgraph MyApprovals['My Approvals System']
        System[My Approvals Module<br>✓ Queue Management<br>✓ Approval Processing<br>✓ Delegation Management<br>✓ SLA Monitoring]
    end

    subgraph ExternalSystems['External Systems']
        Budget[💰 Budget Management<br>Commitment Tracking]
        Inventory[📦 Inventory Management<br>Stock Transactions]
        Finance[💵 Finance System<br>GL Posting]
        Workflow[⚙️ Workflow Engine<br>Routing & Escalation]
        Notification[📧 Notification Service<br>Email, Push, SMS]
        Audit[📝 Audit System<br>Activity Logging]
    end

    Approver -->|Review & Decision| System
    System -->|Approval Status| Approver

    Requestor -->|Document Status| System
    System -->|Notifications| Requestor

    Admin -->|Configuration| System
    System -->|Reports| Admin

    System -->|Confirm Commitment| Budget
    Budget -->|Availability Status| System

    System -->|Create Transaction| Inventory
    Inventory -->|Transaction Result| System

    System -->|Post GL Entry| Finance
    Finance -->|Posting Result| System

    Workflow -->|Routing Instructions| System
    System -->|Workflow Events| Workflow

    System -->|Send Notifications| Notification
    Notification -->|Delivery Status| System

    System -->|Log Actions| Audit

    style System fill:#e0ccff,stroke:#6600cc,stroke-width:3px,color:#000
    style Approver fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Requestor fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Admin fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
```

**External Entities**:
- **Approver**: Reviews and approves documents in queue
- **Requestor**: Submits documents and receives status updates
- **System Admin**: Configures SLA policies and approval authority matrix

**External Systems**:
- **Budget Management**: Tracks budget commitments and availability
- **Inventory Management**: Creates stock transactions
- **Finance System**: Posts general ledger entries
- **Workflow Engine**: Provides approval routing and escalation
- **Notification Service**: Sends email, push notifications, SMS
- **Audit System**: Logs all approval actions

---

### Level 1: System Decomposition

**Purpose**: Breaks down My Approvals into major processes and data stores

```mermaid
flowchart TB
    subgraph Inputs['Data Inputs']
        DocumentSubmit[Document<br>Submission]
        UserAction[User<br>Actions]
        AdminConfig[Admin<br>Configuration]
    end

    subgraph Processes['Core Processes']
        P1[1.0<br>Queue Management<br>Load, Filter, Sort]
        P2[2.0<br>Approval Processing<br>Approve, Reject, Info Request]
        P3[3.0<br>Delegation Management<br>Create, Activate, Expire]
        P4[4.0<br>Authority Validation<br>Check Limits, Routing]
        P5[5.0<br>SLA Monitoring<br>Calculate, Escalate]
        P6[6.0<br>Integration Management<br>Budget, Inventory, Finance]
        P7[7.0<br>Notification Management<br>Email, Push, In-App]
    end

    subgraph DataStores['Data Stores']
        D1[(D1: approval_queue_items<br>Pending Approvals)]
        D2[(D2: approval_actions<br>Audit Trail)]
        D3[(D3: approval_delegations<br>Active Delegations)]
        D4[(D4: approval_sla_configuration<br>SLA Policies)]
        D5[(D5: approval_authority_matrix<br>Approval Limits)]
    end

    subgraph Outputs['Data Outputs']
        QueueDisplay[Approval<br>Queue Display]
        StatusUpdate[Status<br>Updates]
        Notifications[Notifications]
        Reports[Analytics &<br>Reports]
    end

    DocumentSubmit --> P1
    DocumentSubmit --> P4
    UserAction --> P1
    UserAction --> P2
    UserAction --> P3
    AdminConfig --> P4
    AdminConfig --> P5

    P1 --> D1
    P1 --> D3
    D1 --> P1
    D3 --> P1

    P2 --> D1
    P2 --> D2
    P2 --> P6
    D1 --> P2
    D5 --> P2

    P3 --> D3
    P3 --> D1
    D3 --> P3

    P4 --> D5
    D5 --> P4
    P4 --> P2

    P5 --> D1
    P5 --> D4
    P5 --> P7
    D1 --> P5
    D4 --> P5

    P6 --> P7
    P2 --> P7
    P3 --> P7
    P5 --> P7

    P1 --> QueueDisplay
    P2 --> StatusUpdate
    P7 --> Notifications
    P2 --> Reports
    D2 --> Reports

    style P1 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style P2 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style P3 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style P4 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style P5 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style P6 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style P7 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style D1 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style D2 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style D3 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style D4 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style D5 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**Major Processes**:
1. **Queue Management (1.0)**: Load, filter, sort approval queue with real-time updates
2. **Approval Processing (2.0)**: Process approval actions (approve, reject, request info)
3. **Delegation Management (3.0)**: Create, activate, and expire delegations
4. **Authority Validation (4.0)**: Validate approval authority and determine routing
5. **SLA Monitoring (5.0)**: Calculate SLA deadlines, monitor progress, trigger escalations
6. **Integration Management (6.0)**: Coordinate with Budget, Inventory, Finance systems
7. **Notification Management (7.0)**: Send email, push, and in-app notifications

**Data Stores**:
- **D1: approval_queue_items**: Pending approvals assigned to approvers
- **D2: approval_actions**: Immutable audit trail of all approval decisions
- **D3: approval_delegations**: Active and scheduled delegations
- **D4: approval_sla_configuration**: SLA policies by document type and priority
- **D5: approval_authority_matrix**: Approval limits by user/role and document type

---

## Sequence Diagrams

### View Queue Sequence Diagram

**Purpose**: Component interactions when loading and displaying the approval queue

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Approver
    participant Browser as Browser
    participant ServerComp as Server Component
    participant ClientComp as Client Component
    participant DB as PostgreSQL
    participant SSE as SSE Server
    participant RQ as React Query

    User->>Browser: Navigate to /my-approvals
    Browser->>ServerComp: GET /my-approvals (SSR)

    ServerComp->>DB: Query approval_queue_items<br>WHERE approver_user_id<br>AND status=pending
    DB-->>ServerComp: Return Queue Items

    ServerComp->>DB: JOIN users, departments,<br>locations for context
    DB-->>ServerComp: Return Joined Data

    ServerComp->>ServerComp: Calculate Urgency Scores<br>Format Data
    ServerComp-->>Browser: Return HTML with Data

    Browser->>ClientComp: Hydrate with Initial Data
    ClientComp->>ClientComp: Render Queue UI
    ClientComp-->>User: Display Queue

    ClientComp->>SSE: Establish SSE Connection<br>/api/approvals/sse?userId
    SSE-->>ClientComp: Connection Established

    loop Real-time Updates
        SSE->>ClientComp: Push Event:<br>approval_added/removed/updated
        ClientComp->>ClientComp: Merge Event into Queue
        ClientComp-->>User: Update Display
    end

    loop Background Refresh (30s)
        RQ->>RQ: Check Cache Staleness
        RQ->>DB: Refetch Queue Data
        DB-->>RQ: Return Updated Data
        RQ->>ClientComp: Update Cache
        ClientComp-->>User: Update Display if Changed
    end

    User->>ClientComp: Apply Filter/Sort/Search
    ClientComp->>ClientComp: Client-side Filter/Sort
    ClientComp-->>User: Update Display Instantly

    Note over User,RQ: No server round-trip<br>for filter/sort/search
```

**Key Interactions**:
1. **SSR Load**: Server Component queries database and returns HTML with initial data
2. **Client Hydration**: Client Component mounts with initial queue data
3. **SSE Connection**: Establish real-time connection for queue updates
4. **Real-time Updates**: Push events when documents added/removed/updated
5. **Background Refresh**: React Query refetches every 30s as fallback
6. **Client-side Operations**: Filter/sort/search without server round-trip

---

### Approve Document Sequence Diagram

**Purpose**: Component interactions when approving a document with integrations

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Approver
    participant UI as Approval Modal
    participant ServerAction as Server Action
    participant DB as PostgreSQL
    participant Budget as Budget System
    participant Inventory as Inventory System
    participant Finance as Finance System
    participant Notification as Notification Service
    participant SSE as SSE Server

    User->>UI: Click Approve
    UI->>UI: Optimistic Update<br>Remove from Queue
    UI->>ServerAction: approveDocument({id, comments})

    ServerAction->>DB: BEGIN TRANSACTION

    ServerAction->>DB: SELECT FOR UPDATE<br>approval_queue_items<br>WHERE id AND doc_version
    DB-->>ServerAction: Queue Item (Locked)

    alt Concurrent Modification
        ServerAction->>ServerAction: Check doc_version
        ServerAction->>DB: ROLLBACK
        ServerAction-->>UI: Error: Concurrent Modification
        UI->>UI: Revert Optimistic Update
        UI-->>User: Show Error Toast
    else Version Matches
        ServerAction->>DB: INSERT approval_actions<br>WITH action_hash
        DB-->>ServerAction: Action Created

        ServerAction->>DB: UPDATE approval_queue_items<br>current_level++, doc_version++
        DB-->>ServerAction: Queue Updated

        alt Not Final Level
            ServerAction->>DB: INSERT new queue_item<br>FOR next level
            DB-->>ServerAction: Next Level Created
        else Final Level
            ServerAction->>DB: UPDATE document<br>status=approved
            DB-->>ServerAction: Document Approved
        end

        ServerAction->>DB: COMMIT TRANSACTION

        par Async Integrations
            ServerAction->>Budget: Confirm Budget Commitment<br>{document_id, amount}
            Budget-->>ServerAction: Commitment Confirmed
        and
            ServerAction->>Inventory: Create Inventory Transaction<br>{document_id, items}
            Inventory-->>ServerAction: Transaction Created
        and
            ServerAction->>Finance: Post GL Entry<br>{document_id, account_codes}
            Finance-->>ServerAction: GL Posted
        and
            ServerAction->>Notification: Send Approval Notification<br>{requestor, document}
            Notification-->>ServerAction: Notification Sent
        end

        ServerAction->>SSE: Push approval_removed Event<br>to All Approvers
        SSE-->>UI: Event Received

        ServerAction-->>UI: Success Response
        UI-->>User: Show Success Toast
        UI->>UI: Close Modal
    end

    Note over User,SSE: Optimistic UI provides<br>instant feedback
```

**Key Interactions**:
1. **Optimistic Update**: Remove from queue immediately before server call
2. **Atomic Transaction**: BEGIN TRANSACTION for data consistency
3. **Optimistic Locking**: SELECT FOR UPDATE with doc_version check
4. **Concurrent Detection**: Check version, ROLLBACK if modified
5. **Record Action**: INSERT approval_actions with cryptographic hash
6. **Update Level**: UPDATE approval_queue_items, increment level and version
7. **Route Next**: If not final level, create queue item for next approver
8. **Complete Document**: If final level, update document status to approved
9. **COMMIT**: Commit transaction if all steps successful
10. **Async Integrations**: Parallel calls to Budget, Inventory, Finance, Notification systems
11. **SSE Update**: Push event to all approvers to update their queues
12. **Success Response**: Return success to client, close modal

---

### Bulk Approve Sequence Diagram

**Purpose**: Component interactions when approving multiple documents atomically

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Approver
    participant UI as Bulk Toolbar
    participant ServerAction as Server Action
    participant DB as PostgreSQL
    participant Integration as Integration Queue
    participant Worker as Background Worker

    User->>UI: Select Multiple Docs (up to 50)
    UI->>UI: Validate Selection<br>Same type, All Pending
    UI->>UI: Display Summary<br>Count, Total Amount

    User->>UI: Confirm Bulk Approval
    UI->>UI: Optimistic Update<br>Remove All from Queue
    UI->>ServerAction: bulkApproveDocuments({ids[], comments})

    ServerAction->>DB: BEGIN ATOMIC TRANSACTION

    loop For Each Document
        ServerAction->>DB: SELECT FOR UPDATE<br>approval_queue_items<br>WHERE id
        DB-->>ServerAction: Queue Item (Locked)

        ServerAction->>ServerAction: Validate Authority<br>Status, No Self-Approval

        alt Any Validation Fails
            ServerAction->>DB: ROLLBACK TRANSACTION
            ServerAction-->>UI: Error: Failed Document List
            UI->>UI: Revert All Optimistic Updates
            UI-->>User: Show Error with Retry Option
        end
    end

    ServerAction->>ServerAction: Calculate Total Amount
    ServerAction->>ServerAction: Check Total Authority

    alt Total Exceeds Authority
        ServerAction->>DB: ROLLBACK TRANSACTION
        ServerAction-->>UI: Error: Authority Exceeded
        UI->>UI: Revert All Optimistic Updates
        UI-->>User: Show Error Toast
    else All Valid
        loop For Each Document
            ServerAction->>DB: INSERT approval_actions
            ServerAction->>DB: UPDATE approval_queue_items
            ServerAction->>DB: Route to Next Level
        end

        ServerAction->>DB: COMMIT ATOMIC TRANSACTION

        ServerAction->>Integration: Enqueue Bulk Integration Job<br>{document_ids[], type: bulk_approval}
        Integration-->>ServerAction: Job Queued

        ServerAction-->>UI: Success: Count Approved
        UI-->>User: Show Success Toast
        UI->>UI: Clear Selection

        Integration->>Worker: Process Bulk Integration Job

        par Parallel Integration for All Docs
            Worker->>Budget: Bulk Confirm Commitments
            Budget-->>Worker: All Confirmed
        and
            Worker->>Inventory: Bulk Create Transactions
            Inventory-->>Worker: All Created
        and
            Worker->>Finance: Bulk Post GL Entries
            Finance-->>Worker: All Posted
        end

        Worker->>Integration: Mark Job Complete
    end

    Note over User,Worker: Atomic transaction ensures<br>all or nothing approval
```

**Key Interactions**:
1. **Select Documents**: User selects up to 50 documents
2. **Validate Selection**: Check same type, all Pending status
3. **Display Summary**: Show count, total amount, document types
4. **Confirm**: User confirms bulk approval with warning
5. **Optimistic Update**: Remove all from queue immediately
6. **BEGIN ATOMIC TRANSACTION**: Start all-or-nothing transaction
7. **Lock All**: SELECT FOR UPDATE on all selected queue items
8. **Validate Each**: Check authority, status, self-approval for each document
9. **Calculate Total**: Sum total amount across all documents
10. **Check Authority**: Verify user authority covers total
11. **Process Loop**: For each document, record action, update queue, route
12. **COMMIT**: If all successful, commit atomic transaction
13. **Enqueue Job**: Add bulk integration job to background queue
14. **Success Response**: Return count to client
15. **Background Processing**: Worker processes integrations in parallel

**Atomic Guarantee**: If any document fails validation, entire batch is rolled back

---

## State Diagrams

### Queue Item Status State Diagram

**Purpose**: Shows all possible status transitions for approval_queue_items

```mermaid
stateDiagram-v2
    [*] --> pending: Document submitted<br>for approval

    pending --> under_review: Approver opens<br>document
    under_review --> pending: Approver closes<br>without action

    under_review --> approved: Approver approves<br>(not final level)
    approved --> pending: Routed to<br>next level

    under_review --> approved: Approver approves<br>(final level)
    approved --> [*]: Document fully<br>approved

    under_review --> rejected: Approver rejects
    rejected --> [*]: Document rejected,<br>workflow terminated

    under_review --> awaiting_info: Approver requests<br>more information
    awaiting_info --> pending: Requestor provides<br>information
    awaiting_info --> recalled: Requestor recalls<br>document
    recalled --> [*]: Document withdrawn

    pending --> recalled: Requestor recalls<br>before review
    under_review --> returned: Approver returns<br>to requestor
    returned --> [*]: Sent back for<br>correction

    pending --> delegated: Approver delegates<br>to another user
    delegated --> pending: Delegate assigned

    note right of pending
        SLA timer running
        Escalation monitoring active
    end note

    note right of awaiting_info
        SLA timer paused
        Awaiting requestor response
    end note

    note right of approved
        If not final level:
        Route to next approver
        If final level:
        Integration processing
    end note

    note right of rejected
        Release budget commitment
        Terminate workflow
        Notify requestor
    end note
```

**Status Definitions**:
- **pending**: Initial state, waiting for approver to review
- **under_review**: Approver has opened document, actively reviewing
- **approved**: Approval granted, either routing to next level or completing workflow
- **rejected**: Approval denied, workflow terminated
- **awaiting_info**: Approver requested more information from requestor (SLA paused)
- **returned**: Document sent back to requestor for correction
- **recalled**: Requestor withdrew document before or during approval
- **delegated**: Temporary state during delegation transfer

**Key Transitions**:
- **pending → under_review**: Approver opens document
- **under_review → approved**: Approver grants approval
- **approved → pending**: If not final level, route to next approver
- **under_review → rejected**: Approver denies approval
- **under_review → awaiting_info**: Approver requests clarification (pauses SLA)
- **awaiting_info → pending**: Requestor provides requested information (resumes SLA)
- **pending/under_review → recalled**: Requestor withdraws document

---

### Delegation Status State Diagram

**Purpose**: Shows all possible status transitions for approval_delegations

```mermaid
stateDiagram-v2
    [*] --> scheduled: Delegation created<br>start_datetime > NOW
    [*] --> active: Delegation created<br>start_datetime <= NOW

    scheduled --> active: Background job runs<br>at start_datetime

    scheduled --> revoked: Delegator cancels<br>before activation
    revoked --> [*]: Delegation canceled

    scheduled --> refused: Delegate refuses<br>delegation
    refused --> [*]: Delegation declined

    active --> expired: Background job runs<br>at end_datetime
    expired --> [*]: Delegation ended<br>naturally

    active --> revoked: Delegator cancels<br>early

    active --> extended: Delegator extends<br>end_datetime
    extended --> active: End date updated

    note right of scheduled
        Status: Scheduled
        No approvals transferred yet
        Background job scheduled
        for activation
    end note

    note right of active
        Status: Active
        Approvals transferred
        New approvals routed
        to delegate
    end note

    note right of expired
        Status: Expired
        No longer active
        New approvals route to
        original approver
    end note

    note right of revoked
        Status: Revoked
        Canceled by delegator
        Approvals transferred back
        if previously active
    end note

    note right of refused
        Status: Refused
        Declined by delegate
        Never activated
    end note
```

**Status Definitions**:
- **scheduled**: Delegation created for future activation (start_datetime > NOW)
- **active**: Delegation currently active, approvals routed to delegate
- **expired**: Delegation ended naturally at end_datetime
- **revoked**: Delegation canceled by delegator before or during active period
- **refused**: Delegation declined by delegate before activation

**Key Transitions**:
- **[*] → scheduled**: Create delegation with future start date
- **[*] → active**: Create delegation with immediate start (start_datetime ≤ NOW)
- **scheduled → active**: Background job activates at start_datetime
- **active → expired**: Background job expires at end_datetime
- **scheduled/active → revoked**: Delegator cancels delegation
- **scheduled → refused**: Delegate declines delegation before activation
- **active → extended**: Delegator extends end_datetime (only if within max 90 days)

**Background Jobs**:
- **Activation Job**: Runs at start_datetime to activate scheduled delegations
- **Expiration Job**: Runs at end_datetime to expire active delegations

---

## Integration Flows

### Budget Integration Flow

**Purpose**: Integration with Budget Management System for commitment tracking

```mermaid
flowchart TD
    Start([Approval Completed<br>Final Level]) --> CheckBudgetImpact{Budget impact<br>exists?}

    CheckBudgetImpact -->|No| SkipBudget[Skip Budget Integration]
    SkipBudget --> NextIntegration([Continue to<br>Next Integration])

    CheckBudgetImpact -->|Yes| GetBudgetDetails[Get Budget Details:<br>- Department<br>- Account Code<br>- Amount<br>- Currency]

    GetBudgetDetails --> CallBudgetAPI[Call Budget API:<br>POST /api/budget/confirm-commitment]
    CallBudgetAPI --> BudgetValidates[Budget System Validates:<br>- Budget exists<br>- Sufficient balance<br>- Not expired]

    BudgetValidates --> BudgetResult{Validation<br>Result}

    BudgetResult -->|Success| ConfirmCommitment[Budget System:<br>- Confirms commitment<br>- Reduces available balance<br>- Logs transaction]
    ConfirmCommitment --> UpdateQueueBudget[Update Queue Item:<br>budget_commitment_confirmed=true]
    UpdateQueueBudget --> NextIntegration

    BudgetResult -->|Budget Exceeded| CheckOverride{Policy override<br>approved?}
    CheckOverride -->|Yes| OverrideCommitment[Budget System:<br>- Flag as override<br>- Confirm with warning<br>- Log exception]
    OverrideCommitment --> NextIntegration

    CheckOverride -->|No| RejectForBudget[Budget Insufficient:<br>Cannot Approve]
    RejectForBudget --> RollbackApproval[Rollback Approval Action]
    RollbackApproval --> NotifyApprover[Notify Approver:<br>Budget Exceeded]
    NotifyApprover --> EndReject([End: Rejected])

    BudgetResult -->|Budget Not Found| FlagMissingBudget[Flag Error:<br>Budget Configuration Missing]
    FlagMissingBudget --> LogError[Log Integration Error]
    LogError --> RetryQueue[Add to Retry Queue]
    RetryQueue --> NotifyAdmin[Notify System Admin]
    NotifyAdmin --> NextIntegration

    BudgetResult -->|API Timeout| RetryBudget{Retry<br>attempt?}
    RetryBudget -->|< 3 attempts| WaitBackoff[Wait with<br>Exponential Backoff]
    WaitBackoff --> CallBudgetAPI

    RetryBudget -->|>= 3 attempts| FlagTimeout[Flag Timeout Error]
    FlagTimeout --> LogError

    BudgetResult -->|Budget Expired| FlagExpired[Flag Budget Expired]
    FlagExpired --> NotifyFinance[Notify Finance Team]
    NotifyFinance --> LogError

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style NextIntegration fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style EndReject fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style CallBudgetAPI fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ConfirmCommitment fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style RollbackApproval fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
```

**Integration Steps**:

1. **Check Budget Impact**: Determine if document has budget impact
2. **Get Budget Details**: Retrieve department, account code, amount, currency
3. **Call Budget API**: POST to Budget System API with commitment details
4. **Budget Validates**: Budget System checks budget exists, sufficient balance, not expired
5. **Handle Result**:
   - **Success**: Confirm commitment, reduce available balance, log transaction
   - **Budget Exceeded**: Check if policy override approved
     - If yes: Flag as override, confirm with warning
     - If no: Reject approval, rollback, notify approver
   - **Budget Not Found**: Flag error, log, add to retry queue, notify admin
   - **API Timeout**: Retry up to 3 times with exponential backoff
   - **Budget Expired**: Flag error, notify finance team

**Error Handling**:
- **Retry Strategy**: Up to 3 retry attempts with exponential backoff (1s, 2s, 4s)
- **Fallback**: If all retries fail, flag for manual review and continue workflow
- **Notifications**: Notify approver of budget issues, admin of integration failures
- **Logging**: Log all budget integration attempts with timestamps and errors

---

### Inventory Integration Flow

**Purpose**: Integration with Inventory Management System for stock transactions

```mermaid
flowchart TD
    Start([Approval Completed<br>Final Level]) --> CheckInventoryImpact{Inventory<br>impacted?}

    CheckInventoryImpact -->|No| SkipInventory[Skip Inventory Integration]
    SkipInventory --> NextIntegration([Continue to<br>Next Integration])

    CheckInventoryImpact -->|Yes| GetDocumentType{Document<br>Type}

    GetDocumentType -->|Purchase Order| PrepareReceiving[Prepare GRN Data:<br>- PO Line Items<br>- Expected Quantities<br>- Destination Location]
    GetDocumentType -->|Wastage| PrepareWastage[Prepare Wastage Data:<br>- Wastage Items<br>- Quantities<br>- Source Location<br>- Reason Codes]
    GetDocumentType -->|Stock Requisition| PrepareTransfer[Prepare Transfer Data:<br>- Requested Items<br>- Quantities<br>- Source Location<br>- Destination Location]
    GetDocumentType -->|Stock Transfer| PrepareTransfer
    GetDocumentType -->|Inventory Adjustment| PrepareAdjustment[Prepare Adjustment Data:<br>- Items<br>- Adjustment Quantities<br>- Location<br>- Reason]

    PrepareReceiving --> CallInventoryAPI[Call Inventory API:<br>POST /api/inventory/create-transaction]
    PrepareWastage --> CallInventoryAPI
    PrepareTransfer --> CallInventoryAPI
    PrepareAdjustment --> CallInventoryAPI

    CallInventoryAPI --> InventoryValidates[Inventory System Validates:<br>- Products exist<br>- Locations exist<br>- Stock available (if reduction)]

    InventoryValidates --> InventoryResult{Validation<br>Result}

    InventoryResult -->|Success| CreateTransaction[Inventory System:<br>- Creates transaction record<br>- Updates stock levels<br>- Logs movement<br>- Updates costing]
    CreateTransaction --> UpdateQueueInventory[Update Queue Item:<br>inventory_transaction_created=true<br>transaction_reference]
    UpdateQueueInventory --> NextIntegration

    InventoryResult -->|Stock Insufficient| CheckPartialApproval{Partial approval<br>supported?}
    CheckPartialApproval -->|Yes| PartialTransaction[Create Partial Transaction:<br>- Available quantity only<br>- Flag remaining as backorder]
    PartialTransaction --> NotifyPartial[Notify Requestor:<br>Partial Fulfillment]
    NotifyPartial --> NextIntegration

    CheckPartialApproval -->|No| RejectForStock[Insufficient Stock:<br>Cannot Approve]
    RejectForStock --> RollbackApproval[Rollback Approval Action]
    RollbackApproval --> NotifyApprover[Notify Approver:<br>Stock Insufficient]
    NotifyApprover --> EndReject([End: Rejected])

    InventoryResult -->|Product Not Found| FlagMissingProduct[Flag Error:<br>Product Configuration Missing]
    FlagMissingProduct --> LogError[Log Integration Error]
    LogError --> RetryQueue[Add to Retry Queue]
    RetryQueue --> NotifyAdmin[Notify System Admin]
    NotifyAdmin --> NextIntegration

    InventoryResult -->|Location Not Found| FlagMissingLocation[Flag Error:<br>Location Configuration Missing]
    FlagMissingLocation --> LogError

    InventoryResult -->|API Timeout| RetryInventory{Retry<br>attempt?}
    RetryInventory -->|< 3 attempts| WaitBackoff[Wait with<br>Exponential Backoff]
    WaitBackoff --> CallInventoryAPI

    RetryInventory -->|>= 3 attempts| FlagTimeout[Flag Timeout Error]
    FlagTimeout --> LogError

    InventoryResult -->|Costing Error| FlagCostingError[Flag Costing Error:<br>Transaction created<br>but costing failed]
    FlagCostingError --> NotifyFinance[Notify Finance Team]
    NotifyFinance --> NextIntegration

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style NextIntegration fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style EndReject fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style CallInventoryAPI fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style CreateTransaction fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style RollbackApproval fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
```

**Integration Steps**:

1. **Check Inventory Impact**: Determine if document affects inventory
2. **Get Document Type**: Identify document type to determine transaction type
3. **Prepare Transaction Data**: Format data based on document type
   - Purchase Order: GRN data (line items, quantities, destination)
   - Wastage: Wastage data (items, quantities, source, reason codes)
   - Stock Requisition/Transfer: Transfer data (items, source, destination)
   - Inventory Adjustment: Adjustment data (items, quantities, location, reason)
4. **Call Inventory API**: POST to Inventory System API
5. **Inventory Validates**: Check products exist, locations exist, stock available
6. **Handle Result**:
   - **Success**: Create transaction, update stock levels, log movement, update costing
   - **Stock Insufficient**: Check if partial approval supported
     - If yes: Create partial transaction, flag remaining as backorder
     - If no: Reject approval, rollback, notify approver
   - **Product/Location Not Found**: Flag error, log, add to retry queue
   - **API Timeout**: Retry up to 3 times with exponential backoff
   - **Costing Error**: Transaction created but costing failed, notify finance team

**Error Handling**:
- **Retry Strategy**: Up to 3 retry attempts with exponential backoff
- **Partial Fulfillment**: Support partial transactions for stock unavailability
- **Fallback**: If all retries fail, flag for manual review
- **Notifications**: Notify approver of stock issues, admin of integration failures

---

### Finance Integration Flow

**Purpose**: Integration with Finance System for GL posting and accounting

```mermaid
flowchart TD
    Start([Approval Completed<br>Final Level]) --> CheckGLImpact{GL impact<br>exists?}

    CheckGLImpact -->|No| SkipFinance[Skip Finance Integration]
    SkipFinance --> NextIntegration([Continue to<br>Completion])

    CheckGLImpact -->|Yes| GetAccountMapping[Get Account Code Mapping:<br>- Document Type<br>- Product Category<br>- Department<br>- Cost Center]

    GetAccountMapping --> BuildGLEntry[Build GL Entry:<br>- Debit Accounts<br>- Credit Accounts<br>- Amounts<br>- Currency<br>- Tax<br>- Description<br>- Reference]

    BuildGLEntry --> ValidateGLEntry{GL Entry<br>balanced?}
    ValidateGLEntry -->|No| GLError[GL Entry Error:<br>Debits != Credits]
    GLError --> LogGLError[Log GL Configuration Error]
    LogGLError --> NotifyFinance[Notify Finance Team]
    NotifyFinance --> FlagManualPosting[Flag for Manual GL Posting]
    FlagManualPosting --> NextIntegration

    ValidateGLEntry -->|Yes| CallFinanceAPI[Call Finance API:<br>POST /api/finance/post-gl-entry]
    CallFinanceAPI --> FinanceValidates[Finance System Validates:<br>- Accounts exist<br>- Posting period open<br>- Currency valid<br>- Tax codes valid]

    FinanceValidates --> FinanceResult{Validation<br>Result}

    FinanceResult -->|Success| PostGLEntry[Finance System:<br>- Posts GL entry<br>- Updates ledgers<br>- Creates journal<br>- Calculates tax]
    PostGLEntry --> GetJournalNo[Finance System Returns:<br>Journal Entry Number]
    GetJournalNo --> UpdateQueueFinance[Update Queue Item:<br>gl_posted=true<br>journal_entry_number]
    UpdateQueueFinance --> NextIntegration

    FinanceResult -->|Account Not Found| FlagMissingAccount[Flag Error:<br>Account Code Missing]
    FlagMissingAccount --> LogGLError

    FinanceResult -->|Period Closed| CheckForcePost{Force post to<br>next period?}
    CheckForcePost -->|Yes| PostNextPeriod[Post to Next Open Period<br>with Effective Date]
    PostNextPeriod --> NextIntegration
    CheckForcePost -->|No| FlagPeriodClosed[Flag Period Closed Error]
    FlagPeriodClosed --> NotifyFinance

    FinanceResult -->|Currency Error| FlagCurrencyError[Flag Currency Error:<br>Invalid or Inactive Currency]
    FlagCurrencyError --> LogGLError

    FinanceResult -->|Tax Calculation Error| FlagTaxError[Flag Tax Error:<br>Invalid Tax Code]
    FlagTaxError --> NotifyFinance

    FinanceResult -->|API Timeout| RetryFinance{Retry<br>attempt?}
    RetryFinance -->|< 3 attempts| WaitBackoff[Wait with<br>Exponential Backoff]
    WaitBackoff --> CallFinanceAPI

    RetryFinance -->|>= 3 attempts| FlagTimeout[Flag Timeout Error]
    FlagTimeout --> LogGLError

    FinanceResult -->|Posting Restriction| FlagRestriction[Flag Posting Restriction:<br>Account Frozen or Inactive]
    FlagRestriction --> NotifyFinance

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style NextIntegration fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style CallFinanceAPI fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style PostGLEntry fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style GLError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style FlagMissingAccount fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
```

**Integration Steps**:

1. **Check GL Impact**: Determine if document requires GL posting
2. **Get Account Mapping**: Retrieve account code mapping based on document type, product category, department, cost center
3. **Build GL Entry**: Construct GL entry with debit/credit accounts, amounts, currency, tax, description
4. **Validate GL Entry**: Check debits equal credits (balanced entry)
5. **Call Finance API**: POST to Finance System API
6. **Finance Validates**: Check accounts exist, posting period open, currency valid, tax codes valid
7. **Handle Result**:
   - **Success**: Post GL entry, update ledgers, create journal, calculate tax, return journal number
   - **Account Not Found**: Flag error, log, notify finance team
   - **Period Closed**: Check if can force post to next period
     - If yes: Post to next open period with effective date
     - If no: Flag period closed error, notify finance team
   - **Currency/Tax Error**: Flag error, notify finance team
   - **API Timeout**: Retry up to 3 times with exponential backoff
   - **Posting Restriction**: Flag restriction (account frozen), notify finance team

**Error Handling**:
- **Retry Strategy**: Up to 3 retry attempts with exponential backoff
- **GL Balance Validation**: Ensure debits equal credits before posting
- **Period Handling**: Support force posting to next period if current period closed
- **Fallback**: If all retries fail, flag for manual GL posting
- **Notifications**: Notify finance team of all integration errors

---

## SLA Management Flow

**Purpose**: SLA calculation, monitoring, escalation, and deadline management

```mermaid
flowchart TD
    Start([Queue Item Created]) --> LoadSLAConfig[Load SLA Configuration:<br>- Document Type<br>- Priority Level]

    LoadSLAConfig --> CalcBusinessHours[Calculate Business Hours:<br>- Business hours start/end<br>- Business days<br>- Exclude holidays]

    CalcBusinessHours --> CalcDeadline[Calculate SLA Deadline:<br>submission_timestamp +<br>target_approval_hours<br>in business hours]

    CalcDeadline --> SetDeadline[Set sla_deadline in<br>approval_queue_items]
    SetDeadline --> StartMonitoring[Start SLA Monitoring<br>Background Job]

    StartMonitoring --> MonitorLoop{Queue Item<br>Status}

    MonitorLoop -->|Pending or Under Review| CheckSLAProgress{SLA<br>Progress}

    CheckSLAProgress -->|< Approaching Threshold| Continue[Continue Monitoring]
    Continue --> Wait[Wait 5 minutes]
    Wait --> MonitorLoop

    CheckSLAProgress -->|>= Approaching Threshold| CheckNotifySent{Approaching<br>notification sent?}
    CheckNotifySent -->|Yes| CheckEscalation
    CheckNotifySent -->|No| SendApproaching[Send Approaching SLA<br>Notification to Approver]
    SendApproaching --> LogNotification[Log Notification Sent]
    LogNotification --> CheckEscalation

    CheckEscalation{>= Escalation<br>Threshold}
    CheckEscalation -->|No| Continue
    CheckEscalation -->|Yes| CheckEscalationSent{Escalation<br>sent?}
    CheckEscalationSent -->|Yes| CheckBreach
    CheckEscalationSent -->|No| SendEscalation[Send Escalation to:<br>- Escalation Level 1 Role<br>- Approver's Manager]

    SendEscalation --> UpdateEscalation[Update Queue Item:<br>sla_escalation_sent=true<br>sla_escalation_sent_at]
    UpdateEscalation --> CheckMultiLevel{Multiple escalation<br>levels configured?}

    CheckMultiLevel -->|Yes| ScheduleLevel2[Schedule Level 2 Escalation<br>after interval hours]
    ScheduleLevel2 --> CheckBreach
    CheckMultiLevel -->|No| CheckBreach

    CheckBreach{SLA<br>Breach}
    CheckBreach -->|No| Continue
    CheckBreach -->|Yes| SendBreachNotif[Send SLA Breach<br>Notification to:<br>- Approver<br>- Manager<br>- System Admin]

    SendBreachNotif --> LogBreach[Log SLA Breach Event:<br>- Time breached<br>- Total delay<br>- Responsible party]
    LogBreach --> FlagOverdue[Flag Queue Item:<br>is_overdue=true]
    FlagOverdue --> Continue

    MonitorLoop -->|Awaiting Info| PauseSLA[Pause SLA Timer:<br>sla_paused_at=NOW]
    PauseSLA --> CalculatePaused[Track sla_paused_duration]
    CalculatePaused --> WaitResume[Wait for Status Change]
    WaitResume --> StatusChange{Status<br>Changed}

    StatusChange -->|Back to Pending| ResumeSLA[Resume SLA Timer:<br>Add paused duration<br>to deadline]
    ResumeSLA --> MonitorLoop
    StatusChange -->|Other| MonitorLoop

    MonitorLoop -->|Approved| StopMonitoring[Stop SLA Monitoring]
    StopMonitoring --> CalcDuration[Calculate Actual<br>Approval Duration]
    CalcDuration --> RecordMetrics[Record SLA Metrics:<br>- Within SLA?<br>- Time taken<br>- Escalations needed]
    RecordMetrics --> EndSuccess([End: SLA Complete])

    MonitorLoop -->|Rejected or Recalled| StopMonitoring

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style EndSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style SendEscalation fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style SendBreachNotif fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style LoadSLAConfig fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style CalcDeadline fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

**SLA Management Steps**:

1. **Load SLA Configuration**: Query approval_sla_configuration by document_type and priority_level
2. **Calculate Business Hours**: Get business hours start/end, business days, holiday exclusions
3. **Calculate Deadline**: Add target_approval_hours to submission_timestamp in business hours only
4. **Set Deadline**: Update approval_queue_items.sla_deadline
5. **Start Monitoring**: Background job monitors SLA progress every 5 minutes
6. **Monitor Loop**: Check queue item status
   - **Pending/Under Review**: Continue monitoring
   - **Awaiting Info**: Pause SLA timer
   - **Approved/Rejected/Recalled**: Stop monitoring
7. **Check Progress**:
   - **< Approaching Threshold (75%)**: Continue monitoring
   - **>= Approaching Threshold**: Send approaching notification to approver (if not sent)
   - **>= Escalation Threshold (80%)**: Send escalation to Level 1 role and manager (if not sent)
   - **SLA Breach (100%)**: Send breach notification to approver, manager, admin; log breach; flag overdue
8. **Multi-Level Escalation**: If configured, schedule Level 2 and Level 3 escalations at intervals
9. **Pause/Resume**: When status changes to awaiting_info, pause SLA; when back to pending, resume with adjusted deadline
10. **Complete**: When approved/rejected, stop monitoring, calculate actual duration, record metrics

**SLA Thresholds** (Configurable):
- **Approaching SLA**: 75% elapsed (default) - Warning notification
- **Escalation**: 80% elapsed (default) - Escalate to manager
- **Breach**: 100% elapsed - SLA violated

**Business Hours Calculation**:
- **Business Hours**: 08:00 - 18:00 (default, configurable per organization)
- **Business Days**: Monday - Friday (default, configurable)
- **Holiday Exclusions**: Public holidays excluded from SLA calculation
- **Weekend Handling**: Saturday and Sunday excluded from SLA calculation

---

## Error Handling Flow

**Purpose**: Comprehensive error processing and recovery strategies

```mermaid
flowchart TD
    Start([Error Occurs]) --> ClassifyError{Error<br>Type}

    ClassifyError -->|Validation Error| HandleValidation[Validation Error:<br>- Invalid data<br>- Missing required fields<br>- Business rule violation]
    HandleValidation --> DisplayValidation[Display Inline Error<br>Messages to User]
    DisplayValidation --> AllowCorrection[Allow User to<br>Correct Input]
    AllowCorrection --> RetryOperation[User Retries<br>Operation]

    ClassifyError -->|Concurrent Modification| HandleConcurrent[Concurrent Modification:<br>- Optimistic locking failure<br>- doc_version mismatch]
    HandleConcurrent --> RollbackTxn[ROLLBACK Transaction]
    RollbackTxn --> RevertOptimistic[Revert Optimistic<br>UI Update]
    RevertOptimistic --> DisplayConflict[Display Conflict Error:<br>Document modified by<br>another user]
    DisplayConflict --> SuggestRefresh[Suggest Refresh and<br>Retry]

    ClassifyError -->|Database Error| HandleDatabase[Database Error:<br>- Connection timeout<br>- Query timeout<br>- Deadlock]
    HandleDatabase --> CheckRetryable{Retryable<br>Error?}
    CheckRetryable -->|Yes| ExponentialBackoff[Wait with<br>Exponential Backoff<br>1s, 2s, 4s, 8s]
    ExponentialBackoff --> RetryDatabase{Retry<br>Attempt}
    RetryDatabase -->|< Max Retries| RetryOperation
    RetryDatabase -->|>= Max Retries| PermanentFailure

    CheckRetryable -->|No| PermanentFailure[Permanent Database<br>Failure]
    PermanentFailure --> LogCriticalError[Log Critical Error<br>with Stack Trace]
    LogCriticalError --> NotifyDevOps[Notify DevOps Team]
    NotifyDevOps --> DisplaySystemError[Display System Error<br>to User]
    DisplaySystemError --> SuggestContactSupport[Suggest Contact<br>Support]

    ClassifyError -->|Integration Error| HandleIntegration[Integration Error:<br>- Budget System timeout<br>- Inventory System error<br>- Finance System unavailable]
    HandleIntegration --> CheckIntegrationType{Integration<br>Type}

    CheckIntegrationType -->|Budget| RetryBudget[Retry Budget Integration<br>up to 3 times]
    RetryBudget --> BudgetRetryResult{Success?}
    BudgetRetryResult -->|Yes| ContinueApproval
    BudgetRetryResult -->|No| FlagBudgetError[Flag Budget Error]
    FlagBudgetError --> QueueManualReview[Add to Manual Review<br>Queue]
    QueueManualReview --> NotifyApprover[Notify Approver:<br>Partial Success<br>Manual Review Needed]
    NotifyApprover --> ContinueApproval[Continue Approval<br>Process]

    CheckIntegrationType -->|Inventory| RetryInventory[Retry Inventory Integration<br>up to 3 times]
    RetryInventory --> InventoryRetryResult{Success?}
    InventoryRetryResult -->|Yes| ContinueApproval
    InventoryRetryResult -->|No| FlagInventoryError[Flag Inventory Error]
    FlagInventoryError --> QueueManualReview

    CheckIntegrationType -->|Finance| RetryFinance[Retry Finance Integration<br>up to 3 times]
    RetryFinance --> FinanceRetryResult{Success?}
    FinanceRetryResult -->|Yes| ContinueApproval
    FinanceRetryResult -->|No| FlagFinanceError[Flag Finance Error]
    FlagFinanceError --> QueueManualReview

    ClassifyError -->|Authorization Error| HandleAuthorization[Authorization Error:<br>- Insufficient authority<br>- User not assigned<br>- Delegation expired]
    HandleAuthorization --> DisplayAuthError[Display Authorization<br>Error to User]
    DisplayAuthError --> SuggestContact[Suggest Contact<br>Manager or Admin]

    ClassifyError -->|SLA Breach| HandleSLA[SLA Breach:<br>- Approval overdue<br>- Response deadline missed]
    HandleSLA --> SendBreachNotif[Send SLA Breach<br>Notifications]
    SendBreachNotif --> LogSLABreach[Log SLA Breach Event]
    LogSLABreach --> ContinueProcess[Continue Approval<br>Process]

    ClassifyError -->|Workflow Error| HandleWorkflow[Workflow Error:<br>- Routing failure<br>- Invalid workflow state<br>- Missing approver]
    HandleWorkflow --> FallbackWorkflow[Use Fallback<br>Workflow Routing]
    FallbackWorkflow --> NotifyAdmin[Notify System Admin]
    NotifyAdmin --> ContinueProcess

    ClassifyError -->|Unknown Error| HandleUnknown[Unknown Error:<br>- Unexpected exception<br>- Unhandled case]
    HandleUnknown --> LogDetailedError[Log Detailed Error:<br>- Stack trace<br>- Request context<br>- User info<br>- Timestamp]
    LogDetailedError --> SendErrorReport[Send Error Report<br>to Sentry]
    SendErrorReport --> DisplayGenericError[Display Generic Error<br>to User]
    DisplayGenericError --> SuggestContactSupport

    ContinueApproval --> EndRecovery([End: Recovered])
    ContinueProcess --> EndRecovery
    RetryOperation --> EndRecovery
    SuggestContactSupport --> EndFailure([End: Failed])
    SuggestContact --> EndFailure
    SuggestRefresh --> EndFailure

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style EndRecovery fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style EndFailure fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style DisplayValidation fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style DisplayConflict fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style DisplaySystemError fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style LogCriticalError fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style RollbackTxn fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
```

**Error Categories and Handling**:

**1. Validation Errors**:
- **Cause**: Invalid data, missing fields, business rule violations
- **Handling**: Display inline error messages, allow user correction, retry
- **Recovery**: User corrects input and resubmits

**2. Concurrent Modification Errors**:
- **Cause**: Optimistic locking failure (doc_version mismatch)
- **Handling**: Rollback transaction, revert optimistic UI update, display conflict error
- **Recovery**: Suggest refresh and retry operation

**3. Database Errors**:
- **Cause**: Connection timeout, query timeout, deadlock
- **Handling**: Check if retryable, apply exponential backoff (1s, 2s, 4s, 8s)
- **Retry**: Up to 3-5 attempts
- **Recovery**: If retryable, automatic retry; if not, log critical error, notify DevOps

**4. Integration Errors**:
- **Cause**: Budget/Inventory/Finance system timeout or error
- **Handling**: Retry up to 3 times with exponential backoff
- **Recovery**: If successful, continue approval; if failed, flag for manual review, notify approver of partial success

**5. Authorization Errors**:
- **Cause**: Insufficient authority, user not assigned, delegation expired
- **Handling**: Display authorization error, suggest contact manager or admin
- **Recovery**: User contacts appropriate person to resolve authority issue

**6. SLA Breach**:
- **Cause**: Approval overdue, response deadline missed
- **Handling**: Send SLA breach notifications, log breach event
- **Recovery**: Continue approval process (SLA breach does not block workflow)

**7. Workflow Errors**:
- **Cause**: Routing failure, invalid workflow state, missing approver
- **Handling**: Use fallback workflow routing, notify system admin
- **Recovery**: Continue with fallback routing rules

**8. Unknown Errors**:
- **Cause**: Unexpected exception, unhandled case
- **Handling**: Log detailed error (stack trace, context, user info), send to Sentry
- **Recovery**: Display generic error, suggest contact support

**Retry Strategies**:
- **Exponential Backoff**: 1s, 2s, 4s, 8s, 16s (max 5 retries)
- **Jitter**: Add random variation to prevent thundering herd
- **Circuit Breaker**: Stop retries if system consistently failing
- **Timeout**: Each retry has shorter timeout to fail fast

**Logging and Monitoring**:
- **Error Logging**: All errors logged with context (user, action, timestamp, stack trace)
- **Sentry Integration**: Critical errors sent to Sentry for tracking and alerting
- **Metrics**: Error rates tracked by type (validation, database, integration, authorization)
- **Alerting**: Critical errors trigger immediate alerts to DevOps team

---

## Document Status

**Completeness**: ✅ All 17 diagrams documented (Process Flow, Data Flow, Sequence, State, Integration, SLA, Error Handling)

**Coverage**:
- ✅ High-Level Process Flow: End-to-end approval lifecycle
- ✅ Approval Queue Loading: Real-time SSE updates
- ✅ Single Document Approval: Complete approval workflow with all actions
- ✅ Bulk Approval: Atomic batch processing
- ✅ Delegation Setup: Create, activate, expire delegations
- ✅ Context Diagram: System boundaries and external entities
- ✅ System Decomposition: Major processes and data stores
- ✅ View Queue Sequence: Component interactions for queue loading
- ✅ Approve Document Sequence: Component interactions for approval
- ✅ Bulk Approve Sequence: Component interactions for bulk approval
- ✅ Queue Item State: Status transitions for approval queue items
- ✅ Delegation State: Status transitions for delegations
- ✅ Budget Integration: Budget system integration flow
- ✅ Inventory Integration: Inventory system integration flow
- ✅ Finance Integration: Finance system integration flow
- ✅ SLA Management: SLA calculation, monitoring, escalation
- ✅ Error Handling: Comprehensive error processing and recovery

**Next Steps**: Create VAL-my-approvals.md (Validation Rules)

---

**Document Classification**: Internal Use Only
**Review Frequency**: Quarterly or when major workflow changes occur
**Approval Required**: Yes - Procurement Manager, System Architect
**Version Control**: Maintained in Git with change history
