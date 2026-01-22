# Flow Diagrams: Period End

> Version: 2.0.0 | Status: Active | Last Updated: 2025-01-16

## 1. Document Control

| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Feature | Period End |
| Document Type | Flow Diagrams |

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: corrected status lifecycle (open, in_progress, closing, closed), 3-stage validation flow, actual page navigation |
| 1.1.0 | 2025-12-09 | Development Team | Updated state diagrams |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

## 2. Period Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> open: Create Period

    open --> inprogress: Initiate Close

    inprogress --> closing: Run Validations

    closing --> closed: All Pass and Confirm
    closing --> inprogress: Resolve Issues

    closed --> [*]
```

### Status Descriptions

| Status | Badge Color | Description |
|--------|-------------|-------------|
| open | Blue | Period created, accepting transactions |
| in_progress | Yellow | Close workflow initiated |
| closing | Orange | Validations being run |
| closed | Green | Period finalized, locked |

---

## 3. Page Navigation Flow

```mermaid
graph TB
    subgraph Pages
        LIST[Period List Page<br>/period-end]
        DETAIL[Period Detail Page<br>/period-end/id]
        CLOSE[Close Workflow Page<br>/period-end/close/id]
    end

    LIST -->|View Details| DETAIL
    LIST -->|Start Period Close| CLOSE
    DETAIL -->|Start Period Close| CLOSE
    CLOSE -->|Period Closed| LIST
    CLOSE -->|Period Not Found| LIST
    DETAIL -->|Back| LIST
```

---

## 4. Period Close Workflow

```mermaid
graph TB
    START([User: Start Period Close]) --> LOAD[Load Period]

    LOAD --> CHECK{Period Found?}
    CHECK -->|No| ERROR1[Error: Period Not Found]
    CHECK -->|Yes| STATUS{Already Closed?}

    STATUS -->|Yes| INFO[Info: Period Already Closed]
    STATUS -->|No| DISPLAY[Display ValidationChecklist]

    DISPLAY --> VALIDATE[User: Click Validate All]

    VALIDATE --> STAGE1[Stage 1: Validate Transactions]
    STAGE1 --> STAGE2[Stage 2: Validate Spot Checks]
    STAGE2 --> STAGE3[Stage 3: Validate Physical Counts]

    STAGE3 --> RESULT{All Pass?}
    RESULT -->|No| ISSUES[Show Issues with Help Text]
    ISSUES --> RESOLVE[User: Resolve Issues]
    RESOLVE --> VALIDATE

    RESULT -->|Yes| ENABLE[Enable Close Button]
    ENABLE --> CLICK[User: Click Close Period]

    CLICK --> CONFIRM[Show Confirmation Dialog]
    CONFIRM --> DECISION{Confirm?}

    DECISION -->|No| DISPLAY
    DECISION -->|Yes| CLOSE[Close Period]

    CLOSE --> SUCCESS[Success: Redirect to List]

    ERROR1 --> END([End])
    INFO --> END
    SUCCESS --> END

```

---

## 5. 3-Stage Validation Flow

```mermaid
graph TB
    subgraph Stage1[Stage 1: Transactions]
        T1[Query GRN Documents]
        T2[Query ADJ Documents]
        T3[Query TRF Documents]
        T4[Query SR Documents]
        T5[Query WR Documents]
        T1 --> TC{All Posted?}
        T2 --> TC
        T3 --> TC
        T4 --> TC
        T5 --> TC
        TC -->|Yes| TP[transactionsCommitted = true]
        TC -->|No| TF[transactionsCommitted = false]
    end

    subgraph Stage2[Stage 2: Spot Checks]
        S1[Query Spot Checks in Period]
        S1 --> SC{All Completed?}
        SC -->|Yes| SP[spotChecksComplete = true]
        SC -->|No| SF[spotChecksComplete = false]
    end

    subgraph Stage3[Stage 3: Physical Counts]
        P1[Query Physical Counts in Period]
        P1 --> PC{All Finalized?}
        PC -->|Yes| PP[physicalCountsFinalized = true]
        PC -->|No| PF[physicalCountsFinalized = false]
    end

    TP --> FINAL
    TF --> FINAL
    SP --> FINAL
    SF --> FINAL
    PP --> FINAL
    PF --> FINAL

    FINAL{All Three Pass?}
    FINAL -->|Yes| PASS[allChecksPassed = true]
    FINAL -->|No| FAIL[allChecksPassed = false]
```

---

## 6. Component Hierarchy

```mermaid
graph TB
    subgraph CloseWorkflowPage
        PAGE[close/id/page.tsx]
        PAGE --> PSC[PeriodSummaryCard]
        PAGE --> VSC[ValidationSummaryCard]
        PAGE --> VCL[ValidationChecklist]
    end

    subgraph ValidationChecklist
        VCL --> VS1[ValidationSection: Transactions]
        VCL --> VS2[ValidationSection: Spot Checks]
        VCL --> VS3[ValidationSection: Physical Counts]
    end

    subgraph ValidationSection
        VS1 --> TVI[TransactionValidationItem]
        VS2 --> VI1[ValidationItem]
        VS3 --> VI2[ValidationItem]
    end
```

---

## 7. Validation Checklist UI Flow

```mermaid
graph TB
    subgraph ValidationChecklist
        HEADER[Checklist Header]
        BTN[Validate All Button]

        SEC1[Section 1: Transactions]
        SEC2[Section 2: Spot Checks]
        SEC3[Section 3: Physical Counts]
    end

    HEADER --> BTN
    BTN -->|Click| LOADING[isValidating = true]
    LOADING --> RUN[Run All Validations]
    RUN --> UPDATE[Update checklist state]
    UPDATE --> DONE[isValidating = false]

    subgraph Section Behavior
        EXPAND[Sections Start Expanded]
        TOGGLE[Click to Collapse/Expand]
        BADGE[Show Pass/Fail Badge]
        COUNT[Show Issue Count if Failed]
    end

    SEC1 --> EXPAND
    SEC2 --> EXPAND
    SEC3 --> EXPAND
```

---

## 8. Transaction Validation Detail

```mermaid
graph LR
    subgraph Input
        GRN[GRN Documents]
        ADJ[ADJ Documents]
        TRF[TRF Documents]
        SR[SR Documents]
        WR[WR Documents]
    end

    subgraph Check Status
        GRN --> GC{Posted/Approved?}
        ADJ --> AC{Posted?}
        TRF --> TC{Posted/Completed?}
        SR --> SC{Fulfilled/Completed?}
        WR --> WC{Posted/Approved?}
    end

    subgraph Output
        GC --> GO[GRN: X total, Y pending]
        AC --> AO[ADJ: X total, Y pending]
        TC --> TO[TRF: X total, Y pending]
        SC --> SO[SR: X total, Y pending]
        WC --> WO[WR: X total, Y pending]
    end
```

---

## 9. Period List Page Flow

```mermaid
graph TB
    START([Navigate to /period-end]) --> LOAD[Load Periods]

    LOAD --> CURRENT{Current Period Exists?}

    CURRENT -->|Yes| SHOW_CURRENT[Display PeriodSummaryCard<br>isCurrentPeriod=true]
    CURRENT -->|No| EMPTY[Display Empty State]

    SHOW_CURRENT --> ACTIONS[Show Action Buttons]
    ACTIONS --> VIEW[View Details Button]
    ACTIONS --> CLOSE_BTN[Start Period Close Button]

    LOAD --> HISTORY[Load Period History]
    HISTORY --> TABLE[Display History Table]

    VIEW -->|Click| DETAIL[Navigate to Detail Page]
    CLOSE_BTN -->|Click| CLOSE_PAGE[Navigate to Close Page]
    TABLE -->|Click Row| DETAIL
```

---

## 10. Period Detail Page Flow

```mermaid
graph TB
    START([Navigate to /period-end/id]) --> LOAD[Load Period by ID]

    LOAD --> FOUND{Period Found?}
    FOUND -->|No| ERROR[Show Error Card]
    FOUND -->|Yes| DISPLAY[Display Period Detail]

    DISPLAY --> INFO[Period Information Card]
    DISPLAY --> VALID[Validation Status Overview]
    DISPLAY --> ADJ[Adjustments Tab]

    INFO --> STATUS{Period Status?}
    STATUS -->|Open| OPEN_ACTIONS[Show Start Close Button]
    STATUS -->|Closed| CLOSED_INFO[Show Audit Trail]

    VALID --> STAGES[3 Validation Stages]
    STAGES --> STAGE1[Transactions: Pass/Fail]
    STAGES --> STAGE2[Spot Checks: Pass/Fail]
    STAGES --> STAGE3[Physical Counts: Pass/Fail]

    OPEN_ACTIONS -->|Click| CLOSE_PAGE[Navigate to Close Page]
```

---

## 11. Data Flow Summary

```mermaid
graph LR
    subgraph Input Data
        PERIOD[Period Record]
        TXN[Transactions]
        SC[Spot Checks]
        PC[Physical Counts]
    end

    subgraph Processing
        LOAD[Load Period]
        VAL[Run Validations]
        CALC[Calculate Results]
    end

    subgraph Output
        CHECKLIST[PeriodCloseChecklist]
        UI[UI Components]
        ACTION[Close Action]
    end

    PERIOD --> LOAD
    LOAD --> VAL

    TXN --> VAL
    SC --> VAL
    PC --> VAL

    VAL --> CALC
    CALC --> CHECKLIST
    CHECKLIST --> UI
    UI --> ACTION
```

---

*Document Version: 2.0.0 | Carmen ERP Period End Module*
