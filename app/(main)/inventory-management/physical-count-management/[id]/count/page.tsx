/**
 * ============================================================================
 * PHYSICAL COUNT ENTRY PAGE
 * ============================================================================
 *
 * This page provides the mobile-first interface for entering physical inventory
 * count quantities. It's designed for warehouse/store staff to efficiently
 * count all items at a specific location.
 *
 * KEY CONCEPTS:
 *
 * 1. PHYSICAL COUNT vs SPOT CHECK:
 *    - Physical Count: Complete count of ALL items at a location
 *    - Spot Check: Sample verification of selected items
 *
 * 2. COUNTING WORKFLOW:
 *    a) User opens count for their assigned location
 *    b) System displays all items to be counted
 *    c) User enters actual quantities for each item
 *    d) System calculates variance and tracks progress
 *    e) User saves progress or completes count
 *
 * 3. VARIANCE HANDLING:
 *    - Variance = Counted Quantity - System Quantity
 *    - Variance % = (Variance / System Quantity) * 100
 *    - Items exceeding approval threshold require supervisor review
 *
 * 4. UNIT CALCULATOR:
 *    - Converts between different units (kg/g, L/ml, pcs/dozen/case)
 *    - Useful for items received in different packaging
 *    - Total is calculated in base unit and converted to item's unit
 *
 * 5. NOTES & EVIDENCE:
 *    - Variance reasons (damage, theft, spoilage, etc.)
 *    - Photo/file attachment capability
 *    - Free-text notes for observations
 *
 * 6. USER PREFERENCES:
 *    - showSystemQuantity: Toggle for blind count mode
 *    - Auto-save on quantity changes
 *
 * STATUS FLOW:
 * - pending: Item not yet counted
 * - counted: Item counted with acceptable variance
 * - variance: Item counted with variance exceeding threshold
 *
 * ============================================================================
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  Check,
  Search,
  SlidersHorizontal,
  Filter,
  Copy,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ChevronDown,
  Plus,
  Minus,
  FileText,
  Camera,
  X,
  Calculator,
  RefreshCw,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { getPhysicalCountById } from "@/lib/mock-data/physical-counts"
import { useUser } from "@/lib/context/simple-user-context"
import type {
  PhysicalCount,
  PhysicalCountItem,
  ItemCountStatus,
  VarianceReason
} from "../../types"

// ============================================================================
// VARIANCE REASON OPTIONS
// ============================================================================
/**
 * Standard variance reasons for explaining count discrepancies
 * These are used when the counted quantity differs from system quantity
 * and help with reporting and inventory analysis
 */
const varianceReasonOptions: { value: VarianceReason; label: string }[] = [
  { value: 'damage', label: 'Damage' },
  { value: 'theft', label: 'Theft' },
  { value: 'spoilage', label: 'Spoilage' },
  { value: 'measurement-error', label: 'Measurement Error' },
  { value: 'system-error', label: 'System Error' },
  { value: 'receiving-error', label: 'Receiving Error' },
  { value: 'issue-error', label: 'Issue Error' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'other', label: 'Other' }
]

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * ItemCountCard Component
 *
 * Mobile-optimized card for counting individual items during a physical count.
 * Features:
 * - Quantity input with direct number entry
 * - Copy system quantity button (for quick "no change" counts)
 * - Calculator button for unit conversion
 * - Notes & evidence link
 * - Visual checkmark indicator when counted
 *
 * The "Copy system quantity" feature allows quick counting when
 * the physical count matches the system - user just taps copy.
 */
function ItemCountCard({
  item,
  index,
  onQuantityChange,
  onNotesClick,
  onCalculatorClick,
  showSystemQuantity
}: {
  item: PhysicalCountItem
  index: number
  onQuantityChange: (itemId: string, quantity: string) => void
  onNotesClick: (item: PhysicalCountItem) => void
  onCalculatorClick: (item: PhysicalCountItem) => void
  showSystemQuantity: boolean
}) {
  const [localQuantity, setLocalQuantity] = useState(
    item.countedQuantity?.toString() || ""
  )

  // Sync local quantity when item changes externally (e.g., from calculator)
  useEffect(() => {
    setLocalQuantity(item.countedQuantity?.toString() || "")
  }, [item.countedQuantity])

  const isCounted = item.countedQuantity !== null

  const handleQuantityChange = (value: string) => {
    setLocalQuantity(value)
    onQuantityChange(item.id, value)
  }

  const handleCopySystemQty = () => {
    if (showSystemQuantity) {
      handleQuantityChange(item.systemQuantity.toString())
    }
  }

  return (
    <Card className={cn(
      "transition-all",
      isCounted && "bg-muted/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Item info and count input */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Item name and SKU */}
            <div>
              <h3 className="font-semibold text-base">{item.itemName}</h3>
              <p className="text-sm text-muted-foreground">SKU: {item.itemCode}</p>
            </div>

            {/* Count input row */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Actual Count:</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={localQuantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-20 h-9 text-center font-medium"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {/* Calculator button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-primary"
                  onClick={() => onCalculatorClick(item)}
                  title="Open unit calculator"
                >
                  <Calculator className="h-4 w-4" />
                </Button>
                {/* Copy system quantity button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleCopySystemQty}
                  title={showSystemQuantity ? "Copy system quantity" : "Copy"}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{item.unit}</span>
              </div>
            </div>

            {/* Add notes & evidence link */}
            <button
              onClick={() => onNotesClick(item)}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Add notes & evidence
            </button>
          </div>

          {/* Right side: Checkmark indicator */}
          <div className="shrink-0 pt-2">
            {isCounted ? (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * NotesSheet Component
 *
 * Bottom sheet for adding notes and evidence to an item.
 * Opened when user taps "Add notes & evidence" on an item card.
 *
 * FEATURES:
 * - Variance reason dropdown (required if variance exists)
 * - Free-text notes field
 * - Photo capture button (uses device camera)
 * - File attachment button
 *
 * This information is crucial for:
 * - Explaining variances to supervisors
 * - Creating audit trails
 * - Identifying root causes of inventory discrepancies
 */
function NotesSheet({
  item,
  open,
  onOpenChange,
  onSave
}: {
  item: PhysicalCountItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (notes: string, reason: VarianceReason | null) => void
}) {
  const [notes, setNotes] = useState("")
  const [reason, setReason] = useState<VarianceReason | null>(null)

  useEffect(() => {
    if (item) {
      setNotes(item.notes || "")
      setReason(item.varianceReason)
    }
  }, [item])

  const handleSave = () => {
    onSave(notes, reason)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle>Notes & Evidence</SheetTitle>
          <SheetDescription>
            {item?.itemName} ({item?.itemCode})
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {/* Variance reason (if applicable) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Variance Reason (if any)</label>
            <Select
              value={reason || "none"}
              onValueChange={(v) => setReason(v === "none" ? null : v as VarianceReason)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No variance</SelectItem>
                {varianceReasonOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any observations or comments..."
              rows={4}
            />
          </div>

          {/* Evidence buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Attach File
            </Button>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Notes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ============================================================================
// UNIT CONVERSION SYSTEM
// ============================================================================

/**
 * Unit Conversion Configuration
 *
 * In production, this would come from the backend based on:
 * - Product category settings
 * - Company-specific unit definitions
 * - Regional measurement standards
 *
 * The conversion system works by:
 * 1. Converting all quantities to a base unit (e.g., grams for weight)
 * 2. Allowing users to enter counts in any supported unit
 * 3. Summing all entries in base unit
 * 4. Converting total back to item's original unit
 */
interface UnitConversion {
  unit: string
  label: string
  toBaseMultiplier: number // Multiplier to convert to base unit
}

// Example conversions for common inventory items
const unitConversions: Record<string, { baseUnit: string; conversions: UnitConversion[] }> = {
  // Weight-based items
  'kg': {
    baseUnit: 'g',
    conversions: [
      { unit: 'kg', label: 'kg', toBaseMultiplier: 1000 },
      { unit: 'g', label: 'g', toBaseMultiplier: 1 },
      { unit: 'lb', label: 'lb', toBaseMultiplier: 453.592 },
    ]
  },
  'g': {
    baseUnit: 'g',
    conversions: [
      { unit: 'kg', label: 'kg', toBaseMultiplier: 1000 },
      { unit: 'g', label: 'g', toBaseMultiplier: 1 },
      { unit: 'lb', label: 'lb', toBaseMultiplier: 453.592 },
    ]
  },
  // Volume-based items
  'L': {
    baseUnit: 'ml',
    conversions: [
      { unit: 'L', label: 'L', toBaseMultiplier: 1000 },
      { unit: 'ml', label: 'ml', toBaseMultiplier: 1 },
      { unit: 'bottle', label: 'bottle', toBaseMultiplier: 500 },
    ]
  },
  'ml': {
    baseUnit: 'ml',
    conversions: [
      { unit: 'L', label: 'L', toBaseMultiplier: 1000 },
      { unit: 'ml', label: 'ml', toBaseMultiplier: 1 },
      { unit: 'bottle', label: 'bottle', toBaseMultiplier: 500 },
    ]
  },
  // Count-based items
  'pcs': {
    baseUnit: 'pcs',
    conversions: [
      { unit: 'pcs', label: 'pcs', toBaseMultiplier: 1 },
      { unit: 'dozen', label: 'dozen', toBaseMultiplier: 12 },
      { unit: 'case', label: 'case', toBaseMultiplier: 24 },
      { unit: 'box', label: 'box', toBaseMultiplier: 6 },
    ]
  },
  // Default for other units
  'default': {
    baseUnit: 'unit',
    conversions: [
      { unit: 'unit', label: 'unit', toBaseMultiplier: 1 },
      { unit: 'pack', label: 'pack', toBaseMultiplier: 10 },
      { unit: 'case', label: 'case', toBaseMultiplier: 24 },
      { unit: 'bottle', label: 'bottle', toBaseMultiplier: 500 },
    ]
  }
}

interface UnitEntry {
  id: string
  quantity: number
  unit: string
}

/**
 * CalculatorDialog Component
 *
 * Multi-unit calculator for counting items in different packaging.
 * Opens when user taps the calculator icon on an item card.
 *
 * USE CASES:
 * - Counting rice received in 25kg bags but tracked in kg
 * - Counting beverages in cases but tracked in bottles
 * - Counting items in mixed packaging (e.g., 2 cases + 5 loose)
 *
 * WORKFLOW:
 * 1. User adds quantity entries in different units
 * 2. Each entry is converted to base unit
 * 3. Total is calculated in base unit
 * 4. "Use This Total" converts back to item's unit and applies
 *
 * EXAMPLE:
 * - Item unit: kg (base unit: grams)
 * - Entry 1: 2 x 25kg bags = 50,000g
 * - Entry 2: 500g loose = 500g
 * - Total: 50,500g = 50.5kg (applied to item)
 */
function CalculatorDialog({
  item,
  open,
  onOpenChange,
  onUseTotal
}: {
  item: PhysicalCountItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUseTotal: (total: number) => void
}) {
  const [entries, setEntries] = useState<UnitEntry[]>([
    { id: '1', quantity: 0, unit: '' }
  ])

  // Get unit conversions for this item
  const unitConfig = useMemo(() => {
    if (!item) return unitConversions['default']
    return unitConversions[item.unit.toLowerCase()] || unitConversions['default']
  }, [item])

  // Set default unit when item changes
  useEffect(() => {
    if (item && unitConfig) {
      setEntries([{ id: '1', quantity: 0, unit: unitConfig.conversions[0]?.unit || item.unit }])
    }
  }, [item, unitConfig])

  // Calculate total in base unit
  const totalInBaseUnit = useMemo(() => {
    return entries.reduce((sum, entry) => {
      const conversion = unitConfig.conversions.find(c => c.unit === entry.unit)
      const multiplier = conversion?.toBaseMultiplier || 1
      return sum + (entry.quantity * multiplier)
    }, 0)
  }, [entries, unitConfig])

  // Calculate equivalent for each entry
  const getEntryEquivalent = (entry: UnitEntry) => {
    const conversion = unitConfig.conversions.find(c => c.unit === entry.unit)
    const multiplier = conversion?.toBaseMultiplier || 1
    return entry.quantity * multiplier
  }

  const handleQuantityChange = (id: string, delta: number) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id !== id) return entry
      const newQty = Math.max(0, entry.quantity + delta)
      return { ...entry, quantity: newQty }
    }))
  }

  const handleQuantityInput = (id: string, value: string) => {
    const qty = parseFloat(value)
    if (value !== "" && isNaN(qty)) return
    setEntries(prev => prev.map(entry => {
      if (entry.id !== id) return entry
      return { ...entry, quantity: value === "" ? 0 : qty }
    }))
  }

  const handleUnitChange = (id: string, unit: string) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id !== id) return entry
      return { ...entry, unit }
    }))
  }

  const addEntry = () => {
    const newId = (entries.length + 1).toString()
    setEntries(prev => [...prev, { id: newId, quantity: 0, unit: unitConfig.conversions[0]?.unit || 'unit' }])
  }

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const handleUseTotal = () => {
    // Convert total back to item's original unit
    const itemConversion = unitConfig.conversions.find(c => c.unit.toLowerCase() === item?.unit.toLowerCase())
    const divisor = itemConversion?.toBaseMultiplier || 1
    const totalInItemUnit = totalInBaseUnit / divisor
    onUseTotal(totalInItemUnit)
    onOpenChange(false)
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Calculator</DialogTitle>
          <DialogDescription className="text-primary font-medium">
            {item.itemName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Unit entries */}
          {entries.map((entry, index) => (
            <div key={entry.id} className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                {/* Minus button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => handleQuantityChange(entry.id, -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                {/* Quantity input */}
                <Input
                  type="number"
                  value={entry.quantity || ""}
                  onChange={(e) => handleQuantityInput(entry.id, e.target.value)}
                  className="h-10 text-center font-medium text-lg"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />

                {/* Plus button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => handleQuantityChange(entry.id, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>

                {/* Unit selector */}
                <Select value={entry.unit} onValueChange={(v) => handleUnitChange(entry.id, v)}>
                  <SelectTrigger className="w-28 h-10">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitConfig.conversions.map(conv => (
                      <SelectItem key={conv.unit} value={conv.unit}>
                        {conv.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Remove button (only if more than one entry) */}
                {entries.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Equivalent display */}
              <div className="text-right text-sm text-muted-foreground pr-2">
                = {getEntryEquivalent(entry).toFixed(2)}{unitConfig.baseUnit}
              </div>
            </div>
          ))}

          {/* Add another unit button */}
          <button
            onClick={addEntry}
            className="w-full py-3 border-2 border-dashed border-primary/30 rounded-lg text-primary text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Unit
          </button>

          {/* Total display */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mt-4">
            <span className="text-muted-foreground font-medium">Total:</span>
            <span className="text-xl font-bold">
              {totalInBaseUnit.toFixed(2)}{unitConfig.baseUnit}
            </span>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleUseTotal}
          >
            Use This Total
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-4 border-b space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="p-4">
        <Skeleton className="h-2 w-full" />
      </div>
      <div className="p-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

/**
 * PhysicalCountCountPage - Item counting interface
 *
 * This is the main counting page where users enter physical count quantities.
 * It displays all items for a specific physical count and tracks progress.
 *
 * FEATURES:
 * - Real-time progress tracking (items counted / total)
 * - Search functionality to find specific items
 * - Status filtering (All, Pending, Counted)
 * - Auto-save on every quantity change
 * - Reset all counts capability
 * - Notes & evidence attachment
 * - Unit calculator for mixed packaging
 *
 * DATA FLOW:
 * 1. Load physical count by ID from URL params
 * 2. Display items with search/filter capability
 * 3. User enters quantities → handleQuantityChange
 * 4. Variance calculated → Item status updated
 * 5. Metrics recalculated (totals, accuracy)
 * 6. Auto-save to backend (planned)
 *
 * APPROVAL WORKFLOW:
 * - Items with variance > approvalThreshold require supervisor review
 * - These items are marked with "variance" status
 * - Supervisor can approve/reject adjustments
 */
export default function PhysicalCountCountPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  // ============================================================================
  // USER PREFERENCES
  // ============================================================================
  // showSystemQuantity: Controls whether system quantities are visible
  // When false, creates "blind count" for more accurate independent counting
  const { user } = useUser()
  const showSystemQuantity = user?.context?.showSystemQuantity ?? true

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  // Core state
  const [physicalCount, setPhysicalCount] = useState<PhysicalCount | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "counted">("all")
  const [showSortFilter, setShowSortFilter] = useState(false)

  // Notes sheet state
  const [notesSheetOpen, setNotesSheetOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PhysicalCountItem | null>(null)

  // Calculator dialog state
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [calculatorItem, setCalculatorItem] = useState<PhysicalCountItem | null>(null)

  // Reset dialog state
  const [showResetDialog, setShowResetDialog] = useState(false)

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  // Load physical count by ID and transition to in-progress if needed
  // TODO: Replace with API call: GET /api/physical-counts/{id}
  useEffect(() => {
    const data = getPhysicalCountById(id)
    if (data) {
      // If not started, mark as in-progress
      if (data.status === 'pending' || data.status === 'draft' || data.status === 'planning') {
        setPhysicalCount({
          ...data,
          status: 'in-progress',
          startedAt: new Date()
        })
      } else {
        setPhysicalCount(data)
      }
      setLastSaved(new Date())
    }
    setLoading(false)
  }, [id])

  // Progress calculations
  const progress = useMemo(() => {
    if (!physicalCount) return { counted: 0, total: 0, percent: 0 }

    const counted = physicalCount.items.filter(i =>
      i.countedQuantity !== null
    ).length

    return {
      counted,
      total: physicalCount.totalItems,
      percent: physicalCount.totalItems > 0 ? Math.round((counted / physicalCount.totalItems) * 100) : 0
    }
  }, [physicalCount])

  // Get current period info
  const periodInfo = useMemo(() => {
    if (!physicalCount) return { name: "", endDate: null }
    const scheduledDate = new Date(physicalCount.scheduledDate)
    return {
      name: format(scheduledDate, "MMMM yyyy"),
      endDate: scheduledDate
    }
  }, [physicalCount])

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!physicalCount) return []

    return physicalCount.items.filter(item => {
      // Search filter
      const matchesSearch = searchQuery === "" ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const isCounted = item.countedQuantity !== null
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "counted" && isCounted) ||
        (statusFilter === "pending" && !isCounted)

      return matchesSearch && matchesStatus
    })
  }, [physicalCount, searchQuery, statusFilter])

  // ============================================================================
  // QUANTITY CHANGE HANDLER
  // ============================================================================
  /**
   * Handles quantity changes for individual items
   *
   * This is the core counting logic that:
   * 1. Parses and validates the entered quantity
   * 2. Calculates variance (counted - system)
   * 3. Determines variance percentage
   * 4. Determines item status based on variance vs threshold
   * 5. Updates all related metrics (totals, accuracy, values)
   *
   * VARIANCE CALCULATION:
   * - variance = countedQuantity - systemQuantity
   * - variancePercent = (variance / systemQuantity) * 100
   * - varianceValue = variance * unitCost
   *
   * STATUS DETERMINATION:
   * - pending: No count entered (countedQuantity is null)
   * - counted: Count entered with variance ≤ approvalThreshold
   * - variance: Count entered with variance > approvalThreshold
   *
   * METRICS UPDATED:
   * - countedItems: Number of items with counts
   * - varianceItems: Number of items exceeding threshold
   * - pendingItems: Items still to be counted
   * - varianceValue: Total value of variances
   * - totalCountedValue: Sum of counted item values
   * - accuracy: (counted - variance) / counted * 100
   *
   * @param itemId - The ID of the item being counted
   * @param quantity - The entered quantity as a string
   */
  const handleQuantityChange = useCallback((itemId: string, quantity: string) => {
    if (!physicalCount) return

    const qty = parseFloat(quantity)
    if (quantity !== "" && isNaN(qty)) return

    const updatedItems = physicalCount.items.map(item => {
      if (item.id !== itemId) return item

      const countedQty = quantity === "" ? null : qty
      const variance = countedQty !== null ? countedQty - item.systemQuantity : 0
      const variancePercent = countedQty !== null && item.systemQuantity > 0
        ? Number(((variance / item.systemQuantity) * 100).toFixed(2))
        : 0
      const varianceValue = variance * item.unitCost

      let status: ItemCountStatus = 'pending'
      if (countedQty !== null) {
        if (variance === 0) {
          status = 'counted'
        } else if (Math.abs(variancePercent) > physicalCount.approvalThreshold) {
          status = 'variance'
        } else {
          status = 'counted'
        }
      }

      return {
        ...item,
        countedQuantity: countedQty,
        finalQuantity: countedQty,
        variance,
        variancePercent,
        varianceValue,
        status,
        countedBy: countedQty !== null ? 'Current User' : null,
        countedAt: countedQty !== null ? new Date() : null
      }
    })

    // Update metrics
    const countedCount = updatedItems.filter(i => i.countedQuantity !== null).length
    const varianceCount = updatedItems.filter(i => i.status === 'variance').length
    const totalVarianceValue = updatedItems.reduce((sum, i) => sum + (i.varianceValue || 0), 0)
    const totalCountedValue = updatedItems.reduce((sum, i) =>
      i.finalQuantity !== null ? sum + (i.finalQuantity * i.unitCost) : sum
    , 0)
    const accuracy = countedCount > 0
      ? ((countedCount - varianceCount) / countedCount) * 100
      : 0

    setPhysicalCount({
      ...physicalCount,
      items: updatedItems,
      countedItems: countedCount,
      varianceItems: varianceCount,
      pendingItems: physicalCount.totalItems - countedCount,
      varianceValue: totalVarianceValue,
      totalCountedValue,
      accuracy: Number(accuracy.toFixed(2)),
      updatedAt: new Date()
    })

    setLastSaved(new Date())
  }, [physicalCount])

  // Handle notes save
  const handleNotesSave = useCallback((notes: string, reason: VarianceReason | null) => {
    if (!physicalCount || !selectedItem) return

    const updatedItems = physicalCount.items.map(item => {
      if (item.id !== selectedItem.id) return item
      return {
        ...item,
        notes,
        varianceReason: reason
      }
    })

    setPhysicalCount({
      ...physicalCount,
      items: updatedItems,
      updatedAt: new Date()
    })

    setLastSaved(new Date())
    setSelectedItem(null)
  }, [physicalCount, selectedItem])

  /**
   * Save physical count for later resumption
   *
   * Preserves all counting progress and returns to the management page.
   * The count remains in 'in-progress' status and can be resumed later.
   *
   * In production, this would:
   * - Save current state to database
   * - Record last save timestamp
   * - Sync with offline storage
   *
   * TODO: Replace with actual API call
   * PUT /api/physical-counts/{id}
   */
  const handleSaveForResume = useCallback(() => {
    // In a real app, this would save to backend
    setLastSaved(new Date())
    router.push("/inventory-management/physical-count-management")
  }, [router])

  // Handle notes click
  const handleNotesClick = useCallback((item: PhysicalCountItem) => {
    setSelectedItem(item)
    setNotesSheetOpen(true)
  }, [])

  // Handle calculator click
  const handleCalculatorClick = useCallback((item: PhysicalCountItem) => {
    setCalculatorItem(item)
    setCalculatorOpen(true)
  }, [])

  // Handle calculator total - apply the calculated total to the item
  const handleCalculatorTotal = useCallback((total: number) => {
    if (!calculatorItem) return
    handleQuantityChange(calculatorItem.id, total.toString())
    setCalculatorItem(null)
  }, [calculatorItem, handleQuantityChange])

  /**
   * Reset all counts to initial state
   *
   * Clears all counted quantities, notes, and variance reasons.
   * Resets all items to 'pending' status.
   * This is a destructive action that cannot be undone.
   *
   * Use cases:
   * - Major counting error requiring complete restart
   * - Re-counting after significant inventory movement
   * - Training/practice scenarios
   */
  const handleReset = useCallback(() => {
    if (!physicalCount) return

    // Reset all items to uncounted state
    const resetItems = physicalCount.items.map(item => ({
      ...item,
      countedQuantity: null,
      finalQuantity: null,
      variance: 0,
      variancePercent: 0,
      varianceValue: 0,
      status: 'pending' as ItemCountStatus,
      countedBy: null,
      countedAt: null,
      notes: '',
      varianceReason: null
    }))

    setPhysicalCount({
      ...physicalCount,
      items: resetItems,
      countedItems: 0,
      pendingItems: physicalCount.totalItems,
      varianceItems: 0,
      varianceValue: 0,
      totalCountedValue: 0,
      accuracy: 0,
      updatedAt: new Date()
    })

    setLastSaved(new Date())
    setShowResetDialog(false)
  }, [physicalCount])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!physicalCount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Physical count not found</p>
        <Button onClick={() => router.push("/inventory-management/physical-count-management")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        {/* Title row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => router.push("/inventory-management/physical-count-management")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-primary">Physical Count Entry</h1>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {physicalCount.locationName} - {periodInfo.name}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowResetDialog(true)}
              title="Reset all counts"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-end">
              <Badge variant="default" className="mb-1">
                In Progress
              </Badge>
              <span className="text-xs text-muted-foreground">
                {progress.counted} / {progress.total}
              </span>
              <span className="text-xs text-muted-foreground">
                {progress.percent}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Meta info row */}
        <div className="flex items-center gap-4 px-4 pb-3 text-sm text-muted-foreground overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <MapPin className="h-4 w-4" />
            <span>{physicalCount.locationName}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="h-4 w-4" />
            <span>{periodInfo.name}</span>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="h-4 w-4" />
              <span>Last saved: {format(lastSaved, "h:mm:ss a")}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-3">
          <Progress value={progress.percent} className="h-2" />
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="sticky top-[140px] z-10 bg-background px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSortFilter(!showSortFilter)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter options */}
        {showSortFilter && (
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All ({physicalCount.items.length})
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({physicalCount.items.filter(i => i.countedQuantity === null).length})
            </Button>
            <Button
              variant={statusFilter === "counted" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("counted")}
            >
              Counted ({physicalCount.items.filter(i => i.countedQuantity !== null).length})
            </Button>
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 p-4 space-y-3 pb-24">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Search className="h-12 w-12 mb-3" />
            <p>No items found</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <ItemCountCard
              key={item.id}
              item={item}
              index={index}
              onQuantityChange={handleQuantityChange}
              onNotesClick={handleNotesClick}
              onCalculatorClick={handleCalculatorClick}
              showSystemQuantity={showSystemQuantity}
            />
          ))
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button
          className="w-full h-12 text-base"
          onClick={handleSaveForResume}
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Save for Resume
        </Button>
      </div>

      {/* Notes & Evidence Sheet */}
      <NotesSheet
        item={selectedItem}
        open={notesSheetOpen}
        onOpenChange={setNotesSheetOpen}
        onSave={handleNotesSave}
      />

      {/* Calculator Dialog */}
      <CalculatorDialog
        item={calculatorItem}
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
        onUseTotal={handleCalculatorTotal}
      />

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Counts?</DialogTitle>
            <DialogDescription>
              This will clear all counted quantities and reset all items to pending status.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-3 p-3 bg-amber-50 text-amber-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Warning</p>
                <p className="text-sm">
                  You have counted {progress.counted} of {progress.total} items. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
