# Validation Rules: Inventory Balance

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Balance |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. Filter Validation

### VAL-BAL-001: As-of Date Validation
| Rule | Description |
|------|-------------|
| Required | Must have a valid date |
| Max Date | Cannot be in the future |
| Min Date | Within last 365 days |
| Format | ISO 8601 (YYYY-MM-DD) |
| Default | Current date |

**Error Messages**:
- "As-of date cannot be in the future"
- "As-of date cannot exceed 365 days in the past"
- "Invalid date format"

---

### VAL-BAL-002: Location Range Validation
| Rule | Description |
|------|-------------|
| Permission Check | User can only filter locations in `availableLocations` |
| System Admin | Can access all locations |
| From/To | From must be <= To alphabetically |
| Empty | Empty range shows all permitted locations |

**Business Logic**:
```typescript
if (user.role === 'System Administrator') {
  // Access all locations
} else {
  // Filter to user.availableLocations only
}
```

---

### VAL-BAL-003: Category Range Validation
| Rule | Description |
|------|-------------|
| From/To | From must be <= To alphabetically |
| Invalid Category | Silently ignored, valid data shown |
| Empty | Empty range shows all categories |

---

### VAL-BAL-004: Product Range Validation
| Rule | Description |
|------|-------------|
| From/To | From must be <= To alphabetically |
| Invalid Product | Silently ignored, valid data shown |
| Empty | Empty range shows all products |

---

## 2. Data Display Validation

### VAL-BAL-005: Quantity Display
| Rule | Description |
|------|-------------|
| Format | Number with thousand separators |
| Minimum | Must be >= 0 |
| Null Handling | Display as 0 |
| Unit | Display with unit suffix |

**Formatting Function**:
```typescript
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}
```

---

### VAL-BAL-006: Value Display
| Rule | Description |
|------|-------------|
| Format | USD with 2 decimal places |
| Locale | en-US formatting |
| Symbol | $ prefix |
| Negative | Should not occur (display $0.00) |

**Formatting Function**:
```typescript
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}
```

---

### VAL-BAL-007: Percentage Display
| Rule | Description |
|------|-------------|
| Format | 1 decimal place |
| Range | 0% to 100% |
| Symbol | % suffix |
| Sum | All percentages should sum to ~100% |

---

### VAL-BAL-008: Date Display
| Rule | Description |
|------|-------------|
| Format | MMM DD, YYYY (e.g., Jan 15, 2024) |
| Timezone | Server timezone |
| Empty | Display "N/A" |

---

## 3. Hierarchy Validation

### VAL-BAL-009: Location Totals
| Rule | Description |
|------|-------------|
| Calculation | Sum of all category totals |
| Consistency | Must match category rollup |
| Validation | Location total = Σ Category totals |

---

### VAL-BAL-010: Category Totals
| Rule | Description |
|------|-------------|
| Calculation | Sum of all product totals |
| Consistency | Must match product rollup |
| Validation | Category total = Σ Product totals |

---

### VAL-BAL-011: Product Totals
| Rule | Description |
|------|-------------|
| Calculation | Sum of all lot quantities (if lots enabled) |
| Value | Quantity × Average Cost |
| Consistency | Lot sum = Product quantity |

---

## 4. Low Stock Alert Validation

### VAL-BAL-012: Low Stock Threshold
| Rule | Description |
|------|-------------|
| Threshold | Quantity < 20 units |
| Display | Show top 5 low stock items |
| Alert | Show banner if count > 0 |
| Sorting | By quantity ascending |

---

## 5. Chart Data Validation

### VAL-BAL-013: Category Chart Data
| Rule | Description |
|------|-------------|
| Limit | Top 6 categories by value |
| Empty | Show "No data available" |
| Aggregation | Sum across all locations |

---

### VAL-BAL-014: Location Chart Data
| Rule | Description |
|------|-------------|
| Limit | All locations displayed |
| Empty | Show "No data available" |
| Sorting | By value descending |

---

### VAL-BAL-015: Trend Chart Data
| Rule | Description |
|------|-------------|
| Period | 6 months |
| Data Points | Monthly aggregation |
| Empty Month | Display as 0 |

---

## 6. Access Control Validation

### VAL-BAL-016: Page Access
| Role | Access Level |
|------|--------------|
| Storekeeper | View, Filter, Export (own locations) |
| Receiving Clerk | View, Filter, Export (own locations) |
| Department Manager | View, Filter, Export (own locations) |
| Inventory Manager | View, Filter, Export (own locations) |
| Financial Controller | View, Filter, Export (all locations) |
| System Administrator | View, Filter, Export (all locations) |

---

### VAL-BAL-017: Location Access
| Rule | Description |
|------|-------------|
| Check | `user.availableLocations` array |
| Empty Array | Show all locations (fallback) |
| Invalid Location | Auto-filter to permitted only |
| Admin Override | System Administrator bypasses all checks |

---

## 7. Export Validation

### VAL-BAL-018: Export Data
| Rule | Description |
|------|-------------|
| Minimum Records | At least 1 record required |
| Maximum Records | 10,000 records |
| Empty State | Export button disabled |
| Filename | `inventory-balance-YYYY-MM-DD.csv` |

**Required Columns**:
| Column | Source Field |
|--------|--------------|
| Location | location.name |
| Category | category.name |
| Product Code | product.code |
| Product Name | product.name |
| Unit | product.unit |
| Quantity | product.totals.quantity |
| Value | product.totals.value |
| Lot Number | lot.number (if enabled) |
| Expiry Date | lot.expiryDate (if enabled) |

---

## 8. View Type Validation

### VAL-BAL-019: View Type Selection
| Rule | Description |
|------|-------------|
| Valid Values | CATEGORY, PRODUCT, LOT |
| Default | PRODUCT |
| Invalid | Reset to PRODUCT |

---

### VAL-BAL-020: Show Lots Toggle
| Rule | Description |
|------|-------------|
| Type | Boolean |
| Default | false |
| Dependency | Only effective with PRODUCT or LOT view |

---

## 9. Performance Validation

### VAL-BAL-021: Performance Thresholds
| Metric | Target | Warning | Error |
|--------|--------|---------|-------|
| Page Load | < 2s | 2-5s | > 5s |
| Filter Apply | < 500ms | 500ms-2s | > 2s |
| Export | < 5s | 5-10s | > 10s |
| Chart Render | < 1s | 1-3s | > 3s |

---

## 10. Error Handling Validation

### VAL-BAL-022: Error States
| Scenario | Handling |
|----------|----------|
| Data Load Failure | Show error message, retry button |
| Filter Error | Show toast notification, maintain previous state |
| Export Failure | Show error toast, log error |
| No Permission | Redirect to dashboard |

---

## Validation Matrix

| Rule ID | Field/Feature | Type | Severity |
|---------|---------------|------|----------|
| VAL-BAL-001 | As-of Date | Input | High |
| VAL-BAL-002 | Location Range | Security | Critical |
| VAL-BAL-003 | Category Range | Input | Low |
| VAL-BAL-004 | Product Range | Input | Low |
| VAL-BAL-005 | Quantity Display | Display | Medium |
| VAL-BAL-006 | Value Display | Display | Medium |
| VAL-BAL-007 | Percentage Display | Display | Low |
| VAL-BAL-008 | Date Display | Display | Low |
| VAL-BAL-009 | Location Totals | Business | High |
| VAL-BAL-010 | Category Totals | Business | High |
| VAL-BAL-011 | Product Totals | Business | High |
| VAL-BAL-012 | Low Stock Threshold | Business | Medium |
| VAL-BAL-013 | Category Chart | Display | Low |
| VAL-BAL-014 | Location Chart | Display | Low |
| VAL-BAL-015 | Trend Chart | Display | Low |
| VAL-BAL-016 | Page Access | Security | Critical |
| VAL-BAL-017 | Location Access | Security | Critical |
| VAL-BAL-018 | Export Data | Feature | Medium |
| VAL-BAL-019 | View Type | Input | Low |
| VAL-BAL-020 | Show Lots | Input | Low |
| VAL-BAL-021 | Performance | Performance | Medium |
| VAL-BAL-022 | Error States | UX | Medium |
