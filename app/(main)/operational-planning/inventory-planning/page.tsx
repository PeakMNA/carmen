'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  CheckCircle,
  Settings,
  MapPin,
  RefreshCw,
  ArrowRight,
  DollarSign,
  BarChart3,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/formatters';

// Mock data for dashboard
const mockDashboardData = {
  overallMetrics: {
    totalInventoryValue: 125000,
    inventoryTurnover: 14.2,
    daysOfInventory: 26,
    fillRate: 0.97,
    stockoutRate: 0.015,
  },
  alerts: {
    lowStock: 8,
    overstock: 12,
    deadStock: 5,
    expiring: 3,
    highValue: 2,
    fastMoving: 15,
  },
  potentialSavings: 8500,
  itemsAtRisk: 23,
  optimizationRate: 78,
  deadStockValue: 12500,
  trends: {
    savingsChange: 12,
    riskChange: -5,
    optimizationChange: 3,
    deadStockChange: -2100,
  },
};

const optimizationActionsData = [
  { name: 'Implement', value: 45, color: '#22c55e' },
  { name: 'Pilot', value: 30, color: '#3b82f6' },
  { name: 'Monitor', value: 50, color: '#f59e0b' },
  { name: 'Reject', value: 25, color: '#ef4444' },
];

const locationPerformanceData = [
  { location: 'Main Kitchen', value: 80000, turnover: 15.5, status: 'optimal' },
  { location: 'Satellite Kitchen', value: 45000, turnover: 12.8, status: 'overstocked' },
  { location: 'Cold Storage', value: 55000, turnover: 14.2, status: 'optimal' },
  { location: 'Dry Storage', value: 35000, turnover: 11.5, status: 'understocked' },
];

const recentRecommendations = [
  { id: '1', item: 'Olive Oil Extra Virgin 1L', category: 'Oils', savings: 65.20, risk: 'low', action: 'implement' },
  { id: '2', item: 'All-Purpose Flour 25kg', category: 'Dry Goods', savings: 45.80, risk: 'low', action: 'implement' },
  { id: '3', item: 'Heavy Cream 1L', category: 'Dairy', savings: 120.50, risk: 'medium', action: 'pilot' },
  { id: '4', item: 'Truffle Oil 250ml', category: 'Specialty', savings: 28.00, risk: 'high', action: 'monitor' },
];

const statusColors = {
  optimal: 'bg-green-100 text-green-800',
  overstocked: 'bg-yellow-100 text-yellow-800',
  understocked: 'bg-red-100 text-red-800',
};

const riskColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const actionColors = {
  implement: 'bg-green-100 text-green-800',
  pilot: 'bg-blue-100 text-blue-800',
  monitor: 'bg-yellow-100 text-yellow-800',
  reject: 'bg-red-100 text-red-800',
};

export default function InventoryPlanningDashboard() {
  const [selectedLocation, setSelectedLocation] = useState('all');

  const alertTotal = useMemo(() => {
    const { lowStock, overstock, deadStock, expiring, highValue } = mockDashboardData.alerts;
    return lowStock + overstock + deadStock + expiring + highValue;
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Planning</h1>
          <p className="text-muted-foreground">
            Optimize inventory levels, manage dead stock, and improve turnover
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px]">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="main">Main Kitchen</SelectItem>
              <SelectItem value="satellite">Satellite Kitchen</SelectItem>
              <SelectItem value="cold">Cold Storage</SelectItem>
              <SelectItem value="dry">Dry Storage</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/operational-planning/inventory-planning/reorder">
            <Target className="h-4 w-4 mr-2" />
            Optimize Inventory
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/operational-planning/inventory-planning/dead-stock">
            <Package className="h-4 w-4 mr-2" />
            Analyze Dead Stock
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/operational-planning/inventory-planning/locations">
            <MapPin className="h-4 w-4 mr-2" />
            Review Locations
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/operational-planning/inventory-planning/settings">
            <Settings className="h-4 w-4 mr-2" />
            Configure Settings
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mockDashboardData.potentialSavings)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {mockDashboardData.trends.savingsChange > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500">+{mockDashboardData.trends.savingsChange}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  <span className="text-red-500">{mockDashboardData.trends.savingsChange}%</span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockDashboardData.itemsAtRisk}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {mockDashboardData.trends.riskChange < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500">{mockDashboardData.trends.riskChange}</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                  <span className="text-red-500">+{mockDashboardData.trends.riskChange}</span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockDashboardData.optimizationRate}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {mockDashboardData.trends.optimizationChange > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500">+{mockDashboardData.trends.optimizationChange}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  <span className="text-red-500">{mockDashboardData.trends.optimizationChange}%</span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dead Stock Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(mockDashboardData.deadStockValue)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {mockDashboardData.trends.deadStockChange < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500">{formatCurrency(mockDashboardData.trends.deadStockChange)}</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                  <span className="text-red-500">+{formatCurrency(mockDashboardData.trends.deadStockChange)}</span>
                </>
              )}
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Optimization Actions Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Optimization Actions</CardTitle>
            <CardDescription>Breakdown of recommended actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={optimizationActionsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {optimizationActionsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Location Performance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location Performance</CardTitle>
            <CardDescription>Inventory value and turnover by location</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location" type="category" width={100} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'value' ? formatCurrency(value) : `${value}x`,
                    name === 'value' ? 'Value' : 'Turnover',
                  ]}
                />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Value ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alerts Summary</CardTitle>
          <CardDescription>
            {alertTotal} total alerts requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link
              href="/operational-planning/inventory-planning/reorder?filter=low-stock"
              className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <span className="text-2xl font-bold text-red-600">{mockDashboardData.alerts.lowStock}</span>
              <span className="text-sm text-muted-foreground">Low Stock</span>
              <Badge variant="destructive" className="mt-1">Critical</Badge>
            </Link>
            <Link
              href="/operational-planning/inventory-planning/reorder?filter=overstock"
              className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <span className="text-2xl font-bold text-yellow-600">{mockDashboardData.alerts.overstock}</span>
              <span className="text-sm text-muted-foreground">Overstock</span>
              <Badge variant="outline" className="mt-1 border-yellow-500 text-yellow-600">Warning</Badge>
            </Link>
            <Link
              href="/operational-planning/inventory-planning/dead-stock"
              className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <span className="text-2xl font-bold text-red-600">{mockDashboardData.alerts.deadStock}</span>
              <span className="text-sm text-muted-foreground">Dead Stock</span>
              <Badge variant="destructive" className="mt-1">Critical</Badge>
            </Link>
            <Link
              href="/inventory-management/expiring"
              className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <span className="text-2xl font-bold text-red-600">{mockDashboardData.alerts.expiring}</span>
              <span className="text-sm text-muted-foreground">Expiring</span>
              <Badge variant="destructive" className="mt-1">Critical</Badge>
            </Link>
            <Link
              href="/operational-planning/inventory-planning/reorder?filter=high-value"
              className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <span className="text-2xl font-bold text-orange-600">{mockDashboardData.alerts.highValue}</span>
              <span className="text-sm text-muted-foreground">High Value</span>
              <Badge variant="outline" className="mt-1 border-orange-500 text-orange-600">Warning</Badge>
            </Link>
            <div className="flex flex-col items-center p-4 rounded-lg border bg-blue-50">
              <span className="text-2xl font-bold text-blue-600">{mockDashboardData.alerts.fastMoving}</span>
              <span className="text-sm text-muted-foreground">Fast Moving</span>
              <Badge variant="outline" className="mt-1 border-blue-500 text-blue-600">Info</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Recommendations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Recommendations</CardTitle>
            <CardDescription>Latest optimization recommendations</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/operational-planning/inventory-planning/reorder">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Savings</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRecommendations.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-medium">{rec.item}</TableCell>
                  <TableCell>{rec.category}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    {formatCurrency(rec.savings)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize', riskColors[rec.risk as keyof typeof riskColors])}>
                      {rec.risk}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize', actionColors[rec.action as keyof typeof actionColors])}>
                      {rec.action}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cross-Navigation */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Need demand predictions?</p>
                <p className="text-sm text-muted-foreground">
                  View forecasts to better plan your inventory
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/operational-planning/demand-forecasting">
                Go to Demand Forecasting
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
