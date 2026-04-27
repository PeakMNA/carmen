# Flow Diagrams: Sales Consumption

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Sales Consumption
- **Version**: 1.0.0
- **Last Updated**: 2026-01-27

---

## SC Generation Pipeline (Shift Close)

```mermaid
graph TD
    A[Scheduled Job Triggers at Shift Close] --> B[Collect POS Transactions for Location/Shift]
    B --> C[Deduplicate Transaction IDs]
    C --> D[Group by Location/Shift/BusinessDate]
    D --> E[For Each Transaction Line]
    E --> F{Item Mapped?}
    F -->|No| G[Route to Exception Queue]
    F -->|Yes| H{Recipe Active?}
    H -->|No| G
    H -->|Yes| I[Explode Recipe to Ingredients]
    I --> J{Ingredient Has Cost?}
    J -->|No| G
    J -->|Yes| K[Create SC Line - status posted]
    G --> L[Create SC Line - status pending with ExceptionCode]
    K --> M[Post to Inventory Ledger - SALES_CONSUMPTION txn]
    L --> N[Add to POS Exception Queue]
    M --> O{All Lines Processed?}
    N --> O
    O -->|No| E
    O -->|Yes| P{Line Mix?}
    P -->|All posted| Q[SC status = posted]
    P -->|Some posted, some pending| R[SC status = posted_with_exceptions]
    P -->|All pending| S[SC status = blocked]
```

---

## SC Status Transitions

```mermaid
stateDiagram-v2
    [*] --> draft: Job creates SC
    draft --> posted: All lines post cleanly
    draft --> posted_with_exceptions: Mixed - some posted, some exceptions
    draft --> blocked: All lines are exceptions
    posted_with_exceptions --> posted: All exceptions resolved via Supplemental SC
    blocked --> posted_with_exceptions: Some exceptions resolved, at least one posts
    blocked --> posted: All exceptions resolved
    posted_with_exceptions --> voided: Manager voids
    posted --> voided: Manager voids
    blocked --> voided: Manager voids
    voided --> [*]
    posted --> [*]
```

---

## Exception Resolution Flow (POS to Supplemental SC)

```mermaid
graph TD
    A[Exception in POS Queue] --> B[Manager Resolves in POS Setup - Mappings]
    B --> C[Click Resolve and Re-post]
    C --> D[System Re-validates Exception Line]
    D --> E{Passes Validation?}
    E -->|No| F[Exception Remains with Updated Reason Code]
    E -->|Yes| G{Original SC Closed Out?}
    G -->|No - original still open| H[Append Line to Original SC]
    G -->|Yes - original voided or terminal| I[Generate Supplemental SC]
    H --> J[Post Ingredient Deduction to Ledger]
    I --> J
    J --> K[Update SC Pending/Posted Line Counts]
    K --> L{All Exceptions Resolved?}
    L -->|Yes| M[SC Status to posted]
    L -->|No| N[SC Status remains posted_with_exceptions]
```

---

## Void Flow

```mermaid
graph TD
    A[Manager Opens SC Detail] --> B[Click Void]
    B --> C[System Shows Void Confirmation Dialog]
    C --> D[Manager Enters Void Reason - minimum 10 chars]
    D --> E{Confirm?}
    E -->|Cancel| F[Dialog Closes - no change]
    E -->|Confirm Void| G[System Creates Reversing Inventory Transactions]
    G --> H[Void All Linked Supplemental SCs]
    H --> I[SC Status = voided]
    I --> J[Show Success Toast]
```

---

## Auto-Generation Schedule (per Location)

```mermaid
graph TD
    A[Location Config: Shift Close Time] --> B{Shift Model?}
    B -->|Multi-shift| C[Run job at each shift close time]
    B -->|All-day| D[Run job at midnight business date boundary]
    C --> E[Generate SC for Shift]
    D --> F[Generate SC for Full Day]
    E --> G{Feature Flag Enabled for Location?}
    F --> G
    G -->|No| H[Skip SC generation - POS staging records only]
    G -->|Yes| I[Proceed with SC generation pipeline]
```

---

## Supplemental SC Relationship

```mermaid
graph TD
    SC1[SC-20260127-MAIN-LUNCH-001 - posted_with_exceptions] --> SUP1[SC-20260127-MAIN-LUNCH-001-SUP1 - posted]
    SC1 --> SUP2[SC-20260127-MAIN-LUNCH-001-SUP2 - posted]
    SC1 -.->|status becomes posted| SC1_DONE[SC-20260127-MAIN-LUNCH-001 - posted]

    SUP1 -->|covers| EXC1[Exception: UNMAPPED_ITEM - Oat Milk Latte]
    SUP2 -->|covers| EXC2[Exception: MODIFIER_UNMAPPED - Extra Cheese]
```

---

## Data Flow: POS to Menu Engineering

```mermaid
graph TD
    POS[POS System] -->|raw transactions| CONN[POS Connection]
    CONN -->|sync| STAGING[POS Transaction Staging]
    STAGING -->|shift-close job| SC[Sales Consumption SC]
    SC -->|inventory transactions - SALES_CONSUMPTION| LEDGER[Inventory Ledger]
    SC -->|exception lines| QUEUE[POS Exception Queue]
    LEDGER -->|read via adapter| DS[menu-engineering-data-source.ts]
    STAGING -->|revenue and popularity data| DS
    DS -->|analytics input| ME[Menu Engineering Analytics]
```

---

**Document End**
