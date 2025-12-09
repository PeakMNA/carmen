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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight,
  Package,
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  RotateCcw,
  Trash2,
  Play
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils/formatters"

// Types for dead stock analysis
interface DeadStockItem {
  id: string
  productId: string
  productCode: string
  productName: string
  category: string
  locationId: string
  locationName: string
  currentStock: number
  unit: string
  value: number
  lastMovementDate: string
  daysSinceMovement: number
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  monthsOfStock: number
  recommendedAction: 'liquidate' | 'return' | 'writeoff' | 'continue' | 'reduce'
  liquidationValue: number
  potentialLoss: number
  expiryDate?: string
  daysUntilExpiry?: number
}

// Mock data generator
function generateDeadStockItems(): DeadStockItem[] {
  const products = [
    { code: 'TRF-002', name: 'Truffle Salt 100g', category: 'Specialty', unit: 'jars' },
    { code: 'SAF-001', name: 'Saffron 5g', category: 'Spices', unit: 'packets' },
    { code: 'CAV-001', name: 'Beluga Caviar 50g', category: 'Luxury', unit: 'tins' },
    { code: 'VIN-001', name: 'Aged Balsamic Vinegar 250ml', category: 'Condiments', unit: 'bottles' },
    { code: 'FOI-001', name: 'Foie Gras 200g', category: 'Luxury', unit: 'tins' },
    { code: 'MAT-001', name: 'Matcha Powder Premium 100g', category: 'Beverages', unit: 'tins' },
    { code: 'VAN-001', name: 'Vanilla Beans Grade A', category: 'Spices', unit: 'pods' },
    { code: 'OLI-002', name: 'Olive Oil Single Estate 500ml', category: 'Oils', unit: 'bottles' },
    { code: 'CHE-001', name: 'Aged Parmesan 24 month', category: 'Cheese', unit: 'kg' },
    { code: 'WIN-001', name: 'Cooking Wine Marsala', category: 'Wines', unit: 'bottles' },
    { code: 'NUT-001', name: 'Macadamia Nuts Raw 500g', category: 'Nuts', unit: 'bags' },
    { code: 'HNY-001', name: 'Manuka Honey UMF 20+', category: 'Sweeteners', unit: 'jars' },
  ]

  const locations = [
    { id: 'loc-1', name: 'Main Kitchen' },
    { id: 'loc-2', name: 'Cold Storage' },
    { id: 'loc-3', name: 'Dry Storage' },
  ]

  const riskLevels: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low']
  const actions: Array<'liquidate' | 'return' | 'writeoff' | 'continue' | 'reduce'> = ['liquidate', 'return', 'writeoff', 'continue', 'reduce']

  return products.map((product, idx) => {
    const location = locations[idx % locations.length]
    const daysSinceMovement = Math.floor(Math.random() * 300) + 60
    const riskLevel = daysSinceMovement > 365 ? 'critical' :
                      daysSinceMovement > 180 ? 'high' :
                      daysSinceMovement > 90 ? 'medium' : 'low'
    const currentStock = Math.floor(Math.random() * 25) + 3
    const unitValue = Math.floor(Math.random() * 100) + 20
    const value = currentStock * unitValue
    const liquidationRate = riskLevel === 'critical' ? 0.3 :
                           riskLevel === 'high' ? 0.4 :
                           riskLevel === 'medium' ? 0.6 : 0.8

    const recommendedAction = riskLevel === 'critical' ? (Math.random() > 0.5 ? 'writeoff' : 'liquidate') :
                              riskLevel === 'high' ? (Math.random() > 0.5 ? 'liquidate' : 'return') :
                              riskLevel === 'medium' ? 'reduce' : 'continue'

    const lastDate = new Date()
    lastDate.setDate(lastDate.getDate() - daysSinceMovement)

    return {
      id: `dead-${idx}`,
      productId: `prod-${idx}`,
      productCode: product.code,
      productName: product.name,
      category: product.category,
      locationId: location.id,
      locationName: location.name,
      currentStock,
      unit: product.unit,
      value,
      lastMovementDate: lastDate.toISOString().split('T')[0],
      daysSinceMovement,
      riskLevel,
      monthsOfStock: Math.floor(Math.random() * 40) + 10,
      recommendedAction,
      liquidationValue: Math.round(value * liquidationRate),
      potentialLoss: Math.round(value * (1 - liquidationRate)),
      expiryDate: Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      daysUntilExpiry: Math.random() > 0.7 ? Math.floor(Math.random() * 90) + 10 : undefined,
    }
  })
}

export default function DeadStockAnalysisPage() {
  const [deadStockItems] = useState<DeadStockItem[]>(generateDeadStockItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [thresholdDays, setThresholdDays] = useState("90")
  const [locationFilter, setLocationFilter] = useState("all")
  const [riskLevelFilter, setRiskLevelFilter] = useState("all")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Get unique locations
  const locations = useMemo(() =>
    Array.from(new Set(deadStockItems.map(item => JSON.stringify({ id: item.locationId, name: item.locationName }))))
      .map(s => JSON.parse(s)),
    [deadStockItems]
  )

  // Filter items
  const filteredItems = useMemo(() => {
    return deadStockItems.filter(item => {
      if (searchTerm && !item.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.productCode.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (item.daysSinceMovement < parseInt(thresholdDays)) return false
      if (locationFilter !== "all" && item.locationId !== locationFilter) return false
      if (riskLevelFilter !== "all" && item.riskLevel !== riskLevelFilter) return false
      return true
    })
  }, [deadStockItems, searchTerm, thresholdDays, locationFilter, riskLevelFilter])

  // Calculate risk overview stats
  const riskOverview = useMemo(() => {
    const overview = {
      critical: { count: 0, value: 0 },
      high: { count: 0, value: 0 },
      medium: { count: 0, value: 0 },
      low: { count: 0, value: 0 },
    }

    filteredItems.forEach(item => {
      overview[item.riskLevel].count++
      overview[item.riskLevel].value += item.value
    })

    return overview
  }, [filteredItems])

  // Calculate action summary
  const actionSummary = useMemo(() => {
    const summary: Record<string, { count: number; value: number }> = {
      continue: { count: 0, value: 0 },
      reduce: { count: 0, value: 0 },
      liquidate: { count: 0, value: 0 },
      return: { count: 0, value: 0 },
      writeoff: { count: 0, value: 0 },
    }

    filteredItems.forEach(item => {
      summary[item.recommendedAction].count++
      summary[item.recommendedAction].value += item.value
    })

    return summary
  }, [filteredItems])

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Toggle item selection
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Toggle all selections
  const toggleAllSelections = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)))
    }
  }

  // Render risk badge
  const renderRiskBadge = (risk: DeadStockItem['riskLevel']) => {
    const variants = {
      critical: { className: "bg-red-100 text-red-800 border-red-300", label: "CRITICAL" },
      high: { className: "bg-orange-100 text-orange-800 border-orange-300", label: "HIGH" },
      medium: { className: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "MEDIUM" },
      low: { className: "bg-green-100 text-green-800 border-green-300", label: "LOW" },
    }
    return (
      <Badge variant="outline" className={variants[risk].className}>
        {variants[risk].label}
      </Badge>
    )
  }

  // Render action badge
  const renderActionBadge = (action: DeadStockItem['recommendedAction']) => {
    const variants = {
      liquidate: { className: "bg-purple-50 text-purple-700 border-purple-200", icon: ArrowDownToLine },
      return: { className: "bg-blue-50 text-blue-700 border-blue-200", icon: RotateCcw },
      writeoff: { className: "bg-red-50 text-red-700 border-red-200", icon: Trash2 },
      continue: { className: "bg-green-50 text-green-700 border-green-200", icon: Play },
      reduce: { className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: AlertTriangle },
    }
    const Icon = variants[action].icon
    return (
      <Badge variant="outline" className={`${variants[action].className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
              <Package className="h-7 w-7 text-orange-600" />
              Dead Stock Analysis
            </h1>
            <p className="text-sm text-muted-foreground">
              Identify and manage obsolete inventory to reduce carrying costs
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

      {/* Risk Overview Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Risk Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Critical */}
            <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-800">CRITICAL</span>
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-900 mt-2">{riskOverview.critical.count}</p>
              <p className="text-sm text-red-700">{formatCurrency(riskOverview.critical.value)}</p>
            </div>

            {/* High */}
            <div className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-800">HIGH</span>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-900 mt-2">{riskOverview.high.count}</p>
              <p className="text-sm text-orange-700">{formatCurrency(riskOverview.high.value)}</p>
            </div>

            {/* Medium */}
            <div className="p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-800">MEDIUM</span>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{riskOverview.medium.count}</p>
              <p className="text-sm text-yellow-700">{formatCurrency(riskOverview.medium.value)}</p>
            </div>

            {/* Low */}
            <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">LOW</span>
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900 mt-2">{riskOverview.low.count}</p>
              <p className="text-sm text-green-700">{formatCurrency(riskOverview.low.value)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Threshold:</span>
              <Select value={thresholdDays} onValueChange={setThresholdDays}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="120">120 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">365 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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

      {/* Dead Stock Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-lg">Dead Stock Items</CardTitle>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedItems.size === 0}
                  >
                    Bulk Action
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Liquidate Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Return to Vendor
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Write Off
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                      checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                      onCheckedChange={toggleAllSelections}
                    />
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-center">Last Move</TableHead>
                  <TableHead className="text-center">Days</TableHead>
                  <TableHead className="text-center">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No dead stock items found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <Collapsible key={item.id} asChild open={expandedRows.has(item.id)}>
                      <>
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.has(item.id)}
                              onCheckedChange={() => toggleSelection(item.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => toggleRow(item.id)}
                              >
                                {expandedRows.has(item.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">{item.productCode} • {item.locationName}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(item.currentStock)} {item.unit}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.value)}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatDate(item.lastMovementDate)}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {item.daysSinceMovement}
                          </TableCell>
                          <TableCell className="text-center">
                            {renderRiskBadge(item.riskLevel)}
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={8} className="p-0">
                              <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Stock Analysis */}
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Stock Analysis</h4>
                                    <div className="text-sm space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Months of Stock:</span>
                                        <span className="font-medium">{item.monthsOfStock}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Current Value:</span>
                                        <span className="font-medium">{formatCurrency(item.value)}</span>
                                      </div>
                                      {item.expiryDate && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Expires:</span>
                                          <span className="font-medium text-red-600">{formatDate(item.expiryDate)} ({item.daysUntilExpiry} days)</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Financial Impact */}
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Financial Impact</h4>
                                    <div className="text-sm space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Liquidation Value:</span>
                                        <span className="font-medium text-green-600">{formatCurrency(item.liquidationValue)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Potential Loss:</span>
                                        <span className="font-medium text-red-600">{formatCurrency(item.potentialLoss)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Recovery Rate:</span>
                                        <span className="font-medium">{Math.round((item.liquidationValue / item.value) * 100)}%</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Recommendation */}
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Recommendation</h4>
                                    <div className="flex items-center gap-2 mb-2">
                                      {renderActionBadge(item.recommendedAction)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {item.recommendedAction === 'liquidate' && 'Sell at discounted price to recover partial value'}
                                      {item.recommendedAction === 'return' && 'Return to vendor for credit or exchange'}
                                      {item.recommendedAction === 'writeoff' && 'Write off from inventory - no recoverable value'}
                                      {item.recommendedAction === 'continue' && 'Keep monitoring - may still move'}
                                      {item.recommendedAction === 'reduce' && 'Reduce stock through promotions or menu specials'}
                                    </p>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 pt-2 border-t">
                                  <Button size="sm" variant="default">
                                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                                    Liquidate
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Return to Vendor
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Write Off
                                  </Button>
                                  <Button size="sm" variant="ghost">
                                    <Play className="h-4 w-4 mr-2" />
                                    Continue Monitoring
                                  </Button>
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

          {/* Actions Summary */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Actions Summary</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <span>
                <span className="text-muted-foreground">Continue:</span>{' '}
                <span className="font-medium">{actionSummary.continue.count}</span>{' '}
                <span className="text-muted-foreground">({formatCurrency(actionSummary.continue.value)})</span>
              </span>
              <span className="text-muted-foreground">|</span>
              <span>
                <span className="text-muted-foreground">Reduce:</span>{' '}
                <span className="font-medium">{actionSummary.reduce.count}</span>{' '}
                <span className="text-muted-foreground">({formatCurrency(actionSummary.reduce.value)})</span>
              </span>
              <span className="text-muted-foreground">|</span>
              <span>
                <span className="text-muted-foreground">Liquidate:</span>{' '}
                <span className="font-medium">{actionSummary.liquidate.count}</span>{' '}
                <span className="text-muted-foreground">({formatCurrency(actionSummary.liquidate.value)})</span>
              </span>
              <span className="text-muted-foreground">|</span>
              <span>
                <span className="text-muted-foreground">Return:</span>{' '}
                <span className="font-medium">{actionSummary.return.count}</span>{' '}
                <span className="text-muted-foreground">({formatCurrency(actionSummary.return.value)})</span>
              </span>
              <span className="text-muted-foreground">|</span>
              <span>
                <span className="text-muted-foreground">Write Off:</span>{' '}
                <span className="font-medium">{actionSummary.writeoff.count}</span>{' '}
                <span className="text-muted-foreground">({formatCurrency(actionSummary.writeoff.value)})</span>
              </span>
            </div>
          </div>

          {/* Footer info */}
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <div>
              Showing {filteredItems.length} items with {thresholdDays}+ days since movement
            </div>
            <div>
              Total Value at Risk: <span className="font-medium text-foreground">{formatCurrency(filteredItems.reduce((sum, item) => sum + item.value, 0))}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
