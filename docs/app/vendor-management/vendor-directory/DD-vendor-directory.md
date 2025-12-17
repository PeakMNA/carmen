# Data Definition: Vendor Directory

## Module Information
- **Module**: Vendor Management
- **Sub-module**: Vendor Directory
- **Version**: 2.2.0
- **Status**: Active
- **Last Updated**: 2025-11-25

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.2.0 | 2025-11-25 | System | Updated address format to Asian international standard; Full certification management with status tracking implemented |
| 2.1.0 | 2025-11-25 | System | Added multi-address and multi-contact management with primary designation |
| 2.0.0 | 2025-11-25 | System | Updated to match actual code implementation |
| 1.0.0 | 2025-11-15 | Documentation Team | Initial DD document created from schema.prisma |

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**

This document describes data structures, entities, relationships, and constraints in TEXT FORMAT.
It does NOT contain executable SQL code, database scripts, or implementation code.
For database implementation details, refer to the Technical Specification document.

**⚠️ SCHEMA COVERAGE**: 70% - Partial coverage from `data-struc/schema.prisma`

**Existing Tables** (4): `tb_vendor`, `tb_vendor_contact`, `tb_vendor_address`, `tb_vendor_business_type`
**Implemented in Frontend** (1): Certifications - Full CRUD with status tracking
**Missing Tables** (2): Documents, Ratings - **Require Backend Implementation**

---

## Overview

The Vendor Directory module manages comprehensive vendor information including company profiles, contacts, addresses, business classifications, certifications, documents, and performance ratings. This serves as the central repository for all vendor-related data used across procurement, purchasing, and finance processes.

### Key Features
- Vendor profile management
- Multiple contact persons per vendor with primary designation
- Multiple addresses with Asian international format and primary designation
- Business type classification (12 types)
- Tax profile integration
- **Full certification management (✅ implemented)** - CRUD operations, 16 certification types, auto-status calculation
- Document management (⚠️ needs backend implementation)
- Performance ratings (⚠️ needs backend implementation)
- Vendor activation/deactivation
- Multi-dimensional attributes
- 15 countries support

---

## Entity Relationship Overview

```
tb_vendor_business_type (1) ──── (N) tb_vendor
tb_vendor (1) ──── (N) tb_vendor_contact
tb_vendor (1) ──── (N) tb_vendor_address
tb_vendor (1) ──── (N) tb_pricelist
tb_vendor (1) ──── (N) tb_purchase_order
tb_vendor (1) ──── (N) tb_good_received_note
tb_vendor (1) ──── (N) tb_vendor_certification    [IMPLEMENTED - Frontend]
tb_vendor (1) ──── (N) tb_vendor_document        [PROPOSED]
tb_vendor (1) ──── (N) tb_vendor_rating          [PROPOSED]
```

---

## Core Entities (Existing in Schema)

### 1. Vendor Master (tb_vendor)

**Source**: `schema.prisma` lines 1859-1895

**Purpose**: Central vendor profile containing company information, business classification, and tax details.

**Table Name**: `tb_vendor`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | VARCHAR | UNIQUE, NOT NULL | Vendor company name |
| `description` | VARCHAR | | Company description |
| `note` | VARCHAR | | Internal notes |
| `business_type_id` | UUID | FOREIGN KEY → tb_vendor_business_type.id | Business classification |
| `business_type_name` | VARCHAR | DENORMALIZED | Business type name |
| `tax_profile_id` | UUID | | Tax profile reference |
| `tax_profile_name` | VARCHAR | DENORMALIZED | Tax profile name |
| `tax_rate` | DECIMAL(15,5) | | Default tax rate |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status flag |
| `info` | JSON | | Additional metadata (certifications, ratings, portal access) |
| `dimension` | JSON | | Multi-dimensional attributes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created the record |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Relationships
- **tb_vendor_business_type**: Many-to-One (vendor belongs to business type)
- **tb_vendor_contact**: One-to-Many (vendor has multiple contacts)
- **tb_vendor_address**: One-to-Many (vendor has multiple addresses)
- **tb_pricelist**: One-to-Many (vendor submits multiple price lists)
- **tb_purchase_order**: One-to-Many (vendor receives multiple POs)
- **tb_good_received_note**: One-to-Many (vendor deliveries tracked via GRN)

#### Business Rules
1. **Uniqueness**: Vendor `name` must be unique across all vendors
2. **Active Status**: Only active vendors appear in selection lists
3. **Tax Information**: If `tax_profile_id` is null, use system default
4. **Denormalization**: Business type and tax profile names cached for performance

#### Indexes
```
INDEX vendor_name_u ON tb_vendor(name)
```

#### JSON Field Structures

**info field** - Extended vendor information:
```json
{
  "company_info": {
    "registration_number": "REG-123456",
    "vat_number": "VAT-GB123456789",
    "duns_number": "123456789",
    "website": "https://vendor.com",
    "established_year": 2010,
    "employee_count": 150,
    "annual_revenue": 5000000
  },
  "payment_terms": {
    "default_terms": "NET30",
    "discount_terms": "2/10 NET30",
    "currency_preference": "USD",
    "payment_methods": ['bank_transfer', 'check', 'credit_card']
  },
  "delivery_info": {
    "lead_time_days": 7,
    "minimum_order_value": 500,
    "free_shipping_threshold": 2000,
    "delivery_days": [1, 2, 3, 4, 5]
  },
  "portal_access": {
    "enabled": true,
    "username": "vendor@company.com",
    "last_login": "2025-01-15T10:30:00Z",
    "features": ['view_po', 'submit_invoice', 'update_pricelist']
  },
  "certifications_summary": {
    "total": 5,
    "active": 4,
    "expiring_soon": 1
  },
  "rating_summary": {
    "average_score": 4.5,
    "total_ratings": 25,
    "last_rating_date": "2025-01-10"
  }
}
```

**dimension field** - Multi-dimensional attributes:
```json
{
  "department_ids": ['uuid1', 'uuid2'],
  "location_ids": ['uuid3', 'uuid4'],
  "cost_center_ids": ['uuid5'],
  "procurement_category": "food-beverage",
  "vendor_tier": "platinum",
  "geographic_region": "north-america"
}
```

---

### 2. Vendor Contacts (tb_vendor_contact)

**Source**: `schema.prisma` lines 1921-1942

**Purpose**: Stores contact persons for vendors with their roles and contact information.

**Table Name**: `tb_vendor_contact`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `vendor_id` | UUID | FOREIGN KEY → tb_vendor.id | Parent vendor |
| `contact_type` | ENUM | NOT NULL | Contact role/type |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active contact flag |
| `description` | VARCHAR | | Contact description |
| `note` | VARCHAR | | Internal notes |
| `info` | JSON | | Contact details (name, email, phone, position) |
| `dimension` | JSON | | Multi-dimensional attributes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Enums

**enum_vendor_contact_type**:
- `primary`: Primary contact person
- `accounting`: Accounts payable/receivable
- `sales`: Sales representative
- `technical`: Technical support
- `logistics`: Shipping/delivery coordinator
- `quality`: Quality assurance contact

#### Relationships
- **tb_vendor**: Many-to-One (contacts belong to one vendor)

#### Business Rules
1. **Primary Contact**: Each vendor should have at least one primary contact
2. **Contact Uniqueness**: Same email should not appear twice for same vendor
3. **Active Contacts**: Only active contacts used for notifications

#### Indexes
```
INDEX vendorcontact_vendor_contact_type_idx
  ON tb_vendor_contact(vendor_id, contact_type)
```

#### JSON Field Structures

**info field** - Contact details:
```json
{
  "name": {
    "first": "John",
    "last": "Smith",
    "title": "Mr.",
    "full": "Mr. John Smith"
  },
  "email": {
    "primary": "john.smith@vendor.com",
    "alternative": "j.smith@vendor.com"
  },
  "phone": {
    "office": "+1-555-0100",
    "mobile": "+1-555-0101",
    "extension": "1234"
  },
  "position": {
    "title": "Sales Manager",
    "department": "Sales",
    "seniority": "manager"
  },
  "preferences": {
    "preferred_contact_method": "email",
    "notification_enabled": true,
    "language": "en"
  }
}
```

---

### 3. Vendor Addresses (tb_vendor_address)

**Source**: `schema.prisma` lines 1897-1919

**Purpose**: Stores multiple addresses for vendors (billing, shipping, etc.).

**Table Name**: `tb_vendor_address`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `vendor_id` | UUID | FOREIGN KEY → tb_vendor.id | Parent vendor |
| `address_type` | ENUM | | Address classification |
| `data` | JSON | | Complete address details |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active address flag |
| `description` | VARCHAR | | Address description |
| `note` | VARCHAR | | Internal notes |
| `info` | JSON | | Additional metadata |
| `dimension` | JSON | | Multi-dimensional attributes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Enums

**enum_vendor_address_type**:
- `billing`: Billing/invoice address
- `shipping`: Goods receipt address
- `registered`: Registered office address
- `warehouse`: Vendor warehouse location
- `other`: Other address types

#### Relationships
- **tb_vendor**: Many-to-One (addresses belong to one vendor)

#### Business Rules
1. **Primary Address**: Each vendor should have at least one billing address
2. **Default Address**: One address per type should be marked as default
3. **Validation**: Address data must include required fields (see JSON structure)

#### Indexes
```
INDEX vendoraddress_vendor_address_type_idx
  ON tb_vendor_address(vendor_id, address_type)
```

#### JSON Field Structures

**data field** - Complete address (Asian International Format):
```json
{
  "label": "Main Office",
  "addressLine1": "123 Sukhumvit Road",
  "addressLine2": "Building A, Floor 5",
  "subDistrict": "Khlong Toei Nuea",
  "district": "Watthana",
  "city": "Bangkok",
  "province": "Bangkok",
  "postalCode": "10110",
  "country": "Thailand",
  "isPrimary": true
}
```

**Supported Countries** (15):
- Thailand, Singapore, Malaysia, Indonesia, Vietnam
- Philippines, Myanmar, Cambodia, Laos, Brunei
- China, Japan, South Korea, India, United States

**info field** - Address metadata:
```json
{
  "delivery_instructions": "Use loading dock B",
  "access_hours": {
    "monday_friday": "08:00-17:00",
    "saturday": "09:00-13:00",
    "sunday": "closed"
  },
  "contact_person": "John Doe",
  "contact_phone": "+1-555-0200",
  "verified": true,
  "verified_date": "2025-01-01"
}
```

---

### 4. Vendor Business Types (tb_vendor_business_type)

**Source**: `schema.prisma` lines 2664-2685

**Purpose**: Classification of vendors by business type (manufacturer, distributor, etc.).

**Table Name**: `tb_vendor_business_type`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | VARCHAR | UNIQUE, NOT NULL | Business type name |
| `description` | VARCHAR | | Business type description |
| `note` | VARCHAR | | Internal notes |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status flag |
| `info` | JSON | | Additional metadata |
| `dimension` | JSON | | Multi-dimensional attributes |
| `doc_version` | DECIMAL | DEFAULT 0 | Version for optimistic locking |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Relationships
- **tb_vendor**: One-to-Many (business type has multiple vendors)

#### Business Rules
1. **Uniqueness**: Business type `name` must be unique
2. **System Types**: Core business types should not be deleted

#### Indexes
```
INDEX vendor_business_type_name_u ON tb_vendor_business_type(name)
```

#### Standard Business Types
- Manufacturer
- Distributor
- Wholesaler
- Importer
- Service Provider
- Consultant
- Other

---

## Frontend-Implemented Entities

### 1. Vendor Certifications (IMPLEMENTED)

**Status**: ✅ IMPLEMENTED IN FRONTEND - Full CRUD with status tracking

**Purpose**: Track vendor certifications (ISO, HACCP, organic, Halal, etc.) with expiration dates and auto-calculated status.

**Frontend Interface**: `VendorCertification`

#### Implemented Fields

| Field Name | Data Type | Required | Description |
|-----------|-----------|----------|-------------|
| `id` | string | Auto | Unique identifier |
| `name` | string | Yes | Certification name |
| `certificationType` | string | Yes | Type from 16 predefined types |
| `issuer` | string | Yes | Issuing organization |
| `certificateNumber` | string | No | Certificate/registration number |
| `issueDate` | Date | Yes | Date issued |
| `expiryDate` | Date | Yes | Expiration date |
| `status` | CertificationStatus | Auto | Auto-calculated based on expiryDate |
| `documentUrl` | string | No | URL to certification document |
| `notes` | string | No | Additional notes |

#### Status Type

**CertificationStatus**: `'active' | 'expired' | 'expiring_soon' | 'pending'`

#### Available Certification Types (16)

| # | Type | Description |
|---|------|-------------|
| 1 | ISO 9001 | Quality Management |
| 2 | ISO 14001 | Environmental Management |
| 3 | ISO 22000 | Food Safety Management |
| 4 | ISO 45001 | Occupational Health & Safety |
| 5 | HACCP | Hazard Analysis Critical Control Points |
| 6 | GMP | Good Manufacturing Practice |
| 7 | Halal Certification | Islamic food certification |
| 8 | Kosher Certification | Jewish dietary certification |
| 9 | Organic Certification | Organic food certification |
| 10 | Fair Trade Certification | Ethical trade certification |
| 11 | FDA Approved | US Food & Drug Administration |
| 12 | CE Marking | European conformity |
| 13 | Business License | General business license |
| 14 | Trade License | Trade/commerce license |
| 15 | Import/Export License | International trade license |
| 16 | Other | Custom certification type |

#### Status Auto-Calculation Logic

The certification status is automatically calculated based on the expiry date:

| Status | Condition | Visual Indicator |
|--------|-----------|------------------|
| **Active** | Expiry date > 30 days in future | Green badge (`bg-green-100 text-green-800`) |
| **Expiring Soon** | Expiry date within 30 days | Yellow badge (`bg-yellow-100 text-yellow-800`) |
| **Expired** | Expiry date has passed | Red badge (`bg-red-100 text-red-800`) |
| **Pending** | Initial status for new certifications | Gray badge (`bg-gray-100 text-gray-800`) |

**Calculation Formula**:
```
daysUntilExpiry = (expiryDate - currentDate) / (1000 * 60 * 60 * 24)
if daysUntilExpiry < 0 → 'expired'
if daysUntilExpiry ≤ 30 → 'expiring_soon'
else → 'active'
```

#### Relationships
- **Vendor**: Many-to-One (certifications belong to one vendor)

#### Business Rules
1. **Required Fields**: Certification name, type, issuer, issue date, and expiry date are required
2. **Auto-Status**: Status recalculates on page load and when certification is edited
3. **30-Day Threshold**: Certifications expiring within 30 days are flagged as "Expiring Soon"
4. **CRUD Operations**: Full create, read, update, delete via dialog modal

#### UI Implementation
- **Create Page** (Tab 3 - Additional Info): List view with Add/Edit/Delete
- **Detail Page** (Certifications Tab): Grid display with CRUD operations
- **Toast Notifications**: Confirm all CRUD operations

---

## ⚠️ Missing Tables (Not in Schema.prisma)

### 1. Vendor Documents (PROPOSED)

**Status**: ❌ NOT IN SCHEMA - Requires Implementation

**Purpose**: Manage vendor-related documents (contracts, insurance, licenses, tax documents).

**Proposed Table Name**: `tb_vendor_document`

#### Proposed Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `vendor_id` | UUID | FOREIGN KEY → tb_vendor.id, NOT NULL | Parent vendor |
| `document_type` | VARCHAR | NOT NULL | Document category |
| `document_name` | VARCHAR | NOT NULL | Document title |
| `document_number` | VARCHAR | | Reference number |
| `document_date` | DATE | | Document date |
| `expiry_date` | DATE | | Document expiration (if applicable) |
| `file_path` | VARCHAR | | Storage path/URL |
| `file_name` | VARCHAR | | Original filename |
| `file_size` | INTEGER | | File size in bytes |
| `mime_type` | VARCHAR | | File MIME type |
| `version` | INTEGER | DEFAULT 1 | Document version number |
| `status` | VARCHAR | DEFAULT 'active' | active, archived, superseded |
| `uploaded_by_id` | UUID | | User who uploaded |
| `uploaded_at` | TIMESTAMPTZ | DEFAULT now() | Upload timestamp |
| `description` | VARCHAR | | Document description |
| `note` | VARCHAR | | Internal notes |
| `info` | JSON | | Additional metadata |
| `dimension` | JSON | | Multi-dimensional attributes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Proposed Relationships
- **tb_vendor**: Many-to-One (documents belong to one vendor)

#### Proposed Business Rules
1. **Version Control**: New upload creates new version if document_type + document_number match
2. **Expiry Alert**: Alert when document expires within 30 days
3. **Required Documents**: Some vendor types require specific documents
4. **Access Control**: Sensitive documents restricted by role

#### Proposed Indexes
```
CREATE INDEX idx_vendor_document_vendor
  ON tb_vendor_document(vendor_id);

CREATE INDEX idx_vendor_document_type
  ON tb_vendor_document(document_type, vendor_id);

CREATE INDEX idx_vendor_document_expiry
  ON tb_vendor_document(expiry_date)
  WHERE expiry_date IS NOT NULL AND deleted_at IS NULL;
```

#### Standard Document Types
- Contract/Agreement
- Insurance Certificate
- Business License
- Tax Certificate
- Bank Account Details
- W-9/W-8 (US tax forms)
- Quality Audit Report
- Product Catalog
- Price List Archive
- Other

#### Proposed JSON Structure (info field)
```json
{
  "security_classification": "confidential",
  "requires_signature": false,
  "signed_by": "John Doe",
  "signed_date": "2025-01-15",
  "review_required": true,
  "reviewed_by_id": "uuid",
  "reviewed_date": "2025-01-16",
  "tags": ['legal', 'annual', '2025'],
  "related_documents": ['doc_id_1', 'doc_id_2']
}
```

**Implementation Priority**: HIGH
**Estimated Effort**: 4-5 hours

---

### 2. Vendor Ratings (PROPOSED)

**Status**: ❌ NOT IN SCHEMA - Requires Implementation

**Purpose**: Track vendor performance ratings across multiple criteria.

**Proposed Table Name**: `tb_vendor_rating`

#### Proposed Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `vendor_id` | UUID | FOREIGN KEY → tb_vendor.id, NOT NULL | Parent vendor |
| `rating_period_start` | DATE | NOT NULL | Rating period start |
| `rating_period_end` | DATE | NOT NULL | Rating period end |
| `overall_score` | DECIMAL(3,2) | CHECK (>= 1 AND <= 5) | Overall rating (1-5 scale) |
| `quality_score` | DECIMAL(3,2) | CHECK (>= 1 AND <= 5) | Product quality rating |
| `delivery_score` | DECIMAL(3,2) | CHECK (>= 1 AND <= 5) | On-time delivery rating |
| `price_score` | DECIMAL(3,2) | CHECK (>= 1 AND <= 5) | Price competitiveness |
| `service_score` | DECIMAL(3,2) | CHECK (>= 1 AND <= 5) | Customer service rating |
| `compliance_score` | DECIMAL(3,2) | CHECK (>= 1 AND <= 5) | Compliance/documentation |
| `total_orders` | INTEGER | DEFAULT 0 | Orders during period |
| `on_time_deliveries` | INTEGER | DEFAULT 0 | Deliveries on-time |
| `quality_issues` | INTEGER | DEFAULT 0 | Quality problems reported |
| `rated_by_id` | UUID | | User who created rating |
| `rated_date` | TIMESTAMPTZ | DEFAULT now() | Rating timestamp |
| `comments` | TEXT | | Rating comments/notes |
| `description` | VARCHAR | | Rating description |
| `note` | VARCHAR | | Internal notes |
| `info` | JSON | | Additional rating details |
| `dimension` | JSON | | Multi-dimensional attributes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Proposed Relationships
- **tb_vendor**: Many-to-One (ratings belong to one vendor)

#### Proposed Business Rules
1. **Period Non-Overlap**: Rating periods for same vendor cannot overlap
2. **Score Calculation**: `overall_score = AVERAGE(quality, delivery, price, service, compliance)`
3. **Minimum Data**: Require at least 3 orders in period for valid rating
4. **Approval**: Ratings may require manager approval before finalizing

#### Proposed Indexes
```
CREATE INDEX idx_vendor_rating_vendor
  ON tb_vendor_rating(vendor_id);

CREATE INDEX idx_vendor_rating_period
  ON tb_vendor_rating(rating_period_start, rating_period_end);

CREATE UNIQUE INDEX idx_vendor_rating_vendor_period
  ON tb_vendor_rating(vendor_id, rating_period_start, rating_period_end)
  WHERE deleted_at IS NULL;
```

#### Proposed JSON Structure (info field)
```json
{
  "metrics": {
    "average_delivery_days": 7.2,
    "on_time_percentage": 92.5,
    "quality_reject_rate": 0.8,
    "invoice_accuracy": 98.5,
    "response_time_hours": 4.2
  },
  "strengths": [
    "Consistently high quality",
    "Excellent customer service",
    "Competitive pricing"
  ],
  "areas_for_improvement": [
    "Delivery scheduling communication",
    "Documentation accuracy"
  ],
  "action_items": [
    "Review delivery SLA",
    "Provide invoice training"
  ]
}
```

**Implementation Priority**: MEDIUM
**Estimated Effort**: 5-6 hours

---

## Data Validation Rules

### Vendor Master Validation

1. **VAL-VEN-001**: Vendor name uniqueness
   - Rule: `name` must be unique across all vendors
   - Error: "Vendor name already exists"

2. **VAL-VEN-002**: Tax rate validation
   - Rule: `tax_rate >= 0 AND tax_rate <= 100`
   - Error: "Tax rate must be between 0 and 100"

3. **VAL-VEN-003**: Business type requirement
   - Rule: `business_type_id` should be specified
   - Error: "Business type is required"

### Contact Validation

4. **VAL-VEN-101**: Primary contact requirement
   - Rule: Each vendor must have at least one primary contact
   - Error: "Vendor must have a primary contact"

5. **VAL-VEN-102**: Email format validation
   - Rule: `info.email.primary` must be valid email format
   - Error: "Invalid email address"

6. **VAL-VEN-103**: Contact uniqueness
   - Rule: Same email cannot appear twice for same vendor
   - Error: "Contact email already exists for this vendor"

### Address Validation (Asian International Format)

7. **VAL-VEN-201**: Required address fields
   - Rule: `data` must include: addressLine1, city, country
   - Optional fields: addressLine2, subDistrict, district, province, postalCode
   - Error: "Required address fields missing"

8. **VAL-VEN-202**: Primary address requirement
   - Rule: Each vendor must have at least one address with isPrimary=true
   - Error: "Vendor must have a primary address"

9. **VAL-VEN-203**: Country validation
   - Rule: Country must be one of 15 supported countries
   - Supported: Thailand, Singapore, Malaysia, Indonesia, Vietnam, Philippines, Myanmar, Cambodia, Laos, Brunei, China, Japan, South Korea, India, United States
   - Error: "Unsupported country"

### Certification Validation (IMPLEMENTED)

10. **VAL-VEN-301**: Required certification fields
    - Rule: `name`, `certificationType`, `issuer`, `issueDate`, `expiryDate` are required
    - Error: "Required certification fields missing"

11. **VAL-VEN-302**: Expiry date validation
    - Rule: `expiryDate > issueDate`
    - Error: "Expiry date must be after issue date"

12. **VAL-VEN-303**: Certification type validation
    - Rule: `certificationType` must be one of 16 predefined types
    - Error: "Invalid certification type"

13. **VAL-VEN-304**: Status auto-calculation
    - Rule: Status automatically calculated based on expiryDate
    - Active: expiryDate > 30 days from now
    - Expiring Soon: expiryDate within 30 days
    - Expired: expiryDate < current date

---

## Integration Points

### 1. Procurement Module
- **Direction**: Outbound
- **Purpose**: Vendor selection for purchase requests and RFPs
- **Key Fields**: `vendor_id`, `name`, `is_active`

### 2. Purchase Orders
- **Direction**: Outbound
- **Purpose**: Vendor details auto-populate in POs
- **Key Fields**: `vendor_id`, contact, address, tax information

### 3. Price Lists
- **Direction**: Bidirectional
- **Purpose**: Vendors submit price lists, pricing used in procurement
- **Key Fields**: `vendor_id`, pricelist data

### 4. Good Received Notes (GRN)
- **Direction**: Outbound
- **Purpose**: Track vendor deliveries and performance
- **Key Fields**: `vendor_id`, delivery address

### 5. Vendor Portal
- **Direction**: Bidirectional
- **Purpose**: Vendors access system via portal
- **Key Fields**: `info.portal_access`, contact information

### 6. Finance/Accounts Payable
- **Direction**: Outbound
- **Purpose**: Vendor payment processing
- **Key Fields**: `vendor_id`, banking details, tax information

---

## Performance Considerations

### Indexing Strategy
1. **Primary Lookup**: `name` (unique index exists)
2. **Business Type Filter**: `business_type_id` - **NEEDS INDEX**
3. **Active Vendors**: `is_active` - **NEEDS INDEX**
4. **Contact Lookup**: Composite index exists (vendor_id, contact_type)
5. **Address Lookup**: Composite index exists (vendor_id, address_type)

### Recommended Additional Indexes
```
CREATE INDEX idx_vendor_business_type
  ON tb_vendor(business_type_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_vendor_active
  ON tb_vendor(is_active)
  WHERE deleted_at IS NULL;
```

---

## Security & Access Control

### Field-Level Security
- **Public (Portal)**: Vendor name, description, portal access
- **Internal**: Notes, ratings, certifications, financial details
- **Restricted**: Banking details, tax information, contracts

### Row-Level Security
- **Vendor Portal**: Vendors can only view/edit their own record
- **Department Access**: Filtered by `dimension.department_ids`
- **Role-Based**:
  - Purchasing Staff: View all vendors, edit basic info
  - Purchasing Manager: Full access, approve vendors
  - Finance: View vendor + banking details
  - Vendors: View own profile only

---

## Migration Notes

### From DS to DD
- **Date**: 2025-11-25
- **Schema Source**: `data-struc/schema.prisma` lines 1859-1942, 2664-2685
- **Coverage**: ⚠️ 70% - Core vendor tables exist, certifications implemented in frontend
- **Existing**: tb_vendor, tb_vendor_contact, tb_vendor_address, tb_vendor_business_type
- **Frontend Implemented**: VendorCertification with full CRUD and status tracking
- **Missing**: Documents, ratings tables

### Implementation Roadmap
1. **Phase 1** (Current):
   - Use existing 4 tables
   - Full certification management in frontend with 16 types and auto-status calculation
   - Asian international address format (8 fields)
   - 15 countries support
2. **Phase 2** (3-6 months): Implement tb_vendor_certification backend and tb_vendor_document
3. **Phase 3** (6-12 months): Implement tb_vendor_rating with full KPI tracking

---

## Document Metadata

**Created**: 2025-11-15
**Updated**: 2025-11-25
**Schema Version**: As of schema.prisma commit 9fbc771
**Coverage**: 4 entities from schema.prisma + 1 frontend-implemented + 2 proposed entities
**Status**: Active - Core tables exist, certifications implemented in frontend
**Implementation Status**: 2 tables require backend implementation (Documents, Ratings)

---

**End of Data Definition Document**
