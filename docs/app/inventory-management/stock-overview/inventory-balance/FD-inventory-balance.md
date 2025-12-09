# Flow Diagrams: Inventory Balance

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Balance |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

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
    H --> I[Recalculate Totals]
    I --> J[Generate Chart Data]
    J --> K[Generate Trend Data]
    K --> L[Set Loading False]
    L --> M[Render Page]
    M --> N[Display Summary Cards]
    N --> O[Display Filter Panel]
    O --> P[Display Balance Table]
```

---

## 2. Filter Application Flow

```mermaid
flowchart TD
    A[User Changes Filter] --> B[Update Params State]
    B --> C[Set Loading True]
    C --> D{Which Filter?}
    D -->|Location| E[Validate Location Range]
    D -->|Category| F[Validate Category Range]
    D -->|Product| G[Validate Product Range]
    D -->|As-of Date| H[Validate Date]
    E --> I[Add location to activeFilters]
    F --> J[Add category to activeFilters]
    G --> K[Add product to activeFilters]
    H --> L[Update asOfDate param]
    I --> M[Apply All Filters]
    J --> M
    K --> M
    L --> M
    M --> N[Reload Balance Data]
    N --> O[Recalculate Totals]
    O --> P[Recalculate Charts]
    P --> Q[Set Loading False]
    Q --> R[Update UI]
```

---

## 3. Filter Removal Flow

```mermaid
flowchart TD
    A[User Clicks X on Badge] --> B{Which Filter?}
    B -->|location| C[Clear locationRange]
    B -->|category| D[Clear categoryRange]
    B -->|product| E[Clear productRange]
    C --> F[Remove from activeFilters]
    D --> F
    E --> F
    F --> G[Trigger Filter Change]
    G --> H[Reload Data]
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
    I --> K{Show Lots Enabled?}
    K -->|Yes| L[User Clicks Product Row]
    L --> M[Show Lot Details]
    K -->|No| N[End at Product Level]
```

---

## 5. View Type Change Flow

```mermaid
flowchart TD
    A[User Clicks View Selector] --> B{Selected View?}
    B -->|PRODUCT| C[Set viewType = PRODUCT]
    B -->|CATEGORY| D[Set viewType = CATEGORY]
    B -->|LOT| E[Set viewType = LOT]
    C --> F[Reorganize Table Display]
    D --> F
    E --> F
    F --> G[Update Aggregation Level]
    G --> H[Re-render Balance Table]
```

---

## 6. Show Lots Toggle Flow

```mermaid
flowchart TD
    A[User Toggles Show Lots] --> B{Current State?}
    B -->|Off| C[Enable Lot Display]
    B -->|On| D[Disable Lot Display]
    C --> E[Set showLots = true]
    D --> F[Set showLots = false]
    E --> G[Add Lot Column to Table]
    F --> H[Remove Lot Column]
    G --> I[Expand Products to Show Lots]
    H --> J[Collapse to Product Level]
```

---

## 7. Tab Navigation Flow

```mermaid
flowchart LR
    A[Balance Report Tab] -->|Click Analytics| B[Analytics Tab]
    B -->|Click Movement| C[Movement History Tab]
    C -->|Click Insights| D[Insights Tab]
    D -->|Click Balance| A

    A --> E[Show BalanceTable]
    B --> F[Show Charts]
    C --> G[Show MovementHistory]
    D --> H[Show Insights Panel]
```

---

## 8. Chart Data Calculation Flow

```mermaid
flowchart TD
    A[Report Data Changes] --> B[useMemo Triggers]
    B --> C[Calculate categoryData]
    C --> D[Aggregate by Category Name]
    D --> E[Sum Quantities and Values]
    E --> F[Sort by Value Descending]
    F --> G[Calculate locationData]
    G --> H[Sum per Location]
    H --> I[Sort by Value Descending]
    I --> J[Find lowStockItems]
    J --> K[Filter qty < 20]
    K --> L[Take Top 5]
    L --> M[Find highValueItems]
    M --> N[Sort All by Value]
    N --> O[Take Top 5]
    O --> P[Return Chart Data Object]
```

---

## 9. Export Flow

```mermaid
flowchart TD
    A[User Clicks Export] --> B[Get Current Filter State]
    B --> C[Get Filtered Balance Data]
    C --> D[Generate File Headers]
    D --> E[Map Data to Rows]
    E --> F[Generate Filename with Date]
    F --> G[Create Blob]
    G --> H[Create Download Link]
    H --> I[Trigger Download]
    I --> J[Cleanup Link]
```

---

## 10. Permission Check Flow

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

## 11. Low Stock Alert Flow

```mermaid
flowchart TD
    A[Data Loaded] --> B[Calculate Low Stock Items]
    B --> C{Count > 0?}
    C -->|Yes| D[Display Alert Banner]
    C -->|No| E[Hide Alert Banner]
    D --> F[Show Item Count]
    F --> G[User Clicks View Items]
    G --> H[Navigate to Insights Tab]
    H --> I[Focus Low Stock Table]
```

---

## 12. Trend Data Generation Flow

```mermaid
flowchart TD
    A[Page Initialize] --> B[Generate 6 Month Labels]
    B --> C[Loop Each Month]
    C --> D[Generate Random Value]
    D --> E[Generate Random Quantity]
    E --> F[Create Data Point]
    F --> G{More Months?}
    G -->|Yes| C
    G -->|No| H[Return Trend Array]
    H --> I[Store in State]
    I --> J[Render Area Chart]
```

---

## 13. Location Performance Calculation

```mermaid
flowchart TD
    A[Get Chart Data] --> B[Get locationData Array]
    B --> C[Get Total Report Value]
    C --> D[Loop Each Location]
    D --> E[Calculate Items Count]
    E --> F[Calculate Total Value]
    F --> G[Calculate Average Value]
    G --> H[Calculate Percentage of Total]
    H --> I{More Locations?}
    I -->|Yes| D
    I -->|No| J[Render Performance Table]
    J --> K[Show Progress Bars]
```

---

## 14. Insights Navigation Flow

```mermaid
flowchart TD
    A[View Insights Tab] --> B[Display High Value Items]
    B --> C[Display Low Stock Items]
    C --> D[Display Location Performance]
    D --> E[User Clicks Item Row]
    E --> F{Item Type?}
    F -->|High Value| G[Navigate to Stock Card]
    F -->|Low Stock| H[Navigate to Stock Card]
    G --> I[Load Product Detail]
    H --> I
```
