/**
 * Document Sequence Generator
 *
 * Utility functions for generating and parsing document reference numbers
 * following the Carmen ERP standard format: PREFIX-YYMM-NNNN
 *
 * Standard Prefixes:
 * - SR:  Store Requisition
 * - ST:  Stock Transfer
 * - SI:  Stock Issue
 * - PR:  Purchase Request
 * - PO:  Purchase Order
 * - GRN: Goods Received Note
 */

// Document type prefixes
export type DocumentPrefix = 'SR' | 'ST' | 'SI' | 'PR' | 'PO' | 'GRN' | 'TRF' | 'ADJ' | 'WR' | 'SC' | 'PC'

// Track sequence numbers per prefix and month
const sequenceCounters: Record<string, number> = {}

/**
 * Generate the next document number for a given prefix
 *
 * @param prefix - Document type prefix (e.g., 'SR', 'ST', 'SI')
 * @param date - Optional date to use (defaults to current date)
 * @returns Document reference number in format PREFIX-YYMM-NNNN
 *
 * @example
 * getNextDocumentNumber('SR') // Returns 'SR-2410-001' for October 2024
 * getNextDocumentNumber('ST') // Returns 'ST-2410-001' for October 2024
 */
export function getNextDocumentNumber(prefix: DocumentPrefix, date?: Date): string {
  const now = date || new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const periodKey = `${prefix}-${year}${month}`

  // Get or initialize the counter for this prefix/period
  if (!sequenceCounters[periodKey]) {
    sequenceCounters[periodKey] = 0
  }

  // Increment and get the sequence number
  sequenceCounters[periodKey] += 1
  const sequence = sequenceCounters[periodKey].toString().padStart(3, '0')

  return `${prefix}-${year}${month}-${sequence}`
}

/**
 * Parse a document reference number into its components
 *
 * @param refNo - Document reference number (e.g., 'SR-2410-001')
 * @returns Parsed components or null if invalid
 */
export function parseDocumentNumber(refNo: string): {
  prefix: string
  year: string
  month: string
  sequence: number
  fullPeriod: string
} | null {
  const match = refNo.match(/^([A-Z]+)-(\d{2})(\d{2})-(\d{3,4})$/)

  if (!match) {
    return null
  }

  const [, prefix, year, month, sequenceStr] = match

  return {
    prefix,
    year,
    month,
    sequence: parseInt(sequenceStr, 10),
    fullPeriod: `20${year}-${month}`
  }
}

/**
 * Format a date as YYMM string
 */
export function formatPeriod(date: Date): string {
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}${month}`
}

/**
 * Get the document type description from prefix
 */
export function getDocumentTypeLabel(prefix: DocumentPrefix): string {
  const labels: Record<DocumentPrefix, string> = {
    SR: 'Store Requisition',
    ST: 'Stock Transfer',
    SI: 'Stock Issue',
    PR: 'Purchase Request',
    PO: 'Purchase Order',
    GRN: 'Goods Received Note',
    TRF: 'Transfer',
    ADJ: 'Inventory Adjustment',
    WR: 'Wastage Report',
    SC: 'Spot Check',
    PC: 'Physical Count'
  }

  return labels[prefix] || prefix
}

/**
 * Initialize sequence counters with existing document numbers
 * This ensures new documents get numbers after existing ones
 *
 * @param existingNumbers - Array of existing document numbers
 */
export function initializeSequenceCounters(existingNumbers: string[]): void {
  for (const refNo of existingNumbers) {
    const parsed = parseDocumentNumber(refNo)
    if (parsed) {
      const periodKey = `${parsed.prefix}-${parsed.year}${parsed.month}`
      const currentMax = sequenceCounters[periodKey] || 0
      sequenceCounters[periodKey] = Math.max(currentMax, parsed.sequence)
    }
  }
}

/**
 * Reset all sequence counters (useful for testing)
 */
export function resetSequenceCounters(): void {
  Object.keys(sequenceCounters).forEach(key => {
    delete sequenceCounters[key]
  })
}

/**
 * Validate a document number format
 */
export function isValidDocumentNumber(refNo: string): boolean {
  return parseDocumentNumber(refNo) !== null
}

/**
 * Compare two document numbers for sorting
 * Returns negative if a < b, positive if a > b, 0 if equal
 */
export function compareDocumentNumbers(a: string, b: string): number {
  const parsedA = parseDocumentNumber(a)
  const parsedB = parseDocumentNumber(b)

  if (!parsedA || !parsedB) {
    return a.localeCompare(b)
  }

  // First compare by period (year + month)
  const periodComparison = (parsedA.year + parsedA.month).localeCompare(parsedB.year + parsedB.month)
  if (periodComparison !== 0) {
    return periodComparison
  }

  // Then compare by sequence
  return parsedA.sequence - parsedB.sequence
}
