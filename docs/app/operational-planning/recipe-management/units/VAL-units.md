# Recipe Units - Validation Rules (VAL)

## Document Information
- **Document Type**: Validation Rules Document
- **Module**: Operational Planning > Recipe Management > Units
- **Version**: 1.0.0
- **Last Updated**: 2025-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Development Team | Initial documentation based on actual implementation |

---

## 1. Overview

This document defines all validation rules for the Recipe Units submodule, including client-side validation, server-side validation, and Zod schemas.

---

## 2. Zod Validation Schemas

### 2.1 Rounding Method Schema

```typescript
import { z } from 'zod';

const roundingMethodSchema = z.enum(['round', 'floor', 'ceil'], {
  errorMap: () => ({
    message: 'Rounding method must be one of: round, floor, ceil'
  })
});

type RoundingMethod = z.infer<typeof roundingMethodSchema>;
```

### 2.2 Recipe Unit Create Schema

```typescript
const recipeUnitCreateSchema = z.object({
  code: z
    .string()
    .min(1, 'Unit code is required')
    .max(20, 'Unit code cannot exceed 20 characters')
    .regex(
      /^[a-z0-9_]+$/,
      'Unit code can only contain lowercase letters, numbers, and underscores'
    ),

  name: z
    .string()
    .min(1, 'Unit name is required')
    .max(100, 'Unit name cannot exceed 100 characters'),

  pluralName: z
    .string()
    .max(100, 'Plural name cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),

  displayOrder: z
    .number()
    .int('Display order must be a whole number')
    .min(0, 'Display order cannot be negative')
    .default(0),

  showInDropdown: z.boolean().default(true),

  decimalPlaces: z
    .number()
    .int('Decimal places must be a whole number')
    .min(0, 'Decimal places cannot be negative')
    .max(6, 'Decimal places cannot exceed 6')
    .default(2),

  roundingMethod: roundingMethodSchema.default('round'),

  isActive: z.boolean().default(true),

  example: z
    .string()
    .max(200, 'Example cannot exceed 200 characters')
    .optional()
    .or(z.literal('')),

  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .or(z.literal(''))
});

type RecipeUnitCreateInput = z.infer<typeof recipeUnitCreateSchema>;
```

### 2.3 Recipe Unit Update Schema

```typescript
const recipeUnitUpdateSchema = recipeUnitCreateSchema.partial().extend({
  id: z.string().uuid('Invalid unit ID')
});

type RecipeUnitUpdateInput = z.infer<typeof recipeUnitUpdateSchema>;
```

### 2.4 Recipe Unit Form Schema (Client-side)

```typescript
const recipeUnitFormSchema = z.object({
  code: z
    .string()
    .min(1, 'Unit code is required')
    .max(20, 'Code too long'),

  name: z
    .string()
    .min(1, 'Unit name is required')
    .max(100, 'Name too long'),

  pluralName: z.string().max(100).optional(),

  displayOrder: z.number().int().min(0),

  showInDropdown: z.boolean(),

  decimalPlaces: z.number().int().min(0).max(6),

  roundingMethod: roundingMethodSchema,

  isActive: z.boolean(),

  isSystemUnit: z.boolean(),

  example: z.string().max(200).optional(),

  notes: z.string().max(500).optional()
});
```

### 2.5 Unit Conversion Schema

```typescript
const unitConversionSchema = z.object({
  fromUnitId: z.string().uuid('Invalid source unit ID'),

  fromUnitCode: z
    .string()
    .min(1, 'Source unit code is required'),

  toUnitId: z.string().uuid('Invalid target unit ID'),

  toUnitCode: z
    .string()
    .min(1, 'Target unit code is required'),

  conversionFactor: z
    .number()
    .positive('Conversion factor must be positive')
    .finite('Conversion factor must be a finite number'),

  productId: z.string().uuid().optional(),

  categoryId: z.string().uuid().optional(),

  isApproximate: z.boolean().default(false),

  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),

  isActive: z.boolean().default(true)
}).refine(
  (data) => data.fromUnitId !== data.toUnitId,
  {
    message: 'Source and target units must be different',
    path: ['toUnitId']
  }
);

type UnitConversionInput = z.infer<typeof unitConversionSchema>;
```

---

## 3. Field Validation Rules

### 3.1 Unit Code

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | Yes | Unit code is required |
| Min Length | 1 | Unit code is required |
| Max Length | 20 | Unit code cannot exceed 20 characters |
| Pattern | `^[a-z0-9_]+$` | Unit code can only contain lowercase letters, numbers, and underscores |
| Unique | Yes | Unit code already exists |

### 3.2 Unit Name

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | Yes | Unit name is required |
| Min Length | 1 | Unit name is required |
| Max Length | 100 | Unit name cannot exceed 100 characters |

### 3.3 Plural Name

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | No | - |
| Max Length | 100 | Plural name cannot exceed 100 characters |

### 3.4 Display Order

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | Yes | - |
| Type | Integer | Display order must be a whole number |
| Min | 0 | Display order cannot be negative |
| Default | 0 | - |

### 3.5 Decimal Places

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | Yes | - |
| Type | Integer | Decimal places must be a whole number |
| Min | 0 | Decimal places cannot be negative |
| Max | 6 | Decimal places cannot exceed 6 |
| Default | 2 | - |

### 3.6 Rounding Method

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | Yes | Rounding method is required |
| Enum | round, floor, ceil | Rounding method must be one of: round, floor, ceil |
| Default | round | - |

### 3.7 Boolean Fields

| Field | Required | Default |
|-------|----------|---------|
| showInDropdown | Yes | true |
| isActive | Yes | true |
| isSystemUnit | Yes | false (forced for user-created) |

### 3.8 Example

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | No | - |
| Max Length | 200 | Example cannot exceed 200 characters |

### 3.9 Notes

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | No | - |
| Max Length | 500 | Notes cannot exceed 500 characters |

---

## 4. System Unit Validation

### 4.1 System Unit Protection Rules

```typescript
/**
 * Validate that system units cannot be modified or deleted
 */
function validateSystemUnitProtection(
  action: 'update' | 'delete',
  unit: RecipeUnit
): { valid: boolean; error?: string } {
  if (unit.isSystemUnit) {
    if (action === 'update') {
      return {
        valid: false,
        error: 'System units cannot be modified'
      }
    }
    if (action === 'delete') {
      return {
        valid: false,
        error: 'System units cannot be deleted'
      }
    }
  }
  return { valid: true }
}
```

### 4.2 System Unit Flag Protection

```typescript
/**
 * Ensure user cannot set isSystemUnit = true
 */
function sanitizeUnitInput(input: RecipeUnitCreateInput): RecipeUnitCreateInput {
  return {
    ...input,
    isSystemUnit: false  // Always false for user-created units
  }
}
```

---

## 5. Server-Side Validation

### 5.1 Uniqueness Validation

```typescript
async function validateCodeUniqueness(
  code: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await db.recipeUnits.findFirst({
    where: {
      code: code.toLowerCase(),
      ...(excludeId && { id: { not: excludeId } })
    }
  })
  return !existing
}
```

### 5.2 Reference Validation (for Delete)

```typescript
async function validateDeleteUnit(id: string): Promise<{
  canDelete: boolean
  message?: string
  affectedRecipes?: number
}> {
  // Check if system unit
  const unit = await db.recipeUnits.findUnique({ where: { id } })
  if (unit?.isSystemUnit) {
    return {
      canDelete: false,
      message: 'System units cannot be deleted'
    }
  }

  // Check recipe ingredient references
  const ingredientCount = await db.recipeIngredients.count({
    where: { unitId: id }
  })

  // Check recipe yield references
  const yieldCount = await db.recipeYields.count({
    where: { unitId: id }
  })

  const totalReferences = ingredientCount + yieldCount

  if (totalReferences > 0) {
    return {
      canDelete: true,  // Can delete with warning
      message: `This unit is used in ${totalReferences} recipe(s). Deleting may affect recipe calculations.`,
      affectedRecipes: totalReferences
    }
  }

  return { canDelete: true }
}
```

---

## 6. Unit Conversion Validation

### 6.1 Conversion Factor Validation

```typescript
const conversionFactorSchema = z
  .number()
  .positive('Conversion factor must be positive')
  .finite('Conversion factor must be a finite number')
  .refine(
    (val) => val > 0 && val < Number.MAX_SAFE_INTEGER,
    'Conversion factor is out of valid range'
  )
```

### 6.2 Circular Conversion Detection

```typescript
async function validateNoCircularConversion(
  fromUnitId: string,
  toUnitId: string
): Promise<boolean> {
  // Check if conversion already exists in reverse
  const existingReverse = await db.unitConversions.findFirst({
    where: {
      fromUnitId: toUnitId,
      toUnitId: fromUnitId,
      isActive: true
    }
  })

  // Reverse exists is OK - allows bidirectional conversion
  // But direct A -> B and B -> A should use inverse factor

  return true
}
```

---

## 7. Validation Error Handling

### 7.1 Error Response Format

```typescript
interface ValidationError {
  field: string
  message: string
  code?: string
}

interface ValidationResult {
  success: boolean
  errors?: ValidationError[]
  data?: RecipeUnit
}
```

### 7.2 Client-Side Error Display

```typescript
// Form validation with react-hook-form and zod
const form = useForm<RecipeUnitFormData>({
  resolver: zodResolver(recipeUnitFormSchema),
  defaultValues: initialFormData
})

// Error display
{form.formState.errors.code && (
  <span className="text-sm text-destructive">
    {form.formState.errors.code.message}
  </span>
)}
```

### 7.3 Server Error Toast

```typescript
// Display server validation errors
function handleServerError(error: ValidationError[]) {
  error.forEach(err => {
    toast({
      title: 'Validation Error',
      description: err.message,
      variant: 'destructive'
    })
  })
}

// Display system unit protection error
function handleSystemUnitError() {
  toast({
    title: 'Protected Unit',
    description: 'System units cannot be modified or deleted',
    variant: 'destructive'
  })
}
```

---

## 8. Validation Summary Table

| Field | Required | Type | Constraints |
|-------|----------|------|-------------|
| code | Yes | string | 1-20 chars, lowercase alphanumeric with underscores, unique |
| name | Yes | string | 1-100 chars |
| pluralName | No | string | Max 100 chars |
| displayOrder | Yes | integer | Min 0, default 0 |
| showInDropdown | Yes | boolean | Default true |
| decimalPlaces | Yes | integer | 0-6, default 2 |
| roundingMethod | Yes | enum | round/floor/ceil, default round |
| isActive | Yes | boolean | Default true |
| isSystemUnit | Yes | boolean | Always false for user-created |
| example | No | string | Max 200 chars |
| notes | No | string | Max 500 chars |

---

## 9. Cross-Field Validation

### 9.1 Plural Name Default

```typescript
// If plural name not provided, can default to name
.refine(
  (data) => {
    // No cross-field validation needed for plural
    // System handles missing plural gracefully
    return true
  }
)
```

### 9.2 Display Order Uniqueness (Soft)

```typescript
// Display order doesn't need to be unique
// Multiple units can share same display order
// Secondary sort by name handles ties
```

---

## 10. Client-Side Validation Examples

### 10.1 Code Validation

```typescript
// Real-time code validation
const validateCode = (code: string): string | null => {
  if (!code) return 'Unit code is required'
  if (code.length > 20) return 'Code too long'
  if (!/^[a-z0-9_]+$/.test(code)) {
    return 'Use lowercase letters, numbers, and underscores only'
  }
  return null
}
```

### 10.2 Decimal Places Validation

```typescript
// Decimal places input handler
const handleDecimalPlacesChange = (value: string) => {
  const num = parseInt(value) || 0
  const clamped = Math.max(0, Math.min(6, num))
  setFormData({ ...formData, decimalPlaces: clamped })
}
```

---

## Related Documents

- [BR-units.md](./BR-units.md) - Business Rules
- [UC-units.md](./UC-units.md) - Use Cases
- [DD-units.md](./DD-units.md) - Data Dictionary
- [FD-units.md](./FD-units.md) - Flow Diagrams
- [TS-units.md](./TS-units.md) - Technical Specifications
