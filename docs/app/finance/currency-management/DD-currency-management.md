# Data Dictionary: Currency Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Currency Management
- **Database**: Local State (useState)
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |

---

## Overview

The Currency Management data model provides a simple structure for managing currency master data. The current implementation uses React local state (useState) with an in-memory data structure. Future phases will integrate with a database backend.

**Current Implementation**: Client-side state management with mock data. No database persistence in current phase.

**Related Documents**:
- [Business Requirements](./BR-currency-management.md)
- [Use Cases](./UC-currency-management.md)
- [Technical Specification](./TS-currency-management.md)
- [Flow Diagrams](./FD-currency-management.md)
- [Validations](./VAL-currency-management.md)

---

## Data Entities

### Entity: Currency

**Description**: Represents a single currency in the system with its code, description, and active status.

**Business Purpose**: Provides the foundation for currency selection throughout Carmen ERP. Currencies are used as reference data in transactions, vendor records, and financial documents.

**Data Storage**: React useState (client-side)

**Data Volume**: Low (typically 4-50 currencies)

#### TypeScript Interface

```typescript
interface Currency {
  code: string        // ISO 4217 currency code (e.g., USD, EUR)
  description: string // Full currency name (e.g., United States Dollar)
  active: boolean     // Whether currency is available for selection
}
```

#### Field Definitions

| Field | Type | Required | Default | Description | Example Values | Constraints |
|-------|------|----------|---------|-------------|----------------|-------------|
| code | string | Yes | - | Currency code | USD, EUR, GBP, JPY | Non-empty, auto-uppercase |
| description | string | Yes | - | Full currency name | United States Dollar | Non-empty |
| active | boolean | Yes | true | Whether currency is active | true, false | Boolean |

#### Sample Data

The system initializes with the following default currencies:

```typescript
const currencies: Currency[] = [
  { code: 'USD', description: 'United States Dollar', active: true },
  { code: 'EUR', description: 'Euro', active: true },
  { code: 'JPY', description: 'Japanese Yen', active: true },
  { code: 'GBP', description: 'British Pound Sterling', active: true },
]
```

---

## State Management

### Component State

The Currency Management component maintains the following state variables:

```typescript
// Primary data
const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies)

// Filter state
const [showActive, setShowActive] = useState(false)
const [searchTerm, setSearchTerm] = useState('')

// Selection state
const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([])

// Dialog state
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null)

// Form state
const [newCurrency, setNewCurrency] = useState({ code: '', description: '', active: true })
```

### State Description

| State Variable | Type | Purpose |
|----------------|------|---------|
| currencies | Currency[] | Main data store for all currencies |
| showActive | boolean | Filter toggle for active currencies |
| searchTerm | string | Current search/filter text |
| selectedCurrencies | string[] | Array of selected currency codes |
| isCreateDialogOpen | boolean | Controls create dialog visibility |
| isEditDialogOpen | boolean | Controls edit dialog visibility |
| editingCurrency | Currency or null | Currency being edited |
| newCurrency | Partial Currency | Form state for new currency |

---

## Computed Values

### Filtered Currencies

The displayed currency list is computed by filtering based on search term and active status:

```typescript
const filteredCurrencies = currencies.filter(currency =>
  (showActive ? currency.active : true) &&
  (currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
   currency.description.toLowerCase().includes(searchTerm.toLowerCase()))
)
```

**Filter Logic**:
1. If `showActive` is true, only include currencies where `active === true`
2. If `showActive` is false, include all currencies
3. Match `searchTerm` against both `code` and `description` (case-insensitive)

---

## Data Operations

### Create Currency

```typescript
const handleCreateCurrency = () => {
  if (newCurrency.code && newCurrency.description) {
    setCurrencies([...currencies, newCurrency])
    setNewCurrency({ code: '', description: '', active: true })
    setIsCreateDialogOpen(false)
  }
}
```

**Validation**: Both `code` and `description` must be non-empty.

### Update Currency

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

**Behavior**: Matches by `code` (which is immutable during edit).

### Delete Currency

```typescript
// Single delete
setCurrencies(currencies.filter(c => c.code !== currency.code))

// Bulk delete
const handleDeleteSelected = () => {
  setCurrencies(currencies.filter(c => !selectedCurrencies.includes(c.code)))
  setSelectedCurrencies([])
}
```

**Confirmation**: User must confirm via browser dialog.

### Duplicate Currency

```typescript
const handleDuplicateCurrency = (currency: Currency) => {
  const newCode = `${currency.code}_COPY`
  setCurrencies([...currencies, { ...currency, code: newCode }])
}
```

**Behavior**: Appends `_COPY` suffix to code.

### Toggle Active Status

```typescript
const toggleActive = (code: string) => {
  setCurrencies(currencies.map(currency =>
    currency.code === code ? { ...currency, active: !currency.active } : currency
  ))
}
```

**Behavior**: Inline toggle via checkbox.

---

## Future Data Model (Planned)

The following entities are planned for future implementation when database persistence is added:

### currencies (Database Table)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | VARCHAR(10) | ISO 4217 currency code |
| description | VARCHAR(100) | Full currency name |
| symbol | VARCHAR(10) | Currency symbol |
| minor_unit | INTEGER | Decimal places |
| is_active | BOOLEAN | Active status |
| is_base | BOOLEAN | Base currency flag |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### exchange_rates (Database Table)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| from_currency | VARCHAR(10) | Source currency code |
| to_currency | VARCHAR(10) | Target currency code |
| rate | DECIMAL(18,8) | Exchange rate |
| rate_date | DATE | Effective date |
| source | VARCHAR(50) | Rate source |
| created_at | TIMESTAMPTZ | Creation timestamp |

---

## Data Validation Summary

| Field | Validation | Error Handling |
|-------|------------|----------------|
| code | Required, non-empty | Create button disabled |
| description | Required, non-empty | Create button disabled |
| active | Boolean | Default: true |

---

## Integration Points

### Current

None - data is stored locally in component state.

### Planned

| Integration | Purpose |
|-------------|---------|
| Supabase/PostgreSQL | Database persistence |
| React Query | Server state management |
| Vendor Management | Currency reference for vendors |
| Purchase Orders | Transaction currency |

---

**Document End**
