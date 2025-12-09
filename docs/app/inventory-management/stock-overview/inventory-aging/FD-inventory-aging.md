# Flow Diagrams: Inventory Aging

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Aging |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. Page Load Flow

```mermaid
flowchart TD
    A[Navigate to Inventory Aging] --> B{User Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Load User Context]
    D --> E[Generate Mock Data]
    E --> F[Calculate Age for Each Item]
    F --> G[Assign Age Buckets]
    G --> H[Calculate Expiry Status]
    H --> I{Is System Admin?}
    I -->|Yes| J[Load All Items]
    I -->|No| K[Filter by availableLocations]
    J --> L[Calculate Statistics]
    K --> L
    L --> M[Calculate Value at Risk]
    M --> N[Generate Chart Data]
    N --> O[Set Loading False]
    O --> P[Render Page]
```

---

## 2. Age Calculation Flow

```mermaid
flowchart TD
    A[Item Data Loaded] --> B[Get Received Date]
    B --> C[Calculate Days Since Receipt]
    C --> D[Store Age Value]
    D --> E{Age Value?}
    E -->|0-30| F[Bucket = 0-30]
    E -->|31-60| G[Bucket = 31-60]
    E -->|61-90| H[Bucket = 61-90]
    E -->|90+| I[Bucket = 90+]
    F --> J[Assign Green Color]
    G --> K[Assign Blue Color]
    H --> L[Assign Amber Color]
    I --> M[Assign Red Color]
```

---

## 3. Expiry Status Calculation Flow

```mermaid
flowchart TD
    A[Item Data Loaded] --> B{Has Expiry Date?}
    B -->|No| C[Status = No Expiry]
    B -->|Yes| D[Calculate Days to Expiry]
    D --> E{Days to Expiry?}
    E -->|< 0| F[Status = Expired]
    E -->|0-14| G[Status = Critical]
    E -->|15-30| H[Status = Expiring Soon]
    E -->|> 30| I[Status = Good]
    C --> J[Store Status]
    F --> J
    G --> J
    H --> J
    I --> J
```

---

## 4. Value at Risk Calculation Flow

```mermaid
flowchart TD
    A[Filtered Items] --> B[Filter Expired Items]
    B --> C[Sum Expired Value]
    C --> D[Filter Critical Items]
    D --> E[Sum Critical Value]
    E --> F[Filter Expiring Soon Items]
    F --> G[Sum Expiring Soon Value]
    G --> H[Calculate Total at Risk]
    H --> I[Return ValueAtRisk Object]
    I --> J[Update UI Panel]
```

---

## 5. Filter Application Flow

```mermaid
flowchart TD
    A[User Changes Filter] --> B{Filter Type?}
    B -->|Search| C[Update searchTerm]
    B -->|Category| D[Update categoryFilter]
    B -->|Age Bucket| E[Update ageBucketFilter]
    B -->|Expiry Status| F[Update expiryStatusFilter]
    B -->|Location| G[Update locationFilter]
    C --> H[Apply All Filters]
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I[Filter Items Array]
    I --> J[Recalculate Statistics]
    J --> K[Recalculate Value at Risk]
    K --> L[Update Chart Data]
    L --> M[Re-render UI]
```

---

## 6. Tab Navigation Flow

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

## 7. Group By Selection Flow

```mermaid
flowchart TD
    A[User Selects Grouped View] --> B[Show GroupBy Dropdown]
    B --> C{Selected Grouping?}
    C -->|Location| D[Call groupByLocation]
    C -->|Age Bucket| E[Call groupByAgeBucket]
    D --> F[Create Location Groups]
    E --> G[Create Age Bucket Groups]
    F --> H[Calculate Subtotals]
    G --> H
    H --> I[Sort Groups]
    I --> J[Render GroupedTable]
```

---

## 8. Group by Location Flow

```mermaid
flowchart TD
    A[Filtered Items] --> B[Create Location Map]
    B --> C[Loop Each Item]
    C --> D[Get Item Location ID]
    D --> E[Add to Location Group]
    E --> F{More Items?}
    F -->|Yes| C
    F -->|No| G[Convert Map to Array]
    G --> H[Calculate Subtotals per Location]
    H --> I[Sort by Location Name]
    I --> J[Return Grouped Array]
```

---

## 9. Group by Age Bucket Flow

```mermaid
flowchart TD
    A[Filtered Items] --> B[Define Bucket Order]
    B --> C[90+ first, then 61-90, 31-60, 0-30]
    C --> D[Create Bucket Map]
    D --> E[Loop Each Item]
    E --> F[Get Item Age Bucket]
    F --> G[Add to Bucket Group]
    G --> H{More Items?}
    H -->|Yes| E
    H -->|No| I[Order Groups by Bucket]
    I --> J[Calculate Subtotals per Bucket]
    J --> K[Return Ordered Groups]
```

---

## 10. Analytics Chart Generation Flow

```mermaid
flowchart TD
    A[Filtered Items Change] --> B[useMemo Triggers]
    B --> C[Calculate Age Distribution]
    C --> D[Count by Age Bucket]
    D --> E[Create Area Chart Data]
    E --> F[Calculate Expiry Distribution]
    F --> G[Count by Expiry Status]
    G --> H[Create Pie Chart Data]
    H --> I[Calculate Category Ages]
    I --> J[Average Age per Category]
    J --> K[Create Bar Chart Data]
    K --> L[Return All Chart Data]
```

---

## 11. Action Center Priority Flow

```mermaid
flowchart TD
    A[Load Action Center] --> B[Get Items with Expiry]
    B --> C[Filter Expired Items]
    C --> D[Sort by Days Past Expiry]
    D --> E[Filter Critical Items]
    E --> F[Sort by Days to Expiry]
    F --> G[Filter Expiring Soon Items]
    G --> H[Sort by Days to Expiry]
    H --> I[Combine in Priority Order]
    I --> J[Display Action Queue]
```

---

## 12. Disposal Action Flow

```mermaid
flowchart TD
    A[User Selects Expired Item] --> B[User Clicks Dispose]
    B --> C[Open Disposal Dialog]
    C --> D[User Enters Reason]
    D --> E[User Selects Method]
    E --> F[User Confirms]
    F --> G[Create Disposal Record]
    G --> H[Update Item Status]
    H --> I[Refresh Data]
    I --> J[Update Statistics]
```

---

## 13. FIFO Transfer Flow

```mermaid
flowchart TD
    A[User Selects Old Item] --> B[User Clicks Transfer]
    B --> C[System Suggests Locations]
    C --> D[User Selects Destination]
    D --> E[User Enters Quantity]
    E --> F[User Confirms Transfer]
    F --> G[Create Transfer Request]
    G --> H[Update Item Location]
    H --> I[Refresh Data]
```

---

## 14. Summary Statistics Update Flow

```mermaid
flowchart TD
    A[Filtered Items Change] --> B[useMemo Triggers]
    B --> C[Count Total Items]
    C --> D[Sum Total Value]
    D --> E[Calculate Avg Age]
    E --> F[Count Near Expiry Items]
    F --> G[Count Expired Items]
    G --> H[Return Stats Object]
    H --> I[Update Summary Cards]
```

---

## 15. Permission Check Flow

```mermaid
flowchart TD
    A[Load Inventory Aging] --> B[Get User Context]
    B --> C{Check Role}
    C -->|System Admin| D[Access All Items]
    C -->|Quality Manager| D
    C -->|Other Roles| E[Get availableLocations]
    E --> F[Filter Items by Location]
    F --> G{Item Location Match?}
    G -->|Yes| H[Include Item]
    G -->|No| I[Exclude Item]
    D --> J[Display All Items]
    H --> J
```

---

## 16. Expiry Status Chart Flow

```mermaid
flowchart TD
    A[Prepare Expiry Data] --> B[Count Good Items]
    B --> C[Count Expiring Soon Items]
    C --> D[Count Critical Items]
    D --> E[Count Expired Items]
    E --> F[Count No Expiry Items]
    F --> G[Create Pie Segments]
    G --> H[Assign Colors]
    H --> I[Render PieChart]
    I --> J[Add Tooltips]
    J --> K[Add Legend]
```
