# Business Requirements: POS Integration

## Module Information
- **Module**: System Administration > System Integrations
- **Sub-Module**: POS Integration
- **Route**: `/system-administration/system-integration/pos`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-18

---

## Overview

POS Integration provides real-time synchronization between Point-of-Sale systems (Comanche POS) and Carmen ERP for automatic inventory deduction, sales tracking, and consumption analysis. The system supports multi-outlet configurations with outlet-specific pricing.

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

### FR-POS-006: Configuration Management

**Priority**: High
**User Story**: As an IT Administrator, I want to configure POS integration settings so that transaction processing matches our operational requirements.

**Requirements**:
- Configure POS system type and API endpoint
- Set sync frequency (5/15/30/60 minutes)
- Choose processing mode: automatic, approval, manual
- Set auto-approve threshold for approval mode
- Configure email notifications and recipients
- Set data retention period
- Test connection
- Reset configuration

**Intent**:
- Customize integration to match business processes
- Control automatic vs manual processing
- Ensure proper notification of issues

**Acceptance Criteria**:
- Connection test provides success/failure feedback
- Unsaved changes alert prevents data loss
- Reset requires confirmation

---

### FR-POS-007: Analytics & Reports

**Priority**: Medium
**User Story**: As a Financial Controller, I want to analyze POS data so that I can track gross profit margins and identify consumption variances.

**Requirements**:
- Gross Profit Report: revenue, COGS, margin by category
- Consumption Analysis: theoretical vs actual usage
- Variance Report: cost impact of variances
- Period filtering (7d, 30d, 90d, YTD)
- Export reports (CSV, PDF, Excel)

**Intent**:
- Monitor F&B profitability
- Identify ingredient waste or theft
- Support cost control decisions

**Acceptance Criteria**:
- Gross profit shows margin percentage with color coding
- Variance report shows top variance items by cost impact
- Variance status: Normal (<=3%), Review (3-10%), Critical (>10%)

---

## User Personas

| Persona | Role | Primary Use Cases |
|---------|------|-------------------|
| F&B Manager | Monitor and approve | Dashboard, Transactions, Reports |
| Purchasing Manager | Configure mappings | Recipe Mapping, Location Mapping |
| Head Chef | Review consumption | Reports, Fractional Variants |
| IT Administrator | System configuration | Configuration, Connection Testing |
| Financial Controller | Analyze profitability | Reports, Variance Analysis |

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
