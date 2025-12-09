# Flow Diagrams: Slow Moving Inventory

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Slow Moving |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. Page Load Flow

```mermaid
flowchart TD
    A[Navigate to Slow Moving] --> B{User Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Load User Context]
    D --> E[Generate Mock Data]
    E --> F[Calculate Risk Levels]
    F --> G[Assign Suggested Actions]
    G --> H{Is System Admin?}
    H -->|Yes| I[Load All Items]
    H -->|No| J[Filter by availableLocations]
    I --> K[Calculate Statistics]
    J --> K
    K --> L[Generate Chart Data]
    L --> M[Set Loading False]
    M --> N[Render Page]
```

---

## 2. Risk Level Calculation Flow

```mermaid
flowchart TD
    A[Item Data Loaded] --> B[Get Days Idle]
    B --> C{Days Idle Value?}
    C -->|>= 120| D[Risk = Critical]
    C -->|91-119| E[Risk = High]
    C -->|61-90| F[Risk = Medium]
    C -->|30-60| G[Risk = Low]
    D --> H[Assign Risk Badge]
    E --> H
    F --> H
    G --> H
    H --> I[Store Risk Level]
```

---

## 3. Action Suggestion Flow

```mermaid
flowchart TD
    A[Item with Risk Level] --> B{Risk Level?}
    B -->|Critical| C{Value < Threshold?}
    C -->|Yes| D[Suggest Write Off]
    C -->|No| E{Has Multiple Locations?}
    B -->|High| E
    E -->|Yes| F[Suggest Transfer]
    E -->|No| G{Is Promotable Category?}
    B -->|Medium| G
    G -->|Yes| H[Suggest Promote]
    G -->|No| I[Suggest Hold]
    B -->|Low| I
    D --> J[Return Action]
    F --> J
    H --> J
    I --> J
```

---

## 4. Filter Application Flow

```mermaid
flowchart TD
    A[User Changes Filter] --> B{Filter Type?}
    B -->|Search| C[Update searchTerm]
    B -->|Category| D[Update categoryFilter]
    B -->|Risk Level| E[Update riskLevelFilter]
    B -->|Action| F[Update actionFilter]
    B -->|Location| G[Update locationFilter]
    C --> H[Apply All Filters]
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I[Filter Items Array]
    I --> J[Recalculate Statistics]
    J --> K[Update Chart Data]
    K --> L[Re-render UI]
```

---

## 5. Tab Navigation Flow

```mermaid
flowchart LR
    A[Inventory List Tab] -->|Click Analytics| B[Analytics Tab]
    B -->|Click Action Center| C[Action Center Tab]
    C -->|Click Inventory| A

    A --> D[Show Item Table]
    B --> E[Show Charts]
    C --> F[Show Action Queue]
```

---

## 6. Analytics Chart Generation Flow

```mermaid
flowchart TD
    A[Filtered Items Change] --> B[useMemo Triggers]
    B --> C[Calculate Risk Distribution]
    C --> D[Group by Risk Level]
    D --> E[Create Pie Chart Data]
    E --> F[Calculate Category Breakdown]
    F --> G[Group by Category]
    G --> H[Sort by Count Descending]
    H --> I[Create Bar Chart Data]
    I --> J[Calculate Value at Risk]
    J --> K[Sum by Risk Level]
    K --> L[Return Chart Data]
```

---

## 7. Action Execution Flow

```mermaid
flowchart TD
    A[User Selects Item] --> B[User Clicks Action]
    B --> C{Action Type?}
    C -->|Transfer| D[Open Transfer Dialog]
    C -->|Promote| E[Open Promotion Dialog]
    C -->|Write Off| F[Open Write-Off Dialog]
    C -->|Hold| G[Update Status to Hold]
    D --> H[Select Destination]
    E --> I[Set Promotion Details]
    F --> J[Enter Reason]
    H --> K[Confirm Transfer]
    I --> L[Confirm Promotion]
    J --> M[Confirm Write-Off]
    K --> N[Create Transfer Request]
    L --> O[Create Promotion]
    M --> P[Create Adjustment]
    G --> Q[Update Item Status]
    N --> Q
    O --> Q
    P --> Q
```

---

## 8. View Mode Switch Flow

```mermaid
flowchart TD
    A[User Clicks View Toggle] --> B{Selected Mode?}
    B -->|List| C[Set viewMode = list]
    B -->|Grouped| D[Set viewMode = grouped]
    C --> E[Render Standard Table]
    D --> F[Group Items by Location]
    F --> G[Calculate Subtotals]
    G --> H[Render Grouped Table]
```

---

## 9. Summary Statistics Update Flow

```mermaid
flowchart TD
    A[Filtered Items Change] --> B[useMemo Triggers]
    B --> C[Count Total Items]
    C --> D[Sum Total Value]
    D --> E[Calculate Avg Days Idle]
    E --> F[Count Critical Risk Items]
    F --> G[Count Transfer Actions]
    G --> H[Count Write-Off Actions]
    H --> I[Return Stats Object]
    I --> J[Update Summary Cards]
```

---

## 10. Permission Check Flow

```mermaid
flowchart TD
    A[Load Slow Moving Page] --> B[Get User Context]
    B --> C{Check Role}
    C -->|System Administrator| D[Access All Items]
    C -->|Other Roles| E[Get availableLocations]
    E --> F[Filter Items by Location]
    F --> G{Item Location Match?}
    G -->|Yes| H[Include Item]
    G -->|No| I[Exclude Item]
    D --> J[Display All Items]
    H --> J
```

---

## 11. Export Flow

```mermaid
flowchart TD
    A[User Clicks Export] --> B[Get Current Filters]
    B --> C[Get Filtered Items]
    C --> D[Prepare Export Data]
    D --> E[Include Summary Stats]
    E --> F[Generate Filename]
    F --> G[Create Export File]
    G --> H[Download File]
```

---

## 12. Grouped View Expand/Collapse Flow

```mermaid
flowchart TD
    A[User Clicks Location Header] --> B[Toggle isExpanded]
    B --> C{isExpanded?}
    C -->|true| D[Show Location Items]
    C -->|false| E[Hide Location Items]
    D --> F[Display Subtotals]
    E --> G[Show Only Summary Row]
```

---

## 13. Risk Distribution Chart Flow

```mermaid
flowchart TD
    A[Prepare Risk Data] --> B[Count Low Risk Items]
    B --> C[Count Medium Risk Items]
    C --> D[Count High Risk Items]
    D --> E[Count Critical Risk Items]
    E --> F[Create Pie Segments]
    F --> G[Assign Colors]
    G --> H[Render PieChart]
    H --> I[Add Tooltips]
    I --> J[Add Legend]
```

---

## 14. Category Breakdown Chart Flow

```mermaid
flowchart TD
    A[Prepare Category Data] --> B[Group Items by Category]
    B --> C[Count per Category]
    C --> D[Sort by Count Descending]
    D --> E[Take Top Categories]
    E --> F[Create Bar Data]
    F --> G[Render BarChart]
    G --> H[Add Tooltips]
    H --> I[Add Labels]
```

---

## 15. Action Center Priority Flow

```mermaid
flowchart TD
    A[Load Action Center] --> B[Get Items with Actions]
    B --> C[Filter Out Hold Items]
    C --> D[Sort by Risk Level]
    D --> E[Within Risk, Sort by Value]
    E --> F[Display Prioritized List]
    F --> G[Show Action Buttons]
```
