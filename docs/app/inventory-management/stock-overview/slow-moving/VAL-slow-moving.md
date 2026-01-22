# Validation Rules: Slow Moving Inventory

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Slow Moving |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated field names (daysSinceMovement); Added alert validation; Added aging distribution validation; Added quick actions validation; Updated summary stats validation |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Item Data Validation

### VAL-SM-001: Days Since Movement Calculation
| Rule | Description |
|------|-------------|
| Source | lastMovementDate field |
| Calculation | Current date - Last movement date |
| Minimum | 30 days (threshold for slow-moving) |
| Format | Integer days |

**Source Evidence**: `lib/mock-data/location-inventory.ts:189-206`

---

### VAL-SM-002: Risk Level Assignment
| Days Since Movement | Risk Level | Badge Style |
|---------------------|------------|-------------|
| 30-60 | Low | outline with green background |
| 61-90 | Medium | outline with yellow background |
| 91-120 | High | outline with orange background |
| 120+ | Critical | destructive |

**Validation Logic**:
```typescript
const getRiskLevel = (daysSinceMovement: number): RiskLevel => {
  if (daysSinceMovement >= 120) return 'critical'
  if (daysSinceMovement >= 91) return 'high'
  if (daysSinceMovement >= 61) return 'medium'
  return 'low'
}
```

**Source Evidence**: `slow-moving/page.tsx:294-310`

---

### VAL-SM-003: Suggested Action Values
| Action | Badge Style | Description |
|--------|-------------|-------------|
| transfer | outline blue | Move to higher-demand location |
| promote | outline purple | Run promotional pricing |
| writeoff | destructive | Remove from inventory |
| hold | secondary | Continue monitoring |

**Source Evidence**: `slow-moving/page.tsx:313-329`

---

### VAL-SM-004: SlowMovingItem Interface Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | string | Yes | Non-empty |
| productId | string | Yes | Non-empty |
| productCode | string | Yes | Non-empty |
| productName | string | Yes | Non-empty |
| category | string | Yes | Non-empty |
| unit | string | Yes | Non-empty |
| locationId | string | Yes | Non-empty |
| locationName | string | Yes | Non-empty |
| lastMovementDate | Date | Yes | Valid date |
| daysSinceMovement | number | Yes | >= 30 |
| currentStock | number | Yes | >= 0 |
| value | number | Yes | >= 0 |
| averageCost | number | Yes | >= 0 |
| turnoverRate | number | Yes | >= 0 |
| suggestedAction | enum | Yes | transfer, promote, writeoff, hold |
| riskLevel | enum | Yes | low, medium, high, critical |

**Source Evidence**: `lib/mock-data/location-inventory.ts:189-206`

---

## 2. Alert Validation

### VAL-SM-005: Critical Risk Alert
| Rule | Description |
|------|-------------|
| Condition | summaryStats.criticalItems > 0 |
| Type | critical |
| Title | "Critical Risk Items" |
| Description | "{count} items have been idle for over 120 days" |
| Icon | AlertCircle |

**Source Evidence**: `slow-moving/page.tsx:419-428`

---

### VAL-SM-006: Write-Off Warning Alert
| Rule | Description |
|------|-------------|
| Condition | summaryStats.writeoffItems > 0 |
| Type | warning |
| Title | "Items for Write-Off" |
| Description | "{count} items are recommended for write-off" |
| Icon | AlertTriangle |

**Source Evidence**: `slow-moving/page.tsx:430-437`

---

### VAL-SM-007: 180+ Days Warning Alert
| Rule | Description |
|------|-------------|
| Condition | Items with daysSinceMovement > 180 |
| Type | warning |
| Title | "Items Inactive 180+ Days" |
| Description | "{count} items have had no movement for over 180 days" |
| Icon | AlertTriangle |

**Source Evidence**: `slow-moving/page.tsx:439-444`

---

## 3. Filter Validation

### VAL-SM-008: Search Term
| Rule | Description |
|------|-------------|
| Fields | productName, productCode |
| Case | Case-insensitive |
| Match Type | Substring match (includes) |

**Source Evidence**: `slow-moving/page.tsx:447-455`

---

### VAL-SM-009: Category Filter
| Rule | Description |
|------|-------------|
| Valid Values | Dynamic from data |
| Default | "all" |
| Invalid | Reset to "all" |

---

### VAL-SM-010: Risk Level Filter
| Rule | Description |
|------|-------------|
| Valid Values | all, low, medium, high, critical |
| Default | "all" |

---

### VAL-SM-011: Action Filter
| Rule | Description |
|------|-------------|
| Valid Values | all, transfer, promote, writeoff, hold |
| Default | "all" |

---

### VAL-SM-012: Location Filter
| Rule | Description |
|------|-------------|
| Valid Values | User's available locations |
| Default | "all" |
| Permission | Only user's locations shown |

**Source Evidence**: `slow-moving/page.tsx:696-768`

---

## 4. Summary Statistics Validation

### VAL-SM-013: Summary Statistics Fields
| Metric | Calculation | Validation |
|--------|-------------|------------|
| totalItems | COUNT(filtered) | >= 0 |
| totalValue | SUM(value) | >= 0 |
| avgDaysSinceMovement | AVG(daysSinceMovement) | >= 30 |
| criticalItems | COUNT(riskLevel='critical') | >= 0 |
| highRiskItems | COUNT(riskLevel='high') | >= 0 |
| mediumRiskItems | COUNT(riskLevel='medium') | >= 0 |
| lowRiskItems | COUNT(riskLevel='low') | >= 0 |
| transferItems | COUNT(suggestedAction='transfer') | >= 0 |
| promoteItems | COUNT(suggestedAction='promote') | >= 0 |
| writeoffItems | COUNT(suggestedAction='writeoff') | >= 0 |
| holdItems | COUNT(suggestedAction='hold') | >= 0 |
| criticalValue | SUM(value WHERE riskLevel='critical') | >= 0 |

**Source Evidence**: `slow-moving/page.tsx:332-362`

---

## 5. Chart Data Validation

### VAL-SM-014: Risk Distribution Data
| Field | Type | Validation |
|-------|------|------------|
| name | string | Critical, High, Medium, Low |
| value | number | >= 0 |
| color | string | #ef4444, #f97316, #eab308, #22c55e |

**Filter**: Only include items with value > 0

**Source Evidence**: `slow-moving/page.tsx:365-371`

---

### VAL-SM-015: Action Distribution Data
| Field | Type | Validation |
|-------|------|------------|
| name | string | Transfer, Promote, Write Off, Hold |
| value | number | >= 0 |
| color | string | #3b82f6, #8b5cf6, #ef4444, #6b7280 |

**Filter**: Only include items with value > 0

**Source Evidence**: `slow-moving/page.tsx:373-380`

---

### VAL-SM-016: Aging Distribution Data
| Field | Type | Validation |
|-------|------|------------|
| range | string | 30-60, 60-90, 90-120, 120-180, 180+ |
| items | number | >= 0 |
| value | number | >= 0 |

**Buckets**:
- 30-60: min=30, max=60
- 60-90: min=61, max=90
- 90-120: min=91, max=120
- 120-180: min=121, max=180
- 180+: min=181, max=Infinity

**Source Evidence**: `slow-moving/page.tsx:404-416`

---

### VAL-SM-017: Category Breakdown Data
| Field | Type | Validation |
|-------|------|------------|
| category | string | Non-empty |
| items | number | >= 0 |
| value | number | >= 0 |
| avgDays | number | >= 30 |

**Sorting**: By value descending
**Limit**: Top 10 categories

**Source Evidence**: `slow-moving/page.tsx:383-391`

---

### VAL-SM-018: Location Breakdown Data
| Field | Type | Validation |
|-------|------|------------|
| location | string | Non-empty |
| items | number | >= 0 |
| value | number | >= 0 |
| criticalCount | number | >= 0 |

**Sorting**: By value descending

**Source Evidence**: `slow-moving/page.tsx:394-402`

---

## 6. Display Validation

### VAL-SM-019: Value Display
| Rule | Description |
|------|-------------|
| Format | Currency with 2 decimal places |
| Minimum | $0.00 |
| Locale | en-US |

---

### VAL-SM-020: Days Since Movement Display
| Rule | Description |
|------|-------------|
| Format | Integer |
| Minimum | 30 |
| Color | Based on risk level |

---

### VAL-SM-021: Risk Badge Display
| Risk Level | Badge Variant | Background | Text Color |
|------------|---------------|------------|------------|
| Low | outline | bg-green-100 | text-green-800 |
| Medium | outline | bg-yellow-100 | text-yellow-800 |
| High | outline | bg-orange-100 | text-orange-800 |
| Critical | destructive | N/A | N/A |

**Source Evidence**: `slow-moving/page.tsx:294-310`

---

### VAL-SM-022: Action Badge Display
| Action | Badge Style | Icon | Color |
|--------|-------------|------|-------|
| Transfer | outline | ArrowRightLeft | Blue |
| Promote | outline | Tag | Purple |
| Write Off | destructive | Trash2 | Red |
| Hold | secondary | Eye | Gray |

**Source Evidence**: `slow-moving/page.tsx:313-329`

---

## 7. Summary Cards Validation

### VAL-SM-023: Summary Cards (6 Cards)
| Card | Icon | Color | Value Source |
|------|------|-------|--------------|
| Total Items | Package | Blue | totalItems |
| Total Value | DollarSign | Green | totalValue |
| Avg Days Idle | Clock | Orange | avgDaysSinceMovement |
| Critical Risk | AlertTriangle | Red | criticalItems |
| To Transfer | ArrowRightLeft | Blue | transferItems |
| To Write Off | Trash2 | Red | writeoffItems |

**Source Evidence**: `slow-moving/page.tsx:567-657`

---

## 8. Quick Actions Validation

### VAL-SM-024: Quick Action Buttons
| Action | Icon | Enabled | Target |
|--------|------|---------|--------|
| Bulk Transfer | ArrowRightLeft | Always | Transfer workflow |
| Create Promotion | Megaphone | Always | Promotion workflow |
| Request Write-Off | Trash2 | Always | Write-off workflow |
| Export Report | FileDown | Always | Export function |

**Source Evidence**: `slow-moving/page.tsx:1141-1163`

---

## 9. Action Center Validation

### VAL-SM-025: Recommended Actions Display
| Section | Border Color | Shows When | Items Shown |
|---------|--------------|------------|-------------|
| Critical Risk | Red | criticalItems > 0 | Top 5 critical |
| High Risk | Orange | highRiskItems > 0 | Top 5 high risk |

**Source Evidence**: `slow-moving/page.tsx:1168-1238`

---

### VAL-SM-026: Action Summary Cards
| Card | Color | Value Source |
|------|-------|--------------|
| Transfer | Blue | transferItems |
| Promote | Purple | promoteItems |
| Write Off | Red | writeoffItems |
| Hold | Gray | holdItems |

**Source Evidence**: `slow-moving/page.tsx:1241-1285`

---

## 10. View Mode Validation

### VAL-SM-027: View Mode Selection
| Rule | Description |
|------|-------------|
| Valid Values | list, grouped |
| Default | list |
| Persistence | Session only |

**Source Evidence**: `slow-moving/page.tsx:672-694`

---

### VAL-SM-028: Grouped View Subtotals
| Metric | Calculation |
|--------|-------------|
| totalItems | COUNT(items in group) |
| totalQuantity | SUM(currentStock in group) |
| totalValue | SUM(value in group) |
| avgDaysSinceMovement | AVG(daysSinceMovement in group) |
| criticalItems | COUNT(riskLevel='critical' in group) |

**Source Evidence**: `lib/mock-data/location-inventory.ts:208-219`

---

## 11. Access Control Validation

### VAL-SM-029: Location Access
| Rule | Description |
|------|-------------|
| Check | user.availableLocations |
| System Admin | Access all locations |
| Empty Array | Show all (fallback) |
| Filter | Items with matching locationId |

---

## 12. Tab Validation

### VAL-SM-030: Tab Selection
| Rule | Description |
|------|-------------|
| Valid Tabs | inventory-list, analytics, action-center |
| Default Tab | inventory-list |
| Invalid Tab | Fall back to default |

**Source Evidence**: `slow-moving/page.tsx:662-667`

---

## 13. Performance Validation

### VAL-SM-031: Performance Thresholds
| Metric | Target | Warning | Error |
|--------|--------|---------|-------|
| Page Load | < 2s | 2-5s | > 5s |
| Filter Apply | < 500ms | 500ms-2s | > 2s |
| Chart Render | < 1s | 1-3s | > 3s |
| Tab Switch | < 300ms | 300ms-1s | > 1s |

---

## 14. Error Handling

### VAL-SM-032: Error States
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
| VAL-SM-001 | Days Since Movement | Business | High |
| VAL-SM-002 | Risk Level | Business | Critical |
| VAL-SM-003 | Suggested Action | Business | High |
| VAL-SM-004 | Item Interface | Data | High |
| VAL-SM-005 | Critical Risk Alert | Business | Critical |
| VAL-SM-006 | Write-Off Alert | Business | High |
| VAL-SM-007 | 180+ Days Alert | Business | High |
| VAL-SM-008 | Search Term | Input | Low |
| VAL-SM-009 | Category Filter | Input | Low |
| VAL-SM-010 | Risk Level Filter | Input | Low |
| VAL-SM-011 | Action Filter | Input | Low |
| VAL-SM-012 | Location Filter | Security | High |
| VAL-SM-013 | Summary Statistics | Business | High |
| VAL-SM-014 | Risk Distribution | Analytics | Medium |
| VAL-SM-015 | Action Distribution | Analytics | Medium |
| VAL-SM-016 | Aging Distribution | Analytics | Medium |
| VAL-SM-017 | Category Breakdown | Analytics | Medium |
| VAL-SM-018 | Location Breakdown | Analytics | Medium |
| VAL-SM-019 | Value Display | Display | Medium |
| VAL-SM-020 | Days Display | Display | Medium |
| VAL-SM-021 | Risk Badge | Display | Medium |
| VAL-SM-022 | Action Badge | Display | Low |
| VAL-SM-023 | Summary Cards | Feature | High |
| VAL-SM-024 | Quick Actions | Feature | Medium |
| VAL-SM-025 | Recommended Actions | Feature | High |
| VAL-SM-026 | Action Summary | Feature | Medium |
| VAL-SM-027 | View Mode | Input | Low |
| VAL-SM-028 | Grouped Subtotals | Business | High |
| VAL-SM-029 | Location Access | Security | Critical |
| VAL-SM-030 | Tab Selection | Input | Low |
| VAL-SM-031 | Performance | Performance | Medium |
| VAL-SM-032 | Error States | UX | Medium |

---

## Related Documents

- [BR-slow-moving.md](./BR-slow-moving.md) - Business Requirements
- [TS-slow-moving.md](./TS-slow-moving.md) - Technical Specification
- [UC-slow-moving.md](./UC-slow-moving.md) - Use Cases
- [FD-slow-moving.md](./FD-slow-moving.md) - Flow Diagrams
