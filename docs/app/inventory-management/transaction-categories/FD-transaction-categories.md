# Flow Diagrams: Transaction Categories

**Module**: Inventory Management
**Sub-module**: Transaction Categories
**Version**: 1.0.0
**Last Updated**: 2025-01-16
**Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Documentation Team | Initial version |

---

## Related Documentation
- [Business Requirements](./BR-transaction-categories.md)
- [Use Cases](./UC-transaction-categories.md)
- [Technical Specification](./TS-transaction-categories.md)
- [Data Definition](./DD-transaction-categories.md)
- [Validations](./VAL-transaction-categories.md)

---

## 1. Category List Page Flow

```mermaid
flowchart TD
    Start([User navigates to<br>Transaction Categories]) --> LoadData[Load all categories<br>from data source]

    LoadData --> CalcCounts[Calculate reason counts<br>per category]

    CalcCounts --> InitState[Initialize state:<br>- searchQuery: empty<br>- statusFilter: all<br>- sortConfig: sortOrder asc<br>- activeTab: all]

    InitState --> RenderPage[Render page with:<br>- Header: title + description<br>- Tabs: All, Stock In, Stock Out<br>- Current tab content]

    RenderPage --> UserAction{User action?}

    UserAction -->|Switch tab| ChangeTab[Update activeTab state]
    ChangeTab --> FilterByType[Filter categories<br>by tab type]
    FilterByType --> RenderList

    UserAction -->|Search| UpdateSearch[Update searchQuery state]
    UpdateSearch --> ApplyFilters

    UserAction -->|Filter status| UpdateStatus[Update statusFilter state]
    UpdateStatus --> ApplyFilters

    UserAction -->|Sort| UpdateSort[Update sortConfig state]
    UpdateSort --> ApplyFilters

    ApplyFilters[Apply filter pipeline:<br>1. Type filter<br>2. Search filter<br>3. Status filter<br>4. Sort] --> RenderList[Render filtered<br>category table]

    RenderList --> UserAction

    UserAction -->|Click row| NavDetail[Navigate to<br>/categories/id]

    UserAction -->|Click Add button| NavCreate[Navigate to<br>/categories/new<br>with ?type param]

    UserAction -->|Click Actions menu| ShowMenu[Show dropdown:<br>View, Edit, Delete]

    ShowMenu -->|View| NavDetail
    ShowMenu -->|Edit| NavEdit[Navigate to<br>/categories/id/edit]
    ShowMenu -->|Delete| ConfirmDelete[Show delete<br>confirmation dialog]

    NavDetail --> End([End])
    NavCreate --> End
    NavEdit --> End
    ConfirmDelete --> End
```

---

## 2. Create Category Flow

```mermaid
flowchart TD
    Start([User clicks<br>Add Category button]) --> CheckParam{URL has<br>type param?}

    CheckParam -->|Yes| PresetType[Pre-select type<br>Lock type selection]
    CheckParam -->|No| DefaultType[Default to OUT<br>Type selectable]

    PresetType --> InitForm
    DefaultType --> InitForm

    InitForm[Initialize form:<br>- code: empty<br>- name: empty<br>- type: preset or OUT<br>- glAccountCode: empty<br>- glAccountName: empty<br>- description: empty<br>- sortOrder: 1<br>- isActive: true]

    InitForm --> RenderForm[Render form:<br>- Type selection cards<br>- Details fields<br>- Save/Cancel buttons]

    RenderForm --> UserInput{User action?}

    UserInput -->|Select type| UpdateType{Type locked?}
    UpdateType -->|Yes| RenderForm
    UpdateType -->|No| SetType[Update type in state]
    SetType --> RenderForm

    UserInput -->|Edit code| SetCode[Update code<br>Auto-uppercase]
    SetCode --> RenderForm

    UserInput -->|Edit other field| UpdateField[Update field in state]
    UpdateField --> RenderForm

    UserInput -->|Click Cancel| CheckChanges{Has unsaved<br>changes?}
    CheckChanges -->|No| NavigateBack[Navigate to list]
    CheckChanges -->|Yes| ShowDiscard[Show discard dialog]

    ShowDiscard -->|Confirm| NavigateBack
    ShowDiscard -->|Cancel| RenderForm

    UserInput -->|Click Save| Validate[Validate form:<br>- code required, max 10<br>- name required<br>- glAccountCode required<br>- glAccountName required<br>- sortOrder 1-999]

    Validate --> Valid{Valid?}
    Valid -->|No| ShowErrors[Display field errors]
    ShowErrors --> RenderForm

    Valid -->|Yes| SaveCategory[Save category<br>to database]
    SaveCategory --> Success[Navigate to<br>category list]

    NavigateBack --> End([End])
    Success --> End
```

---

## 3. Category Detail Page Flow

```mermaid
flowchart TD
    Start([User navigates to<br>Category Detail]) --> LoadCategory[Load category by ID]

    LoadCategory --> Found{Category<br>found?}

    Found -->|No| Show404[Display:<br>Category Not Found<br>+ Back link]
    Show404 --> End([End])

    Found -->|Yes| LoadReasons[Load reasons<br>for category]

    LoadReasons --> RenderPage[Render page:<br>- Header with actions<br>- Details card<br>- Reasons card]

    RenderPage --> UserAction{User action?}

    UserAction -->|Click Edit| NavEdit[Navigate to<br>/categories/id/edit]
    NavEdit --> End

    UserAction -->|Click Delete| ShowDeleteCat[Show delete dialog:<br>Category name<br>Reason count warning]

    ShowDeleteCat -->|Cancel| RenderPage
    ShowDeleteCat -->|Confirm| DeleteCat[Soft delete category<br>+ all reasons]
    DeleteCat --> NavList[Navigate to list]
    NavList --> End

    UserAction -->|Click Add Reason| OpenAddDialog[Open ReasonDialog<br>in create mode]

    UserAction -->|Click Edit Reason| OpenEditDialog[Open ReasonDialog<br>in edit mode]

    UserAction -->|Click Delete Reason| ShowDeleteReason[Show delete dialog<br>with reason name]

    ShowDeleteReason -->|Cancel| RenderPage
    ShowDeleteReason -->|Confirm| DeleteReason[Soft delete reason]
    DeleteReason --> RefreshReasons[Reload reasons list]
    RefreshReasons --> RenderPage

    UserAction -->|Toggle status| UpdateStatus[Toggle reason<br>isActive flag]
    UpdateStatus --> RefreshReasons

    OpenAddDialog --> ReasonDialog
    OpenEditDialog --> ReasonDialog

    ReasonDialog{Dialog action?}
    ReasonDialog -->|Cancel| CloseDialog[Close dialog]
    CloseDialog --> RenderPage

    ReasonDialog -->|Save| ValidateReason[Validate:<br>- code required<br>- name required<br>- sortOrder 1-999]

    ValidateReason --> ReasonValid{Valid?}
    ReasonValid -->|No| ShowReasonErrors[Show field errors]
    ShowReasonErrors --> ReasonDialog

    ReasonValid -->|Yes| SaveReason{Edit mode?}
    SaveReason -->|Create| CreateReason[Insert new reason]
    SaveReason -->|Edit| UpdateReason[Update existing reason]

    CreateReason --> CloseDialog
    UpdateReason --> CloseDialog
```

---

## 4. Filter Pipeline Flow

```mermaid
flowchart TD
    Start([Filter triggered]) --> GetData[Get all categories<br>from mock data]

    GetData --> Stage1{Type filter<br>from props?}

    Stage1 -->|Yes| FilterType[Filter where<br>type = typeFilter]
    Stage1 -->|No| Stage2

    FilterType --> Stage2{Search query<br>present?}

    Stage2 -->|Yes| FilterSearch[Filter where<br>code, name, glAccountCode,<br>glAccountName, or description<br>contains query]
    Stage2 -->|No| Stage3

    FilterSearch --> Stage3{Status filter<br>not 'all'?}

    Stage3 -->|Yes| FilterStatus[Filter where<br>isActive = status]
    Stage3 -->|No| Stage4

    FilterStatus --> Stage4[Sort by sortConfig:<br>field + order]

    Stage4 --> Return[Return filtered<br>and sorted array]

    Return --> End([Render table])
```

---

## 5. Category-Reason Selection in Adjustments

```mermaid
flowchart TD
    Start([User opens<br>Adjustment Form]) --> GetType[Get adjustment type<br>from form or URL]

    GetType --> LoadCategories[Load active categories<br>WHERE type = adjType<br>ORDER BY sortOrder]

    LoadCategories --> RenderCatDropdown[Render category<br>dropdown]

    RenderCatDropdown --> UserSelectsCat{User selects<br>category?}

    UserSelectsCat -->|No| WaitSelection[Wait for selection]
    WaitSelection --> UserSelectsCat

    UserSelectsCat -->|Yes| GetCategoryId[Get selected<br>category ID]

    GetCategoryId --> LoadReasons[Load active reasons<br>WHERE categoryId = selected<br>ORDER BY sortOrder]

    LoadReasons --> EnableReasonDropdown[Enable reason dropdown<br>for each item]

    EnableReasonDropdown --> UserAddsItem{User adds<br>item?}

    UserAddsItem -->|Yes| SelectReason[User selects reason<br>from filtered list]
    SelectReason --> UserAddsItem

    UserAddsItem -->|No, Submit| GetGLAccount[Get GL account<br>from category]

    GetGLAccount --> GenerateJournal[Use GL account<br>for journal entries]

    GenerateJournal --> End([Post adjustment])
```

---

## 6. GL Account Mapping Flow

```mermaid
flowchart TD
    Start([Adjustment Posted]) --> GetCategory[Get category code<br>from adjustment header]

    GetCategory --> LookupGL[Lookup GL account:<br>code + name]

    LookupGL --> DetermineType{Adjustment<br>type?}

    DetermineType -->|OUT| CreateOUT[Create journal entry:<br>DR: GL Account expense<br>CR: Inventory 1310]

    DetermineType -->|IN| CreateIN[Create journal entry:<br>DR: Inventory 1310<br>CR: GL Account variance]

    CreateOUT --> PostJE[Post journal entry<br>to General Ledger]
    CreateIN --> PostJE

    PostJE --> End([Journal Posted])
```

---

## 7. Status State Diagram

```mermaid
stateDiagram-v2
    [*] --> Active: Create category/reason

    Active --> Inactive: Toggle isActive = false
    Inactive --> Active: Toggle isActive = true

    Active --> Deleted: Delete action
    Inactive --> Deleted: Delete action

    Deleted --> [*]: Soft deleted

    note right of Active
        Available for selection
        in adjustment forms
    end note

    note right of Inactive
        Hidden from dropdowns
        Still visible in admin
        Existing adjustments unaffected
    end note

    note right of Deleted
        Soft deleted
        Maintains referential integrity
        Audit trail preserved
    end note
```

---

## 8. Permission Flow

```mermaid
flowchart TD
    Start([User accesses<br>Transaction Categories]) --> CheckView{Has view<br>permission?}

    CheckView -->|No| AccessDenied[Show access denied]
    AccessDenied --> End([End])

    CheckView -->|Yes| ShowList[Show category list]

    ShowList --> CheckCreate{Has create<br>permission?}
    CheckCreate -->|Yes| EnableAdd[Show Add buttons]
    CheckCreate -->|No| HideAdd[Hide Add buttons]

    EnableAdd --> CheckEdit
    HideAdd --> CheckEdit

    CheckEdit{Has edit<br>permission?}
    CheckEdit -->|Yes| EnableEdit[Enable Edit actions<br>Enable reason management]
    CheckEdit -->|No| DisableEdit[Hide Edit actions<br>Disable reason management]

    EnableEdit --> CheckDelete
    DisableEdit --> CheckDelete

    CheckDelete{Has delete<br>permission?}
    CheckDelete -->|Yes| EnableDelete[Show Delete actions]
    CheckDelete -->|No| HideDelete[Hide Delete actions]

    EnableDelete --> End
    HideDelete --> End
```

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Documentation Team | Initial creation |
