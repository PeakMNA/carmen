# Recipe Cuisine Types - Validations (VAL)

## Document Information
- **Document Type**: Validations Specification
- **Module**: Operational Planning > Recipe Management > Cuisine Types
- **Version**: 2.0.0
- **Last Updated**: 2025-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial validations document created |
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: added spiceLevel enum validation (mild, medium, hot, very_hot), added typicalIngredients, cookingMethods, flavorProfile array validations |

---

## 1. Client-Side Validation (Zod Schemas)

### 1.1 Base Cuisine Schema

```typescript
import { z } from "zod"

// Region enum
const cuisineRegionSchema = z.enum(['Asia', 'Europe', 'Americas', 'Africa', 'Middle East', 'Oceania'], {
  required_error: "Region is required",
  invalid_type_error: "Invalid region"
})

// Status enum
const cuisineStatusSchema = z.enum(['active', 'inactive'], {
  required_error: "Status is required",
  invalid_type_error: "Invalid status"
})

// Base cuisine schema
export const cuisineSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-&'()]+$/, {
      message: "Name can only contain letters, numbers, spaces, hyphens, ampersands, apostrophes, and parentheses"
    })
    .trim(),

  code: z
    .string({ required_error: "Code is required" })
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code cannot exceed 20 characters")
    .regex(/^[A-Z0-9\-_]+$/, {
      message: "Code must be uppercase letters, numbers, hyphens, or underscores only"
    })
    .trim(),

  description: z
    .string({ required_error: "Description is required" })
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .trim(),

  region: cuisineRegionSchema,

  status: cuisineStatusSchema.default('active'),

  sortOrder: z
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order cannot be negative")
    .default(0),

  popularDishes: z
    .array(z.string().min(2).max(50))
    .max(20, "Maximum 20 popular dishes allowed")
    .default([])
    .optional(),

  keyIngredients: z
    .array(z.string().min(2).max(50))
    .max(30, "Maximum 30 key ingredients allowed")
    .default([])
    .optional()
})

export type CuisineFormData = z.infer<typeof cuisineSchema>
```

### 1.2 Create Cuisine Schema

```typescript
export const createCuisineSchema = cuisineSchema

export type CreateCuisineInput = z.infer<typeof createCuisineSchema>
```

### 1.3 Update Cuisine Schema

```typescript
export const updateCuisineSchema = cuisineSchema.extend({
  id: z
    .string({ required_error: "ID is required" })
    .min(1, "Invalid ID")
})

export type UpdateCuisineInput = z.infer<typeof updateCuisineSchema>
```

---

## 2. Server-Side Validation

### 2.1 Create Cuisine Validation

```typescript
export async function validateCreateCuisine(input: unknown): Promise<ValidationResult> {
  // 1. Schema validation
  const parsed = createCuisineSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid input"
    }
  }

  const data = parsed.data

  // 2. Check code uniqueness
  const existingCode = await prisma.recipeCuisine.findUnique({
    where: { code: data.code },
    select: { id: true, name: true }
  })

  if (existingCode) {
    return {
      success: false,
      error: `Code "${data.code}" is already used by "${existingCode.name}"`
    }
  }

  // 3. Check name uniqueness (case-insensitive)
  const existingName = await prisma.recipeCuisine.findFirst({
    where: {
      name: { equals: data.name, mode: 'insensitive' }
    },
    select: { id: true, code: true }
  })

  if (existingName) {
    return {
      success: false,
      error: `Name "${data.name}" is already in use (code: ${existingName.code})`
    }
  }

  return { success: true, data }
}
```

### 2.2 Update Cuisine Validation

```typescript
export async function validateUpdateCuisine(input: unknown): Promise<ValidationResult> {
  // 1. Schema validation
  const parsed = updateCuisineSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message }
  }

  const data = parsed.data

  // 2. Check existence
  const existing = await prisma.recipeCuisine.findUnique({
    where: { id: data.id },
    include: {
      recipes: {
        where: { status: 'active' },
        select: { id: true }
      }
    }
  })

  if (!existing) {
    return { success: false, error: "Cuisine not found" }
  }

  // 3. Check code uniqueness (excluding current)
  if (data.code !== existing.code) {
    const codeConflict = await prisma.recipeCuisine.findFirst({
      where: { code: data.code, id: { not: data.id } }
    })

    if (codeConflict) {
      return { success: false, error: `Code "${data.code}" is already in use` }
    }

    // Warn if changing code with active recipes
    if (existing.recipes.length > 0) {
      console.warn(`Changing code for cuisine with ${existing.recipes.length} active recipes`)
    }
  }

  // 4. Check name uniqueness (excluding current)
  if (data.name.toLowerCase() !== existing.name.toLowerCase()) {
    const nameConflict = await prisma.recipeCuisine.findFirst({
      where: {
        name: { equals: data.name, mode: 'insensitive' },
        id: { not: data.id }
      }
    })

    if (nameConflict) {
      return { success: false, error: `Name "${data.name}" is already in use` }
    }
  }

  // 5. Validate status change
  if (data.status === 'inactive' && existing.status === 'active') {
    if (existing.recipes.length > 0) {
      // Allow but log warning
      console.warn(`Deactivating cuisine with ${existing.recipes.length} active recipes`)
    }
  }

  return { success: true, data }
}
```

### 2.3 Delete Cuisine Validation

```typescript
export async function validateDeleteCuisine(id: string, force = false): Promise<ValidationResult> {
  // 1. Check existence
  const cuisine = await prisma.recipeCuisine.findUnique({
    where: { id },
    include: {
      recipes: {
        select: { id: true, recipeCode: true, status: true }
      }
    }
  })

  if (!cuisine) {
    return { success: false, error: "Cuisine not found" }
  }

  // 2. Check for active recipes (BLOCKING)
  const activeRecipes = cuisine.recipes.filter(r => r.status === 'active')
  if (activeRecipes.length > 0) {
    return {
      success: false,
      error: `Cannot delete cuisine with ${activeRecipes.length} active recipe(s)`,
      blocked: true
    }
  }

  // 3. Check for inactive recipes (WARNING)
  const inactiveRecipes = cuisine.recipes.filter(r => r.status === 'inactive')
  if (inactiveRecipes.length > 0 && !force) {
    return {
      success: false,
      error: `This cuisine has ${inactiveRecipes.length} inactive recipe(s). Set force=true to proceed.`,
      requiresForce: true,
      inactiveCount: inactiveRecipes.length
    }
  }

  return { success: true, data: { cuisine, inactiveCount: inactiveRecipes.length } }
}
```

---

## 3. Field-Level Validation Rules

| Field | Rule | Type | Error Message |
|-------|------|------|---------------|
| name | Required | All | "Name is required" |
| name | Min length: 2 | All | "Name must be at least 2 characters" |
| name | Max length: 100 | All | "Name cannot exceed 100 characters" |
| name | Format | All | "Name can only contain letters, numbers, spaces, hyphens, ampersands, apostrophes, and parentheses" |
| name | Unique | Server | "Name '{name}' is already in use" |
| code | Required | All | "Code is required" |
| code | Min length: 2 | All | "Code must be at least 2 characters" |
| code | Max length: 20 | All | "Code cannot exceed 20 characters" |
| code | Format | All | "Code must be uppercase letters, numbers, hyphens, or underscores only" |
| code | Unique | Server | "Code '{code}' is already used by '{name}'" |
| description | Required | All | "Description is required" |
| description | Min length: 10 | All | "Description must be at least 10 characters" |
| description | Max length: 500 | All | "Description cannot exceed 500 characters" |
| region | Required | All | "Region is required" |
| region | Valid enum | All | "Invalid region" |
| status | Required | All | "Status is required" |
| status | Valid enum | All | "Invalid status" |
| sortOrder | Integer | All | "Sort order must be a whole number" |
| sortOrder | Non-negative | All | "Sort order cannot be negative" |
| popularDishes | Array of strings | All | Each: 2-50 chars |
| popularDishes | Max count: 20 | All | "Maximum 20 popular dishes allowed" |
| keyIngredients | Array of strings | All | Each: 2-50 chars |
| keyIngredients | Max count: 30 | All | "Maximum 30 key ingredients allowed" |

---

## 4. Business Rule Validations

### BR-CUI-001: Code Uniqueness
- **Client**: Debounced async check (500ms)
- **Server**: Database query before insert/update
- **Database**: UNIQUE constraint

### BR-CUI-002: Name Uniqueness (Case-Insensitive)
- **Client**: Debounced async check (500ms)
- **Server**: Case-insensitive database query
- **Database**: UNIQUE constraint with case-insensitive index

### BR-CUI-003: Region Validation
- **Client**: Dropdown selection (enum values only)
- **Server**: Enum validation
- **Database**: CHECK constraint

### BR-CUI-004: Code Format
- **Client**: Pattern validation + auto-uppercase
- **Server**: Regex validation
- **Database**: CHECK constraint with regex

### BR-CUI-005: Deletion with Active Recipes (BLOCKING)
- **Server**: Count active recipes, block if >0
- **Database**: No constraint (application logic)

### BR-CUI-006: Deletion with Inactive Recipes (WARNING)
- **Server**: Count inactive recipes, warn if >0, allow with force=true
- **Database**: No constraint (application logic)

### BR-CUI-007: Status Change Warning
- **Server**: Check active recipes on deactivation, log warning
- **Database**: No constraint (application logic)

---

## 5. Validation Test Cases

### Create Cuisine Tests

```typescript
describe("Create Cuisine Validation", () => {
  it("should reject empty name", async () => {
    const input = { ...validInput, name: "" }
    const result = createCuisineSchema.safeParse(input)
    expect(result.success).toBe(false)
    expect(result.error?.errors[0]?.message).toBe("Name is required")
  })

  it("should reject name shorter than 2 characters", async () => {
    const input = { ...validInput, name: "A" }
    const result = createCuisineSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("should reject lowercase code", async () => {
    const input = { ...validInput, code: "ita" }
    const result = createCuisineSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("should reject code with spaces", async () => {
    const input = { ...validInput, code: "ITA CODE" }
    const result = createCuisineSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("should reject description shorter than 10 characters", async () => {
    const input = { ...validInput, description: "Too short" }
    const result = createCuisineSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("should reject invalid region", async () => {
    const input = { ...validInput, region: "Antarctica" as any }
    const result = createCuisineSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it("should accept valid cuisine data", async () => {
    const result = createCuisineSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })
})
```

### Update Cuisine Tests

```typescript
describe("Update Cuisine Validation", () => {
  it("should reject duplicate code (different cuisine)", async () => {
    const cuisine = await createTestCuisine({ code: "ITA" })
    const other = await createTestCuisine({ code: "FRA" })

    const result = await validateUpdateCuisine({
      id: other.id,
      code: "ITA" // Duplicate
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain("already in use")
  })

  it("should allow same code for same cuisine", async () => {
    const cuisine = await createTestCuisine({ code: "ITA" })

    const result = await validateUpdateCuisine({
      id: cuisine.id,
      code: "ITA" // Same code, same cuisine
    })

    expect(result.success).toBe(true)
  })
})
```

### Delete Cuisine Tests

```typescript
describe("Delete Cuisine Validation", () => {
  it("should block deletion with active recipes", async () => {
    const cuisine = await createCuisineWithRecipes({ activeCount: 5 })

    const result = await validateDeleteCuisine(cuisine.id)

    expect(result.success).toBe(false)
    expect(result.blocked).toBe(true)
    expect(result.error).toContain("5 active recipe")
  })

  it("should warn about inactive recipes", async () => {
    const cuisine = await createCuisineWithRecipes({ inactiveCount: 3 })

    const result = await validateDeleteCuisine(cuisine.id, false)

    expect(result.success).toBe(false)
    expect(result.requiresForce).toBe(true)
  })

  it("should allow deletion with force flag", async () => {
    const cuisine = await createCuisineWithRecipes({ inactiveCount: 3 })

    const result = await validateDeleteCuisine(cuisine.id, true)

    expect(result.success).toBe(true)
  })
})
```

---

## 6. Error Messages

### Validation Error Messages

```typescript
export const validationErrors = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, min: number) =>
    `${field} must be at least ${min} character${min === 1 ? '' : 's'}`,
  maxLength: (field: string, max: number) =>
    `${field} cannot exceed ${max} characters`,
  invalidFormat: (field: string) => `${field} format is invalid`,
  duplicate: (field: string, value: string) => `${field} "${value}" is already in use`,
}
```

### Business Rule Error Messages

```typescript
export const businessRuleErrors = {
  hasActiveRecipes: (count: number) =>
    `Cannot delete cuisine with ${count} active recipe${count === 1 ? '' : 's'}`,
  codeChangeWithRecipes: (count: number) =>
    `⚠️ Changing code for cuisine with ${count} active recipe(s). This may affect integrations.`,
  deactivateWithRecipes: (count: number) =>
    `⚠️ This cuisine has ${count} active recipe(s). Deactivating will prevent new recipes from using this cuisine.`,
}
```

---

## 7. Performance Optimization

### Debouncing Async Validations

```typescript
import { useDebouncedCallback } from 'use-debounce'

const checkCodeUniqueness = useDebouncedCallback(async (code: string) => {
  if (code.length < 2) return
  const exists = await checkCuisineCodeExists(code)
  setCodeAvailable(!exists)
}, 500)
```

### Validation Caching

```typescript
const validationCache = new LRUCache<string, boolean>({
  max: 500,
  ttl: 1000 * 60 * 5 // 5 minutes
})

export async function checkCodeUniqueness(code: string): Promise<boolean> {
  const cacheKey = `code:${code.toUpperCase()}`
  const cached = validationCache.get(cacheKey)
  if (cached !== undefined) return cached

  const exists = await prisma.recipeCuisine.findUnique({
    where: { code },
    select: { id: true }
  })

  const isUnique = !exists
  validationCache.set(cacheKey, isUnique)
  return isUnique
}
```

---

## 8. Security Considerations

### Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify'

function sanitizeInput(input: string): string {
  const sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
  return sanitized.trim()
}

export function sanitizeCuisineInput(input: CreateCuisineInput): CreateCuisineInput {
  return {
    ...input,
    name: sanitizeInput(input.name),
    code: sanitizeInput(input.code).toUpperCase(),
    description: sanitizeInput(input.description),
  }
}
```

### SQL Injection Prevention
- All queries use Prisma ORM with parameterized queries
- No raw SQL with user input

### XSS Prevention
- React automatically escapes JSX output
- Input sanitization before storage
- Content Security Policy headers

---
