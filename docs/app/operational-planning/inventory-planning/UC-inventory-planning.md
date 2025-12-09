# Inventory Planning - Use Cases

## Document Information

| Field | Value |
|-------|-------|
| Module | Inventory Planning |
| Version | 1.0.0 |
| Last Updated | 2025-12-06 |
| Status | Draft |

---

## Use Case Index

| ID | Name | Primary Actor | Priority |
|----|------|---------------|----------|
| UC-IP-001 | View Inventory Planning Dashboard | All Users | High |
| UC-IP-002 | Generate Optimization Recommendations | Inventory Manager | High |
| UC-IP-003 | Analyze Dead Stock | Inventory Manager | High |
| UC-IP-004 | Configure Safety Stock Levels | Inventory Manager | Medium |
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

User accesses the Inventory Planning dashboard to view key performance indicators, alerts, and summary metrics for inventory optimization.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has Inventory Planning view permission |
| PRE-003 | Inventory data exists for the selected location |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Operational Planning → Inventory Planning | Display Dashboard page |
| 2 | System | - | Load performance metrics via generatePerformanceDashboard() |
| 3 | System | - | Display KPI cards (Total Value, Turnover, Days of Inventory, Fill Rate) |
| 4 | System | - | Display alert summary by severity |
| 5 | System | - | Display optimization actions chart |
| 6 | System | - | Display location performance chart |
| 7 | User | Select location filter (optional) | Refresh dashboard with filtered data |
| 8 | User | Click on alert category | Navigate to relevant detail page |

### Alternative Flows

#### AF-001: No Data Available

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 2a | System | No inventory data exists | Display "No data available" message |
| 2b | System | - | Show data requirements and setup instructions |

#### AF-002: View Specific Alert

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 8a | User | Click "Low Stock" alert count | Navigate to items at reorder point |
| 8b | User | Click "Dead Stock" alert count | Navigate to Dead Stock Analysis page |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Dashboard displayed with current data |
| POST-002 | User can navigate to detail pages |

### Business Rules Applied

- BR-IP-DASH-001: Overall metrics calculation
- BR-IP-DASH-004: Alert severity classification

---

## UC-IP-002: Generate Optimization Recommendations

### Overview

| Attribute | Value |
|-----------|-------|
| ID | UC-IP-002 |
| Name | Generate Optimization Recommendations |
| Primary Actor | Inventory Manager |
| Priority | High |
| Frequency | Weekly |

### Description

Inventory Manager generates optimization recommendations for inventory items to reduce carrying costs while maintaining service levels.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has optimization permission |
| PRE-003 | Items have sufficient transaction history (≥90 days) |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Inventory Planning → Reorder Management | Display Reorder Management page |
| 2 | User | Select location filter (optional) | Filter to selected location |
| 3 | User | Select category filter (optional) | Filter to selected category |
| 4 | User | Click "Generate Recommendations" | Trigger generateOptimizationRecommendations() |
| 5 | System | - | Calculate EOQ for each item |
| 6 | System | - | Calculate optimal reorder point |
| 7 | System | - | Calculate recommended safety stock |
| 8 | System | - | Assess implementation risk |
| 9 | System | - | Calculate potential savings |
| 10 | System | - | Display recommendations table |
| 11 | User | Expand item row to view details | Show current vs recommended comparison |
| 12 | User | Sort by savings or risk | Reorder recommendations |

### Alternative Flows

#### AF-001: Insufficient History

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 5a | System | Item has < 90 days history | Skip item with "Insufficient data" note |
| 5b | System | - | Continue with remaining items |

#### AF-002: Filter by Action Type

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 10a | User | Select "Implement" filter | Show only items with IMPLEMENT recommendation |
| 10b | User | Select "High Risk" filter | Show only items with HIGH risk |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Recommendations displayed for filtered items |
| POST-002 | Each recommendation includes savings and risk |

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

Inventory Manager analyzes items with no recent movement to identify obsolete inventory and determine appropriate actions.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has dead stock analysis permission |
| PRE-003 | Inventory transaction history available |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Inventory Planning → Dead Stock Analysis | Display Dead Stock Analysis page |
| 2 | System | - | Load risk overview cards (Critical/High/Medium/Low counts) |
| 3 | User | Set threshold days filter (default: 90) | Filter items by days since movement |
| 4 | User | Select location filter (optional) | Filter to selected location |
| 5 | User | Select risk level filter (optional) | Filter by risk classification |
| 6 | System | - | Call analyzeDeadStock() with parameters |
| 7 | System | - | Display dead stock table with columns: Item, Stock, Value, Last Movement, Days Idle, Risk, Action |
| 8 | User | Click item row to expand | Show detailed analysis |
| 9 | System | - | Display months of stock, potential loss, liquidation value |
| 10 | User | Select action for item | Record planned action |

### Alternative Flows

#### AF-001: No Dead Stock

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 7a | System | No items meet threshold | Display "No dead stock identified" message |
| 7b | System | - | Show congratulatory message with healthy inventory status |

#### AF-002: Bulk Action

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 10a | User | Select multiple items | Enable bulk action button |
| 10b | User | Choose bulk action (e.g., "Mark for Liquidation") | Apply action to all selected items |
| 10c | System | - | Update status for selected items |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Dead stock list displayed with risk levels |
| POST-002 | Recommended actions shown for each item |
| POST-003 | Financial impact calculated |

### Business Rules Applied

- BR-IP-020 to BR-IP-023: Dead Stock Risk Classification
- BR-IP-DS-002: Recommended Actions
- BR-IP-DS-003: Financial Impact Calculation

---

## UC-IP-004: Configure Safety Stock Levels

### Overview

| Attribute | Value |
|-----------|-------|
| ID | UC-IP-004 |
| Name | Configure Safety Stock Levels |
| Primary Actor | Inventory Manager |
| Priority | Medium |
| Frequency | Monthly |

### Description

Inventory Manager adjusts safety stock parameters by service level to balance inventory costs with availability targets.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has safety stock configuration permission |
| PRE-003 | Demand variability data available |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Inventory Planning → Safety Stock | Display Safety Stock page |
| 2 | System | - | Display current service level setting |
| 3 | System | - | Display comparison table: Current vs Recommended safety stock |
| 4 | User | Select service level (90%, 95%, 99%) | Recalculate safety stock using Z-score |
| 5 | System | - | Update comparison table with new calculations |
| 6 | System | - | Show impact on inventory value |
| 7 | User | View What-If chart | Display cost vs service level curve |
| 8 | User | Click "Apply Recommendations" | Update safety stock for selected items |

### Alternative Flows

#### AF-001: Category-Level Configuration

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 4a | User | Select specific category | Filter items to category |
| 4b | User | Set different service level for category | Calculate with category-specific setting |

#### AF-002: Item-Level Override

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 5a | User | Click item to override | Open item detail |
| 5b | User | Set custom safety stock | Override calculated value |
| 5c | System | - | Mark item as manually overridden |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Safety stock recalculated based on service level |
| POST-002 | Inventory value impact displayed |
| POST-003 | Changes can be applied or discarded |

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

Operations Manager reviews inventory performance across multiple locations to identify imbalances and transfer opportunities.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has multi-location view permission |
| PRE-003 | Multiple locations exist with inventory data |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Inventory Planning → Multi-Location | Display Multi-Location page |
| 2 | System | - | Load location summary (Optimal/Overstocked/Understocked) |
| 3 | System | - | Display location breakdown chart |
| 4 | User | Select location filter (optional) | Focus on specific locations |
| 5 | System | - | Display Location Breakdown table |
| 6 | System | - | Calculate stock balance by location |
| 7 | System | - | Identify transfer opportunities |
| 8 | System | - | Display Transfer Recommendations panel |
| 9 | User | Click transfer recommendation | View transfer details |
| 10 | User | Approve transfer | Create transfer request |

### Alternative Flows

#### AF-001: Single Location

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 2a | System | Only one location exists | Display message: "Multi-location analysis requires 2+ locations" |
| 2b | System | - | Redirect to Dashboard |

#### AF-002: No Transfer Opportunities

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 8a | System | All locations balanced | Display "No transfers recommended" |
| 8b | System | - | Show healthy distribution message |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Location performance comparison displayed |
| POST-002 | Transfer recommendations identified |
| POST-003 | User can initiate transfers |

### Business Rules Applied

- BR-IP-LOC-001: Location Performance Comparison
- BR-IP-LOC-002: Transfer Recommendations

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

Inventory Manager reviews and applies optimization recommendations to update reorder points and order quantities.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has optimization apply permission |
| PRE-003 | Recommendations have been generated |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Reorder Management page | Display recommendations |
| 2 | User | Review recommendation details | Expand row to see current vs recommended |
| 3 | User | Select items to apply (checkbox) | Enable "Apply Selected" button |
| 4 | User | Click "Apply Selected" | Display confirmation dialog |
| 5 | System | - | Show summary: items count, total savings |
| 6 | User | Confirm application | Process changes |
| 7 | System | - | Update reorder points in system |
| 8 | System | - | Update order quantities |
| 9 | System | - | Log changes with timestamp and user |
| 10 | System | - | Display success message |

### Alternative Flows

#### AF-001: Apply Single Item

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 3a | User | Click "Apply" button on single row | Display item-specific confirmation |
| 3b | User | Confirm | Apply changes for single item |

#### AF-002: Export for Review

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 3c | User | Click "Export" | Download recommendations as Excel |
| 3d | User | Review offline | - |
| 3e | User | Return to apply | Continue from step 3 |

#### AF-003: Reject Recommendation

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 3f | User | Click "Reject" on item | Mark as rejected |
| 3g | System | - | Remove from active recommendations |
| 3h | System | - | Exclude from next generation cycle |

### Postconditions

| ID | Condition |
|----|-----------|
| POST-001 | Selected recommendations applied to inventory |
| POST-002 | Changes logged for audit |
| POST-003 | Dashboard metrics updated |

### Business Rules Applied

- Recommendations must be reviewed before application
- Changes are auditable with user and timestamp
- Rejected items excluded from future recommendations

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

Inventory Manager configures default parameters and thresholds for inventory planning calculations.

### Preconditions

| ID | Condition |
|----|-----------|
| PRE-001 | User is authenticated |
| PRE-002 | User has settings configuration permission |

### Main Flow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to Inventory Planning → Settings | Display Settings page |
| 2 | System | - | Load current configuration |
| 3 | User | Adjust default parameters: | |
| | | - Default service level | Update calculation default |
| | | - Order cost ($) | Update EOQ calculation |
| | | - Holding cost rate (%) | Update carrying cost |
| | | - Lead time (days) | Update reorder point default |
| 4 | User | Configure notification settings: | |
| | | - Low stock threshold | Set alert trigger |
| | | - Dead stock days | Set analysis threshold |
| | | - Email notifications | Enable/disable alerts |
| 5 | User | Configure integration settings: | |
| | | - Auto-apply low risk recommendations | Enable/disable |
| | | - Sync with procurement | Enable/disable |
| 6 | User | Click "Save Settings" | Validate and save |
| 7 | System | - | Apply new settings |
| 8 | System | - | Display success message |

### Alternative Flows

#### AF-001: Invalid Configuration

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 6a | System | Validation fails | Display error messages |
| 6b | User | Correct invalid values | Re-validate |

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
├── Navigates to → UC-IP-002 (Optimization)
├── Navigates to → UC-IP-003 (Dead Stock)
└── Navigates to → UC-IP-005 (Multi-Location)

UC-IP-002 (Optimization)
├── Uses → UC-IP-006 (Apply Recommendations)
└── Requires → UC-IP-007 (Settings)

UC-IP-004 (Safety Stock)
├── Uses → UC-IP-006 (Apply Recommendations)
└── Requires → UC-IP-007 (Settings)
```

---

**Document End**
