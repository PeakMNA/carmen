# Validations: Demand Forecasting

## Document Information
- **Module**: Operational Planning
- **Component**: Demand Forecasting
- **Version**: 1.0.0
- **Last Updated**: 2025-12-05
- **Status**: Active - For Implementation

## Related Documents
- [Business Requirements](./BR-demand-forecasting.md) - Functional and business rules
- [Use Cases](./UC-demand-forecasting.md) - User workflows and scenarios
- [Technical Specification](./TS-demand-forecasting.md) - System architecture and components
- [Data Definition](./DD-demand-forecasting.md) - Database entity descriptions
- [Flow Diagrams](./FD-demand-forecasting.md) - Visual workflow diagrams
- [Inventory Operations Shared Method](../../shared-methods/inventory-operations/SM-inventory-operations.md) - Inventory transaction patterns
- [Costing Methods Shared Method](../../shared-methods/inventory-valuation/SM-costing-methods.md) - FIFO/AVG costing integration

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-05 | Documentation Team | Initial version |

---

## 1. Input Parameter Validations

### 1.1 Forecast Generation Parameters

| Parameter | Type | Required | Constraints | Default | Error Message |
|-----------|------|----------|-------------|---------|---------------|
| itemIds | string[] | No | Valid UUIDs | All active | "Invalid item ID format" |
| forecastDays | number | No | 1-365, integer | 30 | "Forecast period must be 1-365 days" |
| method | enum | No | Valid method name | moving_average | "Invalid forecast method" |

**Forecast Method Enum Values**:
- `moving_average`
- `exponential_smoothing`
- `linear_regression`
- `seasonal_decomposition`

**Validation Rules**:
```typescript
// VAL-DF-001: Forecast Days Range
forecastDays >= 1 && forecastDays <= 365

// VAL-DF-002: Valid Forecast Method
['moving_average', 'exponential_smoothing', 'linear_regression', 'seasonal_decomposition'].includes(method)

// VAL-DF-003: Item ID Format
itemIds.every(id => isValidUUID(id))
```

### 1.2 Trend Analysis Parameters

| Parameter | Type | Required | Constraints | Default | Error Message |
|-----------|------|----------|-------------|---------|---------------|
| itemIds | string[] | No | Valid UUIDs | All active | "Invalid item ID format" |
| analysisStartDate | Date | No | Not future, < endDate | 180 days ago | "Start date cannot be in the future" |
| analysisEndDate | Date | No | Not future, > startDate | Today | "End date cannot be in the future" |

**Validation Rules**:
```typescript
// VAL-DF-004: Date Range Validity
analysisStartDate < analysisEndDate

// VAL-DF-005: Dates Not Future
analysisEndDate <= new Date()

// VAL-DF-006: Minimum Analysis Period
(analysisEndDate - analysisStartDate) >= 7 days
```

### 1.3 Optimization Parameters

| Parameter | Type | Required | Constraints | Default | Error Message |
|-----------|------|----------|-------------|---------|---------------|
| itemIds | string[] | No | Valid UUIDs | All active | "Invalid item ID format" |
| targetServiceLevel | number | No | 80.0-99.0 | 95.0 | "Service level must be 80-99%" |

**Validation Rules**:
```typescript
// VAL-DF-007: Service Level Range
targetServiceLevel >= 80.0 && targetServiceLevel <= 99.0

// VAL-DF-008: Service Level Precision
Number.isFinite(targetServiceLevel) && !isNaN(targetServiceLevel)
```

### 1.4 Dead Stock Analysis Parameters

| Parameter | Type | Required | Constraints | Default | Error Message |
|-----------|------|----------|-------------|---------|---------------|
| thresholdDays | number | No | 30-365, integer | 90 | "Threshold must be 30-365 days" |
| locationIds | string[] | No | Valid UUIDs | All locations | "Invalid location ID format" |

**Validation Rules**:
```typescript
// VAL-DF-009: Threshold Days Range
thresholdDays >= 30 && thresholdDays <= 365

// VAL-DF-010: Threshold Days Integer
Number.isInteger(thresholdDays)

// VAL-DF-011: Location ID Format
locationIds.every(id => isValidUUID(id))
```

### 1.5 Dashboard Parameters

| Parameter | Type | Required | Constraints | Default | Error Message |
|-----------|------|----------|-------------|---------|---------------|
| periodDays | number | No | 7, 30, 90, 365 | 30 | "Period must be 7, 30, 90, or 365 days" |
| locationIds | string[] | No | Valid UUIDs | All locations | "Invalid location ID format" |

**Validation Rules**:
```typescript
// VAL-DF-012: Valid Period Values
[7, 30, 90, 365].includes(periodDays)
```

---

## 2. Data Quality Validations

### 2.1 Historical Data Requirements

| Validation | Rule | Action on Failure |
|------------|------|-------------------|
| VAL-DF-013 | Moving Average requires ≥1 data point | Return zero forecast |
| VAL-DF-014 | Exponential Smoothing requires ≥1 data point | Return zero forecast |
| VAL-DF-015 | Linear Regression requires ≥2 data points | Fallback to Moving Average |
| VAL-DF-016 | Seasonal Decomposition requires ≥60 data points | Fallback to Linear Regression |

**Implementation**:
```typescript
// VAL-DF-013 to VAL-DF-016: Data Sufficiency Check
function validateDataSufficiency(dataPoints: number[], method: string): ValidationResult {
  const count = dataPoints.length;

  switch (method) {
    case 'seasonal_decomposition':
      if (count < 60) return { valid: false, fallback: 'linear_regression' };
      break;
    case 'linear_regression':
      if (count < 2) return { valid: false, fallback: 'moving_average' };
      break;
    case 'moving_average':
    case 'exponential_smoothing':
      if (count < 1) return { valid: false, fallback: null, zeroForecast: true };
      break;
  }
  return { valid: true };
}
```

### 2.2 Stock Data Validation

| Validation | Rule | Action on Failure |
|------------|------|-------------------|
| VAL-DF-017 | Current stock must be ≥0 | Use 0 as minimum |
| VAL-DF-018 | Item must be active for forecasting | Skip inactive items |
| VAL-DF-019 | Item must have valid category | Use "Uncategorized" |

**Implementation**:
```typescript
// VAL-DF-017: Non-Negative Stock
const validatedStock = Math.max(0, currentStock);

// VAL-DF-018: Active Item Filter
const activeItems = items.filter(item => item.is_active === true);

// VAL-DF-019: Category Fallback
const category = item.categories?.name || 'Uncategorized';
```

---

## 3. Calculation Validations

### 3.1 Forecast Output Validations

| Validation | Rule | Correction |
|------------|------|------------|
| VAL-DF-020 | projectedDemand ≥ 0 | Math.max(0, value) |
| VAL-DF-021 | projectedEndingStock ≥ 0 | Math.max(0, value) |
| VAL-DF-022 | recommendedPurchaseQuantity ≥ 0 | Math.max(0, value) |
| VAL-DF-023 | forecastAccuracy ∈ [0, 1] | Clamp to range |
| VAL-DF-024 | seasonalityFactor ∈ [0.1, 10] | Clamp to range |
| VAL-DF-025 | trendFactor ∈ [0.1, 10] | Clamp to range |
| VAL-DF-026 | demandVariability ≥ 0 | Math.max(0, value) |
| VAL-DF-027 | confidenceLevel ∈ [0, 100] | Clamp to range |

**Implementation**:
```typescript
// VAL-DF-020 to VAL-DF-027: Output Validation
function validateForecastOutput(forecast: InventoryForecast): InventoryForecast {
  return {
    ...forecast,
    projectedDemand: Math.max(0, forecast.projectedDemand),
    projectedEndingStock: Math.max(0, forecast.projectedEndingStock),
    recommendedPurchaseQuantity: Math.max(0, forecast.recommendedPurchaseQuantity),
    forecastAccuracy: clamp(forecast.forecastAccuracy, 0, 1),
    seasonalityFactor: clamp(forecast.seasonalityFactor, 0.1, 10),
    trendFactor: clamp(forecast.trendFactor, 0.1, 10),
    demandVariability: Math.max(0, forecast.demandVariability),
    confidenceLevel: clamp(forecast.confidenceLevel, 0, 100)
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

### 3.2 Risk Assessment Validations

| Validation | Rule | Classification |
|------------|------|----------------|
| VAL-DF-028 | riskScore < 0.8 | 'low' |
| VAL-DF-029 | riskScore ∈ [0.8, 1.5] | 'medium' |
| VAL-DF-030 | riskScore > 1.5 | 'high' |

**Implementation**:
```typescript
// VAL-DF-028 to VAL-DF-030: Risk Level Classification
function classifyRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
  if (riskScore > 1.5) return 'high';
  if (riskScore >= 0.8) return 'medium';
  return 'low';
}
```

### 3.3 Dead Stock Validations

| Validation | Rule | Classification |
|------------|------|----------------|
| VAL-DF-031 | daysSinceMovement > 365 OR monthsOfStock > 24 | 'critical' |
| VAL-DF-032 | daysSinceMovement > 180 OR monthsOfStock > 12 | 'high' |
| VAL-DF-033 | daysSinceMovement > 90 OR monthsOfStock > 6 | 'medium' |
| VAL-DF-034 | Otherwise | 'low' |

**Implementation**:
```typescript
// VAL-DF-031 to VAL-DF-034: Obsolescence Risk Classification
function classifyObsolescenceRisk(
  daysSinceMovement: number,
  monthsOfStock: number
): 'low' | 'medium' | 'high' | 'critical' {
  if (daysSinceMovement > 365 || monthsOfStock > 24) return 'critical';
  if (daysSinceMovement > 180 || monthsOfStock > 12) return 'high';
  if (daysSinceMovement > 90 || monthsOfStock > 6) return 'medium';
  return 'low';
}
```

---

## 4. Business Rule Validations

### 4.1 Safety Stock Calculation

| Validation | Rule | Formula |
|------------|------|---------|
| VAL-DF-035 | Safety stock uses 95% service level | safetyStock = projectedDemand × variability × 1.65 |
| VAL-DF-036 | Safety stock minimum is 0 | Math.max(0, calculated) |

**Implementation**:
```typescript
// VAL-DF-035 to VAL-DF-036: Safety Stock Validation
function calculateSafetyStock(projectedDemand: number, variability: number): number {
  const serviceFactorZ95 = 1.65; // Z-score for 95% service level
  const safetyStock = projectedDemand * variability * serviceFactorZ95;
  return Math.max(0, safetyStock);
}
```

### 4.2 Recommended Purchase Calculation

| Validation | Rule | Formula |
|------------|------|---------|
| VAL-DF-037 | Purchase = max(0, (demand + safety) - stock) | Must be non-negative |

**Implementation**:
```typescript
// VAL-DF-037: Recommended Purchase Validation
function calculateRecommendedPurchase(
  projectedDemand: number,
  safetyStock: number,
  currentStock: number
): number {
  return Math.max(0, (projectedDemand + safetyStock) - currentStock);
}
```

### 4.3 Optimization Action Thresholds

| Validation | Rule | Action |
|------------|------|--------|
| VAL-DF-038 | savings > 100 AND risk = 'low' | 'implement' |
| VAL-DF-039 | savings > 50 | 'pilot' |
| VAL-DF-040 | savings ≤ 50 AND risk ≠ 'high' | 'monitor' |
| VAL-DF-041 | Otherwise | 'reject' |

**Implementation**:
```typescript
// VAL-DF-038 to VAL-DF-041: Action Determination
function determineAction(
  totalSavings: number,
  risk: 'low' | 'medium' | 'high'
): 'implement' | 'pilot' | 'monitor' | 'reject' {
  if (totalSavings > 100 && risk === 'low') return 'implement';
  if (totalSavings > 50) return 'pilot';
  if (risk === 'high') return 'reject';
  return 'monitor';
}
```

---

## 5. Error Messages

### 5.1 Parameter Validation Errors

| Error Code | Message | Resolution |
|------------|---------|------------|
| VAL-ERR-001 | "Forecast period must be between 1 and 365 days" | Enter valid integer 1-365 |
| VAL-ERR-002 | "Invalid forecast method: {method}" | Use valid method name |
| VAL-ERR-003 | "Invalid item ID format: {id}" | Provide valid UUID |
| VAL-ERR-004 | "Analysis start date must be before end date" | Correct date range |
| VAL-ERR-005 | "Dates cannot be in the future" | Use past or current dates |
| VAL-ERR-006 | "Service level must be between 80% and 99%" | Enter value in range |
| VAL-ERR-007 | "Threshold must be between 30 and 365 days" | Enter valid integer |
| VAL-ERR-008 | "Invalid location ID format: {id}" | Provide valid UUID |
| VAL-ERR-009 | "Period must be 7, 30, 90, or 365 days" | Select valid period |

### 5.2 Data Validation Warnings

| Warning Code | Message | Action |
|--------------|---------|--------|
| VAL-WARN-001 | "Insufficient data for seasonal analysis, using linear regression" | Auto fallback |
| VAL-WARN-002 | "Insufficient data for linear regression, using moving average" | Auto fallback |
| VAL-WARN-003 | "No transaction history, returning zero forecast" | Zero forecast returned |
| VAL-WARN-004 | "Item {name} is inactive, skipped" | Item excluded |
| VAL-WARN-005 | "Category not found for {item}, using 'Uncategorized'" | Default applied |

### 5.3 Calculation Errors

| Error Code | Message | Resolution |
|------------|---------|------------|
| VAL-ERR-010 | "Failed to generate forecast: {details}" | Check data integrity |
| VAL-ERR-011 | "Failed to perform trend analysis: {details}" | Check date range |
| VAL-ERR-012 | "Failed to generate recommendations: {details}" | Retry operation |
| VAL-ERR-013 | "Failed to analyze dead stock: {details}" | Check location access |
| VAL-ERR-014 | "Failed to generate dashboard: {details}" | Retry operation |

---

## 6. Validation Schemas

### 6.1 Forecast Request Schema

```typescript
const ForecastRequestSchema = z.object({
  itemIds: z.array(z.string().uuid()).optional(),
  forecastDays: z.number()
    .int()
    .min(1, "Forecast period must be at least 1 day")
    .max(365, "Forecast period cannot exceed 365 days")
    .default(30),
  method: z.enum([
    'moving_average',
    'exponential_smoothing',
    'linear_regression',
    'seasonal_decomposition'
  ]).default('moving_average')
});
```

### 6.2 Trend Analysis Request Schema

```typescript
const TrendAnalysisRequestSchema = z.object({
  itemIds: z.array(z.string().uuid()).optional(),
  analysisStartDate: z.date()
    .max(new Date(), "Start date cannot be in the future")
    .optional(),
  analysisEndDate: z.date()
    .max(new Date(), "End date cannot be in the future")
    .optional()
}).refine(
  (data) => !data.analysisStartDate || !data.analysisEndDate ||
            data.analysisStartDate < data.analysisEndDate,
  { message: "Start date must be before end date" }
);
```

### 6.3 Optimization Request Schema

```typescript
const OptimizationRequestSchema = z.object({
  itemIds: z.array(z.string().uuid()).optional(),
  targetServiceLevel: z.number()
    .min(80, "Service level must be at least 80%")
    .max(99, "Service level cannot exceed 99%")
    .default(95)
});
```

### 6.4 Dead Stock Request Schema

```typescript
const DeadStockRequestSchema = z.object({
  thresholdDays: z.number()
    .int()
    .min(30, "Threshold must be at least 30 days")
    .max(365, "Threshold cannot exceed 365 days")
    .default(90),
  locationIds: z.array(z.string().uuid()).optional()
});
```

### 6.5 Dashboard Request Schema

```typescript
const DashboardRequestSchema = z.object({
  periodDays: z.number()
    .refine(val => [7, 30, 90, 365].includes(val), {
      message: "Period must be 7, 30, 90, or 365 days"
    })
    .default(30),
  locationIds: z.array(z.string().uuid()).optional()
});
```

---

## 7. Validation Summary Table

| ID | Category | Description | Severity |
|----|----------|-------------|----------|
| VAL-DF-001 | Input | Forecast days range (1-365) | Error |
| VAL-DF-002 | Input | Valid forecast method | Error |
| VAL-DF-003 | Input | Item ID UUID format | Error |
| VAL-DF-004 | Input | Date range validity | Error |
| VAL-DF-005 | Input | Dates not future | Error |
| VAL-DF-006 | Input | Minimum analysis period | Warning |
| VAL-DF-007 | Input | Service level range | Error |
| VAL-DF-008 | Input | Service level precision | Error |
| VAL-DF-009 | Input | Threshold days range | Error |
| VAL-DF-010 | Input | Threshold days integer | Error |
| VAL-DF-011 | Input | Location ID format | Error |
| VAL-DF-012 | Input | Valid period values | Error |
| VAL-DF-013 | Data | Moving average minimum data | Warning |
| VAL-DF-014 | Data | Exponential smoothing minimum data | Warning |
| VAL-DF-015 | Data | Linear regression minimum data | Warning |
| VAL-DF-016 | Data | Seasonal decomposition minimum data | Warning |
| VAL-DF-017 | Data | Non-negative stock | Correction |
| VAL-DF-018 | Data | Active item filter | Filter |
| VAL-DF-019 | Data | Category fallback | Correction |
| VAL-DF-020-027 | Calculation | Output range validation | Correction |
| VAL-DF-028-030 | Calculation | Risk level classification | Classification |
| VAL-DF-031-034 | Calculation | Obsolescence risk classification | Classification |
| VAL-DF-035-036 | Business | Safety stock calculation | Calculation |
| VAL-DF-037 | Business | Purchase recommendation | Calculation |
| VAL-DF-038-041 | Business | Action determination | Classification |

---

**Document End**
