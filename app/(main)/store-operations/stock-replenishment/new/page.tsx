/**
 * Stock Replenishment - New Store Requisition Page
 *
 * Creates Store Requisitions (SR) from stock replenishment workflow.
 * The SR is then processed by the system to generate appropriate documents:
 * - Stock Transfer (ST) when source location has stock
 * - Stock Issue (SI) when destination is a DIRECT location
 * - Purchase Request (PR) when no source stock available
 *
 * LOCATION TYPE HANDLING:
 * Stock replenishment operates between locations with specific rules:
 *
 * - INVENTORY → INVENTORY: Creates SR that generates Stock Transfer (ST)
 *   - Both source and destination must have stock tracking
 *   - ST status workflow: Draft → Issued → In Transit → Received → Complete
 *
 * - INVENTORY → CONSIGNMENT: Not typical but allowed
 *   - Transfers company-owned to vendor-managed stock
 *   - Requires vendor notification
 *
 * - CONSIGNMENT → INVENTORY: Conversion to owned
 *   - Vendor-owned becomes company-owned
 *   - Vendor notification required
 *
 * - DIRECT locations: NOT ALLOWED for replenishment
 *   - Cannot transfer FROM DIRECT (no stock balance)
 *   - Cannot transfer TO DIRECT (no PAR levels, no tracking)
 *   - DIRECT locations should use Purchase Requests instead
 *
 * The component filters out DIRECT locations from both source and destination
 * selection to enforce these business rules.
 *
 * Note: This page creates Store Requisitions (SR) directly.
 * See docs/app/store-operations/sr-business-rules.md for the complete flow.
 */

"use client"

import React, { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
  AlertTriangle,
  AlertCircle,
  Save,
  Send,
  Trash2,
  User,
  Building2,
  Calendar,
  ArrowRight,
  Warehouse,
  Hash,
  FileText,
  Plus,
  MoreHorizontal,
  CheckCircle,
  X,
  Clock,
  MessageSquare,
  Paperclip,
  PanelRightClose,
  PanelRightOpen,
  DollarSign,
  Truck
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSimpleUser } from "@/lib/context/simple-user-context"
import {
  getItemsBelowParLevel,
  enrichItemsWithSourceAvailability,
  getSourceLocations,
  mockInventoryLocations,
  type TransferItem
} from "@/lib/mock-data"
import { InventoryLocationType } from "@/lib/types/location-management"
import {
  canReceiveTransfer,
  canTransferBetween,
  requiresVendorNotification,
  getLocationTypeLabel
} from "@/lib/utils/location-type-helpers"
import { LocationTypeBadge, LocationTypeAlert } from "@/components/location-type-badge"
import { formatNumber } from "@/lib/utils/formatters"
import { ShoppingCart } from "lucide-react"

// Special constant for "None" source - indicates PR-only workflow
const NONE_SOURCE_ID = "none"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface RequestItem extends TransferItem {
  requestedQty: number
  sourceAvailable: number
  isValid: boolean
  validationError?: string
  itemInfo: {
    location: string
    locationCode: string
    itemName: string
    category: string
    subCategory: string
    itemGroup: string
    barCode: string
  }
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    standard: { label: "Standard", className: "bg-green-100 text-green-700 border-green-200", icon: <Clock className="h-3 w-3" /> },
    urgent: { label: "Urgent", className: "bg-amber-100 text-amber-700 border-amber-200", icon: <AlertTriangle className="h-3 w-3" /> },
    emergency: { label: "Emergency", className: "bg-red-100 text-red-700 border-red-200", icon: <AlertCircle className="h-3 w-3" /> }
  }
  const { label, className, icon } = config[priority] || { label: priority, className: "", icon: null }
  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      {icon}
      {label}
    </Badge>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function NewStoreRequisitionPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useSimpleUser()

  // Form state
  const [sourceLocationId, setSourceLocationId] = useState("")
  const [priority, setPriority] = useState<"standard" | "urgent" | "emergency">("standard")
  const [notes, setNotes] = useState("")
  const [requestItems, setRequestItems] = useState<RequestItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [newComment, setNewComment] = useState("")

  // Add Items Dialog state
  const [showAddItemsDialog, setShowAddItemsDialog] = useState(false)
  const [selectedBelowParItems, setSelectedBelowParItems] = useState<Set<string>>(new Set())

  // Get user's current location (destination)
  const userLocationId = user?.context?.currentLocation?.id || "loc-006"
  const userName = user?.name || "John Doe"
  const userDepartment = user?.context?.currentDepartment?.name || "Administration"

  /**
   * LOCATION TYPE VALIDATION:
   * Check if user's current location can receive stock replenishment.
   *
   * Business Rules:
   * - INVENTORY: Can receive replenishment (has PAR levels, tracks stock)
   * - CONSIGNMENT: Can receive replenishment (has PAR levels, vendor-owned)
   * - DIRECT: Cannot receive replenishment (no PAR levels, no stock tracking)
   *
   * If user is at a DIRECT location, they should use Purchase Requests instead.
   */
  const userInventoryLocation = useMemo(() => {
    const location = mockInventoryLocations.find(loc => loc.id === userLocationId)
    // Only allow locations that can receive replenishment (not DIRECT)
    if (location && canReceiveTransfer(location.type)) {
      return location
    }
    return null
  }, [userLocationId])

  const isInventoryLocation = !!userInventoryLocation
  const userLocationName = userInventoryLocation?.name || user?.context?.currentLocation?.name || "Corporate Office"
  const userLocationCode = userInventoryLocation?.code || "CORP-001"

  /**
   * SOURCE LOCATION FILTERING:
   * Get valid source locations for stock replenishment.
   *
   * Business Rules:
   * - INVENTORY: Can be source (has stock balance to transfer)
   * - CONSIGNMENT: Can be source (has vendor stock, requires notification)
   * - DIRECT: Cannot be source (no stock balance exists)
   *
   * Also excludes the user's current location (can't transfer to self).
   */
  const sourceLocations = useMemo(() => {
    // getSourceLocations already filters to INVENTORY type locations
    return getSourceLocations()
      .filter(loc => loc.id !== userLocationId)
  }, [userLocationId])

  // Check if this is a PR-only workflow (no source location selected)
  const isPROnlyWorkflow = sourceLocationId === NONE_SOURCE_ID

  // Get items below par level for user's location
  const itemsBelowPar = useMemo(() => {
    return getItemsBelowParLevel(userLocationId)
  }, [userLocationId])

  // Get selected item IDs from URL query
  const selectedItemIds = useMemo(() => {
    const itemsParam = searchParams.get("items")
    return itemsParam ? new Set(itemsParam.split(",")) : new Set<string>()
  }, [searchParams])

  // Initialize request items when source location is selected
  // Only auto-populate if items were pre-selected via URL params
  // Otherwise, start with empty list and let user add items via dialog
  useEffect(() => {
    if (sourceLocationId && selectedItemIds.size > 0 && itemsBelowPar.length > 0) {
      // For PR-only workflow (None source), all items go to Purchase Request
      const isPROnly = sourceLocationId === NONE_SOURCE_ID

      // Get enriched items - for PR-only, we still need the base item data but source availability is 0
      const enrichedItems = isPROnly
        ? itemsBelowPar.map(item => ({ ...item, sourceAvailable: 0 }))
        : enrichItemsWithSourceAvailability(itemsBelowPar, sourceLocationId)

      // Filter to pre-selected items from URL
      const itemsToAdd = enrichedItems.filter(item => selectedItemIds.has(item.id))

      // Convert to request items
      const newRequestItems: RequestItem[] = itemsToAdd.map(item => {
        // For PR-only workflow, all quantities are valid and go to PR
        const requestedQty = isPROnly ? item.recommendedQty : Math.min(item.recommendedQty, item.sourceAvailable || 0)
        const isValid = isPROnly ? requestedQty > 0 : (requestedQty > 0 && requestedQty <= (item.sourceAvailable || 0))

        return {
          ...item,
          requestedQty,
          sourceAvailable: isPROnly ? 0 : (item.sourceAvailable || 0),
          isValid,
          validationError: !isValid
            ? isPROnly
              ? "Quantity must be greater than 0"
              : (item.sourceAvailable || 0) === 0
                ? "No stock available at source"
                : "Requested quantity exceeds available"
            : undefined,
          itemInfo: {
            location: userLocationName,
            locationCode: userLocationCode,
            itemName: item.productName,
            category: item.categoryName,
            subCategory: "General",
            itemGroup: "Standard",
            barCode: `885${Math.random().toString().slice(2, 12)}`
          }
        }
      })

      setRequestItems(newRequestItems)
    }
    // Note: Don't reset requestItems when source changes - user may have manually added items
  }, [sourceLocationId, itemsBelowPar, selectedItemIds, userLocationName])

  // Update requested quantity with validation
  const updateRequestedQty = (itemId: string, newQty: number) => {
    setRequestItems(prev => prev.map(item => {
      if (item.id !== itemId) return item

      const qty = Math.max(0, newQty)
      // For PR-only workflow, any positive quantity is valid (no source availability constraint)
      const isValid = isPROnlyWorkflow ? qty > 0 : (qty > 0 && qty <= item.sourceAvailable)

      return {
        ...item,
        requestedQty: qty,
        isValid,
        validationError: !isValid
          ? qty === 0
            ? "Quantity must be greater than 0"
            : isPROnlyWorkflow
              ? undefined
              : qty > item.sourceAvailable
                ? `Cannot exceed available (${item.sourceAvailable})`
                : undefined
          : undefined
      }
    }))
  }

  // Remove item from request
  const removeItem = (itemId: string) => {
    setRequestItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Toggle item expansion
  const toggleItemExpansion = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    )
  }

  // Get items available to add (below PAR but not yet in request)
  const availableItemsToAdd = useMemo(() => {
    if (!sourceLocationId) return []
    const existingIds = new Set(requestItems.map(item => item.id))
    // For PR-only workflow, show all items below PAR (no source availability needed)
    const enrichedItems = sourceLocationId === NONE_SOURCE_ID
      ? itemsBelowPar.map(item => ({ ...item, sourceAvailable: 0 }))
      : enrichItemsWithSourceAvailability(itemsBelowPar, sourceLocationId)
    return enrichedItems.filter(item => !existingIds.has(item.id))
  }, [sourceLocationId, itemsBelowPar, requestItems])

  // Toggle item selection in Add Items dialog
  const toggleBelowParItemSelection = (itemId: string) => {
    setSelectedBelowParItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Select all available items
  const selectAllAvailableItems = () => {
    setSelectedBelowParItems(new Set(availableItemsToAdd.map(item => item.id)))
  }

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedBelowParItems(new Set())
  }

  // Add selected items to request
  const handleAddSelectedItems = () => {
    if (selectedBelowParItems.size === 0) return

    const itemsToAdd = availableItemsToAdd.filter(item => selectedBelowParItems.has(item.id))

    const newItems: RequestItem[] = itemsToAdd.map(item => {
      // For PR-only workflow, all quantities are valid and go to PR
      const requestedQty = isPROnlyWorkflow ? item.recommendedQty : Math.min(item.recommendedQty, item.sourceAvailable || 0)
      const isValid = isPROnlyWorkflow ? requestedQty > 0 : (requestedQty > 0 && requestedQty <= (item.sourceAvailable || 0))

      return {
        ...item,
        requestedQty,
        sourceAvailable: isPROnlyWorkflow ? 0 : (item.sourceAvailable || 0),
        isValid,
        validationError: !isValid
          ? isPROnlyWorkflow
            ? "Quantity must be greater than 0"
            : (item.sourceAvailable || 0) === 0
              ? "No stock available at source"
              : "Requested quantity exceeds available"
          : undefined,
        itemInfo: {
          location: userLocationName,
          locationCode: userLocationCode,
          itemName: item.productName,
          category: item.categoryName,
          subCategory: "General",
          itemGroup: "Standard",
          barCode: `885${Math.random().toString().slice(2, 12)}`
        }
      }
    })

    setRequestItems(prev => [...prev, ...newItems])
    setSelectedBelowParItems(new Set())
    setShowAddItemsDialog(false)
    toast({
      title: isPROnlyWorkflow ? "Items Added for Purchase Request" : "Items Added",
      description: isPROnlyWorkflow
        ? `Added ${newItems.length} item(s) for Purchase Request generation.`
        : `Added ${newItems.length} item(s) to the request.`
    })
  }

  // Calculate totals
  const totals = useMemo(() => {
    const validItems = requestItems.filter(item => item.isValid)
    return {
      totalItems: requestItems.length,
      validItems: validItems.length,
      totalQuantity: validItems.reduce((sum, item) => sum + item.requestedQty, 0),
      invalidItems: requestItems.filter(item => !item.isValid).length
    }
  }, [requestItems])

  // Check if form is valid
  // For PR-only workflow, we don't need source location availability checks
  const isFormValid = sourceLocationId &&
    requestItems.length > 0 &&
    requestItems.every(item => item.isValid) &&
    totals.totalQuantity > 0

  // Get selected source location (null for PR-only workflow)
  const selectedSourceLocation = isPROnlyWorkflow ? null : sourceLocations.find(loc => loc.id === sourceLocationId)

  // Generate reference number (SR = Store Requisition)
  const generateRefNo = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `SR-${year}${month}-${randomNum}`
  }

  const refNo = useMemo(() => generateRefNo(), [])
  const today = new Date().toISOString().split('T')[0]
  const expectedDelivery = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast({
      title: isPROnlyWorkflow ? "Purchase Request Created" : "Store Requisition Created",
      description: isPROnlyWorkflow
        ? `${refNo} submitted for approval. ${totals.validItems} items will generate Purchase Requests.`
        : `${refNo} submitted for approval. ${totals.validItems} items requested.`,
    })

    setIsSubmitting(false)
    router.push("/store-operations/store-requisitions")
  }

  // Handle save draft
  const handleSaveDraft = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast({
      title: "Draft Saved",
      description: `Store requisition ${refNo} has been saved as draft.`,
    })

    setIsSubmitting(false)
    router.push("/store-operations/store-requisitions")
  }

  return (
    <div className="w-full px-0 py-6">
      <div className="flex gap-4">
        {/* Main Content */}
        <div className={`transition-all duration-300 ${isSidePanelOpen ? 'flex-1' : 'w-full'}`}>
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-6 pb-4 bg-muted/30 border-b space-y-6">
              {/* Top Actions */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.back()}
                      aria-label="Go back"
                      className="focus:ring-2 focus:ring-primary/20 flex-shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-3 min-w-0">
                      <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                        {isPROnlyWorkflow ? "New Purchase Request" : "New Stock Replenishment"}
                      </CardTitle>
                      {isPROnlyWorkflow ? (
                        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          PR Mode
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Draft</Badge>
                      )}
                      <PriorityBadge priority={priority} />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2 border-muted-foreground/20 hover:bg-muted/50"
                      disabled={!isFormValid || isSubmitting}
                      onClick={handleSaveDraft}
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSubmitting ? "Saving..." : "Save Draft"}</span>
                    </Button>
                    <Button
                      className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                      disabled={!isFormValid || isSubmitting}
                      onClick={handleSubmit}
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
                    </Button>

                    {/* Side Panel Toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0 border-muted-foreground/20 hover:bg-muted/50"
                      onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                    >
                      {isSidePanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Header Information - Three Row Layout */}
              <div className="space-y-4 sm:space-y-6">
                {/* First Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="w-4 h-4" />
                      <span>Reference No.</span>
                    </div>
                    <p className="font-semibold text-muted-foreground">{refNo} (Auto-generated)</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Request Date</span>
                    </div>
                    <p className="font-semibold">{today}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Expected Delivery</span>
                    </div>
                    <Input type="date" defaultValue={expectedDelivery} className="h-8" />
                  </div>
                </div>

                {/* Second Row - Transfer Flow */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {/*
                    SOURCE LOCATION SELECTION:
                    Only locations that can be transfer sources are shown.
                    - INVENTORY: Standard source with full tracking
                    - CONSIGNMENT: Vendor-owned, requires notification
                    - DIRECT: Filtered out (no stock to transfer)
                  */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Warehouse className="w-4 h-4" />
                      <span>From (Source) *</span>
                    </div>
                    <Select value={sourceLocationId} onValueChange={setSourceLocationId}>
                      <SelectTrigger className={`h-9 ${isPROnlyWorkflow ? 'border-orange-300 bg-orange-50' : ''}`}>
                        <SelectValue placeholder="Select source location" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* None option for PR-only workflow */}
                        <SelectItem value={NONE_SOURCE_ID} className="text-orange-600 font-medium">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-orange-600" />
                            <span>None (Generate Purchase Request Only)</span>
                          </div>
                        </SelectItem>
                        <Separator className="my-1" />
                        {sourceLocations.map(loc => (
                          <SelectItem key={loc.id} value={loc.id}>
                            <div className="flex items-center gap-2">
                              {/* All source locations are INVENTORY type */}
                              <Package className="h-4 w-4 text-blue-600" />
                              <span>{loc.code} : {loc.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isPROnlyWorkflow && (
                      <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                        <ShoppingCart className="h-3 w-3" />
                        All items will generate Purchase Requests
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>

                  {/*
                    DESTINATION LOCATION:
                    Fixed to user's current location (must be INVENTORY or CONSIGNMENT).
                    Shows location type badge for clarity.
                  */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>To (Destination)</span>
                    </div>
                    <div className="flex items-center gap-2 h-9 px-3 border rounded-md bg-muted/50">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{userLocationCode} : {userLocationName}</span>
                      {userInventoryLocation && (
                        <LocationTypeBadge
                          locationType={userInventoryLocation.type}
                          size="sm"
                          showIcon={false}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Third Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Requested By</span>
                    </div>
                    <p className="font-semibold">{userName}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>Department</span>
                    </div>
                    <p className="font-semibold">{userDepartment}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Priority</span>
                    </div>
                    <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Standard
                          </div>
                        </SelectItem>
                        <SelectItem value="urgent">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            Urgent
                          </div>
                        </SelectItem>
                        <SelectItem value="emergency">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            Emergency
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>Description / Notes</span>
                  </div>
                  <Textarea
                    placeholder="Add any special instructions or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>

              <Separator className="my-4" />
            </CardHeader>

            {/* Tabs */}
            <Tabs defaultValue="items" className="w-full">
              <CardHeader className="pb-0 pt-4 px-4">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="items" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Items
                  </TabsTrigger>
                  <TabsTrigger value="stock-info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Stock Info
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-0">
                <div className="w-full rounded-b-md border-t">
                  <div className="p-6">
                    {/* Items Tab */}
                    <TabsContent value="items" className="mt-0">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">Requisition Items</h3>
                            <Badge variant="secondary">{requestItems.length} items</Badge>
                          </div>
                          {sourceLocationId && (
                            <Dialog open={showAddItemsDialog} onOpenChange={setShowAddItemsDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  disabled={availableItemsToAdd.length === 0}
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Items
                                  {availableItemsToAdd.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                                      {availableItemsToAdd.length}
                                    </Badge>
                                  )}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Add Items Below PAR Level</DialogTitle>
                                  <DialogDescription>
                                    Select items from your location that are below PAR level to add to this requisition.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {/* Selection controls */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Button variant="ghost" size="sm" onClick={selectAllAvailableItems}>
                                        Select All
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={clearAllSelections}>
                                        Clear All
                                      </Button>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {selectedBelowParItems.size} of {availableItemsToAdd.length} selected
                                    </span>
                                  </div>

                                  {/* Items list */}
                                  <ScrollArea className="h-[400px] border rounded-md">
                                    <div className="p-4 space-y-2">
                                      {availableItemsToAdd.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                          <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
                                          <p className="font-medium">All items below PAR have been added</p>
                                        </div>
                                      ) : (
                                        availableItemsToAdd.map(item => {
                                          const parPercent = Math.round((item.currentStock / item.parLevel) * 100)
                                          return (
                                            <div
                                              key={item.id}
                                              className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                                                selectedBelowParItems.has(item.id) ? 'bg-blue-50 border-blue-200' : ''
                                              }`}
                                              onClick={() => toggleBelowParItemSelection(item.id)}
                                            >
                                              <Checkbox
                                                checked={selectedBelowParItems.has(item.id)}
                                                onCheckedChange={() => toggleBelowParItemSelection(item.id)}
                                              />
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-medium truncate">{item.productName}</span>
                                                  <Badge
                                                    variant="outline"
                                                    className={
                                                      parPercent < 30 ? 'bg-red-100 text-red-700 border-red-200' :
                                                      parPercent < 60 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                      'bg-green-100 text-green-700 border-green-200'
                                                    }
                                                  >
                                                    {parPercent}% PAR
                                                  </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                  {item.productCode} • {item.categoryName}
                                                </p>
                                              </div>
                                              <div className="text-right text-sm">
                                                <p className="font-medium text-red-600">
                                                  Shortage: {formatNumber(item.recommendedQty)} {item.unit}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  Available: {formatNumber(item.sourceAvailable || 0)} {item.unit}
                                                </p>
                                              </div>
                                            </div>
                                          )
                                        })
                                      )}
                                    </div>
                                  </ScrollArea>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setShowAddItemsDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleAddSelectedItems}
                                    disabled={selectedBelowParItems.size === 0}
                                  >
                                    Add {selectedBelowParItems.size} Item{selectedBelowParItems.size !== 1 ? 's' : ''}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>

                        {/* Warning if no source selected */}
                        {!sourceLocationId ? (
                          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
                            <Warehouse className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">Select a source location first</p>
                            <p className="text-sm">Choose where to request items from</p>
                          </div>
                        ) : requestItems.length === 0 ? (
                          <div className="text-center py-12 border rounded-lg bg-muted/20">
                            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No items added yet</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              {availableItemsToAdd.length > 0
                                ? `${availableItemsToAdd.length} item(s) below PAR level available to add`
                                : "All items are at par level - no replenishment needed"}
                            </p>
                            {availableItemsToAdd.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAddItemsDialog(true)}
                                className="gap-1"
                              >
                                <Plus className="h-4 w-4" />
                                Add Items Below PAR
                              </Button>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Items Table */}
                            <div className="border rounded-lg overflow-x-auto">
                              <table className="w-full min-w-[800px]">
                                <thead>
                                  <tr className="border-b bg-gray-50">
                                    <th className="text-left p-3 text-xs font-medium text-gray-500 w-10"></th>
                                    <th className="text-left p-3 text-xs font-medium text-gray-500 min-w-[180px]">Product</th>
                                    <th className="text-left p-3 text-xs font-medium text-gray-500">Unit</th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-500">Current</th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-500">PAR</th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-500">
                                      {isPROnlyWorkflow ? "Source" : "Available"}
                                    </th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-500">Recommended</th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-500 w-[120px]">Request Qty *</th>
                                    <th className="text-center p-3 text-xs font-medium text-gray-500">
                                      {isPROnlyWorkflow ? "Document" : "Status"}
                                    </th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-500 w-[60px]"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {requestItems.map((item) => (
                                    <React.Fragment key={item.id}>
                                      <tr className={`group hover:bg-gray-50 ${!item.isValid ? 'bg-red-50' : ''}`}>
                                        <td className="p-3">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleItemExpansion(item.id)}
                                            className="p-1 h-6 w-6"
                                          >
                                            <ChevronRight className={`h-4 w-4 transition-transform ${expandedItems.includes(item.id) ? 'rotate-90' : ''}`} />
                                          </Button>
                                        </td>
                                        <td className="p-3">
                                          <div className="space-y-1">
                                            <p className="font-medium text-gray-700 text-sm">{item.productName}</p>
                                            <p className="text-xs text-gray-500">{item.productCode}</p>
                                          </div>
                                        </td>
                                        <td className="p-3 text-sm">{item.unit}</td>
                                        <td className="p-3 text-right">
                                          <span className={`text-sm tabular-nums ${item.currentStock < item.parLevel * 0.3 ? 'text-red-600 font-medium' : ''}`}>
                                            {formatNumber(item.currentStock)}
                                          </span>
                                        </td>
                                        <td className="p-3 text-right text-sm tabular-nums">{formatNumber(item.parLevel)}</td>
                                        <td className="p-3 text-right">
                                          {isPROnlyWorkflow ? (
                                            <span className="text-sm tabular-nums text-orange-600 font-medium">
                                              None (PR)
                                            </span>
                                          ) : (
                                            <span className={`text-sm tabular-nums ${item.sourceAvailable === 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                              {formatNumber(item.sourceAvailable)}
                                            </span>
                                          )}
                                        </td>
                                        <td className="p-3 text-right">
                                          <span className="text-sm tabular-nums text-green-600 font-medium">
                                            +{formatNumber(item.recommendedQty)}
                                          </span>
                                        </td>
                                        <td className="p-3 text-right">
                                          <div className="flex flex-col items-end gap-1">
                                            <Input
                                              type="number"
                                              min={0}
                                              max={item.sourceAvailable}
                                              value={item.requestedQty}
                                              onChange={(e) => updateRequestedQty(item.id, parseInt(e.target.value) || 0)}
                                              className={`w-[90px] h-8 text-right text-sm ${!item.isValid ? "border-red-500" : ""}`}
                                            />
                                            {item.validationError && (
                                              <span className="text-xs text-red-500 max-w-[90px] text-right">{item.validationError}</span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="p-3 text-center">
                                          {isPROnlyWorkflow ? (
                                            item.isValid ? (
                                              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs gap-1">
                                                <ShoppingCart className="h-3 w-3" />
                                                PR
                                              </Badge>
                                            ) : (
                                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs">Invalid</Badge>
                                            )
                                          ) : item.isValid ? (
                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">Valid</Badge>
                                          ) : (
                                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs">Invalid</Badge>
                                          )}
                                        </td>
                                        <td className="p-3 text-right">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                            onClick={() => removeItem(item.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </td>
                                      </tr>

                                      {/* Expanded Row - Item Details */}
                                      {expandedItems.includes(item.id) && (
                                        <tr className="bg-blue-50/50">
                                          <td colSpan={10} className="p-4">
                                            <div className="grid grid-cols-3 gap-6 text-sm">
                                              <div className="space-y-3">
                                                <h4 className="font-semibold text-gray-700">Item Information</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">Category</p>
                                                    <p className="font-medium">{item.categoryName}</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">Sub Category</p>
                                                    <p className="font-medium">{item.itemInfo.subCategory}</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">Item Group</p>
                                                    <p className="font-medium">{item.itemInfo.itemGroup}</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">Barcode</p>
                                                    <p className="font-medium font-mono text-xs">{item.itemInfo.barCode}</p>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="space-y-3">
                                                <h4 className="font-semibold text-gray-700">Stock Analysis</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">Stock Level</p>
                                                    <p className="font-medium">{Math.round((item.currentStock / item.parLevel) * 100)}% of PAR</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">Shortage</p>
                                                    <p className="font-medium text-red-600">{formatNumber(item.parLevel - item.currentStock)} {item.unit}</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">Can Fulfill</p>
                                                    <p className={`font-medium ${item.sourceAvailable >= item.recommendedQty ? 'text-green-600' : 'text-amber-600'}`}>
                                                      {item.sourceAvailable >= item.recommendedQty ? 'Yes' : 'Partial'}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">Max Available</p>
                                                    <p className="font-medium text-blue-600">{formatNumber(item.sourceAvailable)} {item.unit}</p>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="space-y-3">
                                                <h4 className="font-semibold text-gray-700">Stock Impact</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">Current Stock</p>
                                                    <p className="font-medium">{formatNumber(item.currentStock)} {item.unit}</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">After Transfer</p>
                                                    <p className="font-medium text-green-600">{formatNumber(item.currentStock + item.requestedQty)} {item.unit}</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">Target PAR</p>
                                                    <p className="font-medium">{formatNumber(item.parLevel)} {item.unit}</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-muted-foreground text-xs">PAR Fulfillment</p>
                                                    <p className={`font-medium ${(item.currentStock + item.requestedQty) >= item.parLevel ? 'text-green-600' : 'text-amber-600'}`}>
                                                      {Math.round(((item.currentStock + item.requestedQty) / item.parLevel) * 100)}%
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Transaction Summary */}
                            <div className="flex justify-end">
                              <div className="w-full md:w-80 space-y-2 p-4 bg-muted/30 rounded-lg border">
                                <h4 className="font-semibold mb-3">Request Summary</h4>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Total Items:</span>
                                  <span className="font-medium tabular-nums">{totals.totalItems}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Valid Items:</span>
                                  <span className="font-medium text-green-600 tabular-nums">{totals.validItems}</span>
                                </div>
                                {totals.invalidItems > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Invalid Items:</span>
                                    <span className="font-medium text-red-600 tabular-nums">{totals.invalidItems}</span>
                                  </div>
                                )}
                                <Separator className="my-2" />
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Total Quantity:</span>
                                  <span className="font-medium tabular-nums">{formatNumber(totals.totalQuantity)} units</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </TabsContent>

                    {/* Stock Info Tab */}
                    <TabsContent value="stock-info" className="mt-0">
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Stock Level Analysis</h3>

                        {!sourceLocationId ? (
                          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
                            <Warehouse className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">Select a source location first</p>
                            <p className="text-sm">Stock analysis will be shown after selecting source</p>
                          </div>
                        ) : requestItems.length === 0 ? (
                          <div className="text-center py-12 border rounded-lg bg-green-50">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                            <p className="font-medium">All items are at par level!</p>
                            <p className="text-sm text-muted-foreground">
                              No items need replenishment at this time.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="grid md:grid-cols-4 gap-4">
                              <Card className="border-red-200 bg-red-50">
                                <CardContent className="pt-4">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    <span className="text-sm text-red-700">Below 30% PAR</span>
                                  </div>
                                  <p className="text-2xl font-bold text-red-600 mt-2">
                                    {requestItems.filter(i => (i.currentStock / i.parLevel) < 0.3).length}
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="border-amber-200 bg-amber-50">
                                <CardContent className="pt-4">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    <span className="text-sm text-amber-700">30-60% PAR</span>
                                  </div>
                                  <p className="text-2xl font-bold text-amber-600 mt-2">
                                    {requestItems.filter(i => (i.currentStock / i.parLevel) >= 0.3 && (i.currentStock / i.parLevel) < 0.6).length}
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="border-green-200 bg-green-50">
                                <CardContent className="pt-4">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="text-sm text-green-700">Above 60% PAR</span>
                                  </div>
                                  <p className="text-2xl font-bold text-green-600 mt-2">
                                    {requestItems.filter(i => (i.currentStock / i.parLevel) >= 0.6).length}
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="border-blue-200 bg-blue-50">
                                <CardContent className="pt-4">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm text-blue-700">Total Items</span>
                                  </div>
                                  <p className="text-2xl font-bold text-blue-600 mt-2">{requestItems.length}</p>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Stock Level Table */}
                            <div className="border rounded-lg overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b bg-gray-50">
                                    <th className="text-left p-3 text-xs font-medium text-gray-500">Product</th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-500">Current Stock</th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-500">PAR Level</th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-500">Shortage</th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-500">Stock %</th>
                                    <th className="text-right p-3 text-xs font-medium text-gray-500">Source Available</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {requestItems.map((item) => {
                                    const stockPercent = Math.round((item.currentStock / item.parLevel) * 100)
                                    const shortage = item.parLevel - item.currentStock
                                    return (
                                      <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="p-3">
                                          <div>
                                            <p className="font-medium text-sm">{item.productName}</p>
                                            <p className="text-xs text-muted-foreground">{item.productCode}</p>
                                          </div>
                                        </td>
                                        <td className="p-3 text-right">
                                          <span className={`text-sm tabular-nums ${item.currentStock < item.parLevel * 0.3 ? 'text-red-600 font-medium' : ''}`}>
                                            {formatNumber(item.currentStock)} {item.unit}
                                          </span>
                                        </td>
                                        <td className="p-3 text-right text-sm tabular-nums">{formatNumber(item.parLevel)} {item.unit}</td>
                                        <td className="p-3 text-right">
                                          <span className="text-sm tabular-nums text-red-600 font-medium">
                                            -{formatNumber(shortage)} {item.unit}
                                          </span>
                                        </td>
                                        <td className="p-3 text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                              <div
                                                className={`h-full rounded-full ${stockPercent < 30 ? 'bg-red-500' : stockPercent < 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                                                style={{ width: `${Math.min(stockPercent, 100)}%` }}
                                              />
                                            </div>
                                            <span className="text-sm tabular-nums w-10 text-right">{stockPercent}%</span>
                                          </div>
                                        </td>
                                        <td className="p-3 text-right">
                                          <span className={`text-sm tabular-nums ${item.sourceAvailable >= shortage ? 'text-green-600' : 'text-amber-600'}`}>
                                            {formatNumber(item.sourceAvailable)} {item.unit}
                                          </span>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </div>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Side Panel */}
        {isSidePanelOpen && (
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Requisition/PR Summary Card */}
              <Card className={isPROnlyWorkflow ? "border-orange-200" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {isPROnlyWorkflow ? (
                      <>
                        <ShoppingCart className="h-4 w-4 text-orange-600" />
                        <span className="text-orange-700">Purchase Request Summary</span>
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4" />
                        Requisition Summary
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">From:</span>
                      <span className={`font-medium ${isPROnlyWorkflow ? 'text-orange-600' : ''}`}>
                        {isPROnlyWorkflow ? "None (PR Only)" : (selectedSourceLocation?.name || "-")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">{userLocationName}</span>
                    </div>
                    {isPROnlyWorkflow && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Document Type:</span>
                        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                          Purchase Request
                        </Badge>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Items:</span>
                      <span className="font-medium">{totals.totalItems}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Quantity:</span>
                      <span className="font-medium">{formatNumber(totals.totalQuantity)} units</span>
                    </div>
                    {totals.invalidItems > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Invalid Items:</span>
                        <span className="font-medium">{totals.invalidItems}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comments Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments (0)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center py-2">No comments yet</p>
                  <div className="pt-2">
                    <Textarea
                      placeholder="Add a comment..."
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="text-sm"
                    />
                    <Button size="sm" className="mt-2 w-full" disabled={!newComment.trim()}>
                      Add Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Attachments Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attachments (0)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center py-2">No attachments yet</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Attachment
                  </Button>
                </CardContent>
              </Card>

              {/* Validation Warning */}
              {totals.invalidItems > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Validation Required</p>
                        <p className="text-sm text-red-700">
                          {totals.invalidItems} item(s) have validation errors. Please fix them before submitting.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Low Stock Warning */}
              {requestItems.some(item => (item.currentStock / item.parLevel) < 0.3) && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Low Stock Alert</p>
                        <p className="text-sm text-amber-700">
                          {requestItems.filter(i => (i.currentStock / i.parLevel) < 0.3).length} items are below 30% PAR level.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* PR-Only Workflow Info */}
              {isPROnlyWorkflow && requestItems.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <ShoppingCart className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-800">Purchase Request Mode</p>
                        <p className="text-sm text-orange-700">
                          All {totals.validItems} item(s) will generate Purchase Requests. No internal stock transfer will occur.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NewStoreRequisitionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <NewStoreRequisitionPageContent />
    </Suspense>
  )
}
