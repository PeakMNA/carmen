# Flow Diagrams: Currency Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Currency Management
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format |
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |

---

## Overview

This document provides visual representations of the Currency Management module's workflows. The current implementation covers basic CRUD operations for currency master data management.

**Related Documents**:
- [Business Requirements](./BR-currency-management.md)
- [Use Cases](./UC-currency-management.md)
- [Technical Specification](./TS-currency-management.md)
- [Data Dictionary](./DD-currency-management.md)
- [Validations](./VAL-currency-management.md)

---

## Diagram Index

| Diagram | Type | Purpose |
|---------|------|---------|
| [Main Page Flow](#main-page-flow) | Process | Currency list display and filtering |
| [Create Currency Flow](#create-currency-flow) | Process | Adding new currency |
| [Edit Currency Flow](#edit-currency-flow) | Process | Modifying existing currency |
| [Delete Currency Flow](#delete-currency-flow) | Process | Removing currencies |
| [Component Hierarchy](#component-hierarchy) | Structure | UI component structure |
| [State Management](#state-management-flow) | Data | State flow diagram |

---

## Main Page Flow

### FD-CUR-001: Currency List Display

```mermaid
flowchart TD
    A[User navigates to Currency Management] --> B[Page loads]
    B --> C[Initialize state with mock data]
    C --> D[Display currency table]

    D --> E{User action?}

    E -->|Search| F[Update searchTerm state]
    F --> G[Filter currencies]
    G --> D

    E -->|Toggle Show Active| H[Update showActive state]
    H --> G

    E -->|Select row| I[Update selectedCurrencies]
    I --> D

    E -->|Select all| J[Toggle all selections]
    J --> D

    E -->|Click Create| K[Open Create Dialog]
    E -->|Click Edit| L[Open Edit Dialog]
    E -->|Click Delete| M[Show confirmation]
    E -->|Click Print| N[Trigger browser print]
```

### FD-CUR-002: Filter Logic

```mermaid
flowchart TD
    A[All Currencies] --> B{showActive is true?}
    B -->|Yes| C[Filter: active === true]
    B -->|No| D[Include all currencies]

    C --> E{Search term exists?}
    D --> E

    E -->|Yes| F[Match code OR description]
    E -->|No| G[No text filter]

    F --> H[Display filtered results]
    G --> H
```

---

## Create Currency Flow

### FD-CUR-003: Create New Currency

```mermaid
flowchart TD
    A[User clicks Create button] --> B[Open Create Dialog]
    B --> C[Display empty form]
    C --> D[User enters Currency Code]
    D --> E[Auto-uppercase conversion]
    E --> F[User enters Description]
    F --> G[User sets Active status]
    G --> H{User action?}

    H -->|Cancel| I[Close dialog]
    I --> J[No changes saved]

    H -->|Create| K{Validation}
    K -->|Code empty| L[Block creation]
    K -->|Description empty| L
    L --> C

    K -->|Valid| M[Add to currencies array]
    M --> N[Reset form state]
    N --> O[Close dialog]
    O --> P[Currency appears in table]
```

### FD-CUR-004: Create Dialog State Flow

```mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Open: Click Create button
    Open --> Editing: User types
    Editing --> Editing: Continue typing
    Editing --> Closed: Click Cancel
    Editing --> Validating: Click Create
    Validating --> Editing: Validation fails
    Validating --> Closed: Validation passes
    Closed --> [*]
```

---

## Edit Currency Flow

### FD-CUR-005: Edit Existing Currency

```mermaid
flowchart TD
    A[User clicks row Actions menu] --> B[Select Edit]
    B --> C[Set editingCurrency state]
    C --> D[Open Edit Dialog]
    D --> E[Display current values]

    E --> F[Currency Code: disabled]
    E --> G[Description: editable]
    E --> H[Active: editable]

    G --> I{User action?}
    H --> I

    I -->|Cancel| J[Clear editingCurrency]
    J --> K[Close dialog]
    K --> L[No changes saved]

    I -->|Save Changes| M[Update currency in array]
    M --> N[Clear editingCurrency]
    N --> O[Close dialog]
    O --> P[Table reflects changes]
```

---

## Delete Currency Flow

### FD-CUR-006: Single Delete

```mermaid
flowchart TD
    A[User clicks row Actions menu] --> B[Select Delete]
    B --> C[Browser confirm dialog]

    C -->|Cancel| D[No action]
    D --> E[Return to table]

    C -->|OK| F[Remove from currencies array]
    F --> G[Table updates]
```

### FD-CUR-007: Bulk Delete

```mermaid
flowchart TD
    A[User selects multiple rows] --> B[selectedCurrencies updated]
    B --> C[Delete button enabled]
    C --> D[User clicks Delete button]
    D --> E[Browser confirm dialog]
    E --> F{User confirms?}

    F -->|No| G[Return to table]

    F -->|Yes| H[Filter out selected codes]
    H --> I[Clear selectedCurrencies]
    I --> J[Table updates]
```

---

## Component Hierarchy

### FD-CUR-008: UI Component Structure

```mermaid
flowchart TD
    A[CurrencyManagement] --> B[Header Section]
    A --> C[Filter Section]
    A --> D[Table]
    A --> E[Create Dialog]
    A --> F[Edit Dialog]

    B --> B1[Title]
    B --> B2[Create Button]
    B --> B3[Delete Button]
    B --> B4[Print Button]

    C --> C1[Search Input]
    C --> C2[Show Active Checkbox]

    D --> D1[TableHeader]
    D --> D2[TableBody]

    D1 --> D1a[Select All Checkbox]
    D1 --> D1b[Column Headers]

    D2 --> D2a[TableRow - for each currency]
    D2a --> D2a1[Row Checkbox]
    D2a --> D2a2[Code Cell]
    D2a --> D2a3[Description Cell]
    D2a --> D2a4[Active Checkbox]
    D2a --> D2a5[Actions Menu]

    E --> E1[DialogHeader]
    E --> E2[Form Fields]
    E --> E3[DialogFooter]

    F --> F1[DialogHeader]
    F --> F2[Form Fields]
    F --> F3[DialogFooter]
```

---

## State Management Flow

### FD-CUR-009: State Relationships

```mermaid
flowchart TD
    subgraph "Primary State"
        A[currencies: Currency array]
    end

    subgraph "Filter State"
        B[showActive: boolean]
        C[searchTerm: string]
    end

    subgraph "Selection State"
        D[selectedCurrencies: string array]
    end

    subgraph "Dialog State"
        E[isCreateDialogOpen: boolean]
        F[isEditDialogOpen: boolean]
        G[editingCurrency: Currency or null]
        H[newCurrency: Currency]
    end

    subgraph "Computed"
        I[filteredCurrencies]
    end

    A --> I
    B --> I
    C --> I

    I --> D

    E --> H
    F --> G
```

### FD-CUR-010: Data Flow

```mermaid
flowchart LR
    subgraph "User Actions"
        A1[Type in search]
        A2[Toggle filter]
        A3[Select rows]
        A4[Create currency]
        A5[Edit currency]
        A6[Delete currency]
    end

    subgraph "State Updates"
        B1[setSearchTerm]
        B2[setShowActive]
        B3[setSelectedCurrencies]
        B4[setCurrencies]
    end

    subgraph "Re-render"
        C[Component re-renders]
        D[filteredCurrencies computed]
        E[UI updates]
    end

    A1 --> B1 --> C
    A2 --> B2 --> C
    A3 --> B3 --> C
    A4 --> B4 --> C
    A5 --> B4 --> C
    A6 --> B4 --> C

    C --> D --> E
```

---

## User Interaction Flow

### FD-CUR-011: Complete User Journey

```mermaid
flowchart TD
    Start[User opens Currency Management] --> View[View currency list]

    View --> Search{Search?}
    Search -->|Yes| TypeSearch[Type search term]
    TypeSearch --> FilterResults[See filtered results]
    FilterResults --> View

    Search -->|No| Filter{Filter active?}
    Filter -->|Yes| ToggleActive[Toggle Show Active]
    ToggleActive --> FilterResults

    Filter -->|No| Action{Select action}

    Action -->|Create| OpenCreate[Click Create button]
    OpenCreate --> FillForm[Fill currency form]
    FillForm --> SaveCreate[Click Create]
    SaveCreate --> View

    Action -->|Edit| ClickRow[Click row actions]
    ClickRow --> SelectEdit[Select Edit]
    SelectEdit --> ModifyForm[Modify form]
    ModifyForm --> SaveEdit[Click Save Changes]
    SaveEdit --> View

    Action -->|Delete| SelectRows[Select rows]
    SelectRows --> ClickDelete[Click Delete]
    ClickDelete --> Confirm[Confirm deletion]
    Confirm --> View

    Action -->|Print| ClickPrint[Click Print]
    ClickPrint --> BrowserPrint[Browser print dialog]
    BrowserPrint --> View
```

---

## Future Flow Diagrams (Planned)

The following diagrams are planned for future implementation phases:

| Diagram | Description | Phase |
|---------|-------------|-------|
| Exchange Rate Retrieval | Auto-fetch rates from APIs | Phase 3 |
| Manual Rate Entry | Manual rate with approval workflow | Phase 3 |
| Currency Conversion | Real-time conversion calculations | Phase 4 |
| Period-End Revaluation | Revalue foreign balances | Phase 4 |
| Exchange Gain/Loss | Calculate and post gains/losses | Phase 4 |

---

**Document End**
