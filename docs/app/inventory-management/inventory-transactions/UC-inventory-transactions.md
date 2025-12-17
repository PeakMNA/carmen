# Use Cases: Inventory Transactions

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Inventory Transactions
- **Version**: 1.0.0
- **Last Updated**: 2025-11-02
- **Status**: Draft

## Document Purpose

This document describes the use cases for inventory transaction management, covering user interactions, system behaviors, integration scenarios, and background processes. Each use case provides step-by-step flows, preconditions, postconditions, and success criteria.

**Related Documents**:
- [System Method](./SM-inventory-transactions.md)
- [Business Requirements](./BR-inventory-transactions.md)
- [Flow Diagrams](./FD-inventory-transactions.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Use Case Index

### User Use Cases (UC-TXN-001 to 099)
- **UC-TXN-001**: Create Goods Receipt (GRN) Transaction
- **UC-TXN-002**: Create and Submit Store Requisition
- **UC-TXN-003**: Transfer Inventory Between Locations
- **UC-TXN-004**: Perform Stock Count and Adjustment
- **UC-TXN-005**: Process Vendor Return
- **UC-TXN-012**: Approve Pending Transaction
- **UC-TXN-013**: Post Approved Transaction
- **UC-TXN-014**: Reverse Posted Transaction
- **UC-TXN-015**: Manage Stock Allocations
- **UC-TXN-016**: View Transaction History
- **UC-TXN-017**: Monitor Transaction Dashboard
- **UC-TXN-018**: Import Batch Transactions

### System Use Cases (UC-TXN-101 to 199)
- **UC-TXN-101**: Calculate Transaction Cost via Valuation Service
- **UC-TXN-102**: Queue General Ledger Posting
- **UC-TXN-103**: Update Inventory Balances with Optimistic Locking
- **UC-TXN-104**: Manage FIFO Cost Layers (FIFO Method)
- **UC-TXN-105**: Invalidate Period Cost Cache (Periodic Average)
- **UC-TXN-106**: Create Transaction Audit Log Entries

---

## User Use Cases

### UC-TXN-001: Create Goods Receipt (GRN) Transaction

**Actor**: Procurement Staff
**Goal**: Record receipt of goods from vendor
**Frequency**: High (10-100 times per day)
**Related**: FR-TXN-001, BR-TXN-001, BR-TXN-002

**Preconditions**:
- User has procurement staff role
- Purchase order exists and is approved
- Items in PO are active in system
- Receiving location is active

**Main Success Scenario**:
1. User navigates to GRN creation screen
2. User selects approved purchase order from list
3. System displays PO details (vendor, items, quantities, costs)
4. User enters received quantities for each line item
5. User optionally enters lot numbers and expiry dates (for lot-controlled items)
6. User selects receiving location from dropdown
7. System validates all inputs (positive quantities, location valid, item active)
8. User clicks "Create GRN" button
9. System generates unique GRN number (format: GRN-YYMM-NNNN)
10. If costing method = FIFO: System creates cost layers for each line item
11. If costing method = PERIODIC_AVERAGE: System marks period cost cache for invalidation
12. System saves GRN with status = DRAFT
13. System displays success message with GRN number

**Postconditions**:
- GRN created in DRAFT status
- No inventory balance changes (not yet posted)
- If FIFO: Cost layers created with remaining_quantity = original_quantity
- Audit log entry: TRANSACTION_CREATED

**Alternate Flows**:
- **3a**: PO not found or not approved → Display error "PO must be approved before receiving"
- **7a**: Validation fails → Display specific validation errors
- **10a**: FIFO layer creation fails → Rollback GRN creation, display error

**Business Rules Applied**: BR-TXN-001, BR-TXN-002, BR-TXN-005

**Success Criteria**: GRN created within 2 seconds with valid data

---

### UC-TXN-002: Create and Submit Store Requisition

**Actor**: Store Staff
**Goal**: Request inventory from warehouse to store
**Frequency**: High (20-200 times per day)
**Related**: FR-TXN-002, BR-TXN-003, BR-TXN-004

**Preconditions**:
- User has store staff role
- User assigned to store location
- Items exist and have stock at source location

**Main Success Scenario**:
1. User navigates to "New Requisition" screen
2. User selects source location (warehouse) and destination (own store)
3. User searches and adds items to requisition
4. For each item, user enters required quantity
5. System checks stock availability: `Available = quantity_on_hand - quantity_allocated`
6. System displays available quantity and flags insufficient stock
7. User enters requisition reason/purpose (min 10 characters)
8. User enters required-by date
9. User clicks "Save Draft" → System saves with status = DRAFT
10. User clicks "Submit" → System validates all fields
11. System submits requisition to workflow engine
12. Workflow engine evaluates approval routing rules (department, location, item category, etc.)
13. Workflow engine determines: Auto-approve OR Route to approver(s)
14. If auto-approved: System sets status = APPROVED
15. If approval required: System sets status = PENDING_APPROVAL, workflow engine notifies approver(s)
16. System creates stock allocations reducing quantity_available
17. System displays confirmation with requisition number and approval status

**Postconditions**:
- Requisition created with appropriate status
- Stock allocations created, quantity_available reduced
- Audit log entries created
- If approval required: Approver notified via email

**Alternate Flows**:
- **5a**: Insufficient stock AND backorder not allowed → Display warning, prevent add
- **5b**: Insufficient stock AND backorder allowed → Allow add with backorder flag
- **10a**: Validation fails → Display errors, remain in edit mode
- **14a**: Allocation creation fails → Rollback requisition, display error

**Business Rules Applied**: BR-TXN-003, BR-TXN-004

**Success Criteria**: Requisition created and allocated within 3 seconds

---

### UC-TXN-003: Transfer Inventory Between Locations

**Actor**: Warehouse Staff
**Goal**: Move inventory from one location to another
**Frequency**: Medium (5-50 times per day)
**Related**: FR-TXN-003, BR-TXN-005

**Preconditions**:
- User has warehouse staff role
- Source and destination locations are active
- Item exists at source location with sufficient quantity

**Main Success Scenario**:
1. User navigates to "Stock Transfer" screen
2. User selects source location from dropdown
3. User selects destination location from dropdown
4. System validates source ≠ destination
5. User searches and selects item to transfer
6. System displays current quantity at source location
7. User enters transfer quantity
8. System validates quantity <= available quantity at source
9. User optionally enters transfer reason and expected arrival date
10. User clicks "Create Transfer"
11. System calls valuation service to get cost at source location
12. System begins database transaction
13. System creates OUT transaction at source (movement_type = OUT)
14. System creates IN transaction at destination (movement_type = IN)
15. Both transactions reference each other via reference_transaction_id
16. System updates source location balance (decrease quantity_on_hand)
17. System updates destination location balance (increase quantity_on_hand)
18. If "In Transit" option selected: Set quantity_in_transit on both locations
19. System commits database transaction
20. System queues two GL entries (debit Inventory-Destination, credit Inventory-Source)
21. System displays success with both transaction numbers

**Postconditions**:
- Two linked transactions created with status = POSTED
- Source location: quantity_on_hand reduced
- Destination location: quantity_on_hand increased
- Both transactions have same unit_cost
- GL entries queued

**Alternate Flows**:
- **4a**: Source = Destination → Display error "Cannot transfer to same location"
- **8a**: Quantity > available → Display error with available quantity
- **11a**: Cost calculation fails → Display error, allow retry or cancel
- **19a**: Transaction commit fails → Rollback all changes, display error

**Business Rules Applied**: BR-TXN-005, BR-TXN-006

**Success Criteria**: Transfer completes atomically within 3 seconds

---

### UC-TXN-012: Approve Pending Transaction

**Actor**: Approver (as determined by workflow engine)
**Goal**: Review and approve submitted requisition
**Frequency**: Medium (10-50 times per day)
**Related**: FR-TXN-006, BR-TXN-004

**Preconditions**:
- User is designated as approver by workflow engine for this transaction
- Transaction exists with status = PENDING_APPROVAL
- Workflow engine routed transaction to this user

**Main Success Scenario**:
1. User accesses "Pending Approvals" dashboard
2. System displays list of transactions routed to user by workflow engine
3. User clicks on transaction to review
4. System displays transaction details: items, quantities, costs, reason, requester
5. System displays workflow routing information (why this user is approver)
6. User reviews stock availability and business justification
7. User clicks "Approve" button
8. System validates user is designated approver via workflow engine
9. Workflow engine processes approval and determines next step (complete approval OR route to next approver)
10. System updates transaction status = APPROVED (if final approval) or remains PENDING_APPROVAL (if more approvers needed)
11. System records approval in audit log
12. System sends notification to requester (if final approval) or next approver (if multi-level)
13. System displays confirmation message with approval status

**Postconditions**:
- Approval recorded in workflow engine and audit log
- If final approval: Transaction status = APPROVED, ready for posting
- If multi-level approval: Transaction remains PENDING_APPROVAL, routed to next approver
- Audit log: APPROVED event with approver details
- Appropriate parties notified

**Alternate Flows**:
- **7a**: User clicks "Reject" → System prompts for rejection reason → Workflow engine processes rejection → Sets status = DRAFT → Notifies requester with reason
- **8a**: User is not designated approver → Display error "You are not authorized to approve this transaction"
- **8b**: Transaction already processed by another approver → Display info message with current status

**Business Rules Applied**: BR-TXN-004, BR-TXN-017

**Success Criteria**: Approval recorded and workflow advanced within 1 second

---

### UC-TXN-013: Post Approved Transaction

**Actor**: System / Inventory Manager
**Goal**: Finalize transaction, update inventory and GL
**Frequency**: High (auto or manual, 50-500 times per day)
**Related**: FR-TXN-007, BR-TXN-007, BR-TXN-010

**Preconditions**:
- Transaction status = APPROVED
- All approvals obtained
- System in operational state (not in maintenance)

**Main Success Scenario**:
1. User (or scheduler) initiates posting for approved transaction
2. System validates current status = APPROVED
3. If OUT transaction: System calls valuation service for cost calculation
4. Valuation service returns cost (FIFO layers or period average)
5. System begins database transaction
6. System updates transaction with cost details
7. System updates inventory_status using optimistic locking:
   - Load current version
   - Calculate new quantity
   - UPDATE with version check
   - If version mismatch: Retry with exponential backoff (max 3 retries)
8. If FIFO method: System updates FIFO layers (consume or create)
9. If Periodic Average + GRN: System invalidates period cost cache
10. System sets transaction status = POSTED, posted_at = NOW, posted_by = user
11. System commits database transaction
12. System queues GL posting asynchronously
13. System creates audit log entries
14. If stock allocation exists: System releases allocation
15. System displays success "Transaction posted successfully"

**Postconditions**:
- Transaction status = POSTED
- Inventory balance updated
- FIFO layers updated (if applicable)
- Period cache invalidated (if applicable)
- GL entry queued
- Stock allocation released
- Posted transaction is immutable

**Alternate Flows**:
- **2a**: Status ≠ APPROVED → Display error "Transaction must be approved first"
- **3a**: Valuation service error → Log error, apply fallback strategy or abort
- **7a**: Version conflict after 3 retries → Display error "Concurrency conflict, please retry"
- **11a**: Transaction commit fails → Rollback all changes, display error
- **12a**: GL queue full → Log warning, queue for retry

**Business Rules Applied**: BR-TXN-006, BR-TXN-007, BR-TXN-008, BR-TXN-010, BR-TXN-011, BR-TXN-013

**Success Criteria**: Posting completes within 2 seconds (excluding GL)

---

### UC-TXN-014: Reverse Posted Transaction

**Actor**: Inventory Manager
**Goal**: Reverse incorrectly posted transaction
**Frequency**: Low (1-10 times per week)
**Related**: FR-TXN-008, BR-TXN-012

**Preconditions**:
- User has reversal permission
- Transaction exists with status = POSTED
- Transaction not already reversed

**Main Success Scenario**:
1. User locates transaction in transaction history
2. User clicks "Reverse Transaction" button
3. System displays reversal confirmation dialog
4. System shows original transaction details
5. User enters reversal reason (required, min 20 characters, max 500)
6. User clicks "Confirm Reversal"
7. System validates user has reversal permission
8. System begins database transaction
9. System creates new reversal transaction:
   - All quantities and costs negated
   - reference_transaction_id = original transaction ID
   - status = POSTED
10. System updates inventory balance (opposite of original)
11. If FIFO + original was IN: System restores consumed layers
12. If FIFO + original was OUT: System adjusts/removes created layers
13. System queues reversing GL entry
14. System updates original transaction:
    - reversed_by = reversal transaction ID
    - reversal_date = NOW
    - reversal_reason = user input
    - status = REVERSED
15. System commits database transaction
16. System creates audit log entries
17. System sends notifications to stakeholders
18. System displays success "Transaction reversed successfully"

**Postconditions**:
- Original transaction: status = REVERSED
- Reversal transaction created: status = POSTED
- Inventory balance adjusted (negated)
- FIFO layers restored/adjusted
- GL reversal queued
- Complete audit trail

**Alternate Flows**:
- **2a**: Transaction already reversed → Display error "Transaction already reversed on [date]"
- **7a**: User lacks reversal permission → Display error "Insufficient permissions"
- **15a**: Transaction commit fails → Rollback all changes, display error

**Business Rules Applied**: BR-TXN-008, BR-TXN-012, BR-TXN-018

**Success Criteria**: Reversal completes atomically within 3 seconds

---

## System Use Cases

### UC-TXN-101: Calculate Transaction Cost via Valuation Service

**Actor**: Transaction Posting System
**Goal**: Get accurate cost for OUT transaction
**Frequency**: Very High (every OUT transaction)
**Related**: FR-TXN-011, BR-TXN-005

**Preconditions**:
- OUT transaction ready for posting
- Valuation service operational
- Costing method configured

**Main Success Scenario**:
1. System prepares cost request: itemId, quantity, transactionDate, locationId
2. System calls valuation service API: `calculateInventoryValuation()`
3. Valuation service queries costing method from settings
4. If FIFO: Service queries available layers, consumes oldest first
5. If Periodic Average: Service checks cache or calculates monthly average
6. Service returns ValuationResult: unitCost, totalValue, layersConsumed (FIFO only)
7. System applies cost to transaction
8. If FIFO: System stores layersConsumed for audit trail
9. System logs successful cost calculation

**Postconditions**:
- Transaction has valid unit_cost and total_cost
- FIFO layers identified for consumption
- OR period average cost applied
- Cost calculation logged

**Alternate Flows**:
- **3a**: Valuation service unavailable → Retry 3 times with exponential backoff → If still fails, apply fallback strategy
- **4a**: FIFO, no layers available → Return error NO_LAYERS_AVAILABLE → Transaction posting aborted
- **5a**: Periodic Average, no receipts in period → Try fallback to previous month → If still fails, return error

**Business Rules Applied**: BR-TXN-005, BR-TXN-010, BR-TXN-011, BR-TXN-012

**Success Criteria**: Cost calculated within 500ms

---

### UC-TXN-102: Queue General Ledger Posting

**Actor**: Transaction Posting System
**Goal**: Create GL entry for posted transaction
**Frequency**: Very High (every posted transaction)
**Related**: FR-TXN-012, BR-TXN-014, BR-TXN-015

**Preconditions**:
- Transaction posted successfully to inventory
- GL integration enabled
- Account mappings configured

**Main Success Scenario**:
1. System prepares GL posting request after successful inventory posting
2. System queries account mapping based on:
   - Transaction type (GRN, ISSUE, TRANSFER, ADJUST, RETURN)
   - Location (for cost center)
   - Issue type (if applicable: usage, production, wastage)
3. System builds GL entry:
   - Debit account, amount, cost center
   - Credit account, amount, cost center
   - Reference: transaction ID and number
   - Posting date: transaction.posted_at
4. System adds entry to GL posting queue
5. System marks transaction.gl_posted = false (not yet processed)
6. Background job picks up queued entry within 5 minutes
7. Background job calls GL API to create journal entry
8. GL API returns journal entry ID
9. System updates transaction.gl_posted = true, gl_posting_reference = journal ID
10. System creates audit log: GL_POSTED

**Postconditions**:
- GL entry queued or posted
- Transaction marked with GL reference
- Audit log created

**Alternate Flows**:
- **3a**: Account mapping not found → Log error, queue for manual review
- **7a**: GL API fails → Retry with exponential backoff (max 5 retries) → If still fails, flag for manual intervention
- **7b**: GL API timeout → Queue for retry in next batch

**Business Rules Applied**: BR-TXN-014, BR-TXN-015

**Success Criteria**: Entry queued immediately, processed within 5 minutes

---

### UC-TXN-103: Update Inventory Balances with Optimistic Locking

**Actor**: Transaction Posting System
**Goal**: Update inventory balance atomically preventing concurrent conflicts
**Frequency**: Very High (every transaction posting)
**Related**: FR-TXN-009, BR-TXN-006, BR-TXN-013

**Preconditions**:
- Transaction ready for inventory update
- Inventory status record exists or can be created

**Main Success Scenario**:
1. System queries current inventory_status for item + location
2. System loads current values: quantity_on_hand, quantity_allocated, version
3. System calculates new quantity_on_hand based on movement type:
   - IN: new_qty = current_qty + transaction_qty
   - OUT: new_qty = current_qty - transaction_qty
4. System validates new quantity >= 0 (unless backorder allowed)
5. System executes atomic UPDATE with version check:
   ```sql
   UPDATE inventory_status
   SET quantity_on_hand = new_qty,
       quantity_available = new_qty - quantity_allocated,
       version = version + 1,
       last_transaction_id = txn_id,
       updated_at = NOW()
   WHERE item_id = ? AND location_id = ? AND version = current_version
   ```
6. System checks affected rows
7. If affected_rows = 1: Success, balance updated
8. System logs balance change in audit trail

**Postconditions**:
- Inventory balance updated
- quantity_available recalculated
- Version incremented
- Last transaction recorded

**Alternate Flows**:
- **1a**: No record exists → Create new inventory_status with initial quantity
- **4a**: New quantity < 0 AND backorder not allowed → Return error NEGATIVE_INVENTORY
- **6a**: affected_rows = 0 (version conflict) → Concurrency conflict detected
   - Retry attempt 1: Wait 100ms, reload current state, recalculate, retry UPDATE
   - Retry attempt 2: Wait 200ms, reload, retry
   - Retry attempt 3: Wait 400ms, reload, retry
   - If still fails: Return error CONCURRENCY_CONFLICT

**Business Rules Applied**: BR-TXN-006, BR-TXN-013

**Success Criteria**: Update completes within 500ms, conflicts resolved via retry

---

### UC-TXN-106: Create Transaction Audit Log Entries

**Actor**: Transaction System
**Goal**: Log all transaction operations for audit trail
**Frequency**: Very High (multiple entries per transaction)
**Related**: FR-TXN-013, BR-TXN-009, BR-TXN-029

**Preconditions**:
- Transaction operation occurred
- Audit logging enabled

**Main Success Scenario**:
1. System detects auditable event (create, modify, approve, post, reverse, cancel)
2. System prepares audit log entry:
   - transaction_id
   - event_type
   - event_description (human-readable)
   - old_value (JSON, if applicable)
   - new_value (JSON, if applicable)
   - user_id
   - timestamp (UTC, millisecond precision)
   - ip_address (optional)
3. System inserts entry into transaction_audit_log table asynchronously
4. System confirms entry created (does not block main transaction)

**Postconditions**:
- Audit entry created in immutable audit log
- Event timestamp recorded with millisecond precision
- User and IP tracked

**Alternate Flows**:
- **3a**: Audit log insert fails → Log error to system log → Retry async → If still fails, queue for manual recovery

**Business Rules Applied**: BR-TXN-009, BR-TXN-029, BR-TXN-030

**Success Criteria**: Audit entry created without blocking transaction

---

**End of Use Cases Document**

**Related Documents**:
- [System Method](./SM-inventory-transactions.md)
- [Business Requirements](./BR-inventory-transactions.md)
- [Flow Diagrams](./FD-inventory-transactions.md)
- [Validation Rules](./VAL-inventory-transactions.md)
