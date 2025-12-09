# Store Requisitions Documentation

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Store Requisitions
- **Version**: 1.1.0
- **Last Updated**: 2025-12-05
- **Status**: Active - For Implementation

---

## Overview

The Store Requisitions module enables hotel departments (F&B Operations, Housekeeping, Engineering) to request inventory items from the Main Store or other storage locations. It provides a structured workflow for requesting, approving, and issuing materials needed for daily operations.

### Key Features
- ✅ Requisition creation and submission by department staff
- ✅ Multi-level approval workflow for requisitions
- ✅ Item-level approval and quantity adjustments
- ✅ Inventory issuance and stock movement tracking
- ✅ Real-time inventory availability checking
- ✅ Department and location-based access control
- ✅ Complete audit trail for all transactions

---

## Documentation Index

### Core Documentation

| Document | Description | Status |
|----------|-------------|--------|
| [Business Requirements (BR)](./BR-store-requisitions.md) | Business rules, functional requirements, and backend specifications | ✅ Active |
| [Use Cases (UC)](./UC-store-requisitions.md) | User workflows, scenarios, and actor interactions | ✅ Active |
| [Technical Specification (TS)](./TS-store-requisitions.md) | System architecture, components, and implementation details | ✅ Active |
| [Data Definition (DD)](./DD-store-requisitions.md) | Database entity descriptions and relationships | ✅ Active |
| [Flow Diagrams (FD)](./FD-store-requisitions.md) | Visual workflow diagrams (Mermaid 8.8.2 compatible) | ✅ Active |
| [Validations (VAL)](./VAL-store-requisitions.md) | Validation rules, Zod schemas, and business rules | ✅ Active |

### Backend Requirements (Section 10 of BR)

The backend requirements are consolidated within the Business Requirements document:

| Section | Description |
|---------|-------------|
| [API Endpoints](./BR-store-requisitions.md#101-api-endpoints) | REST API specifications (GET, POST, PUT, DELETE) |
| [Server Actions](./BR-store-requisitions.md#102-server-actions) | Next.js server actions for workflow operations |
| [Database Schema](./BR-store-requisitions.md#103-database-schema) | PostgreSQL table definitions and indexes |
| [Service Integrations](./BR-store-requisitions.md#104-service-integrations) | Inventory, Costing, Workflow, Journal services |
| [Error Handling](./BR-store-requisitions.md#105-error-handling) | Error codes and response formats |
| [Performance Requirements](./BR-store-requisitions.md#106-backend-performance-requirements) | Response time and throughput targets |
| [Security Requirements](./BR-store-requisitions.md#107-backend-security-requirements) | Authentication, authorization, data protection |

---

## Shared Methods Integration

Store Requisitions integrates with these shared methods for inventory and costing operations:

| Shared Method | Purpose | Integration Point |
|---------------|---------|-------------------|
| [Inventory Operations](../../shared-methods/inventory-operations/SM-inventory-operations.md) | Balance tracking, transaction recording, state management | Requisition creation, item issuance |
| [Costing Methods](../../shared-methods/inventory-valuation/SM-costing-methods.md) | FIFO/AVG cost determination, lot tracking | Item issuance, journal entry creation |

### Key Integration Patterns

**Inventory Operations**:
```typescript
// Query current balance
inventoryService.getBalance(productId, locationId)

// Record stock movement on issuance
inventoryService.recordTransaction({
  transaction_type: 'ISSUE',
  reference_type: 'STORE_REQUISITION'
})
```

**Costing Methods**:
```typescript
// FIFO cost determination
costingService.getFIFOCost(productId, locationId, quantity)

// Lot number generation: {LOCATION}-{YYMMDD}-{SEQ}
costingService.generateLotNumber(locationId)
```

---

## Quick Reference

### Document Status Workflow
```
Draft → Pending → Approved → Issued → Complete
                ↘ Rejected
                ↘ Sent Back → Draft
```

### Approval Routing Rules
| Condition | Approver Level |
|-----------|----------------|
| Value < $500 | Department Manager |
| Value $500-$2000 | Department Manager → Store Manager |
| Value > $2000 | Department Manager → Store Manager → Finance |
| Contains restricted items | +Security Approval |

### User Roles
| Role | Create | Read | Approve | Issue |
|------|--------|------|---------|-------|
| Staff | Own | Own | ✗ | ✗ |
| Dept Manager | Dept | Dept | ✓ | ✗ |
| Store Manager | ✗ | All | ✓ | ✓ |
| Finance | ✗ | All | ✓ | ✗ |
| Admin | All | All | ✓ | ✓ |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| Inventory Management | Stock levels, transactions, locations |
| Purchase Requests | External procurement (out of scope) |
| Production | Recipe-based consumption (out of scope) |
| Workflow Engine | Approval routing and notifications |
| User Management | Authentication, authorization, departments |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-19 | Initial documentation set |
| 1.1.0 | 2025-12-05 | Consolidated backend requirements into BR, added shared methods integration |

---

## Contact

- **Module Owner**: Store Operations Team
- **Technical Lead**: Development Team
- **Documentation**: Documentation Team

---

> 📝 **Note**: This is the central navigation page for Store Requisitions documentation. All documents are maintained in sync and follow consistent formatting standards.
