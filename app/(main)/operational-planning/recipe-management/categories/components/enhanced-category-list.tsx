"use client"

import React, { useState } from "react"
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Edit,
  Eye,
  FileDown,
  FileUp,
  Filter,
  FolderTree,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  Printer,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { RecipeCategory } from "@/lib/types"
import { mockCategories } from "@/lib/mock-data"

// Extended interface for form data with additional UI-specific properties
interface CategoryFormData extends Omit<Partial<RecipeCategory>, 'id'> {
  id: string; // id is required
  status?: string;
  recipeCount?: number;
  activeRecipeCount?: number;
  averageCost?: number;
  averageMargin?: number;
  lastUpdated?: string;
  defaultCostSettings?: {
    laborCostPercentage: number;
    overheadPercentage: number;
    targetFoodCostPercentage: number;
  };
  defaultMargins?: {
    minimumMargin: number;
    targetMargin: number;
  };
}

interface FilterState {
  status: string[]
  minRecipes: number | null
  maxRecipes: number | null
  minMargin: number | null
  maxMargin: number | null
}

interface FilterCondition {
  id: string
  field: string
  operator: string
  value: string
}

const FILTER_FIELDS = [
  { label: "Name", value: "name" },
  { label: "Code", value: "code" },
  { label: "Description", value: "description" },
  { label: "Status", value: "status" },
  { label: "Recipe Count", value: "recipeCount" },
  { label: "Active Recipe Count", value: "activeRecipeCount" },
  { label: "Average Cost", value: "averageCost" },
  { label: "Average Margin", value: "averageMargin" },
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

export function EnhancedCategoryList() {
  const [categories] = useState<RecipeCategory[]>(mockCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFormData | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list')
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    minRecipes: null,
    maxRecipes: null,
    minMargin: null,
    maxMargin: null,
  })
  const [quickFilters, setQuickFilters] = useState<string[]>([])
  const [formData, setFormData] = useState<CategoryFormData>({
    id: "",
    name: "",
    code: "",
    description: "",
    isActive: true,
    status: "active",
    defaultCostSettings: {
      laborCostPercentage: 30,
      overheadPercentage: 20,
      targetFoodCostPercentage: 30
    },
    defaultMargins: {
      minimumMargin: 65,
      targetMargin: 70
    }
  })
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const handleEdit = (category: CategoryFormData) => {
    setSelectedCategory(category)
    setFormData({
      ...category,
    })
    setIsEditDialogOpen(true)
  }

  const handleView = (category: CategoryFormData) => {
    setSelectedCategory(category)
    setIsViewDialogOpen(true)
  }

  const handleViewToEdit = () => {
    if (!selectedCategory) return
    setIsViewDialogOpen(false)
    setFormData({
      ...selectedCategory,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (category: CategoryFormData) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  const handleCreate = () => {
    setFormData({
      id: "",
      name: "",
      code: "",
      description: "",
      isActive: true,
      status: "active",
      defaultCostSettings: {
        laborCostPercentage: 30,
        overheadPercentage: 20,
        targetFoodCostPercentage: 30
      },
      defaultMargins: {
        minimumMargin: 65,
        targetMargin: 70
      }
    })
    setIsCreateDialogOpen(true)
  }

  const handleSave = async () => {
    console.log("Saving category:", formData)

    if (isEditDialogOpen) {
      setIsEditDialogOpen(false)
    } else {
      setIsCreateDialogOpen(false)
    }

    setFormData({
      id: "",
      name: "",
      code: "",
      description: "",
      isActive: true,
      status: "active",
      defaultCostSettings: {
        laborCostPercentage: 30,
        overheadPercentage: 20,
        targetFoodCostPercentage: 30
      },
      defaultMargins: {
        minimumMargin: 65,
        targetMargin: 70
      }
    })
  }

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return
    
    console.log("Deleting category:", selectedCategory.id)
    
    setIsDeleteDialogOpen(false)
    setSelectedCategory(null)
  }

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

  const applyFilters = (category: CategoryFormData) => {
    if (quickFilters.length > 0) {
      if (quickFilters.includes('noRecipes') && (category.recipeCount ?? 0) > 0) return false
      if (quickFilters.includes('hasRecipes') && (category.recipeCount ?? 0) === 0) return false
    }

    return filterConditions.every((condition) => {
      const fieldValue = category[condition.field as keyof RecipeCategory]
      
      switch (condition.operator) {
        case "contains":
          return String(fieldValue)
            .toLowerCase()
            .includes(condition.value.toLowerCase())
        case "equals":
          return String(fieldValue).toLowerCase() === condition.value.toLowerCase()
        case "notEquals":
          return String(fieldValue).toLowerCase() !== condition.value.toLowerCase()
        case "greaterThan":
          return Number(fieldValue) > Number(condition.value)
        case "lessThan":
          return Number(fieldValue) < Number(condition.value)
        case "isEmpty":
          return !fieldValue || String(fieldValue).trim() === ""
        case "isNotEmpty":
          return fieldValue && String(fieldValue).trim() !== ""
        default:
          return true
      }
    })
  }

  const clearFilters = () => {
    setFilterConditions([])
    setQuickFilters([])
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(filteredCategories.map(category => category.id))
    } else {
      setSelectedCategories([])
    }
  }

  const handleSelect = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId])
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId))
    }
  }

  const renderCategoryRow = (category: CategoryFormData): JSX.Element => {
    return (
      <TableRow
        key={category.id}
        className="hover:bg-muted/30 transition-colors"
      >
        <TableCell className="py-2">
          <Checkbox
            checked={selectedCategories.includes(category.id)}
            onCheckedChange={(checked) => handleSelect(category.id, checked as boolean)}
          />
        </TableCell>
        <TableCell className="font-medium py-2 text-xs">{category.name}</TableCell>
        <TableCell className="font-mono text-xs py-2">{category.code}</TableCell>
        <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-xs py-2">
          <div className="truncate" title={category.description}>
            {category.description}
          </div>
        </TableCell>
        <TableCell className="py-2">
          <Badge
            variant={category.status === "active" ? "default" : "secondary"}
            className={`text-xs px-2 py-0.5 ${category.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}`}
          >
            {category.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right font-medium text-xs py-2">{category.recipeCount ?? 0}</TableCell>
        <TableCell className="text-right hidden sm:table-cell text-xs py-2">{category.activeRecipeCount ?? 0}</TableCell>
        <TableCell className="text-right hidden lg:table-cell font-mono text-xs py-2">${(category.averageCost ?? 0).toFixed(2)}</TableCell>
        <TableCell className="text-right hidden lg:table-cell font-mono text-xs py-2">{(category.averageMargin ?? 0).toFixed(1)}%</TableCell>
        <TableCell className="hidden xl:table-cell text-xs text-muted-foreground py-2">{category.lastUpdated ?? 'N/A'}</TableCell>
        <TableCell className="py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                aria-label={`Actions for ${category.name}`}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(category)}>
                <Eye className="mr-2 h-3 w-3" />
                <span className="text-xs">View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(category)}>
                <Edit className="mr-2 h-3 w-3" />
                <span className="text-xs">Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(category)}>
                <Trash2 className="mr-2 h-3 w-3" />
                <span className="text-xs">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  }

  const renderCategoryCard = (category: CategoryFormData): JSX.Element => {
    return (
      <Card key={category.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleSelect(category.id, checked as boolean)}
                className="mt-1"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <CardTitle className="text-lg leading-tight">
                  {category.name}
                </CardTitle>
                <CardDescription className="text-sm font-mono">
                  {category.code}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={category.status === "active" ? "default" : "secondary"}
                className={category.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
              >
                {category.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label={`Actions for ${category.name}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleView(category)}>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(category)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(category)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground line-clamp-2">
              {category.description || "No description available"}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-foreground">Recipes</div>
                <div className="text-muted-foreground">{category.recipeCount ?? 0} total</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Active</div>
                <div className="text-muted-foreground">{category.activeRecipeCount ?? 0}</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Avg. Cost</div>
                <div className="font-mono text-muted-foreground">${(category.averageCost ?? 0).toFixed(2)}</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Avg. Margin</div>
                <div className="font-mono text-muted-foreground">{(category.averageMargin ?? 0).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredCategories = categories
    .filter(category =>
      (category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       category.code?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      applyFilters(category)
    )

  const handleBulkAction = async (action: string) => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) {
          console.log("Deleting categories:", selectedCategories)
          setSelectedCategories([])
        }
        break
      case 'activate':
        console.log("Activating categories:", selectedCategories)
        break
      case 'deactivate':
        console.log("Deactivating categories:", selectedCategories)
        break
      case 'export':
        console.log("Exporting categories:", selectedCategories)
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Recipe Categories</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Manage and organize recipe categories for your menu items
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          
          <Button variant="outline" className="h-8 px-3 text-xs">
            <FileUp className="h-3 w-3 mr-1" />
            Import
          </Button>
          <Button variant="outline" className="h-8 px-3 text-xs">
            <FileDown className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button variant="outline" className="h-8 px-3 text-xs">
            <Printer className="h-3 w-3 mr-1" />
            Print
          </Button>
          <Button onClick={handleCreate} className="h-8 px-3 text-xs font-medium">
            <Plus className="h-3 w-3 mr-1" />
            New Category
          </Button>
        </div>
      </div>

      {/* Improved Search and Filters */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="relative flex-1 sm:flex-initial sm:w-80">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={quickFilters.includes('noRecipes') ? 'default' : 'outline'}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => handleQuickFilter('noRecipes')}
              aria-pressed={quickFilters.includes('noRecipes')}
            >
              No Recipes
            </Button>
            <Button
              variant={quickFilters.includes('hasRecipes') ? 'default' : 'outline'}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => handleQuickFilter('hasRecipes')}
              aria-pressed={quickFilters.includes('hasRecipes')}
            >
              Has Recipes
            </Button>

            <Popover open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  aria-expanded={isAdvancedFilterOpen}
                >
                  <SlidersHorizontal className="h-3 w-3 mr-1" />
                  More Filters {filterConditions.length > 0 && `(${filterConditions.length})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-4" align="end">
                <div className="space-y-4">
                  <div className="font-medium flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
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
                        className="h-10 w-10 p-2"
                        onClick={() => removeFilterCondition(condition.id)}
                        aria-label="Remove filter condition"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full h-10"
                    onClick={addFilterCondition}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add filter
                  </Button>
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" className="h-10 px-4" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button size="sm" className="h-10 px-4" onClick={() => setIsAdvancedFilterOpen(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* View Toggle */}
            <div className="flex items-center border rounded-md ml-auto">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2 rounded-r-none border-0"
                onClick={() => setViewMode('list')}
              >
                <List className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2 rounded-l-none border-0"
                onClick={() => setViewMode('card')}
              >
                <LayoutGrid className="h-3 w-3" />
              </Button>
            </div>

            {(quickFilters.length > 0 || filterConditions.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4"
                onClick={() => handleBulkAction('activate')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4"
                onClick={() => handleBulkAction('deactivate')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4"
                onClick={() => handleBulkAction('export')}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-10 px-4"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedCategories.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4"
                onClick={() => setSelectedCategories([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Categories Display */}
      {viewMode === 'list' ? (
        <div className="border rounded-lg overflow-hidden" aria-label="Recipe categories table">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[50px] font-semibold">
                    <Checkbox
                      checked={
                        filteredCategories.length > 0 &&
                        filteredCategories.every(category => 
                          selectedCategories.includes(category.id)
                        )
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-xs py-2">Name</TableHead>
                  <TableHead className="font-semibold text-xs py-2">Code</TableHead>
                  <TableHead className="font-semibold text-xs py-2 hidden md:table-cell">Description</TableHead>
                  <TableHead className="font-semibold text-xs py-2">Status</TableHead>
                  <TableHead className="text-right font-semibold text-xs py-2">Recipes</TableHead>
                  <TableHead className="text-right font-semibold text-xs py-2 hidden sm:table-cell">Active</TableHead>
                  <TableHead className="text-right font-semibold text-xs py-2 hidden lg:table-cell">Avg. Cost</TableHead>
                  <TableHead className="text-right font-semibold text-xs py-2 hidden lg:table-cell">Avg. Margin</TableHead>
                  <TableHead className="font-semibold text-xs py-2 hidden xl:table-cell">Last Updated</TableHead>
                  <TableHead className="font-semibold text-xs py-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map(category => renderCategoryRow(category))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card view header with Select All */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  filteredCategories.length > 0 &&
                  filteredCategories.every(category => 
                    selectedCategories.includes(category.id)
                  )
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all categories
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredCategories.length} categories found
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map(category => renderCategoryCard(category))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No categories found</h3>
          <p className="text-muted-foreground mb-4 max-w-sm leading-relaxed">
            {searchTerm || quickFilters.length > 0 || filterConditions.length > 0
              ? "Try adjusting your search terms or filters to find what you're looking for."
              : "Get started by creating your first recipe category."}
          </p>
          {searchTerm || quickFilters.length > 0 || filterConditions.length > 0 ? (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          )}
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-foreground">
              Category Details
            </DialogTitle>
            <DialogDescription>
              View information for &quot;{selectedCategory?.name}&quot;
            </DialogDescription>
          </DialogHeader>

          {selectedCategory && (
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Category Name
                    </Label>
                    <div className="text-base text-foreground">
                      {selectedCategory.name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Category Code
                    </Label>
                    <div className="text-base font-mono text-foreground">
                      {selectedCategory.code}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Description
                  </Label>
                  <div className="text-base text-foreground">
                    {selectedCategory.description || "No description provided"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={selectedCategory.status === "active" ? "default" : "secondary"}
                      className={selectedCategory.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                    >
                      {selectedCategory.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Recipe Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Recipe Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Total Recipes
                    </Label>
                    <div className="text-2xl font-bold text-foreground">
                      {selectedCategory.recipeCount ?? 0}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Active Recipes
                    </Label>
                    <div className="text-2xl font-bold text-foreground">
                      {selectedCategory.activeRecipeCount ?? 0}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Average Cost
                    </Label>
                    <div className="text-2xl font-bold font-mono text-foreground">
                      ${(selectedCategory.averageCost ?? 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Average Margin
                    </Label>
                    <div className="text-2xl font-bold font-mono text-foreground">
                      {(selectedCategory.averageMargin ?? 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Cost Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Default Cost Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Labor Cost Percentage
                    </Label>
                    <div className="text-base font-mono text-foreground">
                      {selectedCategory.defaultCostSettings?.laborCostPercentage ?? 0}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Overhead Percentage
                    </Label>
                    <div className="text-base font-mono text-foreground">
                      {selectedCategory.defaultCostSettings?.overheadPercentage ?? 0}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Target Food Cost Percentage
                    </Label>
                    <div className="text-base font-mono text-foreground">
                      {selectedCategory.defaultCostSettings?.targetFoodCostPercentage ?? 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Margins */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Default Profit Margins
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Minimum Profit Margin
                    </Label>
                    <div className="text-base font-mono text-foreground">
                      {selectedCategory.defaultMargins?.minimumMargin ?? 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum acceptable profit margin
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Target Profit Margin
                    </Label>
                    <div className="text-base font-mono text-foreground">
                      {selectedCategory.defaultMargins?.targetMargin ?? 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ideal profit margin to target
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                  Additional Information
                </h3>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </Label>
                  <div className="text-base text-foreground">
                    {selectedCategory.lastUpdated ?? 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsViewDialogOpen(false)}
              className="min-w-[100px] h-9"
            >
              Close
            </Button>
            <Button 
              size="sm"
              onClick={handleViewToEdit}
              className="min-w-[100px] h-9"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={() => {
        setIsCreateDialogOpen(false)
        setIsEditDialogOpen(false)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-foreground">
              {isEditDialogOpen ? "Edit Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    Category Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter category name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-foreground">
                    Category Code *
                  </Label>
                  <Input
                    id="code"
                    placeholder="e.g., APP, MAIN"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe this category (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[80px] text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-foreground">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Default Cost Settings Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Default Cost Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="laborCost" className="text-sm font-medium text-foreground">
                    Labor Cost Percentage
                  </Label>
                  <div className="relative">
                    <Input
                      id="laborCost"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.defaultCostSettings?.laborCostPercentage || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        defaultCostSettings: {
                          ...formData.defaultCostSettings!,
                          laborCostPercentage: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="h-9 pr-8 text-sm"
                      placeholder="30"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overhead" className="text-sm font-medium text-foreground">
                    Overhead Percentage
                  </Label>
                  <div className="relative">
                    <Input
                      id="overhead"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.defaultCostSettings?.overheadPercentage || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        defaultCostSettings: {
                          ...formData.defaultCostSettings!,
                          overheadPercentage: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="h-9 pr-8 text-sm"
                      placeholder="20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="targetFoodCost" className="text-sm font-medium text-foreground">
                    Target Food Cost Percentage
                  </Label>
                  <div className="relative">
                    <Input
                      id="targetFoodCost"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.defaultCostSettings?.targetFoodCostPercentage || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        defaultCostSettings: {
                          ...formData.defaultCostSettings!,
                          targetFoodCostPercentage: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="h-9 pr-8 text-sm"
                      placeholder="30"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Default Margins Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Default Profit Margins
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumMargin" className="text-sm font-medium text-foreground">
                    Minimum Profit Margin
                  </Label>
                  <div className="relative">
                    <Input
                      id="minimumMargin"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.defaultMargins?.minimumMargin || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        defaultMargins: {
                          ...formData.defaultMargins!,
                          minimumMargin: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="h-9 pr-8 text-sm"
                      placeholder="65"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum acceptable profit margin
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetMargin" className="text-sm font-medium text-foreground">
                    Target Profit Margin
                  </Label>
                  <div className="relative">
                    <Input
                      id="targetMargin"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.defaultMargins?.targetMargin || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        defaultMargins: {
                          ...formData.defaultMargins!,
                          targetMargin: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="h-9 pr-8 text-sm"
                      placeholder="70"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ideal profit margin to target
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
              }}
              className="min-w-[100px] h-9"
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              className="min-w-[140px] h-9"
            >
              {isEditDialogOpen ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}