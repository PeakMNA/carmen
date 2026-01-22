# Validation Rules: Inventory Aging

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
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated expiry thresholds (30/90 days); Fixed badge colors; Added alert validation; Added chart data validation; Added Action Center validation; Updated field names |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Age Calculation Validation

### VAL-AG-001: Age Calculation
| Rule | Description |
|------|-------------|
| Source | receiptDate |
| Calculation | Math.ceil((Date.now() - receiptDate.getTime()) / (1000 * 60 * 60 * 24)) |
| Minimum | 0 days |
| Format | Integer |

**Validation Logic**:
```typescript
const validateAge = (receiptDate: Date): boolean => {
  const received = new Date(receiptDate)
  const today = new Date()
  return received <= today
}
```

**Source Evidence**: `inventory-aging/page.tsx:60-62`

---

### VAL-AG-002: Age Bucket Assignment
| Age Range | Bucket | Validation |
|-----------|--------|------------|
| 0-30 | '0-30' | ageInDays >= 0 && ageInDays <= 30 |
| 31-60 | '31-60' | ageInDays >= 31 && ageInDays <= 60 |
| 61-90 | '61-90' | ageInDays >= 61 && ageInDays <= 90 |
| 91+ | '90+' | ageInDays > 90 |

**Validation Logic**:
```typescript
const getAgeBucket = (ageInDays: number): AgeBucket => {
  if (ageInDays <= 30) return '0-30'
  if (ageInDays <= 60) return '31-60'
  if (ageInDays <= 90) return '61-90'
  return '90+'
}
```

**Source Evidence**: `inventory-aging/page.tsx:281-296`

---

## 2. Expiry Calculation Validation

### VAL-AG-003: Expiry Date Validation
| Rule | Description |
|------|-------------|
| Format | Date object or ISO 8601 date string |
| Nullable | Yes (no-expiry items) |
| Calculation | Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) |

---

### VAL-AG-004: Expiry Status Assignment
| Days to Expiry | Status | Validation |
|----------------|--------|------------|
| >= 90 | good | daysToExpiry >= 90 |
| 30-89 | expiring-soon | daysToExpiry >= 30 && daysToExpiry < 90 |
| 0-29 | critical | daysToExpiry >= 0 && daysToExpiry < 30 |
| < 0 | expired | daysToExpiry < 0 |
| null | no-expiry | expiryDate is null/undefined |

**Validation Logic**:
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

---

## 3. Filter Validation

### VAL-AG-005: Search Term
| Rule | Description |
|------|-------------|
| Min Length | No minimum |
| Max Length | 100 characters |
| Fields | productName, productCode, lotNumber |
| Case | Case-insensitive |

**Source Evidence**: `inventory-aging/page.tsx:820-903`

---

### VAL-AG-006: Category Filter
| Rule | Description |
|------|-------------|
| Valid Values | Dynamic from items data |
| Default | "all" |
| Invalid | Reset to "all" |

---

### VAL-AG-007: Age Bucket Filter
| Rule | Description |
|------|-------------|
| Valid Values | all, 0-30, 31-60, 61-90, 90+ |
| Default | "all" |

---

### VAL-AG-008: Expiry Status Filter
| Rule | Description |
|------|-------------|
| Valid Values | all, good, expiring-soon, critical, expired, no-expiry |
| Default | "all" |

---

### VAL-AG-009: Location Filter
| Rule | Description |
|------|-------------|
| Valid Values | User's availableLocations |
| Default | "all" |
| Permission | Only user's locations shown |

---

## 4. Display Validation

### VAL-AG-010: Value Display
| Rule | Description |
|------|-------------|
| Format | Currency with 2 decimal places |
| Minimum | 0.00 |
| Locale | User's locale |

---

### VAL-AG-011: Age Display
| Rule | Description |
|------|-------------|
| Format | Integer with "days" suffix |
| Field | ageInDays |
| Minimum | 0 |
| Color | Based on age bucket |

---

### VAL-AG-012: Days to Expiry Display
| Rule | Description |
|------|-------------|
| Format | Integer (can be negative) |
| Field | daysToExpiry |
| Null | Display "N/A" |
| Negative | Display with "expired" indicator |

---

### VAL-AG-013: Age Bucket Badge
| Bucket | Badge Style | Color |
|--------|-------------|-------|
| 0-30 | outline | Green (#22c55e) |
| 31-60 | outline | Yellow (#eab308) |
| 61-90 | outline | Orange (#f97316) |
| 90+ | destructive | Red (#ef4444) |

**Source Evidence**: `inventory-aging/page.tsx:281-296`

---

### VAL-AG-014: Expiry Status Badge
| Status | Badge Style | Color |
|--------|-------------|-------|
| good | outline | Green (#22c55e) |
| expiring-soon | outline | Yellow (#eab308) |
| critical | destructive | Orange (#f97316) |
| expired | destructive | Red (#ef4444) |
| no-expiry | secondary | Gray (#94a3b8) |

**Source Evidence**: `inventory-aging/page.tsx:129-136`

---

## 5. Alert Validation

### VAL-AG-015: Alert Generation
| Alert Type | Trigger | Style |
|------------|---------|-------|
| Expired Items | expiredItems > 0 | destructive |
| Near Expiry Items | nearExpiryItems > 0 | warning |

**Source Evidence**: `inventory-aging/page.tsx:694-718`

---

### VAL-AG-016: Near Expiry Count
| Rule | Description |
|------|-------------|
| Calculation | COUNT(items WHERE expiryStatus IN ['expiring-soon', 'critical']) |
| Threshold | daysToExpiry < 90 |

---

## 6. Statistics Validation

### VAL-AG-017: Summary Calculations
| Metric | Calculation | Validation |
|--------|-------------|------------|
| Total Items | COUNT(filteredItems) | >= 0 |
| Total Value | SUM(item.value) | >= 0 |
| Avg Age | SUM(ageInDays)/COUNT | >= 0 |
| Near Expiry | COUNT(expiring-soon + critical) | >= 0 |
| Expired Items | COUNT(expired) | >= 0 |
| Value at Risk | SUM(expired + critical + expiring-soon values) | >= 0 |

**Source Evidence**: `inventory-aging/page.tsx:720-805`

---

### VAL-AG-018: Value at Risk Calculations
| Metric | Calculation | Validation |
|--------|-------------|------------|
| Expired Value | SUM(value WHERE expiryStatus = 'expired') | >= 0 |
| Critical Value | SUM(value WHERE expiryStatus = 'critical') | >= 0 |
| Expiring Soon Value | SUM(value WHERE expiryStatus = 'expiring-soon') | >= 0 |
| Total at Risk | expired + critical + expiringSoon | >= 0 |

**Source Evidence**: `inventory-aging/page.tsx:503-517`

---

### VAL-AG-019: Value at Risk Consistency
| Rule | Description |
|------|-------------|
| Total | Must equal sum of components |
| Percentage | Each component <= Total |

---

## 7. Chart Data Validation

### VAL-AG-020: Expiry Timeline Chart
| Rule | Description |
|------|-------------|
| Time Range | Next 12 weeks |
| Data Points | Items count and value per week |
| Filtering | Only items with expiryDate |

**Source Evidence**: `inventory-aging/page.tsx:1124-1156`

---

### VAL-AG-021: Age Bucket Distribution Chart
| Rule | Description |
|------|-------------|
| Data | Count by age bucket |
| Total | Must equal total filtered items |
| Colors | 0-30 (#22c55e), 31-60 (#eab308), 61-90 (#f97316), 90+ (#ef4444) |

**Source Evidence**: `inventory-aging/page.tsx:1159-1203`

---

### VAL-AG-022: Expiry Status Distribution Chart
| Rule | Description |
|------|-------------|
| Data | Count by expiry status |
| Total | Must equal total filtered items |
| Colors | Good (#22c55e), Expiring Soon (#eab308), Critical (#f97316), Expired (#ef4444), No Expiry (#94a3b8) |

**Source Evidence**: `inventory-aging/page.tsx:1205-1241`

---

### VAL-AG-023: Location Aging Performance Chart
| Rule | Description |
|------|-------------|
| Data | Average age, at-risk items, total value per location |
| Bars | Average age (orange), at-risk items (red) |
| Line | Total value (blue) |

**Source Evidence**: `inventory-aging/page.tsx:1244-1278`

---

### VAL-AG-024: Category Aging Analysis
| Rule | Description |
|------|-------------|
| Data | Items, avg age, total value, expired value per category |
| Sorting | By average age descending |
| Display | Progress bars for age distribution |

**Source Evidence**: `inventory-aging/page.tsx:1281-1323`

---

## 8. Grouping Validation

### VAL-AG-025: Group By Selection
| Rule | Description |
|------|-------------|
| Valid Values | location, ageBucket |
| Default | location |

**Source Evidence**: `inventory-aging/page.tsx:854-862`

---

### VAL-AG-026: Location Group Subtotals
| Metric | Calculation |
|--------|-------------|
| Item Count | COUNT(items in location) |
| Total Value | SUM(item.value in location) |
| Avg Age | AVG(item.ageInDays in location) |
| Expiring Count | COUNT(expiring in location) |

---

### VAL-AG-027: Age Bucket Group Order
| Rule | Description |
|------|-------------|
| Order | 90+ first, then 61-90, 31-60, 0-30 |
| Purpose | Oldest items shown first for FIFO |

---

## 9. Action Center Validation

### VAL-AG-028: Value at Risk Summary Panel
| Category | Condition | Badge |
|----------|-----------|-------|
| Already Expired | expiryStatus = 'expired' | Critical |
| Expiring <30 days | expiryStatus = 'critical' | Urgent |
| Expiring 30-90 days | expiryStatus = 'expiring-soon' | Monitor |

**Source Evidence**: `inventory-aging/page.tsx:1329-1367`

---

### VAL-AG-029: Critical Items List
| Rule | Description |
|------|-------------|
| Items | Expired and near-expiry (critical) items |
| Sorting | By expiryDate ascending |
| Limit | Top 10 items |
| Actions | Dispose (expired), Use/Transfer (critical) |

**Source Evidence**: `inventory-aging/page.tsx:1369-1440`

---

### VAL-AG-030: Oldest Items List
| Rule | Description |
|------|-------------|
| Items | All items sorted by age |
| Sorting | By ageInDays descending |
| Limit | Top 10 items |

**Source Evidence**: `inventory-aging/page.tsx:1442-1482`

---

### VAL-AG-031: Recommended Actions
| Recommendation | Trigger | Action |
|----------------|---------|--------|
| Dispose Expired | expiredItems > 0 | Create Disposal Record |
| Prioritize Usage | nearExpiryItems > 0 | View Menu Suggestions |
| Rebalance Stock | avgAge > 45 at any location | Plan Stock Transfers |

**Source Evidence**: `inventory-aging/page.tsx:1484-1538`

---

## 10. Access Control Validation

### VAL-AG-032: Location Access
| Rule | Description |
|------|-------------|
| Check | user.availableLocations |
| System Admin | Access all locations |
| Other Roles | Only assigned locations |
| Empty Array | Show all (fallback) |

---

### VAL-AG-033: Action Permissions
| Role | View | Filter | Dispose | Transfer |
|------|------|--------|---------|----------|
| Storekeeper | Yes | Yes | No | No |
| Quality Manager | Yes | Yes | Yes | Yes |
| Inventory Manager | Yes | Yes | Yes | Yes |
| Financial Controller | Yes | Yes | Yes | Yes |
| System Admin | Yes | Yes | Yes | Yes |

---

## 11. Action Validation

### VAL-AG-034: Disposal Action
| Rule | Description |
|------|-------------|
| Precondition | Item must be expired or approved |
| Reason | Required field |
| Quantity | Must be <= current stock |
| Approval | May require manager approval |

---

### VAL-AG-035: Transfer Action
| Rule | Description |
|------|-------------|
| Precondition | User has transfer permission |
| Destination | Must be different from source |
| Quantity | Must be <= current stock |
| Purpose | FIFO compliance |

---

## 12. Export Validation

### VAL-AG-036: Export Data
| Rule | Description |
|------|-------------|
| Minimum Records | 1 required |
| Empty State | Button disabled |
| Filename | inventory-aging-YYYY-MM-DD |

**Required Columns**:
| Column | Field |
|--------|-------|
| Product Code | productCode |
| Product Name | productName |
| Category | category |
| Lot Number | lotNumber |
| Location | locationName |
| Received Date | receiptDate |
| Age (Days) | ageInDays |
| Age Bucket | ageBucket |
| Expiry Date | expiryDate |
| Days to Expiry | daysToExpiry |
| Expiry Status | expiryStatus |
| Quantity | quantity |
| Unit | unit |
| Value | value |

---

## 13. Performance Validation

### VAL-AG-037: Performance Thresholds
| Metric | Target | Warning | Error |
|--------|--------|---------|-------|
| Page Load | < 2s | 2-5s | > 5s |
| Filter Apply | < 500ms | 500ms-2s | > 2s |
| Chart Render | < 1s | 1-3s | > 3s |
| Tab Switch | < 300ms | 300ms-1s | > 1s |
| Action Execute | < 1s | 1-3s | > 3s |

---

## 14. Error Handling

### VAL-AG-038: Error States
| Scenario | Handling |
|----------|----------|
| No items | Display empty state message |
| Load failure | Show error with retry |
| Action failure | Toast with error message |
| Export failure | Toast notification |
| Invalid date | Use current date as fallback |
| No expiry date | Display "N/A" or "No Expiry" |

---

## Validation Matrix

| Rule ID | Field/Feature | Type | Severity |
|---------|---------------|------|----------|
| VAL-AG-001 | Age Calculation | Business | High |
| VAL-AG-002 | Age Bucket | Business | High |
| VAL-AG-003 | Expiry Date | Business | High |
| VAL-AG-004 | Expiry Status | Business | Critical |
| VAL-AG-005 | Search Term | Input | Low |
| VAL-AG-006 | Category Filter | Input | Low |
| VAL-AG-007 | Age Bucket Filter | Input | Low |
| VAL-AG-008 | Expiry Status Filter | Input | Low |
| VAL-AG-009 | Location Filter | Security | High |
| VAL-AG-010 | Value Display | Display | Medium |
| VAL-AG-011 | Age Display | Display | Medium |
| VAL-AG-012 | Days to Expiry | Display | Medium |
| VAL-AG-013 | Age Bucket Badge | Display | Low |
| VAL-AG-014 | Expiry Status Badge | Display | Medium |
| VAL-AG-015 | Alert Generation | Business | High |
| VAL-AG-016 | Near Expiry Count | Business | High |
| VAL-AG-017 | Summary Stats | Business | High |
| VAL-AG-018 | Value at Risk | Business | Critical |
| VAL-AG-019 | VAR Consistency | Business | High |
| VAL-AG-020 | Expiry Timeline Chart | Display | Medium |
| VAL-AG-021 | Age Bucket Chart | Display | Medium |
| VAL-AG-022 | Expiry Status Chart | Display | Medium |
| VAL-AG-023 | Location Aging Chart | Display | Medium |
| VAL-AG-024 | Category Aging Table | Display | Medium |
| VAL-AG-025 | Group By | Input | Low |
| VAL-AG-026 | Location Subtotals | Business | High |
| VAL-AG-027 | Bucket Order | Business | Medium |
| VAL-AG-028 | VAR Summary Panel | Display | High |
| VAL-AG-029 | Critical Items List | Business | High |
| VAL-AG-030 | Oldest Items List | Business | Medium |
| VAL-AG-031 | Recommended Actions | Business | High |
| VAL-AG-032 | Location Access | Security | Critical |
| VAL-AG-033 | Action Permissions | Security | Critical |
| VAL-AG-034 | Disposal Action | Business | High |
| VAL-AG-035 | Transfer Action | Business | High |
| VAL-AG-036 | Export Data | Feature | Medium |
| VAL-AG-037 | Performance | Performance | Medium |
| VAL-AG-038 | Error States | UX | Medium |

---

## Related Documents

- [BR-inventory-aging.md](./BR-inventory-aging.md) - Business Requirements
- [TS-inventory-aging.md](./TS-inventory-aging.md) - Technical Specification
- [UC-inventory-aging.md](./UC-inventory-aging.md) - Use Cases
- [FD-inventory-aging.md](./FD-inventory-aging.md) - Flow Diagrams
