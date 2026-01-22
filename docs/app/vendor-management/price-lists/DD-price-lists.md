# Data Definition: Price Lists

## Module Information
- **Module**: Vendor Management
- **Sub-module**: Price Lists
- **Version**: 3.0.0
- **Status**: Active
- **Last Updated**: 2026-01-15

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2026-01-15 | Documentation Team | Synced with current code; Added VendorPricelist interface from vendor-management/types; Updated status values (draft, submitted, approved, rejected, expired); Added MOQPricing interface; Added PricelistItem interface; Added creation method types |
| 2.1.0 | 2025-11-26 | System | Updated to reflect actual Prisma schema (tb_pricelist, tb_pricelist_detail); Added proposed fields section highlighting deviations from current database |
| 2.0.0 | 2025-11-26 | System | Complete rewrite to match BR v2.0.0 and actual code implementation |
| 1.2.0 | 2025-11-18 | Documentation Team | Previous version with vendor portal UI specifications |
| 1.1.0 | 2025-11-17 | Documentation Team | Added effective date range per user clarification |
| 1.0.0 | 2025-11-15 | Documentation Team | Initial DD document |

**Note**: This document describes data structures based on the Prisma schema (`docs/app/data-struc/schema.prisma`). Proposed fields not yet in the database are highlighted.

---

## Overview

The Price Lists module manages vendor pricing information including product prices, effective dates, and tax configurations. Price lists are created by procurement staff and used during procurement processes to determine product costs.

### Key Features
- Price list viewing and management
- Price list creation with line items
- Tax profile integration per item
- Status management via `is_active` flag
- Price list duplication
- Export functionality
- Search and filtering

---

## Entity Relationship Overview

```
tb_vendor (1) ──── (N) tb_pricelist
tb_pricelist (1) ──── (N) tb_pricelist_detail
tb_pricelist_detail (N) ──── (1) tb_product
tb_pricelist_detail (N) ──── (1) tb_unit
tb_currency (1) ──── (N) tb_pricelist
```

---

## Core Entities (Database Schema)

### 1. tb_pricelist

**Purpose**: Stores price list header information including vendor reference, currency, and validity period.

**Database Table**: `tb_pricelist`

#### Current Database Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, auto-generated | Unique identifier |
| `pricelist_no` | VARCHAR | UNIQUE, NOT NULL | Price list reference number |
| `name` | VARCHAR | UNIQUE | Display name of price list |
| `url_token` | VARCHAR | | Token for external access |
| `vendor_id` | UUID | FK → tb_vendor | Associated vendor ID |
| `vendor_name` | VARCHAR | | Denormalized vendor name |
| `from_date` | TIMESTAMPTZ | | Start of validity period |
| `to_date` | TIMESTAMPTZ | | End of validity period |
| `currency_id` | UUID | FK → tb_currency | Currency reference |
| `currency_name` | VARCHAR | | Denormalized currency name |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status flag |
| `description` | VARCHAR | | Description of price list |
| `note` | VARCHAR | | Additional notes |
| `info` | JSON | | Extended information |
| `dimension` | JSON | | Dimensional data |
| `doc_version` | DECIMAL | DEFAULT 0 | Document version number |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `created_by_id` | UUID | | Creator user ID |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | Last updater user ID |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### 🔶 PROPOSED: Additional Fields (Not in Current Database)

The following fields are used in the UI/mock data but **NOT YET** in the database schema:

| Field Name | Proposed Type | Purpose | Priority |
|-----------|---------------|---------|----------|
| `status` | ENUM (draft, pending, active, expired) | Workflow status management | **HIGH** |
| `approved_by_id` | UUID | Approver user reference | MEDIUM |
| `approved_at` | TIMESTAMPTZ | Approval timestamp | MEDIUM |
| `total_items` | INT | Computed count of line items | LOW (can be computed) |
| `volume_discounts` | JSON | Volume-based discount rules | MEDIUM |

> **Note**: Currently, the database uses `is_active` boolean. The UI implements status (draft, pending, active, expired) in mock data. A `status` enum field is recommended for full workflow support.

#### Database Indexes
- `pricelist_name_u` on `name` field

#### Relations
- `tb_vendor` → vendor_id
- `tb_currency` → currency_id
- `tb_pricelist_detail[]` → child line items

---

### 2. tb_pricelist_detail

**Purpose**: Stores individual product pricing information within a price list.

**Database Table**: `tb_pricelist_detail`

#### Current Database Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, auto-generated | Unique identifier |
| `pricelist_id` | UUID | NOT NULL, FK → tb_pricelist | Parent price list ID |
| `sequence_no` | INT | DEFAULT 1 | Line item sequence number |
| `product_id` | UUID | NOT NULL, FK → tb_product | Product reference |
| `product_name` | VARCHAR | | Denormalized product name |
| `unit_id` | UUID | FK → tb_unit | Unit of measure reference |
| `unit_name` | VARCHAR | | Denormalized unit name |
| `tax_profile_id` | UUID | | Tax profile reference |
| `tax_profile_name` | VARCHAR | | Denormalized tax profile name |
| `tax_rate` | DECIMAL(15,5) | | Tax rate percentage |
| `price` | DECIMAL(20,5) | | Base unit price |
| `price_without_vat` | DECIMAL(20,5) | | Price excluding VAT |
| `price_with_vat` | DECIMAL(20,5) | | Price including VAT |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `description` | VARCHAR | | Item description |
| `note` | VARCHAR | | Item notes |
| `info` | JSON | | Extended information |
| `dimension` | JSON | | Dimensional data |
| `doc_version` | DECIMAL | DEFAULT 0 | Document version number |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `created_by_id` | UUID | | Creator user ID |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | Last updater user ID |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### 🔶 PROPOSED: Additional Fields (Not in Current Database)

The following fields are used in the UI/mock data but **NOT YET** in the database schema:

| Field Name | Proposed Type | Purpose | Priority |
|-----------|---------------|---------|----------|
| `minimum_order_quantity` | DECIMAL(20,5) | MOQ for this price tier | **HIGH** |
| `lead_time_days` | INT | Lead time in days | **HIGH** |
| `is_foc` | BOOLEAN | Free of charge flag | MEDIUM |
| `is_preferred_vendor` | BOOLEAN | Preferred vendor indicator | LOW |

> **Note**: The `info` JSON field could potentially store MOQ and lead time data, but explicit columns are recommended for query performance and data integrity.

#### Relations
- `tb_pricelist` → pricelist_id (parent)
- `tb_product` → product_id
- `tb_unit` → unit_id
- `tb_purchase_request_detail[]` → referenced by purchase requests

---

### 3. 🔶 PROPOSED: tb_pricelist_discount (Not in Current Database)

**Purpose**: Stores quantity-based discount tiers for price list items.

> **Note**: This entity exists in mock data but has NO corresponding database table. Implementation required for volume discount functionality.

#### Proposed Schema

```prisma
model tb_pricelist_discount {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  pricelist_detail_id String   @db.Uuid
  min_quantity        Decimal  @db.Decimal(20, 5)
  discount_type       enum_discount_type  // percentage, fixed_amount
  discount_value      Decimal  @db.Decimal(20, 5)
  description         String?  @db.VarChar
  is_active           Boolean  @default(true)

  created_at          DateTime? @default(now()) @db.Timestamptz(6)
  created_by_id       String?   @db.Uuid

  tb_pricelist_detail tb_pricelist_detail @relation(fields: [pricelist_detail_id], references: [id])

  @@map("tb_pricelist_discount")
}

enum enum_discount_type {
  percentage
  fixed_amount
}
```

---

## Status Management

### Current Implementation (Database)

The database uses a simple boolean `is_active` field:

| is_active | Meaning |
|-----------|---------|
| `true` | Price list is active and can be used |
| `false` | Price list is inactive/disabled |

### 🔶 PROPOSED: Status Enum

For full workflow support matching the UI implementation:

```prisma
enum enum_pricelist_status {
  draft
  submitted
  approved
  rejected
  expired
}
```

| Status | Description | UI Color Code |
|--------|-------------|---------------|
| `draft` | Initial creation, not finalized | Gray (bg-gray-100 text-gray-800) |
| `submitted` | Submitted for review | Yellow (bg-yellow-100 text-yellow-800) |
| `approved` | Approved and in use | Green (bg-green-100 text-green-800) |
| `rejected` | Rejected with reason | Red (bg-red-100 text-red-800) |
| `expired` | Past effective end date | Red (bg-red-100 text-red-800) |

> **Legacy Support**: UI code also supports `active` (maps to `approved`) and `pending` (maps to `submitted`) for backwards compatibility.

---

## Field Mapping: Database ↔ UI

### Price List Header

| Database Field | UI Field | Notes |
|----------------|----------|-------|
| `id` | `id` | Direct mapping |
| `pricelist_no` | `priceListCode` | Reference number |
| `name` | `priceListName` | Display name |
| `vendor_id` | `vendorId` | Foreign key |
| `vendor_name` | `vendorName` | Denormalized |
| `from_date` | `effectiveStartDate` | Validity start |
| `to_date` | `effectiveEndDate` | Validity end |
| `currency_id` | `currencyId` | Foreign key |
| `currency_name` | `currency` / `currencyCode` | Denormalized |
| `is_active` | `status` (derived) | 🔶 Status logic needed |
| `description` | `description` | Direct mapping |
| `note` | `notes` | Direct mapping |
| `created_by_id` | `createdBy` | Creator reference |
| *(not in DB)* | `approvedBy` | 🔶 PROPOSED |
| *(not in DB)* | `approvedAt` | 🔶 PROPOSED |
| *(not in DB)* | `status` | 🔶 PROPOSED enum |

### Price List Detail

| Database Field | UI Field | Notes |
|----------------|----------|-------|
| `id` | `id` | Direct mapping |
| `pricelist_id` | `priceListId` | Foreign key |
| `product_id` | `productId` | Foreign key |
| `product_name` | `itemName` | Denormalized |
| `unit_id` | `unitId` | Foreign key |
| `unit_name` | `unit` | Denormalized |
| `price` | `unitPrice.amount` | Base price |
| `price_with_vat` | *(computed)* | Price + tax |
| `is_active` | `isActive` | Direct mapping |
| `note` | `notes` | Direct mapping |
| *(not in DB)* | `minimumOrderQuantity` | 🔶 PROPOSED |
| *(not in DB)* | `leadTimeDays` | 🔶 PROPOSED |
| *(not in DB)* | `itemDiscounts[]` | 🔶 PROPOSED table |

---

## Data Validation Rules

### Price List Header Validation

| Rule ID | Rule | Database Constraint | Error Message |
|---------|------|---------------------|---------------|
| VAL-PL-001 | `name` is required | NOT NULL (implicit via UNIQUE) | "Price list name is required" |
| VAL-PL-002 | `vendor_id` must be valid | FK constraint | "Vendor is required" |
| VAL-PL-003 | `currency_id` must be valid | FK constraint | "Currency is required" |
| VAL-PL-004 | `from_date` should be provided | Application level | "Start date is required" |
| VAL-PL-005 | `to_date > from_date` when provided | Application level | "End date must be after start date" |
| VAL-PL-006 | `pricelist_no` must be unique | UNIQUE constraint | "Price list number already exists" |

### Line Item Validation

| Rule ID | Rule | Database Constraint | Error Message |
|---------|------|---------------------|---------------|
| VAL-ITM-001 | `product_id` is required | NOT NULL, FK constraint | "Product is required" |
| VAL-ITM-002 | `pricelist_id` is required | NOT NULL, FK constraint | "Price list reference required" |
| VAL-ITM-003 | `price` must be positive | Application level | "Unit price must be positive" |
| VAL-ITM-004 | `unit_id` should be specified | Application level | "Unit is required" |

---

## Integration Points

### 1. Vendor Directory
- **Table**: `tb_vendor`
- **Direction**: Inbound
- **Purpose**: Price lists created for specific vendors
- **Key Fields**: `vendor_id`, `vendor_name`

### 2. Product Catalog
- **Table**: `tb_product`
- **Direction**: Inbound
- **Purpose**: Line items reference products
- **Key Fields**: `product_id`, `product_name`

### 3. Unit of Measure
- **Table**: `tb_unit`
- **Direction**: Inbound
- **Purpose**: Unit reference for pricing
- **Key Fields**: `unit_id`, `unit_name`

### 4. Currency
- **Table**: `tb_currency`
- **Direction**: Inbound
- **Purpose**: Currency for price list
- **Key Fields**: `currency_id`, `currency_name`

### 5. Purchase Request
- **Table**: `tb_purchase_request_detail`
- **Direction**: Outbound
- **Purpose**: Price list items referenced in purchase requests
- **Key Fields**: `pricelist_detail_id`, `pricelist_no`, `pricelist_price`

---

## UI Data Mapping

### List Page
- **Route**: `/vendor-management/pricelists`
- **Data Source**: Array of tb_pricelist with computed status
- **Display Fields**: pricelist_no, name, vendor_name, status (derived), validity period, item count

### Detail Page
- **Route**: `/vendor-management/pricelists/[id]`
- **Data Source**: Single tb_pricelist with tb_pricelist_detail[]
- **Display Fields**: Header info, line items with pricing

### Add Page
- **Route**: `/vendor-management/pricelists/add`
- **Form Fields**: pricelist_no (auto), vendor_id, currency_id, from_date, to_date, note
- **Line Item Fields**: product_id, unit_id, price, tax_profile_id, note

---

## Migration Recommendations

### Priority 1 (High) - Required for Full Functionality

1. **Add `status` enum to tb_pricelist**
   ```sql
   CREATE TYPE enum_pricelist_status AS ENUM ('draft', 'pending', 'active', 'expired');
   ALTER TABLE tb_pricelist ADD COLUMN status enum_pricelist_status DEFAULT 'draft';
   ```

2. **Add MOQ and Lead Time to tb_pricelist_detail**
   ```sql
   ALTER TABLE tb_pricelist_detail
     ADD COLUMN minimum_order_quantity DECIMAL(20,5),
     ADD COLUMN lead_time_days INT;
   ```

### Priority 2 (Medium) - Enhanced Workflow

3. **Add approval fields to tb_pricelist**
   ```sql
   ALTER TABLE tb_pricelist
     ADD COLUMN approved_by_id UUID,
     ADD COLUMN approved_at TIMESTAMPTZ;
   ```

### Priority 3 (Low) - Volume Discounts

4. **Create tb_pricelist_discount table** (see proposed schema above)

---

## Related Documents

- [BR-price-lists.md](./BR-price-lists.md) - Business Requirements v2.0.0
- [FD-price-lists.md](./FD-price-lists.md) - Flow Diagrams
- [TS-price-lists.md](./TS-price-lists.md) - Technical Specification
- [UC-price-lists.md](./UC-price-lists.md) - Use Cases
- [VAL-price-lists.md](./VAL-price-lists.md) - Validations
- [schema.prisma](../../data-struc/schema.prisma) - Database Schema

---

**End of Data Definition Document**
