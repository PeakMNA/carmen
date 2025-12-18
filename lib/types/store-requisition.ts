/**
 * Store Requisition Types
 *
 * Types and interfaces for Store Requisition (SR) operations,
 * Stock Transfers (ST), Stock Issues (SI), and related functionality.
 *
 * @see docs/app/store-operations/sr-business-rules.md
 */

import { Money, ApprovalStatus, AuditTimestamp } from './common'
import { InventoryLocationType } from './location-management'

// ====== ENUMS ======

/**
 * Store Requisition Status
 *
 * Defines the lifecycle stages of a Store Requisition
 */
export enum SRStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Approved = 'approved',
  Processing = 'processing',
  Processed = 'processed',
  PartialComplete = 'partial_complete',
  Completed = 'completed',
  Rejected = 'rejected',
  Cancelled = 'cancelled'
}

/**
 * SR Status Labels for UI display
 */
export const SR_STATUS_LABELS: Record<SRStatus, string> = {
  [SRStatus.Draft]: 'Draft',
  [SRStatus.Submitted]: 'Submitted',
  [SRStatus.Approved]: 'Approved',
  [SRStatus.Processing]: 'Processing',
  [SRStatus.Processed]: 'Processed',
  [SRStatus.PartialComplete]: 'Partial Complete',
  [SRStatus.Completed]: 'Completed',
  [SRStatus.Rejected]: 'Rejected',
  [SRStatus.Cancelled]: 'Cancelled'
}

/**
 * SR Workflow Types
 *
 * Determines the approval requirements and document generation behavior
 */
export enum SRWorkflowType {
  /** Between inventory locations with approval */
  TRANSFER_INTERNAL = 'transfer_internal',
  /** Central warehouse to outlets */
  MAIN_STORE = 'main_store',
  /** Store-to-store transfer, no approval required */
  STORE_TO_STORE = 'store_to_store',
  /** Stock Issue to direct/expense locations */
  DIRECT_ISSUE = 'direct_issue'
}

/**
 * SR Workflow Type Labels
 */
export const SR_WORKFLOW_TYPE_LABELS: Record<SRWorkflowType, string> = {
  [SRWorkflowType.TRANSFER_INTERNAL]: 'Internal Transfer',
  [SRWorkflowType.MAIN_STORE]: 'Main Store Transfer',
  [SRWorkflowType.STORE_TO_STORE]: 'Store to Store',
  [SRWorkflowType.DIRECT_ISSUE]: 'Direct Issue'
}

/**
 * Generated Document Types from Store Requisition
 */
export enum GeneratedDocumentType {
  /** Stock Transfer - from stock to INVENTORY location */
  STOCK_TRANSFER = 'ST',
  /** Stock Issue - from stock to DIRECT location */
  STOCK_ISSUE = 'SI',
  /** Purchase Requisition - for unfulfilled quantities */
  PURCHASE_REQUEST = 'PR'
}

/**
 * Stock Transfer Status
 */
export enum TransferStatus {
  Pending = 'pending',
  Issued = 'issued',
  InTransit = 'in_transit',
  Received = 'received',
  Cancelled = 'cancelled'
}

/**
 * Stock Transfer Status Labels
 */
export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  [TransferStatus.Pending]: 'Pending',
  [TransferStatus.Issued]: 'Issued',
  [TransferStatus.InTransit]: 'In Transit',
  [TransferStatus.Received]: 'Received',
  [TransferStatus.Cancelled]: 'Cancelled'
}

/**
 * Stock Issue Status
 */
export enum IssueStatus {
  Pending = 'pending',
  Issued = 'issued',
  Cancelled = 'cancelled'
}

/**
 * Stock Issue Status Labels
 */
export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  [IssueStatus.Pending]: 'Pending',
  [IssueStatus.Issued]: 'Issued',
  [IssueStatus.Cancelled]: 'Cancelled'
}

// ====== FULFILLMENT TYPES ======

/**
 * Line item fulfillment breakdown
 *
 * Shows how a requested quantity will be fulfilled
 * (from stock vs requiring purchase)
 */
export interface SRLineItemFulfillment {
  /** Quantity that can be fulfilled from stock */
  fromStock: number
  /** Quantity requiring purchase requisition */
  toPurchase: number
  /** Primary document type for this line */
  documentType: GeneratedDocumentType
  /** Source location for stock portion */
  sourceLocationId?: string
  sourceLocationName?: string
}

/**
 * Stock availability check result
 */
export interface StockAvailabilityResult {
  productId: string
  productCode: string
  productName: string
  requestedQty: number
  availableQty: number
  shortageQty: number
  sourceLocation: {
    id: string
    name: string
    locationType: InventoryLocationType
    availableQty: number
  } | null
  alternativeLocations: {
    id: string
    name: string
    availableQty: number
  }[]
}

// ====== STORE REQUISITION TYPES ======

/**
 * Store Requisition Line Item
 */
export interface StoreRequisitionItem {
  id: string
  /** Product reference */
  productId: string
  productCode: string
  productName: string
  categoryId?: string
  categoryName?: string
  /** Unit of measure */
  unit: string
  unitId?: string
  /** Quantities */
  requestedQty: number
  approvedQty: number
  issuedQty: number
  /** Costs */
  unitCost: number
  totalCost: number
  /** Stock availability (calculated) */
  sourceAvailableQty: number
  /** Fulfillment breakdown */
  fulfillment: SRLineItemFulfillment
  /** Business dimensions */
  jobCodeId?: string
  jobCodeName?: string
  projectId?: string
  projectName?: string
  /** Approval tracking */
  approvalStatus: ApprovalStatus
  approvalNotes?: string
  /** Item notes */
  notes?: string
}

/**
 * Store Requisition Header
 */
export interface StoreRequisition {
  id: string
  /** Document reference: SR-YYMM-NNNN */
  refNo: string
  /** Dates */
  requestDate: Date
  requiredDate: Date
  /** Status */
  status: SRStatus
  /** Workflow type */
  workflowType: SRWorkflowType
  /** Source location (From) */
  sourceLocationId: string
  sourceLocationCode: string
  sourceLocationName: string
  sourceLocationType: InventoryLocationType
  /** Destination location (To) */
  destinationLocationId: string
  destinationLocationCode: string
  destinationLocationName: string
  destinationLocationType: InventoryLocationType
  /** Requestor information */
  requestedBy: string
  requestorId: string
  departmentId: string
  departmentName: string
  /** Line items */
  items: StoreRequisitionItem[]
  /** Totals */
  totalItems: number
  totalQuantity: number
  estimatedValue: Money
  /** Generated documents */
  generatedDocuments: GeneratedDocumentReference[]
  /** Notes and description */
  description?: string
  notes?: string
  /** Approval tracking */
  approvedAt?: Date
  approvedBy?: string
  rejectedAt?: Date
  rejectedBy?: string
  rejectionReason?: string
  /** Source replenishment suggestion IDs (if SR was created from replenishment) */
  sourceReplenishmentIds?: string[]
  /** Audit fields */
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
}

/**
 * Reference to a generated document from SR
 */
export interface GeneratedDocumentReference {
  id: string
  documentType: GeneratedDocumentType
  /** Document reference: ST/SI/PR-YYMM-NNNN */
  refNo: string
  status: string
  /** SR line item IDs covered by this document */
  lineItemIds: string[]
  totalQuantity: number
  totalValue: Money
  createdAt: Date
  /** Link to the actual document */
  documentId: string
}

// ====== STOCK TRANSFER TYPES ======

/**
 * Stock Transfer Line Item
 */
export interface StockTransferItem {
  id: string
  transferId: string
  /** Product reference */
  productId: string
  productCode: string
  productName: string
  unit: string
  /** Quantities */
  requestedQty: number
  issuedQty: number
  receivedQty: number
  /** Costing */
  unitCost: Money
  totalValue: Money
  /** Lot tracking */
  batchNo?: string
  lotNo?: string
  expiryDate?: Date
  /** Notes */
  notes?: string
  /** Source SR reference */
  sourceRequisitionId?: string
  sourceRequisitionItemId?: string
}

/**
 * Stock Transfer Header
 */
export interface StockTransfer {
  id: string
  /** Document reference: ST-YYMM-NNNN */
  refNo: string
  transferDate: Date
  status: TransferStatus
  /** Source location */
  fromLocationId: string
  fromLocationCode: string
  fromLocationName: string
  fromLocationType: InventoryLocationType
  /** Destination location */
  toLocationId: string
  toLocationCode: string
  toLocationName: string
  toLocationType: InventoryLocationType
  /** Line items */
  items: StockTransferItem[]
  /** Totals */
  totalItems: number
  totalQuantity: number
  totalValue: Money
  /** Priority */
  priority: 'normal' | 'urgent' | 'emergency'
  /** Notes */
  notes?: string
  /** Source reference */
  sourceRequisitionId?: string
  sourceRequisitionRefNo?: string
  /** Issue tracking */
  issuedAt?: Date
  issuedBy?: string
  /** Receipt tracking */
  receivedAt?: Date
  receivedBy?: string
  /** Audit fields */
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
}

// ====== STOCK ISSUE TYPES ======

/**
 * Stock Issue Line Item
 */
export interface StockIssueItem {
  id: string
  issueId: string
  /** Product reference */
  productId: string
  productCode: string
  productName: string
  unit: string
  /** Quantities */
  requestedQty: number
  issuedQty: number
  /** Costing */
  unitCost: Money
  totalValue: Money
  /** Lot tracking */
  batchNo?: string
  lotNo?: string
  expiryDate?: Date
  /** Notes */
  notes?: string
  /** Source SR reference */
  sourceRequisitionId?: string
  sourceRequisitionItemId?: string
}

/**
 * Stock Issue Header
 */
export interface StockIssue {
  id: string
  /** Document reference: SI-YYMM-NNNN */
  refNo: string
  issueDate: Date
  status: IssueStatus
  /** Source location (inventory) */
  fromLocationId: string
  fromLocationCode: string
  fromLocationName: string
  /** Destination (direct/expense) */
  toLocationId: string
  toLocationCode: string
  toLocationName: string
  /** Line items */
  items: StockIssueItem[]
  /** Totals */
  totalItems: number
  totalQuantity: number
  totalValue: Money
  /** Expense allocation */
  expenseAccountId?: string
  expenseAccountName?: string
  departmentId: string
  departmentName: string
  /** Notes */
  notes?: string
  /** Source reference */
  sourceRequisitionId?: string
  sourceRequisitionRefNo?: string
  /** Issue tracking */
  issuedAt?: Date
  issuedBy?: string
  /** Audit fields */
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
}

// ====== REPLENISHMENT TYPES ======

/**
 * Replenishment urgency levels
 */
export type ReplenishmentUrgency = 'critical' | 'warning' | 'low'

/**
 * Replenishment suggestion for a product at a location
 */
export interface ReplenishmentSuggestion {
  id: string
  /** Product reference */
  productId: string
  productCode: string
  productName: string
  categoryName: string
  unit: string
  /** Location requiring replenishment */
  locationId: string
  locationName: string
  locationType: InventoryLocationType
  /** Stock levels */
  currentStock: number
  parLevel: number
  reorderPoint: number
  minOrderQty: number
  maxOrderQty: number
  /** Calculated suggestion */
  suggestedQty: number
  urgency: ReplenishmentUrgency
  /** Source availability */
  sourceAvailability: {
    locationId: string
    locationName: string
    availableQty: number
    canFulfill: boolean
  }[]
  /** Estimated cost */
  estimatedUnitCost: number
  estimatedTotalCost: number
  /** Selection state (for UI) */
  isSelected?: boolean
  /** Generated requisition tracking (when suggestion is converted to SR) */
  generatedRequisitionId?: string
  generatedRequisitionRefNo?: string
}

/**
 * Replenishment mode configuration
 */
export enum ReplenishmentMode {
  /** Creates draft SR for review */
  SUGGEST = 'suggest',
  /** Creates submitted SR requiring approval */
  AUTO_DRAFT = 'auto_draft',
  /** Creates approved SR, generates documents directly */
  AUTO_APPROVE = 'auto_approve'
}

// ====== FORM TYPES ======

/**
 * Store Requisition form data
 */
export interface StoreRequisitionFormData {
  sourceLocationId: string
  destinationLocationId: string
  requiredDate: Date
  departmentId: string
  description?: string
  notes?: string
  items: StoreRequisitionItemFormData[]
}

/**
 * Store Requisition item form data
 */
export interface StoreRequisitionItemFormData {
  productId: string
  requestedQty: number
  unit: string
  jobCodeId?: string
  projectId?: string
  notes?: string
}

// ====== FILTER TYPES ======

/**
 * Store Requisition list filters
 */
export interface StoreRequisitionFilters {
  search: string
  status: SRStatus | 'all'
  workflowType: SRWorkflowType | 'all'
  sourceLocationId: string | 'all'
  destinationLocationId: string | 'all'
  departmentId: string | 'all'
  dateFrom?: Date
  dateTo?: Date
  hasGeneratedDocuments: boolean | 'all'
}

/**
 * Stock Transfer list filters
 */
export interface StockTransferFilters {
  search: string
  status: TransferStatus | 'all'
  fromLocationId: string | 'all'
  toLocationId: string | 'all'
  priority: 'normal' | 'urgent' | 'emergency' | 'all'
  dateFrom?: Date
  dateTo?: Date
}

/**
 * Stock Issue list filters
 */
export interface StockIssueFilters {
  search: string
  status: IssueStatus | 'all'
  fromLocationId: string | 'all'
  toLocationId: string | 'all'
  departmentId: string | 'all'
  dateFrom?: Date
  dateTo?: Date
}

// ====== CONFIGURATION TYPES ======

/**
 * SR System Configuration
 */
export interface SRSystemConfig {
  /** Where PR delivers: source location, destination, or user selects */
  prDeliveryDestination: 'from_location' | 'to_location' | 'user_select'
  /** Allow partial fulfillment and line splitting */
  allowPartialFulfillment: boolean
  /** Auto-select source location based on stock */
  autoSelectSource: boolean
  /** Allow user to override auto-selected source */
  allowSourceOverride: boolean
  /** Reserve stock when SR is approved */
  reserveStockOnApproval: boolean
  /** Replenishment mode */
  replenishmentMode: ReplenishmentMode
  /** Replenishment schedule (cron expression) */
  replenishmentSchedule?: string
}

/**
 * Location SR Configuration
 */
export interface LocationSRConfig {
  /** Can be used as source (From) location */
  isSourceLocation: boolean
  /** Can be used as destination (To) location */
  isRequestableLocation: boolean
  /** Default cost center for direct locations */
  defaultCostCenterId?: string
  /** Priority for source selection (lower = higher priority) */
  sourcePriority: number
  /** Main store flag */
  isMainStore: boolean
}

// ====== DOCUMENT GENERATION TYPES ======

/**
 * Document generation plan
 */
export interface DocumentGenerationPlan {
  requisitionId: string
  stockTransfers: PendingStockTransfer[]
  stockIssues: PendingStockIssue[]
  purchaseRequests: PendingPurchaseRequest[]
}

/**
 * Pending Stock Transfer to be generated
 */
export interface PendingStockTransfer {
  fromLocationId: string
  fromLocationName: string
  toLocationId: string
  toLocationName: string
  items: {
    productId: string
    productName: string
    quantity: number
    unitCost: number
    sourceItemId: string
  }[]
  totalQuantity: number
  totalValue: number
}

/**
 * Pending Stock Issue to be generated
 */
export interface PendingStockIssue {
  fromLocationId: string
  fromLocationName: string
  toLocationId: string
  toLocationName: string
  departmentId: string
  items: {
    productId: string
    productName: string
    quantity: number
    unitCost: number
    sourceItemId: string
  }[]
  totalQuantity: number
  totalValue: number
}

/**
 * Pending Purchase Request to be generated
 */
export interface PendingPurchaseRequest {
  deliverToLocationId: string
  deliverToLocationName: string
  departmentId: string
  items: {
    productId: string
    productName: string
    quantity: number
    estimatedUnitCost: number
    sourceItemId: string
  }[]
  totalQuantity: number
  estimatedTotalValue: number
}
