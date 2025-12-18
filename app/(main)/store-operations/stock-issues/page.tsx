'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Package,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Building2
} from 'lucide-react'
import { mockStockIssues } from '@/lib/mock-data/store-requisitions'
import { StockIssue, IssueStatus, ISSUE_STATUS_LABELS } from '@/lib/types/store-requisition'
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

// Status icon
const getStatusIcon = (status: IssueStatus) => {
  switch (status) {
    case IssueStatus.Issued:
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case IssueStatus.Pending:
      return <Clock className="h-4 w-4 text-gray-600" />
    case IssueStatus.Cancelled:
      return <XCircle className="h-4 w-4 text-red-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

type SortField = 'refNo' | 'issueDate' | 'status' | 'fromLocationName' | 'toLocationName' | 'totalValue'
type SortDirection = 'asc' | 'desc'

export default function StockIssuesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('issueDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter and sort issues
  const filteredIssues = useMemo(() => {
    let result = [...mockStockIssues]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(issue =>
        issue.refNo.toLowerCase().includes(query) ||
        issue.fromLocationName.toLowerCase().includes(query) ||
        issue.toLocationName.toLowerCase().includes(query) ||
        issue.departmentName.toLowerCase().includes(query) ||
        issue.sourceRequisitionRefNo?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(issue => issue.status === statusFilter)
    }

    // Sort
    result.sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortField) {
        case 'refNo':
          aValue = a.refNo
          bValue = b.refNo
          break
        case 'issueDate':
          aValue = a.issueDate
          bValue = b.issueDate
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'fromLocationName':
          aValue = a.fromLocationName
          bValue = b.fromLocationName
          break
        case 'toLocationName':
          aValue = a.toLocationName
          bValue = b.toLocationName
          break
        case 'totalValue':
          aValue = a.totalValue.amount
          bValue = b.totalValue.amount
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [mockStockIssues, searchQuery, statusFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage)
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Summary stats
  const summary = useMemo(() => ({
    total: mockStockIssues.length,
    pending: mockStockIssues.filter(i => i.status === IssueStatus.Pending).length,
    issued: mockStockIssues.filter(i => i.status === IssueStatus.Issued).length,
    totalValue: mockStockIssues.reduce((sum, i) => sum + i.totalValue.amount, 0)
  }), [mockStockIssues])

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
            <Package className="h-6 w-6" />
            Stock Issues
          </h1>
          <p className="text-muted-foreground">
            Manage direct stock issues to expense locations
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className="text-sm text-muted-foreground">Total Issues</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-gray-500" />
            <div>
              <div className="text-2xl font-bold text-gray-700">{summary.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-700">{summary.issued}</div>
              <div className="text-sm text-green-600">Issued</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
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
                placeholder="Search by reference, location, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as IssueStatus | 'all')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(ISSUE_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
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
                <TableHead className="cursor-pointer" onClick={() => handleSort('issueDate')}>
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('fromLocationName')}>
                  <div className="flex items-center gap-1">
                    From Location
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('toLocationName')}>
                  <div className="flex items-center gap-1">
                    To Location
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('totalValue')}>
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
                <TableHead className="text-center">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedIssues.length > 0 ? (
                paginatedIssues.map((issue) => (
                  <TableRow
                    key={issue.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/store-operations/stock-issues/${issue.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-purple-600" />
                        {issue.refNo}
                      </div>
                    </TableCell>
                    <TableCell>
                      {issue.issueDate.toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{issue.fromLocationName}</div>
                        <div className="text-xs text-muted-foreground">{issue.fromLocationCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{issue.toLocationName}</div>
                          <div className="text-xs text-muted-foreground">{issue.toLocationCode}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{issue.departmentName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{issue.totalItems}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(issue.totalValue.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(issue.status)}
                        <Badge
                          variant="outline"
                          className={cn("border", getStatusBadgeClass(issue.status))}
                        >
                          {ISSUE_STATUS_LABELS[issue.status]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {issue.sourceRequisitionRefNo ? (
                        <Link
                          href={`/store-operations/store-requisitions/${issue.sourceRequisitionId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                        >
                          <FileText className="h-4 w-4 inline mr-1" />
                          {issue.sourceRequisitionRefNo}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No stock issues found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Adjust your filters or search criteria
                    </p>
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredIssues.length)} of {filteredIssues.length} issues
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
