/**
 * Stock Availability Service
 *
 * Service for checking stock availability and determining fulfillment
 * options for Store Requisitions.
 *
 * Core Functions:
 * - checkStockAvailability: Check single product availability
 * - checkBulkStockAvailability: Check multiple products at once
 * - findAlternativeSourceLocations: Find alternative source locations
 * - calculateFulfillment: Determine how to fulfill a request (ST/SI/PR split)
 *
 * @see docs/app/store-operations/sr-business-rules.md
 */

import {
  StockAvailabilityResult,
  SRLineItemFulfillment,
  GeneratedDocumentType
} from '@/lib/types/store-requisition'
import { InventoryLocationType } from '@/lib/types/location-management'
import { mockInventoryLocations } from '@/lib/mock-data/inventory-locations'

// ====== MOCK STOCK DATA ======
// In production, this would come from database queries

interface MockStockBalance {
  locationId: string
  locationName: string
  locationType: InventoryLocationType
  productId: string
  availableQty: number
  reservedQty: number
  onHandQty: number
}

const mockStockBalances: MockStockBalance[] = [
  // Main Warehouse stock
  { locationId: 'loc-004', locationName: 'Main Warehouse', locationType: InventoryLocationType.INVENTORY, productId: 'product-001', availableQty: 50, reservedQty: 5, onHandQty: 55 },
  { locationId: 'loc-004', locationName: 'Main Warehouse', locationType: InventoryLocationType.INVENTORY, productId: 'product-002', availableQty: 20, reservedQty: 0, onHandQty: 20 },
  { locationId: 'loc-004', locationName: 'Main Warehouse', locationType: InventoryLocationType.INVENTORY, productId: 'product-003', availableQty: 100, reservedQty: 25, onHandQty: 125 },
  { locationId: 'loc-004', locationName: 'Main Warehouse', locationType: InventoryLocationType.INVENTORY, productId: 'product-004', availableQty: 30, reservedQty: 0, onHandQty: 30 },
  { locationId: 'loc-004', locationName: 'Main Warehouse', locationType: InventoryLocationType.INVENTORY, productId: 'product-005', availableQty: 75, reservedQty: 0, onHandQty: 75 },
  { locationId: 'loc-004', locationName: 'Main Warehouse', locationType: InventoryLocationType.INVENTORY, productId: 'product-wine-001', availableQty: 48, reservedQty: 0, onHandQty: 48 },
  { locationId: 'loc-004', locationName: 'Main Warehouse', locationType: InventoryLocationType.INVENTORY, productId: 'product-sugar-001', availableQty: 40, reservedQty: 0, onHandQty: 40 },
  { locationId: 'loc-004', locationName: 'Main Warehouse', locationType: InventoryLocationType.INVENTORY, productId: 'product-clean-001', availableQty: 50, reservedQty: 0, onHandQty: 50 },
  { locationId: 'loc-004', locationName: 'Main Warehouse', locationType: InventoryLocationType.INVENTORY, productId: 'product-gloves-001', availableQty: 100, reservedQty: 0, onHandQty: 100 },
  // Central Kitchen stock
  { locationId: 'loc-003', locationName: 'Central Kitchen', locationType: InventoryLocationType.INVENTORY, productId: 'product-001', availableQty: 15, reservedQty: 0, onHandQty: 15 },
  { locationId: 'loc-003', locationName: 'Central Kitchen', locationType: InventoryLocationType.INVENTORY, productId: 'product-002', availableQty: 5, reservedQty: 0, onHandQty: 5 },
  { locationId: 'loc-003', locationName: 'Central Kitchen', locationType: InventoryLocationType.INVENTORY, productId: 'product-003', availableQty: 25, reservedQty: 0, onHandQty: 25 },
  { locationId: 'loc-003', locationName: 'Central Kitchen', locationType: InventoryLocationType.INVENTORY, productId: 'product-004', availableQty: 10, reservedQty: 0, onHandQty: 10 },
  // Corporate Office stock
  { locationId: 'loc-006', locationName: 'Corporate Office', locationType: InventoryLocationType.INVENTORY, productId: 'product-001', availableQty: 3, reservedQty: 0, onHandQty: 3 },
]

// Mock product data for names/codes
const mockProductInfo: Record<string, { code: string; name: string }> = {
  'product-001': { code: 'OIL-OLIVE-001', name: 'Premium Olive Oil' },
  'product-002': { code: 'VEG-TOM-002', name: 'Organic Tomatoes' },
  'product-003': { code: 'DRY-FLR-003', name: 'All-Purpose Flour' },
  'product-004': { code: 'HRB-BAS-004', name: 'Fresh Basil' },
  'product-005': { code: 'DRY-RIC-001', name: 'Jasmine Rice' },
  'product-wine-001': { code: 'BEV-WIN-001', name: 'House Red Wine' },
  'product-sugar-001': { code: 'DRY-SGR-001', name: 'White Sugar' },
  'product-truffle-001': { code: 'SPE-TRF-001', name: 'Black Truffle' },
  'product-clean-001': { code: 'SUP-CLN-001', name: 'Industrial Cleaner' },
  'product-gloves-001': { code: 'SUP-GLV-001', name: 'Disposable Gloves' }
}

// Source location priority (lower = higher priority)
const SOURCE_PRIORITY: Record<string, number> = {
  'loc-004': 1, // Main Warehouse - highest priority
  'loc-003': 2, // Central Kitchen
  'loc-006': 3, // Corporate Office
}

// ====== SERVICE TYPES ======

export interface StockCheckRequest {
  productId: string
  requestedQty: number
  excludeLocationId?: string // Location to exclude (usually the destination)
  preferredSourceId?: string // Preferred source location
}

export interface BulkStockCheckRequest {
  items: StockCheckRequest[]
  destinationLocationId: string
  destinationLocationType: InventoryLocationType
}

export interface FulfillmentPlan {
  productId: string
  productCode: string
  productName: string
  requestedQty: number
  fulfillment: SRLineItemFulfillment
  availabilityDetails: StockAvailabilityResult
}

export interface BulkFulfillmentResult {
  items: FulfillmentPlan[]
  summary: {
    totalItems: number
    fullyFulfillable: number
    partiallyFulfillable: number
    requiresPurchase: number
    totalFromStock: number
    totalToPurchase: number
  }
}

// ====== SERVICE CLASS ======

export class StockAvailabilityService {
  /**
   * Check stock availability for a single product
   */
  async checkStockAvailability(
    productId: string,
    requestedQty: number,
    sourceLocationId?: string,
    excludeLocationId?: string
  ): Promise<StockAvailabilityResult> {
    const productInfo = mockProductInfo[productId] || { code: productId, name: productId }

    // Find stock at the preferred source location
    let sourceStock: MockStockBalance | null = null
    if (sourceLocationId) {
      sourceStock = mockStockBalances.find(
        s => s.locationId === sourceLocationId && s.productId === productId
      ) || null
    }

    // If no source specified or source has no stock, find best source
    if (!sourceStock || sourceStock.availableQty === 0) {
      sourceStock = this.findBestSourceLocation(productId, excludeLocationId)
    }

    const availableQty = sourceStock?.availableQty || 0
    const shortageQty = Math.max(0, requestedQty - availableQty)

    // Find alternative locations
    const alternativeLocations = this.findAlternativeSourceLocations(
      productId,
      requestedQty,
      sourceStock?.locationId || '',
      excludeLocationId
    )

    return {
      productId,
      productCode: productInfo.code,
      productName: productInfo.name,
      requestedQty,
      availableQty,
      shortageQty,
      sourceLocation: sourceStock ? {
        id: sourceStock.locationId,
        name: sourceStock.locationName,
        locationType: sourceStock.locationType,
        availableQty: sourceStock.availableQty
      } : null,
      alternativeLocations
    }
  }

  /**
   * Check stock availability for multiple products
   */
  async checkBulkStockAvailability(
    request: BulkStockCheckRequest
  ): Promise<StockAvailabilityResult[]> {
    const results: StockAvailabilityResult[] = []

    for (const item of request.items) {
      const result = await this.checkStockAvailability(
        item.productId,
        item.requestedQty,
        item.preferredSourceId,
        item.excludeLocationId || request.destinationLocationId
      )
      results.push(result)
    }

    return results
  }

  /**
   * Find alternative source locations for a product
   */
  findAlternativeSourceLocations(
    productId: string,
    requiredQty: number,
    excludeSourceId: string,
    excludeDestinationId?: string
  ): { id: string; name: string; availableQty: number }[] {
    return mockStockBalances
      .filter(s =>
        s.productId === productId &&
        s.locationId !== excludeSourceId &&
        s.locationId !== excludeDestinationId &&
        s.availableQty > 0
      )
      .sort((a, b) => {
        // Sort by priority first, then by available quantity (descending)
        const priorityA = SOURCE_PRIORITY[a.locationId] || 99
        const priorityB = SOURCE_PRIORITY[b.locationId] || 99
        if (priorityA !== priorityB) return priorityA - priorityB
        return b.availableQty - a.availableQty
      })
      .map(s => ({
        id: s.locationId,
        name: s.locationName,
        availableQty: s.availableQty
      }))
  }

  /**
   * Find the best source location for a product
   */
  private findBestSourceLocation(
    productId: string,
    excludeLocationId?: string
  ): MockStockBalance | null {
    const candidates = mockStockBalances
      .filter(s =>
        s.productId === productId &&
        s.locationId !== excludeLocationId &&
        s.availableQty > 0
      )
      .sort((a, b) => {
        const priorityA = SOURCE_PRIORITY[a.locationId] || 99
        const priorityB = SOURCE_PRIORITY[b.locationId] || 99
        if (priorityA !== priorityB) return priorityA - priorityB
        return b.availableQty - a.availableQty
      })

    return candidates.length > 0 ? candidates[0] : null
  }

  /**
   * Calculate fulfillment plan for a single item
   */
  calculateFulfillment(
    availability: StockAvailabilityResult,
    destinationLocationType: InventoryLocationType
  ): SRLineItemFulfillment {
    const { availableQty, shortageQty, sourceLocation } = availability

    // Determine primary document type based on destination
    let primaryDocType: GeneratedDocumentType
    if (availableQty === 0) {
      // No stock - will be PR
      primaryDocType = GeneratedDocumentType.PURCHASE_REQUEST
    } else if (destinationLocationType === InventoryLocationType.DIRECT) {
      // Direct location - Stock Issue
      primaryDocType = GeneratedDocumentType.STOCK_ISSUE
    } else {
      // Inventory location - Stock Transfer
      primaryDocType = GeneratedDocumentType.STOCK_TRANSFER
    }

    return {
      fromStock: availableQty,
      toPurchase: shortageQty,
      documentType: primaryDocType,
      sourceLocationId: sourceLocation?.id,
      sourceLocationName: sourceLocation?.name
    }
  }

  /**
   * Calculate fulfillment plans for multiple items
   */
  async calculateBulkFulfillment(
    request: BulkStockCheckRequest
  ): Promise<BulkFulfillmentResult> {
    const availabilityResults = await this.checkBulkStockAvailability(request)

    const items: FulfillmentPlan[] = []
    let fullyFulfillable = 0
    let partiallyFulfillable = 0
    let requiresPurchase = 0
    let totalFromStock = 0
    let totalToPurchase = 0

    for (let i = 0; i < request.items.length; i++) {
      const item = request.items[i]
      const availability = availabilityResults[i]
      const fulfillment = this.calculateFulfillment(
        availability,
        request.destinationLocationType
      )

      const productInfo = mockProductInfo[item.productId] || {
        code: item.productId,
        name: item.productId
      }

      items.push({
        productId: item.productId,
        productCode: productInfo.code,
        productName: productInfo.name,
        requestedQty: item.requestedQty,
        fulfillment,
        availabilityDetails: availability
      })

      // Update summary counts
      totalFromStock += fulfillment.fromStock
      totalToPurchase += fulfillment.toPurchase

      if (fulfillment.toPurchase === 0) {
        fullyFulfillable++
      } else if (fulfillment.fromStock > 0) {
        partiallyFulfillable++
      } else {
        requiresPurchase++
      }
    }

    return {
      items,
      summary: {
        totalItems: items.length,
        fullyFulfillable,
        partiallyFulfillable,
        requiresPurchase,
        totalFromStock,
        totalToPurchase
      }
    }
  }

  /**
   * Get stock balance for a specific location and product
   */
  getStockBalance(locationId: string, productId: string): number {
    const balance = mockStockBalances.find(
      s => s.locationId === locationId && s.productId === productId
    )
    return balance?.availableQty || 0
  }

  /**
   * Get all stock balances for a location
   */
  getLocationStock(locationId: string): MockStockBalance[] {
    return mockStockBalances.filter(s => s.locationId === locationId)
  }

  /**
   * Get all locations with stock for a product
   */
  getProductLocations(productId: string): {
    locationId: string
    locationName: string
    availableQty: number
  }[] {
    return mockStockBalances
      .filter(s => s.productId === productId && s.availableQty > 0)
      .map(s => ({
        locationId: s.locationId,
        locationName: s.locationName,
        availableQty: s.availableQty
      }))
  }

  /**
   * Check if a location is a valid source (has stock permissions)
   */
  isValidSourceLocation(locationId: string): boolean {
    const location = mockInventoryLocations.find(l => l.id === locationId)
    return location?.type === InventoryLocationType.INVENTORY
  }

  /**
   * Get the main warehouse location ID
   */
  getMainWarehouseId(): string {
    return 'loc-004' // Main Warehouse
  }

  /**
   * Reserve stock for a requisition (mock implementation)
   */
  async reserveStock(
    locationId: string,
    productId: string,
    quantity: number,
    requisitionId: string
  ): Promise<{ success: boolean; reservationId?: string; error?: string }> {
    const balance = mockStockBalances.find(
      s => s.locationId === locationId && s.productId === productId
    )

    if (!balance) {
      return { success: false, error: 'Stock balance not found' }
    }

    if (balance.availableQty < quantity) {
      return {
        success: false,
        error: `Insufficient stock. Available: ${balance.availableQty}, Requested: ${quantity}`
      }
    }

    // In production, this would create a reservation record
    // For mock, we just return success
    return {
      success: true,
      reservationId: `res-${requisitionId}-${productId}-${Date.now()}`
    }
  }

  /**
   * Release a stock reservation
   */
  async releaseReservation(
    reservationId: string
  ): Promise<{ success: boolean; error?: string }> {
    // Mock implementation - always succeeds
    return { success: true }
  }
}

// Export singleton instance
export const stockAvailabilityService = new StockAvailabilityService()
