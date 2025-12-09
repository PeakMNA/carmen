# Business Requirements: Slow Moving Inventory

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Slow Moving |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. Executive Summary

### 1.1 Purpose
The Slow Moving Inventory module helps hotel operations identify and manage inventory that has been idle for extended periods, enabling proactive action to optimize inventory investment, reduce waste, and improve cash flow.

### 1.2 Business Objectives
- Identify slow-moving inventory items across all locations
- Classify items by risk level based on days idle
- Provide actionable recommendations for each item
- Track and manage actions taken on slow-moving stock
- Reduce inventory carrying costs and waste

### 1.3 Success Metrics
| Metric | Target |
|--------|--------|
| Slow-moving item identification | 100% |
| Action recommendation accuracy | 95% |
| Action completion rate | 80% within 30 days |
| Inventory reduction | 20% of slow-moving value |
| Page load time | < 2 seconds |

---

## 2. Functional Requirements

### 2.1 Item Identification

#### FR-SM-001: Slow Moving Detection
| Attribute | Description |
|-----------|-------------|
| Threshold | Items with no movement for 30+ days |
| Tracking | Last receipt, last issue, last movement dates |
| Scope | All inventory items across permitted locations |

#### FR-SM-002: Item Data Display
| Field | Description |
|-------|-------------|
| Product Code | Unique identifier |
| Product Name | Display name |
| Category | Product category |
| Current Stock | Quantity on hand |
| Value | Inventory value |
| Days Idle | Days since last movement |
| Last Movement | Most recent transaction date |
| Risk Level | Calculated risk classification |
| Suggested Action | System recommendation |
| Location | Storage location |

### 2.2 Risk Classification

#### FR-SM-003: Risk Level Calculation
| Level | Days Idle | Color | Priority |
|-------|-----------|-------|----------|
| Low | 30-60 | Green | 4 |
| Medium | 61-90 | Amber | 3 |
| High | 91-120 | Orange | 2 |
| Critical | 120+ | Red | 1 |

#### FR-SM-004: Risk Scoring
```typescript
calculateRiskLevel(daysIdle: number): RiskLevel {
  if (daysIdle >= 120) return 'critical'
  if (daysIdle >= 91) return 'high'
  if (daysIdle >= 61) return 'medium'
  return 'low'
}
```

### 2.3 Action Recommendations

#### FR-SM-005: Suggested Actions
| Action | Criteria | Description |
|--------|----------|-------------|
| Transfer | High value, stock exists elsewhere | Move to higher-demand location |
| Promote | Medium risk, promotable category | Run promotional pricing |
| Write Off | Critical risk, low value | Remove from inventory |
| Hold | Low risk, strategic item | Continue monitoring |

#### FR-SM-006: Action Assignment Logic
```typescript
suggestAction(item: SlowMovingItem): Action {
  if (item.riskLevel === 'critical' && item.value < threshold) return 'writeoff'
  if (item.riskLevel === 'high' && item.hasOtherLocations) return 'transfer'
  if (item.category in promotableCategories) return 'promote'
  return 'hold'
}
```

### 2.4 Summary Statistics

#### FR-SM-007: Summary Cards
| Card | Calculation |
|------|-------------|
| Total Items | COUNT(slow_moving_items) |
| Total Value | SUM(item.value) |
| Avg Days Idle | AVG(item.daysIdle) |
| Critical Risk | COUNT(riskLevel = 'critical') |
| To Transfer | COUNT(action = 'transfer') |
| To Write Off | COUNT(action = 'writeoff') |

### 2.5 Analytics Features

#### FR-SM-008: Risk Distribution Chart
| Type | Pie Chart |
|------|-----------|
| Data | Count by risk level |
| Colors | Green, Amber, Orange, Red |
| Interaction | Hover for percentages |

#### FR-SM-009: Category Breakdown Chart
| Type | Bar Chart |
|------|-----------|
| Data | Count by category |
| Sorting | By count descending |
| Interaction | Hover for values |

#### FR-SM-010: Value at Risk Analysis
| Metric | Calculation |
|--------|-------------|
| Critical Value | SUM(value WHERE risk='critical') |
| High Value | SUM(value WHERE risk='high') |
| Medium Value | SUM(value WHERE risk='medium') |
| Total at Risk | SUM of above |

### 2.6 Action Center

#### FR-SM-011: Action Queue
| Feature | Description |
|---------|-------------|
| Pending Actions | Items requiring action |
| Priority Sorting | By risk level, then value |
| Status Tracking | Pending, In Progress, Completed |
| Bulk Actions | Select multiple items |

### 2.7 Filtering Capabilities

#### FR-SM-012: Filter Options
| Filter | Type | Values |
|--------|------|--------|
| Search | Text | Name or code |
| Category | Dropdown | Dynamic from data |
| Risk Level | Dropdown | Low, Medium, High, Critical |
| Suggested Action | Dropdown | Transfer, Promote, Write Off, Hold |
| Location | Dropdown | User's available locations |

### 2.8 View Modes

#### FR-SM-013: Display Options
| View | Description |
|------|-------------|
| List | Standard table with sorting |
| Grouped | Grouped by location |

---

## 3. Non-Functional Requirements

### 3.1 Performance
| Metric | Requirement |
|--------|-------------|
| Page Load | < 2 seconds |
| Filter Apply | < 500ms |
| Export | < 5 seconds |
| Action Execute | < 1 second |

### 3.2 Security
- Role-based access control
- Location-based data filtering
- Audit logging for actions

### 3.3 Usability
- Responsive design
- Clear risk indicators
- Intuitive action workflow

---

## 4. Data Requirements

### 4.1 Slow Moving Item Structure
```typescript
interface SlowMovingItem {
  id: string
  code: string
  name: string
  category: string
  unit: string
  currentStock: number
  value: number
  daysIdle: number
  lastMovementDate: string
  lastReceiptDate: string
  lastIssueDate: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  suggestedAction: 'transfer' | 'promote' | 'writeoff' | 'hold'
  location: {
    id: string
    name: string
  }
}
```

### 4.2 Summary Statistics
```typescript
interface SlowMovingStats {
  totalItems: number
  totalValue: number
  avgDaysIdle: number
  criticalCount: number
  transferCount: number
  writeOffCount: number
  riskDistribution: RiskCount[]
  categoryBreakdown: CategoryCount[]
}
```

---

## 5. Business Rules

### BR-001: Risk Level Assignment
Items are automatically classified based on days since last movement:
- 30-60 days = Low Risk
- 61-90 days = Medium Risk
- 91-120 days = High Risk
- 120+ days = Critical Risk

### BR-002: Action Recommendation
System suggests actions based on risk level, value, and category.

### BR-003: Location Access Control
Users can only view items in their assigned locations, except System Administrators.

### BR-004: Value Threshold
Items below minimum value threshold are recommended for write-off at critical risk.

### BR-005: Transfer Eligibility
Items can only be recommended for transfer if stock exists in multiple locations.

---

## 6. Acceptance Criteria

### AC-001: Item Display
- [ ] All slow-moving items displayed with required fields
- [ ] Risk level badges show correct colors
- [ ] Days idle calculated correctly

### AC-002: Risk Classification
- [ ] Items classified correctly based on days idle
- [ ] Risk badges display appropriate colors
- [ ] Priority sorting works correctly

### AC-003: Action Recommendations
- [ ] Suggested actions display for all items
- [ ] Action icons and colors are correct
- [ ] Recommendations follow business logic

### AC-004: Analytics
- [ ] Risk distribution chart renders correctly
- [ ] Category breakdown shows accurate data
- [ ] Charts update with filter changes

### AC-005: Action Center
- [ ] Pending actions display correctly
- [ ] Priority sorting works
- [ ] Actions can be executed

---

## 7. User Stories

### US-001: Identify Slow Moving Stock
**As an** Inventory Manager
**I want to** see all slow-moving items
**So that** I can take action to reduce waste

### US-002: Assess Risk
**As a** Financial Controller
**I want to** see value at risk by category
**So that** I can prioritize actions

### US-003: Take Action
**As an** Inventory Manager
**I want to** execute recommended actions
**So that** I can reduce slow-moving inventory

### US-004: Filter by Location
**As a** Storekeeper
**I want to** see slow-moving items at my location
**So that** I can address local issues

---

## 8. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Incorrect risk classification | High | Low | Validate calculation logic |
| Action not executed | Medium | Medium | Implement tracking and reminders |
| Data latency | Medium | Low | Real-time movement tracking |
| User ignores recommendations | High | Medium | Dashboard KPIs and reports |
