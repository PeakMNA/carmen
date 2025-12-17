# Validation Rules: Inventory Transactions

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Inventory Transactions
- **Version**: 1.0.0
- **Last Updated**: 2025-11-02
- **Status**: Draft

## Document Purpose

This document defines comprehensive validation rules for inventory transactions across all system layers: client-side (UI), server-side (application), and database constraints. Validations ensure data integrity, prevent errors, and maintain business rule compliance.

**Related Documents**:
- [System Method](./SM-inventory-transactions.md)
- [Business Requirements](./BR-inventory-transactions.md)
- [Use Cases](./UC-inventory-transactions.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Validation Categories

### Field-Level Validations (VAL-TXN-001 to 099)
Basic field format, type, and range validations

### Business Rule Validations (VAL-TXN-101 to 199)
Complex business logic validations

### Cross-Field Validations (VAL-TXN-201 to 299)
Validations involving multiple fields or entities

### Security Validations (VAL-TXN-301 to 399)
Permission and authorization validations

---

## Field-Level Validations

### VAL-TXN-001: Transaction Number Format
**Rule**: Transaction number must follow format `{TYPE}-{YYMM}-{SEQUENCE}` where TYPE is 3-4 uppercase letters, YYMM is 4 digits (year month), SEQUENCE is 6 digits.

**Layer**: Server + Database
**Error Message**: "Invalid transaction number format. Expected: TYPE-YYMM-NNNN"
**Implementation**:
```typescript
// Zod schema
const transactionNumberSchema = z.string()
  .regex(/^[A-Z]{3,4}-\d{4}-\d{6}$/, "Invalid transaction number format")
  .min(14)
  .max(15);

// Database constraint
CHECK (transaction_number ~ '^[A-Z]{3,4}-\\d{4}-\\d{6}$')
```

**Test Scenarios**:
- ✅ Valid: `GRN-2501-001234`, `ISS-2501-005678`, `TRF-2501-009012`
- ❌ Invalid: `grn-2501-001234` (lowercase), `GRN-25-001234` (2-digit format), `GRN-2501-1234` (4-digit sequence)

---

### VAL-TXN-002: Transaction Date Validity
**Rule**: Transaction date must not be more than 30 days in past (configurable) and cannot be future date.

**Layer**: Client + Server
**Error Message**: "Transaction date cannot be more than 30 days in the past or a future date"
**Implementation**:
```typescript
const transactionDateSchema = z.date()
  .refine(date => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    return date >= thirtyDaysAgo && date <= today;
  }, 'Transaction date must be within last 30 days and not future');
```

**Test Scenarios**:
- ✅ Valid: Today, yesterday, 29 days ago
- ❌ Invalid: Tomorrow, 31 days ago, 1 year ago

**Override**: Finance managers can override with justification

---

### VAL-TXN-003: Quantity Positive and Numeric
**Rule**: Quantity must be a positive number with maximum 4 decimal places.

**Layer**: Client + Server + Database
**Error Message**: "Quantity must be a positive number with up to 4 decimal places"
**Implementation**:
```typescript
const quantitySchema = z.number()
  .positive("Quantity must be positive")
  .finite("Quantity must be a valid number")
  .refine(qty => {
    const decimalPlaces = (qty.toString().split('.')[1] || '').length;
    return decimalPlaces <= 4;
  }, 'Quantity can have maximum 4 decimal places');

// Database constraint
CHECK (quantity > 0 AND quantity = ROUND(quantity, 4))
```

**Test Scenarios**:
- ✅ Valid: `1`, `100.5`, `25.1234`, `1000.0001`
- ❌ Invalid: `0`, `-10`, `100.12345` (5 decimals), `NaN`, `Infinity`

---

### VAL-TXN-004: Unit Cost Non-Negative
**Rule**: Unit cost must be zero or positive with maximum 4 decimal places.

**Layer**: Server + Database
**Error Message**: "Unit cost must be zero or positive with up to 4 decimal places"
**Implementation**:
```typescript
const unitCostSchema = z.number()
  .nonnegative("Unit cost cannot be negative")
  .finite("Unit cost must be a valid number")
  .refine(cost => {
    const decimalPlaces = (cost.toString().split('.')[1] || '').length;
    return decimalPlaces <= 4;
  }, 'Unit cost can have maximum 4 decimal places');
```

**Test Scenarios**:
- ✅ Valid: `0`, `10.5`, `125.1234`, `1000.0001`
- ❌ Invalid: `-5`, `100.12345` (5 decimals)

---

### VAL-TXN-005: Total Cost Calculation
**Rule**: Total cost must equal quantity × unit_cost rounded to 2 decimal places.

**Layer**: Server + Database
**Error Message**: "Total cost must equal quantity × unit cost"
**Implementation**:
```typescript
const transactionSchema = z.object({
  quantity: quantitySchema,
  unit_cost: unitCostSchema,
  total_cost: z.number()
}).refine(data => {
  const calculated = Math.round(data.quantity * data.unit_cost * 100) / 100;
  return Math.abs(data.total_cost - calculated) < 0.01; // Tolerance for rounding
}, 'Total cost must equal quantity × unit cost');

// Database constraint
CHECK (ABS(total_cost - (quantity * unit_cost)) < 0.01)
```

**Test Scenarios**:
- ✅ Valid: qty=100, unit=10.5, total=1050.00
- ❌ Invalid: qty=100, unit=10.5, total=1000.00

---

### VAL-TXN-006: Source Document Reference Required
**Rule**: Source document type, ID, and number are all required.

**Layer**: Server + Database
**Error Message**: "Source document reference is required"
**Implementation**:
```typescript
const sourceDocumentSchema = z.object({
  source_document_type: z.string()
    .min(1, "Source document type required")
    .max(100),
  source_document_id: z.string().uuid("Invalid source document ID"),
  source_document_number: z.string()
    .min(1, "Source document number required")
    .max(100)
});

// Database constraints
CHECK (source_document_type IS NOT NULL AND source_document_type <> '')
CHECK (source_document_id IS NOT NULL)
CHECK (source_document_number IS NOT NULL AND source_document_number <> '')
```

**Test Scenarios**:
- ✅ Valid: type="GRN", id="valid-uuid", number="GRN-2501-0001"
- ❌ Invalid: type=null, type="", id="invalid-uuid"

---

### VAL-TXN-007: Reversal Reason Length
**Rule**: If transaction is being reversed, reversal reason must be 20-500 characters.

**Layer**: Client + Server
**Error Message**: "Reversal reason must be between 20 and 500 characters"
**Implementation**:
```typescript
const reversalReasonSchema = z.string()
  .min(20, "Reversal reason must be at least 20 characters")
  .max(500, "Reversal reason cannot exceed 500 characters")
  .trim();
```

**Test Scenarios**:
- ✅ Valid: "GRN quantity error - received 100 units instead of 150 units as per delivery note"
- ❌ Invalid: "Error" (too short), 501+ character string (too long)

---

### VAL-TXN-008: Lot Number Format (If Required)
**Rule**: If item requires lot tracking, lot number must be provided and follow format.

**Layer**: Client + Server
**Error Message**: "Lot number is required for this item"
**Implementation**:
```typescript
const lotNumberSchema = z.string()
  .min(1, "Lot number cannot be empty")
  .max(100, "Lot number too long")
  .regex(/^[A-Z0-9-]+$/, "Lot number can only contain uppercase letters, numbers, and hyphens");

// Conditional validation
if (item.requires_lot_tracking) {
  schema = schema.extend({
    lot_number: lotNumberSchema
  });
}
```

**Test Scenarios**:
- ✅ Valid: `LOT-2501-0001`, `BATCH-20250115-A`, `L12345`
- ❌ Invalid: `lot-001` (lowercase), `LOT 001` (space), empty (if required)

---

### VAL-TXN-009: Expiry Date Future Date
**Rule**: If provided, expiry date must be a future date.

**Layer**: Client + Server
**Error Message**: "Expiry date must be in the future"
**Implementation**:
```typescript
const expiryDateSchema = z.date()
  .refine(date => date > new Date(), "Expiry date must be in the future");
```

**Test Scenarios**:
- ✅ Valid: Tomorrow, next month, next year
- ❌ Invalid: Today, yesterday, last year

---

## Business Rule Validations

### VAL-TXN-101: Stock Availability Check
**Rule**: For OUT transactions, quantity must not exceed available quantity unless backorder allowed.

**Layer**: Server
**Error Message**: "Insufficient stock available. Available: {available}, Requested: {requested}"
**Implementation**:
```typescript
async function validateStockAvailability(
  itemId: string,
  locationId: string,
  requestedQty: number,
  allowBackorder: boolean
): Promise<void> {
  const status = await getInventoryStatus(itemId, locationId);
  const available = status.quantity_on_hand - status.quantity_allocated;

  if (!allowBackorder && requestedQty > available) {
    throw new ValidationError(
      `Insufficient stock available. Available: ${available}, Requested: ${requestedQty}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: available=100, requested=50, backorder=false
- ✅ Valid: available=100, requested=150, backorder=true
- ❌ Invalid: available=100, requested=150, backorder=false

---

### VAL-TXN-102: Transaction State Transition Validity
**Rule**: Only valid state transitions are allowed as per state machine.

**Layer**: Server
**Error Message**: "Invalid state transition from {current} to {requested}"
**Implementation**:
```typescript
const validTransitions: Record<TransactionStatus, TransactionStatus[]> = {
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'DRAFT', 'CANCELLED'],
  APPROVED: ['POSTED', 'CANCELLED'],
  POSTED: ['COMPLETED', 'REVERSED'],
  COMPLETED: [],
  REVERSED: [],
  CANCELLED: []
};

function validateStateTransition(
  currentStatus: TransactionStatus,
  newStatus: TransactionStatus
): void {
  if (!validTransitions[currentStatus].includes(newStatus)) {
    throw new ValidationError(
      `Invalid state transition from ${currentStatus} to ${newStatus}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: DRAFT → PENDING_APPROVAL → APPROVED → POSTED → COMPLETED
- ❌ Invalid: DRAFT → POSTED (skips approval), POSTED → DRAFT (cannot go back)

---

### VAL-TXN-103: Workflow Approver Authorization Check
**Rule**: User must be designated as approver by workflow engine for the specific transaction.

**Layer**: Server
**Error Message**: "You are not authorized to approve this transaction"
**Implementation**:
```typescript
async function validateWorkflowApprover(
  userId: string,
  transactionId: string
): Promise<void> {
  // Call workflow engine to verify user is designated approver
  const workflowStatus = await workflowEngine.getApprovalStatus(transactionId);

  if (!workflowStatus.currentApprovers.includes(userId)) {
    throw new ValidationError(
      'You are not authorized to approve this transaction'
    );
  }

  // Verify transaction is still pending approval
  if (workflowStatus.status !== 'PENDING_APPROVAL') {
    throw new ValidationError(
      `Transaction is in ${workflowStatus.status} status and cannot be approved`
    );
  }
}
```

**Workflow Engine Responsibilities**:
- Determine approvers based on configurable rules (department, location, item category, etc.)
- Track approval routing and status
- Support single-level or multi-level approval chains
- Handle escalations and timeouts

**Test Scenarios**:
- ✅ Valid: User is designated approver by workflow engine
- ❌ Invalid: User is not in workflow's current approvers list
- ❌ Invalid: Transaction already approved or not in PENDING_APPROVAL status

---

### VAL-TXN-104: Same Location Transfer Prevention
**Rule**: Transfer source and destination locations must be different.

**Layer**: Client + Server
**Error Message**: "Cannot transfer to the same location"
**Implementation**:
```typescript
const transferSchema = z.object({
  source_location_id: z.string().uuid(),
  destination_location_id: z.string().uuid()
}).refine(data =>
  data.source_location_id !== data.destination_location_id,
  "Cannot transfer to the same location"
);
```

**Test Scenarios**:
- ✅ Valid: source=LOC-A, destination=LOC-B
- ❌ Invalid: source=LOC-A, destination=LOC-A

---

### VAL-TXN-105: Posted Transaction Immutability
**Rule**: Transactions with status POSTED cannot be edited, only reversed.

**Layer**: Server
**Error Message**: "Posted transactions cannot be edited. Please reverse and create a new transaction."
**Implementation**:
```typescript
async function validateTransactionEditable(transactionId: string): Promise<void> {
  const txn = await getTransaction(transactionId);

  if (txn.status === 'POSTED' || txn.status === 'COMPLETED' || txn.status === 'REVERSED') {
    throw new ValidationError(
      "Posted transactions cannot be edited. Please reverse and create a new transaction."
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: Edit DRAFT, PENDING_APPROVAL, or APPROVED transaction
- ❌ Invalid: Edit POSTED, COMPLETED, or REVERSED transaction

---

### VAL-TXN-106: Reversal Already Exists
**Rule**: Transaction can only be reversed once.

**Layer**: Server
**Error Message**: "Transaction was already reversed on {date}"
**Implementation**:
```typescript
async function validateNotAlreadyReversed(transactionId: string): Promise<void> {
  const txn = await getTransaction(transactionId);

  if (txn.reversed_by || txn.status === 'REVERSED') {
    throw new ValidationError(
      `Transaction was already reversed on ${txn.reversal_date.toLocaleDateString()}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: Reverse transaction that has not been reversed
- ❌ Invalid: Attempt to reverse already-reversed transaction

---

### VAL-TXN-107: FIFO Layers Available (FIFO Method)
**Rule**: When using FIFO method, sufficient FIFO layers must exist for OUT transactions.

**Layer**: Server (Valuation Service)
**Error Message**: "Insufficient FIFO layers for item {itemId}. Required: {required}, Available: {available}"
**Implementation**:
```typescript
async function validateFIFOLayersAvailable(
  itemId: string,
  locationId: string,
  requiredQty: number,
  date: Date
): Promise<void> {
  const layers = await getFIFOLayers(itemId, locationId, date);
  const totalAvailable = layers.reduce((sum, layer) => sum + layer.remaining_quantity, 0);

  if (totalAvailable < requiredQty) {
    throw new ValidationError(
      `Insufficient FIFO layers for item ${itemId}. Required: ${requiredQty}, Available: ${totalAvailable}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: required=100, layer1=60 + layer2=50 = 110 available
- ❌ Invalid: required=100, layer1=30 + layer2=40 = 70 available

---

### VAL-TXN-108: Period Cost Available (Periodic Average)
**Rule**: When using Periodic Average, cost must be calculable for transaction period.

**Layer**: Server (Valuation Service)
**Error Message**: "No receipts found for period {period}. Cannot calculate average cost."
**Implementation**:
```typescript
async function validatePeriodCostAvailable(
  itemId: string,
  date: Date
): Promise<void> {
  const period = normalizePeriod(date);
  const receipts = await getPeriodicReceipts(itemId, period);

  if (receipts.length === 0) {
    // Try fallback strategies
    const previousPeriodCost = await getPreviousPeriodCost(itemId, period);
    if (!previousPeriodCost) {
      throw new ValidationError(
        `No receipts found for period ${period.toISOString().slice(0, 7)}. Cannot calculate average cost.`
      );
    }
  }
}
```

**Test Scenarios**:
- ✅ Valid: Period has GRN receipts, or previous period cost available
- ❌ Invalid: No receipts in period and no fallback available

---

## Cross-Field Validations

### VAL-TXN-201: Inventory Balance Consistency
**Rule**: After transaction, inventory balance must remain consistent: `quantity_available = quantity_on_hand - quantity_allocated`

**Layer**: Database Trigger
**Error Message**: "Inventory balance calculation error"
**Implementation**:
```sql
CREATE TRIGGER check_inventory_balance_consistency
BEFORE UPDATE ON inventory_status
FOR EACH ROW
EXECUTE FUNCTION validate_balance_consistency();

CREATE FUNCTION validate_balance_consistency()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_available <> (NEW.quantity_on_hand - NEW.quantity_allocated) THEN
    RAISE EXCEPTION 'quantity_available must equal quantity_on_hand - quantity_allocated';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Test Scenarios**:
- ✅ Valid: on_hand=100, allocated=30, available=70
- ❌ Invalid: on_hand=100, allocated=30, available=60

---

### VAL-TXN-202: Transfer Transaction Pairing
**Rule**: Transfer transactions must have valid reference to paired transaction (OUT references IN and vice versa).

**Layer**: Server
**Error Message**: "Transfer transaction missing paired transaction"
**Implementation**:
```typescript
async function validateTransferPairing(
  outTransactionId: string,
  inTransactionId: string
): Promise<void> {
  const outTxn = await getTransaction(outTransactionId);
  const inTxn = await getTransaction(inTransactionId);

  if (outTxn.reference_transaction_id !== inTransactionId ||
      inTxn.reference_transaction_id !== outTransactionId) {
    throw new ValidationError("Transfer transaction missing paired transaction");
  }

  if (outTxn.quantity !== inTxn.quantity ||
      outTxn.unit_cost !== inTxn.unit_cost) {
    throw new ValidationError("Transfer transactions must have matching quantity and cost");
  }
}
```

**Test Scenarios**:
- ✅ Valid: OUT and IN reference each other, same qty and cost
- ❌ Invalid: OUT references IN but IN doesn't reference OUT

---

### VAL-TXN-203: Allocation Release on Posting
**Rule**: When requisition is posted, corresponding allocation must be released.

**Layer**: Server
**Error Message**: "Allocation release failed"
**Implementation**:
```typescript
async function validateAllocationReleased(
  requisitionId: string,
  itemId: string,
  locationId: string
): Promise<void> {
  const allocations = await getActiveAllocations(requisitionId, itemId, locationId);

  if (allocations.length > 0) {
    throw new ValidationError(
      `Active allocations still exist for requisition ${requisitionId}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: After posting, allocation status = FULFILLED
- ❌ Invalid: After posting, allocation status = ACTIVE

---

## Security Validations

### VAL-TXN-301: User Has Transaction Create Permission
**Rule**: User must have permission to create the specific transaction type.

**Layer**: Server
**Error Message**: "You do not have permission to create {transactionType} transactions"
**Implementation**:
```typescript
const transactionPermissions: Record<string, string[]> = {
  'GRN': ['procurement-staff', 'warehouse-staff', 'inventory-manager'],
  'ISSUE': ['store-staff', 'warehouse-staff', 'inventory-manager'],
  'TRANSFER': ['warehouse-staff', 'inventory-manager'],
  'ADJUST': ['inventory-manager', 'finance-manager'],
  'RETURN': ['procurement-staff', 'inventory-manager']
};

function validateCreatePermission(
  userRole: string,
  transactionType: string
): void {
  const allowedRoles = transactionPermissions[transactionType] || [];

  if (!allowedRoles.includes(userRole)) {
    throw new AuthorizationError(
      `You do not have permission to create ${transactionType} transactions`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: procurement-staff creates GRN, inventory-manager creates ADJUST
- ❌ Invalid: store-staff creates GRN, procurement-staff creates ADJUST

---

### VAL-TXN-302: User Has Posting Permission
**Rule**: Only inventory managers and finance managers can post transactions.

**Layer**: Server
**Error Message**: "You do not have permission to post transactions"
**Implementation**:
```typescript
const postingRoles = ['inventory-manager', 'finance-manager', 'system-admin'];

function validatePostingPermission(userRole: string): void {
  if (!postingRoles.includes(userRole)) {
    throw new AuthorizationError(
      "You do not have permission to post transactions"
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: inventory-manager, finance-manager
- ❌ Invalid: store-staff, procurement-staff

---

### VAL-TXN-303: User Has Reversal Permission
**Rule**: Only inventory managers, finance managers, and system administrators can reverse transactions.

**Layer**: Server
**Error Message**: "You do not have permission to reverse transactions"
**Implementation**:
```typescript
const reversalRoles = ['inventory-manager', 'finance-manager', 'system-admin'];

function validateReversalPermission(
  userRole: string,
  transactionType: string
): void {
  if (!reversalRoles.includes(userRole)) {
    throw new AuthorizationError(
      "You do not have permission to reverse transactions"
    );
  }

  // Role-based transaction type restrictions
  if (userRole === 'inventory-manager' && !['GRN', 'TRANSFER', 'ADJUST'].includes(transactionType)) {
    throw new AuthorizationError(
      "Inventory managers can only reverse GRN, Transfer, and Adjustment transactions"
    );
  }

  // Note: High-value reversal notifications handled by workflow engine (optional)
}
```

**Test Scenarios**:
- ✅ Valid: inventory-manager reverses GRN, finance-manager reverses any transaction type
- ❌ Invalid: store-staff reverses any transaction, inventory-manager reverses requisition

---

### VAL-TXN-304: Location Access Permission
**Rule**: User can only create transactions for locations they have access to.

**Layer**: Server
**Error Message**: "You do not have access to location {locationId}"
**Implementation**:
```typescript
async function validateLocationAccess(
  userId: string,
  locationId: string
): Promise<void> {
  const user = await getUserWithLocations(userId);

  if (!user.accessible_locations.includes(locationId) && user.role !== 'system-admin') {
    throw new AuthorizationError(
      `You do not have access to location ${locationId}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: User assigned to location creates transaction for that location
- ❌ Invalid: User tries to create transaction for different location

---

### VAL-TXN-305: Audit Log Immutability
**Rule**: Audit log entries cannot be updated or deleted.

**Layer**: Database Trigger
**Error Message**: "Audit log entries are immutable"
**Implementation**:
```sql
CREATE TRIGGER prevent_audit_modification
BEFORE UPDATE OR DELETE ON transaction_audit_log
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_changes();

CREATE FUNCTION prevent_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log entries are immutable and cannot be modified or deleted';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

**Test Scenarios**:
- ✅ Valid: INSERT new audit entries
- ❌ Invalid: UPDATE or DELETE audit entries

---

## Validation Error Response Format

All validation errors should return consistent error responses:

```typescript
interface ValidationError {
  code: string;           // Error code (e.g., "VAL-TXN-101")
  message: string;        // User-friendly error message
  field?: string;         // Field name if field-specific
  details?: any;          // Additional context
  validationLayer: 'CLIENT' | 'SERVER' | 'DATABASE';
}

// Example
{
  code: "VAL-TXN-101",
  message: "Insufficient stock available. Available: 50, Requested: 100",
  field: "quantity",
  details: {
    itemId: "uuid-123",
    locationId: "uuid-456",
    available: 50,
    requested: 100
  },
  validationLayer: "SERVER"
}
```

---

**End of Validation Rules Document**

**Related Documents**:
- [System Method](./SM-inventory-transactions.md)
- [Business Requirements](./BR-inventory-transactions.md)
- [Use Cases](./UC-inventory-transactions.md)
- [Flow Diagrams](./FD-inventory-transactions.md)
