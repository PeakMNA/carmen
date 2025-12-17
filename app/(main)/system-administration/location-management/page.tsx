"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LocationList } from "./components/location-list"
import {
  Plus,
  Download,
  Printer,
  Upload,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  mockInventoryLocations,
  getInventoryLocationSummaries,
} from "@/lib/mock-data/inventory-locations"
import type { InventoryLocation } from "@/lib/types/location-management"

export default function LocationManagementPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<InventoryLocation[]>(mockInventoryLocations)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  const handleSelectItem = (id: string) => {
    setSelectedLocations(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedLocations(prev =>
      prev.length === locations.length ? [] : locations.map(item => item.id)
    )
  }

  const handleView = (location: InventoryLocation) => {
    router.push(`/system-administration/location-management/${location.id}`)
  }

  const handleEdit = (location: InventoryLocation) => {
    router.push(`/system-administration/location-management/${location.id}?mode=edit`)
  }

  const handleDelete = (location: InventoryLocation) => {
    // Check if location has active stock
    if (location.assignedProductsCount > 0) {
      alert(`Cannot delete location "${location.name}" - it has ${location.assignedProductsCount} products assigned.`)
      return
    }

    if (window.confirm(`Are you sure you want to delete "${location.name}"?`)) {
      setLocations(locations.filter(l => l.id !== location.id))
      setSelectedLocations(selectedLocations.filter(id => id !== location.id))
    }
  }

  const handleBulkAction = async (action: string) => {
    switch (action) {
      case 'activate':
        setLocations(locations.map(loc =>
          selectedLocations.includes(loc.id)
            ? { ...loc, status: 'active' as const }
            : loc
        ))
        setSelectedLocations([])
        break
      case 'deactivate':
        setLocations(locations.map(loc =>
          selectedLocations.includes(loc.id)
            ? { ...loc, status: 'inactive' as const }
            : loc
        ))
        setSelectedLocations([])
        break
      case 'delete':
        const locationsToDelete = locations.filter(loc =>
          selectedLocations.includes(loc.id)
        )
        const hasStock = locationsToDelete.some(loc => loc.assignedProductsCount > 0)

        if (hasStock) {
          alert('Cannot delete locations with assigned products. Please remove product assignments first.')
          return
        }

        if (window.confirm(`Are you sure you want to delete ${selectedLocations.length} locations?`)) {
          setLocations(locations.filter(loc => !selectedLocations.includes(loc.id)))
          setSelectedLocations([])
        }
        break
    }
  }

  const handleExport = () => {
    const headers = ['Code', 'Name', 'Type', 'Status', 'Physical Count', 'Shelves', 'Products', 'Users']
    const csvData = locations.map(loc => [
      loc.code,
      loc.name,
      loc.type,
      loc.status,
      loc.physicalCountEnabled ? 'Yes' : 'No',
      loc.shelvesCount,
      loc.assignedProductsCount,
      loc.assignedUsersCount
    ])

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `locations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleImport = () => {
    alert('Import CSV dialog - To be implemented')
  }

  return (
    <div className="container mx-auto py-6 px-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Location Management</h1>
          <p className="text-muted-foreground">
            Manage inventory locations, shelves, and assignments across your organization.
          </p>
        </div>

        <div className="flex items-center space-x-2 md:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Location
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/system-administration/location-management/new')}>
                Create New Location
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                Import from CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLocations.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedLocations.length} location(s) selected
          </span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
            Activate
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
            Deactivate
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedLocations([])}>
            Clear Selection
          </Button>
        </div>
      )}

      <LocationList
        locations={locations}
        selectedLocations={selectedLocations}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
