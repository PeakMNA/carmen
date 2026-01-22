# Validation Rules: Stock Cards

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Stock Cards |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated to single product detail page; Added analytics validation; Added alert validation; Corrected transaction types to IN/OUT only |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Page Load Validation

### VAL-SC-001: Product ID Validation
| Rule | Description |
|------|-------------|
| Required | productId must be provided in URL query parameter |
| Format | Non-empty string |
| Existence | Product must exist in system |
| Invalid Handling | Display error state with "Product not found" message |

**Error Messages**:
- "Product not found"
- "Invalid product ID"

**Source Evidence**: `stock-card/page.tsx:271-290`

---

### VAL-SC-002: Loading State Validation
| Rule | Description |
|------|-------------|
| Initial State | isLoading = true |
| Data Load | Set false after data received |
| Error State | Set false on error |
| Skeleton Display | Show skeleton while loading |

**Source Evidence**: `stock-card/page.tsx:231-269`

---

## 2. Stock Status Validation

### VAL-SC-003: Stock Status Calculation
| Status | Condition | Badge | Color |
|--------|-----------|-------|-------|
| Low | currentStock ≤ minimumStock | "Low Stock" | Red (destructive) |
| High | currentStock ≥ maximumStock | "Overstocked" | Amber |
| Normal | minimumStock < currentStock < maximumStock | N/A | Green |

**Validation Logic**:
```typescript
const stockStatus = summary.currentStock <= (product.minimumStock || 0)
  ? 'low'
  : summary.currentStock >= (product.maximumStock || Infinity)
    ? 'high'
    : 'normal'
```

**Source Evidence**: `stock-card/page.tsx:213-215`

---

### VAL-SC-004: Stock Percentage Calculation
| Rule | Description |
|------|-------------|
| Formula | (currentStock / maximumStock) × 100 |
| Default | 50% if maximumStock not set |
| Display | Progress bar width |

**Validation Logic**:
```typescript
const stockPercentage = product.maximumStock
  ? (summary.currentStock / product.maximumStock) * 100
  : 50
```

**Source Evidence**: `stock-card/page.tsx:217-219`

---

## 3. Days of Supply Validation

### VAL-SC-005: Days of Supply Calculation
| Rule | Description |
|------|-------------|
| Formula | currentStock / avgDailyUsage |
| Usage Calculation | Sum of OUT transactions / 30 days |
| Zero Usage | Return 999 days |
| Max Display | Cap at 365+ |

**Validation Logic**:
```typescript
const avgDailyUsage = movements
  .filter(m => m.transactionType === 'OUT')
  .reduce((sum, m) => sum + Math.abs(m.quantityChange), 0) / 30

const daysOfSupply = avgDailyUsage > 0
  ? Math.round(summary.currentStock / avgDailyUsage)
  : 999
```

**Source Evidence**: `stock-card/page.tsx:159-162`

---

### VAL-SC-006: Days of Supply Color Coding
| Days | Color | Indicator |
|------|-------|-----------|
| < 7 | Red | Critical |
| 7-13 | Amber | Warning |
| ≥ 14 | Green | Normal |

**Source Evidence**: `stock-card/page.tsx:454-475`

---

## 4. Alert Validation

### VAL-SC-007: Low Stock Alert
| Rule | Description |
|------|-------------|
| Condition | currentStock ≤ minimumStock |
| Type | Critical |
| Title | "Low Stock Alert" |
| Description | "Current stock is below minimum level" |

**Source Evidence**: `stock-card/page.tsx:171-180`

---

### VAL-SC-008: Reorder Point Alert
| Rule | Description |
|------|-------------|
| Condition | currentStock ≤ reorderPoint AND currentStock > minimumStock |
| Type | Warning |
| Title | "Reorder Point Reached" |
| Description | "Consider placing a purchase order" |

**Source Evidence**: `stock-card/page.tsx:181-191`

---

### VAL-SC-009: Expiring Lots Alert
| Rule | Description |
|------|-------------|
| Condition | Lots expiring within 30 days |
| Calculation | expiryDate - today ≤ 30 AND > 0 |
| Type | Warning |
| Title | "Lots Expiring Soon" |
| Description | "{count} lot(s) will expire within 30 days" |

**Source Evidence**: `stock-card/page.tsx:192-201`

---

### VAL-SC-010: Expired Lots Alert
| Rule | Description |
|------|-------------|
| Condition | Lots with status = 'Expired' |
| Type | Critical |
| Title | "Expired Lots" |
| Description | "{count} lot(s) have expired" |

**Source Evidence**: `stock-card/page.tsx:203-211`

---

## 5. Movement History Validation

### VAL-SC-011: Transaction Type Validation
| Rule | Description |
|------|-------------|
| Valid Values | 'IN', 'OUT' only |
| Invalid | Silently ignored |
| Filter Default | Show all types |

**Note**: ADJUSTMENT type is NOT supported. Adjustments are represented as IN (positive) or OUT (negative) transactions.

**Source Evidence**: `stock-card/types.ts:58-77`

---

### VAL-SC-012: Movement Record Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | string | Yes | Non-empty |
| date | string | Yes | Valid date format |
| time | string | Yes | Valid time format |
| reference | string | Yes | Non-empty |
| referenceType | string | Yes | Non-empty |
| locationId | string | Yes | Non-empty |
| locationName | string | Yes | Non-empty |
| transactionType | enum | Yes | 'IN' or 'OUT' |
| reason | string | Yes | Non-empty |
| lotNumber | string | No | Optional |
| quantityBefore | number | Yes | ≥ 0 |
| quantityAfter | number | Yes | ≥ 0 |
| quantityChange | number | Yes | Any (positive for IN, negative for OUT) |
| unitCost | number | Yes | ≥ 0 |
| valueBefore | number | Yes | ≥ 0 |
| valueAfter | number | Yes | ≥ 0 |
| valueChange | number | Yes | Any |
| username | string | Yes | Non-empty |

**Source Evidence**: `stock-card/types.ts:58-77`

---

## 6. Lot Information Validation

### VAL-SC-013: Lot Status Values
| Status | Description | Badge Color |
|--------|-------------|-------------|
| Available | Lot can be issued | Green |
| Reserved | Lot allocated to orders | Blue |
| Expired | Past expiry date | Red |
| Quarantine | Under quality hold | Amber |

**Source Evidence**: `stock-card/types.ts:46-56`

---

### VAL-SC-014: Lot Information Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| lotNumber | string | Yes | Non-empty |
| expiryDate | string | Yes | Valid date format |
| receivedDate | string | Yes | Valid date format |
| quantity | number | Yes | ≥ 0 |
| unitCost | number | Yes | ≥ 0 |
| value | number | Yes | ≥ 0 |
| locationId | string | Yes | Non-empty |
| locationName | string | Yes | Non-empty |
| status | enum | Yes | Available, Reserved, Expired, Quarantine |

**Source Evidence**: `stock-card/types.ts:46-56`

---

## 7. Product Validation

### VAL-SC-015: Product Interface Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | string | Yes | Non-empty |
| name | string | Yes | Non-empty |
| code | string | Yes | Non-empty |
| category | string | Yes | Non-empty |
| unit | string | Yes | Non-empty |
| status | enum | Yes | 'Active' or 'Inactive' |
| description | string | Yes | Can be empty |
| lastUpdated | string | Yes | Valid date format |
| createdAt | string | Yes | Valid date format |
| createdBy | string | Yes | Non-empty |
| barcode | string | No | Optional |
| alternateUnit | string | No | Optional |
| conversionFactor | number | No | > 0 if provided |
| minimumStock | number | No | ≥ 0 if provided |
| maximumStock | number | No | ≥ minimumStock if provided |
| reorderPoint | number | No | ≥ 0 if provided |
| reorderQuantity | number | No | > 0 if provided |
| leadTime | number | No | ≥ 0 if provided |
| shelfLife | number | No | > 0 if provided |
| storageRequirements | string | No | Optional |
| tags | string[] | No | Array of strings |

**Source Evidence**: `stock-card/types.ts:1-23`

---

## 8. Stock Summary Validation

### VAL-SC-016: Stock Summary Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| currentStock | number | Yes | ≥ 0 |
| currentValue | number | Yes | ≥ 0 |
| averageCost | number | Yes | ≥ 0 |
| lastMovementDate | string | Yes | Valid date format |
| lastMovementType | string | Yes | 'IN' or 'OUT' |
| locationCount | number | Yes | ≥ 0 |
| primaryLocation | string | Yes | Non-empty |
| totalIn | number | Yes | ≥ 0 |
| totalOut | number | Yes | ≥ 0 |
| netChange | number | Yes | Any (totalIn - totalOut) |

**Source Evidence**: `stock-card/types.ts:25-36`

---

## 9. Analytics Validation

### VAL-SC-017: Movement Trend Data
| Rule | Description |
|------|-------------|
| Period | Last 30 days |
| Data Points | One per day |
| Fields | date, in, out, net |
| Calculation | Sum quantities by transaction type per day |

**Source Evidence**: `stock-card/page.tsx:111-132`

---

### VAL-SC-018: Location Distribution Data
| Field | Type | Validation |
|-------|------|------------|
| name | string | Location name |
| quantity | number | ≥ 0 |
| value | number | ≥ 0 |
| percentage | number | 0-100 |

**Calculation**: percentage = (quantity / totalQuantity) × 100

**Source Evidence**: `stock-card/page.tsx:135-140`

---

### VAL-SC-019: Lot Status Distribution Data
| Status | Color |
|--------|-------|
| Available | #22c55e (Green) |
| Reserved | #3b82f6 (Blue) |
| Expired | #ef4444 (Red) |
| Quarantine | #f59e0b (Amber) |

**Filter**: Only include statuses with count > 0

**Source Evidence**: `stock-card/page.tsx:143-156`

---

### VAL-SC-020: Movement by Type Data
| Type | Calculation |
|------|-------------|
| Receipts (IN) | Count and sum of IN transactions |
| Issues (OUT) | Count and sum (absolute) of OUT transactions |

**Source Evidence**: `stock-card/page.tsx:165-168`

---

## 10. Valuation Validation

### VAL-SC-021: Valuation Record Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| date | string | Yes | Valid date format |
| reference | string | Yes | Non-empty |
| transactionType | enum | Yes | 'IN' or 'OUT' |
| quantity | number | Yes | ≥ 0 |
| unitCost | number | Yes | ≥ 0 |
| value | number | Yes | ≥ 0 |
| runningQuantity | number | Yes | ≥ 0 |
| runningValue | number | Yes | ≥ 0 |
| runningAverageCost | number | Yes | ≥ 0 |

**Source Evidence**: `stock-card/types.ts:79-89`

---

## 11. Display Validation

### VAL-SC-022: Number Formatting
| Rule | Description |
|------|-------------|
| Format | Number with thousand separators |
| Decimals | 0-2 decimal places |
| Null Handling | Display as 0 |

**Formatting**:
```typescript
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
```

---

### VAL-SC-023: Currency Formatting
| Rule | Description |
|------|-------------|
| Format | USD with 2 decimal places |
| Locale | en-US |
| Symbol | $ prefix |

**Formatting**:
```typescript
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
```

---

### VAL-SC-024: Date Formatting
| Rule | Description |
|------|-------------|
| Format | MMM DD, YYYY (e.g., Jan 15, 2024) |
| Empty | Display "N/A" |

---

## 12. Tab Validation

### VAL-SC-025: Tab Selection
| Rule | Description |
|------|-------------|
| Default Tab | "general" (General Information) |
| Valid Tabs | general, movement, lots, valuation, analytics, actions |
| Invalid Tab | Fall back to default |

**Source Evidence**: `stock-card/page.tsx:534-542`

---

## 13. Quick Actions Validation

### VAL-SC-026: Quick Action Buttons
| Action | Enabled | Navigation |
|--------|---------|------------|
| Create Purchase Request | Always | Purchase Request form |
| Request Transfer | Always | Transfer Request form |
| Adjust Stock | Always | Stock Adjustment form |

**Source Evidence**: `stock-card/page.tsx:692-722`

---

## 14. Error State Validation

### VAL-SC-027: Error Handling
| Scenario | Handling |
|----------|----------|
| Product not found | Display error state with back button |
| Data load failure | Show error message |
| Invalid data | Show "N/A" or default values |

**Source Evidence**: `stock-card/page.tsx:271-290`

---

## 15. Performance Validation

### VAL-SC-028: Performance Thresholds
| Metric | Target | Warning | Error |
|--------|--------|---------|-------|
| Page Load | < 2s | 2-5s | > 5s |
| Tab Switch | < 300ms | 300ms-1s | > 1s |
| Chart Render | < 1s | 1-3s | > 3s |
| Data Refresh | < 2s | 2-5s | > 5s |

---

## Validation Matrix

| Rule ID | Field/Feature | Type | Severity |
|---------|---------------|------|----------|
| VAL-SC-001 | Product ID | Input | Critical |
| VAL-SC-002 | Loading State | State | Medium |
| VAL-SC-003 | Stock Status | Business | High |
| VAL-SC-004 | Stock Percentage | Business | Medium |
| VAL-SC-005 | Days of Supply | Business | High |
| VAL-SC-006 | Days Color | Display | Low |
| VAL-SC-007 | Low Stock Alert | Business | Critical |
| VAL-SC-008 | Reorder Point Alert | Business | High |
| VAL-SC-009 | Expiring Lots Alert | Business | High |
| VAL-SC-010 | Expired Lots Alert | Business | Critical |
| VAL-SC-011 | Transaction Type | Business | High |
| VAL-SC-012 | Movement Record | Data | High |
| VAL-SC-013 | Lot Status | Business | Medium |
| VAL-SC-014 | Lot Information | Data | Medium |
| VAL-SC-015 | Product Fields | Data | High |
| VAL-SC-016 | Stock Summary | Data | High |
| VAL-SC-017 | Movement Trend | Analytics | Medium |
| VAL-SC-018 | Location Distribution | Analytics | Medium |
| VAL-SC-019 | Lot Status Distribution | Analytics | Medium |
| VAL-SC-020 | Movement by Type | Analytics | Low |
| VAL-SC-021 | Valuation Record | Data | High |
| VAL-SC-022 | Number Formatting | Display | Low |
| VAL-SC-023 | Currency Formatting | Display | Low |
| VAL-SC-024 | Date Formatting | Display | Low |
| VAL-SC-025 | Tab Selection | Input | Low |
| VAL-SC-026 | Quick Actions | Feature | Medium |
| VAL-SC-027 | Error Handling | UX | Medium |
| VAL-SC-028 | Performance | Performance | Medium |

---

## Related Documents

- [BR-stock-cards.md](./BR-stock-cards.md) - Business Requirements
- [TS-stock-cards.md](./TS-stock-cards.md) - Technical Specification
- [UC-stock-cards.md](./UC-stock-cards.md) - Use Cases
- [FD-stock-cards.md](./FD-stock-cards.md) - Flow Diagrams
