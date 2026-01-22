# Business Requirements: Inventory Aging

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Aging |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated interface field names; Updated expiry thresholds; Added expiry timeline chart; Added location aging performance; Added alert system; Updated summary cards to 6 |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Executive Summary

### 1.1 Purpose
The Inventory Aging module helps hotel operations track inventory age and expiration dates to ensure FIFO (First-In-First-Out) compliance, minimize waste from expired products, and optimize inventory freshness for quality assurance.

### 1.2 Business Objectives
- Track inventory age from receipt date
- Monitor expiry dates for perishable items
- Calculate value at risk from aging/expiring inventory
- Ensure FIFO compliance across locations
- Reduce waste and improve food safety
- Visualize expiry timeline and location performance

### 1.3 Success Metrics
| Metric | Target |
|--------|--------|
| Expiry tracking accuracy | 100% |
| FIFO compliance rate | 95% |
| Expired product waste reduction | 30% |
| Value at risk visibility | 100% |
| Page load time | < 2 seconds |

---

## 2. Functional Requirements

### 2.1 Age Tracking

#### FR-AG-001: Age Bucket Classification
| Bucket | Age Range | Color | Badge Style |
|--------|-----------|-------|-------------|
| 0-30 | 0-30 days | Green | outline with green background |
| 31-60 | 31-60 days | Yellow | outline with yellow background |
| 61-90 | 61-90 days | Orange | outline with orange background |
| 90+ | 90+ days | Red | destructive |

**Source Evidence**: `inventory-aging/page.tsx:281-296`

#### FR-AG-002: Age Calculation
```typescript
const ageInDays = Math.ceil(
  (Date.now() - new Date(receiptDate).getTime()) / (1000 * 60 * 60 * 24)
)

const getAgeBucket = (ageInDays: number): AgeBucket => {
  if (ageInDays <= 30) return '0-30'
  if (ageInDays <= 60) return '31-60'
  if (ageInDays <= 90) return '61-90'
  return '90+'
}
```

### 2.2 Expiry Tracking

#### FR-AG-003: Expiry Status Classification
| Status | Condition | Color | Badge Style |
|--------|-----------|-------|-------------|
| Good | > 90 days to expiry | Green | outline with green background |
| Expiring Soon | 30-90 days to expiry | Yellow | outline with yellow background |
| Critical | < 30 days to expiry | Orange | destructive |
| Expired | Past expiry date | Red | destructive |
| No Expiry | No expiry date | Gray | secondary |

**Source Evidence**: `inventory-aging/page.tsx:129-136`

#### FR-AG-004: Expiry Status Calculation
```typescript
const getExpiryStatus = (expiryDate?: Date): ExpiryStatus => {
  if (!expiryDate) return 'no-expiry'
  const daysToExpiry = Math.ceil(
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  if (daysToExpiry < 0) return 'expired'
  if (daysToExpiry < 30) return 'critical'
  if (daysToExpiry < 90) return 'expiring-soon'
  return 'good'
}
```

**Source Evidence**: `inventory-aging/page.tsx:129-136`

### 2.3 Item Data Display

#### FR-AG-005: Item Attributes
| Field | Description |
|-------|-------------|
| productCode | Unique identifier |
| productName | Display name |
| category | Product category |
| lotNumber | Lot/batch tracking identifier |
| locationId | Storage location ID |
| locationName | Storage location name |
| receiptDate | Date item was received |
| ageInDays | Days since receipt |
| ageBucket | Age classification (0-30, 31-60, 61-90, 90+) |
| expiryDate | Product expiration date |
| daysToExpiry | Days until expiration |
| expiryStatus | Expiry classification |
| quantity | Stock quantity |
| unit | Unit of measure |
| value | Inventory value |

**Source Evidence**: `inventory-aging/page.tsx:1003-1033`

### 2.4 Alert System

#### FR-AG-006: Alert Types
| Alert | Type | Trigger Condition |
|-------|------|-------------------|
| Expired Items | Destructive | expiredItems > 0 |
| Items Expiring Soon | Warning | nearExpiryItems > 0 |

**Source Evidence**: `inventory-aging/page.tsx:694-718`

### 2.5 Summary Cards

#### FR-AG-007: Summary Statistics (6 Cards)
| Card | Metric | Icon | Color |
|------|--------|------|-------|
| Total Items | COUNT(aging_items) | Package | Blue |
| Total Value | SUM(item.value) | DollarSign | Green |
| Average Age | AVG(item.ageInDays) | Clock | Orange |
| Near Expiry | COUNT(status IN ['expiring-soon', 'critical']) | Timer | Yellow |
| Expired Items | COUNT(status = 'expired') | AlertCircle | Red |
| Value at Risk | SUM(value WHERE at-risk) | TrendingDown | Red |

**Source Evidence**: `inventory-aging/page.tsx:720-805`

### 2.6 Value at Risk Tracking

#### FR-AG-008: Value at Risk Categories
| Category | Condition | Badge |
|----------|-----------|-------|
| Already Expired | status = 'expired' | Critical |
| Expiring <30 days | status = 'critical' | Urgent |
| Expiring 30-90 days | status = 'expiring-soon' | Monitor |
| Total at Risk | Sum of above | - |

**Source Evidence**: `inventory-aging/page.tsx:1329-1367`

### 2.7 Analytics Features

#### FR-AG-009: Expiry Timeline Chart
| Type | ComposedChart (Bar + Line) |
|------|----------------------------|
| Data | Items and value expiring by week (next 12 weeks) |
| X-Axis | Week date ranges |
| Y-Axis Left | Item count (bars) |
| Y-Axis Right | Value at risk (line) |

**Source Evidence**: `inventory-aging/page.tsx:1124-1156`

#### FR-AG-010: Age Bucket Distribution Chart
| Type | PieChart |
|------|----------|
| Data | Count by age bucket |
| Colors | 0-30 (#22c55e), 31-60 (#eab308), 61-90 (#f97316), 90+ (#ef4444) |
| Features | Inner/outer radius, labels with percentages, tooltips |

**Source Evidence**: `inventory-aging/page.tsx:1159-1203`

#### FR-AG-011: Expiry Status Distribution Chart
| Type | BarChart (horizontal) |
|------|----------------------|
| Data | Count by expiry status |
| Colors | Fresh (#22c55e), Expiring Soon (#eab308), Critical (#f97316), Expired (#ef4444), No Expiry (#94a3b8) |

**Source Evidence**: `inventory-aging/page.tsx:1205-1241`

#### FR-AG-012: Location Aging Performance Chart
| Type | ComposedChart (Bar + Line) |
|------|----------------------------|
| Data | Average age, at-risk items, and value by location |
| Bars | Average age (orange), at-risk items (red) |
| Line | Total value (blue) |

**Source Evidence**: `inventory-aging/page.tsx:1244-1278`

#### FR-AG-013: Category Aging Analysis
| Type | Table |
|------|-------|
| Data | Items, avg age, total value, expired value by category |
| Sorting | By average age descending |
| Features | Age distribution progress bars |

**Source Evidence**: `inventory-aging/page.tsx:1281-1323`

### 2.8 Action Center

#### FR-AG-014: Value at Risk Summary Panel
- Already Expired: Value and count with critical badge
- Expiring <30 days: Value with urgent badge
- Expiring 30-90 days: Value with monitor badge

**Source Evidence**: `inventory-aging/page.tsx:1329-1367`

#### FR-AG-015: Critical Items List
| Feature | Description |
|---------|-------------|
| Items | Expired and near-expiry items |
| Sorting | By expiry date ascending |
| Limit | Top 10 items |
| Actions | Dispose (for expired), Use/Transfer (for near-expiry) |

**Source Evidence**: `inventory-aging/page.tsx:1369-1440`

#### FR-AG-016: Oldest Items List
| Feature | Description |
|---------|-------------|
| Items | Items with longest time in stock |
| Sorting | By ageInDays descending |
| Limit | Top 10 items |
| Actions | Action button |

**Source Evidence**: `inventory-aging/page.tsx:1442-1482`

#### FR-AG-017: Recommended Actions
| Recommendation | Trigger | Action |
|----------------|---------|--------|
| Dispose Expired | expiredItems > 0 | Create Disposal Record |
| Prioritize Usage | nearExpiryItems > 0 | View Menu Suggestions |
| Rebalance Stock | avgAge > 45 at location | Plan Stock Transfers |

**Source Evidence**: `inventory-aging/page.tsx:1484-1538`

### 2.9 Filtering Capabilities

#### FR-AG-018: Filter Options
| Filter | Type | Values |
|--------|------|--------|
| Search | Text input | Name, code, or lot number |
| Category | Select dropdown | Dynamic from data |
| Age Bucket | Select dropdown | all, 0-30, 31-60, 61-90, 90+ |
| Expiry Status | Select dropdown | all, good, expiring-soon, critical, expired, no-expiry |
| Location | Select dropdown | User's available locations |

**Source Evidence**: `inventory-aging/page.tsx:820-903`

### 2.10 Grouping Options

#### FR-AG-019: Group By Options
| Option | Description |
|--------|-------------|
| Location | Group items by storage location |
| Age Bucket | Group items by age range |

**Source Evidence**: `inventory-aging/page.tsx:854-862`

### 2.11 Tab Structure

#### FR-AG-020: Available Tabs
| Tab | Content |
|-----|---------|
| Inventory List | Item table with filters |
| Analytics | Charts and breakdowns |
| Action Center | Quick actions and recommendations |

**Source Evidence**: `inventory-aging/page.tsx:807-813`

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
- Audit logging for disposals

### 3.3 Usability
- Responsive design
- Clear expiry indicators with color coding
- FIFO compliance guidance
- Expandable/collapsible grouped views

---

## 4. Data Requirements

### 4.1 Aging Item Interface
```typescript
interface AgingItem {
  id: string
  productId: string
  productCode: string
  productName: string
  category: string
  unit: string
  lotNumber?: string
  locationId: string
  locationName: string
  receiptDate: Date
  ageInDays: number
  ageBucket: '0-30' | '31-60' | '61-90' | '90+'
  expiryDate?: Date
  quantity: number
  value: number
}
```

**Source Evidence**: `lib/mock-data/location-inventory.ts`

### 4.2 Value at Risk Structure
```typescript
interface ValueAtRisk {
  expired: number
  critical: number
  expiringSoon: number
  total: number
}
```

**Source Evidence**: `inventory-aging/page.tsx:503-517`

### 4.3 Summary Statistics
```typescript
interface AgingStats {
  totalItems: number
  totalValue: number
  avgAge: number
  expiredItems: number
  nearExpiryItems: number
}
```

**Source Evidence**: `inventory-aging/page.tsx:332-353`

---

## 5. Business Rules

### BR-001: Age Bucket Assignment
Items are classified by days since receipt:
- 0-30 days = Fresh (Green)
- 31-60 days = Normal (Yellow)
- 61-90 days = Aging (Orange)
- 90+ days = Old (Red)

### BR-002: Expiry Status Assignment
Items are classified by days until expiration:
- > 90 days = Good
- 30-90 days = Expiring Soon
- < 30 days = Critical
- < 0 days = Expired
- No date = No Expiry

### BR-003: Value at Risk Calculation
Value at risk includes: Expired + Critical + Expiring Soon values.

### BR-004: FIFO Compliance
Oldest items (by received date) should be used/issued first.

### BR-005: Location Access Control
Users can only view items in their assigned locations, except System Administrators.

### BR-006: Disposal Tracking
All expired item disposals must be recorded with reason and approver.

### BR-007: Expiry Timeline
Expiry timeline shows items expiring in next 12 weeks for planning.

---

## 6. Acceptance Criteria

### AC-001: Summary Cards
- [ ] All 6 summary cards display correctly
- [ ] Icons and colors match specifications
- [ ] Values update with filter changes

### AC-002: Alerts
- [ ] Expired items alert displays with destructive style
- [ ] Near expiry alert displays with warning style
- [ ] Alert counts are accurate

### AC-003: Age Tracking
- [ ] Age calculated correctly from received date
- [ ] Age bucket assigned correctly
- [ ] Colors match age bucket

### AC-004: Expiry Tracking
- [ ] Expiry status calculated correctly with 30/90 day thresholds
- [ ] Days to expiry displayed
- [ ] Badges show correct colors

### AC-005: Value at Risk
- [ ] Expired value calculated correctly
- [ ] Critical value calculated correctly
- [ ] Total at risk sums correctly

### AC-006: Analytics
- [ ] Expiry timeline chart renders with 12 weeks
- [ ] Age bucket pie chart accurate
- [ ] Expiry status bar chart accurate
- [ ] Location aging performance chart renders
- [ ] Category analysis table displays

### AC-007: Action Center
- [ ] Value at risk summary displays correctly
- [ ] Critical items list shows expired/near-expiry
- [ ] Oldest items list shows highest age items
- [ ] Recommended actions display based on conditions

### AC-008: Grouping
- [ ] Group by location works
- [ ] Group by age bucket works
- [ ] Subtotals calculate correctly

---

## 7. User Stories

### US-001: Track Expiring Items
**As a** Quality Manager
**I want to** see items approaching expiration
**So that** I can ensure food safety

### US-002: FIFO Compliance
**As a** Storekeeper
**I want to** see oldest inventory first
**So that** I can issue stock correctly

### US-003: Value at Risk
**As a** Financial Controller
**I want to** see value at risk
**So that** I can assess financial impact

### US-004: Dispose Expired Items
**As an** Inventory Manager
**I want to** record expired item disposal
**So that** I can maintain accurate records

### US-005: View Expiry Timeline
**As an** Inventory Manager
**I want to** see items expiring in coming weeks
**So that** I can plan usage and promotions

---

## 8. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Missing expiry dates | High | Medium | Data validation on receipt |
| Incorrect age calculation | Medium | Low | Validate calculation logic |
| Disposal not recorded | High | Medium | Require approval workflow |
| FIFO not followed | Medium | Medium | Alerts and training |
| Chart rendering delay | Medium | Low | Lazy load chart components |

---

## Related Documents

- [TS-inventory-aging.md](./TS-inventory-aging.md) - Technical Specification
- [FD-inventory-aging.md](./FD-inventory-aging.md) - Flow Diagrams
- [UC-inventory-aging.md](./UC-inventory-aging.md) - Use Cases
- [VAL-inventory-aging.md](./VAL-inventory-aging.md) - Validations
