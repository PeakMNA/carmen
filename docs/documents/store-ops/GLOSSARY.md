# Glossary of Terms and Abbreviations

**Module**: Store Operations
**Last Updated**: 2025-10-02

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Table of Contents

- [General Terms](#general-terms)
- [Store Requisitions](#store-requisitions)
- [Stock Management](#stock-management)
- [Wastage Management](#wastage-management)
- [Workflow and Approvals](#workflow-and-approvals)
- [Technical Terms](#technical-terms)
- [Abbreviations](#abbreviations)

---

## General Terms

### Store Operations
The overall module managing day-to-day store activities including requisitions, stock replenishment, and wastage tracking.

### Location
A physical storage area or operational unit where inventory is kept. Can be a warehouse, kitchen, store, or department.

### Location Code
A unique identifier for a storage location (e.g., CK-001, MW-001, RS-001).

### Movement Type
The type of inventory transaction, typically "Issue" for store requisitions indicating materials being issued/transferred.

### Unit of Measure (UOM)
The standard unit used to count or measure an item (e.g., Box, Bag, Kg, Liter, Piece, Pack).

---

## Store Requisitions

### Store Requisition (SR)
A formal request to transfer inventory items from one location (store/warehouse) to another operational unit or department.

### SR Number
Unique reference number for a store requisition following the format: SR-YYMM-NNNN (e.g., SR-2401-0001).

### Requisition Status
Current state of a requisition in its lifecycle:
- **Draft**: Being prepared, not yet submitted
- **In Process**: Submitted and moving through approval workflow
- **Complete**: Fully approved and processed
- **Reject**: Declined by an approver
- **Void**: Cancelled/nullified

### Request To
The source location or store from which items are being requested (supplier of the items).

### To Location
The destination location or unit that will receive the items (recipient of the items).

### Expected Delivery Date
Target date by which the requested items should be delivered to the requesting location.

### Workflow Stage
Current approval step in the requisition process (e.g., "HOD Approval", "Store Manager Approval").

### Qty Required
Quantity of an item requested in the requisition.

### Qty Approved
Quantity of an item approved by reviewers (may differ from Qty Required).

### Qty Issued
Actual quantity of an item issued/delivered (tracked in stock movements).

### Item-Level Approval
The ability to approve or reject individual line items within a requisition rather than the entire requisition.

### Approval Status (Item)
Status of individual items in a requisition:
- **Pending**: Awaiting approval decision
- **Approved**: Item approved for issue
- **Reject**: Item declined
- **Review**: Requires additional review

---

## Stock Management

### SKU (Stock Keeping Unit)
A unique identifier for each distinct product/item in the inventory system.

### On Hand
Current quantity of an item physically available in a location's inventory.

### On Order
Quantity of an item currently on purchase orders but not yet received.

### Min Level (Minimum Level)
The lowest acceptable quantity of an item before reordering action is required. Triggers low stock alerts.

### Max Level (Maximum Level)
The maximum quantity of an item that should be stocked to avoid overstocking and storage issues.

### Par Level
The optimal/target stock level for an item that balances availability with storage costs and waste risk.

### Reorder Point
The stock level at which a new order should be triggered to replenish inventory before reaching minimum level.

### Low Stock
Status indicator when current stock falls below the minimum level.

### Critical Stock
Status when current stock falls below the reorder point, requiring immediate action.

### Stock Value
Total monetary value of inventory calculated as quantity × unit cost for all items.

### Stock Movement
A record of inventory quantity changes between locations or due to transactions (issues, receipts, transfers, adjustments).

### Stock Trend
Historical pattern of inventory levels over time, used for forecasting and planning.

### Usage Pattern
Classification of how frequently an item is consumed:
- **High**: Frequently used items
- **Medium**: Moderately used items
- **Low**: Infrequently used items

---

## Wastage Management

### Wastage
Inventory that has become unusable, unsellable, or has been lost and must be written off.

### Wastage Reason
Classification of why wastage occurred:
- **Expiration**: Product past expiry/best-before date
- **Damage**: Physical damage to product or packaging
- **Quality Issues**: Failed quality inspection or contamination
- **Other**: Miscellaneous reasons (spillage, customer returns, etc.)

### Write-Off
The act of removing wasted inventory from stock records and recognizing the financial loss.

### Total Loss
The calculated monetary value of wasted inventory (Quantity × Unit Cost).

### Wastage Entry
A record documenting a wastage event including item, quantity, reason, and reporter.

### Pending Review (Wastage)
Wastage entries awaiting approval before being finalized.

### Photo Evidence
Photographic documentation of damaged or wasted items for audit and approval purposes.

---

## Workflow and Approvals

### Approval Workflow
A defined sequence of approval stages that a requisition must pass through before completion.

### Approval Stage
A specific step in the approval workflow requiring action from a designated approver.

### Approver
An individual with authority to approve or reject a requisition at a specific workflow stage.

### Submission Stage
The initial workflow stage when a requisition is first submitted to the approval process.

### HOD (Head of Department)
A manager responsible for approving department-level requisitions. First level of approval.

### Store Manager
Manager responsible for final approval before items are issued from stores. Second level of approval.

### Approval Status (Workflow)
State of a workflow stage:
- **Pending**: Not yet reached or under review
- **Approved**: Stage completed successfully
- **Rejected**: Stage declined, workflow stopped
- **Current**: Currently active stage awaiting action

### Approval Comment
Notes added by an approver explaining their decision or providing instructions.

### Approval Log
Complete history of all approval actions, decisions, and comments for a requisition.

### Approval Timestamp
Date and time when an approval decision was made.

### Multi-Level Approval
An approval process requiring sequential approval from multiple authorities at different organizational levels.

---

## Technical Terms

### Journal Entry
An accounting record documenting the financial impact of a transaction with debit and credit accounts.

### Debit Account
The account that increases (receives value) in a journal entry.

### Credit Account
The account that decreases (gives value) in a journal entry.

### Account Code
A unique identifier for a general ledger account used in financial transactions.

### Reference Number
A unique identifier linking a journal entry back to its source transaction (e.g., SR number).

### Tax Rate
Percentage of tax applied to an item's cost (e.g., 7% VAT).

### Discount Rate
Percentage discount applied to an item's cost.

### Subtotal
Item total before tax and discount calculations.

### Total Amount
Final calculated amount including tax and discount (Subtotal + Tax - Discount).

### Activity Log
A chronological record of all actions and changes made to a record.

### Audit Trail
Complete history of changes, approvals, and transactions for compliance and tracking purposes.

---

## Abbreviations

### General
- **SR**: Store Requisition
- **SKU**: Stock Keeping Unit
- **UOM**: Unit of Measure
- **QTY**: Quantity
- **HOD**: Head of Department

### Locations
- **CK**: Central Kitchen
- **RS**: Roastery Store
- **MW**: Main Warehouse
- **WH**: Warehouse

### Status
- **N/A**: Not Available/Applicable
- **TBD**: To Be Determined

### Financial
- **VAT**: Value Added Tax
- **GST**: Goods and Services Tax
- **BHT**: Thai Baht (currency)
- **USD**: US Dollar (currency)

### Roles
- **SM**: Store Manager
- **DM**: Department Manager
- **FM**: Financial Manager
- **PS**: Purchasing Staff

### Technical
- **API**: Application Programming Interface
- **UI**: User Interface
- **UX**: User Experience
- **CRUD**: Create, Read, Update, Delete
- **CSV**: Comma-Separated Values
- **PDF**: Portable Document Format
- **XLS**: Excel Spreadsheet
- **JSON**: JavaScript Object Notation

### Workflow
- **WIP**: Work In Progress
- **ETA**: Estimated Time of Arrival
- **ETD**: Estimated Time of Delivery

### Inventory
- **FIFO**: First In, First Out
- **LIFO**: Last In, First Out
- **EOQ**: Economic Order Quantity
- **ROP**: Reorder Point
- **ABC**: Activity Based Classification (inventory categorization)

---

## Usage Examples

### Store Requisition Flow
```
1. User creates Draft SR
2. Fills in Request To (M01) and To Location (Central Kitchen)
3. Adds items with Qty Required
4. Submits → moves to "In Process" status
5. Workflow Stage changes to "HOD Approval"
6. HOD reviews and approves/adjusts Qty Approved
7. Workflow Stage advances to "Store Manager Approval"
8. SM approves → Workflow Stage becomes "Complete"
9. Qty Issued is recorded in Stock Movements
10. Journal Entries are auto-generated
```

### Stock Replenishment Example
```
Item: Thai Milk Tea
Current Stock: 25 boxes (On Hand)
Min Level: 30 boxes
Par Level: 80 boxes
Reorder Point: 40 boxes
Status: Low (below Min Level)
Action: Create SR for 55 boxes to reach Par Level
```

### Wastage Recording Example
```
Item: Coffee Beans
Qty: 2 bags
Unit Cost: $28.50
Total Loss: $57.00
Reason: Quality Issues
Status: Pending Review
Next: HOD reviews photo evidence and approves write-off
Result: Inventory adjusted, Journal Entry created
```

---

**Last Updated**: 2025-10-02
**Module**: Store Operations
**Total Terms**: 100+
