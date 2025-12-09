# Business Requirements: Demand Forecasting

## Document Information
- **Module**: Operational Planning
- **Component**: Demand Forecasting
- **Version**: 1.0.0
- **Last Updated**: 2025-12-05
- **Status**: Active - For Implementation

## Related Documents
- [Use Cases](./UC-demand-forecasting.md) - User workflows and scenarios
- [Technical Specification](./TS-demand-forecasting.md) - System architecture and components
- [Data Definition](./DD-demand-forecasting.md) - Database entity descriptions
- [Flow Diagrams](./FD-demand-forecasting.md) - Visual workflow diagrams
- [Validations](./VAL-demand-forecasting.md) - Validation rules
- [Inventory Operations Shared Method](../../shared-methods/inventory-operations/SM-inventory-operations.md) - Inventory transaction patterns
- [Costing Methods Shared Method](../../shared-methods/inventory-valuation/SM-costing-methods.md) - FIFO/AVG costing integration

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-05 | Documentation Team | Initial version with backend requirements |

---

## 1. Executive Summary

### 1.1 Purpose
The Demand Forecasting module provides advanced analytics and prediction capabilities for inventory management in hospitality operations. It enables operations managers, executive chefs, and inventory planners to forecast future demand, analyze consumption trends, optimize inventory levels, and identify slow-moving or dead stock items.

### 1.2 Scope

**In Scope**:
- Inventory demand forecasting using multiple statistical methods
- Consumption trend analysis over configurable time periods
- Inventory optimization recommendations (reorder points, safety stock)
- Dead stock and obsolescence analysis
- Performance dashboard with KPIs and alerts
- Integration with inventory transactions and costing methods

**Out of Scope**:
- Recipe demand forecasting (handled by Menu Engineering)
- Sales forecasting from POS systems (external integration)
- Production scheduling (handled by Production module)
- Automatic purchase order generation (handled by Procurement)

### 1.3 Business Value
- **Waste Reduction**: Accurate forecasting minimizes overstocking and spoilage
- **Stockout Prevention**: Proactive alerts prevent operational disruptions
- **Cost Optimization**: Improved inventory turnover reduces carrying costs
- **Data-Driven Decisions**: Statistical analysis replaces intuition-based ordering
- **Operational Efficiency**: Automated analysis saves staff time on manual calculations

---

## 2. Functional Requirements

### FR-DF-001: Generate Inventory Demand Forecast
**Priority**: Critical
**User Story**: As an Inventory Manager, I want to generate demand forecasts for inventory items so that I can plan procurement and prevent stockouts.

**Requirements**:
1. System shall support four forecasting methods:
   - **Moving Average**: 30-day rolling window baseline calculation
   - **Exponential Smoothing**: Alpha parameter 0.3 weighted recent data
   - **Linear Regression**: Trend-based forecasting with slope calculation
   - **Seasonal Decomposition**: Seasonal pattern detection with monthly periodicity
2. System shall accept configurable forecast period (default: 30 days)
3. System shall calculate for each item:
   - Projected demand quantity
   - Projected ending stock
   - Recommended purchase quantity
   - Forecast accuracy score (0-100%)
   - Confidence level percentage
   - Risk level (low/medium/high)
4. System shall factor in:
   - Seasonality patterns from historical data
   - Trend factors (increasing/decreasing/stable)
   - Demand variability coefficient
5. System shall support filtering by specific item IDs or all active items

**Acceptance Criteria**:
- Forecast generates within 5 seconds for up to 1000 items
- Forecast accuracy metric is calculated based on historical variance
- Risk assessment considers ending stock, variability, and accuracy
- All forecasts include metadata: calculation time, data points, last updated

---

### FR-DF-002: Perform Trend Analysis
**Priority**: High
**User Story**: As an Operations Manager, I want to analyze consumption trends so that I can identify patterns and make informed inventory decisions.

**Requirements**:
1. System shall analyze trends over configurable time period (default: 180 days)
2. System shall provide consumption trend analysis:
   - Direction: increasing, decreasing, or stable
   - Slope coefficient for rate of change
   - Confidence score for trend detection
   - Seasonal pattern indicator (boolean)
3. System shall provide stock level trend analysis:
   - Average stock levels
   - Stock variability coefficient
   - Stockout frequency percentage
   - Overstock frequency percentage
4. System shall provide cost trend analysis:
   - Average unit cost (with currency)
   - Cost variability coefficient
   - Inflation rate percentage
5. System shall provide supplier performance metrics:
   - Average lead time (days)
   - Lead time variability
   - On-time delivery rate percentage
   - Quality issues count
6. System shall generate actionable recommendations based on trend analysis

**Acceptance Criteria**:
- Trend analysis completes within 10 seconds for 500 items
- Recommendations are specific and actionable
- Category grouping is included in analysis results
- Analysis period boundaries are clearly defined

---

### FR-DF-003: Generate Optimization Recommendations
**Priority**: High
**User Story**: As an Inventory Manager, I want optimization recommendations so that I can improve inventory turnover and reduce carrying costs.

**Requirements**:
1. System shall calculate current inventory metrics:
   - Average stock level
   - Turnover rate (annual)
   - Carrying cost (monetary value)
   - Service level percentage
2. System shall calculate optimized target metrics:
   - Recommended reorder point
   - Recommended order quantity (EOQ)
   - Recommended safety stock level
   - Expected turnover rate improvement
   - Expected carrying cost reduction
   - Expected service level at target (default: 95%)
3. System shall calculate potential savings:
   - Carrying cost savings
   - Stockout cost savings
   - Total annual savings
   - Payback period (months)
4. System shall assess implementation risk (low/medium/high)
5. System shall provide recommended action:
   - Implement (high savings, low risk)
   - Pilot (moderate savings)
   - Monitor (low savings or high risk)
   - Reject (negative ROI)

**Acceptance Criteria**:
- Optimization calculations use industry-standard formulas
- Service level target is configurable (default: 95%)
- Savings calculations are in consistent currency
- Risk assessment considers current vs. optimized metrics gap

---

### FR-DF-004: Analyze Dead Stock
**Priority**: Medium
**User Story**: As a Financial Controller, I want to identify dead stock items so that we can minimize obsolescence losses and free up working capital.

**Requirements**:
1. System shall identify items with no movement for configurable threshold (default: 90 days)
2. System shall analyze consumption patterns:
   - Days since last movement
   - Last movement date
   - Average monthly consumption (historical)
   - Months of stock on hand
3. System shall calculate financial impact:
   - Current stock quantity
   - Current inventory value
   - Potential loss amount
   - Estimated liquidation value
4. System shall classify obsolescence risk:
   - Low: < 90 days no movement
   - Medium: 90-180 days no movement
   - High: 180-365 days no movement
   - Critical: > 365 days or > 24 months stock
5. System shall recommend action for each item:
   - Continue stocking (low risk)
   - Reduce stock levels (medium risk)
   - Liquidate inventory (high risk, high value)
   - Return to supplier (high risk)
   - Write off (critical risk)
6. System shall support filtering by location IDs

**Acceptance Criteria**:
- Only items with stock > 0 are analyzed
- Movement types considered: ISSUE, TRANSFER_OUT, WASTE
- Liquidation value uses recovery percentage based on risk level
- Potential loss calculation factors in obsolescence risk

---

### FR-DF-005: Generate Performance Dashboard
**Priority**: High
**User Story**: As a General Manager, I want a performance dashboard so that I can monitor overall inventory health and identify areas needing attention.

**Requirements**:
1. System shall calculate overall metrics:
   - Total inventory value
   - Inventory turnover rate
   - Days of inventory (DSI)
   - Fill rate percentage
   - Stockout rate percentage
   - Accuracy rate percentage
   - Shrinkage rate percentage
2. System shall provide category breakdown:
   - Category ID and name
   - Inventory value by category
   - Turnover rate by category
   - Contribution percentage
   - Item count
   - Alert count
3. System shall provide location breakdown:
   - Location ID and name
   - Inventory value by location
   - Utilization percentage
   - Accuracy rate
   - Item and movement counts
4. System shall provide alert counts:
   - Low stock alerts
   - Overstock alerts
   - Dead stock alerts
   - Expiring items alerts
   - High value items
   - Fast moving items
5. System shall calculate trends comparing current vs. previous period:
   - Metric name
   - Current and previous values
   - Change amount and percentage
   - Trend direction (up/down/stable)
6. System shall support configurable period (default: 30 days)
7. System shall support filtering by location IDs

**Acceptance Criteria**:
- Dashboard loads within 3 seconds
- All monetary values include currency
- Trends show period-over-period comparison
- Alert counts reflect current inventory state

---

### FR-DF-006: Dashboard Widget Display
**Priority**: Medium
**User Story**: As an Operations Manager, I want to see demand forecast vs. actual performance on my dashboard so that I can quickly assess forecast accuracy.

**Requirements**:
1. System shall display 7-day rolling forecast vs. actual chart
2. Widget shall show dual data series (forecast line, actual line)
3. Widget shall be draggable and repositionable on dashboard
4. Widget shall integrate with Recharts visualization library
5. Chart shall highlight variance when forecast differs from actual by > 10%

**Acceptance Criteria**:
- Widget renders within 500ms
- Chart is responsive and mobile-friendly
- Data updates reflect latest forecast generation
- Widget position persists across sessions

---

## 3. Business Rules

### General Rules
- **BR-DF-001**: Forecasts shall only be generated for active inventory items
- **BR-DF-002**: Historical data of at least 30 days is required for accurate forecasting
- **BR-DF-003**: Seasonal decomposition requires minimum 60 days (2 periods) of data
- **BR-DF-004**: All monetary calculations use system default currency unless specified

### Calculation Rules
- **BR-DF-005**: Safety stock = projectedDemand × demandVariability × 1.65 (95% service level)
- **BR-DF-006**: Recommended purchase = MAX(0, (projectedDemand + safetyStock) - currentStock)
- **BR-DF-007**: Moving average uses 30-day window or available data length (whichever is smaller)
- **BR-DF-008**: Exponential smoothing uses alpha = 0.3 (moderate responsiveness)
- **BR-DF-009**: Risk score = (1 - accuracy) + variability + (endingStock < 0 ? 1 : 0)

### Risk Assessment Rules
- **BR-DF-010**: Risk is LOW when score < 0.8
- **BR-DF-011**: Risk is MEDIUM when score 0.8-1.5
- **BR-DF-012**: Risk is HIGH when score > 1.5

### Dead Stock Rules
- **BR-DF-013**: Dead stock threshold default is 90 days without movement
- **BR-DF-014**: Obsolescence is CRITICAL when > 365 days or > 24 months of stock
- **BR-DF-015**: Liquidation recovery percentage: Critical=10%, High=30%, Medium=60%, Low=80%

### Optimization Rules
- **BR-DF-016**: Implement action when savings > $100 AND risk is LOW
- **BR-DF-017**: Pilot action when savings > $50 (moderate ROI)
- **BR-DF-018**: Monitor action for low savings or high risk items
- **BR-DF-019**: Target service level default is 95%

---

## 4. Data Model

### 4.1 InventoryForecast Entity

**Purpose**: Represents a demand forecast for an inventory item over a specified period.

```typescript
interface InventoryForecast {
  itemId: string                    // Inventory item identifier
  itemName: string                  // Human-readable item name
  currentStock: number              // Current quantity on hand
  forecastPeriodDays: number        // Forecast horizon in days
  projectedDemand: number           // Forecasted consumption quantity
  projectedEndingStock: number      // Expected stock at period end
  recommendedPurchaseQuantity: number // Suggested order quantity
  forecastAccuracy: number          // Accuracy score (0-1)
  seasonalityFactor: number         // Seasonal adjustment multiplier
  trendFactor: number               // Trend adjustment multiplier
  demandVariability: number         // Coefficient of variation
  forecastMethod: 'moving_average' | 'exponential_smoothing' | 'linear_regression' | 'seasonal_decomposition'
  confidenceLevel: number           // Confidence percentage (0-100)
  riskLevel: 'low' | 'medium' | 'high'
}
```

### 4.2 InventoryTrendAnalysis Entity

**Purpose**: Represents comprehensive trend analysis for an inventory item.

```typescript
interface InventoryTrendAnalysis {
  itemId: string
  itemName: string
  category: string
  analysisPeriod: {
    startDate: Date
    endDate: Date
    periodDays: number
  }
  consumptionTrend: {
    direction: 'increasing' | 'decreasing' | 'stable'
    slope: number                   // Rate of change
    confidence: number              // Analysis confidence
    seasonalPattern: boolean        // Has seasonal pattern
  }
  stockLevelTrend: {
    averageStock: number
    stockVariability: number
    stockoutFrequency: number       // Percentage of time out of stock
    overstockFrequency: number      // Percentage of time overstocked
  }
  costTrend: {
    averageCost: Money
    costVariability: number
    inflationRate: number           // Cost increase rate
  }
  supplierPerformance: {
    averageLeadTime: number         // Days
    leadTimeVariability: number
    onTimeDeliveryRate: number      // Percentage
    qualityIssues: number           // Count
  }
  recommendations: string[]         // Actionable recommendations
}
```

### 4.3 InventoryOptimization Entity

**Purpose**: Represents optimization recommendations for an inventory item.

```typescript
interface InventoryOptimization {
  itemId: string
  itemName: string
  currentMetrics: {
    averageStock: number
    turnoverRate: number
    carryingCost: Money
    serviceLevel: number
  }
  optimizedMetrics: {
    recommendedReorderPoint: number
    recommendedOrderQuantity: number
    recommendedSafetyStock: number
    expectedTurnoverRate: number
    expectedCarryingCost: Money
    expectedServiceLevel: number
  }
  potentialSavings: {
    carryingCostSavings: Money
    stockoutCostSavings: Money
    totalSavings: Money
    paybackPeriod: number           // Months
  }
  implementationRisk: 'low' | 'medium' | 'high'
  recommendedAction: 'implement' | 'pilot' | 'monitor' | 'reject'
}
```

### 4.4 DeadStockAnalysis Entity

**Purpose**: Represents dead stock analysis for an inventory item.

```typescript
interface DeadStockAnalysis {
  itemId: string
  itemName: string
  currentStock: number
  currentValue: Money
  lastMovementDate: Date
  daysSinceLastMovement: number
  averageMonthlyConsumption: number
  monthsOfStock: number
  obsolescenceRisk: 'low' | 'medium' | 'high' | 'critical'
  recommendedAction: 'continue_stocking' | 'reduce_stock' | 'liquidate' | 'return_to_supplier' | 'write_off'
  potentialLoss: Money
  liquidationValue: Money
}
```

### 4.5 InventoryPerformanceDashboard Entity

**Purpose**: Represents aggregated inventory performance metrics.

```typescript
interface InventoryPerformanceDashboard {
  overallMetrics: {
    totalInventoryValue: Money
    inventoryTurnover: number
    daysOfInventory: number
    fillRate: number
    stockoutRate: number
    accuracyRate: number
    shrinkageRate: number
  }
  categoryBreakdown: Array<{
    categoryId: string
    categoryName: string
    value: Money
    turnover: number
    contribution: number
    items: number
    alerts: number
  }>
  locationBreakdown: Array<{
    locationId: string
    locationName: string
    value: Money
    utilization: number
    accuracy: number
    items: number
    movements: number
  }>
  alerts: {
    lowStock: number
    overstock: number
    deadStock: number
    expiring: number
    highValue: number
    fastMoving: number
  }
  trends: Array<{
    metric: string
    current: number
    previous: number
    change: number
    changePercentage: number
    trend: 'up' | 'down' | 'stable'
  }>
}
```

---

## 5. Integration Points

### 5.1 Internal Integrations

| Integration | Direction | Description |
|-------------|-----------|-------------|
| Inventory Management | Inbound | Stock balances, transaction history |
| Procurement | Outbound | Purchase quantity recommendations |
| Recipe Management | Inbound | Recipe ingredient consumption |
| Store Operations | Inbound | Requisition patterns by department |
| Financial Reporting | Outbound | Inventory valuation, dead stock analysis |

### 5.2 Shared Methods Integration

#### SM-INVENTORY-OPERATIONS
- **Balance Queries**: Real-time stock balance for current stock calculations
- **Transaction Recording**: Historical consumption data for trend analysis
- **State Management**: Inventory status for active item filtering

#### SM-COSTING-METHODS
- **FIFO Cost Layers**: Lot-level costs for inventory valuation
- **Periodic Average**: Average costs for cost trend analysis
- **Cost Variance**: Historical cost changes for inflation calculations

### 5.3 Data Flow

```
Inventory Transactions → Analytics Service → Forecasts/Trends
                                          → Optimization Recommendations
                                          → Dead Stock Analysis
                                          → Performance Dashboard

Dashboard Widget ← Dashboard Data ← Performance Dashboard
```

---

## 6. Non-Functional Requirements

### 6.1 Performance
- **NFR-DF-001**: Forecast generation shall complete within 5 seconds for 1000 items
- **NFR-DF-002**: Trend analysis shall complete within 10 seconds for 500 items
- **NFR-DF-003**: Dashboard shall load within 3 seconds
- **NFR-DF-004**: Widget shall render within 500ms

### 6.2 Scalability
- **NFR-DF-005**: System shall support analysis of up to 50,000 inventory items
- **NFR-DF-006**: System shall retain 365 days of transaction history for analysis
- **NFR-DF-007**: System shall support concurrent analytics requests from 50 users

### 6.3 Reliability
- **NFR-DF-008**: Analytics calculations shall be deterministic (same inputs = same outputs)
- **NFR-DF-009**: System shall handle missing data gracefully with default values
- **NFR-DF-010**: System shall log all calculation errors with full context

### 6.4 Security
- **NFR-DF-011**: Forecast data shall be accessible based on user location permissions
- **NFR-DF-012**: Financial metrics (costs, values) require finance role access
- **NFR-DF-013**: Audit trail shall be maintained for optimization actions taken

---

## 7. Success Metrics

### 7.1 Accuracy Metrics
- Forecast accuracy target: ≥ 85% within ±10% variance
- Trend prediction accuracy: ≥ 80% directional accuracy

### 7.2 Efficiency Metrics
- Inventory turnover improvement: ≥ 10% within 6 months
- Carrying cost reduction: ≥ 15% within 12 months
- Stockout rate reduction: ≤ 5% of items

### 7.3 Adoption Metrics
- Dashboard usage: ≥ 80% of inventory managers weekly
- Recommendation acceptance rate: ≥ 60%

---

## 8. Assumptions and Constraints

### 8.1 Assumptions
- Historical transaction data is accurate and complete
- Inventory item master data is maintained correctly
- Users have appropriate permissions for their operational scope
- External factors (promotions, events) are not currently modeled

### 8.2 Constraints
- Forecasting requires minimum 30 days of historical data
- Seasonal patterns require minimum 60 days of data
- Real-time forecasting updates are not supported (batch processing)
- POS sales data integration is out of scope for initial release

### 8.3 Risks
- **Data Quality**: Poor transaction data affects forecast accuracy
  - *Mitigation*: Implement data validation and cleansing routines
- **Algorithm Selection**: Wrong method may reduce accuracy
  - *Mitigation*: Provide accuracy metrics for method comparison
- **User Adoption**: Complex analytics may deter use
  - *Mitigation*: Clear visualizations and actionable recommendations

---

## 9. Future Enhancements

### Phase 2
- Machine learning-based forecasting models
- Event-driven demand adjustments (holidays, promotions)
- Automatic reorder point updates based on optimization

### Future Considerations
- Integration with POS for demand signals
- Multi-location demand pooling
- Supplier collaboration portals for forecast sharing
- What-if scenario planning

---

## 10. Backend Requirements

### 10.1 Service Architecture

**Primary Service**: `InventoryAnalyticsService`
**Location**: `lib/services/inventory/inventory-analytics-service.ts`

```
InventoryAnalyticsService
├── generateInventoryForecast()     → InventoryForecast[]
├── performTrendAnalysis()          → InventoryTrendAnalysis[]
├── generateOptimizationRecommendations() → InventoryOptimization[]
├── analyzeDeadStock()              → DeadStockAnalysis[]
└── generatePerformanceDashboard()  → InventoryPerformanceDashboard
```

### 10.2 Service Methods

#### BE-SA-DF-001: generateInventoryForecast
```typescript
async generateInventoryForecast(
  itemIds?: string[],                    // Optional item filter
  forecastDays?: number,                 // Default: 30
  method?: ForecastMethod                // Default: 'moving_average'
): Promise<AnalyticsResult<InventoryForecast[]>>
```

**Data Sources**:
- `inventory_items` table (active items)
- `inventory_transactions` table (365-day history)
- `stock_balances` table (current stock)

**Algorithm Implementation**:
- Moving Average: 30-day rolling window
- Exponential Smoothing: Alpha = 0.3
- Linear Regression: Least squares regression
- Seasonal Decomposition: Monthly pattern detection

#### BE-SA-DF-002: performTrendAnalysis
```typescript
async performTrendAnalysis(
  itemIds?: string[],
  analysisStartDate?: Date,              // Default: 180 days ago
  analysisEndDate?: Date                 // Default: today
): Promise<AnalyticsResult<InventoryTrendAnalysis[]>>
```

**Analysis Components**:
- Consumption trend (direction, slope, confidence)
- Stock level trend (variability, stockout frequency)
- Cost trend (average, variability, inflation)
- Supplier performance (lead time, on-time delivery)

#### BE-SA-DF-003: generateOptimizationRecommendations
```typescript
async generateOptimizationRecommendations(
  itemIds?: string[],
  targetServiceLevel?: number            // Default: 95.0
): Promise<AnalyticsResult<InventoryOptimization[]>>
```

**Optimization Calculations**:
- EOQ (Economic Order Quantity)
- ROP (Reorder Point)
- Safety stock based on service level
- Carrying cost analysis

#### BE-SA-DF-004: analyzeDeadStock
```typescript
async analyzeDeadStock(
  thresholdDays?: number,                // Default: 90
  locationIds?: string[]                 // Optional location filter
): Promise<AnalyticsResult<DeadStockAnalysis[]>>
```

**Movement Types Considered**: ISSUE, TRANSFER_OUT, WASTE

#### BE-SA-DF-005: generatePerformanceDashboard
```typescript
async generatePerformanceDashboard(
  periodDays?: number,                   // Default: 30
  locationIds?: string[]                 // Optional location filter
): Promise<AnalyticsResult<InventoryPerformanceDashboard>>
```

### 10.3 Database Dependencies

| Table | Usage | Columns Used |
|-------|-------|--------------|
| `inventory_items` | Item master | id, item_name, is_active |
| `inventory_transactions` | History | transaction_date, transaction_type, quantity |
| `stock_balances` | Current stock | location_id, quantity_on_hand |
| `categories` | Categorization | id, name |

### 10.4 Caching Strategy

**Cache Layer**: `CachedInventoryCalculations` with `EnhancedCacheLayer`

| Operation | Cache Duration | Invalidation |
|-----------|---------------|--------------|
| Forecast | 1 hour | New transactions |
| Trend Analysis | 4 hours | Daily refresh |
| Dashboard | 15 minutes | Stock changes |

### 10.5 Error Handling

**Result Pattern**:
```typescript
interface AnalyticsResult<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    calculationTime?: number
    dataPoints?: number
    confidence?: number
    lastUpdated?: Date
    nextUpdate?: Date
  }
}
```

All service methods return `AnalyticsResult<T>` with:
- `success: false` on any error
- `error` message with context
- `metadata` including calculation time and data points

### 10.6 Performance Optimization

- **Batch Processing**: Items processed in batches of 100
- **Parallel Queries**: Independent analyses run concurrently
- **Data Limiting**: Transaction history limited to 365 days
- **Index Usage**: Queries optimized for transaction_date indexes

---

## 11. Glossary

| Term | Definition |
|------|------------|
| **Moving Average** | Forecast based on average of recent data points |
| **Exponential Smoothing** | Weighted average giving more weight to recent data |
| **Linear Regression** | Trend-based forecast using least squares method |
| **Seasonal Decomposition** | Forecast accounting for recurring patterns |
| **Safety Stock** | Buffer inventory to prevent stockouts |
| **Reorder Point** | Stock level triggering new order |
| **EOQ** | Economic Order Quantity - optimal order size |
| **DSI** | Days Sales of Inventory - stock turnover metric |
| **Service Level** | Probability of meeting demand from stock |
| **Carrying Cost** | Cost of holding inventory (storage, capital, obsolescence) |

---

## 12. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Owner | | | |
| Product Manager | | | |
| Technical Lead | | | |
| Finance Representative | | | |
| Quality Assurance | | | |

---

**Document End**
