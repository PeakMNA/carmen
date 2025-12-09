# Flow Diagrams: Demand Forecasting

## Document Information
- **Module**: Operational Planning
- **Component**: Demand Forecasting
- **Version**: 1.0.0
- **Last Updated**: 2025-12-05
- **Status**: Active - For Implementation

## Related Documents
- [Business Requirements](./BR-demand-forecasting.md) - Functional and business rules
- [Use Cases](./UC-demand-forecasting.md) - User workflows and scenarios
- [Technical Specification](./TS-demand-forecasting.md) - System architecture and components
- [Data Definition](./DD-demand-forecasting.md) - Database entity descriptions
- [Validations](./VAL-demand-forecasting.md) - Validation rules
- [Inventory Operations Shared Method](../../shared-methods/inventory-operations/SM-inventory-operations.md) - Inventory transaction patterns
- [Costing Methods Shared Method](../../shared-methods/inventory-valuation/SM-costing-methods.md) - FIFO/AVG costing integration

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-05 | Documentation Team | Initial version |

---

## 1. High-Level Process Flow

### 1.1 Demand Forecasting System Overview

```mermaid
graph TB
    START((Start)) --> INPUT[User Input Parameters]
    INPUT --> VALIDATE{Valid Parameters?}
    VALIDATE -->|No| ERROR[Show Validation Error]
    ERROR --> INPUT
    VALIDATE -->|Yes| CACHE{Cache Available?}
    CACHE -->|Yes| RETURN_CACHE[Return Cached Results]
    CACHE -->|No| FETCH[Fetch Data from Database]
    FETCH --> PROCESS[Process Analytics]
    PROCESS --> STORE[Store in Cache]
    STORE --> RETURN[Return Results]
    RETURN_CACHE --> DISPLAY[Display to User]
    RETURN --> DISPLAY
    DISPLAY --> END((End))
```

---

## 2. Forecast Generation Flow

### 2.1 Generate Inventory Forecast

```mermaid
graph TB
    START((Start)) --> PARAMS[Receive Parameters]
    PARAMS --> VALIDATE_ITEMS{Item IDs Provided?}

    VALIDATE_ITEMS -->|Yes| FILTER_ITEMS[Filter by Item IDs]
    VALIDATE_ITEMS -->|No| ALL_ITEMS[Get All Active Items]

    FILTER_ITEMS --> FETCH_DATA[Fetch Item Data]
    ALL_ITEMS --> FETCH_DATA

    FETCH_DATA --> FETCH_TXN[Fetch 365-Day Transactions]
    FETCH_TXN --> FETCH_STOCK[Fetch Current Stock Balances]

    FETCH_STOCK --> LOOP_START{More Items?}

    LOOP_START -->|Yes| EXTRACT[Extract Consumption Data]
    EXTRACT --> SELECT_METHOD{Forecast Method}

    SELECT_METHOD -->|Moving Average| MA[Calculate Moving Average]
    SELECT_METHOD -->|Exponential Smoothing| ES[Calculate Exponential Smoothing]
    SELECT_METHOD -->|Linear Regression| LR[Calculate Linear Regression]
    SELECT_METHOD -->|Seasonal| CHECK_DATA{Enough Data for Seasonal?}

    CHECK_DATA -->|Yes 60+ days| SD[Calculate Seasonal Decomposition]
    CHECK_DATA -->|No| LR

    MA --> CALCULATE[Calculate Demand Metrics]
    ES --> CALCULATE
    LR --> CALCULATE
    SD --> CALCULATE

    CALCULATE --> SAFETY[Calculate Safety Stock]
    SAFETY --> PURCHASE[Calculate Recommended Purchase]
    PURCHASE --> RISK[Assess Risk Level]
    RISK --> ADD_RESULT[Add to Results]
    ADD_RESULT --> LOOP_START

    LOOP_START -->|No| BUILD_RESPONSE[Build Response with Metadata]
    BUILD_RESPONSE --> RETURN[Return AnalyticsResult]
    RETURN --> END((End))
```

### 2.2 Forecasting Algorithm Selection

```mermaid
graph TB
    START((Method Selection)) --> INPUT[Receive Method Parameter]
    INPUT --> CHECK{Method Type}

    CHECK -->|moving_average| MA_CHECK{Data Points >= 1?}
    MA_CHECK -->|Yes| MA[Apply Moving Average]
    MA_CHECK -->|No| ZERO[Return Zero Forecast]

    CHECK -->|exponential_smoothing| ES_CHECK{Data Points >= 1?}
    ES_CHECK -->|Yes| ES[Apply Exponential Smoothing]
    ES_CHECK -->|No| ZERO

    CHECK -->|linear_regression| LR_CHECK{Data Points >= 2?}
    LR_CHECK -->|Yes| LR[Apply Linear Regression]
    LR_CHECK -->|No| MA_FALLBACK[Fallback to Moving Average]

    CHECK -->|seasonal_decomposition| SD_CHECK{Data Points >= 60?}
    SD_CHECK -->|Yes| SD[Apply Seasonal Decomposition]
    SD_CHECK -->|No| LR_FALLBACK[Fallback to Linear Regression]

    MA --> RETURN[Return Forecast Result]
    ES --> RETURN
    LR --> RETURN
    SD --> RETURN
    ZERO --> RETURN
    MA_FALLBACK --> RETURN
    LR_FALLBACK --> RETURN

    RETURN --> END((End))
```

---

## 3. Trend Analysis Flow

### 3.1 Perform Trend Analysis

```mermaid
graph TB
    START((Start)) --> PARAMS[Receive Date Range]
    PARAMS --> VALIDATE_DATES{Valid Date Range?}

    VALIDATE_DATES -->|No| DEFAULT[Use Default 180 Days]
    VALIDATE_DATES -->|Yes| CONTINUE[Continue with Dates]
    DEFAULT --> CONTINUE

    CONTINUE --> FETCH_ITEMS[Fetch Items with Categories]
    FETCH_ITEMS --> FETCH_TXN[Fetch Transactions in Range]
    FETCH_TXN --> FETCH_STOCK[Fetch Stock Balances]

    FETCH_STOCK --> LOOP{More Items?}

    LOOP -->|Yes| CONSUMPTION[Analyze Consumption Trend]
    CONSUMPTION --> STOCK_LEVEL[Analyze Stock Level Trend]
    STOCK_LEVEL --> COST_TREND[Analyze Cost Trend]
    COST_TREND --> SUPPLIER[Analyze Supplier Performance]

    SUPPLIER --> GENERATE_RECS[Generate Recommendations]
    GENERATE_RECS --> ADD_ANALYSIS[Add to Results]
    ADD_ANALYSIS --> LOOP

    LOOP -->|No| BUILD[Build Response]
    BUILD --> RETURN[Return AnalyticsResult]
    RETURN --> END((End))
```

### 3.2 Consumption Trend Analysis Detail

```mermaid
graph TB
    START((Analyze Consumption)) --> GET_TXN[Get Issue/Transfer/Waste Transactions]
    GET_TXN --> CALC_DAILY[Calculate Daily Consumption]

    CALC_DAILY --> REGRESSION[Apply Linear Regression]
    REGRESSION --> SLOPE{Slope Value}

    SLOPE -->|Positive > 0.05| INCREASING[Direction: Increasing]
    SLOPE -->|Negative < -0.05| DECREASING[Direction: Decreasing]
    SLOPE -->|Between| STABLE[Direction: Stable]

    INCREASING --> CONFIDENCE[Calculate Confidence]
    DECREASING --> CONFIDENCE
    STABLE --> CONFIDENCE

    CONFIDENCE --> SEASONAL_CHECK[Check for Seasonal Pattern]
    SEASONAL_CHECK --> BUILD[Build consumptionTrend Object]
    BUILD --> RETURN[Return Result]
    RETURN --> END((End))
```

---

## 4. Optimization Flow

### 4.1 Generate Optimization Recommendations

```mermaid
graph TB
    START((Start)) --> PARAMS[Receive Service Level Target]
    PARAMS --> VALIDATE{Valid Service Level?}

    VALIDATE -->|No| DEFAULT[Use Default 95%]
    VALIDATE -->|Yes| CONTINUE[Continue]
    DEFAULT --> CONTINUE

    CONTINUE --> FETCH[Fetch Items and Transactions]
    FETCH --> LOOP{More Items?}

    LOOP -->|Yes| CURRENT[Calculate Current Metrics]
    CURRENT --> OPTIMIZED[Calculate Optimized Metrics]
    OPTIMIZED --> SAVINGS[Calculate Potential Savings]
    SAVINGS --> RISK_ASSESS[Assess Implementation Risk]
    RISK_ASSESS --> ACTION[Determine Recommended Action]
    ACTION --> ADD[Add to Results]
    ADD --> LOOP

    LOOP -->|No| BUILD[Build Response]
    BUILD --> RETURN[Return AnalyticsResult]
    RETURN --> END((End))
```

### 4.2 Recommended Action Decision

```mermaid
graph TB
    START((Determine Action)) --> SAVINGS{Total Savings}

    SAVINGS -->|> $100| HIGH_SAVINGS{Risk Level?}
    SAVINGS -->|$50 - $100| MED_SAVINGS[Medium Savings]
    SAVINGS -->|< $50| LOW_SAVINGS[Low Savings]

    HIGH_SAVINGS -->|Low| IMPLEMENT[Action: IMPLEMENT]
    HIGH_SAVINGS -->|Medium| PILOT[Action: PILOT]
    HIGH_SAVINGS -->|High| PILOT

    MED_SAVINGS --> PILOT

    LOW_SAVINGS --> RISK_CHECK{Risk Level?}
    RISK_CHECK -->|Low/Medium| MONITOR[Action: MONITOR]
    RISK_CHECK -->|High| REJECT[Action: REJECT]

    IMPLEMENT --> RETURN[Return Action]
    PILOT --> RETURN
    MONITOR --> RETURN
    REJECT --> RETURN
    RETURN --> END((End))
```

---

## 5. Dead Stock Analysis Flow

### 5.1 Analyze Dead Stock

```mermaid
graph TB
    START((Start)) --> PARAMS[Receive Threshold Days]
    PARAMS --> VALIDATE{Valid Threshold?}

    VALIDATE -->|No| DEFAULT[Use Default 90 Days]
    VALIDATE -->|Yes| CONTINUE[Continue]
    DEFAULT --> CONTINUE

    CONTINUE --> CALC_DATE[Calculate Cutoff Date]
    CALC_DATE --> FETCH[Fetch Active Items with Stock > 0]
    FETCH --> FETCH_TXN[Fetch Recent Transactions]

    FETCH_TXN --> LOOP{More Items?}

    LOOP -->|Yes| GET_STOCK[Get Current Stock]
    GET_STOCK --> CHECK_STOCK{Stock > 0?}

    CHECK_STOCK -->|No| SKIP[Skip Item]
    CHECK_STOCK -->|Yes| GET_LAST[Get Last Movement Date]

    SKIP --> LOOP
    GET_LAST --> CALC_DAYS[Calculate Days Since Movement]

    CALC_DAYS --> CHECK_THRESHOLD{Days >= Threshold?}
    CHECK_THRESHOLD -->|No| SKIP
    CHECK_THRESHOLD -->|Yes| CALC_VALUE[Calculate Current Value]

    CALC_VALUE --> CALC_CONSUMPTION[Calculate Avg Monthly Consumption]
    CALC_CONSUMPTION --> CALC_MONTHS[Calculate Months of Stock]
    CALC_MONTHS --> ASSESS_RISK[Assess Obsolescence Risk]
    ASSESS_RISK --> DETERMINE_ACTION[Determine Recommended Action]
    DETERMINE_ACTION --> CALC_LOSS[Calculate Potential Loss]
    CALC_LOSS --> CALC_LIQUID[Estimate Liquidation Value]
    CALC_LIQUID --> ADD[Add to Results]
    ADD --> LOOP

    LOOP -->|No| BUILD[Build Response]
    BUILD --> RETURN[Return AnalyticsResult]
    RETURN --> END((End))
```

### 5.2 Obsolescence Risk Assessment

```mermaid
graph TB
    START((Assess Risk)) --> DAYS{Days Since Movement}

    DAYS -->|> 365| CRITICAL_DAYS[Critical by Days]
    DAYS -->|180 - 365| CHECK_MONTHS_HIGH{Months of Stock > 24?}
    DAYS -->|90 - 180| CHECK_MONTHS_MED{Months of Stock > 12?}
    DAYS -->|< 90| LOW[Risk: LOW]

    CRITICAL_DAYS --> CRITICAL[Risk: CRITICAL]

    CHECK_MONTHS_HIGH -->|Yes| CRITICAL
    CHECK_MONTHS_HIGH -->|No| HIGH[Risk: HIGH]

    CHECK_MONTHS_MED -->|Yes| HIGH
    CHECK_MONTHS_MED -->|No| MEDIUM[Risk: MEDIUM]

    CRITICAL --> RETURN[Return Risk Level]
    HIGH --> RETURN
    MEDIUM --> RETURN
    LOW --> RETURN
    RETURN --> END((End))
```

### 5.3 Dead Stock Action Determination

```mermaid
graph TB
    START((Determine Action)) --> RISK{Obsolescence Risk}

    RISK -->|Critical| WRITE_OFF[Action: WRITE_OFF]
    RISK -->|High| HIGH_VALUE{Value > $1000?}
    RISK -->|Medium| REDUCE[Action: REDUCE_STOCK]
    RISK -->|Low| CONTINUE[Action: CONTINUE_STOCKING]

    HIGH_VALUE -->|Yes| LIQUIDATE[Action: LIQUIDATE]
    HIGH_VALUE -->|No| RETURN_SUPPLIER[Action: RETURN_TO_SUPPLIER]

    WRITE_OFF --> RETURN[Return Action]
    LIQUIDATE --> RETURN
    RETURN_SUPPLIER --> RETURN
    REDUCE --> RETURN
    CONTINUE --> RETURN
    RETURN --> END((End))
```

---

## 6. Dashboard Generation Flow

### 6.1 Generate Performance Dashboard

```mermaid
graph TB
    START((Start)) --> PARAMS[Receive Period and Locations]
    PARAMS --> CALC_DATES[Calculate Date Range]

    CALC_DATES --> PARALLEL[Execute Parallel Calculations]

    PARALLEL --> OVERALL[Calculate Overall Metrics]
    PARALLEL --> CATEGORY[Calculate Category Breakdown]
    PARALLEL --> LOCATION[Calculate Location Breakdown]
    PARALLEL --> ALERTS[Calculate Alert Counts]
    PARALLEL --> TRENDS[Calculate Trends]

    OVERALL --> AGGREGATE[Aggregate Results]
    CATEGORY --> AGGREGATE
    LOCATION --> AGGREGATE
    ALERTS --> AGGREGATE
    TRENDS --> AGGREGATE

    AGGREGATE --> BUILD[Build Dashboard Object]
    BUILD --> RETURN[Return AnalyticsResult]
    RETURN --> END((End))
```

### 6.2 Alert Count Calculation

```mermaid
graph TB
    START((Calculate Alerts)) --> FETCH[Fetch All Items with Balances]

    FETCH --> INIT[Initialize Counters]
    INIT --> LOOP{More Items?}

    LOOP -->|Yes| CHECK_LOW{Stock < Reorder Point?}
    CHECK_LOW -->|Yes| INC_LOW[Increment lowStock]
    CHECK_LOW -->|No| NEXT_LOW[Continue]

    INC_LOW --> CHECK_OVER{Stock > 2x Reorder?}
    NEXT_LOW --> CHECK_OVER
    CHECK_OVER -->|Yes| INC_OVER[Increment overstock]
    CHECK_OVER -->|No| NEXT_OVER[Continue]

    INC_OVER --> CHECK_DEAD{No Movement > 90 Days?}
    NEXT_OVER --> CHECK_DEAD
    CHECK_DEAD -->|Yes| INC_DEAD[Increment deadStock]
    CHECK_DEAD -->|No| NEXT_DEAD[Continue]

    INC_DEAD --> CHECK_EXPIRE{Expiring Soon?}
    NEXT_DEAD --> CHECK_EXPIRE
    CHECK_EXPIRE -->|Yes| INC_EXPIRE[Increment expiring]
    CHECK_EXPIRE -->|No| NEXT_EXPIRE[Continue]

    INC_EXPIRE --> CHECK_VALUE{Value > $5000?}
    NEXT_EXPIRE --> CHECK_VALUE
    CHECK_VALUE -->|Yes| INC_VALUE[Increment highValue]
    CHECK_VALUE -->|No| NEXT_VALUE[Continue]

    INC_VALUE --> CHECK_FAST{Turnover > 12?}
    NEXT_VALUE --> CHECK_FAST
    CHECK_FAST -->|Yes| INC_FAST[Increment fastMoving]
    CHECK_FAST -->|No| LOOP

    INC_FAST --> LOOP

    LOOP -->|No| BUILD[Build Alerts Object]
    BUILD --> RETURN[Return Alerts]
    RETURN --> END((End))
```

---

## 7. Caching Flow

### 7.1 Cache Check and Update

```mermaid
graph TB
    START((Check Cache)) --> KEY[Generate Cache Key]
    KEY --> CHECK{Key Exists in Cache?}

    CHECK -->|Yes| VALID{Cache Still Valid?}
    CHECK -->|No| CALCULATE[Calculate Fresh Result]

    VALID -->|Yes| RETURN_CACHE[Return Cached Result]
    VALID -->|No| CALCULATE

    CALCULATE --> STORE[Store in Cache with TTL]
    STORE --> RETURN_NEW[Return New Result]

    RETURN_CACHE --> END((End))
    RETURN_NEW --> END
```

### 7.2 Cache Key Generation

```mermaid
graph TB
    START((Generate Key)) --> OPERATION{Operation Type}

    OPERATION -->|Forecast| FC_KEY[forecast:itemIds:method:days]
    OPERATION -->|Trend| TR_KEY[trend:itemIds:start:end]
    OPERATION -->|Optimization| OP_KEY[optimization:itemIds:serviceLevel]
    OPERATION -->|Dead Stock| DS_KEY[deadstock:threshold:locations]
    OPERATION -->|Dashboard| DB_KEY[dashboard:period:locations]

    FC_KEY --> HASH[Apply Hash Function]
    TR_KEY --> HASH
    OP_KEY --> HASH
    DS_KEY --> HASH
    DB_KEY --> HASH

    HASH --> RETURN[Return Cache Key]
    RETURN --> END((End))
```

---

## 8. Error Handling Flow

### 8.1 Error Recovery Pattern

```mermaid
graph TB
    START((Operation Start)) --> TRY[Try Operation]
    TRY --> SUCCESS{Operation Successful?}

    SUCCESS -->|Yes| BUILD_SUCCESS[Build Success Response]
    SUCCESS -->|No| CATCH[Catch Error]

    CATCH --> LOG[Log Error with Context]
    LOG --> BUILD_ERROR[Build Error Response]

    BUILD_SUCCESS --> RETURN_SUCCESS[Return success: true with data]
    BUILD_ERROR --> RETURN_ERROR[Return success: false with error]

    RETURN_SUCCESS --> END((End))
    RETURN_ERROR --> END
```

---

## 9. Integration Flows

### 9.1 Shared Method Integration

```mermaid
graph TB
    START((Analytics Request)) --> IAS[Inventory Analytics Service]

    IAS --> CIS[Comprehensive Inventory Service]

    CIS --> SM_CHECK{Need Shared Method?}

    SM_CHECK -->|Balance Query| SM_IO[SM-INVENTORY-OPERATIONS]
    SM_CHECK -->|Cost Calculation| SM_CM[SM-COSTING-METHODS]
    SM_CHECK -->|No| DIRECT[Direct Database Query]

    SM_IO --> BALANCE[Get Current Balance]
    SM_CM --> COST[Get Unit Cost]
    DIRECT --> DATA[Get Raw Data]

    BALANCE --> AGGREGATE[Aggregate Results]
    COST --> AGGREGATE
    DATA --> AGGREGATE

    AGGREGATE --> RETURN[Return to Analytics Service]
    RETURN --> END((End))
```

---

## 10. State Diagrams

### 10.1 Forecast Request States

```mermaid
stateDiagram-v2
    [*] --> Pending: Request Received
    Pending --> Validating: Start Validation
    Validating --> Invalid: Validation Failed
    Validating --> Processing: Validation Passed
    Invalid --> [*]: Return Error
    Processing --> Calculating: Data Fetched
    Calculating --> Completed: Calculations Done
    Calculating --> Failed: Calculation Error
    Completed --> Cached: Store in Cache
    Cached --> [*]: Return Results
    Failed --> [*]: Return Error
```

### 10.2 Risk Level States

```mermaid
stateDiagram-v2
    [*] --> Assessing: Start Assessment
    Assessing --> Low: Score < 0.8
    Assessing --> Medium: Score 0.8-1.5
    Assessing --> High: Score > 1.5
    Low --> [*]: Risk Level Set
    Medium --> [*]: Risk Level Set
    High --> [*]: Risk Level Set
```

---

**Document End**
