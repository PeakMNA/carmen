"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Warehouse,
  ArrowLeftRight,
  Package,
  AlertTriangle,
  AlertCircle,
  Search,
  Plus,
  Clock,
  MapPin,
  ChevronRight,
  History,
  ClipboardList,
  Truck,
  RefreshCw,
  CheckCircle2,
  TrendingDown
} from "lucide-react"
import { useSimpleUser } from "@/lib/context/simple-user-context"
import {
  getItemsBelowParLevelGrouped,
  getReplenishmentSummary,
  getAllReplenishmentRequests,
  mockInventoryLocations,
  type ReplenishmentItem
} from "@/lib/mock-data"
import { InventoryLocationType } from "@/lib/types/location-management"

function getUrgencyBadge(urgency: string) {
  const config: Record<string, { variant: "destructive" | "default" | "secondary" | "outline"; label: string; icon: React.ReactNode }> = {
    critical: { variant: "destructive", label: "Critical", icon: <AlertCircle className="h-3 w-3" /> },
    warning: { variant: "default", label: "Warning", icon: <AlertTriangle className="h-3 w-3" /> },
    low: { variant: "secondary", label: "Low", icon: <TrendingDown className="h-3 w-3" /> }
  }
  const { variant, label, icon } = config[urgency] || { variant: "outline", label: urgency, icon: null }
  return (
    <Badge variant={variant} className="gap-1">
      {icon}
      {label}
    </Badge>
  )
}

function getStatusBadge(status: string) {
  const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
    draft: { variant: "outline", label: "Draft" },
    pending: { variant: "secondary", label: "Pending" },
    approved: { variant: "default", label: "Approved" },
    in_transit: { variant: "outline", label: "In Transit" },
    completed: { variant: "outline", label: "Completed" },
    rejected: { variant: "destructive", label: "Rejected" }
  }
  const { variant, label } = config[status] || { variant: "outline", label: status }
  return <Badge variant={variant}>{label}</Badge>
}

export default function StockReplenishmentDashboard() {
  const { user } = useSimpleUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")

  // Get user's current location ID
  const userLocationId = user?.context?.currentLocation?.id || "loc-003"
  const userLocationName = user?.context?.currentLocation?.name || "Central Kitchen"

  // Check if user's location is an inventory location
  const userInventoryLocation = useMemo(() => {
    return mockInventoryLocations.find(loc => loc.id === userLocationId && loc.type === InventoryLocationType.INVENTORY)
  }, [userLocationId])

  const isInventoryLocation = !!userInventoryLocation

  // Get items below par level grouped by urgency
  const groupedItems = useMemo(() => {
    return getItemsBelowParLevelGrouped(userLocationId)
  }, [userLocationId])

  // Get replenishment summary
  const summary = useMemo(() => {
    return getReplenishmentSummary(userLocationId)
  }, [userLocationId])

  // Get recent requests
  const recentRequests = useMemo(() => {
    return getAllReplenishmentRequests().slice(0, 5)
  }, [])

  // Combine all items for filtering
  const allItems = useMemo(() => {
    return [...groupedItems.critical, ...groupedItems.warning, ...groupedItems.low]
  }, [groupedItems])

  // Filter items based on search and urgency filter
  const filteredItems = useMemo(() => {
    let items = allItems

    if (urgencyFilter !== "all") {
      items = items.filter(item => item.urgency === urgencyFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      items = items.filter(item =>
        item.productName.toLowerCase().includes(query) ||
        item.productCode.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query)
      )
    }

    return items
  }, [allItems, urgencyFilter, searchQuery])

  // Handle item selection
  const handleItemSelect = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredItems.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  // Handle select by urgency
  const handleSelectByUrgency = (urgency: string) => {
    const itemsToSelect = allItems.filter(item => item.urgency === urgency)
    const newSelected = new Set(selectedItems)
    itemsToSelect.forEach(item => newSelected.add(item.id))
    setSelectedItems(newSelected)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Warehouse className="h-7 w-7 text-green-600" />
            Stock Replenishment
          </h1>
          <p className="text-sm text-muted-foreground">
            Restock items to par level at your location
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-sm py-1.5">
            <MapPin className="h-4 w-4" />
            {userLocationName}
          </Badge>
        </div>
      </div>

      {/* Warning when location is not an inventory location */}
      {!isInventoryLocation ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Your current location ({userLocationName})</strong> is not configured as an inventory location.
            Stock replenishment is only available for inventory locations like Central Kitchen or Main Warehouse.
            Please switch to an inventory location using the location selector in the header.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-200 bg-green-50">
          <ArrowLeftRight className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>PAR LEVEL REPLENISHMENT:</strong> This module shows items at your location that are below their target (par) stock level.
            Select items and create a replenishment request to restock from another inventory location.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/store-operations/stock-replenishment/new">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full border-green-200 hover:border-green-400">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <span className="font-medium">New Request</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/store-operations/stock-replenishment/requests">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium">My Requests</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/store-operations/stock-replenishment/stock-levels">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <span className="font-medium">Stock Levels</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/store-operations/stock-replenishment/history">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <History className="h-6 w-6 text-orange-600" />
                </div>
                <span className="font-medium">History</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Critical Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.criticalCount}</div>
            <p className="text-xs text-muted-foreground">Below minimum level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Warning Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{summary.warningCount}</div>
            <p className="text-xs text-muted-foreground">Below reorder point</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.lowCount}</div>
            <p className="text-xs text-muted-foreground">Below par level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4 text-purple-500" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summary.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Items Below Par Level */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Items Below Par Level
                <Badge variant="secondary">{summary.totalItemsBelowPar} items</Badge>
              </CardTitle>
              <CardDescription>
                Select items to include in a replenishment request
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-9 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectByUrgency("critical")}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Select All Critical ({groupedItems.critical.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectByUrgency("warning")}
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Select All Warning ({groupedItems.warning.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll(true)}
            >
              Select All ({allItems.length})
            </Button>
            {selectedItems.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItems(new Set())}
              >
                Clear Selection
              </Button>
            )}
          </div>

          {/* Items Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Par Level</TableHead>
                  <TableHead className="text-right">Needed</TableHead>
                  <TableHead>Urgency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                        <p className="font-medium">All items are at par level!</p>
                        <p className="text-sm text-muted-foreground">
                          No items need replenishment at this time.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={selectedItems.has(item.id) ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) => handleItemSelect(item.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-xs text-muted-foreground">{item.productCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.categoryName}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.urgency === "critical" ? "text-red-600 font-medium" : ""}>
                          {formatNumber(item.currentStock)} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item.parLevel)} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-green-600">
                          +{formatNumber(item.recommendedQty)} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getUrgencyBadge(item.urgency)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Action Bar */}
          {selectedItems.size > 0 && (
            <div className="flex items-center justify-between mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-sm">
                <span className="font-medium">{selectedItems.size}</span> items selected
              </div>
              <Link
                href={{
                  pathname: "/store-operations/stock-replenishment/new",
                  query: { items: Array.from(selectedItems).join(",") }
                }}
              >
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Replenishment Request
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Recent Replenishment Requests</CardTitle>
              <CardDescription>Your recent requests and their status</CardDescription>
            </div>
            <Link href="/store-operations/stock-replenishment/requests">
              <Button variant="outline" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No replenishment requests yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>From Location</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.requestNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {request.fromLocationName}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{request.totalItems}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <Link href={`/store-operations/stock-replenishment/requests/${request.id}`}>
                          <Button variant="ghost" size="sm">
                            Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cross-Navigation */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Need to order from suppliers?</p>
                <p className="text-sm text-blue-700">
                  For external purchases, use Supplier Reorder Planning in Inventory Planning.
                </p>
              </div>
            </div>
            <Link href="/operational-planning/inventory-planning/reorder">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Go to Supplier Reorder Planning
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
