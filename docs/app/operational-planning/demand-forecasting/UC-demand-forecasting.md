# Use Cases: Demand Forecasting

## Document Information
- **Module**: Operational Planning
- **Component**: Demand Forecasting
- **Version**: 1.0.0
- **Last Updated**: 2025-12-05
- **Status**: Active - For Implementation

## Related Documents
- [Business Requirements](./BR-demand-forecasting.md) - Functional and business rules
- [Technical Specification](./TS-demand-forecasting.md) - System architecture and components
- [Data Definition](./DD-demand-forecasting.md) - Database entity descriptions
- [Flow Diagrams](./FD-demand-forecasting.md) - Visual workflow diagrams
- [Validations](./VAL-demand-forecasting.md) - Validation rules
- [Inventory Operations Shared Method](../../shared-methods/inventory-operations/SM-inventory-operations.md) - Inventory transaction patterns
- [Costing Methods Shared Method](../../shared-methods/inventory-valuation/SM-costing-methods.md) - FIFO/AVG costing integration

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-05 | Documentation Team | Initial version |

---

## 1. Actors

### 1.1 Primary Actors

| Actor | Description | Permissions |
|-------|-------------|-------------|
| **Inventory Manager** | Responsible for stock levels and procurement planning | Full access to forecasts, trends, optimization |
| **Operations Manager** | Oversees daily operations and resource planning | View forecasts, trends, dashboard |
| **Executive Chef** | Plans menu and ingredient requirements | View forecasts for food items |
| **Financial Controller** | Monitors inventory costs and dead stock | Full access to cost analysis, dead stock |
| **Purchasing Manager** | Plans procurement based on forecasts | View forecasts, recommendations |

### 1.2 Secondary Actors

| Actor | Description | Permissions |
|-------|-------------|-------------|
| **General Manager** | Executive oversight of operations | View dashboard and summaries |
| **Storekeeper** | Manages physical inventory | View forecasts for assigned locations |
| **Department Manager** | Manages departmental consumption | View department-specific forecasts |

### 1.3 System Actors

| Actor | Description |
|-------|-------------|
| **Analytics Service** | Backend service performing calculations |
| **Cache Layer** | Stores computed results for performance |
| **Scheduler** | Triggers periodic forecast updates |

---

## 2. Use Cases Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Demand Forecasting System                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   UC-DF-001     │    │   UC-DF-002     │                    │
│  │   Generate      │    │   Analyze       │                    │
│  │   Forecast      │    │   Trends        │                    │
│  └────────┬────────┘    └────────┬────────┘                    │
│           │                      │                              │
│  ┌────────┴────────┐    ┌────────┴────────┐                    │
│  │   UC-DF-003     │    │   UC-DF-004     │                    │
│  │   View          │    │   Identify      │                    │
│  │   Optimization  │    │   Dead Stock    │                    │
│  └────────┬────────┘    └────────┬────────┘                    │
│           │                      │                              │
│  ┌────────┴────────┐    ┌────────┴────────┐                    │
│  │   UC-DF-005     │    │   UC-DF-006     │                    │
│  │   Monitor       │    │   Compare       │                    │
│  │   Dashboard     │    │   Forecast vs   │                    │
│  │                 │    │   Actual        │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Use Cases

### UC-DF-001: Generate Inventory Demand Forecast

**Use Case ID**: UC-DF-001
**Use Case Name**: Generate Inventory Demand Forecast
**Primary Actor**: Inventory Manager
**Priority**: Critical
**Related Requirements**: FR-DF-001, BR-DF-005 to BR-DF-012

#### Description
Inventory Manager generates demand forecasts for inventory items to plan procurement and prevent stockouts.

#### Preconditions
- User is authenticated with inventory management permissions
- Inventory items have at least 30 days of transaction history
- Stock balance data is current

#### Trigger
- User navigates to Demand Forecasting module
- User clicks "Generate Forecast" button
- Scheduled job triggers automatic forecast generation

#### Main Flow

| Step | Actor | System |
|------|-------|--------|
| 1 | User selects forecast parameters | Displays parameter form |
| 2 | User selects forecasting method (Moving Average, Exponential Smoothing, Linear Regression, Seasonal) | Validates method selection |
| 3 | User enters forecast period (1-365 days) | Validates period range |
| 4 | User optionally filters by item IDs or categories | Applies filters |
| 5 | User clicks "Generate Forecast" | Initiates calculation |
| 6 | - | Retrieves inventory transactions (365-day history) |
| 7 | - | Retrieves current stock balances |
| 8 | - | Applies selected forecasting algorithm |
| 9 | - | Calculates projected demand, ending stock, safety stock |
| 10 | - | Calculates recommended purchase quantities |
| 11 | - | Assesses risk level for each item |
| 12 | - | Displays forecast results with accuracy metrics |
| 13 | User reviews forecast results | Highlights high-risk items |
| 14 | User exports forecast report (optional) | Generates PDF/Excel export |

#### Alternative Flows

**A1: Insufficient Historical Data**
| Step | Actor | System |
|------|-------|--------|
| A1.1 | - | Detects items with < 30 days history |
| A1.2 | - | Displays warning: "Limited data for X items" |
| A1.3 | - | Uses available data with reduced accuracy |
| A1.4 | - | Marks affected items with "Low Confidence" indicator |

**A2: Seasonal Method with Insufficient Data**
| Step | Actor | System |
|------|-------|--------|
| A2.1 | User selects Seasonal Decomposition | Checks data availability |
| A2.2 | - | Detects items with < 60 days history |
| A2.3 | - | Falls back to Linear Regression method |
| A2.4 | - | Notifies user of method fallback |

**A3: Filter by Category**
| Step | Actor | System |
|------|-------|--------|
| A3.1 | User selects category filter | Displays category dropdown |
| A3.2 | User selects one or more categories | Applies category filter |
| A3.3 | - | Generates forecast for filtered items only |

#### Exception Flows

**E1: Calculation Timeout**
| Step | Actor | System |
|------|-------|--------|
| E1.1 | - | Calculation exceeds 30 seconds |
| E1.2 | - | Displays error: "Calculation timed out" |
| E1.3 | - | Suggests reducing item count or using cached results |
| E1.4 | User reduces scope or retries | Re-attempts calculation |

**E2: No Active Items**
| Step | Actor | System |
|------|-------|--------|
| E2.1 | - | No active inventory items found |
| E2.2 | - | Displays: "No active items to forecast" |
| E2.3 | - | Suggests checking item status in Inventory Management |

#### Postconditions
- Forecast results are displayed with accuracy metrics
- Results are cached for subsequent requests
- Calculation metadata is recorded (time, data points)

#### Business Rules Applied
- BR-DF-005: Safety stock calculation
- BR-DF-006: Recommended purchase calculation
- BR-DF-007: Moving average window size
- BR-DF-008: Exponential smoothing alpha
- BR-DF-009: Risk score calculation
- BR-DF-010/011/012: Risk level thresholds

---

### UC-DF-002: Analyze Consumption Trends

**Use Case ID**: UC-DF-002
**Use Case Name**: Analyze Consumption Trends
**Primary Actor**: Operations Manager
**Priority**: High
**Related Requirements**: FR-DF-002

#### Description
Operations Manager analyzes consumption trends to identify patterns, seasonality, and anomalies for informed decision-making.

#### Preconditions
- User has access to analytics features
- Transaction history exists for analysis period
- At least one inventory item is active

#### Trigger
- User selects "Trend Analysis" from forecasting menu
- User requests trend report for specific items

#### Main Flow

| Step | Actor | System |
|------|-------|--------|
| 1 | User navigates to Trend Analysis | Displays analysis configuration |
| 2 | User sets analysis period (default: 180 days) | Validates date range |
| 3 | User optionally selects specific items | Applies item filter |
| 4 | User clicks "Analyze Trends" | Initiates analysis |
| 5 | - | Retrieves transaction data for period |
| 6 | - | Calculates consumption trend (direction, slope, confidence) |
| 7 | - | Calculates stock level metrics |
| 8 | - | Calculates cost trend and inflation rate |
| 9 | - | Retrieves supplier performance metrics |
| 10 | - | Generates recommendations based on analysis |
| 11 | - | Displays trend analysis results |
| 12 | User reviews consumption trends | Shows trend charts |
| 13 | User drills into specific item details | Displays item-level analysis |
| 14 | User acts on recommendations | Links to relevant actions |

#### Alternative Flows

**A1: Compare Multiple Periods**
| Step | Actor | System |
|------|-------|--------|
| A1.1 | User enables period comparison | Displays comparison options |
| A1.2 | User selects comparison period | Validates non-overlapping periods |
| A1.3 | - | Generates side-by-side analysis |
| A1.4 | - | Highlights significant variances |

**A2: Filter by Category**
| Step | Actor | System |
|------|-------|--------|
| A2.1 | User selects category | Filters results |
| A2.2 | - | Shows category-level aggregation |
| A2.3 | - | Displays category trend summary |

#### Exception Flows

**E1: No Data for Period**
| Step | Actor | System |
|------|-------|--------|
| E1.1 | - | No transactions in selected period |
| E1.2 | - | Displays: "No data available for selected period" |
| E1.3 | - | Suggests expanding date range |

#### Postconditions
- Trend analysis displayed with recommendations
- User can act on specific recommendations
- Analysis results are logged for audit

#### Business Rules Applied
- Trend direction thresholds
- Seasonal pattern detection (30-day cycle)
- Supplier performance metrics calculation

---

### UC-DF-003: View Optimization Recommendations

**Use Case ID**: UC-DF-003
**Use Case Name**: View Optimization Recommendations
**Primary Actor**: Inventory Manager
**Priority**: High
**Related Requirements**: FR-DF-003, BR-DF-016 to BR-DF-019

#### Description
Inventory Manager reviews optimization recommendations to improve inventory turnover and reduce carrying costs.

#### Preconditions
- User has inventory optimization access
- Transaction history available for analysis
- Stock balance data is current

#### Trigger
- User selects "Optimization" from forecasting menu
- User requests optimization report

#### Main Flow

| Step | Actor | System |
|------|-------|--------|
| 1 | User navigates to Optimization | Displays configuration |
| 2 | User sets target service level (default: 95%) | Validates range (80-99%) |
| 3 | User optionally filters items | Applies filters |
| 4 | User clicks "Generate Recommendations" | Initiates calculation |
| 5 | - | Calculates current metrics (turnover, carrying cost) |
| 6 | - | Calculates optimized reorder point, order quantity, safety stock |
| 7 | - | Calculates potential savings |
| 8 | - | Assesses implementation risk |
| 9 | - | Determines recommended action |
| 10 | - | Displays recommendations sorted by savings |
| 11 | User reviews recommendations | Highlights high-savings items |
| 12 | User selects items to implement | Tracks selection |
| 13 | User exports implementation plan | Generates export file |

#### Alternative Flows

**A1: Filter by Recommended Action**
| Step | Actor | System |
|------|-------|--------|
| A1.1 | User selects action filter (Implement/Pilot/Monitor) | Filters results |
| A1.2 | - | Shows only items with selected action |
| A1.3 | - | Displays filtered count |

**A2: Sort by Different Metrics**
| Step | Actor | System |
|------|-------|--------|
| A2.1 | User selects sort column | Re-sorts results |
| A2.2 | Options: Savings, Risk, Turnover Improvement | Applies sort |

#### Exception Flows

**E1: No Optimization Opportunities**
| Step | Actor | System |
|------|-------|--------|
| E1.1 | - | All items already optimized |
| E1.2 | - | Displays: "No significant optimization opportunities" |
| E1.3 | - | Shows current metrics summary |

#### Postconditions
- Recommendations displayed with ROI metrics
- User can export implementation plan
- Selected implementations are tracked

#### Business Rules Applied
- BR-DF-016: Implement threshold (>$100 savings, low risk)
- BR-DF-017: Pilot threshold (>$50 savings)
- BR-DF-018: Monitor for low savings/high risk
- BR-DF-019: Target service level default (95%)

---

### UC-DF-004: Identify Dead Stock

**Use Case ID**: UC-DF-004
**Use Case Name**: Identify Dead Stock
**Primary Actor**: Financial Controller
**Priority**: Medium
**Related Requirements**: FR-DF-004, BR-DF-013 to BR-DF-015

#### Description
Financial Controller identifies dead stock items to minimize obsolescence losses and free up working capital.

#### Preconditions
- User has financial analysis access
- Inventory items have stock on hand
- Transaction history is available

#### Trigger
- User selects "Dead Stock Analysis" from menu
- Scheduled monthly dead stock report

#### Main Flow

| Step | Actor | System |
|------|-------|--------|
| 1 | User navigates to Dead Stock Analysis | Displays configuration |
| 2 | User sets threshold days (default: 90) | Validates range (30-365) |
| 3 | User optionally filters by location | Applies location filter |
| 4 | User clicks "Analyze Dead Stock" | Initiates analysis |
| 5 | - | Retrieves items with stock > 0 |
| 6 | - | Checks last movement date for each item |
| 7 | - | Filters items exceeding threshold |
| 8 | - | Calculates financial metrics (value, potential loss) |
| 9 | - | Assesses obsolescence risk level |
| 10 | - | Determines recommended action |
| 11 | - | Displays results sorted by potential loss |
| 12 | User reviews dead stock items | Highlights critical items |
| 13 | User selects items for action | Tracks selection |
| 14 | User initiates recommended action | Links to action workflow |

#### Alternative Flows

**A1: Filter by Risk Level**
| Step | Actor | System |
|------|-------|--------|
| A1.1 | User selects risk level filter | Filters results |
| A1.2 | Options: Critical, High, Medium, Low | Shows filtered items |
| A1.3 | - | Updates summary totals |

**A2: View by Location**
| Step | Actor | System |
|------|-------|--------|
| A2.1 | User selects location grouping | Groups results by location |
| A2.2 | - | Shows location-level totals |
| A2.3 | User expands location | Shows items in location |

#### Exception Flows

**E1: No Dead Stock Found**
| Step | Actor | System |
|------|-------|--------|
| E1.1 | - | No items exceed threshold |
| E1.2 | - | Displays: "No dead stock identified" |
| E1.3 | - | Shows inventory health summary |

#### Postconditions
- Dead stock analysis displayed with financial impact
- User can initiate disposal actions
- Analysis logged for audit trail

#### Business Rules Applied
- BR-DF-013: Default threshold (90 days)
- BR-DF-014: Critical risk criteria (>365 days or >24 months stock)
- BR-DF-015: Liquidation recovery percentages

---

### UC-DF-005: Monitor Performance Dashboard

**Use Case ID**: UC-DF-005
**Use Case Name**: Monitor Performance Dashboard
**Primary Actor**: General Manager
**Priority**: High
**Related Requirements**: FR-DF-005

#### Description
General Manager monitors inventory performance dashboard to oversee operational health and identify areas needing attention.

#### Preconditions
- User has dashboard access
- Inventory data is current
- Cache layer is operational

#### Trigger
- User navigates to Operational Planning dashboard
- Dashboard auto-refreshes on schedule

#### Main Flow

| Step | Actor | System |
|------|-------|--------|
| 1 | User opens dashboard | Loads dashboard layout |
| 2 | - | Retrieves cached dashboard data |
| 3 | - | If cache expired, regenerates metrics |
| 4 | - | Displays overall KPI metrics |
| 5 | - | Displays category breakdown chart |
| 6 | - | Displays location breakdown |
| 7 | - | Displays alert counts |
| 8 | - | Displays trend comparisons |
| 9 | User reviews overall metrics | Highlights concerning values |
| 10 | User clicks alert count | Drills into alert details |
| 11 | User selects category | Shows category detail |
| 12 | User adjusts period filter | Recalculates for new period |

#### Alternative Flows

**A1: Filter by Location**
| Step | Actor | System |
|------|-------|--------|
| A1.1 | User selects location filter | Applies filter |
| A1.2 | - | Recalculates metrics for location |
| A1.3 | - | Updates all dashboard widgets |

**A2: Change Period**
| Step | Actor | System |
|------|-------|--------|
| A2.1 | User selects different period (7/30/90 days) | Validates selection |
| A2.2 | - | Regenerates dashboard for period |
| A2.3 | - | Updates trend comparisons |

**A3: Export Dashboard**
| Step | Actor | System |
|------|-------|--------|
| A3.1 | User clicks export | Shows export options |
| A3.2 | User selects format (PDF/Excel) | Generates export |
| A3.3 | - | Downloads file |

#### Exception Flows

**E1: Cache Unavailable**
| Step | Actor | System |
|------|-------|--------|
| E1.1 | - | Cache miss or expired |
| E1.2 | - | Displays loading indicator |
| E1.3 | - | Regenerates metrics in real-time |
| E1.4 | - | Caches results for next request |

#### Postconditions
- Dashboard displays current metrics
- User can drill into specific areas
- View logged for analytics

#### Business Rules Applied
- Cache refresh interval (15 minutes)
- Alert threshold calculations
- Trend comparison logic

---

### UC-DF-006: Compare Forecast vs Actual

**Use Case ID**: UC-DF-006
**Use Case Name**: Compare Forecast vs Actual
**Primary Actor**: Operations Manager
**Priority**: Medium
**Related Requirements**: FR-DF-006

#### Description
Operations Manager compares forecasted demand against actual consumption to assess forecast accuracy and refine planning.

#### Preconditions
- Previous forecasts exist
- Actual consumption data is available
- Dashboard widget is enabled

#### Trigger
- User views dashboard widget
- User requests accuracy report

#### Main Flow

| Step | Actor | System |
|------|-------|--------|
| 1 | User views dashboard | Loads forecast widget |
| 2 | - | Retrieves 7-day forecast data |
| 3 | - | Retrieves actual consumption data |
| 4 | - | Calculates variance for each day |
| 5 | - | Displays line chart (forecast vs actual) |
| 6 | - | Highlights days with >10% variance |
| 7 | User hovers over data point | Shows detailed values |
| 8 | User clicks high-variance day | Shows item-level breakdown |
| 9 | User adjusts date range | Recalculates for new range |

#### Alternative Flows

**A1: Drill into Item Details**
| Step | Actor | System |
|------|-------|--------|
| A1.1 | User clicks on variance indicator | Opens detail panel |
| A1.2 | - | Shows items with largest variance |
| A1.3 | - | Shows contributing factors |

**A2: Expand to Longer Period**
| Step | Actor | System |
|------|-------|--------|
| A2.1 | User selects 30-day view | Expands date range |
| A2.2 | - | Recalculates accuracy metrics |
| A2.3 | - | Shows rolling accuracy trend |

#### Exception Flows

**E1: No Historical Forecasts**
| Step | Actor | System |
|------|-------|--------|
| E1.1 | - | No previous forecasts found |
| E1.2 | - | Displays: "Generate forecasts to enable comparison" |
| E1.3 | - | Links to forecast generation |

#### Postconditions
- Variance analysis displayed
- User can identify accuracy issues
- Insights inform forecast method selection

#### Business Rules Applied
- 10% variance threshold for highlighting
- 7-day rolling window default
- Accuracy calculation methodology

---

## 4. Use Case Relationships

### 4.1 Dependencies

| Use Case | Depends On | Dependency Type |
|----------|------------|-----------------|
| UC-DF-003 | UC-DF-001 | Uses forecast data |
| UC-DF-006 | UC-DF-001 | Requires historical forecasts |
| UC-DF-005 | UC-DF-001, UC-DF-004 | Aggregates results |

### 4.2 Extensions

| Base Use Case | Extension | Trigger |
|---------------|-----------|---------|
| UC-DF-001 | Export to Procurement | User requests purchase orders |
| UC-DF-004 | Initiate Disposal | User approves write-off |
| UC-DF-005 | Configure Alerts | User customizes thresholds |

---

## 5. Non-Functional Requirements by Use Case

| Use Case | Performance | Availability | Security |
|----------|-------------|--------------|----------|
| UC-DF-001 | < 5 seconds (1000 items) | 99.5% | Inventory role required |
| UC-DF-002 | < 10 seconds (500 items) | 99.5% | Analytics role required |
| UC-DF-003 | < 5 seconds | 99.5% | Inventory role required |
| UC-DF-004 | < 3 seconds | 99.5% | Finance role required |
| UC-DF-005 | < 3 seconds | 99.9% | View role minimum |
| UC-DF-006 | < 500ms (widget) | 99.9% | View role minimum |

---

## 6. Glossary

| Term | Definition |
|------|------------|
| **Forecast** | Predicted future demand based on historical data |
| **Trend** | Direction and rate of change over time |
| **Dead Stock** | Items with no movement for extended period |
| **Service Level** | Target probability of meeting demand |
| **Variance** | Difference between forecast and actual |
| **Risk Level** | Assessment of stockout probability |

---

**Document End**
