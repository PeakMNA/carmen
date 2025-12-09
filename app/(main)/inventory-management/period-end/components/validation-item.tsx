/**
 * ============================================================================
 * VALIDATION ITEM COMPONENT
 * ============================================================================
 *
 * Displays a single validation result item with pass/fail status indicator.
 * Used within the validation checklist to show individual document/count
 * results during the period close workflow.
 *
 * COMPONENT HIERARCHY:
 * - ValidationChecklist (parent)
 *   - ValidationItem (this component) - For spot checks and physical counts
 *   - TransactionValidationItem - For document type summaries
 *
 * FEATURES:
 * - Pass/fail icon indicator (CheckCircle2 for pass, XCircle for fail)
 * - Document ID and location display with proper hierarchy
 * - Status badge with color-coded styling (green for pass, red for fail)
 * - Optional link to navigate to source document for resolution
 * - Two display variants: 'default' (detailed) and 'compact' (minimal)
 *
 * VISUAL DESIGN:
 * - Uses green color scheme (bg-green-50, text-green-600) for valid items
 * - Uses red color scheme (bg-red-50, text-red-600) for invalid items
 * - Consistent with the application's validation feedback patterns
 *
 * USAGE CONTEXT:
 * - Spot Check validation: Shows each spot check with completion status
 * - Physical Count validation: Shows each count with finalization status
 * - Transaction validation: Uses TransactionValidationItem variant
 *
 * @example
 * // Passing spot check item
 * <ValidationItem
 *   id="SC-2024-042"
 *   label="SC-2024-042"
 *   sublabel="Kitchen Storage"
 *   status="completed"
 *   isValid={true}
 *   message="Spot check completed"
 * />
 *
 * @example
 * // Failing physical count item with link
 * <ValidationItem
 *   id="PC-2024-017"
 *   label="PC-2024-017"
 *   sublabel="Cold Storage"
 *   status="in-progress"
 *   isValid={false}
 *   message="Count must be finalized before period close"
 *   href="/inventory-management/physical-count-management/PC-2024-017"
 * />
 *
 * ============================================================================
 */

'use client'

// ============================================================================
// IMPORTS
// ============================================================================

import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props for the ValidationItem component.
 *
 * Defines the data needed to display a single validation result,
 * including status information and optional navigation.
 */
interface ValidationItemProps {
  /**
   * Unique identifier for the item.
   * Used for React keys and linking to source documents.
   * @example 'SC-2024-042', 'PC-2024-017'
   */
  id: string

  /**
   * Primary display label for the item.
   * Typically the document number or count number.
   * @example 'SC-2024-042', 'PC-2024-017'
   */
  label: string

  /**
   * Secondary label providing additional context.
   * Usually the location or department name.
   * @example 'Kitchen Storage', 'Main Warehouse'
   */
  sublabel?: string

  /**
   * Current status text to display.
   * Should reflect the actual status from the source system.
   * @example 'completed', 'in-progress', 'finalized', 'pending'
   */
  status: string

  /**
   * Whether this item passes validation.
   * Determines the visual styling (green for true, red for false).
   */
  isValid: boolean

  /**
   * Detailed validation message explaining the result.
   * Provides context for why the item passes or fails.
   * @example 'Spot check completed', 'Count must be finalized before period close'
   */
  message?: string

  /**
   * Optional URL to navigate to the source document.
   * When provided, displays an external link icon button.
   * Allows users to quickly access and resolve failing items.
   * @example '/inventory-management/physical-count-management/PC-2024-017'
   */
  href?: string

  /**
   * Display variant for different use cases.
   * - 'default': Full detailed view with all information
   * - 'compact': Minimal view for dense lists
   */
  variant?: 'default' | 'compact'
}

// ============================================================================
// VALIDATION ITEM COMPONENT
// ============================================================================

/**
 * Displays a single validation result with pass/fail indicator.
 *
 * This component is the primary building block for showing individual
 * validation results in the period close checklist. It supports two
 * display variants and optional navigation to source documents.
 *
 * RENDERING LOGIC:
 * 1. Selects icon based on validation status (CheckCircle2/XCircle)
 * 2. Applies color scheme based on isValid (green/red)
 * 3. Renders compact or default layout based on variant
 * 4. Optionally includes external link for document navigation
 *
 * ACCESSIBILITY:
 * - Icons provide visual feedback for status
 * - Color coding reinforces pass/fail state
 * - External links use proper anchor elements
 *
 * @param props - Component props (see ValidationItemProps)
 * @returns JSX element displaying the validation result
 *
 * @example
 * // Compact variant for dense lists
 * <ValidationItem
 *   id="SC-001"
 *   label="SC-2024-042"
 *   sublabel="Kitchen"
 *   status="completed"
 *   isValid={true}
 *   variant="compact"
 * />
 */
export function ValidationItem({
  id,
  label,
  sublabel,
  status,
  isValid,
  message,
  href,
  variant = 'default',
}: ValidationItemProps) {
  // Select appropriate icon based on validation status
  // CheckCircle2 for passing, XCircle for failing
  const Icon = isValid ? CheckCircle2 : XCircle

  // ----------------------------------------------------------------------------
  // COMPACT VARIANT
  // ----------------------------------------------------------------------------
  // Minimal display for dense lists with less visual hierarchy
  // Used when showing many items in a limited space
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center justify-between py-2 px-3 rounded-md text-sm',
          isValid ? 'bg-green-50' : 'bg-red-50'
        )}
      >
        {/* Left side: Icon, label, and sublabel */}
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              'h-4 w-4',
              isValid ? 'text-green-600' : 'text-red-600'
            )}
          />
          <span className="font-medium">{label}</span>
          {sublabel && (
            <span className="text-muted-foreground">{sublabel}</span>
          )}
        </div>
        {/* Right side: Status text */}
        <span
          className={cn(
            'text-xs font-medium',
            isValid ? 'text-green-700' : 'text-red-700'
          )}
        >
          {status}
        </span>
      </div>
    )
  }

  // ----------------------------------------------------------------------------
  // DEFAULT VARIANT
  // ----------------------------------------------------------------------------
  // Full detailed view with all information and optional navigation
  // Used for primary validation display with more visual hierarchy
  return (
    <div
      className={cn(
        'flex items-start justify-between p-3 rounded-lg border',
        isValid
          ? 'bg-green-50/50 border-green-200'
          : 'bg-red-50/50 border-red-200'
      )}
    >
      {/* Left side: Icon with label, sublabel, and message */}
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            'h-5 w-5 mt-0.5',
            isValid ? 'text-green-600' : 'text-red-600'
          )}
        />
        <div className="space-y-1">
          {/* Primary label with optional sublabel */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{label}</span>
            {sublabel && (
              <span className="text-sm text-muted-foreground">• {sublabel}</span>
            )}
          </div>
          {/* Validation message providing context */}
          {message && (
            <p
              className={cn(
                'text-xs',
                isValid ? 'text-green-700' : 'text-red-700'
              )}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Status badge and optional external link */}
      <div className="flex items-center gap-2">
        {/* Status badge with color-coded background */}
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded',
            isValid
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          )}
        >
          {status}
        </span>
        {/* External link button for document navigation */}
        {href && (
          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
            <a href={href}>
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// TRANSACTION VALIDATION ITEM COMPONENT
// ============================================================================

/**
 * Props for the TransactionValidationItem component.
 *
 * Specialized props for displaying transaction document type validation
 * results, showing aggregate counts rather than individual items.
 *
 * DOCUMENT TYPES:
 * - GRN: Goods Received Notes (must be Posted/Approved)
 * - ADJ: Inventory Adjustments (must be Posted)
 * - TRF: Stock Transfers (must be Posted/Completed)
 * - SR: Store Requisitions (must be Fulfilled/Completed)
 * - WR: Wastage Reports (must be Posted/Approved)
 */
interface TransactionValidationItemProps {
  /**
   * Document type code for display.
   * Short abbreviation shown as the primary identifier.
   * @example 'GRN', 'ADJ', 'TRF', 'SR', 'WR'
   */
  documentType: string

  /**
   * Full document type name for accessibility.
   * Human-readable name for the document type.
   * @example 'Goods Received Note', 'Inventory Adjustment'
   */
  documentTypeName: string

  /**
   * Total count of documents of this type in the period.
   * Includes both committed and pending documents.
   */
  totalCount: number

  /**
   * Count of documents not yet committed (Draft or Pending status).
   * Must be 0 for this document type to pass validation.
   */
  pendingCount: number

  /**
   * Whether all documents of this type are committed.
   * True only when pendingCount === 0.
   */
  isValid: boolean

  /**
   * Sample document ID for quick navigation to pending items.
   * Helps users identify which document needs attention.
   * Only provided when there are pending documents.
   * @example 'TRF-2024-0089'
   */
  sampleDocumentId?: string
}

/**
 * Displays transaction validation results for a specific document type.
 *
 * This specialized component shows aggregate validation status for
 * transaction documents, displaying the count of total and pending
 * documents rather than individual line items.
 *
 * DISPLAY FORMAT:
 * - Left: Icon + document type code + total document count
 * - Right: Status text ("All Posted" or "X pending")
 *
 * USAGE CONTEXT:
 * Used in the Transactions section (Stage 1) of the period close
 * validation checklist to show status of each document type.
 *
 * @param props - Component props (see TransactionValidationItemProps)
 * @returns JSX element displaying the transaction validation result
 *
 * @example
 * // All documents posted
 * <TransactionValidationItem
 *   documentType="GRN"
 *   documentTypeName="Goods Received Note"
 *   totalCount={45}
 *   pendingCount={0}
 *   isValid={true}
 * />
 *
 * @example
 * // Some documents pending
 * <TransactionValidationItem
 *   documentType="TRF"
 *   documentTypeName="Stock Transfer"
 *   totalCount={8}
 *   pendingCount={2}
 *   isValid={false}
 *   sampleDocumentId="TRF-2024-0089"
 * />
 */
export function TransactionValidationItem({
  documentType,
  documentTypeName,
  totalCount,
  pendingCount,
  isValid,
  sampleDocumentId,
}: TransactionValidationItemProps) {
  // Select icon based on validation status
  const Icon = isValid ? CheckCircle2 : XCircle

  return (
    <div
      className={cn(
        'flex items-center justify-between py-2 px-3 rounded-md text-sm',
        isValid ? 'bg-green-50' : 'bg-red-50'
      )}
    >
      {/* Left side: Icon, document type, and count */}
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            'h-4 w-4',
            isValid ? 'text-green-600' : 'text-red-600'
          )}
        />
        <span className="font-medium">{documentType}:</span>
        <span className="text-muted-foreground">
          {totalCount} documents
        </span>
      </div>
      {/* Right side: Commitment status */}
      <span
        className={cn(
          'text-xs font-medium',
          isValid ? 'text-green-700' : 'text-red-700'
        )}
      >
        {isValid ? 'All Posted' : `${pendingCount} pending`}
      </span>
    </div>
  )
}
