'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Building2,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  BarChart3,
  ArrowRight,
  MapPin,
  DollarSign,
  RefreshCw,
  Download,
  Filter,
  Activity,
  Box,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Layers,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Warehouse,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/lib/context/simple-user-context'
import {
  getAllLocationStock,
  getAggregateMetrics,
  generateLocationComparison,
  generateTransferSuggestions,
  type LocationStockData,
  type LocationComparison,
  type TransferSuggestion
} from '@/lib/mock-data/location-inventory'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

interface StockOverviewData {
  allLocationData: LocationStockData[]
  aggregateMetrics: ReturnType<typeof getAggregateMetrics>
  locationComparison: LocationComparison[]
  transferSuggestions: TransferSuggestion[]
}

// Mock trend data for the last 7 days
const generateTrendData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day, index) => ({
    day,
    inbound: Math.floor(Math.random() * 500) + 200,
    outbound: Math.floor(Math.random() * 400) + 150,
    value: Math.floor(Math.random() * 50000) + 150000
  }))
}

// Mock recent activity
const generateRecentActivity = () => [
  { id: 1, type: 'receipt', item: 'Fresh Tomatoes', quantity: 50, unit: 'kg', location: 'Main Kitchen', time: '10 mins ago' },
  { id: 2, type: 'transfer', item: 'Olive Oil', quantity: 20, unit: 'liters', location: 'Pool Bar', time: '25 mins ago' },
  { id: 3, type: 'adjustment', item: 'Rice', quantity: -5, unit: 'kg', location: 'Banquet Hall', time: '1 hour ago' },
  { id: 4, type: 'receipt', item: 'Chicken Breast', quantity: 100, unit: 'kg', location: 'Main Kitchen', time: '2 hours ago' },
  { id: 5, type: 'count', item: 'Wine Selection', quantity: 0, unit: 'bottles', location: 'Rooftop Restaurant', time: '3 hours ago' },
]

// Mock alerts
const generateAlerts = () => [
  { id: 1, type: 'critical', title: 'Critical Stock Level', message: 'Fresh Milk at Main Kitchen is below minimum (5 liters remaining)', action: 'Create Transfer' },
  { id: 2, type: 'warning', title: 'Expiring Soon', message: '12 items expiring within 7 days across 3 locations', action: 'View Items' },
  { id: 3, type: 'info', title: 'Pending Count', message: 'Monthly inventory count scheduled for Pool Bar tomorrow', action: 'View Schedule' },
]

export default function StockOverviewPage() {
  const { user } = useUser()
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [data, setData] = useState<StockOverviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trendData] = useState(generateTrendData)
  const [recentActivity] = useState(generateRecentActivity)
  const [alerts] = useState(generateAlerts)

  // Initialize data
  useEffect(() => {
    const timer = setTimeout(() => {
      setData({
        allLocationData: getAllLocationStock(),
        aggregateMetrics: getAggregateMetrics(),
        locationComparison: generateLocationComparison(),
        transferSuggestions: generateTransferSuggestions()
      })
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // Filter data based on selected location and user permissions
  const getFilteredLocationData = () => {
    if (!data) return []
    let locations = data.allLocationData

    // Filter by user's accessible locations if not admin
    if (user?.role !== 'System Administrator') {
      const userLocationIds = user?.availableLocations?.map(l => l.id) || []
      locations = locations.filter(loc => userLocationIds.includes(loc.locationId))
    }

    // Filter by selected location
    if (selectedLocation !== 'all') {
      locations = locations.filter(loc => loc.locationId === selectedLocation)
    }

    return locations
  }

  const filteredData = useMemo(() => getFilteredLocationData(), [data, selectedLocation, user])

  if (isLoading || !data) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { allLocationData, aggregateMetrics, locationComparison, transferSuggestions } = data

  const currentLocationMetrics = selectedLocation === 'all' ? aggregateMetrics :
    allLocationData.find(loc => loc.locationId === selectedLocation)?.metrics

  // Chart data for stock distribution
  const categoryChartData = filteredData.length === 1
    ? filteredData[0].categories.map(cat => ({
        name: cat.categoryName,
        quantity: cat.quantity,
        value: cat.value.amount
      }))
    : allLocationData.flatMap(loc => loc.categories)
        .reduce((acc, cat) => {
          const existing = acc.find(item => item.name === cat.categoryName)
          if (existing) {
            existing.quantity += cat.quantity
            existing.value += cat.value.amount
          } else {
            acc.push({ name: cat.categoryName, quantity: cat.quantity, value: cat.value.amount })
          }
          return acc
        }, [] as { name: string; quantity: number; value: number }[])

  // Location distribution for pie chart
  const locationDistribution = allLocationData.map(loc => ({
    name: loc.locationName,
    value: loc.metrics.totalValue.amount,
    items: loc.metrics.totalItems
  }))

  // Location performance chart data
  const performanceChartData = locationComparison.map(loc => ({
    name: loc.locationName.substring(0, 12) + (loc.locationName.length > 12 ? '...' : ''),
    fullName: loc.locationName,
    efficiency: loc.metrics.stockEfficiency,
    turnover: loc.metrics.turnoverRate,
    fillRate: loc.metrics.fillRate
  }))

  const getPerformanceBadgeColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200'
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'average': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'poor': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'receipt': return <ArrowDownRight className="h-4 w-4 text-green-600" />
      case 'transfer': return <ArrowRight className="h-4 w-4 text-blue-600" />
      case 'adjustment': return <Activity className="h-4 w-4 text-orange-600" />
      case 'count': return <FileText className="h-4 w-4 text-purple-600" />
      default: return <Box className="h-4 w-4 text-gray-600" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case 'info': return <AlertCircle className="h-4 w-4 text-blue-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Location Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Warehouse className="h-7 w-7 text-blue-600" />
            Stock Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time inventory monitoring across all locations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-52">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {user?.availableLocations?.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              )) || allLocationData.map(loc => (
                <SelectItem key={loc.locationId} value={loc.locationId}>
                  {loc.locationName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 2).map(alert => (
            <Alert
              key={alert.id}
              variant={alert.type === 'critical' ? 'destructive' : 'default'}
              className={alert.type === 'warning' ? 'border-amber-200 bg-amber-50' : alert.type === 'info' ? 'border-blue-200 bg-blue-50' : ''}
            >
              {getAlertIcon(alert.type)}
              <AlertTitle className="ml-2">{alert.title}</AlertTitle>
              <AlertDescription className="ml-2 flex justify-between items-center">
                <span>{alert.message}</span>
                <Button variant="outline" size="sm" className="ml-4">
                  {alert.action}
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">
                  {selectedLocation === 'all'
                    ? formatNumber(aggregateMetrics.totalItems)
                    : formatNumber(currentLocationMetrics?.totalItems || 0)
                  }
                </p>
                <div className="flex items-center mt-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+12% vs last month</span>
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
                <p className="text-2xl font-bold">
                  {selectedLocation === 'all'
                    ? formatCurrency(aggregateMetrics.totalValue.amount)
                    : formatCurrency(currentLocationMetrics?.totalValue.amount || 0)
                  }
                </p>
                <div className="flex items-center mt-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+8.5% vs last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {selectedLocation === 'all'
                    ? aggregateMetrics.totalLowStock
                    : (currentLocationMetrics && 'lowStockCount' in currentLocationMetrics ? currentLocationMetrics.lowStockCount : 0)
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Items below reorder point
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-amber-600">
                  {selectedLocation === 'all'
                    ? aggregateMetrics.totalExpiring
                    : (currentLocationMetrics && 'expiringCount' in currentLocationMetrics ? currentLocationMetrics.expiringCount : 0)
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Within next 7 days
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Locations</p>
                <p className="text-2xl font-bold">
                  {selectedLocation === 'all' ? filteredData.length : 1}
                </p>
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
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stock Movement Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Stock Movement Trend
                </CardTitle>
                <CardDescription>Inbound vs outbound movements this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="inbound" stroke="#10b981" fillOpacity={1} fill="url(#colorInbound)" name="Inbound" />
                    <Area type="monotone" dataKey="outbound" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOutbound)" name="Outbound" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Value Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-600" />
                  Value by Location
                </CardTitle>
                <CardDescription>Inventory value distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={locationDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {locationDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Distribution by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Stock by Category
                </CardTitle>
                <CardDescription>Quantity distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value, name) => [
                      name === 'quantity' ? `${formatNumber(Number(value))} items` : formatCurrency(Number(value)),
                      name === 'quantity' ? 'Quantity' : 'Value'
                    ]} />
                    <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Quantity" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Navigate to sub-modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/inventory-management/stock-overview/inventory-balance">
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-blue-200">
                      <CardContent className="pt-4 pb-4 flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                          <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-sm">Inventory Balance</h4>
                        <p className="text-xs text-muted-foreground mt-1">View stock balances</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/inventory-management/stock-overview/stock-cards">
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-green-200">
                      <CardContent className="pt-4 pb-4 flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                          <Package className="h-6 w-6 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-sm">Stock Cards</h4>
                        <p className="text-xs text-muted-foreground mt-1">Item details & history</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/inventory-management/stock-overview/slow-moving">
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-orange-200">
                      <CardContent className="pt-4 pb-4 flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                          <TrendingDown className="h-6 w-6 text-orange-600" />
                        </div>
                        <h4 className="font-semibold text-sm">Slow Moving</h4>
                        <p className="text-xs text-muted-foreground mt-1">Low turnover items</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/inventory-management/stock-overview/inventory-aging">
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-red-200">
                      <CardContent className="pt-4 pb-4 flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-3">
                          <Calendar className="h-6 w-6 text-red-600" />
                        </div>
                        <h4 className="font-semibold text-sm">Inventory Aging</h4>
                        <p className="text-xs text-muted-foreground mt-1">Expiry & aging analysis</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Location Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Location Performance Metrics
              </CardTitle>
              <CardDescription>Efficiency, turnover rate, and fill rate comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="efficiency" fill="#3b82f6" name="Stock Efficiency %" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="fillRate" fill="#10b981" name="Fill Rate %" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="turnover" stroke="#f59e0b" strokeWidth={3} name="Turnover Rate" dot={{ fill: '#f59e0b', r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Location Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Location Performance Details</CardTitle>
              <CardDescription>Detailed metrics for each location</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Location</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                    <TableHead className="text-right">Turnover Rate</TableHead>
                    <TableHead className="text-right">Fill Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locationComparison.map(location => (
                    <TableRow key={location.locationId} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{location.locationName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPerformanceBadgeColor(location.performance)}>
                          {location.performance.charAt(0).toUpperCase() + location.performance.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={location.metrics.stockEfficiency} className="w-16 h-2" />
                          <span className="text-sm font-medium w-10">{location.metrics.stockEfficiency}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {location.metrics.turnoverRate.toFixed(1)}x
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={location.metrics.fillRate} className="w-16 h-2" />
                          <span className="text-sm font-medium w-10">{location.metrics.fillRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                    Transfer Suggestions
                  </CardTitle>
                  <CardDescription>
                    AI-powered recommendations to optimize stock distribution
                  </CardDescription>
                </div>
                <Button>
                  Process All Transfers
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transferSuggestions.map((suggestion, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-400">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <ArrowRight className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{suggestion.itemName}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{suggestion.fromLocation}</span>
                              <ArrowRight className="h-3 w-3" />
                              <span>{suggestion.toLocation}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Qty: {suggestion.suggestedQuantity}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {suggestion.reason.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge variant="outline" className={getPriorityBadgeColor(suggestion.priority)}>
                              {suggestion.priority.toUpperCase()}
                            </Badge>
                            <p className="text-sm font-semibold text-green-600 mt-2">
                              Save {formatCurrency(suggestion.potentialSavings.amount)}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm">
                              Create Transfer
                            </Button>
                            <Button variant="outline" size="sm">
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest stock movements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{activity.item}</p>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {activity.quantity > 0 ? '+' : ''}{activity.quantity} {activity.unit}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{activity.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Pending Tasks
                </CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-sm">Restock Required</p>
                        <p className="text-xs text-muted-foreground">8 items below minimum level</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-sm">Pending Receipts</p>
                        <p className="text-xs text-muted-foreground">3 GRNs awaiting confirmation</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-3">
                      <ArrowRight className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Transfer Requests</p>
                        <p className="text-xs text-muted-foreground">5 pending approvals</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Approve</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-purple-200 bg-purple-50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Stock Count Due</p>
                        <p className="text-xs text-muted-foreground">Monthly count for 2 locations</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Schedule</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
