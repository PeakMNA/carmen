# VAL-EXRATE: Exchange Rate Management Validation Rules

**Module**: Finance
**Sub-Module**: Exchange Rate Management
**Document Type**: Validations (VAL)
**Version**: 1.0.0
**Last Updated**: 2025-01-13
**Status**: Draft

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

### 1.1 Purpose

This document defines comprehensive validation rules for the Exchange Rate Management module to ensure exchange rate data integrity, prevent currency conversion errors, maintain compliance with IAS 21 accounting standards, and protect against financial losses from rate miscalculations. Critical validations include exchange rate precision bounds, rate variance thresholds, triangulation consistency, dual currency posting verification, and period-end revaluation controls. Invalid exchange rate data can result in incorrect financial statements, exchange gain/loss miscalculations, regulatory non-compliance, and significant financial exposure.

### 1.2 Scope

This document defines validation rules across three layers:
- **Client-Side**: Immediate user feedback and UX validation
- **Server-Side**: Security and business rule enforcement
- **Database**: Final data integrity constraints

### 1.3 Validation Strategy

```
User Input
    ↓
[Client-Side Validation] ← Immediate feedback, UX
    ↓
[Server-Side Validation] ← Security, business rules
    ↓
[Database Constraints] ← Final enforcement
    ↓
Data Stored
```

**Validation Principles**:
1. Never trust client-side data - always validate on server
2. Exchange rate data requires strictest validation (zero tolerance for errors)
3. Provide immediate user feedback when possible
4. Use clear, actionable error messages in user's language
5. Enforce IAS 21 accounting standards consistently
6. Prevent security vulnerabilities (SQL injection, XSS)
7. Use high-precision decimal arithmetic (Decimal.js) to avoid floating point errors
8. Validate rate variance to detect market anomalies and data entry errors

---

## 2. Field-Level Validations (VAL-EXRATE-001 to 099)

### VAL-EXRATE-001: source_currency - ISO 4217 Validation

**Field**: `source_currency`
**Database Column**: `exchange_rates.source_currency`
**Data Type**: VARCHAR(3) / string

**Validation Rule**: Source currency must be exactly 3 uppercase letters conforming to ISO 4217 standard.

**Format Requirements**:
- Length: Exactly 3 characters
- Characters: Uppercase letters A-Z only (no numbers, no special characters)
- Standard: Must exist in ISO 4217 currency code list
- Examples: USD, GBP, EUR, JPY, SGD, CNY, INR, AUD

**Implementation Requirements**:
- **Client-Side**: Dropdown with ISO 4217 currency list from Currency Management, searchable, auto-uppercase input
- **Server-Side**: Validate against active currencies in Currency Management module, verify uppercase, check length = 3
- **Database**: VARCHAR(3) NOT NULL, CHECK (source_currency ~ '^[A-Z]{3}$'), FOREIGN KEY to currencies.currency_code

**Error Codes**:
- VAL-EXRATE-001A: "Source currency is required"
- VAL-EXRATE-001B: "Source currency must be exactly 3 uppercase letters (e.g., USD, GBP, EUR)"
- VAL-EXRATE-001C: "Source currency '{code}' is not a valid ISO 4217 code or not active in system"

**User Action**: User must select valid active ISO 4217 currency code from dropdown.

**Test Cases**:
- ✅ Valid: "USD" (United States Dollar)
- ✅ Valid: "GBP" (British Pound Sterling)
- ✅ Valid: "EUR" (Euro)
- ❌ Invalid: "" (empty)
- ❌ Invalid: "usd" (lowercase)
- ❌ Invalid: "US" (too short)
- ❌ Invalid: "USDD" (too long)
- ❌ Invalid: "US1" (contains number)

---

### VAL-EXRATE-002: target_currency - ISO 4217 Validation

**Field**: `target_currency`
**Database Column**: `exchange_rates.target_currency`
**Data Type**: VARCHAR(3) / string

**Validation Rule**: Target currency must be exactly 3 uppercase letters conforming to ISO 4217 standard, and must differ from source currency.

**Format Requirements**:
- Length: Exactly 3 characters
- Characters: Uppercase letters A-Z only
- Standard: Must exist in ISO 4217 currency code list
- Must NOT equal source_currency (a currency cannot have a rate to itself)

**Implementation Requirements**:
- **Client-Side**: Dropdown filtered to exclude source_currency, searchable
- **Server-Side**: Validate against active currencies, verify ≠ source_currency
- **Database**: VARCHAR(3) NOT NULL, CHECK (target_currency ~ '^[A-Z]{3}$'), CHECK (target_currency <> source_currency), FOREIGN KEY to currencies.currency_code

**Error Codes**:
- VAL-EXRATE-002A: "Target currency is required"
- VAL-EXRATE-002B: "Target currency must be exactly 3 uppercase letters"
- VAL-EXRATE-002C: "Target currency '{code}' is not a valid ISO 4217 code or not active"
- VAL-EXRATE-002D: "Target currency cannot be the same as source currency"

**User Action**: User must select different target currency from source currency.

**Test Cases**:
- ✅ Valid: Source "USD", Target "EUR" (different)
- ✅ Valid: Source "GBP", Target "JPY" (different)
- ❌ Invalid: Source "USD", Target "USD" (same)
- ❌ Invalid: Source "USD", Target "" (empty)

---

### VAL-EXRATE-003: exchange_rate - Decimal Precision Validation

**Field**: `exchange_rate`
**Database Column**: `exchange_rates.exchange_rate`
**Data Type**: NUMERIC(18,6) / Decimal

**Validation Rule**: Exchange rate must be positive number with maximum 6 decimal places for high precision.

**Precision Requirements**:
- Decimal places: Maximum 6 decimals (e.g., 1.275000)
- Minimum value: 0.000001 (prevents division by zero and unrealistic rates)
- Maximum value: 10,000 (prevents data entry errors like 100000 instead of 1.00000)
- Use Decimal.js for calculations to avoid floating point errors

**Implementation Requirements**:
- **Client-Side**: Number input with 6 decimal places, real-time precision validation, thousand separators for readability
- **Server-Side**: Validate using Decimal.js, check decimal places <= 6, verify bounds
- **Database**: NUMERIC(18,6) NOT NULL, CHECK (exchange_rate BETWEEN 0.000001 AND 10000)

**Error Codes**:
- VAL-EXRATE-003A: "Exchange rate is required"
- VAL-EXRATE-003B: "Exchange rate must be a positive number greater than zero"
- VAL-EXRATE-003C: "Exchange rate must have at most 6 decimal places"
- VAL-EXRATE-003D: "Exchange rate must be between 0.000001 and 10,000"

**User Action**: User must enter valid exchange rate within bounds with proper precision.

**Rationale**: 6 decimal places provides sufficient precision for accurate large-value conversions. For example, converting $1,000,000 USD at rate 0.921456 EUR/USD = €921,456.00, precision critical.

**Test Cases**:
- ✅ Valid: 1.275000 (6 decimals, typical GBP/USD)
- ✅ Valid: 0.921456 (6 decimals, typical USD/EUR)
- ✅ Valid: 149.234500 (typical USD/JPY)
- ✅ Valid: 0.000001 (boundary minimum)
- ✅ Valid: 10000 (boundary maximum)
- ❌ Invalid: 0 (zero not allowed)
- ❌ Invalid: -1.2750 (negative not allowed)
- ❌ Invalid: 1.2750001 (7 decimals, too many)
- ❌ Invalid: 0.0000001 (below minimum, essentially zero)
- ❌ Invalid: 15000 (above maximum, likely data entry error)

---

### VAL-EXRATE-004: inverse_rate - Automatic Calculation Validation

**Field**: `inverse_rate`
**Database Column**: `exchange_rates.inverse_rate`
**Data Type**: NUMERIC(18,6) / Decimal

**Validation Rule**: Inverse rate must equal 1 divided by exchange_rate within acceptable rounding tolerance.

**Mathematical Formula**: `inverse_rate = 1 / exchange_rate`

**Tolerance**: ±0.000001 (±0.0001%) to account for rounding in 6 decimal precision

**Implementation Requirements**:
- **Client-Side**: Auto-calculated and displayed as read-only, updated when exchange_rate changes
- **Server-Side**: Recalculate using Decimal.js, verify match within tolerance, reject if difference > 0.000001
- **Database**: NUMERIC(18,6) NOT NULL, CHECK (ABS(inverse_rate - (1.0 / exchange_rate)) < 0.000001)

**Error Code**: VAL-EXRATE-004
**Error Message**: "Inverse rate calculation mismatch. Expected: {expected}, Provided: {provided}, Difference: {diff}. Inverse rate must equal 1 / exchange rate."

**User Action**: System auto-corrects calculation. User cannot manually enter inverse rate.

**Calculation Example**:
```
Exchange Rate: 1.275000 USD/GBP (1 GBP = 1.275000 USD)
Inverse Rate: 1 / 1.275000 = 0.784314 GBP/USD (1 USD = 0.784314 GBP)
Tolerance: ±0.000001
Valid Inverse Range: 0.784313 to 0.784315
```

**Test Cases**:
- ✅ Valid: Rate 1.275000, Inverse 0.784314 (exact match)
- ✅ Valid: Rate 1.275000, Inverse 0.784315 (within tolerance)
- ❌ Invalid: Rate 1.275000, Inverse 0.790000 (difference exceeds tolerance)

---

### VAL-EXRATE-005: rate_type - Enum Validation

**Field**: `rate_type`
**Database Column**: `exchange_rates.rate_type`
**Data Type**: VARCHAR(20) / string

**Validation Rule**: Rate type must be one of the allowed values: 'spot', 'forward', 'average', 'month_end', 'year_end'.

**Rate Type Definitions**:
- **spot**: Current market rate for immediate settlement (T+2 business days)
- **forward**: Agreed rate for future settlement (hedging contracts)
- **average**: Average of multiple rates over a period (e.g., monthly average for income statement translation)
- **month_end**: Official rate at end of month (for month-end revaluation)
- **year_end**: Official rate at end of fiscal year (for year-end financial statements)

**Implementation Requirements**:
- **Client-Side**: Radio buttons or dropdown with only allowed values
- **Server-Side**: Validate against enum list
- **Database**: VARCHAR(20) NOT NULL, CHECK (rate_type IN ('spot', 'forward', 'average', 'month_end', 'year_end'))

**Error Codes**:
- VAL-EXRATE-005A: "Rate type is required"
- VAL-EXRATE-005B: "Rate type must be one of: spot, forward, average, month_end, year_end"

**User Action**: User must select from provided rate type options.

**Test Cases**:
- ✅ Valid: "spot"
- ✅ Valid: "forward"
- ✅ Valid: "month_end"
- ❌ Invalid: "" (empty)
- ❌ Invalid: "daily" (not in enum)
- ❌ Invalid: "SPOT" (case sensitive)

---

### VAL-EXRATE-006: effective_date - Date Range Validation

**Field**: `effective_date`
**Database Column**: `exchange_rates.effective_date`
**Data Type**: TIMESTAMPTZ / DateTime

**Validation Rule**: Effective date must not be more than 365 days in future (forward contracts), and not more than 10 years in past (historical data limit).

**Implementation Requirements**:
- **Client-Side**: DateTime picker with min/max constraints
- **Server-Side**: Validate date range
- **Database**: TIMESTAMPTZ NOT NULL, CHECK constraints

**Error Codes**:
- VAL-EXRATE-006A: "Effective date is required"
- VAL-EXRATE-006B: "Effective date cannot be more than 365 days in the future"
- VAL-EXRATE-006C: "Effective date cannot be more than 10 years in the past"

**User Action**: User must select date within allowed range.

**Rationale**: Forward rates beyond 1 year are rare in standard business operations. Historical rates beyond 10 years unlikely to be needed and may indicate data entry error.

**Test Cases**:
- ✅ Valid: Today
- ✅ Valid: 30 days from now (forward rate)
- ✅ Valid: 180 days from now (6-month forward)
- ✅ Valid: 5 years ago (historical data)
- ❌ Invalid: 366 days from now (too far future)
- ❌ Invalid: 11 years ago (too far past)

---

### VAL-EXRATE-007: effective_until - Conditional Date Validation

**Field**: `effective_until`
**Database Column**: `exchange_rates.effective_until`
**Data Type**: TIMESTAMPTZ / DateTime

**Validation Rule**: Effective until date is required when rate_type = 'forward', must be NULL for other rate types, and must be > effective_date.

**Implementation Requirements**:
- **Client-Side**: Show effective_until field only when rate_type = 'forward', validate > effective_date
- **Server-Side**: Validate conditional presence based on rate_type, date comparison
- **Database**: TIMESTAMPTZ, CHECK ((rate_type = 'forward' AND effective_until IS NOT NULL) OR (rate_type <> 'forward' AND effective_until IS NULL)), CHECK (effective_until > effective_date OR effective_until IS NULL)

**Error Codes**:
- VAL-EXRATE-007A: "Effective until date required when rate type is 'forward'"
- VAL-EXRATE-007B: "Effective until date should be NULL for non-forward rates"
- VAL-EXRATE-007C: "Effective until date must be after effective date"

**User Action**: User must provide expiry date for forward contracts and leave empty for other rate types.

**Test Cases**:
- ✅ Valid: Rate type 'forward', Effective 2025-01-13, Until 2025-04-13 (90-day forward)
- ✅ Valid: Rate type 'spot', Effective 2025-01-13, Until NULL
- ❌ Invalid: Rate type 'forward', Effective 2025-01-13, Until NULL (missing expiry)
- ❌ Invalid: Rate type 'spot', Effective 2025-01-13, Until 2025-04-13 (shouldn't have expiry)
- ❌ Invalid: Rate type 'forward', Effective 2025-01-13, Until 2025-01-10 (expiry before effective)

---

### VAL-EXRATE-008: buy_rate - Optional Decimal Validation

**Field**: `buy_rate`
**Database Column**: `exchange_rates.buy_rate`
**Data Type**: NUMERIC(18,6) / Decimal

**Validation Rule**: Buy rate is optional. If provided, must be positive with max 6 decimal places, and must be less than or equal to sell_rate (if sell_rate also provided).

**Implementation Requirements**:
- **Client-Side**: Optional number input, 6 decimal places, auto-calculate mid_rate if buy and sell provided
- **Server-Side**: Validate precision and bounds if provided, compare to sell_rate
- **Database**: NUMERIC(18,6), CHECK (buy_rate > 0 OR buy_rate IS NULL), CHECK (buy_rate <= sell_rate OR buy_rate IS NULL OR sell_rate IS NULL)

**Error Codes**:
- VAL-EXRATE-008A: "Buy rate must be a positive number if provided"
- VAL-EXRATE-008B: "Buy rate must have at most 6 decimal places"
- VAL-EXRATE-008C: "Buy rate must be less than or equal to sell rate"

**User Action**: User may optionally enter buy rate, typically for treasury and bank rates.

**Rationale**: Buy rate represents the rate at which you buy foreign currency (sell base currency), typically lower than sell rate due to spread.

**Test Cases**:
- ✅ Valid: NULL (optional)
- ✅ Valid: 1.274000 (buy) with sell 1.276000 (buy < sell)
- ✅ Valid: 1.275000 (buy = sell, zero spread)
- ❌ Invalid: 1.277000 (buy) with sell 1.276000 (buy > sell, invalid spread)
- ❌ Invalid: 0 (zero not allowed)
- ❌ Invalid: -1.275 (negative not allowed)

---

### VAL-EXRATE-009: sell_rate - Optional Decimal Validation

**Field**: `sell_rate`
**Database Column**: `exchange_rates.sell_rate`
**Data Type**: NUMERIC(18,6) / Decimal

**Validation Rule**: Sell rate is optional. If provided, must be positive with max 6 decimal places, and must be greater than or equal to buy_rate (if buy_rate also provided).

**Implementation Requirements**:
- **Client-Side**: Optional number input, 6 decimal places, auto-calculate mid_rate if buy and sell provided
- **Server-Side**: Validate precision and bounds if provided, compare to buy_rate
- **Database**: NUMERIC(18,6), CHECK (sell_rate > 0 OR sell_rate IS NULL), CHECK (sell_rate >= buy_rate OR sell_rate IS NULL OR buy_rate IS NULL)

**Error Codes**:
- VAL-EXRATE-009A: "Sell rate must be a positive number if provided"
- VAL-EXRATE-009B: "Sell rate must have at most 6 decimal places"
- VAL-EXRATE-009C: "Sell rate must be greater than or equal to buy rate"

**User Action**: User may optionally enter sell rate, typically for treasury and bank rates.

**Rationale**: Sell rate represents the rate at which you sell foreign currency (buy base currency), typically higher than buy rate due to spread.

**Test Cases**:
- ✅ Valid: NULL (optional)
- ✅ Valid: 1.276000 (sell) with buy 1.274000 (sell > buy)
- ✅ Valid: 1.275000 (sell = buy, zero spread)
- ❌ Invalid: 1.273000 (sell) with buy 1.274000 (sell < buy, invalid spread)

---

### VAL-EXRATE-010: spread_percentage - Calculated Validation

**Field**: `spread_percentage`
**Database Column**: `exchange_rates.spread_percentage`
**Data Type**: NUMERIC(5,2) / Decimal

**Validation Rule**: Spread percentage is auto-calculated when buy and sell rates provided. Formula: ((sell_rate - buy_rate) / buy_rate) × 100%

**Implementation Requirements**:
- **Client-Side**: Auto-calculated and displayed as read-only percentage
- **Server-Side**: Calculate using Decimal.js if buy and sell rates present
- **Database**: NUMERIC(5,2), auto-calculated or NULL

**Error Code**: VAL-EXRATE-010
**Error Message**: "Spread percentage calculation mismatch. Expected: {expected}%, Provided: {provided}%"

**Spread Calculation Example**:
```
Buy Rate: 1.274000 USD/GBP
Sell Rate: 1.276000 USD/GBP
Spread: (1.276000 - 1.274000) / 1.274000 × 100% = 0.16%
```

**Typical Spreads**:
- Major currency pairs (USD/EUR, USD/GBP): 0.05% - 0.20%
- Exotic pairs: 0.50% - 2.00%
- Forward contracts: 0.10% - 0.50%

**Test Cases**:
- ✅ Valid: Buy 1.274000, Sell 1.276000, Spread 0.16%
- ✅ Valid: Buy NULL, Sell NULL, Spread NULL
- ❌ Invalid: Buy 1.274000, Sell 1.276000, Spread 1.50% (calculation error)

---

### VAL-EXRATE-011: rate_source - Required String Validation

**Field**: `rate_source`
**Database Column**: `exchange_rates.rate_source`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: Rate source is required for all rates. Must be 3-100 characters describing source (manual entry, API provider name, bank name, etc.).

**Common Values**:
- "Manual Entry"
- "Bloomberg API"
- "OpenExchangeRates API"
- "European Central Bank"
- "Bank of England"
- "Citibank Quote"
- "Forward Contract FWD-2501-001234"

**Implementation Requirements**:
- **Client-Side**: Text input or dropdown with common sources, required field
- **Server-Side**: Validate length 3-100 characters
- **Database**: VARCHAR(100) NOT NULL, CHECK (LENGTH(rate_source) >= 3)

**Error Codes**:
- VAL-EXRATE-011A: "Rate source is required"
- VAL-EXRATE-011B: "Rate source must be between 3 and 100 characters"

**User Action**: User must specify where rate came from for audit trail.

**Test Cases**:
- ✅ Valid: "Bloomberg API"
- ✅ Valid: "Manual Entry - Bank Quote"
- ❌ Invalid: "" (empty)
- ❌ Invalid: "BL" (too short, < 3 characters)

---

### VAL-EXRATE-012: approval_status - Enum Validation

**Field**: `approval_status`
**Database Column**: `exchange_rates.approval_status`
**Data Type**: VARCHAR(20) / string

**Validation Rule**: Approval status must be one of: 'pending', 'approved', 'rejected'.

**Status Definitions**:
- **pending**: Awaiting approval (manual entries with variance > threshold)
- **approved**: Approved by authorized user, rate can be used
- **rejected**: Rejected by approver, rate cannot be used

**Implementation Requirements**:
- **Client-Side**: Display only, user cannot manually set (workflow controlled)
- **Server-Side**: Validate against enum, enforce workflow transitions
- **Database**: VARCHAR(20) NOT NULL DEFAULT 'pending', CHECK (approval_status IN ('pending', 'approved', 'rejected'))

**Error Code**: VAL-EXRATE-012
**Error Message**: "Approval status must be one of: pending, approved, rejected"

**Workflow Transitions**:
- pending → approved (by approver)
- pending → rejected (by approver)
- approved → (no transitions, immutable once approved)
- rejected → pending (resubmission with corrections)

**Test Cases**:
- ✅ Valid: "pending" (default)
- ✅ Valid: "approved"
- ❌ Invalid: "accepted" (not in enum)
- ❌ Invalid: "" (empty)

---

### VAL-EXRATE-013: is_active - Boolean Validation

**Field**: `is_active`
**Database Column**: `exchange_rates.is_active`
**Data Type**: BOOLEAN / boolean

**Validation Rule**: Only one active rate per currency pair per rate type at any time. New active rate supersedes previous active rate for same pair and type.

**Implementation Requirements**:
- **Client-Side**: Display as status badge, not editable by user
- **Server-Side**: On new rate activation, set previous rate is_active = false (superseded)
- **Database**: BOOLEAN NOT NULL DEFAULT false, UNIQUE partial index WHERE is_active = true grouped by (source_currency, target_currency, rate_type)

**Error Code**: VAL-EXRATE-013
**Error Message**: "Only one active {rate_type} rate allowed per currency pair. Current active rate will be superseded."

**User Action**: System automatically handles activation. Previous rate becomes historical.

**Test Cases**:
- ✅ Valid: First rate for USD/EUR spot = active
- ✅ Valid: New USD/EUR spot rate → previous becomes inactive, new becomes active
- ✅ Valid: USD/EUR spot active + USD/EUR forward active (different rate types)
- ❌ Invalid: Two active spot rates for same currency pair

---

### VAL-EXRATE-014: confidence_level - Range Validation

**Field**: `confidence_level`
**Database Column**: `exchange_rates.confidence_level`
**Data Type**: INTEGER / number

**Validation Rule**: Confidence level must be between 0 and 100 representing rate reliability percentage.

**Confidence Scoring**:
- 95-100: Official central bank rates, verified bank quotes
- 80-94: Reputable API providers (Bloomberg, Reuters)
- 60-79: Secondary providers, calculated cross rates
- 40-59: Estimated rates, triangulated with old data
- 0-39: Low confidence, flagged for review

**Implementation Requirements**:
- **Client-Side**: Number input with range 0-100, slider UI optional
- **Server-Side**: Validate range, auto-assign based on source
- **Database**: INTEGER, CHECK (confidence_level BETWEEN 0 AND 100 OR confidence_level IS NULL)

**Error Code**: VAL-EXRATE-014
**Error Message**: "Confidence level must be between 0 and 100"

**User Action**: System auto-assigns confidence based on source. Manual override requires Treasury Manager approval.

**Test Cases**:
- ✅ Valid: 95 (high confidence)
- ✅ Valid: 50 (medium confidence)
- ✅ Valid: NULL (not assessed)
- ❌ Invalid: 101 (above maximum)
- ❌ Invalid: -1 (negative)

---

## 3. Business Rule Validations (VAL-EXRATE-101 to 199)

### VAL-EXRATE-101: Exchange Rate Positivity

**Validation Rule**: Exchange rates must always be positive non-zero values. Zero or negative rates are mathematically invalid.

**Mathematical Rationale**: Exchange rate represents ratio of currency values. Ratio cannot be zero (division by zero) or negative (currencies have positive value).

**Implementation Requirements**:
- **Client-Side**: Number input min=0.000001, prevent zero/negative entry
- **Server-Side**: Validate rate > 0
- **Database**: CHECK (exchange_rate > 0)

**Error Code**: VAL-EXRATE-101
**Error Message**: "Exchange rate must be a positive number greater than zero. Zero or negative rates are invalid."

**User Action**: User must enter positive rate value. If rate genuinely zero/negative, indicates currency collapse (hyperinflation scenario) - requires CFO approval and special handling.

**Exception Handling**: In extreme cases (currency collapse, hyperinflation), very small rates approaching zero must be flagged for CFO review and documented with extraordinary justification.

**Test Cases**:
- ✅ Valid: 1.275000 (positive)
- ✅ Valid: 0.000001 (very small but positive)
- ❌ Invalid: 0 (zero)
- ❌ Invalid: -1.275 (negative)

---

### VAL-EXRATE-102: Inverse Rate Mathematical Consistency

**Validation Rule**: Inverse rate must equal 1 / exchange_rate within tolerance of ±0.000001. Mathematical relationship enforced.

**Formula**: `inverse_rate = 1 / exchange_rate`

**Tolerance**: ±0.000001 (0.0001%) to account for rounding in 6 decimal precision

**Implementation Requirements**:
- **Client-Side**: Auto-calculate, display as read-only
- **Server-Side**: Recalculate using Decimal.js, verify within tolerance
- **Database**: CHECK (ABS(inverse_rate - (1.0 / exchange_rate)) < 0.000001)

**Error Code**: VAL-EXRATE-102
**Error Message**: "Inverse rate calculation error. Expected: {expected}, Actual: {actual}, Difference: {diff}. Inverse must equal 1 / rate."

**User Action**: System auto-corrects. If validation fails, indicates calculation bug - contact administrator.

**Calculation Example**:
```
Exchange Rate: 1.275000 USD/GBP
Inverse Rate Calculation: 1 / 1.275000 = 0.784314 GBP/USD
Tolerance Check: |0.784314 - 0.784314| < 0.000001 ✓
```

**Test Cases**:
- ✅ Valid: Rate 1.275000, Inverse 0.784314 (exact)
- ✅ Valid: Rate 1.275000, Inverse 0.784315 (within tolerance)
- ❌ Invalid: Rate 1.275000, Inverse 0.790000 (exceeds tolerance)

---

### VAL-EXRATE-103: Currency Self-Reference Prevention

**Validation Rule**: Source currency must differ from target currency. A currency cannot have an exchange rate to itself.

**Mathematical Rationale**: Exchange rate of currency to itself is always 1.000000 by definition. No need to store.

**Implementation Requirements**:
- **Client-Side**: Filter target currency dropdown to exclude source currency
- **Server-Side**: Validate source_currency ≠ target_currency
- **Database**: CHECK (source_currency <> target_currency)

**Error Code**: VAL-EXRATE-103
**Error Message**: "Source and target currencies must be different. A currency cannot have an exchange rate to itself (always 1.0 by definition)."

**User Action**: User must select different target currency.

**Test Cases**:
- ✅ Valid: Source USD, Target EUR (different)
- ✅ Valid: Source GBP, Target JPY (different)
- ❌ Invalid: Source USD, Target USD (same)
- ❌ Invalid: Source EUR, Target EUR (same)

---

### VAL-EXRATE-104: Single Active Rate Per Pair

**Validation Rule**: Only one active spot rate can exist per currency pair at any given time. New rate supersedes previous rate.

**Supersession Logic**:
1. User creates new rate for existing currency pair
2. System validates new rate
3. Upon approval/activation, previous active rate marked is_active = false, superseded_date = now()
4. New rate marked is_active = true
5. Historical rate preserved for audit and transaction lookups

**Implementation Requirements**:
- **Client-Side**: Display warning if active rate exists for pair
- **Server-Side**: On rate activation, query for existing active rate, update to inactive
- **Database**: UNIQUE partial index WHERE is_active = true GROUP BY (source_currency, target_currency, rate_type)

**Error Code**: VAL-EXRATE-104
**Error Message**: "Active {rate_type} rate already exists for {source}/{target} (Rate: {existing_rate}, Date: {date}). New rate will supersede existing rate."

**User Action**: User confirms supersession. Previous rate automatically moved to historical.

**Exception**: Forward rates and period-end rates can coexist with spot rates (different rate_type).

**Test Cases**:
- ✅ Valid: First USD/EUR spot rate (no existing)
- ✅ Valid: New USD/EUR spot supersedes old spot (automatic)
- ✅ Valid: USD/EUR spot + USD/EUR forward both active (different types)
- ❌ Invalid: Two active USD/EUR spot rates (system prevents)

---

### VAL-EXRATE-105: Exchange Rate Precision Requirement

**Validation Rule**: Exchange rates must be stored with minimum 6 decimal place precision to ensure accurate large-value conversions.

**Precision Rationale**:
- Large transactions ($1,000,000+) require high precision
- 4 decimal precision: $1,000,000 × 0.0001 = $100 error potential
- 6 decimal precision: $1,000,000 × 0.000001 = $1 error potential

**Implementation Requirements**:
- **Client-Side**: Number input accepts up to 6 decimals
- **Server-Side**: Store full precision using Decimal.js
- **Database**: NUMERIC(18,6) data type

**Error Code**: VAL-EXRATE-105
**Error Message**: "Exchange rate precision insufficient. Minimum 6 decimal places required for accurate conversions."

**Precision Example**:
```
Transaction: $1,000,000 USD
Rate (4 decimals): 0.9215 EUR/USD
Converted: €921,500.00

Rate (6 decimals): 0.921456 EUR/USD
Converted: €921,456.00

Difference: €44.00 (significant for large transactions)
```

**Test Cases**:
- ✅ Valid: 1.275000 (6 decimals)
- ✅ Valid: 0.921456 (6 decimals)
- ❌ Invalid: 1.27 (2 decimals, truncated precision loss)

---

### VAL-EXRATE-106: Automated Update Suspension During Critical Periods

**Validation Rule**: Automated exchange rate updates must not occur during critical financial periods (month-end close, year-end close, audit periods) without explicit authorization.

**Critical Periods**:
- Month-end close: Last 2 business days of month
- Quarter-end close: Last 3 business days of quarter
- Year-end close: Last 5 business days of fiscal year
- External audit periods: Dates configured by Finance Controller

**Implementation Requirements**:
- **Client-Side**: Display suspension status, manual entry still allowed
- **Server-Side**: Check suspension calendar before automated update, skip if suspended
- **Database**: Rate update suspension configuration table

**Error Code**: VAL-EXRATE-106
**Error Message**: "Automated rate updates suspended during {period} close. Manual rate entry available with Treasury Manager approval."

**User Action**: Manual rate entry allowed with mandatory approval workflow during suspension.

**Rationale**: Prevents unintended rate changes during revaluation and financial statement preparation.

**Test Cases**:
- ✅ Valid: Automated update on Jan 15 (mid-month)
- ❌ Suspended: Automated update on Jan 30 (month-end close)
- ✅ Override: Manual entry on Jan 30 with approval

---

### VAL-EXRATE-107: Effective Date Immediate Activation

**Validation Rule**: Exchange rates become effective immediately upon approval unless future effective date specified. Backdated rates require CFO approval.

**Activation Logic**:
- effective_date <= current_date + current_time: Immediate activation
- effective_date > current_date: Scheduled activation (forward rates)
- effective_date < current_date - 1 day: Backdated, requires CFO approval

**Implementation Requirements**:
- **Client-Side**: Default effective_date = now(), display warning if backdated
- **Server-Side**: Check effective_date vs current timestamp, route for approval if backdated
- **Database**: Scheduled job activates future-dated rates at effective timestamp

**Error Codes**:
- VAL-EXRATE-107A: "Rate will activate immediately upon approval (effective date is now)"
- VAL-EXRATE-107B: "Rate scheduled for future activation on {date}"
- VAL-EXRATE-107C: "Backdated rate requires CFO approval due to impact on historical transactions"

**User Action**: For backdated rates, user must provide justification and await CFO approval.

**Test Cases**:
- ✅ Valid: Effective date = now (immediate)
- ✅ Valid: Effective date = 30 days future (forward rate)
- ⚠️ Approval: Effective date = yesterday (backdated)

---

### VAL-EXRATE-108: Update Failure Retry Logic

**Validation Rule**: Rate update failures must trigger retry logic with exponential backoff. After 3 failed attempts, alert Finance Manager and Treasury Manager.

**Retry Schedule**:
1. 1st failure: Retry after 1 minute
2. 2nd failure: Retry after 5 minutes
3. 3rd failure: Retry after 15 minutes
4. 3 failures total: Alert users, log error, manual intervention required

**Implementation Requirements**:
- **Server-Side**: Retry logic with exponential backoff, failure counter, alert mechanism
- **Database**: Update failure_count, last_failure_date in rate_update_log

**Error Code**: VAL-EXRATE-108
**Error Message**: "Rate update failed 3 times. Provider: {provider}, Error: {error}. Manual intervention required. Finance Manager and Treasury Manager notified."

**User Action**: Finance Manager investigates provider issue, verifies API credentials, considers fallback provider or manual rate entry.

**Retry Example**:
```
10:00:00 - Update fails (network timeout)
10:01:00 - Retry 1 fails (API error 503)
10:06:00 - Retry 2 fails (API error 503)
10:21:00 - Retry 3 fails (API error 503)
10:21:01 - Alert sent to Finance Manager
```

**Test Cases**:
- ✅ Valid: 1st attempt succeeds
- ✅ Valid: 2nd retry succeeds
- ⚠️ Alert: 3rd retry fails (manual intervention)

---

### VAL-EXRATE-109: Stale Rate Warning

**Validation Rule**: Exchange rates older than 24 hours must trigger visual warnings on all transaction screens. Rates older than 48 hours flag for urgent update.

**Staleness Thresholds**:
- <24 hours: Green indicator, no warning
- 24-48 hours: Yellow indicator, warning displayed
- >48 hours: Red indicator, urgent warning, Finance team notified daily

**Warning Message**: "Exchange rate is {hours} hours old. Last updated: {timestamp}. Current market rate may differ. Proceed with caution."

**Implementation Requirements**:
- **Client-Side**: Display rate age, color-coded indicator, warning tooltip
- **Server-Side**: Calculate age on each rate query, return staleness flag
- **Database**: Indexed query on effective_date for performance

**Error Codes**:
- VAL-EXRATE-109A (Warning): "Rate is {hours} hours old - moderately stale"
- VAL-EXRATE-109B (Urgent): "Rate is {hours} hours old - critically stale, update required"

**User Action**: User can proceed with transaction (acknowledged stale rate) or wait for rate update.

**Staleness Calculation**:
```
Current Time: 2025-01-13 14:00:00
Rate Effective: 2025-01-12 10:00:00
Age: 28 hours
Status: Yellow (24-48 hours) - Warning
```

**Test Cases**:
- ✅ Green: Rate 12 hours old
- ⚠️ Yellow: Rate 36 hours old
- 🚨 Red: Rate 60 hours old

---

### VAL-EXRATE-110: Manual Rate Variance Approval Workflow

**Validation Rule**: Manual rate variance exceeding 5% from last active rate must route through approval workflow. Variance 5-10% requires Finance Manager, 10-25% requires Finance Controller, >25% requires CFO approval.

**Variance Calculation**: `|new_rate - previous_rate| / previous_rate × 100%`

**Approval Thresholds**:
- 0-5%: Auto-approve (if user has permission)
- 5-10%: Finance Manager approval required
- 10-25%: Finance Controller approval required
- >25%: CFO approval required with supporting documentation

**Implementation Requirements**:
- **Client-Side**: Display variance percentage, show approval requirement
- **Server-Side**: Calculate variance, route to appropriate approver based on threshold
- **Database**: Store variance_from_previous, approval_status = 'pending'

**Error Codes**:
- VAL-EXRATE-110A (Info): "Rate variance {pct}% within auto-approve threshold"
- VAL-EXRATE-110B (Approval): "Rate variance {pct}% requires {role} approval"
- VAL-EXRATE-110C (Alert): "High variance {pct}% detected. CFO approval required. Controller notified."

**User Action**: User submits rate with justification. Approver reviews and approves/rejects.

**Variance Example**:
```
Previous Rate: 1.2750 USD/GBP
New Rate: 1.3500 USD/GBP
Variance: |1.3500 - 1.2750| / 1.2750 × 100% = 5.88%
Approval: Finance Manager required (5-10% threshold)
```

**Test Cases**:
- ✅ Auto-approve: Variance 2.5% (below 5%)
- ⚠️ Manager: Variance 7.2% (5-10%)
- ⚠️ Controller: Variance 15.8% (10-25%)
- 🚨 CFO: Variance 28.4% (above 25%)

---

### VAL-EXRATE-111: Forward Rate Contract Reference

**Validation Rule**: Forward exchange rates must have future effective date and mandatory contract reference number.

**Contract Reference Format**: {Contract Type}-{Year}-{Sequence} (e.g., FWD-2501-001234)

**Implementation Requirements**:
- **Client-Side**: When rate_type = 'forward', require effective_until date and contract reference
- **Server-Side**: Validate presence of both fields for forward rates
- **Database**: CHECK ((rate_type = 'forward' AND contract_reference IS NOT NULL AND effective_until IS NOT NULL) OR (rate_type <> 'forward'))

**Error Codes**:
- VAL-EXRATE-111A: "Forward rate requires future effective date and expiry date"
- VAL-EXRATE-111B: "Forward rate requires contract reference number (e.g., FWD-2501-001234)"

**User Action**: User must provide forward contract details or change rate_type to 'spot'.

**Forward Rate Example**:
```
Rate Type: forward
Effective Date: 2025-01-13 (contract date)
Effective Until: 2025-04-13 (90-day forward)
Exchange Rate: 1.2650 USD/GBP (agreed forward rate)
Contract Reference: FWD-2501-001234
Bank: Citibank
```

**Test Cases**:
- ✅ Valid: Rate type 'forward' with contract ref and expiry
- ❌ Invalid: Rate type 'forward' without contract reference
- ❌ Invalid: Rate type 'forward' without expiry date

---

### VAL-EXRATE-112: Period-End Rate Immutability

**Validation Rule**: Period-end rates (month_end, year_end) cannot be modified after period close. Corrections require formal correction process.

**Period Status Check**:
- Period status = 'Open': Rate can be modified
- Period status = 'Closed': Rate immutable
- Period status = 'Locked': Rate immutable, audit in progress

**Correction Process**:
1. Identify incorrect period-end rate
2. Finance Manager creates correction request
3. Document reason and supporting evidence
4. CFO approves correction
5. New rate created with correction_of_rate_id reference
6. Original rate flagged as corrected (not deleted)
7. Audit trail updated

**Implementation Requirements**:
- **Client-Side**: Disable edit/delete for period-end rates in closed periods
- **Server-Side**: Check period status before allowing modification
- **Database**: Trigger prevents UPDATE/DELETE when period closed

**Error Code**: VAL-EXRATE-112
**Error Message**: "Period-end rate for {period} cannot be modified - period is {status}. Use formal correction process for rate errors."

**User Action**: User must submit correction request through CFO approval workflow.

**Test Cases**:
- ✅ Valid: Edit month-end rate for open period
- ❌ Invalid: Edit month-end rate for closed period
- ✅ Override: Correction with CFO approval for closed period

---

### VAL-EXRATE-113: Triangulation Consistency Validation

**Validation Rule**: Exchange rate triangulation must pass consistency validation. Triangulated rate must match direct rate within ±0.5% tolerance.

**Triangulation Formula**:
```
If GBP→USD = 1.27 and USD→JPY = 149.23
Then GBP→JPY should = 1.27 × 149.23 = 189.46
```

**Tolerance**: ±0.5% due to bid/ask spreads and timing differences between rate sources

**Implementation Requirements**:
- **Server-Side**: Calculate triangulated rate via base currency, compare to direct rate if exists
- **Database**: Store triangulation_consistency_check result

**Error Code**: VAL-EXRATE-113
**Error Message**: "Triangulation inconsistency detected. Direct rate {direct}: {direct_rate}, Triangulated rate: {triangulated_rate}, Difference: {diff}%. Review rates for {source}/{target}."

**User Action**: Finance Manager reviews rates, identifies which rate is incorrect, submits correction.

**Triangulation Example**:
```
Direct Rate: GBP→JPY = 190.00
Triangulated: GBP→USD (1.27) × USD→JPY (149.23) = 189.46
Difference: |190.00 - 189.46| / 190.00 × 100% = 0.28%
Status: ✅ Within 0.5% tolerance (consistent)
```

**Test Cases**:
- ✅ Valid: Direct 190.00, Triangulated 189.46, Diff 0.28%
- ⚠️ Warning: Direct 190.00, Triangulated 188.00, Diff 1.05%
- ❌ Error: Direct 190.00, Triangulated 180.00, Diff 5.26%

---

### VAL-EXRATE-114: Bulk Import Atomic Transaction

**Validation Rule**: Bulk rate import must validate all rates before committing any to database. All-or-nothing transaction ensures data consistency.

**Validation Steps**:
1. Parse import file (CSV, Excel)
2. Validate each row: currency codes, rate values, dates, required fields
3. Check for duplicates within import
4. If ANY validation fails: Reject entire import, generate error report
5. If ALL validations pass: Commit all rates in single transaction

**Implementation Requirements**:
- **Server-Side**: Transaction wrapper, row-by-row validation, rollback on any error
- **Database**: BEGIN TRANSACTION, validate all, COMMIT or ROLLBACK

**Error Code**: VAL-EXRATE-114
**Error Message**: "Bulk import failed. {error_count} validation errors found. No rates imported. Review error report and correct data."

**Error Report Format**:
```csv
Row,Currency Pair,Field,Error
3,USD/EUR,exchange_rate,"Rate 0.9215 has only 4 decimals, need 6"
5,GBP/JPY,target_currency,"JPY not active in system"
8,USD/GBP,exchange_rate,"Rate -1.2750 is negative (invalid)"
```

**User Action**: User corrects errors in import file and resubmits. Partial imports not allowed.

**Test Cases**:
- ✅ Valid: 100 rows, all valid, all imported
- ❌ Invalid: 100 rows, 3 errors, zero imported (rollback)

---

### VAL-EXRATE-115: Currency Conversion Transaction Date Rate

**Validation Rule**: Currency conversion must use exchange rate effective as of transaction date, not current rate.

**Rate Selection Logic**:
1. Transaction date = today: Use current active rate
2. Transaction date = historical: Use rate effective on or before that date
3. Transaction date = future: Use current rate (provisional, flagged)
4. No rate found for date: Use nearest previous rate with warning

**Implementation Requirements**:
- **Server-Side**: Query rates with effective_date <= transaction_date, order by effective_date DESC, limit 1
- **Database**: Index on (source_currency, target_currency, effective_date)

**Error Codes**:
- VAL-EXRATE-115A (Info): "Using current rate for today's transaction"
- VAL-EXRATE-115B (Warning): "Using historical rate from {date} for transaction dated {transaction_date}"
- VAL-EXRATE-115C (Error): "No exchange rate found for {currency_pair} on or before {date}"

**User Action**: If no rate found, user must manually enter rate for that date or use nearest rate with justification.

**Rate Selection Example**:
```
Transaction Date: 2025-01-10
Available Rates:
  - 2025-01-08: 1.2700 USD/GBP (spot)
  - 2025-01-10: 1.2750 USD/GBP (spot)
  - 2025-01-12: 1.2800 USD/GBP (spot)

Selected Rate: 1.2750 (exact date match)

Transaction Date: 2025-01-09
Selected Rate: 1.2700 (nearest previous, 2025-01-08)
```

**Test Cases**:
- ✅ Valid: Transaction 2025-01-10, Rate 2025-01-10 (exact match)
- ✅ Valid: Transaction 2025-01-09, Rate 2025-01-08 (nearest previous)
- ❌ Error: Transaction 2025-01-05, No rate before that date

---

### VAL-EXRATE-116: Converted Amount Rounding

**Validation Rule**: Converted amounts must be rounded to target currency decimal places per ISO 4217 standard.

**Currency Decimal Places**:
- USD, EUR, GBP: 2 decimals (e.g., $1,234.56)
- JPY, KRW: 0 decimals (e.g., ¥1,235)
- BHD, KWD: 3 decimals (e.g., 1.234 BHD)

**Rounding Method**: Standard rounding (0.5 rounds up) unless currency requires cash rounding (e.g., 0.05 increments)

**Implementation Requirements**:
- **Client-Side**: Display converted amount with correct decimal places
- **Server-Side**: Query target currency minor_unit, round using Decimal.js
- **Database**: Use currency.minor_unit for rounding precision

**Error Code**: VAL-EXRATE-116
**Error Message**: "Converted amount must be rounded to {decimals} decimal places for {currency}"

**Conversion Examples**:
```
USD to EUR (2 decimals):
  $1,234.567 → €1,137.89 (rounded from €1,137.888)

USD to JPY (0 decimals):
  $1,234.56 → ¥184,184 (rounded from ¥184,184.35)

USD to BHD (3 decimals):
  $1,234.56 → 0.465 BHD (rounded from 0.4653)
```

**Test Cases**:
- ✅ Valid: €1,137.89 (2 decimals for EUR)
- ✅ Valid: ¥184,184 (0 decimals for JPY)
- ❌ Invalid: €1,137.888 (3 decimals for EUR, should be 2)

---

### VAL-EXRATE-117: Cross-Currency Triangulation

**Validation Rule**: Cross-currency conversion without direct rate must triangulate through base currency. Triangulation path documented.

**Triangulation Process**:
1. Check for direct rate (GBP→JPY)
2. If not found, triangulate via base currency (USD)
3. Path: GBP→USD→JPY
4. Calculation: Amount × Rate1 × Rate2
5. Store triangulation path in conversion metadata

**Implementation Requirements**:
- **Server-Side**: Query direct rate, fallback to triangulation, log path
- **Database**: Store conversion_path (e.g., "GBP→USD→JPY")

**Error Code**: VAL-EXRATE-117
**Error Message**: "No direct rate for {source}/{target}. Using triangulation via {base_currency}. Path: {path}."

**Triangulation Example**:
```
Convert: £1,000 GBP → JPY
Direct Rate: Not available
Triangulation:
  Step 1: GBP→USD: £1,000 × 1.2750 = $1,275.00
  Step 2: USD→JPY: $1,275.00 × 149.2345 = ¥190,274
Path: GBP→USD→JPY
```

**Test Cases**:
- ✅ Valid: Direct rate exists, use direct
- ✅ Valid: No direct rate, triangulate via USD
- ❌ Error: No direct rate, no triangulation possible (missing base rates)

---

### VAL-EXRATE-118: Exchange Gain/Loss Calculation

**Validation Rule**: Exchange gains and losses must be calculated correctly for open foreign currency balances at period end.

**Calculation Formulas**:
- **Unrealized G/L**: (Period End Rate - Original Rate) × Foreign Currency Balance
- **Realized G/L**: (Settlement Rate - Original Rate) × Foreign Currency Amount

**Sign Convention**:
- Positive = Loss (paid more base currency)
- Negative = Gain (paid less base currency)

**Implementation Requirements**:
- **Server-Side**: Calculate using Decimal.js, round to 2 decimals
- **Database**: Store calculated unrealized_gain_loss in revaluation tables

**Error Code**: VAL-EXRATE-118
**Error Message**: "Exchange gain/loss calculation error. Expected: {expected}, Calculated: {calculated}. Review rates and balances."

**Calculation Example (Unrealized)**:
```
AR Balance: £10,000 GBP
Original Rate: 1.2500 USD/GBP
Original Base Value: £10,000 × 1.2500 = $12,500

Period-End Rate: 1.2750 USD/GBP
Period-End Base Value: £10,000 × 1.2750 = $12,750

Unrealized Gain: $12,750 - $12,500 = $250
(Positive change = Gain on AR)
```

**Calculation Example (Realized)**:
```
AP Payment: £5,000 GBP
Original Rate (invoice): 1.2500 USD/GBP
Original Base Value: £5,000 × 1.2500 = $6,250

Settlement Rate (payment): 1.2750 USD/GBP
Settlement Base Value: £5,000 × 1.2750 = $6,375

Realized Loss: $6,375 - $6,250 = $125
(Paid $125 more USD = Loss)
```

**Test Cases**:
- ✅ Valid: AR £10,000, Rate 1.25→1.275, Gain $250
- ✅ Valid: AP £5,000, Rate 1.25→1.275, Loss $125
- ❌ Invalid: Calculation mismatch, manual review required

---

### VAL-EXRATE-119: Multi-Currency Consolidation Consistency

**Validation Rule**: Multi-currency consolidation must use consistent period-end rates per IAS 21 standards.

**IAS 21 Translation Rules**:
- **Balance Sheet Items**: Translated using period-end closing rate (spot rate as of balance sheet date)
- **Income Statement Items**: Translated using period-average rate or transaction date rates
- **Equity Items**: Translated using historical rate (rate on date equity transaction occurred)

**Implementation Requirements**:
- **Server-Side**: Enforce rate type based on account type (balance sheet vs income statement)
- **Database**: Account mapping to financial statement section

**Error Code**: VAL-EXRATE-119
**Error Message**: "Consolidation rate type mismatch. {account} requires {required_type} rate, but {provided_type} rate used."

**Translation Example**:
```
Balance Sheet (2025-12-31):
  Cash (Asset): Translate at 12/31 closing rate
  AR (Asset): Translate at 12/31 closing rate
  AP (Liability): Translate at 12/31 closing rate

Income Statement (2025):
  Revenue: Translate at average rate or transaction date rates
  Expenses: Translate at average rate or transaction date rates

Equity:
  Share Capital: Translate at historical rate (original issuance date)
  Retained Earnings: Balancing figure (cumulative translation adjustment)
```

**Test Cases**:
- ✅ Valid: Balance sheet account using period-end rate
- ✅ Valid: Income statement account using average rate
- ❌ Invalid: Balance sheet account using average rate (should use closing)

---

### VAL-EXRATE-120: Manual Entry Justification Requirement

**Validation Rule**: All manual exchange rate entries must include documented source and reason (minimum 10 characters).

**Required Documentation**:
- **Source**: Dropdown (Bank Quote, Broker Quote, Central Bank, Forward Contract, Customer Request, etc.)
- **Reason**: Text field (min 10 characters) explaining why manual entry needed
- **Supporting Documentation**: File upload (email, contract, quote screenshot) strongly recommended

**Implementation Requirements**:
- **Client-Side**: Text area with character count, required field
- **Server-Side**: Validate length >= 10 characters
- **Database**: TEXT NOT NULL, CHECK (LENGTH(manual_entry_reason) >= 10)

**Error Codes**:
- VAL-EXRATE-120A: "Rate source is required for manual entries"
- VAL-EXRATE-120B: "Reason for manual entry is required (minimum 10 characters)"

**User Action**: User must provide justification before submitting manual rate.

**Example Justifications**:
- "Bank quote received via email from Citibank for forward contract"
- "Central Bank published official rate, API provider down"
- "Customer requested specific rate for large contract, CFO approved"
- "Period-end rate from auditor's confirmation letter"

**Test Cases**:
- ✅ Valid: Reason "Bank quote from Citibank for forward contract FWD-2501-0001"
- ❌ Invalid: Reason "" (empty)
- ❌ Invalid: Reason "quote" (too short, < 10 characters)

---

## 4. Cross-Field Validations (VAL-EXRATE-201 to 299)

### VAL-EXRATE-201: Buy/Sell Rate Spread Validation

**Fields Involved**: `buy_rate`, `sell_rate`, `exchange_rate`, `spread_percentage`

**Validation Rule**: When buy and sell rates provided, spread must be reasonable (typically <2% for major pairs, <5% for exotic pairs), and mid-rate should equal (buy + sell) / 2.

**Spread Calculation**: `spread_percentage = (sell_rate - buy_rate) / buy_rate × 100%`

**Mid-Rate Calculation**: `mid_rate = (buy_rate + sell_rate) / 2`

**Typical Spreads**:
- Major pairs (USD/EUR, USD/GBP, USD/JPY): 0.05% - 0.20%
- Minor pairs (EUR/GBP, AUD/CAD): 0.20% - 0.50%
- Exotic pairs (USD/ZAR, USD/THB): 0.50% - 2.00%
- Forward contracts: 0.10% - 0.50%

**Implementation Requirements**:
- **Client-Side**: Auto-calculate spread and mid-rate, display with validation status
- **Server-Side**: Validate spread within reasonable bounds, verify mid-rate calculation
- **Database**: CHECK constraints on spread percentage

**Error Codes**:
- VAL-EXRATE-201A (Warning): "Spread {pct}% exceeds typical range for {currency_pair}. Review rates."
- VAL-EXRATE-201B (Error): "Mid-rate calculation mismatch. Expected: {expected}, Provided: {provided}"
- VAL-EXRATE-201C (Error): "Buy rate must be less than or equal to sell rate"

**Spread Example**:
```
Buy Rate: 1.274000 USD/GBP (rate to buy GBP)
Sell Rate: 1.276000 USD/GBP (rate to sell GBP)
Spread: (1.276000 - 1.274000) / 1.274000 × 100% = 0.157%
Mid-Rate: (1.274000 + 1.276000) / 2 = 1.275000
Exchange Rate (stored): 1.275000 (should match mid-rate)
```

**Test Cases**:
- ✅ Valid: Buy 1.274000, Sell 1.276000, Mid 1.275000, Spread 0.157%
- ⚠️ Warning: Buy 1.270000, Sell 1.280000, Spread 0.787% (high for major pair)
- ❌ Error: Buy 1.276000, Sell 1.274000 (buy > sell, invalid)

---

### VAL-EXRATE-202: Rate Date and Validity Period Consistency

**Fields Involved**: `effective_date`, `effective_until`, `rate_type`

**Validation Rule**: Effective until date must be after effective date. For forward rates, validity period required. For spot rates, no expiry.

**Implementation Requirements**:
- **Client-Side**: Date picker constraints, auto-set validity based on rate type
- **Server-Side**: Validate date order, enforce conditional requirement
- **Database**: CHECK (effective_until > effective_date OR effective_until IS NULL)

**Error Codes**:
- VAL-EXRATE-202A: "Effective until date must be after effective date"
- VAL-EXRATE-202B: "Forward rates require effective until date (contract expiry)"
- VAL-EXRATE-202C: "Spot rates should not have effective until date (no expiry)"

**Validity Period Examples**:
```
Spot Rate:
  Effective: 2025-01-13 10:00:00
  Until: NULL (no expiry, superseded by next rate)

Forward Rate (90-day):
  Effective: 2025-01-13 (contract date)
  Until: 2025-04-13 (expiry date)
  Period: 90 days

Month-End Rate:
  Effective: 2025-01-31 23:59:59
  Until: NULL (period-end snapshot)
```

**Test Cases**:
- ✅ Valid: Spot rate, Effective 2025-01-13, Until NULL
- ✅ Valid: Forward rate, Effective 2025-01-13, Until 2025-04-13
- ❌ Invalid: Forward rate, Effective 2025-01-13, Until NULL (missing expiry)
- ❌ Invalid: Effective 2025-01-13, Until 2025-01-10 (expiry before effective)

---

### VAL-EXRATE-203: Approval Status and Approver Consistency

**Fields Involved**: `approval_status`, `approved_by`, `approved_date`

**Validation Rule**: When approval_status = 'approved', both approved_by and approved_date must be present. When 'pending' or 'rejected', approved_by may be NULL.

**Implementation Requirements**:
- **Client-Side**: N/A (workflow controlled)
- **Server-Side**: Validate co-presence, enforce workflow rules
- **Database**: CHECK ((approval_status = 'approved' AND approved_by IS NOT NULL AND approved_date IS NOT NULL) OR (approval_status <> 'approved'))

**Error Codes**:
- VAL-EXRATE-203A: "Approved rate must have approver and approval date"
- VAL-EXRATE-203B: "Pending/rejected rates should not have approval details"

**Approval State Examples**:
```
Pending:
  approval_status: 'pending'
  approved_by: NULL
  approved_date: NULL

Approved:
  approval_status: 'approved'
  approved_by: 'john.smith@company.com'
  approved_date: 2025-01-13 14:30:00

Rejected:
  approval_status: 'rejected'
  approved_by: 'jane.doe@company.com' (rejector)
  approved_date: 2025-01-13 14:30:00 (rejection date)
```

**Test Cases**:
- ✅ Valid: Status 'approved', Approver present, Date present
- ✅ Valid: Status 'pending', Approver NULL, Date NULL
- ❌ Invalid: Status 'approved', Approver NULL (missing approver)
- ❌ Invalid: Status 'pending', Approver present (shouldn't have approver yet)

---

### VAL-EXRATE-204: Transaction Currency Pair Existence

**Fields Involved**: `transaction_currency`, `base_currency`, `exchange_rate` (from foreign currency transaction)

**Validation Rule**: When recording foreign currency transaction, exchange rate must exist for transaction_currency/base_currency pair on or before transaction date.

**Implementation Requirements**:
- **Server-Side**: Query exchange_rates for rate where source = transaction_currency, target = base_currency, effective_date <= transaction_date, is_active = true
- **Database**: Foreign key reference or validation trigger

**Error Code**: VAL-EXRATE-204
**Error Message**: "No exchange rate found for {transaction_currency}/{base_currency} on or before {transaction_date}. Please create rate before posting transaction."

**User Action**: User must manually enter exchange rate for that currency pair before posting transaction.

**Test Cases**:
- ✅ Valid: Transaction GBP, Base USD, Rate exists for GBP/USD on transaction date
- ❌ Invalid: Transaction EUR, Base USD, No rate exists for EUR/USD

---

### VAL-EXRATE-205: Provider Authentication Configuration

**Fields Involved**: `authentication_type`, `api_key`, `api_endpoint`, `is_active` (in rate provider configuration)

**Validation Rule**: When authentication_type = 'api_key', api_key must be provided and encrypted. When 'oauth2', OAuth tokens required. When 'none', no credentials.

**Implementation Requirements**:
- **Client-Side**: Show/hide credential fields based on authentication_type
- **Server-Side**: Validate credential presence, encrypt api_key using AES-256
- **Database**: CHECK constraints enforce conditional requirements

**Error Codes**:
- VAL-EXRATE-205A: "API key required when authentication type is 'api_key'"
- VAL-EXRATE-205B: "OAuth tokens required when authentication type is 'oauth2'"
- VAL-EXRATE-205C: "API endpoint is required for all provider types"

**Provider Configuration Examples**:
```
OpenExchangeRates:
  authentication_type: 'api_key'
  api_key: {encrypted_key}
  api_endpoint: 'https://openexchangerates.org/api/latest.json'

ECB (Public):
  authentication_type: 'none'
  api_key: NULL
  api_endpoint: 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml'

Bloomberg:
  authentication_type: 'oauth2'
  oauth_token: {encrypted_token}
  oauth_refresh_token: {encrypted_refresh}
  api_endpoint: {Bloomberg API URL}
```

**Test Cases**:
- ✅ Valid: auth_type 'api_key', api_key present and encrypted
- ✅ Valid: auth_type 'none', no credentials
- ❌ Invalid: auth_type 'api_key', api_key NULL
- ❌ Invalid: auth_type 'none', api_key present (shouldn't have credentials)

---

### VAL-EXRATE-206: Revaluation Period and Date Alignment

**Fields Involved**: `revaluation_period`, `revaluation_date`, `period_status` (from currency revaluation)

**Validation Rule**: Revaluation date must fall within the selected accounting period's date range, and period must be 'Open'.

**Implementation Requirements**:
- **Client-Side**: Period dropdown sets date constraints, filter to open periods only
- **Server-Side**: Query period start/end dates, verify revaluation_date BETWEEN, check period_status = 'Open'
- **Database**: CHECK constraint with period date range, foreign key to accounting_periods

**Error Codes**:
- VAL-EXRATE-206A: "Revaluation date {date} must fall within period {period} ({start} to {end})"
- VAL-EXRATE-206B: "Cannot revalue period {period} - status is {status}, must be 'Open'"

**Period Alignment Example**:
```
Period: 2025-11 (November 2025)
Period Start: 2025-11-01
Period End: 2025-11-30
Period Status: Open

Valid Revaluation Dates: 2025-11-01 to 2025-11-30
Typical Choice: 2025-11-30 (end of period)
```

**Test Cases**:
- ✅ Valid: Period 2025-11 (Open), Date 2025-11-30
- ❌ Invalid: Period 2025-11, Date 2025-10-31 (before period)
- ❌ Invalid: Period 2025-10 (Closed), Date 2025-10-31 (period closed)

---

## 5. Security Validations (VAL-EXRATE-301 to 399)

### VAL-EXRATE-301: Permission - Rate Provider Configuration

**Validation Rule**: Only Treasury Manager and above can configure external rate provider APIs. Finance Manager and below have read-only access.

**Permitted Roles**:
- CFO: Full access (create, edit, activate, deactivate providers)
- Controller: Full access
- Treasury Manager: Full access
- Finance Manager: Read-only
- Accountant: No access

**Implementation Requirements**:
- **Client-Side**: Hide provider configuration section for unauthorized users
- **Server-Side**: Check user role before allowing provider CRUD operations
- **Database**: RLS policies enforce permission checks on rate_providers table

**Error Code**: VAL-EXRATE-301
**Error Message**: "You do not have permission to configure rate providers. Only Treasury Managers and above can manage external API integrations. Contact your administrator."

**User Action**: User must request Treasury Manager to configure providers.

**Security Rationale**: Rate providers involve API credentials, financial data exposure, and organization risk. Restricted to senior treasury roles.

**Test Cases**:
- ✅ Valid: CFO creates new provider
- ✅ Valid: Treasury Manager edits provider
- ❌ Invalid: Finance Manager attempts to create provider (read-only)
- ❌ Invalid: Accountant attempts to view providers (no access)

---

### VAL-EXRATE-302: Permission - Manual Rate Entry

**Validation Rule**: Only Treasury Manager and above can enter manual exchange rates. Accountants can only view rates.

**Permitted Roles**:
- CFO: Full access (enter, approve, edit manual rates)
- Controller: Full access
- Treasury Manager: Full access
- Finance Manager: Approve only (cannot enter)
- Accountant: Read-only

**Implementation Requirements**:
- **Client-Side**: Display manual rate entry form only for authorized users
- **Server-Side**: Verify user role before accepting manual rate submission
- **Database**: RLS policies restrict rate INSERT/UPDATE by role

**Error Code**: VAL-EXRATE-302
**Error Message**: "You do not have permission to enter manual exchange rates. Only Treasury Managers and above can perform manual rate entry. Contact Treasury for assistance."

**User Action**: User must request Treasury Manager to enter rate.

**Security Rationale**: Manual rate entry has significant financial impact. Restricted to treasury and senior finance roles with market knowledge.

**Test Cases**:
- ✅ Valid: Treasury Manager enters manual rate
- ✅ Valid: CFO enters and approves own rate (if variance <5%)
- ❌ Invalid: Accountant attempts manual entry (read-only)

---

### VAL-EXRATE-303: Permission - Rate Approval

**Validation Rule**: Rate approval permissions based on variance threshold. Higher variance requires higher authority.

**Approval Matrix**:
- Treasury Manager: Approve rates with variance <10%
- Finance Controller: Approve rates with variance <25%
- CFO: Approve rates with any variance (with documentation)

**Implementation Requirements**:
- **Client-Side**: Display approval button only for authorized approvers
- **Server-Side**: Check user role and variance level before allowing approval
- **Database**: RLS policies enforce approval authorization

**Error Codes**:
- VAL-EXRATE-303A: "Rate variance {pct}% requires {role} approval. Your role: {user_role}."
- VAL-EXRATE-303B: "You cannot approve your own rate entries (separation of duties)"

**User Action**: Rate routed to appropriate approver based on variance. User cannot self-approve.

**Approval Example**:
```
Variance 7.5%:
  Requires: Finance Manager or above
  Can Approve: Treasury Manager, Controller, CFO

Variance 18.2%:
  Requires: Finance Controller or above
  Can Approve: Controller, CFO

Variance 32.1%:
  Requires: CFO only
  Can Approve: CFO only
```

**Test Cases**:
- ✅ Valid: Treasury Manager approves 7.5% variance rate
- ✅ Valid: CFO approves 32.1% variance rate
- ❌ Invalid: Treasury Manager attempts to approve 18.2% variance (requires Controller)
- ❌ Invalid: User attempts to approve own rate entry (self-approval blocked)

---

### VAL-EXRATE-304: Permission - Revaluation Execution

**Validation Rule**: Only Finance Manager and above can execute period-end currency revaluations. Treasury Manager has read-only access.

**Permitted Roles**:
- CFO: Full access (execute, approve, reverse revaluations)
- Controller: Full access
- Finance Manager: Execute and submit for approval
- Treasury Manager: Read-only
- Accountant: Read-only

**Implementation Requirements**:
- **Client-Side**: Disable "Run Revaluation" button for unauthorized users
- **Server-Side**: Check user role before allowing revaluation execution
- **Database**: RLS policies restrict revaluation INSERT/UPDATE by role

**Error Code**: VAL-EXRATE-304
**Error Message**: "You do not have permission to execute currency revaluations. Only Finance Managers and above can perform period-end revaluations. Contact Finance Manager."

**User Action**: User must request Finance Manager to execute revaluation.

**Security Rationale**: Revaluations impact financial statements (P&L and balance sheet). Restricted to finance accounting roles.

**Test Cases**:
- ✅ Valid: Finance Manager executes revaluation
- ✅ Valid: Controller reviews and approves revaluation
- ❌ Invalid: Treasury Manager attempts to execute (read-only)
- ❌ Invalid: Accountant attempts to execute (read-only)

---

### VAL-EXRATE-305: Audit Log Completeness

**Validation Rule**: All exchange rate operations must be logged to audit_logs with user_id, timestamp, action, and before/after values.

**Audited Operations**:
- Exchange Rate: CREATE (manual/automated), UPDATE (approval), DELETE (if unused), SUPERSEDE
- Revaluation: CREATE, CALCULATE, POST, APPROVE, REVERSE
- Provider: CREATE, UPDATE, DEACTIVATE, API_CALL (success/failure)
- Transaction: CONVERT (currency conversion usage)

**Audit Log Fields**:
- action_type: CREATE, UPDATE, DELETE, APPROVE, REJECT, SUPERSEDE, POST, REVERSE, CONVERT
- entity_type: exchange_rate, revaluation, rate_provider, conversion
- entity_id: UUID of affected record
- user_id: Who performed action (NULL for system/automated)
- timestamp: When action occurred (UTC)
- before_value: JSON snapshot of previous state
- after_value: JSON snapshot of new state
- ip_address: Source IP
- user_agent: Browser/client identifier
- variance_from_previous: For rate changes, % variance
- approval_level: If approval action, approver role

**Implementation Requirements**:
- **Server-Side**: Audit middleware wraps all mutations, automatic logging
- **Database**: Trigger writes to audit_logs on all write operations, append-only table

**Error Code**: VAL-EXRATE-305
**Error Message**: "Audit logging failed. Transaction rolled back for data integrity. Contact administrator."

**User Action**: System error - if audit logging consistently fails, contact administrator (critical issue).

**Retention**: 7 years minimum for financial regulatory compliance (IRS, SEC, IAS 21)

**Audit Example**:
```json
{
  "audit_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2025-01-13T14:30:00Z",
  "action_type": "CREATE",
  "entity_type": "exchange_rate",
  "entity_id": "rate-uuid-12345",
  "user_id": "user-uuid-67890",
  "user_name": "john.smith@company.com",
  "user_role": "Treasury Manager",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "before_value": null,
  "after_value": {
    "source_currency": "USD",
    "target_currency": "EUR",
    "exchange_rate": 0.921456,
    "rate_type": "spot",
    "rate_source": "Bloomberg API",
    "approval_status": "approved"
  },
  "variance_from_previous": 0.25
}
```

**Test Cases**:
- ✅ Valid: All rate operations logged successfully
- ❌ Error: Audit log write fails, transaction rolled back

---

### VAL-EXRATE-306: API Key Encryption

**Validation Rule**: All API keys and OAuth tokens must be encrypted at rest using AES-256 encryption. Never stored in plain text.

**Encryption Requirements**:
- Algorithm: AES-256-GCM (Galois/Counter Mode for authenticated encryption)
- Key storage: Separate key management service (KMS) or secure environment variables
- Encryption at: Application layer before database write
- Decryption at: Application layer on read for internal use only (never sent to client)
- Key rotation: Quarterly (90 days)

**Implementation Requirements**:
- **Client-Side**: API keys never exposed in responses, displayed as masked (e.g., '••••••••••••••••')
- **Server-Side**: Encrypt on INSERT/UPDATE using crypto library, decrypt on SELECT for API calls only
- **Database**: TEXT column stores encrypted value (never plain text), additional metadata (key_version, encryption_timestamp)

**Error Codes**:
- VAL-EXRATE-306A: "API key encryption failed. Please try again or contact administrator."
- VAL-EXRATE-306B: "API key decryption failed. Key may be corrupted. Re-enter credentials."

**User Action**: If encryption fails, user should retry. If persists, contact administrator.

**Security Notes**:
- Encryption keys stored separately from database (KMS or secure env vars)
- Encrypted values cannot be searched or indexed (use hashing for verification)
- Key rotation requires re-encryption of all existing keys with new encryption key
- Decrypted values never logged, never sent to client, used only for API calls

**Test Cases**:
- ✅ Valid: API key encrypted and stored securely
- ✅ Valid: Decryption successful for API call
- ❌ Invalid: Attempt to store plain text key (encryption required)
- ❌ Invalid: Attempt to send decrypted key to client (security violation)

---

### VAL-EXRATE-307: Rate Tampering Detection

**Validation Rule**: Exchange rates must include integrity hash to detect tampering. Hash verified on every read.

**Hash Calculation**: `SHA256(exchange_rate || rate_date || rate_time || source_currency || target_currency || rate_source || created_by || salt)`

**Implementation Requirements**:
- **Server-Side**: Calculate hash on INSERT, verify hash on SELECT, alert on mismatch
- **Database**: rate_hash VARCHAR(64) NOT NULL (SHA256 produces 64-character hex string)

**Error Code**: VAL-EXRATE-307
**Error Message**: "Rate integrity check failed - possible data tampering detected. Rate ID: {id}. Rate quarantined. Administrator and Security team notified immediately."

**User Action**: System error - do not use rate. Contact administrator immediately. Rate automatically flagged for investigation.

**Detection Response Process**:
1. Log critical security event in audit trail
2. Send immediate alert to Database Administrator and Security team
3. Quarantine rate (mark as is_valid = false, is_quarantined = true)
4. Block usage in transactions (prevent financial impact)
5. Initiate security investigation (who modified, when, how)
6. Review all recent rate changes for similar tampering
7. Verify database backup integrity
8. Restore from backup if tampering confirmed

**Hash Calculation Example**:
```
Rate Data:
  exchange_rate: 1.275000
  rate_date: 2025-01-13
  rate_time: 14:30:00
  source_currency: USD
  target_currency: EUR
  rate_source: Bloomberg API
  created_by: user-uuid-12345
  salt: random-salt-abc123

Concatenated String:
  "1.275000|2025-01-13|14:30:00|USD|EUR|Bloomberg API|user-uuid-12345|random-salt-abc123"

SHA256 Hash:
  "a1b2c3d4e5f6789012345678abcdef1234567890abcdef1234567890abcdef12"
```

**Test Cases**:
- ✅ Valid: Hash matches on every read
- ❌ Error: Hash mismatch detected (tampering alert)
- ❌ Error: Hash missing or NULL (integrity violation)

---

### VAL-EXRATE-308: Separation of Duties

**Validation Rule**: Users cannot approve their own rate entries. Approval must be performed by different user (separation of duties).

**Implementation Requirements**:
- **Client-Side**: Disable approve button for rates created by logged-in user
- **Server-Side**: Check created_by ≠ approving_user_id before allowing approval
- **Database**: Trigger prevents self-approval

**Error Code**: VAL-EXRATE-308
**Error Message**: "You cannot approve your own rate entry. Approval must be performed by a different user (separation of duties control)."

**User Action**: User must request another authorized user to approve rate.

**Security Rationale**: Separation of duties is fundamental internal control to prevent fraud and errors. Prevents single user from both entering and approving potentially fraudulent rates.

**Test Cases**:
- ✅ Valid: User A creates rate, User B approves
- ❌ Invalid: User A creates rate, User A attempts to approve (blocked)

---

## 6. Integration Validations (VAL-EXRATE-401 to 499)

### VAL-EXRATE-401: Currency Management Integration

**Validation Rule**: Before creating exchange rate, verify both source and target currencies exist and are active in Currency Management module.

**Implementation Requirements**:
- **Server-Side**: Query Currency Management for currency_code, verify is_active = true
- **Database**: Foreign key references to currencies.currency_code

**Error Codes**:
- VAL-EXRATE-401A: "Source currency '{code}' not found in Currency Management. Create currency before creating rates."
- VAL-EXRATE-401B: "Target currency '{code}' not found in Currency Management. Create currency before creating rates."
- VAL-EXRATE-401C: "Currency '{code}' is inactive. Activate currency before creating rates."

**User Action**: User must first create and activate currencies in Currency Management module before creating exchange rates.

**Currency Check Process**:
1. User selects source/target currencies from dropdown (pre-filtered to active currencies)
2. Server validates both currencies exist and active
3. If validation fails, display error with link to Currency Management
4. User creates/activates currency, then returns to rate entry

**Test Cases**:
- ✅ Valid: USD and EUR both exist and active
- ❌ Invalid: Source currency "ABC" does not exist
- ❌ Invalid: Target currency EUR exists but is inactive

---

### VAL-EXRATE-402: Account Code Mapping Integration

**Validation Rule**: Before posting revaluation, verify required GL accounts exist in Account Code Mapping:
- 7200: Realized Exchange Gain/Loss
- 7210: Unrealized Exchange Gain/Loss (revaluations)
- 7250: Currency Translation Adjustment (consolidated entities)

**Implementation Requirements**:
- **Server-Side**: Query Account Code Mapping for accounts 7200, 7210, verify active status
- **Database**: Foreign key reference if accounts in same database

**Error Codes**:
- VAL-EXRATE-402A: "Realized exchange gain/loss account (7200) not found in Account Code Mapping. Configure account before posting transactions."
- VAL-EXRATE-402B: "Unrealized exchange gain/loss account (7210) not found in Account Code Mapping. Configure account before running revaluations."
- VAL-EXRATE-402C: "Exchange gain/loss account {account_code} is inactive. Activate account before posting."

**User Action**: User must configure missing GL accounts in Account Code Mapping module before proceeding with revaluation.

**Account Setup Check**:
- Run during revaluation initialization
- Display setup wizard if accounts missing
- Guide user through Account Code Mapping setup
- Validate account configuration before allowing revaluation

**Test Cases**:
- ✅ Valid: Accounts 7200 and 7210 exist and active
- ❌ Invalid: Account 7210 not found in Account Code Mapping
- ❌ Invalid: Account 7200 exists but inactive

---

### VAL-EXRATE-403: Rate Provider API Health Check

**Validation Rule**: Before retrieving exchange rates from external API, verify provider is available and responding.

**Health Check Steps**:
1. Send HTTP HEAD request to provider API endpoint
2. Verify response status 200 OK within 5 seconds timeout
3. Check consecutive_failures count < 3
4. Verify provider is_active = true
5. Check last_successful_update within acceptable staleness threshold

**Implementation Requirements**:
- **Server-Side**: Health check before API call, automatic failover to next priority provider if unavailable
- **Database**: Update health_status, last_health_check_at, consecutive_failures after each check

**Error Codes**:
- VAL-EXRATE-403A: "Rate provider {provider_name} is unavailable (HTTP {status_code}). Failing over to {next_provider}."
- VAL-EXRATE-403B: "All rate providers unavailable. Cannot retrieve exchange rates. Using cached rates with staleness warning."
- VAL-EXRATE-403C: "Rate provider {provider_name} has exceeded failure threshold ({failures}). Marked inactive. Manual intervention required."

**Failover Process**:
1. Primary provider (priority 1) health check fails
2. Attempt secondary provider (priority 2)
3. If secondary fails, attempt tertiary provider (priority 3)
4. If all providers fail, use cached rates with staleness warning
5. If cache expired, alert Treasury Manager for manual rate entry

**Provider Health Status**:
- Healthy: consecutive_failures = 0, last_success < 24 hours
- Degraded: consecutive_failures = 1-2, last_success < 48 hours
- Unhealthy: consecutive_failures >= 3, last_success > 48 hours (auto-disabled)

**Test Cases**:
- ✅ Valid: Primary provider responds 200 OK
- ⚠️ Failover: Primary fails, secondary succeeds
- ❌ Error: All providers fail, use cached rates

---

### VAL-EXRATE-404: Rate Provider Response Validation

**Validation Rule**: Exchange rate responses from external APIs must pass validation before being stored.

**Response Validation Checks**:
1. **Format**: JSON/XML response with expected structure
2. **Rate Present**: Required fields exist (from_currency, to_currency, exchange_rate, timestamp)
3. **Rate Bounds**: exchange_rate between 0.000001 and 10,000
4. **Timestamp Fresh**: Response timestamp within last 5 minutes (not stale)
5. **Currency Match**: Returned currencies match requested currencies
6. **Rate Precision**: Rate has sufficient decimal places (min 4, prefer 6)

**Implementation Requirements**:
- **Server-Side**: Parse response, validate all checks, reject if any fail, log failure
- **Database**: Store validation_status, validation_errors in rate_update_log

**Error Codes**:
- VAL-EXRATE-404A: "Invalid rate provider response format. Expected JSON, received {format}."
- VAL-EXRATE-404B: "Rate not found in provider response for {source}/{target}"
- VAL-EXRATE-404C: "Rate {rate} outside acceptable bounds (0.000001 to 10,000). Possible data error."
- VAL-EXRATE-404D: "Stale rate data - provider timestamp {timestamp} older than 5 minutes"
- VAL-EXRATE-404E: "Currency mismatch - requested {requested}, received {received}"

**User Action**: System automatically falls back to next provider. If all fail, Treasury Manager alerted to enter manual rate.

**Example Valid Response (OpenExchangeRates)**:
```json
{
  "disclaimer": "Usage subject to terms...",
  "license": "https://openexchangerates.org/license",
  "timestamp": 1705153800,
  "base": "USD",
  "rates": {
    "GBP": 0.784314,
    "EUR": 0.921456,
    "JPY": 149.234500
  }
}
```

**Validation Process**:
```
1. Parse JSON ✓
2. Check timestamp (2025-01-13T14:30:00Z) ✓
3. Verify base currency = USD ✓
4. Extract rate for GBP: 0.784314 ✓
5. Validate bounds: 0.000001 < 0.784314 < 10000 ✓
6. Check precision: 6 decimals ✓
7. All checks passed → Store rate
```

**Test Cases**:
- ✅ Valid: Well-formed JSON, fresh timestamp, valid rates
- ❌ Invalid: Malformed JSON (parse error)
- ❌ Invalid: Timestamp 10 minutes old (stale)
- ❌ Invalid: Rate 15000 (out of bounds)

---

### VAL-EXRATE-405: Posting Engine Integration

**Validation Rule**: When posting foreign currency transactions or revaluations to GL, verify posting engine accepts dual currency data format.

**Required Dual Currency Posting Format**:
```json
{
  "journal_entry": {
    "entry_date": "2025-01-13",
    "description": "Period-end currency revaluation - November 2025",
    "source_module": "Exchange Rate Management",
    "source_document_id": "revaluation-uuid-12345",
    "lines": [
      {
        "account_code": "1200",
        "debit_amount": 250.00,
        "original_currency": "GBP",
        "original_amount": 10000.00,
        "exchange_rate": 1.2750,
        "transaction_type": "unrealized_gain"
      },
      {
        "account_code": "7210",
        "credit_amount": 250.00,
        "description": "Unrealized exchange gain on AR GBP"
      }
    ]
  }
}
```

**Implementation Requirements**:
- **Server-Side**: Construct journal entry in posting engine's expected format, call posting API, handle response, retry on transient failures
- **Database**: Store je_id (posted journal entry reference) in revaluation record

**Error Codes**:
- VAL-EXRATE-405A: "Posting engine rejected journal entry: {error_message}. Review and correct."
- VAL-EXRATE-405B: "Posting engine unavailable (timeout or service down). Transaction saved as pending, will retry automatically."
- VAL-EXRATE-405C: "Posting validation failed: {validation_errors}. Check account codes and amounts."

**User Action**: If posting fails, revaluation marked as 'Pending GL Post'. User can retry posting manually or wait for automatic retry (hourly).

**Posting Workflow**:
1. Revaluation completed and approved
2. Generate journal entry lines (debits/credits)
3. Validate JE balances (debits = credits)
4. Call posting engine API
5. On success: Store je_id, update status = 'Posted'
6. On failure: Store error, update status = 'Pending', schedule retry

**Test Cases**:
- ✅ Valid: JE posted successfully, je_id returned
- ⚠️ Retry: Posting engine timeout, saved as pending
- ❌ Error: Validation failed, invalid account code

---

## 7. Performance Validations (VAL-EXRATE-501 to 599)

### VAL-EXRATE-501: Revaluation Account Limit

**Validation Rule**: Period-end currency revaluations limited to maximum 1000 accounts per revaluation run to prevent performance degradation and timeout.

**Performance Rationale**:
- 1000 accounts × 30 seconds average processing time = 30 minutes max revaluation time (acceptable for period-end)
- Database query performance degrades significantly beyond 1000 accounts in single transaction
- Memory usage for large result sets can cause application crashes

**Implementation Requirements**:
- **Client-Side**: Display account count in preview, warn if approaching limit (>900 accounts)
- **Server-Side**: Count accounts in revaluation scope, reject if > 1000, suggest batch processing
- **Database**: N/A (application-level performance control)

**Error Code**: VAL-EXRATE-501
**Error Message**: "Revaluation scope includes {count} accounts, exceeding maximum of 1000. Please filter by specific currencies, departments, or account ranges. For enterprise-scale revaluations, contact administrator for batch processing setup."

**User Action**: User must narrow revaluation scope by:
- Selecting fewer currencies (e.g., revalue GBP only, then EUR)
- Filtering by department or location
- Specifying account ranges (e.g., 1200-1299 AR, then 2100-2199 AP)

**Batch Processing Alternative**: For organizations with >1000 accounts, administrator configures automated batch revaluation (runs overnight, processes in batches of 500 accounts).

**Test Cases**:
- ✅ Valid: Revaluation scope 750 accounts (below limit)
- ⚠️ Warning: Revaluation scope 950 accounts (approaching limit)
- ❌ Error: Revaluation scope 1250 accounts (exceeds limit)

---

### VAL-EXRATE-502: Rate Cache Size Limit

**Validation Rule**: Exchange rate cache (Redis) limited to 10,000 rate entries to prevent memory exhaustion. LRU (Least Recently Used) eviction policy enforced.

**Cache Configuration**:
- Max Entries: 10,000 rates
- Eviction Policy: LRU (Least Recently Used)
- TTL per Entry: 15 minutes (900 seconds)
- Total Memory Limit: ~100 MB (assuming 10 KB per cached rate entry with metadata)

**Implementation Requirements**:
- **Server-Side**: Monitor Redis cache size via Redis INFO command, implement LRU eviction, alert if consistently hitting limit
- **Database**: N/A (cache-level control)

**Error Code**: VAL-EXRATE-502
**Error Message**: "Rate cache approaching size limit ({current}/{max} entries). Oldest rates being evicted automatically (LRU policy). Consider increasing cache size or reducing cache TTL. Administrator notified."

**User Action**: System automatically evicts oldest/least-used rates. No user action required. Administrator alerted to adjust cache configuration if limit consistently hit.

**Cache Optimization Strategies**:
- Reduce TTL from 15 minutes to 10 minutes (faster expiration)
- Increase max entries to 15,000 (if sufficient memory available)
- Implement selective caching (cache only frequently used currency pairs)

**Test Cases**:
- ✅ Valid: Cache 5000 entries (50% utilization, healthy)
- ⚠️ Warning: Cache 9500 entries (95% utilization, approaching limit)
- ⚠️ Eviction: Cache 10000 entries (100% utilization, LRU eviction active)

---

### VAL-EXRATE-503: Batch Rate Retrieval Limit

**Validation Rule**: Automatic exchange rate retrieval limited to maximum 100 currency pairs per batch to prevent API rate limiting, timeout, and performance degradation.

**Performance Rationale**:
- API rate limits: Most providers limit to 100-500 requests per minute
- Network timeout: Large batch requests can timeout (>60 seconds)
- Processing time: 100 pairs × 500ms avg = 50 seconds (acceptable)

**Implementation Requirements**:
- **Server-Side**: Split large currency pair lists into batches of 100, process with 1-second delay between batches, track batch progress
- **Database**: Store batch_id, batch_number, batch_status in rate_update_log

**Error Code**: VAL-EXRATE-503
**Error Message**: "Rate retrieval for {count} currency pairs exceeds batch limit of 100. Processing in {batch_count} batches with 1-second delays between batches. Estimated completion time: {estimate} minutes. Process continues in background."

**User Action**: System automatically batches requests. No user action required. Process takes longer for large currency lists (displayed in progress indicator).

**Batch Processing Example**:
```
Total Currency Pairs: 250
Batch Size: 100

Batch 1: Pairs 1-100 (process, wait 1 second)
Batch 2: Pairs 101-200 (process, wait 1 second)
Batch 3: Pairs 201-250 (process, complete)

Total Time: ~150 seconds (2.5 minutes)
```

**Test Cases**:
- ✅ Valid: 50 currency pairs (single batch)
- ⚠️ Batched: 150 currency pairs (2 batches)
- ⚠️ Batched: 250 currency pairs (3 batches)

---

## 8. Validation Error Response Format

All validation errors follow consistent JSON response format for API/frontend integration:

```json
{
  "success": false,
  "timestamp": "2025-01-13T14:30:00Z",
  "errors": [
    {
      "code": "VAL-EXRATE-110B",
      "field": "exchange_rate",
      "message": "Rate variance 7.5% requires Finance Manager approval",
      "severity": "warning",
      "userAction": "Submit rate for Finance Manager approval with justification",
      "helpLink": "/help/exchange-rates/approval-workflow"
    },
    {
      "code": "VAL-EXRATE-003C",
      "field": "exchange_rate",
      "message": "Exchange rate must have at most 6 decimal places",
      "severity": "error",
      "userAction": "Round rate to 6 decimal places before submitting",
      "helpLink": "/help/exchange-rates/precision"
    }
  ],
  "context": {
    "source_currency": "USD",
    "target_currency": "GBP",
    "exchange_rate": 1.2750001,
    "variance_from_previous": 7.5
  }
}
```

**Severity Levels**:
- **error**: Blocks submission, must be fixed before proceeding
- **warning**: Allows submission with confirmation or approval workflow, logged for review
- **info**: Informational only, no action required, helpful context

**Error Response Fields**:
- **code**: Unique validation rule identifier (e.g., VAL-EXRATE-110B)
- **field**: Field that failed validation (e.g., "exchange_rate")
- **message**: User-friendly error description
- **severity**: error | warning | info
- **userAction**: Specific guidance on how to resolve error
- **helpLink**: Link to documentation explaining validation rule

---

## 9. Appendix

### Related Documents

- [Business Requirements](./BR-exchange-rate-management.md)
- [Use Cases](./UC-exchange-rate-management.md)
- [Technical Specification](./TS-exchange-rate-management.md)
- [Data Schema](./DS-exchange-rate-management.md)
- [Flow Diagrams](./FD-exchange-rate-management.md)
- [Currency Management Validations](../currency-management/VAL-currency-management.md)

### Validation Rule Categories Summary

| Category | Rule Count | Critical Rules |
|----------|------------|----------------|
| Field-Level | 14 | 11 (currency codes, rate precision, rate bounds, dates) |
| Business Rules | 20 | 18 (variance, approval, immutability, triangulation, revaluation) |
| Cross-Field | 6 | 5 (spread validation, date consistency, approval workflow) |
| Security | 8 | 7 (permissions, audit trail, encryption, tampering detection, separation of duties) |
| Integration | 5 | 5 (currency management, account mapping, rate providers, posting engine) |
| Performance | 3 | 0 (limits and warnings, performance optimization) |
| **Total** | **56** | **46** |

### Critical Validation Rules by Priority

**Priority 1 - Prevent Financial Errors**:
- VAL-EXRATE-003: Exchange rate precision and bounds (6 decimals, 0.000001 to 10,000)
- VAL-EXRATE-004: Inverse rate mathematical consistency (1 / exchange_rate)
- VAL-EXRATE-110: Manual rate variance approval workflow (5%, 10%, 25% thresholds)
- VAL-EXRATE-113: Triangulation consistency validation (±0.5% tolerance)
- VAL-EXRATE-115: Transaction date rate usage (not current rate)
- VAL-EXRATE-116: Converted amount rounding (target currency decimal places)
- VAL-EXRATE-118: Exchange gain/loss calculation accuracy

**Priority 2 - Maintain Data Integrity**:
- VAL-EXRATE-101: Exchange rate positivity (no zero/negative rates)
- VAL-EXRATE-102: Inverse rate consistency
- VAL-EXRATE-103: Currency self-reference prevention
- VAL-EXRATE-104: Single active rate per pair and type
- VAL-EXRATE-105: Exchange rate precision requirement (6 decimals minimum)
- VAL-EXRATE-109: Stale rate warning (24-48 hours)
- VAL-EXRATE-112: Period-end rate immutability
- VAL-EXRATE-114: Bulk import atomic transaction

**Priority 3 - Ensure Compliance**:
- VAL-EXRATE-106: Automated update suspension during critical periods
- VAL-EXRATE-107: Effective date immediate activation (backdating requires CFO)
- VAL-EXRATE-111: Forward rate contract reference requirement
- VAL-EXRATE-119: Multi-currency consolidation consistency (IAS 21)
- VAL-EXRATE-120: Manual entry justification requirement
- VAL-EXRATE-305: Complete audit trail (7-year retention)

**Priority 4 - Security**:
- VAL-EXRATE-301: Permission - Rate provider configuration
- VAL-EXRATE-302: Permission - Manual rate entry
- VAL-EXRATE-303: Permission - Rate approval (variance-based)
- VAL-EXRATE-306: API key encryption (AES-256)
- VAL-EXRATE-307: Rate tampering detection (SHA256 hashing)
- VAL-EXRATE-308: Separation of duties (no self-approval)

### IAS 21 Compliance Checklist

This validation framework ensures compliance with IAS 21 "The Effects of Changes in Foreign Exchange Rates":

- ✅ **Para 21**: Transaction recorded at spot exchange rate on transaction date (VAL-EXRATE-115)
- ✅ **Para 23**: Monetary items revalued at period-end closing rate (VAL-EXRATE-119)
- ✅ **Para 28**: Exchange differences recognized in P&L (VAL-EXRATE-118)
- ✅ **Para 39**: Disclosure of exchange gain/loss amount (VAL-EXRATE-118, audit logs)
- ✅ **Para 52**: Disclosure of foreign currency risk (variance alerts VAL-EXRATE-109, VAL-EXRATE-110)
- ✅ **Best Practice**: Automatic reversal of unrealized gains/losses (documented in BR-EXRATE-020)
- ✅ **Best Practice**: Historical rate preservation for audit (VAL-EXRATE-112, immutability)

### Validation Rules vs Business Rules Mapping

| Business Rule (BR) | Validation Rule (VAL) | Category |
|--------------------|----------------------|----------|
| BR-EXRATE-001 (Positivity) | VAL-EXRATE-101 | Business Rule |
| BR-EXRATE-002 (Inverse consistency) | VAL-EXRATE-004, VAL-EXRATE-102 | Field + Business |
| BR-EXRATE-003 (No self-reference) | VAL-EXRATE-002, VAL-EXRATE-103 | Field + Business |
| BR-EXRATE-004 (Single active rate) | VAL-EXRATE-013, VAL-EXRATE-104 | Field + Business |
| BR-EXRATE-005 (6 decimal precision) | VAL-EXRATE-003, VAL-EXRATE-105 | Field + Business |
| BR-EXRATE-007 (Update suspension) | VAL-EXRATE-106 | Business Rule |
| BR-EXRATE-008 (Immediate activation) | VAL-EXRATE-107 | Business Rule |
| BR-EXRATE-009 (Retry logic) | VAL-EXRATE-108 | Business Rule |
| BR-EXRATE-010 (Stale rate warning) | VAL-EXRATE-109 | Business Rule |
| BR-EXRATE-011 (Variance approval) | VAL-EXRATE-110 | Business Rule |
| BR-EXRATE-012 (Forward contract ref) | VAL-EXRATE-007, VAL-EXRATE-111 | Field + Business |
| BR-EXRATE-013 (Period-end immutable) | VAL-EXRATE-112 | Business Rule |
| BR-EXRATE-014 (Triangulation) | VAL-EXRATE-113, VAL-EXRATE-117 | Business + Cross-Field |
| BR-EXRATE-015 (Bulk import atomic) | VAL-EXRATE-114 | Business Rule |
| BR-EXRATE-016 (Transaction date rate) | VAL-EXRATE-115 | Business Rule |
| BR-EXRATE-017 (Amount rounding) | VAL-EXRATE-116 | Business Rule |
| BR-EXRATE-018 (Cross-currency) | VAL-EXRATE-117 | Business Rule |
| BR-EXRATE-019 (Gain/loss calculation) | VAL-EXRATE-118 | Business Rule |
| BR-EXRATE-020 (Consolidation) | VAL-EXRATE-119 | Business Rule |
| BR-EXRATE-021 (Manual justification) | VAL-EXRATE-011, VAL-EXRATE-120 | Field + Business |
| BR-EXRATE-022 (Audit retention) | VAL-EXRATE-305 | Security |
| BR-EXRATE-023 (Source logging) | VAL-EXRATE-305 | Security |
| BR-EXRATE-024 (Historical correction) | VAL-EXRATE-112 | Business Rule |

---

**Document End**
