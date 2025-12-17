/**
 * ============================================================================
 * NEW WASTAGE REPORT PAGE
 * ============================================================================
 *
 * Form page for creating new wastage reports. Based on the Inventory Adjustment
 * Stock Out form pattern with two-level Category → Reason classification.
 *
 * PAGE STRUCTURE:
 * 1. Header - Title, Cancel, Save as Draft, Submit for Review buttons
 * 2. Report Details - Date, Location, Category (header-level)
 * 3. Items Section - Product selector and items table with inline add
 * 4. Attachments Section - Evidence upload
 * 5. Summary Card - Total items, quantity, and loss value
 *
 * KEY BUSINESS RULES:
 * - Category defaults to "Wastage" (WST) for Stock OUT adjustments
 * - Uses system average cost (no manual price entry)
 * - Location is required
 * - Category is required
 * - At least one item is required
 * - Each item requires a reason within the selected category
 *
 * ============================================================================
 */

"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X,
  Search,
  Package,
  AlertCircle,
  Check,
  ChevronsUpDown,
  Send,
  Upload,
  FileText,
  Image as ImageIcon,
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

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface WastageItem {
  id: string
  productId: string
  productName: string
  sku: string
  category: string        // Product category (e.g., Beverages)
  currentStock: number
  quantity: number
  unit: string
  unitCost: number
  totalLoss: number
  reason: string          // Reason within the header-level wastage category
  remarks?: string
}

interface WastageFormData {
  date: string
  locationId: string
  locationName: string
  wastageCategory: string  // Header-level category (defaults to WST)
  description: string
  items: WastageItem[]
}

interface Attachment {
  id: string
  name: string
  size: string
  type: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockLocations = [
  { id: "loc-001", name: "Main Kitchen", code: "MK-001", type: "INVENTORY" },
  { id: "loc-002", name: "Pastry Kitchen", code: "PK-001", type: "INVENTORY" },
  { id: "loc-003", name: "Rooftop Restaurant", code: "RR-001", type: "DIRECT" },
  { id: "loc-004", name: "Pool Bar", code: "PB-001", type: "DIRECT" },
  { id: "loc-005", name: "Main Warehouse", code: "WH-001", type: "INVENTORY" },
]

const mockProducts = [
  { id: "prod-001", name: "Thai Milk Tea Powder", sku: "BEV-001", category: "Beverages", unit: "Box", currentStock: 25, avgCost: 45.99 },
  { id: "prod-002", name: "Premium Coffee Beans", sku: "BEV-002", category: "Beverages", unit: "Bag", currentStock: 45, avgCost: 28.50 },
  { id: "prod-003", name: "Vodka Premium", sku: "LIQ-001", category: "Spirits", unit: "Bottle", currentStock: 18, avgCost: 85.00 },
  { id: "prod-004", name: "Orange Juice Fresh", sku: "LIQ-003", category: "Beverages", unit: "Liter", currentStock: 60, avgCost: 8.50 },
  { id: "prod-005", name: "Wagyu Beef Premium", sku: "MTT-001", category: "Meat & Poultry", unit: "Kg", currentStock: 12, avgCost: 185.00 },
  { id: "prod-006", name: "Salmon Fillet", sku: "SEA-001", category: "Seafood", unit: "Kg", currentStock: 30, avgCost: 28.00 },
  { id: "prod-007", name: "Fresh Basil", sku: "HRB-001", category: "Herbs", unit: "Kg", currentStock: 10, avgCost: 15.00 },
  { id: "prod-008", name: "Almond Flour", sku: "DRY-015", category: "Dry Goods", unit: "Kg", currentStock: 20, avgCost: 39.10 },
  { id: "prod-009", name: "Vanilla Extract", sku: "DRY-022", category: "Dry Goods", unit: "Bottle", currentStock: 15, avgCost: 44.75 },
  { id: "prod-010", name: "Olive Oil Extra Virgin", sku: "OIL-001", category: "Oils", unit: "Liter", currentStock: 50, avgCost: 18.90 },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId() {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewWastageReportPage() {
  const router = useRouter()

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [isSaving, setIsSaving] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Main form data with wastageCategory defaulting to WST
  const [formData, setFormData] = useState<WastageFormData>({
    date: format(new Date(), "yyyy-MM-dd"),
    locationId: "",
    locationName: "",
    wastageCategory: "WST",  // Default to Wastage category
    description: "",
    items: [],
  })

  // Inline Add Item state
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [newItemProductId, setNewItemProductId] = useState<string>("")
  const [newItemQty, setNewItemQty] = useState(1)
  const [newItemReason, setNewItemReason] = useState("")
  const [newItemRemarks, setNewItemRemarks] = useState("")

  // Bulk selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([])

  // ============================================================================
  // SIDE EFFECTS
  // ============================================================================

  useEffect(() => {
    const location = mockLocations.find(l => l.id === formData.locationId)
    if (location) {
      setFormData(prev => ({ ...prev, locationName: location.name }))
    }
  }, [formData.locationId])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totals = useMemo(() => {
    const totalQty = formData.items.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = formData.items.reduce((sum, item) => sum + item.totalLoss, 0)
    return { totalQty, totalValue, itemCount: formData.items.length }
  }, [formData.items])

  const availableProducts = useMemo(() => {
    const excludeIds = formData.items.map(item => item.productId)
    return mockProducts.filter(p => !excludeIds.includes(p.id))
  }, [formData.items])

  const selectedProduct = useMemo(() => {
    return mockProducts.find(p => p.id === newItemProductId)
  }, [newItemProductId])

  const isAllSelected = formData.items.length > 0 && selectedItems.length === formData.items.length

  // Get available categories for Stock OUT (wastage is a type of stock out)
  const availableCategories = useMemo(() => {
    return getCategoryOptionsForType("OUT")
  }, [])

  // Get available reasons based on selected header-level category
  const availableReasons = useMemo(() => {
    if (!formData.wastageCategory) return []
    const category = availableCategories.find(c => c.value === formData.wastageCategory)
    return category?.reasons || []
  }, [formData.wastageCategory, availableCategories])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleUpdateItem = useCallback((itemId: string, field: keyof WastageItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== itemId) return item
        const updated = { ...item, [field]: value }
        if (field === "quantity") {
          updated.totalLoss = updated.quantity * updated.unitCost
        }
        return updated
      })
    }))
  }, [])

  const handleRemoveItem = useCallback((itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
    setSelectedItems(prev => prev.filter(id => id !== itemId))
  }, [])

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.locationId) {
      newErrors.location = "Location is required"
    }
    if (!formData.wastageCategory) {
      newErrors.category = "Category is required"
    }
    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required"
    }

    formData.items.forEach((item) => {
      if (item.quantity <= 0) {
        newErrors[`item_${item.id}_qty`] = "Quantity must be greater than 0"
      }
      if (item.quantity > item.currentStock) {
        newErrors[`item_${item.id}_qty`] = `Cannot exceed current stock (${item.currentStock})`
      }
      if (!item.reason) {
        newErrors[`item_${item.id}_reason`] = "Reason is required"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSave = async (action: 'draft' | 'submit') => {
    if (action === 'submit' && !validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const reportNumber = `WR-${format(new Date(), "yyMM")}-${String(Math.floor(Math.random() * 1000)).padStart(4, "0")}`

      console.log("Saving wastage report:", {
        ...formData,
        reportNumber,
        status: action === 'draft' ? "Draft" : "Submitted",
        attachments,
      })

      router.push("/store-operations/wastage-reporting")
    } catch (error) {
      console.error("Error saving report:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCategoryChange = (value: string) => {
    // Reset all item reasons when category changes
    setFormData(prev => ({
      ...prev,
      wastageCategory: value,
      items: prev.items.map(item => ({ ...item, reason: "" }))
    }))
    setNewItemReason("")
  }

  // ============================================================================
  // INLINE ADD ITEM HANDLERS
  // ============================================================================

  const handleStartAddItem = () => {
    setIsAddingItem(true)
    setNewItemProductId("")
    setNewItemQty(1)
    setNewItemReason("")
    setNewItemRemarks("")
  }

  const handleConfirmAddItem = () => {
    if (!selectedProduct) return

    const newItem: WastageItem = {
      id: generateId(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      category: selectedProduct.category,
      unit: selectedProduct.unit,
      currentStock: selectedProduct.currentStock,
      quantity: newItemQty,
      unitCost: selectedProduct.avgCost,
      totalLoss: newItemQty * selectedProduct.avgCost,
      reason: newItemReason,
      remarks: newItemRemarks,
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }))

    setIsAddingItem(false)
    setNewItemProductId("")
    setNewItemQty(1)
    setNewItemReason("")
    setNewItemRemarks("")
  }

  const handleCancelAddItem = () => {
    setIsAddingItem(false)
    setNewItemProductId("")
    setNewItemQty(1)
    setNewItemReason("")
    setNewItemRemarks("")
  }

  // ============================================================================
  // BULK SELECTION HANDLERS
  // ============================================================================

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([])
    } else {
      setSelectedItems(formData.items.map(item => item.id))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleRemoveSelected = () => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => !selectedItems.includes(item.id))
    }))
    setSelectedItems([])
  }

  // ============================================================================
  // ATTACHMENT HANDLERS
  // ============================================================================

  const handleAddAttachment = () => {
    // Simulated file upload
    const newAttachment: Attachment = {
      id: generateId(),
      name: `evidence_${Date.now()}.jpg`,
      size: "1.2 MB",
      type: "image",
    }
    setAttachments(prev => [...prev, newAttachment])
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const hasChanges = formData.locationId || formData.description || formData.items.length > 0 || attachments.length > 0

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
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                New Wastage Report
              </h1>
              <p className="text-sm text-muted-foreground">
                Record wastage items and submit for approval
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
              onClick={() => handleSave('draft')}
              disabled={isSaving || formData.items.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => handleSave('submit')}
              disabled={isSaving || formData.items.length === 0 || !formData.locationId}
            >
              <Send className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Submit for Review"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Report Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Report Date</Label>
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

              {/* Header-level Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.wastageCategory}
                  onValueChange={handleCategoryChange}
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
                placeholder="Enter general notes about this wastage report..."
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
              <CardTitle className="text-base">Wastage Items</CardTitle>
              {errors.items && (
                <p className="text-sm text-red-500 mt-1">{errors.items}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
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
                <p className="text-sm">Click &quot;Add Item&quot; to add products to this wastage report</p>
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
                      <th className="w-[100px] p-3 text-right text-xs font-medium text-muted-foreground">Unit Cost</th>
                      <th className="w-[100px] p-3 text-right text-xs font-medium text-muted-foreground">Loss Value</th>
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
                          <div className="text-xs text-muted-foreground">{item.sku} · {item.category}</div>
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="1"
                            max={item.currentStock}
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                            className={cn(
                              "w-20 h-8 text-right ml-auto",
                              errors[`item_${item.id}_qty`] ? "border-red-500" : ""
                            )}
                          />
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          ${item.unitCost.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-medium text-red-600">
                          ${item.totalLoss.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <Select
                            value={item.reason}
                            onValueChange={(value) => handleUpdateItem(item.id, "reason", value)}
                            disabled={!formData.wastageCategory}
                          >
                            <SelectTrigger className={cn(
                              "h-8 text-xs",
                              errors[`item_${item.id}_reason`] ? "border-red-500" : "",
                              !formData.wastageCategory && "opacity-50"
                            )}>
                              <SelectValue placeholder="Select reason..." />
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
                      <tr className="bg-red-50/50 border-t-2 border-red-200">
                        <td className="p-3">
                          <span className="text-muted-foreground">-</span>
                        </td>
                        <td className="p-3">
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
                                            {product.sku} · {product.category} · Stock: {product.currentStock} {product.unit}
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
                            max={selectedProduct?.currentStock}
                            value={newItemQty}
                            onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 h-8 text-right ml-auto"
                          />
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {selectedProduct ? `$${selectedProduct.avgCost.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-3 text-right font-medium text-red-600">
                          {selectedProduct
                            ? `$${(newItemQty * selectedProduct.avgCost).toFixed(2)}`
                            : '-'
                          }
                        </td>
                        <td className="p-3">
                          <Select
                            value={newItemReason}
                            onValueChange={setNewItemReason}
                            disabled={!formData.wastageCategory}
                          >
                            <SelectTrigger className={cn(
                              "h-8 text-xs",
                              !formData.wastageCategory && "opacity-50"
                            )}>
                              <SelectValue placeholder="Select reason..." />
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

        {/* Attachments Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Evidence Attachments</CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddAttachment}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </CardHeader>
          <CardContent>
            {attachments.length === 0 ? (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/50 transition-colors"
                onClick={handleAddAttachment}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                      {attachment.type === 'image' ? (
                        <ImageIcon className="h-5 w-5 text-gray-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">{attachment.size}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {formData.items.length > 0 && (
          <Card className="bg-red-50/30 border-red-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{totals.itemCount}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Total Quantity</p>
                  <p className="text-2xl font-bold">{totals.totalQty}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Total Loss</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${totals.totalValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* High Value Warning */}
        {totals.totalValue > 100 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-lg">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">High Value Wastage</p>
              <p className="text-sm">
                This report exceeds $100 and will require manager approval before posting to inventory.
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
