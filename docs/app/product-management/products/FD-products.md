# Flow Diagrams: Products

**Module**: Product Management
**Sub-Module**: Products
**Route**: `/product-management/products`
**Document Version**: 1.2
**Last Updated**: 2025-12-17

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2.0 | 2025-12-17 | Documentation Team | Added tag management workflows for location assignment |
| 1.1.0 | 2025-11-26 | Documentation Team | Added route reference, aligned with BR-products.md |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

This document provides visual representations of the key workflows and processes within the Products module using Mermaid diagrams. Each flow diagram illustrates the step-by-step progression of user interactions, system processing, validations, and data flows.

**Diagram Types**:
- User workflow diagrams (product CRUD operations)
- Data flow diagrams (data relationships and dependencies)
- State transition diagrams (product lifecycle)
- System interaction diagrams (integration points)

---

## 2. Product Creation Flow

### 2.1 Create New Product Workflow

```mermaid
flowchart TD
    Start([User clicks Create Product]) --> Form[Display Product Creation Form]
    Form --> FillBasic[User fills Basic Information<br>- Product Code<br>- Product Name<br>- Description<br>- Category/Subcategory/Item Group]
    FillBasic --> FillUnits[User selects Units<br>- Primary Inventory Unit<br>- Default Order Unit<br>- Default Stock Unit<br>- Tax Type]
    FillUnits --> Optional[User fills Optional Fields<br>- Brand, Manufacturer<br>- Barcode, SKU<br>- Cost, Price<br>- Deviation Limits]
    Optional --> Submit[User clicks Save]

    Submit --> ValidateReq{Validate<br>Required Fields}
    ValidateReq -->|Missing Fields| ErrReq[Show Validation Errors<br>Highlight missing fields]
    ErrReq --> Form

    ValidateReq -->|All Present| ValidateCode{Check Product Code<br>Uniqueness}
    ValidateCode -->|Duplicate| ErrCode[Show Error:<br>Product code already exists]
    ErrCode --> Form

    ValidateCode -->|Unique| ValidateUnits{Validate<br>Unit Configuration}
    ValidateUnits -->|Invalid| ErrUnits[Show Error:<br>Invalid unit configuration]
    ErrUnits --> Form

    ValidateUnits -->|Valid| CreateTx[Begin Database Transaction]
    CreateTx --> InsertProduct[Insert into products table<br>status = DRAFT or ACTIVE]
    InsertProduct --> InsertUnit[Insert base inventory unit<br>into product_units<br>type = INVENTORY, factor = 1]
    InsertUnit --> InsertOrderUnit[Insert default order unit<br>into product_units<br>type = ORDER]
    InsertOrderUnit --> CreateLog[Create Activity Log Entry<br>action = CREATED]
    CreateLog --> CommitTx[Commit Transaction]

    CommitTx --> Success[Show Success Message<br>Product Code: XXX-XXX]
    Success --> Redirect[Redirect to Product Detail Page]
    Redirect --> End([End])

    CreateTx -->|Error| Rollback[Rollback Transaction]
    Rollback --> ErrSystem[Show System Error Message]
    ErrSystem --> Form
```

### 2.2 Product Creation Data Flow

```mermaid
flowchart LR
    User[User Input] --> Form[Product Form]
    Form --> Validate[Validation Layer]
    Validate --> Transform[Data Transformation]
    Transform --> DB[(Database)]

    DB --> Products[(products)]
    DB --> ProductUnits[(product_units)]
    DB --> ActivityLog[(product_activity_log)]

    Categories[(categories)] --> Validate
    Units[(units)] --> Validate
    Users[(users)] --> ActivityLog
```

---

## 3. Product Update Flow

### 3.1 Edit Product Workflow

```mermaid
flowchart TD
    Start([User clicks Edit on Product Detail]) --> LoadCurrent[Load Current Product Data]
    LoadCurrent --> EnableEdit[Enable Inline Editing Mode<br>Convert display fields to inputs]
    EnableEdit --> ModifyFields[User modifies fields]
    ModifyFields --> UserAction{User Action}

    UserAction -->|Clicks Cancel| ConfirmCancel{Unsaved Changes?}
    ConfirmCancel -->|No Changes| DisableEdit[Disable Edit Mode<br>Restore Display Mode]
    ConfirmCancel -->|Has Changes| ShowConfirm[Show Confirmation Dialog:<br>Discard unsaved changes?]
    ShowConfirm -->|Cancel| ModifyFields
    ShowConfirm -->|Discard| DisableEdit

    UserAction -->|Clicks Save| ValidateChanges{Validate<br>Modified Fields}
    ValidateChanges -->|Invalid| ShowErrors[Show Validation Errors<br>Inline with fields]
    ShowErrors --> ModifyFields

    ValidateChanges -->|Valid| DetectChanges{Detect<br>Changed Fields}
    DetectChanges -->|No Changes| InfoMsg[Show Info Message:<br>No changes to save]
    InfoMsg --> DisableEdit

    DetectChanges -->|Has Changes| BeginTx[Begin Database Transaction]
    BeginTx --> UpdateProduct[Update modified fields<br>in products table]
    UpdateProduct --> UpdateTimestamp[Set updated_at = NOW()<br>updated_by = current_user]
    UpdateTimestamp --> LogChanges[Create Activity Log Entries<br>For each changed field]
    LogChanges --> CommitTx[Commit Transaction]

    CommitTx --> SuccessMsg[Show Success Message<br>Updated fields: X, Y, Z]
    SuccessMsg --> RefreshDisplay[Refresh Display Mode<br>Show updated values]
    RefreshDisplay --> DisableEdit
    DisableEdit --> End([End])

    BeginTx -->|Error| RollbackTx[Rollback Transaction]
    RollbackTx --> SystemErr[Show System Error]
    SystemErr --> ModifyFields
```

---

## 4. Product Unit Management Flow

### 4.1 Add Unit Conversion Workflow

```mermaid
flowchart TD
    Start([User clicks Add Unit<br>on Order/Recipe/Count Units tab]) --> ShowModal[Display Add Unit Modal]
    ShowModal --> SelectUnit[User selects Unit from dropdown]
    SelectUnit --> EnterFactor[User enters Conversion Factor]
    EnterFactor --> EnterDesc[User enters Description<br>Optional]
    EnterDesc --> SetDefault[User sets Default flag<br>Optional]
    SetDefault --> ClickSave[User clicks Save]

    ClickSave --> ValidateUnit{Validate<br>Unit Selection}
    ValidateUnit -->|Not Selected| ErrUnit[Show Error:<br>Please select a unit]
    ErrUnit --> ShowModal

    ValidateUnit -->|Selected| ValidateFactor{Validate<br>Conversion Factor}
    ValidateFactor -->|Invalid| ErrFactor[Show Error:<br>Factor must be positive<br>and up to 5 decimals]
    ErrFactor --> ShowModal

    ValidateFactor -->|Valid| CheckDuplicate{Check<br>Unit Already Exists<br>for this type?}
    CheckDuplicate -->|Exists| ErrDup[Show Error:<br>Unit already assigned<br>for this type]
    ErrDup --> ShowModal

    CheckDuplicate -->|New| CheckDefault{Is Default<br>flag set?}
    CheckDefault -->|Yes| UnsetOthers[Unset default flag<br>on other units of same type]
    CheckDefault -->|No| BeginTx[Begin Database Transaction]
    UnsetOthers --> BeginTx

    BeginTx --> InsertUnit[Insert into product_units<br>product_id, unit_id, unit_type<br>conversion_factor, is_default]
    InsertUnit --> LogActivity[Create Activity Log Entry<br>action = UNIT_ADDED]
    LogActivity --> CommitTx[Commit Transaction]

    CommitTx --> Success[Show Success Message]
    Success --> CloseModal[Close Modal]
    CloseModal --> RefreshList[Refresh Unit List<br>Display new unit]
    RefreshList --> End([End])

    BeginTx -->|Error| Rollback[Rollback Transaction]
    Rollback --> ErrSys[Show System Error]
    ErrSys --> ShowModal
```

### 4.2 Unit Conversion Calculator Flow

```mermaid
flowchart TD
    Start([User views Product Detail]) --> LoadUnits[Load all product units<br>INVENTORY, ORDER, RECIPE, COUNT]
    LoadUnits --> DisplayCalc[Display Unit Conversion Calculator Widget]
    DisplayCalc --> UserSelects[User selects FROM unit<br>and enters quantity]
    UserSelects --> AutoConvert[System calculates conversions<br>to all other units]

    AutoConvert --> CalcFormula[Formula:<br>converted_qty = input_qty<br>× from_factor<br>÷ to_factor]
    CalcFormula --> DisplayResults[Display results<br>with unit labels]
    DisplayResults --> UserChange{User changes<br>input?}
    UserChange -->|Yes| UserSelects
    UserChange -->|No| End([End])
```

---

## 5. Product Location Assignment Flow

### 5.1 Assign Product to Location Workflow

```mermaid
flowchart TD
    Start([User clicks Add Location<br>on Location Assignment tab]) --> ShowForm[Display Location Assignment Form]
    ShowForm --> SelectLoc[User selects Location]
    SelectLoc --> SelectTags[User selects Tags<br>from location-grouped list]
    SelectTags --> EnterMin[User enters Min Stock Level]
    EnterMin --> EnterMax[User enters Max Stock Level]
    EnterMax --> EnterReorder[User enters Reorder Point<br>Optional]
    EnterReorder --> ClickSave[User clicks Add]

    ClickSave --> ValidateLoc{Validate<br>Location Selected}
    ValidateLoc -->|Not Selected| ErrLoc[Show Error:<br>Please select location]
    ErrLoc --> ShowForm

    ValidateLoc -->|Selected| ValidateLevels{Validate<br>Stock Levels}
    ValidateLevels -->|Invalid| ErrLevels[Show Error:<br>Max must be >= Min<br>Both must be >= 0]
    ErrLevels --> ShowForm

    ValidateLevels -->|Valid| CheckDup{Check<br>Location Already<br>Assigned?}
    CheckDup -->|Exists| ErrDup[Show Error:<br>Product already assigned<br>to this location]
    ErrDup --> ShowForm

    CheckDup -->|New| BeginTx[Begin Database Transaction]
    BeginTx --> InsertAssign[Insert into product_locations<br>product_id, location_id<br>min, max, reorder_point, tags]
    InsertAssign --> LogActivity[Create Activity Log Entry<br>action = LOCATION_ASSIGNED]
    LogActivity --> CommitTx[Commit Transaction]

    CommitTx --> Success[Show Success Message]
    Success --> RefreshTable[Refresh Location<br>Assignment Table]
    RefreshTable --> End([End])

    BeginTx -->|Error| Rollback[Rollback Transaction]
    Rollback --> ErrSys[Show System Error]
    ErrSys --> ShowForm
```

### 5.2 Location Tag Management Workflow

```mermaid
flowchart TD
    Start([User clicks Manage Tags<br>in Assigned Locations header]) --> ShowDialog[Display Tag Management Dialog]

    ShowDialog --> UserAction{User Action}

    UserAction -->|Create New Tag| FillForm[User fills tag form:<br>- Tag Name<br>- Color Selection<br>- Location Assignment]
    FillForm --> ValidateName{Tag Name<br>Valid?}
    ValidateName -->|Empty| ErrName[Show Error:<br>Tag name required]
    ErrName --> FillForm
    ValidateName -->|Valid| ValidateLoc{Location<br>Selected?}
    ValidateLoc -->|No| ErrLoc[Show Error:<br>Select a location]
    ErrLoc --> FillForm
    ValidateLoc -->|Yes| CreateTag[Create new tag<br>with unique ID]
    CreateTag --> RefreshTags[Refresh tag list<br>grouped by location]
    RefreshTags --> ShowDialog

    UserAction -->|Delete Existing Tag| ConfirmDelete{Confirm<br>Delete?}
    ConfirmDelete -->|Cancel| ShowDialog
    ConfirmDelete -->|Confirm| RemoveTag[Remove tag from<br>available tags pool]
    RemoveTag --> RemoveFromAssignments[Remove tag from<br>all assignments using it]
    RemoveFromAssignments --> RefreshTags

    UserAction -->|Close Dialog| End([End])
```

### 5.3 Add/Remove Tags on Assignment Workflow

```mermaid
flowchart TD
    Start([User views Location Assignment<br>in Edit Mode]) --> DisplayTags[Display assigned tags<br>as colored badges]

    DisplayTags --> UserAction{User Action}

    UserAction -->|Click Add Tag button| ShowPopover[Show tag selection popover<br>filtered by location]
    ShowPopover --> SearchFilter[User can search tags]
    SearchFilter --> SelectTag[User clicks tag to add]
    SelectTag --> AddToAssignment[Add tag to assignment]
    AddToAssignment --> UpdateDisplay[Update tags display]
    UpdateDisplay --> DisplayTags

    UserAction -->|Click X on tag badge| RemoveTag[Remove tag from assignment]
    RemoveTag --> UpdateDisplay

    UserAction -->|Click X in popover| DeleteFromPool[Delete tag from<br>available tags pool]
    DeleteFromPool --> RefreshPopover[Refresh popover list]
    RefreshPopover --> ShowPopover

    UserAction -->|Done editing| End([End])
```

---

## 6. Product Search and Filter Flow

### 6.1 Product List Search Workflow

```mermaid
flowchart TD
    Start([User opens Product List Page]) --> LoadInitial[Load initial product list<br>Default: Active products<br>Sort: Product Code ASC<br>Page 1, 10 per page]
    LoadInitial --> DisplayList[Display Product List<br>with Search and Filter UI]
    DisplayList --> UserAction{User Action}

    UserAction -->|Types in Search| DebounceWait[Wait 300ms debounce]
    DebounceWait --> Search[Search across:<br>- Product Code<br>- Product Name<br>- Barcode<br>- Description]
    Search --> ApplyFilters[Apply active filters]
    ApplyFilters --> QueryDB[Query database<br>with WHERE clauses]
    QueryDB --> DisplayResults[Update product list<br>Highlight search terms]
    DisplayResults --> UserAction

    UserAction -->|Opens Filter Panel| ShowFilters[Display Advanced Filters:<br>- Category multi-select<br>- Subcategory multi-select<br>- Item Group multi-select<br>- Status multi-select<br>- Is For Sale toggle<br>- Is Ingredient toggle<br>- Price range<br>- Cost range]
    ShowFilters --> SelectFilters[User selects filters]
    SelectFilters --> ApplyBtn[User clicks Apply Filters]
    ApplyBtn --> ApplyFilters

    UserAction -->|Clicks Column Header| ToggleSort[Toggle sort direction<br>ASC ↔ DESC]
    ToggleSort --> QueryDB

    UserAction -->|Changes Page Size| UpdatePageSize[Update per_page setting]
    UpdatePageSize --> QueryDB

    UserAction -->|Clicks Pagination| LoadPage[Load requested page]
    LoadPage --> QueryDB

    UserAction -->|Clicks Clear Filters| ResetFilters[Reset all filters<br>to default values]
    ResetFilters --> QueryDB

    UserAction -->|Clicks Product Row| Navigate[Navigate to<br>Product Detail Page]
    Navigate --> End([End])

    UserAction -->|Closes Page| End
```

### 6.2 Product List Data Flow

```mermaid
flowchart LR
    subgraph Client
        UI[Product List UI]
        SearchInput[Search Input]
        FilterPanel[Filter Panel]
        SortControls[Sort Controls]
        Pagination[Pagination]
    end

    subgraph State
        Filters[Active Filters]
        Sort[Sort Config]
        PageInfo[Page Info]
        SearchTerm[Search Term]
    end

    subgraph Server
        API[Products API]
        Query[Query Builder]
        DB[(Database)]
    end

    SearchInput --> SearchTerm
    FilterPanel --> Filters
    SortControls --> Sort
    Pagination --> PageInfo

    SearchTerm --> Query
    Filters --> Query
    Sort --> Query
    PageInfo --> Query

    Query --> DB
    DB --> API
    API --> UI
```

---

## 7. Product Status Lifecycle Flow

### 7.1 Product Status State Diagram

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Create Product

    DRAFT --> ACTIVE: Activate<br>(All required fields complete)
    DRAFT --> [*]: Delete<br>(No transactions)

    ACTIVE --> INACTIVE: Deactivate<br>(Temporary suspension)
    ACTIVE --> DISCONTINUED: Discontinue<br>(Permanent removal)

    INACTIVE --> ACTIVE: Reactivate
    INACTIVE --> DISCONTINUED: Discontinue

    DISCONTINUED --> ACTIVE: Reactivate<br>(Rare, requires approval)

    note right of DRAFT
        - Being configured
        - Not available for transactions
        - Can be deleted
    end note

    note right of ACTIVE
        - Available for all transactions
        - Cannot be deleted
        - Default status for new products
    end note

    note right of INACTIVE
        - Temporarily unavailable
        - Transactions blocked
        - Can be reactivated
        - Appears in reports with filter
    end note

    note right of DISCONTINUED
        - Permanently discontinued
        - Transactions blocked
        - Visible in historical data only
        - Reactivation requires approval
    end note
```

### 7.2 Status Change Workflow

```mermaid
flowchart TD
    Start([User clicks Change Status button]) --> CurrentStatus{Current<br>Status}

    CurrentStatus -->|DRAFT| DraftOptions[Show options:<br>- Activate<br>- Delete]
    CurrentStatus -->|ACTIVE| ActiveOptions[Show options:<br>- Deactivate<br>- Discontinue]
    CurrentStatus -->|INACTIVE| InactiveOptions[Show options:<br>- Activate<br>- Discontinue]
    CurrentStatus -->|DISCONTINUED| DiscOptions[Show options:<br>- Reactivate with approval]

    DraftOptions --> SelectAction[User selects action]
    ActiveOptions --> SelectAction
    InactiveOptions --> SelectAction
    DiscOptions --> SelectAction

    SelectAction --> ActionType{Action Type}

    ActionType -->|Activate| ValidateComplete{All required<br>fields complete?}
    ValidateComplete -->|No| ErrIncomplete[Show Error:<br>Complete required fields first]
    ErrIncomplete --> End([End])

    ValidateComplete -->|Yes| ConfirmActivate[Show Confirmation:<br>Activate product?]
    ConfirmActivate -->|Cancel| End
    ConfirmActivate -->|Confirm| UpdateStatus[Update status to ACTIVE]
    UpdateStatus --> LogChange[Log status change<br>action = STATUS_CHANGED<br>old = DRAFT, new = ACTIVE]
    LogChange --> ShowSuccess[Show success message]
    ShowSuccess --> RefreshPage[Refresh product detail]
    RefreshPage --> End

    ActionType -->|Deactivate| ConfirmDeactivate[Show Confirmation:<br>Deactivate product?<br>Transactions will be blocked]
    ConfirmDeactivate -->|Cancel| End
    ConfirmDeactivate -->|Confirm| UpdateInactive[Update status to INACTIVE]
    UpdateInactive --> LogChange

    ActionType -->|Discontinue| ConfirmDisc[Show Confirmation:<br>Discontinue product?<br>This is permanent]
    ConfirmDisc -->|Cancel| End
    ConfirmDisc -->|Confirm| UpdateDisc[Update status to DISCONTINUED]
    UpdateDisc --> LogChange

    ActionType -->|Delete| CheckTransactions{Has<br>transactions?}
    CheckTransactions -->|Yes| ErrCannotDelete[Show Error:<br>Cannot delete product<br>with transactions.<br>Use Inactive/Discontinued instead]
    ErrCannotDelete --> End

    CheckTransactions -->|No| ConfirmDelete[Show Confirmation:<br>Permanently delete product?<br>This cannot be undone]
    ConfirmDelete -->|Cancel| End
    ConfirmDelete -->|Confirm| SoftDelete[Set deleted_at = NOW()<br>deleted_by = current_user]
    SoftDelete --> LogDelete[Log deletion<br>action = DELETED]
    LogDelete --> Redirect[Redirect to product list]
    Redirect --> End
```

---

## 8. Product Detail View Flow

### 8.1 Product Detail Page Navigation

```mermaid
flowchart TD
    Start([User navigates to<br>Product Detail Page]) --> LoadProduct[Load product by ID]
    LoadProduct --> CheckExists{Product<br>exists?}
    CheckExists -->|No| Show404[Show 404 Error Page]
    Show404 --> End([End])

    CheckExists -->|Yes| CheckDeleted{Product<br>deleted?}
    CheckDeleted -->|Yes| ShowDeleted[Show Warning:<br>Product has been deleted]
    ShowDeleted --> End

    CheckDeleted -->|No| LoadRelated[Load Related Data:<br>- Product Units<br>- Location Assignments<br>- Activity Log<br>- Latest Purchase Orders<br>- Latest GRNs]
    LoadRelated --> DisplayPage[Display Product Detail Page<br>Default tab: General]
    DisplayPage --> UserNav{User<br>Navigation}

    UserNav -->|Clicks General Tab| ShowGeneral[Show General Info:<br>- Basic fields<br>- Product image<br>- Category hierarchy<br>- Status]
    ShowGeneral --> UserNav

    UserNav -->|Clicks Inventory Tab| ShowInventory[Show Inventory Settings:<br>- Cost information<br>- Price and tax<br>- Deviation limits<br>- Stock flags]
    ShowInventory --> UserNav

    UserNav -->|Clicks Order Units Tab| ShowOrder[Show Order Units Table:<br>- Unit, Factor, Default<br>- Add/Edit/Delete actions<br>- Order rules]
    ShowOrder --> UserNav

    UserNav -->|Clicks Ingredient Units Tab| ShowIngredient[Show Recipe Units Table:<br>- Unit, Factor, Default<br>- Add/Edit/Delete actions<br>- Recipe calculator]
    ShowIngredient --> UserNav

    UserNav -->|Clicks Locations Tab| ShowLocations[Show Location Assignments:<br>- Location, Min/Max<br>- Reorder point/qty<br>- Add/Edit/Delete actions]
    ShowLocations --> UserNav

    UserNav -->|Clicks Edit Button| EnableEdit[Enable Inline Edit Mode]
    EnableEdit --> EditFlow[See Edit Product Workflow]
    EditFlow --> UserNav

    UserNav -->|Clicks Delete| DeleteFlow[See Product Deletion Workflow]
    DeleteFlow --> End

    UserNav -->|Clicks Back| BackToList[Return to Product List]
    BackToList --> End
```

---

## 9. Product Import Flow

### 9.1 Bulk Product Import Workflow

```mermaid
flowchart TD
    Start([User clicks Import Products]) --> ShowModal[Display Import Modal]
    ShowModal --> DownloadTemplate[User optionally downloads<br>Excel template]
    DownloadTemplate --> SelectFile[User selects Excel/CSV file]
    SelectFile --> Upload[User clicks Upload]

    Upload --> ValidateFile{Validate<br>File Format}
    ValidateFile -->|Invalid Format| ErrFormat[Show Error:<br>Invalid file format<br>Accepted: .xlsx, .csv]
    ErrFormat --> ShowModal

    ValidateFile -->|Valid| ParseFile[Parse file contents<br>Extract rows]
    ParseFile --> ValidateRows[Validate each row:<br>- Required fields present<br>- Data types correct<br>- Product codes unique<br>- Categories/units exist]
    ValidateRows --> ShowPreview[Display Import Preview:<br>- Total rows<br>- Valid rows<br>- Error rows with details]

    ShowPreview --> HasErrors{Has<br>validation<br>errors?}
    HasErrors -->|Yes| ShowErrors[Highlight error rows<br>Allow download error report]
    ShowErrors --> UserDecision{User<br>Action}
    UserDecision -->|Fix and Re-upload| SelectFile
    UserDecision -->|Cancel| Cancel[Cancel import]
    Cancel --> End([End])

    HasErrors -->|No or Proceed| UserConfirm{User confirms<br>import?}
    UserConfirm -->|Cancel| Cancel
    UserConfirm -->|Confirm| BeginImport[Begin Import Process]

    BeginImport --> ProcessRows[Process each valid row:<br>1. Create product record<br>2. Create base unit<br>3. Create order units<br>4. Create activity log]
    ProcessRows --> Transaction{Each row in<br>transaction}
    Transaction -->|Success| NextRow{More rows?}
    Transaction -->|Error| LogError[Log import error<br>Continue with next]
    LogError --> NextRow

    NextRow -->|Yes| ProcessRows
    NextRow -->|No| GenerateReport[Generate Import Summary:<br>- Total attempted<br>- Successfully created<br>- Failed with reasons]
    GenerateReport --> DisplaySummary[Display summary report<br>Download option]
    DisplaySummary --> RefreshList[Refresh product list]
    RefreshList --> End
```

---

## 10. Integration Flow Diagrams

### 10.1 Product-Procurement Integration

```mermaid
flowchart LR
    subgraph Products Module
        PM[Product Master]
        PU[Product Units]
        PC[Product Cost]
    end

    subgraph Procurement Module
        PR[Purchase Request]
        PO[Purchase Order]
        GRN[Goods Received Note]
    end

    PM -->|Product Selection| PR
    PM -->|Product Selection| PO
    PU -->|Order Units| PR
    PU -->|Order Units| PO
    PC -->|Standard Cost| PR
    PC -->|Last Cost| PO

    GRN -->|Update Last Cost| PC
    GRN -->|Calculate Average Cost| PC

    PO -->|Order Quantity| Validation{Deviation Check}
    GRN -->|Received Quantity| Validation
    Validation -->|Exceeds Limit| Alert[Generate Warning]
    Validation -->|Within Limit| Proceed[Proceed]
```

### 10.2 Product-Inventory Integration

```mermaid
flowchart LR
    subgraph Products Module
        PM[Product Master]
        PU[Product Units]
        PL[Product Locations]
    end

    subgraph Inventory Module
        Stock[Stock Movement]
        Count[Physical Count]
        Adj[Adjustment]
        Trans[Transfer]
    end

    PM -->|Base Inventory Unit| Stock
    PM -->|Base Inventory Unit| Count
    PM -->|Base Inventory Unit| Adj
    PM -->|Base Inventory Unit| Trans

    PU -->|Count Units| Count
    PU -->|Auto Conversion| Stock

    PL -->|Min/Max Levels| Stock
    Stock -->|Check Levels| Alert{Below Min<br>or Above Max?}
    Alert -->|Yes| Notification[Generate Alert]
    Alert -->|No| NoAction[No Action]
```

### 10.3 Product-Recipe Integration

```mermaid
flowchart LR
    subgraph Products Module
        PM[Product Master<br>is_ingredient = true]
        PU[Product Units<br>RECIPE type]
    end

    subgraph Recipe Module
        Recipe[Recipe Master]
        Ingredient[Recipe Ingredients]
        Cost[Recipe Costing]
    end

    PM -->|Available Products| Ingredient
    PU -->|Recipe Units| Ingredient
    PU -->|Conversion Factors| Cost

    Ingredient -->|Ingredient Cost| Cost
    Cost -->|Total Recipe Cost| Recipe
```

---

## 11. Error Handling Flows

### 11.1 Validation Error Handling

```mermaid
flowchart TD
    UserAction[User submits form] --> ClientValidation[Client-side validation<br>using Zod schema]
    ClientValidation --> ClientValid{Valid?}
    ClientValid -->|No| DisplayErrors[Display inline errors<br>Highlight invalid fields]
    DisplayErrors --> WaitCorrection[Wait for user correction]
    WaitCorrection --> UserAction

    ClientValid -->|Yes| SendRequest[Send HTTP request<br>to server]
    SendRequest --> ServerValidation[Server-side validation]
    ServerValidation --> ServerValid{Valid?}
    ServerValid -->|No| ReturnErrors[Return validation errors<br>with field details]
    ReturnErrors --> DisplayServerErrors[Display server errors<br>with context]
    DisplayServerErrors --> WaitCorrection

    ServerValid -->|Yes| ProcessRequest[Process request]
    ProcessRequest --> Success[Return success response]
    Success --> ShowSuccess[Display success message]
    ShowSuccess --> End([End])
```

### 11.2 Database Error Handling

```mermaid
flowchart TD
    Start[Begin database operation] --> StartTx[Start transaction]
    StartTx --> Execute[Execute SQL statements]
    Execute --> CheckError{Error<br>occurred?}

    CheckError -->|No| Commit[Commit transaction]
    Commit --> Success[Return success]
    Success --> End([End])

    CheckError -->|Yes| ErrorType{Error Type}
    ErrorType -->|Unique Constraint| HandleUnique[Return user-friendly message:<br>Duplicate product code]
    ErrorType -->|Foreign Key| HandleFK[Return message:<br>Referenced entity not found]
    ErrorType -->|Check Constraint| HandleCheck[Return message:<br>Invalid data value]
    ErrorType -->|Other| HandleOther[Return generic message:<br>Database error occurred]

    HandleUnique --> Rollback[Rollback transaction]
    HandleFK --> Rollback
    HandleCheck --> Rollback
    HandleOther --> Rollback

    Rollback --> LogError[Log error details<br>to system log]
    LogError --> ReturnError[Return error to client]
    ReturnError --> End
```

---

## 12. Activity Log Flow

### 12.1 Activity Logging Workflow

```mermaid
flowchart TD
    Start[Product data change occurs] --> DetectChange[Detect changed fields<br>Compare old vs new values]
    DetectChange --> HasChanges{Changes<br>detected?}
    HasChanges -->|No| SkipLog[Skip activity log]
    SkipLog --> End([End])

    HasChanges -->|Yes| DetermineAction[Determine action type:<br>CREATED, UPDATED, DELETED<br>STATUS_CHANGED, etc.]
    DetermineAction --> CreateEntries[Create activity log entry<br>for each changed field]
    CreateEntries --> SetMetadata[Set metadata:<br>- product_id<br>- field_name<br>- old_value<br>- new_value<br>- created_by<br>- created_at]
    SetMetadata --> InsertLog[Insert into<br>product_activity_log table]
    InsertLog --> Success[Log entry created]
    Success --> End

    InsertLog -->|Error| LogToSystem[Log to system error log<br>Continue with main operation]
    LogToSystem --> End
```

---

## 13. Related Documents

- **Business Requirements**: [BR-products.md](./BR-products.md)
- **Use Cases**: [UC-products.md](./UC-products.md)
- **Data Definitions**: [DD-products.md](./DD-products.md)
- **Technical Specification**: [TS-products.md](./TS-products.md)
- **Validations**: [VAL-products.md](./VAL-products.md)

---

**Document Control**:
- **Created By**: System Documentation Team
- **Approved By**: [Pending]
- **Next Review Date**: [To be determined]
