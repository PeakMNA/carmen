"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  Check,
  Star,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Clock,
  Package,
  TrendingUp,
  Sparkles,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  PRItemPriceComparison,
  NormalizedVendorOption,
  MOQAlert
} from "@/lib/types"

// =============================================================================
// Component Types
// =============================================================================

interface EnhancedPriceComparisonProps {
  comparison: PRItemPriceComparison
  onVendorSelect: (vendorId: string, priceListId: string) => void
  selectedVendorId?: string
  showPrices?: boolean
  expandedByDefault?: boolean
  onQuantityAdjust?: (newQuantity: number) => void
}

type SortField = 'score' | 'price' | 'rating' | 'leadTime' | 'moq'
type SortDirection = 'asc' | 'desc'

// =============================================================================
// Helper Components
// =============================================================================

function PreferredBadge({ isItem, isVendor }: { isItem: boolean; isVendor: boolean }) {
  if (!isItem && !isVendor) return null

  return (
    <div className="flex gap-1">
      {isItem && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                <Star className="h-3 w-3 mr-1 fill-amber-500" />
                Item
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is a preferred item from this vendor</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {isVendor && !isItem && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                <Star className="h-3 w-3 mr-1 fill-blue-500" />
                Vendor
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is a preferred vendor</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

function MOQStatusBadge({ option, requestedQty }: { option: NormalizedVendorOption; requestedQty: number }) {
  if (option.meetsMinimumOrder) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Check className="h-3 w-3 mr-1" />
        Met
      </Badge>
    )
  }

  const percentMet = (requestedQty / option.moqInBaseUnit) * 100
  const severity = percentMet >= 50 ? 'warning' : 'error'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              severity === 'warning'
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
            )}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Gap: {option.moqGap.toFixed(1)} {option.baseUnit}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Need {option.moqGap.toFixed(2)} {option.baseUnit} more to meet minimum</p>
          <p className="text-xs text-muted-foreground">
            ({percentMet.toFixed(0)}% of MOQ met)
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function RatingDisplay({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3 w-3",
              i < fullStars
                ? "fill-amber-400 text-amber-400"
                : i === fullStars && hasHalf
                  ? "fill-amber-400/50 text-amber-400"
                  : "text-gray-300"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({rating.toFixed(1)})</span>
    </div>
  )
}

function RecommendedBadge() {
  return (
    <Badge className="bg-green-600 hover:bg-green-600 text-white">
      <Sparkles className="h-3 w-3 mr-1" />
      Recommended
    </Badge>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function EnhancedPriceComparison({
  comparison,
  onVendorSelect,
  selectedVendorId,
  showPrices = true,
  expandedByDefault = true,
  onQuantityAdjust
}: EnhancedPriceComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(expandedByDefault)
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showOnlyMeetingMOQ, setShowOnlyMeetingMOQ] = useState(false)
  const [showOnlyPreferred, setShowOnlyPreferred] = useState(false)

  // Sort and filter vendor options
  const displayOptions = useMemo(() => {
    let options = [...comparison.vendorOptions]

    // Apply filters
    if (showOnlyMeetingMOQ) {
      options = options.filter(o => o.meetsMinimumOrder)
    }
    if (showOnlyPreferred) {
      options = options.filter(o => o.isPreferredVendor || o.isPreferredItem)
    }

    // Apply sorting
    options.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'score':
          comparison = a.overallScore - b.overallScore
          break
        case 'price':
          comparison = a.pricePerBaseUnit.amount - b.pricePerBaseUnit.amount
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'leadTime':
          comparison = a.leadTimeDays - b.leadTimeDays
          break
        case 'moq':
          comparison = a.moqInBaseUnit - b.moqInBaseUnit
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return options
  }, [comparison.vendorOptions, sortField, sortDirection, showOnlyMeetingMOQ, showOnlyPreferred])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'price' || field === 'leadTime' || field === 'moq' ? 'asc' : 'desc')
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 -ml-2 font-medium"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className={cn(
        "ml-1 h-3 w-3",
        sortField === field ? "text-primary" : "text-muted-foreground"
      )} />
    </Button>
  )

  return (
    <Card className="border-muted">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base">Vendor Price Comparison</CardTitle>
              <Badge variant="outline" className="text-xs">
                {comparison.totalVendors} vendors
              </Badge>
              {comparison.hasMOQWarnings && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {comparison.moqAlerts.length} MOQ warning{comparison.moqAlerts.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          {comparison.recommendationReason && (
            <CardDescription className="flex items-center gap-2 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {comparison.recommendationReason.explanation}
            </CardDescription>
          )}
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="moq-filter"
                  checked={showOnlyMeetingMOQ}
                  onCheckedChange={(checked) => setShowOnlyMeetingMOQ(checked === true)}
                />
                <Label htmlFor="moq-filter" className="text-sm cursor-pointer">
                  Only show vendors meeting MOQ
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="preferred-filter"
                  checked={showOnlyPreferred}
                  onCheckedChange={(checked) => setShowOnlyPreferred(checked === true)}
                />
                <Label htmlFor="preferred-filter" className="text-sm cursor-pointer">
                  Only show preferred vendors
                </Label>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="leadTime">Lead Time</SelectItem>
                    <SelectItem value="moq">MOQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Comparison Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[200px]">Vendor</TableHead>
                    <TableHead>Preferred</TableHead>
                    <TableHead>Selling Unit</TableHead>
                    {showPrices && (
                      <>
                        <TableHead>Unit Price</TableHead>
                        <TableHead className="bg-primary/5 font-semibold">
                          <SortButton field="price">
                            Price/{comparison.baseUnit}
                          </SortButton>
                        </TableHead>
                      </>
                    )}
                    <TableHead>
                      <SortButton field="moq">MOQ</SortButton>
                    </TableHead>
                    <TableHead>MOQ Status</TableHead>
                    <TableHead>
                      <SortButton field="leadTime">Lead Time</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="rating">Rating</SortButton>
                    </TableHead>
                    {showPrices && <TableHead>Total Cost</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayOptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                        No vendors match the current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayOptions.map((option) => {
                      const isSelected = selectedVendorId === option.vendorId
                      const isRecommended = option.isRecommended

                      const totalCost = option.pricePerBaseUnit.amount * comparison.requestedQuantityInBaseUnit

                      return (
                        <TableRow
                          key={option.vendorId}
                          className={cn(
                            "transition-colors",
                            isSelected && "bg-primary/5",
                            isRecommended && !isSelected && "bg-green-50/50"
                          )}
                        >
                          <TableCell className="font-medium">
                            <div className="flex flex-col gap-1">
                              <span>{option.vendorName}</span>
                              <span className="text-xs text-muted-foreground">
                                {option.priceListName}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <PreferredBadge
                              isItem={option.isPreferredItem}
                              isVendor={option.isPreferredVendor}
                            />
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{option.sellingUnitName}</span>
                              <span className="text-xs text-muted-foreground">
                                ({option.conversionFactor} {comparison.baseUnit})
                              </span>
                            </div>
                          </TableCell>

                          {showPrices && (
                            <>
                              <TableCell>
                                <span className="font-mono">
                                  {option.unitPrice.currency} {option.unitPrice.amount.toFixed(2)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  /{option.sellingUnitName}
                                </span>
                              </TableCell>

                              <TableCell className="bg-primary/5">
                                <span className="font-semibold font-mono text-primary">
                                  {option.pricePerBaseUnit.currency} {option.pricePerBaseUnit.amount.toFixed(2)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  /{comparison.baseUnit}
                                </span>
                              </TableCell>
                            </>
                          )}

                          <TableCell>
                            <div className="flex flex-col">
                              <span>{option.minimumOrderQuantity} {option.sellingUnitName}</span>
                              <span className="text-xs text-muted-foreground">
                                ({option.moqInBaseUnit.toFixed(1)} {comparison.baseUnit})
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <MOQStatusBadge
                              option={option}
                              requestedQty={comparison.requestedQuantityInBaseUnit}
                            />
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{option.leadTimeDays} days</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <RatingDisplay rating={option.rating} />
                          </TableCell>

                          {showPrices && (
                            <TableCell>
                              <span className="font-semibold font-mono">
                                {option.pricePerBaseUnit.currency} {totalCost.toFixed(2)}
                              </span>
                            </TableCell>
                          )}

                          <TableCell>
                            {isRecommended && <RecommendedBadge />}
                            {isSelected && !isRecommended && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                Selected
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            <Button
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => onVendorSelect(option.vendorId, option.priceListId)}
                              disabled={isSelected}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Selected
                                </>
                              ) : (
                                "Select"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary Footer */}
            {showPrices && comparison.potentialSavings && comparison.potentialSavings.amount > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">
                    Potential savings of {comparison.potentialSavings.currency} {comparison.potentialSavings.amount.toFixed(2)} by choosing the recommended vendor
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default EnhancedPriceComparison
