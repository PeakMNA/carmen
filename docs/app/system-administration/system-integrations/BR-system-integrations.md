# System Integrations - Business Requirements (BR)

**Module**: System Administration - System Integrations
**Version**: 1.0
**Last Updated**: 2026-01-16
**Document Status**: Active
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |


**Implementation Status**: POS Integration Active, ERP/API Planned

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Business Rules](#business-rules)
6. [Future Enhancements](#future-enhancements)
7. [Success Metrics](#success-metrics)
8. [Glossary](#glossary)

---

## 1. Executive Summary

### 1.1 Purpose
The System Integrations module provides centralized management for connecting external systems (POS, ERP, APIs) with the Carmen ERP platform. The primary focus is enabling seamless data synchronization between point-of-sale systems and the core inventory/recipe management system.

### 1.2 Current Implementation Status
- **Implemented**: POS Integration with recipe mapping, unit mapping, location mapping, and transaction management
- **In Development**: Advanced fractional sales mapping for pizza slices, cake portions, and other divisible items
- **Planned**: ERP Integration, API Management

### 1.3 Key Capabilities
- **Recipe Mapping**: Map POS items to Carmen recipes with fractional sales support
- **Unit Mapping**: Convert POS units to Carmen base units with configurable conversion rates
- **Location Mapping**: Synchronize POS locations with Carmen system locations
- **Transaction Management**: Process, validate, and troubleshoot POS transactions
- **Reports**: Consumption analysis and gross profit reporting
- **Activity Logging**: Track all integration activities and changes

---

## 2. System Overview

### 2.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│              External Systems                            │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │              │  │              │  │              │ │
│  │  POS System  │  │  ERP System  │  │  External    │ │
│  │              │  │              │  │  APIs        │ │
│  │  [Active]    │  │  [Planned]   │  │  [Planned]   │ │
│  │              │  │              │  │              │ │
│  └──────┬───────┘  └──────────────┘  └──────────────┘ │
│         │                                               │
└─────────┼───────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────┐
│         System Integrations Module                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │             POS Integration Engine                │  │
│  │  - Recipe Mapping (with fractional sales)        │  │
│  │  - Unit Mapping & Conversion                     │  │
│  │  - Location Mapping & Sync                       │  │
│  │  - Transaction Processing                         │  │
│  │  - Failed Transaction Handling                    │  │
│  │  - Stock-Out Review & Approval                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │             Reports & Analytics                   │  │
│  │  - Consumption Reports                            │  │
│  │  - Gross Profit Analysis                          │  │
│  │  - Transaction Activity Logs                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────┬───────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────┐
│              Carmen ERP Core Systems                     │
│  - Inventory Management                                  │
│  - Recipe Management                                     │
│  - Procurement                                           │
│  - Financial Management                                  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Integration Types

#### Active: POS Integration
Primary integration connecting point-of-sale systems with inventory and recipe management.

**Key Components**:
- Recipe mapping with fractional sales (pizza slices, cake portions, bottle/glass servings)
- Unit conversion between POS and Carmen systems
- Location synchronization for multi-outlet operations
- Real-time transaction processing
- Failed transaction recovery

#### Planned: ERP Integration
Future integration for enterprise resource planning systems.

#### Planned: API Management
Future capability for managing external API connections and credentials.

---

## 3. Functional Requirements

### FR-SI-001: POS Recipe Mapping

**Priority**: CRITICAL
**Status**: Implemented

#### Description
System must provide comprehensive recipe mapping between POS items and Carmen recipes, including support for fractional sales.

#### Requirements
1. Map POS items to Carmen recipes with unique mappings
2. Support conversion rate configuration between POS and recipe units
3. Handle fractional sales scenarios (pizza slices, cake portions, etc.)
4. Track mapping status (mapped, unmapped, pending)
5. Support bulk mapping operations
6. Provide mapping history and audit trail

#### Fractional Sales Support
- **Pizza Slice**: Map individual slices to full pizza recipe
- **Cake Slice**: Map portions to whole cake recipe
- **Bottle/Glass**: Map glass servings to bottle recipe
- **Portion Control**: Map individual portions to batch recipe
- **Custom**: User-defined fractional mappings

#### Acceptance Criteria
- ✅ Users can create recipe mappings with POS item code and Carmen recipe code
- ✅ System validates mapping uniqueness
- ✅ Fractional sales types are supported with variant configuration
- ✅ Conversion rates can be configured (e.g., 1 POS slice = 0.125 full pizza)
- ✅ Mapping status is tracked and displayed
- ✅ Changes are logged in audit trail

#### Data Requirements
```typescript
RecipeMapping {
  posItemCode: string         // POS system item identifier
  posDescription: string      // POS item display name
  recipeCode: string          // Carmen recipe identifier
  recipeName: string          // Carmen recipe display name
  posUnit: string            // POS unit of measure
  recipeUnit: string         // Carmen unit of measure
  conversionRate: number     // Conversion multiplier

  // Fractional Sales Support
  recipeVariantId?: string   // Recipe yield variant ID
  variantName?: string       // Variant display name (e.g., "Slice")
  baseRecipeId?: string      // Base recipe when multiple POS items map to same recipe
  fractionalSalesType?: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'

  category: string           // POS item category
  status: StatusType         // mapped | unmapped | pending
  lastSyncDate?: Date
  lastSyncStatus?: StatusType
}
```

---

### FR-SI-002: POS Unit Mapping

**Priority**: HIGH
**Status**: Implemented

#### Description
System must enable mapping and conversion between POS units of measure and Carmen base units.

#### Requirements
1. Define unit mappings with conversion rates
2. Support recipe units, sales units, and dual-purpose units
3. Validate conversion rate logic
4. Track unit usage frequency
5. Prevent deletion of in-use units

#### Unit Types
- **Recipe**: Units used in recipe definitions (kg, liters, pieces)
- **Sales**: Units used in POS transactions (servings, portions, items)
- **Both**: Units applicable to both contexts

#### Acceptance Criteria
- ✅ Users can create unit mappings with base unit and conversion rate
- ✅ Unit type classification (recipe/sales/both) is enforced
- ✅ Conversion rates are validated for logical consistency
- ✅ In-use units cannot be deleted
- ✅ Last used date is tracked

#### Data Requirements
```typescript
UnitMapping {
  unitCode: string          // Unique unit identifier
  unitName: string          // Display name
  unitType: 'recipe' | 'sales' | 'both'
  baseUnit: string          // Reference base unit
  conversionRate: number    // Conversion multiplier to base
  status: StatusType        // active | inactive
  lastUsed?: Date
  createdAt: Date
  updatedAt: Date
}
```

#### Example Conversions
- 1 POS "Slice" = 0.125 Recipe "Full Pizza"
- 1 POS "Glass" = 0.15 Recipe "Liter"
- 1 POS "Portion" = 0.25 Recipe "kg"

---

### FR-SI-003: POS Location Mapping

**Priority**: HIGH
**Status**: Implemented

#### Description
System must synchronize POS locations with Carmen system locations for multi-outlet operations.

#### Requirements
1. Map POS locations to Carmen locations
2. Configure sync settings per location
3. Track active/inactive status
4. Maintain mapping history
5. Support location-specific settings

#### Acceptance Criteria
- ✅ Users can map POS locations to Carmen locations
- ✅ Sync can be enabled/disabled per location
- ✅ Location status (active/inactive) is tracked
- ✅ Mapping metadata (mapped by, mapped at) is recorded
- ✅ Notes can be added to location mappings

#### Data Requirements
```typescript
LocationMapping {
  posLocationId: string        // POS system location ID
  posLocationName: string      // POS location display name
  posLocationCode?: string     // POS location code
  carmenLocationId: string     // Carmen location ID
  carmenLocationName: string   // Carmen location display name
  carmenLocationType: string   // Carmen location type
  isActive: boolean            // Location operational status
  syncEnabled: boolean         // Auto-sync enabled flag
  mappedBy: {                  // User who created mapping
    id: string
    name: string
  }
  mappedAt: string            // Mapping creation timestamp
  notes?: string              // Optional mapping notes
}
```

---

### FR-SI-004: Transaction Processing

**Priority**: CRITICAL
**Status**: Implemented

#### Description
System must process POS transactions and deduct inventory based on recipe mappings.

#### Requirements
1. Receive POS transaction data in real-time or batch
2. Validate transaction completeness
3. Apply recipe mappings to calculate inventory impact
4. Process successful transactions automatically
5. Flag failed transactions for review
6. Support manual transaction correction

#### Transaction Flow
1. Receive POS transaction (item code, quantity, location, timestamp)
2. Lookup recipe mapping for item code
3. Calculate inventory deduction using conversion rate
4. Validate inventory availability
5. Process transaction or flag for review
6. Update inventory levels
7. Log transaction in activity log

#### Acceptance Criteria
- ✅ Transactions are validated for completeness
- ✅ Recipe mappings are applied correctly
- ✅ Inventory is deducted based on conversion rates
- ✅ Failed transactions are flagged with reason
- ✅ Manual corrections are supported
- ✅ All transactions are logged

---

### FR-SI-005: Failed Transaction Management

**Priority**: HIGH
**Status**: Implemented

#### Description
System must identify, flag, and manage failed POS transactions.

#### Failure Scenarios
1. **Unmapped Items**: POS item has no recipe mapping
2. **Insufficient Inventory**: Stock level below transaction quantity
3. **Invalid Location**: POS location not mapped
4. **Invalid Unit**: Unit mapping missing or inactive
5. **Data Validation Errors**: Transaction data incomplete or invalid

#### Requirements
1. Detect and categorize transaction failures
2. Display failed transactions in dedicated view
3. Provide failure reason and suggested resolution
4. Support batch resolution of similar failures
5. Enable transaction retry after resolution

#### Acceptance Criteria
- ✅ Failed transactions are automatically flagged
- ✅ Failure reason is clearly displayed
- ✅ Users can view all failed transactions
- ✅ Resolution actions are suggested (e.g., "Create Mapping")
- ✅ Transactions can be retried after fixing issues

---

### FR-SI-006: Stock-Out Review and Approval

**Priority**: HIGH
**Status**: Implemented

#### Description
System must handle transactions that would result in negative inventory, requiring approval before processing.

#### Requirements
1. Detect transactions that exceed available stock
2. Queue transactions for approval
3. Display pending approvals with stock impact
4. Support approval/rejection workflow
5. Process approved transactions
6. Log rejection reasons

#### Approval Workflow
1. Transaction detected with quantity > available stock
2. Transaction queued in "Pending Approvals" status
3. Approver reviews transaction and stock impact
4. Approver approves (with optional stock adjustment) or rejects
5. Approved transactions process normally
6. Rejected transactions are logged with reason

#### Acceptance Criteria
- ✅ Stock-out transactions are queued for approval
- ✅ Approvers see pending approval count
- ✅ Stock impact is clearly displayed
- ✅ Approvers can approve or reject with reason
- ✅ Approved transactions are processed
- ✅ All approval decisions are logged

---

### FR-SI-007: Consumption Reports

**Priority**: MEDIUM
**Status**: Implemented

#### Description
System must generate consumption reports showing inventory usage from POS transactions.

#### Requirements
1. Display consumption by item over time period
2. Show consumption by location
3. Filter by date range, category, location
4. Export reports to Excel/PDF
5. Compare actual vs. expected consumption

#### Report Metrics
- Total quantity consumed per item
- Consumption by location
- Consumption trends over time
- Variance from expected consumption (based on recipe yield)
- Cost of goods sold (COGS) calculation

#### Acceptance Criteria
- ✅ Reports display consumption data accurately
- ✅ Date range filtering is supported
- ✅ Location filtering is supported
- ✅ Export to Excel/PDF is available
- ✅ Variance analysis is provided

---

### FR-SI-008: Gross Profit Analysis

**Priority**: MEDIUM
**Status**: Implemented

#### Description
System must provide gross profit analysis based on POS sales and recipe costs.

#### Requirements
1. Calculate theoretical cost based on recipe mappings
2. Compare sales revenue to ingredient cost
3. Display gross profit by item and period
4. Show profit margin percentages
5. Identify top and bottom performers

#### Calculation Logic
```
Theoretical Cost = Recipe Cost × Quantity Sold (based on conversion rate)
Gross Profit = Sales Revenue - Theoretical Cost
Profit Margin % = (Gross Profit / Sales Revenue) × 100
```

#### Acceptance Criteria
- ✅ Gross profit is calculated accurately
- ✅ Profit margins are displayed per item
- ✅ Top/bottom performers are highlighted
- ✅ Period comparison is supported
- ✅ Reports can be exported

---

### FR-SI-009: Activity Logging

**Priority**: MEDIUM
**Status**: Implemented

#### Description
System must maintain comprehensive activity log for all integration operations.

#### Logged Activities
- Recipe mapping changes (create, update, delete)
- Unit mapping changes
- Location mapping changes
- Transaction processing
- Failed transaction occurrences
- Approval decisions
- Sync operations

#### Requirements
1. Log all integration activities with timestamp
2. Record user who performed action
3. Include before/after values for changes
4. Support filtering by activity type, date, user
5. Provide activity summary dashboard

#### Acceptance Criteria
- ✅ All activities are logged automatically
- ✅ Activity details include user and timestamp
- ✅ Filters work correctly
- ✅ Activity log is searchable
- ✅ Summary dashboard provides overview

---

### FR-SI-010: Integration Settings

**Priority**: MEDIUM
**Status**: Implemented

#### Description
System must provide configuration settings for POS integration behavior.

#### Setting Categories

**POS Configuration**:
- POS system type/vendor
- Connection settings (API endpoint, credentials)
- Sync frequency (real-time, hourly, daily)
- Data format preferences

**System Settings**:
- Auto-process threshold (process transactions automatically below threshold)
- Stock-out approval required (yes/no)
- Default handling for unmapped items (ignore, create placeholder, alert)
- Transaction batch size
- Sync error notification recipients

#### Acceptance Criteria
- ✅ Settings are organized by category
- ✅ Changes require appropriate permissions
- ✅ Settings are validated before saving
- ✅ Changes are logged in audit trail
- ✅ Help documentation is available for each setting

---

## 4. Non-Functional Requirements

### NFR-SI-001: Performance
- Transaction processing must complete within 2 seconds per transaction
- Recipe mapping lookup must complete within 100ms
- Support processing 1,000+ transactions per hour
- Report generation must complete within 10 seconds for 30-day period

### NFR-SI-002: Reliability
- 99.5% uptime for integration services
- Automatic retry on connection failures (3 attempts with exponential backoff)
- Transaction queue persistence (no data loss on system restart)
- Graceful degradation when external system unavailable

### NFR-SI-003: Data Integrity
- All transactions must be atomic (succeed completely or fail completely)
- No partial inventory deductions
- Maintain referential integrity between mappings and transactions
- Duplicate transaction detection and prevention

### NFR-SI-004: Security
- Encrypted API credentials storage
- Audit trail for all mapping changes
- Role-based access control for integration settings
- Secure transmission of transaction data

### NFR-SI-005: Scalability
- Support up to 50 POS locations
- Handle up to 10,000 unique POS items
- Process up to 100,000 transactions per day
- Store 2+ years of transaction history

### NFR-SI-006: Usability
- Intuitive mapping interface with search and filters
- Clear error messages with resolution guidance
- Bulk mapping operations for efficiency
- Visual status indicators (mapped, unmapped, failed)

---

## 5. Business Rules

### BR-SI-001: Recipe Mapping
- Each POS item can map to exactly one Carmen recipe (1:1 relationship)
- Multiple POS items can map to the same recipe (for variants/sizes)
- Recipe mapping requires valid POS item code and Carmen recipe code
- Conversion rate must be greater than 0
- Fractional sales mappings must specify variant type

### BR-SI-002: Unit Mapping
- Unit codes must be unique across the system
- Conversion rate must be greater than 0
- Base unit must exist in system before creating conversion
- Units in active use cannot be deleted (must be deactivated)
- Unit type (recipe/sales/both) cannot be changed if unit is in use

### BR-SI-003: Location Mapping
- Each POS location can map to exactly one Carmen location
- Carmen location can have multiple POS location mappings (for different POS systems)
- Active location mappings cannot be deleted (must be deactivated first)
- Sync settings can only be changed for inactive locations or with confirmation

### BR-SI-004: Transaction Processing
- Transactions without valid recipe mapping cannot be auto-processed
- Transactions causing negative inventory require approval if stock-out review is enabled
- Transaction quantity must be greater than 0
- Transaction timestamp must be within acceptable range (not future, not >90 days old)

### BR-SI-005: Approval Workflow
- Stock-out approvals require "approve_stock_out" permission
- Approved stock-out creates automatic stock adjustment record
- Rejected transactions are logged but not processed
- Bulk approval limited to transactions from same location and same day

---

## 6. Future Enhancements

### 6.1 ERP Integration (Planned Q2 2025)

**Objective**: Integrate with third-party ERP systems for procurement and financial data sync.

**Planned Features**:
- Purchase order sync from Carmen to ERP
- Invoice import from ERP to Carmen
- General ledger account mapping
- Vendor master data synchronization
- Payment status updates

### 6.2 API Management (Planned Q3 2025)

**Objective**: Provide centralized API key management and external system connections.

**Planned Features**:
- API key generation and rotation
- Rate limiting and quotas
- API usage monitoring
- Webhook configuration
- External system credentials vault

### 6.3 Advanced Analytics (Planned Q4 2025)

**Objective**: Enhanced reporting and predictive analytics for integration data.

**Planned Features**:
- Predictive consumption forecasting
- Variance analysis trends
- Menu engineering insights from POS data
- Waste reduction recommendations
- Optimal stock level suggestions

### 6.4 Multi-POS Support (Planned 2026)

**Objective**: Support multiple POS systems simultaneously in same instance.

**Planned Features**:
- POS system registry
- Per-system mapping configurations
- Consolidated transaction view
- Cross-system reporting
- POS-specific rule engines

---

## 7. Success Metrics

### 7.1 Functional Metrics
- **Mapping Coverage**: >95% of POS items mapped to recipes
- **Auto-Process Rate**: >90% of transactions auto-processed without errors
- **Failed Transaction Rate**: <5% of total transactions
- **Approval Turnaround**: <4 hours average for stock-out approvals

### 7.2 Performance Metrics
- **Transaction Processing Time**: <2 seconds per transaction
- **Mapping Lookup Time**: <100ms average
- **Report Generation Time**: <10 seconds for 30-day period
- **Sync Frequency**: Real-time or hourly based on configuration

### 7.3 Data Quality Metrics
- **Duplicate Transaction Rate**: <0.1%
- **Data Validation Error Rate**: <2%
- **Inventory Accuracy**: >98% match between system and physical count
- **Mapping Accuracy**: <1% incorrect mappings requiring correction

### 7.4 Usability Metrics
- **User Satisfaction**: >85% satisfaction with integration interface
- **Training Time**: <3 hours for administrators to master mapping
- **Resolution Time**: <15 minutes average to fix failed transaction
- **Error Recovery Rate**: >95% of failed transactions successfully resolved

---

## 8. Glossary

### Integration Terms

**POS (Point of Sale)**: External sales system recording customer transactions

**Recipe Mapping**: Association between POS item and Carmen recipe with conversion logic

**Conversion Rate**: Multiplier used to convert POS quantity to recipe quantity (e.g., 1 slice = 0.125 full pizza)

**Fractional Sales**: Selling portions of a recipe (e.g., pizza by slice instead of whole pizza)

**Variant**: Specific yield configuration for a recipe (e.g., "Slice" variant of Pizza recipe)

**Base Recipe**: The complete/full recipe when fractional sales variants exist

**Unit Mapping**: Conversion rule between POS unit and Carmen base unit

**Location Mapping**: Association between POS location and Carmen location

**Transaction**: POS sales record including item, quantity, location, timestamp

**Failed Transaction**: Transaction that cannot be auto-processed due to missing mapping or validation error

**Stock-Out**: Transaction quantity exceeds available inventory

**Auto-Process**: Automatic transaction processing without manual intervention

**Sync**: Data synchronization between POS system and Carmen ERP

### Status Terms

**Mapped**: POS item has valid recipe mapping

**Unmapped**: POS item has no recipe mapping configured

**Pending**: Mapping created but not yet activated

**Active**: Mapping is enabled and in use

**Inactive**: Mapping is disabled but preserved

**Failed**: Transaction processing failed validation

**Approved**: Stock-out transaction approved for processing

**Rejected**: Stock-out transaction rejected and logged

---

**Document Control**:
- **Created**: 2026-01-16
- **Last Modified**: 2026-01-16
- **Version**: 1.0
- **Status**: Active
- **Review Cycle**: Quarterly
- **Next Review**: 2025-04-16
