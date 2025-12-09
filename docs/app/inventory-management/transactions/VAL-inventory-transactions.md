# Validation Rules: Inventory Transactions

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Transactions |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. Filter Validation

### VAL-TXN-001: Date Range Validation
| Rule | Description |
|------|-------------|
| Required | At least one date must be provided for custom range |
| From Date | Must be valid date, not in future |
| To Date | Must be valid date, >= From Date |
| Max Range | Maximum 365 days selection |
| Default | Last 30 days if not specified |

**Error Messages**:
- "From date cannot be in the future"
- "To date must be after From date"
- "Date range cannot exceed 365 days"

---

### VAL-TXN-002: Location Filter Validation
| Rule | Description |
|------|-------------|
| Permission Check | User can only filter locations in their `availableLocations` |
| System Admin | Can access all locations |
| Empty Selection | Defaults to user's available locations |
| Invalid Location | Silently filtered out, permitted locations used |

**Business Logic**:
```typescript
if (user.role === 'System Administrator') {
  // Access all locations
} else {
  // Filter to user.availableLocations only
}
```

---

### VAL-TXN-003: Transaction Type Filter
| Rule | Description |
|------|-------------|
| Valid Values | IN, OUT, ADJUSTMENT |
| Multiple Selection | Allowed |
| Empty Selection | Shows all transaction types |

---

### VAL-TXN-004: Reference Type Filter
| Rule | Description |
|------|-------------|
| Valid Values | GRN, SO, ADJ, TRF, PO, WO, SR, PC, WR |
| Multiple Selection | Allowed |
| Empty Selection | Shows all reference types |

---

### VAL-TXN-005: Search Term Validation
| Rule | Description |
|------|-------------|
| Min Length | No minimum (empty allowed) |
| Max Length | 100 characters |
| Search Fields | Product name, code, reference, location, category, user |
| Case Sensitivity | Case-insensitive search |
| Special Characters | Allowed, escaped for matching |

---

## 2. Data Display Validation

### VAL-TXN-006: Quantity Display
| Rule | Description |
|------|-------------|
| Qty In | Display only for IN transactions, >= 0 |
| Qty Out | Display only for OUT transactions, >= 0 |
| Net Quantity | Calculated as quantityIn - quantityOut |
| Color Coding | Green for positive, Red for negative |
| Format | Number with thousand separators |

---

### VAL-TXN-007: Currency Display
| Rule | Description |
|------|-------------|
| Format | USD with 2 decimal places |
| Locale | en-US formatting |
| Symbol | $ prefix |
| Negative Values | Red color with minus sign |
| Zero Values | Display as $0.00 |

**Formatting Function**:
```typescript
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})
```

---

### VAL-TXN-008: Date/Time Display
| Rule | Description |
|------|-------------|
| Date Format | YYYY-MM-DD |
| Time Format | HH:MM (24-hour) |
| Timezone | Server timezone |
| Display | Date bold, time muted |

---

### VAL-TXN-009: Balance Validation
| Rule | Description |
|------|-------------|
| Balance Before | Must be >= 0 |
| Balance After | Must be >= 0 (negative indicates data error) |
| Calculation | balanceAfter = balanceBefore + netQuantity |
| Display | "Before → After" format |

---

## 3. Pagination Validation

### VAL-TXN-010: Page Size
| Rule | Description |
|------|-------------|
| Valid Values | 10, 25, 50 |
| Default | 10 |
| Invalid Value | Reset to default 10 |

---

### VAL-TXN-011: Page Number
| Rule | Description |
|------|-------------|
| Minimum | 1 |
| Maximum | ceil(totalRecords / pageSize) |
| Out of Range | Reset to page 1 |
| Filter Change | Reset to page 1 |

---

## 4. Sorting Validation

### VAL-TXN-012: Sort Field
| Rule | Description |
|------|-------------|
| Valid Fields | date, reference, productName, locationName, quantityIn, quantityOut, totalValue |
| Default Field | date |
| Invalid Field | Use default |

---

### VAL-TXN-013: Sort Direction
| Rule | Description |
|------|-------------|
| Valid Values | asc, desc |
| Default | desc (newest first) |
| Toggle Behavior | Same column click toggles direction |

---

## 5. Export Validation

### VAL-TXN-014: CSV Export
| Rule | Description |
|------|-------------|
| Minimum Records | At least 1 record required |
| Maximum Records | No limit (all filtered records) |
| Empty State | Export button disabled |
| Filename | `inventory-transactions-YYYY-MM-DD.csv` |

**Required Columns**:
| Column | Source Field |
|--------|--------------|
| Date | date |
| Time | time |
| Reference | reference |
| Reference Type | referenceType |
| Product Code | productCode |
| Product Name | productName |
| Category | categoryName |
| Location | locationName |
| Transaction Type | transactionType |
| Qty In | quantityIn |
| Qty Out | quantityOut |
| Unit Cost | unitCost |
| Total Value | totalValue |
| Balance Before | balanceBefore |
| Balance After | balanceAfter |
| User | createdByName |

---

## 6. Analytics Validation

### VAL-TXN-015: Chart Data
| Rule | Description |
|------|-------------|
| Empty Data | Show "No data available" message |
| Trend Chart | Requires minimum 2 data points |
| Pie Chart | Requires at least 1 segment |
| Bar Charts | Limit to top 8 categories |

---

### VAL-TXN-016: Analytics Calculations
| Rule | Description |
|------|-------------|
| Trend Aggregation | Group by date |
| Type Distribution | Count by transactionType |
| Location Activity | Sum in/out counts by location |
| Reference Distribution | Count by referenceType |
| Category Values | Sum totalValue by category |

---

## 7. Access Control Validation

### VAL-TXN-017: Page Access
| Role | Access Level |
|------|-------------|
| Storekeeper | View, Filter, Export (own locations) |
| Receiving Clerk | View, Filter, Export (own locations) |
| Department Manager | View, Filter, Export (own locations) |
| Inventory Manager | View, Filter, Export (own locations) |
| Financial Controller | View, Filter, Export (all locations) |
| System Administrator | View, Filter, Export (all locations) |

---

### VAL-TXN-018: Location Access
| Rule | Description |
|------|-------------|
| Check | user.availableLocations array |
| Empty Array | Show all locations (fallback) |
| Invalid Location | Auto-filter to permitted only |
| Admin Override | System Administrator bypasses all checks |

---

## 8. Summary Card Validation

### VAL-TXN-019: Summary Calculations
| Metric | Calculation | Validation |
|--------|-------------|------------|
| Total Transactions | COUNT(records) | >= 0 |
| Total In Value | SUM(totalValue) WHERE type = IN | >= 0 |
| Total Out Value | SUM(totalValue) WHERE type = OUT | >= 0 |
| Net Change | Total In - Total Out | Can be negative |

---

## 9. Error Handling

### VAL-TXN-020: Error States
| Scenario | Handling |
|----------|----------|
| Data Load Failure | Show error message, retry button |
| Filter Error | Show toast notification, maintain previous state |
| Export Failure | Show error toast, log error |
| No Permission | Redirect to dashboard or show access denied |

---

## 10. Performance Validation

### VAL-TXN-021: Performance Thresholds
| Metric | Target | Warning | Error |
|--------|--------|---------|-------|
| Page Load | < 2s | 2-5s | > 5s |
| Filter Apply | < 500ms | 500ms-2s | > 2s |
| Export (1000 records) | < 5s | 5-10s | > 10s |
| Chart Render | < 1s | 1-3s | > 3s |

---

## Validation Matrix

| Rule ID | Field/Feature | Type | Severity |
|---------|---------------|------|----------|
| VAL-TXN-001 | Date Range | Input | High |
| VAL-TXN-002 | Location Filter | Security | Critical |
| VAL-TXN-003 | Transaction Type | Input | Low |
| VAL-TXN-004 | Reference Type | Input | Low |
| VAL-TXN-005 | Search Term | Input | Low |
| VAL-TXN-006 | Quantity Display | Display | Medium |
| VAL-TXN-007 | Currency Display | Display | Medium |
| VAL-TXN-008 | Date/Time Display | Display | Low |
| VAL-TXN-009 | Balance | Business | High |
| VAL-TXN-010 | Page Size | Input | Low |
| VAL-TXN-011 | Page Number | Input | Low |
| VAL-TXN-012 | Sort Field | Input | Low |
| VAL-TXN-013 | Sort Direction | Input | Low |
| VAL-TXN-014 | CSV Export | Feature | Medium |
| VAL-TXN-015 | Chart Data | Display | Low |
| VAL-TXN-016 | Analytics Calculations | Business | Medium |
| VAL-TXN-017 | Page Access | Security | Critical |
| VAL-TXN-018 | Location Access | Security | Critical |
| VAL-TXN-019 | Summary Calculations | Business | High |
| VAL-TXN-020 | Error States | UX | Medium |
| VAL-TXN-021 | Performance | Performance | Medium |
