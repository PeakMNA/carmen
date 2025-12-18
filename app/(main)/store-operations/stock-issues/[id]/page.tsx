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
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  MapPin,
  Printer,
  Box,
  DollarSign,
  Building2,
  Send
} from 'lucide-react'
import { mockStockIssues } from '@/lib/mock-data/store-requisitions'
import { IssueStatus, ISSUE_STATUS_LABELS } from '@/lib/types/store-requisition'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

// Status badge styling
const getStatusBadgeClass = (status: IssueStatus): string => {
  switch (status) {
    case IssueStatus.Issued:
      return 'bg-green-100 text-green-800 border-green-200'
    case IssueStatus.Pending:
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case IssueStatus.Cancelled:
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function StockIssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const issueId = params.id as string

  // Find the issue
  const issue = mockStockIssues.find(i => i.id === issueId)

  if (!issue) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-medium">Stock Issue Not Found</h2>
            <p className="text-muted-foreground mt-1">
              The stock issue you&apos;re looking for doesn&apos;t exist.
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
    requestedQty: issue.items.reduce((sum, item) => sum + item.requestedQty, 0),
    issuedQty: issue.items.reduce((sum, item) => sum + item.issuedQty, 0),
    totalValue: issue.items.reduce((sum, item) => sum + item.totalValue.amount, 0)
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
                <h1 className="text-2xl font-bold">{issue.refNo}</h1>
                <Badge
                  variant="outline"
                  className={cn("border", getStatusBadgeClass(issue.status))}
                >
                  {ISSUE_STATUS_LABELS[issue.status]}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Stock Issue &bull; {issue.issueDate.toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {issue.status === IssueStatus.Pending && (
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Send className="h-4 w-4 mr-2" />
              Issue Stock
            </Button>
          )}
        </div>
      </div>

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
                <div className="font-semibold">{issue.fromLocationName}</div>
                <div className="text-sm text-muted-foreground">{issue.fromLocationCode}</div>
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
                <div className="font-semibold">{issue.toLocationName}</div>
                <div className="text-sm text-muted-foreground">{issue.toLocationCode}</div>
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
                <div className="font-semibold">{issue.departmentName}</div>
                <div className="text-sm text-muted-foreground">{issue.departmentId}</div>
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
                <div className="font-semibold">{issue.expenseAccountName}</div>
                <div className="text-sm text-muted-foreground">{issue.expenseAccountId}</div>
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
              <div className="text-3xl font-bold">{issue.totalItems}</div>
              <div className="text-sm text-muted-foreground">Items</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{formatNumber(issue.totalQuantity)}</div>
              <div className="text-sm text-muted-foreground">Total Quantity</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{formatCurrency(issue.totalValue.amount)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Requisition */}
      {issue.sourceRequisitionRefNo && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Source Requisition</div>
                  <div className="font-medium">{issue.sourceRequisitionRefNo}</div>
                </div>
              </div>
              <Link href={`/store-operations/store-requisitions/${issue.sourceRequisitionId}`}>
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
                <TableHead className="text-right">Issued</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issue.items.map((item) => (
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
                    {item.issuedQty > 0 ? (
                      <span className={cn(
                        item.issuedQty < item.requestedQty ? 'text-orange-600' : 'text-green-600'
                      )}>
                        {formatNumber(item.issuedQty)}
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
      {issue.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{issue.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Issue Info */}
      {issue.issuedAt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Issue Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Issued by {issue.issuedBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{issue.issuedAt.toLocaleString('en-GB')}</span>
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
              Created by {issue.createdBy}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {issue.createdAt.toLocaleString('en-GB')}
            </div>
            {issue.updatedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Updated {issue.updatedAt.toLocaleString('en-GB')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
