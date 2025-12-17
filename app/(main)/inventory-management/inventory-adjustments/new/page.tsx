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

import { useState, useMemo, useCallback, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  Check,
  ChevronsUpDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { getCategoryOptionsForType } from "@/lib/mock-data/transaction-categories"
import type { AdjustmentType } from "@/lib/types/transaction-category"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// Note: AdjustmentType is imported from @/lib/types/transaction-category

/**
 * Represents a single item in the adjustment form.
 * Contains product details, quantities, costs, and per-item reason.
 *
 * CATEGORY/REASON FEATURE:
 * - Category is at header level (AdjustmentFormData.category)
 * - Reason is per-item, filtered by the header-level category
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
  reason: string    // CATEGORY/REASON: Specific reason within header-level category
  notes?: string
}

/**
 * Complete form data structure for creating a new adjustment.
 * Tracks header information and all line items.
 *
 * CATEGORY/REASON FEATURE:
 * - category: Header-level category for financial reporting (maps to GL accounts)
 * - items[].reason: Item-level reason filtered by the header category
 */
interface AdjustmentFormData {
  type: AdjustmentType
  date: string
  locationId: string
  locationName: string
  category: string    // CATEGORY/REASON: Header-level category for financial reporting
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

// ============================================================================
// CATEGORY/REASON FEATURE - Two-Level Classification System
// ============================================================================
//
// PURPOSE:
// Implements a two-level Category → Reason structure for financial reporting
// and GL account mapping. This allows:
// - Categories at HEADER level: Maps to GL accounts (Wastage Expense, COGS, etc.)
// - Reasons at ITEM level: Provides specific detail within each category
//
// STRUCTURE:
// - Category is selected once per adjustment (header-level)
// - Each item can have a different reason within the selected category
// - When category changes, all item reasons are reset
// - When type (IN/OUT) changes, category and reasons are reset
//
// DATA SOURCE:
// Categories and reasons are now managed via Transaction Category master CRUD:
// - Navigate to: /inventory-management/transaction-categories
// - Data is loaded from: getCategoryOptionsForType() from @/lib/mock-data/transaction-categories
// - TODO: Replace mock data with API call: GET /api/transaction-categories?type={IN|OUT}
// ============================================================================

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
function NewInventoryAdjustmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read type from URL query param (?type=in or ?type=out)
  const preselectedType = searchParams.get('type')

  // Type is locked when pre-selected from URL (create from specific tab) or in edit mode
  const isTypeLocked = preselectedType === 'in' || preselectedType === 'out'

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Loading state during save operation */
  const [isSaving, setIsSaving] = useState(false)

  /** Controls visibility of discard confirmation dialog */
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)

  /** Validation errors keyed by field name or item ID */
  const [errors, setErrors] = useState<Record<string, string>>({})

  /**
   * Main form data containing all adjustment information.
   *
   * CATEGORY/REASON FEATURE:
   * - category: Initialized empty, user selects from dropdown
   * - items[].reason: Set when adding items (filtered by category)
   */
  const [formData, setFormData] = useState<AdjustmentFormData>(() => ({
    type: preselectedType === 'in' ? "IN" : "OUT",
    date: format(new Date(), "yyyy-MM-dd"),
    locationId: "",
    locationName: "",
    category: "",       // CATEGORY/REASON: Header-level category for financial reporting
    description: "",
    items: [],
  }))

  // Inline Add Item state (store requisition pattern)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [newItemProductId, setNewItemProductId] = useState<string>("")
  const [newItemQty, setNewItemQty] = useState(1)
  const [newItemUnitCost, setNewItemUnitCost] = useState<number>(0)
  const [newItemReason, setNewItemReason] = useState("")

  // Bulk selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([])

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

  /**
   * Get available products for inline add (excludes already added items)
   */
  const availableProducts = useMemo(() => {
    const excludeIds = formData.items.map(item => item.productId)
    return mockProducts.filter(p => !excludeIds.includes(p.id))
  }, [formData.items])

  /**
   * Get selected product details for inline add row
   */
  const selectedProduct = useMemo(() => {
    return mockProducts.find(p => p.id === newItemProductId)
  }, [newItemProductId])

  /**
   * Check if all items are selected
   */
  const isAllSelected = formData.items.length > 0 && selectedItems.length === formData.items.length

  /**
   * CATEGORY/REASON FEATURE: Get available categories from master CRUD
   *
   * Uses getCategoryOptionsForType to load active categories filtered by adjustment type.
   * This data is managed via /inventory-management/transaction-categories
   */
  const availableCategories = useMemo(() => {
    return getCategoryOptionsForType(formData.type)
  }, [formData.type])

  /**
   * CATEGORY/REASON FEATURE: Get available reasons based on header-level category
   *
   * This filters the reasons array based on the selected header-level category.
   * When no category is selected, returns empty array (item reason dropdowns are disabled).
   * When category changes, this automatically updates to show new available reasons.
   */
  const availableReasons = useMemo(() => {
    if (!formData.category) return []
    const category = availableCategories.find(c => c.value === formData.category)
    return category?.reasons || []
  }, [formData.category, availableCategories])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

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
   * Checks required fields, item quantities, unit costs, and category/reason.
   *
   * CATEGORY/REASON FEATURE: Validates:
   * - Header-level category is required
   * - Each item has a reason selected (within the category)
   *
   * @returns true if form is valid, false otherwise
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.locationId) {
      newErrors.location = "Location is required"
    }
    // CATEGORY/REASON: Validate header-level category
    if (!formData.category) {
      newErrors.category = "Category is required"
    }
    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required"
    }

    // For Stock IN, validate unit cost for each item
    if (formData.type === "IN") {
      formData.items.forEach((item) => {
        if (!item.unitCost || item.unitCost <= 0) {
          newErrors[`item_${item.id}_cost`] = "Unit cost is required for Stock In"
        }
      })
    }

    // Validate quantities and reason for each item
    formData.items.forEach((item) => {
      if (item.adjustmentQty <= 0) {
        newErrors[`item_${item.id}_qty`] = "Quantity must be greater than 0"
      }
      // For Stock OUT, check if quantity exceeds current stock
      if (formData.type === "OUT" && item.adjustmentQty > item.currentStock) {
        newErrors[`item_${item.id}_qty`] = `Cannot exceed current stock (${item.currentStock})`
      }
      // CATEGORY/REASON: Validate item-level reason is set
      if (!item.reason) {
        newErrors[`item_${item.id}_reason`] = "Reason is required"
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
   *
   * CATEGORY/REASON FEATURE: When type changes:
   * 1. Resets header-level category (as available categories differ by type)
   * 2. Resets all item-level reasons (as they depend on category)
   * 3. Recalculates item costs based on the new type
   *
   * @param type - The new adjustment type
   */
  const handleTypeChange = (type: AdjustmentType) => {
    if (formData.items.length > 0) {
      // CATEGORY/REASON: Reset category and all item reasons when type changes
      setFormData(prev => ({
        ...prev,
        type,
        category: "", // Reset category as options differ by type
        items: prev.items.map(item => {
          const product = mockProducts.find(p => p.id === item.productId)
          return {
            ...item,
            unitCost: type === "IN" ? 0 : (product?.avgCost || 0),
            totalCost: type === "IN" ? 0 : item.adjustmentQty * (product?.avgCost || 0),
            reason: "",   // Reset reason as it depends on category
          }
        })
      }))
    } else {
      setFormData(prev => ({ ...prev, type, category: "" }))
    }
    // Also reset inline add state
    setNewItemReason("")
  }

  // ============================================================================
  // INLINE ADD ITEM HANDLERS
  // ============================================================================

  /**
   * Start adding a new item (shows inline add row)
   */
  const handleStartAddItem = () => {
    setIsAddingItem(true)
    setNewItemProductId("")
    setNewItemQty(1)
    setNewItemUnitCost(0)
    setNewItemReason("")
  }

  /**
   * Confirm and add the new item from inline row
   */
  const handleConfirmAddItem = () => {
    if (!selectedProduct) return

    const newItem: AdjustmentItem = {
      id: generateId(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      unit: selectedProduct.unit,
      currentStock: selectedProduct.currentStock,
      adjustmentQty: newItemQty,
      unitCost: formData.type === "IN" ? newItemUnitCost : (selectedProduct.avgCost || 0),
      totalCost: formData.type === "IN"
        ? newItemQty * newItemUnitCost
        : newItemQty * (selectedProduct.avgCost || 0),
      reason: newItemReason,
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }))

    // Reset inline add state
    setIsAddingItem(false)
    setNewItemProductId("")
    setNewItemQty(1)
    setNewItemUnitCost(0)
    setNewItemReason("")
  }

  /**
   * Cancel adding a new item
   */
  const handleCancelAddItem = () => {
    setIsAddingItem(false)
    setNewItemProductId("")
    setNewItemQty(1)
    setNewItemUnitCost(0)
    setNewItemReason("")
  }

  // ============================================================================
  // BULK SELECTION HANDLERS
  // ============================================================================

  /**
   * Toggle select all items
   */
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([])
    } else {
      setSelectedItems(formData.items.map(item => item.id))
    }
  }

  /**
   * Toggle select a single item
   */
  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  /**
   * Remove all selected items
   */
  const handleRemoveSelected = () => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => !selectedItems.includes(item.id))
    }))
    setSelectedItems([])
  }

  /**
   * Check if form has any user changes.
   * Used to warn user before discarding unsaved changes.
   *
   * CATEGORY/REASON FEATURE: Includes category in change detection
   */
  const hasChanges = formData.locationId || formData.category || formData.description || formData.items.length > 0

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
              onClick={() => hasChanges ? setShowDiscardDialog(true) : router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
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
            {isTypeLocked && (
              <p className="text-sm text-muted-foreground">
                Type is locked based on your selection from the list screen
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => !isTypeLocked && handleTypeChange("OUT")}
                disabled={isTypeLocked}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                  formData.type === "OUT"
                    ? "border-red-500 bg-red-50"
                    : "border-muted hover:border-muted-foreground/30",
                  isTypeLocked && "cursor-not-allowed opacity-60"
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
                onClick={() => !isTypeLocked && handleTypeChange("IN")}
                disabled={isTypeLocked}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                  formData.type === "IN"
                    ? "border-green-500 bg-green-50"
                    : "border-muted hover:border-muted-foreground/30",
                  isTypeLocked && "cursor-not-allowed opacity-60"
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

              {/*
                CATEGORY/REASON FEATURE: Header-Level Category Dropdown

                This is the first level of the two-level classification system.
                - Categories are filtered by adjustment type (IN/OUT)
                - When category changes, all item-level reasons are reset
                - Maps to GL accounts for financial reporting
              */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    // CATEGORY/REASON: Reset all item reasons when category changes
                    setFormData(prev => ({
                      ...prev,
                      category: value,
                      items: prev.items.map(item => ({ ...item, reason: "" }))
                    }))
                  }}
                >
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
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
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Adjustment Items</CardTitle>
              {errors.items && (
                <p className="text-sm text-red-500 mt-1">{errors.items}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Bulk delete button - shows when items are selected */}
              {selectedItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSelected}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove ({selectedItems.length})
                </Button>
              )}
              {/* Add Item button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartAddItem}
                disabled={isAddingItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.items.length === 0 && !isAddingItem ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-3" />
                <p className="font-medium">No items added</p>
                <p className="text-sm">Click &quot;Add Item&quot; to add products to this adjustment</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="w-[40px] p-3">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all items"
                        />
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground">Product</th>
                      <th className="w-[100px] p-3 text-right text-xs font-medium text-muted-foreground">Stock</th>
                      <th className="w-[100px] p-3 text-right text-xs font-medium text-muted-foreground">Quantity</th>
                      {formData.type === "IN" && (
                        <th className="w-[100px] p-3 text-right text-xs font-medium text-muted-foreground">Unit Cost</th>
                      )}
                      <th className="w-[100px] p-3 text-right text-xs font-medium text-muted-foreground">Total</th>
                      <th className="w-[160px] p-3 text-xs font-medium text-muted-foreground">Reason</th>
                      <th className="w-[60px] p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formData.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="p-3">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleSelectItem(item.id)}
                            aria-label={`Select ${item.productName}`}
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-xs text-muted-foreground">{item.sku}</div>
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="1"
                            max={formData.type === "OUT" ? item.currentStock : undefined}
                            value={item.adjustmentQty}
                            onChange={(e) => handleUpdateItem(item.id, "adjustmentQty", parseFloat(e.target.value) || 0)}
                            className={cn(
                              "w-20 h-8 text-right ml-auto",
                              errors[`item_${item.id}_qty`] ? "border-red-500" : ""
                            )}
                          />
                        </td>
                        {formData.type === "IN" && (
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitCost || ""}
                              onChange={(e) => handleUpdateItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className={cn(
                                "w-20 h-8 text-right ml-auto",
                                errors[`item_${item.id}_cost`] ? "border-red-500" : ""
                              )}
                            />
                          </td>
                        )}
                        <td className="p-3 text-right font-medium">
                          {item.totalCost.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD"
                          })}
                        </td>
                        {/*
                          CATEGORY/REASON FEATURE: Item-Level Reason Dropdown

                          This is the second level of the two-level classification system.
                          - Reasons are filtered by the header-level category (availableReasons)
                          - Disabled until a category is selected at header level
                          - Each item can have a different reason within the same category
                        */}
                        <td className="p-3">
                          <Select
                            value={item.reason}
                            onValueChange={(value) => handleUpdateItem(item.id, "reason", value)}
                            disabled={!formData.category}
                          >
                            <SelectTrigger className={cn(
                              "h-8 text-xs",
                              errors[`item_${item.id}_reason`] ? "border-red-500" : "",
                              !formData.category && "opacity-50"
                            )}>
                              <SelectValue placeholder={formData.category ? "Select reason..." : "Select category first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableReasons.map((reason) => (
                                <SelectItem key={reason.value} value={reason.value}>
                                  {reason.label}
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

                    {/* Inline Add Item Row */}
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
                                    <span className="text-sm font-medium truncate max-w-[180px]">{selectedProduct.name}</span>
                                    <span className="text-xs text-muted-foreground">{selectedProduct.sku}</span>
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
                                <CommandInput placeholder="Search by name or SKU..." />
                                <CommandList>
                                  <CommandEmpty>No product found.</CommandEmpty>
                                  <CommandGroup heading="Products">
                                    {availableProducts.map((product) => (
                                      <CommandItem
                                        key={product.id}
                                        value={`${product.name} ${product.sku}`}
                                        onSelect={() => {
                                          setNewItemProductId(product.id)
                                          setProductSearchOpen(false)
                                        }}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">{product.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {product.sku} · {product.unit} · Stock: {product.currentStock}
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
                        <td className="p-3 text-right text-muted-foreground">
                          {selectedProduct ? `${selectedProduct.currentStock} ${selectedProduct.unit}` : '-'}
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="1"
                            max={formData.type === "OUT" && selectedProduct ? selectedProduct.currentStock : undefined}
                            value={newItemQty}
                            onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 h-8 text-right ml-auto"
                          />
                        </td>
                        {formData.type === "IN" && (
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={newItemUnitCost || ""}
                              onChange={(e) => setNewItemUnitCost(parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-20 h-8 text-right ml-auto"
                            />
                          </td>
                        )}
                        <td className="p-3 text-right font-medium">
                          {selectedProduct
                            ? (formData.type === "IN"
                                ? newItemQty * newItemUnitCost
                                : newItemQty * (selectedProduct.avgCost || 0)
                              ).toLocaleString("en-US", { style: "currency", currency: "USD" })
                            : '-'
                          }
                        </td>
                        {/*
                          CATEGORY/REASON FEATURE: Inline Add Row - Reason Dropdown

                          Same two-level classification for new items being added.
                          Uses the same availableReasons computed from header-level category.
                        */}
                        <td className="p-3">
                          <Select
                            value={newItemReason}
                            onValueChange={setNewItemReason}
                            disabled={!formData.category}
                          >
                            <SelectTrigger className={cn(
                              "h-8 text-xs",
                              !formData.category && "opacity-50"
                            )}>
                              <SelectValue placeholder={formData.category ? "Select reason..." : "Select category first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableReasons.map((reason) => (
                                <SelectItem key={reason.value} value={reason.value}>
                                  {reason.label}
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

export default function NewInventoryAdjustmentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <NewInventoryAdjustmentContent />
    </Suspense>
  )
}
