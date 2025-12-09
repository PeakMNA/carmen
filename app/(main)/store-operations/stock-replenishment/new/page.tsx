"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  ArrowLeft,
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
  Info,
  CheckCircle2,
  TrendingDown
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useSimpleUser } from "@/lib/context/simple-user-context"
import {
  getItemsBelowParLevel,
  enrichItemsWithSourceAvailability,
  getSourceLocations,
  mockInventoryLocations,
  type ReplenishmentItem
} from "@/lib/mock-data"
import { InventoryLocationType } from "@/lib/types/location-management"

interface RequestItem extends ReplenishmentItem {
  requestedQty: number
  sourceAvailable: number
  isValid: boolean
  validationError?: string
}

function getUrgencyBadge(urgency: string) {
  const config: Record<string, { variant: "destructive" | "default" | "secondary" | "outline"; label: string; icon: React.ReactNode }> = {
    critical: { variant: "destructive", label: "Critical", icon: <AlertCircle className="h-3 w-3" /> },
    warning: { variant: "default", label: "Warning", icon: <AlertTriangle className="h-3 w-3" /> },
    low: { variant: "secondary", label: "Low", icon: <TrendingDown className="h-3 w-3" /> }
  }
  const { variant, label, icon } = config[urgency] || { variant: "outline", label: urgency, icon: null }
  return (
    <Badge variant={variant} className="gap-1">
      {icon}
      {label}
    </Badge>
  )
}

function NewReplenishmentRequestPageContent() {
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

  // Get user's current location (destination)
  const userLocationId = user?.context?.currentLocation?.id || "loc-003"
  const userLocationName = user?.context?.currentLocation?.name || "Central Kitchen"
  const userName = user?.name || "Unknown User"
  const userDepartment = user?.context?.currentDepartment?.name || "Unknown Department"

  // Check if user's location is an inventory location
  const userInventoryLocation = useMemo(() => {
    return mockInventoryLocations.find(loc => loc.id === userLocationId && loc.type === InventoryLocationType.INVENTORY)
  }, [userLocationId])

  const isInventoryLocation = !!userInventoryLocation

  // Get source locations (inventory locations, excluding user's location)
  const sourceLocations = useMemo(() => {
    return getSourceLocations().filter(loc => loc.id !== userLocationId)
  }, [userLocationId])

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
  useEffect(() => {
    if (sourceLocationId && itemsBelowPar.length > 0) {
      const enrichedItems = enrichItemsWithSourceAvailability(itemsBelowPar, sourceLocationId)

      // Filter to selected items if any
      const itemsToAdd = selectedItemIds.size > 0
        ? enrichedItems.filter(item => selectedItemIds.has(item.id))
        : enrichedItems

      // Convert to request items
      const newRequestItems: RequestItem[] = itemsToAdd.map(item => {
        const requestedQty = Math.min(item.recommendedQty, item.sourceAvailable || 0)
        const isValid = requestedQty > 0 && requestedQty <= (item.sourceAvailable || 0)

        return {
          ...item,
          requestedQty,
          sourceAvailable: item.sourceAvailable || 0,
          isValid,
          validationError: !isValid
            ? (item.sourceAvailable || 0) === 0
              ? "No stock available at source"
              : "Requested quantity exceeds available"
            : undefined
        }
      })

      setRequestItems(newRequestItems)
    } else {
      setRequestItems([])
    }
  }, [sourceLocationId, itemsBelowPar, selectedItemIds])

  // Update requested quantity with validation
  const updateRequestedQty = (itemId: string, newQty: number) => {
    setRequestItems(prev => prev.map(item => {
      if (item.id !== itemId) return item

      const qty = Math.max(0, newQty)
      const isValid = qty > 0 && qty <= item.sourceAvailable

      return {
        ...item,
        requestedQty: qty,
        isValid,
        validationError: !isValid
          ? qty === 0
            ? "Quantity must be greater than 0"
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

  // Calculate totals
  const totals = useMemo(() => {
    const validItems = requestItems.filter(item => item.isValid)
    return {
      totalItems: validItems.length,
      totalQuantity: validItems.reduce((sum, item) => sum + item.requestedQty, 0),
      invalidItems: requestItems.filter(item => !item.isValid).length
    }
  }, [requestItems])

  // Check if form is valid
  const isFormValid = sourceLocationId &&
    requestItems.length > 0 &&
    requestItems.every(item => item.isValid) &&
    totals.totalQuantity > 0

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // ============================================================================
  // STORE REQUISITION (SR) CREATION
  // ============================================================================
  //
  // Stock Replenishment creates a Store Requisition (SR) document which represents
  // an internal stock transfer request. The workflow is:
  //
  // 1. User selects items below par level at their location
  // 2. User selects source location (warehouse) to request stock from
  // 3. User adjusts quantities and submits
  // 4. System creates an SR with movementType: "Transfer"
  // 5. SR goes through approval workflow
  // 6. Once approved, stock is transferred from source to destination
  //
  // SR Document Structure:
  // - refNo: SR-YYYY-XXX (Store Requisition number)
  // - movementType: "Transfer" (internal stock movement)
  // - requestedFrom: Source location (where stock comes from)
  // - requestedTo: Destination location (user's location)
  // - status: Draft → Pending → Approved → In Process → Completed
  // ============================================================================

  /**
   * Generate Store Requisition (SR) reference number
   * Format: SR-YYYY-XXX where XXX is a sequential number
   */
  const generateSRNumber = () => {
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `SR-${year}-${randomNum}`
  }

  /**
   * Build the Store Requisition payload for API submission
   *
   * @param status - 'Draft' for save draft, 'Pending' for submit for approval
   * @returns SR payload object ready for API call
   */
  const buildStoreRequisitionPayload = (status: 'Draft' | 'Pending') => {
    const sourceLocation = sourceLocations.find(loc => loc.id === sourceLocationId)
    const validItems = requestItems.filter(item => item.isValid)

    return {
      // Document identification
      refNo: generateSRNumber(),
      date: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

      // Transfer type - this is an internal stock movement
      movementType: 'Transfer',

      // Location information
      requestedFrom: `${sourceLocation?.code || ''} : ${sourceLocation?.name || 'Unknown'}`, // Source (e.g., Main Warehouse)
      requestedTo: userLocationName, // Destination (user's location, e.g., Central Kitchen)
      sourceLocationId: sourceLocationId,
      destinationLocationId: userLocationId,

      // Request details
      description: `Stock replenishment request - ${priority} priority${notes ? `: ${notes}` : ''}`,
      department: userDepartment,
      requestedBy: userName,
      status: status,
      priority: priority,

      // Line items
      items: validItems.map((item, index) => ({
        id: index + 1,
        productId: item.productId,
        productCode: item.productCode,
        description: item.productName,
        category: item.categoryName,
        unit: item.unit,
        qtyRequired: item.requestedQty,
        qtyApproved: status === 'Draft' ? 0 : item.requestedQty,
        currentStock: item.currentStock,
        parLevel: item.parLevel,
        sourceAvailable: item.sourceAvailable,
        urgency: item.urgency
      })),

      // Summary
      totalItems: validItems.length,
      totalQuantity: validItems.reduce((sum, item) => sum + item.requestedQty, 0),

      // Audit fields
      createdAt: new Date().toISOString(),
      createdBy: user?.id || 'unknown'
    }
  }

  /**
   * Save the replenishment request as a Draft SR
   * - Creates SR with status: 'Draft'
   * - Does not trigger approval workflow
   * - Can be edited later before submission
   */
  const handleSaveDraft = async () => {
    setIsSubmitting(true)

    const srPayload = buildStoreRequisitionPayload('Draft')

    // TODO: Replace with actual API call
    // await api.storeRequisitions.create(srPayload)
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Creating Draft Store Requisition:', srPayload)

    toast({
      title: "Draft Saved",
      description: `Store Requisition ${srPayload.refNo} has been saved as draft.`,
    })

    setIsSubmitting(false)
    router.push("/store-operations/store-requisitions")
  }

  /**
   * Submit the replenishment request for approval
   *
   * This action:
   * 1. Creates a Store Requisition (SR) with status: 'Pending'
   * 2. Triggers the approval workflow
   * 3. Notifies approvers (warehouse manager, etc.)
   * 4. Once approved, stock transfer will be executed
   *
   * The SR document type is "Transfer" which means:
   * - Stock OUT from source location (e.g., Main Warehouse)
   * - Stock IN to destination location (user's location)
   */
  const handleSubmit = async () => {
    setIsSubmitting(true)

    const srPayload = buildStoreRequisitionPayload('Pending')
    const sourceLocation = sourceLocations.find(loc => loc.id === sourceLocationId)

    // TODO: Replace with actual API call
    // await api.storeRequisitions.create(srPayload)
    // await api.storeRequisitions.submitForApproval(srPayload.refNo)
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Creating and Submitting Store Requisition:', srPayload)

    toast({
      title: "Store Requisition Created",
      description: `${srPayload.refNo} submitted for approval. ${srPayload.totalItems} items (${srPayload.totalQuantity} units) requested from ${sourceLocation?.name}.`,
    })

    setIsSubmitting(false)
    router.push("/store-operations/store-requisitions")
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/store-operations/stock-replenishment">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Warehouse className="h-7 w-7 text-green-600" />
              Create Replenishment Request
            </h1>
            <p className="text-sm text-muted-foreground">
              Request items to restock your location to par level
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!isFormValid || isSubmitting}
            onClick={handleSaveDraft}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </div>
      </div>

      {/* Warning when location is not an inventory location */}
      {!isInventoryLocation && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Your current location ({userLocationName})</strong> is not configured as an inventory location.
            Stock replenishment is only available for inventory locations like Central Kitchen or Main Warehouse.
            Please switch to an inventory location to create replenishment requests.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Request Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requestor Information (Auto-filled) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Requestor Information
              </CardTitle>
              <CardDescription>Automatically filled from your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Requested By</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{userName}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Department</Label>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{userDepartment}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Request Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatDate(new Date())}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Transfer Details
              </CardTitle>
              <CardDescription>Select source location and priority</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location Flow */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="source">From Location (Source) *</Label>
                  <Select value={sourceLocationId} onValueChange={setSourceLocationId}>
                    <SelectTrigger id="source">
                      <SelectValue placeholder="Select source location" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceLocations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                            {loc.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="hidden md:flex items-center justify-center px-4 pt-6">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>

                <div className="flex-1 space-y-2">
                  <Label>To Location (Destination)</Label>
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{userLocationName}</span>
                    <Badge variant="outline" className="ml-auto">Your Location</Badge>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                    <SelectTrigger id="priority">
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

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special instructions or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items to Replenish */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items to Replenish
                {requestItems.length > 0 && (
                  <Badge variant="secondary">{requestItems.length} items</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Items below par level at your location. Adjust quantities as needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!sourceLocationId ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Warehouse className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Select a source location first</p>
                  <p className="text-sm">Choose where to request items from</p>
                </div>
              ) : requestItems.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p className="font-medium">All items are at par level!</p>
                  <p className="text-sm text-muted-foreground">
                    No items need replenishment at this time.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Current</TableHead>
                        <TableHead className="text-right">Par Level</TableHead>
                        <TableHead className="text-right">Recommended</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                        <TableHead className="text-right w-[140px]">Request Qty</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className={!item.isValid ? "bg-red-50" : ""}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.productCode} • {item.categoryName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={item.urgency === "critical" ? "text-red-600 font-medium" : ""}>
                              {formatNumber(item.currentStock)}
                            </span>
                            <span className="text-muted-foreground ml-1">{item.unit}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(item.parLevel)}
                            <span className="text-muted-foreground ml-1">{item.unit}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-green-600 font-medium">
                              +{formatNumber(item.recommendedQty)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={item.sourceAvailable === 0 ? "text-red-600" : "text-blue-600"}>
                              {formatNumber(item.sourceAvailable)}
                            </span>
                            <span className="text-muted-foreground ml-1">{item.unit}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <Input
                                type="number"
                                min={0}
                                max={item.sourceAvailable}
                                value={item.requestedQty}
                                onChange={(e) => updateRequestedQty(item.id, parseInt(e.target.value) || 0)}
                                className={`w-[100px] text-right ${!item.isValid ? "border-red-500" : ""}`}
                              />
                              {item.validationError && (
                                <span className="text-xs text-red-500">{item.validationError}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getUrgencyBadge(item.urgency)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-600"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requestItems.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No items in request yet
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valid Items:</span>
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

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Warehouse className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-medium">
                        {sourceLocations.find(l => l.id === sourceLocationId)?.name || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">{userLocationName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge
                        variant={priority === "emergency" ? "destructive" : priority === "urgent" ? "default" : "secondary"}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <Button className="w-full" disabled={!isFormValid}>
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Approval
                    </Button>
                    <Button variant="outline" className="w-full" disabled={!isFormValid}>
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Validation Warnings */}
          {totals.invalidItems > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {totals.invalidItems} item(s) have validation errors. Please fix them before submitting.
              </AlertDescription>
            </Alert>
          )}

          {/* Info Card */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Stock Validation:</strong> You cannot request more than what is available at the source location.
              Adjust quantities to match availability.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}

export default function NewReplenishmentRequestPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <NewReplenishmentRequestPageContent />
    </Suspense>
  )
}
