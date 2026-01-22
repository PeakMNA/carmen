# Data Definition: Pricelist Templates

## Module Information
- **Module**: Vendor Management
- **Sub-module**: Pricelist Templates
- **Version**: 3.0.0
- **Status**: Active
- **Last Updated**: 2025-01-15
- **Mermaid Compatibility**: 8.8.2+

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code implementation; Added PricelistTemplate interface fields (allowMultiMOQ, requireLeadTime, defaultCurrency, supportedCurrencies, maxItemsPerSubmission, notificationSettings); Updated to use validityPeriod instead of effective dates; Added ProductSelection interface |
| 2.0.0 | 2025-11-25 | Documentation Team | Simplified to align with BR-pricelist-templates.md; Removed reminder/notification/escalation features; Streamlined to core template functionality |
| 1.1.0 | 2025-11-18 | Documentation Team | Updated per ARC-2025-001 |
| 1.0.0 | 2025-11-15 | Documentation Team | Initial DD document |

---

## Overview

The Pricelist Templates module provides a centralized system for creating, managing, and distributing standardized pricing templates to vendors. Templates ensure consistent pricing data collection, streamline vendor onboarding, and facilitate price comparison across multiple vendors.

### Key Features
- Template creation and management (3-step wizard)
- Product/item assignment via hierarchical selection (categories, subcategories, item groups, specific items)
- Multi-level MOQ pricing structures
- Template versioning and history
- Template activation/deactivation
- Template cloning and duplication
- Excel template generation
- Request for Pricing (RfP) campaign creation
- Notification settings with reminder days
- Lead time requirements
- Multi-currency support (BHT, USD, CNY, SGD)

---

## Entity Relationship Overview

```
tb_currency (1) ──── (N) tb_pricelist_template
tb_pricelist_template (1) ──── (N) tb_pricelist_template_detail
tb_product (1) ──── (N) tb_pricelist_template_detail
```

---

## TypeScript Interface Definitions

### PricelistTemplate Interface

**Source**: `app/(main)/vendor-management/types/index.ts`

```typescript
interface PricelistTemplate {
  id: string
  name: string
  description?: string
  productSelection: ProductSelection
  customFields: CustomField[]
  instructions: string
  validityPeriod: number                    // days
  status: 'draft' | 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
  createdBy: string
  // Additional template settings
  allowMultiMOQ: boolean
  requireLeadTime: boolean
  defaultCurrency: string
  supportedCurrencies: string[]
  maxItemsPerSubmission?: number
  notificationSettings: {
    sendReminders: boolean
    reminderDays: number[]                  // e.g., [14, 7, 3, 1]
    escalationDays: number
  }
}
```

### ProductSelection Interface

```typescript
interface ProductSelection {
  categories: string[]
  subcategories: string[]
  itemGroups: string[]
  specificItems: string[]                   // Legacy: simple product IDs
  productInstances?: ProductInstance[]      // New: product instances with units
}

interface ProductInstance {
  id: string              // Unique instance ID (e.g., "beef-ribeye-kg")
  productId: string       // Original product ID (e.g., "beef-ribeye")
  orderUnit: string       // Selected order unit for this instance
  displayName?: string    // Optional custom name for display
}
```

### CustomField Interface

```typescript
interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  required: boolean
  options?: string[]      // For select type
  defaultValue?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}
```

### Currency Options (Code Constants)

| Code | Label |
|------|-------|
| BHT | Thai Baht (BHT) |
| USD | US Dollar (USD) |
| CNY | Chinese Yuan (CNY) |
| SGD | Singapore Dollar (SGD) |

---

## Core Entities

### 1. Pricelist Template Header (tb_pricelist_template)

**Purpose**: Stores template header information including name, currency, description, vendor instructions, and effective date range.

**Table Name**: `tb_pricelist_template`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | VARCHAR | UNIQUE, NOT NULL | Template name (must be unique) |
| `description` | TEXT | | Template description |
| `currency_id` | UUID | FOREIGN KEY → tb_currency.id | Default currency for pricing |
| `currency_name` | VARCHAR | DENORMALIZED | Currency name for quick reference |
| `vendor_instructions` | TEXT | | Instructions and guidelines for vendors |
| `effective_from` | DATE | | Template effective start date |
| `effective_to` | DATE | | Template effective end date |
| `status` | ENUM | DEFAULT 'draft' | Template status (draft, active, inactive) |
| `info` | JSON | | Additional metadata |
| `doc_version` | DECIMAL | DEFAULT 0 | Document version for optimistic locking |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created the record |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Relationships
- **tb_currency**: Many-to-One (template specifies default currency)
- **tb_pricelist_template_detail**: One-to-Many (template contains multiple product lines)

#### Business Rules
1. **BR-PT-001: Template Uniqueness**: Template `name` must be unique across active templates
2. **BR-PT-003: Currency Consistency**: Template currency must match vendor's default currency or be explicitly overridden
3. **Status Workflow**: draft → active → inactive

#### Enums

**enum_pricelist_template_status**:
- `draft`: Template being created/edited
- `active`: Template ready for use
- `inactive`: Template deactivated but preserved

#### Indexes
```
INDEX pricelist_template_name_u ON tb_pricelist_template(name)
INDEX pricelist_template_currency_id_idx ON tb_pricelist_template(currency_id)
INDEX pricelist_template_status_idx ON tb_pricelist_template(status) WHERE deleted_at IS NULL
```

---

### 2. Pricelist Template Line Items (tb_pricelist_template_detail)

**Purpose**: Stores product selections and item specifications for the template.

**Table Name**: `tb_pricelist_template_detail`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `pricelist_template_id` | UUID | FOREIGN KEY → tb_pricelist_template.id, NOT NULL | Parent template |
| `sequence_no` | INTEGER | DEFAULT 1 | Display order/sequence |
| `product_id` | UUID | FOREIGN KEY → tb_product.id, NOT NULL | Product to be priced |
| `product_name` | VARCHAR | DENORMALIZED | Product name for quick reference |
| `unit_of_measure` | VARCHAR | NOT NULL | Unit of measure (UOM) |
| `minimum_order_quantity` | DECIMAL | | Minimum order quantity (MOQ) |
| `lead_time_days` | INTEGER | | Expected delivery time in days |
| `info` | JSON | | Additional metadata and custom attributes |
| `doc_version` | DECIMAL | DEFAULT 0 | Version for optimistic locking |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Relationships
- **tb_pricelist_template**: Many-to-One (line items belong to one template)
- **tb_product**: Many-to-One (multiple line items can reference same product)

#### Business Rules
1. **BR-PT-002: Minimum Items**: Each template must have at least one product/item assigned
2. **Product Uniqueness**: Same product cannot appear twice in same template
3. **Sequencing**: `sequence_no` determines display order
4. **UOM Standardization**: Unit of measure must be standardized

#### Indexes
```
INDEX pricelist_template_detail_template_product_u
  ON tb_pricelist_template_detail(pricelist_template_id, product_id)
INDEX pricelist_template_detail_sequence_idx
  ON tb_pricelist_template_detail(pricelist_template_id, sequence_no)
```

---

## Data Validation Rules

### Template Header Validation

| Rule ID | Field | Rule | Error Message |
|---------|-------|------|---------------|
| VAL-PLT-001 | name | Required, unique, 3-200 characters | Template name is required and must be unique |
| VAL-PLT-002 | status | Valid transitions: draft → active → inactive | Invalid status transition |
| VAL-PLT-003 | effective_to | Must be after effective_from if both specified | End date must be after start date |
| VAL-PLT-004 | currency_id | Must reference valid currency | Invalid currency |

### Template Detail Validation

| Rule ID | Field | Rule | Error Message |
|---------|-------|------|---------------|
| VAL-PLT-101 | product_id | Unique per template | Product already exists in this template |
| VAL-PLT-102 | unit_of_measure | Required, non-empty | Unit of measure is required |
| VAL-PLT-103 | minimum_order_quantity | Must be > 0 if specified | MOQ must be greater than 0 |
| VAL-PLT-104 | lead_time_days | Must be > 0 if specified | Lead time must be at least 1 day |
| VAL-PLT-105 | sequence_no | Unique within template | Duplicate sequence number |

---

## Integration Points

### 1. Currency Management
- **Direction**: Inbound
- **Purpose**: Templates specify default currency for pricing
- **Key Fields**: `currency_id`, `currency_name`

### 2. Product Management
- **Direction**: Inbound
- **Purpose**: Template line items reference products to be priced
- **Key Fields**: `product_id`, `product_name`, `unit_of_measure`

### 3. Price Lists Module
- **Direction**: Outbound
- **Purpose**: Templates serve as structure for vendor price submissions
- **Process**: Vendor submissions auto-create price lists linked to template

### 4. Vendor Directory
- **Direction**: Inbound
- **Purpose**: Link templates to approved vendors
- **Key Fields**: Vendor selection and contact info

### 5. Reporting
- **Direction**: Outbound
- **Purpose**: Template data feeds into spend analytics
- **Key Fields**: Template usage and pricing reports

---

## Workflow & State Management

### Template Lifecycle

```
┌───────┐    activate    ┌────────┐   deactivate   ┌──────────┐
│ DRAFT ├───────────────►│ ACTIVE ├───────────────►│ INACTIVE │
└───────┘                └────────┘                └──────────┘
    │                         │
    │  edit                   │  clone
    └────────────┐            └──────────► NEW DRAFT
```

### Status Descriptions

**DRAFT**:
- Template being created or edited
- Can be modified freely
- Cannot be used for price collection

**ACTIVE**:
- Template ready for use
- Can be used for vendor price submissions
- Editing creates a new version

**INACTIVE**:
- Template no longer active
- Preserved for historical records
- Cannot be used for new submissions

---

## Performance Considerations

### Indexing Strategy
1. **Primary Access**: `name` (unique lookup for template selection)
2. **Currency Filter**: `currency_id` (filter templates by currency)
3. **Status Filter**: `status` (find active templates)
4. **Product Lookup**: Composite index on template + product

### Denormalization
- `currency_name`, `product_name` cached to avoid joins
- Trade-off: Faster reads in template listing, updates needed on currency/product renames

---

## Security & Access Control

### Role-Based Access

| Role | Create | Edit | Activate | Clone | View |
|------|--------|------|----------|-------|------|
| Procurement Manager | Yes | Yes | Yes | Yes | Yes |
| Procurement Staff | Yes (draft) | Yes (own) | No | Yes | Yes |
| Finance Manager | No | No | No | No | Yes |
| Department Manager | No | No | No | No | Yes (dept) |
| Executive | No | No | No | No | Yes |

---

## Sample Data Scenarios

### Scenario 1: Simple Food Template

```
Template Header:
- name: "F&B Monthly - Dry Goods"
- status: "active"
- currency: "USD"
- vendor_instructions: "Please provide prices for all items."
- effective_from: 2025-01-01
- effective_to: 2025-12-31

Template Details:
1. Product: "Rice 25kg", UOM: "bag", MOQ: 10, Lead Time: 7 days
2. Product: "Flour 25kg", UOM: "bag", MOQ: 10, Lead Time: 7 days
3. Product: "Sugar 50kg", UOM: "bag", MOQ: 5, Lead Time: 7 days
```

### Scenario 2: Beverage Template

```
Template Header:
- name: "Beverage - Q1 2025"
- status: "active"
- currency: "USD"
- effective_from: 2025-01-01
- effective_to: 2025-03-31

Template Detail:
- Product: "Orange Juice 1L"
- unit_of_measure: "case/12"
- minimum_order_quantity: 5
- lead_time_days: 3
```

---

## Related Documents
- BR-pricelist-templates.md - Business Requirements
- FD-pricelist-templates.md - Flow Diagrams
- VAL-pricelist-templates.md - Validations
- TS-pricelist-templates.md - Technical Specification
- UC-pricelist-templates.md - Use Cases

---

**End of Data Definition Document**
