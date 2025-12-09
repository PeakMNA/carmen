"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  Save,
  Play,
  Search,
  X,
  AlertTriangle,
  Download,
  FileText,
  ShoppingCart,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for items
const allItems = [
  { id: "1", name: "Chicken Breast", category: "Food > Protein", currentStock: "150 kg", selected: false },
  { id: "2", name: "Olive Oil", category: "Food > Oils", currentStock: "25 L", selected: false },
  { id: "3", name: "Fresh Salmon", category: "Food > Seafood", currentStock: "80 kg", selected: false },
  { id: "4", name: "Rice", category: "Food > Grains", currentStock: "200 kg", selected: false },
  { id: "5", name: "All Purpose Flour", category: "Food > Baking", currentStock: "180 kg", selected: false },
  { id: "6", name: "Mixed Vegetables", category: "Food > Produce", currentStock: "120 kg", selected: false },
  { id: "7", name: "Butter", category: "Food > Dairy", currentStock: "45 kg", selected: false },
  { id: "8", name: "Fresh Herbs", category: "Food > Produce", currentStock: "15 kg", selected: false },
  { id: "9", name: "Tomato Sauce", category: "Food > Condiments", currentStock: "60 L", selected: false },
  { id: "10", name: "Parmesan Cheese", category: "Food > Dairy", currentStock: "25 kg", selected: false }
]

// Mock forecast results
const mockForecastResults = [
  {
    id: "1",
    name: "Chicken Breast",
    currentStock: "150 kg",
    projectedDemand: "180 kg",
    purchaseQty: "50 kg",
    risk: "LOW",
    accuracy: 92,
    safetyStock: "20 kg",
    reorderPoint: "30 kg",
    alert: null
  },
  {
    id: "2",
    name: "Olive Oil",
    currentStock: "25 L",
    projectedDemand: "45 L",
    purchaseQty: "30 L",
    risk: "HIGH",
    accuracy: 78,
    safetyStock: "8 L",
    reorderPoint: "15 L",
    alert: "Stock will run out in 3 days! Immediate purchase needed"
  },
  {
    id: "3",
    name: "Fresh Salmon",
    currentStock: "80 kg",
    projectedDemand: "95 kg",
    purchaseQty: "25 kg",
    risk: "MEDIUM",
    accuracy: 85,
    safetyStock: "15 kg",
    reorderPoint: "20 kg",
    alert: null
  }
]

function getRiskBadgeVariant(risk: string) {
  switch (risk) {
    case "HIGH": return "destructive"
    case "MEDIUM": return "secondary"
    case "LOW": return "outline"
    default: return "outline"
  }
}

export default function ForecastGenerationPage() {
  const { toast } = useToast()
  const [location, setLocation] = useState("all")
  const [category, setCategory] = useState("all")
  const [itemSelection, setItemSelection] = useState("all")
  const [forecastPeriod, setForecastPeriod] = useState("14")
  const [customPeriod, setCustomPeriod] = useState("")
  const [forecastMethod, setForecastMethod] = useState("exponential_smoothing")
  const [serviceLevel, setServiceLevel] = useState("95")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedRows, setExpandedRows] = useState<string[]>([])

  // Filter items for custom selection
  const filteredItems = useMemo(() => {
    return allItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Toggle item selection
  const toggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Select all filtered items
  const selectAll = () => {
    setSelectedItems(filteredItems.map(item => item.id))
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedItems([])
  }

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  // Generate forecast
  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    setShowResults(true)
    toast({
      title: "Forecast Generated",
      description: `${itemSelection === "custom" ? selectedItems.length : "All"} items forecast for ${forecastPeriod === "custom" ? customPeriod : forecastPeriod} days`
    })
  }

  // Get service level multiplier
  const getServiceLevelMultiplier = (level: string) => {
    switch (level) {
      case "90": return "1.28"
      case "95": return "1.65"
      case "99": return "2.33"
      default: return "1.65"
    }
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
            <h1 className="text-2xl font-bold tracking-tight">
              Generate Inventory Forecast
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure and generate demand forecasts
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Config
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            <Play className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Run Forecast"}
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Scope Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scope Selection</CardTitle>
            <CardDescription>Define what items to forecast</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="main">Main Kitchen</SelectItem>
                  <SelectItem value="branch1">Branch 1</SelectItem>
                  <SelectItem value="branch2">Branch 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Items</Label>
              <RadioGroup value={itemSelection} onValueChange={setItemSelection}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal">All items (156)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low-stock" id="low-stock" />
                  <Label htmlFor="low-stock" className="font-normal">Low stock items (23)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high-turnover" id="high-turnover" />
                  <Label htmlFor="high-turnover" className="font-normal">High turnover items (45)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="font-normal">Custom selection</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parameters</CardTitle>
            <CardDescription>Configure forecast parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Forecast Period</Label>
              <div className="flex gap-2">
                {["7", "14", "30"].map(period => (
                  <Button
                    key={period}
                    variant={forecastPeriod === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForecastPeriod(period)}
                  >
                    {period} days
                  </Button>
                ))}
                <Button
                  variant={forecastPeriod === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setForecastPeriod("custom")}
                >
                  Custom
                </Button>
              </div>
              {forecastPeriod === "custom" && (
                <Input
                  type="number"
                  placeholder="Enter days (1-365)"
                  value={customPeriod}
                  onChange={(e) => setCustomPeriod(e.target.value)}
                  min={1}
                  max={365}
                  className="w-[150px] mt-2"
                />
              )}
            </div>

            <div className="space-y-3">
              <Label>Forecast Method</Label>
              <RadioGroup value={forecastMethod} onValueChange={setForecastMethod}>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="moving_average" id="moving_average" className="mt-1" />
                  <div>
                    <Label htmlFor="moving_average" className="font-normal">Moving Average (30-day)</Label>
                    <p className="text-xs text-muted-foreground">Best for stable demand patterns</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="exponential_smoothing" id="exponential_smoothing" className="mt-1" />
                  <div>
                    <Label htmlFor="exponential_smoothing" className="font-normal">Exponential Smoothing (α=0.3)</Label>
                    <p className="text-xs text-muted-foreground">Best for trending demand</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="linear_regression" id="linear_regression" className="mt-1" />
                  <div>
                    <Label htmlFor="linear_regression" className="font-normal">Linear Regression</Label>
                    <p className="text-xs text-muted-foreground">Best for clear upward/downward trends</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="seasonal" id="seasonal" className="mt-1" />
                  <div>
                    <Label htmlFor="seasonal" className="font-normal">Seasonal Decomposition</Label>
                    <p className="text-xs text-muted-foreground">Requires 60+ days history</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Service Level</Label>
              <Select value={serviceLevel} onValueChange={setServiceLevel}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                  <SelectItem value="99">99%</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Safety stock multiplier: {getServiceLevelMultiplier(serviceLevel)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Item Selection */}
      {itemSelection === "custom" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Select Items</CardTitle>
                <CardDescription>Choose specific items to forecast</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground text-sm ml-2">({item.category})</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Current: {item.currentStock}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                {selectedItems.length} items selected
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast Results */}
      {showResults && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Forecast Results</CardTitle>
                <CardDescription>
                  {mockForecastResults.length} items forecast for {forecastPeriod === "custom" ? customPeriod : forecastPeriod} days using{" "}
                  {forecastMethod.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </CardDescription>
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
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Projected Demand</TableHead>
                    <TableHead>Purchase Qty</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Accuracy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockForecastResults.map(result => (
                    <Collapsible key={result.id} asChild open={expandedRows.includes(result.id)}>
                      <>
                        <TableRow className="cursor-pointer" onClick={() => toggleRow(result.id)}>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                {expandedRows.includes(result.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell className="font-medium">{result.name}</TableCell>
                          <TableCell>{result.currentStock}</TableCell>
                          <TableCell>{result.projectedDemand}</TableCell>
                          <TableCell>{result.purchaseQty}</TableCell>
                          <TableCell>
                            <Badge variant={getRiskBadgeVariant(result.risk)}>
                              {result.risk}
                            </Badge>
                          </TableCell>
                          <TableCell>{result.accuracy}%</TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={7} className="py-3">
                              <div className="pl-8 space-y-1">
                                <p className="text-sm">
                                  Safety stock: {result.safetyStock}, Reorder point: {result.reorderPoint}
                                </p>
                                {result.alert && (
                                  <div className="flex items-center gap-2 text-yellow-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm">{result.alert}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Purchase Requests
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Save Forecast
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
