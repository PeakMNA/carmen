# Use Cases: Exchange Rate Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Exchange Rate Management
- **Route**: `/finance/exchange-rate-management`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-13
- **Owner**: Finance Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-01-13 | Finance Product Team | Initial version |

---

## Overview

This document describes the use cases for the Exchange Rate Management sub-module, which enables organizations to maintain accurate and timely exchange rates for multi-currency operations. The use cases cover manual rate entry, automated rate updates from external providers, rate approval workflows, real-time currency conversions, historical rate management, and period-end revaluation processes. These workflows ensure accurate financial records while maintaining compliance with IAS 21 (The Effects of Changes in Foreign Exchange Rates).

**Related Documents**:
- [Business Requirements](./BR-exchange-rate-management.md)
- [Technical Specification](./TS-exchange-rate-management.md)
- [Data Schema](./DS-exchange-rate-management.md)
- [Flow Diagrams](./FD-exchange-rate-management.md)
- [Validation Rules](./VAL-exchange-rate-management.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **Financial Controller / CFO** | Senior finance executive responsible for financial strategy | Oversees exchange rate policy, approves high-variance rates, reviews currency exposure |
| **Finance Manager** | Manages finance operations and accounting processes | Configures rate providers, approves manual rates, monitors rate accuracy |
| **Treasury Manager** | Manages cash and foreign exchange risk | Manages forward contracts, monitors currency exposure, tracks hedging effectiveness |
| **Accountant** | Performs daily accounting tasks | Enters manual rates when needed, runs period-end revaluations, posts exchange adjustments |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **Purchasing Manager** | Creates purchase orders and manages procurement | Views exchange rates for vendor pricing decisions, uses conversion tool |
| **Accounts Payable Clerk** | Processes vendor payments | Uses exchange rates for foreign vendor payment processing |
| **Accounts Receivable Clerk** | Processes customer receipts | Uses exchange rates for foreign customer invoice processing |
| **Financial Analyst** | Analyzes financial data | Generates currency reports, analyzes exchange rate trends and impacts |
| **External Auditor** | Independent auditor | Reviews exchange rate sources and historical accuracy for IAS 21 compliance |
| **System Administrator** | IT personnel managing system configuration | Configures API credentials, monitors provider health, troubleshoots failures |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| **OpenExchangeRates API** | Provides real-time and historical exchange rates | External API (REST) |
| **Bloomberg Terminal** | Enterprise-grade financial data provider | External API |
| **European Central Bank (ECB)** | Official EUR reference rates | External XML Feed |
| **Federal Reserve** | Official USD reference rates | External CSV/API |
| **Rate Update Scheduler** | Automated background job that updates rates on schedule | Background Job (Cron) |
| **Currency Conversion Engine** | Core service that calculates currency conversions | Core Service |
| **Revaluation Engine** | Calculates unrealized gains/losses at period-end | Background Job |
| **Account Code Mapping** | Provides GL accounts for exchange gain/loss posting | Internal Integration |
| **Audit Logger** | Records all rate changes and approvals | Core Service |
| **Procurement System** | Requests currency conversions for purchase orders | Internal Integration |
| **Sales System** | Requests currency conversions for sales invoices | Internal Integration |
| **Email/Notification Service** | Sends alerts for rate approvals and failures | External Service |

---

## Use Case Diagram

```
                    ┌──────────────────────────────────────────────┐
                    │   Exchange Rate Management System            │
                    └────────────┬─────────────────────────────────┘
                                 │
         ┌───────────────────────┼────────────────────────┐
         │                       │                        │
   ┌─────▼──────┐         ┌─────▼──────┐         ┌──────▼─────┐
   │ Financial  │         │  Finance   │         │  Treasury  │
   │ Controller │         │  Manager   │         │  Manager   │
   └─────┬──────┘         └─────┬──────┘         └──────┬─────┘
         │                      │                        │
    [UC-EXR-001]           [UC-EXR-002]             [UC-EXR-010]
    [UC-EXR-009]           [UC-EXR-003]             [UC-EXR-011]
    [UC-EXR-020]           [UC-EXR-004]             [UC-EXR-012]
                           [UC-EXR-005]
                           [UC-EXR-006]
                           [UC-EXR-007]
                           [UC-EXR-008]

   ┌──────────────┐        ┌──────────────┐       ┌──────────────┐
   │ Accountant   │        │  Purchasing  │       │   Financial  │
   │              │        │   Manager    │       │   Analyst    │
   └──────┬───────┘        └──────┬───────┘       └──────┬───────┘
          │                       │                      │
     [UC-EXR-013]            [UC-EXR-015]           [UC-EXR-016]
     [UC-EXR-014]            [UC-EXR-017]           [UC-EXR-018]
     [UC-EXR-019]

  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
  │ Rate Update    │      │  Conversion    │      │  Revaluation   │
  │   Scheduler    │      │    Engine      │      │    Engine      │
  │  (Automated)   │      │ (Real-time)    │      │  (Background)  │
  └────────┬───────┘      └────────┬───────┘      └────────┬───────┘
           │                       │                       │
      [UC-EXR-101]            [UC-EXR-105]            [UC-EXR-107]
      [UC-EXR-102]            [UC-EXR-106]            [UC-EXR-108]
      [UC-EXR-103]
      [UC-EXR-104]
   (automated updates)    (conversion calc)      (period-end reval)

  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
  │ OpenExchange   │      │  Procurement   │      │     Sales      │
  │  Rates API     │      │    System      │      │    System      │
  │  Integration   │      │  Integration   │      │  Integration   │
  └────────┬───────┘      └────────┬───────┘      └────────┬───────┘
           │                       │                       │
      [UC-EXR-201]            [UC-EXR-203]            [UC-EXR-204]
      [UC-EXR-202]         (rate for PO conv)     (rate for invoice)
   (rate retrieval)
```

**Legend**:
- **Top Section**: Primary finance users (controllers, managers, treasury, accountants)
- **Middle Section**: Operational users (purchasing, analysts using rates for business decisions)
- **Bottom Section**: System actors (automated services, integrations, background jobs)

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **Rate Configuration & Provider Management** | | | | | |
| UC-EXR-001 | Configure Rate Provider | Financial Controller | Critical | Medium | User |
| UC-EXR-002 | Configure Update Schedule | Finance Manager | High | Medium | User |
| UC-EXR-003 | Enable/Disable Rate Provider | Finance Manager | High | Simple | User |
| UC-EXR-004 | Set Variance Threshold | Finance Manager | High | Simple | User |
| UC-EXR-005 | Configure Rate Approval Workflow | Finance Manager | High | Medium | User |
| **Manual Rate Entry & Management** | | | | | |
| UC-EXR-006 | Manually Enter Exchange Rate | Finance Manager | Critical | Medium | User |
| UC-EXR-007 | Enter Forward Rate with Contract | Treasury Manager | High | Complex | User |
| UC-EXR-008 | Enter Month-End Rate | Accountant | Critical | Medium | User |
| UC-EXR-009 | Approve Pending Exchange Rate | Financial Controller | Critical | Medium | User |
| UC-EXR-010 | Reject Exchange Rate with Comments | Finance Manager | High | Simple | User |
| UC-EXR-011 | Bulk Import Exchange Rates | Finance Manager | Medium | Medium | User |
| UC-EXR-012 | Correct Historical Exchange Rate | Financial Controller | High | Complex | User |
| **Rate Viewing & Analysis** | | | | | |
| UC-EXR-013 | View Current Exchange Rates | Accountant | High | Simple | User |
| UC-EXR-014 | Search Historical Exchange Rates | Accountant | High | Simple | User |
| UC-EXR-015 | View Exchange Rate Trends | Financial Analyst | Medium | Simple | User |
| UC-EXR-016 | Compare Rates Across Providers | Treasury Manager | Medium | Medium | User |
| UC-EXR-017 | View Rate Approval Queue | Finance Manager | High | Simple | User |
| **Currency Conversion** | | | | | |
| UC-EXR-018 | Calculate Currency Conversion | Purchasing Manager | Critical | Simple | User |
| UC-EXR-019 | Perform Bulk Currency Conversion | Financial Analyst | Medium | Medium | User |
| UC-EXR-020 | View Conversion History | Accountant | Medium | Simple | User |
| **Reporting & Audit** | | | | | |
| UC-EXR-021 | Generate Exchange Rate Audit Report | Financial Controller | High | Medium | User |
| UC-EXR-022 | Export Historical Rates for Audit | External Auditor | High | Simple | User |
| UC-EXR-023 | View Rate Change History | Accountant | Medium | Simple | User |
| UC-EXR-024 | Monitor Rate Provider Health | System Administrator | High | Medium | User |
| **Automated Processes** | | | | | |
| UC-EXR-101 | Retrieve Rates from External Provider | Rate Update Scheduler | Critical | Complex | System |
| UC-EXR-102 | Validate Retrieved Rates | Rate Update Scheduler | Critical | Medium | System |
| UC-EXR-103 | Route High-Variance Rates to Approval | Rate Update Scheduler | Critical | Medium | System |
| UC-EXR-104 | Send Rate Update Failure Alerts | Rate Update Scheduler | Critical | Simple | System |
| UC-EXR-105 | Calculate Real-Time Conversion | Conversion Engine | Critical | Medium | System |
| UC-EXR-106 | Perform Triangulated Conversion | Conversion Engine | Critical | Complex | System |
| UC-EXR-107 | Run Period-End Currency Revaluation | Revaluation Engine | Critical | Complex | System |
| UC-EXR-108 | Post Exchange Gain/Loss Adjustment | Revaluation Engine | Critical | Complex | System |
| **Integration Processes** | | | | | |
| UC-EXR-201 | Fetch Rates from OpenExchangeRates | OpenExchangeRates API | Critical | Medium | Integration |
| UC-EXR-202 | Fetch Rates from Bloomberg | Bloomberg Terminal | High | Medium | Integration |
| UC-EXR-203 | Provide Rate for Purchase Order | Procurement System | Critical | Simple | Integration |
| UC-EXR-204 | Provide Rate for Sales Invoice | Sales System | Critical | Simple | Integration |

**Complexity Definitions**:
- **Simple**: Single-step process, minimal logic, 1-3 scenarios, straightforward validation
- **Medium**: Multi-step process with business rules, 4-8 scenarios, moderate validation
- **Complex**: Multi-step process with complex calculations, multiple integrations, 9+ scenarios, extensive error handling

---

## Detailed Use Cases

### UC-EXR-001: Configure Rate Provider

**Actor**: Financial Controller / CFO

**Goal**: Configure an external exchange rate provider (OpenExchangeRates, Bloomberg, ECB, etc.) to enable automated rate updates.

**Priority**: Critical

**Complexity**: Medium

**Frequency**: Once per provider during initial setup, occasionally when changing providers

**Preconditions**:
- User is logged in as Financial Controller or System Administrator
- User has permission to configure rate providers
- API credentials obtained from rate provider (if required)
- Network connectivity to provider endpoint verified

**Main Flow**:
1. User navigates to Finance → Exchange Rate Management → Rate Provider Configuration
2. System displays list of configured providers with status indicators:
   - OpenExchangeRates: Active, Last Update: 2 hours ago, Success Rate: 99.5%
   - Bloomberg: Inactive (Not configured)
   - ECB: Active, Last Update: 24 hours ago (daily update)
3. User clicks "Add Provider" button
4. System displays provider configuration form with provider selection dropdown:
   - OpenExchangeRates.org (Recommended for SMB)
   - Bloomberg Terminal (Enterprise)
   - European Central Bank (Free, EUR base)
   - Federal Reserve H.10 (Free, USD base)
   - Custom API
5. User selects "OpenExchangeRates.org"
6. System displays provider-specific configuration fields:
   - **Provider Name**: OpenExchangeRates.org (auto-filled)
   - **API Endpoint**: https://openexchangerates.org/api/latest.json (auto-filled)
   - **API Key**: [Input field] (required)
   - **Is Primary Provider**: Yes / No (toggle)
   - **Priority Order**: 1 (highest priority)
   - **Rate Type**: Spot Rates
   - **Update Schedule**: Hourly / Daily / Real-time (dropdown)
   - **Update Time**: 09:00 AM (if daily selected)
   - **Enabled Currencies**: [Multi-select: USD, EUR, GBP, JPY, CAD, AUD, CHF, etc.]
   - **Auto-Approve Updates**: Yes / No (toggle)
   - **Variance Threshold**: 5% (default)
   - **Retry Attempts**: 3 (default)
   - **Retry Delay**: 5 minutes (default)
7. User enters API key obtained from OpenExchangeRates
8. User configures settings:
   - Is Primary Provider: Yes (checked)
   - Update Schedule: Hourly
   - Enabled Currencies: USD, EUR, GBP, JPY, CAD (selected)
   - Auto-Approve Updates: Yes (checked)
   - Variance Threshold: 5%
9. User clicks "Test Connection" button
10. System validates API key and tests endpoint connectivity
11. System retrieves sample rate data from provider
12. System displays test results:
    - ✅ Connection Successful
    - ✅ API Key Valid
    - ✅ Sample Rates Retrieved (5 currency pairs)
    - Sample Rate: USD→EUR: 0.921456 (retrieved at 14:30 UTC)
13. User reviews test results
14. User clicks "Save Configuration" button
15. System validates all required fields completed
16. System saves provider configuration
17. System sets provider status to "Active"
18. System schedules first automated update based on configured schedule
19. System displays success message: "Rate provider configured successfully. First update scheduled for [time]."
20. System logs configuration in audit trail

**Alternative Flows**:

**A1: Test Connection Fails (Step 10)**
- 10a. System attempts to connect to provider endpoint
- 10b. Connection fails (timeout, invalid credentials, etc.)
- 10c. System displays error message: "Connection failed: [error details]"
- 10d. System suggests troubleshooting steps:
  - Verify API key is correct
  - Check network connectivity
  - Verify API endpoint URL
  - Contact provider support if issue persists
- 10e. User corrects configuration and retries from Step 9

**A2: Invalid API Key (Step 10)**
- 10a. System sends authentication request to provider
- 10b. Provider returns authentication error
- 10c. System displays error: "Invalid API key. Please verify credentials."
- 10d. User obtains correct API key
- 10e. User updates API key field
- 10f. Flow resumes at Step 9

**A3: User Saves Without Testing Connection (Step 14)**
- 14a. System detects connection not tested
- 14b. System displays warning: "Connection not tested. Are you sure you want to save?"
- 14c. User clicks "Test First" → returns to Step 9
- 14d. User clicks "Save Anyway" → system saves with "Untested" status flag

**A4: Duplicate Provider Configuration (Step 16)**
- 16a. System detects provider with same name already configured
- 16b. System displays error: "Provider 'OpenExchangeRates.org' already configured. Edit existing or use different name."
- 16c. User clicks "Edit Existing" → navigates to existing provider configuration
- 16d. User clicks "Use Different Name" → modifies provider name and resumes at Step 14

**A5: Network Connectivity Issues (Step 10)**
- 10a. System detects network unavailable
- 10b. System displays error: "Network unavailable. Cannot test provider connection."
- 10c. System suggests: "Check network connectivity and firewall settings."
- 10d. User resolves network issue
- 10e. Flow resumes at Step 9

**Postconditions**:
- **Success**: Provider configured and active, first update scheduled, configuration logged in audit trail
- **Failure**: Provider not configured, error logged, user notified

**Business Rules**:
- BR-EXR-001: At least one active rate provider required for automated updates
- BR-EXR-002: Only one provider can be designated as "Primary Provider"
- BR-EXR-003: API credentials must be encrypted at rest (AES-256)
- BR-EXR-004: Provider priority order determines failover sequence (1=highest)
- BR-EXR-005: Update schedule must align with provider's rate availability (e.g., ECB updates daily at 14:15 CET)

**UI Requirements**:
- Provider configuration form with clear field labels and help text
- Real-time connection testing with visual feedback (spinner during test)
- Error messages displayed inline with actionable guidance
- "Save" button disabled until required fields completed
- Provider status indicators: Active (green), Inactive (gray), Error (red), Testing (blue)

**Related Use Cases**:
- UC-EXR-002: Configure Update Schedule (related configuration)
- UC-EXR-101: Retrieve Rates from External Provider (automated process initiated by this configuration)

---

### UC-EXR-006: Manually Enter Exchange Rate

**Actor**: Finance Manager, Accountant

**Goal**: Manually enter an exchange rate when automated rates are unavailable, incorrect, or for special-purpose rates (forward contracts, month-end rates).

**Priority**: Critical

**Complexity**: Medium

**Frequency**: Daily (as needed), or scheduled (month-end, period-end)

**Preconditions**:
- User is logged in as Finance Manager or Accountant
- User has permission to enter manual exchange rates
- Source and target currencies are active in Currency Management
- User has rate information from reliable source (bank quote, central bank, contract)

**Main Flow**:
1. User navigates to Finance → Exchange Rate Management → Manual Rate Entry
2. System displays manual rate entry form
3. User selects rate entry method:
   - Single Rate Entry (default)
   - Bulk Rate Entry (Excel template)
4. User selects "Single Rate Entry"
5. System displays rate entry form with fields:
   - **Source Currency**: [Dropdown] (required)
   - **Target Currency**: [Dropdown] (required, filtered to exclude source)
   - **Exchange Rate**: [Decimal input, 6 places] (required)
   - **Inverse Rate**: [Auto-calculated, display only]
   - **Rate Type**: [Dropdown: Spot, Forward, Month-End, Year-End, Average] (required)
   - **Effective Date**: [Date picker] (required, default: today)
   - **Effective Time**: [Time picker] (default: current time)
   - **Effective Until**: [Date picker] (required only for Forward rates)
   - **Buy Rate**: [Decimal input] (optional)
   - **Sell Rate**: [Decimal input] (optional)
   - **Mid Rate**: [Auto-calculated if buy/sell provided]
   - **Rate Source**: [Dropdown: Manual, Bank Quote, Broker, Central Bank, Forward Contract, etc.] (required)
   - **Source Reference**: [Text input: contract #, email ref, etc.] (required)
   - **Rate Provider**: [Text: bank name, broker name] (optional)
   - **Reason for Manual Entry**: [Text area, min 10 chars] (required)
   - **Supporting Document**: [File upload: PDF, image] (optional)
6. User fills in rate details:
   - Source Currency: USD
   - Target Currency: EUR
   - Exchange Rate: 0.921456
   - Rate Type: Spot
   - Effective Date: 2025-01-13
   - Effective Time: 14:30
   - Rate Source: Bank Quote
   - Source Reference: QUOTE-12345 from Citibank
   - Reason: Automated update failed, using bank quote as fallback
7. System auto-calculates inverse rate: 1.085267 (1 / 0.921456)
8. System displays inverse rate: EUR→USD: 1.085267
9. System validates rate entry:
   - Source ≠ Target: ✅ Pass
   - Exchange rate > 0: ✅ Pass
   - Inverse calculation correct: ✅ Pass
   - Required fields completed: ✅ Pass
10. System retrieves last active rate for USD→EUR: 0.923678 (24 hours old)
11. System calculates variance: ((0.921456 - 0.923678) / 0.923678) × 100% = -0.24%
12. System displays variance indicator:
    - **Variance vs Last Rate**: -0.24% (green indicator, within 5% threshold)
    - **Last Rate**: 0.923678 (updated 24 hours ago via OpenExchangeRates)
13. User reviews calculated values and variance
14. User clicks "Submit" button
15. System determines approval requirement:
    - Variance: -0.24% (less than 5% threshold)
    - Auto-Approve Enabled: Yes (for Finance Manager)
    - Decision: Auto-approve and activate immediately
16. System saves exchange rate record:
    - rate_id: Generated CUID
    - Status: Active
    - is_manual_entry: true
    - approval_status: Approved (auto-approved)
    - created_by: Current user
    - created_date: Current timestamp
17. System supersedes previous rate:
    - Previous rate status: Historical
    - Previous rate superseded_date: Current timestamp
18. System logs rate entry in audit trail:
    - Event: RATE_CREATED
    - User: Finance Manager
    - Details: USD→EUR manual entry, auto-approved
19. System sends notification to Treasury Manager: "New USD→EUR rate entered manually: 0.921456"
20. System displays success message: "Exchange rate saved and activated successfully."
21. System displays rate details summary with rate_id and activation timestamp

**Alternative Flows**:

**A1: High Variance Requires Approval (Step 15)**
- 15a. System calculates variance: 6.5% (exceeds 5% threshold)
- 15b. System displays warning: "Variance 6.5% exceeds threshold. This rate requires approval."
- 15c. User confirms: "Submit for Approval"
- 15d. System saves rate with status: Pending Approval
- 15e. System routes to Finance Manager's approval queue (if submitter is Accountant)
- 15f. System sends email notification to approver
- 15g. System displays message: "Rate submitted for approval. Pending approval by Finance Manager."
- 15h. System provides approval queue link
- 15i. Flow proceeds to UC-EXR-009 (Approve Pending Rate)

**A2: Forward Rate Entry (Step 6)**
- 6a. User selects Rate Type: Forward
- 6b. System makes "Effective Until" field required
- 6c. System displays additional fields:
  - Forward Contract Number: [Text input] (required)
  - Counterparty: [Text: bank/broker name] (required)
  - Contract Amount: [Decimal with currency] (optional)
- 6d. User enters forward rate details:
  - Exchange Rate: 0.925000 (90-day forward)
  - Effective Date: 2025-01-13
  - Effective Until: 2025-04-13 (90 days forward)
  - Forward Contract Number: FWD-2501-001234
  - Counterparty: JPMorgan Chase
- 6e. System validates forward date: Effective Until > Effective Date ✅
- 6f. Flow continues at Step 7

**A3: Month-End Rate Entry (Step 6)**
- 6a. User selects Rate Type: Month-End
- 6b. System validates Effective Date is last business day of month
- 6c. If not last business day, system displays warning: "Month-end rates typically entered on last business day. Are you sure?"
- 6d. User confirms or changes date
- 6e. System flags rate with is_period_end: true
- 6f. System sets fiscal_period: YYYY-MM (e.g., 2024-12)
- 6g. Flow continues at Step 7

**A4: Duplicate Rate Entry (Step 16)**
- 16a. System detects active rate for same currency pair and effective date already exists
- 16b. System displays warning: "Active rate for USD→EUR on 2025-01-13 14:30 already exists. Do you want to replace it?"
- 16c. User clicks "View Existing" → system displays existing rate details
- 16d. User clicks "Replace" → system supersedes existing rate and continues
- 16e. User clicks "Cancel" → flow aborts, no changes saved

**A5: Invalid Exchange Rate (Step 9)**
- 9a. User enters exchange rate: 0 or negative value
- 9b. System validation fails: Exchange rate must be > 0
- 9c. System displays error: "Exchange rate must be a positive number greater than zero."
- 9d. System highlights Exchange Rate field in red
- 9e. User corrects value
- 9f. Flow resumes at Step 9

**A6: Missing Required Field (Step 14)**
- 14a. User clicks "Submit" with incomplete form
- 14b. System identifies missing required fields:
  - Rate Source: Not selected
  - Source Reference: Empty
  - Reason for Manual Entry: Too short (<10 characters)
- 14c. System displays error summary: "Please complete all required fields"
- 14d. System highlights missing fields in red with specific messages
- 14e. User completes required fields
- 14f. Flow resumes at Step 14

**A7: Inverse Rate Calculation Error (Step 8)**
- 8a. System attempts inverse calculation
- 8b. Calculation fails (division by zero, overflow, etc.)
- 8c. System displays error: "Unable to calculate inverse rate. Please verify exchange rate value."
- 8d. User reviews and corrects exchange rate
- 8e. Flow resumes at Step 7

**Postconditions**:
- **Success**: Exchange rate saved (active or pending approval), audit trail updated, notifications sent
- **Partial Success**: Rate saved as pending approval, awaiting approval workflow
- **Failure**: Rate not saved, validation errors displayed, user can correct and resubmit

**Business Rules**:
- BR-EXR-011: Manual rate variance >5% requires approval
- BR-EXR-001: Exchange rates must be positive non-zero values
- BR-EXR-021: Manual entries require documented source and reason
- BR-EXR-002: Inverse rate must equal 1 / exchange rate within tolerance
- BR-EXR-012: Forward rates require future effective date and contract reference
- BR-EXR-008: Rates become effective immediately upon approval

**UI Requirements**:
- Form with clear field labels and inline help text
- Real-time validation with immediate feedback
- Auto-calculation of inverse rate on exchange rate input
- Variance indicator color-coded: Green (<5%), Yellow (5-10%), Red (>10%)
- "Submit" button disabled until all required fields valid
- Supporting document upload with drag-and-drop
- Historical rate comparison panel showing last 5 rates for context

**Related Use Cases**:
- UC-EXR-009: Approve Pending Exchange Rate (if variance exceeds threshold)
- UC-EXR-007: Enter Forward Rate with Contract (specialized forward rate entry)
- UC-EXR-011: Bulk Import Exchange Rates (bulk alternative to single entry)

---

### UC-EXR-009: Approve Pending Exchange Rate

**Actor**: Financial Controller, Finance Manager

**Goal**: Review and approve a manually entered exchange rate that requires approval due to high variance or other approval triggers.

**Priority**: Critical

**Complexity**: Medium

**Frequency**: Daily (as needed based on manual rate entries)

**Preconditions**:
- User is logged in as Financial Controller or Finance Manager
- User has permission to approve exchange rates
- One or more exchange rates pending approval
- User has access to rate comparison tools and external sources for verification

**Main Flow**:
1. User receives email notification: "Exchange rate approval required: USD→EUR submitted by [User Name]"
2. User clicks "Review Rate" link in email (or navigates manually)
3. User navigates to Finance → Exchange Rate Management → Approval Queue
4. System displays pending rates list with columns:
   - Submission Date/Time (sorted newest first)
   - Currency Pair (Source → Target)
   - Proposed Rate
   - Current Active Rate
   - Variance % (color-coded)
   - Rate Type
   - Submitter Name
   - Reason/Notes (truncated)
   - Days Pending (alert if >1 day)
   - Actions (View, Approve, Reject)
5. System shows summary statistics at top:
   - Total Pending: 3 rates
   - Urgent (>24 hours): 1 rate (highlighted in yellow)
   - Average Approval Time: 2.5 hours
6. User identifies rate to review: USD→EUR, Variance 6.5%, submitted 30 minutes ago
7. User clicks "View Details" button for that rate
8. System displays comprehensive rate details modal:

   **Proposed Rate Information**:
   - Source Currency: USD
   - Target Currency: EUR
   - Exchange Rate: 0.915000
   - Inverse Rate: 1.092896 (auto-calculated)
   - Rate Type: Spot
   - Effective Date: 2025-01-13 15:00
   - Rate Source: Bank Quote
   - Source Reference: QUOTE-67890 from Bank of America
   - Rate Provider: Bank of America
   - Reason: Unusual market volatility, using bank quote for accuracy
   - Supporting Document: [View PDF] (bank quote screenshot)
   - Submitted By: John Smith (Finance Manager)
   - Submitted Date: 2025-01-13 14:30

   **Variance Analysis**:
   - Current Active Rate: 0.921456 (updated 2 hours ago)
   - Proposed Rate: 0.915000
   - Absolute Variance: -0.006456
   - Percentage Variance: -0.70% = ((0.915000 - 0.921456) / 0.921456) × 100%
   - Variance Level: 6.5% (exceeds 5% threshold) ⚠️ HIGH VARIANCE
   - Last 7-Day Average: 0.919234
   - Proposed Rate vs 7-Day Avg: -0.46%

   **Historical Rate Context** (Last 5 Rates):
   | Date | Rate | Source | Variance from Previous |
   |------|------|--------|------------------------|
   | 2025-01-13 12:00 | 0.921456 | OpenExchangeRates | +0.12% |
   | 2025-01-12 12:00 | 0.920345 | OpenExchangeRates | -0.05% |
   | 2025-01-11 12:00 | 0.920801 | OpenExchangeRates | +0.18% |
   | 2025-01-10 12:00 | 0.919145 | OpenExchangeRates | -0.22% |
   | 2025-01-09 12:00 | 0.921178 | OpenExchangeRates | +0.15% |

   **External Rate Comparison** (Real-time check):
   - OpenExchangeRates: 0.921234 (2 hours ago)
   - ECB Reference Rate: 0.920987 (yesterday)
   - Bloomberg: 0.921567 (real-time)
   - Federal Reserve: 0.921000 (yesterday)
   - **Average of External Sources**: 0.921197
   - **Proposed vs External Avg**: -0.67% difference

   **Approval Recommendation**:
   - ⚠️ Variance exceeds 5% threshold
   - ✅ Within 1% of external sources average
   - ✅ Supporting documentation provided
   - ✅ Reason documented and plausible (market volatility)
   - 📊 Recommendation: Review market conditions and verify source before approving

9. User reviews all information:
   - Checks supporting document (bank quote PDF)
   - Verifies source reference is legitimate
   - Compares to external sources (Bloomberg shows 0.921567, close to proposed 0.915000)
   - Considers reason: Market volatility reported in financial news today
   - Checks submitter credentials and history
10. User decides to approve with conditions
11. User clicks "Approve" button
12. System displays approval confirmation dialog:
    - **Approve Exchange Rate?**
    - Currency Pair: USD→EUR
    - Proposed Rate: 0.915000
    - Variance: 6.5%
    - Action: This rate will become active immediately and supersede current rate
    - **Approval Comments**: [Text area] (optional but recommended for high-variance rates)
    - **Set Expiry**: [Checkbox] Review this rate again in [dropdown: 24 hours / 7 days]
13. User enters approval comments: "Approved based on Bank of America quote. Market volatility due to Fed announcement today. Will monitor closely and update if market stabilizes."
14. User checks "Set Expiry": Review in 24 hours
15. User clicks "Confirm Approval"
16. System validates approval:
    - User has approval authority for 6.5% variance: ✅ (Finance Manager can approve up to 10%)
    - Rate still pending (not already approved/rejected): ✅
    - No conflicting rate approved since review started: ✅
17. System updates rate record:
    - approval_status: Approved
    - approved_by: Current user ID
    - approved_date: Current timestamp
    - approval_comments: User's comments
    - review_expiry_date: Current date + 24 hours
18. System activates exchange rate:
    - is_active: true
    - Status: Active
19. System supersedes previous rate:
    - Previous rate is_active: false
    - Previous rate status: Historical
    - Previous rate superseded_date: Current timestamp
    - Previous rate superseded_by_rate_id: Newly approved rate ID
20. System logs approval in audit trail:
    - Event: RATE_APPROVED
    - User: Finance Manager
    - Rate: USD→EUR 0.915000
    - Variance: 6.5%
    - Comments: Included
    - Timestamp: Current
21. System sends notifications:
    - To Submitter (John Smith): "Your USD→EUR rate has been approved by [Approver Name]"
    - To Treasury Manager: "New USD→EUR rate activated: 0.915000 (6.5% change)"
    - To Finance Team: "High-variance rate approved, flagged for 24-hour review"
22. System schedules review reminder:
    - Reminder task created for 2025-01-14 15:00
    - Assigned to: Finance Manager
    - Message: "Review USD→EUR rate approved with high variance"
23. System displays success message: "Exchange rate approved and activated successfully. Review reminder set for 24 hours."
24. System updates approval queue (removes approved rate from pending list)
25. System displays updated approval queue summary:
    - Total Pending: 2 rates (decreased from 3)
    - Just Approved: USD→EUR 0.915000

**Alternative Flows**:

**A1: User Rejects Rate (Step 11)**
- 11a. User determines rate is incorrect or inadequately documented
- 11b. User clicks "Reject" button
- 11c. System displays rejection dialog:
  - **Reject Exchange Rate?**
  - Currency Pair: USD→EUR
  - Proposed Rate: 0.915000
  - **Rejection Reason**: [Text area, min 20 chars] (required)
  - **Action**: Rate will be rejected and submitter notified
- 11d. User enters rejection reason: "Variance too high without adequate justification. Bank quote appears outdated. Please obtain current rate from multiple sources and resubmit."
- 11e. User clicks "Confirm Rejection"
- 11f. System updates rate record:
  - approval_status: Rejected
  - rejected_by: Current user
  - rejected_date: Current timestamp
  - rejection_reason: User's comments
- 11g. System does NOT activate rate (remains inactive)
- 11h. System sends notification to submitter: "Your USD→EUR rate has been rejected. Reason: [rejection reason]"
- 11i. System logs rejection in audit trail
- 11j. System displays success message: "Exchange rate rejected. Submitter has been notified."
- 11k. System removes rate from approval queue

**A2: User Requests Revision (Step 11)**
- 11a. User needs additional information before approving
- 11b. User clicks "Request Revision" button
- 11c. System displays revision request dialog:
  - **Request Revision**
  - Currency Pair: USD→EUR
  - **What additional information is needed?**: [Text area] (required)
  - **Requested Information**: [Checkboxes]
    - Updated rate quote
    - Additional supporting documentation
    - Clarification on rate source
    - Comparison with multiple sources
    - Other (specify)
- 11d. User enters request: "Please provide rates from at least 2 additional banks for comparison. Current quote is 2 hours old; verify this is still current rate."
- 11e. User selects checkboxes: "Updated rate quote", "Comparison with multiple sources"
- 11f. User clicks "Send Revision Request"
- 11g. System updates rate record:
  - approval_status: Revision Requested
  - revision_requested_by: Current user
  - revision_requested_date: Current timestamp
  - revision_request_details: User's comments
- 11h. System sends notification to submitter: "Revision requested for your USD→EUR rate. Please review and resubmit."
- 11i. System logs revision request in audit trail
- 11j. System keeps rate in approval queue with status: "Revision Requested"
- 11k. Submitter can edit rate and resubmit (flow returns to UC-EXR-006)

**A3: Variance Exceeds User's Approval Limit (Step 16)**
- 16a. System checks approval limit: Variance 15%, User role: Finance Manager (can approve up to 10%)
- 16b. System validation fails: Variance exceeds approval authority
- 16c. System displays error: "Variance 15% exceeds your approval limit (10%). This rate requires Financial Controller approval."
- 16d. System suggests: "You can forward to Financial Controller for approval."
- 16e. User clicks "Forward to Controller"
- 16f. System routes rate to Financial Controller's approval queue
- 16g. System sends notification to Financial Controller
- 16h. System displays message: "Rate forwarded to Financial Controller for approval."

**A4: Conflicting Rate Approved While Reviewing (Step 16)**
- 16a. Another approver approved a different rate for same currency pair during review
- 16b. System detects conflicting active rate exists
- 16c. System displays warning: "A different USD→EUR rate was approved 5 minutes ago by [Other Approver]. Do you still want to approve this rate?"
- 16d. System displays comparison:
  - Currently Active Rate: 0.920000 (approved 5 min ago by Other Approver)
  - Rate You're Reviewing: 0.915000 (submitted earlier)
- 16e. User clicks "View Active Rate Details" → system shows recently approved rate
- 16f. User decides:
  - "Approve Anyway" → System supersedes recently approved rate (warning displayed)
  - "Reject as Outdated" → System rejects with reason "Superseded by more recent rate"
  - "Cancel" → User exits approval without action

**A5: Rate Expired During Review (Step 16)**
- 16a. System checks rate submission timestamp: 2 days ago
- 16b. System detects rate is stale (>24 hours old without approval)
- 16c. System displays warning: "This rate is 2 days old. Market conditions may have changed. Consider requesting updated rate from submitter."
- 16d. User options:
  - "Approve Anyway" → Proceeds with approval (with notation in audit log)
  - "Request Updated Rate" → Sends revision request to submitter
  - "Reject as Outdated" → Rejects with reason

**A6: Supporting Document Missing or Unreadable (Step 9)**
- 9a. User clicks "View Supporting Document"
- 9b. Document file is corrupt or missing
- 9c. System displays error: "Supporting document unavailable or corrupted"
- 9d. User clicks "Request Revision" to ask for re-upload of supporting document
- 9e. Flow proceeds to Alternative Flow A2

**Postconditions**:
- **Approved**: Rate activated, previous rate superseded, notifications sent, audit logged, approval queue updated
- **Rejected**: Rate rejected, submitter notified, audit logged, rate removed from queue
- **Revision Requested**: Rate flagged for revision, submitter notified, remains in queue with status update
- **Forwarded**: Rate escalated to higher authority, notifications sent

**Business Rules**:
- BR-EXR-011: Variance approval limits: <10% Finance Manager, 10-25% Financial Controller, >25% CFO
- BR-EXR-008: Approved rates activate immediately
- BR-EXR-009: Rate approval time limit: Rates pending >24 hours trigger escalation
- BR-EXR-021: All approvals and rejections require audit trail
- BR-EXR-007: User cannot approve own rate submission (separation of duties)

**UI Requirements**:
- Approval queue with sortable, filterable columns
- Detailed rate comparison modal with historical context
- Real-time external rate comparison (if available)
- Visual variance indicators (color-coded)
- "Approve", "Reject", "Request Revision" buttons clearly distinguishable
- Approval comments field (required for high-variance approvals)
- Success/error messages with clear next steps

**Related Use Cases**:
- UC-EXR-006: Manually Enter Exchange Rate (source of pending rates)
- UC-EXR-010: Reject Exchange Rate with Comments (rejection workflow)
- UC-EXR-012: Correct Historical Exchange Rate (if approved rate later found incorrect)
- UC-EXR-021: Generate Exchange Rate Audit Report (approval history review)

---

### UC-EXR-018: Calculate Currency Conversion

**Actor**: Purchasing Manager, Accountant, Any User needing currency conversion

**Goal**: Convert an amount from one currency to another using current or historical exchange rates.

**Priority**: Critical

**Complexity**: Simple

**Frequency**: Multiple times daily (on-demand for transactions)

**Preconditions**:
- User is logged in
- User has permission to use currency conversion tool
- Source and target currencies are active
- Exchange rates available for currency pair (or triangulation possible)

**Main Flow**:
1. User navigates to Finance → Exchange Rate Management → Currency Converter
   (Or conversion tool embedded in transaction screens: Purchase Order, Invoice, etc.)
2. System displays currency conversion calculator interface:
   - **Amount**: [Decimal input] (required)
   - **From Currency**: [Dropdown with search] (required)
   - **To Currency**: [Dropdown with search] (required)
   - **Conversion Date**: [Date picker] (default: today)
   - **Rate Type**: [Dropdown: Spot (default), Forward, Month-End, Average] (optional)
   - **Convert** button
   - **Swap Currencies** button (exchanges from/to)
3. User enters conversion details:
   - Amount: 10,000.00
   - From Currency: USD
   - To Currency: EUR
   - Conversion Date: 2025-01-13 (today, default)
   - Rate Type: Spot (default)
4. User clicks "Convert" button
5. System retrieves exchange rate for USD→EUR on 2025-01-13:
   - Checks cache first (LRU cache, 15-minute TTL)
   - Cache miss → Queries database for most recent rate on/before 2025-01-13
   - Found: USD→EUR = 0.921456 (updated 2 hours ago via OpenExchangeRates)
6. System performs conversion calculation:
   - Formula: Target Amount = Source Amount × Exchange Rate
   - Calculation: 10,000.00 × 0.921456 = 9,214.56
   - Rounding: Round to target currency decimal places (EUR: 2 decimals)
   - Result: 9,214.56 EUR
7. System retrieves inverse rate for reference:
   - EUR→USD = 1.085267 (calculated inverse)
8. System compiles conversion metadata:
   - Conversion Path: Direct (USD→EUR)
   - Rate Source: OpenExchangeRates API
   - Rate Effective Date: 2025-01-13 12:00 UTC
   - Rate Age: 2 hours
   - Is Rate Current: Yes (<24 hours old)
   - Confidence Level: 98% (high - from reliable automated source)
9. System displays conversion result:

   **Conversion Result:**
   ```
   10,000.00 USD  =  9,214.56 EUR

   Exchange Rate: 1 USD = 0.921456 EUR
   Inverse Rate: 1 EUR = 1.085267 USD

   Rate Details:
   - Rate Type: Spot
   - Effective Date: Jan 13, 2025 at 12:00 PM UTC
   - Rate Source: OpenExchangeRates API
   - Rate Age: 2 hours (Current ✅)
   - Conversion Path: Direct (USD → EUR)
   - Confidence: 98% (High reliability)

   Calculation:
   10,000.00 × 0.921456 = 9,214.56
   ```

10. System displays action buttons:
    - **Copy Result** (copies "9,214.56" to clipboard)
    - **Email Result** (sends conversion details via email)
    - **New Conversion** (clears form)
    - **Reverse Conversion** (swaps currencies and converts back)
11. System logs conversion in audit trail (if transaction-related):
    - Conversion ID: Generated
    - User: Current user
    - Source: 10,000.00 USD
    - Target: 9,214.56 EUR
    - Rate Used: 0.921456
    - Context: Manual conversion tool (or linked transaction ID)
    - Timestamp: Current
12. User reviews result and copies to clipboard for use in purchase order
13. User clicks "New Conversion" to perform another conversion

**Alternative Flows**:

**A1: Triangulated Conversion (No Direct Rate) (Step 5)**
- 5a. System searches for direct USD→JPY rate
- 5b. Direct rate not found
- 5c. System determines triangulation needed via base currency (USD already is base)
- 5d. Wait, USD is source currency (source is base), so let me reconsider...
- 5e. Example: User converting GBP→JPY (no direct rate)
  - User Amount: 5,000.00 GBP → JPY
- 5f. System searches for direct GBP→JPY rate: Not found
- 5g. System performs triangulation via USD (base currency):
  - Step 1: GBP→USD: Find rate 1.267890
  - Step 2: USD→JPY: Find rate 149.234500
  - Step 3: Calculate: 5,000.00 × 1.267890 × 149.234500 = 946,032.17
  - Step 4: Round to JPY decimals (0): 946,032 JPY
- 5h. System calculates triangulated rate: GBP→JPY = 1.267890 × 149.234500 = 189.206435
- 5i. System displays conversion result:
  ```
  5,000.00 GBP  =  946,032 JPY

  Exchange Rate: 1 GBP = 189.206435 JPY (Triangulated)

  Rate Details:
  - Conversion Path: Triangulated (GBP → USD → JPY)
  - GBP→USD: 1.267890 (from OpenExchangeRates)
  - USD→JPY: 149.234500 (from OpenExchangeRates)
  - Combined Rate: 189.206435

  Calculation:
  5,000.00 × 1.267890 × 149.234500 = 946,032 JPY
  ```
- 5j. Flow proceeds to Step 10

**A2: Historical Conversion (Past Date) (Step 5)**
- 5a. User selects Conversion Date: 2024-12-31 (month-end revaluation)
- 5b. User selects Rate Type: Month-End
- 5c. System queries for USD→EUR month-end rate on 2024-12-31
- 5d. Found: USD→EUR = 0.938765 (month-end rate for December 2024)
- 5e. System performs conversion: 10,000.00 × 0.938765 = 9,387.65 EUR
- 5f. System displays result with historical rate notation:
  ```
  10,000.00 USD  =  9,387.65 EUR

  Exchange Rate: 1 USD = 0.938765 EUR (Historical - Month-End)

  Rate Details:
  - Rate Type: Month-End
  - Effective Date: Dec 31, 2024 at 11:59 PM UTC
  - Rate Source: Manual Entry (December revaluation)
  - Rate Age: 14 days (Historical)
  - Note: This is a historical rate for period-end revaluation
  ```
- 5g. Flow proceeds to Step 10

**A3: Stale Exchange Rate Warning (Step 6)**
- 6a. System finds exchange rate: USD→EUR = 0.921456
- 6b. System checks rate age: Last updated 30 hours ago
- 6c. Rate is stale (>24 hours old)
- 6d. System displays conversion result with warning:
  ```
  10,000.00 USD  =  9,214.56 EUR

  ⚠️ Warning: Exchange rate is 30 hours old

  Exchange Rate: 1 USD = 0.921456 EUR
  Last Updated: Jan 12, 2025 at 10:00 AM UTC

  ⚠️ Current market rates may differ. Consider:
  - Updating exchange rates (automated update due in 1 hour)
  - Using latest rate from external source
  - Verifying rate before committing to transaction

  This conversion is for reference only.
  ```
- 6e. System provides "Update Rate Now" button (triggers manual rate fetch)
- 6f. User acknowledges warning and proceeds or updates rate

**A4: No Exchange Rate Available (Step 5)**
- 5a. System searches for exchange rate: USD→XYZ
- 5b. No rate found (currency pair never configured)
- 5c. Triangulation attempted but fails (no rates available for XYZ)
- 5d. System displays error message:
  ```
  ❌ Conversion Not Available

  No exchange rate found for USD → XYZ

  Possible reasons:
  - XYZ currency not actively traded
  - Exchange rates not configured for this currency pair
  - Rate provider does not support this currency

  Actions:
  - Verify XYZ is a valid currency code
  - Check if XYZ is active in Currency Management
  - Manually enter exchange rate if you have reliable source
  - Contact Finance Manager to configure rate provider for XYZ
  ```
- 5e. System provides "Manually Enter Rate" button (navigates to UC-EXR-006)
- 5f. Conversion fails gracefully, user notified

**A5: Future Date Conversion (Step 5)**
- 5a. User selects Conversion Date: 2025-02-15 (future date)
- 5b. System detects future date
- 5c. System checks for forward rate effective on 2025-02-15:
  - Forward rate found: USD→EUR = 0.925000 (90-day forward contract)
- 5d. System displays result with forward rate notation:
  ```
  10,000.00 USD  =  9,250.00 EUR (Forward)

  Exchange Rate: 1 USD = 0.925000 EUR (Forward Rate)

  Rate Details:
  - Rate Type: Forward
  - Contract Effective: Feb 15, 2025
  - Forward Contract: FWD-2501-001234
  - Bank: JPMorgan Chase
  - Note: Forward contract rate, not current spot rate

  ⚠️ This is a forward rate for a future date.
  For current transactions, use spot rate: 0.921456
  ```
- 5e. Flow proceeds to Step 10

**A6: Same Currency Conversion (Step 5)**
- 5a. User selects From: USD, To: USD (same currency)
- 5b. System detects same currency selected
- 5c. System displays result immediately:
  ```
  10,000.00 USD  =  10,000.00 USD

  Exchange Rate: 1 USD = 1.000000 USD

  Note: Source and target currencies are the same.
  No conversion needed.
  ```
- 5d. System suggests: "Select different target currency for conversion"
- 5e. Flow proceeds to Step 10 (with conversion rate = 1.000000)

**A7: Invalid Amount (Step 4)**
- 4a. User enters amount: -500.00 (negative) or 0
- 4b. System validates amount: Must be positive non-zero
- 4c. System displays error: "Amount must be a positive number greater than zero"
- 4d. "Convert" button remains disabled
- 4e. User corrects amount: 500.00
- 4f. Flow resumes at Step 4

**Postconditions**:
- **Success**: Conversion calculated and displayed, result available for copy/use, audit logged (if transaction-related)
- **Failure**: Error message displayed with actionable guidance, no conversion performed

**Business Rules**:
- BR-EXR-016: Use exchange rate effective as of transaction date
- BR-EXR-017: Converted amounts rounded to target currency decimal places
- BR-EXR-018: Cross-currency conversion without direct rate uses triangulation via base currency
- BR-EXR-010: Stale rates (>24 hours) trigger visual warnings

**UI Requirements**:
- Clean, intuitive conversion calculator interface
- Real-time calculation on input (optional live conversion as user types)
- Clear display of exchange rate used and conversion formula
- Visual indicators for rate age (green: current, yellow: stale, red: very stale)
- "Swap currencies" button for quick reverse conversion
- Copy to clipboard functionality for easy result use
- Mobile-responsive design for on-the-go conversions
- Optional: Historical rate chart showing 30-day trend

**Performance Requirements**:
- Conversion calculation <500ms for cached rates
- Conversion calculation <2 seconds for non-cached rates
- UI response <100ms for user interactions

**Related Use Cases**:
- UC-EXR-019: Perform Bulk Currency Conversion (batch alternative for multiple amounts)
- UC-EXR-013: View Current Exchange Rates (to verify rate before conversion)
- UC-EXR-105: Calculate Real-Time Conversion (automated system process)
- UC-EXR-203/204: Provide Rate for Purchase Order/Invoice (integration use cases)

---

### UC-EXR-101: Retrieve Rates from External Provider

**Actor**: Rate Update Scheduler (System)

**Goal**: Automatically retrieve current exchange rates from configured external provider and update system rates.

**Priority**: Critical

**Complexity**: Complex

**Frequency**: Scheduled (hourly, daily, or real-time based on configuration)

**Preconditions**:
- At least one active rate provider configured
- Provider API credentials valid and not expired
- Network connectivity available
- Provider API service operational
- Update schedule defined and active
- Not in suspension period (month-end close, etc.)

**Main Flow**:
1. System scheduler triggers update job based on configured schedule:
   - Provider: OpenExchangeRates
   - Schedule: Hourly (at :00 minutes past hour)
   - Last Update: 2025-01-13 12:00 UTC (successful)
   - Next Scheduled: 2025-01-13 13:00 UTC
2. System checks suspension status:
   - Current Date: 2025-01-13
   - Suspension Periods: None active
   - Proceed with update: ✅
3. System retrieves provider configuration:
   - API Endpoint: https://openexchangerates.org/api/latest.json
   - API Key: [encrypted, retrieved from secure storage]
   - Enabled Currencies: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY
   - Rate Type: Spot
   - Auto-Approve: Yes
   - Variance Threshold: 5%
4. System constructs API request:
   - URL: https://openexchangerates.org/api/latest.json?app_id=[API_KEY]&base=USD&symbols=EUR,GBP,JPY,CAD,AUD,CHF,CNY
   - Method: GET
   - Headers: User-Agent, Accept: application/json
5. System sends HTTP request to provider
6. Provider API responds with rate data (HTTP 200 OK):
   ```json
   {
     "disclaimer": "Exchange rates...",
     "license": "Data license...",
     "timestamp": 1705153200,
     "base": "USD",
     "rates": {
       "EUR": 0.921456,
       "GBP": 0.788901,
       "JPY": 149.234500,
       "CAD": 1.345678,
       "AUD": 1.523456,
       "CHF": 0.856234,
       "CNY": 7.234567
     }
   }
   ```
7. System parses JSON response:
   - Base Currency: USD (verified matches configuration)
   - Timestamp: 1705153200 (Jan 13, 2025 13:00 UTC)
   - Total Rates: 7 currency pairs
8. System validates response data:
   - All requested currencies present: ✅
   - All rates > 0: ✅
   - Timestamp reasonable (not in future, not too old): ✅
   - JSON structure valid: ✅
9. System begins processing each currency pair:

   **Processing EUR**:
   9a. Extract: USD→EUR = 0.921456
   9b. Calculate inverse: EUR→USD = 1.085267
   9c. Retrieve last active rate: USD→EUR = 0.921678 (from previous hour)
   9d. Calculate variance: ((0.921456 - 0.921678) / 0.921678) × 100% = -0.024%
   9e. Variance check: -0.024% < 5% threshold: ✅ Pass
   9f. Variance within normal range: ✅ Auto-approve
   9g. Create new exchange rate record:
      - source_currency: USD
      - target_currency: EUR
      - exchange_rate: 0.921456
      - inverse_rate: 1.085267
      - rate_type: spot
      - rate_source: OpenExchangeRates API
      - effective_date: 2025-01-13 13:00 UTC
      - is_active: true
      - is_manual_entry: false
      - approval_status: approved (auto-approved)
      - created_by: System
   9h. Supersede previous rate:
      - Previous rate (0.921678) status: Historical
      - Previous rate superseded_date: 2025-01-13 13:00 UTC
   9i. Save new rate to database
   9j. Log in audit trail: RATE_CREATED, USD→EUR, auto-approved
   9k. Invalidate cache for USD→EUR currency pair
   9l. EUR processing complete: ✅

10. System processes remaining currency pairs (GBP, JPY, CAD, AUD, CHF, CNY) using same flow as Step 9
11. System compiles update summary:
    - Total Rates Retrieved: 7
    - Successfully Processed: 7
    - Auto-Approved: 7
    - Routed to Approval: 0
    - Failed/Rejected: 0
    - Average Variance: -0.15%
    - Max Variance: +0.32% (GBP)
    - Update Duration: 1.2 seconds
12. System updates provider health metrics:
    - Last Update: 2025-01-13 13:00 UTC
    - Last Success: 2025-01-13 13:00 UTC
    - Success Rate: 99.8% (last 1000 updates)
    - Average Response Time: 850ms
    - Consecutive Successes: 124
    - Consecutive Failures: 0 (reset)
13. System logs update success:
    - Event: AUTOMATED_UPDATE_SUCCESS
    - Provider: OpenExchangeRates
    - Rates Updated: 7
    - Duration: 1.2s
    - Timestamp: 2025-01-13 13:00 UTC
14. System schedules next update:
    - Next Run: 2025-01-13 14:00 UTC (1 hour from now)
15. System sends summary email (optional, configurable):
    - To: Finance Manager, Treasury Manager
    - Subject: "Exchange Rate Update: 7 rates updated successfully"
    - Body: Summary with variance details
16. Update process complete successfully

**Alternative Flows**:

**A1: High Variance Detected - Route to Approval (Step 9e)**
- 9e. Calculate variance: ((0.915000 - 0.921678) / 0.921678) × 100% = -0.72% = 7.2%
- 9f. Variance check: 7.2% > 5% threshold: ❌ Fail
- 9g. System determines: High variance, requires approval
- 9h. Create new exchange rate record with approval_status: pending
- 9i. Do NOT supersede previous rate (keep it active pending approval)
- 9j. Route to Finance Manager approval queue
- 9k. Send notification: "High-variance rate detected: USD→EUR 0.915000 (7.2% change). Approval required."
- 9l. Log in audit trail: RATE_CREATED, pending approval, variance 7.2%
- 9m. EUR processing complete: ⚠️ Pending Approval

**A2: Provider API Failure (Step 6)**
- 6a. System sends HTTP request
- 6b. Provider returns error (HTTP 503 Service Unavailable, timeout, network error, etc.)
- 6c. System logs error:
   - Event: AUTOMATED_UPDATE_FAILURE
   - Provider: OpenExchangeRates
   - Error: "HTTP 503 - Service temporarily unavailable"
   - Attempt: 1 of 3
- 6d. System waits 1 minute (first retry delay)
- 6e. System retries API call (Attempt 2)
- 6f. Provider still returns error
- 6g. System logs: Attempt 2 of 3 failed
- 6h. System waits 5 minutes (second retry delay, exponential backoff)
- 6i. System retries API call (Attempt 3)
- 6j. Provider still returns error
- 6k. System logs: Attempt 3 of 3 failed
- 6l. All retry attempts exhausted
- 6m. System checks for fallback provider configured:
   - Fallback Provider: ECB (priority 2)
   - Fallback Active: Yes
- 6n. System attempts to retrieve rates from ECB (Alternative Flow A3)

**A3: Fallback to Secondary Provider (Step 6m)**
- 6n. System switches to secondary provider: ECB
- 6o. System retrieves ECB configuration:
   - API Endpoint: https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml
   - Base Currency: EUR (different from primary!)
   - Enabled Currencies: USD, GBP, JPY, etc.
- 6p. System constructs ECB API request
- 6q. System sends request to ECB
- 6r. ECB responds successfully with EUR-based rates
- 6s. System converts EUR-based rates to USD base:
   - ECB provides EUR→USD = 1.085267
   - Invert to get USD→EUR = 0.921456
- 6t. System processes rates (resume at Step 7)
- 6u. System marks update as successful with notation: "Fallback to ECB used"
- 6v. System logs: Primary provider failed, fallback successful
- 6w. System sends alert to System Admin: "Primary rate provider (OpenExchangeRates) unavailable, fallback to ECB successful. Please investigate primary provider."

**A4: No Fallback Provider / All Providers Fail (Step 6m)**
- 6m. System checks for fallback provider: None configured or all failed
- 6n. System has exhausted all retry and fallback options
- 6o. System logs critical failure:
   - Event: AUTOMATED_UPDATE_FAILURE_CRITICAL
   - All Providers: Failed
   - Last Successful Update: 2025-01-13 12:00 UTC (1 hour ago)
- 6p. System sends critical alerts (multiple channels):
   - **Email**: To Finance Manager, Treasury Manager, System Admin
     - Subject: "CRITICAL: Exchange Rate Update Failed - All Providers Unavailable"
     - Body: Error details, last successful update time, recommended actions
   - **In-App Notification**: High-priority alert to finance team
   - **System Dashboard**: Red alert indicator on rate provider health widget
- 6q. System marks provider status: Error
- 6r. System does NOT supersede existing rates (keep last known good rates active)
- 6s. System flags existing rates as "stale" (>configured threshold)
- 6t. System schedules retry in 15 minutes (shorter interval for critical failure)
- 6u. Update process fails, existing rates remain active with staleness warning

**A5: Invalid/Malformed Response (Step 8)**
- 8a. System parses JSON response
- 8b. Parsing fails: JSON structure invalid or unexpected format
- 8c. System logs error:
   - Event: AUTOMATED_UPDATE_FAILURE
   - Provider: OpenExchangeRates
   - Error: "Invalid response format: JSON parsing failed"
   - Response: [truncated response for debugging]
- 8d. System treats as temporary provider failure
- 8e. Flow proceeds to Alternative Flow A2 (retry and fallback)

**A6: Partial Rate Data (Step 8)**
- 8a. System validates response data
- 8b. Only 4 of 7 requested currencies present:
   - Present: EUR, GBP, JPY, CAD
   - Missing: AUD, CHF, CNY
- 8c. System logs warning: Partial data received
- 8d. System processes available currencies (4 rates updated)
- 8e. System logs missing currencies: AUD, CHF, CNY rates not updated
- 8f. System sends notification to Finance Manager:
   - "Partial rate update: 4 of 7 currencies updated. Missing: AUD, CHF, CNY. Previous rates remain active for missing currencies."
- 8g. Update completes with partial success
- 8h. System schedules additional update attempt for missing currencies in 30 minutes

**A7: Suspended Update Period (Step 2)**
- 2a. System checks suspension status
- 2b. Current Date: 2025-01-31 (last day of month)
- 2c. Suspension Period Active: Month-End Close (Jan 29-31)
- 2d. System determines: Update suspended
- 2e. System logs: Update skipped due to suspension period
- 2f. System does NOT proceed with update
- 2g. System schedules next attempt after suspension period ends (Feb 1)
- 2h. Update process aborted (by design, not failure)

**A8: Rate Triangulation Required (Step 9)**
- 9a. Provider returns rates with USD base
- 9b. System needs to create GBP→JPY rate (no direct rate provided)
- 9c. System has: USD→GBP = 0.788901, USD→JPY = 149.234500
- 9d. System calculates triangulated rate:
   - First invert: GBP→USD = 1 / 0.788901 = 1.267890
   - Then multiply: GBP→JPY = 1.267890 × 149.234500 = 189.206435
- 9e. System creates triangulated rate record:
   - source_currency: GBP
   - target_currency: JPY
   - exchange_rate: 189.206435 (calculated)
   - rate_source: OpenExchangeRates API (Triangulated)
   - is_triangulated: true
   - triangulation_path: GBP→USD→JPY
- 9f. System saves triangulated rate
- 9g. Triangulation processing complete

**Postconditions**:
- **Success**: All rates updated and activated (or routed to approval if high variance), provider health metrics updated, next update scheduled, notifications sent (if configured)
- **Partial Success**: Some rates updated, failures logged, alerts sent for failed currencies, retry scheduled for failed currencies
- **Failure**: No rates updated, existing rates remain active (marked stale), critical alerts sent, retry scheduled, issue logged for investigation

**Business Rules**:
- BR-EXR-007: Automated updates suspended during critical financial periods
- BR-EXR-009: Failed updates retry 3 times with exponential backoff
- BR-EXR-011: High-variance automated rates require approval
- BR-EXR-008: Approved rates activate immediately
- BR-EXR-010: Stale rates (>24 hours) trigger warnings

**Performance Requirements**:
- API call response time <5 seconds
- Total update process (7 currencies) <10 seconds
- Database write operations <1 second per rate
- Retry delays: 1 minute, 5 minutes, 15 minutes (exponential backoff)

**Monitoring and Alerts**:
- Success rate monitoring: Alert if <95% over 24 hours
- Provider health dashboard: Real-time status indicators
- Critical alerts: All providers failed, >24 hours without successful update
- Warning alerts: Partial update, high variance detected, single provider failed

**Related Use Cases**:
- UC-EXR-001: Configure Rate Provider (configuration source)
- UC-EXR-002: Configure Update Schedule (schedule configuration)
- UC-EXR-102: Validate Retrieved Rates (validation subprocess)
- UC-EXR-103: Route High-Variance Rates to Approval (approval routing)
- UC-EXR-104: Send Rate Update Failure Alerts (failure notification)

---

## Additional Use Cases (Summary Only)

*Due to length constraints, the following use cases are summarized. Full details available in extended documentation.*

### UC-EXR-002: Configure Update Schedule
- Configure hourly, daily, or real-time update schedules
- Set update times (e.g., daily at 09:00 AM)
- Define business hours vs 24/7 updates
- Configure suspension periods (month-end, year-end)

### UC-EXR-003: Enable/Disable Rate Provider
- Temporarily disable provider without deleting configuration
- Re-enable provider when service restored
- View provider status history

### UC-EXR-004: Set Variance Threshold
- Configure variance percentage triggering approval (default 5%)
- Set different thresholds per currency pair (high-volatility pairs)
- Define approval routing rules based on variance levels

### UC-EXR-005: Configure Rate Approval Workflow
- Define approval limits by role (Manager <10%, Controller <25%, CFO unlimited)
- Configure notification recipients for approvals
- Set approval time limits and escalation rules

### UC-EXR-007: Enter Forward Rate with Contract
- Specialized rate entry for forward exchange contracts
- Mandatory contract reference and counterparty information
- Future effective date and expiry date required
- Links to hedging strategy and risk management

### UC-EXR-008: Enter Month-End Rate
- Capture period-end rates for financial close
- Flag rates as period-end for revaluation use
- Requires specific effective date (last business day of month)
- Higher approval requirements than spot rates

### UC-EXR-010: Reject Exchange Rate with Comments
- Reject pending rates with mandatory comments
- Return to submitter for revision or resubmission
- Audit trail of rejection reason

### UC-EXR-011: Bulk Import Exchange Rates
- Upload CSV/Excel file with multiple currency pairs
- Template-based import with validation
- All-or-nothing transaction (all valid or none imported)
- Import summary report with success/failure details

### UC-EXR-012: Correct Historical Exchange Rate
- Correct previously entered incorrect rates
- CFO/Controller approval required
- Original rate preserved, correction linked
- Impact analysis on affected transactions
- Restatement of financial results if material

### UC-EXR-013: View Current Exchange Rates
- Dashboard view of all active currency pairs
- Real-time rate age indicators
- Quick search and filter by currency
- Rate source and last update timestamp

### UC-EXR-014: Search Historical Exchange Rates
- Search rates by currency pair and date range
- Filter by rate type (spot, forward, month-end)
- Export historical rates for analysis

### UC-EXR-015: View Exchange Rate Trends
- Historical rate chart (line graph)
- Configurable time periods (7 days, 30 days, 90 days, 1 year)
- High/low/average trend lines
- Currency correlation analysis

### UC-EXR-016: Compare Rates Across Providers
- Side-by-side comparison of rates from multiple sources
- Variance analysis between providers
- Identify rate discrepancies and anomalies

### UC-EXR-017: View Rate Approval Queue
- List of all pending rate approvals
- Sort by variance, submission date, currency pair
- Bulk approval capability
- Aging alerts for rates pending >24 hours

### UC-EXR-019: Perform Bulk Currency Conversion
- Convert multiple amounts at once
- Upload Excel template with amounts and currency pairs
- Generate conversion results spreadsheet
- Suitable for mass invoice processing

### UC-EXR-020: View Conversion History
- Audit trail of all conversions performed
- Filter by user, currency pair, date range
- Link conversions to source transactions (PO, invoice, etc.)

### UC-EXR-021: Generate Exchange Rate Audit Report
- Comprehensive audit report of all rate changes
- Filter by date range, user, currency pair, event type
- Export in PDF, Excel, CSV formats
- Compliance-ready format for external auditors

### UC-EXR-022: Export Historical Rates for Audit
- Export historical rate data for specific periods
- Include rate source, approval chain, supporting documents
- External auditor-friendly format
- 7+ year historical data retention

### UC-EXR-023: View Rate Change History
- Timeline view of rate changes for currency pair
- Before/after values with variance
- User attribution and approval chain
- Visual change indicators

### UC-EXR-024: Monitor Rate Provider Health
- Dashboard showing provider status, uptime, response times
- Success rate trends over time
- Failure alerts and resolution tracking
- Performance comparison across providers

### UC-EXR-102: Validate Retrieved Rates
- Automated validation of rates from external providers
- Checks: positive values, inverse calculation, variance thresholds
- Triangulation consistency validation
- Data type and format validation

### UC-EXR-103: Route High-Variance Rates to Approval
- Automated routing based on variance thresholds
- Determines appropriate approver based on variance level
- Generates approval notification
- Maintains rate in pending status until approved

### UC-EXR-104: Send Rate Update Failure Alerts
- Critical alerts when automated updates fail
- Escalation to multiple recipients (email, in-app, SMS)
- Provides troubleshooting guidance
- Tracks alert acknowledgment and resolution

### UC-EXR-105: Calculate Real-Time Conversion (System)
- Core conversion engine used by all modules
- Retrieves appropriate rate for transaction date
- Performs triangulation if direct rate unavailable
- Returns conversion result with metadata
- Caches conversion for performance

### UC-EXR-106: Perform Triangulated Conversion (System)
- Handles currency pairs without direct rates
- Triangulates via base currency (USD)
- Validates triangulation consistency
- Documents conversion path in audit trail

### UC-EXR-107: Run Period-End Currency Revaluation (System)
- Automated background job at period close
- Calculates unrealized gains/losses on open foreign currency balances
- Uses period-end rates (month-end, quarter-end, year-end)
- Generates revaluation journal entries
- Posts to GL via integration

### UC-EXR-108: Post Exchange Gain/Loss Adjustment (System)
- Generates journal entries for exchange gains/losses
- Retrieves GL account codes from Account Code Mapping
- Posts adjustments to appropriate accounts
- Maintains audit trail of all postings
- Reverses previous revaluation adjustments

### UC-EXR-201: Fetch Rates from OpenExchangeRates (Integration)
- Real-time API integration with OpenExchangeRates.org
- Handles authentication, request formatting, response parsing
- Error handling and retry logic
- Rate transformation to internal format

### UC-EXR-202: Fetch Rates from Bloomberg (Integration)
- Enterprise integration with Bloomberg Terminal
- Supports real-time, spot, and forward rates
- High-reliability connection management
- Bloomberg-specific data transformation

### UC-EXR-203: Provide Rate for Purchase Order (Integration)
- Procurement module requests conversion for vendor currency PO
- Returns appropriate rate for PO date and currency pair
- Logs conversion for audit trail
- Links conversion to PO transaction

### UC-EXR-204: Provide Rate for Sales Invoice (Integration)
- Sales module requests conversion for customer currency invoice
- Returns appropriate rate for invoice date and currency pair
- Logs conversion for audit trail
- Links conversion to invoice transaction

---

## Use Case Relationships

### Dependencies
- UC-EXR-006 (Manual Entry) → UC-EXR-009 (Approval) [if variance high]
- UC-EXR-001 (Configure Provider) → UC-EXR-101 (Automated Retrieval)
- UC-EXR-101 (Automated Retrieval) → UC-EXR-103 (Route to Approval) [if variance high]
- UC-EXR-018 (Currency Conversion) → UC-EXR-105 (Real-Time Conversion System)
- UC-EXR-107 (Period-End Reval) → UC-EXR-108 (Post Adjustment)

### Extensions
- UC-EXR-009 (Approve Rate) extends UC-EXR-010 (Reject Rate) [alternative outcome]
- UC-EXR-018 (Single Conversion) extends UC-EXR-019 (Bulk Conversion) [scalability]
- UC-EXR-101 (Automated Update) extends UC-EXR-104 (Failure Alerts) [error handling]

### Includes
- All manual entry use cases include UC-EXR-102 (Validate Rates)
- All conversion use cases include UC-EXR-105 (Calculate Conversion)
- All approval use cases include UC-EXR-021 (Audit Logging)

---

## Success Criteria

### Functional Completeness
- ✅ All 25+ use cases implemented and tested
- ✅ Manual and automated rate entry workflows functional
- ✅ Approval workflows enforce variance thresholds
- ✅ Real-time conversion accurate and performant
- ✅ Historical rate management maintains 7+ years data
- ✅ Integration with Procurement and Sales modules operational

### Performance
- ✅ Conversion response time <500ms (cached), <2s (non-cached)
- ✅ Automated update processes 10+ currency pairs in <10 seconds
- ✅ Approval queue loads in <1 second with 100+ pending rates
- ✅ Historical rate queries return results in <3 seconds

### Usability
- ✅ Finance team can configure providers without IT support
- ✅ Manual rate entry completed in <2 minutes
- ✅ Approval queue intuitive with clear variance indicators
- ✅ Currency conversion tool accessible and easy to use

### Compliance
- ✅ Complete audit trail for all rate changes (100% coverage)
- ✅ Approval workflows enforce segregation of duties
- ✅ 7+ year historical rate retention
- ✅ IAS 21 compliance for exchange rate accounting

---

**Document End**
