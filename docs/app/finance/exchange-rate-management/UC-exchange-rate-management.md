# Use Cases: Exchange Rate Management

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
| 1.0.0 | 2025-01-13 | Documentation Team | Initial version |

---

## Overview

This document describes the use cases for the Exchange Rate Management module, which provides basic CRUD operations for managing currency exchange rates.

**Related Documents**:
- [Business Requirements](./BR-exchange-rate-management.md)
- [Data Dictionary](./DD-exchange-rate-management.md)
- [Technical Specification](./TS-exchange-rate-management.md)
- [Flow Diagrams](./FD-exchange-rate-management.md)
- [Validation Rules](./VAL-exchange-rate-management.md)

---

## Actors

### Primary Actors

| Actor | Description | Typical Tasks |
|-------|-------------|---------------|
| **Financial Controller** | Oversees financial operations | Views rates, approves rate changes |
| **Finance Manager** | Manages finance department | Creates/edits exchange rates |
| **AP Clerk** | Processes vendor payments | Views rates for payment processing |

### Secondary Actors

| Actor | Description | Typical Tasks |
|-------|-------------|---------------|
| **System Administrator** | System configuration | Full access to rate management |

---

## Use Case Summary

| ID | Use Case | Actor | Priority |
|----|----------|-------|----------|
| UC-EXRATE-001 | View Exchange Rate List | All Actors | High |
| UC-EXRATE-002 | Search Exchange Rates | All Actors | High |
| UC-EXRATE-003 | Add Exchange Rate | Finance Manager | High |
| UC-EXRATE-004 | Edit Exchange Rate | Finance Manager | High |
| UC-EXRATE-005 | Delete Exchange Rate | Finance Manager | Medium |
| UC-EXRATE-006 | Print Exchange Rates | All Actors | Low |

---

## Use Case Specifications

### UC-EXRATE-001: View Exchange Rate List

**Use Case ID**: UC-EXRATE-001
**Use Case Name**: View Exchange Rate List
**Actor**: All Actors
**Priority**: High
**Status**: Implemented

#### Description
User views the list of all configured exchange rates in a table format.

#### Preconditions
1. User has access to the Finance module
2. User navigates to `/finance/exchange-rates`

#### Main Flow
1. System displays the Exchange Rate Viewer page
2. System shows header with title and action buttons (Add Rate, Print, Import CSV)
3. System shows search input field
4. System displays table with columns: Currency Code, Currency Name, Rate, Last Updated, Actions
5. Each row displays rate data with 6 decimal precision
6. Actions dropdown shows Edit and Delete options

#### Postconditions
- Exchange rate list is displayed to user
- Action buttons available for each row

---

### UC-EXRATE-002: Search Exchange Rates

**Use Case ID**: UC-EXRATE-002
**Use Case Name**: Search Exchange Rates
**Actor**: All Actors
**Priority**: High
**Status**: Implemented

#### Description
User filters the exchange rate list by search term.

#### Preconditions
1. User is on the Exchange Rate Viewer page

#### Main Flow
1. User enters search term in search input
2. System filters rates in real-time
3. System matches against currency code and currency name (case-insensitive)
4. System displays only matching rates

#### Alternative Flow - No Results
3a. No rates match the search term
3b. Table displays empty (no matching rates)

#### Postconditions
- Table shows only rates matching search term
- Search is case-insensitive

---

### UC-EXRATE-003: Add Exchange Rate

**Use Case ID**: UC-EXRATE-003
**Use Case Name**: Add Exchange Rate
**Actor**: Finance Manager
**Priority**: High
**Status**: Implemented

#### Description
User creates a new exchange rate entry.

#### Preconditions
1. User is on the Exchange Rate Viewer page
2. User has permission to create rates

#### Main Flow
1. User clicks "Add Rate" button
2. System opens Add Exchange Rate dialog
3. System displays form with fields: Currency Code, Currency Name, Exchange Rate
4. User enters Currency Code (auto-converts to uppercase)
5. User enters Currency Name
6. User enters Exchange Rate (6 decimal places)
7. User clicks "Add Rate" button
8. System validates: code and name not empty, rate > 0
9. System adds rate to list with current date as lastUpdated
10. System closes dialog
11. New rate appears in table

#### Alternative Flow - Cancel
7a. User clicks "Cancel" button
7b. System closes dialog without saving
7c. No changes made to rate list

#### Alternative Flow - Validation Failure
8a. Code or name is empty, or rate is not > 0
8b. System does not create rate
8c. Dialog remains open

#### Postconditions
- New exchange rate added to list
- lastUpdated set to current date

---

### UC-EXRATE-004: Edit Exchange Rate

**Use Case ID**: UC-EXRATE-004
**Use Case Name**: Edit Exchange Rate
**Actor**: Finance Manager
**Priority**: High
**Status**: Implemented

#### Description
User modifies an existing exchange rate.

#### Preconditions
1. Exchange rate exists in the system
2. User is on the Exchange Rate Viewer page

#### Main Flow
1. User clicks Actions menu (three dots) on rate row
2. User selects "Edit Rate" from dropdown
3. System opens Edit Exchange Rate dialog
4. System displays form pre-populated with current values
5. System shows Currency Code field as disabled
6. User modifies Currency Name (optional)
7. User modifies Exchange Rate
8. User clicks "Save Changes" button
9. System updates rate in list
10. System sets lastUpdated to current date
11. System closes dialog

#### Alternative Flow - Cancel
8a. User clicks "Cancel" button
8b. System closes dialog without saving
8c. Rate remains unchanged

#### Postconditions
- Exchange rate updated with new values
- lastUpdated reflects current date

---

### UC-EXRATE-005: Delete Exchange Rate

**Use Case ID**: UC-EXRATE-005
**Use Case Name**: Delete Exchange Rate
**Actor**: Finance Manager
**Priority**: Medium
**Status**: Implemented

#### Description
User removes an exchange rate from the system.

#### Preconditions
1. Exchange rate exists in the system
2. User is on the Exchange Rate Viewer page

#### Main Flow
1. User clicks Actions menu (three dots) on rate row
2. User selects "Delete" from dropdown
3. System shows browser confirmation dialog with message: "Are you sure you want to delete exchange rate for {code}?"
4. User clicks OK to confirm
5. System removes rate from list
6. Rate no longer appears in table

#### Alternative Flow - Cancel
4a. User clicks Cancel in confirmation dialog
4b. System does not delete rate
4c. Rate remains in list

#### Postconditions
- Exchange rate removed from system

---

### UC-EXRATE-006: Print Exchange Rates

**Use Case ID**: UC-EXRATE-006
**Use Case Name**: Print Exchange Rates
**Actor**: All Actors
**Priority**: Low
**Status**: Implemented

#### Description
User prints the current exchange rate list.

#### Preconditions
1. User is on the Exchange Rate Viewer page

#### Main Flow
1. User clicks "Print" button
2. System triggers browser print dialog
3. User selects printer and options
4. User clicks Print
5. Rate list is printed

#### Alternative Flow - Cancel Print
3a. User clicks Cancel in print dialog
3b. Print is cancelled
3c. User returns to Exchange Rate Viewer

#### Postconditions
- Exchange rate list printed (if completed)

---

## User Journey Diagram

```
                Exchange Rate Management User Journey
                =====================================

    [Navigate to Module]
           |
           v
    +------------------+
    | View Exchange    |<----------------------------------+
    | Rate List        |                                   |
    +------------------+                                   |
           |                                               |
           +---> [Search] ---> Filter Results ---+        |
           |                                      |        |
           +---> [Add Rate] -+                    |        |
           |                 |                    |        |
           |                 v                    |        |
           |         +---------------+            |        |
           |         | Add Dialog    |            |        |
           |         | - Code        |            |        |
           |         | - Name        |            |        |
           |         | - Rate        |            |        |
           |         +---------------+            |        |
           |                 |                    |        |
           |         [Add] / [Cancel]             |        |
           |                 |                    |        |
           |                 +-------------------+        |
           |                                               |
           +---> [Actions Menu] ---+                       |
           |                       |                       |
           |           [Edit] ---> Edit Dialog ---+       |
           |                       |               |       |
           |           [Delete] --> Confirm ------+-------+
           |                                               |
           +---> [Print] ---> Browser Print ---------------+
```

---

## Interaction Summary

### List Page Actions

| Element | Action | Result |
|---------|--------|--------|
| Add Rate button | Click | Open add dialog |
| Print button | Click | Open browser print |
| Import CSV button | Click | Show "To be implemented" alert |
| Search input | Type | Filter rate list |
| Actions menu | Click | Show Edit/Delete options |

### Add Dialog Actions

| Element | Action | Result |
|---------|--------|--------|
| Currency Code input | Type | Auto-uppercase conversion |
| Currency Name input | Type | Update form state |
| Exchange Rate input | Type | Accept decimal (6 places) |
| Cancel button | Click | Close dialog, no changes |
| Add Rate button | Click | Validate and create rate |

### Edit Dialog Actions

| Element | Action | Result |
|---------|--------|--------|
| Currency Code input | N/A | Disabled, shows value |
| Currency Name input | Type | Update form state |
| Exchange Rate input | Type | Accept decimal (6 places) |
| Cancel button | Click | Close dialog, no changes |
| Save Changes button | Click | Update rate, close dialog |

---

**Document End**
