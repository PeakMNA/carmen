# Business Requirements: Inventory Balance

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
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated type definitions from types.ts; Corrected transaction types to IN/OUT only; Added inventory status calculation; Updated movement history features; Added stock threshold visualization |
| 2.0.0 | 2024-06-15 | System | Previous version with outdated interfaces |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Executive Summary

### 1.1 Purpose
The Inventory Balance module provides hotel operations staff with real-time visibility into stock quantities and values across all locations, enabling informed decision-making for purchasing, transfers, and inventory optimization.

### 1.2 Business Objectives
- Provide accurate real-time inventory visibility across all locations
- Support point-in-time balance reporting for auditing
- Enable proactive stock management through analytics and alerts
- Reduce stockouts and overstocking through actionable insights
- Support financial reporting with accurate inventory valuation
- Visualize inventory status against minimum/maximum thresholds

### 1.3 Success Metrics
| Metric | Target |
|--------|--------|
| Report Accuracy | 99.9% |
| Page Load Time | < 2 seconds |
| User Adoption | 90% of inventory staff |
| Stock Visibility | 100% of locations |
| Alert Response Time | < 24 hours |

---

## 2. Functional Requirements

### 2.1 Balance Report Display

#### FR-BAL-001: Summary Cards
| Requirement | Description |
|-------------|-------------|
| Total Quantity | Display sum of all stock quantities across filtered locations |
| Total Value | Display total inventory value in base currency |
| Location Count | Show number of active inventory locations |
| Category Count | Show number of product categories |
| Trend Indicators | Show percentage change from previous period |

#### FR-BAL-002: Hierarchical Data Display
| Level | Attributes |
|-------|------------|
| Location | ID, code, name, categories[], totals (quantity, value) |
| Category | ID, code, name, products[], totals (quantity, value) |
| Product | ID, code, name, unit, tracking.batch, thresholds (min/max), totals (quantity, averageCost, value), lots[] |
| Lot | Lot number, quantity, expiry date, unit cost, value |

#### FR-BAL-003: View Type Selection
| View | Description |
|------|-------------|
| PRODUCT | Default product-level detail |
| CATEGORY | Category-level aggregation |
| LOT | Lot/batch tracking detail |

#### FR-BAL-004: Inventory Status Visualization
| Status | Condition | Badge | Color |
|--------|-----------|-------|-------|
| Low | Current ≤ Minimum threshold | "Low" | Red (destructive) |
| Normal | Minimum < Current < Maximum | "Normal" | Green |
| High | Current ≥ Maximum threshold | "High" | Amber |

**Source Evidence**: `components/BalanceTable.tsx:112-121` (getInventoryStatus function)

### 2.2 Filtering Capabilities

#### FR-BAL-005: Filter Parameters
| Filter | Type | Description |
|--------|------|-------------|
| As-of Date | Date Picker | Point-in-time balance date (YYYY-MM-DD format) |
| Location Range | From/To | Filter by location code range |
| Category Range | From/To | Filter by category code range |
| Product Range | From/To | Filter by product code range |
| Show Lots | Toggle | Enable/disable lot tracking display |

**Source Evidence**: `components/FilterPanel.tsx:1-210`

#### FR-BAL-006: Active Filter Management
- Display active filters as removable badges
- One-click filter removal
- Clear all filters option (Reset button)
- Apply button to execute filter changes
- Persist filter state during session

### 2.3 Movement History

#### FR-BAL-007: Transaction Types
| Type | Badge Color | Description |
|------|-------------|-------------|
| IN | Green | Stock received/added |
| OUT | Red | Stock issued/removed |

**Note**: Only IN and OUT transaction types are supported. No ADJUSTMENT type exists in current implementation.

**Source Evidence**: `components/MovementHistory.tsx:111-121` (getTransactionTypeBadge function)

#### FR-BAL-008: Reference Types
| Reference | Badge Color | Description |
|-----------|-------------|-------------|
| GRN | Blue | Goods Received Note |
| SO | Purple | Sales Order |
| ADJ | Amber | Stock Adjustment |
| TRF | Indigo | Stock Transfer |
| PO | Cyan | Purchase Order |
| WO | Rose | Work Order |
| SR | Emerald | Store Requisition |

**Source Evidence**: `components/MovementHistory.tsx:124-136` (getReferenceTypeBadge function)

#### FR-BAL-009: Movement Summary Cards
| Card | Description |
|------|-------------|
| Total In | Sum of all IN transactions (quantity and value) |
| Total Out | Sum of all OUT transactions (quantity and value) |
| Net Change | Difference between In and Out |
| Transactions | Total count of movements |

**Source Evidence**: `components/MovementHistory.tsx:198-244`

#### FR-BAL-010: Movement Table Columns
| Column | Description |
|--------|-------------|
| Date & Time | Transaction date and time |
| Reference | Reference type badge and document number |
| Product | Product name, code, and lot number (if applicable) |
| Location | Storage location name |
| Type | IN or OUT badge |
| Reason | Movement reason description |
| Quantity | Quantity change with before/after values |
| Value | Value change with before/after values |

### 2.4 Export Capabilities

#### FR-BAL-011: Report Export
| Format | Content |
|--------|---------|
| Excel/CSV | Full filtered dataset |
| PDF | Formatted report with charts |
| Date Range | User-selected or default |

---

## 3. Non-Functional Requirements

### 3.1 Performance
| Metric | Requirement |
|--------|-------------|
| Page Load | < 2 seconds |
| Filter Apply | < 500ms |
| Export Generation | < 5 seconds |
| Chart Render | < 1 second |

### 3.2 Security
- Role-based location access control
- Audit logging for all data access
- Secure data transmission (HTTPS)
- Session timeout after inactivity

### 3.3 Usability
- Responsive design for all devices
- Keyboard navigation support
- Clear visual hierarchy
- Intuitive filter controls

### 3.4 Reliability
- 99.9% uptime
- Graceful degradation on API failure
- Offline indicator when disconnected

---

## 4. Data Requirements

### 4.1 Balance Report Data Structure
```typescript
interface BalanceReport {
  locations: LocationBalance[]
  totals: {
    quantity: number
    value: number
  }
}

interface LocationBalance {
  id: string
  code: string
  name: string
  categories: CategoryBalance[]
  totals: {
    quantity: number
    value: number
  }
}

interface CategoryBalance {
  id: string
  code: string
  name: string
  products: ProductBalance[]
  totals: {
    quantity: number
    value: number
  }
}

interface ProductBalance {
  id: string
  code: string
  name: string
  unit: string
  tracking: {
    batch: boolean
  }
  thresholds: {
    minimum: number
    maximum: number
  }
  totals: {
    quantity: number
    averageCost: number
    value: number
  }
  lots: LotBalance[]
}

interface LotBalance {
  lotNumber: string
  expiryDate?: string
  quantity: number
  unitCost: number
  value: number
}
```

**Source Evidence**: `inventory-balance/types.ts:1-65`

### 4.2 Filter Parameters
```typescript
interface BalanceReportParams {
  asOfDate: string  // YYYY-MM-DD format
  locationRange: { from: string; to: string }
  categoryRange: { from: string; to: string }
  productRange: { from: string; to: string }
  viewType: 'CATEGORY' | 'PRODUCT' | 'LOT'
  showLots: boolean
}
```

**Source Evidence**: `inventory-balance/types.ts:67-76`

### 4.3 Movement Record Structure
```typescript
interface MovementRecord {
  id: string
  date: string
  time: string
  reference: string
  referenceType: 'GRN' | 'SO' | 'ADJ' | 'TRF' | 'PO' | 'WO' | 'SR'
  productId: string
  productCode: string
  productName: string
  lotNumber?: string
  locationId: string
  locationName: string
  transactionType: 'IN' | 'OUT'
  reason: string
  quantityBefore: number
  quantityChange: number
  quantityAfter: number
  valueBefore: number
  valueChange: number
  valueAfter: number
}
```

---

## 5. Integration Requirements

### 5.1 Internal Systems
| System | Integration |
|--------|-------------|
| User Context | Location permission filtering |
| Inventory Transactions | Movement history data |
| Stock Transfers | Transfer transaction source |
| Purchase Orders | Receiving transaction source |
| Store Requisitions | Issue transaction source |
| Stock Card | Navigation from product click |

### 5.2 External Systems
| System | Integration |
|--------|-------------|
| Accounting System | Inventory valuation sync |
| ERP | Master data synchronization |

---

## 6. Business Rules

### BR-001: Location Access Control
Users can only view balance data for locations in their `availableLocations` array, except System Administrators who have full access.

### BR-002: Value Calculation
Inventory value is calculated as: Quantity × Average Cost per unit.

### BR-003: Inventory Status Thresholds
- **Low Stock**: `quantity ≤ minimum threshold`
- **High Stock**: `quantity ≥ maximum threshold`
- **Normal Stock**: `minimum < quantity < maximum`

### BR-004: Balance Point-in-Time
As-of-date filtering shows the inventory balance as of the selected date, not current balance.

### BR-005: Lot Tracking
When show lots is enabled, lot-level detail is displayed for products with `tracking.batch = true`.

### BR-006: Movement Type Restriction
Only IN and OUT transaction types are used. Adjustments are reflected as either IN (positive adjustment) or OUT (negative adjustment).

---

## 7. Acceptance Criteria

### AC-001: Balance Report Display
- [ ] Summary cards show accurate totals
- [ ] Hierarchical table expands/collapses correctly (Location → Category → Product → Lot)
- [ ] View type toggle changes display appropriately
- [ ] Data refreshes on filter changes
- [ ] Inventory status badges display correctly (Low/Normal/High)

### AC-002: Filtering
- [ ] All filter types apply correctly
- [ ] Active filters display as badges
- [ ] Filter removal updates data
- [ ] As-of-date shows historical balance
- [ ] Apply button executes filter changes
- [ ] Reset button clears all filters

### AC-003: Movement History
- [ ] Summary cards show Total In, Total Out, Net Change, Transactions
- [ ] Transaction type filter shows only IN, OUT options
- [ ] Reference type badges display correctly
- [ ] Date range filter works
- [ ] Search filters by product, location, reference
- [ ] Pagination works correctly

### AC-004: Navigation
- [ ] Clicking product row navigates to Stock Card page
- [ ] Links navigate to correct destinations

### AC-005: Export
- [ ] Export includes filtered data
- [ ] File downloads successfully
- [ ] Format is correct and readable
- [ ] Date stamp in filename

---

## 8. Assumptions and Constraints

### 8.1 Assumptions
- Users have basic inventory management knowledge
- Network connectivity is reliable
- Historical data is available for trend analysis
- Average cost method is used for valuation

### 8.2 Constraints
- Maximum date range: 365 days
- Export limit: 10,000 records
- Movement history: Filterable by date range
- Pagination: 10 items per page for movement history

---

## 9. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Slow data loading | High | Medium | Implement caching and pagination |
| Incorrect valuations | High | Low | Validate calculation logic |
| User access violations | High | Low | Strict RBAC enforcement |
| Export timeout | Medium | Medium | Async export with notification |

---

## 10. Appendices

### 10.1 Glossary
| Term | Definition |
|------|------------|
| Balance | Current stock quantity and value |
| Lot | Batch or lot number for tracking |
| Point-in-Time | Historical balance at specific date |
| Average Cost | Mean cost of inventory items |
| RBAC | Role-Based Access Control |
| Threshold | Minimum/Maximum stock level settings |

### 10.2 Related Documents
- [TS-inventory-balance.md](./TS-inventory-balance.md) - Technical Specification
- [FD-inventory-balance.md](./FD-inventory-balance.md) - Flow Diagrams
- [UC-inventory-balance.md](./UC-inventory-balance.md) - Use Cases
- [VAL-inventory-balance.md](./VAL-inventory-balance.md) - Validations
