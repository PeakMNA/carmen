# Flow Diagrams: POS Integration

## Module Information
- **Module**: System Administration > System Integrations
- **Sub-Module**: POS Integration
- **Route**: `/system-administration/system-integration/pos`
- **Version**: 2.0.0
- **Last Updated**: 2026-01-27

---

## Module Layout (Setup / Operate / Audit)

```mermaid
graph TD
    POS[POS Integration root] --> SETUP[Setup]
    POS --> OPERATE[Operate]
    POS --> AUDIT[Audit]
    SETUP --> CONN[Connections - add and manage POS connections]
    SETUP --> MAP[Mappings - recipes, units, locations, fractional, modifiers]
    OPERATE --> HEALTH[Sync Health Dashboard]
    OPERATE --> EXC[Exception Queue]
    AUDIT --> RAW[Raw Transactions Log]
    AUDIT --> SYNC[Sync Events Log]
```

---

## Connection Wizard Flow (Setup → Connections)

```mermaid
graph TD
    A[Click Add Connection] --> B[Select POS Model]
    B --> C{Connector Modes Available}
    C -->|api| D[Enter API Credentials and Endpoint]
    C -->|file_import| E[Configure File Format and Upload Schedule]
    C -->|webhook| F[Copy Webhook URL - System Generates]
    D --> G[Select Carmen Location]
    E --> G
    F --> G
    G --> H[Set Sync Schedule]
    H --> I[Enable SC Generation for Location]
    I --> J[Test Connection]
    J --> K{Test Result}
    K -->|Success| L[Save Connection - status active]
    K -->|Failed| M[Show Error Detail - user corrects]
    M --> J
```

---

## Exception Queue Flow (Operate → Exceptions)

```mermaid
graph TD
    A[Shift-Close SC Generation] --> B{Line Validates?}
    B -->|Yes| C[Posted to Inventory Ledger]
    B -->|No| D[Exception Queue with Reason Code]
    D --> E[Manager Opens Exception Queue]
    E --> F{Action}
    F -->|Resolve and Re-post| G[Fix Mapping in Setup]
    F -->|Defer to Tomorrow| H[Exception Remains in Queue]
    F -->|Mark as Non-inventory| I[Item Permanently Flagged - auto-skip future]
    F -->|Discard with Reason| J[Exception Discarded with Audit Note]
    G --> K[Re-validate Line]
    K --> L{Passes?}
    L -->|Yes| M[Generate Supplemental SC - posted]
    L -->|No| N[Exception Remains with Updated Reason Code]
```

## Transaction Processing Flow (Legacy — replaced by SC pipeline)

The old per-transaction approval flow (pending_approval → approved → processing → success) has been replaced by the shift-close batch SC generation model. See [Sales Consumption module](../../../store-operations/sales-consumption/FD-sales-consumption.md) for the current pipeline flow.

```mermaid
stateDiagram-v2
    [*] --> staging: POS Transaction Synced
    staging --> included_in_sc: Shift-Close Job Runs
    included_in_sc --> posted: Clean Line - Inventory Updated
    included_in_sc --> exception: Mapping Missing or Invalid
    exception --> resolved: Exception Cleared in Queue
    resolved --> supplemental_sc: Supplemental SC Generated
    supplemental_sc --> posted
    posted --> [*]
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

## Sync Workflow (Updated)

```mermaid
graph TD
    A[Scheduled Sync per Connection] --> B{Connection Active?}
    B -->|No| C[Skip]
    B -->|Yes| D{Connector Mode}
    D -->|api| E[Call POS API - Fetch Transactions]
    D -->|webhook| F[Receive Push Event]
    D -->|file_import| G[Process Uploaded File]
    E --> H[Write to POS Staging Table]
    F --> H
    G --> H
    H --> I[Update Last Sync Timestamp]
    I --> J[Sync Health Dashboard Updated]
    J --> K[At Shift Close - SC Generation Job Runs]
    K --> L[SC Document Created in Store Operations]
```

---

**Document End**
