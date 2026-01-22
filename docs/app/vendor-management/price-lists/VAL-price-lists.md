# Price Lists - Validations (VAL)

## Document Information
- **Document Type**: Validations Document
- **Module**: Vendor Management > Price Lists
- **Version**: 3.0.0
- **Last Updated**: 2026-01-15
- **Document Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2026-01-15 | Documentation Team | Synced with current code; Added MOQ tier validations from PriceValidation.ts; Added product pricing validations; Added pricelist-level validations; Updated status values; Added smart defaults documentation |
| 2.0.0 | 2025-11-26 | System | Complete rewrite to match BR v2.0.0 and actual code; Removed fictional validations (approval workflows, price alerts, contract pricing, bulk import, price history); Updated to reflect implemented functionality |
| 1.1.0 | 2025-11-18 | Documentation Team | Previous version with aspirational features |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

**Note**: This document defines validation rules for the Price Lists module as implemented in the actual code.

---

## 1. Introduction

This document defines validation rules, error messages, and data integrity constraints for the Price Lists module. It includes field-level validations and form validation specifications for the price list management system.

---

## 2. Field-Level Validations

### 2.1 Price List Basic Information

#### Price List Number/Code
**Field**: `priceListCode`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be auto-generated | N/A |
| Format | Alphanumeric with hyphens | "Invalid price list code format" |

#### Price List Name
**Field**: `priceListName`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must not be empty | "Price list name is required" |
| Length | 3-200 characters | "Name must be 3-200 characters" |

#### Description
**Field**: `description`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Length | Max 1000 characters | "Description must not exceed 1000 characters" |

#### Vendor Selection
**Field**: `vendorId`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select a vendor | "Vendor is required" |
| Valid | Must exist in vendor list | "Invalid vendor selected" |

#### Currency
**Field**: `currency` / `currencyCode`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select currency | "Currency is required" |
| Format | ISO 4217 code (3 letters) | "Invalid currency code" |
| Default | Defaults to "USD" | N/A |

### 2.2 Effective Date Validations

#### Effective Start Date
**Field**: `effectiveStartDate`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide start date | "Start date is required" |
| Format | Valid date | "Invalid date format" |

#### Effective End Date
**Field**: `effectiveEndDate`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Format | Valid date if provided | "Invalid date format" |
| Consistency | Must be after start date if provided | "End date must be after start date" |

### 2.3 Price List Line Item Validations

#### Item Code
**Field**: `itemCode`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must have item code | "Item code is required" |
| Format | Alphanumeric with hyphens | "Invalid item code format" |

#### Item Name
**Field**: `itemName`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must have item name | "Item name is required" |
| Length | 3-200 characters | "Item name must be 3-200 characters" |

#### Unit Price
**Field**: `unitPrice.amount`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide unit price | "Unit price is required" |
| Type | Must be positive number | "Unit price must be positive" |
| Range | 0.01 to 999,999,999.99 | "Unit price out of valid range" |
| Precision | Max 2 decimal places | "Maximum 2 decimal places" |

#### Unit of Measure
**Field**: `unit`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must specify unit | "Unit of measure is required" |
| Valid | Must be valid unit | "Invalid unit of measure" |

#### Minimum Order Quantity (MOQ)
**Field**: `minimumOrderQuantity`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive integer | "MOQ must be a positive whole number" |
| Range | 1 to 999,999 | "MOQ must be between 1 and 999,999" |

#### Lead Time Days
**Field**: `leadTimeDays`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Optional | Can be empty | N/A |
| Type | Must be positive integer | "Lead time must be a positive whole number" |
| Range | 1 to 365 days | "Lead time must be between 1 and 365 days" |

### 2.4 Item Discount Validations

#### Discount Minimum Quantity
**Field**: `itemDiscounts[].minQuantity`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide min quantity for discount | "Minimum quantity is required" |
| Type | Must be positive integer | "Minimum quantity must be positive" |
| Consistency | Must be greater than previous tier | "Quantity tiers must not overlap" |

#### Discount Type
**Field**: `itemDiscounts[].discountType`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must select discount type | "Discount type is required" |
| Valid | Must be 'percentage' or 'fixed_amount' | "Invalid discount type" |

#### Discount Value
**Field**: `itemDiscounts[].discountValue`

| Rule | Validation | Error Message |
|------|------------|---------------|
| Required | Must provide discount value | "Discount value is required" |
| Type | Must be positive number | "Discount value must be positive" |
| Range (percentage) | 0 to 100 for percentage | "Percentage must be 0-100" |
| Range (fixed) | Must be positive for fixed amount | "Amount must be positive" |

---

## 3. Status Validations

### 3.1 Status Values

| Status | Description | Valid |
|--------|-------------|-------|
| draft | Initial creation, not finalized | Yes |
| submitted | Submitted for review | Yes |
| approved | Approved and in use | Yes |
| rejected | Rejected with reason | Yes |
| expired | Past effective end date | Yes |
| active | Legacy: maps to approved | Yes |
| pending | Legacy: maps to submitted | Yes |

### 3.2 Status Rules

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-STS-001 | Status must be valid enum value | "Invalid status value" |
| VAL-STS-002 | Only approved/active price lists should be used for purchasing | N/A (informational) |
| VAL-STS-003 | Rejected status should have reason | N/A (informational) |

---

## 4. Business Rule Validations

### 4.1 Price List Creation Rules

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-PL-001 | Price list name is required | "Price list name is required" |
| VAL-PL-002 | Vendor must be selected | "Vendor is required" |
| VAL-PL-003 | Currency must be specified | "Currency is required" |
| VAL-PL-004 | Start date must be provided | "Start date is required" |
| VAL-PL-005 | End date must be after start date when provided | "End date must be after start date" |

### 4.2 Line Item Rules

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-ITM-001 | Item code is required | "Item code is required" |
| VAL-ITM-002 | Item name is required | "Item name is required" |
| VAL-ITM-003 | Unit price must be positive | "Unit price must be positive" |
| VAL-ITM-004 | Unit of measure is required | "Unit is required" |

### 4.3 Discount Tier Rules

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-DSC-001 | Discount tiers must have ascending quantity thresholds | "Discount tiers must be in ascending order" |
| VAL-DSC-002 | Percentage discounts must be 0-100 | "Percentage must be 0-100" |

### 4.4 MOQ Pricing Tier Rules (from PriceValidation.ts)

#### Single Tier Validation

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-MOQ-001 | MOQ must be greater than 0 | "MOQ must be greater than 0" |
| VAL-MOQ-002 | Unit price must be greater than 0 | "Unit price must be greater than 0" |
| VAL-MOQ-003 | Lead time must be at least 1 day | "Lead time must be at least 1 day" |
| VAL-MOQ-004 | Unit is required | "Unit is required" |

#### Tier Warnings (non-blocking)

| Rule ID | Condition | Warning Message |
|---------|-----------|-----------------|
| VAL-MOQ-W001 | Unit price > 10,000 | "Unit price seems unusually high - please verify" |
| VAL-MOQ-W002 | Lead time > 365 days | "Lead time over 1 year - please verify" |
| VAL-MOQ-W003 | MOQ < 10 for g/ml/oz units | "MOQ seems low for this unit type" |
| VAL-MOQ-W004 | MOQ > 1,000 for kg/L/lb units | "MOQ seems high for this unit type" |

#### Multiple Tier Validation

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| VAL-MOQ-005 | At least one price tier is required | "At least one price tier is required" |
| VAL-MOQ-006 | MOQ values should increase with each tier | "MOQ values should increase with each tier" |
| VAL-MOQ-W005 | Unit price typically decreases with higher MOQ | "Unit price typically decreases with higher MOQ" (warning) |

#### Product Completion Status

| Status | Description |
|--------|-------------|
| not_started | No pricing tiers exist |
| partial | Some tiers incomplete |
| completed | All tiers have valid pricing |

#### Smart MOQ Defaults

| Unit Type | Default MOQ | Notes |
|-----------|-------------|-------|
| g, ml, oz | 100 | Smaller units need higher quantities |
| kg, L, lb | 0.5 | Larger units can start with fractional amounts |
| piece, box, pack | 1 | Count-based units typically whole numbers |
| Default | 0.001 | Allows very small fractional quantities |

#### Smart Lead Time Defaults

| Unit Type | Default Lead Time | Notes |
|-----------|-------------------|-------|
| piece, box, pack | 3 days | Manufactured items |
| kg, L, lb, g, ml, oz | 7 days | Raw materials |
| Default | 5 days | Standard default |

---

## 5. Form Validation by Page

### 5.1 Add Price List Page

**Fields and Validation**:

| Field | Required | Validation Rule |
|-------|----------|-----------------|
| pricelistNumber | No | Auto-generated if empty |
| vendorId | Yes | Must select valid vendor |
| currency | Yes | Valid currency code |
| validFrom | Yes | Valid date |
| validTo | No | Valid date, after validFrom |
| submissionNotes | No | Max 1000 characters |

**Line Item Fields**:

| Field | Required | Validation Rule |
|-------|----------|-----------------|
| product | Yes | Must select product |
| moq | No | Positive integer |
| unit | Yes | Valid unit |
| unitPrice | Yes | Positive number |
| leadTime | No | Positive integer, 1-365 |
| notes | No | Max 500 characters |

### 5.2 List Page Filters

| Filter | Type | Validation |
|--------|------|------------|
| search | string | Any text, case-insensitive |
| statusFilter | enum | Valid status value or 'all' |
| vendorFilter | string | Valid vendor ID or 'all' |

---

## 6. Error Message Standards

### 6.1 Message Format

- **Required Field**: "{Field name} is required"
- **Invalid Format**: "Invalid {field name} format"
- **Out of Range**: "{Field name} must be between {min} and {max}"
- **Invalid Value**: "Invalid {field name} value"
- **Consistency**: "{Field1} must be {relationship} {Field2}"

### 6.2 Error Display

| Location | Error Type | Display Method |
|----------|------------|----------------|
| Form field | Validation error | Inline error below field |
| Form level | Cross-field error | Error summary at top |
| Action | Operation error | Toast notification |

---

## 7. Data Integrity Constraints

### 7.1 Required Fields

| Field | Required For |
|-------|--------------|
| priceListName | All price lists |
| vendorId | All price lists |
| currency | All price lists |
| effectiveStartDate | All price lists |
| itemCode | All line items |
| itemName | All line items |
| unit | All line items |
| unitPrice | All line items |

### 7.2 Referential Integrity

| Reference | From | To |
|-----------|------|------|
| vendorId | VendorPriceList | Vendor |
| priceListId | VendorPriceListItem | VendorPriceList |

---

## 8. Related Documents

- [BR-price-lists.md](./BR-price-lists.md) - Business Requirements v2.0.0
- [DD-price-lists.md](./DD-price-lists.md) - Data Definition
- [FD-price-lists.md](./FD-price-lists.md) - Flow Diagrams
- [TS-price-lists.md](./TS-price-lists.md) - Technical Specification
- [UC-price-lists.md](./UC-price-lists.md) - Use Cases

---

**End of Validations Document**
