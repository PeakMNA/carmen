# Inventory Planning - Data Definition

## Document Information

| Field | Value |
|-------|-------|
| Module | Inventory Planning |
| Version | 1.0.0 |
| Last Updated | 2025-12-06 |
| Status | Draft |

---

## 1. Data Model Overview

### 1.1 Entity Relationship Summary

```
InventoryItem ─────┬──── InventoryOptimization
                   │
                   ├──── DeadStockAnalysis
                   │
                   └──── PerformanceDashboard
                              │
                              ├── CategoryBreakdown
                              ├── LocationBreakdown
                              └── Alerts
```

### 1.2 Core Entities

| Entity | Purpose | Source |
|--------|---------|--------|
| InventoryOptimization | Optimization recommendations | Calculated |
| DeadStockAnalysis | Dead stock assessment | Calculated |
| InventoryPerformanceDashboard | KPI dashboard | Calculated |
| CategoryBreakdown | Category-level metrics | Aggregated |
| LocationBreakdown | Location-level metrics | Aggregated |
| InventoryAlert | System alerts | Generated |

---

## 2. Entity Definitions

### 2.1 InventoryOptimization

**Purpose**: Stores optimization recommendations for inventory items

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| itemId | string | Yes | Reference to inventory item |
| itemName | string | Yes | Item display name |
| category | string | Yes | Item category |
| location | string | No | Location if location-specific |
| currentMetrics | CurrentMetrics | Yes | Current inventory parameters |
| optimizedMetrics | OptimizedMetrics | Yes | Recommended parameters |
| potentialSavings | PotentialSavings | Yes | Calculated savings |
| implementationRisk | RiskLevel | Yes | Risk assessment |
| recommendedAction | ActionType | Yes | Recommended action |
| calculatedAt | DateTime | Yes | Calculation timestamp |

#### CurrentMetrics Object

| Attribute | Type | Description |
|-----------|------|-------------|
| currentStock | number | Current stock quantity |
| averageStock | number | Average stock over period |
| turnoverRate | number | Annual turnover rate |
| carryingCost | number | Annual carrying cost ($) |
| currentReorderPoint | number | Current reorder point |
| currentOrderQuantity | number | Current order quantity |
| serviceLevel | number | Current service level (0-1) |

#### OptimizedMetrics Object

| Attribute | Type | Description |
|-----------|------|-------------|
| recommendedReorderPoint | number | Optimized reorder point |
| recommendedOrderQuantity | number | Optimized order quantity (EOQ) |
| recommendedSafetyStock | number | Optimized safety stock |
| targetServiceLevel | number | Target service level (0-1) |

#### PotentialSavings Object

| Attribute | Type | Description |
|-----------|------|-------------|
| carryingCostSavings | number | Savings from reduced carrying cost ($) |
| stockoutCostSavings | number | Savings from reduced stockouts ($) |
| totalSavings | number | Total annual savings ($) |
| paybackPeriod | number | Payback period in months |

#### Enumerations

**RiskLevel**:
| Value | Description | Criteria |
|-------|-------------|----------|
| low | Low implementation risk | Change ≤ 20%, non-critical |
| medium | Medium implementation risk | Change 20-50% |
| high | High implementation risk | Change > 50%, critical item |

**ActionType**:
| Value | Description | Criteria |
|-------|-------------|----------|
| implement | Implement immediately | Savings > $100, low risk |
| pilot | Pilot first | Savings > $50, any risk |
| monitor | Monitor only | Low savings, medium risk |
| reject | Do not implement | Negative ROI or high risk |

---

### 2.2 DeadStockAnalysis

**Purpose**: Stores dead stock analysis results

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| itemId | string | Yes | Reference to inventory item |
| itemName | string | Yes | Item display name |
| category | string | Yes | Item category |
| location | string | Yes | Item location |
| currentStock | number | Yes | Current stock quantity |
| currentValue | number | Yes | Current stock value ($) |
| lastMovementDate | DateTime | Yes | Date of last transaction |
| daysSinceLastMovement | number | Yes | Days since last movement |
| averageMonthlyConsumption | number | Yes | Avg monthly consumption |
| monthsOfStock | number | Yes | Months of supply on hand |
| obsolescenceRisk | ObsolescenceRisk | Yes | Risk classification |
| recommendedAction | DeadStockAction | Yes | Recommended action |
| potentialLoss | number | Yes | Potential loss if written off ($) |
| liquidationValue | number | Yes | Estimated liquidation value ($) |
| analyzedAt | DateTime | Yes | Analysis timestamp |

#### Enumerations

**ObsolescenceRisk**:
| Value | Description | Days No Movement | Months of Stock |
|-------|-------------|-----------------|-----------------|
| low | Low risk | ≤ 90 | ≤ 6 |
| medium | Medium risk | 91-180 | 6-12 |
| high | High risk | 181-365 | 12-24 |
| critical | Critical risk | > 365 | > 24 |

**DeadStockAction**:
| Value | Description |
|-------|-------------|
| continue_stocking | Continue normal stocking |
| reduce_stock | Reduce stock levels |
| liquidate | Sell at discounted price |
| return_to_supplier | Return to supplier |
| write_off | Write off inventory |

---

### 2.3 InventoryPerformanceDashboard

**Purpose**: Aggregated performance metrics for dashboard display

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| overallMetrics | OverallMetrics | Yes | Summary KPIs |
| categoryBreakdown | CategoryBreakdown[] | Yes | Metrics by category |
| locationBreakdown | LocationBreakdown[] | Yes | Metrics by location |
| alerts | AlertSummary | Yes | Alert counts by type |
| trends | TrendMetrics | No | Period-over-period changes |
| generatedAt | DateTime | Yes | Dashboard generation time |

#### OverallMetrics Object

| Attribute | Type | Description |
|-----------|------|-------------|
| totalInventoryValue | number | Total inventory value ($) |
| inventoryTurnover | number | Annual turnover ratio |
| daysOfInventory | number | Days of supply on hand |
| fillRate | number | Order fulfillment rate (0-1) |
| stockoutRate | number | Stockout event rate (0-1) |
| carryingCostRate | number | Carrying cost as % of value |

#### CategoryBreakdown Object

| Attribute | Type | Description |
|-----------|------|-------------|
| category | string | Category name |
| value | number | Total value ($) |
| percentage | number | % of total inventory |
| turnover | number | Category turnover rate |
| itemCount | number | Number of items |
| alertCount | number | Active alerts |

#### LocationBreakdown Object

| Attribute | Type | Description |
|-----------|------|-------------|
| location | string | Location name |
| locationId | string | Location identifier |
| value | number | Total value ($) |
| turnover | number | Location turnover rate |
| alertCount | number | Active alerts |
| status | LocationStatus | Stock status |

**LocationStatus**:
| Value | Description |
|-------|-------------|
| optimal | Stock levels are optimal |
| overstocked | Excess stock detected |
| understocked | Stock below optimal |

#### AlertSummary Object

| Attribute | Type | Description |
|-----------|------|-------------|
| lowStock | number | Items below reorder point |
| overstock | number | Items with excess stock |
| deadStock | number | Items with no movement |
| expiring | number | Items expiring soon |
| highValue | number | High-value items at risk |
| fastMoving | number | Fast-moving items (info) |

#### TrendMetrics Object

| Attribute | Type | Description |
|-----------|------|-------------|
| valueChange | number | % change in value |
| turnoverChange | number | % change in turnover |
| alertsChange | number | Change in alert count |

---

### 2.4 InventoryAlert

**Purpose**: System-generated alerts for inventory issues

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| alertId | string | Yes | Unique alert identifier |
| alertType | AlertType | Yes | Type of alert |
| severity | AlertSeverity | Yes | Alert severity |
| itemId | string | Yes | Related item |
| itemName | string | Yes | Item display name |
| location | string | Yes | Item location |
| message | string | Yes | Alert message |
| threshold | number | No | Trigger threshold |
| currentValue | number | No | Current value |
| createdAt | DateTime | Yes | Alert creation time |
| acknowledgedAt | DateTime | No | Acknowledgment time |
| resolvedAt | DateTime | No | Resolution time |

#### Enumerations

**AlertType**:
| Value | Description | Trigger |
|-------|-------------|---------|
| low_stock | Stock at or below reorder point | Stock ≤ ROP |
| overstock | Excessive stock | Stock > 3× monthly avg |
| dead_stock | No movement | Days idle > threshold |
| expiring_soon | Item expiring | Days to expiry ≤ 30 |
| high_value_risk | High-value item at risk | Value > $1000 & risk > medium |
| fast_moving | Rapid consumption | Turnover > 20× |

**AlertSeverity**:
| Value | Description | Color |
|-------|-------------|-------|
| critical | Immediate action required | Red |
| high | Action required soon | Orange |
| medium | Monitor closely | Yellow |
| low | Informational | Blue |

---

## 3. Calculated Fields

### 3.1 EOQ Calculation

**Economic Order Quantity (EOQ)**:

```
EOQ = √(2 × D × S / H)

Where:
- D = Annual demand (units)
- S = Order cost per order ($)
- H = Annual holding cost per unit ($)
```

**Example**:
| Parameter | Value |
|-----------|-------|
| Annual Demand (D) | 1,200 units |
| Order Cost (S) | $50 |
| Holding Cost (H) | $10/unit/year |
| **EOQ** | √(2 × 1200 × 50 / 10) = **109 units** |

### 3.2 Reorder Point Calculation

**Reorder Point (ROP)**:

```
ROP = (Lead Time × Daily Demand) + Safety Stock

Where:
- Lead Time = Days to receive order
- Daily Demand = Annual demand / 365
- Safety Stock = Z × σ × √LT
```

**Example**:
| Parameter | Value |
|-----------|-------|
| Lead Time | 7 days |
| Daily Demand | 3.3 units |
| Safety Stock | 10 units |
| **ROP** | (7 × 3.3) + 10 = **33 units** |

### 3.3 Safety Stock Calculation

**Safety Stock**:

```
Safety Stock = Z × σ × √LT

Where:
- Z = Z-score for service level
- σ = Standard deviation of demand
- LT = Lead time in days
```

**Z-Score Reference**:
| Service Level | Z-Score |
|--------------|---------|
| 90% | 1.28 |
| 95% | 1.65 |
| 99% | 2.33 |

### 3.4 Inventory Turnover

**Turnover Ratio**:

```
Turnover = Cost of Goods Sold / Average Inventory

Days of Inventory = 365 / Turnover
```

### 3.5 Risk Score Calculation

**Implementation Risk**:

```
Risk Score = (Change Magnitude × 0.4) + (Item Criticality × 0.3) + (Historical Variance × 0.3)

Risk Level:
- Low: Score < 0.3
- Medium: Score 0.3-0.6
- High: Score > 0.6
```

---

## 4. Data Validation Rules

### 4.1 Numeric Validations

| Field | Validation | Message |
|-------|------------|---------|
| currentStock | ≥ 0 | Stock cannot be negative |
| reorderPoint | ≥ 0 | Reorder point cannot be negative |
| orderQuantity | > 0 | Order quantity must be positive |
| safetyStock | ≥ 0 | Safety stock cannot be negative |
| serviceLevel | 0-1 | Service level must be between 0 and 1 |
| turnoverRate | ≥ 0 | Turnover rate cannot be negative |

### 4.2 Business Validations

| Rule | Description |
|------|-------------|
| ROP ≤ Stock + On Order | Reorder point must be achievable |
| EOQ ≤ Annual Demand | Order quantity cannot exceed annual demand |
| Safety Stock ≤ Reorder Point | Safety stock included in reorder point |
| Lead Time > 0 | Lead time must be positive |

---

## 5. Data Relationships

### 5.1 Foreign Key References

| Entity | References | Relationship |
|--------|------------|--------------|
| InventoryOptimization | InventoryItem | Many-to-One |
| InventoryOptimization | Location | Many-to-One |
| DeadStockAnalysis | InventoryItem | Many-to-One |
| DeadStockAnalysis | Location | Many-to-One |
| InventoryAlert | InventoryItem | Many-to-One |
| CategoryBreakdown | Category | Many-to-One |
| LocationBreakdown | Location | Many-to-One |

### 5.2 Aggregation Relationships

| Aggregate | Source | Aggregation |
|-----------|--------|-------------|
| OverallMetrics | InventoryItem | SUM, AVG |
| CategoryBreakdown | InventoryItem | GROUP BY category |
| LocationBreakdown | InventoryItem | GROUP BY location |
| AlertSummary | InventoryAlert | COUNT BY type |

---

## 6. Sample Data

### 6.1 InventoryOptimization Sample

```json
{
  "itemId": "INV-001",
  "itemName": "Olive Oil Extra Virgin 1L",
  "category": "Oils & Vinegars",
  "location": "Main Kitchen",
  "currentMetrics": {
    "currentStock": 45,
    "averageStock": 40,
    "turnoverRate": 12.5,
    "carryingCost": 180.00,
    "currentReorderPoint": 25,
    "currentOrderQuantity": 30,
    "serviceLevel": 0.92
  },
  "optimizedMetrics": {
    "recommendedReorderPoint": 20,
    "recommendedOrderQuantity": 35,
    "recommendedSafetyStock": 8,
    "targetServiceLevel": 0.95
  },
  "potentialSavings": {
    "carryingCostSavings": 45.00,
    "stockoutCostSavings": 20.00,
    "totalSavings": 65.00,
    "paybackPeriod": 1.5
  },
  "implementationRisk": "low",
  "recommendedAction": "implement",
  "calculatedAt": "2025-12-06T10:30:00Z"
}
```

### 6.2 DeadStockAnalysis Sample

```json
{
  "itemId": "INV-050",
  "itemName": "Specialty Truffle Salt",
  "category": "Seasonings",
  "location": "Main Kitchen",
  "currentStock": 12,
  "currentValue": 360.00,
  "lastMovementDate": "2025-06-01T00:00:00Z",
  "daysSinceLastMovement": 188,
  "averageMonthlyConsumption": 0.3,
  "monthsOfStock": 40,
  "obsolescenceRisk": "high",
  "recommendedAction": "liquidate",
  "potentialLoss": 216.00,
  "liquidationValue": 144.00,
  "analyzedAt": "2025-12-06T10:30:00Z"
}
```

### 6.3 Dashboard Sample

```json
{
  "overallMetrics": {
    "totalInventoryValue": 125000.00,
    "inventoryTurnover": 14.2,
    "daysOfInventory": 26,
    "fillRate": 0.97,
    "stockoutRate": 0.015,
    "carryingCostRate": 0.22
  },
  "categoryBreakdown": [
    {
      "category": "Produce",
      "value": 35000.00,
      "percentage": 28,
      "turnover": 24.5,
      "itemCount": 85,
      "alertCount": 12
    },
    {
      "category": "Proteins",
      "value": 45000.00,
      "percentage": 36,
      "turnover": 18.2,
      "itemCount": 120,
      "alertCount": 8
    }
  ],
  "locationBreakdown": [
    {
      "location": "Main Kitchen",
      "locationId": "LOC-001",
      "value": 80000.00,
      "turnover": 15.5,
      "alertCount": 15,
      "status": "optimal"
    },
    {
      "location": "Satellite Kitchen",
      "locationId": "LOC-002",
      "value": 45000.00,
      "turnover": 12.8,
      "alertCount": 8,
      "status": "overstocked"
    }
  ],
  "alerts": {
    "lowStock": 8,
    "overstock": 12,
    "deadStock": 5,
    "expiring": 3,
    "highValue": 2,
    "fastMoving": 15
  },
  "trends": {
    "valueChange": -2.5,
    "turnoverChange": 5.2,
    "alertsChange": -3
  },
  "generatedAt": "2025-12-06T10:30:00Z"
}
```

---

**Document End**
