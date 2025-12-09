"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser } from '@/lib/context/simple-user-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  ArrowUpDown,
  FileDown,
  Search,
  SlidersHorizontal,
  MapPin,
  List,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingDown,
  Clock,
  AlertTriangle,
  DollarSign,
  Package,
  AlertCircle,
  Target,
  ArrowRightLeft,
  Megaphone,
  Trash2,
  PauseCircle,
  BarChart3,
  Activity,
  Zap,
  CheckCircle2,
  TrendingUp
} from "lucide-react"
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart
} from 'recharts'
import { cn } from "@/lib/utils"
import { GroupedTable, useGroupedTable } from '@/components/inventory/GroupedTable'
import { ExportButton } from '@/components/inventory/ExportButton'
import { createExportData, ExportColumn } from '@/lib/utils/export-utils'
import { SlowMovingItem, generateSlowMovingItems, groupSlowMovingByLocation } from '@/lib/mock-data/location-inventory'

export default function SlowMovingPage() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [slowMovingItems, setSlowMovingItems] = useState<SlowMovingItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [riskLevelFilter, setRiskLevelFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [sortField, setSortField] = useState("daysSinceMovement")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"list" | "grouped">("list")
  const [groupedItems, setGroupedItems] = useState<Array<{
    locationId: string
    locationName: string
    items: SlowMovingItem[]
    subtotals: Record<string, number>
    isExpanded: boolean
  }>>([])

  const {
    groups,
    setGroups,
    toggleGroup,
    expandAll,
    collapseAll,
    calculateGrandTotals
  } = useGroupedTable(groupedItems)

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: 'productCode', label: 'Product Code', type: 'text' },
    { key: 'productName', label: 'Product Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'locationName', label: 'Location', type: 'text' },
    { key: 'currentStock', label: 'Current Stock', type: 'number' },
    { key: 'unit', label: 'Unit', type: 'text' },
    { key: 'value', label: 'Value', type: 'currency' },
    { key: 'daysSinceMovement', label: 'Days Since Movement', type: 'number' },
    { key: 'turnoverRate', label: 'Turnover Rate', type: 'number', formatter: (v) => `${v.toFixed(2)}x` },
    { key: 'riskLevel', label: 'Risk Level', type: 'text' },
    { key: 'suggestedAction', label: 'Suggested Action', type: 'text' },
    { key: 'lastMovementDate', label: 'Last Movement', type: 'date' }
  ]

  // Load mock data
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const data = generateSlowMovingItems()
      setSlowMovingItems(data)

      // Also generate grouped data
      const grouped = groupSlowMovingByLocation(data)
      setGroupedItems(grouped)
      setGroups(grouped)

      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [setGroups])

  // Update grouped data when filters change
  useEffect(() => {
    if (slowMovingItems.length > 0) {
      const filtered = getFilteredItems()
      const grouped = groupSlowMovingByLocation(filtered)
      setGroupedItems(grouped)
      setGroups(grouped)
    }
  }, [searchTerm, categoryFilter, riskLevelFilter, actionFilter, locationFilter, user, slowMovingItems, setGroups])

  // Filter items based on user permissions and filters
  const getFilteredItems = () => {
    let filteredItems = slowMovingItems

    // Filter by user's accessible locations if not admin
    if (user?.role !== 'System Administrator' && user?.availableLocations) {
      const userLocationIds = user.availableLocations.map(l => l.id)
      filteredItems = filteredItems.filter(item =>
        userLocationIds.includes(item.locationId)
      )
    }

    return filteredItems.filter(item => {
      // Search filter
      if (searchTerm && !item.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.productCode.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false
      }

      // Risk level filter
      if (riskLevelFilter !== "all" && item.riskLevel !== riskLevelFilter) {
        return false
      }

      // Action filter
      if (actionFilter !== "all" && item.suggestedAction !== actionFilter) {
        return false
      }

      // Location filter
      if (locationFilter !== "all" && item.locationId !== locationFilter) {
        return false
      }

      return true
    })
  }

  const filteredItems = useMemo(() =>
    getFilteredItems().sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "productCode":
          comparison = a.productCode.localeCompare(b.productCode)
          break
        case "productName":
          comparison = a.productName.localeCompare(b.productName)
          break
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
        case "daysSinceMovement":
          comparison = a.daysSinceMovement - b.daysSinceMovement
          break
        case "currentStock":
          comparison = a.currentStock - b.currentStock
          break
        case "value":
          comparison = a.value - b.value
          break
        case "turnoverRate":
          comparison = a.turnoverRate - b.turnoverRate
          break
        default:
          comparison = a.daysSinceMovement - b.daysSinceMovement
      }

      return sortDirection === "asc" ? comparison : -comparison
    }), [slowMovingItems, searchTerm, categoryFilter, riskLevelFilter, actionFilter, locationFilter, sortField, sortDirection, user])

  // Get unique categories for filter
  const categories = Array.from(new Set(slowMovingItems.map(item => item.category)))
  const locations = Array.from(new Set(slowMovingItems.map(item => ({ id: item.locationId, name: item.locationName }))))

  // Prepare export data
  const exportData = useMemo(() => {
    const filters = {
      search: searchTerm,
      category: categoryFilter,
      riskLevel: riskLevelFilter,
      action: actionFilter,
      location: locationFilter
    }

    const totalItems = viewMode === 'grouped' ?
      groups.reduce((sum, group) => sum + group.items.length, 0) :
      filteredItems.length

    const totalValue = viewMode === 'grouped' ?
      groups.reduce((sum, group) => sum + group.items.reduce((gsum, item) => gsum + item.value, 0), 0) :
      filteredItems.reduce((sum, item) => sum + item.value, 0)

    const avgDaysSinceMovement = totalItems > 0 ?
      (viewMode === 'grouped' ?
        groups.reduce((sum, group) => sum + group.items.reduce((gsum, item) => gsum + item.daysSinceMovement, 0), 0) :
        filteredItems.reduce((sum, item) => sum + item.daysSinceMovement, 0)) / totalItems : 0

    const criticalItems = viewMode === 'grouped' ?
      groups.reduce((sum, group) => sum + group.items.filter(item => item.riskLevel === 'critical').length, 0) :
      filteredItems.filter(item => item.riskLevel === 'critical').length

    const summary = {
      'Total Items': totalItems,
      'Total Value': formatCurrency(totalValue),
      'Critical Risk Items': criticalItems,
      'Average Days Since Movement': Math.round(avgDaysSinceMovement),
      'View Mode': viewMode === 'grouped' ? 'Grouped by Location' : 'List View'
    }

    const data = createExportData(
      'Slow Moving Inventory Report',
      exportColumns,
      viewMode === 'grouped' ? groups : undefined,
      viewMode === 'grouped' ? calculateGrandTotals(['currentStock', 'value', 'daysSinceMovement']) : undefined,
      filters,
      summary
    )

    // Add items for list view
    if (viewMode === 'list') {
      data.items = filteredItems
    }

    return data
  }, [groups, filteredItems, viewMode, searchTerm, categoryFilter, riskLevelFilter, actionFilter, locationFilter, exportColumns, calculateGrandTotals])

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Render risk level badge
  const renderRiskLevelBadge = (riskLevel: SlowMovingItem['riskLevel']) => {
    const variants = {
      low: { variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200" },
      medium: { variant: "outline" as const, className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      high: { variant: "outline" as const, className: "bg-orange-50 text-orange-700 border-orange-200" },
      critical: { variant: "destructive" as const, className: "" }
    }

    return (
      <Badge
        variant={variants[riskLevel].variant}
        className={variants[riskLevel].className}
      >
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
      </Badge>
    )
  }

  // Render suggested action badge
  const renderActionBadge = (action: SlowMovingItem['suggestedAction']) => {
    const variants = {
      transfer: { variant: "outline" as const, className: "bg-blue-50 text-blue-700 border-blue-200" },
      promote: { variant: "outline" as const, className: "bg-purple-50 text-purple-700 border-purple-200" },
      writeoff: { variant: "destructive" as const, className: "" },
      hold: { variant: "secondary" as const, className: "" }
    }

    return (
      <Badge
        variant={variants[action].variant}
        className={variants[action].className}
      >
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    )
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = filteredItems.length
    const totalValue = filteredItems.reduce((sum, item) => sum + item.value, 0)
    const avgDaysSinceMovement = totalItems > 0 ? filteredItems.reduce((sum, item) => sum + item.daysSinceMovement, 0) / totalItems : 0
    const criticalItems = filteredItems.filter(item => item.riskLevel === 'critical').length
    const highRiskItems = filteredItems.filter(item => item.riskLevel === 'high').length
    const mediumRiskItems = filteredItems.filter(item => item.riskLevel === 'medium').length
    const lowRiskItems = filteredItems.filter(item => item.riskLevel === 'low').length

    const transferItems = filteredItems.filter(item => item.suggestedAction === 'transfer').length
    const promoteItems = filteredItems.filter(item => item.suggestedAction === 'promote').length
    const writeoffItems = filteredItems.filter(item => item.suggestedAction === 'writeoff').length
    const holdItems = filteredItems.filter(item => item.suggestedAction === 'hold').length

    const criticalValue = filteredItems.filter(item => item.riskLevel === 'critical').reduce((sum, item) => sum + item.value, 0)

    return {
      totalItems,
      totalValue,
      avgDaysSinceMovement: Math.round(avgDaysSinceMovement),
      criticalItems,
      highRiskItems,
      mediumRiskItems,
      lowRiskItems,
      transferItems,
      promoteItems,
      writeoffItems,
      holdItems,
      criticalValue
    }
  }, [filteredItems])

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    // Risk distribution
    const riskDistribution = [
      { name: 'Critical', value: summaryStats.criticalItems, color: '#ef4444' },
      { name: 'High', value: summaryStats.highRiskItems, color: '#f97316' },
      { name: 'Medium', value: summaryStats.mediumRiskItems, color: '#eab308' },
      { name: 'Low', value: summaryStats.lowRiskItems, color: '#22c55e' }
    ].filter(d => d.value > 0)

    // Action distribution
    const actionDistribution = [
      { name: 'Transfer', value: summaryStats.transferItems, color: '#3b82f6' },
      { name: 'Promote', value: summaryStats.promoteItems, color: '#8b5cf6' },
      { name: 'Write Off', value: summaryStats.writeoffItems, color: '#ef4444' },
      { name: 'Hold', value: summaryStats.holdItems, color: '#6b7280' }
    ].filter(d => d.value > 0)

    // Category breakdown
    const categoryBreakdown = Array.from(new Set(filteredItems.map(item => item.category)))
      .map(cat => ({
        category: cat,
        items: filteredItems.filter(item => item.category === cat).length,
        value: filteredItems.filter(item => item.category === cat).reduce((sum, item) => sum + item.value, 0),
        avgDays: Math.round(filteredItems.filter(item => item.category === cat).reduce((sum, item) => sum + item.daysSinceMovement, 0) / filteredItems.filter(item => item.category === cat).length)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Location breakdown
    const locationBreakdown = Array.from(new Set(filteredItems.map(item => item.locationName)))
      .map(loc => ({
        location: loc,
        items: filteredItems.filter(item => item.locationName === loc).length,
        value: filteredItems.filter(item => item.locationName === loc).reduce((sum, item) => sum + item.value, 0),
        critical: filteredItems.filter(item => item.locationName === loc && item.riskLevel === 'critical').length
      }))
      .sort((a, b) => b.value - a.value)

    // Days since movement distribution
    const daysBuckets = [
      { range: '30-60 days', min: 30, max: 60 },
      { range: '60-90 days', min: 60, max: 90 },
      { range: '90-120 days', min: 90, max: 120 },
      { range: '120-180 days', min: 120, max: 180 },
      { range: '180+ days', min: 180, max: 9999 }
    ]

    const daysDistribution = daysBuckets.map(bucket => ({
      range: bucket.range,
      items: filteredItems.filter(item => item.daysSinceMovement >= bucket.min && item.daysSinceMovement < bucket.max).length,
      value: filteredItems.filter(item => item.daysSinceMovement >= bucket.min && item.daysSinceMovement < bucket.max).reduce((sum, item) => sum + item.value, 0)
    }))

    // Alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; title: string; description: string }[] = []

    if (summaryStats.criticalItems > 0) {
      alerts.push({
        type: 'critical',
        title: `${summaryStats.criticalItems} Critical Risk Items`,
        description: `${formatCurrency(summaryStats.criticalValue)} tied up in critical slow-moving inventory. Immediate action recommended.`
      })
    }

    if (summaryStats.writeoffItems > 0) {
      alerts.push({
        type: 'warning',
        title: `${summaryStats.writeoffItems} Items Recommended for Write-Off`,
        description: 'Review these items for potential disposal or donation.'
      })
    }

    const veryOldItems = filteredItems.filter(item => item.daysSinceMovement > 180).length
    if (veryOldItems > 0) {
      alerts.push({
        type: 'warning',
        title: `${veryOldItems} Items Inactive for 180+ Days`,
        description: 'Consider immediate action to reduce holding costs.'
      })
    }

    return {
      riskDistribution,
      actionDistribution,
      categoryBreakdown,
      locationBreakdown,
      daysDistribution,
      alerts
    }
  }, [filteredItems, summaryStats])

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-[300px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-[120px]" />
                  <Skeleton className="h-10 w-[120px]" />
                </div>
              </div>

              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingDown className="h-7 w-7 text-orange-600" />
            Slow Moving Inventory
          </h1>
          <p className="text-sm text-muted-foreground">
            Identify and manage products with low turnover rates
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-end md:self-auto">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <ExportButton
            data={exportData}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Alerts Section */}
      {analyticsData.alerts.length > 0 && (
        <div className="space-y-2">
          {analyticsData.alerts.map((alert, index) => (
            <Alert
              key={index}
              variant={alert.type === 'critical' ? 'destructive' : 'default'}
              className={cn(
                alert.type === 'warning' && 'border-amber-200 bg-amber-50 text-amber-800',
                alert.type === 'info' && 'border-blue-200 bg-blue-50 text-blue-800'
              )}
            >
              {alert.type === 'critical' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              )}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{formatNumber(summaryStats.totalItems)}</p>
                <p className="text-xs text-muted-foreground">slow-moving</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalValue)}</p>
                <p className="text-xs text-muted-foreground">tied up</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Avg Days Idle</p>
                <p className="text-2xl font-bold text-orange-600">{summaryStats.avgDaysSinceMovement}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={summaryStats.criticalItems > 0 ? 'border-red-200' : ''}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Critical Risk</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(summaryStats.criticalItems)}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(summaryStats.criticalValue)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">To Transfer</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(summaryStats.transferItems)}</p>
                <p className="text-xs text-muted-foreground">items</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">To Write Off</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(summaryStats.writeoffItems)}</p>
                <p className="text-xs text-muted-foreground">items</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="inventory">Inventory List</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="actions">Action Center</TabsTrigger>
            </TabsList>

            {/* Inventory List Tab */}
            <TabsContent value="inventory">
              <div className="space-y-4">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center bg-muted rounded-md p-1">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 px-3"
                    >
                      <List className="h-4 w-4 mr-1" />
                      List
                    </Button>
                    <Button
                      variant={viewMode === 'grouped' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grouped')}
                      className="h-8 px-3"
                    >
                      <LayoutGrid className="h-4 w-4 mr-1" />
                      Grouped
                    </Button>
                  </div>
                </div>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by product name or code..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {viewMode === 'grouped' && (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={expandAll}
                      className="h-10"
                    >
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Expand All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={collapseAll}
                      className="h-10"
                    >
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Collapse All
                    </Button>
                  </div>
                )}

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Suggested Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="promote">Promote</SelectItem>
                    <SelectItem value="writeoff">Write Off</SelectItem>
                    <SelectItem value="hold">Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items Table */}
            {viewMode === 'list' ? (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/75">
                        <TableHead
                          className="py-3 font-medium text-gray-600 cursor-pointer"
                          onClick={() => handleSort("productCode")}
                        >
                          <div className="flex items-center">
                            Code
                            {sortField === "productCode" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 cursor-pointer"
                          onClick={() => handleSort("productName")}
                        >
                          <div className="flex items-center">
                            Product
                            {sortField === "productName" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 cursor-pointer"
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center">
                            Category
                            {sortField === "category" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 font-medium text-gray-600">Location</TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                          onClick={() => handleSort("daysSinceMovement")}
                        >
                          <div className="flex items-center justify-end">
                            Days Since Movement
                            {sortField === "daysSinceMovement" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                          onClick={() => handleSort("currentStock")}
                        >
                          <div className="flex items-center justify-end">
                            Stock
                            {sortField === "currentStock" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                          onClick={() => handleSort("value")}
                        >
                          <div className="flex items-center justify-end">
                            Value
                            {sortField === "value" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 font-medium text-gray-600 text-center">Risk Level</TableHead>
                        <TableHead className="py-3 font-medium text-gray-600 text-center">Suggested Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            No slow moving items found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredItems.map((item) => (
                          <TableRow
                            key={`${item.locationId}-${item.productId}`}
                            className="hover:bg-gray-50/50"
                          >
                            <TableCell>{item.productCode}</TableCell>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {item.locationName}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{item.daysSinceMovement} days</TableCell>
                            <TableCell className="text-right">
                              {formatNumber(item.currentStock)} {item.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.value)}
                            </TableCell>
                            <TableCell className="text-center">
                              {renderRiskLevelBadge(item.riskLevel)}
                            </TableCell>
                            <TableCell className="text-center">
                              {renderActionBadge(item.suggestedAction)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <GroupedTable
                groups={groups}
                columns={[
                  { key: 'location', label: 'Location', type: 'text' },
                  { key: 'productCode', label: 'Code', type: 'text' },
                  { key: 'productName', label: 'Product', type: 'text' },
                  { key: 'category', label: 'Category', type: 'text' },
                  { key: 'daysSinceMovement', label: 'Days Since Movement', type: 'number' },
                  { key: 'currentStock', label: 'Stock', type: 'number' },
                  { key: 'value', label: 'Value', type: 'currency' },
                  { key: 'riskLevel', label: 'Risk Level', type: 'badge' },
                  { key: 'suggestedAction', label: 'Suggested Action', type: 'badge' },
                ]}
                renderRow={(item: SlowMovingItem) => (
                  <TableRow
                    key={`${item.locationId}-${item.productId}`}
                    className="hover:bg-gray-50/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {item.locationName}
                      </div>
                    </TableCell>
                    <TableCell>{item.productCode}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">{item.daysSinceMovement} days</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(item.currentStock)} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.value)}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderRiskLevelBadge(item.riskLevel)}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderActionBadge(item.suggestedAction)}
                    </TableCell>
                  </TableRow>
                )}
                onToggleGroup={toggleGroup}
                showSubtotals={true}
                getGroupKeyMetrics={(subtotals) => [
                  { label: 'Items', value: subtotals.totalItems, type: 'number' },
                  { label: 'Avg Days', value: Math.round(subtotals.avgDaysSinceMovement || 0), type: 'number' },
                  { label: 'Total Value', value: formatCurrency(subtotals.totalValue), type: 'text' }
                ]}
                grandTotals={calculateGrandTotals(['totalItems', 'totalValue', 'avgDaysSinceMovement'])}
              />
            )}

            {/* Summary */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>
                Showing {filteredItems.length} of {slowMovingItems.length} slow moving items
              </div>
              <div>
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="space-y-6">
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Risk Distribution Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Risk Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.riskDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {analyticsData.riskDistribution.map((entry, index) => (
                                <Cell key={`risk-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [formatNumber(value), 'Items']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Distribution Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Recommended Actions Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.actionDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {analyticsData.actionDistribution.map((entry, index) => (
                                <Cell key={`action-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [formatNumber(value), 'Items']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Days Distribution Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      Aging Distribution (Days Since Movement)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={analyticsData.daysDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              name === 'items' ? formatNumber(value) : formatCurrency(value),
                              name === 'items' ? 'Items' : 'Value'
                            ]}
                          />
                          <Legend />
                          <Bar yAxisId="left" dataKey="items" name="Items" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Line yAxisId="right" type="monotone" dataKey="value" name="Value" stroke="#f97316" strokeWidth={2} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Category and Location Breakdowns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        By Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.categoryBreakdown.map((cat, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{cat.category}</span>
                              <span className="text-muted-foreground">
                                {cat.items} items • {formatCurrency(cat.value)} • {cat.avgDays} days avg
                              </span>
                            </div>
                            <Progress
                              value={(cat.value / summaryStats.totalValue) * 100}
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        By Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.locationBreakdown.map((loc, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{loc.location}</span>
                              <span className="text-muted-foreground">
                                {loc.items} items • {formatCurrency(loc.value)}
                                {loc.critical > 0 && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    {loc.critical} critical
                                  </Badge>
                                )}
                              </span>
                            </div>
                            <Progress
                              value={(loc.value / summaryStats.totalValue) * 100}
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Action Center Tab */}
            <TabsContent value="actions">
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                        <ArrowRightLeft className="h-6 w-6 text-blue-600" />
                        <span className="text-sm">Bulk Transfer</span>
                        <span className="text-xs text-muted-foreground">{summaryStats.transferItems} items</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                        <Megaphone className="h-6 w-6 text-purple-600" />
                        <span className="text-sm">Create Promotion</span>
                        <span className="text-xs text-muted-foreground">{summaryStats.promoteItems} items</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                        <Trash2 className="h-6 w-6 text-red-600" />
                        <span className="text-sm">Request Write-Off</span>
                        <span className="text-xs text-muted-foreground">{summaryStats.writeoffItems} items</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                        <FileDown className="h-6 w-6 text-gray-600" />
                        <span className="text-sm">Export Report</span>
                        <span className="text-xs text-muted-foreground">All {summaryStats.totalItems} items</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Actions by Risk Level */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Critical Items */}
                  <Card className="border-red-200">
                    <CardHeader className="bg-red-50">
                      <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-5 w-5" />
                        Critical Risk Items ({summaryStats.criticalItems})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          These items have been idle for an extended period and require immediate attention.
                        </p>
                        <div className="space-y-2">
                          {filteredItems
                            .filter(item => item.riskLevel === 'critical')
                            .slice(0, 5)
                            .map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                                <div>
                                  <p className="font-medium text-sm">{item.productName}</p>
                                  <p className="text-xs text-muted-foreground">{item.daysSinceMovement} days • {formatCurrency(item.value)}</p>
                                </div>
                                {renderActionBadge(item.suggestedAction)}
                              </div>
                            ))}
                        </div>
                        {summaryStats.criticalItems > 5 && (
                          <Button variant="outline" size="sm" className="w-full">
                            View All {summaryStats.criticalItems} Critical Items
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* High Risk Items */}
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50">
                      <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                        <AlertTriangle className="h-5 w-5" />
                        High Risk Items ({summaryStats.highRiskItems})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Items approaching critical status. Take action to prevent further value loss.
                        </p>
                        <div className="space-y-2">
                          {filteredItems
                            .filter(item => item.riskLevel === 'high')
                            .slice(0, 5)
                            .map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                                <div>
                                  <p className="font-medium text-sm">{item.productName}</p>
                                  <p className="text-xs text-muted-foreground">{item.daysSinceMovement} days • {formatCurrency(item.value)}</p>
                                </div>
                                {renderActionBadge(item.suggestedAction)}
                              </div>
                            ))}
                        </div>
                        {summaryStats.highRiskItems > 5 && (
                          <Button variant="outline" size="sm" className="w-full">
                            View All {summaryStats.highRiskItems} High Risk Items
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Action Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-800">Transfer</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">{summaryStats.transferItems}</p>
                        <p className="text-xs text-blue-600">items to relocate</p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Megaphone className="h-5 w-5 text-purple-600" />
                          <span className="font-medium text-purple-800">Promote</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900">{summaryStats.promoteItems}</p>
                        <p className="text-xs text-purple-600">items for promotion</p>
                      </div>
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Trash2 className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-800">Write Off</span>
                        </div>
                        <p className="text-2xl font-bold text-red-900">{summaryStats.writeoffItems}</p>
                        <p className="text-xs text-red-600">items to dispose</p>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <PauseCircle className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-800">Hold</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{summaryStats.holdItems}</p>
                        <p className="text-xs text-gray-600">items to monitor</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 