# Flow Diagrams: Slow Moving Inventory

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Slow Moving |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Added alert generation flow; Added aging distribution flow; Added quick actions flow; Updated field names to match code |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Page Load Flow

```mermaid
flowchart TD
    A[Navigate to Slow Moving] --> B{User Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Load User Context]
    D --> E[Set Loading True]
    E --> F[Generate Slow Moving Items]
    F --> G{Is System Admin?}
    G -->|Yes| H[Load All Items]
    G -->|No| I[Filter by availableLocations]
    H --> J[Calculate Summary Statistics]
    I --> J
    J --> K[Generate Alerts]
    K --> L[Prepare Chart Data]
    L --> M[Set Loading False]
    M --> N[Render Page]
```

**Source Evidence**: `slow-moving/page.tsx:54-89`

---

## 2. Risk Level Calculation Flow

```mermaid
flowchart TD
    A[Item Data Loaded] --> B[Get daysSinceMovement]
    B --> C{Days Value?}
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

**Source Evidence**: `slow-moving/page.tsx:294-310`

---

## 3. Alert Generation Flow

```mermaid
flowchart TD
    A[Summary Stats Calculated] --> B{criticalItems > 0?}
    B -->|Yes| C[Add Critical Risk Alert]
    B -->|No| D[Check Write-Off Items]
    C --> D
    D --> E{writeoffItems > 0?}
    E -->|Yes| F[Add Write-Off Warning]
    E -->|No| G[Check 180 Plus Days Items]
    F --> G
    G --> H[Filter daysSinceMovement > 180]
    H --> I{veryOldItems > 0?}
    I -->|Yes| J[Add 180 Plus Days Warning]
    I -->|No| K[Return Alerts Array]
    J --> K
```

**Source Evidence**: `slow-moving/page.tsx:419-444`

---

## 4. Summary Statistics Calculation Flow

```mermaid
flowchart TD
    A[Filtered Items Change] --> B[useMemo Triggers]
    B --> C[Count Total Items]
    C --> D[Sum Total Value]
    D --> E[Calculate Avg Days Since Movement]
    E --> F[Count Items by Risk Level]
    F --> G[Count Items by Suggested Action]
    G --> H[Calculate Critical Value]
    H --> I[Return Stats Object]
    I --> J[Update Summary Cards]
```

**Source Evidence**: `slow-moving/page.tsx:332-362`

---

## 5. Filter Application Flow

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
    H --> I[Filter Items via useMemo]
    I --> J[Recalculate Statistics]
    J --> K[Regenerate Alerts]
    K --> L[Update Chart Data]
    L --> M[Re-render UI]
```

**Source Evidence**: `slow-moving/page.tsx:447-475`

---

## 6. Tab Navigation Flow

```mermaid
flowchart LR
    A[Inventory List Tab] -->|Click Analytics| B[Analytics Tab]
    B -->|Click Action Center| C[Action Center Tab]
    C -->|Click Inventory| A

    A --> D[Show Filter Bar and Table]
    B --> E[Show Charts and Breakdowns]
    C --> F[Show Quick Actions and Recommendations]
```

**Source Evidence**: `slow-moving/page.tsx:662-667`

---

## 7. Analytics Chart Generation Flow

```mermaid
flowchart TD
    A[Analytics Tab Active] --> B[Generate Risk Distribution]
    B --> C[Map Risk Counts to Pie Data]
    C --> D[Assign Colors: Critical Red, High Orange, Medium Yellow, Low Green]

    A --> E[Generate Action Distribution]
    E --> F[Map Action Counts to Pie Data]
    F --> G[Assign Colors: Transfer Blue, Promote Purple, Write Off Red, Hold Gray]

    A --> H[Generate Aging Distribution]
    H --> I[Create Day Buckets: 30-60, 60-90, 90-120, 120-180, 180 Plus]
    I --> J[Calculate Items and Value per Bucket]
    J --> K[Return Composed Chart Data]
```

**Source Evidence**: `slow-moving/page.tsx:365-416`

---

## 8. Category Breakdown Flow

```mermaid
flowchart TD
    A[Filtered Items Change] --> B[Reduce by Category]
    B --> C[For Each Item]
    C --> D[Increment Category Items]
    D --> E[Add to Category Value]
    E --> F[Add to Category Total Days]
    F --> G{More Items?}
    G -->|Yes| C
    G -->|No| H[Calculate Avg Days per Category]
    H --> I[Sort by Value Descending]
    I --> J[Take Top 10]
    J --> K[Return Category Breakdown]
```

**Source Evidence**: `slow-moving/page.tsx:383-391`

---

## 9. Location Breakdown Flow

```mermaid
flowchart TD
    A[Filtered Items Change] --> B[Reduce by Location Name]
    B --> C[For Each Item]
    C --> D[Increment Location Items]
    D --> E[Add to Location Value]
    E --> F{Is Critical Risk?}
    F -->|Yes| G[Increment Critical Count]
    F -->|No| H[Continue]
    G --> H
    H --> I{More Items?}
    I -->|Yes| C
    I -->|No| J[Sort by Value Descending]
    J --> K[Return Location Breakdown]
```

**Source Evidence**: `slow-moving/page.tsx:394-402`

---

## 10. Quick Actions Flow

```mermaid
flowchart TD
    A[Action Center Tab Active] --> B[Display Quick Actions]
    B --> C[Bulk Transfer Button]
    B --> D[Create Promotion Button]
    B --> E[Request Write-Off Button]
    B --> F[Export Report Button]

    C --> G{Button Clicked?}
    G -->|Yes| H[Open Transfer Workflow]

    D --> I{Button Clicked?}
    I -->|Yes| J[Open Promotion Workflow]

    E --> K{Button Clicked?}
    K -->|Yes| L[Open Write-Off Workflow]

    F --> M{Button Clicked?}
    M -->|Yes| N[Generate and Download Report]
```

**Source Evidence**: `slow-moving/page.tsx:1141-1163`

---

## 11. Recommended Actions by Risk Flow

```mermaid
flowchart TD
    A[Action Center Tab Active] --> B{Critical Items Exist?}
    B -->|Yes| C[Display Critical Risk Section]
    C --> D[Red Border Card]
    D --> E[Show Top 5 Critical Items]
    E --> F[Display Action Badges]

    B -->|No| G{High Risk Items Exist?}
    F --> G
    G -->|Yes| H[Display High Risk Section]
    H --> I[Orange Border Card]
    I --> J[Show Top 5 High Risk Items]
    J --> K[Display Action Badges]

    G -->|No| L[Show Empty State]
    K --> L
```

**Source Evidence**: `slow-moving/page.tsx:1168-1238`

---

## 12. View Mode Switch Flow

```mermaid
flowchart TD
    A[User Clicks View Toggle] --> B{Selected Mode?}
    B -->|List| C[Set viewMode = list]
    B -->|Grouped| D[Set viewMode = grouped]
    C --> E[Render Standard Table]
    D --> F[Group Items by Location]
    F --> G[Calculate Subtotals per Group]
    G --> H[Render Grouped Table with Expand/Collapse]
```

**Source Evidence**: `slow-moving/page.tsx:672-694`

---

## 13. Permission Check Flow

```mermaid
flowchart TD
    A[Load Slow Moving Page] --> B[Get User Context]
    B --> C{Check Role}
    C -->|System Administrator| D[Access All Items]
    C -->|Other Roles| E[Get availableLocations]
    E --> F[Filter Items by Location]
    F --> G{Item LocationId in Available?}
    G -->|Yes| H[Include Item]
    G -->|No| I[Exclude Item]
    D --> J[Display All Items]
    H --> J
```

---

## 14. Export Flow

```mermaid
flowchart TD
    A[User Clicks Export] --> B[Get Current Filters]
    B --> C[Get Filtered Items]
    C --> D[Prepare Export Data]
    D --> E[Include All Item Fields]
    E --> F[Generate Filename with Date]
    F --> G[Create Export File]
    G --> H[Trigger Download]
```

---

## 15. Grouped View Expand/Collapse Flow

```mermaid
flowchart TD
    A[User Clicks Location Header] --> B[Toggle isExpanded]
    B --> C{isExpanded?}
    C -->|true| D[Show Location Items]
    C -->|false| E[Hide Location Items]
    D --> F[Display Item Rows]
    E --> G[Show Only Header with Subtotals]
    F --> H[Show Subtotals: Items, Value, Avg Days, Critical]
    G --> H
```

---

## 16. Risk Distribution Chart Render Flow

```mermaid
flowchart TD
    A[Risk Distribution Data Ready] --> B[Create PieChart]
    B --> C[Add Pie with Inner/Outer Radius]
    C --> D[Map Data to Cells]
    D --> E[Assign Colors per Risk Level]
    E --> F[Add Labels with Percentages]
    F --> G[Add Tooltips]
    G --> H[Add Legend]
    H --> I[Render Chart]
```

**Source Evidence**: `slow-moving/page.tsx:964-995`

---

## 17. Aging Distribution Chart Render Flow

```mermaid
flowchart TD
    A[Aging Data Ready] --> B[Create ComposedChart]
    B --> C[Add XAxis with Day Ranges]
    C --> D[Add YAxis for Items]
    D --> E[Add Secondary YAxis for Value]
    E --> F[Add Bar for Item Counts]
    F --> G[Add Line for Values]
    G --> H[Add Tooltips]
    H --> I[Render Chart]
```

**Source Evidence**: `slow-moving/page.tsx:1033-1061`

---

## 18. Action Summary Cards Flow

```mermaid
flowchart TD
    A[Action Center Tab Active] --> B[Get Action Counts from Stats]
    B --> C[Display Transfer Card - Blue]
    B --> D[Display Promote Card - Purple]
    B --> E[Display Write Off Card - Red]
    B --> F[Display Hold Card - Gray]
    C --> G[Show Count and Label]
    D --> G
    E --> G
    F --> G
```

**Source Evidence**: `slow-moving/page.tsx:1241-1285`

---

## Related Documents

- [BR-slow-moving.md](./BR-slow-moving.md) - Business Requirements
- [TS-slow-moving.md](./TS-slow-moving.md) - Technical Specification
- [UC-slow-moving.md](./UC-slow-moving.md) - Use Cases
- [VAL-slow-moving.md](./VAL-slow-moving.md) - Validations
