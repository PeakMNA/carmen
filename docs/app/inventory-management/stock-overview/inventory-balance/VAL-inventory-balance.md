# Validation Rules: Inventory Balance

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Balance |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Added inventory status validation; Updated transaction types to IN/OUT only; Updated type definitions from types.ts; Added movement history validations |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Filter Validation

### VAL-BAL-001: As-of Date Validation
| Rule | Description |
|------|-------------|
| Required | Must have a valid date |
| Max Date | Cannot be in the future |
| Min Date | Within last 365 days |
| Format | YYYY-MM-DD (ISO 8601) |
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
| Decimal Places | 0-2 decimal places |

**Formatting Function**:
```typescript
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
```

**Source Evidence**: `utils.ts:1-10`

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
    currency: 'USD',
  }).format(value)
}
```

**Source Evidence**: `utils.ts:12-20`

---

### VAL-BAL-007: Percentage Display
| Rule | Description |
|------|-------------|
| Format | 1 decimal place |
| Range | 0% to 100% |
| Symbol | % suffix |

**Formatting Function**:
```typescript
const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}
```

**Source Evidence**: `utils.ts:22-32`

---

### VAL-BAL-008: Date Display
| Rule | Description |
|------|-------------|
| Format | MMM DD, YYYY (e.g., Jan 15, 2024) |
| Timezone | Server timezone |
| Empty | Display "N/A" |

**Source Evidence**: `utils.ts:34-45`

---

## 3. Inventory Status Validation

### VAL-BAL-009: Inventory Status Calculation
| Status | Condition | Badge | Color |
|--------|-----------|-------|-------|
| Low | quantity ≤ thresholds.minimum | "Low" | Red (destructive) |
| High | quantity ≥ thresholds.maximum | "High" | Amber (bg-amber-100) |
| Normal | minimum < quantity < maximum | "Normal" | Green (bg-green-100) |

**Validation Logic**:
```typescript
const getInventoryStatus = (product: ProductBalance): 'low' | 'high' | 'normal' => {
  const quantity = product.totals.quantity
  const minimum = product.thresholds.minimum
  const maximum = product.thresholds.maximum

  if (quantity <= minimum) return 'low'
  if (quantity >= maximum) return 'high'
  return 'normal'
}
```

**Source Evidence**: `components/BalanceTable.tsx:112-121`

---

## 4. Hierarchy Validation

### VAL-BAL-010: Location Totals
| Rule | Description |
|------|-------------|
| Calculation | Sum of all category totals |
| Consistency | Must match category rollup |
| Validation | Location total = Σ Category totals |

---

### VAL-BAL-011: Category Totals
| Rule | Description |
|------|-------------|
| Calculation | Sum of all product totals |
| Consistency | Must match product rollup |
| Validation | Category total = Σ Product totals |

---

### VAL-BAL-012: Product Totals
| Rule | Description |
|------|-------------|
| Calculation | Sum of all lot quantities (if lots enabled) |
| Value | Quantity × Average Cost |
| Consistency | Lot sum = Product quantity |

---

## 5. Movement History Validation

### VAL-BAL-013: Transaction Type Validation
| Rule | Description |
|------|-------------|
| Valid Values | 'IN', 'OUT' only |
| Filter Default | 'ALL' (shows both types) |
| Invalid | Silently ignored |

**Note**: ADJUSTMENT type is NOT supported. Adjustments are represented as IN (positive) or OUT (negative) transactions.

**Source Evidence**: `components/MovementHistory.tsx:112-121`

---

### VAL-BAL-014: Reference Type Validation
| Reference | Valid | Badge Color |
|-----------|-------|-------------|
| GRN | Yes | Blue |
| SO | Yes | Purple |
| ADJ | Yes | Amber |
| TRF | Yes | Indigo |
| PO | Yes | Cyan |
| WO | Yes | Rose |
| SR | Yes | Emerald |
| Unknown | Yes | Gray (fallback) |

**Source Evidence**: `components/MovementHistory.tsx:124-136`

---

### VAL-BAL-015: Movement Date Range Validation
| Rule | Description |
|------|-------------|
| From Date | Must be valid date |
| To Date | Must be valid date if provided |
| Consistency | To Date >= From Date |
| Default | No date filter applied |

---

### VAL-BAL-016: Movement Search Validation
| Rule | Description |
|------|-------------|
| Fields Searched | productName, productCode, reference, locationName, reason |
| Case Sensitivity | Case-insensitive |
| Empty | Shows all records |

**Source Evidence**: `components/MovementHistory.tsx:90-98`

---

### VAL-BAL-017: Pagination Validation
| Rule | Description |
|------|-------------|
| Items Per Page | 10 (constant) |
| Min Page | 1 |
| Max Page | Calculated from total records |
| Boundary | Cannot exceed min/max |

**Source Evidence**: `components/MovementHistory.tsx:56, 105-109`

---

## 6. Access Control Validation

### VAL-BAL-018: Page Access
| Role | Access Level |
|------|--------------|
| Storekeeper | View, Filter, Export (own locations) |
| Receiving Clerk | View, Filter, Export (own locations) |
| Department Manager | View, Filter, Export (own locations) |
| Inventory Manager | View, Filter, Export (own locations) |
| Financial Controller | View, Filter, Export (all locations) |
| System Administrator | View, Filter, Export (all locations) |

---

### VAL-BAL-019: Location Access
| Rule | Description |
|------|-------------|
| Check | `user.availableLocations` array |
| Empty Array | Show all locations (fallback) |
| Invalid Location | Auto-filter to permitted only |
| Admin Override | System Administrator bypasses all checks |

---

## 7. Export Validation

### VAL-BAL-020: Export Data
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
| Average Cost | product.totals.averageCost |
| Value | product.totals.value |
| Status | calculated from thresholds |
| Lot Number | lot.lotNumber (if enabled) |
| Expiry Date | lot.expiryDate (if enabled) |

---

## 8. Type Validation

### VAL-BAL-021: ProductBalance Type
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | string | Yes | Non-empty |
| code | string | Yes | Non-empty |
| name | string | Yes | Non-empty |
| unit | string | Yes | Non-empty |
| tracking.batch | boolean | Yes | Boolean |
| thresholds.minimum | number | Yes | >= 0 |
| thresholds.maximum | number | Yes | >= minimum |
| totals.quantity | number | Yes | >= 0 |
| totals.averageCost | number | Yes | >= 0 |
| totals.value | number | Yes | >= 0 |
| lots | LotBalance[] | Yes | Array (can be empty) |

**Source Evidence**: `types.ts:22-42`

---

### VAL-BAL-022: LotBalance Type
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| lotNumber | string | Yes | Non-empty |
| expiryDate | string | No | Valid date format if provided |
| quantity | number | Yes | >= 0 |
| unitCost | number | Yes | >= 0 |
| value | number | Yes | >= 0 |

**Source Evidence**: `types.ts:1-8`

---

### VAL-BAL-023: BalanceReportParams Type
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| asOfDate | string | Yes | YYYY-MM-DD format |
| locationRange.from | string | No | Valid location code |
| locationRange.to | string | No | Valid location code |
| categoryRange.from | string | No | Valid category code |
| categoryRange.to | string | No | Valid category code |
| productRange.from | string | No | Valid product code |
| productRange.to | string | No | Valid product code |
| viewType | enum | Yes | 'CATEGORY' \| 'PRODUCT' \| 'LOT' |
| showLots | boolean | Yes | Boolean |

**Source Evidence**: `types.ts:62-74`

---

## 9. Performance Validation

### VAL-BAL-024: Performance Thresholds
| Metric | Target | Warning | Error |
|--------|--------|---------|-------|
| Page Load | < 2s | 2-5s | > 5s |
| Filter Apply | < 500ms | 500ms-2s | > 2s |
| Export | < 5s | 5-10s | > 10s |
| Tab Switch | < 300ms | 300ms-1s | > 1s |

---

## 10. Error Handling Validation

### VAL-BAL-025: Error States
| Scenario | Handling |
|----------|----------|
| Data Load Failure | Show error message, retry button |
| Filter Error | Show toast notification, maintain previous state |
| Export Failure | Show error toast, log error |
| No Permission | Redirect to dashboard |
| Empty Data | Show "No data available" message |

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
| VAL-BAL-009 | Inventory Status | Business | High |
| VAL-BAL-010 | Location Totals | Business | High |
| VAL-BAL-011 | Category Totals | Business | High |
| VAL-BAL-012 | Product Totals | Business | High |
| VAL-BAL-013 | Transaction Type | Business | Medium |
| VAL-BAL-014 | Reference Type | Display | Low |
| VAL-BAL-015 | Movement Date Range | Input | Medium |
| VAL-BAL-016 | Movement Search | Input | Low |
| VAL-BAL-017 | Pagination | Input | Low |
| VAL-BAL-018 | Page Access | Security | Critical |
| VAL-BAL-019 | Location Access | Security | Critical |
| VAL-BAL-020 | Export Data | Feature | Medium |
| VAL-BAL-021 | ProductBalance Type | Data | High |
| VAL-BAL-022 | LotBalance Type | Data | Medium |
| VAL-BAL-023 | BalanceReportParams Type | Data | High |
| VAL-BAL-024 | Performance | Performance | Medium |
| VAL-BAL-025 | Error States | UX | Medium |

---

## Related Documents

- [BR-inventory-balance.md](./BR-inventory-balance.md) - Business Requirements
- [TS-inventory-balance.md](./TS-inventory-balance.md) - Technical Specification
- [UC-inventory-balance.md](./UC-inventory-balance.md) - Use Cases
- [FD-inventory-balance.md](./FD-inventory-balance.md) - Flow Diagrams
