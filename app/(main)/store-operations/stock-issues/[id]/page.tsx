/**
 * Stock Issue Detail Page
 *
 * KEY ARCHITECTURE: Stock Issues are NOT separate documents.
 * This page displays a FILTERED VIEW of a Store Requisition at the Issue/Complete
 * stage with a DIRECT type destination (expense/direct location).
 *
 * View Criteria:
 * - SR stage = 'issue' OR 'complete'
 * - destinationLocationType = 'DIRECT'
 *
 * This is a READ-ONLY view displaying SR data in an "issue" layout with
 * expense allocation details. All actions (approve, issue, complete, cancel)
 * are performed on the underlying Store Requisition via "View Full SR" button.
 *
 * Key Differences from Stock Transfer Detail:
 * - Shows DIRECT destination (expense location) vs INVENTORY
 * - Includes Department card (required for expense allocation)
 * - Includes Expense Account card
 * - Purple color scheme vs blue for transfers
 *
 * Data Loading:
 * - Uses getStoreRequisitionForStockIssueById(id) which:
 *   1. Finds SR by ID in mockStoreRequisitions
 *   2. Validates it matches stock issue criteria (stage + destination type)
 *   3. Returns null if not found or doesn't match criteria
 *
 * Display Sections:
 * - Header: SR reference, status, stage badges, navigation
 * - Info Banner: Explains this is a view of an SR
 * - Location Cards: Source location, destination (DIRECT), department, expense account
 * - Summary Card: Total items, quantity, value
 * - Request Info: Requester, dates, issue date
 * - Items Table: Product details with requested/approved/issued quantities
 * - Notes: Optional SR notes
 * - Issue Info: When issued, by whom
 * - Completion Info: When completed, by whom (if applicable)
 * - Audit Info: Created/updated timestamps
 *
 * Navigation:
 * - Back → Stock Issues list
 * - View Full SR → Store Requisition detail page for actions
 *
 * @see docs/app/store-operations/stock-issues/FD-stock-issues.md
 * @see docs/app/store-operations/stock-issues/DS-stock-issues.md
 * @see docs/app/store-operations/sr-business-rules.md
 */
'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Package,
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Calendar,
  MapPin,
  Printer,
  Box,
  DollarSign,
  Building2,
  Send,
  Info,
  ExternalLink
} from 'lucide-react'
import { getStoreRequisitionForStockIssueById } from '@/lib/mock-data/store-requisitions'
import { SRStatus, SR_STATUS_LABELS, SRStage, SR_STAGE_LABELS } from '@/lib/types/store-requisition'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

// Status badge styling for SR status
const getStatusBadgeClass = (status: SRStatus): string => {
  switch (status) {
    case SRStatus.InProgress:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case SRStatus.Completed:
      return 'bg-green-100 text-green-800 border-green-200'
    case SRStatus.Draft:
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case SRStatus.Cancelled:
      return 'bg-red-100 text-red-800 border-red-200'
    case SRStatus.Voided:
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Stage badge styling
const getStageBadgeClass = (stage: SRStage): string => {
  switch (stage) {
    case SRStage.Issue:
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case SRStage.Complete:
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function StockIssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const issueId = params.id as string

  // Find the SR that matches stock issue criteria
  const sr = getStoreRequisitionForStockIssueById(issueId)

  if (!sr) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-medium">Stock Issue Not Found</h2>
            <p className="text-muted-foreground mt-1">
              The stock issue you&apos;re looking for doesn&apos;t exist or is not at the Issue stage.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/store-operations/stock-issues')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Issues
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate totals
  const totals = {
    requestedQty: sr.items.reduce((sum, item) => sum + item.requestedQty, 0),
    approvedQty: sr.items.reduce((sum, item) => sum + item.approvedQty, 0),
    issuedQty: sr.items.reduce((sum, item) => sum + item.issuedQty, 0),
    totalValue: sr.items.reduce((sum, item) => sum + item.totalCost, 0)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/store-operations/stock-issues')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{sr.refNo}</h1>
                <Badge
                  variant="outline"
                  className={cn("border", getStatusBadgeClass(sr.status))}
                >
                  {SR_STATUS_LABELS[sr.status]}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("border", getStageBadgeClass(sr.stage))}
                >
                  Stage: {SR_STAGE_LABELS[sr.stage]}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Stock Issue View &bull; {sr.requestDate.toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Link href={`/store-operations/store-requisitions/${sr.id}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full SR
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-purple-600 mt-0.5" />
          <div className="text-sm text-purple-800">
            <p className="font-medium">This is a Stock Issue view of Store Requisition {sr.refNo}</p>
            <p className="mt-1 text-purple-600">
              Stock Issues show SRs at the Issue stage with DIRECT destinations (expense locations).
              To manage this issue, use the Store Requisition detail page.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* From Location */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">From Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold">{sr.sourceLocationName}</div>
                <div className="text-sm text-muted-foreground">{sr.sourceLocationCode}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* To Location */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">To Location (Direct)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold">{sr.destinationLocationName}</div>
                <div className="text-sm text-muted-foreground">{sr.destinationLocationCode}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">{sr.departmentName}</div>
                <div className="text-sm text-muted-foreground">{sr.departmentId}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Account */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expense Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">{sr.expenseAccountName || 'Default'}</div>
                <div className="text-sm text-muted-foreground">{sr.expenseAccountId || 'From department'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">{sr.totalItems}</div>
              <div className="text-sm text-muted-foreground">Items</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{formatNumber(sr.totalQuantity)}</div>
              <div className="text-sm text-muted-foreground">Total Quantity</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{formatCurrency(sr.estimatedValue.amount)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Info */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Requested By</div>
              <div className="font-medium">{sr.requestedBy}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Request Date</div>
              <div className="font-medium">{sr.requestDate.toLocaleDateString('en-GB')}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Required Date</div>
              <div className="font-medium">{sr.requiredDate.toLocaleDateString('en-GB')}</div>
            </div>
            {sr.issuedAt && (
              <div>
                <div className="text-sm text-muted-foreground">Issued Date</div>
                <div className="font-medium">{sr.issuedAt.toLocaleDateString('en-GB')}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Issue Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Product</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Requested</TableHead>
                <TableHead className="text-right">Approved</TableHead>
                <TableHead className="text-right">Issued</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sr.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-muted-foreground">{item.productCode}</div>
                    </div>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(item.requestedQty)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.approvedQty > 0 ? formatNumber(item.approvedQty) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.issuedQty > 0 ? (
                      <span className={cn(
                        item.issuedQty < item.approvedQty ? 'text-orange-600' : 'text-green-600'
                      )}>
                        {formatNumber(item.issuedQty)}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(item.unitCost)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(item.totalCost)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-gray-50 font-medium">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(totals.requestedQty)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(totals.approvedQty)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(totals.issuedQty)}
                </TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(totals.totalValue)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes */}
      {sr.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{sr.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Issue Info */}
      {sr.issuedAt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Issue Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                <span>Issued by {sr.issuedBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{sr.issuedAt.toLocaleString('en-GB')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Info */}
      {sr.completedAt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completion Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Completed by {sr.completedBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{sr.completedAt.toLocaleString('en-GB')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Created by {sr.createdBy}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {sr.createdAt.toLocaleString('en-GB')}
            </div>
            {sr.updatedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Updated {sr.updatedAt.toLocaleString('en-GB')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
