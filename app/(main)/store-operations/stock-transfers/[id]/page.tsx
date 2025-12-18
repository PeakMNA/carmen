'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  XCircle,
  FileText,
  Send,
  User,
  Calendar,
  MapPin,
  Printer,
  Box
} from 'lucide-react'
import { mockStockTransfers } from '@/lib/mock-data/store-requisitions'
import { TransferStatus, TRANSFER_STATUS_LABELS } from '@/lib/types/store-requisition'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

// Status badge styling
const getStatusBadgeClass = (status: TransferStatus): string => {
  switch (status) {
    case TransferStatus.Received:
      return 'bg-green-100 text-green-800 border-green-200'
    case TransferStatus.Issued:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case TransferStatus.InTransit:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case TransferStatus.Pending:
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case TransferStatus.Cancelled:
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Priority badge
const getPriorityBadgeClass = (priority: string): string => {
  switch (priority) {
    case 'emergency':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'urgent':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'normal':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function StockTransferDetailPage() {
  const params = useParams()
  const router = useRouter()
  const transferId = params.id as string

  // Find the transfer
  const transfer = mockStockTransfers.find(t => t.id === transferId)

  if (!transfer) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-medium">Transfer Not Found</h2>
            <p className="text-muted-foreground mt-1">
              The stock transfer you&apos;re looking for doesn&apos;t exist.
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
    requestedQty: transfer.items.reduce((sum, item) => sum + item.requestedQty, 0),
    issuedQty: transfer.items.reduce((sum, item) => sum + item.issuedQty, 0),
    receivedQty: transfer.items.reduce((sum, item) => sum + item.receivedQty, 0),
    totalValue: transfer.items.reduce((sum, item) => sum + item.totalValue.amount, 0)
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
                <h1 className="text-2xl font-bold">{transfer.refNo}</h1>
                <Badge
                  variant="outline"
                  className={cn("border", getStatusBadgeClass(transfer.status))}
                >
                  {TRANSFER_STATUS_LABELS[transfer.status]}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("border capitalize", getPriorityBadgeClass(transfer.priority))}
                >
                  {transfer.priority}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Stock Transfer &bull; {transfer.transferDate.toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {transfer.status === TransferStatus.Pending && (
            <Button size="sm">
              <Send className="h-4 w-4 mr-2" />
              Issue Transfer
            </Button>
          )}
          {transfer.status === TransferStatus.InTransit && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Receipt
            </Button>
          )}
        </div>
      </div>

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
                <div className="font-semibold">{transfer.fromLocationName}</div>
                <div className="text-sm text-muted-foreground">{transfer.fromLocationCode}</div>
              </div>
            </div>
            {transfer.issuedAt && (
              <div className="mt-4 pt-4 border-t text-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Send className="h-4 w-4" />
                  Issued
                </div>
                <div>{transfer.issuedAt.toLocaleString('en-GB')}</div>
                <div className="text-muted-foreground">{transfer.issuedBy}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transfer Arrow */}
        <Card>
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <ArrowRight className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{transfer.totalItems}</div>
              <div className="text-sm text-muted-foreground">Items</div>
              <div className="text-lg font-semibold mt-2">{formatCurrency(transfer.totalValue.amount)}</div>
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
                <div className="font-semibold">{transfer.toLocationName}</div>
                <div className="text-sm text-muted-foreground">{transfer.toLocationCode}</div>
              </div>
            </div>
            {transfer.receivedAt && (
              <div className="mt-4 pt-4 border-t text-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Received
                </div>
                <div>{transfer.receivedAt.toLocaleString('en-GB')}</div>
                <div className="text-muted-foreground">{transfer.receivedBy}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Source Requisition */}
      {transfer.sourceRequisitionRefNo && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Source Requisition</div>
                  <div className="font-medium">{transfer.sourceRequisitionRefNo}</div>
                </div>
              </div>
              <Link href={`/store-operations/store-requisitions/${transfer.sourceRequisitionId}`}>
                <Button variant="outline" size="sm">
                  View Requisition
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

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
                <TableHead className="text-right">Issued</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfer.items.map((item) => (
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
                    {item.issuedQty > 0 ? formatNumber(item.issuedQty) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.receivedQty > 0 ? (
                      <span className={cn(
                        item.receivedQty < item.issuedQty ? 'text-orange-600' : 'text-green-600'
                      )}>
                        {formatNumber(item.receivedQty)}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(item.unitCost.amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(item.totalValue.amount)}
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
                  {formatNumber(totals.issuedQty)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(totals.receivedQty)}
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
      {transfer.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{transfer.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Audit Info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Created by {transfer.createdBy}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {transfer.createdAt.toLocaleString('en-GB')}
            </div>
            {transfer.updatedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Updated {transfer.updatedAt.toLocaleString('en-GB')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
