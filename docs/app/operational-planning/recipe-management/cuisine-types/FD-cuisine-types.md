# Recipe Cuisine Types - Flow Diagrams (FD)

## Document Information
- **Document Type**: Flow Diagrams Document
- **Module**: Operational Planning > Recipe Management > Cuisine Types
- **Version**: 1.0
- **Last Updated**: 2024-01-15

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0 | 2024-01-15 | System | Initial flow diagrams document created |

---

## 1. Create Cuisine Workflow

```mermaid
flowchart TD
    Start([User clicks New Cuisine]) --> OpenDialog[Open Create Dialog]
    OpenDialog --> InitForm[Initialize blank form with defaults]

    InitForm --> UserInput{User enters<br>cuisine data}
    UserInput -->|typing| ClientVal[Client-side validation]
    ClientVal --> ShowFeedback[Show validation feedback]
    ShowFeedback --> UserInput

    UserInput -->|clicks Save| FinalVal[Validate all fields]
    FinalVal -->|Invalid| ShowError[Show validation errors]
    ShowError --> UserInput

    FinalVal -->|Valid| CallAction[Call createCuisine server action]
    CallAction --> ServerVal[Server-side validation]

    ServerVal -->|Invalid| ReturnError[Return error response]
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> UserInput

    ServerVal -->|Valid| CheckCode{Check code<br>uniqueness}
    CheckCode -->|Duplicate| DupCode[Return duplicate code error]
    DupCode --> DisplayError

    CheckCode -->|Unique| CheckName{Check name<br>uniqueness}
    CheckName -->|Duplicate| DupName[Return duplicate name error]
    DupName --> DisplayError

    CheckName -->|Unique| CreateRecord[INSERT cuisine record]
    CreateRecord --> Success{Success?}

    Success -->|No| DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success toast]
    ShowSuccess --> RefreshList[Refresh cuisine list]
    RefreshList --> HighlightNew[Highlight new cuisine]
    HighlightNew --> End([End])

    style Start fill:#e1f5ff
    style CreateRecord fill:#fff4e1
    style End fill:#e8f5e9
    style DisplayError fill:#ffebee
```

---

## 2. Edit Cuisine Workflow

```mermaid
flowchart TD
    Start([User clicks Edit]) --> FetchData[Fetch cuisine data]
    FetchData --> OpenDialog[Open edit dialog]
    OpenDialog --> PreFill[Pre-fill form with current values]

    PreFill --> UserMod{User modifies<br>fields}
    UserMod -->|typing| ClientVal[Real-time validation]
    ClientVal --> ShowFeedback[Show feedback]
    ShowFeedback --> UserMod

    UserMod -->|clicks Save| CheckChanges{Any changes<br>made?}
    CheckChanges -->|No| InfoMsg[Show 'No changes' message]
    InfoMsg --> CloseNoSave[Close dialog]
    CloseNoSave --> End([End])

    CheckChanges -->|Yes| ValidateAll[Validate all fields]
    ValidateAll -->|Invalid| ShowError[Show validation errors]
    ShowError --> UserMod

    ValidateAll -->|Valid| CheckStatus{Status changed<br>to inactive?}
    CheckStatus -->|Yes| CheckRecipes{Has active<br>recipes?}
    CheckRecipes -->|Yes| ShowWarning[Show warning about active recipes]
    ShowWarning --> UserConfirm{User confirms?}
    UserConfirm -->|No| UserMod

    CheckStatus -->|No| CallUpdate[Call updateCuisine action]
    CheckRecipes -->|No| CallUpdate
    UserConfirm -->|Yes| CallUpdate

    CallUpdate --> ServerVal[Server validation]
    ServerVal -->|Invalid| ReturnError[Return error]
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> UserMod

    ServerVal -->|Valid| CheckCodeChange{Code changed?}
    CheckCodeChange -->|Yes| ValidateCode[Check code uniqueness<br>excluding current]
    ValidateCode -->|Duplicate| ReturnError
    ValidateCode -->|Unique| UpdateDB[UPDATE cuisine record]

    CheckCodeChange -->|No| UpdateDB
    UpdateDB --> Success{Success?}
    Success -->|No| DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success toast]
    ShowSuccess --> RefreshList[Refresh list]
    RefreshList --> HighlightUpdated[Highlight updated cuisine]
    HighlightUpdated --> End

    style Start fill:#e1f5ff
    style UpdateDB fill:#fff4e1
    style End fill:#e8f5e9
    style DisplayError fill:#ffebee
```

---

## 3. Delete Cuisine Workflow

```mermaid
flowchart TD
    Start([User clicks Delete]) --> CheckActive{Count active<br>recipes}

    CheckActive -->|>0 active| BlockDialog[Show blocking error dialog]
    BlockDialog --> ListRecipes[List affected recipes]
    ListRecipes --> ShowActions[Show 'View Recipes' or 'Close' buttons]
    ShowActions --> End([End - Deletion Blocked])

    CheckActive -->|0 active| CheckInactive{Count inactive<br>recipes}

    CheckInactive -->|>0 inactive| WarnDialog[Show warning dialog]
    WarnDialog --> ShowWarning[Show reassignment warning]
    ShowWarning --> RequireCheck[Require confirmation checkbox]
    RequireCheck --> UserDecision{User decision}
    UserDecision -->|Cancel| End
    UserDecision -->|Confirm| ForceDelete[Call deleteCuisine force=true]

    CheckInactive -->|0 inactive| ConfirmDialog[Show confirmation dialog]
    ConfirmDialog --> UserConfirm{User confirms?}
    UserConfirm -->|No| End
    UserConfirm -->|Yes| CallDelete[Call deleteCuisine action]

    ForceDelete --> Transaction[Begin DB transaction]
    CallDelete --> SimpleDelete[DELETE cuisine record]

    Transaction --> ReassignRecipes[UPDATE inactive recipes<br>set cuisine='Uncategorized']
    ReassignRecipes --> DeleteCuisine[DELETE cuisine record]
    DeleteCuisine --> Commit[Commit transaction]
    Commit --> Success{Success?}

    SimpleDelete --> Success

    Success -->|No| Rollback[Rollback]
    Rollback --> ShowError[Show error toast]
    ShowError --> End

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success message]
    ShowSuccess --> RefreshList[Refresh list]
    RefreshList --> RemoveCuisine[Remove deleted cuisine]
    RemoveCuisine --> End

    style Start fill:#e1f5ff
    style BlockDialog fill:#ffebee
    style WarnDialog fill:#fff9c4
    style DeleteCuisine fill:#fff4e1
    style End fill:#e8f5e9
```

---

## 4. Search and Filter Workflow

```mermaid
flowchart TD
    Start([User initiates search/filter]) --> InputType{Input type?}

    InputType -->|Search text| Debounce[Debounce 300ms]
    Debounce --> SearchFilter[Apply search filter]

    InputType -->|Quick filter click| QuickFilter[Toggle quick filter]

    InputType -->|Advanced filter| OpenAdvanced[Open advanced filter popover]
    OpenAdvanced --> AddCondition[User adds/modifies conditions]
    AddCondition --> UserApply{User clicks<br>Apply?}
    UserApply -->|No| UserContinue{Continue editing<br>or close?}
    UserContinue -->|Continue| AddCondition
    UserContinue -->|Close| End([End - No changes])
    UserApply -->|Yes| AdvancedFilter[Apply advanced filters]

    SearchFilter --> FilterChain[Combine all active filters]
    QuickFilter --> FilterChain
    AdvancedFilter --> FilterChain

    FilterChain --> ApplyToList[Filter cuisine list]
    ApplyToList --> SortResults[Sort by sort_order, name]
    SortResults --> UpdateDisplay[Update displayed list]
    UpdateDisplay --> ShowCount[Show result count]
    ShowCount --> CheckEmpty{Any results?}

    CheckEmpty -->|No| ShowEmpty[Show empty state]
    ShowEmpty --> SuggestClear[Suggest clearing filters]
    SuggestClear --> End

    CheckEmpty -->|Yes| DisplayResults[Display filtered cuisines]
    DisplayResults --> UpdateBadge[Update filter count badge]
    UpdateBadge --> End

    style Start fill:#e1f5ff
    style ApplyToList fill:#fff4e1
    style DisplayResults fill:#e8f5e9
    style ShowEmpty fill:#f5f5f5
```

---

## 5. Bulk Operations Workflow

```mermaid
flowchart TD
    Start([User selects cuisines]) --> SelectCheck{Selection<br>valid?}
    SelectCheck -->|<2 selected| ShowMsg[Show 'Select at least 2' message]
    ShowMsg --> End([End])

    SelectCheck -->|≥2 selected| ShowToolbar[Show bulk actions toolbar]
    ShowToolbar --> UserAction{User clicks<br>bulk action}

    UserAction -->|Activate| ValidateActivate[Identify already-active cuisines]
    ValidateActivate --> ShowActivateDialog[Show confirmation dialog]
    ShowActivateDialog --> UserConfirmAct{User confirms?}
    UserConfirmAct -->|No| End
    UserConfirmAct -->|Yes| BulkActivate[Update status='active' for valid cuisines]
    BulkActivate --> ActivateSuccess[Show success with counts]
    ActivateSuccess --> ClearSelection

    UserAction -->|Deactivate| CheckActiveRecipes[Check each for active recipes]
    CheckActiveRecipes --> SplitGroups[Split into safe vs blocked]
    SplitGroups --> ShowDeactivateDialog[Show dialog with breakdown]
    ShowDeactivateDialog --> UserDeactChoice{User decision}
    UserDeactChoice -->|Cancel| End
    UserDeactChoice -->|Safe only| BulkDeactivate[Update status='inactive' for safe]
    UserDeactChoice -->|All with warning| BlockedWarning[Show can't deactivate message]
    BlockedWarning --> End
    BulkDeactivate --> DeactivateSuccess[Show success/skipped counts]
    DeactivateSuccess --> ClearSelection

    UserAction -->|Delete| CheckRecipesAll[Check all for active/inactive recipes]
    CheckRecipesAll --> CategorizeAll[Categorize: blocked, warning, safe]
    CategorizeAll --> ShowDeleteDialog[Show detailed dialog]
    ShowDeleteDialog --> UserDelChoice{User decision}
    UserDelChoice -->|Cancel| End
    UserDelChoice -->|Safe only| DeleteSafe[Delete safe cuisines]
    UserDelChoice -->|Safe+Warned| RequireCheckbox[Require confirmation checkbox]
    RequireCheckbox --> UserChecked{Checkbox checked?}
    UserChecked -->|No| RequireCheckbox
    UserChecked -->|Yes| DeleteWithReassign[Delete with recipe reassignment]

    DeleteSafe --> DeleteSuccess[Show success/skipped counts]
    DeleteWithReassign --> DeleteSuccess
    DeleteSuccess --> ClearSelection

    UserAction -->|Export| OpenExportDialog[Open export dialog]
    OpenExportDialog --> UserExportChoice[User selects format and options]
    UserExportChoice --> GenerateFile[Generate export file]
    GenerateFile --> DownloadFile[Download file]
    DownloadFile --> ShowExportSuccess[Show success toast]
    ShowExportSuccess --> KeepSelection[Keep selection active]
    KeepSelection --> End

    ClearSelection[Clear selection] --> HideToolbar[Hide bulk toolbar]
    HideToolbar --> RefreshList[Refresh list]
    RefreshList --> End

    style Start fill:#e1f5ff
    style BulkActivate fill:#e8f5e9
    style BulkDeactivate fill:#fff9c4
    style DeleteWithReassign fill:#ffebee
    style End fill:#f5f5f5
```

---

## 6. Cuisine Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Create new cuisine
    Draft --> Active: Activate cuisine
    Active --> Inactive: Deactivate<br>(no active recipes)
    Inactive --> Active: Reactivate cuisine
    Active --> Active: Update properties
    Inactive --> Inactive: Update properties
    Inactive --> [*]: Delete<br>(no active recipes)

    note right of Active
        Can have recipes
        Appears in dropdowns
        Used for new recipes
    end note

    note right of Inactive
        Archived state
        Not in dropdowns
        Existing recipes keep reference
    end note

    note left of Draft
        Initial creation state
        Not used in current implementation
        (cuisines start as Active)
    end note
```

---

## 7. Permission-Based Action Flow

```mermaid
flowchart TD
    Start([User attempts action]) --> CheckAuth{User<br>authenticated?}
    CheckAuth -->|No| DenyAuth[Show login required]
    DenyAuth --> End([End - Access Denied])

    CheckAuth -->|Yes| CheckPerm{Has required<br>permission?}

    CheckPerm -->|cuisine.create<br>for create| AllowCreate[Allow create action]
    CheckPerm -->|cuisine.update<br>for edit| AllowEdit[Allow edit action]
    CheckPerm -->|cuisine.delete<br>for delete| AllowDelete[Allow delete action]
    CheckPerm -->|cuisine.view<br>for view| AllowView[Allow view action]
    CheckPerm -->|cuisine.export<br>for export| AllowExport[Allow export action]

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

## 8. Error Recovery Flow

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

    ErrorType -->|Business rule violation| ShowRuleError[Show specific business rule error]
    ShowRuleError --> ExplainRule[Explain rule and required action]
    ExplainRule --> UserFixRule{User takes<br>required action?}
    UserFixRule -->|Yes| RetryAction
    UserFixRule -->|No| Cancel

    ErrorType -->|Permission denied| ShowPermError[Show permission denied message]
    ShowPermError --> SuggestContact[Suggest contacting admin]
    SuggestContact --> Cancel

    style Start fill:#ffebee
    style Success fill:#e8f5e9
    style Cancel fill:#f5f5f5
    style RetryRequest fill:#fff4e1
```

---
