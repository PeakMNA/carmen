# Flow Diagrams: Purchase Request Templates

## Module Information
- **Module**: Procurement
- **Sub-Module**: Purchase Request Templates
- **Route**: `/procurement/purchase-request-templates`
- **Version**: 1.2.0
- **Last Updated**: 2025-12-04
- **Owner**: Procurement Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-11 | System Documentation | Initial version |
| 1.1.0 | 2025-12-04 | Documentation Team | Aligned with prototype - simplified item flow, updated state machine |
| 1.2.0 | 2025-12-04 | Documentation Team | Converted to Mermaid 8.8.2 diagrams |

---

## Overview

This document provides visual flow diagrams for all major workflows in the Purchase Request Templates module. Diagrams illustrate user interactions, system processes, decision points, and data flows using Mermaid 8.8.2 syntax.

**Related Documents**:
- [Backend Requirements](./BE-purchase-request-templates.md)
- [Business Requirements](./BR-purchase-request-templates.md)
- [Data Definition](./DD-purchase-request-templates.md)
- [Use Cases](./UC-purchase-request-templates.md)
- [Technical Specification](./TS-purchase-request-templates.md)

---

## 1. Template Creation Workflow

```mermaid
flowchart TD
    Start([Start]) --> ClickNew[User clicks 'New Template']
    ClickNew --> DisplayForm[Display template creation form]
    DisplayForm --> EnterData[User enters:<br>- Description<br>- Department<br>- Request Type]
    EnterData --> ClickCreate[User clicks 'Create']
    ClickCreate --> ValidateClient{Validate input<br>client-side}

    ValidateClient -->|Invalid| DisplayErrors[Display validation errors]
    DisplayErrors --> CorrectErrors[User corrects errors]
    CorrectErrors --> ClickCreate

    ValidateClient -->|Valid| CallServer[Call server action:<br>createTemplate]
    CallServer --> GenerateNum[Generate template number<br>TPL-YY-NNNN]
    GenerateNum --> InsertDB[Insert template record<br>to database]

    InsertDB -->|Success| LogActivity[Log activity:<br>template_created]
    LogActivity --> Navigate[Navigate to template<br>detail page - edit mode]
    Navigate --> ShowSuccess[Display success message]
    ShowSuccess --> EndSuccess([End])

    InsertDB -->|Failure| ShowError[Display error message]
    ShowError --> EndFailure([End])

    style Start fill:#e1f5fe
    style EndSuccess fill:#c8e6c9
    style EndFailure fill:#ffcdd2
    style ValidateClient fill:#fff3e0
```

---

## 2. Add Item to Template Workflow

```mermaid
flowchart TD
    Start([Start]) --> ClickAdd[User in edit mode<br>clicks Add Item]
    ClickAdd --> ShowDialog[Display item form dialog]
    ShowDialog --> EnterBasic[User enters:<br>- Item code<br>- Description<br>- UOM<br>- Quantity<br>- Unit price<br>- Currency]
    EnterBasic --> Calculate[System calculates<br>totalAmount = qty * unitPrice]
    Calculate --> EnterFinancial[User enters financial coding:<br>- Budget code<br>- Account code<br>- Department<br>- Tax code]
    EnterFinancial --> ClickAddBtn[User clicks Add]
    ClickAddBtn --> ValidateZod{Validate all fields<br>Zod schema}

    ValidateZod -->|Invalid| ShowValidation[Display validation errors]
    ShowValidation --> CorrectItem[User corrects errors]
    CorrectItem --> ClickAddBtn

    ValidateZod -->|Valid| CheckDuplicate{Check duplicate<br>item code}

    CheckDuplicate -->|Duplicate| DupError[Display error:<br>Item code already exists]
    DupError --> EndDup([End])

    CheckDuplicate -->|Unique| CallAddItem[Call server action:<br>addTemplateItem]
    CallAddItem --> InsertItem[Insert item record<br>Recalculate template total]

    InsertItem -->|Success| LogItem[Log activity:<br>item_added]
    LogItem --> CloseDialog[Close dialog<br>Refresh items list]
    CloseDialog --> ItemSuccess[Display success message]
    ItemSuccess --> EndSuccess([End])

    InsertItem -->|Failure| KeepOpen[Display error<br>Keep dialog open]
    KeepOpen --> EndFail([End])

    style Start fill:#e1f5fe
    style EndSuccess fill:#c8e6c9
    style EndFail fill:#ffcdd2
    style EndDup fill:#ffcdd2
    style ValidateZod fill:#fff3e0
    style CheckDuplicate fill:#fff3e0
```

> **Note**: Advanced pricing features (discount rate, tax rate, tax-inclusive pricing) planned for Phase 2.

---

## 3. Set Default Template Workflow

```mermaid
flowchart TD
    Start([Start]) --> ClickDefault[User clicks<br>'Set as Default']
    ClickDefault --> CheckCurrent{Check current<br>default for dept}

    CheckCurrent -->|None exists| ProceedDirect[Proceed to set<br>default directly]

    CheckCurrent -->|Another exists| ShowConfirm[Display confirmation:<br>'Replace TPL-XX-XXXX<br>as default?']
    ShowConfirm --> UserDecides{User confirms?}

    UserDecides -->|Cancel| EndCancel([End])
    UserDecides -->|Confirm| CallSetDefault

    ProceedDirect --> CallSetDefault[Call server action:<br>setDefaultTemplate]
    CallSetDefault --> BeginTx[BEGIN TRANSACTION]
    BeginTx --> RemovePrev[Remove is_default<br>from previous template]
    RemovePrev --> SetNew[Set is_default=true<br>on selected template]
    SetNew --> LogBoth[Log activity for<br>both templates]
    LogBoth --> CommitTx[COMMIT TRANSACTION]

    CommitTx -->|Success| UpdateUI[Update UI with<br>default indicator]
    UpdateUI --> DefaultSuccess[Display success message]
    DefaultSuccess --> EndSuccess([End])

    CommitTx -->|Failure| RollbackTx[ROLLBACK TRANSACTION]
    RollbackTx --> DefaultError[Display error message]
    DefaultError --> EndFail([End])

    style Start fill:#e1f5fe
    style EndSuccess fill:#c8e6c9
    style EndCancel fill:#e0e0e0
    style EndFail fill:#ffcdd2
    style CheckCurrent fill:#fff3e0
    style UserDecides fill:#fff3e0
```

---

## 4. Template to Purchase Request Conversion

> **Phase 2**: This workflow is planned for a future release. Template→PR conversion is not yet implemented in the current prototype.

```mermaid
flowchart TD
    Start([Start<br>in PR module]) --> ClickUse[User clicks<br>'Use Template']
    ClickUse --> ShowModal[Display template<br>selection modal]
    ShowModal --> SelectTemplate[User selects template]
    SelectTemplate --> OptionalSettings[Optional: Select vendor,<br>delivery date, apply<br>current pricing]
    OptionalSettings --> ConfirmConvert[User confirms conversion]
    ConfirmConvert --> CallConversion[PR module calls<br>template conversion service]
    CallConversion --> ValidateTemplate{Validate template<br>exists & is active}

    ValidateTemplate -->|Invalid| InvalidError[Error: 'Template not<br>active or not found']
    InvalidError --> EndInvalid([End])

    ValidateTemplate -->|Valid| FetchTemplate[Fetch template<br>with all items]
    FetchTemplate --> ApplyPricing{Apply current<br>pricing?}

    ApplyPricing -->|Yes| GetCurrentPrices[For each item, call<br>Vendor Management<br>for current price]
    GetCurrentPrices --> UpdatePrices[Update item prices<br>if different]
    UpdatePrices --> GeneratePR

    ApplyPricing -->|No| GeneratePR[Generate PR number<br>PR-YY-NNNN]

    GeneratePR --> CreatePR[Create PR record:<br>- Description<br>- Department<br>- Type<br>- Status = Draft<br>- Source template ID]
    CreatePR --> CreateItems[Create PR line items<br>from template items]
    CreateItems --> IncrementUsage[Increment template<br>usage_count]
    IncrementUsage --> UpdateLastUsed[Update template<br>last_used_at]
    UpdateLastUsed --> LogConversion[Log activity:<br>template_converted_to_pr]

    LogConversion -->|Success| ReturnPR[Return PR data<br>to calling module]
    ReturnPR --> DisplayPR[PR module displays<br>new PR in Draft status]
    DisplayPR --> EndSuccess([End])

    LogConversion -->|Failure| RollbackAll[Rollback all changes]
    RollbackAll --> ReturnError[Return error to PR module]
    ReturnError --> DisplayError[Display error message]
    DisplayError --> EndFail([End])

    style Start fill:#e1f5fe
    style EndSuccess fill:#c8e6c9
    style EndInvalid fill:#ffcdd2
    style EndFail fill:#ffcdd2
    style ValidateTemplate fill:#fff3e0
    style ApplyPricing fill:#fff3e0
```

---

## 5. Delete Template Workflow

```mermaid
flowchart TD
    Start([Start]) --> ClickDelete[User clicks 'Delete']
    ClickDelete --> CheckDefault{Is template<br>default?}

    CheckDefault -->|Yes| DefaultError[Error: 'Remove default<br>status first']
    DefaultError --> EndDefault([End])

    CheckDefault -->|No| ShowConfirmation[Display confirmation dialog:<br>- Template number<br>- Description<br>- Item count<br>- Warning message]
    ShowConfirmation --> UserConfirms{User confirms<br>deletion?}

    UserConfirms -->|Cancel| EndCancel([End])

    UserConfirms -->|Confirm| CheckRefs{Check for active<br>PR references}

    CheckRefs -->|Has refs| RefError[Error: 'Cannot delete.<br>N active PRs reference it']
    RefError --> EndRef([End])

    CheckRefs -->|No refs| CallDelete[Call server action:<br>deleteTemplate]
    CallDelete --> BeginTx[BEGIN TRANSACTION]
    BeginTx --> SoftDelete[Set template<br>deleted_at = NOW<br>deleted_by = user_id]
    SoftDelete --> CascadeItems[Soft delete all<br>template items - cascade]
    CascadeItems --> LogDelete[Log activity:<br>template_deleted]
    LogDelete --> CommitTx[COMMIT TRANSACTION]

    CommitTx -->|Success| RemoveUI[Remove template<br>from UI list]
    RemoveUI --> NavigateList[Navigate to list<br>if on detail page]
    NavigateList --> DeleteSuccess[Display success message]
    DeleteSuccess --> EndSuccess([End])

    CommitTx -->|Failure| RollbackTx[ROLLBACK TRANSACTION]
    RollbackTx --> DeleteError[Display error message]
    DeleteError --> EndFail([End])

    style Start fill:#e1f5fe
    style EndSuccess fill:#c8e6c9
    style EndCancel fill:#e0e0e0
    style EndDefault fill:#ffcdd2
    style EndRef fill:#ffcdd2
    style EndFail fill:#ffcdd2
    style CheckDefault fill:#fff3e0
    style UserConfirms fill:#fff3e0
    style CheckRefs fill:#fff3e0
```

---

## 6. Clone Template Workflow

```mermaid
flowchart TD
    Start([Start]) --> ClickClone[User clicks 'Clone']
    ClickClone --> FetchSource[Fetch source template<br>with all items]
    FetchSource --> GenerateNum[Generate new template<br>number TPL-YY-NNNN]
    GenerateNum --> CreateClone[Create new template:<br>- New number<br>- Description + ' Copy'<br>- Same department<br>- Same request type<br>- Status = Draft]
    CreateClone --> CopyItems[Copy all items<br>to new template]
    CopyItems --> RecalcTotal[Recalculate<br>estimated total]
    RecalcTotal --> LogClone[Log activity:<br>template_cloned]

    LogClone -->|Success| Navigate[Navigate to new<br>template detail page]
    Navigate --> ShowSuccess[Display success:<br>'Cloned as TPL-YY-NNNN']
    ShowSuccess --> EndSuccess([End])

    LogClone -->|Failure| RollbackClone[Rollback all changes]
    RollbackClone --> ShowError[Display error message]
    ShowError --> EndFail([End])

    style Start fill:#e1f5fe
    style EndSuccess fill:#c8e6c9
    style EndFail fill:#ffcdd2
```

---

## 7. Bulk Operations Workflow

```mermaid
flowchart TD
    Start([Start]) --> SelectMultiple[User selects multiple<br>templates via checkboxes]
    SelectMultiple --> ChooseAction{User selects<br>bulk action}

    ChooseAction -->|Delete Selected| ConfirmDelete[Display confirmation:<br>Delete N templates?]
    ConfirmDelete --> UserConfirmsDel{Confirm?}
    UserConfirmsDel -->|Cancel| EndCancel([End])
    UserConfirmsDel -->|Confirm| LoopDel

    ChooseAction -->|Clone Selected| ConfirmClone[Display confirmation:<br>Clone N templates?]
    ConfirmClone --> UserConfirmsClone{Confirm?}
    UserConfirmsClone -->|Cancel| EndCancel
    UserConfirmsClone -->|Confirm| LoopClone

    %% Delete Process
    LoopDel[For each selected template] --> CheckCanDel{Can delete?<br>Not default,<br>no refs}
    CheckCanDel -->|Yes| DoDelete[Soft delete template]
    CheckCanDel -->|No| RecordFail[Record failure]
    DoDelete --> NextDel{More templates?}
    RecordFail --> NextDel
    NextDel -->|Yes| LoopDel
    NextDel -->|No| ShowResults

    %% Clone Process
    LoopClone[For each selected template] --> DoClone[Clone template<br>with new number]
    DoClone --> NextClone{More templates?}
    NextClone -->|Yes| LoopClone
    NextClone -->|No| ShowResults

    ShowResults[Display summary:<br>Successfully processed<br>X of Y templates] --> DeselectAll[Deselect all templates]
    DeselectAll --> RefreshList[Refresh templates list]
    RefreshList --> EndSuccess([End])

    style Start fill:#e1f5fe
    style EndSuccess fill:#c8e6c9
    style EndCancel fill:#e0e0e0
    style ChooseAction fill:#fff3e0
    style UserConfirmsDel fill:#fff3e0
    style UserConfirmsClone fill:#fff3e0
    style NextDel fill:#fff3e0
    style NextClone fill:#fff3e0
    style CheckCanDel fill:#fff3e0
```

---

## 8. State Machine Diagram

### Template Lifecycle States

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Template

    Draft --> Active: Activate<br>(requires ≥1 item)
    Active --> Inactive: Inactivate<br>(manual)
    Inactive --> Active: Reactivate<br>(manual)

    Draft --> Deleted: Delete<br>(soft delete)
    Inactive --> Deleted: Delete<br>(soft delete)

    note right of Draft
        Initial state for all new templates.
        Can add/edit items freely.
    end note

    note right of Active
        Template can be used to create PRs.
        Default template must be Active.
    end note

    note right of Inactive
        Template not available for PR creation.
        Can be reactivated at any time.
    end note

    note right of Deleted
        Soft deleted templates.
        Retained for 90 days, then archived.
    end note
```

### State Transition Rules

| From State | To State | Condition | Action |
|------------|----------|-----------|--------|
| Draft | Active | Template has ≥1 item | Set status = 'active' |
| Active | Inactive | Manual action | Set status = 'inactive' |
| Inactive | Active | Manual action | Set status = 'active' |
| Draft | Deleted | Not default | Set deleted_at timestamp |
| Inactive | Deleted | Not default, no active PR refs | Set deleted_at timestamp |
| Active | Deleted | Not allowed | Must inactivate first |

---

## 9. Edit Template Workflow

```mermaid
flowchart TD
    Start([Start]) --> ClickEdit[User clicks 'Edit'<br>or navigates with mode=edit]
    ClickEdit --> LoadTemplate[Load template data<br>into form]
    LoadTemplate --> DisplayEdit[Display edit form<br>with current values]
    DisplayEdit --> UserModifies[User modifies:<br>- Description<br>- Request Type<br>- Items via Items tab]
    UserModifies --> ClickSave[User clicks 'Save']
    ClickSave --> ValidateEdit{Validate changes<br>client-side}

    ValidateEdit -->|Invalid| ShowEditErrors[Display validation errors]
    ShowEditErrors --> CorrectEdit[User corrects errors]
    CorrectEdit --> ClickSave

    ValidateEdit -->|Valid| CallUpdate[Call server action:<br>updateTemplate]
    CallUpdate --> UpdateDB[Update template record<br>Set updated_at, updated_by]

    UpdateDB -->|Success| LogUpdate[Log activity:<br>template_updated]
    LogUpdate --> SwitchView[Switch to view mode]
    SwitchView --> EditSuccess[Display success message]
    EditSuccess --> EndSuccess([End])

    UpdateDB -->|Failure| EditError[Display error message]
    EditError --> EndFail([End])

    style Start fill:#e1f5fe
    style EndSuccess fill:#c8e6c9
    style EndFail fill:#ffcdd2
    style ValidateEdit fill:#fff3e0
```

---

## 10. Filter and Search Workflow

```mermaid
flowchart TD
    Start([Start]) --> ViewList[User views templates list]
    ViewList --> ApplyFilters[User applies filters:<br>- Status<br>- Request Type<br>- Department<br>- Search text]
    ApplyFilters --> BuildQuery[Build filter query<br>with AND logic]
    BuildQuery --> ExecuteQuery[Execute filtered query<br>client-side or server]
    ExecuteQuery --> UpdateResults[Update results display]
    UpdateResults --> ShowCount[Show result count:<br>'Showing X of Y templates']
    ShowCount --> WaitAction{User action}

    WaitAction -->|Modify filters| ApplyFilters
    WaitAction -->|Clear filters| ClearAll[Reset all filters<br>to defaults]
    ClearAll --> ExecuteQuery
    WaitAction -->|Select template| Navigate[Navigate to<br>template detail]
    Navigate --> EndNav([End])
    WaitAction -->|Toggle view| SwitchView[Switch between<br>Table / Card view]
    SwitchView --> UpdateResults

    style Start fill:#e1f5fe
    style EndNav fill:#c8e6c9
    style WaitAction fill:#fff3e0
```

---

## Appendix: Mermaid Diagram Legend

### Node Shapes

| Shape | Syntax | Usage |
|-------|--------|-------|
| Rounded rectangle | `([Text])` | Start/End nodes |
| Rectangle | `[Text]` | Process/Action steps |
| Diamond | `{Text}` | Decision points |
| Parallelogram | `[/Text/]` | Input/Output |

### Edge Labels

| Syntax | Meaning |
|--------|---------|
| `-->` | Flow direction |
| `-->\|Label\|` | Conditional branch with label |

### Styling

| Style | Color | Usage |
|-------|-------|-------|
| `fill:#e1f5fe` | Light blue | Start nodes |
| `fill:#c8e6c9` | Light green | Success end |
| `fill:#ffcdd2` | Light red | Error/failure end |
| `fill:#fff3e0` | Light orange | Decision points |
| `fill:#e0e0e0` | Light gray | Cancel/neutral end |

---

**Document End**
