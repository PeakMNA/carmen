"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  LineChart as LineChartIcon,
  Lightbulb,
  AlertTriangle,
  Settings,
  HelpCircle,
  Search,
  Download,
  Plus,
  Clock,
  DollarSign,
  Package,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from "lucide-react"

// Mock data for forecast vs actual chart
const forecastVsActualData = [
  { day: "Mon", forecast: 120, actual: 115 },
  { day: "Tue", forecast: 135, actual: 142 },
  { day: "Wed", forecast: 128, actual: 125 },
  { day: "Thu", forecast: 145, actual: 138 },
  { day: "Fri", forecast: 160, actual: 168 },
  { day: "Sat", forecast: 175, actual: 180 },
  { day: "Sun", forecast: 150, actual: 145 }
]

// Mock data for demand distribution pie chart
const demandDistributionData = [
  { name: "High Demand", value: 35, color: "#ef4444" },
  { name: "Medium Demand", value: 45, color: "#f59e0b" },
  { name: "Low Demand", value: 15, color: "#22c55e" },
  { name: "No Demand", value: 5, color: "#94a3b8" }
]

// Mock data for recent forecasts
const recentForecasts = [
  { id: "1", item: "Chicken Breast", category: "Protein", currentStock: "150 kg", forecast: "180 kg", accuracy: 92, risk: "LOW" },
  { id: "2", item: "Olive Oil", category: "Oils", currentStock: "25 L", forecast: "45 L", accuracy: 78, risk: "HIGH" },
  { id: "3", item: "Fresh Salmon", category: "Seafood", currentStock: "80 kg", forecast: "95 kg", accuracy: 85, risk: "MEDIUM" },
  { id: "4", item: "Rice", category: "Grains", currentStock: "200 kg", forecast: "190 kg", accuracy: 94, risk: "LOW" },
  { id: "5", item: "Mixed Vegetables", category: "Produce", currentStock: "120 kg", forecast: "150 kg", accuracy: 88, risk: "LOW" },
  { id: "6", item: "All Purpose Flour", category: "Baking", currentStock: "180 kg", forecast: "160 kg", accuracy: 91, risk: "LOW" },
  { id: "7", item: "Fresh Herbs", category: "Produce", currentStock: "15 kg", forecast: "25 kg", accuracy: 72, risk: "HIGH" },
  { id: "8", item: "Butter", category: "Dairy", currentStock: "45 kg", forecast: "55 kg", accuracy: 89, risk: "MEDIUM" }
]

// Mock alerts data
const alerts = [
  { id: "1", type: "critical", item: "Olive Oil", message: "Stock will run out in 3 days" },
  { id: "2", type: "warning", item: "Flour", message: "Demand increasing 15%, adjust reorder" },
  { id: "3", type: "info", item: "Sugar", message: "On track, no action needed" }
]

function getRiskBadgeVariant(risk: string) {
  switch (risk) {
    case "HIGH": return "destructive"
    case "MEDIUM": return "secondary"
    case "LOW": return "outline"
    default: return "outline"
  }
}

function getAccuracyColor(accuracy: number) {
  if (accuracy >= 85) return "text-green-600"
  if (accuracy >= 70) return "text-yellow-600"
  return "text-red-600"
}

function getAlertIcon(type: string) {
  switch (type) {
    case "critical": return "🔴"
    case "warning": return "🟡"
    case "info": return "🟢"
    default: return "ℹ️"
  }
}

export default function DemandForecastingDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")

  // Filter forecasts
  const filteredForecasts = useMemo(() => {
    return recentForecasts.filter(forecast => {
      const matchesSearch = forecast.item.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || forecast.category === categoryFilter
      const matchesRisk = riskFilter === "all" || forecast.risk === riskFilter
      return matchesSearch && matchesCategory && matchesRisk
    })
  }, [searchQuery, categoryFilter, riskFilter])

  const categories = useMemo(() => {
    return [...new Set(recentForecasts.map(f => f.category))]
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            Demand Forecasting
          </h1>
          <p className="text-sm text-muted-foreground">
            Inventory demand analytics and prediction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/operational-planning/demand-forecasting/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/operational-planning/demand-forecasting/forecast">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium">Generate Forecast</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/operational-planning/demand-forecasting/trends">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <LineChartIcon className="h-6 w-6 text-purple-600" />
                </div>
                <span className="font-medium">Analyze Trends</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/operational-planning/demand-forecasting/optimization">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-green-600" />
                </div>
                <span className="font-medium">Optimize Inventory</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/operational-planning/inventory-planning/dead-stock">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="font-medium">Dead Stock Review</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Forecast Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">87.5%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              2.3% vs last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Avg Lead Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 days</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowDown className="h-3 w-3 mr-1" />
              0.5 days improved
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Package className="h-4 w-4" />
              Items at Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">23 items</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              5 new this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Potential Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$12,450</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              $2,100 more than last week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Forecast vs Actual (7 Days)</CardTitle>
            <CardDescription>Comparison of predicted and actual demand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastVsActualData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#3b82f6"
                    strokeDasharray="5 5"
                    name="Forecast"
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#22c55e"
                    name="Actual"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demand Distribution</CardTitle>
            <CardDescription>Items categorized by demand level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demandDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {demandDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Alerts & Recommendations</CardTitle>
              <CardDescription>
                <span className="text-yellow-600 font-medium">⚠️ 5 items</span> require attention •
                <span className="text-green-600 font-medium ml-1">💡 3 optimization</span> opportunities
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getAlertIcon(alert.type)}</span>
                  <div>
                    <span className="font-medium">{alert.item}</span>
                    <span className="text-muted-foreground"> - {alert.message}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View</Button>
                  {alert.type !== "info" && (
                    <Button size="sm">Action</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Forecasts Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Recent Forecasts</CardTitle>
              <CardDescription>View and manage demand forecasts</CardDescription>
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Link href="/operational-planning/demand-forecasting/forecast">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Forecast
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Forecast</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForecasts.map(forecast => (
                  <TableRow key={forecast.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{forecast.item}</div>
                        <div className="text-xs text-muted-foreground">{forecast.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>{forecast.currentStock}</TableCell>
                    <TableCell>{forecast.forecast}</TableCell>
                    <TableCell>
                      <span className={getAccuracyColor(forecast.accuracy)}>
                        {forecast.accuracy}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(forecast.risk)}>
                        {forecast.risk}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/operational-planning/demand-forecasting/forecast/${forecast.id}`}>
                        <Button variant="ghost" size="sm">
                          Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredForecasts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No forecasts match your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredForecasts.length} of {recentForecasts.length} items
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

      {/* Cross-Navigation */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-medium">Need inventory optimization?</p>
              <p className="text-sm text-muted-foreground">
                Visit Inventory Planning for EOQ, reorder points, and safety stock calculations
              </p>
            </div>
            <Link href="/operational-planning/inventory-planning">
              <Button variant="outline">
                Go to Inventory Planning
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
