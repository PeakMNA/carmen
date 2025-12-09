"use client"

import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Download, FileDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { BalanceReportParams } from "../types"
import { MovementHistoryData, MovementRecord, generateMockMovementHistory } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "../utils"

interface MovementHistoryProps {
  params: BalanceReportParams
  isLoading: boolean
}

export function MovementHistory({ params, isLoading }: MovementHistoryProps) {
  const [movementData, setMovementData] = useState<MovementHistoryData | null>(null)
  const [localLoading, setLocalLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })
  const [transactionType, setTransactionType] = useState<string>("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Load mock data
  useEffect(() => {
    setLocalLoading(true)
    const timer = setTimeout(() => {
      const data = generateMockMovementHistory(params)
      setMovementData(data)
      setLocalLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [params])

  // Filter records based on search and filters
  const filteredRecords = movementData?.records.filter(record => {
    // Filter by transaction type
    if (transactionType !== "ALL" && record.transactionType !== transactionType) {
      return false
    }
    
    // Filter by date range
    if (dateRange.from && new Date(record.date) < dateRange.from) {
      return false
    }
    if (dateRange.to) {
      const toDateEnd = new Date(dateRange.to)
      toDateEnd.setHours(23, 59, 59, 999)
      if (new Date(record.date) > toDateEnd) {
        return false
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        record.productName.toLowerCase().includes(searchLower) ||
        record.productCode.toLowerCase().includes(searchLower) ||
        record.reference.toLowerCase().includes(searchLower) ||
        record.locationName.toLowerCase().includes(searchLower) ||
        record.reason.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  }) || []

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Get transaction type badge - only IN and OUT are valid types
  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'IN':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In</Badge>
      case 'OUT':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out</Badge>
      default:
        return null
    }
  }

  // Get reference type badge
  const getReferenceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'GRN': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      'SO': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      'ADJ': 'bg-amber-100 text-amber-800 hover:bg-amber-100',
      'TRF': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
      'PO': 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
      'WO': 'bg-rose-100 text-rose-800 hover:bg-rose-100',
      'SR': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
    }
    
    return <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>
  }

  // Format quantity change with color
  const formatQuantityChange = (change: number) => {
    if (change > 0) {
      return <span className="text-green-600">+{formatNumber(change)}</span>
    } else if (change < 0) {
      return <span className="text-red-600">{formatNumber(change)}</span>
    } else {
      return <span>{formatNumber(change)}</span>
    }
  }

  // Format value change with color
  const formatValueChange = (change: number) => {
    if (change > 0) {
      return <span className="text-green-600">+{formatCurrency(change)}</span>
    } else if (change < 0) {
      return <span className="text-red-600">{formatCurrency(change)}</span>
    } else {
      return <span>{formatCurrency(change)}</span>
    }
  }

  // Render loading skeleton
  if (localLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
          
          <div className="rounded-md border">
            <div className="h-[400px] p-4 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total In</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(movementData?.summary.totalIn || 0)}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(movementData?.summary.totalValueIn || 0)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Out</p>
              <p className="text-2xl font-bold text-red-600">{formatNumber(movementData?.summary.totalOut || 0)}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(movementData?.summary.totalValueOut || 0)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Net Change</p>
              <p className={cn(
                "text-2xl font-bold",
                (movementData?.summary.netChange || 0) > 0 ? "text-green-600" : 
                (movementData?.summary.netChange || 0) < 0 ? "text-red-600" : ""
              )}>
                {formatNumber(movementData?.summary.netChange || 0)}
              </p>
              <p className="text-xs text-muted-foreground">{formatCurrency(movementData?.summary.netValueChange || 0)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{movementData?.summary.transactionCount || 0}</p>
              <p className="text-xs text-muted-foreground">Total movements</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  if (range) {
                    setDateRange({
                      from: range.from,
                      to: range.to || undefined
                    })
                  } else {
                    setDateRange({ from: undefined, to: undefined })
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          {/* Transaction Type Filter - only IN and OUT are valid types */}
          <Select
            value={transactionType}
            onValueChange={setTransactionType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="IN">In</SelectItem>
              <SelectItem value="OUT">Out</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Button variant="outline" className="self-start">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      
      {/* Movement Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/75">
                <TableHead className="py-3 font-medium text-gray-600">Date & Time</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Reference</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Product</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Location</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Type</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Reason</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right">Quantity</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No movement records found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="font-medium">{record.date}</div>
                      <div className="text-xs text-muted-foreground">{record.time}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getReferenceTypeBadge(record.referenceType)}
                        <span>{record.reference}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{record.productName}</div>
                      <div className="text-xs text-muted-foreground">{record.productCode}</div>
                      {record.lotNumber && (
                        <div className="text-xs text-muted-foreground">Lot: {record.lotNumber}</div>
                      )}
                    </TableCell>
                    <TableCell>{record.locationName}</TableCell>
                    <TableCell>{getTransactionTypeBadge(record.transactionType)}</TableCell>
                    <TableCell>{record.reason}</TableCell>
                    <TableCell className="text-right">
                      <div>{formatQuantityChange(record.quantityChange)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatNumber(record.quantityBefore)} → {formatNumber(record.quantityAfter)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>{formatValueChange(record.valueChange)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(record.valueBefore)} → {formatCurrency(record.valueAfter)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
} 