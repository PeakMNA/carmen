# Flow Diagrams: Delivery Points

## Module Information
- **Module**: System Administration
- **Sub-Module**: Delivery Points
- **Route**: `/system-administration/delivery-points`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## Page Load Flow

```mermaid
graph TD
    A[Navigate to page] --> B[Load mock data]
    B --> C[Apply default sort by name]
    C --> D[Display table with all points]
```

---

## Search and Filter Flow

```mermaid
graph TD
    A[User enters search text] --> B[Filter by name contains]
    C[User selects status] --> D{Status filter}
    D -->|All| E[Show all results]
    D -->|Active| F[Show isActive=true]
    D -->|Inactive| G[Show isActive=false]
    B --> H[Combine filters]
    E --> H
    F --> H
    G --> H
    H --> I[Apply sort]
    I --> J[Display results]
```

---

## Create Flow

```mermaid
graph TD
    A[Click Add button] --> B[Open dialog]
    B --> C[Enter name]
    C --> D[Toggle active status]
    D --> E{Name valid?}
    E -->|Yes| F[Click Add]
    E -->|No| G[Button disabled]
    F --> H[Create record]
    H --> I[Close dialog]
    I --> J[Refresh list]
```

---

## Edit Flow

```mermaid
graph TD
    A[Click row menu] --> B[Select Edit]
    B --> C[Open dialog with values]
    C --> D[Modify fields]
    D --> E{Name valid?}
    E -->|Yes| F[Click Save]
    E -->|No| G[Button disabled]
    F --> H[Update record]
    H --> I[Close dialog]
    I --> J[Refresh list]
```

---

## Delete Flow

```mermaid
graph TD
    A[Click row menu] --> B[Select Delete]
    B --> C[Show confirmation]
    C --> D{User confirms?}
    D -->|Yes| E[Delete record]
    D -->|No| F[Close dialog]
    E --> G[Remove from list]
```

---

## Sort Flow

```mermaid
graph TD
    A[Click column header] --> B{Same column?}
    B -->|Yes| C[Toggle direction]
    B -->|No| D[Set new column, asc]
    C --> E[Re-sort data]
    D --> E
    E --> F[Update table]
```

---

**Document End**
