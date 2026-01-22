# Flow Diagrams: Account Code Mapping

## Module Information
- **Module**: Finance
- **Sub-Module**: Account Code Mapping
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format |
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |

---

## Overview

This document provides visual representations of the Account Code Mapping module workflows using Mermaid 8.8.2 compatible diagrams. The diagrams reflect the actual implementation which uses local state management for CRUD operations on AP and GL mapping records.

**Related Documents**:
- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Data Dictionary](./DD-account-code-mapping.md)
- [Validations](./VAL-account-code-mapping.md)

---

## 1. Component Architecture

```mermaid
graph TD
    A[AccountCodeMappingPage] --> B[AccountCodeMapping]
    B --> C[View Selector]
    B --> D[Search Filter]
    B --> E[Action Toolbar]
    B --> F[AP Mapping Table]
    B --> G[GL Mapping Table]
    B --> H[View Dialog]
    B --> I[Create Dialog]
    B --> J[Edit Dialog]
```

---

## 2. View Selection Flow

```mermaid
graph TD
    A[Page Load] --> B[Initialize State]
    B --> C{selectedView}
    C -->|posting-to-ap| D[Render AP Table]
    C -->|posting-to-gl| E[Render GL Table]
    D --> F[Display AP Columns]
    E --> G[Display GL Columns]
    F --> H[Show Footer: AP Description]
    G --> I[Show Footer: GL Description]
```

---

## 3. Search Filter Flow

```mermaid
graph TD
    A[User Types in Search] --> B[Update searchTerm State]
    B --> C{Current View}
    C -->|AP View| D[Filter apMappingData]
    C -->|GL View| E[Filter glMappingData]
    D --> F[Match Against All Fields]
    E --> F
    F --> G[Case-insensitive Comparison]
    G --> H[Return Filtered Results]
    H --> I[Re-render Table]
```

---

## 4. Create Mapping Flow

```mermaid
graph TD
    A[Click Create Button] --> B[Open Create Dialog]
    B --> C[Initialize Empty formData]
    C --> D{Current View}
    D -->|AP| E[Show AP Form Fields]
    D -->|GL| F[Show GL Form Fields]
    E --> G[User Fills Form]
    F --> G
    G --> H{User Action}
    H -->|Cancel| I[Close Dialog]
    H -->|Create| J[Generate New ID]
    J --> K[Add to State Array]
    K --> L[Close Dialog]
    L --> M[Clear formData]
    I --> M
```

---

## 5. View Mapping Flow

```mermaid
graph TD
    A[Click Eye Icon] --> B[Set selectedMapping]
    B --> C[Open View Dialog]
    C --> D{Current View}
    D -->|AP| E[Display AP Fields]
    D -->|GL| F[Display GL Fields]
    E --> G[Read-only Display]
    F --> G
    G --> H[User Clicks Close]
    H --> I[Close Dialog]
    I --> J[Clear selectedMapping]
```

---

## 6. Edit Mapping Flow

```mermaid
graph TD
    A[Click Edit Icon] --> B[Set selectedMapping]
    B --> C[Copy to formData]
    C --> D[Open Edit Dialog]
    D --> E{Current View}
    E -->|AP| F[Show AP Form]
    E -->|GL| G[Show GL Form]
    F --> H[User Edits Fields]
    G --> H
    H --> I{User Action}
    I -->|Cancel| J[Close Dialog]
    I -->|Save| K[Update State Array]
    K --> L[Close Dialog]
    J --> M[Clear formData]
    L --> M
    M --> N[Clear selectedMapping]
```

---

## 7. Delete Mapping Flow

```mermaid
graph TD
    A[Click Delete Icon] --> B[Show Confirmation]
    B --> C{User Confirms}
    C -->|No| D[Cancel Action]
    C -->|Yes| E{Current View}
    E -->|AP| F[Filter apMappingData]
    E -->|GL| G[Filter glMappingData]
    F --> H[Remove by ID]
    G --> H
    H --> I[Update State]
    I --> J[Re-render Table]
```

---

## 8. Duplicate Mapping Flow

```mermaid
graph TD
    A[Click Duplicate Icon] --> B[Get Current Mapping]
    B --> C[Generate New ID]
    C --> D{Current View}
    D -->|AP| E[Clone AP Mapping]
    D -->|GL| F[Clone GL Mapping]
    E --> G[Add to State Array]
    F --> G
    G --> H[Re-render Table]
```

---

## 9. Action Toolbar Flow

```mermaid
graph TD
    A[Action Toolbar]
    A --> B[Scan Button]
    A --> C[Import/Export Button]
    A --> D[Print Button]
    A --> E[Create Button]

    B --> F[Show Placeholder Alert]
    C --> G[Show Placeholder Alert]
    D --> H[Call window.print]
    E --> I[Open Create Dialog]
```

---

## 10. State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> ViewOpen: handleView
    ViewOpen --> Idle: close dialog

    Idle --> CreateOpen: handleCreate
    CreateOpen --> Idle: cancel
    CreateOpen --> DataUpdated: save
    DataUpdated --> Idle: dialog closed

    Idle --> EditOpen: handleEdit
    EditOpen --> Idle: cancel
    EditOpen --> DataUpdated: save

    Idle --> DataUpdated: handleDelete
    Idle --> DataUpdated: handleDuplicate
```

---

## 11. Dialog State Cleanup

```mermaid
graph TD
    A[Dialog Closes] --> B{Which Dialog}

    B -->|View Dialog| C[useEffect triggers]
    C --> D[Clear selectedMapping]

    B -->|Create Dialog| E[useEffect triggers]
    E --> F[Clear formData]

    B -->|Edit Dialog| G[useEffect triggers]
    G --> H[Clear formData]
    H --> I[Clear selectedMapping]
```

---

## 12. AP vs GL Table Comparison

```mermaid
graph LR
    subgraph APTable[AP Table Columns]
        A1[Business Unit]
        A2[Store]
        A3[Category]
        A4[Sub-Category]
        A5[Item Group]
        A6[Department]
        A7[Account Code]
        A8[Actions]
    end

    subgraph GLTable[GL Table Columns]
        G1[Business Unit]
        G2[Store]
        G3[Category]
        G4[Item Group]
        G5[Movement Type]
        G6[Dr. Department]
        G7[Cr. Department]
        G8[Dr. Account]
        G9[Cr. Account]
        G10[Actions]
    end
```

---

## 13. Data Flow Overview

```mermaid
graph TD
    subgraph UserActions[User Actions]
        UA1[Search]
        UA2[Switch View]
        UA3[CRUD Operations]
    end

    subgraph State[Component State]
        S1[selectedView]
        S2[searchTerm]
        S3[apMappingData]
        S4[glMappingData]
        S5[formData]
        S6[selectedMapping]
        S7[Dialog States]
    end

    subgraph Rendering[Rendering]
        R1[Filter Data]
        R2[Select Table]
        R3[Render Rows]
        R4[Show Dialogs]
    end

    UA1 --> S2
    UA2 --> S1
    UA3 --> S3
    UA3 --> S4
    UA3 --> S5
    UA3 --> S6
    UA3 --> S7

    S1 --> R2
    S2 --> R1
    S3 --> R1
    S4 --> R1
    R1 --> R3
    R2 --> R3
    S7 --> R4
```

---

## 14. Page Layout Structure

```mermaid
graph TD
    subgraph Page[Account Code Mapping Page]
        H[Header: Title + Actions]
        F[Filter Bar: Search + View Selector]
        T[Table: AP or GL based on view]
        FT[Footer: Description Text]
    end

    H --> F
    F --> T
    T --> FT
```

---

## 15. Row Actions Menu Flow

```mermaid
graph TD
    A[Click MoreHorizontal Icon] --> B[Open DropdownMenu]
    B --> C{User Selection}
    C -->|View| D[handleView]
    C -->|Edit| E[handleEdit]
    C -->|Duplicate| F[handleDuplicate]
    C -->|Delete| G[handleDelete]
    D --> H[Open View Dialog]
    E --> I[Open Edit Dialog]
    F --> J[Clone Record]
    G --> K[Confirm and Remove]
```

---

## Related Documents

- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Data Dictionary](./DD-account-code-mapping.md)
- [Validations](./VAL-account-code-mapping.md)

---

**Document End**
