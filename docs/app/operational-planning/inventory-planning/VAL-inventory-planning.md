# Inventory Planning - Validations

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
| 2.0.0 | 2025-01-17 | Development Team | Updated to match actual UI implementation |

---

## 1. Validation Overview

### 1.1 Validation Layers

| Layer | Purpose | Implementation |
|-------|---------|----------------|
| Client | Immediate feedback | React state validation |
| UI | User input constraints | HTML5 + React constraints |
| Business | Rule enforcement | TypeScript validation functions |

### 1.2 Validation Categories

| Category | Description |
|----------|-------------|
| Input | User input validation for filters and settings |
| Selection | Checkbox and selection validation |
| Calculation | Formula input validation |
| State | UI state validation |

---

## 2. Dashboard Validations

### 2.1 Location Filter Validation

```typescript
// Valid location values
type LocationFilter = "all" | string // UUID for specific location

// Validation
const isValidLocation = (value: string): boolean => {
  return value === "all" || mockLocations.some(loc => loc.id === value)
}
```

### 2.2 KPI Data Validation

```typescript
// KPI values must be non-negative
interface KPIValidation {
  totalSavings: number      // >= 0
  itemsAtRisk: number       // >= 0, integer
  optimizationRate: number  // 0-100
  deadStockValue: number    // >= 0
}

const validateKPIData = (data: KPIValidation): boolean => {
  return (
    data.totalSavings >= 0 &&
    data.itemsAtRisk >= 0 && Number.isInteger(data.itemsAtRisk) &&
    data.optimizationRate >= 0 && data.optimizationRate <= 100 &&
    data.deadStockValue >= 0
  )
}
```

### 2.3 Trend Data Validation

```typescript
// Trend percentages can be positive or negative
interface TrendValidation {
  savingsChange: number     // any number (percentage)
  riskChange: number        // any number (percentage)
  optimizationChange: number // any number (percentage)
  deadStockChange: number   // any number (percentage)
}

const validateTrendData = (data: TrendValidation): boolean => {
  return Object.values(data).every(v => typeof v === 'number' && !isNaN(v))
}
```

---

## 3. Reorder Management Validations

### 3.1 Filter Validations

```typescript
// Location filter
const locationFilterOptions = ["all", ...mockLocations.map(l => l.id)]

// Action type filter
type ActionTypeFilter = "all" | "implement" | "pilot" | "monitor" | "reject"

const isValidActionFilter = (value: string): boolean => {
  return ["all", "implement", "pilot", "monitor", "reject"].includes(value)
}
```

### 3.2 Recommendation Data Validation

```typescript
interface ReorderRecommendation {
  id: string
  productCode: string
  productName: string
  currentROP: number        // >= 0
  recommendedROP: number    // >= 0
  currentEOQ: number        // >= 1
  recommendedEOQ: number    // >= 1
  annualSavings: number     // can be negative
  riskLevel: 'low' | 'medium' | 'high'
  actionType: 'implement' | 'pilot' | 'monitor' | 'reject'
  leadTime: number          // > 0
  dailyDemand: number       // >= 0
  currentServiceLevel: number   // 0-1
  targetServiceLevel: number    // 0-1
}

const validateRecommendation = (rec: ReorderRecommendation): string[] => {
  const errors: string[] = []

  if (rec.currentROP < 0) errors.push('Current ROP must be non-negative')
  if (rec.recommendedROP < 0) errors.push('Recommended ROP must be non-negative')
  if (rec.currentEOQ < 1) errors.push('Current EOQ must be at least 1')
  if (rec.recommendedEOQ < 1) errors.push('Recommended EOQ must be at least 1')
  if (rec.leadTime <= 0) errors.push('Lead time must be positive')
  if (rec.dailyDemand < 0) errors.push('Daily demand must be non-negative')
  if (rec.currentServiceLevel < 0 || rec.currentServiceLevel > 1) {
    errors.push('Service level must be between 0 and 1')
  }
  if (rec.targetServiceLevel < 0 || rec.targetServiceLevel > 1) {
    errors.push('Target service level must be between 0 and 1')
  }

  return errors
}
```

### 3.3 Selection Validation

```typescript
// At least one item must be selected for bulk actions
const validateSelection = (selectedItems: Set<string>): boolean => {
  return selectedItems.size > 0
}

// Validate selected items exist in data
const validateSelectedItemsExist = (
  selectedItems: Set<string>,
  recommendations: ReorderRecommendation[]
): boolean => {
  const validIds = new Set(recommendations.map(r => r.id))
  return Array.from(selectedItems).every(id => validIds.has(id))
}
```

### 3.4 Apply Recommendations Validation

```typescript
// Before applying recommendations
const validateApplyAction = (
  selectedItems: Set<string>,
  recommendations: ReorderRecommendation[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (selectedItems.size === 0) {
    errors.push('Please select at least one item')
  }

  // Validate each selected item
  for (const id of selectedItems) {
    const rec = recommendations.find(r => r.id === id)
    if (!rec) {
      errors.push(`Item ${id} not found`)
      continue
    }

    // Cannot apply rejected recommendations
    if (rec.actionType === 'reject') {
      errors.push(`Cannot apply rejected recommendation: ${rec.productName}`)
    }
  }

  return { valid: errors.length === 0, errors }
}
```

---

## 4. Dead Stock Validations

### 4.1 Threshold Days Validation

```typescript
// Valid threshold values
type ThresholdDays = "60" | "90" | "120" | "180" | "365"

const validThresholds = ["60", "90", "120", "180", "365"]

const isValidThreshold = (value: string): boolean => {
  return validThresholds.includes(value)
}
```

### 4.2 Risk Level Validation

```typescript
// Valid risk levels
type RiskLevel = "critical" | "high" | "medium" | "low"

const validRiskLevels = ["critical", "high", "medium", "low"]

const isValidRiskLevel = (value: string): boolean => {
  return validRiskLevels.includes(value)
}
```

### 4.3 Dead Stock Item Validation

```typescript
interface DeadStockItem {
  id: string
  productCode: string
  productName: string
  currentStock: number       // >= 0
  value: number              // >= 0
  daysSinceMovement: number  // >= 0
  riskLevel: RiskLevel
  monthsOfStock: number      // >= 0
  recommendedAction: 'liquidate' | 'return' | 'writeoff' | 'continue' | 'reduce'
  liquidationValue: number   // >= 0, <= value
  potentialLoss: number      // >= 0, <= value
}

const validateDeadStockItem = (item: DeadStockItem): string[] => {
  const errors: string[] = []

  if (item.currentStock < 0) errors.push('Stock cannot be negative')
  if (item.value < 0) errors.push('Value cannot be negative')
  if (item.daysSinceMovement < 0) errors.push('Days since movement cannot be negative')
  if (item.monthsOfStock < 0) errors.push('Months of stock cannot be negative')
  if (item.liquidationValue < 0) errors.push('Liquidation value cannot be negative')
  if (item.liquidationValue > item.value) {
    errors.push('Liquidation value cannot exceed current value')
  }
  if (item.potentialLoss < 0) errors.push('Potential loss cannot be negative')
  if (item.potentialLoss > item.value) {
    errors.push('Potential loss cannot exceed current value')
  }

  return errors
}
```

### 4.4 Risk Classification Validation

```typescript
// Validate risk level matches criteria
const validateRiskClassification = (item: DeadStockItem): boolean => {
  const { daysSinceMovement, monthsOfStock, riskLevel } = item

  switch (riskLevel) {
    case 'critical':
      return daysSinceMovement > 365 || monthsOfStock > 24
    case 'high':
      return (daysSinceMovement > 180 || monthsOfStock > 12) &&
             !(daysSinceMovement > 365 || monthsOfStock > 24)
    case 'medium':
      return (daysSinceMovement > 90 || monthsOfStock > 6) &&
             !(daysSinceMovement > 180 || monthsOfStock > 12)
    case 'low':
      return daysSinceMovement <= 90 && monthsOfStock <= 6
    default:
      return false
  }
}
```

### 4.5 Action Selection Validation

```typescript
type DeadStockAction = 'liquidate' | 'return' | 'writeoff' | 'continue' | 'reduce'

const validActions: DeadStockAction[] = ['liquidate', 'return', 'writeoff', 'continue', 'reduce']

const isValidAction = (action: string): action is DeadStockAction => {
  return validActions.includes(action as DeadStockAction)
}
```

---

## 5. Safety Stock Validations

### 5.1 Service Level Validation

```typescript
// Valid service levels
type ServiceLevel = "90" | "95" | "99"

const validServiceLevels = ["90", "95", "99"]

const isValidServiceLevel = (value: string): boolean => {
  return validServiceLevels.includes(value)
}

// Z-score mapping validation
const getZScore = (level: ServiceLevel): number => {
  const zScores: Record<ServiceLevel, number> = {
    "90": 1.28,
    "95": 1.65,
    "99": 2.33,
  }
  return zScores[level]
}
```

### 5.2 Safety Stock Item Validation

```typescript
interface SafetyStockItem {
  id: string
  productCode: string
  productName: string
  currentSafetyStock: number  // >= 0
  recommendedSafetyStock: {
    "90": number  // >= 0
    "95": number  // >= 0
    "99": number  // >= 0
  }
  unitCost: number            // > 0
  demandVariability: number   // >= 0
  leadTimeVariability: number // >= 0
  currentServiceLevel: number // 0-1
}

const validateSafetyStockItem = (item: SafetyStockItem): string[] => {
  const errors: string[] = []

  if (item.currentSafetyStock < 0) {
    errors.push('Current safety stock cannot be negative')
  }

  Object.entries(item.recommendedSafetyStock).forEach(([level, value]) => {
    if (value < 0) {
      errors.push(`Recommended safety stock for ${level}% cannot be negative`)
    }
  })

  if (item.unitCost <= 0) {
    errors.push('Unit cost must be positive')
  }

  if (item.demandVariability < 0) {
    errors.push('Demand variability cannot be negative')
  }

  if (item.leadTimeVariability < 0) {
    errors.push('Lead time variability cannot be negative')
  }

  if (item.currentServiceLevel < 0 || item.currentServiceLevel > 1) {
    errors.push('Service level must be between 0 and 1')
  }

  return errors
}
```

### 5.3 Cost Impact Validation

```typescript
// Cost impact calculation validation
const validateCostImpact = (
  currentStock: number,
  recommendedStock: number,
  unitCost: number
): number => {
  if (unitCost <= 0) throw new Error('Unit cost must be positive')

  const difference = recommendedStock - currentStock
  return difference * unitCost
}
```

---

## 6. Multi-Location Validations

### 6.1 Location Data Validation

```typescript
interface LocationData {
  id: string
  name: string
  inventoryValue: number      // >= 0
  turnoverRate: number        // >= 0
  alertCount: number          // >= 0, integer
  status: 'optimal' | 'overstocked' | 'understocked'
  efficiency: number          // 0-100
  capacityUtilization: number // 0-100
}

const validateLocationData = (location: LocationData): string[] => {
  const errors: string[] = []

  if (location.inventoryValue < 0) {
    errors.push('Inventory value cannot be negative')
  }

  if (location.turnoverRate < 0) {
    errors.push('Turnover rate cannot be negative')
  }

  if (location.alertCount < 0 || !Number.isInteger(location.alertCount)) {
    errors.push('Alert count must be a non-negative integer')
  }

  if (location.efficiency < 0 || location.efficiency > 100) {
    errors.push('Efficiency must be between 0 and 100')
  }

  if (location.capacityUtilization < 0 || location.capacityUtilization > 100) {
    errors.push('Capacity utilization must be between 0 and 100')
  }

  return errors
}
```

### 6.2 Transfer Recommendation Validation

```typescript
interface TransferRecommendation {
  id: string
  productCode: string
  productName: string
  fromLocationId: string
  toLocationId: string
  quantity: number           // > 0
  unit: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  estimatedSavings: number   // >= 0
}

const validateTransferRecommendation = (transfer: TransferRecommendation): string[] => {
  const errors: string[] = []

  if (transfer.fromLocationId === transfer.toLocationId) {
    errors.push('Source and destination locations must be different')
  }

  if (transfer.quantity <= 0) {
    errors.push('Transfer quantity must be positive')
  }

  if (transfer.estimatedSavings < 0) {
    errors.push('Estimated savings cannot be negative')
  }

  if (!['high', 'medium', 'low'].includes(transfer.priority)) {
    errors.push('Invalid priority level')
  }

  return errors
}
```

### 6.3 Location Status Validation

```typescript
type LocationStatus = 'optimal' | 'overstocked' | 'understocked'

const validStatuses: LocationStatus[] = ['optimal', 'overstocked', 'understocked']

const isValidStatus = (status: string): status is LocationStatus => {
  return validStatuses.includes(status as LocationStatus)
}
```

---

## 7. Settings Validations

### 7.1 Settings Schema

```typescript
interface InventoryPlanningSettings {
  defaultServiceLevel: string       // "90" | "95" | "99"
  orderCostPerOrder: number         // > 0
  holdingCostRate: number           // 1-100 (percentage)
  defaultLeadTime: number           // 1-180 days
  deadStockThreshold: number        // 30-365 days
  lowStockAlertEnabled: boolean
  deadStockAlertEnabled: boolean
  overstockAlertEnabled: boolean
  emailNotificationsEnabled: boolean
  notificationEmail: string         // valid email if notifications enabled
  digestFrequency: string           // "daily" | "weekly" | "monthly"
  autoApplyLowRisk: boolean
  autoGenerateWeekly: boolean
  syncWithProcurement: boolean
}
```

### 7.2 Settings Validation Rules

```typescript
const validateSettings = (settings: InventoryPlanningSettings): string[] => {
  const errors: string[] = []

  // Service level
  if (!["90", "95", "99"].includes(settings.defaultServiceLevel)) {
    errors.push('Invalid service level')
  }

  // Order cost
  if (settings.orderCostPerOrder <= 0) {
    errors.push('Order cost must be positive')
  }

  // Holding cost rate
  if (settings.holdingCostRate < 1 || settings.holdingCostRate > 100) {
    errors.push('Holding cost rate must be between 1% and 100%')
  }

  // Lead time
  if (settings.defaultLeadTime < 1 || settings.defaultLeadTime > 180) {
    errors.push('Lead time must be between 1 and 180 days')
  }

  // Dead stock threshold
  if (settings.deadStockThreshold < 30 || settings.deadStockThreshold > 365) {
    errors.push('Dead stock threshold must be between 30 and 365 days')
  }

  // Email validation
  if (settings.emailNotificationsEnabled && settings.notificationEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(settings.notificationEmail)) {
      errors.push('Invalid email address')
    }
  }

  // Digest frequency
  if (!["daily", "weekly", "monthly"].includes(settings.digestFrequency)) {
    errors.push('Invalid digest frequency')
  }

  return errors
}
```

### 7.3 Individual Field Validations

```typescript
// Order cost validation
const validateOrderCost = (value: number): string | null => {
  if (isNaN(value)) return 'Please enter a valid number'
  if (value <= 0) return 'Order cost must be positive'
  if (value > 10000) return 'Order cost seems too high'
  return null
}

// Holding cost rate validation
const validateHoldingCostRate = (value: number): string | null => {
  if (isNaN(value)) return 'Please enter a valid number'
  if (value < 1) return 'Holding cost rate must be at least 1%'
  if (value > 100) return 'Holding cost rate cannot exceed 100%'
  return null
}

// Lead time validation
const validateLeadTime = (value: number): string | null => {
  if (isNaN(value)) return 'Please enter a valid number'
  if (!Number.isInteger(value)) return 'Lead time must be a whole number'
  if (value < 1) return 'Lead time must be at least 1 day'
  if (value > 180) return 'Lead time cannot exceed 180 days'
  return null
}

// Dead stock threshold validation
const validateDeadStockThreshold = (value: number): string | null => {
  if (isNaN(value)) return 'Please enter a valid number'
  if (!Number.isInteger(value)) return 'Threshold must be a whole number'
  if (value < 30) return 'Threshold must be at least 30 days'
  if (value > 365) return 'Threshold cannot exceed 365 days'
  return null
}
```

---

## 8. Calculation Validations

### 8.1 EOQ Calculation Validation

```typescript
// EOQ = sqrt(2DS/H)
const validateEOQInputs = (
  annualDemand: number,
  orderCost: number,
  holdingCost: number
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (annualDemand <= 0) {
    errors.push('Annual demand must be positive')
  }

  if (orderCost <= 0) {
    errors.push('Order cost must be positive')
  }

  if (holdingCost <= 0) {
    errors.push('Holding cost must be positive')
  }

  return { valid: errors.length === 0, errors }
}

const calculateEOQ = (
  annualDemand: number,
  orderCost: number,
  holdingCost: number
): number | null => {
  const validation = validateEOQInputs(annualDemand, orderCost, holdingCost)
  if (!validation.valid) return null

  const eoq = Math.sqrt((2 * annualDemand * orderCost) / holdingCost)

  // Cap at annual demand
  return Math.min(eoq, annualDemand)
}
```

### 8.2 Safety Stock Calculation Validation

```typescript
// Safety Stock = Z × σ × √LT
const validateSafetyStockInputs = (
  zScore: number,
  demandStdDev: number,
  leadTime: number
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (zScore <= 0) {
    errors.push('Z-score must be positive')
  }

  if (demandStdDev < 0) {
    errors.push('Demand standard deviation cannot be negative')
  }

  if (leadTime <= 0) {
    errors.push('Lead time must be positive')
  }

  return { valid: errors.length === 0, errors }
}

const calculateSafetyStock = (
  zScore: number,
  demandStdDev: number,
  leadTime: number
): number | null => {
  const validation = validateSafetyStockInputs(zScore, demandStdDev, leadTime)
  if (!validation.valid) return null

  return zScore * demandStdDev * Math.sqrt(leadTime)
}
```

### 8.3 Reorder Point Calculation Validation

```typescript
// ROP = (Lead Time × Daily Demand) + Safety Stock
const validateROPInputs = (
  leadTime: number,
  dailyDemand: number,
  safetyStock: number
): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (leadTime <= 0) {
    errors.push('Lead time must be positive')
  }

  if (dailyDemand < 0) {
    errors.push('Daily demand cannot be negative')
  }

  if (safetyStock < 0) {
    errors.push('Safety stock cannot be negative')
  }

  return { valid: errors.length === 0, errors }
}

const calculateROP = (
  leadTime: number,
  dailyDemand: number,
  safetyStock: number
): number | null => {
  const validation = validateROPInputs(leadTime, dailyDemand, safetyStock)
  if (!validation.valid) return null

  return (leadTime * dailyDemand) + safetyStock
}
```

---

## 9. Error Messages

### 9.1 Input Validation Errors

| Code | Field | Message |
|------|-------|---------|
| ERR_VAL_001 | serviceLevel | Service level must be 90%, 95%, or 99% |
| ERR_VAL_002 | orderCost | Order cost must be a positive number |
| ERR_VAL_003 | holdingCostRate | Holding cost rate must be between 1% and 100% |
| ERR_VAL_004 | leadTime | Lead time must be between 1 and 180 days |
| ERR_VAL_005 | deadStockThreshold | Threshold must be between 30 and 365 days |
| ERR_VAL_006 | notificationEmail | Please enter a valid email address |

### 9.2 Selection Validation Errors

| Code | Context | Message |
|------|---------|---------|
| ERR_SEL_001 | Bulk action | Please select at least one item |
| ERR_SEL_002 | Apply rejected | Cannot apply rejected recommendations |
| ERR_SEL_003 | Invalid ID | Selected item not found |

### 9.3 Calculation Errors

| Code | Context | Message |
|------|---------|---------|
| ERR_CALC_001 | EOQ | Cannot calculate EOQ with zero or negative values |
| ERR_CALC_002 | Safety Stock | Cannot calculate safety stock with invalid inputs |
| ERR_CALC_003 | ROP | Cannot calculate reorder point with invalid inputs |

---

## 10. Validation Response Format

### 10.1 Validation Result Interface

```typescript
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings?: string[]
}

interface ValidationError {
  code: string
  field: string
  message: string
  value?: any
}
```

### 10.2 Example Responses

**Success Response**:
```typescript
{
  valid: true,
  errors: [],
  warnings: ["Some items have limited history data"]
}
```

**Error Response**:
```typescript
{
  valid: false,
  errors: [
    {
      code: "ERR_VAL_002",
      field: "orderCost",
      message: "Order cost must be a positive number",
      value: -50
    }
  ]
}
```

---

**Document End**
