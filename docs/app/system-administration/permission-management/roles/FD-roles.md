# Flow Diagrams: Role Management

## Module Information
- **Module**: System Administration > Permission Management
- **Sub-Module**: Role Management
- **Route**: `/system-administration/permission-management/roles`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## View Mode Navigation

```mermaid
graph TD
    A[List View] --> B{Action}
    B -->|Create| C[Create View]
    B -->|Edit| D[Edit View]
    B -->|View| E[Detail Page]
    C --> F{Save?}
    D --> F
    F -->|Yes| G[Save to Store]
    F -->|No| H[Cancel]
    G --> A
    H --> A
    E --> I{Edit?}
    I -->|Yes| D
```

---

## Create Role Flow

```mermaid
graph TD
    A[Click Create Role] --> B[Set currentView = create]
    B --> C[Clear selectedRole]
    C --> D[Show RoleForm]
    D --> E[Enter name]
    E --> F[Enter description]
    F --> G[Set hierarchy]
    G --> H[Select permissions]
    H --> I[Select parent roles]
    I --> J{Save?}
    J -->|Yes| K[Call addRole]
    J -->|No| L[handleCancel]
    K --> M[Set isLoading true]
    M --> N[Simulate API call]
    N --> O[Toast success]
    O --> P[Set currentView = list]
    L --> P
```

---

## Edit Role Flow

```mermaid
graph TD
    A[Click Edit] --> B[handleEditRole]
    B --> C{String or Role?}
    C -->|String| D[getRole by ID]
    C -->|Role| E[Use role directly]
    D --> F[Set selectedRole]
    E --> F
    F --> G[Set currentView = edit]
    G --> H[Show RoleForm with data]
    H --> I{Save?}
    I -->|Yes| J[Call updateRole]
    I -->|No| K[handleCancel]
    J --> L[Set currentView = list]
    K --> L
```

---

## View Role Detail Flow

```mermaid
graph TD
    A[Click View] --> B[handleViewRole]
    B --> C{String or Role?}
    C -->|String| D[Use ID directly]
    C -->|Role| E[Extract role.id]
    D --> F[router.push /roles/id]
    E --> F
    F --> G[Load RoleDetailPage]
    G --> H[Show tabs]
```

---

## Toggle View Mode

```mermaid
graph TD
    A[Click view toggle] --> B{Current mode?}
    B -->|table| C[Set viewType = card]
    B -->|card| D[Set viewType = table]
    C --> E[Render RoleCardView]
    D --> F[Render DataTable]
```

---

## Role Save Flow

```mermaid
graph TD
    A[Click Save] --> B[handleSaveRole]
    B --> C[Set isLoading true]
    C --> D[Simulate API 1s]
    D --> E{selectedRole?}
    E -->|Yes| F[updateRole]
    E -->|No| G[addRole]
    F --> H[Log success]
    G --> H
    H --> I[Set currentView = list]
    I --> J[Clear selectedRole]
    J --> K[Set isLoading false]
```

---

**Document End**
