/**
 * ============================================================================
 * VALIDATION CHECKLIST COMPONENT
 * ============================================================================
 *
 * Main validation checklist for the period close workflow.
 * This is the primary UI component that displays all validation stages
 * and allows users to verify readiness for period close.
 *
 * VALIDATION SEQUENCE (Business-Defined Order):
 * 1. Transactions (first) - Check source document statuses
 *    - GRN, Adjustments, Transfers must be Posted/Approved
 *    - No Draft or Pending documents allowed
 *
 * 2. Spot Checks (second) - All must be completed
 *    - Every scheduled spot check for the period must be 'completed'
 *    - Cannot close with in-progress or pending spot checks
 *
 * 3. Physical Counts (third) - All must be finalized
 *    - Every physical count must be 'finalized' (not just 'completed')
 *    - 'finalized' means adjustments have been posted to General Ledger
 *
 * COMPONENT HIERARCHY:
 * - ValidationChecklist (this component)
 *   - ValidationSection (internal) - Collapsible section container
 *     - TransactionValidationItem - For document type summaries
 *     - ValidationItem - For individual spot checks and physical counts
 *
 * FEATURES:
 * - Expandable/collapsible sections for each validation stage
 * - Individual item status display with pass/fail indicators
 * - "Validate All" button to refresh all validation results
 * - Warning messages for sections with issues
 * - Links to source documents for quick resolution
 *
 * STATE MANAGEMENT:
 * - Uses local state for section expand/collapse
 * - Validation data flows down from parent via props
 * - Validation refresh triggered via onValidate callback
 *
 * VISUAL DESIGN:
 * - Green color scheme for passing sections
 * - Red color scheme for failing sections
 * - Amber warnings for action required
 * - Consistent with application validation patterns
 *
 * @example
 * <ValidationChecklist
 *   checklist={periodCloseChecklist}
 *   onValidate={handleValidate}
 *   isValidating={isValidating}
 * />
 *
 * ============================================================================
 */

'use client'

// ============================================================================
// IMPORTS
// ============================================================================

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  ClipboardCheck,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ValidationItem, TransactionValidationItem } from './validation-item'
import type {
  PeriodCloseChecklist,
  TransactionCheckResult,
  SpotCheckCheckResult,
  PhysicalCountCheckResult,
} from '@/lib/types/period-end'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props for the main ValidationChecklist component.
 *
 * Receives the complete validation data from the parent page
 * and callbacks for user interactions.
 */
interface ValidationChecklistProps {
  /**
   * The complete checklist with all validation results.
   * Contains data for all three validation stages.
   * Should be refreshed when user clicks "Validate All".
   */
  checklist: PeriodCloseChecklist

  /**
   * Callback when user requests to run validations.
   * Parent should refresh validation data from the server/API.
   */
  onValidate: () => void

  /**
   * Whether validation is currently running.
   * Shows loading state on the "Validate All" button.
   */
  isValidating: boolean
}

/**
 * Props for the internal ValidationSection component.
 *
 * Defines the structure for each collapsible validation stage
 * (Transactions, Spot Checks, Physical Counts).
 */
interface ValidationSectionProps {
  /**
   * Section order number (1, 2, or 3).
   * Displayed in a circular badge to indicate sequence.
   */
  order: number

  /**
   * Section title displayed in the header.
   * @example 'Transactions', 'Spot Checks', 'Physical Counts'
   */
  title: string

  /**
   * Brief description of validation requirements.
   * @example 'All documents must be posted/approved'
   */
  description: string

  /**
   * Icon component to display next to the title.
   * Should be a Lucide icon matching the section type.
   */
  icon: React.ReactNode

  /**
   * Whether all items in this section pass validation.
   * Determines the color scheme (green/red).
   */
  isValid: boolean

  /**
   * Number of failing items in this section.
   * Displayed as "X issues" when section fails.
   */
  issueCount: number

  /**
   * Whether this section is currently expanded.
   * Controls the visibility of the content area.
   */
  isExpanded: boolean

  /**
   * Callback when section header is clicked.
   * Should toggle the isExpanded state.
   */
  onToggle: () => void

  /**
   * Content to render when section is expanded.
   * Typically a list of ValidationItem or TransactionValidationItem.
   */
  children: React.ReactNode
}

// ============================================================================
// VALIDATION SECTION COMPONENT (Internal)
// ============================================================================

/**
 * Collapsible section container for a validation stage.
 *
 * This internal component provides the consistent layout and behavior
 * for each of the three validation sections. It wraps content in a
 * Card with Collapsible functionality.
 *
 * LAYOUT STRUCTURE:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ [Order#] [Icon] Title                    [Status] [Chevron] │
 * │                 Description                                  │
 * ├─────────────────────────────────────────────────────────────┤
 * │ [Expandable content with validation items]                   │
 * └─────────────────────────────────────────────────────────────┘
 *
 * @param props - Component props (see ValidationSectionProps)
 * @returns JSX element for the collapsible section
 */
function ValidationSection({
  order,
  title,
  description,
  icon,
  isValid,
  issueCount,
  isExpanded,
  onToggle,
  children,
}: ValidationSectionProps) {
  // Select status icon based on validation result
  const StatusIcon = isValid ? CheckCircle2 : XCircle

  return (
    <Card className={cn(isValid ? 'border-green-200' : 'border-red-200')}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        {/* Section Header - Clickable to expand/collapse */}
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              {/* Left side: Order badge, icon, title, and description */}
              <div className="flex items-center gap-3">
                {/* Order number badge - Shows sequence (1, 2, 3) */}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                    isValid
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {order}
                </div>
                {/* Section icon and text */}
                <div className="flex items-center gap-2">
                  {icon}
                  <div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription className="text-xs">
                      {description}
                    </CardDescription>
                  </div>
                </div>
              </div>

              {/* Right side: Status indicator and expand/collapse chevron */}
              <div className="flex items-center gap-3">
                {/* Validation status with optional issue count */}
                <div className="flex items-center gap-1">
                  <StatusIcon
                    className={cn(
                      'h-5 w-5',
                      isValid ? 'text-green-600' : 'text-red-600'
                    )}
                  />
                  {/* Show issue count for failing sections */}
                  {!isValid && issueCount > 0 && (
                    <span className="text-sm font-medium text-red-600">
                      {issueCount} issue{issueCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {/* Chevron indicator for expand/collapse state */}
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        {/* Collapsible Content - Shows validation items when expanded */}
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Main validation checklist component for period close workflow.
 *
 * This component orchestrates the display of all three validation stages
 * and provides the "Validate All" functionality. It manages the expand/collapse
 * state for each section independently.
 *
 * COMPONENT BEHAVIOR:
 * 1. All sections start expanded for immediate visibility
 * 2. Users can collapse/expand sections independently
 * 3. "Validate All" triggers parent to refresh validation data
 * 4. Loading state shows spinner on the button
 *
 * VALIDATION FLOW:
 * 1. User clicks "Validate All"
 * 2. Parent component (page) calls API to run validations
 * 3. New checklist data flows down via props
 * 4. Component re-renders with updated pass/fail states
 *
 * @param props - Component props (see ValidationChecklistProps)
 * @returns JSX element containing the complete validation checklist
 */
export function ValidationChecklist({
  checklist,
  onValidate,
  isValidating,
}: ValidationChecklistProps) {
  // ----------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------------------------------------------

  /**
   * Tracks which sections are currently expanded.
   * All sections start expanded for immediate visibility.
   * Uses a Set for efficient add/delete operations.
   */
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['transactions', 'spot-checks', 'physical-counts'])
  )

  /**
   * Toggles the expand/collapse state of a section.
   * Creates a new Set to trigger React re-render.
   *
   * @param section - The section identifier to toggle
   */
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  // ----------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* ====================================================================
          HEADER SECTION
          Contains title, description, and "Validate All" button
          ==================================================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pre-Close Validation Checklist</h3>
          <p className="text-sm text-muted-foreground">
            All validations must pass before closing the period
          </p>
        </div>
        {/* Validate All button with loading state */}
        <Button onClick={onValidate} disabled={isValidating}>
          {isValidating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Validate All
            </>
          )}
        </Button>
      </div>

      {/* ====================================================================
          STAGE 1: TRANSACTIONS (First Validation)
          Checks that all source documents are Posted/Approved.
          Document types: GRN, ADJ, TRF, SR, WR
          ==================================================================== */}
      <ValidationSection
        order={1}
        title="Transactions"
        description="All documents must be posted/approved"
        icon={<FileText className="h-5 w-5 text-muted-foreground" />}
        isValid={checklist.transactionsCommitted}
        issueCount={checklist.pendingTransactionCount}
        isExpanded={expandedSections.has('transactions')}
        onToggle={() => toggleSection('transactions')}
      >
        {/* List of document types with their validation status */}
        <div className="space-y-2">
          {checklist.transactionDetails.map((transaction) => (
            <TransactionValidationItem
              key={transaction.documentType}
              documentType={transaction.documentType}
              documentTypeName={transaction.documentTypeName}
              totalCount={transaction.totalCount}
              pendingCount={transaction.pendingCount}
              isValid={transaction.isValid}
              sampleDocumentId={transaction.sampleDocumentId}
            />
          ))}
        </div>
        {/* Warning message when transactions are not committed */}
        {!checklist.transactionsCommitted && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                {checklist.pendingTransactionCount} transaction(s) not committed.
                Please post or void all pending documents before closing.
              </p>
            </div>
          </div>
        )}
      </ValidationSection>

      {/* ====================================================================
          STAGE 2: SPOT CHECKS (Second Validation)
          Checks that all scheduled spot checks are completed.
          Must have status 'completed' to pass.
          ==================================================================== */}
      <ValidationSection
        order={2}
        title="Spot Checks"
        description="All spot checks must be completed"
        icon={<ClipboardCheck className="h-5 w-5 text-muted-foreground" />}
        isValid={checklist.spotChecksComplete}
        issueCount={checklist.incompleteSpotCheckCount}
        isExpanded={expandedSections.has('spot-checks')}
        onToggle={() => toggleSection('spot-checks')}
      >
        <div className="space-y-2">
          {/* Handle case where no spot checks are scheduled */}
          {checklist.spotCheckDetails.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No spot checks scheduled for this period
            </div>
          ) : (
            /* List individual spot checks with links to resolve */
            checklist.spotCheckDetails.map((spotCheck) => (
              <ValidationItem
                key={spotCheck.checkId}
                id={spotCheck.checkId}
                label={spotCheck.checkNumber}
                sublabel={spotCheck.location}
                status={spotCheck.status}
                isValid={spotCheck.isValid}
                message={spotCheck.message}
                variant="compact"
                href={`/inventory-management/spot-check/${spotCheck.checkId}`}
              />
            ))
          )}
        </div>
        {/* Warning message when spot checks are incomplete */}
        {!checklist.spotChecksComplete && checklist.incompleteSpotCheckCount > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                {checklist.incompleteSpotCheckCount} spot check(s) not completed.
                Complete all scheduled spot checks before closing.
              </p>
            </div>
          </div>
        )}
      </ValidationSection>

      {/* ====================================================================
          STAGE 3: PHYSICAL COUNTS (Third/Final Validation)
          Checks that all physical counts are finalized.
          'finalized' means count is complete AND adjustments posted to GL.
          ==================================================================== */}
      <ValidationSection
        order={3}
        title="Physical Counts"
        description="All counts must be finalized with adjustments posted"
        icon={<Package className="h-5 w-5 text-muted-foreground" />}
        isValid={checklist.physicalCountsFinalized}
        issueCount={checklist.pendingPhysicalCountCount}
        isExpanded={expandedSections.has('physical-counts')}
        onToggle={() => toggleSection('physical-counts')}
      >
        <div className="space-y-2">
          {/* Handle case where no physical counts are scheduled */}
          {checklist.physicalCountDetails.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No physical counts scheduled for this period
            </div>
          ) : (
            /* List individual physical counts with links to resolve */
            checklist.physicalCountDetails.map((count) => (
              <ValidationItem
                key={count.countId}
                id={count.countId}
                label={count.countNumber}
                sublabel={count.location}
                status={count.status}
                isValid={count.isValid}
                message={count.message}
                variant="compact"
                href={`/inventory-management/physical-count-management/${count.countId}`}
              />
            ))
          )}
        </div>
        {/* Warning message when physical counts are not finalized */}
        {!checklist.physicalCountsFinalized && checklist.pendingPhysicalCountCount > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                {checklist.pendingPhysicalCountCount} physical count(s) not finalized.
                Finalize all counts and post adjustments before closing.
              </p>
            </div>
          </div>
        )}
      </ValidationSection>
    </div>
  )
}
