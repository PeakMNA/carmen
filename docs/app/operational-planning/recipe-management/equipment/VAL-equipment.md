# Recipe Equipment - Validation Rules (VAL)

## Document Information
- **Document Type**: Validation Rules Document
- **Module**: Operational Planning > Recipe Management > Equipment
- **Version**: 1.0.0
- **Last Updated**: 2025-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Development Team | Initial documentation based on actual implementation |

---

## 1. Overview

This document defines all validation rules for the Equipment Management submodule, including client-side validation, server-side validation, and Zod schemas.

---

## 2. Zod Validation Schemas

### 2.1 Equipment Status Schema

```typescript
import { z } from 'zod';

const equipmentStatusSchema = z.enum(
  ['active', 'inactive', 'maintenance', 'retired'],
  {
    errorMap: () => ({
      message: 'Status must be one of: active, inactive, maintenance, retired'
    })
  }
);

type EquipmentStatus = z.infer<typeof equipmentStatusSchema>;
```

### 2.2 Equipment Category Schema

```typescript
const equipmentCategorySchema = z.enum(
  [
    'cooking',
    'preparation',
    'refrigeration',
    'storage',
    'serving',
    'cleaning',
    'small_appliance',
    'utensil',
    'other'
  ],
  {
    errorMap: () => ({
      message: 'Category must be a valid equipment category'
    })
  }
);

type EquipmentCategory = z.infer<typeof equipmentCategorySchema>;
```

### 2.3 Dimension Unit Schema

```typescript
const dimensionUnitSchema = z.enum(['cm', 'inch'], {
  errorMap: () => ({
    message: 'Dimension unit must be cm or inch'
  })
});
```

### 2.4 Dimensions Schema

```typescript
const dimensionsSchema = z.object({
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  depth: z.number().positive('Depth must be positive'),
  unit: dimensionUnitSchema
}).optional();
```

### 2.5 Equipment Create Schema

```typescript
const equipmentCreateSchema = z.object({
  code: z
    .string()
    .min(1, 'Equipment code is required')
    .max(50, 'Equipment code cannot exceed 50 characters')
    .regex(
      /^[A-Z0-9-]+$/,
      'Equipment code can only contain uppercase letters, numbers, and hyphens'
    ),

  name: z
    .string()
    .min(1, 'Equipment name is required')
    .max(200, 'Equipment name cannot exceed 200 characters'),

  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),

  category: equipmentCategorySchema,

  brand: z
    .string()
    .max(100, 'Brand cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),

  model: z
    .string()
    .max(100, 'Model cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),

  serialNumber: z
    .string()
    .max(100, 'Serial number cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),

  capacity: z
    .string()
    .max(100, 'Capacity cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),

  powerRating: z
    .string()
    .max(50, 'Power rating cannot exceed 50 characters')
    .optional()
    .or(z.literal('')),

  dimensions: dimensionsSchema,

  locationId: z.string().uuid().optional(),

  station: z
    .string()
    .max(100, 'Station cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),

  operatingInstructions: z
    .string()
    .max(5000, 'Operating instructions cannot exceed 5000 characters')
    .optional()
    .or(z.literal('')),

  safetyNotes: z
    .string()
    .max(2000, 'Safety notes cannot exceed 2000 characters')
    .optional()
    .or(z.literal('')),

  cleaningInstructions: z
    .string()
    .max(2000, 'Cleaning instructions cannot exceed 2000 characters')
    .optional()
    .or(z.literal('')),

  maintenanceSchedule: z
    .string()
    .max(100, 'Maintenance schedule cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),

  lastMaintenanceDate: z.coerce.date().optional(),

  nextMaintenanceDate: z.coerce.date().optional(),

  status: equipmentStatusSchema.default('active'),

  isPortable: z.boolean().default(false),

  availableQuantity: z
    .number()
    .int('Available quantity must be a whole number')
    .min(0, 'Available quantity cannot be negative')
    .default(1),

  totalQuantity: z
    .number()
    .int('Total quantity must be a whole number')
    .min(1, 'Total quantity must be at least 1')
    .default(1),

  usageCount: z
    .number()
    .int('Usage count must be a whole number')
    .min(0, 'Usage count cannot be negative')
    .optional(),

  averageUsageTime: z
    .number()
    .min(0, 'Average usage time cannot be negative')
    .optional(),

  image: z
    .string()
    .url('Image must be a valid URL')
    .max(500, 'Image URL cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),

  manualUrl: z
    .string()
    .url('Manual URL must be a valid URL')
    .max(500, 'Manual URL cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),

  displayOrder: z
    .number()
    .int('Display order must be a whole number')
    .min(0, 'Display order cannot be negative')
    .default(0),

  isActive: z.boolean().default(true)
}).refine(
  (data) => data.availableQuantity <= data.totalQuantity,
  {
    message: 'Available quantity cannot exceed total quantity',
    path: ['availableQuantity']
  }
);

type EquipmentCreateInput = z.infer<typeof equipmentCreateSchema>;
```

### 2.6 Equipment Update Schema

```typescript
const equipmentUpdateSchema = equipmentCreateSchema.partial().extend({
  id: z.string().uuid('Invalid equipment ID')
});

type EquipmentUpdateInput = z.infer<typeof equipmentUpdateSchema>;
```

### 2.7 Equipment Form Schema (Client-side)

```typescript
const equipmentFormSchema = z.object({
  code: z
    .string()
    .min(1, 'Equipment code is required')
    .max(50, 'Code too long'),

  name: z
    .string()
    .min(1, 'Equipment name is required')
    .max(200, 'Name too long'),

  description: z.string().max(1000).optional(),

  category: equipmentCategorySchema,

  brand: z.string().max(100).optional(),

  model: z.string().max(100).optional(),

  capacity: z.string().max(100).optional(),

  powerRating: z.string().max(50).optional(),

  station: z.string().max(100).optional(),

  status: equipmentStatusSchema,

  isPortable: z.boolean(),

  availableQuantity: z.number().int().min(0),

  totalQuantity: z.number().int().min(1),

  maintenanceSchedule: z.string().max(100).optional(),

  isActive: z.boolean()
}).refine(
  (data) => data.availableQuantity <= data.totalQuantity,
  {
    message: 'Available quantity cannot exceed total quantity',
    path: ['availableQuantity']
  }
);
```

---

## 3. Field Validation Rules

### 3.1 Equipment Code

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | Yes | Equipment code is required |
| Min Length | 1 | Equipment code is required |
| Max Length | 50 | Equipment code cannot exceed 50 characters |
| Pattern | `^[A-Z0-9-]+$` | Equipment code can only contain uppercase letters, numbers, and hyphens |
| Unique | Yes | Equipment code already exists |

### 3.2 Equipment Name

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | Yes | Equipment name is required |
| Min Length | 1 | Equipment name is required |
| Max Length | 200 | Equipment name cannot exceed 200 characters |

### 3.3 Description

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | No | - |
| Max Length | 1000 | Description cannot exceed 1000 characters |

### 3.4 Category

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | Yes | Category is required |
| Enum | cooking, preparation, refrigeration, storage, serving, cleaning, small_appliance, utensil, other | Category must be a valid equipment category |

### 3.5 Status

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | Yes | Status is required |
| Enum | active, inactive, maintenance, retired | Status must be one of: active, inactive, maintenance, retired |
| Default | active | - |

### 3.6 Quantities

| Field | Rule | Value | Error Message |
|-------|------|-------|---------------|
| totalQuantity | Required | Yes | Total quantity is required |
| totalQuantity | Min | 1 | Total quantity must be at least 1 |
| totalQuantity | Integer | Yes | Total quantity must be a whole number |
| availableQuantity | Required | Yes | Available quantity is required |
| availableQuantity | Min | 0 | Available quantity cannot be negative |
| availableQuantity | Integer | Yes | Available quantity must be a whole number |
| availableQuantity | Max | totalQuantity | Available quantity cannot exceed total quantity |

### 3.7 Optional String Fields

| Field | Max Length | Error Message |
|-------|------------|---------------|
| brand | 100 | Brand cannot exceed 100 characters |
| model | 100 | Model cannot exceed 100 characters |
| serialNumber | 100 | Serial number cannot exceed 100 characters |
| capacity | 100 | Capacity cannot exceed 100 characters |
| powerRating | 50 | Power rating cannot exceed 50 characters |
| station | 100 | Station cannot exceed 100 characters |
| maintenanceSchedule | 100 | Maintenance schedule cannot exceed 100 characters |
| image | 500 | Image URL cannot exceed 500 characters |
| manualUrl | 500 | Manual URL cannot exceed 500 characters |

### 3.8 URL Fields

| Field | Rule | Error Message |
|-------|------|---------------|
| image | Valid URL | Image must be a valid URL |
| manualUrl | Valid URL | Manual URL must be a valid URL |

### 3.9 Boolean Fields

| Field | Required | Default |
|-------|----------|---------|
| isPortable | Yes | false |
| isActive | Yes | true |

---

## 4. Cross-Field Validation

### 4.1 Quantity Validation

```typescript
// Available quantity cannot exceed total quantity
.refine(
  (data) => data.availableQuantity <= data.totalQuantity,
  {
    message: 'Available quantity cannot exceed total quantity',
    path: ['availableQuantity']
  }
)
```

### 4.2 Maintenance Date Validation

```typescript
// Next maintenance date should be after last maintenance date
.refine(
  (data) => {
    if (data.lastMaintenanceDate && data.nextMaintenanceDate) {
      return data.nextMaintenanceDate > data.lastMaintenanceDate;
    }
    return true;
  },
  {
    message: 'Next maintenance date must be after last maintenance date',
    path: ['nextMaintenanceDate']
  }
)
```

### 4.3 Status-Based Validation

```typescript
// Maintenance status should have next maintenance date
.refine(
  (data) => {
    if (data.status === 'maintenance') {
      return !!data.nextMaintenanceDate || !!data.maintenanceSchedule;
    }
    return true;
  },
  {
    message: 'Equipment in maintenance should have a maintenance schedule or next date',
    path: ['status']
  }
)
```

---

## 5. Server-Side Validation

### 5.1 Uniqueness Validation

```typescript
async function validateCodeUniqueness(
  code: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await db.equipment.findFirst({
    where: {
      code: code,
      ...(excludeId && { id: { not: excludeId } })
    }
  });
  return !existing;
}
```

### 5.2 Reference Validation (for Delete)

```typescript
async function validateDeleteEquipment(id: string): Promise<{
  canDelete: boolean;
  message?: string;
  activeRecipes?: string[];
}> {
  const recipeReferences = await db.recipeEquipment.findMany({
    where: {
      equipmentId: id,
      recipe: { status: 'published' }
    },
    include: { recipe: { select: { name: true } } }
  });

  if (recipeReferences.length > 0) {
    return {
      canDelete: false,
      message: 'Equipment is used in active recipes',
      activeRecipes: recipeReferences.map(r => r.recipe.name)
    };
  }

  return { canDelete: true };
}
```

---

## 6. Validation Error Handling

### 6.1 Error Response Format

```typescript
interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

interface ValidationResult {
  success: boolean;
  errors?: ValidationError[];
  data?: Equipment;
}
```

### 6.2 Client-Side Error Display

```typescript
// Form validation with react-hook-form and zod
const form = useForm<EquipmentFormData>({
  resolver: zodResolver(equipmentFormSchema),
  defaultValues: initialFormData
});

// Error display
{form.formState.errors.code && (
  <span className="text-sm text-destructive">
    {form.formState.errors.code.message}
  </span>
)}
```

### 6.3 Server Error Toast

```typescript
// Display server validation errors
function handleServerError(error: ValidationError[]) {
  error.forEach(err => {
    toast({
      title: 'Validation Error',
      description: err.message,
      variant: 'destructive'
    });
  });
}
```

---

## 7. Validation Summary Table

| Field | Required | Type | Constraints |
|-------|----------|------|-------------|
| code | Yes | string | 1-50 chars, uppercase alphanumeric with hyphens, unique |
| name | Yes | string | 1-200 chars |
| description | No | string | Max 1000 chars |
| category | Yes | enum | 9 valid values |
| brand | No | string | Max 100 chars |
| model | No | string | Max 100 chars |
| serialNumber | No | string | Max 100 chars |
| capacity | No | string | Max 100 chars |
| powerRating | No | string | Max 50 chars |
| station | No | string | Max 100 chars |
| status | Yes | enum | 4 valid values, default 'active' |
| isPortable | Yes | boolean | Default false |
| availableQuantity | Yes | integer | Min 0, max totalQuantity |
| totalQuantity | Yes | integer | Min 1 |
| maintenanceSchedule | No | string | Max 100 chars |
| image | No | string | Valid URL, max 500 chars |
| manualUrl | No | string | Valid URL, max 500 chars |
| displayOrder | Yes | integer | Min 0, default 0 |
| isActive | Yes | boolean | Default true |

---

## Related Documents

- [BR-equipment.md](./BR-equipment.md) - Business Rules
- [UC-equipment.md](./UC-equipment.md) - Use Cases
- [DD-equipment.md](./DD-equipment.md) - Data Dictionary
- [FD-equipment.md](./FD-equipment.md) - Flow Diagrams
- [TS-equipment.md](./TS-equipment.md) - Technical Specifications
