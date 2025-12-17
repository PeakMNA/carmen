# Business Requirements: Currency Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Currency Management
- **Route**: `/finance/currency-management`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-12

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-12 | Carmen ERP Documentation Team | Initial version |


## Overview

The Currency Management sub-module provides comprehensive multi-currency support for hospitality operations across multiple countries and regions. It enables the organization to conduct business in multiple currencies, manage foreign currency transactions, handle currency conversions, and maintain accurate financial records in both transaction and base currencies. This module ensures compliance with international accounting standards (IAS 21) for foreign currency transactions and currency translation.

The Currency Management module integrates tightly with Account Code Mapping to ensure all foreign currency transactions are properly posted with appropriate exchange gain/loss entries, and with Exchange Rates module for current and historical rate retrieval.

## Business Objectives

1. Support multi-currency business operations across different countries and regions
2. Maintain accurate financial records in both transaction and base currency
3. Automate currency conversion using real-time or historical exchange rates
4. Calculate and post realized and unrealized exchange gains and losses
5. Ensure compliance with IAS 21 (The Effects of Changes in Foreign Exchange Rates)
6. Enable multi-currency financial reporting and consolidation
7. Support multiple base currencies for different legal entities or business units
8. Provide transparency and audit trail for all currency-related transactions
9. Minimize manual currency calculations and reduce conversion errors
10. Support cross-border vendor payments and customer receipts in local currencies

## Key Stakeholders

### Primary Users
1. **Financial Controller / CFO**: Defines base currency strategy, oversees currency risk management, approves currency policies
2. **Finance Manager**: Configures supported currencies, manages currency settings, monitors exchange gain/loss
3. **Accountant**: Processes foreign currency transactions, posts revaluation entries, reconciles currency accounts
4. **Treasury Manager**: Monitors foreign currency exposure, manages currency hedging, oversees cash in multiple currencies

### System Users
1. **Purchasing Manager**: Creates purchase orders in vendor currency, processes foreign vendor payments
2. **Sales Manager**: Creates invoices in customer currency, processes foreign customer receipts
3. **Accounts Payable Clerk**: Processes vendor invoices and payments in foreign currencies
4. **Accounts Receivable Clerk**: Processes customer invoices and receipts in foreign currencies

### Supporting Roles
1. **External Auditor**: Verifies currency treatment compliance with IAS 21
2. **Internal Auditor**: Reviews currency controls and exchange rate accuracy
3. **Tax Accountant**: Ensures tax calculations properly handle multiple currencies
4. **Financial Analyst**: Analyzes currency impact on financial performance

## Functional Requirements

### FR-CUR-001: Currency Master Data Management
**Priority**: Critical
**User Story**: As a Finance Manager, I want to maintain a comprehensive list of supported currencies so that the system can handle multi-currency transactions across all business operations.

**Requirements**:
- Currency master data with ISO 4217 currency codes (USD, EUR, GBP, JPY, etc.)
- Currency name, symbol, and minor unit (decimal places)
- Active/Inactive status with effective date ranges
- Display format configuration (symbol placement, thousand separator, decimal separator)
- Rounding rules for each currency
- Exchange rate source configuration
- Historical currency data retention
- Import/Export functionality for currency setup

**Currency Master Structure**:
```typescript
interface Currency {
  currency_code: string              // ISO 4217 code (USD, EUR, GBP)
  currency_name: string              // Full name (US Dollar, Euro, British Pound)
  currency_symbol: string            // Symbol ($, €, £)
  minor_unit: number                 // Decimal places (2 for USD, 0 for JPY)
  symbol_position: 'before' | 'after' // Symbol placement relative to amount
  thousand_separator: string         // Thousands delimiter (,)
  decimal_separator: string          // Decimal delimiter (.)
  rounding_rule: 'standard' | 'cash' | 'mathematical' // Rounding method
  rounding_precision: number         // Precision for rounding (0.01, 0.05, 0.10)
  is_base_currency: boolean          // True for organization base currency
  is_active: boolean                 // Active for transactions
  effective_date: Date               // Date from which currency is active
  end_date?: Date                    // Date currency becomes inactive
  country_code: string               // Primary country (US, UK, JP)
  numeric_code: number               // ISO 4217 numeric code
  exchange_rate_source: string       // Source for exchange rates
  notes: string                      // Additional information
}
```

**Currency Examples**:
```yaml
Currency: USD (US Dollar)
  Symbol: $
  Minor Unit: 2
  Symbol Position: before
  Thousand Separator: ,
  Decimal Separator: .
  Rounding: standard (0.01)
  Display: $1,234.56

Currency: EUR (Euro)
  Symbol: €
  Minor Unit: 2
  Symbol Position: after
  Thousand Separator: .
  Decimal Separator: ,
  Rounding: standard (0.01)
  Display: 1.234,56€

Currency: JPY (Japanese Yen)
  Symbol: ¥
  Minor Unit: 0
  Symbol Position: before
  Thousand Separator: ,
  Decimal Separator: (none)
  Rounding: standard (1)
  Display: ¥1,235

Currency: BHD (Bahraini Dinar)
  Symbol: BD
  Minor Unit: 3
  Symbol Position: before
  Thousand Separator: ,
  Decimal Separator: .
  Rounding: standard (0.001)
  Display: BD1,234.567
```

**Acceptance Criteria**:
- Support minimum 50 currencies (expandable to 100+)
- Currency codes comply with ISO 4217 standard
- Each organization must define exactly one base currency
- Inactive currencies cannot be used for new transactions but remain for historical reporting
- Currency display format configurable per currency
- Rounding rules properly implemented for cash transactions
- Bulk import supports CSV/Excel with validation
- Currency changes tracked in audit trail

---

### FR-CUR-002: Base Currency Configuration
**Priority**: Critical
**User Story**: As a Financial Controller, I want to designate one currency as the base currency so that all financial statements are presented in a single, consistent currency.

**Requirements**:
- Single base currency designation per legal entity/organization
- Base currency cannot be changed after transactions exist (system constraint)
- All GL accounts and reports default to base currency
- Foreign currency transactions automatically converted to base currency
- Base currency selection during initial system setup
- Multi-entity support with different base currencies per entity
- Consolidated reporting across entities with different base currencies
- Base currency prominently displayed throughout the system

**Base Currency Configuration**:
```yaml
Organization: Carmen Hospitality Group - US Operations
Base Currency: USD
Presentation Currency: USD
Reporting Currency: USD
Fiscal Year Start: January 1
Currency Decimal Places: 2

Organization: Carmen Hospitality Group - UK Operations
Base Currency: GBP
Presentation Currency: GBP
Reporting Currency: USD (for consolidation)
Fiscal Year Start: April 1
Currency Decimal Places: 2

Organization: Carmen Hospitality Group - Japan Operations
Base Currency: JPY
Presentation Currency: JPY
Reporting Currency: USD (for consolidation)
Fiscal Year Start: January 1
Currency Decimal Places: 0
```

**Acceptance Criteria**:
- One and only one base currency per organization
- Base currency set during initial configuration cannot be changed if transactions exist
- System-wide validation prevents base currency change post-transactions
- All financial reports default to base currency
- Multi-entity organizations support different base currencies per entity
- Consolidated reports convert all entities to consolidated reporting currency
- Base currency clearly indicated on all financial documents

---

### FR-CUR-003: Foreign Currency Transaction Processing
**Priority**: Critical
**User Story**: As an Accounts Payable Clerk, I want to process vendor invoices in the vendor's currency so that we can pay vendors in their local currency and maintain accurate records.

**Requirements**:
- Transaction entry in foreign currency with automatic base currency conversion
- Exchange rate capture at transaction date
- Dual currency display (transaction currency + base currency)
- Support for manual exchange rate override with reason
- Exchange rate source tracking (automatic, manual, fixed rate)
- Transaction currency vs settlement currency handling
- Multi-currency document support (invoice, payment, credit note)
- Historical exchange rate usage for backdated transactions

**Foreign Currency Transaction Types**:

**Purchase Invoice in Foreign Currency**:
```yaml
Transaction: Purchase Invoice
Invoice Number: INV-UK-2501-00123
Date: 2025-11-12
Vendor: Fresh Farm Suppliers (UK)
Transaction Currency: GBP
Base Currency: USD

Line Items:
  - Description: Organic Vegetables
    Quantity: 100 kg
    Price per Unit: £5.00 GBP
    Line Total: £500.00 GBP
    Exchange Rate: 1 GBP = 1.2750 USD
    Base Currency Amount: $637.50 USD

  - Description: Fresh Fruits
    Quantity: 50 kg
    Price per Unit: £8.00 GBP
    Line Total: £400.00 GBP
    Exchange Rate: 1 GBP = 1.2750 USD
    Base Currency Amount: $510.00 USD

Total: £900.00 GBP = $1,147.50 USD
Exchange Rate Used: 1.2750 (Bank of England Spot Rate on 2025-11-12)
Journal Entry:
  Debit: 5100 - COGS (GBP £900.00 / USD $1,147.50)
  Credit: 2100 - Accounts Payable (GBP £900.00 / USD $1,147.50)
```

**Foreign Currency Payment with Exchange Difference**:
```yaml
Transaction: Vendor Payment
Payment Date: 2025-11-20
Vendor: Fresh Farm Suppliers (UK)
Transaction Currency: GBP
Base Currency: USD
Payment Method: Bank Transfer

Original Invoice:
  Date: 2025-11-12
  Amount: £900.00 GBP
  Exchange Rate: 1.2750 USD/GBP
  Base Amount: $1,147.50 USD
  GL Balance: $1,147.50 USD in AP

Payment:
  Amount Paid: £900.00 GBP
  Exchange Rate: 1.2800 USD/GBP (Rate on payment date)
  Base Amount: $1,152.00 USD

Exchange Difference:
  Original AP: $1,147.50 USD
  Payment Amount: $1,152.00 USD
  Exchange Loss: $4.50 USD (Loss because USD weakened)

Journal Entry:
  Debit: 2100 - Accounts Payable: $1,147.50 USD
  Debit: 7200 - Realized Exchange Loss: $4.50 USD
  Credit: 1110 - Cash: $1,152.00 USD
```

**Acceptance Criteria**:
- Transactions recorded in both foreign and base currency simultaneously
- Exchange rates automatically retrieved based on transaction date
- Manual exchange rate override allowed with mandatory reason
- Exchange rate source documented for audit trail
- Dual currency amounts displayed on all documents and reports
- Settlement currency different from transaction currency supported
- Realized exchange gain/loss calculated automatically on payment
- Historical exchange rates used for historical transaction posting

---

### FR-CUR-004: Exchange Gain and Loss Calculation
**Priority**: Critical
**User Story**: As an Accountant, I want the system to automatically calculate realized and unrealized exchange gains and losses so that financial statements accurately reflect currency impacts per IAS 21.

**Requirements**:
- Realized gain/loss calculation on transaction settlement
- Unrealized gain/loss calculation for open foreign currency balances
- Separate GL accounts for realized vs unrealized gains/losses
- Periodic revaluation of foreign currency balances
- Automatic journal entry generation for gains/losses
- Period-end revaluation process
- Reversal of unrealized gains/losses in subsequent period
- Comprehensive audit trail of all exchange gain/loss calculations

**Exchange Gain/Loss Types**:

**Realized Exchange Gain/Loss**:
- Occurs when foreign currency transaction is settled
- Difference between exchange rate at transaction date vs settlement date
- Posted to P&L account (7200 - Realized Exchange Gain/Loss)
- Permanent impact on financial statements

**Example - Realized Exchange Gain**:
```yaml
Invoice Date: 2025-10-01
Invoice Amount: EUR 10,000
Exchange Rate: 1.1000 USD/EUR
Base Amount: $11,000 USD
AP Balance: $11,000 USD

Payment Date: 2025-11-12
Payment Amount: EUR 10,000
Exchange Rate: 1.0800 USD/EUR
Base Amount: $10,800 USD

Realized Exchange Gain: $200 USD
(Paid less USD due to EUR weakening)

Journal Entry on Payment Date:
  Debit: 2100 - Accounts Payable: $11,000 USD
  Credit: 1110 - Cash: $10,800 USD
  Credit: 7200 - Realized Exchange Gain: $200 USD
```

**Unrealized Exchange Gain/Loss**:
- Occurs when foreign currency balance revalued at period-end
- Difference between exchange rate at transaction date vs period-end rate
- Posted to P&L account (7210 - Unrealized Exchange Gain/Loss)
- Reversed at beginning of next period (continuous revaluation method)

**Example - Unrealized Exchange Loss**:
```yaml
Period End: 2025-11-30

Foreign Currency Accounts Receivable (EUR):
  Invoice #1:
    Date: 2025-11-10
    Amount: EUR 5,000
    Original Rate: 1.0900 USD/EUR
    Original Base: $5,450 USD
    Period-End Rate: 1.0800 USD/EUR
    Revalued Base: $5,400 USD
    Unrealized Loss: $50 USD

  Invoice #2:
    Date: 2025-11-25
    Amount: EUR 8,000
    Original Rate: 1.0850 USD/EUR
    Original Base: $8,680 USD
    Period-End Rate: 1.0800 USD/EUR
    Revalued Base: $8,640 USD
    Unrealized Loss: $40 USD

Total Unrealized Loss: $90 USD

Journal Entry on 2025-11-30:
  Debit: 7210 - Unrealized Exchange Loss: $90 USD
  Credit: 1200 - Accounts Receivable: $90 USD

Reversal Entry on 2025-12-01:
  Debit: 1200 - Accounts Receivable: $90 USD
  Credit: 7210 - Unrealized Exchange Loss: $90 USD
(Reversal allows fresh revaluation in December)
```

**Acceptance Criteria**:
- Realized gains/losses calculated automatically on payment/receipt
- Unrealized gains/losses calculated at period-end for all open foreign currency balances
- Separate GL accounts for realized vs unrealized gains/losses
- Period-end revaluation wizard guides through process
- Automatic reversal of unrealized gains/losses at period start
- Exchange gain/loss reports show detailed calculations
- All gain/loss calculations traceable to source transactions
- Compliance with IAS 21 accounting treatment

---

### FR-CUR-005: Multi-Currency Bank Account Management
**Priority**: High
**User Story**: As a Treasury Manager, I want to manage bank accounts in multiple currencies so that we can hold funds in foreign currencies and minimize conversion costs.

**Requirements**:
- Bank account master data with currency designation
- One base currency per bank account
- Foreign currency balance tracking
- Multi-currency cash positioning report
- Bank statement import in foreign currency
- Foreign currency bank reconciliation
- Inter-currency transfers with exchange gain/loss
- Foreign currency cash flow projections

**Multi-Currency Bank Account Structure**:
```typescript
interface BankAccount {
  bank_account_id: string
  account_name: string
  bank_name: string
  account_number: string
  currency_code: string              // Account currency (USD, EUR, GBP)
  is_base_currency_account: boolean  // True if account currency = base currency
  account_type: 'checking' | 'savings' | 'foreign_currency'
  gl_account_code: string            // Link to GL account (1110, 1111, etc.)
  current_balance: number            // Balance in account currency
  current_balance_base: number       // Balance in base currency
  available_balance: number          // Available for transactions
  overdraft_limit: number
  interest_rate: number
  is_active: boolean
  opening_date: Date
  bank_swift_code: string
  iban: string
}
```

**Multi-Currency Bank Account Examples**:
```yaml
Bank Account: Operating Account (US)
  Account Number: 123-456-7890
  Bank: Chase Bank
  Currency: USD (Base Currency)
  GL Account: 1110 - Cash - Operating USD
  Balance: $125,000.00 USD
  Type: Checking

Bank Account: Operating Account (UK)
  Account Number: GB29-NWBK-6016-1331-9268-19
  Bank: NatWest Bank (UK)
  Currency: GBP
  GL Account: 1111 - Cash - Operating GBP
  Balance: £80,000.00 GBP
  Balance (Base): $102,000.00 USD (at 1.2750 rate)
  Type: Foreign Currency

Bank Account: Operating Account (EU)
  Account Number: DE89-3704-0044-0532-0130-00
  Bank: Deutsche Bank (Germany)
  Currency: EUR
  GL Account: 1112 - Cash - Operating EUR
  Balance: €60,000.00 EUR
  Balance (Base): $64,800.00 USD (at 1.0800 rate)
  Type: Foreign Currency

Total Cash Position:
  USD: $125,000.00
  GBP: £80,000.00 ($102,000.00)
  EUR: €60,000.00 ($64,800.00)
  Total (Base): $291,800.00 USD
```

**Foreign Currency Transfer with Conversion**:
```yaml
Transfer: GBP to USD
Date: 2025-11-12
From Account: NatWest GBP Account
To Account: Chase USD Account
Amount Transferred: £10,000.00 GBP
Exchange Rate: 1.2750 USD/GBP
Amount Received: $12,750.00 USD
Bank Fees: $15.00 USD
Net Amount: $12,735.00 USD

Journal Entry:
  Debit: 1110 - Cash USD: $12,735.00 USD
  Debit: 6500 - Bank Fees: $15.00 USD
  Credit: 1111 - Cash GBP: £10,000.00 = $12,750.00 USD
  (No exchange gain/loss as transfer at current rate)
```

**Acceptance Criteria**:
- Bank accounts designated with specific currency
- Foreign currency bank balances tracked in both account currency and base currency
- Bank reconciliation supported for foreign currency accounts
- Bank statement import handles multiple currencies
- Inter-currency transfers calculate exchange gain/loss
- Cash position report shows balances in all currencies
- Foreign currency exposure reports by currency
- Bank fees properly allocated to expense accounts

---

### FR-CUR-006: Multi-Currency Reporting
**Priority**: High
**User Story**: As a Financial Controller, I want comprehensive multi-currency reports so that I can analyze financial performance in both transaction and base currencies.

**Requirements**:
- Financial statements in base currency with foreign currency detail
- Transaction listing reports in original transaction currency
- Exchange gain/loss analysis reports
- Foreign currency exposure reports (by currency, by vendor/customer)
- Multi-currency trial balance
- Currency conversion summary reports
- Period-end revaluation reports
- Comparative reports in multiple currencies

**Multi-Currency Report Examples**:

**Profit & Loss Statement with Currency Detail**:
```
Profit & Loss Statement
Period: November 2025
Base Currency: USD

Revenue:
  Sales - USD: $450,000.00
  Sales - EUR: €120,000.00 ($129,600.00)
  Sales - GBP: £85,000.00 ($108,375.00)
  Total Revenue: $687,975.00

Cost of Goods Sold:
  COGS - USD: $180,000.00
  COGS - EUR: €48,000.00 ($51,840.00)
  COGS - GBP: £34,000.00 ($43,350.00)
  Total COGS: $275,190.00

Gross Profit: $412,785.00 (60.0%)

Operating Expenses:
  (Details by currency...)

Exchange Gain/(Loss):
  Realized Exchange Gain: $1,250.00
  Unrealized Exchange Loss: ($890.00)
  Net Exchange Gain: $360.00

Net Income: $XXX,XXX.00
```

**Foreign Currency Exposure Report**:
```
Foreign Currency Exposure Report
Date: 2025-11-30
Base Currency: USD

Currency: EUR
  Accounts Receivable: €125,000.00 ($135,000.00)
  Accounts Payable: €85,000.00 ($91,800.00)
  Net Exposure: €40,000.00 ($43,200.00) - Long EUR position
  Exchange Rate: 1.0800 USD/EUR
  10% Rate Change Impact: $4,320.00

Currency: GBP
  Accounts Receivable: £95,000.00 ($121,125.00)
  Accounts Payable: £120,000.00 ($153,000.00)
  Net Exposure: (£25,000.00) (($31,875.00)) - Short GBP position
  Exchange Rate: 1.2750 USD/GBP
  10% Rate Change Impact: $3,187.50

Currency: JPY
  Accounts Receivable: ¥8,500,000 ($58,620.69)
  Accounts Payable: ¥3,200,000 ($22,068.97)
  Net Exposure: ¥5,300,000 ($36,551.72) - Long JPY position
  Exchange Rate: 145.00 JPY/USD
  10% Rate Change Impact: $3,655.17
```

**Currency Conversion Summary Report**:
```
Currency Conversion Summary
Period: November 2025

Total Transactions by Currency:
  USD: 1,245 transactions, $1,850,000.00
  EUR: 89 transactions, €185,000.00 ($199,800.00)
  GBP: 67 transactions, £145,000.00 ($184,875.00)
  JPY: 23 transactions, ¥12,500,000 ($86,206.90)

Average Exchange Rates Used:
  EUR: 1.0800 (Min: 1.0750, Max: 1.0850)
  GBP: 1.2750 (Min: 1.2700, Max: 1.2800)
  JPY: 145.00 (Min: 144.50, Max: 145.50)

Exchange Gain/(Loss) Summary:
  Realized Gains: $3,450.00
  Realized Losses: ($2,200.00)
  Net Realized: $1,250.00
  Unrealized Losses: ($890.00)
  Net Exchange Gain: $360.00
```

**Acceptance Criteria**:
- All financial reports display amounts in base currency
- Reports support drill-down to original transaction currency
- Exchange gain/loss reports show detailed calculations
- Foreign currency exposure reports calculate risk metrics
- Multi-currency trial balance shows balances by currency
- Comparative reports support multiple currencies
- Reports exportable to Excel with currency formatting
- Report generation time <30 seconds for standard reports

---

### FR-CUR-007: Currency Conversion and Rounding
**Priority**: High
**User Story**: As an Accountant, I want consistent currency conversion and rounding rules so that all calculations are accurate and auditable.

**Requirements**:
- Configurable rounding rules per currency
- Consistent rounding methodology across all calculations
- Rounding difference tracking and posting
- Currency conversion formula transparency
- Multiple rounding methods (standard, cash rounding, mathematical)
- Rounding precision configuration (0.01, 0.05, 0.10)
- Rounding difference allocation to specific GL account
- Audit trail of all rounding adjustments

**Rounding Methods**:

**Standard Rounding** (Most Common):
- Round to nearest minor unit (0.01 for USD, 1 for JPY)
- Uses standard mathematical rounding (0.5 rounds up)
- Example: $123.456 rounds to $123.46

**Cash Rounding**:
- Round to nearest cash denomination for physical payments
- Example: 0.05 rounding for currencies without 1 cent coins
- €1.23 rounds to €1.25 (nearest 5 cents)
- €1.22 rounds to €1.20 (nearest 5 cents)

**Mathematical Rounding**:
- Banker's rounding (round half to even)
- Reduces cumulative rounding bias in large batches
- Example: 0.5 rounds to nearest even (0.5→0, 1.5→2, 2.5→2, 3.5→4)

**Currency Conversion Examples**:

**Example 1: EUR to USD Conversion**:
```yaml
Transaction: Purchase Invoice
Amount: €1,234.56 EUR
Exchange Rate: 1.08123456 USD/EUR
Conversion Formula: EUR × Rate = USD
Raw Calculation: €1,234.56 × 1.08123456 = $1,334.88754336 USD
Rounding Rule: Standard (2 decimals)
Final Amount: $1,334.89 USD
Rounding Difference: $0.00245664 USD (tracked but not posted unless accumulated)
```

**Example 2: JPY to USD Conversion**:
```yaml
Transaction: Sales Invoice
Amount: ¥125,750 JPY
Exchange Rate: 0.00689655 USD/JPY (or 145.00 JPY/USD)
Conversion Formula: JPY × Rate = USD
Raw Calculation: ¥125,750 × 0.00689655 = $867.14141250 USD
Rounding Rule: Standard (2 decimals)
Final Amount: $867.14 USD
Rounding Difference: $0.00141250 USD
```

**Example 3: Cash Rounding**:
```yaml
Transaction: Customer Receipt (Cash)
Amount: €127.23 EUR
Cash Rounding: 0.05 EUR (nearest 5 cents)
Rounded Amount: €127.25 EUR
Rounding Difference: €0.02 EUR (posted to Cash Rounding account)

Journal Entry:
  Debit: 1110 - Cash: €127.25 EUR
  Credit: 1200 - Accounts Receivable: €127.23 EUR
  Credit: 7300 - Cash Rounding Gain: €0.02 EUR
```

**Rounding Difference Tracking**:
```yaml
Rounding Difference Account: 7250 - Currency Rounding Differences

Daily Transactions (2025-11-12):
  Transaction 1: Rounding +$0.003
  Transaction 2: Rounding -$0.001
  Transaction 3: Rounding +$0.004
  Transaction 4: Rounding -$0.002
  Transaction 5: Rounding +$0.001
  Daily Net: +$0.005 USD

Monthly Accumulation:
  Total Rounding Differences: $1.23 USD
  Posted to GL Account 7250 at month-end
```

**Acceptance Criteria**:
- Rounding rules configurable per currency
- Consistent rounding methodology across all modules
- Rounding differences tracked with precision
- Cumulative rounding differences posted to designated GL account
- Rounding difference reports available for audit
- Cash rounding supported for physical payment transactions
- Conversion formula transparent and auditable
- No unbalanced entries due to rounding

---

### FR-CUR-008: Historical Exchange Rate Management
**Priority**: Medium
**User Story**: As an Accountant, I want to post backdated transactions using historical exchange rates so that late-received invoices are recorded accurately.

**Requirements**:
- Historical exchange rate storage by date
- Automatic historical rate retrieval for backdated transactions
- Manual historical rate entry with validation
- Historical rate audit trail
- Rate change history tracking
- Period-end rate storage
- Historical rate reports
- Integration with Exchange Rates module

**Historical Exchange Rate Usage**:

**Example: Backdated Invoice Posting**:
```yaml
Today's Date: 2025-11-12
Invoice Date: 2025-10-15 (Late-received invoice)
Invoice Amount: £5,000.00 GBP

Current Exchange Rate (2025-11-12): 1.2750 USD/GBP
Historical Exchange Rate (2025-10-15): 1.2680 USD/GBP

Correct Posting:
  Use historical rate from invoice date (2025-10-15)
  Amount: £5,000.00 GBP × 1.2680 = $6,340.00 USD
  Not: £5,000.00 GBP × 1.2750 = $6,375.00 USD (current rate)

Journal Entry (Posted 2025-11-12, Dated 2025-10-15):
  Transaction Date: 2025-10-15
  Posting Date: 2025-11-12
  Debit: 5100 - COGS: £5,000.00 GBP / $6,340.00 USD
  Credit: 2100 - AP: £5,000.00 GBP / $6,340.00 USD
  Exchange Rate Used: 1.2680 (Historical rate from 2025-10-15)
  Rate Source: Bank of England Spot Rate on 2025-10-15
```

**Historical Rate Validation**:
```yaml
Transaction Date: 2025-10-15
Currency: GBP
Historical Rate Required: Yes

System Validation:
  1. Check if historical rate exists for 2025-10-15
  2. If not found, use nearest available rate (2025-10-14 or 2025-10-16)
  3. If manual rate entered, validate against +/-5% of nearest rate
  4. Flag unusual rate variance for review
  5. Require approval for manual rates outside tolerance
  6. Log rate source (automatic, manual, adjusted)
```

**Acceptance Criteria**:
- Historical exchange rates automatically retrieved for backdated transactions
- Historical rate data retained for minimum 7 years
- Manual historical rate entry validated against reasonable ranges
- Rate source documented for audit trail
- Historical rate reports show rate changes over time
- Integration with Exchange Rates module for rate retrieval
- Period-end rates stored for revaluation purposes
- Rate change history tracked with before/after values

---

### FR-CUR-009: Multi-Currency Budget and Forecasting
**Priority**: Medium
**User Story**: As a Financial Analyst, I want to create budgets in multiple currencies so that I can plan for foreign currency operations and compare actuals to budget.

**Requirements**:
- Budget creation in foreign currencies
- Budget exchange rate locking
- Actual vs budget comparison in base currency
- Budget revaluation at period-end
- Foreign currency forecast support
- Multi-currency variance analysis
- Currency impact on budget variance
- Budget consolidation across currencies

**Multi-Currency Budget Example**:
```yaml
Budget: Marketing Expenses - EU Region
Period: 2025 Q4
Budget Currency: EUR
Base Currency: USD

Budget Creation (2025-09-30):
  Locked Exchange Rate: 1.0750 USD/EUR

  October:
    Online Advertising: €25,000 EUR ($26,875 USD)
    Trade Shows: €15,000 EUR ($16,125 USD)
    Total: €40,000 EUR ($43,000 USD)

  November:
    Online Advertising: €25,000 EUR ($26,875 USD)
    Trade Shows: €10,000 EUR ($10,750 USD)
    Total: €35,000 EUR ($37,625 USD)

  December:
    Online Advertising: €30,000 EUR ($32,250 USD)
    Trade Shows: €20,000 EUR ($21,500 USD)
    Total: €50,000 EUR ($53,750 USD)

  Q4 Total Budget: €125,000 EUR ($134,375 USD)

Actual Results (November 2025):
  Online Advertising: €26,500 EUR ($28,620 USD at 1.0800 rate)
  Trade Shows: €9,800 EUR ($10,584 USD at 1.0800 rate)
  Total: €36,300 EUR ($39,204 USD)

Variance Analysis:
  Budget: €35,000 EUR ($37,625 USD at locked rate)
  Actual: €36,300 EUR ($39,204 USD at actual rate)

  Variance in EUR: €1,300 over budget (3.7%)
  Variance in USD: $1,579 over budget (4.2%)

  Currency Impact: $1,579 - $1,397.50 = $181.50
  (Additional USD due to EUR strengthening from 1.0750 to 1.0800)
```

**Acceptance Criteria**:
- Budgets created in foreign currencies with locked exchange rates
- Actual vs budget comparison uses budget locked rates
- Currency variance separately identified from operational variance
- Budget revaluation option using current rates
- Multi-currency budget consolidation supported
- Variance analysis shows both currency and foreign currency impacts
- Budget reports display both budget and actual currencies
- Foreign currency budget approval workflow

---

### FR-CUR-010: Currency Risk Management and Hedging
**Priority**: Low
**User Story**: As a Treasury Manager, I want to track currency exposure and hedging activities so that I can manage foreign exchange risk effectively.

**Requirements**:
- Foreign currency exposure tracking (AR, AP, cash)
- Net exposure calculation by currency
- Hedging transaction recording
- Forward contract management
- Currency option tracking
- Hedge effectiveness testing
- Exposure reports and alerts
- Integration with trading systems (future enhancement)

**Currency Exposure and Hedging Example**:
```yaml
Date: 2025-11-12
Currency: EUR
Base Currency: USD
Current Spot Rate: 1.0800 USD/EUR

Exposure Analysis:
  Accounts Receivable: €285,000 ($307,800)
  Accounts Payable: €425,000 ($459,000)
  Cash Holdings: €60,000 ($64,800)
  Net Exposure: (€80,000) (($86,400)) - Short EUR position

  Risk: If EUR strengthens to 1.1000, exposure increases to ($88,000)
        Additional cost: $1,600 USD

Hedging Strategy:
  Forward Contract #1:
    Trade Date: 2025-11-12
    Settlement Date: 2025-12-15
    Amount: €80,000 EUR
    Forward Rate: 1.0850 USD/EUR
    Purpose: Hedge net EUR exposure

  At Settlement (2025-12-15):
    Spot Rate: 1.0950 USD/EUR
    Without Hedge: €80,000 × 1.0950 = $87,600 USD
    With Hedge: €80,000 × 1.0850 = $86,800 USD
    Savings: $800 USD
```

**Acceptance Criteria**:
- Foreign currency exposure calculated automatically
- Net exposure by currency displayed in dashboard
- Hedging transactions recorded with forward rates
- Hedge effectiveness reports for compliance
- Exposure alerts when thresholds exceeded
- Forward contract settlement automated
- Hedging gains/losses posted to separate GL account
- Integration with trading systems (future phase)

---

## Business Rules

### Currency Master Data Rules

**BR-CUR-001: Currency Code Uniqueness**
- Each currency code must be unique (one EUR, one USD, etc.)
- Currency codes must comply with ISO 4217 standard
- Deleted currencies retain their code in history with "Deleted" status
- Currency codes cannot be reused after deletion

**BR-CUR-002: Base Currency Designation**
- Each organization must designate exactly one base currency
- Base currency cannot be changed if any transactions exist
- All GL accounts default to base currency
- Base currency must be active and cannot be deactivated

**BR-CUR-003: Currency Activation Rules**
- Active currencies can be used for transactions
- Inactive currencies cannot be used for new transactions
- Deactivation requires zero open balances unless forced deactivation approved
- Inactive currencies retain historical transaction data for reporting

**BR-CUR-004: Currency Display Format**
- Symbol position (before/after amount) configurable per currency
- Thousand separator and decimal separator configurable per currency
- Minor unit (decimal places) must match ISO 4217 standard
- Display format changes do not affect stored values (stored as decimal)

---

### Exchange Rate Rules

**BR-CUR-005: Exchange Rate Validity**
- Exchange rates must be positive numbers
- Exchange rates must have reasonable values (0.0001 to 10,000)
- Manual exchange rates require approval if variance >5% from market rate
- Exchange rates required for all active foreign currencies

**BR-CUR-006: Exchange Rate Application**
- Transaction date determines which exchange rate to use
- Backdated transactions use historical rates from transaction date, not posting date
- Period-end revaluation uses period-end closing rates
- Manual exchange rate override allowed with reason documentation

**BR-CUR-007: Exchange Rate Source Tracking**
- Exchange rate source must be documented (automatic, manual, fixed)
- Automatic rates retrieved from configured external source
- Manual rates require user approval
- Rate changes tracked in audit trail

---

### Transaction Processing Rules

**BR-CUR-008: Dual Currency Recording**
- All foreign currency transactions recorded in both transaction currency and base currency
- Base currency amount calculated using exchange rate at transaction date
- Both amounts stored permanently (not recalculated)
- Dual currency display required on all documents

**BR-CUR-009: Foreign Currency Settlement**
- Realized exchange gain/loss calculated at settlement date
- Settlement currency can differ from transaction currency
- Multiple partial payments supported with gain/loss on each payment
- Realized gain/loss posted to P&L account

**BR-CUR-010: Foreign Currency Revaluation**
- Unrealized exchange gain/loss calculated at period-end
- Revaluation applies to open foreign currency balances only
- Unrealized gain/loss reversed at start of next period
- Revaluation required for IAS 21 compliance

---

### Bank Account Rules

**BR-CUR-011: Bank Account Currency**
- Each bank account designated with single currency
- Bank account currency cannot be changed after transactions exist
- Foreign currency bank accounts require separate GL accounts
- Bank reconciliation performed in bank account currency

**BR-CUR-012: Inter-Currency Transfers**
- Transfers between different currency accounts calculate exchange gain/loss
- Transfer exchange rate from current market rate or bank rate
- Bank fees allocated to bank fee expense account
- Net transfer amount recorded in both currencies

---

### Reporting Rules

**BR-CUR-013: Financial Statement Currency**
- All financial statements presented in base currency
- Foreign currency detail available as supporting schedules
- Exchange gain/loss presented separately in P&L
- Currency translation disclosures required for compliance

**BR-CUR-014: Multi-Currency Consolidation**
- Multi-entity consolidation requires common reporting currency
- Each entity translates to reporting currency for consolidation
- Translation adjustments tracked separately from transactional gains/losses
- Consolidated statements comply with IAS 21

---

### Compliance Rules

**BR-CUR-015: IAS 21 Compliance**
- Foreign currency transactions follow IAS 21 requirements
- Monetary items (cash, receivables, payables) revalued at period-end
- Non-monetary items (inventory, fixed assets) not revalued
- Exchange differences recognized in profit or loss
- Comprehensive disclosures of foreign currency impacts

**BR-CUR-016: Audit Trail Requirements**
- All exchange rates used documented with source
- All foreign currency transactions traceable to source
- All exchange gain/loss calculations auditable
- Currency revaluation reports retained for audit

---

## Integration Requirements

### Internal Integrations
- **Account Code Mapping**: Exchange gain/loss GL accounts, automated posting of currency transactions
- **Exchange Rates**: Historical and current exchange rate retrieval
- **Accounts Payable**: Foreign vendor invoice and payment processing
- **Accounts Receivable**: Foreign customer invoice and receipt processing
- **Cash Management**: Multi-currency bank accounts, foreign currency cash positioning
- **Procurement**: Purchase orders in vendor currency
- **Sales**: Sales invoices in customer currency
- **Budget Management**: Multi-currency budget and forecast support

### External Integrations
- **Exchange Rate Providers**: Real-time and historical exchange rate feeds
- **Banking Systems**: Multi-currency bank statement import
- **ERP Systems**: Multi-currency master data synchronization
- **Consolidation Systems**: Currency translation for group reporting

### Data Dependencies
- **Depends On**: Exchange Rates (rate data), Account Code Mapping (GL accounts), Organization setup (base currency)
- **Used By**: All financial modules requiring multi-currency support

---

## Non-Functional Requirements

### Performance
- **NFR-CUR-001**: Currency lookup response time <200ms
- **NFR-CUR-002**: Exchange rate retrieval <500ms
- **NFR-CUR-003**: Currency conversion calculation <100ms
- **NFR-CUR-004**: Period-end revaluation for 10,000 transactions <5 minutes
- **NFR-CUR-005**: Multi-currency report generation <30 seconds

### Security
- **NFR-CUR-006**: Role-based access control for currency configuration
- **NFR-CUR-007**: Approval workflow for manual exchange rate entry
- **NFR-CUR-008**: Audit trail for all currency-related changes
- **NFR-CUR-009**: Base currency change restricted to system administrator
- **NFR-CUR-010**: Encryption for exchange rate data at rest and in transit

### Usability
- **NFR-CUR-011**: Currency symbols and formats display according to user locale
- **NFR-CUR-012**: Dual currency display throughout system (transaction + base)
- **NFR-CUR-013**: Currency selector with flag icons for easy identification
- **NFR-CUR-014**: Automatic currency suggestion based on vendor/customer country
- **NFR-CUR-015**: Currency conversion calculator widget

### Reliability
- **NFR-CUR-016**: Foreign currency transactions ACID compliant
- **NFR-CUR-017**: Exchange rate data cached with automatic refresh
- **NFR-CUR-018**: Fallback to manual rate entry if automatic rate retrieval fails
- **NFR-CUR-019**: Daily reconciliation of foreign currency balances
- **NFR-CUR-020**: Automated backup of currency configuration and rates

### Scalability
- **NFR-CUR-021**: Support minimum 50 active currencies (expandable to 100+)
- **NFR-CUR-022**: Support 10,000 daily foreign currency transactions
- **NFR-CUR-023**: Retain 7+ years of historical exchange rates
- **NFR-CUR-024**: Handle 20+ concurrent currency revaluation processes

---

## Success Metrics

### Automation Metrics
- **Auto-Conversion Rate**: Target >99% of foreign currency transactions converted automatically
- **Manual Rate Override**: Target <1% of transactions require manual rate entry
- **Exchange Rate Retrieval Success**: Target >99.5% successful automatic rate retrieval
- **Revaluation Processing**: Target 100% automated period-end revaluation

### Accuracy Metrics
- **Currency Conversion Accuracy**: Target 100% accurate conversions (no rounding errors >$0.01)
- **Exchange Gain/Loss Accuracy**: Target 100% accurate gain/loss calculations
- **Reconciliation Variance**: Target <$100 variance in foreign currency reconciliations
- **Rate Variance**: Manual rates within ±2% of market rates

### Efficiency Metrics
- **Period-End Revaluation Time**: Target <5 minutes for 10,000 open transactions
- **Report Generation Time**: Target <30 seconds for multi-currency reports
- **Currency Configuration Time**: Target <10 minutes to activate new currency
- **Bank Account Setup Time**: Target <5 minutes for new foreign currency account

### Compliance Metrics
- **IAS 21 Compliance**: 100% compliance with IAS 21 requirements
- **Audit Findings**: Target zero critical findings related to currency management
- **Rate Documentation**: 100% of exchange rates documented with source
- **Data Retention**: 100% compliance with 7-year retention policy

---

## Dependencies

### Module Dependencies
- **Exchange Rates Module**: Real-time and historical exchange rate data (Critical)
- **Account Code Mapping**: GL accounts for exchange gains/losses, automated posting (Critical)
- **Organization Setup**: Base currency designation, entity configuration (Critical)
- **User Management**: Role-based access control for currency functions (High)
- **Audit Trail Module**: Change tracking for currency data (High)

### Technical Dependencies
- **Exchange Rate API**: External exchange rate data provider (Critical)
- **Database**: PostgreSQL for currency and rate storage (Critical)
- **Decimal Precision Library**: High-precision decimal calculations (Critical)
- **Localization Library**: Currency formatting per locale (Medium)
- **Reporting Engine**: Multi-currency report generation (Medium)

### Data Dependencies
- **Master Data**: Vendor country, customer country for currency defaults (High)
- **Chart of Accounts**: Exchange gain/loss GL accounts configured (Critical)
- **Accounting Periods**: Open periods for currency posting (Critical)
- **Bank Account Master**: Bank account currency designation (High)

---

## Assumptions and Constraints

### Assumptions
- Organization operates in multiple countries with multiple currencies
- Foreign currency transactions represent <50% of total transaction volume
- External exchange rate API available with 99.9% uptime
- Users have basic understanding of foreign exchange concepts
- Base currency remains stable (no hyperinflation scenarios)
- Internet connectivity available for real-time exchange rate retrieval

### Constraints
- Base currency cannot be changed after transactions exist (system constraint)
- Exchange rate precision limited to 6 decimal places (technical constraint)
- Historical exchange rates retained for 7 years minimum (regulatory constraint)
- Period-end revaluation must complete before period close (business constraint)
- All foreign currency transactions must have valid exchange rates (business constraint)
- Multi-currency support limited to ISO 4217 currencies (technical constraint)

### Risks
- **Exchange Rate API Failure**: Mitigate with manual rate entry fallback and cached rates
- **Base Currency Change Requirement**: Mitigate with data conversion utility (not recommended)
- **High Currency Volatility**: Mitigate with more frequent revaluations and hedging
- **Incorrect Exchange Rates**: Mitigate with rate validation and approval workflows
- **Performance Issues with Large Volume**: Mitigate with batch processing and indexing
- **Compliance Changes**: Mitigate with flexible configuration and regular updates

---

## Future Enhancements

### Phase 2 Enhancements
- **Cryptocurrency Support**: Bitcoin, Ethereum as transaction currencies
- **Real-Time Rate Updates**: Live exchange rate feeds updated every minute
- **AI-Powered Rate Forecasting**: Machine learning models for exchange rate predictions
- **Advanced Hedging Strategies**: Options, futures, swaps tracking and accounting
- **Currency Risk Analytics**: Value-at-Risk (VaR), scenario analysis, stress testing

### Future Considerations
- **Blockchain Integration**: Smart contracts for cross-border payments
- **Multi-Currency Payroll**: Employee payment in multiple currencies
- **Currency Trading Module**: Spot, forward, and option trading functionality
- **Transfer Pricing**: Intercompany transactions with transfer pricing rules
- **Hyperinflation Accounting**: IAS 29 compliance for high-inflation economies

### Technical Debt
- Current implementation uses simple spot rates; consider implementing forward rate curves
- Period-end revaluation is manual; consider automating with scheduled jobs
- Exchange rate API dependency creates single point of failure; consider multiple providers

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Owner | | | |
| Product Manager | | | |
| Technical Lead | | | |
| Financial Controller | | | |
| Treasury Manager | | | |
| External Auditor | | | |
| Quality Assurance | | | |

---

## Appendix

### Glossary

**Base Currency**: The primary currency in which an organization maintains its accounting records and financial statements.

**Foreign Currency**: Any currency other than the organization's base currency.

**Transaction Currency**: The currency in which a specific transaction is denominated.

**Exchange Rate**: The rate at which one currency can be exchanged for another.

**Spot Rate**: The current exchange rate for immediate delivery.

**Forward Rate**: The agreed-upon exchange rate for a transaction that will occur at a future date.

**Realized Exchange Gain/Loss**: The gain or loss that occurs when a foreign currency transaction is settled at a different exchange rate than when initially recorded.

**Unrealized Exchange Gain/Loss**: The gain or loss that results from revaluing unsettled foreign currency balances at period-end using current exchange rates.

**IAS 21**: International Accounting Standard 21 - "The Effects of Changes in Foreign Exchange Rates".

**ISO 4217**: International standard for currency codes (e.g., USD, EUR, GBP).

**Monetary Items**: Cash, receivables, payables - items that will be received or paid in fixed or determinable amounts of money.

**Non-Monetary Items**: Inventory, fixed assets - items that do not represent a right to receive or obligation to pay a fixed amount of money.

**Functional Currency**: The currency of the primary economic environment in which an entity operates.

**Presentation Currency**: The currency in which financial statements are presented.

**Foreign Currency Exposure**: The risk that exchange rate changes will adversely affect the value of foreign currency assets or liabilities.

**Hedging**: Financial strategy to reduce or eliminate foreign currency risk using forward contracts, options, or other derivative instruments.

**Currency Revaluation**: The process of adjusting the carrying amount of foreign currency assets and liabilities to reflect current exchange rates.

**Cross Rate**: An exchange rate between two currencies derived from their individual exchange rates with a third currency (usually USD).

### References

- [Technical Specification](./TS-currency-management.md)
- [Use Cases](./UC-currency-management.md)
- [Data Schema](./DS-currency-management.md)
- [Flow Diagrams](./FD-currency-management.md)
- [Validation Rules](./VAL-currency-management.md)
- [Account Code Mapping Module](../account-code-mapping/BR-account-code-mapping.md)
- [IAS 21 - The Effects of Changes in Foreign Exchange Rates](https://www.ifrs.org/issued-standards/list-of-standards/ias-21-the-effects-of-changes-in-foreign-exchange-rates/)
- [ISO 4217 Currency Codes](https://www.iso.org/iso-4217-currency-codes.html)

### Change Requests

| CR ID | Date | Description | Status |
|-------|------|-------------|--------|
| CR-001 | TBD | Initial version | Approved |

---

**Document End**

> 📝 **Document Status**: Draft - Pending Review
>
> **Next Steps**:
> - Review by Financial Controller and Treasury Manager
> - Review by External Auditor for IAS 21 compliance
> - Technical review by Development Team
> - Approval by CFO and Technical Lead
