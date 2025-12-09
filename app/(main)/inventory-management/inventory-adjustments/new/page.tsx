/**
 * ============================================================================
 * NEW INVENTORY ADJUSTMENT PAGE
 * ============================================================================
 *
 * Form page for creating new inventory adjustments. Supports both Stock IN
 * (increase inventory) and Stock OUT (decrease inventory) adjustment types.
 *
 * PAGE STRUCTURE:
 * 1. Header - Title, Save as Draft button, Post Adjustment button
 * 2. Adjustment Type Selection - Toggle between Stock IN and Stock OUT
 * 3. Adjustment Details - Date, Location, Reason, Description
 * 4. Items Section - Product selector and items table
 * 5. Summary Card - Total items, quantity, and value
 * 6. Warnings - Price entry warning for Stock IN adjustments
 *
 * KEY BUSINESS RULES:
 *
 * Stock OUT (Decrease Inventory):
 * - Uses system average cost automatically (no price entry required)
 * - Cannot exceed current stock quantity
 * - Reasons: Damaged, Expired, Theft/Loss, Spoilage, Count Variance, QC Rejection
 *
 * Stock IN (Increase Inventory):
 * - Requires manual unit cost entry (affects inventory valuation)
 * - No upper limit on quantity
 * - Reasons: Count Variance, Found Items, Return to Stock, System Correction
 *
 * VALIDATION:
 * - Location is required
 * - Reason is required
 * - At least one item is required
 * - For Stock IN: Unit cost must be greater than 0
 * - For Stock OUT: Quantity cannot exceed current stock
 *
 * FORM ACTIONS:
 * - Save as Draft: Saves without validation, creates Draft status adjustment
 * - Post Adjustment: Validates and creates Posted status adjustment
 * - Discard: Prompts confirmation if changes exist, then navigates back
 *
 * TODO: Replace mock data with API calls:
 * - GET /api/locations - Fetch available locations
 * - GET /api/products?location=:id - Fetch products with stock at location
 * - POST /api/inventory-adjustments - Create new adjustment
 *
 * ============================================================================
 */

"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
  Search,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Adjustment direction - IN increases stock, OUT decreases stock */
type AdjustmentType = "IN" | "OUT"

/**
 * Represents a single item in the adjustment form.
 * Contains product details, quantities, costs, and per-item reason.
 */
interface AdjustmentItem {
  id: string
  productId: string
  productName: string
  sku: string
  currentStock: number
  adjustmentQty: number
  unit: string
  unitCost: number  // Required for IN, optional for OUT
  totalCost: number
  reason: string
  notes?: string
}

/**
 * Complete form data structure for creating a new adjustment.
 * Tracks header information and all line items.
 */
interface AdjustmentFormData {
  type: AdjustmentType
  date: string
  locationId: string
  locationName: string
  reason: string
  description: string
  items: AdjustmentItem[]
}

// ============================================================================
// MOCK DATA
// ============================================================================
// Sample data for development and testing.
// TODO: Replace with API calls to fetch actual data.
// ============================================================================

/** Available inventory locations */
const mockLocations = [
  { id: "loc-001", name: "Main Warehouse", code: "WH-001" },
  { id: "loc-002", name: "Production Store", code: "PS-001" },
  { id: "loc-003", name: "Central Kitchen", code: "CK-001" },
  { id: "loc-004", name: "Cold Storage", code: "CS-001" },
]

/** Products available for adjustment with current stock and average cost */
const mockProducts = [
  { id: "prod-001", name: "Organic Quinoa", sku: "GRN-QNA-001", unit: "KG", currentStock: 150, avgCost: 45.50 },
  { id: "prod-002", name: "Brown Rice", sku: "GRN-RCE-002", unit: "KG", currentStock: 200, avgCost: 28.75 },
  { id: "prod-003", name: "Chia Seeds", sku: "GRN-CHA-003", unit: "KG", currentStock: 80, avgCost: 53.35 },
  { id: "prod-004", name: "Olive Oil Extra Virgin", sku: "OIL-OLV-001", unit: "L", currentStock: 50, avgCost: 18.90 },
  { id: "prod-005", name: "Black Pepper Ground", sku: "SPC-PEP-001", unit: "KG", currentStock: 25, avgCost: 32.50 },
  { id: "prod-006", name: "Sea Salt", sku: "SPC-SLT-001", unit: "KG", currentStock: 100, avgCost: 8.25 },
  { id: "prod-007", name: "Chicken Breast", sku: "MEA-CHK-001", unit: "KG", currentStock: 75, avgCost: 12.50 },
  { id: "prod-008", name: "Salmon Fillet", sku: "SEA-SAL-001", unit: "KG", currentStock: 30, avgCost: 28.00 },
  { id: "prod-009", name: "Fresh Basil", sku: "HRB-BAS-001", unit: "KG", currentStock: 10, avgCost: 15.00 },
  { id: "prod-010", name: "Tomato Sauce", sku: "SAU-TOM-001", unit: "L", currentStock: 120, avgCost: 6.50 },
]

/**
 * Pre-defined adjustment reasons grouped by type.
 * Stock IN and Stock OUT have different valid reasons.
 */
const adjustmentReasons = {
  IN: [
    { value: "count_variance", label: "Physical Count Variance" },
    { value: "found_items", label: "Found Items" },
    { value: "return_to_stock", label: "Return to Stock" },
    { value: "system_correction", label: "System Correction" },
    { value: "other", label: "Other" },
  ],
  OUT: [
    { value: "damaged", label: "Damaged Goods" },
    { value: "expired", label: "Expired Items" },
    { value: "theft_loss", label: "Theft / Loss" },
    { value: "spoilage", label: "Spoilage" },
    { value: "count_variance", label: "Physical Count Variance" },
    { value: "quality_rejection", label: "Quality Control Rejection" },
    { value: "other", label: "Other" },
  ]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generates a unique ID for new adjustment items.
 * Uses timestamp and random string for uniqueness.
 */
function generateId() {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

/**
 * ProductSelector - Searchable dropdown for adding products to the adjustment
 *
 * Features:
 * - Search by product name or SKU
 * - Shows current stock and unit
 * - Excludes already-selected products
 * - Uses Command component for keyboard navigation
 *
 * @param onSelect - Callback when a product is selected
 * @param excludeIds - Product IDs to exclude from the list
 */
function ProductSelector({
  onSelect,
  excludeIds,
}: {
  onSelect: (product: typeof mockProducts[0]) => void
  excludeIds: string[]
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(
      (p) =>
        !excludeIds.includes(p.id) &&
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()))
    )
  }, [search, excludeIds])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search products..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {filteredProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => {
                    onSelect(product)
                    setOpen(false)
                    setSearch("")
                  }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {product.sku} | Stock: {product.currentStock} {product.unit}
                    </div>
                  </div>
                  <Badge variant="outline">{product.unit}</Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * NewInventoryAdjustmentPage - Form for creating new adjustments
 *
 * Provides a comprehensive form for creating Stock IN or Stock OUT adjustments.
 * Handles form state, validation, and submission.
 *
 * @returns The new adjustment form page
 */
export default function NewInventoryAdjustmentPage() {
  const router = useRouter()

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Loading state during save operation */
  const [isSaving, setIsSaving] = useState(false)

  /** Controls visibility of discard confirmation dialog */
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

  /** Validation errors keyed by field name or item ID */
  const [errors, setErrors] = useState<Record<string, string>>({})

  /** Main form data containing all adjustment information */
  const [formData, setFormData] = useState<AdjustmentFormData>({
    type: "OUT",
    date: format(new Date(), "yyyy-MM-dd"),
    locationId: "",
    locationName: "",
    reason: "",
    description: "",
    items: [],
  })

  // ============================================================================
  // SIDE EFFECTS
  // ============================================================================

  /**
   * Sync location name when locationId changes.
   * Maintains both ID and display name in form state.
   */
  useEffect(() => {
    const location = mockLocations.find(l => l.id === formData.locationId)
    if (location) {
      setFormData(prev => ({ ...prev, locationName: location.name }))
    }
  }, [formData.locationId])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Calculate summary totals from all items.
   * Updates automatically when items change.
   */
  const totals = useMemo(() => {
    const totalQty = formData.items.reduce((sum, item) => sum + item.adjustmentQty, 0)
    const totalValue = formData.items.reduce((sum, item) => sum + item.totalCost, 0)
    return { totalQty, totalValue }
  }, [formData.items])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Add a new product to the adjustment items list.
   * Sets initial quantity to 1 and cost based on adjustment type.
   *
   * @param product - The product to add from the selector
   */
  const handleAddItem = useCallback((product: typeof mockProducts[0]) => {
    const newItem: AdjustmentItem = {
      id: generateId(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      currentStock: product.currentStock,
      adjustmentQty: 1,
      unit: product.unit,
      unitCost: formData.type === "IN" ? 0 : product.avgCost, // For OUT, use avg cost; for IN, user must enter
      totalCost: formData.type === "IN" ? 0 : product.avgCost,
      reason: "",
    }
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }))
  }, [formData.type])

  /**
   * Update a specific field on an adjustment item.
   * Automatically recalculates total cost when quantity or unit cost changes.
   *
   * @param itemId - ID of the item to update
   * @param field - Field name to update
   * @param value - New value for the field
   */
  const handleUpdateItem = useCallback((itemId: string, field: keyof AdjustmentItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== itemId) return item

        const updated = { ...item, [field]: value }

        // Recalculate total cost
        if (field === "adjustmentQty" || field === "unitCost") {
          updated.totalCost = updated.adjustmentQty * updated.unitCost
        }

        return updated
      })
    }))
  }, [])

  /**
   * Remove an item from the adjustment list.
   *
   * @param itemId - ID of the item to remove
   */
  const handleRemoveItem = useCallback((itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }, [])

  /**
   * Validate the form before submission.
   * Checks required fields, item quantities, and unit costs.
   *
   * @returns true if form is valid, false otherwise
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.locationId) {
      newErrors.location = "Location is required"
    }
    if (!formData.reason) {
      newErrors.reason = "Reason is required"
    }
    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required"
    }

    // For Stock IN, validate unit cost for each item
    if (formData.type === "IN") {
      formData.items.forEach((item, index) => {
        if (!item.unitCost || item.unitCost <= 0) {
          newErrors[`item_${item.id}_cost`] = "Unit cost is required for Stock In"
        }
      })
    }

    // Validate quantities
    formData.items.forEach((item) => {
      if (item.adjustmentQty <= 0) {
        newErrors[`item_${item.id}_qty`] = "Quantity must be greater than 0"
      }
      // For Stock OUT, check if quantity exceeds current stock
      if (formData.type === "OUT" && item.adjustmentQty > item.currentStock) {
        newErrors[`item_${item.id}_qty`] = `Cannot exceed current stock (${item.currentStock})`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  /**
   * Save the adjustment (as Draft or Posted).
   * Validates form before posting, skips validation for drafts.
   *
   * @param asDraft - If true, saves as Draft without validation
   */
  const handleSave = async (asDraft: boolean = false) => {
    if (!asDraft && !validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate adjustment number
      const adjustmentNumber = `ADJ-${format(new Date(), "yyyy")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`

      console.log("Saving adjustment:", {
        ...formData,
        adjustmentNumber,
        status: asDraft ? "Draft" : "Posted",
      })

      // Redirect to list
      router.push("/inventory-management/inventory-adjustments")
    } catch (error) {
      console.error("Error saving adjustment:", error)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Handle adjustment type toggle between IN and OUT.
   * Resets reason (as valid reasons differ by type) and recalculates
   * item costs based on the new type.
   *
   * @param type - The new adjustment type
   */
  const handleTypeChange = (type: AdjustmentType) => {
    if (formData.items.length > 0) {
      // If items exist, update their costs based on new type
      setFormData(prev => ({
        ...prev,
        type,
        reason: "", // Reset reason as reasons differ by type
        items: prev.items.map(item => {
          const product = mockProducts.find(p => p.id === item.productId)
          return {
            ...item,
            unitCost: type === "IN" ? 0 : (product?.avgCost || 0),
            totalCost: type === "IN" ? 0 : item.adjustmentQty * (product?.avgCost || 0),
          }
        })
      }))
    } else {
      setFormData(prev => ({ ...prev, type, reason: "" }))
    }
  }

  /**
   * Check if form has any user changes.
   * Used to warn user before discarding unsaved changes.
   */
  const hasChanges = formData.locationId || formData.reason || formData.items.length > 0

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => hasChanges ? setShowDiscardDialog(true) : router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">New Inventory Adjustment</h1>
              <p className="text-sm text-muted-foreground">
                Create a stock {formData.type === "IN" ? "increase" : "decrease"} adjustment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              Save as Draft
            </Button>
            <Button onClick={() => handleSave(false)} disabled={isSaving}>
              {isSaving ? "Saving..." : "Post Adjustment"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Adjustment Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Adjustment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTypeChange("OUT")}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                  formData.type === "OUT"
                    ? "border-red-500 bg-red-50"
                    : "border-muted hover:border-muted-foreground/30"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg",
                  formData.type === "OUT" ? "bg-red-100" : "bg-muted"
                )}>
                  <ArrowDownCircle className={cn(
                    "h-6 w-6",
                    formData.type === "OUT" ? "text-red-600" : "text-muted-foreground"
                  )} />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Stock Out</div>
                  <div className="text-sm text-muted-foreground">
                    Decrease inventory (no price entry required)
                  </div>
                </div>
                {formData.type === "OUT" && (
                  <Check className="h-5 w-5 text-red-600 ml-auto" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("IN")}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                  formData.type === "IN"
                    ? "border-green-500 bg-green-50"
                    : "border-muted hover:border-muted-foreground/30"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg",
                  formData.type === "IN" ? "bg-green-100" : "bg-muted"
                )}>
                  <ArrowUpCircle className={cn(
                    "h-6 w-6",
                    formData.type === "IN" ? "text-green-600" : "text-muted-foreground"
                  )} />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Stock In</div>
                  <div className="text-sm text-muted-foreground">
                    Increase inventory (price entry required)
                  </div>
                </div>
                {formData.type === "IN" && (
                  <Check className="h-5 w-5 text-green-600 ml-auto" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Header Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Adjustment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select
                  value={formData.locationId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}
                >
                  <SelectTrigger className={errors.location ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
                >
                  <SelectTrigger className={errors.reason ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {adjustmentReasons[formData.type].map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.reason && (
                  <p className="text-sm text-red-500">{errors.reason}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter adjustment description or notes..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Adjustment Items</CardTitle>
              {errors.items && (
                <p className="text-sm text-red-500 mt-1">{errors.items}</p>
              )}
            </div>
            <ProductSelector
              onSelect={handleAddItem}
              excludeIds={formData.items.map(i => i.productId)}
            />
          </CardHeader>
          <CardContent>
            {formData.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-3" />
                <p className="font-medium">No items added</p>
                <p className="text-sm">Click "Add Item" to add products to this adjustment</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Product</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right w-[120px]">Quantity</TableHead>
                      {formData.type === "IN" && (
                        <TableHead className="text-right w-[120px]">Unit Cost *</TableHead>
                      )}
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead className="w-[180px]">Item Reason</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-muted-foreground">{item.sku}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.currentStock} {item.unit}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            max={formData.type === "OUT" ? item.currentStock : undefined}
                            value={item.adjustmentQty}
                            onChange={(e) => handleUpdateItem(item.id, "adjustmentQty", parseFloat(e.target.value) || 0)}
                            className={cn(
                              "w-full text-right",
                              errors[`item_${item.id}_qty`] ? "border-red-500" : ""
                            )}
                          />
                          {errors[`item_${item.id}_qty`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`item_${item.id}_qty`]}</p>
                          )}
                        </TableCell>
                        {formData.type === "IN" && (
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitCost || ""}
                              onChange={(e) => handleUpdateItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className={cn(
                                "w-full text-right",
                                errors[`item_${item.id}_cost`] ? "border-red-500" : ""
                              )}
                            />
                            {errors[`item_${item.id}_cost`] && (
                              <p className="text-xs text-red-500 mt-1">{errors[`item_${item.id}_cost`]}</p>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-right font-medium">
                          {item.totalCost.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD"
                          })}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.reason}
                            onValueChange={(value) => handleUpdateItem(item.id, "reason", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {adjustmentReasons[formData.type].map((reason) => (
                                <SelectItem key={reason.value} value={reason.value}>
                                  {reason.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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

        {/* Summary */}
        {formData.items.length > 0 && (
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{formData.items.length}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Total Quantity</p>
                  <p className="text-2xl font-bold">{totals.totalQty}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    formData.type === "IN" ? "text-green-600" : "text-red-600"
                  )}>
                    {formData.type === "IN" ? "+" : "-"}
                    {totals.totalValue.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD"
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stock In Price Warning */}
        {formData.type === "IN" && formData.items.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-lg">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Price Entry Required</p>
              <p className="text-sm">
                For Stock In adjustments, you must enter the unit cost for each item.
                This cost will be used for inventory valuation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Discard Dialog */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
              Continue Editing
            </Button>
            <Button variant="destructive" onClick={() => router.back()}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
