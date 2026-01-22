# Business Requirements: Stock Cards

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
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated to reflect single product detail page with 6 tabs; Added analytics, alerts, and quick actions; Updated type definitions; Corrected transaction types to IN/OUT only |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Executive Summary

### 1.1 Purpose
The Stock Card module provides hotel operations staff with a comprehensive, single-product view of inventory details, movements, valuations, and analytics across all locations. This enables informed decision-making for purchasing, transfers, and inventory optimization.

### 1.2 Business Objectives
- Provide detailed product-level inventory visibility across locations
- Enable proactive stock management through alerts and analytics
- Support financial reporting with accurate inventory valuation
- Visualize inventory status against minimum/maximum thresholds
- Track lot information including expiry dates and status
- Facilitate quick actions for purchasing, transfers, and adjustments

### 1.3 Success Metrics
| Metric | Target |
|--------|--------|
| Page Load Time | < 2 seconds |
| User Adoption | 95% of inventory staff |
| Alert Visibility | 100% for critical alerts |
| Days of Supply Accuracy | 95%+ |
| Export Accuracy | 100% |

---

## 2. Functional Requirements

### 2.1 Summary Cards Display

#### FR-SC-001: Summary Cards
| Card | Metrics | Description |
|------|---------|-------------|
| Current Stock | Quantity, Unit, Progress bar | Stock level vs min/max thresholds |
| Current Value | Value, Average Cost | Total inventory value for product |
| Days of Supply | Days, Daily Usage | Calculated from average daily consumption |
| Last Movement | Date, Type | Most recent transaction |
| Locations | Count, Primary Location | Number of storage locations |
| Active Lots | Available/Total | Lot counts by availability |

**Source Evidence**: `stock-card/page.tsx:392-529`

#### FR-SC-002: Stock Status Indicators
| Status | Condition | Badge | Color |
|--------|-----------|-------|-------|
| Low | current ≤ minimum | "Low Stock" | Red (destructive) |
| Normal | minimum < current < maximum | N/A | Green |
| High | current ≥ maximum | "Overstocked" | Amber |

**Source Evidence**: `stock-card/page.tsx:213-215, 325-336`

### 2.2 Tab Structure

#### FR-SC-003: Available Tabs
| Tab | Description |
|-----|-------------|
| General Information | Product details, specifications, parameters |
| Movement History | Transaction history with filtering |
| Lot Information | Lot tracking with status and expiry |
| Valuation | Cost tracking and running averages |
| Analytics | Charts, trends, and distribution analysis |
| Actions | Quick actions and recommended actions |

**Source Evidence**: `stock-card/page.tsx:534-542`

### 2.3 Alert System

#### FR-SC-004: Alert Types
| Alert | Type | Trigger Condition |
|-------|------|-------------------|
| Low Stock Alert | Critical | currentStock ≤ minimumStock |
| Reorder Point Reached | Warning | currentStock ≤ reorderPoint AND > minimumStock |
| Lots Expiring Soon | Warning | Lots expiring within 30 days |
| Expired Lots | Critical | Lots with status = 'Expired' |

**Source Evidence**: `stock-card/page.tsx:171-211`

### 2.4 Analytics Features

#### FR-SC-005: Analytics Charts
| Chart | Type | Data |
|-------|------|------|
| Movement Trend | ComposedChart | 30-day In/Out/Net/Balance |
| Stock by Location | Progress bars | Location distribution |
| Lot Status Distribution | PieChart | Available/Reserved/Expired/Quarantine |
| Movement Summary by Type | Cards | Receipts (IN) and Issues (OUT) counts |

**Source Evidence**: `stock-card/page.tsx:560-689`

### 2.5 Quick Actions

#### FR-SC-006: Available Actions
| Action | Description | Icon |
|--------|-------------|------|
| Create Purchase Request | Order from supplier | ShoppingCart |
| Request Transfer | Move stock between locations | Truck |
| Adjust Stock | Make inventory adjustment | Target |

**Source Evidence**: `stock-card/page.tsx:692-722`

### 2.6 Header Actions

#### FR-SC-007: Header Buttons
| Button | Action |
|--------|--------|
| Back | Navigate to stock cards list |
| Refresh | Reload current data |
| Print | Print stock card |
| Export | Export to file |
| Edit | Edit product details |

**Source Evidence**: `stock-card/page.tsx:345-362`

---

## 3. Non-Functional Requirements

### 3.1 Performance
| Metric | Requirement |
|--------|-------------|
| Page Load | < 2 seconds |
| Tab Switch | < 300ms |
| Chart Render | < 1 second |
| Export Generation | < 5 seconds |

### 3.2 Usability
- Responsive design for all devices
- Keyboard navigation support
- Clear visual hierarchy
- Color-coded status indicators

### 3.3 Security
- Role-based location access control
- Audit logging for all data access
- Secure data transmission (HTTPS)

---

## 4. Data Requirements

### 4.1 Product Interface
```typescript
interface Product {
  id: string
  name: string
  code: string
  category: string
  unit: string
  status: "Active" | "Inactive"
  description: string
  lastUpdated: string
  createdAt: string
  createdBy: string
  barcode?: string
  alternateUnit?: string
  conversionFactor?: number
  minimumStock?: number
  maximumStock?: number
  reorderPoint?: number
  reorderQuantity?: number
  leadTime?: number
  shelfLife?: number
  storageRequirements?: string
  tags?: string[]
}
```

**Source Evidence**: `stock-card/types.ts:1-23`

### 4.2 Stock Summary Interface
```typescript
interface StockSummary {
  currentStock: number
  currentValue: number
  averageCost: number
  lastMovementDate: string
  lastMovementType: string
  locationCount: number
  primaryLocation: string
  totalIn: number
  totalOut: number
  netChange: number
}
```

**Source Evidence**: `stock-card/types.ts:25-36`

### 4.3 Location Stock Interface
```typescript
interface LocationStock {
  locationId: string
  locationName: string
  quantity: number
  value: number
  lastMovementDate: string
}
```

**Source Evidence**: `stock-card/types.ts:38-44`

### 4.4 Lot Information Interface
```typescript
interface LotInformation {
  lotNumber: string
  expiryDate: string
  receivedDate: string
  quantity: number
  unitCost: number
  value: number
  locationId: string
  locationName: string
  status: "Available" | "Reserved" | "Expired" | "Quarantine"
}
```

**Source Evidence**: `stock-card/types.ts:46-56`

### 4.5 Movement Record Interface
```typescript
interface MovementRecord {
  id: string
  date: string
  time: string
  reference: string
  referenceType: string
  locationId: string
  locationName: string
  transactionType: "IN" | "OUT"
  reason: string
  lotNumber?: string
  quantityBefore: number
  quantityAfter: number
  quantityChange: number
  unitCost: number
  valueBefore: number
  valueAfter: number
  valueChange: number
  username: string
}
```

**Note**: Only IN and OUT transaction types are supported.

**Source Evidence**: `stock-card/types.ts:58-77`

### 4.6 Valuation Record Interface
```typescript
interface ValuationRecord {
  date: string
  reference: string
  transactionType: "IN" | "OUT"
  quantity: number
  unitCost: number
  value: number
  runningQuantity: number
  runningValue: number
  runningAverageCost: number
}
```

**Source Evidence**: `stock-card/types.ts:79-89`

### 4.7 Stock Card Data Interface
```typescript
interface StockCardData {
  product: Product
  summary: StockSummary
  locationStocks: LocationStock[]
  lotInformation: LotInformation[]
  movements: MovementRecord[]
  valuation: ValuationRecord[]
}
```

**Source Evidence**: `stock-card/types.ts:128-135`

---

## 5. Business Rules

### BR-001: Stock Status Calculation
- **Low Stock**: `currentStock ≤ minimumStock`
- **High Stock**: `currentStock ≥ maximumStock`
- **Normal Stock**: `minimumStock < currentStock < maximumStock`

### BR-002: Days of Supply Calculation
- Calculate average daily usage from OUT transactions over 30 days
- Days of Supply = currentStock / avgDailyUsage
- Display "365+" if > 365 days

### BR-003: Transaction Type Restriction
Only IN and OUT transaction types are used. No ADJUSTMENT type exists.

### BR-004: Lot Status Classification
- **Available**: Lot can be issued
- **Reserved**: Lot allocated to orders
- **Expired**: Past expiry date
- **Quarantine**: Under quality hold

### BR-005: Expiry Alert Threshold
Lots expiring within 30 days trigger a warning alert.

### BR-006: Value Calculation
Current Value = currentStock × averageCost

---

## 6. Acceptance Criteria

### AC-001: Summary Cards Display
- [ ] All 6 summary cards display correctly
- [ ] Current Stock shows progress bar
- [ ] Days of Supply calculates correctly
- [ ] Stock status badges show correctly (Low/Overstocked)

### AC-002: Tab Navigation
- [ ] All 6 tabs accessible
- [ ] Tab content loads correctly
- [ ] Tab state persists during session

### AC-003: Alerts
- [ ] Low stock alert displays when quantity ≤ minimum
- [ ] Reorder point alert displays appropriately
- [ ] Expiring lots alert shows within 30 days
- [ ] Expired lots alert shows for expired status

### AC-004: Analytics
- [ ] Movement trend chart renders
- [ ] Location distribution shows correctly
- [ ] Lot status pie chart displays
- [ ] Movement summary cards calculate correctly

### AC-005: Quick Actions
- [ ] All 3 quick action buttons visible
- [ ] Buttons navigate to appropriate pages/dialogs

---

## 7. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Slow chart loading | High | Medium | Lazy load chart library |
| Incorrect calculations | High | Low | Validate calculations server-side |
| Missing lot data | Medium | Medium | Show "No data" message gracefully |
| Alert overload | Medium | Low | Prioritize critical alerts |

---

## 8. Related Documents

- [TS-stock-cards.md](./TS-stock-cards.md) - Technical Specification
- [FD-stock-cards.md](./FD-stock-cards.md) - Flow Diagrams
- [UC-stock-cards.md](./UC-stock-cards.md) - Use Cases
- [VAL-stock-cards.md](./VAL-stock-cards.md) - Validations
