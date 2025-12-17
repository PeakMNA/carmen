# Recipe Management - Validations (VAL)

## Document Information
- **Document Type**: Validations Specification
- **Module**: Operational Planning > Recipe Management > Recipes
- **Version**: 1.0
- **Last Updated**: 2024-01-15

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0 | 2024-01-15 | System | Initial validations specification document created for Recipe Management |

---

## 1. Client-Side Validation (Zod Schemas)

### 1.1 Base Recipe Schema

```typescript
import { z } from "zod"

// Recipe difficulty enum
const recipeDifficultySchema = z.enum(['easy', 'medium', 'hard'], {
  required_error: "Difficulty is required",
  invalid_type_error: "Invalid difficulty level"
})

// Recipe status enum
const recipeStatusSchema = z.enum(['draft', 'published', 'archived'], {
  required_error: "Status is required",
  invalid_type_error: "Invalid status"
})

// Fractional sales type enum
const fractionalSalesTypeSchema = z.enum([
  'pizza-slice',
  'cake-slice',
  'bottle-glass',
  'portion-control',
  'custom'
], {
  invalid_type_error: "Invalid fractional sales type"
})

// Base recipe schema
export const recipeSchema = z.object({
  // Basic Information
  name: z
    .string({ required_error: "Recipe name is required" })
    .min(2, "Recipe name must be at least 2 characters")
    .max(200, "Recipe name cannot exceed 200 characters")
    .regex(/^[a-zA-Z0-9\s\-&'().,]+$/, {
      message: "Name can only contain letters, numbers, spaces, and common punctuation"
    })
    .trim(),

  description: z
    .string({ required_error: "Description is required" })
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .trim(),

  imageUrl: z
    .string()
    .url("Image URL must be valid")
    .max(500, "Image URL too long")
    .nullable()
    .optional(),

  // Classification
  categoryId: z
    .string({ required_error: "Category is required" })
    .min(1, "Category is required"),

  cuisineId: z
    .string({ required_error: "Cuisine is required" })
    .min(1, "Cuisine is required"),

  difficulty: recipeDifficultySchema.default('medium'),

  // Yield Configuration
  baseYield: z
    .number({ required_error: "Yield is required" })
    .positive("Yield must be positive")
    .min(0.01, "Yield must be at least 0.01")
    .max(10000, "Yield too large"),

  baseYieldUnit: z
    .string({ required_error: "Yield unit is required" })
    .min(1, "Yield unit is required")
    .max(50, "Yield unit too long"),

  allowsFractionalSales: z.boolean().default(false),

  fractionalSalesType: fractionalSalesTypeSchema.nullable().optional(),

  // Timing
  prepTime: z
    .number({ required_error: "Prep time is required" })
    .int("Prep time must be a whole number")
    .min(0, "Prep time cannot be negative")
    .max(2880, "Prep time too long (max 48 hours)"), // 48 hours

  cookTime: z
    .number({ required_error: "Cook time is required" })
    .int("Cook time must be a whole number")
    .min(0, "Cook time cannot be negative")
    .max(2880, "Cook time too long (max 48 hours)"),

  // Cost Percentages
  laborCostPercentage: z
    .number()
    .min(0, "Labor cost percentage cannot be negative")
    .max(100, "Labor cost percentage cannot exceed 100%")
    .default(30),

  overheadPercentage: z
    .number()
    .min(0, "Overhead percentage cannot be negative")
    .max(100, "Overhead percentage cannot exceed 100%")
    .default(20),

  targetFoodCostPercentage: z
    .number()
    .min(1, "Target food cost percentage must be at least 1%")
    .max(90, "Target food cost percentage too high")
    .default(33),

  // Pricing
  sellingPrice: z
    .number()
    .positive("Selling price must be positive")
    .max(100000, "Selling price too high")
    .nullable()
    .optional(),

  // Environmental
  carbonFootprint: z
    .number()
    .min(0, "Carbon footprint cannot be negative")
    .default(0)
    .optional(),

  // Inventory
  deductFromStock: z.boolean().default(true),

  // Status
  status: recipeStatusSchema.default('draft')
})
  .refine(
    (data) => {
      // If fractional sales enabled, type must be selected
      if (data.allowsFractionalSales && !data.fractionalSalesType) {
        return false
      }
      return true
    },
    {
      message: "Fractional sales type is required when fractional sales is enabled",
      path: ['fractionalSalesType']
    }
  )
  .refine(
    (data) => {
      // Total time should not exceed 96 hours (4 days)
      return (data.prepTime + data.cookTime) <= 5760
    },
    {
      message: "Total time (prep + cook) cannot exceed 96 hours",
      path: ['cookTime']
    }
  )

export type RecipeFormData = z.infer<typeof recipeSchema>
```

### 1.2 Ingredient Schema

```typescript
// Ingredient type enum
const ingredientTypeSchema = z.enum(['product', 'recipe'], {
  required_error: "Ingredient type is required",
  invalid_type_error: "Invalid ingredient type"
})

export const ingredientSchema = z.object({
  id: z.string().optional(), // For updates

  ingredientType: ingredientTypeSchema,

  productId: z.string().nullable().optional(),

  subRecipeId: z.string().nullable().optional(),

  ingredientName: z
    .string({ required_error: "Ingredient name is required" })
    .min(1, "Ingredient name is required")
    .max(200, "Ingredient name too long"),

  quantity: z
    .number({ required_error: "Quantity is required" })
    .positive("Quantity must be positive")
    .max(100000, "Quantity too large"),

  unit: z
    .string({ required_error: "Unit is required" })
    .min(1, "Unit is required")
    .max(50, "Unit too long"),

  wastagePercentage: z
    .number()
    .min(0, "Wastage percentage cannot be negative")
    .max(100, "Wastage percentage cannot exceed 100%")
    .default(0),

  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .nullable()
    .optional(),

  orderIndex: z.number().int().min(0).default(0)
})
  .refine(
    (data) => {
      // If product type, productId must be set
      if (data.ingredientType === 'product' && !data.productId) {
        return false
      }
      // If recipe type, subRecipeId must be set
      if (data.ingredientType === 'recipe' && !data.subRecipeId) {
        return false
      }
      return true
    },
    {
      message: "Product ID or Sub-Recipe ID must be provided based on ingredient type",
      path: ['productId']
    }
  )

export type IngredientFormData = z.infer<typeof ingredientSchema>
```

### 1.3 Preparation Step Schema

```typescript
const temperatureUnitSchema = z.enum(['C', 'F'], {
  invalid_type_error: "Invalid temperature unit"
})

export const preparationStepSchema = z.object({
  id: z.string().optional(), // For updates

  stepNumber: z
    .number({ required_error: "Step number is required" })
    .int("Step number must be a whole number")
    .positive("Step number must be positive"),

  title: z
    .string()
    .max(200, "Title cannot exceed 200 characters")
    .nullable()
    .optional(),

  description: z
    .string({ required_error: "Step description is required" })
    .min(5, "Description must be at least 5 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .trim(),

  imageUrl: z
    .string()
    .url("Image URL must be valid")
    .max(500, "Image URL too long")
    .nullable()
    .optional(),

  videoUrl: z
    .string()
    .url("Video URL must be valid")
    .max(500, "Video URL too long")
    .nullable()
    .optional(),

  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(0, "Duration cannot be negative")
    .max(1440, "Duration too long (max 24 hours)")
    .nullable()
    .optional(),

  temperature: z
    .number()
    .min(-50, "Temperature too low")
    .max(500, "Temperature too high")
    .nullable()
    .optional(),

  temperatureUnit: temperatureUnitSchema.default('C'),

  equipment: z
    .array(z.string().min(1).max(100))
    .max(20, "Maximum 20 equipment items allowed")
    .default([]),

  techniques: z
    .array(z.string().min(1).max(100))
    .max(20, "Maximum 20 techniques allowed")
    .default([]),

  chefNotes: z
    .string()
    .max(1000, "Chef notes cannot exceed 1000 characters")
    .nullable()
    .optional(),

  safetyWarnings: z
    .string()
    .max(500, "Safety warnings cannot exceed 500 characters")
    .nullable()
    .optional()
})

export type PreparationStepFormData = z.infer<typeof preparationStepSchema>
```

### 1.4 Yield Variant Schema

```typescript
export const yieldVariantSchema = z.object({
  id: z.string().optional(), // For updates

  variantName: z
    .string({ required_error: "Variant name is required" })
    .min(1, "Variant name is required")
    .max(100, "Variant name too long"),

  variantUnit: z
    .string({ required_error: "Variant unit is required" })
    .min(1, "Variant unit is required")
    .max(50, "Variant unit too long"),

  variantQuantity: z
    .number({ required_error: "Variant quantity is required" })
    .positive("Variant quantity must be positive")
    .max(10000, "Variant quantity too large"),

  conversionRate: z
    .number({ required_error: "Conversion rate is required" })
    .min(0.0001, "Conversion rate too small (min 0.0001)")
    .max(1, "Conversion rate cannot exceed 1.0"),

  sellingPrice: z
    .number()
    .positive("Selling price must be positive")
    .max(100000, "Selling price too high")
    .nullable()
    .optional(),

  isDefault: z.boolean().default(false),

  shelfLife: z
    .number()
    .int("Shelf life must be a whole number")
    .positive("Shelf life must be positive")
    .max(8760, "Shelf life too long (max 1 year)")
    .nullable()
    .optional(),

  wastageRate: z
    .number()
    .min(0, "Wastage rate cannot be negative")
    .max(100, "Wastage rate cannot exceed 100%")
    .nullable()
    .optional(),

  minOrderQuantity: z
    .number()
    .int("Min order quantity must be a whole number")
    .positive("Min order quantity must be positive")
    .nullable()
    .optional(),

  maxOrderQuantity: z
    .number()
    .int("Max order quantity must be a whole number")
    .positive("Max order quantity must be positive")
    .nullable()
    .optional()
})
  .refine(
    (data) => {
      // If both min and max order quantities are set, min must be <= max
      if (data.minOrderQuantity && data.maxOrderQuantity) {
        return data.minOrderQuantity <= data.maxOrderQuantity
      }
      return true
    },
    {
      message: "Minimum order quantity cannot exceed maximum order quantity",
      path: ['maxOrderQuantity']
    }
  )

export type YieldVariantFormData = z.infer<typeof yieldVariantSchema>
```

### 1.5 Complete Create Recipe Schema

```typescript
export const createRecipeSchema = recipeSchema.extend({
  ingredients: z
    .array(ingredientSchema)
    .min(1, "At least one ingredient is required")
    .max(100, "Maximum 100 ingredients allowed"),

  steps: z
    .array(preparationStepSchema)
    .min(1, "At least one preparation step is required")
    .max(50, "Maximum 50 preparation steps allowed"),

  yieldVariants: z
    .array(yieldVariantSchema)
    .max(20, "Maximum 20 yield variants allowed")
    .optional(),

  allergens: z
    .array(z.string().min(1).max(100))
    .max(50, "Maximum 50 allergens allowed")
    .optional(),

  tags: z
    .array(z.string().min(1).max(100))
    .max(50, "Maximum 50 tags allowed")
    .optional()
})
  .refine(
    (data) => {
      // If fractional sales enabled, must have at least 2 yield variants
      if (data.allowsFractionalSales && (!data.yieldVariants || data.yieldVariants.length < 2)) {
        return false
      }
      return true
    },
    {
      message: "At least 2 yield variants required when fractional sales is enabled",
      path: ['yieldVariants']
    }
  )
  .refine(
    (data) => {
      // If yield variants exist, exactly one must be marked as default
      if (data.yieldVariants && data.yieldVariants.length > 0) {
        const defaultCount = data.yieldVariants.filter(v => v.isDefault).length
        return defaultCount === 1
      }
      return true
    },
    {
      message: "Exactly one yield variant must be marked as default",
      path: ['yieldVariants']
    }
  )
  .refine(
    (data) => {
      // Step numbers must be sequential starting from 1
      if (data.steps && data.steps.length > 0) {
        const sortedSteps = [...data.steps].sort((a, b) => a.stepNumber - b.stepNumber)
        for (let i = 0; i < sortedSteps.length; i++) {
          if (sortedSteps[i].stepNumber !== i + 1) {
            return false
          }
        }
      }
      return true
    },
    {
      message: "Preparation steps must be numbered sequentially starting from 1",
      path: ['steps']
    }
  )

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>
```

### 1.6 Update Recipe Schema

```typescript
export const updateRecipeSchema = createRecipeSchema.extend({
  id: z
    .string({ required_error: "Recipe ID is required" })
    .min(1, "Invalid recipe ID"),

  version: z.number().int().positive().optional()
})

export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>
```

### 1.7 Publish Recipe Schema

```typescript
export const publishRecipeSchema = z.object({
  id: z.string({ required_error: "Recipe ID is required" }),
  changeSummary: z.string().max(500, "Change summary cannot exceed 500 characters").optional()
})
  .refine(
    async (data) => {
      // Validate publish requirements are met
      // This will be checked server-side as well
      return true
    },
    {
      message: "Recipe does not meet publish requirements"
    }
  )

export type PublishRecipeInput = z.infer<typeof publishRecipeSchema>
```

---

## 2. Server-Side Validation

### 2.1 Create Recipe Validation

```typescript
export async function validateCreateRecipe(input: unknown): Promise<ValidationResult> {
  // 1. Schema validation
  const parsed = createRecipeSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input",
      errors: parsed.error.errors
    }
  }

  const data = parsed.data

  // 2. Check recipe code uniqueness (if provided or generate)
  const recipeCode = data.recipeCode || await generateRecipeCode()
  const existingCode = await prisma.recipe.findUnique({
    where: { recipeCode },
    select: { id: true, name: true }
  })

  if (existingCode) {
    return {
      success: false,
      error: `Recipe code "${recipeCode}" is already in use by "${existingCode.name}"`
    }
  }

  // 3. Check recipe name uniqueness (case-insensitive)
  const existingName = await prisma.recipe.findFirst({
    where: {
      name: { equals: data.name, mode: 'insensitive' },
      deleted: false
    },
    select: { id: true, recipeCode: true }
  })

  if (existingName) {
    return {
      success: false,
      error: `Recipe name "${data.name}" is already in use (code: ${existingName.recipeCode})`
    }
  }

  // 4. Validate category exists and is active
  const category = await prisma.recipeCategory.findUnique({
    where: { id: data.categoryId },
    select: { id: true, status: true }
  })

  if (!category) {
    return { success: false, error: "Selected category not found" }
  }

  if (category.status === 'inactive') {
    return { success: false, error: "Cannot use inactive category" }
  }

  // 5. Validate cuisine exists and is active
  const cuisine = await prisma.recipeCuisine.findUnique({
    where: { id: data.cuisineId },
    select: { id: true, status: true }
  })

  if (!cuisine) {
    return { success: false, error: "Selected cuisine not found" }
  }

  if (cuisine.status === 'inactive') {
    return { success: false, error: "Cannot use inactive cuisine" }
  }

  // 6. Validate ingredients
  for (const ingredient of data.ingredients) {
    if (ingredient.ingredientType === 'product') {
      // Check product exists
      const product = await prisma.product.findUnique({
        where: { id: ingredient.productId },
        select: { id: true, status: true }
      })

      if (!product) {
        return { success: false, error: `Product not found: ${ingredient.ingredientName}` }
      }

      if (product.status === 'inactive') {
        return { success: false, error: `Product is inactive: ${ingredient.ingredientName}` }
      }
    } else if (ingredient.ingredientType === 'recipe') {
      // Check sub-recipe exists
      const subRecipe = await prisma.recipe.findUnique({
        where: { id: ingredient.subRecipeId },
        select: { id: true, status: true, deleted: true }
      })

      if (!subRecipe || subRecipe.deleted) {
        return { success: false, error: `Sub-recipe not found: ${ingredient.ingredientName}` }
      }

      if (subRecipe.status !== 'published') {
        return { success: false, error: `Sub-recipe must be published: ${ingredient.ingredientName}` }
      }

      // Check for circular dependency (will be implemented below)
      const hasCircular = await checkCircularDependency(null, ingredient.subRecipeId)
      if (hasCircular) {
        return { success: false, error: `Circular dependency detected with: ${ingredient.ingredientName}` }
      }

      // Check nesting depth
      const depth = await getRecipeNestingDepth(ingredient.subRecipeId)
      if (depth >= 3) {
        return { success: false, error: `Maximum nesting depth (3 levels) exceeded for: ${ingredient.ingredientName}` }
      }
    }
  }

  // 7. Validate step numbers are sequential
  const stepNumbers = data.steps.map(s => s.stepNumber).sort((a, b) => a - b)
  for (let i = 0; i < stepNumbers.length; i++) {
    if (stepNumbers[i] !== i + 1) {
      return { success: false, error: `Step numbers must be sequential. Missing step ${i + 1}` }
    }
  }

  // 8. Validate yield variants if fractional sales enabled
  if (data.allowsFractionalSales) {
    if (!data.yieldVariants || data.yieldVariants.length < 2) {
      return { success: false, error: "At least 2 yield variants required for fractional sales" }
    }

    const defaultVariants = data.yieldVariants.filter(v => v.isDefault)
    if (defaultVariants.length !== 1) {
      return { success: false, error: "Exactly one yield variant must be marked as default" }
    }

    // Validate conversion rates sum up logically
    const wholeRecipeVariant = data.yieldVariants.find(v => v.conversionRate === 1.0)
    if (!wholeRecipeVariant) {
      return { success: false, error: "Must have one variant with conversion rate of 1.0 (whole recipe)" }
    }
  }

  return { success: true, data }
}
```

### 2.2 Update Recipe Validation

```typescript
export async function validateUpdateRecipe(input: unknown): Promise<ValidationResult> {
  // 1. Schema validation
  const parsed = updateRecipeSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message, errors: parsed.error.errors }
  }

  const data = parsed.data

  // 2. Check recipe exists
  const existing = await prisma.recipe.findUnique({
    where: { id: data.id },
    include: {
      ingredients: true,
      steps: true,
      yieldVariants: true,
      usedInRecipes: { // Recipes using this as sub-recipe
        where: { recipe: { status: 'published', deleted: false } },
        select: { recipe: { select: { id: true, name: true } } }
      }
    }
  })

  if (!existing || existing.deleted) {
    return { success: false, error: "Recipe not found" }
  }

  // 3. Check if recipe is published and being used as sub-recipe
  if (existing.status === 'published' && existing.usedInRecipes.length > 0) {
    // Warn about changes affecting other recipes
    console.warn(`Recipe is used as sub-recipe in ${existing.usedInRecipes.length} other recipes`)
  }

  // 4. Check recipe code uniqueness (if changed)
  if (data.recipeCode && data.recipeCode !== existing.recipeCode) {
    const codeConflict = await prisma.recipe.findFirst({
      where: { recipeCode: data.recipeCode, id: { not: data.id }, deleted: false }
    })

    if (codeConflict) {
      return { success: false, error: `Recipe code "${data.recipeCode}" is already in use` }
    }
  }

  // 5. Check recipe name uniqueness (if changed)
  if (data.name && data.name.toLowerCase() !== existing.name.toLowerCase()) {
    const nameConflict = await prisma.recipe.findFirst({
      where: {
        name: { equals: data.name, mode: 'insensitive' },
        id: { not: data.id },
        deleted: false
      }
    })

    if (nameConflict) {
      return { success: false, error: `Recipe name "${data.name}" is already in use` }
    }
  }

  // 6. Validate category and cuisine (same as create)
  if (data.categoryId) {
    const category = await prisma.recipeCategory.findUnique({
      where: { id: data.categoryId },
      select: { status: true }
    })

    if (!category || category.status === 'inactive') {
      return { success: false, error: "Selected category is invalid or inactive" }
    }
  }

  if (data.cuisineId) {
    const cuisine = await prisma.recipeCuisine.findUnique({
      where: { id: data.cuisineId },
      select: { status: true }
    })

    if (!cuisine || cuisine.status === 'inactive') {
      return { success: false, error: "Selected cuisine is invalid or inactive" }
    }
  }

  // 7. Validate ingredients (check for circular dependencies in sub-recipes)
  if (data.ingredients) {
    for (const ingredient of data.ingredients) {
      if (ingredient.ingredientType === 'recipe' && ingredient.subRecipeId) {
        // Check for circular dependency
        const hasCircular = await checkCircularDependency(data.id, ingredient.subRecipeId)
        if (hasCircular) {
          return { success: false, error: `Circular dependency detected with: ${ingredient.ingredientName}` }
        }

        // Check nesting depth
        const depth = await getRecipeNestingDepth(ingredient.subRecipeId)
        if (depth >= 3) {
          return { success: false, error: `Maximum nesting depth exceeded for: ${ingredient.ingredientName}` }
        }
      }
    }
  }

  // 8. Validate status change
  if (data.status && data.status !== existing.status) {
    // Can only change: draft → published, published → archived, archived → published
    const validTransitions = {
      draft: ['published', 'archived'],
      published: ['archived'],
      archived: ['published']
    }

    if (!validTransitions[existing.status]?.includes(data.status)) {
      return { success: false, error: `Invalid status transition from ${existing.status} to ${data.status}` }
    }

    // If changing to published, validate publish requirements
    if (data.status === 'published') {
      const publishValidation = await validatePublishRequirements(data.id, data)
      if (!publishValidation.success) {
        return publishValidation
      }
    }
  }

  return { success: true, data }
}
```

### 2.3 Delete Recipe Validation

```typescript
export async function validateDeleteRecipe(id: string): Promise<ValidationResult> {
  // 1. Check existence
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      usedInRecipes: {
        where: { recipe: { deleted: false } },
        select: {
          recipe: { select: { id: true, name: true, recipeCode: true, status: true } }
        }
      },
      _count: {
        select: {
          // Count where this recipe is used in active menus
          // This would require menu integration
        }
      }
    }
  })

  if (!recipe || recipe.deleted) {
    return { success: false, error: "Recipe not found" }
  }

  // 2. Check if recipe is published (BLOCKING)
  if (recipe.status === 'published') {
    return {
      success: false,
      error: "Cannot delete published recipe. Please archive it first.",
      blocked: true
    }
  }

  // 3. Check if used as sub-recipe in other recipes (BLOCKING)
  const activeUsage = recipe.usedInRecipes.filter(u => u.recipe.status === 'published')
  if (activeUsage.length > 0) {
    return {
      success: false,
      error: `Cannot delete recipe. It is used as an ingredient in ${activeUsage.length} published recipe(s).`,
      blocked: true,
      affectedRecipes: activeUsage.map(u => u.recipe)
    }
  }

  // 4. Check if used in active menus (BLOCKING)
  // This would be implemented when menu integration is complete
  // if (recipe._count.menuUsage > 0) {
  //   return {
  //     success: false,
  //     error: `Cannot delete recipe. It is used in ${recipe._count.menuUsage} active menu(s).`,
  //     blocked: true
  //   }
  // }

  // 5. Check for order history (WARNING)
  const hasOrderHistory = await prisma.orderItem.findFirst({
    where: { recipeId: id },
    select: { id: true }
  })

  if (hasOrderHistory) {
    return {
      success: false,
      warning: true,
      error: "This recipe has order history. Deletion will preserve historical data but remove the recipe from active use.",
      requiresConfirmation: true
    }
  }

  return { success: true, data: { recipe } }
}
```

### 2.4 Publish Recipe Validation

```typescript
export async function validatePublishRequirements(
  recipeId: string,
  data?: Partial<Recipe>
): Promise<ValidationResult> {
  const recipe = data || await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: true,
      steps: true,
      yieldVariants: true,
      allergens: true
    }
  })

  if (!recipe) {
    return { success: false, error: "Recipe not found" }
  }

  const errors: string[] = []

  // 1. Basic information must be complete
  if (!recipe.name || recipe.name.trim().length < 2) {
    errors.push("Recipe name is required")
  }

  if (!recipe.description || recipe.description.trim().length < 10) {
    errors.push("Recipe description must be at least 10 characters")
  }

  if (!recipe.categoryId) {
    errors.push("Recipe category is required")
  }

  if (!recipe.cuisineId) {
    errors.push("Recipe cuisine is required")
  }

  // 2. Must have at least one ingredient
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push("At least one ingredient is required")
  }

  // 3. Must have at least one preparation step
  if (!recipe.steps || recipe.steps.length === 0) {
    errors.push("At least one preparation step is required")
  }

  // 4. Costs must be calculated
  if (recipe.totalIngredientCost === 0 || recipe.costPerPortion === 0) {
    errors.push("Recipe costs must be calculated")
  }

  // 5. If fractional sales enabled, must have valid yield variants
  if (recipe.allowsFractionalSales) {
    if (!recipe.yieldVariants || recipe.yieldVariants.length < 2) {
      errors.push("At least 2 yield variants required for fractional sales")
    }

    const defaultVariants = recipe.yieldVariants?.filter(v => v.isDefault) || []
    if (defaultVariants.length !== 1) {
      errors.push("Exactly one yield variant must be marked as default")
    }
  }

  // 6. All ingredients must be valid
  if (recipe.ingredients) {
    for (const ingredient of recipe.ingredients) {
      if (ingredient.ingredientType === 'product') {
        const product = await prisma.product.findUnique({
          where: { id: ingredient.productId }
        })

        if (!product || product.status === 'inactive') {
          errors.push(`Ingredient "${ingredient.ingredientName}" is invalid or inactive`)
        }
      } else if (ingredient.ingredientType === 'recipe') {
        const subRecipe = await prisma.recipe.findUnique({
          where: { id: ingredient.subRecipeId }
        })

        if (!subRecipe || subRecipe.deleted || subRecipe.status !== 'published') {
          errors.push(`Sub-recipe "${ingredient.ingredientName}" must be published`)
        }
      }
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: "Recipe does not meet publish requirements",
      errors
    }
  }

  return { success: true }
}
```

### 2.5 Circular Dependency Validation

```typescript
async function checkCircularDependency(
  recipeId: string | null,
  subRecipeId: string,
  visited: Set<string> = new Set()
): Promise<boolean> {
  // If we're checking for a new recipe (recipeId is null), there can't be circular dependency
  if (!recipeId) {
    return false
  }

  // If we've visited this recipe before in this chain, circular dependency detected
  if (visited.has(subRecipeId)) {
    return true
  }

  // If the sub-recipe is the same as the current recipe, circular dependency
  if (subRecipeId === recipeId) {
    return true
  }

  visited.add(subRecipeId)

  // Get all sub-recipes of this sub-recipe
  const subRecipeIngredients = await prisma.recipeIngredient.findMany({
    where: {
      recipeId: subRecipeId,
      ingredientType: 'recipe'
    },
    select: { subRecipeId: true }
  })

  // Recursively check each sub-recipe
  for (const ingredient of subRecipeIngredients) {
    if (ingredient.subRecipeId) {
      const hasCircular = await checkCircularDependency(
        recipeId,
        ingredient.subRecipeId,
        new Set(visited)
      )

      if (hasCircular) {
        return true
      }
    }
  }

  return false
}

async function getRecipeNestingDepth(recipeId: string, currentDepth = 0): Promise<number> {
  // Maximum depth is 3, so stop early if exceeded
  if (currentDepth >= 3) {
    return currentDepth
  }

  // Get all sub-recipes
  const subRecipeIngredients = await prisma.recipeIngredient.findMany({
    where: {
      recipeId,
      ingredientType: 'recipe'
    },
    select: { subRecipeId: true }
  })

  // If no sub-recipes, return current depth
  if (subRecipeIngredients.length === 0) {
    return currentDepth
  }

  // Recursively get depth of each sub-recipe and return maximum
  let maxDepth = currentDepth

  for (const ingredient of subRecipeIngredients) {
    if (ingredient.subRecipeId) {
      const depth = await getRecipeNestingDepth(ingredient.subRecipeId, currentDepth + 1)
      maxDepth = Math.max(maxDepth, depth)
    }
  }

  return maxDepth
}
```

---

## 3. Field-Level Validation Rules

| Field | Rule | Type | Error Message |
|-------|------|------|---------------|
| **Recipe Fields** |
| name | Required | All | "Recipe name is required" |
| name | Min length: 2 | All | "Recipe name must be at least 2 characters" |
| name | Max length: 200 | All | "Recipe name cannot exceed 200 characters" |
| name | Format | All | "Name can only contain letters, numbers, spaces, and common punctuation" |
| name | Unique | Server | "Recipe name '{name}' is already in use" |
| description | Required | All | "Description is required" |
| description | Min length: 10 | All | "Description must be at least 10 characters" |
| description | Max length: 2000 | All | "Description cannot exceed 2000 characters" |
| imageUrl | Valid URL | All | "Image URL must be valid" |
| imageUrl | Max length: 500 | All | "Image URL too long" |
| categoryId | Required | All | "Category is required" |
| categoryId | Exists & Active | Server | "Selected category is invalid or inactive" |
| cuisineId | Required | All | "Cuisine is required" |
| cuisineId | Exists & Active | Server | "Selected cuisine is invalid or inactive" |
| difficulty | Required | All | "Difficulty is required" |
| difficulty | Valid enum | All | "Invalid difficulty level" |
| baseYield | Required | All | "Yield is required" |
| baseYield | Positive | All | "Yield must be positive" |
| baseYield | Min: 0.01 | All | "Yield must be at least 0.01" |
| baseYield | Max: 10000 | All | "Yield too large" |
| baseYieldUnit | Required | All | "Yield unit is required" |
| baseYieldUnit | Max length: 50 | All | "Yield unit too long" |
| fractionalSalesType | Required if enabled | All | "Fractional sales type is required when fractional sales is enabled" |
| prepTime | Required | All | "Prep time is required" |
| prepTime | Integer | All | "Prep time must be a whole number" |
| prepTime | Non-negative | All | "Prep time cannot be negative" |
| prepTime | Max: 2880 | All | "Prep time too long (max 48 hours)" |
| cookTime | Required | All | "Cook time is required" |
| cookTime | Integer | All | "Cook time must be a whole number" |
| cookTime | Non-negative | All | "Cook time cannot be negative" |
| cookTime | Max: 2880 | All | "Cook time too long (max 48 hours)" |
| totalTime | Max: 5760 | All | "Total time cannot exceed 96 hours" |
| laborCostPercentage | Min: 0 | All | "Labor cost percentage cannot be negative" |
| laborCostPercentage | Max: 100 | All | "Labor cost percentage cannot exceed 100%" |
| overheadPercentage | Min: 0 | All | "Overhead percentage cannot be negative" |
| overheadPercentage | Max: 100 | All | "Overhead percentage cannot exceed 100%" |
| targetFoodCostPercentage | Min: 1 | All | "Target food cost percentage must be at least 1%" |
| targetFoodCostPercentage | Max: 90 | All | "Target food cost percentage too high" |
| sellingPrice | Positive | All | "Selling price must be positive" |
| sellingPrice | Max: 100000 | All | "Selling price too high" |
| carbonFootprint | Non-negative | All | "Carbon footprint cannot be negative" |
| status | Valid enum | All | "Invalid status" |
| **Ingredient Fields** |
| ingredientType | Required | All | "Ingredient type is required" |
| productId/subRecipeId | Required based on type | All | "Product ID or Sub-Recipe ID must be provided" |
| ingredientName | Required | All | "Ingredient name is required" |
| ingredientName | Max length: 200 | All | "Ingredient name too long" |
| quantity | Required | All | "Quantity is required" |
| quantity | Positive | All | "Quantity must be positive" |
| quantity | Max: 100000 | All | "Quantity too large" |
| unit | Required | All | "Unit is required" |
| unit | Max length: 50 | All | "Unit too long" |
| wastagePercentage | Min: 0 | All | "Wastage percentage cannot be negative" |
| wastagePercentage | Max: 100 | All | "Wastage percentage cannot exceed 100%" |
| notes | Max length: 500 | All | "Notes cannot exceed 500 characters" |
| subRecipeId | No circular | Server | "Circular dependency detected" |
| subRecipeId | Max nesting depth | Server | "Maximum nesting depth (3 levels) exceeded" |
| subRecipeId | Published | Server | "Sub-recipe must be published" |
| **Preparation Step Fields** |
| stepNumber | Required | All | "Step number is required" |
| stepNumber | Integer | All | "Step number must be a whole number" |
| stepNumber | Positive | All | "Step number must be positive" |
| stepNumber | Sequential | Server | "Step numbers must be sequential" |
| title | Max length: 200 | All | "Title cannot exceed 200 characters" |
| description | Required | All | "Step description is required" |
| description | Min length: 5 | All | "Description must be at least 5 characters" |
| description | Max length: 2000 | All | "Description cannot exceed 2000 characters" |
| imageUrl | Valid URL | All | "Image URL must be valid" |
| videoUrl | Valid URL | All | "Video URL must be valid" |
| duration | Integer | All | "Duration must be a whole number" |
| duration | Non-negative | All | "Duration cannot be negative" |
| duration | Max: 1440 | All | "Duration too long (max 24 hours)" |
| temperature | Min: -50 | All | "Temperature too low" |
| temperature | Max: 500 | All | "Temperature too high" |
| equipment | Max count: 20 | All | "Maximum 20 equipment items allowed" |
| techniques | Max count: 20 | All | "Maximum 20 techniques allowed" |
| chefNotes | Max length: 1000 | All | "Chef notes cannot exceed 1000 characters" |
| safetyWarnings | Max length: 500 | All | "Safety warnings cannot exceed 500 characters" |
| **Yield Variant Fields** |
| variantName | Required | All | "Variant name is required" |
| variantUnit | Required | All | "Variant unit is required" |
| variantQuantity | Required | All | "Variant quantity is required" |
| variantQuantity | Positive | All | "Variant quantity must be positive" |
| conversionRate | Required | All | "Conversion rate is required" |
| conversionRate | Min: 0.0001 | All | "Conversion rate too small" |
| conversionRate | Max: 1.0 | All | "Conversion rate cannot exceed 1.0" |
| sellingPrice | Positive | All | "Selling price must be positive" |
| isDefault | One per recipe | Server | "Exactly one variant must be marked as default" |
| minOrderQuantity | Positive | All | "Min order quantity must be positive" |
| maxOrderQuantity | Positive | All | "Max order quantity must be positive" |
| maxOrderQuantity | >= minOrderQuantity | All | "Maximum cannot be less than minimum" |

---

## 4. Business Rule Validations

### BR-REC-001: Recipe Code Uniqueness
- **Client**: Auto-generated with uniqueness check
- **Server**: Database query before insert/update
- **Database**: UNIQUE constraint

### BR-REC-002: Recipe Name Uniqueness (Case-Insensitive)
- **Client**: Debounced async check (500ms)
- **Server**: Case-insensitive database query
- **Database**: UNIQUE constraint with case-insensitive index

### BR-REC-003: Category and Cuisine Active Status
- **Client**: Filter dropdown to show only active
- **Server**: Validate active status before save
- **Database**: Foreign key constraint

### BR-REC-004: Minimum Ingredients and Steps
- **Client**: Form validation (at least 1 each)
- **Server**: Array length validation
- **Database**: No constraint (application logic)

### BR-REC-005: Circular Dependency Prevention
- **Client**: Not checked (too complex)
- **Server**: Recursive graph traversal
- **Database**: No constraint (application logic)

### BR-REC-006: Maximum Nesting Depth (3 Levels)
- **Client**: Not checked (requires server data)
- **Server**: Recursive depth calculation
- **Database**: No constraint (application logic)

### BR-REC-007: Sub-Recipe Must Be Published
- **Client**: Filter sub-recipe search to published only
- **Server**: Validate sub-recipe status
- **Database**: No constraint (application logic)

### BR-REC-008: Fractional Sales Variant Requirements
- **Client**: Conditional validation based on allowsFractionalSales
- **Server**: Validate variant count and default marking
- **Database**: Unique index on (recipe_id, is_default) WHERE is_default = true

### BR-REC-009: Sequential Step Numbering
- **Client**: Auto-assign step numbers
- **Server**: Validate sequential numbering
- **Database**: UNIQUE constraint on (recipe_id, step_number)

### BR-REC-010: Publish Requirements
- **Client**: Pre-publish checklist UI
- **Server**: Comprehensive validation function
- **Database**: No constraint (application logic)

### BR-REC-011: Deletion with Published Status (BLOCKING)
- **Server**: Check status, block if published
- **Database**: No constraint (application logic)

### BR-REC-012: Deletion with Sub-Recipe Usage (BLOCKING)
- **Server**: Count usage in other recipes, block if found
- **Database**: Foreign key constraint with RESTRICT

### BR-REC-013: Status Transition Rules
- **Client**: UI shows valid transitions only
- **Server**: Validate transition validity
- **Database**: No constraint (application logic)

### BR-REC-014: Cost Calculation Integrity
- **Client**: Real-time calculation on changes
- **Server**: Recalculate on save
- **Database**: CHECK constraints on non-negative costs

### BR-REC-015: Yield Variant Pricing Logic
- **Client**: Warning for illogical pricing (8 slices > whole)
- **Server**: Log warnings, allow override
- **Database**: No constraint (application logic)

---

## 5. Validation Test Cases

### Create Recipe Tests

```typescript
describe("Create Recipe Validation", () => {
  it("should reject empty name", async () => {
    const input = { ...validInput, name: "" }
    const result = createRecipeSchema.safeParse(input)
    expect(result.success).toBe(false)
    expect(result.error?.errors[0]?.message).toContain("name is required")
  })

  it("should reject name shorter than 2 characters", async () => {
    const input = { ...validInput, name: "A" }
    const result = createRecipeSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("should reject empty ingredients array", async () => {
    const input = { ...validInput, ingredients: [] }
    const result = createRecipeSchema.safeParse(input)
    expect(result.success).toBe(false)
    expect(result.error?.errors[0]?.message).toContain("at least one ingredient")
  })

  it("should reject empty steps array", async () => {
    const input = { ...validInput, steps: [] }
    const result = createRecipeSchema.safeParse(input)
    expect(result.success).toBe(false)
    expect(result.error?.errors[0]?.message).toContain("at least one preparation step")
  })

  it("should reject non-sequential step numbers", async () => {
    const input = {
      ...validInput,
      steps: [
        { stepNumber: 1, description: 'Step 1' },
        { stepNumber: 3, description: 'Step 3' } // Missing step 2
      ]
    }
    const result = createRecipeSchema.safeParse(input)
    expect(result.success).toBe(false)
    expect(result.error?.errors[0]?.message).toContain("sequential")
  })

  it("should reject fractional sales without variants", async () => {
    const input = {
      ...validInput,
      allowsFractionalSales: true,
      yieldVariants: []
    }
    const result = createRecipeSchema.safeParse(input)
    expect(result.success).toBe(false)
    expect(result.error?.errors[0]?.message).toContain("yield variants")
  })

  it("should reject yield variants without default", async () => {
    const input = {
      ...validInput,
      allowsFractionalSales: true,
      yieldVariants: [
        { variantName: 'Half', conversionRate: 0.5, isDefault: false },
        { variantName: 'Whole', conversionRate: 1.0, isDefault: false }
      ]
    }
    const result = createRecipeSchema.safeParse(input)
    expect(result.success).toBe(false)
    expect(result.error?.errors[0]?.message).toContain("default")
  })

  it("should reject total time exceeding 96 hours", async () => {
    const input = {
      ...validInput,
      prepTime: 3000, // 50 hours
      cookTime: 3000  // 50 hours (total 100 hours)
    }
    const result = createRecipeSchema.safeParse(input)
    expect(result.success).toBe(false)
    expect(result.error?.errors[0]?.message).toContain("96 hours")
  })

  it("should accept valid recipe data", async () => {
    const result = createRecipeSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })
})
```

### Ingredient Validation Tests

```typescript
describe("Ingredient Validation", () => {
  it("should reject product ingredient without productId", async () => {
    const input = {
      ingredientType: 'product',
      productId: null,
      quantity: 100,
      unit: 'g'
    }
    const result = ingredientSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("should reject recipe ingredient without subRecipeId", async () => {
    const input = {
      ingredientType: 'recipe',
      subRecipeId: null,
      quantity: 1,
      unit: 'portion'
    }
    const result = ingredientSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("should reject negative quantity", async () => {
    const input = { ...validIngredient, quantity: -10 }
    const result = ingredientSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("should reject wastage percentage > 100", async () => {
    const input = { ...validIngredient, wastagePercentage: 150 }
    const result = ingredientSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})
```

### Circular Dependency Tests

```typescript
describe("Circular Dependency Validation", () => {
  it("should detect direct circular dependency", async () => {
    const recipeA = await createTestRecipe({ name: "Recipe A" })
    const recipeB = await createTestRecipe({
      name: "Recipe B",
      ingredients: [{ ingredientType: 'recipe', subRecipeId: recipeA.id }]
    })

    // Try to add Recipe B as ingredient to Recipe A
    const hasCircular = await checkCircularDependency(recipeA.id, recipeB.id)
    expect(hasCircular).toBe(true)
  })

  it("should detect indirect circular dependency (A → B → C → A)", async () => {
    const recipeA = await createTestRecipe({ name: "Recipe A" })
    const recipeB = await createTestRecipe({
      name: "Recipe B",
      ingredients: [{ ingredientType: 'recipe', subRecipeId: recipeA.id }]
    })
    const recipeC = await createTestRecipe({
      name: "Recipe C",
      ingredients: [{ ingredientType: 'recipe', subRecipeId: recipeB.id }]
    })

    // Try to add Recipe C as ingredient to Recipe A
    const hasCircular = await checkCircularDependency(recipeA.id, recipeC.id)
    expect(hasCircular).toBe(true)
  })

  it("should allow valid sub-recipe chain (no circular)", async () => {
    const recipeA = await createTestRecipe({ name: "Recipe A" })
    const recipeB = await createTestRecipe({
      name: "Recipe B",
      ingredients: [{ ingredientType: 'recipe', subRecipeId: recipeA.id }]
    })
    const recipeC = await createTestRecipe({ name: "Recipe C" })

    // Recipe B → A is valid, so C → B should also be valid
    const hasCircular = await checkCircularDependency(recipeC.id, recipeB.id)
    expect(hasCircular).toBe(false)
  })
})
```

### Nesting Depth Tests

```typescript
describe("Nesting Depth Validation", () => {
  it("should block nesting depth > 3", async () => {
    const level1 = await createTestRecipe({ name: "Level 1" })
    const level2 = await createTestRecipe({
      name: "Level 2",
      ingredients: [{ ingredientType: 'recipe', subRecipeId: level1.id }]
    })
    const level3 = await createTestRecipe({
      name: "Level 3",
      ingredients: [{ ingredientType: 'recipe', subRecipeId: level2.id }]
    })
    const level4 = await createTestRecipe({
      name: "Level 4",
      ingredients: [{ ingredientType: 'recipe', subRecipeId: level3.id }]
    })

    const depth = await getRecipeNestingDepth(level4.id)
    expect(depth).toBeGreaterThanOrEqual(3)

    const validation = await validateCreateRecipe({
      ...validInput,
      ingredients: [{ ingredientType: 'recipe', subRecipeId: level4.id }]
    })

    expect(validation.success).toBe(false)
    expect(validation.error).toContain("nesting depth")
  })
})
```

### Publish Validation Tests

```typescript
describe("Publish Recipe Validation", () => {
  it("should block publish without ingredients", async () => {
    const recipe = await createTestRecipe({
      ingredients: [],
      status: 'draft'
    })

    const result = await validatePublishRequirements(recipe.id)
    expect(result.success).toBe(false)
    expect(result.errors).toContain("at least one ingredient")
  })

  it("should block publish without steps", async () => {
    const recipe = await createTestRecipe({
      steps: [],
      status: 'draft'
    })

    const result = await validatePublishRequirements(recipe.id)
    expect(result.success).toBe(false)
    expect(result.errors).toContain("at least one preparation step")
  })

  it("should block publish with zero costs", async () => {
    const recipe = await createTestRecipe({
      totalIngredientCost: 0,
      status: 'draft'
    })

    const result = await validatePublishRequirements(recipe.id)
    expect(result.success).toBe(false)
    expect(result.errors).toContain("costs must be calculated")
  })

  it("should block publish with inactive ingredient", async () => {
    const inactiveProduct = await createTestProduct({ status: 'inactive' })
    const recipe = await createTestRecipe({
      ingredients: [{ ingredientType: 'product', productId: inactiveProduct.id }],
      status: 'draft'
    })

    const result = await validatePublishRequirements(recipe.id)
    expect(result.success).toBe(false)
    expect(result.errors).toContain("inactive")
  })

  it("should allow publish when all requirements met", async () => {
    const recipe = await createValidTestRecipe({ status: 'draft' })
    const result = await validatePublishRequirements(recipe.id)
    expect(result.success).toBe(true)
  })
})
```

### Delete Validation Tests

```typescript
describe("Delete Recipe Validation", () => {
  it("should block deletion of published recipe", async () => {
    const recipe = await createTestRecipe({ status: 'published' })
    const result = await validateDeleteRecipe(recipe.id)
    expect(result.success).toBe(false)
    expect(result.blocked).toBe(true)
    expect(result.error).toContain("published")
  })

  it("should block deletion when used as sub-recipe", async () => {
    const subRecipe = await createTestRecipe({ status: 'published' })
    const parentRecipe = await createTestRecipe({
      ingredients: [{ ingredientType: 'recipe', subRecipeId: subRecipe.id }],
      status: 'published'
    })

    // Try to delete sub-recipe
    const result = await validateDeleteRecipe(subRecipe.id)
    expect(result.success).toBe(false)
    expect(result.blocked).toBe(true)
    expect(result.error).toContain("used as an ingredient")
  })

  it("should warn about order history", async () => {
    const recipe = await createTestRecipe({ status: 'archived' })
    await createTestOrder({ recipeId: recipe.id }) // Create order history

    const result = await validateDeleteRecipe(recipe.id)
    expect(result.success).toBe(false)
    expect(result.warning).toBe(true)
    expect(result.requiresConfirmation).toBe(true)
  })

  it("should allow deletion of draft recipe without dependencies", async () => {
    const recipe = await createTestRecipe({ status: 'draft' })
    const result = await validateDeleteRecipe(recipe.id)
    expect(result.success).toBe(true)
  })
})
```

---

## 6. Error Messages

### Validation Error Messages

```typescript
export const validationErrors = {
  // Required fields
  required: (field: string) => `${field} is required`,

  // Length constraints
  minLength: (field: string, min: number) =>
    `${field} must be at least ${min} character${min === 1 ? '' : 's'}`,
  maxLength: (field: string, max: number) =>
    `${field} cannot exceed ${max} characters`,

  // Format constraints
  invalidFormat: (field: string, pattern?: string) =>
    pattern
      ? `${field} format is invalid. Expected: ${pattern}`
      : `${field} format is invalid`,

  // Range constraints
  minValue: (field: string, min: number) => `${field} must be at least ${min}`,
  maxValue: (field: string, max: number) => `${field} cannot exceed ${max}`,
  positive: (field: string) => `${field} must be positive`,
  nonNegative: (field: string) => `${field} cannot be negative`,

  // Uniqueness
  duplicate: (field: string, value: string) => `${field} "${value}" is already in use`,

  // Type validation
  invalidType: (field: string, expectedType: string) =>
    `${field} must be ${expectedType}`,

  // Enum validation
  invalidEnum: (field: string, validValues: string[]) =>
    `${field} must be one of: ${validValues.join(', ')}`,

  // Array validation
  minItems: (field: string, min: number) =>
    `${field} must have at least ${min} item${min === 1 ? '' : 's'}`,
  maxItems: (field: string, max: number) =>
    `${field} cannot have more than ${max} items`,
}
```

### Business Rule Error Messages

```typescript
export const businessRuleErrors = {
  // Recipe errors
  circularDependency: (ingredientName: string) =>
    `Circular dependency detected with: ${ingredientName}. A recipe cannot use itself as an ingredient, directly or indirectly.`,

  maxNestingDepth: (ingredientName: string) =>
    `Maximum nesting depth (3 levels) exceeded for: ${ingredientName}. Sub-recipes can only be nested 3 levels deep.`,

  subRecipeNotPublished: (ingredientName: string) =>
    `Sub-recipe "${ingredientName}" must be published before it can be used as an ingredient.`,

  // Publish errors
  publishRequirementsNotMet: (errors: string[]) =>
    `Recipe cannot be published:\n${errors.map(e => `• ${e}`).join('\n')}`,

  ingredientInactive: (ingredientName: string) =>
    `Ingredient "${ingredientName}" is inactive and cannot be used in published recipes.`,

  // Status transition errors
  invalidStatusTransition: (from: string, to: string) =>
    `Invalid status transition from ${from} to ${to}`,

  // Deletion errors
  cannotDeletePublished: () =>
    `Cannot delete published recipe. Please archive it first.`,

  recipeUsedAsSubRecipe: (count: number, recipes: string[]) =>
    `Cannot delete recipe. It is used as an ingredient in ${count} published recipe(s):\n${recipes.join(', ')}`,

  recipeUsedInMenus: (count: number) =>
    `Cannot delete recipe. It is used in ${count} active menu(s).`,

  recipeHasOrderHistory: () =>
    `⚠️ This recipe has order history. Deletion will preserve historical data but remove the recipe from active use.`,

  // Yield variant errors
  noDefaultVariant: () =>
    `Exactly one yield variant must be marked as default.`,

  insufficientVariants: () =>
    `At least 2 yield variants are required when fractional sales is enabled.`,

  illogicalPricing: (variantName: string, comparisonName: string) =>
    `⚠️ Pricing may be illogical: ${variantName} costs more than ${comparisonName}. Please review your pricing strategy.`,

  // Cost calculation errors
  missingCostData: (ingredientName: string) =>
    `Cannot calculate costs: Missing cost data for ${ingredientName}`,

  invalidWastagePercentage: (ingredientName: string) =>
    `Invalid wastage percentage for ${ingredientName}. Must be between 0 and 100.`,

  // Step errors
  nonSequentialSteps: (missing: number) =>
    `Step numbers must be sequential. Missing step ${missing}.`,

  duplicateStepNumber: (stepNumber: number) =>
    `Step number ${stepNumber} is already used.`,
}
```

### User-Friendly Error Messages

```typescript
export const userFriendlyErrors = {
  // Network errors
  networkError: () =>
    "Unable to connect. Please check your internet connection and try again.",

  // Server errors
  serverError: () =>
    "Something went wrong on our end. Please try again in a few moments.",

  // Timeout errors
  timeoutError: () =>
    "The request took too long. Please try again.",

  // Validation errors
  validationError: () =>
    "Please check the highlighted fields and correct any errors.",

  // Permission errors
  permissionDenied: (action: string) =>
    `You don't have permission to ${action}. Please contact your administrator.`,

  // Not found errors
  notFound: (entity: string) =>
    `${entity} not found. It may have been deleted.`,

  // Conflict errors
  conflict: () =>
    "This item has been modified by someone else. Please refresh and try again.",
}
```

---

## 7. Performance Optimization

### Debouncing Async Validations

```typescript
import { useDebouncedCallback } from 'use-debounce'

// Recipe name uniqueness check
const checkNameUniqueness = useDebouncedCallback(async (name: string) => {
  if (name.length < 2) return
  try {
    const exists = await checkRecipeNameExists(name)
    setNameAvailable(!exists)
  } catch (error) {
    console.error('Name check failed:', error)
  }
}, 500)

// Recipe code uniqueness check
const checkCodeUniqueness = useDebouncedCallback(async (code: string) => {
  if (code.length < 3) return
  try {
    const exists = await checkRecipeCodeExists(code)
    setCodeAvailable(!exists)
  } catch (error) {
    console.error('Code check failed:', error)
  }
}, 500)
```

### Validation Caching

```typescript
import { LRUCache } from 'lru-cache'

// Cache validation results to avoid redundant server calls
const validationCache = new LRUCache<string, boolean>({
  max: 1000,
  ttl: 1000 * 60 * 5 // 5 minutes
})

async function checkRecipeNameExists(name: string): Promise<boolean> {
  const cacheKey = `recipe:name:${name.toLowerCase()}`

  // Check cache first
  const cached = validationCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  // Fetch from server
  const exists = await api.checkRecipeNameExists(name)

  // Cache result
  validationCache.set(cacheKey, exists)

  return exists
}
```

### Batch Validation

```typescript
// Validate multiple ingredients in a single request
async function validateIngredientsBatch(
  ingredients: Ingredient[]
): Promise<Map<string, ValidationResult>> {
  const productIds = ingredients
    .filter(i => i.ingredientType === 'product')
    .map(i => i.productId)

  const recipeIds = ingredients
    .filter(i => i.ingredientType === 'recipe')
    .map(i => i.subRecipeId)

  // Batch check product existence and status
  const [productStatuses, recipeStatuses] = await Promise.all([
    api.checkProductsStatus(productIds),
    api.checkRecipesStatus(recipeIds)
  ])

  // Build validation results map
  const results = new Map<string, ValidationResult>()

  for (const ingredient of ingredients) {
    if (ingredient.ingredientType === 'product') {
      const status = productStatuses.get(ingredient.productId)
      results.set(ingredient.id, {
        success: status?.exists && status?.active,
        error: !status?.exists
          ? "Product not found"
          : !status?.active
          ? "Product is inactive"
          : undefined
      })
    } else {
      const status = recipeStatuses.get(ingredient.subRecipeId)
      results.set(ingredient.id, {
        success: status?.exists && status?.published,
        error: !status?.exists
          ? "Sub-recipe not found"
          : !status?.published
          ? "Sub-recipe must be published"
          : undefined
      })
    }
  }

  return results
}
```

### Progressive Validation

```typescript
// Validate fields as user progresses through tabs
function useProgressiveValidation() {
  const [validatedTabs, setValidatedTabs] = useState<Set<string>>(new Set())

  const validateTab = useCallback(async (tabName: string, data: any) => {
    switch (tabName) {
      case 'basic':
        const basicResult = recipeSchema.pick({
          name: true,
          description: true,
          categoryId: true,
          cuisineId: true,
          difficulty: true,
          baseYield: true,
          baseYieldUnit: true
        }).safeParse(data)

        if (basicResult.success) {
          setValidatedTabs(prev => new Set([...prev, 'basic']))
        }
        return basicResult

      case 'ingredients':
        const ingredientsResult = z.object({
          ingredients: z.array(ingredientSchema).min(1)
        }).safeParse(data)

        if (ingredientsResult.success) {
          setValidatedTabs(prev => new Set([...prev, 'ingredients']))
        }
        return ingredientsResult

      case 'preparation':
        const stepsResult = z.object({
          steps: z.array(preparationStepSchema).min(1)
        }).safeParse(data)

        if (stepsResult.success) {
          setValidatedTabs(prev => new Set([...prev, 'preparation']))
        }
        return stepsResult

      case 'cost':
        // Cost validation happens automatically via calculations
        setValidatedTabs(prev => new Set([...prev, 'cost']))
        return { success: true }

      case 'details':
        const detailsResult = z.object({
          yieldVariants: z.array(yieldVariantSchema).optional(),
          allergens: z.array(z.string()).optional(),
          tags: z.array(z.string()).optional()
        }).safeParse(data)

        if (detailsResult.success) {
          setValidatedTabs(prev => new Set([...prev, 'details']))
        }
        return detailsResult
    }
  }, [])

  return {
    validatedTabs,
    validateTab,
    allTabsValid: validatedTabs.size === 5 // All 5 tabs validated
  }
}
```

---

## 8. Security Considerations

### Input Sanitization

```typescript
import DOMPurify from 'dompurify'

// Sanitize HTML in rich text fields
function sanitizeRecipeDescription(description: string): string {
  return DOMPurify.sanitize(description, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  })
}

// Sanitize file names
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255)
}
```

### SQL Injection Prevention

All database queries use Prisma ORM with parameterized queries. Raw SQL is never used.

```typescript
// Safe - Parameterized query
await prisma.recipe.findFirst({
  where: {
    name: { equals: userInput, mode: 'insensitive' }
  }
})

// NEVER do this:
// await prisma.$queryRaw`SELECT * FROM recipes WHERE name = '${userInput}'`
```

### XSS Prevention

```typescript
// All user input is escaped in React by default
// Additional sanitization for rich text
<div dangerouslySetInnerHTML={{
  __html: sanitizeRecipeDescription(recipe.description)
}} />
```

### CSRF Protection

All mutations require authentication and use SameSite cookies with CSRF tokens.

### Rate Limiting

```typescript
// Server-side rate limiting for validation endpoints
import rateLimit from 'express-rate-limit'

const validationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many validation requests, please try again later'
})

app.use('/api/validate', validationLimiter)
```

### File Upload Validation

```typescript
// Validate file uploads
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function validateFileUpload(file: File): Promise<ValidationResult> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  // Check mime type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    }
  }

  // Additional checks: scan for malware, validate image headers, etc.

  return { success: true }
}
```

---
