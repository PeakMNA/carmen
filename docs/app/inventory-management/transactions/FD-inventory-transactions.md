# Flow Diagrams: Inventory Transactions

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Transactions |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. Page Load Flow

```mermaid
flowchart TD
    A[Navigate to Transactions] --> B{User Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Load User Context]
    D --> E{Is System Admin?}
    E -->|Yes| F[Load All Locations]
    E -->|No| G[Filter by availableLocations]
    F --> H[Initialize Filters]
    G --> H
    H --> I[Generate Transaction Data]
    I --> J[Calculate Summary]
    J --> K[Calculate Analytics]
    K --> L[Render Page]
    L --> M[Display Summary Cards]
    M --> N[Display Filter Panel]
    N --> O[Display Transaction Table]
```

---

## 2. Filter Application Flow

```mermaid
flowchart TD
    A[User Changes Filter] --> B[Update Filter State]
    B --> C[Set Loading True]
    C --> D{Location Filter Applied?}
    D -->|Yes| E[Validate Against User Permissions]
    D -->|No| F[Use Default Locations]
    E --> G{Valid Locations?}
    G -->|Yes| H[Apply All Filters]
    G -->|No| I[Filter to Permitted Only]
    F --> H
    I --> H
    H --> J[Generate Filtered Data]
    J --> K[Update Summary Cards]
    K --> L[Update Table]
    L --> M[Update Analytics]
    M --> N[Set Loading False]
    N --> O[Display Active Filters]
```

---

## 3. Transaction Type Flow

```mermaid
flowchart LR
    subgraph 'Inbound (IN)'
        A1[GRN - Goods Received]
        A2[TRF - Transfer In]
        A3[PO - Purchase Order]
        A4[PC - Physical Count +]
    end

    subgraph 'Outbound (OUT)'
        B1[SO - Sales Order]
        B2[TRF - Transfer Out]
        B3[SR - Store Requisition]
        B4[WO - Write Off]
        B5[WR - Wastage Report]
    end

    subgraph 'Adjustment'
        C1[ADJ - Manual Adjustment]
        C2[PC - Physical Count]
        C3[WO - Write Off]
        C4[WR - Wastage Report]
    end

    A1 --> D[Transaction Record]
    A2 --> D
    A3 --> D
    A4 --> D
    B1 --> D
    B2 --> D
    B3 --> D
    B4 --> D
    B5 --> D
    C1 --> D
    C2 --> D
    C3 --> D
    C4 --> D
```

---

## 4. Sorting Flow

```mermaid
flowchart TD
    A[Click Column Header] --> B{Same Column?}
    B -->|Yes| C{Current Direction?}
    B -->|No| D[Set New Column DESC]
    C -->|DESC| E[Toggle to ASC]
    C -->|ASC| F[Toggle to DESC]
    D --> G[Apply Sort]
    E --> G
    F --> G
    G --> H[Update Sort Icon]
    H --> I[Re-render Table]
```

---

## 5. Pagination Flow

```mermaid
flowchart TD
    A[Records Loaded] --> B[Calculate Total Pages]
    B --> C[Set Current Page 1]
    C --> D[Slice Records for Page]
    D --> E[Render Current Page]

    F[User Clicks Next] --> G{Last Page?}
    G -->|No| H[Increment Page]
    G -->|Yes| I[Button Disabled]
    H --> D

    J[User Clicks Previous] --> K{First Page?}
    K -->|No| L[Decrement Page]
    K -->|Yes| M[Button Disabled]
    L --> D

    N[User Changes Page Size] --> O[Reset to Page 1]
    O --> B
```

---

## 6. CSV Export Flow

```mermaid
flowchart TD
    A[Click Export CSV] --> B{Records Exist?}
    B -->|No| C[Button Disabled]
    B -->|Yes| D[Generate Headers Array]
    D --> E[Map Records to Rows]
    E --> F[Join with Commas]
    F --> G[Create Blob]
    G --> H[Generate Filename with Date]
    H --> I[Create Download Link]
    I --> J[Trigger Download]
    J --> K[Cleanup Link]
```

---

## 7. Tab Navigation Flow

```mermaid
flowchart LR
    A[Transactions Tab] -->|Click Analytics| B[Analytics Tab]
    B -->|Click Transactions| A

    A --> C[Show TransactionTable]
    B --> D[Show TransactionAnalytics]
```

---

## 8. Location Access Control Flow

```mermaid
flowchart TD
    A[Load Page] --> B[Get User Context]
    B --> C{Check Role}
    C -->|System Administrator| D[Access All Locations]
    C -->|Other Roles| E[Get availableLocations]
    E --> F{Has Locations?}
    F -->|Yes| G[Filter Dropdown Options]
    F -->|No| H[Show All Locations]
    D --> I[Render Location Filter]
    G --> I
    H --> I
    I --> J[Load Transaction Data]
    J --> K{Location Filter Applied?}
    K -->|No| L[Auto-filter to User Locations]
    K -->|Yes| M[Validate Against Permissions]
    L --> N[Display Filtered Transactions]
    M --> N
```

---

## 9. Analytics Rendering Flow

```mermaid
flowchart TD
    A[Analytics Tab Selected] --> B[Check Loading State]
    B -->|Loading| C[Show Skeleton Charts]
    B -->|Loaded| D[Render Trend Chart]
    D --> E[Render Type Distribution Pie]
    E --> F[Render Location Activity Bars]
    F --> G[Render Reference Type Bars]
    G --> H[Render Category Value Bars]
    H --> I[Charts Complete]
```

---

## 10. Quick Date Filter Flow

```mermaid
flowchart TD
    A[Click Quick Filter Button] --> B{Which Button?}
    B -->|Today| C[Set from: today start, to: now]
    B -->|7 Days| D[Set from: 7 days ago, to: now]
    B -->|30 Days| E[Set from: 30 days ago, to: now]
    B -->|This Month| F[Set from: month start, to: month end]
    C --> G[Update dateRange Filter]
    D --> G
    E --> G
    F --> G
    G --> H[Trigger Filter Change]
    H --> I[Reload Data]
```
