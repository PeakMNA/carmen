/**
 * Review Decision Component
 *
 * Component for managers to review and approve/reject wastage reports.
 * Shows when the report is in Submitted or Under Review status.
 *
 * Features:
 * - Review notes textarea
 * - Approve/Reject buttons
 * - Displays previous review decision if rejected and resubmitted
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react'
import type { WastageReport, WastageReviewDecision } from '@/lib/types/wastage'

interface ReviewDecisionProps {
  report: WastageReport
  onApprove: (notes: string) => Promise<void> | void
  onReject: (notes: string) => Promise<void> | void
  isLoading?: boolean
}

export function ReviewDecision({
  report,
  onApprove,
  onReject,
  isLoading = false,
}: ReviewDecisionProps) {
  const [reviewNotes, setReviewNotes] = useState('')
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      await onApprove(reviewNotes)
      setShowApproveDialog(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    try {
      await onReject(reviewNotes)
      setShowRejectDialog(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show previous rejection notes if this is a resubmission
  const showPreviousRejection =
    report.reviewDecision === 'rejected' && report.reviewNotes

  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-yellow-600" />
          Review Decision
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Previous rejection info */}
        {showPreviousRejection && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 text-sm font-medium mb-1">
              <AlertTriangle className="h-4 w-4" />
              Previously Rejected
            </div>
            <p className="text-sm text-red-600">
              By {report.reviewedByName} on{' '}
              {report.reviewedAt
                ? new Date(report.reviewedAt).toLocaleDateString()
                : 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              "{report.reviewNotes}"
            </p>
          </div>
        )}

        {/* Report summary for quick reference */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Loss Value:</span>
          <span className="font-bold text-red-600">
            ${report.totalValue.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Items:</span>
          <span className="font-medium">{report.totalItems}</span>
        </div>

        <Separator />

        {/* Review notes */}
        <div className="space-y-2">
          <Label htmlFor="review-notes">Review Notes</Label>
          <Textarea
            id="review-notes"
            placeholder="Add notes about your decision (optional for approval, required for rejection)..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={3}
            disabled={isLoading || isSubmitting}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setShowRejectDialog(true)}
            disabled={isLoading || isSubmitting || !reviewNotes.trim()}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => setShowApproveDialog(true)}
            disabled={isLoading || isSubmitting}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </div>

        {!reviewNotes.trim() && (
          <p className="text-xs text-muted-foreground text-center">
            Notes are required to reject a report
          </p>
        )}
      </CardContent>

      {/* Approve confirmation dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Approve Wastage Report
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this wastage report? Once
              approved, it can be posted to inventory as a Stock Out adjustment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Report:</span>{' '}
                {report.reportNumber}
              </p>
              <p>
                <span className="text-muted-foreground">Total Loss:</span>{' '}
                <span className="font-bold text-red-600">
                  ${report.totalValue.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject confirmation dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Wastage Report
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this wastage report? The creator
              will be notified and can revise and resubmit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Report:</span>{' '}
                {report.reportNumber}
              </p>
              <p>
                <span className="text-muted-foreground">Rejection Reason:</span>
              </p>
              <p className="italic">"{reviewNotes}"</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

/**
 * Review Status Display Component
 *
 * Shows the review decision status (for approved or rejected reports)
 */
interface ReviewStatusDisplayProps {
  report: WastageReport
}

export function ReviewStatusDisplay({ report }: ReviewStatusDisplayProps) {
  if (!report.reviewDecision) return null

  const isApproved = report.reviewDecision === 'approved'

  return (
    <Card
      className={
        isApproved
          ? 'border-green-200 bg-green-50/50'
          : 'border-red-200 bg-red-50/50'
      }
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          {isApproved ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          <div className="flex-1">
            <p
              className={`font-medium ${
                isApproved ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {isApproved ? 'Approved' : 'Rejected'} by {report.reviewedByName}
            </p>
            <p className="text-sm text-muted-foreground">
              {report.reviewedAt
                ? new Date(report.reviewedAt).toLocaleString()
                : 'N/A'}
            </p>
            {report.reviewNotes && (
              <p className="text-sm mt-2 text-muted-foreground">
                "{report.reviewNotes}"
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
