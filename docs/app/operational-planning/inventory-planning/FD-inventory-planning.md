# Inventory Planning - Flow Diagrams

## Document Information

| Field | Value |
|-------|-------|
| Module | Operational Planning > Inventory Planning |
| Version | 2.0.0 |
| Last Updated | 2025-01-17 |
| Status | Implemented |
| Diagram Format | Mermaid 8.8.2 Compatible |

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-06 | Development Team | Initial documentation |
| 2.0.0 | 2025-01-17 | Development Team | Updated to match actual UI implementation |

---

## 1. Module Navigation Flow

### 1.1 Inventory Planning Navigation

```mermaid
graph TB
    A[Inventory Planning] --> B[Dashboard]
    A --> C[Reorder Management]
    A --> D[Dead Stock Analysis]
    A --> E[Safety Stock]
    A --> F[Multi-Location]
    A --> G[Settings]

    B --> C
    B --> D
    B --> F
    B --> G
    C --> H[Store Operations Stock Replenishment]
    D --> I[Export Dead Stock]
    F --> J[Transfer Recommendations]
```

### 1.2 Cross-Module Navigation

```mermaid
graph TB
    A[Inventory Planning Dashboard] --> B[Demand Forecasting]
    A --> C[Inventory Management]

    D[Reorder Management] --> E[Stock Replenishment]
    D --> F[Procurement]

    G[Dead Stock Analysis] --> H[Inventory Adjustments]
```

---

## 2. Dashboard Flow

### 2.1 Dashboard Load Flow

```mermaid
graph TB
    A[User Opens Dashboard] --> B[Load User Context]
    B --> C[Fetch Dashboard Data]
    C --> D{Data Available?}

    D -->|Yes| E[Calculate KPIs]
    D -->|No| F[Show No Data Message]

    E --> G[Render KPI Cards]
    G --> H[Total Savings Card]
    G --> I[Items at Risk Card]
    G --> J[Optimization Rate Card]
    G --> K[Dead Stock Value Card]

    H --> L[Render Charts]
    I --> L
    J --> L
    K --> L

    L --> M[Optimization Actions Pie Chart]
    L --> N[Location Performance Bar Chart]

    M --> O[Render Alert Summary Grid]
    N --> O

    O --> P[Render Recent Recommendations Table]
    P --> Q[Dashboard Ready]

    F --> R[Show Setup Instructions]
```

### 2.2 Dashboard Interaction Flow

```mermaid
graph TB
    A[Dashboard Displayed] --> B{User Action}

    B -->|Click Location Filter| C[Filter Dashboard Data]
    B -->|Click Alert Category| D[Navigate to Detail Page]
    B -->|Click Quick Action| E[Navigate to Feature Page]
    B -->|Click Recommendation| F[Navigate to Reorder Management]

    C --> G[Refresh Dashboard]
    G --> A

    D -->|Low Stock| H[Reorder Management with filter]
    D -->|Overstock| I[Reorder Management with filter]
    D -->|Dead Stock| J[Dead Stock Analysis]
    D -->|Expiring| K[Inventory Expiring Page]
    D -->|High Value| L[Reorder Management with filter]

    E -->|Optimize Inventory| M[Reorder Management Page]
    E -->|Analyze Dead Stock| N[Dead Stock Analysis Page]
    E -->|Review Locations| O[Multi-Location Page]
    E -->|Configure Settings| P[Settings Page]
```

### 2.3 Quick Actions Flow

```mermaid
graph TB
    A[Quick Actions Section] --> B[Optimize Inventory Button]
    A --> C[Analyze Dead Stock Button]
    A --> D[Review Locations Button]
    A --> E[Configure Settings Button]

    B --> F[/operational-planning/inventory-planning/reorder]
    C --> G[/operational-planning/inventory-planning/dead-stock]
    D --> H[/operational-planning/inventory-planning/locations]
    E --> I[/operational-planning/inventory-planning/settings]
```

---

## 3. Reorder Management Flow

### 3.1 Reorder Recommendations Load Flow

```mermaid
graph TB
    A[User Opens Reorder Page] --> B[Load Mock Data]
    B --> C[Display Summary Cards]

    C --> D[Items Card - Total Count]
    C --> E[Changes Card - Proposed Changes]
    C --> F[Savings Card - Annual Savings]

    D --> G[Load Recommendations Table]
    E --> G
    F --> G

    G --> H[Display Table with Columns]
    H --> I[Product Code and Name]
    H --> J[Location]
    H --> K[Current vs Recommended ROP/EOQ]
    H --> L[Annual Savings]
    H --> M[Risk Level Badge]
    H --> N[Action Type Badge]
```

### 3.2 EOQ Calculation Flow

```mermaid
graph TB
    A[Start EOQ Calculation] --> B[Get Annual Demand D]
    B --> C[Get Order Cost S]
    C --> D[Get Holding Cost H]

    D --> E{All Data Valid?}
    E -->|No| F[Use Default Values]
    E -->|Yes| G[Calculate EOQ]

    F --> G
    G --> H[EOQ = sqrt 2DS/H]
    H --> I{EOQ > Annual Demand?}

    I -->|Yes| J[Cap at Annual Demand]
    I -->|No| K{EOQ < 1?}

    J --> L[Return EOQ]
    K -->|Yes| M[Set EOQ = 1]
    K -->|No| L
    M --> L
```

### 3.3 Reorder Point Calculation Flow

```mermaid
graph TB
    A[Start ROP Calculation] --> B[Get Lead Time LT]
    B --> C[Get Daily Demand DD]
    C --> D[Get Safety Stock SS]

    D --> E[Calculate Base ROP]
    E --> F[ROP = LT x DD + SS]

    F --> G{ROP > Max Stock?}
    G -->|Yes| H[Cap at Max Stock]
    G -->|No| I[Return ROP]
    H --> I
```

### 3.4 Apply Recommendations Flow

```mermaid
graph TB
    A[User Selects Items via Checkbox] --> B[Enable Apply Selected Button]
    B --> C[Click Apply Selected]
    C --> D[Show Confirmation Dialog]

    D --> E{User Confirms?}
    E -->|No| F[Cancel]
    E -->|Yes| G[Validate Selection]

    G --> H{Validation Pass?}
    H -->|No| I[Show Validation Errors]
    H -->|Yes| J[Update Reorder Points]

    J --> K[Update Order Quantities]
    K --> L[Update Safety Stock Values]
    L --> M[Log Audit Trail with Timestamp]
    M --> N[Show Success Message]
    N --> O[Refresh Table with Updated Status]
```

### 3.5 Expandable Row Details Flow

```mermaid
graph TB
    A[User Clicks Table Row] --> B[Toggle Expanded State]
    B --> C{Row Expanded?}

    C -->|Yes| D[Show Expanded Content]
    C -->|No| E[Collapse Row]

    D --> F[Current Metrics Section]
    D --> G[Recommended Changes Section]
    D --> H[Potential Impact Section]

    F --> I[Display ROP, EOQ, Safety Stock]
    F --> J[Display Service Level, Lead Time]

    G --> K[Display Recommended ROP]
    G --> L[Display Recommended EOQ]
    G --> M[Display Recommended Safety Stock]

    H --> N[Display Payback Period]
    H --> O[Display Turnover Rate]
    H --> P[Display Daily Demand]
```

---

## 4. Dead Stock Analysis Flow

### 4.1 Dead Stock Page Load Flow

```mermaid
graph TB
    A[User Opens Dead Stock Page] --> B[Load Mock Dead Stock Data]
    B --> C[Calculate Risk Overview]

    C --> D[Count Critical Items]
    C --> E[Count High Risk Items]
    C --> F[Count Medium Risk Items]
    C --> G[Count Low Risk Items]

    D --> H[Display Risk Overview Cards]
    E --> H
    F --> H
    G --> H

    H --> I[Critical Card - Red]
    H --> J[High Card - Orange]
    H --> K[Medium Card - Yellow]
    H --> L[Low Card - Green]

    I --> M[Load Dead Stock Table]
    J --> M
    K --> M
    L --> M
```

### 4.2 Risk Classification Flow

```mermaid
graph TB
    A[Start Risk Assessment] --> B[Get Days Since Movement]
    B --> C[Get Months of Stock]

    C --> D{Days > 365 OR Months > 24?}
    D -->|Yes| E[Risk = CRITICAL]
    D -->|No| F{Days > 180 OR Months > 12?}

    F -->|Yes| G[Risk = HIGH]
    F -->|No| H{Days > 90 OR Months > 6?}

    H -->|Yes| I[Risk = MEDIUM]
    H -->|No| J[Risk = LOW]

    E --> K[Return Risk Level with Color]
    G --> K
    I --> K
    J --> K
```

### 4.3 Dead Stock Filtering Flow

```mermaid
graph TB
    A[User Applies Filter] --> B{Filter Type}

    B -->|Threshold Days| C[Select 60/90/120/180/365 days]
    B -->|Location| D[Select Location from Dropdown]
    B -->|Risk Level| E[Select Risk Level]

    C --> F[Filter by Days Since Movement]
    D --> G[Filter by Location ID]
    E --> H[Filter by Risk Level]

    F --> I[Apply Combined Filters]
    G --> I
    H --> I

    I --> J[Recalculate Risk Overview]
    J --> K[Update Table Display]
    K --> L[Update Summary Cards]
```

### 4.4 Dead Stock Action Flow

```mermaid
graph TB
    A[User Views Dead Stock Item] --> B[Expand Row]
    B --> C[View Stock Analysis Section]
    B --> D[View Financial Impact Section]

    C --> E[Months of Stock]
    C --> F[Expiry Date if applicable]
    C --> G[Days Until Expiry]

    D --> H[Potential Loss Amount]
    D --> I[Liquidation Value]
    D --> J[Recovery Rate Percent]

    K[Select Action] --> L{Action Type}

    L -->|Liquidate| M[Mark for Sale at Discount]
    L -->|Return| N[Create Return to Supplier]
    L -->|Write Off| O[Create Write Off Entry]
    L -->|Continue| P[Mark as Reviewed]
    L -->|Reduce| Q[Create Stock Reduction Plan]

    M --> R[Update Item Status]
    N --> R
    O --> R
    P --> R
    Q --> R
```

---

## 5. Safety Stock Flow

### 5.1 Safety Stock Page Load Flow

```mermaid
graph TB
    A[User Opens Safety Stock Page] --> B[Load Current Service Level]
    B --> C[Default to 95 Percent Tab]

    C --> D[Load Safety Stock Items]
    D --> E[Calculate Current Safety Stock]
    D --> F[Calculate Recommended for 90 Percent]
    D --> G[Calculate Recommended for 95 Percent]
    D --> H[Calculate Recommended for 99 Percent]

    E --> I[Display Comparison Table]
    F --> I
    G --> I
    H --> I

    I --> J[Render What-If Analysis Chart]
    J --> K[LineChart with Cost vs Service Level]
```

### 5.2 Service Level Selection Flow

```mermaid
graph TB
    A[User Clicks Service Level Tab] --> B{Selected Level}

    B -->|90 Percent| C[Z-Score = 1.28]
    B -->|95 Percent| D[Z-Score = 1.65]
    B -->|99 Percent| E[Z-Score = 2.33]

    C --> F[Recalculate Safety Stock]
    D --> F
    E --> F

    F --> G[Safety Stock = Z x Sigma x sqrt LT]
    G --> H[Update Comparison Table]
    H --> I[Calculate Cost Impact]
    I --> J[Update What-If Chart Highlight]
```

### 5.3 Apply Safety Stock Changes Flow

```mermaid
graph TB
    A[User Reviews Comparison Table] --> B[Select Items via Checkbox]
    B --> C[Click Apply Selected]

    C --> D[Validate Changes]
    D --> E{Changes Valid?}

    E -->|No| F[Show Validation Errors]
    E -->|Yes| G[Calculate Impact Summary]

    G --> H[Show Confirmation Dialog]
    H --> I{User Confirms?}

    I -->|No| J[Cancel]
    I -->|Yes| K[Update Safety Stock Values]

    K --> L[Recalculate Reorder Points]
    L --> M[Log Changes with User and Timestamp]
    M --> N[Show Success Message]
    N --> O[Refresh Table]
```

---

## 6. Multi-Location Flow

### 6.1 Location Performance Load Flow

```mermaid
graph TB
    A[User Opens Multi-Location Page] --> B[Load Location Data]
    B --> C[Calculate Location Metrics]

    C --> D[For Each Location]
    D --> E[Calculate Total Value]
    D --> F[Calculate Turnover Rate]
    D --> G[Count Alert Items]
    D --> H[Determine Status]

    E --> I[Aggregate Results]
    F --> I
    G --> I
    H --> I

    I --> J[Display Location Summary Cards]
    J --> K[Optimal Count Card - Green]
    J --> L[Overstocked Count Card - Yellow]
    J --> M[Understocked Count Card - Red]

    K --> N[Render Location Performance Chart]
    L --> N
    M --> N
```

### 6.2 Location Status Classification Flow

```mermaid
graph TB
    A[Evaluate Location] --> B[Get Efficiency Score]
    B --> C[Get Capacity Utilization]

    C --> D{Utilization < 70 Percent?}
    D -->|Yes| E[Status = UNDERSTOCKED]
    D -->|No| F{Utilization > 90 Percent?}

    F -->|Yes| G[Status = OVERSTOCKED]
    F -->|No| H[Status = OPTIMAL]

    E --> I[Return Status with Color]
    G --> I
    H --> I
```

### 6.3 Transfer Recommendation Flow

```mermaid
graph TB
    A[Analyze Location Imbalances] --> B[Identify Overstocked Locations]
    B --> C[Identify Understocked Locations]

    C --> D{Imbalance Detected?}
    D -->|No| E[No Transfer Needed]
    D -->|Yes| F[Calculate Transfer Quantity]

    F --> G[Determine Priority]
    G --> H{Stock Differential}

    H -->|High| I[Priority = HIGH]
    H -->|Medium| J[Priority = MEDIUM]
    H -->|Low| K[Priority = LOW]

    I --> L[Calculate Estimated Savings]
    J --> L
    K --> L

    L --> M[Create Transfer Recommendation]
    M --> N[Add to Recommendations Table]
```

### 6.4 Create Transfer Flow

```mermaid
graph TB
    A[User Reviews Transfer Recommendation] --> B[Click Create Transfer Button]
    B --> C[Validate Transfer Parameters]

    C --> D{Valid?}
    D -->|No| E[Show Validation Error]
    D -->|Yes| F[Create Transfer Request]

    F --> G[Set Source Location]
    G --> H[Set Destination Location]
    H --> I[Set Quantity and Unit]
    I --> J[Set Priority Level]

    J --> K[Navigate to Stock Transfers]
    K --> L[Pre-fill Transfer Form]
```

---

## 7. Settings Configuration Flow

### 7.1 Settings Page Load Flow

```mermaid
graph TB
    A[User Opens Settings Page] --> B[Load Current Settings]
    B --> C[Display Settings Form]

    C --> D[Default Parameters Section]
    C --> E[Alert Thresholds Section]
    C --> F[Notification Settings Section]
    C --> G[Automation Settings Section]

    D --> H[Service Level Select]
    D --> I[Order Cost Input]
    D --> J[Holding Cost Rate Input]
    D --> K[Default Lead Time Input]

    E --> L[Dead Stock Threshold Input]
    E --> M[Low Stock Alert Switch]
    E --> N[Dead Stock Alert Switch]
    E --> O[Overstock Alert Switch]

    F --> P[Email Notifications Switch]
    F --> Q[Notification Email Input]
    F --> R[Digest Frequency Select]

    G --> S[Auto-Apply Low Risk Switch]
    G --> T[Auto-Generate Weekly Switch]
    G --> U[Sync with Procurement Switch]
```

### 7.2 Save Settings Flow

```mermaid
graph TB
    A[User Modifies Settings] --> B[Click Save Settings]
    B --> C[Validate All Fields]

    C --> D{All Valid?}
    D -->|No| E[Show Validation Errors]
    D -->|Yes| F[Save to Configuration]

    E --> G[Highlight Invalid Fields]
    G --> H[User Corrects Input]
    H --> A

    F --> I[Apply to Future Calculations]
    I --> J[Show Success Toast]
```

### 7.3 Reset to Defaults Flow

```mermaid
graph TB
    A[User Clicks Reset to Defaults] --> B[Show Confirmation Dialog]
    B --> C{User Confirms?}

    C -->|No| D[Cancel]
    C -->|Yes| E[Load Default Values]

    E --> F[Service Level = 95 Percent]
    E --> G[Order Cost = 50 USD]
    E --> H[Holding Cost Rate = 25 Percent]
    E --> I[Lead Time = 7 days]
    E --> J[Dead Stock Threshold = 90 days]

    F --> K[Update Form Fields]
    G --> K
    H --> K
    I --> K
    J --> K

    K --> L[Show Reset Success Message]
```

---

## 8. Integration Flows

### 8.1 Demand Forecasting Integration

```mermaid
graph TB
    A[Inventory Planning Dashboard] --> B[Click Go to Demand Forecasting Link]
    B --> C[Navigate to Demand Forecasting]
    C --> D[Pass Location Context if filtered]

    D --> E[Demand Forecasting Dashboard]
    E --> F[View Forecast Data]
    F --> G[Return to Inventory Planning]
```

### 8.2 Store Operations Integration

```mermaid
graph TB
    A[Reorder Management Page] --> B[Click Stock Replenishment Link]
    B --> C[Navigate to Store Operations]
    C --> D[Stock Replenishment Page]

    D --> E[View Replenishment Needs]
    E --> F[Create Replenishment Request]
```

### 8.3 Inventory Management Integration

```mermaid
graph TB
    A[Apply Optimization Recommendation] --> B[Get Current Item Data]
    B --> C[Calculate New Parameters]

    C --> D[Update Reorder Point]
    C --> E[Update Order Quantity]
    C --> F[Update Safety Stock]

    D --> G[Save Changes to Inventory Item]
    E --> G
    F --> G

    G --> H[Trigger Reorder Check]
    H --> I{Stock Below ROP?}

    I -->|Yes| J[Flag for Replenishment]
    I -->|No| K[Complete Update]
```

---

## 9. Error Handling Flows

### 9.1 Data Load Error Flow

```mermaid
graph TB
    A[Page Load Request] --> B{Data Available?}

    B -->|Yes| C[Render Page Content]
    B -->|No| D{Error Type}

    D -->|No Data| E[Show Empty State]
    D -->|Network Error| F[Show Retry Option]
    D -->|Permission Error| G[Show Access Denied]

    E --> H[Display Setup Instructions]
    F --> I[User Clicks Retry]
    I --> A

    G --> J[Contact Admin Message]
```

### 9.2 Validation Error Flow

```mermaid
graph TB
    A[User Submits Form] --> B[Client-Side Validation]
    B --> C{Valid?}

    C -->|No| D[Show Inline Errors]
    C -->|Yes| E[Submit to Server]

    D --> F[Highlight Invalid Fields]
    F --> G[User Corrects Input]
    G --> A

    E --> H[Server Validation]
    H --> I{Valid?}

    I -->|No| J[Return Error Response]
    I -->|Yes| K[Process Request]

    J --> L[Show Server Errors]
    L --> G
```

---

## 10. State Management Flow

### 10.1 Filter State Flow

```mermaid
graph TB
    A[User Changes Filter] --> B[Update Local State]
    B --> C[Filter Data Array]
    C --> D[Update Displayed Items]
    D --> E[Recalculate Summary Cards]
    E --> F[Re-render Components]
```

### 10.2 Selection State Flow

```mermaid
graph TB
    A[User Clicks Checkbox] --> B[Toggle Item in Selected Set]
    B --> C{Any Items Selected?}

    C -->|Yes| D[Enable Bulk Actions]
    C -->|No| E[Disable Bulk Actions]

    D --> F[Update Action Bar]
    E --> F

    G[User Clicks Select All] --> H[Add All Visible Items to Selection]
    H --> D
```

### 10.3 Expanded Row State Flow

```mermaid
graph TB
    A[User Clicks Row] --> B[Get Row ID]
    B --> C{Already Expanded?}

    C -->|Yes| D[Remove from Expanded Set]
    C -->|No| E[Add to Expanded Set]

    D --> F[Collapse Row UI]
    E --> G[Expand Row UI]
    G --> H[Load Expanded Content]
```

---

**Document End**
