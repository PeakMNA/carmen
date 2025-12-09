# Inventory Planning - Business Requirements

## Document Information

| Field | Value |
|-------|-------|
| Module | Inventory Planning |
| Version | 1.0.0 |
| Last Updated | 2025-12-06 |
| Status | Draft |

---

## 1. Executive Summary

The Inventory Planning module provides optimization capabilities for inventory management, enabling hospitality operations to minimize costs while maintaining service levels. It integrates with the existing Demand Forecasting module through a shared analytics service.

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

### 3.1 Inventory Optimization (FR-IP-OPT)

#### FR-IP-OPT-001: EOQ Calculation
**Description**: Calculate Economic Order Quantity for inventory items

| Attribute | Value |
|-----------|-------|
| Priority | High |
| Input | Annual demand, order cost, holding cost per unit |
| Output | Optimal order quantity |
| Formula | EOQ = √(2DS/H) |

**Business Rules**:
- D = Annual demand (units)
- S = Fixed cost per order ($)
- H = Annual holding cost per unit ($)
- Minimum EOQ = 1 unit
- Maximum EOQ = Annual demand

#### FR-IP-OPT-002: Reorder Point Calculation
**Description**: Determine when to place orders based on lead time and demand

| Attribute | Value |
|-----------|-------|
| Priority | High |
| Input | Daily demand, lead time, safety stock |
| Output | Reorder point (units) |
| Formula | ROP = (Lead Time × Daily Demand) + Safety Stock |

**Business Rules**:
- Lead time in business days
- Daily demand = 30-day average consumption
- Safety stock from FR-IP-OPT-003

#### FR-IP-OPT-003: Safety Stock Calculation
**Description**: Calculate buffer stock to protect against variability

| Attribute | Value |
|-----------|-------|
| Priority | High |
| Input | Service level, demand variability, lead time |
| Output | Safety stock units |
| Formula | SS = Z × σ × √LT |

**Service Level Z-Scores**:

| Service Level | Z-Score |
|--------------|---------|
| 90% | 1.28 |
| 95% | 1.65 |
| 99% | 2.33 |

#### FR-IP-OPT-004: Carrying Cost Analysis
**Description**: Calculate and optimize inventory holding costs

| Attribute | Value |
|-----------|-------|
| Priority | Medium |
| Input | Average inventory, unit cost, holding rate |
| Output | Annual carrying cost |
| Formula | CC = (Q/2) × H |

**Cost Components**:
- Storage costs (15-25% of item value)
- Capital costs (opportunity cost of tied-up capital)
- Insurance and taxes
- Obsolescence risk

#### FR-IP-OPT-005: Optimization Recommendations
**Description**: Generate actionable recommendations with risk assessment

| Attribute | Value |
|-----------|-------|
| Priority | High |
| Input | Current parameters, optimized parameters |
| Output | Recommendations with savings and risk |

**Recommendation Actions**:

| Action | Criteria |
|--------|----------|
| IMPLEMENT | Savings > $100, Risk < 0.3 |
| PILOT | Savings > $50, Risk 0.3-0.6 |
| MONITOR | Savings > $0, Risk 0.3-0.6 |
| REJECT | Savings ≤ $0 OR Risk > 0.6 |

---

### 3.2 Dead Stock Analysis (FR-IP-DS)

#### FR-IP-DS-001: Dead Stock Identification
**Description**: Identify items with no movement or excessive stock

| Attribute | Value |
|-----------|-------|
| Priority | High |
| Input | Last movement date, stock level, consumption rate |
| Output | Dead stock list with risk assessment |

**Risk Classification**:

| Risk Level | Days Since Movement | Months of Stock |
|------------|--------------------|-----------------
| CRITICAL | > 365 | > 24 |
| HIGH | 181-365 | 12-24 |
| MEDIUM | 91-180 | 6-12 |
| LOW | ≤ 90 | ≤ 6 |

#### FR-IP-DS-002: Recommended Actions
**Description**: Suggest actions based on dead stock analysis

| Action | Criteria |
|--------|----------|
| CONTINUE_STOCKING | Risk = LOW, Essential item |
| REDUCE_STOCK | Risk = MEDIUM, Moderate consumption |
| LIQUIDATE | Risk = HIGH, Has resale value |
| RETURN_TO_SUPPLIER | Risk = HIGH/CRITICAL, Return agreement exists |
| WRITE_OFF | Risk = CRITICAL, No recovery value |

#### FR-IP-DS-003: Financial Impact
**Description**: Calculate potential loss and recovery options

| Metric | Calculation |
|--------|-------------|
| Current Value | Stock × Unit Cost |
| Potential Loss | Current Value × (1 - Recovery Rate) |
| Liquidation Value | Current Value × Liquidation Rate |

**Recovery Rates by Action**:

| Action | Recovery Rate |
|--------|--------------|
| Return to Supplier | 80-100% |
| Liquidate | 40-60% |
| Write Off | 0% |

---

### 3.3 Performance Dashboard (FR-IP-DASH)

#### FR-IP-DASH-001: Overall Metrics
**Description**: Calculate and display key performance indicators

| Metric | Formula | Target |
|--------|---------|--------|
| Total Inventory Value | Σ(Stock × Unit Cost) | - |
| Inventory Turnover | COGS / Avg Inventory | > 12x |
| Days of Inventory | 365 / Turnover | < 30 days |
| Fill Rate | Orders Fulfilled / Total Orders | > 98% |
| Stockout Rate | Stockout Events / Total Events | < 2% |

#### FR-IP-DASH-002: Category Breakdown
**Description**: Performance metrics by inventory category

| Attribute | Value |
|-----------|-------|
| Priority | Medium |
| Grouping | Category, Sub-category |
| Metrics | Value, percentage, item count |

#### FR-IP-DASH-003: Location Breakdown
**Description**: Performance metrics by location

| Attribute | Value |
|-----------|-------|
| Priority | Medium |
| Grouping | Location, Department |
| Metrics | Value, turnover, alerts |

#### FR-IP-DASH-004: Alerts System
**Description**: Proactive alerts for inventory issues

| Alert Type | Trigger Condition | Severity |
|------------|-------------------|----------|
| Low Stock | Stock ≤ Reorder Point | High |
| Overstock | Stock > 3 × Average Monthly | Medium |
| Dead Stock | Days Since Movement > 90 | High |
| Expiring Soon | Days to Expiry ≤ 30 | High |
| High Value at Risk | Risk Value > $1000 | Critical |
| Fast Moving | Turnover > 20x | Info |

---

### 3.4 Multi-Location Planning (FR-IP-LOC)

#### FR-IP-LOC-001: Location Performance Comparison
**Description**: Compare inventory performance across locations

| Metric | Purpose |
|--------|---------|
| Stock Balance | Identify imbalances |
| Turnover Rate | Performance comparison |
| Service Level | Fulfillment capability |
| Cost per Unit | Efficiency measure |

#### FR-IP-LOC-002: Transfer Recommendations
**Description**: Suggest stock transfers between locations

| Attribute | Value |
|-----------|-------|
| Priority | Medium |
| Trigger | Imbalance > 20% between locations |
| Output | Transfer quantity, source, destination |

**Transfer Rules**:
- Transfer cost < Value of potential stockout
- Source location maintains safety stock
- Destination location has storage capacity

---

## 4. Business Rules

### 4.1 Optimization Rules

| Rule ID | Description | Formula/Logic |
|---------|-------------|---------------|
| BR-IP-001 | EOQ Calculation | EOQ = √(2DS/H) |
| BR-IP-002 | Reorder Point | ROP = (LT × DD) + SS |
| BR-IP-003 | Safety Stock | SS = Z × σ × √LT |
| BR-IP-004 | Carrying Cost | CC = (Q/2) × H |
| BR-IP-005 | Total Cost | TC = (D/Q) × S + (Q/2) × H |

### 4.2 Risk Assessment Rules

| Rule ID | Description | Calculation |
|---------|-------------|-------------|
| BR-IP-010 | Implementation Risk | Based on change magnitude and item criticality |
| BR-IP-011 | Low Risk | Change ≤ 20%, Non-critical item |
| BR-IP-012 | Medium Risk | Change 20-50%, OR Critical item with small change |
| BR-IP-013 | High Risk | Change > 50%, OR Critical item with large change |

### 4.3 Dead Stock Rules

| Rule ID | Description | Threshold |
|---------|-------------|-----------|
| BR-IP-020 | Critical Dead Stock | No movement > 365 days OR > 24 months supply |
| BR-IP-021 | High Risk Dead Stock | No movement 181-365 days OR 12-24 months supply |
| BR-IP-022 | Medium Risk Dead Stock | No movement 91-180 days OR 6-12 months supply |
| BR-IP-023 | Low Risk Dead Stock | No movement ≤ 90 days AND ≤ 6 months supply |

### 4.4 Action Recommendation Rules

| Rule ID | Description | Criteria |
|---------|-------------|----------|
| BR-IP-030 | Implement | Savings > $100, Risk = Low |
| BR-IP-031 | Pilot | Savings > $50, Any Risk Level |
| BR-IP-032 | Monitor | Savings > $0, Risk = Medium |
| BR-IP-033 | Reject | Savings ≤ $0 OR Risk = High |

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Optimization Generation | < 5 seconds | 500 items |
| Dead Stock Analysis | < 3 seconds | All items |
| Dashboard Load | < 3 seconds | Initial render |
| Location Breakdown | < 2 seconds | Per location |

### 5.2 Scalability Requirements

| Requirement | Target |
|-------------|--------|
| Maximum Items | 10,000 items |
| Maximum Locations | 50 locations |
| Concurrent Users | 100 users |
| Data Retention | 3 years historical |

### 5.3 Availability Requirements

| Requirement | Target |
|-------------|--------|
| System Uptime | 99.5% |
| Scheduled Maintenance | Off-peak hours only |
| Data Refresh | Every 15 minutes |

---

## 6. Integration Requirements

### 6.1 Internal Integrations

| System | Integration Type | Data Flow |
|--------|-----------------|-----------|
| Demand Forecasting | Shared Service | Demand predictions → Optimization |
| Inventory Management | Read | Stock levels, transactions |
| Procurement | Write | Purchase recommendations |
| Financial Reporting | Read | Valuation data |

### 6.2 Service Integration

**Service**: `InventoryAnalyticsService`

| Method | Purpose | Parameters |
|--------|---------|------------|
| generateOptimizationRecommendations() | EOQ, reorder points | itemIds, locationId |
| analyzeDeadStock() | Dead stock analysis | thresholdDays, locationId |
| generatePerformanceDashboard() | KPI dashboard | locationId, dateRange |

---

## 7. User Stories

### 7.1 Inventory Manager Stories

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-IP-001 | As an Inventory Manager, I want to see optimization recommendations for all items so that I can reduce carrying costs | Recommendations show current vs optimized values with savings |
| US-IP-002 | As an Inventory Manager, I want to identify dead stock so that I can take action on obsolete items | Dead stock list with risk levels and recommended actions |
| US-IP-003 | As an Inventory Manager, I want to set safety stock by service level so that I can balance cost and availability | Service level selector (90%, 95%, 99%) with calculated safety stock |

### 7.2 Operations Manager Stories

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-IP-010 | As an Operations Manager, I want a dashboard showing inventory KPIs so that I can monitor performance | Dashboard with turnover, fill rate, stockout rate |
| US-IP-011 | As an Operations Manager, I want alerts for inventory issues so that I can address problems proactively | Alert system with configurable thresholds |

### 7.3 Financial Controller Stories

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-IP-020 | As a Financial Controller, I want to see potential savings from optimization so that I can prioritize improvements | Savings breakdown by category and action type |
| US-IP-021 | As a Financial Controller, I want to track dead stock value so that I can plan write-offs | Dead stock value with potential loss calculation |

---

## 8. Assumptions and Constraints

### 8.1 Assumptions

| ID | Assumption |
|----|------------|
| A-001 | Historical transaction data is available for at least 90 days |
| A-002 | Item master data includes accurate lead times |
| A-003 | Demand patterns are relatively stable (no major seasonality) |
| A-004 | Users have basic understanding of inventory concepts |

### 8.2 Constraints

| ID | Constraint |
|----|------------|
| C-001 | Must use existing InventoryAnalyticsService backend |
| C-002 | Must integrate with existing navigation structure |
| C-003 | Must support all existing user roles |
| C-004 | Must use Mermaid 8.8.2 compatible diagrams |

---

## 9. Dependencies

### 9.1 Internal Dependencies

| Dependency | Type | Impact |
|------------|------|--------|
| InventoryAnalyticsService | Backend Service | Required for all calculations |
| Inventory Management Module | Data Source | Stock levels and transactions |
| User Context | Authentication | Role-based access control |

### 9.2 External Dependencies

| Dependency | Type | Impact |
|------------|------|--------|
| Demand Forecasting | Shared Module | Forecast data for optimization |
| Financial Systems | Integration | Cost data for calculations |

---

## 10. Glossary

| Term | Definition |
|------|------------|
| EOQ | Economic Order Quantity - optimal order size to minimize total costs |
| Reorder Point | Stock level at which a new order should be placed |
| Safety Stock | Buffer stock to protect against demand variability |
| Carrying Cost | Cost of holding inventory over time |
| Dead Stock | Inventory with no movement over extended period |
| Turnover Ratio | How many times inventory is sold and replaced |
| Fill Rate | Percentage of orders fulfilled from available stock |
| Service Level | Probability of not experiencing a stockout |

---

**Document End**
