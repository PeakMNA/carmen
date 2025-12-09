"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
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
  ReferenceLine,
  Legend
} from "recharts"
import {
  ArrowLeft,
  Edit,
  RefreshCw,
  Download,
  ShoppingCart,
  Sliders,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Check,
  Clock
} from "lucide-react"

// Mock item data
const itemData: Record<string, {
  name: string
  category: string
  currentStock: number
  unit: string
  value: number
  forecastDemand: number
  purchaseQty: number
  purchaseCost: number
  accuracy: number
  method: string
  period: number
  serviceLevel: number
  safetyStock: number
  reorderPoint: number
  riskScore: number
  demandVariability: number
  seasonalityFactor: number
  trendFactor: number
}> = {
  "1": {
    name: "Chicken Breast",
    category: "Food > Protein > Poultry",
    currentStock: 150,
    unit: "kg",
    value: 1200,
    forecastDemand: 180,
    purchaseQty: 50,
    purchaseCost: 400,
    accuracy: 92,
    method: "Exponential Smoothing (α=0.3)",
    period: 14,
    serviceLevel: 95,
    safetyStock: 20,
    reorderPoint: 30,
    riskScore: 0.45,
    demandVariability: 12,
    seasonalityFactor: 1.08,
    trendFactor: 1.05
  }
}

// Generate mock chart data
function generateChartData() {
  const data = []
  let stock = 150
  const today = new Date()

  // Historical data (last 14 days)
  for (let i = -14; i <= 0; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const consumption = Math.floor(10 + Math.random() * 8)
    stock = stock - consumption + (i === -7 ? 100 : 0) // Restock on day -7
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dayOffset: i,
      historical: Math.max(0, stock),
      forecast: null,
      upper: null,
      lower: null
    })
  }

  // Forecast data (next 14 days)
  stock = 150
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const baseConsumption = 12 + Math.sin(i * 0.5) * 3
    stock = stock - baseConsumption
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dayOffset: i,
      historical: null,
      forecast: Math.max(0, Math.round(stock)),
      upper: Math.max(0, Math.round(stock + 15)),
      lower: Math.max(0, Math.round(stock - 15))
    })
  }

  return data
}

// Generate daily breakdown data
function generateDailyBreakdown() {
  const data = []
  let stock = 150
  let cumulative = 0
  const today = new Date()

  for (let i = 0; i < 14; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const projected = Math.floor(10 + Math.random() * 8)
    cumulative += projected
    stock -= projected

    let status: "ok" | "reorder" | "low" | "stockout" = "ok"
    if (stock <= 0) status = "stockout"
    else if (stock <= 20) status = "low"
    else if (stock <= 30) status = "reorder"

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" }),
      projected,
      cumulative,
      endStock: Math.max(0, stock),
      status
    })
  }

  return data
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ok":
      return <Badge variant="outline" className="text-green-600"><Check className="h-3 w-3 mr-1" />OK</Badge>
    case "reorder":
      return <Badge variant="secondary" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Reorder Point</Badge>
    case "low":
      return <Badge variant="secondary" className="text-orange-600"><AlertTriangle className="h-3 w-3 mr-1" />Low Stock</Badge>
    case "stockout":
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Stockout</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

function getRiskLabel(score: number) {
  if (score < 0.3) return { label: "LOW", color: "text-green-600" }
  if (score < 0.6) return { label: "MEDIUM", color: "text-yellow-600" }
  return { label: "HIGH", color: "text-red-600" }
}

export default function ItemForecastDetailPage() {
  const params = useParams()
  const itemId = params.itemId as string

  // Get item data (default to "1" if not found)
  const item = itemData[itemId] || itemData["1"]
  const chartData = useMemo(() => generateChartData(), [])
  const dailyBreakdown = useMemo(() => generateDailyBreakdown(), [])
  const risk = getRiskLabel(item.riskScore)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/operational-planning/demand-forecasting/forecast">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forecasts
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Item Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
        <p className="text-sm text-muted-foreground">{item.category}</p>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Package className="h-4 w-4" />
              Current Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.currentStock} {item.unit}</div>
            <p className="text-xs text-muted-foreground">Value: ${item.value.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Forecast Demand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.forecastDemand} {item.unit}</div>
            <p className="text-xs text-muted-foreground">({item.period} days) • Accuracy: {item.accuracy}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Purchase Quantity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.purchaseQty} {item.unit}</div>
            <p className="text-xs text-muted-foreground">Est. Cost: ${item.purchaseCost.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Parameters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Forecast Parameters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Method:</span>{" "}
                <span className="font-medium">{item.method}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Period:</span>{" "}
                <span className="font-medium">{item.period} days</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Service Level:</span>{" "}
                <span className="font-medium">{item.serviceLevel}%</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Safety Stock:</span>{" "}
                <span className="font-medium">{item.safetyStock} {item.unit}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Reorder Point:</span>{" "}
                <span className="font-medium">{item.reorderPoint} {item.unit}</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-sm mb-2">Risk Assessment:</p>
              <p className="text-sm">
                <span className="text-muted-foreground">Risk Score:</span>{" "}
                <span className={`font-medium ${risk.color}`}>{item.riskScore.toFixed(2)} ({risk.label})</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Demand Variability:</span>{" "}
                <span className="font-medium">{item.demandVariability}%</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Seasonality Factor:</span>{" "}
                <span className="font-medium">{item.seasonalityFactor} (slight summer increase)</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Trend Factor:</span>{" "}
                <span className="font-medium">{item.trendFactor} (gradual increase)</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Forecast Chart</CardTitle>
          <CardDescription>Historical data and projected stock levels with confidence band</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval={2}
                />
                <YAxis
                  label={{ value: `Stock (${item.unit})`, angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <ReferenceLine y={item.reorderPoint} stroke="#f59e0b" strokeDasharray="5 5" label="Reorder Point" />
                <ReferenceLine y={item.safetyStock} stroke="#ef4444" strokeDasharray="3 3" label="Safety Stock" />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="transparent"
                  fill="#93c5fd"
                  fillOpacity={0.3}
                  name="95% Confidence"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="transparent"
                  fill="#ffffff"
                  name=""
                />
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name="Historical"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Forecast"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Breakdown</CardTitle>
          <CardDescription>Day-by-day projected consumption and stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Projected</TableHead>
                  <TableHead className="text-right">Cumulative</TableHead>
                  <TableHead className="text-right">End Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyBreakdown.map((day, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{day.date}</TableCell>
                    <TableCell className="text-right">{day.projected} {item.unit}</TableCell>
                    <TableCell className="text-right">{day.cumulative} {item.unit}</TableCell>
                    <TableCell className="text-right">{day.endStock} {item.unit}</TableCell>
                    <TableCell>{getStatusBadge(day.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Link href="/procurement/purchase-requests/new">
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Purchase Request
              </Button>
            </Link>
            <Link href="/operational-planning/inventory-planning/reorder">
              <Button variant="outline">
                <Sliders className="h-4 w-4 mr-2" />
                Adjust Reorder Point
              </Button>
            </Link>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Forecast
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
