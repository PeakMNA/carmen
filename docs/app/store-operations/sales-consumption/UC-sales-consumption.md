# Use Cases: Sales Consumption

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Sales Consumption
- **Version**: 1.0.0
- **Last Updated**: 2026-01-27

---

## Actor Definitions

| Actor | Role | Primary Interest |
|-------|------|-----------------|
| System (Job) | Automated cron job | SC generation at shift close |
| F&B Manager | Monitor consumption and exceptions | Review SC status, clear exceptions |
| Store Manager | Operational oversight | Review SCs, void when necessary |
| Finance Manager | Cost accountability | Verify COGS entries, void authority |
| POS Admin | Integration management | Resolve mappings in POS Exception Queue |

---

## UC-SC-001: Shift-Close Auto-Generation

**Actor**: System (scheduled job)
**Trigger**: Shift-close time reached for a location with SC generation enabled
**Preconditions**:
- Location has `scGenerationEnabled = true`
- Shift has ended (businessDate + shift close time has passed)
- No existing SC for (locationId, shiftId, businessDate) in a non-draft status

**Main Flow**:
1. Job triggers for the location/shift pair
2. System collects all POS transactions for the period
3. System deduplicates by transaction ID
4. System explodes each transaction line through its recipe mapping
5. System validates each exploded ingredient line
6. System writes posted lines to inventory ledger as `SALES_CONSUMPTION` transactions
7. System routes exception lines to POS Exception Queue with reason codes
8. System creates SC document with final status
9. If any exceptions: POS Admin and/or F&B Manager receive notification (if configured)

**Alternative Flows**:
- A1: All lines post cleanly → SC status = `posted`, no notifications
- A2: Some lines exception → SC status = `posted_with_exceptions`, exception notification sent
- A3: All lines exception → SC status = `blocked`, urgent notification sent
- A4: Existing non-draft SC found for tuple → job skips, logs skip event
- A5: Location flag disabled → job skips, no SC generated

**Outcome**: SC document exists for (location, shift, businessDate). Posted lines are in inventory ledger. Exception lines are in POS queue.

---

## UC-SC-002: F&B Manager Reviews Daily SC

**Actor**: F&B Manager
**Trigger**: Start of next business day or notification of exceptions
**Preconditions**:
- User authenticated with `store_operations.view` permission
- SC documents exist for managed locations

**Main Flow**:
1. User navigates to Store Operations → Sales Consumption
2. User filters list by yesterday's date and their location
3. User reviews SC status badges (Posted, Posted with Exceptions, Blocked)
4. User opens an SC with status `posted_with_exceptions`
5. SC detail page shows header summary (cost, revenue, line counts)
6. Exception banner displays: "3 lines pending in POS Exception Queue"
7. User clicks banner link → navigates to POS Operate → Exceptions
8. User reviews exception items (POS item name, reason code, sale details)
9. User decides to resolve or defer each exception

**Alternative Flows**:
- A1: All SCs have status `posted` → no action needed; review is informational
- A2: SC has status `blocked` → entire shift unmapped; user escalates to POS Admin for mapping
- A3: User filters by location they do not have access to → location does not appear in list

**Outcome**: Manager has visibility into what was consumed, what was not captured, and what needs resolution.

---

## UC-SC-003: POS Admin Resolves Exception and Triggers Supplemental SC

**Actor**: POS Admin (resolves in POS module), System (generates Supplemental SC)
**Trigger**: Exception line in POS Exception Queue for a prior SC
**Preconditions**:
- Exception line exists in POS Operate → Exceptions
- User has `pos_integration.manage` permission
- Original SC is in `posted_with_exceptions` or `blocked` status

**Main Flow**:
1. POS Admin navigates to POS Integration → Operate → Exceptions
2. Queue shows exception with reason `UNMAPPED_ITEM`: "Oat Milk Latte" has no recipe
3. Admin clicks the item → opens mapping dialog
4. Admin searches recipes, selects "Oat Milk Latte Recipe", sets portion size
5. Admin saves mapping
6. System auto-triggers "Resolve & Re-post" for the exception line
7. System re-validates the exception line with the new mapping
8. Validation passes → system generates Supplemental SC (SC-{date}-{loc}-{shift}-001-SUP1)
9. Supplemental SC is posted immediately (status: `posted`)
10. Parent SC pending count decrements; if all resolved → parent SC status → `posted`

**Alternative Flows**:
- A1: Re-validation still fails (e.g., recipe ingredient has no cost) → exception remains with updated reason code (`ZERO_COST_INGREDIENT`)
- A2: User defers exception ("Defer to Tomorrow") → exception remains in queue; no supplemental generated
- A3: User marks exception as "Non-inventory" for `TAX_ONLY_ITEM` → item flagged permanently; future occurrences auto-skip

**Outcome**: Supplemental SC created; previously-missed ingredient consumption captured in inventory ledger.

---

## UC-SC-004: Store Manager Voids an SC

**Actor**: Store Manager or Finance Manager
**Trigger**: Discovery of SC generated from corrupted POS data
**Preconditions**:
- User authenticated with `store_operations.manager` or `finance.manager` role
- SC is in a non-voided status

**Main Flow**:
1. User opens SC detail page
2. User clicks "Void SC" button (visible only to authorized roles)
3. System shows confirmation dialog with void reason text field
4. User enters reason (minimum 10 characters): "Duplicate sync event from POS — transactions already captured in SC-20260126-MAIN-LUNCH-001"
5. User clicks "Confirm Void"
6. System creates reversing inventory transactions for all posted lines
7. System voids all linked Supplemental SCs
8. SC status → `voided`; voidedAt, voidedBy, voidReason recorded
9. Inventory ledger shows net-zero impact (original + reversal)

**Alternative Flows**:
- A1: User clicks Cancel → no change
- A2: SC already voided → "Void" button not shown; status badge reads "Voided"
- A3: Inventory reversal write fails → void is rolled back; SC remains in prior status; error shown to user

**Outcome**: SC is voided; inventory ledger is restored to pre-SC state; full audit trail preserved.

---

## UC-SC-005: Finance Manager Reviews COGS Accuracy

**Actor**: Finance Manager
**Trigger**: Monthly close or periodic cost review
**Preconditions**:
- User authenticated with `finance.manager` role
- SC documents exist for the review period

**Main Flow**:
1. Finance Manager navigates to Store Operations → Sales Consumption
2. Filters by date range (accounting period) and location
3. Reviews totalCostPosted per SC to verify COGS is captured
4. For SCs with `posted_with_exceptions`, notes that pending lines are not yet in COGS
5. Checks whether exception lines have been resolved (pending line count = 0)
6. Exports SC list for reconciliation with GL (future feature; currently informational)

**Alternative Flows**:
- A1: Finds SC with `blocked` status for a date that should have had sales → escalates to POS Admin to resolve all mappings

**Outcome**: Finance Manager has a complete picture of captured vs uncaptured COGS for the period.

---

## UC-SC-006: Handle VOID_AFTER_POST (Auto-Reversing)

**Actor**: System (automated)
**Trigger**: POS void or refund arrives for a transaction that was already captured in a posted SC
**Preconditions**:
- POS sync receives a void/refund transaction
- The original transaction ID exists in a posted SC line

**Main Flow**:
1. POS sync receives void transaction referencing `pos-txn-0032`
2. System locates the posted SC line with `posTransactionId = 'pos-txn-0032'`
3. System identifies the current open SC for the location/shift
4. System generates a reversing SC line in the current open SC:
   - `status = posted`, `reversesLineId = original line ID`
   - `qtyConsumed = -(original qtyConsumed)`, `extendedCost = -(original extendedCost)`
5. Reversing inventory transaction created (`SALES_CONSUMPTION` type, positive quantity = return to stock)
6. POS Exception Queue entry created as `VOID_AFTER_POST` — informational only, auto-marked as resolved
7. Manager receives informational notification

**Alternative Flows**:
- A1: Void references a transaction not found in any SC → exception queued as `REFUND_PARTIAL` for manual review

**Outcome**: Inventory is net-corrected; audit trail shows the original deduction and the reversal; no stock permanently lost.

---

**Document End**
