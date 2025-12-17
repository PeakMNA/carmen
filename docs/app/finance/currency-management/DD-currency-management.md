# Data Definition: Currency Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Currency Management
- **Database**: PostgreSQL (Supabase)
- **Schema Version**: 1.0.0
- **Last Updated**: 2025-11-15
- **Owner**: Finance & Treasury Team
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |

---

## Overview

The Currency Management data model provides comprehensive multi-currency support for hospitality operations with IAS 21 compliance. The schema design emphasizes high-precision decimal arithmetic for currency conversion, immutable exchange rate history for audit trails, and dual currency storage for all foreign currency transactions.

The data model consists of nine core entities: currencies for currency master data, exchange_rates for current rates, exchange_rate_history for historical rate tracking, foreign_currency_transactions for dual currency transaction recording, currency_revaluations and revaluation_lines for period-end processing, exchange_gain_loss_log for gain/loss tracking, currency_providers for external API configuration, and multi_currency_bank_accounts for bank account currency settings. These entities support the complete multi-currency lifecycle from transaction capture through period-end revaluation and financial reporting.

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY

This document describes data structures, entities, relationships, and constraints in TEXT FORMAT. It does NOT contain executable SQL code, database scripts, or implementation code. For database implementation details, refer to the Technical Specification document.**

**Related Documents**:
- [Business Requirements](./BR-currency-management.md)
- [Use Cases](./UC-currency-management.md)
- [Technical Specification](./TS-currency-management.md)
- [Flow Diagrams](./FD-currency-management.md)
- [Validations](./VAL-currency-management.md)

---

## Entity Relationship Overview

**Primary Entities**:
- **currencies**: Currency master data with ISO 4217 codes and display formats
- **exchange_rates**: Current exchange rates with caching and expiry
- **exchange_rate_history**: Historical exchange rate records (7-year retention)
- **foreign_currency_transactions**: Transaction-level dual currency storage
- **currency_revaluations**: Period-end revaluation headers
- **revaluation_lines**: Individual revaluation line items by account
- **exchange_gain_loss_log**: Realized and unrealized gain/loss tracking
- **currency_providers**: External exchange rate provider configuration
- **multi_currency_bank_accounts**: Bank account currency settings

**Key Relationships**:

1. **currencies → exchange_rates**: One-to-Many relationship
   - Business meaning: Each currency has multiple exchange rate records over time
   - Cardinality: One currency has 100s-1000s of rate records (daily rates over years)
   - Foreign key: exchange_rates.currency_code references currencies.currency_code
   - Example: USD has 365 rate records per year for USD/SGD, USD/EUR, etc.

2. **exchange_rates → exchange_rate_history**: One-to-One archival relationship
   - Business meaning: Current rates archived to history when updated
   - Cardinality: Each current rate has corresponding historical records
   - Data flow: Current rate updated → old rate copied to history
   - Example: USD/GBP rate changes from 1.2750 to 1.2800 → 1.2750 archived to history

3. **foreign_currency_transactions → currencies**: Many-to-One relationship
   - Business meaning: Each transaction uses a specific currency
   - Cardinality: Many transactions in each currency
   - Foreign key: foreign_currency_transactions.transaction_currency references currencies.currency_code
   - Example: 500 transactions in GBP this month

4. **foreign_currency_transactions → exchange_rates**: Many-to-One relationship
   - Business meaning: Each transaction uses an exchange rate
   - Cardinality: Many transactions use same rate (within rate validity period)
   - Foreign key: foreign_currency_transactions.rate_id references exchange_rates.id
   - Example: All Nov 12 GBP transactions use the same 1.2750 rate

5. **currency_revaluations → revaluation_lines**: One-to-Many relationship
   - Business meaning: Each revaluation has multiple line items (one per account revalued)
   - Cardinality: One revaluation has 10-100 lines (one per foreign currency account balance)
   - Foreign key: revaluation_lines.revaluation_id references currency_revaluations.id
   - Example: Nov 2025 revaluation has 50 lines for 50 foreign currency account balances

6. **revaluation_lines → currencies**: Many-to-One relationship
   - Business meaning: Each revaluation line is for a specific currency
   - Cardinality: Many lines per currency (one per account with that currency)
   - Foreign key: revaluation_lines.currency_code references currencies.currency_code
   - Example: 15 revaluation lines for GBP (one per account with GBP balance)

7. **currency_revaluations → currency_revaluations**: One-to-One reversal relationship
   - Business meaning: Each revaluation has a corresponding reversal entry
   - Cardinality: One revaluation optionally has one reversal
   - Foreign key: currency_revaluations.reversal_of_id references currency_revaluations.id (self-ref)
   - Example: Nov 2025 revaluation reversed on Dec 1, 2025

8. **exchange_gain_loss_log → foreign_currency_transactions**: Many-to-One relationship
   - Business meaning: Each gain/loss entry tracks to source transaction
   - Cardinality: Many gain/loss entries per transaction (invoice + payment)
   - Foreign key: exchange_gain_loss_log.source_transaction_id references foreign_currency_transactions.id
   - Example: Invoice creates entry, payment creates gain/loss entry

9. **currency_providers → currencies**: One-to-Many relationship
   - Business meaning: Each provider supports multiple currencies
   - Cardinality: One provider supports 50-200 currencies
   - Junction: Provider-currency mapping in provider_config JSONB
   - Example: Bank of England provides rates for 30+ currencies vs USD

10. **multi_currency_bank_accounts → currencies**: Many-to-One relationship
    - Business meaning: Each bank account is denominated in one currency
    - Cardinality: Many bank accounts per currency
    - Foreign key: multi_currency_bank_accounts.currency_code references currencies.currency_code
    - Example: 3 GBP bank accounts (NatWest, HSBC, Barclays)

**Relationship Notes**:
- All foreign keys use ON DELETE RESTRICT for financial data integrity
- Exchange rates are immutable once used in transactions
- Revaluation entries must be reversed (not deleted) in next period
- Historical exchange rates retained for 7 years minimum
- Dual currency amounts always stored together (no orphan amounts)
- See [Flow Diagrams](./FD-currency-management.md) for visual ERD diagrams

---

## Data Entities

### Entity: currencies

**Description**: Represents currency master data with ISO 4217 compliance. Each record defines a currency that can be used for transactions, including display format, rounding rules, and exchange rate source configuration.

**Business Purpose**: Provides the foundation for multi-currency support, enabling transactions in multiple currencies with proper formatting and conversion. Maintains consistency across the system for currency display and calculations.

**Data Ownership**: CFO / Controller (configuration), Treasury Manager (rate sources)

**Access Pattern**:
- Primary: Query by currency_code (ISO code lookup)
- Secondary: Query by is_base_currency = true (organization base currency)
- Tertiary: Query by is_active = true (active currencies only)
- High-frequency: Currency validation on transaction entry

**Data Volume**: Low (~10-50 currencies per organization, 3-5 primary, rest occasional)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| currency_code | VARCHAR(3) | Yes | - | ISO 4217 currency code | USD, GBP, EUR, JPY, SGD | Unique, 3 chars uppercase |
| currency_name | VARCHAR(100) | Yes | - | Full currency name | United States Dollar, British Pound Sterling | Non-empty, max 100 |
| currency_symbol | VARCHAR(10) | Yes | - | Currency symbol | $, £, €, ¥, S$ | 1-10 chars |
| minor_unit | INTEGER | Yes | - | Number of decimal places | 2 (USD), 0 (JPY), 3 (BHD) | 0-4 |
| symbol_position | VARCHAR(10) | Yes | before | Symbol placement | before ($100), after (100€) | Must be 'before' or 'after' |
| thousand_separator | VARCHAR(5) | Yes | , | Thousands separator | , (1,000) . (1.000) | 1-5 chars |
| decimal_separator | VARCHAR(5) | Yes | . | Decimal separator | . (1.50) , (1,50) | 1-5 chars |
| rounding_rule | VARCHAR(20) | Yes | standard | Rounding strategy | standard, cash, mathematical | Must be from enum |
| rounding_precision | NUMERIC(4,2) | Yes | 0.01 | Rounding precision | 0.01 (cent), 0.05 (nickel), 0.10 | 0.01-1.00 |
| display_format | VARCHAR(50) | Yes | - | Complete format pattern | $#,##0.00, #.##0,00 € | Format string |
| is_base_currency | BOOLEAN | Yes | false | Organization base currency | true (one only), false | Only one can be true |
| is_active | BOOLEAN | Yes | true | Whether currency is in use | true, false | Cannot deactivate if transactions exist |
| effective_date | DATE | Yes | - | Date currency became active | 2025-01-01 | Not in future |
| inactive_date | DATE | No | NULL | Date currency became inactive | 2025-12-31 | Must be >= effective_date |
| exchange_rate_source | VARCHAR(50) | No | NULL | Preferred rate source | Bank of England, ECB, Manual | Provider code |
| auto_update_rates | BOOLEAN | Yes | false | Auto-retrieve rates | true (hourly), false (manual) | If rate source configured |
| rate_update_frequency | INTEGER | No | NULL | Update interval in minutes | 60 (hourly), 1440 (daily) | If auto_update_rates = true |
| country_code | VARCHAR(2) | No | NULL | ISO 3166 country code | US, GB, EU, JP, SG | 2 chars uppercase |
| description | TEXT | No | NULL | Currency description | Primary operating currency | Max 500 chars |
| notes | TEXT | No | NULL | Internal notes | Rate source: Bank of England API | Max 1000 chars |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-01T00:00:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:30:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `currency_code`: Must be unique, ISO 4217 compliant
- Only one record can have `is_base_currency` = true per organization

**Check Constraints**:
- `currency_code` must be 3 characters, uppercase A-Z
- `minor_unit` BETWEEN 0 AND 4
- `symbol_position` IN ('before', 'after')
- `rounding_rule` IN ('standard', 'cash', 'mathematical')
- `rounding_precision` BETWEEN 0.01 AND 1.00
- `inactive_date` >= `effective_date` (if not null)
- If `auto_update_rates` = true, then `exchange_rate_source` IS NOT NULL

**Business Rules**:
- Base currency cannot be changed once transactions exist
- Cannot deactivate currency with open balances
- Cannot delete currency referenced in transactions
- Symbol and separators must not conflict (decimal_separator != thousand_separator)
- Only one base currency allowed per organization

#### Sample Data Examples

**Example 1: United States Dollar (Base Currency)**
```
ID: 550e8400-e29b-41d4-a716-446655440001
Currency Code: USD
Currency Name: United States Dollar
Symbol: $
Minor Unit: 2
Symbol Position: before
Display Format: $#,##0.00
Is Base Currency: true
Is Active: true
Rounding Rule: standard
Rounding Precision: 0.01
```

**Example 2: British Pound Sterling**
```
ID: 550e8400-e29b-41d4-a716-446655440002
Currency Code: GBP
Currency Name: British Pound Sterling
Symbol: £
Minor Unit: 2
Symbol Position: before
Display Format: £#,##0.00
Is Base Currency: false
Is Active: true
Exchange Rate Source: Bank of England
Auto Update Rates: true
Rate Update Frequency: 60 (hourly)
```

**Example 3: Japanese Yen (Zero Decimals)**
```
ID: 550e8400-e29b-41d4-a716-446655440003
Currency Code: JPY
Currency Name: Japanese Yen
Symbol: ¥
Minor Unit: 0
Symbol Position: before
Display Format: ¥#,##0
Is Base Currency: false
Is Active: true
Rounding Rule: standard
Rounding Precision: 1.00
```

---

### Entity: exchange_rates

**Description**: Current exchange rates for currency conversions. Each record contains the latest exchange rate between two currencies with validity period and source information. Rates are cached and refreshed based on TTL (Time To Live).

**Business Purpose**: Provides real-time exchange rates for foreign currency transaction processing and conversion calculations. Supports automatic rate retrieval from external providers and manual rate entry with approval workflow.

**Data Ownership**: Treasury Manager (approval), Exchange Rate Service (updates)

**Access Pattern**:
- Primary: Query by (from_currency, to_currency, rate_date) for conversion
- Secondary: Query by rate_date DESC + is_current = true (latest rates)
- Tertiary: Query by rate_source (provider analysis)
- High-frequency: Cached lookups during transaction processing (Redis 1-hour TTL)

**Data Volume**: Medium (~100-500 current rates, refreshed hourly/daily)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| from_currency | VARCHAR(3) | Yes | - | Source currency code | USD, GBP, EUR, JPY | Foreign key to currencies |
| to_currency | VARCHAR(3) | Yes | - | Target currency code | USD, SGD, EUR, JPY | Foreign key to currencies |
| rate_date | DATE | Yes | - | Effective date of rate | 2025-11-12 | Today or historical |
| rate_time | TIMESTAMPTZ | Yes | NOW() | Exact time rate was set | 2025-11-12T10:00:00Z | When rate became effective |
| exchange_rate | NUMERIC(18,8) | Yes | - | Exchange rate value | 1.27500000, 0.00690000 | 8 decimal precision, > 0 |
| inverse_rate | NUMERIC(18,8) | Yes | - | Inverse rate (calculated) | 0.78431373 (1/1.2750) | Auto-calculated |
| bid_rate | NUMERIC(18,8) | No | NULL | Buy rate | 1.27450000 | If from provider |
| ask_rate | NUMERIC(18,8) | No | NULL | Sell rate | 1.27550000 | If from provider |
| mid_rate | NUMERIC(18,8) | No | NULL | Mid-market rate | 1.27500000 | Average of bid/ask |
| rate_source | VARCHAR(50) | Yes | Manual | Source of rate | Bank of England, ECB, Manual | Must be from enum |
| rate_type | VARCHAR(20) | Yes | Spot | Type of rate | Spot, Forward, Average | Must be from enum |
| provider_id | UUID | No | NULL | Rate provider | 550e8400-... | Foreign key to currency_providers |
| provider_reference | VARCHAR(100) | No | NULL | Provider's rate ID | BOE-2025-11-12-GBPUSD | External reference |
| is_current | BOOLEAN | Yes | true | Whether this is latest rate | true, false | Only one current per pair |
| is_manual | BOOLEAN | Yes | false | Manually entered rate | false (auto), true (manual) | Manual rates flagged |
| manual_reason | TEXT | No | NULL | Reason for manual entry | Bank API unavailable | If is_manual = true |
| variance_from_previous | NUMERIC(10,6) | Yes | - | Change from last rate | 0.005000 (+0.5%), -0.002000 (-0.2%) | Percentage change |
| variance_threshold_exceeded | BOOLEAN | Yes | false | Large variance flag | true (>5%), false | Requires review if true |
| requires_approval | BOOLEAN | Yes | false | Approval needed | true (variance >5%), false | Manual rates >5% variance |
| approval_status | VARCHAR(20) | No | NULL | Approval state | Pending, Approved, Rejected | If requires_approval = true |
| approved_by | UUID | No | NULL | Approver user ID | 550e8400-... | Foreign key to users |
| approved_at | TIMESTAMPTZ | No | NULL | Approval timestamp | 2025-11-12T10:15:00Z | When approved |
| valid_from | TIMESTAMPTZ | Yes | NOW() | Rate validity start | 2025-11-12T10:00:00Z | When rate becomes valid |
| valid_until | TIMESTAMPTZ | Yes | - | Rate validity end | 2025-11-12T11:00:00Z | TTL expiry |
| ttl_seconds | INTEGER | Yes | 3600 | Cache TTL in seconds | 3600 (1 hour), 86400 (1 day) | Time until refresh |
| usage_count | INTEGER | Yes | 0 | Times rate used | 0, 150 | Number of transactions |
| last_used_at | TIMESTAMPTZ | No | NULL | Last usage timestamp | 2025-11-12T10:30:00Z | When last used |
| metadata | JSONB | No | {} | Additional rate data | {"spread": 0.001, "liquidity": "high"} | Valid JSON object |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-11-12T10:00:00Z | When rate retrieved |
| created_by | UUID | Yes | - | Creator user/system ID | 550e8400-... (system) | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:00:00Z | Auto-updated |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `(from_currency, to_currency, rate_date, rate_time)`: Unique rate per pair per timestamp
- `(from_currency, to_currency, is_current = true)`: Only one current rate per pair

**Foreign Keys**:
- `from_currency` → `currencies.currency_code` ON DELETE RESTRICT
- `to_currency` → `currencies.currency_code` ON DELETE RESTRICT
- `provider_id` → `currency_providers.id` ON DELETE SET NULL
- `approved_by` → `users.id` ON DELETE SET NULL

**Check Constraints**:
- `from_currency` != `to_currency`
- `exchange_rate` > 0
- `exchange_rate` BETWEEN 0.0001 AND 10000 (reasonableness check)
- `inverse_rate` = 1 / `exchange_rate` (within rounding tolerance)
- `rate_source` IN ('Bank of England', 'ECB', 'Bank of Japan', 'Open Exchange Rates', 'XE.com', 'Manual', 'System')
- `rate_type` IN ('Spot', 'Forward', 'Average', 'Historical')
- `valid_until` > `valid_from`
- `ttl_seconds` > 0
- If `is_manual` = true, then `manual_reason` IS NOT NULL
- If `variance_threshold_exceeded` = true, then `requires_approval` = true

**Business Rules**:
- Current rates expire after TTL and must be refreshed
- Manual rates require approval if variance exceeds 5%
- Inverse rate automatically calculated: inverse_rate = 1 / exchange_rate
- Only one current rate per currency pair
- Expired rates archived to exchange_rate_history
- Rates cannot be deleted once used in transactions

#### Sample Data Examples

**Example 1: GBP to USD (Automatic)**
```
ID: 550e8400-e29b-41d4-a716-446655440010
From Currency: GBP
To Currency: USD
Rate Date: 2025-11-12
Rate Time: 2025-11-12T10:00:00Z
Exchange Rate: 1.27500000
Inverse Rate: 0.78431373
Rate Source: Bank of England
Rate Type: Spot
Is Current: true
Is Manual: false
Valid From: 2025-11-12T10:00:00Z
Valid Until: 2025-11-12T11:00:00Z
TTL Seconds: 3600
Variance From Previous: 0.002000 (+0.2%)
Usage Count: 45
```

**Example 2: EUR to USD (Manual with Approval)**
```
ID: 550e8400-e29b-41d4-a716-446655440011
From Currency: EUR
To Currency: USD
Rate Date: 2025-11-12
Exchange Rate: 1.08500000
Rate Source: Manual
Is Current: true
Is Manual: true
Manual Reason: ECB API temporarily unavailable
Variance From Previous: 0.005500 (+0.5%)
Variance Threshold Exceeded: false
Requires Approval: false
Valid From: 2025-11-12T10:30:00Z
Valid Until: 2025-11-12T16:30:00Z
TTL Seconds: 21600 (6 hours)
```

**Example 3: JPY to USD (High Variance Requiring Approval)**
```
ID: 550e8400-e29b-41d4-a716-446655440012
From Currency: JPY
To Currency: USD
Exchange Rate: 0.00690000
Rate Source: Manual
Is Manual: true
Manual Reason: Significant JPY volatility, confirming rate
Variance From Previous: 0.070000 (+7.0%)
Variance Threshold Exceeded: true
Requires Approval: true
Approval Status: Approved
Approved By: 550e8400-... (Treasury Manager)
Approved At: 2025-11-12T11:00:00Z
```

---

### Entity: exchange_rate_history

**Description**: Historical exchange rate archive maintaining complete audit trail of all exchange rates over time. Rates are immutable once archived. Supports 7-year retention for compliance and historical transaction re-calculation.

**Business Purpose**: Provides complete exchange rate history for backdated transaction processing, audit trail, compliance reporting, and historical analysis. Enables accurate historical currency conversions and exchange gain/loss calculations.

**Data Ownership**: Finance Department (audit), System (auto-archival)

**Access Pattern**:
- Primary: Query by (from_currency, to_currency, rate_date) for historical lookup
- Secondary: Query by archived_at DESC (recent archival)
- Tertiary: Query by rate_date range (trend analysis)
- Occasional: Historical transaction re-processing

**Data Volume**: High (~10K-100K records per year, 70K-700K over 7 years)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| original_rate_id | UUID | Yes | - | Original rate record ID | 550e8400-... | From exchange_rates.id |
| from_currency | VARCHAR(3) | Yes | - | Source currency code | USD, GBP, EUR, JPY | Immutable |
| to_currency | VARCHAR(3) | Yes | - | Target currency code | USD, SGD, EUR, JPY | Immutable |
| rate_date | DATE | Yes | - | Effective date of rate | 2025-11-12 | Immutable |
| rate_time | TIMESTAMPTZ | Yes | - | Exact time rate was set | 2025-11-12T10:00:00Z | Immutable |
| exchange_rate | NUMERIC(18,8) | Yes | - | Exchange rate value | 1.27500000 | Immutable |
| inverse_rate | NUMERIC(18,8) | Yes | - | Inverse rate | 0.78431373 | Immutable |
| bid_rate | NUMERIC(18,8) | No | NULL | Buy rate | 1.27450000 | Immutable |
| ask_rate | NUMERIC(18,8) | No | NULL | Sell rate | 1.27550000 | Immutable |
| mid_rate | NUMERIC(18,8) | No | NULL | Mid-market rate | 1.27500000 | Immutable |
| rate_source | VARCHAR(50) | Yes | - | Source of rate | Bank of England | Immutable |
| rate_type | VARCHAR(20) | Yes | - | Type of rate | Spot | Immutable |
| provider_reference | VARCHAR(100) | No | NULL | Provider's rate ID | BOE-2025-11-12-GBPUSD | Immutable |
| was_manual | BOOLEAN | Yes | - | Was manually entered | false, true | Immutable |
| manual_reason | TEXT | No | NULL | Reason for manual entry | API unavailable | Immutable |
| approved_by | UUID | No | NULL | Approver user ID | 550e8400-... | Immutable |
| approved_at | TIMESTAMPTZ | No | NULL | Approval timestamp | 2025-11-12T10:15:00Z | Immutable |
| usage_count | INTEGER | Yes | - | Times rate was used | 45 | Snapshot at archival |
| variance_from_previous | NUMERIC(10,6) | Yes | - | Change from last rate | 0.002000 | Immutable |
| metadata | JSONB | No | {} | Additional rate data | {"spread": 0.001} | Immutable |
| archived_at | TIMESTAMPTZ | Yes | NOW() | When rate was archived | 2025-11-12T11:00:00Z | When copied to history |
| archived_by | VARCHAR(50) | Yes | System | Who/what archived rate | System, User:john.doe | System or user |
| archived_reason | VARCHAR(100) | Yes | - | Why rate was archived | Rate expired (TTL), Manual replacement | Audit trail |
| retention_until | DATE | Yes | - | Archive retention expiry | 2032-11-12 (7 years) | Calculated: archived_at + 7 years |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `original_rate_id`: Each exchange_rates record archived once

**Foreign Keys**:
- `from_currency` → `currencies.currency_code` ON DELETE RESTRICT
- `to_currency` → `currencies.currency_code` ON DELETE RESTRICT

**Check Constraints**:
- All constraints from exchange_rates entity apply
- `archived_at` >= `rate_time` (archived after creation)
- `retention_until` = `archived_at` + INTERVAL '7 years'

**Business Rules**:
- Historical rates are immutable (no updates or deletes)
- Rates archived when expired, replaced, or manually superseded
- 7-year minimum retention for compliance
- Archived rates can be queried for historical transactions
- No foreign key to original exchange_rates.id (may be deleted)

---

### Entity: foreign_currency_transactions

**Description**: Transaction-level dual currency storage for all foreign currency transactions. Each record contains both the original transaction currency amount and the converted base currency amount with the exchange rate used.

**Business Purpose**: Maintains complete dual currency history for all foreign currency transactions, enabling accurate exchange gain/loss calculations, multi-currency reporting, and IAS 21 compliance. Provides audit trail of exchange rates used.

**Data Ownership**: Finance Department (all transactions), Department Staff (entry)

**Access Pattern**:
- Primary: Query by transaction_id (lookup specific transaction)
- Secondary: Query by (transaction_currency, posting_date) for period analysis
- Tertiary: Query by source_document_type + source_document_id (trace to origin)
- Reporting: Query by accounting_period for financial statements

**Data Volume**: High (~5K-50K transactions per month), retention: permanent

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| transaction_id | UUID | Yes | - | GL transaction reference | 550e8400-... | Links to journal entry |
| transaction_number | VARCHAR(50) | Yes | - | Business transaction number | INV-UK-2501-00123 | Human-readable |
| transaction_date | DATE | Yes | - | Transaction business date | 2025-11-12 | When transaction occurred |
| posting_date | TIMESTAMPTZ | Yes | NOW() | When posted to system | 2025-11-12T10:30:00Z | When recorded |
| accounting_period | VARCHAR(7) | Yes | - | Period for accounting | 2025-11 | Format: YYYY-MM |
| source_document_type | VARCHAR(50) | Yes | - | Origin document type | Invoice, Payment, Receipt, GRN | Must be from enum |
| source_document_id | UUID | Yes | - | Origin document ID | 550e8400-... | Polymorphic reference |
| source_document_number | VARCHAR(50) | Yes | - | Origin document number | GRN-2501-00456 | For display |
| transaction_type | VARCHAR(50) | Yes | - | Transaction classification | Purchase, Sale, Payment, Receipt | Must be from enum |
| transaction_currency | VARCHAR(3) | Yes | - | Original currency | GBP, EUR, JPY | Foreign key to currencies |
| base_currency | VARCHAR(3) | Yes | - | Organization currency | USD, SGD | From organization config |
| transaction_amount | NUMERIC(15,2) | Yes | - | Amount in transaction currency | 900.00, 1500.00 | Original amount |
| base_amount | NUMERIC(15,2) | Yes | - | Amount in base currency | 1147.50, 1627.50 | Converted amount |
| exchange_rate | NUMERIC(18,8) | Yes | - | Rate used for conversion | 1.27500000 | 8 decimal precision |
| exchange_rate_date | DATE | Yes | - | Date of exchange rate | 2025-11-12 | Rate effective date |
| rate_id | UUID | No | NULL | Exchange rate record used | 550e8400-... | Foreign key to exchange_rates |
| rate_source | VARCHAR(50) | Yes | - | Where rate came from | Bank of England, Manual | Rate source type |
| rate_type | VARCHAR(20) | Yes | Spot | Type of rate used | Spot, Average, Fixed | Rate type |
| is_manual_rate | BOOLEAN | Yes | false | Manual rate override | false, true | If user overrode rate |
| manual_rate_reason | TEXT | No | NULL | Why manual rate used | Special contract rate | If is_manual_rate = true |
| settlement_currency | VARCHAR(3) | No | NULL | Currency of payment | GBP, USD | May differ from transaction |
| settlement_amount | NUMERIC(15,2) | No | NULL | Amount in settlement currency | 900.00 | If settled |
| settlement_date | DATE | No | NULL | When transaction settled | 2025-11-20 | Payment/receipt date |
| settlement_rate | NUMERIC(18,8) | No | NULL | Rate at settlement | 1.28000000 | For gain/loss calc |
| settlement_base_amount | NUMERIC(15,2) | No | NULL | Base amount at settlement | 1152.00 | For gain/loss calc |
| realized_gain_loss | NUMERIC(15,2) | No | NULL | Realized exchange gain/loss | -4.50 (loss), 10.00 (gain) | Settlement - original |
| realized_gain_loss_posted | BOOLEAN | Yes | false | Whether gain/loss posted | true, false | If journal entry created |
| is_settled | BOOLEAN | Yes | false | Whether fully settled | false, true | Payment complete |
| outstanding_amount | NUMERIC(15,2) | Yes | - | Unsettled amount | 900.00, 0.00 | For open items |
| account_type | VARCHAR(50) | Yes | - | GL account classification | AR, AP, Cash, Inventory | Type of account posted |
| gl_account_id | UUID | Yes | - | GL account posted to | 550e8400-... | Foreign key to gl_accounts |
| counterparty_type | VARCHAR(50) | No | NULL | Other party type | Vendor, Customer | Who transaction is with |
| counterparty_id | UUID | No | NULL | Other party ID | 550e8400-... | Vendor/customer ID |
| counterparty_name | VARCHAR(255) | No | NULL | Other party name | Fresh Farm Suppliers UK | For display |
| department_id | UUID | No | NULL | Department | 550e8400-... | Foreign key to departments |
| location_id | UUID | No | NULL | Location | 550e8400-... | Foreign key to locations |
| description | VARCHAR(500) | Yes | - | Transaction description | GRN posting for F&B ingredients | Non-empty |
| notes | TEXT | No | NULL | Additional notes | Special pricing agreement | Max 2000 chars |
| metadata | JSONB | No | {} | Flexible additional data | {"contract": "CNT-2501-0001"} | Valid JSON object |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-11-12T10:30:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:30:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Foreign Keys**:
- `transaction_currency` → `currencies.currency_code` ON DELETE RESTRICT
- `base_currency` → `currencies.currency_code` ON DELETE RESTRICT
- `rate_id` → `exchange_rates.id` ON DELETE SET NULL
- `gl_account_id` → `gl_accounts.id` ON DELETE RESTRICT

**Check Constraints**:
- `transaction_currency` != `base_currency`
- `transaction_amount` > 0
- `base_amount` > 0
- `exchange_rate` > 0
- `base_amount` = `transaction_amount` * `exchange_rate` (within rounding tolerance 0.01)
- `outstanding_amount` BETWEEN 0 AND `transaction_amount`
- If `is_settled` = true, then `settlement_date` IS NOT NULL
- If `settlement_date` IS NOT NULL, then `settlement_rate` IS NOT NULL
- If `is_manual_rate` = true, then `manual_rate_reason` IS NOT NULL

**Business Rules**:
- Dual currency amounts always stored together
- Exchange rate immutable after posting
- Realized gain/loss calculated only when settled
- Outstanding amount updated when partial payments received
- Settlement currency may differ from transaction currency
- Must maintain link to source document

---

### Entity: currency_revaluations

**Description**: Period-end currency revaluation headers tracking unrealized exchange gains and losses on open foreign currency balances. Each record represents a complete revaluation process for a specific accounting period.

**Business Purpose**: Supports IAS 21 compliance by calculating and posting unrealized exchange gains/losses on monetary items at period end. Enables automatic reversal in subsequent period to maintain proper accounting treatment.

**Data Ownership**: Accountant (execution), Controller (review), CFO (approval for large impacts)

**Access Pattern**:
- Primary: Query by accounting_period + status (period revaluations)
- Secondary: Query by revaluation_date DESC (recent revaluations)
- Tertiary: Query by reversal_of_id (find original for reversal)
- Reporting: Query by fiscal_year for annual reporting

**Data Volume**: Low (~12 revaluations per year, one per month + reversals = 24 per year)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| revaluation_number | VARCHAR(50) | Yes | Auto-generated | Unique revaluation ID | REVAL-2025-11-001 | Unique, format: REVAL-YYYY-MM-NNN |
| accounting_period | VARCHAR(7) | Yes | - | Period being revalued | 2025-11 | Format: YYYY-MM |
| fiscal_year | INTEGER | Yes | - | Fiscal year | 2025 | Derived from period |
| revaluation_date | DATE | Yes | - | Revaluation date | 2025-11-30 | Last day of period typically |
| revaluation_time | TIMESTAMPTZ | Yes | NOW() | When revaluation run | 2025-11-30T23:00:00Z | Exact timestamp |
| base_currency | VARCHAR(3) | Yes | - | Organization currency | USD, SGD | From organization config |
| currencies_revalued | VARCHAR[] | Yes | - | Currencies included | {GBP,EUR,JPY} | Array of currency codes |
| total_accounts_processed | INTEGER | Yes | 0 | Accounts revalued | 50 | Count of accounts |
| total_balance_revalued | NUMERIC(15,2) | Yes | 0.00 | Total foreign balance | 50000.00 | Sum across currencies |
| total_unrealized_gain | NUMERIC(15,2) | Yes | 0.00 | Total unrealized gains | 200.00 | Positive amount |
| total_unrealized_loss | NUMERIC(15,2) | Yes | 0.00 | Total unrealized losses | 75.00 | Positive amount |
| net_unrealized_gain_loss | NUMERIC(15,2) | Yes | 0.00 | Net gain/(loss) | 125.00, -50.00 | Gain > 0, Loss < 0 |
| journal_entry_id | UUID | No | NULL | Posted journal entry | 550e8400-... | Foreign key to journal_entries |
| journal_entry_number | VARCHAR(50) | No | NULL | JE number | JE-2501-011234 | For display |
| is_reversal | BOOLEAN | Yes | false | Whether this is reversal | false, true | Reversal of previous |
| reversal_of_id | UUID | No | NULL | Original revaluation | 550e8400-... | Foreign key to self |
| reversed_by_id | UUID | No | NULL | Reversal revaluation | 550e8400-... | Foreign key to self |
| reversal_date | DATE | No | NULL | When reversed | 2025-12-01 | Next period start |
| automatic_reversal_scheduled | BOOLEAN | Yes | false | Auto-reverse flag | true, false | If reversal scheduled |
| reversal_scheduled_date | DATE | No | NULL | When to reverse | 2025-12-01 | Next period start |
| status | VARCHAR(20) | Yes | Draft | Revaluation status | Draft, Calculated, Posted, Reversed | Must be from enum |
| calculation_method | VARCHAR(50) | Yes | Closing Rate | Method used | Closing Rate, Average Rate | IAS 21 method |
| monetary_items_only | BOOLEAN | Yes | true | Only monetary items | true | IAS 21 requirement |
| include_account_types | VARCHAR[] | Yes | - | Account types included | {AR,AP,Cash} | Array of types |
| exclude_account_types | VARCHAR[] | No | {} | Account types excluded | {Inventory} | Non-monetary items |
| rate_source | VARCHAR(50) | Yes | - | Where rates obtained | Bank of England, ECB | Provider |
| rate_retrieval_success | BOOLEAN | Yes | false | All rates retrieved | true, false | If all rates available |
| failed_currency_rates | VARCHAR[] | No | {} | Currencies with rate issues | {THB} | If rate_retrieval_success = false |
| requires_approval | BOOLEAN | Yes | false | Approval needed | true (>$10K), false | Based on net amount |
| approval_status | VARCHAR(20) | No | NULL | Approval state | Pending, Approved, Rejected | If requires_approval |
| approved_by | UUID | No | NULL | Approver user ID | 550e8400-... (CFO) | Foreign key to users |
| approved_at | TIMESTAMPTZ | No | NULL | Approval timestamp | 2025-12-01T09:00:00Z | When approved |
| approval_notes | TEXT | No | NULL | Approval comments | Approved - material gain | Max 500 chars |
| run_configuration | JSONB | No | {} | Revaluation settings | {"threshold": 0.01} | Configuration used |
| processing_time_seconds | INTEGER | No | NULL | Execution duration | 45 | Performance tracking |
| description | TEXT | Yes | - | Revaluation description | Nov 2025 month-end currency revaluation | Non-empty |
| notes | TEXT | No | NULL | Additional notes | Large GBP gain due to rate change | Max 2000 chars |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-11-30T23:00:00Z | When initiated |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| posted_at | TIMESTAMPTZ | No | NULL | When posted to GL | 2025-11-30T23:05:00Z | When status → Posted |
| posted_by | UUID | No | NULL | User who posted | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `revaluation_number`: Must be unique across all revaluations
- `(accounting_period, is_reversal = false)`: Only one original revaluation per period

**Foreign Keys**:
- `journal_entry_id` → `journal_entries.id` ON DELETE RESTRICT
- `reversal_of_id` → `currency_revaluations.id` ON DELETE RESTRICT (self-ref)
- `reversed_by_id` → `currency_revaluations.id` ON DELETE SET NULL (self-ref)

**Check Constraints**:
- `status` IN ('Draft', 'Calculated', 'Posted', 'Reversed')
- `net_unrealized_gain_loss` = `total_unrealized_gain` - `total_unrealized_loss`
- If `is_reversal` = true, then `reversal_of_id` IS NOT NULL
- If `status` = 'Posted', then `journal_entry_id` IS NOT NULL
- If `automatic_reversal_scheduled` = true, then `reversal_scheduled_date` IS NOT NULL
- `processing_time_seconds` >= 0

**Business Rules**:
- One revaluation per period (excluding reversals)
- Automatic reversal posted at start of next period
- Only monetary items revalued (AR, AP, Cash)
- Non-monetary items excluded (Inventory, Fixed Assets)
- Net impact over $10,000 requires CFO approval
- Reversals have opposite sign amounts

---

### Entity: revaluation_lines

**Description**: Individual line items within a period-end revaluation, one per account with foreign currency balance. Each line shows the original balance, revalued balance, and unrealized gain or loss.

**Business Purpose**: Provides detailed breakdown of revaluation calculations by account and currency, enabling account-level analysis of exchange impacts. Supports reversal posting and audit trail at account level.

**Data Ownership**: System (calculation), Accountant (review)

**Access Pattern**:
- Primary: Query by revaluation_id (all lines for revaluation)
- Secondary: Query by gl_account_id (account revaluation history)
- Tertiary: Query by currency_code (currency-specific impact)
- Reporting: Aggregation by account_type or department

**Data Volume**: Medium (~50-500 lines per revaluation, 600-6000 per year)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| revaluation_id | UUID | Yes | - | Parent revaluation | 550e8400-... | Foreign key to currency_revaluations |
| line_number | INTEGER | Yes | - | Line sequence number | 1, 2, 3, ... | Within revaluation |
| gl_account_id | UUID | Yes | - | GL account revalued | 550e8400-... (1200 AR) | Foreign key to gl_accounts |
| gl_account_code | VARCHAR(50) | Yes | - | Account code | 1200, 2100, 1110 | For display |
| gl_account_name | VARCHAR(255) | Yes | - | Account name | Accounts Receivable | For display |
| account_type | VARCHAR(50) | Yes | - | Account classification | AR, AP, Cash | Must be monetary |
| currency_code | VARCHAR(3) | Yes | - | Foreign currency | GBP, EUR, JPY | Foreign key to currencies |
| original_foreign_balance | NUMERIC(15,2) | Yes | - | Balance in foreign currency | 15000.00 | Opening balance |
| original_exchange_rate | NUMERIC(18,8) | Yes | - | Rate when balance created | 1.27500000 | Weighted average |
| original_base_balance | NUMERIC(15,2) | Yes | - | Balance in base currency | 19100.00 | Original conversion |
| revaluation_exchange_rate | NUMERIC(18,8) | Yes | - | Period-end rate | 1.28000000 | Current rate |
| revalued_base_balance | NUMERIC(15,2) | Yes | - | New balance in base | 19200.00 | Revalued amount |
| unrealized_gain_loss | NUMERIC(15,2) | Yes | - | Unrealized gain/(loss) | 100.00, -50.00 | Difference |
| is_gain | BOOLEAN | Yes | - | Whether gain or loss | true (gain), false (loss) | Calculated |
| gain_loss_percentage | NUMERIC(10,4) | Yes | - | Percentage change | 0.5236 (0.52%), -0.4500 | For analysis |
| department_id | UUID | No | NULL | Department dimension | 550e8400-... | Foreign key to departments |
| location_id | UUID | No | NULL | Location dimension | 550e8400-... | Foreign key to locations |
| dimension_1 | VARCHAR(50) | No | NULL | Additional dimension 1 | DEPT-KITCHEN | Dimension value |
| dimension_2 | VARCHAR(50) | No | NULL | Additional dimension 2 | LOC-MAIN | Dimension value |
| counterparty_count | INTEGER | Yes | 0 | Number of counterparties | 15 | For AR/AP accounts |
| transaction_count | INTEGER | Yes | 0 | Number of open transactions | 20 | Detail count |
| average_transaction_age_days | INTEGER | No | NULL | Average days outstanding | 30 | For AR/AP |
| oldest_transaction_date | DATE | No | NULL | Oldest open item | 2025-10-15 | For AR/AP |
| journal_entry_line_id | UUID | No | NULL | Posted JE line | 550e8400-... | Foreign key to journal_entry_lines |
| posting_debit_account | VARCHAR(50) | No | NULL | Debit account used | 1200 (AR) | Where debit posted |
| posting_credit_account | VARCHAR(50) | No | NULL | Credit account used | 7210 (Unrealized Gain) | Where credit posted |
| is_material | BOOLEAN | Yes | false | Material line flag | true (>$1K), false | Significant impact |
| requires_review | BOOLEAN | Yes | false | Review needed | true (unusual), false | Based on thresholds |
| review_reason | VARCHAR(200) | No | NULL | Why review needed | Large gain >$1000 | If requires_review |
| notes | TEXT | No | NULL | Line-specific notes | Includes 3 large invoices | Max 1000 chars |
| metadata | JSONB | No | {} | Additional line data | {"invoices": ['INV-001', 'INV-002']} | Valid JSON object |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `(revaluation_id, line_number)`: Line number unique within revaluation
- `(revaluation_id, gl_account_id, currency_code)`: One line per account-currency combo

**Foreign Keys**:
- `revaluation_id` → `currency_revaluations.id` ON DELETE CASCADE
- `gl_account_id` → `gl_accounts.id` ON DELETE RESTRICT
- `currency_code` → `currencies.currency_code` ON DELETE RESTRICT
- `journal_entry_line_id` → `journal_entry_lines.id` ON DELETE SET NULL

**Check Constraints**:
- `line_number` > 0
- `account_type` IN ('AR', 'AP', 'Cash') - Monetary items only
- `unrealized_gain_loss` = `revalued_base_balance` - `original_base_balance` (within 0.01)
- `is_gain` = (`unrealized_gain_loss` > 0)
- `revalued_base_balance` = `original_foreign_balance` * `revaluation_exchange_rate` (within 0.01)
- If `requires_review` = true, then `review_reason` IS NOT NULL

**Business Rules**:
- One line per unique account-currency combination
- Only monetary items included (AR, AP, Cash)
- Zero gain/loss lines can be excluded (configuration option)
- Material lines flagged for review (threshold: $1000)
- Line numbers sequential within revaluation

---

### Entity: exchange_gain_loss_log

**Description**: Comprehensive log of all exchange gains and losses (both realized and unrealized) with full traceability to source transactions and GL postings. Provides complete audit trail for exchange impact analysis.

**Business Purpose**: Enables detailed analysis of exchange gains and losses by type, currency, period, and counterparty. Supports compliance reporting, management analysis, and reconciliation with GL accounts. Provides basis for currency risk management.

**Data Ownership**: System (auto-logging), Finance Department (analysis)

**Access Pattern**:
- Primary: Query by accounting_period + gain_loss_type (period analysis)
- Secondary: Query by currency_code (currency-specific impact)
- Tertiary: Query by counterparty_id (vendor/customer analysis)
- Reporting: Aggregation by month, quarter, year

**Data Volume**: High (~1K-10K entries per month), retention: permanent

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| log_number | VARCHAR(50) | Yes | Auto-generated | Unique log entry number | FXGL-2501-001234 | Unique, format: FXGL-YYMM-NNNN |
| log_date | DATE | Yes | - | Date of gain/loss | 2025-11-12 | Business date |
| log_timestamp | TIMESTAMPTZ | Yes | NOW() | Exact time logged | 2025-11-12T10:30:00Z | When recorded |
| accounting_period | VARCHAR(7) | Yes | - | Accounting period | 2025-11 | Format: YYYY-MM |
| fiscal_year | INTEGER | Yes | - | Fiscal year | 2025 | Derived from period |
| gain_loss_type | VARCHAR(20) | Yes | - | Type of gain/loss | Realized, Unrealized | Must be from enum |
| event_type | VARCHAR(50) | Yes | - | Event that triggered | Payment, Receipt, Revaluation | Must be from enum |
| currency_code | VARCHAR(3) | Yes | - | Currency involved | GBP, EUR, JPY | Foreign key to currencies |
| base_currency | VARCHAR(3) | Yes | - | Organization currency | USD, SGD | From org config |
| gain_loss_amount_base | NUMERIC(15,2) | Yes | - | Gain/(loss) in base currency | 4.50, -10.00 | Positive=gain, negative=loss |
| is_gain | BOOLEAN | Yes | - | Whether gain or loss | true (gain), false (loss) | Calculated from amount |
| original_transaction_id | UUID | No | NULL | Source transaction | 550e8400-... | Foreign key to foreign_currency_transactions |
| original_transaction_number | VARCHAR(50) | No | NULL | Transaction number | INV-UK-2501-00123 | For display |
| original_transaction_date | DATE | No | NULL | Original transaction date | 2025-11-12 | When originated |
| original_amount | NUMERIC(15,2) | No | NULL | Original foreign amount | 900.00 | Transaction currency |
| original_exchange_rate | NUMERIC(18,8) | No | NULL | Original rate | 1.27500000 | When originated |
| original_base_amount | NUMERIC(15,2) | No | NULL | Original base amount | 1147.50 | At original rate |
| settlement_transaction_id | UUID | No | NULL | Settlement transaction | 550e8400-... | For realized G/L |
| settlement_transaction_number | VARCHAR(50) | No | NULL | Settlement number | PMT-2501-00789 | For display |
| settlement_date | DATE | No | NULL | Settlement date | 2025-11-20 | When settled |
| settlement_amount | NUMERIC(15,2) | No | NULL | Settlement foreign amount | 900.00 | Same as original typically |
| settlement_exchange_rate | NUMERIC(18,8) | No | NULL | Settlement rate | 1.28000000 | When settled |
| settlement_base_amount | NUMERIC(15,2) | No | NULL | Settlement base amount | 1152.00 | At settlement rate |
| revaluation_id | UUID | No | NULL | Period-end revaluation | 550e8400-... | For unrealized G/L |
| revaluation_line_id | UUID | No | NULL | Revaluation line | 550e8400-... | For unrealized G/L |
| revaluation_date | DATE | No | NULL | Revaluation date | 2025-11-30 | Period-end date |
| rate_change_percentage | NUMERIC(10,6) | Yes | - | Rate change % | 0.390196 (0.39%), -0.200000 | (new-old)/old |
| gl_account_id | UUID | No | NULL | GL account affected | 550e8400-... (1200 AR) | Foreign key to gl_accounts |
| gl_account_code | VARCHAR(50) | No | NULL | Account code | 1200, 2100 | For display |
| gain_loss_gl_account_id | UUID | Yes | - | G/L posting account | 550e8400-... (7200) | Foreign key to gl_accounts |
| gain_loss_gl_account_code | VARCHAR(50) | Yes | - | G/L account code | 7200 (Realized), 7210 (Unrealized) | For display |
| journal_entry_id | UUID | No | NULL | Posted journal entry | 550e8400-... | Foreign key to journal_entries |
| journal_entry_number | VARCHAR(50) | No | NULL | JE number | JE-2501-011234 | For display |
| journal_entry_line_id | UUID | No | NULL | Specific JE line | 550e8400-... | Foreign key to journal_entry_lines |
| counterparty_type | VARCHAR(50) | No | NULL | Other party type | Vendor, Customer | Who transaction is with |
| counterparty_id | UUID | No | NULL | Other party ID | 550e8400-... | Vendor/customer ID |
| counterparty_name | VARCHAR(255) | No | NULL | Other party name | Fresh Farm Suppliers UK | For display |
| department_id | UUID | No | NULL | Department | 550e8400-... | Foreign key to departments |
| location_id | UUID | No | NULL | Location | 550e8400-... | Foreign key to locations |
| is_reversed | BOOLEAN | Yes | false | Whether gain/loss reversed | false, true | For unrealized |
| reversed_on_date | DATE | No | NULL | When reversed | 2025-12-01 | Next period |
| reversed_by_entry_id | UUID | No | NULL | Reversal JE | 550e8400-... | Foreign key to journal_entries |
| description | VARCHAR(500) | Yes | - | Gain/loss description | Realized loss on GBP payment | Non-empty |
| notes | TEXT | No | NULL | Additional notes | Part of bulk payment batch | Max 2000 chars |
| metadata | JSONB | No | {} | Flexible additional data | {"contract": "CNT-2501-0001"} | Valid JSON object |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-11-12T10:30:00Z | When logged |
| created_by | VARCHAR(50) | Yes | System | Creator | System, User:john.doe | System or user |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `log_number`: Must be unique across all log entries

**Foreign Keys**:
- `currency_code` → `currencies.currency_code` ON DELETE RESTRICT
- `original_transaction_id` → `foreign_currency_transactions.id` ON DELETE SET NULL
- `settlement_transaction_id` → `foreign_currency_transactions.id` ON DELETE SET NULL
- `revaluation_id` → `currency_revaluations.id` ON DELETE SET NULL
- `gl_account_id` → `gl_accounts.id` ON DELETE RESTRICT
- `gain_loss_gl_account_id` → `gl_accounts.id` ON DELETE RESTRICT
- `journal_entry_id` → `journal_entries.id` ON DELETE SET NULL

**Check Constraints**:
- `gain_loss_type` IN ('Realized', 'Unrealized')
- `event_type` IN ('Payment', 'Receipt', 'Revaluation', 'Settlement', 'Adjustment')
- `is_gain` = (`gain_loss_amount_base` > 0)
- If `gain_loss_type` = 'Realized', then `settlement_date` IS NOT NULL
- If `gain_loss_type` = 'Unrealized', then `revaluation_id` IS NOT NULL
- If `is_reversed` = true, then `reversed_on_date` IS NOT NULL

**Business Rules**:
- Realized gain/loss recorded when transaction settled
- Unrealized gain/loss recorded at period-end revaluation
- Unrealized gain/loss must be reversed in next period
- One log entry per gain/loss event
- Audit trail complete with all source references

---

### Entity: currency_providers

**Description**: Configuration for external exchange rate providers including API endpoints, authentication, supported currencies, and update frequencies. Enables automated rate retrieval from multiple sources with failover support.

**Business Purpose**: Maintains configuration for external exchange rate APIs, enabling automated rate updates with minimal manual intervention. Supports multiple providers with priority-based failover and comprehensive monitoring.

**Data Ownership**: Treasury Manager (configuration), IT Department (API credentials)

**Access Pattern**:
- Primary: Query by is_active = true AND priority ASC (provider selection)
- Secondary: Query by provider_code (specific provider lookup)
- Tertiary: Query by supported_currencies @> '{GBP}' (currency-specific)
- Monitoring: Query by last_successful_call for health checks

**Data Volume**: Very low (~3-10 providers per organization)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| provider_code | VARCHAR(50) | Yes | - | Unique provider identifier | BOE, ECB, OXR | Unique, 2-50 chars |
| provider_name | VARCHAR(255) | Yes | - | Provider full name | Bank of England, European Central Bank | Non-empty |
| provider_type | VARCHAR(50) | Yes | - | Type of provider | Central Bank, Commercial, Aggregator | Must be from enum |
| api_base_url | VARCHAR(500) | Yes | - | Base API endpoint | https://api.bankofengland.co.uk/v1/ | Valid URL |
| api_version | VARCHAR(20) | Yes | - | API version | v1, v2.0 | Version identifier |
| authentication_type | VARCHAR(50) | Yes | None | Auth method | API Key, OAuth2, Basic, None | Must be from enum |
| api_key | VARCHAR(500) | No | NULL | API key (encrypted) | ***encrypted*** | Encrypted at rest |
| api_secret | VARCHAR(500) | No | NULL | API secret (encrypted) | ***encrypted*** | Encrypted at rest |
| oauth_config | JSONB | No | NULL | OAuth configuration | {"client_id": "...", "token_url": "..."} | If OAuth2 |
| supported_currencies | VARCHAR[] | Yes | {} | Currency codes supported | {GBP,EUR,JPY,CHF} | Array of ISO codes |
| supported_currency_pairs | JSONB | No | NULL | Specific pairs supported | [{"from":'GBP','to':'USD'}] | Array of pairs |
| base_currency | VARCHAR(3) | Yes | USD | Provider's base currency | USD, EUR | ISO code |
| rate_frequency | VARCHAR(20) | Yes | Daily | Update frequency | Hourly, Daily, Real-time | Must be from enum |
| update_schedule | VARCHAR(100) | No | NULL | Cron expression | 0 */1 * * * (hourly) | Cron format |
| rate_type_provided | VARCHAR(50) | Yes | - | Type of rates | Spot, Bid/Ask, Mid | Must be from enum |
| precision_decimals | INTEGER | Yes | 8 | Decimal precision | 6, 8, 10 | 4-10 |
| rate_lag_minutes | INTEGER | Yes | 0 | Typical lag time | 0 (real-time), 15, 60 | Minutes behind |
| data_retention_days | INTEGER | Yes | 7 | Historical data available | 7, 30, 365 | Provider limit |
| priority | INTEGER | Yes | - | Provider priority | 1 (primary), 2 (backup), 3 | Lower = higher priority |
| is_active | BOOLEAN | Yes | true | Whether provider enabled | true, false | Active providers only |
| is_primary | BOOLEAN | Yes | false | Primary provider | true, false | Only one primary |
| auto_failover_enabled | BOOLEAN | Yes | true | Automatic failover | true, false | Switch on failure |
| max_retries | INTEGER | Yes | 3 | Retry attempts on failure | 3, 5 | Before failover |
| retry_backoff_seconds | INTEGER | Yes | 10 | Backoff between retries | 10, 30, 60 | Exponential backoff |
| timeout_seconds | INTEGER | Yes | 30 | API call timeout | 30, 60 | Request timeout |
| rate_limit_per_hour | INTEGER | No | NULL | API rate limit | 1000, 5000 | Requests per hour |
| rate_limit_per_day | INTEGER | No | NULL | Daily rate limit | 10000, 50000 | Requests per day |
| monthly_quota | INTEGER | No | NULL | Monthly API calls | 100000, 500000 | If applicable |
| cost_per_call | NUMERIC(10,4) | No | NULL | Cost per API call | 0.0010, 0.0000 | Pricing |
| monthly_cost_limit | NUMERIC(10,2) | No | NULL | Monthly budget cap | 100.00 | Cost limit |
| health_check_enabled | BOOLEAN | Yes | true | Monitor provider health | true, false | Automated checks |
| health_check_frequency_minutes | INTEGER | Yes | 15 | Health check interval | 15, 30, 60 | Minutes |
| last_health_check | TIMESTAMPTZ | No | NULL | Last health check | 2025-11-12T10:00:00Z | Timestamp |
| health_status | VARCHAR(20) | Yes | Unknown | Current health | Healthy, Degraded, Down, Unknown | Must be from enum |
| consecutive_failures | INTEGER | Yes | 0 | Failure counter | 0, 3, 10 | Reset on success |
| last_successful_call | TIMESTAMPTZ | No | NULL | Last success | 2025-11-12T10:30:00Z | Timestamp |
| last_failed_call | TIMESTAMPTZ | No | NULL | Last failure | 2025-11-12T09:00:00Z | Timestamp |
| total_calls_today | INTEGER | Yes | 0 | Today's call count | 24, 100 | Reset daily |
| total_calls_month | INTEGER | Yes | 0 | Month's call count | 720, 3000 | Reset monthly |
| success_rate_7d | NUMERIC(5,2) | Yes | 0.00 | 7-day success rate | 99.50, 95.00 | Percentage |
| average_response_time_ms | INTEGER | Yes | 0 | Average response time | 150, 500 | Milliseconds |
| provider_config | JSONB | No | {} | Additional config | {"headers": {"X-Custom": "value"}} | Provider-specific |
| alerting_config | JSONB | No | {} | Alert settings | {"email": "treasury@..."} | Notification config |
| description | TEXT | No | NULL | Provider description | Primary provider for GBP rates | Max 500 chars |
| notes | TEXT | No | NULL | Internal notes | Contact: John Smith, Phone: ... | Max 2000 chars |
| is_test_mode | BOOLEAN | Yes | false | Test mode enabled | false, true | For testing |
| effective_date | DATE | Yes | - | Date provider activated | 2025-01-01 | When enabled |
| inactive_date | DATE | No | NULL | Date provider deactivated | 2025-12-31 | If inactive |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-01T00:00:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:30:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `provider_code`: Must be unique
- `priority`: Priority unique across active providers
- Only one provider can have `is_primary` = true

**Check Constraints**:
- `provider_type` IN ('Central Bank', 'Commercial', 'Aggregator', 'Internal')
- `authentication_type` IN ('None', 'API Key', 'OAuth2', 'Basic Auth')
- `rate_frequency` IN ('Real-time', 'Hourly', 'Daily', 'Weekly')
- `health_status` IN ('Healthy', 'Degraded', 'Down', 'Unknown')
- `priority` >= 1
- `precision_decimals` BETWEEN 4 AND 10
- `success_rate_7d` BETWEEN 0 AND 100
- If `is_active` = false, then `inactive_date` IS NOT NULL

**Business Rules**:
- Only one primary provider allowed
- Active providers must have health checks enabled
- API credentials encrypted at rest
- Automatic failover to next priority on repeated failures
- Rate limits enforced to prevent quota exhaustion

---

### Entity: multi_currency_bank_accounts

**Description**: Bank account master data with currency designation for multi-currency cash management. Each record represents a bank account in a specific currency with balance tracking and reconciliation support.

**Business Purpose**: Enables multi-currency cash positioning, bank reconciliation, and cash flow management. Supports foreign currency payments and receipts with proper bank account designation.

**Data Ownership**: Treasury Manager (configuration), Accountant (transactions)

**Access Pattern**:
- Primary: Query by currency_code (accounts by currency)
- Secondary: Query by is_active = true (active accounts)
- Tertiary: Query by bank_name (accounts by bank)
- High-frequency: Balance queries for cash position reports

**Data Volume**: Low (~10-50 bank accounts per organization)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| account_code | VARCHAR(50) | Yes | - | Internal account code | BA-USD-001, BA-GBP-NAT | Unique |
| account_name | VARCHAR(255) | Yes | - | Account descriptive name | NatWest GBP Operating Account | Non-empty |
| currency_code | VARCHAR(3) | Yes | - | Account currency | USD, GBP, EUR, JPY | Foreign key to currencies |
| bank_name | VARCHAR(255) | Yes | - | Bank institution name | NatWest, HSBC, Chase | Non-empty |
| bank_code | VARCHAR(50) | No | NULL | Bank identifier | NWBKGB2L | SWIFT/BIC code |
| branch_name | VARCHAR(255) | No | NULL | Branch name | London Main Branch | If applicable |
| branch_code | VARCHAR(50) | No | NULL | Branch identifier | 600987 | Sort code, routing |
| account_number | VARCHAR(100) | Yes | - | Bank account number (encrypted) | ***encrypted*** | Encrypted at rest |
| iban | VARCHAR(50) | No | NULL | IBAN number | GB29NWBK60161331926819 | If applicable |
| swift_code | VARCHAR(20) | No | NULL | SWIFT/BIC code | NWBKGB2L | For international |
| account_type | VARCHAR(50) | Yes | - | Type of account | Operating, Savings, Payroll | Must be from enum |
| gl_account_id | UUID | Yes | - | Linked GL account | 550e8400-... (1110 Cash) | Foreign key to gl_accounts |
| gl_account_code | VARCHAR(50) | Yes | - | GL account code | 1110, 1111 | For display |
| current_balance_foreign | NUMERIC(15,2) | Yes | 0.00 | Balance in account currency | 50000.00 | Current balance |
| current_balance_base | NUMERIC(15,2) | Yes | 0.00 | Balance in base currency | 63750.00 | Converted balance |
| last_balance_update | TIMESTAMPTZ | No | NULL | Last balance refresh | 2025-11-12T08:00:00Z | When updated |
| opening_balance_foreign | NUMERIC(15,2) | Yes | 0.00 | Opening balance (period) | 45000.00 | Period start |
| opening_balance_base | NUMERIC(15,2) | Yes | 0.00 | Opening balance (base) | 57375.00 | Period start |
| opening_balance_date | DATE | Yes | - | Period start date | 2025-11-01 | Typically month start |
| overdraft_limit | NUMERIC(15,2) | No | NULL | Overdraft facility | 10000.00 | If applicable |
| minimum_balance_required | NUMERIC(15,2) | No | NULL | Minimum balance | 5000.00 | Bank requirement |
| interest_rate | NUMERIC(5,4) | No | NULL | Interest rate | 2.5000 (2.5%) | Annual rate |
| is_active | BOOLEAN | Yes | true | Whether account active | true, false | Active accounts |
| is_primary | BOOLEAN | Yes | false | Primary account for currency | true, false | One per currency |
| allow_online_banking | BOOLEAN | Yes | false | Online access enabled | true, false | For API integration |
| api_integration_enabled | BOOLEAN | Yes | false | API integration | true, false | Automated statements |
| api_credentials | JSONB | No | NULL | API authentication (encrypted) | ***encrypted*** | Encrypted config |
| last_statement_import | TIMESTAMPTZ | No | NULL | Last import | 2025-11-12T07:00:00Z | When imported |
| last_statement_date | DATE | No | NULL | Last statement date | 2025-11-11 | Statement period |
| last_reconciliation_date | DATE | No | NULL | Last reconciled | 2025-11-10 | Last reconciliation |
| unreconciled_items_count | INTEGER | Yes | 0 | Unreconciled count | 5 | Outstanding items |
| unreconciled_amount | NUMERIC(15,2) | Yes | 0.00 | Unreconciled total | 250.00 | Outstanding amount |
| contact_person | VARCHAR(255) | No | NULL | Bank contact name | John Smith | Relationship manager |
| contact_email | VARCHAR(255) | No | NULL | Bank contact email | john.smith@bank.com | Valid email |
| contact_phone | VARCHAR(50) | No | NULL | Bank contact phone | +44 20 1234 5678 | Phone format |
| description | TEXT | No | NULL | Account description | Main operating account for UK operations | Max 500 chars |
| notes | TEXT | No | NULL | Internal notes | Monthly service charge: £50 | Max 2000 chars |
| metadata | JSONB | No | {} | Additional account data | {"account_opening_date": "2020-01-15"} | Valid JSON |
| effective_date | DATE | Yes | - | Date account activated | 2025-01-01 | When opened |
| inactive_date | DATE | No | NULL | Date account closed | 2025-12-31 | If closed |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-01T00:00:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:30:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `account_code`: Must be unique
- `(bank_code, account_number)`: Unique bank account
- `(currency_code, is_primary = true)`: Only one primary account per currency

**Foreign Keys**:
- `currency_code` → `currencies.currency_code` ON DELETE RESTRICT
- `gl_account_id` → `gl_accounts.id` ON DELETE RESTRICT

**Check Constraints**:
- `account_type` IN ('Operating', 'Savings', 'Payroll', 'Investment', 'Escrow')
- `current_balance_foreign` >= `overdraft_limit` * -1 (if overdraft exists)
- `interest_rate` BETWEEN 0 AND 100
- If `is_active` = false, then `inactive_date` IS NOT NULL
- If `api_integration_enabled` = true, then `api_credentials` IS NOT NULL

**Business Rules**:
- One primary account per currency
- Account number and API credentials encrypted at rest
- Balance updated daily from bank statements or API
- Cannot close account with non-zero balance
- Reconciliation required monthly

---

## Relationships

### One-to-Many Relationships

#### currencies → exchange_rates

**Relationship Type**: One currency has many exchange rate records

**Foreign Key**: `exchange_rates.from_currency` and `exchange_rates.to_currency` reference `currencies.currency_code`

**Cardinality**:
- One currency can have: unlimited rate records (365+ per year)
- Each rate must reference: exactly 2 currencies (from and to)

**Cascade Behavior**:
- **On Delete**: RESTRICT - Cannot delete currency with existing rates
- **On Update**: CASCADE - Currency code changes propagate

**Business Rule**: Each currency pair has one current rate and unlimited historical rates. Rates expire after TTL and are replaced with new rates.

**Example Scenario**:
```
Currency: GBP
Exchange Rates:
  - GBP/USD: 1.2750 (2025-11-12 10:00)
  - GBP/USD: 1.2800 (2025-11-12 11:00) - current
  - GBP/EUR: 1.1750 (2025-11-12 10:00)
  - GBP/EUR: 1.1800 (2025-11-12 11:00) - current

When rate updated:
  - Old rate marked is_current = false
  - Old rate copied to exchange_rate_history
  - New rate created with is_current = true
```

**Common Query Patterns**:
- Get current rates for currency: WHERE from_currency = 'GBP' AND is_current = true
- Get rate for date: WHERE from_currency AND to_currency AND rate_date = date
- Get rate history: WHERE from_currency AND to_currency ORDER BY rate_date DESC

---

#### currency_revaluations → revaluation_lines

**Relationship Type**: One revaluation has many revaluation line items

**Foreign Key**: `revaluation_lines.revaluation_id` references `currency_revaluations.id`

**Cardinality**:
- One revaluation has: 10 to 500 lines (one per account with foreign currency balance)
- Each line belongs to: exactly 1 revaluation

**Cascade Behavior**:
- **On Delete**: CASCADE - Deleting revaluation deletes all lines
- **On Update**: CASCADE - Revaluation changes propagate to lines

**Business Rule**: Each line represents one account with foreign currency balance. Zero gain/loss lines may be excluded based on configuration.

**Example Scenario**:
```
Revaluation: Nov 2025 Period-End
Lines:
  - Line 1: 1200 AR - GBP £15,000 → Gain $100
  - Line 2: 2100 AP - EUR €15,000 → Loss $75
  - Line 3: 1110 Cash - GBP £20,000 → Gain $100
  - Total: Net Gain $125

When revaluation posted:
  - All lines post journal entries simultaneously
  - Revaluation status → Posted
  - Reversal automatically scheduled for next period
```

**Common Query Patterns**:
- Get all lines for revaluation: WHERE revaluation_id = {id}
- Get lines by currency: WHERE revaluation_id = {id} AND currency_code = 'GBP'
- Get material lines: WHERE revaluation_id = {id} AND is_material = true
- Aggregate by account type: GROUP BY account_type

---

### Hierarchical Relationships (Self-Referencing)

#### currency_revaluations → currency_revaluations (Reversal Chain)

**Relationship Type**: Revaluation can have a reversal revaluation (self-referencing)

**Foreign Key**: `currency_revaluations.reversal_of_id` references `currency_revaluations.id`
**Foreign Key**: `currency_revaluations.reversed_by_id` references `currency_revaluations.id`

**Hierarchy Characteristics**:
- **Depth**: 2 levels maximum (original → reversal)
- **Root Nodes**: Original revaluations (reversal_of_id = NULL)
- **Reversal Nodes**: Reversal entries (reversal_of_id IS NOT NULL)
- **Cycles**: Prevented by business logic (reversal cannot be reversed)

**Business Rule**: Each period-end revaluation must be reversed at start of next period. Reversal is opposite sign of original.

**Example Scenario**:
```
Original Revaluation:
  ID: 550e8400-...001
  Date: 2025-11-30
  Net Gain: $125
  Status: Posted
  Reversal_of_ID: NULL
  Reversed_by_ID: 550e8400-...002

Reversal Revaluation:
  ID: 550e8400-...002
  Date: 2025-12-01
  Net Gain: -$125 (opposite sign)
  Status: Posted
  Is_Reversal: true
  Reversal_of_ID: 550e8400-...001
  Reversed_by_ID: NULL
```

**Common Query Patterns**:
- Get original revaluation: WHERE id = {original_id}
- Get reversal for original: WHERE reversal_of_id = {original_id}
- Get unreversed revaluations: WHERE reversed_by_id IS NULL AND is_reversal = false
- Get revaluation pairs: SELECT original.*, reversal.* WHERE reversal.reversal_of_id = original.id

---

## Data Indexing Strategy

### Primary Indexes

**Primary Key Indexes** (Automatic):
- All `id` fields: B-tree index, O(log n) lookup
- UUID type for distributed system compatibility

### Business Key Indexes

**currencies table**:
- `currency_code`: Unique B-tree index (ISO 4217 lookup)
- `(is_base_currency, is_active)`: Partial index WHERE is_active = true

**exchange_rates table**:
- `(from_currency, to_currency, rate_date, rate_time)`: Unique composite index
- `(from_currency, to_currency, is_current)`: Partial index WHERE is_current = true
- `rate_date DESC`: B-tree index for temporal queries

**foreign_currency_transactions table**:
- `transaction_number`: B-tree index for user searches
- `(transaction_currency, posting_date)`: Composite index for period analysis
- `(source_document_type, source_document_id)`: Composite index for traceability

**currency_revaluations table**:
- `revaluation_number`: Unique B-tree index
- `(accounting_period, is_reversal)`: Composite index

### Foreign Key Indexes

**All foreign keys automatically indexed**:
- `foreign_currency_transactions.transaction_currency` → `currencies.currency_code`
- `foreign_currency_transactions.rate_id` → `exchange_rates.id`
- `revaluation_lines.revaluation_id` → `currency_revaluations.id`
- `exchange_gain_loss_log.currency_code` → `currencies.currency_code`

### Composite Indexes

**exchange_rates table**:
- `(from_currency, to_currency, rate_date DESC)`: Currency pair history
- `(rate_source, rate_date DESC)`: Provider analysis
- `(is_current, valid_until)`: Active rate expiry monitoring

**foreign_currency_transactions table**:
- `(accounting_period, transaction_currency)`: Period currency analysis
- `(transaction_currency, is_settled)`: Open items by currency
- `(gl_account_id, transaction_date)`: Account activity

**revaluation_lines table**:
- `(revaluation_id, currency_code)`: Lines by currency
- `(gl_account_id, currency_code)`: Account currency history

**exchange_gain_loss_log table**:
- `(accounting_period, gain_loss_type)`: Period G/L analysis
- `(currency_code, gain_loss_type)`: Currency impact analysis
- `(counterparty_id, log_date DESC)`: Counterparty analysis

### Partial Indexes

**Active Records**:
- `currencies` WHERE `is_active` = true
- `exchange_rates` WHERE `is_current` = true
- `currency_providers` WHERE `is_active` = true
- `multi_currency_bank_accounts` WHERE `is_active` = true

**Unsettled Transactions**:
- `foreign_currency_transactions` WHERE `is_settled` = false

**Posted Revaluations**:
- `currency_revaluations` WHERE `status` = 'Posted'

### Full-Text Search Indexes

**currencies table**:
- GIN index on `to_tsvector('english', currency_name)`
- Use case: Search currencies by name

### Performance Targets

- Simple currency lookup: <5ms
- Exchange rate lookup (current): <10ms (cached), <50ms (database)
- Foreign transaction query by period: <100ms
- Revaluation calculation: <30 seconds for 1000 accounts
- Gain/loss log aggregation: <500ms for monthly data

---

## Data Integrity Rules

### Referential Integrity

**Foreign Key Constraints**:
- All currency_code references enforce valid currencies
- Cannot delete currency with existing transactions or rates
- Cannot delete exchange rate used in transactions
- CASCADE deletes for revaluation lines when parent deleted
- RESTRICT deletes for financial transaction references

**Orphan Prevention**:
- No exchange rates without valid currencies
- No foreign currency transactions without valid currencies and accounts
- No revaluation lines without parent revaluation
- No gain/loss log entries without valid currency

### Domain Integrity

**Data Type Enforcement**:
- Currency codes: VARCHAR(3), uppercase A-Z only
- Exchange rates: NUMERIC(18,8) with 8 decimal precision
- Amounts: NUMERIC(15,2) with 2 decimal precision
- Dates: DATE type for business dates, TIMESTAMPTZ for audit
- UUIDs: Valid UUID format v4

**Check Constraints**:
- Currency codes must be 3 characters, uppercase
- Exchange rates must be positive, between 0.0001 and 10,000
- Amounts must be positive for transaction amounts
- Gain/loss amounts can be negative (losses)
- Date ranges: effective_date <= inactive_date
- Status values from enumerated lists

**NOT NULL Constraints**:
- Required: id, currency_code, exchange_rate, transaction_amount, base_amount
- Optional: settlement fields (until settled), reversal fields (until reversed)

**DEFAULT Values**:
- `is_active`: true
- `is_base_currency`: false
- `created_at`, `updated_at`: NOW()
- `metadata`: {} (empty JSON)
- Numeric amounts: 0.00

**UNIQUE Constraints**:
- currency_code: unique across all currencies
- Only one base currency per organization
- Only one current rate per currency pair
- Exchange rate (from, to, date, time) unique

### Entity Integrity

**Primary Key Requirements**:
- All tables have UUID primary key
- Primary keys immutable (never updated)
- Primary keys always NOT NULL and UNIQUE

**Audit Trail Requirements** (All tables):
- `created_at`: Creation timestamp (immutable)
- `created_by`: Creator user ID (immutable)
- `updated_at`: Last modification timestamp (auto-updated)
- `updated_by`: Last modifier user ID (auto-updated)

**Immutability Requirements**:
- Exchange rates: Immutable once used in transactions
- Historical rates: Completely immutable
- Posted journal entries: Immutable (reversal only)
- Realized gain/loss amounts: Immutable

### Data Quality Constraints

**Value Range Constraints**:
- Exchange rates: 0.0001 to 10,000 (reasonableness)
- Currency decimals: 0 to 4 (ISO 4217 standard)
- Variance threshold: >5% requires approval
- Rounding precision: 0.01 to 1.00

**Format Constraints**:
- Currency codes: ISO 4217 format (3 uppercase letters)
- Revaluation numbers: REVAL-YYYY-MM-NNN
- Transaction numbers: Following organizational patterns
- Accounting periods: YYYY-MM format

**Business Logic Constraints**:
- base_amount = transaction_amount * exchange_rate (within 0.01 tolerance)
- Only one base currency per organization
- Only one current rate per currency pair
- Settled transactions must have settlement date and rate
- Unrealized gain/loss must have revaluation reference

---

## Database Triggers and Automation

### Automatic Timestamp Updates

**Updated At Trigger**:
- **Tables**: All tables with `updated_at` field
- **Trigger Event**: BEFORE UPDATE
- **Behavior**: Automatically sets `updated_at` = NOW()
- **Benefits**: Accurate last-modified tracking

**Created At Protection**:
- **Tables**: All tables
- **Trigger Event**: BEFORE UPDATE
- **Behavior**: Prevents modification of `created_at` and `created_by`
- **Benefits**: Immutable audit trail

### Audit Logging

**Change Tracking Trigger**:
- **Tables**: currencies, exchange_rates, foreign_currency_transactions, currency_revaluations
- **Trigger Event**: AFTER INSERT OR UPDATE OR DELETE
- **Audit Table**: `audit_log` table stores complete change history
- **Captured Data**:
  - Operation type: INSERT, UPDATE, DELETE
  - User who performed action
  - Timestamp of change
  - Old values (before)
  - New values (after)
  - Changed fields only

**Use Cases**:
- Compliance and regulatory requirements
- Exchange rate change history
- Transaction modification tracking
- Revaluation audit trail
- Security investigation

### Data Validation Triggers

**Exchange Rate Validation**:
- **Table**: exchange_rates
- **Trigger Event**: BEFORE INSERT OR UPDATE
- **Validations**:
  - Rate must be positive and within bounds (0.0001 to 10,000)
  - Variance check: Flag if change >5% from previous rate
  - Inverse rate calculation: inverse_rate = 1 / exchange_rate
  - Approval requirement: If variance >5%, set requires_approval = true
- **Error Handling**: Raise exception with clear error message

**Dual Currency Validation**:
- **Table**: foreign_currency_transactions
- **Trigger Event**: BEFORE INSERT OR UPDATE
- **Validations**:
  - base_amount = transaction_amount * exchange_rate (within 0.01 tolerance)
  - transaction_currency != base_currency
  - Exchange rate must exist for transaction date
  - Outstanding amount <= transaction amount
- **Error Handling**: Reject transaction with validation error

**Base Currency Protection**:
- **Table**: currencies
- **Trigger Event**: BEFORE UPDATE OR DELETE
- **Validations**:
  - Cannot change is_base_currency if transactions exist
  - Cannot deactivate currency with open balances
  - Cannot delete currency referenced in transactions
- **Error Handling**: Prevent operation with detailed error

### Cascade Operations

**Exchange Rate Archival**:
- **Table**: exchange_rates
- **Trigger Event**: AFTER UPDATE (when is_current changed from true to false)
- **Behavior**: Automatically copy expired rate to exchange_rate_history
- **Benefits**: Complete rate history maintained

**Revaluation Reversal Scheduling**:
- **Table**: currency_revaluations
- **Trigger Event**: AFTER UPDATE (when status changed to 'Posted')
- **Behavior**: Create scheduled job for automatic reversal on reversal_scheduled_date
- **Benefits**: Automatic IAS 21 compliance

### Computed Fields

**Inverse Rate Calculation**:
- **Table**: exchange_rates
- **Trigger Event**: BEFORE INSERT OR UPDATE
- **Calculation**: inverse_rate = 1 / exchange_rate
- **Benefits**: Bidirectional conversions without additional lookups

**Base Amount Calculation**:
- **Table**: foreign_currency_transactions
- **Trigger Event**: BEFORE INSERT OR UPDATE
- **Calculation**: base_amount = transaction_amount * exchange_rate
- **Benefits**: Consistent dual currency calculation

**Gain/Loss Calculation**:
- **Table**: foreign_currency_transactions
- **Trigger Event**: AFTER UPDATE (when settlement fields populated)
- **Calculation**: realized_gain_loss = settlement_base_amount - original_base_amount
- **Behavior**: Create entry in exchange_gain_loss_log
- **Benefits**: Automatic realized gain/loss tracking

**Net Unrealized Calculation**:
- **Table**: currency_revaluations
- **Trigger Event**: AFTER INSERT on revaluation_lines
- **Calculation**: Aggregate total_unrealized_gain and total_unrealized_loss from lines
- **Benefits**: Real-time revaluation totals

### Notification Triggers

**Large Variance Alert**:
- **Table**: exchange_rates
- **Trigger Event**: AFTER INSERT
- **Condition**: variance_threshold_exceeded = true
- **Action**: Notify Treasury Manager of significant rate change
- **Benefits**: Immediate awareness of unusual rate movements

**Revaluation Impact Alert**:
- **Table**: currency_revaluations
- **Trigger Event**: AFTER UPDATE (when status = 'Calculated')
- **Condition**: ABS(net_unrealized_gain_loss) > $10,000
- **Action**: Notify CFO for review and approval
- **Benefits**: Management awareness of material impacts

**Provider Health Degradation**:
- **Table**: currency_providers
- **Trigger Event**: AFTER UPDATE (when health_status changes to 'Down')
- **Action**: Alert Treasury Manager and trigger failover to backup provider
- **Benefits**: Automatic failover and issue notification

---

## Performance Considerations

### Query Performance Targets

**Response Time Objectives**:
- **Currency lookup** (by code): < 5ms (single record, indexed)
- **Exchange rate lookup** (current rate): < 10ms (cached), < 50ms (database)
- **Foreign transaction list** (by period): < 100ms (filtered, paginated)
- **Revaluation calculation** (100 accounts): < 10 seconds
- **Gain/loss log aggregation** (monthly): < 500ms
- **Multi-currency balance report**: < 2 seconds

**Achieving Targets**:
- Redis caching for current exchange rates (1-hour TTL)
- Indexed foreign keys on all relationship fields
- Composite indexes on common query patterns
- Materialized views for currency exposure aggregations
- Connection pooling with 20-50 connections
- Read replicas for reporting queries

### Table Size Projections

#### currencies

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Year 1 | 10 | 50 KB | Core currencies only |
| Year 3 | 15 | 75 KB | Additional regional currencies |
| Year 5 | 20 | 100 KB | Stable state |

#### exchange_rates

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Month 1 | 200 | 2 MB | 10 currency pairs × 20 updates/day |
| Year 1 | 2,400 | 24 MB | Current rates only, hourly updates |
| Year 3 | 7,200 | 72 MB | With cleanup of expired rates |
| Year 5 | 12,000 | 120 MB | Steady state with archival |

#### exchange_rate_history

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Year 1 | 73,000 | 730 MB | 10 pairs × 20 updates/day × 365 days |
| Year 3 | 219,000 | 2.2 GB | 3 years of history |
| Year 5 | 365,000 | 3.7 GB | 5 years of history |
| Year 7+ | 511,000 | 5.1 GB | 7-year retention cap |

#### foreign_currency_transactions

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Month 1 | 5,000 | 50 MB | ~160 transactions/day |
| Year 1 | 60,000 | 600 MB | Permanent retention |
| Year 3 | 180,000 | 1.8 GB | 3 years of transactions |
| Year 5 | 300,000 | 3.0 GB | 5 years of transactions |
| Year 7+ | 420,000 | 4.2 GB | Permanent retention |

#### currency_revaluations

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Year 1 | 24 | 2 MB | 12 revaluations + 12 reversals |
| Year 3 | 72 | 6 MB | 3 years |
| Year 5 | 120 | 10 MB | 5 years |
| Year 7+ | 168 | 14 MB | Permanent retention |

#### revaluation_lines

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Year 1 | 1,200 | 12 MB | 50 accounts × 24 revaluations |
| Year 3 | 3,600 | 36 MB | 3 years |
| Year 5 | 6,000 | 60 MB | 5 years |
| Year 7+ | 8,400 | 84 MB | Permanent retention |

#### exchange_gain_loss_log

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Month 1 | 2,000 | 20 MB | Realized + unrealized |
| Year 1 | 24,000 | 240 MB | Permanent retention |
| Year 3 | 72,000 | 720 MB | 3 years |
| Year 5 | 120,000 | 1.2 GB | 5 years |
| Year 7+ | 168,000 | 1.7 GB | Permanent retention |

**Total Storage Projection (Year 5)**: ~10-12 GB including indexes (3x data size)

### Optimization Techniques

**Query Optimization**:
- Use EXPLAIN ANALYZE for slow queries
- Optimize JOIN conditions with proper indexes
- Use LIMIT and OFFSET for pagination
- Avoid SELECT *, specify needed columns
- Use WHERE clause to filter early

**Caching Strategy**:
- **Redis for exchange rates**: 1-hour TTL for current rates
- **Application-level caching**: Currency master data (24-hour TTL)
- **Query result caching**: Frequently accessed reports (15-minute TTL)
- **Materialized views**: Currency exposure, multi-currency balances (refresh hourly)

**Partitioning** (for exchange_rate_history > 500K rows):
- Partition by year: exchange_rate_history_2025, exchange_rate_history_2026, etc.
- Partition by currency: High-volume currencies in separate partitions
- Benefits: Faster queries on recent data, simplified archival

**Connection Pooling**:
- Pool size: 20-50 connections (based on concurrent users)
- Idle timeout: 300 seconds
- Max lifetime: 3600 seconds
- Benefits: Reduced connection overhead, prevents exhaustion

**Batch Operations**:
- Bulk INSERT for historical rate imports (1000 rows per batch)
- Batch UPDATE for balance updates (100 accounts per batch)
- Parallel processing for revaluation calculations

**Read Replicas**:
- Use read replicas for:
  - Multi-currency reports
  - Exchange gain/loss analysis
  - Currency exposure reports
- Primary database for:
  - Transaction posting
  - Revaluation posting
  - Rate updates

---

## Data Archival Strategy

### Archival Policy

**Retention Periods**:
- **Active Data**: Current rates (last 90 days in exchange_rates)
- **Historical Data**: 7 years minimum in exchange_rate_history
- **Permanent Data**: All transactions, revaluations, gain/loss log (never purged)

**Archival Criteria**:
- Exchange rates older than 90 days moved to exchange_rate_history
- Unused rates (usage_count = 0) archived after 30 days
- Expired rates (is_current = false) archived immediately

**Archival Frequency**:
- Daily archival process for expired exchange rates (2 AM UTC)
- Weekly cleanup of unused rates (Sunday 3 AM UTC)
- No archival for transaction tables (permanent retention)

### Archive Table Structure

**exchange_rate_history**:
- Identical schema to exchange_rates
- Additional fields: archived_at, archived_by, archived_reason, retention_until
- Partitioned by year for performance
- Compressed storage (50% space savings)

**Archival Process**:
1. Identify rates for archival (expired, unused, >90 days)
2. Copy rates to exchange_rate_history
3. Verify copy successful (row count match)
4. Delete from exchange_rates (or mark archived)
5. Update archival metadata
6. Log archival operation

**Transaction Safety**:
- Entire process in single transaction
- Rollback on any error
- Verify data integrity before commit
- Log all archival operations

### Archive Data Access

**Querying Historical Rates**:
- Direct query: SELECT * FROM exchange_rate_history WHERE ...
- Union query: (SELECT * FROM exchange_rates) UNION ALL (SELECT * FROM exchange_rate_history)
- View: Create view combining both tables for transparent access

**Archive Data Retrieval**:
- Historical rate lookup for backdated transactions
- Exchange rate trend analysis
- Audit and compliance reporting
- Read-only access for most users

---

## Security Considerations

### Row-Level Security (RLS)

**Purpose**: Control data access based on user role and department

**Policy Types**:
- **Read Policies**: Control which rows users can SELECT
- **Write Policies**: Control which rows users can INSERT/UPDATE
- **Department Isolation**: Users see only their department's transactions
- **Currency Access**: Restrict access to specific currencies by role

**Example Policies**:

**Department Isolation** (foreign_currency_transactions):
- Users see only transactions from their department
- Policy: `department_id = current_user_department_id`
- Exception: Finance Managers see all departments
- Exception: CFO sees all data

**Currency Access** (sensitive currencies):
- Regular users cannot access restricted currencies (e.g., executive comp currencies)
- Policy: `currency_code NOT IN (SELECT * FROM restricted_currencies)`
- Exception: CFO and Controller bypass restriction

**Treasury Access** (exchange_rates, currency_providers):
- Only Treasury Managers can view/edit rate sources and providers
- Policy: `created_by = current_user_id OR user_role = 'treasury_manager'`
- All users can view current rates (read-only)

**Admin Override**:
- CFO and System Admin bypass all RLS policies
- Policy: `USING (true)` for admin roles

### Column-Level Security

**Sensitive Data**:
- Bank account numbers (multi_currency_bank_accounts.account_number)
- API keys and secrets (currency_providers.api_key, api_secret)
- OAuth tokens (currency_providers.oauth_config)

**Access Control**:
- Encrypt sensitive columns at rest (AES-256)
- Decrypt only for authorized roles (Treasury Manager, CFO)
- Mask sensitive data in application logs
- Revoke SELECT on encrypted columns from regular users

**Example Permissions**:
```
Grant Treasury Manager:
  - SELECT on all currency management tables
  - UPDATE on exchange_rates (manual entry only)
  - SELECT, UPDATE on currency_providers (encrypted columns decrypted)

Grant Accountant:
  - SELECT on currencies, exchange_rates (read-only)
  - SELECT, INSERT on foreign_currency_transactions
  - SELECT, INSERT, UPDATE on currency_revaluations (own department)

Grant Regular User:
  - SELECT on currencies (active only)
  - SELECT on exchange_rates (current rates only, no historical)
  - No access to sensitive tables
```

### Data Encryption

**Encryption At Rest**:
- Database-level encryption enabled (AES-256)
- Encrypted columns:
  - multi_currency_bank_accounts.account_number
  - currency_providers.api_key
  - currency_providers.api_secret
  - currency_providers.oauth_config
- Encryption keys managed by AWS KMS or HashiCorp Vault

**Encryption In Transit**:
- All database connections use TLS 1.3
- Certificate-based authentication
- Encrypted connection strings (no plaintext)

**Column-Level Encryption** (extra sensitive data):
- Use pgcrypto extension for column encryption
- Application manages decryption keys
- Encrypt before INSERT, decrypt after SELECT

**Encryption Key Management**:
- Keys stored in AWS KMS or HashiCorp Vault (not in database)
- Automatic key rotation every 90 days
- Multi-factor authentication for key access
- Key access audit logging

### Access Control

**Database Users and Roles**:
- **app_read_only**: SELECT on all tables except sensitive columns
- **app_treasury**: Full access to exchange rates and providers
- **app_finance**: SELECT, INSERT, UPDATE on transaction tables
- **app_admin**: Full access including sensitive data
- **reporting_user**: SELECT on views and materialized views

**Authentication**:
- Strong password policy (12+ chars, complexity requirements)
- Multi-factor authentication for admin access
- Service account credentials rotated every 90 days
- Failed login lockout after 5 attempts

**Authorization**:
- Principle of least privilege (grant minimum necessary)
- Regular access reviews (quarterly)
- Automatic revocation on role change
- Audit trail of all permission changes

**Audit Trail**:
- Log all access attempts to sensitive tables
- Track failed authentication attempts
- Monitor unusual query patterns (bulk exports, off-hours access)
- Alert on security violations

---

## Backup and Recovery

### Backup Strategy

**Full Backups**:
- **Frequency**: Daily at 2 AM UTC (off-peak)
- **Retention**: 30 days online, 90 days in cold storage (AWS Glacier)
- **Method**: PostgreSQL pg_dump with --compress option
- **Location**: S3 bucket in different AWS region

**Incremental Backups**:
- **Frequency**: Every 4 hours
- **Retention**: 7 days
- **Method**: Write-Ahead Log (WAL) archiving
- **Purpose**: Minimize data loss window (4-hour RPO)

**Continuous Archiving**:
- **Method**: WAL streaming to standby server
- **Purpose**: Near-zero Recovery Point Objective
- **Benefit**: Point-in-time recovery to any second

**Backup Verification**:
- Weekly restore test to staging environment
- Automated backup health checks (file size, integrity)
- Alert on backup failures (PagerDuty)

### Backup Contents

**Included**:
- All currency management tables (structure + data)
- Indexes and constraints
- Triggers and stored procedures
- User roles and RLS policies

**Excluded** (stored separately):
- Large attachments (document storage, not database)
- Temporary tables
- Materialized views (can be refreshed)

### Recovery Procedures

**Point-in-Time Recovery** (PITR):
- Restore from full backup
- Replay WAL logs to specific timestamp
- Use case: Recover from accidental revaluation posting
- Recovery Time Objective: < 2 hours

**Full Database Restore**:
- Restore entire database from latest backup
- Use case: Complete database corruption
- RTO: < 4 hours

**Table-Level Recovery**:
- Restore specific table from backup to staging
- Copy needed data back to production
- Use case: Recover accidentally deleted exchange rates
- RTO: < 1 hour

**Disaster Recovery**:
- Failover to standby server in different region
- Automated failover triggers
- Use case: Primary datacenter failure
- RTO: < 30 minutes (automated failover)

### Backup Retention Policy

**Retention Schedule**:
- **Daily backups**: 30 days
- **Weekly backups**: 90 days
- **Monthly backups**: 1 year
- **Yearly backups**: 7 years (compliance requirement)

**Storage Optimization**:
- Compress all backups (gzip level 6)
- Move backups >90 days to cold storage (AWS Glacier)
- Delete expired backups automatically
- Monitor storage costs monthly

---

## Data Migration

### Version 1.0.0 - Initial Schema

**Migration Metadata**:
- **Migration File**: `001_create_currency_management_tables.sql`
- **Date**: 2025-11-12
- **Author**: Finance & Technology Team
- **Purpose**: Initial currency management schema

**Migration Steps** (Description):
1. Create currencies table with ISO 4217 compliance
2. Create exchange_rates table with rate versioning
3. Create exchange_rate_history table for archival
4. Create foreign_currency_transactions table with dual currency storage
5. Create currency_revaluations and revaluation_lines tables
6. Create exchange_gain_loss_log table
7. Create currency_providers table
8. Create multi_currency_bank_accounts table
9. Create all foreign key constraints
10. Create indexes on foreign keys and common query patterns
11. Create triggers for automatic timestamp updates
12. Create triggers for dual currency validation
13. Create triggers for exchange rate archival
14. Create triggers for gain/loss calculation
15. Insert seed data (USD base currency, common currencies)
16. Set up row-level security policies
17. Grant permissions to database roles
18. Create materialized views for currency exposure

**Data Included**:
- Base currency (USD or organization-specific)
- Common currencies (GBP, EUR, JPY, SGD, etc.)
- Default currency provider (Bank of England, ECB)
- Sample exchange rates for testing

**Verification**:
- Verify all tables created with correct structure
- Test constraints (unique, foreign key, check)
- Validate triggers fire correctly
- Confirm indexes created
- Test sample currency conversion

**Rollback Plan**:
- Drop all triggers
- Drop all indexes
- Drop all tables with CASCADE
- Verify clean rollback

---

## Data Quality

### Data Quality Dimensions

**Completeness**:
- All required fields populated (no NULL in NOT NULL columns)
- All currencies have exchange rates for common pairs
- All foreign currency transactions have settlement data (when settled)
- Measured: % of records with all required fields complete

**Accuracy**:
- Exchange rates match provider rates (within 0.01%)
- Dual currency calculations correct (base = foreign * rate, within 0.01 tolerance)
- Gain/loss calculations match manual verification
- Measured: % of records passing validation rules

**Consistency**:
- Inverse rates consistent (inverse_rate = 1 / exchange_rate)
- Revaluation totals match sum of lines
- Gain/loss log matches journal entries
- Measured: % of records passing consistency checks

**Validity**:
- Currency codes comply with ISO 4217
- Exchange rates within reasonable bounds (0.0001 to 10,000)
- Dates are reasonable (not future for historical rates)
- Measured: % of records passing validation rules

**Timeliness**:
- Exchange rates updated within SLA (hourly for auto, daily for manual)
- Revaluations completed by 5th business day of month
- Real-time transaction posting (<5 minutes from event)
- Measured: Average lag between event and data update

**Uniqueness**:
- No duplicate currency codes
- No duplicate current rates for same currency pair
- Business keys unique (revaluation numbers, transaction numbers)
- Measured: % of records with unique business keys

### Data Quality Checks

**Automated Quality Checks** (Run daily):

**Check for Missing Exchange Rates**:
```
Purpose: Ensure all active currency pairs have current rates
Query Logic: SELECT DISTINCT currency_code FROM foreign_currency_transactions
              WHERE NOT EXISTS (SELECT 1 FROM exchange_rates WHERE ...)
Expected: 0 missing rates
Action: Alert Treasury Manager, retrieve missing rates
```

**Check for Stale Exchange Rates**:
```
Purpose: Find rates not updated within expected timeframe
Query Logic: SELECT * FROM exchange_rates
              WHERE is_current = true AND valid_until < NOW()
Expected: 0 expired current rates
Action: Refresh rates immediately, investigate provider issues
```

**Check for Dual Currency Mismatches**:
```
Purpose: Verify base_amount = transaction_amount * exchange_rate
Query Logic: SELECT * FROM foreign_currency_transactions
              WHERE ABS(base_amount - (transaction_amount * exchange_rate)) > 0.01
Expected: 0 mismatches
Action: Investigate calculation errors, correct affected transactions
```

**Check for Unsettled Old Transactions**:
```
Purpose: Find foreign currency transactions not settled after 90 days
Query Logic: SELECT * FROM foreign_currency_transactions
              WHERE is_settled = false AND transaction_date < NOW() - INTERVAL '90 days'
Expected: Review and resolve old open items
Action: Investigate with AP/AR teams, chase or write off
```

**Check for Unreversed Revaluations**:
```
Purpose: Ensure all posted revaluations have been reversed in next period
Query Logic: SELECT * FROM currency_revaluations
              WHERE status = 'Posted' AND reversed_by_id IS NULL
                AND revaluation_date < DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
Expected: 0 unreversed old revaluations
Action: Post missing reversals immediately
```

**Check for Orphaned Revaluation Lines**:
```
Purpose: Find revaluation lines without parent revaluation
Query Logic: SELECT * FROM revaluation_lines
              WHERE NOT EXISTS (SELECT 1 FROM currency_revaluations WHERE id = revaluation_id)
Expected: 0 orphaned lines
Action: Should never happen due to foreign key constraints, investigate if found
```

**Check for Gain/Loss Posting Mismatches**:
```
Purpose: Verify gain/loss log entries match journal entries
Query Logic: Compare exchange_gain_loss_log.gain_loss_amount_base with journal_entry_lines amounts
Expected: 100% match
Action: Investigate posting discrepancies, correct affected entries
```

### Data Quality Monitoring

**Quality Metrics Dashboard**:
- Completeness score by entity (target: >99%)
- Accuracy score by entity (target: >99.9%)
- Exchange rate freshness (target: <60 minutes lag)
- Provider health status (target: >99% uptime)
- Daily transaction volume trends
- Daily gain/loss trends

**Alerting**:
- Alert when exchange rate not updated within 2 hours
- Alert when provider health status = 'Down'
- Alert when large rate variance detected (>5%)
- Alert when revaluation impact >$10,000
- Alert when data quality score drops below 95%

**Reporting**:
- Weekly data quality report (completeness, accuracy, timeliness)
- Monthly currency management metrics (transaction volume, gain/loss)
- Quarterly provider performance review (uptime, accuracy)
- Annual audit report (all quality dimensions)

---

## Testing Data

### Test Data Requirements

**Test Environments**:
- **Development**: Full synthetic test data with known values
- **Staging**: Copy of production data (sanitized)
- **Testing**: Mix of synthetic and realistic data
- **Demo**: Curated realistic data for demonstrations

**Data Sanitization** (for staging):
- Replace real bank account numbers with test accounts
- Mask counterparty names and identifiers
- Replace real amounts with randomized values (maintain relationships)
- Preserve currency codes and exchange rates (use real rates)

### Test Data Generation

**Manual Test Records**:

**Test Currencies**:
```
- USD (Base Currency)
- GBP (British Pound) - Primary foreign currency
- EUR (Euro) - Secondary foreign currency
- JPY (Japanese Yen) - Zero decimal currency
- Test rates: GBP/USD 1.2750, EUR/USD 1.0850, JPY/USD 0.00690
```

**Test Foreign Currency Transactions**:
```
1. GBP Invoice: £900.00 @ 1.2750 = $1,147.50
   Status: Unsettled
   Created: 2025-11-12

2. GBP Payment: £900.00 @ 1.2800 = $1,152.00
   Original: $1,147.50
   Realized Loss: $4.50
   Created: 2025-11-20

3. EUR Invoice: €1,500.00 @ 1.0850 = $1,627.50
   Status: Unsettled
   Created: 2025-11-15

4. JPY Receipt: ¥150,000 @ 0.00690 = $1,035.00
   Status: Settled
   Created: 2025-11-18
```

**Test Revaluation**:
```
Revaluation Date: 2025-11-30
Base Currency: USD

Lines:
- AR GBP £15,000 @ 1.2750 → 1.2800: Gain $75
- AP EUR €15,000 @ 1.0850 → 1.0850: No change $0
- Cash GBP £20,000 @ 1.2750 → 1.2800: Gain $100

Net Unrealized Gain: $175
```

**Generated Test Data**:
Generate 1000 test foreign currency transactions:
- 60% GBP, 30% EUR, 10% JPY
- Amount range: $100 to $10,000
- Date range: Last 90 days
- 70% settled, 30% unsettled
- Business key pattern: TEST-FCT-NNNNNN

### Test Scenarios

**Volume Testing**:
- Insert 10,000 foreign currency transactions
- Test revaluation with 1,000 open balances
- Verify query performance with large dataset

**Concurrency Testing**:
- Simultaneous foreign transaction posting (10 users)
- Concurrent exchange rate updates
- Test locking and transaction isolation
- Verify dual currency calculation consistency

**Edge Case Testing**:
- Zero decimal currency (JPY)
- High precision currency (BHD with 3 decimals)
- Very small amounts (0.01)
- Very large amounts (>$1,000,000)
- Exchange rate exactly 1.0 (same currency simulation)
- Negative gain/loss amounts

**Revaluation Testing**:
- Zero gain/loss lines (rate unchanged)
- Large gain (>$10,000) requiring approval
- All gains (no losses)
- All losses (no gains)
- Mixed currencies (GBP, EUR, JPY)
- Reversal posting

**Constraint Testing**:
- Try to create duplicate currency code (should fail)
- Try to set two base currencies (should fail)
- Try to delete currency with transactions (should fail)
- Try to post transaction without valid rate (should fail)
- Try to update immutable fields (should fail)

### Test Data Cleanup

**Cleanup Strategy**:
- Mark test data with 'TEST-' prefix in business keys
- Separate test department/location
- Automated cleanup scripts run weekly
- Manual cleanup before production deployment

**Cleanup Query Example**:
```
Delete test data:
- WHERE transaction_number LIKE 'TEST-%'
- WHERE revaluation_number LIKE 'TEST-REVAL-%'
- WHERE log_number LIKE 'TEST-FXGL-%'
- WHERE department_id = (test department UUID)
```

---

## Glossary

**Currency Terms**:
- **ISO 4217**: International standard for currency codes (e.g., USD, GBP, EUR)
- **Base Currency**: Organization's primary functional currency for reporting
- **Transaction Currency**: Currency in which a transaction is denominated
- **Minor Unit**: Number of decimal places for a currency (2 for USD, 0 for JPY)
- **Exchange Rate**: Price of one currency in terms of another
- **Spot Rate**: Current exchange rate for immediate delivery
- **Bid Rate**: Rate at which dealer buys foreign currency (lower rate)
- **Ask Rate**: Rate at which dealer sells foreign currency (higher rate)
- **Mid Rate**: Average of bid and ask rates (most common for accounting)

**Accounting Terms**:
- **Dual Currency Storage**: Recording both foreign and base currency amounts simultaneously
- **Realized Gain/Loss**: Exchange gain or loss recognized when transaction settles
- **Unrealized Gain/Loss**: Exchange gain or loss on unsettled balances at period-end
- **Revaluation**: Process of adjusting asset/liability values based on current exchange rates
- **Monetary Items**: Assets and liabilities with fixed currency value (AR, AP, Cash)
- **Non-Monetary Items**: Assets without fixed currency value (Inventory, Fixed Assets)
- **IAS 21**: International Accounting Standard for effects of changes in foreign exchange rates
- **Functional Currency**: Currency of primary economic environment (base currency)

**Technical Terms**:
- **TTL**: Time To Live - how long data is valid before refresh required
- **Caching**: Storing frequently accessed data in fast memory for quick retrieval
- **Failover**: Automatic switching to backup system when primary fails
- **Rate Provider**: External service supplying exchange rates (Bank of England, ECB)
- **API Key**: Authentication credential for accessing external API
- **Variance Threshold**: Maximum allowed rate change before requiring approval
- **Rounding Precision**: Smallest unit to which amounts are rounded (e.g., 0.01 for cents)

**Database Terms**:
- **Composite Index**: Index on multiple columns for efficient multi-column queries
- **Partial Index**: Index with WHERE clause, indexes only subset of rows
- **Materialized View**: Pre-computed query result stored as table for fast access
- **Foreign Key**: Column referencing primary key of another table
- **Cascade Delete**: Automatic deletion of related records when parent deleted
- **Row-Level Security**: Database feature restricting which rows users can access
- **Trigger**: Stored procedure that executes automatically on database events

---

## Related Documents

- [Business Requirements](./BR-currency-management.md) - Functional requirements and business rules
- [Use Cases](./UC-currency-management.md) - User workflows and scenarios
- [Technical Specification](./TS-currency-management.md) - System architecture and components
- [Flow Diagrams](./FD-currency-management.md) - Visual workflow and process diagrams
- [Validations](./VAL-currency-management.md) - Data validation rules and error handling

**Integration Documents**:
- [Account Code Mapping - Data Schema](../account-code-mapping/DS-account-code-mapping.md) - GL account structure for exchange gain/loss accounts

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Database Architect | | | |
| Technical Lead | | | |
| CFO / Controller | | | |
| Treasury Manager | | | |
| Security Officer | | | |

---

**Document End**

> 📝 **Note to Implementers**:
> - Implement high-precision decimal arithmetic using Decimal.js (not floating point)
> - Encrypt sensitive data at rest (bank accounts, API keys)
> - Implement Redis caching for exchange rates (1-hour TTL)
> - Set up automated rate retrieval jobs (hourly via cron)
> - Enable row-level security for multi-department organizations
> - Implement comprehensive audit logging for all rate changes
> - Set up monitoring and alerting for rate update failures
> - Test revaluation process thoroughly before production use
> - Ensure automatic reversal scheduling works correctly
> - Validate dual currency calculations with sample transactions
> - Test failover between rate providers
> - Implement backup and recovery procedures
> - Keep documentation updated as schema evolves
