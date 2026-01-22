# Inventory Planning - Data Dictionary

## Document Information

| Field | Value |
|-------|-------|
| Module | Operational Planning > Inventory Planning |
| Version | 2.0.0 |
| Last Updated | 2025-01-17 |
| Status | Implemented |

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-06 | Development Team | Initial documentation |
| 2.0.0 | 2025-01-17 | Development Team | Updated with actual TypeScript interfaces from implementation |

---

## 1. Data Model Overview

### 1.1 Entity Relationship Summary

```
Dashboard Data
├── OverallMetrics
├── AlertCounts
├── OptimizationActions[]
├── LocationPerformance[]
└── RecentRecommendations[]

Reorder Management
├── ReorderRecommendation[]
│   ├── CurrentMetrics
│   ├── RecommendedMetrics
│   └── PotentialImpact

Dead Stock Analysis
├── RiskOverview (Critical/High/Medium/Low)
└── DeadStockItem[]
    ├── StockAnalysis
    └── FinancialImpact

Safety Stock
└── SafetyStockItem[]
    └── RecommendedByServiceLevel

Multi-Location
├── LocationData[]
└── TransferRecommendation[]

Settings
└── InventoryPlanningSettings
```

---

## 2. TypeScript Interfaces

### 2.1 Dashboard Interfaces

#### DashboardData

```typescript
interface DashboardData {
  overallMetrics: OverallMetrics
  alerts: AlertCounts
  potentialSavings: number
  itemsAtRisk: number
  optimizationRate: number
  deadStockValue: number
  trends: TrendData
}
```

#### OverallMetrics

```typescript
interface OverallMetrics {
  totalInventoryValue: number    // Total value in dollars
  inventoryTurnover: number      // Annual turnover ratio
  daysOfInventory: number        // Days of supply on hand
  fillRate: number               // Order fulfillment rate (0-1)
  stockoutRate: number           // Stockout event rate (0-1)
}
```

#### AlertCounts

```typescript
interface AlertCounts {
  lowStock: number       // Items at or below reorder point
  overstock: number      // Items with excess stock
  deadStock: number      // Items with no movement
  expiring: number       // Items expiring soon
  highValue: number      // High-value items at risk
  fastMoving: number     // Fast-moving items (info)
}
```

#### TrendData

```typescript
interface TrendData {
  savingsChange: number         // Percentage change in savings
  riskChange: number            // Change in items at risk
  optimizationChange: number    // Percentage change in optimization rate
  deadStockChange: number       // Dollar change in dead stock value
}
```

#### OptimizationAction

```typescript
interface OptimizationAction {
  name: string           // Action type name
  value: number          // Count of items
  color: string          // Hex color for chart
}
```

#### LocationPerformance

```typescript
interface LocationPerformance {
  location: string       // Location name
  value: number          // Inventory value in dollars
  turnover: number       // Turnover rate
  status: 'optimal' | 'overstocked' | 'understocked'
}
```

#### RecentRecommendation

```typescript
interface RecentRecommendation {
  id: string
  item: string           // Product name
  category: string       // Category name
  savings: number        // Annual savings in dollars
  risk: 'low' | 'medium' | 'high'
  action: 'implement' | 'pilot' | 'monitor' | 'reject'
}
```

---

### 2.2 Reorder Management Interfaces

#### ReorderRecommendation

```typescript
interface ReorderRecommendation {
  id: string
  productCode: string
  productName: string
  category: string
  locationId: string
  currentROP: number              // Current Reorder Point
  currentEOQ: number              // Current Economic Order Quantity
  recommendedROP: number          // Recommended ROP
  recommendedEOQ: number          // Recommended EOQ
  turnoverRate: number            // Annual turnover rate
  annualSavings: number           // Projected annual savings ($)
  riskLevel: 'low' | 'medium' | 'high'
  actionType: 'implement' | 'pilot' | 'monitor' | 'reject'
  leadTime: number                // Lead time in days
  dailyDemand: number             // Average daily demand
  demandVariability: number       // Demand standard deviation
  currentServiceLevel: number     // Current service level (0-1)
  targetServiceLevel: number      // Target service level (0-1)
  currentSafetyStock: number      // Current safety stock
  recommendedSafetyStock: number  // Recommended safety stock
  paybackPeriod: number           // Payback period in months
  unit: string                    // Unit of measure
}
```

#### Action Type Enum

```typescript
type ActionType = 'implement' | 'pilot' | 'monitor' | 'reject'
```

| Value | Description | Color | Criteria |
|-------|-------------|-------|----------|
| implement | Implement immediately | Green (#22c55e) | Low risk, savings > $100 |
| pilot | Pilot first | Blue (#3b82f6) | Any risk, savings > $50 |
| monitor | Monitor only | Yellow (#f59e0b) | Medium risk, savings > $0 |
| reject | Do not implement | Red (#ef4444) | High risk or negative savings |

#### Risk Level Enum

```typescript
type RiskLevel = 'low' | 'medium' | 'high'
```

| Value | Description | Color | Criteria |
|-------|-------------|-------|----------|
| low | Low implementation risk | Green | Change <= 20%, non-critical item |
| medium | Medium implementation risk | Yellow | Change 20-50% |
| high | High implementation risk | Red | Change > 50%, critical item |

---

### 2.3 Dead Stock Interfaces

#### DeadStockItem

```typescript
interface DeadStockItem {
  id: string
  productCode: string
  productName: string
  category: string
  locationId: string
  locationName: string
  currentStock: number           // Current stock quantity
  unit: string                   // Unit of measure
  value: number                  // Current stock value ($)
  lastMovementDate: string       // ISO date string
  daysSinceMovement: number      // Days since last movement
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  monthsOfStock: number          // Months of supply on hand
  recommendedAction: DeadStockAction
  liquidationValue: number       // Estimated liquidation value ($)
  potentialLoss: number          // Potential loss if written off ($)
  expiryDate?: string            // Optional expiry date
  daysUntilExpiry?: number       // Optional days until expiry
}
```

#### Dead Stock Action Enum

```typescript
type DeadStockAction = 'liquidate' | 'return' | 'writeoff' | 'continue' | 'reduce'
```

| Value | Label | Description | Recovery Rate |
|-------|-------|-------------|---------------|
| liquidate | Liquidate | Sell at discounted price | 40-60% |
| return | Return to Supplier | Return for credit | 80-100% |
| writeoff | Write Off | Write off as loss | 0% |
| continue | Continue Stocking | Keep as is | N/A |
| reduce | Reduce Stock | Lower stock levels | N/A |

#### Dead Stock Risk Level Enum

```typescript
type DeadStockRiskLevel = 'critical' | 'high' | 'medium' | 'low'
```

| Value | Days Since Movement | OR | Months of Stock | Color |
|-------|--------------------|----|-----------------|-------|
| critical | > 365 | OR | > 24 | Red (bg-red-100) |
| high | > 180 | OR | > 12 | Orange (bg-orange-100) |
| medium | > 90 | OR | > 6 | Yellow (bg-yellow-100) |
| low | <= 90 | AND | <= 6 | Green (bg-green-100) |

#### Threshold Days Options

```typescript
const thresholdOptions = [60, 90, 120, 180, 365]
```

---

### 2.4 Safety Stock Interfaces

#### SafetyStockItem

```typescript
interface SafetyStockItem {
  id: string
  productCode: string
  productName: string
  category: string
  currentSafetyStock: number
  recommendedSafetyStock: {
    [key: string]: number    // Key: service level ('90', '95', '99')
  }
  unit: string
  unitCost: number
  demandVariability: number      // Demand standard deviation
  leadTimeVariability: number    // Lead time variability
  currentServiceLevel: number    // Current service level (0-1)
}
```

#### Service Level Z-Scores

```typescript
const serviceLevelZScores: Record<string, number> = {
  '90': 1.28,
  '95': 1.65,
  '99': 2.33
}
```

| Service Level | Z-Score | Safety Stock Multiplier |
|--------------|---------|------------------------|
| 90% | 1.28 | Lower cost, higher stockout risk |
| 95% | 1.65 | Default balanced approach |
| 99% | 2.33 | Higher cost, minimal stockout risk |

---

### 2.5 Multi-Location Interfaces

#### LocationData

```typescript
interface LocationData {
  id: string
  name: string
  inventoryValue: number         // Total inventory value ($)
  turnoverRate: number           // Annual turnover rate
  alertCount: number             // Number of active alerts
  status: 'optimal' | 'overstocked' | 'understocked'
  efficiency: number             // Efficiency score (0-100)
  capacityUtilization: number    // Capacity utilization (0-100)
}
```

#### Location Status Enum

```typescript
type LocationStatus = 'optimal' | 'overstocked' | 'understocked'
```

| Value | Description | Color |
|-------|-------------|-------|
| optimal | Stock levels are balanced | Green |
| overstocked | Excess stock detected | Yellow |
| understocked | Stock below optimal | Red |

#### TransferRecommendation

```typescript
interface TransferRecommendation {
  id: string
  productCode: string
  productName: string
  fromLocationId: string
  toLocationId: string
  quantity: number
  unit: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  estimatedSavings: number       // Estimated savings ($)
}
```

#### Transfer Priority Enum

```typescript
type TransferPriority = 'high' | 'medium' | 'low'
```

| Value | Description | Color |
|-------|-------------|-------|
| high | Urgent transfer needed | Red |
| medium | Transfer recommended | Yellow |
| low | Optional transfer | Green |

---

### 2.6 Settings Interface

#### InventoryPlanningSettings

```typescript
interface InventoryPlanningSettings {
  // Default Parameters
  defaultServiceLevel: string        // '90' | '95' | '99'
  orderCostPerOrder: number          // Cost per order ($)
  holdingCostRate: number            // Holding cost rate (0-1)
  defaultLeadTime: number            // Default lead time (days)

  // Alert Thresholds
  deadStockThreshold: number         // Dead stock threshold (days)
  lowStockAlertEnabled: boolean      // Enable low stock alerts
  deadStockAlertEnabled: boolean     // Enable dead stock alerts
  overstockAlertEnabled: boolean     // Enable overstock alerts

  // Notification Settings
  emailNotificationsEnabled: boolean // Enable email notifications
  notificationEmail: string          // Email address for notifications
  digestFrequency: string            // 'daily' | 'weekly' | 'monthly'

  // Automation Settings
  autoApplyLowRisk: boolean          // Auto-apply low risk recommendations
  autoGenerateWeekly: boolean        // Auto-generate recommendations weekly
  syncWithProcurement: boolean       // Sync with procurement module
}
```

#### Default Settings Values

```typescript
const defaultSettings: InventoryPlanningSettings = {
  defaultServiceLevel: '95',
  orderCostPerOrder: 50,
  holdingCostRate: 0.25,
  defaultLeadTime: 7,
  deadStockThreshold: 90,
  lowStockAlertEnabled: true,
  deadStockAlertEnabled: true,
  overstockAlertEnabled: true,
  emailNotificationsEnabled: true,
  notificationEmail: '',
  digestFrequency: 'daily',
  autoApplyLowRisk: false,
  autoGenerateWeekly: true,
  syncWithProcurement: true
}
```

---

## 3. Calculated Fields

### 3.1 EOQ Calculation

**Economic Order Quantity (EOQ)**:

```
EOQ = sqrt(2 * D * S / H)

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
| **EOQ** | sqrt(2 * 1200 * 50 / 10) = **109 units** |

### 3.2 Reorder Point Calculation

**Reorder Point (ROP)**:

```
ROP = (Lead Time x Daily Demand) + Safety Stock

Where:
- Lead Time = Days to receive order
- Daily Demand = Annual demand / 365
- Safety Stock = Z x sigma x sqrt(LT)
```

**Example**:
| Parameter | Value |
|-----------|-------|
| Lead Time | 7 days |
| Daily Demand | 3.3 units |
| Safety Stock | 10 units |
| **ROP** | (7 x 3.3) + 10 = **33 units** |

### 3.3 Safety Stock Calculation

**Safety Stock**:

```
Safety Stock = Z x sigma x sqrt(LT)

Where:
- Z = Z-score for service level
- sigma = Standard deviation of demand
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

### 3.5 Dead Stock Risk Score

**Risk Classification Logic**:

```typescript
function calculateRiskLevel(
  daysSinceMovement: number,
  monthsOfStock: number
): DeadStockRiskLevel {
  if (daysSinceMovement > 365 || monthsOfStock > 24) {
    return 'critical'
  }
  if (daysSinceMovement > 180 || monthsOfStock > 12) {
    return 'high'
  }
  if (daysSinceMovement > 90 || monthsOfStock > 6) {
    return 'medium'
  }
  return 'low'
}
```

---

## 4. Color Constants

### 4.1 Status Colors

```typescript
const statusColors = {
  optimal: 'bg-green-100 text-green-800',
  overstocked: 'bg-yellow-100 text-yellow-800',
  understocked: 'bg-red-100 text-red-800',
}
```

### 4.2 Risk Colors

```typescript
const riskColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
  critical: 'bg-red-100 text-red-800',
}
```

### 4.3 Action Colors

```typescript
const actionColors = {
  implement: 'bg-green-100 text-green-800',
  pilot: 'bg-blue-100 text-blue-800',
  monitor: 'bg-yellow-100 text-yellow-800',
  reject: 'bg-red-100 text-red-800',
}
```

### 4.4 Chart Colors

```typescript
const chartColors = {
  implement: '#22c55e',  // Green
  pilot: '#3b82f6',      // Blue
  monitor: '#f59e0b',    // Yellow
  reject: '#ef4444',     // Red
  primary: '#3b82f6',    // Blue
  secondary: '#6b7280',  // Gray
}
```

---

## 5. Sample Data

### 5.1 Dashboard Sample

```json
{
  "overallMetrics": {
    "totalInventoryValue": 125000,
    "inventoryTurnover": 14.2,
    "daysOfInventory": 26,
    "fillRate": 0.97,
    "stockoutRate": 0.015
  },
  "alerts": {
    "lowStock": 8,
    "overstock": 12,
    "deadStock": 5,
    "expiring": 3,
    "highValue": 2,
    "fastMoving": 15
  },
  "potentialSavings": 8500,
  "itemsAtRisk": 23,
  "optimizationRate": 78,
  "deadStockValue": 12500,
  "trends": {
    "savingsChange": 12,
    "riskChange": -5,
    "optimizationChange": 3,
    "deadStockChange": -2100
  }
}
```

### 5.2 Reorder Recommendation Sample

```json
{
  "id": "REC-001",
  "productCode": "OIL-001",
  "productName": "Olive Oil Extra Virgin 1L",
  "category": "Oils",
  "locationId": "LOC-001",
  "currentROP": 25,
  "currentEOQ": 30,
  "recommendedROP": 20,
  "recommendedEOQ": 35,
  "turnoverRate": 12.5,
  "annualSavings": 65.20,
  "riskLevel": "low",
  "actionType": "implement",
  "leadTime": 7,
  "dailyDemand": 3.3,
  "demandVariability": 0.15,
  "currentServiceLevel": 0.92,
  "targetServiceLevel": 0.95,
  "currentSafetyStock": 10,
  "recommendedSafetyStock": 8,
  "paybackPeriod": 1.5,
  "unit": "bottles"
}
```

### 5.3 Dead Stock Item Sample

```json
{
  "id": "DS-001",
  "productCode": "SPEC-001",
  "productName": "Truffle Salt Premium",
  "category": "Specialty",
  "locationId": "LOC-001",
  "locationName": "Main Kitchen",
  "currentStock": 12,
  "unit": "jars",
  "value": 360.00,
  "lastMovementDate": "2024-06-15",
  "daysSinceMovement": 215,
  "riskLevel": "high",
  "monthsOfStock": 40,
  "recommendedAction": "liquidate",
  "liquidationValue": 144.00,
  "potentialLoss": 216.00,
  "expiryDate": "2025-06-15",
  "daysUntilExpiry": 150
}
```

---

**Document End**
