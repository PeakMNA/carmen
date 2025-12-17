# Pricelist Templates - Flow Diagrams (FD)

## Document Information
- **Document Type**: Flow Diagrams Document
- **Module**: Vendor Management > Pricelist Templates
- **Version**: 2.0.0
- **Last Updated**: 2025-11-25
- **Document Status**: Active
- **Mermaid Compatibility**: 8.8.2+

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.0.0 | 2025-11-25 | Documentation Team | Simplified to align with BR-pricelist-templates.md; Removed distribution, approval, notification, and submission tracking workflows; Streamlined to core template functionality |
| 1.1 | 2025-11-25 | Documentation Team | Updated Mermaid diagrams for 8.8.2 compatibility |
| 1.0 | 2024-01-15 | System | Initial creation |

---

## 1. Introduction

This document provides visual representations of workflows and processes in the Pricelist Templates module using Mermaid diagrams. The module enables organizations to create standardized pricing request templates that define products, units of measure, and specifications for vendor price submissions.

---

## 2. System Architecture Diagram

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph 'Frontend Layer'
        UI[Next.js UI Components]
        Forms[React Hook Form + Zod]
        State[Zustand + React Query]
    end

    subgraph 'Application Layer'
        Pages[Server Components]
        Actions[Server Actions]
        API[Route Handlers]
    end

    subgraph 'Business Logic Layer'
        Auth[Authentication Service]
        Validation[Validation Service]
        Template[Template Service]
    end

    subgraph 'Data Layer'
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
    end

    UI --> Pages
    Forms --> Actions
    State --> Actions
    Pages --> Actions
    Pages --> API
    Actions --> Auth
    Actions --> Validation
    Actions --> Template
    Actions --> Prisma
    API --> Prisma
    Prisma --> DB
```

---

## 3. Entity Relationship Diagram

### 3.1 Core Entities

```mermaid
erDiagram
    tb_currency ||--o{ tb_pricelist_template : "has"
    tb_pricelist_template ||--o{ tb_pricelist_template_detail : "contains"
    tb_product ||--o{ tb_pricelist_template_detail : "referenced_in"

    tb_pricelist_template {
        uuid id PK
        string name UK
        text description
        uuid currency_id FK
        string currency_name
        text vendor_instructions
        date effective_from
        date effective_to
        enum status
        json info
        decimal doc_version
        timestamp created_at
        uuid created_by_id
        timestamp updated_at
        uuid updated_by_id
    }

    tb_pricelist_template_detail {
        uuid id PK
        uuid pricelist_template_id FK
        integer sequence_no
        uuid product_id FK
        string product_name
        string unit_of_measure
        decimal minimum_order_quantity
        integer lead_time_days
        json info
        decimal doc_version
    }
```

---

## 4. Template Lifecycle State Diagram

### 4.1 Template Status Workflow

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Template

    Draft --> Active: Activate
    Draft --> Draft: Edit

    Active --> Inactive: Deactivate
    Active --> Active: Clone to New Draft

    Inactive --> [*]: Archive/Delete

    note right of Draft
        Template being created
        Can be modified freely
        Cannot be used for price collection
    end note

    note right of Active
        Template ready for use
        Can be used for vendor price submissions
        Editing creates new version
    end note

    note right of Inactive
        Template no longer active
        Preserved for historical records
        Cannot be used for new submissions
    end note
```

---

## 5. Core Workflows

### 5.1 Template Creation Workflow

```mermaid
flowchart TD
    Start([User Navigates to Templates]) --> CheckAuth{Authenticated?}
    CheckAuth -->|No| Login[Redirect to Login]
    CheckAuth -->|Yes| CheckPerm{Has Permission?}

    CheckPerm -->|No| PermError[Show Permission Error]
    PermError --> End([End])
    CheckPerm -->|Yes| ShowTemplates[Display Templates List]

    ShowTemplates --> UserAction{User Action?}
    UserAction -->|Create New| CreateForm[Open Create Form]
    UserAction -->|Edit Existing| LoadTemplate[Load Template]

    LoadTemplate --> CreateForm
    CreateForm --> EnterBasic[Enter Basic Information]

    EnterBasic --> EnterName[Enter Template Name]
    EnterName --> EnterDescription[Enter Description]
    EnterDescription --> SelectCurrency[Select Currency]
    SelectCurrency --> EnterInstructions[Enter Vendor Instructions]
    EnterInstructions --> SetEffectiveDates[Set Effective Date Range]

    SetEffectiveDates --> ValidateBasic{Valid?}
    ValidateBasic -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> EnterBasic
    ValidateBasic -->|Yes| ProductAssignment[Product Assignment]

    ProductAssignment --> SelectProducts[Select Products]
    SelectProducts --> CheckMinProducts{At Least 1 Product?}

    CheckMinProducts -->|No| ProductError[Show Minimum Product Error]
    ProductError --> SelectProducts
    CheckMinProducts -->|Yes| ConfigureProducts[Configure Product Details]

    ConfigureProducts --> SetUOM[Set Unit of Measure]
    SetUOM --> SetMOQ[Set Minimum Order Qty]
    SetMOQ --> SetLeadTime[Set Lead Time Days]
    SetLeadTime --> SetSequence[Set Display Sequence]

    SetSequence --> MoreProducts{Add More Products?}
    MoreProducts -->|Yes| SelectProducts
    MoreProducts -->|No| ReviewTemplate[Review Template]

    ReviewTemplate --> UserDecision{User Decision?}
    UserDecision -->|Go Back| EnterBasic

    UserDecision -->|Save Draft| SaveDraft[Save as Draft]
    SaveDraft --> DraftStatus[Status: DRAFT]
    DraftStatus --> SaveDB[(Save to Database)]

    UserDecision -->|Activate| FinalValidation{All Required Fields Complete?}
    FinalValidation -->|No| HighlightMissing[Highlight Missing Fields]
    HighlightMissing --> EnterBasic

    FinalValidation -->|Yes| ActiveStatus[Status: ACTIVE]
    ActiveStatus --> SaveDB

    SaveDB --> LogAudit[Log in Audit Trail]
    LogAudit --> Success[Display Success Message]
    Success --> Navigate[Navigate to Template Detail]
    Navigate --> End

    Login --> End
```

### 5.2 Product Assignment Workflow

```mermaid
flowchart TD
    Start([User in Product Assignment]) --> ShowInterface[Display Product Selection Interface]

    ShowInterface --> SearchMethod{Selection Method?}

    SearchMethod -->|Search Bar| EnterSearch[Enter Search Term]
    SearchMethod -->|Category Tree| BrowseCategory[Browse Category Tree]
    SearchMethod -->|Filters| ApplyFilters[Apply Product Filters]

    EnterSearch --> SearchDB[(Query Database)]
    BrowseCategory --> SearchDB
    ApplyFilters --> FilterOptions[Filter by Category/Status]
    FilterOptions --> SearchDB

    SearchDB --> DisplayResults[Display Product Results]
    DisplayResults --> UserSelects[User Selects Products]

    UserSelects --> SelectMode{Selection Mode?}
    SelectMode -->|Individual| SelectOne[Check Individual Product]
    SelectMode -->|Bulk Category| SelectCategory[Select All in Category]

    SelectOne --> AddToList
    SelectCategory --> ConfirmBulk{Confirm Bulk Selection?}
    ConfirmBulk -->|Yes| AddToList[Add to Template Product List]
    ConfirmBulk -->|No| DisplayResults

    AddToList --> ShowProductList[Show Selected Products]
    ShowProductList --> ConfigureProduct[Configure Product Settings]

    ConfigureProduct --> SetUOM[Set Unit of Measure]
    SetUOM --> SetMOQ[Set Minimum Order Qty]
    SetMOQ --> SetLeadTime[Set Expected Delivery Days]
    SetLeadTime --> SetSequence[Set Display Sequence]

    SetSequence --> MoreProducts{Add More Products?}
    MoreProducts -->|Yes| SearchMethod
    MoreProducts -->|No| ReviewList[Review Product List]

    ReviewList --> ListAction{User Action?}
    ListAction -->|Edit Product| SelectProduct[Select Product to Edit]
    SelectProduct --> ConfigureProduct

    ListAction -->|Remove Product| RemoveConfirm{Confirm Remove?}
    RemoveConfirm -->|Yes| RemoveProduct[Remove from List]
    RemoveProduct --> ReviewList
    RemoveConfirm -->|No| ReviewList

    ListAction -->|Reorder| DragDrop[Drag and Drop to Reorder]
    DragDrop --> UpdateSequence[Update Sequence Numbers]
    UpdateSequence --> ReviewList

    ListAction -->|Continue| ValidateList{At Least 1 Product?}
    ValidateList -->|No| MinProductError[Show Minimum Product Error]
    MinProductError --> ReviewList

    ValidateList -->|Yes| CheckDuplicates{Duplicate Products?}
    CheckDuplicates -->|Yes| DuplicateWarning[Show Duplicate Warning]
    DuplicateWarning --> ReviewList

    CheckDuplicates -->|No| SaveProducts[Save Product Configuration]
    SaveProducts --> Success[Display Success Message]
    Success --> End([End])
```

### 5.3 Template Cloning Workflow

```mermaid
flowchart TD
    Start([User Views Template]) --> ClickClone[Click Clone Template Button]

    ClickClone --> LoadOriginal[Load Original Template]
    LoadOriginal --> ShowCloneModal[Show Clone Configuration Modal]

    ShowCloneModal --> EnterName[Enter New Template Name]
    EnterName --> ValidateName{Name Unique?}
    ValidateName -->|No| NameError[Show Error: Name Exists]
    NameError --> EnterName

    ValidateName -->|Yes| PreviewClone[Show Clone Preview]
    PreviewClone --> UserConfirm{Confirm Clone?}

    UserConfirm -->|No| ShowCloneModal
    UserConfirm -->|Yes| CreateClone[Create New Template]

    CreateClone --> CopyStructure[Copy Template Structure]
    CopyStructure --> CopyProducts[Copy Product List]
    CopyProducts --> SetCloneMetadata[Set Clone Metadata]

    SetCloneMetadata --> SetStatus[Status: DRAFT]
    SetStatus --> SetCreatedBy[Created By: Current User]
    SetCreatedBy --> SetCreatedAt[Created At: Now]

    SetCreatedAt --> SaveNewTemplate[(Save to Database)]
    SaveNewTemplate --> LogCloneAction[Log Clone Action in Audit]
    LogCloneAction --> Success[Display Success Message]

    Success --> UserChoice{User Action?}
    UserChoice -->|Edit Now| OpenEditor[Open Template Editor]
    OpenEditor --> End([End])

    UserChoice -->|View List| RefreshList[Refresh Template List]
    RefreshList --> End
```

### 5.4 Template Status Change Workflow

```mermaid
flowchart TD
    Start([User Views Template]) --> CheckCurrentStatus{Current Status?}

    CheckCurrentStatus -->|Draft| DraftActions{User Action?}
    DraftActions -->|Edit| OpenEditor[Open Template Editor]
    DraftActions -->|Activate| ValidateTemplate{Template Valid?}
    DraftActions -->|Delete| ConfirmDelete{Confirm Delete?}

    OpenEditor --> End([End])

    ValidateTemplate -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> End
    ValidateTemplate -->|Yes| SetActive[Status: ACTIVE]
    SetActive --> SaveDB[(Save to Database)]
    SaveDB --> LogChange[Log Status Change]
    LogChange --> Success[Display Success Message]
    Success --> End

    ConfirmDelete -->|No| End
    ConfirmDelete -->|Yes| DeleteTemplate[Delete Template]
    DeleteTemplate --> LogDelete[Log Deletion]
    LogDelete --> End

    CheckCurrentStatus -->|Active| ActiveActions{User Action?}
    ActiveActions -->|Clone| CloneWorkflow[Start Clone Workflow]
    ActiveActions -->|Deactivate| ConfirmDeactivate{Confirm Deactivate?}

    CloneWorkflow --> End

    ConfirmDeactivate -->|No| End
    ConfirmDeactivate -->|Yes| SetInactive[Status: INACTIVE]
    SetInactive --> SaveDB

    CheckCurrentStatus -->|Inactive| InactiveActions{User Action?}
    InactiveActions -->|View| ViewTemplate[View Template Details]
    InactiveActions -->|Delete| ConfirmDelete

    ViewTemplate --> End
```

---

## 6. Search and Filter Workflow

### 6.1 Template Search Workflow

```mermaid
flowchart TD
    Start([User Enters Search Term]) --> Debounce[Debounce 300ms]
    Debounce --> BuildQuery[Build Search Query]

    BuildQuery --> SearchScope{Search Scope?}

    SearchScope -->|Name| SearchName[Search Template Name]
    SearchScope -->|Category| SearchCategory[Search Category]
    SearchScope -->|All| SearchAll[Search All Fields]

    SearchName --> QueryDB
    SearchCategory --> QueryDB
    SearchAll --> QueryDB[(Query Database)]

    QueryDB --> ApplyFilters{Filters Applied?}

    ApplyFilters -->|Yes| FilterStatus[Apply Status Filter]
    FilterStatus --> FilterDate[Apply Date Range Filter]
    FilterDate --> FilterResults[Filter Results]
    FilterResults --> SortResults

    ApplyFilters -->|No| SortResults[Sort Results]

    SortResults --> DisplayResults[Display Results]

    DisplayResults --> UserAction{User Action?}

    UserAction -->|Select Template| OpenTemplate[Open Template Detail]
    OpenTemplate --> End([End])

    UserAction -->|Change Filters| ApplyFilters
    UserAction -->|New Search| Start

    UserAction -->|Export| ExportResults[Export Search Results]
    ExportResults --> ExportFormat{Export Format?}
    ExportFormat -->|CSV| GenerateCSV[Generate CSV File]
    ExportFormat -->|Excel| GenerateExcel[Generate Excel File]

    GenerateCSV --> Download[Download File]
    GenerateExcel --> Download
    Download --> End

    UserAction -->|Clear Search| ClearSearch[Clear Search Term]
    ClearSearch --> LoadAll[Load All Templates]
    LoadAll --> DisplayResults
```

---

## 7. Integration Flow Diagrams

### 7.1 Price List Module Integration

```mermaid
flowchart TD
    Start([Template Ready]) --> TemplateActive{Status: Active?}

    TemplateActive -->|No| CannotUse[Template Not Available]
    CannotUse --> End([End])

    TemplateActive -->|Yes| SelectForPricing[Select Template for Pricing]

    SelectForPricing --> LoadProducts[Load Template Products]
    LoadProducts --> CreatePriceList[Create New Price List]

    CreatePriceList --> ForEachProduct[For Each Product]
    ForEachProduct --> CreatePriceLine[Create Price Line Item]
    CreatePriceLine --> SetProductRef[Set Product Reference]
    SetProductRef --> SetUOM[Set Unit of Measure]
    SetUOM --> SetMOQ[Set MOQ from Template]

    SetMOQ --> MoreProducts{More Products?}
    MoreProducts -->|Yes| ForEachProduct
    MoreProducts -->|No| LinkTemplate[Link Price List to Template]

    LinkTemplate --> SavePriceList[(Save Price List)]
    SavePriceList --> Success[Price List Created]
    Success --> End
```

### 7.2 Product Management Integration

```mermaid
flowchart TD
    Start([User Adds Product to Template]) --> SearchProducts[Search Products]

    SearchProducts --> QueryProductCatalog[(Query Product Catalog)]
    QueryProductCatalog --> FilterByCategory[Filter by Category]
    FilterByCategory --> FilterByStatus[Filter Active Products Only]

    FilterByStatus --> DisplayProducts[Display Available Products]
    DisplayProducts --> SelectProduct[User Selects Product]

    SelectProduct --> LoadProductDetails[Load Product Details]
    LoadProductDetails --> GetDefaultUOM[Get Default UOM]
    GetDefaultUOM --> GetProductSpecs[Get Product Specifications]

    GetProductSpecs --> AutoFillDefaults[Auto-fill Default Values]
    AutoFillDefaults --> AllowOverride[Allow User Override]

    AllowOverride --> SaveToTemplate[Save Product to Template]
    SaveToTemplate --> DenormalizeData[Cache Product Name]
    DenormalizeData --> Success[Product Added]
    Success --> End([End])
```

---

## 8. Data Flow Diagrams

### 8.1 Template Creation Data Flow

```mermaid
graph LR
    User[User] -->|Input| Form[Template Form]
    Form -->|Step Data| Validation[Zod Validation]
    Validation -->|Valid| ServerAction[Server Action]
    Validation -->|Invalid| Form

    ServerAction -->|Build Template| TemplateBuilder[Template Builder]
    TemplateBuilder -->|Products Array| ProductHandler[Product Handler]

    ProductHandler -->|Validated Data| Prisma[Prisma Client]

    Prisma -->|Insert| DB[(PostgreSQL)]

    DB -->|Success| Cache[React Query Cache]

    Cache -->|Update UI| Form
    ServerAction -->|Error| ErrorHandler[Error Handler]
    ErrorHandler -->|Display Error| Form
```

### 8.2 Template Read Data Flow

```mermaid
graph LR
    User[User] -->|Request| Page[Server Component]
    Page -->|Query| ServerAction[Server Action]

    ServerAction -->|Check| Cache{Cache Valid?}
    Cache -->|Yes| ReturnCached[Return Cached Data]
    Cache -->|No| QueryDB[Query Database]

    QueryDB -->|Fetch| Prisma[Prisma Client]
    Prisma -->|Query| DB[(PostgreSQL)]
    DB -->|Return| Prisma
    Prisma -->|Data| ServerAction

    ServerAction -->|Update| UpdateCache[Update Cache]
    UpdateCache -->|Data| Page
    ReturnCached -->|Data| Page

    Page -->|Render| UI[UI Component]
    UI -->|Display| User
```

---

## Related Documents
- BR-pricelist-templates.md - Business Requirements
- DD-pricelist-templates.md - Data Definition
- UC-pricelist-templates.md - Use Cases
- TS-pricelist-templates.md - Technical Specification
- VAL-pricelist-templates.md - Validations

---

**End of Flow Diagrams Document**
