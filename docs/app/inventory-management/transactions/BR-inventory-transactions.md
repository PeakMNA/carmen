# Business Requirements: Inventory Transactions

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
| 2.0.0 | 2025-01-16 | Documentation Team | Updated to current code; Corrected transaction types to IN/OUT only; Updated reference types (ST, SI); Added source evidence; Updated summary cards |
| 1.0.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. Executive Summary

### 1.1 Purpose
The Inventory Transactions module provides a unified view of all inventory movements across hotel locations. It consolidates transactions from multiple sources (GRN, Stock Transfers, Stock Issues, Adjustments, Write-offs, Physical Counts) into a single, filterable interface with analytics capabilities.

### 1.2 Business Objectives
| ID | Objective | Success Metric |
|----|-----------|----------------|
| BO-001 | Provide visibility into all inventory movements | 100% transaction capture |
| BO-002 | Enable location-based analysis | Filter by 5+ hotel locations |
| BO-003 | Support audit and compliance | Full audit trail with user attribution |
| BO-004 | Reduce investigation time | 50% faster root cause analysis |

### 1.3 Success Metrics
| Metric | Target |
|--------|--------|
| Page load time | < 2 seconds |
| Filter response time | < 500ms |
| Data accuracy | 99.9% |
| User adoption | 90% of inventory staff |

---

## 2. Functional Requirements

### FR-TXN-001: Transaction List View
**Priority**: High
**User Story**: As a Storekeeper, I want to view all inventory transactions in one place so that I can track stock movements without switching between multiple modules.

**Requirements**:
- Display transactions with: Date/Time, Reference, Product, Location, Type, Qty In/Out, Value, Balance, User
- Support sorting by Date, Reference, Product, Location, Qty In, Qty Out, Value
- Paginate results (10/25/50 per page)
- Show loading skeleton during data fetch
- Display empty state when no transactions match filters

**Source Evidence**: `page.tsx:238-243`, `components/TransactionTable.tsx:173-343`

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
- Filter by transaction type: IN, OUT
- Filter by reference type: GRN, SO, ADJ, ST, SI, PO, WO, SR, PC, WR, PR
- Filter by location (restricted by user permissions)
- Filter by product category
- Search across product name, code, reference, location, category, user

**Source Evidence**: `components/TransactionFilters.tsx:43-437`, `types.ts:48-58`

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
- Display 4 summary cards:
  - Total Transactions (with adjustment count)
  - Total Inbound Value (with units received)
  - Total Outbound Value (with units issued)
  - Net Change (with net units)
- Update summary based on applied filters
- Show loading state while data loads
- Color-code values (green for inbound, red for outbound)

**Source Evidence**: `components/TransactionSummaryCards.tsx:46-125`

**Acceptance Criteria**:
- [ ] Cards show correct totals matching filtered data
- [ ] Net Change shows positive/negative indicator with appropriate color
- [ ] Loading skeleton appears during data fetch

---

### FR-TXN-004: Transaction Analytics
**Priority**: Medium
**User Story**: As an Inventory Manager, I want to see visual analytics of transaction patterns so that I can identify trends and optimize stock levels.

**Requirements**:
- Transaction Trend chart (Area chart: Inbound/Outbound/Adjustment over time)
- Distribution by Type (Pie chart: IN/OUT)
- Location Activity (Bar chart: Inbound vs Outbound by location)
- Reference Type Distribution (Horizontal Bar chart)
- Top Categories by Value (Horizontal Bar chart, top 8)

**Source Evidence**: `components/TransactionAnalytics.tsx:61-293`

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

**Source Evidence**: `page.tsx:97-154`

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

**Source Evidence**: `page.tsx:43-56`, `page.tsx:66-81`

**Acceptance Criteria**:
- [ ] Non-admin users only see their assigned locations
- [ ] Location filter respects user permissions
- [ ] No data leakage between locations

---

### FR-TXN-007: Tab Navigation
**Priority**: Medium
**User Story**: As an Inventory Manager, I want to switch between transaction list and analytics views so that I can access different perspectives of the data.

**Requirements**:
- Two tabs: Transactions, Analytics
- Tab state persists during session
- Tab switch updates displayed content

**Source Evidence**: `page.tsx:226-257`

**Acceptance Criteria**:
- [ ] Both tabs are accessible and clickable
- [ ] Tab content switches correctly
- [ ] Active tab is visually indicated

---

## 3. Reference Types

| Code | Full Name | IN Types | OUT Types | Description |
|------|-----------|----------|-----------|-------------|
| GRN | Goods Received Note | IN | - | Stock received from suppliers |
| SC | Sales Consumption | - | OUT | Ingredient stock consumed from POS menu sales (system-generated per shift). See [store-operations/sales-consumption](../../store-operations/sales-consumption/INDEX-sales-consumption.md) |
| SO | Sales Order | - | OUT | Stock issued for sales/service (legacy reference type; SC supersedes this for POS-driven consumption) |
| ADJ | Adjustment | IN | OUT | Manual stock corrections |
| ST | Stock Transfer | IN | OUT | Inter-location movements |
| SI | Stock Issue | - | OUT | Stock issued from store requisitions |
| PO | Purchase Order | IN | - | Expected receipts (legacy) |
| WO | Write Off | - | OUT | Damaged/expired stock removal |
| SR | Store Requisition | - | OUT | Internal department requests |
| PC | Physical Count | IN | OUT | Inventory count corrections |
| WR | Wastage Report | - | OUT | Spoilage/waste recording |
| PR | Purchase Request | - | - | Request document (no transactions) |

**Source Evidence**: `types.ts:6`, `types.ts:103-115`

---

## 4. Transaction Types

| Type | Label | Color | Background | Description |
|------|-------|-------|------------|-------------|
| IN | Inbound | Green | bg-green-100 text-green-800 | Stock entering location |
| OUT | Outbound | Red | bg-red-100 text-red-800 | Stock leaving location |

**Note**: Only IN and OUT transaction types exist. Adjustments are recorded as either IN (positive) or OUT (negative) with referenceType = 'ADJ'.

**Source Evidence**: `types.ts:7`, `types.ts:118-121`

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Page load time | < 2 seconds |
| NFR-002 | Filter response time | < 500ms |
| NFR-003 | CSV export | < 5 seconds for 1000 records |
| NFR-004 | Mobile responsive | Usable on tablet devices |
| NFR-005 | Chart rendering | < 1 second |

---

## 6. User Roles & Permissions

| Role | View | Filter | Export | All Locations |
|------|------|--------|--------|---------------|
| Storekeeper | Yes | Yes | Yes | No |
| Receiving Clerk | Yes | Yes | Yes | No |
| Department Manager | Yes | Yes | Yes | No |
| Inventory Manager | Yes | Yes | Yes | No |
| Financial Controller | Yes | Yes | Yes | Yes |
| System Administrator | Yes | Yes | Yes | Yes |

---

## 7. Dependencies

| Dependency | Type | Impact |
|------------|------|--------|
| User Context | Internal | Location filtering |
| GRN Module | Internal | Transaction source (IN) |
| Stock Transfers | Internal | Transaction source (IN/OUT) |
| Stock Issues | Internal | Transaction source (OUT) |
| Store Requisitions | Internal | Transaction source (OUT) |
| Physical Counts | Internal | Transaction source (IN/OUT) |
| Wastage Reports | Internal | Transaction source (OUT) |
| Inventory Adjustments | Internal | Transaction source (IN/OUT) |

---

## Related Documents

- [TS-inventory-transactions.md](./TS-inventory-transactions.md) - Technical Specification
- [FD-inventory-transactions.md](./FD-inventory-transactions.md) - Flow Diagrams
- [UC-inventory-transactions.md](./UC-inventory-transactions.md) - Use Cases
- [VAL-inventory-transactions.md](./VAL-inventory-transactions.md) - Validations
