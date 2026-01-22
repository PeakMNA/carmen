# Technical Specification: Currency Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Currency Management
- **Route**: `/finance/currency-management`
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

The Currency Management module implements a simple CRUD interface for managing currency master data. The current implementation uses React local state for data management, with shadcn/ui components for the user interface.

**Current Implementation Scope**: Client-side currency master data management. Database persistence and exchange rate management are planned for future phases.

**Related Documents**:
- [Business Requirements](./BR-currency-management.md)
- [Use Cases](./UC-currency-management.md)
- [Data Dictionary](./DD-currency-management.md)
- [Flow Diagrams](./FD-currency-management.md)
- [Validation Rules](./VAL-currency-management.md)

---

## Architecture

### Component Architecture

```
app/(main)/finance/currency-management/
  page.tsx                           # Route page (imports component)

components/
  currency-management.tsx            # Main component (318 lines)
```

### Component Hierarchy

```
CurrencyManagementPage
  |
  +-- CurrencyManagement (main component)
        |
        +-- Header Section
        |     +-- Title
        |     +-- Action Buttons (Create, Delete, Print)
        |
        +-- Filter Section
        |     +-- Search Input
        |     +-- Show Active Checkbox
        |
        +-- Table (shadcn/ui)
        |     +-- TableHeader
        |     |     +-- Select All Checkbox
        |     |     +-- Column Headers
        |     |
        |     +-- TableBody
        |           +-- TableRow (for each currency)
        |                 +-- Row Checkbox
        |                 +-- Currency Code
        |                 +-- Description
        |                 +-- Active Checkbox
        |                 +-- Actions DropdownMenu
        |
        +-- Create Dialog
        |     +-- Currency Code Input
        |     +-- Description Input
        |     +-- Active Checkbox
        |     +-- Cancel/Create Buttons
        |
        +-- Edit Dialog
              +-- Currency Code Input (disabled)
              +-- Description Input
              +-- Active Checkbox
              +-- Cancel/Save Buttons
```

---

## Technical Implementation

### Source Code Location

**File**: `components/currency-management.tsx`
**Lines**: 318

### Dependencies

```typescript
// React
import { useState, useCallback } from 'react'

// UI Components (shadcn/ui)
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Icons (Lucide)
import { MoreVertical, Plus, Trash2, Printer, Search, Edit, Copy } from 'lucide-react'
```

### Interface Definition

```typescript
interface Currency {
  code: string
  description: string
  active: boolean
}
```

### State Management

The component uses React useState hooks for all state management:

```typescript
// Currency data
const [currencies, setCurrencies] = useState<Currency[]>([
  { code: 'USD', description: 'United States Dollar', active: true },
  { code: 'EUR', description: 'Euro', active: true },
  { code: 'JPY', description: 'Japanese Yen', active: true },
  { code: 'GBP', description: 'British Pound Sterling', active: true },
])

// Filter state
const [showActive, setShowActive] = useState(false)
const [searchTerm, setSearchTerm] = useState('')

// Selection state
const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([])

// Dialog state
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null)
const [newCurrency, setNewCurrency] = useState({ code: '', description: '', active: true })
```

---

## Core Functions

### toggleActive

Toggles the active status of a currency inline.

```typescript
const toggleActive = (code: string) => {
  setCurrencies(currencies.map(currency =>
    currency.code === code ? { ...currency, active: !currency.active } : currency
  ))
}
```

### filteredCurrencies

Computed value that filters currencies based on search and active filter.

```typescript
const filteredCurrencies = currencies.filter(currency =>
  (showActive ? currency.active : true) &&
  (currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
   currency.description.toLowerCase().includes(searchTerm.toLowerCase()))
)
```

### handleSearch

Debounced search handler with useCallback for optimization.

```typescript
const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(e.target.value)
}, [])
```

### handleSelectCurrency

Toggles individual row selection.

```typescript
const handleSelectCurrency = (code: string) => {
  setSelectedCurrencies(prev =>
    prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
  )
}
```

### handleSelectAll

Toggles select all/deselect all.

```typescript
const handleSelectAll = () => {
  if (selectedCurrencies.length === filteredCurrencies.length) {
    setSelectedCurrencies([])
  } else {
    setSelectedCurrencies(filteredCurrencies.map(c => c.code))
  }
}
```

### handleCreateCurrency

Creates a new currency if validation passes.

```typescript
const handleCreateCurrency = () => {
  if (newCurrency.code && newCurrency.description) {
    setCurrencies([...currencies, newCurrency])
    setNewCurrency({ code: '', description: '', active: true })
    setIsCreateDialogOpen(false)
  }
}
```

### handleEditCurrency

Opens edit dialog with selected currency.

```typescript
const handleEditCurrency = (currency: Currency) => {
  setEditingCurrency(currency)
  setIsEditDialogOpen(true)
}
```

### handleUpdateCurrency

Updates currency in the list.

```typescript
const handleUpdateCurrency = () => {
  if (editingCurrency) {
    setCurrencies(currencies.map(c =>
      c.code === editingCurrency.code ? editingCurrency : c
    ))
    setEditingCurrency(null)
    setIsEditDialogOpen(false)
  }
}
```

### handleDeleteSelected

Deletes selected currencies with confirmation.

```typescript
const handleDeleteSelected = () => {
  if (confirm(`Are you sure you want to delete ${selectedCurrencies.length} currency(ies)?`)) {
    setCurrencies(currencies.filter(c => !selectedCurrencies.includes(c.code)))
    setSelectedCurrencies([])
  }
}
```

### handleDuplicateCurrency

Creates a copy of the currency with _COPY suffix.

```typescript
const handleDuplicateCurrency = (currency: Currency) => {
  const newCode = `${currency.code}_COPY`
  setCurrencies([...currencies, { ...currency, code: newCode }])
}
```

### handlePrint

Triggers browser print dialog.

```typescript
const handlePrint = () => {
  window.print()
}
```

---

## UI Components

### Table Structure

The main display uses shadcn/ui Table component:

| Column | Width | Content | Interactive |
|--------|-------|---------|-------------|
| Checkbox | 40px | Row selection | Yes - toggle selection |
| Currency Code | Auto | `currency.code` | No |
| Currency Description | Auto | `currency.description` | No |
| Active | Auto | Checkbox | Yes - toggle active |
| Actions | 40px | DropdownMenu | Yes - Edit/Duplicate/Delete |

### Dialog Components

Two dialogs are used for CRUD operations:

1. **Create Dialog**
   - Title: "Create New Currency"
   - Fields: Currency Code (text), Description (text), Active (checkbox)
   - Actions: Cancel, Create

2. **Edit Dialog**
   - Title: "Edit Currency"
   - Fields: Currency Code (disabled), Description (text), Active (checkbox)
   - Actions: Cancel, Save Changes

### Action Buttons

| Button | Variant | Icon | Action |
|--------|---------|------|--------|
| Create | default | Plus | Opens create dialog |
| Delete | destructive | Trash2 | Deletes selected (disabled when empty) |
| Print | outline | Printer | Triggers window.print() |

---

## Styling

### CSS Classes

The component uses Tailwind CSS classes:

- Container: `mx-auto p-6 bg-background`
- Header: `flex justify-between items-center mb-4`
- Title: `text-2xl font-bold`
- Search input: `pl-10 pr-4 py-2 w-full rounded-md border border-gray-300`
- Action buttons: Use shadcn/ui Button with size="sm"

### Responsive Behavior

Current implementation has fixed layout suitable for desktop:
- Search input: Fixed width `w-64`
- Table: Full width with auto column sizing

---

## Performance Considerations

### Optimizations Implemented

1. **useCallback for search**: Prevents unnecessary re-renders
   ```typescript
   const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
     setSearchTerm(e.target.value)
   }, [])
   ```

2. **Computed filtering**: Filter is computed on render, not stored
   ```typescript
   const filteredCurrencies = currencies.filter(...)
   ```

### Future Optimizations (Planned)

- useMemo for filteredCurrencies when list grows large
- Virtualization for large currency lists (1000+)
- Server-side filtering with React Query

---

## Error Handling

### Current Implementation

- **Validation**: Simple checks for required fields
- **Delete confirmation**: Browser `confirm()` dialog
- **No error state**: Errors not displayed to user

### Future Improvements (Planned)

- Toast notifications for success/error
- Form validation with error messages
- Error boundaries for component failures

---

## Testing

### Recommended Test Cases

| Test | Description | Expected Result |
|------|-------------|-----------------|
| Render | Component renders without error | Table displays with 4 currencies |
| Create | Add new currency | Currency appears in list |
| Edit | Modify description | Description updates |
| Delete | Remove currency | Currency removed from list |
| Search | Filter by "USD" | Only USD shown |
| Active filter | Toggle Show Active | Only active currencies shown |
| Select all | Click header checkbox | All visible rows selected |
| Duplicate | Click duplicate action | New currency with _COPY suffix |

---

## Future Enhancements

### Phase 2: Database Integration

- Supabase/PostgreSQL backend
- React Query for server state
- Optimistic updates

### Phase 3: Exchange Rates

- Exchange rate management UI
- External API integration
- Rate history tracking

### Phase 4: Multi-Currency Transactions

- Transaction currency support
- Automatic conversions
- Gain/loss calculations

---

**Document End**
