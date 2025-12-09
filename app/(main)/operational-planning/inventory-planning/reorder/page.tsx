"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  Truck,
  ShoppingCart,
  Warehouse,
  ChevronRightIcon
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils/formatters"

// Types for reorder optimization
interface ReorderRecommendation {
  id: string
  productId: string
  productCode: string
  productName: string
  category: string
  locationId: string
  locationName: string
  currentROP: number
  currentEOQ: number
  recommendedROP: number
  recommendedEOQ: number
  currentStock: number
  turnoverRate: number
  currentCarryingCost: number
  recommendedCarryingCost: number
  annualSavings: number
  riskLevel: 'low' | 'medium' | 'high'
  actionType: 'implement' | 'pilot' | 'monitor' | 'reject'
  leadTime: number
  dailyDemand: number
  demandVariability: number
  currentServiceLevel: number
  targetServiceLevel: number
  currentSafetyStock: number
  recommendedSafetyStock: number
  paybackPeriod: number
  unit: string
}

// Mock data generator
function generateReorderRecommendations(): ReorderRecommendation[] {
  const products = [
    { code: 'OIL-001', name: 'Olive Oil Extra Virgin 1L', category: 'Oils & Fats', unit: 'bottles' },
    { code: 'FLR-001', name: 'Flour All-Purpose 25kg', category: 'Dry Goods', unit: 'bags' },
    { code: 'CRM-001', name: 'Heavy Cream 1L', category: 'Dairy', unit: 'cartons' },
    { code: 'TRF-001', name: 'Truffle Oil 250ml', category: 'Specialty', unit: 'bottles' },
    { code: 'RCE-001', name: 'Jasmine Rice 5kg', category: 'Dry Goods', unit: 'bags' },
    { code: 'BTR-001', name: 'Butter Unsalted 500g', category: 'Dairy', unit: 'packs' },
    { code: 'CHK-001', name: 'Chicken Breast 1kg', category: 'Proteins', unit: 'kg' },
    { code: 'SAL-001', name: 'Atlantic Salmon Fillet', category: 'Seafood', unit: 'kg' },
    { code: 'TOM-001', name: 'Canned Tomatoes 400g', category: 'Canned Goods', unit: 'cans' },
    { code: 'SPC-001', name: 'Mixed Spice Blend', category: 'Spices', unit: 'jars' },
    { code: 'VEG-001', name: 'Fresh Spinach 500g', category: 'Produce', unit: 'bags' },
    { code: 'EGG-001', name: 'Free Range Eggs Dozen', category: 'Dairy', unit: 'dozens' },
  ]

  const locations = [
    { id: 'loc-1', name: 'Main Kitchen' },
    { id: 'loc-2', name: 'Satellite Kitchen' },
    { id: 'loc-3', name: 'Central Storage' },
  ]

  const riskLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']
  const actionTypes: Array<'implement' | 'pilot' | 'monitor' | 'reject'> = ['implement', 'pilot', 'monitor', 'reject']

  return products.flatMap((product, pIdx) =>
    locations.slice(0, Math.random() > 0.5 ? 2 : 1).map((location, lIdx) => {
      const currentROP = Math.floor(Math.random() * 40) + 10
      const currentEOQ = Math.floor(Math.random() * 30) + 20
      const ropChange = Math.floor(Math.random() * 20) - 10
      const eoqChange = Math.floor(Math.random() * 15) - 5
      const currentCarryingCost = Math.floor(Math.random() * 200) + 100
      const savings = Math.floor(Math.random() * 150) + 20
      const riskLevel = riskLevels[Math.floor(Math.random() * 3)]
      const actionType = actionTypes[Math.floor(Math.random() * 4)]

      return {
        id: `rec-${pIdx}-${lIdx}`,
        productId: `prod-${pIdx}`,
        productCode: product.code,
        productName: product.name,
        category: product.category,
        locationId: location.id,
        locationName: location.name,
        currentROP,
        currentEOQ,
        recommendedROP: Math.max(5, currentROP + ropChange),
        recommendedEOQ: Math.max(10, currentEOQ + eoqChange),
        currentStock: Math.floor(Math.random() * 60) + 20,
        turnoverRate: parseFloat((Math.random() * 15 + 3).toFixed(1)),
        currentCarryingCost,
        recommendedCarryingCost: currentCarryingCost - savings,
        annualSavings: savings,
        riskLevel,
        actionType,
        leadTime: Math.floor(Math.random() * 7) + 2,
        dailyDemand: parseFloat((Math.random() * 5 + 1).toFixed(1)),
        demandVariability: Math.floor(Math.random() * 25) + 5,
        currentServiceLevel: Math.floor(Math.random() * 10) + 85,
        targetServiceLevel: 95,
        currentSafetyStock: Math.floor(Math.random() * 15) + 5,
        recommendedSafetyStock: Math.floor(Math.random() * 12) + 3,
        paybackPeriod: parseFloat((Math.random() * 3 + 0.5).toFixed(1)),
        unit: product.unit,
      }
    })
  )
}

export default function ReorderManagementPage() {
  const [recommendations] = useState<ReorderRecommendation[]>(generateReorderRecommendations)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [actionTypeFilter, setActionTypeFilter] = useState("all")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Get unique values for filters
  const locations = useMemo(() =>
    Array.from(new Set(recommendations.map(r => JSON.stringify({ id: r.locationId, name: r.locationName }))))
      .map(s => JSON.parse(s)),
    [recommendations]
  )

  const categories = useMemo(() =>
    Array.from(new Set(recommendations.map(r => r.category))),
    [recommendations]
  )

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      if (searchTerm && !rec.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !rec.productCode.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (locationFilter !== "all" && rec.locationId !== locationFilter) return false
      if (categoryFilter !== "all" && rec.category !== categoryFilter) return false
      if (actionTypeFilter !== "all" && rec.actionType !== actionTypeFilter) return false
      return true
    })
  }, [recommendations, searchTerm, locationFilter, categoryFilter, actionTypeFilter])

  // Calculate summary stats
  const summaryStats = useMemo(() => ({
    itemsAnalyzed: filteredRecommendations.length,
    proposedChanges: filteredRecommendations.filter(r => r.actionType === 'implement' || r.actionType === 'pilot').length,
    totalSavings: filteredRecommendations.reduce((sum, r) => sum + r.annualSavings, 0),
  }), [filteredRecommendations])

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Toggle item selection
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
    if (selectedItems.size === filteredRecommendations.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredRecommendations.map(r => r.id)))
    }
  }

  // Render risk badge
  const renderRiskBadge = (risk: ReorderRecommendation['riskLevel']) => {
    const variants = {
      low: { className: "bg-green-50 text-green-700 border-green-200" },
      medium: { className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      high: { className: "bg-red-50 text-red-700 border-red-200" },
    }
    return (
      <Badge variant="outline" className={variants[risk].className}>
        {risk.charAt(0).toUpperCase() + risk.slice(1)}
      </Badge>
    )
  }

  // Render action type badge
  const renderActionBadge = (action: ReorderRecommendation['actionType']) => {
    const variants = {
      implement: { className: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
      pilot: { className: "bg-blue-50 text-blue-700 border-blue-200", icon: TrendingUp },
      monitor: { className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: AlertTriangle },
      reject: { className: "bg-gray-50 text-gray-700 border-gray-200", icon: XCircle },
    }
    const Icon = variants[action].icon
    return (
      <Badge variant="outline" className={`${variants[action].className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    )
  }

  // Calculate change percentage
  const calcChangePercent = (current: number, recommended: number) => {
    const change = ((recommended - current) / current) * 100
    return change.toFixed(0)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/operational-planning/inventory-planning">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Truck className="h-7 w-7 text-blue-600" />
              Supplier Reorder Planning
            </h1>
            <p className="text-sm text-muted-foreground">
              Optimize purchasing from external suppliers - EOQ, reorder points, and safety stock
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
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <ShoppingCart className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>SUPPLIER PURCHASING:</strong> This module calculates when and how much to order from external vendors.
          For internal transfers between hotel locations, use{" "}
          <Link href="/store-operations" className="underline font-medium hover:text-blue-900">
            Stock Replenishment
          </Link>{" "}
          in Store Operations.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="implement">Implement</SelectItem>
                <SelectItem value="pilot">Pilot</SelectItem>
                <SelectItem value="monitor">Monitor</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Items Analyzed</p>
                <p className="text-2xl font-bold">{formatNumber(summaryStats.itemsAnalyzed)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Proposed Changes</p>
                <p className="text-2xl font-bold">{formatNumber(summaryStats.proposedChanges)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalSavings)}</p>
                <p className="text-xs text-muted-foreground">Annual estimate</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-lg">Optimization Recommendations</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                disabled={selectedItems.size === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Selected ({selectedItems.size})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedItems.size === filteredRecommendations.length && filteredRecommendations.length > 0}
                      onCheckedChange={toggleAllSelections}
                    />
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Current ROP</TableHead>
                  <TableHead className="text-center">Current EOQ</TableHead>
                  <TableHead className="text-center">Recommended ROP</TableHead>
                  <TableHead className="text-center">Recommended EOQ</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead className="text-center">Risk</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecommendations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No recommendations found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecommendations.map((rec) => (
                    <Collapsible key={rec.id} asChild open={expandedRows.has(rec.id)}>
                      <>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.has(rec.id)}
                              onCheckedChange={() => toggleSelection(rec.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => toggleRow(rec.id)}
                              >
                                {expandedRows.has(rec.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{rec.productName}</p>
                              <p className="text-sm text-muted-foreground">{rec.productCode} • {rec.locationName}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{rec.currentROP}</TableCell>
                          <TableCell className="text-center">{rec.currentEOQ}</TableCell>
                          <TableCell className="text-center">
                            <span className={rec.recommendedROP < rec.currentROP ? 'text-green-600' : rec.recommendedROP > rec.currentROP ? 'text-orange-600' : ''}>
                              {rec.recommendedROP}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={rec.recommendedEOQ > rec.currentEOQ ? 'text-green-600' : rec.recommendedEOQ < rec.currentEOQ ? 'text-orange-600' : ''}>
                              {rec.recommendedEOQ}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(rec.annualSavings)}
                          </TableCell>
                          <TableCell className="text-center">
                            {renderRiskBadge(rec.riskLevel)}
                          </TableCell>
                          <TableCell className="text-center">
                            {renderActionBadge(rec.actionType)}
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={10} className="p-0">
                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Current Metrics */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm border-b pb-2">Current Metrics</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Stock Level:</span>
                                      <span className="ml-2 font-medium">{rec.currentStock} {rec.unit}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Turnover Rate:</span>
                                      <span className="ml-2 font-medium">{rec.turnoverRate}x</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Carrying Cost:</span>
                                      <span className="ml-2 font-medium">{formatCurrency(rec.currentCarryingCost)}/year</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Service Level:</span>
                                      <span className="ml-2 font-medium">{rec.currentServiceLevel}%</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Lead Time:</span>
                                      <span className="ml-2 font-medium">{rec.leadTime} days</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Daily Demand:</span>
                                      <span className="ml-2 font-medium">{rec.dailyDemand} {rec.unit}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Demand Variability:</span>
                                      <span className="ml-2 font-medium">{rec.demandVariability}%</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Safety Stock:</span>
                                      <span className="ml-2 font-medium">{rec.currentSafetyStock} {rec.unit}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Recommended Changes */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm border-b pb-2">Recommended Changes</h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Reorder Point:</span>
                                      <span className="ml-2 font-medium">
                                        {rec.currentROP} → {rec.recommendedROP}{' '}
                                        <span className={Number(calcChangePercent(rec.currentROP, rec.recommendedROP)) < 0 ? 'text-green-600' : 'text-orange-600'}>
                                          ({calcChangePercent(rec.currentROP, rec.recommendedROP)}%)
                                        </span>
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Order Quantity:</span>
                                      <span className="ml-2 font-medium">
                                        {rec.currentEOQ} → {rec.recommendedEOQ}{' '}
                                        <span className={Number(calcChangePercent(rec.currentEOQ, rec.recommendedEOQ)) > 0 ? 'text-green-600' : 'text-orange-600'}>
                                          ({calcChangePercent(rec.currentEOQ, rec.recommendedEOQ) > '0' ? '+' : ''}{calcChangePercent(rec.currentEOQ, rec.recommendedEOQ)}%)
                                        </span>
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Safety Stock:</span>
                                      <span className="ml-2 font-medium">
                                        {rec.currentSafetyStock} → {rec.recommendedSafetyStock}{' '}
                                        <span className={rec.recommendedSafetyStock < rec.currentSafetyStock ? 'text-green-600' : 'text-orange-600'}>
                                          ({calcChangePercent(rec.currentSafetyStock, rec.recommendedSafetyStock)}%)
                                        </span>
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Target Service:</span>
                                      <span className="ml-2 font-medium">{rec.currentServiceLevel}% → {rec.targetServiceLevel}%</span>
                                    </div>
                                  </div>

                                  <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                                    <h5 className="font-medium text-green-800 text-sm mb-2">Savings Breakdown</h5>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                                      <div>Carrying Cost: {formatCurrency(rec.currentCarryingCost - rec.recommendedCarryingCost)}</div>
                                      <div>Total Annual: {formatCurrency(rec.annualSavings)}</div>
                                      <div className="col-span-2">Payback Period: {rec.paybackPeriod} months</div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 mt-4">
                                    <Button size="sm" className="flex-1">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Apply This Recommendation
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                      <History className="h-4 w-4 mr-2" />
                                      History
                                    </Button>
                                  </div>

                                  <div className="mt-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                                    <strong>Risk Assessment:</strong> {rec.riskLevel.toUpperCase()} - {
                                      rec.riskLevel === 'low' ? 'Minor changes to non-critical item' :
                                      rec.riskLevel === 'medium' ? 'Moderate changes, recommend pilot testing' :
                                      'Significant changes to critical item, careful review required'
                                    }
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination info */}
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <div>
              Showing {filteredRecommendations.length} of {recommendations.length} recommendations
            </div>
            <div>
              {selectedItems.size > 0 && (
                <span className="text-primary">{selectedItems.size} items selected</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cross-link to Stock Replenishment */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Warehouse className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">Need internal transfers?</p>
                <p className="text-sm text-green-700">
                  Transfer stock between hotel locations (kitchen, bar, outlets) using Stock Replenishment.
                </p>
              </div>
            </div>
            <Link href="/store-operations">
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                Go to Stock Replenishment
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
