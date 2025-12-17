# Business Rules - Validation Rules (VAL)

**Module**: System Administration - Business Rules
**Version**: 1.0
**Last Updated**: 2025-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

This document defines comprehensive validation rules for the Business Rules Management module, implementing a three-layer validation strategy:

1. **Client-Side Validation**: Immediate user feedback using React Hook Form + Zod
2. **Server-Side Validation**: Business logic enforcement using Zod + custom validators
3. **Database Validation**: Data integrity constraints using PostgreSQL

---

## 2. Business Rule Validation

### 2.1 Basic Information Validation

#### Rule Name (VR-BR-001)
**Field**: `name`
**Type**: String
**Layer**: Client + Server + Database

**Validation Rules**:
- **Required**: Yes
- **Min Length**: 3 characters
- **Max Length**: 100 characters
- **Pattern**: `/^[a-zA-Z0-9\s\-_]+$/` (alphanumeric, spaces, hyphens, underscores only)
- **Uniqueness**: Case-insensitive unique across all rules
- **Trim**: Whitespace trimmed from start and end

**Error Messages**:
- Empty: "Rule name is required"
- Too short: "Rule name must be at least 3 characters"
- Too long: "Rule name must not exceed 100 characters"
- Invalid pattern: "Rule name can only contain letters, numbers, spaces, hyphens, and underscores"
- Duplicate: "A rule with this name already exists"

**Zod Schema**:
```typescript
name: z.string()
  .min(3, "Rule name must be at least 3 characters")
  .max(100, "Rule name must not exceed 100 characters")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Rule name can only contain letters, numbers, spaces, hyphens, and underscores")
  .transform(val => val.trim())
```

---

#### Rule Description (VR-BR-002)
**Field**: `description`
**Type**: String
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Min Length**: 10 characters
- **Max Length**: 500 characters
- **Trim**: Whitespace trimmed

**Error Messages**:
- Empty: "Rule description is required"
- Too short: "Description must be at least 10 characters"
- Too long: "Description must not exceed 500 characters"

**Zod Schema**:
```typescript
description: z.string()
  .min(10, "Description must be at least 10 characters")
  .max(500, "Description must not exceed 500 characters")
  .transform(val => val.trim())
```

---

#### Rule Category (VR-BR-003)
**Field**: `category`
**Type**: Enum
**Layer**: Client + Server + Database

**Validation Rules**:
- **Required**: Yes
- **Allowed Values**:
  - `vendor-selection`
  - `pricing`
  - `approval`
  - `currency`
  - `fractional-sales`
  - `quality-control`
  - `inventory-management`
  - `food-safety`
  - `waste-management`

**Error Messages**:
- Empty: "Rule category is required"
- Invalid: "Invalid rule category. Must be one of: vendor-selection, pricing, approval, currency, fractional-sales, quality-control, inventory-management, food-safety, waste-management"

**Zod Schema**:
```typescript
category: z.enum([
  'vendor-selection',
  'pricing',
  'approval',
  'currency',
  'fractional-sales',
  'quality-control',
  'inventory-management',
  'food-safety',
  'waste-management'
], {
  errorMap: () => ({ message: "Please select a valid rule category" })
})
```

---

#### Rule Priority (VR-BR-004)
**Field**: `priority`
**Type**: Integer
**Layer**: Client + Server + Database

**Validation Rules**:
- **Required**: Yes
- **Min Value**: 1
- **Max Value**: 10
- **Type**: Must be integer
- **Uniqueness**: No two active rules in same category can have same priority

**Error Messages**:
- Empty: "Rule priority is required"
- Out of range: "Priority must be between 1 and 10"
- Not integer: "Priority must be a whole number"
- Duplicate priority: "Another active rule in this category already has priority {priority}"

**Zod Schema**:
```typescript
priority: z.number()
  .int("Priority must be a whole number")
  .min(1, "Priority must be at least 1")
  .max(10, "Priority must not exceed 10")
```

**Business Logic Validation**:
```typescript
async function validateUniquePriority(
  category: string,
  priority: number,
  ruleId?: string
): Promise<boolean> {
  const existingRule = await prisma.tb_business_rule.findFirst({
    where: {
      category,
      priority,
      is_active: true,
      deleted_at: null,
      id: { not: ruleId } // Exclude current rule if editing
    }
  })

  return !existingRule
}
```

---

#### Rule Active Status (VR-BR-005)
**Field**: `isActive`
**Type**: Boolean
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Type**: Must be boolean
- **Business Rule**: Maximum 1000 active rules per organization

**Error Messages**:
- Invalid type: "Active status must be true or false"
- Limit exceeded: "Maximum number of active rules (1000) reached. Please deactivate another rule first."

**Zod Schema**:
```typescript
isActive: z.boolean({
  required_error: "Active status is required"
})
```

---

### 2.2 Rule Conditions Validation

#### Conditions Array (VR-BR-006)
**Field**: `conditions`
**Type**: Array
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Min Items**: 1 (at least one condition required)
- **Max Items**: 50
- **Type**: Array of condition objects

**Error Messages**:
- Empty: "At least one condition is required"
- Too many: "Maximum 50 conditions allowed per rule"

**Zod Schema**:
```typescript
conditions: z.array(conditionSchema)
  .min(1, "At least one condition is required")
  .max(50, "Maximum 50 conditions allowed per rule")
```

---

#### Condition Field (VR-BR-007)
**Field**: `conditions[].field`
**Type**: String
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 100 characters
- **Pattern**: `/^[a-zA-Z][a-zA-Z0-9_.]*$/` (must start with letter, can contain letters, numbers, dots, underscores)

**Error Messages**:
- Empty: "Condition field is required"
- Too long: "Field name must not exceed 100 characters"
- Invalid pattern: "Field name must start with a letter and can only contain letters, numbers, dots, and underscores"

**Zod Schema**:
```typescript
field: z.string()
  .min(1, "Condition field is required")
  .max(100, "Field name must not exceed 100 characters")
  .regex(/^[a-zA-Z][a-zA-Z0-9_.]*$/, "Field name must start with a letter and can only contain letters, numbers, dots, and underscores")
```

---

#### Condition Operator (VR-BR-008)
**Field**: `conditions[].operator`
**Type**: Enum
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Allowed Values**:
  - `equals`
  - `contains`
  - `greaterThan`
  - `lessThan`
  - `between`
  - `in`
  - `not_equals`

**Error Messages**:
- Empty: "Condition operator is required"
- Invalid: "Invalid operator. Must be one of: equals, contains, greaterThan, lessThan, between, in, not_equals"

**Zod Schema**:
```typescript
operator: z.enum([
  'equals',
  'contains',
  'greaterThan',
  'lessThan',
  'between',
  'in',
  'not_equals'
], {
  errorMap: () => ({ message: "Please select a valid operator" })
})
```

---

#### Condition Value (VR-BR-009)
**Field**: `conditions[].value`
**Type**: Any
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Type Matching**: Must match the field's data type
- **Operator-Specific**:
  - `between`: Must be array with exactly 2 elements, second > first
  - `in`: Must be non-empty array
  - Others: Must be single value

**Error Messages**:
- Empty: "Condition value is required"
- Type mismatch: "Value type must match field type"
- Between invalid: "Between operator requires exactly 2 values, with second value greater than first"
- In empty: "In operator requires at least one value"

**Zod Schema**:
```typescript
value: z.any()
  .refine(val => val !== null && val !== undefined, {
    message: "Condition value is required"
  })
```

**Custom Validation**:
```typescript
function validateConditionValue(
  operator: ConditionOperator,
  value: any,
  fieldType: string
): { valid: boolean; error?: string } {
  if (operator === 'between') {
    if (!Array.isArray(value) || value.length !== 2) {
      return { valid: false, error: "Between operator requires exactly 2 values" }
    }
    if (value[1] <= value[0]) {
      return { valid: false, error: "Second value must be greater than first value" }
    }
  }

  if (operator === 'in') {
    if (!Array.isArray(value) || value.length === 0) {
      return { valid: false, error: "In operator requires at least one value" }
    }
  }

  // Type matching validation
  // ... implementation based on fieldType

  return { valid: true }
}
```

---

#### Logical Operator (VR-BR-010)
**Field**: `conditions[].logicalOperator`
**Type**: Enum | null
**Layer**: Client + Server

**Validation Rules**:
- **Required**: No (only for conditions after first)
- **Allowed Values**: `AND`, `OR`, `null`
- **Business Rule**: Last condition must not have logical operator

**Error Messages**:
- Invalid: "Logical operator must be AND or OR"
- Last condition: "Last condition should not have a logical operator"

**Zod Schema**:
```typescript
logicalOperator: z.enum(['AND', 'OR']).nullable().optional()
```

---

### 2.3 Rule Actions Validation

#### Actions Array (VR-BR-011)
**Field**: `actions`
**Type**: Array
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Min Items**: 1 (at least one action required)
- **Max Items**: 20
- **Type**: Array of action objects

**Error Messages**:
- Empty: "At least one action is required"
- Too many: "Maximum 20 actions allowed per rule"

**Zod Schema**:
```typescript
actions: z.array(actionSchema)
  .min(1, "At least one action is required")
  .max(20, "Maximum 20 actions allowed per rule")
```

---

#### Action Type (VR-BR-012)
**Field**: `actions[].type`
**Type**: Enum
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Allowed Values**:
  - `assignVendor`
  - `setPrice`
  - `flagForReview`
  - `applyDiscount`
  - `convertCurrency`
  - `blockSale`
  - `requireApproval`
  - `scheduleWasteCheck`
  - `triggerReorder`
  - `adjustPrice`
  - `markExpired`
  - `quarantineItem`
  - `notifyManager`
  - `updateInventory`
  - `logCompliance`
  - `sendAlert`

**Error Messages**:
- Empty: "Action type is required"
- Invalid: "Invalid action type"

**Zod Schema**:
```typescript
type: z.enum([
  'assignVendor',
  'setPrice',
  'flagForReview',
  'applyDiscount',
  'convertCurrency',
  'blockSale',
  'requireApproval',
  'scheduleWasteCheck',
  'triggerReorder',
  'adjustPrice',
  'markExpired',
  'quarantineItem',
  'notifyManager',
  'updateInventory',
  'logCompliance',
  'sendAlert'
])
```

---

#### Action Parameters (VR-BR-013)
**Field**: `actions[].parameters`
**Type**: Object
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Type**: Must be valid object
- **Action-Specific**: Each action type has required parameters

**Error Messages**:
- Empty: "Action parameters are required"
- Missing required: "Missing required parameter: {parameterName}"
- Invalid type: "Parameter {parameterName} must be of type {expectedType}"

**Zod Schema**:
```typescript
parameters: z.record(z.any())
  .refine(params => Object.keys(params).length > 0, {
    message: "At least one parameter is required"
  })
```

**Action-Specific Parameter Validation**:
```typescript
const actionParameterSchemas = {
  assignVendor: z.object({
    vendorId: z.string().uuid("Invalid vendor ID")
  }),

  setPrice: z.object({
    price: z.number().positive("Price must be positive"),
    currency: z.string().length(3, "Currency must be 3-letter code")
  }),

  blockSale: z.object({
    reason: z.string().min(1, "Reason is required"),
    notifyManager: z.boolean().optional()
  }),

  requireApproval: z.object({
    approverRole: z.string().min(1, "Approver role is required"),
    urgency: z.enum(['low', 'medium', 'high']).optional()
  }),

  notifyManager: z.object({
    managerId: z.string().uuid("Invalid manager ID").optional(),
    message: z.string().min(1, "Message is required")
  }),

  // ... other action types
}
```

---

## 3. Specialized Rule Validation

### 3.1 Fractional Sales Rule Validation

#### Fractional Type (VR-BR-014)
**Field**: `fractionalType`
**Type**: Enum
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes (for fractional-sales category)
- **Allowed Values**:
  - `pizza-slice`
  - `cake-slice`
  - `bottle-glass`
  - `portion-control`
  - `custom`

**Error Messages**:
- Empty: "Fractional type is required for fractional sales rules"
- Invalid: "Invalid fractional type"

**Zod Schema**:
```typescript
fractionalType: z.enum([
  'pizza-slice',
  'cake-slice',
  'bottle-glass',
  'portion-control',
  'custom'
]).optional().refine((val, ctx) => {
  if (ctx.parent.category === 'fractional-sales' && !val) {
    return false
  }
  return true
}, { message: 'Fractional type is required for fractional sales rules' })
```

---

#### Food Safety Level (VR-BR-015)
**Field**: `foodSafetyLevel`
**Type**: Enum
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes (for fractional-sales category)
- **Allowed Values**: `high`, `medium`, `low`

**Error Messages**:
- Empty: "Food safety level is required for fractional sales rules"
- Invalid: "Invalid food safety level"

**Zod Schema**:
```typescript
foodSafetyLevel: z.enum(['high', 'medium', 'low']).optional()
  .refine((val, ctx) => {
    if (ctx.parent.category === 'fractional-sales' && !val) {
      return false
    }
    return true
  }, { message: 'Food safety level is required for fractional sales rules' })
```

---

#### Quality Standards (VR-BR-016)
**Field**: `qualityStandards`
**Type**: Array
**Layer**: Client + Server

**Validation Rules**:
- **Required**: No
- **Min Items**: 0
- **Max Items**: 20
- **Business Rule**: At least one critical control point required for high safety level

**Error Messages**:
- Too many: "Maximum 20 quality standards allowed per rule"
- No critical CCP: "At least one critical control point is required for high food safety level"

**Zod Schema**:
```typescript
qualityStandards: z.array(qualityStandardSchema)
  .max(20, "Maximum 20 quality standards allowed per rule")
  .optional()
  .refine((standards, ctx) => {
    if (ctx.parent.foodSafetyLevel === 'high') {
      return standards?.some(s => s.criticalControl) ?? false
    }
    return true
  }, { message: 'At least one critical control point required for high safety level' })
```

---

#### Quality Standard Fields (VR-BR-017)
**Field**: `qualityStandards[].{fields}`
**Type**: Various
**Layer**: Client + Server

**Validation Rules**:
- **standardName**: Required, 1-100 chars
- **measurementType**: Required, enum (time, temperature, appearance, weight, size, freshness)
- **minimumValue**: Optional, must be < maximumValue if both present
- **maximumValue**: Optional, must be > minimumValue if both present
- **unit**: Required, 1-50 chars
- **toleranceLevel**: Required, > 0, <= 100 (percentage)
- **criticalControl**: Required, boolean
- **monitoringFrequency**: Required, enum (continuous, hourly, shift, daily)

**Error Messages**:
- Various field-specific messages

**Zod Schema**:
```typescript
const qualityStandardSchema = z.object({
  standardName: z.string().min(1).max(100),
  measurementType: z.enum(['time', 'temperature', 'appearance', 'weight', 'size', 'freshness']),
  minimumValue: z.number().optional(),
  maximumValue: z.number().optional(),
  unit: z.string().min(1).max(50),
  toleranceLevel: z.number().positive().max(100),
  criticalControl: z.boolean(),
  monitoringFrequency: z.enum(['continuous', 'hourly', 'shift', 'daily'])
}).refine(data => {
  if (data.minimumValue !== undefined && data.maximumValue !== undefined) {
    return data.maximumValue > data.minimumValue
  }
  return true
}, { message: 'Maximum value must be greater than minimum value' })
```

---

### 3.2 Food Safety Rule Validation

#### Hazard Type (VR-BR-018)
**Field**: `hazardType`
**Type**: Enum
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes (for food-safety category)
- **Allowed Values**: `biological`, `chemical`, `physical`, `cross-contamination`

**Error Messages**:
- Empty: "Hazard type is required for food safety rules"

**Zod Schema**:
```typescript
hazardType: z.enum(['biological', 'chemical', 'physical', 'cross-contamination'])
  .optional()
  .refine((val, ctx) => {
    if (ctx.parent.category === 'food-safety' && !val) {
      return false
    }
    return true
  }, { message: 'Hazard type is required for food safety rules' })
```

---

#### Risk Level (VR-BR-019)
**Field**: `riskLevel`
**Type**: Enum
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes (for food-safety category)
- **Allowed Values**: `critical`, `high`, `medium`, `low`
- **Business Rule**: Critical risk requires monitoring

**Error Messages**:
- Empty: "Risk level is required for food safety rules"
- Critical without monitoring: "Critical risk level requires monitoring to be enabled"

**Zod Schema**:
```typescript
riskLevel: z.enum(['critical', 'high', 'medium', 'low'])
  .optional()
  .refine((val, ctx) => {
    if (ctx.parent.category === 'food-safety' && !val) {
      return false
    }
    return true
  }, { message: 'Risk level is required for food safety rules' })
```

---

#### HACCP Point (VR-BR-020)
**Field**: `haccpPoint`
**Type**: String
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes (for food-safety category)
- **Min Length**: 1 character
- **Max Length**: 100 characters

**Error Messages**:
- Empty: "HACCP point is required for food safety rules"
- Too long: "HACCP point must not exceed 100 characters"

**Zod Schema**:
```typescript
haccpPoint: z.string()
  .min(1, "HACCP point is required")
  .max(100, "HACCP point must not exceed 100 characters")
  .optional()
  .refine((val, ctx) => {
    if (ctx.parent.category === 'food-safety' && !val) {
      return false
    }
    return true
  }, { message: 'HACCP point is required for food safety rules' })
```

---

## 4. Compliance Violation Validation

### 4.1 Violation Basic Fields

#### Violation Type (VR-CV-001)
**Field**: `violationType`
**Type**: Enum
**Layer**: Client + Server + Database

**Validation Rules**:
- **Required**: Yes
- **Allowed Values**: `critical`, `major`, `minor`, `observation`

**Error Messages**:
- Empty: "Violation type is required"

**Zod Schema**:
```typescript
violationType: z.enum(['critical', 'major', 'minor', 'observation'])
```

---

#### Violation Description (VR-CV-002)
**Field**: `description`
**Type**: String
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Min Length**: 10 characters
- **Max Length**: 1000 characters

**Error Messages**:
- Empty: "Violation description is required"
- Too short: "Description must be at least 10 characters"
- Too long: "Description must not exceed 1000 characters"

**Zod Schema**:
```typescript
description: z.string()
  .min(10, "Description must be at least 10 characters")
  .max(1000, "Description must not exceed 1000 characters")
```

---

#### Violation Location (VR-CV-003)
**Field**: `location`
**Type**: String
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 255 characters

**Error Messages**:
- Empty: "Location is required"
- Too long: "Location must not exceed 255 characters"

**Zod Schema**:
```typescript
location: z.string()
  .min(1, "Location is required")
  .max(255, "Location must not exceed 255 characters")
```

---

### 4.2 Violation Workflow Validation

#### Acknowledgment Validation (VR-CV-004)
**Business Rule**: Critical violations must be acknowledged within 1 hour, major within 4 hours

**Validation Logic**:
```typescript
function validateAcknowledgmentTime(
  violation: ComplianceViolation,
  acknowledgedAt: Date
): { valid: boolean; error?: string } {
  const detectedAt = new Date(violation.detectedAt)
  const timeDiff = acknowledgedAt.getTime() - detectedAt.getTime()
  const hoursDiff = timeDiff / (1000 * 60 * 60)

  if (violation.violationType === 'critical' && hoursDiff > 1) {
    return {
      valid: false,
      error: "Critical violations must be acknowledged within 1 hour"
    }
  }

  if (violation.violationType === 'major' && hoursDiff > 4) {
    return {
      valid: false,
      error: "Major violations must be acknowledged within 4 hours"
    }
  }

  return { valid: true }
}
```

---

#### Evidence Requirement Validation (VR-CV-005)
**Business Rule**: Critical and major violations require evidence before closing

**Validation Logic**:
```typescript
function validateEvidenceRequirement(
  violation: ComplianceViolation,
  correctiveActions: CorrectiveAction[]
): { valid: boolean; error?: string } {
  if (['critical', 'major'].includes(violation.violationType)) {
    const hasEvidence = correctiveActions.some(ca =>
      ca.evidenceRequired && ca.evidenceUrl
    )

    if (!hasEvidence) {
      return {
        valid: false,
        error: `${violation.violationType} violations require evidence before closing`
      }
    }
  }

  return { valid: true }
}
```

---

## 5. Corrective Action Validation

### 5.1 Corrective Action Fields

#### Action Description (VR-CA-001)
**Field**: `action`
**Type**: String
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Min Length**: 10 characters
- **Max Length**: 1000 characters

**Error Messages**:
- Empty: "Action description is required"
- Too short: "Description must be at least 10 characters"
- Too long: "Description must not exceed 1000 characters"

**Zod Schema**:
```typescript
action: z.string()
  .min(10, "Action description must be at least 10 characters")
  .max(1000, "Action description must not exceed 1000 characters")
```

---

#### Target Date (VR-CA-002)
**Field**: `targetDate`
**Type**: DateTime
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Business Rule**: Must be in the future (unless editing completed action)
- **Business Rule**: Must be within reasonable timeframe based on violation type
  - Critical: Within 24 hours
  - Major: Within 3 days
  - Minor: Within 7 days
  - Observation: Within 14 days

**Error Messages**:
- Empty: "Target date is required"
- Past date: "Target date must be in the future"
- Too far: "Target date exceeds recommended timeframe for {violationType} violations"

**Zod Schema**:
```typescript
targetDate: z.date()
  .refine(date => date > new Date(), {
    message: "Target date must be in the future"
  })
```

**Business Logic Validation**:
```typescript
function validateTargetDate(
  targetDate: Date,
  violationType: ViolationType
): { valid: boolean; warning?: string } {
  const now = new Date()
  const daysDiff = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

  const maxDays = {
    critical: 1,
    major: 3,
    minor: 7,
    observation: 14
  }

  if (daysDiff > maxDays[violationType]) {
    return {
      valid: true,
      warning: `Target date exceeds recommended ${maxDays[violationType]} day(s) for ${violationType} violations`
    }
  }

  return { valid: true }
}
```

---

#### Evidence URL (VR-CA-003)
**Field**: `evidenceUrl`
**Type**: String
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Only if evidenceRequired is true
- **Max Length**: 500 characters
- **Pattern**: Must be valid URL or file path

**Error Messages**:
- Missing: "Evidence is required for this action"
- Too long: "Evidence URL must not exceed 500 characters"
- Invalid: "Invalid evidence URL format"

**Zod Schema**:
```typescript
evidenceUrl: z.string()
  .max(500, "Evidence URL must not exceed 500 characters")
  .url("Invalid URL format")
  .optional()
  .refine((val, ctx) => {
    if (ctx.parent.evidenceRequired && !val) {
      return false
    }
    return true
  }, { message: 'Evidence is required for this action' })
```

---

## 6. Rule Audit Validation

### 6.1 Audit Trail Fields

#### Audit Reason (VR-RA-001)
**Field**: `reason`
**Type**: String
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes
- **Min Length**: 10 characters
- **Max Length**: 500 characters

**Error Messages**:
- Empty: "Reason for change is required"
- Too short: "Reason must be at least 10 characters"
- Too long: "Reason must not exceed 500 characters"

**Zod Schema**:
```typescript
reason: z.string()
  .min(10, "Reason must be at least 10 characters")
  .max(500, "Reason must not exceed 500 characters")
```

---

#### Business Justification (VR-RA-002)
**Field**: `businessJustification`
**Type**: String
**Layer**: Client + Server

**Validation Rules**:
- **Required**: Yes (for high-impact changes)
- **Min Length**: 20 characters
- **Max Length**: 1000 characters

**Error Messages**:
- Empty: "Business justification is required for high-impact changes"
- Too short: "Business justification must be at least 20 characters"
- Too long: "Business justification must not exceed 1000 characters"

**Zod Schema**:
```typescript
businessJustification: z.string()
  .min(20, "Business justification must be at least 20 characters")
  .max(1000, "Business justification must not exceed 1000 characters")
  .optional()
  .refine((val, ctx) => {
    // High-impact actions require justification
    const highImpactActions = ['activated', 'deactivated', 'deleted']
    if (highImpactActions.includes(ctx.parent.action) && !val) {
      return false
    }
    return true
  }, { message: 'Business justification is required for high-impact changes' })
```

---

## 7. Performance and Metrics Validation

### 7.1 Rule Performance Validation

#### Success Rate (VR-RP-001)
**Field**: `successRate`
**Type**: Decimal
**Layer**: Client + Server + Database

**Validation Rules**:
- **Required**: Yes
- **Min Value**: 0
- **Max Value**: 100
- **Decimal Places**: 2

**Error Messages**:
- Out of range: "Success rate must be between 0 and 100"
- Invalid precision: "Success rate must have at most 2 decimal places"

**Database Constraint**:
```sql
ALTER TABLE tb_business_rule
ADD CONSTRAINT chk_success_rate_range
CHECK (success_rate BETWEEN 0 AND 100);
```

---

#### Trigger Count (VR-RP-002)
**Field**: `triggerCount`
**Type**: Integer
**Layer**: Server + Database

**Validation Rules**:
- **Required**: Yes
- **Min Value**: 0
- **Type**: Must be non-negative integer

**Database Constraint**:
```sql
ALTER TABLE tb_business_rule
ADD CONSTRAINT chk_trigger_count_positive
CHECK (trigger_count >= 0);
```

---

## 8. Cross-Field Validation Rules

### 8.1 Timestamp Validation

#### Violation Timestamps (VR-TS-001)
**Fields**: `detectedAt`, `acknowledgedAt`, `resolvedAt`, `verifiedAt`
**Layer**: Server + Database

**Validation Rules**:
- `acknowledgedAt` must be >= `detectedAt` (if present)
- `resolvedAt` must be >= `acknowledgedAt` (if present)
- `verifiedAt` must be >= `resolvedAt` (if present)

**Database Constraint**:
```sql
ALTER TABLE tb_compliance_violation
ADD CONSTRAINT chk_violation_timestamps_sequential
CHECK (
  (acknowledged_at IS NULL OR acknowledged_at >= detected_at) AND
  (resolved_at IS NULL OR resolved_at >= COALESCE(acknowledged_at, detected_at)) AND
  (verified_at IS NULL OR verified_at >= COALESCE(resolved_at, acknowledged_at, detected_at))
);
```

---

#### Corrective Action Timestamps (VR-TS-002)
**Fields**: `createdAt`, `startedAt`, `completedAt`, `verifiedAt`
**Layer**: Server + Database

**Validation Rules**:
- `startedAt` must be >= `createdAt` (if present)
- `completedAt` must be >= `startedAt` (if present)
- `verifiedAt` must be >= `completedAt` (if present)

**Database Constraint**:
```sql
ALTER TABLE tb_corrective_action
ADD CONSTRAINT chk_action_timestamps_sequential
CHECK (
  (started_at IS NULL OR started_at >= created_at) AND
  (completed_at IS NULL OR completed_at >= COALESCE(started_at, created_at)) AND
  (verified_at IS NULL OR verified_at >= COALESCE(completed_at, started_at, created_at))
);
```

---

### 8.2 Soft Delete Validation

#### Soft Delete Consistency (VR-SD-001)
**Fields**: `deletedAt`, `deletedById`
**Layer**: Server + Database

**Validation Rule**: Both fields must be null OR both must be set

**Database Constraint**:
```sql
ALTER TABLE tb_business_rule
ADD CONSTRAINT chk_soft_delete_consistency
CHECK (
  (deleted_at IS NULL AND deleted_by_id IS NULL) OR
  (deleted_at IS NOT NULL AND deleted_by_id IS NOT NULL)
);
```

---

## 9. Validation Implementation Examples

### 9.1 Complete Rule Validation Schema

```typescript
import { z } from 'zod'

// Base schemas
const conditionSchema = z.object({
  id: z.string().uuid(),
  field: z.string().min(1).max(100).regex(/^[a-zA-Z][a-zA-Z0-9_.]*$/),
  operator: z.enum(['equals', 'contains', 'greaterThan', 'lessThan', 'between', 'in', 'not_equals']),
  value: z.any(),
  logicalOperator: z.enum(['AND', 'OR']).nullable().optional()
})

const actionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([/* action types */]),
  parameters: z.record(z.any())
    .refine(params => Object.keys(params).length > 0)
})

const qualityStandardSchema = z.object({
  standardName: z.string().min(1).max(100),
  measurementType: z.enum(['time', 'temperature', 'appearance', 'weight', 'size', 'freshness']),
  minimumValue: z.number().optional(),
  maximumValue: z.number().optional(),
  unit: z.string().min(1).max(50),
  toleranceLevel: z.number().positive().max(100),
  criticalControl: z.boolean(),
  monitoringFrequency: z.enum(['continuous', 'hourly', 'shift', 'daily'])
}).refine(data => {
  if (data.minimumValue !== undefined && data.maximumValue !== undefined) {
    return data.maximumValue > data.minimumValue
  }
  return true
})

// Main business rule schema
export const businessRuleSchema = z.object({
  name: z.string()
    .min(3)
    .max(100)
    .regex(/^[a-zA-Z0-9\s\-_]+$/)
    .transform(val => val.trim()),

  description: z.string()
    .min(10)
    .max(500)
    .transform(val => val.trim()),

  category: z.enum([/* categories */]),

  priority: z.number()
    .int()
    .min(1)
    .max(10),

  isActive: z.boolean(),

  conditions: z.array(conditionSchema)
    .min(1)
    .max(50),

  actions: z.array(actionSchema)
    .min(1)
    .max(20),

  // Optional fractional sales fields
  fractionalType: z.enum(['pizza-slice', 'cake-slice', 'bottle-glass', 'portion-control', 'custom']).optional(),
  foodSafetyLevel: z.enum(['high', 'medium', 'low']).optional(),
  qualityStandards: z.array(qualityStandardSchema).max(20).optional(),

  // Optional food safety fields
  hazardType: z.enum(['biological', 'chemical', 'physical', 'cross-contamination']).optional(),
  riskLevel: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  haccpPoint: z.string().min(1).max(100).optional()
})
.refine(data => {
  // Fractional sales category requires specific fields
  if (data.category === 'fractional-sales') {
    return data.fractionalType && data.foodSafetyLevel
  }
  return true
}, { message: 'Fractional sales rules require fractional type and food safety level' })
.refine(data => {
  // Food safety category requires specific fields
  if (data.category === 'food-safety') {
    return data.hazardType && data.riskLevel && data.haccpPoint
  }
  return true
}, { message: 'Food safety rules require hazard type, risk level, and HACCP point' })
.refine(data => {
  // High safety level requires critical control point
  if (data.foodSafetyLevel === 'high') {
    return data.qualityStandards?.some(s => s.criticalControl) ?? false
  }
  return true
}, { message: 'High food safety level requires at least one critical control point' })
```

---

### 9.2 Server-Side Validation Example

```typescript
import { businessRuleSchema } from './validation-schemas'

export async function validateBusinessRule(
  data: unknown
): Promise<{ success: boolean; data?: BusinessRule; errors?: string[] }> {
  try {
    // Zod validation
    const validated = businessRuleSchema.parse(data)

    // Additional business logic validation
    const businessErrors: string[] = []

    // Check priority uniqueness
    const priorityUnique = await validateUniquePriority(
      validated.category,
      validated.priority,
      validated.id
    )
    if (!priorityUnique) {
      businessErrors.push(`Another active rule in ${validated.category} category already has priority ${validated.priority}`)
    }

    // Check active rule limit
    if (validated.isActive) {
      const activeCount = await getActiveRuleCount()
      if (activeCount >= 1000) {
        businessErrors.push("Maximum number of active rules (1000) reached")
      }
    }

    // Validate condition values
    for (const condition of validated.conditions) {
      const valueValidation = validateConditionValue(
        condition.operator,
        condition.value,
        condition.field
      )
      if (!valueValidation.valid) {
        businessErrors.push(valueValidation.error!)
      }
    }

    // Validate action parameters
    for (const action of validated.actions) {
      const paramValidation = validateActionParameters(action.type, action.parameters)
      if (!paramValidation.valid) {
        businessErrors.push(paramValidation.error!)
      }
    }

    if (businessErrors.length > 0) {
      return { success: false, errors: businessErrors }
    }

    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }
    }
    throw error
  }
}
```

---

**Document Control**:
- **Created**: 2025-01-16
- **Version**: 1.0
- **Status**: Complete
- **Total Validation Rules**: 30+ comprehensive validation rules
- **Coverage**: Client + Server + Database layers
