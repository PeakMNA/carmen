"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  Warehouse,
  Package,
  AlertTriangle,
  AlertCircle,
  Search,
  Plus,
  MapPin,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  TrendingDown,
  Filter,
  BarChart3,
  ArrowUpRight,
  PackageCheck,
  PackageX,
  Truck
} from "lucide-react"
import { useSimpleUser } from "@/lib/context/simple-user-context"
import {
  getItemsBelowParLevelByLocations,
  mockInventoryLocations,
  type TransferItem
} from "@/lib/mock-data"
import { InventoryLocationType } from "@/lib/types/location-management"

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getUrgencyBadge(urgency: string) {
  const config: Record<string, { variant: "destructive" | "default" | "secondary" | "outline"; label: string; icon: React.ReactNode; className?: string }> = {
    critical: { variant: "destructive", label: "Critical", icon: <AlertCircle className="h-3 w-3" /> },
    warning: { variant: "outline", label: "Warning", icon: <AlertTriangle className="h-3 w-3" />, className: "border-amber-300 bg-amber-50 text-amber-700" },
    low: { variant: "secondary", label: "Low", icon: <TrendingDown className="h-3 w-3" /> }
  }
  const { variant, label, icon, className } = config[urgency] || { variant: "outline", label: urgency, icon: null }
  return (
    <Badge variant={variant} className={`gap-1 ${className || ''}`}>
      {icon}
      {label}
    </Badge>
  )
}

function getLocationTypeIcon(type: string) {
  switch (type) {
    case InventoryLocationType.INVENTORY:
      return <Warehouse className="h-4 w-4 text-emerald-600" />
    case InventoryLocationType.DIRECT:
      return <Package className="h-4 w-4 text-blue-600" />
    case InventoryLocationType.CONSIGNMENT:
      return <Truck className="h-4 w-4 text-orange-600" />
    default:
      return <MapPin className="h-4 w-4 text-gray-500" />
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StockReplenishmentDashboard() {
  const { user } = useSimpleUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set())

  // Get user's assigned inventory locations
  const userAssignedLocations = useMemo(() => {
    const locations = user?.locations || user?.availableLocations || []
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

  // Expand/Collapse all
  const expandAllLocations = () => {
    setExpandedLocations(new Set(filteredLocationGroups.map(g => g.locationId)))
  }

  const collapseAllLocations = () => {
    setExpandedLocations(new Set())
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const hasAssignedLocations = userAssignedLocations.length > 0

  // Calculate stock health percentage
  const stockHealthPercent = useMemo(() => {
    const totalItems = overallSummary.totalItemsBelowPar
    if (totalItems === 0) return 100
    const healthyRatio = overallSummary.lowCount / totalItems
    return Math.round(healthyRatio * 100)
  }, [overallSummary])

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Warehouse className="h-7 w-7 text-emerald-600" />
            Stock Replenishment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage inventory levels across your assigned locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href="/store-operations/stock-replenishment/new">
            <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Warning when no assigned locations */}
      {!hasAssignedLocations && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>No inventory locations assigned.</strong> Please contact your administrator to assign inventory locations.
          </AlertDescription>
        </Alert>
      )}

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stock Health Card */}
        <Card className="md:col-span-1 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stock Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-emerald-700">
                {overallSummary.totalItemsBelowPar === 0 ? '100%' : `${overallSummary.totalItemsBelowPar}`}
              </span>
              {overallSummary.totalItemsBelowPar > 0 && (
                <span className="text-sm text-muted-foreground mb-1">items need attention</span>
              )}
            </div>
            {overallSummary.totalItemsBelowPar === 0 ? (
              <div className="flex items-center gap-1 text-sm text-emerald-600 mt-2">
                <CheckCircle2 className="h-4 w-4" />
                All items at optimal levels
              </div>
            ) : (
              <Progress value={stockHealthPercent} className="h-2 mt-3" />
            )}
          </CardContent>
        </Card>

        {/* Critical Items */}
        <Card className={overallSummary.criticalCount > 0 ? "border-red-200 bg-red-50/30" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${overallSummary.criticalCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {overallSummary.criticalCount}
              </span>
              <span className="text-sm text-muted-foreground">items</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Below minimum stock level</p>
            {overallSummary.criticalCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-100"
                onClick={() => handleSelectByUrgency("critical")}
              >
                Select all critical
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Warning Items */}
        <Card className={overallSummary.warningCount > 0 ? "border-amber-200 bg-amber-50/30" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${overallSummary.warningCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                {overallSummary.warningCount}
              </span>
              <span className="text-sm text-muted-foreground">items</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Below reorder point</p>
            {overallSummary.warningCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                onClick={() => handleSelectByUrgency("warning")}
              >
                Select all warning
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${overallSummary.lowCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                {overallSummary.lowCount}
              </span>
              <span className="text-sm text-muted-foreground">items</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Below par level</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 w-[220px] h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations ({userAssignedLocations.length})</SelectItem>
                  {userAssignedLocations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItems(new Set())}
                  className="text-muted-foreground"
                >
                  Clear ({selectedItems.size})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={expandAllLocations}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAllLocations}>
                Collapse
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grouped by Location */}
      <div className="space-y-3">
        {filteredLocationGroups.length === 0 ? (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <PackageCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-800">All Stock Levels Optimal</h3>
              <p className="mt-2 text-sm text-emerald-600">
                No items require replenishment at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLocationGroups.map((group) => {
            const isExpanded = expandedLocations.has(group.locationId)
            const hasCritical = group.filteredSummary.critical > 0

            return (
              <Card
                key={group.locationId}
                className={hasCritical ? "border-red-200" : ""}
              >
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleLocationExpansion(group.locationId)}
                >
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            hasCritical ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            {getLocationTypeIcon(group.locationType || '')}
                          </div>
                          <div>
                            <h3 className="font-semibold">{group.locationName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {group.filteredSummary.total} items below par
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="hidden md:flex gap-2">
                            {group.filteredSummary.critical > 0 && (
                              <Badge variant="destructive" className="font-normal">
                                {group.filteredSummary.critical} critical
                              </Badge>
                            )}
                            {group.filteredSummary.warning > 0 && (
                              <Badge variant="outline" className="font-normal border-amber-300 bg-amber-50 text-amber-700">
                                {group.filteredSummary.warning} warning
                              </Badge>
                            )}
                            {group.filteredSummary.low > 0 && (
                              <Badge variant="secondary" className="font-normal">
                                {group.filteredSummary.low} low
                              </Badge>
                            )}
                          </div>
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 px-4 pb-4">
                      {/* Progress Bar */}
                      <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-gray-100 mb-4">
                        {group.summary.critical > 0 && (
                          <div
                            className="bg-red-500"
                            style={{ width: `${(group.summary.critical / group.summary.total) * 100}%` }}
                          />
                        )}
                        {group.summary.warning > 0 && (
                          <div
                            className="bg-amber-500"
                            style={{ width: `${(group.summary.warning / group.summary.total) * 100}%` }}
                          />
                        )}
                        {group.summary.low > 0 && (
                          <div
                            className="bg-blue-400"
                            style={{ width: `${(group.summary.low / group.summary.total) * 100}%` }}
                          />
                        )}
                      </div>

                      {/* Items Table */}
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-[40px]">
                                <Checkbox
                                  checked={group.items.length > 0 && group.items.every(item => selectedItems.has(item.id))}
                                  onCheckedChange={(checked) => handleSelectAllInLocation(group.items, checked as boolean)}
                                />
                              </TableHead>
                              <TableHead className="font-medium">Product</TableHead>
                              <TableHead className="font-medium hidden md:table-cell">Category</TableHead>
                              <TableHead className="font-medium text-right">Current</TableHead>
                              <TableHead className="font-medium text-right">Par Level</TableHead>
                              <TableHead className="font-medium text-right">Needed</TableHead>
                              <TableHead className="font-medium">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.items.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                  <PackageX className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground">
                                    No items match the current filters
                                  </p>
                                </TableCell>
                              </TableRow>
                            ) : (
                              group.items.map((item) => (
                                <TableRow
                                  key={item.id}
                                  className={`${selectedItems.has(item.id) ? "bg-emerald-50" : ""} hover:bg-muted/30`}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedItems.has(item.id)}
                                      onCheckedChange={(checked) => handleItemSelect(item.id, checked as boolean)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{item.productName}</p>
                                      <p className="text-xs text-muted-foreground">{item.productCode}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <span className="text-sm text-muted-foreground">{item.categoryName}</span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className={`font-mono ${
                                            item.urgency === "critical" ? "text-red-600 font-semibold" :
                                            item.urgency === "warning" ? "text-amber-600" : ""
                                          }`}>
                                            {formatNumber(item.currentStock)}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{item.unit}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-mono text-muted-foreground">
                                      {formatNumber(item.parLevel)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-mono font-medium text-emerald-600">
                                      +{formatNumber(item.recommendedQty)}
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
            )
          })
        )}
      </div>

      {/* Floating Action Bar */}
      {selectedItems.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Card className="shadow-lg border-emerald-200 bg-white/95 backdrop-blur">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">{selectedItems.size}</span>
                    <span className="text-muted-foreground"> items selected</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-border" />
                <Link
                  href={{
                    pathname: "/store-operations/stock-replenishment/new",
                    query: { items: Array.from(selectedItems).join(",") }
                  }}
                >
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4" />
                    Create Replenishment Request
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
