"use client"

import { useEffect, useState, useMemo } from 'react'
import { useUser } from '@/lib/context/simple-user-context'
import { ReportHeader } from './components/ReportHeader'
import { FilterPanel } from './components/FilterPanel'
import { BalanceTable } from './components/BalanceTable'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Building2,
  AlertTriangle,
  Download,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronLeft,
  PieChart as PieChartIcon,
  Info
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { BalanceReport, BalanceReportParams } from './types'
import { formatCurrency, formatNumber } from './utils'
import { mockBalanceReport } from '@/lib/mock-data'
import { Skeleton } from '@/components/ui/skeleton'
import { MovementHistory } from './components/MovementHistory'
import Link from 'next/link'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

// Mock trend data
const generateTrendData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month) => ({
    month,
    value: Math.floor(Math.random() * 100000) + 150000,
    quantity: Math.floor(Math.random() * 500) + 1000
  }))
}

export default function InventoryBalancePage() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [trendData] = useState(generateTrendData)

  const [report, setReport] = useState<BalanceReport>({
    locations: [],
    totals: {
      quantity: 0,
      value: 0
    }
  })

  const [params, setParams] = useState<BalanceReportParams>({
    asOfDate: new Date().toISOString().split('T')[0],
    locationRange: { from: '', to: '' },
    categoryRange: { from: '', to: '' },
    productRange: { from: '', to: '' },
    viewType: 'PRODUCT',
    showLots: false,
  })

  // Load mock data with a simulated delay and apply user permissions
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      let filteredReport = { ...mockBalanceReport }

      // Filter locations based on user permissions
      if (user?.role !== 'System Administrator' && user?.availableLocations) {
        const userLocationIds = user.availableLocations.map(l => l.id)
        filteredReport.locations = mockBalanceReport.locations.filter(loc =>
          userLocationIds.includes(loc.id)
        )

        // Recalculate totals based on filtered locations
        const newTotals = filteredReport.locations.reduce((acc, location) => {
          const locationTotal = location.categories.reduce((locAcc, category) => {
            const categoryTotal = category.products.reduce((catAcc, product) => {
              catAcc.quantity += product.totals.quantity
              catAcc.value += product.totals.value
              return catAcc
            }, { quantity: 0, value: 0 })
            locAcc.quantity += categoryTotal.quantity
            locAcc.value += categoryTotal.value
            return locAcc
          }, { quantity: 0, value: 0 })
          acc.quantity += locationTotal.quantity
          acc.value += locationTotal.value
          return acc
        }, { quantity: 0, value: 0 })

        filteredReport.totals = newTotals
      }

      setReport(filteredReport)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [user])

  // Calculate chart data
  const chartData = useMemo(() => {
    // Category distribution
    const categoryData = report.locations.flatMap(loc => loc.categories)
      .reduce((acc, cat) => {
        const existing = acc.find(item => item.name === cat.name)
        const categoryTotal = cat.products.reduce((sum, prod) => ({
          quantity: sum.quantity + prod.totals.quantity,
          value: sum.value + prod.totals.value
        }), { quantity: 0, value: 0 })

        if (existing) {
          existing.quantity += categoryTotal.quantity
          existing.value += categoryTotal.value
        } else {
          acc.push({
            name: cat.name,
            quantity: categoryTotal.quantity,
            value: categoryTotal.value
          })
        }
        return acc
      }, [] as { name: string; quantity: number; value: number }[])
      .sort((a, b) => b.value - a.value)

    // Location distribution
    const locationData = report.locations.map(loc => {
      const totals = loc.categories.reduce((acc, cat) => {
        const categoryTotal = cat.products.reduce((sum, prod) => ({
          quantity: sum.quantity + prod.totals.quantity,
          value: sum.value + prod.totals.value
        }), { quantity: 0, value: 0 })
        return {
          quantity: acc.quantity + categoryTotal.quantity,
          value: acc.value + categoryTotal.value
        }
      }, { quantity: 0, value: 0 })

      return {
        name: loc.name,
        quantity: totals.quantity,
        value: totals.value
      }
    }).sort((a, b) => b.value - a.value)

    // Low stock items
    const lowStockItems = report.locations.flatMap(loc =>
      loc.categories.flatMap(cat =>
        cat.products.filter(prod => prod.totals.quantity < 20).map(prod => ({
          ...prod,
          locationName: loc.name,
          categoryName: cat.name
        }))
      )
    ).slice(0, 5)

    // High value items
    const highValueItems = report.locations.flatMap(loc =>
      loc.categories.flatMap(cat =>
        cat.products.map(prod => ({
          ...prod,
          locationName: loc.name,
          categoryName: cat.name
        }))
      )
    ).sort((a, b) => b.totals.value - a.totals.value).slice(0, 5)

    return { categoryData, locationData, lowStockItems, highValueItems }
  }, [report])

  const handleViewChange = (viewType: 'CATEGORY' | 'PRODUCT' | 'LOT') => {
    setParams(prev => ({ ...prev, viewType }))
  }

  const handleShowLotsChange = (showLots: boolean) => {
    setParams(prev => ({ ...prev, showLots }))
  }

  const handleFilterChange = (filterUpdates: Partial<BalanceReportParams>) => {
    setIsLoading(true)

    setParams(prev => {
      const newParams = { ...prev, ...filterUpdates }

      const newActiveFilters: string[] = []

      if (newParams.locationRange.from || newParams.locationRange.to)
        newActiveFilters.push('location')

      if (newParams.categoryRange.from || newParams.categoryRange.to)
        newActiveFilters.push('category')

      if (newParams.productRange.from || newParams.productRange.to)
        newActiveFilters.push('product')

      setActiveFilters(newActiveFilters)

      setTimeout(() => {
        setReport(mockBalanceReport)
        setIsLoading(false)
      }, 800)

      return newParams
    })
  }

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'location':
        handleFilterChange({ locationRange: { from: '', to: '' } })
        break
      case 'category':
        handleFilterChange({ categoryRange: { from: '', to: '' } })
        break
      case 'product':
        handleFilterChange({ productRange: { from: '', to: '' } })
        break
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const renderSummaryCardSkeleton = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16 mt-2" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/inventory-management/stock-overview" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-blue-600" />
              Inventory Balance Report
            </h1>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            As of {formatDate(params.asOfDate)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <ReportHeader
            params={params}
            onViewChange={handleViewChange}
            onShowLotsChange={handleShowLotsChange}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {renderSummaryCardSkeleton()}
            {renderSummaryCardSkeleton()}
            {renderSummaryCardSkeleton()}
            {renderSummaryCardSkeleton()}
          </>
        ) : (
          <>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Quantity</p>
                    <p className="text-2xl font-bold">{formatNumber(report.totals.quantity)}</p>
                    <div className="flex items-center mt-1 text-xs text-green-600">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>+5.2% vs last month</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(report.totals.value)}</p>
                    <div className="flex items-center mt-1 text-xs text-green-600">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      <span>+8.7% vs last month</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Locations</p>
                    <p className="text-2xl font-bold">{report.locations.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Active inventory points
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">{chartData.categoryData.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Product categories
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Low Stock Alert */}
      {!isLoading && chartData.lowStockItems.length > 0 && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{chartData.lowStockItems.length} items are below minimum stock levels and require attention</span>
            <Button variant="outline" size="sm">
              View Items
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filters
                    {showFilters ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {activeFilters.includes('location') && (
                      <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                        Location
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1 hover:bg-blue-100"
                          onClick={() => removeFilter('location')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {activeFilters.includes('category') && (
                      <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                        Category
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1 hover:bg-green-100"
                          onClick={() => removeFilter('category')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {activeFilters.includes('product') && (
                      <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200">
                        Product
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1 hover:bg-purple-100"
                          onClick={() => removeFilter('product')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <CollapsibleContent className="mt-2">
                <Card>
                  <CardContent className="pt-6">
                    <FilterPanel
                      params={params}
                      onFilterChange={handleFilterChange}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="balance" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="balance">Balance Report</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="movement">Movement History</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="balance" className="mt-6">
              <BalanceTable
                params={params}
                report={report}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Value Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Inventory Value Trend
                    </CardTitle>
                    <CardDescription>6-month value history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[250px] w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            name="Value"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Value by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-purple-600" />
                      Value by Category
                    </CardTitle>
                    <CardDescription>Distribution across categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[250px] w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={chartData.categoryData.slice(0, 6)}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.categoryData.slice(0, 6).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Quantity by Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Stock by Location
                    </CardTitle>
                    <CardDescription>Quantity distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[250px] w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData.locationData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" axisLine={false} tickLine={false} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip />
                          <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Quantity" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Value by Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Value by Location
                    </CardTitle>
                    <CardDescription>Monetary distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[250px] w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData.locationData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Value" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="movement" className="mt-6">
              <MovementHistory
                params={params}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="insights" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* High Value Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      High Value Items
                    </CardTitle>
                    <CardDescription>Top 5 items by inventory value</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chartData.highValueItems.map((item, index) => (
                            <TableRow key={index} className="hover:bg-muted/30">
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.locationName}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(item.totals.quantity)}
                              </TableCell>
                              <TableCell className="text-right font-medium text-green-600">
                                {formatCurrency(item.totals.value)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Low Stock Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Low Stock Items
                    </CardTitle>
                    <CardDescription>Items requiring restock</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : chartData.lowStockItems.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chartData.lowStockItems.map((item, index) => (
                            <TableRow key={index} className="hover:bg-muted/30">
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.locationName}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(item.totals.quantity)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="destructive">Low</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Info className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">All items have adequate stock levels</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Location Performance */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      Location Performance Overview
                    </CardTitle>
                    <CardDescription>Stock distribution and efficiency by location</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[200px] w-full" />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Location</TableHead>
                            <TableHead className="text-right">Total Items</TableHead>
                            <TableHead className="text-right">Total Value</TableHead>
                            <TableHead className="text-right">Avg Item Value</TableHead>
                            <TableHead className="text-right">% of Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chartData.locationData.map((loc, index) => {
                            const percentOfTotal = (loc.value / report.totals.value) * 100
                            return (
                              <TableRow key={index} className="hover:bg-muted/30">
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="font-medium">{loc.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatNumber(loc.quantity)}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(loc.value)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(loc.value / loc.quantity)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Progress value={percentOfTotal} className="w-16 h-2" />
                                    <span className="text-sm w-12">{percentOfTotal.toFixed(1)}%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    )}
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
