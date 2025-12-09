"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Search,
  Download,
  Plus,
  Filter,
  MapPin,
  ChevronRight,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  Calendar,
  User,
  Package,
  RefreshCw
} from "lucide-react"

// Extended mock data for transfer requests
const allTransferRequests = [
  { id: "TR-2024-0089", location: "Central Kitchen", locationCode: "CK-001", items: 8, totalValue: 450.00, status: "pending", priority: "high", requestedBy: "John Smith", approvedBy: null, date: "2024-01-15", notes: "Urgent - running low on beverages" },
  { id: "TR-2024-0088", location: "Main Bar", locationCode: "MB-001", items: 5, totalValue: 285.50, status: "approved", priority: "medium", requestedBy: "Sarah Wilson", approvedBy: "Mike Chen", date: "2024-01-15", notes: "Weekly bar restock" },
  { id: "TR-2024-0087", location: "Restaurant", locationCode: "RS-001", items: 12, totalValue: 780.25, status: "in_transit", priority: "high", requestedBy: "Mike Chen", approvedBy: "David Brown", date: "2024-01-14", notes: "Weekend preparation" },
  { id: "TR-2024-0086", location: "Poolside Bar", locationCode: "PB-001", items: 3, totalValue: 125.00, status: "completed", priority: "low", requestedBy: "Emma Davis", approvedBy: "John Smith", date: "2024-01-14", notes: "Regular restock" },
  { id: "TR-2024-0085", location: "Room Service", locationCode: "RS-002", items: 6, totalValue: 320.75, status: "completed", priority: "medium", requestedBy: "James Lee", approvedBy: "Sarah Wilson", date: "2024-01-13", notes: "Mini bar supplies" },
  { id: "TR-2024-0084", location: "Central Kitchen", locationCode: "CK-001", items: 15, totalValue: 1250.00, status: "completed", priority: "high", requestedBy: "John Smith", approvedBy: "David Brown", date: "2024-01-13", notes: "Banquet preparation" },
  { id: "TR-2024-0083", location: "Main Bar", locationCode: "MB-001", items: 4, totalValue: 180.00, status: "rejected", priority: "low", requestedBy: "Sarah Wilson", approvedBy: null, date: "2024-01-12", notes: "Duplicate request" },
  { id: "TR-2024-0082", location: "Restaurant", locationCode: "RS-001", items: 9, totalValue: 520.50, status: "completed", priority: "medium", requestedBy: "Mike Chen", approvedBy: "John Smith", date: "2024-01-12", notes: "Lunch service prep" },
  { id: "TR-2024-0081", location: "Poolside Bar", locationCode: "PB-001", items: 7, totalValue: 380.25, status: "completed", priority: "high", requestedBy: "Emma Davis", approvedBy: "Mike Chen", date: "2024-01-11", notes: "Pool party event" },
  { id: "TR-2024-0080", location: "Room Service", locationCode: "RS-002", items: 5, totalValue: 275.00, status: "completed", priority: "medium", requestedBy: "James Lee", approvedBy: "Sarah Wilson", date: "2024-01-11", notes: "VIP guest requests" },
  { id: "TR-2024-0079", location: "Central Kitchen", locationCode: "CK-001", items: 20, totalValue: 1850.00, status: "completed", priority: "high", requestedBy: "John Smith", approvedBy: "David Brown", date: "2024-01-10", notes: "Monthly bulk transfer" },
  { id: "TR-2024-0078", location: "Main Bar", locationCode: "MB-001", items: 6, totalValue: 420.00, status: "completed", priority: "medium", requestedBy: "Sarah Wilson", approvedBy: "Mike Chen", date: "2024-01-10", notes: "Premium spirits restock" },
]

function getStatusBadge(status: string) {
  const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string; className?: string }> = {
    pending: { variant: "secondary", label: "Pending", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    approved: { variant: "default", label: "Approved", className: "bg-blue-100 text-blue-700 border-blue-200" },
    in_transit: { variant: "outline", label: "In Transit", className: "bg-purple-100 text-purple-700 border-purple-200" },
    completed: { variant: "outline", label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
    rejected: { variant: "destructive", label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" }
  }
  const { label, className } = config[status] || { variant: "outline", label: status }
  return <Badge variant="outline" className={className}>{label}</Badge>
}

function getPriorityBadge(priority: string) {
  const config: Record<string, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200"
  }
  return (
    <Badge variant="outline" className={config[priority]}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  )
}

export default function TransferRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return allTransferRequests.filter(transfer => {
      const matchesSearch = transfer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           transfer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           transfer.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || transfer.status === statusFilter
      const matchesLocation = locationFilter === "all" || transfer.location === locationFilter
      const matchesPriority = priorityFilter === "all" || transfer.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesLocation && matchesPriority
    })
  }, [searchQuery, statusFilter, locationFilter, priorityFilter])

  const locations = useMemo(() => {
    return [...new Set(allTransferRequests.map(t => t.location))]
  }, [])

  // Calculate summary stats
  const summaryStats = useMemo(() => ({
    total: allTransferRequests.length,
    pending: allTransferRequests.filter(t => t.status === "pending").length,
    approved: allTransferRequests.filter(t => t.status === "approved").length,
    inTransit: allTransferRequests.filter(t => t.status === "in_transit").length,
    completed: allTransferRequests.filter(t => t.status === "completed").length,
    rejected: allTransferRequests.filter(t => t.status === "rejected").length
  }), [])

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Toggle all selections
  const toggleAllSelections = () => {
    if (selectedItems.size === filteredTransfers.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredTransfers.map(t => t.id)))
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/store-operations/stock-replenishment">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transfer Requests</h1>
            <p className="text-sm text-muted-foreground">
              Manage all internal stock transfer requests
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/store-operations/stock-replenishment/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setStatusFilter("all")}>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{summaryStats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 border-yellow-200" onClick={() => setStatusFilter("pending")}>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{summaryStats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 border-blue-200" onClick={() => setStatusFilter("approved")}>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{summaryStats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 border-purple-200" onClick={() => setStatusFilter("in_transit")}>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{summaryStats.inTransit}</p>
              <p className="text-xs text-muted-foreground">In Transit</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 border-green-200" onClick={() => setStatusFilter("completed")}>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{summaryStats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 border-red-200" onClick={() => setStatusFilter("rejected")}>
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{summaryStats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, location, or requester..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{selectedItems.size} request(s) selected</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
                <Button variant="outline" size="sm">
                  <Truck className="h-4 w-4 mr-2" />
                  Mark In Transit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transfer Requests Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedItems.size === filteredTransfers.length && filteredTransfers.length > 0}
                      onCheckedChange={toggleAllSelections}
                    />
                  </TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map(transfer => (
                  <TableRow key={transfer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(transfer.id)}
                        onCheckedChange={() => toggleSelection(transfer.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <Link
                          href={`/store-operations/stock-replenishment/requests/${transfer.id}`}
                          className="font-medium hover:underline text-primary"
                        >
                          {transfer.id}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {transfer.date}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{transfer.location}</div>
                          <div className="text-xs text-muted-foreground">{transfer.locationCode}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {transfer.items}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${transfer.totalValue.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {transfer.requestedBy}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(transfer.priority)}</TableCell>
                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/store-operations/stock-replenishment/requests/${transfer.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {transfer.status === "pending" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {transfer.status === "approved" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Truck className="h-4 w-4 mr-2 text-purple-600" />
                                Mark In Transit
                              </DropdownMenuItem>
                            </>
                          )}
                          {transfer.status === "in_transit" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Mark Completed
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransfers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No transfer requests match your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTransfers.length} of {allTransferRequests.length} requests
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
