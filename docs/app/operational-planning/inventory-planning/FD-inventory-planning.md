# Inventory Planning - Flow Diagrams

## Document Information

| Field | Value |
|-------|-------|
| Module | Inventory Planning |
| Version | 1.0.0 |
| Last Updated | 2025-12-06 |
| Status | Draft |
| Diagram Format | Mermaid 8.8.2 Compatible |

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
    C --> E
    D --> H[Item Detail]
    F --> I[Transfer Request]
```

---

## 2. Dashboard Flow

### 2.1 Dashboard Load Flow

```mermaid
graph TB
    A[User Opens Dashboard] --> B[Load User Context]
    B --> C[Fetch Performance Dashboard]
    C --> D{Data Available?}

    D -->|Yes| E[Calculate KPIs]
    D -->|No| F[Show No Data Message]

    E --> G[Render KPI Cards]
    G --> H[Render Alert Summary]
    H --> I[Render Charts]
    I --> J[Render Recent Recommendations]
    J --> K[Dashboard Ready]

    F --> L[Show Setup Instructions]
```

### 2.2 Dashboard Interaction Flow

```mermaid
graph TB
    A[Dashboard Displayed] --> B{User Action}

    B -->|Click Location Filter| C[Filter Dashboard]
    B -->|Click Alert Count| D[Navigate to Detail]
    B -->|Click Quick Action| E[Navigate to Page]
    B -->|Click Recommendation| F[Expand Details]

    C --> G[Refresh Data]
    G --> A

    D -->|Low Stock| H[Reorder Management]
    D -->|Dead Stock| I[Dead Stock Analysis]
    D -->|Overstock| J[Reorder Management]

    E -->|Generate Optimization| H
    E -->|Analyze Dead Stock| I
    E -->|Review Locations| K[Multi-Location]
    E -->|Configure Settings| L[Settings]
```

---

## 3. Optimization Flow

### 3.1 Generate Optimization Recommendations

```mermaid
graph TB
    A[User Opens Reorder Management] --> B[Select Filters]
    B --> C[Click Generate Recommendations]
    C --> D[API: generateOptimizationRecommendations]

    D --> E{For Each Item}
    E --> F[Get Historical Data]
    F --> G[Calculate EOQ]
    G --> H[Calculate Reorder Point]
    H --> I[Calculate Safety Stock]
    I --> J[Assess Risk]
    J --> K[Calculate Savings]
    K --> L[Determine Action]
    L --> M{More Items?}

    M -->|Yes| E
    M -->|No| N[Aggregate Results]
    N --> O[Return Recommendations]
    O --> P[Display Table]
```

### 3.2 EOQ Calculation Detail

```mermaid
graph TB
    A[Start EOQ Calculation] --> B[Get Annual Demand]
    B --> C[Get Order Cost]
    C --> D[Get Holding Cost]

    D --> E{All Data Valid?}
    E -->|No| F[Use Defaults]
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

### 3.3 Apply Recommendations Flow

```mermaid
graph TB
    A[User Selects Items] --> B[Click Apply Selected]
    B --> C[Show Confirmation Dialog]
    C --> D{User Confirms?}

    D -->|No| E[Cancel]
    D -->|Yes| F[Validate Selection]

    F --> G{Validation Pass?}
    G -->|No| H[Show Errors]
    G -->|Yes| I[Update Reorder Points]

    I --> J[Update Order Quantities]
    J --> K[Log Audit Trail]
    K --> L[Show Success Message]
    L --> M[Refresh Table]
```

---

## 4. Dead Stock Analysis Flow

### 4.1 Dead Stock Identification

```mermaid
graph TB
    A[User Opens Dead Stock Page] --> B[Set Threshold Days]
    B --> C[API: analyzeDeadStock]

    C --> D{For Each Item}
    D --> E[Get Last Movement Date]
    E --> F[Calculate Days Since Movement]
    F --> G[Calculate Months of Stock]
    G --> H[Determine Risk Level]
    H --> I[Recommend Action]
    I --> J[Calculate Financial Impact]
    J --> K{More Items?}

    K -->|Yes| D
    K -->|No| L[Sort by Risk]
    L --> M[Display Results]
```

### 4.2 Risk Classification Logic

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

    E --> K[Return Risk Level]
    G --> K
    I --> K
    J --> K
```

### 4.3 Dead Stock Action Flow

```mermaid
graph TB
    A[User Views Dead Stock Item] --> B{Select Action}

    B -->|Continue Stocking| C[Mark as Reviewed]
    B -->|Reduce Stock| D[Create Reduction Plan]
    B -->|Liquidate| E[Create Liquidation Request]
    B -->|Return to Supplier| F[Create Return Request]
    B -->|Write Off| G[Create Write-Off Request]

    C --> H[Update Status]
    D --> I[Calculate Target Level]
    E --> J[Set Liquidation Price]
    F --> K[Check Supplier Agreement]
    G --> L[Calculate Write-Off Value]

    I --> M[Update Item Parameters]
    J --> N[Create Sales Order]
    K --> O[Create Return Order]
    L --> P[Create Adjustment]

    H --> Q[Log Action]
    M --> Q
    N --> Q
    O --> Q
    P --> Q
```

---

## 5. Safety Stock Flow

### 5.1 Safety Stock Calculation

```mermaid
graph TB
    A[User Opens Safety Stock Page] --> B[Load Current Service Level]
    B --> C[Display Current vs Recommended]

    C --> D{User Changes Service Level}
    D -->|90%| E[Z-Score = 1.28]
    D -->|95%| F[Z-Score = 1.65]
    D -->|99%| G[Z-Score = 2.33]

    E --> H[Recalculate Safety Stock]
    F --> H
    G --> H

    H --> I[Safety Stock = Z x Sigma x sqrt LT]
    I --> J[Update Comparison Table]
    J --> K[Calculate Value Impact]
    K --> L[Update What-If Chart]
```

### 5.2 Apply Safety Stock Changes

```mermaid
graph TB
    A[User Reviews Changes] --> B[Select Items to Update]
    B --> C[Click Apply]

    C --> D[Validate Changes]
    D --> E{Changes Valid?}

    E -->|No| F[Show Validation Errors]
    E -->|Yes| G[Calculate Impact Summary]

    G --> H[Show Confirmation]
    H --> I{User Confirms?}

    I -->|No| J[Cancel]
    I -->|Yes| K[Update Safety Stock Values]

    K --> L[Recalculate Reorder Points]
    L --> M[Log Changes]
    M --> N[Show Success]
```

---

## 6. Multi-Location Flow

### 6.1 Location Performance Analysis

```mermaid
graph TB
    A[User Opens Multi-Location] --> B[Load Location Data]
    B --> C[API: getLocationBreakdown]

    C --> D{For Each Location}
    D --> E[Calculate Total Value]
    E --> F[Calculate Turnover]
    F --> G[Count Alerts]
    G --> H[Determine Status]
    H --> I{More Locations?}

    I -->|Yes| D
    I -->|No| J[Identify Imbalances]

    J --> K[Generate Transfer Recommendations]
    K --> L[Display Results]
```

### 6.2 Transfer Recommendation Logic

```mermaid
graph TB
    A[Start Transfer Analysis] --> B[Identify Overstocked Location]
    B --> C[Identify Understocked Location]

    C --> D{Imbalance > 20%?}
    D -->|No| E[No Transfer Needed]
    D -->|Yes| F[Calculate Transfer Quantity]

    F --> G[Estimate Transfer Cost]
    G --> H{Cost < Stockout Risk?}

    H -->|No| E
    H -->|Yes| I[Create Transfer Recommendation]

    I --> J[Set Source Location]
    J --> K[Set Destination Location]
    K --> L[Set Transfer Quantity]
    L --> M[Return Recommendation]
```

---

## 7. Settings Configuration Flow

### 7.1 Save Settings Flow

```mermaid
graph TB
    A[User Opens Settings] --> B[Load Current Settings]
    B --> C[Display Form]

    C --> D[User Modifies Settings]
    D --> E[Click Save]

    E --> F[Validate Settings]
    F --> G{Valid?}

    G -->|No| H[Show Errors]
    G -->|Yes| I[Save to Configuration]

    I --> J[Apply to Future Calculations]
    J --> K[Show Success Message]

    H --> D
```

---

## 8. Integration Flows

### 8.1 Demand Forecasting Integration

```mermaid
graph TB
    A[Inventory Planning Dashboard] --> B{User Action}

    B -->|View Forecast Link| C[Navigate to Demand Forecasting]
    C --> D[Pass Item Context]
    D --> E[Demand Forecasting Dashboard]

    E --> F{User Action}
    F -->|View Optimization Link| G[Navigate to Inventory Planning]
    G --> H[Pass Forecast Data]
    H --> A
```

### 8.2 Inventory Management Integration

```mermaid
graph TB
    A[Apply Recommendation] --> B[Get Current Item Data]
    B --> C[Calculate New Parameters]

    C --> D[Update Inventory Item]
    D --> E[Reorder Point]
    D --> F[Order Quantity]
    D --> G[Safety Stock]

    E --> H[Save Changes]
    F --> H
    G --> H

    H --> I[Trigger Reorder Check]
    I --> J{Stock Below ROP?}

    J -->|Yes| K[Create Purchase Suggestion]
    J -->|No| L[Complete]
```

---

## 9. Error Handling Flows

### 9.1 API Error Flow

```mermaid
graph TB
    A[API Request] --> B{Response OK?}

    B -->|Yes| C[Process Data]
    B -->|No| D{Error Type}

    D -->|400 Bad Request| E[Show Validation Error]
    D -->|404 Not Found| F[Show Not Found Message]
    D -->|500 Server Error| G[Show Retry Option]
    D -->|Network Error| H[Show Offline Message]

    E --> I[User Corrects Input]
    I --> A

    G --> J{Retry?}
    J -->|Yes| A
    J -->|No| K[Show Error State]

    H --> L[Enable Offline Mode]
```

### 9.2 Data Validation Flow

```mermaid
graph TB
    A[User Input] --> B[Client Validation]
    B --> C{Valid?}

    C -->|No| D[Show Inline Error]
    C -->|Yes| E[Submit to API]

    E --> F[Server Validation]
    F --> G{Valid?}

    G -->|No| H[Return Error Response]
    G -->|Yes| I[Process Request]

    H --> J[Show Server Errors]
    D --> K[User Corrects Input]
    J --> K
    K --> A
```

---

## 10. State Management Flow

### 10.1 Filter State Flow

```mermaid
graph TB
    A[User Changes Filter] --> B[Update Store State]
    B --> C[Trigger React Query Refetch]
    C --> D[API Request with New Params]
    D --> E[Update Cache]
    E --> F[Re-render Components]
    F --> G[Display Updated Data]
```

### 10.2 Selection State Flow

```mermaid
graph TB
    A[User Clicks Checkbox] --> B[Toggle Item Selection]
    B --> C[Update Selected Items Set]
    C --> D{Any Selected?}

    D -->|Yes| E[Enable Bulk Actions]
    D -->|No| F[Disable Bulk Actions]

    E --> G[Update Action Bar]
    F --> G

    G --> H[User Clicks Select All]
    H --> I[Add All Visible Items]
    I --> E
```

---

**Document End**
