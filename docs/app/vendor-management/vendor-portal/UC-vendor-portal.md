# Use Cases: Vendor Price Submission Portal

## Document Information
- **Document Type**: Use Cases Specification
- **System**: Vendor Price Submission Portal
- **Module**: Vendor Management > Vendor Portal
- **Version**: 3.0.0
- **Status**: Active
- **Created**: 2025-01-23
- **Last Updated**: 2026-01-15
- **Author**: Product Team
- **Related Documents**:
  - [Business Requirements](./BR-vendor-portal.md)
  - [Technical Specification](./TS-vendor-portal.md)
  - [Data Dictionary](./DD-vendor-portal.md)
  - [Flow Diagrams](./FD-vendor-portal.md)
  - [Validations](./VAL-vendor-portal.md)

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.1 | 2026-01-15 | Documentation Team | Synced with current code; Verified ProductItem interface; Confirmed supported currencies (BHT, USD, CNY, SGD); Updated source file references |
| 3.0.0 | 2025-11-26 | System | Complete refactor - removed staff-side use cases (UC-VPP-001 to UC-VPP-005). This document now focuses ONLY on vendor-facing portal. See related modules for staff-side functionality. |
| 2.1.0 | 2025-11-26 | System | Removed approval workflow; Updated status to draft to submitted; Aligned with BR v2.1.0 |
| 2.0 | 2025-01-23 | Product Team | Complete rewrite based on actual implementation - token-based price submission only |
| 1.0 | 2024-01-15 | System | Initial version (INCORRECT - full vendor portal) |

---

## Scope Clarification

### In Scope (This Document)
- Vendor portal access via token (UC-VPP-006)
- Online price submission (UC-VPP-007)
- Excel upload submission (UC-VPP-008)
- Excel template download (UC-VPP-009)
- Submission review and confirmation (UC-VPP-010)
- Submission history viewing (UC-VPP-011)

### Out of Scope (See Related Modules)
- **Pricelist Template Creation** (UC-VPP-001) → See [pricelist-templates](../pricelist-templates/) module
- **Campaign Creation** (UC-VPP-002) → See [requests-for-pricing](../requests-for-pricing/) module
- **Vendor Invitation** (UC-VPP-003) → See [requests-for-pricing](../requests-for-pricing/) module
- **Campaign Launch** (UC-VPP-005) → See [requests-for-pricing](../requests-for-pricing/) module
- **Submission Viewing by Staff** → See [price-lists](../price-lists/) module

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Actors](#2-actors)
3. [Use Case Catalog](#3-use-case-catalog)
4. [Primary Use Cases](#4-primary-use-cases)
5. [Use Case Relationships](#5-use-case-relationships)
6. [Appendices](#6-appendices)

---

## 1. Introduction

### 1.1 Purpose
This document defines the use cases for the Vendor Price Submission Portal, focusing specifically on the vendor-facing functionality. This portal enables vendors to submit pricing information through token-based access without requiring traditional authentication.

### 1.2 Scope
This document covers vendor-facing functionality ONLY:
- Token-based portal access
- Price submission via three methods (online, Excel upload, Excel download)
- Draft management with auto-save
- Submission confirmation

**Note**: There is no approval workflow - pricelists go from draft → submitted (active) directly.

This document does NOT cover:
- Campaign creation and management (see [requests-for-pricing](../requests-for-pricing/))
- Template creation (see [pricelist-templates](../pricelist-templates/))
- Vendor invitation (see [requests-for-pricing](../requests-for-pricing/))
- Pricelist viewing by staff (see [price-lists](../price-lists/))

### 1.3 Document Conventions
- **Use Case ID Format**: UC-VPP-XXX (UC = Use Case, VPP = Vendor Price Portal, XXX = sequence number)
- **Actor Names**: Capitalized (e.g., Vendor)
- **Business Rules**: Referenced as BR-VPP-Rule-XXX from BR document
- **Priority Levels**: Critical, High, Medium, Low

---

## 2. Actors

### 2.1 Primary Actors

#### 2.1.1 Vendor
**Description**: External supplier who submits pricing information through the vendor portal using token-based access.

**Responsibilities**:
- Access portal via unique token link
- Review pricelist template requirements
- Submit accurate pricing information
- Meet campaign deadlines

**Frequency**: Periodic (campaign-dependent)

**Authentication**: Token-based only (no username/password)

### 2.2 Secondary Actors

#### 2.2.1 System (Automated Processes)
**Description**: Automated system processes.

**Responsibilities**:
- Validate tokens on portal access
- Auto-save vendor draft submissions
- Calculate quality scores
- Send submission confirmation emails
- Expire tokens based on campaign end date

---

## 3. Use Case Catalog

### 3.1 Use Case Overview

| ID | Use Case Name | Priority | Primary Actor | Frequency |
|----|---------------|----------|---------------|-----------|
| UC-VPP-006 | Access Vendor Portal via Token | Critical | Vendor | As invited |
| UC-VPP-007 | Submit Prices Online | Critical | Vendor | As invited |
| UC-VPP-008 | Upload Excel Pricelist | High | Vendor | As invited |
| UC-VPP-009 | Download Excel Template | High | Vendor | As invited |
| UC-VPP-010 | Review and Confirm Submission | High | Vendor | As invited |
| UC-VPP-011 | View Submission History | Medium | Vendor | As needed |

---

## 4. Primary Use Cases

### UC-VPP-006: Access Vendor Portal via Token

#### Basic Information
- **Use Case ID**: UC-VPP-006
- **Use Case Name**: Access Vendor Portal via Token
- **Priority**: Critical
- **Primary Actor**: Vendor
- **Secondary Actors**: System
- **Frequency**: Per invitation
- **Related Requirements**: BR-VPP-010, BR-VPP-011

#### Description
Vendor accesses the price submission portal using a unique token link received via email invitation.

#### Preconditions
1. Vendor received invitation email with token link
2. Token is valid and not expired
3. Campaign associated with token is active

#### Main Flow
1. Vendor receives invitation email with portal link: `https://portal.carmen.com/vendor-portal/{token}`
2. Vendor clicks link in email
3. Browser navigates to vendor portal with token in URL
4. System receives request with token
5. System validates token:
   - Token exists in database
   - Token format is valid UUID
   - Token status is 'sent' or 'accessed'
   - Associated campaign is active
   - Current date is before token expiration date
6. System retrieves campaign and pricelist data
7. System creates portal session
8. System updates invitation record (first access: status = 'accessed')
9. System logs access activity
10. System displays vendor portal interface

#### Alternative Flows

**A1: Returning Vendor - Resume Draft**
- At step 6, vendor has existing draft pricelist
- System displays welcome back message with completion percentage
- Vendor can continue draft or start over

**A2: Token About to Expire Warning**
- At step 5, token expires in <24 hours
- System displays warning banner

#### Exception Flows

**E1: Invalid Token Format**
- At step 5, token is not valid UUID format
- System displays error page
- Flow ends with error

**E2: Token Expired**
- At step 5, current date > token expiration date
- System displays "Invitation Expired" error
- Flow ends with error

**E3: Campaign Not Active**
- At step 5, campaign status is not 'active'
- System displays "Campaign Closed" message
- Flow ends with error

#### Postconditions
**Success**:
- Portal session created and active
- Vendor authenticated via token
- Invitation status updated
- Access logged
- Vendor portal interface displayed

**Failure**:
- No portal session created
- Error page displayed
- Security event logged (if applicable)

#### Business Rules
- BR-VPP-Rule-011: One unique token per vendor per campaign
- BR-VPP-Rule-012: Token expires with campaign end date
- BR-VPP-Rule-024: Token is only authentication method
- BR-VPP-Rule-025: Vendor can access portal unlimited times before expiration

---

### UC-VPP-007: Submit Prices Online

#### Basic Information
- **Use Case ID**: UC-VPP-007
- **Use Case Name**: Submit Prices Online
- **Priority**: Critical
- **Primary Actor**: Vendor
- **Secondary Actors**: System (Auto-save)
- **Frequency**: Per campaign invitation
- **Related Requirements**: BR-VPP-011, BR-VPP-012, BR-VPP-013

#### Description
Vendor submits pricing information using the online web form interface with inline editing and auto-save.

#### Preconditions
1. Vendor has accessed portal via valid token (UC-VPP-006)
2. Campaign is active
3. Pricelist template is loaded

#### Main Flow
1. Vendor clicks "Submit Prices" tab
2. System displays three submission method options
3. Vendor selects "Online Entry"
4. System displays online price entry interface

**Header Section**:
5. System displays pricelist header form:
   - Currency (dropdown, required)
   - Effective Start Date (required)
   - Effective End Date (optional, null = open-ended)
   - General Notes (optional)

**Product List Section**:
6. System displays product list table with all products from template

7. Vendor enters pricing for each product:

**Option A: Simple Single-Tier Pricing**:
8. Vendor enters base price and lead time
9. System validates and auto-saves

**Option B: Multi-Tier MOQ Pricing**:
10. Vendor clicks "Add MOQ Tiers" button
11. System displays tier form (up to 5 tiers)
12. Vendor enters tier data (MOQ, Unit Price, Lead Time)
13. System validates MOQ tiers (ascending order)

**Option C: Free of Charge (FOC) Quantity**:
14. Vendor enters FOC quantity, unit, and notes

**Auto-Save**:
15. System auto-saves every 2 minutes
16. System saves on field blur and tab navigation

**Submit**:
17. When vendor completes pricing, system enables "Submit" button
18. Vendor clicks "Submit"
19. System displays submission confirmation dialog with summary
20. Vendor clicks "Confirm Submit"
21. System performs final validation
22. System updates pricelist status: 'draft' → 'submitted' (active immediately)
23. System sends confirmation email to vendor
24. System sends notification to campaign owner
25. System displays success message

**Note**: There is no approval workflow - submitted pricelists become active immediately.

#### Alternative Flows

**A1: Resume Draft Submission**
- System loads draft data from previous session
- Vendor continues editing from where they left off

**A2: Save Draft and Exit**
- Vendor clicks "Save Draft" or closes browser
- System saves all current data
- Vendor can return later to complete

#### Exception Flows

**E1: Validation Error - Invalid Base Price**
- System displays inline error
- Vendor corrects price

**E2: Session Expired During Submission**
- System displays session expired modal
- System saves draft automatically
- Vendor re-authenticates and resumes

**E3: MOQ Tiers Not in Ascending Order**
- At step 13, system detects invalid tier order
- System displays error message
- Vendor corrects tier values

#### Postconditions
**Success**:
- Pricelist status changed to 'submitted'
- All product pricing data saved
- Completion percentage and quality score calculated
- Confirmation emails sent
- Portal changes to read-only mode

**Draft Saved**:
- Pricelist remains 'draft'
- Data saved
- Vendor can return later

#### Business Rules
- BR-VPP-Rule-027: Auto-save every 2 minutes
- BR-VPP-Rule-028: Maximum 5 MOQ tiers per product
- BR-VPP-Rule-029: MOQ quantities must be in ascending order
- BR-VPP-Rule-030: All prices must be positive numbers

---

### UC-VPP-008: Upload Excel Pricelist

#### Basic Information
- **Use Case ID**: UC-VPP-008
- **Use Case Name**: Upload Excel Pricelist
- **Priority**: High
- **Primary Actor**: Vendor
- **Secondary Actors**: System
- **Frequency**: Per campaign invitation
- **Related Requirements**: BR-VPP-012

#### Description
Vendor uploads a completed Excel file containing pricing information instead of using online entry.

#### Preconditions
1. Vendor has accessed portal via valid token (UC-VPP-006)
2. Campaign is active
3. Vendor has completed Excel file (from downloaded template)

#### Main Flow
1. Vendor clicks "Submit Prices" tab
2. System displays three submission method options
3. Vendor selects "Upload Excel"
4. System displays upload interface with drag-and-drop zone
5. Vendor drags file or clicks to select file
6. System validates file:
   - File type: .xlsx or .csv
   - File size: ≤ 10MB
7. System uploads file
8. System parses Excel content:
   - Read header row
   - Map columns to expected fields
   - Extract product pricing data
9. System validates parsed data:
   - Required fields present
   - Price values are valid numbers
   - Product codes match template
   - MOQ tiers in ascending order (if applicable)
10. System displays parsed data preview:
    - Shows all parsed items
    - Highlights errors and warnings
    - Shows validation summary
11. Vendor reviews parsed data
12. Vendor clicks "Confirm and Save"
13. System saves pricing data to pricelist
14. System displays success message

**Submit After Upload**:
15. Vendor can then submit using same flow as UC-VPP-007 (steps 17-25)

#### Alternative Flows

**A1: Validation Errors in Excel**
- At step 9, system finds validation errors
- System displays errors with row numbers
- Vendor can: Fix errors offline and re-upload OR Edit inline

**A2: Partial Data Upload**
- Excel contains subset of products
- System imports available data
- Vendor completes remaining products online

#### Exception Flows

**E1: Invalid File Type**
- At step 6, file is not .xlsx or .csv
- System displays error message
- Vendor selects correct file type

**E2: File Too Large**
- At step 6, file exceeds 10MB
- System displays error message
- Vendor reduces file size

**E3: Template Mismatch**
- At step 9, column structure doesn't match expected template
- System displays mapping error
- Vendor downloads correct template

#### Postconditions
**Success**:
- Excel file stored
- Pricing data parsed and saved
- Pricelist ready for submission

**Failure**:
- Upload rejected
- Error message displayed
- No data saved

#### Business Rules
- BR-VPP-Rule-031: Maximum file size 10MB
- BR-VPP-Rule-032: Accepted file types: .xlsx, .csv
- BR-VPP-Rule-033: Excel structure must match template

---

### UC-VPP-009: Download Excel Template

#### Basic Information
- **Use Case ID**: UC-VPP-009
- **Use Case Name**: Download Excel Template
- **Priority**: High
- **Primary Actor**: Vendor
- **Secondary Actors**: System
- **Frequency**: Per campaign invitation
- **Related Requirements**: BR-VPP-013

#### Description
Vendor downloads an Excel template pre-filled with required products to complete offline.

#### Preconditions
1. Vendor has accessed portal via valid token (UC-VPP-006)
2. Campaign is active

#### Main Flow
1. Vendor clicks "Submit Prices" tab
2. System displays three submission method options
3. Vendor selects "Download Template"
4. System displays template information:
   - Number of products
   - Required fields
   - Instructions summary
5. Vendor clicks "Download Excel Template"
6. System generates Excel file:
   - Sheet 1: Pricing data sheet with product list
   - Sheet 2: Instructions and field descriptions
   - Pre-filled product codes and names
   - Data validation rules in cells
   - Column headers with field names
7. Browser downloads file
8. Vendor saves file to local computer

**Fill Offline and Upload Later**:
9. Vendor opens file in Excel
10. Vendor fills in pricing data
11. Vendor saves file
12. Vendor uploads using UC-VPP-008

#### Alternative Flows

**A1: Download with Existing Draft Data**
- At step 6, vendor has existing draft
- System includes draft pricing in template
- Vendor can see previously entered values

#### Exception Flows

**E1: Template Generation Error**
- At step 6, system fails to generate template
- System displays error message
- Vendor can retry or contact support

#### Postconditions
**Success**:
- Excel template downloaded
- Template contains all required products
- Vendor can fill offline

**Failure**:
- Download fails
- Error message displayed

#### Business Rules
- BR-VPP-Rule-034: Template includes all products from campaign template
- BR-VPP-Rule-035: Template includes data validation rules
- BR-VPP-Rule-036: Template includes instructions sheet

---

### UC-VPP-010: Review and Confirm Submission

#### Basic Information
- **Use Case ID**: UC-VPP-010
- **Use Case Name**: Review and Confirm Submission
- **Priority**: High
- **Primary Actor**: Vendor
- **Secondary Actors**: System
- **Frequency**: Per submission
- **Related Requirements**: BR-VPP-014

#### Description
Vendor reviews entered pricing data before final submission.

#### Preconditions
1. Vendor has entered pricing data (via UC-VPP-007 or UC-VPP-008)
2. Pricelist is in 'draft' status

#### Main Flow
1. Vendor clicks "Review" tab
2. System displays submission summary:
   - Completion percentage
   - Total items
   - Completed items
   - Missing items (if any)
   - Header information (currency, dates)
3. System displays item-by-item pricing review:
   - Product code and name
   - Unit price
   - MOQ tiers (if applicable)
   - FOC quantities (if applicable)
   - Lead time
4. Vendor reviews all entries
5. If changes needed:
   - Vendor clicks "Edit Prices"
   - System navigates to Submit tab
   - Vendor makes corrections
   - Returns to Review tab
6. When satisfied, vendor clicks "Submit"
7. System displays final confirmation dialog
8. Vendor clicks "Confirm Submit"
9. System validates all data
10. System updates status: 'draft' → 'submitted'
11. System calculates quality score
12. System sends confirmation email
13. System displays success message
14. Portal changes to read-only mode

#### Alternative Flows

**A1: Return to Edit**
- At step 4, vendor identifies errors
- Vendor clicks "Edit Prices"
- Returns to Submit tab for corrections

#### Exception Flows

**E1: Incomplete Data on Submit**
- At step 9, validation fails due to missing required fields
- System displays error with missing items
- Vendor must complete missing data

#### Postconditions
**Success**:
- Pricelist status is 'submitted'
- Quality score calculated
- Confirmation sent
- Portal in read-only mode

#### Business Rules
- BR-VPP-Rule-037: All required fields must be completed before submission
- BR-VPP-Rule-038: Submission is final (but vendor can create new version in future campaigns)

---

### UC-VPP-011: View Submission History

#### Basic Information
- **Use Case ID**: UC-VPP-011
- **Use Case Name**: View Submission History
- **Priority**: Medium
- **Primary Actor**: Vendor
- **Secondary Actors**: System
- **Frequency**: As needed
- **Related Requirements**: BR-VPP-015

#### Description
Vendor views history of price submissions made through the portal.

#### Preconditions
1. Vendor has accessed portal via valid token (UC-VPP-006)

#### Main Flow
1. Vendor clicks "History" tab
2. System displays submission history list:
   - Current submission status
   - Submission date
   - Quality score
   - Number of items
3. For each submission, vendor can:
   - View details
   - Compare with previous versions

#### Alternative Flows

**A1: First-Time Vendor**
- At step 2, no history exists
- System displays "No previous submissions" message

#### Postconditions
**Success**:
- History displayed
- Vendor informed of past submissions

---

## 5. Use Case Relationships

### 5.1 Dependency Matrix

| Use Case | Depends On | Depended On By |
|----------|------------|----------------|
| UC-VPP-006 | Campaign launched (see requests-for-pricing) | UC-VPP-007, UC-VPP-008, UC-VPP-009, UC-VPP-010, UC-VPP-011 |
| UC-VPP-007 | UC-VPP-006 | UC-VPP-010 |
| UC-VPP-008 | UC-VPP-006, UC-VPP-009 (optional) | UC-VPP-010 |
| UC-VPP-009 | UC-VPP-006 | UC-VPP-008 |
| UC-VPP-010 | UC-VPP-007 or UC-VPP-008 | - |
| UC-VPP-011 | UC-VPP-006 | - |

### 5.2 Vendor Portal Workflow

```
1. Vendor receives invitation email (from requests-for-pricing module)
2. UC-VPP-006: Vendor clicks link, accesses portal via token
3. UC-VPP-009: (Optional) Download Excel template
4. UC-VPP-007 OR UC-VPP-008: Submit prices (online OR upload)
5. UC-VPP-010: Review and confirm submission
6. Pricelist becomes active immediately (stored in price-lists module)
7. UC-VPP-011: View submission history (optional)
```

**Note**: There is no approval workflow - pricelists become active immediately upon submission.

---

## 6. Appendices

### Appendix A: Related Module Documentation

| Module | Documentation Path | Related Use Cases |
|--------|-------------------|-------------------|
| Requests for Pricing | `../requests-for-pricing/` | Campaign creation, vendor invitation, campaign launch |
| Pricelist Templates | `../pricelist-templates/` | Template creation and management |
| Price Lists | `../price-lists/` | Staff viewing of submitted pricelists |
| Vendor Directory | `../vendor-directory/` | Vendor profiles and master data |

### Appendix B: Source Code References

| Source File | Key Features Validated |
|-------------|------------------------|
| `/app/(main)/vendor-management/vendor-portal/sample/page.tsx` | UC-VPP-006, UC-VPP-007, UC-VPP-008, UC-VPP-009 |
| `/app/(main)/vendor-management/templates/components/MOQPricingComponent.tsx` | UC-VPP-007 (MOQ tier pricing) |

### Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Token** | Unique UUID identifier providing vendor portal access |
| **MOQ** | Minimum Order Quantity |
| **MOQ Tier** | Price tier based on order quantity (up to 5 tiers) |
| **FOC** | Free of Charge promotional quantity |
| **Open-Ended Pricelist** | Pricelist with null end date, valid until superseded |
| **Quality Score** | Calculated score (0-100) based on completeness, accuracy, detail |
| **Auto-Save** | System saves vendor draft every 2 minutes |

---

**Document End**

**Implementation Notes**:
- This document covers ONLY vendor-facing portal use cases
- Staff-side use cases (campaign, template management) are in separate modules
- No approval workflow - pricelists become active immediately upon submission
- Token is the only authentication method for vendors
