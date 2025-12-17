/**
 * PR Auto-Pricing Service
 *
 * Main orchestrator service for the PR auto-pricing system.
 * Coordinates between:
 * - UnitConversionService: For price and MOQ normalization
 * - VendorAllocationService: For vendor scoring and selection
 * - Price list data: For fetching vendor pricing
 *
 * Key Features:
 * - Fetch and normalize all vendor prices for a product
 * - Validate MOQ requirements with unit conversion
 * - Recommend optimal vendor based on business rules
 * - Handle quantity changes with real-time recalculation
 * - Support manual override with audit logging
 */

import {
  ProductUnitConfiguration,
  NormalizedVendorOption,
  PRItemPriceComparison,
  MOQAlert,
  FetchPricingInput,
  RecalculatePricingInput,
  VendorOverrideRecord,
  Money
} from '@/lib/types'

import { UnitConversionService } from './unit-conversion-service'
import { VendorAllocationService, AllocationResult } from './vendor-allocation-service'
import { getProductUnitConfig } from '@/lib/mock-data/product-unit-configs'
import { mockPricelists, mockPricelistItems } from '@/lib/mock-data/pricelists'
import { mockVendors } from '@/lib/mock-data/vendors'

// =============================================================================
// Service Types
// =============================================================================

export interface VendorPriceListData {
  vendorId: string
  vendorName: string
  priceListId: string
  priceListName: string
  unitPrice: Money
  sellingUnitCode: string
  sellingUnitName: string
  minimumOrderQuantity: number
  leadTimeDays: number
  rating: number
  isPreferredVendor: boolean
  isPreferredItem: boolean
  validFrom: Date
  validTo: Date
  isValid: boolean
}

export interface PricingCacheEntry {
  productId: string
  comparison: PRItemPriceComparison
  cachedAt: Date
  expiresAt: Date
}

// =============================================================================
// PR Auto-Pricing Service
// =============================================================================

class PRAutoPricingServiceImpl {
  private cache: Map<string, PricingCacheEntry> = new Map()
  private readonly CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

  /**
   * Fetch pricing options for a PR item.
   * This is the main entry point for the auto-pricing system.
   */
  async fetchPricingOptionsForItem(
    input: FetchPricingInput
  ): Promise<PRItemPriceComparison> {
    const { productId, quantity, unit } = input

    // Check cache first
    const cached = this.getCachedPricing(productId)
    if (cached && this.isQuantityCompatible(cached, quantity, unit)) {
      // Update for new quantity but return cached vendor data
      return this.recalculateForQuantity(cached, quantity, unit)
    }

    // Get product unit configuration
    const unitConfig = getProductUnitConfig(productId)
    if (!unitConfig) {
      return this.createEmptyComparison(productId, quantity, unit, 'KG')
    }

    // Fetch all vendor price lists for this product
    const vendorPriceData = this.fetchVendorPriceLists(productId, input.vendorIds)

    // Convert requested quantity to base unit
    const requestedInBase = UnitConversionService.convertToBaseUnit(
      quantity,
      unit,
      unitConfig
    )

    // Normalize all vendor options
    const normalizedOptions = this.normalizeVendorOptions(
      vendorPriceData,
      unitConfig,
      requestedInBase.value
    )

    // Allocate vendors
    const allocation = VendorAllocationService.allocateVendor({
      vendorOptions: normalizedOptions,
      requestedQuantityInBaseUnit: requestedInBase.value,
      requireMOQ: false // Show all options
    })

    // Generate MOQ alerts
    const moqAlerts = this.generateMOQAlerts(
      normalizedOptions,
      requestedInBase.value,
      unitConfig.baseInventoryUnit
    )

    // Build result
    const result = this.buildPriceComparison(
      productId,
      quantity,
      unit,
      requestedInBase.value,
      unitConfig.baseInventoryUnit,
      allocation,
      moqAlerts
    )

    // Cache the result
    this.cachePricing(productId, result)

    return result
  }

  /**
   * Recalculate prices when quantity changes.
   */
  async recalculateOnQuantityChange(
    input: RecalculatePricingInput
  ): Promise<PRItemPriceComparison> {
    // Get the existing comparison from cache or fetch fresh
    const cached = this.getCachedPricing(input.prItemId)

    if (cached) {
      return this.recalculateForQuantity(
        cached,
        input.newQuantity,
        input.newUnit || cached.requestedUnit
      )
    }

    // No cache, fetch fresh
    return this.fetchPricingOptionsForItem({
      productId: input.prItemId,
      quantity: input.newQuantity,
      unit: input.newUnit || 'KG'
    })
  }

  /**
   * Process all items in a PR and return pricing for each.
   */
  async processPRItems(
    items: Array<{ id: string; productId: string; quantity: number; unit: string }>
  ): Promise<Map<string, PRItemPriceComparison>> {
    const results = new Map<string, PRItemPriceComparison>()

    // Process all items (could be parallelized in production)
    for (const item of items) {
      const comparison = await this.fetchPricingOptionsForItem({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit
      })

      // Update with actual PR item ID
      comparison.prItemId = item.id
      results.set(item.id, comparison)
    }

    return results
  }

  /**
   * Record a manual vendor override for audit purposes.
   */
  recordOverride(
    prItemId: string,
    originalVendorId: string,
    selectedVendorId: string,
    reasonType: VendorOverrideRecord['reasonType'],
    reasonText: string,
    userId: string,
    priceDifference: Money
  ): VendorOverrideRecord {
    const record: VendorOverrideRecord = {
      prItemId,
      originalVendorId,
      selectedVendorId,
      reasonType,
      reasonText,
      overriddenBy: userId,
      overriddenAt: new Date(),
      priceDifference,
      isPriceIncrease: priceDifference.amount > 0
    }

    // In production, this would be saved to database
    console.log('[Audit] Vendor override recorded:', record)

    return record
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Fetch all active vendor price lists for a product.
   */
  private fetchVendorPriceLists(
    productId: string,
    vendorIds?: string[]
  ): VendorPriceListData[] {
    const now = new Date()
    const results: VendorPriceListData[] = []

    // Get all active price lists
    const activePriceLists = mockPricelists.filter(pl => {
      if (vendorIds && !vendorIds.includes(pl.vendorId)) return false
      if (pl.status !== 'active') return false
      return true
    })

    // For each price list, find items matching the product
    for (const priceList of activePriceLists) {
      const items = mockPricelistItems.filter(
        item => item.priceListId === priceList.id && item.isActive
      )

      // Find the vendor
      const vendor = mockVendors.find(v => v.id === priceList.vendorId)
      if (!vendor) continue

      // For demo purposes, simulate that some items match the product
      // In production, this would be a proper product-to-pricelist-item mapping
      const matchingItems = items.filter(item => {
        // Simulate matching logic - in real system this would be by product ID
        return this.simulateProductMatch(productId, item.itemCode)
      })

      for (const item of matchingItems) {
        const isValid = priceList.effectiveStartDate <= now &&
                        (!priceList.effectiveEndDate || priceList.effectiveEndDate >= now)

        results.push({
          vendorId: vendor.id,
          vendorName: vendor.companyName,
          priceListId: priceList.id,
          priceListName: priceList.priceListName,
          unitPrice: item.unitPrice,
          sellingUnitCode: this.mapUnitToCode(item.unit, productId),
          sellingUnitName: item.unit,
          minimumOrderQuantity: item.minimumOrderQuantity || 1,
          leadTimeDays: item.leadTimeDays || 7,
          rating: vendor.rating || 4.0,
          isPreferredVendor: item.isPreferredVendor || false,
          isPreferredItem: false, // Would come from product-vendor relationship
          validFrom: priceList.effectiveStartDate,
          validTo: priceList.effectiveEndDate || new Date('2099-12-31'),
          isValid
        })
      }
    }

    // If no real matches, generate demo data for the product
    if (results.length === 0) {
      return this.generateDemoVendorData(productId)
    }

    return results
  }

  /**
   * Generate demo vendor data for testing.
   */
  private generateDemoVendorData(productId: string): VendorPriceListData[] {
    const unitConfig = getProductUnitConfig(productId)
    const baseUnit = unitConfig?.baseInventoryUnit || 'KG'
    const orderUnits = unitConfig?.orderUnits || []

    const now = new Date()
    const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    // Generate 3-5 vendor options with different units and prices
    const demoVendors: VendorPriceListData[] = [
      {
        vendorId: 'vendor-001',
        vendorName: 'Global Foods Inc.',
        priceListId: 'pl-demo-001',
        priceListName: 'Standard Pricing 2024',
        unitPrice: { amount: 28.00, currency: 'USD' },
        sellingUnitCode: orderUnits[0]?.unitCode || 'BAG-1KG',
        sellingUnitName: orderUnits[0]?.unitName || '1kg Bag',
        minimumOrderQuantity: 10,
        leadTimeDays: 3,
        rating: 4.5,
        isPreferredVendor: true,
        isPreferredItem: false,
        validFrom: now,
        validTo: futureDate,
        isValid: true
      },
      {
        vendorId: 'vendor-002',
        vendorName: 'Coffee Direct Ltd.',
        priceListId: 'pl-demo-002',
        priceListName: 'Wholesale Pricing',
        unitPrice: { amount: 16.00, currency: 'USD' },
        sellingUnitCode: orderUnits[1]?.unitCode || 'BAG-500G',
        sellingUnitName: orderUnits[1]?.unitName || '500g Bag',
        minimumOrderQuantity: 25,
        leadTimeDays: 5,
        rating: 4.2,
        isPreferredVendor: false,
        isPreferredItem: false,
        validFrom: now,
        validTo: futureDate,
        isValid: true
      },
      {
        vendorId: 'vendor-003',
        vendorName: 'Wholesale Plus',
        priceListId: 'pl-demo-003',
        priceListName: 'Bulk Pricing',
        unitPrice: { amount: 130.00, currency: 'USD' },
        sellingUnitCode: orderUnits.find(u => u.conversionToBase >= 5)?.unitCode || 'BOX-5KG',
        sellingUnitName: orderUnits.find(u => u.conversionToBase >= 5)?.unitName || '5kg Box',
        minimumOrderQuantity: 2,
        leadTimeDays: 7,
        rating: 4.0,
        isPreferredVendor: false,
        isPreferredItem: false,
        validFrom: now,
        validTo: futureDate,
        isValid: true
      }
    ]

    return demoVendors
  }

  /**
   * Normalize all vendor options to base unit.
   */
  private normalizeVendorOptions(
    vendorData: VendorPriceListData[],
    unitConfig: ProductUnitConfiguration,
    requestedInBase: number
  ): NormalizedVendorOption[] {
    return vendorData.map(data => {
      // Normalize price
      const priceNormalized = UnitConversionService.normalizePrice(
        data.unitPrice,
        data.sellingUnitCode,
        unitConfig
      )

      // Convert MOQ to base unit
      const moqNormalized = UnitConversionService.convertMOQToBaseUnit(
        data.minimumOrderQuantity,
        data.sellingUnitCode,
        unitConfig
      )

      // Validate MOQ
      const moqValidation = UnitConversionService.validateMOQRequirement(
        requestedInBase,
        unitConfig.baseInventoryUnit,
        data.minimumOrderQuantity,
        data.sellingUnitCode,
        unitConfig
      )

      return {
        vendorId: data.vendorId,
        vendorName: data.vendorName,
        priceListId: data.priceListId,
        priceListName: data.priceListName,
        unitPrice: data.unitPrice,
        sellingUnitCode: data.sellingUnitCode,
        sellingUnitName: data.sellingUnitName,
        pricePerBaseUnit: priceNormalized.pricePerBaseUnit,
        baseUnit: unitConfig.baseInventoryUnit,
        conversionFactor: priceNormalized.conversionFactor,
        minimumOrderQuantity: data.minimumOrderQuantity,
        moqInBaseUnit: moqNormalized.value,
        meetsMinimumOrder: moqValidation.meetsRequirement,
        moqGap: moqValidation.gapInBaseUnit,
        isPreferredVendor: data.isPreferredVendor,
        isPreferredItem: data.isPreferredItem,
        rating: data.rating,
        leadTimeDays: data.leadTimeDays,
        onTimeDeliveryRate: undefined,
        overallScore: 0, // Will be calculated by allocation service
        rank: 0,
        isRecommended: false,
        validFrom: data.validFrom,
        validTo: data.validTo,
        isValid: data.isValid
      }
    })
  }

  /**
   * Generate MOQ alerts for vendors that don't meet requirements.
   */
  private generateMOQAlerts(
    options: NormalizedVendorOption[],
    requestedInBase: number,
    baseUnit: string
  ): MOQAlert[] {
    return options
      .filter(o => !o.meetsMinimumOrder)
      .map(option => {
        const percentageMet = (requestedInBase / option.moqInBaseUnit) * 100
        const severity = UnitConversionService.getMOQAlertSeverity(percentageMet)

        return {
          vendorId: option.vendorId,
          vendorName: option.vendorName,
          gap: option.minimumOrderQuantity - Math.floor(requestedInBase / option.conversionFactor),
          gapInBaseUnit: option.moqGap,
          baseUnit,
          severity,
          message: `${option.vendorName} requires minimum ${option.moqInBaseUnit} ${baseUnit} (need ${option.moqGap.toFixed(2)} ${baseUnit} more)`,
          suggestedQuantity: option.moqInBaseUnit
        }
      })
  }

  /**
   * Build the complete price comparison result.
   */
  private buildPriceComparison(
    productId: string,
    requestedQuantity: number,
    requestedUnit: string,
    requestedInBase: number,
    baseUnit: string,
    allocation: AllocationResult,
    moqAlerts: MOQAlert[]
  ): PRItemPriceComparison {
    return {
      prItemId: productId, // Will be updated with actual PR item ID
      productId,
      productName: this.getProductName(productId),
      requestedQuantity,
      requestedUnit,
      requestedQuantityInBaseUnit: requestedInBase,
      baseUnit,
      vendorOptions: allocation.allOptions,
      vendorsMeetingMOQ: allocation.summary.vendorsMeetingMOQ,
      totalVendors: allocation.summary.totalVendors,
      recommendedVendor: allocation.recommended,
      recommendationReason: allocation.reason,
      moqAlerts,
      hasMOQWarnings: moqAlerts.length > 0,
      allVendorsFailMOQ: allocation.summary.vendorsMeetingMOQ === 0 && allocation.summary.totalVendors > 0,
      lowestPrice: allocation.summary.lowestPrice,
      highestPrice: allocation.summary.highestPrice,
      potentialSavings: allocation.summary.potentialSavings,
      generatedAt: new Date(),
      fromCache: false,
      cacheAge: undefined
    }
  }

  /**
   * Recalculate comparison for a new quantity.
   */
  private recalculateForQuantity(
    existing: PRItemPriceComparison,
    newQuantity: number,
    newUnit: string
  ): PRItemPriceComparison {
    const unitConfig = getProductUnitConfig(existing.productId)
    if (!unitConfig) return existing

    // Convert new quantity to base unit
    const newRequestedInBase = UnitConversionService.convertToBaseUnit(
      newQuantity,
      newUnit,
      unitConfig
    )

    // Re-allocate with new quantity
    const allocation = VendorAllocationService.reRankForQuantity(
      existing.vendorOptions,
      newRequestedInBase.value
    )

    // Regenerate MOQ alerts
    const moqAlerts = this.generateMOQAlerts(
      allocation.allOptions,
      newRequestedInBase.value,
      unitConfig.baseInventoryUnit
    )

    return {
      ...existing,
      requestedQuantity: newQuantity,
      requestedUnit: newUnit,
      requestedQuantityInBaseUnit: newRequestedInBase.value,
      vendorOptions: allocation.allOptions,
      vendorsMeetingMOQ: allocation.summary.vendorsMeetingMOQ,
      recommendedVendor: allocation.recommended,
      recommendationReason: allocation.reason,
      moqAlerts,
      hasMOQWarnings: moqAlerts.length > 0,
      allVendorsFailMOQ: allocation.summary.vendorsMeetingMOQ === 0,
      lowestPrice: allocation.summary.lowestPrice,
      highestPrice: allocation.summary.highestPrice,
      potentialSavings: allocation.summary.potentialSavings,
      generatedAt: new Date(),
      fromCache: true,
      cacheAge: (Date.now() - existing.generatedAt.getTime()) / 1000
    }
  }

  // ===========================================================================
  // Cache Management
  // ===========================================================================

  private getCachedPricing(productId: string): PRItemPriceComparison | null {
    const entry = this.cache.get(productId)
    if (!entry) return null

    // Check if expired
    if (Date.now() > entry.expiresAt.getTime()) {
      this.cache.delete(productId)
      return null
    }

    return entry.comparison
  }

  private cachePricing(productId: string, comparison: PRItemPriceComparison): void {
    this.cache.set(productId, {
      productId,
      comparison,
      cachedAt: new Date(),
      expiresAt: new Date(Date.now() + this.CACHE_TTL_MS)
    })
  }

  private isQuantityCompatible(
    cached: PRItemPriceComparison,
    newQuantity: number,
    newUnit: string
  ): boolean {
    // Always recalculate for quantity changes to ensure accurate MOQ validation
    return false
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  private simulateProductMatch(productId: string, itemCode: string): boolean {
    // Demo matching logic - in production this would be a proper lookup
    const productPrefixes: Record<string, string[]> = {
      'coffee-001': ['CF', 'CO', 'BE'],
      'tea-001': ['TE', 'BE'],
      'milk-001': ['ML', 'DA'],
      'rice-001': ['RI', 'GR']
    }

    const prefixes = productPrefixes[productId] || []
    return prefixes.some(p => itemCode.startsWith(p))
  }

  private mapUnitToCode(unitName: string, productId: string): string {
    const unitConfig = getProductUnitConfig(productId)
    if (!unitConfig) return unitName

    // Find matching order unit by name
    const match = unitConfig.orderUnits.find(
      u => u.unitName.toLowerCase() === unitName.toLowerCase()
    )

    return match?.unitCode || unitName
  }

  private getProductName(productId: string): string {
    // In production, this would lookup from product catalog
    const productNames: Record<string, string> = {
      'coffee-001': 'Premium Coffee Beans',
      'tea-001': 'Ceylon Tea',
      'milk-001': 'Fresh Milk',
      'rice-001': 'Jasmine Rice',
      'flour-001': 'All-Purpose Flour'
    }

    return productNames[productId] || productId
  }

  private createEmptyComparison(
    productId: string,
    quantity: number,
    unit: string,
    baseUnit: string
  ): PRItemPriceComparison {
    return {
      prItemId: productId,
      productId,
      productName: this.getProductName(productId),
      requestedQuantity: quantity,
      requestedUnit: unit,
      requestedQuantityInBaseUnit: quantity,
      baseUnit,
      vendorOptions: [],
      vendorsMeetingMOQ: 0,
      totalVendors: 0,
      recommendedVendor: null,
      recommendationReason: null,
      moqAlerts: [],
      hasMOQWarnings: false,
      allVendorsFailMOQ: false,
      lowestPrice: null,
      highestPrice: null,
      potentialSavings: null,
      generatedAt: new Date(),
      fromCache: false
    }
  }

  /**
   * Clear the pricing cache.
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Clear cache for a specific product.
   */
  clearCacheForProduct(productId: string): void {
    this.cache.delete(productId)
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const PRAutoPricingService = new PRAutoPricingServiceImpl()

export default PRAutoPricingService
