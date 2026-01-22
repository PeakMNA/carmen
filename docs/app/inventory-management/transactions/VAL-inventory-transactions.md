# Validation Rules: Inventory Transactions

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Transactions |
| Version | 2.0.0 |
| Last Updated | 2025-01-16 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-01-16 | Documentation Team | Updated transaction types to IN/OUT only; Updated reference types (ST, SI); Added source evidence; Aligned with current code |
| 1.0.0 | 2024-01-15 | Documentation Team | Initial version |

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

**Source Evidence**: `components/TransactionFilters.tsx:94-122`

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

**Source Evidence**: `page.tsx:43-56`, `page.tsx:66-81`

---

### VAL-TXN-003: Transaction Type Filter
| Rule | Description |
|------|-------------|
| Valid Values | IN, OUT |
| Multiple Selection | Allowed |
| Empty Selection | Shows all transaction types |

**Note**: Only IN and OUT transaction types exist. Adjustments are recorded as IN or OUT with referenceType = 'ADJ'.

**Source Evidence**: `types.ts:7`, `components/TransactionFilters.tsx:59-64`

---

### VAL-TXN-004: Reference Type Filter
| Rule | Description |
|------|-------------|
| Valid Values | GRN, SO, ADJ, ST, SI, PO, WO, SR, PC, WR, PR |
| Multiple Selection | Allowed |
| Empty Selection | Shows all reference types |

**Reference Type Descriptions**:
| Code | Description | Transaction Direction |
|------|-------------|----------------------|
| GRN | Goods Received Note | IN |
| SO | Sales Order | OUT |
| ADJ | Adjustment | IN or OUT |
| ST | Stock Transfer | IN or OUT |
| SI | Stock Issue | OUT |
| PO | Purchase Order | IN |
| WO | Write Off | OUT |
| SR | Store Requisition | OUT |
| PC | Physical Count | IN or OUT |
| WR | Wastage Report | OUT |
| PR | Purchase Request | N/A (no transactions) |

**Source Evidence**: `types.ts:6`, `types.ts:103-115`, `components/TransactionFilters.tsx:66-76`

---

### VAL-TXN-005: Search Term Validation
| Rule | Description |
|------|-------------|
| Min Length | No minimum (empty allowed) |
| Max Length | 100 characters |
| Search Fields | Product name, code, reference, location, category, user |
| Case Sensitivity | Case-insensitive search |
| Special Characters | Allowed, escaped for matching |

**Source Evidence**: `components/TransactionFilters.tsx:51-53`, `lib/mock-data/transactions.ts:350-365`

---

## 2. Data Display Validation

### VAL-TXN-006: Quantity Display
| Rule | Description |
|------|-------------|
| Qty In | Display only for IN transactions, >= 0 |
| Qty Out | Display only for OUT transactions, >= 0 |
| Net Quantity | Calculated as quantityIn - quantityOut |
| Color Coding | Green for positive (IN), Red for negative (OUT) |
| Format | Number with thousand separators |

**Source Evidence**: `components/TransactionTable.tsx:259-285`

---

### VAL-TXN-007: Currency Display
| Rule | Description |
|------|-------------|
| Format | USD with 0 decimal places (summary), 2 decimal places (details) |
| Locale | en-US formatting |
| Symbol | $ prefix |
| Negative Values | Red color with minus sign |
| Zero Values | Display as $0 |

**Formatting Function**:
```typescript
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})
```

**Source Evidence**: `components/TransactionSummaryCards.tsx:12-22`

---

### VAL-TXN-008: Date/Time Display
| Rule | Description |
|------|-------------|
| Date Format | YYYY-MM-DD |
| Time Format | HH:MM (24-hour) |
| Timezone | Server timezone |
| Display | Date bold, time muted |

**Source Evidence**: `components/TransactionTable.tsx:206-214`

---

### VAL-TXN-009: Balance Validation
| Rule | Description |
|------|-------------|
| Balance Before | Must be >= 0 |
| Balance After | Must be >= 0 (negative indicates data error) |
| Calculation | balanceAfter = balanceBefore + netQuantity |
| Display | "Before -> After" format with arrow |

**Source Evidence**: `components/TransactionTable.tsx:305-314`

---

## 3. Pagination Validation

### VAL-TXN-010: Page Size
| Rule | Description |
|------|-------------|
| Valid Values | 10, 25, 50 |
| Default | 10 |
| Invalid Value | Reset to default 10 |

**Source Evidence**: `components/TransactionTable.tsx:44-46`, `components/TransactionTable.tsx:349-358`

---

### VAL-TXN-011: Page Number
| Rule | Description |
|------|-------------|
| Minimum | 1 |
| Maximum | ceil(totalRecords / pageSize) |
| Out of Range | Reset to page 1 |
| Filter Change | Reset to page 1 |

**Source Evidence**: `components/TransactionTable.tsx:120-123`, `components/TransactionTable.tsx:364-391`

---

## 4. Sorting Validation

### VAL-TXN-012: Sort Field
| Rule | Description |
|------|-------------|
| Valid Fields | date, reference, productName, locationName, quantityIn, quantityOut, totalValue |
| Default Field | date |
| Invalid Field | Use default |

**Source Evidence**: `components/TransactionTable.tsx:62-94`

---

### VAL-TXN-013: Sort Direction
| Rule | Description |
|------|-------------|
| Valid Values | asc, desc |
| Default | desc (newest first) |
| Toggle Behavior | Same column click toggles direction |

**Source Evidence**: `components/TransactionTable.tsx:104-118`

---

## 5. Export Validation

### VAL-TXN-014: CSV Export
| Rule | Description |
|------|-------------|
| Minimum Records | At least 1 record required |
| Maximum Records | No limit (all filtered records) |
| Empty State | Export button disabled |
| Filename | `inventory-transactions-YYYY-MM-DD.csv` |

**Required Columns (16)**:
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

**Source Evidence**: `page.tsx:97-154`

---

## 6. Analytics Validation

### VAL-TXN-015: Chart Data
| Rule | Description |
|------|-------------|
| Empty Data | Show "No data available" message |
| Trend Chart | Requires minimum 2 data points |
| Pie Chart | Requires at least 1 segment |
| Bar Charts | Limit to top 8 categories |

**Source Evidence**: `components/TransactionAnalytics.tsx:61-293`

---

### VAL-TXN-016: Analytics Calculations
| Chart | Calculation |
|-------|-------------|
| Transaction Trend | Group by date, sum Inbound/Outbound/Adjustment values |
| Distribution by Type | Count by transactionType (IN/OUT) |
| Location Activity | Sum in/out counts by location |
| Reference Type Distribution | Count by referenceType |
| Top Categories by Value | Sum totalValue by category, limit 8 |

**Source Evidence**: `lib/mock-data/transactions.ts:199-347`

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

**Source Evidence**: `page.tsx:43-56`

---

### VAL-TXN-018: Location Access
| Rule | Description |
|------|-------------|
| Check | user.availableLocations array |
| Empty Array | Show all locations (fallback) |
| Invalid Location | Auto-filter to permitted only |
| Admin Override | System Administrator bypasses all checks |

**Source Evidence**: `page.tsx:66-81`

---

## 8. Summary Card Validation

### VAL-TXN-019: Summary Calculations
| Metric | Calculation | Validation |
|--------|-------------|------------|
| Total Transactions | COUNT(records) | >= 0 |
| Adjustment Count | COUNT(records WHERE referenceType = ADJ) | >= 0 |
| Total Inbound Value | SUM(totalValue) WHERE type = IN | >= 0 |
| Total Inbound Quantity | SUM(quantityIn) | >= 0 |
| Total Outbound Value | SUM(totalValue) WHERE type = OUT | >= 0 |
| Total Outbound Quantity | SUM(quantityOut) | >= 0 |
| Net Value Change | Total In Value - Total Out Value | Can be negative |
| Net Quantity Change | Total In Qty - Total Out Qty | Can be negative |

**Source Evidence**: `lib/mock-data/transactions.ts:164-197`, `components/TransactionSummaryCards.tsx:46-125`

---

## 9. Error Handling

### VAL-TXN-020: Error States
| Scenario | Handling |
|----------|----------|
| Data Load Failure | Show error message, retry button |
| Filter Error | Show toast notification, maintain previous state |
| Export Failure | Show error toast, log error |
| No Permission | Redirect to dashboard or show access denied |
| No Data | Display empty state with icon and message |

**Source Evidence**: `components/TransactionTable.tsx:161-171`

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

## 11. Quick Date Filter Validation

### VAL-TXN-022: Quick Date Filters
| Button | From Date | To Date |
|--------|-----------|---------|
| Today | Start of today | Now |
| 7 Days | 7 days ago | Now |
| 30 Days | 30 days ago | Now |
| This Month | Start of month | End of month |

**Source Evidence**: `components/TransactionFilters.tsx:94-122`

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
| VAL-TXN-022 | Quick Date Filters | Input | Low |

---

## Related Documents

- [BR-inventory-transactions.md](./BR-inventory-transactions.md) - Business Requirements
- [TS-inventory-transactions.md](./TS-inventory-transactions.md) - Technical Specification
- [UC-inventory-transactions.md](./UC-inventory-transactions.md) - Use Cases
- [FD-inventory-transactions.md](./FD-inventory-transactions.md) - Flow Diagrams
- [DD-inventory-transactions.md](./DD-inventory-transactions.md) - Data Definition
