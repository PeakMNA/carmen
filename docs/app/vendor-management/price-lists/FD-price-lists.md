# Price Lists - Flow Diagrams (FD)

## Document Information
- **Document Type**: Flow Diagrams Document
- **Module**: Vendor Management > Price Lists
- **Version**: 2.0.0
- **Last Updated**: 2025-11-26
- **Document Status**: Updated

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.0.0 | 2025-11-26 | System | Complete rewrite to match BR v2.0.0 and actual code; Removed fictional flow diagrams (5-step wizard, bulk import, price comparison, approval workflows, price alerts, RFQ integration, scheduled jobs); Updated to reflect implemented functionality using Mermaid 8.8.2 syntax |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

**Note**: This document uses Mermaid 8.8.2 syntax for all diagrams. It reflects the actual implemented flows only.

---

## 1. Introduction

This document provides visual representations of workflows and processes in the Price Lists module using Mermaid diagrams. These diagrams complement the use cases and technical specifications by illustrating the flow of operations, decision points, and system interactions.

The Price Lists module enables procurement staff to view, create, and manage vendor price lists with MOQ-based pricing tiers.

---

## 2. System Architecture Diagram

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph 'Frontend Layer'
        UI[Next.js UI Components]
        Forms[React Hook Form + Zod]
        State[useState + useMemo]
    end

    subgraph 'Application Layer'
        Pages[Client Components]
        Actions[Event Handlers]
    end

    subgraph 'Data Layer'
        MockData[Mock Data - lib/mock-data]
        Types[TypeScript Interfaces]
    end

    UI --> Pages
    Forms --> Actions
    State --> Actions
    Pages --> Actions
    Actions --> MockData
    MockData --> Types
```

---

## 3. Navigation Flow

### 3.1 Module Navigation

```mermaid
graph LR
    Sidebar[Sidebar Navigation] --> VendorMgmt[Vendor Management]
    VendorMgmt --> PriceLists[Price Lists]
    PriceLists --> ListPage['/vendor-management/pricelists']
    ListPage --> AddPage['/vendor-management/pricelists/add']
    ListPage --> DetailPage['/vendor-management/pricelists/[id]']
```

### 3.2 Page Navigation Flow

```mermaid
graph TD
    ListPage[Price Lists Page] -->|Click Add New| AddPage[Add Price List Page]
    ListPage -->|Click Row/View| DetailPage[Price List Detail Page]
    AddPage -->|Cancel| ListPage
    AddPage -->|Save Success| DetailPage
    DetailPage -->|Back Button| ListPage
    DetailPage -->|Duplicate| AddPage
```

---

## 4. Price List Page Flows

### 4.1 View Price Lists Flow

```mermaid
graph TD
    Start([User Opens Page]) --> LoadData[Load Price List Data]
    LoadData --> ApplyFilters[Apply Default Filters]
    ApplyFilters --> RenderList[Render List View]
    RenderList --> UserAction{User Action?}

    UserAction -->|Search| FilterByName[Filter by Name]
    UserAction -->|Filter Status| FilterByStatus[Filter by Status]
    UserAction -->|Filter Vendor| FilterByVendor[Filter by Vendor]
    UserAction -->|Toggle View| ToggleView[Switch Table/Card View]
    UserAction -->|Click Row| NavigateDetail[Navigate to Detail]
    UserAction -->|Add New| NavigateAdd[Navigate to Add Page]
    UserAction -->|Actions Menu| ShowActions[Show Actions Dropdown]

    FilterByName --> UpdateList[Update Displayed List]
    FilterByStatus --> UpdateList
    FilterByVendor --> UpdateList
    ToggleView --> RenderList
    UpdateList --> RenderList

    NavigateDetail --> End([Detail Page])
    NavigateAdd --> End2([Add Page])
    ShowActions --> ActionChoice{Action Choice}

    ActionChoice -->|View| NavigateDetail
    ActionChoice -->|Edit| NavigateDetail
    ActionChoice -->|Duplicate| DuplicateFlow[Copy to SessionStorage]
    ActionChoice -->|Export| ExportFlow[Trigger Download]
    ActionChoice -->|Mark Expired| UpdateStatus[Update Status]
    ActionChoice -->|Delete| DeleteFlow[Show Confirmation]

    DuplicateFlow --> NavigateAdd
    ExportFlow --> RenderList
    UpdateStatus --> RenderList
    DeleteFlow --> ConfirmDelete{Confirm?}
    ConfirmDelete -->|Yes| RemoveRecord[Remove Price List]
    ConfirmDelete -->|No| RenderList
    RemoveRecord --> ShowToast[Show Success Toast]
    ShowToast --> RenderList
```

### 4.2 Filter Logic Flow

```mermaid
graph TD
    AllData[All Price Lists] --> SearchFilter{Search Applied?}

    SearchFilter -->|Yes| FilterName[Filter by Name Contains]
    SearchFilter -->|No| PassThrough1[Pass All]

    FilterName --> StatusFilter{Status Filter?}
    PassThrough1 --> StatusFilter

    StatusFilter -->|Yes| FilterStatus[Filter by Status Match]
    StatusFilter -->|No| PassThrough2[Pass All]

    FilterStatus --> VendorFilter{Vendor Filter?}
    PassThrough2 --> VendorFilter

    VendorFilter -->|Yes| FilterVendor[Filter by Vendor Match]
    VendorFilter -->|No| PassThrough3[Pass All]

    FilterVendor --> FilteredResults[Filtered Results]
    PassThrough3 --> FilteredResults

    FilteredResults --> Display[Display in UI]
```

---

## 5. Create Price List Flow

### 5.1 Main Creation Flow

```mermaid
graph TD
    Start([User Clicks Add New]) --> LoadForm[Display Add Form]
    LoadForm --> LoadDropdowns[Load Vendor/Product/Currency Options]
    LoadDropdowns --> UserEnters[User Enters Basic Info]

    UserEnters --> SelectVendor[Select Vendor]
    SelectVendor --> SelectCurrency[Select Currency]
    SelectCurrency --> SetDates[Set Valid From/To Dates]
    SetDates --> EnterNotes[Enter Notes - Optional]

    EnterNotes --> AddItems{Add Line Items?}
    AddItems -->|Yes| ClickAddItem[Click Add Item Button]
    ClickAddItem --> AddRow[Add New Row to Table]
    AddRow --> SelectProduct[Select Product]
    SelectProduct --> EnterMOQ[Enter MOQ - Optional]
    EnterMOQ --> SelectUnit[Select Unit]
    SelectUnit --> EnterPrice[Enter Unit Price]
    EnterPrice --> EnterLeadTime[Enter Lead Time - Optional]
    EnterLeadTime --> EnterItemNotes[Enter Item Notes - Optional]
    EnterItemNotes --> MoreItems{More Items?}
    MoreItems -->|Yes| ClickAddItem
    MoreItems -->|No| AddItems

    AddItems -->|No| ClickSave[Click Save Button]
    ClickSave --> Validate[Validate Form]
    Validate --> ValidCheck{Valid?}

    ValidCheck -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> UserEnters

    ValidCheck -->|Yes| CreateRecord[Create Price List Record]
    CreateRecord --> ShowSuccess[Show Success Toast]
    ShowSuccess --> NavigateDetail[Navigate to Detail Page]
    NavigateDetail --> End([End])
```

### 5.2 Form Validation Flow

```mermaid
graph TD
    SubmitForm[Submit Form] --> CheckRequired[Check Required Fields]

    CheckRequired --> VendorCheck{Vendor Selected?}
    VendorCheck -->|No| AddError1[Add Vendor Error]
    VendorCheck -->|Yes| CurrencyCheck{Currency Selected?}

    CurrencyCheck -->|No| AddError2[Add Currency Error]
    CurrencyCheck -->|Yes| DateCheck{Start Date Set?}

    DateCheck -->|No| AddError3[Add Start Date Error]
    DateCheck -->|Yes| EndDateCheck{End Date After Start?}

    EndDateCheck -->|No, End Date Set| AddError4[Add Date Range Error]
    EndDateCheck -->|Yes or No End Date| PriceCheck[Check Line Item Prices]

    AddError1 --> CollectErrors[Collect All Errors]
    AddError2 --> CollectErrors
    AddError3 --> CollectErrors
    AddError4 --> CollectErrors

    PriceCheck --> PricesPositive{All Prices Positive?}
    PricesPositive -->|No| AddError5[Add Price Error]
    AddError5 --> CollectErrors
    PricesPositive -->|Yes| CheckErrors{Any Errors?}

    CollectErrors --> CheckErrors

    CheckErrors -->|Yes| DisplayErrors[Display Inline Errors]
    CheckErrors -->|No| ProceedSave[Proceed with Save]

    DisplayErrors --> End1([Return to Form])
    ProceedSave --> End2([Create Record])
```

---

## 6. Price List Detail Flow

### 6.1 View Detail Flow

```mermaid
graph TD
    Start([User Opens Detail Page]) --> ExtractId[Extract ID from URL]
    ExtractId --> LoadData[Load Price List by ID]
    LoadData --> DataFound{Data Found?}

    DataFound -->|No| ShowError[Show Not Found Error]
    ShowError --> OfferBack[Offer Navigate Back]
    OfferBack --> End1([End])

    DataFound -->|Yes| RenderHeader[Render Header Section]
    RenderHeader --> RenderInfoGrid[Render Info Grid]
    RenderInfoGrid --> RenderLineItems[Render Line Items Table]
    RenderLineItems --> RenderActions[Render Action Buttons]
    RenderActions --> WaitAction[Wait for User Action]

    WaitAction --> ActionChoice{Action?}

    ActionChoice -->|Back| NavigateList[Navigate to List Page]
    ActionChoice -->|Edit| EnterEditMode[Enter Edit Mode]
    ActionChoice -->|Duplicate| CopyData[Copy Data to SessionStorage]
    ActionChoice -->|Export| TriggerDownload[Trigger File Download]
    ActionChoice -->|Delete| ShowDeleteDialog[Show Delete Confirmation]

    NavigateList --> End2([List Page])
    EnterEditMode --> EditFlow[Edit Flow]
    CopyData --> NavigateAdd[Navigate to Add Page]
    NavigateAdd --> End3([Add Page with Pre-fill])
    TriggerDownload --> WaitAction

    ShowDeleteDialog --> ConfirmDelete{Confirm?}
    ConfirmDelete -->|No| WaitAction
    ConfirmDelete -->|Yes| DeleteRecord[Delete Price List]
    DeleteRecord --> ShowSuccess[Show Success Toast]
    ShowSuccess --> NavigateList
```

### 6.2 Actions Menu Flow

```mermaid
graph TD
    ClickActions[Click Actions Menu] --> ShowDropdown[Show Dropdown Menu]
    ShowDropdown --> SelectAction{Select Action}

    SelectAction -->|View| GoDetail[Navigate to Detail]
    SelectAction -->|Edit| GoDetailEdit[Navigate to Detail - Edit Mode]
    SelectAction -->|Duplicate| CopySession[Copy to SessionStorage]
    SelectAction -->|Export| DownloadFile[Download Export File]
    SelectAction -->|Mark Expired| UpdateExpired[Update Status to Expired]
    SelectAction -->|Delete| ShowConfirm[Show Confirmation Dialog]

    CopySession --> GoAdd[Navigate to Add Page]
    UpdateExpired --> ShowToast[Show Success Toast]
    ShowConfirm --> UserConfirm{User Confirms?}
    UserConfirm -->|Yes| DeleteItem[Delete Price List]
    UserConfirm -->|No| CloseDialog[Close Dialog]
    DeleteItem --> RefreshList[Refresh List]
```

---

## 7. Duplicate Price List Flow

### 7.1 Duplicate Flow

```mermaid
graph TD
    Start([User Clicks Duplicate]) --> GetCurrentData[Get Current Price List Data]
    GetCurrentData --> ClearDates[Clear Date Fields]
    ClearDates --> SetDraft[Set Status to Draft]
    SetDraft --> StoreSession[Store in SessionStorage]
    StoreSession --> Navigate[Navigate to Add Page]
    Navigate --> LoadSession[Load Data from SessionStorage]
    LoadSession --> PreFillForm[Pre-fill Form Fields]
    PreFillForm --> ClearSession[Clear SessionStorage]
    ClearSession --> UserModify[User Modifies as Needed]
    UserModify --> SaveNew[Save as New Price List]
    SaveNew --> End([New Price List Created])
```

---

## 8. State Management Flow

### 8.1 Filter State Flow

```mermaid
graph TD
    InitState[Initialize State] --> DefaultValues[Set Default Values]
    DefaultValues --> SearchEmpty['searchTerm = ''']
    SearchEmpty --> StatusAll['statusFilter = 'all'']
    StatusAll --> VendorAll['vendorFilter = 'all'']
    VendorAll --> TableView['viewMode = 'table'']

    TableView --> UserInteraction{User Interaction}

    UserInteraction -->|Type Search| UpdateSearch[Update searchTerm]
    UserInteraction -->|Select Status| UpdateStatus[Update statusFilter]
    UserInteraction -->|Select Vendor| UpdateVendor[Update vendorFilter]
    UserInteraction -->|Toggle View| UpdateView[Update viewMode]

    UpdateSearch --> TriggerFilter[Trigger useMemo Filter]
    UpdateStatus --> TriggerFilter
    UpdateVendor --> TriggerFilter
    UpdateView --> ReRender[Re-render Component]

    TriggerFilter --> ComputeFiltered[Compute filteredPriceLists]
    ComputeFiltered --> ReRender
```

### 8.2 Form State Flow

```mermaid
graph TD
    InitForm[Initialize Form] --> SetDefaults[Set Default Values]
    SetDefaults --> EmptyBasicInfo[Empty Basic Info Fields]
    EmptyBasicInfo --> EmptyLineItems[Empty Line Items Array]

    EmptyLineItems --> UserInput{User Input}

    UserInput -->|Basic Field Change| UpdateField[Update Field Value]
    UserInput -->|Add Line Item| AddRow[Add Item to Array]
    UserInput -->|Remove Line Item| RemoveRow[Remove Item from Array]
    UserInput -->|Edit Line Item| UpdateRow[Update Item in Array]

    UpdateField --> ReValidate[Re-validate Field]
    AddRow --> ReRender[Re-render Form]
    RemoveRow --> ReRender
    UpdateRow --> ReValidate

    ReValidate --> UpdateErrors[Update Error State]
    UpdateErrors --> ReRender
```

---

## 9. Component Hierarchy

### 9.1 Price List Page Components

```mermaid
graph TD
    PriceListsPage[PriceListsPage] --> Card[Card Component]
    Card --> CardHeader[CardHeader]
    Card --> CardContent[CardContent]

    CardHeader --> Title[Title + Subtitle]
    CardHeader --> ExportBtn[Export Button]
    CardHeader --> AddBtn[Add New Button]

    CardContent --> FilterBar[Filter Bar]
    CardContent --> ViewToggle[View Toggle]
    CardContent --> ListView{View Mode}

    FilterBar --> SearchInput[Search Input]
    FilterBar --> StatusSelect[Status Select]
    FilterBar --> VendorSelect[Vendor Select]

    ViewToggle --> TableIcon[Table Icon]
    ViewToggle --> CardIcon[Card Icon]

    ListView -->|Table| TableView[Table Component]
    ListView -->|Card| CardGrid[Card Grid]

    TableView --> TableHeader[Table Header]
    TableView --> TableBody[Table Body]
    TableBody --> TableRow[Table Row]
    TableRow --> ActionsDropdown[Actions Dropdown Menu]

    CardGrid --> PriceListCard[Price List Card]
    PriceListCard --> CardActions[Card Action Buttons]
```

### 9.2 Add Page Components

```mermaid
graph TD
    AddPriceListPage[AddPriceListPage] --> FormCard[Form Card]
    FormCard --> FormHeader[Form Header]
    FormCard --> BasicInfoSection[Basic Info Section]
    FormCard --> LineItemsSection[Line Items Section]
    FormCard --> ActionButtons[Action Buttons]

    BasicInfoSection --> NumberInput[Price List Number Input]
    BasicInfoSection --> VendorSelect[Vendor Select]
    BasicInfoSection --> CurrencySelect[Currency Select]
    BasicInfoSection --> DatePickers[Date Pickers]
    BasicInfoSection --> NotesTextarea[Notes Textarea]

    LineItemsSection --> AddItemBtn[Add Item Button]
    LineItemsSection --> ItemsTable[Items Table]
    ItemsTable --> ItemRow[Item Row]
    ItemRow --> ProductSelect[Product Select]
    ItemRow --> MOQInput[MOQ Input]
    ItemRow --> UnitSelect[Unit Select]
    ItemRow --> PriceInput[Price Input]
    ItemRow --> LeadTimeInput[Lead Time Input]
    ItemRow --> ItemNotesInput[Item Notes Input]
    ItemRow --> RemoveBtn[Remove Button]

    ActionButtons --> CancelBtn[Cancel Button]
    ActionButtons --> SaveBtn[Save Button]
```

### 9.3 Detail Page Components

```mermaid
graph TD
    DetailPage[PriceListDetailPage] --> BackBtn[Back Navigation Button]
    DetailPage --> HeaderSection[Header Section]
    DetailPage --> InfoGrid[Info Grid]
    DetailPage --> ItemsTable[Line Items Table]
    DetailPage --> ActionBtns[Action Buttons]

    HeaderSection --> PriceListName[Price List Name]
    HeaderSection --> VendorName[Vendor Name]
    HeaderSection --> StatusBadge[Status Badge]

    InfoGrid --> ValidityInfo[Validity Period]
    InfoGrid --> CurrencyInfo[Currency]
    InfoGrid --> ItemsCount[Total Items]
    InfoGrid --> CreatedBy[Created By]
    InfoGrid --> ApprovedBy[Approved By]
    InfoGrid --> Notes[Notes]

    ItemsTable --> ItemColumns[Item Columns]
    ItemColumns --> CodeCol[Item Code]
    ItemColumns --> NameCol[Item Name]
    ItemColumns --> DescCol[Description]
    ItemColumns --> UnitCol[Unit]
    ItemColumns --> PriceCol[Unit Price]
    ItemColumns --> MOQCol[MOQ]
    ItemColumns --> LeadCol[Lead Time]

    ActionBtns --> EditBtn[Edit Button]
    ActionBtns --> DuplicateBtn[Duplicate Button]
    ActionBtns --> ExportBtn[Export Button]
    ActionBtns --> DeleteBtn[Delete Button]
```

---

## 10. Status Display Flow

### 10.1 Status Badge Rendering

```mermaid
graph TD
    GetStatus[Get Price List Status] --> CheckStatus{Status Value}

    CheckStatus -->|active| GreenBadge[Green Badge]
    CheckStatus -->|expired| RedBadge[Red Badge]
    CheckStatus -->|pending| YellowBadge[Yellow Badge]
    CheckStatus -->|draft| GrayBadge[Gray Badge]

    GreenBadge --> Style1['bg-green-100 text-green-800']
    RedBadge --> Style2['bg-red-100 text-red-800']
    YellowBadge --> Style3['bg-yellow-100 text-yellow-800']
    GrayBadge --> Style4['bg-gray-100 text-gray-800']

    Style1 --> RenderBadge[Render Badge Component]
    Style2 --> RenderBadge
    Style3 --> RenderBadge
    Style4 --> RenderBadge
```

---

## 11. Error Handling Flow

### 11.1 Form Error Flow

```mermaid
graph TD
    SubmitAction[User Submits] --> ValidateAll[Validate All Fields]
    ValidateAll --> HasErrors{Has Errors?}

    HasErrors -->|Yes| CollectErrors[Collect Error Messages]
    CollectErrors --> SetErrorState[Set Error State]
    SetErrorState --> DisplayInline[Display Inline Errors]
    DisplayInline --> FocusFirst[Focus First Error Field]
    FocusFirst --> WaitCorrection[Wait for User Correction]
    WaitCorrection --> SubmitAction

    HasErrors -->|No| ProcessSubmit[Process Form Submission]
    ProcessSubmit --> SubmitResult{Success?}

    SubmitResult -->|Yes| ShowSuccessToast[Show Success Toast]
    ShowSuccessToast --> NavigateAway[Navigate to Detail/List]

    SubmitResult -->|No| ShowErrorToast[Show Error Toast]
    ShowErrorToast --> WaitCorrection
```

### 11.2 Data Loading Error Flow

```mermaid
graph TD
    LoadData[Load Data] --> LoadResult{Load Success?}

    LoadResult -->|Yes| ProcessData[Process and Display Data]

    LoadResult -->|No| ShowErrorMessage[Show Error Message]
    ShowErrorMessage --> OfferRetry[Offer Retry Option]
    OfferRetry --> UserChoice{User Choice}

    UserChoice -->|Retry| LoadData
    UserChoice -->|Navigate Back| GoBack[Navigate to Previous Page]
```

---

## 12. Related Documents

- [BR-price-lists.md](./BR-price-lists.md) - Business Requirements v2.0.0
- [DD-price-lists.md](./DD-price-lists.md) - Data Definition v2.1.0
- [TS-price-lists.md](./TS-price-lists.md) - Technical Specification v2.0.0
- [UC-price-lists.md](./UC-price-lists.md) - Use Cases v2.0.0
- [VAL-price-lists.md](./VAL-price-lists.md) - Validations v2.0.0

---

**End of Flow Diagrams Document**
