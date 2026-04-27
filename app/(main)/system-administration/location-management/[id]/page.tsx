"use client"

import React, { useState, useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Pencil,
  Save,
  X,
  Trash2,
  Warehouse,
  Info,
  Layers,
  Users,
  Package,
} from "lucide-react"
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
  getInventoryLocationById,
  getShelvesForLocation,
  getUserAssignmentsForLocation,
  getProductAssignmentsForLocation,
} from "@/lib/mock-data/inventory-locations"
import {
  LOCATION_TYPE_LABELS,
  InventoryLocationType,
} from "@/lib/types/location-management"
import { GeneralTab } from "../components/tabs/general-tab"
import { ShelvesTab } from "../components/tabs/shelves-tab"
import { UsersTab } from "../components/tabs/users-tab"
import { ProductsTab } from "../components/tabs/products-tab"

export default function LocationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const locationId = params.id as string
  const initialMode = searchParams.get('mode') === 'edit' ? 'edit' : 'view'

  const [isEditing, setIsEditing] = useState(initialMode === 'edit')
  const [activeTab, setActiveTab] = useState("general")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch location data
  const location = useMemo(() => getInventoryLocationById(locationId), [locationId])
  const shelves = useMemo(() => getShelvesForLocation(locationId), [locationId])
  const userAssignments = useMemo(() => getUserAssignmentsForLocation(locationId), [locationId])
  const productAssignments = useMemo(() => getProductAssignmentsForLocation(locationId), [locationId])

  if (!location) {
    return (
      <div className="px-6 py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Warehouse className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Location Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The location you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/system-administration/location-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Locations
          </Button>
        </div>
      </div>
    )
  }

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

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
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

  const handleSave = () => {
    // In a real app, this would save the changes
    setIsEditing(false)
    // Update URL to remove edit mode
    router.replace(`/system-administration/location-management/${locationId}`)
  }

  const handleCancel = () => {
    setIsEditing(false)
    router.replace(`/system-administration/location-management/${locationId}`)
  }

  const handleDelete = () => {
    // Check if location has active stock
    if (location.assignedProductsCount > 0) {
      alert(`Cannot delete location "${location.name}" - it has ${location.assignedProductsCount} products assigned.`)
      return
    }
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    // In a real app, this would delete the location
    router.push('/system-administration/location-management')
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/system-administration/location-management')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{location.name}</h1>
              <Badge variant={getTypeVariant(location.type)}>
                {LOCATION_TYPE_LABELS[location.type]}
              </Badge>
              <Badge variant={getStatusVariant(location.status)}>
                {location.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono">{location.code}</p>
            {location.description && (
              <p className="text-sm text-muted-foreground">{location.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Layers className="h-4 w-4" />
            <span className="text-sm">Shelves</span>
          </div>
          <p className="text-2xl font-semibold">{location.shelvesCount}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="h-4 w-4" />
            <span className="text-sm">Products</span>
          </div>
          <p className="text-2xl font-semibold">{location.assignedProductsCount}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-sm">Users</span>
          </div>
          <p className="text-2xl font-semibold">{location.assignedUsersCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Info className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="shelves" className="gap-2">
            <Layers className="h-4 w-4" />
            Shelves ({shelves.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users ({userAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products ({productAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab location={location} isEditing={isEditing} />
        </TabsContent>

        <TabsContent value="shelves">
          <ShelvesTab
            locationId={locationId}
            shelves={shelves}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab
            locationId={locationId}
            assignments={userAssignments}
            isEditing={isEditing}
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductsTab
            locationId={locationId}
            assignments={productAssignments}
            shelves={shelves}
            isEditing={isEditing}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{location.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
