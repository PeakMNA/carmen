# Vendor Management - Data Structure Gap Analysis

## Document Information
- **Document Type**: Data Structure Analysis
- **Module**: Vendor Management
- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Purpose**: Document existing schema vs. required structures for full vendor management functionality

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0 | 2024-01-15 | System | Initial gap analysis |

---

## 1. Executive Summary

This document analyzes the existing vendor-related data structures in `schema.prisma` and identifies gaps that need to be addressed for comprehensive vendor management functionality. The analysis focuses on utilizing existing JSON fields (`info`, `dimension`) for flexibility while identifying areas where dedicated tables would improve data integrity and query performance.

---

## 2. Current Schema Analysis

### 2.1 Existing Tables

#### **tb_vendor**
```prisma
model tb_vendor {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name               String   @unique @db.VarChar
  description        String?  @db.VarChar
  note               String?  @db.VarChar
  business_type_id   String?  @db.Uuid
  business_type_name String?  @db.VarChar
  tax_profile_id     String?  @db.Uuid
  tax_profile_name   String?  @db.VarChar
  tax_rate           Decimal? @db.Decimal(15, 5)
  is_active          Boolean? @default(true)
  info               Json?    @db.Json
  dimension          Json?    @db.Json
  // Audit fields
  created_at         DateTime? @default(now())
  created_by_id      String?   @db.Uuid
  updated_at         DateTime? @default(now())
  updated_by_id      String?   @db.Uuid
  deleted_at         DateTime? @db.Timestamptz(6)
  deleted_by_id      String?   @db.Uuid

  // Relations
  tb_vendor_business_type       tb_vendor_business_type?
  tb_vendor_address             tb_vendor_address[]
  tb_vendor_contact             tb_vendor_contact[]
  tb_good_received_note         tb_good_received_note[]
  tb_product_tb_vendor          tb_product_tb_vendor[]
  tb_purchase_order             tb_purchase_order[]
  tb_purchase_request_detail    tb_purchase_request_detail[]
  tb_credit_note                tb_credit_note[]
  tb_pricelist                  tb_pricelist[]
  tb_request_for_pricing_detail tb_request_for_pricing_detail[]
}
```

**Current Capabilities**:
- ✅ Basic vendor information (name, description)
- ✅ Business type classification
- ✅ Tax profile and rate
- ✅ Active/inactive status
- ✅ Flexible JSON fields for extended data
- ✅ Complete audit trail
- ✅ Relations to addresses and contacts
- ✅ Integration with procurement workflows

**Gaps**:
- ❌ No vendor code/reference field
- ❌ No vendor status (Approved, Preferred, Blocked, etc.)
- ❌ No rating/performance tracking
- ❌ No payment terms structure
- ❌ No credit limit field
- ❌ No currency field
- ❌ No category/classification system beyond business_type

---

#### **tb_vendor_address**
```prisma
model tb_vendor_address {
  id           String                    @id @default(dbgenerated("gen_random_uuid()"))
  vendor_id    String?                   @db.Uuid
  address_type enum_vendor_address_type?
  data         Json?                     @db.Json
  is_active    Boolean?                  @default(true)
  description  String?                   @db.VarChar
  note         String?                   @db.VarChar
  info         Json?                     @db.Json
  dimension    Json?                     @db.Json
  // Audit fields

  tb_vendor tb_vendor? @relation(fields: [vendor_id], references: [id])
}

enum enum_vendor_address_type {
  contact_address
  mailing_address
  register_address
}
```

**Current Capabilities**:
- ✅ Multiple addresses per vendor
- ✅ Address type classification
- ✅ Flexible JSON data field for address details
- ✅ Active/inactive flag

**Gaps**:
- ❌ No structured address fields (street, city, state, postal_code, country)
- ❌ No primary address designation
- ❌ Limited address types (no billing, shipping, remittance)

---

#### **tb_vendor_contact**
```prisma
model tb_vendor_contact {
  id           String                   @id @default(dbgenerated("gen_random_uuid()"))
  vendor_id    String?                  @db.Uuid
  contact_type enum_vendor_contact_type
  is_active    Boolean?                 @default(true)
  description  String?                  @db.VarChar
  note         String?                  @db.VarChar
  info         Json?                    @db.Json
  dimension    Json?                    @db.Json
  // Audit fields

  tb_vendor tb_vendor? @relation(fields: [vendor_id], references: [id])
}

enum enum_vendor_contact_type {
  phone_number
  email_address
}
```

**Current Capabilities**:
- ✅ Multiple contacts per vendor
- ✅ Contact type classification
- ✅ Flexible JSON fields for contact details

**Gaps**:
- ❌ No structured contact person fields (name, title, role)
- ❌ Limited contact types (only phone/email, no role-based contacts)
- ❌ No primary contact designation
- ❌ No contact preference tracking

---

#### **tb_vendor_business_type**
```prisma
model tb_vendor_business_type {
  id          String   @id @default(dbgenerated("gen_random_uuid()"))
  name        String   @unique @db.VarChar
  description String?  @db.VarChar
  note        String?  @db.VarChar
  is_active   Boolean? @default(true)
  info        Json?    @db.Json
  dimension   Json?    @db.Json
  doc_version Decimal  @default(0) @db.Decimal
  // Audit fields

  tb_vendor tb_vendor[]
}
```

**Current Capabilities**:
- ✅ Business type classification
- ✅ Flexible JSON fields

**Gaps**:
- ❌ No hierarchical category structure
- ❌ No tag/classification system

---

## 3. Missing Data Structures

### 3.1 Critical Missing Tables

#### **3.1.1 Vendor Documents Table**
**Purpose**: Track contracts, certifications, insurance, and other vendor documents with expiration dates.

**Required Structure** (not in current schema):
```typescript
// Suggested JSON structure for tb_vendor.info field
interface VendorDocuments {
  documents: Array<{
    id: string
    documentType: 'contract' | 'certification' | 'insurance' | 'tax_document' | 'bank_details' | 'quality_certificate' | 'other'
    documentNumber: string
    fileName: string
    fileUrl: string
    fileSize: number
    mimeType: string
    issueDate: string // ISO date
    expiryDate?: string // ISO date
    status: 'active' | 'expired' | 'expiring_soon' | 'pending_renewal'
    version: number
    uploadedBy: string // user_id
    uploadedAt: string // ISO timestamp
    approvedBy?: string // user_id
    approvedAt?: string // ISO timestamp
    notes?: string
    metadata?: Record<string, any>
  }>
}
```

**Business Impact**: High - Required for compliance tracking and vendor qualification

**Recommendation**:
- **Short-term**: Use `tb_vendor.info` JSON field with structure above
- **Long-term**: Consider dedicated `tb_vendor_document` table for:
  - Better query performance on expiration dates
  - Easier document expiration alerts
  - Better audit trail
  - File versioning support

---

#### **3.1.2 Vendor Performance & Ratings**
**Purpose**: Track vendor performance metrics and calculated ratings.

**Required Structure** (not in current schema):
```typescript
// Suggested JSON structure for tb_vendor.info field
interface VendorPerformance {
  performance: {
    overallRating: number // 1-5 or 1-10
    lastCalculatedAt: string // ISO timestamp
    metrics: {
      qualityScore: number // 0-100
      deliveryPerformance: number // % on-time delivery
      serviceLevel: number // 0-100
      pricingCompetitiveness: number // 0-100
      complianceAdherence: number // 0-100
    }
    reviewHistory: Array<{
      reviewDate: string // ISO date
      rating: number
      reviewedBy: string // user_id
      comments: string
      period: {
        from: string // ISO date
        to: string // ISO date
      }
    }>
    statistics: {
      totalOrders: number
      totalSpend: number
      defectRate: number
      returnRate: number
      averageLeadTime: number // days
      responseTime: number // hours
    }
  }
}
```

**Business Impact**: High - Critical for vendor management decisions

**Recommendation**:
- **Short-term**: Use `tb_vendor.info` JSON field
- **Long-term**: Consider dedicated `tb_vendor_performance` table for:
  - Historical trend analysis
  - Automated rating calculations
  - Performance reporting
  - Benchmarking across vendors

---

#### **3.1.3 Vendor Payment Terms**
**Purpose**: Define payment terms, credit limits, and financial arrangements.

**Required Structure** (not in current schema):
```typescript
// Suggested JSON structure for tb_vendor.info field
interface VendorPaymentTerms {
  paymentTerms: {
    termsType: 'net_7' | 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'net_90' | 'custom' | 'prepayment'
    daysNet: number
    earlyPaymentDiscount?: {
      discountPercent: number
      discountDays: number
      description: string // e.g., "2/10 Net 30"
    }
    creditLimit: number
    creditLimitCurrency: string // ISO currency code
    currentUtilization: number
    defaultCurrency: string // ISO currency code
    acceptedCurrencies: string[] // ISO currency codes
    paymentMethods: Array<'wire' | 'check' | 'ach' | 'card' | 'cash'>
    preferredPaymentMethod: string
    bankingDetails?: {
      bankName: string
      branchName?: string
      accountNumber: string // encrypted
      accountName: string
      iban?: string
      swiftCode?: string
      routingNumber?: string
      accountType: 'checking' | 'savings'
    }
    taxSettings: {
      taxId: string
      taxIdType: string // EIN, VAT, GST, etc.
      taxExempt: boolean
      exemptionCertificateNumber?: string
      defaultTaxRate?: number
    }
  }
}
```

**Business Impact**: Critical - Required for PO processing and payments

**Recommendation**:
- **Short-term**: Use `tb_vendor.info` JSON field with encrypted banking details
- **Long-term**: Consider dedicated `tb_vendor_payment_terms` table for:
  - Credit limit enforcement
  - Payment schedule automation
  - Multi-currency support
  - Banking detail security (separate encrypted table)

---

#### **3.1.4 Vendor Status & Segmentation**
**Purpose**: Track vendor approval status, segmentation, and lifecycle.

**Required Structure** (not in current schema):
```typescript
// Suggested JSON structure for tb_vendor.info field
interface VendorStatus {
  status: {
    currentStatus: 'draft' | 'pending_approval' | 'approved' | 'preferred' | 'provisional' | 'blocked' | 'blacklisted' | 'inactive'
    statusChangedAt: string // ISO timestamp
    statusChangedBy: string // user_id
    statusReason?: string
    statusHistory: Array<{
      status: string
      changedAt: string
      changedBy: string
      reason: string
    }>
    provisionalExpiresAt?: string // ISO timestamp (for provisional status)
    blockReason?: string
    blockExpiresAt?: string // ISO timestamp (if temporary)
  }
  segmentation: {
    vendorTier: 'tier_1' | 'tier_2' | 'tier_3' // Based on spend
    isPreferred: boolean
    isStrategicPartner: boolean
    categories: string[] // Secondary category tags
    specializations: string[]
    certifications: string[]
  }
  lifecycle: {
    onboardedAt: string // ISO timestamp
    firstOrderAt?: string // ISO timestamp
    lastOrderAt?: string // ISO timestamp
    provisionalPeriodEnds?: string // ISO timestamp
    relationship DurationDays: number
  }
}
```

**Business Impact**: High - Required for vendor governance and compliance

**Recommendation**:
- **Short-term**: Use `tb_vendor.info` JSON field
- **Long-term**: Add dedicated enum field for status to tb_vendor:
  ```prisma
  status enum_vendor_status @default(pending_approval)

  enum enum_vendor_status {
    draft
    pending_approval
    approved
    preferred
    provisional
    blocked
    blacklisted
    inactive
  }
  ```

---

#### **3.1.5 Vendor Location Assignments**
**Purpose**: Assign vendors to specific locations/departments with location-specific settings.

**Required Structure** (not in current schema):
```typescript
// Suggested JSON structure for tb_vendor.info field
interface VendorLocationAssignments {
  locationAssignments: Array<{
    locationId: string
    locationName: string
    isPrimary: boolean
    isActive: boolean
    deliveryDays: string[] // ['monday', 'wednesday', 'friday']
    minimumOrderValue: number
    leadTimeDays: number
    locationSpecificContact?: {
      name: string
      email: string
      phone: string
    }
    locationSpecificNotes?: string
    assignedAt: string // ISO timestamp
    assignedBy: string // user_id
  }>
  serveAllLocations: boolean // If false, only assigned locations
  departmentAssignments?: Array<{
    departmentId: string
    departmentName: string
    isActive: boolean
  }>
}
```

**Business Impact**: Medium - Important for multi-location operations

**Recommendation**:
- **Short-term**: Use `tb_vendor.info` JSON field
- **Long-term**: Consider dedicated `tb_vendor_location` junction table for:
  - Better location filtering
  - Location-specific rules enforcement
  - Simplified location assignment management

---

#### **3.1.6 Vendor Approval Workflow Tracking**
**Purpose**: Track approval workflow progress and history.

**Required Structure** (not in current schema):
```typescript
// Suggested JSON structure for tb_vendor.info field
interface VendorApprovalWorkflow {
  currentApproval?: {
    workflowId: string
    workflowName: string
    initiatedAt: string // ISO timestamp
    initiatedBy: string // user_id
    currentStage: string
    currentStageIndex: number
    totalStages: number
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled'
    pendingApprovers: string[] // user_ids
    completedStages: Array<{
      stageName: string
      stageIndex: number
      approver: string // user_id
      decision: 'approved' | 'rejected'
      decidedAt: string // ISO timestamp
      comments?: string
    }>
  }
  approvalHistory: Array<{
    workflowId: string
    workflowName: string
    initiatedAt: string
    completedAt: string
    finalStatus: 'approved' | 'rejected' | 'cancelled'
    stages: Array<{
      stageName: string
      approver: string
      decision: string
      decidedAt: string
      comments?: string
    }>
  }>
}
```

**Business Impact**: High - Required for governance and compliance

**Recommendation**:
- **Short-term**: Use `tb_vendor.info` JSON field
- **Long-term**: Utilize existing `tb_workflow` table and create `tb_vendor_approval` table for:
  - Workflow automation
  - Approval notifications
  - SLA tracking
  - Approval delegation

---

### 3.2 Extended Vendor Information

#### **3.2.1 Vendor Profile Extended Data**
**Purpose**: Store additional vendor profile information not in base table.

**Required Structure** (fits in tb_vendor.info):
```typescript
interface VendorProfileExtended {
  profile: {
    vendorCode: string // Unique vendor reference code
    legalName: string
    dbaName?: string // Doing Business As
    registrationNumber?: string
    dunsNumber?: string
    website?: string
    linkedin?: string
    industry: string
    yearEstablished?: number
    employeeCount?: number
    annualRevenue?: number
    minorityOwned?: boolean
    womanOwned?: boolean
    veteranOwned?: boolean
    smallBusiness?: boolean
    certifications: string[]
    languages: string[]
    serviceAreas: string[] // Geographic coverage
    specializations: string[]
  }
  complianceInfo: {
    isoeCertifications: string[]
    foodSafetyCertifications: string[]
    insuranceCertificates: string[]
    lastComplianceReview?: string // ISO date
    nextComplianceReviewDue?: string // ISO date
    complianceNotes?: string
  }
  operationalDetails: {
    minimumOrderValue?: number
    maximumOrderValue?: number
    leadTimeDays: number
    deliverySchedule?: string
    returnPolicy?: string
    warrantyPolicy?: string
    customerServiceHours?: string
  }
}
```

**Recommendation**: Store in `tb_vendor.info` JSON field

---

## 4. JSON Field Structure Recommendations

### 4.1 tb_vendor.info JSON Structure
**Complete recommended structure**:

```typescript
interface VendorInfo {
  // Profile Extended
  profile?: VendorProfileExtended

  // Status & Segmentation
  status?: VendorStatus

  // Payment Terms & Financial
  paymentTerms?: VendorPaymentTerms

  // Performance & Ratings
  performance?: VendorPerformance

  // Documents
  documents?: VendorDocuments

  // Location Assignments
  locationAssignments?: VendorLocationAssignments

  // Approval Workflow
  approvalWorkflow?: VendorApprovalWorkflow

  // Communication Preferences
  communicationPreferences?: {
    preferredChannel: 'email' | 'phone' | 'portal' | 'sms'
    emailNotifications: boolean
    smsNotifications: boolean
    portalNotifications: boolean
    notificationLanguage: string
  }

  // Custom Fields (extensible)
  customFields?: Record<string, any>
}
```

---

### 4.2 tb_vendor.dimension JSON Structure
**Purpose**: Store analytics and dimensional data for reporting.

```typescript
interface VendorDimension {
  analytics: {
    totalLifetimeSpend: number
    averageOrderValue: number
    orderFrequency: number // orders per month
    lastOrderDate?: string // ISO date
    firstOrderDate?: string // ISO date
    totalOrders: number
    activeContractValue: number
    projectedAnnualSpend: number
  }
  scoring: {
    riskScore: number // 0-100
    opportunityScore: number // 0-100
    strategicValue: number // 0-100
    innovationScore: number // 0-100
  }
  tags: string[] // Flexible tagging for filtering
  metadata: Record<string, any> // Additional dimensional data
}
```

---

### 4.3 tb_vendor_address.data JSON Structure
**Complete address structure**:

```typescript
interface AddressData {
  addressLine1: string
  addressLine2?: string
  addressLine3?: string
  city: string
  stateProvince: string
  postalCode: string
  country: string // ISO country code
  countryName: string
  isPrimary: boolean
  deliveryInstructions?: string
  accessHours?: string
  contactName?: string
  contactPhone?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  validated: boolean
  validatedAt?: string // ISO timestamp
  validationService?: string
}
```

---

### 4.4 tb_vendor_contact.info JSON Structure
**Complete contact structure**:

```typescript
interface ContactInfo {
  // Person Details
  firstName: string
  lastName: string
  fullName: string
  title?: string
  role: 'primary' | 'sales' | 'accounts_payable' | 'technical_support' | 'management' | 'quality' | 'logistics' | 'other'
  department?: string

  // Contact Methods
  email: {
    primary: string
    secondary?: string
    verified: boolean
  }
  phone: {
    office?: string
    mobile?: string
    fax?: string
    extension?: string
  }

  // Preferences
  preferredContactMethod: 'email' | 'phone' | 'sms' | 'portal'
  preferredLanguage: string
  availability?: {
    timezone: string
    workingHours?: string
    availableDays?: string[]
  }

  // Status
  isPrimary: boolean
  isDecisionMaker: boolean
  canApproveOrders: boolean
  orderApprovalLimit?: number

  // Additional
  linkedIn?: string
  notes?: string
  lastContactedAt?: string // ISO timestamp
}
```

---

## 5. Implementation Strategy

### 5.1 Phase 1: Immediate (Leverage Existing JSON Fields)
**Timeline**: Week 1-2
**Approach**: Use existing JSON fields with standardized structure

**Actions**:
1. Define TypeScript interfaces for all JSON structures
2. Create utility functions for JSON data access
3. Implement validation for JSON data
4. Update UI to work with JSON structures
5. Create migration scripts for existing data

**Benefits**:
- No schema changes required
- Fast implementation
- Backward compatible
- Flexible and extensible

**Drawbacks**:
- Less efficient queries on JSON fields
- No database-level constraints
- More complex validation logic

---

### 5.2 Phase 2: Optimization (Selective Dedicated Tables)
**Timeline**: Month 2-3
**Approach**: Create dedicated tables for high-value data

**Priority Tables to Add**:
1. **tb_vendor_document** - Frequently queried, time-sensitive (expiration alerts)
2. **tb_vendor_performance_history** - Large dataset, complex queries
3. **tb_vendor_approval_log** - Audit requirements, workflow integration

**Benefits**:
- Better query performance
- Database constraints and validation
- Easier reporting and analytics
- Better data integrity

---

### 5.3 Phase 3: Full Enhancement (Complete Schema)
**Timeline**: Month 4-6
**Approach**: Comprehensive schema enhancement

**Additional Tables**:
1. **tb_vendor_location_assignment** - Junction table for locations
2. **tb_vendor_payment_terms** - Dedicated payment terms
3. **tb_vendor_banking_details** - Encrypted banking information
4. **tb_vendor_certification** - Certification tracking
5. **tb_vendor_category** - Hierarchical category system
6. **tb_vendor_tag** - Flexible tagging system

---

## 6. Query Optimization Recommendations

### 6.1 Indexes for JSON Fields

For frequently queried JSON paths, create indexes:

```sql
-- Index for vendor status
CREATE INDEX idx_vendor_status
ON tb_vendor USING GIN ((info->'status'));

-- Index for vendor rating
CREATE INDEX idx_vendor_rating
ON tb_vendor ((CAST(info->'performance'->>'overallRating' AS NUMERIC)));

-- Index for document expiration
CREATE INDEX idx_vendor_documents_expiry
ON tb_vendor USING GIN ((info->'documents'));

-- Index for vendor code
CREATE INDEX idx_vendor_code
ON tb_vendor ((info->'profile'->>'vendorCode'));
```

---

### 6.2 Computed/Virtual Columns

For frequently accessed JSON data, consider computed columns:

```sql
-- Add computed column for vendor code
ALTER TABLE tb_vendor
ADD COLUMN vendor_code VARCHAR GENERATED ALWAYS AS (info->'profile'->>'vendorCode') STORED;

-- Add index
CREATE UNIQUE INDEX idx_vendor_code ON tb_vendor(vendor_code);

-- Add computed column for vendor status
ALTER TABLE tb_vendor
ADD COLUMN vendor_status VARCHAR GENERATED ALWAYS AS (info->'status'->>'currentStatus') STORED;

CREATE INDEX idx_vendor_status ON tb_vendor(vendor_status);
```

---

## 7. TypeScript Type Definitions

### 7.1 Complete Type System

```typescript
// File: /lib/types/vendor.ts

import { tb_vendor, tb_vendor_address, tb_vendor_contact } from '@prisma/client'

// JSON Structure Interfaces (as defined above)
export interface VendorInfo { /* ... */ }
export interface VendorDimension { /* ... */ }
export interface AddressData { /* ... */ }
export interface ContactInfo { /* ... */ }

// Extended Vendor Type
export interface VendorWithDetails extends tb_vendor {
  info: VendorInfo
  dimension: VendorDimension
  addresses: Array<tb_vendor_address & { data: AddressData }>
  contacts: Array<tb_vendor_contact & { info: ContactInfo }>
}

// Vendor Status Enum
export enum VendorStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PREFERRED = 'preferred',
  PROVISIONAL = 'provisional',
  BLOCKED = 'blocked',
  BLACKLISTED = 'blacklisted',
  INACTIVE = 'inactive'
}

// Helper Functions
export function getVendorStatus(vendor: tb_vendor): VendorStatus {
  const info = vendor.info as VendorInfo
  return info?.status?.currentStatus as VendorStatus || VendorStatus.DRAFT
}

export function getVendorCode(vendor: tb_vendor): string | undefined {
  const info = vendor.info as VendorInfo
  return info?.profile?.vendorCode
}

export function getVendorRating(vendor: tb_vendor): number | undefined {
  const info = vendor.info as VendorInfo
  return info?.performance?.overallRating
}

export function isVendorActive(vendor: tb_vendor): boolean {
  return vendor.is_active === true &&
         getVendorStatus(vendor) === VendorStatus.APPROVED ||
         getVendorStatus(vendor) === VendorStatus.PREFERRED
}
```

---

## 8. Migration Path

### 8.1 Data Migration Script

```typescript
// scripts/migrate-vendor-data.ts

import { prisma } from '@/lib/prisma'

async function migrateVendorData() {
  const vendors = await prisma.tb_vendor.findMany()

  for (const vendor of vendors) {
    const info: VendorInfo = {
      profile: {
        vendorCode: generateVendorCode(vendor.name),
        legalName: vendor.name,
        // ... other profile data
      },
      status: {
        currentStatus: vendor.is_active ? 'approved' : 'inactive',
        statusChangedAt: new Date().toISOString(),
        statusChangedBy: 'system',
        statusHistory: []
      },
      // ... other initial data
    }

    await prisma.tb_vendor.update({
      where: { id: vendor.id },
      data: {
        info: info as any
      }
    })
  }
}
```

---

## 9. Validation and Business Rules

### 9.1 JSON Schema Validation

```typescript
// lib/validation/vendor-info-schema.ts

import { z } from 'zod'

export const vendorInfoSchema = z.object({
  profile: z.object({
    vendorCode: z.string().min(2).max(20),
    legalName: z.string().min(2).max(200),
    website: z.string().url().optional(),
    // ... other validations
  }).optional(),

  status: z.object({
    currentStatus: z.enum(['draft', 'pending_approval', 'approved', 'preferred', 'provisional', 'blocked', 'blacklisted', 'inactive']),
    statusChangedAt: z.string().datetime(),
    // ... other validations
  }).optional(),

  // ... other section validations
})

export type ValidatedVendorInfo = z.infer<typeof vendorInfoSchema>
```

---

## 10. Summary and Recommendations

### 10.1 Current State
- ✅ **Adequate base structure** for basic vendor management
- ✅ **Flexible JSON fields** allow extension without schema changes
- ✅ **Good audit trail** with created/updated/deleted tracking
- ✅ **Integration ready** with procurement and finance modules

### 10.2 Critical Gaps
1. **Vendor code/reference** - Use JSON for now, add computed column later
2. **Vendor status workflow** - Implement in JSON, migrate to enum field later
3. **Document management** - Use JSON for now, dedicated table in Phase 2
4. **Performance tracking** - Use JSON for now, dedicated table in Phase 2
5. **Payment terms** - Use JSON with careful validation

### 10.3 Immediate Actions (No Schema Changes)
1. ✅ Define comprehensive TypeScript interfaces
2. ✅ Implement JSON structure standards
3. ✅ Create validation schemas (Zod)
4. ✅ Build utility functions for JSON access
5. ✅ Add JSON field indexes for performance
6. ✅ Document JSON structure usage

### 10.4 Future Enhancements (Schema Changes)
1. Add `vendor_code VARCHAR` to tb_vendor (computed or regular)
2. Add `vendor_status enum_vendor_status` to tb_vendor
3. Add `rating DECIMAL` to tb_vendor (computed)
4. Create `tb_vendor_document` table
5. Create `tb_vendor_performance` table
6. Expand `enum_vendor_address_type` for more address types
7. Expand `enum_vendor_contact_type` for role-based contacts

### 10.5 Success Metrics
- **Performance**: JSON queries <100ms for vendor list
- **Flexibility**: Add new fields without schema migrations
- **Data Integrity**: 100% validation coverage for JSON data
- **User Experience**: All vendor management features functional
- **Scalability**: Handle 50,000+ vendors with current structure

---

## Related Documents
- BR-vendor-directory.md - Business Requirements
- schema.prisma - Current database schema
- vendor.ts - TypeScript type definitions

---

**End of Data Structure Gap Analysis**
