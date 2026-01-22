# Flow Diagrams: Inventory Aging

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Aging |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated expiry thresholds (30/90 days); Added alert generation flow; Added expiry timeline flow; Added location aging performance flow; Added oldest items flow; Updated color assignments |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Page Load Flow

```mermaid
graph TD
    A[Navigate to Inventory Aging] --> B{User Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Load User Context]
    D --> E[Set Loading True]
    E --> F[Generate Mock Data]
    F --> G[Calculate Age for Each Item]
    G --> H[Assign Age Buckets]
    H --> I[Calculate Expiry Status]
    I --> J{Is System Admin?}
    J -->|Yes| K[Load All Items]
    J -->|No| L[Filter by availableLocations]
    K --> M[Calculate Statistics]
    L --> M
    M --> N[Calculate Value at Risk]
    N --> O[Generate Alerts]
    O --> P[Generate Chart Data]
    P --> Q[Set Loading False]
    Q --> R[Render Page]
```

**Source Evidence**: `inventory-aging/page.tsx:84-120`

---

## 2. Age Calculation Flow

```mermaid
graph TD
    A[Item Data Loaded] --> B[Get Received Date]
    B --> C[Calculate Days Since Receipt]
    C --> D[Store ageInDays Value]
    D --> E{ageInDays Value?}
    E -->|0-30| F[Bucket = 0-30]
    E -->|31-60| G[Bucket = 31-60]
    E -->|61-90| H[Bucket = 61-90]
    E -->|90+| I[Bucket = 90+]
    F --> J[Assign Green Color]
    G --> K[Assign Yellow Color]
    H --> L[Assign Orange Color]
    I --> M[Assign Red Color - Destructive]
```

**Source Evidence**: `inventory-aging/page.tsx:281-296`

---

## 3. Expiry Status Calculation Flow

```mermaid
graph TD
    A[Item Data Loaded] --> B{Has Expiry Date?}
    B -->|No| C[Status = no-expiry]
    B -->|Yes| D[Calculate Days to Expiry]
    D --> E{daysToExpiry Value?}
    E -->|Less than 0| F[Status = expired]
    E -->|0 to 29| G[Status = critical]
    E -->|30 to 89| H[Status = expiring-soon]
    E -->|90 or more| I[Status = good]
    C --> J[Gray Badge - Secondary]
    F --> K[Red Badge - Destructive]
    G --> L[Orange Badge - Destructive]
    H --> M[Yellow Badge - Outline]
    I --> N[Green Badge - Outline]
```

**Source Evidence**: `inventory-aging/page.tsx:129-136`

---

## 4. Alert Generation Flow

```mermaid
graph TD
    A[Filtered Items Calculated] --> B[Check Expired Count]
    B --> C{expiredItems > 0?}
    C -->|Yes| D[Create Expired Alert]
    D --> E[Set Type = destructive]
    C -->|No| F[Skip Expired Alert]
    F --> G[Check Near Expiry Count]
    E --> G
    G --> H{nearExpiryItems > 0?}
    H -->|Yes| I[Create Near Expiry Alert]
    I --> J[Set Type = warning]
    H -->|No| K[Skip Near Expiry Alert]
    J --> L[Render Alert Section]
    K --> L
```

**Source Evidence**: `inventory-aging/page.tsx:694-718`

---

## 5. Value at Risk Calculation Flow

```mermaid
graph TD
    A[Filtered Items] --> B[Filter Expired Items]
    B --> C[Sum Expired Value]
    C --> D[Filter Critical Items]
    D --> E[Sum Critical Value]
    E --> F[Filter Expiring Soon Items]
    F --> G[Sum Expiring Soon Value]
    G --> H[Calculate Total at Risk]
    H --> I[Return ValueAtRisk Object]
    I --> J[Update Summary Card]
    J --> K[Update Action Center Panel]
```

**Source Evidence**: `inventory-aging/page.tsx:503-517`

---

## 6. Filter Application Flow

```mermaid
graph TD
    A[User Changes Filter] --> B{Filter Type?}
    B -->|Search| C[Update searchTerm]
    B -->|Category| D[Update categoryFilter]
    B -->|Age Bucket| E[Update ageBucketFilter]
    B -->|Expiry Status| F[Update expiryStatusFilter]
    B -->|Location| G[Update locationFilter]
    C --> H[Apply All Filters via useMemo]
    D --> H
    E --> H
    F --> H
    G --> H
    H --> I[Filter Items Array]
    I --> J[Recalculate Statistics]
    J --> K[Recalculate Value at Risk]
    K --> L[Regenerate Alerts]
    L --> M[Update Chart Data]
    M --> N[Re-render UI]
```

**Source Evidence**: `inventory-aging/page.tsx:820-903`

---

## 7. Tab Navigation Flow

```mermaid
graph LR
    A[Inventory List Tab] -->|Click Analytics| B[Analytics Tab]
    B -->|Click Action Center| C[Action Center Tab]
    C -->|Click Inventory| A

    A --> D[Show Item Table with Filters]
    B --> E[Show 5 Chart Components]
    C --> F[Show Action Queue and Recommendations]
```

**Source Evidence**: `inventory-aging/page.tsx:807-813`

---

## 8. Group By Selection Flow

```mermaid
graph TD
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

**Source Evidence**: `inventory-aging/page.tsx:854-862`

---

## 9. Group by Location Flow

```mermaid
graph TD
    A[Filtered Items] --> B[Create Location Map]
    B --> C[Loop Each Item]
    C --> D[Get Item locationId]
    D --> E[Add to Location Group]
    E --> F{More Items?}
    F -->|Yes| C
    F -->|No| G[Convert Map to Array]
    G --> H[Calculate Subtotals per Location]
    H --> I[Sort by Location Name]
    I --> J[Return Grouped Array]
```

---

## 10. Group by Age Bucket Flow

```mermaid
graph TD
    A[Filtered Items] --> B[Define Bucket Order]
    B --> C[90+ first - then 61-90 - 31-60 - 0-30]
    C --> D[Create Bucket Map]
    D --> E[Loop Each Item]
    E --> F[Get Item ageBucket]
    F --> G[Add to Bucket Group]
    G --> H{More Items?}
    H -->|Yes| E
    H -->|No| I[Order Groups by Bucket Priority]
    I --> J[Calculate Subtotals per Bucket]
    J --> K[Return Ordered Groups]
```

---

## 11. Expiry Timeline Chart Flow

```mermaid
graph TD
    A[Filtered Items with Expiry] --> B[Filter Items with expiryDate]
    B --> C[Get Current Date]
    C --> D[Calculate 12 Week Ranges]
    D --> E[Loop Each Item]
    E --> F[Determine Target Week]
    F --> G[Add to Week Bucket]
    G --> H{More Items?}
    H -->|Yes| E
    H -->|No| I[Calculate Items per Week]
    I --> J[Calculate Value per Week]
    J --> K[Create ComposedChart Data]
    K --> L[Render Bar for Items]
    L --> M[Render Line for Value]
```

**Source Evidence**: `inventory-aging/page.tsx:1124-1156`

---

## 12. Age Bucket Distribution Chart Flow

```mermaid
graph TD
    A[Filtered Items] --> B[Group by ageBucket]
    B --> C[Count Items in 0-30]
    C --> D[Count Items in 31-60]
    D --> E[Count Items in 61-90]
    E --> F[Count Items in 90+]
    F --> G[Calculate Percentages]
    G --> H[Assign Colors]
    H --> I[Create PieChart Data]
    I --> J[Render Inner/Outer Radius]
    J --> K[Add Labels with Percentages]
    K --> L[Add Tooltips]
```

**Source Evidence**: `inventory-aging/page.tsx:1159-1203`

---

## 13. Expiry Status Distribution Chart Flow

```mermaid
graph TD
    A[Filtered Items] --> B[Count Good Items]
    B --> C[Count Expiring Soon Items]
    C --> D[Count Critical Items]
    D --> E[Count Expired Items]
    E --> F[Count No Expiry Items]
    F --> G[Create Horizontal Bar Data]
    G --> H[Assign Status Colors]
    H --> I[Render Horizontal BarChart]
    I --> J[Add Tooltips]
```

**Source Evidence**: `inventory-aging/page.tsx:1205-1241`

---

## 14. Location Aging Performance Chart Flow

```mermaid
graph TD
    A[Filtered Items] --> B[Group by locationId]
    B --> C[Loop Each Location]
    C --> D[Calculate Average Age]
    D --> E[Count At-Risk Items]
    E --> F[Sum Total Value]
    F --> G{More Locations?}
    G -->|Yes| C
    G -->|No| H[Create ComposedChart Data]
    H --> I[Render Bar for Avg Age - Orange]
    I --> J[Render Bar for At-Risk Items - Red]
    J --> K[Render Line for Total Value - Blue]
```

**Source Evidence**: `inventory-aging/page.tsx:1244-1278`

---

## 15. Category Aging Analysis Flow

```mermaid
graph TD
    A[Filtered Items] --> B[Group by category]
    B --> C[Loop Each Category]
    C --> D[Count Total Items]
    D --> E[Calculate Average Age]
    E --> F[Sum Total Value]
    F --> G[Sum Expired Value]
    G --> H[Calculate Age Distribution]
    H --> I{More Categories?}
    I -->|Yes| C
    I -->|No| J[Sort by Average Age Descending]
    J --> K[Create Table Data]
    K --> L[Render Progress Bars for Distribution]
```

**Source Evidence**: `inventory-aging/page.tsx:1281-1323`

---

## 16. Action Center Value at Risk Panel Flow

```mermaid
graph TD
    A[Load Action Center Tab] --> B[Get Value at Risk Data]
    B --> C[Display Already Expired Value]
    C --> D[Add Critical Badge]
    D --> E[Display Expiring Under 30 Days Value]
    E --> F[Add Urgent Badge]
    F --> G[Display Expiring 30-90 Days Value]
    G --> H[Add Monitor Badge]
    H --> I[Calculate Total at Risk]
    I --> J[Display Total Summary]
```

**Source Evidence**: `inventory-aging/page.tsx:1329-1367`

---

## 17. Critical Items List Flow

```mermaid
graph TD
    A[Load Action Center] --> B[Get Items with Expiry Status]
    B --> C[Filter Expired Items]
    C --> D[Filter Critical Items]
    D --> E[Combine Expired + Critical]
    E --> F[Sort by Expiry Date Ascending]
    F --> G[Take Top 10 Items]
    G --> H[Render Item Cards]
    H --> I{Item Status?}
    I -->|Expired| J[Show Dispose Button]
    I -->|Critical| K[Show Use/Transfer Buttons]
```

**Source Evidence**: `inventory-aging/page.tsx:1369-1440`

---

## 18. Oldest Items List Flow

```mermaid
graph TD
    A[Load Action Center] --> B[Get All Filtered Items]
    B --> C[Sort by ageInDays Descending]
    C --> D[Take Top 10 Items]
    D --> E[Render Item Cards]
    E --> F[Show Age in Days]
    F --> G[Show Age Bucket Badge]
    G --> H[Show Action Button]
```

**Source Evidence**: `inventory-aging/page.tsx:1442-1482`

---

## 19. Recommended Actions Flow

```mermaid
graph TD
    A[Load Action Center] --> B{expiredItems > 0?}
    B -->|Yes| C[Show Dispose Expired Recommendation]
    C --> D[Link to Create Disposal Record]
    B -->|No| E[Skip Dispose Recommendation]
    E --> F{nearExpiryItems > 0?}
    D --> F
    F -->|Yes| G[Show Prioritize Usage Recommendation]
    G --> H[Link to View Menu Suggestions]
    F -->|No| I[Skip Usage Recommendation]
    I --> J[Calculate Location Avg Ages]
    H --> J
    J --> K{Any Location avgAge > 45?}
    K -->|Yes| L[Show Rebalance Stock Recommendation]
    L --> M[Link to Plan Stock Transfers]
    K -->|No| N[Skip Rebalance Recommendation]
```

**Source Evidence**: `inventory-aging/page.tsx:1484-1538`

---

## 20. Disposal Action Flow

```mermaid
graph TD
    A[User Selects Expired Item] --> B[User Clicks Dispose]
    B --> C[Open Disposal Dialog]
    C --> D[User Enters Disposal Reason]
    D --> E[User Selects Disposal Method]
    E --> F[User Confirms Disposal]
    F --> G[Create Disposal Record]
    G --> H[Update Item Status]
    H --> I[Refresh Aging Data]
    I --> J[Update Statistics]
    J --> K[Update Alerts]
```

---

## 21. FIFO Transfer Flow

```mermaid
graph TD
    A[User Selects Old Item from 90+ Bucket] --> B[User Clicks Transfer]
    B --> C[System Suggests High-Demand Locations]
    C --> D[User Selects Destination Location]
    D --> E[User Enters Transfer Quantity]
    E --> F[User Confirms Transfer]
    F --> G[Create Transfer Request]
    G --> H[Update Item Location]
    H --> I[Refresh Aging Data]
    I --> J[Recalculate Location Statistics]
```

---

## 22. Summary Statistics Update Flow

```mermaid
graph TD
    A[Filtered Items Change] --> B[useMemo Triggers]
    B --> C[Count Total Items]
    C --> D[Sum Total Value]
    D --> E[Calculate Average Age]
    E --> F[Count Near Expiry Items]
    F --> G[Count Expired Items]
    G --> H[Calculate Value at Risk]
    H --> I[Return Stats Object]
    I --> J[Update 6 Summary Cards]
```

**Source Evidence**: `inventory-aging/page.tsx:720-805`

---

## 23. Permission Check Flow

```mermaid
graph TD
    A[Load Inventory Aging] --> B[Get User Context]
    B --> C{Check User Role}
    C -->|System Administrator| D[Access All Items]
    C -->|Quality Manager| E[Get availableLocations]
    C -->|Inventory Manager| E
    C -->|Storekeeper| E
    C -->|Other Roles| E
    E --> F[Filter Items by locationId]
    F --> G{Item locationId in availableLocations?}
    G -->|Yes| H[Include Item]
    G -->|No| I[Exclude Item]
    D --> J[Display All Items]
    H --> J
```

**Source Evidence**: `inventory-aging/page.tsx:84-120`

---

## Related Documents

- [BR-inventory-aging.md](./BR-inventory-aging.md) - Business Requirements
- [TS-inventory-aging.md](./TS-inventory-aging.md) - Technical Specification
- [UC-inventory-aging.md](./UC-inventory-aging.md) - Use Cases
- [VAL-inventory-aging.md](./VAL-inventory-aging.md) - Validations
