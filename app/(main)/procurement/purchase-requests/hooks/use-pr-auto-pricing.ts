"use client"

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  PRItemPriceComparison,
  NormalizedVendorOption,
  VendorOverrideRecord,
  Money
} from '@/lib/types'
import { PRAutoPricingService } from '@/lib/services/pr-auto-pricing-service'

// =============================================================================
// Hook Types
// =============================================================================

export interface PRItemPricingState {
  /** Whether pricing is currently loading */
  isLoading: boolean
  /** Any error that occurred */
  error: string | null
  /** The price comparison result */
  comparison: PRItemPriceComparison | null
  /** Currently selected vendor ID */
  selectedVendorId: string | null
  /** Currently selected price list ID */
  selectedPriceListId: string | null
  /** Whether the selection was manually overridden */
  isManualOverride: boolean
  /** The override record if applicable */
  overrideRecord: VendorOverrideRecord | null
}

export interface UsePRAutoPricingOptions {
  /** Product ID to fetch pricing for */
  productId: string
  /** Initial quantity */
  initialQuantity?: number
  /** Initial unit */
  initialUnit?: string
  /** Whether to fetch pricing on mount */
  fetchOnMount?: boolean
  /** User ID for override tracking */
  userId?: string
  /** Whether to show prices (role-based) */
  showPrices?: boolean
}

export interface UsePRAutoPricingReturn {
  /** Current pricing state */
  state: PRItemPricingState
  /** Fetch/refresh pricing options */
  fetchPricing: (quantity: number, unit: string) => Promise<void>
  /** Update quantity and recalculate */
  updateQuantity: (quantity: number, unit?: string) => Promise<void>
  /** Select a vendor manually */
  selectVendor: (vendorId: string, priceListId: string, reason?: string, reasonText?: string) => void
  /** Accept the recommended vendor */
  acceptRecommendation: () => void
  /** Get the selected vendor option */
  getSelectedVendor: () => NormalizedVendorOption | null
  /** Get the unit price for the selected vendor */
  getSelectedUnitPrice: () => Money | null
  /** Get the total cost for the current quantity */
  getTotalCost: () => Money | null
  /** Check if submission should be blocked due to MOQ */
  canSubmit: () => boolean
  /** Clear the pricing cache */
  clearCache: () => void
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function usePRAutoPricing(options: UsePRAutoPricingOptions): UsePRAutoPricingReturn {
  const {
    productId,
    initialQuantity = 1,
    initialUnit = 'KG',
    fetchOnMount = true,
    userId = 'current-user',
    showPrices = true
  } = options

  // State
  const [state, setState] = useState<PRItemPricingState>({
    isLoading: false,
    error: null,
    comparison: null,
    selectedVendorId: null,
    selectedPriceListId: null,
    isManualOverride: false,
    overrideRecord: null
  })

  const [currentQuantity, setCurrentQuantity] = useState(initialQuantity)
  const [currentUnit, setCurrentUnit] = useState(initialUnit)

  // Fetch pricing from the service
  const fetchPricing = useCallback(async (quantity: number, unit: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const comparison = await PRAutoPricingService.fetchPricingOptionsForItem({
        productId,
        quantity,
        unit
      })

      // Auto-select recommended vendor if not manually overridden
      const recommendedVendorId = comparison.recommendedVendor?.vendorId || null
      const recommendedPriceListId = comparison.recommendedVendor?.priceListId || null

      setState(prev => ({
        ...prev,
        isLoading: false,
        comparison,
        selectedVendorId: prev.isManualOverride ? prev.selectedVendorId : recommendedVendorId,
        selectedPriceListId: prev.isManualOverride ? prev.selectedPriceListId : recommendedPriceListId
      }))

      setCurrentQuantity(quantity)
      setCurrentUnit(unit)
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pricing'
      }))
    }
  }, [productId])

  // Update quantity and recalculate
  const updateQuantity = useCallback(async (quantity: number, unit?: string) => {
    const effectiveUnit = unit || currentUnit
    await fetchPricing(quantity, effectiveUnit)
  }, [currentUnit, fetchPricing])

  // Select a vendor manually
  const selectVendor = useCallback((
    vendorId: string,
    priceListId: string,
    reasonType?: string,
    reasonText?: string
  ) => {
    if (!state.comparison) return

    const isOverride = vendorId !== state.comparison.recommendedVendor?.vendorId
    let overrideRecord: VendorOverrideRecord | null = null

    if (isOverride && state.comparison.recommendedVendor) {
      const selectedOption = state.comparison.vendorOptions.find(v => v.vendorId === vendorId)
      const recommendedOption = state.comparison.recommendedVendor

      if (selectedOption) {
        const priceDiff: Money = {
          amount: selectedOption.pricePerBaseUnit.amount - recommendedOption.pricePerBaseUnit.amount,
          currency: selectedOption.pricePerBaseUnit.currency
        }

        overrideRecord = PRAutoPricingService.recordOverride(
          state.comparison.prItemId,
          recommendedOption.vendorId,
          vendorId,
          (reasonType as VendorOverrideRecord['reasonType']) || 'other',
          reasonText || 'Manual selection',
          userId,
          priceDiff
        )
      }
    }

    setState(prev => ({
      ...prev,
      selectedVendorId: vendorId,
      selectedPriceListId: priceListId,
      isManualOverride: isOverride,
      overrideRecord
    }))
  }, [state.comparison, userId])

  // Accept the recommended vendor
  const acceptRecommendation = useCallback(() => {
    if (!state.comparison?.recommendedVendor) return

    setState(prev => ({
      ...prev,
      selectedVendorId: state.comparison!.recommendedVendor!.vendorId,
      selectedPriceListId: state.comparison!.recommendedVendor!.priceListId,
      isManualOverride: false,
      overrideRecord: null
    }))
  }, [state.comparison])

  // Get the selected vendor option
  const getSelectedVendor = useCallback((): NormalizedVendorOption | null => {
    if (!state.comparison || !state.selectedVendorId) return null
    return state.comparison.vendorOptions.find(v => v.vendorId === state.selectedVendorId) || null
  }, [state.comparison, state.selectedVendorId])

  // Get the unit price for the selected vendor
  const getSelectedUnitPrice = useCallback((): Money | null => {
    const vendor = getSelectedVendor()
    return vendor?.pricePerBaseUnit || null
  }, [getSelectedVendor])

  // Get the total cost for the current quantity
  const getTotalCost = useCallback((): Money | null => {
    const vendor = getSelectedVendor()
    if (!vendor || !state.comparison) return null

    return {
      amount: vendor.pricePerBaseUnit.amount * state.comparison.requestedQuantityInBaseUnit,
      currency: vendor.pricePerBaseUnit.currency
    }
  }, [getSelectedVendor, state.comparison])

  // Check if submission should be blocked due to MOQ
  const canSubmit = useCallback((): boolean => {
    if (!state.comparison) return false
    if (!state.selectedVendorId) return false

    const selectedVendor = getSelectedVendor()
    if (!selectedVendor) return false

    // Check if selected vendor meets MOQ
    return selectedVendor.meetsMinimumOrder
  }, [state.comparison, state.selectedVendorId, getSelectedVendor])

  // Clear the pricing cache
  const clearCache = useCallback(() => {
    PRAutoPricingService.clearCacheForProduct(productId)
  }, [productId])

  // Fetch pricing on mount if enabled
  useEffect(() => {
    if (fetchOnMount && productId) {
      fetchPricing(initialQuantity, initialUnit)
    }
  }, []) // Only run on mount

  return {
    state,
    fetchPricing,
    updateQuantity,
    selectVendor,
    acceptRecommendation,
    getSelectedVendor,
    getSelectedUnitPrice,
    getTotalCost,
    canSubmit,
    clearCache
  }
}

// =============================================================================
// Batch Hook for Multiple Items
// =============================================================================

export interface UsePRBatchPricingOptions {
  /** Items to fetch pricing for */
  items: Array<{
    id: string
    productId: string
    quantity: number
    unit: string
  }>
  /** User ID for override tracking */
  userId?: string
}

export interface UsePRBatchPricingReturn {
  /** Map of item ID to pricing state */
  itemStates: Map<string, PRItemPricingState>
  /** Whether any items are loading */
  isLoading: boolean
  /** Fetch all pricing */
  fetchAllPricing: () => Promise<void>
  /** Get submission validation results */
  validateForSubmission: () => {
    canSubmit: boolean
    blockedItems: string[]
    warningItems: string[]
  }
}

export function usePRBatchPricing(options: UsePRBatchPricingOptions): UsePRBatchPricingReturn {
  const { items, userId = 'current-user' } = options

  const [itemStates, setItemStates] = useState<Map<string, PRItemPricingState>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  const fetchAllPricing = useCallback(async () => {
    setIsLoading(true)

    try {
      const results = await PRAutoPricingService.processPRItems(items)

      const newStates = new Map<string, PRItemPricingState>()

      results.forEach((comparison, itemId) => {
        newStates.set(itemId, {
          isLoading: false,
          error: null,
          comparison,
          selectedVendorId: comparison.recommendedVendor?.vendorId || null,
          selectedPriceListId: comparison.recommendedVendor?.priceListId || null,
          isManualOverride: false,
          overrideRecord: null
        })
      })

      setItemStates(newStates)
    } catch (error) {
      console.error('Failed to fetch batch pricing:', error)
    } finally {
      setIsLoading(false)
    }
  }, [items])

  const validateForSubmission = useCallback(() => {
    const blockedItems: string[] = []
    const warningItems: string[] = []

    itemStates.forEach((state, itemId) => {
      if (!state.comparison) {
        blockedItems.push(itemId)
        return
      }

      if (!state.selectedVendorId) {
        blockedItems.push(itemId)
        return
      }

      const selectedVendor = state.comparison.vendorOptions.find(
        v => v.vendorId === state.selectedVendorId
      )

      if (!selectedVendor?.meetsMinimumOrder) {
        // If error severity, block; if warning, just warn
        const alert = state.comparison.moqAlerts.find(
          a => a.vendorId === state.selectedVendorId
        )
        if (alert?.severity === 'error') {
          blockedItems.push(itemId)
        } else {
          warningItems.push(itemId)
        }
      }
    })

    return {
      canSubmit: blockedItems.length === 0,
      blockedItems,
      warningItems
    }
  }, [itemStates])

  return {
    itemStates,
    isLoading,
    fetchAllPricing,
    validateForSubmission
  }
}

export default usePRAutoPricing
