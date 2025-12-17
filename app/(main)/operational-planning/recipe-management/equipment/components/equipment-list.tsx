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
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Archive,
  Settings,
} from "lucide-react"
import type { Equipment, EquipmentCategory, EquipmentStatus } from "@/lib/types"
import { mockEquipment } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const EQUIPMENT_CATEGORIES: { label: string; value: EquipmentCategory }[] = [
  { label: "Cooking", value: "cooking" },
  { label: "Preparation", value: "preparation" },
  { label: "Refrigeration", value: "refrigeration" },
  { label: "Storage", value: "storage" },
  { label: "Serving", value: "serving" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Small Appliance", value: "small_appliance" },
  { label: "Utensil", value: "utensil" },
  { label: "Other", value: "other" },
]

const EQUIPMENT_STATUSES: { label: string; value: EquipmentStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Retired", value: "retired" },
]

function getStatusBadge(status: EquipmentStatus) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>
    case "inactive":
      return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
    case "maintenance":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertTriangle className="h-3 w-3 mr-1" />Maintenance</Badge>
    case "retired":
      return <Badge variant="outline"><Archive className="h-3 w-3 mr-1" />Retired</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getCategoryLabel(category: EquipmentCategory): string {
  const found = EQUIPMENT_CATEGORIES.find(c => c.value === category)
  return found?.label || category
}

interface EquipmentFormData {
  id: string
  code: string
  name: string
  description: string
  category: EquipmentCategory
  brand: string
  model: string
  capacity: string
  powerRating: string
  station: string
  status: EquipmentStatus
  isPortable: boolean
  availableQuantity: number
  totalQuantity: number
  maintenanceSchedule: string
  isActive: boolean
}

const initialFormData: EquipmentFormData = {
  id: "",
  code: "",
  name: "",
  description: "",
  category: "cooking",
  brand: "",
  model: "",
  capacity: "",
  powerRating: "",
  station: "",
  status: "active",
  isPortable: false,
  availableQuantity: 1,
  totalQuantity: 1,
  maintenanceSchedule: "",
  isActive: true,
}

export function EquipmentList() {
  const [equipment] = useState<Equipment[]>(mockEquipment)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentEquipment, setCurrentEquipment] = useState<Equipment | null>(null)
  const [formData, setFormData] = useState<EquipmentFormData>(initialFormData)

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (item.station?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      const matchesStatus = statusFilter === "all" || item.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [equipment, searchTerm, categoryFilter, statusFilter])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEquipment(filteredEquipment.map((item) => item.id))
    } else {
      setSelectedEquipment([])
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEquipment((prev) => [...prev, id])
    } else {
      setSelectedEquipment((prev) => prev.filter((i) => i !== id))
    }
  }

  const handleEdit = (item: Equipment) => {
    setCurrentEquipment(item)
    setFormData({
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description || "",
      category: item.category,
      brand: item.brand || "",
      model: item.model || "",
      capacity: item.capacity || "",
      powerRating: item.powerRating || "",
      station: item.station || "",
      status: item.status,
      isPortable: item.isPortable,
      availableQuantity: item.availableQuantity,
      totalQuantity: item.totalQuantity,
      maintenanceSchedule: item.maintenanceSchedule || "",
      isActive: item.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (item: Equipment) => {
    setCurrentEquipment(item)
    setIsDeleteDialogOpen(true)
  }

  const handleCreateNew = () => {
    setFormData(initialFormData)
    setIsCreateDialogOpen(true)
  }

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving equipment:", formData)
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
  }

  const handleConfirmDelete = () => {
    // In a real app, this would delete from the backend
    console.log("Deleting equipment:", currentEquipment?.id)
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            Equipment
          </h1>
          <p className="text-muted-foreground">
            Manage kitchen equipment used in recipe preparation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment by name, code, brand, or station..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {EQUIPMENT_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedEquipment.length === filteredEquipment.length &&
                    filteredEquipment.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Brand/Model</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No equipment found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredEquipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEquipment.includes(item.id)}
                      onCheckedChange={(checked) =>
                        handleSelect(item.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    {item.capacity && (
                      <div className="text-sm text-muted-foreground">{item.capacity}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryLabel(item.category)}</Badge>
                  </TableCell>
                  <TableCell>{item.station || "-"}</TableCell>
                  <TableCell>
                    {item.brand && item.model ? (
                      <div>
                        <div className="font-medium">{item.brand}</div>
                        <div className="text-sm text-muted-foreground">{item.model}</div>
                      </div>
                    ) : item.brand || item.model || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "font-medium",
                      item.availableQuantity < item.totalQuantity && "text-yellow-600"
                    )}>
                      {item.availableQuantity}
                    </span>
                    <span className="text-muted-foreground">/{item.totalQuantity}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Maintenance Log
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
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
        Showing {filteredEquipment.length} of {equipment.length} equipment items
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
              {isEditDialogOpen ? "Edit Equipment" : "Add New Equipment"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Update the equipment details below."
                : "Fill in the details to add new equipment."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Equipment Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., OVEN-CONV-01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Convection Oven"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the equipment..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as EquipmentCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="station">Kitchen Station</Label>
                <Input
                  id="station"
                  value={formData.station}
                  onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                  placeholder="e.g., Hot Kitchen, Prep Area"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g., Rational, Hobart"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g., SCC WE 101"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="e.g., 10 trays, 40 quarts"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="powerRating">Power Rating</Label>
                <Input
                  id="powerRating"
                  value={formData.powerRating}
                  onChange={(e) => setFormData({ ...formData, powerRating: e.target.value })}
                  placeholder="e.g., 2000W, Gas"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as EquipmentStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalQuantity">Total Quantity</Label>
                <Input
                  id="totalQuantity"
                  type="number"
                  min={1}
                  value={formData.totalQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableQuantity">Available</Label>
                <Input
                  id="availableQuantity"
                  type="number"
                  min={0}
                  max={formData.totalQuantity}
                  value={formData.availableQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availableQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenanceSchedule">Maintenance Schedule</Label>
              <Input
                id="maintenanceSchedule"
                value={formData.maintenanceSchedule}
                onChange={(e) =>
                  setFormData({ ...formData, maintenanceSchedule: e.target.value })
                }
                placeholder="e.g., Weekly, Monthly, As needed"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isPortable"
                  checked={formData.isPortable}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPortable: checked as boolean })
                  }
                />
                <Label htmlFor="isPortable">Portable Equipment</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
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
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isEditDialogOpen ? "Save Changes" : "Add Equipment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{currentEquipment?.name}&quot;? This action
              cannot be undone.
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
