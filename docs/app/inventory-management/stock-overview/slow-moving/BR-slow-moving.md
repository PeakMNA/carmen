# Business Requirements: Slow Moving Inventory

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Slow Moving |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated type definitions; Added alert system; Added aging distribution chart; Added quick actions; Updated summary cards to 6 |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Executive Summary

### 1.1 Purpose
The Slow Moving Inventory module helps hotel operations identify and manage inventory that has been idle for extended periods, enabling proactive action to optimize inventory investment, reduce waste, and improve cash flow.

### 1.2 Business Objectives
- Identify slow-moving inventory items across all locations
- Classify items by risk level based on days since last movement
- Provide actionable recommendations for each item
- Track and manage actions taken on slow-moving stock
- Reduce inventory carrying costs and waste
- Visualize aging distribution and value at risk

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
| Tracking | Last movement date, days since movement |
| Scope | All inventory items across permitted locations |
| Turnover | Movements per month tracking |

**Source Evidence**: `slow-moving/page.tsx:77, lib/mock-data/location-inventory.ts:189-206`

#### FR-SM-002: Item Data Display
| Field | Description |
|-------|-------------|
| Product Code | Unique identifier |
| Product Name | Display name |
| Category | Product category |
| Location | Storage location |
| Days Since Movement | Days since last transaction |
| Current Stock | Quantity on hand with unit |
| Value | Inventory value |
| Turnover Rate | Movements per month |
| Risk Level | Calculated risk classification |
| Suggested Action | System recommendation |
| Last Movement Date | Most recent transaction date |

**Source Evidence**: `slow-moving/page.tsx:858-885`

### 2.2 Risk Classification

#### FR-SM-003: Risk Level Calculation
| Level | Days Since Movement | Color | Badge Style |
|-------|---------------------|-------|-------------|
| Low | 30-60 | Green | outline with green background |
| Medium | 61-90 | Yellow | outline with yellow background |
| High | 91-120 | Orange | outline with orange background |
| Critical | 120+ | Red | destructive |

**Source Evidence**: `slow-moving/page.tsx:294-310`

### 2.3 Action Recommendations

#### FR-SM-004: Suggested Actions
| Action | Badge Style | Description |
|--------|-------------|-------------|
| Transfer | Blue outline | Move to higher-demand location |
| Promote | Purple outline | Run promotional pricing |
| Write Off | Destructive | Remove from inventory |
| Hold | Secondary | Continue monitoring |

**Source Evidence**: `slow-moving/page.tsx:313-329`

### 2.4 Alert System

#### FR-SM-005: Alert Types
| Alert | Type | Trigger Condition |
|-------|------|-------------------|
| Critical Risk Items | Critical | criticalItems > 0 |
| Items for Write-Off | Warning | writeoffItems > 0 |
| Items Inactive 180+ Days | Warning | Items with daysSinceMovement > 180 |

**Source Evidence**: `slow-moving/page.tsx:419-444`

### 2.5 Summary Cards

#### FR-SM-006: Summary Statistics (6 Cards)
| Card | Metric | Icon | Color |
|------|--------|------|-------|
| Total Items | COUNT(slow_moving_items) | Package | Blue |
| Total Value | SUM(item.value) | DollarSign | Green |
| Avg Days Idle | AVG(item.daysSinceMovement) | Clock | Orange |
| Critical Risk | COUNT(riskLevel = 'critical') | AlertTriangle | Red |
| To Transfer | COUNT(suggestedAction = 'transfer') | ArrowRightLeft | Blue |
| To Write Off | COUNT(suggestedAction = 'writeoff') | Trash2 | Red |

**Source Evidence**: `slow-moving/page.tsx:567-657`

### 2.6 Analytics Features

#### FR-SM-007: Risk Distribution Chart
| Type | PieChart |
|------|----------|
| Data | Count by risk level |
| Colors | Critical (#ef4444), High (#f97316), Medium (#eab308), Low (#22c55e) |
| Features | Inner/outer radius, labels with percentages, tooltips, legend |

**Source Evidence**: `slow-moving/page.tsx:964-995`

#### FR-SM-008: Action Distribution Chart
| Type | PieChart |
|------|----------|
| Data | Count by suggested action |
| Colors | Transfer (#3b82f6), Promote (#8b5cf6), Write Off (#ef4444), Hold (#6b7280) |
| Features | Inner/outer radius, labels with percentages, tooltips, legend |

**Source Evidence**: `slow-moving/page.tsx:997-1029`

#### FR-SM-009: Aging Distribution Chart
| Type | ComposedChart (Bar + Line) |
|------|----------------------------|
| Data | Items and value by days since movement ranges |
| Buckets | 30-60, 60-90, 90-120, 120-180, 180+ days |
| Metrics | Item count (bars), Value (line) |

**Source Evidence**: `slow-moving/page.tsx:404-416, 1033-1061`

#### FR-SM-010: Category Breakdown
| Type | Progress Bars |
|------|---------------|
| Data | Items, value, and avg days by category |
| Sorting | By value descending |
| Limit | Top 10 categories |

**Source Evidence**: `slow-moving/page.tsx:383-391, 1065-1091`

#### FR-SM-011: Location Breakdown
| Type | Progress Bars |
|------|---------------|
| Data | Items, value, and critical count by location |
| Sorting | By value descending |
| Features | Critical badge indicator |

**Source Evidence**: `slow-moving/page.tsx:394-402, 1093-1125`

### 2.7 Action Center

#### FR-SM-012: Quick Actions
| Action | Icon | Description |
|--------|------|-------------|
| Bulk Transfer | ArrowRightLeft | Transfer multiple items |
| Create Promotion | Megaphone | Create promotional campaign |
| Request Write-Off | Trash2 | Batch write-off request |
| Export Report | FileDown | Export all items |

**Source Evidence**: `slow-moving/page.tsx:1141-1163`

#### FR-SM-013: Recommended Actions by Risk
- **Critical Risk Section**: Red border, shows top 5 critical items with action badges
- **High Risk Section**: Orange border, shows top 5 high risk items with action badges
- **View All Button**: Expands to show all items in category

**Source Evidence**: `slow-moving/page.tsx:1168-1238`

#### FR-SM-014: Action Summary Cards
| Action | Color | Shows |
|--------|-------|-------|
| Transfer | Blue | Count and label |
| Promote | Purple | Count and label |
| Write Off | Red | Count and label |
| Hold | Gray | Count and label |

**Source Evidence**: `slow-moving/page.tsx:1241-1285`

### 2.8 Filtering Capabilities

#### FR-SM-015: Filter Options
| Filter | Type | Values |
|--------|------|--------|
| Search | Text input | Name or code |
| Category | Select dropdown | Dynamic from data |
| Risk Level | Select dropdown | all, low, medium, high, critical |
| Suggested Action | Select dropdown | all, transfer, promote, writeoff, hold |
| Location | Select dropdown | User's available locations |

**Source Evidence**: `slow-moving/page.tsx:696-768`

### 2.9 View Modes

#### FR-SM-016: Display Options
| View | Description |
|------|-------------|
| List | Standard table with sorting |
| Grouped | Grouped by location with expand/collapse |

**Source Evidence**: `slow-moving/page.tsx:672-694`

### 2.10 Tab Structure

#### FR-SM-017: Available Tabs
| Tab | Content |
|-----|---------|
| Inventory List | Item table with filters |
| Analytics | Charts and breakdowns |
| Action Center | Quick actions and recommendations |

**Source Evidence**: `slow-moving/page.tsx:662-667`

---

## 3. Non-Functional Requirements

### 3.1 Performance
| Metric | Requirement |
|--------|-------------|
| Page Load | < 2 seconds |
| Filter Apply | < 500ms |
| Export | < 5 seconds |
| Tab Switch | < 300ms |
| Chart Render | < 1 second |

### 3.2 Security
- Role-based access control
- Location-based data filtering
- Audit logging for actions

### 3.3 Usability
- Responsive design
- Clear risk indicators with color coding
- Intuitive action workflow
- Expandable/collapsible grouped views

---

## 4. Data Requirements

### 4.1 Slow Moving Item Interface
```typescript
interface SlowMovingItem {
  id: string
  productId: string
  productCode: string
  productName: string
  category: string
  unit: string
  locationId: string
  locationName: string
  lastMovementDate: Date
  daysSinceMovement: number
  currentStock: number
  value: number
  averageCost: number
  turnoverRate: number  // movements per month
  suggestedAction: 'transfer' | 'promote' | 'writeoff' | 'hold'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}
```

**Source Evidence**: `lib/mock-data/location-inventory.ts:189-206`

### 4.2 Slow Moving Group Interface
```typescript
interface SlowMovingGroup {
  locationId: string
  locationName: string
  items: SlowMovingItem[]
  subtotals: {
    totalItems: number
    totalQuantity: number
    totalValue: number
    avgDaysSinceMovement: number
    criticalItems: number
  }
  isExpanded: boolean
}
```

**Source Evidence**: `lib/mock-data/location-inventory.ts:208-219`

### 4.3 Summary Statistics
```typescript
interface SlowMovingStats {
  totalItems: number
  totalValue: number
  avgDaysSinceMovement: number
  criticalItems: number
  highRiskItems: number
  mediumRiskItems: number
  lowRiskItems: number
  transferItems: number
  promoteItems: number
  writeoffItems: number
  holdItems: number
  criticalValue: number
}
```

**Source Evidence**: `slow-moving/page.tsx:332-362`

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

### BR-004: Alert Generation
- Critical alert when criticalItems > 0
- Warning alert when writeoffItems > 0
- Warning alert when items inactive for 180+ days

### BR-005: Aging Distribution
Items grouped into buckets: 30-60, 60-90, 90-120, 120-180, 180+ days.

---

## 6. Acceptance Criteria

### AC-001: Summary Cards
- [ ] All 6 summary cards display correctly
- [ ] Icons and colors match specifications
- [ ] Values update with filter changes
- [ ] Critical card shows border when items exist

### AC-002: Alerts
- [ ] Critical alert displays for critical items
- [ ] Warning alert displays for write-off items
- [ ] Warning alert displays for 180+ day items
- [ ] Alert icons and colors are correct

### AC-003: Risk Classification
- [ ] Items classified correctly based on days since movement
- [ ] Risk badges display appropriate colors
- [ ] Priority sorting works correctly

### AC-004: Analytics
- [ ] Risk distribution pie chart renders correctly
- [ ] Action distribution pie chart renders correctly
- [ ] Aging distribution chart shows bars and line
- [ ] Category and location breakdowns display

### AC-005: Action Center
- [ ] Quick action buttons display with counts
- [ ] Critical and high risk sections show items
- [ ] Action summary cards display correctly

---

## 7. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Incorrect risk classification | High | Low | Validate calculation logic |
| Action not executed | Medium | Medium | Implement tracking and reminders |
| Data latency | Medium | Low | Real-time movement tracking |
| User ignores recommendations | High | Medium | Dashboard KPIs and reports |
| Chart rendering delay | Medium | Low | Lazy load chart components |

---

## Related Documents

- [TS-slow-moving.md](./TS-slow-moving.md) - Technical Specification
- [FD-slow-moving.md](./FD-slow-moving.md) - Flow Diagrams
- [UC-slow-moving.md](./UC-slow-moving.md) - Use Cases
- [VAL-slow-moving.md](./VAL-slow-moving.md) - Validations
