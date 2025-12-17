# DS-LOT: Lot-Based Costing Data Definition

**Document Version**: 1.0
**Last Updated**: 2025-11-07
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Module**: Inventory Management
**Feature**: Lot-Based Costing with Automatic Lot Creation

---

## Document Overview

This document provides comprehensive data schema documentation for the lot-based costing system. It includes entity-relationship diagrams, table structures, constraints, indexes, and data dictionaries.

**Related Documents**:
- [BR-LOT: Business Requirements](./BR-lot-based-costing.md)
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |

- [UC-LOT: Use Cases](./UC-lot-based-costing.md)
- [TS-LOT: Technical Specification](./TS-lot-based-costing.md)

---

## Entity-Relationship Diagram

```
┌─────────────────────────────────────┐
│       tb_product                    │
│─────────────────────────────────────│
│ • id (PK)                           │
│ • product_code                      │
│ • product_name                      │
│ • category_id (FK)                  │
│ • costing_method (FIFO/PERIODIC)    │
│ • is_active                         │
└────────────┬────────────────────────┘
             │
             │ 1:N
             │
┌────────────▼────────────────────────────────────────┐
│  tb_inventory_transaction_detail                    │
│─────────────────────────────────────────────────────│
│ • id (PK)                                           │
│ • transaction_id                                    │
│ • transaction_type (enum)                           │
│ • transaction_date                                  │
│ • product_id (FK) ──────┐                          │
│ • location_id (FK) ──┐  │                          │
│ • quantity            │  │                          │
│ • unit_cost           │  │                          │
│ • reference_document  │  │                          │
└───────────┬───────────┘  │  │                       │
            │              │  │                       │
            │ 1:N          │  │                       │
            │              │  │                       │
┌───────────▼──────────────┼──┼───────────────────────┐
│  tb_inventory_transaction_cost_layer                │
│─────────────────────────────────────────────────────│
│ • id (PK)                                           │
│ • inventory_transaction_detail_id (FK)              │
│ • lot_no (UK1)             ◄──── Generated         │
│ • lot_index (UK1)          ◄──── Auto-increment    │
│ • parent_lot_no (FK)       ◄──── Self-reference    │
│ • location_id (FK) ────────┘  │                    │
│ • location_code                │                    │
│ • lot_at_date                  │                    │
│ • lot_seq_no (1-9999)          │                    │
│ • product_id (FK) ─────────────┘                    │
│ • transaction_type                                  │
│ • in_qty (LOT: >0, ADJ: 0)                         │
│ • out_qty (LOT: 0, ADJ: >0)                        │
│ • cost_per_unit                                     │
│ • total_cost                                        │
│ • created_at, updated_at                            │
│ • created_by, updated_by                            │
└──────────┬──────────────────────────────────────────┘
           │
           │ N:1 (self-reference via parent_lot_no)
           │
           └──────────┐
                      │
┌─────────────────────▼───────────────────────────────┐
│  tb_inventory_transaction_closing_balance           │
│  (Optional: Performance Optimization)               │
│─────────────────────────────────────────────────────│
│ • id (PK)                                           │
│ • product_id (FK, UK2)                             │
│ • location_id (FK, UK2)                            │
│ • lot_no (UK2)                                     │
│ • balance_qty                                       │
│ • balance_value                                     │
│ • as_of_date                                        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│       tb_location                   │
│─────────────────────────────────────│
│ • id (PK)                           │
│ • location_code (UK)  ──────────────┼──┐
│ • location_name                     │  │
│ • location_type                     │  │
│ • is_active                         │  │
└─────────────────────────────────────┘  │
                                         │
                 Referenced by ──────────┘
                 location_code in cost_layer
```

**Key Relationships**:
1. **Product → Transaction Detail** (1:N): Each product can have multiple transaction details
2. **Transaction Detail → Cost Layer** (1:N): Each transaction can create multiple cost layers (multi-lot consumption)
3. **Cost Layer → Cost Layer** (N:1 self-reference): Parent-child relationship via `parent_lot_no`
4. **Location → Cost Layer** (1:N): Each location can have multiple cost layers

---

## Core Tables

### tb_inventory_transaction_cost_layer

**Purpose**: Central table for lot-based costing. Stores both lot creation (LOT) and lot consumption (ADJUSTMENT) records.

**Table Definition**:

| Column Name | Data Type | Constraints | Default | Description |
|-------------|-----------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | gen_random_uuid() | Unique record identifier |
| `inventory_transaction_detail_id` | UUID | NOT NULL, FOREIGN KEY | - | Reference to transaction detail |
| `lot_no` | VARCHAR | NULLABLE, UNIQUE (with lot_index) | NULL | Lot identifier (NULL for consumption records) |
| `lot_index` | INTEGER | NOT NULL, UNIQUE (with lot_no) | 1 | Sequence within lot (1=creation, 2+=consumption) |
| `parent_lot_no` | VARCHAR | NULLABLE, FOREIGN KEY | NULL | Reference to parent lot (NULL=LOT, populated=ADJUSTMENT) |
| `location_id` | UUID | NULLABLE, FOREIGN KEY | NULL | Location UUID |
| `location_code` | VARCHAR | NULLABLE | NULL | Location code (denormalized for performance) |
| `lot_at_date` | TIMESTAMP WITH TIME ZONE | NULLABLE | NULL | Lot creation date |
| `lot_seq_no` | INTEGER | NULLABLE | 1 | Daily sequence number (1-9999) |
| `product_id` | UUID | NULLABLE, FOREIGN KEY | NULL | Product UUID |
| `transaction_type` | ENUM (enum_transaction_type) | NULLABLE | NULL | Transaction type enum |
| `in_qty` | DECIMAL(20, 5) | NOT NULL | 0 | Quantity received (>0 for LOT) |
| `out_qty` | DECIMAL(20, 5) | NOT NULL | 0 | Quantity consumed (>0 for ADJUSTMENT) |
| `cost_per_unit` | DECIMAL(20, 5) | NOT NULL | 0 | Unit cost |
| `total_cost` | DECIMAL(20, 5) | NOT NULL | 0 | Total cost (qty × unit cost) |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | now() | Record creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | now() | Record update timestamp |
| `created_by` | UUID | NULLABLE | NULL | Creating user UUID |
| `updated_by` | UUID | NULLABLE | NULL | Updating user UUID |

**Primary Key**:
```sql
PRIMARY KEY (id)
```

**Unique Constraints**:
```sql
UNIQUE (lot_no, lot_index)
-- Ensures each lot can have only one record with a given lot_index
-- Example: ('MK-251107-0001', 1) = lot creation
--          ('MK-251107-0001', 2) = first consumption
--          ('MK-251107-0001', 3) = second consumption
```

**Foreign Keys**:
```sql
FOREIGN KEY (inventory_transaction_detail_id)
  REFERENCES tb_inventory_transaction_detail(id)
  ON DELETE CASCADE

FOREIGN KEY (parent_lot_no)
  REFERENCES tb_inventory_transaction_cost_layer(lot_no)
  ON DELETE RESTRICT

FOREIGN KEY (location_id)
  REFERENCES tb_location(id)
  ON DELETE RESTRICT

FOREIGN KEY (product_id)
  REFERENCES tb_product(id)
  ON DELETE RESTRICT
```

**Indexes**:
```sql
-- Primary lookup index
CREATE INDEX idx_cost_layer_lot_no
  ON tb_inventory_transaction_cost_layer(lot_no)
  WHERE lot_no IS NOT NULL;

-- Parent-child relationship index
CREATE INDEX idx_cost_layer_parent_lot_no
  ON tb_inventory_transaction_cost_layer(parent_lot_no)
  WHERE parent_lot_no IS NOT NULL;

-- Product-location balance queries
CREATE INDEX idx_cost_layer_product_location
  ON tb_inventory_transaction_cost_layer(product_id, location_id);

-- Date-based reporting
CREATE INDEX idx_cost_layer_lot_date
  ON tb_inventory_transaction_cost_layer(lot_at_date)
  WHERE lot_at_date IS NOT NULL;

-- FIFO query optimization (covering index)
CREATE INDEX idx_cost_layer_fifo_balance
  ON tb_inventory_transaction_cost_layer(product_id, location_id, lot_no)
  INCLUDE (in_qty, out_qty, cost_per_unit, lot_at_date)
  WHERE lot_no IS NOT NULL;

-- Location-date sequence lookup
CREATE INDEX idx_cost_layer_location_date_seq
  ON tb_inventory_transaction_cost_layer(location_code, lot_at_date, lot_seq_no)
  WHERE lot_no IS NOT NULL;
```

**Check Constraints**:
```sql
-- LOT pattern: in_qty > 0, out_qty = 0, parent_lot_no IS NULL
ALTER TABLE tb_inventory_transaction_cost_layer
  ADD CONSTRAINT chk_lot_pattern
  CHECK (
    (lot_no IS NOT NULL AND parent_lot_no IS NULL AND in_qty > 0 AND out_qty = 0)
    OR
    (lot_no IS NULL AND parent_lot_no IS NOT NULL AND in_qty = 0 AND out_qty > 0)
  );

-- Lot sequence number range
ALTER TABLE tb_inventory_transaction_cost_layer
  ADD CONSTRAINT chk_lot_seq_range
  CHECK (lot_seq_no BETWEEN 1 AND 9999);

-- Cost must be non-negative
ALTER TABLE tb_inventory_transaction_cost_layer
  ADD CONSTRAINT chk_cost_positive
  CHECK (cost_per_unit >= 0 AND total_cost >= 0);

-- Quantities must be non-negative
ALTER TABLE tb_inventory_transaction_cost_layer
  ADD CONSTRAINT chk_qty_nonnegative
  CHECK (in_qty >= 0 AND out_qty >= 0);

-- Either in_qty or out_qty must be > 0 (not both zero)
ALTER TABLE tb_inventory_transaction_cost_layer
  ADD CONSTRAINT chk_qty_nonzero
  CHECK (in_qty > 0 OR out_qty > 0);
```

**Trigger: Auto-calculate total_cost**:
```sql
CREATE OR REPLACE FUNCTION fn_calculate_total_cost()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.in_qty > 0 THEN
    NEW.total_cost = NEW.in_qty * NEW.cost_per_unit;
  ELSIF NEW.out_qty > 0 THEN
    NEW.total_cost = NEW.out_qty * NEW.cost_per_unit;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_total_cost
  BEFORE INSERT OR UPDATE ON tb_inventory_transaction_cost_layer
  FOR EACH ROW
  EXECUTE FUNCTION fn_calculate_total_cost();
```

**Sample Data**:

**LOT Record** (GRN Commitment):
```sql
INSERT INTO tb_inventory_transaction_cost_layer (
  id,
  inventory_transaction_detail_id,
  lot_no,
  lot_index,
  parent_lot_no,
  location_id,
  location_code,
  lot_at_date,
  lot_seq_no,
  product_id,
  transaction_type,
  in_qty,
  out_qty,
  cost_per_unit,
  total_cost,
  created_by
) VALUES (
  'c4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9',
  'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  'MK-251107-0001',           -- Generated lot number
  1,                          -- Lot creation (index 1)
  NULL,                       -- No parent (this IS the parent)
  'loc-uuid-main-kitchen',
  'MK',
  '2025-11-07 00:00:00+00',
  1,                          -- First lot of the day
  'prod-uuid-flour',
  'good_received_note',
  50.00000,                   -- Received 50 kg
  0.00000,                    -- No consumption
  5.50000,                    -- Cost $5.50/kg
  275.00000,                  -- Total $275.00
  'user-uuid'
);
```

**ADJUSTMENT Record** (Consumption):
```sql
INSERT INTO tb_inventory_transaction_cost_layer (
  id,
  inventory_transaction_detail_id,
  lot_no,
  lot_index,
  parent_lot_no,
  location_id,
  location_code,
  lot_at_date,
  lot_seq_no,
  product_id,
  transaction_type,
  in_qty,
  out_qty,
  cost_per_unit,
  total_cost,
  created_by
) VALUES (
  'd5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0',
  'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7',
  NULL,                       -- No lot_no for consumption
  2,                          -- Second record for parent lot
  'MK-251107-0001',           -- Reference to parent lot
  'loc-uuid-main-kitchen',
  'MK',
  '2025-11-07 00:00:00+00',   -- Same as parent
  1,                          -- Same sequence as parent
  'prod-uuid-flour',
  'issue',
  0.00000,                    -- No receipt
  10.00000,                   -- Consumed 10 kg
  5.50000,                    -- Cost from parent lot
  55.00000,                   -- Total $55.00
  'user-uuid'
);
```

---

### tb_inventory_transaction_detail

**Purpose**: Parent transaction record for each inventory movement

**Table Definition**:

| Column Name | Data Type | Constraints | Default | Description |
|-------------|-----------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | gen_random_uuid() | Unique transaction identifier |
| `transaction_id` | VARCHAR | NOT NULL | - | Business transaction number (GRN-xxx, ADJ-xxx, etc.) |
| `transaction_type` | ENUM (enum_transaction_type) | NOT NULL | - | Type of transaction |
| `transaction_date` | TIMESTAMP WITH TIME ZONE | NOT NULL | - | Transaction date |
| `product_id` | UUID | NOT NULL, FOREIGN KEY | - | Product being transacted |
| `location_id` | UUID | NOT NULL, FOREIGN KEY | - | Location of transaction |
| `quantity` | DECIMAL(20, 5) | NOT NULL | - | Transaction quantity |
| `unit_cost` | DECIMAL(20, 5) | NOT NULL | - | Unit cost |
| `reference_document` | VARCHAR | NULLABLE | NULL | External document reference |
| `notes` | TEXT | NULLABLE | NULL | Transaction notes |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | now() | Creation timestamp |
| `created_by` | UUID | NULLABLE | NULL | Creating user |

**Foreign Keys**:
```sql
FOREIGN KEY (product_id)
  REFERENCES tb_product(id)
  ON DELETE RESTRICT

FOREIGN KEY (location_id)
  REFERENCES tb_location(id)
  ON DELETE RESTRICT
```

**Indexes**:
```sql
CREATE INDEX idx_trans_detail_transaction_id
  ON tb_inventory_transaction_detail(transaction_id);

CREATE INDEX idx_trans_detail_date
  ON tb_inventory_transaction_detail(transaction_date);

CREATE INDEX idx_trans_detail_product
  ON tb_inventory_transaction_detail(product_id);

CREATE INDEX idx_trans_detail_location
  ON tb_inventory_transaction_detail(location_id);
```

---

### tb_inventory_transaction_closing_balance

**Purpose**: Optimized balance queries (optional materialized view pattern)

**Table Definition**:

| Column Name | Data Type | Constraints | Default | Description |
|-------------|-----------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY | gen_random_uuid() | Unique record identifier |
| `product_id` | UUID | NOT NULL, FOREIGN KEY, UNIQUE (with location_id, lot_no) | - | Product UUID |
| `location_id` | UUID | NOT NULL, FOREIGN KEY, UNIQUE (with product_id, lot_no) | - | Location UUID |
| `lot_no` | VARCHAR | NULLABLE, UNIQUE (with product_id, location_id) | NULL | Lot number (NULL for aggregate balance) |
| `balance_qty` | DECIMAL(20, 5) | NOT NULL | 0 | Current balance quantity |
| `balance_value` | DECIMAL(20, 5) | NOT NULL | 0 | Current balance value |
| `as_of_date` | TIMESTAMP WITH TIME ZONE | NOT NULL | now() | Balance snapshot date |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | now() | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | now() | Update timestamp |

**Unique Constraint**:
```sql
UNIQUE (product_id, location_id, lot_no)
```

**Indexes**:
```sql
CREATE INDEX idx_closing_balance_product_location
  ON tb_inventory_transaction_closing_balance(product_id, location_id);

CREATE INDEX idx_closing_balance_lot
  ON tb_inventory_transaction_closing_balance(lot_no)
  WHERE lot_no IS NOT NULL;

CREATE INDEX idx_closing_balance_date
  ON tb_inventory_transaction_closing_balance(as_of_date);
```

**Maintenance**: This table is updated by scheduled jobs or triggers to maintain current balances.

---

### tb_product

**Purpose**: Product master data

**Relevant Fields**:

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique product identifier |
| `product_code` | VARCHAR | NOT NULL, UNIQUE | Product SKU/code |
| `product_name` | VARCHAR | NOT NULL | Product display name |
| `category_id` | UUID | FOREIGN KEY | Product category |
| `costing_method` | ENUM | NOT NULL, DEFAULT 'FIFO' | FIFO or PERIODIC_AVERAGE |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Active status |

**Costing Method Enum**:
```prisma
enum enum_costing_method {
  FIFO
  PERIODIC_AVERAGE
}
```

---

### tb_location

**Purpose**: Location master data

**Relevant Fields**:

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique location identifier |
| `location_code` | VARCHAR(4) | NOT NULL, UNIQUE | Location code (2-4 chars) |
| `location_name` | VARCHAR | NOT NULL | Location display name |
| `location_type` | VARCHAR | NULLABLE | Type (KITCHEN, WAREHOUSE, STORE, etc.) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Active status |

**Location Code Validation**:
- Must be 2-4 uppercase alphanumeric characters
- Examples: `MK` (Main Kitchen), `PV` (Pastry Venue), `WH01` (Warehouse 1)

---

## Enumerations

### enum_transaction_type

**Purpose**: Define all inventory transaction types

**Values**:

| Value | Description | Creates Lot? | Consumes Lot? |
|-------|-------------|-------------|---------------|
| `good_received_note` | GRN commitment from purchase order | Yes | No |
| `transfer_in` | Inter-location transfer receipt | Yes | No |
| `adjustment` | Stock adjustment (in or out) | Depends | Depends |
| `transfer_out` | Inter-location transfer issue | No | Yes |
| `issue` | Production/store issue | No | Yes |
| `credit_note` | Vendor return | No | Yes |
| `close_period` | Period-end snapshot | Special | Special |
| `open_period` | Period-opening snapshot | Special | Special |

**Prisma Definition**:
```prisma
enum enum_transaction_type {
  good_received_note
  transfer_in
  transfer_out
  issue
  adjustment
  credit_note
  close_period
  open_period
}
```

**SQL Definition**:
```sql
CREATE TYPE enum_transaction_type AS ENUM (
  'good_received_note',
  'transfer_in',
  'transfer_out',
  'issue',
  'adjustment',
  'credit_note',
  'close_period',
  'open_period'
);
```

---

## Data Dictionary

### Lot Number Format

**Format**: `{LOCATION}-{YYMMDD}-{SEQSEQ}`

**Components**:

| Component | Description | Length | Example | Valid Range |
|-----------|-------------|--------|---------|-------------|
| LOCATION | Location code | 2-4 chars | `MK` | Uppercase alphanumeric |
| YYMMDD | Date (Year-Month-Day) | 6 digits | `251107` | Valid date |
| SEQSEQ | Daily sequence | 4 digits | `0001` | 0001-9999 |

**Complete Examples**:
- `MK-251107-0001` - Main Kitchen, November 7, 2025, first lot of the day
- `PV-251107-0012` - Pastry Venue, November 7, 2025, 12th lot of the day
- `WH01-251225-1234` - Warehouse 1, December 25, 2025, 1,234th lot of the day

**Parsing Regex**:
```regex
^([A-Z0-9]{2,4})-(\d{6})-(\d{4})$
```

**Validation Rules**:
1. Total length: 13-17 characters (including hyphens)
2. Location code must exist in `tb_location` table
3. Date component must be valid date (not future)
4. Sequence must be 0001-9999
5. Lot number must be globally unique

### Transaction Patterns

**LOT Pattern** (Lot Creation):

| Field | Value | Rule |
|-------|-------|------|
| `lot_no` | Generated (e.g., `MK-251107-0001`) | NOT NULL, unique with lot_index |
| `lot_index` | 1 | Always 1 for lot creation |
| `parent_lot_no` | NULL | Must be NULL for lot creation |
| `in_qty` | > 0 | Quantity received (e.g., 50.00) |
| `out_qty` | 0 | Must be 0 for lot creation |
| `transaction_type` | `good_received_note`, `transfer_in`, `adjustment` | Varies by source |

**ADJUSTMENT Pattern** (Lot Consumption):

| Field | Value | Rule |
|-------|-------|------|
| `lot_no` | NULL | Must be NULL for consumption |
| `lot_index` | 2, 3, 4, ... | Auto-incremented per parent lot |
| `parent_lot_no` | Reference to parent (e.g., `MK-251107-0001`) | NOT NULL, must exist |
| `in_qty` | 0 | Must be 0 for consumption |
| `out_qty` | > 0 | Quantity consumed (e.g., 10.00) |
| `transaction_type` | `issue`, `transfer_out`, `adjustment`, `credit_note` | Varies by purpose |

---

## Data Integrity Rules

### Referential Integrity

1. **Parent Lot Must Exist**:
```sql
-- parent_lot_no must reference existing lot_no
FOREIGN KEY (parent_lot_no)
  REFERENCES tb_inventory_transaction_cost_layer(lot_no)
  ON DELETE RESTRICT
```

2. **Lot Balance Cannot Go Negative**:
```sql
-- Application-level check before consumption
SELECT SUM(in_qty) - SUM(out_qty) as balance
FROM tb_inventory_transaction_cost_layer
WHERE lot_no = :parent_lot_no
HAVING balance >= :consumption_qty
```

3. **Lot Number Uniqueness**:
```sql
-- Unique constraint on (lot_no, lot_index)
-- Prevents duplicate lot numbers at creation (index 1)
-- Prevents duplicate consumption records
```

### Data Consistency

1. **Total Cost Calculation**:
```sql
-- Trigger ensures total_cost = qty × cost_per_unit
total_cost = CASE
  WHEN in_qty > 0 THEN in_qty * cost_per_unit
  WHEN out_qty > 0 THEN out_qty * cost_per_unit
  ELSE 0
END
```

2. **Sequence Number Integrity**:
```sql
-- No gaps allowed in lot_index per lot
-- Example: If lot has index 1, 2, 4 → ERROR (missing 3)
-- Application ensures sequential allocation
```

3. **FIFO Order Preservation**:
```sql
-- Lot numbers naturally sort chronologically due to date-based format
-- Example: MK-251105-0001 < MK-251105-0002 < MK-251106-0001
ORDER BY lot_no ASC  -- Guarantees FIFO order
```

---

## Indexing Strategy

### Query Performance Optimization

**Balance Query** (Most Frequent):
```sql
-- Query: Get available lots for FIFO
SELECT lot_no, SUM(in_qty) - SUM(out_qty) as balance, cost_per_unit
FROM tb_inventory_transaction_cost_layer
WHERE product_id = ? AND location_id = ? AND lot_no IS NOT NULL
GROUP BY lot_no, cost_per_unit
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC

-- Optimized by: idx_cost_layer_fifo_balance (covering index)
```

**Lot Traceability** (Medium Frequency):
```sql
-- Query: Get all transactions for a lot
SELECT * FROM tb_inventory_transaction_cost_layer
WHERE lot_no = ? OR parent_lot_no = ?
ORDER BY lot_index ASC

-- Optimized by: idx_cost_layer_lot_no + idx_cost_layer_parent_lot_no
```

**Sequence Generation** (High Frequency):
```sql
-- Query: Get next sequence number
SELECT lot_seq_no
FROM tb_inventory_transaction_cost_layer
WHERE location_code = ? AND lot_at_date::date = ?::date
ORDER BY lot_seq_no DESC
LIMIT 1

-- Optimized by: idx_cost_layer_location_date_seq
```

### Index Maintenance

**Index Size Monitoring**:
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename = 'tb_inventory_transaction_cost_layer'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Index Usage Statistics**:
```sql
SELECT
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename = 'tb_inventory_transaction_cost_layer'
ORDER BY idx_scan DESC;
```

---

## Data Migration

### Migration from Non-Lot System

**Step 1: Identify Opening Balances**
```sql
-- Get current inventory balances
SELECT
  product_id,
  location_id,
  SUM(quantity) as balance_qty,
  AVG(unit_cost) as avg_cost
FROM tb_inventory_transaction (old system)
GROUP BY product_id, location_id
HAVING SUM(quantity) > 0
```

**Step 2: Create Opening Lot Records**
```sql
-- For each opening balance, create a synthetic lot
INSERT INTO tb_inventory_transaction_cost_layer (
  lot_no,
  lot_index,
  parent_lot_no,
  location_id,
  location_code,
  lot_at_date,
  lot_seq_no,
  product_id,
  transaction_type,
  in_qty,
  out_qty,
  cost_per_unit,
  total_cost
) VALUES (
  '{LOCATION}-{MIGRATION_DATE}-{SEQ}',  -- e.g., 'MK-250101-0001'
  1,                                     -- Lot creation
  NULL,                                  -- No parent
  :location_id,
  :location_code,
  :migration_date,
  :sequence_no,
  :product_id,
  'open_period',
  :opening_balance_qty,
  0,
  :opening_avg_cost,
  :opening_balance_qty * :opening_avg_cost
)
```

**Step 3: Validation**
```sql
-- Verify migrated balances match old system
SELECT
  NEW.product_id,
  NEW.location_id,
  NEW.new_balance,
  OLD.old_balance,
  NEW.new_balance - OLD.old_balance as variance
FROM (
  SELECT product_id, location_id, SUM(in_qty) - SUM(out_qty) as new_balance
  FROM tb_inventory_transaction_cost_layer
  GROUP BY product_id, location_id
) NEW
FULL OUTER JOIN (
  SELECT product_id, location_id, SUM(quantity) as old_balance
  FROM tb_inventory_transaction
  GROUP BY product_id, location_id
) OLD ON NEW.product_id = OLD.product_id AND NEW.location_id = OLD.location_id
WHERE ABS(NEW.new_balance - OLD.old_balance) > 0.01  -- Tolerance for rounding
```

---

## Database Maintenance

### Archival Strategy

**Archive Old Depleted Lots**:
```sql
-- Move fully consumed lots older than 2 years to archive table
INSERT INTO tb_inventory_transaction_cost_layer_archive
SELECT * FROM tb_inventory_transaction_cost_layer
WHERE lot_no IS NOT NULL
  AND lot_at_date < (CURRENT_DATE - INTERVAL '2 years')
  AND (SELECT SUM(in_qty) - SUM(out_qty)
       FROM tb_inventory_transaction_cost_layer cl2
       WHERE cl2.lot_no = tb_inventory_transaction_cost_layer.lot_no
         OR cl2.parent_lot_no = tb_inventory_transaction_cost_layer.lot_no) = 0;

-- Delete archived records
DELETE FROM tb_inventory_transaction_cost_layer
WHERE lot_no IN (SELECT lot_no FROM tb_inventory_transaction_cost_layer_archive);
```

### Vacuum and Analyze

**Regular Maintenance**:
```sql
-- Analyze table statistics (run after bulk inserts)
ANALYZE tb_inventory_transaction_cost_layer;

-- Vacuum to reclaim space (run periodically)
VACUUM ANALYZE tb_inventory_transaction_cost_layer;

-- Full vacuum (requires exclusive lock, run during maintenance window)
VACUUM FULL tb_inventory_transaction_cost_layer;
```

### Partition Strategy (Future Enhancement)

**Partition by Lot Date**:
```sql
-- Create partitioned table
CREATE TABLE tb_inventory_transaction_cost_layer_partitioned (
  LIKE tb_inventory_transaction_cost_layer INCLUDING ALL
) PARTITION BY RANGE (lot_at_date);

-- Create monthly partitions
CREATE TABLE tb_inventory_transaction_cost_layer_2025_01
  PARTITION OF tb_inventory_transaction_cost_layer_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE tb_inventory_transaction_cost_layer_2025_02
  PARTITION OF tb_inventory_transaction_cost_layer_partitioned
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

---

## Data Quality Checks

### Data Validation Queries

**1. Check for Orphaned Consumption Records**:
```sql
-- Find consumption records with missing parent lots
SELECT * FROM tb_inventory_transaction_cost_layer
WHERE parent_lot_no IS NOT NULL
  AND parent_lot_no NOT IN (
    SELECT DISTINCT lot_no FROM tb_inventory_transaction_cost_layer
    WHERE lot_no IS NOT NULL
  );
-- Expected result: 0 rows
```

**2. Check for Negative Balances**:
```sql
-- Find lots with negative balance (data corruption)
SELECT
  lot_no,
  product_id,
  location_id,
  SUM(in_qty) - SUM(out_qty) as balance
FROM tb_inventory_transaction_cost_layer
WHERE lot_no IS NOT NULL
GROUP BY lot_no, product_id, location_id
HAVING SUM(in_qty) - SUM(out_qty) < 0;
-- Expected result: 0 rows
```

**3. Check Lot Number Format**:
```sql
-- Find lot numbers not matching format
SELECT lot_no
FROM tb_inventory_transaction_cost_layer
WHERE lot_no IS NOT NULL
  AND lot_no !~ '^[A-Z0-9]{2,4}-\d{6}-\d{4}$';
-- Expected result: 0 rows
```

**4. Check Sequence Gaps**:
```sql
-- Find missing sequences in lot_index (should be continuous)
SELECT DISTINCT
  lot_no,
  lot_index as current_index,
  lot_index - LAG(lot_index) OVER (PARTITION BY lot_no ORDER BY lot_index) as gap
FROM tb_inventory_transaction_cost_layer
WHERE lot_no IS NOT NULL OR parent_lot_no IS NOT NULL
HAVING gap > 1;
-- Expected result: 0 rows (no gaps)
```

**5. Check Total Cost Accuracy**:
```sql
-- Find records where total_cost ≠ qty × cost_per_unit
SELECT *,
  CASE
    WHEN in_qty > 0 THEN in_qty * cost_per_unit
    WHEN out_qty > 0 THEN out_qty * cost_per_unit
  END as expected_total_cost
FROM tb_inventory_transaction_cost_layer
WHERE ABS(total_cost - expected_total_cost) > 0.01;  -- Tolerance for rounding
-- Expected result: 0 rows
```

---

## Sample Data Scenarios

### Scenario 1: GRN Commitment Creates Lot

**Context**: Receive 100 kg of flour at Main Kitchen

**Step 1: Create Transaction Detail**
```sql
INSERT INTO tb_inventory_transaction_detail (
  id,
  transaction_id,
  transaction_type,
  transaction_date,
  product_id,
  location_id,
  quantity,
  unit_cost,
  reference_document
) VALUES (
  'trans-uuid-001',
  'GRN-2501-0001',
  'good_received_note',
  '2025-11-07 10:30:00+00',
  'prod-uuid-flour',
  'loc-uuid-main-kitchen',
  100.00000,
  4.75000,
  'PO-2501-0100'
);
```

**Step 2: Generate Lot Number**
```
Location: MK (Main Kitchen)
Date: 2025-11-07
Last sequence: 5
Next sequence: 6
Generated lot_no: MK-251107-0006
```

**Step 3: Create Lot Record**
```sql
INSERT INTO tb_inventory_transaction_cost_layer (
  id,
  inventory_transaction_detail_id,
  lot_no,
  lot_index,
  parent_lot_no,
  location_id,
  location_code,
  lot_at_date,
  lot_seq_no,
  product_id,
  transaction_type,
  in_qty,
  out_qty,
  cost_per_unit,
  total_cost
) VALUES (
  'cost-layer-uuid-001',
  'trans-uuid-001',
  'MK-251107-0006',
  1,
  NULL,
  'loc-uuid-main-kitchen',
  'MK',
  '2025-11-07 00:00:00+00',
  6,
  'prod-uuid-flour',
  'good_received_note',
  100.00000,
  0.00000,
  4.75000,
  475.00000
);
```

**Result**:
- Lot `MK-251107-0006` created with 100 kg balance
- Cost: $4.75/kg, Total value: $475.00

### Scenario 2: Issue Consumes Multiple Lots (FIFO)

**Context**: Issue 150 kg of flour from Main Kitchen

**Available Lots** (ordered by lot_no for FIFO):
1. `MK-251105-0003`: 80 kg @ $4.50/kg
2. `MK-251106-0008`: 90 kg @ $4.75/kg
3. `MK-251107-0006`: 100 kg @ $4.75/kg (from scenario 1)

**FIFO Allocation**:
- Consume 80 kg from `MK-251105-0003` @ $4.50 = $360.00
- Consume 70 kg from `MK-251106-0008` @ $4.75 = $332.50
- Total: 150 kg, Cost: $692.50, Weighted Avg: $4.617/kg

**Step 1: Create Transaction Detail**
```sql
INSERT INTO tb_inventory_transaction_detail (
  id,
  transaction_id,
  transaction_type,
  transaction_date,
  product_id,
  location_id,
  quantity,
  unit_cost,
  reference_document
) VALUES (
  'trans-uuid-002',
  'ISS-2501-0050',
  'issue',
  '2025-11-07 14:00:00+00',
  'prod-uuid-flour',
  'loc-uuid-main-kitchen',
  150.00000,
  4.61667,  -- Weighted average
  'REQ-2501-0025'
);
```

**Step 2: Create Consumption Record #1** (from lot `MK-251105-0003`)
```sql
INSERT INTO tb_inventory_transaction_cost_layer (
  id,
  inventory_transaction_detail_id,
  lot_no,
  lot_index,
  parent_lot_no,
  location_id,
  location_code,
  lot_at_date,
  lot_seq_no,
  product_id,
  transaction_type,
  in_qty,
  out_qty,
  cost_per_unit,
  total_cost
) VALUES (
  'cost-layer-uuid-002',
  'trans-uuid-002',
  NULL,                      -- No lot_no for consumption
  2,                         -- Next index for parent lot
  'MK-251105-0003',          -- Reference to parent
  'loc-uuid-main-kitchen',
  'MK',
  '2025-11-05 00:00:00+00',  -- Parent lot date
  3,                         -- Parent lot sequence
  'prod-uuid-flour',
  'issue',
  0.00000,
  80.00000,                  -- Fully consumed
  4.50000,                   -- Cost from parent
  360.00000
);
```

**Step 3: Create Consumption Record #2** (from lot `MK-251106-0008`)
```sql
INSERT INTO tb_inventory_transaction_cost_layer (
  id,
  inventory_transaction_detail_id,
  lot_no,
  lot_index,
  parent_lot_no,
  location_id,
  location_code,
  lot_at_date,
  lot_seq_no,
  product_id,
  transaction_type,
  in_qty,
  out_qty,
  cost_per_unit,
  total_cost
) VALUES (
  'cost-layer-uuid-003',
  'trans-uuid-002',
  NULL,
  2,
  'MK-251106-0008',
  'loc-uuid-main-kitchen',
  'MK',
  '2025-11-06 00:00:00+00',
  8,
  'prod-uuid-flour',
  'issue',
  0.00000,
  70.00000,                  -- Partial consumption
  4.75000,
  332.50000
);
```

**Result**:
- Lot `MK-251105-0003`: Balance 80 kg → 0 kg (fully depleted)
- Lot `MK-251106-0008`: Balance 90 kg → 20 kg (20 kg remaining)
- Lot `MK-251107-0006`: Balance 100 kg → 100 kg (untouched)
- Total issue cost: $692.50 (FIFO methodology)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-07 | System | Initial data schema documentation with 4-digit lot sequence |

---

**Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Database Administrator | | | |
| Technical Lead | | | |
| Data Governance Officer | | | |
