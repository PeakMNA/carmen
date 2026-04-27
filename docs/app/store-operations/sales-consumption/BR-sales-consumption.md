# Business Rules: Sales Consumption

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Sales Consumption
- **Route**: `/store-operations/sales-consumption`
- **Doc Prefix**: SC-
- **Version**: 1.0.0
- **Last Updated**: 2026-01-27

---

## 1. Overview

This document defines the business rules for Sales Consumption (SC) documents.

**KEY ARCHITECTURE**: Sales Consumption documents are system-generated. They are **NOT created manually** by users. Each SC represents all POS sales for one **(location, shift, business_date)** tuple, with recipe explosion converting sold menu items into ingredient-level inventory deductions.

- SC is the formal inventory source document for menu-driven stock consumption
- POS owns sales data and mappings; Store Operations owns the resulting SC document
- Menu Engineering reads SC data as a pure analytics consumer

---

## 2. Scope and Granularity

### 2.1 One SC per (Location, Shift, Business Date)

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-SCOPE-001 | One SC per tuple | Exactly one SC document exists per (locationId, shiftId, businessDate) combination |
| BR-SC-SCOPE-002 | Non-shift outlets | Locations without shift configuration use shiftId = `all_day` and generate one SC per business date |
| BR-SC-SCOPE-003 | Multi-connection | A single SC may aggregate transactions from multiple POS connections at the same location |
| BR-SC-SCOPE-004 | System-generated only | No user-facing create action exists for SC documents |

---

## 3. Document Reference Format

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-REF-001 | Reference format | SC-{YYYYMMDD}-{locationCode}-{shift}-{seq} (e.g. SC-20260127-MAIN-LUNCH-001) |
| BR-SC-REF-002 | Supplemental suffix | Supplemental SCs append -SUP{N} (e.g. SC-20260127-MAIN-LUNCH-001-SUP1) |
| BR-SC-REF-003 | Uniqueness | Reference number is unique within the Carmen system |
| BR-SC-REF-004 | Traceability | Each SC is traceable to its source POS connection(s) and raw transaction IDs |

---

## 4. Generation Rules

### 4.1 Trigger

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-GEN-001 | Scheduled trigger | SC generation is triggered by a scheduled job at the configurable shift-close time per location |
| BR-SC-GEN-002 | Transaction window | Job collects all POS transactions with `businessDate` matching the current shift period |
| BR-SC-GEN-003 | Deduplication | Duplicate POS transaction IDs (re-syncs, retries) are silently deduplicated before SC generation |
| BR-SC-GEN-004 | Feature flag | SC generation is enabled per location via a configuration flag; disabled locations continue to receive raw POS staging records only |

### 4.2 Recipe Explosion

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-GEN-005 | Mapping required | Each POS item must have an active recipe mapping to generate a postable SC line |
| BR-SC-GEN-006 | Ingredient-level lines | A single POS transaction line may produce multiple SC lines (one per ingredient in the recipe) |
| BR-SC-GEN-007 | Fractional variants | Fractional sales (slice, half, portion) use the variant recipe configured in POS Setup → Mappings → Fractional |
| BR-SC-GEN-008 | Modifier explosion | POS modifiers/add-ons with a recipe mapping generate additional ingredient lines |
| BR-SC-GEN-009 | Quantity calculation | `ingredientQty = recipeIngredientQty × quantitySold` with unit conversion applied |

---

## 5. Status Rules

### 5.1 Status Definitions

| Status | Description | Terminal? |
|--------|-------------|-----------|
| `draft` | SC created by job, validation in progress | No |
| `posted` | All lines posted to inventory ledger | Yes |
| `posted_with_exceptions` | Some lines posted; unmapped lines queued in POS Exception Queue | No — resolves to `posted` when queue is cleared |
| `blocked` | Zero lines could post (entire shift unmapped) | No — resolves when exceptions cleared |
| `voided` | Manager voided entire SC | Yes |

### 5.2 Status Transitions

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-STAT-001 | Draft → Posted | All lines validate and post successfully |
| BR-SC-STAT-002 | Draft → Posted with Exceptions | At least one line posts; at least one line is an exception |
| BR-SC-STAT-003 | Draft → Blocked | All lines are exceptions; zero lines post |
| BR-SC-STAT-004 | Posted with Exceptions → Posted | All exception lines resolved and re-posted via Supplemental SC(s) |
| BR-SC-STAT-005 | Blocked → Posted with Exceptions | Some exceptions resolved, at least one posts |
| BR-SC-STAT-006 | Any non-terminal → Voided | Manager voids the SC with a reason (rare) |
| BR-SC-STAT-007 | No edit | SC status cannot be manually changed except by system posting or manager void |

---

## 6. Posting Rules

### 6.1 Mapped Lines (Auto-Post)

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-POST-001 | Auto-post mapped lines | Lines where all validation passes are posted to the inventory ledger immediately |
| BR-SC-POST-002 | Inventory deduction | `SALES_CONSUMPTION` transaction type is written for each ingredient line |
| BR-SC-POST-003 | Cost at posting | Unit cost is the current cost at time of posting per the location's costing method (FIFO or Periodic Average) |
| BR-SC-POST-004 | Immutability | Once a line is posted, it cannot be edited; corrections require a reversing line or Supplemental SC |
| BR-SC-POST-005 | Partial post allowed | SC may post with a mix of posted and pending lines (status: `posted_with_exceptions`) |

### 6.2 Exception Lines (Queued)

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-POST-006 | Exception routing | Lines failing validation are not posted and are routed to the POS Exception Queue with a reason code |
| BR-SC-POST-007 | No inventory impact | Exception lines do not create inventory transactions until resolved and re-posted |
| BR-SC-POST-008 | Re-post via Supplemental | Resolved exception lines are posted via a Supplemental SC linked to the original |

---

## 7. Exception Reason Codes

| Code | Reason | Auto-Resolved? | Resolution Path |
|------|--------|----------------|-----------------|
| `UNMAPPED_ITEM` | POS item has no recipe mapping | No | Add mapping in POS Setup → Mappings |
| `MISSING_RECIPE` | Mapped recipe was deleted or inactive | No | Reassign or reactivate recipe in POS mappings |
| `ZERO_COST_INGREDIENT` | Recipe ingredient has no cost on file | No | Update product cost in Product Management |
| `LOCATION_UNMAPPED` | POS outlet not linked to a Carmen location | No | Add location mapping in POS Setup → Connections |
| `FRACTIONAL_MISSING_VARIANT` | Fractional sale has no variant recipe configured | No | Add variant in POS Setup → Mappings → Fractional |
| `MODIFIER_UNMAPPED` | POS modifier/add-on has no recipe link | No | Map modifier in POS Setup → Mappings → Modifiers |
| `CURRENCY_MISMATCH` | POS currency differs from Carmen location currency; no active exchange rate for the date | No | Add/refresh exchange rate in Finance → Exchange Rates |
| `VOID_AFTER_POST` | POS void arrived after SC for the shift was already posted | Yes (auto-reversing) | System auto-generates reversing line in next shift SC |
| `REFUND_PARTIAL` | Refund references a sale from a prior shift or day | No | Manager confirms; system creates reversing line linked to original SC |
| `TAX_ONLY_ITEM` | POS line is a service charge, tax, tip, or surcharge with no inventory impact | Yes (after one-time flag) | Mark item type as `non_inventory`; future occurrences auto-skip |
| `COMP_OR_DISCOUNT` | Sale is 100% comped/discounted — handling depends on comp policy (TBD) | No | Policy-driven: route to Wastage or skip |
| `STALE_TRANSACTION` | POS sale timestamp older than configurable cut-off (default: 7 days) | No | Manager decides: post to current shift or discard with reason |

### 7.1 Auto-Resolution Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-EXC-001 | Duplicate auto-dedupe | `DUPLICATE_TRANSACTION` is silently deduplicated before SC generation; never queued |
| BR-SC-EXC-002 | Non-inventory auto-skip | Once a POS item is flagged `non_inventory`, all future occurrences bypass the queue and are excluded from SC |
| BR-SC-EXC-003 | Void auto-reverse | `VOID_AFTER_POST` auto-generates a reversing line in the next shift SC; the queue entry is informational only |

---

## 8. Supplemental SC Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-SUP-001 | When generated | A Supplemental SC is generated when exception lines from a prior SC are resolved and re-posted |
| BR-SC-SUP-002 | Parent link | Supplemental SC carries `parentSCId` referencing the original SC |
| BR-SC-SUP-003 | Status | Supplemental SC is posted immediately on generation (status: `posted`) |
| BR-SC-SUP-004 | Reference | Reference format: SC-{original-ref}-SUP{N} where N is the supplemental sequence |
| BR-SC-SUP-005 | Parent update | When all exception lines are covered by supplementals, the parent SC transitions to `posted` |

---

## 9. Void Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-VOID-001 | Void permission | Only Store Manager or Finance Manager may void an SC |
| BR-SC-VOID-002 | Void requires reason | Void action requires a reason text (minimum 10 characters) |
| BR-SC-VOID-003 | Void reverses inventory | Voiding an SC creates reversing inventory transactions for all posted lines |
| BR-SC-VOID-004 | Void is terminal | Voided SC cannot be re-posted or un-voided |
| BR-SC-VOID-005 | Supplemental void | Voiding a parent SC also voids all linked Supplemental SCs |

---

## 10. Costing Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-COST-001 | Cost method | Ingredient unit cost follows the location's configured costing method (FIFO or Periodic Average) |
| BR-SC-COST-002 | Cost at time of posting | Cost is captured at the time SC lines are posted, not at time of sale |
| BR-SC-COST-003 | Revenue is informational | POS sale revenue (totalRevenue) is stored on the SC header for analytics but does not post to any revenue ledger |
| BR-SC-COST-004 | Currency | All SC costs are recorded in the Carmen location's base currency |
| BR-SC-COST-005 | Currency conversion | When POS sale is in a different currency, the active exchange rate for businessDate is applied |

---

## 11. Access Control Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SC-ACC-001 | View access | Users with `store_operations.view` permission |
| BR-SC-ACC-002 | Location filter | Users see only SC documents for their assigned locations |
| BR-SC-ACC-003 | Void permission | `store_operations.manager` or `finance.manager` role required |
| BR-SC-ACC-004 | No create/edit | No user can manually create or edit an SC document |
| BR-SC-ACC-005 | POS exception resolution | Resolving exceptions requires `pos_integration.manage` permission (handled in POS module) |

---

## 12. Business Constraints Summary

| Constraint | Rule |
|------------|------|
| Creation | System-generated only; no manual create |
| Granularity | One SC per (location, shift, business_date) |
| Edit | Not allowed after any line is posted |
| Corrections | Via reversing lines or Supplemental SC |
| Revenue posting | Not performed — informational only |
| Manual inventory OUT | Use Stock Issue module instead |

---

## 13. Differences from Stock Issue

| Aspect | Sales Consumption | Stock Issue |
|--------|-------------------|-------------|
| Initiated by | System (POS pipeline) | User (via Store Requisition) |
| Source document | POS transaction | Store Requisition |
| Creation | Automatic at shift close | Manual user action |
| Mapping basis | Recipe mapping (POS item → ingredients) | SR line items |
| Partial posting | Allowed (posted_with_exceptions) | Not applicable |
| Exception handling | Exception Queue in POS module | N/A |
| Revenue data | Stored informational | Not stored |

---

## 14. Open Questions

| # | Question | Impact |
|---|---------|--------|
| OQ-1 | Comp/discount policy: deduct as Wastage, SC with zero revenue, or skip? | Affects `COMP_OR_DISCOUNT` exception resolution path and BR-SC-POST rules |
| OQ-2 | Late refund policy: `VOID_AFTER_POST` auto-reversing vs always manual? | Affects BR-SC-EXC-003 |
| OQ-3 | Shift entity: does Carmen have an existing `Shift` model or does SC define its own? | Affects schema in DD |

---

**Document End**
