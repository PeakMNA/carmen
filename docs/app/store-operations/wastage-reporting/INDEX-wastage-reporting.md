# Wastage Reporting Documentation

**Module**: Store Operations
**Sub-Module**: Wastage Reporting
**Status**: PROPOSED (Implementation in Planning Phase)
**Last Updated**: 2025-12-05

---

## 📋 Quick Links

| Document | Description | Status |
|----------|-------------|--------|
| [Business Requirements](./BR-wastage-reporting.md) | Business rules, workflows, and backend requirements | ✅ Complete |
| [Use Cases](./UC-wastage-reporting.md) | User workflows and actor interactions | ✅ Complete |
| [Technical Specification](./TS-wastage-reporting.md) | System architecture and implementation details | ✅ Complete |
| [Data Definition](./DD-wastage-reporting.md) | Database schema and entity relationships | ✅ Complete |
| [Flow Diagrams](./FD-wastage-reporting.md) | Visual workflow diagrams (Mermaid 8.8.2) | ✅ Complete |
| [Validations](./VAL-wastage-reporting.md) | Validation rules and Zod schemas | ✅ Complete |

---

## 📌 Overview

The **Wastage Reporting** module provides a comprehensive system for recording, categorizing, approving, and analyzing food and beverage wastage across restaurant locations. It transforms wastage from a hidden cost into actionable intelligence through detailed tracking, photo evidence, multi-level approvals, and automatic inventory adjustments.

**Key Capabilities**:
- ✅ **Wastage Recording**: Quick, intuitive wastage capture with product search, barcode scanning, and photo evidence
- ✅ **Multi-Level Approvals**: Value-based approval workflows (Department Manager → Store Manager → Finance Manager)
- ✅ **Photo Evidence**: Mandatory photos for high-value wastage (>$100) with watermarking and secure storage
- ✅ **Automatic Inventory Adjustment**: Real-time inventory updates when wastage approved (FIFO/FEFO/Weighted Average)
- ✅ **Comprehensive Analytics**: Wastage trends, patterns, anomaly detection, and predictive insights
- ✅ **Supplier Quality Tracking**: Track and report supplier-related wastage for vendor performance management
- ✅ **Batch Wastage**: Record multiple products in single transaction (end-of-day buffet, spoilage batches)
- ✅ **Mobile Support**: Mobile-optimized interface with camera integration for on-the-spot recording

---

## ⚠️ Implementation Status

**Current State**: PROPOSED - Design Complete, Implementation Minimal (~5%)

**What EXISTS**:
- ✅ Basic UI Dashboard (`app/(main)/store-operations/components/wastage-reporting.tsx`) - 244 lines
  - Hardcoded mock data (2 wastage records inline)
  - Basic charts (monthly trend line chart, wastage by reason pie chart)
  - Summary statistics (total wastage, items written off, pending reviews)
  - Wastage records table with filters

**What's PROPOSED (Not Yet Implemented)**:
- ❌ Database schema (5 tables: wastage_header, wastage_line_item, wastage_photo, wastage_approval, wastage_configuration)
- ❌ TypeScript interfaces in centralized `/lib/types/`
- ❌ Mock data in centralized `/lib/mock-data/`
- ❌ Server actions for business logic (19 actions across 6 categories)
- ❌ Zod validation schemas (12 comprehensive validation schemas)
- ❌ Photo upload and storage system (cloud storage, watermarking, compression)
- ❌ Multi-level approval workflows (auto-approve, sequential, parallel)
- ❌ Automatic inventory adjustments (FIFO/FEFO/Weighted Average costing)
- ❌ Financial system integration (GL posting, COGS calculation)
- ❌ Supplier quality tracking and vendor complaint creation
- ❌ Batch wastage recording (multiple products in single transaction)
- ❌ Mobile-optimized interface (barcode scanning, camera integration)
- ❌ Analytics and reporting (trend analysis, anomaly detection, predictive insights)
- ❌ Scheduled jobs (daily summaries, approval escalation, photo archival, anomaly detection)
- ❌ All functional requirements (FR-WAST-001 through FR-WAST-015)

**Implementation Roadmap**:
1. **Phase 1 - Foundation**: Database schema, type definitions, mock data infrastructure, photo storage setup
2. **Phase 2 - Core Recording**: Wastage transaction recording, photo upload, basic validation
3. **Phase 3 - Workflows**: Multi-level approval workflows, inventory integration, GL posting
4. **Phase 4 - Analytics**: Wastage analytics, trend analysis, anomaly detection, reporting
5. **Phase 5 - Advanced Features**: Batch wastage, supplier quality tracking, mobile optimization, predictive insights

---

## 🎯 Business Context

### Problem Statement
Hospitality operations face significant wastage-related challenges:
- **Hidden Costs**: Wastage represents 4-10% of COGS but often goes untracked
- **Inventory Inaccuracy**: Unrecorded wastage creates discrepancies between physical and system stock
- **Accountability Gaps**: Lack of tracking makes it difficult to identify root causes or responsible parties
- **Fraud Risk**: Without photo evidence and approval controls, wastage can be falsified to cover theft
- **Supplier Issues**: Quality-related wastage not tracked, preventing vendor performance discussions
- **Compliance Gaps**: Insufficient audit trails for insurance claims and regulatory requirements

### Solution Benefits
- **20% reduction** in total wastage costs within 12 months through trend analysis and root cause elimination
- **30% reduction** in inventory variance through automatic inventory adjustments
- **50% reduction** in supplier quality-related wastage through vendor performance management
- **75% reduction** in fraud incidents through photo evidence and anomaly detection
- **25% reduction** in financial close time through real-time wastage data
- **ROI recovery** within 18 months through wastage reduction and efficiency gains

---

## 🔄 Core Workflows

### 1. Record Wastage Transaction
**Owner**: Kitchen Staff, Store Managers
**Description**: Quick wastage recording with product selection, quantity entry, category selection, reason description, and photo attachment.

**Key Features**:
- Product search by code, name, or barcode scanning
- Automatic unit cost retrieval and total value calculation
- 13 wastage categories with sub-categories (Spoilage, Overproduction, Preparation Error, Expired, etc.)
- Minimum 20-character reason description
- Up to 5 photos per transaction (mandatory for >$100 value)
- Responsible party selection for accountability
- Supplier quality issue flagging for vendor-related wastage

[→ View Detailed Workflow](./UC-wastage-reporting.md#uc-wast-001-record-single-product-wastage)

---

### 2. Multi-Level Approval Workflow
**Owner**: Department Manager, Store Manager, Finance Manager
**Description**: Value-based approval routing with auto-approval for low-value wastage, sequential approvals for high-value transactions.

**Approval Tiers**:
- **Auto-Approve**: <$50 (or expired items within 24 hours of expiry)
- **Tier 1**: $50-$200 → Department Manager
- **Tier 2**: $200-$500 → Store Manager
- **Tier 3**: >$500 → Store Manager + Finance Manager

**Approval Actions**:
- **Approve**: Full quantity approved, inventory adjusted immediately
- **Partially Approve**: Reduce quantity, return remaining to draft for resubmission
- **Reject**: Reject with mandatory reason (minimum 30 characters), new transaction must be created

[→ View Approval Process](./FD-wastage-reporting.md#approval-workflow-process)

---

### 3. Photo Upload and Evidence Management
**Owner**: Kitchen Staff (recorder), Approvers (reviewer)
**Description**: Secure photo upload with compression, watermarking, and cloud storage for audit trail and fraud prevention.

**Photo Requirements**:
- Mandatory for wastage >$100 (minimum 1 photo), >$500 (minimum 2 photos from different angles)
- Supported formats: JPG, PNG, HEIC (mobile photos)
- Maximum 10MB per photo (compressed to 500KB target on upload)
- Automatic watermarking with date, time, location, user
- Secure cloud storage with encryption (AES-256 at rest, TLS 1.2+ in transit)
- Signed URLs with 1-hour expiration for viewing
- 7-year retention for audit compliance

[→ View Photo Upload Flow](./FD-wastage-reporting.md#photo-upload-process-flow)

---

### 4. Automatic Inventory Adjustment
**Owner**: System (Automated)
**Description**: Automatic inventory reduction when wastage approved, respecting inventory costing method (FIFO/FEFO/Weighted Average).

**Adjustment Process**:
1. Wastage approval triggers inventory adjustment creation
2. Stock validation (verify sufficient quantity exists)
3. Cost calculation using configured costing method
4. Inventory transaction creation reducing stock
5. Inventory valuation update (reduce asset value)
6. GL posting (wastage expense to appropriate GL account)
7. Transaction linking (wastage → inventory adjustment → GL entry)

**Costing Methods**:
- **FIFO**: Oldest stock first for non-perishables
- **FEFO**: Nearest-expiry first for perishables
- **Weighted Average**: Average cost across all batches

[→ View Inventory Integration](./FD-wastage-reporting.md#inventory-integration-flow)

---

### 5. Wastage Analytics and Reporting
**Owner**: Store Managers, Operations Managers, Finance Managers
**Description**: Comprehensive analytics identifying wastage trends, patterns, anomalies, and opportunities for reduction.

**Analytics Capabilities**:
- **KPIs**: Total wastage value, wastage as % of COGS, wastage per transaction, wastage reduction vs prior period
- **Trend Analysis**: Line charts showing wastage over time by category, product, location, responsible party
- **Pareto Analysis**: Top 10 wasted products by value and quantity (80/20 rule)
- **Anomaly Detection**: Statistical analysis detecting outliers (>3 standard deviations from mean)
- **Seasonal Patterns**: Correlation with sales volume, weather, events, day of week, hour of day
- **Predictive Insights**: Forecasting expected wastage based on historical patterns, alerting when actual exceeds forecast

**Standard Reports**:
- Daily Wastage Summary, Wastage by Category, Wastage by Product, Wastage by Location, Wastage by Responsible Party, High-Value Wastage (>$100), Trend Analysis (YoY, MoM), Supplier Quality Issues

[→ View Analytics Details](./BR-wastage-reporting.md#fr-wast-010-analyze-wastage-trends-and-patterns)

---

### 6. Supplier Quality Tracking
**Owner**: Purchasing Staff, Store Managers
**Description**: Track wastage attributed to supplier quality problems for vendor performance discussions and quality improvement initiatives.

**Tracking Features**:
- Flag wastage as "supplier quality issue" during recording
- Select supplier from vendor master data
- Specify quality problem type (Incorrect specification, Damaged in transit, Short shelf life, Poor freshness, Wrong product, Contamination, Packaging defect)
- Attach photos and detailed description as evidence
- Link to GRN and lot number for traceability
- Generate supplier quality wastage reports
- Create supplier complaint/quality report directly from wastage transaction

**Supplier Quality Metrics**:
- Total wastage value by supplier
- Wastage as % of purchases from supplier
- Quality issue frequency by supplier
- Supplier comparison based on quality-related wastage

[→ View Supplier Quality Integration](./BR-wastage-reporting.md#fr-wast-012-track-supplier-quality-issues)

---

### 7. Batch Wastage Recording
**Owner**: Kitchen Staff, Store Managers
**Description**: Record multiple products in single batch transaction for end-of-day wastage, buffet leftovers, or spoilage batches.

**Batch Recording Features**:
- Single header with common information (date, location, overall reason)
- Multiple line items (each with product, quantity, category, reason, photos)
- Batch templates for common scenarios (e.g., "End of Day Buffet")
- Copy line items from previous batches
- Individual line item approval/rejection
- Total batch value calculation
- Separate inventory adjustments for each line item after approval

[→ View Batch Wastage Flow](./FD-wastage-reporting.md#batch-wastage-process-flow)

---

## 🔌 System Integrations

### Inventory Management System
**Integration Type**: Direct database access + event-driven

**Key Integration Points**:
- Real-time stock level queries for validation
- Automatic inventory adjustment creation (issue transaction reducing stock)
- Batch/lot tracking with FIFO/FEFO support
- Inventory valuation updates (reduce asset value)
- COGS calculation and expense recognition

**Required Shared Methods**:
- `getStockLevel(productId, locationId)` - Current stock with batch details
- `reserveStock()` - Reserve for pending approval
- `createInventoryAdjustment()` - Issue transaction reducing stock
- `getConsumptionHistory()` - For anomaly detection
- `applyInventoryValuation()` - FIFO/FEFO/Weighted Average costing

[→ View Integration Architecture](./BR-wastage-reporting.md#92-integration-with-inventory-management-system)

---

### Workflow Engine
**Integration Type**: API calls + webhook callbacks

**Workflow Types**:
- **Auto-Approve**: Low-value wastage (<$50) or expired items within 24 hours
- **Sequential**: Multi-level approvals (Department Manager → Store Manager → Finance Manager)
- **Parallel**: Concurrent approvers at same level (future enhancement)

**Workflow API Calls**:
- `createWorkflowInstance()` - Create approval workflow
- `routeToNextApprover()` - Advance to next approval level
- `handleApprovalAction()` - Record approval action
- `checkWorkflowStatus()` - Query current status
- `delegateApproval()` - Temporary delegation

[→ View Workflow Integration](./BR-wastage-reporting.md#93-integration-with-workflow-engine)

---

### Financial System
**Integration Type**: API calls for GL posting

**Integration Purpose**: Post approved wastage to appropriate GL accounts for expense recognition and COGS calculation.

**GL Posting Details**:
- Wastage expense account (debit) based on category
- Inventory asset account (credit) reducing inventory value
- Cost center/department allocation
- Journal entry with wastage transaction reference for audit trail
- Period cutoff date respect (no posting to closed periods)
- Reversal postings for rejected wastage or corrections

[→ View Financial Integration](./BR-wastage-reporting.md#fr-wast-015-integrate-with-financial-system)

---

## 📊 Data Model

### Core Entities

**Wastage Header** (`tb_wastage_header`): Main wastage transaction with status, approval level, financial totals, and audit trail

**Wastage Line Item** (`tb_wastage_line_item`): Individual products wasted supporting batch transactions with quantity, cost, and approval details

**Wastage Photo** (`tb_wastage_photo`): Photo attachments with metadata (file path, watermark info, capture details, device info)

**Wastage Approval** (`tb_wastage_approval`): Approval workflow history with approver, action, comments, and response time tracking

**Wastage Configuration** (`tb_wastage_configuration`): System configuration for approval thresholds, alert rules, and category settings

[→ View Complete Schema](./DD-wastage-reporting.md)

---

## 🎨 User Interface

### Current Implementation
**Location**: `app/(main)/store-operations/components/wastage-reporting.tsx`

**Features**:
- ✅ Dashboard with summary statistics (total wastage, items written off, pending reviews)
- ✅ Monthly wastage trend line chart (6 months data)
- ✅ Wastage by reason pie chart (Expiration, Damage, Quality Issues, Other)
- ✅ Wastage records table with search and filters
- ✅ Status badges (Pending Review, Approved)

**Limitations**:
- Uses hardcoded mock data (2 wastage records only)
- No real-time updates
- No actual wastage recording functionality
- No photo upload
- No approval workflow
- No integration with backend

### Planned Enhancements
- Real-time wastage recording form with product search and barcode scanning
- Photo capture and upload with compression and watermarking
- Mobile-optimized interface with camera integration
- Approval interface for managers
- Advanced analytics with drill-down capabilities
- Supplier quality tracking interface
- Batch wastage recording templates

---

## 🔐 Security & Permissions

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Kitchen Staff** | Record wastage for assigned location, attach photos, view own wastage history |
| **Store Manager** | Record wastage, approve Tier 1 (<$200), receive supplier complaints, view location analytics |
| **Department Manager** | Approve Tier 1 and Tier 2 ($200-$500), view department analytics, configure category settings |
| **Finance Manager** | Approve Tier 3 (>$500), view all wastage, export financial reports, configure GL mapping |
| **Purchasing Manager** | View supplier quality wastage, create vendor complaints, analyze supplier performance |
| **System Administrator** | Configure approval thresholds, alert rules, category settings, user permissions |

### Data Security
- Row-level security (RLS) ensuring users access only wastage for their assigned locations
- Photo encryption at rest (AES-256) and in transit (TLS 1.2+)
- Audit logging for all wastage creation, approval, and modification actions
- Signed photo URLs with 1-hour expiration preventing unauthorized access
- Malware scanning for photo uploads

---

## 📈 Analytics & Reporting

### Consumption Analytics
**Frequency**: Daily automated analysis at 1:00 AM

**Metrics Tracked**:
- Average daily wastage by product, category, location
- Peak wastage days and times
- Wastage trends (increasing/decreasing/stable)
- Wastage as % of COGS
- Wastage per customer served
- High-wastage products (by value and quantity)
- Low-wastage products (best performers)

### Performance Metrics
- **Efficiency**: Average wastage recording time (<2 minutes target), approval cycle time (<24 hours target)
- **Adoption**: User adoption rate, transaction volume, photo evidence compliance
- **Business Impact**: Total wastage reduction vs baseline, wastage as % of COGS, supplier quality improvement
- **Quality**: Data completeness (>95% target), same-day recording (>90% target), inventory accuracy improvement

---

## 🛠️ Backend Requirements

### Server Actions Required (19 actions across 6 categories)

**Wastage Transaction Management** (5 actions):
- createWastageTransaction, submitWastageForApproval, updateWastageTransaction, deleteWastageTransaction, getWastageTransactions

**Approval Workflow Management** (3 actions):
- approveWastageTransaction, partiallyApproveWastage, rejectWastageTransaction

**Inventory Integration** (3 actions):
- createInventoryAdjustmentFromWastage, validateStockAvailability, getProductCostForWastage

**Photo Management** (2 actions):
- uploadWastagePhoto, deleteWastagePhoto

**Analytics and Reporting** (4 actions):
- getWastageDashboardMetrics, analyzeWastagePatterns, generateWastageReport, getSupplierQualityWastage

**Configuration Management** (2 actions):
- getWastageConfiguration, updateWastageConfiguration

[→ View Complete Backend Requirements](./BR-wastage-reporting.md#9-backend-implementation-requirements)

---

### Scheduled Jobs (4 background jobs)

1. **Daily Wastage Summary Job** (daily at 2:00 AM): Aggregate wastage data, calculate KPIs, generate daily summary reports
2. **Pending Approval Escalation Job** (hourly 6 AM - 11 PM): Escalate overdue approvals >48 hours
3. **Photo Archive Job** (daily at 3:00 AM): Move photos >2 years to cold storage for cost optimization
4. **Wastage Anomaly Detection Job** (daily at 1:00 AM): Identify unusual wastage patterns, generate fraud alerts

---

## 🧪 Validation Rules

### Business Rules Validation
- Wastage must be recorded within 24 hours of occurrence (7-day max backdate with approval)
- Wastage quantity cannot exceed current stock-on-hand
- Photo mandatory for wastage >$100 (minimum 1), >$500 (minimum 2)
- Reason description minimum 20 characters, maximum 500 characters
- Users cannot approve their own wastage transactions
- Approval must be completed within 48 business hours (auto-escalation after 48 hours)

[→ View Complete Validation Rules](./VAL-wastage-reporting.md)

---

## 📚 Related Documentation

### Within Store Operations
- [Stock Replenishment](../stock-replenishment/INDEX-stock-replenishment.md) - Proactive inventory management and inter-location transfers
- [Store Requisitions](../store-requisitions/INDEX-store-requisitions.md) - Department requests from central stores

### Other Modules
- [Inventory Management](../../inventory-management/) - Core inventory functionality and costing methods
- [Procurement](../../procurement/) - External purchasing and supplier management
- [Vendor Management](../../vendor-management/) - Vendor profiles and performance tracking
- [Finance](../../finance/) - GL posting, COGS calculation, financial reporting

### Shared Methods
- [Inventory Operations](../../shared-methods/inventory-operations/SM-inventory-operations.md) - FIFO/FEFO/Weighted Average costing methods
- [Inventory Valuation](../../shared-methods/inventory-valuation/SM-costing-methods.md) - Inventory valuation techniques

---

## 🤝 Contributing

This documentation is maintained by the Development Team. For questions or updates:
- **Business Questions**: Contact Operations Team or Finance Team
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
- **Reviewed By**: Operations Manager, Finance Manager
- **Next Review**: 2026-01-05

---

> **Note**: This is the central navigation hub for Wastage Reporting documentation. Select a document from the Quick Links table above to dive into specific details.
