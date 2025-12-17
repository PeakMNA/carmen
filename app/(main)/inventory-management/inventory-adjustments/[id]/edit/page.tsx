/**
 * ============================================================================
 * EDIT INVENTORY ADJUSTMENT PAGE
 * ============================================================================
 *
 * Form page for editing existing Draft inventory adjustments. Only Draft
 * status adjustments can be edited - Posted and Voided adjustments are
 * read-only and redirect to the view page.
 *
 * PAGE STRUCTURE:
 * 1. Header - Title, adjustment ID badge, status badge, action buttons
 * 2. Adjustment Type Indicator - Visual card showing Stock IN or OUT
 * 3. Price Entry Warning - Alert for Stock IN adjustments
 * 4. Adjustment Details - Location, Reason, Description fields
 * 5. Items Section - Product selector and editable items table
 * 6. Summary Card - Total items and value with direction indicator
 * 7. Footer - Cancel, Save Draft, and Commit buttons
 *
 * KEY DIFFERENCES FROM NEW PAGE:
 * - Loads existing adjustment data on mount
 * - Includes Delete functionality with confirmation
 * - Cannot change adjustment type (IN/OUT) - must delete and recreate
 * - Validates that adjustment is in Draft status
 * - Shows "Edit Adjustment" instead of "New Adjustment" in header
 *
 * BUSINESS RULES:
 * - Only Draft status adjustments can be edited
 * - Posted adjustments cannot be modified (already created journal entries)
 * - Voided adjustments cannot be modified (cancelled)
 * - Stock OUT uses system average cost (read-only)
 * - Stock IN requires manual unit cost entry
 *
 * FORM ACTIONS:
 * - Delete: Permanently removes the draft adjustment
 * - Save Draft: Saves changes without posting
 * - Commit Adjustment: Validates and posts the adjustment (creates journal entries)
 *
 * TODO: Replace mock data with API calls:
 * - GET /api/inventory-adjustments/:id - Fetch existing adjustment
 * - PUT /api/inventory-adjustments/:id - Update draft adjustment
 * - DELETE /api/inventory-adjustments/:id - Delete draft adjustment
 * - POST /api/inventory-adjustments/:id/post - Post adjustment
 *
 * ============================================================================
 */

'use client'

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useMemo, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Save,
  Send,
  Trash2,
  Plus,
  Search,
  Package,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ArrowUpCircle,
  ArrowDownCircle,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import StatusBadge from "@/components/ui/custom-status-badge"
import { getCategoryOptionsForType } from "@/lib/mock-data/transaction-categories"
import type { AdjustmentType } from "@/lib/types/transaction-category"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// Local interfaces for form state and data structures.
// These mirror the types used in the new adjustment page but include
// additional fields for tracking existing adjustment data.
// ============================================================================
// Note: AdjustmentType is imported from @/lib/types/transaction-category

interface AdjustmentItem {
  id: string
  productId: string
  productName: string
  sku: string
  currentStock: number
  adjustmentQty: number
  unit: string
  unitCost: number
  totalCost: number
  reason: string
  notes?: string
}

/** Inventory location where adjustment will be applied */
interface Location {
  id: string
  name: string
  code: string
}

// ============================================================================
// MOCK DATA
// ============================================================================
// Sample data for development and testing. Includes locations, products,
// adjustment reasons, and existing adjustment records for loading.
//
// TODO: Replace with API calls:
// - GET /api/locations - Fetch available locations
// - GET /api/products - Fetch products with stock levels
// - GET /api/inventory-adjustments/:id - Fetch existing adjustment
// ============================================================================
const mockLocations: Location[] = [
  { id: "loc-1", name: "Main Warehouse", code: "WH-001" },
  { id: "loc-2", name: "Production Store", code: "PS-001" },
  { id: "loc-3", name: "Cold Storage", code: "CS-001" },
  { id: "loc-4", name: "Dry Store", code: "DS-001" }
]

// ============================================================================
// CATEGORY/REASON FEATURE
// ============================================================================
// Categories and reasons are now managed via Transaction Category master CRUD:
// - Navigate to: /inventory-management/transaction-categories
// - Data is loaded from: getCategoryOptionsForType() from @/lib/mock-data/transaction-categories
// ============================================================================

const mockProducts = [
  { id: "prod-1", name: "Organic Quinoa", sku: "GRN-QNA-001", unit: "KG", currentStock: 50, avgCost: 45.50 },
  { id: "prod-2", name: "Brown Rice", sku: "GRN-RCE-002", unit: "KG", currentStock: 70, avgCost: 28.75 },
  { id: "prod-3", name: "Chia Seeds", sku: "GRN-CHA-003", unit: "KG", currentStock: 40, avgCost: 53.35 },
  { id: "prod-4", name: "Olive Oil Extra Virgin", sku: "OIL-OLV-001", unit: "L", currentStock: 25, avgCost: 89.99 },
  { id: "prod-5", name: "Whole Wheat Flour", sku: "FLR-WHT-001", unit: "KG", currentStock: 100, avgCost: 12.50 },
  { id: "prod-6", name: "Coconut Sugar", sku: "SGR-COC-001", unit: "KG", currentStock: 30, avgCost: 35.00 },
  { id: "prod-7", name: "Almond Butter", sku: "NUT-ALM-001", unit: "JAR", currentStock: 45, avgCost: 24.99 },
  { id: "prod-8", name: "Organic Honey", sku: "SWT-HNY-001", unit: "JAR", currentStock: 60, avgCost: 18.50 }
]

// Mock existing adjustments (matching the detail page)
const mockAdjustments: Record<string, {
  id: string
  date: string
  type: AdjustmentType
  status: string
  location: string
  locationId: string
  category: string    // Header-level category code
  reason: string      // Item-level reason (for display, items have their own reasons)
  description: string
  items: AdjustmentItem[]
}> = {
  "ADJ-2410-001": {
    id: "ADJ-2410-001",
    date: "2024-01-15",
    type: "IN",
    status: "Posted",
    location: "Main Warehouse",
    locationId: "loc-1",
    category: "FND",
    reason: "CNV",
    description: "Adjustment based on monthly physical inventory count",
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Organic Quinoa",
        sku: "GRN-QNA-001",
        currentStock: 50,
        adjustmentQty: 25,
        unit: "KG",
        unitCost: 45.50,
        totalCost: 1137.50,
        reason: "Physical Count Variance",
        notes: ""
      },
      {
        id: "item-2",
        productId: "prod-2",
        productName: "Brown Rice",
        sku: "GRN-RCE-002",
        currentStock: 70,
        adjustmentQty: 50,
        unit: "KG",
        unitCost: 28.75,
        totalCost: 1437.50,
        reason: "Physical Count Variance",
        notes: ""
      }
    ]
  },
  "ADJ-2410-002": {
    id: "ADJ-2410-002",
    date: "2024-01-16",
    type: "OUT",
    status: "Posted",
    location: "Main Warehouse",
    locationId: "loc-1",
    category: "WST",
    reason: "DMG",
    description: "Write-off for damaged items found during inspection",
    items: [
      {
        id: "item-3",
        productId: "prod-4",
        productName: "Olive Oil Extra Virgin",
        sku: "OIL-OLV-001",
        currentStock: 15,
        adjustmentQty: 5,
        unit: "L",
        unitCost: 89.99,
        totalCost: 449.95,
        reason: "Damaged Goods",
        notes: "Bottles cracked during handling"
      }
    ]
  },
  "ADJ-2410-003": {
    id: "ADJ-2410-003",
    date: "2024-01-17",
    type: "IN",
    status: "Posted",
    location: "Production Store",
    locationId: "loc-2",
    category: "COR",
    reason: "REC",
    description: "System reconciliation after inventory audit",
    items: [
      {
        id: "item-4",
        productId: "prod-5",
        productName: "Black Pepper Ground",
        sku: "SPC-PEP-001",
        currentStock: 25,
        adjustmentQty: 15,
        unit: "KG",
        unitCost: 32.50,
        totalCost: 487.50,
        reason: "System Reconciliation",
        notes: ""
      },
      {
        id: "item-5",
        productId: "prod-6",
        productName: "Sea Salt",
        sku: "SPC-SLT-001",
        currentStock: 100,
        adjustmentQty: 30,
        unit: "KG",
        unitCost: 8.25,
        totalCost: 247.50,
        reason: "System Reconciliation",
        notes: ""
      }
    ]
  },
  "ADJ-2410-004": {
    id: "ADJ-2410-004",
    date: "2024-01-18",
    type: "OUT",
    status: "Draft",
    location: "Main Warehouse",
    locationId: "loc-1",
    category: "QLT",
    reason: "QCR",
    description: "Items rejected during quality control inspection",
    items: [
      {
        id: "item-6",
        productId: "prod-5",
        productName: "Whole Wheat Flour",
        sku: "FLR-WHT-001",
        currentStock: 100,
        adjustmentQty: 20,
        unit: "KG",
        unitCost: 12.50,
        totalCost: 250.00,
        reason: "Quality Control Rejection",
        notes: "Moisture damage detected"
      }
    ]
  },
  "ADJ-2410-005": {
    id: "ADJ-2410-005",
    date: "2024-01-18",
    type: "IN",
    status: "Draft",
    location: "Production Store",
    locationId: "loc-2",
    category: "FND",
    reason: "CNV",
    description: "Adjustment based on spot check findings",
    items: [
      {
        id: "item-7",
        productId: "prod-7",
        productName: "Chicken Breast",
        sku: "MEA-CHK-001",
        currentStock: 75,
        adjustmentQty: 25,
        unit: "KG",
        unitCost: 12.50,
        totalCost: 312.50,
        reason: "Spot Check Variance",
        notes: ""
      }
    ]
  },
  "ADJ-2410-006": {
    id: "ADJ-2410-006",
    date: "2024-01-19",
    type: "OUT",
    status: "Voided",
    location: "Main Warehouse",
    locationId: "loc-1",
    category: "WST",
    reason: "EXP",
    description: "Write-off for expired inventory items - VOIDED",
    items: [
      {
        id: "item-8",
        productId: "prod-8",
        productName: "Salmon Fillet",
        sku: "SEA-SAL-001",
        currentStock: 30,
        adjustmentQty: 50,
        unit: "KG",
        unitCost: 28.00,
        totalCost: 1400.00,
        reason: "Expired Items",
        notes: ""
      }
    ]
  },
  "ADJ-2410-007": {
    id: "ADJ-2410-007",
    date: "2024-01-19",
    type: "IN",
    status: "Posted",
    location: "Production Store",
    locationId: "loc-2",
    category: "RTN",
    reason: "PRD",
    description: "Adjustment for production yield variance",
    items: [
      {
        id: "item-9",
        productId: "prod-10",
        productName: "Tomato Sauce",
        sku: "SAU-TOM-001",
        currentStock: 120,
        adjustmentQty: 40,
        unit: "L",
        unitCost: 6.50,
        totalCost: 260.00,
        reason: "Production Yield Variance",
        notes: ""
      }
    ]
  },
  "ADJ-2410-008": {
    id: "ADJ-2410-008",
    date: "2024-01-20",
    type: "OUT",
    status: "Draft",
    location: "Main Warehouse",
    locationId: "loc-1",
    category: "LSS",
    reason: "THF",
    description: "Missing inventory items under investigation",
    items: [
      {
        id: "item-10",
        productId: "prod-3",
        productName: "Chia Seeds",
        sku: "GRN-CHA-003",
        currentStock: 80,
        adjustmentQty: 5,
        unit: "KG",
        unitCost: 53.35,
        totalCost: 266.75,
        reason: "Theft/Loss",
        notes: "Under investigation"
      }
    ]
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * EditInventoryAdjustmentPage - Form page for editing draft adjustments
 *
 * This page allows users to modify existing Draft inventory adjustments.
 * It loads the adjustment data on mount and populates the form fields.
 * Unlike the new page, users cannot change the adjustment type (IN/OUT).
 *
 * Key features:
 * - Loads existing adjustment data from URL parameter
 * - Validates adjustment is in Draft status (redirects if not)
 * - Provides Delete functionality with confirmation dialog
 * - Maintains same validation rules as new adjustment form
 *
 * @returns The edit adjustment form page
 */
export default function EditInventoryAdjustmentPage() {
  const router = useRouter()
  const params = useParams()
  const adjustmentId = params.id as string

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  // Load existing adjustment from mock data using URL parameter.
  // TODO: Replace with API call to GET /api/inventory-adjustments/:id
  // ============================================================================

  /** Existing adjustment data loaded from mock store */
  const existingAdjustment = mockAdjustments[adjustmentId]

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  // Form state initialized from existing adjustment data.
  // Unlike new page, type cannot be changed after creation.
  // ============================================================================
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>(existingAdjustment?.type || "OUT")
  const [selectedLocation, setSelectedLocation] = useState(existingAdjustment?.locationId || "")
  const [selectedCategory, setSelectedCategory] = useState(existingAdjustment?.category || "")
  const [description, setDescription] = useState(existingAdjustment?.description || "")
  const [items, setItems] = useState<AdjustmentItem[]>(existingAdjustment?.items || [])
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)
  const [productSearch, setProductSearch] = useState("")
  /** Validation error messages keyed by field name */
  const [errors, setErrors] = useState<Record<string, string>>({})

  /** Controls visibility of delete confirmation dialog */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /** Whether the adjustment can be edited (only Draft status is editable) */
  const isEditable = existingAdjustment?.status === "Draft"

  /**
   * Calculate summary totals for the adjustment
   * Aggregates quantity and value across all items for display
   */
  const totals = useMemo(() => {
    const totalQty = items.reduce((sum, item) => sum + item.adjustmentQty, 0)
    const totalValue = items.reduce((sum, item) => sum + item.totalCost, 0)
    return { totalQty, totalValue }
  }, [items])

  /**
   * Filter products based on search query
   * Matches against product name and SKU for product selector
   */
  const filteredProducts = useMemo(() => {
    if (!productSearch) return mockProducts
    const search = productSearch.toLowerCase()
    return mockProducts.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search)
    )
  }, [productSearch])

  /**
   * Get available categories based on adjustment type
   * Categories are filtered by type (IN/OUT) and active status
   */
  const availableCategories = useMemo(() => {
    return getCategoryOptionsForType(adjustmentType)
  }, [adjustmentType])

  /**
   * Get available reasons based on selected category
   * Reasons are filtered by parent category
   */
  const availableReasons = useMemo(() => {
    if (!selectedCategory) return []
    const category = availableCategories.find(c => c.value === selectedCategory)
    return category?.reasons || []
  }, [selectedCategory, availableCategories])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  // Form interaction handlers for managing adjustment items, validation,
  // and form submission actions (save, post, delete).
  // ============================================================================

  /**
   * Add a product to the adjustment items list
   * Prevents duplicate products and initializes with appropriate cost
   *
   * @param product - The product to add from the product selector
   */
  const handleAddProduct = (product: typeof mockProducts[0]) => {
    const existingItem = items.find(i => i.productId === product.id)
    if (existingItem) {
      setErrors({ product: "This product is already added" })
      return
    }

    const newItem: AdjustmentItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      currentStock: product.currentStock,
      adjustmentQty: 1,
      unit: product.unit,
      unitCost: adjustmentType === "OUT" ? product.avgCost : 0,
      totalCost: adjustmentType === "OUT" ? product.avgCost : 0,
      reason: "", // Item-level reason - user must select
      notes: ""
    }

    setItems([...items, newItem])
    setIsProductSelectorOpen(false)
    setProductSearch("")
    setErrors({})
  }

  /**
   * Update the adjustment quantity for an item
   * Recalculates total cost based on new quantity
   *
   * @param itemId - The ID of the item to update
   * @param qty - The new quantity value
   */
  const handleUpdateQuantity = (itemId: string, qty: number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, qty)
        return {
          ...item,
          adjustmentQty: newQty,
          totalCost: newQty * item.unitCost
        }
      }
      return item
    }))
  }

  /**
   * Update the unit cost for an item (Stock IN only)
   * For Stock OUT, unit cost is system average and cannot be changed
   *
   * @param itemId - The ID of the item to update
   * @param cost - The new unit cost value
   */
  const handleUpdateUnitCost = (itemId: string, cost: number) => {
    if (adjustmentType === "OUT") return
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newCost = Math.max(0, cost)
        return {
          ...item,
          unitCost: newCost,
          totalCost: item.adjustmentQty * newCost
        }
      }
      return item
    }))
  }

  /**
   * Remove an item from the adjustment
   *
   * @param itemId - The ID of the item to remove
   */
  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  /**
   * Update the reason for an item (item-level reason)
   *
   * @param itemId - The ID of the item to update
   * @param reason - The new reason code
   */
  const handleUpdateReason = (itemId: string, reason: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return { ...item, reason }
      }
      return item
    }))
  }

  /**
   * Validate the adjustment form before submission
   * Checks required fields, item requirements, and cost entries
   *
   * @returns True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedLocation) {
      newErrors.location = "Please select a location"
    }
    if (!selectedCategory) {
      newErrors.category = "Please select a category"
    }
    if (items.length === 0) {
      newErrors.items = "Please add at least one item"
    }

    // Validate that all items have a reason (item-level)
    const itemsWithoutReason = items.filter(item => !item.reason)
    if (itemsWithoutReason.length > 0) {
      newErrors.reason = "All items must have a reason selected"
    }

    // For Stock IN, validate that all items have unit cost
    if (adjustmentType === "IN") {
      const itemsWithoutCost = items.filter(item => item.unitCost <= 0)
      if (itemsWithoutCost.length > 0) {
        newErrors.unitCost = "All items must have a unit cost for Stock In adjustments"
      }
    }

    // Validate quantities
    const itemsWithZeroQty = items.filter(item => item.adjustmentQty <= 0)
    if (itemsWithZeroQty.length > 0) {
      newErrors.quantity = "All items must have a quantity greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Save the adjustment as a draft
   * Validates form and persists changes without posting
   * TODO: Replace with API call to PUT /api/inventory-adjustments/:id
   */
  const handleSaveDraft = () => {
    if (!validateForm()) return
    console.log("Saving draft:", { adjustmentType, selectedLocation, selectedCategory, description, items })
    router.push("/inventory-management/inventory-adjustments")
  }

  /**
   * Post the adjustment (finalize and create journal entries)
   * Validates form, posts adjustment, and redirects to list
   * TODO: Replace with API call to POST /api/inventory-adjustments/:id/post
   */
  const handlePost = () => {
    if (!validateForm()) return
    console.log("Posting adjustment:", { adjustmentType, selectedLocation, selectedCategory, description, items })
    router.push("/inventory-management/inventory-adjustments")
  }

  /**
   * Delete the draft adjustment permanently
   * Called after user confirms in the delete dialog
   * TODO: Replace with API call to DELETE /api/inventory-adjustments/:id
   */
  const handleDelete = () => {
    console.log("Deleting adjustment:", adjustmentId)
    router.push("/inventory-management/inventory-adjustments")
  }

  // ============================================================================
  // ERROR STATES
  // ============================================================================
  // Handle cases where adjustment doesn't exist or cannot be edited.
  // These render early-return error pages with navigation options.
  // ============================================================================

  // Adjustment not found - show error with back link
  if (!existingAdjustment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Adjustment Not Found</h2>
        <p className="text-muted-foreground">The adjustment you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/inventory-management/inventory-adjustments")}>
          Back to Adjustments
        </Button>
      </div>
    )
  }

  // Adjustment is not in Draft status - cannot be edited
  if (!isEditable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Cannot Edit This Adjustment</h2>
        <p className="text-muted-foreground">
          Only draft adjustments can be edited. This adjustment is {existingAdjustment.status.toLowerCase()}.
        </p>
        <Button onClick={() => router.push(`/inventory-management/inventory-adjustments/${adjustmentId}`)}>
          View Adjustment
        </Button>
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  // Main edit form with header, type indicator, form fields, items table,
  // summary card, and footer action buttons.
  // ============================================================================

  /** Display name for the selected location */
  const locationName = mockLocations.find(l => l.id === selectedLocation)?.name || "Select Location"

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER - Title, ID badge, status, and action buttons              */}
      {/* Includes Delete (with confirmation), Save Draft, and Commit       */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">Edit Adjustment</h1>
                <Badge variant="outline">{existingAdjustment.id}</Badge>
                <StatusBadge status={existingAdjustment.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {adjustmentType === "IN" ? "Stock In" : "Stock Out"} - {locationName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Adjustment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this adjustment? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handlePost}>
              <Send className="h-4 w-4 mr-2" />
              Commit Adjustment
            </Button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CONTENT - Main form content area                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 p-4 space-y-6">
        {/* Type Indicator - Visual display of Stock IN (green) or OUT (red) */}
        <Card className={cn(
          "border-2",
          adjustmentType === "OUT" ? "border-red-200 bg-red-50/50" : "border-green-200 bg-green-50/50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {adjustmentType === "OUT" ? (
                <ArrowDownCircle className="h-8 w-8 text-red-600" />
              ) : (
                <ArrowUpCircle className="h-8 w-8 text-green-600" />
              )}
              <div>
                <h2 className={cn(
                  "text-lg font-semibold",
                  adjustmentType === "OUT" ? "text-red-700" : "text-green-700"
                )}>
                  {adjustmentType === "OUT" ? "Stock Out Adjustment" : "Stock In Adjustment"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {adjustmentType === "OUT"
                    ? "Reducing inventory quantities (uses system average cost)"
                    : "Increasing inventory quantities (price entry required)"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Entry Warning - Alert shown for Stock IN adjustments */}
        {adjustmentType === "IN" && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-700">
              <strong>Price Entry Required:</strong> You must enter the unit cost for each item when adding stock.
            </p>
          </div>
        )}

        {/* Adjustment Details - Location and Category (header-level) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger id="location" className={errors.location ? "border-red-500" : ""}>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select location" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {mockLocations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value)
                // Reset all item reasons when category changes
                setItems(items.map(item => ({ ...item, reason: "" })))
              }}
            >
              <SelectTrigger id="category" className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter additional details about this adjustment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* ITEMS SECTION - Product selector and editable items table       */}
        {/* ---------------------------------------------------------------- */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Adjustment Items</CardTitle>
                <CardDescription>
                  {items.length} item(s) • Total Value: {totals.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </CardDescription>
              </div>
              <Popover open={isProductSelectorOpen} onOpenChange={setIsProductSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="end">
                  <Command>
                    <CommandInput
                      placeholder="Search products..."
                      value={productSearch}
                      onValueChange={setProductSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup>
                        {filteredProducts.map(product => (
                          <CommandItem
                            key={product.id}
                            value={product.id}
                            onSelect={() => handleAddProduct(product)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.sku} • Stock: {product.currentStock} {product.unit}
                                </p>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ${product.avgCost.toFixed(2)}/{product.unit}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            {errors.items && (
              <p className="text-sm text-red-500 mb-3">{errors.items}</p>
            )}
            {errors.reason && (
              <p className="text-sm text-red-500 mb-3">{errors.reason}</p>
            )}
            {errors.unitCost && (
              <p className="text-sm text-red-500 mb-3">{errors.unitCost}</p>
            )}
            {errors.quantity && (
              <p className="text-sm text-red-500 mb-3">{errors.quantity}</p>
            )}

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-3" />
                <p>No items added yet</p>
                <p className="text-sm">Click "Add Item" to add products to this adjustment</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[160px]">Reason *</TableHead>
                    <TableHead className="text-center w-[100px]">Current Stock</TableHead>
                    <TableHead className="text-center w-[120px]">Adj. Qty</TableHead>
                    {adjustmentType === "IN" && (
                      <TableHead className="text-right w-[120px]">Unit Cost *</TableHead>
                    )}
                    {adjustmentType === "OUT" && (
                      <TableHead className="text-right w-[120px]">Avg Cost</TableHead>
                    )}
                    <TableHead className="text-right w-[120px]">Total Value</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.reason}
                          onValueChange={(value) => handleUpdateReason(item.id, value)}
                          disabled={!selectedCategory}
                        >
                          <SelectTrigger className={cn(
                            "w-[150px]",
                            !item.reason && "border-red-500"
                          )}>
                            <SelectValue placeholder={selectedCategory ? "Select reason" : "Select category first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableReasons.map(reason => (
                              <SelectItem key={reason.value} value={reason.value}>
                                {reason.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.adjustmentQty}
                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-20 text-center mx-auto"
                        />
                      </TableCell>
                      {adjustmentType === "IN" ? (
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost || ""}
                            onChange={(e) => handleUpdateUnitCost(item.id, parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className={cn(
                              "w-24 text-right ml-auto",
                              item.unitCost <= 0 && "border-red-500"
                            )}
                          />
                        </TableCell>
                      ) : (
                        <TableCell className="text-right text-muted-foreground">
                          ${item.unitCost.toFixed(2)}
                        </TableCell>
                      )}
                      <TableCell className="text-right font-medium">
                        ${item.totalCost.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Summary Card - Total items and value with direction indicator */}
        {items.length > 0 && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Summary</p>
                  <p className="text-lg font-semibold">
                    {totals.totalQty} items • {totals.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} total value
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {adjustmentType === "OUT" ? (
                    <Badge variant="destructive" className="text-sm">
                      <ArrowDownCircle className="h-3 w-3 mr-1" />
                      Stock Decrease
                    </Badge>
                  ) : (
                    <Badge className="text-sm bg-green-600">
                      <ArrowUpCircle className="h-3 w-3 mr-1" />
                      Stock Increase
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  )
}
