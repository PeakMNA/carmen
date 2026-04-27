# Business Requirements: POS Integration

## Module Information
- **Module**: System Administration > System Integrations
- **Sub-Module**: POS Integration
- **Route**: `/system-administration/system-integration/pos`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-18

---

## Overview

POS Integration provides synchronization between Point-of-Sale systems and Carmen ERP for automatic inventory deduction, sales tracking, and consumption analysis. The system supports multi-outlet configurations with outlet-specific pricing, and multiple connector modes (API, file import, webhook) per POS model.

**Architecture**: POS Integration owns sales data ingestion and recipe mappings. At shift close, a scheduled job reads POS transactions, explodes them through recipe mappings, and creates a **Sales Consumption (SC)** document in Store Operations that posts ingredient consumption to the inventory ledger. Menu Engineering reads from SC (read-only analytics consumer) — it does not import data independently.

**UI Structure**: The POS module is organized into three workflow sections:

| Section | Purpose | Frequency |
|---------|---------|-----------|
| **Setup** | Add POS connections (API or file import), configure mappings | Rare |
| **Operate** | Monitor sync health, clear Exception Queue so SC can post | Daily |
| **Audit** | Review raw transaction log and sync events | On demand |

---

## Functional Requirements

### FR-POS-001: Dashboard Monitoring

**Priority**: High
**User Story**: As an F&B Manager, I want to monitor POS system status and key metrics so that I can quickly identify issues requiring attention.

**Requirements**:
- Display POS connection status (connected/disconnected/error)
- Show alert counts: unmapped items, pending approvals, failed transactions, fractional variants
- Display transaction statistics with period filtering
- Show recent transaction activity feed
- Display sync schedule (last sync, next sync, frequency)

**Acceptance Criteria**:
- Status banner updates in real-time
- Alert cards are clickable to navigate to relevant tabs
- Statistics show total transactions, success rate, total value

---

### FR-POS-002: Recipe Mapping

**Priority**: High
**User Story**: As a Purchasing Manager, I want to map POS menu items to recipes so that ingredient deductions occur automatically when items are sold.

**Requirements**:
- Map POS items to Carmen recipes
- Support outlet-specific pricing (same item, different prices per outlet)
- Configure portion size and unit
- Search and filter mappings by outlet, category
- Sync POS items to fetch new menu items
- Activate/deactivate mappings

**Intent**:
- Enable automatic inventory deduction based on sales
- Support multi-outlet operations with different pricing
- Provide visibility into unmapped items

**Acceptance Criteria**:
- Same POS item can have different mappings per outlet
- Unmapped items displayed prominently with quick-map action
- Mapping includes recipe, outlet, portion size, and price

---

### FR-POS-003: Location Mapping

**Priority**: High
**User Story**: As an IT Administrator, I want to link Carmen locations to POS outlets so that transactions route correctly for inventory management.

**Requirements**:
- Map Carmen locations to POS outlets
- Display sync status per location
- Show transaction count per mapped location
- Test connection for individual locations

**Acceptance Criteria**:
- Each Carmen location can be linked to one POS outlet
- Sync status shows: synced, error, pending, not_synced
- Unmapped locations clearly identified

---

### FR-POS-004: Fractional Variants

**Priority**: Medium
**User Story**: As a Head Chef, I want to configure fractional sales (slices, glasses) so that ingredient deductions reflect actual portion consumption.

**Requirements**:
- Define base recipe and total yield
- Configure variant items with deduction percentages
- Set rounding rules (up, down, nearest, exact)
- Add/remove variant items

**Intent**:
- Support fractional sales like pizza slices, cake portions
- Calculate accurate ingredient deductions for partial recipes

**Acceptance Criteria**:
- Variant shows deduction percentage (e.g., 1 slice = 12.5%)
- Rounding rule configurable per variant
- Active/inactive status per variant

---

### FR-POS-005: Transaction Processing

**Priority**: High
**User Story**: As an F&B Manager, I want to review and approve POS transactions so that I can verify inventory impacts before processing.

**Requirements**:
- View transaction history with filtering (status, location, date)
- Approval queue for pending transactions
- Approve/reject individual or bulk transactions
- View transaction line items with mapped recipes
- Retry failed transactions
- Export transaction data

**Intent**:
- Control inventory deduction through approval workflow
- Handle exceptions and failed transactions
- Maintain audit trail

**Acceptance Criteria**:
- Transactions filterable by: all, pending, success, failed, processing
- Bulk approval supports multiple selections
- Rejection requires reason entry

---

### FR-POS-006: Connection Management (Setup → Connections)

**Priority**: High
**User Story**: As an IT Administrator, I want to configure POS connections so that transaction data flows into Carmen correctly for my POS model.

**Requirements**:
- Add a POS connection with a wizard: choose POS model → choose connector mode
- Connector modes per POS model:
  - `api`: REST API with credentials (Square, Toast, Lightspeed)
  - `file_import`: Manual CSV/XML upload (Micros, generic)
  - `webhook`: Push events (Toast, custom)
- Configure sync schedule (5/15/30/60 minutes, or manual)
- Link POS outlet to Carmen location
- Test connection
- Activate/pause/delete connections
- Configure email notifications and SC generation settings per connection

**Acceptance Criteria**:
- Connection wizard only offers modes valid for the selected POS model
- Connection test provides success/failure feedback with error detail
- SC generation can be enabled/disabled per location from this screen

---

### FR-POS-007: Exception Queue (Operate → Exceptions)

**Priority**: High
**User Story**: As an F&B Manager, I want to see which POS sales could not be posted to inventory so I can resolve mapping gaps before the inventory ledger falls behind.

**Requirements**:
- List all exception lines with: POS item name, reason code, sale date, outlet, quantity sold
- Group by reason code for efficient bulk resolution
- Bulk actions: Resolve & Re-post, Reassign Mapping, Defer to Tomorrow, Mark as Non-inventory, Discard with Reason
- Reason codes displayed with human-readable labels (see [BR-sales-consumption.md §7](../../../store-operations/sales-consumption/BR-sales-consumption.md))
- Link to the parent SC document from each exception item
- Auto-resolved exceptions (DUPLICATE_TRANSACTION, TAX_ONLY_ITEM after one-time flag, VOID_AFTER_POST) shown as informational history, not actionable queue items

**Intent**:
- Exception Queue is the gating step for SC completion (Supplemental SCs post when exceptions are resolved)
- Provides daily operational view for resolving mapping gaps

**Acceptance Criteria**:
- Exceptions filterable by reason code, outlet, date, and resolution status
- Resolving an exception triggers re-validation and generates a Supplemental SC if valid
- Bulk-select supports resolving multiple same-reason exceptions at once

---

### FR-POS-008: Analytics & Reports (deprecated — moved to Menu Engineering)

**Priority**: N/A
**Status**: Removed

Analytics (Gross Profit Report, Consumption Analysis, Variance Report) have moved to **Menu Engineering** (`/operational-planning/menu-engineering`). Menu Engineering reads from Sales Consumption documents and POS transaction staging as a pure analytics consumer.

Any existing deep links to POS reports redirect to `/operational-planning/menu-engineering`.

---

## Sales Consumption Handoff

After shift close, the POS module hands off to Store Operations via the SC document:

```
POS transactions (staging)
    -> [shift-close job]
    -> Sales Consumption document (store-operations/sales-consumption/)
        -> posted lines -> inventory ledger (SALES_CONSUMPTION transactions)
        -> exception lines -> Exception Queue (POS Operate -> Exceptions)
    -> [exception resolved]
    -> Supplemental SC (linked to parent)
```

The SC document is the audit record owned by Store Operations. POS owns only the pipeline up to and including the Exception Queue.

---

## User Personas

| Persona | Role | Primary Use Cases |
|---------|------|-------------------|
| F&B Manager | Daily operations | Operate → Sync Health, Exception Queue |
| Purchasing Manager / POS Admin | Configure mappings | Setup → Connections, Setup → Mappings |
| Head Chef | Configure fractional variants | Setup → Mappings → Fractional |
| IT Administrator | Connection setup | Setup → Connections |
| Financial Controller | Analyze profitability | Menu Engineering (analytics consumer) |

---

## Data Sources

| Source | Type | Description |
|--------|------|-------------|
| POS System (Comanche) | External API | Transaction data, menu items |
| Carmen Recipes | Internal | Recipe definitions for mapping |
| Carmen Locations | Internal | Location data for outlet mapping |
| Inventory | Internal | Stock levels for deduction |

---

**Document End**
