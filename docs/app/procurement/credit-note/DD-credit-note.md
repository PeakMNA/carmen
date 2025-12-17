# Data Definition: Credit Note

## Module Information
- **Module**: Procurement
- **Sub-Module**: Credit Note
- **Database**: PostgreSQL (via Supabase)
- **Schema Version**: 1.0.4
- **Last Updated**: 2025-12-03
- **Owner**: Procurement Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.4 | 2025-12-03 | Documentation Team | Updated to support configurable costing method (FIFO or Periodic Average) per system settings |
| 1.0.3 | 2025-12-03 | Documentation Team | Added Related Shared Data Structures section with references to SM-inventory-operations |
| 1.0.2 | 2025-12-03 | Documentation Team | Added Backend Data Structures section for server actions and API contracts |
| 1.0.1 | 2025-12-03 | Documentation Team | Document history update for consistency across documentation set |
| 1.0.0 | 2025-01-11 | Documentation Team | Initial version from type definitions analysis |

---

## Overview

The Credit Note data model manages vendor credits for returns and pricing adjustments. The model supports two distinct credit types: quantity-based returns with inventory costing (FIFO or Periodic Average, configurable at system level) and lot tracking, and amount-based pricing adjustments. It captures complete credit documentation including vendor information, item details, lot applications, cost analysis, tax calculations, and journal entries.

The data model consists of four primary entities: CreditNote (header), CreditNoteItem (line items), AppliedLot (lot tracking for returns), and CreditNoteAttachment (file attachments). Supporting enumerations define credit types, status values, and credit reasons. The model integrates with GRN for source data, Inventory for lot tracking, and Finance for GL postings.

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**
- **DO NOT include SQL code** - describe database structures in text
- **DO NOT include CREATE TABLE statements** - describe table purposes and fields
- **DO NOT include mermaid ERD diagrams** - describe relationships in text
- **DO include**: Entity descriptions, field definitions, relationship explanations, business rules
- **Focus on**: WHAT data is stored, WHY it exists, HOW it relates - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-credit-note.md)
- [Technical Specification](./TS-credit-note.md)
- [Use Cases](./UC-credit-note.md)
- [Flow Diagrams](./FD-credit-note.md)
- [Validations](./VAL-credit-note.md)

**Related Shared Data Structures**:

The Credit Note module utilizes data structures defined in the centralized Shared Methods documentation:

| Data Structure | Shared Method Reference | Usage in CN |
|----------------|------------------------|-------------|
| **InventoryBalance** | [SM-inventory-operations.md#3.1](../../shared-methods/inventory-operations/SM-inventory-operations.md) | Current stock levels for return validation |
| **InventoryOperation** | [SM-inventory-operations.md#3.2](../../shared-methods/inventory-operations/SM-inventory-operations.md) | Stock movement transactions for returns |
| **InventoryState** | [SM-inventory-operations.md#3.3](../../shared-methods/inventory-operations/SM-inventory-operations.md) | Item state tracking for return processing |
| **AuditLog** | [SM-inventory-operations.md#3.7](../../shared-methods/inventory-operations/SM-inventory-operations.md) | Audit trail entries for CN operations |
| **InventoryValuation** | [SM-inventory-valuation.md](../../shared-methods/inventory-valuation/SM-inventory-valuation.md) | Inventory cost calculation results (FIFO or Periodic Average) |

---

## Entity Relationship Overview

**Primary Entities**:
- **CreditNote**: Header entity representing a vendor credit transaction
- **CreditNoteItem**: Line item entity representing products being credited
- **AppliedLot**: Supporting entity linking credit items to specific inventory lots (quantity returns only)
- **CreditNoteAttachment**: Supporting entity for file attachments

**Key Relationships**:

1. **CreditNote → CreditNoteItem**: One-to-Many relationship
   - Business meaning: A single credit note can contain multiple product lines
   - Cardinality: One credit note has 1 to many items (at least one item required)
   - Example: Credit note for damaged kitchen equipment contains 2 items (damaged blender and cracked knives)

2. **CreditNoteItem → AppliedLot**: One-to-Many relationship (quantity returns only)
   - Business meaning: Each credited item can reference multiple inventory lots
   - Cardinality: One credit note item has 0 to many applied lots (0 for amount discounts, 1+ for quantity returns)
   - Example: Returning 15 units draws from 2 lots (5 units from Lot A, 10 units from Lot B)

3. **CreditNote → CreditNoteAttachment**: One-to-Many relationship
   - Business meaning: A credit note can have multiple supporting documents
   - Cardinality: One credit note has 0 to many attachments
   - Example: Credit note has 2 attachments (damaged goods photo and vendor email)

4. **CreditNote → Vendor**: Many-to-One relationship
   - Business meaning: All credit notes issued against a vendor
   - Cardinality: Many credit notes reference one vendor
   - Example: Professional Kitchen Supplies has 12 credit notes this year

5. **CreditNote → GoodsReceiveNote**: Many-to-One optional relationship
   - Business meaning: Credit notes can reference source GRN
   - Cardinality: Many credit notes can reference one GRN (multiple partial credits), or no GRN (standalone)
   - Example: Large GRN with quality issues generates 2 separate credit notes for different items

6. **CreditNoteItem → Product**: Many-to-One relationship
   - Business meaning: Each line item references a product from the catalog
   - Cardinality: Many credit note items reference one product
   - Example: Commercial blenders credited in 5 different credit notes this quarter

7. **AppliedLot → InventoryLot**: Many-to-One relationship
   - Business meaning: Each applied lot links to specific inventory lot record
   - Cardinality: Many applied lots can reference one inventory lot (multiple partial returns from same lot)
   - Example: Same inventory lot credited 3 times for progressive quality deterioration

**Relationship Notes**:
- All relationships enforce referential integrity with foreign key constraints
- Parent CreditNote must exist before child items and attachments can be created
- Applied lots only created for quantity-based credit notes (type = QUANTITY_RETURN)
- Deleting a credit note cascades to delete all child items, applied lots, and attachments
- Soft delete pattern used for credit notes to preserve audit trail (deletedAt field instead of hard delete)
- Posted credit notes cannot be deleted (only voided)

---

## Data Entities

### Entity: CreditNote

**Description**: Represents a vendor credit transaction documenting returns of goods or pricing adjustments. Each credit note serves as an official record of credit due from vendor, reducing accounts payable and adjusting inventory (for quantity returns).

**Business Purpose**: Provides complete documentation of vendor credits for inventory returns, pricing corrections, damaged goods, and negotiated discounts. Serves as the basis for reducing vendor payables, adjusting inventory values, and processing input VAT credits.

**Data Ownership**: Procurement Department, with shared access for warehouse, finance, and accounts payable teams

**Access Pattern**:
- Primarily accessed by credit note number (business key)
- Frequently filtered by status, vendor, date range, credit type
- Sorted by document date (descending) for recent credits
- Searched by vendor name, GRN reference, description

**Data Volume**: Approximately 100 records per month, 1,200 records per year across all locations

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID, auto-generated)
- **Business Key**: cnNumber - Human-readable unique identifier following format CN-YYMM-NNNN
- **Display Name**: cnNumber concatenated with vendor name

**Core Business Fields**:
- **documentDate**: Date when credit note was issued
  - Required: Yes
  - Data type: Date
  - Example: "2024-10-23"
  - Constraint: Cannot be more than 7 days in the future

- **vendorId**: Reference to the vendor being credited
  - Required: Yes
  - Data type: UUID
  - Links to Vendor entity

- **vendorName**: Denormalized vendor name for display and search
  - Required: Yes
  - Data type: String (max 255 characters)
  - Example: "ABC Suppliers"

- **vendorCode**: Denormalized vendor code
  - Required: Yes
  - Data type: String (max 50 characters)
  - Example: "VEND-001"

**Credit Type Classification**:
- **creditType**: Determines whether credit involves physical return or pricing adjustment
  - Required: Yes
  - Data type: Enum (CreditNoteType)
  - Allowed values: QUANTITY_RETURN, AMOUNT_DISCOUNT
  - Business meaning:
    - QUANTITY_RETURN: Physical goods returned, stock movements generated, inventory costing applied (FIFO or Periodic Average based on system configuration)
    - AMOUNT_DISCOUNT: Pricing adjustment only, no stock movements, no inventory costing
  - Default: QUANTITY_RETURN
  - Cannot be changed after save

**Source References**:
- **grnId**: Optional reference to source goods receive note
  - Required: No (recommended for QUANTITY_RETURN, optional for AMOUNT_DISCOUNT)
  - Data type: UUID
  - Links to GoodsReceiveNote entity

- **grnNumber**: Denormalized GRN number for display
  - Required: No
  - Data type: String (max 50 characters)
  - Example: "GRN-2401-0001"

- **grnDate**: Date of source GRN
  - Required: No
  - Data type: Date

**Invoice References**:
- **invoiceReference**: Vendor's original invoice number being credited
  - Required: No (recommended for amount discounts)
  - Data type: String (max 100 characters)
  - Example: "INV-2401-0523"

- **invoiceDate**: Date of original invoice
  - Required: No
  - Data type: Date

- **taxInvoiceReference**: Tax invoice number for VAT purposes
  - Required: No (required for input VAT credit claims)
  - Data type: String (max 100 characters)

- **taxDate**: Tax invoice date
  - Required: No
  - Data type: Date

**Status and Workflow**:
- **status**: Tracks credit note lifecycle state
  - Required: Yes
  - Data type: Enum (CreditNoteStatus)
  - Allowed values: DRAFT, COMMITTED, VOID
  - Default: DRAFT
  - Status transitions:
    - DRAFT → COMMITTED (commit to GL)
    - COMMITTED → VOID (void committed credit)
  - Business rule: COMMITTED status can only transition to VOID

**Credit Reason and Description**:
- **creditReason**: Standardized reason code for credit
  - Required: Yes
  - Data type: Enum (CreditNoteReason)
  - Allowed values: DAMAGED, EXPIRED, WRONG_DELIVERY, QUALITY_ISSUE, PRICE_ADJUSTMENT, OTHER
  - Business meanings:
    - DAMAGED: Items damaged in transit or storage
    - EXPIRED: Products past expiration date or shelf life
    - WRONG_DELIVERY: Incorrect items delivered by vendor
    - QUALITY_ISSUE: Products do not meet quality standards
    - PRICE_ADJUSTMENT: Vendor charged incorrect price or negotiated discount
    - OTHER: Other reason not listed (requires detailed description)

- **description**: Detailed explanation of credit reason
  - Required: Yes
  - Data type: Text
  - Example: "Partial shipment of damaged kitchen equipment - 2 blenders with cracked containers, 1 knife set with broken handles"
  - Constraint: Minimum 10 characters (50 characters if creditReason = OTHER)

**Currency and Exchange**:
- **currency**: Transaction currency code
  - Required: Yes
  - Data type: String (3 characters, ISO 4217)
  - Example: "USD", "EUR", "THB"
  - Default: Organization base currency

- **exchangeRate**: Exchange rate to base currency
  - Required: Yes
  - Data type: Decimal (15,6)
  - Example: 1.000000 (for base currency), 34.500000 (THB to USD)
  - Default: 1.000000 for base currency
  - Constraint: Must be > 0

**Financial Summary**:
- **netAmount**: Net credit amount before tax
  - Required: Yes
  - Data type: Decimal (15,2)
  - Calculated: Sum of item line totals (quantity × unit price - discounts)
  - Example: 4000.00

- **taxAmount**: Total tax amount (typically input VAT)
  - Required: Yes
  - Data type: Decimal (15,2)
  - Calculated: netAmount × tax rate
  - Example: 720.00 (18% of 4000.00)

- **taxRate**: Tax rate percentage applied
  - Required: Yes
  - Data type: Decimal (5,2)
  - Example: 18.00 (18%)
  - Default: Applicable tax rate for document date

- **totalAmount**: Total credit amount including tax
  - Required: Yes
  - Data type: Decimal (15,2)
  - Calculated: netAmount + taxAmount
  - Example: 4720.00

**Additional Information**:
- **notes**: Internal notes or comments about the credit
  - Required: No
  - Data type: Text
  - Example: "Vendor acknowledged quality issues, agreed to full credit"

**Commitment Information**:
- **committedDate**: Date when credit note was committed to GL
  - Required: No (NULL until committed, set when status changes to COMMITTED)
  - Data type: Date

- **commitmentReference**: Journal voucher or commitment reference number
  - Required: No (NULL until committed)
  - Data type: String (max 50 characters)
  - Example: "JV-2401-001523"

**Void Information**:
- **voidDate**: Date when credit note was voided
  - Required: No (NULL unless voided)
  - Data type: Date

- **voidReason**: Reason for voiding credit note
  - Required: No (required if status = VOID)
  - Data type: Text
  - Example: "Error in quantities, replacement credit note CN-2401-156 created"

**Audit Fields** (Standard):
- **createdDate**: Timestamp when credit note was created
- **createdBy**: User ID who created credit note
- **updatedDate**: Timestamp of last modification
- **updatedBy**: User ID who last modified credit note
- **deletedAt**: Soft delete timestamp (NULL for active credit notes)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto | Primary key identifier | 550e8400-e29b-41d4-... | Unique, Non-null |
| cnNumber | VARCHAR(50) | Yes | Auto | Business identifier | CN-2401-0001 | Unique, Format: CN-YYMM-NNNN |
| documentDate | DATE | Yes | - | Credit note issue date | 2024-10-23 | Cannot be >7 days future |
| vendorId | UUID | Yes | - | Vendor reference | 550e8400-... | FK to vendors.id |
| vendorName | VARCHAR(255) | Yes | - | Vendor name (denormalized) | ABC Suppliers | Non-empty |
| vendorCode | VARCHAR(50) | Yes | - | Vendor code (denormalized) | VEND-001 | Non-empty |
| creditType | VARCHAR(20) | Yes | QUANTITY_RETURN | Credit type classification | QUANTITY_RETURN | QUANTITY_RETURN\|AMOUNT_DISCOUNT |
| grnId | UUID | No | NULL | GRN reference (optional) | 550e8400-... | FK to goods_receive_notes.id |
| grnNumber | VARCHAR(50) | No | NULL | GRN number (denormalized) | GRN-2401-0001 | - |
| grnDate | DATE | No | NULL | GRN date | 2024-10-15 | - |
| invoiceReference | VARCHAR(100) | No | NULL | Original invoice number | INV-2401-0523 | - |
| invoiceDate | DATE | No | NULL | Original invoice date | 2024-10-10 | - |
| taxInvoiceReference | VARCHAR(100) | No | NULL | Tax invoice number | TAX-2401-0001 | - |
| taxDate | DATE | No | NULL | Tax invoice date | 2024-10-10 | - |
| status | VARCHAR(20) | Yes | DRAFT | Credit note lifecycle status | COMMITTED | DRAFT\|COMMITTED\|VOID |
| creditReason | VARCHAR(50) | Yes | - | Standardized reason code | DAMAGED | DAMAGED\|EXPIRED\|WRONG_DELIVERY\|QUALITY_ISSUE\|PRICE_ADJUSTMENT\|OTHER |
| description | TEXT | Yes | - | Detailed explanation | Partial shipment damaged... | Min 10 chars (50 for OTHER) |
| currency | CHAR(3) | Yes | Base | Currency code (ISO 4217) | USD | Valid ISO code |
| exchangeRate | DECIMAL(15,6) | Yes | 1.000000 | Exchange rate to base | 34.500000 | > 0 |
| netAmount | DECIMAL(15,2) | Yes | 0.00 | Net credit before tax | 4000.00 | ≥ 0 |
| taxAmount | DECIMAL(15,2) | Yes | 0.00 | Total tax amount | 720.00 | ≥ 0 |
| taxRate | DECIMAL(5,2) | Yes | 0.00 | Tax rate percentage | 18.00 | 0-100 |
| totalAmount | DECIMAL(15,2) | Yes | 0.00 | Total credit with tax | 4720.00 | ≥ 0 |
| notes | TEXT | No | NULL | Internal notes | Vendor acknowledged issues | - |
| committedDate | DATE | No | NULL | GL commitment date | 2024-10-25 | Cannot be NULL if COMMITTED |
| commitmentReference | VARCHAR(50) | No | NULL | Commitment reference | JV-2401-001523 | - |
| voidDate | DATE | No | NULL | Void date | 2024-10-30 | Cannot be NULL if VOID |
| voidReason | TEXT | No | NULL | Void reason | Error in quantities... | Required if VOID |
| createdDate | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2024-10-23T10:00:00Z | Immutable |
| createdBy | UUID | Yes | - | Creator user ID | 550e8400-... | FK to users.id |
| updatedDate | TIMESTAMPTZ | Yes | NOW() | Update timestamp | 2024-10-23T15:00:00Z | Auto-updated |
| updatedBy | UUID | Yes | - | Updater user ID | 550e8400-... | FK to users.id |
| deletedAt | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL or timestamp | NULL for active |

#### Data Constraints and Rules

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated
- Purpose: Uniquely identifies each credit note across system

**Unique Constraints**:
- `cnNumber`: Must be unique among all credit notes (including soft-deleted)
  - Format: CN-{YYMM}-{NNN} where YY is 2-digit year and MM is month and NNN is sequential 3-digit number
  - Sequential numbering resets each calendar year

**Foreign Key Relationships**:
- **Vendor** (`vendorId` → `vendors.id`)
  - On Delete: RESTRICT (cannot delete vendor with credit notes)
  - On Update: CASCADE
  - Business rule: All credit notes must have valid vendor reference

- **GRN** (`grnId` → `goods_receive_notes.id`)
  - On Delete: SET NULL (preserve credit note even if GRN deleted)
  - On Update: CASCADE
  - Business rule: Optional reference, recommended for quantity returns

- **Users** (`createdBy`, `updatedBy` → `users.id`)
  - On Delete: SET NULL (preserve audit trail even if user deleted)
  - On Update: CASCADE
  - Business rule: Track user accountability for credit note operations

**Check Constraints**:
- **Status values**: Must be one of: DRAFT, COMMITTED, VOID
- **Credit type values**: Must be one of: QUANTITY_RETURN, AMOUNT_DISCOUNT
- **Credit reason values**: Must be one of: PRICING_ERROR, DAMAGED_GOODS, RETURN, DISCOUNT_AGREEMENT, OTHER
- **Document date**: Cannot be more than 7 days in the future
- **Financial amounts**: netAmount, taxAmount, totalAmount must be ≥ 0
- **Tax rate**: Must be between 0 and 100
- **Exchange rate**: Must be > 0
- **Total calculation**: totalAmount must equal netAmount + taxAmount
- **Description length**: Minimum 10 characters (50 if creditReason = OTHER)
- **Committed status**: If status = COMMITTED, committedDate and commitmentReference must not be NULL
- **Void status**: If status = VOID, voidDate and voidReason must not be NULL

**Business Rules Enforced**:
- Credit note must have at least one item before commitment (validated at application level)
- All items must have lot selections for quantity returns before commitment
- Tax invoice reference required for input VAT credit claims
- DRAFT status credit notes are editable
- COMMITTED status credit notes are locked from editing (can only be voided)
- COMMITTED status credit notes are immutable (updates prevented), can only be voided
- VOID status credit notes are read-only (preserved for audit)
- Credit type cannot be changed after save (immutable field)

---

### Entity: CreditNoteItem

**Description**: Represents an individual product line item within a credit note, capturing quantities being credited, pricing, discounts, and tax calculations. For quantity returns, links to specific inventory lots via AppliedLot entity.

**Business Purpose**: Provides detailed item-level tracking of credits, enabling inventory adjustments (for quantity returns), cost accounting with system-configured costing method (FIFO or Periodic Average), and granular financial reporting at the SKU level.

**Data Ownership**: Procurement and Finance Departments

**Access Pattern**:
- Primarily accessed via parent credit note ID
- Filtered by product code, credit type
- Sorted by line number within credit note

**Data Volume**: Approximately 300 records per month (average 3 items per credit note), 3,600 records per year

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID)
- **Line Number**: Sequential number within parent credit note (1, 2, 3...)
- **Parent Reference**: creditNoteId linking to parent CreditNote

**Item Identification**:
- **productId**: Reference to product in catalog
- **productName**: Product name
- **productDescription**: Detailed product description
- **location**: Storage location code (for quantity returns)
- **lotNo**: Inventory lot number (for quantity returns, display/reference only)

**Unit Information**:
- **orderUnit**: Unit of measure for ordering (kg, piece, box, etc.)
- **inventoryUnit**: Unit of measure for inventory (may differ from order unit)

**Quantity Tracking** (for QUANTITY_RETURN type):
- **rcvQty**: Originally received quantity (from GRN)
  - Required: No (NULL for amount discounts, populated for quantity returns)
  - Data type: Decimal (15,3)
  - Example: 50.000 (50 units originally received)

- **cnQty**: Credit note quantity (being returned)
  - Required: Yes (for quantity returns), NULL for amount discounts
  - Data type: Decimal (15,3)
  - Example: 10.000 (returning 10 units)
  - Constraint: Must be > 0 and ≤ available lot quantity

- **totalReceivedQty**: Total quantity across all selected lots
  - Required: No (populated for quantity returns)
  - Data type: Decimal (15,3)
  - Calculated: Sum of lot quantities from AppliedLot records

**Pricing and Costs**:
- **unitPrice**: Price per unit
  - Required: Yes
  - Data type: Decimal (15,4)
  - Example: 400.0000 (400 per unit)
  - Constraint: Must be > 0

- **cnAmt**: Credit amount for this item (quantity × unit price)
  - Required: Yes
  - Data type: Decimal (15,2)
  - Calculated for quantity returns: cnQty × unitPrice
  - Manual entry for amount discounts
  - Example: 4000.00

- **costVariance**: Inventory cost variance (current cost - calculated cost from FIFO or Periodic Average method)
  - Required: No (NULL for amount discounts, calculated for quantity returns)
  - Data type: Decimal (15,4)
  - Example: 12.5000 (current cost is 12.50 higher than calculated cost)

- **discountAmount**: Additional discount on top of credit amount
  - Required: No
  - Data type: Decimal (15,2)
  - Example: 200.00
  - Default: 0.00

**Tax Calculation**:
- **taxRate**: Tax rate percentage for this item
  - Required: Yes
  - Data type: Decimal (5,2)
  - Example: 18.00 (18%)
  - Default: Applicable tax rate

- **tax**: Tax amount for this line
  - Required: Yes
  - Data type: Decimal (15,2)
  - Calculated: (cnAmt - discountAmount) × (taxRate / 100)
  - Example: 684.00

- **total**: Total line amount including tax
  - Required: Yes
  - Data type: Decimal (15,2)
  - Calculated: cnAmt - discountAmount + tax
  - Example: 4484.00

**GRN Reference**:
- **grnNumber**: Source GRN number for this item
  - Required: No (recommended for quantity returns)
  - Data type: String (max 50 characters)
  - Example: "GRN-2401-0001"

- **grnDate**: Source GRN date
  - Required: No
  - Data type: Date

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto | Primary key identifier | 550e8400-e29b-41d4-... | Unique, Non-null |
| creditNoteId | UUID | Yes | - | Parent credit note reference | 550e8400-... | FK to credit_notes.id |
| lineNumber | INTEGER | Yes | - | Sequential line number | 1, 2, 3 | > 0, Unique within CN |
| productId | UUID | Yes | - | Product reference | 550e8400-... | FK to products.id |
| productName | VARCHAR(255) | Yes | - | Product name | Commercial Blender | Non-empty |
| productDescription | TEXT | No | NULL | Product description | 1500W professional blender | - |
| location | VARCHAR(50) | No | NULL | Storage location code | WH-MAIN | Required for qty returns |
| lotNo | VARCHAR(50) | No | NULL | Lot number (display) | LOT-2401-0001 | - |
| orderUnit | VARCHAR(20) | Yes | - | Order unit of measure | piece | Non-empty |
| inventoryUnit | VARCHAR(20) | Yes | - | Inventory unit of measure | piece | Non-empty |
| rcvQty | DECIMAL(15,3) | No | NULL | Originally received quantity | 50.000 | ≥ 0 if not NULL |
| cnQty | DECIMAL(15,3) | No | NULL | Credit note quantity | 10.000 | > 0 for qty returns |
| totalReceivedQty | DECIMAL(15,3) | No | NULL | Total across selected lots | 60.000 | ≥ 0 if not NULL |
| unitPrice | DECIMAL(15,4) | Yes | - | Price per unit | 400.0000 | > 0 |
| cnAmt | DECIMAL(15,2) | Yes | - | Credit amount | 4000.00 | ≥ 0 |
| costVariance | DECIMAL(15,4) | No | NULL | Inventory cost variance | 12.5000 | Any value |
| discountAmount | DECIMAL(15,2) | No | 0.00 | Additional discount | 200.00 | ≥ 0 |
| taxRate | DECIMAL(5,2) | Yes | 0.00 | Tax rate percentage | 18.00 | 0-100 |
| tax | DECIMAL(15,2) | Yes | 0.00 | Tax amount | 684.00 | ≥ 0 |
| total | DECIMAL(15,2) | Yes | 0.00 | Total line amount | 4484.00 | ≥ 0 |
| grnNumber | VARCHAR(50) | No | NULL | Source GRN number | GRN-2401-0001 | - |
| grnDate | DATE | No | NULL | Source GRN date | 2024-10-15 | - |

#### Data Constraints and Rules

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated

**Unique Constraints**:
- Combination of (`creditNoteId`, `lineNumber`) must be unique
  - Ensures each line number is unique within a credit note

**Foreign Key Relationships**:
- **CreditNote** (`creditNoteId` → `credit_notes.id`)
  - On Delete: CASCADE (delete items when parent credit note deleted)
  - On Update: CASCADE
  - Business rule: Items belong to exactly one credit note

- **Product** (`productId` → `products.id`)
  - On Delete: RESTRICT (cannot delete product with credit note items)
  - On Update: CASCADE
  - Business rule: All items must reference valid product

**Check Constraints**:
- **Line number**: Must be > 0
- **Quantities**: rcvQty, cnQty, totalReceivedQty must be ≥ 0 when not NULL
- **Unit price**: Must be > 0
- **Amounts**: cnAmt, discountAmount, tax, total must be ≥ 0
- **Tax rate**: Must be between 0 and 100
- **Discount**: discountAmount cannot exceed cnAmt
- **Total calculation**: total must equal (cnAmt - discountAmount + tax)

**Business Rules Enforced**:
- For quantity returns (credit type = QUANTITY_RETURN):
  - cnQty must not be NULL and must be > 0
  - Location must not be NULL
  - At least one AppliedLot record must exist (enforced at application level)
- For amount discounts (credit type = AMOUNT_DISCOUNT):
  - cnQty is NULL
  - cnAmt must be > 0 (manual entry)
  - No AppliedLot records
- Tax calculation: tax = (cnAmt - discountAmount) × (taxRate / 100)
- Total calculation: total = cnAmt - discountAmount + tax

---

### Entity: AppliedLot

**Description**: Represents the application of a credit note item to specific inventory lot(s), enabling inventory costing (FIFO or Periodic Average) and lot traceability for quantity-based returns. Each record links a credit note item to a particular inventory lot with the quantity being returned from that lot.

**Business Purpose**: Enables accurate inventory valuation using system-configured costing method (FIFO or Periodic Average), maintains lot traceability for quality control and regulatory compliance, and provides detailed cost variance analysis for financial reporting.

**Data Ownership**: Warehouse and Finance Departments

**Access Pattern**:
- Primarily accessed via parent credit note item ID
- Filtered by lot number
- Used in inventory cost calculations (FIFO or Periodic Average)

**Data Volume**: Approximately 400 records per month (average 1.3 lots per quantity return item), 4,800 records per year

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID)
- **Parent Reference**: creditNoteItemId linking to parent CreditNoteItem

**Lot Reference**:
- **lotNumber**: Inventory lot number being credited
  - Required: Yes
  - Data type: String (max 50 characters)
  - Example: "LOT-2401-0523"

- **receiveDate**: Date when this lot was originally received
  - Required: Yes
  - Data type: Date
  - Example: "2024-05-23"

- **grnNumber**: GRN number where this lot was originally received
  - Required: Yes
  - Data type: String (max 50 characters)
  - Example: "GRN-2401-0115"

- **invoiceNumber**: Original vendor invoice for this lot
  - Required: No
  - Data type: String (max 100 characters)
  - Example: "INV-2401-0523"

**Quantity and Cost**:
- **quantity**: Quantity being returned from this lot
  - Required: Yes
  - Data type: Decimal (15,3)
  - Example: 5.000 (returning 5 units from this lot)
  - Constraint: Must be > 0 and ≤ lot available quantity

- **unitCost**: Unit cost from this lot (for inventory costing calculation)
  - Required: Yes
  - Data type: Decimal (15,4)
  - Example: 387.5000
  - Retrieved from inventory lot record

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto | Primary key identifier | 550e8400-e29b-41d4-... | Unique, Non-null |
| creditNoteItemId | UUID | Yes | - | Parent item reference | 550e8400-... | FK to credit_note_items.id |
| lotNumber | VARCHAR(50) | Yes | - | Inventory lot number | LOT-2401-0523 | Non-empty |
| receiveDate | DATE | Yes | - | Original receive date | 2024-05-23 | Cannot be future |
| grnNumber | VARCHAR(50) | Yes | - | Original GRN number | GRN-2401-0115 | Non-empty |
| invoiceNumber | VARCHAR(100) | No | NULL | Original invoice number | INV-2401-0523 | - |
| quantity | DECIMAL(15,3) | Yes | - | Return quantity | 5.000 | > 0 |
| unitCost | DECIMAL(15,4) | Yes | - | Unit cost from lot | 387.5000 | ≥ 0 |

#### Data Constraints and Rules

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated

**Foreign Key Relationships**:
- **CreditNoteItem** (`creditNoteItemId` → `credit_note_items.id`)
  - On Delete: CASCADE (delete applied lots when parent item deleted)
  - On Update: CASCADE
  - Business rule: Applied lots belong to exactly one credit note item

**Check Constraints**:
- **Quantity**: Must be > 0
- **Unit cost**: Must be ≥ 0
- **Receive date**: Cannot be in the future

**Business Rules Enforced**:
- Applied lots only exist for quantity-based credit notes (type = QUANTITY_RETURN)
- Sum of applied lot quantities must equal credit note item cnQty
- Each lot must exist in inventory system with sufficient available quantity
- **FIFO**: Weighted average cost calculated as: Σ(quantity × unitCost) / Σ(quantity)
- **Periodic Average**: Period average cost calculated as: Total Period Value / Total Period Quantity
- Cost variance = current unit price - calculated cost (from FIFO or Periodic Average)
- Applied lots are immutable once credit note is committed

---

### Entity: CreditNoteAttachment

**Description**: Represents file attachments associated with a credit note, such as photos of damaged goods, vendor correspondence, delivery notes, or quality inspection reports.

**Business Purpose**: Provides supporting documentation for credit note justification, aids in dispute resolution with vendors, and maintains audit trail of evidence for credits.

**Data Ownership**: Procurement Department

**Access Pattern**:
- Primarily accessed via parent credit note ID
- Filtered by file type
- Ordered by upload date

**Data Volume**: Approximately 150 records per month (1.5 attachments per credit note on average), 1,800 records per year

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID)
- **Parent Reference**: creditNoteId linking to parent CreditNote

**File Information**:
- **fileName**: Original file name
  - Required: Yes
  - Data type: String (max 255 characters)
  - Example: "damaged_blender_photo.jpg"

- **fileUrl**: Storage URL for the file
  - Required: Yes
  - Data type: String (max 500 characters)
  - Example: "https://storage.supabase.co/credit-notes/550e8400.../damaged_blender_photo.jpg"

- **fileType**: MIME type of the file
  - Required: Yes
  - Data type: String (max 100 characters)
  - Example: "image/jpeg"
  - Allowed types: image/jpeg, image/png, application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

- **fileSize**: File size in bytes
  - Required: Yes
  - Data type: Integer
  - Example: 2457600 (2.4 MB)
  - Constraint: Maximum 10 MB (10485760 bytes)

**Description**:
- **description**: Optional description of the attachment
  - Required: No
  - Data type: String (max 255 characters)
  - Example: "Photo showing cracked blender container"

**Audit**:
- **uploadedBy**: User who uploaded the file
  - Required: Yes
  - Data type: UUID
  - Links to User entity

- **uploadedAt**: Timestamp when file was uploaded
  - Required: Yes
  - Data type: Timestamp with timezone

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto | Primary key identifier | 550e8400-e29b-41d4-... | Unique, Non-null |
| creditNoteId | UUID | Yes | - | Parent credit note reference | 550e8400-... | FK to credit_notes.id |
| fileName | VARCHAR(255) | Yes | - | Original file name | damaged_blender_photo.jpg | Non-empty |
| fileUrl | VARCHAR(500) | Yes | - | Storage URL | https://storage... | Valid URL |
| fileType | VARCHAR(100) | Yes | - | MIME type | image/jpeg | Valid MIME type |
| fileSize | INTEGER | Yes | - | File size in bytes | 2457600 | > 0, ≤ 10485760 |
| description | VARCHAR(255) | No | NULL | File description | Photo of damaged item | - |
| uploadedBy | UUID | Yes | - | Uploader user ID | 550e8400-... | FK to users.id |
| uploadedAt | TIMESTAMPTZ | Yes | NOW() | Upload timestamp | 2024-10-23T14:30:00Z | - |

#### Data Constraints and Rules

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated

**Foreign Key Relationships**:
- **CreditNote** (`creditNoteId` → `credit_notes.id`)
  - On Delete: CASCADE (delete attachments when parent credit note deleted)
  - On Update: CASCADE

- **User** (`uploadedBy` → `users.id`)
  - On Delete: SET NULL
  - On Update: CASCADE

**Check Constraints**:
- **File size**: Must be > 0 and ≤ 10485760 (10 MB)
- **File type**: Must be one of: image/jpeg, image/png, application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

**Business Rules Enforced**:
- Maximum 10 attachments per credit note (enforced at application level)
- Files stored in secure cloud storage with access control
- Attachments deleted from storage when record deleted
- File names sanitized to prevent security issues

---

## Enumerations

### Enumeration: CreditNoteType

**Description**: Defines the type of credit note based on whether it involves physical returns or pricing adjustments only.

**Values**:
- **QUANTITY_RETURN**: Physical goods being returned to vendor
  - Triggers stock movements (negative quantities)
  - Requires lot selection and inventory costing (FIFO or Periodic Average)
  - Updates inventory balances
  - Example use case: Damaged kitchen equipment returned to supplier

- **AMOUNT_DISCOUNT**: Pricing adjustment without physical return
  - No stock movements generated
  - No lot selection required
  - Does not affect inventory quantities
  - Example use case: Vendor agrees to 10% discount due to pricing error on invoice

**Business Rules**:
- Credit note type determines whether AppliedLot records are required
- Credit note type is immutable after save (cannot be changed)
- Stock movements only generated for QUANTITY_RETURN type
- Inventory costing (FIFO or Periodic Average) only applied to QUANTITY_RETURN type

---

### Enumeration: CreditNoteStatus

**Description**: Tracks the lifecycle state of a credit note from draft creation through commitment and potential voiding.

**Values**:
- **DRAFT**: Initial state, credit note being created or edited
  - Editable by creator
  - No financial impact
  - Can be deleted

- **COMMITTED**: Committed to general ledger
  - Immutable (cannot be edited)
  - Journal entries created
  - Stock movements generated (for quantity returns)
  - Vendor payable reduced
  - Can only be voided (not deleted)

- **VOID**: Voided after commitment, reversing entries created
  - Read-only
  - Reversing journal entries created
  - Reversing stock movements generated
  - Vendor payable restored
  - Preserved for audit trail

**State Transitions**:
- DRAFT → COMMITTED (commit to GL)
- COMMITTED → VOID (void committed credit)

**Business Rules**:
- Only DRAFT status allows editing
- Status transitions validated and logged in audit trail
- COMMITTED status is final (except for void operation)
- VOID status is terminal (no further transitions allowed)

---

### Enumeration: CreditNoteReason

**Description**: Standardized reason codes explaining why credit note was issued, used for reporting and analysis.

**Values**:
- **DAMAGED**: Items damaged during transit or in storage
  - Example: Kitchen equipment arrived with cracked components
  - Typically results in quantity return credit note
  - Photos/documentation recommended

- **EXPIRED**: Products past expiration date or shelf life
  - Example: Received products with expiry dates already passed
  - Typically results in quantity return credit note
  - Important for food and beverage items

- **WRONG_DELIVERY**: Incorrect items delivered by vendor
  - Example: Ordered stainless steel pans but received aluminum pans
  - Typically results in quantity return credit note
  - May require vendor pickup arrangement

- **QUALITY_ISSUE**: Products do not meet quality standards
  - Example: Fabric napkins with discoloration or stains
  - Can result in either quantity return or amount discount
  - Quality inspection documentation recommended

- **PRICE_ADJUSTMENT**: Vendor charged incorrect price or negotiated discount
  - Example: Unit price should be $380 but vendor billed $400, or volume rebate applied
  - Typically results in amount discount credit note
  - No physical return required

- **OTHER**: Reason not covered by standard codes
  - Requires detailed description (minimum 50 characters)
  - Use sparingly for exceptional cases
  - Example: "Credit for early payment discount per vendor promotion"

**Business Rules**:
- Credit reason is required field
- If reason = OTHER, description must be minimum 50 characters
- Reason provides audit trail for credit note justification
- Reason used in reporting and vendor performance analysis

---

## Indexes

### Performance Indexes

**CreditNote Entity**:
- **Primary Key Index**: id (automatic, B-tree)
- **Business Key Index**: cnNumber (unique, B-tree)
  - Purpose: Fast lookup by credit note number
  - Usage: User searches, GRN selection, reporting

- **Status Index**: status (B-tree)
  - Purpose: Filter credit notes by status
  - Usage: List view filtering, commitment queue

- **Vendor Index**: vendorId (B-tree)
  - Purpose: Find all credit notes for a vendor
  - Usage: Vendor credit summary, vendor performance analysis

- **Date Index**: documentDate (B-tree, descending)
  - Purpose: Sort credit notes by date, date range queries
  - Usage: Recent credits, period-end reporting, aging analysis

- **Commitment Date Index**: committedDate (B-tree)
  - Purpose: GL period queries
  - Usage: Financial period reporting, audit queries

- **Composite Index**: (vendorId, status, documentDate DESC)
  - Purpose: Vendor-specific credit note list with status filtering
  - Usage: Common list view query pattern

- **Text Search Index**: (vendorName, description) (GIN or Full-Text)
  - Purpose: Fast text search across vendor names and descriptions
  - Usage: Search functionality in list view

**CreditNoteItem Entity**:
- **Primary Key Index**: id (automatic)
- **Parent Index**: creditNoteId (B-tree)
  - Purpose: Fast retrieval of items for a credit note
  - Usage: Detail view, financial calculations

- **Product Index**: productId (B-tree)
  - Purpose: Find all credit note items for a product
  - Usage: Product credit history, pricing analysis

- **Composite Index**: (creditNoteId, lineNumber)
  - Purpose: Unique constraint enforcement, item ordering
  - Usage: Detail view item list

**AppliedLot Entity**:
- **Primary Key Index**: id (automatic)
- **Parent Index**: creditNoteItemId (B-tree)
  - Purpose: Fast retrieval of applied lots for an item
  - Usage: Inventory costing calculation, lot traceability

- **Lot Number Index**: lotNumber (B-tree)
  - Purpose: Find all credit applications for a lot
  - Usage: Lot history, inventory reconciliation

**CreditNoteAttachment Entity**:
- **Primary Key Index**: id (automatic)
- **Parent Index**: creditNoteId (B-tree)
  - Purpose: Fast retrieval of attachments for a credit note
  - Usage: Detail view attachments tab

---

## Data Integrity Rules

### Referential Integrity

**Cascade Deletes**:
- Deleting a CreditNote cascades to delete:
  - All CreditNoteItem records
  - All AppliedLot records (via CreditNoteItem cascade)
  - All CreditNoteAttachment records
- Business rule: Cannot cascade delete if credit note is COMMITTED (must void instead)

**Restrict Deletes**:
- Cannot delete Vendor if credit notes exist (must deactivate vendor instead)
- Cannot delete Product if credit note items exist
- Cannot delete GRN if credit notes reference it

**Set Null on Delete**:
- If GRN is soft-deleted, credit note grnId is set to NULL (preserve credit note)
- If User is deleted, createdBy/updatedBy set to NULL (preserve audit trail)

### Data Validation

**Cross-Field Validation**:
- Total amount must equal net amount + tax amount
- For quantity returns: sum of applied lot quantities must equal credit note item cnQty
- If status = COMMITTED, committedDate and commitmentReference must not be NULL
- If status = VOID, voidDate and voidReason must not be NULL
- If creditReason = OTHER, description must be ≥ 50 characters

**Business Logic Validation**:
- Cannot edit credit note unless status = DRAFT
- Cannot delete credit note if status = COMMITTED (must void instead)
- Cannot change credit type after save
- Cannot commit credit note without at least one item
- Cannot commit credit note unless status = DRAFT
- Cannot void credit note unless status = COMMITTED

---

## Data Archival and Retention

### Retention Policy

**Active Records**:
- Current fiscal year credit notes: Full access, all users
- Previous 3 fiscal years: Full access, archived flag for performance
- Older than 3 years: Archived to separate table, read-only access for compliance

**Soft Delete Pattern**:
- Soft delete used for credit notes (deletedAt field)
- Soft-deleted records retained for 7 years for audit compliance
- Soft-deleted records excluded from normal queries via deletedAt IS NULL filter
- Soft-deleted records can be restored by setting deletedAt to NULL (admin only)

**Attachment Retention**:
- Attachments retained as long as parent credit note exists
- Attachment files moved to archive storage after 3 years
- Archive storage has longer retrieval time but lower cost

### Data Purging

**Criteria for Purging**:
- Soft-deleted credit notes older than 7 years
- DRAFT status credit notes soft-deleted older than 2 years
- Attachments for purged credit notes

**Purge Process**:
- Annual purge job runs at end of fiscal year
- Records exported to cold storage before purge
- Purge logged in audit system
- Irreversible operation, requires proper authorization

---

## Database Security

### Row-Level Security

**Location-Based Access**:
- Users can only view/edit credit notes for their assigned locations
- Implemented via location_id matching against user's location permissions
- Cross-location permission available for managers

**Vendor-Based Access**:
- Users can only create credit notes for vendors they have access to
- Vendor access controlled by user role and department

**Status-Based Access**:
- DRAFT: Can be edited by creator or procurement team
- COMMITTED: Read-only for all users except authorized void permission
- VOID: Read-only for all users

### Field-Level Security

**Sensitive Fields**:
- Cost variance: Hidden from non-finance users
- Posting reference: Hidden from non-finance users
- Audit fields (createdBy, updatedBy): Hidden from regular users, visible to auditors

### Audit Logging

**All Operations Logged**:
- INSERT, UPDATE, DELETE operations on all credit note tables
- Log includes: user ID, timestamp, operation type, old values, new values
- Logs stored in separate audit table, immutable
- Audit logs retained for 7 years minimum
- Sensitive operations (post, void) trigger additional detailed logging

---

## Backend Data Structures

This section defines data structures required for server actions and API contracts as specified in BR-BE-001 through BR-BE-014.

### Server Action Input/Output Structures

#### DD-BE-001: Credit Note CRUD Operation Structures

**CreateCreditNoteInput**:
- **Description**: Input structure for creating a new credit note via server action
- **Fields**:
  - vendorId: UUID (required) - Reference to vendor
  - creditType: CreditNoteType (required) - QUANTITY_RETURN or AMOUNT_DISCOUNT
  - documentDate: Date (required) - Credit note issue date
  - grnId: UUID (optional) - Reference to source GRN
  - invoiceReference: String (optional) - Original invoice number
  - taxInvoiceReference: String (optional) - Tax invoice number
  - creditReason: CreditNoteReason (required) - Reason code
  - description: String (required) - Detailed explanation
  - currency: String (required) - ISO currency code
  - exchangeRate: Decimal (required) - Exchange rate to base
  - items: Array of CreateCreditNoteItemInput (required) - At least one item

**CreateCreditNoteItemInput**:
- **Description**: Input structure for credit note line items
- **Fields**:
  - productId: UUID (required) - Product reference
  - location: String (conditional) - Required for QUANTITY_RETURN
  - cnQty: Decimal (conditional) - Required for QUANTITY_RETURN, must be > 0
  - unitPrice: Decimal (required) - Price per unit
  - discountAmount: Decimal (optional) - Line discount
  - taxRate: Decimal (required) - Tax rate percentage
  - grnNumber: String (optional) - Source GRN reference
  - appliedLots: Array of AppliedLotInput (conditional) - Required for QUANTITY_RETURN

**AppliedLotInput**:
- **Description**: Input structure for lot selections
- **Fields**:
  - lotNumber: String (required) - Inventory lot number
  - quantity: Decimal (required) - Return quantity from this lot
  - unitCost: Decimal (required) - Unit cost from lot

**UpdateCreditNoteInput**:
- **Description**: Input structure for updating draft credit note
- **Fields**: Same as CreateCreditNoteInput plus:
  - id: UUID (required) - Credit note ID to update

**CreditNoteResponse**:
- **Description**: Standard server action response structure
- **Fields**:
  - success: Boolean - Operation success indicator
  - data: CreditNote (optional) - Returned credit note object
  - error: ErrorDetails (optional) - Error information if failed
  - message: String (optional) - User-friendly message

**ErrorDetails**:
- **Description**: Structured error information
- **Fields**:
  - code: String - Error code (e.g., "VALIDATION_ERROR", "NOT_FOUND")
  - message: String - Technical error message
  - field: String (optional) - Field name for validation errors
  - details: Object (optional) - Additional error context

#### DD-BE-002: Vendor and GRN Fetch Structures

**VendorSearchInput**:
- **Description**: Input for vendor search/fetch
- **Fields**:
  - searchTerm: String (optional) - Search by name or code
  - isActive: Boolean (optional) - Filter by active status
  - limit: Integer (optional) - Max records to return
  - offset: Integer (optional) - Pagination offset

**VendorSearchResponse**:
- **Description**: Vendor search results
- **Fields**:
  - vendors: Array of VendorSummary - Matching vendors
  - total: Integer - Total count for pagination
  - hasMore: Boolean - More records available

**VendorSummary**:
- **Description**: Vendor information for selection
- **Fields**:
  - id: UUID - Vendor ID
  - code: String - Vendor code
  - name: String - Vendor name
  - contactEmail: String (optional) - Primary contact email
  - isActive: Boolean - Active status

**GRNSearchInput**:
- **Description**: Input for GRN search by vendor
- **Fields**:
  - vendorId: UUID (required) - Vendor to filter by
  - searchTerm: String (optional) - Search by GRN number or invoice
  - status: String (optional) - Filter by GRN status
  - fromDate: Date (optional) - Date range start
  - toDate: Date (optional) - Date range end
  - limit: Integer (optional) - Max records
  - offset: Integer (optional) - Pagination offset

**GRNSearchResponse**:
- **Description**: GRN search results
- **Fields**:
  - grns: Array of GRNSummary - Matching GRNs
  - total: Integer - Total count
  - hasMore: Boolean - More records available

**GRNSummary**:
- **Description**: GRN information for selection
- **Fields**:
  - id: UUID - GRN ID
  - grnNumber: String - GRN number
  - grnDate: Date - GRN date
  - invoiceNumber: String (optional) - Invoice reference
  - invoiceDate: Date (optional) - Invoice date
  - totalAmount: Decimal - GRN total
  - currency: String - Currency code

**GRNItemsResponse**:
- **Description**: GRN items with available lots
- **Fields**:
  - grnId: UUID - GRN ID
  - items: Array of GRNItemWithLots - Items with lot data

**GRNItemWithLots**:
- **Description**: GRN item with available inventory lots
- **Fields**:
  - productId: UUID - Product ID
  - productName: String - Product name
  - productCode: String - Product code
  - receivedQty: Decimal - Originally received quantity
  - unitPrice: Decimal - Unit price from GRN
  - orderUnit: String - Order unit of measure
  - inventoryUnit: String - Inventory unit
  - availableLots: Array of AvailableLot - Lots with available stock

**AvailableLot**:
- **Description**: Inventory lot available for return
- **Fields**:
  - lotNumber: String - Lot number
  - receiveDate: Date - Date lot was received
  - grnNumber: String - Source GRN
  - invoiceNumber: String (optional) - Source invoice
  - availableQty: Decimal - Available quantity for return
  - unitCost: Decimal - Lot unit cost (for inventory costing)

#### DD-BE-003: Commitment Transaction Structures

**CommitCreditNoteInput**:
- **Description**: Input for committing credit note to GL
- **Fields**:
  - creditNoteId: UUID (required) - Credit note to commit
  - commitmentDate: Date (required) - GL posting date

**CommitCreditNoteResponse**:
- **Description**: Commitment operation response
- **Fields**:
  - success: Boolean - Operation success
  - creditNote: CreditNote (optional) - Updated credit note
  - journalEntries: Array of JournalEntry (optional) - Generated entries
  - stockMovements: Array of StockMovement (optional) - Generated movements
  - commitmentReference: String (optional) - Journal voucher number
  - error: ErrorDetails (optional) - Error if failed

**JournalEntry**:
- **Description**: Generated journal entry line
- **Fields**:
  - id: UUID - Entry ID
  - accountCode: String - GL account code
  - accountName: String - GL account name
  - department: String - Department code
  - costCenter: String (optional) - Cost center
  - description: String - Entry description
  - reference: String - Document reference
  - debitAmount: Decimal - Debit amount (0 if credit)
  - creditAmount: Decimal - Credit amount (0 if debit)
  - taxCode: String (optional) - Tax code if applicable
  - entryOrder: Integer - Order within voucher
  - entryGroup: String - PRIMARY or INVENTORY

**StockMovement**:
- **Description**: Generated stock movement record
- **Fields**:
  - id: UUID - Movement ID
  - locationType: String - INV or CON
  - lotNumber: String - Lot number
  - quantity: Decimal - Movement quantity (negative for returns)
  - unitCost: Decimal - Unit cost
  - extraCost: Decimal - Extra costs per unit
  - movementDate: Date - Movement date
  - referenceType: String - "Credit Note"
  - referenceNumber: String - CN number
  - documentId: UUID - Credit note ID
  - totalValue: Decimal - Total movement value

#### DD-BE-004: Void Transaction Structures

**VoidCreditNoteInput**:
- **Description**: Input for voiding committed credit note
- **Fields**:
  - creditNoteId: UUID (required) - Credit note to void
  - voidReason: String (required) - Reason for voiding
  - voidDate: Date (required) - Void posting date

**VoidCreditNoteResponse**:
- **Description**: Void operation response
- **Fields**:
  - success: Boolean - Operation success
  - creditNote: CreditNote (optional) - Updated credit note with VOID status
  - reversingJournalEntries: Array of JournalEntry (optional) - Reversing entries
  - reversingStockMovements: Array of StockMovement (optional) - Reversing movements
  - voidReference: String (optional) - Void journal reference
  - error: ErrorDetails (optional) - Error if failed

#### DD-BE-005: Inventory Costing Structures

**CostCalculationInput**:
- **Description**: Input for inventory cost calculation (FIFO or Periodic Average)
- **Fields**:
  - productId: UUID (required) - Product for calculation
  - selectedLots: Array of LotSelection (required) - Lots with quantities (for FIFO)
  - creditNoteDate: Date (required) - Date for period calculation (for Periodic Average)

**LotSelection**:
- **Description**: Lot selection for costing
- **Fields**:
  - lotNumber: String (required) - Lot number
  - quantity: Decimal (required) - Return quantity from lot

**CostCalculationResult**:
- **Description**: Inventory costing calculation output
- **Fields**:
  - productId: UUID - Product ID
  - costingMethod: String - 'FIFO' or 'PERIODIC_AVERAGE'
  - totalReceivedQty: Decimal - Sum of lot quantities (FIFO) or period quantity (Periodic Average)
  - calculatedUnitCost: Decimal - Calculated cost (FIFO weighted average or period average)
  - currentUnitCost: Decimal - Current cost from product/GRN
  - costVariance: Decimal - Current minus weighted average
  - returnQuantity: Decimal - Total return quantity
  - returnAmount: Decimal - Return qty × current cost
  - costOfGoodsSold: Decimal - Return qty × weighted average
  - realizedGainLoss: Decimal - Return amount minus COGS
  - lotDetails: Array of LotCostDetail - Per-lot breakdown

**LotCostDetail**:
- **Description**: Individual lot cost details
- **Fields**:
  - lotNumber: String - Lot number
  - quantity: Decimal - Return quantity from lot
  - unitCost: Decimal - Lot unit cost
  - totalCost: Decimal - Quantity × unit cost
  - receiveDate: Date - Lot receive date
  - grnNumber: String - Source GRN

#### DD-BE-006: Tax Calculation Structures

**TaxCalculationInput**:
- **Description**: Input for tax calculation
- **Fields**:
  - documentDate: Date (required) - Date for tax rate lookup
  - items: Array of TaxableItem (required) - Items to calculate tax

**TaxableItem**:
- **Description**: Item for tax calculation
- **Fields**:
  - itemId: UUID - Item identifier
  - baseAmount: Decimal - Amount before tax
  - taxCode: String (optional) - Specific tax code

**TaxCalculationResult**:
- **Description**: Tax calculation output
- **Fields**:
  - totalBaseAmount: Decimal - Sum of base amounts
  - totalTaxAmount: Decimal - Sum of tax amounts
  - taxRate: Decimal - Applied tax rate
  - vatPeriod: String - VAT period name
  - vatReturnStatus: String - Open or Closed
  - items: Array of ItemTaxDetail - Per-item tax

**ItemTaxDetail**:
- **Description**: Individual item tax details
- **Fields**:
  - itemId: UUID - Item identifier
  - baseAmount: Decimal - Base amount
  - taxRate: Decimal - Tax rate applied
  - taxAmount: Decimal - Calculated tax
  - taxCode: String - Tax code used

#### DD-BE-007: Attachment Structures

**AttachmentUploadInput**:
- **Description**: Input for uploading attachment
- **Fields**:
  - creditNoteId: UUID (required) - Parent credit note
  - file: File (required) - File to upload
  - description: String (optional) - File description

**AttachmentUploadResponse**:
- **Description**: Upload response
- **Fields**:
  - success: Boolean - Upload success
  - attachment: CreditNoteAttachment (optional) - Created attachment
  - error: ErrorDetails (optional) - Error if failed

**AttachmentDeleteInput**:
- **Description**: Input for deleting attachment
- **Fields**:
  - attachmentId: UUID (required) - Attachment to delete

#### DD-BE-008: Audit Log Structures

**AuditLogEntry**:
- **Description**: Audit trail record structure
- **Fields**:
  - id: UUID - Log entry ID
  - entityType: String - "CreditNote"
  - entityId: UUID - Credit note ID
  - action: String - CREATE, UPDATE, COMMIT, VOID, DELETE
  - userId: UUID - User who performed action
  - userName: String - User display name
  - timestamp: Timestamp - When action occurred
  - ipAddress: String - Request source IP
  - oldValues: JSON (optional) - Previous field values
  - newValues: JSON (optional) - New field values
  - metadata: JSON (optional) - Additional context

**AuditLogQuery**:
- **Description**: Query for retrieving audit logs
- **Fields**:
  - entityId: UUID (optional) - Filter by credit note
  - action: String (optional) - Filter by action type
  - userId: UUID (optional) - Filter by user
  - fromDate: Date (optional) - Date range start
  - toDate: Date (optional) - Date range end
  - limit: Integer (optional) - Max records
  - offset: Integer (optional) - Pagination offset

#### DD-BE-009: CN Number Generation Structures

**CNNumberRequest**:
- **Description**: Request for new CN number
- **Fields**:
  - documentDate: Date (required) - For year determination
  - locationId: UUID (optional) - For location-specific sequences

**CNNumberResponse**:
- **Description**: Generated CN number
- **Fields**:
  - cnNumber: String - Generated number (e.g., CN-2401-001)
  - sequence: Integer - Sequence number used
  - year: Integer - Year component

#### DD-BE-010: Data Validation Structures

**ValidationResult**:
- **Description**: Validation operation result
- **Fields**:
  - isValid: Boolean - Overall validation status
  - errors: Array of ValidationError - List of validation errors
  - warnings: Array of ValidationWarning - Non-blocking warnings

**ValidationError**:
- **Description**: Individual validation error
- **Fields**:
  - field: String - Field name with error
  - code: String - Error code
  - message: String - Error message
  - value: Any (optional) - Invalid value

**ValidationWarning**:
- **Description**: Non-blocking validation warning
- **Fields**:
  - field: String - Field name
  - code: String - Warning code
  - message: String - Warning message

### Database Transaction Patterns

#### DD-BE-011: Atomic Transaction Requirements

**CommitmentTransaction**:
- **Description**: Atomic transaction for credit note commitment
- **Steps** (all must succeed or rollback):
  1. Validate credit note state (DRAFT)
  2. Validate accounting period open
  3. Generate and insert journal entries
  4. Generate and insert stock movements (QUANTITY_RETURN only)
  5. Update inventory lot balances
  6. Update vendor payable balance
  7. Update credit note status to COMMITTED
  8. Create audit log entry
- **Isolation Level**: Serializable
- **Lock Pattern**: Pessimistic locking on credit note record

**VoidTransaction**:
- **Description**: Atomic transaction for credit note void
- **Steps** (all must succeed or rollback):
  1. Validate credit note state (COMMITTED)
  2. Validate no dependent transactions
  3. Validate accounting period open
  4. Generate and insert reversing journal entries
  5. Generate and insert reversing stock movements
  6. Restore inventory lot balances
  7. Restore vendor payable balance
  8. Update credit note status to VOID
  9. Create audit log entry
- **Isolation Level**: Serializable
- **Lock Pattern**: Pessimistic locking on credit note and related records

---

## Glossary

**FIFO (First-In-First-Out)**: Inventory costing method that calculates costs based on oldest inventory layers first. Used to calculate weighted average cost of returned goods. One of two configurable costing methods in the system.

**Periodic Average**: Inventory costing method that calculates costs using weighted average for the period (Total Value in Period / Total Quantity in Period). One of two configurable costing methods in the system.

**Cost Variance**: Difference between current inventory cost and calculated cost (using FIFO weighted average or Periodic Average, depending on system configuration). Positive variance means current cost higher than calculated cost (loss on return), negative variance means lower (gain on return).

**Realized Gain/Loss**: Financial impact of cost variance on credit note, calculated as (return quantity × current cost) - (return quantity × calculated cost).

**Lot Tracking**: System capability to track specific inventory batches (lots) with unique identifiers for quality control and regulatory compliance.

**Input VAT**: Value-added tax paid on purchases that can be credited against output VAT. Credit notes reduce input VAT previously claimed.

**Journal Voucher**: Accounting document containing GL entries generated from credit note commitment.

**Stock Movement**: Inventory transaction record showing quantity changes by location and lot number. Credit notes generate negative stock movements (reduce inventory).

**GL Account**: General Ledger account number used in financial system for commitment transactions.

**Primary Entries**: Main journal entries for accounts payable credit and inventory/tax adjustments.

**Inventory Entries**: Additional journal entries for cost variances between current cost and calculated cost (FIFO or Periodic Average).

**Commitment Date**: Date when credit note was committed to general ledger, used for GL period determination.

**Void**: Reverse a committed credit note by creating reversing journal entries and stock movements, restoring original balances.

---

**Document Control**:
- **Classification**: Internal Use
- **Distribution**: Development Team, Database Team, Procurement Team, Finance Team
- **Review Cycle**: Quarterly or when data model changes
- **Document Approval**: Database Administrator, Technical Lead

**End of Document**
