# Flow Diagrams: Product Categories

## Module Information

- **Module**: Product Management
- **Sub-Module**: Product Categories
- **Route**: `/product-management/categories`
- **Document Type**: Flow Diagrams (FD)
- **Version**: 1.0.0
- **Last Updated**: 2025-11-26
- **Status**: Approved

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-02-11 | System | Initial flow diagrams documentation |

---

## Overview

This document provides comprehensive visual representations of the Product Categories sub-module's processes, data flows, and system interactions using Mermaid diagrams. These diagrams illustrate:

- **Process flows**: Step-by-step operation sequences
- **Data flows**: Information movement through system layers
- **Sequence diagrams**: Actor interactions over time
- **State diagrams**: Category lifecycle and transitions
- **System integrations**: Cross-module interactions
- **Error handling**: Validation and exception flows

**Purpose**: Enable developers, business analysts, and stakeholders to understand system behavior through visual documentation.

**Audience**: Development team, QA engineers, business analysts, system architects, technical documentation users.

---

## High-Level System Architecture

### Three-Tier Architecture Overview

**Purpose**: Shows the layered architecture for the Categories sub-module.

```mermaid
flowchart TB
    subgraph 'Presentation Layer'
        UI[Category Management UI]
        Form[Category Forms]
        Tree[Hierarchy Tree View]
    end

    subgraph 'Application Layer'
        API[REST API Endpoints]
        Validation[Input Validation]
        Business[Business Logic Service]
        Cache[Cache Layer]
    end

    subgraph 'Data Layer'
        DB[(PostgreSQL Database)]
        Triggers[Database Triggers]
        Views[Materialized Views]
    end

    subgraph 'External Systems'
        Products[Products Module]
        Users[User Management]
        Audit[Audit Log System]
    end

    UI -->|User Actions| API
    Form -->|Submit Data| API
    Tree -->|Navigate| API

    API -->|Validate| Validation
    Validation -->|Process| Business
    Business <-->|Cache Check| Cache
    Business <-->|CRUD Operations| DB

    DB -->|Auto-Execute| Triggers
    Triggers -->|Update| Views

    Business <-->|Product Association| Products
    Business <-->|User Context| Users
    Business -->|Log Changes| Audit

    style UI fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Form fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Tree fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style API fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Validation fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Business fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Cache fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style DB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style Triggers fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style Views fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

---

## Entity Relationship Diagram

### Category Data Model

**Purpose**: Illustrates the database relationships for the categories table.

```mermaid
erDiagram
    CATEGORIES ||--o{ CATEGORIES : "parent-child hierarchy"
    CATEGORIES ||--o{ PRODUCTS : "categorizes"
    USERS ||--o{ CATEGORIES : "creates/updates/deletes"

    CATEGORIES {
        uuid id PK
        varchar name UK
        varchar description
        varchar type
        uuid parent_id FK
        integer level
        integer sort_order
        text path
        boolean is_active
        timestamptz created_at
        uuid created_by FK
        timestamptz updated_at
        uuid updated_by FK
        timestamptz deleted_at
        uuid deleted_by FK
    }

    PRODUCTS {
        uuid id PK
        uuid category_id FK
        varchar name
        text description
        varchar sku
        boolean is_active
    }

    USERS {
        uuid id PK
        varchar name
        varchar email
        varchar role
    }
```

---

## Process Flows

### 1. Create Category Process

**Purpose**: Documents the complete flow for creating a new category in the three-level hierarchy.

```mermaid
flowchart TD
    Start([User Clicks Create Category]) --> CheckAuth{User Has<br>Permission?}

    CheckAuth -->|No| Deny[Show Permission Denied]
    CheckAuth -->|Yes| ShowForm[Display Category Form]

    Deny --> End1([End])

    ShowForm --> SelectType{Select Category Type}

    SelectType -->|Category Level 1| SetL1[Set Level = 1<br>parent_id = null]
    SelectType -->|Subcategory Level 2| ChooseParent1[Choose Parent Category]
    SelectType -->|Item Group Level 3| ChooseParent2[Choose Parent Subcategory]

    ChooseParent1 --> SetL2[Set Level = 2<br>parent_id = selected]
    ChooseParent2 --> SetL3[Set Level = 3<br>parent_id = selected]

    SetL1 --> FillForm[User Fills Form:<br>Name, Description,<br>Sort Order]
    SetL2 --> FillForm
    SetL3 --> FillForm

    FillForm --> Submit[User Submits]
    Submit --> ValidateFE{Frontend<br>Validation}

    ValidateFE -->|Fail| ShowErrors1[Show Validation Errors]
    ShowErrors1 --> FillForm

    ValidateFE -->|Pass| SendAPI[Send POST /api/categories]
    SendAPI --> ValidateBE{Backend<br>Validation}

    ValidateBE -->|Fail| ReturnError[Return 400 Error]
    ReturnError --> ShowErrors2[Display Error Message]
    ShowErrors2 --> FillForm

    ValidateBE -->|Pass| CheckUnique{Name Unique<br>in Parent?}

    CheckUnique -->|No| ReturnDup[Return Duplicate Error]
    ReturnDup --> ShowErrors2

    CheckUnique -->|Yes| CheckHierarchy{Valid<br>Hierarchy?}

    CheckHierarchy -->|No| ReturnHier[Return Hierarchy Error]
    ReturnHier --> ShowErrors2

    CheckHierarchy -->|Yes| CreateDB[INSERT INTO categories]
    CreateDB --> TriggerAfter[Execute After Insert Trigger]

    TriggerAfter --> CalcPath[Calculate Hierarchy Path]
    CalcPath --> UpdateCounts[Update Item Counts]
    UpdateCounts --> ClearCache[Clear Category Cache]

    ClearCache --> LogAudit[Log to Audit Trail]
    LogAudit --> Return201[Return 201 Created]

    Return201 --> RefreshUI[Refresh UI Category Tree]
    RefreshUI --> ShowSuccess[Show Success Message]
    ShowSuccess --> End2([End])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style End1 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style End2 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Deny fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ShowErrors1 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ShowErrors2 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ReturnError fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ReturnDup fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ReturnHier fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style CreateDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ShowSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

---

### 2. Update Category Process

**Purpose**: Shows the flow for updating an existing category with validation and cascade updates.

```mermaid
flowchart TD
    Start([User Clicks Edit Category]) --> CheckAuth{User Has<br>Permission?}

    CheckAuth -->|No| Deny[Show Permission Denied]
    CheckAuth -->|Yes| LoadData[Load Category Data]

    Deny --> End1([End])

    LoadData --> ShowForm[Display Pre-filled Form]
    ShowForm --> UserEdit[User Edits:<br>Name, Description,<br>Status, Sort Order]

    UserEdit --> Submit[User Submits]
    Submit --> ValidateFE{Frontend<br>Validation}

    ValidateFE -->|Fail| ShowErrors1[Show Validation Errors]
    ShowErrors1 --> UserEdit

    ValidateFE -->|Pass| SendAPI[Send PUT /api/categories/:id]
    SendAPI --> ValidateBE{Backend<br>Validation}

    ValidateBE -->|Fail| ReturnError[Return 400 Error]
    ReturnError --> ShowErrors2[Display Error Message]
    ShowErrors2 --> UserEdit

    ValidateBE -->|Pass| CheckUnique{Name Unique<br>in Parent?}

    CheckUnique -->|No| ReturnDup[Return Duplicate Error]
    ReturnDup --> ShowErrors2

    CheckUnique -->|Yes| CheckChildren{Has<br>Children?}

    CheckChildren -->|Yes| CheckParentChange{Parent ID<br>Changed?}
    CheckChildren -->|No| ProceedUpdate[Proceed with Update]

    CheckParentChange -->|Yes| ReturnBlock[Return Cannot Move<br>with Children Error]
    ReturnBlock --> ShowErrors2

    CheckParentChange -->|No| ProceedUpdate

    ProceedUpdate --> UpdateDB[UPDATE categories SET...]
    UpdateDB --> TriggerBefore[Execute Before Update Trigger]

    TriggerBefore --> SetTimestamp[Set updated_at = NOW<br>Set updated_by = user_id]
    SetTimestamp --> TriggerAfter[Execute After Update Trigger]

    TriggerAfter --> RecalcPath{Path<br>Changed?}

    RecalcPath -->|Yes| UpdateDescPath[Update Descendant Paths]
    RecalcPath -->|No| UpdateCounts

    UpdateDescPath --> UpdateCounts[Update Item Counts]
    UpdateCounts --> ClearCache[Clear Category Cache]

    ClearCache --> LogAudit[Log Change to Audit Trail]
    LogAudit --> Return200[Return 200 OK]

    Return200 --> RefreshUI[Refresh UI Category Tree]
    RefreshUI --> ShowSuccess[Show Success Message]
    ShowSuccess --> End2([End])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style End1 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style End2 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Deny fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ShowErrors1 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ShowErrors2 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ReturnError fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ReturnDup fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ReturnBlock fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style UpdateDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ShowSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

---

### 3. Delete Category Process (Soft Delete)

**Purpose**: Illustrates the soft delete flow with cascade handling and constraint validation.

```mermaid
flowchart TD
    Start([User Clicks Delete Category]) --> CheckAuth{User Has<br>Permission?}

    CheckAuth -->|No| Deny[Show Permission Denied]
    CheckAuth -->|Yes| ShowConfirm[Show Delete Confirmation<br>Dialog with Warning]

    Deny --> End1([End])

    ShowConfirm --> UserDecide{User<br>Confirms?}

    UserDecide -->|Cancel| End2([End - Cancelled])
    UserDecide -->|Confirm| SendAPI[Send DELETE /api/categories/:id]

    SendAPI --> CheckProducts{Has<br>Products?}

    CheckProducts -->|Yes| ReturnBlock[Return 409 Conflict:<br>Cannot Delete with Products]
    ReturnBlock --> ShowError[Display Error Message:<br>Move or Remove Products First]
    ShowError --> End3([End - Blocked])

    CheckProducts -->|No| CheckChildren{Has<br>Children?}

    CheckChildren -->|Yes| ConfirmCascade[Show Cascade Warning:<br>Will Also Delete X Children]
    CheckChildren -->|No| ProceedDelete[Proceed with Soft Delete]

    ConfirmCascade --> UserCascade{User<br>Confirms<br>Cascade?}

    UserCascade -->|Cancel| End4([End - Cancelled])
    UserCascade -->|Confirm| ProceedDelete

    ProceedDelete --> BeginTxn[BEGIN TRANSACTION]
    BeginTxn --> SoftDelete[UPDATE categories<br>SET deleted_at = NOW<br>deleted_by = user_id]

    SoftDelete --> TriggerCascade{Has<br>Children?}

    TriggerCascade -->|Yes| DeleteChildren[Soft Delete All Descendants<br>Recursively]
    TriggerCascade -->|No| UpdateParentCounts

    DeleteChildren --> UpdateParentCounts[Update Parent Item Counts]
    UpdateParentCounts --> ClearCache[Clear Category Cache]

    ClearCache --> LogAudit[Log to Audit Trail:<br>Deletion + Cascade Info]
    LogAudit --> CommitTxn[COMMIT TRANSACTION]

    CommitTxn --> Return200[Return 200 OK]
    Return200 --> RefreshUI[Refresh UI Category Tree]
    RefreshUI --> ShowSuccess[Show Success Message:<br>Category Deleted]
    ShowSuccess --> End5([End - Success])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style End1 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style End2 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style End3 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style End4 fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style End5 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Deny fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ReturnBlock fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ShowError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style SoftDelete fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style DeleteChildren fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ShowSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

---

### 4. Drag-and-Drop Reorder Process

**Purpose**: Documents the real-time reordering flow when users drag categories to change sort order.

```mermaid
flowchart TD
    Start([User Drags Category]) --> CheckAuth{User Has<br>Permission?}

    CheckAuth -->|No| Deny[Prevent Drag<br>Show Warning]
    CheckAuth -->|Yes| ShowGhost[Show Drag Ghost<br>Visual Feedback]

    Deny --> End1([End])

    ShowGhost --> UserDrag[User Moves Category<br>Over Drop Zones]
    UserDrag --> HighlightZone[Highlight Valid<br>Drop Zones]

    HighlightZone --> UserDrop[User Drops Category]
    UserDrop --> ValidateTarget{Valid Drop<br>Target?}

    ValidateTarget -->|No| ShowError[Show Invalid Drop Error]
    ShowError --> RevertPos[Revert to Original Position]
    RevertPos --> End2([End - Invalid])

    ValidateTarget -->|Yes| CheckSameParent{Same<br>Parent?}

    CheckSameParent -->|No| ReturnError[Return Cannot Move<br>Between Parents Error]
    ReturnError --> RevertPos

    CheckSameParent -->|Yes| CalcNewOrder[Calculate New<br>Sort Order Values]
    CalcNewOrder --> OptimisticUI[Update UI Optimistically]

    OptimisticUI --> SendAPI[Send PATCH /api/categories/reorder]
    SendAPI --> ValidateBE{Backend<br>Validation}

    ValidateBE -->|Fail| ReturnAPIError[Return 400 Error]
    ReturnAPIError --> RollbackUI[Rollback UI Changes]
    RollbackUI --> ShowAPIError[Display Error Message]
    ShowAPIError --> End3([End - Failed])

    ValidateBE -->|Pass| BeginTxn[BEGIN TRANSACTION]
    BeginTxn --> UpdateSortOrders[UPDATE Multiple Categories<br>SET sort_order = new_value]

    UpdateSortOrders --> TriggerUpdate[Execute Update Triggers]
    TriggerUpdate --> ClearCache[Clear Category Cache]

    ClearCache --> LogAudit[Log Reorder to Audit Trail]
    LogAudit --> CommitTxn[COMMIT TRANSACTION]

    CommitTxn --> Return200[Return 200 OK]
    Return200 --> ConfirmUI[Confirm UI Update]
    ConfirmUI --> ShowSuccess[Show Success Indicator]
    ShowSuccess --> End4([End - Success])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style End1 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style End2 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style End3 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style End4 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Deny fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ShowError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ReturnError fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ReturnAPIError fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style RollbackUI fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style UpdateSortOrders fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ShowSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

---

### 5. Hierarchy Navigation Flow

**Purpose**: Shows how users navigate the three-level category hierarchy with expand/collapse functionality.

```mermaid
flowchart TD
    Start([Page Load]) --> FetchRoot[Fetch Root Categories<br>GET /api/categories?level=1]

    FetchRoot --> CacheCheck{Cache<br>Hit?}

    CacheCheck -->|Yes| ReturnCached[Return Cached Data]
    CacheCheck -->|No| QueryDB[Query Database:<br>WHERE level=1<br>AND deleted_at IS NULL]

    QueryDB --> StoreCache[Store in Cache<br>TTL = 5 minutes]
    StoreCache --> ReturnData[Return Category List]

    ReturnCached --> ReturnData
    ReturnData --> RenderTree[Render Root Categories<br>as Collapsed Nodes]

    RenderTree --> WaitAction[Wait for User Action]

    WaitAction --> UserClick{User Action}

    UserClick -->|Click Expand| CheckLoaded{Children<br>Loaded?}
    UserClick -->|Click Category| NavToDetail[Navigate to Detail Page]
    UserClick -->|Search| ExecuteSearch[Execute Search Flow]

    CheckLoaded -->|Yes| ShowChildren[Show Children<br>Expand Node]
    CheckLoaded -->|No| FetchChildren[Fetch Children<br>GET /api/categories?parent_id=X]

    FetchChildren --> ChildCacheCheck{Cache<br>Hit?}

    ChildCacheCheck -->|Yes| ReturnChildCached[Return Cached Children]
    ChildCacheCheck -->|No| QueryChildren[Query Database:<br>WHERE parent_id=X<br>AND deleted_at IS NULL]

    QueryChildren --> StoreChildCache[Store in Cache<br>TTL = 5 minutes]
    StoreChildCache --> ReturnChildData[Return Children List]

    ReturnChildCached --> ReturnChildData
    ReturnChildData --> RenderChildren[Render Children Nodes]
    RenderChildren --> ShowChildren

    ShowChildren --> WaitAction
    NavToDetail --> End1([End - Navigate])
    ExecuteSearch --> End2([End - Search])

    UserClick -->|Click Collapse| HideChildren[Hide Children<br>Collapse Node]
    HideChildren --> WaitAction

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style End1 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style End2 fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style QueryDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style QueryChildren fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style StoreCache fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style StoreChildCache fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
```

---

## Data Flow Diagrams

### 1. Category CRUD Data Flow

**Purpose**: Shows how data flows through system layers during CRUD operations.

```mermaid
flowchart LR
    subgraph 'Client Layer'
        UI[React UI Components]
        Form[React Hook Forms]
        State[Zustand Store]
    end

    subgraph 'API Layer'
        Routes[Next.js API Routes]
        Middleware[Auth Middleware]
        Validator[Zod Validators]
    end

    subgraph 'Service Layer'
        Service[Category Service]
        Business[Business Logic]
        Cache[Redis Cache]
    end

    subgraph 'Data Layer'
        ORM[Prisma ORM]
        DB[(PostgreSQL)]
        Triggers[DB Triggers]
    end

    UI -->|User Action| Form
    Form -->|Validated Data| State
    State -->|HTTP Request| Routes

    Routes -->|Check Auth| Middleware
    Middleware -->|Authorized| Validator
    Validator -->|Valid Input| Service

    Service <-->|Check Cache| Cache
    Service -->|Business Rules| Business
    Business -->|SQL Operations| ORM

    ORM <-->|Query/Insert/Update/Delete| DB
    DB -->|Auto-Execute| Triggers
    Triggers -->|Update| DB

    DB -->|Result| ORM
    ORM -->|Formatted Data| Service
    Service -->|Response| Routes
    Routes -->|HTTP Response| State
    State -->|Update UI| UI

    style UI fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Form fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style State fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Routes fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Middleware fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Validator fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Service fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Business fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style Cache fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ORM fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style DB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style Triggers fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

---

### 2. Item Count Aggregation Data Flow

**Purpose**: Documents how item counts are calculated and propagated through the hierarchy.

```mermaid
flowchart TD
    Start([Product Category<br>Assignment Change]) --> TriggerEvent[Database Trigger:<br>after_product_category_change]

    TriggerEvent --> GetOldCat{Old Category<br>Exists?}

    GetOldCat -->|Yes| DecOld[Decrement Old Category<br>item_count]
    GetOldCat -->|No| GetNewCat

    DecOld --> PropagateOldUp[Propagate Up Old Hierarchy:<br>UPDATE parent item_count]

    PropagateOldUp --> GetNewCat{New Category<br>Exists?}

    GetNewCat -->|Yes| IncNew[Increment New Category<br>item_count]
    GetNewCat -->|No| RefreshView

    IncNew --> PropagateNewUp[Propagate Up New Hierarchy:<br>UPDATE parent item_count]

    PropagateNewUp --> RefreshView[Refresh Materialized View:<br>v_category_counts]

    RefreshView --> ClearCache[Clear Category<br>Cache Keys]

    ClearCache --> LogChange[Log Change to<br>Audit Trail]

    LogChange --> End([End - Counts Updated])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style End fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style TriggerEvent fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style DecOld fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style IncNew fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style PropagateOldUp fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style PropagateNewUp fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style RefreshView fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

---

## Sequence Diagrams

### 1. Create Category Sequence

**Purpose**: Shows the interaction sequence when creating a new category.

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React UI
    participant API as API Route
    participant SVC as Category Service
    participant DB as Database
    participant TRIG as DB Triggers
    participant CACHE as Cache
    participant AUDIT as Audit Log

    U->>UI: Click "Create Category"
    UI->>UI: Show category form
    U->>UI: Fill form & submit
    UI->>UI: Validate form (Zod)

    alt Validation fails
        UI->>U: Show validation errors
    else Validation passes
        UI->>API: POST /api/categories
        API->>API: Authenticate user
        API->>API: Authorize action
        API->>SVC: createCategory(data)

        SVC->>SVC: Validate business rules
        SVC->>DB: Check name uniqueness
        DB-->>SVC: Result

        alt Name exists
            SVC-->>API: Error: Duplicate name
            API-->>UI: 409 Conflict
            UI->>U: Show duplicate error
        else Name unique
            SVC->>DB: BEGIN TRANSACTION
            SVC->>DB: INSERT INTO categories
            DB->>TRIG: Execute after_insert trigger
            TRIG->>DB: Calculate path
            TRIG->>DB: Update parent counts
            DB-->>SVC: Created category
            SVC->>DB: COMMIT TRANSACTION

            SVC->>CACHE: Invalidate category cache
            SVC->>AUDIT: Log creation event

            SVC-->>API: Success + category data
            API-->>UI: 201 Created
            UI->>UI: Refresh category tree
            UI->>U: Show success message
        end
    end
```

---

### 2. Update Category with Children Sequence

**Purpose**: Illustrates the update flow when modifying a category that has children.

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React UI
    participant API as API Route
    participant SVC as Category Service
    participant DB as Database
    participant TRIG as DB Triggers
    participant CACHE as Cache
    participant AUDIT as Audit Log

    U->>UI: Click "Edit Category"
    UI->>API: GET /api/categories/:id
    API->>SVC: getCategoryById(id)
    SVC->>DB: SELECT * FROM categories WHERE id=?
    DB-->>SVC: Category data
    SVC-->>API: Category object
    API-->>UI: 200 OK
    UI->>U: Show pre-filled form

    U->>UI: Modify fields & submit
    UI->>UI: Validate form (Zod)
    UI->>API: PUT /api/categories/:id
    API->>API: Authenticate & authorize
    API->>SVC: updateCategory(id, data)

    SVC->>DB: Check if has children
    DB-->>SVC: Has 5 children

    alt Parent ID changed
        SVC-->>API: Error: Cannot move with children
        API-->>UI: 400 Bad Request
        UI->>U: Show error message
    else Parent unchanged
        SVC->>DB: Check name uniqueness
        DB-->>SVC: Name available

        SVC->>DB: BEGIN TRANSACTION
        SVC->>DB: UPDATE categories SET...
        DB->>TRIG: Execute before_update trigger
        TRIG->>DB: Set updated_at, updated_by
        DB->>TRIG: Execute after_update trigger

        alt Path fields changed
            TRIG->>DB: Update descendant paths
            TRIG->>DB: Recalculate all child paths
        end

        TRIG->>DB: Update item counts
        DB-->>SVC: Updated category
        SVC->>DB: COMMIT TRANSACTION

        SVC->>CACHE: Invalidate category + children cache
        SVC->>AUDIT: Log update event

        SVC-->>API: Success + updated data
        API-->>UI: 200 OK
        UI->>UI: Refresh category tree
        UI->>U: Show success message
    end
```

---

### 3. Soft Delete with Cascade Sequence

**Purpose**: Documents the soft delete process with cascading deletion of children.

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React UI
    participant API as API Route
    participant SVC as Category Service
    participant DB as Database
    participant TRIG as DB Triggers
    participant CACHE as Cache
    participant AUDIT as Audit Log

    U->>UI: Click "Delete Category"
    UI->>API: GET /api/categories/:id/deletion-impact
    API->>SVC: getDeletionImpact(id)
    SVC->>DB: Count products WHERE category_id=?
    DB-->>SVC: Product count: 0
    SVC->>DB: Count children WHERE parent_id=?
    DB-->>SVC: Children count: 3
    SVC-->>API: Impact: 3 children, 0 products
    API-->>UI: 200 OK

    UI->>U: Show confirmation dialog:<br>"Will also delete 3 children"
    U->>UI: Confirm deletion

    UI->>API: DELETE /api/categories/:id
    API->>API: Authenticate & authorize
    API->>SVC: deleteCategory(id)

    SVC->>DB: Check product associations
    DB-->>SVC: No products found

    SVC->>DB: BEGIN TRANSACTION
    SVC->>DB: Recursive CTE query:<br>Find all descendants
    DB-->>SVC: List of 3 descendants

    SVC->>DB: UPDATE categories<br>SET deleted_at=NOW, deleted_by=user_id<br>WHERE id IN (parent, child1, child2, child3)

    DB->>TRIG: Execute soft_delete_cascade trigger
    TRIG->>DB: Update parent item counts
    TRIG->>DB: Recalculate hierarchy counts

    DB-->>SVC: 4 rows updated
    SVC->>DB: COMMIT TRANSACTION

    SVC->>CACHE: Invalidate all affected cache keys
    SVC->>AUDIT: Log deletion + cascade info:<br>"Deleted category + 3 children"

    SVC-->>API: Success + deletion summary
    API-->>UI: 200 OK
    UI->>UI: Remove from category tree
    UI->>U: Show success: "Category and 3 children deleted"
```

---

## State Diagrams

### Category Lifecycle State Diagram

**Purpose**: Shows the states a category can be in and valid transitions between states.

```mermaid
stateDiagram-v2
    [*] --> Draft: Create new category

    Draft --> Active: Activate category
    Draft --> Deleted: Delete draft

    Active --> Inactive: Deactivate
    Active --> Editing: Edit category
    Active --> Deleted: Soft delete

    Inactive --> Active: Reactivate
    Inactive --> Editing: Edit category
    Inactive --> Deleted: Soft delete

    Editing --> Active: Save changes (was active)
    Editing --> Inactive: Save changes (was inactive)
    Editing --> Active: Cancel edit (was active)
    Editing --> Inactive: Cancel edit (was inactive)

    Deleted --> [*]: Permanent deletion<br>(after retention period)
    Deleted --> Active: Restore category<br>(admin only)

    note right of Draft
        Initial state when created
        Not visible in production
    end note

    note right of Active
        Visible and usable
        Can have products assigned
        Appears in all lists
    end note

    note right of Inactive
        Hidden from general use
        Products retain association
        Visible to admins
    end note

    note right of Editing
        Locked for editing
        Temporary state
        Prevents concurrent edits
    end note

    note right of Deleted
        Soft deleted (deleted_at set)
        Retained for audit trail
        Can be restored by admin
        Auto-purged after 1 year
    end note
```

---

## Workflow Diagrams

### Category Management Workflow

**Purpose**: Comprehensive workflow showing complete category lifecycle management.

```mermaid
flowchart TB
    Start([Start Category Management]) --> ViewList[View Category List<br>Hierarchical Tree]

    ViewList --> UserAction{User Action}

    UserAction -->|Create| ValidateCreate{Has Create<br>Permission?}
    UserAction -->|Edit| SelectEdit[Select Category to Edit]
    UserAction -->|Delete| SelectDelete[Select Category to Delete]
    UserAction -->|Reorder| DragDrop[Drag & Drop to Reorder]
    UserAction -->|Search| Search[Search & Filter Categories]
    UserAction -->|View Details| ViewDetails[View Category Details]

    ValidateCreate -->|No| ShowAuthError[Show Permission Error]
    ValidateCreate -->|Yes| CreateFlow[Execute Create Flow]

    ShowAuthError --> ViewList

    CreateFlow --> CheckSuccess{Create<br>Successful?}
    CheckSuccess -->|No| ShowCreateError[Show Error Message]
    CheckSuccess -->|Yes| ShowCreateSuccess[Show Success Message]

    ShowCreateError --> CreateFlow
    ShowCreateSuccess --> RefreshList1[Refresh Category List]
    RefreshList1 --> ViewList

    SelectEdit --> ValidateEdit{Has Edit<br>Permission?}
    ValidateEdit -->|No| ShowAuthError
    ValidateEdit -->|Yes| EditFlow[Execute Edit Flow]

    EditFlow --> CheckEditSuccess{Edit<br>Successful?}
    CheckEditSuccess -->|No| ShowEditError[Show Error Message]
    CheckEditSuccess -->|Yes| ShowEditSuccess[Show Success Message]

    ShowEditError --> EditFlow
    ShowEditSuccess --> RefreshList2[Refresh Category List]
    RefreshList2 --> ViewList

    SelectDelete --> ValidateDelete{Has Delete<br>Permission?}
    ValidateDelete -->|No| ShowAuthError
    ValidateDelete -->|Yes| CheckImpact[Check Deletion Impact]

    CheckImpact --> ShowImpact[Show Impact:<br>Products, Children]
    ShowImpact --> ConfirmDelete{User<br>Confirms?}

    ConfirmDelete -->|No| ViewList
    ConfirmDelete -->|Yes| DeleteFlow[Execute Delete Flow]

    DeleteFlow --> CheckDeleteSuccess{Delete<br>Successful?}
    CheckDeleteSuccess -->|No| ShowDeleteError[Show Error Message]
    CheckDeleteSuccess -->|Yes| ShowDeleteSuccess[Show Success Message]

    ShowDeleteError --> ViewList
    ShowDeleteSuccess --> RefreshList3[Refresh Category List]
    RefreshList3 --> ViewList

    DragDrop --> ValidateReorder{Has Reorder<br>Permission?}
    ValidateReorder -->|No| ShowAuthError
    ValidateReorder -->|Yes| ReorderFlow[Execute Reorder Flow]

    ReorderFlow --> CheckReorderSuccess{Reorder<br>Successful?}
    CheckReorderSuccess -->|No| ShowReorderError[Show Error Message]
    CheckReorderSuccess -->|Yes| ShowReorderSuccess[Show Success Indicator]

    ShowReorderError --> RevertReorder[Revert UI Changes]
    RevertReorder --> ViewList
    ShowReorderSuccess --> ViewList

    Search --> ShowResults[Display Search Results]
    ShowResults --> ViewList

    ViewDetails --> ShowDetail[Show Detail Page<br>with Products]
    ShowDetail --> DetailAction{Action}

    DetailAction -->|Edit| SelectEdit
    DetailAction -->|Delete| SelectDelete
    DetailAction -->|Back| ViewList

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style ShowAuthError fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ShowCreateError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ShowEditError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ShowDeleteError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ShowReorderError fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ShowCreateSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style ShowEditSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style ShowDeleteSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style ShowReorderSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

---

## System Integration Diagrams

### 1. Categories ↔ Products Integration

**Purpose**: Shows how Categories module integrates with Products module.

```mermaid
flowchart TB
    subgraph 'Categories Module'
        CatUI[Category Management UI]
        CatAPI[Category API]
        CatService[Category Service]
        CatDB[(categories table)]
    end

    subgraph 'Products Module'
        ProdUI[Product Management UI]
        ProdAPI[Product API]
        ProdService[Product Service]
        ProdDB[(products table)]
    end

    subgraph 'Shared Services'
        Cache[Redis Cache]
        Audit[Audit Log Service]
        Events[Event Bus]
    end

    %% Category to Product flows
    CatUI -->|Create/Update/Delete| CatAPI
    CatAPI --> CatService
    CatService --> CatDB

    CatService -->|Invalidate cache| Cache
    CatService -->|Publish event| Events
    CatService -->|Log action| Audit

    Events -->|category.created| ProdService
    Events -->|category.updated| ProdService
    Events -->|category.deleted| ProdService

    ProdService -->|Invalidate cache| Cache
    ProdService -->|Check products| ProdDB

    %% Product to Category flows
    ProdUI -->|Assign category| ProdAPI
    ProdAPI --> ProdService
    ProdService --> ProdDB

    ProdService -->|Update item_count| CatService
    ProdService -->|Publish event| Events

    Events -->|product.category_changed| CatService
    CatService -->|Update counts| CatDB

    %% Lookup flows
    ProdUI -.->|Lookup categories| CatAPI
    CatAPI -.->|Return list| ProdUI

    CatUI -.->|View products| ProdAPI
    ProdAPI -.->|Return filtered list| CatUI

    style CatUI fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style CatAPI fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style CatService fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style CatDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style ProdUI fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style ProdAPI fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ProdService fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ProdDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style Cache fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Audit fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style Events fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
```

---

### 2. Categories ↔ User Management Integration

**Purpose**: Documents integration with user management for authentication and authorization.

```mermaid
flowchart LR
    subgraph 'Categories Module'
        CatAPI[Category API]
        CatService[Category Service]
    end

    subgraph 'User Management'
        AuthMiddleware[Auth Middleware]
        RBACService[RBAC Service]
        UserDB[(users table)]
        RoleDB[(roles table)]
    end

    subgraph 'Audit System'
        AuditLog[(audit_logs table)]
    end

    Request[HTTP Request] --> AuthMiddleware

    AuthMiddleware -->|Verify JWT| Check{Token<br>Valid?}

    Check -->|No| Reject[401 Unauthorized]
    Check -->|Yes| ExtractUser[Extract User ID<br>& Context]

    ExtractUser --> RBACService
    RBACService --> UserDB
    RBACService --> RoleDB

    RBACService -->|Check permissions| AuthCheck{Has<br>Permission?}

    AuthCheck -->|No| Deny[403 Forbidden]
    AuthCheck -->|Yes| CatAPI

    CatAPI -->|Process with user_id| CatService

    CatService -->|Set created_by/<br>updated_by/<br>deleted_by| UserContext[User Context]

    CatService --> AuditLog

    AuditLog -->|Record action| LogEntry[user_id, action,<br>timestamp, details]

    style Request fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Reject fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style Deny fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style AuthMiddleware fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style RBACService fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style CatAPI fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style CatService fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style UserDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style RoleDB fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style AuditLog fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

---

## Swimlane Diagrams

### Category Creation Across Roles

**Purpose**: Shows responsibilities of different actors in the category creation process.

```mermaid
flowchart TB
    subgraph User['👤 User (Product Manager)']
        U1[Access category page]
        U2[Click Create Category]
        U3[Fill form fields]
        U4[Submit form]
        U5[Review success/error]
    end

    subgraph Frontend['💻 Frontend Application']
        F1[Render category list]
        F2[Display create form]
        F3[Validate form inputs]
        F4[Send API request]
        F5[Display response]
    end

    subgraph Backend['⚙️ Backend Service']
        B1[Authenticate request]
        B2[Authorize action]
        B3[Validate business rules]
        B4[Execute database operation]
        B5[Return response]
    end

    subgraph Database['🗄️ Database']
        D1[Check constraints]
        D2[Insert record]
        D3[Execute triggers]
        D4[Return result]
    end

    U1 --> F1
    F1 --> U2
    U2 --> F2
    F2 --> U3
    U3 --> F3
    F3 --> U4
    U4 --> F4

    F4 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4

    B4 --> D1
    D1 --> D2
    D2 --> D3
    D3 --> D4

    D4 --> B5
    B5 --> F5
    F5 --> U5

    style U1 fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style U2 fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style U3 fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style U4 fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style U5 fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style F3 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style B3 fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style D1 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style D3 fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
```

---

## Decision Trees

### Category Deletion Decision Tree

**Purpose**: Documents the decision logic for determining if a category can be deleted.

```mermaid
flowchart TD
    Start{Delete Category<br>Request} --> CheckAuth{User has<br>delete permission?}

    CheckAuth -->|No| ResultDeny[❌ DENY<br>Permission Error]
    CheckAuth -->|Yes| CheckProducts{Has assigned<br>products?}

    CheckProducts -->|Yes| ResultBlock[❌ BLOCK<br>Remove products first]
    CheckProducts -->|No| CheckChildren{Has child<br>categories?}

    CheckChildren -->|No| AllowSimple[✅ ALLOW<br>Simple soft delete]
    CheckChildren -->|Yes| CountChildren[Count descendants:<br>Level 2 + Level 3]

    CountChildren --> ShowImpact{Show impact:<br>N children<br>will be deleted}

    ShowImpact --> UserConfirm{User confirms<br>cascade delete?}

    UserConfirm -->|No| ResultCancel[⏸️ CANCEL<br>User cancelled]
    UserConfirm -->|Yes| AllowCascade[✅ ALLOW<br>Cascade soft delete]

    AllowSimple --> CheckSystem{System<br>category?}
    AllowCascade --> CheckSystem

    CheckSystem -->|Yes| ResultProtect[❌ PROTECT<br>System category]
    CheckSystem -->|No| FinalAllow[✅ PROCEED<br>Execute delete]

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style ResultDeny fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ResultBlock fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ResultCancel fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style ResultProtect fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style AllowSimple fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style AllowCascade fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style FinalAllow fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

---

### Category Update Validation Decision Tree

**Purpose**: Shows validation logic for category updates.

```mermaid
flowchart TD
    Start{Update Category<br>Request} --> CheckAuth{User has<br>edit permission?}

    CheckAuth -->|No| ResultDeny[❌ DENY<br>Permission Error]
    CheckAuth -->|Yes| CheckExists{Category<br>exists?}

    CheckExists -->|No| Result404[❌ NOT FOUND<br>Category does not exist]
    CheckExists -->|Yes| CheckDeleted{Is soft<br>deleted?}

    CheckDeleted -->|Yes| ResultDeleted[❌ INVALID<br>Cannot edit deleted]
    CheckDeleted -->|No| ValidateName{Name valid?<br>1-100 chars}

    ValidateName -->|No| ResultInvalidName[❌ INVALID<br>Name validation failed]
    ValidateName -->|Yes| CheckNameUnique{Name unique<br>within parent?}

    CheckNameUnique -->|No| ResultDuplicate[❌ DUPLICATE<br>Name already exists]
    CheckNameUnique -->|Yes| CheckParentChange{Parent ID<br>changed?}

    CheckParentChange -->|No| AllowUpdate[✅ ALLOW<br>Standard update]
    CheckParentChange -->|Yes| CheckChildren{Has<br>children?}

    CheckChildren -->|Yes| ResultMoveBlock[❌ BLOCK<br>Cannot move with children]
    CheckChildren -->|No| ValidateNewParent{New parent<br>valid?}

    ValidateNewParent -->|No| ResultInvalidParent[❌ INVALID<br>Invalid parent]
    ValidateNewParent -->|Yes| CheckLoop{Would create<br>circular reference?}

    CheckLoop -->|Yes| ResultCircular[❌ INVALID<br>Circular reference]
    CheckLoop -->|No| CheckLevel{New level<br>valid? (1-3)}

    CheckLevel -->|No| ResultInvalidLevel[❌ INVALID<br>Level out of range]
    CheckLevel -->|Yes| AllowMove[✅ ALLOW<br>Update with move]

    AllowUpdate --> Proceed[✅ PROCEED<br>Execute update]
    AllowMove --> Proceed

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style ResultDeny fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style Result404 fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ResultDeleted fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ResultInvalidName fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ResultDuplicate fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ResultMoveBlock fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ResultInvalidParent fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ResultCircular fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ResultInvalidLevel fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style AllowUpdate fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style AllowMove fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style Proceed fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
```

---

## Activity Diagrams

### User Activity: Managing Categories End-to-End

**Purpose**: Shows the complete user journey for managing categories from login to completion.

```mermaid
flowchart TD
    Start([User Logs In]) --> Dashboard[Navigate to<br>Product Management]

    Dashboard --> CatPage[Access Categories<br>Sub-module]

    CatPage --> LoadTree[System loads<br>category tree]

    LoadTree --> ViewTree[User views<br>hierarchical tree]

    ViewTree --> Decide{User Decision}

    Decide -->|Create New| CreateAction[Create Category Activity]
    Decide -->|Modify Existing| EditAction[Edit Category Activity]
    Decide -->|Remove Category| DeleteAction[Delete Category Activity]
    Decide -->|Reorganize| ReorderAction[Reorder Category Activity]
    Decide -->|Find Category| SearchAction[Search Activity]
    Decide -->|Exit| Exit([End Session])

    CreateAction --> SelectLevel[Select hierarchy level:<br>Category/Subcategory/Item Group]
    SelectLevel --> SelectParent{Level > 1?}
    SelectParent -->|Yes| ChooseParent[Choose parent category]
    SelectParent -->|No| FillName
    ChooseParent --> FillName[Fill name & description]
    FillName --> SetOrder[Set sort order]
    SetOrder --> SubmitCreate[Submit creation]
    SubmitCreate --> ValidateCreate{Valid?}
    ValidateCreate -->|No| FixErrors[Fix validation errors]
    FixErrors --> FillName
    ValidateCreate -->|Yes| CreateSuccess[Category created]
    CreateSuccess --> ViewTree

    EditAction --> SelectEdit[Select category to edit]
    SelectEdit --> LoadEdit[Load category data]
    LoadEdit --> ModifyFields[Modify fields:<br>name, description,<br>status, sort order]
    ModifyFields --> SubmitEdit[Submit changes]
    SubmitEdit --> ValidateEdit{Valid?}
    ValidateEdit -->|No| FixEditErrors[Fix validation errors]
    FixEditErrors --> ModifyFields
    ValidateEdit -->|Yes| EditSuccess[Category updated]
    EditSuccess --> ViewTree

    DeleteAction --> SelectDelete[Select category to delete]
    SelectDelete --> CheckImpactDel[System shows<br>deletion impact]
    CheckImpactDel --> ConfirmDelete{User confirms?}
    ConfirmDelete -->|No| ViewTree
    ConfirmDelete -->|Yes| ExecuteDelete[Execute soft delete]
    ExecuteDelete --> DeleteSuccess[Category deleted]
    DeleteSuccess --> ViewTree

    ReorderAction --> DragCategory[Drag category<br>to new position]
    DragCategory --> DropCategory[Drop in new position]
    DropCategory --> ValidateReorder{Valid<br>drop zone?}
    ValidateReorder -->|No| RevertDrag[Revert to original]
    RevertDrag --> ViewTree
    ValidateReorder -->|Yes| SaveOrder[Save new order]
    SaveOrder --> ReorderSuccess[Order updated]
    ReorderSuccess --> ViewTree

    SearchAction --> EnterSearch[Enter search term]
    EnterSearch --> FilterTree[System filters tree]
    FilterTree --> ViewResults[View search results]
    ViewResults --> ClearSearch{Clear<br>search?}
    ClearSearch -->|Yes| ViewTree
    ClearSearch -->|No| Decide

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Exit fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style CreateSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style EditSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style DeleteSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style ReorderSuccess fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style FixErrors fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style FixEditErrors fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style RevertDrag fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
```

---

## Component Interaction Diagrams

### Frontend Component Interaction

**Purpose**: Shows how React components interact in the Category Management UI.

```mermaid
flowchart TB
    subgraph 'Page Level'
        CatPage[CategoryManagementPage]
    end

    subgraph 'Container Components'
        CatList[CategoryListContainer]
        CatForm[CategoryFormContainer]
        CatDetail[CategoryDetailContainer]
    end

    subgraph 'Presentational Components'
        TreeView[CategoryTreeView]
        TreeNode[CategoryTreeNode]
        FormFields[CategoryFormFields]
        Breadcrumb[BreadcrumbNav]
        ActionBar[ActionButtons]
        ConfirmDialog[ConfirmDialog]
    end

    subgraph 'State Management'
        Store[Zustand Store]
        CatState[categoryState]
        UIState[uiState]
    end

    subgraph 'Hooks'
        UseCategories[useCategories]
        UseCategoryMutations[useCategoryMutations]
        UseTreeNavigation[useTreeNavigation]
    end

    subgraph 'API Layer'
        QueryClient[React Query Client]
        API[Category API Service]
    end

    CatPage --> CatList
    CatPage --> CatForm
    CatPage --> CatDetail

    CatList --> TreeView
    TreeView --> TreeNode
    TreeNode --> TreeNode

    CatForm --> FormFields
    CatForm --> ActionBar

    CatDetail --> Breadcrumb
    CatDetail --> ActionBar

    CatList --> UseCategories
    CatForm --> UseCategoryMutations
    CatDetail --> UseCategories
    TreeView --> UseTreeNavigation

    UseCategories --> QueryClient
    UseCategoryMutations --> QueryClient

    QueryClient <--> API

    UseCategories --> Store
    UseCategoryMutations --> Store
    UseTreeNavigation --> Store

    Store --> CatState
    Store --> UIState

    ActionBar --> ConfirmDialog

    style CatPage fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style CatList fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style CatForm fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style CatDetail fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Store fill:#e0ccff,stroke:#6600cc,stroke-width:2px,color:#000
    style QueryClient fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style API fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
```

---

## Error Handling Flow

### Category Validation Error Handling

**Purpose**: Documents error handling for various validation failures.

```mermaid
flowchart TD
    Start[Category Operation] --> Try{Execute<br>Operation}

    Try -->|Success| Success([✅ Success<br>Return result])
    Try -->|Error| ClassifyError{Error Type}

    ClassifyError -->|Validation Error| ValError[Validation Error Handler]
    ClassifyError -->|Duplicate Name| DupError[Duplicate Error Handler]
    ClassifyError -->|Constraint Violation| ConstraintError[Constraint Error Handler]
    ClassifyError -->|Permission Error| PermError[Permission Error Handler]
    ClassifyError -->|Network Error| NetError[Network Error Handler]
    ClassifyError -->|Database Error| DBError[Database Error Handler]

    ValError --> FormatVal[Format Validation Messages:<br>- Field-specific errors<br>- User-friendly text]
    FormatVal --> ReturnVal[Return 400 Bad Request<br>with error details]
    ReturnVal --> UserFixVal[User corrects input]
    UserFixVal --> Try

    DupError --> FormatDup[Format Duplicate Message:<br>'Category name already exists']
    FormatDup --> ReturnDup[Return 409 Conflict]
    ReturnDup --> UserFixDup[User changes name]
    UserFixDup --> Try

    ConstraintError --> CheckType{Constraint<br>Type}
    CheckType -->|Hierarchy| HierMsg['Cannot move category<br>with children']
    CheckType -->|Foreign Key| FKMsg['Cannot delete:<br>products assigned']
    CheckType -->|Check| CheckMsg['Invalid level<br>or sort order']

    HierMsg --> ReturnConstraint[Return 400 Bad Request]
    FKMsg --> ReturnConstraint
    CheckMsg --> ReturnConstraint
    ReturnConstraint --> UserFixConstraint[User resolves constraint]
    UserFixConstraint --> Try

    PermError --> LogPermission[Log unauthorized attempt]
    LogPermission --> ReturnPerm[Return 403 Forbidden]
    ReturnPerm --> UserContact[User contacts admin]
    UserContact --> EndPerm([End - No retry])

    NetError --> CheckRetry{Retryable?}
    CheckRetry -->|Yes| CountRetry{Retry count<br>< 3?}
    CheckRetry -->|No| ReturnNet[Return 503 Service Unavailable]
    ReturnNet --> ShowOffline[Show offline message]
    ShowOffline --> EndNet([End - Manual retry])

    CountRetry -->|Yes| WaitBackoff[Wait with exponential backoff:<br>1s, 2s, 4s]
    CountRetry -->|No| ReturnNet
    WaitBackoff --> Try

    DBError --> LogDB[Log database error<br>with stack trace]
    LogDB --> AlertOps[Alert operations team]
    AlertOps --> ReturnDB[Return 500 Internal Error]
    ReturnDB --> ShowGeneric[Show generic error message]
    ShowGeneric --> EndDB([End - Ops intervention])

    style Start fill:#cce5ff,stroke:#0066cc,stroke-width:2px,color:#000
    style Success fill:#ccffcc,stroke:#00cc00,stroke-width:2px,color:#000
    style ReturnVal fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ReturnDup fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ReturnConstraint fill:#ffe0b3,stroke:#cc6600,stroke-width:2px,color:#000
    style ReturnPerm fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ReturnNet fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style ReturnDB fill:#ffcccc,stroke:#cc0000,stroke-width:2px,color:#000
    style EndPerm fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style EndNet fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
    style EndDB fill:#e8e8e8,stroke:#333,stroke-width:2px,color:#000
```

---

## Glossary

- **Actor**: Entity (user, system, or service) that interacts with the Categories system
- **Cascade Delete**: Soft delete operation that recursively marks all descendant categories as deleted
- **Decision Point**: Point in a flow where the path branches based on conditions or validations
- **Fork/Join**: Parallel processing pattern where operations split and later synchronize
- **Guard**: Condition that must be true for a transition or operation to proceed
- **Hierarchy Path**: Breadcrumb trail showing full category ancestry (e.g., "Food → Beverages → Coffee")
- **Item Count**: Number of products directly assigned to a category
- **Level**: Numeric indicator of category depth in hierarchy (1 = Category, 2 = Subcategory, 3 = Item Group)
- **Optimistic UI**: UI pattern where changes are shown immediately before server confirmation
- **Parent-Child Relationship**: Self-referencing foreign key relationship forming the category hierarchy
- **Soft Delete**: Logical deletion using deleted_at timestamp without physically removing the record
- **Sort Order**: Zero-based integer determining display order within a parent category
- **State**: Distinct condition or stage in the category lifecycle (Active, Inactive, Deleted)
- **Swimlane**: Visual separation in diagrams showing actor or component responsibilities
- **Total Item Count**: Aggregated count of products in category plus all descendants
- **Transition**: Movement from one state to another based on user action or system event
- **Tree View**: Hierarchical visual representation of categories with expand/collapse functionality

---

## Diagram Conventions

### Color Coding

This document uses consistent colors across all diagrams:

- **Blue (#cce5ff)**: User interface elements, start points, user actions
- **Orange (#ffe0b3)**: Application logic, validation, warnings, business processes
- **Purple (#e0ccff)**: Data layer, database operations, storage
- **Green (#ccffcc)**: Success states, completion, positive outcomes
- **Red (#ffcccc)**: Error states, failures, blocked operations, denial
- **Gray (#e8e8e8)**: Cancelled operations, neutral states, intermediary steps

### Arrow Styles

- **Solid arrows (→)**: Direct control flow or data flow
- **Dashed arrows (-→)**: Return flow, callback, or lookup operations
- **Bidirectional arrows (↔)**: Two-way communication or synchronization

### Node Shapes

- **Rectangle**: Process step or action
- **Diamond**: Decision point or conditional branch
- **Rounded rectangle**: Start or end point
- **Cylinder**: Database or storage
- **Cloud**: External system or service

---

## Tools Used

- **Mermaid**: All diagrams rendered using Mermaid syntax for version control and easy updates
- **Markdown**: Documentation format for readability and GitHub integration
- **Export Options**: Diagrams can be exported as PNG/SVG using Mermaid CLI or online tools

---

## Maintenance

### Update Triggers

This flow diagram document should be updated when:

- New category operations are added (e.g., bulk operations, import/export)
- Business rules change (e.g., hierarchy depth increased to 4 levels)
- Integration points are modified (e.g., new module dependencies)
- State transitions are altered (e.g., new approval workflow added)
- Error handling logic changes (e.g., new validation rules)
- Performance optimizations affect data flow (e.g., caching strategy changes)
- UI/UX changes impact user workflows (e.g., new navigation patterns)

### Review Schedule

- **Monthly**: Quick review to verify diagram accuracy with current implementation
- **Quarterly**: Comprehensive review and update of all diagrams
- **On Major Change**: Immediate update when system architecture or business logic changes significantly
- **Post-Release**: Review and update within 1 week after major feature releases

### Version Control

All diagram changes should be:
1. Documented in the Document History table at the top of this file
2. Reviewed by technical lead before committing
3. Synced with related documentation (BR, UC, TS, DS, VAL files)
4. Tested for Mermaid rendering in target environments

---

## Related Documents

- **[Business Requirements](./BR-categories.md)**: Business rules and functional requirements for Categories
- **[Use Cases](./UC-categories.md)**: Detailed use case scenarios and user interactions
- **[Technical Specification](./TS-categories.md)**: Technical implementation details and architecture
- **[Data Dictionary](./DD-categories.md)**: Complete database schema and field definitions
- **[Validation Rules](./VAL-categories.md)**: Input validation and business rule validation logic

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Analyst | | | |
| Technical Lead | | | |
| Product Manager | | | |
| QA Lead | | | |

---

**Document End**

> 📝 **Notes for Developers**:
> - All Mermaid diagrams render correctly in GitHub, GitLab, and most modern markdown viewers
> - To edit diagrams, modify the Mermaid syntax directly in this markdown file
> - Test rendering using Mermaid Live Editor (https://mermaid.live/) before committing
> - Maintain consistent color scheme and notation across all diagrams
> - Keep diagrams focused - create separate diagrams rather than overcrowding a single one
> - Update the Document History table whenever changes are made
> - Ensure all cross-references to other documents remain valid
