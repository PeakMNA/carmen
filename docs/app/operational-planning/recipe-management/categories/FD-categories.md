# Flow Diagrams: Recipe Categories

**Module**: Operational Planning > Recipe Management > Categories
**Version**: 1.0
**Last Updated**: 2025-01-11
**Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Create Category Workflow

```mermaid
flowchart TD
    Start([User Clicks Create Category]) --> OpenDialog[Open Create Dialog]
    OpenDialog --> ShowForm[Display Blank Form]

    ShowForm --> EnterName{User Enters Name}
    EnterName --> AutoCode[System Auto-generates Code]
    AutoCode --> EnterDesc[User Enters Description]

    EnterDesc --> SelectParent{Select Parent Category?}
    SelectParent -->|Yes| CheckLevel{Parent Level = 2?}
    SelectParent -->|No| SetLevel1[Set Level = 1]

    CheckLevel -->|Yes| ShowError[Show Error: Max Depth]
    CheckLevel -->|No| SetLevel2[Set Level = 2]
    ShowError --> SelectParent

    SetLevel1 --> AdjustSettings[User Adjusts Cost/Margin Settings]
    SetLevel2 --> AdjustSettings

    AdjustSettings --> CalcTotal[Calculate Total Cost %]
    CalcTotal --> CheckTotal{Total > 100%?}
    CheckTotal -->|Yes| ShowWarning[Show Warning]
    CheckTotal -->|No| Ready[Form Ready]
    ShowWarning --> Ready

    Ready --> ClickSave[User Clicks Save]
    ClickSave --> ValidateForm[Validate Form Data]

    ValidateForm --> CheckRequired{All Required Fields?}
    CheckRequired -->|No| ShowValidation[Show Validation Errors]
    ShowValidation --> AdjustSettings

    CheckRequired -->|Yes| CheckUnique{Code & Name Unique?}
    CheckUnique -->|No| ShowDuplicate[Show Duplicate Error]
    ShowDuplicate --> EnterName

    CheckUnique -->|Yes| CheckMargins{Target >= Min Margin?}
    CheckMargins -->|No| ShowMarginError[Show Margin Error]
    ShowMarginError --> AdjustSettings

    CheckMargins -->|Yes| SaveDB[Save to Database]
    SaveDB --> UpdateParent{Has Parent?}

    UpdateParent -->|Yes| IncrementCount[Update Parent Subcategory Count]
    UpdateParent -->|No| LogAudit[Log Audit Trail]
    IncrementCount --> LogAudit

    LogAudit --> Revalidate[Revalidate Path]
    Revalidate --> CloseDialog[Close Dialog]
    CloseDialog --> RefreshList[Refresh Category List]
    RefreshList --> ShowSuccess[Show Success Toast]
    ShowSuccess --> Highlight[Highlight New Category]
    Highlight --> End([Category Created])

    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style ShowError fill:#ffcdd2
    style ShowDuplicate fill:#ffcdd2
    style ShowMarginError fill:#ffcdd2
    style SaveDB fill:#fff9c4
```

---

## 2. Edit Category Workflow

```mermaid
flowchart TD
    Start([User Selects Edit]) --> FetchCategory[Fetch Category Data]
    FetchCategory --> OpenDialog[Open Edit Dialog]
    OpenDialog --> PopulateForm[Populate Form with Current Values]

    PopulateForm --> CheckRecipes{Has Recipes?}
    CheckRecipes -->|Yes| LockParent[Lock Parent Field]
    CheckRecipes -->|No| AllowEdit[Allow All Edits]

    LockParent --> ModifyFields[User Modifies Fields]
    AllowEdit --> ModifyFields

    ModifyFields --> RealTimeValidate[Real-time Validation]
    RealTimeValidate --> ClickSave[User Clicks Save]

    ClickSave --> ValidateForm[Validate All Fields]
    ValidateForm --> CheckDuplicates{Check Duplicates<br>excluding self?}

    CheckDuplicates -->|Duplicate| ShowError[Show Duplicate Error]
    ShowError --> ModifyFields

    CheckDuplicates -->|Unique| CheckMarginChange{Margin Changed<br>& Recipe Count >= 10?}

    CheckMarginChange -->|Yes| ShowWarningDialog[Show Warning Dialog]
    ShowWarningDialog --> Confirm{User Confirms?}
    Confirm -->|No| ModifyFields
    Confirm -->|Yes| UpdateDB[Update Database]

    CheckMarginChange -->|No| UpdateDB

    UpdateDB --> RecalcMetrics{Cost/Margin Changed?}
    RecalcMetrics -->|Yes| QueueRecalc[Queue Metric Recalculation]
    RecalcMetrics -->|No| LogAudit[Log Audit Trail]

    QueueRecalc --> LogAudit
    LogAudit --> Revalidate[Revalidate Path]
    Revalidate --> CloseDialog[Close Dialog]
    CloseDialog --> RefreshList[Refresh List]
    RefreshList --> ShowSuccess[Show Success Toast]
    ShowSuccess --> End([Category Updated])

    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style ShowError fill:#ffcdd2
    style UpdateDB fill:#fff9c4
```

---

## 3. Delete Category Workflow

```mermaid
flowchart TD
    Start([User Clicks Delete]) --> FetchCounts[Fetch Recipe & Subcategory Counts]
    FetchCounts --> OpenDialog[Open Delete Confirmation]

    OpenDialog --> CheckActive{Has Active<br>Recipes?}
    CheckActive -->|Yes| BlockDelete[Show Error: Cannot Delete]
    BlockDelete --> Cancel[User Clicks Cancel]
    Cancel --> End1([Deletion Cancelled])

    CheckActive -->|No| CheckSubcats{Has<br>Subcategories?}
    CheckSubcats -->|Yes| BlockDelete

    CheckSubcats -->|No| CheckInactive{Has Inactive<br>Recipes?}
    CheckInactive -->|Yes| ShowWarning[Show Warning + Checkbox]
    CheckInactive -->|No| ShowSafe[Show Safe Delete Message]

    ShowWarning --> WaitConfirm{Checkbox<br>Checked?}
    WaitConfirm -->|No| DisableButton[Disable Confirm Button]
    DisableButton --> WaitConfirm

    WaitConfirm -->|Yes| EnableButton[Enable Confirm Button]
    ShowSafe --> EnableButton

    EnableButton --> UserConfirm{User Clicks<br>Confirm?}
    UserConfirm -->|No| Cancel

    UserConfirm -->|Yes| UnassignRecipes{Has Inactive<br>Recipes?}
    UnassignRecipes -->|Yes| UnassignAll[Unassign All Recipes]
    UnassignRecipes -->|No| DeleteRecord[Delete Category Record]

    UnassignAll --> DeleteRecord
    DeleteRecord --> UpdateParent{Has Parent?}

    UpdateParent -->|Yes| DecrementCount[Decrement Parent Count]
    UpdateParent -->|No| LogAudit[Log Audit Trail]

    DecrementCount --> LogAudit
    LogAudit --> Revalidate[Revalidate Path]
    Revalidate --> CloseDialog[Close Dialog]
    CloseDialog --> RemoveFromList[Remove from List]
    RemoveFromList --> ShowSuccess[Show Success Toast]
    ShowSuccess --> End2([Category Deleted])

    style Start fill:#e3f2fd
    style End1 fill:#fff9c4
    style End2 fill:#c8e6c9
    style BlockDelete fill:#ffcdd2
    style DeleteRecord fill:#fff9c4
```

---

## 4. Search and Filter Workflow

```mermaid
flowchart TD
    Start([User Views Category List]) --> InitialLoad[Load All Categories]
    InitialLoad --> DisplayList[Display Full List]

    DisplayList --> UserAction{User Action?}

    UserAction -->|Types in Search| CaptureInput[Capture Search Term]
    CaptureInput --> Debounce[Debounce 300ms]
    Debounce --> FilterSearch[Filter by Name/Code/Desc]
    FilterSearch --> UpdateCount[Update Result Count]
    UpdateCount --> RenderResults[Re-render List]
    RenderResults --> UserAction

    UserAction -->|Clicks Quick Filter| ToggleQuick[Toggle Quick Filter]
    ToggleQuick --> ApplyQuick[Apply Quick Filter Logic]
    ApplyQuick --> CombineFilters[Combine with Existing Filters]
    CombineFilters --> UpdateBadge[Update Filter Badge Count]
    UpdateBadge --> RenderResults

    UserAction -->|Opens Advanced Filters| ShowPanel[Show Advanced Filter Panel]
    ShowPanel --> AddCondition[User Adds Filter Condition]
    AddCondition --> SelectField[Select Field]
    SelectField --> SelectOperator[Select Operator]
    SelectOperator --> EnterValue[Enter Value]
    EnterValue --> ApplyAdvanced[Apply Filter Conditions]
    ApplyAdvanced --> CombineFilters

    UserAction -->|Clicks Clear Filters| ResetFilters[Reset All Filters]
    ResetFilters --> InitialLoad

    UserAction -->|Clicks Export| DetermineScope{Filters/Selection<br>Active?}
    DetermineScope -->|Yes| ExportFiltered[Export Filtered/Selected]
    DetermineScope -->|No| ExportAll[Export All Categories]
    ExportFiltered --> GenerateFile[Generate Export File]
    ExportAll --> GenerateFile
    GenerateFile --> Download[Trigger Download]
    Download --> UserAction

    style Start fill:#e3f2fd
    style RenderResults fill:#c8e6c9
```

---

## 5. Hierarchy Expansion Workflow

```mermaid
flowchart TD
    Start([User Views List with Hierarchy]) --> RenderParents[Render Parent Categories]
    RenderParents --> ShowChevrons[Show Chevron Icons]

    ShowChevrons --> UserClick{User Clicks<br>Chevron?}

    UserClick -->|Yes| CheckState{Currently<br>Expanded?}

    CheckState -->|Yes| CollapseAction[Collapse Category]
    CollapseAction --> HideChildren[Hide Subcategories]
    HideChildren --> ChangeIcon1[Change Icon to Right Chevron]
    ChangeIcon1 --> Animate1[Slide Up Animation]
    Animate1 --> UpdateState1[Update Expanded State Set]
    UpdateState1 --> UserClick

    CheckState -->|No| ExpandAction[Expand Category]
    ExpandAction --> FetchChildren[Get Subcategories from Data]
    FetchChildren --> ShowChildren[Show Subcategories with Indentation]
    ShowChildren --> ChangeIcon2[Change Icon to Down Chevron]
    ChangeIcon2 --> Animate2[Slide Down Animation]
    Animate2 --> UpdateState2[Update Expanded State Set]
    UpdateState2 --> UserClick

    UserClick -->|No| OtherAction{User Performs<br>Other Action?}

    OtherAction -->|Search/Filter| MaintainState[Maintain Expansion State]
    MaintainState --> ApplySearchFilter[Apply Search/Filter]
    ApplySearchFilter --> AutoExpand{Match in<br>Subcategory?}
    AutoExpand -->|Yes| ForceExpand[Auto-expand Parent]
    AutoExpand -->|No| RenderFiltered[Render Filtered Results]
    ForceExpand --> RenderFiltered
    RenderFiltered --> UserClick

    OtherAction -->|Expand All| ExpandAll[Expand All Parents]
    ExpandAll --> ShowAllChildren[Show All Subcategories]
    ShowAllChildren --> AllChevrons[All Chevrons Down]
    AllChevrons --> UserClick

    OtherAction -->|Collapse All| CollapseAll[Collapse All Parents]
    CollapseAll --> HideAllChildren[Hide All Subcategories]
    HideAllChildren --> AllChevronsRight[All Chevrons Right]
    AllChevronsRight --> UserClick

    style Start fill:#e3f2fd
    style Animate1 fill:#c8e6c9
    style Animate2 fill:#c8e6c9
```

---

## 6. Bulk Selection and Actions Workflow

```mermaid
flowchart TD
    Start([User Views Category List]) --> ShowCheckboxes[Display Checkboxes]
    ShowCheckboxes --> UserAction{User Action?}

    UserAction -->|Clicks Individual| ToggleOne[Toggle Single Selection]
    ToggleOne --> UpdateCount1[Update Selected Count]
    UpdateCount1 --> UpdateBadge1[Update Badge Display]
    UpdateBadge1 --> EnableMenu1{Any Selected?}
    EnableMenu1 -->|Yes| ShowMenu[Show Bulk Actions Menu]
    EnableMenu1 -->|No| HideMenu[Hide Bulk Actions Menu]
    ShowMenu --> UserAction
    HideMenu --> UserAction

    UserAction -->|Clicks Select All| CheckFilters{Filters<br>Active?}
    CheckFilters -->|Yes| SelectFiltered[Select All Filtered Categories]
    CheckFilters -->|No| SelectAll[Select All Visible Categories]
    SelectFiltered --> UpdateCount2[Update Selected Count]
    SelectAll --> UpdateCount2
    UpdateCount2 --> CheckHeader[Check Header Checkbox]
    CheckHeader --> ShowMenu

    UserAction -->|Shift+Click| SelectRange[Select Range]
    SelectRange --> CalculateRange[Calculate Between First & Last]
    CalculateRange --> SelectAllInRange[Select All in Range]
    SelectAllInRange --> UpdateCount1

    UserAction -->|Clicks Bulk Action| ChooseAction{Which Action?}

    ChooseAction -->|Status Update| ShowStatusDialog[Show Status Update Dialog]
    ShowStatusDialog --> SelectStatus[User Selects Active/Inactive]
    SelectStatus --> ConfirmStatus{Confirm?}
    ConfirmStatus -->|No| UserAction
    ConfirmStatus -->|Yes| BulkUpdate[Update All Selected Categories]
    BulkUpdate --> LogBulk[Log Bulk Operation]
    LogBulk --> Refresh1[Refresh List]
    Refresh1 --> ClearSelection[Clear Selection]
    ClearSelection --> ShowSuccessBulk[Show Success Toast with Count]
    ShowSuccessBulk --> UserAction

    ChooseAction -->|Export| DetermineExport[Determine Export Scope]
    DetermineExport --> GenerateFile[Generate File with Selected]
    GenerateFile --> Download[Trigger Download]
    Download --> UserAction

    ChooseAction -->|Print| OpenPrint[Open Print Preview]
    OpenPrint --> FormatPrint[Format Selected Categories]
    FormatPrint --> ShowPrintDialog[Show Browser Print Dialog]
    ShowPrintDialog --> UserAction

    UserAction -->|Clear Selection| ResetSelection[Deselect All]
    ResetSelection --> HideMenu

    style Start fill:#e3f2fd
    style BulkUpdate fill:#fff9c4
    style ShowSuccessBulk fill:#c8e6c9
```

---

## 7. Metric Calculation Workflow

```mermaid
flowchart TD
    Start([Recipe Change Event]) --> DetectChange[Detect Recipe Create/Update/Delete]
    DetectChange --> GetCategoryID[Get Category ID from Recipe]

    GetCategoryID --> CheckCategory{Category<br>Exists?}
    CheckCategory -->|No| End1([Skip Calculation])

    CheckCategory -->|Yes| StartCalc[Start Metric Calculation]
    StartCalc --> CountTotal[Count Total Recipes in Category]
    CountTotal --> CountActive[Count Active Recipes]
    CountActive --> CalcAvgCost[Calculate Average Cost]
    CalcAvgCost --> CalcAvgMargin[Calculate Average Margin]

    CalcAvgMargin --> CheckThresholds{Average Margin<br>vs Targets?}
    CheckThresholds -->|Below Minimum| SetRedBadge[Set Performance Badge: RED]
    CheckThresholds -->|Between Min & Target| SetYellowBadge[Set Performance Badge: YELLOW]
    CheckThresholds -->|At/Above Target| SetGreenBadge[Set Performance Badge: GREEN]

    SetRedBadge --> UpdateDB[Update Category Metrics in DB]
    SetYellowBadge --> UpdateDB
    SetGreenBadge --> UpdateDB

    UpdateDB --> SetTimestamp[Set last_updated Timestamp]
    SetTimestamp --> CheckParent{Has Parent<br>Category?}

    CheckParent -->|Yes| TriggerParent[Trigger Parent Metric Recalculation]
    CheckParent -->|No| ClearCache[Clear React Query Cache]

    TriggerParent --> ClearCache
    ClearCache --> Revalidate[Revalidate Category Page Path]
    Revalidate --> End2([Metrics Updated])

    style Start fill:#e3f2fd
    style End1 fill:#fff9c4
    style End2 fill:#c8e6c9
    style UpdateDB fill:#fff9c4
    style SetRedBadge fill:#ffcdd2
    style SetYellowBadge fill:#fff9c4
    style SetGreenBadge fill:#c8e6c9
```

---

## 8. Category Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Category
    Draft --> Active: Activate
    Active --> Inactive: Deactivate
    Inactive --> Active: Reactivate
    Active --> [*]: Delete (if no recipes/subcats)
    Inactive --> [*]: Delete (if no active recipes/subcats)

    note right of Active
        Visible in dropdowns
        Recipes can be assigned
        Appears in default list view
    end note

    note right of Inactive
        Hidden from dropdowns
        Existing recipes unchanged
        Visible with filter only
    end note

    note right of Draft
        Initial state
        Not used in current implementation
        Reserved for future approval workflow
    end note
```

---

## 9. Permission-Based Action Flow

```mermaid
flowchart TD
    Start([User Attempts Action]) --> CheckAuth{User<br>Authenticated?}
    CheckAuth -->|No| RedirectLogin[Redirect to Login]
    RedirectLogin --> End1([Action Denied])

    CheckAuth -->|Yes| DetermineAction{Action Type?}

    DetermineAction -->|View| CheckViewPerm[Check category.view Permission]
    DetermineAction -->|Create| CheckCreatePerm[Check category.create Permission]
    DetermineAction -->|Edit| CheckEditPerm[Check category.update Permission]
    DetermineAction -->|Delete| CheckDeletePerm[Check category.delete Permission]
    DetermineAction -->|Export| CheckExportPerm[Check category.export Permission]

    CheckViewPerm --> HasViewPerm{Has<br>Permission?}
    CheckCreatePerm --> HasCreatePerm{Has<br>Permission?}
    CheckEditPerm --> HasEditPerm{Has<br>Permission?}
    CheckDeletePerm --> HasDeletePerm{Has<br>Permission?}
    CheckExportPerm --> HasExportPerm{Has<br>Permission?}

    HasViewPerm -->|No| ShowError[Show Permission Denied Error]
    HasCreatePerm -->|No| ShowError
    HasEditPerm -->|No| ShowError
    HasDeletePerm -->|No| ShowError
    HasExportPerm -->|No| ShowError

    ShowError --> LogAttempt[Log Unauthorized Attempt]
    LogAttempt --> End1

    HasViewPerm -->|Yes| AllowView[Allow View Action]
    HasCreatePerm -->|Yes| AllowCreate[Allow Create Action]
    HasEditPerm -->|Yes| AllowEdit[Allow Edit Action]
    HasDeletePerm -->|Yes| AllowDelete[Allow Delete Action]
    HasExportPerm -->|Yes| AllowExport[Allow Export Action]

    AllowView --> ExecuteAction[Execute Action]
    AllowCreate --> ExecuteAction
    AllowEdit --> ExecuteAction
    AllowDelete --> ExecuteAction
    AllowExport --> ExecuteAction

    ExecuteAction --> LogSuccess[Log Action in Audit Trail]
    LogSuccess --> End2([Action Completed])

    style Start fill:#e3f2fd
    style End1 fill:#ffcdd2
    style End2 fill:#c8e6c9
    style ShowError fill:#ffcdd2
    style ExecuteAction fill:#fff9c4
```

---

## 10. Error Recovery Flow

```mermaid
flowchart TD
    Start([Error Occurs]) --> DetectError{Error Type?}

    DetectError -->|Validation Error| ShowFieldError[Show Inline Field Error]
    ShowFieldError --> HighlightField[Highlight Invalid Field]
    HighlightField --> DisableSubmit[Disable Submit Button]
    DisableSubmit --> WaitFix[Wait for User Correction]
    WaitFix --> UserFixes[User Corrects Input]
    UserFixes --> ReValidate[Re-validate Field]
    ReValidate --> CheckValid{Valid?}
    CheckValid -->|No| ShowFieldError
    CheckValid -->|Yes| ClearError[Clear Error Message]
    ClearError --> EnableSubmit[Enable Submit Button]
    EnableSubmit --> End1([Ready to Submit])

    DetectError -->|Network Error| ShowToast[Show Error Toast]
    ShowToast --> MaintainState[Maintain Form State]
    MaintainState --> ProvideRetry[Show Retry Button]
    ProvideRetry --> UserRetries{User Clicks<br>Retry?}
    UserRetries -->|Yes| RetryAction[Retry Original Action]
    UserRetries -->|No| End2([Action Cancelled])
    RetryAction --> CheckSuccess{Successful?}
    CheckSuccess -->|No| IncrementRetry[Increment Retry Count]
    IncrementRetry --> CheckRetries{Retry Count<br>> 3?}
    CheckRetries -->|Yes| ShowPersistent[Show Persistent Error]
    CheckRetries -->|No| ShowToast
    ShowPersistent --> SuggestSupport[Suggest Contacting Support]
    SuggestSupport --> End2
    CheckSuccess -->|Yes| End3([Action Completed])

    DetectError -->|Database Error| LogError[Log Error Details]
    LogError --> ShowGeneric[Show Generic Error Message]
    ShowGeneric --> CloseDialog[Close Dialog/Maintain State]
    CloseDialog --> AllowRetry[Allow User to Retry]
    AllowRetry --> End2

    DetectError -->|Business Rule Error| ShowRuleError[Show Business Rule Violation]
    ShowRuleError --> ExplainRule[Explain Rule and Resolution]
    ExplainRule --> ProvideGuidance[Provide Action Guidance]
    ProvideGuidance --> UserResolves[User Resolves Conflict]
    UserResolves --> End1

    style Start fill:#ffcdd2
    style End1 fill:#c8e6c9
    style End2 fill:#fff9c4
    style End3 fill:#c8e6c9
```

---

## Document Control

**Prepared By**: Development Team
**Reviewed By**: UX Designer, Technical Lead
**Approved By**: Product Owner
**Version History**:
- v1.0 (2025-01-11): Initial flow diagrams based on prototype implementation
