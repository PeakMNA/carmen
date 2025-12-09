"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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
  Shield,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RotateCcw,
  CheckCircle
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils/formatters"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"

// Types for safety stock optimization
interface SafetyStockItem {
  id: string
  productCode: string
  productName: string
  category: string
  currentSafetyStock: number
  recommendedSafetyStock: { [key: string]: number }
  unit: string
  unitCost: number
  demandVariability: number
  leadTimeVariability: number
  currentServiceLevel: number
}

// Service level cost data for chart
interface ServiceLevelPoint {
  level: number
  cost: number
  label: string
}

// Mock data generator
function generateSafetyStockItems(): SafetyStockItem[] {
  const products = [
    { code: 'OIL-001', name: 'Olive Oil Extra Virgin 1L', category: 'Oils & Fats', unit: 'bottles', cost: 12.50 },
    { code: 'FLR-001', name: 'Flour All-Purpose 25kg', category: 'Dry Goods', unit: 'bags', cost: 18.00 },
    { code: 'CRM-001', name: 'Heavy Cream 1L', category: 'Dairy', unit: 'cartons', cost: 4.50 },
    { code: 'BTR-001', name: 'Butter Unsalted 500g', category: 'Dairy', unit: 'packs', cost: 6.00 },
    { code: 'CHK-001', name: 'Chicken Breast 1kg', category: 'Proteins', unit: 'kg', cost: 8.50 },
    { code: 'SAL-001', name: 'Atlantic Salmon Fillet', category: 'Seafood', unit: 'kg', cost: 22.00 },
    { code: 'TOM-001', name: 'Canned Tomatoes 400g', category: 'Canned Goods', unit: 'cans', cost: 2.00 },
    { code: 'RCE-001', name: 'Jasmine Rice 5kg', category: 'Dry Goods', unit: 'bags', cost: 8.00 },
    { code: 'EGG-001', name: 'Free Range Eggs Dozen', category: 'Dairy', unit: 'dozens', cost: 5.50 },
    { code: 'ONI-001', name: 'Yellow Onions 10kg', category: 'Produce', unit: 'bags', cost: 7.00 },
    { code: 'GAR-001', name: 'Garlic Bulbs 1kg', category: 'Produce', unit: 'kg', cost: 9.00 },
    { code: 'MIL-001', name: 'Whole Milk 1L', category: 'Dairy', unit: 'cartons', cost: 2.50 },
  ]

  return products.map((product, idx) => {
    const currentSS = Math.floor(Math.random() * 15) + 5
    const demandVar = Math.floor(Math.random() * 25) + 5
    const leadTimeVar = Math.floor(Math.random() * 20) + 5

    // Calculate recommended safety stock for different service levels
    const baseMultiplier = (demandVar + leadTimeVar) / 100

    return {
      id: `ss-${idx}`,
      productCode: product.code,
      productName: product.name,
      category: product.category,
      currentSafetyStock: currentSS,
      recommendedSafetyStock: {
        '90': Math.round(currentSS * (1 - baseMultiplier * 0.3)),
        '95': Math.round(currentSS * (1 - baseMultiplier * 0.1)),
        '99': Math.round(currentSS * (1 + baseMultiplier * 0.4)),
      },
      unit: product.unit,
      unitCost: product.cost,
      demandVariability: demandVar,
      leadTimeVariability: leadTimeVar,
      currentServiceLevel: Math.floor(Math.random() * 10) + 88,
    }
  })
}

export default function SafetyStockPage() {
  const [items] = useState<SafetyStockItem[]>(generateSafetyStockItems)
  const [targetServiceLevel, setTargetServiceLevel] = useState("95")

  // Calculate totals
  const totals = useMemo(() => {
    const currentCost = items.reduce((sum, item) =>
      sum + (item.currentSafetyStock * item.unitCost), 0)

    const recommendedCost = items.reduce((sum, item) =>
      sum + (item.recommendedSafetyStock[targetServiceLevel] * item.unitCost), 0)

    const savings = currentCost - recommendedCost

    return {
      currentCost,
      recommendedCost,
      savings,
      itemsWithIncrease: items.filter(item =>
        item.recommendedSafetyStock[targetServiceLevel] > item.currentSafetyStock).length,
      itemsWithDecrease: items.filter(item =>
        item.recommendedSafetyStock[targetServiceLevel] < item.currentSafetyStock).length,
    }
  }, [items, targetServiceLevel])

  // Service level cost curve data
  const serviceLevelCurve: ServiceLevelPoint[] = useMemo(() => {
    const baseCost = items.reduce((sum, item) => sum + (item.currentSafetyStock * item.unitCost), 0)

    return [
      { level: 85, cost: baseCost * 0.7, label: '85%' },
      { level: 90, cost: baseCost * 0.85, label: '90%' },
      { level: 95, cost: baseCost * 1.0, label: '95%' },
      { level: 97, cost: baseCost * 1.3, label: '97%' },
      { level: 99, cost: baseCost * 1.8, label: '99%' },
    ]
  }, [items])

  // Calculate change percentage
  const calcChange = (current: number, recommended: number) => {
    if (current === 0) return 0
    return Math.round(((recommended - current) / current) * 100)
  }

  // Calculate cost impact
  const calcCostImpact = (item: SafetyStockItem) => {
    const change = item.recommendedSafetyStock[targetServiceLevel] - item.currentSafetyStock
    return change * item.unitCost
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
              <Shield className="h-7 w-7 text-blue-600" />
              Safety Stock Optimization
            </h1>
            <p className="text-sm text-muted-foreground">
              Optimize safety stock levels to balance service level and carrying costs
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
            Export Analysis
          </Button>
        </div>
      </div>

      {/* Service Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Level Selection</CardTitle>
          <CardDescription>
            Higher service level = More safety stock = Higher carrying cost
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={targetServiceLevel}
            onValueChange={setTargetServiceLevel}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="90" id="sl-90" />
              <Label htmlFor="sl-90" className="cursor-pointer flex-1">
                <div className="font-medium">90% Service Level</div>
                <div className="text-sm text-muted-foreground">Lower cost, acceptable stockout risk</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 border-primary">
              <RadioGroupItem value="95" id="sl-95" />
              <Label htmlFor="sl-95" className="cursor-pointer flex-1">
                <div className="font-medium">95% Service Level</div>
                <div className="text-sm text-muted-foreground">Balanced cost and availability</div>
              </Label>
              <Badge variant="secondary">Recommended</Badge>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="99" id="sl-99" />
              <Label htmlFor="sl-99" className="cursor-pointer flex-1">
                <div className="font-medium">99% Service Level</div>
                <div className="text-sm text-muted-foreground">Minimal stockouts, higher cost</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current vs Recommended Safety Stock</CardTitle>
          <CardDescription>
            Comparison based on {targetServiceLevel}% target service level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Current SS</TableHead>
                  <TableHead className="text-center">Recommended SS</TableHead>
                  <TableHead className="text-center">Change</TableHead>
                  <TableHead className="text-right">Cost Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const change = calcChange(item.currentSafetyStock, item.recommendedSafetyStock[targetServiceLevel])
                  const costImpact = calcCostImpact(item)

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">{item.productCode}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.currentSafetyStock} {item.unit}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.recommendedSafetyStock[targetServiceLevel]} {item.unit}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`flex items-center justify-center gap-1 ${
                          change < 0 ? 'text-green-600' : change > 0 ? 'text-orange-600' : ''
                        }`}>
                          {change < 0 ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : change > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : null}
                          {change > 0 ? '+' : ''}{change}%
                        </span>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        costImpact < 0 ? 'text-green-600' : costImpact > 0 ? 'text-orange-600' : ''
                      }`}>
                        {costImpact < 0 ? '-' : costImpact > 0 ? '+' : ''}{formatCurrency(Math.abs(costImpact))}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* What-If Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What-If Analysis</CardTitle>
          <CardDescription>
            Cost vs Service Level Trade-off
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serviceLevelCurve} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="level"
                  label={{ value: 'Service Level (%)', position: 'bottom', offset: 0 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Total Cost']}
                  labelFormatter={(label) => `${label}% Service Level`}
                />
                <ReferenceLine
                  x={parseInt(targetServiceLevel)}
                  stroke="#3b82f6"
                  strokeDasharray="5 5"
                  label={{ value: 'Target', position: 'top', fill: '#3b82f6' }}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Cost</p>
                <p className="text-lg font-bold">{formatCurrency(totals.currentCost)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recommended Cost</p>
                <p className="text-lg font-bold">{formatCurrency(totals.recommendedCost)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                totals.savings > 0 ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {totals.savings > 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {totals.savings > 0 ? 'Potential Savings' : 'Additional Cost'}
                </p>
                <p className={`text-lg font-bold ${
                  totals.savings > 0 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {formatCurrency(Math.abs(totals.savings))}
                </p>
              </div>
            </div>
          </div>

          {/* Item Summary */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
            <span>
              <span className="text-green-600 font-medium">{totals.itemsWithDecrease}</span> items with decreased safety stock
            </span>
            <span>•</span>
            <span>
              <span className="text-orange-600 font-medium">{totals.itemsWithIncrease}</span> items with increased safety stock
            </span>
            <span>•</span>
            <span>
              <span className="font-medium">{items.length - totals.itemsWithDecrease - totals.itemsWithIncrease}</span> items unchanged
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-end">
        <Button variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Current
        </Button>
        <Button>
          <CheckCircle className="h-4 w-4 mr-2" />
          Apply Recommendations
        </Button>
      </div>
    </div>
  )
}
