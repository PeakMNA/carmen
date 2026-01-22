# Stock Transfers Documentation

**Module**: Store Operations
**Sub-Module**: Stock Transfers
**Status**: ACTIVE
**Last Updated**: 2025-01-22

---

## Quick Links

| Document | Description | Status |
|----------|-------------|--------|
| [Business Rules](./BR-stock-transfers.md) | Business rules, view definition, and constraints | Complete |
| [Use Cases](./UC-stock-transfers.md) | User workflows and actor interactions | Complete |
| [Data Structure](./DS-stock-transfers.md) | Data model and entity relationships | Complete |
| [Technical Specification](./TS-stock-transfers.md) | System architecture and implementation details | Complete |
| [Flow Diagrams](./FD-stock-transfers.md) | Visual workflow diagrams (Mermaid 8.8.2) | Complete |
| [Validations](./VAL-stock-transfers.md) | Validation rules and constraints | Complete |

---

## Overview

**Stock Transfers** is a **read-only audit view** of Store Requisitions for inventory movements between INVENTORY-type locations.

**Key Architecture**: Stock Transfers are NOT separate documents. They are **filtered views** of Store Requisitions that have been issued to INVENTORY destinations. This view serves audit and verification purposes.

```
Stock Transfer View = SRs where:
  - stage = 'issue' OR stage = 'complete'
  - destinationLocationType = 'INVENTORY'
```

**Purpose**: Enable inventory managers, auditors, and operations staff to review all inventory movements between storage locations, verify stock balances, and generate documentation for tracking purposes.

---

## Audit Purpose

### Why Stock Transfers Exists

Stock Transfers provides a dedicated view for:

1. **Movement Verification**: Review all inventory movements between storage locations
2. **Stock Reconciliation**: Verify source deductions and destination additions match
3. **Location Tracking**: Monitor inventory flow between specific locations
4. **Audit Trail**: Access complete history of transfers with timestamps and users
5. **Document Generation**: Print transfer slips for physical verification

### What Auditors Can Do

| Activity | Description |
|----------|-------------|
| View Transfer History | See all issued and completed inventory movements |
| Filter by Period | Review transfers within specific date ranges |
| Filter by Location | Focus on specific source or destination locations |
| Print Transfer Slips | Generate documentation for verification |
| Verify Stock Balances | Cross-reference with inventory records |

---

## Key Concepts

### What is a Stock Transfer?

A Stock Transfer represents the movement of inventory items from one storage location to another. Unlike Stock Issues (which expense items), Stock Transfers maintain inventory tracking at both source and destination.

### View vs Document

| Aspect | Stock Transfer |
|--------|----------------|
| Document Type | Filtered view of SR (read-only) |
| Reference Number | Uses SR reference (SR-YYMM-NNNN) |
| Status/Stage | Uses SR status and stage |
| Available Actions | View and Print only |
| Data Storage | Part of Store Requisitions |
| Stage Management | Handled by Store Requisitions module |

### Location Types

| Type | Role in Transfer |
|------|------------------|
| Source | INVENTORY (storage location) |
| Destination | INVENTORY (storage location) |

---

## Core Workflows

### 1. View Stock Transfers

**Owner**: Store Staff, Inventory Managers, Auditors
**Description**: View list of SRs at Issue or Complete stage with INVENTORY destinations.

**Features**:
- Filter by source location
- Filter by destination location
- Filter by date range
- Filter by stage (Issue, Complete)
- Search by SR reference number
- View transfer details with quantities

### 2. Print Transfer Slip

**Owner**: Store Staff, Auditors
**Description**: Generate printable transfer documentation for physical verification.

**Use Cases**:
- Physical movement verification
- Audit documentation
- Inventory reconciliation support
- Location stock verification

---

## Inventory Impact

### Stock Movement on Issue

When an SR reaches the Issue stage with an INVENTORY destination:

| Movement | Action |
|----------|--------|
| Source Location | Deduct issuedQty from stock |
| Destination Location | Add issuedQty to stock |
| Timing | Immediate (no transit state) |
| Cost | Transfers at book value (no markup) |

### No GL Impact

Unlike Stock Issues, Stock Transfers do not generate expense entries:
- Cost moves with the inventory (balance sheet movement only)
- No COGS impact
- No department expense allocation

---

## Audit Trail

### Tracked Information

| Field | Description |
|-------|-------------|
| issuedAt | Timestamp when transfer was processed |
| issuedBy | User who processed the transfer |
| completedAt | Timestamp when SR was marked complete |
| completedBy | User who marked SR complete |
| createdAt | Original SR creation timestamp |
| requestedBy | User who created the SR |
| approvedBy | User who approved the SR |
| approvedAt | Approval timestamp |

### Document References

| Reference | Description |
|-----------|-------------|
| SR Reference | Source Store Requisition number |
| Source Location | Inventory location that sent items |
| Destination Location | Inventory location that received items |

---

## Stock Movement Rules

### On Issue (When SR reaches Issue stage)

| Rule | Description |
|------|-------------|
| Source Deduction | Deduct issuedQty from source location |
| Destination Addition | Add issuedQty to destination location |
| Immediate Movement | Stock movement is immediate (no transit state) |
| Cost Transfer | Cost moves with stock (no markup) |

---

## Costing Rules

| Rule | Description |
|------|-------------|
| Unit Cost | From SR item unitCost |
| Total Value | totalCost = issuedQty x unitCost |
| Cost Method | Cost transfers at book value |
| Currency | System base currency |

---

## Access Control

| Role | Permissions |
|------|-------------|
| Store Staff | View transfers for assigned locations, Print |
| Store Manager | View all transfers, Print |
| Inventory Manager | Full access to all transfer views, Print |
| Auditor | View all transfers, full audit trail access, Print |

**Note**: Stage management (Issue → Complete) is performed in the Store Requisitions module, not in Stock Transfers.

---

## Differences from Stock Issues

| Aspect | Stock Transfer | Stock Issue |
|--------|----------------|-------------|
| Destination Type | INVENTORY | DIRECT (expense) |
| Stock at Destination | Added to inventory | Not tracked (expensed) |
| Cost Treatment | Transfer at cost | Immediate expense |
| Department | Optional | Required |
| COGS Impact | No | Yes |
| Purpose | Inventory movement tracking | Expense verification |

---

## Related Documentation

### Within Store Operations
- [Store Requisitions](../store-requisitions/INDEX-store-requisitions.md) - Source documents and workflow management
- [Stock Issues](../stock-issues/INDEX-stock-issues.md) - Audit view for expense issues
- [Wastage Reporting](../wastage-reporting/INDEX-wastage-reporting.md) - Wastage tracking

### Other Modules
- [Inventory Management](../../inventory-management/) - Core inventory functionality
- [System Administration > Location Management](../../system-administration/location-management/) - Location setup

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-01-22 | Documentation Team | Corrected to read-only audit view, removed Complete workflow |
| 1.0.0 | 2025-01-22 | Documentation Team | Initial index page created |

---

**Document Control**:
- **Created**: 2025-01-22
- **Author**: Documentation Team
- **Next Review**: 2025-02-22
