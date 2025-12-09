"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Calendar as CalendarIcon, ChevronDown, ChevronUp, Filter, Search, X } from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { cn } from "@/lib/utils"
import {
  TransactionFilterParams,
  TransactionType,
  ReferenceType,
  transactionTypeConfig,
  referenceTypeConfig
} from "../types"

interface TransactionFiltersProps {
  filters: TransactionFilterParams
  onFiltersChange: (filters: TransactionFilterParams) => void
  availableLocations: Array<{ id: string; name: string }>
  availableCategories: Array<{ id: string; name: string }>
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  availableLocations,
  availableCategories
}: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value })
  }

  const handleDateRangeChange = (from: Date | undefined, to: Date | undefined) => {
    onFiltersChange({ ...filters, dateRange: { from, to } })
  }

  const handleTransactionTypeToggle = (type: TransactionType) => {
    const newTypes = filters.transactionTypes.includes(type)
      ? filters.transactionTypes.filter(t => t !== type)
      : [...filters.transactionTypes, type]
    onFiltersChange({ ...filters, transactionTypes: newTypes })
  }

  const handleReferenceTypeChange = (type: string) => {
    if (type === 'all') {
      onFiltersChange({ ...filters, referenceTypes: [] })
    } else {
      const refType = type as ReferenceType
      const newTypes = filters.referenceTypes.includes(refType)
        ? filters.referenceTypes.filter(t => t !== refType)
        : [...filters.referenceTypes, refType]
      onFiltersChange({ ...filters, referenceTypes: newTypes })
    }
  }

  const handleLocationChange = (locationId: string) => {
    if (locationId === 'all') {
      onFiltersChange({ ...filters, locations: [] })
    } else {
      onFiltersChange({ ...filters, locations: [locationId] })
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === 'all') {
      onFiltersChange({ ...filters, categories: [] })
    } else {
      onFiltersChange({ ...filters, categories: [categoryId] })
    }
  }

  const handleQuickDateFilter = (preset: 'today' | '7days' | '30days' | 'thisMonth' | 'lastMonth') => {
    const now = new Date()
    let from: Date
    let to: Date = now

    switch (preset) {
      case 'today':
        from = new Date(now.setHours(0, 0, 0, 0))
        to = new Date()
        break
      case '7days':
        from = subDays(now, 7)
        break
      case '30days':
        from = subDays(now, 30)
        break
      case 'thisMonth':
        from = startOfMonth(now)
        to = endOfMonth(now)
        break
      case 'lastMonth':
        const lastMonth = subMonths(now, 1)
        from = startOfMonth(lastMonth)
        to = endOfMonth(lastMonth)
        break
    }

    onFiltersChange({ ...filters, dateRange: { from, to } })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: { from: undefined, to: undefined },
      transactionTypes: [],
      referenceTypes: [],
      locations: [],
      categories: [],
      searchTerm: ''
    })
  }

  const hasActiveFilters =
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.transactionTypes.length > 0 ||
    filters.referenceTypes.length > 0 ||
    filters.locations.length > 0 ||
    filters.categories.length > 0 ||
    filters.searchTerm

  const activeFilterCount = [
    filters.dateRange.from || filters.dateRange.to ? 1 : 0,
    filters.transactionTypes.length,
    filters.referenceTypes.length,
    filters.locations.length,
    filters.categories.length,
    filters.searchTerm ? 1 : 0
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      {/* Quick filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, references, locations..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateFilter('today')}
            className={cn(
              filters.dateRange.from?.toDateString() === new Date().toDateString() && "bg-accent"
            )}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateFilter('7days')}
          >
            7 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateFilter('30days')}
          >
            30 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickDateFilter('thisMonth')}
          >
            This Month
          </Button>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Expandable filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to
                    }}
                    onSelect={(range) => handleDateRangeChange(range?.from, range?.to)}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Type</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(transactionTypeConfig) as TransactionType[]).map((type) => (
                  <Button
                    key={type}
                    variant={filters.transactionTypes.includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTransactionTypeToggle(type)}
                    className={cn(
                      filters.transactionTypes.includes(type) && transactionTypeConfig[type].bgColor
                    )}
                  >
                    {transactionTypeConfig[type].label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select
                value={filters.locations[0] || 'all'}
                onValueChange={handleLocationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {availableLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.categories[0] || 'all'}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reference Type Pills */}
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Reference Type</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(referenceTypeConfig) as ReferenceType[]).map((type) => (
                <Badge
                  key={type}
                  variant={filters.referenceTypes.includes(type) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:opacity-80",
                    filters.referenceTypes.includes(type) && referenceTypeConfig[type].color
                  )}
                  onClick={() => handleReferenceTypeChange(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>

          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="gap-1">
              {filters.dateRange.from && format(filters.dateRange.from, "MMM d")}
              {filters.dateRange.from && filters.dateRange.to && " - "}
              {filters.dateRange.to && format(filters.dateRange.to, "MMM d, yyyy")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleDateRangeChange(undefined, undefined)}
              />
            </Badge>
          )}

          {filters.transactionTypes.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {transactionTypeConfig[type].label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleTransactionTypeToggle(type)}
              />
            </Badge>
          ))}

          {filters.locations.map((locId) => {
            const location = availableLocations.find(l => l.id === locId)
            return (
              <Badge key={locId} variant="secondary" className="gap-1">
                {location?.name || locId}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleLocationChange('all')}
                />
              </Badge>
            )
          })}

          {filters.categories.map((catId) => {
            const category = availableCategories.find(c => c.id === catId)
            return (
              <Badge key={catId} variant="secondary" className="gap-1">
                {category?.name || catId}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleCategoryChange('all')}
                />
              </Badge>
            )
          })}

          {filters.referenceTypes.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleReferenceTypeChange(type)}
              />
            </Badge>
          ))}

          {filters.searchTerm && (
            <Badge variant="secondary" className="gap-1">
              &quot;{filters.searchTerm}&quot;
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleSearchChange('')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
