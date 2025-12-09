# Flow Diagrams: Stock Cards

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Stock Cards |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. Page Load Flow

```mermaid
flowchart TD
    A[Navigate to Stock Cards] --> B{User Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Load User Context]
    D --> E[Generate Mock Products]
    E --> F{Is System Admin?}
    F -->|Yes| G[Load All Products]
    F -->|No| H[Filter by availableLocations]
    G --> I[Calculate Summary Stats]
    H --> I
    I --> J[Group Products by Location]
    J --> K[Set Loading False]
    K --> L[Render Default List View]
```

---

## 2. View Mode Switch Flow

```mermaid
flowchart TD
    A[User Clicks View Toggle] --> B{Selected Mode?}
    B -->|List| C[Set viewMode = list]
    B -->|Cards| D[Set viewMode = cards]
    B -->|Grouped| E[Set viewMode = grouped]
    C --> F[Render List View]
    D --> G[Render Cards View]
    E --> H[Update Grouped Data]
    H --> I[Render Grouped View]
```

---

## 3. Filter Application Flow

```mermaid
flowchart TD
    A[User Changes Filter] --> B{Filter Type?}
    B -->|Search| C[Update searchTerm]
    B -->|Category| D[Update categoryFilter]
    B -->|Status| E[Update statusFilter]
    B -->|Stock Level| F[Update stockFilter]
    C --> G[Apply All Filters]
    D --> G
    E --> G
    F --> G
    G --> H[Filter Products Array]
    H --> I[Recalculate Summary]
    I --> J[Update Grouped Data]
    J --> K[Re-render Current View]
```

---

## 4. Sort Flow

```mermaid
flowchart TD
    A[User Clicks Column Header] --> B{Same Column?}
    B -->|Yes| C{Current Direction?}
    B -->|No| D[Set New Field, ASC]
    C -->|ASC| E[Toggle to DESC]
    C -->|DESC| F[Toggle to ASC]
    D --> G[Apply Sort]
    E --> G
    F --> G
    G --> H[Update Sort Indicator]
    H --> I[Re-render Table]
```

---

## 5. Product Navigation Flow

```mermaid
flowchart TD
    A[User Clicks Product] --> B{Current View?}
    B -->|List| C[Click Table Row]
    B -->|Cards| D[Click Card]
    B -->|Grouped| E[Click Row in Group]
    C --> F[Get Product ID]
    D --> F
    E --> F
    F --> G[Router.push to Stock Card]
    G --> H[Load Stock Card Detail]
```

---

## 6. Grouped View Expand/Collapse Flow

```mermaid
flowchart TD
    A[User Clicks Group Header] --> B[Toggle isExpanded]
    B --> C{isExpanded?}
    C -->|true| D[Show Group Items]
    C -->|false| E[Hide Group Items]
    D --> F[Display Subtotals]
    E --> G[Show Only Summary Row]
```

---

## 7. Expand All / Collapse All Flow

```mermaid
flowchart TD
    A[User Clicks Expand All] --> B[Set All Groups Expanded]
    B --> C[Update Groups State]
    C --> D[Re-render All Groups Open]

    E[User Clicks Collapse All] --> F[Set All Groups Collapsed]
    F --> G[Update Groups State]
    G --> H[Re-render All Groups Closed]
```

---

## 8. Summary Statistics Calculation Flow

```mermaid
flowchart TD
    A[Filtered Products Change] --> B[useMemo Triggers]
    B --> C[Count Total Products]
    C --> D[Count Active Products]
    D --> E[Sum Total Value]
    E --> F[Sum Total Stock]
    F --> G[Count Low Stock]
    G --> H[Count High Stock]
    H --> I[Count Normal Stock]
    I --> J[Calculate Average]
    J --> K[Aggregate by Category]
    K --> L[Return Stats Object]
```

---

## 9. Stock Level Badge Flow

```mermaid
flowchart TD
    A[Render Stock Level] --> B{Current Stock?}
    B -->|<= Minimum| C[Return Red Low Badge]
    B -->|>= Maximum| D[Return Amber High Badge]
    B -->|Between| E[Return Green Normal Badge]
```

---

## 10. Export Flow

```mermaid
flowchart TD
    A[User Clicks Export] --> B[Prepare Export Data]
    B --> C{View Mode?}
    C -->|List| D[Export Flat Data]
    C -->|Grouped| E[Export Grouped Data]
    D --> F[Create Export Object]
    E --> G[Include Subtotals]
    G --> F
    F --> H[Generate Filename]
    H --> I[Download File]
```

---

## 11. Permission Check Flow

```mermaid
flowchart TD
    A[Load Products] --> B[Get User Context]
    B --> C{Check Role}
    C -->|System Administrator| D[Access All Products]
    C -->|Other Roles| E[Get availableLocations]
    E --> F[Filter Products by Location]
    F --> G{Product Has Location?}
    G -->|Yes| H[Include Product]
    G -->|No| I[Exclude Product]
    D --> J[Display All Products]
    H --> J
```

---

## 12. Cards View Render Flow

```mermaid
flowchart TD
    A[Render Cards View] --> B[Map Filtered Products]
    B --> C[Calculate Stock Percentage]
    C --> D[Determine Stock Level]
    D --> E[Set Border Color]
    E --> F[Render Card]
    F --> G[Display Code Badge]
    G --> H[Display Status Badge]
    H --> I[Display Progress Bar]
    I --> J[Display Value & Locations]
    J --> K{More Products?}
    K -->|Yes| C
    K -->|No| L[Complete Grid]
```

---

## 13. Grouped View Render Flow

```mermaid
flowchart TD
    A[Render Grouped View] --> B[Get Groups from Hook]
    B --> C[Render GroupedTable Component]
    C --> D[Map Groups]
    D --> E[Render Group Header]
    E --> F{Is Expanded?}
    F -->|Yes| G[Render Items]
    F -->|No| H[Skip Items]
    G --> I[Render Subtotals Row]
    H --> I
    I --> J{More Groups?}
    J -->|Yes| D
    J -->|No| K[Render Grand Totals]
```

---

## 14. Group Products by Location Flow

```mermaid
flowchart TD
    A[Products Array] --> B[Create Location Map]
    B --> C[Loop Each Product]
    C --> D[Loop Each Location]
    D --> E[Add to Location Map]
    E --> F{More Locations?}
    F -->|Yes| D
    F -->|No| G{More Products?}
    G -->|Yes| C
    G -->|No| H[Convert Map to Array]
    H --> I[Calculate Subtotals]
    I --> J[Sort by Location Name]
    J --> K[Return Grouped Array]
```

---

## 15. Filter Update Effect Flow

```mermaid
flowchart TD
    A[Filter State Changes] --> B[useEffect Triggers]
    B --> C{Products Exist?}
    C -->|No| D[Skip Update]
    C -->|Yes| E[Get Filtered Products]
    E --> F[Group by Location]
    F --> G[Update groupedProducts State]
    G --> H[Update groups via Hook]
```
