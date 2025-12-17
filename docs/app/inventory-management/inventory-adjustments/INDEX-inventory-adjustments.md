# Inventory Adjustments Documentation

**Module**: Inventory Management
**Sub-Module**: Inventory Adjustments
**Status**: IMPLEMENTED (Prototype with Mock Data)
**Version**: 2.3.0
**Last Updated**: 2025-12-17

---

## Quick Links

| Document | Description | Status |
|----------|-------------|--------|
| [Business Requirements](./BR-inventory-adjustments.md) | Business rules, workflows, and functional requirements | ✅ Complete |
| [Use Cases](./UC-inventory-adjustments.md) | User workflows and actor interactions | ✅ Complete |
| [Technical Specification](./TS-inventory-adjustments.md) | System architecture and implementation details | ✅ Complete |
| [Data Definition](./DD-inventory-adjustments.md) | TypeScript interfaces and data structures | ✅ Complete |
| [Flow Diagrams](./FD-inventory-adjustments.md) | Visual workflow diagrams (Mermaid) | ✅ Complete |
| [Validations](./VAL-inventory-adjustments.md) | Validation rules and Zod schemas | ✅ Complete |

---

## Overview

The **Inventory Adjustments** module enables hotel staff to record and manage inventory quantity corrections, physical count variances, damaged goods, and other stock adjustments across hotel locations. This module provides a complete audit trail of all stock modifications outside the normal purchase/consumption flow.

**Key Capabilities**:
- ✅ **Dual Adjustment Types**: Support for both IN (increases) and OUT (decreases) adjustments
- ✅ **Two-Level Category/Reason Classification**: Header-level Category with GL mapping, item-level Reason filtered by Category
- ✅ **Consolidated List View**: Single list with Stock-in/Stock-out create buttons in header (tabs removed)
- ✅ **Lot-Based Tracking**: FIFO cost layer selection for OUT adjustments
- ✅ **Multi-Location Support**: Adjustments at warehouse, store, and department levels
- ✅ **Financial Integration**: Automatic journal entry generation on posting (Category-based GL mapping)
- ✅ **Approval Workflow**: Draft → Posted → Voided status transitions
- ✅ **Comprehensive Audit Trail**: Full activity logging with user and timestamp tracking
- ✅ **Costing Rules**: Stock OUT uses system avg cost (auto), Stock IN requires manual entry

---

## Implementation Status

**Current State**: IMPLEMENTED - Prototype Complete with Mock Data

**What EXISTS**:
- ✅ Main list page (`page.tsx`) - Filtering, sorting, search
- ✅ Detail page (`[id]/page.tsx`) - Tabbed view (Items, Journal, Activity)
- ✅ Create form (`new/page.tsx`) - Multi-step adjustment creation
- ✅ Edit form (`[id]/edit/page.tsx`) - Draft adjustment modification
- ✅ TypeScript types - Complete type definitions
- ✅ Mock data layer - Sample adjustments and helper functions

**What's PENDING (Future Implementation)**:
- ❌ Database integration (Prisma/PostgreSQL)
- ❌ Server actions for data mutations
- ❌ Real-time inventory posting
- ❌ Approval workflow for high-value adjustments
- ❌ Export functionality (CSV/Excel)
- ❌ Barcode scanner integration
- ❌ Batch adjustment import

---

## Business Context

### Problem Statement
Inventory discrepancies occur regularly in hospitality operations:
- **Physical Count Variances**: Differences between system quantities and actual counts
- **Damaged/Expired Goods**: Products that cannot be sold or used
- **Theft/Loss**: Missing inventory requiring write-off
- **System Errors**: Data entry mistakes requiring correction
- **Inter-location Transfers**: Stock movements between locations not captured by standard processes

### Solution Benefits
- **Accuracy**: Maintain accurate inventory quantities across all locations
- **Accountability**: Complete audit trail with reason codes and approvals
- **Financial Control**: Automatic cost impact calculation and journal entries
- **Compliance**: Documentation for auditors and regulatory requirements
- **Visibility**: Real-time view of all inventory corrections

---

## Core Workflows

### 1. Create Inventory Adjustment
**Owner**: Storekeepers, Inventory Coordinators
**Route**: `/inventory-management/inventory-adjustments/new`

**Required Fields**:
| Field | Required | Description |
|-------|----------|-------------|
| Date | Yes | Adjustment date |
| Location | Yes | Target location for adjustment |
| Department | No | Specific department (optional) |
| Type | Yes | IN (increase) or OUT (decrease) |
| Reason | Yes | Categorization for reporting |
| Description | No | Additional notes |

**Item Entry**:
| Field | IN Type | OUT Type |
|-------|---------|----------|
| Product | Required | Required |
| Quantity | Required | Required |
| Unit | Auto-populated | Auto-populated |
| Unit Cost | Manual entry | From FIFO layer |
| Lot Number | Auto-generated | Selected from available |
| Total Cost | Auto-calculated | Auto-calculated |

[→ View Detailed Workflow](./UC-inventory-adjustments.md)

---

### 2. Post Adjustment
**Owner**: Inventory Coordinators, Supervisors
**Route**: `/inventory-management/inventory-adjustments/[id]`

**Posting Process**:
1. Review all adjustment items
2. Verify quantities and costs
3. Click "Post" action button
4. System validates all entries
5. Journal entries generated automatically
6. Inventory quantities updated
7. Status changes to "Posted"
8. Adjustment becomes read-only

**Journal Entry Structure**:
- **IN Adjustments**:
  - Debit: Inventory Asset account
  - Credit: Adjustment Gain account
- **OUT Adjustments**:
  - Debit: Adjustment Loss account (or COGS for damage)
  - Credit: Inventory Asset account

[→ View Journal Entry Details](./FD-inventory-adjustments.md#journal-entry-flow)

---

### 3. Void Adjustment
**Owner**: Supervisors, Finance Controllers
**Route**: `/inventory-management/inventory-adjustments/[id]`

**Void Process**:
1. Navigate to posted adjustment
2. Click "Void" action button
3. Enter void reason (required)
4. Confirm void action
5. System generates reversing journal entries
6. Inventory quantities reversed
7. Status changes to "Voided"
8. Original data preserved for audit

**Business Rules**:
- Only Posted adjustments can be voided
- Void reason is mandatory
- All journal entries are reversed
- Voided adjustments are read-only
- Cannot void adjustments from closed periods

[→ View Status Transitions](./FD-inventory-adjustments.md#status-transitions)

---

## Data Model

### Core Entities

**InventoryAdjustment**: Main adjustment header
- Identification: id, adjustmentNumber (ADJ-YYMM-NNNN), status, type
- Location: locationId, locationName, departmentId, departmentName
- Details: adjustmentDate, reason, description
- Totals: itemCount, totalValue, currency
- Audit: createdBy, createdAt, postedBy, postedAt, voidedBy, voidedAt, voidReason

**AdjustmentItem**: Individual product line items
- Identification: id, adjustmentId, lineNumber
- Product: productId, productCode, productName, category, unit
- Quantities: quantity, unitCost, totalCost
- Lot Tracking: lotNumber, expiryDate (for OUT type)
- Notes: itemNotes

**AdjustmentJournalEntry**: Generated journal entries
- Header: journalId, adjustmentId, postingDate
- Lines: accountCode, accountName, debit, credit, costCenter

[→ View Complete Schema](./DD-inventory-adjustments.md)

---

## Type Definitions

```typescript
// Adjustment Types
type AdjustmentType = 'IN' | 'OUT';

// Adjustment Status
type AdjustmentStatus = 'draft' | 'posted' | 'voided';

// Reason Categories
type AdjustmentReason =
  | 'physical-count'
  | 'damaged-expired'
  | 'theft-loss'
  | 'system-reconciliation'
  | 'inter-location-transfer'
  | 'other';

// Adjustment Number Format
// ADJ-YYMM-NNNN (e.g., ADJ-2412-0001)
```

---

## File Structure

```
app/(main)/inventory-management/inventory-adjustments/
├── page.tsx                    # Main list page
├── types.ts                    # TypeScript type definitions
├── new/
│   └── page.tsx               # Create adjustment form
├── [id]/
│   ├── page.tsx               # Detail view with tabs
│   └── edit/
│       └── page.tsx           # Edit draft adjustment
└── components/
    ├── inventory-adjustment-list.tsx
    ├── adjustment-form.tsx
    └── adjustment-detail-tabs.tsx
```

---

## Validation Rules

### Form Validations
- **Adjustment Date**: Required, cannot be future date, must be in open period
- **Location**: Required, must be valid active location
- **Type**: Required, must be 'IN' or 'OUT'
- **Reason**: Required, must be valid reason code
- **At least one item**: Adjustment must have minimum 1 line item

### Item Validations
- **Product**: Required, must be valid active product
- **Quantity**: Required, must be positive number
- **Unit Cost**: Required for IN type, auto-populated for OUT type
- **Lot Selection**: Required for OUT type when lot tracking enabled

### Business Rules
- Draft adjustments can be edited or deleted
- Posted adjustments can only be voided
- Voided adjustments are final (no further changes)
- Total value must match sum of line items
- OUT quantity cannot exceed available stock

[→ View Complete Validation Rules](./VAL-inventory-adjustments.md)

---

## Security & Permissions

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Storekeeper** | Create adjustments, view own location adjustments |
| **Inventory Coordinator** | All storekeeper permissions, edit/delete drafts, view all locations |
| **Supervisor** | All coordinator permissions, post adjustments, void adjustments |
| **Finance Controller** | Full access, configure accounts, view all journals |
| **Auditor** | Read-only access to all adjustments and journals |

---

## Related Documentation

### Within Inventory Management
- [Stock Overview](../stock-overview/) - Current stock levels and reports
- [Spot Check](../spot-check/) - Quick inventory verification
- [Period End](../period-end/) - Period close and valuation
- [Lot-Based Costing](../lot-based-costing/) - FIFO and cost layer management

### Shared Methods
- [SM: Costing Methods](../../shared-methods/inventory-valuation/SM-costing-methods.md) - Core transaction system, FIFO logic
- [SM: Period-End Snapshots](../../shared-methods/inventory-valuation/SM-period-end-snapshots.md) - Period management

### Other Modules
- [Product Management](../../product-management/) - Product catalog
- [Location Management](../../system-administration/location-management/) - Location setup
- [Finance](../../finance/) - Account code mapping

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

**Document Control**:
- **Created**: 2025-12-10
- **Author**: Development Team
- **Status**: Active
- **Next Review**: 2026-01-10

---

> **Note**: This is the central navigation hub for Inventory Adjustments documentation. Select a document from the Quick Links table above to dive into specific details.
