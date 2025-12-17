"use client"

import { useState, useMemo } from "react"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Edit,
  FileDown,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Ruler,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react"
import type { RecipeUnit } from "@/lib/types"
import { mockRecipeUnits } from "@/lib/mock-data"

interface RecipeUnitFormData {
  id: string
  code: string
  name: string
  pluralName: string
  displayOrder: number
  showInDropdown: boolean
  decimalPlaces: number
  roundingMethod: "round" | "floor" | "ceil"
  isActive: boolean
  isSystemUnit: boolean
  example: string
  notes: string
}

const initialFormData: RecipeUnitFormData = {
  id: "",
  code: "",
  name: "",
  pluralName: "",
  displayOrder: 0,
  showInDropdown: true,
  decimalPlaces: 2,
  roundingMethod: "round",
  isActive: true,
  isSystemUnit: false,
  example: "",
  notes: "",
}

export function RecipeUnitList() {
  const [units] = useState<RecipeUnit[]>(mockRecipeUnits)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentUnit, setCurrentUnit] = useState<RecipeUnit | null>(null)
  const [formData, setFormData] = useState<RecipeUnitFormData>(initialFormData)

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.code.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [units, searchTerm])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUnits(filteredUnits.filter(u => !u.isSystemUnit).map((unit) => unit.id))
    } else {
      setSelectedUnits([])
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUnits((prev) => [...prev, id])
    } else {
      setSelectedUnits((prev) => prev.filter((i) => i !== id))
    }
  }

  const handleEdit = (unit: RecipeUnit) => {
    setCurrentUnit(unit)
    setFormData({
      id: unit.id,
      code: unit.code,
      name: unit.name,
      pluralName: unit.pluralName || "",
      displayOrder: unit.displayOrder,
      showInDropdown: unit.showInDropdown,
      decimalPlaces: unit.decimalPlaces,
      roundingMethod: unit.roundingMethod,
      isActive: unit.isActive,
      isSystemUnit: unit.isSystemUnit,
      example: unit.example || "",
      notes: unit.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (unit: RecipeUnit) => {
    if (unit.isSystemUnit) return
    setCurrentUnit(unit)
    setIsDeleteDialogOpen(true)
  }

  const handleCreateNew = () => {
    setFormData(initialFormData)
    setIsCreateDialogOpen(true)
  }

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving unit:", formData)
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
  }

  const handleConfirmDelete = () => {
    // In a real app, this would delete from the backend
    console.log("Deleting unit:", currentUnit?.id)
    setIsDeleteDialogOpen(false)
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Ruler className="h-6 w-6" />
            Recipe Units
          </h1>
          <p className="text-muted-foreground">
            Manage units of measure for recipe ingredients and yields
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search units by name or code..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedUnits.length === filteredUnits.filter(u => !u.isSystemUnit).length &&
                    filteredUnits.filter(u => !u.isSystemUnit).length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No units found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUnits.includes(unit.id)}
                      onCheckedChange={(checked) =>
                        handleSelect(unit.id, checked as boolean)
                      }
                      disabled={unit.isSystemUnit}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{unit.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{unit.name}</div>
                    {unit.pluralName && unit.pluralName !== unit.name && (
                      <div className="text-sm text-muted-foreground">{unit.pluralName}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {unit.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                      {unit.isSystemUnit && (
                        <span title="System unit">
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(unit)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {unit.isSystemUnit ? "View" : "Edit"}
                        </DropdownMenuItem>
                        {!unit.isSystemUnit && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(unit)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredUnits.length} of {units.length} units
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setIsEditDialogOpen(false)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen
                ? currentUnit?.isSystemUnit
                  ? "View Unit"
                  : "Edit Unit"
                : "Add New Unit"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? currentUnit?.isSystemUnit
                  ? "System units cannot be modified."
                  : "Update the unit details below."
                : "Fill in the details to add a new unit of measure."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., kg, ml, pcs"
                  disabled={currentUnit?.isSystemUnit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Kilogram"
                  disabled={currentUnit?.isSystemUnit}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pluralName">Plural Name</Label>
                <Input
                  id="pluralName"
                  value={formData.pluralName}
                  onChange={(e) => setFormData({ ...formData, pluralName: e.target.value })}
                  placeholder="e.g., Kilograms"
                  disabled={currentUnit?.isSystemUnit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                  }
                  disabled={currentUnit?.isSystemUnit}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="decimalPlaces">Decimal Places</Label>
                <Input
                  id="decimalPlaces"
                  type="number"
                  min={0}
                  max={6}
                  value={formData.decimalPlaces}
                  onChange={(e) =>
                    setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) || 0 })
                  }
                  disabled={currentUnit?.isSystemUnit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roundingMethod">Rounding Method</Label>
                <Select
                  value={formData.roundingMethod}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      roundingMethod: value as "round" | "floor" | "ceil",
                    })
                  }
                  disabled={currentUnit?.isSystemUnit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round">Round</SelectItem>
                    <SelectItem value="floor">Floor</SelectItem>
                    <SelectItem value="ceil">Ceiling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="example">Example</Label>
              <Input
                id="example"
                value={formData.example}
                onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                placeholder="e.g., Single serving portion"
                disabled={currentUnit?.isSystemUnit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this unit..."
                rows={2}
                disabled={currentUnit?.isSystemUnit}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="showInDropdown"
                  checked={formData.showInDropdown}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showInDropdown: checked as boolean })
                  }
                  disabled={currentUnit?.isSystemUnit}
                />
                <Label htmlFor="showInDropdown">Show in Dropdown</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                  disabled={currentUnit?.isSystemUnit}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
              }}
            >
              {currentUnit?.isSystemUnit ? "Close" : "Cancel"}
            </Button>
            {!currentUnit?.isSystemUnit && (
              <Button onClick={handleSave}>
                {isEditDialogOpen ? "Save Changes" : "Add Unit"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{currentUnit?.name}&quot;? This action cannot
              be undone. Recipes using this unit may be affected.
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
