# Inventory Planning - Business Requirements

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

## 1. Executive Summary

The Inventory Planning module provides optimization capabilities for inventory management, enabling hospitality operations to minimize costs while maintaining service levels. It includes a comprehensive dashboard, reorder optimization, dead stock analysis, safety stock configuration, multi-location planning, and configurable settings.

---

## 2. Business Objectives

### 2.1 Primary Objectives

| ID | Objective | Success Metric |
|----|-----------|----------------|
| OBJ-001 | Reduce carrying costs | 15-25% reduction in holding costs |
| OBJ-002 | Optimize reorder points | Stockout rate < 2% |
| OBJ-003 | Minimize dead stock | < 5% of inventory value |
| OBJ-004 | Improve inventory turnover | Turnover ratio > 12x annually |

### 2.2 Secondary Objectives

| ID | Objective | Success Metric |
|----|-----------|----------------|
| OBJ-005 | Multi-location optimization | Balanced stock across locations |
| OBJ-006 | Actionable recommendations | > 80% recommendation adoption |
| OBJ-007 | Performance visibility | Real-time KPI monitoring |

---

## 3. Functional Requirements

### 3.1 Dashboard (FR-IP-DASH)

#### FR-IP-DASH-001: KPI Cards
**Description**: Display four key performance indicator cards with trend indicators

| KPI Card | Metric | Icon | Color |
|----------|--------|------|-------|
| Total Savings | Potential annual savings ($) | DollarSign | Green |
| Items at Risk | Count of items with alerts | AlertTriangle | Orange |
| Optimization Rate | Percentage of items optimized | CheckCircle | Blue |
| Dead Stock Value | Value of dead stock ($) | Package | Red |

**Trend Indicators**:
- Month-over-month comparison
- TrendingUp (green) for positive changes
- TrendingDown (red) for negative changes

#### FR-IP-DASH-002: Optimization Actions Chart
**Description**: Pie chart showing breakdown of recommended actions

| Action | Color | Description |
|--------|-------|-------------|
| Implement | #22c55e (green) | Low risk, immediate action |
| Pilot | #3b82f6 (blue) | Test before full rollout |
| Monitor | #f59e0b (yellow) | Watch and reassess |
| Reject | #ef4444 (red) | Do not implement |

#### FR-IP-DASH-003: Location Performance Chart
**Description**: Horizontal bar chart showing inventory value by location

| Attribute | Value |
|-----------|-------|
| Chart Type | BarChart (horizontal) |
| X-Axis | Value ($) |
| Y-Axis | Location names |
| Library | Recharts |

#### FR-IP-DASH-004: Alert Summary Grid
**Description**: Grid of clickable alert categories

| Alert Type | Badge | Link |
|------------|-------|------|
| Low Stock | Critical (red) | /reorder?filter=low-stock |
| Overstock | Warning (yellow) | /reorder?filter=overstock |
| Dead Stock | Critical (red) | /dead-stock |
| Expiring | Critical (red) | /inventory-management/expiring |
| High Value | Warning (orange) | /reorder?filter=high-value |
| Fast Moving | Info (blue) | Display only |

#### FR-IP-DASH-005: Recent Recommendations Table
**Description**: Table showing latest optimization recommendations

| Column | Field | Format |
|--------|-------|--------|
| Item | Product name | Text |
| Category | Category name | Text |
| Savings | Amount | Currency (green) |
| Risk | Level | Badge (color-coded) |
| Action | Type | Badge (color-coded) |

---

### 3.2 Reorder Management / Supplier Reorder Planning (FR-IP-REORDER)

#### FR-IP-REORDER-001: Reorder Recommendations Table
**Description**: Table with EOQ and ROP recommendations

| Column | Description |
|--------|-------------|
| Product Code | SKU/item code |
| Product Name | Item name |
| Location | Inventory location |
| Current ROP | Current reorder point |
| Recommended ROP | Optimized reorder point |
| Current EOQ | Current order quantity |
| Recommended EOQ | Optimized order quantity |
| Annual Savings | Projected savings ($) |
| Risk Level | low, medium, high |
| Action Type | implement, pilot, monitor, reject |

#### FR-IP-REORDER-002: Expandable Row Details
**Description**: Expanded view showing current vs recommended metrics

| Section | Fields |
|---------|--------|
| Current Metrics | ROP, EOQ, Safety Stock, Service Level, Lead Time |
| Recommended Changes | ROP, EOQ, Safety Stock, Service Level |
| Potential Impact | Payback Period, Turnover Rate, Daily Demand |

#### FR-IP-REORDER-003: Action Type Filter
**Description**: Dropdown filter for action types

| Filter Value | Label |
|--------------|-------|
| all | All Actions |
| implement | Implement |
| pilot | Pilot |
| monitor | Monitor |
| reject | Reject |

#### FR-IP-REORDER-004: Bulk Actions
**Description**: Actions for selected recommendations

| Action | Description |
|--------|-------------|
| Apply Selected | Apply recommendations to selected items |
| Export | Export recommendations to file |

#### FR-IP-REORDER-005: Cross-Navigation
**Description**: Link to Store Operations Stock Replenishment

| Link Target | Purpose |
|-------------|---------|
| /store-operations/stock-replenishment | View stock replenishment workflow |

---

### 3.3 Dead Stock Analysis (FR-IP-DS)

#### FR-IP-DS-001: Risk Overview Cards
**Description**: Four cards showing dead stock by risk level

| Risk Level | Color | Badge Color |
|------------|-------|-------------|
| Critical | Red background | bg-red-100 |
| High | Orange background | bg-orange-100 |
| Medium | Yellow background | bg-yellow-100 |
| Low | Green background | bg-green-100 |

**Card Content**:
- Count of items
- Total value ($)

#### FR-IP-DS-002: Threshold Filter
**Description**: Days threshold for dead stock identification

| Threshold | Label |
|-----------|-------|
| 60 | 60 days |
| 90 | 90 days (default) |
| 120 | 120 days |
| 180 | 180 days |
| 365 | 365 days |

#### FR-IP-DS-003: Dead Stock Interface
**Description**: TypeScript interface for dead stock items

```typescript
interface DeadStockItem {
  id: string
  productCode: string
  productName: string
  category: string
  locationId: string
  locationName: string
  currentStock: number
  unit: string
  value: number
  lastMovementDate: string
  daysSinceMovement: number
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  monthsOfStock: number
  recommendedAction: 'liquidate' | 'return' | 'writeoff' | 'continue' | 'reduce'
  liquidationValue: number
  potentialLoss: number
  expiryDate?: string
  daysUntilExpiry?: number
}
```

#### FR-IP-DS-004: Recommended Actions
**Description**: Actions available for dead stock items

| Action | Label | Description |
|--------|-------|-------------|
| liquidate | Liquidate | Sell at discounted price |
| return | Return to Supplier | Return for credit |
| writeoff | Write Off | Write off as loss |
| continue | Continue Stocking | Keep as is |
| reduce | Reduce Stock | Lower stock levels |

#### FR-IP-DS-005: Expandable Row Sections
**Description**: Detailed view when row is expanded

| Section | Fields |
|---------|--------|
| Stock Analysis | Months of Stock, Expiry Date, Days Until Expiry |
| Financial Impact | Potential Loss, Liquidation Value, Recovery Rate |

#### FR-IP-DS-006: Risk Classification Rules
**Description**: Business rules for risk level assignment

| Risk Level | Days Since Movement | OR | Months of Stock |
|------------|--------------------|----|-----------------|
| Critical | > 365 | OR | > 24 |
| High | > 180 | OR | > 12 |
| Medium | > 90 | OR | > 6 |
| Low | <= 90 | AND | <= 6 |

---

### 3.4 Safety Stock Optimization (FR-IP-SS)

#### FR-IP-SS-001: Service Level Tabs
**Description**: Tab selection for target service level

| Tab Value | Label | Z-Score |
|-----------|-------|---------|
| 90 | 90% | 1.28 |
| 95 | 95% (default) | 1.65 |
| 99 | 99% | 2.33 |

#### FR-IP-SS-002: Safety Stock Interface
**Description**: TypeScript interface for safety stock items

```typescript
interface SafetyStockItem {
  id: string
  productCode: string
  productName: string
  category: string
  currentSafetyStock: number
  recommendedSafetyStock: { [key: string]: number }
  unit: string
  unitCost: number
  demandVariability: number
  leadTimeVariability: number
  currentServiceLevel: number
}
```

#### FR-IP-SS-003: Comparison Table
**Description**: Table showing current vs recommended safety stock

| Column | Description |
|--------|-------------|
| Product | Product name |
| Current Safety Stock | Current level with unit |
| Recommended Safety Stock | Recommended level for selected service level |
| Demand Variability | Percentage variability |
| Cost Impact | Change in inventory value ($) |

#### FR-IP-SS-004: What-If Analysis Chart
**Description**: Line chart showing cost vs service level trade-off

| Attribute | Value |
|-----------|-------|
| Chart Type | LineChart |
| X-Axis | Service Level (%) |
| Y-Axis | Cost ($) |
| Library | Recharts |

#### FR-IP-SS-005: Safety Stock Calculation
**Description**: Formula for safety stock calculation

```
Safety Stock = Z x sigma x sqrt(Lead Time)

Where:
- Z = Z-score for target service level
- sigma = Standard deviation of demand
- Lead Time = Lead time in days
```

---

### 3.5 Multi-Location Planning (FR-IP-LOC)

#### FR-IP-LOC-001: Location Summary Cards
**Description**: Cards showing location status counts

| Status | Color | Description |
|--------|-------|-------------|
| Optimal | Green | Stock levels are balanced |
| Overstocked | Yellow | Excess stock detected |
| Understocked | Red | Stock below optimal |

#### FR-IP-LOC-002: Location Data Interface
**Description**: TypeScript interface for location data

```typescript
interface LocationData {
  id: string
  name: string
  inventoryValue: number
  turnoverRate: number
  alertCount: number
  status: 'optimal' | 'overstocked' | 'understocked'
  efficiency: number
  capacityUtilization: number
}
```

#### FR-IP-LOC-003: Location Performance Chart
**Description**: Bar chart comparing location performance

| Attribute | Value |
|-----------|-------|
| Chart Type | BarChart |
| X-Axis | Location names |
| Y-Axis | Inventory Value ($) |
| Library | Recharts |

#### FR-IP-LOC-004: Transfer Recommendation Interface
**Description**: TypeScript interface for transfer recommendations

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
  estimatedSavings: number
}
```

#### FR-IP-LOC-005: Transfer Recommendations Table
**Description**: Table showing recommended stock transfers

| Column | Description |
|--------|-------------|
| Product | Product code and name |
| From | Source location |
| To | Destination location |
| Quantity | Transfer quantity with unit |
| Reason | Reason for transfer |
| Priority | high, medium, low (badge) |
| Est. Savings | Estimated savings ($) |

---

### 3.6 Settings Configuration (FR-IP-SET)

#### FR-IP-SET-001: Settings Interface
**Description**: TypeScript interface for settings

```typescript
interface InventoryPlanningSettings {
  defaultServiceLevel: string
  orderCostPerOrder: number
  holdingCostRate: number
  defaultLeadTime: number
  deadStockThreshold: number
  lowStockAlertEnabled: boolean
  deadStockAlertEnabled: boolean
  overstockAlertEnabled: boolean
  emailNotificationsEnabled: boolean
  notificationEmail: string
  digestFrequency: string
  autoApplyLowRisk: boolean
  autoGenerateWeekly: boolean
  syncWithProcurement: boolean
}
```

#### FR-IP-SET-002: Default Parameters Section
**Description**: Configuration for calculation defaults

| Field | Type | Default | Range |
|-------|------|---------|-------|
| Default Service Level | Select | 95% | 90%, 95%, 99% |
| Order Cost Per Order | Number | $50 | > 0 |
| Holding Cost Rate | Number | 25% | 1-100% |
| Default Lead Time | Number | 7 days | 1-180 days |

#### FR-IP-SET-003: Alert Thresholds Section
**Description**: Configuration for alert triggers

| Field | Type | Default |
|-------|------|---------|
| Dead Stock Threshold | Number | 90 days |
| Low Stock Alert | Switch | Enabled |
| Dead Stock Alert | Switch | Enabled |
| Overstock Alert | Switch | Enabled |

#### FR-IP-SET-004: Notification Settings Section
**Description**: Configuration for notifications

| Field | Type | Default |
|-------|------|---------|
| Email Notifications | Switch | Enabled |
| Notification Email | Input | User email |
| Digest Frequency | Select | Daily |

**Digest Frequency Options**:
- Daily
- Weekly
- Monthly

#### FR-IP-SET-005: Automation Settings Section
**Description**: Configuration for automated actions

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| Auto-Apply Low Risk | Switch | Disabled | Automatically apply low-risk recommendations |
| Auto-Generate Weekly | Switch | Enabled | Generate recommendations weekly |
| Sync with Procurement | Switch | Enabled | Sync recommendations to procurement |

---

## 4. Business Rules

### 4.1 Optimization Rules

| Rule ID | Description | Formula/Logic |
|---------|-------------|---------------|
| BR-IP-001 | EOQ Calculation | EOQ = sqrt(2DS/H) |
| BR-IP-002 | Reorder Point | ROP = (LT x DD) + SS |
| BR-IP-003 | Safety Stock | SS = Z x sigma x sqrt(LT) |
| BR-IP-004 | Carrying Cost | CC = (Q/2) x H |
| BR-IP-005 | Total Cost | TC = (D/Q) x S + (Q/2) x H |

### 4.2 Risk Assessment Rules

| Rule ID | Description | Calculation |
|---------|-------------|-------------|
| BR-IP-010 | Implementation Risk | Based on change magnitude and item criticality |
| BR-IP-011 | Low Risk | Change <= 20%, Non-critical item |
| BR-IP-012 | Medium Risk | Change 20-50%, OR Critical item with small change |
| BR-IP-013 | High Risk | Change > 50%, OR Critical item with large change |

### 4.3 Dead Stock Rules

| Rule ID | Description | Threshold |
|---------|-------------|-----------|
| BR-IP-020 | Critical Dead Stock | No movement > 365 days OR > 24 months supply |
| BR-IP-021 | High Risk Dead Stock | No movement > 180 days OR > 12 months supply |
| BR-IP-022 | Medium Risk Dead Stock | No movement > 90 days OR > 6 months supply |
| BR-IP-023 | Low Risk Dead Stock | No movement <= 90 days AND <= 6 months supply |

### 4.4 Action Recommendation Rules

| Rule ID | Description | Criteria |
|---------|-------------|----------|
| BR-IP-030 | Implement | Savings > $100, Risk = Low |
| BR-IP-031 | Pilot | Savings > $50, Any Risk Level |
| BR-IP-032 | Monitor | Savings > $0, Risk = Medium |
| BR-IP-033 | Reject | Savings <= $0 OR Risk = High |

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Dashboard Load | < 3 seconds | Initial render |
| Optimization Generation | < 5 seconds | 500 items |
| Dead Stock Analysis | < 3 seconds | All items |
| Safety Stock Calculation | < 2 seconds | All items |
| Location Breakdown | < 2 seconds | Per location |

### 5.2 Scalability Requirements

| Requirement | Target |
|-------------|--------|
| Maximum Items | 10,000 items |
| Maximum Locations | 50 locations |
| Concurrent Users | 100 users |
| Data Retention | 3 years historical |

---

## 6. User Roles & Access

| Role | Dashboard | Reorder | Dead Stock | Safety Stock | Locations | Settings |
|------|-----------|---------|------------|--------------|-----------|----------|
| Inventory Manager | Full | Full | Full | Full | Full | Full |
| Operations Manager | View | View | View | View | Full | View |
| Financial Controller | Full | Full | Full | Full | Full | Full |
| Purchasing Manager | View | View | View | View | View | - |
| General Manager | View | View | View | View | Full | View |

---

## 7. Glossary

| Term | Definition |
|------|------------|
| EOQ | Economic Order Quantity - optimal order size to minimize total costs |
| ROP | Reorder Point - stock level at which a new order should be placed |
| Safety Stock | Buffer stock to protect against demand variability |
| Carrying Cost | Cost of holding inventory over time |
| Dead Stock | Inventory with no movement over extended period |
| Turnover Ratio | How many times inventory is sold and replaced |
| Fill Rate | Percentage of orders fulfilled from available stock |
| Service Level | Probability of not experiencing a stockout |
| Z-Score | Number of standard deviations for a given probability |

---

**Document End**
