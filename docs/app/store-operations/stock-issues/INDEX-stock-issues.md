# Stock Issues Documentation

**Module**: Store Operations
**Sub-Module**: Stock Issues
**Status**: ACTIVE
**Last Updated**: 2025-01-22

---

## Quick Links

| Document | Description | Status |
|----------|-------------|--------|
| [Business Rules](./BR-stock-issues.md) | Business rules, view definition, and constraints | Complete |
| [Use Cases](./UC-stock-issues.md) | User workflows and actor interactions | Complete |
| [Data Structure](./DS-stock-issues.md) | Data model and entity relationships | Complete |
| [Technical Specification](./TS-stock-issues.md) | System architecture and implementation details | Complete |
| [Flow Diagrams](./FD-stock-issues.md) | Visual workflow diagrams (Mermaid 8.8.2) | Complete |
| [Validations](./VAL-stock-issues.md) | Validation rules and constraints | Complete |

---

## Overview

**Stock Issues** is a **read-only audit view** of Store Requisitions for direct issues to expense/consumption locations (DIRECT type).

**Key Architecture**: Stock Issues are NOT separate documents. They are **filtered views** of Store Requisitions that have been issued to DIRECT destinations. This view serves audit and verification purposes.

```
Stock Issue View = SRs where:
  - stage = 'issue' OR stage = 'complete'
  - destinationLocationType = 'DIRECT'
```

**Purpose**: Enable auditors, finance staff, and managers to review all direct expense transactions, verify GL postings, and generate documentation for accounting purposes.

---

## Audit Purpose

### Why Stock Issues Exists

Stock Issues provides a dedicated view for:

1. **Transaction Verification**: Review all items issued directly to expense locations
2. **GL Reconciliation**: Verify expense postings match physical issues
3. **Department Cost Tracking**: Monitor costs allocated to specific departments
4. **Audit Trail**: Access complete history of direct issues with timestamps and users
5. **Document Generation**: Print issue slips for physical verification

### What Auditors Can Do

| Activity | Description |
|----------|-------------|
| View Issue History | See all issued and completed direct transactions |
| Filter by Period | Review issues within specific date ranges |
| Filter by Department | Focus on specific department expenses |
| Filter by Location | Review issues from specific source locations |
| Print Issue Slips | Generate documentation for verification |
| Verify GL Postings | Cross-reference with accounting entries |

---

## Key Concepts

### What is a Stock Issue?

A Stock Issue represents items that have been issued directly to consumption or expense locations (kitchens, departments). Unlike Stock Transfers, issued items are immediately expensed and not tracked as inventory at the destination.

### View vs Document

| Aspect | Stock Issue |
|--------|-------------|
| Document Type | Filtered view of SR (read-only) |
| Reference Number | Uses SR reference (SR-YYMM-NNNN) |
| Status/Stage | Uses SR status and stage |
| Available Actions | View and Print only |
| Data Storage | Part of Store Requisitions |
| Stage Management | Handled by Store Requisitions module |

### Location Types

| Type | Role in Issue |
|------|---------------|
| Source | INVENTORY (storage location) |
| Destination | DIRECT (expense/consumption location) |

---

## Core Workflows

### 1. View Stock Issues

**Owner**: Store Staff, Department Managers, Finance Staff, Auditors
**Description**: View list of SRs at Issue or Complete stage with DIRECT destinations.

**Features**:
- Filter by source location
- Filter by destination department
- Filter by date range
- Filter by stage (Issue, Complete)
- Search by SR reference number
- View issue details with cost allocation

### 2. Print Issue Slip

**Owner**: Store Staff, Auditors
**Description**: Generate printable issue documentation for handoff or audit records.

**Use Cases**:
- Physical handoff verification
- Audit documentation
- Department expense verification
- Accounting reconciliation support

---

## GL Integration

### Expense Recording

When an SR reaches the Issue stage with a DIRECT destination, the following GL entries are generated:

| Entry | Account | Debit/Credit |
|-------|---------|--------------|
| Expense | Department expense account | Debit |
| Inventory | Source location inventory account | Credit |

### Account Determination

| Factor | Source |
|--------|--------|
| Expense Account | Destination department's default expense account |
| Cost Center | Department's assigned cost center |
| Inventory Account | Source location's inventory account |

### COGS Impact

- Stock Issues directly impact Cost of Goods Sold (COGS)
- Each issue generates a COGS entry for the issuing period
- Total COGS = Sum of (issuedQty x unitCost) for all items

---

## Audit Trail

### Tracked Information

| Field | Description |
|-------|-------------|
| issuedAt | Timestamp when issue was processed |
| issuedBy | User who processed the issue |
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
| Source Location | Inventory location that issued items |
| Destination Location | DIRECT location that received items |
| Department | Department charged for the expense |

---

## Stock Movement Rules

### On Issue (When SR reaches Issue stage)

| Rule | Description |
|------|-------------|
| Source Deduction | Deduct issuedQty from source location stock |
| No Destination Addition | DIRECT locations don't hold inventory |
| Expense Recording | Record as expense to department/cost center |
| COGS Impact | Issue generates Cost of Goods Sold entry |

---

## Costing Rules

| Rule | Description |
|------|-------------|
| Unit Cost | From SR item unitCost |
| Total Value | totalCost = issuedQty x unitCost |
| Department Charge | Cost charged to destination department |
| Immediate Expense | Value expensed immediately on issue |
| Currency | System base currency |

---

## Department and Expense Rules

### Department Assignment

| Rule | Description |
|------|-------------|
| Department Required | DIRECT issues must have department assignment |
| Cost Center | Department determines cost center for expense |
| Budget Tracking | Issues tracked against department budget |

### Expense Account Allocation

| Rule | Description |
|------|-------------|
| Expense Account | Optional expense account for cost allocation |
| Default Account | If not specified, uses department's default |
| Period Tracking | Expenses tracked by accounting period |

---

## Access Control

| Role | Permissions |
|------|-------------|
| Store Staff | View issues for assigned locations, Print |
| Department Manager | View issues for their department, Print |
| Store Manager | View all issues, Print |
| Finance Manager | View all issues with cost details, Print |
| Auditor | View all issues, full audit trail access, Print |

**Note**: Stage management (Issue → Complete) is performed in the Store Requisitions module, not in Stock Issues.

---

## Differences from Stock Transfers

| Aspect | Stock Issue | Stock Transfer |
|--------|-------------|----------------|
| Destination Type | DIRECT (expense) | INVENTORY |
| Stock at Destination | Not tracked (expensed) | Added to inventory |
| Cost Treatment | Immediate expense | Transfer at cost |
| Department | Required | Optional |
| COGS Impact | Yes | No |
| Purpose | Expense verification | Inventory movement tracking |

---

## Related Documentation

### Within Store Operations
- [Store Requisitions](../store-requisitions/INDEX-store-requisitions.md) - Source documents and workflow management
- [Stock Transfers](../stock-transfers/INDEX-stock-transfers.md) - Audit view for inventory movements
- [Wastage Reporting](../wastage-reporting/INDEX-wastage-reporting.md) - Wastage tracking

### Other Modules
- [Inventory Management](../../inventory-management/) - Core inventory functionality
- [Finance](../../finance/) - Cost allocation and expense tracking
- [System Administration > Location Management](../../system-administration/location-management/) - Location setup

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-01-22 | Documentation Team | Corrected to read-only audit view, added GL integration |
| 1.0.0 | 2025-01-22 | Documentation Team | Initial index page created |

---

**Document Control**:
- **Created**: 2025-01-22
- **Author**: Documentation Team
- **Next Review**: 2025-02-22
