# Business Requirements: Exchange Rate Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Exchange Rate Management
- **Route**: `/finance/exchange-rates`
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format |
| 1.0.0 | 2025-01-13 | Finance Product Team | Initial version |

---

## Overview

The Exchange Rate Management module provides a simple interface for maintaining currency exchange rates in the Carmen ERP system. It enables finance administrators to view, create, edit, and manage exchange rates for different currencies against a base rate.

**Current Implementation**: Basic CRUD operations for exchange rate master data using React local state.

**Related Documents**:
- [Use Cases](./UC-exchange-rate-management.md)
- [Data Dictionary](./DD-exchange-rate-management.md)
- [Technical Specification](./TS-exchange-rate-management.md)
- [Flow Diagrams](./FD-exchange-rate-management.md)
- [Validations](./VAL-exchange-rate-management.md)

---

## Business Context

### Module Purpose

The Exchange Rate Management module enables hospitality operations to:

1. **Rate Master Data**: Maintain exchange rates for multiple currencies
2. **Rate Updates**: Manually update rates as market conditions change
3. **Rate Visibility**: View all configured exchange rates in one place
4. **Print Support**: Generate printable rate lists for reference

### Current Features

| Feature | Status | Description |
|---------|--------|-------------|
| Exchange Rate List | Implemented | View all rates in table format |
| Add Rate | Implemented | Add new currency exchange rate |
| Edit Rate | Implemented | Modify existing rate values |
| Delete Rate | Implemented | Remove exchange rate with confirmation |
| Search | Implemented | Filter by currency code or name |
| Print | Implemented | Print current rate list |
| Import CSV | Placeholder | Not yet implemented |

---

## Functional Requirements

### FR-EXRATE-001: Exchange Rate List Display

**Priority**: High
**User Story**: As a Financial Controller, I want to view all exchange rates in a searchable table so that I can quickly find and review currency rates.

**Requirements**:
- Table displays: Currency Code, Currency Name, Rate, Last Updated
- Search filters by code or name
- Actions menu per row: Edit, Delete
- Header buttons: Add Rate, Print, Import CSV

**Acceptance Criteria**:
- Table loads with all configured exchange rates
- Search filters in real-time as user types
- Rate values display with 6 decimal places
- Last Updated shows date in YYYY-MM-DD format

---

### FR-EXRATE-002: Add New Exchange Rate

**Priority**: High
**User Story**: As a Finance Manager, I want to add new currency exchange rates so that additional currencies can be used in transactions.

**Requirements**:
- Dialog form with fields: Currency Code, Currency Name, Exchange Rate
- Currency code auto-converts to uppercase
- Rate input allows 6 decimal places
- Cancel and Add Rate buttons

**Acceptance Criteria**:
- Dialog opens when clicking "Add Rate" button
- Code field converts input to uppercase
- Rate field accepts decimal values
- New rate appears in table after creation
- Last Updated automatically set to current date

---

### FR-EXRATE-003: Edit Exchange Rate

**Priority**: High
**User Story**: As a Finance Manager, I want to edit existing exchange rates so that I can update rates when market conditions change.

**Requirements**:
- Dialog form pre-populated with current values
- Currency Code field disabled (cannot be changed)
- Currency Name and Rate are editable
- Cancel and Save Changes buttons

**Acceptance Criteria**:
- Dialog opens with current rate values
- Code field shows value but cannot be edited
- Modified rate updates in table
- Last Updated automatically updates to current date

---

### FR-EXRATE-004: Delete Exchange Rate

**Priority**: Medium
**User Story**: As a Finance Manager, I want to delete obsolete exchange rates so that the rate list remains current and accurate.

**Requirements**:
- Confirmation dialog before deletion
- Confirmation message includes currency code

**Acceptance Criteria**:
- Browser confirm dialog shows currency code
- Cancel returns without deleting
- Confirm removes rate from list

---

### FR-EXRATE-005: Search Exchange Rates

**Priority**: High
**User Story**: As a Finance Clerk, I want to search exchange rates by code or name so that I can quickly find specific currencies.

**Requirements**:
- Single search input field
- Filters by currency code or currency name
- Case-insensitive matching
- Real-time filtering as user types

**Acceptance Criteria**:
- Typing "USD" filters to show USD rate
- Typing "Euro" filters to show EUR rate
- Empty search shows all rates

---

### FR-EXRATE-006: Print Exchange Rates

**Priority**: Low
**User Story**: As a Finance Clerk, I want to print the exchange rate list so that I can have a physical reference for manual processes.

**Requirements**:
- Print button triggers browser print dialog
- Print layout suitable for standard paper

**Acceptance Criteria**:
- Clicking Print opens browser print dialog
- Current filtered list is printable

---

## Data Model

### Exchange Rate Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | ISO 4217 currency code (e.g., USD, EUR) |
| name | string | Yes | Full currency name |
| rate | number | Yes | Exchange rate value (6 decimals) |
| lastUpdated | string | Yes | Date of last update (YYYY-MM-DD) |

### Default Exchange Rates

| Code | Name | Rate | Last Updated |
|------|------|------|--------------|
| USD | United States Dollar | 1.000000 | 2023-07-01 |
| EUR | Euro | 0.920000 | 2023-07-01 |
| JPY | Japanese Yen | 144.500000 | 2023-07-01 |
| GBP | British Pound Sterling | 0.790000 | 2023-07-01 |

---

## Business Rules

### BR-EXRATE-001: Rate Value Requirement

**Rule**: Exchange rate must be a positive number greater than zero.

**Implementation**: Validation check: `rate > 0`

---

### BR-EXRATE-002: Code Immutability

**Rule**: Currency code cannot be changed after creation.

**Implementation**: Code field is disabled in edit dialog.

---

### BR-EXRATE-003: Delete Confirmation

**Rule**: Exchange rate deletion requires user confirmation.

**Implementation**: Browser confirm dialog before deletion.

---

### BR-EXRATE-004: Uppercase Currency Code

**Rule**: Currency codes should be uppercase.

**Implementation**: Auto-conversion to uppercase on input.

---

### BR-EXRATE-005: Last Updated Timestamp

**Rule**: Last Updated automatically updates when rate is created or modified.

**Implementation**: Set to current date on save.

---

## User Interface Summary

### Main Page Layout

```
+------------------------------------------------------------------+
| Exchange Rate Viewer                                              |
|                                     [Add Rate] [Print] [Import CSV]|
+------------------------------------------------------------------+
| [Search currencies...                                         ]   |
+------------------------------------------------------------------+
| Currency Code | Currency Name           | Rate       | Last Updated| Actions |
+---------------+------------------------+------------+-------------+---------+
| USD           | United States Dollar   | 1.000000   | 2023-07-01  | [...]   |
| EUR           | Euro                   | 0.920000   | 2023-07-01  | [...]   |
| JPY           | Japanese Yen           | 144.500000 | 2023-07-01  | [...]   |
| GBP           | British Pound Sterling | 0.790000   | 2023-07-01  | [...]   |
+------------------------------------------------------------------+
```

### Add/Edit Dialog

```
+------------------------------------------+
| Add Exchange Rate / Edit Exchange Rate   |
| Add a new currency exchange rate         |
+------------------------------------------+
| Currency Code                            |
| [USD________________] (uppercase auto)   |
|                                          |
| Currency Name                            |
| [United States Dollar______________]     |
|                                          |
| Exchange Rate                            |
| [1.000000_______] (step: 0.000001)      |
+------------------------------------------+
|                      [Cancel] [Add Rate] |
+------------------------------------------+
```

---

## Security and Access

### Role-Based Access (Planned)

| Role | View | Create | Edit | Delete |
|------|------|--------|------|--------|
| System Administrator | Yes | Yes | Yes | Yes |
| Financial Controller | Yes | Yes | Yes | Yes |
| Finance Manager | Yes | Yes | Yes | Yes |
| Finance Clerk | Yes | - | - | - |

**Note**: Role-based access control to be implemented in future phase.

---

## Integration Points

### Current Integrations

| Integration | Type | Description |
|-------------|------|-------------|
| Currency Management | Reference | Shares currency code standards |

### Planned Integrations

| Module | Integration Type | Purpose |
|--------|-----------------|---------|
| Procurement | Reference | Convert vendor prices |
| Purchase Orders | Reference | Multi-currency support |
| Vendor Management | Reference | Vendor currency rates |

---

## Future Enhancements

| Phase | Feature | Description |
|-------|---------|-------------|
| Phase 2 | Database Integration | Persist rates to database |
| Phase 2 | Import CSV | Implement bulk rate import |
| Phase 3 | Auto-Fetch Rates | API integration for rate updates |
| Phase 3 | Rate History | Track historical rate changes |
| Phase 4 | Currency Conversion | Real-time conversion API |

---

**Document End**
