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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  ChevronDown,
  History,
  ClipboardList,
  Truck,
  RefreshCw,
  CheckCircle2,
  TrendingDown,
  Filter
} from "lucide-react"
import { useSimpleUser } from "@/lib/context/simple-user-context"
import {
  getItemsBelowParLevelByLocations,
  getAllTransferRequests,
  mockInventoryLocations,
  type TransferItem
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

function getLocationTypeIcon(type: string) {
  switch (type) {
    case InventoryLocationType.INVENTORY:
      return <Warehouse className="h-4 w-4 text-green-600" />
    case InventoryLocationType.DIRECT:
      return <Package className="h-4 w-4 text-blue-600" />
    case InventoryLocationType.CONSIGNMENT:
      return <Truck className="h-4 w-4 text-orange-600" />
    default:
      return <MapPin className="h-4 w-4 text-gray-500" />
  }
}

export default function StockReplenishmentDashboard() {
  const { user } = useSimpleUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set())

  // Get user's assigned locations (from user.locations array)
  const userAssignedLocations = useMemo(() => {
    // Use user's assigned locations if available, otherwise fall back to available locations
    const locations = user?.locations || user?.availableLocations || []
    // Filter to only include inventory-type locations from mockInventoryLocations
    return locations.filter(loc => {
      const inventoryLoc = mockInventoryLocations.find(il => il.id === loc.id)
      return inventoryLoc && inventoryLoc.type === InventoryLocationType.INVENTORY
    })
  }, [user])

  // Get location IDs for data fetching
  const locationIds = useMemo(() => {
    if (locationFilter === "all") {
      return userAssignedLocations.map(loc => loc.id)
    }
    return [locationFilter]
  }, [userAssignedLocations, locationFilter])

  // Get items below par level grouped by location
  const locationGroups = useMemo(() => {
    return getItemsBelowParLevelByLocations(locationIds)
  }, [locationIds])

  // Calculate overall summary
  const overallSummary = useMemo(() => {
    return locationGroups.reduce(
      (acc, group) => ({
        totalItemsBelowPar: acc.totalItemsBelowPar + group.summary.total,
        criticalCount: acc.criticalCount + group.summary.critical,
        warningCount: acc.warningCount + group.summary.warning,
        lowCount: acc.lowCount + group.summary.low,
        locationsWithIssues: acc.locationsWithIssues + (group.summary.total > 0 ? 1 : 0)
      }),
      { totalItemsBelowPar: 0, criticalCount: 0, warningCount: 0, lowCount: 0, locationsWithIssues: 0 }
    )
  }, [locationGroups])

  // Get recent requests
  const recentRequests = useMemo(() => {
    return getAllTransferRequests().slice(0, 5)
  }, [])

  // Filter items within each location group
  const filteredLocationGroups = useMemo(() => {
    return locationGroups.map(group => {
      let items = group.items

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

      return {
        ...group,
        items,
        filteredSummary: {
          critical: items.filter(i => i.urgency === 'critical').length,
          warning: items.filter(i => i.urgency === 'warning').length,
          low: items.filter(i => i.urgency === 'low').length,
          total: items.length
        }
      }
    }).filter(group => group.items.length > 0 || (!searchQuery && urgencyFilter === "all"))
  }, [locationGroups, urgencyFilter, searchQuery])

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

  // Handle select all in a location
  const handleSelectAllInLocation = (items: TransferItem[], checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      items.forEach(item => newSelected.add(item.id))
    } else {
      items.forEach(item => newSelected.delete(item.id))
    }
    setSelectedItems(newSelected)
  }

  // Handle select by urgency across all locations
  const handleSelectByUrgency = (urgency: string) => {
    const newSelected = new Set(selectedItems)
    filteredLocationGroups.forEach(group => {
      group.items.filter(item => item.urgency === urgency).forEach(item => newSelected.add(item.id))
    })
    setSelectedItems(newSelected)
  }

  // Toggle location expansion
  const toggleLocationExpansion = (locationId: string) => {
    const newExpanded = new Set(expandedLocations)
    if (newExpanded.has(locationId)) {
      newExpanded.delete(locationId)
    } else {
      newExpanded.add(locationId)
    }
    setExpandedLocations(newExpanded)
  }

  // Expand all locations
  const expandAllLocations = () => {
    setExpandedLocations(new Set(filteredLocationGroups.map(g => g.locationId)))
  }

  // Collapse all locations
  const collapseAllLocations = () => {
    setExpandedLocations(new Set())
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  // Check if user has any assigned inventory locations
  const hasAssignedLocations = userAssignedLocations.length > 0

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
            Restock items to par level across your assigned locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-sm py-1.5">
            <MapPin className="h-4 w-4" />
            {userAssignedLocations.length} Assigned Location{userAssignedLocations.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Warning when no assigned locations */}
      {!hasAssignedLocations ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>No inventory locations assigned.</strong> You do not have access to any inventory locations.
            Please contact your administrator to assign inventory locations to your account.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-200 bg-green-50">
          <ArrowLeftRight className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>PAR LEVEL REPLENISHMENT:</strong> This module shows items across your assigned locations that are below their target (par) stock level.
            Select items and create a transfer request to restock from another inventory location.
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4 text-purple-500" />
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{overallSummary.locationsWithIssues}</div>
            <p className="text-xs text-muted-foreground">With items below par</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Critical Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallSummary.criticalCount}</div>
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
            <div className="text-2xl font-bold text-amber-600">{overallSummary.warningCount}</div>
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
            <div className="text-2xl font-bold text-blue-600">{overallSummary.lowCount}</div>
            <p className="text-xs text-muted-foreground">Below par level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallSummary.totalItemsBelowPar}</div>
            <p className="text-xs text-muted-foreground">Need replenishment</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
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
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All My Locations ({userAssignedLocations.length})</SelectItem>
                  {userAssignedLocations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAllLocations}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAllLocations}>
                Collapse All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Select Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSelectByUrgency("critical")}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          Select All Critical ({overallSummary.criticalCount})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSelectByUrgency("warning")}
          className="text-amber-600 border-amber-200 hover:bg-amber-50"
        >
          <AlertTriangle className="h-4 w-4 mr-1" />
          Select All Warning ({overallSummary.warningCount})
        </Button>
        {selectedItems.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedItems(new Set())}
          >
            Clear Selection ({selectedItems.size})
          </Button>
        )}
      </div>

      {/* Items Grouped by Location */}
      <div className="space-y-4">
        {filteredLocationGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="mt-4 text-lg font-medium">All items are at par level!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No items need replenishment across your assigned locations.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLocationGroups.map((group) => (
            <Card key={group.locationId} className={group.summary.critical > 0 ? "border-red-200" : ""}>
              <Collapsible
                open={expandedLocations.has(group.locationId)}
                onOpenChange={() => toggleLocationExpansion(group.locationId)}
              >
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          {getLocationTypeIcon(group.locationType || '')}
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-lg">{group.locationName}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {group.filteredSummary.total} items below par
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          {group.filteredSummary.critical > 0 && (
                            <Badge variant="destructive">{group.filteredSummary.critical} Critical</Badge>
                          )}
                          {group.filteredSummary.warning > 0 && (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{group.filteredSummary.warning} Warning</Badge>
                          )}
                          {group.filteredSummary.low > 0 && (
                            <Badge variant="secondary">{group.filteredSummary.low} Low</Badge>
                          )}
                        </div>
                        {expandedLocations.has(group.locationId) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Stock Overview Bar */}
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100 mb-4">
                      <div
                        className="bg-red-500 transition-all"
                        style={{ width: `${group.summary.total > 0 ? (group.summary.critical / group.summary.total) * 100 : 0}%` }}
                      />
                      <div
                        className="bg-amber-500 transition-all"
                        style={{ width: `${group.summary.total > 0 ? (group.summary.warning / group.summary.total) * 100 : 0}%` }}
                      />
                      <div
                        className="bg-blue-500 transition-all"
                        style={{ width: `${group.summary.total > 0 ? (group.summary.low / group.summary.total) * 100 : 0}%` }}
                      />
                    </div>

                    {/* Items Table */}
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">
                              <Checkbox
                                checked={group.items.length > 0 && group.items.every(item => selectedItems.has(item.id))}
                                onCheckedChange={(checked) => handleSelectAllInLocation(group.items, checked as boolean)}
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
                          {group.items.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-6">
                                <p className="text-sm text-muted-foreground">
                                  No items match the current filters
                                </p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            group.items.map((item) => (
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
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>

      {/* Action Bar */}
      {selectedItems.size > 0 && (
        <Card className="sticky bottom-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{selectedItems.size}</span> items selected across locations
              </div>
              <Link
                href={{
                  pathname: "/store-operations/stock-replenishment/new",
                  query: { items: Array.from(selectedItems).join(",") }
                }}
              >
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Transfer Request
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Recent Transfer Requests</CardTitle>
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
              No transfer requests yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>From Location</TableHead>
                    <TableHead>To Location</TableHead>
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
                          <Warehouse className="h-4 w-4 text-muted-foreground" />
                          {request.fromLocationName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {request.toLocationName}
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
