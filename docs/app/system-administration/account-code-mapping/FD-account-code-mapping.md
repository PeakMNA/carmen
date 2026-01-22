# Flow Diagrams: Account Code Mapping

## Module Information
- **Module**: System Administration
- **Sub-Module**: Account Code Mapping
- **Route**: `/system-administration/account-code-mapping`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-17 | Documentation Team | Initial version |

---

## Overview

This document provides visual representations of the Account Code Mapping module workflows.

**Related Documents**:
- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Data Dictionary](./DD-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Validation Rules](./VAL-account-code-mapping.md)

---

## Page Load Flow

```mermaid
graph TD
    A[User navigates to /account-code-mapping] --> B[Page renders AccountCodeMapping]
    B --> C[Initialize state with mock data]
    C --> D[selectedView = posting-to-ap]
    D --> E[Render AP mapping table]
    E --> F[User sees mapping list with 6 AP records]
```

---

## View Switching Flow

```mermaid
graph TD
    A[User on Account Code Mapping page] --> B[Click View Name dropdown]
    B --> C{Select view}
    C -->|Posting to AP| D[setSelectedView posting-to-ap]
    C -->|Posting to GL| E[setSelectedView posting-to-gl]
    D --> F[Render AP table columns]
    E --> G[Render GL table columns]
    F --> H[Show AP mappings]
    G --> I[Show GL mappings]
```

---

## Search Flow

```mermaid
graph TD
    A[User types in search input] --> B[Update searchTerm state]
    B --> C[Filter data array]
    C --> D{For each row}
    D --> E[Check Object.values]
    E --> F{Any value matches?}
    F -->|Yes| G[Include in filtered array]
    F -->|No| H[Exclude from filtered array]
    G --> I[Render filtered results]
    H --> I
    I --> J{Results count}
    J -->|Zero| K[Show No mappings found]
    J -->|More| L[Show matching rows]
```

---

## Create Mapping Flow

```mermaid
graph TD
    A[User clicks Create button] --> B[handleCreate called]
    B --> C[setFormData empty object]
    C --> D[setIsCreateDialogOpen true]
    D --> E[Dialog opens]
    E --> F{Current view?}
    F -->|AP| G[Show AP form fields]
    F -->|GL| H[Show GL form fields]
    G --> I[User fills form]
    H --> I
    I --> J{User action}
    J -->|Click Create| K[handleSaveCreate]
    J -->|Click Cancel| L[Close dialog]
    K --> M[Generate ID Date.now]
    M --> N{Current view?}
    N -->|AP| O[Add to apMappingData]
    N -->|GL| P[Add to glMappingData]
    O --> Q[Close dialog]
    P --> Q
    Q --> R[Table shows new mapping]
    L --> S[No changes]
```

---

## Edit Mapping Flow

```mermaid
graph TD
    A[User clicks Actions menu] --> B[Select Edit]
    B --> C[handleEdit mapping]
    C --> D[setSelectedMapping]
    D --> E[setFormData mapping]
    E --> F[setIsEditDialogOpen true]
    F --> G[Dialog opens with values]
    G --> H[User modifies fields]
    H --> I{User action}
    I -->|Save Changes| J[handleSaveEdit]
    I -->|Cancel| K[Close dialog]
    J --> L{Current view?}
    L -->|AP| M[Map apMappingData update matching]
    L -->|GL| N[Map glMappingData update matching]
    M --> O[Close dialog]
    N --> O
    O --> P[Table shows updated mapping]
    K --> Q[No changes]
```

---

## Delete Mapping Flow

```mermaid
graph TD
    A[User clicks Actions menu] --> B[Select Delete]
    B --> C[handleDelete id]
    C --> D[window.confirm shown]
    D --> E{User confirms?}
    E -->|OK| F{Current view?}
    E -->|Cancel| G[No changes]
    F -->|AP| H[Filter apMappingData remove id]
    F -->|GL| I[Filter glMappingData remove id]
    H --> J[Table refreshes]
    I --> J
    J --> K[Mapping removed from list]
```

---

## Duplicate Mapping Flow

```mermaid
graph TD
    A[User clicks Actions menu] --> B[Select Duplicate]
    B --> C[handleDuplicate mapping]
    C --> D[Generate new ID Date.now]
    D --> E{Current view?}
    E -->|AP| F[Spread mapping with new ID]
    E -->|GL| G[Spread mapping with new ID]
    F --> H[Add to apMappingData]
    G --> I[Add to glMappingData]
    H --> J[Table shows duplicate row]
    I --> J
```

---

## View Details Flow

```mermaid
graph TD
    A[User clicks Actions menu] --> B[Select View]
    B --> C[handleView mapping]
    C --> D[setSelectedMapping]
    D --> E[setIsViewDialogOpen true]
    E --> F[Dialog opens]
    F --> G{Current view?}
    G -->|AP| H[Display AP fields read-only]
    G -->|GL| I[Display GL fields read-only]
    H --> J[User reviews details]
    I --> J
    J --> K[User clicks Close]
    K --> L[Dialog closes]
```

---

## Component Interaction

```mermaid
sequenceDiagram
    participant U as User
    participant P as Page
    participant C as Component
    participant S as State

    U->>P: Navigate to page
    P->>C: Render AccountCodeMapping
    C->>S: Initialize mock data
    S-->>C: Return initial state
    C-->>U: Display AP table

    U->>C: Select GL view
    C->>S: setSelectedView GL
    S-->>C: Updated state
    C-->>U: Display GL table

    U->>C: Click Create
    C->>S: setIsCreateDialogOpen true
    C-->>U: Show create dialog
    U->>C: Fill and submit
    C->>S: Add to mappingData
    S-->>C: Updated array
    C-->>U: Show new row
```

---

## Data Flow Summary

```
User Actions              State Updates              UI Updates
-----------              -------------              ----------
Select view         -->  setSelectedView       -->  Switch table
Type in search      -->  setSearchTerm         -->  Filter rows
Click Create        -->  setIsCreateDialogOpen -->  Show dialog
Submit create       -->  setMappingData        -->  Add row
Click Edit          -->  setSelectedMapping    -->  Show dialog
Submit edit         -->  setMappingData        -->  Update row
Click Delete        -->  confirm then filter   -->  Remove row
Click Duplicate     -->  setMappingData        -->  Add row
Click View          -->  setSelectedMapping    -->  Show dialog
Click Print         -->  window.print          -->  Print dialog
```

---

**Document End**
