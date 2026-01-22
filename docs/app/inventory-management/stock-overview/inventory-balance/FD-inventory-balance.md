# Flow Diagrams: Inventory Balance

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Balance |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated tab structure to Balance Report and Movement History; Added inventory status flow; Updated transaction types to IN/OUT only; Added pagination flow |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Page Load Flow

```mermaid
flowchart TD
    A[Navigate to Inventory Balance] --> B{User Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Load User Context]
    D --> E{Is System Admin?}
    E -->|Yes| F[Load All Locations]
    E -->|No| G[Filter by availableLocations]
    F --> H[Load Mock Balance Report]
    G --> H
    H --> I[Set Loading False]
    I --> J[Render Page with Tabs]
    J --> K[Display Balance Report Tab]
    K --> L[Display Filter Panel]
    L --> M[Display Balance Table]
```

---

## 2. Filter Application Flow

```mermaid
flowchart TD
    A[User Changes Filter] --> B[Update Local Filter State]
    B --> C[User Clicks Apply Button]
    C --> D[Set Loading True]
    D --> E{Which Filter?}
    E -->|Location| F[Validate Location Range]
    E -->|Category| G[Validate Category Range]
    E -->|Product| H[Validate Product Range]
    E -->|As-of Date| I[Validate Date]
    F --> J[Apply All Filters]
    G --> J
    H --> J
    I --> J
    J --> K[Reload Balance Data]
    K --> L[Set Loading False]
    L --> M[Update Table Display]
```

---

## 3. Filter Reset Flow

```mermaid
flowchart TD
    A[User Clicks Reset Button] --> B[Clear All Filter Inputs]
    B --> C[Reset asOfDate to Current]
    C --> D[Clear locationRange]
    D --> E[Clear categoryRange]
    E --> F[Clear productRange]
    F --> G[Trigger Filter Change]
    G --> H[Reload Default Data]
```

---

## 4. Data Hierarchy Expansion Flow

```mermaid
flowchart TD
    A[User Clicks Location Row] --> B[Toggle Location Expansion]
    B --> C{Is Expanded?}
    C -->|Yes| D[Show Categories]
    C -->|No| E[Collapse Categories]
    D --> F[User Clicks Category Row]
    F --> G[Toggle Category Expansion]
    G --> H{Is Expanded?}
    H -->|Yes| I[Show Products]
    H -->|No| J[Collapse Products]
    I --> K{Product has Lots?}
    K -->|Yes| L[User Clicks Product Row]
    L --> M[Show Lot Details]
    K -->|No| N[End at Product Level]
```

---

## 5. Inventory Status Calculation Flow

```mermaid
flowchart TD
    A[Product Row Rendered] --> B[Get Product Thresholds]
    B --> C[Get Current Quantity]
    C --> D{Quantity <= Minimum?}
    D -->|Yes| E[Return LOW Status]
    D -->|No| F{Quantity >= Maximum?}
    F -->|Yes| G[Return HIGH Status]
    F -->|No| H[Return NORMAL Status]
    E --> I[Display Red Destructive Badge]
    G --> J[Display Amber Badge]
    H --> K[Display Green Badge]
```

**Source Evidence**: `components/BalanceTable.tsx:112-121`

---

## 6. Tab Navigation Flow

```mermaid
flowchart LR
    A[Balance Report Tab] -->|Click Movement History| B[Movement History Tab]
    B -->|Click Balance Report| A

    A --> C[Show FilterPanel]
    A --> D[Show BalanceTable]
    B --> E[Show MovementHistory Component]
```

---

## 7. Movement History Load Flow

```mermaid
flowchart TD
    A[Movement History Tab Activated] --> B[Set Local Loading True]
    B --> C[Load Mock Movement Data]
    C --> D[Generate Summary Stats]
    D --> E[Set Movement Data State]
    E --> F[Set Local Loading False]
    F --> G[Display Summary Cards]
    G --> H[Display Filter Controls]
    H --> I[Display Movement Table]
    I --> J[Display Pagination]
```

---

## 8. Movement Filter Flow

```mermaid
flowchart TD
    A[User Changes Filter] --> B{Filter Type?}
    B -->|Transaction Type| C[Update transactionType State]
    B -->|Date Range| D[Update dateRange State]
    B -->|Search| E[Update searchTerm State]
    C --> F[Filter Records]
    D --> F
    E --> F
    F --> G[Apply Transaction Type Filter]
    G --> H[Apply Date Range Filter]
    H --> I[Apply Search Filter]
    I --> J[Calculate Filtered Results]
    J --> K[Reset to Page 1]
    K --> L[Update Display]
```

**Source Evidence**: `components/MovementHistory.tsx:71-102`

---

## 9. Transaction Type Badge Flow

```mermaid
flowchart TD
    A[Render Transaction Type] --> B{Type Value?}
    B -->|IN| C[Return Green Badge]
    B -->|OUT| D[Return Red Badge]
    B -->|Other| E[Return Null]
    C --> F[Display In Badge]
    D --> G[Display Out Badge]
```

**Note**: Only IN and OUT types are supported.

**Source Evidence**: `components/MovementHistory.tsx:112-121`

---

## 10. Reference Type Badge Flow

```mermaid
flowchart TD
    A[Render Reference Type] --> B{Reference Type?}
    B -->|GRN| C[Blue Badge]
    B -->|SO| D[Purple Badge]
    B -->|ADJ| E[Amber Badge]
    B -->|TRF| F[Indigo Badge]
    B -->|PO| G[Cyan Badge]
    B -->|WO| H[Rose Badge]
    B -->|SR| I[Emerald Badge]
    B -->|Unknown| J[Gray Badge]
```

**Source Evidence**: `components/MovementHistory.tsx:124-136`

---

## 11. Pagination Flow

```mermaid
flowchart TD
    A[Calculate Total Pages] --> B{totalPages > 1?}
    B -->|No| C[Hide Pagination]
    B -->|Yes| D[Display Pagination Controls]
    D --> E[User Clicks Previous]
    D --> F[User Clicks Next]
    E --> G{currentPage > 1?}
    G -->|Yes| H[Decrease currentPage]
    G -->|No| I[Stay at Page 1]
    F --> J{currentPage < totalPages?}
    J -->|Yes| K[Increase currentPage]
    J -->|No| L[Stay at Last Page]
    H --> M[Update Displayed Records]
    K --> M
```

**Source Evidence**: `components/MovementHistory.tsx:398-420`

---

## 12. Export Flow

```mermaid
flowchart TD
    A[User Clicks Export] --> B[Get Current Filter State]
    B --> C[Get Filtered Data]
    C --> D[Generate File Headers]
    D --> E[Map Data to Rows]
    E --> F[Generate Filename with Date]
    F --> G[Create Blob]
    G --> H[Create Download Link]
    H --> I[Trigger Download]
    I --> J[Cleanup Link]
```

---

## 13. Permission Check Flow

```mermaid
flowchart TD
    A[Load Balance Page] --> B[Get User Context]
    B --> C{Check Role}
    C -->|System Administrator| D[Access All Locations]
    C -->|Other Roles| E[Get availableLocations]
    E --> F{Has Locations?}
    F -->|Yes| G[Filter Balance Report]
    F -->|No| H[Show All Locations]
    D --> I[Load Full Report]
    G --> J[Filter Locations Array]
    H --> I
    J --> K[Recalculate Totals]
    K --> L[Display Filtered Data]
    I --> M[Display Full Data]
```

---

## 14. Navigate to Stock Card Flow

```mermaid
flowchart TD
    A[User Clicks Product Row] --> B[Get Product ID]
    B --> C[Get Product Code]
    C --> D[Construct Stock Card URL]
    D --> E[Navigate to Stock Card Page]
    E --> F[Load Stock Card with Product Context]
```

---

## 15. Movement Summary Calculation Flow

```mermaid
flowchart TD
    A[Movement Data Loaded] --> B[Initialize Summary Object]
    B --> C[Loop Through Records]
    C --> D{Transaction Type?}
    D -->|IN| E[Add to totalIn]
    D -->|OUT| F[Add to totalOut]
    E --> G[Add to totalValueIn]
    F --> H[Add to totalValueOut]
    G --> I[Increment transactionCount]
    H --> I
    I --> J{More Records?}
    J -->|Yes| C
    J -->|No| K[Calculate netChange]
    K --> L[Calculate netValueChange]
    L --> M[Return Summary Object]
```

---

## 16. Quantity Change Display Flow

```mermaid
flowchart TD
    A[Format Quantity Change] --> B{Change Value?}
    B -->|Positive| C[Display Green +value]
    B -->|Negative| D[Display Red value]
    B -->|Zero| E[Display Neutral value]
    C --> F[Show Before to After]
    D --> F
    E --> F
```

**Source Evidence**: `components/MovementHistory.tsx:139-147`

---

## Related Documents

- [BR-inventory-balance.md](./BR-inventory-balance.md) - Business Requirements
- [TS-inventory-balance.md](./TS-inventory-balance.md) - Technical Specification
- [UC-inventory-balance.md](./UC-inventory-balance.md) - Use Cases
- [VAL-inventory-balance.md](./VAL-inventory-balance.md) - Validations
