# Data Definition: Purchase Request Templates

## Module Information
- **Module**: Procurement
- **Sub-Module**: Purchase Request Templates
- **Route**: `/procurement/purchase-request-templates`
- **Version**: 1.0.0
- **Last Updated**: 2025-12-04
- **Owner**: Procurement Team
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-11 | System Documentation | Initial version |
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |
| 1.2.0 | 2025-12-04 | Documentation Team | Aligned with prototype - simplified item fields, updated status/type values |


---

## Overview

This document defines the complete data schema for the Purchase Request Templates sub-module, including table structures, relationships, indexes, and constraints. The schema supports template management, item tracking, version control, soft deletes, and audit trails.

**Related Documents**:
- [Backend Requirements](./BE-purchase-request-templates.md)
- [Business Requirements](./BR-purchase-request-templates.md)
- [Technical Specification](./TS-purchase-request-templates.md)

---

## Database Tables

### Table: purchase_request_templates

**Purpose**: Stores template header information for reusable purchase request blueprints

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique template identifier |
| template_number | VARCHAR(20) | NOT NULL, UNIQUE | Human-readable template number (TPL-YY-NNNN) |
| description | VARCHAR(500) | NOT NULL, CHECK (length >= 10) | Template description/notes |
| department_id | UUID | NOT NULL, FOREIGN KEY → departments(id) | Assigned department |
| request_type | VARCHAR(20) | NOT NULL, DEFAULT 'goods' | Template classification (goods, services, capital) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | Lifecycle status (draft, active, inactive) |
| is_default | BOOLEAN | NOT NULL, DEFAULT false | Default template flag for department |
| estimated_total | DECIMAL(15,2) | NOT NULL, DEFAULT 0.00 | Sum of all item totals |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'THB' | Base currency code |
| usage_count | INTEGER | NOT NULL, DEFAULT 0 | Number of times converted to PR |
| last_used_at | TIMESTAMP WITH TIME ZONE | NULL | Last conversion to PR timestamp |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Creation timestamp |
| created_by | UUID | NOT NULL, FOREIGN KEY → users(id) | Creator user ID |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Last modification timestamp |
| updated_by | UUID | NOT NULL, FOREIGN KEY → users(id) | Last modifier user ID |
| deleted_at | TIMESTAMP WITH TIME ZONE | NULL | Soft delete timestamp |
| deleted_by | UUID | NULL, FOREIGN KEY → users(id) | User who deleted |

**Indexes**:
- `idx_templates_number` ON template_number (for lookups)
- `idx_templates_department_id` ON department_id (for filtering)
- `idx_templates_status` ON status (for filtering)
- `idx_templates_created_date` ON created_date DESC (for sorting)
- `idx_templates_default` ON (department_id, is_default) WHERE is_default = true (for default lookups)
- `idx_templates_deleted` ON deleted_at (for soft delete filtering)

**Unique Constraints**:
- UNIQUE (template_number)
- UNIQUE (department_id, is_default) WHERE is_default = true AND deleted_at IS NULL (only one default per department)

**Check Constraints**:
- `chk_template_description_length`: length(description) >= 10
- `chk_template_request_type`: request_type IN ('goods', 'services', 'capital')
- `chk_template_status`: status IN ('draft', 'active', 'inactive')
- `chk_template_estimated_total`: estimated_total >= 0

---

### Table: template_items

**Purpose**: Stores individual line items within purchase request templates

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique item identifier |
| template_id | UUID | NOT NULL, FOREIGN KEY → purchase_request_templates(id) ON DELETE CASCADE | Parent template |
| line_number | INTEGER | NOT NULL | Display order (1-based) |
| item_code | VARCHAR(50) | NOT NULL | Product/SKU code |
| description | VARCHAR(500) | NOT NULL, CHECK (length >= 5) | Item description |
| uom | VARCHAR(20) | NOT NULL | Unit of measure (KG, EA, BTL, CTN, etc.) |
| quantity | DECIMAL(10,3) | NOT NULL, CHECK (> 0) | Ordered quantity |
| unit_price | DECIMAL(15,2) | NOT NULL, CHECK (>= 0) | Price per unit |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'THB' | Item currency |
| total_amount | DECIMAL(15,2) | NOT NULL | quantity × unit_price (calculated) |
| budget_code | VARCHAR(50) | NOT NULL | Budget allocation code |
| account_code | VARCHAR(50) | NOT NULL | GL account code |
| department | VARCHAR(100) | NOT NULL | Department code |
| tax_code | VARCHAR(20) | NOT NULL | Tax treatment code (VAT7, VAT0, EXEMPT) |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Creation timestamp |
| created_by | UUID | NOT NULL, FOREIGN KEY → users(id) | Creator user ID |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT NOW() | Last modification timestamp |
| updated_by | UUID | NOT NULL, FOREIGN KEY → users(id) | Last modifier user ID |

> **Note**: Advanced pricing fields (discount_rate, tax_rate, tax_included, currency_rate, base_amount, discount_amount, net_amount, tax_amount) are planned for Phase 2.

**Indexes**:
- `idx_template_items_template_id` ON template_id (for fetching items by template)
- `idx_template_items_line_number` ON (template_id, line_number) (for sorting)
- `idx_template_items_item_code` ON (template_id, item_code) (for duplicate checking)

**Unique Constraints**:
- UNIQUE (template_id, item_code) (no duplicate item codes per template)
- UNIQUE (template_id, line_number) (unique line numbers)

**Check Constraints**:
- `chk_item_description_length`: length(description) >= 5
- `chk_item_quantity`: quantity > 0
- `chk_item_unit_price`: unit_price >= 0
- `chk_item_total_amount`: total_amount >= 0
- `chk_item_tax_code`: tax_code IN ('VAT7', 'VAT0', 'EXEMPT')

**Foreign Key Relationships**:
- template_id → purchase_request_templates(id) ON DELETE CASCADE (deleting template removes all items)
- created_by → users(id)
- updated_by → users(id)

---

### Table: template_activity_log

**Purpose**: Audit trail for all template operations

**Columns**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique log entry ID |
| template_id | UUID | NOT NULL, FOREIGN KEY → purchase_request_templates(id) | Template reference |
| action | VARCHAR(50) | NOT NULL | Action performed |
| details | JSONB | NULL | Additional action details |
| user_id | UUID | NOT NULL, FOREIGN KEY → users(id) | User who performed action |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | Action timestamp |

**Indexes**:
- `idx_activity_template_id` ON template_id
- `idx_activity_timestamp` ON timestamp DESC

**Actions Logged**:
- template_created, template_updated, template_deleted
- template_cloned, template_activated, template_inactivated
- template_set_default, template_remove_default
- item_added, item_updated, item_deleted

> **Note**: template_converted_to_pr action will be added in Phase 2 when Template→PR conversion is implemented.

---

## Relationships

### Entity Relationship Diagram

```
┌─────────────────────────┐
│     departments         │
└───────────┬─────────────┘
            │ 1
            │
            │ N
┌───────────▼─────────────┐
│  purchase_request_      │
│      templates          │
└───────────┬─────────────┘
            │ 1
            │
            │ N
┌───────────▼─────────────┐
│    template_items       │
└─────────────────────────┘

┌─────────────────────────┐
│        users            │
└───┬───┬───┬─────────────┘
    │   │   │
    │   │   └─────► created_by (templates, items)
    │   └─────────► updated_by (templates, items)
    └─────────────► deleted_by (templates, items)

┌─────────────────────────┐
│  purchase_request_      │
│     templates           │
└───────────┬─────────────┘
            │ 1
            │
            │ N
┌───────────▼─────────────┐
│ template_activity_log   │
└─────────────────────────┘
```

### Relationship Cardinalities

**One-to-Many**:
- Department → Templates (1:N) - Each department has many templates
- Template → Items (1:N) - Each template has many items
- Template → Activity Logs (1:N) - Each template has many log entries
- User → Templates (1:N created, 1:N updated) - User creates/updates many templates
- User → Items (1:N created, 1:N updated) - User creates/updates many items

**Many-to-One**:
- Template → Department (N:1) - Many templates belong to one department
- Item → Template (N:1) - Many items belong to one template

---

## Database Views

### View: v_active_templates

**Purpose**: Pre-filtered view of non-deleted active templates with department info

```sql
CREATE VIEW v_active_templates AS
SELECT
    t.*,
    d.name as department_name,
    uc.name as created_by_name,
    uu.name as updated_by_name,
    COUNT(ti.id) as item_count
FROM purchase_request_templates t
LEFT JOIN departments d ON t.department_id = d.id
LEFT JOIN users uc ON t.created_by = uc.id
LEFT JOIN users uu ON t.updated_by = uu.id
LEFT JOIN template_items ti ON t.id = ti.template_id AND ti.deleted_at IS NULL
WHERE t.deleted_at IS NULL
  AND t.status = 'active'
GROUP BY t.id, d.name, uc.name, uu.name;
```

### View: v_default_templates_by_department

**Purpose**: Quick lookup of default template for each department

```sql
CREATE VIEW v_default_templates_by_department AS
SELECT
    d.id as department_id,
    d.name as department_name,
    t.*
FROM departments d
LEFT JOIN purchase_request_templates t
    ON d.id = t.department_id
    AND t.is_default = true
    AND t.deleted_at IS NULL
WHERE d.is_active = true;
```

---

## Triggers

### Trigger: update_template_estimated_total

**Purpose**: Automatically recalculate template estimated total when items change

**Events**: AFTER INSERT, UPDATE, DELETE ON template_items

**Logic**: Sum all item total_amounts and update parent template.estimated_total

### Trigger: update_template_updated_date

**Purpose**: Automatically update template.updated_date on any change

**Events**: BEFORE UPDATE ON purchase_request_templates

**Logic**: Set updated_date = NOW()

### Trigger: enforce_single_default_per_department

**Purpose**: Ensure only one template per department can be default

**Events**: BEFORE INSERT, UPDATE ON purchase_request_templates

**Logic**: If is_default = true, set is_default = false for all other templates in same department

### Trigger: log_template_activity

**Purpose**: Automatically log all template operations

**Events**: AFTER INSERT, UPDATE, DELETE ON purchase_request_templates

**Logic**: Insert record into template_activity_log with action type and details

---

## Data Migration Strategy

### Initial Setup
1. Create departments table (if not exists)
2. Create users table (if not exists)
3. Create purchase_request_templates table
4. Create template_items table
5. Create template_activity_log table
6. Create indexes
7. Create constraints
8. Create views
9. Create triggers

### Sample Data Seeding
- Create 3-5 sample templates per department
- Add 5-10 items per template
- Set one template as default for each department
- Generate activity log entries for audit trail testing

---

## Data Retention

### Soft Delete Policy
- Templates deleted via UI: Set deleted_at timestamp, retain for 90 days
- After 90 days: Archive to cold storage or permanent delete
- Template items: Cascade soft delete when parent template deleted

### Audit Log Retention
- Activity logs retained indefinitely for compliance
- Logs older than 2 years moved to archive storage
- Critical actions (delete, set default) never purged

---

## Appendix

### Sample Queries

**Get template with all items**:
```sql
SELECT t.*, ti.*
FROM purchase_request_templates t
LEFT JOIN template_items ti ON t.id = ti.template_id AND ti.deleted_at IS NULL
WHERE t.id = $1 AND t.deleted_at IS NULL
ORDER BY ti.line_number;
```

**Get default template for department**:
```sql
SELECT * FROM purchase_request_templates
WHERE department_id = $1
  AND is_default = true
  AND deleted_at IS NULL
  AND status = 'active';
```

**Get template usage statistics**:
```sql
SELECT
    template_number,
    description,
    usage_count,
    last_used_date,
    EXTRACT(days FROM NOW() - last_used_date) as days_since_last_use
FROM purchase_request_templates
WHERE deleted_at IS NULL
ORDER BY usage_count DESC;
```

---

**Document End**
