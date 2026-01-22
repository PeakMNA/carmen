# Flow Diagrams: Inventory Transactions

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Transactions |
| Version | 2.0.0 |
| Last Updated | 2025-01-16 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-01-16 | Documentation Team | Updated transaction types; Updated reference types (ST, SI); Fixed Mermaid compatibility |
| 1.0.0 | 2024-01-15 | Documentation Team | Initial version |

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

**Source Evidence**: `page.tsx:43-89`

---

## 2. Filter Application Flow

```mermaid
flowchart TD
    A[User Changes Filter] --> B[Update Filter State]
    B --> C[Set Loading True]
    C --> D{Location Filter Applied?}
    D -->|Yes| E[Validate Against Permissions]
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

**Source Evidence**: `page.tsx:60-89`, `components/TransactionFilters.tsx:43-133`

---

## 3. Transaction Type Flow

```mermaid
flowchart LR
    subgraph Inbound_IN
        A1[GRN - Goods Received]
        A2[ST - Transfer In]
        A3[PC - Physical Count plus]
        A4[ADJ - Adjustment plus]
    end

    subgraph Outbound_OUT
        B1[SO - Sales Order]
        B2[ST - Transfer Out]
        B3[SI - Stock Issue]
        B4[WO - Write Off]
        B5[WR - Wastage Report]
        B6[ADJ - Adjustment minus]
        B7[PC - Physical Count minus]
    end

    A1 --> C[Transaction Record]
    A2 --> C
    A3 --> C
    A4 --> C
    B1 --> C
    B2 --> C
    B3 --> C
    B4 --> C
    B5 --> C
    B6 --> C
    B7 --> C
```

**Note**: Transaction types are only IN or OUT. Adjustments (ADJ) create either IN or OUT based on direction.

**Source Evidence**: `types.ts:6-7`, `lib/mock-data/transactions.ts:73-76`

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

**Source Evidence**: `components/TransactionTable.tsx:104-118`

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

**Source Evidence**: `components/TransactionTable.tsx:44-46, 96-123`

---

## 6. CSV Export Flow

```mermaid
flowchart TD
    A[Click Export CSV] --> B{Records Exist?}
    B -->|No| C[Button Disabled]
    B -->|Yes| D[Generate Headers Array]
    D --> E[Map Records to Rows]
    E --> F[Quote All Values]
    F --> G[Join with Commas]
    G --> H[Create Blob]
    H --> I[Generate Filename with Date]
    I --> J[Create Download Link]
    J --> K[Trigger Download]
    K --> L[Cleanup Link]
```

**Source Evidence**: `page.tsx:97-154`

---

## 7. Tab Navigation Flow

```mermaid
flowchart LR
    A[Transactions Tab] -->|Click Analytics| B[Analytics Tab]
    B -->|Click Transactions| A

    A --> C[Show TransactionTable]
    B --> D[Show TransactionAnalytics]
```

**Source Evidence**: `page.tsx:226-257`

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
    J --> K{User Has Location Filter?}
    K -->|No| L[Auto-filter to User Locations]
    K -->|Yes| M[Validate Against Permissions]
    L --> N[Display Filtered Transactions]
    M --> N
```

**Source Evidence**: `page.tsx:43-56`, `page.tsx:66-81`

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

**Source Evidence**: `components/TransactionAnalytics.tsx:29-59, 61-293`

---

## 10. Quick Date Filter Flow

```mermaid
flowchart TD
    A[Click Quick Filter Button] --> B{Which Button?}
    B -->|Today| C[Set from: today start to: now]
    B -->|7 Days| D[Set from: 7 days ago to: now]
    B -->|30 Days| E[Set from: 30 days ago to: now]
    B -->|This Month| F[Set from: month start to: month end]
    C --> G[Update dateRange Filter]
    D --> G
    E --> G
    F --> G
    G --> H[Trigger Filter Change]
    H --> I[Reload Data]
```

**Source Evidence**: `components/TransactionFilters.tsx:94-122`

---

## 11. Search Filter Flow

```mermaid
flowchart TD
    A[User Types in Search Box] --> B[Update searchTerm State]
    B --> C[Debounce Input]
    C --> D[Filter Records]
    D --> E{Match Found?}
    E -->|Product Name| F[Include Record]
    E -->|Product Code| F
    E -->|Reference| F
    E -->|Location| F
    E -->|Category| F
    E -->|User Name| F
    E -->|No Match| G[Exclude Record]
    F --> H[Update Results]
    G --> H
```

**Source Evidence**: `components/TransactionFilters.tsx:51-53`, `lib/mock-data/transactions.ts:350-365`

---

## 12. Summary Calculation Flow

```mermaid
flowchart TD
    A[Filtered Records] --> B[Initialize Totals]
    B --> C[Loop Through Records]
    C --> D{Transaction Type?}
    D -->|IN| E[Add to totalInQuantity]
    D -->|OUT| F[Add to totalOutQuantity]
    E --> G[Add to totalInValue]
    F --> H[Add to totalOutValue]
    G --> I{Is ADJ Reference?}
    H --> I
    I -->|Yes| J[Increment adjustmentCount]
    I -->|No| K[Continue]
    J --> L[Update adjustmentValue]
    K --> M{More Records?}
    L --> M
    M -->|Yes| C
    M -->|No| N[Calculate netQuantityChange]
    N --> O[Calculate netValueChange]
    O --> P[Return Summary]
```

**Source Evidence**: `lib/mock-data/transactions.ts:164-197`

---

## Related Documents

- [BR-inventory-transactions.md](./BR-inventory-transactions.md) - Business Requirements
- [TS-inventory-transactions.md](./TS-inventory-transactions.md) - Technical Specification
- [UC-inventory-transactions.md](./UC-inventory-transactions.md) - Use Cases
- [VAL-inventory-transactions.md](./VAL-inventory-transactions.md) - Validations
