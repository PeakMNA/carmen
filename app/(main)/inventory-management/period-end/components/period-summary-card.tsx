/**
 * ============================================================================
 * PERIOD SUMMARY CARD COMPONENTS
 * ============================================================================
 *
 * This file contains two related card components for the Period End module:
 *
 * 1. PeriodSummaryCard - Displays period information with two variants:
 *    - Featured (isCurrentPeriod=true): Large card for the current open period
 *    - Compact (isCurrentPeriod=false): Smaller card for period history list
 *
 * 2. ValidationSummaryCard - Displays validation results summary:
 *    - Pass state: Green styling with "Ready to close" message
 *    - Fail state: Red styling with issue count and details
 *
 * USAGE CONTEXT:
 * - PeriodSummaryCard (Featured): Period End list page, current period section
 * - PeriodSummaryCard (Compact): Period End list page, period history table
 * - ValidationSummaryCard: Period Close workflow page, after validation checklist
 *
 * COMPONENT HIERARCHY:
 * - Period End List Page (page.tsx)
 *   - PeriodSummaryCard (featured)
 *   - PeriodSummaryCard (compact) * N
 * - Period Close Page (close/[id]/page.tsx)
 *   - ValidationChecklist
 *   - ValidationSummaryCard
 *
 * ============================================================================
 */

'use client'

// ============================================================================
// IMPORTS
// ============================================================================

import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronRight, Lock, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Period, PeriodStatus } from '@/lib/types/period-end'
import { getPeriodStatusColor, getPeriodStatusLabel } from '@/lib/mock-data/periods'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props for the PeriodSummaryCard component.
 *
 * Controls the display mode (featured vs compact) and provides
 * the period data to render.
 */
interface PeriodSummaryCardProps {
  /**
   * The period data to display.
   * Contains all information including dates, status, and close metadata.
   */
  period: Period

  /**
   * Whether to render the featured (large) variant.
   * - true: Large card with prominent styling for current open period
   * - false: Compact card for period history list (default)
   */
  isCurrentPeriod?: boolean

  /**
   * Optional additional CSS classes for styling customization.
   */
  className?: string
}

// ============================================================================
// PERIOD SUMMARY CARD COMPONENT
// ============================================================================

/**
 * Displays period information with featured or compact styling.
 *
 * This component has two distinct display modes controlled by isCurrentPeriod:
 *
 * FEATURED MODE (isCurrentPeriod=true):
 * - Large card with prominent border and background
 * - Full date range display
 * - Status badge with icon
 * - Notes display if available
 * - "View Details" and "Start Period Close" action buttons
 *
 * COMPACT MODE (isCurrentPeriod=false):
 * - Smaller card for list display
 * - Abbreviated date range
 * - Status badge (no icon)
 * - Hover effect for interactivity
 * - Close audit trail (who/when) for closed periods
 *
 * @param props - Component props (see PeriodSummaryCardProps)
 * @returns JSX element for the period card
 *
 * @example
 * // Featured mode for current open period
 * <PeriodSummaryCard period={currentPeriod} isCurrentPeriod={true} />
 *
 * @example
 * // Compact mode for history list
 * <PeriodSummaryCard period={closedPeriod} />
 */
export function PeriodSummaryCard({
  period,
  isCurrentPeriod = false,
  className,
}: PeriodSummaryCardProps) {
  const router = useRouter()

  // ----------------------------------------------------------------------------
  // NAVIGATION HANDLERS
  // ----------------------------------------------------------------------------

  /**
   * Navigate to the period detail page.
   * Shows full period information and validation status.
   */
  const handleViewDetails = () => {
    router.push(`/inventory-management/period-end/${period.id}`)
  }

  /**
   * Navigate to the period close workflow page.
   * Only available for open periods.
   */
  const handleStartClose = () => {
    router.push(`/inventory-management/period-end/close/${period.id}`)
  }

  // Select icon based on period status (Lock for closed, Unlock for open)
  const StatusIcon = period.status === 'closed' ? Lock : Unlock

  // ----------------------------------------------------------------------------
  // FEATURED VARIANT (Current Open Period)
  // ----------------------------------------------------------------------------
  // Large prominent card for the current open period
  // Displayed at the top of the Period End list page
  if (isCurrentPeriod) {
    return (
      <Card
        className={cn(
          'border-2 border-primary/20 bg-primary/5',
          className
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            {/* Left side: Calendar icon, period name, and date range */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{period.name}</CardTitle>
                <CardDescription className="text-sm">
                  {format(period.startDate, 'MMMM d, yyyy')} -{' '}
                  {format(period.endDate, 'MMMM d, yyyy')}
                </CardDescription>
              </div>
            </div>
            {/* Right side: Status badge with icon */}
            <Badge className={cn(getPeriodStatusColor(period.status), 'text-sm px-3 py-1')}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {getPeriodStatusLabel(period.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {/* Left side: Notes and status message */}
            <div className="space-y-1">
              {period.notes && (
                <p className="text-sm text-muted-foreground">{period.notes}</p>
              )}
              {period.status === 'open' && (
                <p className="text-sm text-primary font-medium">
                  Active period accepting transactions
                </p>
              )}
            </div>
            {/* Right side: Action buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleViewDetails}>
                View Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              {/* Only show Start Period Close for open periods */}
              {period.status === 'open' && (
                <Button onClick={handleStartClose}>
                  Start Period Close
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ----------------------------------------------------------------------------
  // COMPACT VARIANT (Period History List)
  // ----------------------------------------------------------------------------
  // Smaller card for period history list
  // Shows minimal information with hover effect
  return (
    <Card className={cn('hover:bg-muted/50 transition-colors cursor-pointer', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side: Calendar icon, period name, and abbreviated date range */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{period.name}</p>
              <p className="text-sm text-muted-foreground">
                {format(period.startDate, 'MMM d')} -{' '}
                {format(period.endDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          {/* Right side: Status badge and navigation chevron */}
          <div className="flex items-center gap-3">
            <Badge className={getPeriodStatusColor(period.status)}>
              {getPeriodStatusLabel(period.status)}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation() // Prevent card click if parent has click handler
                handleViewDetails()
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Audit trail for closed periods - shows who closed and when */}
        {period.closedBy && period.closedAt && (
          <div className="mt-2 ml-13 text-xs text-muted-foreground">
            Closed by {period.closedBy} on {format(period.closedAt, 'MMM d, yyyy')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// VALIDATION SUMMARY CARD COMPONENT
// ============================================================================

/**
 * Props for the ValidationSummaryCard component.
 *
 * Receives the aggregate validation results to display
 * a summary of the period close readiness.
 */
interface ValidationSummaryCardProps {
  /**
   * Master flag indicating if all validations pass.
   * Determines the overall styling (green for pass, red for fail).
   */
  allChecksPassed: boolean

  /**
   * Total count of issues across all validation stages.
   * Displayed in the heading when there are failures.
   */
  totalIssueCount: number

  /**
   * Array of summary messages explaining the validation state.
   * Lists each stage's status or identifies specific issues.
   * @example ['All documents posted', '2 spot checks incomplete']
   */
  summaryMessages: string[]
}

/**
 * Displays aggregate validation results summary.
 *
 * This component provides a quick visual summary of the overall
 * validation state at the bottom of the period close checklist.
 *
 * PASS STATE (allChecksPassed=true):
 * - Green border and background
 * - Lock icon indicating ready to close
 * - "All checks passed - Ready to close period" heading
 * - List of summary messages in green
 *
 * FAIL STATE (allChecksPassed=false):
 * - Red border and background
 * - Unlock icon indicating not ready
 * - "Cannot close period - X issues found" heading
 * - List of issue messages in red
 *
 * USAGE:
 * Placed after the ValidationChecklist component on the
 * period close workflow page to show the final decision.
 *
 * @param props - Component props (see ValidationSummaryCardProps)
 * @returns JSX element for the validation summary card
 *
 * @example
 * <ValidationSummaryCard
 *   allChecksPassed={checklist.allChecksPassed}
 *   totalIssueCount={checklist.totalIssueCount}
 *   summaryMessages={checklist.summaryMessages}
 * />
 */
export function ValidationSummaryCard({
  allChecksPassed,
  totalIssueCount,
  summaryMessages,
}: ValidationSummaryCardProps) {
  return (
    <Card
      className={cn(
        'border-2',
        allChecksPassed
          ? 'border-green-200 bg-green-50/50'
          : 'border-red-200 bg-red-50/50'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status icon - Lock for ready, Unlock for not ready */}
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full',
              allChecksPassed ? 'bg-green-100' : 'bg-red-100'
            )}
          >
            {allChecksPassed ? (
              <Lock className="h-5 w-5 text-green-600" />
            ) : (
              <Unlock className="h-5 w-5 text-red-600" />
            )}
          </div>

          {/* Summary content */}
          <div className="flex-1">
            {/* Heading with overall status */}
            <p
              className={cn(
                'font-semibold',
                allChecksPassed ? 'text-green-800' : 'text-red-800'
              )}
            >
              {allChecksPassed
                ? 'All checks passed - Ready to close period'
                : `Cannot close period - ${totalIssueCount} issue${totalIssueCount > 1 ? 's' : ''} found`}
            </p>

            {/* List of summary messages */}
            <ul className="mt-2 space-y-1">
              {summaryMessages.map((message, index) => (
                <li
                  key={index}
                  className={cn(
                    'text-sm flex items-center gap-2',
                    allChecksPassed ? 'text-green-700' : 'text-red-700'
                  )}
                >
                  {/* Bullet point */}
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
