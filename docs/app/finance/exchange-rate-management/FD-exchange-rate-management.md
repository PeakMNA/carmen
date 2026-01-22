# Flow Diagrams: Exchange Rate Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Exchange Rate Management
- **Route**: `/finance/exchange-rates`
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format |
| 1.0.0 | 2025-01-13 | Documentation Team | Initial version |

---

## Overview

This document provides visual representations of the Exchange Rate Management module workflows. The current implementation supports basic CRUD operations using React local state.

**Related Documents**:
- [Business Requirements](./BR-exchange-rate-management.md)
- [Use Cases](./UC-exchange-rate-management.md)
- [Data Dictionary](./DD-exchange-rate-management.md)
- [Technical Specification](./TS-exchange-rate-management.md)
- [Validation Rules](./VAL-exchange-rate-management.md)

---

## Diagram Index

| Diagram | Type | Purpose |
|---------|------|---------|
| [Page Load Flow](#page-load-flow) | Process | Initial page rendering |
| [Add Rate Flow](#add-rate-flow) | Process | Create new exchange rate |
| [Edit Rate Flow](#edit-rate-flow) | Process | Modify existing rate |
| [Delete Rate Flow](#delete-rate-flow) | Process | Remove exchange rate |
| [Search Flow](#search-flow) | Process | Filter rate list |
| [Component Interaction](#component-interaction) | Sequence | UI component interactions |
| [State Transitions](#state-transitions) | State | Application state changes |

---

## Page Load Flow

```mermaid
graph TD
    A[User navigates to /finance/exchange-rates] --> B[Next.js renders page.tsx]
    B --> C[ExchangeRateViewer component mounts]
    C --> D[Initialize state with mock data]
    D --> E[Render table with 4 default currencies]
    E --> F[User sees exchange rate list]
```

**Description**: When a user navigates to the exchange rates page, the system loads the ExchangeRateViewer component which initializes with hardcoded mock data (USD, EUR, JPY, GBP).

---

## Add Rate Flow

```mermaid
graph TD
    A[User clicks Add Rate button] --> B[Open Add Dialog]
    B --> C[User enters Currency Code]
    C --> D[Auto-convert to uppercase]
    D --> E[User enters Currency Name]
    E --> F[User enters Exchange Rate]
    F --> G{User clicks Add Rate?}
    G -->|Yes| H{Validate fields}
    G -->|Cancel| I[Close dialog]
    H -->|code AND name AND rate > 0| J[Add to currencies array]
    H -->|Validation fails| B
    J --> K[Set lastUpdated to today]
    K --> L[Reset form]
    L --> M[Close dialog]
    M --> N[Table re-renders with new rate]
    I --> O[No changes made]
```

**Validation Check**:
```
if (newRate.code && newRate.name && newRate.rate > 0) {
  // proceed with add
}
```

---

## Edit Rate Flow

```mermaid
graph TD
    A[User clicks Actions menu] --> B[Select Edit Rate]
    B --> C[Set editingRate state]
    C --> D[Open Edit Dialog]
    D --> E[Display pre-populated form]
    E --> F[Currency Code disabled]
    F --> G[User modifies Name or Rate]
    G --> H{User clicks Save Changes?}
    H -->|Yes| I[Map currencies array]
    H -->|Cancel| J[Close dialog]
    I --> K[Update matching code entry]
    K --> L[Set lastUpdated to today]
    L --> M[Clear editingRate]
    M --> N[Close dialog]
    N --> O[Table re-renders with updated rate]
    J --> P[No changes made]
```

**Update Logic**:
```
currencies.map(c =>
  c.code === editingRate.code
    ? { ...editingRate, lastUpdated: today }
    : c
)
```

---

## Delete Rate Flow

```mermaid
graph TD
    A[User clicks Actions menu] --> B[Select Delete]
    B --> C[Browser confirm dialog]
    C --> D{User confirms?}
    D -->|OK| E[Filter out rate by code]
    D -->|Cancel| F[No action]
    E --> G[Table re-renders without rate]
    F --> H[Rate remains in list]
```

**Delete Logic**:
```
currencies.filter(c => c.code !== code)
```

**Confirmation Message**: "Are you sure you want to delete exchange rate for {code}?"

---

## Search Flow

```mermaid
graph TD
    A[User types in search input] --> B[Update searchTerm state]
    B --> C[Filter currencies array]
    C --> D{Match code or name?}
    D -->|Yes| E[Include in filtered list]
    D -->|No| F[Exclude from filtered list]
    E --> G[Render filtered results]
    F --> G
    G --> H[Table shows matching rates]
```

**Filter Logic**:
```
currencies.filter(currency =>
  currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
  currency.name.toLowerCase().includes(searchTerm.toLowerCase())
)
```

---

## Component Interaction

```mermaid
sequenceDiagram
    participant U as User
    participant P as Page
    participant V as ExchangeRateViewer
    participant S as React State
    participant T as Table

    U->>P: Navigate to /finance/exchange-rates
    P->>V: Render component
    V->>S: Initialize currencies state
    S->>T: Render table rows

    U->>V: Click Add Rate
    V->>S: setIsAddDialogOpen(true)
    S->>V: Show dialog

    U->>V: Fill form and submit
    V->>S: setCurrencies([...currencies, newRate])
    V->>S: setIsAddDialogOpen(false)
    S->>T: Re-render with new rate
```

---

## State Transitions

```mermaid
stateDiagram-v2
    [*] --> Viewing

    Viewing --> Searching: Type in search
    Searching --> Viewing: Clear search

    Viewing --> AddDialogOpen: Click Add Rate
    AddDialogOpen --> Viewing: Cancel
    AddDialogOpen --> Viewing: Save rate

    Viewing --> EditDialogOpen: Click Edit
    EditDialogOpen --> Viewing: Cancel
    EditDialogOpen --> Viewing: Save changes

    Viewing --> ConfirmDelete: Click Delete
    ConfirmDelete --> Viewing: Cancel
    ConfirmDelete --> Viewing: Confirm
```

---

## Print Flow

```mermaid
graph TD
    A[User clicks Print button] --> B[Call window.print]
    B --> C[Browser print dialog opens]
    C --> D{User action}
    D -->|Print| E[Document printed]
    D -->|Cancel| F[Return to page]
```

---

## Data Flow Summary

```
User Actions              State Updates           UI Updates
-----------              -------------           ----------
Navigate to page    -->  Initialize mock data --> Render table
Type in search      -->  setSearchTerm        --> Filter visible rows
Click Add Rate      -->  setIsAddDialogOpen   --> Show dialog
Submit add form     -->  setCurrencies        --> Add row to table
Click Edit          -->  setEditingRate       --> Show edit dialog
Submit edit form    -->  setCurrencies        --> Update row
Click Delete        -->  confirm()            --> Show browser dialog
Confirm delete      -->  setCurrencies        --> Remove row
Click Print         -->  window.print()       --> Open print dialog
```

---

## Future Enhancement Flows

### Phase 2: Database Integration

```
User submits form
    |
    v
Client-side validation
    |
    v
Server Action call
    |
    v
Prisma database operation
    |
    v
Return result
    |
    v
Update UI state
```

### Phase 3: External API Integration

```
Scheduled job triggers
    |
    v
Fetch rates from external API
    |
    v
Compare with existing rates
    |
    v
Update changed rates in database
    |
    v
Log rate changes
```

---

**Document End**
