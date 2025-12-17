/**
 * POS Integration Types
 *
 * Types and interfaces for POS system integration including transactions,
 * mappings, approvals, and error handling for stock-out synchronization.
 */

import { AuditTimestamp, Money, ApprovalRecord } from './common'

// ====== TRANSACTION STATUS AND TYPES ======

/**
 * POS transaction status types
 */
export type TransactionStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'success'
  | 'failed'
  | 'manually_resolved'

/**
 * Transaction processing mode
 */
export type TransactionProcessingMode =
  | 'automatic'    // Auto-approve and process
  | 'approval'     // Require approval before processing
  | 'manual'       // Manual processing only

// ====== ERROR CATEGORIZATION ======

/**
 * Error category types for failed transactions
 */
export enum ErrorCategory {
  MAPPING_ERROR = 'mapping_error',
  STOCK_INSUFFICIENT = 'stock_insufficient',
  VALIDATION_ERROR = 'validation_error',
  SYSTEM_ERROR = 'system_error',
  CONNECTION_ERROR = 'connection_error'
}

/**
 * Error severity levels
 */
export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low'

/**
 * Inventory impact assessment levels
 */
export type InventoryImpact = 'low' | 'medium' | 'high'

/**
 * Stock status indicators
 */
export type StockStatus = 'sufficient' | 'low' | 'critical'

// ====== POS TRANSACTION ======

/**
 * POS transaction header
 */
export interface POSTransaction extends AuditTimestamp {
  id: string
  transactionId: string
  externalId: string // POS system transaction ID
  date: string // ISO date string
  status: TransactionStatus
  locationId: string
  location: {
    id: string
    name: string
  }
  posSystem: {
    name: string
    version?: string
  }
  totalAmount: Money
  itemCount: number
  processedAt?: string // ISO date string
  processedBy?: {
    id: string
    name: string
  }
  notes?: string
  attachments?: FileAttachment[]
}

/**
 * POS transaction line item
 */
export interface POSTransactionLineItem {
  id: string
  transactionId: string
  posItemId: string
  posItemName: string
  category: string
  quantity: number
  unitPrice: Money
  totalPrice: Money
  mappedRecipe?: {
    id: string
    name: string
    category: string
  }
  inventoryDeduction?: InventoryDeduction
}

/**
 * Inventory deduction details for a line item
 */
export interface InventoryDeduction {
  ingredients: {
    id: string
    name: string
    quantity: number
    unit: string
    location: string
    cost: Money
  }[]
}

// ====== PENDING APPROVAL ======

/**
 * Transaction pending approval
 */
export interface PendingTransaction extends POSTransaction {
  status: 'pending_approval'
  requester: {
    id: string
    name: string
    email: string
  }
  inventoryImpact: InventoryImpact
  lineItems: POSTransactionLineItem[]
  approvalNotes?: ApprovalNote[]
}

/**
 * Approval note record
 */
export interface ApprovalNote {
  id: string
  user: string
  timestamp: string // ISO date string
  action: 'requested_info' | 'approved' | 'rejected'
  comment: string
}

// ====== TRANSACTION ERROR ======

/**
 * Transaction error details
 */
export interface TransactionError {
  category: ErrorCategory
  code: string
  message: string
  severity: ErrorSeverity
  occurredAt: string // ISO date string
  technicalDetails?: {
    stackTrace?: string
    requestId: string
    endpoint: string
    raw?: any
  }
}

/**
 * Affected item in failed transaction
 */
export interface AffectedItem {
  posItemId: string
  posItemName: string
  quantity: number
  errorReason: string
  suggestedFix: string
}

/**
 * Troubleshooting step
 */
export interface TroubleshootingStep {
  step: number
  action: string
  link?: string
  details?: string
}

/**
 * Retry attempt record
 */
export interface RetryAttempt {
  attemptNumber: number
  attemptedAt: string // ISO date string
  attemptedBy: {
    id: string
    name: string
  }
  result: 'success' | 'failed'
  notes?: string
}

/**
 * Suggested action for error resolution
 */
export interface SuggestedAction {
  action: string
  description: string
  link?: string
  requiresUserAction: boolean
}

// ====== INVENTORY IMPACT ======

/**
 * Inventory impact preview
 */
export interface InventoryImpactPreview {
  affectedItems: InventoryImpactItem[]
  warnings: InventoryWarning[]
  summary: {
    totalIngredients: number
    totalDeductedValue: Money
    affectedLocations: string[]
  }
}

/**
 * Individual ingredient impact
 */
export interface InventoryImpactItem {
  ingredient: string
  ingredientId: string
  currentStock: number
  deductionAmount: number
  resultingStock: number
  unit: string
  stockStatus: StockStatus
  reorderPoint: number
  location: string
}

/**
 * Inventory warning
 */
export interface InventoryWarning {
  type: 'low_stock' | 'critical_stock' | 'negative_stock'
  severity: 'info' | 'warning' | 'critical'
  message: string
  affectedIngredients: string[]
}

// ====== AUDIT LOG ======

/**
 * Transaction audit log entry
 */
export interface TransactionAuditLog {
  id: string
  transactionId: string
  timestamp: string // ISO date string
  user?: {
    id: string
    name: string
  }
  action: 'created' | 'processed' | 'approved' | 'rejected' | 'retried' | 'failed' | 'manually_resolved'
  details: string
  metadata?: Record<string, any>
}

// ====== POS MAPPING ======

/**
 * POS item to recipe mapping
 *
 * Composite key: posItemId + posOutletId
 * This allows the same POS item to be mapped differently per outlet
 * (e.g., "Coke" at $3.00 in Italian Restaurant, $2.50 in Cafe)
 */
export interface POSMapping extends AuditTimestamp {
  id: string

  // POS Item identification
  posItemId: string
  posItemName: string
  posItemCategory: string

  // POS Outlet (part of composite key)
  posOutletId: string        // Links to POS outlet
  posOutletName: string      // e.g., "Italian Restaurant POS"

  // Carmen Location (resolved from outlet mapping)
  locationId: string         // Carmen location ID
  locationName: string       // e.g., "Italian Restaurant"

  // Recipe mapping
  recipeId: string
  recipeName: string
  recipeCategory: string
  portionSize: number
  unit: string

  // Pricing (outlet-specific)
  unitPrice: Money           // Price at this outlet (e.g., $3.00)

  costOverride?: number
  notes?: string
  isActive: boolean
  mappedBy: {
    id: string
    name: string
  }
  mappedAt: string // ISO date string
  lastVerifiedAt?: string // ISO date string
}

/**
 * Mapping preview data
 */
export interface MappingPreview {
  recipe: {
    id: string
    name: string
    category: string
  }
  portionSize: number
  unit: string
  ingredients: {
    name: string
    quantityPerPortion: number
    unit: string
    estimatedCost: Money
  }[]
  totalEstimatedCost: Money
  costComparison?: {
    posPrice: Money
    estimatedCost: Money
    margin: number // percentage
    marginStatus: 'good' | 'low' | 'negative'
  }
}

/**
 * Recipe search result
 */
export interface RecipeSearchResult {
  id: string
  name: string
  category: string
  baseUnit: string
  compatibleUnits: {
    id: string
    name: string
    abbreviation: string
    conversionFactor: number
  }[]
  averageCost: Money
  ingredients: {
    id: string
    name: string
    quantity: number
    unit: string
  }[]
}

// ====== POS ITEM ======

/**
 * POS item definition
 */
export interface POSItem {
  id: string
  posItemId: string // ID from POS system
  name: string
  category: string
  price: Money
  isActive: boolean
  mappingStatus: 'mapped' | 'unmapped' | 'partial'
  mappedRecipe?: {
    id: string
    name: string
  }
  lastSyncedAt?: string // ISO date string
}

// ====== APPROVAL WORKFLOW ======

/**
 * Approval queue filter configuration
 */
export interface ApprovalQueueFilters {
  dateRange?: {
    from: string // ISO date string
    to: string // ISO date string
  }
  location?: string
  requester?: string
  searchQuery?: string
  inventoryImpact?: InventoryImpact
}

/**
 * Bulk approval request
 */
export interface BulkApprovalRequest {
  transactionIds: string[]
  notes?: string
  applyInventoryDeduction: boolean
}

/**
 * Bulk approval result
 */
export interface BulkApprovalResult {
  successful: {
    transactionId: string
    status: 'approved'
    approvedAt: string
  }[]
  failed: {
    transactionId: string
    reason: string
  }[]
  summary: {
    totalRequested: number
    successful: number
    failed: number
  }
}

/**
 * Single approval request
 */
export interface ApprovalRequest {
  transactionId: string
  notes?: string
  applyInventoryDeduction?: boolean
}

/**
 * Rejection request
 */
export interface RejectionRequest {
  transactionId: string
  reason: string
  notes?: string
}

// ====== SYSTEM CONFIGURATION ======

/**
 * POS integration system configuration
 */
export interface POSIntegrationConfig extends AuditTimestamp {
  id: string
  posSystem: 'comanche' | 'custom'
  apiEndpoint: string
  apiKey?: string // Encrypted
  syncEnabled: boolean
  syncFrequency: number // minutes
  processingMode: TransactionProcessingMode
  autoApproveThreshold?: number // in currency amount
  requireApproval: boolean
  emailNotifications: boolean
  notificationRecipients: string[]
  dataRetentionDays: number
  connectionStatus: 'connected' | 'disconnected' | 'error'
  lastSyncAt?: string // ISO date string
  lastConnectionTest?: string // ISO date string
}

/**
 * Notification settings for POS integration
 */
export interface POSNotificationSettings {
  emailEnabled: boolean
  recipients: string[]
  notificationTypes: {
    unmappedItems: boolean
    failedTransactions: boolean
    pendingApprovals: boolean
    lowStock: boolean
    systemErrors: boolean
  }
  alertThresholds: {
    unmappedItemsCount: number
    failedTransactionsCount: number
    lowStockPercentage: number
  }
}

// ====== DASHBOARD AND METRICS ======

/**
 * POS integration dashboard metrics
 */
export interface POSDashboardMetrics {
  systemStatus: 'connected' | 'disconnected' | 'error'
  alerts: {
    unmappedItems: number
    failedTransactions: number
    pendingApprovals: number
    fractionalVariants: number
  }
  recentActivity: POSTransaction[]
  syncStatus: {
    lastSyncAt: string // ISO date string
    nextSyncAt: string // ISO date string
    syncFrequency: string // e.g., "15 minutes"
  }
}

/**
 * Transaction statistics
 */
export interface TransactionStatistics {
  period: {
    startDate: string // ISO date string
    endDate: string // ISO date string
  }
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  pendingApprovals: number
  totalValue: Money
  averageTransactionValue: Money
  processingAccuracy: number // percentage
  averageProcessingTime: number // minutes
}

// ====== FILE ATTACHMENT ======

/**
 * File attachment for transactions
 */
export interface FileAttachment {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  uploadedBy: string
  uploadedAt: string // ISO date string
}

// ====== RESOLUTION ======

/**
 * Manual resolution request
 */
export interface ManualResolutionRequest {
  transactionId: string
  resolution: 'manually_processed' | 'not_required' | 'duplicate' | 'other'
  notes: string
}

/**
 * Retry transaction request
 */
export interface RetryTransactionRequest {
  transactionId: string
  notes?: string
  resolvedMappings?: {
    posItemId: string
    recipeId: string
  }[]
}

// ====== FRACTIONAL VARIANTS ======

/**
 * Fractional recipe variant for POS integration
 */
export interface FractionalVariant extends AuditTimestamp {
  id: string
  baseRecipeId: string
  baseRecipeName: string
  totalYield: number
  yieldUnit: string
  variants: {
    posItemId: string
    posItemName: string
    fractionalUnit: string // e.g., "1/8", "1/12"
    deductionAmount: number
    price: Money
  }[]
  roundingRule: 'up' | 'down' | 'nearest'
  isActive: boolean
}

// ====== API RESPONSES ======

/**
 * Standard POS API response
 */
export interface POSApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}

/**
 * Paginated transaction response
 */
export interface PaginatedTransactionResponse {
  success: boolean
  data: {
    transactions: POSTransaction[]
    pagination: {
      totalCount: number
      page: number
      pageSize: number
      totalPages: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
}

// ====== WEBSOCKET EVENTS ======

/**
 * WebSocket event for real-time updates
 */
export interface POSWebSocketEvent {
  event: 'pending_approval_created' | 'approval_status_changed' | 'transaction_processed' | 'sync_completed'
  data: any
  timestamp: string // ISO date string
}

/**
 * Pending approval created event
 */
export interface PendingApprovalCreatedEvent extends POSWebSocketEvent {
  event: 'pending_approval_created'
  data: {
    transactionId: string
    location: string
    totalValue: Money
    createdAt: string
  }
}

/**
 * Approval status changed event
 */
export interface ApprovalStatusChangedEvent extends POSWebSocketEvent {
  event: 'approval_status_changed'
  data: {
    transactionId: string
    oldStatus: TransactionStatus
    newStatus: TransactionStatus
    changedBy: string
    changedAt: string
  }
}
