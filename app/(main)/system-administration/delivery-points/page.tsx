/**
 * Delivery Points Management Page
 *
 * @module system-administration/delivery-points
 * @description
 * Manages delivery point records for vendor deliveries. Delivery points represent
 * physical locations where vendors can deliver goods, referenced by inventory
 * locations for procurement purposes.
 *
 * @see docs/app/system-administration/delivery-points/BR-delivery-points.md
 *
 * Business Requirements Implemented:
 * - FR-DP-001: List view with Name/Status columns, search, filter, sort
 * - FR-DP-002: Create delivery point with Name (required) and Active toggle
 * - FR-DP-003: Edit delivery point with same validation as create
 * - FR-DP-004: Delete with confirmation dialog
 * - FR-DP-005: Color-coded status badges (green=Active, gray=Inactive)
 *
 * Data Model (simplified per BR-DP):
 * - id: string (UUID)
 * - name: string (required)
 * - isActive: boolean
 * - createdAt, createdBy, updatedAt, updatedBy: audit fields
 */

"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Truck,
  ArrowUpDown,
} from "lucide-react"
import { getAllDeliveryPoints } from "@/lib/mock-data/inventory-locations"
import { DeliveryPoint } from "@/lib/types/location-management"

// ====== TYPE DEFINITIONS ======

/** Sortable table columns */
type SortField = 'name' | 'isActive'

/** Sort direction for table columns */
type SortDirection = 'asc' | 'desc'

// ====== MAIN COMPONENT ======

export default function DeliveryPointsPage() {
  // ====== STATE MANAGEMENT ======

  // List filtering and sorting state (FR-DP-001)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Dialog visibility state
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPoint, setEditingPoint] = useState<DeliveryPoint | null>(null)
  const [deletingPoint, setDeletingPoint] = useState<DeliveryPoint | null>(null)

  // Form state for add/edit dialogs (shared between create and edit)
  const [formName, setFormName] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  // ====== DATA FETCHING ======

  /** Fetch all delivery points from mock data (memoized for performance) */
  const allDeliveryPoints = useMemo(() => getAllDeliveryPoints(), [])

  // ====== COMPUTED DATA ======

  /**
   * Filter and sort delivery points based on current filter/sort state
   * Implements FR-DP-001: real-time search, status filter, column sorting
   */
  const filteredDeliveryPoints = useMemo(() => {
    let result = [...allDeliveryPoints]

    // Apply search filter (FR-DP-001: real-time search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(dp =>
        dp.name.toLowerCase().includes(query)
      )
    }

    // Apply status filter (FR-DP-001: filter by status)
    if (statusFilter !== 'all') {
      result = result.filter(dp =>
        statusFilter === 'active' ? dp.isActive : !dp.isActive
      )
    }

    // Apply sorting (FR-DP-001: sort by any column)
    result.sort((a, b) => {
      if (sortField === 'isActive') {
        const aValue = a.isActive
        const bValue = b.isActive
        return sortDirection === 'asc'
          ? (aValue === bValue ? 0 : aValue ? -1 : 1)
          : (aValue === bValue ? 0 : aValue ? 1 : -1)
      }

      const aValue = a.name.toLowerCase()
      const bValue = b.name.toLowerCase()
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    return result
  }, [allDeliveryPoints, searchQuery, statusFilter, sortField, sortDirection])

  // ====== EVENT HANDLERS ======

  /**
   * Toggle sort direction or change sort field
   * @param field - The column field to sort by
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  /**
   * Reset form and open add dialog
   * FR-DP-002: Default status is Active
   */
  const handleOpenAddDialog = () => {
    setFormName('')
    setFormIsActive(true) // Default status: Active
    setShowAddDialog(true)
  }

  /**
   * Open edit dialog pre-populated with current values
   * FR-DP-003: All fields editable except ID
   * @param point - The delivery point to edit
   */
  const handleOpenEditDialog = (point: DeliveryPoint) => {
    setFormName(point.name)
    setFormIsActive(point.isActive)
    setEditingPoint(point)
  }

  /**
   * Handle form submission for creating a new delivery point
   * FR-DP-002: Form validation for required fields, dialog closes on save
   * @param e - Form submit event
   */
  const handleAddDeliveryPoint = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return // Required field validation

    // TODO: Replace with actual API call
    console.log('Adding delivery point:', { name: formName, isActive: formIsActive })

    // Reset form state and close dialog
    setShowAddDialog(false)
    setFormName('')
    setFormIsActive(true)
  }

  /**
   * Handle form submission for editing an existing delivery point
   * FR-DP-003: Same validation as create, changes reflected after save
   * @param e - Form submit event
   */
  const handleEditDeliveryPoint = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return // Required field validation

    // TODO: Replace with actual API call
    console.log('Editing delivery point:', { id: editingPoint?.id, name: formName, isActive: formIsActive })

    // Reset form state and close dialog
    setEditingPoint(null)
    setFormName('')
    setFormIsActive(true)
  }

  /**
   * Handle confirmed deletion of a delivery point
   * FR-DP-004: Delete after confirmation, row removed from list
   */
  const handleDeleteDeliveryPoint = () => {
    // TODO: Replace with actual API call
    // TODO: FR-DP-004 future enhancement - prevent delete if referenced by locations
    console.log('Deleting delivery point:', deletingPoint?.id)
    setDeletingPoint(null)
  }

  // ====== SUB-COMPONENTS ======

  /**
   * Reusable sort button for table headers
   * Displays column name with sort direction indicator
   */
  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )

  // ====== RENDER ======

  return (
    <div className="container mx-auto py-6 px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Delivery Points</h1>
          <p className="text-muted-foreground">
            Manage delivery addresses for vendor deliveries
          </p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Delivery Point
        </Button>
      </div>

      {/* Filters (FR-DP-001) */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table (FR-DP-001: Display columns Name, Status) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Points
            <Badge variant="secondary" className="ml-2">
              {filteredDeliveryPoints.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDeliveryPoints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No delivery points found</p>
              {searchQuery && (
                <Button
                  variant="link"
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton field="name">Name</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="isActive">Status</SortButton>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveryPoints.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell>
                      <div className="font-medium">{point.name}</div>
                    </TableCell>
                    <TableCell>
                      {/* FR-DP-005: Status displayed with color-coded badge (green/gray) */}
                      <Badge
                        variant={point.isActive ? "default" : "secondary"}
                        className={point.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {point.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(point)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingPoint(point)}
                            className="text-destructive"
                          >
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
          )}
        </CardContent>
      </Card>

      {/* Add Delivery Point Dialog (FR-DP-002) */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddDeliveryPoint}>
            <DialogHeader>
              <DialogTitle>Add Delivery Point</DialogTitle>
              <DialogDescription>
                Create a new delivery point for vendor deliveries
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dpName">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="dpName"
                  placeholder="e.g., Main Warehouse - Receiving Dock"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              {/* FR-DP-002: Active status toggle, default: Active */}
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this delivery point for use
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formName.trim()}>
                Add Delivery Point
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Delivery Point Dialog (FR-DP-003) */}
      <Dialog open={!!editingPoint} onOpenChange={(open) => !open && setEditingPoint(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditDeliveryPoint}>
            <DialogHeader>
              <DialogTitle>Edit Delivery Point</DialogTitle>
              <DialogDescription>
                Update delivery point details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editDpName">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="editDpName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              {/* FR-DP-003/FR-DP-005: Toggle to change status */}
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <Label htmlFor="editIsActive">Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this delivery point for use
                  </p>
                </div>
                <Switch
                  id="editIsActive"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingPoint(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formName.trim()}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog (FR-DP-004) */}
      <AlertDialog open={!!deletingPoint} onOpenChange={(open) => !open && setDeletingPoint(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Point</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingPoint?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDeliveryPoint} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
