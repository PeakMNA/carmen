# Flow Diagrams: Spot Check

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Spot Check
- **Route**: `/app/(main)/inventory-management/spot-check`
- **Version**: 2.1.0
- **Last Updated**: 2025-12-09
- **Owner**: Inventory Management Team
- **Status**: Implemented

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version |
| 2.0.0 | 2025-12-06 | System | Updated to reflect actual implementation |
| 2.1.0 | 2025-12-09 | System | Updated to 2-step wizard, added active/completed page flows |

---

## Overview

This document provides visual representations of workflows, data flows, and system interactions for the Spot Check sub-module using Mermaid diagrams.

**Related Documents**:
- [Business Requirements](./BR-spot-check.md)
- [Use Cases](./UC-spot-check.md)
- [Technical Specification](./TS-spot-check.md)
- [Data Definition](./DD-spot-check.md)
- [Validations](./VAL-spot-check.md)

---

## High-Level Process Flow

### Complete Spot Check Lifecycle

```mermaid
flowchart TD
    Start([User Initiates<br/>Spot Check]) --> Dashboard{Start From<br/>Dashboard?}

    Dashboard -->|Yes| QuickAction[Click Quick Action<br/>New Spot Check]
    Dashboard -->|No| ListPage[Navigate to<br/>List Page]
    ListPage --> CreateBtn[Click New<br/>Spot Check Button]
    QuickAction --> Wizard
    CreateBtn --> Wizard

    subgraph Wizard [2-Step Creation Wizard]
        Step1[Step 1: Location<br/>Selection] --> Step2[Step 2: Method<br/>& Items]
    end

    Wizard --> Created[Spot Check Created<br/>Status: pending]
    Created --> StartCheck{User Starts<br/>Check?}

    StartCheck -->|Yes| InProgress[Status: in-progress<br/>Record Start Time]
    StartCheck -->|No| Pending[Remains Pending]

    InProgress --> CountItems[Navigate to<br/>Counting Interface]

    subgraph Counting [Item Counting]
        SingleMode[Single Item Mode] --> EnterQty[Enter Counted<br/>Quantity]
        ListMode[List Mode] --> EnterQty
        EnterQty --> SetCondition[Select Condition<br/>Good/Damaged/Expired/Missing]
        SetCondition --> AddNotes[Add Notes<br/>Optional]
        AddNotes --> NextItem{More Items?}
        NextItem -->|Yes| EnterQty
        NextItem -->|No| AllCounted[All Items<br/>Counted]
    end

    CountItems --> Counting
    Counting --> CompleteCheck{Complete<br/>Check?}

    CompleteCheck -->|Pause| OnHold[Status: on-hold<br/>Progress Saved]
    OnHold --> Resume[Resume Later]
    Resume --> InProgress

    CompleteCheck -->|Complete| Completed[Status: completed<br/>Record End Time]

    Created -.->|Cancel| Cancelled[Status: cancelled<br/>Data Preserved]
    InProgress -.->|Cancel| Cancelled

    Completed --> End([Spot Check<br/>Complete])
    Cancelled --> CancelEnd([Cancelled])

    style Start fill:#e1f5e1
    style End fill:#e1f5e1
    style CancelEnd fill:#ffe1e1
    style Counting fill:#f5f5dc
    style Wizard fill:#e6f3ff
```

---

## Creation Wizard Flow

### 2-Step Wizard Process

```mermaid
flowchart TD
    subgraph Step1 [Step 1: Location Selection]
        S1A[Select Location] --> S1B[Select Department<br/>Optional]
        S1B --> S1C[Assign Staff]
        S1C --> S1D[Set Schedule Date]
    end

    subgraph Step2 [Step 2: Method & Items]
        S2A{Selection Method}
        S2A --> S2B[Random:<br/>System selects random items]
        S2A --> S2C[High-Value:<br/>Highest value items]
        S2A --> S2D[Manual:<br/>User selects items]
        S2B --> S2E[Select Item Count<br/>10 / 20 / 50]
        S2C --> S2E
        S2D --> S2F[Search & Select Items]
        S2E --> S2G[Preview Items]
        S2F --> S2G
        S2G --> S2H[Create Spot Check]
    end

    Step1 --> Step2
```

### Wizard Navigation

```mermaid
flowchart LR
    Start([Start]) --> Step1[Step 1:<br/>Location]
    Step1 -->|Next| Validate1{Location<br/>Selected?}
    Validate1 -->|No| Error1[Show Error]
    Error1 --> Step1
    Validate1 -->|Yes| Step2[Step 2:<br/>Method & Items]
    Step2 -->|Back| Step1
    Step2 -->|Submit| Validate2{Valid<br/>Selection?}
    Validate2 -->|No| Error2[Show Error]
    Error2 --> Step2
    Validate2 -->|Yes| Create([Create Check])
```

---

## Status State Diagram

### Spot Check Status Transitions

```mermaid
stateDiagram-v2
    [*] --> draft: Create Draft
    draft --> pending: Submit

    pending --> in_progress: Start Check
    pending --> cancelled: Cancel

    in_progress --> on_hold: Pause
    in_progress --> completed: Complete
    in_progress --> cancelled: Cancel

    on_hold --> in_progress: Resume
    on_hold --> cancelled: Cancel

    completed --> [*]
    cancelled --> [*]

    note right of draft
        Initial creation state
        Not yet submitted
    end note

    note right of pending
        Awaiting start
        Items selected
    end note

    note right of in_progress
        Active counting
        Can pause or complete
    end note

    note right of on_hold
        Temporarily paused
        Progress preserved
    end note

    note right of completed
        Final state
        No modifications
    end note

    note right of cancelled
        Terminated state
        Data preserved
    end note
```

---

## Item Status Flow

### Item Check Status Transitions

```mermaid
stateDiagram-v2
    [*] --> pending: Item Added

    pending --> counted: Quantity Entered
    pending --> skipped: Skip with Reason

    counted --> variance: Variance Detected

    variance --> [*]: Spot Check Complete
    counted --> [*]: Spot Check Complete
    skipped --> [*]: Spot Check Complete

    note right of pending
        Awaiting count
        System qty known
    end note

    note right of counted
        Count entered
        Variance = 0
    end note

    note right of variance
        Count entered
        Variance ≠ 0
    end note

    note right of skipped
        Cannot count
        Reason required
    end note
```

---

## Counting Interface Flow

### Single Item Mode

```mermaid
flowchart TD
    Start([Start Counting]) --> LoadItem[Load Current Item]
    LoadItem --> Display[Display Item Details<br/>Code, Name, Location, System Qty]

    Display --> EnterQty{Enter<br/>Quantity}
    EnterQty --> UseButtons[Use +/- Buttons]
    EnterQty --> TypeValue[Type Value Directly]

    UseButtons --> CalcVariance
    TypeValue --> CalcVariance

    CalcVariance[Calculate Variance<br/>Preview] --> ShowVariance{Variance?}

    ShowVariance -->|0%| GreenIndicator[Show Green<br/>Match]
    ShowVariance -->|Small| YellowIndicator[Show Yellow<br/>Minor Variance]
    ShowVariance -->|Large| RedIndicator[Show Red<br/>Significant Variance]

    GreenIndicator --> SetCondition
    YellowIndicator --> SetCondition
    RedIndicator --> SetCondition

    SetCondition[Select Condition] --> ConditionOptions
    ConditionOptions --> Good[Good]
    ConditionOptions --> Damaged[Damaged]
    ConditionOptions --> Expired[Expired]
    ConditionOptions --> Missing[Missing]

    Good --> Notes
    Damaged --> Notes
    Expired --> Notes
    Missing --> Notes

    Notes[Add Notes<br/>Optional] --> Navigate{Action?}

    Navigate -->|Previous| PrevItem[Go to Previous Item]
    Navigate -->|Next| NextItem[Go to Next Item]
    Navigate -->|Skip| SkipDialog[Open Skip Dialog]

    PrevItem --> LoadItem
    NextItem --> CheckMore{More Items?}

    SkipDialog --> EnterReason[Enter Skip Reason]
    EnterReason --> MarkSkipped[Mark as Skipped]
    MarkSkipped --> CheckMore

    CheckMore -->|Yes| LoadItem
    CheckMore -->|No| AllDone[All Items Counted]

    AllDone --> CompleteBtn[Show Complete Button]
    CompleteBtn --> CompleteDialog[Open Completion Dialog]
    CompleteDialog --> Confirm{Confirm?}

    Confirm -->|Yes| Complete([Complete Spot Check])
    Confirm -->|No| LoadItem
```

---

## Page Navigation Flow

### Application Navigation

```mermaid
flowchart TD
    subgraph Main [Main Pages]
        Dashboard["/spot-check/dashboard"]
        List["/spot-check"]
        New["/spot-check/new"]
        Active["/spot-check/active"]
        Completed["/spot-check/completed"]
        Detail["/spot-check/[id]"]
        Count["/spot-check/[id]/count"]
    end

    Dashboard -->|View All| List
    Dashboard -->|New Check| New
    Dashboard -->|Active Checks| Active
    Dashboard -->|Completed Checks| Completed

    List -->|New Check| New
    List -->|Click Row| Detail
    List -->|Active Tab| Active
    List -->|Completed Tab| Completed

    New -->|Complete 2-Step Wizard| Detail
    New -->|Cancel| List

    Active -->|Start/Continue Count| Count
    Active -->|View Details| Detail
    Active -->|Back| List

    Completed -->|View Details| Detail
    Completed -->|Back| List

    Detail -->|Count Items| Count
    Detail -->|Back| List

    Count -->|Save & Exit| Detail
    Count -->|Complete| Detail

    subgraph DetailTabs [Detail Page Tabs]
        Overview[Overview Tab]
        Items[Items Tab]
        Variances[Variances Tab]
        History[History Tab]
    end

    Detail --> DetailTabs
```

---

## Data Flow Diagram

### Spot Check Data Flow

```mermaid
flowchart TD
    subgraph User [User Interface]
        UI1[Dashboard]
        UI2[List Page]
        UI3[Creation Wizard<br/>2-Step]
        UI4[Detail Page]
        UI5[Counting Interface]
        UI6[Active Page]
        UI7[Completed Page]
    end

    subgraph State [State Management]
        LocalState[Component State<br/>useState/useMemo]
        FormState[Form State<br/>React Hook Form]
        ZustandStore[Zustand Store<br/>useCountStore]
    end

    subgraph MockData [Mock Data Layer]
        MockChecks[mockSpotChecks]
        Helpers[Helper Functions<br/>getById, getByStatus, etc.]
    end

    subgraph Types [Type System]
        SpotCheck[SpotCheck Interface]
        SpotCheckItem[SpotCheckItem Interface]
        SpotCheckFormData[SpotCheckFormData Interface]
        CountStore[CountStore Interface]
    end

    UI1 -->|Read| MockData
    UI2 -->|Read| MockData
    UI3 -->|Uses| FormState
    UI4 -->|Read| MockData
    UI5 -->|Read/Write| LocalState
    UI6 -->|Read/Write| ZustandStore
    UI7 -->|Read| MockData

    FormState -->|Validate| Types
    MockData -->|Typed as| Types
    LocalState -->|Update| UI5
    ZustandStore -->|Typed as| CountStore
```

---

## Active Page Flow

### Active Spot Checks Management

```mermaid
flowchart TD
    Start([Open Active Page]) --> LoadState[Load from Zustand Store<br/>useCountStore]
    LoadState --> GetActive[Get activeCounts]

    GetActive --> FilterTabs{Filter Tab}
    FilterTabs --> All[All Active]
    FilterTabs --> Pending[Pending Only]
    FilterTabs --> InProgress[In Progress Only]
    FilterTabs --> Paused[Paused/On-Hold]

    All --> Display[Display Filtered List]
    Pending --> Display
    InProgress --> Display
    Paused --> Display

    Display --> CheckOverdue{Check<br/>Overdue?}
    CheckOverdue -->|Yes| ShowOverdue[Show Overdue<br/>Indicator]
    CheckOverdue -->|No| ShowNormal[Normal Display]

    ShowOverdue --> UserAction
    ShowNormal --> UserAction

    UserAction{User Action}
    UserAction -->|Start| StartCount[Start Count<br/>Navigate to /count]
    UserAction -->|Continue| ContinueCount[Continue Count<br/>Navigate to /count]
    UserAction -->|View| ViewDetail[View Details<br/>Navigate to /[id]]

    StartCount --> UpdateStore[Update Zustand Store<br/>status: in-progress]
    ContinueCount --> Navigate[Navigate to<br/>Counting Interface]
    ViewDetail --> Navigate
    UpdateStore --> Navigate
```

---

## Completed Page Flow

### Completed Spot Checks Management

```mermaid
flowchart TD
    Start([Open Completed Page]) --> LoadData[Load Completed Checks]

    LoadData --> FilterTime{Time Filter}
    FilterTime --> AllTime[All Time]
    FilterTime --> Today[Today]
    FilterTime --> Week[This Week]
    FilterTime --> Month[This Month]

    AllTime --> Calculate[Calculate Summary Stats]
    Today --> Calculate
    Week --> Calculate
    Month --> Calculate

    Calculate --> ShowStats[Display Statistics]

    subgraph Stats [Summary Statistics]
        TotalCount[Total Completed]
        AvgAccuracy[Average Accuracy]
        ItemsCounted[Items Counted]
        TotalVariance[Total Variance]
    end

    ShowStats --> Stats
    Stats --> DisplayList[Display Filtered List]

    DisplayList --> ColorCode{Accuracy<br/>Color Code}
    ColorCode -->|>95%| Green[Green Badge]
    ColorCode -->|90-95%| Yellow[Yellow Badge]
    ColorCode -->|<90%| Red[Red Badge]

    Green --> UserClick
    Yellow --> UserClick
    Red --> UserClick

    UserClick{User Clicks Row}
    UserClick --> ViewDetail[Navigate to<br/>Detail Page]
```

---

## Variance Calculation Flow

### Real-Time Variance Calculation

```mermaid
flowchart LR
    Input[User Enters<br/>Counted Quantity] --> Calc[Calculate]

    subgraph Calc [Calculation]
        SystemQty[System Quantity] --> Subtract
        CountedQty[Counted Quantity] --> Subtract
        Subtract[Variance = Counted - System] --> Percent
        Percent[Variance % = <br/>Variance / System × 100]
    end

    Calc --> Evaluate{Evaluate<br/>Threshold}

    Evaluate -->|0%| Match[Match<br/>Green]
    Evaluate -->|< 5%| Minor[Minor<br/>Yellow]
    Evaluate -->|≥ 5%| Significant[Significant<br/>Red]

    Match --> Display[Update UI<br/>Display Variance]
    Minor --> Display
    Significant --> Display
```

---

## Cancel Flow

### Cancellation Process

```mermaid
sequenceDiagram
    participant U as User
    participant D as Detail Page
    participant Dlg as Cancel Dialog
    participant S as System

    U->>D: Click Cancel Button
    D->>Dlg: Open Dialog
    Dlg->>U: Show Reason Dropdown
    U->>Dlg: Select Reason
    U->>Dlg: Enter Notes (Optional)
    U->>Dlg: Click Confirm
    Dlg->>S: Update Status to Cancelled
    S->>S: Preserve All Data
    S->>D: Show Success Toast
    D->>U: Display Cancelled Badge
```

---

## Dashboard KPI Flow

### Dashboard Data Aggregation

```mermaid
flowchart TD
    subgraph Data [Data Sources]
        AllChecks[All Spot Checks]
    end

    subgraph Aggregate [Aggregation Functions]
        TotalCount[Count Total Checks]
        AvgAccuracy[Calculate Avg Accuracy]
        TotalItems[Sum Items Counted]
        TotalVariance[Sum Variance Values]
        FindOverdue[Filter Overdue]
        FindActive[Filter Active]
    end

    subgraph Display [Dashboard Display]
        KPI1[Total Checks Card]
        KPI2[Accuracy Card]
        KPI3[Items Card]
        KPI4[Variance Card]
        Alert[Overdue Alert]
        ActiveList[Active Checks List]
    end

    AllChecks --> TotalCount --> KPI1
    AllChecks --> AvgAccuracy --> KPI2
    AllChecks --> TotalItems --> KPI3
    AllChecks --> TotalVariance --> KPI4
    AllChecks --> FindOverdue --> Alert
    AllChecks --> FindActive --> ActiveList
```

---

## Summary

### Key Flows
1. **Creation Flow**: 2-step wizard (Location Selection → Method & Items)
2. **Status Flow**: draft → pending → in-progress → completed/cancelled/on-hold
3. **Counting Flow**: Single item or list mode with variance preview
4. **Item Flow**: pending → counted/skipped → variance (if applicable)
5. **Active Page Flow**: Zustand-based state with filter tabs (All, Pending, In Progress, Paused)
6. **Completed Page Flow**: Time-based filtering with summary statistics

### Key Actions
- Start: pending → in-progress
- Pause: in-progress → on-hold
- Resume: on-hold → in-progress
- Complete: in-progress → completed
- Cancel: any (except completed) → cancelled

### Key Pages
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | /spot-check/dashboard | KPIs and quick actions |
| List | /spot-check | All spot checks with filtering |
| New | /spot-check/new | 2-step creation wizard |
| Active | /spot-check/active | Active checks (Zustand state) |
| Completed | /spot-check/completed | Completed checks with stats |
| Detail | /spot-check/[id] | Spot check details with tabs |
| Count | /spot-check/[id]/count | Counting interface |

---

**Document End**
