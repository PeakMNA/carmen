"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  ArrowLeft,
  RefreshCw,
  Download,
  MapPin,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Package,
  TrendingUp
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils/formatters"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"

// Types for multi-location planning
interface LocationData {
  id: string
  name: string
  inventoryValue: number
  turnoverRate: number
  alertCount: number
  status: 'optimal' | 'overstocked' | 'understocked'
  efficiency: number
  capacityUtilization: number
}

interface TransferRecommendation {
  id: string
  productCode: string
  productName: string
  fromLocationId: string
  fromLocationName: string
  toLocationId: string
  toLocationName: string
  quantity: number
  unit: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  estimatedSavings: number
}

// Mock data generator
function generateLocationData(): LocationData[] {
  return [
    {
      id: 'loc-1',
      name: 'Main Kitchen',
      inventoryValue: 80000,
      turnoverRate: 15.5,
      alertCount: 5,
      status: 'optimal',
      efficiency: 92,
      capacityUtilization: 78,
    },
    {
      id: 'loc-2',
      name: 'Satellite Kitchen',
      inventoryValue: 45000,
      turnoverRate: 12.8,
      alertCount: 8,
      status: 'overstocked',
      efficiency: 75,
      capacityUtilization: 95,
    },
    {
      id: 'loc-3',
      name: 'Cold Storage',
      inventoryValue: 55000,
      turnoverRate: 14.2,
      alertCount: 3,
      status: 'optimal',
      efficiency: 88,
      capacityUtilization: 72,
    },
    {
      id: 'loc-4',
      name: 'Dry Storage',
      inventoryValue: 35000,
      turnoverRate: 11.5,
      alertCount: 12,
      status: 'understocked',
      efficiency: 65,
      capacityUtilization: 45,
    },
  ]
}

function generateTransferRecommendations(): TransferRecommendation[] {
  return [
    {
      id: 'tr-1',
      productCode: 'OIL-001',
      productName: 'Olive Oil Extra Virgin 1L',
      fromLocationId: 'loc-2',
      fromLocationName: 'Satellite Kitchen',
      toLocationId: 'loc-4',
      toLocationName: 'Dry Storage',
      quantity: 15,
      unit: 'bottles',
      reason: 'Excess stock at source, shortage at destination',
      priority: 'high',
      estimatedSavings: 120,
    },
    {
      id: 'tr-2',
      productCode: 'FLR-001',
      productName: 'Flour All-Purpose 25kg',
      fromLocationId: 'loc-2',
      fromLocationName: 'Satellite Kitchen',
      toLocationId: 'loc-4',
      toLocationName: 'Dry Storage',
      quantity: 8,
      unit: 'bags',
      reason: 'Rebalance inventory levels',
      priority: 'medium',
      estimatedSavings: 85,
    },
    {
      id: 'tr-3',
      productCode: 'CRM-001',
      productName: 'Heavy Cream 1L',
      fromLocationId: 'loc-3',
      fromLocationName: 'Cold Storage',
      toLocationId: 'loc-1',
      toLocationName: 'Main Kitchen',
      quantity: 20,
      unit: 'cartons',
      reason: 'Approaching expiry, higher demand at destination',
      priority: 'high',
      estimatedSavings: 200,
    },
    {
      id: 'tr-4',
      productCode: 'BTR-001',
      productName: 'Butter Unsalted 500g',
      fromLocationId: 'loc-2',
      fromLocationName: 'Satellite Kitchen',
      toLocationId: 'loc-1',
      toLocationName: 'Main Kitchen',
      quantity: 12,
      unit: 'packs',
      reason: 'Higher turnover at destination',
      priority: 'low',
      estimatedSavings: 45,
    },
  ]
}

export default function MultiLocationPage() {
  const [locations] = useState<LocationData[]>(generateLocationData)
  const [transfers] = useState<TransferRecommendation[]>(generateTransferRecommendations)

  // Calculate summary stats
  const summary = useMemo(() => ({
    optimal: locations.filter(l => l.status === 'optimal').length,
    overstocked: locations.filter(l => l.status === 'overstocked').length,
    understocked: locations.filter(l => l.status === 'understocked').length,
    totalValue: locations.reduce((sum, l) => sum + l.inventoryValue, 0),
    avgTurnover: locations.reduce((sum, l) => sum + l.turnoverRate, 0) / locations.length,
    totalAlerts: locations.reduce((sum, l) => sum + l.alertCount, 0),
    potentialSavings: transfers.reduce((sum, t) => sum + t.estimatedSavings, 0),
  }), [locations, transfers])

  // Chart data
  const chartData = useMemo(() =>
    locations.map(loc => ({
      name: loc.name.split(' ')[0], // Shorten name for chart
      value: loc.inventoryValue,
      turnover: loc.turnoverRate,
      status: loc.status,
    })),
    [locations]
  )

  // Status badge renderer
  const renderStatusBadge = (status: LocationData['status']) => {
    const variants = {
      optimal: { className: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
      overstocked: { className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: AlertTriangle },
      understocked: { className: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle },
    }
    const Icon = variants[status].icon
    return (
      <Badge variant="outline" className={`${variants[status].className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  // Priority badge renderer
  const renderPriorityBadge = (priority: TransferRecommendation['priority']) => {
    const variants = {
      high: { className: "bg-red-50 text-red-700 border-red-200" },
      medium: { className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      low: { className: "bg-green-50 text-green-700 border-green-200" },
    }
    return (
      <Badge variant="outline" className={variants[priority].className}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  // Bar color by status
  const getBarColor = (status: string) => {
    switch (status) {
      case 'optimal': return '#22c55e'
      case 'overstocked': return '#eab308'
      case 'understocked': return '#ef4444'
      default: return '#6b7280'
    }
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
              <MapPin className="h-7 w-7 text-purple-600" />
              Multi-Location Planning
            </h1>
            <p className="text-sm text-muted-foreground">
              Optimize inventory distribution across all locations
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

      {/* Location Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Location Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Optimal */}
            <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">OPTIMAL</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900 mt-2">{summary.optimal}</p>
              <p className="text-sm text-green-700">locations performing well</p>
            </div>

            {/* Overstocked */}
            <div className="p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-800">OVERSTOCKED</span>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{summary.overstocked}</p>
              <p className="text-sm text-yellow-700">locations with excess inventory</p>
            </div>

            {/* Understocked */}
            <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-800">UNDERSTOCKED</span>
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-900 mt-2">{summary.understocked}</p>
              <p className="text-sm text-red-700">locations needing replenishment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location Performance</CardTitle>
          <CardDescription>
            Inventory value and status by location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis
                  type="number"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Inventory Value']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500"></div>
              <span>Overstocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span>Understocked</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-center">Turnover</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead className="text-center">Alerts</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{location.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(location.inventoryValue)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        {location.turnoverRate}x
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={location.capacityUtilization} className="h-2 w-16" />
                        <span className="text-sm text-muted-foreground">{location.capacityUtilization}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={location.alertCount > 5 ? "destructive" : "secondary"}>
                        {location.alertCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {renderStatusBadge(location.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary Row */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Total Inventory Value:</span>
              <span className="ml-2 font-bold">{formatCurrency(summary.totalValue)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Turnover Rate:</span>
              <span className="ml-2 font-bold">{summary.avgTurnover.toFixed(1)}x</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Alerts:</span>
              <span className="ml-2 font-bold">{summary.totalAlerts}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Transfer Recommendations</CardTitle>
              <CardDescription>
                Suggested inventory transfers to optimize distribution
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Potential Savings: {formatCurrency(summary.potentialSavings)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Item</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead></TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-center">Priority</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No transfer recommendations at this time.
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transfer.productName}</p>
                          <p className="text-sm text-muted-foreground">{transfer.productCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-red-500" />
                          <span>{transfer.fromLocationName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-green-500" />
                          <span>{transfer.toLocationName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {transfer.quantity} {transfer.unit}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderPriorityBadge(transfer.priority)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm">
                          <Package className="h-4 w-4 mr-2" />
                          Create Transfer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {transfers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
              <strong>Tip:</strong> Implementing these transfers can help balance inventory across locations,
              reduce stockouts, and minimize carrying costs for overstocked items.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
