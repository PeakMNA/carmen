# Use Cases: Certifications

## Module Information
- **Module**: System Administration
- **Sub-Module**: Certifications
- **Route**: `/system-administration/certifications`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17
- **Owner**: System Administration Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-17 | Documentation Team | Initial version |

---

## Overview

This document describes the use cases for the Certifications module, which manages certification types and their assignment to vendors and products.

**Related Documents**:
- [Business Requirements](./BR-certifications.md)
- [Data Dictionary](./DD-certifications.md)
- [Technical Specification](./TS-certifications.md)
- [Flow Diagrams](./FD-certifications.md)
- [Validation Rules](./VAL-certifications.md)

---

## Actors

### Primary Actors

| Actor | Description | Typical Tasks |
|-------|-------------|---------------|
| **Quality Assurance Manager** | Manages quality standards | Creates/edits certification types |
| **Purchasing Manager** | Oversees vendor relationships | Assigns certifications to vendors |
| **Product Manager** | Manages product catalog | Assigns certifications to products |

---

## Use Case Summary

| ID | Use Case | Actor | Priority |
|----|----------|-------|----------|
| UC-CERT-001 | View Certification List | All Actors | High |
| UC-CERT-002 | Create Certification | QA Manager | High |
| UC-CERT-003 | Edit Certification | QA Manager | High |
| UC-CERT-004 | Delete Certification | QA Manager | Medium |
| UC-CERT-005 | Assign Certification to Vendor | Purchasing Manager | High |
| UC-CERT-006 | Remove Certification from Vendor | Purchasing Manager | Medium |
| UC-CERT-007 | Assign Certification to Product | Product Manager | High |
| UC-CERT-008 | Remove Certification from Product | Product Manager | Medium |

---

## Use Case Specifications

### UC-CERT-001: View Certification List

**Use Case ID**: UC-CERT-001
**Use Case Name**: View Certification List
**Actor**: All Actors
**Priority**: High
**Status**: Implemented

#### Description
User views the list of all configured certification types.

#### Preconditions
1. User has access to System Administration module
2. User navigates to `/system-administration/certifications`

#### Main Flow
1. System fetches all certifications from database
2. System displays certifications in table format
3. Table shows columns: Name, Description
4. Each row has Edit link and Delete button
5. Mobile view displays as stacked cards

#### Postconditions
- Certification list displayed to user

---

### UC-CERT-002: Create Certification

**Use Case ID**: UC-CERT-002
**Use Case Name**: Create Certification
**Actor**: Quality Assurance Manager
**Priority**: High
**Status**: Implemented

#### Description
User creates a new certification type.

#### Preconditions
1. User has permission to create certifications
2. User is on certification list page

#### Main Flow
1. User clicks "Create Certification" button
2. System navigates to `/system-administration/certifications/create`
3. System displays form with fields: Name, Description, Icon URL
4. User enters Name (required)
5. User optionally enters Description
6. User optionally enters Icon URL
7. User clicks "Create Certification" button
8. System validates form (name required)
9. System calls createCertification server action
10. System revalidates certification list path
11. System redirects to certification list

#### Alternative Flow - Validation Failure
8a. Name field is empty
8b. Zod validation fails
8c. Form does not submit

#### Postconditions
- New certification added to database
- User redirected to certification list

---

### UC-CERT-003: Edit Certification

**Use Case ID**: UC-CERT-003
**Use Case Name**: Edit Certification
**Actor**: Quality Assurance Manager
**Priority**: High
**Status**: Implemented

#### Description
User modifies an existing certification.

#### Preconditions
1. Certification exists in system
2. User is on certification list page

#### Main Flow
1. User clicks "Edit" link on certification row
2. System navigates to `/system-administration/certifications/[id]/edit`
3. System fetches certification by ID
4. System displays form with current values
5. Form shows: Name, Description, Issuer, Validity Period, Required Documents
6. User modifies desired fields
7. User clicks "Update Certification" button
8. System calls updateCertification server action
9. System revalidates certification list path
10. System redirects to certification list

#### Alternative Flow - Certification Not Found
3a. System cannot find certification by ID
3b. System displays "Certification not found." message

#### Postconditions
- Certification updated in database
- User redirected to certification list

---

### UC-CERT-004: Delete Certification

**Use Case ID**: UC-CERT-004
**Use Case Name**: Delete Certification
**Actor**: Quality Assurance Manager
**Priority**: Medium
**Status**: Implemented

#### Description
User removes a certification type from the system.

#### Preconditions
1. Certification exists in system
2. User is on certification list page

#### Main Flow
1. User clicks "Delete" button on certification row
2. System submits form with deleteCertification action
3. System calls deleteCertification server action
4. System revalidates certification list path
5. Page refreshes showing updated list

#### Postconditions
- Certification removed from database
- Certification no longer appears in list

---

### UC-CERT-005: Assign Certification to Vendor

**Use Case ID**: UC-CERT-005
**Use Case Name**: Assign Certification to Vendor
**Actor**: Purchasing Manager
**Priority**: High
**Status**: Implemented

#### Description
User assigns a certification to a vendor with tracking details.

#### Preconditions
1. Certification exists in system
2. Vendor exists in system
3. User is on vendor detail page

#### Main Flow
1. User selects certification to add
2. User enters Certificate Number (optional)
3. User enters Issue Date (optional)
4. User enters Expiry Date (optional)
5. User enters Document URL (optional)
6. User submits form
7. System calls addCertificationToVendor server action
8. System revalidates vendor page path

#### Postconditions
- Certification assigned to vendor
- Vendor certifications list updated

---

### UC-CERT-006: Remove Certification from Vendor

**Use Case ID**: UC-CERT-006
**Use Case Name**: Remove Certification from Vendor
**Actor**: Purchasing Manager
**Priority**: Medium
**Status**: Implemented

#### Description
User removes a certification assignment from a vendor.

#### Preconditions
1. Certification is assigned to vendor
2. User is on vendor detail page

#### Main Flow
1. User clicks remove certification
2. System calls removeCertificationFromVendor server action
3. System revalidates vendor page path

#### Postconditions
- Certification removed from vendor
- Vendor certifications list updated

---

### UC-CERT-007: Assign Certification to Product

**Use Case ID**: UC-CERT-007
**Use Case Name**: Assign Certification to Product
**Actor**: Product Manager
**Priority**: High
**Status**: Implemented

#### Description
User assigns a certification to a product with tracking details.

#### Preconditions
1. Certification exists in system
2. Product exists in system
3. User is on product detail page

#### Main Flow
1. User selects certification to add
2. User enters Certificate Number (optional)
3. User enters Issue Date (optional)
4. User enters Expiry Date (optional)
5. User enters Document URL (optional)
6. User submits form
7. System calls addCertificationToProduct server action
8. System revalidates product page path

#### Postconditions
- Certification assigned to product
- Product certifications list updated

---

### UC-CERT-008: Remove Certification from Product

**Use Case ID**: UC-CERT-008
**Use Case Name**: Remove Certification from Product
**Actor**: Product Manager
**Priority**: Medium
**Status**: Implemented

#### Description
User removes a certification assignment from a product.

#### Preconditions
1. Certification is assigned to product
2. User is on product detail page

#### Main Flow
1. User clicks remove certification
2. System calls removeCertificationFromProduct server action
3. System revalidates product page path

#### Postconditions
- Certification removed from product
- Product certifications list updated

---

## User Journey Diagram

```
                    Certifications User Journey
                    ===========================

    [Navigate to Certifications]
           |
           v
    +------------------+
    | View List        |<--------------------------------+
    +------------------+                                 |
           |                                             |
           +---> [Create] --> Create Page --> Save --+  |
           |                                          |  |
           +---> [Edit] ----> Edit Page ---> Save ---+--+
           |                                          |
           +---> [Delete] ----------------------------|
```

---

**Document End**
