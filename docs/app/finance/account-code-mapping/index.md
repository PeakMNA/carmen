# Account Code Mapping Documentation Index

## Module Overview

The Account Code Mapping module provides a unified interface for managing mappings between inventory transactions and accounting codes in hospitality environments. It supports two primary views:

1. **Posting to AP**: Maps procurement transactions to Accounts Payable debit accounts
2. **Posting to GL**: Maps inventory movements to General Ledger debit/credit account pairs

---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/finance/account-code-mapping/business-requirements)<br/>Business Requirements | [**UC**](/finance/account-code-mapping/use-cases)<br/>Use Cases | [**TS**](/finance/account-code-mapping/technical-specification)<br/>Technical Spec |
| [**DD**](/finance/account-code-mapping/data-dictionary)<br/>Data Dictionary | [**FD**](/finance/account-code-mapping/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/finance/account-code-mapping/validations)<br/>Validations |

---

## Quick Links

| Document | Description |
|----------|-------------|
| [BR-account-code-mapping.md](./BR-account-code-mapping.md) | Business Rules - Core requirements and feature definitions |
| [UC-account-code-mapping.md](./UC-account-code-mapping.md) | Use Cases - User workflows and interactions |
| [DD-account-code-mapping.md](./DD-account-code-mapping.md) | Data Dictionary - Data structures and field definitions |
| [FD-account-code-mapping.md](./FD-account-code-mapping.md) | Flow Diagrams - Visual workflow representations |
| [TS-account-code-mapping.md](./TS-account-code-mapping.md) | Technical Specifications - Architecture and implementation |
| [VAL-account-code-mapping.md](./VAL-account-code-mapping.md) | Validation Rules - Field and business rule validations |

## Key Features

### AP Mapping View
- Maps inventory procurement to AP debit accounts
- Fields: Business Unit, Store, Category, Sub-Category, Item Group, Department, Account Code
- Tax accounts default from Vendor Profile

### GL Mapping View
- Maps inventory movements to GL debit/credit pairs
- Movement types: Purchase, Transfer, Sale, Usage
- Supports double-entry accounting with separate Dr./Cr. accounts

### CRUD Operations
- Create, View, Edit, Delete, Duplicate mappings
- Search/filter across all fields
- Print current view

## Data Structures

### AP Mapping
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

### GL Mapping
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

## Source Code Location

```
app/(main)/finance/account-code-mapping/
└── page.tsx                    # Route page

components/
└── account-code-mapping.tsx    # Main component (836 lines)
```

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Currency Management](../currency-management/) | Currency codes for multi-currency transactions |
| [Exchange Rates](../exchange-rate-management/) | Exchange rate lookups for foreign currency |
| [Department Management](../department-management/) | Department master data |
| [Procurement](../../procurement/) | Source transactions for AP posting |
| [Inventory Management](../../inventory-management/) | Source transactions for GL posting |

---

**Document End**
