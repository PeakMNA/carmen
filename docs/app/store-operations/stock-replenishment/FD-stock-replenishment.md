# Flow Diagrams: Stock Replenishment Module

## 1. High-Level System Flow

```mermaid
graph TD
    A[PAR Level Monitoring] --> B[Items Below PAR]
    C[Stock Balances] <--> B
    B --> D[Urgency Classification]
    D --> E{Source Available?}
    D --> F[Manual Selection]
    E -->|YES| G[Stock Transfer]
    E -->|NO| H[PR Only Workflow]
    F --> H
    G --> I[Store Requisition]
    H --> I
    I --> J[Approval Workflow]
    J --> K[ST Generated]
    J --> L[SI Generated]
    J --> M[PR Generated]
```

## 2. Urgency Classification Flow

```mermaid
graph TD
    A[For Each Item at Location] --> B[Calculate: currentStock / parLevel x 100]
    B --> C{Stock Percentage}
    C -->|Less than 30 percent| D[CRITICAL]
    C -->|30 to 60 percent| E[WARNING]
    C -->|Greater than 60 percent| F[LOW]
    D --> G[Dashboard Display]
    E --> G
    F --> G
```

## 3. Replenishment Request Creation Flow

```mermaid
graph TD
    subgraph Dashboard
        A1[Filter by Urgency and Location]
        A2[Select Items via Checkbox]
        A3[Click Create Request]
    end

    subgraph RequestForm
        B1[Select Source Location]
        B2[Set Priority]
        B3[Review Items with Availability]
        B4[Submit Request]
    end

    A1 --> A2
    A2 --> A3
    A3 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> C[Create Store Requisition]
    C --> D[Redirect to SR Module]
```

## 4. Workflow Type Determination Flow

```mermaid
graph TD
    A[Source Location Selection] --> B{Source equals none?}
    B -->|YES| C[PR ONLY Workflow]
    C --> C1[All items go to Purchase Request]
    B -->|NO| D{Check Destination Location Type}
    D -->|DIRECT Type| E[STOCK ISSUE]
    E --> E1[Issue to expense location]
    D -->|INVENTORY Type| F[STOCK TRANSFER]
    F --> F1[INVENTORY to INVENTORY]
```

## 5. Source Availability Check Flow

```mermaid
graph TD
    A[Get Source Location Stock] --> B[For Each Requested Item]
    B --> C{Source Stock vs Requested}
    C -->|Stock >= Requested| D[Valid: Full quantity from stock]
    C -->|Stock < Requested| E[Partial Fulfillment]
    E --> E1[Available goes to ST]
    E --> E2[Shortfall goes to PR]
    D --> F[Display Item Status in Form]
    E1 --> F
    E2 --> F
```

## 6. Document Generation Flow

```mermaid
graph TD
    A[Store Requisition APPROVED] --> B[Analyze Line Items]
    B --> C[Items with Source Stock to INVENTORY]
    B --> D[Items to DIRECT Location]
    B --> E[Items with No Source - Shortfall]
    C --> F[Generate STOCK TRANSFER - ST]
    D --> G[Generate STOCK ISSUE - SI]
    E --> H[Generate PURCHASE REQUEST - PR]
    F --> I[Update SR Stage to Issue]
    G --> I
    H --> I
    I --> J[Link Generated Documents to SR]
```

## 7. Location Type Validation Flow

### Source Location Validation

| Location Type | Can Be Source? | Reason |
|---------------|----------------|--------|
| INVENTORY | YES | Has stock balance to transfer |
| DIRECT | NO | No inventory exists |
| CONSIGNMENT | YES with warning | Requires vendor notification |
| none | SPECIAL | PR-only workflow |

### Destination Location Validation

| Location Type | Can Receive? | Reason |
|---------------|--------------|--------|
| INVENTORY | YES | Has PAR levels, tracks stock |
| DIRECT | NO | No PAR levels, immediate expense |
| CONSIGNMENT | YES | Has PAR levels |

```mermaid
graph TD
    A[User Selects Destination] --> B{Check Location Type}
    B -->|DIRECT| C[BLOCKED: Cannot replenish DIRECT locations]
    B -->|INVENTORY or CONSIGNMENT| D[ALLOWED: Proceed with source selection]
```

## 8. User Journey Flow

```mermaid
graph LR
    A[DISCOVER] --> B[FILTER]
    B --> C[SELECT]
    C --> D[CONFIGURE]
    D --> E[SUBMIT]

    A --> A1[View Dashboard with items below PAR]
    B --> B1[Filter by urgency and location]
    C --> C1[Select items via checkbox]
    D --> D1[Choose source location and priority]
    E --> E1[Submit request and SR Created]
```

## 9. State Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft

    Draft --> Submit: submit
    Submit --> Approve: approve
    Submit --> Cancelled: cancel
    Approve --> Issue: issue
    Approve --> Cancelled: cancel
    Issue --> Complete: complete

    Complete --> [*]
    Cancelled --> [*]
```

### Stage to Status Mapping

| Stage | Status |
|-------|--------|
| Draft | Draft |
| Submit | InProgress |
| Approve | InProgress |
| Issue | InProgress |
| Complete | Completed |

### Status Values (5)

| Status | Description |
|--------|-------------|
| Draft | Initial state |
| InProgress | Being processed (Submit, Approve, Issue stages) |
| Completed | Fully processed |
| Cancelled | Cancelled by user |
| Voided | Voided after completion |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2024-12-01 | System | Initial creation with ASCII art diagrams |
| 1.1.0 | 2025-01-15 | Claude | Updated State Transition Diagram to Stage-based workflow model |
| 1.2.0 | 2025-01-15 | Claude | Converted all diagrams to Mermaid 8.8.2 compatible syntax |
| 1.2.1 | 2025-01-15 | Claude | Fixed stateDiagram-v2 rendering by removing unsupported note syntax |
