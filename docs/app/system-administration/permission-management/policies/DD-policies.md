# Data Dictionary: Policy Management

## Module Information
- **Module**: System Administration > Permission Management
- **Sub-Module**: Policy Management
- **Route**: `/system-administration/permission-management/policies`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## Data Structures

### Policy

**Source**: `lib/types/permissions.ts`

```typescript
interface Policy {
  id: string
  name: string
  description: string
  priority: number
  enabled: boolean
  effect: EffectType
  target: PolicyTarget
  rules: PolicyRule[]
  category: string
  tags: string[]
  version: string
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  effectiveFrom?: Date
  effectiveTo?: Date
  testScenarios?: PolicyTestScenario[]
  validationRules?: string[]
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Policy name |
| description | string | Policy description |
| priority | number | Higher = higher priority |
| enabled | boolean | Policy active status |
| effect | EffectType | 'permit' or 'deny' |
| target | PolicyTarget | Target conditions |
| rules | PolicyRule[] | Policy rules |
| category | string | Policy category |
| tags | string[] | Classification tags |
| version | string | Version number |
| effectiveFrom | Date | Start date (optional) |
| effectiveTo | Date | End date (optional) |

---

### PolicyTarget

```typescript
interface PolicyTarget {
  subjects?: AttributeCondition[]
  resources?: AttributeCondition[]
  actions?: string[]
  environment?: AttributeCondition[]
}
```

| Field | Type | Description |
|-------|------|-------------|
| subjects | AttributeCondition[] | Who (users, roles) |
| resources | AttributeCondition[] | What (resources) |
| actions | string[] | Operations (create, read, etc.) |
| environment | AttributeCondition[] | Context (time, location) |

---

### EffectType

```typescript
type EffectType = 'permit' | 'deny'
```

---

### PolicyFilters (Component State)

```typescript
interface PolicyFilters {
  search: string
  effect: 'all' | EffectType
  status: 'all' | 'enabled' | 'disabled'
  categories: string[]
  resourceTypes: ResourceType[]
  priorityRange: { min: number; max: number }
  createdDateRange: { from: string; to: string }
}
```

---

### PolicyBuilderState

**Source**: `lib/types/policy-builder.ts`

```typescript
interface PolicyBuilderState {
  name: string
  description: string
  priority: number
  enabled: boolean
  effect: EffectType
  logicalOperator: LogicalOperator
  subjectConditions: AttributeCondition[]
  resourceConditions: AttributeCondition[]
  actionConditions: string[]
  environmentConditions: AttributeCondition[]
  rules: PolicyRule[]
  testScenarios: PolicyTestScenario[]
  version: string
  category: string
  tags: string[]
  effectiveFrom?: Date
  effectiveTo?: Date
}
```

---

### LogicalOperator

```typescript
enum LogicalOperator {
  AND = 'AND'
  OR = 'OR'
}
```

---

## Data Sources

| Source | Function |
|--------|----------|
| allMockPolicies | All ABAC policies |
| roleBasedPolicies | RBAC policies only |

---

**Document End**
