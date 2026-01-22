# Data Dictionary: Exchange Rate Management

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
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |
| 1.0.0 | 2025-01-13 | Finance Product Team | Initial version |

---

## Overview

This document defines the data structures for the Exchange Rate Management module. The current implementation uses React local state with TypeScript interfaces for type safety.

**Related Documents**:
- [Business Requirements](./BR-exchange-rate-management.md)
- [Use Cases](./UC-exchange-rate-management.md)
- [Technical Specification](./TS-exchange-rate-management.md)
- [Flow Diagrams](./FD-exchange-rate-management.md)
- [Validation Rules](./VAL-exchange-rate-management.md)

---

## Data Structures

### ExchangeRate Interface

**Purpose**: Defines the structure for exchange rate records.

**Location**: `components/exchange-rate-viewer.tsx`

```typescript
interface ExchangeRate {
  code: string        // ISO 4217 currency code (e.g., USD, EUR)
  name: string        // Full currency name
  rate: number        // Exchange rate value (6 decimal precision)
  lastUpdated: string // Date of last update (YYYY-MM-DD format)
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | ISO 4217 currency code (3 characters) |
| name | string | Yes | Full currency name |
| rate | number | Yes | Exchange rate value (supports 6 decimals) |
| lastUpdated | string | Yes | Last update date in YYYY-MM-DD format |

---

## Component State

### ExchangeRateViewer State

**Location**: `components/exchange-rate-viewer.tsx`

| State Variable | Type | Initial Value | Description |
|----------------|------|---------------|-------------|
| currencies | ExchangeRate[] | Mock data (4 currencies) | Array of all exchange rates |
| searchTerm | string | '' | Current search filter value |
| isAddDialogOpen | boolean | false | Add dialog visibility |
| isEditDialogOpen | boolean | false | Edit dialog visibility |
| editingRate | ExchangeRate \| null | null | Rate being edited |
| newRate | object | Default values | Form state for new rate |

### newRate Default Values

```typescript
{
  code: '',
  name: '',
  rate: 1.0,
  lastUpdated: new Date().toISOString().split('T')[0]
}
```

---

## Mock Data

### Default Exchange Rates

**Location**: `components/exchange-rate-viewer.tsx` (inline)

```typescript
const initialCurrencies: ExchangeRate[] = [
  { code: "USD", name: "United States Dollar", rate: 1.000000, lastUpdated: "2023-07-01" },
  { code: "EUR", name: "Euro", rate: 0.920000, lastUpdated: "2023-07-01" },
  { code: "JPY", name: "Japanese Yen", rate: 144.500000, lastUpdated: "2023-07-01" },
  { code: "GBP", name: "British Pound Sterling", rate: 0.790000, lastUpdated: "2023-07-01" },
]
```

### Sample Data Reference

| Code | Name | Rate | Last Updated |
|------|------|------|--------------|
| USD | United States Dollar | 1.000000 | 2023-07-01 |
| EUR | Euro | 0.920000 | 2023-07-01 |
| JPY | Japanese Yen | 144.500000 | 2023-07-01 |
| GBP | British Pound Sterling | 0.790000 | 2023-07-01 |

---

## Computed Values

### filteredCurrencies

**Purpose**: Filters currency list based on search term.

**Computation**:
```typescript
const filteredCurrencies = currencies.filter(currency =>
  currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
  currency.name.toLowerCase().includes(searchTerm.toLowerCase())
)
```

**Matches Against**:
- Currency code (case-insensitive)
- Currency name (case-insensitive)

---

## Data Operations

### Create Rate

**Trigger**: Submit Add Rate dialog

**Validation**:
- code must not be empty
- name must not be empty
- rate must be > 0

**Operation**:
```typescript
setCurrencies([...currencies, {
  ...newRate,
  lastUpdated: new Date().toISOString().split('T')[0]
}])
```

### Update Rate

**Trigger**: Submit Edit Rate dialog

**Operation**:
```typescript
setCurrencies(currencies.map(c =>
  c.code === editingRate.code
    ? { ...editingRate, lastUpdated: new Date().toISOString().split('T')[0] }
    : c
))
```

**Note**: Matches by code (code is unique identifier)

### Delete Rate

**Trigger**: Confirm delete action

**Operation**:
```typescript
setCurrencies(currencies.filter(c => c.code !== code))
```

---

## Data Flow Diagram

```
User Actions           State Changes          UI Updates
-----------           -------------          ----------
Type in search   -->  setSearchTerm    -->  Filter table rows
Click Add Rate   -->  setIsAddDialogOpen --> Show dialog
Fill form        -->  setNewRate       -->  Update form inputs
Submit add       -->  setCurrencies    -->  Add row to table
Click Edit       -->  setEditingRate   -->  Populate dialog
                      setIsEditDialogOpen
Submit edit      -->  setCurrencies    -->  Update row in table
Click Delete     -->  confirm()        -->  Show browser dialog
Confirm delete   -->  setCurrencies    -->  Remove row from table
```

---

## Data Persistence

### Current State
- **Storage**: React local state (useState)
- **Persistence**: None (data resets on page refresh)
- **Data Source**: Hardcoded mock data

### Future State (Planned)
- **Storage**: PostgreSQL database
- **ORM**: Prisma
- **Persistence**: Full CRUD to database

---

## Related Data Structures

### Currency Management Reference

The Exchange Rate Management module shares currency code standards with the Currency Management module.

| Module | Data | Relationship |
|--------|------|--------------|
| Currency Management | Currency codes | Reference (planned) |
| Procurement | Transaction rates | Consumer (planned) |
| Vendor Management | Vendor currency | Consumer (planned) |

---

**Document End**
