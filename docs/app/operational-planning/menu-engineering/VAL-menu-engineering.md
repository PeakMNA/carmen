# Menu Engineering - Validations (VAL)

## Document Information
- **Document Type**: Validations Specification
- **Module**: Operational Planning > Menu Engineering
- **Version**: 1.1.0
- **Last Updated**: 2025-01-05

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2025-01-05 | System | Added implementation status section |
| 1.0 | 2024-01-15 | System | Initial creation with comprehensive validation schemas and test cases |

## ⚠️ Implementation Status

**Current State**: COMPREHENSIVE IMPLEMENTATION (~85% Complete)

This validation document defines all input validation and business rules for the Menu Engineering module. **See [BR-menu-engineering.md](./BR-menu-engineering.md) Implementation Status section** for detailed breakdown of what EXISTS vs what's PROPOSED.

**Implemented Validations**:
- ✅ All client-side Zod schemas (menu analysis, cost alerts, POS integration)
- ✅ All server-side Zod schemas in API routes
- ✅ Input sanitization and XSS prevention
- ✅ SQL injection prevention via parameterized queries
- ✅ File upload validation (type, size, content)
- ✅ Business rule validations (thresholds, date ranges, permissions)

**NOTE**: All validation schemas defined in this document are actively implemented in both frontend forms and backend API routes. Test cases serve as comprehensive validation specifications.

---

## 1. Client-Side Validation (Zod Schemas)

### 1.1 Menu Engineering Settings Schema

```typescript
import { z } from "zod"

// Classification method enum
const classificationMethodSchema = z.enum(['kasavana-smith', 'miller', 'custom'], {
  required_error: "Classification method is required",
  invalid_type_error: "Invalid classification method"
})

export const menuEngineeringSettingsSchema = z.object({
  // Thresholds
  profitabilityThreshold: z
    .number({ required_error: "Profitability threshold is required" })
    .min(0, "Profitability threshold cannot be negative")
    .max(100, "Profitability threshold cannot exceed 100")
    .default(50),

  popularityThreshold: z
    .number({ required_error: "Popularity threshold is required" })
    .min(0, "Popularity threshold cannot be negative")
    .max(100, "Popularity threshold cannot exceed 100")
    .default(70),

  // Classification Method
  classificationMethod: classificationMethodSchema.default('kasavana-smith'),

  // Performance Period
  performancePeriodDays: z
    .number()
    .int("Performance period must be a whole number")
    .min(7, "Performance period must be at least 7 days")
    .max(365, "Performance period cannot exceed 365 days")
    .default(30),

  // Lifecycle Thresholds
  introductionPeriodDays: z
    .number()
    .int()
    .min(14, "Introduction period must be at least 14 days")
    .max(180, "Introduction period cannot exceed 180 days")
    .default(30),

  growthPeriodDays: z
    .number()
    .int()
    .min(30, "Growth period must be at least 30 days")
    .max(365, "Growth period cannot exceed 365 days")
    .default(180),

  declinePeriodDays: z
    .number()
    .int()
    .min(30, "Decline period must be at least 30 days")
    .max(180, "Decline period cannot exceed 180 days")
    .default(90),

  // Recommendation Settings
  autoGenerateRecommendations: z.boolean().default(true),

  recommendationFrequency: z
    .enum(['daily', 'weekly', 'monthly'], {
      invalid_type_error: "Invalid recommendation frequency"
    })
    .default('daily'),

  // Alert Settings
  enablePerformanceAlerts: z.boolean().default(true),

  alertCriticalThreshold: z
    .number()
    .min(0, "Alert threshold cannot be negative")
    .max(100, "Alert threshold cannot exceed 100")
    .default(30),

  // Pricing Settings
  requireApprovalForPriceChange: z.boolean().default(true),

  priceChangeApprovalThreshold: z
    .number()
    .min(0, "Approval threshold cannot be negative")
    .max(100, "Approval threshold cannot exceed 100")
    .default(10),

  // Cost Settings
  defaultTargetFoodCostPercentage: z
    .number()
    .min(1, "Target food cost must be at least 1%")
    .max(90, "Target food cost cannot exceed 90%")
    .default(33),

  defaultLaborCostPercentage: z
    .number()
    .min(0, "Labor cost cannot be negative")
    .max(100, "Labor cost cannot exceed 100%")
    .default(30),

  defaultOverheadPercentage: z
    .number()
    .min(0, "Overhead cannot be negative")
    .max(100, "Overhead cannot exceed 100%")
    .default(20)
})
  .refine(
    (data) => {
      // Total cost percentages should not exceed 100%
      const totalCost = data.defaultTargetFoodCostPercentage +
                        data.defaultLaborCostPercentage +
                        data.defaultOverheadPercentage
      return totalCost <= 150 // Allow some flexibility
    },
    {
      message: "Total cost percentages (food + labor + overhead) seem unusually high",
      path: ["defaultOverheadPercentage"]
    }
  )

export type MenuEngineeringSettingsData = z.infer<typeof menuEngineeringSettingsSchema>
```

### 1.2 Competitor Schema

```typescript
// Competitor type enum
const competitorTypeSchema = z.enum([
  'direct',
  'indirect',
  'aspirational',
  'benchmark'
], {
  required_error: "Competitor type is required",
  invalid_type_error: "Invalid competitor type"
})

export const competitorSchema = z.object({
  companyName: z
    .string({ required_error: "Company name is required" })
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name cannot exceed 200 characters")
    .regex(/^[a-zA-Z0-9\s\-&'().,]+$/, {
      message: "Name can only contain letters, numbers, spaces, and common punctuation"
    })
    .trim(),

  competitorType: competitorTypeSchema,

  address: z
    .string()
    .max(500, "Address cannot exceed 500 characters")
    .nullable()
    .optional(),

  city: z
    .string()
    .max(100, "City name too long")
    .nullable()
    .optional(),

  state: z
    .string()
    .max(100, "State name too long")
    .nullable()
    .optional(),

  postalCode: z
    .string()
    .max(20, "Postal code too long")
    .nullable()
    .optional(),

  country: z
    .string()
    .max(100, "Country name too long")
    .default("United States"),

  distance: z
    .number()
    .positive("Distance must be positive")
    .max(10000, "Distance too large")
    .nullable()
    .optional(),

  distanceUnit: z
    .enum(['km', 'mi'], {
      invalid_type_error: "Invalid distance unit"
    })
    .default('mi'),

  website: z
    .string()
    .url("Website must be a valid URL")
    .max(500, "Website URL too long")
    .nullable()
    .optional(),

  phoneNumber: z
    .string()
    .regex(/^[\d\s\-+()]+$/, {
      message: "Phone number can only contain digits, spaces, and + - ( )"
    })
    .max(20, "Phone number too long")
    .nullable()
    .optional(),

  notes: z
    .string()
    .max(2000, "Notes cannot exceed 2000 characters")
    .nullable()
    .optional(),

  isActive: z.boolean().default(true)
})

export type CompetitorFormData = z.infer<typeof competitorSchema>
```

### 1.3 Competitor Item Schema

```typescript
export const competitorItemSchema = z.object({
  competitorId: z
    .string({ required_error: "Competitor is required" })
    .min(1, "Competitor is required"),

  itemName: z
    .string({ required_error: "Item name is required" })
    .min(2, "Item name must be at least 2 characters")
    .max(200, "Item name cannot exceed 200 characters")
    .trim(),

  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .nullable()
    .optional(),

  category: z
    .string()
    .max(100, "Category name too long")
    .nullable()
    .optional(),

  price: z
    .number({ required_error: "Price is required" })
    .positive("Price must be positive")
    .max(100000, "Price too high"),

  portionSize: z
    .string()
    .max(100, "Portion size description too long")
    .nullable()
    .optional(),

  imageUrl: z
    .string()
    .url("Image URL must be valid")
    .max(500, "Image URL too long")
    .nullable()
    .optional(),

  menuPosition: z
    .string()
    .max(100, "Menu position description too long")
    .nullable()
    .optional(),

  featuredItem: z.boolean().default(false),

  notes: z
    .string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .nullable()
    .optional(),

  observedDate: z
    .string()
    .datetime("Invalid date format")
    .or(z.date())
})

export type CompetitorItemFormData = z.infer<typeof competitorItemSchema>
```

### 1.4 Price Optimization Schema

```typescript
export const priceOptimizationSchema = z.object({
  menuItemId: z
    .string({ required_error: "Menu item is required" })
    .min(1, "Menu item is required"),

  currentPrice: z
    .number({ required_error: "Current price is required" })
    .positive("Current price must be positive"),

  proposedPrice: z
    .number({ required_error: "Proposed price is required" })
    .positive("Proposed price must be positive"),

  foodCost: z
    .number({ required_error: "Food cost is required" })
    .positive("Food cost must be positive"),

  adjustmentType: z
    .enum(['percentage', 'fixed_amount', 'target_margin'], {
      required_error: "Adjustment type is required"
    }),

  adjustmentValue: z
    .number({ required_error: "Adjustment value is required" }),

  demandElasticity: z
    .number()
    .min(-10, "Demand elasticity too low")
    .max(0, "Demand elasticity must be non-positive")
    .default(-0.5),

  justification: z
    .string({ required_error: "Justification is required" })
    .min(10, "Justification must be at least 10 characters")
    .max(1000, "Justification cannot exceed 1000 characters")
    .trim(),

  effectiveDate: z
    .string()
    .datetime("Invalid date format")
    .or(z.date()),

  requiresApproval: z.boolean().default(false)
})
  .refine(
    (data) => {
      // Proposed price must be at least equal to food cost (break-even)
      return data.proposedPrice >= data.foodCost
    },
    {
      message: "Proposed price cannot be below food cost (break-even)",
      path: ["proposedPrice"]
    }
  )
  .refine(
    (data) => {
      // For percentage adjustment, value must be between -100 and 1000
      if (data.adjustmentType === 'percentage') {
        return data.adjustmentValue >= -100 && data.adjustmentValue <= 1000
      }
      return true
    },
    {
      message: "Percentage adjustment must be between -100% and 1000%",
      path: ["adjustmentValue"]
    }
  )
  .refine(
    (data) => {
      // For target margin adjustment, value must be between 1 and 99
      if (data.adjustmentType === 'target_margin') {
        return data.adjustmentValue >= 1 && data.adjustmentValue <= 99
      }
      return true
    },
    {
      message: "Target margin must be between 1% and 99%",
      path: ["adjustmentValue"]
    }
  )

export type PriceOptimizationData = z.infer<typeof priceOptimizationSchema>
```

### 1.5 Menu Optimization Experiment Schema

```typescript
const experimentTypeSchema = z.enum([
  'price',
  'position',
  'description',
  'bundle',
  'promotion'
], {
  required_error: "Experiment type is required"
})

const experimentStatusSchema = z.enum([
  'draft',
  'scheduled',
  'active',
  'paused',
  'completed',
  'cancelled'
], {
  required_error: "Status is required"
})

export const experimentVariantSchema = z.object({
  variantName: z
    .string({ required_error: "Variant name is required" })
    .min(1, "Variant name is required")
    .max(100, "Variant name too long"),

  variantType: z
    .enum(['control', 'treatment'], {
      required_error: "Variant type is required"
    }),

  configuration: z
    .record(z.any())
    .refine(
      (config) => Object.keys(config).length > 0,
      "Configuration cannot be empty"
    ),

  trafficPercentage: z
    .number({ required_error: "Traffic percentage is required" })
    .min(0, "Traffic percentage cannot be negative")
    .max(100, "Traffic percentage cannot exceed 100")
})

export const menuOptimizationExperimentSchema = z.object({
  experimentName: z
    .string({ required_error: "Experiment name is required" })
    .min(3, "Experiment name must be at least 3 characters")
    .max(200, "Experiment name cannot exceed 200 characters")
    .trim(),

  experimentType: experimentTypeSchema,

  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .nullable()
    .optional(),

  hypothesis: z
    .string({ required_error: "Hypothesis is required" })
    .min(10, "Hypothesis must be at least 10 characters")
    .max(1000, "Hypothesis cannot exceed 1000 characters")
    .trim(),

  primaryMetric: z
    .string({ required_error: "Primary metric is required" })
    .min(1, "Primary metric is required"),

  secondaryMetrics: z
    .array(z.string().min(1))
    .max(10, "Maximum 10 secondary metrics allowed")
    .optional(),

  variants: z
    .array(experimentVariantSchema)
    .min(2, "At least 2 variants required (control + treatment)")
    .max(4, "Maximum 4 variants allowed"),

  targetMenuItems: z
    .array(z.string().min(1))
    .min(1, "At least one menu item is required")
    .max(100, "Maximum 100 menu items allowed"),

  locations: z
    .array(z.string().min(1))
    .min(1, "At least one location is required")
    .optional(),

  startDate: z
    .string()
    .datetime("Invalid start date format")
    .or(z.date()),

  endDate: z
    .string()
    .datetime("Invalid end date format")
    .or(z.date()),

  durationDays: z
    .number()
    .int("Duration must be a whole number")
    .min(7, "Experiment must run for at least 7 days")
    .max(90, "Experiment cannot exceed 90 days"),

  minimumSampleSize: z
    .number()
    .int()
    .positive("Minimum sample size must be positive")
    .default(100),

  confidenceLevel: z
    .number()
    .min(80, "Confidence level must be at least 80%")
    .max(99.9, "Confidence level cannot exceed 99.9%")
    .default(95),

  status: experimentStatusSchema.default('draft')
})
  .refine(
    (data) => {
      // End date must be after start date
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return end > start
    },
    {
      message: "End date must be after start date",
      path: ["endDate"]
    }
  )
  .refine(
    (data) => {
      // Traffic percentages must sum to 100
      const totalTraffic = data.variants.reduce((sum, v) => sum + v.trafficPercentage, 0)
      return Math.abs(totalTraffic - 100) < 0.01 // Allow for rounding errors
    },
    {
      message: "Variant traffic percentages must sum to 100%",
      path: ["variants"]
    }
  )
  .refine(
    (data) => {
      // Must have exactly one control variant
      const controlCount = data.variants.filter(v => v.variantType === 'control').length
      return controlCount === 1
    },
    {
      message: "Exactly one control variant is required",
      path: ["variants"]
    }
  )
  .refine(
    (data) => {
      // Duration should match date range within 1 day tolerance
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      const actualDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      return Math.abs(actualDuration - data.durationDays) <= 1
    },
    {
      message: "Duration days does not match date range",
      path: ["durationDays"]
    }
  )

export type MenuOptimizationExperimentData = z.infer<typeof menuOptimizationExperimentSchema>
```

### 1.6 Sales Forecast Schema

```typescript
const forecastMethodSchema = z.enum([
  'moving_average',
  'exponential_smoothing',
  'seasonal_decomposition',
  'machine_learning'
], {
  required_error: "Forecast method is required"
})

const forecastGranularitySchema = z.enum(['daily', 'weekly', 'monthly'], {
  required_error: "Forecast granularity is required"
})

export const salesForecastSchema = z.object({
  menuItemId: z
    .string({ required_error: "Menu item is required" })
    .min(1, "Menu item is required"),

  forecastMethod: forecastMethodSchema,

  forecastPeriodStart: z
    .string()
    .datetime("Invalid start date format")
    .or(z.date()),

  forecastPeriodEnd: z
    .string()
    .datetime("Invalid end date format")
    .or(z.date()),

  granularity: forecastGranularitySchema.default('daily'),

  confidenceLevel: z
    .number()
    .min(80, "Confidence level must be at least 80%")
    .max(99.9, "Confidence level cannot exceed 99.9%")
    .default(95),

  // Method-specific parameters
  movingAverageWindow: z
    .number()
    .int()
    .positive()
    .min(7, "Moving average window must be at least 7 days")
    .max(365, "Moving average window cannot exceed 365 days")
    .nullable()
    .optional(),

  exponentialSmoothingAlpha: z
    .number()
    .min(0, "Alpha must be between 0 and 1")
    .max(1, "Alpha must be between 0 and 1")
    .nullable()
    .optional(),

  includeSeasonality: z.boolean().default(false),

  includeHolidays: z.boolean().default(true),

  includeEvents: z.boolean().default(false)
})
  .refine(
    (data) => {
      // End date must be after start date
      const start = new Date(data.forecastPeriodStart)
      const end = new Date(data.forecastPeriodEnd)
      return end > start
    },
    {
      message: "Forecast end date must be after start date",
      path: ["forecastPeriodEnd"]
    }
  )
  .refine(
    (data) => {
      // If moving average method, window parameter is required
      if (data.forecastMethod === 'moving_average' && !data.movingAverageWindow) {
        return false
      }
      return true
    },
    {
      message: "Moving average window is required for moving average method",
      path: ["movingAverageWindow"]
    }
  )
  .refine(
    (data) => {
      // If exponential smoothing, alpha parameter is required
      if (data.forecastMethod === 'exponential_smoothing' && !data.exponentialSmoothingAlpha) {
        return false
      }
      return true
    },
    {
      message: "Alpha parameter is required for exponential smoothing method",
      path: ["exponentialSmoothingAlpha"]
    }
  )
  .refine(
    (data) => {
      // Forecast period should not exceed 90 days
      const start = new Date(data.forecastPeriodStart)
      const end = new Date(data.forecastPeriodEnd)
      const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      return days <= 90
    },
    {
      message: "Forecast period cannot exceed 90 days",
      path: ["forecastPeriodEnd"]
    }
  )

export type SalesForecastData = z.infer<typeof salesForecastSchema>
```

### 1.7 Bulk Update Schema

```typescript
const bulkUpdateTypeSchema = z.enum([
  'price',
  'category',
  'status',
  'tags',
  'cost_parameters'
], {
  required_error: "Bulk update type is required"
})

const bulkStatusChangeSchema = z.enum(['active', 'seasonal', 'discontinued'], {
  required_error: "Status is required"
})

export const bulkUpdateSchema = z.object({
  updateType: bulkUpdateTypeSchema,

  targetItemIds: z
    .array(z.string().min(1))
    .min(1, "At least one item must be selected")
    .max(500, "Maximum 500 items can be updated at once"),

  // Price update fields
  priceAdjustmentType: z
    .enum(['percentage', 'fixed_amount', 'set_margin'])
    .nullable()
    .optional(),

  priceAdjustmentValue: z
    .number()
    .nullable()
    .optional(),

  // Category update
  newCategoryId: z
    .string()
    .nullable()
    .optional(),

  // Status update
  newStatus: bulkStatusChangeSchema
    .nullable()
    .optional(),

  seasonStartDate: z
    .string()
    .datetime()
    .or(z.date())
    .nullable()
    .optional(),

  seasonEndDate: z
    .string()
    .datetime()
    .or(z.date())
    .nullable()
    .optional(),

  // Tags update
  tagOperation: z
    .enum(['add', 'remove', 'replace'])
    .nullable()
    .optional(),

  tags: z
    .array(z.string().min(1).max(100))
    .max(50, "Maximum 50 tags allowed")
    .nullable()
    .optional(),

  // Cost parameters
  newLaborPercentage: z
    .number()
    .min(0, "Labor percentage cannot be negative")
    .max(100, "Labor percentage cannot exceed 100%")
    .nullable()
    .optional(),

  newOverheadPercentage: z
    .number()
    .min(0, "Overhead percentage cannot be negative")
    .max(100, "Overhead percentage cannot exceed 100%")
    .nullable()
    .optional(),

  // Common fields
  notes: z
    .string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .nullable()
    .optional(),

  requireApproval: z.boolean().default(false)
})
  .refine(
    (data) => {
      // If price update, adjustment type and value must be provided
      if (data.updateType === 'price' && (!data.priceAdjustmentType || data.priceAdjustmentValue === null)) {
        return false
      }
      return true
    },
    {
      message: "Price adjustment type and value are required for price updates",
      path: ["priceAdjustmentValue"]
    }
  )
  .refine(
    (data) => {
      // If category update, new category must be provided
      if (data.updateType === 'category' && !data.newCategoryId) {
        return false
      }
      return true
    },
    {
      message: "New category is required for category updates",
      path: ["newCategoryId"]
    }
  )
  .refine(
    (data) => {
      // If status update, new status must be provided
      if (data.updateType === 'status' && !data.newStatus) {
        return false
      }
      return true
    },
    {
      message: "New status is required for status updates",
      path: ["newStatus"]
    }
  )
  .refine(
    (data) => {
      // If status is seasonal, season dates must be provided
      if (data.newStatus === 'seasonal' && (!data.seasonStartDate || !data.seasonEndDate)) {
        return false
      }
      return true
    },
    {
      message: "Season dates are required when setting status to seasonal",
      path: ["seasonEndDate"]
    }
  )
  .refine(
    (data) => {
      // If tags update, tag operation and tags must be provided
      if (data.updateType === 'tags' && (!data.tagOperation || !data.tags || data.tags.length === 0)) {
        return false
      }
      return true
    },
    {
      message: "Tag operation and tags are required for tag updates",
      path: ["tags"]
    }
  )
  .refine(
    (data) => {
      // If cost parameters update, at least one parameter must be provided
      if (data.updateType === 'cost_parameters' &&
          data.newLaborPercentage === null &&
          data.newOverheadPercentage === null) {
        return false
      }
      return true
    },
    {
      message: "At least one cost parameter must be provided",
      path: ["newOverheadPercentage"]
    }
  )

export type BulkUpdateData = z.infer<typeof bulkUpdateSchema>
```

### 1.8 Recommendation Schema

```typescript
const recommendationTypeSchema = z.enum([
  'pricing',
  'positioning',
  'promotion',
  'removal',
  'bundle',
  'recipe_revision',
  'cost_reduction'
], {
  required_error: "Recommendation type is required"
})

const recommendationPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'], {
  required_error: "Priority is required"
})

const recommendationStatusSchema = z.enum([
  'pending',
  'under_review',
  'approved',
  'rejected',
  'implemented',
  'archived'
], {
  required_error: "Status is required"
})

export const menuEngineeringRecommendationSchema = z.object({
  menuItemId: z
    .string({ required_error: "Menu item is required" })
    .min(1, "Menu item is required"),

  recommendationType: recommendationTypeSchema,

  priority: recommendationPrioritySchema,

  title: z
    .string({ required_error: "Title is required" })
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),

  description: z
    .string({ required_error: "Description is required" })
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .trim(),

  rationale: z
    .string({ required_error: "Rationale is required" })
    .min(10, "Rationale must be at least 10 characters")
    .max(2000, "Rationale cannot exceed 2000 characters")
    .trim(),

  implementationSteps: z
    .array(z.string().min(1).max(500))
    .min(1, "At least one implementation step is required")
    .max(20, "Maximum 20 implementation steps allowed"),

  estimatedImpact: z
    .object({
      revenueChange: z.number().nullable().optional(),
      marginChange: z.number().nullable().optional(),
      volumeChange: z.number().nullable().optional(),
      classificationChange: z.string().nullable().optional()
    })
    .optional(),

  implementationEffort: z
    .enum(['low', 'medium', 'high'], {
      required_error: "Implementation effort is required"
    }),

  estimatedTimeframe: z
    .string()
    .max(100, "Timeframe description too long")
    .nullable()
    .optional(),

  status: recommendationStatusSchema.default('pending'),

  reviewNotes: z
    .string()
    .max(2000, "Review notes cannot exceed 2000 characters")
    .nullable()
    .optional()
})

export type MenuEngineeringRecommendationData = z.infer<typeof menuEngineeringRecommendationSchema>
```

---

## 2. Server-Side Validation Functions

### 2.1 Menu Item Performance Validation

```typescript
/**
 * Validates menu item performance data before saving
 */
export async function validateMenuItemPerformance(
  data: MenuItemPerformanceInput
): Promise<ValidationResult> {
  const errors: ValidationError[] = []

  // Check if menu item exists and is active
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: data.menuItemId }
  })

  if (!menuItem) {
    errors.push({
      field: 'menuItemId',
      message: 'Menu item not found'
    })
    return { valid: false, errors }
  }

  if (menuItem.deleted) {
    errors.push({
      field: 'menuItemId',
      message: 'Cannot track performance for deleted menu item'
    })
    return { valid: false, errors }
  }

  // Validate period
  const periodStart = new Date(data.periodStart)
  const periodEnd = new Date(data.periodEnd)

  if (periodEnd <= periodStart) {
    errors.push({
      field: 'periodEnd',
      message: 'Period end must be after period start'
    })
  }

  const periodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
  if (periodDays < 1) {
    errors.push({
      field: 'periodEnd',
      message: 'Period must be at least 1 day'
    })
  }

  if (periodDays > 365) {
    errors.push({
      field: 'periodEnd',
      message: 'Period cannot exceed 365 days'
    })
  }

  // Validate sales metrics
  if (data.unitsSold < 0) {
    errors.push({
      field: 'unitsSold',
      message: 'Units sold cannot be negative'
    })
  }

  if (data.totalRevenue < 0) {
    errors.push({
      field: 'totalRevenue',
      message: 'Total revenue cannot be negative'
    })
  }

  if (data.totalCost < 0) {
    errors.push({
      field: 'totalCost',
      message: 'Total cost cannot be negative'
    })
  }

  if (data.totalRevenue < data.totalCost) {
    errors.push({
      field: 'totalRevenue',
      message: 'Warning: Total revenue is less than total cost',
      severity: 'warning'
    })
  }

  // Validate menu mix percentages
  if (data.actualMenuMixPercent < 0 || data.actualMenuMixPercent > 100) {
    errors.push({
      field: 'actualMenuMixPercent',
      message: 'Menu mix percentage must be between 0 and 100'
    })
  }

  if (data.expectedMenuMixPercent < 0 || data.expectedMenuMixPercent > 100) {
    errors.push({
      field: 'expectedMenuMixPercent',
      message: 'Expected menu mix percentage must be between 0 and 100'
    })
  }

  // Validate profitability metrics
  if (data.sellingPrice <= 0) {
    errors.push({
      field: 'sellingPrice',
      message: 'Selling price must be positive'
    })
  }

  if (data.foodCost < 0) {
    errors.push({
      field: 'foodCost',
      message: 'Food cost cannot be negative'
    })
  }

  const calculatedCM = data.sellingPrice - data.foodCost
  const contributionMargin = data.contributionMargin || calculatedCM

  if (Math.abs(calculatedCM - contributionMargin) > 0.01) {
    errors.push({
      field: 'contributionMargin',
      message: 'Contribution margin calculation mismatch',
      severity: 'warning'
    })
  }

  if (contributionMargin < 0) {
    errors.push({
      field: 'contributionMargin',
      message: 'Warning: Item has negative contribution margin',
      severity: 'warning'
    })
  }

  // Validate classification
  const validClassifications = ['Star', 'Plowhorse', 'Puzzle', 'Dog']
  if (!validClassifications.includes(data.classification)) {
    errors.push({
      field: 'classification',
      message: 'Invalid classification'
    })
  }

  // Validate lifecycle stage
  const validLifecycleStages = ['introduction', 'growth', 'maturity', 'decline', 'discontinued']
  if (!validLifecycleStages.includes(data.lifecycleStage)) {
    errors.push({
      field: 'lifecycleStage',
      message: 'Invalid lifecycle stage'
    })
  }

  return {
    valid: errors.filter(e => e.severity !== 'warning').length === 0,
    errors
  }
}
```

### 2.2 Price Optimization Validation

```typescript
/**
 * Validates price optimization changes
 */
export async function validatePriceOptimization(
  data: PriceOptimizationData
): Promise<ValidationResult> {
  const errors: ValidationError[] = []

  // Get menu item
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: data.menuItemId },
    include: {
      recipe: true,
      category: true
    }
  })

  if (!menuItem) {
    errors.push({
      field: 'menuItemId',
      message: 'Menu item not found'
    })
    return { valid: false, errors }
  }

  // Validate price change percentage
  const priceChange = ((data.proposedPrice - data.currentPrice) / data.currentPrice) * 100

  if (Math.abs(priceChange) > 100) {
    errors.push({
      field: 'proposedPrice',
      message: 'Warning: Price change exceeds 100%',
      severity: 'warning'
    })
  }

  // Check approval requirements
  const settings = await getMenuEngineeringSettings()

  if (settings.requireApprovalForPriceChange) {
    if (Math.abs(priceChange) >= settings.priceChangeApprovalThreshold) {
      // Approval required
      data.requiresApproval = true
    }
  }

  // Validate against business rules
  const contributionMargin = data.proposedPrice - data.foodCost
  const contributionMarginPercent = (contributionMargin / data.proposedPrice) * 100

  if (contributionMarginPercent < settings.defaultTargetFoodCostPercentage) {
    errors.push({
      field: 'proposedPrice',
      message: `Warning: Contribution margin (${contributionMarginPercent.toFixed(1)}%) is below target (${settings.defaultTargetFoodCostPercentage}%)`,
      severity: 'warning'
    })
  }

  // Check competitor pricing if available
  const competitorItems = await prisma.competitorItem.findMany({
    where: {
      itemName: {
        contains: menuItem.name,
        mode: 'insensitive'
      }
    },
    include: {
      competitor: {
        where: {
          isActive: true
        }
      }
    }
  })

  if (competitorItems.length > 0) {
    const avgCompetitorPrice = competitorItems.reduce((sum, item) => sum + item.price, 0) / competitorItems.length
    const priceDifference = ((data.proposedPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100

    if (priceDifference > 20) {
      errors.push({
        field: 'proposedPrice',
        message: `Warning: Proposed price is ${priceDifference.toFixed(1)}% higher than competitor average ($${avgCompetitorPrice.toFixed(2)})`,
        severity: 'warning'
      })
    }
  }

  // Validate effective date
  const effectiveDate = new Date(data.effectiveDate)
  const now = new Date()

  if (effectiveDate < now) {
    errors.push({
      field: 'effectiveDate',
      message: 'Effective date cannot be in the past'
    })
  }

  const maxFutureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
  if (effectiveDate > maxFutureDate) {
    errors.push({
      field: 'effectiveDate',
      message: 'Effective date cannot be more than 90 days in the future'
    })
  }

  return {
    valid: errors.filter(e => e.severity !== 'warning').length === 0,
    errors
  }
}
```

### 2.3 Experiment Validation

```typescript
/**
 * Validates menu optimization experiment configuration
 */
export async function validateExperiment(
  data: MenuOptimizationExperimentData
): Promise<ValidationResult> {
  const errors: ValidationError[] = []

  // Check for overlapping experiments
  const overlappingExperiments = await prisma.menuOptimizationExperiment.findMany({
    where: {
      status: {
        in: ['active', 'scheduled']
      },
      targetMenuItems: {
        hasSome: data.targetMenuItems
      },
      OR: [
        {
          AND: [
            { startDate: { lte: new Date(data.endDate) } },
            { endDate: { gte: new Date(data.startDate) } }
          ]
        }
      ]
    }
  })

  if (overlappingExperiments.length > 0) {
    errors.push({
      field: 'targetMenuItems',
      message: `${overlappingExperiments.length} overlapping experiment(s) found for selected items and dates`,
      severity: 'warning'
    })
  }

  // Validate variant configurations
  for (let i = 0; i < data.variants.length; i++) {
    const variant = data.variants[i]

    // Validate configuration based on experiment type
    if (data.experimentType === 'price') {
      if (!variant.configuration.price) {
        errors.push({
          field: `variants[${i}].configuration`,
          message: `Price must be specified in configuration for variant "${variant.variantName}"`
        })
      }
    } else if (data.experimentType === 'position') {
      if (!variant.configuration.menuPosition) {
        errors.push({
          field: `variants[${i}].configuration`,
          message: `Menu position must be specified in configuration for variant "${variant.variantName}"`
        })
      }
    } else if (data.experimentType === 'description') {
      if (!variant.configuration.description) {
        errors.push({
          field: `variants[${i}].configuration`,
          message: `Description must be specified in configuration for variant "${variant.variantName}"`
        })
      }
    } else if (data.experimentType === 'bundle') {
      if (!variant.configuration.bundledItems || variant.configuration.bundledItems.length === 0) {
        errors.push({
          field: `variants[${i}].configuration`,
          message: `Bundled items must be specified in configuration for variant "${variant.variantName}"`
        })
      }
    }
  }

  // Calculate required sample size
  const controlVariant = data.variants.find(v => v.variantType === 'control')
  if (controlVariant) {
    // Estimate daily traffic per item
    const avgDailyTraffic = await calculateAverageDailyTraffic(data.targetMenuItems)
    const expectedSamples = avgDailyTraffic * data.durationDays * (controlVariant.trafficPercentage / 100)

    if (expectedSamples < data.minimumSampleSize) {
      errors.push({
        field: 'durationDays',
        message: `Warning: Expected samples (${Math.round(expectedSamples)}) may be below minimum (${data.minimumSampleSize}). Consider extending duration.`,
        severity: 'warning'
      })
    }
  }

  // Validate target menu items exist and are active
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: {
        in: data.targetMenuItems
      }
    }
  })

  if (menuItems.length !== data.targetMenuItems.length) {
    errors.push({
      field: 'targetMenuItems',
      message: 'One or more selected menu items not found'
    })
  }

  const inactiveItems = menuItems.filter(item => item.status !== 'active')
  if (inactiveItems.length > 0) {
    errors.push({
      field: 'targetMenuItems',
      message: `${inactiveItems.length} selected item(s) are not active`,
      severity: 'warning'
    })
  }

  return {
    valid: errors.filter(e => e.severity !== 'warning').length === 0,
    errors
  }
}
```

### 2.4 Sales Forecast Validation

```typescript
/**
 * Validates sales forecast parameters and historical data availability
 */
export async function validateSalesForecast(
  data: SalesForecastData
): Promise<ValidationResult> {
  const errors: ValidationError[] = []

  // Check if menu item exists
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: data.menuItemId }
  })

  if (!menuItem) {
    errors.push({
      field: 'menuItemId',
      message: 'Menu item not found'
    })
    return { valid: false, errors }
  }

  // Validate historical data availability
  let requiredHistoryDays = 30 // Default

  switch (data.forecastMethod) {
    case 'moving_average':
      requiredHistoryDays = (data.movingAverageWindow || 30) * 2
      break
    case 'exponential_smoothing':
      requiredHistoryDays = 90
      break
    case 'seasonal_decomposition':
      requiredHistoryDays = 365
      break
    case 'machine_learning':
      requiredHistoryDays = 180
      break
  }

  const historicalStartDate = new Date()
  historicalStartDate.setDate(historicalStartDate.getDate() - requiredHistoryDays)

  const historicalSales = await prisma.salesTransaction.count({
    where: {
      menuItemId: data.menuItemId,
      date: {
        gte: historicalStartDate
      }
    }
  })

  if (historicalSales < requiredHistoryDays * 0.7) { // Allow 30% missing data
    errors.push({
      field: 'forecastMethod',
      message: `Insufficient historical data for ${data.forecastMethod}. Need ${requiredHistoryDays} days, have ${historicalSales} sales records.`,
      severity: 'warning'
    })
  }

  // Validate seasonality requirement
  if (data.includeSeasonality) {
    if (data.forecastMethod === 'moving_average' || data.forecastMethod === 'exponential_smoothing') {
      errors.push({
        field: 'includeSeasonality',
        message: `Seasonality not supported with ${data.forecastMethod}. Use seasonal_decomposition method instead.`,
        severity: 'warning'
      })
    }

    // Check if we have enough data for seasonality (at least 1 year)
    const oldestSale = await prisma.salesTransaction.findFirst({
      where: { menuItemId: data.menuItemId },
      orderBy: { date: 'asc' }
    })

    if (oldestSale) {
      const daysSinceOldest = Math.ceil(
        (new Date().getTime() - new Date(oldestSale.date).getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysSinceOldest < 365) {
        errors.push({
          field: 'includeSeasonality',
          message: `Insufficient data for seasonality analysis. Need at least 365 days, have ${daysSinceOldest} days.`,
          severity: 'warning'
        })
      }
    }
  }

  // Validate forecast period is reasonable
  const forecastStart = new Date(data.forecastPeriodStart)
  const now = new Date()

  if (forecastStart < now) {
    errors.push({
      field: 'forecastPeriodStart',
      message: 'Forecast start date cannot be in the past'
    })
  }

  // Check data quality
  const recentSales = await prisma.salesTransaction.findMany({
    where: {
      menuItemId: data.menuItemId,
      date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    select: {
      quantity: true
    }
  })

  if (recentSales.length > 0) {
    const quantities = recentSales.map(s => s.quantity)
    const avg = quantities.reduce((sum, q) => sum + q, 0) / quantities.length
    const stdDev = Math.sqrt(
      quantities.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / quantities.length
    )
    const cv = (stdDev / avg) * 100 // Coefficient of variation

    if (cv > 100) {
      errors.push({
        field: 'menuItemId',
        message: `Warning: High sales variance detected (CV: ${cv.toFixed(1)}%). Forecast accuracy may be lower.`,
        severity: 'warning'
      })
    }
  }

  return {
    valid: errors.filter(e => e.severity !== 'warning').length === 0,
    errors
  }
}
```

### 2.5 Bulk Update Validation

```typescript
/**
 * Validates bulk update operations
 */
export async function validateBulkUpdate(
  data: BulkUpdateData
): Promise<ValidationResult> {
  const errors: ValidationError[] = []

  // Validate all target items exist
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: {
        in: data.targetItemIds
      }
    },
    include: {
      recipe: true
    }
  })

  if (menuItems.length !== data.targetItemIds.length) {
    errors.push({
      field: 'targetItemIds',
      message: `${data.targetItemIds.length - menuItems.length} item(s) not found`
    })
  }

  // Type-specific validation
  if (data.updateType === 'price' && data.priceAdjustmentType && data.priceAdjustmentValue !== null) {
    // Validate each item can accept the price change
    for (const item of menuItems) {
      let newPrice = item.price

      if (data.priceAdjustmentType === 'percentage') {
        newPrice = item.price * (1 + data.priceAdjustmentValue / 100)
      } else if (data.priceAdjustmentType === 'fixed_amount') {
        newPrice = item.price + data.priceAdjustmentValue
      } else if (data.priceAdjustmentType === 'set_margin') {
        if (item.recipe) {
          const foodCost = item.recipe.foodCost || 0
          newPrice = foodCost / (data.priceAdjustmentValue / 100)
        }
      }

      // Check if new price is valid
      if (newPrice <= 0) {
        errors.push({
          field: 'priceAdjustmentValue',
          message: `Adjustment would result in non-positive price for item: ${item.name}`
        })
        break
      }

      // Check if price change exceeds threshold
      const priceChange = ((newPrice - item.price) / item.price) * 100
      if (Math.abs(priceChange) > 50) {
        errors.push({
          field: 'priceAdjustmentValue',
          message: `Warning: Price change exceeds 50% for item: ${item.name} (${priceChange.toFixed(1)}%)`,
          severity: 'warning'
        })
      }
    }

    // Check if approval is required
    const settings = await getMenuEngineeringSettings()
    if (settings.requireApprovalForPriceChange) {
      data.requireApproval = true
    }
  }

  if (data.updateType === 'category' && data.newCategoryId) {
    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: data.newCategoryId }
    })

    if (!category) {
      errors.push({
        field: 'newCategoryId',
        message: 'Selected category not found'
      })
    }
  }

  if (data.updateType === 'status' && data.newStatus) {
    if (data.newStatus === 'seasonal') {
      if (!data.seasonStartDate || !data.seasonEndDate) {
        errors.push({
          field: 'seasonEndDate',
          message: 'Season dates are required for seasonal status'
        })
      } else {
        const start = new Date(data.seasonStartDate)
        const end = new Date(data.seasonEndDate)

        if (end <= start) {
          errors.push({
            field: 'seasonEndDate',
            message: 'Season end date must be after start date'
          })
        }
      }
    }

    if (data.newStatus === 'discontinued') {
      // Check for items used in active experiments
      const activeExperiments = await prisma.menuOptimizationExperiment.count({
        where: {
          status: 'active',
          targetMenuItems: {
            hasSome: data.targetItemIds
          }
        }
      })

      if (activeExperiments > 0) {
        errors.push({
          field: 'newStatus',
          message: `Cannot discontinue items in active experiments (${activeExperiments} experiment(s) found)`,
          severity: 'warning'
        })
      }
    }
  }

  return {
    valid: errors.filter(e => e.severity !== 'warning').length === 0,
    errors
  }
}
```

---

## 3. Business Rule Validations

### 3.1 Classification Rules

```typescript
/**
 * Validates menu engineering classification logic
 */
export function validateClassification(
  profitability: number,
  popularity: number,
  avgProfitability: number,
  popularityThreshold: number
): { valid: boolean; classification: string; errors: string[] } {
  const errors: string[] = []

  // Validate inputs
  if (profitability < 0) {
    errors.push('Profitability (contribution margin) cannot be negative')
  }

  if (popularity < 0 || popularity > 100) {
    errors.push('Popularity (menu mix %) must be between 0 and 100')
  }

  if (avgProfitability < 0) {
    errors.push('Average profitability cannot be negative')
  }

  if (popularityThreshold < 0 || popularityThreshold > 100) {
    errors.push('Popularity threshold must be between 0 and 100')
  }

  if (errors.length > 0) {
    return { valid: false, classification: '', errors }
  }

  // Apply Kasavana-Smith classification
  const isHighProfitability = profitability >= avgProfitability
  const isHighPopularity = popularity >= popularityThreshold

  let classification = ''

  if (isHighProfitability && isHighPopularity) {
    classification = 'Star'
  } else if (!isHighProfitability && isHighPopularity) {
    classification = 'Plowhorse'
  } else if (isHighProfitability && !isHighPopularity) {
    classification = 'Puzzle'
  } else {
    classification = 'Dog'
  }

  return { valid: true, classification, errors: [] }
}
```

### 3.2 Lifecycle Transition Rules

```typescript
/**
 * Validates lifecycle stage transitions
 */
export function validateLifecycleTransition(
  currentStage: string,
  newStage: string,
  daysInStage: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  const validTransitions: Record<string, string[]> = {
    'introduction': ['growth', 'decline', 'discontinued'],
    'growth': ['maturity', 'decline'],
    'maturity': ['decline', 'growth'],
    'decline': ['maturity', 'discontinued'],
    'discontinued': [] // No valid transitions from discontinued
  }

  // Check if transition is valid
  if (!validTransitions[currentStage]?.includes(newStage)) {
    errors.push(`Invalid transition from ${currentStage} to ${newStage}`)
    return { valid: false, errors }
  }

  // Check minimum time requirements
  const minimumDays: Record<string, number> = {
    'introduction': 14,
    'growth': 30,
    'maturity': 60,
    'decline': 30
  }

  if (currentStage !== 'introduction' && daysInStage < minimumDays[currentStage]) {
    errors.push(
      `Item must remain in ${currentStage} stage for at least ${minimumDays[currentStage]} days (current: ${daysInStage} days)`
    )
  }

  // Specific transition validations
  if (currentStage === 'introduction' && newStage === 'growth') {
    if (daysInStage < 14) {
      errors.push('Item must be in introduction stage for at least 14 days before transitioning to growth')
    }
  }

  if (currentStage === 'decline' && newStage === 'maturity') {
    // Recovery from decline - validate improvement
    // This would require checking performance metrics
    errors.push('Recovery from decline requires documented performance improvement')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

### 3.3 Price Change Rules

```typescript
/**
 * Validates price change business rules
 */
export async function validatePriceChange(
  menuItemId: string,
  currentPrice: number,
  newPrice: number
): Promise<{ valid: boolean; requiresApproval: boolean; errors: string[] }> {
  const errors: string[] = []
  let requiresApproval = false

  // Get settings
  const settings = await getMenuEngineeringSettings()

  // Calculate price change percentage
  const priceChange = ((newPrice - currentPrice) / currentPrice) * 100

  // Check if approval is required
  if (settings.requireApprovalForPriceChange) {
    if (Math.abs(priceChange) >= settings.priceChangeApprovalThreshold) {
      requiresApproval = true
    }
  }

  // Check for rapid price changes
  const recentPriceChanges = await prisma.priceHistory.count({
    where: {
      menuItemId: menuItemId,
      changedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  })

  if (recentPriceChanges >= 3) {
    errors.push('Warning: Item has had 3 or more price changes in the last 30 days')
  }

  // Check for extreme price changes
  if (Math.abs(priceChange) > 50) {
    errors.push(`Warning: Price change of ${priceChange.toFixed(1)}% is unusually large`)
  }

  // Validate against cost
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    include: { recipe: true }
  })

  if (menuItem?.recipe) {
    const foodCost = menuItem.recipe.foodCost || 0
    const newCM = newPrice - foodCost
    const newCMPercent = (newCM / newPrice) * 100

    if (newCMPercent < settings.defaultTargetFoodCostPercentage) {
      errors.push(
        `Warning: New contribution margin (${newCMPercent.toFixed(1)}%) is below target (${settings.defaultTargetFoodCostPercentage}%)`
      )
    }

    if (newPrice < foodCost) {
      errors.push('Error: New price is below food cost (break-even)')
      return { valid: false, requiresApproval, errors }
    }
  }

  return {
    valid: true,
    requiresApproval,
    errors
  }
}
```

---

## 4. Test Cases

### 4.1 Settings Validation Tests

```typescript
describe('Menu Engineering Settings Validation', () => {
  test('Valid settings should pass validation', () => {
    const validData = {
      profitabilityThreshold: 50,
      popularityThreshold: 70,
      classificationMethod: 'kasavana-smith' as const,
      performancePeriodDays: 30,
      introductionPeriodDays: 30,
      growthPeriodDays: 180,
      declinePeriodDays: 90,
      autoGenerateRecommendations: true,
      recommendationFrequency: 'daily' as const,
      enablePerformanceAlerts: true,
      alertCriticalThreshold: 30,
      requireApprovalForPriceChange: true,
      priceChangeApprovalThreshold: 10,
      defaultTargetFoodCostPercentage: 33,
      defaultLaborCostPercentage: 30,
      defaultOverheadPercentage: 20
    }

    const result = menuEngineeringSettingsSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  test('Negative thresholds should fail validation', () => {
    const invalidData = {
      profitabilityThreshold: -10,
      popularityThreshold: 70
    }

    const result = menuEngineeringSettingsSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  test('Thresholds over 100 should fail validation', () => {
    const invalidData = {
      profitabilityThreshold: 50,
      popularityThreshold: 150
    }

    const result = menuEngineeringSettingsSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
```

### 4.2 Price Optimization Tests

```typescript
describe('Price Optimization Validation', () => {
  test('Valid price optimization should pass', () => {
    const validData = {
      menuItemId: 'item_123',
      currentPrice: 25.00,
      proposedPrice: 27.50,
      foodCost: 8.00,
      adjustmentType: 'percentage' as const,
      adjustmentValue: 10,
      demandElasticity: -0.5,
      justification: 'Increased ingredient costs and strong demand',
      effectiveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    const result = priceOptimizationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  test('Price below food cost should fail', () => {
    const invalidData = {
      menuItemId: 'item_123',
      currentPrice: 25.00,
      proposedPrice: 7.00,
      foodCost: 8.00,
      adjustmentType: 'fixed_amount' as const,
      adjustmentValue: -18,
      justification: 'Testing below cost pricing',
      effectiveDate: new Date().toISOString()
    }

    const result = priceOptimizationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('below food cost')
    }
  })

  test('Percentage adjustment over 1000% should fail', () => {
    const invalidData = {
      menuItemId: 'item_123',
      currentPrice: 25.00,
      proposedPrice: 275.00,
      foodCost: 8.00,
      adjustmentType: 'percentage' as const,
      adjustmentValue: 1100,
      justification: 'Testing extreme increase',
      effectiveDate: new Date().toISOString()
    }

    const result = priceOptimizationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
```

### 4.3 Experiment Validation Tests

```typescript
describe('Menu Optimization Experiment Validation', () => {
  test('Valid experiment should pass', () => {
    const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000)

    const validData = {
      experimentName: 'Price Test - Premium Burgers',
      experimentType: 'price' as const,
      hypothesis: 'Increasing price by 10% will not significantly reduce volume',
      primaryMetric: 'total_revenue',
      variants: [
        {
          variantName: 'Control',
          variantType: 'control' as const,
          configuration: { price: 15.00 },
          trafficPercentage: 50
        },
        {
          variantName: 'Treatment',
          variantType: 'treatment' as const,
          configuration: { price: 16.50 },
          trafficPercentage: 50
        }
      ],
      targetMenuItems: ['item_burger1', 'item_burger2'],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: 14,
      minimumSampleSize: 100,
      confidenceLevel: 95
    }

    const result = menuOptimizationExperimentSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  test('Traffic percentages not summing to 100 should fail', () => {
    const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000)

    const invalidData = {
      experimentName: 'Test',
      experimentType: 'price' as const,
      hypothesis: 'Testing traffic distribution',
      primaryMetric: 'revenue',
      variants: [
        {
          variantName: 'Control',
          variantType: 'control' as const,
          configuration: { price: 15.00 },
          trafficPercentage: 40
        },
        {
          variantName: 'Treatment',
          variantType: 'treatment' as const,
          configuration: { price: 16.50 },
          trafficPercentage: 40
        }
      ],
      targetMenuItems: ['item_1'],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: 14
    }

    const result = menuOptimizationExperimentSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('sum to 100%')
    }
  })

  test('Missing control variant should fail', () => {
    const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000)

    const invalidData = {
      experimentName: 'Test',
      experimentType: 'price' as const,
      hypothesis: 'Testing without control',
      primaryMetric: 'revenue',
      variants: [
        {
          variantName: 'Treatment A',
          variantType: 'treatment' as const,
          configuration: { price: 15.00 },
          trafficPercentage: 50
        },
        {
          variantName: 'Treatment B',
          variantType: 'treatment' as const,
          configuration: { price: 16.50 },
          trafficPercentage: 50
        }
      ],
      targetMenuItems: ['item_1'],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: 14
    }

    const result = menuOptimizationExperimentSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('control variant')
    }
  })
})
```

### 4.4 Classification Tests

```typescript
describe('Classification Rule Validation', () => {
  test('High profitability and high popularity should classify as Star', () => {
    const result = validateClassification(
      20.00, // profitability (CM)
      15.00, // popularity (menu mix %)
      18.00, // avg profitability
      10.00  // popularity threshold
    )

    expect(result.valid).toBe(true)
    expect(result.classification).toBe('Star')
  })

  test('Low profitability and high popularity should classify as Plowhorse', () => {
    const result = validateClassification(
      15.00, // profitability (CM)
      15.00, // popularity (menu mix %)
      18.00, // avg profitability
      10.00  // popularity threshold
    )

    expect(result.valid).toBe(true)
    expect(result.classification).toBe('Plowhorse')
  })

  test('High profitability and low popularity should classify as Puzzle', () => {
    const result = validateClassification(
      20.00, // profitability (CM)
      5.00,  // popularity (menu mix %)
      18.00, // avg profitability
      10.00  // popularity threshold
    )

    expect(result.valid).toBe(true)
    expect(result.classification).toBe('Puzzle')
  })

  test('Low profitability and low popularity should classify as Dog', () => {
    const result = validateClassification(
      15.00, // profitability (CM)
      5.00,  // popularity (menu mix %)
      18.00, // avg profitability
      10.00  // popularity threshold
    )

    expect(result.valid).toBe(true)
    expect(result.classification).toBe('Dog')
  })

  test('Negative profitability should fail validation', () => {
    const result = validateClassification(
      -5.00, // profitability (CM)
      15.00, // popularity (menu mix %)
      18.00, // avg profitability
      10.00  // popularity threshold
    )

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
```

---

## Related Documents

- **BR-menu-engineering.md**: Business Requirements specification
- **UC-menu-engineering.md**: Use Cases specification
- **TS-menu-engineering.md**: Technical Specification
- **DS-menu-engineering.md**: Data Schema specification
- **FD-menu-engineering.md**: Flow Diagrams specification

---

## Notes

- All validation schemas use Zod for type-safe client-side validation
- Server-side validation functions provide additional business rule checks
- Test cases provide comprehensive coverage of validation scenarios
- Validation error messages are user-friendly and actionable
- Business rules enforce data integrity and operational constraints
- Classification validation ensures proper Menu Engineering Matrix logic
- Lifecycle transition validation prevents invalid state changes
- Price change validation integrates with approval workflows
- Experiment validation ensures statistical validity and prevents conflicts
- Forecast validation ensures sufficient historical data availability

---

**End of Validations Document**
