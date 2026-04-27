"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Calendar, Download, Printer, ChevronDown, ChevronUp, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { PRStatus, MockPurchaseRequest } from "@/lib/types"
import { mockPurchaseRequests } from "@/lib/mock-data"

// Quick date filter options
const QUICK_FILTERS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Custom", value: "custom" },
]

// PR Type options
const PR_TYPES = [
  { label: "All", value: "all" },
  { label: "Stock", value: "stock" },
  { label: "Service", value: "service" },
  { label: "Other", value: "other" },
]

// Status filter options
const STATUS_OPTIONS: PRStatus[] = [
  PRStatus.Draft,
  PRStatus.InProgress,
  PRStatus.Approved,
  PRStatus.Cancelled,
  PRStatus.Void,
]

interface Filters {
  dateFrom: string
  dateTo: string
  deliveryDateFrom: string
  deliveryDateTo: string
  statuses: PRStatus[]
  prType: string
  quickFilter: string
}

export function PurchaseRequestListReport() {
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    dateFrom: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
    dateTo: format(new Date(), "yyyy-MM-dd"),
    deliveryDateFrom: "",
    deliveryDateTo: "",
    statuses: [],
    prType: "all",
    quickFilter: "month",
  })

  // Filter data based on criteria
  const filteredData = useMemo(() => {
    return mockPurchaseRequests.filter((pr) => {
      // Date range filter
      const prDate = new Date(pr.requestDate)
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null

      if (fromDate && prDate < fromDate) return false
      if (toDate && prDate > toDate) return false

      // Delivery date filter
      if (pr.deliveryDate) {
        const deliveryDate = new Date(pr.deliveryDate)
        const deliveryFromDate = filters.deliveryDateFrom ? new Date(filters.deliveryDateFrom) : null
        const deliveryToDate = filters.deliveryDateTo ? new Date(filters.deliveryDateTo) : null

        if (deliveryFromDate && deliveryDate < deliveryFromDate) return false
        if (deliveryToDate && deliveryDate > deliveryToDate) return false
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(pr.status)) {
        return false
      }

      // PR Type filter (would need to add type field to PurchaseRequest)
      // For now, we'll skip this as it's not in the current type definition

      return true
    })
  }, [filters])

  // Calculate totals
  const summary = useMemo(() => {
    return {
      totalPRs: filteredData.length,
      totalAmount: filteredData.reduce((sum, pr) => sum + (pr.totalAmount || 0), 0),
      byStatus: filteredData.reduce((acc, pr) => {
        acc[pr.status] = (acc[pr.status] || 0) + 1
        return acc
      }, {} as Record<PRStatus, number>),
    }
  }, [filteredData])

  const handleStatusToggle = (status: PRStatus) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      dateFrom: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
      dateTo: format(new Date(), "yyyy-MM-dd"),
      deliveryDateFrom: "",
      deliveryDateTo: "",
      statuses: [],
      prType: "all",
      quickFilter: "month",
    })
  }

  const handleExport = () => {
    // TODO: Implement Excel export
    console.log("Export to Excel")
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusBadgeVariant = (status: PRStatus) => {
    const variants: Record<PRStatus, string> = {
      [PRStatus.Draft]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      [PRStatus.InProgress]: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      [PRStatus.Approved]: "bg-green-100 text-green-800 hover:bg-green-100",
      [PRStatus.Cancelled]: "bg-red-100 text-red-800 hover:bg-red-100",
      [PRStatus.Void]: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      [PRStatus.Completed]: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    }
    return variants[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status: PRStatus) => {
    const labels: Record<PRStatus, string> = {
      [PRStatus.Draft]: "Draft",
      [PRStatus.InProgress]: "In Progress",
      [PRStatus.Approved]: "Approved",
      [PRStatus.Cancelled]: "Cancelled",
      [PRStatus.Void]: "Void",
      [PRStatus.Completed]: "Completed",
    }
    return labels[status] || status
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Purchase Request List Report</h1>
          <p className="text-muted-foreground">PR-001 - Summary list of all Purchase Requests</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total PRs</CardDescription>
            <CardTitle className="text-2xl">{summary.totalPRs}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Amount</CardDescription>
            <CardTitle className="text-2xl">
              ฿{summary.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-2xl">{summary.byStatus[PRStatus.InProgress] || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-2xl">{summary.byStatus[PRStatus.Approved] || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Collapsible Filters */}
      <Card>
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Filters</CardTitle>
                {filters.statuses.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.statuses.length} active
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(filters.statuses.length > 0 || filters.deliveryDateFrom || filters.deliveryDateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-8 px-2 lg:px-3"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isFilterOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Quick Date Filters */}
              <div className="space-y-2">
                <Label>Quick Date Range</Label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_FILTERS.map((quick) => (
                    <Button
                      key={quick.value}
                      variant={filters.quickFilter === quick.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, quickFilter: quick.value }))
                        // Update date range based on quick filter
                        const today = new Date()
                        let from = new Date()
                        switch (quick.value) {
                          case "today":
                            from = today
                            break
                          case "week":
                            from = new Date(today.setDate(today.getDate() - 7))
                            break
                          case "month":
                            from = new Date(today.getFullYear(), today.getMonth(), 1)
                            break
                        }
                        if (quick.value !== "custom") {
                          setFilters(prev => ({
                            ...prev,
                            dateFrom: format(from, "yyyy-MM-dd"),
                            dateTo: format(new Date(), "yyyy-MM-dd"),
                          }))
                        }
                      }}
                    >
                      {quick.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Date From <span className="text-red-500">*</span></Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value, quickFilter: "custom" }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">Date To <span className="text-red-500">*</span></Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value, quickFilter: "custom" }))}
                  />
                </div>
              </div>

              {/* Delivery Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryFrom">Delivery Date From</Label>
                  <Input
                    id="deliveryFrom"
                    type="date"
                    value={filters.deliveryDateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, deliveryDateFrom: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryTo">Delivery Date To</Label>
                  <Input
                    id="deliveryTo"
                    type="date"
                    value={filters.deliveryDateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, deliveryDateTo: e.target.value }))}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={status}
                        checked={filters.statuses.includes(status)}
                        onCheckedChange={() => handleStatusToggle(status)}
                      />
                      <label
                        htmlFor={status}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <Badge className={getStatusBadgeVariant(status)}>
                          {getStatusLabel(status)}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* PR Type */}
              <div className="space-y-2">
                <Label htmlFor="prType">PR Type</Label>
                <Select
                  value={filters.prType}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, prType: value }))}
                >
                  <SelectTrigger id="prType" className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PR_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Requests ({filteredData.length})</CardTitle>
          <CardDescription>
            Showing {filteredData.length} of {mockPurchaseRequests.length} purchase requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[100px]">
                    <div>Date</div>
                    <div className="text-xs font-normal text-muted-foreground">วันที่ PR</div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div>PR.NO</div>
                    <div className="text-xs font-normal text-muted-foreground">หมายเลข PR</div>
                  </TableHead>
                  <TableHead className="w-[250px]">
                    <div>Description</div>
                    <div className="text-xs font-normal text-muted-foreground">Description header PR</div>
                  </TableHead>
                  <TableHead className="w-[150px]">
                    <div>Department Request</div>
                    <div className="text-xs font-normal text-muted-foreground">Department Request</div>
                  </TableHead>
                  <TableHead className="text-center w-[110px]">
                    <div>Delivery Date</div>
                    <div className="text-xs font-normal text-muted-foreground">วันที่ส่งสินค้า</div>
                  </TableHead>
                  <TableHead className="text-center w-[120px]">
                    <div>PR Type</div>
                    <div className="text-xs font-normal text-muted-foreground">ประเภทของ PR</div>
                  </TableHead>
                  <TableHead className="text-center w-[100px]">
                    <div>Status</div>
                    <div className="text-xs font-normal text-muted-foreground">สถานะ PR</div>
                  </TableHead>
                  <TableHead className="text-right w-[130px]">
                    <div>Total</div>
                    <div className="text-xs font-normal text-muted-foreground">ยอดสุทธิของ PR</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No purchase requests found matching the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((pr) => (
                    <TableRow key={pr.id} className="hover:bg-muted/50 cursor-pointer">
                      <TableCell className="text-center">
                        {format(new Date(pr.requestDate), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`/procurement/purchase-requests/${pr.id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {pr.refNumber || pr.requestNumber}
                        </a>
                      </TableCell>
                      <TableCell>{pr.justification || "-"}</TableCell>
                      <TableCell>{pr.requestedBy}</TableCell>
                      <TableCell className="text-center">
                        {pr.deliveryDate ? format(new Date(pr.deliveryDate), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">Stock</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusBadgeVariant(pr.status)}>
                          {getStatusLabel(pr.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ฿{(pr.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
