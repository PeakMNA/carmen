# Business Requirements: Inventory Transactions

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Transactions |
| Version | 1.0 |
| Last Updated | 2024-01-15 |
| Status | Approved |

---

## 1. Executive Summary

The Inventory Transactions module provides a unified view of all inventory movements across hotel locations. It consolidates transactions from multiple sources (GRN, Store Requisitions, Transfers, Adjustments, Write-offs) into a single, filterable interface with analytics capabilities.

---

## 2. Business Objectives

| ID | Objective | Success Metric |
|----|-----------|----------------|
| BO-001 | Provide visibility into all inventory movements | 100% transaction capture from all sources |
| BO-002 | Enable location-based analysis | Filter by 5+ hotel locations |
| BO-003 | Support audit and compliance | Full audit trail with user attribution |
| BO-004 | Reduce inventory discrepancy investigation time | 50% faster root cause analysis |

---

## 3. Functional Requirements

### FR-TXN-001: Transaction List View
**Priority**: High
**User Story**: As a Storekeeper, I want to view all inventory transactions in one place so that I can track stock movements without switching between multiple modules.

**Requirements**:
- Display transactions with: Date/Time, Reference, Product, Location, Type, Qty In/Out, Value, Balance, User
- Support sorting by Date, Reference, Product, Location, Qty In, Qty Out, Value
- Paginate results (10/25/50 per page)
- Show loading skeleton during data fetch
- Display empty state when no transactions match filters

**Acceptance Criteria**:
- [ ] Table displays all 10 columns with proper formatting
- [ ] Clicking column header toggles sort direction
- [ ] Pagination controls allow navigation between pages
- [ ] Page size selector changes items per page

---

### FR-TXN-002: Transaction Filtering
**Priority**: High
**User Story**: As a Financial Controller, I want to filter transactions by date range, type, and location so that I can analyze specific inventory movements for audits.

**Requirements**:
- Filter by date range with calendar picker
- Quick date filters: Today, 7 Days, 30 Days, This Month
- Filter by transaction type: IN, OUT, ADJUSTMENT
- Filter by reference type: GRN, SO, ADJ, TRF, PO, WO, SR, PC, WR
- Filter by location (restricted by user permissions)
- Filter by product category
- Search across product name, code, reference, location

**Acceptance Criteria**:
- [ ] Date range picker allows from/to selection
- [ ] Quick date buttons apply predefined ranges
- [ ] Multiple transaction types can be selected
- [ ] Active filters displayed as badges with remove option
- [ ] Clear All button resets all filters

---

### FR-TXN-003: Transaction Summary Cards
**Priority**: High
**User Story**: As a Department Manager, I want to see summary metrics at a glance so that I can quickly assess inventory activity without reviewing individual transactions.

**Requirements**:
- Display 4 summary cards: Total Transactions, Total Inbound Value, Total Outbound Value, Net Change
- Update summary based on applied filters
- Show loading state while data loads
- Color-code values (green for inbound, red for outbound)

**Acceptance Criteria**:
- [ ] Cards show correct totals matching filtered data
- [ ] Net Change shows positive/negative indicator
- [ ] Loading skeleton appears during data fetch

---

### FR-TXN-004: Transaction Analytics
**Priority**: Medium
**User Story**: As an Inventory Manager, I want to see visual analytics of transaction patterns so that I can identify trends and optimize stock levels.

**Requirements**:
- Transaction Trend chart (Area chart: In/Out/Adjustment over time)
- Distribution by Type (Pie chart)
- Location Activity (Bar chart: In vs Out by location)
- Reference Type Distribution (Bar chart)
- Top Categories by Value (Bar chart)

**Acceptance Criteria**:
- [ ] Charts render with correct data from filtered results
- [ ] Tooltips show detailed values on hover
- [ ] Charts are responsive to container width

---

### FR-TXN-005: CSV Export
**Priority**: Medium
**User Story**: As a Financial Controller, I want to export transaction data to CSV so that I can perform analysis in external tools or share with auditors.

**Requirements**:
- Export button generates CSV file
- Include all filtered records (not just current page)
- CSV columns: Date, Time, Reference, Reference Type, Product Code, Product Name, Category, Location, Transaction Type, Qty In, Qty Out, Unit Cost, Total Value, Balance Before, Balance After, User
- File named with current date

**Acceptance Criteria**:
- [ ] CSV downloads with all visible columns
- [ ] Filename includes current date
- [ ] Export disabled when no records available

---

### FR-TXN-006: Location-Based Access Control
**Priority**: High
**User Story**: As a System Administrator, I want users to only see transactions for their assigned locations so that sensitive inventory data is protected.

**Requirements**:
- Filter available locations based on user's `availableLocations`
- System Administrators see all locations
- Auto-apply location filter if user has restricted access
- Location dropdown only shows permitted locations

**Acceptance Criteria**:
- [ ] Non-admin users only see their assigned locations
- [ ] Location filter respects user permissions
- [ ] No data leakage between locations

---

## 4. Reference Types

| Code | Full Name | Transaction Types | Description |
|------|-----------|-------------------|-------------|
| GRN | Goods Received Note | IN | Stock received from suppliers |
| SO | Sales Order | OUT | Stock issued for sales/service |
| ADJ | Adjustment | ADJUSTMENT | Manual stock corrections |
| TRF | Transfer | IN, OUT | Inter-location movements |
| PO | Purchase Order | IN | Expected receipts |
| WO | Write Off | OUT, ADJUSTMENT | Damaged/expired stock removal |
| SR | Store Requisition | OUT | Internal department requests |
| PC | Physical Count | IN, ADJUSTMENT | Inventory count corrections |
| WR | Wastage Report | OUT, ADJUSTMENT | Spoilage/waste recording |

---

## 5. Transaction Types

| Type | Label | Color | Description |
|------|-------|-------|-------------|
| IN | Inbound | Green | Stock entering location |
| OUT | Outbound | Red | Stock leaving location |
| ADJUSTMENT | Adjustment | Amber | Non-movement corrections |

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Page load time | < 2 seconds |
| NFR-002 | Filter response time | < 500ms |
| NFR-003 | CSV export | < 5 seconds for 1000 records |
| NFR-004 | Mobile responsive | Usable on tablet devices |

---

## 7. User Roles & Permissions

| Role | View | Filter | Export | All Locations |
|------|------|--------|--------|---------------|
| Storekeeper | Yes | Yes | Yes | No |
| Receiving Clerk | Yes | Yes | Yes | No |
| Department Manager | Yes | Yes | Yes | No |
| Inventory Manager | Yes | Yes | Yes | No |
| Financial Controller | Yes | Yes | Yes | Yes |
| System Administrator | Yes | Yes | Yes | Yes |

---

## 8. Dependencies

| Dependency | Type | Impact |
|------------|------|--------|
| User Context | Internal | Location filtering |
| GRN Module | Internal | Transaction source |
| Store Requisitions | Internal | Transaction source |
| Inventory Adjustments | Internal | Transaction source |
| Stock Transfers | Internal | Transaction source |
