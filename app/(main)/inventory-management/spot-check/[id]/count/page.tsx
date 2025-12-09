/**
 * ============================================================================
 * SPOT CHECK COUNTING PAGE
 * ============================================================================
 *
 * This page provides a mobile-first interface for conducting spot check counts.
 * Spot checks are quick, targeted inventory verifications for a subset of items
 * at a specific location.
 *
 * KEY CONCEPTS:
 *
 * 1. SPOT CHECK vs PHYSICAL COUNT:
 *    - Spot Check: Quick verification of a sample of items (random, high-value, etc.)
 *    - Physical Count: Complete inventory count of ALL items at a location
 *
 * 2. COUNTING WORKFLOW:
 *    a) User selects location and item selection method (random, high-value, etc.)
 *    b) System generates a list of items to count
 *    c) User enters actual counted quantities for each item
 *    d) System calculates variance (difference between system qty and counted qty)
 *    e) User completes or saves for later
 *
 * 3. VARIANCE DETECTION:
 *    - Match: Counted quantity = System quantity (shown in green)
 *    - Variance: Any difference between counted and system (shown in red/blue)
 *    - Significant Variance: >10% difference (triggers warning alert)
 *
 * 4. USER PREFERENCES:
 *    - showSystemQuantity: Can be toggled via user context settings
 *    - When hidden, creates "blind count" scenario for more accurate counting
 *
 * STATE MANAGEMENT:
 * - Local state for real-time UI updates
 * - Metrics (counted, matched, variance) recalculated on each count change
 * - Auto-save functionality planned for production
 *
 * WORKFLOW STATES:
 * - pending: Item not yet counted
 * - counted: Item counted with no variance
 * - variance: Item counted with difference from system quantity
 *
 * ============================================================================
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Check,
  Save,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Package,
  MapPin,
  ChevronRight,
  Minus,
  Plus,
  RefreshCw,
  AlertCircle,
  Timer,
  Search,
  Calculator
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/context/simple-user-context"

import { getSpotCheckById } from "@/lib/mock-data/spot-checks"
import type {
  SpotCheck,
  SpotCheckItem,
  SpotCheckType,
  ItemCheckStatus,
  ItemCondition
} from "../../types"

/**
 * Generate mock items for a new spot check session
 *
 * In production, this would be replaced with an API call that:
 * 1. Fetches items based on selection method (random, high-value, category, etc.)
 * 2. Returns items with current system quantities from inventory
 * 3. Includes item metadata (location, category, last count date)
 *
 * @param count - Number of items to generate for the spot check
 * @returns Array of SpotCheckItem objects ready for counting
 */
function generateMockItems(count: number): SpotCheckItem[] {
  const items = [
    { name: 'Basmati Rice Premium', code: 'INV-001', category: 'Grains', location: 'Dry Storage A1', systemQty: 45, unit: 'kg', value: 225 },
    { name: 'Olive Oil Extra Virgin', code: 'INV-002', category: 'Oils', location: 'Dry Storage A2', systemQty: 12, unit: 'bottles', value: 180 },
    { name: 'Black Pepper Ground', code: 'INV-003', category: 'Spices', location: 'Spice Rack B1', systemQty: 8, unit: 'kg', value: 120 },
    { name: 'Chicken Stock Powder', code: 'INV-004', category: 'Sauces', location: 'Dry Storage A3', systemQty: 20, unit: 'pcs', value: 100 },
    { name: 'Pasta Penne', code: 'INV-005', category: 'Pasta', location: 'Dry Storage B1', systemQty: 30, unit: 'packs', value: 75 },
    { name: 'Jasmine Rice', code: 'INV-006', category: 'Grains', location: 'Dry Storage A1', systemQty: 50, unit: 'kg', value: 200 },
    { name: 'Vegetable Oil', code: 'INV-007', category: 'Oils', location: 'Dry Storage A2', systemQty: 15, unit: 'bottles', value: 90 },
    { name: 'Paprika Sweet', code: 'INV-008', category: 'Spices', location: 'Spice Rack B2', systemQty: 5, unit: 'kg', value: 75 },
    { name: 'Beef Stock Cubes', code: 'INV-009', category: 'Sauces', location: 'Dry Storage A3', systemQty: 25, unit: 'boxes', value: 62.5 },
    { name: 'Spaghetti', code: 'INV-010', category: 'Pasta', location: 'Dry Storage B1', systemQty: 40, unit: 'packs', value: 80 },
    { name: 'Coconut Milk', code: 'INV-011', category: 'Dairy', location: 'Cold Storage C1', systemQty: 24, unit: 'cans', value: 48 },
    { name: 'Garlic Powder', code: 'INV-012', category: 'Spices', location: 'Spice Rack B1', systemQty: 6, unit: 'kg', value: 90 },
    { name: 'Fish Sauce', code: 'INV-013', category: 'Sauces', location: 'Dry Storage A4', systemQty: 10, unit: 'bottles', value: 50 },
    { name: 'Soy Sauce Dark', code: 'INV-014', category: 'Sauces', location: 'Dry Storage A4', systemQty: 15, unit: 'bottles', value: 60 },
    { name: 'Tomato Paste', code: 'INV-015', category: 'Sauces', location: 'Dry Storage A4', systemQty: 20, unit: 'cans', value: 40 },
    { name: 'Flour All Purpose', code: 'INV-016', category: 'Baking', location: 'Dry Storage B2', systemQty: 25, unit: 'kg', value: 50 },
    { name: 'Sugar White', code: 'INV-017', category: 'Baking', location: 'Dry Storage B2', systemQty: 20, unit: 'kg', value: 40 },
    { name: 'Salt Sea', code: 'INV-018', category: 'Condiments', location: 'Dry Storage B3', systemQty: 10, unit: 'kg', value: 15 },
    { name: 'Cumin Ground', code: 'INV-019', category: 'Spices', location: 'Spice Rack B2', systemQty: 4, unit: 'kg', value: 60 },
    { name: 'Turmeric Powder', code: 'INV-020', category: 'Spices', location: 'Spice Rack B2', systemQty: 3, unit: 'kg', value: 45 },
  ]

  return items.slice(0, count).map((item, index) => ({
    id: `item-${index + 1}`,
    itemId: item.code,
    itemCode: item.code,
    itemName: item.name,
    category: item.category,
    unit: item.unit,
    location: item.location,
    systemQuantity: item.systemQty,
    countedQuantity: null,
    variance: 0,
    variancePercent: 0,
    status: 'pending' as ItemCheckStatus,
    condition: 'good' as ItemCondition,
    countedBy: null,
    countedAt: null,
    notes: '',
    value: item.value,
    lastCountDate: new Date(Date.now() - Math.random() * 86400000 * 30)
  }))
}

/**
 * ItemCountCard Component
 *
 * Mobile-optimized card for counting individual items during a spot check.
 * Displays item info, provides quantity input with +/- controls, and shows
 * real-time variance indicators.
 *
 * FEATURES:
 * - Quantity input with increment/decrement buttons
 * - System quantity display (can be hidden for blind counts)
 * - Real-time variance calculation and visual feedback
 * - Significant variance warning (>10% difference)
 * - Calculator button for complex unit conversions
 *
 * VARIANCE VISUAL FEEDBACK:
 * - Green checkmark: Counted matches system (no variance)
 * - Blue arrow up: Counted > System (overage)
 * - Red arrow down: Counted < System (shortage)
 * - Red border + warning: Significant variance detected
 */
function ItemCountCard({
  item,
  onCountChange,
  onIncrement,
  onDecrement,
  showSystemQuantity
}: {
  item: SpotCheckItem
  onCountChange: (value: string) => void
  onIncrement: () => void
  onDecrement: () => void
  showSystemQuantity: boolean
}) {
  const hasCount = item.countedQuantity !== null
  const isMatch = hasCount && item.countedQuantity === item.systemQuantity
  const hasVariance = hasCount && item.countedQuantity !== item.systemQuantity
  const variance = hasCount ? (item.countedQuantity || 0) - item.systemQuantity : 0
  const isSignificantVariance = Math.abs(variance) > item.systemQuantity * 0.1 // >10% variance

  return (
    <Card className={cn(
      "transition-all",
      hasVariance && isSignificantVariance && "border-destructive/50 bg-destructive/5"
    )}>
      <CardContent className="p-4 space-y-3">
        {/* Item Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{item.itemName}</h3>
              {isMatch && (
                <Badge variant="secondary" className="text-xs gap-1 bg-green-100 text-green-700">
                  <Check className="h-3 w-3" />
                  Match
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{item.itemCode}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{item.location}</span>
            </div>
          </div>

          {/* Calculator button */}
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Count Section */}
        <div className="flex items-center gap-4">
          {/* System Quantity */}
          {showSystemQuantity && (
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">System</p>
              <p className="text-lg font-semibold">{item.systemQuantity} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></p>
            </div>
          )}

          {/* Actual Count Input */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Actual Count</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={onDecrement}
                disabled={!hasCount || (item.countedQuantity || 0) <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={item.countedQuantity ?? ""}
                onChange={(e) => onCountChange(e.target.value)}
                placeholder="0"
                className="h-10 text-center text-lg font-semibold w-20"
                min="0"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={onIncrement}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Variance Indicator */}
          {showSystemQuantity && hasCount && (
            <div className="w-16 text-right">
              {isMatch ? (
                <div className="flex items-center justify-end gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              ) : (
                <div className={cn(
                  "flex items-center justify-end gap-1 font-medium",
                  variance > 0 ? "text-blue-600" : "text-red-600"
                )}>
                  {variance > 0 ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  <span>{Math.abs(variance)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Significant Variance Warning */}
        {hasVariance && isSignificantVariance && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md text-destructive text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Significant Variance Detected</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * SpotCheckCountPage - Main counting interface
 *
 * This is the primary counting page where users perform the actual spot check.
 * It supports both new spot check sessions and resuming existing ones.
 *
 * URL PARAMETERS:
 * - id: Spot check ID (existing) or session ID (new)
 * - location: Location name (for new sessions)
 * - method: Item selection method (random, high-value, category)
 * - items: Number of items to count
 *
 * FEATURES:
 * - Real-time progress tracking with visual progress bar
 * - Elapsed time display for performance monitoring
 * - Search functionality to find specific items
 * - Save for resume capability
 * - Reset all counts option
 * - Complete spot check with summary dialog
 *
 * DATA FLOW:
 * 1. Load or create spot check based on URL params
 * 2. User enters counts → handleCountChange updates item and recalculates metrics
 * 3. Metrics update: countedItems, matchedItems, varianceItems, accuracy
 * 4. On complete: Status changes to 'completed', redirects to detail page
 */
export default function SpotCheckCountPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string

  // ============================================================================
  // SESSION DETECTION
  // ============================================================================
  // New sessions have IDs starting with 'sc-' (generated client-side)
  // Existing sessions use database IDs
  const isNewSession = id.startsWith('sc-')
  const locationName = searchParams.get('location') || 'Unknown Location'
  const selectionMethod = searchParams.get('method') || 'random'
  const itemCount = parseInt(searchParams.get('items') || '20')

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
  const [spotCheck, setSpotCheck] = useState<SpotCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [startTime] = useState(new Date())

  // UI state for dialogs
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  // Load existing spot check or create new one based on URL params
  // For new sessions: Generate items based on selection method
  // For existing sessions: Load from database and resume
  useEffect(() => {
    if (isNewSession) {
      // Create a new spot check with generated items
      // TODO: Replace with API call to create spot check and fetch items
      const mockItems = generateMockItems(itemCount)
      const newSpotCheck: SpotCheck = {
        id: id,
        checkNumber: `SC-${Date.now().toString().slice(-6)}`,
        checkType: selectionMethod as SpotCheckType,
        status: 'in-progress',
        priority: 'medium',
        locationId: 'loc-001',
        locationName: locationName,
        departmentId: 'dept-001',
        departmentName: 'Kitchen Operations',
        assignedTo: 'user-001',
        assignedToName: 'John Smith',
        reason: 'Routine spot check',
        scheduledDate: new Date(),
        startedAt: new Date(),
        completedAt: null,
        dueDate: null,
        items: mockItems,
        totalItems: mockItems.length,
        countedItems: 0,
        matchedItems: 0,
        varianceItems: 0,
        totalValue: mockItems.reduce((sum, item) => sum + item.value, 0),
        varianceValue: 0,
        accuracy: 0,
        notes: '',
        createdBy: 'Current User',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setSpotCheck(newSpotCheck)
    } else {
      // Load existing spot check
      const data = getSpotCheckById(id)
      if (data) {
        if (data.status === 'pending' || data.status === 'draft') {
          setSpotCheck({
            ...data,
            status: 'in-progress',
            startedAt: new Date()
          })
        } else {
          setSpotCheck(data)
        }
      }
    }
    setLoading(false)
  }, [id, isNewSession, itemCount, locationName, selectionMethod])

  // Filtered items based on search
  const filteredItems = useMemo(() => {
    if (!spotCheck) return []

    if (!searchQuery) return spotCheck.items

    const query = searchQuery.toLowerCase()
    return spotCheck.items.filter(item =>
      item.itemName.toLowerCase().includes(query) ||
      item.itemCode.toLowerCase().includes(query)
    )
  }, [spotCheck, searchQuery])

  // Progress calculations
  const progress = useMemo(() => {
    if (!spotCheck) return { counted: 0, total: 0, percent: 0, matched: 0, variance: 0 }

    const counted = spotCheck.items.filter(i => i.countedQuantity !== null).length
    const matched = spotCheck.items.filter(i =>
      i.countedQuantity !== null && i.countedQuantity === i.systemQuantity
    ).length
    const variance = spotCheck.items.filter(i =>
      i.countedQuantity !== null && i.countedQuantity !== i.systemQuantity
    ).length

    return {
      counted,
      total: spotCheck.totalItems,
      percent: spotCheck.totalItems > 0 ? (counted / spotCheck.totalItems) * 100 : 0,
      matched,
      variance
    }
  }, [spotCheck])

  // ============================================================================
  // COUNT CHANGE HANDLER
  // ============================================================================
  /**
   * Handles quantity changes for individual items
   *
   * This is the core counting logic that:
   * 1. Updates the item's counted quantity
   * 2. Calculates variance (counted - system)
   * 3. Determines item status (pending/counted/variance)
   * 4. Recalculates spot check metrics (totals, accuracy, etc.)
   *
   * VARIANCE CALCULATION:
   * - variance = countedQuantity - systemQuantity
   * - variancePercent = (variance / systemQuantity) * 100
   *
   * STATUS DETERMINATION:
   * - pending: No count entered yet (countedQuantity is null)
   * - counted: Count entered with no variance
   * - variance: Count entered with difference from system
   *
   * @param itemId - The ID of the item being counted
   * @param value - The entered quantity as a string (empty string = null)
   */
  const handleCountChange = useCallback((itemId: string, value: string) => {
    if (!spotCheck) return

    const numValue = value === "" ? null : parseFloat(value)

    const updatedItems = spotCheck.items.map(item => {
      if (item.id === itemId) {
        const variance = numValue !== null ? numValue - item.systemQuantity : 0
        const variancePercent = item.systemQuantity > 0 && numValue !== null
          ? Number(((variance / item.systemQuantity) * 100).toFixed(2))
          : 0

        return {
          ...item,
          countedQuantity: numValue,
          variance,
          variancePercent,
          status: numValue !== null
            ? (variance !== 0 ? 'variance' : 'counted') as ItemCheckStatus
            : 'pending' as ItemCheckStatus,
          countedBy: numValue !== null ? 'Current User' : null,
          countedAt: numValue !== null ? new Date() : null
        }
      }
      return item
    })

    // Recalculate metrics
    const countedCount = updatedItems.filter(i => i.countedQuantity !== null).length
    const matchedCount = updatedItems.filter(i =>
      i.countedQuantity !== null && i.countedQuantity === i.systemQuantity
    ).length
    const varianceCount = updatedItems.filter(i =>
      i.countedQuantity !== null && i.countedQuantity !== i.systemQuantity
    ).length
    const totalVarianceValue = updatedItems.reduce((sum, i) => {
      if (i.countedQuantity !== null && i.countedQuantity !== i.systemQuantity) {
        return sum + Math.abs(i.variance * (i.value / i.systemQuantity))
      }
      return sum
    }, 0)
    const accuracy = countedCount > 0 ? (matchedCount / countedCount) * 100 : 0

    setSpotCheck({
      ...spotCheck,
      items: updatedItems,
      countedItems: countedCount,
      matchedItems: matchedCount,
      varianceItems: varianceCount,
      varianceValue: totalVarianceValue,
      accuracy: Number(accuracy.toFixed(2)),
      updatedAt: new Date()
    })
  }, [spotCheck])

  // Handle increment/decrement
  const handleIncrement = useCallback((itemId: string) => {
    if (!spotCheck) return
    const item = spotCheck.items.find(i => i.id === itemId)
    if (!item) return
    const current = item.countedQuantity ?? 0
    handleCountChange(itemId, (current + 1).toString())
  }, [spotCheck, handleCountChange])

  const handleDecrement = useCallback((itemId: string) => {
    if (!spotCheck) return
    const item = spotCheck.items.find(i => i.id === itemId)
    if (!item || item.countedQuantity === null || item.countedQuantity <= 0) return
    handleCountChange(itemId, (item.countedQuantity - 1).toString())
  }, [spotCheck, handleCountChange])

  // ============================================================================
  // COMPLETION HANDLERS
  // ============================================================================

  /**
   * Complete the spot check
   *
   * Finalizes the spot check by:
   * 1. Setting status to 'completed'
   * 2. Recording completion timestamp
   * 3. Redirecting to the spot check detail/review page
   *
   * In production, this would trigger:
   * - API call to save final state
   * - Inventory adjustment workflow (if auto-adjust enabled)
   * - Notification to supervisor (if variance detected)
   * - Audit log entry
   *
   * TODO: Replace with actual API call
   * POST /api/spot-checks/{id}/complete
   */
  const handleComplete = useCallback(() => {
    if (!spotCheck) return

    setSpotCheck({
      ...spotCheck,
      status: 'completed',
      completedAt: new Date()
    })

    setShowCompleteDialog(false)
    router.push(`/inventory-management/spot-check/${id}`)
  }, [spotCheck, id, router])

  /**
   * Save spot check for later resumption
   *
   * Preserves all counting progress and allows user to exit.
   * The spot check remains in 'in-progress' status and can be
   * resumed from the spot check list.
   *
   * In production, this would:
   * - Save current state to database
   * - Record last save timestamp
   * - Allow offline sync when reconnected
   *
   * TODO: Replace with actual API call
   * PUT /api/spot-checks/{id}
   */
  const handleSaveForResume = useCallback(() => {
    // In a real app, this would save to the backend
    setShowExitDialog(false)
    router.push('/inventory-management/spot-check')
  }, [router])

  /**
   * Reset all counts to initial state
   *
   * Clears all counted quantities and resets all items to pending.
   * This is a destructive action that cannot be undone.
   *
   * Use cases:
   * - Starting over due to counting errors
   * - Re-counting after inventory movement
   * - Training/practice scenarios
   */
  const handleReset = useCallback(() => {
    if (!spotCheck) return

    // Reset all items to uncounted state
    const resetItems = spotCheck.items.map(item => ({
      ...item,
      countedQuantity: null,
      variance: 0,
      variancePercent: 0,
      status: 'pending' as ItemCheckStatus,
      countedBy: null,
      countedAt: null
    }))

    setSpotCheck({
      ...spotCheck,
      items: resetItems,
      countedItems: 0,
      matchedItems: 0,
      varianceItems: 0,
      varianceValue: 0,
      accuracy: 0,
      updatedAt: new Date()
    })

    setShowResetDialog(false)
  }, [spotCheck])

  // Calculate elapsed time
  const getElapsedTime = () => {
    const now = new Date()
    const diff = now.getTime() - startTime.getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!spotCheck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Spot Check Not Found</h2>
        <Button onClick={() => router.push("/inventory-management/spot-check")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Spot Checks
        </Button>
      </div>
    )
  }

  const allItemsCounted = progress.counted === progress.total

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExitDialog(true)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <RefreshCw className="h-3 w-3" />
              Counting
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>{getElapsedTime()}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowResetDialog(true)}
              title="Reset all counts"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {allItemsCounted ? (
            <Button size="sm" onClick={() => setShowCompleteDialog(true)}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setShowExitDialog(true)}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
        </div>

        {/* Location Info */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{spotCheck.locationName}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{spotCheck.departmentName}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">{progress.matched} matched</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground">{progress.variance} variance</span>
              </span>
            </div>
            <span className="font-medium">{progress.counted}/{progress.total}</span>
          </div>
          <Progress value={progress.percent} className="h-2" />
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 p-4 space-y-3 pb-24">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mb-3" />
            <p className="font-medium">No items found</p>
            <p className="text-sm">Try adjusting your search</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <ItemCountCard
              key={item.id}
              item={item}
              onCountChange={(value) => handleCountChange(item.id, value)}
              onIncrement={() => handleIncrement(item.id)}
              onDecrement={() => handleDecrement(item.id)}
              showSystemQuantity={showSystemQuantity}
            />
          ))
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => setShowExitDialog(true)}
        >
          <Save className="h-5 w-5" />
          Save for Resume
        </Button>
      </div>

      {/* Exit/Save Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Progress?</DialogTitle>
            <DialogDescription>
              Your progress will be saved. You can resume counting later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items counted:</span>
                <span className="font-medium">{progress.counted} / {progress.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Matched:</span>
                <span className="font-medium text-green-600">{progress.matched}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">With variance:</span>
                <span className="font-medium text-red-600">{progress.variance}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time elapsed:</span>
                <span className="font-medium">{getElapsedTime()}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Continue Counting
            </Button>
            <Button onClick={handleSaveForResume}>
              <Save className="h-4 w-4 mr-2" />
              Save & Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Spot Check?</DialogTitle>
            <DialogDescription>
              Review the summary before completing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Items:</span>
                <span className="font-medium">{progress.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items Counted:</span>
                <span className="font-medium">{progress.counted}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Matched:</span>
                <span className="font-medium text-green-600">{progress.matched}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">With Variance:</span>
                <span className="font-medium text-red-600">{progress.variance}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accuracy Rate:</span>
                <span className="font-medium">
                  {progress.counted > 0 ? ((progress.matched / progress.counted) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            {progress.variance > 0 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Variance detected</p>
                  <p className="text-sm">
                    {progress.variance} items have quantity differences.
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Continue Counting
            </Button>
            <Button onClick={handleComplete}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
