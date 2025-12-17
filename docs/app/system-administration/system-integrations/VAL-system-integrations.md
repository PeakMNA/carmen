# System Integrations - Validation Rules (VAL)

**Module**: System Administration - System Integrations
**Version**: 1.0
**Last Updated**: 2025-01-16
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Implementation Status**: Planned (Mock Data Currently)

---

## 1. Overview

This document defines comprehensive validation rules for the System Integrations module, focusing on POS integration data integrity, business rule enforcement, and error prevention. All validation rules follow a three-layer approach: Client (Zod + React Hook Form), Server (Zod + business rules), Database (SQL constraints).

---

## 2. Recipe Mapping Validation

### VAL-SI-001: Recipe Mapping Creation Validation

**Rule**: All recipe mapping fields must meet format and business rule requirements.

**Validation Layers**:

**Client (Zod Schema)**:
```typescript
import { z } from "zod"

const recipeMappingSchema = z.object({
  posItemCode: z
    .string()
    .min(1, "POS item code is required")
    .max(50, "POS item code must not exceed 50 characters")
    .regex(/^[A-Z0-9\-]+$/, "POS item code must contain only uppercase letters, numbers, and hyphens"),

  posDescription: z
    .string()
    .min(1, "POS description is required")
    .max(255, "POS description must not exceed 255 characters"),

  recipeId: z
    .string()
    .uuid("Invalid recipe ID format"),

  posUnit: z
    .string()
    .min(1, "POS unit is required")
    .max(50, "POS unit must not exceed 50 characters"),

  recipeUnit: z
    .string()
    .min(1, "Recipe unit is required")
    .max(50, "Recipe unit must not exceed 50 characters"),

  conversionRate: z
    .number()
    .positive("Conversion rate must be greater than 0")
    .max(1000, "Conversion rate must not exceed 1000")
    .refine(
      (val) => {
        // Ensure maximum 8 decimal places
        return /^\d+(\.\d{1,8})?$/.test(val.toString())
      },
      "Conversion rate can have maximum 8 decimal places"
    ),

  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must not exceed 100 characters"),

  status: z.enum(['mapped', 'unmapped', 'error'], {
    errorMap: () => ({ message: "Invalid status value" }),
  }),
})

type RecipeMappingForm = z.infer<typeof recipeMappingSchema>
```

**Server (Business Rules)**:
```typescript
// app/(main)/system-administration/system-integrations/pos/mapping/recipes/actions.ts
"use server"

export async function createRecipeMapping(data: RecipeMappingForm) {
  // 1. Validate schema
  const validated = recipeMappingSchema.parse(data)

  // 2. Check for duplicate POS item code (excluding soft-deleted)
  const existing = await prisma.tb_pos_recipe_mapping.findFirst({
    where: {
      pos_item_code: validated.posItemCode,
      deleted_at: null,
    },
  })

  if (existing) {
    throw new Error("POS item code already exists in active mappings")
  }

  // 3. Verify recipe exists and is active
  const recipe = await prisma.tb_recipe.findUnique({
    where: { id: validated.recipeId },
  })

  if (!recipe || recipe.deleted_at !== null) {
    throw new Error("Selected recipe does not exist or is inactive")
  }

  // 4. Create mapping
  const mapping = await prisma.tb_pos_recipe_mapping.create({
    data: {
      pos_item_code: validated.posItemCode,
      pos_description: validated.posDescription,
      recipe_id: validated.recipeId,
      pos_unit: validated.posUnit,
      recipe_unit: validated.recipeUnit,
      conversion_rate: validated.conversionRate,
      category: validated.category,
      status: validated.status,
      created_by_id: getCurrentUserId(),
    },
  })

  // 5. Log creation in audit trail
  await logMappingHistory({
    mapping_id: mapping.id,
    mapping_type: "recipe",
    action: "created",
    changes: { new: mapping },
  })

  return { success: true, data: mapping }
}
```

**Database (SQL Constraints)**:
```sql
-- tb_pos_recipe_mapping table constraints
ALTER TABLE tb_pos_recipe_mapping
ADD CONSTRAINT tb_pos_recipe_mapping_pos_code_length CHECK (LENGTH(pos_item_code) BETWEEN 1 AND 50);

ALTER TABLE tb_pos_recipe_mapping
ADD CONSTRAINT tb_pos_recipe_mapping_conversion_rate_positive CHECK (conversion_rate > 0);

ALTER TABLE tb_pos_recipe_mapping
ADD CONSTRAINT tb_pos_recipe_mapping_conversion_rate_max CHECK (conversion_rate <= 1000);

ALTER TABLE tb_pos_recipe_mapping
ADD CONSTRAINT tb_pos_recipe_mapping_status_valid CHECK (status IN ('mapped', 'unmapped', 'error'));

-- Unique constraint for active mappings
CREATE UNIQUE INDEX idx_pos_recipe_mapping_unique_code
ON tb_pos_recipe_mapping(pos_item_code)
WHERE deleted_at IS NULL;
```

**Error Messages**:
```typescript
const errorMessages = {
  "VAL-SI-001-01": "POS item code is required",
  "VAL-SI-001-02": "POS item code must be 1-50 characters",
  "VAL-SI-001-03": "POS item code format is invalid (use A-Z, 0-9, hyphen only)",
  "VAL-SI-001-04": "POS description is required",
  "VAL-SI-001-05": "POS description must not exceed 255 characters",
  "VAL-SI-001-06": "Recipe must be selected",
  "VAL-SI-001-07": "Invalid recipe ID",
  "VAL-SI-001-08": "Selected recipe does not exist",
  "VAL-SI-001-09": "Conversion rate must be greater than 0",
  "VAL-SI-001-10": "Conversion rate cannot exceed 1000",
  "VAL-SI-001-11": "Conversion rate can have maximum 8 decimal places",
  "VAL-SI-001-12": "POS item code already exists",
  "VAL-SI-001-13": "Category is required",
  "VAL-SI-001-14": "Invalid status value",
}
```

---

### VAL-SI-002: Fractional Sales Mapping Validation

**Rule**: Fractional sales mappings must have valid conversion rates, variant configurations, and base recipe references.

**Validation Layers**:

**Client (Zod Schema)**:
```typescript
const fractionalSalesMappingSchema = recipeMappingSchema.extend({
  fractionalSalesType: z.enum([
    "pizza-slice",
    "cake-slice",
    "bottle-glass",
    "portion-control",
    "custom",
  ]),

  recipeVariantId: z
    .string()
    .uuid("Invalid recipe variant ID")
    .optional(),

  variantName: z
    .string()
    .min(1, "Variant name is required for fractional sales")
    .max(100, "Variant name must not exceed 100 characters")
    .optional(),

  baseRecipeId: z
    .string()
    .uuid("Invalid base recipe ID")
    .optional(),

  piecesPerUnit: z
    .number()
    .int("Pieces per unit must be a whole number")
    .min(2, "Pieces per unit must be at least 2")
    .max(100, "Pieces per unit cannot exceed 100"),
}).refine(
  (data) => {
    // If fractional sales type is set, variant fields must be set
    if (data.fractionalSalesType) {
      return data.variantName && data.baseRecipeId
    }
    return true
  },
  {
    message: "Variant name and base recipe are required for fractional sales",
    path: ['fractionalSalesType'],
  }
).refine(
  (data) => {
    // Conversion rate must be ≤ 1.0 for fractional sales
    if (data.fractionalSalesType && data.conversionRate > 1.0) {
      return false
    }
    return true
  },
  {
    message: "Fractional sales conversion rate must be ≤ 1.0",
    path: ['conversionRate'],
  }
)
```

**Server (Business Rules)**:
```typescript
export async function createFractionalSalesMapping(data: FractionalSalesMappingForm) {
  const validated = fractionalSalesMappingSchema.parse(data)

  // 1. Verify base recipe exists
  const baseRecipe = await prisma.tb_recipe.findUnique({
    where: { id: validated.baseRecipeId! },
  })

  if (!baseRecipe) {
    throw new Error("Base recipe not found")
  }

  // 2. Calculate conversion rate from pieces per unit
  const conversionRate = 1 / validated.piecesPerUnit

  // 3. Validate conversion rate is reasonable (0.01 to 1.0)
  if (conversionRate < 0.01 || conversionRate > 1.0) {
    throw new Error("Calculated conversion rate is out of acceptable range (0.01 - 1.0)")
  }

  // 4. Check for duplicate variant for same base recipe
  const existingVariant = await prisma.tb_pos_recipe_mapping.findFirst({
    where: {
      base_recipe_id: validated.baseRecipeId,
      variant_name: validated.variantName,
      deleted_at: null,
    },
  })

  if (existingVariant) {
    throw new Error(`Variant "${validated.variantName}" already exists for this recipe`)
  }

  // 5. Create mapping with fractional sales fields
  const mapping = await prisma.tb_pos_recipe_mapping.create({
    data: {
      ...validated,
      conversion_rate: conversionRate,
      recipe_id: validated.baseRecipeId!, // Use base recipe as primary reference
    },
  })

  return { success: true, data: mapping, conversionRate }
}
```

**Database (SQL Constraints)**:
```sql
-- Fractional sales specific constraints
ALTER TABLE tb_pos_recipe_mapping
ADD CONSTRAINT tb_pos_recipe_mapping_fractional_sales_type_valid
CHECK (
  fractional_sales_type IS NULL OR
  fractional_sales_type IN ('pizza-slice', 'cake-slice', 'bottle-glass', 'portion-control', 'custom')
);

-- If fractional sales type is set, base recipe and variant name must be set
ALTER TABLE tb_pos_recipe_mapping
ADD CONSTRAINT tb_pos_recipe_mapping_fractional_fields_required
CHECK (
  (fractional_sales_type IS NULL AND base_recipe_id IS NULL AND variant_name IS NULL) OR
  (fractional_sales_type IS NOT NULL AND base_recipe_id IS NOT NULL AND variant_name IS NOT NULL)
);

-- Conversion rate for fractional sales must be ≤ 1.0
ALTER TABLE tb_pos_recipe_mapping
ADD CONSTRAINT tb_pos_recipe_mapping_fractional_conversion_rate
CHECK (
  fractional_sales_type IS NULL OR conversion_rate <= 1.0
);

-- Unique variant names per base recipe
CREATE UNIQUE INDEX idx_pos_recipe_mapping_unique_variant
ON tb_pos_recipe_mapping(base_recipe_id, variant_name)
WHERE deleted_at IS NULL AND fractional_sales_type IS NOT NULL;
```

---

### VAL-SI-003: Recipe Mapping Update Validation

**Rule**: Updates to recipe mappings must preserve data integrity and respect usage constraints.

**Server (Business Rules)**:
```typescript
export async function updateRecipeMapping(
  id: string,
  data: Partial<RecipeMappingForm>
) {
  // 1. Verify mapping exists
  const existing = await prisma.tb_pos_recipe_mapping.findUnique({
    where: { id },
  })

  if (!existing || existing.deleted_at !== null) {
    throw new Error("Recipe mapping not found or has been deleted")
  }

  // 2. Check if mapping is used in recent transactions (last 7 days)
  const recentUsage = await prisma.tb_pos_transaction.count({
    where: {
      items: {
        path: ['$[*].recipeMapping.id'],
        array_contains: id,
      },
      created_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  })

  if (recentUsage > 0 && data.conversionRate !== existing.conversion_rate) {
    // Warn user but allow update
    console.warn(
      `Updating conversion rate for mapping used in ${recentUsage} recent transactions`
    )
  }

  // 3. If changing POS item code, verify new code doesn't exist
  if (data.posItemCode && data.posItemCode !== existing.pos_item_code) {
    const duplicate = await prisma.tb_pos_recipe_mapping.findFirst({
      where: {
        pos_item_code: data.posItemCode,
        deleted_at: null,
        id: { not: id },
      },
    })

    if (duplicate) {
      throw new Error("New POS item code already exists")
    }
  }

  // 4. Update mapping
  const updated = await prisma.tb_pos_recipe_mapping.update({
    where: { id },
    data: {
      ...data,
      updated_by_id: getCurrentUserId(),
      updated_at: new Date(),
    },
  })

  // 5. Log update in audit trail
  await logMappingHistory({
    mapping_id: id,
    mapping_type: "recipe",
    action: "updated",
    changes: {
      before: existing,
      after: updated,
    },
  })

  return { success: true, data: updated, recentUsage }
}
```

---

### VAL-SI-004: Recipe Mapping Deletion Validation

**Rule**: Recipe mappings can only be deleted if not actively used or must be soft-deleted with reason.

**Server (Business Rules)**:
```typescript
export async function deleteRecipeMapping(
  id: string,
  deleteType: "soft" | "hard",
  reason?: string
) {
  // 1. Verify mapping exists
  const mapping = await prisma.tb_pos_recipe_mapping.findUnique({
    where: { id },
    include: {
      transactions: {
        where: {
          created_at: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
          },
        },
      },
    },
  })

  if (!mapping) {
    throw new Error("Recipe mapping not found")
  }

  // 2. Check transaction usage
  const transactionCount = mapping.transactions.length

  if (transactionCount > 0) {
    if (deleteType === "hard") {
      throw new Error(
        `Cannot hard delete: mapping is used in ${transactionCount} transactions in the last 90 days. Use soft delete instead.`
      )
    }

    if (deleteType === "soft" && !reason) {
      throw new Error("Deletion reason is required when mapping has transaction history")
    }
  }

  // 3. Perform deletion
  if (deleteType === "soft") {
    const deleted = await prisma.tb_pos_recipe_mapping.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id: getCurrentUserId(),
      },
    })

    // Log soft delete
    await logMappingHistory({
      mapping_id: id,
      mapping_type: "recipe",
      action: "deleted",
      changes: {
        delete_type: "soft",
        reason,
        transaction_count: transactionCount,
      },
    })

    return { success: true, deleteType: "soft", data: deleted }
  } else {
    // Hard delete (only if no transactions)
    await prisma.tb_pos_recipe_mapping.delete({
      where: { id },
    })

    // Log hard delete
    await logMappingHistory({
      mapping_id: id,
      mapping_type: "recipe",
      action: "deleted",
      changes: {
        delete_type: "hard",
        deleted_data: mapping,
      },
    })

    return { success: true, deleteType: "hard" }
  }
}
```

---

## 3. Unit Mapping Validation

### VAL-SI-005: Unit Mapping Validation

**Rule**: Unit mappings must have valid unit codes, conversion rates, and unit types.

**Client (Zod Schema)**:
```typescript
const unitMappingSchema = z.object({
  unitCode: z
    .string()
    .min(1, "Unit code is required")
    .max(50, "Unit code must not exceed 50 characters")
    .regex(/^[A-Z]+$/, "Unit code must contain only uppercase letters"),

  unitName: z
    .string()
    .min(1, "Unit name is required")
    .max(100, "Unit name must not exceed 100 characters"),

  unitType: z.enum(['recipe', 'sales', 'both'], {
    errorMap: () => ({ message: "Invalid unit type" }),
  }),

  baseUnit: z
    .string()
    .min(1, "Base unit is required")
    .max(50, "Base unit must not exceed 50 characters"),

  conversionRate: z
    .number()
    .positive("Conversion rate must be greater than 0")
    .refine(
      (val) => /^\d+(\.\d{1,8})?$/.test(val.toString()),
      "Conversion rate can have maximum 8 decimal places"
    ),

  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: "Invalid status" }),
  }),
})
```

**Server (Business Rules)**:
```typescript
export async function createUnitMapping(data: UnitMappingForm) {
  const validated = unitMappingSchema.parse(data)

  // 1. Check for duplicate unit code
  const existing = await prisma.tb_pos_unit_mapping.findUnique({
    where: { unit_code: validated.unitCode },
  })

  if (existing && existing.deleted_at === null) {
    throw new Error("Unit code already exists")
  }

  // 2. Validate base unit exists
  const baseUnit = await prisma.tb_pos_unit_mapping.findFirst({
    where: {
      unit_code: validated.baseUnit,
      deleted_at: null,
    },
  })

  if (!baseUnit && validated.baseUnit !== "BASE") {
    throw new Error("Base unit does not exist")
  }

  // 3. Create unit mapping
  const mapping = await prisma.tb_pos_unit_mapping.create({
    data: {
      ...validated,
      created_by_id: getCurrentUserId(),
    },
  })

  return { success: true, data: mapping }
}
```

**Database (SQL Constraints)**:
```sql
ALTER TABLE tb_pos_unit_mapping
ADD CONSTRAINT tb_pos_unit_mapping_unit_code_format
CHECK (unit_code ~ '^[A-Z]+$');

ALTER TABLE tb_pos_unit_mapping
ADD CONSTRAINT tb_pos_unit_mapping_conversion_rate_positive
CHECK (conversion_rate > 0);

ALTER TABLE tb_pos_unit_mapping
ADD CONSTRAINT tb_pos_unit_mapping_unit_type_valid
CHECK (unit_type IN ('recipe', 'sales', 'both'));

ALTER TABLE tb_pos_unit_mapping
ADD CONSTRAINT tb_pos_unit_mapping_status_valid
CHECK (status IN ('active', 'inactive'));
```

---

## 4. Location Mapping Validation

### VAL-SI-006: Location Mapping Validation

**Rule**: Location mappings must reference valid POS and Carmen locations.

**Client (Zod Schema)**:
```typescript
const locationMappingSchema = z.object({
  posLocationId: z
    .string()
    .min(1, "POS location ID is required")
    .max(50, "POS location ID must not exceed 50 characters"),

  posLocationName: z
    .string()
    .min(1, "POS location name is required")
    .max(255, "POS location name must not exceed 255 characters"),

  posLocationCode: z
    .string()
    .max(50, "POS location code must not exceed 50 characters")
    .optional(),

  carmenLocationId: z
    .string()
    .uuid("Invalid Carmen location ID"),

  isActive: z.boolean().default(true),
  syncEnabled: z.boolean().default(true),
  notes: z.string().max(1000, "Notes must not exceed 1000 characters").optional(),
})
```

**Server (Business Rules)**:
```typescript
export async function createLocationMapping(data: LocationMappingForm) {
  const validated = locationMappingSchema.parse(data)

  // 1. Check for duplicate POS location ID
  const existing = await prisma.tb_pos_location_mapping.findFirst({
    where: {
      pos_location_id: validated.posLocationId,
      deleted_at: null,
    },
  })

  if (existing) {
    throw new Error("POS location ID is already mapped")
  }

  // 2. Verify Carmen location exists and is active
  const carmenLocation = await prisma.tb_location.findUnique({
    where: { id: validated.carmenLocationId },
  })

  if (!carmenLocation || carmenLocation.deleted_at !== null) {
    throw new Error("Carmen location does not exist or is inactive")
  }

  // 3. Check if Carmen location is already mapped to another POS location
  const carmenMapping = await prisma.tb_pos_location_mapping.findFirst({
    where: {
      carmen_location_id: validated.carmenLocationId,
      deleted_at: null,
    },
  })

  if (carmenMapping) {
    throw new Error(
      `Carmen location "${carmenLocation.name}" is already mapped to POS location "${carmenMapping.pos_location_name}"`
    )
  }

  // 4. Create location mapping
  const mapping = await prisma.tb_pos_location_mapping.create({
    data: {
      ...validated,
      carmen_location_type: carmenLocation.type,
      created_by_id: getCurrentUserId(),
      mapped_at: new Date(),
    },
  })

  return { success: true, data: mapping }
}
```

---

## 5. Transaction Validation

### VAL-SI-007: Transaction Validation

**Rule**: POS transactions must have complete data and valid references before processing.

**Server (Business Rules)**:
```typescript
const transactionItemSchema = z.object({
  code: z.string().min(1, "Item code is required"),
  name: z.string().min(1, "Item name is required"),
  category: z.string().optional(),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().nonnegative("Unit price cannot be negative"),
  totalPrice: z.number().nonnegative("Total price cannot be negative"),
})

const transactionSchema = z.object({
  posTransactionId: z
    .string()
    .min(1, "POS transaction ID is required")
    .max(100, "POS transaction ID must not exceed 100 characters"),

  transactionDate: z
    .date()
    .max(new Date(), "Transaction date cannot be in the future"),

  posLocationId: z.string().min(1, "POS location ID is required"),

  items: z
    .array(transactionItemSchema)
    .min(1, "Transaction must have at least one item"),

  totalAmount: z
    .number()
    .nonnegative("Total amount cannot be negative"),
}).refine(
  (data) => {
    // Verify total amount matches sum of item totals
    const itemsTotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0)
    return Math.abs(itemsTotal - data.totalAmount) < 0.01 // Allow 1 cent rounding difference
  },
  {
    message: "Total amount does not match sum of item totals",
    path: ['totalAmount'],
  }
)

export async function processTransaction(data: TransactionForm) {
  // 1. Validate schema
  const validated = transactionSchema.parse(data)

  // 2. Check for duplicate transaction ID
  const existing = await prisma.tb_pos_transaction.findUnique({
    where: { pos_transaction_id: validated.posTransactionId },
  })

  if (existing) {
    throw new Error("Transaction ID already exists")
  }

  // 3. Verify location mapping exists and is active
  const locationMapping = await prisma.tb_pos_location_mapping.findFirst({
    where: {
      pos_location_id: validated.posLocationId,
      is_active: true,
      sync_enabled: true,
      deleted_at: null,
    },
  })

  if (!locationMapping) {
    throw new Error(`Location "${validated.posLocationId}" is not mapped or inactive`)
  }

  // 4. Validate each item
  const itemValidation = await Promise.all(
    validated.items.map(async (item) => {
      const mapping = await prisma.tb_pos_recipe_mapping.findFirst({
        where: {
          pos_item_code: item.code,
          status: "mapped",
          deleted_at: null,
        },
      })

      return {
        item,
        mapping,
        error: !mapping ? `Item "${item.code}" is not mapped` : null,
      }
    })
  )

  const unmappedItems = itemValidation.filter((v) => !v.mapping)

  if (unmappedItems.length > 0) {
    // Create failed transaction record
    await prisma.tb_pos_failed_transaction.create({
      data: {
        pos_transaction_id: validated.posTransactionId,
        transaction_data: validated,
        failure_type: "unmapped_item",
        failure_reason: `${unmappedItems.length} unmapped items`,
        failure_details: unmappedItems.map((v) => ({
          itemCode: v.item.code,
          itemName: v.item.name,
          error: v.error,
        })),
        resolution_status: "pending",
      },
    })

    throw new Error(
      `Transaction validation failed: ${unmappedItems.length} items are not mapped`
    )
  }

  // 5. Create transaction
  const transaction = await prisma.tb_pos_transaction.create({
    data: {
      transaction_date: validated.transactionDate,
      pos_transaction_id: validated.posTransactionId,
      pos_location_id: validated.posLocationId,
      location_mapping_id: locationMapping.id,
      items: validated.items,
      total_amount: validated.totalAmount,
      status: "received",
    },
  })

  return { success: true, data: transaction }
}
```

**Database (SQL Constraints)**:
```sql
ALTER TABLE tb_pos_transaction
ADD CONSTRAINT tb_pos_transaction_total_amount_non_negative
CHECK (total_amount >= 0);

ALTER TABLE tb_pos_transaction
ADD CONSTRAINT tb_pos_transaction_status_valid
CHECK (
  status IN (
    'received', 'validating', 'pending_approval', 'approved',
    'processing', 'processed', 'failed', 'rejected', 'ignored'
  )
);

-- Transaction date cannot be more than 7 days in the future
ALTER TABLE tb_pos_transaction
ADD CONSTRAINT tb_pos_transaction_date_valid
CHECK (transaction_date <= CURRENT_DATE + INTERVAL '7 days');
```

---

## 6. Integration Configuration Validation

### VAL-SI-008: POS Configuration Validation

**Rule**: POS integration settings must be complete and testable.

**Client (Zod Schema)**:
```typescript
const apiConfigSchema = z.object({
  posSystem: z.enum([
    "oracle-simphony",
    "micros",
    "toast",
    "square",
    "clover",
  ]),
  interfaceType: z.literal("api"),
  apiEndpoint: z.string().url("Invalid API endpoint URL"),
  apiMethod: z.enum(['GET', 'POST']),
  securityToken: z.string().min(1, "Security token is required"),
  authType: z.enum(['bearer', 'api-key', 'basic']),
})

const fileConfigSchema = z.object({
  posSystem: z.enum([
    "oracle-simphony",
    "micros",
    "toast",
    "square",
    "clover",
  ]),
  interfaceType: z.literal("file"),
  filePath: z.string().min(1, "File path is required"),
  filePattern: z.string().min(1, "File pattern is required"),
  fileFormat: z.enum(['csv', 'json', 'xml']),
})

const integrationConfigSchema = z.discriminatedUnion("interfaceType", [
  apiConfigSchema,
  fileConfigSchema,
])

const fieldMappingSchema = z.object({
  posField: z.string().min(1, "POS field is required"),
  systemField: z.string().min(1, "System field is required"),
  dataType: z.enum(["string", "integer", "decimal", 'date', 'datetime', 'boolean']),
  required: z.boolean().default(false),
})

const completeConfigSchema = integrationConfigSchema.extend({
  fieldMappings: z
    .array(fieldMappingSchema)
    .min(4, "At least 4 field mappings are required"),
  syncFrequency: z.enum(['real-time', 'hourly', 'daily']),
  syncTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)").optional(),
})
```

**Server (Business Rules)**:
```typescript
export async function saveIntegrationConfig(data: CompleteConfigForm) {
  const validated = completeConfigSchema.parse(data)

  // 1. Test connection before saving
  let connectionTest: { success: boolean; error?: string }

  if (validated.interfaceType === "api") {
    connectionTest = await testAPIConnection({
      endpoint: validated.apiEndpoint,
      method: validated.apiMethod,
      token: validated.securityToken,
      authType: validated.authType,
    })
  } else {
    connectionTest = await testFileAccess({
      path: validated.filePath,
      pattern: validated.filePattern,
    })
  }

  if (!connectionTest.success) {
    throw new Error(`Connection test failed: ${connectionTest.error}`)
  }

  // 2. Validate required field mappings
  const requiredFields = ["posItemCode", 'posDescription', 'quantity', 'price']
  const mappedFields = validated.fieldMappings.map((m) => m.systemField)

  const missingFields = requiredFields.filter((f) => !mappedFields.includes(f))

  if (missingFields.length > 0) {
    throw new Error(`Missing required field mappings: ${missingFields.join(", ")}`)
  }

  // 3. Encrypt security token before saving
  const encryptedToken =
    validated.interfaceType === "api"
      ? await encryptToken(validated.securityToken)
      : null

  // 4. Save configuration
  const config = await prisma.tb_pos_integration_config.create({
    data: {
      pos_system: validated.posSystem,
      interface_type: validated.interfaceType,
      api_endpoint: validated.interfaceType === "api" ? validated.apiEndpoint : null,
      security_token: encryptedToken,
      file_path: validated.interfaceType === "file" ? validated.filePath : null,
      file_pattern: validated.interfaceType === "file" ? validated.filePattern : null,
      field_mappings: validated.fieldMappings,
      sync_frequency: validated.syncFrequency,
      sync_time: validated.syncTime,
      connection_status: "connected",
      last_connection_test: new Date(),
      created_by_id: getCurrentUserId(),
    },
  })

  return { success: true, data: config }
}
```

---

## 7. Validation Error Handling

### Error Code Format

All validation errors follow the format: `VAL-SI-XXX-YY`
- `VAL` = Validation
- `SI` = System Integrations
- `XXX` = Validation rule number (001-999)
- `YY` = Specific error within rule (01-99)

### Client-Side Error Display

```typescript
// Form validation with React Hook Form
const form = useForm<RecipeMappingForm>({
  resolver: zodResolver(recipeMappingSchema),
  mode: "onBlur", // Validate on blur for better UX
})

// Display validation errors
{form.formState.errors.posItemCode && (
  <p className="text-sm text-red-600 mt-1">
    {form.formState.errors.posItemCode.message}
  </p>
)}
```

### Server-Side Error Response

```typescript
// Standardized error response
interface ValidationError {
  code: string
  field: string
  message: string
  value?: any
}

interface ErrorResponse {
  success: false
  error: string
  validationErrors?: ValidationError[]
  timestamp: string
  requestId: string
}

// Example error response
{
  "success": false,
  "error": "Validation failed",
  "validationErrors": [
    {
      "code": "VAL-SI-001-03",
      "field": "posItemCode",
      "message": "POS item code format is invalid",
      "value": "pos-001"
    },
    {
      "code": "VAL-SI-001-09",
      "field": "conversionRate",
      "message": "Conversion rate must be greater than 0",
      "value": -1
    }
  ],
  "timestamp": "2025-01-16T10:30:00Z",
  "requestId": "req_abc123"
}
```

---

## 8. Testing Validation Rules

### Unit Tests (Vitest)

```typescript
// __tests__/validation/recipe-mapping.test.ts
import { describe, it, expect } from "vitest"
import { recipeMappingSchema } from "../schemas"

describe("VAL-SI-001: Recipe Mapping Validation", () => {
  it("should pass with valid data", () => {
    const validData = {
      posItemCode: "POS001",
      posDescription: "Test Item",
      recipeId: "550e8400-e29b-41d4-a716-446655440000",
      posUnit: "Plate",
      recipeUnit: "Recipe",
      conversionRate: 1.0,
      category: "Main Course",
      status: "mapped",
    }

    const result = recipeMappingSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("should fail with invalid POS item code format", () => {
    const invalidData = {
      posItemCode: "pos-001", // Should be uppercase
      posDescription: "Test Item",
      recipeId: "550e8400-e29b-41d4-a716-446655440000",
      posUnit: "Plate",
      recipeUnit: "Recipe",
      conversionRate: 1.0,
      category: "Main Course",
      status: "mapped",
    }

    const result = recipeMappingSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain("uppercase")
  })

  it("should fail with negative conversion rate", () => {
    const invalidData = {
      // ... valid fields
      conversionRate: -1.0,
    }

    const result = recipeMappingSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['conversionRate'])
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/create-mapping.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { createRecipeMapping } from "../actions"

describe("Recipe Mapping Creation Integration", () => {
  beforeEach(async () => {
    await clearDatabase()
    await seedTestData()
  })

  it("should create recipe mapping successfully", async () => {
    const data = {
      posItemCode: "TEST001",
      posDescription: "Test Item",
      recipeId: testRecipeId,
      posUnit: "Plate",
      recipeUnit: "Recipe",
      conversionRate: 1.0,
      category: "Test",
      status: "mapped",
    }

    const result = await createRecipeMapping(data)

    expect(result.success).toBe(true)
    expect(result.data?.posItemCode).toBe("TEST001")
  })

  it("should reject duplicate POS item code", async () => {
    const data = {
      posItemCode: "EXISTING001", // Already in database
      // ... other fields
    }

    await expect(createRecipeMapping(data)).rejects.toThrow(
      "POS item code already exists"
    )
  })
})
```

---

## 9. Validation Checklist

### Pre-Deployment Validation Checklist

- [ ] All Zod schemas defined and exported
- [ ] Server-side business rules implemented
- [ ] Database constraints added and tested
- [ ] Error messages clear and user-friendly
- [ ] Unit tests for all validation rules
- [ ] Integration tests for critical workflows
- [ ] Error handling implemented client and server
- [ ] Validation error logging configured
- [ ] User feedback mechanisms tested
- [ ] Edge cases identified and handled

### Runtime Validation Monitoring

- [ ] Validation error rates tracked (target: < 5% of requests)
- [ ] Common validation failures identified and addressed
- [ ] User education for frequent errors (tooltips, help text)
- [ ] Validation performance monitored (target: < 100ms)
- [ ] Database constraint violations logged and reviewed

---

**Document Control**:
- **Created**: 2025-01-16
- **Version**: 1.0
- **Status**: Planned Implementation
- **Target Implementation**: Q2 2025
