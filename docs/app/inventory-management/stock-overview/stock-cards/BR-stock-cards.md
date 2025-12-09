# Business Requirements: Stock Cards

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Stock Cards |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. Executive Summary

### 1.1 Purpose
The Stock Cards module provides hotel operations staff with a comprehensive product-level view of inventory across all locations, enabling efficient stock monitoring, reorder decisions, and inventory optimization through multiple display formats and advanced filtering.

### 1.2 Business Objectives
- Provide product-centric inventory visibility across locations
- Enable quick identification of stock level issues
- Support multiple viewing preferences for different user workflows
- Facilitate navigation to detailed product stock cards
- Reduce stockouts through proactive monitoring

### 1.3 Success Metrics
| Metric | Target |
|--------|--------|
| Page Load Time | < 2 seconds |
| User Adoption | 95% of inventory staff |
| Low Stock Detection | 100% visibility |
| View Mode Usage | All modes used regularly |
| Export Accuracy | 100% |

---

## 2. Functional Requirements

### 2.1 Product Listing

#### FR-SC-001: Product Data Display
| Field | Description |
|-------|-------------|
| Product Code | Unique identifier |
| Product Name | Display name |
| Category | Product category |
| Unit | Unit of measure |
| Status | Active/Inactive |
| Current Stock | Total across locations |
| Minimum Stock | Reorder threshold |
| Maximum Stock | Overstock threshold |
| Value | Total inventory value |
| Average Cost | Cost per unit |
| Last Movement Date | Most recent transaction |
| Location Count | Number of locations with stock |

#### FR-SC-002: Multi-Location Stock
| Attribute | Description |
|-----------|-------------|
| Location ID | Location identifier |
| Location Name | Display name |
| Stock | Quantity at location |
| Value | Value at location |

### 2.2 View Modes

#### FR-SC-003: List View
| Feature | Description |
|---------|-------------|
| Table Format | Standard table with columns |
| Sortable Columns | Code, Name, Category, Stock, Value |
| Row Click | Navigate to stock card |
| Status Badge | Active/Inactive indicator |
| Stock Level Badge | Low/Normal/High |

#### FR-SC-004: Cards View
| Feature | Description |
|---------|-------------|
| Grid Layout | Responsive card grid |
| Progress Bar | Stock level visualization |
| Quick Metrics | Value, Location count |
| Color Coding | Border by stock level |
| Click Action | Navigate to stock card |

#### FR-SC-005: Grouped View
| Feature | Description |
|---------|-------------|
| Grouping | By location |
| Expand/Collapse | Per group toggle |
| Subtotals | Items, Stock, Value per group |
| Grand Totals | Overall summary |
| Expand All/Collapse All | Bulk toggle |

### 2.3 Filtering Capabilities

#### FR-SC-006: Filter Options
| Filter | Type | Description |
|--------|------|-------------|
| Search | Text Input | Name or code |
| Category | Dropdown | Product category |
| Status | Dropdown | Active/Inactive/All |
| Stock Level | Dropdown | Low/Normal/High/All |
| Location | Dropdown | Specific location |

#### FR-SC-007: Sorting
| Field | Direction |
|-------|-----------|
| Code | Asc/Desc |
| Name | Asc/Desc |
| Category | Asc/Desc |
| Stock | Asc/Desc |
| Value | Asc/Desc |

### 2.4 Summary Statistics

#### FR-SC-008: Summary Cards
| Card | Metrics |
|------|---------|
| Total Products | Count, Active count |
| Total Value | Sum, Average |
| Normal Stock | Count, Progress bar |
| Low Stock | Count, Progress bar |
| High Stock | Count, Progress bar |
| Categories | Count, Top category |

### 2.5 Stock Level Indicators

#### FR-SC-009: Stock Level Classification
| Level | Condition | Badge | Color |
|-------|-----------|-------|-------|
| Low | Current ≤ Minimum | "Low" | Red/Destructive |
| Normal | Minimum < Current < Maximum | "Normal" | Green |
| High | Current ≥ Maximum | "High" | Amber |

### 2.6 Export Capabilities

#### FR-SC-010: Export Features
| Feature | Description |
|---------|-------------|
| Formats | CSV, Excel |
| Columns | Configurable |
| Data | Filtered dataset |
| Grouped | Supports grouped export |
| Filename | `stock-cards-YYYY-MM-DD` |

---

## 3. Non-Functional Requirements

### 3.1 Performance
| Metric | Requirement |
|--------|-------------|
| Page Load | < 2 seconds |
| Filter Apply | < 500ms |
| View Switch | < 300ms |
| Export (1000) | < 5 seconds |

### 3.2 Usability
- Responsive design for all devices
- Intuitive view mode switching
- Clear stock level indicators
- Keyboard navigation support

### 3.3 Security
- Role-based location access
- Audit logging for exports
- Secure data transmission

---

## 4. Data Requirements

### 4.1 Product Data Structure
```typescript
interface Product {
  id: string
  code: string
  name: string
  category: string
  unit: string
  status: "Active" | "Inactive"
  currentStock: number
  minimumStock: number
  maximumStock: number
  value: number
  averageCost: number
  lastMovementDate: string
  locationCount: number
  locations: ProductLocation[]
}

interface ProductLocation {
  id: string
  name: string
  stock: number
  value: number
}
```

### 4.2 Summary Statistics
```typescript
interface SummaryStats {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  totalValue: number
  totalStock: number
  lowStockProducts: number
  highStockProducts: number
  normalStockProducts: number
  avgValue: number
  categoryStats: CategoryStat[]
}
```

### 4.3 Export Configuration
```typescript
interface ExportColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'currency' | 'date'
}
```

---

## 5. Business Rules

### BR-001: Stock Level Classification
- Low Stock: `currentStock ≤ minimumStock`
- High Stock: `currentStock ≥ maximumStock`
- Normal Stock: `minimumStock < currentStock < maximumStock`

### BR-002: Location Access Control
Users can only view products in locations within their `availableLocations` array, except System Administrators who have full access.

### BR-003: Value Calculation
Product value is calculated as: `currentStock × averageCost`

### BR-004: Grouped View Aggregation
When grouped by location, products appear in each location where they have stock, with location-specific quantities.

### BR-005: Sort Persistence
Sort field and direction persist within the session.

---

## 6. Acceptance Criteria

### AC-001: List View
- [ ] Table displays all product fields
- [ ] Columns are sortable with visual indicator
- [ ] Row click navigates to stock card
- [ ] Status and stock level badges display correctly

### AC-002: Cards View
- [ ] Cards render in responsive grid
- [ ] Progress bar shows stock level accurately
- [ ] Border color matches stock level
- [ ] Click navigates to stock card

### AC-003: Grouped View
- [ ] Products grouped by location
- [ ] Expand/collapse works per group
- [ ] Subtotals calculate correctly
- [ ] Grand totals match sum of subtotals

### AC-004: Filtering
- [ ] Search filters by name and code
- [ ] Category filter applies correctly
- [ ] Status filter works
- [ ] Stock level filter works
- [ ] Multiple filters combine with AND

### AC-005: Export
- [ ] Export includes filtered data
- [ ] All columns export correctly
- [ ] Grouped view exports with structure
- [ ] Filename has date stamp

---

## 7. User Stories

### US-001: View Product List
**As a** Storekeeper
**I want to** view all products with stock levels
**So that** I can monitor inventory status

### US-002: Find Low Stock
**As an** Inventory Manager
**I want to** filter for low stock products
**So that** I can initiate reorders

### US-003: Compare Locations
**As a** Department Manager
**I want to** see products grouped by location
**So that** I can compare stock distribution

### US-004: Export Report
**As a** Financial Controller
**I want to** export stock card data
**So that** I can create reports

### US-005: Navigate to Detail
**As a** Storekeeper
**I want to** click a product to see its stock card
**So that** I can view movement history

---

## 8. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Slow loading with many products | High | Medium | Implement pagination |
| Incorrect stock calculations | High | Low | Validate against transactions |
| View mode confusion | Medium | Low | Clear visual indicators |
| Export timeout | Medium | Medium | Async export with notification |
