# System Integrations

Centralized management for connecting external systems (POS, ERP, APIs) with Carmen ERP.

---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/system-administration/system-integrations/business-requirements)<br/>Business Requirements | [**UC**](/system-administration/system-integrations/use-cases)<br/>Use Cases | [**TS**](/system-administration/system-integrations/technical-specification)<br/>Technical Spec |
| [**DD**](/system-administration/system-integrations/data-dictionary)<br/>Data Dictionary | [**FD**](/system-administration/system-integrations/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/system-administration/system-integrations/validations)<br/>Validations |

---

## Documents

| Document | Description |
|----------|-------------|
| [BR-system-integrations](./BR-system-integrations.md) | Business Requirements |
| [UC-system-integrations](./UC-system-integrations.md) | Use Cases |
| [DD-system-integrations](./DD-system-integrations.md) | Data Dictionary |
| [TS-system-integrations](./TS-system-integrations.md) | Technical Specification |
| [FD-system-integrations](./FD-system-integrations.md) | Flow Diagrams |
| [VAL-system-integrations](./VAL-system-integrations.md) | Validation Rules |

## Sub-Modules

| Module | Route | Documentation |
|--------|-------|---------------|
| [POS Integration](./pos-integration/index.md) | `/system-integration/pos` | Point-of-Sale system integration |
| ERP Integration | - | Financial system sync (Planned) |
| API Management | - | External API connections (Planned) |

## Features

### POS Integration (Active)
- Dashboard monitoring and alerts
- Recipe mapping with outlet-specific pricing
- Location mapping and sync
- Fractional variants for partial sales
- Transaction processing with approval workflow
- Consumption and gross profit reports

### ERP Integration (Planned)
- Financial system synchronization
- Account code mapping

### API Management (Planned)
- External API connections
- Webhook configuration

## Route

`/system-administration/system-integration`
