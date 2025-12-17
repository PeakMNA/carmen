# Data Definition: Department and Cost Center Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Department and Cost Center Management
- **Route**: `/finance/department-management`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-13
- **Owner**: Finance Product Team
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-13 | Finance Product Team | Initial version |
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |

---

## Overview

This document defines the complete data schema for the Department and Cost Center Management module, including database tables, fields, data types, constraints, relationships, and indexes. The schema is designed to support organizational structure tracking, hierarchical department relationships (up to 5 levels), budget allocation and tracking, department head assignment with approval limits, and comprehensive audit trails.

The schema follows PostgreSQL conventions and leverages Prisma ORM for type safety and migration management. All monetary values use `Decimal` type with appropriate precision, and all timestamps are stored in UTC timezone. Row-Level Security (RLS) policies are applied to ensure data protection based on user roles and department assignments.

---

## Database Tables

### 1. departments

**Purpose**: Core table storing department master data with hierarchical structure, budget allocation, and organizational configuration.

**Schema**:
```sql
CREATE TABLE departments (
  -- Primary Key
  department_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Department Identification
  department_code         VARCHAR(20) NOT NULL UNIQUE,  -- Unique code (KITCHEN, FB-DIV)
  department_name         VARCHAR(100) NOT NULL,        -- Full name
  department_short_name   VARCHAR(20),                  -- Abbreviated name for displays
  description             TEXT,

  -- Classification
  department_type         VARCHAR(30) NOT NULL CHECK (department_type IN ('operational', 'administrative', 'support', 'revenue_generating')),
  is_cost_center          BOOLEAN NOT NULL DEFAULT false,
  cost_center_code        VARCHAR(20),                  -- Primary cost center code

  -- Hierarchy
  parent_department_id    UUID,                         -- Link to parent department
  hierarchy_level         INTEGER NOT NULL DEFAULT 0,   -- 0=root, 5=max depth
  hierarchy_path          VARCHAR(500) NOT NULL,        -- /ROOT/DIV/DEPT format
  allow_sub_departments   BOOLEAN NOT NULL DEFAULT true,

  -- Financial Configuration
  default_expense_account VARCHAR(50),                  -- GL account for expenses
  default_revenue_account VARCHAR(50),                  -- GL account for revenue (if applicable)
  budget_year             INTEGER NOT NULL,             -- Fiscal year
  budget_amount           DECIMAL(18, 2) NOT NULL DEFAULT 0,
  budget_currency         VARCHAR(3) NOT NULL DEFAULT 'USD',

  -- Location Association
  primary_location_id     UUID,                         -- Primary physical location
  physical_location       VARCHAR(200),                 -- Physical location description
  phone_number            VARCHAR(20),
  email_address           VARCHAR(100),

  -- Approval Configuration
  requires_approval_workflow BOOLEAN NOT NULL DEFAULT true,
  approval_limit          DECIMAL(18, 2) NOT NULL DEFAULT 0,
  approval_currency       VARCHAR(3) NOT NULL DEFAULT 'USD',

  -- Status and Dates
  status                  VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'suspended', 'archived')),
  effective_date          TIMESTAMPTZ NOT NULL,         -- When department becomes active
  end_date                TIMESTAMPTZ,                  -- When department becomes inactive

  -- Audit
  created_by              UUID NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by              UUID,
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  notes                   TEXT,

  -- Foreign Keys
  CONSTRAINT fk_parent_department FOREIGN KEY (parent_department_id) REFERENCES departments(department_id) ON DELETE RESTRICT,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id),

  -- Constraints
  CONSTRAINT chk_hierarchy_level CHECK (hierarchy_level BETWEEN 0 AND 5),
  CONSTRAINT chk_budget_positive CHECK (budget_amount >= 0),
  CONSTRAINT chk_approval_limit_positive CHECK (approval_limit >= 0),
  CONSTRAINT chk_effective_before_end CHECK (end_date IS NULL OR end_date > effective_date),
  CONSTRAINT chk_no_self_parent CHECK (department_id != parent_department_id)
);

-- Indexes for performance optimization
CREATE INDEX idx_departments_code ON departments(department_code);
CREATE INDEX idx_departments_parent ON departments(parent_department_id, hierarchy_level);
CREATE INDEX idx_departments_status ON departments(status) WHERE status = 'active';
CREATE INDEX idx_departments_hierarchy_path ON departments(hierarchy_path);
CREATE INDEX idx_departments_location ON departments(primary_location_id) WHERE primary_location_id IS NOT NULL;
CREATE INDEX idx_departments_budget_year ON departments(budget_year, status);

-- Comments
COMMENT ON TABLE departments IS 'Core department master data with hierarchical structure and budget allocation';
COMMENT ON COLUMN departments.hierarchy_path IS 'Path from root to this department, e.g., /FB-DIV/KITCHEN';
COMMENT ON COLUMN departments.hierarchy_level IS 'Depth in hierarchy: 0=root, 1=division, 2=department, 3-5=sub-departments';
```

**TypeScript Interface**:
```typescript
interface Department {
  department_id: string
  department_code: string
  department_name: string
  department_short_name?: string
  description?: string
  department_type: 'operational' | 'administrative' | 'support' | 'revenue_generating'
  is_cost_center: boolean
  cost_center_code?: string
  parent_department_id?: string
  hierarchy_level: number
  hierarchy_path: string
  allow_sub_departments: boolean
  default_expense_account?: string
  default_revenue_account?: string
  budget_year: number
  budget_amount: Decimal
  budget_currency: string
  primary_location_id?: string
  physical_location?: string
  phone_number?: string
  email_address?: string
  requires_approval_workflow: boolean
  approval_limit: Decimal
  approval_currency: string
  status: 'draft' | 'active' | 'inactive' | 'suspended' | 'archived'
  effective_date: Date
  end_date?: Date
  created_by: string
  created_at: Date
  updated_by?: string
  updated_at: Date
  notes?: string
}
```

---

### 2. department_heads

**Purpose**: Track department head assignments with approval authorities, delegation capabilities, and performance metrics.

**Schema**:
```sql
CREATE TABLE department_heads (
  -- Primary Key
  head_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Department Assignment
  department_id           UUID NOT NULL,
  user_id                 UUID NOT NULL,

  -- Role and Priority
  head_role               VARCHAR(20) NOT NULL CHECK (head_role IN ('primary', 'secondary', 'backup', 'interim')),
  priority_order          INTEGER NOT NULL DEFAULT 1,  -- 1=highest priority

  -- Contact Information
  email                   VARCHAR(100) NOT NULL,
  secondary_email         VARCHAR(100),
  phone                   VARCHAR(20) NOT NULL,
  mobile_phone            VARCHAR(20),
  office_location         VARCHAR(200),

  -- Approval Configuration
  approval_limit          DECIMAL(18, 2) NOT NULL DEFAULT 0,
  approval_limit_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  can_approve_budgets     BOOLEAN NOT NULL DEFAULT false,
  can_approve_transfers   BOOLEAN NOT NULL DEFAULT false,
  can_delegate_approval   BOOLEAN NOT NULL DEFAULT false,

  -- Delegation
  delegate_to_user_id     UUID,
  delegation_start_date   DATE,
  delegation_end_date     DATE,
  delegation_reason       TEXT,

  -- Status and Dates
  is_active               BOOLEAN NOT NULL DEFAULT true,
  effective_date          TIMESTAMPTZ NOT NULL,
  end_date                TIMESTAMPTZ,
  termination_reason      TEXT,

  -- Performance Metrics (updated periodically)
  approvals_this_month    INTEGER NOT NULL DEFAULT 0,
  average_approval_time_hours DECIMAL(8, 2) NOT NULL DEFAULT 0,
  pending_approvals_count INTEGER NOT NULL DEFAULT 0,

  -- Audit
  assigned_by             UUID NOT NULL,
  assigned_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by              UUID,
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  notes                   TEXT,

  -- Foreign Keys
  CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT fk_delegate_to_user FOREIGN KEY (delegate_to_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(user_id),
  CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id),

  -- Constraints
  CONSTRAINT chk_priority_positive CHECK (priority_order > 0),
  CONSTRAINT chk_approval_limit_positive CHECK (approval_limit >= 0),
  CONSTRAINT chk_delegation_dates CHECK (delegation_end_date IS NULL OR delegation_end_date >= delegation_start_date),
  CONSTRAINT chk_effective_before_end CHECK (end_date IS NULL OR end_date > effective_date),

  -- Unique Constraints
  CONSTRAINT uq_department_user_role UNIQUE (department_id, user_id, head_role)
);

-- Indexes
CREATE INDEX idx_department_heads_dept ON department_heads(department_id, is_active);
CREATE INDEX idx_department_heads_user ON department_heads(user_id, is_active);
CREATE INDEX idx_department_heads_active ON department_heads(is_active, priority_order) WHERE is_active = true;
CREATE INDEX idx_department_heads_delegation ON department_heads(delegate_to_user_id) WHERE delegate_to_user_id IS NOT NULL;

-- Comments
COMMENT ON TABLE department_heads IS 'Department head assignments with approval authorities and delegation';
COMMENT ON COLUMN department_heads.priority_order IS 'Approval routing priority: 1=first approver, 2=secondary, etc.';
COMMENT ON COLUMN department_heads.average_approval_time_hours IS 'Average time to approve requests in hours';
```

**TypeScript Interface**:
```typescript
interface DepartmentHead {
  head_id: string
  department_id: string
  user_id: string
  head_role: 'primary' | 'secondary' | 'backup' | 'interim'
  priority_order: number
  email: string
  secondary_email?: string
  phone: string
  mobile_phone?: string
  office_location?: string
  approval_limit: Decimal
  approval_limit_currency: string
  can_approve_budgets: boolean
  can_approve_transfers: boolean
  can_delegate_approval: boolean
  delegate_to_user_id?: string
  delegation_start_date?: Date
  delegation_end_date?: Date
  delegation_reason?: string
  is_active: boolean
  effective_date: Date
  end_date?: Date
  termination_reason?: string
  approvals_this_month: number
  average_approval_time_hours: Decimal
  pending_approvals_count: number
  assigned_by: string
  assigned_at: Date
  updated_by?: string
  updated_at: Date
  notes?: string
}
```

---

### 3. cost_centers

**Purpose**: Cost center configuration and assignment to departments for expense tracking and allocation.

**Schema**:
```sql
CREATE TABLE cost_centers (
  -- Primary Key
  cost_center_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cost Center Identification
  cost_center_code        VARCHAR(20) NOT NULL UNIQUE,
  cost_center_name        VARCHAR(100) NOT NULL,
  description             TEXT,

  -- Department Association
  department_id           UUID NOT NULL,
  is_primary_cost_center  BOOLEAN NOT NULL DEFAULT false,

  -- Classification
  cost_center_type        VARCHAR(30) NOT NULL CHECK (cost_center_type IN ('direct', 'indirect', 'administrative', 'revenue_generating')),
  activity_type           VARCHAR(100),

  -- Financial Configuration
  gl_account_code         VARCHAR(50),
  budget_amount           DECIMAL(18, 2) NOT NULL DEFAULT 0,
  budget_currency         VARCHAR(3) NOT NULL DEFAULT 'USD',
  budget_year             INTEGER NOT NULL,

  -- Management
  cost_center_manager_user_id UUID,
  manager_approval_limit  DECIMAL(18, 2),

  -- Cost Allocation
  is_shared_cost_center   BOOLEAN NOT NULL DEFAULT false,
  allocation_method       VARCHAR(50),  -- 'headcount', 'square_footage', 'revenue', 'manual'
  allocation_rules        JSONB,

  -- Status and Dates
  status                  VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  effective_date          TIMESTAMPTZ NOT NULL,
  end_date                TIMESTAMPTZ,

  -- Audit
  created_by              UUID NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by              UUID,
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  notes                   TEXT,

  -- Foreign Keys
  CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
  CONSTRAINT fk_cost_center_manager FOREIGN KEY (cost_center_manager_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id),

  -- Constraints
  CONSTRAINT chk_budget_positive CHECK (budget_amount >= 0),
  CONSTRAINT chk_manager_limit_positive CHECK (manager_approval_limit IS NULL OR manager_approval_limit >= 0),
  CONSTRAINT chk_effective_before_end CHECK (end_date IS NULL OR end_date > effective_date)
);

-- Indexes
CREATE INDEX idx_cost_centers_code ON cost_centers(cost_center_code);
CREATE INDEX idx_cost_centers_department ON cost_centers(department_id, status);
CREATE INDEX idx_cost_centers_status ON cost_centers(status) WHERE status = 'active';
CREATE INDEX idx_cost_centers_primary ON cost_centers(department_id, is_primary_cost_center) WHERE is_primary_cost_center = true;

-- Comments
COMMENT ON TABLE cost_centers IS 'Cost center configuration and allocation rules';
COMMENT ON COLUMN cost_centers.allocation_rules IS 'JSON configuration for multi-department cost allocation';
```

**TypeScript Interface**:
```typescript
interface CostCenter {
  cost_center_id: string
  cost_center_code: string
  cost_center_name: string
  description?: string
  department_id: string
  is_primary_cost_center: boolean
  cost_center_type: 'direct' | 'indirect' | 'administrative' | 'revenue_generating'
  activity_type?: string
  gl_account_code?: string
  budget_amount: Decimal
  budget_currency: string
  budget_year: number
  cost_center_manager_user_id?: string
  manager_approval_limit?: Decimal
  is_shared_cost_center: boolean
  allocation_method?: string
  allocation_rules?: AllocationRules
  status: 'active' | 'inactive' | 'closed'
  effective_date: Date
  end_date?: Date
  created_by: string
  created_at: Date
  updated_by?: string
  updated_at: Date
  notes?: string
}

interface AllocationRules {
  method: 'headcount' | 'square_footage' | 'revenue' | 'custom'
  allocations: Array<{
    department_id: string
    percentage: number
    base_value?: number
  }>
}
```

---

### 4. department_budgets

**Purpose**: Track department budgets with monthly phasing, actual vs budget tracking, and alert thresholds.

**Schema**:
```sql
CREATE TABLE department_budgets (
  -- Primary Key
  budget_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Department and Period
  department_id           UUID NOT NULL,
  cost_center_id          UUID,

  -- Fiscal Period
  fiscal_year             INTEGER NOT NULL,
  fiscal_period           VARCHAR(20),  -- 'FY2025', 'Q1-2025', '2025-01'
  budget_type             VARCHAR(20) NOT NULL CHECK (budget_type IN ('annual', 'quarterly', 'monthly')),

  -- Budget Amounts
  budget_currency         VARCHAR(3) NOT NULL DEFAULT 'USD',
  total_budget_amount     DECIMAL(18, 2) NOT NULL,

  -- Monthly Phasing
  january_budget          DECIMAL(18, 2),
  february_budget         DECIMAL(18, 2),
  march_budget            DECIMAL(18, 2),
  april_budget            DECIMAL(18, 2),
  may_budget              DECIMAL(18, 2),
  june_budget             DECIMAL(18, 2),
  july_budget             DECIMAL(18, 2),
  august_budget           DECIMAL(18, 2),
  september_budget        DECIMAL(18, 2),
  october_budget          DECIMAL(18, 2),
  november_budget         DECIMAL(18, 2),
  december_budget         DECIMAL(18, 2),

  -- Category
  budget_category         VARCHAR(100),
  budget_line_item        VARCHAR(200),

  -- Tracking (updated by triggers)
  spent_to_date           DECIMAL(18, 2) NOT NULL DEFAULT 0,
  committed_amount        DECIMAL(18, 2) NOT NULL DEFAULT 0,  -- Encumbrances
  available_budget        DECIMAL(18, 2) NOT NULL,
  variance_amount         DECIMAL(18, 2) NOT NULL DEFAULT 0,
  variance_percentage     DECIMAL(8, 4) NOT NULL DEFAULT 0,

  -- Alert Thresholds
  alert_threshold_1       INTEGER NOT NULL DEFAULT 50,   -- % utilization
  alert_threshold_2       INTEGER NOT NULL DEFAULT 75,
  alert_threshold_3       INTEGER NOT NULL DEFAULT 90,
  alert_threshold_4       INTEGER NOT NULL DEFAULT 100,

  -- Status
  status                  VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'closed', 'revised')),
  approval_required       BOOLEAN NOT NULL DEFAULT true,
  approved_by             UUID,
  approved_at             TIMESTAMPTZ,

  -- Carry Forward
  allow_carry_forward     BOOLEAN NOT NULL DEFAULT false,
  carry_forward_percentage INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_by              UUID NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by              UUID,
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  notes                   TEXT,

  -- Foreign Keys
  CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
  CONSTRAINT fk_cost_center FOREIGN KEY (cost_center_id) REFERENCES cost_centers(cost_center_id),
  CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id),
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id),

  -- Constraints
  CONSTRAINT chk_budget_positive CHECK (total_budget_amount >= 0),
  CONSTRAINT chk_thresholds CHECK (alert_threshold_1 < alert_threshold_2 AND alert_threshold_2 < alert_threshold_3 AND alert_threshold_3 <= alert_threshold_4),
  CONSTRAINT chk_carry_forward CHECK (carry_forward_percentage BETWEEN 0 AND 100),

  -- Unique Constraint
  CONSTRAINT uq_department_fiscal_category UNIQUE (department_id, fiscal_year, budget_category)
);

-- Indexes
CREATE INDEX idx_department_budgets_dept ON department_budgets(department_id, fiscal_year);
CREATE INDEX idx_department_budgets_fiscal ON department_budgets(fiscal_year, status);
CREATE INDEX idx_department_budgets_status ON department_budgets(status) WHERE status IN ('active', 'approved');
CREATE INDEX idx_department_budgets_approval ON department_budgets(approval_required, status) WHERE status = 'draft';

-- Comments
COMMENT ON TABLE department_budgets IS 'Department budget allocation and tracking';
COMMENT ON COLUMN department_budgets.available_budget IS 'Total budget - spent - committed';
COMMENT ON COLUMN department_budgets.variance_percentage IS 'Percentage variance: (actual - budget) / budget * 100';
```

**TypeScript Interface**:
```typescript
interface DepartmentBudget {
  budget_id: string
  department_id: string
  cost_center_id?: string
  fiscal_year: number
  fiscal_period?: string
  budget_type: 'annual' | 'quarterly' | 'monthly'
  budget_currency: string
  total_budget_amount: Decimal
  january_budget?: Decimal
  february_budget?: Decimal
  march_budget?: Decimal
  april_budget?: Decimal
  may_budget?: Decimal
  june_budget?: Decimal
  july_budget?: Decimal
  august_budget?: Decimal
  september_budget?: Decimal
  october_budget?: Decimal
  november_budget?: Decimal
  december_budget?: Decimal
  budget_category?: string
  budget_line_item?: string
  spent_to_date: Decimal
  committed_amount: Decimal
  available_budget: Decimal
  variance_amount: Decimal
  variance_percentage: Decimal
  alert_threshold_1: number
  alert_threshold_2: number
  alert_threshold_3: number
  alert_threshold_4: number
  status: 'draft' | 'approved' | 'active' | 'closed' | 'revised'
  approval_required: boolean
  approved_by?: string
  approved_at?: Date
  allow_carry_forward: boolean
  carry_forward_percentage: number
  created_by: string
  created_at: Date
  updated_by?: string
  updated_at: Date
  notes?: string
}
```

---

### 5. department_approval_configs

**Purpose**: Configure department-specific approval workflows with tiered approval routing based on transaction amounts.

**Schema**:
```sql
CREATE TABLE department_approval_configs (
  -- Primary Key
  config_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Department
  department_id           UUID NOT NULL,

  -- Approval Tiers (JSON structure)
  approval_tiers          JSONB NOT NULL,
  /*
  Structure:
  [
    {
      tier_number: 1,
      min_amount: 0,
      max_amount: 2500,
      currency: "USD",
      approvers: [
        {approver_type: 'department_head', approver_id: 'user123', priority_order: 1}
      ],
      approval_required: 1,
      timeout_hours: 24,
      escalate_on_timeout: true
    }
  ]
  */

  -- Workflow Settings
  workflow_type           VARCHAR(20) NOT NULL DEFAULT 'sequential' CHECK (workflow_type IN ('sequential', 'parallel', 'hybrid')),
  require_all_approvers   BOOLEAN NOT NULL DEFAULT false,

  -- Escalation Rules
  escalation_enabled      BOOLEAN NOT NULL DEFAULT true,
  escalation_hours        INTEGER NOT NULL DEFAULT 48,
  escalation_to           VARCHAR(50) NOT NULL DEFAULT 'parent_department',
  escalation_user_id      UUID,
  escalation_role         VARCHAR(50),

  -- Notification Settings
  notification_enabled    BOOLEAN NOT NULL DEFAULT true,
  reminder_frequency_hours INTEGER NOT NULL DEFAULT 24,
  notify_on_approval      BOOLEAN NOT NULL DEFAULT true,
  notify_on_rejection     BOOLEAN NOT NULL DEFAULT true,

  -- Status
  is_active               BOOLEAN NOT NULL DEFAULT true,
  effective_date          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date                TIMESTAMPTZ,

  -- Audit
  created_by              UUID NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by              UUID,
  updated_at              TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign Keys
  CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
  CONSTRAINT fk_escalation_user FOREIGN KEY (escalation_user_id) REFERENCES users(user_id),
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id),
  CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id),

  -- Constraints
  CONSTRAINT chk_escalation_hours CHECK (escalation_hours > 0),
  CONSTRAINT chk_reminder_hours CHECK (reminder_frequency_hours > 0)
);

-- Indexes
CREATE INDEX idx_dept_approval_configs_dept ON department_approval_configs(department_id, is_active);
CREATE INDEX idx_dept_approval_configs_active ON department_approval_configs(is_active, effective_date) WHERE is_active = true;

-- Comments
COMMENT ON TABLE department_approval_configs IS 'Department-specific approval workflow configuration';
COMMENT ON COLUMN department_approval_configs.approval_tiers IS 'JSON array of approval tier configurations';
```

**TypeScript Interface**:
```typescript
interface DepartmentApprovalConfig {
  config_id: string
  department_id: string
  approval_tiers: ApprovalTier[]
  workflow_type: 'sequential' | 'parallel' | 'hybrid'
  require_all_approvers: boolean
  escalation_enabled: boolean
  escalation_hours: number
  escalation_to: string
  escalation_user_id?: string
  escalation_role?: string
  notification_enabled: boolean
  reminder_frequency_hours: number
  notify_on_approval: boolean
  notify_on_rejection: boolean
  is_active: boolean
  effective_date: Date
  end_date?: Date
  created_by: string
  created_at: Date
  updated_by?: string
  updated_at: Date
}

interface ApprovalTier {
  tier_number: number
  min_amount: number
  max_amount: number
  currency: string
  approvers: Approver[]
  approval_required: number
  timeout_hours: number
  escalate_on_timeout: boolean
}

interface Approver {
  approver_type: 'user' | 'role' | 'department_head'
  approver_id?: string
  priority_order: number
}
```

---

## Database Functions and Triggers

### Function: calculate_hierarchy_path()

**Purpose**: Automatically calculate and update hierarchy path when department parent changes.

```sql
CREATE OR REPLACE FUNCTION calculate_hierarchy_path()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_path VARCHAR(500);
  v_parent_level INTEGER;
BEGIN
  -- If no parent (root department)
  IF NEW.parent_department_id IS NULL THEN
    NEW.hierarchy_path := '/' || NEW.department_code;
    NEW.hierarchy_level := 0;
    RETURN NEW;
  END IF;

  -- Get parent's path and level
  SELECT hierarchy_path, hierarchy_level INTO v_parent_path, v_parent_level
  FROM departments
  WHERE department_id = NEW.parent_department_id;

  IF v_parent_path IS NULL THEN
    RAISE EXCEPTION 'Parent department not found';
  END IF;

  -- Calculate new path and level
  NEW.hierarchy_path := v_parent_path || '/' || NEW.department_code;
  NEW.hierarchy_level := v_parent_level + 1;

  -- Check max depth
  IF NEW.hierarchy_level > 5 THEN
    RAISE EXCEPTION 'Maximum hierarchy depth (5 levels) exceeded';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_hierarchy_path
  BEFORE INSERT OR UPDATE OF parent_department_id, department_code
  ON departments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_hierarchy_path();
```

---

### Function: prevent_circular_hierarchy()

**Purpose**: Prevent circular references in department hierarchy.

```sql
CREATE OR REPLACE FUNCTION prevent_circular_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  v_ancestor_id UUID;
BEGIN
  -- Skip if no parent
  IF NEW.parent_department_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if parent is a descendant of this department
  v_ancestor_id := NEW.parent_department_id;

  WHILE v_ancestor_id IS NOT NULL LOOP
    IF v_ancestor_id = NEW.department_id THEN
      RAISE EXCEPTION 'Circular hierarchy detected: Department cannot be its own ancestor';
    END IF;

    SELECT parent_department_id INTO v_ancestor_id
    FROM departments
    WHERE department_id = v_ancestor_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_circular_hierarchy
  BEFORE INSERT OR UPDATE OF parent_department_id
  ON departments
  FOR EACH ROW
  EXECUTE FUNCTION prevent_circular_hierarchy();
```

---

### Function: update_budget_variance()

**Purpose**: Automatically calculate budget variance when spent amounts change.

```sql
CREATE OR REPLACE FUNCTION update_budget_variance()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate available budget
  NEW.available_budget := NEW.total_budget_amount - NEW.spent_to_date - NEW.committed_amount;

  -- Calculate variance
  NEW.variance_amount := NEW.spent_to_date - NEW.total_budget_amount;

  -- Calculate variance percentage
  IF NEW.total_budget_amount > 0 THEN
    NEW.variance_percentage := ROUND(
      (NEW.variance_amount / NEW.total_budget_amount) * 100, 4
    );
  ELSE
    NEW.variance_percentage := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_budget_variance
  BEFORE INSERT OR UPDATE OF total_budget_amount, spent_to_date, committed_amount
  ON department_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance();
```

---

### Function: validate_monthly_budget_total()

**Purpose**: Ensure monthly budget amounts sum to total annual budget.

```sql
CREATE OR REPLACE FUNCTION validate_monthly_budget_total()
RETURNS TRIGGER AS $$
DECLARE
  v_monthly_sum DECIMAL(18, 2);
BEGIN
  -- Only validate if monthly budgets are provided
  IF NEW.january_budget IS NOT NULL THEN
    v_monthly_sum := COALESCE(NEW.january_budget, 0) +
                     COALESCE(NEW.february_budget, 0) +
                     COALESCE(NEW.march_budget, 0) +
                     COALESCE(NEW.april_budget, 0) +
                     COALESCE(NEW.may_budget, 0) +
                     COALESCE(NEW.june_budget, 0) +
                     COALESCE(NEW.july_budget, 0) +
                     COALESCE(NEW.august_budget, 0) +
                     COALESCE(NEW.september_budget, 0) +
                     COALESCE(NEW.october_budget, 0) +
                     COALESCE(NEW.november_budget, 0) +
                     COALESCE(NEW.december_budget, 0);

    -- Allow small rounding difference (0.01)
    IF ABS(v_monthly_sum - NEW.total_budget_amount) > 0.01 THEN
      RAISE EXCEPTION 'Monthly budget amounts (%) must sum to total budget (%)',
        v_monthly_sum, NEW.total_budget_amount;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_monthly_budget_total
  BEFORE INSERT OR UPDATE
  ON department_budgets
  FOR EACH ROW
  EXECUTE FUNCTION validate_monthly_budget_total();
```

---

### Function: log_department_changes()

**Purpose**: Maintain comprehensive audit log of department changes.

```sql
CREATE TABLE department_audit (
  audit_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id           UUID NOT NULL,
  operation               VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values              JSONB,
  new_values              JSONB,
  changed_by              UUID,
  changed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_reason           TEXT
);

CREATE OR REPLACE FUNCTION log_department_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO department_audit (department_id, operation, new_values, changed_by)
    VALUES (NEW.department_id, 'INSERT', row_to_json(NEW)::JSONB, NEW.created_by);
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO department_audit (department_id, operation, old_values, new_values, changed_by)
    VALUES (NEW.department_id, 'UPDATE', row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, NEW.updated_by);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO department_audit (department_id, operation, old_values, changed_by)
    VALUES (OLD.department_id, 'DELETE', row_to_json(OLD)::JSONB, OLD.updated_by);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_department_changes
  AFTER INSERT OR UPDATE OR DELETE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION log_department_changes();
```

---

## Materialized Views

### View: mv_active_departments

**Purpose**: Fast lookup of currently active departments with hierarchy information.

```sql
CREATE MATERIALIZED VIEW mv_active_departments AS
SELECT
  d.department_id,
  d.department_code,
  d.department_name,
  d.department_type,
  d.hierarchy_level,
  d.hierarchy_path,
  d.parent_department_id,
  p.department_name AS parent_department_name,
  d.budget_amount,
  d.approval_limit,
  COUNT(dh.head_id) FILTER (WHERE dh.is_active = true) AS active_heads_count,
  COUNT(cc.cost_center_id) FILTER (WHERE cc.status = 'active') AS active_cost_centers_count
FROM departments d
LEFT JOIN departments p ON d.parent_department_id = p.department_id
LEFT JOIN department_heads dh ON d.department_id = dh.department_id
LEFT JOIN cost_centers cc ON d.department_id = cc.department_id
WHERE d.status = 'active'
GROUP BY d.department_id, d.department_code, d.department_name, d.department_type,
         d.hierarchy_level, d.hierarchy_path, d.parent_department_id, p.department_name,
         d.budget_amount, d.approval_limit;

-- Indexes on materialized view
CREATE UNIQUE INDEX idx_mv_active_depts_id ON mv_active_departments(department_id);
CREATE INDEX idx_mv_active_depts_code ON mv_active_departments(department_code);
CREATE INDEX idx_mv_active_depts_hierarchy ON mv_active_departments(hierarchy_path);

-- Refresh on department changes
CREATE OR REPLACE FUNCTION refresh_active_departments()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_active_departments;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_active_departments
  AFTER INSERT OR UPDATE OF status ON departments
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_active_departments();
```

---

### View: mv_department_budget_summary

**Purpose**: Aggregated budget vs actual summary for all departments.

```sql
CREATE MATERIALIZED VIEW mv_department_budget_summary AS
SELECT
  d.department_id,
  d.department_code,
  d.department_name,
  db.fiscal_year,
  SUM(db.total_budget_amount) AS total_budget,
  SUM(db.spent_to_date) AS total_spent,
  SUM(db.committed_amount) AS total_committed,
  SUM(db.available_budget) AS total_available,
  ROUND(AVG(db.variance_percentage), 2) AS avg_variance_percentage,
  COUNT(db.budget_id) AS budget_line_count,
  COUNT(db.budget_id) FILTER (WHERE db.variance_percentage > 10) AS over_budget_count
FROM departments d
LEFT JOIN department_budgets db ON d.department_id = db.department_id
  AND db.status = 'active'
WHERE d.status = 'active'
GROUP BY d.department_id, d.department_code, d.department_name, db.fiscal_year;

-- Refresh every hour
CREATE INDEX idx_mv_dept_budget_summary_dept ON mv_department_budget_summary(department_id);
CREATE INDEX idx_mv_dept_budget_summary_fiscal ON mv_department_budget_summary(fiscal_year);
```

---

## Row-Level Security (RLS) Policies

### Departments RLS

```sql
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- View policy: Users can view departments they are assigned to
CREATE POLICY select_assigned_departments ON departments
  FOR SELECT
  USING (
    department_id IN (
      SELECT department_id FROM department_heads WHERE user_id = auth.uid() AND is_active = true
    )
    OR auth.jwt() ->> 'role' IN ('finance_manager', 'finance_controller', 'cfo')
  );

-- Insert policy: Only finance managers can create departments
CREATE POLICY insert_departments ON departments
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('finance_manager', 'finance_controller', 'cfo')
  );

-- Update policy: Finance managers or department heads can update
CREATE POLICY update_departments ON departments
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('finance_manager', 'finance_controller', 'cfo')
    OR department_id IN (
      SELECT department_id FROM department_heads
      WHERE user_id = auth.uid() AND is_active = true AND head_role = 'primary'
    )
  );

-- Delete policy: Only controllers can delete (soft delete preferred)
CREATE POLICY delete_departments ON departments
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' IN ('finance_controller', 'cfo')
  );
```

---

## Data Relationships

### Entity Relationship Diagram

```
┌─────────────────────┐
│    departments      │
│─────────────────────│
│ department_id (PK)  │──┐
│ parent_dept_id (FK) │──┤ Self-referencing
│ department_code     │  │ for hierarchy
│ hierarchy_path      │  │
│ budget_amount       │  │
└─────────────────────┘  │
         │               │
         │ 1:N           │
         ▼               │
┌─────────────────────┐  │
│  department_heads   │  │
│─────────────────────│  │
│ head_id (PK)        │  │
│ department_id (FK)  │──┘
│ user_id (FK)        │
│ approval_limit      │
│ is_active           │
└─────────────────────┘

         │ 1:N
         ▼
┌─────────────────────┐
│   cost_centers      │
│─────────────────────│
│ cost_center_id (PK) │
│ department_id (FK)  │
│ cost_center_code    │
│ budget_amount       │
│ is_primary          │
└─────────────────────┘

         │ 1:N
         ▼
┌─────────────────────┐
│ department_budgets  │
│─────────────────────│
│ budget_id (PK)      │
│ department_id (FK)  │
│ cost_center_id (FK) │
│ total_budget_amount │
│ spent_to_date       │
│ available_budget    │
└─────────────────────┘

┌─────────────────────┐
│ dept_approval_      │
│    configs          │
│─────────────────────│
│ config_id (PK)      │
│ department_id (FK)  │
│ approval_tiers      │
│ workflow_type       │
└─────────────────────┘
```

---

## Performance Optimization

### Index Strategy

1. **Primary Keys**: UUID with gen_random_uuid() for distributed systems
2. **Foreign Keys**: Indexed automatically for join performance
3. **Hierarchy Lookups**: Composite indexes on (parent_id, hierarchy_level), hierarchy_path
4. **Partial Indexes**: WHERE clauses for is_active, status = 'active'
5. **Covering Indexes**: Include frequently accessed columns

### Caching Strategy

1. **Active Departments**: Cache in Redis with 15-minute TTL
2. **Department Hierarchy**: Cache complete tree structure
3. **Budget Summaries**: Materialized views refreshed hourly

---

## Data Integrity Checks

### Validation Queries

```sql
-- Check for circular hierarchy
WITH RECURSIVE dept_tree AS (
  SELECT department_id, parent_department_id, ARRAY[department_id] AS path
  FROM departments WHERE parent_department_id IS NOT NULL
  UNION ALL
  SELECT d.department_id, d.parent_department_id, dt.path || d.department_id
  FROM departments d
  JOIN dept_tree dt ON d.parent_department_id = dt.department_id
  WHERE NOT d.department_id = ANY(dt.path)
)
SELECT * FROM dept_tree WHERE department_id = ANY(path[2:array_length(path, 1)]);

-- Check for departments without primary cost center
SELECT d.department_id, d.department_code
FROM departments d
LEFT JOIN cost_centers cc ON d.department_id = cc.department_id AND cc.is_primary_cost_center = true
WHERE d.status = 'active' AND cc.cost_center_id IS NULL;

-- Check budget variance calculations
SELECT budget_id, variance_amount,
       (spent_to_date - total_budget_amount) AS calculated_variance
FROM department_budgets
WHERE ABS(variance_amount - (spent_to_date - total_budget_amount)) > 0.01;

-- Check monthly budget totals
SELECT budget_id, total_budget_amount,
       (COALESCE(january_budget, 0) + COALESCE(february_budget, 0) +
        COALESCE(march_budget, 0) + COALESCE(april_budget, 0) +
        COALESCE(may_budget, 0) + COALESCE(june_budget, 0) +
        COALESCE(july_budget, 0) + COALESCE(august_budget, 0) +
        COALESCE(september_budget, 0) + COALESCE(october_budget, 0) +
        COALESCE(november_budget, 0) + COALESCE(december_budget, 0)) AS monthly_sum
FROM department_budgets
WHERE ABS(total_budget_amount - monthly_sum) > 0.01;
```

---

## Appendix

### Data Type Reference

| Data Type | Usage | Precision | Example |
|-----------|-------|-----------|---------|
| UUID | Primary keys, foreign keys | 128-bit | a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11 |
| VARCHAR(n) | Short text, codes | Variable, max n | 'KITCHEN', 'Finance Manager' |
| TEXT | Long text, notes | Unlimited | 'Detailed description...' |
| DECIMAL(p,s) | Monetary values | p digits, s decimal places | 500000.00 |
| BOOLEAN | True/false flags | 1 bit | true, false |
| TIMESTAMPTZ | Timestamps with timezone | Microsecond precision | '2025-11-13 14:30:00+00' |
| INTEGER | Counts, levels | 32-bit | 0, 1, 2, 3, 4, 5 |
| JSONB | Semi-structured data | Variable | {"method": "headcount"} |

### Naming Conventions

- **Tables**: Plural, lowercase, underscore_separated (departments, department_heads)
- **Columns**: Singular, lowercase, underscore_separated (department_code, approval_limit)
- **Primary Keys**: table_id (department_id, cost_center_id)
- **Foreign Keys**: referenced_table_id (parent_department_id, user_id)
- **Indexes**: idx_table_columns (idx_departments_code)
- **Constraints**: type_table_description (fk_parent_department, chk_hierarchy_level)
- **Functions**: verb_noun() (calculate_hierarchy_path)
- **Triggers**: trg_action_description (trg_prevent_circular_hierarchy)

---

## References

- **BR-department-management.md**: Business requirements and functional specifications
- **UC-department-management.md**: Detailed use cases and user workflows
- **TS-department-management.md**: Technical specification and architecture
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Prisma Documentation**: https://www.prisma.io/docs/
