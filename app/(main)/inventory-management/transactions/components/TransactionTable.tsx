"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  TransactionRecord,
  referenceTypeConfig,
  transactionTypeConfig
} from "../types"

interface TransactionTableProps {
  records: TransactionRecord[]
  isLoading?: boolean
}

type SortField = 'date' | 'reference' | 'productName' | 'locationName' | 'quantityIn' | 'quantityOut' | 'totalValue'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

export function TransactionTable({ records, isLoading }: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', direction: 'desc' })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  // Sort records
  const sortedRecords = useMemo(() => {
    const sorted = [...records].sort((a, b) => {
      let comparison = 0

      switch (sortConfig.field) {
        case 'date':
          comparison = new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
          break
        case 'reference':
          comparison = a.reference.localeCompare(b.reference)
          break
        case 'productName':
          comparison = a.productName.localeCompare(b.productName)
          break
        case 'locationName':
          comparison = a.locationName.localeCompare(b.locationName)
          break
        case 'quantityIn':
          comparison = a.quantityIn - b.quantityIn
          break
        case 'quantityOut':
          comparison = a.quantityOut - b.quantityOut
          break
        case 'totalValue':
          comparison = a.totalValue - b.totalValue
          break
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [records, sortConfig])

  // Paginate records
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedRecords.slice(start, start + pageSize)
  }, [sortedRecords, currentPage, pageSize])

  const totalPages = Math.ceil(records.length / pageSize)

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: current.field === field && current.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date/Time</TableHead>
                <TableHead className="w-[150px]">Reference</TableHead>
                <TableHead className="w-[200px]">Product</TableHead>
                <TableHead className="w-[140px]">Location</TableHead>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead className="w-[80px] text-right">Qty In</TableHead>
                <TableHead className="w-[80px] text-right">Qty Out</TableHead>
                <TableHead className="w-[100px] text-right">Value</TableHead>
                <TableHead className="w-[100px]">Balance</TableHead>
                <TableHead className="w-[100px]">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 10 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No transactions found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or date range to see transactions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="w-[120px] cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date/Time
                  {getSortIcon('date')}
                </div>
              </TableHead>
              <TableHead
                className="w-[150px] cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('reference')}
              >
                <div className="flex items-center">
                  Reference
                  {getSortIcon('reference')}
                </div>
              </TableHead>
              <TableHead
                className="w-[200px] cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('productName')}
              >
                <div className="flex items-center">
                  Product
                  {getSortIcon('productName')}
                </div>
              </TableHead>
              <TableHead
                className="w-[140px] cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('locationName')}
              >
                <div className="flex items-center">
                  Location
                  {getSortIcon('locationName')}
                </div>
              </TableHead>
              <TableHead className="w-[80px]">Type</TableHead>
              <TableHead
                className="w-[80px] text-right cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('quantityIn')}
              >
                <div className="flex items-center justify-end">
                  Qty In
                  {getSortIcon('quantityIn')}
                </div>
              </TableHead>
              <TableHead
                className="w-[80px] text-right cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('quantityOut')}
              >
                <div className="flex items-center justify-end">
                  Qty Out
                  {getSortIcon('quantityOut')}
                </div>
              </TableHead>
              <TableHead
                className="w-[100px] text-right cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('totalValue')}
              >
                <div className="flex items-center justify-end">
                  Value
                  {getSortIcon('totalValue')}
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Balance</TableHead>
              <TableHead className="w-[100px]">User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.map((record) => (
              <TableRow key={record.id} className="hover:bg-muted/50">
                {/* Date/Time */}
                <TableCell>
                  <div>
                    <div className="font-medium">{record.date}</div>
                    <div className="text-xs text-muted-foreground">{record.time}</div>
                  </div>
                </TableCell>

                {/* Reference */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", referenceTypeConfig[record.referenceType].color)}
                    >
                      {record.referenceType}
                    </Badge>
                    <span className="text-sm">{record.reference.split('-')[1]}</span>
                  </div>
                </TableCell>

                {/* Product */}
                <TableCell>
                  <div>
                    <div className="font-medium">{record.productName}</div>
                    <div className="text-xs text-muted-foreground">
                      {record.productCode} • {record.categoryName}
                    </div>
                  </div>
                </TableCell>

                {/* Location */}
                <TableCell>
                  <span className="text-sm">{record.locationName}</span>
                </TableCell>

                {/* Type */}
                <TableCell>
                  <Badge className={cn("text-xs", transactionTypeConfig[record.transactionType]?.bgColor || 'bg-gray-100 text-gray-800')}>
                    {record.transactionType}
                  </Badge>
                </TableCell>

                {/* Qty In */}
                <TableCell className="text-right">
                  {record.quantityIn > 0 ? (
                    <span className="text-green-600 font-medium">
                      +{formatNumber(record.quantityIn)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Qty Out */}
                <TableCell className="text-right">
                  {record.quantityOut > 0 ? (
                    <span className="text-red-600 font-medium">
                      -{formatNumber(record.quantityOut)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Value */}
                <TableCell className="text-right">
                  <span className={cn(
                    "font-medium",
                    record.transactionType === 'IN' && "text-green-600",
                    record.transactionType === 'OUT' && "text-red-600"
                  )}>
                    {formatCurrency(record.totalValue)}
                  </span>
                </TableCell>

                {/* Balance */}
                <TableCell>
                  <div className="text-sm">
                    <span className="text-muted-foreground">{formatNumber(record.balanceBefore)}</span>
                    <span className="mx-1">→</span>
                    <span className="font-medium">{formatNumber(record.balanceAfter)}</span>
                  </div>
                </TableCell>

                {/* User */}
                <TableCell>
                  <span className="text-sm text-muted-foreground">{record.createdByName}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>
            of {formatNumber(records.length)} transactions
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1 text-sm">
            <span>Page</span>
            <span className="font-medium">{currentPage}</span>
            <span>of</span>
            <span className="font-medium">{totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
