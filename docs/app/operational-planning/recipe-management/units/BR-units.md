# Recipe Units - Business Rules (BR)

## Document Information
- **Document Type**: Business Rules Document
- **Module**: Operational Planning > Recipe Management > Units
- **Version**: 1.0.0
- **Last Updated**: 2025-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Development Team | Initial documentation based on actual implementation |

---

## 1. Overview

The Recipe Units submodule manages units of measure used in recipe ingredients and yields. This includes both system-defined units (metric, imperial) and user-created custom units, with support for precision settings and rounding methods.

### 1.1 Business Objectives

| Objective | Description |
|-----------|-------------|
| Standardized Measurement | Provide consistent units of measure across all recipes |
| Precision Control | Define decimal places and rounding for accurate measurements |
| System Units | Protect system-defined units from modification or deletion |
| Custom Units | Allow organizations to create custom units for specific needs |
| Conversion Support | Enable unit conversions for recipe scaling (via UnitConversion) |

---

## 2. Core Business Rules

### 2.1 Unit Identification Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-UN-001 | Each unit must have a unique code | Database constraint |
| BR-UN-002 | Unit code should be lowercase abbreviation (e.g., kg, ml, pcs) | Validation |
| BR-UN-003 | Unit name is required and descriptive | Form validation |
| BR-UN-004 | Plural name is optional but recommended for proper display | Recommendation |

### 2.2 System Unit Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-UN-010 | System units are predefined and protected | isSystemUnit flag |
| BR-UN-011 | System units cannot be edited | UI disabled |
| BR-UN-012 | System units cannot be deleted | Action blocked |
| BR-UN-013 | System units cannot be selected for bulk operations | Checkbox disabled |
| BR-UN-014 | System units are always active | Default behavior |

### 2.3 Custom Unit Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-UN-020 | Custom units can be created by authorized users | Permission check |
| BR-UN-021 | Custom units can be edited or deleted | UI enabled |
| BR-UN-022 | Custom unit codes must not conflict with system units | Validation |
| BR-UN-023 | Deleting custom units affects recipes using them | Warning message |

### 2.4 Precision Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-UN-030 | Decimal places must be 0-6 | Validation |
| BR-UN-031 | Rounding method must be: round, floor, or ceil | Enum constraint |
| BR-UN-032 | Decimal places define display precision in recipes | Formatting |
| BR-UN-033 | Rounding method applies during calculations | Business logic |

### 2.5 Display Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-UN-040 | Display order determines unit list sorting | Sorting logic |
| BR-UN-041 | showInDropdown controls visibility in recipe forms | Filter logic |
| BR-UN-042 | Inactive units are hidden from dropdowns | Filter logic |
| BR-UN-043 | Units should display plural name when quantity > 1 | Display logic |

---

## 3. Unit Types

### 3.1 System Units (Protected)

| Category | Units | Examples |
|----------|-------|----------|
| Weight (Metric) | kg, g, mg | Kilogram, Gram, Milligram |
| Weight (Imperial) | lb, oz | Pound, Ounce |
| Volume (Metric) | l, ml | Liter, Milliliter |
| Volume (Imperial) | gal, qt, pt, cup, fl oz | Gallon, Quart, Pint, Cup, Fluid Ounce |
| Count | pcs, dz, each | Pieces, Dozen, Each |
| Cooking Measures | tbsp, tsp, pinch | Tablespoon, Teaspoon, Pinch |

### 3.2 Custom Unit Examples

| Code | Name | Use Case |
|------|------|----------|
| portion | Portion | Standard serving size |
| slice | Slice | Pizza, cake slices |
| scoop | Scoop | Ice cream, cookie dough |
| handful | Handful | Informal measurement |
| bunch | Bunch | Herbs, vegetables |
| head | Head | Lettuce, garlic |
| sprig | Sprig | Fresh herbs |
| clove | Clove | Garlic |

---

## 4. Status and Visibility Rules

### 4.1 Active Status

| State | In Dropdowns | In Recipes | Editable |
|-------|--------------|------------|----------|
| Active | Yes | Yes | Yes (if not system) |
| Inactive | No | Existing only | Yes (if not system) |

### 4.2 showInDropdown Flag

| Value | Behavior |
|-------|----------|
| true | Unit appears in ingredient/yield unit dropdowns |
| false | Unit hidden from dropdowns but can be used programmatically |

---

## 5. Precision and Rounding

### 5.1 Decimal Places

| Value | Display | Example (2.567) |
|-------|---------|-----------------|
| 0 | Whole numbers | 3 |
| 1 | One decimal | 2.6 |
| 2 | Two decimals | 2.57 |
| 3 | Three decimals | 2.567 |

### 5.2 Rounding Methods

| Method | Description | Example (2.567 to 2 places) |
|--------|-------------|----------------------------|
| round | Standard rounding | 2.57 |
| floor | Always round down | 2.56 |
| ceil | Always round up | 2.57 |

### 5.3 Typical Precision by Unit Type

| Unit Type | Recommended Decimals | Rounding |
|-----------|---------------------|----------|
| Weight (kg, lb) | 2-3 | round |
| Volume (l, ml) | 1-2 | round |
| Count (pcs) | 0 | ceil |
| Temperature | 0-1 | round |
| Cooking (tbsp, tsp) | 1-2 | round |

---

## 6. Integration Rules

### 6.1 Recipe Integration

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-UN-050 | Recipes use units for ingredient quantities | Required field |
| BR-UN-051 | Recipes use units for yield amounts | Required field |
| BR-UN-052 | Unit precision is applied in recipe display | Formatting |
| BR-UN-053 | Changing unit on ingredient updates display | UI update |

### 6.2 Unit Conversion Integration

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-UN-060 | Conversions define how units relate to each other | UnitConversion records |
| BR-UN-061 | Conversion factor: fromUnit * factor = toUnit | Calculation |
| BR-UN-062 | Conversions can be approximate (flag) | isApproximate field |
| BR-UN-063 | Conversions can be product-specific | productId reference |

---

## 7. Search and Filter Rules

### 7.1 Searchable Fields

| Field | Search Type |
|-------|-------------|
| name | Text search (contains) |
| code | Text search (contains) |

### 7.2 Implicit Filters

| Filter | Applied When |
|--------|--------------|
| isActive | Dropdown population |
| showInDropdown | Dropdown population |
| isSystemUnit | Bulk selection exclusion |

---

## 8. Data Retention Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-UN-070 | System units are permanent and cannot be removed | Protected |
| BR-UN-071 | Deleting units with recipe references requires confirmation | Warning |
| BR-UN-072 | Unit usage should be tracked for impact analysis | Audit trail |

---

## 9. Validation Summary

### 9.1 Required Fields

| Field | Validation |
|-------|------------|
| code | Required, unique, max 20 characters, lowercase recommended |
| name | Required, max 100 characters |
| decimalPlaces | Required, 0-6 |
| roundingMethod | Required, enum: round, floor, ceil |
| displayOrder | Required, integer |
| showInDropdown | Required, boolean |
| isActive | Required, boolean |
| isSystemUnit | Required, boolean |

### 9.2 Optional Fields with Validation

| Field | Validation |
|-------|------------|
| pluralName | Max 100 characters |
| example | Max 200 characters |
| notes | Max 500 characters |

---

## Related Documents

- [UC-units.md](./UC-units.md) - Use Cases
- [DD-units.md](./DD-units.md) - Data Dictionary
- [FD-units.md](./FD-units.md) - Flow Diagrams
- [TS-units.md](./TS-units.md) - Technical Specifications
- [VAL-units.md](./VAL-units.md) - Validation Rules
