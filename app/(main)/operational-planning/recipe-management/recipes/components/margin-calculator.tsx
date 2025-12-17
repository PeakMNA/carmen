"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Calculator,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Target,
  DollarSign,
  Percent,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Recipe } from "@/lib/types"
import { CategoryCostDefaults, SYSTEM_COST_DEFAULTS } from "@/lib/mock-data/categories"

interface MarginCalculatorProps {
  recipe: Recipe
  categoryDefaults: CategoryCostDefaults | null
  categoryName?: string
}

type MarginHealth = "warning" | "good" | "excellent"

interface MarginAnalysis {
  grossMargin: number
  grossProfit: number
  foodCostPercentage: number
  health: MarginHealth
  priceForTargetMargin: number
  priceForMinimumMargin: number
  currentMarkup: number
}


export function MarginCalculator({
  recipe,
  categoryDefaults,
  categoryName,
}: MarginCalculatorProps) {
  // Get effective defaults (category or system)
  const effectiveDefaults = categoryDefaults ?? SYSTEM_COST_DEFAULTS

  // State for custom values
  const [useCustomValues, setUseCustomValues] = useState(false)
  const [customLaborPercent, setCustomLaborPercent] = useState(
    effectiveDefaults.laborCostPercentage
  )
  const [customOverheadPercent, setCustomOverheadPercent] = useState(
    effectiveDefaults.overheadPercentage
  )
  const [sellingPrice, setSellingPrice] = useState(
    recipe.costPerPortion.amount * 3 // Default 3x markup
  )

  // Get active percentages
  const activeLaborPercent = useCustomValues
    ? customLaborPercent
    : effectiveDefaults.laborCostPercentage
  const activeOverheadPercent = useCustomValues
    ? customOverheadPercent
    : effectiveDefaults.overheadPercentage

  // Calculate costs
  const calculations = useMemo(() => {
    const ingredientCost = recipe.totalCost.amount
    const yield_ = recipe.yield || 1

    const laborCost = ingredientCost * (activeLaborPercent / 100)
    const overheadCost = ingredientCost * (activeOverheadPercent / 100)
    const totalCost = ingredientCost + laborCost + overheadCost
    const costPerPortion = totalCost / yield_

    return {
      ingredientCost,
      laborCost,
      overheadCost,
      totalCost,
      costPerPortion,
      yield: yield_,
    }
  }, [recipe, activeLaborPercent, activeOverheadPercent])

  // Calculate margin analysis
  const marginAnalysis = useMemo((): MarginAnalysis => {
    const { costPerPortion } = calculations
    const grossProfit = sellingPrice - costPerPortion
    const grossMargin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0
    const foodCostPercentage = sellingPrice > 0 ? (costPerPortion / sellingPrice) * 100 : 0
    const currentMarkup = costPerPortion > 0 ? sellingPrice / costPerPortion : 0

    // Calculate recommended prices
    const targetMargin = effectiveDefaults.targetMargin / 100
    const minimumMargin = effectiveDefaults.minimumMargin / 100
    const priceForTargetMargin = costPerPortion / (1 - targetMargin)
    const priceForMinimumMargin = costPerPortion / (1 - minimumMargin)

    // Determine health status
    let health: MarginHealth
    if (grossMargin < effectiveDefaults.targetMargin) {
      health = "warning"
    } else if (grossMargin >= effectiveDefaults.targetMargin + 5) {
      health = "excellent"
    } else {
      health = "good"
    }

    return {
      grossMargin,
      grossProfit,
      foodCostPercentage,
      health,
      priceForTargetMargin,
      priceForMinimumMargin,
      currentMarkup,
    }
  }, [calculations, sellingPrice, effectiveDefaults])

  // Reset to defaults
  const handleReset = () => {
    setCustomLaborPercent(effectiveDefaults.laborCostPercentage)
    setCustomOverheadPercent(effectiveDefaults.overheadPercentage)
    setUseCustomValues(false)
    setSellingPrice(calculations.costPerPortion * 3)
  }

  // Get health color
  const getHealthColor = (health: MarginHealth) => {
    switch (health) {
      case "warning":
        return "text-amber-600 dark:text-amber-400"
      case "good":
        return "text-green-600 dark:text-green-400"
      case "excellent":
        return "text-emerald-600 dark:text-emerald-400"
    }
  }

  const getHealthBg = (health: MarginHealth) => {
    switch (health) {
      case "warning":
        return "bg-amber-100 dark:bg-amber-900/30"
      case "good":
        return "bg-green-100 dark:bg-green-900/30"
      case "excellent":
        return "bg-emerald-100 dark:bg-emerald-900/30"
    }
  }

  const getHealthLabel = (health: MarginHealth) => {
    switch (health) {
      case "warning":
        return "Below Target"
      case "good":
        return "Good"
      case "excellent":
        return "Excellent"
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: recipe.totalCost.currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Calculate progress value for margin bar
  const getMarginProgressValue = () => {
    // Normalize margin to 0-100 scale where target is at 70%
    const normalized =
      (marginAnalysis.grossMargin / effectiveDefaults.targetMargin) * 70
    return Math.min(Math.max(normalized, 0), 100)
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Margin Calculator</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {categoryName && (
              <Badge variant="outline" className="font-normal">
                {categoryName}
              </Badge>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleReset}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset to defaults</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <CardDescription>
          Calculate profit margins using category defaults or custom values
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Cost Settings and Margin Analysis Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Cost Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Cost Settings</h4>
              <div className="flex items-center gap-2">
                <Label htmlFor="custom-values" className="text-xs text-muted-foreground">
                  Use custom values
                </Label>
                <Switch
                  id="custom-values"
                  checked={useCustomValues}
                  onCheckedChange={setUseCustomValues}
                />
              </div>
            </div>

            {/* Category Defaults Display */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Category Defaults</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Labor:</span>{" "}
                  <span className="font-medium">
                    {effectiveDefaults.laborCostPercentage}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">OH:</span>{" "}
                  <span className="font-medium">
                    {effectiveDefaults.overheadPercentage}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">FC:</span>{" "}
                  <span className="font-medium">
                    {effectiveDefaults.targetFoodCostPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="labor-percent" className="text-xs">
                  Labor %
                </Label>
                <div className="relative">
                  <Input
                    id="labor-percent"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={useCustomValues ? customLaborPercent : effectiveDefaults.laborCostPercentage}
                    onChange={(e) => setCustomLaborPercent(Number(e.target.value))}
                    disabled={!useCustomValues}
                    className="pr-8"
                  />
                  <Percent className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="overhead-percent" className="text-xs">
                  Overhead %
                </Label>
                <div className="relative">
                  <Input
                    id="overhead-percent"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={useCustomValues ? customOverheadPercent : effectiveDefaults.overheadPercentage}
                    onChange={(e) => setCustomOverheadPercent(Number(e.target.value))}
                    disabled={!useCustomValues}
                    className="pr-8"
                  />
                  <Percent className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Cost Breakdown</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ingredient Cost:</span>
                  <span>{formatCurrency(calculations.ingredientCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    + Labor ({activeLaborPercent}%):
                  </span>
                  <span>{formatCurrency(calculations.laborCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    + Overhead ({activeOverheadPercent}%):
                  </span>
                  <span>{formatCurrency(calculations.overheadCost)}</span>
                </div>
                <Separator className="my-1.5" />
                <div className="flex justify-between font-medium">
                  <span>Total Cost:</span>
                  <span>{formatCurrency(calculations.totalCost)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Cost per Portion (÷{calculations.yield}):</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(calculations.costPerPortion)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Margin Analysis */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Margin Analysis</h4>

            {/* Selling Price Input */}
            <div className="space-y-1.5">
              <Label htmlFor="selling-price" className="text-xs">
                Selling Price
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="selling-price"
                  type="number"
                  min={0}
                  step={0.5}
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Margin Health Indicator */}
            <div
              className={cn(
                "rounded-lg p-4 space-y-3",
                getHealthBg(marginAnalysis.health)
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current Margin:</span>
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      getHealthColor(marginAnalysis.health)
                    )}
                  >
                    {marginAnalysis.grossMargin.toFixed(1)}%
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "font-medium",
                    getHealthColor(marginAnalysis.health)
                  )}
                >
                  {marginAnalysis.health === "excellent" && (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  )}
                  {getHealthLabel(marginAnalysis.health)}
                </Badge>
              </div>

              {/* Progress Bar with Markers */}
              <div className="space-y-1">
                <Progress
                  value={getMarginProgressValue()}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Min: {effectiveDefaults.minimumMargin}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Target: {effectiveDefaults.targetMargin}%
                  </span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <div className="text-xs text-muted-foreground">Gross Profit</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(marginAnalysis.grossProfit)}
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-xs text-muted-foreground">Food Cost %</div>
                <div className="text-lg font-semibold">
                  {marginAnalysis.foodCostPercentage.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Markup */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Current Markup</span>
              <span className="text-lg font-semibold">
                {marginAnalysis.currentMarkup.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>

        {/* Price Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Price Recommendations</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                Target ({effectiveDefaults.targetMargin}%)
              </div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(marginAnalysis.priceForTargetMargin)}
              </div>
              <div className="text-xs text-muted-foreground">
                Profit: {formatCurrency(marginAnalysis.priceForTargetMargin - calculations.costPerPortion)}
              </div>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3" />
                Minimum ({effectiveDefaults.minimumMargin}%)
              </div>
              <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                {formatCurrency(marginAnalysis.priceForMinimumMargin)}
              </div>
              <div className="text-xs text-muted-foreground">
                Profit: {formatCurrency(marginAnalysis.priceForMinimumMargin - calculations.costPerPortion)}
              </div>
            </div>
            <div className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Current Markup
              </div>
              <div className="text-lg font-semibold">
                {marginAnalysis.currentMarkup.toFixed(2)}x
              </div>
              <div className="text-xs text-muted-foreground">
                Based on selling price
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
