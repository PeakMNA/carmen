# Data Definition: Fractional Inventory Management

## Document Information
- **Module**: Inventory Management - Fractional Inventory
- **Component**: Fractional Inventory Management and Conversion Operations
- **Version**: 1.0.0
- **Last Updated**: 2025-01-12
- **Status**: Active - For Implementation

## Related Documents
- [Business Requirements](./BR-fractional-inventory.md)
- [Use Cases](./UC-fractional-inventory.md)
- [Technical Specification](./TS-fractional-inventory.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |


## 1. Overview

### 1.1 Purpose

This document defines the complete data schema for the Fractional Inventory Management sub-module, including database tables, relationships, JSONB structures, indexes, and data integrity constraints.

### 1.2 Database Technology

- **Primary Database**: PostgreSQL 14+
- **ORM**: Prisma 5.8+
- **Data Model Approach**: Relational with JSONB for flexible structures
- **Migration Strategy**: Prisma Migrations with phased rollout

### 1.3 Key Entities

1. **fractional_item** - Configuration for items supporting fractional tracking
2. **fractional_stock** - Current inventory state with multi-state tracking
3. **conversion_record** - Audit trail of conversion operations
4. **inventory_alert** - Smart alerts and recommendations
5. **conversion_recommendation** - AI-generated conversion suggestions

---

## 2. Database Tables

### 2.1 fractional_item

**Purpose**: Stores configuration for items that support fractional sales and conversions.

**Table Name**: `tb_fractional_item`

**Schema**:
```prisma
model FractionalItem {
  id                     String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  item_code              String   @unique @db.VarChar
  item_name              String   @db.VarChar
  category               String?  @db.VarChar

  // Base unit configuration
  base_unit              String   @default("Whole") @db.VarChar

  // Portion sizes (JSONB array)
  available_portions     Json     @db.Json  // PortionSize[]
  default_portion_id     String?  @db.VarChar

  // Quality parameters
  shelf_life_hours       Int      // Maximum hours after preparation
  max_quality_hours      Int      // Hours before degradation starts
  temperature_required   String?  @db.VarChar  // COLD, FROZEN, ROOM_TEMP

  // Conversion parameters
  expected_waste_percent Decimal  @default(0.00) @db.Decimal(5, 2)
  base_cost_per_unit     Decimal  @db.Decimal(10, 4)
  conversion_cost_per_unit Decimal  @default(0.00) @db.Decimal(10, 4)

  // Auto-conversion settings
  auto_conversion_enabled Boolean  @default(false)
  min_portion_threshold  Int?     // Trigger auto-conversion when below

  // Common fields
  info                   Json?    @db.Json
  dimension              Json?    @db.Json
  doc_version            Decimal  @default(0) @db.Decimal

  // System fields
  is_active              Boolean  @default(true)
  created_at             DateTime @default(now()) @db.Timestamptz(6)
  created_by_id          String?  @db.Uuid
  updated_at             DateTime @updatedAt @db.Timestamptz(6)
  updated_by_id          String?  @db.Uuid
  deleted_at             DateTime? @db.Timestamptz(6)
  deleted_by_id          String?  @db.Uuid

  // Relations
  stocks                 FractionalStock[]
  conversions            ConversionRecord[]
  alerts                 InventoryAlert[]
  recommendations        ConversionRecommendation[]

  @@map("tb_fractional_item")
  @@index([item_code])
  @@index([category])
  @@index([is_active])
}
```

**PortionSize JSONB Structure**:
```typescript
interface PortionSize {
  id: string;                    // UUID for portion size
  name: string;                  // "Slice", "Half", "Quarter", etc.
  portionsPerWhole: number;      // e.g., 8 slices per pizza
  displayOrder: number;          // For UI sorting
  isActive: boolean;             // Can be disabled without deleting
}

// Example:
{
  "id": "portion-123",
  "name": "Slice",
  "portionsPerWhole": 8,
  "displayOrder": 1,
  "isActive": true
}
```

**Field Descriptions**:
- **item_code**: Unique identifier matching product catalog
- **base_unit**: Display name for whole unit (e.g., "Whole Pizza", "Whole Cake")
- **available_portions**: Array of portion size configurations
- **shelf_life_hours**: Absolute maximum time before expiration (hard limit)
- **max_quality_hours**: Time before quality degradation begins (soft limit)
- **expected_waste_percent**: Expected waste during conversion (0-100)
- **base_cost_per_unit**: Cost per whole unit from inventory
- **conversion_cost_per_unit**: Additional labor/overhead cost per conversion operation
- **info**: Flexible JSONB field for additional metadata and custom attributes
- **dimension**: JSONB field for dimension tracking (consistent with other tables)
- **doc_version**: Document version number for change tracking

---

### 2.2 fractional_stock

**Purpose**: Tracks current inventory state with multi-state lifecycle tracking and quality monitoring.

**Table Name**: `tb_fractional_stock`

**Schema**:
```prisma
model FractionalStock {
  id                     String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  // Item reference
  item_code              String   @db.VarChar
  item                   FractionalItem @relation(fields: [item_code], references: [item_code], onDelete: Cascade)

  // Location tracking
  location_id            String   @db.Uuid

  // Multi-state tracking
  current_state          enum_fractional_state  @default(raw)
  state_transition_date  DateTime @db.Timestamptz(6)

  // Quantity tracking (synchronized)
  whole_units            Int      @default(0)
  partial_quantity       Decimal  @default(0.00) @db.Decimal(10, 4)
  total_portions         Decimal  @default(0.00) @db.Decimal(10, 4)
  reserved_portions      Decimal  @default(0.00) @db.Decimal(10, 4)
  available_portions     Decimal  @default(0.00) @db.Decimal(10, 4)

  // Original quantities (for variance analysis)
  original_whole_units   Int
  original_total_portions Decimal  @db.Decimal(10, 4)

  // Quality tracking
  quality_grade          enum_quality_grade @default(excellent)
  quality_updated_at     DateTime @default(now()) @db.Timestamptz(6)
  expiry_date            DateTime? @db.Timestamptz(6)
  prepared_at            DateTime? @db.Timestamptz(6)

  // Conversion tracking
  last_conversion_id     String?  @db.Uuid
  last_conversion_date   DateTime? @db.Timestamptz(6)
  last_conversion_type   String?  @db.VarChar  // SPLIT, COMBINE, PREPARE, PORTION

  // Alert flags
  has_quality_alert      Boolean  @default(false)
  has_quantity_alert     Boolean  @default(false)
  has_expiry_alert       Boolean  @default(false)

  // Common fields
  info                   Json?    @db.Json
  dimension              Json?    @db.Json
  doc_version            Decimal  @default(0) @db.Decimal

  // System fields
  created_at             DateTime @default(now()) @db.Timestamptz(6)
  created_by_id          String?  @db.Uuid
  updated_at             DateTime @updatedAt @db.Timestamptz(6)
  updated_by_id          String?  @db.Uuid
  deleted_at             DateTime? @db.Timestamptz(6)
  deleted_by_id          String?  @db.Uuid

  // Relations
  conversions            ConversionRecord[]
  alerts                 InventoryAlert[]

  @@map("tb_fractional_stock")
  @@index([item_code, location_id])
  @@index([current_state])
  @@index([quality_grade])
  @@index([location_id])
  @@index([expiry_date])
  @@index([has_quality_alert, has_quantity_alert, has_expiry_alert])
}

enum enum_fractional_state {
  raw         // Original whole items in initial state
  prepared    // Items prepared/processed but not portioned
  portioned   // Items divided into sellable portions
  partial     // Partially consumed with remaining portions
  combined    // Portions combined back into bulk
  waste       // Marked as waste (quality or other reasons)
}

enum enum_quality_grade {
  excellent   // Within max_quality_hours, perfect condition
  good        // After max_quality_hours, before 75% shelf life
  fair        // 75-90% of shelf life elapsed
  poor        // 90-100% of shelf life elapsed
  expired     // Past shelf life hours
}
```

**Field Descriptions**:
- **whole_units**: Count of intact whole items
- **partial_quantity**: Fractional portion of incomplete whole unit (0.00-0.99)
- **total_portions**: Total portions calculated from whole units + partial
- **reserved_portions**: Portions allocated to orders but not fulfilled
- **available_portions**: Portions available for sale (total - reserved)
- **original_whole_units**: Starting quantity for variance tracking
- **prepared_at**: Timestamp when item was prepared (starts quality timer)
- **expiry_date**: Calculated as prepared_at + shelf_life_hours
- **info**: Flexible JSONB field for additional metadata and custom attributes
- **dimension**: JSONB field for dimension tracking (consistent with other tables)
- **doc_version**: Document version number for change tracking

**State Transition Rules**:
- RAW → PREPARED → PORTIONED → PARTIAL → WASTE
- RAW → PORTIONED (direct portioning)
- PORTIONED → COMBINED (re-combining portions)
- Any state → WASTE (manual marking)

**Quality Grade Calculation**:
```typescript
// Pseudocode for quality grade calculation
function calculateQualityGrade(
  preparedAt: Date,
  maxQualityHours: number,
  shelfLifeHours: number
): QualityGrade {
  const now = new Date();
  const hoursElapsed = (now - preparedAt) / (1000 * 60 * 60);

  if (hoursElapsed > shelfLifeHours) {
    return 'EXPIRED';
  }

  if (hoursElapsed <= maxQualityHours) {
    return 'EXCELLENT';
  }

  const shelfLifePercent = hoursElapsed / shelfLifeHours;

  if (shelfLifePercent <= 0.75) {
    return 'GOOD';
  } else if (shelfLifePercent <= 0.90) {
    return 'FAIR';
  } else {
    return 'POOR';
  }
}
```

---

### 2.3 conversion_record

**Purpose**: Immutable audit trail of all conversion operations (split, combine, prepare, portion).

**Table Name**: `tb_conversion_record`

**Schema**:
```prisma
model ConversionRecord {
  id                     String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  // Item and stock references
  item_code              String   @db.VarChar
  item                   FractionalItem @relation(fields: [item_code], references: [item_code])
  stock_id               String   @db.Uuid
  stock                  FractionalStock @relation(fields: [stock_id], references: [id])

  // Conversion details
  conversion_type        enum_conversion_type
  performed_at           DateTime @default(now()) @db.Timestamptz(6)
  performed_by_id        String   @db.Uuid
  location_id            String   @db.Uuid

  // Before state
  before_state           enum_fractional_state
  before_whole_units     Int
  before_partial_qty     Decimal  @db.Decimal(10, 4)
  before_total_portions  Decimal  @db.Decimal(10, 4)
  before_quality_grade   enum_quality_grade

  // After state
  after_state            enum_fractional_state
  after_whole_units      Int
  after_partial_qty      Decimal  @db.Decimal(10, 4)
  after_total_portions   Decimal  @db.Decimal(10, 4)
  after_quality_grade    enum_quality_grade

  // Conversion calculations
  units_converted        Int      // Whole units involved
  portions_created       Decimal  @db.Decimal(10, 4)
  expected_portions      Decimal  @db.Decimal(10, 4)
  waste_generated        Decimal  @db.Decimal(10, 4)
  conversion_efficiency  Decimal  @db.Decimal(5, 2)  // Percentage
  conversion_cost        Decimal  @db.Decimal(10, 2)

  // Portion size (for SPLIT operations)
  portion_size_id        String?  @db.VarChar
  portion_size_name      String?  @db.VarChar
  portions_per_whole     Int?

  // Quality impact
  quality_impact         String?  @db.VarChar  // NONE, MINOR, MODERATE, SEVERE
  quality_notes          String?  @db.VarChar

  // Business context
  reason                 String   @db.VarChar
  notes                  String?  @db.VarChar

  // Validation
  is_validated           Boolean  @default(false)
  validated_at           DateTime? @db.Timestamptz(6)
  validated_by_id        String?  @db.Uuid
  validation_notes       String?  @db.VarChar

  // Common fields
  info                   Json?    @db.Json
  dimension              Json?    @db.Json
  doc_version            Decimal  @default(0) @db.Decimal

  // System fields
  created_at             DateTime @default(now()) @db.Timestamptz(6)
  created_by_id          String?  @db.Uuid

  @@map("tb_conversion_record")
  @@index([item_code, performed_at])
  @@index([stock_id])
  @@index([conversion_type])
  @@index([performed_at])
  @@index([performed_by_id])
  @@index([location_id])
}

enum enum_conversion_type {
  split     // Whole → Portions
  combine   // Portions → Whole or bulk
  prepare   // RAW → PREPARED
  portion   // PREPARED → PORTIONED
}
```

**Conversion Efficiency Calculation**:
```typescript
// Efficiency = (Actual Portions Created / Expected Portions) * 100
conversionEfficiency = (portionsCreated / expectedPortions) * 100

// Example: Split 1 pizza into 8 slices
// Expected: 1 pizza * 8 slices/pizza = 8 slices
// Actual: 7.5 slices (0.5 slices wasted)
// Efficiency: (7.5 / 8) * 100 = 93.75%
```

**Field Descriptions**:
- **unitsConverted**: Number of whole units converted in this operation
- **portionsCreated**: Actual portions resulting from conversion
- **expectedPortions**: Theoretical portions based on portionsPerWhole
- **wasteGenerated**: Difference between expected and actual (in portions)
- **conversionEfficiency**: Percentage of expected yield achieved
- **conversionCost**: Labor and overhead cost for this operation

---

### 2.4 inventory_alert

**Purpose**: Smart alerts for quality degradation, low portions, and conversion recommendations.

**Table Name**: `tb_inventory_alert`

**Schema**:
```prisma
model InventoryAlert {
  id                     String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  // Alert target
  item_code              String   @db.VarChar
  item                   FractionalItem @relation(fields: [item_code], references: [item_code])
  stock_id               String?  @db.Uuid
  stock                  FractionalStock? @relation(fields: [stock_id], references: [id])
  location_id            String   @db.Uuid

  // Alert classification
  alert_type             enum_alert_type
  severity               enum_alert_severity

  // Alert content
  title                  String   @db.VarChar
  message                String   @db.VarChar

  // Recommended actions (JSONB array)
  recommended_actions    Json?    @db.Json  // RecommendedAction[]

  // Alert context
  context_data           Json?    @db.Json  // Additional data specific to alert type

  // Alert lifecycle
  status                 enum_alert_status @default(active)
  triggered_at           DateTime @default(now()) @db.Timestamptz(6)
  acknowledged_at        DateTime? @db.Timestamptz(6)
  acknowledged_by_id     String?  @db.Uuid
  resolved_at            DateTime? @db.Timestamptz(6)
  resolved_by_id         String?  @db.Uuid
  dismissed_at           DateTime? @db.Timestamptz(6)
  dismissed_by_id        String?  @db.Uuid

  // Auto-resolution
  auto_resolve_at        DateTime? @db.Timestamptz(6)

  // Common fields
  info                   Json?    @db.Json
  dimension              Json?    @db.Json
  doc_version            Decimal  @default(0) @db.Decimal

  // System fields
  created_at             DateTime @default(now()) @db.Timestamptz(6)
  created_by_id          String?  @db.Uuid
  updated_at             DateTime @updatedAt @db.Timestamptz(6)
  updated_by_id          String?  @db.Uuid

  @@map("tb_inventory_alert")
  @@index([item_code, status])
  @@index([alert_type, severity])
  @@index([location_id, status])
  @@index([triggered_at])
}

enum enum_alert_type {
  quality_degrading      // Quality dropping below threshold
  portion_low            // Portions running low
  expiry_warning         // Approaching expiration
  conversion_optimal     // Good time to convert
  waste_high             // Waste percentage high
  reserved_high          // High reserved portions (fulfill orders)
  quality_poor           // Quality grade POOR or EXPIRED
}

enum enum_alert_severity {
  low       // Informational, no immediate action
  medium    // Should address within shift
  high      // Immediate attention needed
  critical  // Urgent action required (expiry, health hazard)
}

enum enum_alert_status {
  active        // Currently active
  acknowledged  // User has seen but not resolved
  resolved      // Issue resolved
  dismissed     // User dismissed without action
  auto_resolved // System auto-resolved
}
```

**RecommendedAction JSONB Structure**:
```typescript
interface RecommendedAction {
  actionType: string;           // "SPLIT", "COMBINE", "MARK_WASTE", "FULFILL_ORDERS"
  actionLabel: string;          // "Convert 2 whole pizzas to slices"
  priority: number;             // 1 (highest) to 5 (lowest)
  estimatedTime: number;        // Minutes
  estimatedCost?: number;       // Optional cost estimate
  parameters?: Record<string, any>;  // Action-specific parameters
}

// Example:
{
  "actionType": "SPLIT",
  "actionLabel": "Convert 2 whole pizzas to slices",
  "priority": 1,
  "estimatedTime": 10,
  "estimatedCost": 5.00,
  "parameters": {
    "unitsToConvert": 2,
    "portionSizeId": "portion-123",
    "portionSizeName": "Slice"
  }
}
```

**Alert Context Data Examples**:

**Quality Degrading Alert**:
```json
{
  "currentQuality": "GOOD",
  "nextQuality": "FAIR",
  "hoursUntilNextGrade": 4.5,
  "currentShelfLifePercent": 65,
  "expiryDate": "2025-01-13T18:00:00Z"
}
```

**Portion Low Alert**:
```json
{
  "currentPortions": 3.5,
  "reservedPortions": 2.0,
  "availablePortions": 1.5,
  "minThreshold": 5,
  "dailyAverageSales": 12,
  "hoursUntilStockout": 2.3
}
```

---

### 2.5 conversion_recommendation

**Purpose**: AI-generated recommendations for optimal conversion timing based on demand patterns.

**Table Name**: `tb_conversion_recommendation`

**Schema**:
```prisma
model ConversionRecommendation {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  // Target item
  item_code               String   @db.VarChar
  item                    FractionalItem @relation(fields: [item_code], references: [item_code])
  location_id             String   @db.Uuid

  // Recommendation details
  recommendation_type     String   @db.VarChar  // "SPLIT", "COMBINE", "PREPARE"
  recommended_action      String   @db.VarChar  // Human-readable action

  // Recommendation scoring
  confidence_score        Decimal  @db.Decimal(5, 2)  // 0-100
  priority_score          Int      // 1 (highest) to 10 (lowest)

  // Conversion parameters
  recommended_units       Int
  recommended_portion_id  String?  @db.VarChar
  expected_yield          Decimal  @db.Decimal(10, 4)
  estimated_waste         Decimal  @db.Decimal(10, 4)
  estimated_cost          Decimal  @db.Decimal(10, 2)
  estimated_revenue       Decimal  @db.Decimal(10, 2)

  // Demand analysis (JSONB)
  demand_analysis         Json     @db.Json  // DemandAnalysis

  // Timing
  optimal_conversion_time DateTime @db.Timestamptz(6)
  valid_until             DateTime @db.Timestamptz(6)

  // Recommendation lifecycle
  status                  enum_recommendation_status @default(pending)
  generated_at            DateTime @default(now()) @db.Timestamptz(6)
  accepted_at             DateTime? @db.Timestamptz(6)
  accepted_by_id          String?  @db.Uuid
  rejected_at             DateTime? @db.Timestamptz(6)
  rejected_by_id          String?  @db.Uuid
  expired_at              DateTime? @db.Timestamptz(6)

  // Outcome tracking
  was_actioned            Boolean  @default(false)
  conversion_record_id    String?  @db.Uuid
  actual_efficiency       Decimal? @db.Decimal(5, 2)
  actual_waste            Decimal? @db.Decimal(10, 4)

  // Common fields
  info                    Json?    @db.Json
  dimension               Json?    @db.Json
  doc_version             Decimal  @default(0) @db.Decimal

  // System fields
  created_at              DateTime @default(now()) @db.Timestamptz(6)
  created_by_id           String?  @db.Uuid
  updated_at              DateTime @updatedAt @db.Timestamptz(6)
  updated_by_id           String?  @db.Uuid

  @@map("tb_conversion_recommendation")
  @@index([item_code, location_id, status])
  @@index([optimal_conversion_time])
  @@index([priority_score])
}

enum enum_recommendation_status {
  pending     // Awaiting user action
  accepted    // User accepted and will action
  rejected    // User rejected recommendation
  expired     // Recommendation validity period passed
  actioned    // Conversion performed
}
```

**DemandAnalysis JSONB Structure**:
```typescript
interface DemandAnalysis {
  forecastPeriodHours: number;       // How far ahead forecast covers
  predictedDemand: number;           // Expected portions needed
  currentAvailability: number;       // Portions currently available
  gap: number;                       // Demand - availability
  historicalAverageSales: number;    // Daily average portions sold
  recentTrend: string;               // "INCREASING", "STABLE", "DECREASING"
  dayOfWeek: string;                 // "MONDAY", "TUESDAY", etc.
  timeOfDay: string;                 // "BREAKFAST", "LUNCH", "DINNER"
  seasonalFactor: number;            // 0.5 (low season) to 2.0 (high season)
}

// Example:
{
  "forecastPeriodHours": 8,
  "predictedDemand": 24,
  "currentAvailability": 8,
  "gap": 16,
  "historicalAverageSales": 18,
  "recentTrend": "INCREASING",
  "dayOfWeek": "FRIDAY",
  "timeOfDay": "DINNER",
  "seasonalFactor": 1.2
}
```

---

## 3. Database Relationships

### 3.1 Entity Relationship Diagram

```
┌─────────────────────┐
│  fractional_item    │
│  (Configuration)    │
└──────────┬──────────┘
           │
           │ 1:N
           ↓
┌─────────────────────┐
│  fractional_stock   │
│  (Current State)    │
└──────────┬──────────┘
           │
           │ 1:N
           ↓
┌─────────────────────┐          ┌─────────────────────┐
│ conversion_record   │          │  inventory_alert    │
│  (Audit Trail)      │          │  (Smart Alerts)     │
└─────────────────────┘          └─────────────────────┘
           ↑                               ↑
           │                               │
           │ N:1                           │ N:1
           │                               │
┌─────────────────────┐          ┌─────────────────────┐
│conversion_recommend │←─────────┤  fractional_item    │
│ (AI Recommendations)│          └─────────────────────┘
└─────────────────────┘
```

### 3.2 Relationship Descriptions

**fractional_item → fractional_stock** (1:N)
- One item configuration can have multiple stock records (different locations, batches)
- Cascade delete: When item deleted, all stock records deleted
- Foreign key: `fractional_stock.item_code` → `fractional_item.item_code`

**fractional_stock → conversion_record** (1:N)
- One stock record can have multiple conversion operations over time
- No cascade: Conversion records preserved for audit even if stock deleted
- Foreign key: `conversion_record.stock_id` → `fractional_stock.id`

**fractional_item → conversion_record** (1:N)
- Item configuration referenced for conversion calculations
- No cascade: Conversion records preserved for audit
- Foreign key: `conversion_record.item_code` → `fractional_item.item_code`

**fractional_item → inventory_alert** (1:N)
- Item can have multiple active alerts
- Cascade delete: Alerts deleted when item deleted
- Foreign key: `inventory_alert.item_code` → `fractional_item.item_code`

**fractional_stock → inventory_alert** (1:N, optional)
- Alert can reference specific stock record
- Set null on delete: Alert remains if stock deleted
- Foreign key: `inventory_alert.stock_id` → `fractional_stock.id`

**fractional_item → conversion_recommendation** (1:N)
- Item can have multiple recommendations
- Cascade delete: Recommendations deleted when item deleted
- Foreign key: `conversion_recommendation.item_code` → `fractional_item.item_code`

---

## 4. Database Indexes

### 4.1 Performance Indexes

**fractional_item**:
```sql
-- Primary key index (automatic)
CREATE INDEX idx_fractional_item_pk ON tb_fractional_item(id);

-- Business key index
CREATE UNIQUE INDEX idx_fractional_item_code ON tb_fractional_item(item_code);

-- Query optimization indexes
CREATE INDEX idx_fractional_item_category ON tb_fractional_item(category);
CREATE INDEX idx_fractional_item_active ON tb_fractional_item(is_active);
```

**fractional_stock**:
```sql
-- Primary key index (automatic)
CREATE INDEX idx_fractional_stock_pk ON tb_fractional_stock(id);

-- Composite index for location-based queries
CREATE INDEX idx_fractional_stock_item_location
  ON tb_fractional_stock(item_code, location_id);

-- State and quality filtering
CREATE INDEX idx_fractional_stock_state ON tb_fractional_stock(current_state);
CREATE INDEX idx_fractional_stock_quality ON tb_fractional_stock(quality_grade);
CREATE INDEX idx_fractional_stock_location ON tb_fractional_stock(location_id);

-- Expiry monitoring
CREATE INDEX idx_fractional_stock_expiry ON tb_fractional_stock(expiry_date)
  WHERE expiry_date IS NOT NULL;

-- Alert flag filtering (composite for efficiency)
CREATE INDEX idx_fractional_stock_alerts
  ON tb_fractional_stock(has_quality_alert, has_quantity_alert, has_expiry_alert)
  WHERE has_quality_alert = true
     OR has_quantity_alert = true
     OR has_expiry_alert = true;
```

**conversion_record**:
```sql
-- Primary key index (automatic)
CREATE INDEX idx_conversion_record_pk ON tb_conversion_record(id);

-- Audit trail queries
CREATE INDEX idx_conversion_record_item_date
  ON tb_conversion_record(item_code, performed_at DESC);

-- Stock history
CREATE INDEX idx_conversion_record_stock ON tb_conversion_record(stock_id);

-- Type filtering
CREATE INDEX idx_conversion_record_type ON tb_conversion_record(conversion_type);

-- Time-based queries
CREATE INDEX idx_conversion_record_date ON tb_conversion_record(performed_at DESC);

-- User activity tracking
CREATE INDEX idx_conversion_record_user ON tb_conversion_record(performed_by_id);

-- Location-based reporting
CREATE INDEX idx_conversion_record_location ON tb_conversion_record(location_id);
```

**inventory_alert**:
```sql
-- Primary key index (automatic)
CREATE INDEX idx_inventory_alert_pk ON tb_inventory_alert(id);

-- Active alerts dashboard
CREATE INDEX idx_inventory_alert_item_status
  ON tb_inventory_alert(item_code, status)
  WHERE status = 'active';

-- Alert type and severity filtering
CREATE INDEX idx_inventory_alert_type_severity
  ON tb_inventory_alert(alert_type, severity);

-- Location-based active alerts
CREATE INDEX idx_inventory_alert_location_status
  ON tb_inventory_alert(location_id, status)
  WHERE status IN ('active', 'acknowledged');

-- Time-based queries
CREATE INDEX idx_inventory_alert_triggered ON tb_inventory_alert(triggered_at DESC);
```

**conversion_recommendation**:
```sql
-- Primary key index (automatic)
CREATE INDEX idx_conversion_recommendation_pk ON tb_conversion_recommendation(id);

-- Pending recommendations by location
CREATE INDEX idx_conversion_recommendation_item_location
  ON tb_conversion_recommendation(item_code, location_id, status)
  WHERE status = 'pending';

-- Optimal timing queries
CREATE INDEX idx_conversion_recommendation_timing
  ON tb_conversion_recommendation(optimal_conversion_time);

-- Priority sorting
CREATE INDEX idx_conversion_recommendation_priority
  ON tb_conversion_recommendation(priority_score);
```

### 4.2 Index Usage Guidelines

**Query Optimization Patterns**:
1. Always filter by `location_id` for multi-tenant isolation
2. Use composite indexes for common filter combinations
3. Partial indexes for frequently filtered states (active alerts, pending recommendations)
4. DESC indexes for time-based queries (recent conversions, latest alerts)

**Index Maintenance**:
- Monitor index bloat monthly
- Rebuild indexes quarterly or when bloat >20%
- Analyze slow queries weekly and add indexes as needed
- Remove unused indexes to reduce write overhead

---

## 5. Data Integrity Constraints

### 5.1 Primary Key Constraints

All tables use UUID primary keys:
```sql
ALTER TABLE tb_fractional_item ADD PRIMARY KEY (id);
ALTER TABLE tb_fractional_stock ADD PRIMARY KEY (id);
ALTER TABLE tb_conversion_record ADD PRIMARY KEY (id);
ALTER TABLE tb_inventory_alert ADD PRIMARY KEY (id);
ALTER TABLE tb_conversion_recommendation ADD PRIMARY KEY (id);
```

### 5.2 Foreign Key Constraints

```sql
-- fractional_stock → fractional_item
ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT fk_fractional_stock_item
  FOREIGN KEY (item_code)
  REFERENCES tb_fractional_item(item_code)
  ON DELETE CASCADE;

-- conversion_record → fractional_item
ALTER TABLE tb_conversion_record
  ADD CONSTRAINT fk_conversion_record_item
  FOREIGN KEY (item_code)
  REFERENCES tb_fractional_item(item_code)
  ON DELETE RESTRICT;  -- Keep audit trail

-- conversion_record → fractional_stock
ALTER TABLE tb_conversion_record
  ADD CONSTRAINT fk_conversion_record_stock
  FOREIGN KEY (stock_id)
  REFERENCES tb_fractional_stock(id)
  ON DELETE RESTRICT;  -- Keep audit trail

-- inventory_alert → fractional_item
ALTER TABLE tb_inventory_alert
  ADD CONSTRAINT fk_inventory_alert_item
  FOREIGN KEY (item_code)
  REFERENCES tb_fractional_item(item_code)
  ON DELETE CASCADE;

-- inventory_alert → fractional_stock (optional)
ALTER TABLE tb_inventory_alert
  ADD CONSTRAINT fk_inventory_alert_stock
  FOREIGN KEY (stock_id)
  REFERENCES tb_fractional_stock(id)
  ON DELETE SET NULL;

-- conversion_recommendation → fractional_item
ALTER TABLE tb_conversion_recommendation
  ADD CONSTRAINT fk_conversion_recommendation_item
  FOREIGN KEY (item_code)
  REFERENCES tb_fractional_item(item_code)
  ON DELETE CASCADE;
```

### 5.3 Unique Constraints

```sql
-- Unique item code
ALTER TABLE tb_fractional_item
  ADD CONSTRAINT uq_fractional_item_code
  UNIQUE (item_code);

-- Unique stock per item and location (business rule)
ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT uq_fractional_stock_item_location
  UNIQUE (item_code, location_id)
  WHERE deleted_at IS NULL;
```

### 5.4 Check Constraints

```sql
-- Positive quantities
ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fractional_stock_whole_units
  CHECK (whole_units >= 0);

ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fractional_stock_partial_qty
  CHECK (partial_quantity >= 0.00 AND partial_quantity < 1.00);

ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fractional_stock_total_portions
  CHECK (total_portions >= 0.00);

ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fractional_stock_reserved_portions
  CHECK (reserved_portions >= 0.00);

-- Available portions cannot exceed total
ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fractional_stock_available
  CHECK (available_portions <= total_portions);

-- Reserved portions cannot exceed total
ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fractional_stock_reserved
  CHECK (reserved_portions <= total_portions);

-- Waste percentage between 0 and 100
ALTER TABLE tb_fractional_item
  ADD CONSTRAINT chk_fractional_item_waste_percent
  CHECK (expected_waste_percent >= 0.00 AND expected_waste_percent <= 100.00);

-- Shelf life hours positive
ALTER TABLE tb_fractional_item
  ADD CONSTRAINT chk_fractional_item_shelf_life
  CHECK (shelf_life_hours > 0);

-- Max quality hours positive and less than shelf life
ALTER TABLE tb_fractional_item
  ADD CONSTRAINT chk_fractional_item_max_quality
  CHECK (max_quality_hours > 0 AND max_quality_hours <= shelf_life_hours);

-- Conversion efficiency between 0 and 150% (allow over-yield)
ALTER TABLE tb_conversion_record
  ADD CONSTRAINT chk_conversion_record_efficiency
  CHECK (conversion_efficiency >= 0.00 AND conversion_efficiency <= 150.00);

-- Confidence score between 0 and 100
ALTER TABLE tb_conversion_recommendation
  ADD CONSTRAINT chk_conversion_recommendation_confidence
  CHECK (confidence_score >= 0.00 AND confidence_score <= 100.00);

-- Priority score between 1 and 10
ALTER TABLE tb_conversion_recommendation
  ADD CONSTRAINT chk_conversion_recommendation_priority
  CHECK (priority_score >= 1 AND priority_score <= 10);
```

### 5.5 NOT NULL Constraints

**fractional_item** (critical fields):
```sql
ALTER TABLE tb_fractional_item ALTER COLUMN item_code SET NOT NULL;
ALTER TABLE tb_fractional_item ALTER COLUMN item_name SET NOT NULL;
ALTER TABLE tb_fractional_item ALTER COLUMN base_unit SET NOT NULL;
ALTER TABLE tb_fractional_item ALTER COLUMN available_portions SET NOT NULL;
ALTER TABLE tb_fractional_item ALTER COLUMN shelf_life_hours SET NOT NULL;
ALTER TABLE tb_fractional_item ALTER COLUMN max_quality_hours SET NOT NULL;
ALTER TABLE tb_fractional_item ALTER COLUMN base_cost_per_unit SET NOT NULL;
```

**fractional_stock** (critical fields):
```sql
ALTER TABLE tb_fractional_stock ALTER COLUMN item_code SET NOT NULL;
ALTER TABLE tb_fractional_stock ALTER COLUMN location_id SET NOT NULL;
ALTER TABLE tb_fractional_stock ALTER COLUMN current_state SET NOT NULL;
ALTER TABLE tb_fractional_stock ALTER COLUMN state_transition_date SET NOT NULL;
ALTER TABLE tb_fractional_stock ALTER COLUMN quality_grade SET NOT NULL;
```

**conversion_record** (audit trail):
```sql
ALTER TABLE tb_conversion_record ALTER COLUMN item_code SET NOT NULL;
ALTER TABLE tb_conversion_record ALTER COLUMN stock_id SET NOT NULL;
ALTER TABLE tb_conversion_record ALTER COLUMN conversion_type SET NOT NULL;
ALTER TABLE tb_conversion_record ALTER COLUMN performed_by_id SET NOT NULL;
ALTER TABLE tb_conversion_record ALTER COLUMN reason SET NOT NULL;
```

---

## 6. Database Triggers

### 6.1 Quality Update Trigger

**Purpose**: Automatically update quality grade when stock is queried.

```sql
CREATE OR REPLACE FUNCTION update_quality_grade()
RETURNS TRIGGER AS $$
DECLARE
  hours_elapsed NUMERIC;
  shelf_life_hours INT;
  max_quality_hours INT;
  shelf_life_percent NUMERIC;
BEGIN
  -- Only update if prepared_at is set
  IF NEW.prepared_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get item configuration
  SELECT shelf_life_hours, max_quality_hours
  INTO shelf_life_hours, max_quality_hours
  FROM tb_fractional_item
  WHERE item_code = NEW.item_code;

  -- Calculate hours elapsed
  hours_elapsed := EXTRACT(EPOCH FROM (NOW() - NEW.prepared_at)) / 3600;

  -- Update quality grade
  IF hours_elapsed > shelf_life_hours THEN
    NEW.quality_grade := 'expired';
  ELSIF hours_elapsed <= max_quality_hours THEN
    NEW.quality_grade := 'excellent';
  ELSE
    shelf_life_percent := hours_elapsed / shelf_life_hours;
    IF shelf_life_percent <= 0.75 THEN
      NEW.quality_grade := 'good';
    ELSIF shelf_life_percent <= 0.90 THEN
      NEW.quality_grade := 'fair';
    ELSE
      NEW.quality_grade := 'poor';
    END IF;
  END IF;

  NEW.quality_updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_quality_grade
BEFORE UPDATE ON tb_fractional_stock
FOR EACH ROW
WHEN (OLD.quality_grade IS DISTINCT FROM NEW.quality_grade OR
      OLD.prepared_at IS DISTINCT FROM NEW.prepared_at)
EXECUTE FUNCTION update_quality_grade();
```

### 6.2 Available Portions Calculation Trigger

**Purpose**: Automatically calculate available_portions when total_portions or reserved_portions change.

```sql
CREATE OR REPLACE FUNCTION calculate_available_portions()
RETURNS TRIGGER AS $$
BEGIN
  NEW.available_portions := NEW.total_portions - NEW.reserved_portions;

  -- Ensure non-negative
  IF NEW.available_portions < 0 THEN
    NEW.available_portions := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_available_portions
BEFORE INSERT OR UPDATE OF total_portions, reserved_portions ON tb_fractional_stock
FOR EACH ROW
EXECUTE FUNCTION calculate_available_portions();
```

### 6.3 Expiry Date Calculation Trigger

**Purpose**: Automatically calculate expiry_date when prepared_at changes.

```sql
CREATE OR REPLACE FUNCTION calculate_expiry_date()
RETURNS TRIGGER AS $$
DECLARE
  shelf_life_hours INT;
BEGIN
  -- Only calculate if prepared_at is set
  IF NEW.prepared_at IS NULL THEN
    NEW.expiry_date := NULL;
    RETURN NEW;
  END IF;

  -- Get shelf life from item configuration
  SELECT shelf_life_hours
  INTO shelf_life_hours
  FROM tb_fractional_item
  WHERE item_code = NEW.item_code;

  -- Calculate expiry date
  NEW.expiry_date := NEW.prepared_at + (shelf_life_hours || ' hours')::INTERVAL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_expiry_date
BEFORE INSERT OR UPDATE OF prepared_at ON tb_fractional_stock
FOR EACH ROW
WHEN (NEW.prepared_at IS NOT NULL)
EXECUTE FUNCTION calculate_expiry_date();
```

---

## 7. Migration Strategy

### 7.1 Phased Rollout Plan

**Phase 1: Core Tables (Week 1)**
- Create `fractional_item` table
- Create `fractional_stock` table
- Create basic indexes
- Add foreign key constraints
- Test basic CRUD operations

**Phase 2: Conversion Tracking (Week 2)**
- Create `conversion_record` table
- Add conversion-related indexes
- Implement conversion triggers
- Test conversion operations

**Phase 3: Alert System (Week 3)**
- Create `inventory_alert` table
- Create `conversion_recommendation` table
- Add alert-related indexes
- Implement background jobs for alert generation

**Phase 4: Optimization (Week 4)**
- Add performance indexes
- Implement database triggers
- Add check constraints
- Performance testing and tuning

### 7.2 Data Migration Scripts

**Sample Prisma Migration**:
```prisma
// prisma/migrations/20250112_fractional_inventory/migration.sql

-- Create enum types
CREATE TYPE "FractionalState" AS ENUM ('RAW', 'PREPARED', 'PORTIONED', 'PARTIAL', 'COMBINED', 'WASTE');
CREATE TYPE "QualityGrade" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'EXPIRED');
CREATE TYPE "ConversionType" AS ENUM ('SPLIT', 'COMBINE', 'PREPARE', 'PORTION');
CREATE TYPE "AlertType" AS ENUM ('QUALITY_DEGRADING', 'PORTION_LOW', 'EXPIRY_WARNING', 'CONVERSION_OPTIMAL', 'WASTE_HIGH', 'RESERVED_HIGH', 'QUALITY_POOR');
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED', 'AUTO_RESOLVED');
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'ACTIONED');

-- Create tables (full DDL provided in previous sections)

-- Create indexes
-- (All indexes as specified in section 4.1)

-- Create triggers
-- (All triggers as specified in section 6)

-- Create constraints
-- (All constraints as specified in section 5)
```

### 7.3 Seed Data

**Sample Seed Script**:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFractionalInventory() {
  // Create fractional items
  const pizzaItem = await prisma.fractionalItem.create({
    data: {
      itemCode: 'PIZZA-MARGHERITA',
      itemName: 'Margherita Pizza',
      category: 'Pizza',
      baseUnit: 'Whole Pizza',
      availablePortions: [
        { id: 'slice', name: 'Slice', portionsPerWhole: 8, displayOrder: 1, isActive: true },
        { id: 'half', name: 'Half Pizza', portionsPerWhole: 2, displayOrder: 2, isActive: true },
        { id: 'quarter', name: 'Quarter Pizza', portionsPerWhole: 4, displayOrder: 3, isActive: true }
      ],
      defaultPortionId: 'slice',
      shelfLifeHours: 24,
      maxQualityHours: 4,
      temperatureRequired: 'COLD',
      expectedWastePercent: 5.00,
      baseCostPerUnit: 8.50,
      conversionCostPerUnit: 0.50,
      autoConversionEnabled: true,
      minPortionThreshold: 10
    }
  });

  // Create initial stock
  await prisma.fractionalStock.create({
    data: {
      itemCode: 'PIZZA-MARGHERITA',
      locationId: 'location-001',
      currentState: 'PREPARED',
      stateTransitionDate: new Date(),
      wholeUnits: 5,
      partialQuantity: 0.00,
      totalPortions: 40.00,
      reservedPortions: 0.00,
      availablePortions: 40.00,
      originalWholeUnits: 5,
      originalTotalPortions: 40.00,
      qualityGrade: 'EXCELLENT',
      preparedAt: new Date()
    }
  });

  console.log('Fractional inventory seed data created');
}

seedFractionalInventory()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 8. Query Optimization Guidelines

### 8.1 Common Query Patterns

**Dashboard Stock List**:
```typescript
// Optimized query with selective includes
const stocks = await prisma.fractionalStock.findMany({
  where: {
    locationId: userLocationId,
    currentState: { in: ['PREPARED', 'PORTIONED', 'PARTIAL'] },
    deletedAt: null
  },
  include: {
    item: {
      select: {
        itemCode: true,
        itemName: true,
        category: true,
        baseUnit: true,
        availablePortions: true,
        shelfLifeHours: true,
        maxQualityHours: true
      }
    }
  },
  orderBy: { updatedAt: 'desc' },
  take: 100
});
```

**Active Alerts**:
```typescript
// Use composite index for efficient filtering
const alerts = await prisma.inventoryAlert.findMany({
  where: {
    locationId: userLocationId,
    status: 'ACTIVE',
    severity: { in: ['HIGH', 'CRITICAL'] }
  },
  include: {
    item: {
      select: { itemCode: true, itemName: true }
    },
    stock: {
      select: { currentState: true, qualityGrade: true, availablePortions: true }
    }
  },
  orderBy: [
    { severity: 'desc' },
    { triggeredAt: 'desc' }
  ]
});
```

**Conversion History**:
```typescript
// Efficient time-based pagination
const conversions = await prisma.conversionRecord.findMany({
  where: {
    itemCode: itemCode,
    performedAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }
  },
  orderBy: { performedAt: 'desc' },
  take: 50,
  skip: page * 50
});
```

### 8.2 Performance Best Practices

1. **Always filter by locationId** for multi-tenant isolation
2. **Use selective includes** - only fetch required fields
3. **Paginate large result sets** - use `take` and `skip`
4. **Use composite indexes** for multi-column filters
5. **Avoid N+1 queries** - use `include` instead of separate queries
6. **Cache frequently accessed data** - item configurations, portion sizes
7. **Use partial indexes** for frequently filtered states
8. **Monitor slow queries** - add indexes for queries >100ms

---

## Appendix A: Sample Data

### A.1 Sample Fractional Item Configuration

```json
{
  "id": "item-001",
  "itemCode": "PIZZA-MARGHERITA",
  "itemName": "Margherita Pizza",
  "category": "Pizza",
  "baseUnit": "Whole Pizza",
  "availablePortions": [
    {
      "id": "slice",
      "name": "Slice",
      "portionsPerWhole": 8,
      "displayOrder": 1,
      "isActive": true
    },
    {
      "id": "half",
      "name": "Half Pizza",
      "portionsPerWhole": 2,
      "displayOrder": 2,
      "isActive": true
    }
  ],
  "defaultPortionId": "slice",
  "shelfLifeHours": 24,
  "maxQualityHours": 4,
  "temperatureRequired": "COLD",
  "expectedWastePercent": 5.00,
  "baseCostPerUnit": 8.50,
  "conversionCostPerUnit": 0.50,
  "autoConversionEnabled": true,
  "minPortionThreshold": 10,
  "isActive": true,
  "createdAt": "2025-01-12T10:00:00Z",
  "updatedAt": "2025-01-12T10:00:00Z"
}
```

### A.2 Sample Fractional Stock Record

```json
{
  "id": "stock-001",
  "itemCode": "PIZZA-MARGHERITA",
  "locationId": "location-001",
  "currentState": "PORTIONED",
  "stateTransitionDate": "2025-01-12T14:00:00Z",
  "wholeUnits": 3,
  "partialQuantity": 0.50,
  "totalPortions": 28.00,
  "reservedPortions": 5.00,
  "availablePortions": 23.00,
  "originalWholeUnits": 5,
  "originalTotalPortions": 40.00,
  "qualityGrade": "GOOD",
  "qualityUpdatedAt": "2025-01-12T16:00:00Z",
  "expiryDate": "2025-01-13T14:00:00Z",
  "preparedAt": "2025-01-12T14:00:00Z",
  "lastConversionId": "conv-001",
  "lastConversionDate": "2025-01-12T14:30:00Z",
  "lastConversionType": "SPLIT",
  "hasQualityAlert": false,
  "hasQuantityAlert": false,
  "hasExpiryAlert": false,
  "createdAt": "2025-01-12T10:00:00Z",
  "updatedAt": "2025-01-12T16:00:00Z"
}
```

### A.3 Sample Conversion Record

```json
{
  "id": "conv-001",
  "itemCode": "PIZZA-MARGHERITA",
  "stockId": "stock-001",
  "conversionType": "SPLIT",
  "performedAt": "2025-01-12T14:30:00Z",
  "performedBy": "user-001",
  "locationId": "location-001",
  "beforeState": "PREPARED",
  "beforeWholeUnits": 5,
  "beforePartialQty": 0.00,
  "beforeTotalPortions": 0.00,
  "beforeQualityGrade": "EXCELLENT",
  "afterState": "PORTIONED",
  "afterWholeUnits": 3,
  "afterPartialQty": 0.00,
  "afterTotalPortions": 16.00,
  "afterQualityGrade": "EXCELLENT",
  "unitsConverted": 2,
  "portionsCreated": 16.00,
  "expectedPortions": 16.00,
  "wasteGenerated": 0.00,
  "conversionEfficiency": 100.00,
  "conversionCost": 1.00,
  "portionSizeId": "slice",
  "portionSizeName": "Slice",
  "portionsPerWhole": 8,
  "qualityImpact": "NONE",
  "reason": "Lunch service preparation",
  "notes": "Converting pizzas for lunch rush",
  "isValidated": true,
  "validatedAt": "2025-01-12T14:35:00Z",
  "validatedBy": "user-002",
  "createdAt": "2025-01-12T14:30:00Z"
}
```

---

**Document End**
