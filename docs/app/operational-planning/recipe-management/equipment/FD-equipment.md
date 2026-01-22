# Recipe Equipment - Flow Diagrams (FD)

## Document Information
- **Document Type**: Flow Diagrams Document
- **Module**: Operational Planning > Recipe Management > Equipment
- **Version**: 1.0.0
- **Last Updated**: 2025-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Development Team | Initial documentation based on actual implementation |

---

## 1. Create Equipment Workflow

```mermaid
flowchart TD
    Start([User clicks Add Equipment]) --> OpenDialog[Open Create Dialog]
    OpenDialog --> InitForm[Initialize blank form with defaults]

    InitForm --> UserInput{User enters<br>equipment data}
    UserInput -->|typing| ClientVal[Client-side validation]
    ClientVal --> ShowFeedback[Show validation feedback]
    ShowFeedback --> UserInput

    UserInput -->|clicks Add Equipment| FinalVal[Validate all fields]
    FinalVal -->|Invalid| ShowError[Show validation errors]
    ShowError --> UserInput

    FinalVal -->|Valid| CallAction[Call createEquipment server action]
    CallAction --> ServerVal[Server-side validation]

    ServerVal -->|Invalid| ReturnError[Return error response]
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> UserInput

    ServerVal -->|Valid| CheckCode{Check code<br>uniqueness}
    CheckCode -->|Duplicate| DupCode[Return duplicate code error]
    DupCode --> DisplayError

    CheckCode -->|Unique| ValidateQty{Available qty<br>less than total?}
    ValidateQty -->|No| QtyError[Return quantity error]
    QtyError --> DisplayError

    ValidateQty -->|Yes| CreateRecord[INSERT equipment record]
    CreateRecord --> Success{Success?}

    Success -->|No| DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success toast]
    ShowSuccess --> RefreshList[Refresh equipment list]
    RefreshList --> HighlightNew[Highlight new equipment]
    HighlightNew --> End([End])

    style Start fill:#e1f5ff
    style CreateRecord fill:#fff4e1
    style End fill:#e8f5e9
    style DisplayError fill:#ffebee
```

---

## 2. Edit Equipment Workflow

```mermaid
flowchart TD
    Start([User clicks Edit]) --> FetchData[Fetch equipment data]
    FetchData --> OpenDialog[Open edit dialog]
    OpenDialog --> PreFill[Pre-fill form with current values]

    PreFill --> UserMod{User modifies<br>fields}
    UserMod -->|typing| ClientVal[Real-time validation]
    ClientVal --> ShowFeedback[Show feedback]
    ShowFeedback --> UserMod

    UserMod -->|clicks Save Changes| CheckChanges{Any changes<br>made?}
    CheckChanges -->|No| InfoMsg[Show no changes message]
    InfoMsg --> CloseNoSave[Close dialog]
    CloseNoSave --> End([End])

    CheckChanges -->|Yes| ValidateAll[Validate all fields]
    ValidateAll -->|Invalid| ShowError[Show validation errors]
    ShowError --> UserMod

    ValidateAll -->|Valid| CheckStatus{Status changed<br>to maintenance?}
    CheckStatus -->|Yes| UpdateAvail[Suggest reducing available qty]
    UpdateAvail --> UserMod

    CheckStatus -->|No| CallUpdate[Call updateEquipment action]
    CallUpdate --> ServerVal[Server validation]
    ServerVal -->|Invalid| ReturnError[Return error]
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> UserMod

    ServerVal -->|Valid| CheckCodeChange{Code changed?}
    CheckCodeChange -->|Yes| ValidateCode[Check code uniqueness]
    ValidateCode -->|Duplicate| ReturnError
    ValidateCode -->|Unique| UpdateDB[UPDATE equipment record]

    CheckCodeChange -->|No| UpdateDB
    UpdateDB --> Success{Success?}
    Success -->|No| DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success toast]
    ShowSuccess --> RefreshList[Refresh list]
    RefreshList --> HighlightUpdated[Highlight updated equipment]
    HighlightUpdated --> End

    style Start fill:#e1f5ff
    style UpdateDB fill:#fff4e1
    style End fill:#e8f5e9
    style DisplayError fill:#ffebee
```

---

## 3. Delete Equipment Workflow

```mermaid
flowchart TD
    Start([User clicks Delete]) --> CheckRecipes{Check recipe<br>references}

    CheckRecipes -->|Has active recipes| BlockDialog[Show blocking error dialog]
    BlockDialog --> ListRecipes[List affected recipes]
    ListRecipes --> ShowActions[Show View Recipes or Close buttons]
    ShowActions --> End([End - Deletion Blocked])

    CheckRecipes -->|No active recipes| ConfirmDialog[Show confirmation dialog]
    ConfirmDialog --> ShowWarning[Display equipment name]
    ShowWarning --> UserConfirm{User confirms?}

    UserConfirm -->|No| CancelDelete[Close dialog]
    CancelDelete --> End

    UserConfirm -->|Yes| CallDelete[Call deleteEquipment action]
    CallDelete --> ServerCheck[Server-side validation]

    ServerCheck -->|Has references| ReturnError[Return reference error]
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> End

    ServerCheck -->|Safe to delete| DeleteRecord[DELETE equipment record]
    DeleteRecord --> Success{Success?}

    Success -->|No| DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success message]
    ShowSuccess --> RefreshList[Refresh list]
    RefreshList --> RemoveEquipment[Remove deleted equipment]
    RemoveEquipment --> End

    style Start fill:#e1f5ff
    style BlockDialog fill:#ffebee
    style DeleteRecord fill:#fff4e1
    style End fill:#e8f5e9
```

---

## 4. Search and Filter Workflow

```mermaid
flowchart TD
    Start([User initiates search/filter]) --> InputType{Input type?}

    InputType -->|Search text| Debounce[Debounce 300ms]
    Debounce --> SearchFilter[Apply search filter]

    InputType -->|Category filter| CategoryFilter[Apply category filter]

    InputType -->|Status filter| StatusFilter[Apply status filter]

    SearchFilter --> FilterChain[Combine all active filters]
    CategoryFilter --> FilterChain
    StatusFilter --> FilterChain

    FilterChain --> ApplyToList[Filter equipment list]
    ApplyToList --> UpdateDisplay[Update displayed list]
    UpdateDisplay --> ShowCount[Show result count]
    ShowCount --> CheckEmpty{Any results?}

    CheckEmpty -->|No| ShowEmpty[Show no equipment found message]
    ShowEmpty --> SuggestClear[Suggest clearing filters]
    SuggestClear --> End([End])

    CheckEmpty -->|Yes| DisplayResults[Display filtered equipment]
    DisplayResults --> End

    style Start fill:#e1f5ff
    style ApplyToList fill:#fff4e1
    style DisplayResults fill:#e8f5e9
    style ShowEmpty fill:#f5f5f5
```

---

## 5. Equipment Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Active: Create new equipment

    Active --> Inactive: Deactivate equipment
    Inactive --> Active: Reactivate equipment

    Active --> Maintenance: Schedule maintenance
    Maintenance --> Active: Complete maintenance

    Active --> Retired: Permanently retire
    Inactive --> Retired: Dispose equipment
    Maintenance --> Retired: Cannot repair

    Active --> Active: Update properties
    Inactive --> Inactive: Update properties
    Maintenance --> Maintenance: Update properties

    note right of Active
        Operational
        Available for recipes
        Shown in dropdowns
    end note

    note right of Maintenance
        Under service
        Not available
        Track maintenance date
    end note

    note right of Inactive
        Not in use
        Not available
        Can reactivate
    end note

    note left of Retired
        Permanently out
        Cannot reactivate
        Historical record
    end note
```

---

## 6. Bulk Selection Workflow

```mermaid
flowchart TD
    Start([User interaction with checkboxes]) --> SelectType{Selection type?}

    SelectType -->|Individual checkbox| ToggleOne[Toggle single equipment selection]
    ToggleOne --> UpdateState[Update selected IDs state]

    SelectType -->|Header checkbox checked| CheckAll{All visible<br>already selected?}
    CheckAll -->|No| SelectAll[Select all visible equipment]
    SelectAll --> UpdateState
    CheckAll -->|Yes| DeselectAll[Deselect all equipment]
    DeselectAll --> UpdateState

    UpdateState --> UpdateUI[Update checkbox visual states]
    UpdateUI --> ShowCount[Update selection count]
    ShowCount --> CheckActions{Selection<br>count > 0?}

    CheckActions -->|Yes| EnableBulk[Enable bulk action buttons]
    EnableBulk --> End([End])

    CheckActions -->|No| DisableBulk[Disable bulk action buttons]
    DisableBulk --> End

    style Start fill:#e1f5ff
    style UpdateState fill:#fff4e1
    style End fill:#e8f5e9
```

---

## 7. Maintenance Log Workflow

```mermaid
flowchart TD
    Start([User clicks Maintenance Log]) --> FetchHistory[Fetch maintenance history]
    FetchHistory --> OpenDialog[Open maintenance log dialog]
    OpenDialog --> DisplayHistory[Display maintenance history table]

    DisplayHistory --> UserAction{User action?}

    UserAction -->|View only| CloseDialog[Close dialog]
    CloseDialog --> End([End])

    UserAction -->|Add entry| ShowAddForm[Show add maintenance form]
    ShowAddForm --> UserInput{User enters<br>maintenance data}

    UserInput -->|clicks Save| ValidateEntry[Validate maintenance entry]
    ValidateEntry -->|Invalid| ShowError[Show validation errors]
    ShowError --> UserInput

    ValidateEntry -->|Valid| CreateEntry[INSERT maintenance log entry]
    CreateEntry --> UpdateEquipment[UPDATE equipment dates]
    UpdateEquipment --> CalcNext[Calculate next maintenance date]
    CalcNext --> UpdateStatus{Change status<br>to active?}

    UpdateStatus -->|Yes| SetActive[SET status to active]
    SetActive --> RefreshHistory[Refresh history display]
    UpdateStatus -->|No| RefreshHistory

    RefreshHistory --> ShowSuccess[Show success message]
    ShowSuccess --> DisplayHistory

    style Start fill:#e1f5ff
    style CreateEntry fill:#fff4e1
    style End fill:#e8f5e9
    style ShowError fill:#ffebee
```

---

## 8. Export Equipment Workflow

```mermaid
flowchart TD
    Start([User clicks Export]) --> GatherData[Gather filtered equipment data]
    GatherData --> CheckCount{Any equipment<br>to export?}

    CheckCount -->|No| ShowWarning[Show nothing to export warning]
    ShowWarning --> End([End])

    CheckCount -->|Yes| PrepareExport[Prepare export data structure]
    PrepareExport --> FormatData[Format data for export]
    FormatData --> GenerateFile[Generate export file]
    GenerateFile --> TriggerDownload[Trigger browser download]
    TriggerDownload --> ShowSuccess[Show export success toast]
    ShowSuccess --> End

    style Start fill:#e1f5ff
    style GenerateFile fill:#fff4e1
    style End fill:#e8f5e9
    style ShowWarning fill:#fff9c4
```

---

## 9. Permission-Based Action Flow

```mermaid
flowchart TD
    Start([User attempts action]) --> CheckAuth{User<br>authenticated?}
    CheckAuth -->|No| DenyAuth[Show login required]
    DenyAuth --> End([End - Access Denied])

    CheckAuth -->|Yes| CheckPerm{Has required<br>permission?}

    CheckPerm -->|equipment.create<br>for create| AllowCreate[Allow create action]
    CheckPerm -->|equipment.update<br>for edit| AllowEdit[Allow edit action]
    CheckPerm -->|equipment.delete<br>for delete| AllowDelete[Allow delete action]
    CheckPerm -->|equipment.view<br>for view| AllowView[Allow view action]
    CheckPerm -->|equipment.export<br>for export| AllowExport[Allow export action]

    CheckPerm -->|No permission| DenyPerm[Show permission denied]
    DenyPerm --> End

    AllowCreate --> ExecuteAction[Execute action]
    AllowEdit --> ExecuteAction
    AllowDelete --> ExecuteAction
    AllowView --> ExecuteAction
    AllowExport --> ExecuteAction

    ExecuteAction --> LogAction[Log in audit trail]
    LogAction --> Success([End - Action Completed])

    style Start fill:#e1f5ff
    style DenyAuth fill:#ffebee
    style DenyPerm fill:#ffebee
    style ExecuteAction fill:#fff4e1
    style Success fill:#e8f5e9
```

---

## 10. Error Recovery Flow

```mermaid
flowchart TD
    Start([Error occurs]) --> ErrorType{Error type?}

    ErrorType -->|Validation error| ShowFieldError[Highlight field with error]
    ShowFieldError --> ShowMessage[Show inline error message]
    ShowMessage --> UserFix[User corrects input]
    UserFix --> RetryAction[Retry action]
    RetryAction --> Success([Success])

    ErrorType -->|Network error| DetectNetwork{Network<br>available?}
    DetectNetwork -->|No| ShowOffline[Show offline message]
    ShowOffline --> WaitNetwork[Wait for connection]
    WaitNetwork --> DetectNetwork
    DetectNetwork -->|Yes| RetryRequest[Retry request]
    RetryRequest --> RequestSuccess{Success?}
    RequestSuccess -->|Yes| Success
    RequestSuccess -->|No| ShowRetryButton[Show retry button]
    ShowRetryButton --> UserRetry{User clicks<br>retry?}
    UserRetry -->|Yes| RetryRequest
    UserRetry -->|No| Cancel([Cancel operation])

    ErrorType -->|Database error| LogError[Log error details]
    LogError --> ShowGeneric[Show generic error message]
    ShowGeneric --> OfferRetry[Offer retry option]
    OfferRetry --> UserRetryDB{User retries?}
    UserRetryDB -->|Yes| RetryDB[Retry database operation]
    RetryDB --> DBSuccess{Success?}
    DBSuccess -->|Yes| Success
    DBSuccess -->|No| ContactSupport[Suggest contacting support]
    ContactSupport --> Cancel
    UserRetryDB -->|No| Cancel

    ErrorType -->|Duplicate code| ShowDupError[Show duplicate code error]
    ShowDupError --> SuggestCode[Suggest unique code]
    SuggestCode --> UserFix

    style Start fill:#ffebee
    style Success fill:#e8f5e9
    style Cancel fill:#f5f5f5
    style RetryRequest fill:#fff4e1
```

---

## Related Documents

- [BR-equipment.md](./BR-equipment.md) - Business Rules
- [UC-equipment.md](./UC-equipment.md) - Use Cases
- [DD-equipment.md](./DD-equipment.md) - Data Dictionary
- [TS-equipment.md](./TS-equipment.md) - Technical Specifications
- [VAL-equipment.md](./VAL-equipment.md) - Validation Rules
