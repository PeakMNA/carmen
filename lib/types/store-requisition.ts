/**
 * Store Requisition Types
 *
 * Types and interfaces for Store Requisition (SR) operations.
 * Stock Transfers (ST) and Stock Issues (SI) are filtered views of SRs at the Issue stage.
 *
 * @see docs/app/store-operations/sr-business-rules.md
 */

import { Money, ApprovalStatus, AuditTimestamp } from './common'
import { InventoryLocationType } from './location-management'

// ====== ENUMS ======

/**
 * Store Requisition Status
 *
 * Simplified status values for SR lifecycle
 */
export enum SRStatus {
  Draft = 'draft',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Voided = 'voided'
}

/**
 * SR Status Labels for UI display
 */
export const SR_STATUS_LABELS: Record<SRStatus, string> = {
  [SRStatus.Draft]: 'Draft',
  [SRStatus.InProgress]: 'In Progress',
  [SRStatus.Completed]: 'Completed',
  [SRStatus.Cancelled]: 'Cancelled',
  [SRStatus.Voided]: 'Voided'
}

/**
 * Store Requisition Stage
 *
 * Workflow stages that an SR progresses through.
 * Multiple stages can map to the same status (e.g., Submit, Approve, Issue all map to InProgress)
 */
export enum SRStage {
  Draft = 'draft',
  Submit = 'submit',
  Approve = 'approve',
  Issue = 'issue',
  Complete = 'complete'
}

/**
 * SR Stage Labels for UI display
 */
export const SR_STAGE_LABELS: Record<SRStage, string> = {
  [SRStage.Draft]: 'Draft',
  [SRStage.Submit]: 'Submitted',
  [SRStage.Approve]: 'Approved',
  [SRStage.Issue]: 'Issue',
  [SRStage.Complete]: 'Complete'
}

/**
 * Maps SRStage to SRStatus
 */
export const STAGE_TO_STATUS: Record<SRStage, SRStatus> = {
  [SRStage.Draft]: SRStatus.Draft,
  [SRStage.Submit]: SRStatus.InProgress,
  [SRStage.Approve]: SRStatus.InProgress,
  [SRStage.Issue]: SRStatus.InProgress,
  [SRStage.Complete]: SRStatus.Completed
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

// Note: TransferStatus and IssueStatus enums have been removed.
// Stock Transfers and Stock Issues are now filtered views of Store Requisitions at the Issue stage.
// Use SRStatus and SRStage for status tracking.

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
  /** Status and Stage */
  status: SRStatus
  /** Current workflow stage */
  stage: SRStage
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
  /** Issue tracking (when stage moves to Issue) */
  issuedAt?: Date
  issuedBy?: string
  /** Completion tracking */
  completedAt?: Date
  completedBy?: string
  /** Source replenishment suggestion IDs (if SR was created from replenishment) */
  sourceReplenishmentIds?: string[]
  /** Expense allocation (for Direct Issue workflow) */
  expenseAccountId?: string
  expenseAccountName?: string
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

// Note: StockTransfer and StockTransferItem interfaces have been removed.
// Stock Transfers are now filtered views of Store Requisitions where:
// - stage === SRStage.Issue
// - destinationLocationType === InventoryLocationType.INVENTORY
// Use the StoreRequisition interface for all data access.

// Note: StockIssue and StockIssueItem interfaces have been removed.
// Stock Issues are now filtered views of Store Requisitions where:
// - stage === SRStage.Issue
// - destinationLocationType === InventoryLocationType.DIRECT
// Use the StoreRequisition interface for all data access.

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
  /** Filter by workflow stage */
  stage: SRStage | 'all'
  workflowType: SRWorkflowType | 'all'
  sourceLocationId: string | 'all'
  destinationLocationId: string | 'all'
  /** Filter by destination location type (for ST/SI views) */
  destinationLocationType?: InventoryLocationType | 'all'
  departmentId: string | 'all'
  dateFrom?: Date
  dateTo?: Date
  hasGeneratedDocuments: boolean | 'all'
}

// Note: StockTransferFilters and StockIssueFilters interfaces have been removed.
// Stock Transfers and Stock Issues use StoreRequisitionFilters with additional stage filtering.

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
