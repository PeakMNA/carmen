/**
 * ============================================================================
 * PERIOD END MOCK DATA
 * ============================================================================
 *
 * Mock data for the Period End Process module.
 * Provides sample periods, validation results, and helper functions
 * for development and testing of the period close workflow.
 *
 * VALIDATION SEQUENCE: Transactions → Spot Checks → Physical Counts
 *
 * TRANSACTION CODE FORMAT: PREFIX-YYMM-NNNN
 * - PREFIX: Document type (ADJ = Adjustment, TRF = Transfer, SC = Spot Check, PC = Physical Count)
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number (e.g., 001, 002, etc.)
 * Examples:
 *   - ADJ-2410-011 = Adjustment #011 from October 2024
 *   - SC-2410-042 = Spot Check #042 from October 2024
 *   - PC-2410-015 = Physical Count #015 from October 2024
 *
 * USAGE:
 * - Import mock data for component development without API
 * - Use helper functions to generate test scenarios
 * - Toggle between passing/failing checklists for UI testing
 *
 * DATA STRUCTURE:
 * - mockPeriods: Sample periods in various states
 * - mockTransactionResults: Sample transaction validation results
 * - mockSpotCheckResults: Sample spot check validation results
 * - mockPhysicalCountResults: Sample physical count validation results
 * - generatePassingChecklist: Creates a checklist where all validations pass
 * - generateFailingChecklist: Creates a checklist with validation failures
 *
 * ============================================================================
 */

import type {
  Period,
  PeriodStatus,
  PeriodCloseChecklist,
  PhysicalCountCheckResult,
  SpotCheckCheckResult,
  TransactionCheckResult,
} from '@/lib/types/period-end'

// ============================================================================
// MOCK PERIODS
// ============================================================================

/**
 * Sample periods representing different states in the period end workflow.
 *
 * This array contains periods in various statuses to demonstrate
 * the full lifecycle of period management:
 * - One 'open' period (current active period)
 * - Multiple 'closed' periods (historical)
 *
 * BUSINESS RULES DEMONSTRATED:
 * - Only one period is 'open' at any time
 * - Periods are ordered chronologically
 * - Closed periods include closedBy and closedAt for audit trail
 *
 * @example
 * // Get all periods
 * const periods = mockPeriods
 *
 * // Find current open period
 * const currentPeriod = mockPeriods.find(p => p.status === 'open')
 */
export const mockPeriods: Period[] = [
  // ========================================================================
  // Current open period - the active period accepting transactions
  // ========================================================================
  {
    id: 'PE-2024-03',
    name: 'March 2024',
    startDate: new Date(2024, 2, 1),   // March 1, 2024
    endDate: new Date(2024, 2, 31),    // March 31, 2024
    status: 'open',
    notes: 'Current active period',
  },

  // ========================================================================
  // Recently closed period - shows complete audit trail
  // ========================================================================
  {
    id: 'PE-2024-02',
    name: 'February 2024',
    startDate: new Date(2024, 1, 1),   // February 1, 2024
    endDate: new Date(2024, 1, 29),    // February 29, 2024 (leap year)
    status: 'closed',
    closedBy: 'John Doe',
    closedAt: new Date(2024, 2, 3, 14, 30), // March 3, 2024 2:30 PM
    notes: 'All reconciliations completed',
  },

  // ========================================================================
  // Older closed period
  // ========================================================================
  {
    id: 'PE-2024-01',
    name: 'January 2024',
    startDate: new Date(2024, 0, 1),   // January 1, 2024
    endDate: new Date(2024, 0, 31),    // January 31, 2024
    status: 'closed',
    closedBy: 'Jane Smith',
    closedAt: new Date(2024, 1, 2, 16, 45), // February 2, 2024 4:45 PM
    notes: 'Year opening period',
  },

  // ========================================================================
  // Previous year period - demonstrates year-end close
  // ========================================================================
  {
    id: 'PE-2023-12',
    name: 'December 2023',
    startDate: new Date(2023, 11, 1),  // December 1, 2023
    endDate: new Date(2023, 11, 31),   // December 31, 2023
    status: 'closed',
    closedBy: 'John Doe',
    closedAt: new Date(2024, 0, 5, 10, 15), // January 5, 2024 10:15 AM
    notes: 'Year-end close completed',
  },
]

// ============================================================================
// MOCK VALIDATION RESULTS - TRANSACTIONS (Stage 1)
// ============================================================================

/**
 * Mock transaction validation results - All passing scenario.
 *
 * Represents a period where all document types have been posted/approved.
 * Used to demonstrate the UI when all transaction validations pass.
 *
 * DOCUMENT TYPES:
 * - GRN: Goods Received Notes - all 45 posted
 * - ADJ: Inventory Adjustments - all 12 posted
 * - TRF: Stock Transfers - all 8 posted
 * - SR: Store Requisitions - all 156 fulfilled
 * - WR: Wastage Reports - all 23 posted
 */
export const mockTransactionResultsAllPassed: TransactionCheckResult[] = [
  {
    documentType: 'GRN',
    documentTypeName: 'Goods Received Note',
    totalCount: 45,
    pendingCount: 0,
    isValid: true,
    message: '45 GRN documents - All posted',
  },
  {
    documentType: 'ADJ',
    documentTypeName: 'Inventory Adjustment',
    totalCount: 12,
    pendingCount: 0,
    isValid: true,
    message: '12 ADJ documents - All posted',
  },
  {
    documentType: 'TRF',
    documentTypeName: 'Stock Transfer',
    totalCount: 8,
    pendingCount: 0,
    isValid: true,
    message: '8 TRF documents - All posted',
  },
  {
    documentType: 'SR',
    documentTypeName: 'Store Requisition',
    totalCount: 156,
    pendingCount: 0,
    isValid: true,
    message: '156 SR documents - All fulfilled',
  },
  {
    documentType: 'WR',
    documentTypeName: 'Wastage Report',
    totalCount: 23,
    pendingCount: 0,
    isValid: true,
    message: '23 WR documents - All posted',
  },
]

/**
 * Mock transaction validation results - With failures.
 *
 * Represents a period where some documents are still pending.
 * Used to demonstrate the UI when transaction validations fail.
 *
 * FAILURES:
 * - ADJ: 2 of 12 adjustments not posted (ADJ-2410-011 shown as sample)
 * - TRF: 1 of 8 transfers not posted (TRF-2410-008 shown as sample)
 *
 * These failures will block period close until resolved.
 */
export const mockTransactionResultsWithFailures: TransactionCheckResult[] = [
  {
    documentType: 'GRN',
    documentTypeName: 'Goods Received Note',
    totalCount: 45,
    pendingCount: 0,
    isValid: true,
    message: '45 GRN documents - All posted',
  },
  {
    documentType: 'ADJ',
    documentTypeName: 'Inventory Adjustment',
    totalCount: 12,
    pendingCount: 2,
    sampleDocumentId: 'ADJ-2410-011', // Link to first pending document
    isValid: false,
    message: '2 ADJ documents not posted',
  },
  {
    documentType: 'TRF',
    documentTypeName: 'Stock Transfer',
    totalCount: 8,
    pendingCount: 1,
    sampleDocumentId: 'TRF-2410-008', // Link to first pending document
    isValid: false,
    message: '1 TRF document not posted',
  },
  {
    documentType: 'SR',
    documentTypeName: 'Store Requisition',
    totalCount: 156,
    pendingCount: 0,
    isValid: true,
    message: '156 SR documents - All fulfilled',
  },
  {
    documentType: 'WR',
    documentTypeName: 'Wastage Report',
    totalCount: 23,
    pendingCount: 0,
    isValid: true,
    message: '23 WR documents - All posted',
  },
]

// ============================================================================
// MOCK VALIDATION RESULTS - SPOT CHECKS (Stage 2)
// ============================================================================

/**
 * Mock spot check validation results - All passing scenario.
 *
 * Represents a period where all scheduled spot checks are completed.
 * Three spot checks across different locations, all with 'completed' status.
 */
export const mockSpotCheckResultsAllPassed: SpotCheckCheckResult[] = [
  {
    checkId: 'SC-2410-042',
    checkNumber: 'SC-2410-042',
    location: 'Main Kitchen',
    status: 'completed',
    isValid: true,
    message: 'Spot check completed',
  },
  {
    checkId: 'SC-2410-043',
    checkNumber: 'SC-2410-043',
    location: 'Bar Storage',
    status: 'completed',
    isValid: true,
    message: 'Spot check completed',
  },
  {
    checkId: 'SC-2410-044',
    checkNumber: 'SC-2410-044',
    location: 'Cold Storage',
    status: 'completed',
    isValid: true,
    message: 'Spot check completed',
  },
]

/**
 * Mock spot check validation results - With failures.
 *
 * Represents a period where one spot check is still in progress.
 * SC-2410-044 at Cold Storage has 'in-progress' status and blocks close.
 */
export const mockSpotCheckResultsWithFailures: SpotCheckCheckResult[] = [
  {
    checkId: 'SC-2410-042',
    checkNumber: 'SC-2410-042',
    location: 'Main Kitchen',
    status: 'completed',
    isValid: true,
    message: 'Spot check completed',
  },
  {
    checkId: 'SC-2410-043',
    checkNumber: 'SC-2410-043',
    location: 'Bar Storage',
    status: 'completed',
    isValid: true,
    message: 'Spot check completed',
  },
  {
    checkId: 'SC-2410-044',
    checkNumber: 'SC-2410-044',
    location: 'Cold Storage',
    status: 'in-progress',
    isValid: false,
    message: 'Spot check is in-progress - must be completed before period close',
  },
]

// ============================================================================
// MOCK VALIDATION RESULTS - PHYSICAL COUNTS (Stage 3)
// ============================================================================

/**
 * Mock physical count validation results - All passing scenario.
 *
 * Represents a period where all physical counts are finalized.
 * 'finalized' means the count is complete AND adjustments are posted to GL.
 * Three counts across different locations, all with 'finalized' status.
 */
export const mockPhysicalCountResultsAllPassed: PhysicalCountCheckResult[] = [
  {
    countId: 'PC-2410-015',
    countNumber: 'PC-2410-015',
    location: 'Main Warehouse',
    status: 'finalized',
    isValid: true,
    message: 'Count finalized and adjustments posted',
  },
  {
    countId: 'PC-2410-016',
    countNumber: 'PC-2410-016',
    location: 'Production Store',
    status: 'finalized',
    isValid: true,
    message: 'Count finalized and adjustments posted',
  },
  {
    countId: 'PC-2410-017',
    countNumber: 'PC-2410-017',
    location: 'Cold Storage',
    status: 'finalized',
    isValid: true,
    message: 'Count finalized and adjustments posted',
  },
]

/**
 * Mock physical count validation results - With failures.
 *
 * Represents a period where one physical count is still in progress.
 * PC-2410-017 at Cold Storage has 'in-progress' status and blocks close.
 * Even if count is 'completed', it must be 'finalized' (with GL posting).
 */
export const mockPhysicalCountResultsWithFailures: PhysicalCountCheckResult[] = [
  {
    countId: 'PC-2410-015',
    countNumber: 'PC-2410-015',
    location: 'Main Warehouse',
    status: 'finalized',
    isValid: true,
    message: 'Count finalized and adjustments posted',
  },
  {
    countId: 'PC-2410-016',
    countNumber: 'PC-2410-016',
    location: 'Production Store',
    status: 'finalized',
    isValid: true,
    message: 'Count finalized and adjustments posted',
  },
  {
    countId: 'PC-2410-017',
    countNumber: 'PC-2410-017',
    location: 'Cold Storage',
    status: 'in-progress',
    isValid: false,
    message: 'Count is in-progress - must be finalized before period close',
  },
]

// ============================================================================
// MOCK COMPLETE CHECKLISTS
// ============================================================================

/**
 * Generates a complete checklist where all validations pass.
 *
 * Use this function to test the UI when the period is ready to close.
 * All three stages (transactions, spot checks, physical counts) pass.
 *
 * SUMMARY DATA:
 * - 244 total transactions committed (GRN + ADJ + TRF + SR + WR)
 * - 3 spot checks completed
 * - 3 physical counts finalized
 *
 * @param periodId - The period ID to associate with the checklist
 * @returns A PeriodCloseChecklist with all validations passing
 *
 * @example
 * const checklist = generatePassingChecklist('PE-2024-03')
 * console.log(checklist.allChecksPassed) // true
 */
export function generatePassingChecklist(periodId: string): PeriodCloseChecklist {
  return {
    periodId,
    validatedAt: new Date(),

    // Stage 1: Transactions - all committed
    transactionsCommitted: true,
    transactionDetails: mockTransactionResultsAllPassed,
    pendingTransactionCount: 0,

    // Stage 2: Spot Checks - all completed
    spotChecksComplete: true,
    spotCheckDetails: mockSpotCheckResultsAllPassed,
    incompleteSpotCheckCount: 0,

    // Stage 3: Physical Counts - all finalized
    physicalCountsFinalized: true,
    physicalCountDetails: mockPhysicalCountResultsAllPassed,
    pendingPhysicalCountCount: 0,

    // Summary - ready to close
    allChecksPassed: true,
    totalIssueCount: 0,
    summaryMessages: [
      '3 physical counts finalized',
      '3 spot checks completed',
      '244 transactions committed',
    ],
  }
}

/**
 * Generates a complete checklist with validation failures.
 *
 * Use this function to test the UI when the period cannot be closed.
 * Shows failures in all three stages to demonstrate error handling.
 *
 * FAILURES:
 * - 3 pending transactions (2 ADJ + 1 TRF)
 * - 1 incomplete spot check (SC-2410-044 in-progress)
 * - 1 non-finalized physical count (PC-2410-017 in-progress)
 *
 * @param periodId - The period ID to associate with the checklist
 * @returns A PeriodCloseChecklist with validation failures
 *
 * @example
 * const checklist = generateFailingChecklist('PE-2024-03')
 * console.log(checklist.allChecksPassed) // false
 * console.log(checklist.totalIssueCount) // 5
 */
export function generateFailingChecklist(periodId: string): PeriodCloseChecklist {
  // Calculate pending transaction count from mock data
  const pendingTransactions = mockTransactionResultsWithFailures
    .filter(t => !t.isValid)
    .reduce((sum, t) => sum + t.pendingCount, 0)

  // Calculate incomplete spot check count
  const incompleteSpotChecks = mockSpotCheckResultsWithFailures.filter(s => !s.isValid).length

  // Calculate pending physical count count
  const pendingPhysicalCounts = mockPhysicalCountResultsWithFailures.filter(p => !p.isValid).length

  // Total issues across all stages
  const totalIssues = pendingTransactions + incompleteSpotChecks + pendingPhysicalCounts

  return {
    periodId,
    validatedAt: new Date(),

    // Stage 1: Transactions - some pending
    transactionsCommitted: pendingTransactions === 0,
    transactionDetails: mockTransactionResultsWithFailures,
    pendingTransactionCount: pendingTransactions,

    // Stage 2: Spot Checks - some incomplete
    spotChecksComplete: incompleteSpotChecks === 0,
    spotCheckDetails: mockSpotCheckResultsWithFailures,
    incompleteSpotCheckCount: incompleteSpotChecks,

    // Stage 3: Physical Counts - some not finalized
    physicalCountsFinalized: pendingPhysicalCounts === 0,
    physicalCountDetails: mockPhysicalCountResultsWithFailures,
    pendingPhysicalCountCount: pendingPhysicalCounts,

    // Summary - cannot close
    allChecksPassed: false,
    totalIssueCount: totalIssues,
    // Build summary messages, only include stages with issues
    summaryMessages: [
      `${pendingTransactions} transaction(s) not committed`,
      `${incompleteSpotChecks} spot check(s) not completed`,
      `${pendingPhysicalCounts} physical count(s) not finalized`,
    ].filter((_, i) => {
      // Only include message if that stage has issues
      if (i === 0) return pendingTransactions > 0
      if (i === 1) return incompleteSpotChecks > 0
      return pendingPhysicalCounts > 0
    }),
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets the current open period from mock data.
 *
 * In a real application, this would query the API.
 * Only one period should be open at any time.
 *
 * @returns The open period, or undefined if no open period exists
 *
 * @example
 * const currentPeriod = getCurrentOpenPeriod()
 * if (currentPeriod) {
 *   console.log(`Current period: ${currentPeriod.name}`)
 * }
 */
export function getCurrentOpenPeriod(): Period | undefined {
  return mockPeriods.find(p => p.status === 'open')
}

/**
 * Gets all closed periods sorted by date descending (most recent first).
 *
 * Used to populate the period history table on the main page.
 *
 * @returns Array of closed periods, sorted by endDate descending
 *
 * @example
 * const closedPeriods = getClosedPeriods()
 * // Returns: [Feb 2024, Jan 2024, Dec 2023, ...]
 */
export function getClosedPeriods(): Period[] {
  return mockPeriods
    .filter(p => p.status === 'closed')
    .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())
}

/**
 * Gets a period by its unique ID.
 *
 * @param id - The period ID in PE-YYYY-MM format
 * @returns The period if found, undefined otherwise
 *
 * @example
 * const period = getPeriodById('PE-2024-03')
 * if (period) {
 *   console.log(`Found: ${period.name}`)
 * }
 */
export function getPeriodById(id: string): Period | undefined {
  return mockPeriods.find(p => p.id === id)
}

/**
 * Checks if a date falls within a period's date range.
 *
 * Used to determine which period a transaction belongs to.
 * Both startDate and endDate are inclusive.
 *
 * @param date - The date to check
 * @param period - The period to check against
 * @returns true if the date is within the period, false otherwise
 *
 * @example
 * const period = getPeriodById('PE-2024-03')
 * const transactionDate = new Date(2024, 2, 15) // March 15, 2024
 * const belongs = isDateInPeriod(transactionDate, period) // true
 */
export function isDateInPeriod(date: Date, period: Period): boolean {
  return date >= period.startDate && date <= period.endDate
}

/**
 * Gets the CSS class for a period status badge.
 *
 * Returns Tailwind CSS classes for consistent status styling:
 * - open: Blue (active, accepting transactions)
 * - in_progress: Yellow (close process started)
 * - closing: Orange (final validation in progress)
 * - closed: Green (locked, no new transactions)
 *
 * @param status - The period status
 * @returns Tailwind CSS class string for the badge
 *
 * @example
 * <Badge className={getPeriodStatusColor('open')}>Open</Badge>
 * // Results in: <Badge className="bg-blue-100 text-blue-800">Open</Badge>
 */
export function getPeriodStatusColor(status: PeriodStatus): string {
  const colors: Record<PeriodStatus, string> = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    closing: 'bg-orange-100 text-orange-800',
    closed: 'bg-green-100 text-green-800',
  }
  return colors[status]
}

/**
 * Gets the display label for a period status.
 *
 * Converts internal status codes to human-readable labels:
 * - open → "Open"
 * - in_progress → "In Progress"
 * - closing → "Closing"
 * - closed → "Closed"
 *
 * @param status - The period status
 * @returns Human-readable status label
 *
 * @example
 * const label = getPeriodStatusLabel('in_progress')
 * // Returns: "In Progress"
 */
export function getPeriodStatusLabel(status: PeriodStatus): string {
  const labels: Record<PeriodStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    closing: 'Closing',
    closed: 'Closed',
  }
  return labels[status]
}
