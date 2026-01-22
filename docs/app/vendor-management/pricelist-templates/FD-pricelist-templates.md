# Pricelist Templates - Flow Diagrams (FD)

## Document Information
- **Document Type**: Flow Diagrams Document
- **Module**: Vendor Management > Pricelist Templates
- **Version**: 3.0.0
- **Last Updated**: 2026-01-15
- **Document Status**: Active
- **Mermaid Compatibility**: 8.8.2+

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2026-01-15 | Documentation Team | Synced with current code; Updated route paths from /pricelist-templates to /templates; Added 3-step wizard flow; Added notification settings workflow; Updated product selection to hierarchical model |
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
    tb_currency ||--o{ tb_pricelist_template : has
    tb_pricelist_template ||--o{ tb_pricelist_template_detail : contains
    tb_product ||--o{ tb_pricelist_template_detail : referenced_in
```

#### tb_pricelist_template

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | uuid | PK | Primary key |
| name | string | UK | Template name (unique) |
| description | text | | Template description |
| currency_id | uuid | FK | Reference to tb_currency |
| currency_name | string | | Currency display name |
| vendor_instructions | text | | Instructions for vendors |
| effective_from | date | | Start date |
| effective_to | date | | End date |
| status | enum | | Template status |
| info | json | | Extended information |
| doc_version | decimal | | Document version |
| created_at | timestamp | | Creation timestamp |
| created_by_id | uuid | | Creator reference |
| updated_at | timestamp | | Last update timestamp |
| updated_by_id | uuid | | Updater reference |

#### tb_pricelist_template_detail

| Field | Type | Key | Description |
|-------|------|-----|-------------|
| id | uuid | PK | Primary key |
| pricelist_template_id | uuid | FK | Reference to template |
| sequence_no | integer | | Item sequence |
| product_id | uuid | FK | Reference to tb_product |
| product_name | string | | Product display name |
| unit_of_measure | string | | Unit of measure |
| minimum_order_quantity | decimal | | Minimum order qty |
| lead_time_days | integer | | Lead time in days |
| info | json | | Extended information |
| doc_version | decimal | | Document version |

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

### 5.1 Template Creation Workflow (3-Step Wizard)

```mermaid
flowchart TD
    Start([User Navigates to Templates]) --> CheckAuth{Authenticated?}
    CheckAuth -->|No| Login[Redirect to Login]
    CheckAuth -->|Yes| CheckPerm{Has Permission?}

    CheckPerm -->|No| PermError[Show Permission Error]
    PermError --> End([End])
    CheckPerm -->|Yes| ShowTemplates[Display Templates List]

    ShowTemplates --> UserAction{User Action?}
    UserAction -->|Create New| Step1[Step 1: Basic Information]

    Step1 --> EnterName[Enter Template Name]
    EnterName --> EnterDescription[Enter Description]
    EnterDescription --> SelectCurrency[Select Currency BHT/USD/CNY/SGD]
    SelectCurrency --> SetValidity[Set Validity Period in Days]
    SetValidity --> EnterInstructions[Enter Vendor Instructions]

    EnterInstructions --> ValidateStep1{Valid?}
    ValidateStep1 -->|No| ShowErrors1[Show Validation Errors]
    ShowErrors1 --> Step1
    ValidateStep1 -->|Yes| Step2[Step 2: Product Selection]

    Step2 --> SelectCategories[Select Categories]
    SelectCategories --> SelectSubcategories[Select Subcategories]
    SelectSubcategories --> SelectItemGroups[Select Item Groups]
    SelectItemGroups --> SelectSpecificItems[Select Specific Items]

    SelectSpecificItems --> CheckMinProducts{At Least 1 Selection?}
    CheckMinProducts -->|No| ProductError[Show Minimum Selection Error]
    ProductError --> Step2
    CheckMinProducts -->|Yes| Step3[Step 3: Settings and Notifications]

    Step3 --> ConfigureMOQ[Configure Multi-MOQ Setting]
    ConfigureMOQ --> ConfigureLeadTime[Configure Lead Time Requirement]
    ConfigureLeadTime --> SetMaxItems[Set Max Items Per Submission]
    SetMaxItems --> ConfigureNotifications[Configure Notification Settings]

    ConfigureNotifications --> SetReminders{Send Reminders?}
    SetReminders -->|Yes| SetReminderDays[Set Reminder Days 14/7/3/1]
    SetReminderDays --> SetEscalation[Set Escalation Days]
    SetReminders -->|No| SetEscalation

    SetEscalation --> ReviewTemplate[Review Template]

    ReviewTemplate --> UserDecision{User Decision?}
    UserDecision -->|Previous| Step2
    UserDecision -->|Cancel| ShowTemplates

    UserDecision -->|Create Template| SaveDraft[Save as Draft]
    SaveDraft --> DraftStatus[Status: DRAFT]
    DraftStatus --> SaveDB[(Save to Database)]

    SaveDB --> LogAudit[Log in Audit Trail]
    LogAudit --> Success[Display Success Message]
    Success --> Navigate[Navigate to Template Detail]
    Navigate --> End

    Login --> End
```

### 5.2 Product Assignment Workflow (Hierarchical Selection)

```mermaid
flowchart TD
    Start([User in Product Selection Step]) --> ShowInterface[Display ProductSelectionComponent]

    ShowInterface --> SelectionLevel{Selection Level?}

    SelectionLevel -->|Categories| BrowseCategories[Browse Category List]
    SelectionLevel -->|Subcategories| BrowseSubcategories[Browse Subcategory List]
    SelectionLevel -->|Item Groups| BrowseItemGroups[Browse Item Group List]
    SelectionLevel -->|Specific Items| BrowseItems[Browse/Search Products]

    BrowseCategories --> SelectCategories[Select Categories via Checkboxes]
    BrowseSubcategories --> SelectSubcategories[Select Subcategories]
    BrowseItemGroups --> SelectItemGroups[Select Item Groups]
    BrowseItems --> SelectItems[Select Individual Products]

    SelectCategories --> UpdateSelection[Update productSelection.categories]
    SelectSubcategories --> UpdateSelection2[Update productSelection.subcategories]
    SelectItemGroups --> UpdateSelection3[Update productSelection.itemGroups]
    SelectItems --> UpdateSelection4[Update productSelection.specificItems]

    UpdateSelection --> ShowSummary[Show Selection Summary]
    UpdateSelection2 --> ShowSummary
    UpdateSelection3 --> ShowSummary
    UpdateSelection4 --> ShowSummary

    ShowSummary --> UserAction{User Action?}
    UserAction -->|Add More| SelectionLevel
    UserAction -->|Remove Selection| RemoveItem[Remove from Selection]
    RemoveItem --> ShowSummary

    UserAction -->|Continue| ValidateSelection{At Least 1 Selection?}
    ValidateSelection -->|No| SelectionError[Show Minimum Selection Error]
    SelectionError --> SelectionLevel

    ValidateSelection -->|Yes| ProceedToSettings[Proceed to Settings Step]
    ProceedToSettings --> End([End])
```

**Selection Interface Features**:
- Checkbox-based multi-selection at each level
- Collapsible/expandable category tree
- Search/filter within each level
- Selection count badges
- Clear all selections option

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
