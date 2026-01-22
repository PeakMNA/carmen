# Flow Diagrams: POS Integration

## Module Information
- **Module**: System Administration > System Integrations
- **Sub-Module**: POS Integration
- **Route**: `/system-administration/system-integration/pos`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-18

---

## Transaction Processing Flow

```mermaid
stateDiagram-v2
    [*] --> pending_approval: POS Transaction Received
    pending_approval --> approved: Manager Approves
    pending_approval --> rejected: Manager Rejects
    approved --> processing: Start Processing
    processing --> success: Inventory Deducted
    processing --> failed: Processing Error
    failed --> processing: Retry
    failed --> manually_resolved: Manual Resolution
    rejected --> [*]
    success --> [*]
    manually_resolved --> [*]
```

---

## Recipe Mapping Flow

```mermaid
graph TD
    A[Unmapped POS Item] --> B[Click Item Badge]
    B --> C[Open Mapping Dialog]
    C --> D[Select POS Outlet]
    D --> E[Search and Select Recipe]
    E --> F[Configure Portion Size/Unit]
    F --> G[Set Price at Outlet]
    G --> H{Valid?}
    H -->|Yes| I[Create Mapping]
    H -->|No| F
    I --> J[Update Mappings Table]
    J --> K[Remove from Unmapped]
```

---

## Location Mapping Flow

```mermaid
graph TD
    A[Carmen Location] --> B{Has Outlet?}
    B -->|No| C[Click Map to Outlet]
    B -->|Yes| D[View Current Mapping]
    C --> E[Select POS Outlet]
    E --> F[Save Mapping]
    F --> G[Update Sync Status]
    D --> H{Change?}
    H -->|Yes| C
    H -->|No| I[End]
```

---

## Transaction Approval Flow

```mermaid
graph TD
    A[Pending Transaction] --> B[Review in Queue]
    B --> C{Decision}
    C -->|Approve| D[View Inventory Impact]
    C -->|Reject| E[Enter Reason]
    C -->|View Details| F[Open Detail Dialog]
    D --> G[Add Notes - Optional]
    G --> H[Click Approve]
    H --> I[Process Deduction]
    I --> J[Update Status]
    E --> K[Click Reject]
    K --> L[Update Status to Rejected]
    F --> B
```

---

## Bulk Approval Flow

```mermaid
graph TD
    A[Approval Queue] --> B[Select Transactions]
    B --> C[Toggle Checkboxes]
    C --> D{All Selected?}
    D -->|Yes| E[Show Approve Selected Button]
    D -->|No| B
    E --> F[Click Approve Selected]
    F --> G[Process Each Transaction]
    G --> H{Success?}
    H -->|Yes| I[Mark Successful]
    H -->|No| J[Mark Failed]
    I --> K[Update Queue]
    J --> K
```

---

## Fractional Variant Flow

```mermaid
graph TD
    A[Base Recipe] --> B[Create Variant]
    B --> C[Set Total Yield]
    C --> D[Select Yield Unit]
    D --> E[Set Rounding Rule]
    E --> F[Save Variant]
    F --> G[Add Variant Item]
    G --> H[Enter POS Item Details]
    H --> I[Set Deduction Percentage]
    I --> J[Set Price]
    J --> K[Save Variant Item]
    K --> L{Add More?}
    L -->|Yes| G
    L -->|No| M[Variant Complete]
```

---

## Configuration Save Flow

```mermaid
graph TD
    A[Edit Configuration] --> B[Change Setting]
    B --> C[Set hasUnsavedChanges]
    C --> D[Show Alert Banner]
    D --> E{Action?}
    E -->|Save| F[Validate Settings]
    E -->|Cancel| G[Restore Original]
    E -->|Continue Editing| A
    F --> H{Valid?}
    H -->|Yes| I[Update Config]
    H -->|No| A
    I --> J[Clear Unsaved Flag]
    J --> K[Show Success Toast]
    G --> J
```

---

## Connection Test Flow

```mermaid
graph TD
    A[Click Test Connection] --> B[Set Testing State]
    B --> C[Call onTestConnection]
    C --> D{Result}
    D -->|Success| E[Show Success Message]
    D -->|Failed| F[Show Error Message]
    E --> G[Clear Testing State]
    F --> G
```

---

## Report Export Flow

```mermaid
graph TD
    A[View Report] --> B[Click Export Button]
    B --> C[Select Format]
    C --> D{Format}
    D -->|CSV| E[Generate CSV]
    D -->|PDF| F[Generate PDF]
    D -->|Excel| G[Generate Excel]
    E --> H[Download File]
    F --> H
    G --> H
    H --> I[Show Toast Notification]
```

---

## Sync Workflow

```mermaid
graph TD
    A[Scheduled Sync] --> B[Check Sync Enabled]
    B --> C{Enabled?}
    C -->|Yes| D[Fetch POS Transactions]
    C -->|No| E[Skip]
    D --> F[Process Each Transaction]
    F --> G{Processing Mode}
    G -->|Automatic| H[Auto Process]
    G -->|Approval| I[Queue for Approval]
    G -->|Manual| J[Mark as Pending]
    H --> K[Update Inventory]
    I --> L[Send Notification]
    K --> M[Update Last Sync]
    L --> M
    J --> M
```

---

**Document End**
