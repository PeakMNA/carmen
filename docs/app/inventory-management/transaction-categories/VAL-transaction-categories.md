# Validation Rules: Transaction Categories

**Module**: Inventory Management
**Sub-module**: Transaction Categories
**Version**: 1.0.0
**Last Updated**: 2025-01-16
**Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Documentation Team | Initial version |

---

## Related Documentation
- [Business Requirements](./BR-transaction-categories.md)
- [Use Cases](./UC-transaction-categories.md)
- [Technical Specification](./TS-transaction-categories.md)
- [Data Definition](./DD-transaction-categories.md)
- [Flow Diagrams](./FD-transaction-categories.md)

---

## Validation Categories

### Field-Level Validations (VAL-TXC-001 to 099)
Basic field format, type, and range validations

### Business Rule Validations (VAL-TXC-101 to 199)
Complex business logic validations

### Uniqueness Validations (VAL-TXC-201 to 299)
Duplicate checking and uniqueness constraints

### Referential Validations (VAL-TXC-301 to 399)
Foreign key and relationship validations

---

## Field-Level Validations

### VAL-TXC-001: Category Code

**Rule**: Category code must be a non-empty string, maximum 10 characters.

**Layer**: Client + Server
**Error Message**: "Code is required" | "Code must be 10 characters or less"
**Implementation**:
```typescript
if (!formData.code.trim()) {
  newErrors.code = "Code is required"
} else if (formData.code.length > 10) {
  newErrors.code = "Code must be 10 characters or less"
}
```

**Test Scenarios**:
- Valid: "WST", "LOSS", "QC"
- Invalid: "" (empty), "VERYLONGCODE123" (>10 chars)

**Source Evidence**: `components/category-form.tsx:117-121`

---

### VAL-TXC-002: Category Name

**Rule**: Category name is required.

**Layer**: Client + Server
**Error Message**: "Name is required"
**Implementation**:
```typescript
if (!formData.name.trim()) {
  newErrors.name = "Name is required"
}
```

**Test Scenarios**:
- Valid: "Wastage", "Loss", "Quality Control"
- Invalid: "", "   " (whitespace only)

**Source Evidence**: `components/category-form.tsx:123-125`

---

### VAL-TXC-003: GL Account Code

**Rule**: GL Account Code is required.

**Layer**: Client + Server
**Error Message**: "GL Account Code is required"
**Implementation**:
```typescript
if (!formData.glAccountCode.trim()) {
  newErrors.glAccountCode = "GL Account Code is required"
}
```

**Test Scenarios**:
- Valid: "5200", "5100", "1310"
- Invalid: "", "   "

**Source Evidence**: `components/category-form.tsx:127-129`

---

### VAL-TXC-004: GL Account Name

**Rule**: GL Account Name is required.

**Layer**: Client + Server
**Error Message**: "GL Account Name is required"
**Implementation**:
```typescript
if (!formData.glAccountName.trim()) {
  newErrors.glAccountName = "GL Account Name is required"
}
```

**Test Scenarios**:
- Valid: "Waste Expense", "Inventory Loss", "Cost of Goods Sold"
- Invalid: "", "   "

**Source Evidence**: `components/category-form.tsx:131-133`

---

### VAL-TXC-005: Sort Order Range

**Rule**: Sort order must be between 1 and 999.

**Layer**: Client + Server
**Error Message**: "Sort order must be between 1 and 999"
**Implementation**:
```typescript
if (formData.sortOrder < 1 || formData.sortOrder > 999) {
  newErrors.sortOrder = "Sort order must be between 1 and 999"
}
```

**Test Scenarios**:
- Valid: 1, 50, 999
- Invalid: 0, -1, 1000, NaN

**Source Evidence**: `components/category-form.tsx:135-137`

---

### VAL-TXC-006: Category Type

**Rule**: Type must be 'IN' or 'OUT'.

**Layer**: Client + Server
**Error Message**: "Invalid category type"
**Implementation**:
```typescript
type AdjustmentType = 'IN' | 'OUT'
```

**Test Scenarios**:
- Valid: "IN", "OUT"
- Invalid: "INOUT", "in", "out", "", null

**Source Evidence**: `lib/types/transaction-category.ts:34`

---

### VAL-TXC-007: Reason Code

**Rule**: Reason code must be a non-empty string, maximum 10 characters.

**Layer**: Client + Server
**Error Message**: "Code is required" | "Code must be 10 characters or less"
**Implementation**:
```typescript
if (!formData.code.trim()) {
  newErrors.code = "Code is required"
} else if (formData.code.length > 10) {
  newErrors.code = "Code must be 10 characters or less"
}
```

**Test Scenarios**:
- Valid: "DMG", "EXP", "SPL"
- Invalid: "", "VERYLONGREASONCODE"

**Source Evidence**: `components/reason-dialog.tsx:114-118`

---

### VAL-TXC-008: Reason Name

**Rule**: Reason name is required.

**Layer**: Client + Server
**Error Message**: "Name is required"
**Implementation**:
```typescript
if (!formData.name.trim()) {
  newErrors.name = "Name is required"
}
```

**Test Scenarios**:
- Valid: "Damaged Goods", "Expired Items"
- Invalid: "", "   "

**Source Evidence**: `components/reason-dialog.tsx:120-122`

---

### VAL-TXC-009: Reason Sort Order

**Rule**: Reason sort order must be between 1 and 999.

**Layer**: Client + Server
**Error Message**: "Sort order must be between 1 and 999"
**Implementation**:
```typescript
if (formData.sortOrder < 1 || formData.sortOrder > 999) {
  newErrors.sortOrder = "Sort order must be between 1 and 999"
}
```

**Test Scenarios**:
- Valid: 1, 50, 999
- Invalid: 0, -1, 1000

**Source Evidence**: `components/reason-dialog.tsx:124-126`

---

## Business Rule Validations

### VAL-TXC-101: Type Immutability

**Rule**: Category type cannot be changed after creation.

**Layer**: Client (UI disabled) + Server
**Error Message**: "Type cannot be changed after creation"
**Implementation**:
```typescript
const isTypeLocked = isEditMode || !!preselectedType
// Type selection buttons disabled when locked
```

**Rationale**: Changing type would affect GL account mapping for existing adjustments.

**Source Evidence**: `components/category-form.tsx:108`, `components/category-form.tsx:235-239`

---

### VAL-TXC-102: Code Auto-Uppercase

**Rule**: Category and reason codes are automatically converted to uppercase.

**Layer**: Client
**Implementation**:
```typescript
onChange={(e) =>
  setFormData((prev) => ({
    ...prev,
    code: e.target.value.toUpperCase(),
  }))
}
```

**Rationale**: Ensures consistent code formatting for lookups.

**Source Evidence**: `components/category-form.tsx:336-340`, `components/reason-dialog.tsx:169-173`

---

### VAL-TXC-103: Active Status Default

**Rule**: New categories and reasons default to active status.

**Layer**: Client
**Implementation**:
```typescript
isActive: category?.isActive ?? true
```

**Source Evidence**: `components/category-form.tsx:104`, `components/reason-dialog.tsx:83-84`

---

### VAL-TXC-104: Sort Order Default

**Rule**: New categories and reasons default to sort order 1.

**Layer**: Client
**Implementation**:
```typescript
sortOrder: category?.sortOrder || 1
```

**Source Evidence**: `components/category-form.tsx:103`, `components/reason-dialog.tsx:82`

---

## Uniqueness Validations

### VAL-TXC-201: Category Code Uniqueness

**Rule**: Category code must be unique within each type (IN or OUT).

**Layer**: Server (Database constraint)
**Error Message**: "Code already exists for this type"
**Implementation**:
```sql
UNIQUE (code, type)
```

**Test Scenarios**:
- Valid: "WST" for OUT, "WST" for IN (different types)
- Invalid: Two categories with "WST" for type OUT

---

### VAL-TXC-202: Reason Code Uniqueness

**Rule**: Reason code must be unique within each category.

**Layer**: Server (Database constraint)
**Error Message**: "Code already exists for this category"
**Implementation**:
```sql
UNIQUE (category_id, code)
```

**Test Scenarios**:
- Valid: "DMG" in Wastage category, "DMG" in Loss category
- Invalid: Two reasons with "DMG" in same Wastage category

---

## Referential Validations

### VAL-TXC-301: Reason Category Reference

**Rule**: Reason must reference an existing category.

**Layer**: Server (Foreign key)
**Error Message**: "Category not found"
**Implementation**:
```sql
FOREIGN KEY (category_id) REFERENCES tb_transaction_category(id)
```

---

### VAL-TXC-302: Category Delete with Reasons

**Rule**: Deleting a category cascades to delete all associated reasons.

**Layer**: Server (Cascade delete)
**Implementation**:
```sql
ON DELETE CASCADE
```

**Confirmation**: Dialog shows reason count in warning message.

**Source Evidence**: `[id]/page.tsx:254-256`

---

### VAL-TXC-303: Category Delete with Adjustments

**Rule**: Category cannot be deleted if used in posted adjustments.

**Layer**: Server
**Error Message**: "Cannot delete category - used in existing adjustments"

**Rationale**: Maintains audit trail and referential integrity for financial records.

---

## Form State Validations

### VAL-TXC-401: Unsaved Changes Detection

**Rule**: System detects unsaved changes and prompts before navigation.

**Layer**: Client
**Implementation**:
```typescript
const hasChanges =
  formData.code !== (category?.code || "") ||
  formData.name !== (category?.name || "") ||
  // ... other field comparisons
```

**Source Evidence**: `components/category-form.tsx:173-181`

---

### VAL-TXC-402: Discard Confirmation

**Rule**: Navigating away with unsaved changes requires confirmation.

**Layer**: Client
**Dialog Content**: "You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
**Actions**: "Continue Editing" | "Discard Changes"

**Source Evidence**: `components/category-form.tsx:482-503`

---

## Validation Summary Table

| ID | Field | Rule | Layer | Required |
|----|-------|------|-------|----------|
| VAL-TXC-001 | Category Code | Non-empty, max 10 chars | Client+Server | Yes |
| VAL-TXC-002 | Category Name | Non-empty | Client+Server | Yes |
| VAL-TXC-003 | GL Account Code | Non-empty | Client+Server | Yes |
| VAL-TXC-004 | GL Account Name | Non-empty | Client+Server | Yes |
| VAL-TXC-005 | Sort Order | Range 1-999 | Client+Server | Yes |
| VAL-TXC-006 | Type | IN or OUT | Client+Server | Yes |
| VAL-TXC-007 | Reason Code | Non-empty, max 10 chars | Client+Server | Yes |
| VAL-TXC-008 | Reason Name | Non-empty | Client+Server | Yes |
| VAL-TXC-009 | Reason Sort Order | Range 1-999 | Client+Server | Yes |
| VAL-TXC-101 | Type | Immutable after create | Client+Server | - |
| VAL-TXC-201 | Category Code | Unique per type | Server | - |
| VAL-TXC-202 | Reason Code | Unique per category | Server | - |

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Documentation Team | Initial creation |
