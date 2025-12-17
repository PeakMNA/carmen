# Flow Diagrams: Location Management

## Document Information
- **Module**: System Administration / Location Management
- **Version**: 1.2
- **Last Updated**: 2025-12-17
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-11-26 | Documentation Team | Code compliance review - aligned with BR document, simplified flows |
| 1.2.0 | 2025-12-17 | Documentation Team | Removed Department column from location list - department assignment now managed from Department module |

## Overview

This document provides comprehensive flow diagrams for all Location Management workflows using Mermaid notation. Each diagram illustrates the complete user journey, system interactions, and decision points.

---

## FD-001: Create Location Flow

```mermaid
flowchart TD
    Start([User Opens Location Management]) --> List[Display Location List]
    List --> ClickCreate{User Clicks<br>Create Location}
    ClickCreate --> LoadForm[Load LocationForm Component]
    LoadForm --> DisplayForm[Display Form with Fields:<br>- Code, Name, Description<br>- Type, Status<br>- Physical Count<br>- Department, Cost Center]

    DisplayForm --> FillBasic[User Fills Required Fields]

    FillBasic --> TypeCheck{Location<br>Type?}
    TypeCheck -->|Consignment| ShowVendor[Show Vendor Selection]
    ShowVendor --> ClickSave
    TypeCheck -->|Other| ClickSave[User Clicks Save]

    ClickSave --> ValidateForm{Form<br>Valid?}

    ValidateForm -->|No| ShowErrors[Show Inline Error Messages]
    ShowErrors --> DisplayForm

    ValidateForm -->|Yes| CreateRecord[Create Location in State]
    CreateRecord --> Success[Show Success Message]
    Success --> Navigate[Navigate to Location List]
    Navigate --> End([End])
```

---

## FD-002: Edit Location Flow

```mermaid
flowchart TD
    Start([User on Location List]) --> ClickView[Click Location Row or View Button]
    ClickView --> LoadDetail[Load Location Detail Page]
    LoadDetail --> DisplayTabs[Display Tabbed Interface:<br>General, Shelves, Users,<br>Products, Delivery Points]

    DisplayTabs --> ClickEdit[User Clicks Edit Button]
    ClickEdit --> EnableEdit[Set isEditing = true]
    EnableEdit --> TabsEditable[All Tabs Become Editable]

    TabsEditable --> UserAction{User<br>Action}
    UserAction -->|Modify General| EditGeneral[Edit Name, Description,<br>Type, Status, Organization]
    UserAction -->|Modify Shelves| EditShelves[Add/Edit/Delete Shelves]
    UserAction -->|Modify Users| EditUsers[Assign/Remove Users]
    UserAction -->|Modify Products| EditProducts[Assign/Remove Products]
    UserAction -->|Modify Delivery| EditDelivery[Add/Edit/Delete<br>Delivery Points]

    EditGeneral --> ClickSave
    EditShelves --> ClickSave
    EditUsers --> ClickSave
    EditProducts --> ClickSave
    EditDelivery --> ClickSave[User Clicks Save]

    ClickSave --> ValidateChanges{Validation<br>Passes?}
    ValidateChanges -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> TabsEditable

    ValidateChanges -->|Yes| UpdateRecord[Update Location State]
    UpdateRecord --> DisableEdit[Set isEditing = false]
    DisableEdit --> ShowSuccess[Show Success Message]
    ShowSuccess --> RefreshDetail[Refresh Detail View]
    RefreshDetail --> End([End])
```

---

## FD-003: View Location Detail Flow

```mermaid
flowchart TD
    Start([User on Location List]) --> SearchFilter{Search/<br>Filter?}
    SearchFilter -->|Yes| EnterSearch[Enter Search Term]
    EnterSearch --> ApplyFilters[Apply Type/Status/Count Filters]
    ApplyFilters --> ShowResults[Show Filtered Results]
    ShowResults --> ClickView

    SearchFilter -->|No| ClickView[Click Location Row]

    ClickView --> FetchLocation[Load Location Data]
    FetchLocation --> DisplayDetail[Display Location Detail Page]

    DisplayDetail --> ShowTabs[Display 5 Tabs]

    ShowTabs --> GeneralTab[General Tab:<br>- Basic Information<br>- Type & Status<br>- Organization<br>- Address<br>- Audit Info]

    ShowTabs --> ShelvesTab[Shelves Tab:<br>- Shelf Table<br>- Add/Edit/Delete]

    ShowTabs --> UsersTab[Users Tab:<br>- Assigned Users<br>- Roles & Permissions]

    ShowTabs --> ProductsTab[Products Tab:<br>- Assigned Products<br>- Inventory Parameters]

    ShowTabs --> DeliveryTab[Delivery Points Tab:<br>- Delivery Addresses<br>- Contact Info]

    GeneralTab --> UserAction{User<br>Action}
    ShelvesTab --> UserAction
    UsersTab --> UserAction
    ProductsTab --> UserAction
    DeliveryTab --> UserAction

    UserAction -->|Back| GoBack[Navigate to Location List]
    GoBack --> End([End])

    UserAction -->|Edit| TriggerEdit[Enter Edit Mode<br>See FD-002]
    TriggerEdit --> End

    UserAction -->|Delete| TriggerDelete[Trigger Delete Flow<br>See FD-004]
    TriggerDelete --> End
```

---

## FD-004: Delete Location Flow

```mermaid
flowchart TD
    Start([User Triggers Delete]) --> CheckProducts{Has Assigned<br>Products?}

    CheckProducts -->|Yes| BlockDelete[Show Error:<br>Cannot delete location<br>with assigned products]
    BlockDelete --> End([End])

    CheckProducts -->|No| OpenDialog[Open Confirmation Dialog:<br>Delete Location?<br>This action cannot be undone]

    OpenDialog --> UserChoice{User<br>Choice}

    UserChoice -->|Cancel| CloseDialog[Close Dialog]
    CloseDialog --> End

    UserChoice -->|Confirm Delete| DeleteLocation[Remove Location from State]
    DeleteLocation --> ShowSuccess[Show Success Toast:<br>Location Deleted]
    ShowSuccess --> RefreshList[Refresh Location List]
    RefreshList --> End
```

---

## FD-005: Search and Filter Flow

```mermaid
flowchart TD
    Start([User on Location List]) --> InitialDisplay[Display All Locations]

    InitialDisplay --> SearchAction{User<br>Action}

    SearchAction -->|Enter Search| CaptureSearch[Capture Search Input:<br>Real-time onChange]
    CaptureSearch --> FilterBySearch[Filter Locations by:<br>- Name<br>- Code<br>- Description<br>- Department Name]
    FilterBySearch --> ApplyOtherFilters

    SearchAction -->|Select Type| SelectType[Select from Dropdown:<br>- All Types<br>- Inventory<br>- Direct<br>- Consignment]
    SelectType --> ApplyOtherFilters

    SearchAction -->|Select Status| SelectStatus[Select from Dropdown:<br>- All Status<br>- Active<br>- Inactive<br>- Closed<br>- Pending Setup]
    SelectStatus --> ApplyOtherFilters

    SearchAction -->|Select Physical Count| SelectCount[Select from Dropdown:<br>- All<br>- Count Enabled<br>- Count Disabled]
    SelectCount --> ApplyOtherFilters

    ApplyOtherFilters[Apply All Filters<br>with AND Logic]
    ApplyOtherFilters --> RecalculateResults[Recalculate Filtered List<br>using useMemo]

    RecalculateResults --> ApplySort{Current<br>Sort?}
    ApplySort -->|Has Sort| SortResults[Sort by Field & Direction]
    ApplySort -->|No Sort| DisplayResults
    SortResults --> DisplayResults[Display Filtered Results]

    DisplayResults --> ShowCount[Show Count:<br>Showing X of Y locations]
    ShowCount --> HasResults{Has<br>Results?}

    HasResults -->|Yes| RenderView{View<br>Mode?}
    RenderView -->|Table| ShowTable[Render Table View]
    RenderView -->|Card| ShowCards[Render Card Grid]

    HasResults -->|No| ShowEmpty[Show Empty State]

    ShowTable --> End([End])
    ShowCards --> End
    ShowEmpty --> End
```

---

## FD-006: Sort Location List Flow

```mermaid
flowchart TD
    Start([User on Location List<br>Table View]) --> InitialSort[Default Sort:<br>Name ASC]
    InitialSort --> DisplayList[Display Sorted List<br>with Sort Indicator]

    DisplayList --> UserClick{User Clicks<br>Column Header}

    UserClick -->|Same Column| CheckDirection{Current<br>Direction?}
    CheckDirection -->|ASC| ReverseSort[Change to DESC]
    CheckDirection -->|DESC| ChangeToASC[Change to ASC]
    ReverseSort --> UpdateIcon[Update Sort Indicator]
    ChangeToASC --> UpdateIcon

    UserClick -->|Different Column| NewSort[Change Sort Field]
    NewSort --> DefaultASC[Set Direction to ASC]
    DefaultASC --> UpdateIcon

    UpdateIcon --> ReSort[Re-sort Filtered Data]
    ReSort --> UpdateDisplay[Update Table Display]
    UpdateDisplay --> MaintainFilters[Filters Remain Active]
    MaintainFilters --> End([End])

    Note1[Sortable Columns:<br>- Code<br>- Name<br>- Type<br>- Status<br>- Shelves Count<br>- Products Count<br>- Users Count]
```

---

## FD-007: Toggle View Mode Flow

```mermaid
flowchart TD
    Start([User on Location List]) --> DefaultView[Default: Table View]
    DefaultView --> ShowToggle[Show View Toggle Buttons:<br>- Table Icon<br>- Grid Icon]

    ShowToggle --> UserClick{User<br>Clicks}

    UserClick -->|Table Icon| IsTable{Current<br>Mode?}
    IsTable -->|Already Table| NoChange[No Change]
    NoChange --> End([End])

    IsTable -->|Card Mode| SwitchToTable[Switch to Table Mode]
    SwitchToTable --> ShowTableView[Render Table View:<br>- Sortable columns<br>- Row actions<br>- Checkbox selection]
    ShowTableView --> PreserveState

    UserClick -->|Grid Icon| IsCard{Current<br>Mode?}
    IsCard -->|Already Card| NoChange

    IsCard -->|Table Mode| SwitchToCard[Switch to Card Mode]
    SwitchToCard --> ShowCardView[Render Card Grid:<br>- Responsive grid<br>- Card layout<br>- Card actions]
    ShowCardView --> PreserveState[Preserve Filter State]

    PreserveState --> PreserveSort[Preserve Sort State]
    PreserveSort --> ShowSameData[Display Same Filtered<br>and Sorted Results]
    ShowSameData --> End
```

---

## FD-008: Shelf Management Flow

```mermaid
flowchart TD
    Start([User on Shelves Tab]) --> DisplayShelves{Has<br>Shelves?}

    DisplayShelves -->|Yes| ShowTable[Display Shelf Table:<br>Code, Name, Status, Actions]
    DisplayShelves -->|No| ShowEmpty[Show Empty State:<br>No shelves configured]

    ShowTable --> UserAction{User<br>Action}
    ShowEmpty --> UserAction

    UserAction -->|Add Shelf| ClickAdd[Click Add Shelf Button]
    ClickAdd --> OpenAddDialog[Open Add Shelf Dialog]
    OpenAddDialog --> FillShelf[Enter Code and Name]
    FillShelf --> ClickSaveShelf[Click Add Shelf]
    ClickSaveShelf --> ValidateShelf{Valid?}
    ValidateShelf -->|No| ShowShelfErrors[Show Validation Errors]
    ShowShelfErrors --> FillShelf
    ValidateShelf -->|Yes| AddToList[Add Shelf to List]
    AddToList --> CloseDialog[Close Dialog]
    CloseDialog --> RefreshTable[Refresh Shelf Table]
    RefreshTable --> End([End])

    UserAction -->|Edit Shelf| ClickEdit[Click Edit in Dropdown]
    ClickEdit --> OpenEditDialog[Open Edit Shelf Dialog]
    OpenEditDialog --> ModifyShelf[Modify Code or Name]
    ModifyShelf --> ClickUpdate[Click Save Changes]
    ClickUpdate --> UpdateShelf[Update Shelf in List]
    UpdateShelf --> CloseDialog

    UserAction -->|Delete Shelf| ClickDelete[Click Delete in Dropdown]
    ClickDelete --> ConfirmDelete[Confirm Deletion]
    ConfirmDelete --> RemoveShelf[Remove from List]
    RemoveShelf --> RefreshTable
```

---

## FD-009: User Assignment Flow

```mermaid
flowchart TD
    Start([User on Users Tab]) --> DisplayUsers[Display User Assignments Table]
    DisplayUsers --> UserAction{User<br>Action}

    UserAction -->|Add User| ClickAdd[Click Assign User Button]
    ClickAdd --> OpenDialog[Open User Selection Dialog]
    OpenDialog --> SearchUser[Search Available Users]
    SearchUser --> SelectUser[Select User from List]
    SelectUser --> SelectRole[Select Role at Location]
    SelectRole --> SetPermissions[Configure Permissions]
    SetPermissions --> MarkPrimary{Set as<br>Primary?}
    MarkPrimary -->|Yes| SetPrimary[Mark as Primary Location]
    MarkPrimary -->|No| SaveAssignment
    SetPrimary --> SaveAssignment[Click Assign]
    SaveAssignment --> AddToAssigned[Add to Assigned Users]
    AddToAssigned --> CloseDialog[Close Dialog]
    CloseDialog --> RefreshTable[Refresh Users Table]
    RefreshTable --> End([End])

    UserAction -->|Edit Assignment| ClickEdit[Click Edit Action]
    ClickEdit --> OpenEditDialog[Open Edit Dialog]
    OpenEditDialog --> ModifyRole[Modify Role/Permissions]
    ModifyRole --> SaveEdit[Save Changes]
    SaveEdit --> UpdateAssignment[Update Assignment]
    UpdateAssignment --> CloseDialog

    UserAction -->|Remove User| ClickRemove[Click Remove Action]
    ClickRemove --> ConfirmRemove[Confirm Removal]
    ConfirmRemove --> RemoveAssignment[Remove from List]
    RemoveAssignment --> RefreshTable
```

---

## FD-010: Product Assignment Flow

```mermaid
flowchart TD
    Start([User on Products Tab]) --> DisplayProducts[Display Product Assignments]
    DisplayProducts --> UserAction{User<br>Action}

    UserAction -->|Add Product| ClickAdd[Click Assign Product Button]
    ClickAdd --> OpenDialog[Open Product Selection Dialog]
    OpenDialog --> SearchProduct[Search Products by Name/Code]
    SearchProduct --> SelectProduct[Select Product from Catalog]
    SelectProduct --> SetParameters[Set Inventory Parameters:<br>- Min Quantity<br>- Max Quantity<br>- Reorder Point<br>- PAR Level]
    SetParameters --> SelectShelf[Select Default Shelf]
    SelectShelf --> SaveAssignment[Click Assign]
    SaveAssignment --> AddToAssigned[Add to Assigned Products]
    AddToAssigned --> CloseDialog[Close Dialog]
    CloseDialog --> RefreshTable[Refresh Products Table]
    RefreshTable --> End([End])

    UserAction -->|Edit Parameters| ClickEdit[Click Edit Action]
    ClickEdit --> OpenEditDialog[Open Edit Dialog]
    OpenEditDialog --> ModifyParams[Modify Parameters/Shelf]
    ModifyParams --> SaveEdit[Save Changes]
    SaveEdit --> UpdateAssignment[Update Assignment]
    UpdateAssignment --> CloseDialog

    UserAction -->|Remove Product| ClickRemove[Click Remove Action]
    ClickRemove --> ConfirmRemove[Confirm Removal]
    ConfirmRemove --> RemoveAssignment[Remove from List]
    RemoveAssignment --> RefreshTable
```

---

## FD-011: Delivery Point Management Flow

```mermaid
flowchart TD
    Start([User on Delivery Points Tab]) --> DisplayPoints{Has Delivery<br>Points?}

    DisplayPoints -->|Yes| ShowTable[Display Delivery Points Table]
    DisplayPoints -->|No| ShowEmpty[Show Empty State]

    ShowTable --> UserAction{User<br>Action}
    ShowEmpty --> UserAction

    UserAction -->|Add Point| ClickAdd[Click Add Delivery Point]
    ClickAdd --> OpenDialog[Open Add Dialog]
    OpenDialog --> FillDetails[Fill Details:<br>- Name, Code, Address<br>- Contact Info<br>- Instructions<br>- Logistics Settings]
    FillDetails --> SetPrimary{Set as<br>Primary?}
    SetPrimary -->|Yes| MarkPrimary[Mark as Primary]
    SetPrimary -->|No| SavePoint
    MarkPrimary --> SavePoint[Click Save]
    SavePoint --> ValidatePoint{Valid?}
    ValidatePoint -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> FillDetails
    ValidatePoint -->|Yes| AddToList[Add to List]
    AddToList --> CloseDialog[Close Dialog]
    CloseDialog --> RefreshTable[Refresh Table]
    RefreshTable --> End([End])

    UserAction -->|Edit Point| ClickEdit[Click Edit Action]
    ClickEdit --> OpenEditDialog[Open Edit Dialog]
    OpenEditDialog --> ModifyDetails[Modify Details]
    ModifyDetails --> UpdatePoint[Save Changes]
    UpdatePoint --> CloseDialog

    UserAction -->|Delete Point| ClickDelete[Click Delete Action]
    ClickDelete --> ConfirmDelete[Confirm Deletion]
    ConfirmDelete --> RemovePoint[Remove from List]
    RemovePoint --> RefreshTable
```

---

## FD-012: Bulk Actions Flow

```mermaid
flowchart TD
    Start([User on Location List]) --> SelectLocations[Select Locations via Checkboxes]
    SelectLocations --> ShowSelected[Show: X location(s) selected]
    ShowSelected --> BulkAction{Select<br>Bulk Action}

    BulkAction -->|Activate| ConfirmActivate[Confirm Activation]
    ConfirmActivate --> ActivateAll[Set Status = Active for Selected]
    ActivateAll --> ShowSuccess[Show Success Message]
    ShowSuccess --> ClearSelection[Clear Selection]
    ClearSelection --> RefreshList[Refresh List]
    RefreshList --> End([End])

    BulkAction -->|Deactivate| ConfirmDeactivate[Confirm Deactivation]
    ConfirmDeactivate --> DeactivateAll[Set Status = Inactive for Selected]
    DeactivateAll --> ShowSuccess

    BulkAction -->|Delete| CheckProducts{Any Have<br>Products?}
    CheckProducts -->|Yes| ShowWarning[Show Warning:<br>Some locations have products]
    ShowWarning --> End
    CheckProducts -->|No| ConfirmDelete[Confirm Deletion]
    ConfirmDelete --> DeleteAll[Delete Selected Locations]
    DeleteAll --> ShowSuccess

    BulkAction -->|Clear Selection| ClearAll[Clear All Selections]
    ClearAll --> RefreshList

    BulkAction -->|Export CSV| GenerateCSV[Generate CSV File]
    GenerateCSV --> DownloadCSV[Download CSV]
    DownloadCSV --> End

    BulkAction -->|Print| OpenPrint[Open Browser Print Dialog]
    OpenPrint --> End
```

---

## Workflow Summary

### Critical Paths

1. **Create Location**: FD-001 (4-6 steps)
2. **Edit Location**: FD-002 (6-8 steps with tabbed interface)
3. **View Details**: FD-003 (3-4 steps)
4. **Delete Location**: FD-004 (3-5 steps with validation)
5. **Search & Filter**: FD-005 (2-4 steps for each filter)

### Tab-Based Workflows

- **Shelf Management**: FD-008 (Add/Edit/Delete shelves)
- **User Assignment**: FD-009 (Assign users with roles)
- **Product Assignment**: FD-010 (Assign products with parameters)
- **Delivery Points**: FD-011 (Manage delivery addresses)

### Bulk Operations

- **Bulk Actions**: FD-012 (Activate/Deactivate/Delete/Export/Print)

### Integration Points

**With User Management**:
- FD-009: User assignment workflow

**With Product Management**:
- FD-010: Product assignment workflow

**With Vendor Management**:
- FD-001, FD-002: Consignment vendor selection

### Error Handling Flows

All flows include error handling for:
- Validation errors (inline display)
- Business rule violations (cannot delete with products)
- Network errors (toast notifications)
