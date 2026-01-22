# Flow Diagrams: Physical Count

> Version: 1.0.0 | Status: Active | Last Updated: 2025-01-16

## 1. Document Control

| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Feature | Physical Count |
| Document Type | Flow Diagrams |

## 2. Count Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> draft: Create Count
    draft --> planning: Begin Setup
    planning --> pending: Complete Setup
    pending --> inprogress: Start Count
    inprogress --> onhold: Pause Count
    onhold --> inprogress: Resume Count
    inprogress --> completed: Complete Count
    completed --> finalized: Approve and Close
    draft --> cancelled: Cancel
    planning --> cancelled: Cancel
    pending --> cancelled: Cancel
    inprogress --> cancelled: Cancel
    onhold --> cancelled: Cancel
    finalized --> [*]
    cancelled --> [*]
```

## 3. Creation Wizard Flow

```mermaid
graph TB
    START([Start]) --> STEP1[Step 1: Setup]

    subgraph Setup
        STEP1 --> AUTO[Auto-fill Counter Name]
        AUTO --> DEPT[Select Department]
        DEPT --> DATE[Select Date/Time]
        DATE --> NOTES[Enter Notes - Optional]
        NOTES --> VAL1{Valid?}
        VAL1 -->|No| DEPT
        VAL1 -->|Yes| NEXT1[Next]
    end

    NEXT1 --> STEP2[Step 2: Location Selection]

    subgraph Locations
        STEP2 --> FILTER[Filter by Type]
        FILTER --> SEARCH[Search Locations]
        SEARCH --> SELECT[Select Locations]
        SELECT --> VAL2{At Least One?}
        VAL2 -->|No| SELECT
        VAL2 -->|Yes| NEXT2[Next]
    end

    NEXT2 --> STEP3[Step 3: Item Review]

    subgraph Items
        STEP3 --> LOAD[Load Items from Locations]
        LOAD --> ISEARCH[Search Items]
        ISEARCH --> IFILTER[Filter by Category]
        IFILTER --> SORT[Sort Items]
        SORT --> REVIEW[Review List]
        REVIEW --> NEXT3[Next]
    end

    NEXT3 --> STEP4[Step 4: Final Review]

    subgraph FinalReview
        STEP4 --> SUMMARY[Display Summary]
        SUMMARY --> DURATION[Show Estimated Duration]
        DURATION --> CONFIRM{Confirm?}
        CONFIRM -->|Back| STEP3
        CONFIRM -->|Start| CREATE[Create Count Record]
    end

    CREATE --> ACTIVE[Navigate to Active Count]
    ACTIVE --> END([End])
```

## 4. Active Counting Flow

```mermaid
graph TB
    START([Start Active Count]) --> INIT[Initialize Count Interface]
    INIT --> HEADER[Display Count Header]
    HEADER --> PROGRESS[Show Progress]
    PROGRESS --> ITEMS[Display Item List]

    ITEMS --> LOOP{More Items?}
    LOOP -->|Yes| FIND[Find/Search Item]
    FIND --> ENTER[Enter Physical Count]
    ENTER --> STATUS[Select Item Status]
    STATUS --> SAVE[Save Count]
    SAVE --> CALC[Calculate Variance]
    CALC --> UPDATE[Update Progress]
    UPDATE --> LOOP

    LOOP -->|No| COMPLETE[All Items Counted]

    ITEMS --> PAUSE{Pause?}
    PAUSE -->|Yes| HOLD[Set Status On-Hold]
    HOLD --> DASHBOARD[Go to Dashboard]

    COMPLETE --> FINISH[Click Complete Count]
    FINISH --> SUMMARY[Show Completion Summary]
    SUMMARY --> CONFIRM{Confirm?}
    CONFIRM -->|Yes| DONE[Set Status Completed]
    CONFIRM -->|No| ITEMS

    DONE --> VARIANCE[Generate Variance Report]
    VARIANCE --> END([End])
```

## 5. Item Counting Detail Flow

```mermaid
graph LR
    A[Select Item] --> B[View Expected Qty]
    B --> C[Enter Physical Qty]
    C --> D{Condition?}
    D -->|Good| E[Status: Good]
    D -->|Damaged| F[Status: Damaged]
    D -->|Missing| G[Status: Missing]
    D -->|Expired| H[Status: Expired]
    E --> I[Save Count]
    F --> I
    G --> I
    H --> I
    I --> J[Calculate Variance]
    J --> K{Variance?}
    K -->|Yes| L[Flag for Review]
    K -->|No| M[Mark Counted]
    L --> N[Update Progress]
    M --> N
```

## 6. Dashboard View Flow

```mermaid
graph TB
    START([Open Dashboard]) --> LOAD[Load Dashboard Data]

    LOAD --> KPI[Display KPIs]
    KPI --> K1[Total Counts]
    KPI --> K2[In Progress]
    KPI --> K3[Active Counters]
    KPI --> K4[Pending Review]

    LOAD --> CHART[Display Activity Chart]
    CHART --> BAR[Bar Chart by Period]

    LOAD --> RECENT[Display Recent Counts]
    RECENT --> BADGES[Show Status Badges]

    LOAD --> TABLE[Display Counts Table]
    TABLE --> SEARCH[Search Filter]
    TABLE --> SORT[Column Sorting]
    TABLE --> PAGE[Pagination]

    TABLE --> CLICK{Click Row?}
    CLICK -->|Yes| DETAIL[View Count Detail]
    CLICK -->|No| END([End])
```

## 7. Variance Analysis Flow

```mermaid
graph TB
    START([Count Completed]) --> COLLECT[Collect All Variances]
    COLLECT --> CALC[Calculate Totals]

    CALC --> CHECK{Any Variances?}
    CHECK -->|No| APPROVE[Auto-Approve Count]
    CHECK -->|Yes| ANALYZE[Analyze Variances]

    ANALYZE --> CAT[Categorize by Reason]
    CAT --> D[Damage]
    CAT --> T[Theft]
    CAT --> S[Spoilage]
    CAT --> M[Measurement Error]
    CAT --> O[Other]

    D --> REVIEW[Review Required]
    T --> REVIEW
    S --> REVIEW
    M --> MINOR{Minor?}
    O --> REVIEW

    MINOR -->|Yes| ACCEPT[Accept Variance]
    MINOR -->|No| REVIEW

    REVIEW --> ACTION{Action?}
    ACTION -->|Approve| ACCEPT
    ACTION -->|Recount| RECOUNT[Schedule Recount]
    ACTION -->|Adjust| ADJUST[Create Adjustment]

    ACCEPT --> FINALIZE[Finalize Count]
    APPROVE --> FINALIZE
    ADJUST --> FINALIZE
    RECOUNT --> END([End - Pending Recount])
    FINALIZE --> DONE([Count Finalized])
```

## 8. Location Selection Detail

```mermaid
graph TB
    START([Location Step]) --> LOAD[Load All Locations]
    LOAD --> DISPLAY[Display Location Cards]

    DISPLAY --> FILTER{Filter?}
    FILTER -->|Type| TYPE[Filter by Type]
    TYPE --> STORAGE[Storage]
    TYPE --> KITCHEN[Kitchen]
    TYPE --> RESTAURANT[Restaurant]
    TYPE --> BAR[Bar]
    TYPE --> MAINTENANCE[Maintenance]

    FILTER -->|Search| SEARCH[Search by Name]

    STORAGE --> UPDATE[Update Display]
    KITCHEN --> UPDATE
    RESTAURANT --> UPDATE
    BAR --> UPDATE
    MAINTENANCE --> UPDATE
    SEARCH --> UPDATE

    UPDATE --> SELECT{Select Location?}
    SELECT -->|Click| TOGGLE[Toggle Selection]
    TOGGLE --> COUNT[Update Counts]
    COUNT --> ITEMS[Update Item Count]
    ITEMS --> SELECT

    SELECT -->|Next| VALIDATE{At Least One?}
    VALIDATE -->|Yes| NEXT([Proceed to Items])
    VALIDATE -->|No| ERROR[Show Error]
    ERROR --> SELECT
```

## 9. Resume Paused Count Flow

```mermaid
graph TB
    START([Dashboard]) --> LIST[View Paused Counts]
    LIST --> SELECT[Select On-Hold Count]
    SELECT --> LOAD[Load Count Data]
    LOAD --> RESTORE[Restore Progress]
    RESTORE --> STATUS[Set Status In-Progress]
    STATUS --> ACTIVE[Open Active Count]
    ACTIVE --> CONTINUE[Continue Counting]
    CONTINUE --> END([Resume Normal Flow])
```

## 10. Data Flow Summary

```mermaid
graph LR
    subgraph Input
        USER[User Context]
        LOCS[Locations]
        PRODS[Products]
        INV[Inventory Balance]
    end

    subgraph Process
        WIZARD[Creation Wizard]
        COUNT[Active Counting]
        CALC[Variance Calculation]
    end

    subgraph Output
        RECORD[Count Record]
        VARIANCE[Variance Report]
        ADJUST[Adjustments]
    end

    USER --> WIZARD
    LOCS --> WIZARD
    PRODS --> COUNT
    INV --> COUNT

    WIZARD --> RECORD
    COUNT --> CALC
    CALC --> VARIANCE
    VARIANCE --> ADJUST
```

---
*Document Version: 1.0.0 | Carmen ERP Physical Count Module*
