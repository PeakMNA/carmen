# Workflow Management - Validation Rules (VAL)

**Module**: System Administration - Workflow Management
**Version**: 1.0
**Last Updated**: 2025-01-16
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Document Status**: Active

---

## Table of Contents

1. [Overview](#overview)
2. [Field-Level Validations](#field-level-validations)
3. [Cross-Field Validations](#cross-field-validations)
4. [Business Rule Validations](#business-rule-validations)
5. [Database Constraints](#database-constraints)
6. [Server-Side Validation](#server-side-validation)
7. [Client-Side Validation](#client-side-validation)
8. [Validation Error Messages](#validation-error-messages)
9. [Validation Testing](#validation-testing)

---

## 1. Overview

### 1.1 Purpose
This document defines all validation rules for the Workflow Management module, ensuring data integrity, consistency, and compliance with business requirements.

### 1.2 Validation Layers

```typescript
// Validation Architecture
const ValidationLayers = {
  client: {
    layer: "Client-Side (Browser)",
    purpose: "Immediate user feedback",
    tools: ['Zod', 'React Hook Form'],
    timing: "Real-time on field change"
  },
  server: {
    layer: "Server-Side (API/Actions)",
    purpose: "Security and data integrity",
    tools: ['Zod', 'Custom validators'],
    timing: "On form submission"
  },
  database: {
    layer: "Database Constraints",
    purpose: "Data integrity at storage level",
    tools: ['PostgreSQL', 'Prisma'],
    timing: "On database write"
  }
}
```

### 1.3 Validation Priority
- Security validations: CRITICAL (cannot be bypassed)
- Data integrity validations: HIGH (prevent data corruption)
- Business rule validations: MEDIUM (enforce business logic)
- UX validations: LOW (improve user experience)

---

## 2. Field-Level Validations

### 2.1 Workflow Basic Fields

#### VAL-WF-001: Workflow Name
```typescript
// Validation Rule
const workflowNameValidation = {
  field: "name",
  type: "string",
  required: true,
  rules: [
    {
      rule: "not_empty",
      message: "Workflow name is required"
    },
    {
      rule: "min_length",
      value: 3,
      message: "Workflow name must be at least 3 characters"
    },
    {
      rule: "max_length",
      value: 100,
      message: "Workflow name must not exceed 100 characters"
    },
    {
      rule: "pattern",
      value: /^[a-zA-Z0-9\s\-_]+$/,
      message: "Workflow name can only contain letters, numbers, spaces, hyphens, and underscores"
    },
    {
      rule: "unique",
      scope: "global",
      message: "A workflow with this name already exists"
    },
    {
      rule: "reserved_words",
      value: ["system", 'admin', 'default', 'test'],
      message: "This workflow name is reserved and cannot be used"
    }
  ]
}

// Zod Schema
const workflowNameSchema = z.string()
  .min(3, "Workflow name must be at least 3 characters")
  .max(100, "Workflow name must not exceed 100 characters")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters in workflow name")
  .refine(
    (name) => !["system", 'admin', 'default', 'test'].includes(name.toLowerCase()),
    "This workflow name is reserved"
  )
```

#### VAL-WF-002: Workflow Type
```typescript
// Validation Rule
const workflowTypeValidation = {
  field: "workflow_type",
  type: "enum",
  required: true,
  rules: [
    {
      rule: "not_empty",
      message: "Workflow type is required"
    },
    {
      rule: "enum_value",
      values: ['purchase_request_workflow', 'store_requisition_workflow'],
      message: "Invalid workflow type"
    },
    {
      rule: "immutable_if_active",
      condition: "is_active = true AND has_documents",
      message: "Cannot change workflow type when workflow is active and has associated documents"
    }
  ]
}

// Zod Schema
const workflowTypeSchema = z.enum(
  ['purchase_request_workflow', 'store_requisition_workflow'],
  { errorMap: () => ({ message: 'Invalid workflow type' }) }
)
```

#### VAL-WF-003: Description
```typescript
// Validation Rule
const descriptionValidation = {
  field: "description",
  type: "string",
  required: false,
  rules: [
    {
      rule: "max_length",
      value: 500,
      message: "Description must not exceed 500 characters"
    },
    {
      rule: "sanitize_html",
      message: "HTML tags are not allowed in description"
    }
  ]
}

// Zod Schema
const descriptionSchema = z.string()
  .max(500, "Description must not exceed 500 characters")
  .optional()
  .transform(val => val?.trim())
```

#### VAL-WF-004: Note
```typescript
// Validation Rule
const noteValidation = {
  field: "note",
  type: "string",
  required: false,
  rules: [
    {
      rule: "max_length",
      value: 1000,
      message: "Note must not exceed 1000 characters"
    }
  ]
}

// Zod Schema
const noteSchema = z.string()
  .max(1000, "Note must not exceed 1000 characters")
  .optional()
```

#### VAL-WF-005: Active Status
```typescript
// Validation Rule
const activeStatusValidation = {
  field: "is_active",
  type: "boolean",
  required: true,
  default: true,
  rules: [
    {
      rule: "boolean",
      message: "Active status must be true or false"
    },
    {
      rule: "deactivation_check",
      condition: "changing from true to false",
      validations: [
        "No stages have assigned users with pending approvals",
        "No in-progress documents using this workflow"
      ],
      message: "Cannot deactivate workflow with pending approvals or in-progress documents"
    }
  ]
}

// Zod Schema
const activeStatusSchema = z.boolean().default(true)
```

### 2.2 Stage Configuration Fields

#### VAL-WF-006: Stage Name
```typescript
// Validation Rule
const stageNameValidation = {
  field: "stages[].name",
  type: "string",
  required: true,
  rules: [
    {
      rule: "not_empty",
      message: "Stage name is required"
    },
    {
      rule: "min_length",
      value: 2,
      message: "Stage name must be at least 2 characters"
    },
    {
      rule: "max_length",
      value: 50,
      message: "Stage name must not exceed 50 characters"
    },
    {
      rule: "unique_in_workflow",
      scope: "workflow.stages",
      message: "Stage name must be unique within the workflow"
    }
  ]
}

// Zod Schema
const stageNameSchema = z.string()
  .min(2, "Stage name must be at least 2 characters")
  .max(50, "Stage name must not exceed 50 characters")
```

#### VAL-WF-007: Stage Description
```typescript
// Validation Rule
const stageDescriptionValidation = {
  field: "stages[].description",
  type: "string",
  required: false,
  rules: [
    {
      rule: "max_length",
      value: 200,
      message: "Stage description must not exceed 200 characters"
    }
  ]
}

// Zod Schema
const stageDescriptionSchema = z.string()
  .max(200, "Stage description must not exceed 200 characters")
  .optional()
```

#### VAL-WF-008: Stage SLA
```typescript
// Validation Rule
const stageSLAValidation = {
  field: "stages[].sla",
  type: "object",
  required: true,
  rules: [
    {
      rule: "value_required",
      field: "value",
      message: "SLA value is required"
    },
    {
      rule: "positive_integer",
      field: "value",
      message: "SLA value must be a positive integer"
    },
    {
      rule: "min_value",
      field: "value",
      value: 1,
      message: "SLA value must be at least 1"
    },
    {
      rule: "max_value",
      field: "value",
      value: 365,
      message: "SLA value must not exceed 365"
    },
    {
      rule: "unit_required",
      field: "unit",
      message: "SLA unit is required"
    },
    {
      rule: "unit_enum",
      field: "unit",
      values: ['hours', 'days'],
      message: "SLA unit must be either 'hours' or 'days'"
    },
    {
      rule: "hours_limit",
      condition: "unit = 'hours'",
      field: "value",
      max: 720,
      message: "SLA hours cannot exceed 720 (30 days)"
    }
  ]
}

// Zod Schema
const stageSLASchema = z.object({
  value: z.number()
    .int("SLA value must be an integer")
    .positive("SLA value must be positive")
    .min(1, "SLA value must be at least 1")
    .max(365, "SLA value must not exceed 365"),
  unit: z.enum(['hours', 'days'], {
    errorMap: () => ({ message: "SLA unit must be 'hours' or 'days'" })
  })
}).refine(
  (sla) => sla.unit !== "hours" || sla.value <= 720,
  { message: 'SLA hours cannot exceed 720 (30 days)' }
)
```

#### VAL-WF-009: Stage Role Type
```typescript
// Validation Rule
const stageRoleTypeValidation = {
  field: "stages[].roleType",
  type: "enum",
  required: true,
  rules: [
    {
      rule: "not_empty",
      message: "Stage role type is required"
    },
    {
      rule: "enum_value",
      values: ["requester", 'purchaser', 'approver', 'reviewer'],
      message: "Invalid role type"
    }
  ]
}

// Zod Schema
const stageRoleTypeSchema = z.enum(
  ['requester', 'purchaser', 'approver', 'reviewer'],
  { errorMap: () => ({ message: 'Invalid stage role type' }) }
)
```

#### VAL-WF-010: Stage Available Actions
```typescript
// Validation Rule
const stageActionsValidation = {
  field: "stages[].availableActions",
  type: "array",
  required: true,
  rules: [
    {
      rule: "not_empty",
      message: "At least one action must be available"
    },
    {
      rule: "array_min_length",
      value: 1,
      message: "At least one action must be configured"
    },
    {
      rule: "valid_actions",
      values: ["Submit", "Approve", "Reject", 'Send Back', 'Forward', 'Cancel'],
      message: "Invalid action type"
    },
    {
      rule: "first_stage_submit",
      condition: "stage_order = 1",
      required_actions: ['Submit'],
      message: "First stage must have 'Submit' action"
    },
    {
      rule: "final_stage_approve",
      condition: "stage_order = max(stage_order)",
      required_actions: ['Approve', 'Reject'],
      message: "Final stage must have 'Approve' and 'Reject' actions"
    }
  ]
}

// Zod Schema
const stageActionsSchema = z.array(
  z.enum(["Submit", "Approve", "Reject", 'Send Back', 'Forward', 'Cancel'])
).min(1, "At least one action must be configured")
```

#### VAL-WF-011: Stage Hide Fields
```typescript
// Validation Rule
const stageHideFieldsValidation = {
  field: "stages[].hideFields",
  type: "object",
  required: false,
  rules: [
    {
      rule: "boolean_fields",
      fields: ['pricePerUnit', 'totalPrice'],
      message: "Hide fields must be boolean values"
    },
    {
      rule: "requester_no_hide_price",
      condition: "roleType = 'requester'",
      validation: "hideFields.pricePerUnit = false AND hideFields.totalPrice = false",
      message: "Price fields cannot be hidden for requester role"
    }
  ]
}

// Zod Schema
const stageHideFieldsSchema = z.object({
  pricePerUnit: z.boolean().default(false),
  totalPrice: z.boolean().default(false)
}).optional()
```

#### VAL-WF-012: Stage Assigned Users
```typescript
// Validation Rule
const stageAssignedUsersValidation = {
  field: "stages[].assignedUsers",
  type: "array",
  required: false,
  rules: [
    {
      rule: "user_id_exists",
      message: "Assigned user must exist in the system"
    },
    {
      rule: "user_active",
      message: "Cannot assign inactive users to workflow stages"
    },
    {
      rule: "user_has_permission",
      permission: "workflow.approve",
      condition: "roleType IN ('approver', 'reviewer')",
      message: "User does not have approval permissions"
    },
    {
      rule: "unique_users",
      scope: "stage",
      message: "User is already assigned to this stage"
    },
    {
      rule: "department_match",
      condition: "workflow has department restriction",
      message: "User's department does not match workflow department"
    }
  ]
}

// Zod Schema
const stageAssignedUsersSchema = z.array(
  z.object({
    id: z.string().uuid("Invalid user ID"),
    name: z.string(),
    department: z.string(),
    location: z.string()
  })
).optional()
```

### 2.3 Routing Rule Fields

#### VAL-WF-013: Routing Rule Name
```typescript
// Validation Rule
const routingRuleNameValidation = {
  field: "routingRules[].name",
  type: "string",
  required: true,
  rules: [
    {
      rule: "not_empty",
      message: "Routing rule name is required"
    },
    {
      rule: "min_length",
      value: 3,
      message: "Routing rule name must be at least 3 characters"
    },
    {
      rule: "max_length",
      value: 100,
      message: "Routing rule name must not exceed 100 characters"
    },
    {
      rule: "unique_in_workflow",
      scope: "workflow.routingRules",
      message: "Routing rule name must be unique within the workflow"
    }
  ]
}

// Zod Schema
const routingRuleNameSchema = z.string()
  .min(3, "Routing rule name must be at least 3 characters")
  .max(100, "Routing rule name must not exceed 100 characters")
```

#### VAL-WF-014: Routing Rule Trigger Stage
```typescript
// Validation Rule
const routingRuleTriggerStageValidation = {
  field: "routingRules[].triggerStage",
  type: "string",
  required: true,
  rules: [
    {
      rule: "not_empty",
      message: "Trigger stage is required"
    },
    {
      rule: "stage_exists",
      scope: "workflow.stages",
      message: "Trigger stage must exist in the workflow"
    },
    {
      rule: "not_final_stage",
      message: "Cannot create routing rule for final stage"
    }
  ]
}

// Zod Schema
const routingRuleTriggerStageSchema = z.string()
  .min(1, "Trigger stage is required")
```

#### VAL-WF-015: Routing Rule Condition
```typescript
// Validation Rule
const routingRuleConditionValidation = {
  field: "routingRules[].condition",
  type: "object",
  required: true,
  rules: [
    {
      rule: "field_required",
      field: "field",
      message: "Condition field is required"
    },
    {
      rule: "valid_field",
      values: ["totalAmount", "itemCount", 'department', 'priority', 'requestor'],
      message: "Invalid condition field"
    },
    {
      rule: "operator_required",
      field: "operator",
      message: "Condition operator is required"
    },
    {
      rule: "valid_operator",
      values: ["eq", "lt", 'gt', 'lte', 'gte'],
      message: "Invalid condition operator"
    },
    {
      rule: "value_required",
      field: "value",
      message: "Condition value is required"
    },
    {
      rule: "value_type_match",
      validation: "value type must match field type",
      message: "Condition value type does not match field type"
    }
  ]
}

// Zod Schema
const routingRuleConditionSchema = z.object({
  field: z.enum(["totalAmount", "itemCount", 'department', 'priority', 'requestor']),
  operator: z.enum(["eq", "lt", 'gt', 'lte', 'gte']),
  value: z.union([z.string(), z.number()])
})
```

#### VAL-WF-016: Routing Rule Action
```typescript
// Validation Rule
const routingRuleActionValidation = {
  field: "routingRules[].action",
  type: "object",
  required: true,
  rules: [
    {
      rule: "type_required",
      field: "type",
      message: "Action type is required"
    },
    {
      rule: "valid_type",
      values: ['SKIP_STAGE', 'NEXT_STAGE'],
      message: "Invalid action type"
    },
    {
      rule: "parameters_required",
      field: "parameters",
      message: "Action parameters are required"
    },
    {
      rule: "target_stage_required",
      condition: "type IN ('SKIP_STAGE', 'NEXT_STAGE')",
      field: "parameters.targetStage",
      message: "Target stage is required for this action type"
    },
    {
      rule: "target_stage_exists",
      field: "parameters.targetStage",
      scope: "workflow.stages",
      message: "Target stage must exist in the workflow"
    },
    {
      rule: "target_stage_forward",
      validation: "targetStage order > triggerStage order",
      message: "Target stage must be after trigger stage in the workflow"
    }
  ]
}

// Zod Schema
const routingRuleActionSchema = z.object({
  type: z.enum(['SKIP_STAGE', 'NEXT_STAGE']),
  parameters: z.object({
    targetStage: z.string().min(1, "Target stage is required")
  })
})
```

### 2.4 Notification Configuration Fields

#### VAL-WF-017: Notification Event Trigger
```typescript
// Validation Rule
const notificationEventTriggerValidation = {
  field: "notifications[].eventTrigger",
  type: "enum",
  required: true,
  rules: [
    {
      rule: "not_empty",
      message: "Event trigger is required"
    },
    {
      rule: "enum_value",
      values: ["onSubmit", "onApprove", 'onReject', 'onSendBack', 'onSLA'],
      message: "Invalid event trigger"
    }
  ]
}

// Zod Schema
const notificationEventTriggerSchema = z.enum(
  ['onSubmit', 'onApprove', 'onReject', 'onSendBack', 'onSLA'],
  { errorMap: () => ({ message: 'Invalid event trigger' }) }
)
```

#### VAL-WF-018: Notification Recipients
```typescript
// Validation Rule
const notificationRecipientsValidation = {
  field: "notifications[].recipients",
  type: "array",
  required: true,
  rules: [
    {
      rule: "not_empty",
      message: "At least one recipient must be specified"
    },
    {
      rule: "valid_recipient_type",
      values: ["requester", "approver", 'all_approvers', 'next_approver', 'specific_users'],
      message: "Invalid recipient type"
    },
    {
      rule: "specific_users_require_ids",
      condition: "recipient_type = 'specific_users'",
      field: "userIds",
      message: "User IDs are required for specific_users recipient type"
    }
  ]
}

// Zod Schema
const notificationRecipientsSchema = z.array(
  z.object({
    type: z.enum(["requester", "approver", 'all_approvers', 'next_approver', 'specific_users']),
    userIds: z.array(z.string().uuid()).optional()
  })
).min(1, "At least one recipient must be specified")
```

#### VAL-WF-019: Notification Channels
```typescript
// Validation Rule
const notificationChannelsValidation = {
  field: "notifications[].channels",
  type: "array",
  required: true,
  rules: [
    {
      rule: "not_empty",
      message: "At least one notification channel must be selected"
    },
    {
      rule: "valid_channel",
      values: ['Email', 'System'],
      message: "Invalid notification channel"
    }
  ]
}

// Zod Schema
const notificationChannelsSchema = z.array(
  z.enum(['Email', 'System'])
).min(1, "At least one notification channel must be selected")
```

#### VAL-WF-020: Notification Template
```typescript
// Validation Rule
const notificationTemplateValidation = {
  field: "notifications[].template",
  type: "object",
  required: true,
  rules: [
    {
      rule: "subject_required",
      field: "subject",
      message: "Notification subject is required"
    },
    {
      rule: "subject_max_length",
      field: "subject",
      value: 200,
      message: "Subject must not exceed 200 characters"
    },
    {
      rule: "body_required",
      field: "body",
      message: "Notification body is required"
    },
    {
      rule: "body_max_length",
      field: "body",
      value: 2000,
      message: "Body must not exceed 2000 characters"
    },
    {
      rule: "valid_variables",
      pattern: /\{\{([a-zA-Z0-9_]+)\}\}/g,
      allowed: ["requestNumber", "requesterName", "approverName", "stageName", 'documentType', 'totalAmount', 'departmentName'],
      message: "Invalid variable in template"
    }
  ]
}

// Zod Schema
const notificationTemplateSchema = z.object({
  subject: z.string()
    .min(1, "Subject is required")
    .max(200, "Subject must not exceed 200 characters"),
  body: z.string()
    .min(1, "Body is required")
    .max(2000, "Body must not exceed 2000 characters")
})
```

### 2.5 Product Assignment Fields

#### VAL-WF-021: Product Assignment
```typescript
// Validation Rule
const productAssignmentValidation = {
  field: "productAssignments[]",
  type: "array",
  required: false,
  rules: [
    {
      rule: "product_exists",
      message: "Product must exist in the system"
    },
    {
      rule: "product_active",
      message: "Cannot assign inactive products to workflow"
    },
    {
      rule: "unique_products",
      scope: "workflow",
      message: "Product is already assigned to this workflow"
    },
    {
      rule: "no_duplicate_across_workflows",
      scope: "workflow_type",
      message: "Product is already assigned to another workflow of the same type"
    }
  ]
}

// Zod Schema
const productAssignmentSchema = z.array(
  z.object({
    id: z.string().uuid("Invalid product ID"),
    name: z.string(),
    category: z.string()
  })
).optional()
```

---

## 3. Cross-Field Validations

### 3.1 Workflow-Level Validations

#### VAL-WF-022: Minimum Stages Required
```typescript
// Validation Rule
const minimumStagesValidation = {
  name: "minimum_stages_required",
  scope: "workflow",
  rules: [
    {
      rule: "min_stages",
      value: 2,
      message: "Workflow must have at least 2 stages"
    },
    {
      rule: "max_stages",
      value: 20,
      message: "Workflow cannot have more than 20 stages"
    }
  ]
}

// Validation Function
function validateMinimumStages(workflow: Workflow): ValidationResult {
  const stageCount = workflow.data?.stages?.length || 0

  if (stageCount < 2) {
    return {
      valid: false,
      errors: [{ field: 'stages', message: 'Workflow must have at least 2 stages' }]
    }
  }

  if (stageCount > 20) {
    return {
      valid: false,
      errors: [{ field: 'stages', message: 'Workflow cannot have more than 20 stages' }]
    }
  }

  return { valid: true, errors: [] }
}
```

#### VAL-WF-023: Stage Order Sequence
```typescript
// Validation Rule
const stageOrderValidation = {
  name: "stage_order_sequence",
  scope: "workflow.stages",
  rules: [
    {
      rule: "sequential_order",
      validation: "stage order must be sequential starting from 1",
      message: "Stage order must be sequential (1, 2, 3, ...)"
    },
    {
      rule: "no_gaps",
      validation: "no gaps in stage order sequence",
      message: "Stage order cannot have gaps"
    },
    {
      rule: "no_duplicates",
      validation: "each stage order must be unique",
      message: "Duplicate stage order detected"
    }
  ]
}

// Validation Function
function validateStageOrder(stages: Stage[]): ValidationResult {
  const errors: ValidationError[] = []

  // Sort by order
  const sortedStages = [...stages].sort((a, b) => a.order - b.order)

  // Check sequential order starting from 1
  for (let i = 0; i < sortedStages.length; i++) {
    if (sortedStages[i].order !== i + 1) {
      errors.push({
        field: `stages[${i}].order`,
        message: `Stage order must be ${i + 1}, but found ${sortedStages[i].order}`
      })
    }
  }

  // Check for duplicates
  const orderSet = new Set(stages.map(s => s.order))
  if (orderSet.size !== stages.length) {
    errors.push({
      field: "stages",
      message: "Duplicate stage order detected"
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

#### VAL-WF-024: Routing Rule Circular Dependencies
```typescript
// Validation Rule
const circularDependencyValidation = {
  name: "no_circular_routing_dependencies",
  scope: "workflow.routingRules",
  rules: [
    {
      rule: "no_circular_routes",
      validation: "routing rules must not create circular paths",
      message: "Circular dependency detected in routing rules"
    },
    {
      rule: "reachable_final_stage",
      validation: "all routing paths must lead to final stage",
      message: "Routing configuration prevents reaching final stage"
    }
  ]
}

// Validation Function
function validateNoCircularDependencies(
  stages: Stage[],
  routingRules: RoutingRule[]
): ValidationResult {
  const errors: ValidationError[] = []

  // Build adjacency graph
  const graph = new Map<number, number[]>()

  stages.forEach(stage => {
    graph.set(stage.order, [stage.order + 1]) // Default next stage
  })

  // Add routing rule paths
  routingRules.forEach(rule => {
    const triggerStage = stages.find(s => s.name === rule.triggerStage)
    const targetStage = stages.find(s => s.name === rule.action.parameters.targetStage)

    if (triggerStage && targetStage) {
      const neighbors = graph.get(triggerStage.order) || []
      neighbors.push(targetStage.order)
      graph.set(triggerStage.order, neighbors)
    }
  })

  // Detect cycles using DFS
  const visited = new Set<number>()
  const recursionStack = new Set<number>()

  function hasCycle(node: number): boolean {
    visited.add(node)
    recursionStack.add(node)

    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true
      } else if (recursionStack.has(neighbor)) {
        return true
      }
    }

    recursionStack.delete(node)
    return false
  }

  // Check for cycles from each starting node
  for (const [node] of graph) {
    if (!visited.has(node)) {
      if (hasCycle(node)) {
        errors.push({
          field: "routingRules",
          message: "Circular dependency detected in routing rules"
        })
        break
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

#### VAL-WF-025: Notification Configuration Completeness
```typescript
// Validation Rule
const notificationCompletenessValidation = {
  name: "notification_configuration_complete",
  scope: "workflow.notifications",
  rules: [
    {
      rule: "all_events_configured",
      events: ['onSubmit', 'onApprove', 'onReject'],
      message: "Critical events (onSubmit, onApprove, onReject) must have notification configurations"
    },
    {
      rule: "template_variables_valid",
      validation: "all template variables must be available in context",
      message: "Template contains variables not available in the event context"
    }
  ]
}

// Validation Function
function validateNotificationCompleteness(
  notifications: Notification[]
): ValidationResult {
  const errors: ValidationError[] = []

  // Check critical events
  const criticalEvents = ['onSubmit', 'onApprove', 'onReject']
  const configuredEvents = new Set(notifications.map(n => n.eventTrigger))

  criticalEvents.forEach(event => {
    if (!configuredEvents.has(event as NotificationEventTrigger)) {
      errors.push({
        field: "notifications",
        message: `Critical event '${event}' must have a notification configuration`
      })
    }
  })

  // Validate template variables
  const availableVariables = {
    onSubmit: ["requestNumber", 'requesterName', 'stageName', 'documentType'],
    onApprove: ["requestNumber", 'approverName', 'stageName', 'documentType'],
    onReject: ["requestNumber", "approverName", 'stageName', 'documentType', 'rejectReason'],
    onSendBack: ["requestNumber", "approverName", 'stageName', 'documentType', 'sendBackReason'],
    onSLA: ["requestNumber", 'stageName', 'slaHours', 'currentHours']
  }

  notifications.forEach((notification, index) => {
    const template = notification.template
    const variablePattern = /\{\{([a-zA-Z0-9_]+)\}\}/g
    const matches = [...template.body.matchAll(variablePattern)]

    matches.forEach(match => {
      const variable = match[1]
      const allowed = availableVariables[notification.eventTrigger] || []

      if (!allowed.includes(variable)) {
        errors.push({
          field: `notifications[${index}].template.body`,
          message: `Variable '${variable}' is not available for '${notification.eventTrigger}' event`
        })
      }
    })
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### 3.2 Stage-Level Cross-Field Validations

#### VAL-WF-026: First Stage Configuration
```typescript
// Validation Rule
const firstStageValidation = {
  name: "first_stage_configuration",
  scope: "workflow.stages[0]",
  rules: [
    {
      rule: "role_type_requester",
      validation: "roleType = 'requester'",
      message: "First stage must have role type 'requester'"
    },
    {
      rule: "has_submit_action",
      validation: "'Submit' IN availableActions",
      message: "First stage must have 'Submit' action"
    },
    {
      rule: "no_user_assignment",
      validation: "assignedUsers.length = 0",
      message: "First stage (requester) should not have pre-assigned users"
    }
  ]
}

// Validation Function
function validateFirstStage(stages: Stage[]): ValidationResult {
  const errors: ValidationError[] = []

  if (stages.length === 0) {
    return { valid: true, errors: [] } // Handled by minimum stages validation
  }

  const firstStage = stages.find(s => s.order === 1)
  if (!firstStage) {
    return { valid: true, errors: [] } // Handled by stage order validation
  }

  if (firstStage.roleType !== 'requester') {
    errors.push({
      field: "stages[0].roleType",
      message: "First stage must have role type 'requester'"
    })
  }

  if (!firstStage.availableActions.includes('Submit')) {
    errors.push({
      field: "stages[0].availableActions",
      message: "First stage must have 'Submit' action"
    })
  }

  if (firstStage.assignedUsers.length > 0) {
    errors.push({
      field: "stages[0].assignedUsers",
      message: "First stage (requester) should not have pre-assigned users"
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

#### VAL-WF-027: Final Stage Configuration
```typescript
// Validation Rule
const finalStageValidation = {
  name: "final_stage_configuration",
  scope: "workflow.stages[last]",
  rules: [
    {
      rule: "has_approve_action",
      validation: "'Approve' IN availableActions",
      message: "Final stage must have 'Approve' action"
    },
    {
      rule: "has_reject_action",
      validation: "'Reject' IN availableActions",
      message: "Final stage must have 'Reject' action"
    },
    {
      rule: "has_assigned_users",
      validation: "assignedUsers.length > 0",
      message: "Final stage must have at least one assigned approver"
    },
    {
      rule: "role_type_approver",
      validation: "roleType IN ('approver', 'reviewer')",
      message: "Final stage must have role type 'approver' or 'reviewer'"
    }
  ]
}

// Validation Function
function validateFinalStage(stages: Stage[]): ValidationResult {
  const errors: ValidationError[] = []

  if (stages.length === 0) {
    return { valid: true, errors: [] }
  }

  const finalStage = stages[stages.length - 1]

  if (!finalStage.availableActions.includes('Approve')) {
    errors.push({
      field: `stages[${stages.length - 1}].availableActions`,
      message: "Final stage must have 'Approve' action"
    })
  }

  if (!finalStage.availableActions.includes('Reject')) {
    errors.push({
      field: `stages[${stages.length - 1}].availableActions`,
      message: "Final stage must have 'Reject' action"
    })
  }

  if (finalStage.assignedUsers.length === 0) {
    errors.push({
      field: `stages[${stages.length - 1}].assignedUsers`,
      message: "Final stage must have at least one assigned approver"
    })
  }

  if (!['approver', 'reviewer'].includes(finalStage.roleType)) {
    errors.push({
      field: `stages[${stages.length - 1}].roleType`,
      message: "Final stage must have role type 'approver' or 'reviewer'"
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

#### VAL-WF-028: Intermediate Stage Configuration
```typescript
// Validation Rule
const intermediateStageValidation = {
  name: "intermediate_stage_configuration",
  scope: "workflow.stages[1..n-1]",
  rules: [
    {
      rule: "has_assigned_users",
      condition: "roleType IN ('approver', 'reviewer', 'purchaser')",
      validation: "assignedUsers.length > 0",
      message: "Intermediate approval/review/purchaser stages must have assigned users"
    },
    {
      rule: "has_forward_action",
      validation: "'Approve' OR 'Forward' IN availableActions",
      message: "Intermediate stages must have forward progression action"
    }
  ]
}

// Validation Function
function validateIntermediateStages(stages: Stage[]): ValidationResult {
  const errors: ValidationError[] = []

  // Skip first and last stage
  const intermediateStages = stages.slice(1, -1)

  intermediateStages.forEach((stage, index) => {
    const actualIndex = index + 1 // Adjust for sliced array

    // Check assigned users for approval/review/purchaser roles
    if (['approver', 'reviewer', 'purchaser'].includes(stage.roleType)) {
      if (stage.assignedUsers.length === 0) {
        errors.push({
          field: `stages[${actualIndex}].assignedUsers`,
          message: `Stage '${stage.name}' with role '${stage.roleType}' must have assigned users`
        })
      }
    }

    // Check forward action
    const hasForwardAction = stage.availableActions.some(
      action => ['Approve', 'Forward'].includes(action)
    )

    if (!hasForwardAction) {
      errors.push({
        field: `stages[${actualIndex}].availableActions`,
        message: `Stage '${stage.name}' must have a forward progression action (Approve or Forward)`
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
```

---

## 4. Business Rule Validations

### 4.1 Workflow Activation Rules

#### VAL-WF-029: Workflow Activation Prerequisites
```typescript
// Validation Rule
const workflowActivationValidation = {
  name: "workflow_activation_prerequisites",
  trigger: "when is_active changes from false to true",
  rules: [
    {
      rule: "minimum_stages",
      validation: "stages.length >= 2",
      message: "Cannot activate workflow with less than 2 stages"
    },
    {
      rule: "all_stages_configured",
      validation: "all stages have complete configuration",
      message: "Cannot activate workflow with incomplete stage configuration"
    },
    {
      rule: "approval_stages_have_users",
      validation: "all approval/review stages have assigned users",
      message: "Cannot activate workflow with approval stages missing assigned users"
    },
    {
      rule: "no_routing_errors",
      validation: "routing rules have no circular dependencies",
      message: "Cannot activate workflow with circular routing dependencies"
    },
    {
      rule: "critical_notifications_configured",
      validation: "onSubmit, onApprove, onReject notifications exist",
      message: "Cannot activate workflow without critical notification configurations"
    }
  ]
}

// Validation Function
function validateWorkflowActivation(workflow: Workflow): ValidationResult {
  const errors: ValidationError[] = []

  // Check minimum stages
  const stages = workflow.data?.stages || []
  if (stages.length < 2) {
    errors.push({
      field: "is_active",
      message: "Cannot activate workflow with less than 2 stages"
    })
  }

  // Check all stages configured
  stages.forEach((stage, index) => {
    if (!stage.name || !stage.roleType || !stage.availableActions.length) {
      errors.push({
        field: `stages[${index}]`,
        message: `Stage ${index + 1} has incomplete configuration`
      })
    }
  })

  // Check approval stages have users
  stages.forEach((stage, index) => {
    if (['approver', 'reviewer'].includes(stage.roleType) && stage.assignedUsers.length === 0) {
      errors.push({
        field: `stages[${index}].assignedUsers`,
        message: `Approval stage '${stage.name}' must have assigned users before activation`
      })
    }
  })

  // Check routing rules
  const routingRules = workflow.data?.routingRules || []
  const circularCheck = validateNoCircularDependencies(stages, routingRules)
  if (!circularCheck.valid) {
    errors.push(...circularCheck.errors)
  }

  // Check critical notifications
  const notifications = workflow.data?.notifications || []
  const criticalEvents = ['onSubmit', 'onApprove', 'onReject']
  const configuredEvents = new Set(notifications.map(n => n.eventTrigger))

  criticalEvents.forEach(event => {
    if (!configuredEvents.has(event as NotificationEventTrigger)) {
      errors.push({
        field: "notifications",
        message: `Critical notification '${event}' must be configured before activation`
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### 4.2 Workflow Modification Rules

#### VAL-WF-030: Active Workflow Modification Constraints
```typescript
// Validation Rule
const activeWorkflowModificationValidation = {
  name: "active_workflow_modification_constraints",
  trigger: "when modifying workflow with is_active = true",
  rules: [
    {
      rule: "immutable_workflow_type",
      validation: "workflow_type cannot change",
      message: "Cannot change workflow type for active workflow"
    },
    {
      rule: "no_stage_deletion_with_documents",
      validation: "cannot delete stages referenced in active documents",
      message: "Cannot delete stage that is referenced in active documents"
    },
    {
      rule: "no_stage_reorder_with_documents",
      validation: "cannot reorder stages if in-progress documents exist",
      message: "Cannot reorder stages when workflow has in-progress documents"
    },
    {
      rule: "version_increment_required",
      validation: "version must increment when modifying active workflow",
      message: "Must increment workflow version when making changes to active workflow"
    }
  ]
}

// Validation Function
function validateActiveWorkflowModification(
  currentWorkflow: Workflow,
  updatedWorkflow: Workflow
): ValidationResult {
  const errors: ValidationError[] = []

  if (!currentWorkflow.is_active) {
    return { valid: true, errors: [] } // Not active, no constraints
  }

  // Check workflow type immutability
  if (currentWorkflow.workflow_type !== updatedWorkflow.workflow_type) {
    errors.push({
      field: "workflow_type",
      message: "Cannot change workflow type for active workflow"
    })
  }

  // Check for stage deletion (simplified - would need to check actual documents)
  const currentStageIds = new Set(currentWorkflow.data?.stages.map(s => s.id))
  const updatedStageIds = new Set(updatedWorkflow.data?.stages.map(s => s.id))

  currentStageIds.forEach(stageId => {
    if (!updatedStageIds.has(stageId)) {
      errors.push({
        field: "stages",
        message: `Cannot delete stage ${stageId} from active workflow without checking document references`
      })
    }
  })

  // Check stage order changes (simplified)
  const currentOrder = currentWorkflow.data?.stages.map(s => s.id).join(',')
  const updatedOrder = updatedWorkflow.data?.stages.map(s => s.id).join(',')

  if (currentOrder !== updatedOrder) {
    errors.push({
      field: "stages",
      message: "Cannot reorder stages in active workflow without checking in-progress documents"
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### 4.3 Workflow Deletion Rules

#### VAL-WF-031: Workflow Deletion Constraints
```typescript
// Validation Rule
const workflowDeletionValidation = {
  name: "workflow_deletion_constraints",
  trigger: "when attempting to delete workflow",
  rules: [
    {
      rule: "no_active_documents",
      validation: "no purchase requests or requisitions using this workflow",
      message: "Cannot delete workflow that is used in active documents"
    },
    {
      rule: "no_in_progress_documents",
      validation: "no documents in pending/approved status",
      message: "Cannot delete workflow with in-progress documents"
    },
    {
      rule: "soft_delete_only",
      validation: "must use soft delete (set deleted_at)",
      message: "Workflows must be soft deleted to preserve audit trail"
    }
  ]
}

// Validation Function
async function validateWorkflowDeletion(
  workflowId: string,
  prisma: PrismaClient
): Promise<ValidationResult> {
  const errors: ValidationError[] = []

  // Check purchase requests
  const purchaseRequestCount = await prisma.tb_purchase_request.count({
    where: {
      workflow_id: workflowId,
      deleted_at: null
    }
  })

  if (purchaseRequestCount > 0) {
    errors.push({
      field: "id",
      message: `Cannot delete workflow: ${purchaseRequestCount} active purchase request(s) are using this workflow`
    })
  }

  // Check in-progress purchase requests
  const inProgressPRCount = await prisma.tb_purchase_request.count({
    where: {
      workflow_id: workflowId,
      status: {
        in: ['Pending', 'Approved', 'In Progress']
      },
      deleted_at: null
    }
  })

  if (inProgressPRCount > 0) {
    errors.push({
      field: "id",
      message: `Cannot delete workflow: ${inProgressPRCount} in-progress purchase request(s) exist`
    })
  }

  // Check store requisitions
  const storeRequisitionCount = await prisma.tb_store_requisition.count({
    where: {
      workflow_id: workflowId,
      deleted_at: null
    }
  })

  if (storeRequisitionCount > 0) {
    errors.push({
      field: "id",
      message: `Cannot delete workflow: ${storeRequisitionCount} active store requisition(s) are using this workflow`
    })
  }

  // Check in-progress store requisitions
  const inProgressSRCount = await prisma.tb_store_requisition.count({
    where: {
      workflow_id: workflowId,
      status: {
        in: ['Pending', 'Approved', 'In Progress']
      },
      deleted_at: null
    }
  })

  if (inProgressSRCount > 0) {
    errors.push({
      field: "id",
      message: `Cannot delete workflow: ${inProgressSRCount} in-progress store requisition(s) exist`
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### 4.4 User Assignment Rules

#### VAL-WF-032: User Assignment Business Rules
```typescript
// Validation Rule
const userAssignmentValidation = {
  name: "user_assignment_business_rules",
  trigger: "when assigning users to workflow stages",
  rules: [
    {
      rule: "user_has_permission",
      validation: "user has workflow approval permission",
      message: "User does not have permission to approve in workflows"
    },
    {
      rule: "user_department_match",
      condition: "workflow has department restriction",
      validation: "user department matches workflow department",
      message: "User's department does not match workflow restrictions"
    },
    {
      rule: "user_location_match",
      condition: "workflow has location restriction",
      validation: "user location matches workflow location",
      message: "User's location does not match workflow restrictions"
    },
    {
      rule: "no_conflict_of_interest",
      validation: "user not assigned to multiple approval stages in same workflow",
      message: "User cannot be assigned to multiple approval stages to prevent conflict of interest"
    }
  ]
}

// Validation Function
async function validateUserAssignment(
  workflow: Workflow,
  stageId: number,
  userId: string,
  prisma: PrismaClient
): Promise<ValidationResult> {
  const errors: ValidationError[] = []

  // Get user
  const user = await prisma.tb_user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: true
        }
      },
      department: true,
      location: true
    }
  })

  if (!user) {
    errors.push({
      field: "userId",
      message: "User not found"
    })
    return { valid: false, errors }
  }

  // Check user is active
  if (!user.is_active) {
    errors.push({
      field: "userId",
      message: "Cannot assign inactive user to workflow"
    })
  }

  // Check user has approval permission
  const hasApprovalPermission = user.role.permissions.some(
    p => p.code === 'workflow.approve' || p.code === 'workflow.manage'
  )

  if (!hasApprovalPermission) {
    errors.push({
      field: "userId",
      message: "User does not have workflow approval permission"
    })
  }

  // Check department restriction (if workflow has one in dimension field)
  if (workflow.dimension?.departmentId) {
    if (user.department_id !== workflow.dimension.departmentId) {
      errors.push({
        field: "userId",
        message: `User's department does not match workflow department restriction`
      })
    }
  }

  // Check location restriction
  if (workflow.dimension?.locationId) {
    if (user.location_id !== workflow.dimension.locationId) {
      errors.push({
        field: "userId",
        message: `User's location does not match workflow location restriction`
      })
    }
  }

  // Check for conflict of interest (user in multiple approval stages)
  const stages = workflow.data?.stages || []
  const stage = stages.find(s => s.id === stageId)

  if (stage && ['approver', 'reviewer'].includes(stage.roleType)) {
    const userInOtherStages = stages.some(s =>
      s.id !== stageId &&
      ['approver', 'reviewer'].includes(s.roleType) &&
      s.assignedUsers.some(u => u.id === userId)
    )

    if (userInOtherStages) {
      errors.push({
        field: "userId",
        message: "User is already assigned to another approval stage in this workflow"
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

---

## 5. Database Constraints

### 5.1 Primary Key Constraints
```sql
-- Workflow table primary key
ALTER TABLE tb_workflow
ADD CONSTRAINT tb_workflow_pkey PRIMARY KEY (id);

-- Ensure UUID generation
ALTER TABLE tb_workflow
ALTER COLUMN id SET DEFAULT gen_random_uuid();
```

### 5.2 Unique Constraints
```sql
-- Unique workflow name
ALTER TABLE tb_workflow
ADD CONSTRAINT tb_workflow_name_unique UNIQUE (name);

-- Composite index for workflow name and type
CREATE UNIQUE INDEX workflow_name_workflow_type_u
ON tb_workflow (name, workflow_type)
WHERE deleted_at IS NULL;
```

### 5.3 Check Constraints
```sql
-- Workflow type must be valid enum
ALTER TABLE tb_workflow
ADD CONSTRAINT tb_workflow_type_check
CHECK (workflow_type IN ('purchase_request_workflow', 'store_requisition_workflow'));

-- Active status must be boolean
ALTER TABLE tb_workflow
ADD CONSTRAINT tb_workflow_is_active_check
CHECK (is_active IN (true, false));

-- Soft delete pattern
ALTER TABLE tb_workflow
ADD CONSTRAINT tb_workflow_soft_delete_check
CHECK (
  (deleted_at IS NULL AND deleted_by_id IS NULL) OR
  (deleted_at IS NOT NULL AND deleted_by_id IS NOT NULL)
);

-- Audit trail consistency
ALTER TABLE tb_workflow
ADD CONSTRAINT tb_workflow_audit_check
CHECK (
  (created_at IS NOT NULL AND created_by_id IS NOT NULL) AND
  (updated_at IS NOT NULL AND updated_by_id IS NOT NULL)
);
```

### 5.4 Foreign Key Constraints
```sql
-- Foreign key to purchase requests
ALTER TABLE tb_purchase_request
ADD CONSTRAINT tb_purchase_request_workflow_fkey
FOREIGN KEY (workflow_id) REFERENCES tb_workflow(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Foreign key to store requisitions
ALTER TABLE tb_store_requisition
ADD CONSTRAINT tb_store_requisition_workflow_fkey
FOREIGN KEY (workflow_id) REFERENCES tb_workflow(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Foreign key to purchase request templates
ALTER TABLE tb_purchase_request_template
ADD CONSTRAINT tb_purchase_request_template_workflow_fkey
FOREIGN KEY (workflow_id) REFERENCES tb_workflow(id)
ON DELETE SET NULL
ON UPDATE CASCADE;
```

### 5.5 JSON Data Validation (PostgreSQL)
```sql
-- Validate JSON structure for workflow data
ALTER TABLE tb_workflow
ADD CONSTRAINT tb_workflow_data_structure_check
CHECK (
  data IS NULL OR (
    jsonb_typeof(data) = 'object' AND
    data ? 'stages' AND
    jsonb_typeof(data->'stages') = 'array'
  )
);

-- Validate stages array is not empty for active workflows
CREATE OR REPLACE FUNCTION validate_workflow_stages()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true AND (
    NEW.data IS NULL OR
    jsonb_array_length(NEW.data->'stages') < 2
  ) THEN
    RAISE EXCEPTION 'Active workflow must have at least 2 stages';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_stages_validation
BEFORE INSERT OR UPDATE ON tb_workflow
FOR EACH ROW
EXECUTE FUNCTION validate_workflow_stages();
```

---

## 6. Server-Side Validation

### 6.1 Complete Workflow Schema (Zod)
```typescript
import { z } from 'zod'

// Enums
const WorkflowTypeSchema = z.enum([
  'purchase_request_workflow',
  'store_requisition_workflow'
])

const RoleTypeSchema = z.enum([
  'requester',
  'purchaser',
  'approver',
  'reviewer'
])

const ActionTypeSchema = z.enum([
  'Submit',
  'Approve',
  'Reject',
  'Send Back',
  'Forward',
  'Cancel'
])

const OperatorTypeSchema = z.enum(['eq', 'lt', 'gt', 'lte', 'gte'])

const RouteActionTypeSchema = z.enum(['SKIP_STAGE', 'NEXT_STAGE'])

const NotificationEventTriggerSchema = z.enum([
  'onSubmit',
  'onApprove',
  'onReject',
  'onSendBack',
  'onSLA'
])

const NotificationChannelSchema = z.enum(['Email', 'System'])

// Stage Schema
const StageSchema = z.object({
  id: z.number().int().positive(),
  name: z.string()
    .min(2, "Stage name must be at least 2 characters")
    .max(50, "Stage name must not exceed 50 characters"),
  description: z.string()
    .max(200, "Description must not exceed 200 characters")
    .optional(),
  order: z.number().int().positive(),
  sla: z.object({
    value: z.number()
      .int("SLA value must be an integer")
      .positive("SLA value must be positive")
      .min(1)
      .max(365),
    unit: z.enum(['hours', 'days'])
  }).refine(
    (sla) => sla.unit !== "hours" || sla.value <= 720,
    { message: 'SLA hours cannot exceed 720 (30 days)' }
  ),
  roleType: RoleTypeSchema,
  availableActions: z.array(ActionTypeSchema)
    .min(1, "At least one action must be configured"),
  hideFields: z.object({
    pricePerUnit: z.boolean().default(false),
    totalPrice: z.boolean().default(false)
  }).optional(),
  assignedUsers: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      department: z.string(),
      location: z.string()
    })
  ).optional()
})

// Routing Rule Schema
const RoutingRuleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string()
    .min(3, "Routing rule name must be at least 3 characters")
    .max(100, "Routing rule name must not exceed 100 characters"),
  description: z.string()
    .max(200, "Description must not exceed 200 characters")
    .optional(),
  triggerStage: z.string().min(1, "Trigger stage is required"),
  condition: z.object({
    field: z.enum(["totalAmount", "itemCount", 'department', 'priority', 'requestor']),
    operator: OperatorTypeSchema,
    value: z.union([z.string(), z.number()])
  }),
  action: z.object({
    type: RouteActionTypeSchema,
    parameters: z.object({
      targetStage: z.string().min(1, "Target stage is required")
    })
  })
})

// Notification Schema
const NotificationSchema = z.object({
  id: z.number().int().positive(),
  eventTrigger: NotificationEventTriggerSchema,
  recipients: z.array(
    z.object({
      type: z.enum(["requester", "approver", 'all_approvers', 'next_approver', 'specific_users']),
      userIds: z.array(z.string().uuid()).optional()
    })
  ).min(1, "At least one recipient must be specified"),
  channels: z.array(NotificationChannelSchema)
    .min(1, "At least one channel must be selected"),
  template: z.object({
    subject: z.string()
      .min(1, "Subject is required")
      .max(200, "Subject must not exceed 200 characters"),
    body: z.string()
      .min(1, "Body is required")
      .max(2000, "Body must not exceed 2000 characters")
  })
})

// Workflow Data Schema (JSON)
const WorkflowDataSchema = z.object({
  stages: z.array(StageSchema)
    .min(2, "Workflow must have at least 2 stages")
    .max(20, "Workflow cannot have more than 20 stages"),
  routingRules: z.array(RoutingRuleSchema).optional(),
  notifications: z.array(NotificationSchema).optional(),
  templates: z.array(
    z.object({
      id: z.number().int().positive(),
      name: z.string(),
      subject: z.string(),
      body: z.string()
    })
  ).optional(),
  productAssignments: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      category: z.string()
    })
  ).optional()
})

// Main Workflow Schema
export const WorkflowSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string()
    .min(3, "Workflow name must be at least 3 characters")
    .max(100, "Workflow name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters in workflow name"),
  workflow_type: WorkflowTypeSchema,
  description: z.string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  note: z.string()
    .max(1000, "Note must not exceed 1000 characters")
    .optional(),
  is_active: z.boolean().default(true),
  data: WorkflowDataSchema.optional(),
  info: z.record(z.any()).optional(),
  dimension: z.record(z.any()).optional(),
  created_at: z.date().optional(),
  created_by_id: z.string().uuid().optional(),
  updated_at: z.date().optional(),
  updated_by_id: z.string().uuid().optional(),
  deleted_at: z.date().optional().nullable(),
  deleted_by_id: z.string().uuid().optional().nullable()
})

// Type inference
export type WorkflowInput = z.infer<typeof WorkflowSchema>
export type StageInput = z.infer<typeof StageSchema>
export type RoutingRuleInput = z.infer<typeof RoutingRuleSchema>
export type NotificationInput = z.infer<typeof NotificationSchema>
```

### 6.2 Server Action Validation
```typescript
'use server'

import { z } from 'zod'
import { WorkflowSchema } from './schemas'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function createWorkflow(data: unknown) {
  try {
    // Validate input
    const validatedData = WorkflowSchema.parse(data)

    // Get current user
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized"
      }
    }

    // Additional business validations
    const businessValidation = await validateWorkflowBusinessRules(validatedData)
    if (!businessValidation.valid) {
      return {
        success: false,
        errors: businessValidation.errors
      }
    }

    // Create workflow
    const workflow = await prisma.tb_workflow.create({
      data: {
        name: validatedData.name,
        workflow_type: validatedData.workflow_type,
        description: validatedData.description,
        note: validatedData.note,
        is_active: validatedData.is_active,
        data: validatedData.data as any,
        info: validatedData.info as any,
        dimension: validatedData.dimension as any,
        created_by_id: session.user.id,
        updated_by_id: session.user.id
      }
    })

    return {
      success: true,
      data: workflow
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }

    return {
      success: false,
      error: "Failed to create workflow"
    }
  }
}

async function validateWorkflowBusinessRules(workflow: WorkflowInput) {
  const errors: ValidationError[] = []

  // Check unique name
  const existing = await prisma.tb_workflow.findFirst({
    where: {
      name: workflow.name,
      deleted_at: null
    }
  })

  if (existing) {
    errors.push({
      field: "name",
      message: "A workflow with this name already exists"
    })
  }

  // Validate stages if data provided
  if (workflow.data?.stages) {
    const stageValidation = validateStages(workflow.data.stages)
    if (!stageValidation.valid) {
      errors.push(...stageValidation.errors)
    }
  }

  // Validate routing rules if provided
  if (workflow.data?.routingRules && workflow.data?.stages) {
    const routingValidation = validateNoCircularDependencies(
      workflow.data.stages,
      workflow.data.routingRules
    )
    if (!routingValidation.valid) {
      errors.push(...routingValidation.errors)
    }
  }

  // Validate activation prerequisites if activating
  if (workflow.is_active) {
    const activationValidation = validateWorkflowActivation(workflow as Workflow)
    if (!activationValidation.valid) {
      errors.push(...activationValidation.errors)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

---

## 7. Client-Side Validation

### 7.1 React Hook Form Integration
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WorkflowSchema, type WorkflowInput } from './schemas'

export function WorkflowForm() {
  const form = useForm<WorkflowInput>({
    resolver: zodResolver(WorkflowSchema),
    defaultValues: {
      name: '',
      workflow_type: 'purchase_request_workflow',
      description: '',
      is_active: false,
      data: {
        stages: [],
        routingRules: [],
        notifications: []
      }
    }
  })

  const onSubmit = async (data: WorkflowInput) => {
    const result = await createWorkflow(data)

    if (!result.success) {
      // Handle validation errors
      if (result.errors) {
        result.errors.forEach(error => {
          form.setError(error.field as any, {
            type: 'manual',
            message: error.message
          })
        })
      }
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### 7.2 Real-Time Field Validation
```typescript
// Custom validation hook
export function useWorkflowValidation() {
  const validateWorkflowName = async (name: string) => {
    if (name.length < 3) {
      return "Workflow name must be at least 3 characters"
    }

    if (name.length > 100) {
      return "Workflow name must not exceed 100 characters"
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      return "Invalid characters in workflow name"
    }

    // Check uniqueness (debounced API call)
    const exists = await checkWorkflowNameExists(name)
    if (exists) {
      return "A workflow with this name already exists"
    }

    return true
  }

  const validateStageName = (stages: Stage[], newName: string, excludeId?: number) => {
    const duplicate = stages.find(
      s => s.name === newName && s.id !== excludeId
    )

    if (duplicate) {
      return "Stage name must be unique within the workflow"
    }

    return true
  }

  return {
    validateWorkflowName,
    validateStageName
  }
}
```

---

## 8. Validation Error Messages

### 8.1 Error Message Catalog

```typescript
export const ValidationErrors = {
  // Workflow errors
  WORKFLOW_NAME_REQUIRED: "Workflow name is required",
  WORKFLOW_NAME_TOO_SHORT: "Workflow name must be at least 3 characters",
  WORKFLOW_NAME_TOO_LONG: "Workflow name must not exceed 100 characters",
  WORKFLOW_NAME_INVALID_CHARS: "Workflow name can only contain letters, numbers, spaces, hyphens, and underscores",
  WORKFLOW_NAME_EXISTS: "A workflow with this name already exists",
  WORKFLOW_NAME_RESERVED: "This workflow name is reserved and cannot be used",

  WORKFLOW_TYPE_REQUIRED: "Workflow type is required",
  WORKFLOW_TYPE_INVALID: "Invalid workflow type",
  WORKFLOW_TYPE_IMMUTABLE: "Cannot change workflow type when workflow is active and has associated documents",

  WORKFLOW_MIN_STAGES: "Workflow must have at least 2 stages",
  WORKFLOW_MAX_STAGES: "Workflow cannot have more than 20 stages",

  WORKFLOW_CANNOT_ACTIVATE: "Cannot activate workflow: {reason}",
  WORKFLOW_CANNOT_DEACTIVATE: "Cannot deactivate workflow with pending approvals or in-progress documents",
  WORKFLOW_CANNOT_DELETE: "Cannot delete workflow: {reason}",

  // Stage errors
  STAGE_NAME_REQUIRED: "Stage name is required",
  STAGE_NAME_TOO_SHORT: "Stage name must be at least 2 characters",
  STAGE_NAME_TOO_LONG: "Stage name must not exceed 50 characters",
  STAGE_NAME_DUPLICATE: "Stage name must be unique within the workflow",

  STAGE_SLA_REQUIRED: "SLA is required",
  STAGE_SLA_INVALID: "SLA value must be a positive integer",
  STAGE_SLA_HOURS_EXCEEDED: "SLA hours cannot exceed 720 (30 days)",

  STAGE_ROLE_REQUIRED: "Stage role type is required",
  STAGE_ROLE_INVALID: "Invalid role type",

  STAGE_ACTIONS_REQUIRED: "At least one action must be configured",
  STAGE_FIRST_MUST_HAVE_SUBMIT: "First stage must have 'Submit' action",
  STAGE_FINAL_MUST_HAVE_APPROVE: "Final stage must have 'Approve' and 'Reject' actions",

  STAGE_USERS_REQUIRED: "Stage must have at least one assigned user",
  STAGE_USER_INACTIVE: "Cannot assign inactive users to workflow stages",
  STAGE_USER_NO_PERMISSION: "User does not have approval permissions",
  STAGE_USER_DEPARTMENT_MISMATCH: "User's department does not match workflow department",

  // Routing errors
  ROUTING_NAME_REQUIRED: "Routing rule name is required",
  ROUTING_NAME_DUPLICATE: "Routing rule name must be unique within the workflow",

  ROUTING_TRIGGER_REQUIRED: "Trigger stage is required",
  ROUTING_TRIGGER_NOT_EXISTS: "Trigger stage must exist in the workflow",
  ROUTING_TRIGGER_FINAL_STAGE: "Cannot create routing rule for final stage",

  ROUTING_CONDITION_FIELD_REQUIRED: "Condition field is required",
  ROUTING_CONDITION_FIELD_INVALID: "Invalid condition field",
  ROUTING_CONDITION_OPERATOR_REQUIRED: "Condition operator is required",
  ROUTING_CONDITION_OPERATOR_INVALID: "Invalid condition operator",
  ROUTING_CONDITION_VALUE_REQUIRED: "Condition value is required",
  ROUTING_CONDITION_VALUE_TYPE_MISMATCH: "Condition value type does not match field type",

  ROUTING_ACTION_TYPE_REQUIRED: "Action type is required",
  ROUTING_ACTION_TYPE_INVALID: "Invalid action type",
  ROUTING_ACTION_TARGET_REQUIRED: "Target stage is required",
  ROUTING_ACTION_TARGET_NOT_EXISTS: "Target stage must exist in the workflow",
  ROUTING_ACTION_TARGET_BACKWARD: "Target stage must be after trigger stage in the workflow",

  ROUTING_CIRCULAR_DEPENDENCY: "Circular dependency detected in routing rules",

  // Notification errors
  NOTIFICATION_EVENT_REQUIRED: "Event trigger is required",
  NOTIFICATION_EVENT_INVALID: "Invalid event trigger",

  NOTIFICATION_RECIPIENTS_REQUIRED: "At least one recipient must be specified",
  NOTIFICATION_RECIPIENTS_INVALID: "Invalid recipient type",

  NOTIFICATION_CHANNELS_REQUIRED: "At least one notification channel must be selected",
  NOTIFICATION_CHANNELS_INVALID: "Invalid notification channel",

  NOTIFICATION_SUBJECT_REQUIRED: "Notification subject is required",
  NOTIFICATION_SUBJECT_TOO_LONG: "Subject must not exceed 200 characters",
  NOTIFICATION_BODY_REQUIRED: "Notification body is required",
  NOTIFICATION_BODY_TOO_LONG: "Body must not exceed 2000 characters",
  NOTIFICATION_TEMPLATE_VARIABLE_INVALID: "Invalid variable '{{variable}}' in template",

  // Product errors
  PRODUCT_NOT_EXISTS: "Product does not exist",
  PRODUCT_INACTIVE: "Cannot assign inactive products to workflow",
  PRODUCT_DUPLICATE: "Product is already assigned to this workflow",
  PRODUCT_DUPLICATE_ACROSS_WORKFLOWS: "Product is already assigned to another workflow of the same type"
}

// Helper function to format error messages with parameters
export function formatValidationError(
  errorKey: keyof typeof ValidationErrors,
  params?: Record<string, string | number>
): string {
  let message = ValidationErrors[errorKey]

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value))
    })
  }

  return message
}
```

### 8.2 User-Friendly Error Display
```typescript
// Format validation errors for display
export function formatValidationErrorsForDisplay(
  errors: ValidationError[]
): string {
  if (errors.length === 0) return ""

  if (errors.length === 1) {
    return errors[0].message
  }

  return `
    <div>
      <p>Please fix the following errors:</p>
      <ul>
        ${errors.map(err => `<li>${err.field}: ${err.message}</li>`).join('')}
      </ul>
    </div>
  `
}

// Group errors by section
export function groupErrorsBySection(errors: ValidationError[]) {
  return errors.reduce((acc, error) => {
    const section = error.field.split('[')[0] || 'general'
    if (!acc[section]) acc[section] = []
    acc[section].push(error)
    return acc
  }, {} as Record<string, ValidationError[]>)
}
```

---

## 9. Validation Testing

### 9.1 Unit Tests for Validation Functions
```typescript
import { describe, it, expect } from 'vitest'
import { validateWorkflowActivation, validateNoCircularDependencies } from './validations'

describe('Workflow Validation', () => {
  describe('validateWorkflowActivation', () => {
    it('should reject activation with less than 2 stages', () => {
      const workflow = {
        id: '123',
        name: 'Test Workflow',
        workflow_type: 'purchase_request_workflow',
        is_active: true,
        data: {
          stages: [
            { id: 1, name: 'Stage 1', roleType: 'requester', availableActions: ['Submit'] }
          ]
        }
      }

      const result = validateWorkflowActivation(workflow as Workflow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('less than 2 stages')
        })
      )
    })

    it('should reject activation without approval stage users', () => {
      const workflow = {
        id: '123',
        name: 'Test Workflow',
        workflow_type: 'purchase_request_workflow',
        is_active: true,
        data: {
          stages: [
            { id: 1, name: 'Request', order: 1, roleType: 'requester', availableActions: ['Submit'], assignedUsers: [] },
            { id: 2, name: 'Approve', order: 2, roleType: 'approver', availableActions: ['Approve'], assignedUsers: [] }
          ]
        }
      }

      const result = validateWorkflowActivation(workflow as Workflow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('must have assigned users')
        })
      )
    })

    it('should accept valid activation', () => {
      const workflow = {
        id: '123',
        name: 'Test Workflow',
        workflow_type: 'purchase_request_workflow',
        is_active: true,
        data: {
          stages: [
            {
              id: 1,
              name: 'Request',
              order: 1,
              roleType: 'requester',
              availableActions: ['Submit'],
              assignedUsers: [],
              sla: { value: 24, unit: 'hours' }
            },
            {
              id: 2,
              name: 'Approve',
              order: 2,
              roleType: 'approver',
              availableActions: ['Approve', 'Reject'],
              assignedUsers: [{ id: '456', name: 'Approver', department: 'Ops', location: 'HQ' }],
              sla: { value: 48, unit: 'hours' }
            }
          ],
          notifications: [
            { id: 1, eventTrigger: 'onSubmit', recipients: [], channels: ['Email'], template: { subject: 'Test', body: 'Test' } },
            { id: 2, eventTrigger: 'onApprove', recipients: [], channels: ['Email'], template: { subject: 'Test', body: 'Test' } },
            { id: 3, eventTrigger: 'onReject', recipients: [], channels: ['Email'], template: { subject: 'Test', body: 'Test' } }
          ]
        }
      }

      const result = validateWorkflowActivation(workflow as Workflow)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('validateNoCircularDependencies', () => {
    it('should detect circular routing dependency', () => {
      const stages = [
        { id: 1, name: 'Stage 1', order: 1, roleType: 'requester', availableActions: ['Submit'], assignedUsers: [], sla: { value: 24, unit: 'hours' } },
        { id: 2, name: 'Stage 2', order: 2, roleType: 'approver', availableActions: ['Approve'], assignedUsers: [], sla: { value: 24, unit: 'hours' } },
        { id: 3, name: 'Stage 3', order: 3, roleType: 'approver', availableActions: ['Approve'], assignedUsers: [], sla: { value: 24, unit: 'hours' } }
      ]

      const routingRules = [
        {
          id: 1,
          name: 'Rule 1',
          triggerStage: 'Stage 2',
          condition: { field: 'totalAmount', operator: 'gt', value: 1000 },
          action: { type: 'NEXT_STAGE', parameters: { targetStage: 'Stage 3' } }
        },
        {
          id: 2,
          name: 'Rule 2',
          triggerStage: 'Stage 3',
          condition: { field: 'totalAmount', operator: 'gt', value: 5000 },
          action: { type: 'NEXT_STAGE', parameters: { targetStage: 'Stage 2' } } // Creates cycle
        }
      ]

      const result = validateNoCircularDependencies(stages as Stage[], routingRules as RoutingRule[])

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('Circular dependency')
        })
      )
    })

    it('should accept valid routing rules', () => {
      const stages = [
        { id: 1, name: 'Stage 1', order: 1, roleType: 'requester', availableActions: ['Submit'], assignedUsers: [], sla: { value: 24, unit: 'hours' } },
        { id: 2, name: 'Stage 2', order: 2, roleType: 'approver', availableActions: ['Approve'], assignedUsers: [], sla: { value: 24, unit: 'hours' } },
        { id: 3, name: 'Stage 3', order: 3, roleType: 'approver', availableActions: ['Approve'], assignedUsers: [], sla: { value: 24, unit: 'hours' } }
      ]

      const routingRules = [
        {
          id: 1,
          name: 'Skip Stage 2',
          triggerStage: 'Stage 1',
          condition: { field: 'totalAmount', operator: 'lt', value: 100 },
          action: { type: 'SKIP_STAGE', parameters: { targetStage: 'Stage 3' } }
        }
      ]

      const result = validateNoCircularDependencies(stages as Stage[], routingRules as RoutingRule[])

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})
```

### 9.2 Integration Tests
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createWorkflow, updateWorkflow, deleteWorkflow } from './actions'
import { prisma } from '@/lib/prisma'

describe('Workflow Actions Integration', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.tb_workflow.deleteMany({
      where: { name: { startsWith: 'Test-' } }
    })
  })

  it('should create valid workflow', async () => {
    const workflowData = {
      name: 'Test-Valid-Workflow',
      workflow_type: 'purchase_request_workflow',
      description: 'Test workflow',
      is_active: false,
      data: {
        stages: [
          {
            id: 1,
            name: 'Request',
            order: 1,
            roleType: 'requester',
            availableActions: ['Submit'],
            assignedUsers: [],
            sla: { value: 24, unit: 'hours' }
          },
          {
            id: 2,
            name: 'Approve',
            order: 2,
            roleType: 'approver',
            availableActions: ['Approve', 'Reject'],
            assignedUsers: [],
            sla: { value: 48, unit: 'hours' }
          }
        ]
      }
    }

    const result = await createWorkflow(workflowData)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data.name).toBe(workflowData.name)
  })

  it('should reject duplicate workflow name', async () => {
    const workflowData = {
      name: 'Test-Duplicate-Workflow',
      workflow_type: 'purchase_request_workflow',
      is_active: false
    }

    // Create first workflow
    await createWorkflow(workflowData)

    // Attempt to create duplicate
    const result = await createWorkflow(workflowData)

    expect(result.success).toBe(false)
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: 'name',
        message: expect.stringContaining('already exists')
      })
    )
  })

  it('should prevent deletion of workflow with active documents', async () => {
    // Create workflow
    const workflow = await prisma.tb_workflow.create({
      data: {
        name: 'Test-Workflow-With-Docs',
        workflow_type: 'purchase_request_workflow',
        is_active: true,
        created_by_id: 'test-user',
        updated_by_id: 'test-user'
      }
    })

    // Create purchase request using this workflow
    await prisma.tb_purchase_request.create({
      data: {
        workflow_id: workflow.id,
        status: 'Pending',
        // ... other required fields
      }
    })

    // Attempt to delete
    const result = await deleteWorkflow(workflow.id)

    expect(result.success).toBe(false)
    expect(result.error).toContain('active documents')
  })
})
```

---

## Appendices

### Appendix A: Validation Checklist

**Before Workflow Creation**:
- [ ] Workflow name is unique and valid
- [ ] Workflow type is selected
- [ ] At least 2 stages are configured
- [ ] First stage has requester role and Submit action
- [ ] Final stage has approver role and Approve/Reject actions
- [ ] All approval stages have assigned users
- [ ] No circular routing dependencies
- [ ] Critical notifications are configured

**Before Workflow Activation**:
- [ ] All stages have complete configuration
- [ ] All approval stages have at least one assigned user
- [ ] No routing rule errors
- [ ] Critical notifications (onSubmit, onApprove, onReject) are configured
- [ ] All notification templates are valid

**Before Workflow Modification (Active)**:
- [ ] Workflow type is not being changed
- [ ] No stages are being deleted if they have active documents
- [ ] Stage order is not being changed if in-progress documents exist
- [ ] Version will be incremented

**Before Workflow Deletion**:
- [ ] No active purchase requests or requisitions
- [ ] No in-progress documents
- [ ] Soft delete will be used

### Appendix B: Validation Error Code Reference

| Error Code | Field | Message | Severity |
|------------|-------|---------|----------|
| VAL-WF-001 | name | Workflow name validation failed | HIGH |
| VAL-WF-002 | workflow_type | Workflow type validation failed | CRITICAL |
| VAL-WF-003 | description | Description validation failed | LOW |
| VAL-WF-004 | note | Note validation failed | LOW |
| VAL-WF-005 | is_active | Active status validation failed | HIGH |
| VAL-WF-006 | stages[].name | Stage name validation failed | HIGH |
| VAL-WF-007 | stages[].description | Stage description validation failed | LOW |
| VAL-WF-008 | stages[].sla | Stage SLA validation failed | HIGH |
| VAL-WF-009 | stages[].roleType | Stage role type validation failed | HIGH |
| VAL-WF-010 | stages[].availableActions | Stage actions validation failed | HIGH |
| VAL-WF-011 | stages[].hideFields | Stage hide fields validation failed | MEDIUM |
| VAL-WF-012 | stages[].assignedUsers | Stage user assignment validation failed | HIGH |
| VAL-WF-013 | routingRules[].name | Routing rule name validation failed | MEDIUM |
| VAL-WF-014 | routingRules[].triggerStage | Routing trigger stage validation failed | HIGH |
| VAL-WF-015 | routingRules[].condition | Routing condition validation failed | HIGH |
| VAL-WF-016 | routingRules[].action | Routing action validation failed | HIGH |
| VAL-WF-017 | notifications[].eventTrigger | Notification event validation failed | HIGH |
| VAL-WF-018 | notifications[].recipients | Notification recipients validation failed | HIGH |
| VAL-WF-019 | notifications[].channels | Notification channels validation failed | HIGH |
| VAL-WF-020 | notifications[].template | Notification template validation failed | MEDIUM |
| VAL-WF-021 | productAssignments[] | Product assignment validation failed | MEDIUM |
| VAL-WF-022 | stages | Minimum stages validation failed | CRITICAL |
| VAL-WF-023 | stages | Stage order validation failed | CRITICAL |
| VAL-WF-024 | routingRules | Circular dependency validation failed | CRITICAL |
| VAL-WF-025 | notifications | Notification completeness validation failed | HIGH |
| VAL-WF-026 | stages[0] | First stage configuration validation failed | CRITICAL |
| VAL-WF-027 | stages[last] | Final stage configuration validation failed | CRITICAL |
| VAL-WF-028 | stages[1..n-1] | Intermediate stage validation failed | HIGH |
| VAL-WF-029 | is_active | Workflow activation validation failed | CRITICAL |
| VAL-WF-030 | * | Active workflow modification validation failed | HIGH |
| VAL-WF-031 | id | Workflow deletion validation failed | CRITICAL |
| VAL-WF-032 | stages[].assignedUsers | User assignment validation failed | HIGH |

### Appendix C: Performance Considerations

**Validation Performance Optimization**:
- Client-side validation reduces server load by catching errors early
- Debounced uniqueness checks (300ms delay) reduce database queries
- Cached validation results for frequently accessed workflows
- Batch validation for multiple fields reduces round trips
- Asynchronous validation for non-blocking UX

**Database Query Optimization**:
- Indexed columns for uniqueness checks (name, workflow_type)
- Composite indexes for frequently queried combinations
- JSON path indexing for workflow data queries
- Query result caching with 5-minute TTL

---

**Document Control**:
- **Created**: 2025-01-16
- **Last Modified**: 2025-01-16
- **Version**: 1.0
- **Status**: Active
- **Review Cycle**: Quarterly
