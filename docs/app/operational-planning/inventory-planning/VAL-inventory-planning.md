# Inventory Planning - Validations

## Document Information

| Field | Value |
|-------|-------|
| Module | Inventory Planning |
| Version | 1.0.0 |
| Last Updated | 2025-12-06 |
| Status | Draft |

---

## 1. Validation Overview

### 1.1 Validation Layers

| Layer | Purpose | Implementation |
|-------|---------|----------------|
| Client | Immediate feedback | React Hook Form + Zod |
| API | Request validation | Zod schemas |
| Service | Business rules | TypeScript validation |
| Data | Data integrity | Database constraints |

### 1.2 Validation Categories

| Category | Description |
|----------|-------------|
| Input | User input validation |
| Business | Business rule enforcement |
| Calculation | Formula and computation validation |
| State | State transition validation |

---

## 2. Input Validation Schemas

### 2.1 Optimization Parameters Schema

```typescript
import { z } from 'zod';

const OptimizationParamsSchema = z.object({
  itemIds: z.array(z.string().uuid()).optional(),
  locationId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  includeAllItems: z.boolean().default(false),
  serviceLevel: z.number().min(0.5).max(0.99).default(0.95),
  orderCost: z.number().positive().optional(),
  holdingCostRate: z.number().min(0.01).max(1.0).optional(),
});
```

**Validation Rules**:

| Field | Rule | Error Message |
|-------|------|---------------|
| itemIds | Valid UUID array | "Invalid item ID format" |
| locationId | Valid UUID | "Invalid location ID" |
| categoryId | Valid UUID | "Invalid category ID" |
| serviceLevel | 0.5 - 0.99 | "Service level must be between 50% and 99%" |
| orderCost | > 0 | "Order cost must be positive" |
| holdingCostRate | 0.01 - 1.0 | "Holding cost rate must be between 1% and 100%" |

### 2.2 Dead Stock Parameters Schema

```typescript
const DeadStockParamsSchema = z.object({
  thresholdDays: z.number().int().min(1).max(730).default(90),
  locationId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  includeZeroStock: z.boolean().default(false),
});
```

**Validation Rules**:

| Field | Rule | Error Message |
|-------|------|---------------|
| thresholdDays | 1 - 730 | "Threshold must be between 1 and 730 days" |
| riskLevel | Valid enum | "Invalid risk level" |

### 2.3 Safety Stock Parameters Schema

```typescript
const SafetyStockParamsSchema = z.object({
  serviceLevel: z.enum(['90', '95', '99']),
  itemIds: z.array(z.string().uuid()).optional(),
  categoryId: z.string().uuid().optional(),
  leadTimeDays: z.number().int().min(1).max(180).optional(),
});
```

**Validation Rules**:

| Field | Rule | Error Message |
|-------|------|---------------|
| serviceLevel | 90, 95, or 99 | "Service level must be 90%, 95%, or 99%" |
| leadTimeDays | 1 - 180 | "Lead time must be between 1 and 180 days" |

### 2.4 Settings Schema

```typescript
const SettingsSchema = z.object({
  defaultServiceLevel: z.number().min(0.5).max(0.99),
  defaultOrderCost: z.number().positive(),
  defaultHoldingCostRate: z.number().min(0.01).max(1.0),
  defaultLeadTimeDays: z.number().int().min(1).max(180),
  deadStockThresholdDays: z.number().int().min(30).max(365),
  lowStockAlertEnabled: z.boolean(),
  deadStockAlertEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  autoApplyLowRisk: z.boolean(),
});
```

---

## 3. Business Rule Validations

### 3.1 Optimization Business Rules

| Rule ID | Rule | Validation |
|---------|------|------------|
| VAL-OPT-001 | EOQ cannot exceed annual demand | `eoq <= annualDemand` |
| VAL-OPT-002 | EOQ must be at least 1 unit | `eoq >= 1` |
| VAL-OPT-003 | Reorder point cannot exceed max stock | `rop <= maxStockLevel` |
| VAL-OPT-004 | Safety stock included in reorder point | `safetyStock <= rop` |
| VAL-OPT-005 | Savings must be calculable | `!isNaN(totalSavings)` |

**Implementation**:

```typescript
function validateOptimizationResult(result: InventoryOptimization): ValidationResult {
  const errors: string[] = [];

  // VAL-OPT-001
  if (result.optimizedMetrics.recommendedOrderQuantity > result.annualDemand) {
    errors.push('EOQ cannot exceed annual demand');
  }

  // VAL-OPT-002
  if (result.optimizedMetrics.recommendedOrderQuantity < 1) {
    errors.push('Order quantity must be at least 1');
  }

  // VAL-OPT-003
  if (result.optimizedMetrics.recommendedReorderPoint > result.maxStockLevel) {
    errors.push('Reorder point exceeds maximum stock level');
  }

  // VAL-OPT-004
  if (result.optimizedMetrics.recommendedSafetyStock > result.optimizedMetrics.recommendedReorderPoint) {
    errors.push('Safety stock cannot exceed reorder point');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### 3.2 Dead Stock Business Rules

| Rule ID | Rule | Validation |
|---------|------|------------|
| VAL-DS-001 | Days since movement >= 0 | `daysSinceLastMovement >= 0` |
| VAL-DS-002 | Months of stock >= 0 | `monthsOfStock >= 0` |
| VAL-DS-003 | Liquidation value <= current value | `liquidationValue <= currentValue` |
| VAL-DS-004 | Potential loss <= current value | `potentialLoss <= currentValue` |
| VAL-DS-005 | Risk level matches criteria | See risk classification |

**Risk Classification Validation**:

```typescript
function validateRiskClassification(item: DeadStockAnalysis): boolean {
  const { daysSinceLastMovement, monthsOfStock, obsolescenceRisk } = item;

  switch (obsolescenceRisk) {
    case 'critical':
      return daysSinceLastMovement > 365 || monthsOfStock > 24;
    case 'high':
      return (daysSinceLastMovement > 180 || monthsOfStock > 12) &&
             !(daysSinceLastMovement > 365 || monthsOfStock > 24);
    case 'medium':
      return (daysSinceLastMovement > 90 || monthsOfStock > 6) &&
             !(daysSinceLastMovement > 180 || monthsOfStock > 12);
    case 'low':
      return daysSinceLastMovement <= 90 && monthsOfStock <= 6;
    default:
      return false;
  }
}
```

### 3.3 Action Recommendation Rules

| Rule ID | Rule | Validation |
|---------|------|------------|
| VAL-ACT-001 | IMPLEMENT requires low risk | `risk === 'low' && savings > 100` |
| VAL-ACT-002 | PILOT requires positive savings | `savings > 50` |
| VAL-ACT-003 | REJECT for high risk or negative ROI | `risk === 'high' || savings <= 0` |

**Implementation**:

```typescript
function validateActionRecommendation(
  action: ActionType,
  risk: RiskLevel,
  savings: number
): boolean {
  switch (action) {
    case 'implement':
      return risk === 'low' && savings > 100;
    case 'pilot':
      return savings > 50;
    case 'monitor':
      return savings > 0 && risk !== 'high';
    case 'reject':
      return risk === 'high' || savings <= 0;
    default:
      return false;
  }
}
```

---

## 4. Calculation Validations

### 4.1 EOQ Calculation Validation

```typescript
function validateEOQCalculation(
  annualDemand: number,
  orderCost: number,
  holdingCost: number
): ValidationResult {
  const errors: string[] = [];

  if (annualDemand <= 0) {
    errors.push('Annual demand must be positive');
  }
  if (orderCost <= 0) {
    errors.push('Order cost must be positive');
  }
  if (holdingCost <= 0) {
    errors.push('Holding cost must be positive');
  }

  // Check for valid calculation
  if (errors.length === 0) {
    const eoq = Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
    if (!isFinite(eoq) || isNaN(eoq)) {
      errors.push('EOQ calculation resulted in invalid value');
    }
  }

  return { valid: errors.length === 0, errors };
}
```

### 4.2 Safety Stock Calculation Validation

```typescript
function validateSafetyStockCalculation(
  zScore: number,
  demandStdDev: number,
  leadTime: number
): ValidationResult {
  const errors: string[] = [];

  if (zScore <= 0) {
    errors.push('Z-score must be positive');
  }
  if (demandStdDev < 0) {
    errors.push('Demand standard deviation cannot be negative');
  }
  if (leadTime <= 0) {
    errors.push('Lead time must be positive');
  }

  // Check for valid calculation
  if (errors.length === 0) {
    const safetyStock = zScore * demandStdDev * Math.sqrt(leadTime);
    if (!isFinite(safetyStock) || isNaN(safetyStock)) {
      errors.push('Safety stock calculation resulted in invalid value');
    }
  }

  return { valid: errors.length === 0, errors };
}
```

### 4.3 Financial Calculation Validation

```typescript
function validateFinancialCalculation(
  value: number,
  type: 'savings' | 'cost' | 'value'
): ValidationResult {
  const errors: string[] = [];

  if (!isFinite(value) || isNaN(value)) {
    errors.push(`${type} calculation resulted in invalid value`);
  }

  if (type === 'value' && value < 0) {
    errors.push('Value cannot be negative');
  }

  if (type === 'cost' && value < 0) {
    errors.push('Cost cannot be negative');
  }

  // Check for precision issues
  if (Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    errors.push(`${type} exceeds safe calculation range`);
  }

  return { valid: errors.length === 0, errors };
}
```

---

## 5. State Transition Validations

### 5.1 Recommendation State Transitions

| Current State | Valid Transitions | Invalid Transitions |
|---------------|-------------------|---------------------|
| pending | in_review, applied, rejected | - |
| in_review | applied, rejected, pending | - |
| applied | - | pending, in_review |
| rejected | pending (re-evaluate) | applied |

**Implementation**:

```typescript
type RecommendationState = 'pending' | 'in_review' | 'applied' | 'rejected';

const validTransitions: Record<RecommendationState, RecommendationState[]> = {
  pending: ['in_review', 'applied', 'rejected'],
  in_review: ['applied', 'rejected', 'pending'],
  applied: [],
  rejected: ['pending'],
};

function validateStateTransition(
  currentState: RecommendationState,
  newState: RecommendationState
): boolean {
  return validTransitions[currentState].includes(newState);
}
```

### 5.2 Dead Stock Action State Transitions

| Current Action | Valid Next Actions |
|----------------|-------------------|
| identified | continue_stocking, reduce_stock, liquidate, return_to_supplier, write_off |
| reduce_stock | liquidate, return_to_supplier, write_off, continue_stocking |
| liquidate | write_off (if unsold) |
| return_to_supplier | write_off (if rejected) |
| write_off | - (terminal state) |

---

## 6. Error Messages

### 6.1 Input Validation Errors

| Code | Message | Resolution |
|------|---------|------------|
| ERR_VAL_001 | Invalid item ID format | Ensure item ID is a valid UUID |
| ERR_VAL_002 | Service level out of range | Set service level between 50% and 99% |
| ERR_VAL_003 | Threshold days out of range | Set threshold between 1 and 730 days |
| ERR_VAL_004 | Invalid risk level | Select low, medium, high, or critical |
| ERR_VAL_005 | Order cost must be positive | Enter a positive order cost value |
| ERR_VAL_006 | Holding cost rate out of range | Set rate between 1% and 100% |

### 6.2 Business Rule Errors

| Code | Message | Resolution |
|------|---------|------------|
| ERR_BUS_001 | EOQ exceeds annual demand | Review demand calculation or manually adjust |
| ERR_BUS_002 | Insufficient historical data | Wait for more transaction history |
| ERR_BUS_003 | Reorder point exceeds capacity | Reduce reorder point or increase storage |
| ERR_BUS_004 | Invalid action for risk level | Review recommendation criteria |
| ERR_BUS_005 | Savings calculation invalid | Check input parameters |

### 6.3 Calculation Errors

| Code | Message | Resolution |
|------|---------|------------|
| ERR_CALC_001 | Division by zero in EOQ | Verify holding cost is non-zero |
| ERR_CALC_002 | Negative square root | Check input values for sign errors |
| ERR_CALC_003 | Overflow in calculation | Reduce input scale or use batching |
| ERR_CALC_004 | Invalid date range | Verify date parameters are logical |

---

## 7. Validation Response Format

### 7.1 Success Response

```typescript
interface ValidationSuccess {
  valid: true;
  data: any;
  warnings?: string[];
}
```

### 7.2 Error Response

```typescript
interface ValidationError {
  valid: false;
  errors: Array<{
    code: string;
    field: string;
    message: string;
    details?: any;
  }>;
}
```

### 7.3 Example Responses

**Success with Warning**:
```json
{
  "valid": true,
  "data": { ... },
  "warnings": [
    "Some items have less than 90 days of history and may have less accurate recommendations"
  ]
}
```

**Validation Error**:
```json
{
  "valid": false,
  "errors": [
    {
      "code": "ERR_VAL_002",
      "field": "serviceLevel",
      "message": "Service level out of range",
      "details": {
        "provided": 1.5,
        "min": 0.5,
        "max": 0.99
      }
    }
  ]
}
```

---

## 8. Client-Side Validation

### 8.1 Form Validation with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(OptimizationParamsSchema),
  defaultValues: {
    serviceLevel: 0.95,
    includeAllItems: false,
  },
});
```

### 8.2 Real-time Validation

```typescript
// Debounced validation for numeric inputs
const validateServiceLevel = useDebouncedCallback((value: number) => {
  if (value < 0.5 || value > 0.99) {
    setError('serviceLevel', {
      type: 'manual',
      message: 'Service level must be between 50% and 99%',
    });
  } else {
    clearErrors('serviceLevel');
  }
}, 300);
```

---

## 9. API Validation Middleware

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: NextRequest, data: T) => Promise<Response>
) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            valid: false,
            errors: result.error.errors.map(err => ({
              code: 'ERR_VAL',
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      return handler(req, result.data);
    } catch (error) {
      return NextResponse.json(
        {
          valid: false,
          errors: [{ code: 'ERR_PARSE', message: 'Invalid request body' }],
        },
        { status: 400 }
      );
    }
  };
}
```

---

**Document End**
