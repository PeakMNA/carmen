# Flow Diagrams: Department Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Department Management
- **Route**: `/finance/department-list`
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.1.0 | 2025-12-17 | Documentation Team | Added Location Assignment feature |
| 1.0.0 | 2025-12-01 | Documentation Team | Initial version |

---

## Overview

This document provides visual representations of the Department Management module's workflows. The current implementation covers CRUD operations for departments with user and location assignment capabilities.

**Related Documents**:
- [Business Requirements](./BR-department-management.md)
- [Use Cases](./UC-department-management.md)
- [Technical Specification](./TS-department-management.md)
- [Data Dictionary](./DD-department-management.md)
- [Validation Rules](./VAL-department-management.md)

---

## Diagram Index

| Diagram | Type | Purpose |
|---------|------|---------|
| [Main Navigation Flow](#main-navigation-flow) | Process | Overall module navigation |
| [Department List Flow](#department-list-flow) | Process | List page interactions |
| [Create Department Flow](#create-department-flow) | Process | New department workflow |
| [Edit Department Flow](#edit-department-flow) | Process | Department modification |
| [Delete Department Flow](#delete-department-flow) | Process | Department removal |
| [User Assignment Flow](#user-assignment-flow) | Process | Dual-pane user picker |
| [Location Assignment Flow](#location-assignment-flow) | Process | Dual-pane location picker |
| [Component State Flow](#component-state-flow) | Data | State management |

---

## Main Navigation Flow

### FD-DEPT-001: Module Navigation

```mermaid
flowchart TD
    A[Navigate to Department List] --> B[Display Department Table]

    B --> C{User Action}

    C -->|Search| D[Filter Departments]
    D --> B

    C -->|New Department| E[Navigate to Create Form]
    E --> F[Fill Department Details]
    F --> G[Save Department]
    G --> B

    C -->|View| H[Navigate to Detail Page]
    H --> I{Action on Detail}
    I -->|Edit| J[Navigate to Edit Form]
    I -->|Delete| K[Confirm Delete]
    I -->|Back| B

    J --> L[Modify Department]
    L --> M[Save Changes]
    M --> H

    K -->|Confirm| N[Remove Department]
    N --> B
    K -->|Cancel| H

    C -->|Edit| J
    C -->|Delete| O[Confirm Delete from List]
    O -->|Confirm| N
    O -->|Cancel| B
```

---

## Department List Flow

### FD-DEPT-002: List Page Display

```mermaid
flowchart TD
    A[Page Load] --> B[Initialize State]
    B --> C[Load mockDepartments]
    C --> D[Display Table]

    D --> E{Search Input}
    E -->|Type| F[Update searchTerm]
    F --> G[Filter by code, name, description]
    G --> H[Update filteredDepartments]
    H --> D

    E -->|Clear| I[Reset searchTerm]
    I --> D
```

### FD-DEPT-003: List Actions

```mermaid
flowchart TD
    A[Department Row] --> B{Action Button}

    B -->|Eye Icon| C[router.push dept/id]
    C --> D[Detail Page]

    B -->|Pencil Icon| E[router.push dept/id/edit]
    E --> F[Edit Form]

    B -->|Trash Icon| G[Show Confirm Dialog]
    G --> H{User Confirms}
    H -->|Yes| I[Filter out department]
    I --> J[Update departments state]
    H -->|No| K[Close Dialog]
```

---

## Create Department Flow

### FD-DEPT-004: Create New Department

```mermaid
flowchart TD
    A[Click New Department] --> B[Navigate to /new/edit]
    B --> C[Load Empty Form]
    C --> D[Initialize Default Values]

    D --> E[Form State]
    E --> F[code: empty]
    E --> G[name: empty]
    E --> H[description: empty]
    E --> I[managers: empty array]
    E --> J[costCenter: empty]
    E --> K[status: active]

    L[User Fills Form] --> M{Validation}

    M -->|Code Empty| N[Show Error: Code required]
    N --> L

    M -->|Name Empty| O[Show Error: Name required]
    O --> L

    M -->|Code > 10 chars| P[Show Error: Code too long]
    P --> L

    M -->|Valid| Q[Create Department Object]
    Q --> R[Add to departments array]
    R --> S[Navigate to List]
```

### FD-DEPT-005: Form Sections

```mermaid
flowchart TD
    A[Edit Form Page] --> B[Basic Information]
    A --> C[Management Section]
    A --> D[Assignments Section]

    B --> B1[Name Input]
    B --> B2[Code Input]
    B --> B3[Description Textarea]

    C --> C1[Department Heads Checkboxes]
    C --> C2[Cost Center Input]
    C --> C3[Active Status Checkbox]

    D --> D1[Tabs Component]
    D1 --> D2[Users Tab]
    D1 --> D3[Locations Tab]

    D2 --> E[UserAssignment Component]
    D3 --> F[LocationAssignment Component]
```

---

## Edit Department Flow

### FD-DEPT-006: Edit Existing Department

```mermaid
flowchart TD
    A[Navigate to Edit Page] --> B[Get Department ID from URL]
    B --> C[Find Department in mockDepartments]

    C --> D{Department Found}
    D -->|No| E[Show Not Found Message]
    E --> F[Link to Return to List]

    D -->|Yes| G[Populate Form Fields]
    G --> H[code: disabled]
    G --> I[name: editable]
    G --> J[description: editable]
    G --> K[managers: pre-selected]
    G --> L[costCenter: editable]
    G --> M[status: editable]
    G --> N[assignedUsers: loaded]
    G --> O[assignedLocations: loaded]

    P[User Makes Changes] --> Q[Update Form State]
    Q --> R{Submit}

    R -->|Cancel| S[Navigate Back]
    R -->|Save| T[Validate Form]
    T -->|Invalid| U[Show Errors]
    U --> P
    T -->|Valid| V[Update Department]
    V --> W[Navigate to Detail Page]
```

---

## Delete Department Flow

### FD-DEPT-007: Delete Confirmation

```mermaid
flowchart TD
    A[Click Delete Button] --> B[Show Confirmation Dialog]
    B --> C[Display Department Name]

    C --> D{User Decision}

    D -->|Cancel| E[Close Dialog]
    E --> F[Return to Previous State]

    D -->|Confirm| G[Remove from Array]
    G --> H[Update departments state]
    H --> I{Delete Location}

    I -->|From List| J[Stay on List Page]
    I -->|From Detail| K[Navigate to List Page]
```

---

## User Assignment Flow

### FD-DEPT-008: Dual-Pane User Picker

```mermaid
flowchart TD
    A[Open Users Tab] --> B[Load UserAssignment Component]
    B --> C[Initialize State]

    C --> D[assignedSearch: empty]
    C --> E[availableSearch: empty]
    C --> F[selectedAssigned: empty]
    C --> G[selectedAvailable: empty]

    H[Compute Lists] --> I[assignedUsers from props]
    H --> J[availableUsers: all minus assigned]

    K{User Action} --> L[Search Assigned]
    L --> M[Filter assigned by name/email]

    K --> N[Search Available]
    N --> O[Filter available by name/email]

    K --> P[Select User in Assigned]
    P --> Q[Add to selectedAssigned]

    K --> R[Select User in Available]
    R --> S[Add to selectedAvailable]

    K --> T[Click Move to Available Arrow]
    T --> U[Move selectedAssigned to available]
    U --> V[Call onAssignmentChange]
    V --> W[Clear selectedAssigned]

    K --> X[Click Move to Assigned Arrow]
    X --> Y[Move selectedAvailable to assigned]
    Y --> V
```

### FD-DEPT-009: User Selection State

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> UserSelected: Click checkbox
    UserSelected --> MultipleSelected: Click another checkbox
    MultipleSelected --> UserSelected: Uncheck one
    UserSelected --> Idle: Uncheck all

    Idle --> AllSelected: Click Select All
    AllSelected --> Idle: Click Select All again

    UserSelected --> Moving: Click arrow
    MultipleSelected --> Moving: Click arrow
    AllSelected --> Moving: Click arrow

    Moving --> Idle: Transfer complete
```

---

## Location Assignment Flow

### FD-DEPT-010: Dual-Pane Location Picker

```mermaid
flowchart TD
    A[Open Locations Tab] --> B[Load LocationAssignment Component]
    B --> C[Initialize State]

    C --> D[assignedSearch: empty]
    C --> E[availableSearch: empty]
    C --> F[selectedAssigned: empty]
    C --> G[selectedAvailable: empty]

    H[Compute Lists] --> I[assignedLocations from props]
    H --> J[availableLocations: all minus assigned]

    K{User Action} --> L[Search Assigned]
    L --> M[Filter by location name]

    K --> N[Search Available]
    N --> O[Filter by location name]

    K --> P[Select Location]
    P --> Q[Toggle in selection array]

    K --> R[Move to Available]
    R --> S[Update assignment]
    S --> T[Call onAssignmentChange]

    K --> U[Move to Assigned]
    U --> S
```

---

## Component State Flow

### FD-DEPT-011: State Management

```mermaid
flowchart TD
    subgraph DepartmentList
        A1[departments: Department array]
        A2[searchTerm: string]
        A3[filteredDepartments: computed]
    end

    subgraph DepartmentEditForm
        B1[form: react-hook-form]
        B2[assignedUsers: string array]
        B3[assignedLocations: string array]
        B4[activeTab: users or locations]
    end

    subgraph UserAssignment
        C1[assignedSearch: string]
        C2[availableSearch: string]
        C3[selectedAssigned: string array]
        C4[selectedAvailable: string array]
    end

    subgraph LocationAssignment
        D1[assignedSearch: string]
        D2[availableSearch: string]
        D3[selectedAssigned: string array]
        D4[selectedAvailable: string array]
    end

    A1 --> A3
    A2 --> A3

    B2 --> C1
    B3 --> D1

    C3 --> B2
    C4 --> B2
    D3 --> B3
    D4 --> B3
```

### FD-DEPT-012: Data Flow

```mermaid
flowchart LR
    subgraph MockData
        M1[mockDepartments]
        M2[mockUsers]
        M3[mockLocations]
    end

    subgraph Components
        C1[DepartmentList]
        C2[DepartmentEditForm]
        C3[UserAssignment]
        C4[LocationAssignment]
    end

    subgraph State
        S1[Local React State]
    end

    M1 --> C1
    M1 --> C2
    M2 --> C2
    M2 --> C3
    M3 --> C2
    M3 --> C4

    C1 --> S1
    C2 --> S1
    C3 --> S1
    C4 --> S1
```

---

## User Interface Layouts

### FD-DEPT-013: List Page Layout

```
+------------------------------------------------------------------+
| Department List                                [+ New Department] |
+------------------------------------------------------------------+
| Manage organizational departments and user assignments            |
+------------------------------------------------------------------+
| [Search departments by name, code, or description...         ]    |
+------------------------------------------------------------------+
| Code     | Name            | Description    | Head    | Status |  |
+----------+-----------------+----------------+---------+--------+--+
| KITCHEN  | Kitchen Ops     | Main kitchen   | J.Smith | Active |[]|
| FB       | Food & Beverage | F&B service    | M.Doe   | Active |[]|
| HOUSEKP  | Housekeeping    | Room cleaning  | A.Brown | Active |[]|
+------------------------------------------------------------------+
| Showing 3 of 3 departments                                        |
+------------------------------------------------------------------+
```

### FD-DEPT-014: Edit Form Layout

```
+------------------------------------------------------------------+
| [< Back] Edit Kitchen Operations                                  |
|          Update department information and user assignments       |
+------------------------------------------------------------------+
|                                            [Cancel] [Save Dept]   |
+------------------------------------------------------------------+
| Basic Information                                                 |
| +--------------------------------------------------------------+ |
| | Department Name*  [Kitchen Operations________________]        | |
| | Department Code*  [KITCHEN___] (disabled)                     | |
| | Description       [Main kitchen production area_____]         | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| Management                                                        |
| +--------------------------------------------------------------+ |
| | Department Heads:                                             | |
| | [x] John Smith (john@example.com)                            | |
| | [ ] Mary Director (mary@example.com)                         | |
| | Cost Center: [CC-001______]                                   | |
| | [x] Active                                                    | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| Assignments                                                       |
| +--------------------------------------------------------------+ |
| | [Users (5)]  [Locations (2)]                                  | |
| | +------------------------+  +  +------------------------+     | |
| | | Assigned Users    (5)  |  |  | Available Users   (10) |     | |
| | | [Search...]            | [>] | [Search...]            |     | |
| | | [x] Select All         | [<] | [ ] Select All         |     | |
| | | +--------------------+ |  |  | +--------------------+ |     | |
| | | | [x] John Smith     | |  |  | | [ ] Jane Doe       | |     | |
| | | | [ ] Mike Johnson   | |  |  | | [ ] Bob Wilson     | |     | |
| | | +--------------------+ |  |  | +--------------------+ |     | |
| | +------------------------+  +  +------------------------+     | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

---

## Future Flow Diagrams (Planned)

| Diagram | Description | Phase |
|---------|-------------|-------|
| Database Sync Flow | Server state synchronization | Phase 2 |
| Approval Workflow | Department creation approval | Phase 3 |
| Hierarchy Management | Parent-child relationships | Phase 3 |
| Budget Allocation | Department budget tracking | Phase 4 |
| Audit Trail | Change history tracking | Phase 4 |

---

**Document End**
