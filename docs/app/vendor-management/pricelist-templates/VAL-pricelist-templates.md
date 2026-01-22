# Pricelist Templates - Validations (VAL)

## Document Information
- **Document Type**: Validations Document
- **Module**: Vendor Management > Pricelist Templates
- **Version**: 3.0.0
- **Last Updated**: 2026-01-15
- **Document Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2026-01-15 | Documentation Team | Synced with current code; Updated to use validityPeriod instead of effective dates; Added notification settings validation; Added currency options (BHT, USD, CNY, SGD); Added productSelection validation |
| 2.0.0 | 2025-11-25 | Documentation Team | Simplified to align with BR-pricelist-templates.md; Removed distribution, submission, approval, and pricing structure validations; Streamlined to core template functionality |
| 1.1 | 2025-11-25 | Documentation Team | Updated document metadata |
| 1.0 | 2024-01-15 | System | Initial creation |

---

## 1. Introduction

This document defines validation rules, error messages, and data integrity constraints for the Pricelist Templates module. The module enables organizations to create standardized pricing request templates with products, units of measure, and specifications.

---

## 2. Field-Level Validations

### 2.1 Template Header Fields

#### Template Name
**Field**: `name` (stored in `tb_pricelist_template.name`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Template name is required" |
| Length | 3-200 characters | "Template name must be 3-200 characters" |
| Unique | Must be unique across active templates | "Template name already exists" |

**Zod Schema**:
```typescript
name: z.string()
  .min(3, 'Template name must be at least 3 characters')
  .max(200, 'Template name must not exceed 200 characters')
```

#### Description
**Field**: `description` (stored in `tb_pricelist_template.description`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Max 2000 characters | "Description must not exceed 2000 characters" |

**Zod Schema**:
```typescript
description: z.string()
  .max(2000, 'Description must not exceed 2000 characters')
  .optional()
  .or(z.literal(''))
```

#### Currency
**Field**: `currency_id` (stored in `tb_pricelist_template.currency_id`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select a currency | "Currency is required" |
| Valid | Must reference valid currency | "Invalid currency selected" |

**Zod Schema**:
```typescript
currency_id: z.string()
  .uuid('Invalid currency ID format')
```

#### Vendor Instructions
**Field**: `vendor_instructions` (stored in `tb_pricelist_template.vendor_instructions`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Max 5000 characters | "Vendor instructions must not exceed 5000 characters" |

**Zod Schema**:
```typescript
vendor_instructions: z.string()
  .max(5000, 'Vendor instructions must not exceed 5000 characters')
  .optional()
  .or(z.literal(''))
```

#### Validity Period
**Field**: `validityPeriod` (stored in `tb_pricelist_template.validity_period`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must specify validity period | "Validity period is required" |
| Type | Must be positive integer | "Validity period must be a positive number" |
| Range | 1 to 365 days | "Validity period must be between 1 and 365 days" |

**Zod Schema**:
```typescript
validityPeriod: z.number()
  .int('Validity period must be a whole number')
  .positive('Validity period must be a positive number')
  .min(1, 'Validity period must be at least 1 day')
  .max(365, 'Validity period must not exceed 365 days')
  .default(90)
```

#### Default Currency
**Field**: `defaultCurrency` (stored in `tb_pricelist_template.default_currency`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select a currency | "Currency is required" |
| Valid | Must be one of: BHT, USD, CNY, SGD | "Invalid currency selected" |

**Zod Schema**:
```typescript
defaultCurrency: z.enum(['BHT', 'USD', 'CNY', 'SGD'], {
  errorMap: () => ({ message: 'Invalid currency' }),
}).default('BHT')
```

#### Notification Settings
**Field**: `notificationSettings` (stored in `tb_pricelist_template.notification_settings`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Send Reminders | Boolean | N/A |
| Reminder Days | Array of valid days (14, 7, 3, 1) | "Invalid reminder days" |
| Escalation Days | 1 to 90 days | "Escalation days must be between 1 and 90" |

**Zod Schema**:
```typescript
notificationSettings: z.object({
  sendReminders: z.boolean().default(true),
  reminderDays: z.array(z.number().int().positive()).default([7, 3, 1]),
  escalationDays: z.number()
    .int('Escalation days must be a whole number')
    .min(1, 'Escalation days must be at least 1')
    .max(90, 'Escalation days must not exceed 90')
    .default(14)
})
```

#### Status
**Field**: `status` (stored in `tb_pricelist_template.status`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must have a valid status | "Status is required" |
| Valid | Must be one of: draft, active, inactive | "Invalid status" |
| Transition | Valid transitions: draft → active → inactive | "Invalid status transition" |

**Zod Schema**:
```typescript
status: z.enum(['draft', 'active', 'inactive'], {
  errorMap: () => ({ message: 'Invalid status' }),
}).default('draft')
```

### 2.2 Template Detail Fields

#### Product ID
**Field**: `product_id` (stored in `tb_pricelist_template_detail.product_id`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Product is required" |
| Format | Valid UUID | "Invalid product ID format" |
| Exists | Must exist in product catalog | "Product does not exist" |
| Unique | Cannot add same product twice in template | "Product already added to template" |

**Zod Schema**:
```typescript
product_id: z.string()
  .uuid('Invalid product ID format')
```

#### Unit of Measure (UOM)
**Field**: `unit_of_measure` (stored in `tb_pricelist_template_detail.unit_of_measure`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must specify UOM | "Unit of measure is required" |
| Length | Max 50 characters | "UOM must not exceed 50 characters" |

**Zod Schema**:
```typescript
unit_of_measure: z.string()
  .min(1, 'Unit of measure is required')
  .max(50, 'UOM must not exceed 50 characters')
```

#### Minimum Order Quantity (MOQ)
**Field**: `minimum_order_quantity` (stored in `tb_pricelist_template_detail.minimum_order_quantity`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive number if provided | "MOQ must be a positive number" |
| Range | 0.001 to 1,000,000 | "MOQ must be between 0.001 and 1,000,000" |

**Zod Schema**:
```typescript
minimum_order_quantity: z.number()
  .positive('MOQ must be a positive number')
  .min(0.001, 'MOQ must be at least 0.001')
  .max(1000000, 'MOQ must not exceed 1,000,000')
  .optional()
  .nullable()
```

#### Lead Time Days
**Field**: `lead_time_days` (stored in `tb_pricelist_template_detail.lead_time_days`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive integer if provided | "Lead time must be a positive whole number" |
| Range | 1 to 365 days | "Lead time must be between 1 and 365 days" |

**Zod Schema**:
```typescript
lead_time_days: z.number()
  .int('Lead time must be a whole number')
  .positive('Lead time must be a positive number')
  .min(1, 'Lead time must be at least 1 day')
  .max(365, 'Lead time must not exceed 365 days')
  .optional()
  .nullable()
```

#### Sequence Number
**Field**: `sequence_no` (stored in `tb_pricelist_template_detail.sequence_no`)

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide sequence | "Sequence number is required" |
| Type | Must be positive integer | "Sequence must be a positive whole number" |
| Range | 1 to 10,000 | "Sequence must be between 1 and 10,000" |

**Zod Schema**:
```typescript
sequence_no: z.number()
  .int('Sequence must be a whole number')
  .positive('Sequence must be a positive number')
  .min(1, 'Sequence must be at least 1')
  .max(10000, 'Sequence must not exceed 10,000')
  .default(1)
```

---

## 3. Business Rule Validations

### 3.1 BR-PT-001: Template Uniqueness
**Rule**: Template name must be unique across active templates (non-deleted).

**Validation**:
```typescript
const existingTemplate = await prisma.tb_pricelist_template.findFirst({
  where: {
    name: templateData.name,
    deleted_at: null,
    ...(isUpdate && { NOT: { id: templateId } }),
  },
});

if (existingTemplate) {
  throw new ValidationError('Template name already exists. Please use a unique name.');
}
```

**Error Message**: "Template name already exists. Please use a unique name."

### 3.2 BR-PT-002: Minimum Items
**Rule**: Each template must have at least one product/item assigned before activation.

**Validation**:
```typescript
const productCount = await prisma.tb_pricelist_template_detail.count({
  where: {
    pricelist_template_id: templateId,
    deleted_at: null,
  },
});

if (productCount === 0 && newStatus === 'active') {
  throw new ValidationError('Template must contain at least one product before activation');
}
```

**Error Message**: "Template must contain at least one product before it can be activated."

### 3.3 BR-PT-003: Currency Consistency
**Rule**: Template currency must reference a valid currency from the currency table.

**Validation**:
```typescript
const currency = await prisma.tb_currency.findUnique({
  where: { id: templateData.currency_id },
});

if (!currency) {
  throw new ValidationError('Invalid currency selected');
}
```

**Error Message**: "Invalid currency selected. Please choose a valid currency."

### 3.4 Status Transition Rules
**Rule**: Template status can only transition in valid directions.

**Valid Transitions**:
- `draft` → `active` (Activation)
- `active` → `inactive` (Deactivation)
- `draft` → `draft` (Editing)

**Invalid Transitions**:
- `active` → `draft`
- `inactive` → `active`
- `inactive` → `draft`

**Validation**:
```typescript
const validTransitions: Record<string, string[]> = {
  draft: ['draft', 'active'],
  active: ['active', 'inactive'],
  inactive: ['inactive'],
};

if (!validTransitions[currentStatus]?.includes(newStatus)) {
  throw new ValidationError(`Cannot change status from ${currentStatus} to ${newStatus}`);
}
```

**Error Message**: "Invalid status transition. Please check the template status workflow."

### 3.5 Effective Date Validation
**Rule**: If both effective dates are provided, end date must be after start date.

**Validation**:
```typescript
if (templateData.effective_from && templateData.effective_to) {
  if (new Date(templateData.effective_to) <= new Date(templateData.effective_from)) {
    throw new ValidationError('Effective end date must be after start date');
  }
}
```

**Error Message**: "Effective end date must be after start date."

### 3.6 Product Uniqueness in Template
**Rule**: Same product cannot appear twice in the same template.

**Validation**:
```typescript
const existingProduct = await prisma.tb_pricelist_template_detail.findFirst({
  where: {
    pricelist_template_id: templateId,
    product_id: productData.product_id,
    deleted_at: null,
    ...(isUpdate && { NOT: { id: detailId } }),
  },
});

if (existingProduct) {
  throw new ValidationError('Product already exists in this template');
}
```

**Error Message**: "This product already exists in the template. Please select a different product."

---

## 4. Complete Zod Schemas

### 4.1 Template Header Schema

```typescript
// lib/schemas/pricelist-template.schema.ts

import { z } from 'zod';

export const pricelistTemplateHeaderSchema = z.object({
  name: z.string()
    .min(3, 'Template name must be at least 3 characters')
    .max(200, 'Template name must not exceed 200 characters'),

  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),

  currency_id: z.string()
    .uuid('Invalid currency ID format'),

  vendor_instructions: z.string()
    .max(5000, 'Vendor instructions must not exceed 5000 characters')
    .optional()
    .or(z.literal('')),

  effective_from: z.coerce.date()
    .optional()
    .nullable(),

  effective_to: z.coerce.date()
    .optional()
    .nullable(),

  status: z.enum(['draft', 'active', 'inactive'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }).default('draft'),
}).refine((data) => {
  if (data.effective_from && data.effective_to) {
    return new Date(data.effective_to) > new Date(data.effective_from);
  }
  return true;
}, {
  message: 'Effective end date must be after start date',
  path: ['effective_to'],
});

export type PricelistTemplateHeaderFormData = z.infer<typeof pricelistTemplateHeaderSchema>;
```

### 4.2 Template Detail Schema

```typescript
// lib/schemas/pricelist-template-detail.schema.ts

import { z } from 'zod';

export const pricelistTemplateDetailSchema = z.object({
  product_id: z.string()
    .uuid('Invalid product ID format'),

  unit_of_measure: z.string()
    .min(1, 'Unit of measure is required')
    .max(50, 'UOM must not exceed 50 characters'),

  minimum_order_quantity: z.number()
    .positive('MOQ must be a positive number')
    .min(0.001, 'MOQ must be at least 0.001')
    .max(1000000, 'MOQ must not exceed 1,000,000')
    .optional()
    .nullable(),

  lead_time_days: z.number()
    .int('Lead time must be a whole number')
    .positive('Lead time must be a positive number')
    .min(1, 'Lead time must be at least 1 day')
    .max(365, 'Lead time must not exceed 365 days')
    .optional()
    .nullable(),

  sequence_no: z.number()
    .int('Sequence must be a whole number')
    .positive('Sequence must be a positive number')
    .min(1, 'Sequence must be at least 1')
    .max(10000, 'Sequence must not exceed 10,000')
    .default(1),
});

export type PricelistTemplateDetailFormData = z.infer<typeof pricelistTemplateDetailSchema>;
```

### 4.3 Complete Template Schema (with Details)

```typescript
// lib/schemas/pricelist-template-complete.schema.ts

import { z } from 'zod';
import { pricelistTemplateHeaderSchema } from './pricelist-template.schema';
import { pricelistTemplateDetailSchema } from './pricelist-template-detail.schema';

export const pricelistTemplateCompleteSchema = pricelistTemplateHeaderSchema.extend({
  details: z.array(pricelistTemplateDetailSchema)
    .min(1, 'At least one product is required'),
});

export type PricelistTemplateCompleteFormData = z.infer<typeof pricelistTemplateCompleteSchema>;
```

---

## 5. Database Constraints

### 5.1 PostgreSQL Constraints

```sql
-- Template header constraints
ALTER TABLE tb_pricelist_template
  ADD CONSTRAINT check_name_not_empty CHECK (name <> ''),
  ADD CONSTRAINT check_name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 200),
  ADD CONSTRAINT check_effective_dates CHECK (
    effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from
  ),
  ADD CONSTRAINT check_status_valid CHECK (status IN ('draft', 'active', 'inactive'));

-- Template detail constraints
ALTER TABLE tb_pricelist_template_detail
  ADD CONSTRAINT check_uom_not_empty CHECK (unit_of_measure <> ''),
  ADD CONSTRAINT check_moq_positive CHECK (minimum_order_quantity IS NULL OR minimum_order_quantity > 0),
  ADD CONSTRAINT check_lead_time_range CHECK (
    lead_time_days IS NULL OR (lead_time_days >= 1 AND lead_time_days <= 365)
  ),
  ADD CONSTRAINT check_sequence_positive CHECK (sequence_no > 0);

-- Unique constraints
CREATE UNIQUE INDEX idx_template_name_unique
  ON tb_pricelist_template (name)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX idx_template_detail_product_unique
  ON tb_pricelist_template_detail (pricelist_template_id, product_id)
  WHERE deleted_at IS NULL;
```

---

## 6. Error Messages Reference

### 6.1 User-Friendly Error Messages

| Error Code | Technical Message | User Message |
|------------|-------------------|--------------|
| VAL-PLT-001 | Template name required | Please enter a template name. |
| VAL-PLT-002 | Template name too short | Template name must be at least 3 characters. |
| VAL-PLT-003 | Template name too long | Template name must not exceed 200 characters. |
| VAL-PLT-004 | Template name duplicate | A template with this name already exists. Please use a unique name. |
| VAL-PLT-005 | Currency required | Please select a currency for the template. |
| VAL-PLT-006 | Invalid currency | The selected currency is not valid. |
| VAL-PLT-007 | Invalid effective dates | Effective end date must be after start date. |
| VAL-PLT-008 | Product required | Please add at least one product to the template. |
| VAL-PLT-009 | UOM required | Please specify a unit of measure for the product. |
| VAL-PLT-010 | Invalid MOQ | Minimum order quantity must be a positive number. |
| VAL-PLT-011 | Invalid lead time | Lead time must be between 1 and 365 days. |
| VAL-PLT-012 | Duplicate product | This product already exists in the template. |
| VAL-PLT-013 | Invalid status transition | Cannot change template status. Check the status workflow. |
| VAL-PLT-014 | Missing products for activation | Template must have at least one product before activation. |

---

## 7. Validation Testing Matrix

### 7.1 Unit Test Cases

| Test Case ID | Validation Rule | Input | Expected Result |
|--------------|-----------------|-------|-----------------|
| UT-VAL-001 | Template name required | "" | Error: Name required |
| UT-VAL-002 | Template name length | "AB" | Error: Minimum 3 characters |
| UT-VAL-003 | Template name length | "Valid Name" | Success |
| UT-VAL-004 | Currency required | null | Error: Currency required |
| UT-VAL-005 | Currency format | "invalid-uuid" | Error: Invalid format |
| UT-VAL-006 | Currency format | "valid-uuid-format" | Success |
| UT-VAL-007 | Effective dates | From: 2025-12-31, To: 2025-01-01 | Error: End must be after start |
| UT-VAL-008 | Effective dates | From: 2025-01-01, To: 2025-12-31 | Success |
| UT-VAL-009 | UOM required | "" | Error: UOM required |
| UT-VAL-010 | UOM | "kg" | Success |
| UT-VAL-011 | MOQ range | -1 | Error: Must be positive |
| UT-VAL-012 | MOQ range | 50 | Success |
| UT-VAL-013 | Lead time range | 0 | Error: Must be at least 1 |
| UT-VAL-014 | Lead time range | 400 | Error: Must not exceed 365 |
| UT-VAL-015 | Lead time range | 30 | Success |
| UT-VAL-016 | Sequence | 0 | Error: Must be at least 1 |
| UT-VAL-017 | Sequence | 100 | Success |
| UT-VAL-018 | Status transition | draft → active | Success |
| UT-VAL-019 | Status transition | active → draft | Error: Invalid transition |
| UT-VAL-020 | Status transition | active → inactive | Success |

### 7.2 Business Rule Test Cases

| Test Case ID | Business Rule | Scenario | Expected Result |
|--------------|---------------|----------|-----------------|
| BR-VAL-001 | BR-PT-001 | Create template with duplicate name | Error: Name must be unique |
| BR-VAL-002 | BR-PT-001 | Create template with unique name | Success |
| BR-VAL-003 | BR-PT-002 | Activate template without products | Error: Minimum 1 product required |
| BR-VAL-004 | BR-PT-002 | Activate template with products | Success |
| BR-VAL-005 | BR-PT-003 | Select invalid currency | Error: Invalid currency |
| BR-VAL-006 | BR-PT-003 | Select valid currency | Success |
| BR-VAL-007 | Product uniqueness | Add same product twice | Error: Product already exists |
| BR-VAL-008 | Product uniqueness | Add different products | Success |

---

## Related Documents
- BR-pricelist-templates.md - Business Requirements
- DD-pricelist-templates.md - Data Definition
- FD-pricelist-templates.md - Flow Diagrams
- TS-pricelist-templates.md - Technical Specification
- UC-pricelist-templates.md - Use Cases

---

**End of Validations Document**
