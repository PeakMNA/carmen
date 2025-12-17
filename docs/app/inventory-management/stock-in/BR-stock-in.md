# Business Requirements: Stock In

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Stock In
- **Route**: `/inventory-management/stock-in`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-01-11 | System | Initial version based on UI prototype and inventory transactions system |


## Overview

The Stock In sub-module provides a unified interface for recording and managing all inbound inventory movements across the organization. It serves as the central transaction processing system for goods entering inventory, regardless of the source (procurement, returns, transfers, or adjustments).

Stock In transactions create permanent audit trails of inventory increases, integrate with the Inventory Valuation Service for accurate costing, and trigger downstream financial postings. The module supports five transaction types: Goods Received Notes (GRN) from procurement, incoming stock transfers from other locations, issue returns from departments, positive stock adjustments from reconciliations, and credit note goods handling.

This module acts as the primary data entry and transaction management interface while delegating cost calculation to the centralized Inventory Valuation Service and financial posting to the Finance module.

## Business Objectives

1. **Unified Transaction Recording**: Provide a single, consistent interface for recording all types of inbound inventory movements, reducing training needs and user errors
2. **Inventory Accuracy**: Ensure real-time, accurate inventory balance updates across all locations with complete audit trails for compliance and variance analysis
3. **Cost Integrity**: Integrate with centralized Inventory Valuation Service to ensure consistent, accurate cost calculation across all transaction types using FIFO or Periodic Average methods
4. **Operational Efficiency**: Streamline inbound processing with bulk operations, auto-save capabilities, and intelligent defaults to reduce data entry time by 40%
5. **Compliance and Auditability**: Maintain complete, immutable transaction history with user tracking, timestamps, and document attachments for regulatory compliance and financial audits
6. **Financial Integration**: Enable seamless integration with Finance module through automated GL posting of inventory movements, ensuring GAAP-compliant inventory accounting
7. **Multi-Location Support**: Support complex inventory movements across multiple storage locations, departments, and cost centers with location-specific tracking and reporting
8. **Data Quality**: Enforce business rules and validation at transaction entry to prevent data errors, negative inventory, and incorrect financial postings

## Key Stakeholders

- **Primary Users**: Storekeeper, Inventory Coordinators (daily transaction recording and processing)
- **Secondary Users**: Purchasing Staff (GRN verification), Production Staff (viewing received materials), Warehouse Supervisors (transfer coordination)
- **Approvers**: Inventory Managers (high-value adjustments), Department Managers (issue returns)
- **Administrators**: System Administrators (configuration, user permissions, integration setup)
- **Reviewers**: Finance Team (cost verification, GL reconciliation), Internal Auditors (compliance review)
- **Support**: IT Helpdesk (user support), Integration Team (external system connectivity)

---

## Functional Requirements

### FR-STI-001: Transaction Type Support
**Priority**: Critical

The system must support five distinct transaction types for inbound inventory movements, each with specific business rules and processing requirements:

1. **Good Receive Note (GRN)**: Goods received from external vendors based on purchase orders
2. **Transfer**: Goods received from other internal locations
3. **Issue Return**: Unused goods returned from departments or operations
4. **Adjustment**: Positive inventory adjustments from physical counts or reconciliations
5. **Credit Note**: Goods handling related to vendor credit notes (return acknowledgment or replacement receipt)

Each transaction type must display appropriate labels, reference document links, and type-specific validation rules.

**Acceptance Criteria**:
- User can select transaction type from predefined list during creation
- System displays type-specific fields and validation messages based on selected type
- Transaction list clearly indicates transaction type with color-coded badges
- Each type links to its originating document (GRN-XXXX, TRF-XXXX, ISS-XXXX, ADJ-XXXX, CN-XXXX)
- System enforces type-specific business rules (see BR-STI-001 through BR-STI-005)

**Related Requirements**: BR-STI-001 to BR-STI-005, FR-STI-002, FR-STI-003

---

### FR-STI-002: Transaction List View
**Priority**: High

The system must provide a comprehensive list view of all stock in transactions with filtering, sorting, searching, and pagination capabilities.

**Acceptance Criteria**:
- Display transaction list with columns: Date, Reference No, Type, Related Doc, Location, Total Qty, Status, Actions
- Support search by reference number, location name, or description
- Filter by transaction type (GRN, Transfer, Credit Note, Issue Return, Adjustment)
- Filter by status (Saved, Committed, Void)
- Filter by date range (Today, Yesterday, Last 7 Days, Last 30 Days, Custom Range)
- Filter by location
- Sort by any column (ascending/descending)
- Pagination with configurable page size (default 10 items per page)
- Display total record count and current page range
- Support "Go to page" quick navigation

**Related Requirements**: FR-STI-003, FR-STI-004, NFR-STI-001

---

### FR-STI-003: Transaction Status Management
**Priority**: Critical

The system must manage transaction lifecycle states with clear status indicators and controlled state transitions.

**Status Values**:
- **Saved**: Draft transaction, editable, does not affect inventory balances
- **Committed**: Finalized transaction, creates inventory movements and cost updates, immutable except for reversal
- **Void**: Cancelled transaction, does not affect inventory, immutable

**Acceptance Criteria**:
- Display status with color-coded badges (Green=Committed, Yellow=Saved, Red=Void)
- Only "Saved" transactions can be edited or deleted
- "Committed" transactions can only be reversed (creates offsetting transaction)
- "Void" transactions cannot be modified
- System validates status transitions according to business rules (BR-STI-011 to BR-STI-013)
- Users see clear confirmation dialogs before committing or voiding transactions

**Related Requirements**: BR-STI-011, BR-STI-012, BR-STI-013, FR-STI-004

---

### FR-STI-004: Transaction Detail Management
**Priority**: Critical

The system must provide detailed transaction entry and editing capabilities with line item management, auto-save, and comprehensive data validation.

**Acceptance Criteria**:
- Support three modes: View (read-only), Edit (modify Saved transactions), Add (create new)
- Display transaction header: Date, Reference No, Type, Related Doc, Location, Description, Status
- Support line item grid with columns: Store, Item Code, Description, Unit, Qty, Unit Cost, Category, Sub-Category, Item Group, Bar Code, Comment
- Allow adding, editing, and removing line items (only for Saved status)
- Calculate total quantity automatically from line items
- Auto-save draft changes every 30 seconds
- Display inventory information per item: On Hand, On Ordered, Reorder, Restock, Last Price, Last Vendor
- Support bulk item addition from templates or recent transactions
- Validate all fields according to business rules before saving
- Display validation errors inline with field-level messaging

**Related Requirements**: BR-STI-014 to BR-STI-025, FR-STI-005, FR-STI-006

---

### FR-STI-005: Inventory Valuation Integration
**Priority**: Critical

The system must integrate with the centralized Inventory Valuation Service to calculate transaction costs using either FIFO or Periodic Average costing methods.

**Acceptance Criteria**:
- Call Inventory Valuation Service API when committing transactions
- Support FIFO cost layer creation for IN transactions
- Support Periodic Average cost calculation based on transaction date
- Store both unit cost and total cost (4 decimal precision) on transaction lines
- Handle valuation service unavailability gracefully with retry logic (3 attempts with exponential backoff)
- Display cost calculation summary before final commit
- Log all valuation service calls with request/response for audit trail
- Support manual cost override for adjustments (requires supervisor approval)

**Related Requirements**: BR-STI-026 to BR-STI-030, FR-STI-006, FR-STI-009

---

### FR-STI-006: Inventory Balance Updates
**Priority**: Critical

The system must update inventory balances atomically when transactions are committed, ensuring data consistency across all locations.

**Acceptance Criteria**:
- Update quantity on-hand at transaction posting time (not at save time)
- Support multiple locations per item with location-specific balances
- Update balances atomically (all items succeed or all fail)
- Track quantity on-hand, allocated, and available separately
- Prevent negative inventory if item is configured with "no negative" setting
- Create audit log entry for each balance change with before/after quantities
- Support rollback of balance updates if GL posting fails
- Display updated balances immediately in UI after commit

**Related Requirements**: BR-STI-031 to BR-STI-035, FR-STI-007, FR-STI-009

---

### FR-STI-007: Movement History Tracking
**Priority**: High

The system must record detailed movement history for each committed transaction, providing traceability for inventory changes.

**Acceptance Criteria**:
- Create movement record for each line item when transaction is committed
- Store: Commit Date, Location, Item Description, Unit, Stock In Qty, Stock Out Qty (always 0 for stock in), Amount, Reference
- Link movements to source transaction for drill-down capability
- Display movement history in chronological order
- Support filtering movements by date range, location, item, or reference
- Export movement history to Excel/PDF for reporting
- Calculate running balance after each movement (optional display)
- Show movement details in separate tab/section of transaction detail view

**Related Requirements**: BR-STI-036 to BR-STI-040, FR-STI-008, FR-STI-010

---

### FR-STI-008: Comment and Collaboration
**Priority**: Medium

The system must support user comments on transactions for collaboration, clarification, and audit documentation.

**Acceptance Criteria**:
- Allow users to add comments at any time (including after commit)
- Display comments with timestamp, user name, and comment text
- Show comments in chronological order (newest first)
- Support @mentions to notify specific users
- Allow editing own comments within 15 minutes of posting
- Display comment count badge on transaction list
- Send email notifications for new comments (configurable)
- Support markdown formatting in comments (bold, italic, lists, links)

**Related Requirements**: FR-STI-009, FR-STI-010, NFR-STI-010

---

### FR-STI-009: Document Attachments
**Priority**: Medium

The system must support file attachments for supporting documentation such as delivery notes, packing slips, quality certificates, and photos.

**Acceptance Criteria**:
- Support file uploads (PDF, JPG, PNG, DOC, XLS, max 10MB per file, max 20 files per transaction)
- Display attachments with file name, description, upload date, uploaded by user
- Allow marking attachments as public or private (private visible only to authorized users)
- Generate secure, time-limited download links for attachments
- Scan uploaded files for viruses before storage
- Store attachments in secure cloud storage with encryption at rest
- Support drag-and-drop file upload
- Display thumbnail preview for images
- Support bulk download of all attachments as ZIP file

**Related Requirements**: FR-STI-008, NFR-STI-006, NFR-STI-007

---

### FR-STI-010: Activity Log and Audit Trail
**Priority**: High

The system must maintain a complete, immutable activity log of all transaction actions for compliance and audit purposes.

**Acceptance Criteria**:
- Log all create, update, commit, void, and reverse actions
- Store: Action Date/Time, User, Action Type, Detailed Log Message
- Display activity log in chronological order within transaction detail
- Include system-generated entries (auto-save, integration events, validation failures)
- Support filtering activity log by action type or user
- Export activity log to PDF for compliance documentation
- Ensure activity log entries are immutable (cannot be edited or deleted)
- Include before/after values for field changes
- Log failed actions with error messages

**Related Requirements**: BR-STI-041 to BR-STI-045, NFR-STI-010

---

### FR-STI-011: Related Document Linking
**Priority**: High

The system must link stock in transactions to their originating documents (GRN, Transfer Order, Issue Return, Adjustment, Credit Note) for traceability.

**Acceptance Criteria**:
- Display related document reference number as clickable link
- Navigate to source document when link is clicked (opens in new tab/modal)
- Validate that related document exists and is in appropriate status
- Prevent creating stock in transaction if related document is void/cancelled
- Display related document status and key details in transaction header
- Support reverse navigation (view stock in from source document)
- Handle cross-module navigation (GRN from Procurement, Transfer from Inventory)
- Display warning if related document has been modified after stock in creation

**Related Requirements**: BR-STI-046 to BR-STI-050, FR-STI-001

---

### FR-STI-012: Bulk Operations
**Priority**: Medium

The system must support bulk operations to improve efficiency for high-volume transaction processing.

**Acceptance Criteria**:
- Support bulk commit of multiple Saved transactions (select from list, confirm, commit all)
- Support bulk void of multiple Saved transactions
- Display progress indicator during bulk operations (N of M completed)
- Show summary report after bulk operation (succeeded, failed, skipped with reasons)
- Roll back entire bulk operation if critical error occurs
- Support bulk export of selected transactions to Excel
- Allow bulk printing of transaction documents (PDF format)
- Limit bulk operations to 50 transactions per batch for performance

**Related Requirements**: NFR-STI-001, NFR-STI-002

---

### FR-STI-013: Print and Export
**Priority**: Medium

The system must provide print and export capabilities for transaction documents and reports.

**Acceptance Criteria**:
- Generate printable transaction document (PDF) with company logo, header/footer
- Include transaction header, line items, movements, comments in print layout
- Support print preview before generating PDF
- Export transaction list to Excel with all visible columns and filters applied
- Export individual transaction detail to Excel
- Generate QR code on printed document for mobile scanning
- Support custom print templates per transaction type
- Include barcode for warehouse scanning on pick list format

**Related Requirements**: FR-STI-002, FR-STI-004, NFR-STI-003

---

## Business Rules

### Transaction Type Rules

- **BR-STI-001**: Good Receive Note transactions MUST reference a valid, committed GRN from the Procurement module
- **BR-STI-002**: Transfer transactions MUST reference a valid transfer order and verify sufficient stock at source location
- **BR-STI-003**: Issue Return transactions MUST reference the original issue transaction and cannot exceed originally issued quantity
- **BR-STI-004**: Adjustment transactions MUST include a reason code (Stock Count Variance, Damage, Obsolescence, Initial Balance, System Correction)
- **BR-STI-005**: Credit Note transactions MUST reference a valid credit note from Procurement and link to original GRN if returning same goods

### Transaction Status Rules

- **BR-STI-011**: Only transactions in "Saved" status can be edited or deleted
- **BR-STI-012**: Transactions in "Committed" status can only be reversed (creates offsetting OUT transaction with negative quantities)
- **BR-STI-013**: Transactions in "Void" status are immutable and do not affect inventory balances or costs
- **BR-STI-014**: New transactions default to "Saved" status
- **BR-STI-015**: Committing a transaction is irreversible (cannot return to Saved status)

### Data Validation Rules

- **BR-STI-016**: Transaction date cannot be more than 30 days in the past or more than 1 day in the future
- **BR-STI-017**: Transaction reference number must follow format: STK-IN-YYMM-NNNN (e.g., STK-IN-2501-0001)
- **BR-STI-018**: Reference numbers must be unique across all stock in transactions
- **BR-STI-019**: Location must be a valid, active location from the Location master
- **BR-STI-020**: Each transaction must include at least 1 line item

### Line Item Rules

- **BR-STI-021**: Product must be a valid, active product from the Product master
- **BR-STI-022**: Unit of measure must be valid for the selected product
- **BR-STI-023**: Quantity must be greater than 0
- **BR-STI-024**: Unit cost cannot be negative
- **BR-STI-025**: Same product can appear multiple times in a transaction if different units or locations are specified

### Cost Calculation Rules

- **BR-STI-026**: For GRN transactions, cost comes from the related GRN (which sources from PO or invoice)
- **BR-STI-027**: For Transfer transactions, cost equals the cost at the source location (no profit/loss on internal transfers)
- **BR-STI-028**: For Issue Return transactions, cost equals the original issue cost
- **BR-STI-029**: For positive Adjustment transactions, cost defaults to latest purchase price or standard cost
- **BR-STI-030**: All costs must be stored with 4 decimal places precision

### Inventory Balance Rules

- **BR-STI-031**: Inventory balances update ONLY when transaction is committed (not when saved)
- **BR-STI-032**: Balance updates must be atomic (all line items succeed or all fail)
- **BR-STI-033**: If a product is configured with "Allow Negative Inventory = false", system must prevent commit if result would be negative balance
- **BR-STI-034**: Balances must update at the transaction location (not globally)
- **BR-STI-035**: Quantity on-hand increases by transaction quantity; quantity available increases if no allocation constraints exist

### Movement History Rules

- **BR-STI-036**: Movement records are created only for committed transactions
- **BR-STI-037**: Each line item creates one movement record
- **BR-STI-038**: Movement records are immutable (cannot be edited or deleted)
- **BR-STI-039**: Reversing a transaction creates offsetting movement records with opposite sign
- **BR-STI-040**: Movement history must be retained for minimum 7 years for audit compliance

### Audit and Security Rules

- **BR-STI-041**: All transaction actions must be logged with user ID, timestamp, and action type
- **BR-STI-042**: Activity log entries are immutable
- **BR-STI-043**: Users can only view transactions for locations they have access to (location-based security)
- **BR-STI-044**: Creating transactions requires "Inventory.StockIn.Create" permission
- **BR-STI-045**: Committing transactions requires "Inventory.StockIn.Commit" permission (typically supervisor level)
- **BR-STI-046**: Voiding transactions requires "Inventory.StockIn.Void" permission (manager level)
- **BR-STI-047**: Reversing committed transactions requires manager approval

### Integration Rules

- **BR-STI-048**: Stock in transactions must call Inventory Valuation Service API before committing
- **BR-STI-049**: If Inventory Valuation Service is unavailable, system must retry 3 times with exponential backoff (1s, 2s, 4s)
- **BR-STI-050**: If valuation service fails after retries, transaction remains in Saved status with error message
- **BR-STI-051**: Committed transactions must trigger GL posting to Finance module
- **BR-STI-052**: GL posting failure must prevent transaction commit
- **BR-STI-053**: System must support manual GL posting retry for failed transactions

### Location Type Business Rules

Stock In transaction behavior varies based on the **location type** of the destination location. The system supports three location types that determine whether inventory balances are updated and how costs are recorded.

#### Location Type Definitions

| Location Type | Code | Purpose | Examples |
|---------------|------|---------|----------|
| **INVENTORY** | INV | Standard tracked warehouse locations | Main Warehouse, Central Kitchen Store |
| **DIRECT** | DIR | Direct expense locations (no stock balance) | Restaurant Bar Direct, Kitchen Direct |
| **CONSIGNMENT** | CON | Vendor-owned inventory locations | Beverage Consignment, Linen Consignment |

#### BR-STI-054: Location Type Processing Rules

**INVENTORY Locations (INV)**:
- ✅ Full stock-in processing with balance update
- ✅ Creates FIFO cost layer with lot tracking
- ✅ Updates inventory asset balance
- ✅ GL: Debit Inventory Asset, Credit Accounts Payable
- ✅ Complete movement history recorded

**DIRECT Locations (DIR)**:
- ❌ No stock balance update (items expensed immediately)
- ❌ No cost layer created
- ✅ Receipt recorded for audit trail only
- ✅ GL: Debit Department Expense, Credit Accounts Payable
- ⚠️ Stock-in creates expense posting, not inventory

**CONSIGNMENT Locations (CON)**:
- ✅ Full stock-in processing with balance update
- ✅ Creates FIFO cost layer with vendor ownership
- ✅ Updates consignment stock balance
- ✅ GL: Debit Consignment Asset, Credit Vendor Liability
- ✅ Vendor-owned until consumed

#### BR-STI-055: Location Type Feature Matrix

| Feature | INVENTORY | DIRECT | CONSIGNMENT |
|---------|-----------|--------|-------------|
| **Balance Update** | ✅ Increases stock | ❌ None | ✅ Increases stock |
| **Cost Layer** | ✅ FIFO layer created | ❌ None | ✅ FIFO layer (vendor) |
| **Lot Tracking** | ✅ Full | ❌ None | ✅ Full |
| **Batch Numbers** | ✅ Tracked | ❌ Not tracked | ✅ Tracked |
| **Expiry Dates** | ✅ Tracked | ❌ Not tracked | ✅ Tracked |
| **GL Posting** | Asset increase | Expense posting | Liability increase |
| **Movement History** | ✅ Full | ⚠️ Receipt only | ✅ Full |
| **Physical Count** | ✅ Applicable | ❌ Not applicable | ✅ Vendor reconciliation |

#### BR-STI-056: Location Type Validation Rules

1. **Transaction Type Restrictions**:
   - GRN to DIRECT location: Creates expense posting instead of stock-in
   - Transfer to DIRECT location: Not permitted (blocked at source)
   - Issue Return to DIRECT location: Not permitted

2. **UI Behavior**:
   - Location type badge displayed in location selection
   - Warning banner when destination is DIRECT location
   - Stock movement tabs filter out DIRECT location items

3. **Reporting Impact**:
   - DIRECT locations excluded from inventory balance reports
   - DIRECT locations included in expense analysis reports
   - Stock cards not maintained for DIRECT locations

---

## Data Model

### StockInTransaction Entity

**Purpose**: Represents a single inbound inventory transaction, serving as the header record for all stock in movements regardless of type.

**Conceptual Structure**:

```typescript
interface StockInTransaction {
  // Primary key
  id: string;                     // UUID primary key

  // Transaction identification
  refNo: string;                  // Format: STK-IN-YYMM-NNNN (e.g., STK-IN-2501-0001)
  date: Date;                     // Transaction date (determines costing period)

  // Transaction classification
  type: 'Good Receive Note' | 'Transfer' | 'Credit Note' | 'Issue Return' | 'Adjustment';
  relatedDoc: string;             // Reference to source document (GRN-XXXX, TRF-XXXX, etc.)

  // Location
  locationId: string;             // Foreign key to Location
  locationCode: string;           // Denormalized for display
  locationName: string;           // Denormalized for display

  // Transaction details
  description: string;            // Business description/notes (max 500 chars)
  totalQty: number;               // Sum of all line item quantities

  // Status management
  status: 'Saved' | 'Committed' | 'Void';
  commitDate?: Date;              // When transaction was committed
  committedBy?: string;           // User ID who committed

  // Relationships
  items: StockInItem[];           // Line items
  movements: StockInMovement[];   // Inventory movements (created on commit)
  comments: StockInComment[];     // User comments
  attachments: StockInAttachment[]; // Supporting documents
  activityLog: StockInActivity[]; // Audit trail

  // Audit fields
  createdDate: Date;              // Creation timestamp
  createdBy: string;              // Creator user ID
  modifiedDate: Date;             // Last update timestamp
  modifiedBy: string;             // Last updater user ID
  deletedAt?: Date;               // Soft delete timestamp
}
```

### StockInItem Entity

**Purpose**: Represents individual line items within a stock in transaction, detailing specific products, quantities, and costs.

```typescript
interface StockInItem {
  // Primary key
  id: string;                     // UUID primary key

  // Parent relationship
  stockInTransactionId: string;   // Foreign key to StockInTransaction
  lineNumber: number;             // Line sequence (1, 2, 3...)

  // Product information
  productId: string;              // Foreign key to Product
  itemCode: string;               // Denormalized product code
  description: string;            // Denormalized product description
  category: string;               // Denormalized category
  subCategory: string;            // Denormalized sub-category
  itemGroup: string;              // Denormalized item group
  barCode?: string;               // Product barcode

  // Quantity and unit
  unitId: string;                 // Foreign key to Unit
  unit: string;                   // Denormalized unit name
  qty: number;                    // Quantity (must be > 0)

  // Cost information (populated by Inventory Valuation Service)
  unitCost: number;               // Cost per unit (4 decimal precision)
  totalCost: number;              // qty * unitCost (4 decimal precision)
  costCalculationMethod: 'FIFO' | 'Periodic Average'; // Method used

  // Destination (can differ from header location for some types)
  destinationLocationId: string;  // Foreign key to Location
  destinationLocationCode: string; // Denormalized

  // Additional information
  comment?: string;               // Line item specific notes (max 200 chars)

  // Inventory context (for display/validation)
  inventoryInfo: {
    onHand: number;               // Current on-hand before this transaction
    onOrdered: number;            // Quantity on purchase orders
    reorder: number;              // Reorder point
    restock: number;              // Restock level
    lastPrice: number;            // Last purchase price
    lastVendor: string;           // Last vendor name
  };

  // Audit fields
  createdDate: Date;
  createdBy: string;
  modifiedDate: Date;
  modifiedBy: string;
  deletedAt?: Date;               // Soft delete
}
```

### StockInMovement Entity

**Purpose**: Records the actual inventory movement created when a transaction is committed, providing immutable history of stock changes.

```typescript
interface StockInMovement {
  // Primary key
  id: string;                     // UUID primary key

  // Parent relationships
  stockInTransactionId: string;   // Foreign key to StockInTransaction
  stockInItemId: string;          // Foreign key to StockInItem

  // Movement details
  commitDate: Date;               // When movement was created
  locationId: string;             // Foreign key to Location
  location: string;               // Denormalized location name

  // Product information
  productId: string;              // Foreign key to Product
  itemDescription: string;        // Denormalized product description
  inventoryUnit: string;          // Unit of measure

  // Quantities
  stockIn: number;                // Quantity added (always positive for stock in)
  stockOut: number;               // Always 0 for stock in transactions

  // Financial
  amount: number;                 // Total value (stockIn * unitCost)

  // Traceability
  reference: string;              // Related document reference (GRN-XXXX, etc.)

  // Immutable flag
  isReversed: boolean;            // True if this movement has been reversed
  reversalMovementId?: string;    // Link to reversal movement if applicable

  // Audit fields (no modifiedDate/modifiedBy as movements are immutable)
  createdDate: Date;
  createdBy: string;
}
```

### StockInComment Entity

**Purpose**: User collaboration comments for clarification, questions, and audit documentation.

```typescript
interface StockInComment {
  id: string;                     // UUID primary key
  stockInTransactionId: string;   // Foreign key to StockInTransaction

  date: Date;                     // Comment timestamp
  by: string;                     // User ID
  byName: string;                 // Denormalized user name
  comment: string;                // Comment text (max 1000 chars, supports markdown)

  // Collaboration
  mentions: string[];             // Array of mentioned user IDs (@username)
  isEdited: boolean;              // True if comment was edited
  editedDate?: Date;              // Last edit timestamp

  // Audit
  createdDate: Date;
  createdBy: string;
  modifiedDate: Date;
  modifiedBy: string;
  deletedAt?: Date;               // Soft delete
}
```

### StockInAttachment Entity

**Purpose**: File attachments for supporting documentation (delivery notes, photos, certificates).

```typescript
interface StockInAttachment {
  id: string;                     // UUID primary key
  stockInTransactionId: string;   // Foreign key to StockInTransaction

  fileName: string;               // Original file name
  fileSize: number;               // File size in bytes
  fileType: string;               // MIME type
  storageUrl: string;             // Secure cloud storage URL
  description: string;            // User-provided description (max 200 chars)

  // Security
  isPublic: boolean;              // Public (all users) vs private (authorized only)

  // Audit
  date: Date;                     // Upload timestamp
  by: string;                     // Uploader user ID
  byName: string;                 // Denormalized user name

  createdDate: Date;
  createdBy: string;
  deletedAt?: Date;               // Soft delete (marks file for removal)
}
```

### StockInActivity Entity

**Purpose**: Immutable audit log of all transaction actions for compliance and troubleshooting.

```typescript
interface StockInActivity {
  id: string;                     // UUID primary key
  stockInTransactionId: string;   // Foreign key to StockInTransaction

  date: Date;                     // Action timestamp (high precision)
  by: string;                     // User ID who performed action
  byName: string;                 // Denormalized user name
  action: 'Create' | 'Update' | 'Commit' | 'Void' | 'Reverse' | 'AutoSave' | 'ValidationFailed' | 'IntegrationEvent';
  log: string;                    // Detailed log message

  // Change tracking
  fieldChanges?: {                // For Update actions
    field: string;
    oldValue: string;
    newValue: string;
  }[];

  // Integration context
  integrationContext?: {          // For IntegrationEvent actions
    serviceName: string;
    requestId: string;
    responseCode: number;
    errorMessage?: string;
  };

  // No modifiedDate/modifiedBy as activity log is immutable
  createdDate: Date;
}
```

---

## Integration Points

### Internal Integrations

- **Procurement Module (GRN)**: Stock In transactions reference committed GRNs. GRN provides product, quantity, cost, and lot/batch information. Bidirectional navigation allows viewing GRN from Stock In and vice versa.

- **Procurement Module (Credit Note)**: Stock In transactions reference Credit Notes for vendor returns or replacement receipts. Credit Note provides original cost and lot information for FIFO layer reversal.

- **Inventory Transactions (Transfer)**: Stock In receives goods from internal transfers. Transfer module manages source/destination coordination and creates paired OUT/IN transactions.

- **Store Operations (Issue Return)**: Stock In records unused goods returned from operations. References original issue transaction to validate quantity and recover original cost.

- **Inventory Management (Adjustment)**: Stock In records positive adjustments from physical counts, damage write-offs reversed, or initial balance setup.

- **Inventory Valuation Service (Shared Method)**: Centralized cost calculation service called at commit time. Provides unit costs based on FIFO or Periodic Average method. Handles cost layer management for FIFO.

- **Finance Module (GL Posting)**: Committed Stock In transactions trigger GL journal entries: Debit Inventory Asset, Credit AP (for GRN) or Inventory Variance (for adjustments). Failed GL posts prevent transaction commit.

- **Product Master**: Product information (code, description, category, UOM) sourced from Product module. Real-time validation of active products.

- **Location Master**: Location data (code, name, department, cost center) sourced from Location module. Enforces location-based security and multi-location tracking.

- **User/Role Management**: User authentication and authorization. Role-based permissions control who can create, edit, commit, void, or reverse transactions.

### External Integrations

- **Third-Party WMS (Warehouse Management System)**: Optional integration for automated goods receipt posting. WMS sends inbound confirmation data (ASN, receipt quantities) which creates draft Stock In transactions for review and commit.

- **ERP System**: For organizations using Carmen as inventory sub-ledger, committed transactions export to main ERP for consolidation. Uses standard API or file-based integration.

### Data Dependencies

- **Depends On**: Product Master, Location Master, Unit Master, User Management, Inventory Valuation Service, Procurement (GRN, Credit Note), Store Operations (Issue transactions)

- **Used By**: Inventory Balance Tracking, Stock Overview, Inventory Reports, Financial Reports, Inventory Valuation (cost layer management), GL Posting, Audit Reports

---

## Non-Functional Requirements

### Performance

- **NFR-STI-001**: Transaction list page must load within 2 seconds for up to 1,000 records
- **NFR-STI-002**: Search and filter operations must return results within 1 second
- **NFR-STI-003**: Transaction detail page must load within 1.5 seconds
- **NFR-STI-004**: Auto-save must complete within 500ms without blocking user input
- **NFR-STI-005**: Commit operation must complete within 5 seconds for transactions with up to 100 line items

### Security

- **NFR-STI-006**: All data transmission must use HTTPS/TLS 1.2 or higher
- **NFR-STI-007**: Uploaded files must be scanned for viruses before storage
- **NFR-STI-008**: Attachments must be stored with encryption at rest (AES-256)
- **NFR-STI-009**: User sessions must timeout after 30 minutes of inactivity
- **NFR-STI-010**: Activity log must capture user IP address and user agent for security audit
- **NFR-STI-011**: Role-based access control must be enforced at API level (not just UI)

### Reliability

- **NFR-STI-012**: System must have 99.5% uptime during business hours (8 AM - 8 PM local time)
- **NFR-STI-013**: Auto-save must include retry logic (3 attempts) to prevent data loss
- **NFR-STI-014**: Database transactions must use ACID properties to ensure data consistency
- **NFR-STI-015**: System must gracefully handle Inventory Valuation Service unavailability with informative error messages

### Usability

- **NFR-STI-016**: All forms must include inline validation with clear error messages
- **NFR-STI-017**: UI must be responsive and functional on tablets (min resolution 1024x768)
- **NFR-STI-018**: Loading indicators must appear within 100ms of user action
- **NFR-STI-019**: System must support keyboard navigation for power users (tab order, keyboard shortcuts)
- **NFR-STI-020**: Help text and tooltips must be available for all complex fields

### Scalability

- **NFR-STI-021**: System must support up to 50 concurrent users without performance degradation
- **NFR-STI-022**: Database must handle 10,000 transactions per month per location
- **NFR-STI-023**: System must support up to 500 line items per transaction (with performance warning at 100 items)

### Maintainability

- **NFR-STI-024**: Code must follow Next.js 14+ App Router conventions with TypeScript strict mode
- **NFR-STI-025**: All business rules must be configurable via admin interface (no hard-coded thresholds)
- **NFR-STI-026**: API endpoints must be versioned (e.g., /api/v1/stock-in) for backward compatibility
- **NFR-STI-027**: System must include comprehensive logging for troubleshooting (info, warning, error levels)

### Compliance

- **NFR-STI-028**: Activity log must be retained for minimum 7 years per financial regulations
- **NFR-STI-029**: Audit trail must be immutable and tamper-evident (cryptographic hashing)
- **NFR-STI-030**: System must support data export for regulatory audits (Excel, CSV, PDF formats)

---

## Constraints and Assumptions

### Technical Constraints
- Next.js 14.2+ with App Router must be used for frontend
- PostgreSQL 14+ must be used for database
- Prisma ORM 5.8+ must be used for data access
- Integration with existing Inventory Valuation Service API (REST, JSON)
- Cloud storage (AWS S3 or equivalent) must be used for attachments

### Business Constraints
- Stock In transactions cannot be deleted after commit (only reversed)
- Maximum 100 line items per transaction recommended for performance
- Transaction dates must be within the current open accounting period
- Cost calculations must align with organization's chosen costing method (FIFO or Periodic Average)

### Assumptions
- Users have reliable internet connectivity (minimum 1 Mbps)
- Users are trained on inventory management concepts (stock types, costing methods)
- Product Master and Location Master are maintained by separate teams
- Inventory Valuation Service has 99.9% availability SLA
- Finance module GL posting API is available and responds within 3 seconds

---

## Success Metrics

1. **Data Accuracy**: 99.9% of committed transactions match physical goods received (measured via spot checks)
2. **User Efficiency**: Average time to record a stock in transaction reduces by 40% compared to legacy system
3. **System Adoption**: 95% of inbound movements recorded within 24 hours of physical receipt
4. **Cost Accuracy**: 100% of transactions have costs calculated by Valuation Service (no manual cost entry)
5. **Audit Compliance**: Zero audit findings related to incomplete transaction records or missing audit trails
6. **User Satisfaction**: Average user satisfaction score of 4.0+ out of 5.0 in quarterly surveys
7. **Integration Reliability**: 99.5% success rate for Inventory Valuation Service and GL posting integrations

---

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Inventory Valuation Service downtime blocks all commits | High | Medium | Implement retry logic, queue transactions, allow manual cost override with approval |
| Users commit incorrect quantities/products | High | High | Mandatory confirmation dialog, display inventory info, support easy reversal workflow |
| Network latency causes auto-save failures | Medium | Medium | Implement local storage fallback, increase retry attempts, display clear save status |
| Bulk operations lock database causing timeouts | Medium | Low | Implement row-level locking, limit bulk operations to 50 transactions, add progress indicators |
| Attachments consume excessive storage | Low | Medium | Enforce file size limits, implement automatic compression for images, archive old attachments |
| Cross-module integration failures during commit | High | Low | Implement distributed transaction patterns, compensating transactions, comprehensive error logging |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version based on UI prototype analysis and Inventory Transactions system documentation |


## References

1. **UI Prototype**: `/app/(main)/inventory-management/stock-in/page.tsx`, `/app/(main)/inventory-management/components/stock-in-list.tsx`
2. **Inventory Transactions System**: `/docs/app/inventory-management/inventory-transactions/SM-inventory-transactions.md`
3. **Inventory Valuation Service**: `/docs/app/shared-methods/inventory-valuation/SM-inventory-valuation.md`
4. **Procurement GRN Documentation**: `/docs/app/procurement/goods-received-note/BR-goods-received-note.md`
5. **Procurement Credit Note Documentation**: `/docs/app/procurement/credit-note/BR-credit-note.md`

---

**Document Control**:
- **Classification**: Internal Use
- **Review Required**: Yes
- **Approved By**: Pending
- **Next Review Date**: TBD
