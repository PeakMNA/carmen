# Recipe Units - Flow Diagrams (FD)

## Document Information
- **Document Type**: Flow Diagrams Document
- **Module**: Operational Planning > Recipe Management > Units
- **Version**: 1.0.0
- **Last Updated**: 2025-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Development Team | Initial documentation based on actual implementation |

---

## 1. Create Custom Unit Workflow

```mermaid
flowchart TD
    Start([User clicks Add Unit]) --> OpenDialog[Open Create Dialog]
    OpenDialog --> InitForm[Initialize blank form with defaults]

    InitForm --> UserInput{User enters<br>unit data}
    UserInput -->|typing| ClientVal[Client-side validation]
    ClientVal --> ShowFeedback[Show validation feedback]
    ShowFeedback --> UserInput

    UserInput -->|clicks Add Unit| FinalVal[Validate all fields]
    FinalVal -->|Invalid| ShowError[Show validation errors]
    ShowError --> UserInput

    FinalVal -->|Valid| CallAction[Call createUnit server action]
    CallAction --> ServerVal[Server-side validation]

    ServerVal -->|Invalid| ReturnError[Return error response]
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> UserInput

    ServerVal -->|Valid| CheckCode{Check code<br>uniqueness}
    CheckCode -->|Duplicate| DupCode[Return duplicate code error]
    DupCode --> DisplayError

    CheckCode -->|Unique| SetSystemFlag[Set isSystemUnit = false]
    SetSystemFlag --> CreateRecord[INSERT unit record]
    CreateRecord --> Success{Success?}

    Success -->|No| DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success toast]
    ShowSuccess --> RefreshList[Refresh unit list]
    RefreshList --> End([End])

    style Start fill:#e1f5ff
    style CreateRecord fill:#fff4e1
    style End fill:#e8f5e9
    style DisplayError fill:#ffebee
```

---

## 2. Edit Unit Workflow

```mermaid
flowchart TD
    Start([User clicks Edit/View]) --> CheckSystem{Is system<br>unit?}

    CheckSystem -->|Yes| OpenViewDialog[Open view-only dialog]
    OpenViewDialog --> DisableFields[Disable all form fields]
    DisableFields --> ShowViewMessage[Show system unit cannot be modified message]
    ShowViewMessage --> UserClose{User clicks<br>Close}
    UserClose --> End([End])

    CheckSystem -->|No| OpenEditDialog[Open edit dialog]
    OpenEditDialog --> PreFill[Pre-fill form with current values]

    PreFill --> UserMod{User modifies<br>fields}
    UserMod -->|typing| ClientVal[Real-time validation]
    ClientVal --> ShowFeedback[Show feedback]
    ShowFeedback --> UserMod

    UserMod -->|clicks Save Changes| CheckChanges{Any changes<br>made?}
    CheckChanges -->|No| InfoMsg[Show no changes message]
    InfoMsg --> CloseNoSave[Close dialog]
    CloseNoSave --> End

    CheckChanges -->|Yes| ValidateAll[Validate all fields]
    ValidateAll -->|Invalid| ShowError[Show validation errors]
    ShowError --> UserMod

    ValidateAll -->|Valid| CallUpdate[Call updateUnit action]
    CallUpdate --> ServerVal[Server validation]

    ServerVal -->|Invalid| ReturnError[Return error]
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> UserMod

    ServerVal -->|Valid| CheckCodeChange{Code changed?}
    CheckCodeChange -->|Yes| ValidateCode[Check code uniqueness]
    ValidateCode -->|Duplicate| ReturnError
    ValidateCode -->|Unique| UpdateDB[UPDATE unit record]

    CheckCodeChange -->|No| UpdateDB
    UpdateDB --> Success{Success?}
    Success -->|No| DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success toast]
    ShowSuccess --> RefreshList[Refresh list]
    RefreshList --> End

    style Start fill:#e1f5ff
    style OpenViewDialog fill:#f5f5f5
    style UpdateDB fill:#fff4e1
    style End fill:#e8f5e9
    style DisplayError fill:#ffebee
```

---

## 3. Delete Unit Workflow

```mermaid
flowchart TD
    Start([User clicks Delete]) --> CheckSystem{Is system<br>unit?}

    CheckSystem -->|Yes| BlockAction[Action not available]
    BlockAction --> End([End - No Action])

    CheckSystem -->|No| CheckRecipes{Check recipe<br>usage}

    CheckRecipes -->|Has recipes| ShowWarning[Show strong warning dialog]
    ShowWarning --> ListImpact[Show affected recipes count]
    ListImpact --> UserDecision{User confirms<br>despite warning?}
    UserDecision -->|No| CancelDelete[Close dialog]
    CancelDelete --> End

    CheckRecipes -->|No recipes| ConfirmDialog[Show confirmation dialog]
    ConfirmDialog --> UserConfirm{User confirms?}
    UserConfirm -->|No| CancelDelete

    UserDecision -->|Yes| CallDelete[Call deleteUnit action]
    UserConfirm -->|Yes| CallDelete

    CallDelete --> ServerCheck[Server-side validation]
    ServerCheck -->|Is system unit| ReturnError[Return protected unit error]
    ReturnError --> DisplayError[Display error toast]
    DisplayError --> End

    ServerCheck -->|Safe to delete| DeleteRecord[DELETE unit record]
    DeleteRecord --> Success{Success?}

    Success -->|No| DBError[Database error]
    DBError --> DisplayError

    Success -->|Yes| Revalidate[Revalidate path]
    Revalidate --> CloseDialog[Close dialog]
    CloseDialog --> ShowSuccess[Show success message]
    ShowSuccess --> RefreshList[Refresh list]
    RefreshList --> End

    style Start fill:#e1f5ff
    style BlockAction fill:#f5f5f5
    style ShowWarning fill:#fff9c4
    style DeleteRecord fill:#fff4e1
    style End fill:#e8f5e9
```

---

## 4. Search Workflow

```mermaid
flowchart TD
    Start([User types in search]) --> Debounce[Debounce input]
    Debounce --> ExtractTerm[Extract search term]
    ExtractTerm --> FilterList[Filter unit list]

    FilterList --> MatchName{Name contains<br>term?}
    MatchName -->|Yes| Include[Include in results]
    MatchName -->|No| MatchCode{Code contains<br>term?}
    MatchCode -->|Yes| Include
    MatchCode -->|No| Exclude[Exclude from results]

    Include --> NextUnit{More units?}
    Exclude --> NextUnit
    NextUnit -->|Yes| FilterList
    NextUnit -->|No| UpdateDisplay[Update displayed list]

    UpdateDisplay --> ShowCount[Show result count]
    ShowCount --> CheckEmpty{Any results?}

    CheckEmpty -->|No| ShowEmpty[Show no units found message]
    ShowEmpty --> End([End])

    CheckEmpty -->|Yes| DisplayResults[Display filtered units]
    DisplayResults --> End

    style Start fill:#e1f5ff
    style FilterList fill:#fff4e1
    style DisplayResults fill:#e8f5e9
    style ShowEmpty fill:#f5f5f5
```

---

## 5. Bulk Selection Workflow

```mermaid
flowchart TD
    Start([User interaction with checkboxes]) --> SelectType{Selection type?}

    SelectType -->|Individual checkbox| CheckSystem{Is system<br>unit?}
    CheckSystem -->|Yes| Blocked[Checkbox disabled - no action]
    Blocked --> End([End])

    CheckSystem -->|No| ToggleOne[Toggle single unit selection]
    ToggleOne --> UpdateState[Update selected IDs state]

    SelectType -->|Header checkbox| FilterNonSystem[Filter non-system units]
    FilterNonSystem --> CheckHeaderState{Header<br>checked?}
    CheckHeaderState -->|Yes| SelectAllCustom[Select all non-system units]
    SelectAllCustom --> UpdateState
    CheckHeaderState -->|No| DeselectAll[Deselect all units]
    DeselectAll --> UpdateState

    UpdateState --> UpdateUI[Update checkbox visual states]
    UpdateUI --> ShowCount[Update selection count]
    ShowCount --> End

    style Start fill:#e1f5ff
    style Blocked fill:#f5f5f5
    style UpdateState fill:#fff4e1
    style End fill:#e8f5e9
```

---

## 6. Unit Precision Application Flow

```mermaid
flowchart TD
    Start([Value needs formatting]) --> GetUnit[Get unit settings]
    GetUnit --> GetDecimal[Get decimalPlaces setting]
    GetDecimal --> GetRounding[Get roundingMethod setting]

    GetRounding --> ApplyRounding{Rounding<br>method?}

    ApplyRounding -->|round| MathRound[Math.round to decimal places]
    ApplyRounding -->|floor| MathFloor[Math.floor to decimal places]
    ApplyRounding -->|ceil| MathCeil[Math.ceil to decimal places]

    MathRound --> FormatDisplay[Format for display]
    MathFloor --> FormatDisplay
    MathCeil --> FormatDisplay

    FormatDisplay --> CheckPlural{Quantity > 1?}
    CheckPlural -->|Yes| UsePlural[Use pluralName if available]
    CheckPlural -->|No| UseSingular[Use name]

    UsePlural --> CombineOutput[Combine value with unit name]
    UseSingular --> CombineOutput
    CombineOutput --> End([Display formatted value])

    style Start fill:#e1f5ff
    style FormatDisplay fill:#fff4e1
    style End fill:#e8f5e9
```

---

## 7. Unit Conversion Flow

```mermaid
flowchart TD
    Start([Convert value between units]) --> GetValue[Get source value]
    GetValue --> GetFromUnit[Get source unit]
    GetFromUnit --> GetToUnit[Get target unit]

    GetToUnit --> FindConversion{Find direct<br>conversion?}

    FindConversion -->|Yes| CheckProduct{Product-specific<br>conversion?}
    CheckProduct -->|Yes| UseProductConv[Use product conversion factor]
    CheckProduct -->|No| UseGenericConv[Use generic conversion factor]

    FindConversion -->|No| FindReverse{Find reverse<br>conversion?}
    FindReverse -->|Yes| InvertFactor[Invert conversion factor]
    InvertFactor --> ApplyConversion[Apply conversion]

    FindReverse -->|No| FindChain{Find chain<br>conversion?}
    FindChain -->|Yes| ChainFactors[Chain conversion factors]
    ChainFactors --> ApplyConversion

    FindChain -->|No| ConversionError[Return conversion not available]
    ConversionError --> End([End - Error])

    UseProductConv --> ApplyConversion
    UseGenericConv --> ApplyConversion

    ApplyConversion --> CheckApprox{Is approximate?}
    CheckApprox -->|Yes| MarkApprox[Mark result as approximate]
    CheckApprox -->|No| ExactResult[Return exact result]

    MarkApprox --> ApplyPrecision[Apply target unit precision]
    ExactResult --> ApplyPrecision
    ApplyPrecision --> ReturnResult[Return converted value]
    ReturnResult --> End([End - Success])

    style Start fill:#e1f5ff
    style ApplyConversion fill:#fff4e1
    style End fill:#e8f5e9
    style ConversionError fill:#ffebee
```

---

## 8. Permission-Based Action Flow

```mermaid
flowchart TD
    Start([User attempts action]) --> CheckAuth{User<br>authenticated?}
    CheckAuth -->|No| DenyAuth[Show login required]
    DenyAuth --> End([End - Access Denied])

    CheckAuth -->|Yes| CheckAction{Action type?}

    CheckAction -->|Create| CheckCreate{Has unit.create<br>permission?}
    CheckCreate -->|Yes| AllowCreate[Allow create action]
    CheckCreate -->|No| DenyPerm[Show permission denied]

    CheckAction -->|Edit| CheckUnit{Is system<br>unit?}
    CheckUnit -->|Yes| ViewOnly[Allow view only]
    CheckUnit -->|No| CheckUpdate{Has unit.update<br>permission?}
    CheckUpdate -->|Yes| AllowEdit[Allow edit action]
    CheckUpdate -->|No| DenyPerm

    CheckAction -->|Delete| CheckDelete{Is system<br>unit?}
    CheckDelete -->|Yes| BlockDelete[Block delete - protected]
    BlockDelete --> End
    CheckDelete -->|No| CheckDelPerm{Has unit.delete<br>permission?}
    CheckDelPerm -->|Yes| AllowDelete[Allow delete action]
    CheckDelPerm -->|No| DenyPerm

    DenyPerm --> End

    ViewOnly --> ExecuteAction[Execute action]
    AllowCreate --> ExecuteAction
    AllowEdit --> ExecuteAction
    AllowDelete --> ExecuteAction

    ExecuteAction --> LogAction[Log in audit trail]
    LogAction --> Success([End - Action Completed])

    style Start fill:#e1f5ff
    style DenyAuth fill:#ffebee
    style DenyPerm fill:#ffebee
    style BlockDelete fill:#ffebee
    style ExecuteAction fill:#fff4e1
    style Success fill:#e8f5e9
```

---

## 9. Error Recovery Flow

```mermaid
flowchart TD
    Start([Error occurs]) --> ErrorType{Error type?}

    ErrorType -->|Validation error| ShowFieldError[Highlight field with error]
    ShowFieldError --> ShowMessage[Show inline error message]
    ShowMessage --> UserFix[User corrects input]
    UserFix --> RetryAction[Retry action]
    RetryAction --> Success([Success])

    ErrorType -->|Duplicate code| ShowDupError[Show duplicate code error]
    ShowDupError --> SuggestCode[Suggest unique code variation]
    SuggestCode --> UserFix

    ErrorType -->|System unit modification| ShowProtected[Show unit is protected message]
    ShowProtected --> Inform[Inform user system units cannot be modified]
    Inform --> Cancel([Cancel operation])

    ErrorType -->|Network error| ShowOffline[Show offline message]
    ShowOffline --> RetryButton[Show retry button]
    RetryButton --> UserRetry{User clicks<br>retry?}
    UserRetry -->|Yes| RetryRequest[Retry request]
    RetryRequest --> RequestSuccess{Success?}
    RequestSuccess -->|Yes| Success
    RequestSuccess -->|No| RetryButton
    UserRetry -->|No| Cancel

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

    style Start fill:#ffebee
    style Success fill:#e8f5e9
    style Cancel fill:#f5f5f5
    style ShowProtected fill:#fff9c4
```

---

## Related Documents

- [BR-units.md](./BR-units.md) - Business Rules
- [UC-units.md](./UC-units.md) - Use Cases
- [DD-units.md](./DD-units.md) - Data Dictionary
- [TS-units.md](./TS-units.md) - Technical Specifications
- [VAL-units.md](./VAL-units.md) - Validation Rules
