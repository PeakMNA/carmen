# Data Definition: Period End Management

## Document Information
- **Module**: Inventory Management - Period End
- **Component**: Period End Management
- **Version**: 1.1.0
- **Last Updated**: 2025-12-09
- **Status**: Active

## Related Documents
- [Business Requirements](./BR-period-end.md)
- [Use Cases](./UC-period-end.md)
- [Technical Specification](./TS-period-end.md)
- [Flow Diagrams](./FD-period-end.md)
- [Validations](./VAL-period-end.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-12-09 | Development Team | Updated enum_period_status values (open, closing, closed, reopened), expanded default tasks to 11 validation items, added period summary structure |
---

## 1. Overview

### 1.1 Purpose

This document defines the complete data schema for the Period End Management sub-module, including database tables, relationships, JSONB structures, indexes, and data integrity constraints.

### 1.2 Database Technology

- **Primary Database**: PostgreSQL 14+
- **ORM**: Prisma 5.8+
- **Data Model Approach**: Relational with audit trail emphasis
- **Migration Strategy**: Prisma Migrations with phased rollout

### 1.3 Key Entities

1. **period_end** - Accounting period records with lifecycle management
2. **period_task** - Checklist tasks required for period closure
3. **period_activity** - Immutable audit log of all period actions

---

## 2. Database Tables

### 2.1 period_end

**Purpose**: Stores accounting period records with status lifecycle management.

**Table Name**: `tb_period_end`

**Schema**:
```prisma
model PeriodEnd {
  id                     String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  // Period identification
  period_id              String   @unique @db.VarChar(10)  // Format: PE-YYYY-MM
  period_name            String   @db.VarChar(50)          // e.g., "January 2024"
  start_date             DateTime @db.Timestamptz(6)       // First day of month 00:00:00
  end_date               DateTime @db.Timestamptz(6)       // Last day of month 23:59:59

  // Period status
  status                 enum_period_status @default(open)
  completed_by_id        String?  @db.Uuid
  completed_at           DateTime? @db.Timestamptz(6)
  notes                  String?  @db.Text                 // Max 1000 characters

  // Re-open tracking
  original_completed_by_id String? @db.Uuid
  original_completed_at    DateTime? @db.Timestamptz(6)
  reopened_by_id           String? @db.Uuid
  reopened_at              DateTime? @db.Timestamptz(6)
  reopen_reason            String? @db.Text               // Min 100 characters

  // Cancellation tracking
  cancelled_by_id        String?  @db.Uuid
  cancelled_at           DateTime? @db.Timestamptz(6)
  cancel_reason          String?  @db.Text                // Min 50 characters

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
  tasks                  PeriodTask[]
  activities             PeriodActivity[]
  completed_by           User? @relation("period_completed_by", fields: [completed_by_id], references: [id])
  reopened_by            User? @relation("period_reopened_by", fields: [reopened_by_id], references: [id])
  original_completed_by  User? @relation("period_original_completed_by", fields: [original_completed_by_id], references: [id])

  @@map("tb_period_end")
  @@index([period_id])
  @@index([status])
  @@index([start_date, end_date])
  @@index([created_at])
}
```

**enum_period_status** (as implemented):
```prisma
enum enum_period_status {
  open          // Period created, ready for work
  closing       // Period actively being closed, validation in progress
  closed        // Period finalized and locked
  reopened      // Period re-opened after being closed (for corrections)
}
```

**Field Descriptions**:
- **period_id**: Unique identifier following PE-YYYY-MM format (e.g., PE-2024-01)
- **period_name**: Human-readable name for display (e.g., "January 2024")
- **start_date**: First day of month at 00:00:00
- **end_date**: Last day of month at 23:59:59
- **status**: Current period lifecycle state
- **completed_by_id**: User who closed the period
- **completed_at**: Timestamp when period was closed
- **notes**: Period-specific comments or instructions (max 1000 chars)
- **original_completed_by_id**: Original closer if period was re-opened
- **original_completed_at**: Original close date if period was re-opened
- **reopened_by_id**: User who re-opened the period
- **reopened_at**: Timestamp when period was re-opened
- **reopen_reason**: Detailed explanation for re-opening (min 100 chars)
- **cancelled_by_id**: User who cancelled the period
- **cancelled_at**: Timestamp when period was cancelled
- **cancel_reason**: Reason for cancellation (min 50 chars)

**Business Rules**:
- Only one period can be in `closing` status at a time
- Periods must align with calendar months
- Cannot create duplicate period_id
- Cannot delete periods (use soft delete via deleted_at)

**Period Summary Structure** (as implemented):
```typescript
interface PeriodSummary {
  openingValue: number;       // Currency amount at period start
  closingValue: number;       // Currency amount at period end
  adjustments: number;        // Total adjustment value
  movementsIn: number;        // Count of inbound movements
  movementsOut: number;       // Count of outbound movements
  varianceAmount: number;     // Calculated variance
  variancePercentage: number; // Variance as percentage
}
```

---

### 2.2 period_task

**Purpose**: Tracks checklist tasks required for period closure.

**Table Name**: `tb_period_task`

**Schema**:
```prisma
model PeriodTask {
  id                     String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  // Parent relationship
  period_end_id          String   @db.Uuid
  period_end             PeriodEnd @relation(fields: [period_end_id], references: [id], onDelete: Cascade)

  // Task information
  name                   String   @db.VarChar(200)
  description            String?  @db.Text
  sequence               Int                              // Display order (1, 2, 3...)
  is_required            Boolean  @default(true)

  // Task status
  status                 enum_task_status @default(pending)
  completed_by_id        String?  @db.Uuid
  completed_at           DateTime? @db.Timestamptz(6)

  // Validation (future enhancement)
  validation_type        String?  @db.VarChar(50)        // 'manual', 'automated'
  validation_criteria    Json?    @db.Json               // JSON criteria for automated validation

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
  completed_by           User? @relation(fields: [completed_by_id], references: [id])

  @@map("tb_period_task")
  @@index([period_end_id])
  @@index([status])
  @@index([sequence])
}
```

**enum_task_status**:
```prisma
enum enum_task_status {
  pending       // Not yet started
  completed     // Finished
}
```

**Default Validation Items** (created automatically with new period - 11 items as implemented):
1. All inventory counts completed (sequence: 1)
2. Stock movements recorded (sequence: 2)
3. Adjustments posted (sequence: 3)
4. Returns processed (sequence: 4)
5. Costing calculations finalized (sequence: 5)
6. GL entries reconciled (sequence: 6)
7. Department allocations completed (sequence: 7)
8. Variance analysis completed (sequence: 8)
9. Audit trail verified (sequence: 9)
10. Reports generated (sequence: 10)
11. Management approval obtained (sequence: 11)

**Field Descriptions**:
- **period_end_id**: Foreign key to parent period
- **name**: Task name (e.g., "Complete Physical Count")
- **description**: Optional detailed task instructions
- **sequence**: Display order for UI (1, 2, 3, 4...)
- **is_required**: Must be completed before period closure?
- **status**: Current task state
- **completed_by_id**: User who marked task complete
- **completed_at**: Timestamp of task completion
- **validation_type**: How to validate (manual or automated)
- **validation_criteria**: JSON structure for automated validation

**Business Rules**:
- Tasks cannot be unmarked once completed (audit trail integrity)
- All required tasks must be completed before period closure
- Task completion requires valid user authentication

---

### 2.3 period_activity

**Purpose**: Immutable audit log of all period-related actions for compliance and forensic analysis.

**Table Name**: `tb_period_activity`

**Schema**:
```prisma
model PeriodActivity {
  id                     String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  // Parent relationship
  period_end_id          String   @db.Uuid
  period_end             PeriodEnd @relation(fields: [period_end_id], references: [id], onDelete: Cascade)

  // Activity information
  action_type            enum_activity_action
  action_date            DateTime @default(now()) @db.Timestamptz(6)
  action_by_id           String   @db.Uuid
  action_by_name         String   @db.VarChar(200)      // Denormalized for audit
  ip_address             String   @db.VarChar(45)       // IPv4 or IPv6
  user_agent             String?  @db.Text

  // Status change tracking
  from_status            String?  @db.VarChar(50)
  to_status              String?  @db.VarChar(50)

  // Task completion tracking
  task_name              String?  @db.VarChar(200)

  // Reason tracking
  reason                 String?  @db.Text

  // Field changes
  field_changes          Json?    @db.Json              // Array of FieldChange objects

  // Additional notes
  notes                  String?  @db.Text

  // No update/delete fields - activity log is immutable
  created_at             DateTime @default(now()) @db.Timestamptz(6)

  // Relations
  action_by              User @relation(fields: [action_by_id], references: [id])

  @@map("tb_period_activity")
  @@index([period_end_id])
  @@index([action_type])
  @@index([action_date])
  @@index([action_by_id])
}
```

**enum_activity_action**:
```prisma
enum enum_activity_action {
  create           // Period created
  status_change    // Status transitioned
  task_complete    // Task marked complete
  close            // Period closed
  reopen           // Period re-opened
  cancel           // Period cancelled
  notes_update     // Notes field updated
}
```

**FieldChange JSONB Structure**:
```typescript
interface FieldChange {
  field: string;          // Field name that changed
  oldValue: string | null;
  newValue: string | null;
  dataType: string;       // 'string', 'number', 'date', 'boolean'
}

// Example:
{
  "field": "notes",
  "oldValue": "Original notes",
  "newValue": "Updated notes",
  "dataType": "string"
}
```

**Field Descriptions**:
- **period_end_id**: Foreign key to parent period
- **action_type**: Type of action performed
- **action_date**: High-precision timestamp (microsecond level)
- **action_by_id**: User ID who performed action
- **action_by_name**: Denormalized user name (preserved even if user deleted)
- **ip_address**: User's IP address for security audit
- **user_agent**: Browser/client information
- **from_status**: Previous status (for status_change actions)
- **to_status**: New status (for status_change actions)
- **task_name**: Task name (for task_complete actions)
- **reason**: Explanation (for reopen, cancel actions)
- **field_changes**: Array of field changes (for notes_update)
- **notes**: Additional context for the action

**Business Rules**:
- Activity log entries are IMMUTABLE (no updates or deletes)
- All period actions must be logged automatically
- Activity log must be retained for minimum 7 years
- Log includes sufficient detail for forensic audit

---

## 3. Database Indexes

### 3.1 Performance Indexes

```sql
-- Period End Indexes
CREATE INDEX idx_period_end_period_id ON tb_period_end (period_id);
CREATE INDEX idx_period_end_status ON tb_period_end (status);
CREATE INDEX idx_period_end_dates ON tb_period_end (start_date, end_date);
CREATE INDEX idx_period_end_created_at ON tb_period_end (created_at DESC);

-- Find active period
CREATE INDEX idx_period_end_active ON tb_period_end (status) WHERE status = 'in_progress';

-- Period Task Indexes
CREATE INDEX idx_period_task_period_id ON tb_period_task (period_end_id);
CREATE INDEX idx_period_task_status ON tb_period_task (status);
CREATE INDEX idx_period_task_sequence ON tb_period_task (period_end_id, sequence);

-- Find incomplete tasks
CREATE INDEX idx_period_task_pending ON tb_period_task (period_end_id, status) WHERE status = 'pending';

-- Period Activity Indexes
CREATE INDEX idx_period_activity_period_id ON tb_period_activity (period_end_id);
CREATE INDEX idx_period_activity_action_type ON tb_period_activity (action_type);
CREATE INDEX idx_period_activity_action_date ON tb_period_activity (action_date DESC);
CREATE INDEX idx_period_activity_action_by ON tb_period_activity (action_by_id);

-- Activity log chronological view
CREATE INDEX idx_period_activity_chronological ON tb_period_activity (period_end_id, action_date DESC);
```

### 3.2 Unique Constraints

```sql
-- Ensure unique period IDs
ALTER TABLE tb_period_end
  ADD CONSTRAINT uq_period_end_period_id UNIQUE (period_id);

-- Ensure task sequence uniqueness per period
ALTER TABLE tb_period_task
  ADD CONSTRAINT uq_period_task_sequence UNIQUE (period_end_id, sequence);
```

---

## 4. Database Constraints

### 4.1 Check Constraints

```sql
-- Period dates must be valid
ALTER TABLE tb_period_end
  ADD CONSTRAINT chk_period_end_dates
  CHECK (start_date < end_date);

-- Period ID format validation
ALTER TABLE tb_period_end
  ADD CONSTRAINT chk_period_end_period_id_format
  CHECK (period_id ~ '^PE-[0-9]{4}-[0-9]{2}$');

-- Notes length limit
ALTER TABLE tb_period_end
  ADD CONSTRAINT chk_period_end_notes_length
  CHECK (notes IS NULL OR LENGTH(notes) <= 1000);

-- Re-open reason minimum length
ALTER TABLE tb_period_end
  ADD CONSTRAINT chk_period_end_reopen_reason_length
  CHECK (reopen_reason IS NULL OR LENGTH(reopen_reason) >= 100);

-- Cancel reason minimum length
ALTER TABLE tb_period_end
  ADD CONSTRAINT chk_period_end_cancel_reason_length
  CHECK (cancel_reason IS NULL OR LENGTH(cancel_reason) >= 50);

-- Task sequence must be positive
ALTER TABLE tb_period_task
  ADD CONSTRAINT chk_period_task_sequence_positive
  CHECK (sequence > 0);

-- IP address format validation
ALTER TABLE tb_period_activity
  ADD CONSTRAINT chk_period_activity_ip_format
  CHECK (ip_address ~ '^([0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$');
```

### 4.2 Foreign Key Constraints

```sql
-- Period Task → Period End
ALTER TABLE tb_period_task
  ADD CONSTRAINT fk_period_task_period_end
  FOREIGN KEY (period_end_id) REFERENCES tb_period_end(id)
  ON DELETE CASCADE;

-- Period Activity → Period End
ALTER TABLE tb_period_activity
  ADD CONSTRAINT fk_period_activity_period_end
  FOREIGN KEY (period_end_id) REFERENCES tb_period_end(id)
  ON DELETE CASCADE;

-- Period End → User (completed_by)
ALTER TABLE tb_period_end
  ADD CONSTRAINT fk_period_end_completed_by
  FOREIGN KEY (completed_by_id) REFERENCES tb_user(id)
  ON DELETE SET NULL;

-- Period Task → User (completed_by)
ALTER TABLE tb_period_task
  ADD CONSTRAINT fk_period_task_completed_by
  FOREIGN KEY (completed_by_id) REFERENCES tb_user(id)
  ON DELETE SET NULL;

-- Period Activity → User (action_by)
ALTER TABLE tb_period_activity
  ADD CONSTRAINT fk_period_activity_action_by
  FOREIGN KEY (action_by_id) REFERENCES tb_user(id)
  ON DELETE RESTRICT;  -- Cannot delete user with activity log
```

### 4.3 NOT NULL Constraints

```sql
-- Period End required fields
ALTER TABLE tb_period_end
  ALTER COLUMN period_id SET NOT NULL,
  ALTER COLUMN period_name SET NOT NULL,
  ALTER COLUMN start_date SET NOT NULL,
  ALTER COLUMN end_date SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

-- Period Task required fields
ALTER TABLE tb_period_task
  ALTER COLUMN period_end_id SET NOT NULL,
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN sequence SET NOT NULL,
  ALTER COLUMN is_required SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

-- Period Activity required fields
ALTER TABLE tb_period_activity
  ALTER COLUMN period_end_id SET NOT NULL,
  ALTER COLUMN action_type SET NOT NULL,
  ALTER COLUMN action_date SET NOT NULL,
  ALTER COLUMN action_by_id SET NOT NULL,
  ALTER COLUMN action_by_name SET NOT NULL,
  ALTER COLUMN ip_address SET NOT NULL;
```

---

## 5. Database Triggers

### 5.1 Activity Log Trigger

**Purpose**: Automatically log period status changes in activity log.

```sql
CREATE OR REPLACE FUNCTION log_period_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO tb_period_activity (
      period_end_id,
      action_type,
      action_date,
      action_by_id,
      action_by_name,
      ip_address,
      from_status,
      to_status
    ) VALUES (
      NEW.id,
      'status_change',
      NOW(),
      NEW.updated_by_id,
      (SELECT name FROM tb_user WHERE id = NEW.updated_by_id),
      current_setting('app.current_user_ip', true),
      OLD.status::text,
      NEW.status::text
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_period_status_change
  AFTER UPDATE ON tb_period_end
  FOR EACH ROW
  EXECUTE FUNCTION log_period_status_change();
```

### 5.2 Single Active Period Trigger

**Purpose**: Enforce business rule that only one period can be "in_progress" at a time.

```sql
CREATE OR REPLACE FUNCTION enforce_single_active_period()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  -- If setting status to in_progress
  IF NEW.status = 'in_progress' THEN
    -- Check if another period is already in_progress
    SELECT COUNT(*) INTO active_count
    FROM tb_period_end
    WHERE status = 'in_progress'
      AND id != NEW.id
      AND deleted_at IS NULL;

    IF active_count > 0 THEN
      RAISE EXCEPTION 'Only one period can be in progress at a time. Please close or cancel the current active period first.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_single_active_period
  BEFORE INSERT OR UPDATE ON tb_period_end
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_active_period();
```

### 5.3 Immutable Activity Log Trigger

**Purpose**: Prevent modification or deletion of activity log entries.

```sql
CREATE OR REPLACE FUNCTION prevent_activity_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Activity log entries are immutable and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_activity_log_update
  BEFORE UPDATE ON tb_period_activity
  FOR EACH ROW
  EXECUTE FUNCTION prevent_activity_log_changes();

CREATE TRIGGER trigger_prevent_activity_log_delete
  BEFORE DELETE ON tb_period_activity
  FOR EACH ROW
  EXECUTE FUNCTION prevent_activity_log_changes();
```

---

## 6. Integration with Existing Schema

### 6.1 Integration Points

**User Table (tb_user)**:
- Period End references user for completed_by, reopened_by, created_by
- Period Task references user for completed_by
- Period Activity references user for action_by

**Inventory Transaction Validation**:
- All inventory transactions check period status before posting
- Transactions can only post to periods with status = 'open' or 'in_progress'
- Closed periods reject new transaction posting

**Physical Count Module**:
- Period closure checklist validates physical count completion
- Integration via status check (all scheduled counts must be committed)

**Inventory Adjustments Module**:
- Period detail displays adjustments created during period
- Integration via date range query (adjustment date between period dates)

### 6.2 Migration Strategy

**Phase 1: Create Tables**
```sql
-- Create tables in order of dependencies
CREATE TABLE tb_period_end (...);
CREATE TABLE tb_period_task (...);
CREATE TABLE tb_period_activity (...);
```

**Phase 2: Create Indexes**
```sql
-- Create performance indexes
CREATE INDEX idx_period_end_period_id ...;
CREATE INDEX idx_period_task_period_id ...;
CREATE INDEX idx_period_activity_period_id ...;
```

**Phase 3: Add Constraints**
```sql
-- Add foreign keys and check constraints
ALTER TABLE tb_period_task ADD CONSTRAINT fk_period_task_period_end ...;
ALTER TABLE tb_period_end ADD CONSTRAINT chk_period_end_dates ...;
```

**Phase 4: Create Triggers**
```sql
-- Create business logic triggers
CREATE TRIGGER trigger_log_period_status_change ...;
CREATE TRIGGER trigger_enforce_single_active_period ...;
```

**Phase 5: Seed Default Data**
```sql
-- Create current period if doesn't exist
INSERT INTO tb_period_end (period_id, period_name, start_date, end_date, status)
VALUES (
  'PE-' || TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
  TO_CHAR(CURRENT_DATE, 'Month YYYY'),
  DATE_TRUNC('month', CURRENT_DATE),
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 second'),
  'open'
);
```

---

## 7. Query Optimization

### 7.1 Common Query Patterns

**1. Get Current Active Period**
```sql
SELECT * FROM tb_period_end
WHERE status = 'in_progress'
  AND deleted_at IS NULL
LIMIT 1;

-- Uses: idx_period_end_active (partial index)
-- Expected Performance: <10ms
```

**2. Get Period Detail with Tasks**
```sql
SELECT
  p.*,
  json_agg(t.*) FILTER (WHERE t.id IS NOT NULL) AS tasks
FROM tb_period_end p
LEFT JOIN tb_period_task t ON t.period_end_id = p.id AND t.deleted_at IS NULL
WHERE p.period_id = 'PE-2024-01'
GROUP BY p.id;

-- Uses: idx_period_end_period_id, idx_period_task_period_id
-- Expected Performance: <50ms
```

**3. Get Period Activity Log**
```sql
SELECT * FROM tb_period_activity
WHERE period_end_id = 'uuid-here'
ORDER BY action_date DESC
LIMIT 100;

-- Uses: idx_period_activity_chronological
-- Expected Performance: <30ms for 1000 entries
```

**4. Check if Period Can Be Closed**
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'pending' AND is_required = true) AS pending_required_count
FROM tb_period_task
WHERE period_end_id = 'uuid-here'
  AND deleted_at IS NULL;

-- Uses: idx_period_task_pending (partial index)
-- Expected Performance: <20ms
```

**5. Find Periods Within Date Range**
```sql
SELECT * FROM tb_period_end
WHERE start_date <= '2024-12-31'
  AND end_date >= '2024-01-01'
  AND deleted_at IS NULL
ORDER BY start_date DESC;

-- Uses: idx_period_end_dates
-- Expected Performance: <15ms for 36 periods (3 years)
```

### 7.2 Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| List periods (paginated) | <100ms | For 36 periods (3 years) |
| Get period detail | <50ms | Including tasks |
| Check period status | <10ms | Cached in application layer |
| Create period | <200ms | Including default tasks |
| Update period status | <150ms | Including activity log |
| Get activity log | <30ms | For 1000 entries |
| Validate closure | <50ms | Check all task completion |

---

## 8. Data Retention and Archival

### 8.1 Retention Policy

**Period End Records**:
- Retention: Indefinite (never archive or delete)
- Reason: Financial compliance and audit requirements

**Period Task Records**:
- Retention: Indefinite (linked to period)
- Reason: Part of period closure documentation

**Period Activity Records**:
- Retention: Minimum 7 years, preferably indefinite
- Reason: SOX, GAAP compliance requirements

### 8.2 Archival Strategy (Future Enhancement)

**After 2 Years**:
- Move activity log to separate archive table
- Maintain foreign key reference for audit queries
- Archive table: `tb_period_activity_archive`

**Archive Process**:
```sql
-- Move old activity logs to archive (run annually)
INSERT INTO tb_period_activity_archive
SELECT * FROM tb_period_activity
WHERE action_date < (CURRENT_DATE - INTERVAL '2 years');

DELETE FROM tb_period_activity
WHERE action_date < (CURRENT_DATE - INTERVAL '2 years');
```

---

## 9. Security Considerations

### 9.1 Row-Level Security (RLS)

**Future Enhancement**: Implement RLS for multi-tenant deployments.

```sql
-- Enable RLS on period tables
ALTER TABLE tb_period_end ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_period_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_period_activity ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see periods for their organization
CREATE POLICY period_end_org_isolation ON tb_period_end
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

### 9.2 Sensitive Data Protection

**Activity Log IP Address**:
- Store IP addresses for security audit
- Hash or anonymize after 90 days for GDPR compliance (future)
- Maintain hash for forensic correlation

**User Agent Strings**:
- Store for debugging and security analysis
- No PII in user agent strings (browser/OS info only)

---

## 10. Testing Data

### 10.1 Seed Data for Development

```sql
-- Create test periods
INSERT INTO tb_period_end (period_id, period_name, start_date, end_date, status)
VALUES
  ('PE-2024-01', 'January 2024', '2024-01-01', '2024-01-31 23:59:59', 'closed'),
  ('PE-2024-02', 'February 2024', '2024-02-01', '2024-02-29 23:59:59', 'in_progress'),
  ('PE-2024-03', 'March 2024', '2024-03-01', '2024-03-31 23:59:59', 'open');

-- Create default tasks for each period
INSERT INTO tb_period_task (period_end_id, name, sequence, is_required, status)
SELECT
  p.id,
  task.name,
  task.seq,
  true,
  'pending'
FROM tb_period_end p
CROSS JOIN (
  VALUES
    ('Complete Physical Count', 1),
    ('Reconcile Inventory Adjustments', 2),
    ('Review Variances', 3),
    ('Post Period End Entries', 4)
) AS task(name, seq);
```

---

## 11. Related Documentation

### Inventory Management Modules
- [Period End Business Requirements](./BR-period-end.md)
- [Period End Use Cases](./UC-period-end.md)
- [Period End Technical Specification](./TS-period-end.md)
- [Period End Flow Diagrams](./FD-period-end.md)
- [Period End Validations](./VAL-period-end.md)

### Shared Methods
- [Period End Snapshots](../../shared-methods/inventory-valuation/SM-period-end-snapshots.md)
- [Period Management](../../shared-methods/inventory-valuation/SM-period-management.md)
- [Inventory Valuation Service](../../shared-methods/inventory-valuation/SM-inventory-valuation.md)

### Database Documentation
- [Schema Definition](/docs/app/data-struc/schema.prisma)
- [Type System](/lib/types/)
- [Database Migrations](/prisma/migrations/)

---

**Document Status**: Draft
**Last Review**: 2025-01-12
**Next Review**: 2025-04-12
**Maintained By**: Inventory Management Team
