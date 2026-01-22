# Validation Rules: POS Integration

## Module Information
- **Module**: System Administration > System Integrations
- **Sub-Module**: POS Integration
- **Route**: `/system-administration/system-integration/pos`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-18

---

## Recipe Mapping Validation

### VAL-POS-001: Create Mapping

| Field | Rule | Message |
|-------|------|---------|
| posItemId | Required | POS item is required |
| posOutletId | Required | POS outlet selection is required |
| recipeId | Required | Recipe selection is required |
| portionSize | Required, > 0 | Portion size must be greater than 0 |
| unit | Required | Unit is required |
| unitPrice | >= 0 | Price cannot be negative |

**Composite Key**: posItemId + posOutletId must be unique (same item can have different mappings per outlet)

---

### VAL-POS-002: Edit Mapping

| Field | Rule | Message |
|-------|------|---------|
| recipeId | Required | Recipe selection is required |
| posOutletId | Required | POS outlet is required |
| portionSize | Required, > 0 | Portion size must be greater than 0 |
| unit | Required | Unit is required |
| unitPrice | Required, >= 0 | Price is required and cannot be negative |

---

## Location Mapping Validation

### VAL-POS-003: Location Mapping

| Field | Rule | Message |
|-------|------|---------|
| locationId | Required | Location is required |
| posOutletId | Required for mapping | POS outlet is required |

**Business Rule**: Each location can only be mapped to one POS outlet.

---

## Fractional Variant Validation

### VAL-POS-004: Create Variant

| Field | Rule | Message |
|-------|------|---------|
| baseRecipeId | Required | Base recipe is required |
| totalYield | Required, >= 1 | Total yield must be at least 1 |
| yieldUnit | Required | Yield unit is required |
| roundingRule | Required, valid value | Rounding rule is required |

**Valid Rounding Rules**: round_down, round_up, round_nearest, exact

---

### VAL-POS-005: Add Variant Item

| Field | Rule | Message |
|-------|------|---------|
| posItemId | Required | POS item ID is required |
| posItemName | Required | POS item name is required |
| deductionAmount | Required, 0-100 | Deduction must be between 0 and 100% |
| price | >= 0 | Price cannot be negative |

---

## Transaction Validation

### VAL-POS-006: Transaction Approval

| Field | Rule | Message |
|-------|------|---------|
| transactionId | Required | Transaction ID is required |
| notes | Optional | - |

**Business Rule**: Only transactions with status 'pending_approval' can be approved.

---

### VAL-POS-007: Transaction Rejection

| Field | Rule | Message |
|-------|------|---------|
| transactionId | Required | Transaction ID is required |
| reason | Required | Rejection reason is required |

**Business Rule**: Only transactions with status 'pending_approval' can be rejected.

---

### VAL-POS-008: Transaction Retry

| Field | Rule | Message |
|-------|------|---------|
| transactionId | Required | Transaction ID is required |

**Business Rule**: Only transactions with status 'failed' can be retried.

---

## Configuration Validation

### VAL-POS-009: POS Configuration

| Field | Rule | Message |
|-------|------|---------|
| posSystem | Required, valid value | POS system type is required |
| apiEndpoint | Required when custom | API endpoint is required |
| syncFrequency | 5, 15, 30, or 60 | Invalid sync frequency |
| processingMode | automatic, approval, manual | Invalid processing mode |
| autoApproveThreshold | >= 0 | Threshold cannot be negative |
| dataRetentionDays | 90, 180, 365, or 730 | Invalid retention period |
| notificationRecipients | Valid emails | Invalid email format |

**Valid POS Systems**: comanche, custom

---

### VAL-POS-010: Email Recipients

| Field | Rule | Message |
|-------|------|---------|
| notificationRecipients | Each must be valid email | Invalid email address |

**Format**: Comma-separated email addresses, trimmed and filtered for empty values.

---

## Report Validation

### VAL-POS-011: Export Report

| Field | Rule | Message |
|-------|------|---------|
| reportType | Required | Report type is required |
| format | csv, pdf, excel | Invalid export format |

---

## Status Transition Rules

### Transaction Status Transitions

| From | To | Condition |
|------|-----|-----------|
| pending_approval | approved | Manager approves |
| pending_approval | rejected | Manager rejects |
| approved | processing | System processes |
| processing | success | Processing completes |
| processing | failed | Processing error |
| failed | processing | User retries |
| failed | manually_resolved | Manual resolution |

---

## Business Rules

### BR-POS-001: Outlet-Specific Pricing
Same POS item can be mapped to different recipes and prices per outlet.

### BR-POS-002: Auto-Approval Threshold
When processing mode is 'approval', transactions below autoApproveThreshold are automatically processed.

### BR-POS-003: Mapping Prerequisites
Recipe mappings require location-to-outlet mappings to be configured first.

### BR-POS-004: Fractional Deduction
Fractional variant deduction amounts must sum to <= 100% per base recipe.

### BR-POS-005: Variance Thresholds
- Normal: variance <= 3%
- Review: 3% < variance <= 10%
- Critical: variance > 10%

---

**Document End**
