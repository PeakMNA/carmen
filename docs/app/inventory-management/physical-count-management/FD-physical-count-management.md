# Flow Diagrams: Physical Count Management

**Module**: Inventory Management
**Sub-Module**: Physical Count Management
**Version**: 1.0.0
**Status**: IMPLEMENTED (Prototype with Mock Data)
**Last Updated**: 2025-12-09

---

## 1. Overview

This document provides Mermaid flow diagrams for the Physical Count Management module workflows.

---

## 2. Physical Count Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft : Create Count
    
    Draft --> Planning : Activate
    Draft --> Cancelled : Cancel
    
    Planning --> Pending : Approve Plan
    Planning --> Cancelled : Cancel
    
    Pending --> InProgress : Start Count
    Pending --> Cancelled : Cancel
    
    InProgress --> Completed : Complete (all items counted)
    InProgress --> OnHold : Put On Hold
    InProgress --> Cancelled : Cancel
    
    OnHold --> InProgress : Resume
    OnHold --> Cancelled : Cancel
    
    Completed --> Finalized : Finalize & Post
    Completed --> Cancelled : Cancel (rare)
    
    Finalized --> [*] : End
    Cancelled --> [*] : End
    
    note right of Draft : Initial configuration
    note right of Planning : Team and scope assignment
    note right of Pending : Ready to start
    note right of InProgress : Active counting
    note right of OnHold : Temporarily paused
    note right of Completed : Pending finalization
    note right of Finalized : Adjustments posted, locked
    note right of Cancelled : Terminated with reason
```

---

## 3. Create Physical Count Wizard Flow

```mermaid
flowchart TD
    A[Start: Create Count] --> B[Step 1: Select Count Type]
    
    B --> B1{Select Type}
    B1 --> B2[Full Physical Count]
    B1 --> B3[Cycle Count]
    B1 --> B4[Annual Count]
    B1 --> B5[Perpetual Inventory]
    B1 --> B6[Partial Count]
    
    B2 --> C[Set Priority Level]
    B3 --> C
    B4 --> C
    B5 --> C
    B6 --> C
    
    C --> D[Set Approval Threshold]
    D --> E[Step 2: Assignment]
    
    E --> F[Select Location]
    F --> G{Department?}
    G -->|Yes| H[Select Department]
    G -->|No| I[Select Supervisor]
    H --> I
    
    I --> J[Add Team Members]
    J --> K[Set Scheduled Date]
    K --> L[Set Due Date]
    
    L --> M[Step 3: Scope Selection]
    
    M --> N{Count Type?}
    N -->|Full/Annual| O[All Items Included]
    N -->|Cycle/Partial| P[Select Categories]
    N -->|Perpetual| Q[Select Items Manually]
    
    O --> R[Step 4: Review]
    P --> R
    Q --> R
    
    R --> S[Add Description]
    S --> T[Add Instructions]
    T --> U[Add Notes]
    U --> V{Confirm?}
    
    V -->|Yes| W[Generate Count Number]
    W --> X[Create Count in Draft]
    X --> Y[End: Navigate to Detail]
    
    V -->|No| Z{Go Back?}
    Z -->|Yes| B
    Z -->|Cancel| AA[Discard and Exit]
```

---

## 4. Physical Count Counting Process (Mobile-First Interface)

```mermaid
flowchart TD
    A[Start: Open Counting Interface] --> B[Load Item Cards]

    B --> C{Blind Count Mode?}
    C -->|Yes| D[Hide System Quantities]
    C -->|No| E[Show System Quantities]

    D --> F[Display Filter Tabs: All / Pending / Counted]
    E --> F

    F --> G[Display Item Count Cards]
    G --> H{User Action?}

    %% Search and Filter
    H -->|Search| I[Filter Items by Search Term]
    I --> G

    H -->|Change Filter| J[Apply Status Filter]
    J --> G

    %% Count Item
    H -->|Enter Quantity| K[Update Counted Quantity]
    K --> L[Calculate Variance Real-time]
    L --> M{Need Calculator?}

    M -->|Yes| N[Open Calculator Dialog]
    N --> N1{Select Unit Type}
    N1 -->|Weight| N2[Enter kg/g/lb Values]
    N1 -->|Volume| N3[Enter L/ml Values]
    N1 -->|Count| N4[Enter pcs/dozen/case Values]
    N2 --> N5[Calculate Total]
    N3 --> N5
    N4 --> N5
    N5 --> N6[Use Total Value]
    N6 --> K

    M -->|No| O{Need Notes/Evidence?}

    %% Notes & Evidence
    O -->|Yes| P[Open Notes Sheet]
    P --> P1[Select Variance Reason]
    P1 --> P2[Add Notes Optional]
    P2 --> P3{Attach Evidence?}
    P3 -->|Photo| P4[Take/Select Photo]
    P3 -->|File| P5[Select File]
    P3 -->|Skip| P6[Save Notes]
    P4 --> P6
    P5 --> P6
    P6 --> G

    O -->|No| G

    %% Bulk Actions
    H -->|Reset All| Q[Show Reset Confirmation]
    Q -->|Confirm| R[Clear All Counts]
    R --> G
    Q -->|Cancel| G

    H -->|Save for Resume| S[Save Progress]
    S --> T[Navigate to Detail Page]

    %% Complete
    H -->|Complete Count| U{All Items Processed?}
    U -->|No| V[Show Pending Items Warning]
    V --> G
    U -->|Yes| W[Mark Count Completed]
    W --> X[Navigate to Detail]
```

---

## 5. Item Status Flow

```mermaid
stateDiagram-v2
    [*] --> Pending : Item Added to Count
    
    Pending --> Counted : Count Matches System
    Pending --> Variance : Count Differs from System
    Pending --> Skipped : Skip with Reason
    
    Variance --> Approved : Supervisor Approves
    Variance --> Recount : Supervisor Requests Recount
    
    Recount --> Counted : Recount Matches
    Recount --> Variance : Recount Still Differs
    
    Skipped --> Pending : Undo Skip (if allowed)
    
    Counted --> [*] : Count Finalized
    Approved --> [*] : Count Finalized
    Skipped --> [*] : Count Finalized
```

---

## 6. Variance Review and Approval Flow

```mermaid
flowchart TD
    A[Start: View Variance Tab] --> B[Display Items with Variances]
    
    B --> C[For Each Variance Item]
    C --> D[Review System vs Counted]
    D --> E[Review Variance Reason]
    E --> F[Review Value Impact]
    
    F --> G{Supervisor Decision}
    G -->|Approve| H[Mark as Approved]
    G -->|Request Recount| I[Mark for Recount]
    G -->|Investigate| J[Add Investigation Notes]
    
    H --> K{More Items?}
    I --> K
    J --> K
    
    K -->|Yes| C
    K -->|No| L[Update Count Accuracy]
    
    L --> M{All Approved?}
    M -->|Yes| N[Enable Finalization]
    M -->|No| O[Awaiting Recounts]
    
    O --> P[Counter Performs Recounts]
    P --> C
    
    N --> Q[End: Ready to Finalize]
```

---

## 7. Finalization and Posting Flow

```mermaid
flowchart TD
    A[Start: Count Completed] --> B{All Items Processed?}
    
    B -->|No| C[Return to Counting]
    B -->|Yes| D[Click Finalize & Post]
    
    D --> E[Display Confirmation Dialog]
    E --> F[Show Total Variance Value]
    F --> G[Show Items to Adjust]
    G --> H[Show Adjustment Summary]
    
    H --> I{High Variance Alert?}
    I -->|Yes| J[Additional Warning]
    J --> K{Confirm?}
    I -->|No| K
    
    K -->|Cancel| L[Return to Detail]
    K -->|Confirm| M[Post Inventory Adjustments]
    
    M --> N[Update Item Quantities]
    N --> O[Update Count Status to Finalized]
    O --> P[Lock Count from Modifications]
    P --> Q[Record in History]
    Q --> R[End: Count Finalized]
```

---

## 8. Count Cancellation Flow

```mermaid
flowchart TD
    A[Start: Request Cancellation] --> B[Open Cancel Dialog]
    B --> C[Display Warning Message]
    C --> D[Enter Cancellation Reason]
    D --> E{Reason Valid?}
    
    E -->|No| F[Show Validation Error]
    F --> D
    
    E -->|Yes| G{Confirm Cancellation?}
    G -->|No| H[Close Dialog]
    G -->|Yes| I[Update Status to Cancelled]
    
    I --> J[Preserve All Count Data]
    J --> K[Record Cancellation Reason]
    K --> L[Log in History]
    L --> M[End: Count Cancelled]
```

---

## 9. Dashboard Data Flow

```mermaid
flowchart TD
    A[Load Dashboard] --> B[Select Date Range]
    B --> C[Query Physical Counts]
    
    C --> D[Calculate KPIs]
    D --> D1[Total Counts]
    D --> D2[Average Accuracy]
    D --> D3[Items Counted]
    D --> D4[Pending Approval]
    D --> D5[Total Variance]
    
    C --> E[Filter Overdue Counts]
    C --> F[Filter Pending Approval]
    C --> G[Filter Active Counts]
    C --> H[Filter Recent Finalized]
    C --> I[Filter Upcoming Scheduled]
    
    C --> J[Aggregate by Type]
    C --> K[Aggregate by Location]
    
    D1 --> L[Render Dashboard]
    D2 --> L
    D3 --> L
    D4 --> L
    D5 --> L
    E --> L
    F --> L
    G --> L
    H --> L
    I --> L
    J --> L
    K --> L
    
    L --> M[User Interaction]
    M --> N{Action?}
    N -->|Start Overdue| O[Navigate to Count]
    N -->|View Details| P[Navigate to Detail]
    N -->|Create New| Q[Navigate to Wizard]
    N -->|Change Range| B
```

---

## 10. Recount Process Flow

```mermaid
flowchart TD
    A[Start: Item Marked for Recount] --> B[Counter Opens Counting Interface]
    B --> C[Navigate to Recount Item]
    C --> D[Display Recount Mode]
    
    D --> E[Show First Count Value]
    E --> F[Show System Quantity]
    F --> G[Enter Recount Quantity]
    
    G --> H{Matches First Count?}
    H -->|Yes| I[Confirm First Count]
    H -->|No| J{Closer to System?}
    
    J -->|Yes| K[Use Recount Value]
    J -->|No| L[Flag for Review]
    
    I --> M[Update Item Status]
    K --> M
    L --> N[Add Review Notes]
    N --> M
    
    M --> O{More Recounts?}
    O -->|Yes| C
    O -->|No| P[End: All Recounts Complete]
```

---

## 11. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-06 | System | Initial documentation |
| 1.0.1 | 2025-12-09 | System | Replaced counting process flow with mobile-first interface flow (calculator, notes sheet, blind count mode, filter tabs) |
