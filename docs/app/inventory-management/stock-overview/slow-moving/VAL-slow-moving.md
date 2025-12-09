# Validation Rules: Slow Moving Inventory

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Slow Moving |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. Item Data Validation

### VAL-SM-001: Days Idle Calculation
| Rule | Description |
|------|-------------|
| Source | Last movement date |
| Calculation | Current date - Last movement date |
| Minimum | 30 days (threshold for slow-moving) |
| Format | Integer days |

---

### VAL-SM-002: Risk Level Assignment
| Days Idle | Risk Level | Validation |
|-----------|------------|------------|
| 30-60 | Low | Must be exactly in range |
| 61-90 | Medium | Must be exactly in range |
| 91-120 | High | Must be exactly in range |
| 120+ | Critical | Must be >= 120 |

**Validation Logic**:
```typescript
const isValidRiskLevel = (daysIdle: number, riskLevel: RiskLevel): boolean => {
  switch (riskLevel) {
    case 'low': return daysIdle >= 30 && daysIdle <= 60
    case 'medium': return daysIdle >= 61 && daysIdle <= 90
    case 'high': return daysIdle >= 91 && daysIdle <= 120
    case 'critical': return daysIdle >= 120
    default: return false
  }
}
```

---

### VAL-SM-003: Suggested Action Validation
| Action | Valid Conditions |
|--------|------------------|
| Transfer | Item exists in multiple locations |
| Promote | Category is promotable |
| Write Off | Risk = Critical AND value < threshold |
| Hold | Default fallback |

---

## 2. Filter Validation

### VAL-SM-004: Search Term
| Rule | Description |
|------|-------------|
| Min Length | No minimum |
| Max Length | 100 characters |
| Fields | Product name, code |
| Case | Case-insensitive |

---

### VAL-SM-005: Category Filter
| Rule | Description |
|------|-------------|
| Valid Values | Dynamic from items |
| Default | "all" |
| Invalid | Reset to "all" |

---

### VAL-SM-006: Risk Level Filter
| Rule | Description |
|------|-------------|
| Valid Values | all, low, medium, high, critical |
| Default | "all" |

---

### VAL-SM-007: Action Filter
| Rule | Description |
|------|-------------|
| Valid Values | all, transfer, promote, writeoff, hold |
| Default | "all" |

---

### VAL-SM-008: Location Filter
| Rule | Description |
|------|-------------|
| Valid Values | User's available locations |
| Default | "all" |
| Permission | Only user's locations shown |

---

## 3. Display Validation

### VAL-SM-009: Value Display
| Rule | Description |
|------|-------------|
| Format | USD with 2 decimal places |
| Minimum | $0.00 |
| Locale | en-US |

---

### VAL-SM-010: Days Idle Display
| Rule | Description |
|------|-------------|
| Format | Integer with "days" suffix |
| Minimum | 30 |
| Color | Based on risk level |

---

### VAL-SM-011: Risk Badge Display
| Risk Level | Badge Variant | Color |
|------------|---------------|-------|
| Low | outline | Green |
| Medium | secondary | Amber |
| High | warning | Orange |
| Critical | destructive | Red |

---

### VAL-SM-012: Action Badge Display
| Action | Icon | Color |
|--------|------|-------|
| Transfer | ArrowRight | Blue |
| Promote | Tag | Purple |
| Write Off | Trash2 | Red |
| Hold | Eye | Gray |

---

## 4. Statistics Validation

### VAL-SM-013: Summary Calculations
| Metric | Calculation | Validation |
|--------|-------------|------------|
| Total Items | COUNT(filtered) | >= 0 |
| Total Value | SUM(value) | >= 0 |
| Avg Days Idle | SUM(daysIdle)/COUNT | >= 30 |
| Critical Count | COUNT(risk=critical) | >= 0 |
| Transfer Count | COUNT(action=transfer) | >= 0 |
| Write Off Count | COUNT(action=writeoff) | >= 0 |

---

### VAL-SM-014: Chart Data Validation
| Chart | Data Requirements |
|-------|-------------------|
| Risk Distribution | All 4 risk levels represented |
| Category Breakdown | Non-empty categories only |
| Value at Risk | Sum equals total value |

---

## 5. Access Control Validation

### VAL-SM-015: Location Access
| Rule | Description |
|------|-------------|
| Check | user.availableLocations |
| System Admin | Access all locations |
| Empty Array | Show all (fallback) |
| Filter | Items with matching location.id |

---

### VAL-SM-016: Action Permissions
| Role | View | Filter | Execute Actions |
|------|------|--------|-----------------|
| Storekeeper | ✅ | ✅ | ❌ |
| Inventory Manager | ✅ | ✅ | ✅ |
| Financial Controller | ✅ | ✅ | ✅ |
| System Administrator | ✅ | ✅ | ✅ |

---

## 6. Action Execution Validation

### VAL-SM-017: Transfer Action
| Rule | Description |
|------|-------------|
| Precondition | Item exists in multiple locations |
| Destination | Must be different from source |
| Quantity | Must be <= current stock |
| Permission | User has transfer permission |

---

### VAL-SM-018: Write-Off Action
| Rule | Description |
|------|-------------|
| Precondition | User has write-off permission |
| Reason | Required field |
| Quantity | Defaults to full quantity |
| Confirmation | Required dialog |

---

### VAL-SM-019: Promotion Action
| Rule | Description |
|------|-------------|
| Precondition | Category is promotable |
| Discount | 0% - 100% |
| Duration | Start date < End date |

---

## 7. View Mode Validation

### VAL-SM-020: View Mode Selection
| Rule | Description |
|------|-------------|
| Valid Values | list, grouped |
| Default | list |
| Persistence | Session only |

---

### VAL-SM-021: Grouped View Subtotals
| Metric | Calculation |
|--------|-------------|
| Item Count | COUNT(items in group) |
| Total Value | SUM(item.value in group) |
| Avg Days Idle | AVG(item.daysIdle in group) |

---

## 8. Export Validation

### VAL-SM-022: Export Data
| Rule | Description |
|------|-------------|
| Minimum Records | 1 required |
| Empty State | Button disabled |
| Filename | slow-moving-YYYY-MM-DD |

**Required Columns**:
| Column | Source |
|--------|--------|
| Product Code | code |
| Product Name | name |
| Category | category |
| Current Stock | currentStock |
| Value | value |
| Days Idle | daysIdle |
| Risk Level | riskLevel |
| Suggested Action | suggestedAction |
| Location | location.name |
| Last Movement | lastMovementDate |

---

## 9. Performance Validation

### VAL-SM-023: Performance Thresholds
| Metric | Target | Warning | Error |
|--------|--------|---------|-------|
| Page Load | < 2s | 2-5s | > 5s |
| Filter Apply | < 500ms | 500ms-2s | > 2s |
| Chart Render | < 1s | 1-3s | > 3s |
| Action Execute | < 1s | 1-3s | > 3s |

---

## 10. Error Handling

### VAL-SM-024: Error States
| Scenario | Handling |
|----------|----------|
| No items | Display empty state message |
| Load failure | Show error with retry |
| Action failure | Toast with error message |
| Export failure | Toast notification |

---

## Validation Matrix

| Rule ID | Field/Feature | Type | Severity |
|---------|---------------|------|----------|
| VAL-SM-001 | Days Idle | Business | High |
| VAL-SM-002 | Risk Level | Business | Critical |
| VAL-SM-003 | Suggested Action | Business | High |
| VAL-SM-004 | Search Term | Input | Low |
| VAL-SM-005 | Category Filter | Input | Low |
| VAL-SM-006 | Risk Level Filter | Input | Low |
| VAL-SM-007 | Action Filter | Input | Low |
| VAL-SM-008 | Location Filter | Security | High |
| VAL-SM-009 | Value Display | Display | Medium |
| VAL-SM-010 | Days Idle Display | Display | Medium |
| VAL-SM-011 | Risk Badge | Display | Medium |
| VAL-SM-012 | Action Badge | Display | Low |
| VAL-SM-013 | Summary Stats | Business | High |
| VAL-SM-014 | Chart Data | Display | Medium |
| VAL-SM-015 | Location Access | Security | Critical |
| VAL-SM-016 | Action Permissions | Security | Critical |
| VAL-SM-017 | Transfer Action | Business | High |
| VAL-SM-018 | Write-Off Action | Business | High |
| VAL-SM-019 | Promotion Action | Business | Medium |
| VAL-SM-020 | View Mode | Input | Low |
| VAL-SM-021 | Grouped Subtotals | Business | High |
| VAL-SM-022 | Export Data | Feature | Medium |
| VAL-SM-023 | Performance | Performance | Medium |
| VAL-SM-024 | Error States | UX | Medium |
