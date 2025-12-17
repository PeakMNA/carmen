# Purchase Request Module - Data Models

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This document provides a comprehensive overview of the data models used in the Purchase Request (PR) module. It includes detailed information about the interfaces, their relationships, and usage guidelines.

## 1. Core Interfaces

### 1.1 PurchaseRequest Interface

The `PurchaseRequest` interface is the primary data model for purchase requests. It represents a request to purchase goods or services.

```typescript
/**
 * Primary interface for Purchase Requests
 * Used throughout the application for displaying and managing PRs
 */
export interface PurchaseRequest {
  // Basic Information
  id: string;                     // Unique identifier for the PR
  refNumber: string;              // Reference number (e.g., PR-2301-0001)
  date: Date;                     // Creation date
  type: PRType;                   // Type of purchase request
  deliveryDate: Date;             // Expected delivery date
  description: string;            // Description of the purchase request
  
  // Vendor Information
  vendor: string;                 // Vendor name
  vendorId: number;               // Vendor ID in the system
  
  // Requestor Information
  requestorId: string;            // ID of the person making the request
  requestor: {                    // Requestor details
    name: string;                 // Requestor name
    id: string;                   // Requestor ID
    department: string;           // Requestor department
  };
  
  // Status and Workflow
  status: DocumentStatus;         // Document status (Draft, Submitted, etc.)
  workflowStatus: WorkflowStatus; // Workflow status (Pending, Approved, etc.)
  currentWorkflowStage: WorkflowStage; // Current stage in the workflow
  
  // Location and Department
  location: string;               // Location where items are needed
  department: string;             // Department making the request
  jobCode: string;                // Job code for accounting purposes
  
  // Financial Information
  estimatedTotal: number;         // Estimated total cost
  currency: string;               // Currency code (e.g., USD)
  baseCurrencyCode: string;       // Base currency code for conversion
  
  // Calculated Amounts
  baseSubTotalPrice: number;      // Subtotal in base currency
  subTotalPrice: number;          // Subtotal in transaction currency
  baseNetAmount: number;          // Net amount in base currency
  netAmount: number;              // Net amount in transaction currency
  baseDiscAmount: number;         // Discount amount in base currency
  discountAmount: number;         // Discount amount in transaction currency
  baseTaxAmount: number;          // Tax amount in base currency
  taxAmount: number;              // Tax amount in transaction currency
  baseTotalAmount: number;        // Total amount in base currency
  totalAmount: number;            // Total amount in transaction currency
}
```

### 1.2 PurchaseRequestItem Interface

The `PurchaseRequestItem` interface represents an individual item within a purchase request.

```typescript
/**
 * Interface for items within a Purchase Request
 * Each PR can contain multiple items
 */
export interface PurchaseRequestItem {
  // Basic Information
  id?: string;                    // Unique identifier (optional for new items)
  location: string;               // Location where the item is needed
  name: string;                   // Item name
  description: string;            // Item description
  unit: string;                   // Unit of measurement
  
  // Quantity Information
  quantityRequested: number;      // Quantity requested
  quantityApproved: number;       // Quantity approved (may differ from requested)
  
  // Delivery Information
  deliveryDate: Date;             // Expected delivery date for this item
  deliveryPoint: string;          // Specific delivery point
  
  // Pricing Information
  currency: string;               // Currency code
  baseCurrency?: string;          // Base currency code
  currencyRate: number;           // Exchange rate
  price: number;                  // Unit price
  foc: number;                    // Free of charge quantity
  
  // Tax and Discount
  taxIncluded: boolean;           // Whether tax is included in the price
  adjustments: {                  // Adjustment flags
    discount: boolean;            // Whether discount is applied
    tax: boolean;                 // Whether tax is applied
  };
  discountRate: number;           // Discount rate percentage
  taxRate: number;                // Tax rate percentage
  
  // Calculated Amounts
  netAmount: number;              // Net amount before tax and discount
  discountAmount: number;         // Discount amount
  taxAmount: number;              // Tax amount
  totalAmount: number;            // Total amount
  
  // Vendor Information
  vendor: string;                 // Vendor name
  pricelistNumber: string;        // Price list reference number
  
  // Additional Information
  comment: string;                // Comments about the item
  itemCategory: string;           // Item category
  itemSubcategory: string;        // Item subcategory
  status: PurchaseRequestItemStatus; // Item status
  
  // Accounting Information
  accountCode: string;            // Account code for accounting
  jobCode: string;                // Job code for accounting
  
  // Audit Information
  createdBy?: string;             // User who created the item
  createdDate?: Date;             // Creation date
  updatedBy?: string;             // User who last updated the item
  updatedDate?: Date;             // Last update date
  
  // Inventory Information
  inventoryInfo: {                // Information about inventory levels
    onHand: number;               // Quantity on hand
    onOrdered: number;            // Quantity on order
    reorderLevel: number;         // Reorder level
    restockLevel: number;         // Restock level
    averageMonthlyUsage: number;  // Average monthly usage
    lastPrice: number;            // Last purchase price
    lastOrderDate: Date;          // Last order date
    lastVendor: string;           // Last vendor
    inventoryUnit: string;        // Inventory unit of measurement
  };
  
  // Base Currency Amounts
  baseSubTotalPrice: number;      // Subtotal in base currency
  subTotalPrice: number;          // Subtotal in transaction currency
  baseNetAmount: number;          // Net amount in base currency
  baseDiscAmount: number;         // Discount amount in base currency
  baseTaxAmount: number;          // Tax amount in base currency
  baseTotalAmount: number;        // Total amount in base currency
}
```

## 2. Enums and Types

### 2.1 PRType

Defines the types of purchase requests.

```typescript
/**
 * Types of purchase requests
 */
export enum PRType {
  GeneralPurchase = "GeneralPurchase", // General purchases
  MarketList = "MarketList",           // Market list purchases (typically food items)
  AssetPurchase = "AssetPurchase",     // Asset purchases
  ServiceRequest = "ServiceRequest",   // Service requests
}
```

### 2.2 DocumentStatus

Defines the status of a document in the system.

```typescript
/**
 * Document status values
 */
export enum DocumentStatus {
  Draft = "Draft",           // Document is in draft state
  Submitted = "Submitted",   // Document has been submitted
  InProgress = "InProgress", // Document is being processed
  Completed = "Completed",   // Document processing is complete
  Rejected = "Rejected",     // Document has been rejected
}
```

### 2.3 WorkflowStatus

Defines the status of a document in the workflow.

```typescript
/**
 * Workflow status values
 */
export enum WorkflowStatus {
  pending = "Pending",   // Awaiting approval
  approved = "Approved", // Approved
  rejected = "Rejected", // Rejected
}
```

### 2.4 WorkflowStage

Defines the stages in the approval workflow.

```typescript
/**
 * Workflow stages
 */
export enum WorkflowStage {
  requester = "Requester",                           // Initial requester stage
  departmentHeadApproval = "DepartmentHeadApproval", // Department head approval
  purchaseCoordinatorReview = "PurchaseCoordinatorReview", // Purchase coordinator review
  financeManagerApproval = "FinanceManagerApproval", // Finance manager approval
  generalManagerApproval = "GeneralManagerApproval", // General manager approval
  completed = "Completed",                           // Workflow completed
}
```

### 2.5 PurchaseRequestItemStatus

Defines the status of an item within a purchase request.

```typescript
/**
 * Status values for purchase request items
 */
export type PurchaseRequestItemStatus =
  "Pending" |  // Item is pending review
  "Accepted" | // Item has been accepted
  "Rejected" | // Item has been rejected
  "Review";    // Item needs further review
```

## 3. Interface Variations

The PR module has several variations of the PurchaseRequest interface. This section explains their purpose and when to use each one.

### 3.1 PurchaseRequest

The primary interface used throughout most of the application. Use this interface for general PR operations.

### 3.2 PurchaseRequest_1

An extended version of PurchaseRequest with additional fields for detailed operations. Use this interface when you need access to all PR details, including attachments, comments, and activity log.

Key differences from PurchaseRequest:
- Includes `items` array
- Includes `attachments` array
- Includes `comments` array
- Includes `approvals` array
- Includes `activityLog` array

### 3.3 PurchaseRequest_3

Another variation with a slightly different structure. Use this interface when working with budget information and approval history.

Key differences from PurchaseRequest:
- Uses `Requestor` interface instead of inline requestor object
- Includes `budget` object
- Includes `approvalHistory` array

## 4. Best Practices

### 4.1 Interface Selection

- Use the `PurchaseRequest` interface for most operations
- Use `PurchaseRequest_1` when you need access to items, attachments, and activity log
- Use `PurchaseRequest_3` when you need access to budget information and approval history

### 4.2 Interface Consolidation

To reduce confusion, consider consolidating these interfaces in the future. A recommended approach would be to:

1. Create a base `PurchaseRequestBase` interface with common fields
2. Create extended interfaces for specific use cases
3. Use TypeScript's utility types (e.g., `Pick`, `Omit`) to create variations as needed

### 4.3 Type Safety

Always use the appropriate type when working with PR data. This ensures type safety and helps catch errors at compile time.

```typescript
// Good practice
function processPR(pr: PurchaseRequest) {
  // Process PR
}

// Bad practice
function processPR(pr: any) {
  // Process PR
}
```

## 5. Data Flow

The PR data flows through the application as follows:

1. User creates a PR using the PR form
2. Form data is validated and converted to a PurchaseRequest object
3. PurchaseRequest is sent to the server via API
4. Server processes the request and returns the updated PurchaseRequest
5. UI updates to reflect the changes

When editing a PR:

1. PR data is loaded from the server
2. Data is displayed in the edit form
3. User makes changes
4. Changes are validated and sent to the server
5. Server updates the PR and returns the updated data
6. UI updates to reflect the changes 