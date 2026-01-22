# Flow Diagrams: Policy Management

## Module Information
- **Module**: System Administration > Permission Management
- **Sub-Module**: Policy Management
- **Route**: `/system-administration/permission-management/policies`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## Page Navigation

```mermaid
graph TD
    A[Policy List] --> B{Action}
    B -->|Simple Creator| C[/policies/simple]
    B -->|Advanced Builder| D[/policies/builder]
    B -->|View| E[/policies/id]
    B -->|Edit| F[/policies/builder?edit=id]
    B -->|Clone| G[/policies/builder?clone=id]
```

---

## Filter Flow

```mermaid
graph TD
    A[Click Filters] --> B[Show filter panel]
    B --> C[Enter search text]
    B --> D[Select effect]
    B --> E[Select status]
    B --> F[Set priority range]
    C --> G[Filter policies]
    D --> G
    E --> G
    F --> G
    G --> H[Update list]
```

---

## Create Policy Flow

```mermaid
graph TD
    A[Click Advanced Builder] --> B[PolicyBuilderPage]
    B --> C[Start Building Policy]
    C --> D[VisualPolicyEditor]
    D --> E[Configure name, description]
    E --> F[Set priority and effect]
    F --> G[Add subject conditions]
    G --> H[Add resource conditions]
    H --> I[Add action conditions]
    I --> J[Add environment conditions]
    J --> K{Save?}
    K -->|Yes| L[Save policy]
    K -->|No| M[Cancel]
    L --> N[Redirect to list]
    M --> N
```

---

## Edit Policy Flow

```mermaid
graph TD
    A[Click Edit] --> B[Navigate with edit param]
    B --> C[Load policy by ID]
    C --> D[Convert to PolicyBuilderState]
    D --> E[Open VisualPolicyEditor]
    E --> F[Modify settings]
    F --> G{Save?}
    G -->|Yes| H[Update policy]
    G -->|No| I[Cancel]
    H --> J[Redirect to list]
    I --> J
```

---

## Policy Type Toggle

```mermaid
graph TD
    A[Select policy type] --> B{RBAC or ABAC?}
    B -->|RBAC| C[Load roleBasedPolicies]
    B -->|ABAC| D[Load allMockPolicies]
    C --> E[Apply filters]
    D --> E
    E --> F[Display filtered list]
```

---

## Test Policy Flow

```mermaid
graph TD
    A[Open Policy Tester] --> B[Configure test scenario]
    B --> C[Set subject attributes]
    C --> D[Set resource attributes]
    D --> E[Set action]
    E --> F[Set environment]
    F --> G[Run test]
    G --> H[Evaluate policy]
    H --> I{Result}
    I -->|Pass| J[Show success]
    I -->|Fail| K[Show failure]
```

---

**Document End**
