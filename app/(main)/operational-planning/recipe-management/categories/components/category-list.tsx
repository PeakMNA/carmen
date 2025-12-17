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

export function CategoryList() {
  const [categories] = useState<RecipeCategory[]>(mockCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFormData | null>(null)
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
    // Here you would typically make an API call to save the category
    console.log("Saving category:", formData)

    if (isEditDialogOpen) {
      setIsEditDialogOpen(false)
    } else {
      setIsCreateDialogOpen(false)
    }

    // Reset form
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
    
    // Here you would typically make an API call to delete the category
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
    // Quick filters
    if (quickFilters.length > 0) {
      if (quickFilters.includes('noRecipes') && (category.recipeCount ?? 0) > 0) return false
      if (quickFilters.includes('hasRecipes') && (category.recipeCount ?? 0) === 0) return false
    }

    // Advanced filters
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
      <TableRow key={category.id}>
        <TableCell>
          <Checkbox
            checked={selectedCategories.includes(category.id)}
            onCheckedChange={(checked) => handleSelect(category.id, checked as boolean)}
          />
        </TableCell>
        <TableCell className="font-medium">{category.name}</TableCell>
        <TableCell>{category.code}</TableCell>
        <TableCell>{category.description}</TableCell>
        <TableCell>
          <Badge variant={category.status === "active" ? "default" : "secondary"}>
            {category.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right">{category.recipeCount ?? 0}</TableCell>
        <TableCell className="text-right">{category.activeRecipeCount ?? 0}</TableCell>
        <TableCell className="text-right">${(category.averageCost ?? 0).toFixed(2)}</TableCell>
        <TableCell className="text-right">{(category.averageMargin ?? 0).toFixed(1)}%</TableCell>
        <TableCell>{category.lastUpdated ?? 'N/A'}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 p-2"
                aria-label={`Actions for ${category.name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(category)}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  }

  const filteredCategories = categories
    .filter(category =>
      (category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       category.code?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      applyFilters(category)
    )

  // Add new bulk action handler
  const handleBulkAction = async (action: string) => {
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) {
          // Here you would make an API call to delete the categories
          console.log("Deleting categories:", selectedCategories)
          setSelectedCategories([])
        }
        break
      case 'activate':
        // Here you would make an API call to activate the categories
        console.log("Activating categories:", selectedCategories)
        break
      case 'deactivate':
        // Here you would make an API call to deactivate the categories
        console.log("Deactivating categories:", selectedCategories)
        break
      case 'export':
        // Here you would trigger the export functionality
        console.log("Exporting categories:", selectedCategories)
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Recipe Categories</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 px-4">
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="h-11 px-4">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="h-11 px-4">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleCreate} className="h-11 px-4">
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex gap-2">
              <Button
                variant={quickFilters.includes('noRecipes') ? 'default' : 'outline'}
                size="sm"
                className="h-11 px-4"
                onClick={() => handleQuickFilter('noRecipes')}
                aria-pressed={quickFilters.includes('noRecipes')}
              >
                No Recipes
              </Button>
              <Button
                variant={quickFilters.includes('hasRecipes') ? 'default' : 'outline'}
                size="sm"
                className="h-11 px-4"
                onClick={() => handleQuickFilter('hasRecipes')}
                aria-pressed={quickFilters.includes('hasRecipes')}
              >
                Has Recipes
              </Button>
            </div>

            <Popover open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-11 px-4"
                  aria-expanded={isAdvancedFilterOpen}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
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
                        className="h-11 w-11 p-2"
                        onClick={() => removeFilterCondition(condition.id)}
                        aria-label="Remove filter condition"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full h-11"
                    onClick={addFilterCondition}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add filter
                  </Button>
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" className="h-11 px-4" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button size="sm" className="h-11 px-4" onClick={() => setIsAdvancedFilterOpen(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {(quickFilters.length > 0 || filterConditions.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground h-11 px-4"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCategories.length > 0 && (
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-11 px-4"
                onClick={() => handleBulkAction('activate')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-11 px-4"
                onClick={() => handleBulkAction('deactivate')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-11 px-4"
                onClick={() => handleBulkAction('export')}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-11 px-4"
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
                className="h-11 px-4"
                onClick={() => setSelectedCategories([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Categories Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
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
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Recipes</TableHead>
              <TableHead className="text-right">Active</TableHead>
              <TableHead className="text-right">Avg. Cost</TableHead>
              <TableHead className="text-right">Avg. Margin</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map(category => renderCategoryRow(category))}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={() => {
        setIsCreateDialogOpen(false)
        setIsEditDialogOpen(false)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Edit the category details below"
                : "Fill in the details to create a new category"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Default Cost Settings</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="laborCost">Labor Cost %</Label>
                  <Input
                    id="laborCost"
                    type="number"
                    value={formData.defaultCostSettings?.laborCostPercentage}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultCostSettings: {
                        ...formData.defaultCostSettings!,
                        laborCostPercentage: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overhead">Overhead %</Label>
                  <Input
                    id="overhead"
                    type="number"
                    value={formData.defaultCostSettings?.overheadPercentage}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultCostSettings: {
                        ...formData.defaultCostSettings!,
                        overheadPercentage: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetFoodCost">Target Food Cost %</Label>
                  <Input
                    id="targetFoodCost"
                    type="number"
                    value={formData.defaultCostSettings?.targetFoodCostPercentage}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultCostSettings: {
                        ...formData.defaultCostSettings!,
                        targetFoodCostPercentage: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Default Margins</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumMargin">Minimum Margin %</Label>
                  <Input
                    id="minimumMargin"
                    type="number"
                    value={formData.defaultMargins?.minimumMargin}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultMargins: {
                        ...formData.defaultMargins!,
                        minimumMargin: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetMargin">Target Margin %</Label>
                  <Input
                    id="targetMargin"
                    type="number"
                    value={formData.defaultMargins?.targetMargin}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultMargins: {
                        ...formData.defaultMargins!,
                        targetMargin: parseFloat(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              setIsEditDialogOpen(false)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
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