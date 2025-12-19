'use client'

/**
 * Stock Transfers List Page
 *
 * KEY ARCHITECTURE: Stock Transfers are NOT separate documents.
 * They are FILTERED VIEWS of Store Requisitions at the Issue/Complete stage
 * with INVENTORY type destinations.
 *
 * Filter Criteria:
 * - SR stage = 'issue' OR 'complete'
 * - destinationLocationType = 'INVENTORY'
 *
 * This is a READ-ONLY view. All actions (approve, issue, complete) are
 * performed on the underlying Store Requisition, not on this view.
 *
 * Navigation:
 * - Row click → navigates to Store Requisition detail page (not a separate ST detail)
 * - "Go to Store Requisitions" → navigates to SR module for creating new transfers
 *
 * Data Source:
 * - Uses getStoreRequisitionsForStockTransfer() which filters mockStoreRequisitions
 * - No separate mockStockTransfers data
 *
 * Status Display:
 * - Uses SRStatus (draft, in_progress, completed, cancelled, voided)
 * - Only in_progress and completed are typically visible in this view
 *
 * @see docs/app/store-operations/stock-transfers/TS-stock-transfers.md
 * @see docs/app/store-operations/sr-business-rules.md
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
  Search,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  FileText,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react'
import { getStoreRequisitionsForStockTransfer } from '@/lib/mock-data/store-requisitions'
import { StoreRequisition, SRStatus, SR_STATUS_LABELS } from '@/lib/types/store-requisition'
import { formatCurrency } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

/**
 * Returns Tailwind CSS classes for status badge styling based on SR status.
 * Maps SRStatus enum values to appropriate visual indicators.
 */
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

// Status icon
const getStatusIcon = (status: SRStatus) => {
  switch (status) {
    case SRStatus.InProgress:
      return <Truck className="h-4 w-4 text-blue-600" />
    case SRStatus.Completed:
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case SRStatus.Draft:
      return <Clock className="h-4 w-4 text-gray-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

type SortField = 'refNo' | 'requestDate' | 'status' | 'sourceLocationName' | 'destinationLocationName' | 'estimatedValue'
type SortDirection = 'asc' | 'desc'

export default function StockTransfersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<SRStatus | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('requestDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Get filtered SRs for Stock Transfer view
  // Stock Transfers = SRs at Issue stage with INVENTORY destination
  const stockTransfers = useMemo(() => getStoreRequisitionsForStockTransfer(), [])

  // Filter and sort transfers
  const filteredTransfers = useMemo(() => {
    let result = [...stockTransfers]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((sr: StoreRequisition) =>
        sr.refNo.toLowerCase().includes(query) ||
        sr.sourceLocationName.toLowerCase().includes(query) ||
        sr.destinationLocationName.toLowerCase().includes(query) ||
        sr.requestedBy.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((sr: StoreRequisition) => sr.status === statusFilter)
    }

    // Sort
    result.sort((a: StoreRequisition, b: StoreRequisition) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortField) {
        case 'refNo':
          aValue = a.refNo
          bValue = b.refNo
          break
        case 'requestDate':
          aValue = a.requestDate
          bValue = b.requestDate
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'sourceLocationName':
          aValue = a.sourceLocationName
          bValue = b.sourceLocationName
          break
        case 'destinationLocationName':
          aValue = a.destinationLocationName
          bValue = b.destinationLocationName
          break
        case 'estimatedValue':
          aValue = a.estimatedValue.amount
          bValue = b.estimatedValue.amount
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [stockTransfers, searchQuery, statusFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage)
  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Summary stats
  const summary = useMemo(() => ({
    total: stockTransfers.length,
    inProgress: stockTransfers.filter((sr: StoreRequisition) => sr.status === SRStatus.InProgress).length,
    completed: stockTransfers.filter((sr: StoreRequisition) => sr.status === SRStatus.Completed).length,
    totalValue: stockTransfers.reduce((sum: number, sr: StoreRequisition) => sum + sr.estimatedValue.amount, 0)
  }), [stockTransfers])

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6" />
            Stock Transfers
          </h1>
          <p className="text-muted-foreground">
            View stock transfers between inventory locations
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Stock Transfers are Store Requisitions at the Issue stage</p>
            <p className="mt-1 text-blue-600">
              This view shows SRs with INVENTORY destination locations. To create or manage transfers, use the Store Requisitions module.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className="text-sm text-muted-foreground">Total Transfers</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-700">{summary.inProgress}</div>
              <div className="text-sm text-blue-600">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-700">{summary.completed}</div>
              <div className="text-sm text-green-600">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SRStatus | 'all')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={SRStatus.InProgress}>In Progress</SelectItem>
                <SelectItem value={SRStatus.Completed}>Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="cursor-pointer" onClick={() => handleSort('refNo')}>
                  <div className="flex items-center gap-1">
                    Reference
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('requestDate')}>
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('sourceLocationName')}>
                  <div className="flex items-center gap-1">
                    From Location
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('destinationLocationName')}>
                  <div className="flex items-center gap-1">
                    To Location
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('estimatedValue')}>
                  <div className="flex items-center justify-end gap-1">
                    Value
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Requested By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransfers.length > 0 ? (
                paginatedTransfers.map((sr: StoreRequisition) => (
                  <TableRow
                    key={sr.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/store-operations/store-requisitions/${sr.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        {sr.refNo}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sr.requestDate.toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{sr.sourceLocationName}</div>
                          <div className="text-xs text-muted-foreground">{sr.sourceLocationCode}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{sr.destinationLocationName}</div>
                          <div className="text-xs text-muted-foreground">{sr.destinationLocationCode}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{sr.totalItems}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(sr.estimatedValue.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(sr.status)}
                        <Badge
                          variant="outline"
                          className={cn("border", getStatusBadgeClass(sr.status))}
                        >
                          {SR_STATUS_LABELS[sr.status]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{sr.requestedBy}</div>
                      <div className="text-xs text-muted-foreground">{sr.departmentName}</div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No stock transfers found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Stock transfers are created from Store Requisitions with INVENTORY destinations
                    </p>
                    <Link href="/store-operations/store-requisitions">
                      <Button variant="outline" className="mt-4">
                        <FileText className="h-4 w-4 mr-2" />
                        Go to Store Requisitions
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransfers.length)} of {filteredTransfers.length} transfers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
