# UC-SREP: Stock Replenishment Use Cases

**Module**: Store Operations
**Sub-Module**: Stock Replenishment
**Document Type**: Use Cases (UC)
**Version**: 1.2.0
**Last Updated**: 2025-12-09
**Status**: Active
**Implementation Status**: IMPLEMENTED (Frontend UI Complete with Mock Data)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2.0 | 2025-12-09 | Documentation Team | Updated to reflect implemented UI pages and workflows |
| 1.1.0 | 2025-12-05 | Documentation Team | Added implementation status markers |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

**✅ IMPLEMENTATION NOTE**: The Stock Replenishment module has been implemented with a complete frontend UI supporting the use cases documented below. The implementation includes:

- **Dashboard** (`/store-operations/stock-replenishment`) - Critical alerts, consumption analytics, stock trends
- **New Request** (`/store-operations/stock-replenishment/new`) - Create transfer requests
- **Requests List** (`/store-operations/stock-replenishment/requests`) - View and filter requests
- **Request Detail** (`/store-operations/stock-replenishment/requests/[id]`) - Approval workflow
- **Stock Levels** (`/store-operations/stock-replenishment/stock-levels`) - Par level monitoring
- **History** (`/store-operations/stock-replenishment/history`) - Completed transfers

**Status Values**: `pending`, `approved`, `in_transit`, `completed`, `rejected`, `cancelled`
**Priority Values**: `standard`, `high`, `urgent`

See BR-stock-replenishment.md Section 1.4 for detailed implementation status.

---

## 1. Overview

### 1.1 Purpose

This document describes detailed use cases for the Stock Replenishment module, covering all user interactions and system behaviors. Each use case follows a structured format with preconditions, main flows, alternative flows, and expected outcomes.

### 1.2 Scope

**Covered Use Cases**:
- Par level configuration and management
- Automated inventory monitoring
- Replenishment request creation and approval
- Stock transfer execution
- Consumption pattern analysis
- Emergency replenishment procedures
- Reporting and analytics

### 1.3 Actors

| Actor | Description | Primary Goals |
|-------|-------------|---------------|
| Store Manager Maria | Manages operational location inventory | Prevent stockouts, optimize stock levels |
| Warehouse Manager William | Manages central warehouse, approves transfers | Fulfill requests efficiently, maintain warehouse stock |
| Department Manager Daniel | Oversees department operations | Ensure cost-effective inventory management |
| Purchasing Manager Patricia | Procures inventory for warehouse | Maintain warehouse stock, manage vendor relationships |
| System | Automated monitoring and recommendations | Proactive alerts, optimal recommendations |

---

## 2. Par Level Management Use Cases

### UC-SREP-001: Configure Par Level for New Item

**Actor**: Store Manager Maria

**Trigger**: New item added to location inventory that needs replenishment monitoring

**Preconditions**:
- Maria is authenticated and has "configure_par_levels" permission
- Item exists in product catalog
- Item is assigned to Maria's location
- Item does not have existing par level configuration

**Main Flow**:
1. Maria navigates to Par Level Configuration screen
2. Maria searches for item by name, code, or category
3. System displays item details:
   - Product name and code
   - Current stock level
   - UOM and packaging information
   - Category and subcategory
4. System suggests initial par level based on:
   - Category averages for similar items
   - Location type and operational volume
   - Historical data from other locations (if available)
5. System displays suggestion with rationale:
   - Suggested par level: 50 units
   - Reasoning: "Based on category average and location size"
   - Calculated reorder point: 20 units (40% of par)
   - Calculated minimum level: 15 units (30% of par)
6. Maria reviews suggestion and enters values:
   - Par Level: 50 units
   - Lead Time: 2 days
   - Special notes: "High demand on weekends"
7. System validates inputs:
   - Par level > 0 ✓
   - Par level < location storage capacity ✓
   - All required fields populated ✓
8. Maria clicks "Save Configuration"
9. System saves configuration with timestamp and user ID
10. System immediately begins monitoring item against new levels
11. System displays success message: "Par level configured successfully"
12. System returns to par level list with new item highlighted

**Postconditions**:
- Item has configured par, reorder point, and minimum levels
- System begins real-time monitoring of item
- Configuration recorded in audit log
- Item appears in Maria's replenishment dashboard

**Alternative Flow 1: Significant Change Requires Approval**:
- At Step 6, Maria enters par level that differs >20% from suggestion
- System flags configuration for Department Manager approval
- System displays warning: "Change >20% requires manager approval"
- Maria must provide justification in notes field
- Maria saves as "Pending Approval"
- System notifies Daniel of approval request
- Configuration not active until Daniel approves

**Alternative Flow 2: Storage Capacity Exceeded**:
- At Step 7, Maria enters par level exceeding location storage capacity
- System validation fails
- System displays error: "Par level exceeds storage capacity of 40 units"
- Maria must reduce par level or increase storage capacity allocation
- Maria returns to Step 6

**Business Rules Applied**:
- BR-SREP-001: Par level configuration rules
- BR-SREP-002: Reorder point calculation

---

### UC-SREP-002: Review and Adjust Existing Par Levels

**Actor**: Store Manager Maria

**Trigger**: Quarterly par level review, consumption pattern changes, or operational changes

**Preconditions**:
- Maria is authenticated with necessary permissions
- Items have existing par level configurations
- System has at least 30 days of consumption data

**Main Flow**:
1. Maria navigates to Par Level Review screen
2. System displays current par levels with analytics:
   - Item name and current par level
   - Current stock level and days of supply
   - 30-day average consumption
   - Consumption trend (increasing/stable/decreasing)
   - System recommendation for adjustment
   - Last adjustment date
3. Maria filters items by:
   - Items with high stockout risk
   - Items with excess inventory
   - Items with consumption changes >25%
   - Items with low stock turnover
4. System highlights items needing attention:
   - 🔴 3 items with stockout risk (red indicator)
   - 🟡 5 items with consumption increase >25% (yellow indicator)
   - 🟢 2 items with consumption decrease >25% (green indicator for potential reduction)
5. Maria selects item "Olive Oil - Premium" for review
6. System displays detailed analytics:
   - Current par level: 20 liters
   - Current stock: 5 liters
   - Average daily consumption: 2.5 liters
   - Peak consumption: 4 liters
   - Days of supply: 2 days
   - Consumption trend: +30% over last 30 days
   - Recommended new par level: 28 liters
   - Stockout incidents: 2 in last 30 days
7. System shows consumption graph with trend line
8. Maria reviews recommendation and decides to accept
9. Maria clicks "Apply Recommendation"
10. System calculates new values:
   - New par level: 28 liters
   - New reorder point: 11.2 liters
   - New minimum level: 8.4 liters
11. System validates and saves changes
12. System updates monitoring thresholds immediately
13. System records change in audit log with reason: "Consumption increase"
14. Maria reviews next item requiring attention

**Postconditions**:
- Par levels updated to reflect current consumption patterns
- System monitoring uses new thresholds
- Changes recorded in audit log
- Items with outdated levels reduced in backlog

**Alternative Flow 1: Manual Adjustment**:
- At Step 8, Maria disagrees with recommendation
- Maria manually enters different par level: 25 liters
- System shows comparison: Recommended 28 vs Manual 25
- Maria provides justification: "Expecting supplier reliability improvement"
- If change >20% from current, requires manager approval
- Maria saves adjustment
- System continues from Step 10

**Alternative Flow 2: Seasonal Adjustment**:
- At Step 5, Maria selects multiple seasonal items (e.g., cold beverages)
- System offers bulk seasonal adjustment option
- Maria configures seasonal multipliers:
  * Summer (Jun-Aug): 1.5x
  * Winter (Dec-Feb): 0.7x
  * Spring/Fall: 1.0x
- System will automatically adjust par levels during seasonal periods
- Maria saves seasonal configuration

---

### UC-SREP-003: Approve Par Level Change

**Actor**: Department Manager Daniel

**Trigger**: Par level change >20% submitted by Store Manager requiring approval

**Preconditions**:
- Daniel is authenticated with approval permissions
- Par level change request exists in pending status
- Request is for items in Daniel's department

**Main Flow**:
1. Daniel receives notification: "Par level approval required for 3 items"
2. Daniel navigates to Par Level Approvals queue
3. System displays pending approval requests:
   - Item name and requesting store
   - Current par level vs proposed par level
   - Percentage change and direction
   - Store Manager's justification
   - System recommendation
   - Request date
4. Daniel selects item "Wagyu Beef - A5" for review
5. System displays detailed comparison:
   - Current: 10 kg, Proposed: 15 kg (50% increase)
   - Justification: "Added Wagyu special to permanent menu. Expecting 3kg/day consumption."
   - Historical consumption: 1.2 kg/day average
   - Recent trend: Increasing 15% weekly for 4 weeks
   - System recommendation: 14 kg (supports increase but slightly lower)
   - Storage impact: Within capacity
   - Financial impact: +$500 average inventory value
6. Daniel reviews consumption graph showing upward trend
7. Daniel evaluates business justification:
   - New menu item added ✓
   - Consumption trend supports increase ✓
   - Within budget parameters ✓
8. Daniel approves request with comments: "Approved. Monitor closely for first 30 days."
9. System updates par level configuration:
   - Par level: 15 kg
   - Reorder point: 6 kg
   - Minimum level: 4.5 kg
10. System notifies Maria of approval
11. System immediately applies new monitoring thresholds
12. System records approval in audit log
13. Daniel reviews next pending approval

**Postconditions**:
- Par level change approved and activated
- Store Manager notified of approval
- System monitoring uses new values
- Approval decision recorded in audit trail
- Item removed from pending approvals queue

**Alternative Flow 1: Rejection with Feedback**:
- At Step 8, Daniel reviews and disagrees with proposed increase
- Daniel determines justification insufficient
- Daniel clicks "Reject" and provides feedback:
  * "Increase too aggressive. Suggest 12kg to start. Monitor for 60 days then reassess."
- System notifies Maria of rejection with feedback
- Par level remains at current value
- Maria can resubmit with adjusted proposal

**Alternative Flow 2: Conditional Approval**:
- At Step 8, Daniel partially approves
- Daniel modifies proposed par level to 14kg (lower than requested 15kg)
- Daniel adds condition: "Review again in 60 days with actual consumption data"
- System sets reminder for 60-day review
- System notifies Maria of conditional approval
- Par level set to 14kg (approved modified value)

**Business Rules Applied**:
- BR-SREP-001: Par level configuration rules
- BR-SREP-005: Request approval thresholds

---

## 3. Automated Monitoring Use Cases

### UC-SREP-004: Monitor Inventory Levels and Generate Alerts

**Actor**: System (automated process)

**Trigger**: Real-time inventory transaction (issue, transfer, adjustment) or daily scheduled job

**Preconditions**:
- Items have configured par levels
- System has access to real-time inventory data
- Monitoring service is running

**Main Flow**:
1. System receives inventory transaction event:
   - Transaction type: Issue
   - Location: Downtown Kitchen
   - Item: "Olive Oil - Premium"
   - Quantity: 3 liters
   - New stock level: 9 liters
2. System retrieves item's configuration:
   - Par level: 20 liters
   - Reorder point: 8 liters (40%)
   - Minimum level: 6 liters (30%)
   - Average daily consumption: 2.5 liters
   - Lead time: 2 days
3. System compares new level to thresholds:
   - Current: 9 liters
   - Check vs minimum (6L): 9 > 6 ✓ Above critical
   - Check vs reorder point (8L): 9 > 8 ✓ Above reorder point
4. No alert generated - stock level acceptable
5. System updates monitoring status: "OK"
6. System schedules next check after next transaction

**Alternative Flow 1: Reorder Point Reached**:
- At Step 1, transaction reduces stock to 7 liters
- At Step 3, system detects: 7 < 8 (reorder point)
- System calculates:
  * Days until stockout: 7L ÷ 2.5L/day = 2.8 days
  * Recommended quantity: 20L (par) - 7L (current) = 13 liters
- System generates replenishment recommendation:
  * Item: Olive Oil - Premium
  * Current: 7 liters
  * Required: 13 liters
  * Priority: Standard
  * Reason: "Below reorder point"
  * Estimated delivery: Current date + 2 days
- System adds recommendation to Store Manager's dashboard
- System sends email notification to Maria
- Maria receives alert: "3 items need replenishment" in dashboard
- Process continues in UC-SREP-006 (Create transfer request)

**Alternative Flow 2: Critical Level Reached**:
- At Step 1, transaction reduces stock to 5 liters
- At Step 3, system detects: 5 < 6 (minimum level)
- System calculates:
  * Days until stockout: 5L ÷ 2.5L/day = 2 days
  * CRITICAL STATUS
- System generates CRITICAL alert:
  * Priority: High
  * Urgency: Immediate action required
  * Recommended quantity: 15 liters
  * Impact: "Stockout expected in 2 days"
- System sends immediate notifications:
  * Dashboard alert (red badge)
  * Email to Maria (marked urgent)
  * SMS if configured
- System notifies Daniel (Department Manager) if Maria doesn't respond within 4 hours
- System suggests emergency replenishment option
- System logs incident for analysis

**Alternative Flow 3: Consumption Pattern Change Detected**:
- System runs daily analytics job
- System detects consumption increase >25% over 7 days
- System generates alert: "Consumption pattern changed for 5 items"
- System suggests par level review for affected items
- System notifies Maria and Daniel
- System updates forecasts based on new pattern

**Postconditions**:
- Inventory levels continuously monitored
- Alerts generated when thresholds crossed
- Replenishment recommendations created
- Store Managers notified of action items
- System maintains monitoring status for all items

**Business Rules Applied**:
- BR-SREP-002: Reorder point calculation
- BR-SREP-003: Minimum stock level
- BR-SREP-009: Consumption data requirements

---

## 4. Transfer Request Use Cases

### UC-SREP-005: Create Transfer Request from Recommendation

**Actor**: Store Manager Maria

**Trigger**: System recommendation appears in dashboard

**Preconditions**:
- Maria is authenticated
- System has generated replenishment recommendations
- Warehouse has stock available

**Main Flow**:
1. Maria logs into system
2. System displays dashboard with notifications:
   - 🔴 2 critical alerts (below minimum level)
   - 🟡 5 standard recommendations (below reorder point)
   - 3 pending requests awaiting approval
3. Maria clicks "Replenishment Recommendations" section
4. System displays recommended items sorted by priority:

| Priority | Item | Current | Par | Need | Source | Action |
|----------|------|---------|-----|------|--------|--------|
| 🔴 Critical | Olive Oil Premium | 5L | 20L | 15L | Warehouse | ▶️ |
| 🔴 Critical | Fresh Basil | 0.5kg | 3kg | 2.5kg | Warehouse | ▶️ |
| 🟡 Standard | Tomatoes Roma | 10kg | 25kg | 15kg | Warehouse | ▶️ |
| 🟡 Standard | Parmesan Cheese | 2kg | 8kg | 6kg | Warehouse | ▶️ |
| 🟡 Standard | Butter Unsalted | 5kg | 15kg | 10kg | Warehouse | ▶️ |

5. Maria reviews critical items first
6. Maria selects checkboxes for items to include:
   - ✅ Olive Oil Premium
   - ✅ Fresh Basil
   - ✅ Tomatoes Roma
   - ✅ Parmesan Cheese
   - ⬜ Butter Unsalted (deferred - sufficient for weekend)
7. Maria clicks "Create Request from Selected"
8. System pre-fills transfer request form:
   - Request number: TRF-2501-0123 (auto-generated)
   - From location: Central Warehouse
   - To location: Downtown Kitchen (Maria's location)
   - Request date: 2025-01-30 (today)
   - Required by date: 2025-02-01 (2 days - based on lead time)
   - Priority: High (contains critical items)
   - Items: 4 items with recommended quantities
9. Maria reviews and can adjust:
   - Modifies Olive Oil quantity from 15L to 20L (wants full par level)
   - Adds note: "Also need extra for special event on Friday"
   - Changes required date to 2025-01-31 (needs earlier)
10. System validates changes:
   - Olive Oil: 20L doesn't exceed par level ✓
   - Required date is future date ✓
   - All quantities are positive ✓
11. Maria clicks "Submit Request"
12. System saves request with status "Pending Approval"
13. System creates notification for William (Warehouse Manager)
14. System reserves quantities tentatively in warehouse
15. System displays confirmation:
   - "Request TRF-2501-0123 submitted successfully"
   - "Warehouse will review within 4 hours"
16. System removes selected items from recommendations list
17. Maria's dashboard updated with pending request

**Postconditions**:
- Replenishment request created and submitted
- Items removed from recommendations list
- Warehouse Manager notified to review
- Stock tentatively reserved in warehouse
- Request trackable by both parties

**Alternative Flow 1: Modify Recommended Quantity**:
- At Step 9, Maria significantly changes quantity (>20% from recommendation)
- System displays warning: "Quantity differs significantly from recommendation"
- Maria must provide reason in notes field
- System flags request for additional review
- Process continues from Step 10

**Alternative Flow 2: Mix Critical and Standard Items**:
- At Step 6, Maria selects both critical and standard priority items
- System determines overall priority: High (contains critical items)
- System groups items by urgency in request
- Critical items listed first
- Request tagged for expedited approval
- Process continues from Step 8

**Alternative Flow 3: Insufficient Warehouse Stock**:
- At Step 8, system checks real-time warehouse availability
- System detects: Fresh Basil only 1.5kg available (need 2.5kg)
- System shows warning: "⚠️ Fresh Basil: Only 1.5kg available"
- Maria has options:
  * Accept partial quantity (1.5kg)
  * Remove item from request
  * Create emergency purchase request
- Maria accepts partial: "1.5kg will get us through until next delivery"
- System updates request with partial quantity and note
- Process continues from Step 9

**Business Rules Applied**:
- BR-SREP-004: Replenishment quantity calculation
- BR-SREP-007: Transfer timeline rules
- BR-SREP-011: Automatic vs manual replenishment

---

### UC-SREP-006: Create Manual Transfer Request

**Actor**: Store Manager Maria

**Trigger**: Maria identifies need for items not in recommendations (special event, manual override, new requirement)

**Preconditions**:
- Maria is authenticated with necessary permissions
- Items exist in product catalog
- Items are assigned to location

**Main Flow**:
1. Maria navigates to "Create Transfer Request" page
2. System displays blank request form:
   - Request number: (auto-generated on save)
   - From location: Central Warehouse (default)
   - To location: Downtown Kitchen (auto-filled from Maria's context)
   - Request date: 2025-01-30 (today - auto-filled)
   - Required by date: (empty - must enter)
   - Priority: Standard (default)
   - Reason/Justification: (empty)
3. Maria enters required by date: 2025-02-02
4. Maria enters reason: "Special Valentine's Day menu items"
5. Maria clicks "Add Items"
6. System displays item search/selection interface
7. Maria searches for "Champagne"
8. System displays matching products:
   - Champagne - Moët & Chandon (750ml)
   - Champagne - Veuve Clicquot (750ml)
   - Champagne - Dom Pérignon (750ml)
9. Maria selects "Champagne - Moët & Chandon"
10. System displays item details and current status:
   - Current stock: 12 bottles
   - Par level: Not configured
   - Warehouse availability: 50 bottles
11. Maria enters requested quantity: 24 bottles
12. Maria provides item-level note: "Valentine's Day special - expect high demand"
13. Maria clicks "Add to Request"
14. System adds item to request
15. Maria repeats steps 7-14 for additional items:
   - Strawberries - Fresh (5kg)
   - Roses - Red (24 stems) - for table decorations
16. Maria reviews complete request:
   - 3 items totaling $850 estimated value
   - Required by: 2025-02-02 (3 days from now)
   - Priority: Standard
17. Maria clicks "Submit Request"
18. System validates:
   - Has at least 1 item ✓
   - All quantities > 0 ✓
   - Required date is future ✓
   - Justification provided ✓
   - Items available in warehouse ✓
19. System calculates approval requirements:
   - Total value $850 → Requires Warehouse Manager approval only (Tier 1: <$1,000)
20. System saves request with status "Pending Approval"
21. System notifies William (Warehouse Manager)
22. System displays confirmation message
23. Maria can track request status in "My Requests" view

**Postconditions**:
- Manual transfer request created
- Request submitted for appropriate approvals
- Warehouse Manager notified
- Request trackable by requestor

**Alternative Flow 1: High-Value Request**:
- At Step 16, total value exceeds $5,000
- At Step 19, system determines: Tier 3 approval required
- System requires additional approver: Daniel (Department Manager)
- System notifies both William and Daniel
- Request requires both approvals before proceeding
- Maria notified of approval requirements

**Alternative Flow 2: Urgent Request**:
- At Step 4, Maria selects Priority: Urgent
- At Step 4, Maria must provide urgency reason: "Kitchen equipment failure requires alternative ingredients immediately"
- System validates urgency criteria
- System requires manager pre-approval for urgent requests
- System notifies Daniel for emergency approval
- Daniel must approve before request goes to warehouse
- If approved, warehouse has 4-hour SLA

**Alternative Flow 3: Item Not in Warehouse**:
- At Step 10, system checks availability: 0 bottles in warehouse
- System displays warning: "⚠️ Item not currently available in warehouse"
- System offers alternatives:
  * Request from external supplier (creates purchase request)
  * Transfer from another location (if available)
  * Select substitute product
- Maria selects "Request from external supplier"
- System creates linked purchase request
- Maria's transfer request marked as "pending purchase"

**Business Rules Applied**:
- BR-SREP-004: Replenishment quantity calculation
- BR-SREP-005: Request approval thresholds
- BR-SREP-007: Transfer timeline rules

---

### UC-SREP-007: Approve Transfer Request

**Actor**: Warehouse Manager William

**Trigger**: New transfer request submitted and requires William's approval

**Preconditions**:
- William is authenticated with approval permissions
- Replenishment request exists in "Pending Approval" status
- William has access to approve requests for requesting location

**Main Flow**:
1. William receives notification: "New transfer request TRF-2501-0123 requires approval"
2. William navigates to "Pending Approvals" queue
3. System displays pending requests sorted by priority and required date:

| Priority | Request # | Location | Items | Value | Required By | Age |
|----------|-----------|----------|-------|-------|-------------|-----|
| 🔴 High | TRF-2501-0123 | Downtown Kitchen | 4 | $320 | 2025-01-31 | 2h |
| 🟡 Standard | TRF-2501-0122 | Banquet Hall | 8 | $550 | 2025-02-02 | 6h |
| 🟡 Standard | TRF-2501-0121 | Pool Bar | 3 | $180 | 2025-02-03 | 12h |

4. William selects TRF-2501-0123 (highest priority, approaching SLA)
5. System displays request details:
   - Request number: TRF-2501-0123
   - Requesting location: Downtown Kitchen
   - Requestor: Maria Santos
   - Request date: 2025-01-30 10:00 AM
   - Required by: 2025-01-31 12:00 PM (tomorrow)
   - Priority: High
   - Reason: "Critical items below minimum + special event Friday"
   - Status: Pending Approval
6. System displays line items with real-time availability:

| Item | Requested | Available | Status | Action |
|------|-----------|-----------|--------|--------|
| Olive Oil Premium | 20L | 45L | ✅ Sufficient | |
| Fresh Basil | 2.5kg | 1.5kg | ⚠️ Partial | |
| Tomatoes Roma | 15kg | 30kg | ✅ Sufficient | |
| Parmesan Cheese | 6kg | 12kg | ✅ Sufficient | |

7. William reviews each item:
   - Olive Oil: 45L available, approve 20L ✓
   - Fresh Basil: Only 1.5kg available, partial approval
   - Tomatoes: 30kg available, approve 15kg ✓
   - Parmesan: 12kg available, approve 6kg ✓

8. For Fresh Basil partial availability:
   - William clicks "Approve Partial"
   - William enters approved quantity: 1.5kg
   - William adds comment: "Approved 1.5kg available now. Additional 1kg arriving Monday from supplier."
   - William creates alert for purchasing: "Replenish Fresh Basil - urgent"

9. William reviews overall request decision:
   - 3 items fully approved
   - 1 item partially approved
   - Overall status: Partially Approved

10. William checks if partial acceptable or needs coordination:
    - Reviews Maria's notes: "Critical for weekend service"
    - William decides partial acceptable (60% fulfilled)
    - William adds overall comment: "Partial approval. Fresh Basil remainder arriving Monday. Can expedite if critical."

11. William clicks "Approve Request"
12. System validates approval:
    - All line items have decision ✓
    - Partial approvals have comments ✓
    - Approved quantities don't exceed availability ✓
13. System updates request status: "Partially Approved"
14. System reserves approved stock in warehouse:
    - Olive Oil: 20L reserved
    - Fresh Basil: 1.5kg reserved
    - Tomatoes: 15kg reserved
    - Parmesan: 6kg reserved
15. System creates stock transfer document:
    - Transfer number: TRF-2501-0456
    - Scheduled date: 2025-01-31 8:00 AM
    - Status: Scheduled
16. System notifies parties:
    - Maria: "Request TRF-2501-0123 partially approved. 3 items full, 1 partial. Transfer scheduled tomorrow 8 AM."
    - Warehouse team: "Prepare transfer TRF-2501-0456 for pickup/delivery"
    - Purchasing (for Fresh Basil alert): "Expedite Fresh Basil order"
17. System updates William's approval queue:
    - TRF-2501-0123 removed from pending
    - Next request (TRF-2501-0122) moved to top
18. System logs approval in audit trail
19. System updates dashboard metrics:
    - Approval completed in 2 hours (within 4-hour SLA) ✓
    - Partial fulfillment rate tracked

**Postconditions**:
- Request approved (fully or partially)
- Stock reserved in warehouse
- Transfer document created and scheduled
- Requestor notified of decision
- Warehouse team prepared for fulfillment
- Approval recorded in audit log

**Alternative Flow 1: Full Approval**:
- At Step 6, all items have sufficient stock
- At Step 7, William approves all items at requested quantities
- At Step 9, Overall status: Fully Approved
- No partial approval handling required
- Process continues from Step 11

**Alternative Flow 2: Complete Rejection**:
- At Step 6, warehouse stock insufficient for all items
- At Step 7, William determines cannot fulfill any items acceptably
- William clicks "Reject Request"
- William provides rejection reason: "Warehouse stock depleted. New shipment arriving Friday. Can fulfill Monday."
- William suggests alternative: "Can source from Uptown Location if urgent"
- System updates request status: "Rejected"
- System notifies Maria with rejection reason and alternatives
- Maria can create new request or wait for suggested date

**Alternative Flow 3: Request Requires Additional Approval**:
- At Step 5, system detects request value >$5,000
- System shows: "⚠️ This request requires Department Manager approval"
- William can review but cannot fully approve alone
- William reviews and adds recommendation: "Approved from warehouse perspective"
- System routes to Daniel (Department Manager)
- Daniel must provide final approval
- Process continues in UC-SREP-008

**Alternative Flow 4: Emergency Substitution**:
- At Step 7, critical item completely out of stock
- William identifies acceptable substitute:
  * Requested: Fresh Basil (organic) - 0 available
  * Substitute: Fresh Basil (conventional) - 3kg available
- William calls Maria to confirm substitution acceptable
- Maria approves substitution
- William documents substitution in approval notes
- William approves with substitution
- Transfer prepared with substitute item

**Business Rules Applied**:
- BR-SREP-005: Request approval thresholds
- BR-SREP-006: Stock allocation priority
- BR-SREP-007: Transfer timeline rules
- BR-SREP-008: Partial fulfillment rules

---

## 5. Stock Transfer Use Cases

### UC-SREP-008: Prepare and Dispatch Stock Transfer

**Actor**: Warehouse Staff (Warehouse Manager William oversees)

**Trigger**: Approved transfer request with scheduled transfer date

**Preconditions**:
- Replenishment request is approved
- Stock transfer document created
- Transfer scheduled date is today or past
- Stock items are available in warehouse

**Main Flow**:
1. Warehouse staff receives daily picking list
2. System displays transfers to prepare today:
   - Transfer TRF-2501-0456
   - Destination: Downtown Kitchen
   - Items: 4 items
   - Scheduled departure: 8:00 AM
   - Status: Scheduled
3. Staff selects transfer TRF-2501-0456
4. System displays detailed picking list:

| Seq | Item | Quantity | Location | Batch/Lot | Expiry | Status |
|-----|------|----------|----------|-----------|--------|--------|
| 1 | Olive Oil Premium | 20L | Shelf A-12 | LOT-2025-01-15 | 2026-01-15 | ⬜ |
| 2 | Fresh Basil | 1.5kg | Cooler B-3 | LOT-2025-01-29 | 2025-02-05 | ⬜ |
| 3 | Tomatoes Roma | 15kg | Cooler B-1 | LOT-2025-01-28 | 2025-02-04 | ⬜ |
| 4 | Parmesan Cheese | 6kg | Cooler A-5 | LOT-2025-01-20 | 2025-03-20 | ⬜ |

5. Staff picks items sequentially:
   - **Item 1: Olive Oil Premium**
     * Navigate to Shelf A-12
     * Pick 20L (2 cases of 10L each)
     * Scan barcode to confirm: LOT-2025-01-15
     * System checks batch: ✅ Correct lot, expiry acceptable
     * Mark as picked ✓
   - **Item 2: Fresh Basil**
     * Navigate to Cooler B-3
     * Pick 1.5kg
     * Scan barcode: LOT-2025-01-29
     * System checks expiry: 2025-02-05 (7 days - acceptable)
     * Staff visual quality check: Fresh, no wilting ✓
     * Mark as picked ✓
   - *[Continue for remaining items]*

6. All items picked and confirmed
7. System displays packing summary:
   - 4 items picked successfully
   - Total weight: 42kg
   - Temperature zones: 2 ambient, 2 refrigerated
   - Special handling: Fresh Basil (fragile)
8. Staff packs items:
   - Refrigerated items in insulated box with ice packs
   - Olive oil in standard box
   - Label each box with transfer number and destination
9. Staff performs quality check:
   - All quantities correct ✓
   - All batch/lot numbers recorded ✓
   - Expiry dates acceptable ✓
   - Packaging secure ✓
10. System generates packing slip:
    - Transfer number: TRF-2501-0456
    - From: Central Warehouse
    - To: Downtown Kitchen
    - Item list with quantities and batch numbers
    - Special instructions: "Refrigerated items - maintain cold chain"
11. Staff prints packing slip (2 copies)
12. Staff places one copy inside shipment
13. Staff updates transfer status: "Ready for Dispatch"
14. System notifies driver: "Transfer TRF-2501-0456 ready for pickup"
15. Driver loads items on vehicle
16. Driver scans transfer barcode to confirm loading
17. System updates status: "In Transit"
18. System creates inventory issue transaction:
    - Location: Central Warehouse
    - Transaction type: Transfer Issue
    - Items: [all 4 items with quantities]
    - Reference: TRF-2501-0456
19. Warehouse stock levels reduced immediately
20. System notifies Maria: "Transfer TRF-2501-0456 dispatched. ETA: 9:00 AM"
21. System sends delivery details:
    - Estimated arrival: 9:00 AM
    - Driver name and contact
    - Tracking link
22. Driver delivers to Downtown Kitchen

**Postconditions**:
- Items picked, packed, and dispatched
- Packing slip generated and included
- Transfer status updated to "In Transit"
- Warehouse inventory reduced
- Receiving location notified of dispatch
- Delivery trackable

**Alternative Flow 1: Item Not Found at Location**:
- At Step 5, staff cannot find item at specified location
- Staff scans location barcode: Shelf A-12
- System confirms location correct per system
- Staff checks nearby locations
- Item found at Shelf A-13 (misplaced)
- Staff picks item and updates location in system
- System logs discrepancy for investigation
- Process continues normally

**Alternative Flow 2: Quality Issue Detected**:
- At Step 9, staff notices Fresh Basil showing signs of wilting
- Staff rejects batch LOT-2025-01-29
- Staff searches for alternative batch
- Finds LOT-2025-01-30 (2kg available, fresher)
- Staff picks from newer batch
- System updates packing slip with new lot number
- Staff notifies William of quality issue
- William creates quality incident report
- Process continues from Step 10

**Alternative Flow 3: Partial Shortage**:
- At Step 5, staff finds only 18L Olive Oil available (need 20L)
- System reserved 20L but 2L were damaged/used since reservation
- Staff notifies William immediately
- William contacts Maria: "Can you accept 18L now, 2L later today?"
- Maria accepts: "18L sufficient, will take 2L when available"
- Staff updates transfer: 18L this shipment, 2L to follow
- System creates follow-up transfer for 2L
- Process continues with adjusted quantity

**Alternative Flow 4: Temperature Control Violation**:
- At Step 8, staff checks cooler temperature log
- Discovers cooler B-3 had 30-minute temperature spike above threshold
- Staff notifies quality control team
- QC inspects Fresh Basil from that cooler
- QC determines product still acceptable (short duration spike)
- QC approves for use with notation
- Staff documents QC approval on packing slip
- Process continues from Step 9

**Business Rules Applied**:
- BR-SREP-007: Transfer timeline rules
- BR-SREP-012: Expiry date management (FEFO)

---

### UC-SREP-009: Receive and Confirm Stock Transfer

**Actor**: Store Manager Maria

**Trigger**: Stock transfer arrives at location

**Preconditions**:
- Transfer is in "In Transit" status
- Maria has permission to receive transfers
- Transfer is destined for Maria's location

**Main Flow**:
1. Driver arrives at Downtown Kitchen at 9:00 AM
2. Maria receives notification: "Transfer TRF-2501-0456 has arrived"
3. Maria opens mobile app to receive transfer
4. System displays pending receipts:
   - Transfer TRF-2501-0456
   - From: Central Warehouse
   - Items: 4 items
   - Dispatch time: 8:00 AM
   - ETA: 9:00 AM (On time ✓)
5. Maria selects transfer to begin receipt
6. System displays items to receive:

| Item | Ordered | Status |
|------|---------|--------|
| Olive Oil Premium (20L) | 20L | ⬜ Scan to receive |
| Fresh Basil (1.5kg) | 1.5kg | ⬜ Scan to receive |
| Tomatoes Roma (15kg) | 15kg | ⬜ Scan to receive |
| Parmesan Cheese (6kg) | 6kg | ⬜ Scan to receive |

7. Maria opens first box (refrigerated items)
8. Maria verifies Fresh Basil:
   - Visual inspection: Fresh, green, no wilting ✓
   - Weight check: 1.5kg ✓
   - Scan barcode: LOT-2025-01-30
   - System confirms lot and checks expiry: 2025-02-06 (7 days) ✓
   - Temperature check: Items still cold ✓
   - Maria clicks "✓ Confirm 1.5kg"
   - System marks item as received

9. Maria verifies Tomatoes:
   - Visual inspection: Firm, no bruising ✓
   - Weight: 15kg ✓
   - Scan barcode: LOT-2025-01-28
   - Expiry: 2025-02-04 (5 days) ✓
   - Maria clicks "✓ Confirm 15kg"

10. Maria verifies Parmesan:
    - Packaging intact ✓
    - Weight: 6kg ✓
    - Scan: LOT-2025-01-20
    - Expiry: 2025-03-20 ✓
    - Maria clicks "✓ Confirm 6kg"

11. Maria opens second box (ambient items)
12. Maria verifies Olive Oil:
    - Bottles intact, no leakage ✓
    - Count: 2 cases, 10L each = 20L ✓
    - Scan: LOT-2025-01-15
    - Expiry: 2026-01-15 ✓
    - Maria clicks "✓ Confirm 20L"

13. All items confirmed
14. System shows receipt summary:
    - Ordered: 4 items
    - Received: 4 items
    - Discrepancies: 0
    - All quantities match ✓
15. System requests Maria's signature
16. Maria signs digitally on mobile device
17. Maria confirms: "Complete Receipt"
18. System updates transfer status: "Completed"
19. System creates inventory receipt transaction:
    - Location: Downtown Kitchen
    - Transaction type: Transfer Receipt
    - Items: [all 4 items with quantities and batches]
    - Reference: TRF-2501-0456
20. Downtown Kitchen stock levels increased immediately:
    - Olive Oil: 9L → 29L (now at par level)
    - Fresh Basil: 0.5kg → 2kg (above minimum)
    - Tomatoes: 10kg → 25kg (at par level)
    - Parmesan: 2kg → 8kg (at par level)
21. System removes items from critical/recommended lists
22. System notifies William: "Transfer TRF-2501-0456 received successfully at 9:15 AM"
23. System archives transfer documents
24. Dashboard updated: No critical alerts, inventory healthy

**Postconditions**:
- Transfer received and confirmed
- All items added to location inventory
- Transfer status completed
- Warehouse notified of successful receipt
- Stock levels updated in real-time
- Items removed from replenishment recommendations

**Alternative Flow 1: Quantity Discrepancy**:
- At Step 12, Maria counts only 18L Olive Oil (not 20L)
- Maria enters actual received: 18L
- System flags discrepancy: 2L short
- System prompts for explanation
- Maria checks packing slip: Shows 18L + 2L to follow
- Maria finds note: "Partial shipment - 2L following later today"
- Maria accepts partial receipt
- System creates discrepancy report (non-issue - planned partial)
- System keeps 2L pending for follow-up transfer
- Process continues from Step 13 with adjusted quantities

**Alternative Flow 2: Damaged Items**:
- At Step 10, Maria notices Parmesan packaging damaged
- Cheese has spoiled (packaging compromised)
- Maria takes photo of damage
- Maria rejects item: "Reject - Damaged"
- System prompts: "Reason for rejection?"
- Maria selects: "Damaged packaging" and uploads photo
- System marks item as rejected
- System notifies William with photo evidence
- Maria returns damaged item to driver
- System creates credit/return transaction
- William processes return and sends replacement
- Process continues with other items

**Alternative Flow 3: Missing Items**:
- At Step 6, only 3 items in shipment (Fresh Basil missing)
- Maria checks packing slip: Shows 4 items
- Driver confirms only 3 items loaded
- Maria reports missing item in system
- System flags major discrepancy
- System immediately notifies William
- William checks warehouse: Fresh Basil found on dock (wasn't loaded)
- William arranges immediate follow-up delivery
- Maria accepts partial receipt for 3 items
- System tracks missing item for investigation

**Alternative Flow 4: Temperature Control Issue**:
- At Step 8, Maria checks items from refrigerated box
- Items are warm (temperature control failure during transit)
- Maria takes temperature reading: 15°C (should be <4°C)
- Maria rejects all refrigerated items (2 items)
- System creates quality incident
- System notifies William and QC team
- Driver takes rejected items back
- William arranges replacement delivery with different driver/vehicle
- Investigation launched into temperature control failure

**Alternative Flow 5: Overtime Receipt**:
- Delivery arrives at 5:30 PM (after business hours)
- Maria not available, Assistant Manager on duty
- System allows designated backup receiver
- Assistant follows same receipt process
- System requires photo documentation for after-hours receipt
- Assistant completes receipt with additional scrutiny
- System notifies Maria of receipt completion
- Maria reviews receipt next morning

**Business Rules Applied**:
- BR-SREP-007: Transfer timeline rules
- BR-SREP-012: Expiry date management

---

## 6. Emergency Replenishment Use Cases

### UC-SREP-010: Create and Process Emergency Replenishment

**Actor**: Store Manager Maria, Warehouse Manager William, Department Manager Daniel

**Trigger**: Critical stockout during service hours requiring immediate replenishment

**Preconditions**:
- Maria has emergency request permission
- Critical situation exists (not routine low stock)
- Alternative sources cannot meet immediate need

**Main Flow**:
1. **Crisis Event**: 5:00 PM during dinner service
   - Maria discovers critical shortage: Salmon fillet supply exhausted
   - Check shows: Current stock: 0kg, Par: 15kg
   - Reservation system shows: 20 salmon entrees ordered for evening
   - Issue: Supplier delivery was short by 10kg (not detected until service)

2. Maria assesses situation:
   - Cannot fulfill customer orders without salmon
   - Alternative dishes available but requires guest notification
   - Time-sensitive: Guests arriving in 1 hour
   - Financial impact: Potential lost sales + customer satisfaction

3. Maria creates emergency request:
   - Navigates to "Emergency Replenishment"
   - Selects item: Salmon Fillet - Premium
   - Quantity needed: 10kg (minimum to complete service)
   - Required by: Immediate (within 2 hours)
   - Priority: Emergency/Critical
   - Urgency reason (required):
     * "Supplier short-shipped today's delivery by 10kg"
     * "Have 20 salmon entrees on reservation for tonight"
     * "Guests arriving 6:00 PM - cannot fulfill orders without"
     * "Risk: Lost revenue $800 + poor reviews"
   - Alternative actions taken:
     * "Checked other menu items - limited alternatives"
     * "Contacted supplier - cannot re-deliver today"

4. System validates emergency request:
   - Checks Maria's emergency request history: 1 in last 30 days ✓ (limit: 2/week)
   - Validates item is critical (menu item for confirmed reservations) ✓
   - Confirms genuine urgency (time-sensitive, customer-facing) ✓
   - System determines legitimate emergency

5. System creates emergency request: REP-EMG-2501-0012
6. System immediately notifies:
   - William (Warehouse Manager): SMS + App alert
   - Daniel (Department Manager): SMS + App alert
   - On-call manager: Backup notification

7. **William's Response (3 minutes later)**:
   - William sees alert: "🚨 EMERGENCY REQUEST - Response needed within 30 min"
   - William checks warehouse stock: 18kg salmon available ✓
   - William evaluates priority:
     * Customer service issue ✓
     * Time-critical (2 hours) ✓
     * Reasonable quantity (10kg)  ✓
     * Legitimate cause (supplier issue) ✓
   - William approves immediately
   - William assigns express delivery: "Motorcycle courier - 45 min ETA"
   - William alerts warehouse team: "Priority pick - Salmon 10kg for Downtown Kitchen"

8. **Daniel's Response (5 minutes later)**:
   - Daniel reviews and concurs with William's approval
   - Daniel adds note: "Approved. Follow up with supplier on short-shipment. Document for future prevention."
   - Daniel sets reminder: Review supplier reliability

9. **Warehouse Execution (10 minutes later)**:
   - Warehouse staff picks 10kg salmon from freshest batch
   - Quality check: Temperature, appearance, expiry all good ✓
   - Packed in insulated box with ice
   - Courier departs: 5:20 PM
   - ETA: 6:05 PM

10. Maria receives updates:
    - 5:15 PM: "Emergency request approved. Dispatch in 5 min."
    - 5:20 PM: "In transit. ETA 6:05 PM."
    - Maria notifies kitchen staff: "Salmon arriving 6:05"
    - Maria prepares contingency: Inform early-arriving guests of 10-minute delay if needed

11. **Receipt (6:03 PM)**:
    - Courier arrives with salmon
    - Maria's assistant receives transfer
    - Quick quality check: Temperature good, packaging intact ✓
    - Confirms 10kg received
    - Signs receipt
    - Salmon immediately to kitchen
    - Service continues without guest impact

12. **Post-Event**:
    - System updates inventory: +10kg salmon
    - Transfer completed
    - System generates emergency incident report:
      * Cause: Supplier short-shipment
      * Response time: 63 minutes (request to receipt)
      * Outcome: Successful - no service impact
      * Cost: Standard transfer + express delivery fee
    - System flags for review: Supplier performance
    - System tracks: Emergency request used (1 of 2 this week)

**Postconditions**:
- Emergency successfully resolved within timeframe
- Customer service maintained
- Incident documented for analysis
- Supplier issue flagged for follow-up
- Emergency request count tracked for abuse prevention

**Alternative Flow 1: Warehouse Stock Insufficient**:
- At Step 7, William checks: Only 4kg salmon available (need 10kg)
- William explores alternatives:
  * Option A: Transfer from another location (Uptown Restaurant: 12kg available)
  * Option B: Emergency purchase from local supplier
  * Option C: Partial fulfillment + menu substitutions
- William contacts Maria: "Only 4kg in warehouse. Can get 10kg from Uptown in 90 min, OR 4kg now + substitutes. Your call."
- Maria evaluates: "90 min works. Take 10kg from Uptown. I'll delay first seating 15 min."
- William arranges inter-location emergency transfer
- Uptown manager approves (has excess stock)
- Process continues with longer ETA

**Alternative Flow 2: Emergency Rejected - Not Legitimate**:
- At Step 4, system detects: Maria's 3rd emergency this week (limit: 2)
- System flags for Daniel's review before William sees
- Daniel reviews: Previous 2 emergencies were poor planning, not genuine crises
- Daniel sees: This request also questionable (known delivery day, should have verified count earlier)
- Daniel rejects with message:
  * "Emergency request denied. This is 3rd this week and result of inadequate receiving processes."
  * "Action required: Implement proper receiving checks to prevent future issues."
  * "For today: Use chicken as substitute OR purchase locally from petty cash."
- Maria receives rejection
- Maria must handle situation locally
- Daniel schedules training session on proper receiving procedures

**Alternative Flow 3: After-Hours Emergency**:
- Emergency occurs 10:00 PM (warehouse closed)
- System notifies on-call warehouse supervisor
- Supervisor remotely reviews request
- Approves access for after-hours warehouse staff
- Security escorts staff to warehouse
- Emergency fulfillment proceeds with additional documentation
- Incident review next day on necessity and procedures

**Business Rules Applied**:
- BR-SREP-007: Emergency transfer timelines (4 hours SLA)
- BR-SREP-009: Consumption data requirements (emergency not counted in normal patterns)

---

## 7. Analytics and Reporting Use Cases

### UC-SREP-011: View Consumption Trends and Analytics

**Actor**: Store Manager Maria, Department Manager Daniel

**Trigger**: Regular review (weekly/monthly), or investigating inventory issues

**Preconditions**:
- User is authenticated
- System has at least 30 days of transaction data
- User has access to location/department analytics

**Main Flow**:
1. Maria navigates to "Consumption Analytics" dashboard
2. System displays overview analytics for Downtown Kitchen (Last 30 days):

   **Summary Metrics:**
   - Total transactions: 1,247 issues
   - Total value: $48,325
   - Average daily consumption: $1,610
   - Trend: +8% vs previous 30 days
   - Inventory turns: 4.2x (healthy)
   - Stockouts: 2 incidents (down from 5 last month)

3. System displays category breakdown chart (pie chart):
   - Fresh Produce: 35% ($16,914)
   - Proteins: 30% ($14,497)
   - Dairy: 15% ($7,249)
   - Dry Goods: 12% ($5,799)
   - Beverages: 8% ($3,866)

4. Maria selects "Fresh Produce" category for deeper analysis
5. System displays Fresh Produce detailed view:

   **Top 10 Items by Consumption Value:**

| Rank | Item | Consumption | Value | Avg Daily | Trend | Days Supply |
|------|------|-------------|-------|-----------|-------|-------------|
| 1 | Tomatoes Roma | 450kg | $2,250 | 15kg | ↑ +12% | 1.7 days |
| 2 | Lettuce Romaine | 180kg | $1,620 | 6kg | → 0% | 4.2 days |
| 3 | Onions Yellow | 320kg | $960 | 10.7kg | ↑ +5% | 2.3 days |
| 4 | Bell Peppers Mix | 210kg | $1,890 | 7kg | ↑ +15% | 3.6 days |
| 5 | Mushrooms Button | 95kg | $1,140 | 3.2kg | → -2% | 6.3 days |
| ... | ... | ... | ... | ... | ... | ... |

6. Maria notices Tomatoes consumption up 12% and low days of supply
7. Maria clicks "Tomatoes Roma" for item-level analysis
8. System displays detailed Tomatoes analysis:

   **Consumption Graph (30 days):**
   - Line graph showing daily consumption with trend line
   - Visible upward trend
   - Peak days identified: Fri-Sat (weekends)
   - Low days: Mon-Tue

   **Statistics:**
   - Average daily: 15kg
   - Maximum daily: 24kg (last Saturday)
   - Minimum daily: 8kg (last Monday)
   - Standard deviation: 4.2kg (moderate variability)
   - Growth rate: +12% over 30 days

   **Current Status:**
   - Current stock: 10kg
   - Par level: 25kg
   - Days of supply: 0.7 days (critical!)
   - Last replenishment: 2 days ago
   - Next replenishment: Pending approval

   **Recommendations:**
   - 🔴 Critical: Below minimum level (7.5kg)
   - ⚠️ Suggested action: Immediate replenishment
   - 💡 Insight: "Consumption increased 12%. Consider increasing par level to 30kg."
   - 📈 Forecast: "At current rate, will consume 105kg in next 7 days"

9. Maria reviews historical stockouts:
   - 2 stockouts in last 60 days (improved from 4 in previous 60 days)
   - Root causes:
     * Supplier delivery delay (1 incident)
     * Underestimated weekend demand (1 incident)
   - Financial impact: $480 estimated lost sales

10. Maria decides to adjust par level:
    - Current par: 25kg
    - Proposed par: 30kg (20% increase)
    - Maria clicks "Adjust Par Level"
    - System requires justification: "Sustained 12% consumption increase over 30 days. Weekend demand peaks at 24kg."
    - System flags for Daniel's approval (>20% change)
    - Maria submits adjustment request

11. Maria reviews other trending items:
    - Bell Peppers: +15% trend - also needs par level review
    - Mushrooms: Stable - no action needed
    - Maria creates note to review bell peppers next week

12. Maria exports report:
    - Selects "Export to PDF"
    - Report includes: summary metrics, category breakdown, top items, trend analysis
    - Report generated and downloaded
    - Maria shares with Daniel for monthly review meeting

**Postconditions**:
- Maria has clear visibility into consumption patterns
- Items with concerning trends identified
- Par level adjustment requested for trending items
- Report exported for management review
- Proactive actions taken to prevent stockouts

**Alternative Flow 1: Department Manager View**:
- Daniel logs in and views department-wide analytics
- System displays aggregated data across all locations:
  * Total department consumption: $142,750 (last 30 days)
  * Breakdown by location (3 locations)
  * Comparative analysis: Which locations consuming more/less
  * Department-wide trends and patterns
  * Cost optimization opportunities identified
- Daniel identifies location-specific issues:
  * Uptown location: High waste rate on produce
  * Pool Bar: Low turnover on certain beverages
- Daniel creates action items for location managers

**Alternative Flow 2: Seasonal Pattern Analysis**:
- Maria views 12-month consumption history
- System displays seasonality analysis:
  * Summer months: +25% beverage consumption
  * Winter months: +30% soup ingredient consumption
  * Holiday periods: +40% premium proteins
- System suggests seasonal par level adjustments
- Maria configures seasonal multipliers:
  * Summer beverage par: 1.3x
  * Winter soup ingredients: 1.2x
  * Holiday period: Special event planning
- System will auto-adjust par levels based on calendar

**Alternative Flow 3: Slow-Moving Item Identification**:
- Maria filters for slow-moving items
- System displays items with <2 turns in 30 days:
  * "Truffle Oil - White" - Last used 45 days ago
  * "Specialty Vinegar Collection" - Low rotation
  * "Exotic Spice Mix" - Ordered but rarely used
- System calculates carrying cost and waste risk
- Maria reviews with chef: Some items for menu removal, others keep for special requests
- Maria reduces par levels for slow movers
- System flags very slow items for discontinuation consideration

**Business Rules Applied**:
- BR-SREP-009: Consumption data requirements (minimum 30 days)
- BR-SREP-013: Seasonal adjustments

---

## 8. Related Documents

- **Business Requirements**: [BR-stock-replenishment.md](./BR-stock-replenishment.md)
- **Technical Specification**: [TS-stock-replenishment.md](./TS-stock-replenishment.md)
- **Data Schema**: [DD-stock-replenishment.md](./DD-stock-replenishment.md)
- **Flow Diagrams**: [FD-stock-replenishment.md](./FD-stock-replenishment.md)
- **Validations**: [VAL-stock-replenishment.md](./VAL-stock-replenishment.md)

---

**Document Control**:
- **Created**: 2025-11-12
- **Author**: Documentation Team
- **Reviewed By**: Operations Manager, Store Managers, Warehouse Manager
- **Approved By**: Chief Operations Officer
- **Next Review**: 2026-01-09
- **Version History**:
  - v1.2.0 (2025-12-09): Updated to reflect implemented UI pages and workflows
  - v1.1.0 (2025-12-05): Added implementation status markers
  - v1.0.0 (2025-11-12): Initial use cases document

---

## Appendix: Use Case Summary Matrix

| ID | Use Case Name | Primary Actor | Complexity | Priority | Related BRs |
|----|---------------|---------------|------------|----------|-------------|
| UC-SREP-001 | Configure Par Level for New Item | Store Manager | Medium | High | BR-SREP-001, 002 |
| UC-SREP-002 | Review and Adjust Existing Par Levels | Store Manager | Medium | High | BR-SREP-001, 013 |
| UC-SREP-003 | Approve Par Level Change | Department Manager | Low | Medium | BR-SREP-001, 005 |
| UC-SREP-004 | Monitor Inventory Levels and Generate Alerts | System | High | Critical | BR-SREP-002, 003, 009 |
| UC-SREP-005 | Create Transfer Request from Recommendation | Store Manager | Medium | High | BR-SREP-004, 011 |
| UC-SREP-006 | Create Manual Transfer Request | Store Manager | Medium | High | BR-SREP-004, 005, 007 |
| UC-SREP-007 | Approve Transfer Request | Warehouse Manager | High | Critical | BR-SREP-005, 006, 007, 008 |
| UC-SREP-008 | Prepare and Dispatch Stock Transfer | Warehouse Staff | Medium | High | BR-SREP-007, 012 |
| UC-SREP-009 | Receive and Confirm Stock Transfer | Store Manager | Medium | High | BR-SREP-007, 012 |
| UC-SREP-010 | Create and Process Emergency Replenishment | Multi-actor | High | Critical | BR-SREP-007, 009 |
| UC-SREP-011 | View Consumption Trends and Analytics | Store/Dept Manager | Medium | Medium | BR-SREP-009, 013 |

**Total Use Cases**: 11 detailed + multiple alternative flows

---

**End of Document**
