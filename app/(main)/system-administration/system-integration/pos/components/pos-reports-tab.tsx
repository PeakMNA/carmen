"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import type { GrossProfitReportItem, ConsumptionAnalysisItem } from "@/lib/mock-data/pos-integration"
import { formatNumber } from "@/lib/utils/formatters"

interface POSReportsTabProps {
  grossProfitReport: GrossProfitReportItem[]
  consumptionAnalysis: ConsumptionAnalysisItem[]
  period: { startDate: string; endDate: string }
  onExportReport: (reportType: string, format: 'csv' | 'pdf' | 'excel') => void
}

export function POSReportsTab({
  grossProfitReport,
  consumptionAnalysis,
  period,
  onExportReport
}: POSReportsTabProps) {
  const [reportTab, setReportTab] = useState<'gross-profit' | 'consumption' | 'variance'>('gross-profit')
  const [periodFilter, setPeriodFilter] = useState('30d')

  // Summary calculations
  const grossProfitSummary = useMemo(() => {
    const totalRevenue = grossProfitReport.reduce((sum, item) => sum + item.revenue, 0)
    const totalCOGS = grossProfitReport.reduce((sum, item) => sum + item.cogs, 0)
    const totalGrossProfit = grossProfitReport.reduce((sum, item) => sum + item.grossProfit, 0)
    const avgMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0
    const totalTransactions = grossProfitReport.reduce((sum, item) => sum + item.transactionCount, 0)

    return { totalRevenue, totalCOGS, totalGrossProfit, avgMargin, totalTransactions }
  }, [grossProfitReport])

  const consumptionSummary = useMemo(() => {
    const totalTheoretical = consumptionAnalysis.reduce((sum, item) => sum + item.theoreticalUsage, 0)
    const totalActual = consumptionAnalysis.reduce((sum, item) => sum + item.actualUsage, 0)
    const totalVariance = consumptionAnalysis.reduce((sum, item) => sum + item.variance, 0)
    const avgVariancePercent = consumptionAnalysis.length > 0
      ? consumptionAnalysis.reduce((sum, item) => sum + item.variancePercentage, 0) / consumptionAnalysis.length
      : 0
    const totalCost = consumptionAnalysis.reduce((sum, item) => sum + item.cost, 0)

    return { totalTheoretical, totalActual, totalVariance, avgVariancePercent, totalCost }
  }, [consumptionAnalysis])

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">POS Analytics & Reports</h2>
          <p className="text-sm text-muted-foreground">
            Analyze sales, consumption, and variance data from POS transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={reportTab} onValueChange={(v) => setReportTab(v as typeof reportTab)}>
        <TabsList>
          <TabsTrigger value="gross-profit" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Gross Profit Analysis
          </TabsTrigger>
          <TabsTrigger value="consumption" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Consumption Analysis
          </TabsTrigger>
          <TabsTrigger value="variance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Variance Report
          </TabsTrigger>
        </TabsList>

        {/* Gross Profit Analysis Tab */}
        <TabsContent value="gross-profit" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Revenue</CardDescription>
                <CardTitle className="text-2xl">${formatNumber(grossProfitSummary.totalRevenue)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total COGS</CardDescription>
                <CardTitle className="text-2xl text-red-600">${formatNumber(grossProfitSummary.totalCOGS)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Gross Profit</CardDescription>
                <CardTitle className="text-2xl text-green-600">${formatNumber(grossProfitSummary.totalGrossProfit)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg. Margin</CardDescription>
                <CardTitle className="text-2xl">{grossProfitSummary.avgMargin.toFixed(1)}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Transactions</CardDescription>
                <CardTitle className="text-2xl">{formatNumber(grossProfitSummary.totalTransactions)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Gross Profit Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gross Profit by Category</CardTitle>
                <CardDescription>Revenue, cost, and margin breakdown by product category</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onExportReport('gross-profit', 'excel')}>
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">COGS</TableHead>
                    <TableHead className="text-right">Gross Profit</TableHead>
                    <TableHead className="text-right">Margin %</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grossProfitReport.map((item) => (
                    <TableRow key={item.category}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell className="text-right tabular-nums">${formatNumber(item.revenue)}</TableCell>
                      <TableCell className="text-right tabular-nums text-red-600">${formatNumber(item.cogs)}</TableCell>
                      <TableCell className="text-right tabular-nums text-green-600">${formatNumber(item.grossProfit)}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={
                          item.marginPercentage >= 65 ? 'bg-green-100 text-green-800' :
                          item.marginPercentage >= 50 ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {item.marginPercentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatNumber(item.transactionCount)}</TableCell>
                      <TableCell className="text-right">
                        {item.marginPercentage >= 60 ? (
                          <TrendingUp className="h-4 w-4 text-green-600 inline" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 inline" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consumption Analysis Tab */}
        <TabsContent value="consumption" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Theoretical Usage</CardDescription>
                <CardTitle className="text-2xl">{formatNumber(consumptionSummary.totalTheoretical)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Actual Usage</CardDescription>
                <CardTitle className="text-2xl">{formatNumber(consumptionSummary.totalActual)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Variance</CardDescription>
                <CardTitle className="text-2xl text-amber-600">{formatNumber(consumptionSummary.totalVariance)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Variance Cost</CardDescription>
                <CardTitle className="text-2xl text-red-600">${formatNumber(consumptionSummary.totalCost)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Consumption Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ingredient Consumption Analysis</CardTitle>
                <CardDescription>Compare theoretical vs actual ingredient usage</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onExportReport('consumption', 'excel')}>
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead className="text-right">Theoretical</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead className="text-right">Variance %</TableHead>
                    <TableHead className="text-right">Cost Impact</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumptionAnalysis.map((item) => (
                    <TableRow key={item.ingredient}>
                      <TableCell className="font-medium">{item.ingredient}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(item.theoreticalUsage)} {item.unit}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(item.actualUsage)} {item.unit}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className={item.variance > 0 ? 'text-red-600' : 'text-green-600'}>
                          {item.variance > 0 ? '+' : ''}{formatNumber(item.variance)} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.variancePercentage > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-green-600" />
                          )}
                          <span className={item.variancePercentage > 5 ? 'text-red-600' : ''}>
                            {item.variancePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-red-600">
                        ${formatNumber(item.cost)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={
                          item.variancePercentage <= 3 ? 'bg-green-100 text-green-800' :
                          item.variancePercentage <= 10 ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {item.variancePercentage <= 3 ? 'Normal' :
                           item.variancePercentage <= 10 ? 'Review' : 'Critical'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variance Report Tab */}
        <TabsContent value="variance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variance Analysis Report</CardTitle>
              <CardDescription>
                Detailed analysis of theoretical vs actual usage with cost implications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Top Variance Items */}
                <div>
                  <h4 className="font-medium mb-4">Top Variance Items (by cost impact)</h4>
                  <div className="space-y-3">
                    {[...consumptionAnalysis]
                      .sort((a, b) => b.cost - a.cost)
                      .slice(0, 5)
                      .map((item, idx) => (
                        <div key={item.ingredient} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                            <div>
                              <p className="font-medium">{item.ingredient}</p>
                              <p className="text-sm text-muted-foreground">
                                Variance: {formatNumber(item.variance)} {item.unit} ({item.variancePercentage.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-600">${formatNumber(item.cost)}</p>
                            <p className="text-sm text-muted-foreground">cost impact</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Variance Distribution */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Within Target (≤3%)</CardDescription>
                      <CardTitle className="text-xl text-green-600">
                        {consumptionAnalysis.filter(i => i.variancePercentage <= 3).length} items
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Needs Review (3-10%)</CardDescription>
                      <CardTitle className="text-xl text-amber-600">
                        {consumptionAnalysis.filter(i => i.variancePercentage > 3 && i.variancePercentage <= 10).length} items
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Critical (&gt;10%)</CardDescription>
                      <CardTitle className="text-xl text-red-600">
                        {consumptionAnalysis.filter(i => i.variancePercentage > 10).length} items
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Review portion control for Fresh Basil - variance of 20% indicates potential over-portioning</li>
                    <li>Check recipe accuracy for Mozzarella Cheese and Tomato Sauce (5% variance)</li>
                    <li>Consider updating theoretical yields based on actual production data</li>
                    <li>Train staff on portion standards for high-variance ingredients</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
