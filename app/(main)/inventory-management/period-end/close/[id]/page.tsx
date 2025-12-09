/**
 * ============================================================================
 * PERIOD CLOSE VALIDATION PAGE
 * ============================================================================
 *
 * The main workflow page for closing an inventory period.
 * This is the critical step where users validate all prerequisites
 * before locking a period to prevent further transactions.
 *
 * BUSINESS CONTEXT:
 * Period closing is an irreversible operation that freezes inventory
 * values for a specific time range. This page ensures all requirements
 * are met before allowing the close action, protecting data integrity.
 *
 * VALIDATION SEQUENCE (user-specified order):
 * 1. Transactions - All documents (GRN, ADJ, TRF, SR, WR) must be posted/approved
 * 2. Spot Checks - All scheduled spot checks must be completed
 * 3. Physical Counts - All counts must be finalized with GL postings
 *
 * PAGE LAYOUT:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  ← Back | Page Title: "Close Period - [Month Year]" | Badge│
 * │  📅 Date Range                                              │
 * ├─────────────────────────────────────────────────────────────┤
 * │  VALIDATION CHECKLIST (ValidationChecklist component)       │
 * │  ┌─────────────────────────────────────────────────────────┐│
 * │  │ 1. Transactions [Validate]                              ││
 * │  │    ├─ GRN: 45 documents - All Posted ✓                 ││
 * │  │    ├─ ADJ: 12 documents - All Posted ✓                 ││
 * │  │    └─ TRF: 3 documents - 1 pending ✗                   ││
 * │  ├─────────────────────────────────────────────────────────┤│
 * │  │ 2. Spot Checks [Validate]                               ││
 * │  │    ├─ SC-001 Kitchen ✓                                  ││
 * │  │    └─ SC-002 Bar - In Progress ✗                       ││
 * │  ├─────────────────────────────────────────────────────────┤│
 * │  │ 3. Physical Counts [Validate]                           ││
 * │  │    ├─ PC-001 Warehouse ✓                                ││
 * │  │    └─ PC-002 Storage - Pending ✗                       ││
 * │  └─────────────────────────────────────────────────────────┘│
 * ├─────────────────────────────────────────────────────────────┤
 * │  VALIDATION SUMMARY (ValidationSummaryCard component)       │
 * │  ❌ Cannot close period - 3 issues found                    │
 * ├─────────────────────────────────────────────────────────────┤
 * │  [Cancel]                              [Close Period] 🔒    │
 * ├─────────────────────────────────────────────────────────────┤
 * │  ⚠️ Help text when validations fail                         │
 * └─────────────────────────────────────────────────────────────┘
 *
 * WORKFLOW STATES:
 * 1. Initial load: Displays validation checklist with current status
 * 2. Validating: Shows loading state while checking prerequisites
 * 3. Validation complete (failed): Shows issues, Close button disabled
 * 4. Validation complete (passed): Close button enabled
 * 5. Closing: Shows closing animation, then redirects on success
 *
 * EDGE CASE HANDLING:
 * - Period not found: Shows error card with return navigation
 * - Period already closed: Shows info card with link to detail view
 * - Validation in progress: Disables validate buttons, shows spinner
 * - Close in progress: Disables close button, shows animation
 *
 * SECURITY:
 * - Close action requires confirmation dialog
 * - All validations must pass before close is enabled
 * - In production, server-side re-validation before actual close
 *
 * NAVIGATION:
 * - Back button → /inventory-management/period-end
 * - Cancel → /inventory-management/period-end
 * - After close → /inventory-management/period-end
 * - Already closed → /inventory-management/period-end/[id]
 *
 * ============================================================================
 */

'use client'

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ChevronLeft, Calendar, Lock, AlertTriangle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ValidationChecklist } from '../../components/validation-checklist'
import { ValidationSummaryCard } from '../../components/period-summary-card'
import {
  getPeriodById,
  getPeriodStatusColor,
  getPeriodStatusLabel,
  generateFailingChecklist,
  generatePassingChecklist,
} from '@/lib/mock-data/periods'
import type { PeriodCloseChecklist } from '@/lib/types/period-end'

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

/**
 * Period Close workflow page.
 *
 * This page guides users through the period closing process by:
 * 1. Displaying the period being closed with its date range
 * 2. Running and showing validation results for all three stages
 * 3. Providing the close action with confirmation dialog
 *
 * The page handles various states:
 * - Loading/validating state
 * - Period not found error state
 * - Period already closed state
 * - Validation passed/failed states
 *
 * COMPONENT PROPS:
 * Uses Next.js 14 App Router pattern where params is a plain object
 * containing the route parameters.
 *
 * STATE MANAGEMENT:
 * - isValidating: Tracks when validation is in progress
 * - isClosing: Tracks when close operation is in progress
 * - checklist: The current validation results
 *
 * @param props - Component props containing route params
 * @returns JSX element for the period close workflow page
 */
export default function PeriodClosePage({
  params,
}: {
  params: { id: string }
}) {
  // Extract period ID from route params (Next.js 14 pattern)
  const { id } = params
  const router = useRouter()

  // ----------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------------------------------------------

  /**
   * Whether validation is currently running.
   * When true, validate buttons show loading state.
   */
  const [isValidating, setIsValidating] = useState(false)

  /**
   * Whether the close operation is in progress.
   * When true, close button shows animation and is disabled.
   */
  const [isClosing, setIsClosing] = useState(false)

  /**
   * The current validation checklist results.
   * Null until first validation completes.
   */
  const [checklist, setChecklist] = useState<PeriodCloseChecklist | null>(null)

  // ----------------------------------------------------------------------------
  // DATA FETCHING
  // ----------------------------------------------------------------------------

  /**
   * Fetch period data by ID.
   * In a real app, this would be an API call with loading state.
   * Returns null if period not found.
   */
  const period = getPeriodById(id)

  // ----------------------------------------------------------------------------
  // INITIAL VALIDATION EFFECT
  // ----------------------------------------------------------------------------

  /**
   * Run initial validation when the page loads.
   *
   * This effect runs once when the period is loaded and populates
   * the checklist with the current validation status. In a real app,
   * this would fetch the actual validation state from the server.
   *
   * For demo purposes, we start with a failing checklist to
   * demonstrate the validation UI and user flow.
   */
  useEffect(() => {
    if (period) {
      // Simulate initial validation - in real app, this would fetch from API
      // Using failing checklist for demo to show validation UI
      setChecklist(generateFailingChecklist(period.id))
    }
  }, [period])

  // ----------------------------------------------------------------------------
  // ERROR STATES
  // ----------------------------------------------------------------------------

  /**
   * Period Not Found state.
   *
   * Displays when the period ID in the URL doesn't match any existing period.
   * Provides a clear error message and navigation back to the period list.
   */
  if (!period) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Period Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The period you are looking for does not exist or has been removed.
            </p>
            <Button onClick={() => router.push('/inventory-management/period-end')}>
              Back to Period List
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  /**
   * Period Already Closed state.
   *
   * Displays when attempting to close a period that's already closed.
   * Shows when the period was closed and by whom, with navigation
   * to the period detail view.
   */
  if (period.status === 'closed') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Period Already Closed</h2>
            <p className="text-muted-foreground mb-4">
              {period.name} was closed on{' '}
              {period.closedAt ? format(period.closedAt, 'MMMM d, yyyy') : 'N/A'} by{' '}
              {period.closedBy || 'Unknown'}.
            </p>
            <Button onClick={() => router.push(`/inventory-management/period-end/${period.id}`)}>
              View Period Details
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ----------------------------------------------------------------------------
  // EVENT HANDLERS
  // ----------------------------------------------------------------------------

  /**
   * Handle validation button click.
   *
   * Runs all three validation stages and updates the checklist.
   * In a real app, this would:
   * 1. Call the API to run server-side validations
   * 2. Return updated checklist with current status
   * 3. Update the UI with pass/fail states
   *
   * For demo purposes, this toggles between passing and failing
   * states to demonstrate the UI behavior.
   */
  const handleValidate = async () => {
    setIsValidating(true)
    // Simulate validation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Toggle between passing and failing for demo purposes
    // In real app, this would call an API to run actual validations
    if (checklist?.allChecksPassed) {
      setChecklist(generateFailingChecklist(period.id))
    } else {
      setChecklist(generatePassingChecklist(period.id))
    }

    setIsValidating(false)
  }

  /**
   * Handle period close confirmation.
   *
   * Called when user confirms the close action in the dialog.
   * In a real app, this would:
   * 1. Re-validate all checks server-side
   * 2. If still passing, lock the period
   * 3. Update period status to 'closed'
   * 4. Record closedBy and closedAt for audit
   * 5. Redirect to period list on success
   *
   * The close operation is irreversible.
   */
  const handleClosePeriod = async () => {
    setIsClosing(true)
    // Simulate closing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In real app, this would call an API to close the period
    // For now, just redirect to the period list
    router.push('/inventory-management/period-end')
  }

  /**
   * Handle cancel button click.
   * Returns user to the period list without any changes.
   */
  const handleCancel = () => {
    router.push('/inventory-management/period-end')
  }

  // ----------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* ====================================================================
          PAGE HEADER
          Back button, title with period name, status badge, and date range
          ==================================================================== */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {/* Back navigation button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => router.push('/inventory-management/period-end')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Page title with period name */}
            <h2 className="text-3xl font-bold tracking-tight">
              Close Period - {period.name}
            </h2>
            {/* Current status badge (should be 'open' or 'in_progress') */}
            <Badge className={cn(getPeriodStatusColor(period.status), 'ml-2')}>
              {getPeriodStatusLabel(period.status)}
            </Badge>
          </div>
          {/* Period date range display */}
          <p className="text-muted-foreground flex items-center gap-2 ml-10">
            <Calendar className="h-4 w-4" />
            {format(period.startDate, 'MMMM d, yyyy')} -{' '}
            {format(period.endDate, 'MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* ====================================================================
          VALIDATION CHECKLIST SECTION
          Main validation component with three expandable stages:
          1. Transactions, 2. Spot Checks, 3. Physical Counts
          ==================================================================== */}
      {checklist && (
        <ValidationChecklist
          checklist={checklist}
          onValidate={handleValidate}
          isValidating={isValidating}
        />
      )}

      {/* ====================================================================
          VALIDATION SUMMARY SECTION
          Shows aggregate pass/fail status with issue counts
          Green for all passed, red for any failures
          ==================================================================== */}
      {checklist && (
        <ValidationSummaryCard
          allChecksPassed={checklist.allChecksPassed}
          totalIssueCount={checklist.totalIssueCount}
          summaryMessages={checklist.summaryMessages}
        />
      )}

      {/* ====================================================================
          ACTION BUTTONS SECTION
          Cancel (left) and Close Period (right) buttons
          Close button disabled until all validations pass
          ==================================================================== */}
      <div className="flex items-center justify-between pt-4 border-t">
        {/* Cancel button - returns to period list */}
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>

        {/* Close Period button with confirmation dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={!checklist?.allChecksPassed || isClosing}
              className="min-w-[150px]"
            >
              {isClosing ? (
                <>
                  <Lock className="mr-2 h-4 w-4 animate-pulse" />
                  Closing Period...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Close Period
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          {/* Confirmation dialog - warns about irreversible action */}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close Period - {period.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Once closed:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>No new transactions can be posted to this period</li>
                  <li>All inventory values will be locked at their current state</li>
                  <li>A new period will need to be opened for future transactions</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClosePeriod}>
                Yes, Close Period
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* ====================================================================
          HELP TEXT SECTION
          Warning message shown when validations have not passed
          Guides user on what to do next
          ==================================================================== */}
      {checklist && !checklist.allChecksPassed && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">
                  Period cannot be closed yet
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Please resolve all validation issues before closing the period.
                  Click &quot;Validate All&quot; after making changes to verify the status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
