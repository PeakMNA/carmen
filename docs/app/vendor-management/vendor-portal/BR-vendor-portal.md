# Vendor Price Submission Portal - Business Requirements (BR)

## Document Information
- **Document Type**: Business Requirements Document
- **Module**: Vendor Management > Vendor Price Submission Portal
- **Version**: 3.0.0
- **Last Updated**: 2026-01-15
- **Document Status**: Active
- **Based On**: Actual source code analysis

## Document History

| Version | Date       | Author | Changes                                    |
|---------|------------|--------|--------------------------------------------|
| 3.0.0   | 2026-01-15 | Documentation Team | Synced with current code; Updated supported currencies (BHT, USD, CNY, SGD); Updated sample products; Clarified sample implementation scope |
| 3.0.0   | 2025-11-26 | System | **MAJOR**: Refactored to vendor-facing portal only; Removed campaign, template, and pricelist management content (moved to respective modules) |
| 2.1.0   | 2025-11-26 | System | Removed fictional approval workflow; Updated status flow to draft to submitted |
| 2.0     | 2025-01-23 | System | Complete rewrite based on actual codebase  |
| 1.0     | 2024-01-15 | System | Initial draft (incorrect scope)            |

---

## 1. Executive Summary

### 1.1 Purpose
The Vendor Price Submission Portal is a **token-based web interface** that enables existing vendors to submit product pricing in response to Request for Pricing campaigns. This document covers ONLY the vendor-facing portal functionality.

### 1.2 Scope
**In Scope (This Document)**:
- Token-based portal access and authentication
- Online price entry interface
- Excel template upload functionality
- Excel template download functionality
- Draft saving and auto-save
- Price submission workflow (draft → submitted)
- Submission confirmation and tracking

**Out of Scope (See Related Modules)**:
- Campaign creation and management → See [requests-for-pricing](../requests-for-pricing/)
- Pricelist template creation → See [pricelist-templates](../pricelist-templates/)
- Pricelist storage and management → See [price-lists](../price-lists/)
- Vendor directory and profiles → See [vendor-directory](../vendor-directory/)
- Campaign analytics and reporting → See [requests-for-pricing](../requests-for-pricing/)

### 1.3 What This System Is NOT
This portal does **NOT** include:
- Vendor self-registration or onboarding
- Vendor profile management
- Campaign creation or management
- Template creation or management
- Pricelist viewing/editing by staff
- RFQ bidding or competitive quoting
- Purchase order or invoice management

### 1.4 Business Value
- **Vendor Convenience**: Simple, intuitive price submission without login credentials
- **Flexibility**: Three submission methods (online, Excel upload, Excel download)
- **Data Quality**: Structured templates with validation
- **Efficiency**: Auto-save prevents data loss

---

## 2. Business Context

### 2.1 Problem Statement
Vendors receiving price collection invitations need a simple, secure way to submit pricing information without:
- Creating user accounts
- Remembering login credentials
- Learning complex systems

### 2.2 Solution Approach
The Vendor Price Submission Portal provides:
1. **Token-Based Access**: Unique URL grants access without login
2. **Three Submission Methods**: Accommodate different vendor preferences
3. **Draft Management**: Save progress and return later
4. **Immediate Activation**: Submitted prices become active without approval workflow

### 2.3 Key Business Objectives
1. **Simplify Vendor Experience**: No registration or login required
2. **Reduce Technical Barriers**: Multiple submission methods
3. **Ensure Data Quality**: Structured templates with validation
4. **Enable Flexibility**: Open-ended or fixed-term pricing

---

## 3. Stakeholders

### 3.1 Primary Stakeholder: Vendors (External)
- **Role**: Submit product pricing in response to campaign invitations
- **Needs**:
  - Simple, intuitive submission interface
  - Flexibility in submission method (online, Excel upload, Excel download)
  - Clear instructions and product specifications
  - Ability to save draft and return later
  - Progress tracking showing completion percentage
  - Confirmation of successful submission
- **Pain Points**: Complex submission processes, unclear requirements, technical barriers
- **Success Criteria**: Complete submission in <30 minutes, <5% error rate

### 3.2 Secondary Stakeholder: Procurement Staff (Internal)
- **Role**: Receive vendor submissions
- **Involvement**: View submissions via [price-lists](../price-lists/) module

---

## 4. Functional Requirements

### 4.1 Token-Based Portal Access

#### BR-VPP-010: Token-Based Portal Access
**Priority**: Critical
**Requirement**: Vendors must be able to access the portal via unique token URL without traditional authentication.

**Details**:
- Access flow:
  - Vendor receives invitation email with unique URL
  - Vendor clicks URL containing campaign token
  - System validates token (exists, not expired, not cancelled)
  - System creates temporary portal session
  - Vendor redirected to campaign landing page
  - Session valid until campaign end date
- Token validation:
  - Token format: UUID (36 characters)
  - Token lookup by value in database
  - Check token not expired (campaign end date)
  - Check campaign status (active, not paused/cancelled)
  - Load vendor information from token association
- Session management:
  - Session cookie set with token value
  - Session timeout: none (valid until campaign end)
  - Multiple sessions allowed (different devices)
  - Session revoked on token expiry or campaign cancellation
- Portal landing page:
  - Campaign name and description
  - Campaign deadline prominently displayed
  - Instructions from procurement staff
  - Currency selection (supported: BHT, USD, CNY, SGD)
  - Effective date range for pricing
  - Progress indicator (completion percentage)
  - Three submission method tabs
- No-login design:
  - No username/password required
  - No "create account" or "sign up"
  - Token is the only authentication credential
  - Vendor identified by token association
- Security measures:
  - HTTPS required for all portal access
  - Token not displayed in UI (only in URL)
  - IP address and user agent logged

**Acceptance Criteria**:
- Vendors can access portal via token URL
- Token validation prevents unauthorized access
- Invalid/expired tokens show error message
- Portal landing page displays campaign information
- Session persists until campaign end
- Multiple devices/sessions supported

---

### 4.2 Online Price Entry

#### BR-VPP-011: Online Price Entry
**Priority**: Critical
**Requirement**: Vendors must be able to submit prices directly in the portal using an online form.

**Details**:
- Entry interface:
  - Product table with all template products
  - Each row = one product instance (product + unit)
  - Columns: Product Code, Product Name, Unit, Base Price, MOQ Tiers, Lead Time, FOC
  - Inline editing (click cell to edit)
  - Real-time validation
  - Progress indicator (X of Y products completed)
- Pricing fields:
  - Base price (required): Single-tier price
  - Unit (required): Order unit (pre-filled from template)
  - MOQ Tier 1-5 (optional): Multi-tier pricing
    - MOQ (minimum order quantity)
    - Unit price for this tier
    - Lead time for this tier (days)
  - Lead time (required if template requires): Days to deliver
  - FOC quantity (optional): Free-of-charge quantity with purchase
  - FOC unit (optional): Unit for FOC
  - Notes (optional): Additional comments
- MOQ tier pricing:
  - Up to 5 tiers per product
  - Each tier: MOQ, unit price, lead time
  - Tiers displayed progressively (add tier button)
  - Validation: ascending MOQ, positive prices
- Save draft:
  - Auto-save every 2 minutes
  - Manual save button
  - Progress persisted in database
  - Resume from saved state on return
  - Draft not visible to procurement staff until submitted
- Submit:
  - Validate all required fields completed
  - Validate MOQ tier ordering
  - Validate price formats and ranges
  - Display validation errors clearly
  - Submit button (requires confirmation)
  - Create pricelist record in database
  - Pricelist status: submitted (active immediately)
  - Display confirmation message
  - Send confirmation email to vendor

**Acceptance Criteria**:
- Vendors can enter prices online
- All pricing fields editable and validated
- MOQ tiers (1-5) supported per product
- FOC quantity and unit captured
- Draft saves automatically every 2 minutes
- Validation errors displayed clearly
- Submission creates pricelist record with status "submitted"
- Confirmation shown and emailed

---

### 4.3 Excel Template Upload

#### BR-VPP-012: Excel Template Upload
**Priority**: High
**Requirement**: Vendors must be able to upload completed Excel files with pricing data.

**Details**:
- Upload process:
  - Vendor clicks "Excel Upload" tab
  - Upload button displays file picker
  - Vendor selects .xlsx or .csv file
  - System validates file format
  - System parses file contents
  - System validates data against template
  - System displays parsed data for review
  - Vendor confirms and submits
- File format support:
  - .xlsx (Excel 2007+): Primary format
  - .csv (Comma-separated values): Alternative format
  - Maximum file size: 10MB
  - Maximum rows: 10,000 products
- File validation:
  - Required columns present
  - Column headers match expected format
  - Product codes match template products
  - Price data in correct columns
  - Data types correct
  - Required fields not blank
- Data parsing:
  - Read Excel sheets (Pricing sheet primary)
  - Extract product rows
  - Map columns to database fields
  - Parse MOQ tiers
  - Detect data format issues
- Error reporting:
  - Display error summary (X errors found)
  - Highlight error rows in red
  - Show specific error message per row
  - Allow partial import (skip invalid rows)
  - Allow re-upload after corrections
  - Download error report as Excel file
- Review interface:
  - Display parsed products in table
  - Show all pricing data
  - Highlight changed prices (vs. previous submission)
  - Allow inline corrections before submit
  - Show validation status per product
  - Submit button enabled only if valid

**Acceptance Criteria**:
- Vendors can upload .xlsx and .csv files
- File format validated before parsing
- Excel data parsed correctly
- All products and pricing fields extracted
- Validation errors displayed with specific messages
- Error report downloadable
- Parsed data reviewable before submit
- Submission creates pricelist from Excel data

---

### 4.4 Excel Template Download

#### BR-VPP-013: Excel Template Download
**Priority**: High
**Requirement**: Vendors must be able to download pre-filled Excel templates for offline price entry.

**Details**:
- Download process:
  - Vendor clicks "Download Template" tab
  - Download button generates Excel file
  - System creates Excel template with campaign products
  - Excel file downloads to vendor's device
  - Vendor fills prices offline
  - Vendor uploads completed file (see BR-VPP-012)
- Excel template structure:
  - **Pricing Sheet** (primary):
    - Column headers: Product Code, Product Name, Unit, Base Price, MOQ Tier 1-5, Lead Time, FOC Qty, FOC Unit, Notes
    - Product rows pre-filled with product information
    - Price columns empty for vendor input
    - Data validation rules applied
    - Column protection (product code, name locked)
  - **Instructions Sheet**:
    - Campaign name and description
    - Deadline and submission instructions
    - Pricing guidelines and requirements
    - MOQ tier explanation with examples
    - FOC explanation
    - Contact information
    - File upload instructions
  - **Product Reference Sheet**:
    - Full product specifications
    - Product category hierarchy
    - Unit of measure definitions
- Data validation:
  - Unit column: Dropdown with allowed units
  - Price columns: Numeric, positive values only
  - MOQ columns: Numeric, positive integers
  - Lead time: Numeric, positive integers (days)
  - FOC quantity: Numeric, positive values
- File generation:
  - Generated on-demand per vendor request
  - Includes only products in template
  - Unique filename: `{CampaignName}_{VendorName}_{Date}.xlsx`
  - Download triggered in browser

**Acceptance Criteria**:
- Vendors can download Excel template
- Template pre-filled with product information
- Price columns empty for vendor input
- Data validation rules applied
- Product code and name columns locked
- Instructions sheet included
- File downloads with unique name

---

### 4.5 Submission Confirmation & Tracking

#### BR-VPP-014: Submission Confirmation & Tracking
**Priority**: Medium
**Requirement**: Vendors must receive confirmation of successful submission and be able to track submission status.

**Details**:
- Submission confirmation:
  - Display success message: "Pricelist submitted successfully!"
  - Show submission timestamp and confirmation number
  - Display submission summary (X products, total value)
  - Provide next steps information
  - Disable editing of submitted pricelist
  - Send confirmation email to vendor
- Confirmation email content:
  - Subject: "Price Submission Confirmed - {Campaign Name}"
  - Confirmation number and timestamp
  - Campaign name and deadline
  - Number of products submitted
  - Submission method (online, Excel upload, Excel download)
  - Next steps: "Your prices are now active in the system"
  - Contact information for questions
- Submission tracking:
  - Display current status (Draft, Submitted)
  - Show submitted date and time
  - Show last updated timestamp
  - Track version number (if resubmitted)
- Status types:
  - **Draft**: Saved but not submitted (vendor can edit)
  - **Submitted**: Submitted by vendor, prices active immediately
  - **Expired**: Campaign ended before submission
- Portal access after submission:
  - Vendor can return to portal using same token
  - View-only access to submitted pricelist
  - Cannot edit submitted pricelist
  - Download submitted pricelist as PDF or Excel

> **Note**: There is no approval workflow. Submitted pricelists become active immediately.

**Acceptance Criteria**:
- Success message displayed after submission
- Confirmation email sent immediately
- Submission status visible in portal
- View-only access to submitted pricelist
- Download submitted pricelist as PDF/Excel

---

### 4.6 Pricelist Versioning

#### BR-VPP-015: Pricelist Versioning
**Priority**: Medium
**Requirement**: System must support pricelist versioning when vendors submit updated pricing.

**Details**:
- Version tracking:
  - Each submission is a separate version
  - Version number incremented (v1, v2, v3)
  - All versions retained in database
  - Latest version is active
  - Staff can view version history
  - Compare versions (price changes highlighted)
- Update process:
  - Vendor clicks token URL (same as original)
  - If previous submission exists, display as reference
  - Vendor enters new pricing
  - System creates new version on submit
  - Previous version retained for audit

**Acceptance Criteria**:
- Multiple submissions create new versions
- Version number incremented on each submission
- All versions retained and comparable
- Previous submission data available as reference

---

### 4.7 Open-Ended Pricelist Support

#### BR-VPP-016: Open-Ended Pricelist Support
**Priority**: Medium
**Requirement**: System must support open-ended pricelists (no end date) for long-term vendor agreements.

**Details**:
- Open-ended concept:
  - Effective start date required
  - Effective end date optional (null = open-ended)
  - Pricelist remains active indefinitely until:
    - Vendor submits new pricelist (supersedes previous)
    - Procurement staff deactivates pricelist
    - Campaign end date passes (if not open-ended)
- Vendor portal display:
  - Effective end date field optional
  - Vendor can choose "No expiry (open-ended)"
  - Visual indicator (infinity symbol or "No End Date")

**Acceptance Criteria**:
- Pricelists can have null end date (open-ended)
- Open-ended pricelists displayed with clear indicator
- New submission supersedes previous open-ended pricelist

---

## 5. Business Rules

### 5.1 Portal Access Rules

#### BR-VPP-Rule-010: Token Expiry Enforcement
**Rule**: Tokens expire on campaign end date; expired tokens cannot access portal.
**Enforcement**: System-enforced. Token validation checks expiry timestamp.

#### BR-VPP-Rule-011: Token Vendor Association
**Rule**: Tokens can only access data for associated vendor; cannot view other vendors' data.
**Enforcement**: System-enforced. All queries filtered by vendor ID from token association.

#### BR-VPP-Rule-012: HTTPS Encryption Required
**Rule**: All portal access must use HTTPS; HTTP connections redirected to HTTPS.
**Enforcement**: Infrastructure-enforced.

#### BR-VPP-Rule-013: Session Security Logging
**Rule**: All portal access logged with IP address, user agent, and timestamp.
**Enforcement**: System-automated. Middleware logs all requests.

### 5.2 Submission Rules

#### BR-VPP-Rule-020: Submission Deadline Enforcement
**Rule**: Vendors cannot submit prices after campaign end date; portal displays "Campaign Ended" message.
**Enforcement**: System-enforced. Submission form disabled after end date.

#### BR-VPP-Rule-021: MOQ Tier Ascending Order
**Rule**: MOQ tiers must have ascending minimum order quantities (Tier 1 < Tier 2 < Tier 3...).
**Enforcement**: System-enforced. Validation error if tiers not in ascending order.

#### BR-VPP-Rule-022: Required Pricing Fields
**Rule**: Base price and unit are required for each product; MOQ tiers are optional.
**Enforcement**: System-enforced. Validation prevents submission without base price and unit.

#### BR-VPP-Rule-023: Excel File Size Limit
**Rule**: Excel file uploads limited to 10MB; files exceeding limit rejected.
**Enforcement**: System-enforced. File size checked before parsing.

#### BR-VPP-Rule-024: Draft Auto-Save Interval
**Rule**: Online price entry drafts auto-save every 2 minutes; manual save also available.
**Enforcement**: System-automated.

#### BR-VPP-Rule-025: Submission Locks Pricelist
**Rule**: Once pricelist submitted, it cannot be edited by vendor. Vendor can submit new version.
**Enforcement**: System-enforced. Status change to "Submitted" locks record from editing.

#### BR-VPP-Rule-026: Price Activation on Submission
**Rule**: Submitted pricelists become active immediately; prices available for procurement use.
**Enforcement**: System-automated. Submission action sets active flag.

> **Note**: There is no approval workflow. Pricelists go directly from draft → submitted (active).

### 5.3 Data Quality Rules

#### BR-VPP-Rule-030: Price Format Validation
**Rule**: Prices must be positive numbers with maximum 2 decimal places.
**Enforcement**: System-enforced.

#### BR-VPP-Rule-031: Lead Time Range Validation
**Rule**: Lead times must be positive integers between 1-365 days.
**Enforcement**: System-enforced.

---

## 6. Non-Functional Requirements

### 6.1 Performance

**PR-VPP-NFR-001: Portal Page Load Time**
- **Requirement**: Portal landing page loads within 2 seconds
- **Threshold**: 95% of page loads < 2 seconds

**PR-VPP-NFR-002: Excel Template Generation**
- **Requirement**: Excel templates generate and download within 5 seconds
- **Threshold**: 100% of downloads < 5 seconds for up to 1,000 products

**PR-VPP-NFR-003: Excel File Upload Parsing**
- **Requirement**: Excel files parse and validate within 10 seconds
- **Threshold**: 95% of uploads < 10 seconds for up to 1,000 products

**PR-VPP-NFR-004: Pricelist Submission**
- **Requirement**: Online submissions process within 3 seconds
- **Threshold**: 95% of submissions < 3 seconds

### 6.2 Availability

**PR-VPP-NFR-005: System Uptime**
- **Requirement**: 99.5% uptime during business hours
- **Threshold**: Maximum 3.65 hours downtime per month

### 6.3 Security

**PR-VPP-NFR-006: Data Encryption**
- **Requirement**: All data encrypted in transit (TLS 1.3) and at rest (AES-256)

**PR-VPP-NFR-007: Token Security**
- **Requirement**: Tokens must be cryptographically random (UUID v4)

**PR-VPP-NFR-008: Audit Logging**
- **Requirement**: All vendor actions logged with timestamp, IP address, user agent

### 6.4 Usability

**PR-VPP-NFR-009: Mobile Responsiveness**
- **Requirement**: Portal accessible and usable on mobile devices

**PR-VPP-NFR-010: Browser Compatibility**
- **Requirement**: Support modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)

**PR-VPP-NFR-011: Accessibility**
- **Requirement**: WCAG 2.1 AA compliance

**PR-VPP-NFR-012: Error Messages**
- **Requirement**: Clear, actionable error messages for validation failures

---

## 7. Integration Points

### 7.1 Upstream Dependencies
- **Campaign Module**: Provides campaign context and token validation → See [requests-for-pricing](../requests-for-pricing/)
- **Template Module**: Provides product list and validation rules → See [pricelist-templates](../pricelist-templates/)
- **Vendor Directory**: Provides vendor identification → See [vendor-directory](../vendor-directory/)

### 7.2 Downstream Integrations
- **Pricelist Module**: Stores submitted pricelists → See [price-lists](../price-lists/)
- **Email Service**: Sends confirmation emails

---

## 8. Glossary

- **Campaign**: Request for Pricing campaign (managed in requests-for-pricing module)
- **Effective Date**: Start and end dates when pricing is valid; null end date = open-ended
- **FOC (Free of Charge)**: Promotional items provided free with purchase
- **MOQ (Minimum Order Quantity)**: Smallest quantity vendor will sell; multi-tier MOQ offers volume discounts
- **Open-Ended Pricelist**: Pricelist with no end date, remains active until superseded
- **Pricelist**: Collection of product prices submitted by vendor
- **Template**: Reusable product selection (managed in pricelist-templates module)
- **Token**: Unique URL parameter granting vendor access to portal

---

## 9. Related Documents

### Within This Module
- [Technical Specification](./TS-vendor-portal.md)
- [Data Dictionary](./DD-vendor-portal.md)
- [Use Cases](./UC-vendor-portal.md)
- [Flow Diagrams](./FD-vendor-portal.md)
- [Validations](./VAL-vendor-portal.md)

### Related Modules
- [Requests for Pricing (Campaigns)](../requests-for-pricing/) - Campaign management
- [Pricelist Templates](../pricelist-templates/) - Template management
- [Price Lists](../price-lists/) - Pricelist storage and viewing
- [Vendor Directory](../vendor-directory/) - Vendor profiles

---

## Appendix A: Source Code References

| Source File | Lines | Key Features |
|-------------|-------|--------------|
| `/app/(main)/vendor-management/vendor-portal/sample/page.tsx` | 566 | Vendor portal sample UI, three submission methods (online, upload, email) |
| `/app/(main)/vendor-management/templates/components/MOQPricingComponent.tsx` | 430 | MOQ tier pricing component |

### Key Implementation Details from Source Code

**ProductItem Interface**:
```typescript
interface ProductItem {
  code: string
  description: string
  unit: string
  basePrice?: number
  leadTime?: number
  moqTiers?: Array<{
    moq: number
    price: number
    leadTime: number
  }>
}
```

**Supported Currencies**: BHT (Thai Baht), USD (US Dollar), CNY (Chinese Yuan), SGD (Singapore Dollar)

**Submission Methods**: `'online' | 'upload' | 'email'`

**Sample Product Categories**:
- Electronics (ELEC-001 to ELEC-008): USB cables, HDMI cables, network cables, power cables
- Power (PWR-001 to PWR-005): Laptop chargers, USB chargers, power banks
- Accessories (ACC-001 to ACC-007): Wireless mouse, USB hub, webcam, keyboard, etc.

---

**End of Business Requirements Document**
