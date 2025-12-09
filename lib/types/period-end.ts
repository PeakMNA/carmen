/**
 * ============================================================================
 * PERIOD END TYPES
 * ============================================================================
 *
 * Type definitions for the Period End Process module.
 * This module handles inventory period closings with comprehensive validation
 * including physical count finalization, spot check completion, and
 * transaction commitment verification.
 *
 * BUSINESS CONTEXT:
 * Period End is a critical process in inventory management that locks a
 * specific time period (typically monthly) to prevent further transactions.
 * Before closing, the system validates that:
 * 1. All transactions (GRN, Adjustments, Transfers) are posted/approved
 * 2. All spot checks for the period are completed
 * 3. All physical counts are finalized with adjustments posted to GL
 *
 * VALIDATION SEQUENCE: Transactions → Spot Checks → Physical Counts
 * This sequence ensures that:
 * - First, all source documents are committed (no pending transactions)
 * - Second, routine inventory verification is complete (spot checks)
 * - Third, full inventory reconciliation is done (physical counts with GL posting)
 *
 * HARD LOCK BEHAVIOR:
 * Once a period is closed, it cannot accept new transactions. This ensures
 * data integrity and accurate financial reporting. Any new transactions
 * must be posted to the next open period.
 *
 * ============================================================================
 */

// ============================================================================
// PERIOD STATUS & CORE TYPES
// ============================================================================

/**
 * Status of a period in the period end workflow.
 *
 * Status Progression:
 * - open → in_progress → closing → closed
 *
 * Allowed Transitions:
 * - open → in_progress: When user initiates period close process
 * - in_progress → closing: When all validations pass and user confirms close
 * - closing → closed: When close process completes successfully
 * - in_progress → open: When user cancels the close process (rollback)
 *
 * @example
 * // Check if period accepts new transactions
 * const canPost = period.status === 'open'
 */
export type PeriodStatus = 'open' | 'in_progress' | 'closing' | 'closed'

/**
 * Represents an inventory period for period end processing.
 *
 * A period typically represents a calendar month but can be configured
 * for different frequencies (weekly, quarterly) based on business needs.
 *
 * KEY BUSINESS RULES:
 * 1. Only one period can be 'open' at any time
 * 2. Periods must be closed in chronological order (no skipping)
 * 3. Closed periods cannot be reopened without special permissions
 * 4. All transactions must reference the current open period
 *
 * @example
 * const period: Period = {
 *   id: 'PE-2024-03',
 *   name: 'March 2024',
 *   startDate: new Date(2024, 2, 1),
 *   endDate: new Date(2024, 2, 31),
 *   status: 'open',
 *   notes: 'Current active period'
 * }
 */
export interface Period {
  /**
   * Unique identifier in PE-YYYY-MM format.
   * The format ensures chronological sorting and easy identification.
   * @example 'PE-2024-03' for March 2024
   */
  id: string

  /**
   * Human-readable display name for the period.
   * Typically formatted as "Month Year" for monthly periods.
   * @example 'March 2024'
   */
  name: string

  /**
   * First day of the period (inclusive).
   * Transactions dated on or after this date belong to this period.
   */
  startDate: Date

  /**
   * Last day of the period (inclusive).
   * Transactions dated on or before this date belong to this period.
   */
  endDate: Date

  /**
   * Current status of the period in the close workflow.
   * Determines what operations are allowed on the period.
   */
  status: PeriodStatus

  /**
   * Username or ID of the person who closed the period.
   * Only populated when status is 'closed'.
   * Used for audit trail and accountability.
   */
  closedBy?: string

  /**
   * Timestamp when the period was closed.
   * Only populated when status is 'closed'.
   * Used for audit trail and reporting.
   */
  closedAt?: Date

  /**
   * Optional notes about the period.
   * Can include special circumstances, instructions, or observations.
   * @example 'Year-end close - extra validation required'
   */
  notes?: string
}

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

/**
 * Result of validating a single physical count during period close.
 *
 * Physical counts must be in 'finalized' status, which means:
 * - All items have been counted
 * - Variances have been reviewed and approved
 * - Inventory adjustments have been posted to the General Ledger
 *
 * A count that is only 'completed' (counted but not reconciled) will
 * fail validation because GL postings are not yet done.
 *
 * @example
 * const countResult: PhysicalCountCheckResult = {
 *   countId: 'PC-2024-015',
 *   countNumber: 'PC-2024-015',
 *   location: 'Main Warehouse',
 *   status: 'finalized',
 *   isValid: true,
 *   message: 'Count finalized and adjustments posted'
 * }
 */
export interface PhysicalCountCheckResult {
  /** Physical count unique identifier */
  countId: string

  /** Physical count number for display in UI */
  countNumber: string

  /** Location/warehouse name where count was performed */
  location: string

  /**
   * Current status of the physical count.
   * Must be 'finalized' to pass validation.
   * Other statuses (draft, planning, pending, in-progress, completed) fail.
   */
  status: string

  /**
   * Whether this count passes period close validation.
   * True only if status === 'finalized'.
   */
  isValid: boolean

  /**
   * Human-readable validation message for display in UI.
   * Explains the validation result and any required actions.
   * @example 'Count is in-progress - must be finalized before period close'
   */
  message: string
}

/**
 * Result of validating a single spot check during period close.
 *
 * Spot checks are random verification counts performed throughout
 * the period to catch inventory discrepancies early.
 *
 * All spot checks scheduled within the period must be 'completed'
 * before the period can be closed.
 *
 * @example
 * const spotCheckResult: SpotCheckCheckResult = {
 *   checkId: 'SC-2024-042',
 *   checkNumber: 'SC-2024-042',
 *   location: 'Kitchen Storage',
 *   status: 'completed',
 *   isValid: true,
 *   message: 'Spot check completed'
 * }
 */
export interface SpotCheckCheckResult {
  /** Spot check unique identifier */
  checkId: string

  /** Spot check number for display in UI */
  checkNumber: string

  /** Location name where spot check was performed */
  location: string

  /**
   * Current status of the spot check.
   * Must be 'completed' to pass validation.
   * Other statuses (draft, pending, in-progress, cancelled, on-hold) fail.
   */
  status: string

  /**
   * Whether this spot check passes period close validation.
   * True only if status === 'completed'.
   */
  isValid: boolean

  /**
   * Human-readable validation message for display in UI.
   * @example 'Spot check is in-progress - must be completed before period close'
   */
  message: string
}

/**
 * Result of validating transactions for a specific document type.
 *
 * This validates that all source documents (GRN, Adjustments, Transfers, etc.)
 * have been posted or approved. Documents in Draft or Pending status
 * indicate incomplete transactions that must be resolved.
 *
 * DOCUMENT TYPES VALIDATED:
 * - GRN: Goods Received Notes (must be Posted or Approved)
 * - ADJ: Inventory Adjustments (must be Posted)
 * - TRF: Stock Transfers (must be Posted or Completed)
 * - SR: Store Requisitions (must be Fulfilled or Completed)
 * - WR: Wastage Reports (must be Posted or Approved)
 *
 * @example
 * const transactionResult: TransactionCheckResult = {
 *   documentType: 'GRN',
 *   documentTypeName: 'Goods Received Note',
 *   totalCount: 45,
 *   pendingCount: 0,
 *   isValid: true,
 *   message: '45 GRN documents - All posted'
 * }
 */
export interface TransactionCheckResult {
  /**
   * Document type code.
   * Used for categorization and linking to document management.
   * @example 'GRN', 'ADJ', 'TRF', 'SR', 'WR'
   */
  documentType: string

  /**
   * Full document type name for display in UI.
   * @example 'Goods Received Note', 'Inventory Adjustment'
   */
  documentTypeName: string

  /**
   * Total count of documents of this type in the period.
   * Includes both posted and pending documents.
   */
  totalCount: number

  /**
   * Count of documents not yet committed (Draft or Pending status).
   * Must be 0 for validation to pass.
   */
  pendingCount: number

  /**
   * Sample document ID if there are pending items.
   * Helps users quickly navigate to resolve the issue.
   * Only populated when pendingCount > 0.
   */
  sampleDocumentId?: string

  /**
   * Whether all documents of this type are committed.
   * True only if pendingCount === 0.
   */
  isValid: boolean

  /**
   * Human-readable validation message for display in UI.
   * @example '45 GRN documents - All posted' or '3 GRN documents not posted'
   */
  message: string
}

// ============================================================================
// PERIOD CLOSE CHECKLIST
// ============================================================================

/**
 * Complete checklist for period close validation.
 *
 * This is the main data structure used by the period close workflow.
 * It aggregates results from all three validation stages:
 * 1. Transactions (first) - Check source document statuses
 * 2. Spot Checks (second) - All must be completed
 * 3. Physical Counts (third/last) - All must be finalized
 *
 * The checklist provides both detailed results for each item and
 * summary information for quick status assessment.
 *
 * USAGE PATTERN:
 * 1. User initiates period close
 * 2. System generates checklist by running all validations
 * 3. UI displays checklist with expandable sections
 * 4. User resolves any failed validations
 * 5. User clicks "Validate All" to refresh checklist
 * 6. When allChecksPassed is true, "Close Period" button enables
 *
 * @example
 * // Check if period can be closed
 * if (checklist.allChecksPassed) {
 *   await closePeriod(periodId)
 * } else {
 *   showValidationErrors(checklist.summaryMessages)
 * }
 */
export interface PeriodCloseChecklist {
  /**
   * ID of the period being validated.
   * Links this checklist to a specific period.
   */
  periodId: string

  /**
   * Timestamp when validations were last run.
   * Displayed to user so they know data freshness.
   * User should re-validate after making changes.
   */
  validatedAt: Date

  // ========================================================================
  // Stage 1: Transaction Validation (First)
  // ========================================================================

  /**
   * Whether all transactions are committed (no pending documents).
   * This is the first validation stage.
   */
  transactionsCommitted: boolean

  /**
   * Detailed results for each document type.
   * Shows per-type breakdown of total vs pending documents.
   */
  transactionDetails: TransactionCheckResult[]

  /**
   * Total count of pending/uncommitted transactions across all types.
   * Sum of pendingCount from all transactionDetails.
   */
  pendingTransactionCount: number

  // ========================================================================
  // Stage 2: Spot Check Validation (Second)
  // ========================================================================

  /**
   * Whether all spot checks are completed.
   * This is the second validation stage.
   */
  spotChecksComplete: boolean

  /**
   * Detailed results for each spot check in the period.
   * Lists all scheduled spot checks with their completion status.
   */
  spotCheckDetails: SpotCheckCheckResult[]

  /**
   * Count of incomplete spot checks.
   * Number of items in spotCheckDetails where isValid is false.
   */
  incompleteSpotCheckCount: number

  // ========================================================================
  // Stage 3: Physical Count Validation (Third/Last)
  // ========================================================================

  /**
   * Whether all physical counts are finalized.
   * This is the third and final validation stage.
   */
  physicalCountsFinalized: boolean

  /**
   * Detailed results for each physical count in the period.
   * Lists all counts with their finalization status.
   */
  physicalCountDetails: PhysicalCountCheckResult[]

  /**
   * Count of non-finalized physical counts.
   * Number of items in physicalCountDetails where isValid is false.
   */
  pendingPhysicalCountCount: number

  // ========================================================================
  // Summary
  // ========================================================================

  /**
   * Master flag indicating if all validations pass.
   * True only if: transactionsCommitted && spotChecksComplete && physicalCountsFinalized
   * When true, the "Close Period" button should be enabled.
   */
  allChecksPassed: boolean

  /**
   * Total number of issues found across all validation stages.
   * Sum of: pendingTransactionCount + incompleteSpotCheckCount + pendingPhysicalCountCount
   */
  totalIssueCount: number

  /**
   * Human-readable summary messages for display in validation summary card.
   * Lists the key issues or confirmations for each stage.
   * @example ['3 transaction(s) not committed', '1 spot check(s) not completed']
   */
  summaryMessages: string[]
}

// ============================================================================
// VALIDATION SECTION TYPES (for UI)
// ============================================================================

/**
 * Represents a validation section in the UI.
 *
 * Used by the ValidationChecklist component to render each
 * expandable section (Transactions, Spot Checks, Physical Counts).
 *
 * Provides state information for rendering loading states,
 * expand/collapse behavior, and status indicators.
 */
export interface ValidationSection {
  /**
   * Section identifier for React keys and state management.
   * Matches the three validation stages.
   */
  id: 'transactions' | 'spot-checks' | 'physical-counts'

  /**
   * Display title shown in section header.
   * @example 'Transactions', 'Spot Checks', 'Physical Counts'
   */
  title: string

  /**
   * Order number for display (1, 2, or 3).
   * Shown in the section header to indicate sequence.
   */
  order: number

  /** Whether all items in this section pass validation */
  isValid: boolean

  /** Whether validation has been run for this section */
  isValidated: boolean

  /** Whether validation is currently running for this section */
  isValidating: boolean

  /** Count of failed items in this section */
  issueCount: number

  /**
   * Summary message for the section.
   * @example 'All documents posted' or '3 documents pending'
   */
  summary: string
}

// ============================================================================
// DOCUMENT TYPE MAPPING
// ============================================================================

/**
 * Document types checked during transaction validation.
 *
 * Each document type has:
 * - code: Short code used in document IDs and APIs
 * - name: Human-readable name for UI display
 * - validStatuses: Array of statuses that pass validation
 *
 * Documents with status not in validStatuses are considered pending
 * and will block period close.
 */
export const TRANSACTION_DOCUMENT_TYPES = {
  GRN: {
    code: 'GRN',
    name: 'Goods Received Note',
    validStatuses: ['Posted', 'Approved']
  },
  ADJ: {
    code: 'ADJ',
    name: 'Inventory Adjustment',
    validStatuses: ['Posted']
  },
  TRF: {
    code: 'TRF',
    name: 'Stock Transfer',
    validStatuses: ['Posted', 'Completed']
  },
  SR: {
    code: 'SR',
    name: 'Store Requisition',
    validStatuses: ['Fulfilled', 'Completed']
  },
  WR: {
    code: 'WR',
    name: 'Wastage Report',
    validStatuses: ['Posted', 'Approved']
  },
} as const

/**
 * Valid status for physical counts during period close.
 * Physical counts must be 'finalized' to pass validation.
 * 'finalized' means count is complete AND adjustments are posted to GL.
 */
export const VALID_PHYSICAL_COUNT_STATUS = 'finalized' as const

/**
 * Valid status for spot checks during period close.
 * Spot checks must be 'completed' to pass validation.
 */
export const VALID_SPOT_CHECK_STATUS = 'completed' as const

// ============================================================================
// PERIOD CLOSE ACTION TYPES
// ============================================================================

/**
 * Request payload for closing a period.
 *
 * Sent to the API when user confirms period close.
 * The API will re-run all validations before actually closing
 * to ensure no changes were made between last validation and close request.
 */
export interface ClosePeriodRequest {
  /** ID of the period to close */
  periodId: string

  /** Username or ID of the person closing the period */
  closedBy: string

  /** Optional notes to record with the close action */
  notes?: string

  /**
   * Force close even with warnings (not errors).
   * Some validations may produce warnings that can be overridden.
   * Errors (like pending transactions) cannot be force-closed.
   */
  forceClose?: boolean
}

/**
 * Result of a period close attempt.
 *
 * Returned by the API after processing a ClosePeriodRequest.
 * Includes the validation checklist at time of close for audit purposes.
 */
export interface ClosePeriodResult {
  /** Whether the period was successfully closed */
  success: boolean

  /** ID of the period that was attempted to close */
  periodId: string

  /**
   * Result message.
   * Success: 'Period PE-2024-03 closed successfully'
   * Failure: 'Cannot close period - 3 validation errors'
   */
  message: string

  /**
   * Validation checklist at time of close attempt.
   * Stored for audit trail even if close fails.
   */
  checklist?: PeriodCloseChecklist

  /**
   * Error details if close failed.
   * Lists specific issues that prevented close.
   */
  errors?: string[]
}
