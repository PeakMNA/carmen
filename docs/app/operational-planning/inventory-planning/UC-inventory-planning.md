# Inventory Planning - Use Cases

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

## Use Case Index

| ID | Name | Primary Actor | Priority |
|----|------|---------------|----------|
| UC-IP-001 | View Inventory Planning Dashboard | All Users | High |
| UC-IP-002 | Analyze Reorder Recommendations | Inventory Manager | High |
| UC-IP-003 | Analyze Dead Stock | Inventory Manager | High |
| UC-IP-004 | Configure Safety Stock by Service Level | Inventory Manager | Medium |
| UC-IP-005 | Review Multi-Location Performance | Operations Manager | Medium |
| UC-IP-006 | Apply Optimization Recommendations | Inventory Manager | High |
| UC-IP-007 | Configure Planning Settings | Inventory Manager | Low |

---

## UC-IP-001: View Inventory Planning Dashboard

### Overview

| Attribute | Value |
|-----------|-------|
| ID | UC-IP-001 |
| Name | View Inventory Planning Dashboard |
| Primary Actor | All Users |
| Priority | High |
| Frequency | Daily |

### Description

User accesses the Inventory Planning dashboard to view key performance indicators, alerts, charts, and recent recommendations for inventory optimization.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has Inventory Planning view permission |
| PRE-003 | Inventory data exists for the selected location |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Operational Planning > Inventory Planning | Display Dashboard page |
| 2 | System | - | Load KPI cards (Total Savings, Items at Risk, Optimization Rate, Dead Stock Value) |
| 3 | System | - | Display trend indicators with month-over-month comparisons |
| 4 | System | - | Render Optimization Actions pie chart |
| 5 | System | - | Render Location Performance bar chart |
| 6 | System | - | Display Alert Summary grid with clickable categories |
| 7 | System | - | Display Recent Recommendations table |
| 8 | User | Select location filter (optional) | Refresh dashboard with filtered data |
| 9 | User | Click alert category | Navigate to relevant detail page |

### Alternative Flows

#### AF-001: Navigate via Quick Actions

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 3a | User | Click "Optimize Inventory" button | Navigate to Reorder Management page |
| 3b | User | Click "Analyze Dead Stock" button | Navigate to Dead Stock Analysis page |
| 3c | User | Click "Review Locations" button | Navigate to Multi-Location page |
| 3d | User | Click "Configure Settings" button | Navigate to Settings page |

#### AF-002: Navigate to Demand Forecasting

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 10a | User | Click "Go to Demand Forecasting" link | Navigate to Demand Forecasting module |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Dashboard displayed with current data |
| POST-002 | User can navigate to detail pages |
| POST-003 | Cross-navigation to related modules available |

### Business Rules Applied

- BR-IP-DASH-001 to BR-IP-DASH-005: Dashboard display rules

---

## UC-IP-002: Analyze Reorder Recommendations

### Overview

| Attribute | Value |
|-----------|-------|
| ID | UC-IP-002 |
| Name | Analyze Reorder Recommendations |
| Primary Actor | Inventory Manager |
| Priority | High |
| Frequency | Weekly |

### Description

Inventory Manager reviews EOQ and ROP recommendations for inventory items, comparing current vs recommended parameters with risk assessment and savings projections.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has reorder management permission |
| PRE-003 | Items have sufficient transaction history |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Inventory Planning > Reorder | Display Reorder Management page |
| 2 | System | - | Load recommendations table with columns: Product, Current ROP/EOQ, Recommended ROP/EOQ, Savings, Risk, Action |
| 3 | User | Select action type filter (optional) | Filter table by action type (implement, pilot, monitor, reject) |
| 4 | User | Click row to expand | Display expanded details with Current Metrics, Recommended Changes, and Potential Impact sections |
| 5 | User | Review current vs recommended values | View ROP, EOQ, Safety Stock, Service Level comparisons |
| 6 | User | Select items via checkbox | Enable bulk actions |
| 7 | User | Click "Apply Selected" | Display confirmation dialog |
| 8 | User | Confirm application | Apply recommendations to selected items |

### Alternative Flows

#### AF-001: Export Recommendations

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 6a | User | Click "Export" button | Download recommendations as file |

#### AF-002: Navigate to Stock Replenishment

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 9a | User | Click "Stock Replenishment" link | Navigate to Store Operations Stock Replenishment page |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Recommendations displayed with risk and savings |
| POST-002 | Selected recommendations applied (if confirmed) |
| POST-003 | Audit trail created for applied changes |

### Business Rules Applied

- BR-IP-001: EOQ Calculation
- BR-IP-002: Reorder Point Calculation
- BR-IP-003: Safety Stock Calculation
- BR-IP-030 to BR-IP-033: Action Recommendations

---

## UC-IP-003: Analyze Dead Stock

### Overview

| Attribute | Value |
|-----------|-------|
| ID | UC-IP-003 |
| Name | Analyze Dead Stock |
| Primary Actor | Inventory Manager |
| Priority | High |
| Frequency | Monthly |

### Description

Inventory Manager analyzes items with no recent movement to identify obsolete inventory, assess risk levels, and determine appropriate actions.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has dead stock analysis permission |
| PRE-003 | Inventory transaction history available |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Inventory Planning > Dead Stock | Display Dead Stock Analysis page |
| 2 | System | - | Display Risk Overview cards (Critical, High, Medium, Low) with counts and values |
| 3 | User | Set threshold days filter (60, 90, 120, 180, 365) | Filter items by days since movement |
| 4 | User | Select location filter (optional) | Filter to selected location |
| 5 | User | Select risk level filter (optional) | Filter by risk classification |
| 6 | System | - | Display dead stock table with columns: Product, Stock, Value, Last Movement, Days, Risk, Action |
| 7 | User | Click row to expand | Display Stock Analysis and Financial Impact sections |
| 8 | System | - | Show Months of Stock, Expiry Date, Potential Loss, Liquidation Value |
| 9 | User | Select action for item | Record planned action (liquidate, return, writeoff, continue, reduce) |

### Alternative Flows

#### AF-001: Bulk Action

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 9a | User | Select multiple items via checkboxes | Enable bulk action button |
| 9b | User | Choose bulk action | Apply action to all selected items |
| 9c | System | - | Update status for selected items |

#### AF-002: Export Dead Stock Report

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 10a | User | Click "Export" button | Download dead stock report |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Dead stock list displayed with risk levels |
| POST-002 | Recommended actions shown for each item |
| POST-003 | Financial impact calculated |

### Business Rules Applied

- BR-IP-020 to BR-IP-023: Dead Stock Risk Classification
- FR-IP-DS-004: Recommended Actions
- FR-IP-DS-006: Risk Classification Rules

---

## UC-IP-004: Configure Safety Stock by Service Level

### Overview

| Attribute | Value |
|-----------|-------|
| ID | UC-IP-004 |
| Name | Configure Safety Stock by Service Level |
| Primary Actor | Inventory Manager |
| Priority | Medium |
| Frequency | Monthly |

### Description

Inventory Manager adjusts safety stock parameters by selecting target service level (90%, 95%, 99%) and reviewing the impact on inventory costs.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has safety stock configuration permission |
| PRE-003 | Demand variability data available |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Inventory Planning > Safety Stock | Display Safety Stock page |
| 2 | System | - | Display current service level setting (default 95%) |
| 3 | System | - | Display comparison table: Current vs Recommended safety stock |
| 4 | User | Select service level tab (90%, 95%, 99%) | Recalculate safety stock using Z-score |
| 5 | System | - | Update comparison table with new calculations |
| 6 | System | - | Display cost impact column |
| 7 | System | - | Render What-If Analysis line chart |
| 8 | User | Review cost vs service level trade-off | Evaluate chart showing cost curve |
| 9 | User | Select items to update | Enable "Apply Selected" button |
| 10 | User | Click "Apply Selected" | Update safety stock for selected items |

### Alternative Flows

#### AF-001: Category-Level View

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 4a | User | Select specific category | Filter items to category |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Safety stock recalculated based on service level |
| POST-002 | Inventory value impact displayed |
| POST-003 | Changes applied to selected items |

### Business Rules Applied

- BR-IP-003: Safety Stock Calculation with Z-score
- Service Level Z-Scores: 90%=1.28, 95%=1.65, 99%=2.33

---

## UC-IP-005: Review Multi-Location Performance

### Overview

| Attribute | Value |
|-----------|-------|
| ID | UC-IP-005 |
| Name | Review Multi-Location Performance |
| Primary Actor | Operations Manager |
| Priority | Medium |
| Frequency | Weekly |

### Description

Operations Manager reviews inventory performance across multiple locations to identify imbalances, status issues, and transfer opportunities.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has multi-location view permission |
| PRE-003 | Multiple locations exist with inventory data |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Inventory Planning > Locations | Display Multi-Location page |
| 2 | System | - | Display Location Summary cards (Optimal, Overstocked, Understocked counts) |
| 3 | System | - | Render Location Performance bar chart |
| 4 | User | Select location filter (optional) | Focus on specific locations |
| 5 | System | - | Display Location Breakdown table with: Location, Value, Turnover, Alerts, Status |
| 6 | System | - | Display Transfer Recommendations table |
| 7 | User | Review transfer recommendation | View source, destination, quantity, priority, estimated savings |
| 8 | User | Click "Create Transfer" (optional) | Create transfer request |

### Alternative Flows

#### AF-001: Single Location

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 2a | System | Only one location exists | Display message: "Multi-location analysis requires 2+ locations" |

#### AF-002: No Transfer Opportunities

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 6a | System | All locations balanced | Display "No transfers recommended" message |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Location performance comparison displayed |
| POST-002 | Transfer recommendations identified |
| POST-003 | User can initiate transfers |

### Business Rules Applied

- FR-IP-LOC-001 to FR-IP-LOC-005: Location Performance and Transfer Rules

---

## UC-IP-006: Apply Optimization Recommendations

### Overview

| Attribute | Value |
|-----------|-------|
| ID | UC-IP-006 |
| Name | Apply Optimization Recommendations |
| Primary Actor | Inventory Manager |
| Priority | High |
| Frequency | Weekly |

### Description

Inventory Manager reviews and applies optimization recommendations to update reorder points, order quantities, and safety stock levels.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has optimization apply permission |
| PRE-003 | Recommendations have been generated |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Reorder Management page | Display recommendations table |
| 2 | User | Review recommendation details | Expand row to see current vs recommended |
| 3 | User | Select items to apply (checkbox) | Enable "Apply Selected" button |
| 4 | User | Click "Apply Selected" | Display confirmation dialog |
| 5 | System | - | Show summary: items count, total savings |
| 6 | User | Confirm application | Process changes |
| 7 | System | - | Update reorder points in system |
| 8 | System | - | Update order quantities |
| 9 | System | - | Log changes with timestamp and user |
| 10 | System | - | Display success message |
| 11 | System | - | Refresh table with updated status |

### Alternative Flows

#### AF-001: Apply Single Item

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 3a | User | Click action on single row | Display item-specific confirmation |
| 3b | User | Confirm | Apply changes for single item |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Selected recommendations applied to inventory |
| POST-002 | Changes logged for audit |
| POST-003 | Table reflects updated status |

### Business Rules Applied

- Recommendations must be reviewed before application
- Changes are auditable with user and timestamp

---

## UC-IP-007: Configure Planning Settings

### Overview

| Attribute | Value |
|-----------|-------|
| ID | UC-IP-007 |
| Name | Configure Planning Settings |
| Primary Actor | Inventory Manager |
| Priority | Low |
| Frequency | Quarterly |

### Description

Inventory Manager configures default parameters, alert thresholds, notifications, and automation settings for inventory planning calculations.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has settings configuration permission |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Inventory Planning > Settings | Display Settings page |
| 2 | System | - | Load current configuration in form |
| 3 | User | Adjust Default Parameters: | |
| | | - Default Service Level (90%, 95%, 99%) | Update calculation default |
| | | - Order Cost Per Order ($) | Update EOQ calculation |
| | | - Holding Cost Rate (%) | Update carrying cost |
| | | - Default Lead Time (days) | Update reorder point default |
| 4 | User | Configure Alert Thresholds: | |
| | | - Dead Stock Threshold (days) | Set analysis threshold |
| | | - Low/Dead/Overstock Alert toggles | Enable/disable alerts |
| 5 | User | Configure Notification Settings: | |
| | | - Email Notifications toggle | Enable/disable |
| | | - Notification Email | Set email address |
| | | - Digest Frequency | Set Daily/Weekly/Monthly |
| 6 | User | Configure Automation Settings: | |
| | | - Auto-Apply Low Risk | Enable/disable |
| | | - Auto-Generate Weekly | Enable/disable |
| | | - Sync with Procurement | Enable/disable |
| 7 | User | Click "Save Settings" | Validate and save |
| 8 | System | - | Apply new settings |
| 9 | System | - | Display success message |

### Alternative Flows

#### AF-001: Validation Error

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 7a | System | Validation fails | Display error messages |
| 7b | User | Correct invalid values | Re-validate |

#### AF-002: Reset to Defaults

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 3a | User | Click "Reset to Defaults" | Display confirmation |
| 3b | User | Confirm | Reset all settings to system defaults |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Settings saved to configuration |
| POST-002 | Future calculations use new parameters |
| POST-003 | Notifications configured |

### Business Rules Applied

- Settings validation before save
- Default values provided for all parameters
- Settings apply to future calculations only

---

## Use Case Relationships

```
UC-IP-001 (Dashboard)
├── Quick Actions → UC-IP-002 (Reorder)
├── Quick Actions → UC-IP-003 (Dead Stock)
├── Quick Actions → UC-IP-005 (Multi-Location)
├── Quick Actions → UC-IP-007 (Settings)
├── Alert Click → UC-IP-002 (Reorder)
├── Alert Click → UC-IP-003 (Dead Stock)
└── Cross-Nav → Demand Forecasting

UC-IP-002 (Reorder)
├── Uses → UC-IP-006 (Apply Recommendations)
├── Requires → UC-IP-007 (Settings)
└── Cross-Nav → Store Operations Stock Replenishment

UC-IP-004 (Safety Stock)
├── Uses → UC-IP-006 (Apply Recommendations)
└── Requires → UC-IP-007 (Settings)
```

---

**Document End**
