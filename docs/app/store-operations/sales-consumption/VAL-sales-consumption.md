# Validations: Sales Consumption

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Sales Consumption
- **Version**: 1.0.0
- **Last Updated**: 2026-01-27

---

## Overview

Sales Consumption validations are **server-side only**. There are no user-facing create/edit forms for SC documents. All validation occurs in the SC generation service (`sales-consumption-service.ts`) and the void API route.

---

## SC Header Validations

### VAL-SC-HDR-001: Unique Tuple

**Rule**: Only one primary SC (where parentSCId is null) may exist per (locationId, shiftId, businessDate)

**When**: Before generation

**Error**: Generation is skipped; logs "SC already exists for this tuple — skipping"

---

### VAL-SC-HDR-002: Location Active

**Rule**: locationId must reference an active Carmen location

**When**: Before generation

**Error**: Generation fails; exception logged to job error log

---

### VAL-SC-HDR-003: Feature Flag Enabled

**Rule**: Location must have `scGenerationEnabled = true`

**When**: Before generation

**Error**: Generation silently skipped

---

### VAL-SC-HDR-004: Connection Data Present

**Rule**: At least one POS connection for the location must have synced transactions for the period

**When**: Before generation

**Error**: If zero transactions exist: SC is not generated (nothing to post). This is not an error — it is normal for closed days.

---

## SC Line Validations (per Exploded Ingredient Line)

### VAL-SC-LINE-001: Mapping Active

**Rule**: The POS item must have an active recipe mapping (not deleted, not deactivated)

**When**: Recipe explosion step

**Exception Code**: `UNMAPPED_ITEM`

---

### VAL-SC-LINE-002: Recipe Active

**Rule**: The mapped recipe must have status = active

**When**: Recipe explosion step

**Exception Code**: `MISSING_RECIPE`

---

### VAL-SC-LINE-003: Ingredient Has Cost

**Rule**: Each recipe ingredient's current unit cost must be > 0

**When**: After explosion, before posting

**Exception Code**: `ZERO_COST_INGREDIENT`

---

### VAL-SC-LINE-004: Location Mapped

**Rule**: The POS outlet in the transaction must be mapped to a Carmen location

**When**: Before explosion

**Exception Code**: `LOCATION_UNMAPPED`

---

### VAL-SC-LINE-005: Fractional Variant Configured

**Rule**: If the POS item is a fractional sale (identified by variant flag), a matching variant recipe must exist in POS Mappings → Fractional

**When**: Before explosion

**Exception Code**: `FRACTIONAL_MISSING_VARIANT`

---

### VAL-SC-LINE-006: Modifier Mapped

**Rule**: Each POS modifier/add-on that affects food cost must have a recipe mapping in POS Mappings → Modifiers

**When**: Before explosion

**Exception Code**: `MODIFIER_UNMAPPED`

---

### VAL-SC-LINE-007: Currency Exchange Rate Present

**Rule**: If POS transaction currency differs from Carmen location's base currency, an active exchange rate must exist for the businessDate

**When**: Before cost calculation

**Exception Code**: `CURRENCY_MISMATCH`

---

### VAL-SC-LINE-008: Not a Tax-Only Item

**Rule**: If POS item is flagged `non_inventory` (service charge, tax, tip, surcharge), line is excluded from SC and from the exception queue silently

**When**: Before explosion

**Result**: Line dropped silently; no exception created

---

### VAL-SC-LINE-009: Transaction Not Stale

**Rule**: POS transaction's businessDate must be within the configurable staleness window (default: 7 days from current business date)

**When**: Collection step

**Exception Code**: `STALE_TRANSACTION`

---

### VAL-SC-LINE-010: Comp/Discount Handling

**Rule**: If POS line has a 100% discount and the outlet's comp policy is not yet configured, line is queued as an exception

**When**: Before explosion

**Exception Code**: `COMP_OR_DISCOUNT`

**Note**: Behaviour changes once comp policy is locked (see BR Open Questions OQ-1).

---

### VAL-SC-LINE-011: Not a Duplicate

**Rule**: POS transaction ID must not already exist in any SC line for the same location/period (deduplication)

**When**: Collection step, before any other validation

**Result**: Duplicate silently discarded; no exception created; deduplication count logged

---

## Status Transition Validations

### VAL-SC-STAT-001: No Manual Status Change

**Rule**: SC status cannot be set directly by any user action other than Void

**When**: Any API call attempting to update `status` field

**Error**: 403 Forbidden — "SC status is managed by the system"

---

### VAL-SC-STAT-002: Void Requires Non-Voided Status

**Rule**: Void action may only be applied to SC documents not already in `voided` status

**When**: Void API route

**Error**: 409 Conflict — "SC is already voided"

---

### VAL-SC-STAT-003: Void Reason Required

**Rule**: Void reason text must be present and at least 10 characters

**When**: Void API route

**Error**: 422 Unprocessable Entity — "Void reason must be at least 10 characters"

---

### VAL-SC-STAT-004: Void Permission

**Rule**: Only users with `store_operations.manager` or `finance.manager` role may void an SC

**When**: Void API route

**Error**: 403 Forbidden — "Insufficient permissions to void Sales Consumption"

---

## Supplemental SC Validations

### VAL-SC-SUP-001: Parent Must Exist

**Rule**: A Supplemental SC must reference a valid parent SC via `parentSCId`

**When**: Supplemental SC creation (internal, system-only)

**Error**: Generation fails; exception logged

---

### VAL-SC-SUP-002: Parent Must Not Be Voided

**Rule**: Supplemental SC cannot be generated for a voided parent

**When**: Supplemental SC creation

**Error**: Re-post rejected — "Cannot create Supplemental SC for a voided document"

---

### VAL-SC-SUP-003: Line Validates Before Supplemental Created

**Rule**: The exception line must pass all line validations (VAL-SC-LINE-001 to VAL-SC-LINE-010) before the Supplemental SC is created

**When**: Re-post triggered by POS exception resolution

**Error**: Supplemental not created; exception line updated with new reason code

---

**Document End**
