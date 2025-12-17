"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Edit,
  FileDown,
  FileUp,
  Filter,
  MoreVertical,
  Plus,
  Printer,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  LayoutList,  
  FileText,
} from "lucide-react"
import { Recipe } from '@/lib/types'
import { mockRecipes } from '@/lib/mock-data'
import { RecipeCardCompact } from "./recipe-card-compact"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Card } from "@/components/ui/card"

interface FilterCondition {
  id: string
  field: string
  operator: string
  value: string
}

const FILTER_FIELDS = [
  { label: "Name", value: "name" },
  { label: "Category", value: "categoryId" },
  { label: "Cuisine", value: "cuisineTypeId" },
  { label: "Status", value: "status" },
  { label: "Cost Range", value: "costRange" },
  { label: "Margin", value: "margin" },
  { label: "Preparation Time", value: "preparationTime" },
  { label: "Complexity", value: "complexity" },
]

const FILTER_OPERATORS = [
  { label: "Contains", value: "contains" },
  { label: "Equals", value: "equals" },
  { label: "Not equals", value: "notEquals" },
  { label: "Greater than", value: "greaterThan" },
  { label: "Less than", value: "lessThan" },
  { label: "Is empty", value: "isEmpty" },
  { label: "Is not empty", value: "isNotEmpty" },
]

export default function RecipeList() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([])
  const [quickFilters, setQuickFilters] = useState<string[]>([])
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)

  const handleQuickFilter = (filter: string) => {
    setQuickFilters(prev => {
      const newFilters = prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
      return newFilters
    })
  }

  const addFilterCondition = () => {
    const newCondition: FilterCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: FILTER_FIELDS[0].value,
      operator: FILTER_OPERATORS[0].value,
      value: "",
    }
    setFilterConditions([...filterConditions, newCondition])
  }

  const removeFilterCondition = (id: string) => {
    setFilterConditions(filterConditions.filter((condition) => condition.id !== id))
  }

  const updateFilterCondition = (
    id: string,
    field: keyof FilterCondition,
    value: string
  ) => {
    setFilterConditions(
      filterConditions.map((condition) =>
        condition.id === id ? { ...condition, [field]: value } : condition
      )
    )
  }

  const clearFilters = () => {
    setFilterConditions([])
    setQuickFilters([])
  }

  const getActiveFilterCount = () => {
    return filterConditions.length + quickFilters.length
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecipes(filteredRecipes.map(recipe => recipe.id))
    } else {
      setSelectedRecipes([])
    }
  }

  const handleSelect = (recipeId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipes([...selectedRecipes, recipeId])
    } else {
      setSelectedRecipes(selectedRecipes.filter(id => id !== recipeId))
    }
  }

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'export' | 'delete') => {
    console.log(`Bulk ${action} for:`, selectedRecipes)
    // Implement bulk action logic here
  }

  const filteredRecipes = mockRecipes.filter(recipe => {
    // Search filter
    if (searchTerm && !recipe.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Quick filters
    const hasMedia = !!recipe.image || (recipe.additionalImages && recipe.additionalImages.length > 0) || !!recipe.videoUrl
    if (quickFilters.includes('noMedia') && hasMedia) return false
    if (quickFilters.includes('hasMedia') && !hasMedia) return false
    if (quickFilters.includes('active') && recipe.status !== 'published') return false
    if (quickFilters.includes('draft') && recipe.status !== 'draft') return false

    // Advanced filters
    for (const condition of filterConditions) {
      const value = recipe[condition.field as keyof Recipe]
      if (value === undefined) continue

      switch (condition.operator) {
        case 'contains':
          if (!String(value).toLowerCase().includes(condition.value.toLowerCase())) return false
          break
        case 'equals':
          if (String(value) !== condition.value) return false
          break
        case 'notEquals':
          if (String(value) === condition.value) return false
          break
        case 'greaterThan':
          if (typeof value === 'number' && value <= Number(condition.value)) return false
          break
        case 'lessThan':
          if (typeof value === 'number' && value >= Number(condition.value)) return false
          break
        case 'isEmpty':
          if (value !== '') return false
          break
        case 'isNotEmpty':
          if (value === '') return false
          break
      }
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Primary Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Recipe Library</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/operational-planning/recipe-management/recipes/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Recipe
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex gap-2">
            <Button
              variant={quickFilters.includes('noMedia') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('noMedia')}
            >
              No Media
            </Button>
            <Button
              variant={quickFilters.includes('hasMedia') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('hasMedia')}
            >
              Has Media
            </Button>
            <Button
              variant={quickFilters.includes('active') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={quickFilters.includes('draft') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickFilter('draft')}
            >
              Draft
            </Button>
          </div>

          <Popover open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Advanced Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-4" align="end">
              <div className="space-y-4">
                <div className="font-medium flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Advanced Filters
                  </div>
                  {filterConditions.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {filterConditions.length}
                    </Badge>
                  )}
                </div>
                {filterConditions.map((condition) => (
                  <div key={condition.id} className="flex items-center gap-2">
                    <Select
                      value={condition.field}
                      onValueChange={(value) =>
                        updateFilterCondition(condition.id, "field", value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) =>
                        updateFilterCondition(condition.id, "operator", value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_OPERATORS.map((operator) => (
                          <SelectItem key={operator.value} value={operator.value}>
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!["isEmpty", "isNotEmpty"].includes(condition.operator) && (
                      <Input
                        value={condition.value}
                        onChange={(e) =>
                          updateFilterCondition(
                            condition.id,
                            "value",
                            e.target.value
                          )
                        }
                        className="flex-1"
                        placeholder="Value"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFilterCondition(condition.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addFilterCondition}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Filter Condition
                </Button>
                <div className="flex justify-between pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={() => setIsAdvancedFilterOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <LayoutList className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Menu */}
      {selectedRecipes.length > 0 && (
        <div className="h-[48px] border-b bg-muted/50 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('activate')}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('deactivate')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Deactivate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('export')}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedRecipes.length} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRecipes([])}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 p-3">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className={cn(
              "group relative",
              selectedRecipes.includes(recipe.id) && "ring-2 ring-primary rounded-lg"
            )}>
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedRecipes.includes(recipe.id)}
                  onCheckedChange={(checked) => handleSelect(recipe.id, checked as boolean)}
                  className="bg-background/80 backdrop-blur-sm"
                />
              </div>
              <Link href={`/operational-planning/recipe-management/recipes/${recipe.id}`}>
                <RecipeCardCompact recipe={recipe} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      filteredRecipes.length > 0 &&
                      filteredRecipes.every(recipe => selectedRecipes.includes(recipe.id))
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cost/Portion</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRecipes.includes(recipe.id)}
                      onCheckedChange={(checked) => handleSelect(recipe.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>{recipe.categoryId}</TableCell>
                  <TableCell>${recipe.costPerPortion.amount.toFixed(2)}</TableCell>
                  <TableCell>{recipe.yieldVariants[0]?.sellingPrice ? `$${recipe.yieldVariants[0].sellingPrice.amount.toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell>{recipe.yieldVariants[0]?.marginPercentage ? `${recipe.yieldVariants[0].marginPercentage.toFixed(1)}%` : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={recipe.status === "published" ? "default" : "secondary"}>
                      {recipe.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/operational-planning/recipe-management/recipes/${recipe.id}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/operational-planning/recipe-management/recipes/${recipe.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileDown className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
} 