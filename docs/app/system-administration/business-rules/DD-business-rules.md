# Business Rules - Data Definition (DS)

**Module**: System Administration - Business Rules
**Version**: 1.0
**Last Updated**: 2026-01-16
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Implementation Status**: Planned (Mock Data Currently)

---

## 1. Overview

### 1.1 Current State
- **Status**: Mock data implementation
- **Storage**: In-memory TypeScript objects
- **Location**: `lib/mock-data/business-rules-*.ts`

### 1.2 Planned Implementation
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Migration**: Q1 2025
- **Schema Location**: `prisma/schema.prisma`

---

## 2. Planned Database Schema

### 2.1 Core Tables

#### tb_business_rule
Stores business rule definitions with conditions and actions.

```prisma
model tb_business_rule {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name              String    @unique @db.VarChar(100)
  description       String    @db.Text
  priority          Int       @db.Integer
  is_active         Boolean   @default(true)

  // Rule categorization
  category          enum_rule_category

  // Metrics
  trigger_count     Int       @default(0) @db.Integer
  success_count     Int       @default(0) @db.Integer
  failure_count     Int       @default(0) @db.Integer
  success_rate      Decimal   @default(0) @db.Decimal(5, 2) // 0-100%

  // Last execution
  last_triggered_at DateTime? @db.Timestamptz(6)
  last_success_at   DateTime? @db.Timestamptz(6)
  last_failure_at   DateTime? @db.Timestamptz(6)

  // Audit fields
  created_at        DateTime  @default(now()) @db.Timestamptz(6)
  created_by_id     String    @db.Uuid
  updated_at        DateTime  @default(now()) @db.Timestamptz(6)
  updated_by_id     String    @db.Uuid
  deleted_at        DateTime? @db.Timestamptz(6)
  deleted_by_id     String?   @db.Uuid

  // Relations
  conditions                tb_rule_condition[]
  actions                   tb_rule_action[]
  violations                tb_compliance_violation[]
  audit_trail              tb_rule_audit[]
  performance_metrics      tb_rule_performance[]
  fractional_sales_rules   tb_fractional_sales_rule?
  food_safety_rules        tb_food_safety_rule?
  inventory_threshold_rules tb_inventory_threshold_rule?
  waste_management_rules   tb_waste_management_rule?
  created_by               tb_user @relation("RuleCreatedBy", fields: [created_by_id], references: [id])
  updated_by               tb_user @relation("RuleUpdatedBy", fields: [updated_by_id], references: [id])
  deleted_by               tb_user? @relation("RuleDeletedBy", fields: [deleted_by_id], references: [id])

  @@index([category])
  @@index([is_active])
  @@index([priority])
  @@index([created_at])
  @@index([last_triggered_at])
  @@map("tb_business_rule")
}
```

**Constraints**:
- Primary Key: `id` (UUID)
- Unique: `name`
- Check: `priority BETWEEN 1 AND 10`
- Check: `success_rate BETWEEN 0 AND 100`
- Check: `deleted_at IS NULL OR deleted_by_id IS NOT NULL`

**Sample Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Pizza Holding Time Limit",
  "description": "Enforce maximum holding time for pizza slices to ensure food safety",
  "priority": 8,
  "is_active": true,
  "category": "fractional-sales",
  "trigger_count": 1247,
  "success_count": 1245,
  "failure_count": 2,
  "success_rate": 99.84
}
```

---

#### tb_rule_condition
Stores individual conditions for business rules (normalized).

```prisma
model tb_rule_condition {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rule_id           String    @db.Uuid

  // Condition definition
  field             String    @db.VarChar(100)
  operator          enum_condition_operator
  value             Json      @db.Json
  logical_operator  enum_logical_operator? // AND/OR with next condition
  sequence_order    Int       @db.Integer // Order of evaluation

  // Audit fields
  created_at        DateTime  @default(now()) @db.Timestamptz(6)

  // Relations
  rule              tb_business_rule @relation(fields: [rule_id], references: [id], onDelete: Cascade)

  @@index([rule_id])
  @@index([field])
  @@map("tb_rule_condition")
}
```

**Constraints**:
- Primary Key: `id` (UUID)
- Foreign Key: `rule_id` → `tb_business_rule.id` (Cascade Delete)
- Check: `sequence_order >= 0`

**Sample Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "rule_id": "550e8400-e29b-41d4-a716-446655440001",
  "field": "holdingTimeMinutes",
  "operator": "greaterThan",
  "value": 120,
  "logical_operator": null,
  "sequence_order": 0
}
```

---

#### tb_rule_action
Stores individual actions for business rules (normalized).

```prisma
model tb_rule_action {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rule_id           String    @db.Uuid

  // Action definition
  action_type       enum_action_type
  parameters        Json      @db.Json
  sequence_order    Int       @db.Integer // Order of execution

  // Execution tracking
  execution_count   Int       @default(0) @db.Integer
  success_count     Int       @default(0) @db.Integer
  failure_count     Int       @default(0) @db.Integer

  // Audit fields
  created_at        DateTime  @default(now()) @db.Timestamptz(6)

  // Relations
  rule              tb_business_rule @relation(fields: [rule_id], references: [id], onDelete: Cascade)

  @@index([rule_id])
  @@index([action_type])
  @@map("tb_rule_action")
}
```

**Constraints**:
- Primary Key: `id` (UUID)
- Foreign Key: `rule_id` → `tb_business_rule.id` (Cascade Delete)
- Check: `sequence_order >= 0`

**Sample Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440020",
  "rule_id": "550e8400-e29b-41d4-a716-446655440001",
  "action_type": "blockSale",
  "parameters": {
    "reason": "Exceeded maximum holding time",
    "notifyManager": true
  },
  "sequence_order": 0
}
```

---

#### tb_compliance_violation
Tracks compliance violations detected by business rules.

```prisma
model tb_compliance_violation {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rule_id           String    @db.Uuid

  // Violation details
  violation_type    enum_violation_type
  description       String    @db.Text
  location          String    @db.VarChar(255)
  detected_by       enum_detection_source
  status            enum_violation_status

  // Assignment
  assigned_to_id    String?   @db.Uuid

  // Business impact
  business_impact   enum_business_impact
  estimated_cost    Decimal?  @db.Decimal(15, 2)

  // Timestamps
  detected_at       DateTime  @default(now()) @db.Timestamptz(6)
  acknowledged_at   DateTime? @db.Timestamptz(6)
  resolved_at       DateTime? @db.Timestamptz(6)
  verified_at       DateTime? @db.Timestamptz(6)

  // Relations
  rule              tb_business_rule @relation(fields: [rule_id], references: [id])
  assigned_to       tb_user? @relation("ViolationAssignedTo", fields: [assigned_to_id], references: [id])
  corrective_actions tb_corrective_action[]

  @@index([rule_id])
  @@index([status])
  @@index([violation_type])
  @@index([detected_at])
  @@index([assigned_to_id])
  @@map("tb_compliance_violation")
}
```

**Constraints**:
- Primary Key: `id` (UUID)
- Foreign Key: `rule_id` → `tb_business_rule.id`
- Foreign Key: `assigned_to_id` → `tb_user.id`
- Check: `acknowledged_at IS NULL OR acknowledged_at >= detected_at`
- Check: `resolved_at IS NULL OR resolved_at >= acknowledged_at`
- Check: `verified_at IS NULL OR verified_at >= resolved_at`

**Sample Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440030",
  "rule_id": "550e8400-e29b-41d4-a716-446655440001",
  "violation_type": "critical",
  "description": "Pizza slice held for 145 minutes (limit: 120 minutes)",
  "location": "Main Kitchen - Station 3",
  "detected_by": "system",
  "status": "acknowledged",
  "business_impact": "safety-risk",
  "detected_at": "2026-01-16T14:30:00Z",
  "acknowledged_at": "2026-01-16T14:35:00Z"
}
```

---

#### tb_corrective_action
Stores corrective actions taken for compliance violations.

```prisma
model tb_corrective_action {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  violation_id          String    @db.Uuid

  // Action details
  action                String    @db.Text
  assigned_to_id        String    @db.Uuid
  target_date           DateTime  @db.Timestamptz(6)
  status                enum_corrective_action_status

  // Evidence
  evidence_required     Boolean   @default(false)
  verification_method   String?   @db.VarChar(255)
  evidence_url          String?   @db.VarChar(500)

  // Timestamps
  created_at            DateTime  @default(now()) @db.Timestamptz(6)
  started_at            DateTime? @db.Timestamptz(6)
  completed_at          DateTime? @db.Timestamptz(6)
  verified_at           DateTime? @db.Timestamptz(6)

  // Relations
  violation             tb_compliance_violation @relation(fields: [violation_id], references: [id], onDelete: Cascade)
  assigned_to           tb_user @relation("CorrectiveActionAssignedTo", fields: [assigned_to_id], references: [id])

  @@index([violation_id])
  @@index([status])
  @@index([target_date])
  @@index([assigned_to_id])
  @@map("tb_corrective_action")
}
```

**Constraints**:
- Primary Key: `id` (UUID)
- Foreign Key: `violation_id` → `tb_compliance_violation.id` (Cascade Delete)
- Foreign Key: `assigned_to_id` → `tb_user.id`
- Check: `completed_at IS NULL OR completed_at >= started_at`
- Check: `verified_at IS NULL OR verified_at >= completed_at`

**Sample Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440040",
  "violation_id": "550e8400-e29b-41d4-a716-446655440030",
  "action": "Discard affected pizza slices and review holding procedures with staff",
  "assigned_to_id": "550e8400-e29b-41d4-a716-446655440050",
  "target_date": "2026-01-16T16:00:00Z",
  "status": "in-progress",
  "evidence_required": true,
  "verification_method": "Photo of discarded items and signed training log"
}
```

---

#### tb_rule_audit
Audit trail for all business rule changes.

```prisma
model tb_rule_audit {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rule_id                 String   @db.Uuid

  // Audit details
  action                  enum_audit_action
  changes                 Json     @db.Json // Before/after values
  reason                  String   @db.Text
  business_justification  String   @db.Text
  impact_assessment       String   @db.Text

  // Approval
  performed_by_id         String   @db.Uuid
  approved_by_id          String?  @db.Uuid

  // Metadata
  performed_at            DateTime @default(now()) @db.Timestamptz(6)
  ip_address              String?  @db.VarChar(45)
  user_agent              String?  @db.VarChar(255)

  // Relations
  rule                    tb_business_rule @relation(fields: [rule_id], references: [id])
  performed_by            tb_user @relation("AuditPerformedBy", fields: [performed_by_id], references: [id])
  approved_by             tb_user? @relation("AuditApprovedBy", fields: [approved_by_id], references: [id])

  @@index([rule_id])
  @@index([action])
  @@index([performed_at])
  @@index([performed_by_id])
  @@map("tb_rule_audit")
}
```

**Constraints**:
- Primary Key: `id` (UUID)
- Foreign Key: `rule_id` → `tb_business_rule.id`
- Foreign Key: `performed_by_id` → `tb_user.id`
- Foreign Key: `approved_by_id` → `tb_user.id`

---

#### tb_rule_performance
Stores performance metrics and analytics for business rules.

```prisma
model tb_rule_performance {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rule_id                 String   @db.Uuid

  // Time period
  period_start            DateTime @db.Timestamptz(6)
  period_end              DateTime @db.Timestamptz(6)
  period_type             enum_period_type // hourly, daily, weekly, monthly

  // Metrics
  trigger_count           Int      @db.Integer
  success_count           Int      @db.Integer
  failure_count           Int      @db.Integer
  success_rate            Decimal  @db.Decimal(5, 2)
  avg_processing_time_ms  Int      @db.Integer

  // Business impact
  cost_savings            Decimal? @db.Decimal(15, 2)
  time_saved_minutes      Int?     @db.Integer

  // Trends
  trend                   enum_trend // increasing, decreasing, stable

  // Audit
  calculated_at           DateTime @default(now()) @db.Timestamptz(6)

  // Relations
  rule                    tb_business_rule @relation(fields: [rule_id], references: [id], onDelete: Cascade)

  @@unique([rule_id, period_start, period_end, period_type])
  @@index([rule_id])
  @@index([period_start, period_end])
  @@map("tb_rule_performance")
}
```

**Constraints**:
- Primary Key: `id` (UUID)
- Unique: `(rule_id, period_start, period_end, period_type)`
- Check: `period_end > period_start`
- Check: `success_rate BETWEEN 0 AND 100`

---

### 2.2 Specialized Rule Extension Tables

#### tb_fractional_sales_rule
Extension for fractional sales-specific business rules.

```prisma
model tb_fractional_sales_rule {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rule_id                 String   @unique @db.Uuid

  // Fractional sales specifics
  fractional_type         enum_fractional_type
  food_safety_level       enum_safety_level
  compliance_requirements Json     @db.Json // Array of requirement strings

  // Relations
  rule                    tb_business_rule @relation(fields: [rule_id], references: [id], onDelete: Cascade)
  quality_standards       tb_quality_standard[]

  @@map("tb_fractional_sales_rule")
}
```

---

#### tb_quality_standard
Quality standards for fractional sales rules.

```prisma
model tb_quality_standard {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  fractional_sales_rule_id String  @db.Uuid

  // Standard definition
  standard_name           String   @db.VarChar(100)
  measurement_type        enum_measurement_type
  minimum_value           Decimal? @db.Decimal(10, 2)
  maximum_value           Decimal? @db.Decimal(10, 2)
  unit                    String   @db.VarChar(50)
  tolerance_level         Decimal  @db.Decimal(5, 2) // Percentage
  critical_control        Boolean  @default(false)
  monitoring_frequency    enum_monitoring_frequency

  // Relations
  fractional_sales_rule   tb_fractional_sales_rule @relation(fields: [fractional_sales_rule_id], references: [id], onDelete: Cascade)

  @@index([fractional_sales_rule_id])
  @@index([measurement_type])
  @@index([critical_control])
  @@map("tb_quality_standard")
}
```

---

#### tb_food_safety_rule
Extension for food safety and HACCP compliance rules.

```prisma
model tb_food_safety_rule {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rule_id             String   @unique @db.Uuid

  // Food safety specifics
  hazard_type         enum_hazard_type
  risk_level          enum_risk_level
  haccp_point         String   @db.VarChar(100)
  monitoring_required Boolean  @default(true)
  corrective_actions  Json     @db.Json // Array of predefined actions

  // Relations
  rule                tb_business_rule @relation(fields: [rule_id], references: [id], onDelete: Cascade)

  @@map("tb_food_safety_rule")
}
```

---

#### tb_inventory_threshold_rule
Extension for inventory management threshold rules.

```prisma
model tb_inventory_threshold_rule {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rule_id               String   @unique @db.Uuid

  // Inventory threshold specifics
  item_type             enum_item_type
  threshold_type        enum_threshold_type
  calculation_method    enum_calculation_method
  forecasting_period    Int?     @db.Integer // days
  demand_variability    Decimal? @db.Decimal(5, 2) // percentage
  lead_time_buffer      Int?     @db.Integer // days

  // Relations
  rule                  tb_business_rule @relation(fields: [rule_id], references: [id], onDelete: Cascade)

  @@map("tb_inventory_threshold_rule")
}
```

---

#### tb_waste_management_rule
Extension for waste management rules.

```prisma
model tb_waste_management_rule {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  rule_id                 String   @unique @db.Uuid

  // Waste management specifics
  waste_category          enum_waste_category
  minimization_strategy   String   @db.Text
  cost_impact_threshold   Decimal  @db.Decimal(15, 2)
  tracking_required       Boolean  @default(true)
  reporting_frequency     enum_reporting_frequency

  // Relations
  rule                    tb_business_rule @relation(fields: [rule_id], references: [id], onDelete: Cascade)

  @@map("tb_waste_management_rule")
}
```

---

## 3. Enumerations

### 3.1 Core Enums

```prisma
enum enum_rule_category {
  vendor_selection
  pricing
  approval
  currency
  fractional_sales
  quality_control
  inventory_management
  food_safety
  waste_management
}

enum enum_condition_operator {
  equals
  contains
  greaterThan
  lessThan
  between
  in
  not_equals
}

enum enum_logical_operator {
  AND
  OR
}

enum enum_action_type {
  assignVendor
  setPrice
  flagForReview
  applyDiscount
  convertCurrency
  blockSale
  requireApproval
  scheduleWasteCheck
  triggerReorder
  adjustPrice
  markExpired
  quarantineItem
  notifyManager
  updateInventory
  logCompliance
  sendAlert
}

enum enum_violation_type {
  critical
  major
  minor
  observation
}

enum enum_violation_status {
  open
  acknowledged
  corrective_action
  resolved
  verified
}

enum enum_detection_source {
  system
  manual
  audit
}

enum enum_business_impact {
  safety_risk
  financial_loss
  reputation_risk
  operational_inefficiency
}

enum enum_corrective_action_status {
  pending
  in_progress
  completed
  overdue
}

enum enum_audit_action {
  created
  modified
  activated
  deactivated
  deleted
}

enum enum_period_type {
  hourly
  daily
  weekly
  monthly
}

enum enum_trend {
  increasing
  decreasing
  stable
}
```

### 3.2 Specialized Enums

```prisma
enum enum_fractional_type {
  pizza_slice
  cake_slice
  bottle_glass
  portion_control
  custom
}

enum enum_safety_level {
  high
  medium
  low
}

enum enum_measurement_type {
  time
  temperature
  appearance
  weight
  size
  freshness
}

enum enum_monitoring_frequency {
  continuous
  hourly
  shift
  daily
}

enum enum_hazard_type {
  biological
  chemical
  physical
  cross_contamination
}

enum enum_risk_level {
  critical
  high
  medium
  low
}

enum enum_item_type {
  whole_item
  fractional_item
  component
}

enum enum_threshold_type {
  minimum_level
  reorder_point
  maximum_level
  expiration_warning
}

enum enum_calculation_method {
  static
  dynamic_demand
  seasonal
  predictive
}

enum enum_waste_category {
  food_prep
  service_waste
  expired_items
  damaged_items
  overproduction
}

enum enum_reporting_frequency {
  real_time
  daily
  weekly
  monthly
}
```

---

## 4. Relationships & ERD

### 4.1 Entity Relationships

```
tb_business_rule (1) ──< (N) tb_rule_condition
tb_business_rule (1) ──< (N) tb_rule_action
tb_business_rule (1) ──< (N) tb_compliance_violation
tb_business_rule (1) ──< (N) tb_rule_audit
tb_business_rule (1) ──< (N) tb_rule_performance
tb_business_rule (1) ──< (1) tb_fractional_sales_rule
tb_business_rule (1) ──< (1) tb_food_safety_rule
tb_business_rule (1) ──< (1) tb_inventory_threshold_rule
tb_business_rule (1) ──< (1) tb_waste_management_rule

tb_fractional_sales_rule (1) ──< (N) tb_quality_standard

tb_compliance_violation (1) ──< (N) tb_corrective_action

tb_user (1) ──< (N) tb_business_rule (created_by)
tb_user (1) ──< (N) tb_business_rule (updated_by)
tb_user (1) ──< (N) tb_compliance_violation (assigned_to)
tb_user (1) ──< (N) tb_corrective_action (assigned_to)
tb_user (1) ──< (N) tb_rule_audit (performed_by)
tb_user (1) ──< (N) tb_rule_audit (approved_by)
```

### 4.2 ERD Diagram

```mermaid
erDiagram
    tb_business_rule ||--o{ tb_rule_condition : "has"
    tb_business_rule ||--o{ tb_rule_action : "has"
    tb_business_rule ||--o{ tb_compliance_violation : "tracks"
    tb_business_rule ||--o{ tb_rule_audit : "logged in"
    tb_business_rule ||--o{ tb_rule_performance : "measures"
    tb_business_rule ||--o| tb_fractional_sales_rule : "extends"
    tb_business_rule ||--o| tb_food_safety_rule : "extends"
    tb_business_rule ||--o| tb_inventory_threshold_rule : "extends"
    tb_business_rule ||--o| tb_waste_management_rule : "extends"

    tb_fractional_sales_rule ||--o{ tb_quality_standard : "defines"

    tb_compliance_violation ||--o{ tb_corrective_action : "requires"

    tb_user ||--o{ tb_business_rule : "creates/updates"
    tb_user ||--o{ tb_compliance_violation : "assigned"
    tb_user ||--o{ tb_corrective_action : "handles"
    tb_user ||--o{ tb_rule_audit : "performs/approves"

    tb_business_rule {
        uuid id PK
        varchar name UK
        text description
        int priority
        boolean is_active
        enum category
        int trigger_count
        int success_count
        int failure_count
        decimal success_rate
        timestamp last_triggered_at
        timestamp created_at
        timestamp updated_at
    }

    tb_rule_condition {
        uuid id PK
        uuid rule_id FK
        varchar field
        enum operator
        json value
        enum logical_operator
        int sequence_order
    }

    tb_rule_action {
        uuid id PK
        uuid rule_id FK
        enum action_type
        json parameters
        int sequence_order
        int execution_count
        int success_count
        int failure_count
    }

    tb_compliance_violation {
        uuid id PK
        uuid rule_id FK
        enum violation_type
        text description
        varchar location
        enum detected_by
        enum status
        uuid assigned_to_id FK
        enum business_impact
        decimal estimated_cost
        timestamp detected_at
        timestamp acknowledged_at
        timestamp resolved_at
        timestamp verified_at
    }

    tb_corrective_action {
        uuid id PK
        uuid violation_id FK
        text action
        uuid assigned_to_id FK
        timestamp target_date
        enum status
        boolean evidence_required
        varchar verification_method
        varchar evidence_url
        timestamp created_at
        timestamp completed_at
        timestamp verified_at
    }

    tb_rule_audit {
        uuid id PK
        uuid rule_id FK
        enum action
        json changes
        text reason
        text business_justification
        text impact_assessment
        uuid performed_by_id FK
        uuid approved_by_id FK
        timestamp performed_at
    }

    tb_rule_performance {
        uuid id PK
        uuid rule_id FK
        timestamp period_start
        timestamp period_end
        enum period_type
        int trigger_count
        int success_count
        int failure_count
        decimal success_rate
        int avg_processing_time_ms
        decimal cost_savings
        int time_saved_minutes
        enum trend
    }

    tb_fractional_sales_rule {
        uuid id PK
        uuid rule_id FK UK
        enum fractional_type
        enum food_safety_level
        json compliance_requirements
    }

    tb_quality_standard {
        uuid id PK
        uuid fractional_sales_rule_id FK
        varchar standard_name
        enum measurement_type
        decimal minimum_value
        decimal maximum_value
        varchar unit
        decimal tolerance_level
        boolean critical_control
        enum monitoring_frequency
    }

    tb_food_safety_rule {
        uuid id PK
        uuid rule_id FK UK
        enum hazard_type
        enum risk_level
        varchar haccp_point
        boolean monitoring_required
        json corrective_actions
    }

    tb_inventory_threshold_rule {
        uuid id PK
        uuid rule_id FK UK
        enum item_type
        enum threshold_type
        enum calculation_method
        int forecasting_period
        decimal demand_variability
        int lead_time_buffer
    }

    tb_waste_management_rule {
        uuid id PK
        uuid rule_id FK UK
        enum waste_category
        text minimization_strategy
        decimal cost_impact_threshold
        boolean tracking_required
        enum reporting_frequency
    }
```

---

## 5. Indexes

### 5.1 Performance Indexes

```sql
-- Business Rule lookup by name and category (frequent)
CREATE INDEX idx_business_rule_name ON tb_business_rule(name);
CREATE INDEX idx_business_rule_category ON tb_business_rule(category);
CREATE INDEX idx_business_rule_is_active ON tb_business_rule(is_active);
CREATE INDEX idx_business_rule_priority ON tb_business_rule(priority);
CREATE INDEX idx_business_rule_created_at ON tb_business_rule(created_at);
CREATE INDEX idx_business_rule_last_triggered ON tb_business_rule(last_triggered_at);

-- Rule conditions and actions
CREATE INDEX idx_rule_condition_rule_id ON tb_rule_condition(rule_id);
CREATE INDEX idx_rule_condition_field ON tb_rule_condition(field);
CREATE INDEX idx_rule_action_rule_id ON tb_rule_action(rule_id);
CREATE INDEX idx_rule_action_type ON tb_rule_action(action_type);

-- Compliance violations (very frequent queries)
CREATE INDEX idx_violation_rule_id ON tb_compliance_violation(rule_id);
CREATE INDEX idx_violation_status ON tb_compliance_violation(status);
CREATE INDEX idx_violation_type ON tb_compliance_violation(violation_type);
CREATE INDEX idx_violation_detected_at ON tb_compliance_violation(detected_at);
CREATE INDEX idx_violation_assigned_to ON tb_compliance_violation(assigned_to_id);

-- Corrective actions
CREATE INDEX idx_corrective_action_violation ON tb_corrective_action(violation_id);
CREATE INDEX idx_corrective_action_status ON tb_corrective_action(status);
CREATE INDEX idx_corrective_action_target_date ON tb_corrective_action(target_date);
CREATE INDEX idx_corrective_action_assigned_to ON tb_corrective_action(assigned_to_id);

-- Audit queries
CREATE INDEX idx_rule_audit_rule_id ON tb_rule_audit(rule_id);
CREATE INDEX idx_rule_audit_action ON tb_rule_audit(action);
CREATE INDEX idx_rule_audit_performed_at ON tb_rule_audit(performed_at);
CREATE INDEX idx_rule_audit_performed_by ON tb_rule_audit(performed_by_id);

-- Performance metrics
CREATE INDEX idx_rule_performance_rule_id ON tb_rule_performance(rule_id);
CREATE INDEX idx_rule_performance_period ON tb_rule_performance(period_start, period_end);

-- Quality standards
CREATE INDEX idx_quality_standard_fractional_rule ON tb_quality_standard(fractional_sales_rule_id);
CREATE INDEX idx_quality_standard_measurement_type ON tb_quality_standard(measurement_type);
CREATE INDEX idx_quality_standard_critical_control ON tb_quality_standard(critical_control);
```

---

## 6. Sample Queries

### 6.1 Get Active Rules by Category

```sql
-- Get all active fractional sales rules with conditions and actions
SELECT
  br.id,
  br.name,
  br.description,
  br.priority,
  br.success_rate,
  json_agg(DISTINCT jsonb_build_object(
    'field', rc.field,
    'operator', rc.operator,
    'value', rc.value
  ) ORDER BY rc.sequence_order) AS conditions,
  json_agg(DISTINCT jsonb_build_object(
    'type', ra.action_type,
    'parameters', ra.parameters
  ) ORDER BY ra.sequence_order) AS actions
FROM tb_business_rule br
LEFT JOIN tb_rule_condition rc ON rc.rule_id = br.id
LEFT JOIN tb_rule_action ra ON ra.rule_id = br.id
WHERE br.category = 'fractional_sales'
  AND br.is_active = true
  AND br.deleted_at IS NULL
GROUP BY br.id
ORDER BY br.priority DESC, br.name;
```

### 6.2 Get Open Violations with Corrective Actions

```sql
-- Get all open critical violations with assigned corrective actions
SELECT
  cv.id,
  cv.violation_type,
  cv.description,
  cv.location,
  cv.detected_at,
  br.name AS rule_name,
  u.name AS assigned_to_name,
  json_agg(jsonb_build_object(
    'action', ca.action,
    'status', ca.status,
    'target_date', ca.target_date,
    'evidence_required', ca.evidence_required
  )) AS corrective_actions
FROM tb_compliance_violation cv
JOIN tb_business_rule br ON br.id = cv.rule_id
LEFT JOIN tb_user u ON u.id = cv.assigned_to_id
LEFT JOIN tb_corrective_action ca ON ca.violation_id = cv.id
WHERE cv.status IN ('open', 'acknowledged', 'corrective_action')
  AND cv.violation_type = 'critical'
GROUP BY cv.id, br.name, u.name
ORDER BY cv.detected_at DESC;
```

### 6.3 Get Rule Performance Metrics

```sql
-- Get daily performance metrics for the last 30 days
SELECT
  br.name,
  br.category,
  rp.period_start::date AS date,
  rp.trigger_count,
  rp.success_count,
  rp.success_rate,
  rp.avg_processing_time_ms,
  rp.cost_savings,
  rp.trend
FROM tb_rule_performance rp
JOIN tb_business_rule br ON br.id = rp.rule_id
WHERE rp.period_type = 'daily'
  AND rp.period_start >= NOW() - INTERVAL '30 days'
  AND br.is_active = true
ORDER BY rp.period_start DESC, br.priority DESC;
```

### 6.4 Get Fractional Sales Rules with Quality Standards

```sql
-- Get all fractional sales rules with quality standards
SELECT
  br.name,
  br.priority,
  fsr.fractional_type,
  fsr.food_safety_level,
  json_agg(jsonb_build_object(
    'standard_name', qs.standard_name,
    'measurement_type', qs.measurement_type,
    'minimum_value', qs.minimum_value,
    'maximum_value', qs.maximum_value,
    'unit', qs.unit,
    'critical_control', qs.critical_control,
    'monitoring_frequency', qs.monitoring_frequency
  )) AS quality_standards
FROM tb_business_rule br
JOIN tb_fractional_sales_rule fsr ON fsr.rule_id = br.id
LEFT JOIN tb_quality_standard qs ON qs.fractional_sales_rule_id = fsr.id
WHERE br.is_active = true
  AND br.deleted_at IS NULL
GROUP BY br.id, fsr.id
ORDER BY br.priority DESC;
```

### 6.5 Get Rule Audit Trail

```sql
-- Get complete audit trail for a specific rule
SELECT
  ra.performed_at,
  ra.action,
  ra.reason,
  ra.changes,
  u1.name AS performed_by,
  u2.name AS approved_by,
  ra.business_justification,
  ra.impact_assessment
FROM tb_rule_audit ra
JOIN tb_user u1 ON u1.id = ra.performed_by_id
LEFT JOIN tb_user u2 ON u2.id = ra.approved_by_id
WHERE ra.rule_id = $1
ORDER BY ra.performed_at DESC;
```

### 6.6 Get Compliance Dashboard Metrics

```sql
-- Get comprehensive compliance metrics
SELECT
  COUNT(DISTINCT br.id) AS total_rules,
  COUNT(DISTINCT CASE WHEN br.is_active THEN br.id END) AS active_rules,
  COUNT(DISTINCT cv.id) AS total_violations,
  COUNT(DISTINCT CASE WHEN cv.status = 'open' THEN cv.id END) AS open_violations,
  COUNT(DISTINCT CASE WHEN cv.violation_type = 'critical' THEN cv.id END) AS critical_violations,
  COUNT(DISTINCT ca.id) AS total_corrective_actions,
  COUNT(DISTINCT CASE WHEN ca.status = 'overdue' THEN ca.id END) AS overdue_actions,
  AVG(br.success_rate) AS avg_success_rate,
  SUM(cv.estimated_cost) AS total_estimated_cost
FROM tb_business_rule br
LEFT JOIN tb_compliance_violation cv ON cv.rule_id = br.id
  AND cv.detected_at >= NOW() - INTERVAL '30 days'
LEFT JOIN tb_corrective_action ca ON ca.violation_id = cv.id
WHERE br.deleted_at IS NULL;
```

---

## 7. Data Constraints

### 7.1 Database Constraints

```sql
-- Rule name must be unique (case-insensitive)
ALTER TABLE tb_business_rule
ADD CONSTRAINT tb_business_rule_name_unique UNIQUE (LOWER(name));

-- Priority must be 1-10
ALTER TABLE tb_business_rule
ADD CONSTRAINT tb_business_rule_priority_range CHECK (priority BETWEEN 1 AND 10);

-- Success rate must be 0-100%
ALTER TABLE tb_business_rule
ADD CONSTRAINT tb_business_rule_success_rate_range CHECK (success_rate BETWEEN 0 AND 100);

-- Violation timestamps must be sequential
ALTER TABLE tb_compliance_violation
ADD CONSTRAINT tb_violation_timestamps_sequential
CHECK (
  (acknowledged_at IS NULL OR acknowledged_at >= detected_at) AND
  (resolved_at IS NULL OR resolved_at >= COALESCE(acknowledged_at, detected_at)) AND
  (verified_at IS NULL OR verified_at >= COALESCE(resolved_at, acknowledged_at, detected_at))
);

-- Corrective action timestamps must be sequential
ALTER TABLE tb_corrective_action
ADD CONSTRAINT tb_corrective_action_timestamps_sequential
CHECK (
  (started_at IS NULL OR started_at >= created_at) AND
  (completed_at IS NULL OR completed_at >= COALESCE(started_at, created_at)) AND
  (verified_at IS NULL OR verified_at >= COALESCE(completed_at, started_at, created_at))
);

-- Performance period must be valid
ALTER TABLE tb_rule_performance
ADD CONSTRAINT tb_rule_performance_period_valid
CHECK (period_end > period_start);

-- Quality standard tolerance must be positive
ALTER TABLE tb_quality_standard
ADD CONSTRAINT tb_quality_standard_tolerance_positive
CHECK (tolerance_level > 0);

-- Soft delete consistency
ALTER TABLE tb_business_rule
ADD CONSTRAINT tb_business_rule_soft_delete
CHECK ((deleted_at IS NULL AND deleted_by_id IS NULL) OR
       (deleted_at IS NOT NULL AND deleted_by_id IS NOT NULL));
```

### 7.2 Application-Level Constraints

- **Rule validation**: At least one condition and one action required
- **Condition sequencing**: sequence_order must be sequential starting from 0
- **Action sequencing**: sequence_order must be sequential starting from 0
- **Critical violations**: Must be acknowledged within 1 hour
- **Major violations**: Must be acknowledged within 4 hours
- **Evidence requirements**: Critical and major violations require evidence
- **Approval workflow**: Certain rule changes require manager approval
- **Active rule limit**: Maximum 1000 active rules per organization
- **Rule name format**: `/^[a-zA-Z0-9\s\-_]+$/`

---

## 8. Migration Strategy

### 8.1 Data Migration Steps

**Phase 1: Schema Creation (Week 1)**
1. Create core tables: `tb_business_rule`, `tb_rule_condition`, `tb_rule_action`
2. Create compliance tables: `tb_compliance_violation`, `tb_corrective_action`
3. Create audit and performance tables: `tb_rule_audit`, `tb_rule_performance`
4. Create specialized extension tables
5. Add all indexes and constraints
6. Test schema integrity

**Phase 2: Mock Data Migration (Week 2)**
1. Export current mock rules to SQL
2. Transform TypeScript conditions/actions to normalized tables
3. Import into database with proper relationships
4. Create initial performance metrics baseline
5. Validate data integrity and relationships

**Phase 3: Application Updates (Week 3-4)**
1. Update components to use Prisma queries instead of mock data
2. Implement server actions for all CRUD operations
3. Add real-time violation tracking
4. Implement performance metrics collection
5. Add audit logging for all changes
6. Test all workflows end-to-end

**Phase 4: Production Deployment (Week 5)**
1. Backup existing mock data
2. Deploy schema to production database
3. Migrate production data
4. Enable background jobs for metrics calculation
5. Monitor system performance and error rates
6. Fine-tune indexes based on query patterns

---

## 9. Performance Considerations

### 9.1 Query Optimization

- **Rule Evaluation**: Cache active rule definitions for 5 minutes
- **Violation Queries**: Partition by detected_at for large datasets
- **Performance Metrics**: Pre-aggregate hourly and daily metrics
- **Audit Logs**: Archive logs older than 1 year to separate table
- **Quality Standards**: Cache critical control point definitions

### 9.2 Caching Strategy

```typescript
// Cache configuration
const cacheConfig = {
  activeRules: { ttl: 300 },           // 5 minutes
  ruleDefinitions: { ttl: 600 },       // 10 minutes
  qualityStandards: { ttl: 900 },      // 15 minutes
  performanceMetrics: { ttl: 1800 },   // 30 minutes
  complianceScores: { ttl: 300 }       // 5 minutes
}
```

### 9.3 Partitioning Strategy

```sql
-- Partition compliance violations by detected_at (monthly)
CREATE TABLE tb_compliance_violation (
  /* ... columns ... */
) PARTITION BY RANGE (detected_at);

CREATE TABLE tb_compliance_violation_2025_01
  PARTITION OF tb_compliance_violation
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Partition rule performance by period_start (monthly)
CREATE TABLE tb_rule_performance (
  /* ... columns ... */
) PARTITION BY RANGE (period_start);
```

---

## 10. Validation Rules

### 10.1 Field Validation

| Table | Field | Type | Rules |
|-------|-------|------|-------|
| tb_business_rule | name | String | Required, 3-100 chars, unique, alphanumeric+spaces |
| tb_business_rule | description | String | Required, 10-500 chars |
| tb_business_rule | priority | Integer | Required, 1-10 range |
| tb_business_rule | success_rate | Decimal | 0-100 range |
| tb_rule_condition | field | String | Required, 1-100 chars |
| tb_rule_condition | operator | Enum | Required, valid operator |
| tb_rule_condition | value | JSON | Required, must match field type |
| tb_rule_action | action_type | Enum | Required, valid action type |
| tb_rule_action | parameters | JSON | Required, valid for action type |
| tb_compliance_violation | description | String | Required, 10-1000 chars |
| tb_compliance_violation | location | String | Required, 1-255 chars |
| tb_corrective_action | action | String | Required, 10-1000 chars |
| tb_corrective_action | target_date | DateTime | Required, must be future date |
| tb_quality_standard | minimum_value | Decimal | Optional, must be < maximum_value |
| tb_quality_standard | maximum_value | Decimal | Optional, must be > minimum_value |
| tb_quality_standard | tolerance_level | Decimal | Required, > 0 |

### 10.2 Business Rule Validation

- **Rule uniqueness**: Rule name must be unique (case-insensitive)
- **Condition requirements**: At least one condition required
- **Action requirements**: At least one action required
- **Priority uniqueness**: No two active rules can have same priority for same category
- **Circular dependencies**: Prevent rules that trigger themselves
- **Violation acknowledgment**: Critical violations must be acknowledged within 1 hour
- **Evidence requirements**: Critical and major violations require evidence
- **Approval workflow**: Rule activation/deactivation requires manager approval
- **Performance thresholds**: Rules with <80% success rate flagged for review

---

**Document Control**:
- **Created**: 2026-01-16
- **Version**: 1.0
- **Status**: Planned Schema
- **Target Implementation**: Q1 2025
