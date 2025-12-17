"use client"

import React, { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  Warehouse,
  Package,
  Users,
  Layers,
  CheckCircle,
  XCircle,
} from "lucide-react"
import {
  InventoryLocation,
  InventoryLocationType,
  LocationStatus,
  LOCATION_TYPE_LABELS,
} from "@/lib/types/location-management"

interface LocationListProps {
  locations: InventoryLocation[]
  selectedLocations: string[]
  onSelectItem: (id: string) => void
  onSelectAll: () => void
  onView: (location: InventoryLocation) => void
  onEdit: (location: InventoryLocation) => void
  onDelete: (location: InventoryLocation) => void
}

type SortField = 'code' | 'name' | 'type' | 'status' | 'shelvesCount' | 'assignedProductsCount' | 'assignedUsersCount'
type SortDirection = 'asc' | 'desc'

export function LocationList({
  locations,
  selectedLocations,
  onSelectItem,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
}: LocationListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<InventoryLocationType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<LocationStatus | 'all'>('all')
  const [physicalCountFilter, setPhysicalCountFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [sortField, setSortField] = useState<SortField>('code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedLocations = useMemo(() => {
    let result = [...locations]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(loc =>
        loc.code.toLowerCase().includes(query) ||
        loc.name.toLowerCase().includes(query) ||
        loc.description?.toLowerCase().includes(query)
      )
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(loc => loc.type === typeFilter)
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(loc => loc.status === statusFilter)
    }

    // Apply physical count filter
    if (physicalCountFilter !== 'all') {
      const enabled = physicalCountFilter === 'yes'
      result = result.filter(loc => loc.physicalCountEnabled === enabled)
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'code':
          comparison = a.code.localeCompare(b.code)
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'shelvesCount':
          comparison = a.shelvesCount - b.shelvesCount
          break
        case 'assignedProductsCount':
          comparison = a.assignedProductsCount - b.assignedProductsCount
          break
        case 'assignedUsersCount':
          comparison = a.assignedUsersCount - b.assignedUsersCount
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [locations, searchQuery, typeFilter, statusFilter, physicalCountFilter, sortField, sortDirection])

  const getTypeVariant = (type: InventoryLocationType): "default" | "secondary" | "outline" => {
    switch (type) {
      case InventoryLocationType.INVENTORY:
        return "default"
      case InventoryLocationType.DIRECT:
        return "secondary"
      case InventoryLocationType.CONSIGNMENT:
        return "outline"
      default:
        return "default"
    }
  }

  const getStatusVariant = (status: LocationStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active':
        return "default"
      case 'inactive':
        return "secondary"
      case 'closed':
        return "destructive"
      case 'pending_setup':
        return "outline"
      default:
        return "default"
    }
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  const allSelected = filteredAndSortedLocations.length > 0 &&
    filteredAndSortedLocations.every(loc => selectedLocations.includes(loc.id))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as InventoryLocationType | 'all')}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={InventoryLocationType.INVENTORY}>Inventory</SelectItem>
              <SelectItem value={InventoryLocationType.DIRECT}>Direct</SelectItem>
              <SelectItem value={InventoryLocationType.CONSIGNMENT}>Consignment</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LocationStatus | 'all')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="pending_setup">Pending Setup</SelectItem>
            </SelectContent>
          </Select>

          <Select value={physicalCountFilter} onValueChange={(v) => setPhysicalCountFilter(v as 'all' | 'yes' | 'no')}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Physical Count" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Count Enabled</SelectItem>
              <SelectItem value="no">Count Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedLocations.length} of {locations.length} locations
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>
                <SortableHeader field="code">Code</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader field="name">Name</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader field="type">Type</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader field="status">Status</SortableHeader>
              </TableHead>
              <TableHead className="text-center">Physical Count</TableHead>
              <TableHead className="text-center">
                <SortableHeader field="shelvesCount">
                  <Layers className="h-4 w-4" />
                </SortableHeader>
              </TableHead>
              <TableHead className="text-center">
                <SortableHeader field="assignedProductsCount">
                  <Package className="h-4 w-4" />
                </SortableHeader>
              </TableHead>
              <TableHead className="text-center">
                <SortableHeader field="assignedUsersCount">
                  <Users className="h-4 w-4" />
                </SortableHeader>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  <Warehouse className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No locations found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedLocations.map((location) => (
                <TableRow
                  key={location.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onView(location)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedLocations.includes(location.id)}
                      onCheckedChange={() => onSelectItem(location.id)}
                      aria-label={`Select ${location.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {location.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{location.name}</div>
                      {location.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {location.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(location.type)}>
                      {LOCATION_TYPE_LABELS[location.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(location.status)}>
                      {location.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {location.physicalCountEnabled ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">{location.shelvesCount}</TableCell>
                  <TableCell className="text-center">{location.assignedProductsCount}</TableCell>
                  <TableCell className="text-center">{location.assignedUsersCount}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(location)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(location)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(location)}
                          className="text-destructive"
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
    </div>
  )
}
