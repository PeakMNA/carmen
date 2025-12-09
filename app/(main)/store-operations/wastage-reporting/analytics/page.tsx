'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Progress } from '@/components/ui/progress'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import {
  BarChart3,
  ArrowLeft,
  Download,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  AlertTriangle,
  Target,
  Lightbulb,
  ChevronRight,
  Trash2,
} from 'lucide-react'

// Monthly wastage trend data
const monthlyTrendData = [
  { month: 'Jul', value: 5200, items: 65, target: 4000 },
  { month: 'Aug', value: 4800, items: 58, target: 4000 },
  { month: 'Sep', value: 4200, items: 52, target: 4000 },
  { month: 'Oct', value: 4500, items: 55, target: 4000 },
  { month: 'Nov', value: 3800, items: 48, target: 4000 },
  { month: 'Dec', value: 4100, items: 52, target: 4000 },
  { month: 'Jan', value: 3458, items: 45, target: 4000 },
]

// Wastage by reason data
const wastageByReasonData = [
  { name: 'Expiration', value: 1556, percentage: 45, color: '#ef4444' },
  { name: 'Damage', value: 865, percentage: 25, color: '#f97316' },
  { name: 'Quality Issues', value: 519, percentage: 15, color: '#eab308' },
  { name: 'Spoilage', value: 346, percentage: 10, color: '#84cc16' },
  { name: 'Other', value: 172, percentage: 5, color: '#6b7280' },
]

// Wastage by location data
const wastageByLocationData = [
  { location: 'Main Kitchen', current: 1250, previous: 1450, change: -13.8 },
  { location: 'Pool Bar', current: 680, previous: 720, change: -5.6 },
  { location: 'Rooftop Restaurant', current: 520, previous: 480, change: 8.3 },
  { location: 'Lobby Café', current: 450, previous: 520, change: -13.5 },
  { location: 'Banquet Hall', current: 558, previous: 610, change: -8.5 },
]

// Top wasted items
const topWastedItems = [
  { rank: 1, name: 'Thai Milk Tea Powder', code: 'BEV-001', quantity: 45, value: 2069.55, reason: 'Expiration', trend: 'up' },
  { rank: 2, name: 'Fresh Salmon Fillet', code: 'SEA-001', quantity: 28, value: 1260.00, reason: 'Spoilage', trend: 'down' },
  { rank: 3, name: 'Wagyu Beef Premium', code: 'MTT-001', quantity: 5, value: 925.00, reason: 'Quality Issues', trend: 'same' },
  { rank: 4, name: 'Mixed Salad Greens', code: 'VEG-005', quantity: 65, value: 780.00, reason: 'Spoilage', trend: 'down' },
  { rank: 5, name: 'Orange Juice Fresh', code: 'LIQ-003', quantity: 85, value: 722.50, reason: 'Expiration', trend: 'up' },
]

// Weekly comparison data
const weeklyComparisonData = [
  { week: 'Week 1', expiration: 450, damage: 220, quality: 180, spoilage: 120 },
  { week: 'Week 2', expiration: 380, damage: 190, quality: 150, spoilage: 95 },
  { week: 'Week 3', expiration: 420, damage: 240, quality: 160, spoilage: 110 },
  { week: 'Week 4', expiration: 306, damage: 215, quality: 129, spoilage: 121 },
]

// Category breakdown
const categoryBreakdownData = [
  { category: 'Beverages', value: 1200, percentage: 35 },
  { category: 'Meat & Poultry', value: 925, percentage: 27 },
  { category: 'Seafood', value: 580, percentage: 17 },
  { category: 'Vegetables', value: 450, percentage: 13 },
  { category: 'Bakery', value: 303, percentage: 8 },
]

export default function WastageAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/store-operations/wastage-reporting">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-purple-600" />
              Wastage Analytics
            </h1>
            <p className="text-muted-foreground">
              Analyze wastage patterns and identify reduction opportunities
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-red-200">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Wastage</p>
                <p className="text-2xl font-bold text-red-600">$3,458.50</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">15.7% vs last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Items Wasted</p>
                <p className="text-2xl font-bold">45</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">13.5% vs last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wastage Rate</p>
                <p className="text-2xl font-bold text-green-600">2.3%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">0.5% improvement</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">vs Target</p>
                <p className="text-2xl font-bold text-green-600">-$541.50</p>
                <p className="text-xs text-muted-foreground mt-1">Under budget</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend with Target */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Monthly Wastage Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value, name) => [
                    name === 'target' ? `$${value}` : `$${value}`,
                    name === 'target' ? 'Target' : 'Actual'
                  ]} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#ef4444"
                    fill="#fecaca"
                    name="Actual"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#22c55e"
                    strokeDasharray="5 5"
                    name="Target"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Wastage by Reason */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Wastage by Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wastageByReasonData}
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {wastageByReasonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-40 flex flex-col justify-center gap-2">
                {wastageByReasonData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs truncate block">{entry.name}</span>
                    </div>
                    <span className="text-xs font-medium">{entry.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Breakdown by Reason
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${value}`, '']} />
                <Legend />
                <Bar dataKey="expiration" stackId="a" fill="#ef4444" name="Expiration" />
                <Bar dataKey="damage" stackId="a" fill="#f97316" name="Damage" />
                <Bar dataKey="quality" stackId="a" fill="#eab308" name="Quality" />
                <Bar dataKey="spoilage" stackId="a" fill="#84cc16" name="Spoilage" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Location & Category Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Location Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Wastage by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wastageByLocationData.map((location) => (
                <div key={location.location} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{location.location}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${location.current.toLocaleString()}</span>
                      <Badge
                        className={location.change < 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {location.change > 0 ? '+' : ''}{location.change}%
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={(location.current / 1500) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Previous: ${location.previous.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Wastage by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdownData.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${category.value.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">({category.percentage}%)</span>
                    </div>
                  </div>
                  <Progress
                    value={category.percentage}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Wasted Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Top Wasted Items
            </CardTitle>
            <Link href="/store-operations/wastage-reporting/reports">
              <Button variant="outline" size="sm">
                View All Reports
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Primary Reason</TableHead>
                <TableHead className="text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topWastedItems.map((item) => (
                <TableRow key={item.rank}>
                  <TableCell>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      item.rank === 1 ? 'bg-red-100 text-red-700' :
                      item.rank === 2 ? 'bg-orange-100 text-orange-700' :
                      item.rank === 3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.code}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    ${item.value.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.reason}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-red-600 mx-auto" />
                    ) : item.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-purple-900">Key Findings</h4>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Expiration accounts for 45% of wastage - consider FIFO improvements
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Main Kitchen has highest wastage but shows 13.8% improvement
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Thai Milk Tea Powder is consistently the top wasted item
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Beverages category contributes 35% of total wastage value
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-purple-900">Recommended Actions</h4>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex gap-2">
                  <span className="text-purple-600">1.</span>
                  Review beverage ordering quantities and frequency
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">2.</span>
                  Implement stricter FIFO protocols in storage areas
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">3.</span>
                  Set up expiration alerts for high-value items
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">4.</span>
                  Investigate quality issues with Wagyu Beef supplier
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
