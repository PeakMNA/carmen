# BR-SREP: Stock Replenishment Business Requirements

**Module**: Store Operations
**Sub-Module**: Stock Replenishment
**Document Type**: Business Requirements (BR)
**Version**: 1.2.0
**Last Updated**: 2025-12-09
**Status**: Active
**Implementation Status**: IMPLEMENTED (Frontend UI Complete, Backend Mock Data)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2.0 | 2025-12-09 | Documentation Team | Updated to reflect actual implementation - 6 pages implemented with mock data |
| 1.1.0 | 2025-12-05 | Documentation Team | Added implementation status, backend requirements, inventory integration references |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

## 1. Executive Summary

### 1.1 Purpose

The Stock Replenishment module provides automated and intelligent inventory replenishment capabilities for hospitality operations. It monitors stock levels across multiple locations, generates replenishment recommendations based on consumption patterns and lead times, and facilitates efficient stock transfers between locations.

**Key Capabilities**:
- Real-time inventory monitoring with automatic alerts
- Intelligent replenishment suggestions based on min/max levels
- Par level management and automatic reorder point calculation
- Multi-location stock transfer workflows
- Consumption pattern analysis and forecasting
- Integration with purchase requests and inventory transactions

### 1.2 Business Objectives

**Primary Objectives**:
1. **Prevent Stockouts**: Ensure critical items never run out at operational locations
2. **Optimize Inventory**: Maintain optimal stock levels without over-stocking
3. **Reduce Waste**: Minimize spoilage and expiration through better stock rotation
4. **Improve Efficiency**: Automate replenishment decision-making process
5. **Cost Control**: Reduce carrying costs and emergency purchasing

**Success Metrics**:
- Stockout incidents reduced by 80%
- Inventory carrying costs reduced by 20%
- Waste/spoilage reduced by 30%
- Time spent on manual stock monitoring reduced by 60%
- Emergency purchase orders reduced by 70%

### 1.3 Scope

**In Scope**:
- Inventory level monitoring and alerting
- Par level and reorder point configuration
- Automatic replenishment recommendations
- Manual and automatic replenishment request creation
- Inter-location stock transfer workflows
- Consumption pattern analysis
- Integration with inventory management
- Integration with purchase request system

**Out of Scope**:
- External supplier direct replenishment (handled by Procurement module)
- Manufacturing/production planning (handled by Production module)
- Demand forecasting algorithms (basic patterns only)
- External warehouse management systems

### 1.4 Implementation Status

✅ **IMPLEMENTED**: The Stock Replenishment module frontend has been fully implemented with comprehensive UI pages and mock data infrastructure.

**Implemented Pages**:
- ✅ **Dashboard** (`app/(main)/store-operations/stock-replenishment/page.tsx`)
  - Critical alerts section with items below reorder point
  - Consumption analytics with period selector
  - Stock trends visualization
  - Quick actions for creating requests and viewing stock levels

- ✅ **New Request** (`app/(main)/store-operations/stock-replenishment/new/page.tsx`)
  - Location selector for destination
  - Item search with current stock display
  - Quantity input with par level reference
  - Priority selection (standard, high, urgent)
  - Reason/notes field

- ✅ **Requests List** (`app/(main)/store-operations/stock-replenishment/requests/page.tsx`)
  - Status filtering (pending, approved, in_transit, completed, rejected, cancelled)
  - Priority filtering
  - Search functionality
  - Request summary cards with status badges

- ✅ **Request Detail** (`app/(main)/store-operations/stock-replenishment/requests/[id]/page.tsx`)
  - Full request details view
  - Line items display
  - Approval/rejection workflow buttons
  - Timeline/history section
  - Comments section

- ✅ **Stock Levels** (`app/(main)/store-operations/stock-replenishment/stock-levels/page.tsx`)
  - Par level monitoring dashboard
  - Current stock vs par level comparison
  - Items below reorder point highlighted
  - Location-based filtering

- ✅ **History** (`app/(main)/store-operations/stock-replenishment/history/page.tsx`)
  - Completed transfers history
  - Date filtering
  - Transfer details view

**Implemented Mock Data** (`lib/mock-data/stock-replenishment.ts`):
- ✅ Critical alerts data structure
- ✅ Par level configurations
- ✅ Stock level data by location
- ✅ Replenishment requests with status tracking
- ✅ Transfer history data

**Status Values Implemented**:
- `pending` - Request submitted, awaiting approval
- `approved` - Request approved, pending transfer
- `in_transit` - Items dispatched, en route
- `completed` - Transfer received and confirmed
- `rejected` - Request rejected with reason
- `cancelled` - Request cancelled by requestor

**Priority Values Implemented**:
- `standard` - Normal processing time
- `high` - Expedited processing
- `urgent` - Immediate attention required

**Par Level Thresholds**:
- Reorder Point: 40% of par level
- Minimum Level: 30% of par level (critical threshold)

**Pending Backend Implementation**:
- ❌ Database schema (6 tables documented in DD-stock-replenishment.md)
- ❌ Server actions for business logic
- ❌ Real-time inventory monitoring system
- ❌ Automated recommendation engine
- ❌ Integration with inventory management system
- ❌ Integration with purchasing system
- ❌ Integration with workflow engine

---

## 2. Business Context

### 2.1 Current Challenges

**Operational Issues**:
1. **Manual Monitoring**: Staff manually check stock levels daily, consuming significant time
2. **Inconsistent Par Levels**: Different staff use different standards for "enough" stock
3. **Reactive Approach**: Replenishment initiated only after stockouts occur
4. **Poor Visibility**: Central warehouse doesn't know which locations need replenishment
5. **Emergency Situations**: Frequent urgent transfers disrupting operations
6. **Over-Ordering**: Fear of stockouts leads to excessive inventory and waste
7. **No Historical Data**: Cannot analyze consumption patterns or improve forecasting

**Personas Affected**:
- **Store Manager Maria**: Spends 2 hours daily checking stock levels and creating transfer requests
- **Warehouse Manager William**: Receives urgent transfer requests without advance notice
- **Chef Carlos**: Kitchen runs out of ingredients mid-service due to poor planning
- **Purchasing Manager Patricia**: Creates emergency purchase orders at premium prices

### 2.2 Target Business Outcomes

**Operational Improvements**:
1. **Proactive Replenishment**: System monitors levels and suggests replenishment before stockouts
2. **Standardized Par Levels**: Consistent inventory standards across all locations
3. **Predictable Transfers**: Warehouse can plan and batch replenishment deliveries
4. **Reduced Emergencies**: Fewer urgent transfers and emergency purchases
5. **Data-Driven Decisions**: Historical consumption patterns inform reorder points
6. **Optimal Stock Levels**: Balance between availability and carrying costs

---

## 3. User Roles and Permissions

### 3.1 Store Manager (Maria)

**Responsibilities**:
- Set and maintain par levels for location's items
- Review replenishment recommendations daily
- Create replenishment requests for needed items
- Receive and confirm stock transfers
- Monitor stock levels and consumption patterns

**Permissions**:
- View inventory levels for assigned location
- Configure par levels for location items
- Create replenishment requests
- Approve/reject replenishment recommendations
- View consumption history and reports
- Receive stock transfers

**Business Rules**:
- Can only configure par levels for items in their location
- Cannot modify par levels for controlled items (requires manager approval)
- Must confirm received transfers within 24 hours
- Cannot create transfers exceeding location capacity

### 3.2 Warehouse Manager (William)

**Responsibilities**:
- Review and approve replenishment requests from locations
- Allocate inventory from central warehouse to locations
- Plan and schedule stock transfer deliveries
- Monitor central warehouse stock levels
- Coordinate with purchasing for warehouse replenishment

**Permissions**:
- View all locations' inventory levels and requests
- Approve/reject replenishment requests
- Create and execute stock transfers
- View warehouse inventory and availability
- Generate replenishment reports
- Configure warehouse par levels

**Business Rules**:
- Must verify stock availability before approving requests
- Cannot transfer more than available warehouse stock
- Must schedule transfers within requested timeframe
- Required to document partial fulfillment reasons

### 3.3 Department Manager (Daniel)

**Responsibilities**:
- Approve par level changes for department items
- Review consumption patterns and trends
- Approve high-value replenishment requests
- Set replenishment policies for department

**Permissions**:
- View department-wide inventory levels
- Approve par level configurations
- Approve replenishment requests above threshold
- View department consumption analytics
- Configure department replenishment rules

**Business Rules**:
- Approval required for par level changes > 20% of previous level
- Must approve replenishment requests > $5,000 value
- Can override automated recommendations with justification
- Review and approve monthly consumption reports

### 3.4 Purchasing Manager (Patricia)

**Responsibilities**:
- Monitor warehouse stock levels
- Create purchase requests for warehouse replenishment
- Coordinate with vendors for timely deliveries
- Review replenishment trends for better forecasting

**Permissions**:
- View all replenishment requests and patterns
- Access consumption analytics across locations
- Create purchase requests for warehouse
- View replenishment forecasts
- Configure automatic purchase request triggers

**Business Rules**:
- Notified when warehouse stock below reorder point
- Must create purchase requests within 24 hours of alert
- Cannot modify location-to-location transfer requests
- Required to maintain vendor lead time data

### 3.5 System Administrator (System)

**Responsibilities**:
- Configure replenishment engine parameters
- Set up automatic alert thresholds
- Maintain integration with inventory system
- Monitor system performance and accuracy

**Permissions**:
- Configure system-wide replenishment rules
- Set up automatic recommendation engine
- Configure alert thresholds and frequencies
- Access all replenishment data and logs
- Configure integrations

---

## 4. Business Processes

### 4.1 Par Level Configuration

**Trigger**: New item added to location, seasonal changes, or periodic review

**Process Flow**:
1. Store Manager identifies item needing par level configuration
2. System suggests initial par level based on:
   - Item category averages
   - Location type and size
   - Historical consumption (if available)
3. Store Manager reviews suggestion and adjusts if needed
4. If adjustment > 20% from suggestion:
   - Requires Department Manager approval
   - Must provide justification
5. System calculates:
   - Maximum level = Par level
   - Minimum level = Par level × 0.3 (30% threshold)
   - Reorder point = Par level × 0.4 (40% threshold)
6. Configuration saved and effective immediately
7. System begins monitoring against new levels

**Frequency**: Initial setup, quarterly review, or as needed

**Business Rules**:
- Minimum par level = 1 unit (cannot be zero)
- Maximum par level = Location storage capacity
- Reorder point must be > minimum level
- Lead time considerations included in calculations

---

### 4.2 Automated Inventory Monitoring

**Trigger**: Real-time inventory transactions (issues, transfers, adjustments)

**Process Flow**:
1. **Continuous Monitoring**:
   - System monitors all inventory transactions
   - Updates current stock levels in real-time
   - Calculates stock position = On-hand + On-order - Reserved

2. **Threshold Detection**:
   - Compare current level vs reorder point
   - Check if level < reorder point
   - Calculate days of supply remaining

3. **Alert Generation** (if below reorder point):
   - Create replenishment alert
   - Calculate required quantity = Par level - Current level
   - Estimate urgency based on consumption rate
   - Notify Store Manager via dashboard and email

4. **Recommendation Creation**:
   - Suggest replenishment source (warehouse or purchase)
   - Calculate optimal order quantity
   - Estimate delivery timeframe
   - Add to replenishment queue

**Frequency**: Real-time, continuous

**Business Rules**:
- Monitor only active items with configured par levels
- Skip monitoring for items marked as discontinued
- Consider lead time when calculating urgency
- Group low-value items to reduce transaction volume

---

### 4.3 Replenishment Request Creation

**Trigger**: System recommendation, manual store manager request, or scheduled review

**Process Flow**:

**Method A: From System Recommendation**:
1. Store Manager views replenishment dashboard
2. Reviews recommended items list with:
   - Current stock level and par level
   - Suggested quantity and source
   - Estimated delivery timeframe
   - Urgency indicator
3. Store Manager can:
   - Accept recommendation as-is
   - Modify quantity (requires reason if >20% change)
   - Defer to later date
   - Reject with reason
4. For accepted items, system creates replenishment request
5. Request submitted for warehouse approval

**Method B: Manual Request**:
1. Store Manager searches for specific item
2. Enters required quantity
3. Selects requested delivery date
4. Provides reason/justification
5. System validates:
   - Item exists and is active
   - Quantity doesn't exceed location capacity
   - Requested date is reasonable (within 30 days)
6. Request submitted for approval

**Request Contents**:
- Request Number (auto-generated: REP-YYYY-NNNN)
- From Location (requesting location)
- To Location (destination = requesting location)
- Request Date
- Required By Date
- Status (pending, approved, in_transit, completed, rejected, cancelled)
- Line Items:
  - Product
  - Requested Quantity
  - Current Stock Level
  - Par Level
  - Reason/Justification

**Business Rules**:
- Minimum 1 item per request
- Maximum 100 items per request
- Cannot request discontinued items
- Requested quantity cannot exceed (Par level × 2)
- Must specify required date (max 30 days out)
- Urgent requests (required within 24 hours) require approval

---

### 4.4 Replenishment Request Approval

**Trigger**: New replenishment request submitted

**Process Flow**:
1. **Warehouse Manager Review**:
   - Receives notification of new request
   - Reviews request details and requested items
   - Checks warehouse stock availability for each item

2. **For Each Line Item**:
   - If stock available >= requested quantity:
     * Mark item as "approved"
     * Reserve stock for this transfer
   - If stock available < requested quantity but > 0:
     * Approve partial quantity
     * Add comment explaining partial fulfillment
     * Create alert for purchasing to replenish warehouse
   - If stock unavailable (0):
     * Mark as "rejected"
     * Provide reason and expected availability date
     * Create alert for purchasing

3. **Request Decision**:
   - If all items approved: Request status = "approved"
   - If some items approved: Request status = "partially_approved"
   - If no items approved: Request status = "rejected"

4. **Notification**:
   - Store Manager notified of approval decision
   - For partial approvals, given option to:
     * Accept partial fulfillment
     * Cancel entire request
     * Defer until full stock available

5. **Stock Transfer Creation**:
   - System automatically creates stock transfer document
   - Transfer scheduled based on requested date
   - Warehouse team notified to prepare items

**Business Rules**:
- Approval required within 4 hours for urgent requests
- Approval required within 24 hours for standard requests
- Warehouse Manager can override approval for strategic reasons
- Partial approvals must be at least 50% of requested quantity
- Cannot approve more than requested quantity
- Must provide reason for all rejections

---

### 4.5 Stock Transfer Execution

**Trigger**: Replenishment request approved

**Process Flow**:
1. **Transfer Preparation**:
   - Warehouse team receives picking list
   - Items picked and packed for transfer
   - Quality check performed
   - Packing slip generated with:
     * Transfer number
     * Items and quantities
     * Batch/lot numbers (if applicable)
     * Expiry dates (if applicable)

2. **Transfer Dispatch**:
   - Items loaded for delivery
   - Transfer status updated to "in_transit"
   - Estimated arrival time shared with receiving location
   - Store Manager notified of dispatch

3. **Transfer Receipt**:
   - Store Manager receives items
   - Verifies quantities match packing slip
   - Checks quality and condition
   - For Each Item:
     * If quantity correct: Accept item
     * If quantity short: Note discrepancy and accept partial
     * If quality issue: Reject item with photos/notes

4. **Inventory Update**:
   - Warehouse inventory decreased by transferred quantity
   - Location inventory increased by received quantity
   - Discrepancies logged for investigation
   - Transfer status updated to "completed"

5. **Documentation**:
   - Transfer receipt signed by Store Manager
   - Any discrepancies documented
   - System creates inventory transactions:
     * Issue transaction from warehouse
     * Receipt transaction at location
   - Both transactions linked to transfer document

**Business Rules**:
- Must receive transfer within 48 hours of dispatch
- Discrepancies > 5% require investigation
- Cannot receive more than dispatched quantity
- Rejected items must be returned to warehouse
- Temperature-sensitive items checked and recorded
- FIFO/FEFO principles maintained

---

### 4.6 Consumption Pattern Analysis

**Trigger**: Daily scheduled job, or manual analysis request

**Process Flow**:
1. **Data Collection**:
   - System retrieves inventory transactions for analysis period
   - Filters for issue transactions (consumption)
   - Groups by location, product, and time period

2. **Pattern Calculation**:
   - **Average Daily Consumption**: Total issued ÷ days in period
   - **Peak Consumption**: Maximum daily issue quantity
   - **Consumption Trend**: Linear regression of daily usage
   - **Variability**: Standard deviation of daily consumption
   - **Days of Supply**: Current stock ÷ average daily consumption

3. **Recommendation Updates**:
   - **Reorder Point** = (Avg daily consumption × Lead time) + Safety stock
   - **Safety Stock** = (Peak consumption - Avg consumption) × Lead time factor
   - **Par Level** = Reorder point + (Avg daily consumption × Review period)

4. **Alert Generation**:
   - If consumption increased > 25%: Alert to review par levels
   - If consumption decreased > 25%: Suggest par level reduction
   - If high variability: Recommend increasing safety stock
   - If consistent low usage: Suggest discontinuing item

5. **Report Generation**:
   - Monthly consumption reports by location and category
   - Trending analysis showing increases/decreases
   - Slow-moving and fast-moving item lists
   - Recommendations for par level adjustments

**Frequency**:
- Daily consumption updates
- Weekly pattern analysis
- Monthly comprehensive reports
- Quarterly par level review recommendations

**Business Rules**:
- Minimum 30 days of data required for reliable patterns
- Exclude outlier days (holidays, special events) with flag
- Weight recent data higher than older data
- Consider seasonality for annual planning items

---

### 4.7 Emergency Replenishment

**Trigger**: Critical stockout or urgent operational need

**Process Flow**:
1. **Emergency Request Creation**:
   - Store Manager creates request with "urgent" flag
   - Must provide justification for urgency
   - Specifies required timeframe (immediate, within 4 hours, etc.)

2. **Expedited Approval**:
   - Warehouse Manager receives immediate alert
   - Must respond within 30 minutes
   - Can approve emergency transfer even if affects other requests

3. **Priority Fulfillment**:
   - Emergency requests prioritized over standard requests
   - Warehouse team prepares items immediately
   - Express delivery arranged if needed

4. **Exception Handling**:
   - If warehouse stock insufficient:
     * Option 1: Transfer from another location
     * Option 2: Emergency purchase from local supplier
     * Option 3: Substitute item approval process
   - Department Manager notified of emergency situation
   - Post-event review required to prevent recurrence

**Business Rules**:
- Limited to 2 emergency requests per location per week
- Requires Department Manager approval if >3 emergencies per month
- Must document root cause and prevention plan
- Emergency requests tracked and reviewed quarterly
- Cannot abuse emergency process for poor planning

---

## 5. Business Rules

### BR-SREP-001: Par Level Configuration Rules

**Rule**: Par levels must be configured before replenishment monitoring begins.

**Details**:
- Minimum par level = 1 unit
- Maximum par level = Location storage capacity for that item
- Par level must be greater than reorder point
- Par level changes > 20% from current require Department Manager approval
- Par level must consider:
  * Average consumption rate
  * Lead time for replenishment
  * Storage space available
  * Shelf life (for perishables)

**Rationale**: Ensures logical and sustainable inventory levels.

---

### BR-SREP-002: Reorder Point Calculation

**Rule**: System automatically calculates reorder point based on consumption and lead time.

**Formula**:
```
Reorder Point = (Average Daily Consumption × Lead Time in Days) + Safety Stock

Safety Stock = (Maximum Daily Consumption - Average Daily Consumption) × Lead Time Factor

Lead Time Factor = 1.5 for reliable sources, 2.0 for variable sources
```

**Details**:
- Reorder point must be between 30% and 60% of par level
- Updated automatically when consumption patterns change significantly (>25%)
- Can be manually overridden by Store Manager with approval

**Rationale**: Ensures replenishment initiated with enough time to avoid stockouts.

---

### BR-SREP-003: Minimum Stock Level

**Rule**: Minimum stock level set at 30% of par level as "danger zone" threshold.

**Details**:
- Items below minimum level trigger "critical" priority alerts
- Store Manager must justify why stock reached minimum level
- Repeated minimum level violations trigger par level review
- System escalates to Department Manager if minimum level hit 3 times in 30 days

**Rationale**: Provides early warning system before stockouts occur.

---

### BR-SREP-004: Replenishment Quantity Calculation

**Rule**: System calculates optimal replenishment quantity to restore stock to par level.

**Formula**:
```
Replenishment Quantity = Par Level - (Current Stock + Pending Transfers)
```

**Adjustments**:
- Round up to next packaging unit (case, box, pallet)
- Consider minimum order quantities for purchased items
- Factor in storage capacity constraints
- Apply waste factor for high-shrinkage items

**Rationale**: Restores inventory to optimal level while respecting practical constraints.

---

### BR-SREP-005: Request Approval Thresholds

**Rule**: Replenishment requests above certain thresholds require additional approvals.

**Approval Tiers**:
- Tier 1: Up to $1,000 value → Warehouse Manager only
- Tier 2: $1,001 - $5,000 → Warehouse Manager + Store Manager
- Tier 3: Above $5,000 → + Department Manager approval
- Tier 4: Emergency requests → + Department Manager (always)

**Rationale**: Ensures appropriate oversight for high-value or unusual requests.

---

### BR-SREP-006: Stock Allocation Priority

**Rule**: When warehouse stock is limited, allocation follows priority rules.

**Priority Order**:
1. Emergency/urgent requests
2. Items below minimum level (critical)
3. Items below reorder point (standard)
4. Items approaching reorder point (proactive)
5. Scheduled replenishment requests

**Tiebreaker**: Within same priority, first-come-first-served.

**Rationale**: Ensures critical needs are met first while treating similar requests fairly.

---

### BR-SREP-007: Transfer Timeline Rules

**Rule**: Stock transfers must be completed within specified timeframes.

**Timeframes**:
- **Urgent**: Request approval within 30 minutes, transfer within 4 hours
- **Priority**: Request approval within 4 hours, transfer within 24 hours
- **Standard**: Request approval within 24 hours, transfer within 48 hours
- **Scheduled**: Approved in advance, transferred on scheduled date

**Details**:
- Store Manager must specify required-by date when creating request
- System calculates appropriate category based on urgency
- Overdue transfers escalated to Department Manager
- Chronic delays trigger supplier/process review

**Rationale**: Ensures timely replenishment while allowing for planning and batching.

---

### BR-SREP-008: Partial Fulfillment Rules

**Rule**: Warehouse Manager can approve partial quantities when full stock unavailable.

**Requirements**:
- Minimum 50% of requested quantity must be available for partial approval
- Must provide explanation for partial fulfillment
- Store Manager must accept or reject partial fulfillment
- Rejected partial requests remain in system as "pending full stock"
- System creates alert to purchase remaining quantity

**Exceptions**:
- Critical/urgent requests: Even <50% partial acceptable with approval
- Perishable items: Cannot do partial fulfillment if remainder arrives post-expiry
- High-value items: Store Manager consulted before partial approval

**Rationale**: Balances need to provide some support against inefficiency of tiny transfers.

---

### BR-SREP-009: Consumption Data Requirements

**Rule**: Minimum data history required before system generates automatic recommendations.

**Requirements**:
- Minimum 30 days of transaction data required
- At least 10 consumption transactions required
- Data must span at least 3 different weeks
- Excludes outlier days (marked as special events)

**If Insufficient Data**:
- System uses category averages and location type defaults
- Recommendations marked as "estimated - verify accuracy"
- Store Manager must manually review and approve
- System collects data to improve future recommendations

**Rationale**: Ensures recommendations based on reliable data patterns.

---

### BR-SREP-010: Multi-Location Transfer Rules

**Rule**: Items can be transferred between operational locations when warehouse stock unavailable.

**Process**:
1. Warehouse Manager identifies location with excess stock
2. Contacts Store Manager of source location for approval
3. If approved, creates inter-location transfer
4. Source location ships directly to destination location
5. Both locations' inventory updated
6. Warehouse notified to replenish source location

**Restrictions**:
- Source location must have stock > their par level
- Cannot transfer below source location's minimum level
- Both Store Managers must approve
- Cannot be used for emergency requests (too slow)

**Rationale**: Maximizes use of existing stock while maintaining safety levels.

---

### BR-SREP-011: Automatic vs Manual Replenishment

**Rule**: System generates automatic recommendations; Store Manager decides to act.

**Automatic Recommendations**:
- Generated daily based on stock levels and consumption
- Prioritized by urgency (critical, high, medium, low)
- Displayed on replenishment dashboard
- Can be accepted, modified, deferred, or rejected

**Manual Requests**:
- Store Manager can create request anytime for any item
- Not required to have automatic recommendation
- Must provide justification
- Subject to same approval process

**Balance**:
- Encourage use of automatic recommendations for consistency
- Allow manual requests for special circumstances
- Track ratio of auto vs manual for process improvement

**Rationale**: Automation improves efficiency while preserving human judgment.

---

### BR-SREP-012: Expiry Date Management

**Rule**: Replenishment considers shelf life and expiry dates.

**For Perishable Items**:
- System calculates maximum replenishment based on shelf life
- Formula: `Max Qty = Average Daily Consumption × Shelf Life Days × Safety Factor`
- Safety Factor = 0.7 (to ensure use before expiry)
- Transfers prioritize oldest stock (FEFO - First Expired, First Out)
- Receiving location must have capacity to use before expiry

**Alerts**:
- Items with <30% shelf life remaining flagged for priority use
- Items with <10% shelf life flagged for markdown or disposal
- System suggests reduced par levels if consistent expiry issues

**Rationale**: Minimizes waste from expired inventory.

---

### BR-SREP-013: Seasonal Adjustments

**Rule**: Par levels can be seasonally adjusted for items with predictable patterns.

**Seasonal Factors**:
- Summer/Winter seasonal multipliers
- Holiday period adjustments
- Event-based modifications (conference season, wedding season, etc.)
- Advance notice period for seasonal changes (30 days recommended)

**Process**:
1. Department Manager reviews historical seasonal patterns
2. Configures seasonal multipliers per item or category
3. System automatically adjusts par levels during seasonal periods
4. Adjustments reviewed and confirmed annually

**Example**:
- Ice cream: Summer multiplier = 1.5, Winter multiplier = 0.7
- Soup ingredients: Summer multiplier = 0.8, Winter multiplier = 1.3

**Rationale**: Aligns inventory levels with predictable demand changes.

---

## 6. Functional Requirements

### FR-SREP-001: Replenishment Dashboard

**Requirement**: Provide comprehensive dashboard showing replenishment status and recommendations.

**Dashboard Sections**:

1. **Critical Alerts** (items below minimum level):
   - Product name, current level, minimum level, par level
   - Days until stockout (estimated)
   - Recommended action and urgency
   - One-click create request button

2. **Recommended Replenishments** (items below reorder point):
   - Product, current level, reorder point, par level
   - Suggested quantity and source
   - Priority ranking
   - Bulk accept/reject actions

3. **Pending Requests**:
   - Request number, status, items count
   - Requested date, required by date
   - Approval status and pending approvals
   - Days until delivery

4. **Recent Transfers**:
   - Transfer number, status
   - Items count, total value
   - Dispatch and receipt dates
   - Outstanding receipt confirmations

5. **Performance Metrics**:
   - Stockout incidents (current period)
   - Average days of supply
   - On-time fulfillment rate
   - Average approval time

**Access**: Store Managers, Warehouse Managers, Department Managers

---

### FR-SREP-002: Par Level Configuration Interface

**Requirement**: Allow Store Managers to configure and maintain par levels.

**Features**:
- Search and filter items by category, status, or par level status
- Bulk configuration for similar items
- System-suggested par levels with reasoning
- Historical consumption graph for context
- Side-by-side comparison of current vs proposed levels
- Approval workflow for significant changes
- Seasonal adjustment configuration
- Import/export par level templates

**Validations**:
- Par level > 0
- Par level < Location storage capacity
- Changes >20% flagged for approval
- Reorder point automatically recalculated

**Access**: Store Managers (create/modify), Department Managers (approve)

---

### FR-SREP-003: Replenishment Request Creation

**Requirement**: Enable users to create replenishment requests manually or from recommendations.

**Input Fields**:
- Requesting location (auto-filled from user context)
- Required by date (date picker)
- Priority level (urgent, standard, scheduled)
- Items list:
  * Product (searchable dropdown)
  * Requested quantity
  * Current stock level (read-only)
  * Par level (read-only)
  * Reason/notes (required if not from recommendation)

**Actions**:
- Add items individually or from recommendations
- Remove items before submission
- Save as draft
- Submit for approval
- Cancel request

**Validations**:
- Minimum 1 item required
- Quantities must be positive
- Required by date must be future date
- Cannot exceed par level × 2

**Access**: Store Managers

---

### FR-SREP-004: Request Approval Interface

**Requirement**: Allow Warehouse Managers to review and approve replenishment requests.

**Features**:
- Queue of pending requests sorted by priority and date
- Request detail view with all items and requestor information
- Real-time warehouse stock availability check for each item
- Line-item approval/rejection with reasons
- Partial quantity approval capability
- Bulk approve all items (if stock available)
- Schedule transfer date selection
- Comments and internal notes

**Actions**:
- Approve request (all items)
- Approve with modifications (partial quantities)
- Reject request with reason
- Defer decision (request more information)
- Create purchase alert for out-of-stock items

**Notifications**:
- Requestor notified of approval decision
- Warehouse team notified to prepare transfer
- Purchasing notified if items need to be ordered

**Access**: Warehouse Managers, Department Managers

---

### FR-SREP-005: Stock Transfer Management

**Requirement**: Manage stock transfers from request to receipt.

**Transfer Lifecycle**:

1. **Creation** (automatic from approved request):
   - Transfer number generated
   - Items and quantities listed
   - Source and destination locations
   - Scheduled transfer date

2. **Preparation**:
   - Warehouse team prints picking list
   - Items picked and status updated
   - Packing slip generated
   - Batch/lot/expiry tracking

3. **Dispatch**:
   - Items loaded for delivery
   - Status updated to "in_transit"
   - Receiving location notified with ETA
   - Inventory reserved at warehouse

4. **Receipt**:
   - Store Manager views pending receipts
   - Confirms items and quantities received
   - Notes any discrepancies
   - Captures signature and timestamp

5. **Completion**:
   - Inventory transactions created at both locations
   - Transfer status updated to "completed"
   - Discrepancies flagged for investigation
   - Documents archived

**Features**:
- Mobile-friendly receipt interface
- Photo upload for damaged/incorrect items
- Barcode scanning support
- Partial receipt capability
- Return/rejection workflow

**Access**: Warehouse Staff (prepare), Delivery Staff (dispatch), Store Managers (receive)

---

### FR-SREP-006: Consumption Analytics

**Requirement**: Provide analytics on consumption patterns to inform replenishment decisions.

**Reports**:

1. **Consumption Trends**:
   - Line graph of daily/weekly/monthly consumption
   - Comparison to previous periods
   - Trend line and forecast
   - Seasonal pattern identification

2. **Fast/Slow Movers**:
   - Top 20 items by consumption volume
   - Bottom 20 items (candidates for discontinuation)
   - Turn ratio and days of supply
   - Recommendations for par level adjustments

3. **Stockout Analysis**:
   - Stockout incidents log
   - Root cause categorization
   - Financial impact estimation
   - Prevention recommendations

4. **Replenishment Efficiency**:
   - Average approval time
   - Average delivery time
   - On-time fulfillment rate
   - Stockout prevention rate

5. **Cost Analysis**:
   - Inventory carrying costs
   - Emergency purchase costs
   - Waste/expiry costs
   - Opportunity costs from stockouts

**Filters**: Location, category, product, date range

**Export**: PDF, Excel, CSV

**Access**: Store Managers (own location), Department Managers (department), Executives (all)

---

### FR-SREP-007: Alert and Notification System

**Requirement**: Proactive alerts to prevent stockouts and improve response times.

**Alert Types**:

1. **Critical Stock Level**:
   - Trigger: Item below minimum level
   - Recipients: Store Manager, Department Manager
   - Frequency: Immediate, then daily until resolved
   - Action: Create replenishment request

2. **Reorder Point Reached**:
   - Trigger: Item at or below reorder point
   - Recipients: Store Manager
   - Frequency: Once, then reminder after 24 hours
   - Action: Review and approve recommendation

3. **Request Approval Pending**:
   - Trigger: Request awaiting approval >4 hours
   - Recipients: Warehouse Manager, escalate to Department Manager
   - Frequency: Every 4 hours
   - Action: Approve or reject request

4. **Transfer Overdue**:
   - Trigger: Transfer not received by required date
   - Recipients: Store Manager, Warehouse Manager
   - Frequency: Daily
   - Action: Expedite delivery or create emergency request

5. **Consumption Pattern Change**:
   - Trigger: Consumption change >25% over 7 days
   - Recipients: Store Manager, Department Manager
   - Frequency: Weekly summary
   - Action: Review and adjust par levels

6. **Warehouse Stock Low**:
   - Trigger: Warehouse stock below reorder point
   - Recipients: Warehouse Manager, Purchasing Manager
   - Frequency: Immediate
   - Action: Create purchase request

**Delivery Channels**:
- In-app dashboard notifications
- Email alerts
- SMS for urgent/critical alerts
- Mobile push notifications

**Configuration**:
- Users can configure alert preferences
- Quiet hours setting (no alerts during specified times)
- Alert threshold customization

---

### FR-SREP-008: Mobile Interface

**Requirement**: Mobile-optimized interface for on-the-go replenishment management.

**Mobile Features**:

1. **Quick Status View**:
   - Critical alerts count with one-tap access
   - Pending approvals count
   - Pending receipts count
   - Quick search for item stock level

2. **Create Request**:
   - Simplified item selection
   - Barcode scanning to add items
   - Voice input for quantities
   - Photo attachment for context

3. **Approve Requests**:
   - Swipe to approve/reject
   - Quick stock availability check
   - One-tap partial approval
   - Voice notes for comments

4. **Receive Transfers**:
   - Scan barcode to confirm receipt
   - Photo capture for discrepancies
   - Digital signature capture
   - Offline mode with sync

**Responsive Design**:
- Works on tablets and phones
- Touch-optimized controls
- Minimal data usage
- Offline capability for core functions

---

### FR-SREP-009: Integration with Inventory Management

**Requirement**: Seamless integration with core inventory system.

**Integration Points**:

1. **Real-Time Stock Levels**:
   - Replenishment system reads current stock from inventory
   - Updates reflected immediately after inventory transactions
   - Pending transfers considered in available stock calculation

2. **Transaction Creation**:
   - Replenishment transfers create inventory transactions automatically
   - Issue transaction at warehouse location
   - Receipt transaction at destination location
   - Transactions linked to transfer document

3. **Product Master Data**:
   - Product information pulled from master catalog
   - UOM, packaging, and storage requirements
   - Shelf life and expiry date tracking
   - Item category and classification

4. **Location Master Data**:
   - Location information and storage capacity
   - Location type and operational characteristics
   - Department and cost center associations

5. **Batch/Lot Tracking**:
   - Batch/lot numbers carried through transfers
   - Expiry date tracking
   - FEFO enforcement

**Data Flow**:
```
Inventory System → Stock Levels → Replenishment Monitoring → Alerts
Replenishment Request → Approval → Transfer → Inventory Transactions → Inventory System
```

---

### FR-SREP-010: Integration with Purchase Request System

**Requirement**: Trigger purchase requests when warehouse stock needs replenishment.

**Integration Points**:

1. **Warehouse Stock Monitoring**:
   - Replenishment system monitors warehouse stock levels
   - Alerts when warehouse stock below reorder point
   - Calculates required purchase quantity

2. **Automatic PR Creation**:
   - System can automatically create purchase request
   - Populated with items below reorder point
   - Quantities calculated to restore to par level
   - Assigned to Purchasing Manager for review

3. **Manual PR Trigger**:
   - Warehouse Manager can manually trigger PR creation
   - Select specific items for purchasing
   - Adjust quantities as needed
   - Add special instructions

4. **PR Status Tracking**:
   - Replenishment system tracks PR status
   - Knows expected delivery dates
   - Factors expected deliveries into stock calculations
   - Alerts if PRs delayed

**Business Rules**:
- Automatic PR creation only for items with configured lead times and vendors
- Manual review required for high-value items
- Consolidate multiple alerts into single PR daily
- Consider MOQ and packaging when calculating quantities

---

## 7. Non-Functional Requirements

### NFR-SREP-001: Performance

**Requirements**:
- Real-time stock level updates (<2 seconds)
- Dashboard loads in <3 seconds
- Recommendation generation completes in <5 seconds
- Mobile app responsive on 3G networks
- Support 1000+ concurrent users
- 99.5% uptime during business hours

### NFR-SREP-002: Scalability

**Requirements**:
- Support 100+ locations
- Handle 10,000+ SKUs per location
- Process 1000+ replenishment requests per day
- Store 2+ years of consumption history
- Handle 10,000+ inventory transactions per day

### NFR-SREP-003: Security

**Requirements**:
- Role-based access control (RBAC)
- Row-level security for location data
- Audit trail for all configuration changes
- Encrypted data transmission
- Regular security audits
- Comply with data privacy regulations

### NFR-SREP-004: Reliability

**Requirements**:
- Automated backup of configuration data daily
- Graceful degradation if integrations unavailable
- Offline mode for critical functions (receipt)
- Data validation to prevent corruption
- Error recovery procedures documented

### NFR-SREP-005: Usability

**Requirements**:
- Intuitive interface requiring <30 minutes training
- Mobile-friendly responsive design
- Accessibility compliance (WCAG 2.1 AA)
- Consistent with other modules' UX
- Multilingual support

### NFR-SREP-006: Maintainability

**Requirements**:
- Modular architecture for easy updates
- Comprehensive logging for troubleshooting
- Configuration via UI (no code changes)
- API-first design for integrations
- Automated testing coverage >80%

---

## 8. Success Criteria

### 8.1 Adoption Metrics

**Targets (6 months post-launch)**:
- 90% of locations have par levels configured
- 80% of replenishment requests created from system recommendations
- 95% of Store Managers use system daily
- 85% user satisfaction score
- <5% emergency request rate (down from 25%)

### 8.2 Operational Metrics

**Targets (6 months post-launch)**:
- 80% reduction in stockout incidents
- 90% on-time transfer fulfillment rate
- <4 hours average approval time
- <24 hours average transfer time (standard requests)
- 95% inventory accuracy

### 8.3 Business Metrics

**Targets (12 months post-launch)**:
- 20% reduction in inventory carrying costs
- 30% reduction in waste from expiry/spoilage
- 70% reduction in emergency purchases
- 60% reduction in time spent on manual stock monitoring
- 15% improvement in service levels
- ROI >200% within 18 months

---

## 9. Backend Implementation Requirements

### 9.1 Server Actions Required

The following Next.js server actions must be implemented to support the replenishment workflows:

**Par Level Management**:
- `createParLevel(locationId, productId, parLevel, leadTime)` - Configure new par level
- `updateParLevel(configId, parLevel, justification)` - Update existing par level
- `getParLevelsByLocation(locationId)` - Retrieve all par levels for location
- `approveParLevelChange(configId, approverComments)` - Manager approval

**Inventory Monitoring**:
- `monitorInventoryLevels()` - Real-time monitoring job (scheduled)
- `generateReplenishmentRecommendations(locationId)` - Create recommendations
- `getActiveAlerts(locationId)` - Retrieve current alerts

**Replenishment Requests**:
- `createReplenishmentRequest(items, requiredDate, priority)` - Create request
- `submitReplenishmentRequest(requestId)` - Submit for approval
- `approveReplenishmentRequest(requestId, approvals, comments)` - Approve/reject
- `getReplenishmentRequests(status, locationId)` - Query requests

**Stock Transfers**:
- `createStockTransfer(requestId)` - Generate transfer from approved request
- `updateTransferStatus(transferId, status)` - Update transfer lifecycle
- `confirmTransferReceipt(transferId, receivedItems, signature)` - Complete receipt
- `getStockTransfers(locationId, status)` - Query transfers

**Consumption Analytics**:
- `analyzeConsumptionPatterns(locationId, productId, period)` - Calculate patterns
- `generateConsumptionReport(locationId, startDate, endDate)` - Create reports
- `identifySlowMovingItems(locationId, turnThreshold)` - Flag slow movers

### 9.2 Integration with Inventory Management System

**Inventory Valuation Methods** (Reference: `lib/types/inventory.ts` and related modules):

The Stock Replenishment module MUST integrate with the inventory management system's valuation and costing methods:

**FIFO (First-In-First-Out)**:
- Used for: Non-perishable items with batch tracking
- Implementation: When creating transfer transactions, system pulls oldest stock first
- Server Action: `getAvailableStockFIFO(productId, locationId, quantity)` returns oldest batches
- Integration Point: `tb_inventory_transaction.batch_number` tracking

**FEFO (First-Expired-First-Out)**:
- Used for: Perishable items, food products
- Implementation: Prioritize stock with nearest expiry dates
- Server Action: `getAvailableStockFEFO(productId, locationId, quantity)` returns nearest-expiry batches
- Integration Point: `tb_inventory.expiry_date` sorting
- Business Rule: Reject transfers if receiving location cannot use before expiry

**Weighted Average Costing**:
- Used for: Inventory valuation and transfer pricing
- Implementation: Calculate average cost across all batches
- Server Action: `calculateWeightedAverageCost(productId, locationId)` returns current avg cost
- Integration Point: Stock transfer values calculated using weighted average
- Update Trigger: Recalculate on every receipt transaction

**Integration Architecture**:

```
Replenishment System                    Inventory System
───────────────────                    ────────────────

Stock Level Check  ──────────────────> tb_inventory (read)
                                       ├── product_id
                                       ├── location_id
                                       ├── quantity_on_hand
                                       ├── quantity_reserved
                                       └── batch_number / expiry_date

Transfer Dispatch  ──────────────────> createInventoryTransaction()
                                       └── type: 'transfer_issue'
                                           ├── Source location stock ↓
                                           ├── Apply FIFO/FEFO logic
                                           └── Record weighted avg cost

Transfer Receipt   ──────────────────> createInventoryTransaction()
                                       └── type: 'transfer_receipt'
                                           ├── Destination location stock ↑
                                           ├── Preserve batch/expiry data
                                           └── Update weighted avg cost

Pattern Analysis   ──────────────────> tb_inventory_transaction (read)
                                       └── WHERE type = 'issue'
                                           └── Calculate consumption metrics
```

**Required Shared Methods** (to be implemented in `lib/services/inventory.service.ts`):

- `getStockLevel(productId, locationId): Promise<StockLevel>` - Current stock with FIFO/FEFO details
- `reserveStock(productId, locationId, quantity, referenceId): Promise<Reservation>` - Reserve for transfer
- `releaseStockReservation(reservationId): Promise<void>` - Cancel reservation
- `createTransferIssue(items[], fromLocation, transferRef): Promise<Transaction[]>` - Issue from warehouse
- `createTransferReceipt(items[], toLocation, transferRef): Promise<Transaction[]>` - Receipt at location
- `getConsumptionHistory(productId, locationId, startDate, endDate): Promise<Transaction[]>` - For analytics
- `applyInventoryValuation(productId, locationId, method): Promise<ValuationResult>` - FIFO/FEFO/WeightedAvg

**Data Consistency Requirements**:
- All inventory transactions must be atomic (use database transactions)
- Stock reservations must prevent overselling
- Batch/lot tracking mandatory for FIFO/FEFO items
- Expiry date validation required before transfer receipt
- Weighted average cost recalculation on every receipt
- Consumption pattern cache updated daily via scheduled job

### 9.3 Integration with Workflow Engine

**Approval Workflow Configuration** (Reference workflow engine integration patterns):

The replenishment approval process follows configurable workflow rules:

**Workflow Routing Rules**:
```typescript
// Pseudo-code for approval routing
interface ApprovalRule {
  condition: {
    requestValue?: { min?: number; max?: number }
    priority?: 'urgent' | 'standard' | 'scheduled'
    itemCount?: { min?: number; max?: number }
    department?: string
  }
  approvers: {
    role: string
    level: number  // 1 = first approver, 2 = second, etc.
    required: boolean
  }[]
  timeoutHours: number
  escalationPath: string[]
}
```

**Standard Approval Tiers**:
- Tier 1 (<$1,000): Warehouse Manager only (auto-route)
- Tier 2 ($1,000-$5,000): Warehouse Manager + Department Manager (sequential)
- Tier 3 (>$5,000): Warehouse Manager + Department Manager + Finance (parallel after WH approval)
- Tier 4 (Emergency): Department Manager pre-approval → Warehouse Manager execution

**Server Actions for Workflow**:
- `routeRequestForApproval(requestId): Promise<WorkflowInstance>` - Create workflow instance
- `getApprovalStatus(requestId): Promise<WorkflowStatus>` - Check approval progress
- `submitApprovalDecision(requestId, approverId, decision, comments): Promise<void>` - Record decision
- `escalateOverdueApproval(requestId): Promise<void>` - Escalate after timeout

### 9.4 Database Schema Requirements

**Required Tables** (see DD-stock-replenishment.md for complete DDL):

1. `tb_par_level_config` - Par level configurations
2. `tb_replenishment_request` - Request headers
3. `tb_replenishment_request_detail` - Request line items
4. `tb_stock_transfer` - Transfer documents
5. `tb_stock_transfer_detail` - Transfer line items with batch tracking
6. `tb_consumption_pattern` - Cached analytics (updated daily)

**Database Relationships**:
- `tb_par_level_config.product_id` → `tb_product.product_id` (FK)
- `tb_par_level_config.location_id` → `tb_location.location_id` (FK)
- `tb_replenishment_request_detail.request_id` → `tb_replenishment_request.request_id` (FK)
- `tb_stock_transfer.source_request_id` → `tb_replenishment_request.request_id` (FK)
- `tb_stock_transfer_detail.transfer_id` → `tb_stock_transfer.transfer_id` (FK)

**Indexes Required for Performance**:
- `idx_par_level_location_product` on `tb_par_level_config(location_id, product_id)`
- `idx_request_status_date` on `tb_replenishment_request(status, request_date)`
- `idx_transfer_status_location` on `tb_stock_transfer(status, from_location_id, to_location_id)`
- `idx_consumption_location_product_date` on `tb_consumption_pattern(location_id, product_id, analysis_date)`

### 9.5 Scheduled Jobs Requirements

**Background Jobs** (to be implemented using cron or scheduled tasks):

1. **Inventory Monitoring Job** (every 5 minutes):
   - Check all items with configured par levels
   - Compare current stock against reorder points
   - Generate alerts for items below thresholds
   - Create automatic replenishment recommendations

2. **Consumption Analysis Job** (daily at 2:00 AM):
   - Analyze previous day's consumption transactions
   - Update consumption pattern cache
   - Calculate trend metrics (7-day, 30-day averages)
   - Identify pattern changes (>25% variation)
   - Generate pattern change alerts

3. **Par Level Suggestion Job** (weekly on Sundays):
   - Review consumption patterns for all items
   - Calculate suggested par level adjustments
   - Generate par level review recommendations
   - Identify slow-moving items (turnover <2)

4. **Transfer Timeout Monitor** (hourly):
   - Check for overdue approvals (>4 hours urgent, >24 hours standard)
   - Check for overdue transfers (>48 hours dispatched)
   - Generate escalation notifications
   - Update performance metrics

---

## 10. Related Documents

- **Use Cases**: [UC-stock-replenishment.md](./UC-stock-replenishment.md)
- **Technical Specification**: [TS-stock-replenishment.md](./TS-stock-replenishment.md)
- **Data Schema**: [DD-stock-replenishment.md](./DD-stock-replenishment.md)
- **Flow Diagrams**: [FD-stock-replenishment.md](./FD-stock-replenishment.md)
- **Validations**: [VAL-stock-replenishment.md](./VAL-stock-replenishment.md)
- **Store Requisitions**: [BR-store-requisitions.md](../store-requisitions/BR-store-requisitions.md)
- **Inventory Management**: [BR-inventory-overview.md](../../inventory-management/inventory-overview/BR-inventory-overview.md)

---

**Document Control**:
- **Created**: 2025-11-12
- **Author**: Documentation Team
- **Reviewed By**: Operations Manager, Warehouse Manager, Store Managers
- **Approved By**: Chief Operations Officer
- **Next Review**: 2026-01-09
- **Version History**:
  - v1.2.0 (2025-12-09): Updated to reflect actual implementation - 6 pages with mock data
  - v1.1.0 (2025-12-05): Added implementation status, backend requirements
  - v1.0.0 (2025-11-12): Initial business requirements document

---

## Appendix A: Glossary

**Par Level**: Target inventory level that should be maintained for an item at a location

**Reorder Point**: Stock level at which replenishment should be initiated

**Minimum Level**: Critical threshold below which operations may be impacted

**Safety Stock**: Buffer stock to protect against demand variability and supply delays

**Lead Time**: Time from initiating replenishment request to receiving stock

**Days of Supply**: Number of days current stock will last at average consumption rate

**FEFO**: First Expired, First Out - inventory rotation method for perishables

**Turn Ratio**: Number of times inventory is sold/used in a period (higher is better)

**Stockout**: Situation where required item is unavailable when needed

**Carrying Cost**: Cost of holding inventory (storage, insurance, opportunity cost, etc.)

---

**End of Document**
