# Data Dictionary: Vendor Price Submission Portal

## Document Information
- **Document Type**: Data Dictionary (DD)
- **System**: Vendor Price Submission Portal
- **Module**: Vendor Management
- **Version**: 2.1.0
- **Status**: Updated
- **Created**: 2025-01-23
- **Last Updated**: 2025-11-26
- **Author**: Product Team
- **Related Documents**:
  - [Business Requirements](./BR-vendor-portal.md)
  - [Use Cases](./UC-vendor-portal.md)
  - [Technical Specification](./TS-vendor-portal.md)

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0 | 2025-11-15 | System | Initial version |
| 2.0 | 2025-01-23 | Product Team | Complete rewrite - TypeScript vs Prisma schema comparison |
| 2.1.0 | 2025-11-26 | System | Removed approval workflow references; Updated status to draft → submitted; Aligned with BR v2.1.0 |

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Data Model Overview](#2-data-model-overview)
3. [Entity Definitions](#3-entity-definitions)
4. [Field Mapping Analysis](#4-field-mapping-analysis)
5. [JSON Field Structures](#5-json-field-structures)
6. [Data Relationships](#6-data-relationships)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose
This Data Dictionary documents the data models for the Vendor Price Submission Portal by comparing TypeScript interface definitions (application layer) with Prisma schema definitions (database layer). It identifies gaps where TypeScript interfaces contain fields not present in the Prisma schema.

### 1.2 Scope
- **TypeScript Interfaces**: Defined in application code (`/app/(main)/vendor-management/types/index.ts`, `/lib/types/campaign-management.ts`)
- **Prisma Schema**: Database schema (`/docs/app/data-struc/schema.prisma`)
- **Gap Analysis**: Fields present in TypeScript but missing from Prisma schema
- **JSON Structures**: Expected data stored in `info` and `dimension` JSON fields

### 1.3 Data Storage Strategy
The Prisma schema uses a flexible JSON storage pattern:
- **`info` field**: Stores extended business data (campaign settings, progress metrics, invitation details)
- **`dimension` field**: Stores dimensional/analytical data (performance metrics, vendor engagement)
- **Explicit fields**: Core business-critical fields stored in dedicated columns
- **Audit fields**: Standard audit trail (created_at, created_by_id, updated_at, updated_by_id, deleted_at, deleted_by_id)

### 1.4 Field Status Legend
- ✅ **In Prisma**: Field exists as explicit column in Prisma schema
- 📦 **In JSON (info)**: Field stored in `info` JSON field
- 📊 **In JSON (dimension)**: Field stored in `dimension` JSON field
- ❌ **Missing**: Field exists in TypeScript but not in Prisma schema or JSON fields

---

## 2. Data Model Overview

### 2.1 Core Entities
| TypeScript Interface | Prisma Table | Mapping Status | Notes |
|---------------------|--------------|----------------|-------|
| `Vendor` | `tb_vendor` | ✅ Partial | Core fields mapped, metrics in JSON |
| `VendorInvitation` | `tb_request_for_pricing_detail` | ⚠️ Incomplete | Missing token management fields |
| `PriceCollectionCampaign` | `tb_request_for_pricing` | ⚠️ Incomplete | Missing campaign metadata and progress |
| `VendorPricelist` | `tb_pricelist` | ✅ Partial | Core fields mapped, metadata in JSON |
| `PricelistItem` | `tb_pricelist_detail` | ⚠️ Incomplete | Missing MOQ tiers and quality scoring |
| `PricelistTemplate` | `tb_pricelist_template` | ✅ Partial | Core fields mapped, settings in JSON |
| `MOQPricing` | - | ❌ No table | Stored in `tb_pricelist_detail.info` JSON |
| `PortalSession` | - | ❌ No table | Session management not persisted |
| `ProductInstance` | - | ❌ No table | Stored in `tb_pricelist_template_detail.array_order_unit` JSON |

### 2.2 Supporting Entities
| TypeScript Interface | Prisma Table | Purpose |
|---------------------|--------------|---------|
| `VendorMetrics` | - | Embedded in `Vendor`, stored in JSON |
| `CampaignProgress` | - | Embedded in `PriceCollectionCampaign`, stored in JSON |
| `CampaignSettings` | - | Embedded in `PriceCollectionCampaign`, stored in JSON |
| `RecurringPattern` | - | Embedded in `PriceCollectionCampaign`, stored in JSON |
| `ValidationError` | - | Runtime validation, not persisted |
| `SessionActivity` | - | Session tracking, not persisted |

---

## 3. Entity Definitions

### 3.1 Vendor

#### TypeScript Interface
```typescript
interface Vendor {
  id: string
  name: string
  contactEmail: string
  contactPhone?: string
  address: Address
  status: 'active' | 'inactive'
  preferredCurrency: string
  paymentTerms?: string
  performanceMetrics: VendorMetrics
  createdAt: Date
  updatedAt: Date
  createdBy: string
  companyRegistration?: string
  taxId?: string
  taxProfile?: string
  taxRate?: number
  website?: string
  businessType?: string
  certifications?: string[]
  languages?: string[]
  notes?: string
}
```

#### Prisma Schema Mapping
```prisma
model tb_vendor {
  id                 String    ✅ Explicit field
  name               String    ✅ Explicit field
  description        String?   ✅ Explicit field (maps to notes)
  note               String?   ✅ Explicit field
  business_type_id   String?   ✅ Explicit field
  business_type_name String?   ✅ Explicit field
  tax_profile_id     String?   ✅ Explicit field
  tax_profile_name   String?   ✅ Explicit field
  tax_rate           Decimal?  ✅ Explicit field
  is_active          Boolean?  ✅ Explicit field (maps to status)
  info               Json?     📦 Expected: contactEmail, contactPhone, preferredCurrency, paymentTerms, companyRegistration, taxId, website, certifications, languages
  dimension          Json?     📊 Expected: performanceMetrics (VendorMetrics interface)
  created_at         DateTime? ✅ Audit field
  created_by_id      String?   ✅ Audit field (maps to createdBy)
  updated_at         DateTime? ✅ Audit field
  updated_by_id      String?   ✅ Audit field
  deleted_at         DateTime? ✅ Soft delete
  deleted_by_id      String?   ✅ Audit field
}
```

#### Field Mapping Table
| TypeScript Field | Prisma Field | Status | Storage Location |
|-----------------|--------------|--------|------------------|
| `id` | `id` | ✅ | Explicit column |
| `name` | `name` | ✅ | Explicit column |
| `contactEmail` | - | 📦 | `info` JSON |
| `contactPhone` | - | 📦 | `info` JSON |
| `address` | - | ❌ | Not mapped (separate `tb_vendor_address` table exists) |
| `status` | `is_active` | ✅ | Explicit column (boolean) |
| `preferredCurrency` | - | 📦 | `info` JSON |
| `paymentTerms` | - | 📦 | `info` JSON |
| `performanceMetrics` | - | 📊 | `dimension` JSON (entire VendorMetrics object) |
| `createdAt` | `created_at` | ✅ | Explicit column |
| `updatedAt` | `updated_at` | ✅ | Explicit column |
| `createdBy` | `created_by_id` | ✅ | Explicit column |
| `companyRegistration` | - | 📦 | `info` JSON |
| `taxId` | - | 📦 | `info` JSON |
| `taxProfile` | `tax_profile_name` | ✅ | Explicit column |
| `taxRate` | `tax_rate` | ✅ | Explicit column |
| `website` | - | 📦 | `info` JSON |
| `businessType` | `business_type_name` | ✅ | Explicit column |
| `certifications` | - | 📦 | `info` JSON (array) |
| `languages` | - | 📦 | `info` JSON (array) |
| `notes` | `note` | ✅ | Explicit column |

### 3.2 VendorInvitation

#### TypeScript Interface
```typescript
interface VendorInvitation {
  id: string
  vendorId: string
  token: string                    // UUID token for portal access
  pricelistId: string
  campaignId: string
  sentAt?: Date
  accessedAt?: Date
  submittedAt?: Date
  expiresAt: Date
  status: 'pending' | 'sent' | 'delivered' | 'accessed' | 'submitted' | 'expired' | 'cancelled'  // NO approval status
  deliveryStatus?: {
    attempts: number
    lastAttempt?: Date
    failureReason?: string
  }
  remindersSent: number
  lastReminderSent?: Date
  ipAddress?: string
  userAgent?: string
}
// Note: No approval workflow - pricelists go draft → submitted
```

#### Prisma Schema Mapping
```prisma
model tb_request_for_pricing_detail {
  id                     String    ✅ Explicit field
  request_for_pricing_id String    ✅ Explicit field (maps to campaignId)
  sequence_no            Int?      ✅ Explicit field
  vendor_id              String    ✅ Explicit field
  vendor_name            String?   ✅ Explicit field
  contact_person         String?   ✅ Explicit field
  contact_phone          String?   ✅ Explicit field
  contact_email          String?   ✅ Explicit field
  pricelist_id           String?   ✅ Explicit field
  pricelist_name         String?   ✅ Explicit field
  info                   Json?     📦 Expected: token, sentAt, accessedAt, submittedAt, expiresAt, status, deliveryStatus, remindersSent, lastReminderSent, ipAddress, userAgent
  dimension              Json?     📊 Not used for invitations
  doc_version            Decimal   ✅ Version control
  created_at             DateTime? ✅ Audit field
  created_by_id          String?   ✅ Audit field
  updated_at             DateTime? ✅ Audit field
  updated_by_id          String?   ✅ Audit field
  deleted_at             DateTime? ✅ Soft delete
  deleted_by_id          String?   ✅ Audit field
}
```

#### Field Mapping Table
| TypeScript Field | Prisma Field | Status | Storage Location |
|-----------------|--------------|--------|------------------|
| `id` | `id` | ✅ | Explicit column |
| `vendorId` | `vendor_id` | ✅ | Explicit column |
| `token` | - | ❌ | **MISSING** - Critical for token-based authentication |
| `pricelistId` | `pricelist_id` | ✅ | Explicit column |
| `campaignId` | `request_for_pricing_id` | ✅ | Explicit column |
| `sentAt` | - | 📦 | `info` JSON |
| `accessedAt` | - | 📦 | `info` JSON |
| `submittedAt` | - | 📦 | `info` JSON |
| `expiresAt` | - | ❌ | **MISSING** - Critical for token expiration |
| `status` | - | ❌ | **MISSING** - Critical for invitation tracking |
| `deliveryStatus` | - | 📦 | `info` JSON (object) |
| `remindersSent` | - | 📦 | `info` JSON |
| `lastReminderSent` | - | 📦 | `info` JSON |
| `ipAddress` | - | 📦 | `info` JSON |
| `userAgent` | - | 📦 | `info` JSON |

#### Critical Gaps Identified
- **Token Management**: No explicit `token` field for UUID-based portal access (BR-VPP-Rule-011)
- **Token Expiration**: No `expiresAt` field for token validity tracking (BR-VPP-Rule-012)
- **Invitation Status**: No explicit `status` field for invitation state tracking (UC-VPP-006)

### 3.3 PriceCollectionCampaign

#### TypeScript Interface
```typescript
interface PriceCollectionCampaign {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  campaignType: 'one-time' | 'recurring' | 'event-based'
  selectedVendors: string[]
  selectedCategories: string[]
  scheduledStart: Date
  scheduledEnd?: Date
  recurringPattern?: RecurringPattern
  progress: CampaignProgress
  createdBy: string
  createdAt: Date
  updatedAt: Date
  settings: CampaignSettings
  template?: CampaignTemplate
}
```

#### Prisma Schema Mapping
```prisma
model tb_request_for_pricing {
  id                    String    ✅ Explicit field
  pricelist_template_id String    ✅ Explicit field (maps to template.id)
  start_date            DateTime? ✅ Explicit field (maps to scheduledStart)
  end_date              DateTime? ✅ Explicit field (maps to scheduledEnd)
  info                  Json?     📦 Expected: name, description, status, campaignType, selectedVendors, selectedCategories, recurringPattern, progress, settings
  dimension             Json?     📊 Expected: progress metrics, analytics
  doc_version           Decimal   ✅ Version control
  created_at            DateTime? ✅ Audit field
  created_by_id         String?   ✅ Audit field (maps to createdBy)
  updated_at            DateTime? ✅ Audit field
  updated_by_id         String?   ✅ Audit field
  deleted_at            DateTime? ✅ Soft delete
  deleted_by_id         String?   ✅ Audit field
}
```

#### Field Mapping Table
| TypeScript Field | Prisma Field | Status | Storage Location |
|-----------------|--------------|--------|------------------|
| `id` | `id` | ✅ | Explicit column |
| `name` | - | ❌ | **MISSING** - Should be explicit for searchability |
| `description` | - | 📦 | `info` JSON |
| `status` | - | ❌ | **MISSING** - Critical for campaign lifecycle |
| `campaignType` | - | ❌ | **MISSING** - Critical for campaign classification |
| `selectedVendors` | - | 📦 | `info` JSON (array) |
| `selectedCategories` | - | 📦 | `info` JSON (array) |
| `scheduledStart` | `start_date` | ✅ | Explicit column |
| `scheduledEnd` | `end_date` | ✅ | Explicit column |
| `recurringPattern` | - | 📦 | `info` JSON (RecurringPattern object) |
| `progress` | - | 📊 | `dimension` JSON (CampaignProgress object) |
| `createdBy` | `created_by_id` | ✅ | Explicit column |
| `createdAt` | `created_at` | ✅ | Explicit column |
| `updatedAt` | `updated_at` | ✅ | Explicit column |
| `settings` | - | 📦 | `info` JSON (CampaignSettings object) |
| `template` | `pricelist_template_id` | ✅ | Foreign key reference |

#### Critical Gaps Identified
- **Campaign Name**: No explicit `name` field for campaign identification (should be searchable)
- **Campaign Status**: No `status` field for lifecycle management (draft/active/paused/completed/cancelled)
- **Campaign Type**: No `campaignType` field for classification (one-time/recurring/event-based)

### 3.4 VendorPricelist

#### TypeScript Interface
```typescript
interface VendorPricelist {
  id: string
  pricelistNumber: string           // Display-friendly (e.g., "PL-2501-0001")
  name?: string
  description?: string
  vendorId: string
  campaignId: string
  templateId: string
  invitationId: string
  currency: string
  status: 'draft' | 'submitted'     // NO approval workflow - submitted = active
  items: PricelistItem[]            // Array of items
  effectiveStartDate: Date
  effectiveEndDate: Date | null     // null = open-ended
  submittedAt?: Date
  createdAt: Date
  updatedAt: Date
  completionPercentage: number
  qualityScore: number
  totalItems: number
  completedItems: number
  lastAutoSave: Date
  submissionNotes?: string
  internalNotes?: string
  version: number
  parentPricelistId?: string        // For versioning
}
// Note: Pricelists created in DRAFT status, become SUBMITTED (active) when vendor submits
// Same behavior as Excel-imported pricelists
```

#### Prisma Schema Mapping
```prisma
model tb_pricelist {
  id            String    ✅ Explicit field
  pricelist_no  String    ✅ Explicit field (maps to pricelistNumber)
  name          String?   ✅ Explicit field
  url_token     String?   ✅ Explicit field (for token-based access)
  vendor_id     String?   ✅ Explicit field
  vendor_name   String?   ✅ Explicit field
  from_date     DateTime? ✅ Explicit field (maps to effectiveStartDate)
  to_date       DateTime? ✅ Explicit field (maps to effectiveEndDate, null = open-ended)
  currency_id   String?   ✅ Explicit field
  currency_name String?   ✅ Explicit field (maps to currency)
  is_active     Boolean?  ✅ Explicit field (maps to status)
  description   String?   ✅ Explicit field
  note          String?   ✅ Explicit field
  info          Json?     📦 Expected: campaignId, templateId, invitationId, submittedAt, completionPercentage, qualityScore, totalItems, completedItems, lastAutoSave, submissionNotes, internalNotes, parentPricelistId
  dimension     Json?     📊 Expected: quality metrics, completion analytics
  doc_version   Decimal   ✅ Version control (maps to version)
  created_at    DateTime? ✅ Audit field
  created_by_id String?   ✅ Audit field
  updated_at    DateTime? ✅ Audit field
  updated_by_id String?   ✅ Audit field
  deleted_at    DateTime? ✅ Soft delete
  deleted_by_id String?   ✅ Audit field
}
```

#### Field Mapping Table
| TypeScript Field | Prisma Field | Status | Storage Location |
|-----------------|--------------|--------|------------------|
| `id` | `id` | ✅ | Explicit column |
| `pricelistNumber` | `pricelist_no` | ✅ | Explicit column |
| `name` | `name` | ✅ | Explicit column |
| `description` | `description` | ✅ | Explicit column |
| `vendorId` | `vendor_id` | ✅ | Explicit column |
| `campaignId` | - | 📦 | `info` JSON |
| `templateId` | - | 📦 | `info` JSON |
| `invitationId` | - | 📦 | `info` JSON |
| `currency` | `currency_name` | ✅ | Explicit column |
| `status` | `is_active` | ⚠️ | Partial (boolean vs enum) |
| `items` | - | ✅ | Separate `tb_pricelist_detail` table |
| `effectiveStartDate` | `from_date` | ✅ | Explicit column |
| `effectiveEndDate` | `to_date` | ✅ | Explicit column (null supported) |
| `submittedAt` | - | 📦 | `info` JSON |
| `createdAt` | `created_at` | ✅ | Explicit column |
| `updatedAt` | `updated_at` | ✅ | Explicit column |
| `completionPercentage` | - | 📦 | `info` JSON |
| `qualityScore` | - | 📦 | `info` JSON |
| `totalItems` | - | 📦 | `info` JSON |
| `completedItems` | - | 📦 | `info` JSON |
| `lastAutoSave` | - | 📦 | `info` JSON |
| `submissionNotes` | - | 📦 | `info` JSON |
| `internalNotes` | `note` | ✅ | Explicit column |
| `version` | `doc_version` | ✅ | Explicit column |
| `parentPricelistId` | - | 📦 | `info` JSON |

#### Notes
- **Token Field**: Prisma has `url_token` field for token-based access, not in TypeScript interface
- **Status Mapping**: TypeScript uses enum ('draft' | 'submitted'), Prisma uses boolean `is_active`
- **No Approval Workflow**: Pricelists go from draft → submitted (active). Same as Excel-imported pricelists.

### 3.5 PricelistItem

#### TypeScript Interface
```typescript
interface PricelistItem {
  id: string
  productId: string
  productCode: string
  productName: string
  productDescription?: string
  category: string
  subcategory?: string
  pricing: MOQPricing[]              // Array of MOQ tiers
  currency: string
  leadTime?: number
  taxRate?: number
  notes?: string
  customFieldValues?: Record<string, any>
  status: 'draft' | 'submitted'      // NO approval status
  qualityScore?: number
  validationErrors?: ValidationError[]
  lastModified: Date
  certifications?: string[]
  isPreferred?: boolean
}
```

#### Prisma Schema Mapping
```prisma
model tb_pricelist_detail {
  id                String    ✅ Explicit field
  pricelist_id      String    ✅ Explicit field (parent relationship)
  sequence_no       Int?      ✅ Explicit field
  product_id        String    ✅ Explicit field
  product_name      String?   ✅ Explicit field
  unit_id           String?   ✅ Explicit field
  unit_name         String?   ✅ Explicit field
  tax_profile_id    String?   ✅ Explicit field
  tax_profile_name  String?   ✅ Explicit field
  tax_rate          Decimal?  ✅ Explicit field
  price             Decimal?  ✅ Explicit field (single price only)
  price_without_vat Decimal?  ✅ Explicit field
  price_with_vat    Decimal?  ✅ Explicit field
  is_active         Boolean?  ✅ Explicit field
  description       String?   ✅ Explicit field (maps to productDescription)
  note              String?   ✅ Explicit field (maps to notes)
  info              Json?     📦 Expected: productCode, category, subcategory, pricing (MOQPricing[]), leadTime, customFieldValues, qualityScore, validationErrors, certifications, isPreferred
  dimension         Json?     📊 Expected: quality metrics, validation analytics
  doc_version       Decimal   ✅ Version control
  created_at        DateTime? ✅ Audit field
  created_by_id     String?   ✅ Audit field
  updated_at        DateTime? ✅ Audit field (maps to lastModified)
  updated_by_id     String?   ✅ Audit field
  deleted_at        DateTime? ✅ Soft delete
  deleted_by_id     String?   ✅ Audit field
}
```

#### Field Mapping Table
| TypeScript Field | Prisma Field | Status | Storage Location |
|-----------------|--------------|--------|------------------|
| `id` | `id` | ✅ | Explicit column |
| `productId` | `product_id` | ✅ | Explicit column |
| `productCode` | - | 📦 | `info` JSON |
| `productName` | `product_name` | ✅ | Explicit column |
| `productDescription` | `description` | ✅ | Explicit column |
| `category` | - | 📦 | `info` JSON |
| `subcategory` | - | 📦 | `info` JSON |
| `pricing` | - | ❌ | **MISSING** - MOQ tiers array not supported |
| `currency` | - | ⚠️ | Inherited from parent `tb_pricelist` |
| `leadTime` | - | 📦 | `info` JSON |
| `taxRate` | `tax_rate` | ✅ | Explicit column |
| `notes` | `note` | ✅ | Explicit column |
| `customFieldValues` | - | 📦 | `info` JSON (object) |
| `status` | `is_active` | ⚠️ | Partial (boolean vs enum) |
| `qualityScore` | - | 📦 | `info` JSON |
| `validationErrors` | - | 📦 | `info` JSON (array) |
| `lastModified` | `updated_at` | ✅ | Explicit column |
| `certifications` | - | 📦 | `info` JSON (array) |
| `isPreferred` | - | 📦 | `info` JSON |

#### Critical Gaps Identified
- **MOQ Pricing Array**: No support for multiple pricing tiers per product (BR-VPP-Rule-028: "Maximum 5 MOQ tiers per product")
- **Single Price**: Prisma only supports single `price`, `price_without_vat`, `price_with_vat` fields
- **Currency**: No explicit currency field at item level (inherited from parent pricelist)

### 3.6 MOQPricing

#### TypeScript Interface
```typescript
interface MOQPricing {
  id: string
  moq: number                       // Minimum Order Quantity
  unit: string
  unitPrice: number
  conversionFactor?: number
  leadTime?: number
  focQuantity?: number              // Free of Charge quantity
  focUnit?: string                  // Unit for FOC
  notes?: string
  validFrom?: Date
  validTo?: Date
}
```

#### Prisma Schema Mapping
**No dedicated table** - Expected to be stored in `tb_pricelist_detail.info` JSON field as an array.

#### Expected JSON Structure
```json
{
  "pricing": [
    {
      "id": "uuid",
      "moq": 100,
      "unit": "pcs",
      "unitPrice": 12.50,
      "conversionFactor": 1.0,
      "leadTime": 7,
      "focQuantity": 10,
      "focUnit": "pcs",
      "notes": "Bulk discount tier",
      "validFrom": "2024-01-01T00:00:00Z",
      "validTo": "2024-12-31T23:59:59Z"
    },
    {
      "id": "uuid",
      "moq": 500,
      "unit": "pcs",
      "unitPrice": 11.00,
      "leadTime": 5
    }
  ]
}
```

#### Business Rules Applied
- **BR-VPP-Rule-028**: Maximum 5 MOQ tiers per product
- **BR-VPP-Rule-029**: MOQ quantities must be in ascending order
- **BR-VPP-Rule-030**: All prices must be positive numbers

### 3.7 PricelistTemplate

#### TypeScript Interface
```typescript
interface PricelistTemplate {
  id: string
  name: string
  description?: string
  productSelection: ProductSelection
  customFields: CustomField[]
  instructions: string
  validityPeriod: number              // days
  status: 'draft' | 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
  createdBy: string
  allowMultiMOQ: boolean
  requireLeadTime: boolean
  defaultCurrency: string
  supportedCurrencies: string[]
  maxItemsPerSubmission?: number
  notificationSettings: {
    sendReminders: boolean
    reminderDays: number[]
    escalationDays: number
  }
}
```

#### Prisma Schema Mapping
```prisma
model tb_pricelist_template {
  id                String    ✅ Explicit field
  template_no       String    ✅ Explicit field
  name              String    ✅ Explicit field
  description       String?   ✅ Explicit field
  from_date         DateTime? ✅ Explicit field
  to_date           DateTime? ✅ Explicit field
  currency_id       String?   ✅ Explicit field
  currency_name     String?   ✅ Explicit field (maps to defaultCurrency)
  is_active         Boolean?  ✅ Explicit field (maps to status)
  note              String?   ✅ Explicit field
  info              Json?     📦 Expected: productSelection, customFields, instructions, validityPeriod, allowMultiMOQ, requireLeadTime, supportedCurrencies, maxItemsPerSubmission, notificationSettings
  dimension         Json?     📊 Not used for templates
  doc_version       Decimal   ✅ Version control
  created_at        DateTime? ✅ Audit field
  created_by_id     String?   ✅ Audit field (maps to createdBy)
  updated_at        DateTime? ✅ Audit field
  updated_by_id     String?   ✅ Audit field
  deleted_at        DateTime? ✅ Soft delete
  deleted_by_id     String?   ✅ Audit field
}

model tb_pricelist_template_detail {
  id                    String    ✅ Explicit field
  pricelist_template_id String    ✅ Foreign key to parent
  sequence_no           Int?      ✅ Explicit field
  product_id            String    ✅ Explicit field
  product_name          String?   ✅ Explicit field
  array_order_unit      Json?     📦 Product instances with multiple units (ProductInstance[])
  info                  Json?     📦 Additional product configuration
  dimension             Json?     📊 Not used
  doc_version           Decimal   ✅ Version control
  created_at            DateTime? ✅ Audit field
  created_by_id         String?   ✅ Audit field
  updated_at            DateTime? ✅ Audit field
  updated_by_id         String?   ✅ Audit field
  deleted_at            DateTime? ✅ Soft delete
  deleted_by_id         String?   ✅ Audit field
}
```

#### Field Mapping Table
| TypeScript Field | Prisma Field | Status | Storage Location |
|-----------------|--------------|--------|------------------|
| `id` | `id` | ✅ | Explicit column |
| `name` | `name` | ✅ | Explicit column |
| `description` | `description` | ✅ | Explicit column |
| `productSelection` | - | 📦 | `info` JSON (ProductSelection object) |
| `customFields` | - | 📦 | `info` JSON (CustomField[] array) |
| `instructions` | - | 📦 | `info` JSON |
| `validityPeriod` | - | 📦 | `info` JSON |
| `status` | `is_active` | ⚠️ | Partial (boolean vs enum) |
| `createdAt` | `created_at` | ✅ | Explicit column |
| `updatedAt` | `updated_at` | ✅ | Explicit column |
| `createdBy` | `created_by_id` | ✅ | Explicit column |
| `allowMultiMOQ` | - | 📦 | `info` JSON |
| `requireLeadTime` | - | 📦 | `info` JSON |
| `defaultCurrency` | `currency_name` | ✅ | Explicit column |
| `supportedCurrencies` | - | 📦 | `info` JSON (array) |
| `maxItemsPerSubmission` | - | 📦 | `info` JSON |
| `notificationSettings` | - | 📦 | `info` JSON (object) |

#### Template Detail - ProductInstance Mapping
```json
// tb_pricelist_template_detail.array_order_unit expected structure
[
  {
    "unit_id": "uuid",
    "unit_name": "pcs"
  },
  {
    "unit_id": "uuid",
    "unit_name": "Box/12"
  }
]
```

### 3.8 ProductInstance

#### TypeScript Interface
```typescript
interface ProductInstance {
  id: string                        // Unique instance ID (e.g., "beef-ribeye-kg")
  productId: string                 // Original product ID
  orderUnit: string                 // Selected order unit
  displayName?: string              // Optional custom name
}
```

#### Prisma Schema Mapping
**No dedicated table** - Stored in `tb_pricelist_template_detail.array_order_unit` JSON field.

#### Expected JSON Structure
```json
{
  "array_order_unit": [
    {
      "unit_id": "uuid-for-kg",
      "unit_name": "kg",
      "display_name": "Beef Ribeye - Kilogram"
    },
    {
      "unit_id": "uuid-for-lb",
      "unit_name": "lb",
      "display_name": "Beef Ribeye - Pound"
    }
  ]
}
```

---

## 4. Field Mapping Analysis

### 4.1 Summary of Gaps

#### Critical Gaps (Security & Functionality)
| Entity | Missing Fields | Impact | Priority |
|--------|---------------|--------|----------|
| VendorInvitation | `token`, `expiresAt`, `status` | Token-based authentication broken | 🔴 Critical |
| PriceCollectionCampaign | `name`, `status`, `campaignType` | Campaign management broken | 🔴 Critical |
| PricelistItem | MOQ pricing tiers array | Multi-tier pricing not supported | 🔴 Critical |

#### Important Gaps (Business Logic)
| Entity | Missing Fields | Impact | Priority |
|--------|---------------|--------|----------|
| Vendor | Contact info, performance metrics | Limited vendor management | 🟡 High |
| VendorPricelist | Progress tracking, quality scoring | No quality management | 🟡 High |
| PricelistTemplate | Configuration settings | Limited template flexibility | 🟡 Medium |

### 4.2 JSON Field Usage Pattern

#### `info` Field (Business Data)
Stores extended business data that changes frequently or varies by use case:
- Campaign settings and configuration
- Vendor invitation details (token, timestamps, status)
- MOQ pricing tiers array
- Custom field values
- Validation errors
- Submission notes

#### `dimension` Field (Analytical Data)
Stores dimensional/analytical data for reporting and metrics:
- Vendor performance metrics (VendorMetrics)
- Campaign progress metrics (CampaignProgress)
- Quality scores and analytics
- Engagement statistics

### 4.3 Recommended Explicit Fields

For critical business operations, consider adding explicit columns for:
1. **VendorInvitation**:
   - `token` (VARCHAR/UUID) - Portal access token
   - `expires_at` (TIMESTAMP) - Token expiration
   - `status` (VARCHAR/ENUM) - Invitation status

2. **Campaign (tb_request_for_pricing)**:
   - `name` (VARCHAR) - Campaign name (searchable)
   - `status` (VARCHAR/ENUM) - Lifecycle status
   - `campaign_type` (VARCHAR/ENUM) - Type classification

3. **PricelistItem (tb_pricelist_detail)**:
   - Consider separate `tb_pricelist_detail_moq_tier` table for MOQ pricing

---

## 5. JSON Field Structures

### 5.1 Vendor - `info` Field
```json
{
  "contactEmail": "vendor@example.com",
  "contactPhone": "+1-234-567-8900",
  "preferredCurrency": "USD",
  "paymentTerms": "Net 30",
  "companyRegistration": "REG123456",
  "taxId": "TAX-987654",
  "website": "https://vendor.example.com",
  "certifications": ['ISO9001', 'HACCP', 'Organic'],
  "languages": ['en', 'es', 'fr']
}
```

### 5.2 Vendor - `dimension` Field
```json
{
  "performanceMetrics": {
    "responseRate": 95.5,
    "averageResponseTime": 24.5,
    "qualityScore": 87.3,
    "onTimeDeliveryRate": 92.1,
    "totalCampaigns": 15,
    "completedSubmissions": 14,
    "averageCompletionTime": 48.2,
    "lastSubmissionDate": "2024-08-22T10:30:00Z"
  }
}
```

### 5.3 VendorInvitation (tb_request_for_pricing_detail) - `info` Field
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "sentAt": "2024-08-15T09:00:00Z",
  "accessedAt": "2024-08-15T14:30:00Z",
  "submittedAt": "2024-08-20T16:45:00Z",
  "expiresAt": "2024-09-15T23:59:59Z",
  "status": "submitted",
  "deliveryStatus": {
    "attempts": 1,
    "lastAttempt": "2024-08-15T09:00:00Z",
    "failureReason": null
  },
  "remindersSent": 2,
  "lastReminderSent": "2024-08-18T09:00:00Z",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}
```

### 5.4 PriceCollectionCampaign (tb_request_for_pricing) - `info` Field
```json
{
  "name": "Q1 2024 Kitchen Equipment Pricing",
  "description": "Quarterly price collection for kitchen equipment",
  "status": "active",
  "campaignType": "recurring",
  "selectedVendors": ['vendor-001', 'vendor-002', 'vendor-003'],
  "selectedCategories": ['Kitchen Equipment', 'Appliances'],
  "recurringPattern": {
    "frequency": "quarterly",
    "interval": 1,
    "endDate": "2024-12-31T23:59:59Z"
  },
  "settings": {
    "portalAccessDuration": 30,
    "allowedSubmissionMethods": ['manual', 'upload'],
    "autoReminders": true,
    "reminderSchedule": {
      "enabled": true,
      "intervals": [7, 3, 1],
      "escalationRules": []
    },
    "emailTemplate": "quarterly-pricing-request",
    "customInstructions": "Please include shipping costs",
    "priority": "high"
  }
}
```

### 5.5 PriceCollectionCampaign (tb_request_for_pricing) - `dimension` Field
```json
{
  "progress": {
    "totalVendors": 3,
    "invitedVendors": 3,
    "respondedVendors": 2,
    "completedSubmissions": 1,
    "pendingSubmissions": 1,
    "failedSubmissions": 0,
    "completionRate": 67,
    "responseRate": 80,
    "averageResponseTime": 24,
    "lastUpdated": "2024-08-22T10:00:00Z"
  }
}
```

### 5.6 VendorPricelist (tb_pricelist) - `info` Field
```json
{
  "campaignId": "campaign-001",
  "templateId": "template-001",
  "invitationId": "invitation-001",
  "submittedAt": "2024-08-20T16:45:00Z",
  "completionPercentage": 100,
  "qualityScore": 87.5,
  "totalItems": 45,
  "completedItems": 45,
  "lastAutoSave": "2024-08-20T16:40:00Z",
  "submissionNotes": "All pricing updated for Q2 2024",
  "internalNotes": "Staff notes (not visible to vendor)",
  "parentPricelistId": null
}
```
**Note**: No approval fields (approvedAt, approvedBy). Pricelists become active on submission.

### 5.7 PricelistItem (tb_pricelist_detail) - `info` Field
```json
{
  "productCode": "KIT-001",
  "category": "Kitchen Equipment",
  "subcategory": "Cooking Appliances",
  "pricing": [
    {
      "id": "tier-001",
      "moq": 1,
      "unit": "pcs",
      "unitPrice": 1250.00,
      "leadTime": 14,
      "notes": "Standard pricing"
    },
    {
      "id": "tier-002",
      "moq": 5,
      "unit": "pcs",
      "unitPrice": 1150.00,
      "leadTime": 10,
      "focQuantity": 1,
      "focUnit": "pcs",
      "notes": "Bulk discount with 1 free unit"
    },
    {
      "id": "tier-003",
      "moq": 10,
      "unit": "pcs",
      "unitPrice": 1050.00,
      "leadTime": 7,
      "notes": "Volume pricing"
    }
  ],
  "leadTime": 14,
  "customFieldValues": {
    "warranty": "2 years",
    "certification": "UL Listed"
  },
  "qualityScore": 92.3,
  "validationErrors": [],
  "certifications": ['UL', 'NSF'],
  "isPreferred": true
}
```

### 5.8 PricelistTemplate (tb_pricelist_template) - `info` Field
```json
{
  "productSelection": {
    "categories": ['Kitchen Equipment'],
    "subcategories": ['Cooking', 'Refrigeration'],
    "itemGroups": ['Commercial Grade'],
    "specificItems": [],
    "productInstances": [
      {
        "id": "beef-ribeye-kg",
        "productId": "beef-ribeye",
        "orderUnit": "kg",
        "displayName": "Beef Ribeye - Kilogram"
      }
    ]
  },
  "customFields": [
    {
      "id": "warranty",
      "name": "Warranty Period",
      "type": "select",
      "required": true,
      "options": ['1 year', '2 years', '3 years'],
      "defaultValue": "2 years"
    }
  ],
  "instructions": "Please provide pricing for all items in the template",
  "validityPeriod": 90,
  "allowMultiMOQ": true,
  "requireLeadTime": true,
  "supportedCurrencies": ['USD', 'EUR', 'GBP'],
  "maxItemsPerSubmission": 100,
  "notificationSettings": {
    "sendReminders": true,
    "reminderDays": [7, 3, 1],
    "escalationDays": 2
  }
}
```

---

## 6. Data Relationships

### 6.1 Entity Relationship Diagram

```
tb_vendor
  │
  ├── tb_vendor_address (1:N) - Vendor addresses
  ├── tb_vendor_contact (1:N) - Vendor contacts
  │
  └── tb_request_for_pricing_detail (1:N) - Vendor invitations
        │
        ├── tb_request_for_pricing (N:1) - Campaign
        │     │
        │     └── tb_pricelist_template (N:1) - Template
        │           │
        │           └── tb_pricelist_template_detail (1:N) - Template products
        │
        └── tb_pricelist (N:1) - Vendor pricelist
              │
              └── tb_pricelist_detail (1:N) - Pricelist items
```

### 6.2 Key Relationships

#### Campaign → Invitations → Pricelists
1. **Campaign** (`tb_request_for_pricing`) created with template reference
2. **Invitations** (`tb_request_for_pricing_detail`) sent to vendors with tokens
3. **Pricelists** (`tb_pricelist`) created when vendors submit pricing
4. **Pricelist Items** (`tb_pricelist_detail`) contain product pricing

#### Template → Campaign → Vendor Submission
1. **Template** (`tb_pricelist_template`) defines required products
2. **Template Details** (`tb_pricelist_template_detail`) specify product instances with units
3. **Campaign** uses template to generate vendor invitations
4. **Vendors** submit pricelists based on template requirements

### 6.3 Foreign Key Relationships

| Child Table | Foreign Key | Parent Table | Relationship |
|-------------|-------------|--------------|--------------|
| `tb_vendor_address` | `vendor_id` | `tb_vendor` | N:1 |
| `tb_vendor_contact` | `vendor_id` | `tb_vendor` | N:1 |
| `tb_request_for_pricing` | `pricelist_template_id` | `tb_pricelist_template` | N:1 |
| `tb_request_for_pricing_detail` | `request_for_pricing_id` | `tb_request_for_pricing` | N:1 |
| `tb_request_for_pricing_detail` | `vendor_id` | `tb_vendor` | N:1 |
| `tb_request_for_pricing_detail` | `pricelist_id` | `tb_pricelist` | N:1 |
| `tb_pricelist` | `vendor_id` | `tb_vendor` | N:1 |
| `tb_pricelist_detail` | `pricelist_id` | `tb_pricelist` | N:1 |
| `tb_pricelist_detail` | `product_id` | (external) | N:1 |
| `tb_pricelist_template_detail` | `pricelist_template_id` | `tb_pricelist_template` | N:1 |
| `tb_pricelist_template_detail` | `product_id` | (external) | N:1 |

---

## 7. Appendices

### Appendix A: Data Model Comparison Summary

#### Total Interfaces Analyzed: 25

#### Mapping Status:
- **✅ Fully Mapped**: 7 interfaces (Vendor, VendorPricelist, PricelistTemplate core fields)
- **⚠️ Partially Mapped**: 6 interfaces (VendorInvitation, PriceCollectionCampaign, PricelistItem)
- **📦 JSON Storage**: 12 interfaces (stored in `info` or `dimension` fields)
- **❌ No Mapping**: 5 interfaces (MOQPricing, ProductInstance, PortalSession, ValidationError, SessionActivity)

#### Critical Gaps Requiring Attention:
1. **VendorInvitation**: Missing explicit token management fields
2. **PriceCollectionCampaign**: Missing campaign metadata (name, status, type)
3. **PricelistItem**: No support for MOQ tier arrays

### Appendix B: Source Code References

| Source File | Key Interfaces Defined |
|-------------|----------------------|
| `/app/(main)/vendor-management/types/index.ts` | Vendor, VendorInvitation, VendorPricelist, PricelistItem, MOQPricing, PricelistTemplate, ProductInstance, PortalSession |
| `/lib/types/campaign-management.ts` | PriceCollectionCampaign, RecurringPattern, CampaignProgress, CampaignSettings, CampaignTemplate |
| `/app/(main)/vendor-management/pricelists/types/PricelistEditingTypes.ts` | PricelistMOQTier, PricelistProductInstance |
| `/docs/app/data-struc/schema.prisma` | All Prisma table definitions |

### Appendix C: Business Rules Impact

| Business Rule | TypeScript Support | Prisma Support | Gap Impact |
|---------------|-------------------|----------------|------------|
| BR-VPP-Rule-011: One unique token per vendor per campaign | ✅ VendorInvitation.token | ❌ Missing field | High - Token authentication broken |
| BR-VPP-Rule-012: Token expires with campaign end date | ✅ VendorInvitation.expiresAt | ❌ Missing field | High - Security risk |
| BR-VPP-Rule-024: Token is only authentication method | ✅ PortalSession.token | ❌ No session table | High - Access control broken |
| BR-VPP-Rule-027: Auto-save every 2 minutes | ✅ VendorPricelist.lastAutoSave | 📦 info JSON | Low - Stored in JSON |
| BR-VPP-Rule-028: Maximum 5 MOQ tiers per product | ✅ MOQPricing[] | ❌ Single price only | Critical - Multi-tier pricing broken |
| BR-VPP-Rule-029: MOQ quantities ascending order | ✅ Validation logic | ❌ No tier support | Critical - Validation impossible |

### Appendix D: Glossary

| Term | Definition |
|------|------------|
| **MOQ** | Minimum Order Quantity - minimum quantity required for a pricing tier |
| **FOC** | Free of Charge - promotional quantity offered with purchase |
| **Product Instance** | Product + order unit combination (e.g., "Beef - kg" vs "Beef - lb") |
| **Campaign** | Time-bound initiative to collect pricing from vendors |
| **Token** | UUID identifier for token-based portal access (no password required) |
| **Open-ended Pricelist** | Pricelist with null end date, valid until superseded |
| **Quality Score** | Calculated score (0-100) based on completeness, accuracy, detail, timeliness |
| **Auto-save** | System saves vendor draft every 2 minutes |
| **`info` JSON field** | Flexible JSON storage for extended business data |
| **`dimension` JSON field** | Flexible JSON storage for analytical/dimensional data |

---

**Document End**

**Recommendations**:
1. **Immediate Action**: Add explicit fields for critical authentication (token, expiresAt, status) to `tb_request_for_pricing_detail`
2. **High Priority**: Add campaign metadata fields (name, status, campaignType) to `tb_request_for_pricing`
3. **Architecture Review**: Consider separate `tb_pricelist_detail_moq_tier` table for multi-tier pricing support
4. **Data Migration**: Document how to migrate existing JSON-stored data to explicit fields if schema changes are implemented

**Note**: This Data Dictionary identifies gaps between application layer (TypeScript) and database layer (Prisma) but does NOT recommend modifying the Prisma schema. Any schema changes should be planned carefully with consideration for data migration, backward compatibility, and system impact.
