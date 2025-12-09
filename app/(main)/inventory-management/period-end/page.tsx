/**
 * ============================================================================
 * PERIOD END MANAGEMENT PAGE
 * ============================================================================
 *
 * Main landing page for the Period End Process module.
 * This is the entry point for inventory period management, displaying:
 * - The current open period prominently with quick action buttons
 * - A historical table of all closed periods
 * - Information panel explaining period close requirements
 *
 * BUSINESS CONTEXT:
 * Period End is a critical process that locks inventory periods to prevent
 * further transactions. This page serves as the starting point for users
 * to view period status and initiate the close workflow.
 *
 * PAGE LAYOUT:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Header: Title + "Start New Period" button                  │
 * ├─────────────────────────────────────────────────────────────┤
 * │  CURRENT OPEN PERIOD (Featured PeriodSummaryCard)           │
 * │  - Period name and date range                               │
 * │  - View Details / Start Period Close buttons                │
 * ├─────────────────────────────────────────────────────────────┤
 * │  PERIOD HISTORY (Table of closed periods)                   │
 * │  - ID, Name, Dates, Status, Closed By, Closed At, Notes     │
 * │  - Clickable rows navigate to period detail                 │
 * ├─────────────────────────────────────────────────────────────┤
 * │  INFORMATION PANEL                                          │
 * │  - Period close requirements explanation                    │
 * └─────────────────────────────────────────────────────────────┘
 *
 * VALIDATION SEQUENCE (displayed in info panel):
 * 1. Transactions - All documents must be posted/approved
 * 2. Spot Checks - All must be completed
 * 3. Physical Counts - All must be finalized with GL postings
 *
 * NAVIGATION:
 * - "View Details" → /inventory-management/period-end/[id]
 * - "Start Period Close" → /inventory-management/period-end/close/[id]
 * - Row click → /inventory-management/period-end/[id]
 *
 * ============================================================================
 */

'use client'

// ============================================================================
// IMPORTS
// ============================================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, Plus, Lock, AlertCircle } from 'lucide-react'

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PeriodSummaryCard } from './components/period-summary-card'
import {
  mockPeriods,
  getCurrentOpenPeriod,
  getClosedPeriods,
  getPeriodStatusColor,
  getPeriodStatusLabel,
} from '@/lib/mock-data/periods'

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

/**
 * Period End Management list page.
 *
 * This is the main entry point for the Period End module. It displays
 * the current open period and a history of closed periods, allowing
 * users to navigate to detailed views and the close workflow.
 *
 * DATA FLOW:
 * 1. Fetches current open period using getCurrentOpenPeriod()
 * 2. Fetches closed periods using getClosedPeriods()
 * 3. Renders PeriodSummaryCard for current period
 * 4. Renders table for closed periods history
 *
 * BUSINESS RULES:
 * - Only one period can be 'open' at any time
 * - Periods must be closed in chronological order
 * - Once closed, periods cannot accept new transactions
 *
 * @returns JSX element for the Period End Management page
 */
export default function PeriodEndPage() {
  const router = useRouter()

  // ----------------------------------------------------------------------------
  // DATA FETCHING
  // ----------------------------------------------------------------------------

  /**
   * Get the current open period.
   * Returns null if no period is currently open.
   * In a real app, this would be an API call.
   */
  const currentPeriod = getCurrentOpenPeriod()

  /**
   * Get all closed periods for the history table.
   * Returns array of periods with status 'closed'.
   * In a real app, this would be a paginated API call.
   */
  const closedPeriods = getClosedPeriods()

  // ----------------------------------------------------------------------------
  // EVENT HANDLERS
  // ----------------------------------------------------------------------------

  /**
   * Navigate to period detail page when a table row is clicked.
   * Allows users to view full period information and validation status.
   *
   * @param periodId - The ID of the period to view
   */
  const handleRowClick = (periodId: string) => {
    router.push(`/inventory-management/period-end/${periodId}`)
  }

  // ----------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* ====================================================================
          PAGE HEADER
          Title, description, and "Start New Period" action button
          ==================================================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Period End Management</h2>
          <p className="text-muted-foreground">
            Manage inventory period closings and validations
          </p>
        </div>
        {/* Action button to create a new period */}
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Start New Period
        </Button>
      </div>

      {/* ====================================================================
          CURRENT OPEN PERIOD SECTION
          Displays the active period with actions, or empty state if none
          ==================================================================== */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Current Open Period
        </h3>
        {currentPeriod ? (
          /* Featured PeriodSummaryCard for the current open period */
          <PeriodSummaryCard period={currentPeriod} isCurrentPeriod />
        ) : (
          /* Empty state when no period is open */
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-lg font-medium">No Open Period</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start a new period to begin accepting transactions
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Start New Period
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ====================================================================
          PERIOD HISTORY SECTION
          Table showing all closed periods with audit information
          ==================================================================== */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Period History
        </h3>
        <Card>
          <CardHeader>
            <CardTitle>Closed Periods</CardTitle>
            <CardDescription>
              View historical periods and their closing details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {closedPeriods.length === 0 ? (
              /* Empty state when no periods have been closed yet */
              <div className="text-center py-10 text-muted-foreground">
                No closed periods yet
              </div>
            ) : (
              /* Data table with closed periods */
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period ID</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Closed By</TableHead>
                    <TableHead>Closed At</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closedPeriods.map((period) => (
                    <TableRow
                      key={period.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(period.id)}
                    >
                      <TableCell className="font-medium">{period.id}</TableCell>
                      <TableCell>{period.name}</TableCell>
                      <TableCell>{format(period.startDate, 'PP')}</TableCell>
                      <TableCell>{format(period.endDate, 'PP')}</TableCell>
                      <TableCell>
                        <Badge className={getPeriodStatusColor(period.status)}>
                          {getPeriodStatusLabel(period.status)}
                        </Badge>
                      </TableCell>
                      {/* Audit information: who closed and when */}
                      <TableCell>{period.closedBy || '-'}</TableCell>
                      <TableCell>
                        {period.closedAt ? format(period.closedAt, 'PP') : '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {period.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ====================================================================
          INFORMATION PANEL
          Explains the period close requirements (validation sequence)
          This helps users understand what must be completed before closing
          ==================================================================== */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Period Close Requirements</p>
              <p className="text-sm text-muted-foreground">
                Before closing a period, all of the following must be completed:
              </p>
              {/* Validation sequence in the correct order */}
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                <li>
                  <span className="font-medium">Transactions:</span> All documents
                  (GRN, Adjustments, Transfers, etc.) must be posted or approved
                </li>
                <li>
                  <span className="font-medium">Spot Checks:</span> All scheduled
                  spot checks must be completed
                </li>
                <li>
                  <span className="font-medium">Physical Counts:</span> All counts
                  must be finalized with adjustments posted to GL
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
