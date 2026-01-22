# Account Code Mapping Documentation Index

## Module Overview

The Account Code Mapping module enables Financial Controllers to configure how inventory transactions are posted to the financial system. It provides two mapping views: Posting to AP (Accounts Payable) and Posting to GL (General Ledger).

**Current Implementation**: Full CRUD operations for both AP and GL mappings using React local state.

---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/system-administration/account-code-mapping/business-requirements)<br/>Business Requirements | [**UC**](/system-administration/account-code-mapping/use-cases)<br/>Use Cases | [**TS**](/system-administration/account-code-mapping/technical-specification)<br/>Technical Spec |
| [**DD**](/system-administration/account-code-mapping/data-dictionary)<br/>Data Dictionary | [**FD**](/system-administration/account-code-mapping/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/system-administration/account-code-mapping/validations)<br/>Validations |

---

## Quick Links

| Document | Description |
|----------|-------------|
| [BR-account-code-mapping.md](./BR-account-code-mapping.md) | Business Requirements - Core requirements and feature definitions |
| [UC-account-code-mapping.md](./UC-account-code-mapping.md) | Use Cases - User workflows and interactions |
| [DD-account-code-mapping.md](./DD-account-code-mapping.md) | Data Dictionary - Data structures and field definitions |
| [FD-account-code-mapping.md](./FD-account-code-mapping.md) | Flow Diagrams - Visual workflow representations |
| [TS-account-code-mapping.md](./TS-account-code-mapping.md) | Technical Specifications - Architecture and implementation |
| [VAL-account-code-mapping.md](./VAL-account-code-mapping.md) | Validation Rules - Field and business rule validations |

## Key Features

### Current Implementation

- **View Mappings**: Display AP and GL mappings in tables
- **Switch Views**: Toggle between Posting to AP and Posting to GL
- **Search**: Filter mappings across all fields
- **Create Mapping**: Add new mapping record
- **Edit Mapping**: Modify existing mapping
- **View Details**: Read-only view of mapping
- **Delete Mapping**: Remove with browser confirmation
- **Duplicate Mapping**: Copy existing mapping
- **Print**: Print current mapping list

### Data Structures

```typescript
// AP Mapping
interface APMapping {
  id: string
  businessUnit: string    // Operations, Rooms, Administration
  store: string           // Store/Location name
  category: string        // Food, Beverage
  subCategory: string     // Beers, Spirits, Dry Goods
  itemGroup: string       // Beer, Vodka, Coffee/Tea
  department: string      // Department code
  accountCode: string     // AP account code
}

// GL Mapping
interface GLMapping {
  id: string
  businessUnit: string
  store: string
  category: string
  itemGroup: string
  movementType: string    // Purchase, Transfer, Sale, Usage
  drDepartment: string    // Debit department
  crDepartment: string    // Credit department
  drAccount: string       // Debit GL account
  crAccount: string       // Credit GL account
}
```

## Source Code Location

```
app/(main)/system-administration/account-code-mapping/
└── page.tsx                           # Route page (5 lines)

components/
└── account-code-mapping.tsx           # Main component (837 lines)
```

## Sample Data

### AP Mappings
| Business Unit | Store | Category | Account |
|---------------|-------|----------|---------|
| Operations | Mini Bar | Beverage | 5000020 |
| Rooms | Housekeeping | Food | 1116007 |
| Administration | A&G Security | Beverage | 1111005 |

### GL Mappings
| Store | Movement | Dr Account | Cr Account |
|-------|----------|------------|------------|
| Kitchen | Purchase | 5001001 | 1200001 |
| Kitchen | Transfer | 5001002 | 1200002 |
| Bar | Sale | 1100001 | 4000001 |

## Future Enhancements

| Phase | Feature | Description |
|-------|---------|-------------|
| Phase 2 | Database Integration | Persist mappings to database |
| Phase 2 | Scan Feature | Auto-discover unmapped combinations |
| Phase 2 | Import/Export CSV | Bulk mapping management |
| Phase 3 | Account Validation | Validate codes against Chart of Accounts |

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Procurement](../../procurement/) | Uses AP mappings for purchase postings |
| [Inventory Management](../../inventory-management/) | Uses GL mappings for movement postings |
| [Finance](../../finance/) | Chart of Accounts reference |

---

**Document End**
