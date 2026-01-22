# Flow Diagrams: Stock Cards

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Stock Cards |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated to single product detail page flows; Added analytics calculation flow; Added alert generation flow; Added quick actions flow; Corrected transaction types to IN/OUT only |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Page Load Flow

```mermaid
flowchart TD
    A[Navigate to Stock Card] --> B[Get productId from URL]
    B --> C[Set Loading True]
    C --> D[Call generateMockStockCardData]
    D --> E[Receive StockCardData]
    E --> F[Calculate Analytics Data]
    F --> G[Set Loading False]
    G --> H[Render Page Components]
    H --> I[Display Header with Status Badges]
    I --> J[Display Alerts Section]
    J --> K[Display Summary Cards]
    K --> L[Display Tabs Container]
```

**Source Evidence**: `stock-card/page.tsx:73-89`

---

## 2. Analytics Data Calculation Flow

```mermaid
flowchart TD
    A[useMemo Triggered] --> B{stockCardData exists?}
    B -->|No| C[Return Empty Analytics]
    B -->|Yes| D[Destructure Data]
    D --> E[Calculate Movement Trend]
    E --> F[Calculate Location Distribution]
    F --> G[Calculate Lot Status Data]
    G --> H[Calculate Days of Supply]
    H --> I[Calculate Movement by Type]
    I --> J[Generate Alerts]
    J --> K[Calculate Stock Status]
    K --> L[Return Analytics Object]
```

**Source Evidence**: `stock-card/page.tsx:92-228`

---

## 3. Movement Trend Calculation Flow

```mermaid
flowchart TD
    A[Start Movement Trend] --> B[Initialize Empty Array]
    B --> C[Get Today's Date]
    C --> D[Loop Last 30 Days]
    D --> E[Filter Movements by Date]
    E --> F[Sum IN Transactions]
    F --> G[Sum OUT Transactions]
    G --> H[Calculate Net Change]
    H --> I[Add to Trend Array]
    I --> J{More Days?}
    J -->|Yes| D
    J -->|No| K[Return Movement Trend]
```

**Source Evidence**: `stock-card/page.tsx:111-132`

---

## 4. Alert Generation Flow

```mermaid
flowchart TD
    A[Start Alert Generation] --> B[Initialize Empty Alerts]
    B --> C{currentStock <= minimumStock?}
    C -->|Yes| D[Add Critical: Low Stock Alert]
    C -->|No| E{currentStock <= reorderPoint?}
    D --> E
    E -->|Yes AND > minimum| F[Add Warning: Reorder Point]
    E -->|No| G[Check Expiring Lots]
    F --> G
    G --> H[Filter Lots Expiring within 30 Days]
    H --> I{Expiring Lots > 0?}
    I -->|Yes| J[Add Warning: Lots Expiring Soon]
    I -->|No| K[Check Expired Lots]
    J --> K
    K --> L[Filter Lots with Status Expired]
    L --> M{Expired Lots > 0?}
    M -->|Yes| N[Add Critical: Expired Lots]
    M -->|No| O[Return Alerts Array]
    N --> O
```

**Source Evidence**: `stock-card/page.tsx:171-211`

---

## 5. Stock Status Calculation Flow

```mermaid
flowchart TD
    A[Calculate Stock Status] --> B{currentStock <= minimumStock?}
    B -->|Yes| C[Return LOW Status]
    B -->|No| D{currentStock >= maximumStock?}
    D -->|Yes| E[Return HIGH Status]
    D -->|No| F[Return NORMAL Status]
    C --> G[Display Red Low Stock Badge]
    E --> H[Display Amber Overstocked Badge]
    F --> I[Display Green Normal Indicator]
```

**Source Evidence**: `stock-card/page.tsx:213-215`

---

## 6. Days of Supply Calculation Flow

```mermaid
flowchart TD
    A[Calculate Days of Supply] --> B[Filter OUT Transactions]
    B --> C[Sum Absolute Quantity Changes]
    C --> D[Divide by 30 for Daily Average]
    D --> E{avgDailyUsage > 0?}
    E -->|Yes| F[daysOfSupply = currentStock / avgDailyUsage]
    E -->|No| G[daysOfSupply = 999]
    F --> H{daysOfSupply > 365?}
    H -->|Yes| I[Display 365 Plus]
    H -->|No| J[Display Actual Days]
    G --> I
    J --> K{Days < 7?}
    K -->|Yes| L[Red Color Indicator]
    K -->|No| M{Days < 14?}
    M -->|Yes| N[Amber Color Indicator]
    M -->|No| O[Green Color Indicator]
```

**Source Evidence**: `stock-card/page.tsx:159-162`

---

## 7. Tab Navigation Flow

```mermaid
flowchart LR
    A[General Information] -->|Click| B[Tab Switch]
    C[Movement History] -->|Click| B
    D[Lot Information] -->|Click| B
    E[Valuation] -->|Click| B
    F[Analytics] -->|Click| B
    G[Actions] -->|Click| B

    B --> H{Selected Tab}
    H -->|general| I[StockCardGeneralInfo]
    H -->|movement| J[StockCardMovementHistory]
    H -->|lots| K[StockCardLotInformation]
    H -->|valuation| L[StockCardValuation]
    H -->|analytics| M[Analytics Content]
    H -->|actions| N[Actions Content]
```

**Source Evidence**: `stock-card/page.tsx:534-542`

---

## 8. Location Distribution Calculation Flow

```mermaid
flowchart TD
    A[Start Location Distribution] --> B[Map locationStocks]
    B --> C[For Each Location]
    C --> D[Calculate Quantity]
    D --> E[Calculate Value]
    E --> F[Calculate Percentage]
    F --> G[Add to Distribution Array]
    G --> H{More Locations?}
    H -->|Yes| C
    H -->|No| I[Sort by Quantity Descending]
    I --> J[Return Distribution Array]
```

**Source Evidence**: `stock-card/page.tsx:135-140`

---

## 9. Lot Status Distribution Flow

```mermaid
flowchart TD
    A[Calculate Lot Status] --> B[Count Available Lots]
    B --> C[Count Reserved Lots]
    C --> D[Count Expired Lots]
    D --> E[Count Quarantine Lots]
    E --> F[Filter Non-Zero Counts]
    F --> G[Map to Chart Data]
    G --> H[Assign Colors]
    H --> I{Available}
    I --> J[Green #22c55e]
    H --> K{Reserved}
    K --> L[Blue #3b82f6]
    H --> M{Expired}
    M --> N[Red #ef4444]
    H --> O{Quarantine}
    O --> P[Amber #f59e0b]
    J --> Q[Return Lot Status Data]
    L --> Q
    N --> Q
    P --> Q
```

**Source Evidence**: `stock-card/page.tsx:143-156`

---

## 10. Summary Cards Render Flow

```mermaid
flowchart TD
    A[Render Summary Cards] --> B[Current Stock Card]
    B --> C[Apply Stock Status Color]
    C --> D[Render Progress Bar]
    D --> E[Display Min/Max Labels]

    A --> F[Current Value Card]
    F --> G[Format Currency]
    G --> H[Display Average Cost]

    A --> I[Days of Supply Card]
    I --> J[Apply Days Color Coding]
    J --> K[Display Daily Usage]

    A --> L[Last Movement Card]
    L --> M[Display Date]
    M --> N[Display Movement Type]

    A --> O[Locations Card]
    O --> P[Display Count]
    P --> Q[Display Primary Location]

    A --> R[Active Lots Card]
    R --> S[Count Available Lots]
    S --> T[Display Total Lots]
```

**Source Evidence**: `stock-card/page.tsx:392-529`

---

## 11. Quick Actions Flow

```mermaid
flowchart TD
    A[User Clicks Actions Tab] --> B[Display Quick Actions Section]
    B --> C[Create Purchase Request Button]
    B --> D[Request Transfer Button]
    B --> E[Adjust Stock Button]

    C --> F{Button Clicked?}
    F -->|Yes| G[Navigate to Purchase Request]

    D --> H{Button Clicked?}
    H -->|Yes| I[Navigate to Transfer Request]

    E --> J{Button Clicked?}
    J -->|Yes| K[Navigate to Stock Adjustment]
```

**Source Evidence**: `stock-card/page.tsx:692-722`

---

## 12. Recommended Actions Flow

```mermaid
flowchart TD
    A[Render Recommended Actions] --> B{Alerts Exist?}
    B -->|No| C[Hide Section]
    B -->|Yes| D[Display Section]
    D --> E[Map Through Alerts]
    E --> F[For Each Alert]
    F --> G{Alert Type?}
    G -->|Critical| H[Red Icon and Background]
    G -->|Warning| I[Amber Icon and Background]
    H --> J[Display Title and Description]
    I --> J
    J --> K[Display Take Action Button]
    K --> L{More Alerts?}
    L -->|Yes| F
    L -->|No| M[Complete Render]
```

**Source Evidence**: `stock-card/page.tsx:724-758`

---

## 13. Header Actions Flow

```mermaid
flowchart TD
    A[User Interacts with Header] --> B{Action?}
    B -->|Back| C[Navigate to Stock Cards List]
    B -->|Refresh| D[Set Loading True]
    D --> E[Reload Stock Card Data]
    E --> F[Recalculate Analytics]
    F --> G[Set Loading False]
    B -->|Print| H[Open Print Dialog]
    B -->|Export| I[Generate Export Data]
    I --> J[Trigger Download]
    B -->|Edit| K[Navigate to Edit Page]
```

---

## 14. Loading State Flow

```mermaid
flowchart TD
    A[Page Requested] --> B[Display Loading Skeleton]
    B --> C[Header Skeleton]
    C --> D[Summary Cards Skeleton]
    D --> E[Tabs Skeleton]
    E --> F{Data Loaded?}
    F -->|No| G[Continue Showing Skeleton]
    G --> F
    F -->|Yes| H[Hide Skeleton]
    H --> I[Render Actual Content]
```

**Source Evidence**: `stock-card/page.tsx:231-269`

---

## 15. Error State Flow

```mermaid
flowchart TD
    A[Load Stock Card] --> B{Data Exists?}
    B -->|Yes| C[Render Normal Page]
    B -->|No| D[Display Error State]
    D --> E[Show Product Not Found Message]
    E --> F[Display Back Button]
    F --> G[User Clicks Back]
    G --> H[Navigate to Stock Cards List]
```

**Source Evidence**: `stock-card/page.tsx:271-290`

---

## 16. Movement by Type Calculation Flow

```mermaid
flowchart TD
    A[Calculate Movement by Type] --> B[Filter IN Transactions]
    B --> C[Count IN Transactions]
    C --> D[Sum IN Quantities]
    D --> E[Create Receipts Entry]

    A --> F[Filter OUT Transactions]
    F --> G[Count OUT Transactions]
    G --> H[Sum OUT Quantities Absolute]
    H --> I[Create Issues Entry]

    E --> J[Return Movement by Type Array]
    I --> J
```

**Note**: Only IN and OUT transaction types are supported.

**Source Evidence**: `stock-card/page.tsx:165-168`

---

## Related Documents

- [BR-stock-cards.md](./BR-stock-cards.md) - Business Requirements
- [TS-stock-cards.md](./TS-stock-cards.md) - Technical Specification
- [UC-stock-cards.md](./UC-stock-cards.md) - Use Cases
- [VAL-stock-cards.md](./VAL-stock-cards.md) - Validations
