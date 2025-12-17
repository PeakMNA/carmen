# Use Cases: Currency Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Currency Management
- **Route**: `/finance/currency-management`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-12
- **Owner**: Finance Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-12 | Carmen ERP Documentation Team | Initial version |

---

## Overview

This document describes the use cases for the Currency Management sub-module, which enables multi-currency business operations. The use cases cover currency configuration, foreign currency transaction processing, exchange rate management, currency revaluation, and multi-currency reporting. These workflows ensure accurate financial records across multiple currencies while maintaining compliance with IAS 21.

**Related Documents**:
- [Business Requirements](./BR-currency-management.md)
- [Technical Specification](./TS-currency-management.md)
- [Data Schema](./DS-currency-management.md)
- [Flow Diagrams](./FD-currency-management.md)
- [Validation Rules](./VAL-currency-management.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **Financial Controller / CFO** | Senior finance executive responsible for financial strategy | Defines base currency, approves currency policies, oversees currency risk |
| **Finance Manager** | Manages finance operations and accounting processes | Configures currencies, manages exchange rates, monitors currency exposure |
| **Accountant** | Performs daily accounting tasks | Processes foreign currency transactions, posts revaluation entries, reconciles currency accounts |
| **Treasury Manager** | Manages cash and foreign exchange | Monitors currency exposure, manages multi-currency bank accounts, tracks hedging |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **Accounts Payable Clerk** | Processes vendor payments | Processes foreign vendor invoices and payments |
| **Accounts Receivable Clerk** | Processes customer receipts | Processes foreign customer invoices and receipts |
| **Purchasing Manager** | Creates purchase orders | Creates POs in vendor's currency |
| **Sales Manager** | Creates sales invoices | Creates invoices in customer's currency |
| **Financial Analyst** | Analyzes financial data | Generates multi-currency reports, analyzes currency impacts |
| **External Auditor** | Independent auditor | Reviews currency treatment for IAS 21 compliance |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| **Exchange Rate Service** | Retrieves real-time and historical exchange rates from external providers | External API |
| **Posting Engine** | Generates journal entries with dual currency amounts | Core Service |
| **Currency Conversion Engine** | Calculates currency conversions using exchange rates | Core Service |
| **Revaluation Service** | Calculates unrealized exchange gains/losses at period-end | Background Job |
| **Account Code Mapping** | Provides GL accounts for exchange gain/loss posting | Internal Integration |
| **Banking System** | Provides multi-currency bank statement data | External Integration |
| **Procurement System** | Source of foreign vendor transactions | Internal Integration |
| **Sales System** | Source of foreign customer transactions | Internal Integration |

---

## Use Case Diagram

```
                    ┌──────────────────────────────────────────┐
                    │     Currency Management System           │
                    └────────────┬─────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
   ┌─────▼──────┐         ┌─────▼──────┐         ┌─────▼──────┐
   │ Financial  │         │  Finance   │         │ Accountant │
   │ Controller │         │  Manager   │         │            │
   └─────┬──────┘         └─────┬──────┘         └─────┬──────┘
         │                      │                       │
    [UC-CUR-001]           [UC-CUR-002]            [UC-CUR-007]
    [UC-CUR-010]           [UC-CUR-003]            [UC-CUR-008]
                           [UC-CUR-004]            [UC-CUR-009]
                           [UC-CUR-005]            [UC-CUR-011]
                           [UC-CUR-006]

   ┌──────────────┐        ┌──────────────┐       ┌──────────────┐
   │   Treasury   │        │      AP      │       │      AR      │
   │   Manager    │        │    Clerk     │       │    Clerk     │
   └──────┬───────┘        └──────┬───────┘       └──────┬───────┘
          │                       │                       │
     [UC-CUR-012]            [UC-CUR-013]            [UC-CUR-014]
     [UC-CUR-015]            [UC-CUR-016]            [UC-CUR-017]

  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
  │  Exchange Rate │      │    Currency    │      │  Revaluation   │
  │    Service     │      │  Conversion    │      │    Service     │
  │  (Automated)   │      │     Engine     │      │  (Background)  │
  └────────┬───────┘      └────────┬───────┘      └────────┬───────┘
           │                       │                       │
      [UC-CUR-101]            [UC-CUR-102]            [UC-CUR-103]
      [UC-CUR-104]            [UC-CUR-105]            [UC-CUR-106]
   (rate retrieval)      (conversion calc)       (period-end reval)

  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
  │  Procurement   │      │     Sales      │      │    Banking     │
  │    System      │      │    System      │      │    System      │
  │  Integration   │      │  Integration   │      │  Integration   │
  └────────┬───────┘      └────────┬───────┘      └────────┬───────┘
           │                       │                       │
      [UC-CUR-201]            [UC-CUR-202]            [UC-CUR-203]
   (foreign purchase)     (foreign sales)       (multi-curr bank)
```

**Legend**:
- **Top Section**: Primary finance users (controllers, managers, accountants, treasury)
- **Middle Section**: Operational users (AP/AR clerks processing foreign currency transactions)
- **Bottom Section**: System actors (automated services, integrations, background jobs)

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **Currency Configuration** | | | | | |
| UC-CUR-001 | Configure Base Currency | Financial Controller | Critical | Simple | User |
| UC-CUR-002 | Add Supported Currency | Finance Manager | Critical | Medium | User |
| UC-CUR-003 | Configure Currency Display Format | Finance Manager | Medium | Simple | User |
| UC-CUR-004 | Deactivate Currency | Finance Manager | Medium | Medium | User |
| UC-CUR-005 | Import Currency Master Data | Finance Manager | Low | Simple | User |
| **Exchange Rate Management** | | | | | |
| UC-CUR-006 | View Current Exchange Rates | Finance Manager | High | Simple | User |
| UC-CUR-007 | Manually Enter Exchange Rate | Accountant | High | Medium | User |
| UC-CUR-008 | Review Exchange Rate History | Accountant | Medium | Simple | User |
| **Foreign Currency Transactions** | | | | | |
| UC-CUR-009 | Process Foreign Currency Invoice | Accountant | Critical | Complex | User |
| UC-CUR-010 | Make Foreign Currency Payment | Accountant | Critical | Complex | User |
| UC-CUR-011 | Post Foreign Currency Receipt | Accountant | Critical | Complex | User |
| UC-CUR-012 | Manage Multi-Currency Bank Account | Treasury Manager | High | Medium | User |
| **AP/AR Foreign Currency Processing** | | | | | |
| UC-CUR-013 | Process Foreign Vendor Invoice | AP Clerk | Critical | Complex | User |
| UC-CUR-014 | Process Foreign Vendor Payment | AP Clerk | Critical | Complex | User |
| UC-CUR-015 | Process Foreign Customer Invoice | AR Clerk | Critical | Complex | User |
| UC-CUR-016 | Process Foreign Customer Receipt | AR Clerk | Critical | Complex | User |
| **Revaluation & Reporting** | | | | | |
| UC-CUR-017 | Run Period-End Currency Revaluation | Accountant | Critical | Complex | User |
| UC-CUR-018 | Generate Multi-Currency Trial Balance | Accountant | Critical | Medium | User |
| UC-CUR-019 | Generate Foreign Currency Exposure Report | Treasury Manager | High | Medium | User |
| UC-CUR-020 | Generate Exchange Gain/Loss Analysis | Financial Analyst | High | Medium | User |
| **Automated Processes** | | | | | |
| UC-CUR-101 | Retrieve Real-Time Exchange Rates | Exchange Rate Service | Critical | Medium | System |
| UC-CUR-102 | Calculate Currency Conversion | Currency Conversion Engine | Critical | Medium | System |
| UC-CUR-103 | Calculate Realized Exchange Gain/Loss | Posting Engine | Critical | Complex | System |
| UC-CUR-104 | Calculate Unrealized Exchange Gain/Loss | Revaluation Service | Critical | Complex | System |
| UC-CUR-105 | Post Exchange Gain/Loss Entry | Posting Engine | Critical | Medium | System |
| UC-CUR-106 | Reverse Previous Revaluation | Revaluation Service | High | Medium | System |
| **Integration Processes** | | | | | |
| UC-CUR-201 | Post Foreign Currency Purchase | Procurement Integration | Critical | Complex | Integration |
| UC-CUR-202 | Post Foreign Currency Sale | Sales Integration | Critical | Complex | Integration |
| UC-CUR-203 | Import Multi-Currency Bank Statement | Banking Integration | High | Complex | Integration |

**Complexity Definitions**:
- **Simple**: Single-step process, minimal logic, straightforward validation
- **Medium**: Multi-step process with business rules, moderate validation
- **Complex**: Multi-step process with complex calculations, multiple integrations, extensive error handling

---

## Detailed Use Cases

### UC-CUR-001: Configure Base Currency

**Actor**: Financial Controller / CFO

**Goal**: Designate the organization's base currency for financial reporting and consolidation.

**Priority**: Critical

**Complexity**: Simple

**Frequency**: Once during initial setup

**Preconditions**:
- User is logged in as Financial Controller or CFO
- Organization setup completed
- No transactions posted yet (base currency cannot be changed after transactions exist)
- User has permission to configure organization settings

**Main Flow**:
1. User navigates to Finance → Currency Management → Base Currency Configuration
2. System displays base currency selection interface
3. System displays current status: "No base currency configured"
4. User clicks "Select Base Currency" button
5. System displays list of available currencies with common currencies highlighted:
   - USD - United States Dollar (Recommended for US operations)
   - EUR - Euro
   - GBP - British Pound Sterling
   - JPY - Japanese Yen
   - Other currencies...
6. User searches and selects: USD - United States Dollar
7. System displays currency details:
   - Currency Code: USD
   - Currency Name: United States Dollar
   - Symbol: $
   - Decimal Places: 2
   - Country: United States
8. System displays confirmation dialog: "Set USD as base currency? This cannot be changed after transactions are posted."
9. User confirms selection
10. System validates that no transactions exist in the system
11. System sets USD as base currency
12. System updates organization configuration
13. System sets all GL accounts to base currency by default
14. System logs base currency configuration in audit trail
15. System displays success message: "Base currency set to USD successfully"
16. System displays base currency prominently in system header

**Alternative Flows**:

**AF-001-1: Multi-Entity with Different Base Currencies**
- At step 4, user selects "Configure by Entity" option
- System displays list of legal entities in organization
- For each entity:
  - User selects entity
  - User selects base currency for that entity
  - System validates selection
- System saves base currency configuration per entity
- System enables entity-specific currency controls

**Exception Flows**:

**EF-001-1: Transactions Already Exist**
- At step 10, system detects existing transactions
- System displays error: "Base currency cannot be changed. The system has 145 posted transactions."
- System shows transaction summary:
  - Earliest Transaction: 2025-10-01
  - Latest Transaction: 2025-11-11
  - Total Transactions: 145
- System displays message: "Contact technical support if base currency change is absolutely necessary."
- Use case ends

**EF-001-2: Insufficient Permissions**
- At step 4, system checks user permissions
- User lacks permission to set base currency
- System displays error: "Insufficient permissions. Only CFO can set base currency."
- System ends use case

**Postconditions**:
- **Success**: Base currency configured and active
- **Success**: All GL accounts default to base currency
- **Success**: Currency conversion enabled for foreign currencies
- **Success**: Base currency displayed throughout system
- **Success**: Audit trail entry created
- **Failure**: Base currency not changed, system remains in initial state

**Business Rules**:
- BR-CUR-002: Each organization must have exactly one base currency
- BR-CUR-002: Base currency cannot be changed after transactions exist

---

### UC-CUR-002: Add Supported Currency

**Actor**: Finance Manager

**Goal**: Add a new currency to support foreign currency transactions.

**Priority**: Critical

**Complexity**: Medium

**Frequency**: As needed when expanding to new countries/regions

**Preconditions**:
- User is logged in as Finance Manager
- Base currency configured
- User has permission to manage currencies
- Currency to be added is valid ISO 4217 currency

**Main Flow**:
1. User navigates to Finance → Currency Management → Currencies
2. System displays list of currently supported currencies
3. User clicks "Add Currency" button
4. System displays currency selection interface
5. User searches for currency: "GBP" or "British Pound"
6. System displays matching currencies:
   - GBP - British Pound Sterling (United Kingdom)
7. User selects GBP
8. System displays currency configuration form pre-filled with ISO 4217 data:
   - Currency Code: GBP (read-only)
   - Currency Name: British Pound Sterling
   - Currency Symbol: £
   - Minor Unit: 2 (decimal places)
   - Numeric Code: 826
   - Country: United Kingdom
9. User configures display format:
   - Symbol Position: Before amount (£100.00)
   - Thousand Separator: , (comma)
   - Decimal Separator: . (period)
10. User configures rounding rules:
    - Rounding Method: Standard
    - Rounding Precision: 0.01
11. User configures exchange rate source:
    - Primary Source: Bank of England API
    - Fallback Source: Manual Entry
    - Update Frequency: Hourly
12. User sets effective date: Today (currency active immediately)
13. User sets status: Active
14. User clicks "Save Currency"
15. System validates currency configuration
16. System checks GL accounts for exchange gain/loss configured
17. System creates currency record in database
18. System initializes exchange rate tracking for GBP
19. System logs currency addition in audit trail
20. System returns to currency list with GBP visible
21. System displays success message: "GBP - British Pound Sterling added successfully"

**Alternative Flows**:

**AF-002-1: Add Multiple Currencies in Batch**
- At step 3, user clicks "Add Multiple Currencies"
- System displays multi-select currency interface
- User selects multiple currencies: EUR, GBP, JPY
- System displays batch configuration form
- User configures common settings (rate source, effective date)
- System applies settings to all selected currencies
- System creates all currency records simultaneously
- System displays summary: "3 currencies added successfully"

**AF-002-2: Currency Already Exists (Inactive)**
- At step 15, system detects currency exists but is inactive
- System displays message: "GBP already exists but is inactive. Do you want to reactivate it?"
- User confirms reactivation
- System reactivates currency with new effective date
- System displays success: "GBP reactivated successfully"

**Exception Flows**:

**EF-002-1: Exchange Rate GL Accounts Not Configured**
- At step 16, system checks for required GL accounts
- System detects missing accounts:
  - 7200 - Realized Exchange Gain/Loss (missing)
  - 7210 - Unrealized Exchange Gain/Loss (missing)
- System displays warning: "Exchange gain/loss accounts not configured"
- System offers to create default accounts automatically
- User accepts automatic creation
- System creates default accounts
- Continue with step 17

**EF-002-2: Exchange Rate Source Unavailable**
- After step 18, system attempts to retrieve initial exchange rate
- External API unavailable or returns error
- System displays warning: "Unable to retrieve current exchange rate from Bank of England API"
- System prompts for manual initial rate entry
- User enters rate: 1 GBP = 1.2750 USD
- System saves manual rate with source marked as "Manual"
- Continue with step 20

**EF-002-3: Duplicate Currency**
- At step 15, system detects active currency with same code
- System displays error: "GBP is already active. Effective date: 2025-01-01. You cannot add the same currency twice."
- System displays current GBP configuration
- System offers to edit existing currency instead
- User cancels or chooses to edit existing currency

**Postconditions**:
- **Success**: New currency added and active
- **Success**: Currency available for transaction entry
- **Success**: Exchange rate tracking initialized
- **Success**: Currency appears in currency selection dropdowns
- **Success**: Audit trail entry created
- **Failure**: Currency not added, system state unchanged

**Business Rules**:
- BR-CUR-001: Currency codes must be unique and comply with ISO 4217
- BR-CUR-003: Active currencies can be used for transactions
- BR-CUR-005: Exchange rates required for all active currencies

---

### UC-CUR-009: Process Foreign Currency Invoice

**Actor**: Accountant

**Goal**: Record a vendor invoice denominated in a foreign currency with automatic conversion to base currency.

**Priority**: Critical

**Complexity**: Complex

**Frequency**: Daily (multiple times)

**Preconditions**:
- User is logged in as Accountant
- Base currency configured (USD)
- Foreign currency active (GBP)
- Current exchange rate available for GBP
- GL accounts configured for expenses and accounts payable
- User has permission to post invoices

**Main Flow**:
1. User navigates to Finance → Accounts Payable → Invoices
2. System displays invoice list
3. User clicks "New Invoice" button
4. System displays invoice entry form
5. User selects vendor: "Fresh Farm Suppliers UK"
6. System detects vendor's default currency: GBP
7. System auto-populates transaction currency: GBP
8. System displays dual currency entry interface:
   - Transaction Currency: GBP (primary)
   - Base Currency: USD (calculated automatically)
9. User enters invoice details:
   - Invoice Number: INV-UK-2501-00123
   - Invoice Date: 2025-11-12
   - Due Date: 2025-12-12
   - Terms: Net 30
10. User adds line items:
    - Description: Organic Vegetables
    - Quantity: 100 kg
    - Unit Price: £5.00 GBP
    - Line Total: £500.00 GBP
11. System retrieves current exchange rate for 2025-11-12:
    - Source: Bank of England API
    - Rate: 1 GBP = 1.2750 USD
    - Rate Date: 2025-11-12 09:00:00
12. System calculates base currency amount:
    - £500.00 GBP × 1.2750 = $637.50 USD
13. System displays both amounts:
    - Transaction Amount: £500.00 GBP
    - Base Currency Amount: $637.50 USD
    - Exchange Rate: 1.2750
14. User adds second line item:
    - Description: Fresh Fruits
    - Quantity: 50 kg
    - Unit Price: £8.00 GBP
    - Line Total: £400.00 GBP
15. System calculates base amount: £400.00 × 1.2750 = $510.00 USD
16. System calculates invoice totals:
    - Subtotal: £900.00 GBP ($1,147.50 USD)
    - Tax: £0.00 (UK VAT handled separately)
    - Invoice Total: £900.00 GBP ($1,147.50 USD)
17. System displays journal entry preview:
    ```
    Date: 2025-11-12
    Description: Invoice INV-UK-2501-00123 from Fresh Farm Suppliers UK

    Debit: 5100 - Cost of Goods Sold
      GBP £900.00 / USD $1,147.50
      Exchange Rate: 1.2750

    Credit: 2100 - Accounts Payable
      GBP £900.00 / USD $1,147.50
      Exchange Rate: 1.2750

    Status: Balanced (Debits = Credits in both currencies)
    ```
18. User reviews invoice and journal entry
19. User clicks "Post Invoice"
20. System validates invoice:
    - All required fields populated
    - Amounts balanced
    - Exchange rate valid and current
    - GL accounts exist and active
21. System posts invoice to AP
22. System generates journal entry with dual currency amounts
23. System posts journal entry to GL
24. System creates AP balance record in both currencies
25. System logs transaction in audit trail with exchange rate details
26. System sends invoice to document management system
27. System displays success message: "Invoice INV-UK-2501-00123 posted successfully. AP Balance: £900.00 GBP ($1,147.50 USD)"
28. System updates vendor balance display

**Alternative Flows**:

**AF-009-1: Manual Exchange Rate Override**
- At step 11, user notices rate is outdated or inaccurate
- User clicks "Override Exchange Rate"
- System displays rate override dialog with current rate: 1.2750
- User enters new rate: 1.2800
- System prompts for reason: "Bank provided better rate for large transaction"
- System validates rate within acceptable variance (±5%)
- User clicks "Apply Override"
- System recalculates all base currency amounts using 1.2800
- System marks exchange rate source as "Manual Override"
- Continue with step 13

**AF-009-2: Multi-Currency Invoice (Mixed Currencies)**
- At step 10, invoice has line items in different currencies
- User adds line item in EUR: €200.00
- System retrieves EUR/USD rate: 1.0800
- System calculates: €200.00 × 1.0800 = $216.00 USD
- System calculates invoice total in base currency:
  - GBP items: $1,147.50
  - EUR items: $216.00
  - Total: $1,363.50 USD
- System posts each currency separately to AP
- Continue with step 17

**AF-009-3: Historical Exchange Rate for Backdated Invoice**
- At step 9, user enters invoice date: 2025-10-15 (backdated)
- At step 11, system retrieves historical rate for 2025-10-15
- System displays: "Using historical rate from 2025-10-15: 1.2680"
- System uses historical rate for all calculations
- System marks posting date as today, transaction date as 2025-10-15
- Continue with step 12

**Exception Flows**:

**EF-009-1: Exchange Rate Unavailable**
- At step 11, exchange rate service fails or returns error
- System displays warning: "Unable to retrieve current GBP/USD exchange rate"
- System checks for cached rate:
  - Last Retrieved: 2025-11-12 08:00:00 (1 hour ago)
  - Rate: 1.2750
- System displays: "Using cached rate from 1 hour ago: 1.2750. OK to proceed?"
- User accepts cached rate or chooses manual entry
- If manual entry:
  - User enters rate: 1.2750
  - User enters source: "Reuters"
  - System requires approval for manual rate
- Continue with step 12

**EF-009-2: Currency Not Active**
- At step 7, system detects GBP is inactive
- System displays error: "GBP is not active for transactions. Activation required."
- System offers to activate GBP
- User contacts Finance Manager to activate currency
- Use case ends (retry after currency activated)

**EF-009-3: Unbalanced Entry Due to Rounding**
- At step 20, system detects rounding difference
- Calculated amounts:
  - Debit: $1,147.503 (rounded to $1,147.50)
  - Credit: $1,147.504 (rounded to $1,147.50)
  - Difference: $0.004
- Difference within tolerance (< $0.01)
- System posts entry as balanced
- System logs rounding difference in audit trail
- Continue with step 21

**EF-009-4: Significant Exchange Rate Change**
- At step 11, system retrieves rate: 1.3500 (previous day: 1.2750)
- System detects significant change: +5.9%
- System displays alert: "Exchange rate has changed significantly (+5.9% in 24 hours). Current rate: 1.3500. Please verify."
- System displays rate history chart
- User verifies rate is correct (GBP strengthened due to economic news)
- User confirms to proceed with current rate
- Continue with step 12

**Postconditions**:
- **Success**: Invoice posted to AP in both transaction and base currency
- **Success**: Journal entry created with dual currency amounts
- **Success**: AP balance updated in both currencies
- **Success**: Vendor balance updated
- **Success**: Exchange rate used documented in audit trail
- **Success**: Invoice document stored with currency details
- **Failure**: Invoice not posted, no GL entries created, system state unchanged

**Business Rules**:
- BR-CUR-008: All foreign currency transactions recorded in both transaction and base currency
- BR-CUR-009: Transaction date determines exchange rate used
- BR-CUR-005: Exchange rates must be valid and current
- BR-ACM-009: Journal entries must be balanced

**Related Requirements**:
- FR-CUR-003: Foreign Currency Transaction Processing
- FR-CUR-007: Currency Conversion and Rounding

---

### UC-CUR-010: Make Foreign Currency Payment

**Actor**: Accountant

**Goal**: Process a payment to foreign vendor with automatic realized exchange gain/loss calculation.

**Priority**: Critical

**Complexity**: Complex

**Frequency**: Daily

**Preconditions**:
- User is logged in as Accountant
- Foreign currency invoice exists in AP
- Foreign currency bank account configured or payment conversion handled
- Current exchange rate available
- User has permission to process payments

**Main Flow**:
1. User navigates to Finance → Accounts Payable → Payments
2. System displays list of outstanding invoices
3. User filters invoices: Currency = GBP, Vendor = "Fresh Farm Suppliers UK"
4. System displays invoice INV-UK-2501-00123:
   - Invoice Date: 2025-11-12
   - Amount: £900.00 GBP
   - Original Base Amount: $1,147.50 USD
   - Original Exchange Rate: 1.2750
   - Due Date: 2025-12-12
   - Days Outstanding: 8 days
5. User selects invoice and clicks "Make Payment"
6. System displays payment entry form
7. User enters payment details:
   - Payment Date: 2025-11-20
   - Payment Method: Bank Transfer
   - Bank Account: NatWest GBP Account
   - Amount to Pay: £900.00 GBP (full payment)
8. System retrieves current exchange rate for 2025-11-20:
   - Source: Bank of England API
   - Rate: 1 GBP = 1.2800 USD (GBP strengthened)
   - Rate Date: 2025-11-20 10:00:00
9. System calculates payment in base currency:
   - £900.00 GBP × 1.2800 = $1,152.00 USD
10. System compares with original invoice amount:
    - Original AP: £900.00 GBP recorded at $1,147.50 USD (rate 1.2750)
    - Payment: £900.00 GBP paid at $1,152.00 USD (rate 1.2800)
    - Difference: $1,152.00 - $1,147.50 = $4.50 USD
11. System calculates realized exchange loss:
    - Loss Amount: $4.50 USD
    - Reason: USD weakened relative to GBP (or GBP strengthened)
    - Impact: Cost more USD to pay same GBP amount
12. System displays payment summary with exchange impact:
    ```
    Payment Summary:
    Vendor: Fresh Farm Suppliers UK
    Invoice: INV-UK-2501-00123

    Foreign Currency Payment:
      Amount: £900.00 GBP
      Payment Rate: 1.2800
      Base Currency: $1,152.00 USD

    Original Invoice:
      Amount: £900.00 GBP
      Invoice Rate: 1.2750
      Base Currency: $1,147.50 USD

    Exchange Impact:
      Realized Exchange Loss: $4.50 USD
      Reason: GBP strengthened from 1.2750 to 1.2800
    ```
13. System displays journal entry preview:
    ```
    Date: 2025-11-20
    Description: Payment for Invoice INV-UK-2501-00123

    Debit: 2100 - Accounts Payable: $1,147.50 USD
      (Clear original AP balance)

    Debit: 7200 - Realized Exchange Loss: $4.50 USD
      (Exchange loss on settlement)

    Credit: 1111 - Cash - NatWest GBP: £900.00 / $1,152.00 USD
      (Payment from GBP bank account)

    Total Debit: $1,152.00 USD
    Total Credit: $1,152.00 USD
    Status: Balanced
    ```
14. User reviews payment and exchange impact
15. User clicks "Process Payment"
16. System validates payment:
    - Payment amount matches invoice amount
    - Bank account has sufficient balance
    - Exchange rate is current
    - GL accounts exist and active
17. System posts payment transaction
18. System clears AP invoice (marks as paid)
19. System posts journal entry with realized exchange loss
20. System updates bank account balance (both GBP and USD)
21. System updates vendor payment history
22. System logs payment with exchange details in audit trail
23. System generates payment confirmation document
24. System sends payment notification to vendor (optional)
25. System displays success message: "Payment processed successfully. Realized exchange loss: $4.50 USD posted to GL account 7200"

**Alternative Flows**:

**AF-010-1: Realized Exchange Gain**
- At step 8-11, exchange rate scenario different:
  - Original Invoice Rate: 1.2750
  - Payment Rate: 1.2700 (GBP weakened)
  - Original AP: $1,147.50 USD
  - Payment: £900.00 × 1.2700 = $1,143.00 USD
  - Difference: $1,147.50 - $1,143.00 = $4.50 USD Gain
- System calculates realized exchange gain: $4.50 USD
- Journal entry:
  ```
  Debit: 2100 - AP: $1,147.50
  Credit: 1111 - Cash GBP: $1,143.00
  Credit: 7200 - Realized Exchange Gain: $4.50
  ```
- System displays: "Realized exchange gain: $4.50 USD"
- Continue with step 14

**AF-010-2: Partial Payment with Proportional Exchange Gain/Loss**
- At step 7, user enters partial payment: £450.00 GBP (50%)
- At step 10, system calculates proportional amounts:
  - Original AP for £450.00: $573.75 (50% of $1,147.50)
  - Payment in USD: £450.00 × 1.2800 = $576.00
  - Realized loss on partial payment: $2.25 USD
- System posts partial payment:
  - Clear 50% of AP: $573.75
  - Exchange loss: $2.25
  - Cash: $576.00
- System updates remaining AP balance: £450.00 GBP ($573.75 USD)
- Continue with step 14

**AF-010-3: Payment in Different Currency (Currency Conversion)**
- At step 7, user selects payment from USD account instead of GBP account
- User enters payment: £900.00 GBP equivalent in USD
- System calculates USD payment amount: £900.00 × 1.2800 = $1,152.00 USD
- System posts payment from USD bank account
- Journal entry:
  ```
  Debit: 2100 - AP (GBP): $1,147.50
  Debit: 7200 - Realized Exchange Loss: $4.50
  Credit: 1110 - Cash USD: $1,152.00
  ```
- No foreign currency tracking needed for cash (USD = base currency)
- Continue with step 14

**Exception Flows**:

**EF-010-1: Insufficient Bank Balance**
- At step 16, system checks bank account balance
- GBP Account Balance: £500.00
- Payment Amount: £900.00
- Insufficient funds: Short £400.00
- System displays error: "Insufficient funds in NatWest GBP Account. Balance: £500.00. Required: £900.00. Shortage: £400.00"
- System suggests:
  - Wait for funds transfer
  - Use different bank account
  - Make partial payment
- User cancels payment or selects alternative
- Use case ends (retry after funds available)

**EF-010-2: Exchange Rate Expired**
- At step 8, system retrieves rate with timestamp: 2025-11-19 15:00:00
- Current time: 2025-11-20 14:00:00
- Rate age: 23 hours (exceeds 12-hour threshold)
- System displays warning: "Exchange rate is 23 hours old and may be stale"
- System attempts to refresh rate from API
- If refresh fails:
  - System displays cached rate and age
  - User decides to proceed or wait for updated rate
  - If proceed, system requires approval for old rate
- Continue with step 9

**EF-010-3: Large Exchange Loss Requires Approval**
- At step 11, system calculates realized loss: $125.00 (significant amount)
- System checks approval threshold: >$100 requires manager approval
- System displays: "Realized exchange loss of $125.00 exceeds approval threshold ($100)"
- System sends approval request to Finance Manager
- User receives notification: "Payment on hold pending approval"
- Finance Manager reviews and approves exchange loss
- System resumes payment processing
- Continue with step 15

**EF-010-4: Payment Processing Failure**
- At step 17, system attempts to post payment
- Database error or constraint violation occurs
- System rolls back all changes (no partial posting)
- System logs error details
- System displays error: "Payment processing failed. Please try again or contact support."
- System displays error code and timestamp for support reference
- Use case ends (no changes made to system)

**Postconditions**:
- **Success**: Payment posted and AP invoice cleared
- **Success**: Realized exchange gain/loss calculated and posted to GL
- **Success**: Bank account balance updated in both currencies
- **Success**: Vendor payment history updated
- **Success**: Payment confirmation generated
- **Success**: Audit trail includes exchange rate details and gain/loss calculation
- **Failure**: Payment not processed, invoice remains outstanding, system state unchanged

**Business Rules**:
- BR-CUR-009: Realized exchange gain/loss calculated at settlement date
- BR-CUR-009: Multiple partial payments each calculate proportional gain/loss
- BR-CUR-008: Dual currency amounts recorded for all transactions
- BR-ACM-009: Journal entries must be balanced

**Related Requirements**:
- FR-CUR-004: Exchange Gain and Loss Calculation
- FR-CUR-003: Foreign Currency Transaction Processing

---

### UC-CUR-017: Run Period-End Currency Revaluation

**Actor**: Accountant

**Goal**: Calculate and post unrealized exchange gains/losses for all open foreign currency balances at period-end.

**Priority**: Critical

**Complexity**: Complex

**Frequency**: Monthly (period-end)

**Preconditions**:
- User is logged in as Accountant
- Current accounting period is open
- Period-end date reached
- Open foreign currency balances exist (AR, AP, cash)
- Period-end exchange rates available for all currencies
- User has permission to post revaluation entries

**Main Flow**:
1. User navigates to Finance → Currency Management → Period-End Revaluation
2. System displays revaluation dashboard
3. System shows revaluation status:
   - Last Revaluation: 2025-10-31
   - Current Period: November 2025
   - Revaluation Status: Not Run
   - Period Close Status: Open
4. User clicks "Run Revaluation" button
5. System displays revaluation configuration:
   - Revaluation Date: 2025-11-30 (last day of period)
   - Base Currency: USD
   - Foreign Currencies to Revalue: GBP, EUR, JPY (all active)
6. User confirms revaluation date: 2025-11-30
7. System retrieves period-end exchange rates for 2025-11-30:
   - GBP: 1.2800 USD/GBP (Bank of England)
   - EUR: 1.0850 USD/EUR (European Central Bank)
   - JPY: 0.00690 USD/JPY (Bank of Japan)
8. System displays rate retrieval status: "3 of 3 rates retrieved successfully"
9. System identifies accounts requiring revaluation:
   - 1200 - Accounts Receivable (monetary item - revalue)
   - 2100 - Accounts Payable (monetary item - revalue)
   - 1110 - Cash Accounts (monetary item - revalue)
   - 1230 - Inventory (non-monetary item - DO NOT revalue)
10. System queries open foreign currency balances:
    ```
    Accounts Receivable (GBP):
      - Customer: UK Hotels Ltd
        Original: £10,000 @ 1.2750 = $12,750.00
        Revalued: £10,000 @ 1.2800 = $12,800.00
        Unrealized Gain: $50.00

      - Customer: London Restaurants
        Original: £5,000 @ 1.2700 = $6,350.00
        Revalued: £5,000 @ 1.2800 = $6,400.00
        Unrealized Gain: $50.00

    Accounts Payable (EUR):
      - Vendor: Paris Food Distributors
        Original: €15,000 @ 1.0800 = $16,200.00
        Revalued: €15,000 @ 1.0850 = $16,275.00
        Unrealized Loss: ($75.00)

    Cash - GBP Account:
      - Balance: £20,000
        Original: @ 1.2750 = $25,500.00
        Revalued: @ 1.2800 = $25,600.00
        Unrealized Gain: $100.00
    ```
11. System calculates total revaluation adjustments:
    - Total Unrealized Gains: $200.00 (AR GBP: $100, Cash GBP: $100)
    - Total Unrealized Losses: ($75.00) (AP EUR)
    - Net Unrealized Gain: $125.00
12. System displays revaluation summary report:
    ```
    Period-End Currency Revaluation
    Period: November 2025
    Revaluation Date: 2025-11-30
    Base Currency: USD

    Currency: GBP
      Exchange Rate: 1.2800 (Previous: 1.2750, Change: +0.39%)
      Accounts Receivable: +$100.00 gain
      Cash Accounts: +$100.00 gain
      Total GBP Impact: +$200.00 gain

    Currency: EUR
      Exchange Rate: 1.0850 (Previous: 1.0800, Change: +0.46%)
      Accounts Payable: -$75.00 loss
      Total EUR Impact: -$75.00 loss

    Net Revaluation Impact: +$125.00 gain

    Journal Entry to be Posted:
    Date: 2025-11-30
    Description: Period-end currency revaluation - November 2025

    Debit: 1200 - Accounts Receivable: $100.00
    Debit: 1110 - Cash: $100.00
    Debit: 7210 - Unrealized Exchange Loss: $75.00
    Credit: 2100 - Accounts Payable: $75.00
    Credit: 7210 - Unrealized Exchange Gain: $200.00

    Net Impact on P&L: +$125.00 gain
    ```
13. User reviews revaluation calculations and journal entry
14. User clicks "Post Revaluation"
15. System validates revaluation entry
16. System posts revaluation journal entry
17. System updates account balances in base currency:
    - AR: $12,750 → $12,850 (GBP accounts revalued)
    - AP: $16,200 → $16,275 (EUR accounts revalued)
    - Cash: $25,500 → $25,600 (GBP cash revalued)
18. System marks revaluation as completed for period
19. System sets reversal flag for next period start
20. System logs revaluation details in audit trail:
    - Exchange rates used (source and date)
    - Accounts revalued
    - Gain/loss calculations
    - Journal entry posted
21. System displays success message: "Period-end revaluation completed. Net unrealized gain: $125.00 posted to GL account 7210"
22. System displays reversal reminder: "Reversal entry will be posted automatically on 2025-12-01"

**Alternative Flows**:

**AF-017-1: Preview Revaluation Without Posting**
- At step 5, user clicks "Preview Revaluation"
- System performs steps 7-12 (calculations only)
- System displays revaluation summary in preview mode
- No journal entries posted
- User reviews calculations
- User returns to step 14 to post when ready

**AF-017-2: Selective Currency Revaluation**
- At step 5, user deselects EUR from revaluation
- System revalues only GBP and JPY
- System excludes EUR balances from calculations
- System posts journal entry for selected currencies only
- Continue with step 13

**AF-017-3: Automatic Reversal at Period Start**
- On 2025-12-01 (first day of next period)
- System automatically posts reversal entry:
  ```
  Date: 2025-12-01
  Description: Reversal of Nov 2025 currency revaluation

  Debit: 2100 - AP: $75.00
  Debit: 7210 - Unrealized Exchange Gain: $200.00
  Credit: 1200 - AR: $100.00
  Credit: 1110 - Cash: $100.00
  Credit: 7210 - Unrealized Exchange Loss: $75.00
  ```
- System resets balances to original transaction amounts
- System enables fresh revaluation for December
- System sends notification to Accountant

**Exception Flows**:

**EF-017-1: Exchange Rate Unavailable**
- At step 7, EUR rate retrieval fails
- System displays error: "Unable to retrieve EUR/USD rate for 2025-11-30"
- System displays last available rate:
  - Rate: 1.0800 (from 2025-11-29)
  - Age: 24 hours
- System prompts user to enter manual rate
- User enters rate: 1.0850
- User enters source: "ECB website"
- System requires manager approval for manual rate
- Finance Manager approves
- Continue with step 8

**EF-017-2: Period Not Ready for Close**
- At step 4, system checks period close prerequisites
- System detects issues:
  - 5 unposted transactions pending
  - Bank reconciliation not completed
  - Inventory count not finalized
- System displays warning: "Period-end checklist incomplete. Revaluation should run after all transactions are posted."
- System displays checklist with status:
  - ✅ All invoices posted
  - ❌ Bank reconciliation pending
  - ❌ Inventory count pending
  - ❌ 5 draft transactions
- User chooses to proceed anyway or complete prerequisites first
- If proceed, system requires override approval

**EF-017-3: Large Unrealized Loss Exceeds Threshold**
- At step 11, system calculates large unrealized loss: $15,000
- System checks threshold: >$10,000 requires CFO review
- System displays alert: "Unrealized loss of $15,000 exceeds review threshold"
- System provides drill-down to loss detail:
  - Currency: EUR
  - Rate Change: 1.0500 → 1.1200 (+6.7%)
  - Largest Impact: Vendor ABC Corp (€100,000 = $10,000 loss)
- System sends notification to CFO for review
- CFO reviews currency exposure and loss
- CFO approves or requests hedge action
- Continue with step 14 after approval

**EF-017-4: Previous Revaluation Not Reversed**
- At step 4, system detects unreversed revaluation from previous period
- System displays error: "October 2025 revaluation not reversed. Reversal required before new revaluation."
- System offers to post missing reversal entry
- User approves reversal posting
- System posts October reversal entry dated 2025-11-01
- System updates balances
- Continue with step 5

**Postconditions**:
- **Success**: Unrealized exchange gains/losses calculated and posted
- **Success**: Foreign currency account balances adjusted to period-end rates
- **Success**: P&L includes unrealized gains/losses for the period
- **Success**: Reversal entry flagged for automatic posting next period
- **Success**: Audit trail includes complete revaluation details
- **Success**: Revaluation marked as complete for period
- **Failure**: Revaluation not posted, account balances unchanged, system state preserved

**Business Rules**:
- BR-CUR-010: Unrealized gains/losses calculated at period-end
- BR-CUR-010: Revaluation applies to monetary items only (AR, AP, cash)
- BR-CUR-010: Non-monetary items (inventory, fixed assets) not revalued
- BR-CUR-010: Unrealized gains/losses reversed at start of next period

**Related Requirements**:
- FR-CUR-004: Exchange Gain and Loss Calculation
- FR-ACM-007: Period Management

---

## System Use Cases

### UC-CUR-101: Retrieve Real-Time Exchange Rates

**Description**: Automated service retrieves current and historical exchange rates from external providers.

**Actor**: Exchange Rate Service (Automated)

**Trigger**:
- **Schedule**: Hourly (Cron: 0 * * * *)
- **Event**: Manual rate refresh requested by user
- **Event**: Transaction posted requiring current rate

**Priority**: Critical

**Frequency**: Hourly + On-demand

**Preconditions**:
- Exchange rate service configured
- API credentials valid
- External rate provider accessible
- Active currencies configured in system

**Main Flow**:
1. System scheduler triggers rate retrieval at top of hour
2. Service retrieves list of active foreign currencies: [GBP, EUR, JPY]
3. Service builds rate request for each currency pair:
   - GBP/USD
   - EUR/USD
   - JPY/USD
4. Service calls external API (Bank of England, ECB, etc.) for each currency
5. External API returns rate data:
   ```json
   {
     "currency": "GBP",
     "baseCurrency": "USD",
     "rate": 1.2800,
     "timestamp": "2025-11-20T10:00:00Z",
     "source": "Bank of England",
     "bidRate": 1.2795,
     "askRate": 1.2805,
     "midRate": 1.2800
   }
   ```
6. Service validates rate data:
   - Rate is positive number
   - Rate is within reasonable bounds (0.0001 to 10,000)
   - Rate variance from previous rate within threshold (±10%)
   - Timestamp is current (within last 10 minutes)
7. Service stores rate in database:
   - Current rate (latest)
   - Historical rate (for audit trail)
   - Rate metadata (source, timestamp, bid/ask)
8. Service updates rate cache for fast retrieval
9. Service logs rate update in audit trail
10. Service publishes "RateUpdated" event to message bus
11. Service updates monitoring metrics:
    - Last successful retrieval timestamp
    - Retrieval success rate
    - Rate volatility indicators
12. Process completes successfully

**Alternative Flows**:

**Alt-101A: Partial Success (Some Rates Retrieved)**
- At step 4, GBP and EUR rates retrieved successfully
- At step 4, JPY rate retrieval fails (timeout)
- Service commits successful rates (GBP, EUR)
- Service logs JPY retrieval failure
- Service queues JPY for retry in 5 minutes
- Service sends alert if retry also fails
- Continue with step 9 for successful rates

**Alt-101B: Rate Within Cached Threshold**
- At step 5, new rate very close to cached rate
- New Rate: 1.2801, Cached Rate: 1.2800
- Variance: 0.008% (below 0.1% update threshold)
- Service decides not to update (avoid excessive updates)
- Service updates timestamp only
- Service logs "Rate unchanged (below threshold)"
- Process completes

**Exception Flows**:

**Exc-101A: API Authentication Failure**
- At step 4, API returns 401 Unauthorized
- Service logs authentication error
- Service attempts token refresh
- If refresh successful:
  - Retry API call with new token
  - Continue with step 5
- If refresh fails:
  - Service sends critical alert to administrators
  - Service uses last cached rate (if < 24 hours old)
  - Service logs fallback to cached rate
  - Process ends

**Exc-101B: Rate Variance Exceeds Threshold**
- At step 6, new rate validation detects large variance
- Previous Rate: 1.2800, New Rate: 1.4000 (+9.4%)
- Variance exceeds threshold (>5% change in 1 hour)
- Service flags rate as suspicious
- Service logs variance alert
- Service sends notification to Finance Manager for review
- Service does NOT auto-update rate
- Service uses previous rate until manual verification
- Process ends (requires manual intervention)

**Exc-101C: External API Unavailable**
- At step 4, API call fails (timeout, 500 error, network error)
- Service logs API failure
- Service checks cached rate age:
  - If < 12 hours: Use cached rate, log warning
  - If > 12 hours: Send alert, require manual rate entry
- Service attempts fallback to secondary rate provider
- If fallback successful:
  - Use fallback rate with "Secondary Source" marker
  - Continue with step 6
- If all sources fail:
  - Service sends critical alert
  - System prompts users for manual rates when needed
  - Process ends

**Data Contract**:

**Input**: None (scheduled trigger)

**Output**:
```json
{
  "success": true,
  "ratesUpdated": 3,
  "ratesFailed": 0,
  "timestamp": "2025-11-20T10:00:00Z",
  "rates": [
    {
      "currency": "GBP",
      "rate": 1.2800,
      "source": "Bank of England",
      "timestamp": "2025-11-20T10:00:00Z"
    },
    {
      "currency": "EUR",
      "rate": 1.0850,
      "source": "European Central Bank",
      "timestamp": "2025-11-20T10:00:00Z"
    },
    {
      "currency": "JPY",
      "rate": 0.00690,
      "source": "Bank of Japan",
      "timestamp": "2025-11-20T10:00:00Z"
    }
  ]
}
```

**Business Rules**:
- BR-CUR-005: Exchange rates required for all active currencies
- BR-CUR-007: Rate source must be documented
- BR-CUR-005: Manual rates require approval if variance >5%

**SLA**:
- **Processing Time**: < 30 seconds for all active currencies
- **Availability**: 99.5% successful retrievals
- **Recovery Time**: < 5 minutes retry for failures

**Monitoring**:
- Success rate (target >99%)
- Retrieval time (target <30s)
- Rate variance alerts
- API availability

---

### UC-CUR-103: Calculate Realized Exchange Gain/Loss

**Description**: Automated calculation of realized exchange gain or loss when foreign currency transaction is settled.

**Actor**: Posting Engine (Automated)

**Trigger**: Foreign currency payment or receipt posted

**Priority**: Critical

**Frequency**: Real-time (per transaction)

**Preconditions**:
- Foreign currency invoice exists in AP or AR
- Payment/receipt transaction being posted
- Original transaction exchange rate recorded
- Settlement exchange rate available
- Exchange gain/loss GL accounts configured

**Main Flow**:
1. System detects foreign currency payment transaction posted
2. System retrieves original invoice details:
   - Invoice ID: INV-UK-2501-00123
   - Invoice Date: 2025-11-12
   - Amount: £900.00 GBP
   - Original Rate: 1.2750 USD/GBP
   - Original Base Amount: $1,147.50 USD
3. System retrieves payment details:
   - Payment Date: 2025-11-20
   - Amount: £900.00 GBP (full payment)
   - Settlement Rate: 1.2800 USD/GBP
   - Payment Base Amount: $1,152.00 USD
4. System calculates exchange difference:
   - Original Base: $1,147.50
   - Payment Base: $1,152.00
   - Difference: $1,152.00 - $1,147.50 = $4.50
5. System determines gain or loss:
   - Difference > 0: Loss (cost more base currency)
   - Difference < 0: Gain (cost less base currency)
   - Result: $4.50 Loss
6. System validates exchange difference calculation:
   - Difference = Foreign Amount × (Settlement Rate - Original Rate)
   - £900.00 × (1.2800 - 1.2750) = £900.00 × 0.0050 = $4.50 ✓
7. System determines GL account for posting:
   - Loss: Debit 7200 - Realized Exchange Loss
   - Gain: Credit 7200 - Realized Exchange Gain
8. System generates journal entry lines:
   ```
   Debit: 2100 - Accounts Payable: $1,147.50
     (Clear original AP balance)

   Debit: 7200 - Realized Exchange Loss: $4.50
     (Exchange loss on settlement)

   Credit: 1110 - Cash: $1,152.00
     (Payment amount)

   Total Debit: $1,152.00
   Total Credit: $1,152.00
   ```
9. System posts journal entry to GL
10. System updates invoice status: Paid
11. System records exchange gain/loss details in transaction audit trail:
    - Original Rate: 1.2750
    - Settlement Rate: 1.2800
    - Rate Change: +0.39%
    - Gain/Loss Amount: -$4.50 (loss)
    - Gain/Loss Account: 7200
12. System publishes "RealizedGainLossPosted" event
13. System updates exchange gain/loss summary for reporting
14. Process completes successfully

**Alternative Flows**:

**Alt-103A: Realized Exchange Gain**
- At step 3, settlement rate lower: 1.2700
- At step 4, payment base amount: £900.00 × 1.2700 = $1,143.00
- At step 4, difference: $1,147.50 - $1,143.00 = $4.50 gain
- At step 7, journal entry:
  ```
  Debit: 2100 - AP: $1,147.50
  Credit: 1110 - Cash: $1,143.00
  Credit: 7200 - Realized Exchange Gain: $4.50
  ```
- Continue with step 9

**Alt-103B: Partial Payment (Proportional Gain/Loss)**
- At step 2-3, partial payment: £450.00 (50% of invoice)
- At step 4, proportional calculation:
  - Original Base for £450.00: $573.75 (50% of $1,147.50)
  - Payment Base: £450.00 × 1.2800 = $576.00
  - Proportional Loss: $2.25
- System posts partial payment with proportional gain/loss
- System updates remaining AP balance: £450.00 ($573.75)
- Continue with step 9

**Alt-103C: Zero Exchange Difference**
- At step 4, settlement rate equals original rate: 1.2750
- Payment Base: $1,147.50 (same as original)
- Difference: $0.00
- System skips gain/loss posting (no exchange impact)
- Journal entry:
  ```
  Debit: 2100 - AP: $1,147.50
  Credit: 1110 - Cash: $1,147.50
  ```
- System logs: "No exchange gain/loss (rates equal)"
- Continue with step 10

**Exception Flows**:

**Exc-103A: Missing Original Exchange Rate**
- At step 2, original invoice lacks recorded exchange rate
- System cannot calculate gain/loss without original rate
- System logs error: "Original exchange rate missing for INV-UK-2501-00123"
- System sends alert to Accountant
- System posts payment without gain/loss (temporarily)
- System flags transaction for manual review
- Accountant corrects original rate and reposts
- Process ends (requires manual intervention)

**Exc-103B: GL Account Not Configured**
- At step 7, exchange gain/loss account not found
- System checks for 7200 - Realized Exchange Gain/Loss
- Account does not exist or is inactive
- System logs error: "GL account 7200 not configured"
- System cannot post gain/loss entry
- System sends alert to Finance Manager
- System holds payment posting
- Finance Manager configures account
- System retries posting
- Process ends (requires configuration)

**Exc-103C: Calculation Validation Failure**
- At step 6, validation detects discrepancy
- Calculated difference: $4.50
- Expected difference (alternate calculation): $4.51
- Variance: $0.01 (rounding difference)
- System accepts difference (within $0.01 tolerance)
- System logs rounding difference
- Continue with step 7

**Business Rules**:
- BR-CUR-009: Realized gain/loss calculated at settlement
- BR-CUR-009: Gain/loss posted to P&L account
- BR-CUR-009: Partial payments calculate proportional gain/loss

**SLA**:
- **Processing Time**: < 500ms per transaction
- **Accuracy**: 100% correct calculations (no errors)
- **Availability**: 99.9% successful processing

**Monitoring**:
- Calculation success rate
- Processing time
- Gain/loss amounts and trends
- Error rate and types

---

## Integration Use Cases

### UC-CUR-201: Post Foreign Currency Purchase

**Description**: Integration with Procurement System to post purchase transactions in foreign currencies.

**Actor**: Procurement System (Integration)

**Trigger**: Purchase invoice approved in Procurement System

**Integration Type**: Internal Module Integration (Event-Driven)

**Direction**: Inbound (Procurement → Finance)

**Priority**: Critical

**Frequency**: Real-time (per transaction)

**Preconditions**:
- Purchase invoice approved in Procurement System
- Vendor currency configured
- Current exchange rate available for vendor currency
- GL accounts mapped for purchase categories
- Finance module integration active

**Main Flow**:
1. Procurement System publishes "PurchaseInvoiceApproved" event to message queue
2. Currency Management Service subscribes to event
3. Service receives event payload:
   ```json
   {
     "eventId": "evt-12345",
     "eventType": "PurchaseInvoiceApproved",
     "timestamp": "2025-11-20T10:30:00Z",
     "invoiceId": "INV-UK-2501-00123",
     "vendorId": "VEN-UK-001",
     "vendorName": "Fresh Farm Suppliers UK",
     "vendorCurrency": "GBP",
     "invoiceDate": "2025-11-12",
     "dueDate": "2025-12-12",
     "lineItems": [
       {
         "description": "Organic Vegetables",
         "quantity": 100,
         "unitPrice": 5.00,
         "currency": "GBP",
         "total": 500.00,
         "category": "Food & Beverage"
       },
       {
         "description": "Fresh Fruits",
         "quantity": 50,
         "unitPrice": 8.00,
         "currency": "GBP",
         "total": 400.00,
         "category": "Food & Beverage"
       }
     ],
     "invoiceTotal": 900.00,
     "currency": "GBP"
   }
   ```
4. Service validates event data:
   - Invoice ID valid and unique
   - Vendor exists in Finance system
   - Currency is active (GBP)
   - Line items have valid GL mappings
5. Service retrieves exchange rate for invoice date (2025-11-12):
   - Currency: GBP
   - Base Currency: USD
   - Rate: 1.2750 USD/GBP
   - Source: Historical rate for 2025-11-12
6. Service converts line items to base currency:
   - Line 1: £500.00 × 1.2750 = $637.50
   - Line 2: £400.00 × 1.2750 = $510.00
   - Total: £900.00 = $1,147.50
7. Service retrieves GL account mappings:
   - Category: Food & Beverage → GL Account: 5100 (COGS)
   - Vendor AP → GL Account: 2100 (Accounts Payable)
8. Service generates journal entry:
   ```
   Date: 2025-11-12
   Source: Procurement System
   Document: INV-UK-2501-00123
   Description: Purchase from Fresh Farm Suppliers UK

   Debit: 5100 - Cost of Goods Sold
     GBP £900.00 / USD $1,147.50
     Exchange Rate: 1.2750
     Dimensions: Department=KITCHEN, Location=MAIN

   Credit: 2100 - Accounts Payable
     GBP £900.00 / USD $1,147.50
     Exchange Rate: 1.2750
     Vendor: VEN-UK-001
   ```
9. Service posts journal entry to GL
10. Service creates AP invoice record:
    - Foreign Currency: £900.00 GBP
    - Base Currency: $1,147.50 USD
    - Exchange Rate: 1.2750
    - Status: Open
11. Service updates vendor balance (both currencies)
12. Service logs transaction in audit trail with exchange details
13. Service publishes "FinanceEntryPosted" event back to Procurement
14. Service acknowledges original event
15. Process completes successfully

**Alternative Flows**:

**Alt-201A: Multi-Currency Invoice**
- At step 3, invoice has line items in mixed currencies
- Service processes each currency separately:
  - GBP items: £900.00 @ 1.2750 = $1,147.50
  - EUR items: €200.00 @ 1.0800 = $216.00
- Service creates separate journal entry lines per currency
- Service posts combined journal entry
- Service creates separate AP records per currency
- Continue with step 12

**Alt-201B: Manual Exchange Rate Override**
- At step 5, event payload includes manual rate:
  ```json
  "exchangeRate": 1.2800,
  "rateSource": "Manual - Vendor Rate",
  "approvedBy": "john.doe@company.com"
  ```
- Service uses provided manual rate instead of automatic retrieval
- Service validates manual rate within acceptable variance
- Service marks rate source as "Manual Override"
- Continue with step 6

**Exception Flows**:

**Exc-201A: Exchange Rate Not Available**
- At step 5, historical rate retrieval fails for 2025-11-12
- Service logs error: "Exchange rate for GBP on 2025-11-12 not available"
- Service attempts to use nearest available rate:
  - 2025-11-11: 1.2745
  - 2025-11-13: 1.2755
- Service uses interpolated rate: 1.2750
- Service marks rate source as "Interpolated"
- Service sends alert to Finance Manager for review
- Continue with step 6

**Exc-201B: Currency Not Active**
- At step 4, validation detects GBP is inactive
- Service cannot process foreign currency transaction
- Service logs error: "Currency GBP is not active"
- Service does NOT acknowledge event
- Event returns to queue for retry
- Service sends alert to Finance Manager to activate currency
- Process ends (retry after currency activated)

**Exc-201C: GL Account Mapping Not Found**
- At step 7, service cannot map "Food & Beverage" category to GL
- Service logs error: "No GL mapping found for category: Food & Beverage"
- Service creates transaction in "Unmapped Transactions" queue
- Service sends alert to Finance Manager
- Finance Manager configures mapping rule
- Service reprocesses transaction with correct mapping
- Process ends (requires manual intervention)

**Exc-201D: Journal Entry Posting Failure**
- At step 9, posting fails due to database constraint or validation
- Service logs detailed error
- Service rolls back all changes (no partial posting)
- Service does NOT acknowledge event
- Event remains in queue for retry
- Service sends alert with error details
- After max retries, moves to dead letter queue
- Process ends (requires investigation)

**Data Mapping**:

| Procurement Field | Finance Field | Transformation |
|-------------------|---------------|----------------|
| invoiceId | source_document_id | Direct |
| vendorId | vendor_id | Direct |
| vendorCurrency | transaction_currency | Direct |
| invoiceTotal | transaction_amount | Direct |
| invoiceDate | transaction_date | Parse date |
| lineItems[].category | gl_account_code | Mapping rule engine |
| lineItems[].total | debit_amount | Currency conversion |

**Business Rules**:
- BR-CUR-008: Dual currency recording for all foreign transactions
- BR-CUR-006: Transaction date determines exchange rate
- BR-ACM-005: Automated posting follows mapping rules

**SLA**:
- **Processing Time**: < 2 seconds per invoice
- **Availability**: 99.9% successful processing
- **Retry**: 3 attempts with exponential backoff

**Monitoring**:
- Event processing success rate
- Processing time per invoice
- Currency conversion success rate
- GL posting success rate
- Dead letter queue depth

**Rollback Procedure**:
If posted transaction needs reversal:
1. Finance Manager identifies incorrect posting
2. Manager initiates reversal workflow
3. System generates reversing journal entry
4. System posts reversal with original date reference
5. System notifies Procurement of reversal
6. Procurement resubmits corrected invoice
7. System reprocesses with corrections

---

## Use Case Traceability Matrix

| Use Case | Functional Req | Business Rule | Test Case | Status |
|----------|----------------|---------------|-----------|--------|
| UC-CUR-001 | FR-CUR-002 | BR-CUR-002 | TC-CUR-001 | Planned |
| UC-CUR-002 | FR-CUR-001 | BR-CUR-001, BR-CUR-003 | TC-CUR-002 | Planned |
| UC-CUR-009 | FR-CUR-003 | BR-CUR-008, BR-CUR-009 | TC-CUR-009 | Planned |
| UC-CUR-010 | FR-CUR-004 | BR-CUR-009 | TC-CUR-010 | Planned |
| UC-CUR-017 | FR-CUR-004 | BR-CUR-010 | TC-CUR-017 | Planned |
| UC-CUR-101 | FR-CUR-008 | BR-CUR-005, BR-CUR-007 | TC-CUR-101 | Planned |
| UC-CUR-103 | FR-CUR-004 | BR-CUR-009 | TC-CUR-103 | Planned |
| UC-CUR-201 | FR-CUR-003 | BR-CUR-008, BR-CUR-006 | TC-CUR-201 | Planned |

---

## Appendix

### Glossary

**Actor**: Person, system, or external entity that interacts with the Currency Management system
**Base Currency**: Primary currency for financial reporting (e.g., USD for US operations)
**Foreign Currency**: Any currency other than the base currency
**Transaction Currency**: Currency in which a specific transaction is denominated
**Exchange Rate**: Rate at which one currency can be exchanged for another
**Spot Rate**: Current exchange rate for immediate delivery
**Realized Gain/Loss**: Gain or loss when foreign currency transaction settles
**Unrealized Gain/Loss**: Gain or loss from revaluing unsettled foreign currency balances
**Revaluation**: Process of adjusting foreign currency balances to current exchange rates
**Dual Currency Recording**: Recording transactions in both transaction and base currency
**ISO 4217**: International standard for currency codes
**Monetary Items**: Assets or liabilities with fixed currency amounts (cash, AR, AP)
**Non-Monetary Items**: Assets not requiring revaluation (inventory, fixed assets)

### Common Use Case Patterns

**Pattern: Foreign Currency Transaction Entry**
1. User selects vendor/customer (currency auto-populated)
2. User enters transaction in foreign currency
3. System retrieves current exchange rate
4. System calculates base currency amount automatically
5. System displays dual currency amounts
6. User reviews and posts transaction
7. System posts journal entry with both currencies

**Pattern: Exchange Gain/Loss Calculation**
1. System identifies foreign currency settlement
2. System retrieves original transaction rate
3. System retrieves current/settlement rate
4. System calculates exchange difference
5. System determines gain or loss
6. System posts gain/loss to appropriate GL account
7. System logs calculation details

**Pattern: Period-End Revaluation**
1. User initiates revaluation for period-end
2. System retrieves period-end exchange rates
3. System identifies open foreign currency balances
4. System calculates unrealized gains/losses
5. System generates revaluation journal entry
6. System posts revaluation to GL
7. System flags reversal for next period start

---

**Document End**

> 📝 **Document Status**: Draft - Pending Review
>
> **Next Steps**:
> - Review by Finance Manager and Treasury Manager
> - User acceptance testing of critical workflows
> - Technical review by Development Team
> - Integration testing with Procurement and Sales modules
