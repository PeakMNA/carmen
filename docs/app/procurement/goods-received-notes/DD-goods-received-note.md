# Data Definition: Goods Received Note

## Module Information
- **Module**: Procurement
- **Sub-Module**: Goods Received Note (GRN)
- **Database**: PostgreSQL (via Supabase)
- **Schema Version**: 1.0.2
- **Last Updated**: 2025-12-03
- **Owner**: Procurement Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.2 | 2025-12-03 | Documentation Team | Added context for inventory costing methods (FIFO or Periodic Average) used for inventory valuation |
| 1.0.1 | 2025-12-03 | Documentation Team | Verified coverage against BR requirements (FR-GRN-001 to FR-GRN-017) |
| 1.0.0 | 2025-01-11 | Documentation Team | Initial version from type definitions analysis |

---

## Overview

The Goods Received Note data model manages the recording and tracking of goods received from vendors. The model supports two distinct workflows: PO-based receiving (linked to purchase orders) and manual receiving (standalone entries). It captures complete receiving documentation including item details, quantities, discrepancies, financial calculations, and automatic stock movements upon commitment.

The data model consists of four primary entities: GoodsReceiveNote (header), GoodsReceiveNoteItem (line items), ExtraCost (additional costs), and StockMovement (inventory transactions). Supporting enumerations define status values and discrepancy types. The model supports multi-currency transactions and comprehensive audit trails.

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**
- **DO NOT include SQL code** - describe database structures in text
- **DO NOT include CREATE TABLE statements** - describe table purposes and fields
- **DO NOT include mermaid ERD diagrams** - describe relationships in text
- **DO include**: Entity descriptions, field definitions, relationship explanations, business rules
- **Focus on**: WHAT data is stored, WHY it exists, HOW it relates - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-goods-received-note.md)
- [Technical Specification](./TS-goods-received-note.md)
- [Use Cases](./UC-goods-received-note.md)
- [Flow Diagrams](./FD-goods-received-note.md)
- [Validations](./VAL-goods-received-note.md)

---

## Entity Relationship Overview

**Primary Entities**:
- **GoodsReceiveNote**: Header entity representing a goods receipt transaction from a vendor
- **GoodsReceiveNoteItem**: Line item entity representing individual products received
- **ExtraCost**: Supporting entity for additional costs (freight, handling, insurance, customs)
- **StockMovement**: Generated entity tracking inventory movements when GRN is committed
- **Comment**: Supporting entity for user comments on GRN
- **Attachment**: Supporting entity for file attachments
- **ActivityLog**: Supporting entity for audit trail of GRN operations

**Key Relationships**:

1. **GoodsReceiveNote → GoodsReceiveNoteItem**: One-to-Many relationship
   - Business meaning: A single goods receipt can contain multiple product lines
   - Cardinality: One GRN has 1 to many items (at least one item required)
   - Example: One GRN for kitchen equipment delivery contains 2 items (blender and knives)

2. **GoodsReceiveNote → ExtraCost**: One-to-Many relationship
   - Business meaning: A goods receipt can have multiple additional costs
   - Cardinality: One GRN has 0 to many extra costs
   - Example: One GRN has 2 extra costs (freight and handling fees)

3. **GoodsReceiveNote → StockMovement**: One-to-Many relationship
   - Business meaning: Committing a GRN generates inventory movements for each item
   - Cardinality: One GRN generates 0 to many stock movements (one per item, only when committed)
   - Example: Committed GRN with 2 items generates 2 stock movements

4. **GoodsReceiveNote → PurchaseOrder**: Many-to-One optional relationship
   - Business meaning: PO-based GRNs reference source purchase order
   - Cardinality: Many GRNs can reference one PO (partial receipts), or no PO (manual GRNs)
   - Example: Large PO received in 3 separate deliveries creates 3 GRNs referencing same PO

5. **GoodsReceiveNote → Vendor**: Many-to-One relationship
   - Business meaning: All goods received from a vendor
   - Cardinality: Many GRNs reference one vendor
   - Example: Professional Kitchen Supplies has delivered 50 GRNs this year

6. **GoodsReceiveNoteItem → Product**: Many-to-One relationship
   - Business meaning: Each line item references a product from the catalog
   - Cardinality: Many GRN items reference one product
   - Example: Commercial blenders received in 10 different GRNs

7. **GoodsReceiveNoteItem → PurchaseOrderItem**: Many-to-One optional relationship
   - Business meaning: PO-based GRN items link to source PO line items
   - Cardinality: Many GRN items can reference one PO item (split receipts), or no PO item (manual)
   - Example: PO line for 100 units received in 2 deliveries creates 2 GRN items linked to same PO item

8. **GoodsReceiveNoteItem → Location**: Many-to-One relationship
   - Business meaning: Each received item assigned to storage location
   - Cardinality: Many GRN items reference one location
   - Example: 20 items from different GRNs all stored in "Kitchen Storage" location

**Relationship Notes**:
- All relationships enforce referential integrity with foreign key constraints
- Parent GoodsReceiveNote must exist before child items can be created
- Stock movements only generated when GRN status changes to COMMITTED
- Deleting a GRN cascades to delete all child items, extra costs, comments, attachments
- Soft delete pattern used for GRNs to preserve audit trail (deleted_at field instead of hard delete)

---

## Data Entities

### Entity: GoodsReceiveNote

**Description**: Represents a goods receipt transaction documenting the delivery and acceptance of goods from a vendor. Each GRN serves as an official record of what was received, inspected, and committed into inventory.

**Business Purpose**: Provides complete documentation of goods receipt for inventory management, vendor payment processing, and audit compliance. Serves as the bridge between purchase orders and inventory updates.

**Data Ownership**: Procurement Department, with shared access for warehouse and finance teams

**Access Pattern**:
- Primarily accessed by GRN number (business key)
- Frequently filtered by status, vendor, date range, location
- Sorted by receipt date (descending) for recent GRNs
- Searched by vendor name, invoice number

**Data Volume**: Approximately 500 records per month, 6,000 records per year across all locations

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID, auto-generated)
- **Business Key**: grnNumber - Human-readable unique identifier following format GRN-YYMM-NNNN
- **Display Name**: grnNumber concatenated with vendor name

**Core Business Fields**:
- **receiptDate**: Date when goods were physically received at facility
  - Required: Yes
  - Data type: Date
  - Example: "2024-01-15"
  - Constraint: Cannot be in the future

- **vendorId**: Reference to the vendor who supplied the goods
  - Required: Yes
  - Data type: UUID
  - Links to Vendor entity

- **vendorName**: Denormalized vendor name for display and search
  - Required: Yes
  - Data type: String (max 255 characters)
  - Example: "Professional Kitchen Supplies"

- **purchaseOrderId**: (DEPRECATED) Optional reference to source purchase order
  - Required: No (NULL for manual GRNs)
  - Data type: UUID
  - Links to PurchaseOrder entity
  - **DEPRECATED**: For multi-PO support, PO references are now stored at line item level. Retained for backward compatibility.

- **purchaseOrderNumber**: (DEPRECATED) Denormalized PO number for display
  - Required: No
  - Data type: String
  - Example: "PO-2401-0001"

**Delivery Documentation**:
- **invoiceNumber**: Vendor's invoice number
  - Required: No
  - Data type: String (max 100 characters)
  - Example: "INV-20240115-001"

- **invoiceDate**: Date on vendor's invoice
  - Required: No
  - Data type: Date

- **deliveryNote**: Delivery note or packing slip reference
  - Required: No
  - Data type: String (max 100 characters)

- **vehicleNumber**: Delivery vehicle registration
  - Required: No
  - Data type: String (max 50 characters)
  - Example: "ABC-1234"

- **driverName**: Name of delivery driver
  - Required: No
  - Data type: String (max 100 characters)

**Status and Workflow**:
- **status**: Tracks GRN lifecycle state
  - Required: Yes
  - Data type: Enum (GRNStatus)
  - Allowed values: DRAFT, RECEIVED, COMMITTED, VOID
  - Default: DRAFT
  - Status transitions:
    - DRAFT → RECEIVED (when saved)
    - DRAFT/RECEIVED → COMMITTED (when finalized)
    - Any status → VOID (when cancelled)
  - Business rule: COMMITTED status cannot transition back

**Personnel Fields**:
- **receivedBy**: Name of person who received the goods
  - Required: Yes
  - Data type: String (max 100 characters)
  - Example: "Alice Thompson"

- **committedBy**: Name of person who committed the GRN
  - Required: No (set when GRN is committed)
  - Data type: String (max 100 characters)

**Location Fields**:
- **locationId**: Receiving location where goods were received
  - Required: Yes
  - Data type: UUID
  - Links to Location entity
  - Example: Location code "WH-MAIN"

**Summary Metrics**:
- **totalItems**: Count of line items in GRN
  - Required: Yes
  - Data type: Integer
  - Calculated: Sum of item count
  - Example: 5 (if GRN has 5 different items)

- **totalQuantity**: Sum of all received quantities
  - Required: Yes
  - Data type: Decimal
  - Calculated: Sum of item receivedQuantity fields
  - Example: 125.5 (total units/kg across all items)

- **totalValue**: Total monetary value including all costs
  - Required: Yes
  - Data type: Money (amount + currency)
  - Calculated: Sum of item totals + extra costs + tax
  - Example: {amount: 4859.85, currency: "USD"}

- **discrepancies**: Count of items flagged with discrepancies
  - Required: Yes
  - Data type: Integer
  - Calculated: Count of items where hasDiscrepancy = true
  - Example: 2 (if 2 items have discrepancies)

**Additional Information**:
- **notes**: General notes or comments about the receipt
  - Required: No
  - Data type: Text
  - Example: "Partial shipment, balance to follow next week"

- **attachments**: Array of file attachment URLs
  - Required: No
  - Data type: Array of strings
  - Example: ['https://storage.example.com/delivery-note.pdf']

**Audit Fields** (Standard):
- **createdDate**: Timestamp when GRN was created
- **createdBy**: User ID who created GRN
- **updatedDate**: Timestamp of last modification
- **updatedBy**: User ID who last modified GRN
- **deletedAt**: Soft delete timestamp (NULL for active GRNs)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto | Primary key identifier | 550e8400-e29b-41d4-... | Unique, Non-null |
| grnNumber | VARCHAR(50) | Yes | Auto | Business identifier | GRN-2401-0001 | Unique, Format: GRN-YYMM-NNNN |
| receiptDate | DATE | Yes | - | Date goods received | 2024-01-15 | Cannot be future |
| vendorId | UUID | Yes | - | Vendor reference | 550e8400-... | FK to vendors.id |
| vendorName | VARCHAR(255) | Yes | - | Vendor name (denormalized) | Professional Kitchen Supplies | Non-empty |
| purchaseOrderId | UUID | No | NULL | (DEPRECATED) PO reference - use line item level | 550e8400-... | FK to purchase_orders.id |
| purchaseOrderNumber | VARCHAR(50) | No | NULL | (DEPRECATED) PO number - use line item level | PO-2401-0001 | - |
| invoiceNumber | VARCHAR(100) | No | NULL | Vendor invoice number | INV-20240115-001 | - |
| invoiceDate | DATE | No | NULL | Invoice date | 2024-01-14 | - |
| deliveryNote | VARCHAR(100) | No | NULL | Delivery note reference | DN-12345 | - |
| vehicleNumber | VARCHAR(50) | No | NULL | Delivery vehicle number | ABC-1234 | - |
| driverName | VARCHAR(100) | No | NULL | Driver name | John Smith | - |
| status | VARCHAR(20) | Yes | DRAFT | GRN lifecycle status | RECEIVED | Must be DRAFT\|RECEIVED\|COMMITTED\|VOID |
| receivedBy | VARCHAR(100) | Yes | - | Receiver name | Alice Thompson | Non-empty |
| committedBy | VARCHAR(100) | No | NULL | Person who committed GRN | Bob Wilson | - |
| locationId | UUID | Yes | - | Receiving location | 550e8400-... | FK to locations.id |
| totalItems | INTEGER | Yes | 0 | Count of items | 5 | ≥ 0 |
| totalQuantity | DECIMAL(15,3) | Yes | 0.000 | Sum of quantities | 125.500 | ≥ 0 |
| totalValue | DECIMAL(15,2) | Yes | 0.00 | Total amount | 4859.85 | ≥ 0 |
| discrepancies | INTEGER | Yes | 0 | Count of discrepancy items | 2 | ≥ 0 |
| notes | TEXT | No | NULL | General notes | Partial shipment... | - |
| attachments | TEXT[] | No | NULL | File URLs array | ['https://...'] | Valid URLs |
| createdDate | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2024-01-15T10:00:00Z | Immutable |
| createdBy | UUID | Yes | - | Creator user ID | 550e8400-... | FK to users.id |
| updatedDate | TIMESTAMPTZ | Yes | NOW() | Update timestamp | 2024-01-15T15:00:00Z | Auto-updated |
| updatedBy | UUID | Yes | - | Updater user ID | 550e8400-... | FK to users.id |
| deletedAt | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL or timestamp | NULL for active |

#### Data Constraints and Rules

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated
- Purpose: Uniquely identifies each GRN across system

**Unique Constraints**:
- `grnNumber`: Must be unique among all GRNs (including soft-deleted)
  - Format: GRN-{YYMM}-{NNN} where YY is year, MM is month, and NNN is sequential 3-digit number
  - Sequential numbering resets each calendar month

**Foreign Key Relationships**:
- **Vendor** (`vendorId` → `vendors.id`)
  - On Delete: RESTRICT (cannot delete vendor with GRNs)
  - On Update: CASCADE
  - Business rule: All goods must have valid vendor reference

- **Purchase Order** (`purchaseOrderId` → `purchase_orders.id`) - (DEPRECATED)
  - On Delete: SET NULL (preserve GRN even if PO deleted)
  - On Update: CASCADE
  - **DEPRECATED**: For multi-PO support, PO references now stored at line item level. Retained for backward compatibility.

- **Location** (`locationId` → `locations.id`)
  - On Delete: RESTRICT (cannot delete location with GRNs)
  - On Update: CASCADE
  - Business rule: Receiving location must be valid warehouse or receiving area

- **Users** (`createdBy`, `updatedBy` → `users.id`)
  - On Delete: SET NULL (preserve audit trail even if user deleted)
  - On Update: CASCADE
  - Business rule: Track user accountability for GRN operations

**Check Constraints**:
- **Status values**: Must be one of: DRAFT, RECEIVED, COMMITTED, VOID
- **Receipt date**: Cannot be more than 30 days in the future
- **Total values**: totalItems, totalQuantity, totalValue must be ≥ 0

**Business Rules Enforced**:
- GRN must have at least one item before commitment (totalItems > 0)
- All items must have storage locations assigned before commitment
- COMMITTED status GRNs are immutable (updates prevented)
- VOID status GRNs are read-only (preserved for audit)

---

### Entity: GoodsReceiveNoteItem

**Description**: Represents an individual product line item within a goods receipt, capturing quantities received, pricing, discrepancies, and traceability information like batch numbers and expiry dates.

**Business Purpose**: Provides detailed item-level tracking of received goods, enabling inventory updates, cost accounting, and discrepancy management at the SKU level.

**Data Ownership**: Procurement and Warehouse Departments

**Access Pattern**:
- Primarily accessed via parent GRN ID
- Filtered by item code, discrepancy flags
- Sorted by line number within GRN

**Data Volume**: Approximately 2,500 records per month (average 5 items per GRN), 30,000 records per year

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID)
- **Line Number**: Sequential number within parent GRN (1, 2, 3...)
- **Parent Reference**: grnId linking to parent GoodsReceiveNote

**Item Identification**:
- **itemId**: Reference to product in catalog
- **itemCode**: Product SKU or code
- **itemName**: Product name
- **description**: Detailed item description

**Purchase Order Reference** (Multi-PO Support):
- **purchaseOrderId**: Optional link to source purchase order (NULL for manual GRNs)
  - Data type: UUID
  - Links to PurchaseOrder entity
  - Enables multi-PO receiving: each line can reference a different PO
- **purchaseOrderItemId**: Optional link to source PO line item (NULL for manual GRNs)
  - Data type: UUID
  - Links to PurchaseOrderItem entity

**Quantity Tracking**:
- **orderedQuantity**: Quantity originally ordered (from PO, NULL for manual)
- **deliveredQuantity**: Quantity actually delivered by vendor
- **receivedQuantity**: Quantity accepted into stock
- **rejectedQuantity**: Quantity rejected for any reason
- **damagedQuantity**: Quantity damaged during delivery

**Unit and Pricing**:
- **unit**: Unit of measure (kg, piece, box, liter, etc.)
- **unitPrice**: Price per unit (Money type with amount and currency)
- **totalValue**: Line total = received quantity × unit price + allocated extra cost

**Batch and Traceability**:
- **batchNumber**: Manufacturing batch identifier
- **lotNumber**: Lot number for tracking
- **serialNumbers**: Array of serial numbers for serialized items
- **manufacturingDate**: Date product was manufactured
- **expiryDate**: Expiration date for perishable items

**Storage**:
- **storageLocationId**: Assigned storage location (warehouse, cold storage, etc.)

**Discrepancy Tracking**:
- **hasDiscrepancy**: Boolean flag if item has any discrepancy
- **discrepancyType**: Type of discrepancy (quantity, damage, other)
- **discrepancyNotes**: Detailed explanation of discrepancy

**Additional Notes**:
- **notes**: Item-specific notes

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto | Primary key identifier | 550e8400-... | Unique |
| grnId | UUID | Yes | - | Parent GRN reference | 550e8400-... | FK to grn.id, CASCADE delete |
| lineNumber | INTEGER | Yes | - | Sequential line number | 1, 2, 3 | > 0 |
| purchaseOrderId | UUID | No | NULL | PO reference (Multi-PO) | 550e8400-... | FK to purchase_orders.id |
| purchaseOrderItemId | UUID | No | NULL | PO item reference | 550e8400-... | FK to po_items.id |
| itemId | UUID | Yes | - | Product reference | 550e8400-... | FK to products.id |
| itemCode | VARCHAR(100) | Yes | - | Product SKU | PROD-123 | Non-empty |
| itemName | VARCHAR(255) | Yes | - | Product name | Commercial Blender | Non-empty |
| description | TEXT | Yes | - | Item description | High-power commercial blender | - |
| orderedQuantity | DECIMAL(15,3) | No | NULL | Quantity ordered (from PO) | 10.000 | ≥ 0 |
| deliveredQuantity | DECIMAL(15,3) | Yes | - | Quantity delivered | 10.000 | > 0 |
| receivedQuantity | DECIMAL(15,3) | Yes | - | Quantity accepted | 9.000 | ≥ 0 |
| rejectedQuantity | DECIMAL(15,3) | Yes | 0.000 | Quantity rejected | 1.000 | ≥ 0 |
| damagedQuantity | DECIMAL(15,3) | Yes | 0.000 | Quantity damaged | 0.000 | ≥ 0 |
| unit | VARCHAR(50) | Yes | - | Unit of measure | piece | Non-empty |
| unitPrice | DECIMAL(15,2) | Yes | - | Price per unit | 249.99 | ≥ 0 |
| totalValue | DECIMAL(15,2) | Yes | - | Line total amount | 2249.91 | ≥ 0 |
| batchNumber | VARCHAR(100) | No | NULL | Batch identifier | BATCH-2401-0001 | - |
| lotNumber | VARCHAR(100) | No | NULL | Lot identifier | LOT-2401-0013 | - |
| serialNumbers | TEXT[] | No | NULL | Serial numbers array | ['SN001', 'SN002'] | - |
| manufacturingDate | DATE | No | NULL | Manufacturing date | 2024-01-01 | - |
| expiryDate | DATE | No | NULL | Expiration date | 2025-01-01 | Must be after mfg date |
| storageLocationId | UUID | Yes | - | Storage location | 550e8400-... | FK to locations.id |
| hasDiscrepancy | BOOLEAN | Yes | false | Discrepancy flag | true | - |
| discrepancyType | VARCHAR(20) | No | NULL | Type of discrepancy | quantity | quantity\|damage\|other |
| discrepancyNotes | TEXT | No | NULL | Discrepancy details | Received 9 instead of 10 | Required if hasDiscrepancy |
| notes | TEXT | No | NULL | Item notes | Store in cool area | - |

#### Data Constraints and Rules

**Primary Key**: `id` (UUID)

**Foreign Key Relationships**:
- **GRN** (`grnId` → `grn.id`)
  - On Delete: CASCADE (deleting GRN deletes all items)
  - On Update: CASCADE

- **Product** (`itemId` → `products.id`)
  - On Delete: RESTRICT (cannot delete product with GRN history)
  - On Update: CASCADE

- **Location** (`storageLocationId` → `locations.id`)
  - On Delete: RESTRICT
  - On Update: CASCADE

- **Purchase Order** (`purchaseOrderId` → `purchase_orders.id`) - Multi-PO Support
  - On Delete: RESTRICT
  - On Update: CASCADE
  - NULL allowed for manual GRN items

- **PO Item** (`purchaseOrderItemId` → `purchase_order_items.id`)
  - On Delete: RESTRICT
  - On Update: CASCADE
  - NULL allowed for manual GRN items

**Check Constraints**:
- `receivedQuantity` + `rejectedQuantity` + `damagedQuantity` ≤ `deliveredQuantity`
- `expiryDate` must be after `manufacturingDate` (if both not NULL)
- If `hasDiscrepancy` is true, `discrepancyType` and `discrepancyNotes` must not be NULL

**Unique Constraints**:
- Combination of (`grnId`, `lineNumber`) must be unique

**Business Rules**:
- Line number must be sequential starting from 1
- Received quantity must be > 0
- Total value calculated as: (receivedQuantity × unitPrice) + allocatedExtraCost

---

### Entity: ExtraCost

**Description**: Represents additional costs associated with goods receipt beyond item prices, such as freight, handling fees, insurance, and customs duties. These costs are distributed across received items using configurable methods.

**Business Purpose**: Accurate cost accounting by allocating all receipt-related costs to inventory items, ensuring true landed cost is reflected in inventory valuation. This landed cost becomes the basis for inventory layers used by the system-configured costing method (FIFO or Periodic Average) when inventory is consumed.

**Data Ownership**: Procurement and Finance Departments

**Access Pattern**: Accessed via parent GRN ID

**Data Volume**: Approximately 100 records per month (20% of GRNs have extra costs), 1,200 records per year

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto | Primary key | 550e8400-... | Unique |
| grnId | UUID | Yes | - | Parent GRN reference | 550e8400-... | FK to grn.id, CASCADE delete |
| type | VARCHAR(50) | Yes | - | Cost type | shipping | shipping\|handling\|insurance\|customs |
| amount | DECIMAL(15,2) | Yes | - | Cost amount | 360.00 | > 0 |
| currency | VARCHAR(3) | Yes | - | ISO currency code | USD | Valid ISO 4217 code |
| exchangeRate | DECIMAL(10,6) | Yes | 1.000000 | Exchange rate to base | 1.080000 | > 0 |
| baseAmount | DECIMAL(15,2) | Yes | - | Amount in base currency | 360.00 | > 0 |
| baseCurrency | VARCHAR(3) | Yes | USD | Base currency | USD | Valid ISO 4217 code |

**Foreign Key Relationships**:
- **GRN** (`grnId` → `grn.id`)
  - On Delete: CASCADE
  - On Update: CASCADE

**Check Constraints**:
- `type` must be one of: shipping, handling, insurance, customs
- `amount` and `baseAmount` must be > 0
- `exchangeRate` must be > 0

---

### Entity: StockMovement

**Description**: System-generated entity representing inventory movements created when a GRN is committed. Each item in the committed GRN generates a stock movement record transferring goods from receiving area to assigned storage location.

**Business Purpose**: Provides audit trail of all inventory changes, enables inventory reconciliation, and maintains before/after stock level history for each movement.

**Data Ownership**: Inventory Management Module (auto-generated, read-only)

**Access Pattern**: Accessed via GRN ID or item ID, filtered by location and date

**Data Volume**: Approximately 2,500 records per month (matches item count), 30,000 records per year

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto | Primary key | 550e8400-... | Unique |
| grnId | UUID | Yes | - | Source GRN reference | 550e8400-... | FK to grn.id |
| itemId | UUID | Yes | - | Product reference | 550e8400-... | FK to products.id |
| itemName | VARCHAR(255) | Yes | - | Product name | Commercial Blender | Denormalized |
| lotNumber | VARCHAR(100) | No | NULL | Lot number | LOT-2401-0013 | - |
| quantity | DECIMAL(15,3) | Yes | - | Movement quantity | 9.000 | > 0 |
| unit | VARCHAR(50) | Yes | - | Unit of measure | piece | - |
| fromLocation | VARCHAR(255) | Yes | - | Source location | Kitchen Receiving | - |
| toLocation | VARCHAR(255) | Yes | - | Destination location | Kitchen Storage | - |
| cost | DECIMAL(15,2) | Yes | - | Unit cost | 249.99 | ≥ 0 |
| totalCost | DECIMAL(15,2) | Yes | - | Total cost | 2249.91 | ≥ 0 |
| currency | VARCHAR(3) | Yes | USD | Currency code | USD | Valid ISO code |
| beforeStock | DECIMAL(15,3) | Yes | - | Stock level before | 5.000 | ≥ 0 |
| afterStock | DECIMAL(15,3) | Yes | - | Stock level after | 14.000 | ≥ 0 |
| movementDate | TIMESTAMPTZ | Yes | NOW() | Movement timestamp | 2024-01-15T16:00:00Z | - |

**Foreign Key Relationships**:
- **GRN** (`grnId` → `grn.id`)
  - On Delete: RESTRICT (cannot delete GRN with stock movements)
  - On Update: CASCADE

- **Product** (`itemId` → `products.id`)
  - On Delete: RESTRICT
  - On Update: CASCADE

**Check Constraints**:
- `quantity` must be > 0
- `afterStock` should equal `beforeStock` + `quantity`
- `totalCost` should equal `quantity` × `cost`

**Business Rules**:
- Stock movements are system-generated and immutable
- Created only when GRN status changes to COMMITTED
- One stock movement per GRN item
- Movement date matches GRN commitment timestamp

---

## Enumerations and Reference Data

### GRNStatus Enumeration

**Purpose**: Defines valid lifecycle states for GRN entity

**Values**:
- **DRAFT**: Initial state, GRN being created, fully editable, no inventory impact
- **RECEIVED**: Goods received and documented, still editable, no inventory impact
- **COMMITTED**: GRN finalized, stock movements generated, inventory updated, immutable
- **VOID**: GRN cancelled, preserved for audit, read-only, no inventory impact

**Status Transitions**:
- DRAFT → RECEIVED (user saves GRN)
- DRAFT → COMMITTED (user saves and commits directly)
- RECEIVED → COMMITTED (user commits GRN)
- Any status → VOID (user or manager voids GRN)
- COMMITTED cannot transition to any other status except VOID

### Discrepancy Type Enumeration

**Purpose**: Categorizes types of discrepancies between ordered and received goods

**Values**:
- **quantity**: Quantity variance (short or over delivery)
- **damage**: Items damaged during delivery
- **other**: Other discrepancies not covered by quantity or damage

### Cost Type Enumeration

**Purpose**: Categorizes types of extra costs

**Values**:
- **shipping**: Freight and transportation costs
- **handling**: Handling and loading fees
- **insurance**: Insurance coverage costs
- **customs**: Customs duties and import fees

---

## Data Integrity and Validation

### Referential Integrity

All foreign key relationships enforce cascading updates and appropriate delete behaviors:
- Parent-child relationships (GRN → items, extra costs) use CASCADE delete
- Reference data relationships (GRN → vendor, location) use RESTRICT delete
- User audit references use SET NULL to preserve history

### Data Validation Rules

**At Database Level**:
- All required fields enforced with NOT NULL constraints
- Check constraints for status values, amounts, dates
- Unique constraints on business keys
- Foreign key constraints for referential integrity

**At Application Level** (see Validations document):
- Complex business rule validation
- Cross-field validation
- Workflow-specific validation
- User permission validation

---

## Data Retention and Archival

### Retention Policy

- **Active GRNs**: Retained indefinitely in primary database
- **Voided GRNs**: Retained for 7 years for audit compliance
- **Committed GRNs**: Retained for 7 years (matches financial audit requirements)
- **Draft/Received GRNs**: Retained for 1 year, then archived

### Soft Delete Pattern

GRNs use soft delete pattern with `deletedAt` timestamp:
- Active records: `deletedAt` is NULL
- Deleted records: `deletedAt` contains deletion timestamp
- Soft-deleted records excluded from default queries
- Soft-deleted records retained for audit trail and recovery

---

## Performance Considerations

### Indexing Strategy

**Primary Indexes** (performance-critical):
- `grn.id` (Primary key, clustered index)
- `grn.grnNumber` (Unique index for business key lookup)
- `grn.vendorId` (Foreign key index for vendor filtering)
- `grn.status` (Index for status filtering)
- `grn.receiptDate` (Index for date range queries)
- `grn_items.grnId` (Foreign key index for item lookup)
- `grn_items.itemId` (Foreign key index for product history)

**Composite Indexes**:
- `(vendorId, receiptDate DESC)` for vendor history queries
- `(status, receiptDate DESC)` for status-filtered lists
- `(locationId, receiptDate DESC)` for location-based reporting

### Query Optimization

- Denormalized fields (vendorName, itemName) reduce join operations
- Summary fields (totalItems, totalQuantity, totalValue) avoid aggregation queries
- Read-heavy operations optimized with appropriate indexes
- Soft delete queries use partial index on `deletedAt IS NULL`

---

## Security and Access Control

### Row-Level Security

- Users can only access GRNs for their assigned locations (unless cross-location permission granted)
- Finance team has read-only access to committed GRNs
- Procurement managers have full access across all locations

### Data Encryption

- Sensitive fields (not applicable in this module) would use application-level encryption
- All data encrypted at rest (database-level encryption)
- All data encrypted in transit (TLS 1.2+)

### Audit Trail

- All modifications logged in audit_log table
- Created/updated fields track user and timestamp
- Activity log captures all status changes and significant operations

---

## Appendix

### Related Documents
- [Business Requirements](./BR-goods-received-note.md)
- [Technical Specification](./TS-goods-received-note.md)
- [Use Cases](./UC-goods-received-note.md)
- [Flow Diagrams](./FD-goods-received-note.md)
- [Validations](./VAL-goods-received-note.md)

### Change History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-01-11 | Initial data model from type definitions | Documentation Team |

---

**Document End**

> 📝 **Note to Reviewers**:
> - This document describes data structures found in lib/types/procurement.ts
> - All entities and fields documented exist in current type definitions
> - No fictional data structures added
> - Review for accuracy against TypeScript interfaces
