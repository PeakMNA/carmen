/**
 * Stock Transfer Detail Page
 *
 * KEY ARCHITECTURE: Stock Transfers are NOT separate documents.
 * This page displays a FILTERED VIEW of a Store Requisition at the Issue/Complete
 * stage with an INVENTORY type destination.
 *
 * View Criteria:
 * - SR stage = 'issue' OR 'complete'
 * - destinationLocationType = 'INVENTORY'
 *
 * This is a READ-ONLY view displaying SR data in a "transfer" layout.
 * All actions (approve, issue, complete, cancel) are performed on the
 * underlying Store Requisition, accessed via the "View Full SR" button.
 *
 * Data Loading:
 * - Uses getStoreRequisitionForStockTransferById(id) which:
 *   1. Finds SR by ID in mockStoreRequisitions
 *   2. Validates it matches stock transfer criteria (stage + destination type)
 *   3. Returns null if not found or doesn't match criteria
 *
 * Display Sections:
 * - Header: SR reference, status, stage badges, navigation
 * - Info Banner: Explains this is a view of an SR
 * - Location Cards: Source and destination with issue/complete timestamps
 * - Request Info: Requester, department, dates
 * - Items Table: Product details with requested/approved/issued quantities
 * - Notes: Optional SR notes
 * - Audit Info: Created/updated timestamps
 *
 * Navigation:
 * - Back → Stock Transfers list
 * - View Full SR → Store Requisition detail page for actions
 *
 * @see docs/app/store-operations/stock-transfers/FD-stock-transfers.md
 * @see docs/app/store-operations/stock-transfers/DS-stock-transfers.md
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
  Truck,
  ChevronLeft,
  Package,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  User,
  Calendar,
  MapPin,
  Printer,
  Box,
  Info,
  ExternalLink
} from 'lucide-react'
import { getStoreRequisitionForStockTransferById } from '@/lib/mock-data/store-requisitions'
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

export default function StockTransferDetailPage() {
  const params = useParams()
  const router = useRouter()
  const transferId = params.id as string

  // Find the SR that matches stock transfer criteria
  const sr = getStoreRequisitionForStockTransferById(transferId)

  if (!sr) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-medium">Transfer Not Found</h2>
            <p className="text-muted-foreground mt-1">
              The stock transfer you&apos;re looking for doesn&apos;t exist or is not at the Issue stage.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/store-operations/stock-transfers')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Transfers
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
              onClick={() => router.push('/store-operations/stock-transfers')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
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
                Stock Transfer View &bull; {sr.requestDate.toLocaleDateString('en-GB')}
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">This is a Stock Transfer view of Store Requisition {sr.refNo}</p>
            <p className="mt-1 text-blue-600">
              Stock Transfers show SRs at the Issue stage with INVENTORY destinations.
              To manage this transfer, use the Store Requisition detail page.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            {sr.issuedAt && (
              <div className="mt-4 pt-4 border-t text-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Send className="h-4 w-4" />
                  Issued
                </div>
                <div>{sr.issuedAt.toLocaleString('en-GB')}</div>
                <div className="text-muted-foreground">{sr.issuedBy}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transfer Arrow */}
        <Card>
          <CardContent className="flex items-center justify-center h-full py-6">
            <div className="text-center">
              <ArrowRight className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{sr.totalItems}</div>
              <div className="text-sm text-muted-foreground">Items</div>
              <div className="text-lg font-semibold mt-2">{formatCurrency(sr.estimatedValue.amount)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </CardContent>
        </Card>

        {/* To Location */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">To Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">{sr.destinationLocationName}</div>
                <div className="text-sm text-muted-foreground">{sr.destinationLocationCode}</div>
              </div>
            </div>
            {sr.completedAt && (
              <div className="mt-4 pt-4 border-t text-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </div>
                <div>{sr.completedAt.toLocaleString('en-GB')}</div>
                <div className="text-muted-foreground">{sr.completedBy}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Info */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Requested By</div>
              <div className="font-medium">{sr.requestedBy}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Department</div>
              <div className="font-medium">{sr.departmentName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Request Date</div>
              <div className="font-medium">{sr.requestDate.toLocaleDateString('en-GB')}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Required Date</div>
              <div className="font-medium">{sr.requiredDate.toLocaleDateString('en-GB')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Transfer Items
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
