# Menu Engineering Module - Documentation Index

**Module**: Operational Planning > Menu Engineering
**Version**: 1.1.0
**Last Updated**: 2025-12-05
**Status**: SUBSTANTIAL IMPLEMENTATION (~70-80% Complete)

---

## 📋 Document Navigation

| Document | Purpose | Status | Lines | Link |
|----------|---------|--------|-------|------|
| **BR** | Business Requirements | ✅ Complete | ~2,515 | [BR-menu-engineering.md](./BR-menu-engineering.md) |
| **UC** | Use Cases | ✅ Complete | ~1,450 | [UC-menu-engineering.md](./UC-menu-engineering.md) |
| **TS** | Technical Specification | ✅ Complete | ~2,180 | [TS-menu-engineering.md](./TS-menu-engineering.md) |
| **DD** | Data Definition | ✅ Complete | ~2,350 | [DD-menu-engineering.md](./DD-menu-engineering.md) |
| **FD** | Flow Diagrams | ✅ Complete | ~1,540 | [FD-menu-engineering.md](./FD-menu-engineering.md) |
| **VAL** | Validation Rules | ✅ Complete | ~1,203 | [VAL-menu-engineering.md](./VAL-menu-engineering.md) |

**Total Documentation**: ~11,238 lines across 6 comprehensive documents

---

## 🎯 Quick Links

### Core Documentation Sections

**Business Requirements (BR)**
- [Section 1: Overview & Objectives](./BR-menu-engineering.md#1-overview--objectives)
- [Section 2: Boston Matrix Methodology](./BR-menu-engineering.md#2-boston-consulting-group-matrix-methodology)
- [Section 3: Performance Metrics](./BR-menu-engineering.md#3-performance-metrics-and-calculations)
- [Section 4: Data Integration](./BR-menu-engineering.md#4-data-integration-requirements)
- [Section 11: Backend Requirements](./BR-menu-engineering.md#11-backend-implementation-requirements) ⭐ NEW

**Use Cases (UC)**
- [UC-ME-001: Dashboard Access](./UC-menu-engineering.md#uc-me-001-access-menu-engineering-dashboard)
- [UC-ME-002: Boston Matrix Analysis](./UC-menu-engineering.md#uc-me-002-perform-boston-matrix-analysis)
- [UC-ME-003: Sales Data Import](./UC-menu-engineering.md#uc-me-003-import-sales-data-from-pos)
- [UC-ME-004: Classification Review](./UC-menu-engineering.md#uc-me-004-review-and-override-menu-item-classifications)
- [UC-ME-005: Cost Alert Management](./UC-menu-engineering.md#uc-me-005-monitor-and-manage-cost-alerts)

**Technical Specification (TS)**
- [Architecture Overview](./TS-menu-engineering.md#1-architecture-overview)
- [Component Specifications](./TS-menu-engineering.md#2-component-specifications)
- [API Endpoints](./TS-menu-engineering.md#3-api-endpoints)
- [Security & Authentication](./TS-menu-engineering.md#6-security-and-authentication)
- [Performance Optimization](./TS-menu-engineering.md#7-performance-optimization)

**Data Definition (DD)**
- [Database Schema](./DD-menu-engineering.md#2-database-schema)
- [Core Tables](./DD-menu-engineering.md#21-core-tables)
- [Integration Tables](./DD-menu-engineering.md#22-integration-tables)
- [Type Definitions](./DD-menu-engineering.md#3-typescript-type-definitions)

**Flow Diagrams (FD)**
- [Dashboard Data Flow](./FD-menu-engineering.md#1-menu-engineering-dashboard-data-flow)
- [Boston Matrix Analysis](./FD-menu-engineering.md#2-boston-matrix-analysis-workflow)
- [Sales Import Process](./FD-menu-engineering.md#3-sales-data-import-from-pos)
- [Cost Alert Workflow](./FD-menu-engineering.md#4-cost-alert-creation-and-monitoring)

**Validation Rules (VAL)**
- [Input Validation](./VAL-menu-engineering.md#1-input-validation)
- [Business Rules](./VAL-menu-engineering.md#2-business-rules-validation)
- [Data Integrity](./VAL-menu-engineering.md#3-data-integrity-validation)
- [Security Validation](./VAL-menu-engineering.md#4-security-validation)

---

## ⚙️ Implementation Status Overview

### What EXISTS in Codebase (~70-80% Complete)

#### ✅ Frontend Components (650+ lines)
**Location**: `app/(main)/operational-planning/menu-engineering/`

1. **Main Dashboard** (`page.tsx` - 652 lines)
   - Performance matrix scatter plot
   - Portfolio analysis summary
   - Cost alert notifications
   - Recipe performance metrics
   - Boston Matrix 4-quadrant visualization

2. **Sales Data Import** (`components/sales-data-import.tsx` - 631 lines)
   - Multi-step wizard (upload, mapping, processing, results)
   - POS system integration (Square, Toast, Clover, Resy, OpenTable)
   - CSV file upload and validation
   - Field mapping interface
   - Import progress tracking

3. **Cost Alert Management** (`components/cost-alert-management.tsx` - 662 lines)
   - Alert filtering and search
   - Alert acknowledgment workflow
   - Escalation management
   - Notification channel configuration
   - Alert suppression rules

4. **Recipe Performance Metrics** (`components/recipe-performance-metrics.tsx` - 444 lines)
   - Performance trend charts
   - Cost breakdown pie chart
   - Competitive analysis scatter plot
   - AI-powered recommendations

#### ✅ Backend API Routes (8 endpoints)
**Location**: `app/api/menu-engineering/`

| Endpoint | Method | Purpose | Security | Status |
|----------|--------|---------|----------|--------|
| `/analysis` | POST | Boston Matrix analysis | JWT, RBAC, Rate limit | ✅ Implemented |
| `/classification` | POST | Menu item classification | JWT, RBAC, Rate limit | ✅ Implemented |
| `/recommendations/[recipeId]` | GET | AI recommendations | JWT, RBAC | ✅ Implemented |
| `/sales-import` | POST | POS data import | JWT, RBAC, File upload | ✅ Implemented |
| `/alerts` | GET | Cost alerts list | JWT, RBAC | ✅ Implemented |
| `/alerts/acknowledge` | POST | Alert acknowledgment | JWT, RBAC | ✅ Implemented |
| `/performance/[recipeId]` | GET | Recipe metrics | JWT, RBAC | ✅ Implemented |
| `/export` | POST | Data export | JWT, RBAC | ✅ Implemented |

**Common Security Features**:
- JWT/Keycloak authentication on all routes
- Role-based access control (RBAC)
- Zod schema validation
- Rate limiting (50 requests/minute)
- Audit logging
- XSS prevention
- SQL injection prevention

#### ✅ Services & Business Logic
**Location**: `lib/services/`

- **menu-engineering-service.ts**: Core Boston Matrix analysis logic
- **pos-integration-service.ts**: POS system data synchronization
- **costing-service.ts**: Integration with FIFO/FEFO/Weighted Average methods

#### ✅ Type Definitions
**Location**: `lib/types/menu-engineering.ts`

- Complete TypeScript interfaces matching all proposed database schemas
- Type guards for runtime validation
- Enums for classifications, alert types, severities

### What's PROPOSED (Not Yet Implemented)

#### ❌ Database Persistence (~30% Complete)
**Proposed Location**: PostgreSQL database

**11 Tables Proposed** (see DD document):
1. `menu_engineering_analysis`
2. `menu_item_classifications`
3. `menu_performance_snapshots`
4. `sales_data_imports`
5. `pos_integration_configs`
6. `cost_alerts`
7. `alert_acknowledgments`
8. `recipe_performance_history`
9. `competitive_analysis_data`
10. `recommendation_history`
11. `menu_engineering_settings`

**Note**: Currently using in-memory data structures and mock data for UI components.

#### ❌ Background Jobs
**Proposed Location**: BullMQ/Redis scheduled jobs

4 Jobs Proposed (see BR Section 11.3):
1. Daily performance analysis
2. Weekly competitive benchmark sync
3. Alert threshold evaluation
4. Stale data cleanup

#### ❌ Workflow Engine Integration
**Proposed Location**: Custom workflow engine

2 Workflows Proposed (see BR Section 11.4):
1. Menu item reclassification approval
2. Cost alert escalation

---

## 🔄 Core Workflows

### 1. Menu Performance Analysis Workflow

**Trigger**: User navigates to Menu Engineering Dashboard

```
User → Dashboard Load → Fetch Performance Data → Calculate Boston Matrix
     ↓
Analysis Results → Classify Items (Star/Plow Horse/Puzzle/Dog)
     ↓
Display Results → Performance Matrix Scatter Plot + Portfolio Summary
```

**Key Steps**:
1. Fetch sales transactions for specified period
2. Calculate popularity scores (percentile ranking)
3. Calculate profitability scores (percentile ranking)
4. Classify items into 4 quadrants based on scores
5. Generate actionable recommendations

**Implementation**: ✅ Complete (see `lib/services/menu-engineering-service.ts`)

**Mermaid Diagram**: [FD Section 2](./FD-menu-engineering.md#2-boston-matrix-analysis-workflow)

---

### 2. Sales Data Import from POS

**Trigger**: User initiates sales data import

```
User → Select POS System → Upload CSV/Connect API → Map Fields
     ↓
Validate Data → Process Transactions → Update Performance Metrics
     ↓
Display Results → Success/Error Summary + Import History
```

**Key Steps**:
1. User selects POS system (Square, Toast, Clover, etc.)
2. Upload CSV file or authenticate API connection
3. Map POS fields to system fields
4. Validate data (completeness, format, business rules)
5. Process and store transactions
6. Trigger performance recalculation

**Implementation**: ✅ Complete (see `components/sales-data-import.tsx`)

**Mermaid Diagram**: [FD Section 3](./FD-menu-engineering.md#3-sales-data-import-from-pos)

---

### 3. Cost Alert Management Workflow

**Trigger**: Automated threshold evaluation or manual alert creation

```
System → Monitor Cost Changes → Detect Threshold Breach → Create Alert
     ↓
Notify Users (Email/SMS/In-App) → User Reviews Alert → Acknowledge/Escalate
     ↓
Track Resolution → Update Alert Status → Log to Audit Trail
```

**Key Steps**:
1. System monitors recipe costs (hourly or event-triggered)
2. Compare current costs against thresholds
3. Detect breaches (cost increase, margin decrease, variance)
4. Create alerts with severity (info/warning/critical)
5. Send notifications via configured channels
6. Users acknowledge or escalate alerts
7. Track resolution and audit trail

**Implementation**: ✅ Complete (see `components/cost-alert-management.tsx`)

**Mermaid Diagram**: [FD Section 4](./FD-menu-engineering.md#4-cost-alert-creation-and-monitoring)

---

### 4. Recipe Performance Deep Dive

**Trigger**: User clicks on a menu item for detailed analysis

```
User → Select Recipe → Fetch Historical Data → Display Trends
     ↓
Show Cost Breakdown → Competitive Analysis → AI Recommendations
     ↓
User Reviews Insights → Export Report or Take Action
```

**Key Steps**:
1. Fetch 6-month historical performance data
2. Generate trend charts (sales, profit, popularity)
3. Break down costs by ingredient category
4. Compare against similar items (competitive analysis)
5. Generate AI-powered recommendations
6. Allow export to PDF/Excel

**Implementation**: ✅ Complete (see `components/recipe-performance-metrics.tsx`)

**Mermaid Diagram**: [FD Section 5](./FD-menu-engineering.md#5-recipe-performance-deep-dive)

---

## 🧩 Feature Inventory

### Boston Matrix Analysis
- **Classification Types**: Star, Plow Horse, Puzzle, Dog
- **Scoring Method**: Percentile ranking (0-100 scale)
- **Thresholds**: Configurable per location/concept
- **Manual Override**: Authorized users can reclassify items
- **Audit Trail**: All classification changes logged

**Business Rules**:
- Star (High Popularity + High Profitability): Promote and maintain
- Plow Horse (High Popularity + Low Profitability): Increase pricing
- Puzzle (Low Popularity + High Profitability): Marketing campaign
- Dog (Low Popularity + Low Profitability): Consider removal

### Performance Metrics
- **Popularity Score**: Percentile ranking based on sales volume
- **Profitability Score**: Percentile ranking based on contribution margin
- **Contribution Margin**: (Price - Cost) / Price × 100
- **Menu Mix Percentage**: Item sales / Total sales × 100
- **Trend Analysis**: 6-month rolling average

### POS Integration
- **Supported Systems**: Square, Toast, Clover, Resy, OpenTable, Lightspeed
- **Import Methods**: CSV upload, API sync
- **Field Mapping**: Flexible mapping between POS and system fields
- **Validation**: Completeness, format, business rule compliance
- **Frequency**: Real-time API sync or scheduled batch imports

### Cost Alert System
- **Alert Types**: Cost increase, Margin decrease, Threshold exceeded, Variance detected
- **Severity Levels**: Info (notification), Warning (action soon), Critical (immediate action)
- **Notification Channels**: Email, SMS, In-app, Webhook
- **Escalation Rules**: Auto-escalate if not acknowledged within X hours
- **Suppression Rules**: Temporary suppression for known issues

### Inventory Costing Integration
- **FIFO (First-In-First-Out)**: For non-perishable items
- **FEFO (First-Expired-First-Out)**: For perishables
- **Weighted Average**: For high-volume commodity items
- **Real-time Cost Updates**: Costs updated as inventory batches consumed
- **Cost Variance Tracking**: Alert on significant deviations

### Competitive Analysis
- **Data Sources**: Manual entry, market research integrations
- **Comparison Metrics**: Price, popularity, profitability
- **Visualization**: Scatter plots showing competitive positioning
- **Benchmarking**: Compare against industry standards

### AI-Powered Recommendations
- **Recommendation Types**: Pricing adjustments, Marketing strategies, Menu placement
- **Confidence Scoring**: AI provides confidence level (0-100%)
- **Rationale**: Explains reasoning behind each recommendation
- **Historical Tracking**: Records all recommendations and outcomes

---

## 🔗 Related Modules

### Direct Dependencies

**Recipe Management** (`operational-planning/recipe-management`)
- Menu Engineering analyzes recipes created in Recipe Management
- Links: Recipe costs, ingredient breakdowns, yield calculations
- Flow: Recipe created → Menu Engineering analyzes performance

**Inventory Management** (`inventory-management`)
- Menu Engineering uses real-time inventory costs for profitability calculations
- Integration: FIFO/FEFO/Weighted Average costing methods
- Flow: Inventory cost updates → Recipe cost recalculation → Performance metrics updated

**Store Operations** (`store-operations`)
- Sales data from POS systems feeds Menu Engineering analysis
- Links: Transaction data, menu item sales, customer preferences
- Flow: POS transaction → Sales import → Performance analysis

### Indirect Dependencies

**Procurement** (`procurement`)
- Purchase order costs impact recipe profitability
- Links: Ingredient costs, vendor pricing, purchase history
- Flow: PO received → GRN costed → Recipe costs updated → Performance recalculated

**Product Management** (`product-management`)
- Product specifications and base costs used in recipe costing
- Links: Product catalog, unit costs, conversion factors
- Flow: Product cost updated → Recipe costs recalculated → Performance metrics refreshed

**Finance** (`finance`)
- Menu Engineering contributes to revenue forecasting and margin analysis
- Links: Revenue reports, profitability analysis, cost variance
- Flow: Menu performance data → Financial dashboards → Executive reporting

---

## 🚀 Getting Started

### For Developers

**1. Review Implementation**
```bash
# Frontend Components
app/(main)/operational-planning/menu-engineering/
├── page.tsx                               # Main dashboard (652 lines)
├── components/
│   ├── sales-data-import.tsx             # POS integration (631 lines)
│   ├── cost-alert-management.tsx         # Alert system (662 lines)
│   └── recipe-performance-metrics.tsx    # Detailed analytics (444 lines)

# Backend API Routes
app/api/menu-engineering/
├── analysis/route.ts                      # Boston Matrix analysis
├── classification/route.ts                # Item classification
├── recommendations/[recipeId]/route.ts    # AI recommendations
├── sales-import/route.ts                  # POS data import
├── alerts/route.ts                        # Alert management
├── alerts/acknowledge/route.ts            # Alert acknowledgment
├── performance/[recipeId]/route.ts        # Performance metrics
└── export/route.ts                        # Data export

# Services & Business Logic
lib/services/
├── menu-engineering-service.ts            # Core analysis logic
├── pos-integration-service.ts             # POS synchronization
└── costing-service.ts                     # FIFO/FEFO/Weighted Average

# Type Definitions
lib/types/menu-engineering.ts              # Complete TypeScript types
```

**2. Key Files to Study**
- **Business Logic**: `lib/services/menu-engineering-service.ts` - Boston Matrix algorithm
- **Main UI**: `app/(main)/operational-planning/menu-engineering/page.tsx` - Dashboard layout
- **POS Integration**: `components/sales-data-import.tsx` - Import wizard
- **API Security**: `app/api/menu-engineering/analysis/route.ts` - Authentication pattern

**3. Documentation Reading Order**
1. **BR** (Business Requirements) - Understand the "why" and business rules
2. **UC** (Use Cases) - See how users interact with the system
3. **TS** (Technical Specification) - Architecture and component design
4. **DD** (Data Definition) - Database schema and type definitions
5. **FD** (Flow Diagrams) - Visualize workflows and processes
6. **VAL** (Validation Rules) - Input validation and business rule enforcement

### For Business Analysts

**1. Understand the Methodology**
- Read [BR Section 2: Boston Matrix Methodology](./BR-menu-engineering.md#2-boston-consulting-group-matrix-methodology)
- Review [BR Section 3: Performance Metrics](./BR-menu-engineering.md#3-performance-metrics-and-calculations)

**2. Review User Workflows**
- [UC-ME-001: Dashboard Access](./UC-menu-engineering.md#uc-me-001-access-menu-engineering-dashboard)
- [UC-ME-002: Boston Matrix Analysis](./UC-menu-engineering.md#uc-me-002-perform-boston-matrix-analysis)
- [UC-ME-005: Cost Alert Management](./UC-menu-engineering.md#uc-me-005-monitor-and-manage-cost-alerts)

**3. Understand Business Rules**
- [VAL Section 2: Business Rules Validation](./VAL-menu-engineering.md#2-business-rules-validation)
- [BR Section 7: Business Rules](./BR-menu-engineering.md#7-business-rules-and-constraints)

### For QA/Testing

**1. Review Validation Rules**
- [VAL Section 1: Input Validation](./VAL-menu-engineering.md#1-input-validation)
- [VAL Section 3: Data Integrity Validation](./VAL-menu-engineering.md#3-data-integrity-validation)

**2. Study Edge Cases**
- [BR Section 8: Edge Cases](./BR-menu-engineering.md#8-edge-cases-and-exceptional-scenarios)
- [TS Section 8: Error Handling](./TS-menu-engineering.md#8-error-handling-and-recovery)

**3. Understand Test Scenarios**
- [UC-ME-002: Boston Matrix Analysis](./UC-menu-engineering.md#uc-me-002-perform-boston-matrix-analysis) - Core functionality
- [UC-ME-003: Sales Data Import](./UC-menu-engineering.md#uc-me-003-import-sales-data-from-pos) - POS integration
- [UC-ME-005: Cost Alert Management](./UC-menu-engineering.md#uc-me-005-monitor-and-manage-cost-alerts) - Alert workflows

---

## 📊 Backend Implementation Roadmap

### Phase 1: Database Schema Implementation (Priority: HIGH)
**Estimated Effort**: 2-3 weeks

**Tasks**:
1. Create 11 database tables (see DD document)
2. Implement indexes and constraints
3. Create database migration scripts
4. Set up triggers for audit logging

**Reference**: [DD Section 2: Database Schema](./DD-menu-engineering.md#2-database-schema)

### Phase 2: Server Actions Implementation (Priority: HIGH)
**Estimated Effort**: 3-4 weeks

**Tasks**:
1. Implement 23 server actions across 7 categories (see BR Section 11.1)
2. Integrate FIFO/FEFO/Weighted Average costing methods
3. Add comprehensive error handling
4. Implement caching strategies

**Reference**: [BR Section 11.1: Server Actions Required](./BR-menu-engineering.md#111-server-actions-required)

### Phase 3: Background Jobs (Priority: MEDIUM)
**Estimated Effort**: 1-2 weeks

**Tasks**:
1. Set up BullMQ/Redis job infrastructure
2. Implement 4 scheduled jobs
3. Add job monitoring and alerting
4. Implement retry logic and dead letter queues

**Reference**: [BR Section 11.3: Scheduled Jobs](./BR-menu-engineering.md#113-scheduled-jobs)

### Phase 4: Workflow Engine Integration (Priority: MEDIUM)
**Estimated Effort**: 2-3 weeks

**Tasks**:
1. Implement approval workflow for reclassification
2. Implement escalation workflow for cost alerts
3. Add workflow monitoring dashboard
4. Integrate with notification system

**Reference**: [BR Section 11.4: Workflow Engine Integration](./BR-menu-engineering.md#114-workflow-engine-integration)

### Phase 5: Advanced Features (Priority: LOW)
**Estimated Effort**: 2-3 weeks

**Tasks**:
1. Enhanced competitive analysis
2. AI recommendation engine improvements
3. Advanced reporting and dashboards
4. Mobile app integration

---

## 🔧 Configuration & Settings

### Analysis Parameters
- **Analysis Period**: 30/60/90/180/365 days (configurable)
- **Popularity Threshold**: 50th percentile (default, configurable)
- **Profitability Threshold**: 50th percentile (default, configurable)
- **Minimum Data Points**: 10 sales transactions (default, configurable)

### Cost Alert Thresholds
- **Cost Increase**: >10% (default, configurable)
- **Margin Decrease**: >15% (default, configurable)
- **Variance Threshold**: >$5.00 or >20% (default, configurable)

### POS Integration Settings
- **Sync Frequency**: Hourly (default, configurable)
- **Import Batch Size**: 1000 transactions (default)
- **Retry Attempts**: 3 (default)
- **Timeout**: 30 seconds (default)

### Performance Optimization
- **Cache TTL**: 1 hour (analysis results)
- **Database Query Timeout**: 10 seconds
- **Rate Limit**: 50 requests/minute per user
- **Max File Upload Size**: 10 MB (CSV imports)

---

## 📝 Notes

### Mermaid Diagram Compatibility
All flow diagrams in this module use `stateDiagram-v2` syntax, which is fully compatible with **Mermaid version 8.8.2**.

### Inventory Costing Methods
The Menu Engineering module integrates deeply with the inventory management system's costing methods:
- **FIFO**: Used for non-perishable items (dry goods, canned items)
- **FEFO**: Used for perishable items (produce, dairy, meat)
- **Weighted Average**: Used for high-volume commodity items (flour, sugar, oil)

Recipe costs are dynamically calculated based on the costing method configured for each ingredient.

### Security Considerations
All API routes implement:
- JWT/Keycloak authentication
- Role-based access control (RBAC)
- Zod schema validation
- Rate limiting
- Audit logging
- XSS prevention
- SQL injection prevention

### Performance Characteristics
- **Dashboard Load Time**: <2 seconds (cached), <5 seconds (uncached)
- **Boston Matrix Analysis**: <3 seconds for 100 menu items
- **Sales Import**: ~500 transactions/second
- **Alert Evaluation**: <1 second per recipe

---

## 📞 Support & Contacts

**Module Owner**: Operational Planning Team
**Technical Lead**: Backend Engineering Team
**Business Analyst**: Menu Engineering SME
**QA Lead**: Testing & Quality Assurance Team

**Related Documentation**:
- [Recipe Management Documentation](../recipe-management/INDEX-recipe-management.md)
- [Inventory Management Documentation](../../inventory-management/INDEX-inventory-management.md)
- [Store Operations Documentation](../../store-operations/INDEX-store-operations.md)

---

**Last Reviewed**: 2025-12-05
**Next Review Due**: 2025-12-19
**Review Frequency**: Bi-weekly during active development

---

## Document Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.1.0 | 2025-12-05 | Added implementation status sections to all documents, Added BR Section 11 (Backend Requirements) | Documentation Team |
| 1.0.0 | 2024-11-15 | Initial comprehensive documentation set created | Documentation Team |
