# Data Dictionary: Account Code Mapping

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

This document defines the data structures for the Account Code Mapping module. The implementation uses TypeScript interfaces with React local state for data management.

**Related Documents**:
- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Flow Diagrams](./FD-account-code-mapping.md)
- [Validation Rules](./VAL-account-code-mapping.md)

---

## Data Structures

### APMapping Interface

**Location**: `components/account-code-mapping.tsx`

```typescript
interface APMapping {
  id: string
  businessUnit: string
  store: string
  category: string
  subCategory: string
  itemGroup: string
  department: string
  accountCode: string
}
```

### APMapping Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| businessUnit | string | Yes | Business unit (Operations, Rooms, Administration) |
| store | string | Yes | Store or location name/code |
| category | string | Yes | Item category (Food, Beverage) |
| subCategory | string | Yes | Item sub-category (Beers, Spirits, Dry Goods) |
| itemGroup | string | Yes | Item group (Beer, Vodka, Coffee/Tea) |
| department | string | Yes | Department code number |
| accountCode | string | Yes | AP account code |

---

### GLMapping Interface

**Location**: `components/account-code-mapping.tsx`

```typescript
interface GLMapping {
  id: string
  businessUnit: string
  store: string
  category: string
  itemGroup: string
  movementType: string
  drDepartment: string
  crDepartment: string
  drAccount: string
  crAccount: string
}
```

### GLMapping Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| businessUnit | string | Yes | Business unit |
| store | string | Yes | Store or location |
| category | string | Yes | Item category |
| itemGroup | string | Yes | Item group |
| movementType | string | Yes | Movement type (Purchase, Transfer, Sale, Usage) |
| drDepartment | string | Yes | Debit department name |
| crDepartment | string | Yes | Credit department name |
| drAccount | string | Yes | Debit GL account code |
| crAccount | string | Yes | Credit GL account code |

---

## Component State

### AccountCodeMapping State

**Location**: `components/account-code-mapping.tsx`

| State Variable | Type | Initial Value | Description |
|----------------|------|---------------|-------------|
| selectedView | string | "posting-to-ap" | Current view type |
| searchTerm | string | "" | Search filter value |
| isCreateDialogOpen | boolean | false | Create dialog visibility |
| isEditDialogOpen | boolean | false | Edit dialog visibility |
| isViewDialogOpen | boolean | false | View dialog visibility |
| selectedMapping | APMapping or GLMapping or null | null | Currently selected mapping |
| apMappingData | APMapping[] | Mock data (6 entries) | AP mappings array |
| glMappingData | GLMapping[] | Mock data (5 entries) | GL mappings array |
| formData | Partial<APMapping or GLMapping> | {} | Form input values |

---

## Mock Data

### AP Mapping Sample Data

| Business Unit | Store | Category | Sub-Category | Item Group | Dept | Account |
|---------------|-------|----------|--------------|------------|------|---------|
| Operations | Mini Bar | Beverage | Beers | Beer | 35 | 5000020 |
| Operations | MIN1 | Beverage | Spirits | Vodka | 35 | 5000020 |
| Rooms | Housekeeping | Food | Dry Goods | Coffee/Tea | 21 | 1116007 |
| Rooms | RH | Food | Dry Goods | Sugar | 21 | 1116007 |
| Administration | A&G Security | Beverage | Soft Drink | Waters | 10 | 1111005 |
| Administration | AGS | Beverage | Soft Drink | Juices | 10 | 1111005 |

### GL Mapping Sample Data

| Business Unit | Store | Category | Item Group | Movement | Dr Dept | Cr Dept | Dr Account | Cr Account |
|---------------|-------|----------|------------|----------|---------|---------|------------|------------|
| Operations | Kitchen | Food | Vegetables | Purchase | Kitchen | Inventory | 5001001 | 1200001 |
| Operations | Kitchen | Food | Meat | Transfer | Kitchen | Warehouse | 5001002 | 1200002 |
| Operations | Bar | Beverage | Beer | Sale | Bar | Revenue | 1100001 | 4000001 |
| Rooms | Housekeeping | Supplies | Cleaning | Usage | Housekeeping | Supplies | 6001001 | 1200003 |
| Administration | Office | Office Supplies | Stationery | Purchase | Admin | Inventory | 6002001 | 1200004 |

---

## Movement Types

| Movement Type | Description | Typical Posting |
|---------------|-------------|-----------------|
| Purchase | Goods received from vendor | Dr: Expense/Inventory, Cr: AP |
| Transfer | Inter-location movement | Dr: To Location, Cr: From Location |
| Sale | Goods sold to customer | Dr: COGS, Cr: Inventory |
| Usage | Internal consumption | Dr: Expense, Cr: Inventory |

---

## Data Operations

### handleSaveCreate

**Purpose**: Creates a new mapping record.

```typescript
const handleSaveCreate = () => {
  const newId = String(Date.now())
  if (selectedView === "posting-to-ap") {
    setApMappingData([...apMappingData, { ...(formData as APMapping), id: newId }])
  } else {
    setGlMappingData([...glMappingData, { ...(formData as GLMapping), id: newId }])
  }
  setIsCreateDialogOpen(false)
  setFormData({})
}
```

### handleSaveEdit

**Purpose**: Updates an existing mapping record.

```typescript
const handleSaveEdit = () => {
  if (selectedView === "posting-to-ap") {
    setApMappingData(apMappingData.map(m =>
      m.id === selectedMapping?.id ? formData as APMapping : m
    ))
  } else {
    setGlMappingData(glMappingData.map(m =>
      m.id === selectedMapping?.id ? formData as GLMapping : m
    ))
  }
  setIsEditDialogOpen(false)
}
```

### handleDelete

**Purpose**: Removes a mapping record.

```typescript
const handleDelete = (id: string) => {
  if (window.confirm('Are you sure you want to delete this mapping?')) {
    if (selectedView === "posting-to-ap") {
      setApMappingData(apMappingData.filter(m => m.id !== id))
    } else {
      setGlMappingData(glMappingData.filter(m => m.id !== id))
    }
  }
}
```

### handleDuplicate

**Purpose**: Creates a copy of an existing mapping.

```typescript
const handleDuplicate = (mapping: APMapping | GLMapping) => {
  const newId = String(Date.now())
  if (selectedView === "posting-to-ap") {
    setApMappingData([...apMappingData, { ...(mapping as APMapping), id: newId }])
  } else {
    setGlMappingData([...glMappingData, { ...(mapping as GLMapping), id: newId }])
  }
}
```

---

## Computed Values

### filteredAPData

```typescript
const filteredAPData = apMappingData.filter(row =>
  Object.values(row).some(val =>
    val.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )
)
```

### filteredGLData

```typescript
const filteredGLData = glMappingData.filter(row =>
  Object.values(row).some(val =>
    val.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )
)
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

**Document End**
