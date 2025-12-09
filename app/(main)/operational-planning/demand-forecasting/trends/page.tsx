"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronRight,
  Filter,
  Lightbulb
} from "lucide-react"

// Mock consumption trend data
const consumptionTrendData = [
  { week: "Week 1", consumption: 2400, trend: 2380, forecast: null },
  { week: "Week 2", consumption: 2650, trend: 2520, forecast: null },
  { week: "Week 3", consumption: 2800, trend: 2660, forecast: null },
  { week: "Week 4", consumption: 2950, trend: 2800, forecast: null },
  { week: "Week 5", consumption: null, trend: null, forecast: 2940 },
  { week: "Week 6", consumption: null, trend: null, forecast: 3080 }
]

// Mock trend analysis data
const trendAnalysisData = [
  {
    id: "1",
    item: "Chicken Breast",
    category: "Protein",
    trend: "increasing",
    change: 15,
    slope: 2.3,
    confidence: 94,
    seasonal: true,
    note: "Consumption increasing, seasonal peak in summer"
  },
  {
    id: "2",
    item: "Olive Oil",
    category: "Oils",
    trend: "increasing",
    change: 8,
    slope: 1.1,
    confidence: 87,
    seasonal: false,
    note: "Steady increase, consider bulk purchasing"
  },
  {
    id: "3",
    item: "Fresh Salmon",
    category: "Seafood",
    trend: "stable",
    change: 2,
    slope: 0.2,
    confidence: 91,
    seasonal: true,
    note: "Consistent demand with weekend peaks"
  },
  {
    id: "4",
    item: "Sugar",
    category: "Baking",
    trend: "decreasing",
    change: -12,
    slope: -1.8,
    confidence: 89,
    seasonal: false,
    note: "Declining demand, review stocking levels"
  },
  {
    id: "5",
    item: "Rice",
    category: "Grains",
    trend: "stable",
    change: 1,
    slope: 0.1,
    confidence: 95,
    seasonal: false,
    note: "Very consistent demand pattern"
  },
  {
    id: "6",
    item: "Fresh Herbs",
    category: "Produce",
    trend: "increasing",
    change: 22,
    slope: 3.5,
    confidence: 78,
    seasonal: true,
    note: "Strong seasonal pattern, spring/summer peak"
  },
  {
    id: "7",
    item: "Butter",
    category: "Dairy",
    trend: "decreasing",
    change: -5,
    slope: -0.8,
    confidence: 82,
    seasonal: false,
    note: "Slight decline, may be menu-related"
  },
  {
    id: "8",
    item: "Tomato Sauce",
    category: "Condiments",
    trend: "stable",
    change: 3,
    slope: 0.3,
    confidence: 90,
    seasonal: false,
    note: "Stable baseline demand"
  }
]

function getTrendIcon(trend: string) {
  switch (trend) {
    case "increasing":
      return <TrendingUp className="h-4 w-4 text-green-600" />
    case "decreasing":
      return <TrendingDown className="h-4 w-4 text-red-600" />
    default:
      return <Minus className="h-4 w-4 text-gray-500" />
  }
}

function getTrendBadge(trend: string, change: number) {
  const color = trend === "increasing" ? "text-green-600" : trend === "decreasing" ? "text-red-600" : "text-gray-600"
  const sign = change > 0 ? "+" : ""
  return (
    <div className={`flex items-center gap-1 ${color}`}>
      {getTrendIcon(trend)}
      <span className="font-medium">{sign}{change}%</span>
    </div>
  )
}

export default function TrendAnalysisPage() {
  const [period, setPeriod] = useState("30")
  const [category, setCategory] = useState("all")
  const [location, setLocation] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [trendFilter, setTrendFilter] = useState("all")
  const [showSeasonal, setShowSeasonal] = useState(true)
  const [expandedRows, setExpandedRows] = useState<string[]>([])

  // Summary counts
  const trendSummary = useMemo(() => {
    return {
      increasing: trendAnalysisData.filter(t => t.trend === "increasing").length,
      decreasing: trendAnalysisData.filter(t => t.trend === "decreasing").length,
      stable: trendAnalysisData.filter(t => t.trend === "stable").length,
      avgIncrease: Math.round(
        trendAnalysisData
          .filter(t => t.trend === "increasing")
          .reduce((sum, t) => sum + t.change, 0) /
          trendAnalysisData.filter(t => t.trend === "increasing").length || 0
      ),
      avgDecrease: Math.round(
        Math.abs(
          trendAnalysisData
            .filter(t => t.trend === "decreasing")
            .reduce((sum, t) => sum + t.change, 0) /
            trendAnalysisData.filter(t => t.trend === "decreasing").length || 0
        )
      )
    }
  }, [])

  // Filter data
  const filteredData = useMemo(() => {
    return trendAnalysisData.filter(item => {
      const matchesSearch = item.item.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = category === "all" || item.category === category
      const matchesTrend = trendFilter === "all" || item.trend === trendFilter
      const matchesSeasonal = showSeasonal || !item.seasonal
      return matchesSearch && matchesCategory && matchesTrend && matchesSeasonal
    })
  }, [searchQuery, category, trendFilter, showSeasonal])

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const categories = useMemo(() => {
    return [...new Set(trendAnalysisData.map(item => item.category))]
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/operational-planning/demand-forecasting">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trend Analysis</h1>
            <p className="text-sm text-muted-foreground">
              Analyze consumption patterns and cost trends
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Period:</span>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Category:</span>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Location:</span>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="main">Main Kitchen</SelectItem>
                  <SelectItem value="branch1">Branch 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trendSummary.increasing} items</p>
                <p className="text-sm text-muted-foreground">
                  📈 INCREASING • Avg +{trendSummary.avgIncrease}% demand
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trendSummary.decreasing} items</p>
                <p className="text-sm text-muted-foreground">
                  📉 DECREASING • Avg -{trendSummary.avgDecrease}% demand
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Minus className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trendSummary.stable} items</p>
                <p className="text-sm text-muted-foreground">
                  ➡️ STABLE • &lt;5% variance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consumption Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consumption Trend Chart</CardTitle>
          <CardDescription>Aggregate consumption over time with trend line and forecast</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumptionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="#22c55e"
                  fill="#bbf7d0"
                  name="Consumption"
                />
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="#3b82f6"
                  strokeDasharray="5 5"
                  name="Trend"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  name="Forecast"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Detailed Analysis</CardTitle>
              <CardDescription>Item-level trend analysis with seasonal patterns</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-[180px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={trendFilter} onValueChange={setTrendFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Trend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trends</SelectItem>
                  <SelectItem value="increasing">Increasing</SelectItem>
                  <SelectItem value="decreasing">Decreasing</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="seasonal"
                  checked={showSeasonal}
                  onCheckedChange={(checked) => setShowSeasonal(checked as boolean)}
                />
                <label htmlFor="seasonal" className="text-sm">Show Seasonal</label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Slope</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Seasonal</TableHead>
                  <TableHead className="w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map(item => (
                  <Collapsible key={item.id} asChild open={expandedRows.includes(item.id)}>
                    <>
                      <TableRow className="cursor-pointer" onClick={() => toggleRow(item.id)}>
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                              {expandedRows.includes(item.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{item.item}</span>
                            <span className="text-xs text-muted-foreground ml-2">({item.category})</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTrendBadge(item.trend, item.change)}</TableCell>
                        <TableCell>
                          <span className={item.slope > 0 ? "text-green-600" : item.slope < 0 ? "text-red-600" : ""}>
                            {item.slope > 0 ? "+" : ""}{item.slope.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell>{item.confidence}%</TableCell>
                        <TableCell>
                          {item.seasonal ? (
                            <Badge variant="secondary">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link href={`/operational-planning/demand-forecasting/forecast/${item.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={7} className="py-3">
                            <div className="pl-8 text-sm text-muted-foreground">
                              {item.note}
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No items match your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {trendAnalysisData.length} items
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Recommendations</CardTitle>
          </div>
          <CardDescription>Based on trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Increase reorder quantity for <strong>12 items</strong> with rising demand</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Consider reducing stock for <strong>8 items</strong> with declining demand</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>5 items</strong> show seasonal patterns - adjust forecasting method</span>
            </li>
          </ul>
          <div className="mt-4">
            <Link href="/operational-planning/demand-forecasting/optimization">
              <Button variant="outline" size="sm">
                View All Recommendations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
