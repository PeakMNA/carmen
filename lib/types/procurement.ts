/**
 * Procurement Types
 * 
 * Types and interfaces for procurement operations including purchase requests,
 * purchase orders, goods receipt notes, and related procurement functionality.
 */

import { AuditTimestamp, DocumentStatus, Money, WorkflowStatus, ApprovalRecord } from './common'

// ====== PURCHASE REQUEST ======

/**
 * Purchase request priority levels
 */
export type PurchaseRequestPriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';

/**
 * Purchase request types (BR-aligned)
 * - General: Standard purchase requests for goods and services
 * - MarketList: Daily/recurring F&B purchases (market list orders)
 * - Asset: Fixed asset and capital expenditure purchases
 */
export enum PRType {
  General = 'General',
  MarketList = 'MarketList',
  Asset = 'Asset'
}

/**
 * Purchase request types (string union for flexibility)
 */
export type PurchaseRequestType = 'General' | 'MarketList' | 'Asset';

/**
 * Purchase request status values (BR-aligned)
 * - Draft: Saved but not submitted (editable by requestor)
 * - InProgress: Some approvals received, others pending
 * - Approved: All approvals received (ready for PO conversion)
 * - Void: Approval denied (returned to requestor with comments)
 * - Completed: Converted to Purchase Order(s) (read-only)
 * - Cancelled: Manually cancelled by requestor or approver (with reason)
 */
export enum PRStatus {
  Draft = 'Draft',
  InProgress = 'InProgress',
  Approved = 'Approved',
  Void = 'Void',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

/**
 * Workflow stages for purchase requests
 */
export enum WorkflowStage {
  requester = 'requester',
  departmentHeadApproval = 'departmentHeadApproval',
  purchaseCoordinatorReview = 'purchaseCoordinatorReview',
  financeManagerApproval = 'financeManagerApproval',
  generalManagerApproval = 'generalManagerApproval',
  completed = 'completed'
}

/**
 * Requestor information for purchase requests
 */
export interface Requestor {
  id: string;
  name: string;
  email?: string;
  departmentId: string;
  departmentName?: string;
}

/**
 * Purchase request header (BR-aligned)
 */
export interface PurchaseRequest {
  id: string;
  requestNumber?: string;                    // Auto-generated: PR-[YYMM]-[NNNN]
  requestDate: Date;                         // Creation date
  requiredDate: Date;                        // Required delivery date
  requestType: PurchaseRequestType;          // General | MarketList | Asset
  priority: PurchaseRequestPriority;
  status: PRStatus;                          // BR-aligned status (Draft, InProgress, etc.)
  departmentId: string;
  department?: string;                       // Department name/code
  locationId: string;
  location?: string;                         // Location name/code
  requestedBy: string;
  requestor?: Requestor;                     // Full requestor details
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  cancelledBy?: string;                      // User who cancelled (BR: Cancelled status)
  cancelledAt?: Date;
  cancellationReason?: string;               // Reason for cancellation
  totalItems: number;
  description?: string;                      // Purpose description (BR: FR-PR-001)
  justification?: string;                    // Business justification
  // Currency settings (BR: FR-PR-003)
  currency: string;                          // Transaction currency (e.g., 'THB', 'USD')
  baseCurrency?: string;                     // Organization base currency
  exchangeRate?: number;                     // Currency exchange rate
  // Financial breakdown in transaction currency (BR: FR-PR-003)
  subTotalPrice?: number;                    // Sum of item subtotals
  discountAmount?: number;                   // Total discount
  netAmount?: number;                        // Subtotal - Discount
  taxAmount?: number;                        // Total tax
  totalAmount?: number;                      // Net + Tax (Grand Total)
  // Financial breakdown in base currency
  baseSubTotalPrice?: number;
  baseDiscountAmount?: number;
  baseNetAmount?: number;
  baseTaxAmount?: number;
  baseTotalAmount?: number;
  // Legacy fields (kept for backward compatibility)
  estimatedTotal?: Money;
  actualTotal?: Money;
  // Budget and cost allocation
  budgetCode?: string;
  projectCode?: string;
  jobCode?: string;                          // Project/job code (BR: FR-PR-002)
  costCenter?: string;
  // Attachments and workflow
  attachments?: string[];
  workflowStages: ApprovalRecord[];
  currentStage?: string;
  notes?: string;
  items?: PurchaseRequestItem[];             // Line items for the request
  // Audit fields
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

/**
 * Purchase request line item (BR-aligned)
 */
export interface PurchaseRequestItem {
  id: string;
  requestId: string;                         // Parent PR ID
  lineNumber?: number;                       // Sequence number
  // Item details
  itemId?: string;                           // Product ID (if catalog item)
  itemCode?: string;                         // Product code
  itemName: string;                          // Item name/description
  localName?: string;                        // Local name (BR: FR-PR-002)
  description: string;                       // Additional description
  specification?: string;                    // Technical specifications
  // Category classification (BR: FR-PR-002)
  itemCategory?: string;                     // Category code
  itemSubcategory?: string;                  // Subcategory code
  itemGroup?: string;                        // Item group
  // Quantity and units (BR: quantities to 3 decimal places)
  requestedQuantity: number;                 // Requested quantity (3 decimals)
  approvedQuantity?: number;                 // Approved quantity (3 decimals)
  unit: string;                              // Unit of measure
  // Location and delivery (BR: FR-PR-002, FR-PR-021)
  location?: string;                         // Storage location code
  deliveryLocationId: string;                // Delivery location ID
  deliveryPoint?: string;                    // Delivery point ID (BR: FR-PR-022)
  deliveryPointLabel?: string;               // Delivery point display name
  requiredDate: Date;                        // Item-specific required date
  // Pricing in transaction currency (BR: FR-PR-003, FR-PR-020)
  currency?: string;                         // Transaction currency
  unitPrice?: number;                        // Unit price (2 decimals)
  subtotal?: number;                         // Quantity × Price
  discountRate?: number;                     // Discount percentage
  discountAmount?: number;                   // Calculated discount
  netAmount?: number;                        // Subtotal - Discount
  taxRate?: number;                          // Tax percentage
  taxAmount?: number;                        // Calculated tax
  totalAmount?: number;                      // Net + Tax
  // Base currency amounts (BR: FR-PR-003)
  baseSubtotal?: number;
  baseDiscountAmount?: number;
  baseNetAmount?: number;
  baseTaxAmount?: number;
  baseTotalAmount?: number;
  // Legacy pricing fields (kept for backward compatibility)
  estimatedUnitPrice?: Money;
  estimatedTotal?: Money;
  // Vendor information (BR: FR-PR-020)
  vendorId?: string;                         // Vendor ID
  vendorName?: string;                       // Vendor name for line item
  vendorSuggestion?: string;                 // Suggested vendor based on history
  pricelistNumber?: string;                  // Price list reference
  // FOC (Free of Charge) fields (BR: BR-PR-055 to BR-PR-060)
  focQuantity?: number;                      // FOC quantity (item is FOC if > 0)
  focUnit?: string;                          // FOC unit (required if focQuantity > 0)
  // Tax configuration (BR: BR-PR-061 to BR-PR-065)
  taxIncluded?: boolean;                     // Tax inclusive flag
  // Budget and cost allocation
  budgetCode?: string;
  accountCode?: string;                      // GL account code
  jobCode?: string;                          // Project/job code
  // Additional metadata (BR: FR-PR-021)
  comment?: string;                          // Line item notes (max 500 chars)
  notes?: string;                            // Internal notes
  attachments?: string[];
  priority: PurchaseRequestPriority;
  status: PRStatus;                          // BR-aligned status
  // Workflow tracking
  approvedUnitPrice?: Money;
  approvedTotal?: Money;
  approvedVendor?: string;
  // Conversion tracking
  convertedToPO: boolean;
  purchaseOrderId?: string;
  convertedQuantity?: number;
  remainingQuantity?: number;
  // Audit fields
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// ====== PURCHASE ORDER ======

/**
 * Purchase order status types
 */
export enum PurchaseOrderStatus {
  DRAFT = "Draft",
  SENT = "Sent",
  OPEN = "Open",
  PARTIAL = "Partial",
  FULLY_RECEIVED = "FullyReceived",
  CLOSED = "Closed",
  CANCELLED = "Cancelled",
  VOIDED = "Voided",
  DELETED = "Deleted"
}

/**
 * Purchase order terms and conditions
 */
export interface PurchaseOrderTerms {
  paymentTerms: string;
  deliveryTerms: string;
  warrantyPeriod?: number; // in days
  returnPolicy?: string;
  penaltyClause?: string;
  specialInstructions?: string;
}

/**
 * Purchase order header
 */
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: Date;
  vendorId: string;
  vendorName: string;
  vendorAddress?: string;
  vendorContact?: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'partial_received' | 'fully_received' | 'cancelled' | 'closed';
  currency: string;
  currencyCode?: string; // Transaction currency code (same as currency, for component compatibility)
  baseCurrencyCode?: string; // Company base currency for conversion (e.g., THB)
  exchangeRate: number;
  subtotal: Money;
  taxAmount: Money;
  discountAmount: Money;
  totalAmount: Money;
  deliveryLocationId: string;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  paymentTerms: string;
  terms: PurchaseOrderTerms;
  approvedBy: string;
  approvedAt: Date;
  sentBy?: string;
  sentAt?: Date;
  acknowledgedAt?: Date;
  closedBy?: string;
  closedAt?: Date;
  closureReason?: string;
  totalItems: number;
  receivedItems: number;
  pendingItems: number;
  notes?: string;
  attachments?: string[];
  // QR Code for mobile scanning
  qrCode?: string; // QR code value (e.g., "PO:PO-2025-0001")
  qrCodeImage?: string; // Base64 encoded QR code image
  qrCodeGeneratedAt?: Date; // Timestamp when QR code was generated
  // Audit fields
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Purchase order line item
 */
export interface PurchaseOrderItem {
  id: string;
  orderId: string;
  lineNumber: number;
  itemId?: string;
  itemCode?: string;
  itemName: string;
  description: string;
  specification?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  pendingQuantity: number;
  unit: string;
  unitPrice: Money;
  discount: number; // percentage
  discountAmount: Money;
  lineTotal: Money;
  taxRate: number; // percentage
  taxAmount: Money;
  deliveryDate: Date;
  status: 'pending' | 'partial_received' | 'fully_received' | 'cancelled';
  notes?: string;
  // Source tracking
  sourceRequestId?: string;
  sourceRequestItemId?: string;
}

// ====== GOODS RECEIPT NOTE ======

/**
 * Cost distribution method for extra costs in GRN
 */
export enum CostDistributionMethod {
  NET_AMOUNT = "net-amount",
  QUANTITY_RATIO = "quantity-ratio",
}

/**
 * GRN status types
 */
export enum GRNStatus {
  DRAFT = "DRAFT",
  RECEIVED = "RECEIVED",
  COMMITTED = "COMMITTED",
  VOID = "VOID"
}

/**
 * Goods receipt note header
 */
export interface GoodsReceiveNote {
  id: string;
  grnNumber: string;
  receiptDate: Date;
  vendorId: string;
  vendorName: string;
  // NOTE: PO references are stored at LINE ITEM level (purchaseOrderId, purchaseOrderItemId)
  // This allows one GRN to receive from multiple POs
  // These header-level fields are deprecated but kept for backward compatibility
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
  deliveryNote?: string;
  vehicleNumber?: string;
  driverName?: string;
  status: GRNStatus;
  receivedBy: string;
  committedBy?: string; // Person who committed the GRN (no approval workflow)
  locationId: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: Money;
  discrepancies: number;
  notes?: string;
  attachments?: string[];
}

/**
 * Goods receipt note line item
 */
export interface GoodsReceiveNoteItem {
  id: string;
  grnId: string;
  lineNumber: number;
  // Multi-PO support: PO references at line item level
  purchaseOrderId?: string; // Allows different POs per line item
  purchaseOrderItemId?: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  description: string;
  orderedQuantity?: number;
  deliveredQuantity: number;
  receivedQuantity: number;
  rejectedQuantity: number;
  damagedQuantity: number;
  unit: string;
  unitPrice: Money;
  totalValue: Money;
  batchNumber?: string;
  lotNumber?: string;
  serialNumbers?: string[];
  manufacturingDate?: Date;
  expiryDate?: Date;
  storageLocationId: string;
  rejectionReason?: string;
  notes?: string;
  // Discrepancy tracking
  hasDiscrepancy: boolean;
  discrepancyType?: 'quantity' | 'quality' | 'specification' | 'damage'; // 'quality' refers to goods condition, not inspection workflow
  discrepancyNotes?: string;
}

// ====== CREDIT NOTE ======

/**
 * Credit note for purchase returns and adjustments
 */
export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  creditDate: Date;
  vendorId: string;
  vendorName: string;
  originalInvoiceNumber?: string;
  originalInvoiceDate?: Date;
  grnId?: string;
  grnNumber?: string;
  reason: CreditNoteReason;
  status: DocumentStatus;
  currency: string;
  subtotal: Money;
  taxAmount: Money;
  totalAmount: Money;
  processedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  attachments?: string[];
}

/**
 * Credit note reasons
 */
export enum CreditNoteReason {
  GOODS_RETURN = "GOODS_RETURN",
  PRICE_ADJUSTMENT = "PRICE_ADJUSTMENT",
  QUANTITY_VARIANCE = "QUANTITY_VARIANCE",
  QUALITY_ISSUE = "QUALITY_ISSUE",
  DAMAGED_GOODS = "DAMAGED_GOODS",
  INVOICE_ERROR = "INVOICE_ERROR",
  EARLY_PAYMENT_DISCOUNT = "EARLY_PAYMENT_DISCOUNT",
  OTHER = "OTHER"
}

/**
 * Credit note line item
 */
export interface CreditNoteItem {
  id: string;
  creditNoteId: string;
  grnItemId?: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: Money;
  discount: number;
  discountAmount: Money;
  lineTotal: Money;
  taxRate: number;
  taxAmount: Money;
  reason: string;
  notes?: string;
}

// ====== QUOTATIONS ======

/**
 * Vendor quotation
 */
export interface VendorQuotation {
  id: string;
  quotationNumber: string;
  quotationDate: Date;
  validUntil: Date;
  vendorId: string;
  vendorName: string;
  requestForQuotationId?: string;
  currency: string;
  exchangeRate: number;
  subtotal: Money;
  taxAmount: Money;
  totalAmount: Money;
  deliveryPeriod: number; // in days
  paymentTerms: string;
  warrantyPeriod?: number; // in days
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'expired';
  submittedBy?: string;
  submittedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
  attachments?: string[];
}

/**
 * Quotation line item
 */
export interface QuotationItem {
  id: string;
  quotationId: string;
  lineNumber: number;
  itemId?: string;
  itemCode?: string;
  itemName: string;
  description: string;
  specification?: string;
  quantity: number;
  unit: string;
  unitPrice: Money;
  discount: number;
  discountAmount: Money;
  lineTotal: Money;
  deliveryPeriod: number;
  brandOffered?: string;
  modelNumber?: string;
  notes?: string;
}

// ====== VENDOR EVALUATION ======

/**
 * Vendor performance evaluation
 */
export interface VendorEvaluation {
  id: string;
  vendorId: string;
  evaluationPeriod: {
    startDate: Date;
    endDate: Date;
  };
  evaluatedBy: string;
  evaluationDate: Date;
  // Performance metrics
  qualityScore: number; // 0-100
  deliveryScore: number; // 0-100
  priceScore: number; // 0-100
  serviceScore: number; // 0-100
  overallScore: number; // 0-100
  // Detailed metrics
  onTimeDeliveryRate: number; // percentage
  qualityRejectRate: number; // percentage
  invoiceAccuracyRate: number; // percentage
  responsiveness: number; // 1-5 scale
  // Summary
  totalOrders: number;
  totalValue: Money;
  averageOrderValue: Money;
  recommendations: string;
  issues: string[];
  actionItems: string[];
  nextReviewDate: Date;
}

// ====== PROCUREMENT ANALYTICS ======

/**
 * Procurement metrics for analytics
 */
export interface ProcurementMetrics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalPurchaseRequests: number;
  totalPurchaseOrders: number;
  totalSpend: Money;
  averageProcessingTime: number; // in days
  onTimeDeliveryRate: number; // percentage
  costSavings: Money;
  vendorCount: number;
  // Top performers
  topVendorsByValue: {
    vendorId: string;
    vendorName: string;
    totalValue: Money;
    orderCount: number;
  }[];
  topCategoriesByValue: {
    categoryId: string;
    categoryName: string;
    totalValue: Money;
    orderCount: number;
  }[];
}

// ====== WORKFLOW TYPES ======

/**
 * Workflow stage types for procurement
 */
export type WorkflowStageType = 
  | 'request' 
  | 'hdApproval' 
  | 'purchaseReview' 
  | 'financeManager' 
  | 'gmApproval'
  | 'completed';

/**
 * User roles for procurement workflow
 */
export type UserRole = 
  | "staff" 
  | "hd" 
  | "purchase_staff" 
  | "finance_manager" 
  | "gm";

/**
 * Enhanced workflow stage with procurement-specific fields
 */
export interface ProcurementWorkflowStage {
  status: WorkflowStatus;
  assignedTo?: string;
  completedBy?: string;
  completedAt?: Date;
  comments?: string;
  // Stage-specific fields
  approvedQuantity?: number;
  approvedUnit?: string;
  vendorAssigned?: string;
  priceVerified?: boolean;
}

// ====== BUDGET AND COST CENTER ======

/**
 * Budget allocation for procurement
 */
export interface BudgetAllocation {
  id: string;
  budgetCode: string;
  budgetName: string;
  fiscalYear: string;
  departmentId: string;
  categoryId?: string;
  totalBudget: Money;
  allocatedAmount: Money;
  spentAmount: Money;
  committedAmount: Money;
  availableAmount: Money;
  utilizationRate: number; // percentage
  lastUpdated: Date;
}

/**
 * Cost center for expense tracking
 */
export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  departmentId: string;
  managerId: string;
  isActive: boolean;
}