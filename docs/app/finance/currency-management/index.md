# Currency Management Documentation Index

## Module Overview

The Currency Management module provides a simple interface for maintaining currency master data in the Carmen ERP system. It enables finance administrators to create, view, edit, and manage currencies that are available for use throughout the application.

**Current Implementation**: Basic CRUD operations for currency master data using React local state.

---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/finance/currency-management/business-requirements)<br/>Business Requirements | [**UC**](/finance/currency-management/use-cases)<br/>Use Cases | [**TS**](/finance/currency-management/technical-specification)<br/>Technical Spec |
| [**DD**](/finance/currency-management/data-dictionary)<br/>Data Dictionary | [**FD**](/finance/currency-management/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/finance/currency-management/validations)<br/>Validations |

---

## Quick Links

| Document | Description |
|----------|-------------|
| [BR-currency-management.md](./BR-currency-management.md) | Business Rules - Core requirements and feature definitions |
| [UC-currency-management.md](./UC-currency-management.md) | Use Cases - User workflows and interactions |
| [DD-currency-management.md](./DD-currency-management.md) | Data Dictionary - Data structures and field definitions |
| [FD-currency-management.md](./FD-currency-management.md) | Flow Diagrams - Visual workflow representations |
| [TS-currency-management.md](./TS-currency-management.md) | Technical Specifications - Architecture and implementation |
| [VAL-currency-management.md](./VAL-currency-management.md) | Validation Rules - Field and business rule validations |

## Key Features

### Current Implementation

- **Currency List**: View all currencies in table format
- **Create Currency**: Add new currency with code and description
- **Edit Currency**: Modify currency description and active status
- **Delete Currency**: Remove currencies (single or bulk)
- **Duplicate Currency**: Copy existing currency
- **Search**: Filter by code or description
- **Active Filter**: Show only active currencies
- **Print**: Print current currency list

### Data Structure

```typescript
interface Currency {
  code: string        // ISO 4217 currency code (e.g., USD, EUR)
  description: string // Full currency name
  active: boolean     // Whether currency is available for selection
}
```

### Default Currencies

| Code | Description | Active |
|------|-------------|--------|
| USD | United States Dollar | Yes |
| EUR | Euro | Yes |
| JPY | Japanese Yen | Yes |
| GBP | British Pound Sterling | Yes |

## Source Code Location

```
app/(main)/finance/currency-management/
  page.tsx                    # Route page

components/
  currency-management.tsx     # Main component (318 lines)
```

## Future Enhancements

| Phase | Feature | Description |
|-------|---------|-------------|
| Phase 2 | Database Integration | Persist currencies to database |
| Phase 3 | Exchange Rates | Add exchange rate management |
| Phase 4 | Multi-Currency Transactions | Support transactions in multiple currencies |

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Exchange Rate Management](../exchange-rate-management/) | Rate configuration (planned) |
| [Account Code Mapping](../account-code-mapping/) | GL account mappings |
| [Vendor Management](../../vendor-management/) | Currency reference for vendors |
| [Procurement](../../procurement/) | Transaction currency |

---

**Document End**
