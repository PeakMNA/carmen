# Stock Replenishment Documentation

**Module**: Store Operations
**Sub-Module**: Stock Replenishment
**Status**: PROPOSED (Implementation in Planning Phase)
**Last Updated**: 2025-12-05

---

## 📋 Quick Links

| Document | Description | Status |
|----------|-------------|--------|
| [Business Requirements](./BR-stock-replenishment.md) | Business rules, workflows, and backend requirements | ✅ Complete |
| [Use Cases](./UC-stock-replenishment.md) | User workflows and actor interactions | ✅ Complete |
| [Technical Specification](./TS-stock-replenishment.md) | System architecture and implementation details | ✅ Complete |
| [Data Definition](./DD-stock-replenishment.md) | Database schema and entity relationships | ✅ Complete |
| [Flow Diagrams](./FD-stock-replenishment.md) | Visual workflow diagrams (Mermaid 8.8.2) | ✅ Complete |
| [Validations](./VAL-stock-replenishment.md) | Validation rules and Zod schemas | ✅ Complete |

---

## 📌 Overview

The **Stock Replenishment** module enables proactive inventory management through automated monitoring, intelligent recommendations, and efficient inter-location stock transfers. It helps prevent stockouts while optimizing inventory levels across all operational locations.

**Key Capabilities**:
- ✅ **Par Level Management**: Configure target inventory levels per product/location
- ✅ **Automated Monitoring**: Real-time stock level tracking against reorder points
- ✅ **Smart Recommendations**: AI-driven replenishment suggestions based on consumption patterns
- ✅ **Request Workflows**: Multi-tier approval processes for stock transfer requests
- ✅ **Stock Transfers**: End-to-end transfer execution from warehouse to locations
- ✅ **Consumption Analytics**: Pattern analysis and forecasting
- ✅ **Emergency Procedures**: Expedited workflows for critical stockouts

---

## ⚠️ Implementation Status

**Current State**: PROPOSED - Design Complete, Implementation Pending

**What EXISTS**:
- ✅ UI Dashboard (`app/(main)/store-operations/components/stock-replenishment.tsx`)
  - Basic replenishment dashboard with hardcoded mock data
  - Item display with current stock, par levels, reorder points
  - Suggested order quantity calculations
  - Filter and sort capabilities

**What's PROPOSED (Not Yet Implemented)**:
- ❌ Database schema (6 tables)
- ❌ TypeScript interfaces in centralized `/lib/types/`
- ❌ Mock data in centralized `/lib/mock-data/`
- ❌ Server actions for business logic
- ❌ Zod validation schemas
- ❌ Real-time inventory monitoring system
- ❌ Automated recommendation engine
- ❌ Replenishment request workflows
- ❌ Stock transfer execution system
- ❌ Consumption pattern analysis
- ❌ Emergency replenishment procedures
- ❌ System integrations (inventory, purchasing, workflow engine)

**Implementation Roadmap**:
1. **Phase 1 - Foundation**: Database schema, type definitions, mock data infrastructure
2. **Phase 2 - Core Features**: Par level configuration, monitoring, recommendations
3. **Phase 3 - Workflows**: Request creation, approval workflows, transfer execution
4. **Phase 4 - Analytics**: Consumption analysis, reporting, insights
5. **Phase 5 - Integrations**: Inventory, purchasing, workflow engine connections

---

## 🎯 Business Context

### Problem Statement
Hotels face challenges maintaining optimal inventory levels across multiple operational locations (kitchens, bars, outlets). Common issues include:
- Unexpected stockouts during service hours
- Over-ordering leading to wastage and capital tie-up
- Manual monitoring requiring constant attention
- Inefficient transfer processes between central warehouse and locations
- Lack of visibility into consumption patterns

### Solution Benefits
- **60% reduction** in stockout incidents through proactive monitoring
- **30% reduction** in excess inventory and associated carrying costs
- **40% reduction** in wastage from over-ordering perishables
- **75% reduction** in emergency purchase orders
- **50% improvement** in stock transfer efficiency

---

## 🔄 Core Workflows

### 1. Par Level Configuration
**Owner**: Store Manager
**Description**: Configure target inventory levels (par) for items at each location based on usage patterns, storage capacity, and lead times.

**Key Features**:
- System-suggested par levels based on historical consumption
- Approval workflow for significant changes (>20%)
- Automatic calculation of reorder points and minimum levels
- Seasonal adjustment capabilities

[→ View Detailed Workflow](./UC-stock-replenishment.md#uc-srep-001-configure-par-level-for-new-item)

---

### 2. Automated Inventory Monitoring
**Owner**: System (Automated)
**Description**: Continuous real-time monitoring of stock levels with automatic alert generation when items fall below reorder points.

**Alert Levels**:
- 🔴 **Critical**: < 30% of par (minimum level) - 4-hour SLA
- 🟡 **Standard**: < 40% of par (reorder point) - 24-hour SLA
- 🔵 **Pattern Change**: Consumption ±25% over 7 days - 7-day SLA

[→ View Monitoring Flow](./FD-stock-replenishment.md#automated-inventory-monitoring-flow)

---

### 3. Transfer Request Creation
**Owner**: Store Manager
**Description**: Create formal transfer requests either from system recommendations or manually for ad-hoc needs.

**Process Steps**:
1. Review dashboard recommendations
2. Select items and quantities
3. Add justification and required-by date
4. Submit for warehouse approval

**Approval Tiers**:
- Tier 1 (<$1,000): Warehouse Manager only
- Tier 2 ($1,000-$5,000): Warehouse + Department Manager
- Tier 3 (>$5,000): Warehouse + Department + Finance
- Tier 4 (Emergency): Department Manager pre-approval required

[→ View Request Creation Flow](./FD-stock-replenishment.md#replenishment-request-creation-flow)

---

### 4. Request Approval
**Owner**: Warehouse Manager
**Description**: Warehouse Manager reviews requests, verifies stock availability, and approves/rejects with partial fulfillment support.

**Decision Criteria**:
- Warehouse stock availability
- Request priority and urgency
- Requesting location's par level configuration
- Pending transfers to same location

[→ View Approval Process](./FD-stock-replenishment.md#replenishment-request-approval-flow)

---

### 5. Stock Transfer Execution
**Owner**: Warehouse Staff
**Description**: Pick, pack, and dispatch items from warehouse to requesting location with quality checks and batch tracking.

**Quality Gates**:
- Location verification
- Batch/lot verification (FIFO/FEFO)
- Quality inspection
- Final QC before dispatch

[→ View Transfer Execution Flow](./FD-stock-replenishment.md#stock-transfer-execution-flow)

---

### 6. Transfer Receipt
**Owner**: Store Manager
**Description**: Receive and confirm stock transfer at destination location with mobile app support for easy verification.

**Receipt Checks**:
- Visual condition inspection
- Quantity verification
- Batch/lot matching
- Expiry date validation
- Temperature checks (for sensitive items)

[→ View Receipt Flow](./FD-stock-replenishment.md#stock-transfer-receipt-flow)

---

### 7. Emergency Replenishment
**Owner**: Store Manager + Warehouse Manager
**Description**: Expedited process for critical stockouts requiring immediate replenishment.

**Emergency Criteria**:
- Immediate service impact
- Confirmed customer orders affected
- Alternatives exhausted
- Within emergency request limits (max 2/week)

[→ View Emergency Flow](./FD-stock-replenishment.md#emergency-replenishment-flow)

---

## 🔌 System Integrations

### Inventory Management System
**Integration Type**: Direct database access + event-driven

**Key Integration Points**:
- Real-time stock level queries
- Transfer transaction creation (issue + receipt)
- Batch/lot tracking
- FIFO/FEFO/Weighted Average costing methods

**Required Shared Methods**:
- `getStockLevel(productId, locationId)` - Current stock with FIFO/FEFO details
- `reserveStock()` - Reserve for pending transfers
- `createTransferIssue()` - Issue inventory from warehouse
- `createTransferReceipt()` - Receive at destination
- `getConsumptionHistory()` - For consumption analytics
- `applyInventoryValuation()` - FIFO/FEFO/Weighted Average costing

[→ View Integration Architecture](./BR-stock-replenishment.md#92-integration-with-inventory-management-system)

---

### Workflow Engine
**Integration Type**: API calls + webhook callbacks

**Workflow Types**:
- **Auto-Approve**: Low-value, routine requests
- **Sequential**: Multi-level approvals required
- **Parallel**: Concurrent approvers at same level
- **Hybrid**: Mixed sequential and parallel

[→ View Workflow Integration](./BR-stock-replenishment.md#93-integration-with-workflow-engine)

---

### Purchasing System
**Integration Type**: Event-driven + API calls

**Integration Purpose**: Alert purchasing when warehouse stock falls below reorder points, enabling automatic purchase request creation.

[→ View Purchasing Integration](./FD-stock-replenishment.md#purchasing-integration-flow)

---

## 📊 Data Model

### Core Entities

**Par Level Configuration** (`tb_par_level_config`)
- Stores target inventory levels per product/location
- Includes reorder points, minimum levels, safety stock
- Tracks approval status and justification for changes

**Transfer Request** (`tb_replenishment_request`)
- Request header with status, priority, dates
- Links to approval workflow instances
- Tracks total value and estimated costs

**Transfer Request Detail** (`tb_replenishment_request_detail`)
- Individual line items with requested quantities
- Approved vs requested quantity tracking
- Item-level notes and rejection reasons

**Stock Transfer** (`tb_stock_transfer`)
- Transfer document header linking to source request
- Tracks dispatch, transit, receipt status
- Includes scheduled dates and actual completion

**Stock Transfer Detail** (`tb_stock_transfer_detail`)
- Line items with batch/lot tracking
- Quality check results and condition notes
- Received vs shipped quantity tracking

**Consumption Pattern** (`tb_consumption_pattern`)
- Cached analytics updated daily
- Average daily consumption, peak consumption
- Trend analysis and variability metrics

[→ View Complete Schema](./DD-stock-replenishment.md)

---

## 🎨 User Interface

### Current Implementation
**Location**: `app/(main)/store-operations/components/stock-replenishment.tsx`

**Features**:
- ✅ Dashboard with item list
- ✅ Current stock vs par level display
- ✅ Suggested order quantity calculation
- ✅ Filter by location and usage
- ✅ Sort by multiple criteria
- ✅ Status indicators (Critical, Low, OK)

**Limitations**:
- Uses hardcoded mock data (2 items only)
- No real-time updates
- No actual request creation
- No integration with backend

### Planned Enhancements
- Real-time dashboard with live inventory updates
- Advanced filtering and search
- Interactive recommendation acceptance/rejection
- Drag-and-drop request creation
- Mobile-optimized receipt interface
- Consumption analytics charts and trends

---

## 🔐 Security & Permissions

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Store Manager** | Configure par levels (own location), create requests, receive transfers, view analytics |
| **Warehouse Manager** | Approve requests, manage transfers, view all locations, configure warehouse par levels |
| **Department Manager** | Approve high-value requests, approve par level changes, view department analytics |
| **Purchasing Manager** | View warehouse alerts, create purchase requests, track incoming stock |
| **Warehouse Staff** | Execute transfers, update dispatch status, record quality checks |

### Data Security
- Encryption at rest for sensitive data
- Audit logging for all approval actions
- Role-based data filtering (users see only their locations)
- Secure API endpoints with authentication

---

## 📈 Analytics & Reporting

### Consumption Analytics
**Frequency**: Daily automated analysis

**Metrics Tracked**:
- Average daily consumption
- Peak daily consumption
- Consumption trend (increasing/decreasing/stable)
- Days of supply
- Stock turnover ratio
- Slow-moving item identification (turnover <2)
- Fast-moving item identification (turnover >8)

[→ View Consumption Analysis Flow](./FD-stock-replenishment.md#consumption-pattern-analysis-flow)

---

### Performance Metrics
- Stockout frequency and duration
- Emergency request frequency
- Transfer fulfillment time (warehouse → location)
- Request approval time
- Par level accuracy (actual vs target)
- Wastage reduction
- Inventory carrying cost reduction

---

## 🛠️ Backend Requirements

### Server Actions Required
**Par Level Management** (4 actions):
- `createParLevel()`, `updateParLevel()`, `getParLevelsByLocation()`, `approveParLevelChange()`

**Inventory Monitoring** (3 actions):
- `monitorInventoryLevels()`, `generateReplenishmentRecommendations()`, `getActiveAlerts()`

**Transfer Requests** (4 actions):
- `createTransferRequest()`, `submitTransferRequest()`, `approveTransferRequest()`, `getTransferRequests()`

**Stock Transfers** (4 actions):
- `createStockTransfer()`, `updateTransferStatus()`, `confirmTransferReceipt()`, `getStockTransfers()`

**Consumption Analytics** (3 actions):
- `analyzeConsumptionPatterns()`, `generateConsumptionReport()`, `identifySlowMovingItems()`

[→ View Complete Backend Requirements](./BR-stock-replenishment.md#9-backend-implementation-requirements)

---

### Scheduled Jobs
1. **Inventory Monitoring Job** (every 5 minutes)
2. **Consumption Analysis Job** (daily at 2:00 AM)
3. **Par Level Suggestion Job** (weekly on Sundays)
4. **Transfer Timeout Monitor** (hourly)

---

## 🧪 Validation Rules

### Business Rules Validation
- Par level must be greater than 0
- Par level must not exceed location storage capacity
- Reorder point typically 40% of par level
- Minimum level typically 30% of par level
- Request quantities must be positive integers
- Required-by date must be in the future
- Emergency requests limited to 2 per week per location

[→ View Complete Validation Rules](./VAL-stock-replenishment.md)

---

## 📚 Related Documentation

### Within Store Operations
- [Store Requisitions](../store-requisitions/INDEX-store-requisitions.md) - Department requests from central stores
- [Wastage Tracking](../wastage-tracking/) - Inventory wastage recording and analysis

### Other Modules
- [Inventory Management](../../inventory-management/) - Core inventory functionality
- [Procurement](../../procurement/) - External purchasing and supplier management
- [Vendor Management](../../vendor-management/) - Vendor profiles and relationships

### Shared Methods
- [Inventory Operations](../../shared-methods/inventory-operations/SM-inventory-operations.md) - FIFO/FEFO/Weighted Average methods
- [Costing Methods](../../shared-methods/inventory-valuation/SM-costing-methods.md) - Inventory valuation techniques

---

## 🤝 Contributing

This documentation is maintained by the Development Team. For questions or updates:
- **Business Questions**: Contact Operations Team
- **Technical Questions**: Contact Development Team
- **Documentation Updates**: Submit PR or create issue in repository

---

## 📝 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-05 | Documentation Team | Initial centralized navigation page created |

---

**Document Control**:
- **Created**: 2025-12-05
- **Author**: Documentation Team
- **Reviewed By**: Operations Manager, Warehouse Manager
- **Next Review**: 2026-01-05

---

> **Note**: This is the central navigation hub for Stock Replenishment documentation. Select a document from the Quick Links table above to dive into specific details.
