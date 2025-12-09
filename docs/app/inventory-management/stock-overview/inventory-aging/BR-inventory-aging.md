# Business Requirements: Inventory Aging

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Aging |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

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
| Bucket | Age Range | Color | Priority |
|--------|-----------|-------|----------|
| 0-30 | 0-30 days | Green | 4 |
| 31-60 | 31-60 days | Blue | 3 |
| 61-90 | 61-90 days | Amber | 2 |
| 90+ | 90+ days | Red | 1 |

#### FR-AG-002: Age Calculation
```typescript
calculateAge(receivedDate: Date): number {
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - receivedDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

getAgeBucket(age: number): AgeBucket {
  if (age <= 30) return '0-30'
  if (age <= 60) return '31-60'
  if (age <= 90) return '61-90'
  return '90+'
}
```

### 2.2 Expiry Tracking

#### FR-AG-003: Expiry Status Classification
| Status | Condition | Color | Priority |
|--------|-----------|-------|----------|
| Good | > 30 days to expiry | Green | 5 |
| Expiring Soon | 15-30 days to expiry | Amber | 3 |
| Critical | < 15 days to expiry | Orange | 2 |
| Expired | Past expiry date | Red | 1 |
| No Expiry | No expiry date | Gray | 6 |

#### FR-AG-004: Expiry Calculation
```typescript
calculateExpiryStatus(expiryDate: Date | null): ExpiryStatus {
  if (!expiryDate) return 'no-expiry'

  const daysUntilExpiry = differenceInDays(expiryDate, new Date())

  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry < 15) return 'critical'
  if (daysUntilExpiry <= 30) return 'expiring-soon'
  return 'good'
}
```

### 2.3 Item Data Display

#### FR-AG-005: Item Attributes
| Field | Description |
|-------|-------------|
| Product Code | Unique identifier |
| Product Name | Display name |
| Category | Product category |
| Lot/Batch Number | Tracking identifier |
| Received Date | Date item was received |
| Age (Days) | Days since receipt |
| Age Bucket | Age classification |
| Expiry Date | Product expiration date |
| Days to Expiry | Days until expiration |
| Expiry Status | Expiry classification |
| Quantity | Stock quantity |
| Value | Inventory value |
| Location | Storage location |

### 2.4 Summary Statistics

#### FR-AG-006: Summary Cards
| Card | Calculation |
|------|-------------|
| Total Items | COUNT(items) |
| Total Value | SUM(item.value) |
| Average Age | AVG(item.age) |
| Near Expiry | COUNT(status IN ['expiring-soon', 'critical']) |
| Expired Items | COUNT(status = 'expired') |
| Value at Risk | SUM(value WHERE status IN ['expired', 'critical', 'expiring-soon']) |

### 2.5 Value at Risk Tracking

#### FR-AG-007: Value at Risk Categories
| Category | Condition | Priority |
|----------|-----------|----------|
| Expired Value | status = 'expired' | 1 |
| Critical Value | status = 'critical' | 2 |
| Expiring Soon Value | status = 'expiring-soon' | 3 |
| Total at Risk | Sum of above | - |

### 2.6 Analytics Features

#### FR-AG-008: Age Distribution Chart
| Type | Area Chart |
|------|------------|
| Data | Count by age bucket over time |
| Stacking | Yes |
| Colors | Green, Blue, Amber, Red |

#### FR-AG-009: Expiry Status Chart
| Type | Pie Chart |
|------|-----------|
| Data | Count by expiry status |
| Colors | Green, Amber, Orange, Red, Gray |

#### FR-AG-010: Category Analysis Chart
| Type | Bar Chart |
|------|-----------|
| Data | Average age by category |
| Sorting | By age descending |

### 2.7 Grouping Options

#### FR-AG-011: Group By Options
| Option | Description |
|--------|-------------|
| Location | Group items by storage location |
| Age Bucket | Group items by age range |

### 2.8 Action Center

#### FR-AG-012: Action Queue
| Feature | Description |
|---------|-------------|
| Expiring Items | Items needing immediate action |
| Priority Sorting | By expiry status, then days to expiry |
| FIFO Recommendations | Use oldest stock first |
| Disposal Tracking | Mark items for disposal |

### 2.9 Filtering Capabilities

#### FR-AG-013: Filter Options
| Filter | Type | Values |
|--------|------|--------|
| Search | Text | Name or code |
| Category | Dropdown | Dynamic from data |
| Age Bucket | Dropdown | 0-30, 31-60, 61-90, 90+ |
| Expiry Status | Dropdown | Good, Expiring Soon, Critical, Expired, No Expiry |
| Location | Dropdown | User's available locations |

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
- Audit logging for disposals

### 3.3 Usability
- Responsive design
- Clear expiry indicators
- FIFO compliance guidance

---

## 4. Data Requirements

### 4.1 Aging Item Structure
```typescript
interface AgingItem {
  id: string
  code: string
  name: string
  category: string
  unit: string
  lotNumber: string
  receivedDate: string
  age: number
  ageBucket: '0-30' | '31-60' | '61-90' | '90+'
  expiryDate: string | null
  daysToExpiry: number | null
  expiryStatus: 'good' | 'expiring-soon' | 'critical' | 'expired' | 'no-expiry'
  quantity: number
  value: number
  location: {
    id: string
    name: string
  }
}
```

### 4.2 Value at Risk Structure
```typescript
interface ValueAtRisk {
  expired: number
  critical: number
  expiringSoon: number
  total: number
}
```

---

## 5. Business Rules

### BR-001: Age Bucket Assignment
Items are classified by days since receipt:
- 0-30 days = Fresh (Green)
- 31-60 days = Normal (Blue)
- 61-90 days = Aging (Amber)
- 90+ days = Old (Red)

### BR-002: Expiry Status Assignment
Items are classified by days until expiration:
- > 30 days = Good
- 15-30 days = Expiring Soon
- < 15 days = Critical
- < 0 days = Expired
- No date = No Expiry

### BR-003: Value at Risk Calculation
Value at risk includes: Expired + Critical + Expiring Soon values.

### BR-004: FIFO Compliance
Oldest items (by received date) should be used/issued first.

### BR-005: Location Access Control
Users can only view items in their assigned locations.

### BR-006: Disposal Tracking
All expired item disposals must be recorded with reason and approver.

---

## 6. Acceptance Criteria

### AC-001: Age Tracking
- [ ] Age calculated correctly from received date
- [ ] Age bucket assigned correctly
- [ ] Colors match age bucket

### AC-002: Expiry Tracking
- [ ] Expiry status calculated correctly
- [ ] Days to expiry displayed
- [ ] Badges show correct colors

### AC-003: Value at Risk
- [ ] Expired value calculated correctly
- [ ] Critical value calculated correctly
- [ ] Total at risk sums correctly

### AC-004: Analytics
- [ ] Age distribution chart renders
- [ ] Expiry status pie chart accurate
- [ ] Category analysis correct

### AC-005: Grouping
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

---

## 8. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Missing expiry dates | High | Medium | Data validation on receipt |
| Incorrect age calculation | Medium | Low | Validate calculation logic |
| Disposal not recorded | High | Medium | Require approval workflow |
| FIFO not followed | Medium | Medium | Alerts and training |
