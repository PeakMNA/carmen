/**
 * ============================================================================
 * PERIOD END DETAIL PAGE
 * ============================================================================
 *
 * Displays detailed information about a specific inventory period.
 * This page serves as a comprehensive view of a period's status,
 * validation results, and financial adjustments.
 *
 * BUSINESS CONTEXT:
 * After a period is closed, users need to view historical data about
 * that period including the validation state at close time and any
 * inventory adjustments that were posted. For open periods, this page
 * provides a quick status overview before starting the close workflow.
 *
 * PAGE LAYOUT:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  ← Back | Page Title: "[Month Year]" | Status Badge        │
 * │  📅 Date Range                    [Cancel] [Start Close]   │
 * ├─────────────────────────────────────────────────────────────┤
 * │  ┌──────────────────────┐  ┌──────────────────────┐        │
 * │  │  PERIOD INFORMATION  │  │  VALIDATION STATUS   │        │
 * │  │  ─────────────────── │  │  ─────────────────── │        │
 * │  │  Period ID: PE-...   │  │  1. Transactions ✓/✗ │        │
 * │  │  Start Date: ...     │  │  2. Spot Checks ✓/✗  │        │
 * │  │  End Date: ...       │  │  3. Physical Counts  │        │
 * │  │  Status: Open/Closed │  │     ✓/✗              │        │
 * │  │  Closed By: ...      │  │                      │        │
 * │  │  Closed At: ...      │  │  [View Full Details] │        │
 * │  │  Notes: ...          │  │  (for open periods)  │        │
 * │  └──────────────────────┘  └──────────────────────┘        │
 * ├─────────────────────────────────────────────────────────────┤
 * │  [Adjustments Tab]                                          │
 * │  ┌─────────────────────────────────────────────────────────┐│
 * │  │ ID    │ Type          │ Amount  │ Reason  │ Status  ...││
 * │  │ ADJ-01│ Count Variance│ -$1,250 │ ...     │ Posted   ..││
 * │  │ ADJ-02│ Damaged Goods │  -$750  │ ...     │ Posted   ..││
 * │  └─────────────────────────────────────────────────────────┘│
 * └─────────────────────────────────────────────────────────────┘
 *
 * FEATURES:
 * - Period metadata display (ID, dates, status, audit info)
 * - Quick validation status overview with pass/fail indicators
 * - Link to full close workflow for open periods
 * - Historical view for closed periods (read-only)
 * - Adjustments table with financial details (amount, reason, status)
 *
 * CONDITIONAL BEHAVIOR:
 * - Open periods: Show "Start Period Close" button, validation may be failing
 * - Closed periods: Hide action buttons, show audit info (closedBy, closedAt)
 * - Not found: Show error card with navigation back
 *
 * NAVIGATION:
 * - Back button → /inventory-management/period-end
 * - "Start Period Close" → /inventory-management/period-end/close/[id]
 * - "View Full Validation Details" → /inventory-management/period-end/close/[id]
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
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Lock,
  AlertTriangle,
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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getPeriodById,
  getPeriodStatusColor,
  getPeriodStatusLabel,
  generateFailingChecklist,
  generatePassingChecklist,
} from '@/lib/mock-data/periods'
import type { PeriodCloseChecklist } from '@/lib/types/period-end'

// ============================================================================
// MOCK ADJUSTMENTS DATA
// ============================================================================

/**
 * Interface for period adjustment records.
 *
 * Adjustments represent inventory value changes posted during a period,
 * typically from physical counts, spot checks, or write-offs.
 *
 * ADJUSTMENT TYPES:
 * - Physical Count Variance: Difference between system and actual count
 * - Damaged Goods Write-off: Value reduction for damaged inventory
 * - Spot Check Variance: Discrepancy found during routine spot checks
 * - Shrinkage: Unexplained inventory loss
 *
 * All adjustments affect the inventory value and are posted to the
 * General Ledger for financial reporting accuracy.
 */
interface PeriodAdjustment {
  /** Unique adjustment identifier (e.g., 'ADJ-001') */
  id: string

  /** Type of adjustment (e.g., 'Physical Count Variance') */
  type: string

  /** Financial amount (negative for decreases, positive for increases) */
  amount: number

  /** Explanation for the adjustment */
  reason: string

  /** Current status ('Draft', 'Pending', 'Posted') */
  status: string

  /** User who created the adjustment */
  createdBy: string

  /** When the adjustment was created */
  createdAt: Date
}

/**
 * Mock adjustment data for demonstration.
 *
 * In a real application, this would be fetched from the API
 * based on the period ID. The data shows typical adjustment
 * scenarios including count variances and write-offs.
 */
const mockAdjustments: PeriodAdjustment[] = [
  {
    id: 'ADJ-001',
    type: 'Physical Count Variance',
    amount: -1250.75,
    reason: 'Count discrepancy in main warehouse',
    status: 'Posted',
    createdBy: 'John Doe',
    createdAt: new Date(2024, 1, 26),
  },
  {
    id: 'ADJ-002',
    type: 'Damaged Goods Write-off',
    amount: -750.0,
    reason: 'Storm damage to storage area',
    status: 'Posted',
    createdBy: 'Jane Smith',
    createdAt: new Date(2024, 1, 24),
  },
  {
    id: 'ADJ-003',
    type: 'Spot Check Variance',
    amount: 125.5,
    reason: 'Additional items found during spot check',
    status: 'Posted',
    createdBy: 'Mike Johnson',
    createdAt: new Date(2024, 1, 22),
  },
]

// ============================================================================
// VALIDATION STATUS CARD COMPONENT
// ============================================================================

/**
 * Props for the ValidationStatusCard component.
 *
 * This component displays a compact validation status indicator
 * for each of the three validation stages in the detail view.
 */
interface ValidationStatusCardProps {
  /** Title of the validation stage (e.g., "1. Transactions") */
  title: string

  /** Icon element to display (color matches isValid state) */
  icon: React.ReactNode

  /** Whether this validation stage passes */
  isValid: boolean

  /** Count of failing items (for display purposes) */
  count: number

  /** Description text explaining the validation state */
  description: string
}

/**
 * Displays a compact validation status card.
 *
 * Used in the detail page to show a quick overview of each
 * validation stage's status. The card styling changes based
 * on the isValid prop (green for pass, red for fail).
 *
 * VISUAL DESIGN:
 * - Left: Icon in colored circular background
 * - Center: Title with description below
 * - Right: CheckCircle2 (green) or XCircle (red)
 *
 * @param props - Component props (see ValidationStatusCardProps)
 * @returns JSX element for the validation status card
 *
 * @example
 * <ValidationStatusCard
 *   title="1. Transactions"
 *   icon={<FileText className="h-5 w-5 text-green-600" />}
 *   isValid={true}
 *   count={0}
 *   description="All documents posted"
 * />
 */
function ValidationStatusCard({
  title,
  icon,
  isValid,
  count,
  description,
}: ValidationStatusCardProps) {
  return (
    <Card className={cn(isValid ? 'border-green-200' : 'border-red-200')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon in colored circular background */}
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full',
              isValid ? 'bg-green-100' : 'bg-red-100'
            )}
          >
            {icon}
          </div>
          <div className="flex-1">
            {/* Title with pass/fail indicator */}
            <div className="flex items-center justify-between">
              <p className="font-medium">{title}</p>
              {isValid ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            {/* Description explaining the status */}
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

/**
 * Period End detail page.
 *
 * Displays comprehensive information about a specific inventory period
 * including metadata, validation status, and adjustments.
 *
 * The page adapts its display based on period status:
 * - Open periods: Show action buttons, current validation state
 * - Closed periods: Show historical data, audit information
 *
 * COMPONENT PROPS:
 * Uses Next.js 14 App Router pattern where params is a plain object
 * containing the route parameters.
 *
 * DATA FLOW:
 * 1. Unwrap params to get period ID
 * 2. Fetch period data by ID
 * 3. Generate appropriate checklist (passing for closed, failing for open)
 * 4. Render period info, validation status, and adjustments
 *
 * @param props - Component props containing route params
 * @returns JSX element for the period detail page
 */
export default function PeriodEndDetailPage({
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
   * The validation checklist for this period.
   * Shows validation state at time of viewing (or at close for closed periods).
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
  // CHECKLIST INITIALIZATION EFFECT
  // ----------------------------------------------------------------------------

  /**
   * Initialize the validation checklist based on period status.
   *
   * For closed periods: Show passing checklist (frozen at close time)
   * For open periods: Show current validation state (may be failing)
   *
   * In a real app, this would fetch the actual validation state
   * from the server, potentially from a snapshot for closed periods.
   */
  useEffect(() => {
    if (period) {
      // For closed periods, show passing checklist
      // For open periods, show current validation state
      if (period.status === 'closed') {
        setChecklist(generatePassingChecklist(period.id))
      } else {
        setChecklist(generateFailingChecklist(period.id))
      }
    }
  }, [period])

  // ----------------------------------------------------------------------------
  // ERROR STATE: Period Not Found
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

  // ----------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* ====================================================================
          PAGE HEADER
          Back button, title with period name, status badge, date range,
          and action buttons (for open periods only)
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
              Period End - {period.name}
            </h2>
            {/* Status badge with color coding */}
            <Badge className={cn(getPeriodStatusColor(period.status), 'ml-2')}>
              {getPeriodStatusLabel(period.status)}
            </Badge>
          </div>
          {/* Period date range */}
          <p className="text-muted-foreground ml-10">
            {format(period.startDate, 'MMMM d, yyyy')} -{' '}
            {format(period.endDate, 'MMMM d, yyyy')}
          </p>
        </div>
        {/* Action buttons - only shown for open periods */}
        <div className="flex items-center gap-2">
          {period.status === 'open' && (
            <>
              <Button variant="outline">Cancel Period End</Button>
              <Button
                onClick={() =>
                  router.push(`/inventory-management/period-end/close/${period.id}`)
                }
              >
                <Lock className="mr-2 h-4 w-4" />
                Start Period Close
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ====================================================================
          MAIN CONTENT GRID
          Two-column layout on large screens:
          - Left: Period Information Card
          - Right: Validation Status Overview
          ==================================================================== */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* ================================================================
            PERIOD INFORMATION CARD
            Displays period metadata: ID, dates, status, and audit info
            ================================================================ */}
        <Card>
          <CardHeader>
            <CardTitle>Period Information</CardTitle>
            <CardDescription>
              Details about this inventory period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Period ID */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Period ID</span>
              <span className="font-medium">{period.id}</span>
            </div>
            {/* Start Date */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">
                {format(period.startDate, 'MMMM d, yyyy')}
              </span>
            </div>
            {/* End Date */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">
                {format(period.endDate, 'MMMM d, yyyy')}
              </span>
            </div>
            {/* Status */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Status</span>
              <Badge className={getPeriodStatusColor(period.status)}>
                {getPeriodStatusLabel(period.status)}
              </Badge>
            </div>
            {/* Audit info: Closed By (only for closed periods) */}
            {period.closedBy && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Closed By</span>
                <span className="font-medium">{period.closedBy}</span>
              </div>
            )}
            {/* Audit info: Closed At (only for closed periods) */}
            {period.closedAt && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Closed At</span>
                <span className="font-medium">
                  {format(period.closedAt, 'MMMM d, yyyy h:mm a')}
                </span>
              </div>
            )}
            {/* Optional notes */}
            {period.notes && (
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Notes</span>
                <span className="font-medium">{period.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ================================================================
            VALIDATION STATUS OVERVIEW CARD
            Shows quick status of three validation stages:
            1. Transactions, 2. Spot Checks, 3. Physical Counts
            ================================================================ */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Status</CardTitle>
            <CardDescription>
              Pre-close validation requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist && (
              <>
                {/* Stage 1: Transactions Validation */}
                <ValidationStatusCard
                  title="1. Transactions"
                  icon={
                    <FileText
                      className={cn(
                        'h-5 w-5',
                        checklist.transactionsCommitted
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    />
                  }
                  isValid={checklist.transactionsCommitted}
                  count={checklist.pendingTransactionCount}
                  description={
                    checklist.transactionsCommitted
                      ? 'All documents posted'
                      : `${checklist.pendingTransactionCount} document(s) pending`
                  }
                />
                {/* Stage 2: Spot Checks Validation */}
                <ValidationStatusCard
                  title="2. Spot Checks"
                  icon={
                    <ClipboardCheck
                      className={cn(
                        'h-5 w-5',
                        checklist.spotChecksComplete
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    />
                  }
                  isValid={checklist.spotChecksComplete}
                  count={checklist.incompleteSpotCheckCount}
                  description={
                    checklist.spotChecksComplete
                      ? 'All spot checks completed'
                      : `${checklist.incompleteSpotCheckCount} spot check(s) pending`
                  }
                />
                {/* Stage 3: Physical Counts Validation */}
                <ValidationStatusCard
                  title="3. Physical Counts"
                  icon={
                    <Package
                      className={cn(
                        'h-5 w-5',
                        checklist.physicalCountsFinalized
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    />
                  }
                  isValid={checklist.physicalCountsFinalized}
                  count={checklist.pendingPhysicalCountCount}
                  description={
                    checklist.physicalCountsFinalized
                      ? 'All counts finalized'
                      : `${checklist.pendingPhysicalCountCount} count(s) pending`
                  }
                />
              </>
            )}

            {/* Link to full validation details (open periods only) */}
            {period.status === 'open' && (
              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={() =>
                  router.push(`/inventory-management/period-end/close/${period.id}`)
                }
              >
                View Full Validation Details
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ====================================================================
          ADJUSTMENTS SECTION
          Tab-based view for period adjustments (currently single tab)
          Shows all inventory adjustments made during the period
          ==================================================================== */}
      <Tabs defaultValue="adjustments" className="w-full">
        <TabsList>
          <TabsTrigger value="adjustments" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Adjustments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="adjustments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Period End Adjustments</CardTitle>
              <CardDescription>
                View all inventory adjustments made during this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Adjustments data table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAdjustments.map((adjustment) => (
                    <TableRow key={adjustment.id}>
                      {/* Adjustment ID */}
                      <TableCell className="font-medium">
                        {adjustment.id}
                      </TableCell>
                      {/* Adjustment Type */}
                      <TableCell>{adjustment.type}</TableCell>
                      {/* Amount with color coding (red for negative, green for positive) */}
                      <TableCell
                        className={cn(
                          'text-right font-medium',
                          adjustment.amount < 0
                            ? 'text-red-600'
                            : 'text-green-600'
                        )}
                      >
                        {adjustment.amount.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </TableCell>
                      {/* Reason for adjustment */}
                      <TableCell>{adjustment.reason}</TableCell>
                      {/* Status badge */}
                      <TableCell>
                        <Badge
                          variant={
                            adjustment.status === 'Posted'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {adjustment.status}
                        </Badge>
                      </TableCell>
                      {/* Created By (audit) */}
                      <TableCell>{adjustment.createdBy}</TableCell>
                      {/* Created At (audit) */}
                      <TableCell>
                        {format(adjustment.createdAt, 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
