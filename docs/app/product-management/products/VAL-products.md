# Validations: Products

**Module**: Product Management
**Sub-Module**: Products
**Route**: `/product-management/products`
**Document Version**: 1.1
**Last Updated**: 2025-11-26

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-11-26 | Documentation Team | Added route reference, aligned with BR-products.md |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

This document defines all validation rules for the Products module, including field-level validations, business rule validations, cross-field validations, and integration validations. Each validation specifies the rule, trigger condition, error message, and severity level.

**Validation Layers**:
1. **Client-Side Validation**: Immediate feedback using Zod schemas in React Hook Form
2. **Server-Side Validation**: Authoritative validation before database operations
3. **Database Constraints**: Final enforcement at database level
4. **Business Rule Validation**: Complex multi-entity validation logic

**Severity Levels**:
- **ERROR**: Blocks operation, must be fixed
- **WARNING**: Allows operation with user acknowledgment
- **INFO**: Informational message, no action required

---

## 2. Field-Level Validations

### 2.1 Product Identification Fields

#### VAL-PROD-001: Product Code Validation

**Field**: `product_code`

**Rules**:
- **Required**: Must not be null or empty
- **Length**: 1-50 characters
- **Format**: Alphanumeric with dashes (-) and underscores (_) only
- **Uniqueness**: Must be unique across all active products (case-insensitive)
- **Immutability**: Cannot be changed after creation

**Zod Schema**:
```typescript
productCode: z.string()
  .min(1, "Product code is required")
  .max(50, "Product code must not exceed 50 characters")
  .regex(/^[A-Z0-9_-]+$/i, "Product code must contain only letters, numbers, dashes, and underscores")
  .transform(val => val.toUpperCase())
```

**Error Messages**:
- **Missing**: "Product code is required"
- **Too Long**: "Product code must not exceed 50 characters"
- **Invalid Format**: "Product code must contain only letters, numbers, dashes, and underscores"
- **Duplicate**: "Product code '{code}' already exists. Please use a unique code."
- **Immutable**: "Product code cannot be changed after creation"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create, on update attempt
- Database: UNIQUE constraint

**Severity**: ERROR

---

#### VAL-PROD-002: Product Name Validation

**Field**: `product_name`

**Rules**:
- **Required**: Must not be null or empty
- **Length**: 1-255 characters
- **Whitespace**: Cannot be only whitespace
- **Uniqueness**: Should be unique within category (warning only)

**Zod Schema**:
```typescript
productName: z.string()
  .min(1, "Product name is required")
  .max(255, "Product name must not exceed 255 characters")
  .refine(val => val.trim().length > 0, "Product name cannot be only whitespace")
```

**Error Messages**:
- **Missing**: "Product name is required"
- **Too Long**: "Product name must not exceed 255 characters"
- **Whitespace Only**: "Product name cannot be only whitespace"
- **Duplicate Warning**: "A product with this name already exists in the same category"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create, on update
- Database: NOT NULL constraint

**Severity**: ERROR (required, length), WARNING (duplicate)

---

#### VAL-PROD-003: Barcode Validation

**Field**: `barcode`

**Rules**:
- **Optional**: Can be null
- **Length**: 1-50 characters when provided
- **Format**: Should match standard barcode formats (EAN-13, UPC-A, Code 128)
- **Uniqueness**: Should be unique (warning only)

**Zod Schema**:
```typescript
barcode: z.string()
  .max(50, "Barcode must not exceed 50 characters")
  .regex(/^[0-9A-Z-]+$/, "Invalid barcode format")
  .optional()
  .or(z.literal(''))
```

**Error Messages**:
- **Too Long**: "Barcode must not exceed 50 characters"
- **Invalid Format**: "Barcode format is invalid. Expected EAN-13, UPC-A, or Code 128"
- **Duplicate Warning**: "This barcode is already assigned to another product: {product_name}"

**Validation Timing**:
- Client: On blur
- Server: On create, on update

**Severity**: ERROR (length, format), WARNING (duplicate)

---

#### VAL-PROD-004: SKU Validation

**Field**: `sku`

**Rules**:
- **Optional**: Can be null
- **Length**: 1-50 characters when provided
- **Format**: Alphanumeric with dashes and underscores only
- **Uniqueness**: Must be unique when provided

**Zod Schema**:
```typescript
sku: z.string()
  .max(50, "SKU must not exceed 50 characters")
  .regex(/^[A-Z0-9_-]+$/i, "SKU must contain only letters, numbers, dashes, and underscores")
  .optional()
  .or(z.literal(''))
```

**Error Messages**:
- **Too Long**: "SKU must not exceed 50 characters"
- **Invalid Format**: "SKU must contain only letters, numbers, dashes, and underscores"
- **Duplicate**: "SKU '{sku}' is already assigned to another product"

**Validation Timing**:
- Client: On blur
- Server: On create, on update
- Database: UNIQUE constraint (when not null)

**Severity**: ERROR

---

### 2.2 Classification Fields

#### VAL-PROD-005: Category Selection Validation

**Fields**: `category_id`, `subcategory_id`, `item_group_id`

**Rules**:
- **category_id**: Required, must reference existing active category
- **subcategory_id**: Optional, must reference existing active subcategory that belongs to selected category
- **item_group_id**: Required, must reference existing active item group

**Zod Schema**:
```typescript
categoryId: z.string()
  .uuid("Invalid category")
  .min(1, "Category is required"),

subcategoryId: z.string()
  .uuid("Invalid subcategory")
  .optional()
  .or(z.literal('')),

itemGroupId: z.string()
  .uuid("Invalid item group")
  .min(1, "Item group is required")
```

**Error Messages**:
- **Category Missing**: "Category is required"
- **Category Invalid**: "Selected category does not exist or is inactive"
- **Subcategory Invalid**: "Selected subcategory does not belong to the chosen category"
- **Item Group Missing**: "Item group is required"
- **Item Group Invalid**: "Selected item group does not exist or is inactive"

**Validation Timing**:
- Client: On change, on submit
- Server: On create, on update

**Severity**: ERROR

---

### 2.3 Unit Fields

#### VAL-PROD-006: Primary Inventory Unit Validation

**Field**: `primary_inventory_unit_id`

**Rules**:
- **Required**: Must not be null
- **Existence**: Must reference existing active unit
- **Immutability**: Cannot be changed after product has transactions

**Zod Schema**:
```typescript
primaryInventoryUnitId: z.string()
  .uuid("Invalid unit")
  .min(1, "Primary inventory unit is required")
```

**Error Messages**:
- **Missing**: "Primary inventory unit is required"
- **Invalid**: "Selected unit does not exist or is inactive"
- **Immutable**: "Primary inventory unit cannot be changed because product has existing transactions"

**Validation Timing**:
- Client: On change, on submit
- Server: On create, on update
- Database: NOT NULL, FOREIGN KEY constraint

**Severity**: ERROR

---

#### VAL-PROD-007: Unit Conversion Factor Validation

**Field**: `conversion_factor` (in product_units table)

**Rules**:
- **Required**: Must not be null
- **Positive**: Must be greater than 0
- **Precision**: Maximum 5 decimal places
- **Range**: 0.00001 to 9999999.99999
- **Base Unit**: INVENTORY unit type must have factor = 1.00000

**Zod Schema**:
```typescript
conversionFactor: z.number()
  .positive("Conversion factor must be greater than 0")
  .max(9999999.99999, "Conversion factor is too large")
  .refine(val => {
    const decimals = val.toString().split('.')[1]?.length || 0
    return decimals <= 5
  }, 'Conversion factor cannot have more than 5 decimal places')
```

**Error Messages**:
- **Missing**: "Conversion factor is required"
- **Not Positive**: "Conversion factor must be greater than 0"
- **Too Many Decimals**: "Conversion factor cannot have more than 5 decimal places"
- **Too Large**: "Conversion factor cannot exceed 9,999,999.99999"
- **Base Unit Invalid**: "Inventory unit must have conversion factor of 1.00000"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create unit, on update unit
- Database: CHECK constraint

**Severity**: ERROR

---

### 2.4 Cost and Price Fields

#### VAL-PROD-008: Standard Cost Validation

**Field**: `standard_cost`

**Rules**:
- **Optional**: Can be null
- **Non-Negative**: Must be >= 0 when provided
- **Precision**: Maximum 5 decimal places
- **Range**: 0.00000 to 9999999999.99999

**Zod Schema**:
```typescript
standardCost: z.number()
  .nonnegative("Standard cost cannot be negative")
  .max(9999999999.99999, "Standard cost is too large")
  .refine(val => {
    const decimals = val.toString().split('.')[1]?.length || 0
    return decimals <= 5
  }, 'Standard cost cannot have more than 5 decimal places')
  .optional()
  .or(z.literal(null))
```

**Error Messages**:
- **Negative**: "Standard cost cannot be negative"
- **Too Many Decimals**: "Standard cost cannot have more than 5 decimal places"
- **Too Large**: "Standard cost cannot exceed 9,999,999,999.99999"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create, on update
- Database: CHECK constraint

**Severity**: ERROR

---

#### VAL-PROD-009: Base Price Validation

**Field**: `base_price`

**Rules**:
- **Optional**: Can be null
- **Non-Negative**: Must be >= 0 when provided
- **Precision**: Maximum 5 decimal places
- **Required If**: If `is_for_sale` is true, base price should be provided (warning)

**Zod Schema**:
```typescript
basePrice: z.number()
  .nonnegative("Base price cannot be negative")
  .max(9999999999.99999, "Base price is too large")
  .refine(val => {
    const decimals = val.toString().split('.')[1]?.length || 0
    return decimals <= 5
  }, 'Base price cannot have more than 5 decimal places')
  .optional()
  .or(z.literal(null))
```

**Error Messages**:
- **Negative**: "Base price cannot be negative"
- **Too Many Decimals**: "Base price cannot have more than 5 decimal places"
- **Too Large**: "Base price cannot exceed 9,999,999,999.99999"
- **Warning**: "Base price is recommended for products marked as 'For Sale'"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create, on update
- Database: CHECK constraint

**Severity**: ERROR (negative, precision), WARNING (missing when for sale)

---

#### VAL-PROD-010: Tax Type and Rate Validation

**Fields**: `tax_type`, `tax_rate`

**Rules**:
- **tax_type**: Optional, must be one of: ADDED_TAX, INCLUDED_TAX, NONE
- **tax_rate**: Required if tax_type is not NONE, must be 0-100, maximum 2 decimal places

**Zod Schema**:
```typescript
taxType: z.enum(['ADDED_TAX', 'INCLUDED_TAX', 'NONE'])
  .optional(),

taxRate: z.number()
  .min(0, "Tax rate cannot be negative")
  .max(100, "Tax rate cannot exceed 100%")
  .refine(val => {
    const decimals = val.toString().split('.')[1]?.length || 0
    return decimals <= 2
  }, 'Tax rate cannot have more than 2 decimal places')
  .optional()
  .or(z.literal(null))
```

**Cross-Field Validation**:
```typescript
.refine(data => {
  if (data.taxType && data.taxType !== 'NONE') {
    return data.taxRate !== null && data.taxRate !== undefined
  }
  return true
}, 'Tax rate is required when tax type is specified')
```

**Error Messages**:
- **Invalid Type**: "Tax type must be ADDED_TAX, INCLUDED_TAX, or NONE"
- **Rate Required**: "Tax rate is required when tax type is specified"
- **Negative Rate**: "Tax rate cannot be negative"
- **Rate Too High**: "Tax rate cannot exceed 100%"
- **Too Many Decimals**: "Tax rate cannot have more than 2 decimal places"

**Validation Timing**:
- Client: On change, on blur, on submit
- Server: On create, on update

**Severity**: ERROR

---

### 2.5 Deviation Limit Fields

#### VAL-PROD-011: Price Deviation Limit Validation

**Field**: `price_deviation_limit`

**Rules**:
- **Optional**: Can be null
- **Range**: 0-100 (percentage) when provided
- **Precision**: Maximum 2 decimal places

**Zod Schema**:
```typescript
priceDeviationLimit: z.number()
  .min(0, "Price deviation limit cannot be negative")
  .max(100, "Price deviation limit cannot exceed 100%")
  .refine(val => {
    const decimals = val.toString().split('.')[1]?.length || 0
    return decimals <= 2
  }, 'Price deviation limit cannot have more than 2 decimal places')
  .optional()
  .or(z.literal(null))
```

**Error Messages**:
- **Negative**: "Price deviation limit cannot be negative"
- **Too High**: "Price deviation limit cannot exceed 100%"
- **Too Many Decimals**: "Price deviation limit cannot have more than 2 decimal places"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create, on update

**Severity**: ERROR

---

#### VAL-PROD-012: Quantity Deviation Limit Validation

**Field**: `quantity_deviation_limit`

**Rules**:
- **Optional**: Can be null
- **Range**: 0-100 (percentage) when provided
- **Precision**: Maximum 2 decimal places

**Zod Schema**:
```typescript
quantityDeviationLimit: z.number()
  .min(0, "Quantity deviation limit cannot be negative")
  .max(100, "Quantity deviation limit cannot exceed 100%")
  .refine(val => {
    const decimals = val.toString().split('.')[1]?.length || 0
    return decimals <= 2
  }, 'Quantity deviation limit cannot have more than 2 decimal places')
  .optional()
  .or(z.literal(null))
```

**Error Messages**:
- **Negative**: "Quantity deviation limit cannot be negative"
- **Too High**: "Quantity deviation limit cannot exceed 100%"
- **Too Many Decimals**: "Quantity deviation limit cannot have more than 2 decimal places"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create, on update

**Severity**: ERROR

---

### 2.6 Stock Level Fields

#### VAL-PROD-013: Minimum Stock Level Validation

**Field**: `minimum_stock_level` (in products and product_locations tables)

**Rules**:
- **Non-Negative**: Must be >= 0
- **Precision**: Maximum 3 decimal places

**Zod Schema**:
```typescript
minimumStockLevel: z.number()
  .nonnegative("Minimum stock level cannot be negative")
  .refine(val => {
    const decimals = val.toString().split('.')[1]?.length || 0
    return decimals <= 3
  }, 'Minimum stock level cannot have more than 3 decimal places')
```

**Error Messages**:
- **Negative**: "Minimum stock level cannot be negative"
- **Too Many Decimals**: "Minimum stock level cannot have more than 3 decimal places"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create, on update
- Database: CHECK constraint

**Severity**: ERROR

---

#### VAL-PROD-014: Maximum Stock Level Validation

**Field**: `maximum_stock_level` (in products and product_locations tables)

**Rules**:
- **Non-Negative**: Must be >= 0
- **Greater Than Min**: Must be >= minimum_stock_level
- **Precision**: Maximum 3 decimal places

**Zod Schema**:
```typescript
maximumStockLevel: z.number()
  .nonnegative("Maximum stock level cannot be negative")
  .refine(val => {
    const decimals = val.toString().split('.')[1]?.length || 0
    return decimals <= 3
  }, 'Maximum stock level cannot have more than 3 decimal places')
```

**Cross-Field Validation**:
```typescript
.refine(data => {
  if (data.minimumStockLevel !== null && data.maximumStockLevel !== null) {
    return data.maximumStockLevel >= data.minimumStockLevel
  }
  return true
}, 'Maximum stock level must be greater than or equal to minimum stock level')
```

**Error Messages**:
- **Negative**: "Maximum stock level cannot be negative"
- **Less Than Min**: "Maximum stock level must be greater than or equal to minimum stock level"
- **Too Many Decimals**: "Maximum stock level cannot have more than 3 decimal places"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create, on update
- Database: CHECK constraint

**Severity**: ERROR

---

### 2.7 Physical Property Fields

#### VAL-PROD-015: Weight Validation

**Field**: `weight`

**Rules**:
- **Optional**: Can be null
- **Positive**: Must be > 0 when provided
- **Precision**: Maximum 3 decimal places
- **Range**: 0.001 to 999999.999

**Zod Schema**:
```typescript
weight: z.number()
  .positive("Weight must be greater than 0")
  .max(999999.999, "Weight is too large")
  .refine(val => {
    const decimals = val.toString().split('.')[1]?.length || 0
    return decimals <= 3
  }, 'Weight cannot have more than 3 decimal places')
  .optional()
  .or(z.literal(null))
```

**Error Messages**:
- **Not Positive**: "Weight must be greater than 0"
- **Too Large**: "Weight cannot exceed 999,999.999"
- **Too Many Decimals**: "Weight cannot have more than 3 decimal places"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create, on update

**Severity**: ERROR

---

#### VAL-PROD-016: Shelf Life Validation

**Field**: `shelf_life` (in days)

**Rules**:
- **Optional**: Can be null
- **Positive**: Must be > 0 when provided
- **Integer**: Must be whole number
- **Range**: 1 to 9999 days

**Zod Schema**:
```typescript
shelfLife: z.number()
  .int("Shelf life must be a whole number")
  .positive("Shelf life must be greater than 0")
  .max(9999, "Shelf life cannot exceed 9999 days")
  .optional()
  .or(z.literal(null))
```

**Error Messages**:
- **Not Integer**: "Shelf life must be a whole number"
- **Not Positive**: "Shelf life must be greater than 0"
- **Too Large**: "Shelf life cannot exceed 9999 days"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create, on update

**Severity**: ERROR

---

### 2.8 Description Fields

#### VAL-PROD-017: Description Field Validations

**Fields**: `description`, `local_description`, `storage_instructions`, `notes`

**Rules**:
- **Optional**: All can be null
- **Length**: Maximum 65535 characters (TEXT field)
- **Sanitization**: HTML tags should be stripped or escaped

**Zod Schema**:
```typescript
description: z.string()
  .max(65535, "Description is too long")
  .optional()
  .or(z.literal('')),

localDescription: z.string()
  .max(255, "Local description must not exceed 255 characters")
  .optional()
  .or(z.literal('')),

storageInstructions: z.string()
  .max(65535, "Storage instructions are too long")
  .optional()
  .or(z.literal('')),

notes: z.string()
  .max(65535, "Notes are too long")
  .optional()
  .or(z.literal(''))
```

**Error Messages**:
- **Too Long**: "{Field name} is too long (maximum {max} characters)"

**Validation Timing**:
- Client: On blur, on submit
- Server: On create, on update

**Severity**: ERROR

---

## 3. Business Rule Validations

### 3.1 Product Creation Rules

#### VAL-PROD-018: Product Code Uniqueness

**Rule**: Product code must be unique across all active products (excluding soft-deleted)

**SQL Check**:
```sql
SELECT COUNT(*) FROM products
WHERE product_code = :code
  AND deleted_at IS NULL
  AND id != :current_id  -- For updates
```

**Error Message**: "Product code '{code}' already exists. Please use a unique code."

**Validation Timing**: Server-side on create/update

**Severity**: ERROR

---

#### VAL-PROD-019: Required Fields for Product Creation

**Rule**: The following fields must be provided when creating a product:
- product_code
- product_name
- category_id
- item_group_id
- primary_inventory_unit_id

**Validation Logic**:
```typescript
const requiredFields = [
  'productCode',
  'productName',
  'categoryId',
  'itemGroupId',
  'primaryInventoryUnitId'
]

const missingFields = requiredFields.filter(field => !data[field])
if (missingFields.length > 0) {
  throw new Error(`Required fields missing: ${missingFields.join(', ')}`)
}
```

**Error Message**: "Required fields missing: {field_list}"

**Validation Timing**: Server-side on create

**Severity**: ERROR

---

### 3.2 Unit Conversion Rules

#### VAL-PROD-020: Unit Type Uniqueness

**Rule**: A product cannot have the same unit assigned multiple times for the same unit type

**SQL Check**:
```sql
SELECT COUNT(*) FROM product_units
WHERE product_id = :product_id
  AND unit_id = :unit_id
  AND unit_type = :unit_type
  AND id != :current_id  -- For updates
```

**Error Message**: "This unit is already assigned as an {unit_type} unit for this product"

**Validation Timing**: Server-side on unit create/update

**Severity**: ERROR

---

#### VAL-PROD-021: Base Unit Immutability

**Rule**: Primary inventory unit cannot be changed once product has inventory transactions

**Validation Logic**:
```typescript
if (isUpdating && data.primaryInventoryUnitId !== currentProduct.primaryInventoryUnitId) {
  const hasTransactions = await checkInventoryTransactions(productId)
  if (hasTransactions) {
    throw new Error("Cannot change primary inventory unit: product has existing transactions")
  }
}
```

**Error Message**: "Cannot change primary inventory unit because product has existing transactions"

**Validation Timing**: Server-side on update

**Severity**: ERROR

---

#### VAL-PROD-022: Default Unit Constraint

**Rule**: Only one unit per unit_type can be marked as default

**Validation Logic**:
```typescript
if (data.isDefault === true) {
  // Unset default flag on other units of the same type
  await db.product_units.updateMany({
    where: {
      productId: data.productId,
      unitType: data.unitType,
      id: { not: data.id }
    },
    data: { isDefault: false }
  })
}
```

**Error Message**: (Handled automatically - existing default is unset)

**Validation Timing**: Server-side on unit create/update

**Severity**: INFO (automatic correction)

---

#### VAL-PROD-023: Inventory Unit Conversion Factor

**Rule**: INVENTORY unit type must have conversion_factor = 1.00000

**Validation Logic**:
```typescript
if (data.unitType === 'INVENTORY' && data.conversionFactor !== 1.0) {
  throw new Error("Inventory unit must have conversion factor of 1.00000")
}
```

**Error Message**: "Inventory unit must have conversion factor of 1.00000"

**Validation Timing**: Server-side on unit create/update

**Severity**: ERROR

---

### 3.3 Location Assignment Rules

#### VAL-PROD-024: Location Assignment Uniqueness

**Rule**: A product cannot be assigned to the same location multiple times

**SQL Check**:
```sql
SELECT COUNT(*) FROM product_locations
WHERE product_id = :product_id
  AND location_id = :location_id
  AND id != :current_id  -- For updates
```

**Error Message**: "Product is already assigned to this location"

**Validation Timing**: Server-side on location assignment

**Severity**: ERROR

---

#### VAL-PROD-025: Reorder Point Range

**Rule**: Reorder point should be between minimum and maximum stock levels (warning only)

**Validation Logic**:
```typescript
if (data.reorderPoint !== null) {
  if (data.reorderPoint < data.minimumStockLevel ||
      data.reorderPoint > data.maximumStockLevel) {
    return {
      type: 'WARNING',
      message: `Reorder point (${data.reorderPoint}) is outside the min/max range (${data.minimumStockLevel} - ${data.maximumStockLevel})`
    }
  }
}
```

**Warning Message**: "Reorder point ({value}) is outside the min/max range ({min} - {max}). Proceed anyway?"

**Validation Timing**: Client and server-side

**Severity**: WARNING

---

### 3.4 Product Deletion Rules

#### VAL-PROD-026: Product Deletion Prerequisites

**Rule**: Products can only be deleted if:
- Product status is DRAFT, AND
- No inventory transactions exist, AND
- Not referenced in purchase orders, AND
- Not referenced in GRNs, AND
- Not referenced in recipes, AND
- Not referenced in requisitions

**Validation Logic**:
```typescript
const canDelete = await checkProductDeletion(productId)
if (!canDelete.allowed) {
  throw new Error(
    `Cannot delete product: ${canDelete.reasons.join(', ')}. ` +
    `Consider marking as INACTIVE or DISCONTINUED instead.`
  )
}
```

**Error Message**: "Cannot delete product: {reasons}. Consider marking as INACTIVE or DISCONTINUED instead."

**Validation Timing**: Server-side on delete attempt

**Severity**: ERROR

---

### 3.5 Status Change Rules

#### VAL-PROD-027: Activation Prerequisites

**Rule**: Product can only be activated (status changed to ACTIVE) if all required fields are complete

**Validation Logic**:
```typescript
if (newStatus === 'ACTIVE') {
  const incompleteFields = []
  if (!product.productCode) incompleteFields.push('Product Code')
  if (!product.productName) incompleteFields.push('Product Name')
  if (!product.categoryId) incompleteFields.push('Category')
  if (!product.itemGroupId) incompleteFields.push('Item Group')
  if (!product.primaryInventoryUnitId) incompleteFields.push('Primary Unit')

  if (incompleteFields.length > 0) {
    throw new Error(`Cannot activate product: missing ${incompleteFields.join(', ')}`)
  }
}
```

**Error Message**: "Cannot activate product: missing {field_list}"

**Validation Timing**: Server-side on status change

**Severity**: ERROR

---

## 4. Cross-Field Validations

### 4.1 Tax Configuration Validation

#### VAL-PROD-028: Tax Rate Required When Tax Type Set

**Rule**: If tax_type is set to ADDED_TAX or INCLUDED_TAX, tax_rate must be provided

**Zod Schema**:
```typescript
.refine(data => {
  if (data.taxType && data.taxType !== 'NONE') {
    return data.taxRate !== null && data.taxRate !== undefined
  }
  return true
}, {
  message: "Tax rate is required when tax type is specified",
  path: ['taxRate']
})
```

**Error Message**: "Tax rate is required when tax type is specified"

**Validation Timing**: Client and server-side

**Severity**: ERROR

---

### 4.2 Stock Level Consistency Validation

#### VAL-PROD-029: Maximum Greater Than or Equal to Minimum

**Rule**: Maximum stock level must be greater than or equal to minimum stock level

**Zod Schema**:
```typescript
.refine(data => {
  if (data.minimumStockLevel !== null && data.maximumStockLevel !== null) {
    return data.maximumStockLevel >= data.minimumStockLevel
  }
  return true
}, {
  message: "Maximum stock level must be greater than or equal to minimum stock level",
  path: ['maximumStockLevel']
})
```

**Error Message**: "Maximum stock level must be greater than or equal to minimum stock level"

**Validation Timing**: Client and server-side

**Severity**: ERROR

---

### 4.3 Product Type Flag Validation

#### VAL-PROD-030: At Least One Purpose

**Rule**: At least one of is_for_sale or is_ingredient should be true (warning only)

**Validation Logic**:
```typescript
if (!data.isForSale && !data.isIngredient) {
  return {
    type: 'WARNING',
    message: "Product is not marked as 'For Sale' or 'Ingredient'. Is this intentional?"
  }
}
```

**Warning Message**: "Product is not marked as 'For Sale' or 'Ingredient'. Is this intentional?"

**Validation Timing**: Client-side

**Severity**: WARNING

---

## 5. Integration Validations

### 5.1 Category References

#### VAL-PROD-031: Category Existence Validation

**Rule**: Referenced category_id must exist and be active

**SQL Check**:
```sql
SELECT id FROM categories
WHERE id = :category_id
  AND is_active = true
  AND deleted_at IS NULL
```

**Error Message**: "Selected category does not exist or is inactive"

**Validation Timing**: Server-side on create/update

**Severity**: ERROR

---

#### VAL-PROD-032: Subcategory-Category Relationship

**Rule**: If subcategory_id is provided, it must belong to the selected category

**SQL Check**:
```sql
SELECT id FROM subcategories
WHERE id = :subcategory_id
  AND category_id = :category_id
  AND is_active = true
  AND deleted_at IS NULL
```

**Error Message**: "Selected subcategory does not belong to the chosen category"

**Validation Timing**: Server-side on create/update

**Severity**: ERROR

---

### 5.2 Unit References

#### VAL-PROD-033: Unit Existence Validation

**Rule**: All referenced unit IDs (primary_inventory_unit_id, unit_id in product_units) must exist and be active

**SQL Check**:
```sql
SELECT id FROM units
WHERE id = :unit_id
  AND is_active = true
  AND deleted_at IS NULL
```

**Error Message**: "Selected unit does not exist or is inactive"

**Validation Timing**: Server-side on create/update

**Severity**: ERROR

---

### 5.3 Location References

#### VAL-PROD-034: Location Existence Validation

**Rule**: Referenced location_id in product_locations must exist and be active

**SQL Check**:
```sql
SELECT id FROM locations
WHERE id = :location_id
  AND is_active = true
  AND deleted_at IS NULL
```

**Error Message**: "Selected location does not exist or is inactive"

**Validation Timing**: Server-side on location assignment

**Severity**: ERROR

---

## 6. Bulk Operation Validations

### 6.1 Product Import Validations

#### VAL-PROD-035: Import File Format Validation

**Rule**: Imported file must be in Excel (.xlsx) or CSV (.csv) format

**Validation Logic**:
```typescript
const allowedExtensions = ['.xlsx', '.csv']
const fileExtension = file.name.substring(file.name.lastIndexOf('.'))
if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
  throw new Error("Invalid file format. Accepted formats: .xlsx, .csv")
}
```

**Error Message**: "Invalid file format. Accepted formats: .xlsx, .csv"

**Validation Timing**: Client-side on file selection

**Severity**: ERROR

---

#### VAL-PROD-036: Import Row Validation

**Rule**: Each row in import file must have all required fields and pass field-level validations

**Validation Logic**:
```typescript
for (const [index, row] of rows.entries()) {
  const errors = []

  // Validate required fields
  if (!row.product_code) errors.push("Product code is missing")
  if (!row.product_name) errors.push("Product name is missing")
  if (!row.category_id) errors.push("Category is missing")
  // ... other field validations

  if (errors.length > 0) {
    importErrors.push({
      row: index + 2,  // +2 for header and 0-based index
      errors: errors
    })
  }
}
```

**Error Message**: "Row {row_number}: {error_list}"

**Validation Timing**: Server-side before import execution

**Severity**: ERROR

---

## 7. Performance Validations

### 7.1 Reasonable Limits Validation

#### VAL-PROD-037: Unit Count Limit

**Rule**: Maximum 100 units per unit type per product (ORDER, RECIPE, COUNT)

**Validation Logic**:
```typescript
const unitCount = await db.product_units.count({
  where: {
    productId: data.productId,
    unitType: data.unitType
  }
})

if (unitCount >= 100) {
  throw new Error(`Maximum of 100 ${data.unitType} units per product exceeded`)
}
```

**Error Message**: "Maximum of 100 {unit_type} units per product exceeded"

**Validation Timing**: Server-side on unit create

**Severity**: ERROR

---

#### VAL-PROD-038: Location Assignment Limit

**Rule**: Maximum 50 location assignments per product

**Validation Logic**:
```typescript
const locationCount = await db.product_locations.count({
  where: { productId: data.productId }
})

if (locationCount >= 50) {
  throw new Error("Maximum of 50 location assignments per product exceeded")
}
```

**Error Message**: "Maximum of 50 location assignments per product exceeded"

**Validation Timing**: Server-side on location assignment

**Severity**: ERROR

---

## 8. Security Validations

### 8.1 Permission Validations

#### VAL-PROD-039: Create Permission

**Rule**: User must have 'product.create' permission to create products

**Validation Logic**:
```typescript
if (!user.hasPermission('product.create')) {
  throw new Error("You do not have permission to create products")
}
```

**Error Message**: "You do not have permission to create products"

**Validation Timing**: Server-side on create attempt

**Severity**: ERROR

---

#### VAL-PROD-040: Update Permission

**Rule**: User must have 'product.update' permission to update products

**Validation Logic**:
```typescript
if (!user.hasPermission('product.update')) {
  throw new Error("You do not have permission to update products")
}
```

**Error Message**: "You do not have permission to update products"

**Validation Timing**: Server-side on update attempt

**Severity**: ERROR

---

#### VAL-PROD-041: Delete Permission

**Rule**: User must have 'product.delete' permission (typically admin only) to delete products

**Validation Logic**:
```typescript
if (!user.hasPermission('product.delete')) {
  throw new Error("You do not have permission to delete products")
}
```

**Error Message**: "You do not have permission to delete products"

**Validation Timing**: Server-side on delete attempt

**Severity**: ERROR

---

## 9. Validation Implementation

### 9.1 Client-Side Validation (Zod Schema)

**Location**: `/app/(main)/product-management/products/[id]/components/ProductForm.tsx`

```typescript
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const productFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name must not exceed 255 characters"),

  description: z.string()
    .max(65535, "Description is too long")
    .optional(),

  category: z.string()
    .min(1, "Category is required"),

  itemGroup: z.string()
    .min(1, "Item group is required"),

  brand: z.string()
    .max(100, "Brand must not exceed 100 characters")
    .optional(),

  manufacturer: z.string()
    .max(100, "Manufacturer must not exceed 100 characters")
    .optional(),

  countryOfOrigin: z.string()
    .max(100, "Country must not exceed 100 characters")
    .optional(),

  barcode: z.string()
    .max(50, "Barcode must not exceed 50 characters")
    .regex(/^[0-9A-Z-]*$/, "Invalid barcode format")
    .optional(),

  sku: z.string()
    .max(50, "SKU must not exceed 50 characters")
    .regex(/^[A-Z0-9_-]*$/i, "Invalid SKU format")
    .optional(),

  notes: z.string()
    .max(65535, "Notes are too long")
    .optional(),

  defaultUnit: z.string()
    .min(1, "Default unit is required"),

  purchaseUnit: z.string()
    .min(1, "Purchase unit is required"),

  stockUnit: z.string()
    .min(1, "Stock unit is required"),

  taxType: z.string()
    .min(1, "Tax type is required"),
})
.refine(data => {
  // Cross-field validations can be added here
  return true
}, {
  message: "Validation failed"
})

export type ProductFormValues = z.infer<typeof productFormSchema>
```

### 9.2 Server-Side Validation Example

```typescript
// Server-side validation in API route or server action
async function validateProductCreate(data: ProductFormValues) {
  const errors = []

  // Check product code uniqueness
  const existingProduct = await db.products.findFirst({
    where: {
      productCode: data.productCode,
      deletedAt: null
    }
  })
  if (existingProduct) {
    errors.push({
      field: 'productCode',
      message: `Product code '${data.productCode}' already exists`
    })
  }

  // Check category exists and is active
  const category = await db.categories.findFirst({
    where: {
      id: data.categoryId,
      isActive: true,
      deletedAt: null
    }
  })
  if (!category) {
    errors.push({
      field: 'categoryId',
      message: 'Selected category does not exist or is inactive'
    })
  }

  // Check unit exists and is active
  const unit = await db.units.findFirst({
    where: {
      id: data.primaryInventoryUnitId,
      isActive: true,
      deletedAt: null
    }
  })
  if (!unit) {
    errors.push({
      field: 'primaryInventoryUnitId',
      message: 'Selected unit does not exist or is inactive'
    })
  }

  if (errors.length > 0) {
    throw new ValidationError(errors)
  }

  return true
}
```

---

## 10. Validation Error Handling

### 10.1 Error Response Format

**Client-Side Error Display**:
```typescript
interface ValidationError {
  field: string
  message: string
  severity: 'ERROR' | 'WARNING' | 'INFO'
}

// Display inline with form field
<FormMessage>{error.message}</FormMessage>
```

**Server-Side Error Response**:
```json
{
  "success": false,
  "errors": [
    {
      "field": "productCode",
      "message": "Product code already exists",
      "severity": "ERROR"
    },
    {
      "field": "basePrice",
      "message": "Base price is recommended for products marked as 'For Sale'",
      "severity": "WARNING"
    }
  ]
}
```

### 10.2 Warning Handling

Warnings allow the user to proceed with acknowledgment:

```typescript
if (warnings.length > 0) {
  const confirmed = await showConfirmDialog({
    title: "Please Confirm",
    message: warnings.map(w => w.message).join('\n'),
    confirmText: "Proceed Anyway",
    cancelText: "Go Back"
  })

  if (!confirmed) {
    return // Stay on form
  }
}

// Proceed with operation
```

---

## 11. Validation Testing

### 11.1 Unit Test Examples

```typescript
describe('Product Validations', () => {
  describe('VAL-PROD-001: Product Code', () => {
    it('should require product code', () => {
      const result = productFormSchema.safeParse({ productCode: '' })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toBe('Product code is required')
    })

    it('should enforce length limit', () => {
      const longCode = 'A'.repeat(51)
      const result = productFormSchema.safeParse({ productCode: longCode })
      expect(result.success).toBe(false)
    })

    it('should validate format', () => {
      const result = productFormSchema.safeParse({ productCode: 'ABC-123!' })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('only letters, numbers')
    })
  })

  describe('VAL-PROD-029: Stock Levels', () => {
    it('should enforce max >= min', () => {
      const result = productFormSchema.safeParse({
        minimumStockLevel: 100,
        maximumStockLevel: 50
      })
      expect(result.success).toBe(false)
      expect(result.error.issues[0].message).toContain('greater than or equal')
    })
  })
})
```

---

## 12. Related Documents

- **Business Requirements**: [BR-products.md](./BR-products.md)
- **Use Cases**: [UC-products.md](./UC-products.md)
- **Data Definitions**: [DD-products.md](./DD-products.md)
- **Technical Specification**: [TS-products.md](./TS-products.md)
- **Flow Diagrams**: [FD-products.md](./FD-products.md)

---

**Document Control**:
- **Created By**: System Documentation Team
- **Approved By**: [Pending]
- **Next Review Date**: [To be determined]
