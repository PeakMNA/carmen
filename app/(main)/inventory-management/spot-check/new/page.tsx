"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  MapPin,
  Shuffle,
  DollarSign,
  Hand,
  Clock,
  Package,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

// Selection method types
type SelectionMethod = "random" | "high-value" | "manual"

// Item count options
const ITEM_COUNT_OPTIONS = [10, 20, 50] as const

// Selection method configuration
const methodConfig: Record<SelectionMethod, {
  label: string
  description: string
  icon: React.ReactNode
  recommended?: boolean
}> = {
  "random": {
    label: "Random Selection",
    description: "System randomly selects items to count",
    icon: <Shuffle className="h-5 w-5" />,
    recommended: true
  },
  "high-value": {
    label: "High Value Items",
    description: "Focus on items with highest inventory value",
    icon: <DollarSign className="h-5 w-5" />
  },
  "manual": {
    label: "Manual Selection",
    description: "Choose specific items to count",
    icon: <Hand className="h-5 w-5" />
  }
}

// Estimate time based on item count
function getEstimatedTime(itemCount: number): string {
  const minutesPerItem = 2
  const totalMinutes = itemCount * minutesPerItem
  if (totalMinutes < 60) {
    return `${totalMinutes} min`
  }
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
}

// Method selection option component
function MethodOption({
  method,
  config,
  isSelected,
  onSelect
}: {
  method: SelectionMethod
  config: typeof methodConfig[SelectionMethod]
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-muted hover:border-muted-foreground/30 hover:bg-muted/30"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "p-2.5 rounded-lg shrink-0",
        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-base">{config.label}</h3>
          {config.recommended && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              Recommended
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>

      {/* Selection indicator */}
      <div className={cn(
        "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
        isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
      )}>
        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
      </div>
    </div>
  )
}

// Item count selector component
function ItemCountSelector({
  selectedCount,
  onSelect
}: {
  selectedCount: number
  onSelect: (count: number) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium text-sm">Number of Items to Check</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {ITEM_COUNT_OPTIONS.map((count) => (
          <Button
            key={count}
            variant={selectedCount === count ? "default" : "outline"}
            className={cn(
              "h-14 text-base font-medium",
              selectedCount === count && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => onSelect(count)}
          >
            {count} Items
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Recommended: 20 items for comprehensive spot checks
      </p>
    </div>
  )
}

// Preview section component
function SpotCheckPreview({
  locationName,
  method,
  itemCount,
  estimatedTime
}: {
  locationName: string
  method: SelectionMethod
  itemCount: number
  estimatedTime: string
}) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-sm">Spot Check Preview</h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium">{locationName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Method</span>
            <span className="font-medium">{methodConfig[method].label}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Items to Check</span>
            <span className="font-medium">{itemCount} items</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated Time</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{estimatedTime}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NewSpotCheckPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get location from URL params
  const locationName = searchParams.get("location") || "Unknown Location"
  const locationId = searchParams.get("locationId") || ""

  // Form state
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>("random")
  const [itemCount, setItemCount] = useState(20)

  // Calculate estimated time
  const estimatedTime = useMemo(() => getEstimatedTime(itemCount), [itemCount])

  // Handle start spot check
  const handleStartSpotCheck = () => {
    // Create a new spot check and navigate to the count page
    // In a real app, this would call an API to create the spot check
    const newSpotCheckId = `sc-${Date.now()}`
    router.push(`/inventory-management/spot-check/${newSpotCheckId}/count?location=${encodeURIComponent(locationName)}&method=${selectionMethod}&items=${itemCount}`)
  }

  // Handle back navigation
  const handleBack = () => {
    router.back()
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        {/* Step indicator */}
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-muted-foreground">Step 1: Location</span>
          <Progress value={100} className="w-1/2 h-1" />
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium">Step 2: Method & Items</span>
          </div>
        </div>
      </div>

      {/* Selected Location Bar */}
      <div className="px-4 pt-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Selected Location</p>
                <p className="font-semibold truncate">{locationName}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-xs text-muted-foreground"
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Selection Method */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shuffle className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium text-sm">Item Selection Method</h2>
          </div>

          <div className="space-y-3">
            {(Object.entries(methodConfig) as [SelectionMethod, typeof methodConfig[SelectionMethod]][]).map(
              ([method, config]) => (
                <MethodOption
                  key={method}
                  method={method}
                  config={config}
                  isSelected={selectionMethod === method}
                  onSelect={() => setSelectionMethod(method)}
                />
              )
            )}
          </div>
        </div>

        {/* Item Count Selection */}
        <ItemCountSelector
          selectedCount={itemCount}
          onSelect={setItemCount}
        />

        {/* Preview */}
        <SpotCheckPreview
          locationName={locationName}
          method={selectionMethod}
          itemCount={itemCount}
          estimatedTime={estimatedTime}
        />
      </div>

      {/* Footer - Start Button */}
      <div className="sticky bottom-0 p-4 bg-background border-t">
        <Button
          size="lg"
          className="w-full gap-2 text-base"
          onClick={handleStartSpotCheck}
        >
          Start Spot Check Session
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export default function NewSpotCheckPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <NewSpotCheckPageContent />
    </Suspense>
  )
}
