# System Integrations - Flow Diagrams (FD)

**Module**: System Administration - System Integrations
**Version**: 1.0
**Last Updated**: 2025-01-16
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Implementation Status**: Partially Implemented (POS Integration)

---

## 1. Overview

This document provides comprehensive flow diagrams for all system integration workflows, focusing on POS integration processes including recipe mapping, transaction processing, and error handling.

---

## 2. Recipe Mapping Flows

### FD-001: Create Standard Recipe Mapping Flow

```mermaid
flowchart TD
    Start([User Opens Create Recipe Mapping]) --> LoadData[Load POS Items and Recipes]
    LoadData --> SelectPOS[Select POS Item Code]
    SelectPOS --> FillDetails[Fill POS Description]
    FillDetails --> SelectRecipe[Select Recipe from Dropdown]
    SelectRecipe --> AutoFill{Auto-fill Units?}
    AutoFill -->|Yes| FillUnits[Auto-fill POS Unit and Recipe Unit]
    AutoFill -->|No| ManualUnits[Manually Enter Units]
    FillUnits --> SetConversion[Set Conversion Rate = 1.0]
    ManualUnits --> EnterConversion[Enter Custom Conversion Rate]
    SetConversion --> SelectCategory[Select Category]
    EnterConversion --> SelectCategory
    SelectCategory --> Validate{Validate Form}
    Validate -->|Fail| ShowErrors[Display Validation Errors]
    ShowErrors --> SelectPOS
    Validate -->|Pass| CheckDuplicate{Check Duplicate POS Code}
    CheckDuplicate -->|Exists| DuplicateError[Show Error: POS Code Already Mapped]
    DuplicateError --> SelectPOS
    CheckDuplicate -->|Not Exists| SaveMapping[Save Recipe Mapping to Database]
    SaveMapping --> UpdateInventory[Link to Inventory Transaction Rules]
    UpdateInventory --> LogHistory[Log Creation in Audit Trail]
    LogHistory --> ShowSuccess[Display Success Message]
    ShowSuccess --> End([Redirect to Mapping List])
```

**Key Decision Points**:
- Auto-fill units based on recipe configuration
- Validation of required fields
- Duplicate POS code detection
- Conversion rate validation (must be > 0)

**Performance Metrics**:
- Target completion time: < 30 seconds
- Form validation: < 100ms
- Duplicate check query: < 50ms
- Database insert: < 200ms

---

### FD-002: Create Fractional Sales Mapping Flow

```mermaid
flowchart TD
    Start([User Opens Fractional Sales Wizard]) --> SelectType[Select Fractional Sales Type]
    SelectType --> TypeOptions{Type Selected}
    TypeOptions -->|Pizza Slice| PizzaConfig[Configure Pizza Slicing]
    TypeOptions -->|Cake Slice| CakeConfig[Configure Cake Portions]
    TypeOptions -->|Bottle/Glass| BottleConfig[Configure Beverage Servings]
    TypeOptions -->|Portion Control| PortionConfig[Configure Portion Sizes]
    TypeOptions -->|Custom| CustomConfig[Custom Fractional Config]

    PizzaConfig --> SelectBaseRecipe[Select Base Recipe: e.g., Margherita Pizza]
    CakeConfig --> SelectBaseRecipe
    BottleConfig --> SelectBaseRecipe
    PortionConfig --> SelectBaseRecipe
    CustomConfig --> SelectBaseRecipe

    SelectBaseRecipe --> EnterVariantName[Enter Variant Name: e.g., 'Pizza Slice']
    EnterVariantName --> EnterPiecesPerUnit[Enter Pieces per Unit: e.g., 8 slices]
    EnterPiecesPerUnit --> AutoCalculate[Auto-calculate Conversion Rate: 1/8 = 0.125]
    AutoCalculate --> Preview[Preview Inventory Impact]
    Preview --> ShowPreview['Example: 1 slice sold = 0.125 pizza deducted']
    ShowPreview --> ConfirmPreview{User Confirms?}
    ConfirmPreview -->|No| EnterPiecesPerUnit
    ConfirmPreview -->|Yes| CreateVariants{Create Multiple Variants?}
    CreateVariants -->|Yes| BulkCreate[Create Slice, Half, Quarter, Whole variants]
    CreateVariants -->|No| SingleVariant[Create Single Variant Only]
    BulkCreate --> SaveMappings[Save All Variant Mappings]
    SingleVariant --> SaveMappings
    SaveMappings --> LinkBaseRecipe[Link All Variants to Base Recipe]
    LinkBaseRecipe --> LogCreation[Log All Creation Events]
    LogCreation --> ShowSuccess[Display Success with Variant Summary]
    ShowSuccess --> End([Return to Mapping List])
```

**Key Decision Points**:
- Fractional sales type selection (5 types)
- Pieces per unit configuration
- Auto-calculation of conversion rate
- Bulk vs. single variant creation

**Fractional Sales Calculations**:
```
Conversion Rate = 1 / Pieces per Unit

Examples:
- Pizza: 8 slices → 1/8 = 0.125
- Cake: 16 slices → 1/16 = 0.0625
- Bottle: 4 glasses → 1/4 = 0.25

Inventory Impact = Quantity Sold × Conversion Rate
- 5 pizza slices sold × 0.125 = 0.625 pizzas deducted
```

---

### FD-003: Edit Recipe Mapping Flow

```mermaid
flowchart TD
    Start([User Clicks Edit on Mapping Row]) --> LoadCurrent[Load Current Mapping Data]
    LoadCurrent --> OpenDrawer[Open Edit Drawer with Pre-filled Data]
    OpenDrawer --> UserEdits[User Modifies Fields]
    UserEdits --> ChangeDetection{Changes Detected?}
    ChangeDetection -->|No Changes| CloseDrawer[Close Drawer Without Saving]
    ChangeDetection -->|Changes Made| Validate{Validate Changes}
    Validate -->|Fail| ShowErrors[Display Validation Errors]
    ShowErrors --> UserEdits
    Validate -->|Pass| CheckImpact{Check User Impact}
    CheckImpact --> UsageCheck[Check if Mapping Used in Recent Transactions]
    UsageCheck --> HasUsage{Has Active Usage?}
    HasUsage -->|Yes| ShowWarning[Show Warning: Mapping Currently in Use]
    ShowWarning --> ConfirmChanges{User Confirms?}
    ConfirmChanges -->|No| UserEdits
    ConfirmChanges -->|Yes| SaveChanges[Save Updated Mapping]
    HasUsage -->|No| SaveChanges
    SaveChanges --> UpdateLinked[Update Linked Transaction Rules]
    UpdateLinked --> LogHistory[Log Changes in Audit Trail with Before/After]
    LogHistory --> RefreshList[Refresh Mapping List]
    RefreshList --> ShowSuccess[Display Success Message]
    ShowSuccess --> End([Close Edit Drawer])
    CloseDrawer --> End
```

**Key Decision Points**:
- Change detection to prevent unnecessary saves
- Validation of modified fields
- Usage impact analysis (warn if mapping is actively used)
- Confirmation required for high-impact changes

**Audit Trail Logged**:
- User ID and timestamp
- Before/after values for all changed fields
- IP address and user agent
- Reason for change (if provided)

---

### FD-004: Delete Recipe Mapping Flow

```mermaid
flowchart TD
    Start([User Clicks Delete on Mapping Row]) --> OpenDialog[Open Delete Confirmation Dialog]
    OpenDialog --> CheckUsage[Check Transaction Usage]
    CheckUsage --> HasTransactions{Has Transactions?}
    HasTransactions -->|Yes - Recent| BlockDelete[Block Deletion: Show Error]
    BlockDelete --> SuggestAlternative[Suggest: Deactivate Instead]
    SuggestAlternative --> UserChoice{User Chooses}
    UserChoice -->|Cancel| End([Close Dialog])
    UserChoice -->|Deactivate| DeactivateMapping[Set is_active = false]
    DeactivateMapping --> LogDeactivation[Log Deactivation Event]
    LogDeactivation --> ShowSuccess[Display Success Message]

    HasTransactions -->|Yes - Old| WarnTransactions[Warn: Historical Transactions Exist]
    WarnTransactions --> DeleteOptions[Offer Soft Delete or Hard Delete]
    HasTransactions -->|No| DeleteOptions

    DeleteOptions --> SoftDelete{Soft Delete?}
    SoftDelete -->|Yes| ReasonRequired[Require Deletion Reason]
    ReasonRequired --> EnterReason[User Enters Reason]
    EnterReason --> PerformSoftDelete[Set deleted_at = NOW, deleted_by_id = User]
    PerformSoftDelete --> LogSoftDelete[Log Soft Delete in Audit Trail]
    LogSoftDelete --> ShowSuccess

    SoftDelete -->|No - Hard Delete| HardDeleteWarning[Show Severe Warning]
    HardDeleteWarning --> FinalConfirm{Final Confirmation?}
    FinalConfirm -->|No| End
    FinalConfirm -->|Yes| RemoveRelations[Remove Foreign Key Relations]
    RemoveRelations --> PerformHardDelete[DELETE FROM tb_pos_recipe_mapping]
    PerformHardDelete --> LogHardDelete[Log Hard Delete Event]
    LogHardDelete --> ShowSuccess
    ShowSuccess --> RefreshList[Refresh Mapping List]
    RefreshList --> End
```

**Key Decision Points**:
- Transaction usage check (recent vs. historical)
- Soft delete vs. hard delete option
- Deletion reason requirement for soft delete
- Multiple confirmation steps for hard delete

**Delete Types**:
- **Soft Delete**: Sets `deleted_at` timestamp, preserves data for audit
- **Hard Delete**: Permanently removes record (only if no foreign key constraints)
- **Deactivate**: Sets `is_active = false`, keeps mapping visible but inactive

---

## 3. Transaction Processing Flows

### FD-005: Automated Transaction Processing Flow

```mermaid
flowchart TD
    Start([POS Transaction Received]) --> LogReceived[Log Transaction with Status: Received]
    LogReceived --> Validate{Validate Transaction}
    Validate -->|Fail| LogValidationError[Log Validation Error Details]
    LogValidationError --> CreateFailedTx[Create Failed Transaction Record]
    CreateFailedTx --> NotifyUser[Notify User of Validation Failure]
    NotifyUser --> End([Transaction Rejected])

    Validate -->|Pass| LookupLocation[Lookup Location Mapping]
    LookupLocation --> LocationFound{Location Mapped?}
    LocationFound -->|No| LogLocationError[Log Error: Invalid Location]
    LogLocationError --> CreateFailedTx

    LocationFound -->|Yes| ProcessItems[Process Each Transaction Item]
    ProcessItems --> ItemLoop{For Each Item}
    ItemLoop --> LookupRecipe[Lookup Recipe Mapping by POS Item Code]
    LookupRecipe --> RecipeFound{Mapping Exists?}
    RecipeFound -->|No| LogUnmappedItem[Log Unmapped Item Error]
    LogUnmappedItem --> AddToFailed[Add Item to Failed Items List]
    AddToFailed --> NextItem{More Items?}

    RecipeFound -->|Yes| CalculateImpact[Calculate Inventory Impact]
    CalculateImpact --> ApplyConversion[Quantity × Conversion Rate]
    ApplyConversion --> CheckStock[Check Inventory Availability]
    CheckStock --> StockAvailable{Stock Available?}
    StockAvailable -->|No| LogStockOut[Log Stock-Out]
    LogStockOut --> MarkForApproval[Mark Transaction for Approval]
    MarkForApproval --> NextItem

    StockAvailable -->|Yes| AddToProcessed[Add to Processed Items]
    AddToProcessed --> NextItem
    NextItem -->|Yes| ItemLoop
    NextItem -->|No| CheckResult{All Items Processed?}

    CheckResult -->|All Failed| UpdateStatus1[Status = Failed]
    UpdateStatus1 --> End

    CheckResult -->|Partial Success| UpdateStatus2[Status = Pending Approval]
    UpdateStatus2 --> NotifyManager[Notify Manager for Approval]
    NotifyManager --> End

    CheckResult -->|All Success| UpdateStatus3[Status = Processing]
    UpdateStatus3 --> DeductInventory[Deduct Inventory]
    DeductInventory --> CreateTxRecords[Create Inventory Transaction Records]
    CreateTxRecords --> FinalStatus[Status = Processed]
    FinalStatus --> LogSuccess[Log Successful Processing]
    LogSuccess --> End
```

**Key Decision Points**:
- Transaction validation (required fields, data types)
- Location mapping lookup
- Item-by-item recipe mapping lookup
- Stock availability check
- Partial success handling (some items succeed, some fail)

**Status Transitions**:
1. **Received** → Initial state when transaction arrives
2. **Validating** → Basic data validation in progress
3. **Pending Approval** → Stock-out or manual review required
4. **Processing** → All validations passed, updating inventory
5. **Processed** → Successfully completed
6. **Failed** → Unable to process due to errors

**Performance Targets**:
- Single transaction processing: < 500ms
- Batch processing (100 transactions): < 30 seconds
- Validation step: < 100ms
- Inventory update: < 200ms per item

---

### FD-006: Manual Transaction Review and Approval Flow

```mermaid
flowchart TD
    Start([Manager Opens Pending Approvals]) --> LoadPending[Load Transactions with Status: Pending Approval]
    LoadPending --> DisplayList[Display Transaction List with Filters]
    DisplayList --> SelectTx[Manager Selects Transaction]
    SelectTx --> LoadDetails[Load Full Transaction Details]
    LoadDetails --> ReviewItems[Review Items and Stock-Out Reasons]
    ReviewItems --> CheckInventory[Check Current Inventory Levels]
    CheckInventory --> ManagerDecision{Manager Decision}

    ManagerDecision -->|Approve| EnterNotes[Enter Approval Notes]
    EnterNotes --> AdjustStock{Adjust Stock Levels?}
    AdjustStock -->|Yes| CreateStockAdjustment[Create Inventory Adjustment Transaction]
    AdjustStock -->|No| SkipAdjustment[Proceed Without Adjustment]
    CreateStockAdjustment --> ProcessApproved[Process Approved Transaction]
    SkipAdjustment --> ProcessApproved
    ProcessApproved --> UpdateStatus1[Status = Processing]
    UpdateStatus1 --> DeductInventory[Deduct Inventory]
    DeductInventory --> FinalStatus1[Status = Processed]
    FinalStatus1 --> LogApproval[Log Approval with Notes]
    LogApproval --> NotifyCashier[Notify POS System/Cashier]
    NotifyCashier --> End([Return to Pending List])

    ManagerDecision -->|Reject| EnterRejectReason[Enter Rejection Reason]
    EnterRejectReason --> UpdateStatus2[Status = Rejected]
    UpdateStatus2 --> LogRejection[Log Rejection with Reason]
    LogRejection --> NotifyRejected[Notify Relevant Parties]
    NotifyRejected --> End

    ManagerDecision -->|Ignore| ConfirmIgnore[Confirm Ignore Action]
    ConfirmIgnore --> UpdateStatus3[Status = Ignored]
    UpdateStatus3 --> LogIgnore[Log Ignore Action]
    LogIgnore --> End
```

**Key Decision Points**:
- Approval or rejection decision
- Stock adjustment requirement
- Notification of approval/rejection
- Audit trail for all decisions

**Approval Scenarios**:
- **Stock-Out**: Item sold but insufficient inventory
- **Manual Review**: Transaction flagged for review
- **Exception Handling**: Unusual quantity or pricing
- **New Item**: First-time sale of newly mapped item

---

### FD-007: Failed Transaction Resolution Flow

```mermaid
flowchart TD
    Start([User Opens Failed Transactions]) --> LoadFailed[Load Failed Transaction List]
    LoadFailed --> FilterOptions[Filter by Failure Type]
    FilterOptions --> SelectFailed[Select Failed Transaction]
    SelectFailed --> ViewDetails[View Transaction Details and Error]
    ViewDetails --> IdentifyIssue{Identify Issue}

    IdentifyIssue -->|Unmapped Item| CheckMapping[Check if Mapping Now Exists]
    CheckMapping --> MappingExists{Mapping Created?}
    MappingExists -->|Yes| Reprocess[Reprocess Transaction]
    MappingExists -->|No| QuickMap[Quick Create Mapping]
    QuickMap --> Reprocess

    IdentifyIssue -->|Invalid Location| UpdateLocation[Update Location Mapping]
    UpdateLocation --> Reprocess

    IdentifyIssue -->|Validation Error| CorrectData[Correct Data Manually]
    CorrectData --> Reprocess

    IdentifyIssue -->|Processing Error| InvestigateRoot[Investigate Root Cause]
    InvestigateRoot --> FixIssue[Fix Underlying Issue]
    FixIssue --> Reprocess

    Reprocess --> ProcessAgain[Process Transaction]
    ProcessAgain --> Success{Processing Successful?}
    Success -->|Yes| UpdateResolution1[Resolution Status = Resolved]
    UpdateResolution1 --> LogResolution[Log Resolution Details]
    LogResolution --> RemoveFromFailed[Remove from Failed List]
    RemoveFromFailed --> End([Return to Failed List])

    Success -->|No| IncrementRetry[Increment Retry Count]
    IncrementRetry --> CheckRetryLimit{Retry Limit Reached?}
    CheckRetryLimit -->|No| UpdateResolution2[Resolution Status = Pending]
    UpdateResolution2 --> End
    CheckRetryLimit -->|Yes| UpdateResolution3[Resolution Status = Manual Intervention]
    UpdateResolution3 --> EscalateToSupport[Escalate to Technical Support]
    EscalateToSupport --> End

    IdentifyIssue -->|Cannot Resolve| MarkIgnored[Mark as Ignored]
    MarkIgnored --> EnterIgnoreReason[Enter Reason for Ignoring]
    EnterIgnoreReason --> UpdateResolution4[Resolution Status = Ignored]
    UpdateResolution4 --> LogIgnored[Log Ignore Action]
    LogIgnored --> End
```

**Key Decision Points**:
- Failure type identification (unmapped item, invalid location, validation error, processing error)
- Resolution method selection
- Retry attempt tracking
- Escalation to technical support if needed

**Failure Types**:
1. **Unmapped Item**: POS item code not found in recipe mappings → Create mapping
2. **Invalid Location**: POS location not mapped to Carmen location → Update location mapping
3. **Validation Error**: Data format or missing required fields → Correct data
4. **Processing Error**: System error during processing → Investigate and fix

**Bulk Resolution**:
- Users can select multiple failed transactions of the same type
- Apply same resolution action to all selected transactions
- Batch reprocessing for efficiency

---

## 4. Configuration and Settings Flows

### FD-008: Configure POS Integration Settings Flow

```mermaid
flowchart TD
    Start([Admin Opens POS Settings]) --> LoadConfig[Load Current Configuration]
    LoadConfig --> DisplayTabs[Display Configuration Tabs]
    DisplayTabs --> SelectTab{Select Tab}

    SelectTab -->|Connection| ConnectionTab[Connection Settings Tab]
    ConnectionTab --> SelectPOSSystem[Select POS System Type]
    SelectPOSSystem --> InterfaceType{Interface Type}
    InterfaceType -->|API| ConfigureAPI[Configure API Endpoint and Auth]
    InterfaceType -->|File| ConfigureFile[Configure File Path and Pattern]
    ConfigureAPI --> TestConnection[Test Connection Button]
    ConfigureFile --> TestConnection
    TestConnection --> ConnectionTest{Test Result}
    ConnectionTest -->|Success| SaveConnection[Save Connection Settings]
    ConnectionTest -->|Fail| ShowError[Display Connection Error]
    ShowError --> ConfigureAPI
    SaveConnection --> End([Return to Settings])

    SelectTab -->|Field Mapping| MappingTab[Field Mapping Tab]
    MappingTab --> DisplayFields[Display Current Field Mappings]
    DisplayFields --> AddField[Add New Field Mapping]
    AddField --> SelectPOSField[Select POS Field]
    SelectPOSField --> SelectSystemField[Select System Field]
    SelectSystemField --> SelectDataType[Select Data Type]
    SelectDataType --> MarkRequired[Mark as Required?]
    MarkRequired --> PreviewMapping[Preview Sample Data]
    PreviewMapping --> ValidateMapping{Validate Mapping}
    ValidateMapping -->|Pass| SaveFieldMapping[Save Field Mapping]
    ValidateMapping -->|Fail| ShowMappingError[Display Validation Error]
    ShowMappingError --> SelectPOSField
    SaveFieldMapping --> End

    SelectTab -->|Schedule| ScheduleTab[Sync Schedule Tab]
    ScheduleTab --> SelectFrequency[Select Sync Frequency]
    SelectFrequency --> FrequencyType{Frequency Type}
    FrequencyType -->|Real-time| EnableWebhook[Enable Webhook or Polling]
    FrequencyType -->|Hourly| SetHourlyInterval[Set Hourly Interval]
    FrequencyType -->|Daily| SetDailyTime[Set Daily Sync Time]
    EnableWebhook --> SaveSchedule[Save Schedule Settings]
    SetHourlyInterval --> SaveSchedule
    SetDailyTime --> SaveSchedule
    SaveSchedule --> UpdateCron[Update Cron Job or Scheduler]
    UpdateCron --> End
```

**Key Decision Points**:
- POS system selection (Oracle Simphony, Micros, Toast, Square, Clover)
- Interface type (API vs. File-based)
- Field mapping configuration
- Sync frequency selection

**Validation Rules**:
- Connection settings: Valid URL format, reachable endpoint
- Field mappings: No duplicate mappings, all required fields mapped
- Schedule: Valid cron expression or time format

---

## 5. Reporting Flows

### FD-009: Generate Consumption Report Flow

```mermaid
flowchart TD
    Start([User Opens Consumption Report]) --> SelectFilters[Select Report Filters]
    SelectFilters --> DateRange[Select Date Range]
    DateRange --> LocationFilter[Filter by Location]
    LocationFilter --> CategoryFilter[Filter by Category]
    CategoryFilter --> RecipeFilter[Filter by Recipe]
    RecipeFilter --> RunReport[Click Generate Report]
    RunReport --> FetchData[Fetch POS Transaction Data]
    FetchData --> ApplyFilters[Apply Selected Filters]
    ApplyFilters --> GroupData[Group by Recipe and Location]
    GroupData --> Calculate[Calculate Consumption Totals]
    Calculate --> SortResults[Sort by Quantity DESC]
    SortResults --> DisplayReport[Display Report Table]
    DisplayReport --> UserAction{User Action}

    UserAction -->|Export| SelectFormat[Select Export Format]
    SelectFormat --> ExportType{Export Type}
    ExportType -->|Excel| GenerateExcel[Generate Excel File]
    ExportType -->|CSV| GenerateCSV[Generate CSV File]
    ExportType -->|PDF| GeneratePDF[Generate PDF File]
    GenerateExcel --> Download[Download File]
    GenerateCSV --> Download
    GeneratePDF --> Download
    Download --> End([Close Report])

    UserAction -->|Drill Down| SelectRecipe[Click Recipe Row]
    SelectRecipe --> ShowDetails[Show Item-Level Details]
    ShowDetails --> DisplayBreakdown[Display Daily Breakdown]
    DisplayBreakdown --> BackToReport[Back to Summary]
    BackToReport --> DisplayReport

    UserAction -->|Close| End
```

**Report Columns**:
- Recipe Name
- Category
- Location
- Total Quantity Consumed
- Unit
- Period (Date Range)
- Transactions Count
- Average per Transaction

**Performance Targets**:
- Report generation: < 2 seconds for 30 days
- Export Excel: < 5 seconds
- Drill-down query: < 500ms

---

### FD-010: Generate Gross Profit Report Flow

```mermaid
flowchart TD
    Start([User Opens Gross Profit Report]) --> SelectPeriod[Select Reporting Period]
    SelectPeriod --> LocationSelect[Select Location]
    LocationSelect --> CategorySelect[Select Category]
    CategorySelect --> RunReport[Generate Report]
    RunReport --> FetchTransactions[Fetch POS Transactions]
    FetchTransactions --> FetchRecipes[Fetch Recipe Data]
    FetchRecipes --> FetchCosts[Fetch Recipe Costs]
    FetchCosts --> CalculateRevenue[Calculate Total Revenue]
    CalculateRevenue --> CalculateCost[Calculate Total Cost of Goods Sold]
    CalculateCost --> ComputeProfit[Gross Profit = Revenue - COGS]
    ComputeProfit --> ComputeMargin[Gross Margin % = Profit / Revenue × 100]
    ComputeMargin --> GroupByCategory[Group Results by Category]
    GroupByCategory --> SortByMargin[Sort by Gross Margin % DESC]
    SortByMargin --> DisplayReport[Display Profit Report]
    DisplayReport --> VisualizeTrends[Show Trend Charts]
    VisualizeTrends --> UserAction{User Action}

    UserAction -->|Export| ExportReport[Export to Excel/PDF]
    ExportReport --> End([Close Report])

    UserAction -->|Drill Down| SelectItem[Select Recipe Item]
    SelectItem --> ShowItemProfit[Show Item-Level Profit Details]
    ShowItemProfit --> ShowCostBreakdown[Display Cost Breakdown]
    ShowCostBreakdown --> BackToSummary[Back to Summary]
    BackToSummary --> DisplayReport

    UserAction -->|Close| End
```

**Report Metrics**:
- Revenue: Total sales amount
- COGS: Cost of goods sold (recipe cost × quantity)
- Gross Profit: Revenue - COGS
- Gross Margin %: (Gross Profit / Revenue) × 100
- Contribution per Item
- Top/Bottom performers by margin

**Calculations**:
```
For each transaction:
1. Sales Amount = POS Transaction Amount
2. Recipe Cost = Recipe.cost_per_unit × Conversion Rate × Quantity
3. Gross Profit = Sales Amount - Recipe Cost
4. Gross Margin % = (Gross Profit / Sales Amount) × 100
```

---

## 6. Performance Metrics Summary

| Flow | Target Time | Critical Path | Optimization Strategy |
|------|------------|---------------|----------------------|
| FD-001: Create Mapping | < 30 sec | Form validation, duplicate check | Client-side validation, indexed queries |
| FD-002: Fractional Sales | < 45 sec | Conversion calculation, bulk create | Batch insert, optimistic UI updates |
| FD-003: Edit Mapping | < 20 sec | Usage check, update transaction rules | Cached usage data, async rule updates |
| FD-004: Delete Mapping | < 15 sec | Transaction count query, soft delete | Indexed transaction queries |
| FD-005: Process Transaction | < 500 ms | Mapping lookups, inventory deduction | Indexed lookups, batch inventory updates |
| FD-006: Approve Transaction | < 10 sec | Inventory check, stock adjustment | Real-time inventory cache |
| FD-007: Resolve Failed Tx | < 30 sec | Mapping creation, reprocessing | Quick create forms, batch retry |
| FD-008: Configure Settings | < 20 sec | Connection test, field mapping save | Async connection test, debounced saves |
| FD-009: Consumption Report | < 2 sec | Transaction aggregation, grouping | Materialized views, pre-aggregation |
| FD-010: Gross Profit Report | < 3 sec | Cost calculation, profit computation | Cached recipe costs, indexed joins |

---

## 7. Error Handling & Recovery

### Common Error Scenarios

**Mapping Errors**:
- Duplicate POS item code → Prevent save, show error
- Invalid conversion rate → Client validation before save
- Missing required fields → Highlight fields, block save

**Transaction Errors**:
- Unmapped item → Log to failed transactions, notify user
- Invalid location → Reject transaction, alert admin
- Stock-out → Flag for approval, hold transaction
- Processing timeout → Retry with exponential backoff

**Configuration Errors**:
- Connection failure → Display error, suggest troubleshooting
- Invalid field mapping → Prevent save, show validation errors
- Sync failure → Log error, retry on next schedule

---

**Document Control**:
- **Created**: 2025-01-16
- **Version**: 1.0
- **Status**: Active (POS Integration)
- **Next Review**: Q2 2025
