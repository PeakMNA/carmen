# System Integrations - Use Cases (UC)

**Module**: System Administration - System Integrations
**Version**: 1.0
**Last Updated**: 2025-01-16
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Document Status**: Active

---

## Overview

This document defines use cases for the System Integrations module, focusing on current POS integration implementation with notes on planned enhancements.

**Implementation Status**:
- ✅ POS integration workflows (UC-SI-001 to UC-SI-010)
- 🔄 ERP integration workflows (Planned)
- 🔄 API management workflows (Planned)

---

## Use Case Index

| ID | Use Case Name | Priority | Status |
|----|---------------|----------|--------|
| UC-SI-001 | Create Recipe Mapping | High | Implemented |
| UC-SI-002 | Create Fractional Sales Mapping | High | Implemented |
| UC-SI-003 | Create Unit Mapping | Medium | Implemented |
| UC-SI-004 | Create Location Mapping | Medium | Implemented |
| UC-SI-005 | Process POS Transaction | Critical | Implemented |
| UC-SI-006 | Resolve Failed Transaction | High | Implemented |
| UC-SI-007 | Approve Stock-Out Transaction | High | Implemented |
| UC-SI-008 | View Consumption Report | Medium | Implemented |
| UC-SI-009 | View Gross Profit Report | Medium | Implemented |
| UC-SI-010 | Configure Integration Settings | Medium | Implemented |

---

## UC-SI-001: Create Recipe Mapping

### Basic Information
- **Actor**: Integration Administrator, Procurement Manager
- **Goal**: Map a POS item to a Carmen recipe for transaction processing
- **Preconditions**:
  - User is authenticated with mapping permissions
  - POS item code is known
  - Carmen recipe exists in system
- **Postconditions**:
  - Recipe mapping is created and active
  - POS transactions for this item will auto-process
  - Mapping appears in recipe mapping list

### Main Flow
1. User navigates to System Integrations > POS > Mapping > Recipes
2. System displays recipe mapping list with unmapped items highlighted
3. User clicks "Create Mapping" button
4. System displays mapping creation form
5. User enters mapping information:
   - **POS Item Code**: "PIZZA-MARG-12" (from POS system)
   - **POS Description**: "Margherita Pizza 12 inch"
   - **Carmen Recipe**: Search and select "Margherita Pizza"
   - **POS Unit**: "Each"
   - **Recipe Unit**: "Each"
   - **Conversion Rate**: 1.0 (1 POS item = 1 full recipe)
   - **Category**: "Pizzas"
   - **Status**: Active
6. System validates inputs:
   - POS item code is unique
   - Recipe exists
   - Conversion rate > 0
7. User clicks "Save Mapping"
8. System creates recipe mapping
9. System logs mapping creation in activity log
10. System displays success message: "Recipe mapping created successfully"
11. System returns to mapping list with new mapping highlighted

### Alternative Flows

**AF-001: POS Item Already Mapped**
- At step 7, if POS item code already has a mapping:
  - System displays error: "This POS item is already mapped to [Recipe Name]"
  - User can choose to view existing mapping or use different POS item code
  - Flow ends

**AF-002: Recipe Not Found**
- At step 5, if user cannot find Carmen recipe:
  - User clicks "Recipe not found?" link
  - System suggests: "Create recipe first in Recipe Management, then return to create mapping"
  - User can navigate to Recipe Management or cancel
  - Flow ends

**AF-003: Invalid Conversion Rate**
- At step 6, if conversion rate ≤ 0:
  - System displays error: "Conversion rate must be greater than 0"
  - System highlights conversion rate field
  - User corrects value
  - Flow continues from step 6

### Business Rules
- **BR-SI-001**: Each POS item can map to exactly one Carmen recipe
- **BR-SI-001**: Conversion rate must be greater than 0
- POS item code must be unique across all mappings

---

## UC-SI-002: Create Fractional Sales Mapping

### Basic Information
- **Actor**: Integration Administrator, F&B Manager
- **Goal**: Map POS items for fractional sales (pizza slices, cake portions) to full recipe
- **Preconditions**:
  - User is authenticated with mapping permissions
  - Base recipe exists for full item (e.g., full pizza)
  - Recipe variant exists for fractional unit (e.g., slice variant)
- **Postconditions**:
  - Fractional mapping is created
  - Multiple POS items now map to same base recipe with different conversion rates
  - Inventory is deducted correctly based on fractional consumption

### Main Flow
1. User navigates to System Integrations > POS > Mapping > Recipes > Fractional Variants
2. System displays existing fractional mappings grouped by base recipe
3. User clicks "Create Fractional Mapping" button
4. System displays fractional mapping form
5. User selects fractional sales type:
   - **Pizza Slice**: Individual pizza slices
   - **Cake Slice**: Individual cake portions
   - **Bottle/Glass**: Glass servings from bottle
   - **Portion Control**: Individual portions from batch
   - **Custom**: User-defined fractional unit
6. User enters mapping details (Pizza Slice example):
   - **Base Recipe**: "Margherita Pizza 12 inch"
   - **Variant Name**: "Single Slice"
   - **POS Item Code**: "PIZZA-MARG-SLICE"
   - **POS Description**: "Margherita Pizza - Single Slice"
   - **Pieces per Unit**: 8 (1 pizza = 8 slices)
   - **Conversion Rate**: Auto-calculated as 0.125 (1 slice = 1/8 pizza)
   - **POS Unit**: "Slice"
   - **Recipe Unit**: "Each"
7. System validates:
   - Base recipe exists
   - POS item code is unique
   - Pieces per unit > 0
8. System calculates conversion rate: 1 / pieces per unit
9. User reviews preview: "1 slice sold = 0.125 full pizza deducted from inventory"
10. User clicks "Save Mapping"
11. System creates fractional recipe mapping
12. System links mapping to base recipe
13. System logs creation in activity log
14. System displays success message
15. System returns to fractional mapping list

### Alternative Flows

**AF-001: Create Multiple Variants for Same Recipe**
- After step 11, user wants to map additional variants:
  - User clicks "Add Another Variant"
  - System pre-fills base recipe
  - User enters new POS item code and conversion rate
  - Example: "Half Pizza" with conversion rate 0.5
  - Flow continues from step 7

**AF-002: Pieces Per Unit Changed**
- At step 6, if user changes pieces per unit:
  - System automatically recalculates conversion rate
  - User sees updated preview in real-time
  - Flow continues normally

### Business Rules
- **BR-SI-001**: Multiple POS items can map to same base recipe for variants
- **BR-SI-001**: Fractional sales mappings must specify variant type
- Conversion rate is auto-calculated from pieces per unit
- Sum of fractional sales should not exceed 100% in reporting (monitoring only)

---

## UC-SI-003: Create Unit Mapping

### Basic Information
- **Actor**: Integration Administrator
- **Goal**: Define unit conversion between POS and Carmen systems
- **Preconditions**:
  - User is authenticated with mapping permissions
  - Carmen base unit exists
- **Postconditions**:
  - Unit mapping is created
  - Unit can be used in recipe mappings
  - Conversion calculations use new mapping

### Main Flow
1. User navigates to System Integrations > POS > Mapping > Units
2. System displays unit mapping list
3. User clicks "Create Unit Mapping" button
4. System displays unit mapping form
5. User enters unit details:
   - **Unit Code**: "SLICE" (unique identifier)
   - **Unit Name**: "Slice" (display name)
   - **Unit Type**: "Sales" (recipe / sales / both)
   - **Base Unit**: "Each" (reference unit)
   - **Conversion Rate**: 0.125 (how many base units = 1 of this unit)
6. System validates:
   - Unit code is unique
   - Base unit exists
   - Conversion rate > 0
7. User clicks "Save Mapping"
8. System creates unit mapping
9. System logs creation
10. System displays success message
11. System returns to unit list

### Example Unit Mappings
- 1 Glass = 0.15 Liter (for beverage portions)
- 1 Portion = 0.25 kg (for bulk recipes)
- 1 Piece = 1 Each (1:1 mapping)
- 1 Serving = 0.2 kg (for plated meals)

---

## UC-SI-004: Create Location Mapping

### Basic Information
- **Actor**: System Administrator, Operations Manager
- **Goal**: Map POS location to Carmen location for multi-outlet synchronization
- **Preconditions**:
  - User is authenticated
  - Carmen location exists in Location Management
  - POS location ID is known
- **Postconditions**:
  - Location mapping is created
  - Transactions from POS location are routed to Carmen location
  - Inventory updates affect correct location stock

### Main Flow
1. User navigates to System Integrations > POS > Mapping > Locations
2. System displays location mapping list
3. User clicks "Create Location Mapping" button
4. System displays location mapping form
5. User enters location details:
   - **POS Location ID**: "POS-LOC-001" (from POS system)
   - **POS Location Name**: "Main Restaurant - Ground Floor"
   - **Carmen Location**: Search and select "Main Kitchen"
   - **Carmen Location Type**: "Production Kitchen"
   - **Sync Enabled**: Yes (auto-sync transactions)
   - **Is Active**: Yes
   - **Notes**: "Primary kitchen for ground floor restaurant"
6. System validates:
   - POS location ID is unique
   - Carmen location exists
7. User clicks "Save Mapping"
8. System creates location mapping
9. System records mapped by user and timestamp
10. System logs creation
11. System displays success message
12. System returns to location list with mapping active

### Alternative Flows

**AF-001: Disable Sync for Location**
- At step 5, if user sets Sync Enabled = No:
  - System warns: "Transactions from this location will not auto-process"
  - User confirms understanding
  - Mapping is created with sync disabled
  - Manual transaction processing required for this location

---

## UC-SI-005: Process POS Transaction

### Basic Information
- **Actor**: System (Automated), Integration Administrator
- **Goal**: Process POS transaction and deduct inventory based on recipe mapping
- **Preconditions**:
  - POS transaction received (real-time or batch)
  - Recipe mapping exists for POS item
  - Location mapping exists for POS location
- **Postconditions**:
  - Transaction is validated and processed
  - Inventory is deducted from stock
  - Transaction is logged in activity log
  - Reports are updated with new data

### Main Flow (Automated Processing)
1. System receives POS transaction data:
   - Transaction ID: "TXN-2501-001234"
   - POS Item Code: "PIZZA-MARG-SLICE"
   - Quantity: 3
   - POS Location ID: "POS-LOC-001"
   - Timestamp: "2025-01-16 14:30:00"
2. System validates transaction completeness:
   - All required fields present
   - Timestamp within acceptable range (not future, not >90 days old)
   - Quantity > 0
3. System looks up recipe mapping for "PIZZA-MARG-SLICE"
4. System finds mapping:
   - Carmen Recipe: "Margherita Pizza 12 inch"
   - Conversion Rate: 0.125 (1 slice = 0.125 full pizza)
5. System calculates inventory impact:
   - Quantity to deduct = 3 slices × 0.125 = 0.375 full pizzas
6. System looks up location mapping for "POS-LOC-001"
7. System finds mapping: Carmen Location = "Main Kitchen"
8. System checks inventory availability:
   - Current Stock: 5 full pizzas (ingredient-based calculation)
   - Required: 0.375 pizzas
   - Available: Yes (5 > 0.375)
9. System processes transaction:
   - Deducts 0.375 from recipe inventory at Main Kitchen
   - Updates ingredient stock levels based on recipe
   - Marks transaction as "Processed"
10. System logs transaction in activity log
11. System updates consumption reports
12. Process complete (no user action required)

### Alternative Flows

**AF-001: Unmapped POS Item**
- At step 3, if no recipe mapping found:
  - System flags transaction as "Failed - Unmapped Item"
  - System adds to failed transactions list
  - System sends notification if configured
  - Transaction queued for manual resolution
  - See UC-SI-006: Resolve Failed Transaction

**AF-002: Insufficient Inventory (Stock-Out)**
- At step 8, if available stock < required quantity:
  - System checks if stock-out approval is enabled
  - If enabled: System queues transaction for approval (see UC-SI-007)
  - If disabled: System processes with negative inventory and logs warning
  - Transaction marked as "Pending Approval" or "Processed with Warning"

**AF-003: Invalid Location**
- At step 6, if location mapping not found:
  - System flags transaction as "Failed - Invalid Location"
  - System adds to failed transactions list
  - Transaction queued for manual resolution

---

## UC-SI-006: Resolve Failed Transaction

### Basic Information
- **Actor**: Integration Administrator
- **Goal**: Fix issue causing transaction failure and reprocess
- **Preconditions**:
  - Failed transaction exists in system
  - User has permission to resolve failures
- **Postconditions**:
  - Underlying issue is resolved (mapping created, data corrected)
  - Transaction is successfully reprocessed
  - Inventory is updated
  - Transaction moves from failed to processed status

### Main Flow
1. User navigates to System Integrations > POS > Transactions > Failed
2. System displays failed transactions list with filters:
   - Failure Reason: Unmapped Item / Invalid Location / Data Validation
   - Date Range
   - Location
3. User views failed transaction details:
   - Transaction ID: "TXN-2501-001234"
   - POS Item Code: "NEW-DESSERT-01"
   - Failure Reason: "Unmapped Item"
   - Suggested Action: "Create Recipe Mapping"
4. User clicks "Resolve" button
5. System analyzes failure reason and presents resolution options:

   **For Unmapped Item**:
   - Option A: "Create Recipe Mapping Now" (opens mapping form)
   - Option B: "Ignore This Transaction" (mark as resolved without processing)
   - Option C: "Bulk Create Mappings" (if multiple transactions for same item)

6. User selects Option A: "Create Recipe Mapping Now"
7. System opens mapping form pre-filled with POS item code and description
8. User completes mapping (see UC-SI-001)
9. System saves mapping
10. System automatically retries failed transaction
11. System validates transaction using new mapping
12. System processes transaction successfully
13. System moves transaction from "Failed" to "Processed"
14. System displays success message: "Transaction resolved and processed"
15. System returns to failed transactions list with resolved item removed

### Alternative Flows

**AF-001: Bulk Resolution**
- At step 6, if multiple transactions failed for same reason:
  - User selects multiple transactions (same POS item)
  - User clicks "Bulk Resolve"
  - System creates one mapping for all selected transactions
  - System retries all transactions automatically
  - System reports: "15 transactions resolved and processed"

**AF-002: Ignore Transaction**
- At step 6, if user selects Option B:
  - System prompts: "Are you sure? Transaction will not be processed."
  - User confirms
  - System marks transaction as "Resolved - Ignored"
  - System logs reason in activity log
  - Transaction removed from failed list but not processed
  - Flow ends

---

## UC-SI-007: Approve Stock-Out Transaction

### Basic Information
- **Actor**: Inventory Manager, Department Manager
- **Goal**: Review and approve POS transaction that would cause negative inventory
- **Preconditions**:
  - User has "approve_stock_out" permission
  - Transaction is queued in "Pending Approvals" status
  - Stock-out review is enabled in settings
- **Postconditions**:
  - Transaction is approved or rejected
  - If approved: inventory is updated (potentially negative)
  - If approved: optional stock adjustment is created
  - Decision is logged in audit trail

### Main Flow
1. User navigates to System Integrations > POS > Transactions > Stock-Out Review
2. System displays pending approvals with status indicators:
   - Pending Count: 5 transactions
   - Sorted by oldest first
3. User views transaction requiring approval:
   - Transaction ID: "TXN-2501-005678"
   - POS Item: "Caesar Salad"
   - Quantity Sold: 10
   - Recipe: "Caesar Salad Recipe"
   - Conversion: 1:1
   - **Current Stock**: 3 servings
   - **Required**: 10 servings
   - **Shortage**: 7 servings
   - Location: Main Kitchen
   - Transaction Date: 2025-01-16 18:45
4. System displays stock impact:
   - "Approving will result in stock level of -7 servings"
   - Ingredient impact shown (lettuce, dressing, croutons, etc.)
5. User reviews context:
   - Checks if stock count is accurate
   - Verifies transaction legitimacy
   - Considers if stock adjustment is needed
6. User decides to approve
7. User selects approval action:
   - **Option A**: "Approve as-is" (allow negative stock)
   - **Option B**: "Approve with Stock Adjustment" (create adjustment to cover shortage)
8. User selects Option B and enters adjustment details:
   - Adjustment Quantity: +7 servings
   - Adjustment Reason: "Physical stock available but not recorded"
   - Reference: "Physical count verified"
9. User clicks "Approve Transaction"
10. System prompts confirmation: "Approve transaction and create stock adjustment?"
11. User confirms
12. System processes approval:
    - Creates stock adjustment record (+7 servings)
    - Processes POS transaction (-10 servings)
    - Final stock level: 3 + 7 - 10 = 0 servings
13. System logs approval decision with user and reason
14. System sends notification to requester (if configured)
15. System displays success message: "Transaction approved and processed"
16. System removes transaction from pending approvals
17. System returns to pending approvals list

### Alternative Flows

**AF-001: Reject Transaction**
- At step 7, if user decides to reject:
  - User clicks "Reject Transaction"
  - System prompts for rejection reason
  - User enters: "Invalid transaction - duplicate entry"
  - System marks transaction as "Rejected"
  - System logs rejection with reason
  - Transaction is not processed
  - Notification sent to requester
  - Flow ends

**AF-002: Approve Without Adjustment**
- At step 8, if user selects Option A:
  - System warns: "Stock will be negative (-7 servings)"
  - User confirms
  - System processes transaction without adjustment
  - Final stock: -7 servings
  - Flow continues normally

**AF-003: Bulk Approval**
- At step 2, if multiple similar pending approvals:
  - User selects multiple transactions (same recipe, same reason)
  - User clicks "Bulk Approve"
  - System shows combined impact
  - User can apply single stock adjustment for all
  - All transactions processed together

### Business Rules
- **BR-SI-005**: Stock-out approvals require "approve_stock_out" permission
- **BR-SI-005**: Approved stock-out creates automatic stock adjustment record
- **BR-SI-005**: Bulk approval limited to transactions from same location and same day

---

## UC-SI-008: View Consumption Report

### Basic Information
- **Actor**: F&B Manager, Cost Controller
- **Goal**: Analyze inventory consumption from POS sales over a period
- **Preconditions**:
  - User is authenticated
  - POS transactions have been processed
  - Recipe mappings exist
- **Postconditions**:
  - Consumption data is displayed
  - User gains insights into usage patterns
  - Report can be exported for further analysis

### Main Flow
1. User navigates to System Integrations > POS > Reports > Consumption
2. System displays consumption report interface
3. User sets report parameters:
   - **Date Range**: Last 30 days (2024-12-17 to 2025-01-16)
   - **Location**: Main Kitchen (or "All Locations")
   - **Category**: Pizzas (or "All Categories")
   - **Group By**: Recipe
4. User clicks "Generate Report"
5. System calculates consumption:
   - Retrieves all processed POS transactions in date range
   - Applies recipe mappings and conversion rates
   - Aggregates by recipe, category, and location
6. System displays consumption table:

   | Recipe | Category | Qty Consumed | Unit | Theoretical Cost | Variance |
   |--------|----------|--------------|------|-----------------|----------|
   | Margherita Pizza | Pizzas | 45.5 | Each | $568.75 | +2% |
   | Caesar Salad | Salads | 123 | Servings | $307.50 | -5% |
   | Tiramisu | Desserts | 18.75 | Each | $131.25 | +1% |

7. System displays consumption trend chart (line graph over time)
8. System highlights variances:
   - **Positive Variance**: Consumption higher than expected (based on recipe yield)
   - **Negative Variance**: Consumption lower than expected
9. User reviews data and identifies patterns:
   - Margherita Pizza consumption trending up on weekends
   - Caesar Salad showing negative variance (possible portioning issue or waste)
10. User clicks "Export to Excel"
11. System generates Excel file with:
    - Summary tab
    - Detail tab (transaction-level data)
    - Charts tab (visualizations)
12. System downloads file: "Consumption_Report_2025-01-16.xlsx"
13. User can print or email report

### Report Features
- Date range selection (today, yesterday, last 7 days, last 30 days, custom)
- Location filtering (single or multiple locations)
- Category filtering
- Sorting by consumption quantity, cost, variance
- Drill-down to transaction detail
- Export to Excel, PDF, CSV
- Schedule recurring reports (email delivery)

---

## UC-SI-009: View Gross Profit Report

### Basic Information
- **Actor**: Finance Manager, General Manager, F&B Manager
- **Goal**: Analyze gross profit by item based on POS sales revenue and recipe costs
- **Preconditions**:
  - User is authenticated
  - POS transactions include sales revenue data
  - Recipe costs are calculated in system
  - Recipe mappings exist
- **Postconditions**:
  - Gross profit data is displayed
  - Profit margins are calculated
  - User can identify top and bottom performers

### Main Flow
1. User navigates to System Integrations > POS > Reports > Gross Profit
2. System displays gross profit report interface
3. User sets report parameters:
   - **Date Range**: Current Month (2025-01-01 to 2025-01-16)
   - **Location**: All Locations
   - **Sort By**: Profit Margin % (descending)
4. User clicks "Generate Report"
5. System calculates gross profit:
   - Retrieves POS transactions with sales revenue
   - Calculates theoretical cost using recipe mappings
   - Computes gross profit and profit margin %
6. System displays gross profit table:

   | Item | Qty Sold | Sales Revenue | Theoretical Cost | Gross Profit | Margin % |
   |------|----------|--------------|-----------------|--------------|----------|
   | Margherita Pizza (Slice) | 364 | $1,820.00 | $711.25 | $1,108.75 | 60.9% |
   | Caesar Salad | 123 | $1,537.50 | $307.50 | $1,230.00 | 80.0% |
   | Tiramisu | 75 | $562.50 | $525.00 | $37.50 | 6.7% |

7. System highlights performance indicators:
   - **Top Performers** (profit margin >60%): Green highlight
   - **Average Performers** (margin 30-60%): No highlight
   - **Bottom Performers** (margin <30%): Yellow highlight
   - **Loss Makers** (negative margin): Red highlight
8. System displays visualizations:
   - Profit margin chart (bar chart by item)
   - Revenue vs. Cost comparison (stacked bar)
   - Profit trend over time (line chart)
9. User identifies insights:
   - Caesar Salad has excellent margin (80%)
   - Tiramisu has poor margin (6.7%) - potential pricing or portioning issue
   - Pizza slices are good performers (61% margin)
10. User can drill down into Tiramisu details:
    - Click on Tiramisu row
    - System shows ingredient cost breakdown
    - User discovers high cost of mascarpone cheese
    - User notes to review recipe or pricing
11. User exports report to PDF
12. System generates PDF with charts and tables
13. User saves for management review

### Calculation Logic
```
For each POS transaction:
  Sales Revenue = POS Transaction Amount
  Theoretical Cost = Recipe Cost × Quantity Sold × Conversion Rate
  Gross Profit = Sales Revenue - Theoretical Cost
  Profit Margin % = (Gross Profit / Sales Revenue) × 100

Aggregate by item, location, or category as needed
```

---

## UC-SI-010: Configure Integration Settings

### Basic Information
- **Actor**: System Administrator, Integration Administrator
- **Goal**: Configure POS integration behavior and connection settings
- **Preconditions**:
  - User has administrator permissions
  - User understands integration requirements
- **Postconditions**:
  - Settings are updated
  - Integration behavior reflects new settings
  - Changes are logged in audit trail

### Main Flow
1. User navigates to System Integrations > POS > Settings
2. System displays settings page with tabs:
   - **POS Configuration**
   - **System Settings**
3. User selects POS Configuration tab
4. System displays current settings:
   - POS System Type: "Generic POS" (dropdown: Generic / Square / Toast / Lightspeed / Custom)
   - API Endpoint: "https://pos.example.com/api/v1"
   - API Key: "••••••••••••" (masked for security)
   - Sync Frequency: "Real-time" (options: Real-time / Hourly / Daily / Manual)
   - Transaction Format: "JSON" (JSON / XML / CSV)
5. User updates API endpoint (system migration):
   - Old: "https://pos.example.com/api/v1"
   - New: "https://newpos.example.com/api/v2"
6. User clicks "Test Connection" button
7. System validates connection to new endpoint
8. System displays success: "Connection successful. API v2 detected."
9. User switches to System Settings tab
10. System displays system configuration:
    - **Auto-Process Threshold**: $1,000 (transactions below this value auto-process)
    - **Stock-Out Approval Required**: Yes (transactions causing negative stock need approval)
    - **Unmapped Item Handling**: "Alert" (options: Ignore / Create Placeholder / Alert)
    - **Transaction Batch Size**: 100 (transactions per batch)
    - **Error Notification Recipients**: admin@hotel.com (comma-separated emails)
11. User changes unmapped item handling:
    - From: "Alert" (just flag unmapped items)
    - To: "Create Placeholder" (auto-create placeholder mapping)
12. System warns: "Placeholder mappings will be created automatically. Review regularly."
13. User confirms change
14. User clicks "Save Settings"
15. System validates all settings
16. System prompts: "Save changes to integration settings?"
17. User confirms
18. System saves settings
19. System logs change in audit trail:
    - User: admin@hotel.com
    - Change: API Endpoint updated, Unmapped Item Handling changed
    - Timestamp: 2025-01-16 15:30:00
20. System displays success message: "Settings saved successfully"
21. System applies new settings immediately

### Alternative Flows

**AF-001: Connection Test Fails**
- At step 7, if connection test fails:
  - System displays error: "Connection failed: Timeout connecting to endpoint"
  - System shows troubleshooting tips
  - User can retry or cancel
  - Settings are not saved until connection succeeds

**AF-002: Invalid Setting Value**
- At step 15, if settings validation fails:
  - Example: Auto-Process Threshold set to negative value
  - System displays error: "Auto-Process Threshold must be greater than 0"
  - System highlights invalid field
  - User corrects value
  - Flow continues from step 15

### Setting Categories

**POS Configuration**:
- System type/vendor selection
- API connection details (endpoint, credentials)
- Sync frequency and timing
- Data format preferences
- Webhook URLs for notifications

**System Settings**:
- Auto-processing rules and thresholds
- Approval workflow requirements
- Error handling preferences
- Notification configuration
- Performance tuning (batch size, timeout values)

---

## Appendices

### Appendix A: Fractional Sales Examples

**Pizza Slices**:
- Base Recipe: "Margherita Pizza 12 inch"
- Variants:
  - "Single Slice" = 1/8 pizza (0.125)
  - "2 Slices" = 1/4 pizza (0.25)
  - "Half Pizza" = 1/2 pizza (0.50)

**Cake Portions**:
- Base Recipe: "Chocolate Cake"
- Variants:
  - "Slice" = 1/12 cake (0.083)
  - "Quarter Cake" = 1/4 cake (0.25)

**Beverage Servings**:
- Base Recipe: "House Wine Bottle"
- Variants:
  - "Glass 150ml" = 1/5 bottle (0.20)
  - "Carafe 500ml" = 2/3 bottle (0.67)

### Appendix B: Transaction Processing States

| State | Description | User Action Required |
|-------|-------------|---------------------|
| Received | Transaction received from POS | None (system processing) |
| Validating | Checking completeness and mappings | None (system processing) |
| Pending Approval | Stock-out requires approval | Approve or reject |
| Approved | Approved for processing | None (system processing) |
| Processing | Deducting inventory | None (system processing) |
| Processed | Successfully completed | None |
| Failed | Validation or processing error | Resolve issue and retry |
| Rejected | Approval denied | None (logged only) |
| Ignored | Marked as resolved without processing | None |

### Appendix C: Report Metrics

**Consumption Report Metrics**:
- Total Quantity Consumed (by item, category, location)
- Theoretical Cost of Goods Sold (COGS)
- Consumption Trend (daily, weekly, monthly)
- Variance from Expected (based on recipe yield)
- Peak Consumption Hours/Days

**Gross Profit Report Metrics**:
- Sales Revenue (by item, category, location)
- Theoretical Cost (recipe-based calculation)
- Gross Profit ($)
- Gross Profit Margin (%)
- Contribution to Total Profit
- Top Performers / Bottom Performers
- Loss Makers (negative margin items)

---

**Document Control**:
- **Created**: 2025-01-16
- **Last Modified**: 2025-01-16
- **Version**: 1.0
- **Status**: Active
- **Review Cycle**: Quarterly
