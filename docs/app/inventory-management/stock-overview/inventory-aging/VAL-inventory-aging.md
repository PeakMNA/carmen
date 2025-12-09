# Validation Rules: Inventory Aging

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Aging |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. Age Calculation Validation

### VAL-AG-001: Age Calculation
| Rule | Description |
|------|-------------|
| Source | Received date |
| Calculation | (Today - Received Date) in days |
| Minimum | 0 days |
| Format | Integer |

**Validation Logic**:
```typescript
const validateAge = (receivedDate: string): boolean => {
  const received = new Date(receivedDate)
  const today = new Date()
  return received <= today
}
```

---

### VAL-AG-002: Age Bucket Assignment
| Age Range | Bucket | Validation |
|-----------|--------|------------|
| 0-30 | 0-30 | Must be exactly in range |
| 31-60 | 31-60 | Must be exactly in range |
| 61-90 | 61-90 | Must be exactly in range |
| 91+ | 90+ | Must be >= 91 |

---

## 2. Expiry Calculation Validation

### VAL-AG-003: Expiry Date Validation
| Rule | Description |
|------|-------------|
| Format | ISO 8601 date string |
| Nullable | Yes (no-expiry items) |
| Future | Should typically be future for non-expired |

---

### VAL-AG-004: Expiry Status Assignment
| Days to Expiry | Status | Validation |
|----------------|--------|------------|
| > 30 | Good | Must be > 30 |
| 15-30 | Expiring Soon | Must be in range |
| 0-14 | Critical | Must be in range |
| < 0 | Expired | Must be negative |
| null | No Expiry | Must be null date |

**Validation Logic**:
```typescript
const isValidExpiryStatus = (daysToExpiry: number | null, status: ExpiryStatus): boolean => {
  if (daysToExpiry === null) return status === 'no-expiry'
  if (daysToExpiry < 0) return status === 'expired'
  if (daysToExpiry < 15) return status === 'critical'
  if (daysToExpiry <= 30) return status === 'expiring-soon'
  return status === 'good'
}
```

---

## 3. Filter Validation

### VAL-AG-005: Search Term
| Rule | Description |
|------|-------------|
| Min Length | No minimum |
| Max Length | 100 characters |
| Fields | Product name, code |
| Case | Case-insensitive |

---

### VAL-AG-006: Category Filter
| Rule | Description |
|------|-------------|
| Valid Values | Dynamic from items |
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
| Valid Values | User's available locations |
| Default | "all" |
| Permission | Only user's locations shown |

---

## 4. Display Validation

### VAL-AG-010: Value Display
| Rule | Description |
|------|-------------|
| Format | USD with 2 decimal places |
| Minimum | $0.00 |
| Locale | en-US |

---

### VAL-AG-011: Age Display
| Rule | Description |
|------|-------------|
| Format | Integer with "days" suffix |
| Minimum | 0 |
| Color | Based on age bucket |

---

### VAL-AG-012: Days to Expiry Display
| Rule | Description |
|------|-------------|
| Format | Integer (can be negative) |
| Null | Display "N/A" |
| Negative | Display with "expired" indicator |

---

### VAL-AG-013: Age Bucket Badge
| Bucket | Badge Style | Color |
|--------|-------------|-------|
| 0-30 | outline | Green |
| 31-60 | secondary | Blue |
| 61-90 | warning | Amber |
| 90+ | destructive | Red |

---

### VAL-AG-014: Expiry Status Badge
| Status | Badge Style | Color |
|--------|-------------|-------|
| Good | success | Green |
| Expiring Soon | warning | Amber |
| Critical | warning | Orange |
| Expired | destructive | Red |
| No Expiry | secondary | Gray |

---

## 5. Statistics Validation

### VAL-AG-015: Summary Calculations
| Metric | Calculation | Validation |
|--------|-------------|------------|
| Total Items | COUNT(filtered) | >= 0 |
| Total Value | SUM(value) | >= 0 |
| Avg Age | SUM(age)/COUNT | >= 0 |
| Near Expiry | COUNT(expiring-soon + critical) | >= 0 |
| Expired Items | COUNT(expired) | >= 0 |

---

### VAL-AG-016: Value at Risk Calculations
| Metric | Calculation | Validation |
|--------|-------------|------------|
| Expired Value | SUM(value WHERE expired) | >= 0 |
| Critical Value | SUM(value WHERE critical) | >= 0 |
| Expiring Soon Value | SUM(value WHERE expiring-soon) | >= 0 |
| Total at Risk | Sum of above | >= 0 |

---

### VAL-AG-017: Value at Risk Consistency
| Rule | Description |
|------|-------------|
| Total | Must equal sum of components |
| Percentage | Each component <= Total |

---

## 6. Grouping Validation

### VAL-AG-018: Group By Selection
| Rule | Description |
|------|-------------|
| Valid Values | location, ageBucket |
| Default | location |

---

### VAL-AG-019: Location Group Subtotals
| Metric | Calculation |
|--------|-------------|
| Item Count | COUNT(items in location) |
| Total Value | SUM(item.value in location) |
| Avg Age | AVG(item.age in location) |
| Expiring Count | COUNT(expiring in location) |

---

### VAL-AG-020: Age Bucket Group Order
| Rule | Description |
|------|-------------|
| Order | 90+ first, then 61-90, 31-60, 0-30 |
| Purpose | Oldest items shown first for FIFO |

---

## 7. Access Control Validation

### VAL-AG-021: Location Access
| Rule | Description |
|------|-------------|
| Check | user.availableLocations |
| System Admin | Access all locations |
| Quality Manager | Access all locations |
| Others | Only assigned locations |
| Empty Array | Show all (fallback) |

---

### VAL-AG-022: Action Permissions
| Role | View | Filter | Dispose | Transfer |
|------|------|--------|---------|----------|
| Storekeeper | ✅ | ✅ | ❌ | ❌ |
| Quality Manager | ✅ | ✅ | ✅ | ✅ |
| Inventory Manager | ✅ | ✅ | ✅ | ✅ |
| Financial Controller | ✅ | ✅ | ✅ | ✅ |
| System Admin | ✅ | ✅ | ✅ | ✅ |

---

## 8. Action Validation

### VAL-AG-023: Disposal Action
| Rule | Description |
|------|-------------|
| Precondition | Item must be expired or approved |
| Reason | Required field |
| Quantity | Must be <= current stock |
| Approval | May require manager approval |

---

### VAL-AG-024: Transfer Action
| Rule | Description |
|------|-------------|
| Precondition | User has transfer permission |
| Destination | Must be different from source |
| Quantity | Must be <= current stock |
| Purpose | FIFO compliance |

---

## 9. Export Validation

### VAL-AG-025: Export Data
| Rule | Description |
|------|-------------|
| Minimum Records | 1 required |
| Empty State | Button disabled |
| Filename | inventory-aging-YYYY-MM-DD |

**Required Columns**:
| Column | Source |
|--------|--------|
| Product Code | code |
| Product Name | name |
| Category | category |
| Lot Number | lotNumber |
| Received Date | receivedDate |
| Age (Days) | age |
| Age Bucket | ageBucket |
| Expiry Date | expiryDate |
| Days to Expiry | daysToExpiry |
| Expiry Status | expiryStatus |
| Quantity | quantity |
| Value | value |
| Location | location.name |

---

## 10. Performance Validation

### VAL-AG-026: Performance Thresholds
| Metric | Target | Warning | Error |
|--------|--------|---------|-------|
| Page Load | < 2s | 2-5s | > 5s |
| Filter Apply | < 500ms | 500ms-2s | > 2s |
| Chart Render | < 1s | 1-3s | > 3s |
| Action Execute | < 1s | 1-3s | > 3s |

---

## 11. Error Handling

### VAL-AG-027: Error States
| Scenario | Handling |
|----------|----------|
| No items | Display empty state message |
| Load failure | Show error with retry |
| Action failure | Toast with error message |
| Export failure | Toast notification |
| Invalid date | Use current date as fallback |

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
| VAL-AG-015 | Summary Stats | Business | High |
| VAL-AG-016 | Value at Risk | Business | Critical |
| VAL-AG-017 | VAR Consistency | Business | High |
| VAL-AG-018 | Group By | Input | Low |
| VAL-AG-019 | Location Subtotals | Business | High |
| VAL-AG-020 | Bucket Order | Business | Medium |
| VAL-AG-021 | Location Access | Security | Critical |
| VAL-AG-022 | Action Permissions | Security | Critical |
| VAL-AG-023 | Disposal Action | Business | High |
| VAL-AG-024 | Transfer Action | Business | High |
| VAL-AG-025 | Export Data | Feature | Medium |
| VAL-AG-026 | Performance | Performance | Medium |
| VAL-AG-027 | Error States | UX | Medium |
