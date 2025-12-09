# Validation Rules: Stock Cards

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Stock Cards |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. Filter Validation

### VAL-SC-001: Search Term Validation
| Rule | Description |
|------|-------------|
| Min Length | No minimum (empty allowed) |
| Max Length | 100 characters |
| Search Fields | Product name, product code |
| Case Sensitivity | Case-insensitive |
| Special Characters | Allowed |

---

### VAL-SC-002: Category Filter
| Rule | Description |
|------|-------------|
| Valid Values | Dynamic from products |
| Default | "all" |
| Invalid | Reset to "all" |

---

### VAL-SC-003: Status Filter
| Rule | Description |
|------|-------------|
| Valid Values | all, Active, Inactive |
| Default | "all" |

---

### VAL-SC-004: Stock Level Filter
| Rule | Description |
|------|-------------|
| Valid Values | all, low, normal, high |
| Default | "all" |

**Stock Level Definitions**:
- Low: `currentStock <= minimumStock`
- Normal: `minimumStock < currentStock < maximumStock`
- High: `currentStock >= maximumStock`

---

### VAL-SC-005: Location Filter
| Rule | Description |
|------|-------------|
| Valid Values | Dynamic from user locations |
| Default | "all" |
| Permission Check | Only user's available locations |

---

## 2. Data Display Validation

### VAL-SC-006: Product Code Display
| Rule | Description |
|------|-------------|
| Format | String as-is |
| Max Length | 20 characters |
| Empty | Display "N/A" |

---

### VAL-SC-007: Quantity Display
| Rule | Description |
|------|-------------|
| Format | Number with thousand separators |
| Minimum | 0 |
| Unit | Display with unit suffix |

**Formatting**:
```typescript
formatNumber(product.currentStock) + " " + product.unit
```

---

### VAL-SC-008: Value Display
| Rule | Description |
|------|-------------|
| Format | USD with 2 decimal places |
| Minimum | $0.00 |
| Locale | en-US |

---

### VAL-SC-009: Date Display
| Rule | Description |
|------|-------------|
| Format | YYYY-MM-DD |
| Empty | Display "N/A" |

---

### VAL-SC-010: Status Badge
| Status | Style |
|--------|-------|
| Active | Green outline badge |
| Inactive | Gray secondary badge |

---

### VAL-SC-011: Stock Level Badge
| Level | Style | Condition |
|-------|-------|-----------|
| Low | Red destructive | current ≤ minimum |
| Normal | Green outline | minimum < current < maximum |
| High | Amber background | current ≥ maximum |

---

## 3. View Mode Validation

### VAL-SC-012: View Mode Selection
| Rule | Description |
|------|-------------|
| Valid Values | list, cards, grouped |
| Default | list |
| Persistence | Session only |

---

## 4. Sort Validation

### VAL-SC-013: Sort Field
| Rule | Description |
|------|-------------|
| Valid Fields | code, name, category, stock, value |
| Default | name |
| Invalid | Reset to name |

---

### VAL-SC-014: Sort Direction
| Rule | Description |
|------|-------------|
| Valid Values | asc, desc |
| Default | asc |
| Toggle | Same field click toggles |

---

## 5. Grouped View Validation

### VAL-SC-015: Group Structure
| Rule | Description |
|------|-------------|
| Grouping Key | locationId |
| Sorting | By location name ascending |
| Empty Group | Not displayed |

---

### VAL-SC-016: Subtotals Calculation
| Metric | Calculation |
|--------|-------------|
| totalItems | COUNT(items) |
| currentStock | SUM(item.currentStock) |
| value | SUM(item.value) |
| averageValue | value / totalItems |

---

### VAL-SC-017: Grand Totals Calculation
| Metric | Calculation |
|--------|-------------|
| totalItems | SUM(group.totalItems) |
| currentStock | SUM(group.currentStock) |
| value | SUM(group.value) |

---

## 6. Summary Statistics Validation

### VAL-SC-018: Statistics Calculations
| Metric | Calculation | Validation |
|--------|-------------|------------|
| totalProducts | COUNT(filtered) | >= 0 |
| activeProducts | COUNT(status=Active) | >= 0 |
| totalValue | SUM(value) | >= 0 |
| totalStock | SUM(currentStock) | >= 0 |
| lowStockProducts | COUNT(current<=min) | >= 0 |
| highStockProducts | COUNT(current>=max) | >= 0 |
| normalStockProducts | COUNT(min<current<max) | >= 0 |
| avgValue | totalValue/totalProducts | >= 0 |

---

## 7. Access Control Validation

### VAL-SC-019: Location Access
| Rule | Description |
|------|-------------|
| Check | user.availableLocations |
| System Admin | Access all locations |
| Empty Array | Show all (fallback) |
| Filter | Products with matching locations |

---

### VAL-SC-020: Page Access
| Role | Access Level |
|------|--------------|
| Storekeeper | View, Filter, Export (own locations) |
| Receiving Clerk | View, Filter, Export (own locations) |
| Department Manager | View, Filter, Export (own locations) |
| Inventory Manager | View, Filter, Export (own locations) |
| Financial Controller | View, Filter, Export (all locations) |
| System Administrator | View, Filter, Export (all locations) |

---

## 8. Export Validation

### VAL-SC-021: Export Data
| Rule | Description |
|------|-------------|
| Minimum Records | 1 required |
| Empty State | Button disabled |
| Filename | stock-cards-YYYY-MM-DD |

**Required Columns**:
| Column | Source |
|--------|--------|
| Product Code | code |
| Product Name | name |
| Category | category |
| Unit | unit |
| Status | status |
| Current Stock | currentStock |
| Value | value |
| Average Cost | averageCost |
| Min Stock | minimumStock |
| Max Stock | maximumStock |
| Last Movement | lastMovementDate |
| Location Count | locationCount |

---

## 9. Cards View Validation

### VAL-SC-022: Progress Bar Calculation
| Rule | Description |
|------|-------------|
| Formula | (currentStock / maximumStock) × 100 |
| Maximum | Cap at 100% |
| Color | Based on stock level |

---

### VAL-SC-023: Card Border Color
| Stock Level | Border |
|-------------|--------|
| Low | border-red-200 |
| High | border-amber-200 |
| Normal | Default border |

---

## 10. Performance Validation

### VAL-SC-024: Performance Thresholds
| Metric | Target | Warning | Error |
|--------|--------|---------|-------|
| Page Load | < 2s | 2-5s | > 5s |
| Filter Apply | < 500ms | 500ms-2s | > 2s |
| View Switch | < 300ms | 300ms-1s | > 1s |
| Export (1000) | < 5s | 5-10s | > 10s |

---

## 11. Error Handling Validation

### VAL-SC-025: Error States
| Scenario | Handling |
|----------|----------|
| No products | Display empty state message |
| Load failure | Show error with retry |
| Export failure | Toast notification |
| Navigation error | Fallback to list |

---

## Validation Matrix

| Rule ID | Field/Feature | Type | Severity |
|---------|---------------|------|----------|
| VAL-SC-001 | Search Term | Input | Low |
| VAL-SC-002 | Category Filter | Input | Low |
| VAL-SC-003 | Status Filter | Input | Low |
| VAL-SC-004 | Stock Level Filter | Input | Low |
| VAL-SC-005 | Location Filter | Security | High |
| VAL-SC-006 | Product Code | Display | Low |
| VAL-SC-007 | Quantity | Display | Medium |
| VAL-SC-008 | Value | Display | Medium |
| VAL-SC-009 | Date | Display | Low |
| VAL-SC-010 | Status Badge | Display | Low |
| VAL-SC-011 | Stock Level Badge | Display | Medium |
| VAL-SC-012 | View Mode | Input | Low |
| VAL-SC-013 | Sort Field | Input | Low |
| VAL-SC-014 | Sort Direction | Input | Low |
| VAL-SC-015 | Group Structure | Business | Medium |
| VAL-SC-016 | Subtotals | Business | High |
| VAL-SC-017 | Grand Totals | Business | High |
| VAL-SC-018 | Statistics | Business | High |
| VAL-SC-019 | Location Access | Security | Critical |
| VAL-SC-020 | Page Access | Security | Critical |
| VAL-SC-021 | Export Data | Feature | Medium |
| VAL-SC-022 | Progress Bar | Display | Low |
| VAL-SC-023 | Card Border | Display | Low |
| VAL-SC-024 | Performance | Performance | Medium |
| VAL-SC-025 | Error States | UX | Medium |
