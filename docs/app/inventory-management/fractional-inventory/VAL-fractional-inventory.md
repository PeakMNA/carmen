# Validations: Fractional Inventory Management

## Document Information
- **Module**: Inventory Management - Fractional Inventory
- **Component**: Fractional Inventory Management and Conversion Operations
- **Version**: 1.0.0
- **Last Updated**: 2025-01-12
- **Status**: Complete

## Related Documents
- [Business Requirements](./BR-fractional-inventory.md)
- [Use Cases](./UC-fractional-inventory.md)
- [Technical Specification](./TS-fractional-inventory.md)
- [Data Schema](./DS-fractional-inventory.md)
- [Flow Diagrams](./FD-fractional-inventory.md)
- [Data Structure Gaps](./data-structure-gaps.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Introduction

### 1.1 Purpose

This document defines comprehensive validation rules for the Fractional Inventory Management sub-module, including field-level validations, business rule validations, Zod schemas, database constraints, and error messaging standards.

### 1.2 Validation Layers

```
┌─────────────────────────────────────────────────────┐
│           Client-Side Validation (Zod)             │
│  - Immediate feedback                              │
│  - Type safety                                     │
│  - Format validation                               │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│         Server-Side Validation (Zod + Business)    │
│  - Re-validate all inputs                          │
│  - Business rule enforcement                       │
│  - Cross-field validation                          │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│        Database Constraints (PostgreSQL)           │
│  - Data integrity                                  │
│  - Referential integrity                           │
│  - Check constraints                               │
└─────────────────────────────────────────────────────┘
```

### 1.3 Validation Strategy

**Fail Fast Principle**:
- Validate at the earliest possible point
- Provide clear, actionable error messages
- Log validation failures for monitoring
- Never trust client-side validation alone

**Error Handling Strategy**:
- Field-level errors displayed inline
- Form-level errors displayed at top
- Critical errors logged to error tracking service
- User-friendly messages with technical details in logs

---

## 2. Field-Level Validations

### 2.1 Fractional Item Fields

#### item_code
- **Type**: String (VARCHAR)
- **Required**: Yes
- **Min Length**: 3
- **Max Length**: 50
- **Pattern**: Alphanumeric with hyphens, must match product catalog code
- **Validation Rules**:
  - Must exist in tb_product
  - Cannot be changed after creation
  - Must be unique
- **Error Messages**:
  - `ITEM_CODE_REQUIRED`: "Item code is required"
  - `ITEM_CODE_INVALID_FORMAT`: "Item code must be 3-50 alphanumeric characters"
  - `ITEM_CODE_NOT_FOUND`: "Item code does not exist in product catalog"
  - `ITEM_CODE_DUPLICATE`: "This item is already configured for fractional tracking"

#### item_name
- **Type**: String (VARCHAR)
- **Required**: Yes
- **Min Length**: 2
- **Max Length**: 200
- **Validation Rules**:
  - Cannot be empty or whitespace only
  - Should match product name from catalog
- **Error Messages**:
  - `ITEM_NAME_REQUIRED`: "Item name is required"
  - `ITEM_NAME_TOO_SHORT`: "Item name must be at least 2 characters"
  - `ITEM_NAME_TOO_LONG`: "Item name cannot exceed 200 characters"

#### available_portions (JSONB Array)
- **Type**: JSON Array of PortionSize objects
- **Required**: Yes
- **Min Items**: 1
- **Max Items**: 10
- **Validation Rules**:
  - At least one portion size must be defined
  - Each portion must have unique id
  - portions_per_whole must be > 0
  - At least one portion must be active
  - display_order must be unique and sequential
- **Error Messages**:
  - `PORTIONS_REQUIRED`: "At least one portion size must be defined"
  - `PORTION_ID_DUPLICATE`: "Portion IDs must be unique"
  - `PORTIONS_PER_WHOLE_INVALID`: "Portions per whole must be greater than 0"
  - `NO_ACTIVE_PORTIONS`: "At least one portion size must be active"

**PortionSize Object Validation**:
```typescript
{
  id: string (UUID), // Required, unique
  name: string,      // Required, 1-50 chars
  portions_per_whole: number, // Required, > 0, <= 1000
  display_order: number,      // Required, > 0
  is_active: boolean          // Required
}
```

#### shelf_life_hours
- **Type**: Integer
- **Required**: Yes
- **Min**: 1
- **Max**: 8760 (1 year)
- **Validation Rules**:
  - Must be greater than max_quality_hours
  - Must be reasonable for item type
- **Error Messages**:
  - `SHELF_LIFE_REQUIRED`: "Shelf life hours is required"
  - `SHELF_LIFE_TOO_LOW`: "Shelf life must be at least 1 hour"
  - `SHELF_LIFE_TOO_HIGH`: "Shelf life cannot exceed 8760 hours (1 year)"
  - `SHELF_LIFE_INVALID_RANGE`: "Shelf life must be greater than max quality hours"

#### max_quality_hours
- **Type**: Integer
- **Required**: Yes
- **Min**: 1
- **Max**: shelf_life_hours
- **Validation Rules**:
  - Must be less than or equal to shelf_life_hours
  - Cannot be 0
- **Error Messages**:
  - `MAX_QUALITY_REQUIRED`: "Max quality hours is required"
  - `MAX_QUALITY_TOO_LOW`: "Max quality hours must be at least 1 hour"
  - `MAX_QUALITY_EXCEEDS_SHELF_LIFE`: "Max quality hours cannot exceed shelf life hours"

#### expected_waste_percent
- **Type**: Decimal(5,2)
- **Required**: No
- **Default**: 0.00
- **Min**: 0.00
- **Max**: 100.00
- **Validation Rules**:
  - Must be between 0 and 100
  - Typically should be < 25% (warning if higher)
- **Error Messages**:
  - `WASTE_PERCENT_INVALID_RANGE`: "Waste percentage must be between 0 and 100"
  - `WASTE_PERCENT_HIGH_WARNING`: "Warning: Waste percentage above 25% is unusually high"

#### base_cost_per_unit
- **Type**: Decimal(10,4)
- **Required**: Yes
- **Min**: 0.01
- **Max**: 999999.9999
- **Validation Rules**:
  - Must be greater than 0
  - Should match product cost from catalog
- **Error Messages**:
  - `BASE_COST_REQUIRED`: "Base cost per unit is required"
  - `BASE_COST_TOO_LOW`: "Base cost must be greater than 0"
  - `BASE_COST_TOO_HIGH`: "Base cost cannot exceed 999,999.9999"

#### conversion_cost_per_unit
- **Type**: Decimal(10,4)
- **Required**: No
- **Default**: 0.00
- **Min**: 0.00
- **Max**: 999999.9999
- **Validation Rules**:
  - Cannot be negative
  - Should be reasonable compared to base_cost
- **Error Messages**:
  - `CONVERSION_COST_NEGATIVE`: "Conversion cost cannot be negative"
  - `CONVERSION_COST_TOO_HIGH`: "Conversion cost cannot exceed 999,999.9999"

#### min_portion_threshold
- **Type**: Integer
- **Required**: No (only if auto_conversion_enabled = true)
- **Min**: 1
- **Max**: 10000
- **Validation Rules**:
  - Required if auto_conversion_enabled is true
  - Must be reasonable for item type
- **Error Messages**:
  - `THRESHOLD_REQUIRED_FOR_AUTO`: "Minimum portion threshold is required when auto-conversion is enabled"
  - `THRESHOLD_TOO_LOW`: "Threshold must be at least 1"
  - `THRESHOLD_TOO_HIGH`: "Threshold cannot exceed 10,000"

---

### 2.2 Fractional Stock Fields

#### whole_units
- **Type**: Integer
- **Required**: Yes
- **Default**: 0
- **Min**: 0
- **Max**: 999999
- **Validation Rules**:
  - Cannot be negative
  - Must be consistent with total_portions
- **Error Messages**:
  - `WHOLE_UNITS_NEGATIVE`: "Whole units cannot be negative"
  - `WHOLE_UNITS_TOO_HIGH`: "Whole units cannot exceed 999,999"

#### partial_quantity
- **Type**: Decimal(10,4)
- **Required**: Yes
- **Default**: 0.00
- **Min**: 0.00
- **Max**: 0.99
- **Validation Rules**:
  - Must be >= 0.00 and < 1.00
  - Represents fractional portion of whole unit
- **Error Messages**:
  - `PARTIAL_QTY_NEGATIVE`: "Partial quantity cannot be negative"
  - `PARTIAL_QTY_TOO_HIGH`: "Partial quantity must be less than 1.00"

#### total_portions
- **Type**: Decimal(10,4)
- **Required**: Yes
- **Default**: 0.00
- **Min**: 0.00
- **Max**: 9999999.9999
- **Validation Rules**:
  - Cannot be negative
  - Should equal: (whole_units + partial_quantity) * portions_per_whole
- **Error Messages**:
  - `TOTAL_PORTIONS_NEGATIVE`: "Total portions cannot be negative"
  - `TOTAL_PORTIONS_MISMATCH`: "Total portions does not match calculated value"

#### reserved_portions
- **Type**: Decimal(10,4)
- **Required**: Yes
- **Default**: 0.00
- **Min**: 0.00
- **Max**: total_portions
- **Validation Rules**:
  - Cannot exceed total_portions
  - Cannot be negative
- **Error Messages**:
  - `RESERVED_PORTIONS_NEGATIVE`: "Reserved portions cannot be negative"
  - `RESERVED_EXCEEDS_TOTAL`: "Reserved portions cannot exceed total portions"

#### available_portions
- **Type**: Decimal(10,4)
- **Required**: Yes (calculated)
- **Default**: 0.00
- **Calculation**: total_portions - reserved_portions
- **Validation Rules**:
  - Auto-calculated, should not be set manually
  - Must equal total_portions - reserved_portions
- **Error Messages**:
  - `AVAILABLE_PORTIONS_MISMATCH`: "Available portions calculation error"

#### prepared_at
- **Type**: DateTime (Timestamptz)
- **Required**: No (Required for PREPARED, PORTIONED, PARTIAL states)
- **Validation Rules**:
  - Cannot be in the future
  - Required when state transitions from RAW to PREPARED/PORTIONED
  - Cannot be changed once set (immutable)
- **Error Messages**:
  - `PREPARED_AT_FUTURE`: "Prepared date cannot be in the future"
  - `PREPARED_AT_REQUIRED`: "Prepared date is required for this state"
  - `PREPARED_AT_IMMUTABLE`: "Prepared date cannot be changed after initial setting"

#### expiry_date
- **Type**: DateTime (Timestamptz)
- **Required**: No (Auto-calculated from prepared_at + shelf_life_hours)
- **Validation Rules**:
  - Auto-calculated, should not be set manually
  - Must equal prepared_at + shelf_life_hours
- **Error Messages**:
  - `EXPIRY_DATE_MANUAL_SET`: "Expiry date is auto-calculated and cannot be set manually"

---

### 2.3 Conversion Record Fields

#### units_converted
- **Type**: Integer
- **Required**: Yes
- **Min**: 1
- **Max**: 999999
- **Validation Rules**:
  - Must be greater than 0
  - Cannot exceed available stock
- **Error Messages**:
  - `UNITS_CONVERTED_REQUIRED`: "Units converted is required"
  - `UNITS_CONVERTED_TOO_LOW`: "Units converted must be at least 1"
  - `UNITS_CONVERTED_EXCEEDS_STOCK`: "Units converted exceeds available stock"

#### portions_created
- **Type**: Decimal(10,4)
- **Required**: Yes
- **Min**: 0.00
- **Validation Rules**:
  - Cannot be negative
  - Should be reasonable based on expected_portions and waste
- **Error Messages**:
  - `PORTIONS_CREATED_NEGATIVE`: "Portions created cannot be negative"
  - `PORTIONS_CREATED_UNREALISTIC`: "Portions created significantly differs from expected (>50% variance)"

#### conversion_efficiency
- **Type**: Decimal(5,2)
- **Required**: Yes
- **Min**: 0.00
- **Max**: 150.00
- **Calculation**: (portions_created / expected_portions) * 100
- **Validation Rules**:
  - Must be between 0% and 150%
  - Warning if < 50% or > 120%
- **Error Messages**:
  - `EFFICIENCY_OUT_OF_RANGE`: "Conversion efficiency must be between 0% and 150%"
  - `EFFICIENCY_LOW_WARNING`: "Warning: Conversion efficiency below 50% is unusual"
  - `EFFICIENCY_HIGH_WARNING`: "Warning: Conversion efficiency above 120% is unusual"

#### reason
- **Type**: String (VARCHAR)
- **Required**: Yes
- **Min Length**: 3
- **Max Length**: 500
- **Validation Rules**:
  - Cannot be empty or whitespace only
  - Must provide meaningful context
- **Error Messages**:
  - `REASON_REQUIRED`: "Reason for conversion is required"
  - `REASON_TOO_SHORT`: "Reason must be at least 3 characters"
  - `REASON_TOO_LONG`: "Reason cannot exceed 500 characters"

---

## 3. Business Rule Validations

### BR-FI-001: State Transition Rules

**Rule**: Stock can only transition between valid states based on conversion type.

**Valid Transitions**:
```typescript
const VALID_STATE_TRANSITIONS = {
  raw: ['prepared', 'portioned', 'waste'],
  prepared: ['portioned', 'waste'],
  portioned: ['partial', 'combined', 'waste'],
  partial: ['portioned', 'combined', 'waste'],
  combined: ['portioned', 'waste'],
  waste: [] // Terminal state
};
```

**Validation Code**:
```typescript
function validateStateTransition(
  currentState: FractionalState,
  newState: FractionalState
): ValidationResult {
  const validTransitions = VALID_STATE_TRANSITIONS[currentState];

  if (!validTransitions.includes(newState)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_STATE_TRANSITION',
        message: `Cannot transition from ${currentState} to ${newState}`,
        field: 'current_state'
      }
    };
  }

  return { valid: true };
}
```

**Error Messages**:
- `INVALID_STATE_TRANSITION`: "Cannot transition from {current_state} to {new_state}"

---

### BR-FI-002: Quality Degradation Rules

**Rule**: Quality grade must progress logically based on time elapsed and cannot skip grades.

**Quality Progression**:
```typescript
const QUALITY_PROGRESSION = [
  'excellent',
  'good',
  'fair',
  'poor',
  'expired'
];

function validateQualityGrade(
  preparedAt: Date,
  shelfLifeHours: number,
  maxQualityHours: number,
  proposedGrade: QualityGrade
): ValidationResult {
  const hoursElapsed = (Date.now() - preparedAt.getTime()) / (1000 * 60 * 60);
  const expectedGrade = calculateExpectedQualityGrade(
    hoursElapsed,
    shelfLifeHours,
    maxQualityHours
  );

  if (proposedGrade !== expectedGrade) {
    return {
      valid: false,
      error: {
        code: 'QUALITY_GRADE_MISMATCH',
        message: `Quality grade should be '${expectedGrade}' based on time elapsed`,
        field: 'quality_grade'
      }
    };
  }

  return { valid: true };
}
```

**Error Messages**:
- `QUALITY_GRADE_MISMATCH`: "Quality grade should be '{expected_grade}' based on time elapsed"

---

### BR-FI-003: Portion Calculation Consistency

**Rule**: Total portions must equal (whole_units + partial_quantity) * portions_per_whole

**Validation Code**:
```typescript
function validatePortionCalculation(
  wholeUnits: number,
  partialQuantity: number,
  portionsPerWhole: number,
  totalPortions: number
): ValidationResult {
  const calculatedPortions = (wholeUnits + partialQuantity) * portionsPerWhole;
  const tolerance = 0.01; // Allow 0.01 difference for rounding

  if (Math.abs(calculatedPortions - totalPortions) > tolerance) {
    return {
      valid: false,
      error: {
        code: 'PORTION_CALCULATION_MISMATCH',
        message: `Total portions (${totalPortions}) does not match calculated value (${calculatedPortions.toFixed(4)})`,
        field: 'total_portions'
      }
    };
  }

  return { valid: true };
}
```

**Error Messages**:
- `PORTION_CALCULATION_MISMATCH`: "Total portions does not match calculated value"

---

### BR-FI-004: Split Conversion Validation

**Rule**: Split conversion requires RAW or PREPARED state and sufficient whole units.

**Validation Code**:
```typescript
function validateSplitConversion(
  stock: FractionalStock,
  unitsToSplit: number
): ValidationResult {
  // Check state
  if (!['raw', 'prepared'].includes(stock.current_state)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_STATE_FOR_SPLIT',
        message: 'Split conversion requires stock in RAW or PREPARED state',
        field: 'current_state'
      }
    };
  }

  // Check available units
  if (stock.whole_units < unitsToSplit) {
    return {
      valid: false,
      error: {
        code: 'INSUFFICIENT_WHOLE_UNITS',
        message: `Insufficient whole units. Available: ${stock.whole_units}, Required: ${unitsToSplit}`,
        field: 'units_converted'
      }
    };
  }

  return { valid: true };
}
```

**Error Messages**:
- `INVALID_STATE_FOR_SPLIT`: "Split conversion requires stock in RAW or PREPARED state"
- `INSUFFICIENT_WHOLE_UNITS`: "Insufficient whole units for split conversion"

---

### BR-FI-005: Combine Conversion Validation

**Rule**: Combine conversion requires PORTIONED or PARTIAL state and sufficient portions.

**Validation Code**:
```typescript
function validateCombineConversion(
  stock: FractionalStock,
  portionsToCombine: number,
  portionsPerWhole: number
): ValidationResult {
  // Check state
  if (!['portioned', 'partial'].includes(stock.current_state)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_STATE_FOR_COMBINE',
        message: 'Combine conversion requires stock in PORTIONED or PARTIAL state',
        field: 'current_state'
      }
    };
  }

  // Check available portions
  if (stock.available_portions < portionsToCombine) {
    return {
      valid: false,
      error: {
        code: 'INSUFFICIENT_PORTIONS',
        message: `Insufficient portions. Available: ${stock.available_portions}, Required: ${portionsToCombine}`,
        field: 'portions_to_combine'
      }
    };
  }

  // Check minimum portions for whole unit
  if (portionsToCombine < portionsPerWhole) {
    return {
      valid: false,
      error: {
        code: 'INSUFFICIENT_PORTIONS_FOR_WHOLE',
        message: `Minimum ${portionsPerWhole} portions required to create one whole unit`,
        field: 'portions_to_combine'
      }
    };
  }

  return { valid: true };
}
```

**Error Messages**:
- `INVALID_STATE_FOR_COMBINE`: "Combine conversion requires stock in PORTIONED or PARTIAL state"
- `INSUFFICIENT_PORTIONS`: "Insufficient portions for combine conversion"
- `INSUFFICIENT_PORTIONS_FOR_WHOLE`: "Minimum portions required to create whole unit not met"

---

### BR-FI-006: Expiry Validation

**Rule**: Cannot perform conversions on expired stock.

**Validation Code**:
```typescript
function validateNotExpired(stock: FractionalStock): ValidationResult {
  if (stock.quality_grade === 'expired') {
    return {
      valid: false,
      error: {
        code: 'STOCK_EXPIRED',
        message: 'Cannot perform conversion on expired stock. Mark as waste instead.',
        field: 'quality_grade'
      }
    };
  }

  if (stock.expiry_date && stock.expiry_date < new Date()) {
    return {
      valid: false,
      error: {
        code: 'STOCK_EXPIRED',
        message: `Stock expired on ${stock.expiry_date.toLocaleDateString()}`,
        field: 'expiry_date'
      }
    };
  }

  return { valid: true };
}
```

**Error Messages**:
- `STOCK_EXPIRED`: "Cannot perform conversion on expired stock"

---

### BR-FI-007: Waste Percentage Validation

**Rule**: Actual waste should not significantly exceed expected waste percentage (>50% variance).

**Validation Code**:
```typescript
function validateWastePercentage(
  expectedPortions: number,
  actualPortions: number,
  expectedWastePercent: number
): ValidationResult {
  const actualWaste = expectedPortions - actualPortions;
  const actualWastePercent = (actualWaste / expectedPortions) * 100;

  const maxAcceptableWaste = expectedWastePercent * 1.5; // 50% tolerance

  if (actualWastePercent > maxAcceptableWaste) {
    return {
      valid: false,
      error: {
        code: 'EXCESSIVE_WASTE',
        message: `Actual waste (${actualWastePercent.toFixed(2)}%) significantly exceeds expected (${expectedWastePercent}%)`,
        field: 'waste_generated',
        severity: 'warning' // Allow but warn
      }
    };
  }

  return { valid: true };
}
```

**Error Messages**:
- `EXCESSIVE_WASTE`: "Actual waste significantly exceeds expected waste percentage"

---

### BR-FI-008: Reserved Portions Validation

**Rule**: Cannot delete or mark as waste stock with reserved portions.

**Validation Code**:
```typescript
function validateNoReservedPortions(stock: FractionalStock): ValidationResult {
  if (stock.reserved_portions > 0) {
    return {
      valid: false,
      error: {
        code: 'HAS_RESERVED_PORTIONS',
        message: `Cannot proceed. Stock has ${stock.reserved_portions} reserved portions. Fulfill or unreserve orders first.`,
        field: 'reserved_portions'
      }
    };
  }

  return { valid: true };
}
```

**Error Messages**:
- `HAS_RESERVED_PORTIONS`: "Cannot proceed while stock has reserved portions"

---

### BR-FI-009: Location Isolation Validation

**Rule**: All operations must be scoped to user's current location.

**Validation Code**:
```typescript
function validateLocationAccess(
  userLocationId: string,
  stockLocationId: string
): ValidationResult {
  if (userLocationId !== stockLocationId) {
    return {
      valid: false,
      error: {
        code: 'LOCATION_ACCESS_DENIED',
        message: 'Cannot access stock from a different location',
        field: 'location_id'
      }
    };
  }

  return { valid: true };
}
```

**Error Messages**:
- `LOCATION_ACCESS_DENIED`: "Cannot access stock from different location"

---

### BR-FI-010: Portion Size Deletion Validation

**Rule**: Cannot delete portion size if it's used in active stock.

**Validation Code**:
```typescript
async function validatePortionSizeDeletion(
  itemCode: string,
  portionSizeId: string
): Promise<ValidationResult> {
  const activeStock = await db.fractionalStock.findFirst({
    where: {
      item_code: itemCode,
      last_conversion_type: 'split',
      // Check if this portion size was used
      info: {
        path: ['portion_size_id'],
        equals: portionSizeId
      }
    }
  });

  if (activeStock) {
    return {
      valid: false,
      error: {
        code: 'PORTION_SIZE_IN_USE',
        message: 'Cannot delete portion size that is used in active stock',
        field: 'portion_size_id'
      }
    };
  }

  return { valid: true };
}
```

**Error Messages**:
- `PORTION_SIZE_IN_USE`: "Cannot delete portion size that is currently in use"

---

## 4. Complete Zod Schemas

### 4.1 Fractional Item Configuration Schema

```typescript
import { z } from 'zod';

// Portion Size Schema
export const portionSizeSchema = z.object({
  id: z.string().uuid('Invalid portion size ID'),
  name: z.string()
    .min(1, 'Portion name is required')
    .max(50, 'Portion name cannot exceed 50 characters'),
  portions_per_whole: z.number()
    .int('Portions per whole must be an integer')
    .min(1, 'Portions per whole must be at least 1')
    .max(1000, 'Portions per whole cannot exceed 1000'),
  display_order: z.number()
    .int('Display order must be an integer')
    .min(1, 'Display order must be at least 1'),
  is_active: z.boolean()
});

// Fractional Item Schema
export const fractionalItemSchema = z.object({
  item_code: z.string()
    .min(3, 'Item code must be at least 3 characters')
    .max(50, 'Item code cannot exceed 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'Item code must be alphanumeric with hyphens'),

  item_name: z.string()
    .min(2, 'Item name must be at least 2 characters')
    .max(200, 'Item name cannot exceed 200 characters'),

  category: z.string()
    .max(100, 'Category cannot exceed 100 characters')
    .optional(),

  base_unit: z.string()
    .min(1, 'Base unit is required')
    .max(50, 'Base unit cannot exceed 50 characters')
    .default('Whole'),

  available_portions: z.array(portionSizeSchema)
    .min(1, 'At least one portion size must be defined')
    .max(10, 'Cannot define more than 10 portion sizes')
    .refine(
      (portions) => portions.some(p => p.is_active),
      'At least one portion size must be active'
    )
    .refine(
      (portions) => {
        const ids = portions.map(p => p.id);
        return ids.length === new Set(ids).size;
      },
      'Portion size IDs must be unique'
    ),

  default_portion_id: z.string().uuid().optional(),

  shelf_life_hours: z.number()
    .int('Shelf life hours must be an integer')
    .min(1, 'Shelf life must be at least 1 hour')
    .max(8760, 'Shelf life cannot exceed 8760 hours (1 year)'),

  max_quality_hours: z.number()
    .int('Max quality hours must be an integer')
    .min(1, 'Max quality hours must be at least 1 hour'),

  temperature_required: z.enum(['COLD', 'FROZEN', 'ROOM_TEMP']).optional(),

  expected_waste_percent: z.number()
    .min(0, 'Waste percentage cannot be negative')
    .max(100, 'Waste percentage cannot exceed 100')
    .default(0.00),

  base_cost_per_unit: z.number()
    .min(0.01, 'Base cost must be greater than 0')
    .max(999999.9999, 'Base cost cannot exceed 999,999.9999'),

  conversion_cost_per_unit: z.number()
    .min(0, 'Conversion cost cannot be negative')
    .max(999999.9999, 'Conversion cost cannot exceed 999,999.9999')
    .default(0.00),

  auto_conversion_enabled: z.boolean().default(false),

  min_portion_threshold: z.number()
    .int('Threshold must be an integer')
    .min(1, 'Threshold must be at least 1')
    .max(10000, 'Threshold cannot exceed 10,000')
    .optional(),

  is_active: z.boolean().default(true)
}).refine(
  (data) => data.max_quality_hours <= data.shelf_life_hours,
  {
    message: 'Max quality hours cannot exceed shelf life hours',
    path: ['max_quality_hours']
  }
).refine(
  (data) => !data.auto_conversion_enabled || data.min_portion_threshold !== undefined,
  {
    message: 'Minimum portion threshold is required when auto-conversion is enabled',
    path: ['min_portion_threshold']
  }
);

export type FractionalItemInput = z.infer<typeof fractionalItemSchema>;
```

### 4.2 Split Conversion Schema

```typescript
export const splitConversionSchema = z.object({
  stock_id: z.string().uuid('Invalid stock ID'),

  portion_size_id: z.string()
    .min(1, 'Portion size selection is required'),

  units_to_split: z.number()
    .int('Units to split must be an integer')
    .min(1, 'Must split at least 1 whole unit')
    .max(999999, 'Cannot split more than 999,999 units'),

  portions_created: z.number()
    .min(0, 'Portions created cannot be negative')
    .max(9999999.9999, 'Portions created too large'),

  waste_generated: z.number()
    .min(0, 'Waste cannot be negative')
    .max(9999999.9999, 'Waste amount too large')
    .optional(),

  reason: z.string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason cannot exceed 500 characters'),

  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),

  quality_impact: z.enum(['NONE', 'MINOR', 'MODERATE', 'SEVERE']).optional(),

  quality_notes: z.string()
    .max(500, 'Quality notes cannot exceed 500 characters')
    .optional()
});

export type SplitConversionInput = z.infer<typeof splitConversionSchema>;
```

### 4.3 Combine Conversion Schema

```typescript
export const combineConversionSchema = z.object({
  stock_id: z.string().uuid('Invalid stock ID'),

  portions_to_combine: z.number()
    .min(1, 'Must combine at least 1 portion')
    .max(9999999.9999, 'Portions to combine too large'),

  reason: z.string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason cannot exceed 500 characters'),

  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),

  quality_impact: z.enum(['NONE', 'MINOR', 'MODERATE', 'SEVERE']).optional(),

  quality_notes: z.string()
    .max(500, 'Quality notes cannot exceed 500 characters')
    .optional()
});

export type CombineConversionInput = z.infer<typeof combineConversionSchema>;
```

### 4.4 Mark as Waste Schema

```typescript
export const markAsWasteSchema = z.object({
  stock_id: z.string().uuid('Invalid stock ID'),

  waste_type: z.enum(['EXPIRED', 'QUALITY_DEGRADED', 'DAMAGED', 'OTHER']),

  reason: z.string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason cannot exceed 500 characters'),

  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
});

export type MarkAsWasteInput = z.infer<typeof markAsWasteSchema>;
```

### 4.5 Alert Acknowledgment Schema

```typescript
export const alertAcknowledgmentSchema = z.object({
  alert_id: z.string().uuid('Invalid alert ID'),

  action_taken: z.enum(['ACKNOWLEDGED', 'RESOLVED', 'DISMISSED']),

  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
});

export type AlertAcknowledgmentInput = z.infer<typeof alertAcknowledgmentSchema>;
```

### 4.6 Stock Filter Schema

```typescript
export const stockFilterSchema = z.object({
  location_id: z.string().uuid('Invalid location ID'),

  item_code: z.string().optional(),

  current_state: z.enum(['raw', 'prepared', 'portioned', 'partial', 'combined', 'waste']).optional(),

  quality_grade: z.enum(['excellent', 'good', 'fair', 'poor', 'expired']).optional(),

  category: z.string().optional(),

  expiry_date_from: z.date().optional(),
  expiry_date_to: z.date().optional(),

  has_alerts: z.boolean().optional(),

  sort_by: z.enum(['expiry_date', 'quality_grade', 'updated_at', 'available_portions']).default('updated_at'),

  sort_order: z.enum(['asc', 'desc']).default('desc'),

  page: z.number().int().min(1).default(1),

  limit: z.number().int().min(10).max(100).default(50)
});

export type StockFilterInput = z.infer<typeof stockFilterSchema>;
```

---

## 5. Database Constraints

### 5.1 Check Constraints (SQL)

```sql
-- Fractional Item Constraints
ALTER TABLE tb_fractional_item
  ADD CONSTRAINT chk_fi_shelf_life_positive
  CHECK (shelf_life_hours > 0);

ALTER TABLE tb_fractional_item
  ADD CONSTRAINT chk_fi_max_quality_valid
  CHECK (max_quality_hours > 0 AND max_quality_hours <= shelf_life_hours);

ALTER TABLE tb_fractional_item
  ADD CONSTRAINT chk_fi_waste_percent_range
  CHECK (expected_waste_percent >= 0 AND expected_waste_percent <= 100);

ALTER TABLE tb_fractional_item
  ADD CONSTRAINT chk_fi_base_cost_positive
  CHECK (base_cost_per_unit > 0);

ALTER TABLE tb_fractional_item
  ADD CONSTRAINT chk_fi_conversion_cost_nonnegative
  CHECK (conversion_cost_per_unit >= 0);

-- Fractional Stock Constraints
ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fs_whole_units_nonnegative
  CHECK (whole_units >= 0);

ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fs_partial_qty_range
  CHECK (partial_quantity >= 0.00 AND partial_quantity < 1.00);

ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fs_total_portions_nonnegative
  CHECK (total_portions >= 0);

ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fs_reserved_portions_valid
  CHECK (reserved_portions >= 0 AND reserved_portions <= total_portions);

ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fs_available_portions_valid
  CHECK (available_portions >= 0 AND available_portions <= total_portions);

ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT chk_fs_expiry_after_prepared
  CHECK (expiry_date IS NULL OR prepared_at IS NULL OR expiry_date > prepared_at);

-- Conversion Record Constraints
ALTER TABLE tb_conversion_record
  ADD CONSTRAINT chk_cr_units_converted_positive
  CHECK (units_converted > 0);

ALTER TABLE tb_conversion_record
  ADD CONSTRAINT chk_cr_portions_created_nonnegative
  CHECK (portions_created >= 0);

ALTER TABLE tb_conversion_record
  ADD CONSTRAINT chk_cr_expected_portions_positive
  CHECK (expected_portions > 0);

ALTER TABLE tb_conversion_record
  ADD CONSTRAINT chk_cr_waste_nonnegative
  CHECK (waste_generated >= 0);

ALTER TABLE tb_conversion_record
  ADD CONSTRAINT chk_cr_efficiency_range
  CHECK (conversion_efficiency >= 0 AND conversion_efficiency <= 150);

-- Conversion Recommendation Constraints
ALTER TABLE tb_conversion_recommendation
  ADD CONSTRAINT chk_crec_confidence_range
  CHECK (confidence_score >= 0 AND confidence_score <= 100);

ALTER TABLE tb_conversion_recommendation
  ADD CONSTRAINT chk_crec_priority_range
  CHECK (priority_score >= 1 AND priority_score <= 10);

ALTER TABLE tb_conversion_recommendation
  ADD CONSTRAINT chk_crec_recommended_units_positive
  CHECK (recommended_units > 0);

ALTER TABLE tb_conversion_recommendation
  ADD CONSTRAINT chk_crec_timing_valid
  CHECK (valid_until > optimal_conversion_time);
```

### 5.2 NOT NULL Constraints (SQL)

```sql
-- Critical fields that must always have values
ALTER TABLE tb_fractional_item
  ALTER COLUMN item_code SET NOT NULL,
  ALTER COLUMN item_name SET NOT NULL,
  ALTER COLUMN base_unit SET NOT NULL,
  ALTER COLUMN available_portions SET NOT NULL,
  ALTER COLUMN shelf_life_hours SET NOT NULL,
  ALTER COLUMN max_quality_hours SET NOT NULL,
  ALTER COLUMN base_cost_per_unit SET NOT NULL;

ALTER TABLE tb_fractional_stock
  ALTER COLUMN item_code SET NOT NULL,
  ALTER COLUMN location_id SET NOT NULL,
  ALTER COLUMN current_state SET NOT NULL,
  ALTER COLUMN state_transition_date SET NOT NULL,
  ALTER COLUMN quality_grade SET NOT NULL,
  ALTER COLUMN whole_units SET NOT NULL,
  ALTER COLUMN partial_quantity SET NOT NULL,
  ALTER COLUMN total_portions SET NOT NULL,
  ALTER COLUMN reserved_portions SET NOT NULL,
  ALTER COLUMN available_portions SET NOT NULL;

ALTER TABLE tb_conversion_record
  ALTER COLUMN item_code SET NOT NULL,
  ALTER COLUMN stock_id SET NOT NULL,
  ALTER COLUMN conversion_type SET NOT NULL,
  ALTER COLUMN performed_by_id SET NOT NULL,
  ALTER COLUMN reason SET NOT NULL,
  ALTER COLUMN units_converted SET NOT NULL,
  ALTER COLUMN portions_created SET NOT NULL,
  ALTER COLUMN expected_portions SET NOT NULL,
  ALTER COLUMN conversion_efficiency SET NOT NULL;
```

### 5.3 Unique Constraints (SQL)

```sql
-- Ensure only one fractional config per item
ALTER TABLE tb_fractional_item
  ADD CONSTRAINT uq_fi_item_code UNIQUE (item_code);

-- Ensure only one active stock record per item+location
ALTER TABLE tb_fractional_stock
  ADD CONSTRAINT uq_fs_item_location
  UNIQUE (item_code, location_id)
  WHERE deleted_at IS NULL;
```

---

## 6. Error Messages Reference

### 6.1 Field Validation Errors

| Error Code | Message Template | Severity | HTTP Status |
|------------|------------------|----------|-------------|
| `ITEM_CODE_REQUIRED` | Item code is required | error | 400 |
| `ITEM_CODE_INVALID_FORMAT` | Item code must be 3-50 alphanumeric characters | error | 400 |
| `ITEM_CODE_NOT_FOUND` | Item code does not exist in product catalog | error | 404 |
| `ITEM_CODE_DUPLICATE` | This item is already configured for fractional tracking | error | 409 |
| `ITEM_NAME_REQUIRED` | Item name is required | error | 400 |
| `ITEM_NAME_TOO_SHORT` | Item name must be at least 2 characters | error | 400 |
| `ITEM_NAME_TOO_LONG` | Item name cannot exceed 200 characters | error | 400 |
| `PORTIONS_REQUIRED` | At least one portion size must be defined | error | 400 |
| `PORTION_ID_DUPLICATE` | Portion IDs must be unique | error | 400 |
| `PORTIONS_PER_WHOLE_INVALID` | Portions per whole must be greater than 0 | error | 400 |
| `NO_ACTIVE_PORTIONS` | At least one portion size must be active | error | 400 |
| `SHELF_LIFE_REQUIRED` | Shelf life hours is required | error | 400 |
| `SHELF_LIFE_TOO_LOW` | Shelf life must be at least 1 hour | error | 400 |
| `SHELF_LIFE_TOO_HIGH` | Shelf life cannot exceed 8760 hours (1 year) | error | 400 |
| `SHELF_LIFE_INVALID_RANGE` | Shelf life must be greater than max quality hours | error | 400 |
| `MAX_QUALITY_REQUIRED` | Max quality hours is required | error | 400 |
| `MAX_QUALITY_TOO_LOW` | Max quality hours must be at least 1 hour | error | 400 |
| `MAX_QUALITY_EXCEEDS_SHELF_LIFE` | Max quality hours cannot exceed shelf life hours | error | 400 |
| `WASTE_PERCENT_INVALID_RANGE` | Waste percentage must be between 0 and 100 | error | 400 |
| `WASTE_PERCENT_HIGH_WARNING` | Warning: Waste percentage above 25% is unusually high | warning | 200 |
| `BASE_COST_REQUIRED` | Base cost per unit is required | error | 400 |
| `BASE_COST_TOO_LOW` | Base cost must be greater than 0 | error | 400 |
| `BASE_COST_TOO_HIGH` | Base cost cannot exceed 999,999.9999 | error | 400 |

### 6.2 Business Rule Errors

| Error Code | Message Template | Severity | HTTP Status |
|------------|------------------|----------|-------------|
| `INVALID_STATE_TRANSITION` | Cannot transition from {current_state} to {new_state} | error | 400 |
| `QUALITY_GRADE_MISMATCH` | Quality grade should be '{expected_grade}' based on time elapsed | error | 400 |
| `PORTION_CALCULATION_MISMATCH` | Total portions does not match calculated value | error | 400 |
| `INVALID_STATE_FOR_SPLIT` | Split conversion requires stock in RAW or PREPARED state | error | 400 |
| `INSUFFICIENT_WHOLE_UNITS` | Insufficient whole units for split conversion | error | 400 |
| `INVALID_STATE_FOR_COMBINE` | Combine conversion requires stock in PORTIONED or PARTIAL state | error | 400 |
| `INSUFFICIENT_PORTIONS` | Insufficient portions for combine conversion | error | 400 |
| `INSUFFICIENT_PORTIONS_FOR_WHOLE` | Minimum portions required to create whole unit not met | error | 400 |
| `STOCK_EXPIRED` | Cannot perform conversion on expired stock | error | 400 |
| `EXCESSIVE_WASTE` | Actual waste significantly exceeds expected waste percentage | warning | 200 |
| `HAS_RESERVED_PORTIONS` | Cannot proceed while stock has reserved portions | error | 400 |
| `LOCATION_ACCESS_DENIED` | Cannot access stock from different location | error | 403 |
| `PORTION_SIZE_IN_USE` | Cannot delete portion size that is currently in use | error | 409 |

### 6.3 System Errors

| Error Code | Message Template | Severity | HTTP Status |
|------------|------------------|----------|-------------|
| `DATABASE_ERROR` | A database error occurred. Please try again. | error | 500 |
| `TRANSACTION_FAILED` | Transaction failed. Changes have been rolled back. | error | 500 |
| `CONSTRAINT_VIOLATION` | Data integrity constraint violated | error | 409 |
| `CONCURRENT_MODIFICATION` | Stock was modified by another user. Please refresh and try again. | error | 409 |
| `INVALID_REQUEST` | The request is invalid or malformed | error | 400 |
| `UNAUTHORIZED` | You are not authorized to perform this action | error | 403 |
| `NOT_FOUND` | The requested resource was not found | error | 404 |

---

## 7. Validation Testing Matrix

### 7.1 Fractional Item Configuration Tests

| Test Case | Input | Expected Result | Error Code |
|-----------|-------|-----------------|------------|
| Valid item with 1 portion | item_code: "PIZZA-001", available_portions: [8 slices] | Success | - |
| Valid item with multiple portions | item_code: "PIZZA-001", available_portions: [8 slices, 4 quarters, 2 halves] | Success | - |
| Missing item code | item_code: "" | Fail | ITEM_CODE_REQUIRED |
| Invalid item code format | item_code: "pizza 001" | Fail | ITEM_CODE_INVALID_FORMAT |
| Duplicate item code | item_code: "PIZZA-001" (already exists) | Fail | ITEM_CODE_DUPLICATE |
| Empty portions array | available_portions: [] | Fail | PORTIONS_REQUIRED |
| All portions inactive | available_portions: [8 slices (inactive)] | Fail | NO_ACTIVE_PORTIONS |
| Duplicate portion IDs | available_portions: [{id: '1'}, {id: '1'}] | Fail | PORTION_ID_DUPLICATE |
| Zero portions per whole | portions_per_whole: 0 | Fail | PORTIONS_PER_WHOLE_INVALID |
| Negative portions per whole | portions_per_whole: -8 | Fail | PORTIONS_PER_WHOLE_INVALID |
| Shelf life 0 hours | shelf_life_hours: 0 | Fail | SHELF_LIFE_TOO_LOW |
| Shelf life > 1 year | shelf_life_hours: 9000 | Fail | SHELF_LIFE_TOO_HIGH |
| Max quality > shelf life | max_quality_hours: 48, shelf_life_hours: 24 | Fail | SHELF_LIFE_INVALID_RANGE |
| Waste percent = 101% | expected_waste_percent: 101 | Fail | WASTE_PERCENT_INVALID_RANGE |
| Waste percent = 30% | expected_waste_percent: 30 | Success (Warning) | WASTE_PERCENT_HIGH_WARNING |
| Base cost = 0 | base_cost_per_unit: 0 | Fail | BASE_COST_TOO_LOW |
| Base cost negative | base_cost_per_unit: -10 | Fail | BASE_COST_TOO_LOW |
| Auto-conversion without threshold | auto_conversion_enabled: true, min_portion_threshold: null | Fail | THRESHOLD_REQUIRED_FOR_AUTO |

### 7.2 Split Conversion Tests

| Test Case | Input | Expected Result | Error Code |
|-----------|-------|-----------------|------------|
| Valid split (RAW → PORTIONED) | state: raw, units: 2, portions: 8/unit | Success | - |
| Valid split (PREPARED → PORTIONED) | state: prepared, units: 2, portions: 8/unit | Success | - |
| Invalid state (PORTIONED) | state: portioned, units: 2 | Fail | INVALID_STATE_FOR_SPLIT |
| Invalid state (WASTE) | state: waste, units: 2 | Fail | INVALID_STATE_FOR_SPLIT |
| Insufficient whole units | available: 1, requested: 2 | Fail | INSUFFICIENT_WHOLE_UNITS |
| Zero units to split | units_to_split: 0 | Fail | UNITS_CONVERTED_TOO_LOW |
| Negative units to split | units_to_split: -2 | Fail | UNITS_CONVERTED_TOO_LOW |
| Expired stock | quality_grade: expired | Fail | STOCK_EXPIRED |
| Reserved portions exist | reserved_portions: 5 | Success (allowed for split) | - |
| Excessive waste (>50% variance) | expected: 16, actual: 6, waste: 10 | Success (Warning) | EXCESSIVE_WASTE |
| Efficiency < 50% | efficiency: 40% | Success (Warning) | EFFICIENCY_LOW_WARNING |
| Efficiency > 120% | efficiency: 130% | Success (Warning) | EFFICIENCY_HIGH_WARNING |

### 7.3 Combine Conversion Tests

| Test Case | Input | Expected Result | Error Code |
|-----------|-------|-----------------|------------|
| Valid combine (PORTIONED → RAW) | state: portioned, portions: 16 (2 whole units at 8/unit) | Success | - |
| Valid combine (PARTIAL → RAW) | state: partial, portions: 16 | Success | - |
| Invalid state (RAW) | state: raw, portions: 16 | Fail | INVALID_STATE_FOR_COMBINE |
| Invalid state (PREPARED) | state: prepared, portions: 16 | Fail | INVALID_STATE_FOR_COMBINE |
| Insufficient portions | available: 8, requested: 16 | Fail | INSUFFICIENT_PORTIONS |
| Portions less than whole unit | requested: 4, portions_per_whole: 8 | Fail | INSUFFICIENT_PORTIONS_FOR_WHOLE |
| Reserved portions exist | reserved_portions: 5, available: 20, requested: 20 | Fail | Portion calculation |
| Expired stock | quality_grade: expired | Fail | STOCK_EXPIRED |
| Quality degradation warning | quality_grade: poor | Success (Warning) | Quality impact |

### 7.4 Mark as Waste Tests

| Test Case | Input | Expected Result | Error Code |
|-----------|-------|-----------------|------------|
| Valid waste marking (EXPIRED) | waste_type: EXPIRED, reason: "Past expiry date" | Success | - |
| Valid waste marking (QUALITY_DEGRADED) | waste_type: QUALITY_DEGRADED, reason: "Moldy" | Success | - |
| Valid waste marking (DAMAGED) | waste_type: DAMAGED, reason: "Dropped on floor" | Success | - |
| Reserved portions exist | reserved_portions: 5 | Fail | HAS_RESERVED_PORTIONS |
| Missing reason | reason: "" | Fail | REASON_REQUIRED |
| Reason too short | reason: "ok" | Fail | REASON_TOO_SHORT |
| Reason too long | reason: (501 characters) | Fail | REASON_TOO_LONG |
| Already marked as waste | current_state: waste | Fail | Invalid state transition |

### 7.5 Alert Management Tests

| Test Case | Input | Expected Result | Error Code |
|-----------|-------|-----------------|------------|
| Valid acknowledgment | action: ACKNOWLEDGED | Success | - |
| Valid resolution | action: RESOLVED | Success | - |
| Valid dismissal | action: DISMISSED | Success | - |
| Already resolved | current status: resolved, action: ACKNOWLEDGED | Fail | Invalid transition |
| Invalid alert ID | alert_id: "invalid-uuid" | Fail | Invalid UUID format |

---

## 8. Summary

### 8.1 Validation Coverage

**Field-Level Validations**:
- 25+ fields with comprehensive validation rules
- Type checking, range validation, format validation
- Cross-field validation (e.g., max_quality_hours <= shelf_life_hours)

**Business Rule Validations**:
- 10 core business rules implemented
- State transition validation
- Quantity and calculation validation
- Expiry and quality validation
- Authorization and location isolation

**Complete Zod Schemas**:
- 6 comprehensive schemas covering all input operations
- Type-safe validation with TypeScript integration
- Composable and reusable schema components
- Clear, actionable error messages

**Database Constraints**:
- 20+ check constraints for data integrity
- NOT NULL constraints on critical fields
- Unique constraints for business rules
- Comprehensive constraint coverage

**Error Messages**:
- 40+ error codes defined
- Consistent error message format
- Severity levels (error, warning)
- HTTP status code mapping

**Testing Matrix**:
- 50+ test cases defined
- Coverage of success and failure scenarios
- Edge case validation
- Clear expected outcomes

### 8.2 Validation Performance

**Expected Performance**:
- Client-side validation: < 10ms
- Server-side validation: < 50ms
- Database constraint checks: < 5ms
- Total validation overhead: < 100ms per request

### 8.3 Maintenance Guidelines

**Adding New Validations**:
1. Define field-level validation rules
2. Create/update Zod schema
3. Add database constraints if needed
4. Define error messages and codes
5. Create test cases
6. Update documentation

**Modifying Existing Validations**:
1. Review impact on existing data
2. Update Zod schema
3. Update database constraints (consider migration)
4. Update error messages
5. Update test cases
6. Document changes

---

**End of Validations Document**
