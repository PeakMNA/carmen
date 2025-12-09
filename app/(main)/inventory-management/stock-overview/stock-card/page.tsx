"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  Calendar,
  Edit,
  FileDown,
  History,
  Printer,
  RefreshCw,
  Truck,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Clock,
  Layers,
  ShoppingCart,
  Target,
  Zap,
  Bell
} from "lucide-react"
import { cn } from "@/lib/utils"
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
import { 
  StockCardGeneralInfo,
  StockCardMovementHistory,
  StockCardLotInformation,
  StockCardValuation
} from "./components/index"
import { generateMockStockCardData, StockCardData } from "./index"

function StockCardContent() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId") || "unknown"
  const [isLoading, setIsLoading] = useState(true)
  const [stockCardData, setStockCardData] = useState<StockCardData | null>(null)

  // Load mock data
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const data = generateMockStockCardData(productId)
      setStockCardData(data)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [productId])

  // Calculate analytics data - must be called before any early returns (Rules of Hooks)
  const analyticsData = useMemo(() => {
    // Return empty data if stockCardData is not available
    if (!stockCardData) {
      return {
        movementTrend: [],
        locationDistribution: [],
        lotStatusData: [],
        daysOfSupply: 0,
        avgDailyUsage: 0,
        movementByType: [],
        alerts: [],
        stockPercentage: 0,
        stockStatus: 'normal' as const
      }
    }

    const { product, summary, movements, lotInformation, locationStocks } = stockCardData

    // Movement trend data - last 30 days
    const movementTrend: { date: string; in: number; out: number; net: number; balance: number }[] = []
    const today = new Date()
    let runningBalance = summary.currentStock

    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayMovements = movements.filter(m => m.date === dateStr)
      const dayIn = dayMovements.filter(m => m.transactionType === 'IN').reduce((sum, m) => sum + m.quantityChange, 0)
      const dayOut = Math.abs(dayMovements.filter(m => m.transactionType === 'OUT').reduce((sum, m) => sum + m.quantityChange, 0))

      movementTrend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        in: dayIn,
        out: dayOut,
        net: dayIn - dayOut,
        balance: runningBalance
      })
    }

    // Location distribution
    const locationDistribution = locationStocks.map(loc => ({
      name: loc.locationName,
      quantity: loc.quantity,
      value: loc.value,
      percentage: (loc.quantity / summary.currentStock) * 100
    })).sort((a, b) => b.quantity - a.quantity)

    // Lot status distribution
    const lotStatusCounts = {
      Available: lotInformation.filter(l => l.status === 'Available').length,
      Reserved: lotInformation.filter(l => l.status === 'Reserved').length,
      Expired: lotInformation.filter(l => l.status === 'Expired').length,
      Quarantine: lotInformation.filter(l => l.status === 'Quarantine').length
    }

    const lotStatusData = Object.entries(lotStatusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status,
        value: count,
        color: status === 'Available' ? '#22c55e' : status === 'Reserved' ? '#3b82f6' : status === 'Expired' ? '#ef4444' : '#f59e0b'
      }))

    // Calculate turnover and days of supply
    const avgDailyUsage = movements
      .filter(m => m.transactionType === 'OUT')
      .reduce((sum, m) => sum + Math.abs(m.quantityChange), 0) / 30
    const daysOfSupply = avgDailyUsage > 0 ? Math.round(summary.currentStock / avgDailyUsage) : 999

    // Movement by type - only IN and OUT are valid transaction types
    const movementByType = [
      { type: 'Receipts (IN)', count: movements.filter(m => m.transactionType === 'IN').length, quantity: movements.filter(m => m.transactionType === 'IN').reduce((sum, m) => sum + m.quantityChange, 0) },
      { type: 'Issues (OUT)', count: movements.filter(m => m.transactionType === 'OUT').length, quantity: Math.abs(movements.filter(m => m.transactionType === 'OUT').reduce((sum, m) => sum + m.quantityChange, 0)) }
    ]

    // Alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; title: string; description: string }[] = []

    if (summary.currentStock <= (product.minimumStock || 0)) {
      alerts.push({
        type: 'critical',
        title: 'Low Stock Alert',
        description: `Current stock (${formatNumber(summary.currentStock)}) is below minimum level (${formatNumber(product.minimumStock || 0)})`
      })
    }

    if (summary.currentStock <= (product.reorderPoint || 0) && summary.currentStock > (product.minimumStock || 0)) {
      alerts.push({
        type: 'warning',
        title: 'Reorder Point Reached',
        description: `Stock level has reached the reorder point. Consider placing a purchase order.`
      })
    }

    const expiringLots = lotInformation.filter(lot => {
      const expiryDate = new Date(lot.expiryDate)
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysToExpiry <= 30 && daysToExpiry > 0
    })

    if (expiringLots.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Lots Expiring Soon',
        description: `${expiringLots.length} lot(s) will expire within 30 days`
      })
    }

    const expiredLots = lotInformation.filter(lot => lot.status === 'Expired')
    if (expiredLots.length > 0) {
      alerts.push({
        type: 'critical',
        title: 'Expired Lots',
        description: `${expiredLots.length} lot(s) have expired and require attention`
      })
    }

    // Stock level status
    const stockPercentage = product.maximumStock ? (summary.currentStock / product.maximumStock) * 100 : 50
    const stockStatus = summary.currentStock <= (product.minimumStock || 0) ? 'low' :
      summary.currentStock >= (product.maximumStock || Infinity) ? 'high' : 'normal'

    return {
      movementTrend,
      locationDistribution,
      lotStatusData,
      daysOfSupply,
      avgDailyUsage,
      movementByType,
      alerts,
      stockPercentage,
      stockStatus
    }
  }, [stockCardData])

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        {/* Summary cards skeleton */}
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
        
        {/* Tabs skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stockCardData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Product Not Found</h2>
            <p className="text-muted-foreground">
              The requested product could not be found or has been removed.
            </p>
            <Button asChild>
              <a href="/inventory-management/stock-overview/stock-cards">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Stock Cards
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Destructure stockCardData for easier access in render
  const { product, summary, movements, lotInformation, locationStocks } = stockCardData

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
              <a href="/inventory-management/stock-overview/stock-cards">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </a>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                <Badge
                  variant="outline"
                  className={cn(
                    product.status === "Active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  )}
                >
                  {product.status}
                </Badge>
                {analyticsData.stockStatus === 'low' && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Low Stock
                  </Badge>
                )}
                {analyticsData.stockStatus === 'high' && (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Overstocked
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {product.code} • {product.category} • Last updated: {formatDate(product.lastUpdated)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 self-end md:self-auto">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
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
              ) : alert.type === 'warning' ? (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              ) : (
                <Bell className="h-4 w-4 text-blue-600" />
              )}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className={cn(
          analyticsData.stockStatus === 'low' && 'border-red-200',
          analyticsData.stockStatus === 'high' && 'border-amber-200'
        )}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <p className={cn(
                  "text-2xl font-bold",
                  analyticsData.stockStatus === 'low' && 'text-red-600',
                  analyticsData.stockStatus === 'high' && 'text-amber-600'
                )}>
                  {formatNumber(summary.currentStock)}
                </p>
                <p className="text-xs text-muted-foreground">{product.unit}</p>
              </div>
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                analyticsData.stockStatus === 'low' ? 'bg-red-100' :
                analyticsData.stockStatus === 'high' ? 'bg-amber-100' : 'bg-green-100'
              )}>
                <Package className={cn(
                  "h-5 w-5",
                  analyticsData.stockStatus === 'low' ? 'text-red-600' :
                  analyticsData.stockStatus === 'high' ? 'text-amber-600' : 'text-green-600'
                )} />
              </div>
            </div>
            <Progress
              value={Math.min(analyticsData.stockPercentage, 100)}
              className={cn(
                "h-1.5 mt-3",
                analyticsData.stockStatus === 'low' ? '[&>div]:bg-red-500' :
                analyticsData.stockStatus === 'high' ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Min: {formatNumber(product.minimumStock || 0)}</span>
              <span>Max: {formatNumber(product.maximumStock || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.currentValue)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(summary.averageCost)} / {product.unit}
                </p>
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
                <p className="text-sm text-muted-foreground">Days of Supply</p>
                <p className={cn(
                  "text-2xl font-bold",
                  analyticsData.daysOfSupply < 7 ? 'text-red-600' :
                  analyticsData.daysOfSupply < 14 ? 'text-amber-600' : 'text-green-600'
                )}>
                  {analyticsData.daysOfSupply > 365 ? '365+' : analyticsData.daysOfSupply}
                </p>
                <p className="text-xs text-muted-foreground">
                  ~{formatNumber(analyticsData.avgDailyUsage)} {product.unit}/day
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Last Movement</p>
                <p className="text-2xl font-bold">{summary.lastMovementDate}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <History className="h-3 w-3 mr-1" />
                  {summary.lastMovementType}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Locations</p>
                <p className="text-2xl font-bold">{summary.locationCount}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {summary.primaryLocation}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Truck className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Active Lots</p>
                <p className="text-2xl font-bold">{lotInformation.filter(l => l.status === 'Available').length}</p>
                <p className="text-xs text-muted-foreground">
                  of {lotInformation.length} total lots
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                <Layers className="h-5 w-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="movement">Movement History</TabsTrigger>
              <TabsTrigger value="lots">Lot Information</TabsTrigger>
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <StockCardGeneralInfo data={stockCardData} />
            </TabsContent>

            <TabsContent value="movement">
              <StockCardMovementHistory data={stockCardData} />
            </TabsContent>

            <TabsContent value="lots">
              <StockCardLotInformation data={stockCardData} />
            </TabsContent>

            <TabsContent value="valuation">
              <StockCardValuation data={stockCardData} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="space-y-6">
                {/* Movement Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Movement Trend (Last 30 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={analyticsData.movementTrend}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={4} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                          <Legend />
                          <Bar dataKey="in" name="In" fill="#22c55e" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="out" name="Out" fill="#ef4444" radius={[2, 2, 0, 0]} />
                          <Line type="monotone" dataKey="net" name="Net" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-indigo-600" />
                        Stock by Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.locationDistribution.map((loc, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{loc.name}</span>
                              <span>{formatNumber(loc.quantity)} ({loc.percentage.toFixed(1)}%)</span>
                            </div>
                            <Progress value={loc.percentage} className="h-2 [&>div]:bg-blue-500" />
                            <p className="text-xs text-muted-foreground text-right">
                              {formatCurrency(loc.value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lot Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="h-5 w-5 text-cyan-600" />
                        Lot Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analyticsData.lotStatusData.length > 0 ? (
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.lotStatusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {analyticsData.lotStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                          No lot data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Movement by Type Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      Movement Summary by Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analyticsData.movementByType.map((item, index) => (
                        <div key={index} className="p-4 rounded-lg bg-gray-50 border">
                          <div className="flex items-center gap-2 mb-2">
                            {item.type === 'Receipts' ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            ) : item.type === 'Issues' ? (
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            ) : (
                              <Target className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="font-medium">{item.type}</span>
                          </div>
                          <div className="text-2xl font-bold">
                            {formatNumber(Math.abs(item.quantity))} <span className="text-sm font-normal text-muted-foreground">{product.unit}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.count} transactions</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions">
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                        <ShoppingCart className="h-6 w-6 text-blue-600" />
                        <span>Create Purchase Request</span>
                        <span className="text-xs text-muted-foreground">Order from supplier</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                        <Truck className="h-6 w-6 text-green-600" />
                        <span>Request Transfer</span>
                        <span className="text-xs text-muted-foreground">Move stock between locations</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                        <Target className="h-6 w-6 text-amber-600" />
                        <span>Adjust Stock</span>
                        <span className="text-xs text-muted-foreground">Make inventory adjustment</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Actions */}
                {analyticsData.alerts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Recommended Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.alerts.map((alert, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                            <div className="flex items-center gap-3">
                              {alert.type === 'critical' ? (
                                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                </div>
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{alert.title}</p>
                                <p className="text-sm text-muted-foreground">{alert.description}</p>
                              </div>
                            </div>
                            <Button size="sm">Take Action</Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Stock Parameters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Stock Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground">Minimum Stock</p>
                        <p className="text-xl font-bold">{formatNumber(product.minimumStock || 0)}</p>
                        <p className="text-xs text-muted-foreground">{product.unit}</p>
                      </div>
                      <div className="p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground">Maximum Stock</p>
                        <p className="text-xl font-bold">{formatNumber(product.maximumStock || 0)}</p>
                        <p className="text-xs text-muted-foreground">{product.unit}</p>
                      </div>
                      <div className="p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground">Reorder Point</p>
                        <p className="text-xl font-bold">{formatNumber(product.reorderPoint || 0)}</p>
                        <p className="text-xs text-muted-foreground">{product.unit}</p>
                      </div>
                      <div className="p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground">Reorder Quantity</p>
                        <p className="text-xl font-bold">{formatNumber(product.reorderQuantity || 0)}</p>
                        <p className="text-xs text-muted-foreground">{product.unit}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Parameters
                      </Button>
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

export default function StockCardPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      {/* Summary cards skeleton */}
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
      
      {/* Tabs skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    </div>}>
      <StockCardContent />
    </Suspense>
  )
} 