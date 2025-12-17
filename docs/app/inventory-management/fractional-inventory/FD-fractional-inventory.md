# Flow Diagrams: Fractional Inventory Management

## Document Information
- **Module**: Inventory Management - Fractional Inventory
- **Component**: Fractional Inventory Management and Conversion Operations
- **Version**: 1.0.0
- **Last Updated**: 2025-01-12
- **Status**: Complete

## Related Documents
- [Business Requirements](./BR-fractional-inventory.md)
- [Use Cases](./UC-fractional-inventory.md)
- [Technical Specification](./TS-fractional-inventory.md)
- [Data Schema](./DS-fractional-inventory.md)
- [Data Structure Gaps](./data-structure-gaps.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Introduction

### 1.1 Purpose

This document provides comprehensive flow diagrams for the Fractional Inventory Management sub-module, illustrating system workflows, data flows, user interactions, and integration points using Mermaid notation.

### 1.2 Diagram Types

1. **System Architecture** - High-level component relationships
2. **Data Flow Diagrams** - Data movement through the system
3. **Workflow Diagrams** - Step-by-step process flows
4. **Integration Diagrams** - External system interactions
5. **State Transition Diagrams** - Object lifecycle flows

### 1.3 Notation Legend

```mermaid
graph LR
    A[User Action] --> B{Decision Point}
    B -->|Yes| C[Process]
    B -->|No| D[Alternative]
    C --> E[(Database)]
    E --> F[Result/Output]

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#e8f5e9
    style D fill:#ffebee
    style E fill:#f3e5f5
    style F fill:#e0f2f1
```

**Color Coding**:
- 🔵 Blue: User actions and inputs
- 🟡 Yellow: Decision points and validations
- 🟢 Green: System processes and operations
- 🔴 Red: Error handling and alternate flows
- 🟣 Purple: Database operations
- 🟦 Teal: Results and outputs

---

## 2. System Architecture

### 2.1 Component Architecture

```mermaid
graph TB
    subgraph 'Frontend Layer'
        UI[React Components]
        Forms[Form Components]
        Dashboard[Dashboard Views]
    end

    subgraph 'Application Layer'
        SA[Server Actions]
        Services[Business Services]
        Alerts[Alert Engine]
        Recs[Recommendation Engine]
    end

    subgraph 'Data Layer'
        DB[(PostgreSQL Database)]
        Cache[Redis Cache]
    end

    subgraph 'External Systems'
        Inv[Standard Inventory]
        Order[Order Management]
        Notif[Notification Service]
    end

    UI --> SA
    Forms --> SA
    Dashboard --> SA

    SA --> Services
    Services --> Alerts
    Services --> Recs

    Services --> DB
    Services --> Cache
    Alerts --> DB
    Recs --> DB

    Services --> Inv
    Services --> Order
    Alerts --> Notif

    style UI fill:#e1f5ff
    style Forms fill:#e1f5ff
    style Dashboard fill:#e1f5ff
    style SA fill:#e8f5e9
    style Services fill:#e8f5e9
    style Alerts fill:#fff4e1
    style Recs fill:#fff4e1
    style DB fill:#f3e5f5
    style Cache fill:#f3e5f5
```

### 2.2 Data Flow Architecture

```mermaid
graph LR
    subgraph 'Input Sources'
        User[User Input]
        Cron[Scheduled Jobs]
        Events[System Events]
    end

    subgraph 'Processing'
        Validate[Validation Layer]
        Business[Business Logic]
        Calculate[Calculations]
    end

    subgraph 'Storage'
        Tables[(Core Tables)]
        Audit[(Audit Tables)]
        Cache[(Cache)]
    end

    subgraph 'Outputs'
        UI[UI Updates]
        Alerts[Alert System]
        Reports[Reports]
    end

    User --> Validate
    Cron --> Validate
    Events --> Validate

    Validate --> Business
    Business --> Calculate

    Calculate --> Tables
    Calculate --> Audit
    Tables --> Cache

    Tables --> UI
    Tables --> Alerts
    Tables --> Reports

    style User fill:#e1f5ff
    style Validate fill:#e8f5e9
    style Business fill:#e8f5e9
    style Calculate fill:#fff4e1
    style Tables fill:#f3e5f5
    style Audit fill:#f3e5f5
```

---

## 3. Core Workflows

### 3.1 Fractional Item Configuration

```mermaid
flowchart TD
    Start([User: Configure Fractional Item]) --> CheckAuth{User Has<br>Permission?}

    CheckAuth -->|No| ErrorAuth[Error: Unauthorized]
    CheckAuth -->|Yes| SelectItem[Select Item from<br>Product Catalog]

    SelectItem --> CheckExists{Item Already<br>Configured?}

    CheckExists -->|Yes| LoadConfig[Load Existing<br>Configuration]
    CheckExists -->|No| NewConfig[Create New<br>Configuration]

    LoadConfig --> ConfigForm[Display Configuration Form]
    NewConfig --> ConfigForm

    ConfigForm --> EnterDetails[Enter/Edit Details:<br>- Portion Sizes<br>- Shelf Life<br>- Quality Hours<br>- Waste %<br>- Costs]

    EnterDetails --> ValidateInput{Valid<br>Input?}

    ValidateInput -->|No| ShowErrors[Show Validation<br>Errors]
    ShowErrors --> ConfigForm

    ValidateInput -->|Yes| CheckRules{Business Rules<br>Pass?}

    CheckRules -->|No| ShowBizErrors[Show Business<br>Rule Errors]
    ShowBizErrors --> ConfigForm

    CheckRules -->|Yes| SaveConfig[(Save to<br>tb_fractional_item)]

    SaveConfig --> LogActivity[Log Activity:<br>CREATE/UPDATE]

    LogActivity --> Success[Success Message:<br>Item Configured]

    Success --> End([End])
    ErrorAuth --> End

    style Start fill:#e1f5ff
    style CheckAuth fill:#fff4e1
    style ValidateInput fill:#fff4e1
    style CheckRules fill:#fff4e1
    style SaveConfig fill:#f3e5f5
    style Success fill:#e0f2f1
    style ErrorAuth fill:#ffebee
    style ShowErrors fill:#ffebee
    style ShowBizErrors fill:#ffebee
```

### 3.2 Split Conversion Workflow (Whole → Portions)

```mermaid
flowchart TD
    Start([User: Split Conversion]) --> ViewStock[View Stock List<br>Filter: RAW/PREPARED]

    ViewStock --> SelectStock[Select Stock to Split]

    SelectStock --> CheckState{Stock State<br>= RAW or<br>PREPARED?}

    CheckState -->|No| ErrorState[Error: Invalid State<br>for Split]

    CheckState -->|Yes| LoadItem[(Load Item Config:<br>Portion Sizes)]

    LoadItem --> SelectPortion[Select Portion Size<br>e.g., 8 slices]

    SelectPortion --> EnterQty[Enter Quantity<br>Whole Units to Split]

    EnterQty --> ValidateQty{Quantity<br>Available?}

    ValidateQty -->|No| ErrorQty[Error: Insufficient<br>Stock]

    ValidateQty -->|Yes| Calculate[Calculate:<br>- Expected Portions<br>- Waste Amount<br>- Actual Portions<br>- Efficiency]

    Calculate --> Preview[Show Conversion<br>Preview with Costs]

    Preview --> Confirm{User<br>Confirms?}

    Confirm -->|No| Cancel[Cancel Operation]

    Confirm -->|Yes| BeginTx[Begin Transaction]

    BeginTx --> CreateRecord[(Create<br>tb_conversion_record)]

    CreateRecord --> UpdateStock[(Update<br>tb_fractional_stock:<br>- Deduct whole_units<br>- Add total_portions<br>- Update state)]

    UpdateStock --> CreateWaste{Waste<br>Generated?}

    CreateWaste -->|Yes| RecordWaste[(Record Waste in<br>tb_fractional_stock)]
    CreateWaste -->|No| CheckAlert

    RecordWaste --> CheckAlert{Quality/Qty<br>Alerts?}

    CheckAlert -->|Yes| CreateAlert[(Create<br>tb_inventory_alert)]
    CheckAlert -->|No| CommitTx

    CreateAlert --> CommitTx[Commit Transaction]

    CommitTx --> LogActivity[Log Activity:<br>SPLIT_CONVERSION]

    LogActivity --> Success[Success Message:<br>Conversion Complete<br>Show Efficiency]

    Success --> End([End])
    ErrorState --> End
    ErrorQty --> End
    Cancel --> End

    style Start fill:#e1f5ff
    style CheckState fill:#fff4e1
    style ValidateQty fill:#fff4e1
    style Confirm fill:#fff4e1
    style CreateRecord fill:#f3e5f5
    style UpdateStock fill:#f3e5f5
    style RecordWaste fill:#f3e5f5
    style CreateAlert fill:#f3e5f5
    style Success fill:#e0f2f1
    style ErrorState fill:#ffebee
    style ErrorQty fill:#ffebee
```

### 3.3 Combine Conversion Workflow (Portions → Whole)

```mermaid
flowchart TD
    Start([User: Combine Conversion]) --> ViewStock[View Stock List<br>Filter: PORTIONED/PARTIAL]

    ViewStock --> SelectStock[Select Stock to Combine]

    SelectStock --> CheckState{Stock State<br>= PORTIONED<br>or PARTIAL?}

    CheckState -->|No| ErrorState[Error: Invalid State<br>for Combine]

    CheckState -->|Yes| LoadItem[(Load Item Config:<br>Portions per Whole)]

    LoadItem --> ShowAvailable[Show Available<br>Portions Count]

    ShowAvailable --> EnterQty[Enter Portions<br>to Combine]

    EnterQty --> ValidateQty{Portions<br>Available?}

    ValidateQty -->|No| ErrorQty[Error: Insufficient<br>Portions]

    ValidateQty -->|Yes| Calculate[Calculate:<br>- Whole Units Created<br>- Remaining Portions<br>- Quality Impact]

    Calculate --> CheckQuality{Quality<br>Acceptable?}

    CheckQuality -->|No| WarnQuality[Warning: Quality<br>Degradation]
    WarnQuality --> Confirm

    CheckQuality -->|Yes| Preview[Show Combine<br>Preview]

    Preview --> Confirm{User<br>Confirms?}

    Confirm -->|No| Cancel[Cancel Operation]

    Confirm -->|Yes| BeginTx[Begin Transaction]

    BeginTx --> CreateRecord[(Create<br>tb_conversion_record)]

    CreateRecord --> UpdateStock[(Update<br>tb_fractional_stock:<br>- Add whole_units<br>- Deduct total_portions<br>- Update state)]

    UpdateStock --> UpdateQuality{Quality<br>Degraded?}

    UpdateQuality -->|Yes| AdjustGrade[(Adjust<br>quality_grade)]
    UpdateQuality -->|No| CommitTx

    AdjustGrade --> CommitTx[Commit Transaction]

    CommitTx --> LogActivity[Log Activity:<br>COMBINE_CONVERSION]

    LogActivity --> Success[Success Message:<br>Combination Complete]

    Success --> End([End])
    ErrorState --> End
    ErrorQty --> End
    Cancel --> End

    style Start fill:#e1f5ff
    style CheckState fill:#fff4e1
    style ValidateQty fill:#fff4e1
    style CheckQuality fill:#fff4e1
    style Confirm fill:#fff4e1
    style CreateRecord fill:#f3e5f5
    style UpdateStock fill:#f3e5f5
    style AdjustGrade fill:#f3e5f5
    style Success fill:#e0f2f1
    style ErrorState fill:#ffebee
    style ErrorQty fill:#ffebee
```

### 3.4 Quality Monitoring Workflow

```mermaid
flowchart TD
    Start([Scheduled Job:<br>Every 15 minutes]) --> LoadActive[(Load Active<br>Fractional Stock<br>WHERE prepared_at<br>IS NOT NULL)]

    LoadActive --> LoopStock{For Each<br>Stock Record}

    LoopStock -->|No More| End([End])

    LoopStock -->|Next| LoadConfig[(Load Item Config:<br>shelf_life_hours<br>max_quality_hours)]

    LoadConfig --> CalcElapsed[Calculate:<br>Hours Elapsed Since<br>prepared_at]

    CalcElapsed --> CheckExpired{Expired?<br>elapsed ><br>shelf_life}

    CheckExpired -->|Yes| SetExpired[Set quality_grade<br>= 'expired']
    SetExpired --> CreateExpiryAlert

    CheckExpired -->|No| CheckExcellent{Excellent?<br>elapsed <=<br>max_quality}

    CheckExcellent -->|Yes| SetExcellent[Set quality_grade<br>= 'excellent']
    SetExcellent --> LoopStock

    CheckExcellent -->|No| CalcPercent[Calculate:<br>shelf_life_percent<br>= elapsed / shelf_life]

    CalcPercent --> CheckGood{percent<br><= 0.75?}

    CheckGood -->|Yes| SetGood[Set quality_grade<br>= 'good']
    SetGood --> CheckPrevious

    CheckGood -->|No| CheckFair{percent<br><= 0.90?}

    CheckFair -->|Yes| SetFair[Set quality_grade<br>= 'fair']
    SetFair --> CheckPrevious

    CheckFair -->|No| SetPoor[Set quality_grade<br>= 'poor']

    SetPoor --> CreateDegAlert[Create Alert:<br>QUALITY_DEGRADING]
    CreateDegAlert --> CheckPrevious

    CheckPrevious{Grade<br>Changed?}

    CheckPrevious -->|No| LoopStock
    CheckPrevious -->|Yes| UpdateDB[(Update Stock:<br>quality_grade<br>quality_updated_at)]

    UpdateDB --> LoopStock

    CreateExpiryAlert[(Create Alert:<br>QUALITY_POOR<br>severity: CRITICAL)]

    CreateExpiryAlert --> UpdateDB

    style Start fill:#e1f5ff
    style LoadActive fill:#f3e5f5
    style LoadConfig fill:#f3e5f5
    style CheckExpired fill:#fff4e1
    style CheckExcellent fill:#fff4e1
    style CheckGood fill:#fff4e1
    style CheckFair fill:#fff4e1
    style CheckPrevious fill:#fff4e1
    style UpdateDB fill:#f3e5f5
    style CreateExpiryAlert fill:#f3e5f5
    style CreateDegAlert fill:#f3e5f5
```

### 3.5 Alert Generation Workflow

```mermaid
flowchart TD
    Start([Scheduled Job:<br>Every 30 minutes]) --> LoadStock[(Load All Active<br>Fractional Stock)]

    LoadStock --> LoopStock{For Each<br>Stock Record}

    LoopStock -->|No More| End([End])

    LoopStock -->|Next| CheckQuality{Quality<br>= poor or<br>expired?}

    CheckQuality -->|Yes| CreateQualityAlert[(Create Alert:<br>QUALITY_POOR<br>severity: HIGH)]

    CheckQuality -->|No| CheckExpiry

    CreateQualityAlert --> CheckExpiry{Expiry<br>within 24hrs?}

    CheckExpiry -->|Yes| CreateExpiryAlert[(Create Alert:<br>EXPIRY_WARNING<br>severity: HIGH)]

    CheckExpiry -->|No| CheckPortions

    CreateExpiryAlert --> CheckPortions{Available<br>Portions < Min<br>Threshold?}

    CheckPortions -->|Yes| LoadHistory[(Load Sales<br>History:<br>Last 7 Days)]

    CheckPortions -->|No| CheckReserved

    LoadHistory --> CalcAvg[Calculate:<br>Daily Average<br>Sales]

    CalcAvg --> CalcStockout[Calculate:<br>Hours Until<br>Stockout]

    CalcStockout --> CheckUrgent{Stockout<br>< 4 hours?}

    CheckUrgent -->|Yes| CreateUrgentAlert[(Create Alert:<br>PORTION_LOW<br>severity: CRITICAL)]

    CheckUrgent -->|No| CreateLowAlert[(Create Alert:<br>PORTION_LOW<br>severity: MEDIUM)]

    CreateUrgentAlert --> CheckReserved
    CreateLowAlert --> CheckReserved

    CheckReserved{Reserved ><br>80% of Total?}

    CheckReserved -->|Yes| CreateReservedAlert[(Create Alert:<br>RESERVED_HIGH<br>severity: MEDIUM)]

    CheckReserved -->|No| CheckConversion

    CreateReservedAlert --> CheckConversion{Optimal for<br>Conversion?}

    CheckConversion -->|Yes| CreateConvAlert[(Create Alert:<br>CONVERSION_OPTIMAL<br>severity: LOW)]

    CheckConversion -->|No| CheckAlertExists

    CreateConvAlert --> CheckAlertExists{Active Alert<br>Already Exists?}

    CheckAlertExists -->|Yes| LoopStock
    CheckAlertExists -->|No| SaveAlert[(Save Alert to<br>tb_inventory_alert)]

    SaveAlert --> SendNotif[Send Notification<br>to User]

    SendNotif --> LoopStock

    style Start fill:#e1f5ff
    style LoadStock fill:#f3e5f5
    style CheckQuality fill:#fff4e1
    style CheckExpiry fill:#fff4e1
    style CheckPortions fill:#fff4e1
    style CheckUrgent fill:#fff4e1
    style CheckReserved fill:#fff4e1
    style CheckConversion fill:#fff4e1
    style CheckAlertExists fill:#fff4e1
    style CreateQualityAlert fill:#f3e5f5
    style CreateExpiryAlert fill:#f3e5f5
    style CreateUrgentAlert fill:#f3e5f5
    style CreateLowAlert fill:#f3e5f5
    style CreateReservedAlert fill:#f3e5f5
    style CreateConvAlert fill:#f3e5f5
    style SaveAlert fill:#f3e5f5
```

---

## 4. Search and Filter Workflows

### 4.1 Stock List Filtering

```mermaid
flowchart TD
    Start([User: View Stock List]) --> LoadDefaults[Load Default View:<br>Current Location<br>All Active Items]

    LoadDefaults --> ApplyFilters{User Applies<br>Filters?}

    ApplyFilters -->|No| QueryDB

    ApplyFilters -->|Yes| SelectFilters[Select Filters:<br>- State<br>- Quality Grade<br>- Expiry Range<br>- Item Category<br>- Has Alerts]

    SelectFilters --> QueryDB[(Query<br>tb_fractional_stock<br>WITH Filters)]

    QueryDB --> SortResults[Sort Results:<br>- Expiry Date ASC<br>- Quality DESC<br>- Updated At DESC]

    SortResults --> EnrichData[Enrich Data:<br>- Item Details<br>- Available Portions<br>- Alert Count<br>- Last Conversion]

    EnrichData --> DisplayList[Display Stock List<br>with Indicators:<br>🔴 Expiring Soon<br>⚠️ Quality Issue<br>📊 Low Stock]

    DisplayList --> UserAction{User<br>Action?}

    UserAction -->|Refresh| LoadDefaults
    UserAction -->|Change Filter| SelectFilters
    UserAction -->|View Details| ViewDetails[Show Stock<br>Details Modal]
    UserAction -->|Convert| GoConvert[Navigate to<br>Conversion Screen]
    UserAction -->|Exit| End([End])

    ViewDetails --> UserAction
    GoConvert --> End

    style Start fill:#e1f5ff
    style ApplyFilters fill:#fff4e1
    style UserAction fill:#fff4e1
    style QueryDB fill:#f3e5f5
    style DisplayList fill:#e0f2f1
```

### 4.2 Conversion History Search

```mermaid
flowchart TD
    Start([User: View Conversion History]) --> SelectFilters[Select Filters:<br>- Date Range<br>- Item<br>- Conversion Type<br>- Location<br>- Performed By]

    SelectFilters --> QueryDB[(Query<br>tb_conversion_record<br>WITH Filters<br>ORDER BY performed_at DESC)]

    QueryDB --> LoadRelated[(Load Related Data:<br>- Item Info<br>- User Info<br>- Stock Before/After)]

    LoadRelated --> GroupByDate[Group Records<br>by Date]

    GroupByDate --> CalcStats[Calculate Stats:<br>- Total Conversions<br>- Avg Efficiency<br>- Total Waste<br>- Cost Summary]

    CalcStats --> DisplayResults[Display Results<br>with Timeline View]

    DisplayResults --> UserAction{User<br>Action?}

    UserAction -->|Change Filter| SelectFilters
    UserAction -->|View Details| ViewConversion[Show Conversion<br>Details Modal]
    UserAction -->|Export| ExportData[Export to CSV/Excel]
    UserAction -->|Exit| End([End])

    ViewConversion --> UserAction
    ExportData --> End

    style Start fill:#e1f5ff
    style UserAction fill:#fff4e1
    style QueryDB fill:#f3e5f5
    style LoadRelated fill:#f3e5f5
    style DisplayResults fill:#e0f2f1
```

---

## 5. State Transition Workflows

### 5.1 Stock State Lifecycle

```mermaid
stateDiagram-v2
    [*] --> RAW: Inventory Receipt<br>(Whole Items)

    RAW --> PREPARED: Prepare<br>Operation
    RAW --> PORTIONED: Direct Split<br>(No Prep)
    RAW --> WASTE: Mark as Waste

    PREPARED --> PORTIONED: Portion<br>Operation
    PREPARED --> WASTE: Mark as Waste

    PORTIONED --> PARTIAL: Partial<br>Consumption
    PORTIONED --> COMBINED: Combine<br>Operation
    PORTIONED --> WASTE: Mark as Waste

    PARTIAL --> PORTIONED: Conversion<br>Complete
    PARTIAL --> COMBINED: Combine<br>Operation
    PARTIAL --> WASTE: Mark as Waste

    COMBINED --> PORTIONED: Re-Split
    COMBINED --> WASTE: Mark as Waste

    WASTE --> [*]: Inventory<br>Write-off

    note right of RAW
        Initial state for<br>
        whole items from<br>
        standard inventory
    end note

    note right of PREPARED
        Items processed<br>
        but not portioned<br>
        (e.g., cooked pizza)
    end note

    note right of PORTIONED
        Items divided into<br>
        sellable portions<br>
        (e.g., pizza slices)
    end note

    note right of PARTIAL
        Some portions sold,<br>
        remainder tracked<br>
        separately
    end note

    note right of WASTE
        Terminal state<br>
        for waste tracking<br>
        and reporting
    end note
```

### 5.2 Quality Grade Lifecycle

```mermaid
stateDiagram-v2
    [*] --> EXCELLENT: Item Prepared<br>(prepared_at set)

    EXCELLENT --> GOOD: max_quality_hours<br>Elapsed

    GOOD --> FAIR: 75% Shelf Life<br>Elapsed

    FAIR --> POOR: 90% Shelf Life<br>Elapsed

    POOR --> EXPIRED: shelf_life_hours<br>Exceeded

    EXPIRED --> [*]: Marked as<br>WASTE

    note right of EXCELLENT
        Within max_quality_hours<br>
        Perfect selling condition<br>
        No alerts
    end note

    note right of GOOD
        Past max_quality_hours<br>
        Still good quality<br>
        No alerts
    end note

    note right of FAIR
        75-90% shelf life<br>
        Quality degrading<br>
        Alert: QUALITY_DEGRADING
    end note

    note right of POOR
        90-100% shelf life<br>
        Poor quality<br>
        Alert: QUALITY_POOR
    end note

    note right of EXPIRED
        Past shelf_life_hours<br>
        Must be disposed<br>
        Alert: QUALITY_POOR (CRITICAL)
    end note
```

### 5.3 Alert Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> ACTIVE: Alert<br>Triggered

    ACTIVE --> ACKNOWLEDGED: User<br>Acknowledges
    ACTIVE --> DISMISSED: User<br>Dismisses
    ACTIVE --> AUTO_RESOLVED: System<br>Resolves

    ACKNOWLEDGED --> RESOLVED: User<br>Resolves Issue
    ACKNOWLEDGED --> DISMISSED: User<br>Dismisses
    ACKNOWLEDGED --> AUTO_RESOLVED: System<br>Resolves

    RESOLVED --> [*]: Complete
    DISMISSED --> [*]: Complete
    AUTO_RESOLVED --> [*]: Complete

    note right of ACTIVE
        Alert created<br>
        Requires attention<br>
        Visible in dashboard
    end note

    note right of ACKNOWLEDGED
        User has seen alert<br>
        Issue being addressed<br>
        Still visible
    end note

    note right of RESOLVED
        User manually<br>
        resolved issue<br>
        No longer active
    end note

    note right of DISMISSED
        User chose to<br>
        ignore alert<br>
        No longer visible
    end note

    note right of AUTO_RESOLVED
        System detected<br>
        issue resolved<br>
        No action needed
    end note
```

---

## 6. Integration Workflows

### 6.1 Integration with Standard Inventory

```mermaid
flowchart TD
    Start([Inventory Receipt<br>Processing]) --> CheckItem{Item is<br>Fractional?}

    CheckItem -->|No| StandardFlow[Process as<br>Standard Item]
    StandardFlow --> End([End])

    CheckItem -->|Yes| LoadConfig[(Load Fractional<br>Item Config)]

    LoadConfig --> CheckStock{Stock Exists<br>for Location?}

    CheckStock -->|No| CreateStock[(Create New<br>tb_fractional_stock<br>state = RAW)]

    CheckStock -->|Yes| LoadStock[(Load Existing<br>Stock Record)]

    CreateStock --> UpdateQty
    LoadStock --> UpdateQty[Update Quantities:<br>whole_units +=<br>received_qty]

    UpdateQty --> CalcPortions[Calculate:<br>total_portions<br>= whole_units *<br>portions_per_whole]

    CalcPortions --> SaveStock[(Save Stock<br>Changes)]

    SaveStock --> CreateTransaction[(Create<br>tb_inventory_transaction<br>for Standard Inventory)]

    CreateTransaction --> SyncBalances[Sync Balance:<br>Standard ↔ Fractional]

    SyncBalances --> LogActivity[Log Activity:<br>INVENTORY_RECEIPT]

    LogActivity --> CheckThreshold{Stock Below<br>Threshold?}

    CheckThreshold -->|Yes| CreateAlert[(Create Alert:<br>PORTION_LOW)]
    CheckThreshold -->|No| Success

    CreateAlert --> Success[Receipt Complete]

    Success --> End

    style Start fill:#e1f5ff
    style CheckItem fill:#fff4e1
    style CheckStock fill:#fff4e1
    style CheckThreshold fill:#fff4e1
    style LoadConfig fill:#f3e5f5
    style CreateStock fill:#f3e5f5
    style LoadStock fill:#f3e5f5
    style SaveStock fill:#f3e5f5
    style CreateTransaction fill:#f3e5f5
    style CreateAlert fill:#f3e5f5
    style Success fill:#e0f2f1
```

### 6.2 Integration with Order Management

```mermaid
flowchart TD
    Start([Order Item<br>Requested]) --> CheckFractional{Is Fractional<br>Item?}

    CheckFractional -->|No| StandardFlow[Process Standard<br>Order Item]
    StandardFlow --> End([End])

    CheckFractional -->|Yes| CheckPortions{Order by<br>Portions?}

    CheckPortions -->|No| CheckWhole[Check Whole<br>Units Available]
    CheckPortions -->|Yes| CheckAvail[Check Portions<br>Available]

    CheckWhole --> ValidateWhole{Whole Units<br>Available?}
    ValidateWhole -->|No| ErrorStock
    ValidateWhole -->|Yes| ReserveWhole

    CheckAvail --> ValidatePortions{Portions<br>Available?}

    ValidatePortions -->|No| ErrorStock[Error: Insufficient<br>Stock]
    ErrorStock --> End

    ValidatePortions -->|Yes| ReservePortions[(Reserve Portions:<br>reserved_portions +=<br>qty_ordered)]

    ReserveWhole[(Reserve Whole:<br>whole_units -=<br>qty_ordered)]

    ReservePortions --> UpdateAvail[Update:<br>available_portions<br>= total - reserved]
    ReserveWhole --> UpdateAvail

    UpdateAvail --> SaveStock[(Save Stock<br>Changes)]

    SaveStock --> CheckLow{Available<br>< Threshold?}

    CheckLow -->|Yes| CreateAlert[(Create Alert:<br>PORTION_LOW)]
    CheckLow -->|No| Success

    CreateAlert --> Success[Item Reserved<br>for Order]

    Success --> End

    style Start fill:#e1f5ff
    style CheckFractional fill:#fff4e1
    style CheckPortions fill:#fff4e1
    style ValidateWhole fill:#fff4e1
    style ValidatePortions fill:#fff4e1
    style CheckLow fill:#fff4e1
    style ReservePortions fill:#f3e5f5
    style ReserveWhole fill:#f3e5f5
    style SaveStock fill:#f3e5f5
    style CreateAlert fill:#f3e5f5
    style Success fill:#e0f2f1
    style ErrorStock fill:#ffebee
```

### 6.3 Integration with Recommendation Engine

```mermaid
flowchart TD
    Start([Scheduled Job:<br>Daily 6 AM]) --> LoadItems[(Load All Fractional<br>Items with Stock)]

    LoadItems --> LoopItems{For Each<br>Item}

    LoopItems -->|No More| End([End])

    LoopItems -->|Next| LoadSales[(Load Sales History:<br>Last 30 Days)]

    LoadSales --> LoadStock[(Load Current Stock:<br>All States)]

    LoadStock --> AnalyzeDemand[Analyze Demand:<br>- Daily Average<br>- Trend<br>- Day of Week Pattern]

    AnalyzeDemand --> ForecastDemand[Forecast Demand:<br>Next 3 Days]

    ForecastDemand --> CheckGap{Demand Gap<br>Detected?}

    CheckGap -->|No| LoopItems

    CheckGap -->|Yes| CheckType{Gap Type?}

    CheckType -->|Portion Shortage| GenSplitRec[Generate<br>SPLIT Recommendation]
    CheckType -->|Excess Portions| GenCombineRec[Generate<br>COMBINE Recommendation]
    CheckType -->|Quality Issue| GenPrepareRec[Generate<br>PREPARE Recommendation]

    GenSplitRec --> CalcParams
    GenCombineRec --> CalcParams
    GenPrepareRec --> CalcParams

    CalcParams[Calculate Parameters:<br>- Recommended Units<br>- Expected Yield<br>- Estimated Cost<br>- Estimated Revenue<br>- Confidence Score]

    CalcParams --> SetPriority[Set Priority Score<br>Based on:<br>- Urgency<br>- Revenue Impact<br>- Efficiency]

    SetPriority --> CalcTiming[Calculate Optimal<br>Conversion Time:<br>Based on demand peak]

    CalcTiming --> SaveRec[(Save Recommendation:<br>tb_conversion_recommendation<br>status = PENDING)]

    SaveRec --> CreateAlert{High Priority<br>Recommendation?}

    CreateAlert -->|Yes| GenAlert[(Create Alert:<br>CONVERSION_OPTIMAL)]
    CreateAlert -->|No| LoopItems

    GenAlert --> SendNotif[Send Notification<br>to Manager]

    SendNotif --> LoopItems

    style Start fill:#e1f5ff
    style LoadItems fill:#f3e5f5
    style LoadSales fill:#f3e5f5
    style LoadStock fill:#f3e5f5
    style CheckGap fill:#fff4e1
    style CheckType fill:#fff4e1
    style CreateAlert fill:#fff4e1
    style SaveRec fill:#f3e5f5
    style GenAlert fill:#f3e5f5
```

---

## 7. Notification Workflows

### 7.1 Alert Notification Flow

```mermaid
flowchart TD
    Start([Alert Created]) --> GetSeverity{Alert<br>Severity?}

    GetSeverity -->|CRITICAL| ImmediateNotif[Send Immediate<br>Notification:<br>- Push<br>- Email<br>- SMS]

    GetSeverity -->|HIGH| UrgentNotif[Send Urgent<br>Notification:<br>- Push<br>- Email]

    GetSeverity -->|MEDIUM| StandardNotif[Send Standard<br>Notification:<br>- Push]

    GetSeverity -->|LOW| DeferNotif[Defer to<br>Daily Summary]

    ImmediateNotif --> GetUsers
    UrgentNotif --> GetUsers
    StandardNotif --> GetUsers
    DeferNotif --> End([End])

    GetUsers[(Get Recipients:<br>- Location Managers<br>- Department Heads<br>- Inventory Staff)]

    GetUsers --> CheckPrefs{Check User<br>Preferences}

    CheckPrefs --> FilterRecipients[Filter Recipients<br>by Preferences]

    FilterRecipients --> SendBatch[Send Notifications<br>in Batch]

    SendBatch --> LogSent[(Log Notifications<br>Sent)]

    LogSent --> TrackDelivery[Track Delivery<br>Status]

    TrackDelivery --> CheckFailed{Delivery<br>Failed?}

    CheckFailed -->|Yes| Retry[Retry After<br>5 Minutes]
    CheckFailed -->|No| Success

    Retry --> CheckRetries{Retry Count<br>< 3?}

    CheckRetries -->|Yes| SendBatch
    CheckRetries -->|No| LogFailure[Log Delivery<br>Failure]

    LogFailure --> Success[Notification<br>Process Complete]

    Success --> End

    style Start fill:#e1f5ff
    style GetSeverity fill:#fff4e1
    style CheckPrefs fill:#fff4e1
    style CheckFailed fill:#fff4e1
    style CheckRetries fill:#fff4e1
    style GetUsers fill:#f3e5f5
    style LogSent fill:#f3e5f5
    style Success fill:#e0f2f1
```

---

## 8. Error Handling Workflows

### 8.1 Conversion Failure Recovery

```mermaid
flowchart TD
    Start([Conversion<br>Operation Starts]) --> BeginTx[Begin<br>Transaction]

    BeginTx --> ValidateInput{Input<br>Valid?}

    ValidateInput -->|No| RollbackTx1[Rollback<br>Transaction]
    RollbackTx1 --> LogError1[Log Error:<br>VALIDATION_FAILED]
    LogError1 --> ReturnError1[Return Error<br>to User]
    ReturnError1 --> End([End])

    ValidateInput -->|Yes| CheckStock{Stock<br>Available?}

    CheckStock -->|No| RollbackTx2[Rollback<br>Transaction]
    RollbackTx2 --> LogError2[Log Error:<br>INSUFFICIENT_STOCK]
    LogError2 --> ReturnError2[Return Error<br>to User]
    ReturnError2 --> End

    CheckStock -->|Yes| ProcessConv[Process<br>Conversion]

    ProcessConv --> CheckDbError{Database<br>Error?}

    CheckDbError -->|Yes| RollbackTx3[Rollback<br>Transaction]
    RollbackTx3 --> LogError3[Log Error:<br>DATABASE_ERROR]
    LogError3 --> CheckRetryable{Error<br>Retryable?}

    CheckRetryable -->|Yes| Retry{Retry Count<br>< 3?}
    Retry -->|Yes| WaitRetry[Wait 1 Second]
    WaitRetry --> ProcessConv
    Retry -->|No| ReturnError3[Return Error:<br>Max Retries Exceeded]
    ReturnError3 --> End

    CheckRetryable -->|No| ReturnError4[Return Error<br>to User]
    ReturnError4 --> End

    CheckDbError -->|No| CommitTx[Commit<br>Transaction]

    CommitTx --> CheckCommit{Commit<br>Successful?}

    CheckCommit -->|No| LogError4[Log Error:<br>COMMIT_FAILED]
    LogError4 --> ReturnError5[Return Error<br>to User]
    ReturnError5 --> End

    CheckCommit -->|Yes| Success[Return Success<br>to User]

    Success --> End

    style Start fill:#e1f5ff
    style ValidateInput fill:#fff4e1
    style CheckStock fill:#fff4e1
    style CheckDbError fill:#fff4e1
    style CheckRetryable fill:#fff4e1
    style CheckCommit fill:#fff4e1
    style CommitTx fill:#e8f5e9
    style Success fill:#e0f2f1
    style RollbackTx1 fill:#ffebee
    style RollbackTx2 fill:#ffebee
    style RollbackTx3 fill:#ffebee
    style LogError1 fill:#ffebee
    style LogError2 fill:#ffebee
    style LogError3 fill:#ffebee
    style LogError4 fill:#ffebee
```

---

## 9. Performance Optimization Workflows

### 9.1 Query Optimization Flow

```mermaid
flowchart TD
    Start([User Request:<br>Load Stock List]) --> CheckCache{Data in<br>Redis Cache?}

    CheckCache -->|Yes| ValidateCache{Cache Valid?<br>< 5 minutes old}

    ValidateCache -->|Yes| ReturnCache[Return Cached<br>Data]
    ReturnCache --> End([End])

    ValidateCache -->|No| InvalidateCache[Invalidate<br>Cache Entry]
    InvalidateCache --> QueryDB

    CheckCache -->|No| QueryDB[(Query Database:<br>Use Optimized<br>Indexes)]

    QueryDB --> UseIndexes[Apply Indexes:<br>- location_id<br>- current_state<br>- quality_grade]

    UseIndexes --> LimitResults[Limit Results:<br>Pagination<br>50 per page]

    LimitResults --> JoinRelated[Join Related:<br>- Item Config<br>- Alert Count<br>Only needed fields]

    JoinRelated --> FetchData[Fetch Data<br>from Database]

    FetchData --> CacheResult[Cache Result<br>in Redis<br>TTL: 5 minutes]

    CacheResult --> ReturnData[Return Data<br>to User]

    ReturnData --> LogMetrics[Log Performance:<br>- Query Time<br>- Cache Hit Rate<br>- Row Count]

    LogMetrics --> CheckSlow{Query Time<br>> 1 second?}

    CheckSlow -->|Yes| LogAlert[Create Alert:<br>SLOW_QUERY]
    CheckSlow -->|No| End

    LogAlert --> End

    style Start fill:#e1f5ff
    style CheckCache fill:#fff4e1
    style ValidateCache fill:#fff4e1
    style CheckSlow fill:#fff4e1
    style QueryDB fill:#f3e5f5
    style CacheResult fill:#e8f5e9
    style ReturnData fill:#e0f2f1
```

---

## 10. Summary

### 10.1 Key Workflow Characteristics

**User-Facing Workflows**:
- Average 7-12 steps from initiation to completion
- 2-4 decision points per workflow
- Real-time validation at critical steps
- Clear error messaging and recovery paths

**System Workflows**:
- Run on scheduled intervals (15-30 minutes)
- Batch processing for efficiency
- Automatic alerting on anomalies
- Comprehensive audit logging

**Integration Workflows**:
- Bi-directional synchronization
- Transaction-safe operations
- Fallback mechanisms for failures
- Performance-optimized queries

### 10.2 Performance Targets

| Workflow Type | Target Response Time | Success Rate |
|---------------|---------------------|--------------|
| User Operations | < 2 seconds | ≥ 99% |
| Search/Filter | < 1 second | ≥ 99.5% |
| Scheduled Jobs | < 5 minutes | ≥ 99.9% |
| Integrations | < 3 seconds | ≥ 99.5% |

### 10.3 Error Handling Standards

- All workflows implement transaction management
- Maximum 3 retry attempts for transient errors
- Comprehensive error logging with context
- User-friendly error messages
- Automatic rollback on failures

---

**End of Flow Diagrams Document**
