# Data Definition: Periodic Average Costing

## Module Information
- **Module**: Inventory Management
- **Sub-module**: Periodic Average Costing
- **Version**: 1.0.0
- **Status**: Active
- **Last Updated**: 2025-11-15

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-15 | Documentation Team | Initial DD document created from PROCESS document |

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**

This document describes data structures, entities, relationships, and constraints in TEXT FORMAT.
It does NOT contain executable SQL code, database scripts, or implementation code.
For database implementation details, refer to the Technical Specification document.

**⚠️ SCHEMA COVERAGE**: 20% - Uses existing inventory tables, requires supporting tables

**Existing Tables**: `tb_inventory_transaction_cost_layer` (reused with different pattern)
**Missing Tables**: Period management, average cost cache, period close audit - **Require Implementation**

---

## Overview

Periodic Average is an inventory costing method that calculates a **single average unit cost per period** (calendar month) and applies it uniformly to all transactions within that period. Unlike FIFO which tracks individual lots, Periodic Average treats all inventory homogeneously and costs all transactions at the period's average cost.

### Key Features
- Monthly period-based costing
- No lot tracking required
- Simplified cost calculation
- Period-end processing
- Cached average costs
- Credit note handling
- Partial availability support
- GL integration

### Key Difference from FIFO
- **FIFO**: Tracks individual lots with specific costs, consumes oldest first
- **Periodic Average**: No lot tracking, all transactions use same average cost per period

---

## Entity Relationship Overview

```
tb_costing_period (1) ──── (N) tb_period_average_cost_cache
tb_product (1) ──── (N) tb_period_average_cost_cache
tb_location (1) ──── (N) tb_period_average_cost_cache
tb_costing_period (1) ──── (N) tb_period_close_log
tb_inventory_transaction_cost_layer ──── Uses period average cost
```

---

## Core Concepts

### Period Definition

**Period = Calendar Month (Fixed)**

```typescript
interface Period {
  year: number;        // e.g., 2025
  month: number;       // 1-12
  start_date: Date;    // 1st day at 00:00:00
  end_date: Date;      // Last day at 23:59:59
  status: 'open' | 'closed';
}

// Example: January 2025
{
  year: 2025,
  month: 1,
  start_date: "2025-01-01T00:00:00",
  end_date: "2025-01-31T23:59:59",
  status: "open"
}
```

### Average Cost Calculation

```
Period Average Cost = Total Cost of All Receipts ÷ Total Quantity of All Receipts

Formula:
  Avg Cost = Σ(Receipt Qty × Receipt Unit Cost) ÷ Σ(Receipt Qty)

Example:
  Receipt 1: 100 kg @ $10.00 = $1,000.00
  Receipt 2: 150 kg @ $12.50 = $1,875.00
  Receipt 3:  80 kg @ $11.00 = $880.00

  Total: 330 kg, $3,755.00
  Average: $3,755.00 ÷ 330 = $11.3788/kg

  ✅ All transactions in January use $11.3788/kg
```

---

## Existing Table Usage

### Inventory Transaction Cost Layer (tb_inventory_transaction_cost_layer)

**Source**: Existing table (used differently than FIFO)

**Purpose**: Records inventory transactions with periodic average costing pattern.

**Pattern Recognition**:

| Field | FIFO Pattern | Periodic Average Pattern |
|-------|--------------|--------------------------|
| `lot_no` | Unique lot identifier | **NULL** (no lot tracking) |
| `parent_lot_no` | Parent lot reference | **NULL** (no hierarchy) |
| `cost_per_unit` | Specific lot cost | **Period average cost** |
| `in_qty` | Receipt quantity | Receipt quantity (>0) or 0 |
| `out_qty` | Consumption quantity | 0 or consumption quantity (>0) |

**Key Difference**: No lot tracking fields used, all transactions in same period/product/location use identical `cost_per_unit`.

**Business Rules**:
1. **Receipt Transactions**: `lot_no = NULL`, `in_qty > 0`, `cost_per_unit` set at period-end
2. **Consumption Transactions**: `lot_no = NULL`, `out_qty > 0`, `cost_per_unit` uses period average
3. **Period Consistency**: All transactions in same period use same average cost
4. **Cost Application**: Costs applied retroactively after period average calculated

---

## ⚠️ Missing Tables (Required for Implementation)

### 1. Costing Periods (PROPOSED)

**Status**: ❌ NOT IN SCHEMA - Requires Implementation

**Purpose**: Track costing periods (monthly) with open/closed status and period-end processing.

**Proposed Table Name**: `tb_costing_period`

#### Proposed Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `year` | INTEGER | NOT NULL | Period year (e.g., 2025) |
| `month` | INTEGER | NOT NULL, CHECK (month BETWEEN 1 AND 12) | Period month (1-12) |
| `start_date` | DATE | NOT NULL | First day of month |
| `end_date` | DATE | NOT NULL | Last day of month |
| `status` | ENUM | NOT NULL, DEFAULT 'open' | Period status |
| `closed_date` | TIMESTAMPTZ | | Date period was closed |
| `closed_by_id` | UUID | | User who closed period |
| `total_products_processed` | INTEGER | DEFAULT 0 | Products in period |
| `total_locations_processed` | INTEGER | DEFAULT 0 | Locations in period |
| `processing_duration_seconds` | INTEGER | | Time to close period |
| `description` | VARCHAR | | Period description |
| `note` | VARCHAR | | Internal notes |
| `info` | JSON | | Additional metadata |
| `dimension` | JSON | | Multi-dimensional attributes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Proposed Enums

**enum_costing_period_status**:
- `open`: Period active, transactions allowed, costs not final
- `closing`: Period end processing in progress
- `closed`: Period finalized, costs locked, no new transactions
- `reopened`: Previously closed period reopened for adjustment

#### Proposed Relationships
- **tb_period_average_cost_cache**: One-to-Many (period has cached costs for multiple products/locations)
- **tb_period_close_log**: One-to-Many (period has close processing logs)

#### Proposed Business Rules
1. **Uniqueness**: Only one period per year-month combination
2. **Sequential Closing**: Cannot close current period if previous period is open
3. **Transaction Restriction**: No new transactions in closed periods (except adjustments)
4. **Auto-Creation**: Periods auto-created when first transaction occurs
5. **Status Workflow**: open → closing → closed (or closed → reopened)

#### Proposed Indexes
```
CREATE UNIQUE INDEX idx_costing_period_year_month
  ON tb_costing_period(year, month)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_costing_period_status
  ON tb_costing_period(status);
```

#### Proposed JSON Structure (info field)
```json
{
  "auto_created": true,
  "first_transaction_date": "2025-01-05T10:30:00Z",
  "last_transaction_date": "2025-01-29T16:45:00Z",
  "close_initiated_at": "2025-02-01T09:00:00Z",
  "close_completed_at": "2025-02-01T09:15:00Z",
  "statistics": {
    "total_receipts": 45,
    "total_consumptions": 32,
    "total_adjustments": 3,
    "total_credit_notes": 2
  },
  "validation_results": {
    "negative_inventory_warnings": 0,
    "cost_variance_warnings": 2,
    "missing_receipt_costs": 0
  }
}
```

**Implementation Priority**: CRITICAL (Required for basic functionality)
**Estimated Effort**: 4-5 hours

---

### 2. Period Average Cost Cache (PROPOSED)

**Status**: ❌ NOT IN SCHEMA - Requires Implementation

**Purpose**: Cache calculated average costs per product/location/period for performance and auditability.

**Proposed Table Name**: `tb_period_average_cost_cache`

#### Proposed Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `costing_period_id` | UUID | FOREIGN KEY → tb_costing_period.id, NOT NULL | Period reference |
| `product_id` | UUID | FOREIGN KEY → tb_product.id, NOT NULL | Product reference |
| `location_id` | UUID | FOREIGN KEY → tb_location.id, NOT NULL | Location reference |
| `unit_id` | UUID | FOREIGN KEY → tb_unit.id | Base unit |
| `opening_balance_qty` | DECIMAL(20,5) | DEFAULT 0 | Qty at period start |
| `opening_balance_value` | DECIMAL(20,5) | DEFAULT 0 | Value at period start |
| `total_receipt_qty` | DECIMAL(20,5) | DEFAULT 0 | Total received in period |
| `total_receipt_value` | DECIMAL(20,5) | DEFAULT 0 | Total receipt cost |
| `total_consumption_qty` | DECIMAL(20,5) | DEFAULT 0 | Total consumed in period |
| `total_adjustment_qty` | DECIMAL(20,5) | DEFAULT 0 | Net adjustments |
| `closing_balance_qty` | DECIMAL(20,5) | DEFAULT 0 | Qty at period end |
| `average_cost_per_unit` | DECIMAL(20,5) | NOT NULL | Calculated average cost |
| `calculation_method` | VARCHAR | DEFAULT 'weighted_average' | Calculation algorithm used |
| `calculated_at` | TIMESTAMPTZ | DEFAULT now() | Calculation timestamp |
| `calculated_by_id` | UUID | | User/system who calculated |
| `is_finalized` | BOOLEAN | DEFAULT FALSE | Locked after period close |
| `description` | VARCHAR | | Cache description |
| `note` | VARCHAR | | Internal notes |
| `info` | JSON | | Calculation details |
| `dimension` | JSON | | Multi-dimensional attributes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Proposed Relationships
- **tb_costing_period**: Many-to-One (cache entries belong to period)
- **tb_product**: Many-to-One (cache per product)
- **tb_location**: Many-to-One (cache per location)
- **tb_unit**: Many-to-One (base unit reference)

#### Proposed Business Rules
1. **Uniqueness**: One cache entry per period-product-location combination
2. **Calculation Formula**:
   ```
   average_cost_per_unit = (opening_balance_value + total_receipt_value)
                         ÷ (opening_balance_qty + total_receipt_qty)
   ```
3. **Zero Receipts**: If no receipts in period, use previous period's average
4. **Finalization**: Cannot modify after `is_finalized = TRUE`
5. **Validation**: `closing_balance_qty = opening + receipts + adjustments - consumption`

#### Proposed Indexes
```
CREATE UNIQUE INDEX idx_period_avg_cost_period_product_location
  ON tb_period_average_cost_cache(costing_period_id, product_id, location_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_period_avg_cost_product
  ON tb_period_average_cost_cache(product_id);

CREATE INDEX idx_period_avg_cost_location
  ON tb_period_average_cost_cache(location_id);
```

#### Proposed JSON Structure (info field)
```json
{
  "calculation_details": {
    "formula": "weighted_average",
    "opening_qty": 250.00,
    "opening_value": 2500.00,
    "receipt_count": 5,
    "receipt_breakdown": [
      {'qty': 100, 'cost': 10.00, 'value': 1000.00},
      {'qty': 150, 'cost': 12.50, 'value': 1875.00},
      {'qty': 80, 'cost': 11.00, 'value': 880.00}
    ],
    "total_available_qty": 580.00,
    "total_available_value": 6255.00,
    "calculated_average": 10.7845
  },
  "variance_analysis": {
    "vs_previous_period": -2.5,
    "vs_standard_cost": 5.2,
    "variance_explanation": "Lower receipt costs"
  },
  "transactions_applied": {
    "count": 32,
    "total_costed_qty": 330.00,
    "total_costed_value": 3558.89
  }
}
```

**Implementation Priority**: CRITICAL (Required for performance)
**Estimated Effort**: 5-6 hours

---

### 3. Period Close Processing Log (PROPOSED)

**Status**: ❌ NOT IN SCHEMA - Requires Implementation

**Purpose**: Audit trail of period close processing, tracking calculation steps and data validation.

**Proposed Table Name**: `tb_period_close_log`

#### Proposed Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `costing_period_id` | UUID | FOREIGN KEY → tb_costing_period.id, NOT NULL | Period being closed |
| `process_step` | VARCHAR | NOT NULL | Close process step identifier |
| `step_sequence` | INTEGER | NOT NULL | Order of execution |
| `start_time` | TIMESTAMPTZ | NOT NULL | Step start timestamp |
| `end_time` | TIMESTAMPTZ | | Step completion timestamp |
| `duration_seconds` | INTEGER | | Processing duration |
| `status` | ENUM | NOT NULL | Step status |
| `records_processed` | INTEGER | DEFAULT 0 | Records processed in step |
| `records_succeeded` | INTEGER | DEFAULT 0 | Successfully processed |
| `records_failed` | INTEGER | DEFAULT 0 | Failed processing |
| `error_message` | TEXT | | Error details if failed |
| `warnings` | JSON | | Warning messages array |
| `description` | VARCHAR | | Step description |
| `note` | VARCHAR | | Internal notes |
| `info` | JSON | | Detailed processing metadata |
| `dimension` | JSON | | Multi-dimensional attributes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |

#### Proposed Enums

**enum_period_close_step_status**:
- `pending`: Step not started
- `running`: Step in progress
- `completed`: Step completed successfully
- `failed`: Step encountered error
- `skipped`: Step skipped (conditions not met)

#### Standard Process Steps
1. `validate_transactions`: Validate all transactions in period
2. `calculate_averages`: Calculate average costs per product/location
3. `apply_costs_receipts`: Apply average cost to receipt transactions
4. `apply_costs_consumptions`: Apply average cost to consumption transactions
5. `apply_costs_adjustments`: Apply average cost to adjustment transactions
6. `validate_balances`: Validate closing balances
7. `update_gl_accounts`: Update general ledger postings
8. `finalize_period`: Lock period and cache

#### Proposed Relationships
- **tb_costing_period**: Many-to-One (log entries belong to period close)

#### Proposed Business Rules
1. **Sequential Processing**: Steps execute in `step_sequence` order
2. **Error Handling**: If step fails, entire close process rolls back
3. **Audit Trail**: All steps logged regardless of success/failure
4. **Reprocessing**: Failed close can be retried, creating new log entries

#### Proposed Indexes
```
CREATE INDEX idx_period_close_log_period
  ON tb_period_close_log(costing_period_id, step_sequence);

CREATE INDEX idx_period_close_log_status
  ON tb_period_close_log(status);
```

#### Proposed JSON Structure (info field)
```json
{
  "sql_query": "UPDATE tb_inventory_transaction_cost_layer SET ...",
  "parameters": {
    "period_id": "uuid",
    "average_cost": 10.7845
  },
  "affected_tables": ['tb_inventory_transaction_cost_layer', 'tb_period_average_cost_cache'],
  "batch_details": {
    "batch_size": 1000,
    "batches_completed": 5,
    "total_batches": 5
  },
  "performance_metrics": {
    "avg_records_per_second": 250,
    "peak_memory_mb": 128,
    "cpu_usage_percent": 45
  }
}
```

**warnings array example**:
```json
[
  {
    "code": "WARN-001",
    "message": "Product ABC has no receipts in period, using previous average",
    "product_id": "uuid",
    "severity": "low"
  },
  {
    "code": "WARN-002",
    "message": "Negative inventory detected for Product XYZ",
    "product_id": "uuid",
    "quantity": -15.50,
    "severity": "high"
  }
]
```

**Implementation Priority**: HIGH (Required for audit/compliance)
**Estimated Effort**: 4-5 hours

---

## Data Validation Rules

### Period Management

1. **VAL-PAC-001**: Period uniqueness
   - Rule: Only one period per year-month
   - Error: "Period already exists for this month"

2. **VAL-PAC-002**: Period date consistency
   - Rule: `end_date > start_date` AND both in same month
   - Error: "Period dates must span single calendar month"

3. **VAL-PAC-003**: Sequential closing
   - Rule: Cannot close period N if period N-1 is open
   - Error: "Previous period must be closed first"

4. **VAL-PAC-004**: Transaction date validation
   - Rule: Transaction date must fall within period dates
   - Error: "Transaction date outside period range"

### Average Cost Calculation

5. **VAL-PAC-101**: Receipt requirement
   - Rule: Cannot calculate average with zero total receipts
   - Action: Use previous period average or standard cost
   - Warning: "No receipts in period, using fallback cost"

6. **VAL-PAC-102**: Calculation formula
   - Rule: `avg = total_receipt_value ÷ total_receipt_qty`
   - Validation: Result must be >= 0
   - Error: "Invalid average cost calculated"

7. **VAL-PAC-103**: Balance reconciliation
   - Rule: `closing = opening + receipts + adjustments - consumption`
   - Tolerance: ±0.001 for rounding
   - Error: "Balance mismatch detected"

### Cost Application

8. **VAL-PAC-201**: Cost consistency
   - Rule: All transactions in same period/product/location use identical cost
   - Error: "Inconsistent costs detected in period"

9. **VAL-PAC-202**: Finalization lock
   - Rule: Cannot modify finalized cache entries
   - Error: "Period is finalized, cannot update costs"

---

## Integration Points

### 1. Inventory Transactions
- **Direction**: Bidirectional
- **Purpose**: Record transactions, apply periodic average costs
- **Key Table**: tb_inventory_transaction_cost_layer
- **Pattern**: lot_no = NULL, cost_per_unit = period average

### 2. Good Received Notes (GRN)
- **Direction**: Inbound
- **Purpose**: Receipt transactions contribute to period average
- **Process**: GRN commitment creates cost layer records with receipt cost

### 3. Credit Notes
- **Direction**: Inbound
- **Purpose**: Returns reduce inventory at period average cost
- **Special Handling**: QUANTITY_RETURN vs AMOUNT_DISCOUNT types

### 4. Stock Adjustments
- **Direction**: Inbound
- **Purpose**: Adjustments use period average cost
- **Process**: Positive/negative adjustments costed at period average

### 5. General Ledger (GL)
- **Direction**: Outbound
- **Purpose**: Period-end GL postings for cost of goods sold
- **Process**: Aggregate consumption value = qty × period average cost

### 6. Inventory Valuation Reports
- **Direction**: Outbound
- **Purpose**: Inventory value = balance × period average cost
- **Timing**: Real-time using current/previous period average

---

## Period Close Process Workflow

### Standard Close Sequence

```
1. VALIDATE_TRANSACTIONS
   ↓
2. CALCULATE_AVERAGES
   ↓
3. APPLY_COSTS_RECEIPTS
   ↓
4. APPLY_COSTS_CONSUMPTIONS
   ↓
5. APPLY_COSTS_ADJUSTMENTS
   ↓
6. VALIDATE_BALANCES
   ↓
7. UPDATE_GL_ACCOUNTS
   ↓
8. FINALIZE_PERIOD
```

### Close Process Steps Detail

**Step 1: Validate Transactions**
- Check all transactions have required data
- Identify missing costs or quantities
- Flag negative inventory situations
- Generate validation report

**Step 2: Calculate Averages**
- For each product-location combination:
  - Sum total receipt quantities
  - Sum total receipt values
  - Calculate weighted average
  - Store in cache table
- Handle zero-receipt scenarios

**Step 3-5: Apply Costs**
- Update cost_per_unit in tb_inventory_transaction_cost_layer
- Where lot_no IS NULL (periodic average pattern)
- Set to calculated average from cache

**Step 6: Validate Balances**
- Recalculate closing balances
- Compare to expected values
- Flag discrepancies

**Step 7: Update GL**
- Calculate total COGS for period
- Generate GL journal entries
- Post to accounting system

**Step 8: Finalize**
- Set period status = 'closed'
- Set cache is_finalized = TRUE
- Lock all period data

---

## Performance Considerations

### Indexing Strategy
1. **Period Lookup**: Unique index on (year, month)
2. **Cache Lookup**: Unique index on (period_id, product_id, location_id)
3. **Transaction Queries**: Index on transaction_date for period filtering
4. **Close Log**: Index on (period_id, step_sequence)

### Caching Strategy
- **Pre-calculate** period averages during close process
- **Cache** averages in tb_period_average_cost_cache
- **Reuse** cached values for queries and reports
- **Invalidate** cache only when period reopened

### Batch Processing
- Process period close in batches (e.g., 1000 records at a time)
- Use database transactions for atomicity
- Implement progress tracking
- Allow cancellation and retry

---

## Migration Notes

### Current Implementation
- **Date**: 2025-11-15
- **Schema Source**: PROCESS-periodic-average-costing.md
- **Coverage**: ⚠️ 20% - Uses existing inventory transaction table
- **Existing**: tb_inventory_transaction_cost_layer (different pattern)
- **Missing**: Period management, cache, close log tables

### Implementation Roadmap

**Phase 1 (MVP)**: Basic Functionality
- Implement tb_costing_period table
- Implement tb_period_average_cost_cache table
- Basic period close process
- Manual average cost calculation

**Phase 2**: Automation & Audit
- Implement tb_period_close_log table
- Automated period close scheduling
- Validation and error handling
- Email notifications

**Phase 3**: Optimization
- Batch processing optimization
- Cache performance tuning
- Reporting enhancements
- API for external systems

---

## Document Metadata

**Created**: 2025-11-15
**Source**: PROCESS-periodic-average-costing.md
**Coverage**: 1 existing table (reused) + 3 proposed tables
**Status**: Active - Tables require implementation
**Implementation Priority**: CRITICAL (Core inventory costing method)
**Total Estimated Effort**: 13-16 hours

---

**End of Data Definition Document**
