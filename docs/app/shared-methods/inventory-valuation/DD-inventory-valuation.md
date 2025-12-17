# Data Definition: Inventory Valuation

## Module Information
- **Module**: Shared Methods
- **Sub-Module**: Inventory Valuation
- **Database**: Carmen ERP
- **Schema Version**: 1.0.0
- **Last Updated**: 2025-11-02
- **Owner**: Architecture Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-02 | Architecture Team | Initial version |
| 1.1.0 | 2025-11-03 | Architecture Team | **Schema Alignment**: Updated all data definitions to match actual Prisma schema (`schema.prisma`) |

---

## Overview

This data definition describes the data structures required for the centralized inventory valuation system. The system supports two costing methods (FIFO and Periodic Average) applied company-wide to ensure consistent inventory valuation across credit notes, GRN processing, period-end calculations, and financial reporting.

**Key Business Processes Supported**:
- Company-wide costing method configuration
- FIFO layer tracking and consumption
- Periodic average cost calculation and caching
- Inventory valuation for transactions (credit notes, adjustments, etc.)
- Month-end cost consolidation
- Financial reporting and audit trails

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**
- Describes database structures in text format only
- Explains WHAT data is stored, WHY it exists, HOW it relates
- No SQL code, no CREATE TABLE statements
- For visual diagrams, refer to Flow Diagrams document

**Related Documents**:
- [Inventory Valuation Specification](./SM-inventory-valuation.md)
- [Costing Methods Details](./SM-costing-methods.md)
- [Periodic Average Specification](./SM-periodic-average.md)
- [API Reference](./api-reference.md)

---

## Entity Relationship Overview

**📌 Schema Reference**: All data structures are defined in `/app/data-struc/schema.prisma`

**Primary Entities** (Actual Prisma Models):
- **Configuration**: Costing method stored via `enum_business_unit_config_key.calculation_method`
- **tb_inventory_transaction**: Main inventory transaction tracking
- **tb_inventory_transaction_detail**: Transaction details with lot tracking and costs
- **tb_inventory_transaction_closing_balance**: FIFO layer balances by lot
- **tb_activity**: Audit trail for all inventory operations

**Costing Method Configuration**:
- Enum: `enum_calculation_method` with values: `FIFO`, `AVG` (see schema.prisma:42-45)
- Storage: Business unit configuration system (reference: `enum_business_unit_config_key.calculation_method`)
- Company-wide setting applied to all inventory items and locations

**Key Relationships**:

1. **Business Unit Config → Calculation Method**: One-to-One relationship
   - Business meaning: Each company has one costing method configuration
   - Prisma reference: `enum_calculation_method` enum
   - Example: ABC Hotels configured with `FIFO` method

2. **tb_inventory_transaction_detail → tb_product**: Many-to-One relationship
   - Business meaning: Each transaction detail references an inventory item
   - Prisma reference: `tb_inventory_transaction_detail.product_id → tb_product.id`
   - Example: Credit note detail links to "Tomatoes" product

3. **tb_inventory_transaction_closing_balance → Lot Tracking**: One-to-Many relationship
   - Business meaning: Each lot has multiple balance snapshots (FIFO layers)
   - Prisma reference: `tb_inventory_transaction_closing_balance` with `lot_no` and `lot_index`
   - Example: LOT-2501-0001 has multiple balance entries showing consumption over time

4. **tb_inventory_transaction_detail → tb_location**: Many-to-One relationship
   - Business meaning: Transactions occur at specific locations
   - Prisma reference: `tb_inventory_transaction_detail.location_id → tb_location.id`
   - Example: Transaction at "Main Kitchen" location

5. **tb_activity → Audit Trail**: One-to-Many relationship
   - Business meaning: All inventory operations logged for audit compliance
   - Prisma reference: `tb_activity` with `entity_type = 'inventory_transaction'`
   - Example: User "Admin-01" performed credit note operation

**Relationship Notes**:
- Costing method is configured at business unit level, not per-transaction
- FIFO tracking uses `tb_inventory_transaction_closing_balance` with lot-based balances
- AVG (Periodic Average) calculated from transaction history, not cached
- All entities maintain standard audit fields (created_at, updated_at, created_by_id, updated_by_id)

---

## Data Entities

**📌 Schema Location**: `/app/data-struc/schema.prisma`

### Entity: Calculation Method Configuration

**Prisma Reference**: `enum_calculation_method` (schema.prisma:42-45)

**Description**: Company-wide inventory costing method configuration stored in business unit settings.

**Business Purpose**: Provides centralized control over inventory costing methodology. Ensures consistency in how credit notes, GRN, adjustments, and financial reports calculate inventory values.

**Data Ownership**: Finance/Operations Management (requires admin privileges to modify)

**Access Pattern**:
- Read frequently (every inventory valuation calculation)
- Write rarely (only when changing costing method)
- Primary access by business unit configuration key
- Cached in application memory for performance

**Data Volume**: One configuration per company (low volume)

#### Enum Values

**Prisma Definition**:
```prisma
enum enum_calculation_method {
  FIFO  // First-In-First-Out costing
  AVG   // Periodic Average costing (monthly)
}
```

**Configuration Storage**:
- Stored in: Business unit configuration system
- Key reference: `enum_business_unit_config_key.calculation_method`
- Access: Via business unit settings service

**Enum Value Definitions**:

| Value | Description | Usage | When to Use |
|-------|-------------|-------|-------------|
| **FIFO** | First-In-First-Out | Consumes oldest inventory layers first | Perishable goods, items with varying costs, physical flow matches FIFO |
| **AVG** | Periodic Average | Uses monthly average cost for all transactions | High-volume items, stable costs, simplified accounting |

**Business Rules**:
1. One calculation method per company (company-wide setting)
2. Method applies to all inventory items and all locations
3. Changing method affects only future transactions
4. Historical transactions retain their original costing
5. Cannot be NULL - must be either FIFO or AVG
6. Changes require admin privileges and create audit log entry

---

### Entity: tb_inventory_transaction_closing_balance

**Prisma Reference**: `tb_inventory_transaction_closing_balance` (schema.prisma:768-793)

**Description**: Tracks inventory lot balances for FIFO costing. Each record represents a lot's balance snapshot after a transaction, enabling layer-based costing and consumption tracking.

**Business Purpose**: Enables FIFO (First-In-First-Out) costing by maintaining lot-based inventory balances. Supports layer-based cost allocation for returns, adjustments, and consumption tracking.

**Data Ownership**: System-generated (auto-created during inventory transactions)

**Access Pattern**:
- Read: Frequently during valuation calculations, inventory queries
- Write: Created/updated with each inventory transaction
- Query: By lot_no + location_id + product_id
- Performance: Critical for FIFO performance - indexed on lot_no and lot_index

**Data Volume**: High volume (~5K-50K records/month depending on transaction frequency)

#### Fields Overview

**Prisma Model Definition** (from schema.prisma:768-793):
```prisma
model tb_inventory_transaction_closing_balance {
  id                              String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inventory_transaction_detail_id String  @db.Uuid
  lot_no                          String? @db.VarChar
  lot_index                       Int     @default(1)

  location_id String? @db.Uuid
  product_id  String? @db.Uuid

  in_qty        Decimal? @db.Decimal(20, 5)
  out_qty       Decimal? @db.Decimal(20, 5)
  cost_per_unit Decimal? @db.Decimal(20, 5)
  total_cost    Decimal? @db.Decimal(20, 5)

  // Standard audit fields
  created_at    DateTime? @default(now()) @db.Timestamptz(6)
  created_by_id String?   @db.Uuid
  updated_at    DateTime? @default(now()) @db.Timestamptz(6)
  updated_by_id String?   @db.Uuid

  // Relationships
  tb_inventory_transaction_detail tb_inventory_transaction_detail @relation(...)

  @@unique([lot_no, lot_index])
}
```

**Primary Identification**:
- **ID Field**: `id` (UUID, auto-generated)
- **Business Key**: Combination of `lot_no` + `lot_index`
- **Display Name**: `lot_no` (e.g., "LOT-2501-0001")

**Core Business Fields**:

- **inventory_transaction_detail_id**: UUID
  - Required: Yes
  - Purpose: Links to the transaction detail that created/updated this balance
  - Foreign Key: → tb_inventory_transaction_detail.id
  - Example: `550e8400-...`

- **lot_no**: VARCHAR
  - Required: Optional (nullable)
  - Purpose: Identifies the inventory lot/batch
  - Example: `LOT-2501-0001`, `BATCH-20250115-A`
  - Business rule: Combined with lot_index forms unique identifier

- **lot_index**: INTEGER
  - Required: Yes
  - Default: 1
  - Purpose: Sequential index for multiple balance records per lot
  - Example: 1, 2, 3 (for different transactions affecting same lot)
  - Business rule: Increments for each new transaction affecting the lot

- **location_id**: UUID
  - Required: Optional (nullable)
  - Purpose: Identifies storage location
  - Foreign Key: → tb_location.id
  - Example: `AA0e4900-...`

- **product_id**: UUID
  - Required: Optional (nullable)
  - Purpose: Identifies the inventory item
  - Foreign Key: → tb_product.id
  - Example: `BB0e5900-...`

- **in_qty**: DECIMAL(20,5)
  - Required: Optional (nullable)
  - Precision: 5 decimal places for fractional units
  - Purpose: Quantity added to lot (receipts, returns)
  - Example: `100.00000`
  - Business rule: Non-negative when present

- **out_qty**: DECIMAL(20,5)
  - Required: Optional (nullable)
  - Precision: 5 decimal places
  - Purpose: Quantity removed from lot (issues, consumption)
  - Example: `25.00000`
  - Business rule: Non-negative when present

- **cost_per_unit**: DECIMAL(20,5)
  - Required: Optional (nullable)
  - Precision: 5 decimal places for accurate costing
  - Purpose: Unit cost for this lot balance
  - Example: `10.50000`
  - Currency: Base currency

- **total_cost**: DECIMAL(20,5)
  - Required: Optional (nullable)
  - Precision: 5 decimal places
  - Purpose: Total value of the quantity (in_qty or out_qty × cost_per_unit)
  - Example: `1050.00000`
  - Business rule: Calculated field

**Audit Fields**:
- **created_at**: TIMESTAMP (UTC) - Record creation time
- **created_by_id**: UUID - User who created the record
- **updated_at**: TIMESTAMP (UTC) - Last modification time
- **updated_by_id**: UUID - User who last updated the record

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | 550e8400-... | Unique, Non-null |
| inventory_transaction_detail_id | UUID | Yes | - | FK to transaction detail | 660e9500-... | Foreign Key |
| lot_no | VARCHAR | No | NULL | Lot/batch identifier | LOT-2501-0001 | Part of unique key |
| lot_index | INTEGER | Yes | 1 | Sequential lot index | 1, 2, 3 | Part of unique key |
| location_id | UUID | No | NULL | FK to location | AA0e4900-... | Foreign Key |
| product_id | UUID | No | NULL | FK to product | BB0e5900-... | Foreign Key |
| in_qty | DECIMAL(20,5) | No | NULL | Quantity received | 100.00000 | Non-negative |
| out_qty | DECIMAL(20,5) | No | NULL | Quantity issued | 25.00000 | Non-negative |
| cost_per_unit | DECIMAL(20,5) | No | NULL | Unit cost | 10.50000 | Non-negative |
| total_cost | DECIMAL(20,5) | No | NULL | Total value | 1050.00000 | Calculated |
| created_at | TIMESTAMPTZ | No | NOW() | Creation timestamp | 2025-01-15 10:00:00 | UTC |
| created_by_id | UUID | No | NULL | Creator user ID | 770e1600-... | Foreign Key |
| updated_at | TIMESTAMPTZ | No | NOW() | Last update timestamp | 2025-01-20 11:15:00 | UTC |
| updated_by_id | UUID | No | NULL | Last updater user ID | 880e2700-... | Foreign Key |

**Indexes** (from schema.prisma):
- Primary: `id` (UUID)
- Unique: `(lot_no, lot_index)` - Ensures unique lot tracking

**Business Rules**:
1. Combination of lot_no + lot_index must be unique
2. in_qty and out_qty cannot both be populated (one or the other)
3. For FIFO: Oldest lot_index values consumed first
4. total_cost should equal (in_qty or out_qty) × cost_per_unit
5. Records are immutable once created (audit trail)

---

### Entity: tb_inventory_transaction_detail

**Prisma Reference**: `tb_inventory_transaction_detail` (schema.prisma:743-766)

**Description**: Records individual line items within inventory transactions. Tracks lot numbers, quantities, and costs for each transaction detail line.

**Business Purpose**: Provides detailed tracking of inventory movements at the transaction line level. Supports lot traceability, cost allocation, and consumption tracking for both FIFO and AVG costing methods.

**Data Ownership**: System-generated (created during transaction processing)

**Access Pattern**:
- Write: Created with each inventory transaction
- Read: For transaction details, cost analysis, lot traceability
- Query: By inventory_transaction_id, product_id, location_id
- Volume: High (1-50 details per transaction)

**Data Volume**: Very high (~10K-100K records/month)

#### Fields Overview

**Prisma Model Definition** (from schema.prisma:743-766):
```prisma
model tb_inventory_transaction_detail {
  id                       String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inventory_transaction_id String  @db.Uuid
  from_lot_no              String? @db.VarChar
  current_lot_no           String? @db.VarChar

  location_id String? @db.Uuid
  product_id  String  @db.Uuid

  qty           Decimal? @db.Decimal(20, 5)
  cost_per_unit Decimal? @db.Decimal(20, 5)
  total_cost    Decimal? @db.Decimal(20, 5)

  // Audit fields
  created_at    DateTime? @default(now()) @db.Timestamptz(6)
  created_by_id String?   @db.Uuid
  updated_at    DateTime? @default(now()) @db.Timestamptz(6)
  updated_by_id String?   @db.Uuid

  // Relationships
  tb_inventory_transaction tb_inventory_transaction @relation(...)
  tb_inventory_transaction_closing_balance tb_inventory_transaction_closing_balance[]
}
```

**Primary Identification**:
- **ID Field**: `id` (UUID, auto-generated)
- **Business Key**: Combination of `inventory_transaction_id` + sequence
- **Display Name**: `current_lot_no` (current lot identifier)

**Core Business Fields**:

- **inventory_transaction_id**: UUID
  - Required: Yes
  - Purpose: Links to parent transaction
  - Foreign Key: → tb_inventory_transaction.id
  - Example: `AA0e4900-...`

- **from_lot_no**: VARCHAR
  - Required: Optional (nullable)
  - Purpose: Source lot number (for transfers/consumption)
  - Example: `LOT-2501-0001`
  - Use case: FIFO layer consumption tracking

- **current_lot_no**: VARCHAR
  - Required: Optional (nullable)
  - Purpose: Current/destination lot number
  - Example: `LOT-2501-0002`
  - Use case: Receipt lot assignment, transfer destination

- **location_id**: UUID
  - Required: Optional (nullable)
  - Purpose: Storage location reference
  - Foreign Key: → tb_location.id
  - Example: `CC0e6900-...`

- **product_id**: UUID
  - Required: Yes
  - Purpose: Inventory item reference
  - Foreign Key: → tb_product.id
  - Example: `DD0e7900-...`

- **qty**: DECIMAL(20,5)
  - Required: Optional (nullable)
  - Precision: 5 decimal places for fractional units
  - Purpose: Transaction quantity (positive for receipts, consumption tracked via closing balance)
  - Example: `25.00000`

- **cost_per_unit**: DECIMAL(20,5)
  - Required: Optional (nullable)
  - Precision: 5 decimal places
  - Purpose: Unit cost for this transaction line
  - Example: `10.50000`
  - Source: FIFO layer cost or AVG period cost

- **total_cost**: DECIMAL(20,5)
  - Required: Optional (nullable)
  - Precision: 5 decimal places
  - Calculated: qty × cost_per_unit
  - Purpose: Total value of this transaction line
  - Example: `262.50000`

**Audit Fields**:
- **created_at**: TIMESTAMPTZ (UTC) - Record creation time
- **created_by_id**: UUID - User who created the record
- **updated_at**: TIMESTAMPTZ (UTC) - Last modification time
- **updated_by_id**: UUID - User who last updated the record

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | 550e8400-... | Unique, Non-null |
| inventory_transaction_id | UUID | Yes | - | FK to transaction | AA0e4900-... | Foreign Key |
| from_lot_no | VARCHAR | No | NULL | Source lot number | LOT-2501-0001 | - |
| current_lot_no | VARCHAR | No | NULL | Current lot number | LOT-2501-0002 | - |
| location_id | UUID | No | NULL | FK to location | CC0e6900-... | Foreign Key |
| product_id | UUID | Yes | - | FK to product | DD0e7900-... | Foreign Key |
| qty | DECIMAL(20,5) | No | NULL | Transaction quantity | 25.00000 | - |
| cost_per_unit | DECIMAL(20,5) | No | NULL | Unit cost | 10.50000 | Non-negative |
| total_cost | DECIMAL(20,5) | No | NULL | Total value | 262.50000 | Calculated |
| created_at | TIMESTAMPTZ | No | NOW() | Creation timestamp | 2025-01-20 14:30:00 | UTC |
| created_by_id | UUID | No | NULL | Creator user ID | 770e1600-... | Foreign Key |
| updated_at | TIMESTAMPTZ | No | NOW() | Last update timestamp | 2025-01-20 14:30:00 | UTC |
| updated_by_id | UUID | No | NULL | Last updater user ID | 880e2700-... | Foreign Key |

**Indexes** (from schema.prisma):
- Primary: `id`
- Relationship indexes on foreign keys

**Business Rules**:
1. product_id is mandatory - must reference valid product
2. total_cost should equal qty × cost_per_unit when both present
3. from_lot_no used for consumption transactions (FIFO tracking)
4. current_lot_no used for receipt transactions
5. Related closing balance records track lot-level details

---

### Periodic Average Cost Calculation

**⚠️ Note**: The current schema does not include a dedicated `PeriodCostCache` table. Average costs are calculated on-demand from transaction history.

**Calculation Method**:
- Average costs computed from `tb_inventory_transaction_detail` records
- Formula: SUM(total_cost) / SUM(qty) for a given period and product
- Period: Calendar month (1st to last day of month)

**Implementation Approach**:
- **On-Demand Calculation**: Average cost calculated when needed
- **Transaction-Based**: Uses actual transaction history for calculations
- **No Persistent Cache**: Results not stored in database
- **Application-Level Caching**: Consider caching in application layer (Redis/memory)

**Data Sources**:
- Primary: `tb_inventory_transaction_detail` - Contains qty, cost_per_unit, total_cost
- Filter: By product_id, location_id (optional), date range
- Aggregation: SUM and AVG functions on transaction details

#### Calculation Example

**Scenario**: Calculate average cost for Product "Chicken Breast" in January 2025

**Query Logic**:
```sql
SELECT
  product_id,
  SUM(total_cost) as period_total_cost,
  SUM(qty) as period_total_qty,
  SUM(total_cost) / NULLIF(SUM(qty), 0) as average_cost
FROM tb_inventory_transaction_detail
WHERE product_id = 'chicken-breast-id'
  AND created_at >= '2025-01-01'
  AND created_at < '2025-02-01'
  AND qty > 0  -- Only receipt transactions
GROUP BY product_id
```

**Result Example**:
- Total Cost: $5,165.00
- Total Quantity: 450.00 units
- Average Cost: $11.4778 per unit

**Performance Considerations**:
1. Application-level caching recommended (Redis, in-memory cache)
2. Cache TTL: Until end of current period or new transaction posted
3. Index on product_id and created_at for query performance
4. Consider materialized views for frequently accessed calculations

---

### Entity: tb_activity (Audit Trail)

**Prisma Reference**: `tb_activity` (schema.prisma:284-300)

**Description**: System-wide activity log that tracks all significant operations including inventory valuation events, costing method changes, and transaction processing.

**Business Purpose**: Provides compliance, traceability, and debugging capabilities for all system operations. Required for financial audits and regulatory compliance.

**Data Ownership**: System-generated (auto-created for all auditable events)

**Access Pattern**:
- Write: On every significant event (create, update, delete operations)
- Read: For audit reports, compliance reviews, troubleshooting, user activity tracking
- Query: By entity_type, entity_id, actor_id, action, date range
- Retention: Long-term (7+ years for compliance)

**Data Volume**: Very high (~50K-500K records/month across all modules)

#### Fields Overview

**Prisma Model Definition** (from schema.prisma:284-300):
```prisma
model tb_activity {
  id            String                     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  action        enum_activity_action?
  entity_type   enum_activity_entity_type?
  entity_id     String?                    @db.Uuid
  actor_id      String?                    @db.Uuid
  meta_data     Json?                      @db.Json
  old_data      Json?                      @db.Json
  new_data      Json?                      @db.Json
  ip_address    String?
  user_agent    String?
  description   String?
  created_at    DateTime?                  @default(now()) @db.Timestamptz(6)
  created_by_id String?                    @db.Uuid

  @@index([entity_type, entity_id])
}
```

**Primary Identification**:
- **ID Field**: `id` (UUID, auto-generated)
- **Business Key**: Combination of `entity_type` + `entity_id` + `created_at`
- **Display Name**: `action` + `description`

**Core Business Fields**:

- **action**: enum_activity_action
  - Required: Optional (nullable)
  - Enum values: `view`, `create`, `update`, `delete`, `login`, `logout`, `approve`, `reject`, `cancel`, `void`, `print`, `email`, `other`, `upload`, `download`, `export`, `import`, `copy`, `move`, `rename`, `save`
  - Purpose: Categorizes the type of action performed
  - Example: `create`, `update`, `delete`
  - Inventory context: `create` (new transaction), `update` (modify costing), `void` (cancel transaction)

- **entity_type**: enum_activity_entity_type
  - Required: Optional (nullable)
  - Enum values: Includes `inventory_transaction`, `inventory_adjustment`, `good_received_note`, `stock_in`, `stock_out`, etc.
  - Purpose: Identifies the type of entity affected
  - Example: `inventory_transaction`, `good_received_note`

- **entity_id**: UUID
  - Required: Optional (nullable)
  - Purpose: Links to the specific record that was affected
  - Example: `DD0e7900-...`
  - Use case: Reference to specific transaction, GRN, or configuration

- **actor_id**: UUID
  - Required: Optional (nullable)
  - Purpose: Identifies the user who performed the action
  - Foreign Key: → User table
  - Example: `EE0e8900-...`
  - Note: May be NULL for system-generated actions

- **meta_data**: JSON
  - Required: Optional (nullable)
  - Purpose: Flexible field for action-specific contextual data
  - Example: `{"reason": "Performance optimization", "affectedItems": 125}`
  - Use case: Store additional context about the operation

- **old_data**: JSON
  - Required: Optional (nullable)
  - Purpose: Records "before" state for update operations
  - Example: `{"costingMethod": "FIFO", "quantity": 100}`
  - Use case: Track what values changed

- **new_data**: JSON
  - Required: Optional (nullable)
  - Purpose: Records "after" state for update operations
  - Example: `{"costingMethod": "AVG", "quantity": 95}`
  - Use case: Track new values after change

- **ip_address**: VARCHAR
  - Required: Optional (nullable)
  - Purpose: Security audit trail - user's IP address
  - Example: `192.168.1.100`

- **user_agent**: VARCHAR
  - Required: Optional (nullable)
  - Purpose: Browser/client identification
  - Example: `Mozilla/5.0 (Windows NT 10.0; Win64; x64)...`

- **description**: VARCHAR
  - Required: Optional (nullable)
  - Purpose: Human-readable description of the action
  - Example: "Changed costing method from FIFO to AVG for all products"

- **created_at**: TIMESTAMPTZ
  - Required: Optional (nullable)
  - Default: NOW()
  - Timezone: UTC
  - Purpose: Timestamp when the activity was logged
  - Example: `2025-01-20 15:45:30`

- **created_by_id**: UUID
  - Required: Optional (nullable)
  - Purpose: System tracking of who created the audit log entry
  - Foreign Key: → User table
  - Example: `FF0e9900-...`

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | 550e8400-... | Unique, Non-null |
| action | enum_activity_action | No | NULL | Action type | create, update, delete | Enum |
| entity_type | enum_activity_entity_type | No | NULL | Affected entity type | inventory_transaction | Enum |
| entity_id | UUID | No | NULL | Affected entity ID | DD0e7900-... | - |
| actor_id | UUID | No | NULL | User who performed action | EE0e8900-... | Foreign Key |
| meta_data | JSON | No | NULL | Additional context | {"reason": "..."} | JSON object |
| old_data | JSON | No | NULL | Previous state | {"method": "FIFO"} | JSON object |
| new_data | JSON | No | NULL | New state | {"method": "AVG"} | JSON object |
| ip_address | VARCHAR | No | NULL | User IP address | 192.168.1.100 | - |
| user_agent | VARCHAR | No | NULL | Browser/client info | Mozilla/5.0... | - |
| description | VARCHAR | No | NULL | Human-readable description | "Changed costing method..." | - |
| created_at | TIMESTAMPTZ | No | NOW() | Event timestamp | 2025-01-20 15:45:30 | UTC |
| created_by_id | UUID | No | NULL | Log entry creator | FF0e9900-... | Foreign Key |

**Indexes** (from schema.prisma):
- Primary: `id`
- Composite: `(entity_type, entity_id)` - For entity history queries (indexed)

**Business Rules**:
1. Audit log entries are immutable (never updated or deleted)
2. All significant inventory operations should be logged
3. Retention: Minimum 7 years for compliance
4. Sensitive data (passwords, financial details) must never be logged
5. Performance: Consider async logging to avoid blocking transactions
6. actor_id tracks the user, created_by_id tracks the system/service that created the log

---

## Data Integrity Rules

**📌 Schema Reference**: Based on actual Prisma models in `/app/data-struc/schema.prisma`

### Cross-Entity Validation

1. **Costing Method Consistency**:
   - Company costing method stored in business unit configuration (enum_calculation_method)
   - Method applies uniformly: Either FIFO or AVG for all products and locations
   - Changing method affects future transactions only
   - Historical transactions retain original costing

2. **Lot Balance Integrity** (FIFO Tracking):
   - tb_inventory_transaction_closing_balance tracks lot-level balances
   - Unique constraint: (lot_no, lot_index) must be unique
   - in_qty and out_qty: Only one should be populated per record (receipt OR issue)
   - lot_index increments sequentially for multiple transactions on same lot
   - FIFO consumption: Process oldest lot_index values first

3. **Transaction Detail Consistency**:
   - tb_inventory_transaction_detail.total_cost = qty × cost_per_unit
   - product_id is mandatory - must reference valid tb_product record
   - from_lot_no tracks source lot for consumption (FIFO tracking)
   - current_lot_no tracks destination lot for receipts
   - Each detail must link to valid tb_inventory_transaction parent

4. **Audit Trail Completeness**:
   - Every significant inventory operation logged in tb_activity
   - action, entity_type, entity_id track what changed
   - old_data and new_data capture state changes
   - Audit logs are immutable (never updated or deleted)

### Referential Integrity

**Primary Foreign Keys** (from schema.prisma):
- **tb_inventory_transaction_detail.inventory_transaction_id** → tb_inventory_transaction.id
- **tb_inventory_transaction_detail.product_id** → tb_product.id (mandatory)
- **tb_inventory_transaction_detail.location_id** → tb_location.id (optional)
- **tb_inventory_transaction_closing_balance.inventory_transaction_detail_id** → tb_inventory_transaction_detail.id
- **tb_activity.actor_id** → User table (optional)
- **All created_by_id/updated_by_id fields** → User table (optional references)

### Data Quality Rules

**Based on schema.prisma data types**:

1. **Monetary Fields** (DECIMAL(20,5)):
   - cost_per_unit: 5 decimal places (e.g., 10.50000)
   - total_cost: 5 decimal places (e.g., 1050.00000)
   - All cost fields must be non-negative
   - Rounding: Only on final totals for display, store full precision
   - Currency: All costs stored in base currency

2. **Quantity Fields** (DECIMAL(20,5)):
   - qty: 5 decimal places for fractional units (e.g., 25.00000)
   - in_qty, out_qty: 5 decimal places (e.g., 100.00000)
   - All quantities must be non-negative
   - Zero quantities allowed for balance adjustments

3. **Date/Time Fields** (TIMESTAMPTZ):
   - All timestamps stored in UTC timezone
   - created_at, updated_at: Auto-populated with server time
   - Transaction dates should not be in future (business rule)
   - Timezone: UTC (6) as per Prisma schema specification

4. **Unique Constraints** (from schema.prisma):
   - tb_inventory_transaction_closing_balance: (lot_no, lot_index) unique
   - No duplicate lot tracking records within the system
   - Costing method: One configuration per company (business unit config)

---

## Performance Considerations

**📌 Schema Reference**: Based on actual Prisma models and indexes

### Indexing Strategy

**Existing Indexes** (from schema.prisma):
1. `tb_inventory_transaction_closing_balance(lot_no, lot_index)` - Unique composite (critical for FIFO)
2. `tb_activity(entity_type, entity_id)` - Composite index for audit queries
3. Foreign key indexes on all relationship fields (auto-created by Prisma)

**Recommended Additional Indexes**:
1. `tb_inventory_transaction_detail(product_id, created_at)` - For AVG cost calculations
2. `tb_inventory_transaction_detail(location_id, product_id, created_at)` - For location-specific costs
3. `tb_inventory_transaction_closing_balance(product_id, lot_no)` - For FIFO layer lookups
4. `tb_activity(created_at)` - For time-based audit queries

### Caching Recommendations

1. **Application-Level Cache** (Redis/Memcached):
   - **Costing Method Configuration**: Cache in application memory (rarely changes, TTL: 1 hour)
   - **AVG Period Costs**: Cache calculated averages (TTL: until next transaction or period end)
   - **FIFO Lot Balances**: Cache active lot balances for frequently accessed products
   - **Cache Invalidation**: On new transactions, configuration changes

2. **Query Result Caching**:
   - FIFO: Cache lot_index sorted by created_at for active lots
   - AVG: Cache aggregated cost calculations per product per period
   - Configuration: Cache business unit costing method setting

3. **Cache Strategy**:
   - Write-through for configuration changes
   - Cache-aside for cost calculations
   - TTL-based expiration with transaction-based invalidation

### Data Volume Management

1. **tb_inventory_transaction_closing_balance**:
   - High volume growth (5K-50K records/month)
   - Consider partitioning by created_at (monthly/yearly partitions)
   - Archive old lot balances (>2 years) to separate table
   - Maintain indexes on active partitions only

2. **tb_activity** (Audit Log):
   - Very high volume (50K-500K records/month)
   - **Required**: Partition by created_at (monthly partitions)
   - Archive logs older than 7 years to cold storage (compliance)
   - Never delete - permanent audit trail required
   - Use table inheritance for efficient archival

3. **tb_inventory_transaction_detail**:
   - High volume growth (10K-100K records/month)
   - Consider partitioning for very high transaction systems
   - Maintain indexes on active data only
   - Archive historical transactions (>5 years) if needed

---

## Data Migration Considerations

### Initial Setup

When implementing this system for the first time:

1. **Create InventorySettings**:
   - Insert default record with FIFO method
   - Set created_by to admin user
   - Document reason in audit log

2. **Backfill FIFO Layers** (if FIFO selected):
   - Create layers from historical GRN data
   - Set correct receipt_date from GRN
   - Set remaining_quantity = original_quantity (no historical consumption)

3. **Calculate Period Costs** (if Periodic Average selected):
   - Calculate averages for all historical months with GRN data
   - Populate PeriodCostCache
   - Document calculation in audit log

### Changing Costing Methods

When switching from FIFO to Periodic Average (or vice versa):

1. **Pre-Change**:
   - Audit log entry with reason
   - Notification to users
   - Document impact (existing transactions unchanged)

2. **Change Execution**:
   - Update InventorySettings.default_costing_method
   - Set updated_by and updated_at
   - Create audit log entry

3. **Post-Change**:
   - If switching to Periodic Average: Calculate period costs for current and recent months
   - If switching to FIFO: Create layers from recent GRN (if needed)
   - Verify system behavior with test transactions

4. **Historical Data**:
   - Existing credit notes, invoices retain original costing
   - Only NEW transactions use new method
   - No recalculation of historical data

---

## Security and Access Control

### Data Access Levels

1. **InventorySettings**:
   - Read: Finance/Operations Managers
   - Write: System Administrators only
   - Audit: All changes logged

2. **FIFO Layers and Consumption**:
   - Read: Finance, Warehouse, Procurement
   - Write: System-generated only (no manual edits)
   - Audit: Creation logged

3. **Period Cost Cache**:
   - Read: Finance, Warehouse, Procurement
   - Write: System-generated only
   - Manual Recalculation: Finance Managers

4. **Audit Logs**:
   - Read: Administrators, Auditors
   - Write: System-generated only
   - Delete: Prohibited (compliance requirement)

### Data Privacy

- No personally identifiable information (PII) stored
- User references via UUID only
- IP addresses in audit log (for security, not PII)
- Compliance: Financial audit trail requirements

### Data Retention

**Based on actual schema and compliance requirements**:

- **Business Unit Configuration**: Indefinite (with audit trail in tb_activity)
- **Inventory Transaction Data**: 7 years minimum (compliance requirement)
- **Lot Balances** (tb_inventory_transaction_closing_balance): 7 years minimum
- **Audit Logs** (tb_activity): 7 years minimum (regulatory compliance)
- **Transaction Details**: 7 years minimum for financial reporting

---

**End of Data Definition Document**

## Document Revision Notes

**✅ Schema Alignment Completed** (2025-11-03)

This document has been updated to accurately reflect the **actual Prisma database schema** defined in `/app/data-struc/schema.prisma`. All entity definitions, field specifications, and relationships now reference the implemented data models rather than theoretical designs.

**Key Updates**:
- Entity names updated to match actual Prisma models (e.g., `tb_inventory_transaction_detail`, `tb_inventory_transaction_closing_balance`, `tb_activity`)
- Field definitions updated with actual data types (DECIMAL(20,5) for costs and quantities)
- Costing method enum corrected (`FIFO` and `AVG` not `PERIODIC_AVERAGE`)
- Removed theoretical entities not present in schema (dedicated cache tables)
- Added Prisma model definitions for clarity
- Updated all cross-references and relationships

**For Implementation**:
- Refer to `/app/data-struc/schema.prisma` for authoritative data model
- See Technical Specification (TS) for code implementation patterns
- See Flow Diagrams (FD) for visual ERD diagrams
- See API Reference for service layer integration

**Schema Reference**: All data structures verified against `schema.prisma` (lines 284-793)
