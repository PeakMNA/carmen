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
  ArrowLeft,
  Download,
  RefreshCw,
  Search,
  DollarSign,
  Package,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Check,
  FlaskConical,
  Eye,
  X,
  Calendar
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock optimization data
const optimizationData = [
  {
    id: "1",
    item: "Chicken Breast",
    category: "Protein",
    currentReorderPt: 50,
    recommendedReorderPt: 35,
    currentOrderQty: 100,
    recommendedOrderQty: 75,
    currentSafetyStock: 30,
    recommendedSafetyStock: 20,
    unit: "kg",
    savings: 450,
    risk: "LOW",
    action: "implement"
  },
  {
    id: "2",
    item: "Olive Oil",
    category: "Oils",
    currentReorderPt: 10,
    recommendedReorderPt: 15,
    currentOrderQty: 20,
    recommendedOrderQty: 30,
    currentSafetyStock: 5,
    recommendedSafetyStock: 8,
    unit: "L",
    savings: 280,
    risk: "MEDIUM",
    action: "pilot"
  },
  {
    id: "3",
    item: "Fresh Salmon",
    category: "Seafood",
    currentReorderPt: 20,
    recommendedReorderPt: 18,
    currentOrderQty: 50,
    recommendedOrderQty: 45,
    currentSafetyStock: 10,
    recommendedSafetyStock: 8,
    unit: "kg",
    savings: 320,
    risk: "LOW",
    action: "implement"
  },
  {
    id: "4",
    item: "Rice",
    category: "Grains",
    currentReorderPt: 80,
    recommendedReorderPt: 60,
    currentOrderQty: 200,
    recommendedOrderQty: 150,
    currentSafetyStock: 40,
    recommendedSafetyStock: 30,
    unit: "kg",
    savings: 520,
    risk: "LOW",
    action: "implement"
  },
  {
    id: "5",
    item: "Fresh Herbs",
    category: "Produce",
    currentReorderPt: 5,
    recommendedReorderPt: 8,
    currentOrderQty: 15,
    recommendedOrderQty: 20,
    currentSafetyStock: 3,
    recommendedSafetyStock: 5,
    unit: "kg",
    savings: 150,
    risk: "MEDIUM",
    action: "pilot"
  },
  {
    id: "6",
    item: "Butter",
    category: "Dairy",
    currentReorderPt: 15,
    recommendedReorderPt: 12,
    currentOrderQty: 40,
    recommendedOrderQty: 35,
    currentSafetyStock: 8,
    recommendedSafetyStock: 6,
    unit: "kg",
    savings: 180,
    risk: "LOW",
    action: "implement"
  },
  {
    id: "7",
    item: "Truffle Oil",
    category: "Specialty",
    currentReorderPt: 5,
    recommendedReorderPt: 2,
    currentOrderQty: 10,
    recommendedOrderQty: 5,
    currentSafetyStock: 3,
    recommendedSafetyStock: 1,
    unit: "bottles",
    savings: 85,
    risk: "MEDIUM",
    action: "monitor"
  },
  {
    id: "8",
    item: "Saffron",
    category: "Spices",
    currentReorderPt: 10,
    recommendedReorderPt: 5,
    currentOrderQty: 25,
    recommendedOrderQty: 15,
    currentSafetyStock: 5,
    recommendedSafetyStock: 3,
    unit: "g",
    savings: 65,
    risk: "HIGH",
    action: "reject"
  }
]

function getActionBadge(action: string) {
  switch (action) {
    case "implement":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><Check className="h-3 w-3 mr-1" />Implement</Badge>
    case "pilot":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><FlaskConical className="h-3 w-3 mr-1" />Pilot</Badge>
    case "monitor":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Eye className="h-3 w-3 mr-1" />Monitor</Badge>
    case "reject":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><X className="h-3 w-3 mr-1" />Reject</Badge>
    default:
      return <Badge variant="outline">{action}</Badge>
  }
}

function getRiskBadgeVariant(risk: string) {
  switch (risk) {
    case "HIGH": return "destructive"
    case "MEDIUM": return "secondary"
    case "LOW": return "outline"
    default: return "outline"
  }
}

export default function OptimizationRecommendationsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [minSavings, setMinSavings] = useState(false)
  const [lowRiskOnly, setLowRiskOnly] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [expandedRows, setExpandedRows] = useState<string[]>([])

  // Summary calculations
  const summary = useMemo(() => {
    const implementItems = optimizationData.filter(i => i.action === "implement")
    const pilotItems = optimizationData.filter(i => i.action === "pilot")
    const monitorItems = optimizationData.filter(i => i.action === "monitor")
    const rejectItems = optimizationData.filter(i => i.action === "reject")

    return {
      totalSavings: optimizationData.reduce((sum, i) => sum + i.savings, 0),
      totalOpportunities: optimizationData.length,
      carryingCostSavings: optimizationData.filter(i => i.recommendedOrderQty < i.currentOrderQty).reduce((sum, i) => sum + i.savings * 0.6, 0),
      stockoutCostSavings: optimizationData.filter(i => i.recommendedSafetyStock > i.currentSafetyStock).reduce((sum, i) => sum + i.savings * 0.4, 0),
      implement: { count: implementItems.length, savings: implementItems.reduce((s, i) => s + i.savings, 0) },
      pilot: { count: pilotItems.length, savings: pilotItems.reduce((s, i) => s + i.savings, 0) },
      monitor: { count: monitorItems.length, savings: monitorItems.reduce((s, i) => s + i.savings, 0) },
      reject: { count: rejectItems.length, savings: rejectItems.reduce((s, i) => s + i.savings, 0) }
    }
  }, [])

  // Filter data
  const filteredData = useMemo(() => {
    return optimizationData.filter(item => {
      const matchesSearch = item.item.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesAction = actionFilter === "all" || item.action === actionFilter
      const matchesMinSavings = !minSavings || item.savings >= 100
      const matchesLowRisk = !lowRiskOnly || item.risk === "LOW"
      return matchesSearch && matchesAction && matchesMinSavings && matchesLowRisk
    })
  }, [searchQuery, actionFilter, minSavings, lowRiskOnly])

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Select all implement items
  const selectAllImplement = () => {
    const implementIds = filteredData.filter(i => i.action === "implement").map(i => i.id)
    setSelectedItems(implementIds)
  }

  // Apply selected recommendations
  const applySelected = () => {
    toast({
      title: "Recommendations Applied",
      description: `${selectedItems.length} recommendations have been applied successfully.`
    })
    setSelectedItems([])
  }

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
            <h1 className="text-2xl font-bold tracking-tight">Optimization Recommendations</h1>
            <p className="text-sm text-muted-foreground">
              Data-driven inventory optimization suggestions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summary.totalSavings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{summary.totalOpportunities} opportunities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Carrying Cost Savings</p>
                <p className="text-2xl font-bold">${Math.round(summary.carryingCostSavings).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">From reduced stock levels</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stockout Cost Savings</p>
                <p className="text-2xl font-bold">${Math.round(summary.stockoutCostSavings).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">From improved safety stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Priority */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Implementation Priority</CardTitle>
          <CardDescription>Breakdown by recommended action type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{getActionBadge("implement")}</TableCell>
                  <TableCell className="text-right font-medium">{summary.implement.count}</TableCell>
                  <TableCell className="text-right text-green-600">${summary.implement.savings.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline">Low</Badge></TableCell>
                  <TableCell className="text-muted-foreground">Implement immediately</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{getActionBadge("pilot")}</TableCell>
                  <TableCell className="text-right font-medium">{summary.pilot.count}</TableCell>
                  <TableCell className="text-right text-green-600">${summary.pilot.savings.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
                  <TableCell className="text-muted-foreground">Test with subset first</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{getActionBadge("monitor")}</TableCell>
                  <TableCell className="text-right font-medium">{summary.monitor.count}</TableCell>
                  <TableCell className="text-right text-green-600">${summary.monitor.savings.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="secondary">Medium</Badge></TableCell>
                  <TableCell className="text-muted-foreground">Monitor before implementing</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{getActionBadge("reject")}</TableCell>
                  <TableCell className="text-right font-medium">{summary.reject.count}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${summary.reject.savings.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="destructive">High</Badge></TableCell>
                  <TableCell className="text-muted-foreground">Risk outweighs benefits</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Recommendations</CardTitle>
              <CardDescription>Review and apply inventory optimization suggestions</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-[150px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="implement">Implement</SelectItem>
                  <SelectItem value="pilot">Pilot</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="minSavings"
                  checked={minSavings}
                  onCheckedChange={(checked) => setMinSavings(checked as boolean)}
                />
                <label htmlFor="minSavings" className="text-sm">Savings &gt;$100</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="lowRisk"
                  checked={lowRiskOnly}
                  onCheckedChange={(checked) => setLowRiskOnly(checked as boolean)}
                />
                <label htmlFor="lowRisk" className="text-sm">Low Risk</label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedItems.length === filteredData.filter(i => i.action === "implement").length && selectedItems.length > 0}
                      onCheckedChange={() => selectAllImplement()}
                    />
                  </TableHead>
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Recommended</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map(item => (
                  <Collapsible key={item.id} asChild open={expandedRows.includes(item.id)}>
                    <>
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => toggleItemSelection(item.id)}
                            disabled={item.action === "reject"}
                          />
                        </TableCell>
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-6 w-6"
                              onClick={() => toggleRow(item.id)}
                            >
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
                        <TableCell className="text-sm text-muted-foreground">
                          <div>ROP: {item.currentReorderPt}</div>
                          <div>Qty: {item.currentOrderQty}</div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>ROP: {item.recommendedReorderPt}</div>
                          <div>Qty: {item.recommendedOrderQty}</div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          ${item.savings}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRiskBadgeVariant(item.risk)}>{item.risk}</Badge>
                        </TableCell>
                        <TableCell>{getActionBadge(item.action)}</TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={8} className="py-3">
                            <div className="pl-12 grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Reorder Point:</span>{" "}
                                {item.currentReorderPt} → {item.recommendedReorderPt} {item.unit}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Order Quantity:</span>{" "}
                                {item.currentOrderQty} → {item.recommendedOrderQty} {item.unit}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Safety Stock:</span>{" "}
                                {item.currentSafetyStock} → {item.recommendedSafetyStock} {item.unit}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No recommendations match your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {optimizationData.length} recommendations
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="selectAllImplement"
                checked={selectedItems.length === filteredData.filter(i => i.action === "implement").length && selectedItems.length > 0}
                onCheckedChange={() => selectAllImplement()}
              />
              <label htmlFor="selectAllImplement" className="text-sm">
                Select All &quot;Implement&quot; ({filteredData.filter(i => i.action === "implement").length} items)
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={applySelected}
                disabled={selectedItems.length === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Selected ({selectedItems.length})
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Implementation
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
