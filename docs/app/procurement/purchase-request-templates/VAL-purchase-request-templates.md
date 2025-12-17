# Validation Rules: Purchase Request Templates

## Module Information
- **Module**: Procurement
- **Sub-Module**: Purchase Request Templates
- **Route**: `/procurement/purchase-request-templates`
- **Version**: 1.0.0
- **Last Updated**: 2025-02-11
- **Owner**: Procurement Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-11 | System Documentation | Initial version |
| 1.1.0 | 2025-12-04 | Documentation Team | Aligned with prototype - simplified item validations, updated status/type values |

---

## Overview

This document defines all validation rules for the Purchase Request Templates module, including field-level validations, business rule validations, and cross-field validations. All rules are enforced at both client-side (React Hook Form + Zod) and server-side (Zod + business logic).

**Related Documents**:
- [Business Requirements](./BR-purchase-request-templates.md) - Business rules reference
- [Backend Requirements](./BE-purchase-request-templates.md) - API and server action specifications
- [Technical Specification](./TS-purchase-request-templates.md) - Implementation details
- [Data Definition](./DD-purchase-request-templates.md) - Database schema

---

## Template-Level Validation Rules

### VR-TPL-001: Template Number Format
**Rule**: Template number must follow pattern TPL-YY-NNNN

**Validation Type**: System-generated (not user input)

**Implementation**:
- Format: TPL-{YY}-{NNNN}
- YY = Current year (2 digits)
- NNNN = Sequential number (4 digits, zero-padded)
- Example: TPL-24-0001, TPL-24-0015

**Error Messages**: N/A (system-generated, cannot fail)

**Business Rule Reference**: BR-TPL-001

---

### VR-TPL-002: Description Required
**Rule**: Template description is required with minimum 10 characters

**Validation Type**: Required field, length validation

**Client-Side Validation** (Zod):
```
description: z.string()
  .min(10, "Description must be at least 10 characters")
  .max(500, "Description cannot exceed 500 characters")
```

**Server-Side Validation**: Same Zod schema

**Error Messages**:
- Empty: "Description is required"
- Too short: "Description must be at least 10 characters"
- Too long: "Description cannot exceed 500 characters"

**Business Rule Reference**: BR-TPL-003

---

### VR-TPL-003: Department Required
**Rule**: Template must be assigned to exactly one department

**Validation Type**: Required field, foreign key validation

**Client-Side Validation** (Zod):
```
departmentId: z.string()
  .uuid("Invalid department ID")
  .min(1, "Department is required")
```

**Server-Side Validation**: Zod + database FK constraint

**Error Messages**:
- Empty: "Department is required"
- Invalid: "Selected department does not exist"

**Business Rule Reference**: BR-TPL-002

---

### VR-TPL-004: Request Type Required
**Rule**: Request type must be from approved list

**Validation Type**: Required field, enum validation

**Client-Side Validation** (Zod):
```
requestType: z.enum(
  ['goods', 'services', 'capital'],
  { errorMap: () => ({ message: 'Invalid request type' }) }
)
```

**Server-Side Validation**: Same Zod schema + database check constraint

**Error Messages**:
- Empty: "Request type is required"
- Invalid: "Request type must be: goods, services, or capital"

**Business Rule Reference**: BR-TPL-004

---

### VR-TPL-005: Status Valid
**Rule**: Template status must be from approved list

**Validation Type**: Enum validation, state transition validation

**Client-Side Validation** (Zod):
```
status: z.enum(
  ['draft', 'active', 'inactive'],
  { errorMap: () => ({ message: 'Invalid status' }) }
)
```

**Server-Side Validation**: Zod + state transition rules

**State Transition Validation**:
- DRAFT → ACTIVE: Requires at least 1 item (VR-TPL-020)
- ACTIVE → INACTIVE: Always allowed
- INACTIVE → ACTIVE: Always allowed (template still has items)

**Error Messages**:
- Invalid status: "Status must be: draft, active, or inactive"
- Invalid transition: "Cannot activate template without items"

**Business Rule Reference**: BR-TPL-004, BR-TPL-020

---

### VR-TPL-006: Currency Valid
**Rule**: Currency must be from approved list (default: THB)

**Validation Type**: Enum validation

**Client-Side Validation** (Zod):
```
currency: z.enum(
  ['THB', 'USD', 'EUR', 'GBP'],
  { errorMap: () => ({ message: 'Invalid currency' }) }
).default('THB')
```

**Server-Side Validation**: Same Zod schema + database check constraint

**Error Messages**:
- Invalid: "Currency must be: THB, USD, EUR, or GBP"

**Business Rule Reference**: BR-TPL-017

---

## Item-Level Validation Rules

### VR-ITEM-001: Item Code Required
**Rule**: Item code is required, 3-50 characters, alphanumeric with hyphens

**Validation Type**: Required field, format validation

**Client-Side Validation** (Zod):
```
itemCode: z.string()
  .min(3, "Item code must be at least 3 characters")
  .max(50, "Item code cannot exceed 50 characters")
  .regex(/^[A-Z0-9-]+$/, "Item code must be alphanumeric with hyphens only")
```

**Server-Side Validation**: Zod + uniqueness check within template

**Error Messages**:
- Empty: "Item code is required"
- Too short: "Item code must be at least 3 characters"
- Too long: "Item code cannot exceed 50 characters"
- Invalid format: "Item code must contain only letters, numbers, and hyphens"
- Duplicate: "Item code {code} already exists in this template"

**Business Rule Reference**: BR-TPL-008

---

### VR-ITEM-002: Description Required
**Rule**: Item description is required, 5-500 characters

**Validation Type**: Required field, length validation

**Client-Side Validation** (Zod):
```
description: z.string()
  .min(5, "Description must be at least 5 characters")
  .max(500, "Description cannot exceed 500 characters")
```

**Server-Side Validation**: Same Zod schema

**Error Messages**:
- Empty: "Description is required"
- Too short: "Description must be at least 5 characters"
- Too long: "Description cannot exceed 500 characters"

**Business Rule Reference**: BR-TPL-009

---

### VR-ITEM-003: UOM Required
**Rule**: UOM (Unit of Measure) must be a valid value from centralized Product Order Unit lookup

**Validation Type**: Required field, foreign key validation

**Client-Side Validation** (Zod):
```
uom: z.string()
  .min(1, "Unit of measure is required")
  .refine(async (val) => await isValidProductOrderUnit(val), {
    message: "Invalid unit of measure"
  })
```

**Server-Side Validation**: Zod + database foreign key constraint to product_order_units table

**Error Messages**:
- Empty: "Unit of measure is required"
- Invalid: "Selected unit of measure does not exist"

**Business Rule Reference**: BR-TPL-010

---

### VR-ITEM-004: Quantity Positive
**Rule**: Quantity must be a positive number greater than 0

**Validation Type**: Number validation, range validation

**Client-Side Validation** (Zod):
```
quantity: z.number()
  .positive("Quantity must be greater than 0")
  .multipleOf(0.001, "Quantity can have maximum 3 decimal places")
```

**Server-Side Validation**: Same Zod schema + database check constraint

**Error Messages**:
- Zero/Negative: "Quantity must be greater than 0"
- Too many decimals: "Quantity can have maximum 3 decimal places"

**Business Rule Reference**: BR-TPL-011

---

### VR-ITEM-005: Unit Price Non-Negative
**Rule**: Unit price must be non-negative (≥ 0)

**Validation Type**: Number validation, range validation

**Client-Side Validation** (Zod):
```
unitPrice: z.number()
  .min(0, "Unit price cannot be negative")
  .multipleOf(0.01, "Unit price must have exactly 2 decimal places")
```

**Server-Side Validation**: Same Zod schema + database check constraint

**Error Messages**:
- Negative: "Unit price cannot be negative"
- Invalid decimals: "Unit price must have exactly 2 decimal places"

**Business Rule Reference**: BR-TPL-012

---

### VR-ITEM-006: Budget Code Required
**Rule**: Budget code is required and must be active/valid for department

**Validation Type**: Required field, foreign key validation, business logic validation

**Client-Side Validation** (Zod):
```
budgetCode: z.string()
  .min(1, "Budget code is required")
```

**Server-Side Validation**: Zod + Budget Management integration

**Validation Steps**:
1. Check budget code exists in system
2. Verify budget code is active (not expired/inactive)
3. Confirm budget code is valid for template's department
4. Optional: Check available balance vs item total

**Error Messages**:
- Empty: "Budget code is required"
- Not found: "Budget code {code} does not exist"
- Inactive: "Budget code {code} is not active"
- Wrong department: "Budget code {code} is not valid for {department} department"
- Low balance (warning): "Budget code {code} has low remaining balance"
- Exhausted (warning): "Budget code {code} is exhausted"

**Business Rule Reference**: BR-TPL-013

---

### VR-ITEM-007: Account Code Required
**Rule**: Account code is required and must be active/valid

**Validation Type**: Required field, foreign key validation

**Client-Side Validation** (Zod):
```
accountCode: z.string()
  .min(1, "Account code is required")
```

**Server-Side Validation**: Zod + Account Management validation

**Validation Steps**:
1. Check account code exists
2. Verify account code is active
3. Confirm account code is valid for transaction type

**Error Messages**:
- Empty: "Account code is required"
- Not found: "Account code {code} does not exist"
- Inactive: "Account code {code} is not active"

**Business Rule Reference**: BR-TPL-014

---

### VR-ITEM-008: Department Required
**Rule**: Item department is required and should match template department

**Validation Type**: Required field, cross-reference validation

**Client-Side Validation** (Zod):
```
department: z.string()
  .min(1, "Department is required")
```

**Server-Side Validation**: Zod + template department check

**Validation Logic**:
- Item department defaults to template department
- User can override if multi-department purchases allowed
- Warning displayed if item department differs from template

**Error Messages**:
- Empty: "Department is required"
- Mismatch (warning): "Item department ({item_dept}) differs from template department ({template_dept})"

**Business Rule Reference**: BR-TPL-015

---

### VR-ITEM-009: Tax Code Required
**Rule**: Tax code must be from approved list

**Validation Type**: Required field, enum validation

**Client-Side Validation** (Zod):
```
taxCode: z.enum(
  ['VAT7', 'VAT0', 'EXEMPT'],
  { errorMap: () => ({ message: 'Invalid tax code' }) }
)
```

**Server-Side Validation**: Same Zod schema + database check constraint

**Error Messages**:
- Empty: "Tax code is required"
- Invalid: "Tax code must be one of: VAT7, VAT0, or EXEMPT"

**Business Rule Reference**: BR-TPL-016

---

> **Phase 2 Planned Validations**: VR-ITEM-010 (Currency Exchange Rate), VR-ITEM-011 (Discount Rate), and VR-ITEM-012 (Tax Rate) will be added when advanced pricing features are implemented.

---

## Cross-Field Validation Rules

### VR-CROSS-001: Total Amount Calculation
**Rule**: Total amount must equal quantity × unit price

**Validation Type**: Cross-field calculation validation

**Formula** (Rounded to 2 decimal places):
- totalAmount = quantity × unitPrice

**Server-Side Validation**: Calculate total amount server-side and verify consistency

**Error Messages**:
- "Amount calculation error. Please refresh and try again."

**Business Rule Reference**: BR-TPL-016

> **Phase 2**: More complex calculations (discount, tax, multi-currency conversions) will be added in a future release.

---

### VR-CROSS-002: Template Cannot Be Empty When Active
**Rule**: Templates with status 'active' must contain at least one item

**Validation Type**: Template-item relationship validation

**Client-Side Validation**: Warn when attempting to activate empty template

**Server-Side Validation**: Count items before status change to 'active'

**Error Messages**:
- "Cannot activate template without items. Please add at least one item first."

**Business Rule Reference**: BR-TPL-020

---

### VR-CROSS-003: Default Template Must Be Active
**Rule**: Only active templates can be set as default

**Validation Type**: Status + default flag cross-validation

**Client-Side Validation**: Disable "Set as Default" button for non-active templates

**Server-Side Validation**: Check status = 'active' before setting is_default = true

**Error Messages**:
- "Only active templates can be set as default. Please activate this template first."

**Business Rule Reference**: BR-TPL-007

---

### VR-CROSS-004: One Default Per Department
**Rule**: Only one template per department can have is_default = true

**Validation Type**: Uniqueness validation scoped by department

**Database Constraint**: UNIQUE (department_id, is_default) WHERE is_default = true

**Server-Side Validation**: When setting new default, unset previous default for same department

**Error Messages**: N/A (handled via transaction)

**Business Rule Reference**: BR-TPL-007

---

### VR-CROSS-005: Department Assignment Immutable After Items Added
**Rule**: Template department cannot be changed after items are added

**Validation Type**: Business logic validation

**Client-Side Validation**: Disable department dropdown if item count > 0

**Server-Side Validation**: Check item count before allowing department change

**Error Messages**:
- "Cannot change department after items have been added. Please delete all items first or create a new template."

**Business Rule Reference**: BR-TPL-002

---

## Permission-Based Validation Rules

### VR-PERM-001: Create Permission
**Rule**: User must have "Create Purchase Request Template" permission

**Validation Type**: Permission check

**Client-Side Validation**: Hide/disable "New Template" button for unauthorized users

**Server-Side Validation**: Check user permissions before creating template

**Error Messages**:
- "Access denied. You don't have permission to create templates."

**Business Rule Reference**: BR-TPL-028

---

### VR-PERM-002: Edit Permission
**Rule**: User must have "Edit Purchase Request Template" permission AND (be creator OR have elevated role)

**Validation Type**: Permission + ownership check

**Client-Side Validation**: Hide/disable "Edit" button for unauthorized users

**Server-Side Validation**: Check permissions AND (user_id = created_by OR role >= Purchasing Manager)

**Error Messages**:
- "Access denied. You don't have permission to edit this template."

**Business Rule Reference**: BR-TPL-029

---

### VR-PERM-003: Delete Permission
**Rule**: User must have "Delete Purchase Request Template" permission AND role >= Purchasing Manager

**Validation Type**: Permission + role check

**Client-Side Validation**: Hide/disable "Delete" button for unauthorized users

**Server-Side Validation**: Check permission AND role

**Error Messages**:
- "Access denied. Only Purchasing Managers can delete templates."

**Business Rule Reference**: BR-TPL-030

---

### VR-PERM-004: Set Default Permission
**Rule**: User must have "Manage Default Templates" permission

**Validation Type**: Permission check

**Client-Side Validation**: Hide/disable "Set as Default" button for unauthorized users

**Server-Side Validation**: Check permission before setting default

**Error Messages**:
- "Access denied. You don't have permission to manage default templates."

**Business Rule Reference**: BR-TPL-031

---

## Validation Implementation Matrix

| Validation Rule | Client-Side | Server-Side | Database | Error Type |
|-----------------|-------------|-------------|----------|------------|
| VR-TPL-001 | N/A | Generation | N/A | N/A |
| VR-TPL-002 | Zod | Zod | CHECK | Field |
| VR-TPL-003 | Zod | Zod + FK | FK | Field |
| VR-TPL-004 | Zod | Zod | CHECK | Field |
| VR-TPL-005 | Zod | Zod + Logic | CHECK | Field |
| VR-TPL-006 | Zod | Zod | CHECK | Field |
| VR-ITEM-001 | Zod | Zod + Unique | UNIQUE | Field |
| VR-ITEM-002 | Zod | Zod | CHECK | Field |
| VR-ITEM-003 | Zod | Zod | CHECK | Field |
| VR-ITEM-004 | Zod | Zod | CHECK | Field |
| VR-ITEM-005 | Zod | Zod | CHECK | Field |
| VR-ITEM-006 | Zod | Required | N/A | Field |
| VR-ITEM-007 | Zod | Required | N/A | Field |
| VR-ITEM-008 | Zod | Required | N/A | Field |
| VR-ITEM-009 | Zod | Zod | CHECK | Field |
| VR-CROSS-001 | Calculation | Calculation | N/A | Cross-field |
| VR-CROSS-002 | Warning | Count | N/A | Business |
| VR-CROSS-003 | Disable | Logic | N/A | Business |
| VR-CROSS-004 | N/A | Transaction | UNIQUE | Business |
| VR-CROSS-005 | Disable | Count | N/A | Business |
| VR-PERM-001 | Hide/Disable | Permission | N/A | Permission |
| VR-PERM-002 | Hide/Disable | Permission | N/A | Permission |
| VR-PERM-003 | Hide/Disable | Permission | N/A | Permission |
| VR-PERM-004 | Hide/Disable | Permission | N/A | Permission |

> **Phase 2 Validations**: VR-ITEM-010 (Currency Exchange Rate), VR-ITEM-011 (Discount Rate), and VR-ITEM-012 (Tax Rate) will be added when advanced pricing features are implemented.

---

## Error Message Standards

### Field Validation Errors
- Display inline next to field
- Red text with error icon
- Clear, actionable message
- Disappear when field corrected

### Cross-Field Validation Errors
- Display at form level (top of dialog)
- Yellow/orange warning color
- Explain which fields are involved
- Provide guidance on resolution

### Business Rule Errors
- Display in modal dialog
- Explain rule violation clearly
- Provide options or next steps
- Link to relevant help documentation

### Permission Errors
- Display toast notification
- Explain permission requirement
- Suggest contacting administrator
- Log for audit purposes

---

**Document End**
