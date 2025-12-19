/**
 * Store Requisition - New Request Page
 *
 * Creates new store requisitions to request materials from stores/warehouses.
 *
 * SUPPORTED WORKFLOWS:
 * - STORE_TO_STORE: Transfer between inventory locations (generates Stock Transfer)
 * - MAIN_STORE: Transfer from main warehouse (generates Stock Transfer)
 * - DIRECT_ISSUE: Issue to direct/expense locations (generates Stock Issue)
 * - TRANSFER_INTERNAL: Internal transfers between locations (generates Stock Transfer)
 *
 * GENERATED DOCUMENTS:
 * - Stock Transfer (ST): Moves stock between inventory locations
 * - Stock Issue (SI): Issues stock to expense/direct locations
 *
 * NOTE: Purchase Request (PR) generation was removed from Store Requisitions.
 * PR workflow is now exclusively handled via Stock Replenishment module.
 * This simplifies the SR workflow to focus on internal stock movements only.
 *
 * LOCATION TYPE HANDLING:
 * The issue process handles items differently based on the destination location type:
 *
 * - INVENTORY: Standard requisition process
 *   - Items will be tracked and costed using FIFO
 *   - Creates inventory transaction on issue
 *   - GL: Debit Department Expense, Credit Inventory Asset
 *
 * - DIRECT: Simplified requisition (items already expensed on receipt)
 *   - No stock balance tracking
 *   - Records for operational metrics only
 *   - GL: No additional journal entry needed
 *
 * - CONSIGNMENT: Vendor-owned requisition
 *   - Items tracked under vendor ownership
 *   - Vendor notification required on issue
 *   - GL: Debit Department Expense, Credit Consignment Liability
 */

"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  ChevronLeft,
  MapPin,
  Package,
  Save,
  Send,
  Trash2,
  User,
  Building2,
  Calendar,
  Hash,
  FileText,
  Plus,
  X,
  MessageSquare,
  Paperclip,
  PanelRightClose,
  PanelRightOpen,
  Check,
  ChevronsUpDown,
  Search
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSimpleUser } from "@/lib/context/simple-user-context"
import { mockInventoryLocations } from "@/lib/mock-data"
import { mockUserLocationAssignments } from "@/lib/mock-data/inventory-locations"
import { mockProducts } from "@/lib/mock-data/products"
import { mockDepartments } from "@/lib/mock-data"
import { InventoryLocationType } from "@/lib/types/location-management"
import { getLocationTypeLabel } from "@/lib/utils/location-type-helpers"
import { LocationTypeBadge } from "@/components/location-type-badge"
import { formatNumber, formatCurrency } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils"
import { stockAvailabilityService } from "@/lib/services/store-operations/stock-availability-service"
import { workflowBypassService } from "@/lib/services/store-operations/workflow-bypass-service"
import { SRWorkflowType, GeneratedDocumentType, SRLineItemFulfillment, StockAvailabilityResult } from "@/lib/types/store-requisition"

import { AlertCircle, ArrowRight, AlertTriangle, CheckCircle2, Truck, FileOutput } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ItemInfo {
  // location, locationCode, locationType removed - now at document level
  itemName: string
  category: string
  subCategory: string
  itemGroup: string
  barCode: string
}

interface InventoryInfo {
  onHand: number
  onOrder: number
  lastPrice: number
  lastVendor: string
}

interface RequisitionItem {
  id: number
  productId: string
  description: string
  unit: string
  qtyRequired: number
  costPerUnit: number
  total: number
  requestDate: string
  inventory: InventoryInfo
  itemInfo: ItemInfo
  // Business Dimensions - item level
  jobCodeId: string
  projectId: string
  // Stock availability and fulfillment
  sourceAvailableQty: number
  fulfillment: SRLineItemFulfillment
}

interface JobCode {
  id: string
  code: string
  name: string
  description: string
  isActive: boolean
}

interface Project {
  id: string
  code: string
  name: string
  description: string
  isActive: boolean
}

// Mock Job Codes
const initialJobCodes: JobCode[] = [
  { id: 'job-001', code: 'N/A', name: 'Not Available', description: 'No specific job code assigned', isActive: true },
  { id: 'job-002', code: 'EVT-001', name: 'Monthly Event', description: 'Regular monthly events and functions', isActive: true },
  { id: 'job-003', code: 'EVT-002', name: 'Special Occasion', description: 'Special events like weddings, conferences', isActive: true },
  { id: 'job-004', code: 'MAINT-001', name: 'Routine Maintenance', description: 'Regular maintenance activities', isActive: true },
  { id: 'job-005', code: 'MAINT-002', name: 'Emergency Repair', description: 'Urgent repair and maintenance', isActive: true },
]

// Mock Projects
const initialProjects: Project[] = [
  { id: 'proj-001', code: 'GEN', name: 'General Operations', description: 'Day-to-day operational expenses', isActive: true },
  { id: 'proj-002', code: 'REN-2024', name: 'Renovation 2024', description: '2024 property renovation project', isActive: true },
  { id: 'proj-003', code: 'EXP-Q1', name: 'Q1 Expansion', description: 'First quarter expansion initiative', isActive: true },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewStoreRequisitionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useSimpleUser()

  // Form state
  const [requestFromId, setRequestFromId] = useState("")
  const [description, setDescription] = useState("")
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default: 7 days from now
  )
  const [departmentId, setDepartmentId] = useState(user?.context?.currentDepartment?.id || "")
  const [items, setItems] = useState<RequisitionItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [newComment, setNewComment] = useState("")

  // Inline Add Item state (same pattern as edit mode)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItemProductId, setNewItemProductId] = useState("")
  const [newItemQty, setNewItemQty] = useState(1)
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [newItemJobCodeId, setNewItemJobCodeId] = useState("job-001")
  const [newItemProjectId, setNewItemProjectId] = useState("proj-001")

  // CRUD state for Job Codes and Projects
  const [jobCodes, setJobCodes] = useState<JobCode[]>(initialJobCodes)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [showAddJobCodeDialog, setShowAddJobCodeDialog] = useState(false)
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false)
  const [newJobCode, setNewJobCode] = useState({ code: '', name: '', description: '' })
  const [newProject, setNewProject] = useState({ code: '', name: '', description: '' })

  // Get user's current location (destination for items)
  const defaultUserLocationId = user?.context?.currentLocation?.id || "loc-006"
  const userName = user?.name || "John Doe"
  const userDepartment = user?.context?.currentDepartment?.name || "Administration"

  // State for destination location (user can change from their assigned locations)
  const [destinationLocationId, setDestinationLocationId] = useState(defaultUserLocationId)

  // Get user's assigned locations for destination selection
  const currentUserId = user?.id || 'user-default-001'
  const userAssignedLocationIds = useMemo(() => {
    return mockUserLocationAssignments
      .filter(ua => ua.userId === currentUserId && ua.isActive)
      .map(ua => ua.locationId)
  }, [currentUserId])

  const userAssignedLocations = useMemo(() => {
    return mockInventoryLocations.filter(
      loc => userAssignedLocationIds.includes(loc.id) && loc.status === 'active'
    )
  }, [userAssignedLocationIds])

  // Get selected destination location details
  const userInventoryLocation = useMemo(() => {
    return mockInventoryLocations.find(loc => loc.id === destinationLocationId)
  }, [destinationLocationId])

  const userLocationName = userInventoryLocation?.name || user?.context?.currentLocation?.name || "Corporate Office"
  const userLocationCode = userInventoryLocation?.code || "CORP-001"
  const userLocationType = userInventoryLocation?.type || InventoryLocationType.INVENTORY

  // Get available source locations (stores/warehouses to request FROM)
  const sourceLocations = useMemo(() => {
    return mockInventoryLocations.filter(loc =>
      loc.status === 'active' &&
      loc.id !== destinationLocationId &&
      (loc.type === InventoryLocationType.INVENTORY || loc.type === InventoryLocationType.CONSIGNMENT)
    )
  }, [destinationLocationId])

  // Selected source location
  const selectedSourceLocation = useMemo(() => {
    return sourceLocations.find(loc => loc.id === requestFromId)
  }, [sourceLocations, requestFromId])

  // Get active products for inline search (Command component handles filtering)
  const activeProducts = useMemo(() => {
    return mockProducts.filter(p => p.isActive && p.status === 'active')
  }, [])

  // Selected product
  const selectedProduct = useMemo(() => {
    return mockProducts.find(p => p.id === newItemProductId)
  }, [newItemProductId])

  // Generate new requisition number - use stable value to avoid hydration mismatch
  const newRequisitionNumber = useMemo(() => {
    const now = new Date()
    const yy = now.getFullYear().toString().slice(-2)
    const mm = (now.getMonth() + 1).toString().padStart(2, '0')
    // Use a sequential number pattern for demo (would be from backend in real app)
    return `SR-${yy}${mm}-NEW`
  }, [])

  // Calculate totals
  const { subtotal, itemCount } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    return { subtotal, itemCount: items.length }
  }, [items])

  // Determine workflow type based on source and destination locations
  // NOTE: PR-only workflow (NONE_SOURCE_ID) was removed - PR generation now handled via Stock Replenishment
  const workflowType = useMemo((): SRWorkflowType | null => {
    if (!requestFromId) return null
    if (!selectedSourceLocation) return null

    // Check if source is main warehouse
    const isMainWarehouse = requestFromId === stockAvailabilityService.getMainWarehouseId()

    // If destination is DIRECT type, it's a direct issue
    if (userLocationType === InventoryLocationType.DIRECT) {
      return SRWorkflowType.DIRECT_ISSUE
    }

    // If source is main warehouse, it's a main store transfer
    if (isMainWarehouse) {
      return SRWorkflowType.MAIN_STORE
    }

    // If both are inventory locations (not main warehouse), it's store-to-store
    if (
      selectedSourceLocation.type === InventoryLocationType.INVENTORY &&
      userLocationType === InventoryLocationType.INVENTORY
    ) {
      return SRWorkflowType.STORE_TO_STORE
    }

    // Default to internal transfer
    return SRWorkflowType.TRANSFER_INTERNAL
  }, [requestFromId, selectedSourceLocation, userLocationType])

  // Check if this workflow bypasses approval
  const bypassesApproval = useMemo(() => {
    if (!workflowType) return false
    return workflowBypassService.shouldBypassApproval(
      workflowType,
      selectedSourceLocation?.type || InventoryLocationType.INVENTORY,
      userLocationType
    )
  }, [workflowType, selectedSourceLocation, userLocationType])

  // Calculate fulfillment summary
  const fulfillmentSummary = useMemo(() => {
    const summary = {
      totalItems: items.length,
      fromStock: 0,
      toPurchase: 0,
      stockTransferQty: 0,
      stockIssueQty: 0,
      purchaseRequestQty: 0,
      fullyFulfillable: 0,
      partiallyFulfillable: 0,
      requiresPurchase: 0
    }

    for (const item of items) {
      summary.fromStock += item.fulfillment.fromStock
      summary.toPurchase += item.fulfillment.toPurchase

      if (item.fulfillment.documentType === GeneratedDocumentType.STOCK_TRANSFER) {
        summary.stockTransferQty += item.fulfillment.fromStock
      } else if (item.fulfillment.documentType === GeneratedDocumentType.STOCK_ISSUE) {
        summary.stockIssueQty += item.fulfillment.fromStock
      }
      summary.purchaseRequestQty += item.fulfillment.toPurchase

      if (item.fulfillment.toPurchase === 0 && item.fulfillment.fromStock > 0) {
        summary.fullyFulfillable++
      } else if (item.fulfillment.fromStock > 0 && item.fulfillment.toPurchase > 0) {
        summary.partiallyFulfillable++
      } else if (item.fulfillment.toPurchase > 0) {
        summary.requiresPurchase++
      }
    }

    return summary
  }, [items])

  // Get workflow type display label
  // NOTE: "Purchase Request Only" case was removed - PR workflow moved to Stock Replenishment
  const getWorkflowTypeLabel = (type: SRWorkflowType | null): string => {
    switch (type) {
      case SRWorkflowType.STORE_TO_STORE:
        return 'Store-to-Store Transfer'
      case SRWorkflowType.MAIN_STORE:
        return 'Main Store Transfer'
      case SRWorkflowType.DIRECT_ISSUE:
        return 'Direct Issue'
      case SRWorkflowType.TRANSFER_INTERNAL:
        return 'Internal Transfer'
      default:
        return 'Select Source'
    }
  }

  // Get workflow type badge color
  // NOTE: Pink/rose styling for PR-only workflow was removed
  const getWorkflowTypeBadgeClass = (type: SRWorkflowType | null): string => {
    switch (type) {
      case SRWorkflowType.STORE_TO_STORE:
        return 'bg-green-100 text-green-800 border-green-200'
      case SRWorkflowType.MAIN_STORE:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case SRWorkflowType.DIRECT_ISSUE:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case SRWorkflowType.TRANSFER_INTERNAL:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Lookups
  const selectedDepartment = mockDepartments.find(d => d.id === departmentId)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Inline Add Item handlers (same pattern as edit mode)
  const handleStartAddItem = () => {
    setIsAddingItem(true)
    setNewItemProductId('')
    setNewItemQty(1)
  }

  const handleCancelAddItem = () => {
    setIsAddingItem(false)
    setNewItemProductId('')
    setNewItemQty(1)
  }

  const handleConfirmAddItem = async () => {
    if (!selectedProduct || newItemQty <= 0 || !requestFromId) return

    const costPerUnit = selectedProduct.standardCost?.amount || 0

    // Check stock availability at source location
    const availability = await stockAvailabilityService.checkStockAvailability(
      selectedProduct.id,
      newItemQty,
      requestFromId,
      destinationLocationId
    )

    // Calculate fulfillment based on destination type
    const fulfillment = stockAvailabilityService.calculateFulfillment(
      availability,
      userLocationType
    )

    const newItem: RequisitionItem = {
      id: items.length + 1,
      productId: selectedProduct.id,
      description: selectedProduct.productName,
      unit: selectedProduct.baseUnit,
      qtyRequired: newItemQty,
      costPerUnit: costPerUnit,
      total: costPerUnit * newItemQty,
      requestDate: expectedDate,
      inventory: {
        onHand: availability.availableQty,
        onOrder: 0,
        lastPrice: costPerUnit,
        lastVendor: 'Various Suppliers'
      },
      itemInfo: {
        // location, locationCode, locationType removed - now at document level
        itemName: selectedProduct.productName,
        category: selectedProduct.categoryId || 'General',
        subCategory: 'General',
        itemGroup: 'Standard',
        barCode: `885${Date.now().toString().slice(-10)}`
      },
      // Business Dimensions - item level
      jobCodeId: newItemJobCodeId,
      projectId: newItemProjectId,
      // Stock availability and fulfillment
      sourceAvailableQty: availability.availableQty,
      fulfillment: fulfillment
    }

    setItems([...items, newItem])
    setIsAddingItem(false)
    setNewItemProductId('')
    setNewItemQty(1)
    setNewItemJobCodeId('job-001')
    setNewItemProjectId('proj-001')

    // Show toast for item added
    toast({
      title: "Item Added",
      description: `${selectedProduct.productName} added to requisition (${fulfillment.fromStock} available)`
    })
  }

  const handleRemoveItem = (itemId: number) => {
    setItems(items.filter(item => item.id !== itemId))
    toast({
      title: "Item Removed",
      description: "Item removed from requisition"
    })
  }

  const handleUpdateQty = async (itemId: number, newQty: number) => {
    if (newQty <= 0) return

    const item = items.find(i => i.id === itemId)
    if (!item || !requestFromId) return

    // Recalculate stock availability for new quantity
    const availability = await stockAvailabilityService.checkStockAvailability(
      item.productId,
      newQty,
      requestFromId,
      destinationLocationId
    )

    // Recalculate fulfillment
    const fulfillment = stockAvailabilityService.calculateFulfillment(
      availability,
      userLocationType
    )

    setItems(items.map(i => {
      if (i.id === itemId) {
        return {
          ...i,
          qtyRequired: newQty,
          total: i.costPerUnit * newQty,
          sourceAvailableQty: availability.availableQty,
          fulfillment: fulfillment
        }
      }
      return i
    }))
  }

  // Recalculate all items when source location changes
  const recalculateAllItems = async (newSourceId: string) => {
    if (items.length === 0) return

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const availability = await stockAvailabilityService.checkStockAvailability(
          item.productId,
          item.qtyRequired,
          newSourceId,
          destinationLocationId
        )
        const fulfillment = stockAvailabilityService.calculateFulfillment(
          availability,
          userLocationType
        )
        return {
          ...item,
          sourceAvailableQty: availability.availableQty,
          inventory: {
            ...item.inventory,
            onHand: availability.availableQty
          },
          fulfillment: fulfillment
        }
      })
    )

    setItems(updatedItems)
  }

  // Handle source location change
  const handleSourceLocationChange = (newSourceId: string) => {
    setRequestFromId(newSourceId)
    if (items.length > 0) {
      recalculateAllItems(newSourceId)
    }
  }

  // Handler to update item-level job code
  const handleUpdateItemJobCode = (itemId: number, newJobCodeId: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, jobCodeId: newJobCodeId }
        : item
    ))
  }

  // Handler to update item-level project
  const handleUpdateItemProject = (itemId: number, newProjectId: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, projectId: newProjectId }
        : item
    ))
  }

  const handleAddJobCode = () => {
    if (!newJobCode.code || !newJobCode.name) return
    const newCode: JobCode = {
      id: `job-${Date.now()}`,
      code: newJobCode.code,
      name: newJobCode.name,
      description: newJobCode.description,
      isActive: true
    }
    setJobCodes([...jobCodes, newCode])
    setNewJobCode({ code: '', name: '', description: '' })
    setShowAddJobCodeDialog(false)
    toast({ title: "Job Code Added", description: `${newCode.code} - ${newCode.name}` })
  }

  const handleAddProject = () => {
    if (!newProject.code || !newProject.name) return
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      code: newProject.code,
      name: newProject.name,
      description: newProject.description,
      isActive: true
    }
    setProjects([...projects, newProj])
    setNewProject({ code: '', name: '', description: '' })
    setShowAddProjectDialog(false)
    toast({ title: "Project Added", description: `${newProj.code} - ${newProj.name}` })
  }

  const handleSaveDraft = () => {
    if (!requestFromId) {
      toast({
        title: "Validation Error",
        description: "Please select a source location",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Draft Saved",
        description: `Requisition ${newRequisitionNumber} saved as draft`
      })
      router.push('/store-operations/store-requisitions')
    }, 1000)
  }

  const handleSubmit = () => {
    if (!requestFromId) {
      toast({
        title: "Validation Error",
        description: "Please select a source location",
        variant: "destructive"
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Requisition Submitted",
        description: `Requisition ${newRequisitionNumber} submitted for approval`
      })
      router.push('/store-operations/store-requisitions')
    }, 1500)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/store-operations/store-requisitions')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">New Store Requisition</h1>
                <p className="text-sm text-muted-foreground">Create a new material request</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              >
                {isSidePanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || items.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className={cn(
          "flex gap-6 transition-all duration-300",
          isSidePanelOpen ? "mr-80" : ""
        )}>
          <div className="flex-1 space-y-6">
            {/* Header Info Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Draft
                    </Badge>
                    <span className="text-lg font-medium">{newRequisitionNumber}</span>
                    {workflowType && (
                      <Badge
                        variant="outline"
                        className={cn("border", getWorkflowTypeBadgeClass(workflowType))}
                      >
                        {getWorkflowTypeLabel(workflowType)}
                      </Badge>
                    )}
                    {bypassesApproval && workflowType === SRWorkflowType.STORE_TO_STORE && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              No Approval Required
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Store-to-store transfers are auto-approved</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <LocationTypeBadge locationType={userLocationType} />
                </div>
              </CardHeader>
              <CardContent>
                {/* Header Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Row 1 */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Hash className="h-3 w-3" />
                      Requisition Number
                    </Label>
                    <p className="font-medium">{newRequisitionNumber}</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Request Date
                    </Label>
                    <p className="font-medium">{new Date().toLocaleDateString('en-GB')}</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Expected Delivery
                    </Label>
                    <Input
                      type="date"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      className="h-9"
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Package className="h-3 w-3" />
                      Request From (Source) *
                    </Label>
                    <Select value={requestFromId} onValueChange={handleSourceLocationChange}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select store/warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceLocations.map(loc => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.code} : {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      Deliver To (Destination)
                    </Label>
                    <Select value={destinationLocationId} onValueChange={setDestinationLocationId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {userAssignedLocations.map(loc => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.code} : {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" />
                      Department
                    </Label>
                    <Select value={departmentId} onValueChange={setDepartmentId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDepartments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      Requested By
                    </Label>
                    <p className="font-medium">{userName}</p>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3 w-3" />
                      Description
                    </Label>
                    <Input
                      placeholder="Enter requisition description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs - Business Dimensions are at item level, not tab level */}
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="items"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  Items ({itemCount})
                </TabsTrigger>
              </TabsList>

              {/* Items Tab */}
              <TabsContent value="items" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Requested Items</CardTitle>
                      {!isAddingItem && (
                        <Button
                          size="sm"
                          onClick={handleStartAddItem}
                          disabled={!requestFromId}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      )}
                    </div>
                    {!requestFromId && (
                      <p className="text-sm text-muted-foreground">
                        Select a source location above to add items
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {items.length === 0 && !isAddingItem ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No items added yet</p>
                        <p className="text-sm">Click &quot;Add Item&quot; to start adding items to this requisition</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto border rounded-md">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="w-[50px] p-3 text-left text-xs font-medium text-muted-foreground">#</th>
                                <th className="p-3 text-left text-xs font-medium text-muted-foreground min-w-[200px]">Description</th>
                                <th className="w-[100px] p-3 text-left text-xs font-medium text-muted-foreground">Unit</th>
                                <th className="w-[120px] p-3 text-right text-xs font-medium text-muted-foreground">Qty Required</th>
                                <th className="w-[120px] p-3 text-center text-xs font-medium text-muted-foreground">Availability</th>
                                <th className="w-[120px] p-3 text-right text-xs font-medium text-muted-foreground">Unit Cost</th>
                                <th className="w-[120px] p-3 text-right text-xs font-medium text-muted-foreground">Total</th>
                                <th className="w-[140px] p-3 text-left text-xs font-medium text-muted-foreground">Job Code</th>
                                <th className="w-[140px] p-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                                <th className="w-[80px] p-3"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {items.map((item, index) => (
                                <tr key={item.id} className="hover:bg-muted/30">
                                  <td className="p-3 text-muted-foreground">{index + 1}</td>
                                  <td className="p-3 font-medium">{item.description}</td>
                                  <td className="p-3">{item.unit}</td>
                                  <td className="p-3 text-right">
                                    <Input
                                      type="number"
                                      min={1}
                                      value={item.qtyRequired}
                                      onChange={(e) => handleUpdateQty(item.id, parseInt(e.target.value) || 1)}
                                      className="w-20 h-8 text-right ml-auto"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center justify-center gap-1">
                                            {item.fulfillment.toPurchase === 0 ? (
                                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                {item.sourceAvailableQty}
                                              </Badge>
                                            ) : item.fulfillment.fromStock > 0 ? (
                                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                {item.sourceAvailableQty}/{item.qtyRequired}
                                              </Badge>
                                            ) : (
                                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                0
                                              </Badge>
                                            )}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="text-xs space-y-1">
                                            <p>Available at source: {item.sourceAvailableQty}</p>
                                            <p>From stock: {item.fulfillment.fromStock}</p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </td>
                                  <td className="p-3 text-right">{formatNumber(item.costPerUnit)}</td>
                                  <td className="p-3 text-right font-medium">{formatNumber(item.total)}</td>
                                  <td className="p-3">
                                    <Select
                                      value={item.jobCodeId}
                                      onValueChange={(val) => handleUpdateItemJobCode(item.id, val)}
                                    >
                                      <SelectTrigger className="h-8 w-full text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {jobCodes.filter(j => j.isActive).map(jc => (
                                          <SelectItem key={jc.id} value={jc.id} className="text-xs">
                                            {jc.code}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-3">
                                    <Select
                                      value={item.projectId}
                                      onValueChange={(val) => handleUpdateItemProject(item.id, val)}
                                    >
                                      <SelectTrigger className="h-8 w-full text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {projects.filter(p => p.isActive).map(proj => (
                                          <SelectItem key={proj.id} value={proj.id} className="text-xs">
                                            {proj.code}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-3">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                              {/* Inline Add Item Row - same pattern as edit mode */}
                              {isAddingItem && (
                                <tr className="bg-blue-50/50 border-t-2 border-blue-200">
                                  <td className="p-3">
                                    <span className="text-muted-foreground">-</span>
                                  </td>
                                  <td className="p-3">
                                    {/* Searchable Product Dropdown */}
                                    <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          aria-expanded={productSearchOpen}
                                          className="w-full justify-between min-w-[200px] h-9"
                                        >
                                          {selectedProduct ? (
                                            <div className="flex flex-col items-start">
                                              <span className="text-sm font-medium truncate max-w-[180px]">{selectedProduct.productName}</span>
                                              <span className="text-xs text-muted-foreground">{selectedProduct.productCode}</span>
                                            </div>
                                          ) : (
                                            <span className="text-muted-foreground flex items-center gap-2">
                                              <Search className="h-4 w-4" />
                                              Search products...
                                            </span>
                                          )}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[350px] p-0" align="start">
                                        <Command>
                                          <CommandInput placeholder="Search by name or code..." />
                                          <CommandList>
                                            <CommandEmpty>No product found.</CommandEmpty>
                                            <CommandGroup heading="Products">
                                              {activeProducts.map((product) => (
                                                <CommandItem
                                                  key={product.id}
                                                  value={`${product.productName} ${product.productCode}`}
                                                  onSelect={() => {
                                                    setNewItemProductId(product.id)
                                                    setProductSearchOpen(false)
                                                  }}
                                                >
                                                  <div className="flex flex-col">
                                                    <span className="font-medium">{product.productName}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                      {product.productCode} · {product.baseUnit} · {formatCurrency(product.standardCost?.amount || 0)}
                                                    </span>
                                                  </div>
                                                  <Check
                                                    className={cn(
                                                      "ml-auto h-4 w-4",
                                                      newItemProductId === product.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                  />
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                  </td>
                                  <td className="p-3">
                                    <p className="text-sm text-muted-foreground">
                                      {selectedProduct?.baseUnit || '-'}
                                    </p>
                                  </td>
                                  <td className="p-3 text-right">
                                    <Input
                                      type="number"
                                      min="1"
                                      value={newItemQty}
                                      onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                                      className="w-20 h-8 text-right ml-auto"
                                    />
                                  </td>
                                  <td className="p-3 text-center">
                                    {selectedProduct && requestFromId ? (
                                      <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                                        <span className="text-xs">Check on add</span>
                                      </Badge>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">-</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <p className="text-sm text-muted-foreground">
                                      {selectedProduct ? formatNumber(selectedProduct.standardCost?.amount || 0) : '-'}
                                    </p>
                                  </td>
                                  <td className="p-3 text-right">
                                    <p className="text-sm tabular-nums font-medium">
                                      {selectedProduct
                                        ? formatNumber((selectedProduct.standardCost?.amount || 0) * newItemQty)
                                        : '-'
                                      }
                                    </p>
                                  </td>
                                  <td className="p-3">
                                    <Select value={newItemJobCodeId} onValueChange={setNewItemJobCodeId}>
                                      <SelectTrigger className="h-8 w-full text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {jobCodes.filter(j => j.isActive).map(jc => (
                                          <SelectItem key={jc.id} value={jc.id} className="text-xs">
                                            {jc.code}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-3">
                                    <Select value={newItemProjectId} onValueChange={setNewItemProjectId}>
                                      <SelectTrigger className="h-8 w-full text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {projects.filter(p => p.isActive).map(proj => (
                                          <SelectItem key={proj.id} value={proj.id} className="text-xs">
                                            {proj.code}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleConfirmAddItem}
                                        disabled={!newItemProductId}
                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancelAddItem}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Totals */}
                        <Separator className="my-4" />
                        <div className="flex justify-end">
                          <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                              <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Fulfillment Preview */}
                        {items.length > 0 && (fulfillmentSummary.partiallyFulfillable > 0 || fulfillmentSummary.requiresPurchase > 0 || fulfillmentSummary.fullyFulfillable > 0) && (
                          <>
                            <Separator className="my-4" />
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium flex items-center gap-2">
                                <FileOutput className="h-4 w-4" />
                                Document Generation Preview
                              </h4>

                              {/* Warning for items with insufficient stock */}
                              {fulfillmentSummary.requiresPurchase > 0 && (
                                <Alert variant="destructive" className="bg-red-50 border-red-200">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Stock Shortage</AlertTitle>
                                  <AlertDescription>
                                    {fulfillmentSummary.requiresPurchase} item(s) have no stock available at the source location.
                                  </AlertDescription>
                                </Alert>
                              )}

                              {fulfillmentSummary.partiallyFulfillable > 0 && (
                                <Alert className="bg-amber-50 border-amber-200">
                                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                                  <AlertTitle className="text-amber-800">Partial Stock</AlertTitle>
                                  <AlertDescription className="text-amber-700">
                                    {fulfillmentSummary.partiallyFulfillable} item(s) have partial stock availability.
                                  </AlertDescription>
                                </Alert>
                              )}

                              {/* Document Summary Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Stock Transfer/Issue Card */}
                                {fulfillmentSummary.fromStock > 0 && (
                                  <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Truck className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-800">
                                        {userLocationType === InventoryLocationType.DIRECT ? 'Stock Issue' : 'Stock Transfer'}
                                      </span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-900">
                                      {fulfillmentSummary.fromStock} units
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">
                                      {fulfillmentSummary.fullyFulfillable + fulfillmentSummary.partiallyFulfillable} item(s) from stock
                                    </p>
                                  </div>
                                )}

                                {/* All Available Card */}
                                {fulfillmentSummary.fromStock > 0 && fulfillmentSummary.requiresPurchase === 0 && (
                                  <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-800">Fully Available</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-900">
                                      100%
                                    </div>
                                    <p className="text-xs text-green-600 mt-1">
                                      All items can be fulfilled from stock
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Flow Diagram */}
                              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                                <Badge variant="outline">Store Requisition</Badge>
                                <ArrowRight className="h-4 w-4" />
                                {fulfillmentSummary.fromStock > 0 && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {userLocationType === InventoryLocationType.DIRECT ? 'SI' : 'ST'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>

          {/* Side Panel */}
          {isSidePanelOpen && (
            <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg z-20 overflow-y-auto">
              <div className="p-4 border-b sticky top-0 bg-background">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Details</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidePanelOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Comments Section */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments
                  </h4>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!newComment.trim()}
                      onClick={() => {
                        toast({ title: "Comment Added" })
                        setNewComment("")
                      }}
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Attachments Section */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attachments
                  </h4>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Attachment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Job Code Dialog */}
      <Dialog open={showAddJobCodeDialog} onOpenChange={setShowAddJobCodeDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Job Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                value={newJobCode.code}
                onChange={(e) => setNewJobCode({ ...newJobCode, code: e.target.value })}
                placeholder="e.g., EVT-003"
              />
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={newJobCode.name}
                onChange={(e) => setNewJobCode({ ...newJobCode, name: e.target.value })}
                placeholder="e.g., Conference Event"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newJobCode.description}
                onChange={(e) => setNewJobCode({ ...newJobCode, description: e.target.value })}
                placeholder="Optional description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddJobCodeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddJobCode} disabled={!newJobCode.code || !newJobCode.name}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                value={newProject.code}
                onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                placeholder="e.g., PROJ-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="e.g., Q2 Marketing"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Optional description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProject} disabled={!newProject.code || !newProject.name}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
