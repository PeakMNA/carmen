/**
 * Stock Replenishment Service
 *
 * Service for PAR-based stock replenishment suggestions and automatic
 * Store Requisition generation.
 *
 * Core Functions:
 * - getReplenishmentSuggestions: Get items below PAR level
 * - calculateSuggestedQuantity: Calculate optimal reorder quantity
 * - createReplenishmentRequisition: Auto-create SR from suggestions
 *
 * Replenishment Logic:
 * - Trigger when currentStock <= reorderPoint
 * - suggestedQty = parLevel - currentStock
 * - Apply minOrderQty and maxOrderQty constraints
 * - Check source availability before creating SR
 *
 * @see docs/app/store-operations/sr-business-rules.md
 */

import {
  ReplenishmentSuggestion,
  StoreRequisition,
  StoreRequisitionItem,
  SRStatus,
  SRWorkflowType,
  GeneratedDocumentType,
  ReplenishmentMode
} from '@/lib/types/store-requisition'
import { InventoryLocationType } from '@/lib/types/location-management'
import type { ApprovalStatus } from '@/lib/types/common'
import { getNextDocumentNumber } from '@/lib/mock-data/document-sequences'
import { stockAvailabilityService } from './stock-availability-service'

// ====== PAR CONFIGURATION ======

interface PARConfig {
  locationId: string
  productId: string
  parLevel: number
  reorderPoint: number
  minOrderQty: number
  maxOrderQty: number
  leadTimeDays: number
  isActive: boolean
}

// Mock PAR configurations
const mockPARConfigs: PARConfig[] = [
  // Central Kitchen PAR levels
  { locationId: 'loc-003', productId: 'product-001', parLevel: 15, reorderPoint: 10, minOrderQty: 5, maxOrderQty: 20, leadTimeDays: 1, isActive: true },
  { locationId: 'loc-003', productId: 'product-002', parLevel: 30, reorderPoint: 10, minOrderQty: 10, maxOrderQty: 50, leadTimeDays: 1, isActive: true },
  { locationId: 'loc-003', productId: 'product-003', parLevel: 50, reorderPoint: 20, minOrderQty: 25, maxOrderQty: 100, leadTimeDays: 2, isActive: true },
  { locationId: 'loc-003', productId: 'product-004', parLevel: 20, reorderPoint: 8, minOrderQty: 10, maxOrderQty: 40, leadTimeDays: 1, isActive: true },
  // Corporate Office PAR levels
  { locationId: 'loc-006', productId: 'product-001', parLevel: 5, reorderPoint: 2, minOrderQty: 2, maxOrderQty: 10, leadTimeDays: 2, isActive: true },
]

// Mock current stock levels
const mockCurrentStock: Record<string, Record<string, number>> = {
  'loc-003': {
    'product-001': 8,
    'product-002': 5,
    'product-003': 15,
    'product-004': 10
  },
  'loc-006': {
    'product-001': 1
  }
}

// Mock product info
const mockProductInfo: Record<string, { code: string; name: string; categoryName: string; unit: string; cost: number }> = {
  'product-001': { code: 'OIL-OLIVE-001', name: 'Premium Olive Oil', categoryName: 'Oils & Fats', unit: 'bottle', cost: 8.50 },
  'product-002': { code: 'VEG-TOM-002', name: 'Organic Tomatoes', categoryName: 'Fresh Vegetables', unit: 'kg', cost: 3.25 },
  'product-003': { code: 'DRY-FLR-003', name: 'All-Purpose Flour', categoryName: 'Dry Goods', unit: 'kg', cost: 2.10 },
  'product-004': { code: 'HRB-BAS-004', name: 'Fresh Basil', categoryName: 'Fresh Herbs', unit: 'bunch', cost: 2.50 }
}

// ====== SERVICE TYPES ======

export interface ReplenishmentFilter {
  locationId?: string
  urgency?: 'critical' | 'warning' | 'low' | 'all'
  categoryId?: string
  minValue?: number
  maxValue?: number
}

export interface ReplenishmentResult {
  success: boolean
  suggestions: ReplenishmentSuggestion[]
  summary: {
    totalItems: number
    criticalCount: number
    warningCount: number
    lowCount: number
    totalEstimatedValue: number
  }
}

export interface CreateRequisitionResult {
  success: boolean
  requisition?: StoreRequisition
  error?: string
}

// ====== SERVICE CLASS ======

export class ReplenishmentService {
  /**
   * Get replenishment suggestions for a location
   */
  async getReplenishmentSuggestions(
    filter?: ReplenishmentFilter
  ): Promise<ReplenishmentResult> {
    const suggestions: ReplenishmentSuggestion[] = []

    // Get all active PAR configs
    let parConfigs = mockPARConfigs.filter(p => p.isActive)

    // Filter by location if specified
    if (filter?.locationId) {
      parConfigs = parConfigs.filter(p => p.locationId === filter.locationId)
    }

    // Process each PAR config
    for (const par of parConfigs) {
      const currentStock = this.getCurrentStock(par.locationId, par.productId)

      // Check if replenishment needed
      if (currentStock <= par.reorderPoint) {
        const suggestion = await this.createSuggestion(par, currentStock)

        // Apply urgency filter
        if (filter?.urgency && filter.urgency !== 'all' && suggestion.urgency !== filter.urgency) {
          continue
        }

        suggestions.push(suggestion)
      }
    }

    // Sort by urgency (critical first) then by estimated cost (descending)
    suggestions.sort((a, b) => {
      const urgencyOrder = { critical: 0, warning: 1, low: 2 }
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      if (urgencyDiff !== 0) return urgencyDiff
      return b.estimatedTotalCost - a.estimatedTotalCost
    })

    // Calculate summary
    const summary = {
      totalItems: suggestions.length,
      criticalCount: suggestions.filter(s => s.urgency === 'critical').length,
      warningCount: suggestions.filter(s => s.urgency === 'warning').length,
      lowCount: suggestions.filter(s => s.urgency === 'low').length,
      totalEstimatedValue: suggestions.reduce((sum, s) => sum + s.estimatedTotalCost, 0)
    }

    return {
      success: true,
      suggestions,
      summary
    }
  }

  /**
   * Create a replenishment suggestion from PAR config
   */
  private async createSuggestion(
    par: PARConfig,
    currentStock: number
  ): Promise<ReplenishmentSuggestion> {
    const productInfo = mockProductInfo[par.productId] || {
      code: par.productId,
      name: par.productId,
      categoryName: 'Unknown',
      unit: 'unit',
      cost: 0
    }

    // Calculate suggested quantity
    const suggestedQty = this.calculateSuggestedQuantity(
      currentStock,
      par.parLevel,
      par.minOrderQty,
      par.maxOrderQty
    )

    // Determine urgency
    const urgency = this.calculateUrgency(currentStock, par.reorderPoint, par.parLevel)

    // Check source availability
    const sourceAvailability = await this.checkSourceAvailability(
      par.productId,
      suggestedQty,
      par.locationId
    )

    return {
      id: `rep-${par.locationId}-${par.productId}`,
      productId: par.productId,
      productCode: productInfo.code,
      productName: productInfo.name,
      categoryName: productInfo.categoryName,
      unit: productInfo.unit,
      locationId: par.locationId,
      locationName: this.getLocationName(par.locationId),
      locationType: InventoryLocationType.INVENTORY,
      currentStock,
      parLevel: par.parLevel,
      reorderPoint: par.reorderPoint,
      minOrderQty: par.minOrderQty,
      maxOrderQty: par.maxOrderQty,
      suggestedQty,
      urgency,
      sourceAvailability,
      estimatedUnitCost: productInfo.cost,
      estimatedTotalCost: suggestedQty * productInfo.cost,
      isSelected: false
    }
  }

  /**
   * Calculate suggested replenishment quantity
   */
  calculateSuggestedQuantity(
    currentStock: number,
    parLevel: number,
    minOrderQty: number,
    maxOrderQty: number
  ): number {
    // Base quantity to bring stock to PAR level
    let suggestedQty = parLevel - currentStock

    // Apply minimum order quantity
    suggestedQty = Math.max(suggestedQty, minOrderQty)

    // Apply maximum order quantity
    suggestedQty = Math.min(suggestedQty, maxOrderQty)

    return suggestedQty
  }

  /**
   * Calculate urgency level based on stock levels
   */
  private calculateUrgency(
    currentStock: number,
    reorderPoint: number,
    parLevel: number
  ): 'critical' | 'warning' | 'low' {
    const stockRatio = currentStock / reorderPoint

    if (stockRatio <= 0.5) {
      return 'critical' // Less than 50% of reorder point
    } else if (stockRatio <= 0.8) {
      return 'warning' // Between 50-80% of reorder point
    } else {
      return 'low' // Between 80-100% of reorder point
    }
  }

  /**
   * Check source availability for a product
   */
  private async checkSourceAvailability(
    productId: string,
    requiredQty: number,
    excludeLocationId: string
  ): Promise<{
    locationId: string
    locationName: string
    availableQty: number
    canFulfill: boolean
  }[]> {
    const locations = stockAvailabilityService.getProductLocations(productId)

    return locations
      .filter(l => l.locationId !== excludeLocationId)
      .map(l => ({
        locationId: l.locationId,
        locationName: l.locationName,
        availableQty: l.availableQty,
        canFulfill: l.availableQty >= requiredQty
      }))
  }

  /**
   * Create a Store Requisition from selected replenishment suggestions
   */
  async createReplenishmentRequisition(
    locationId: string,
    suggestions: ReplenishmentSuggestion[],
    requestorId: string,
    requestorName: string,
    departmentId: string,
    departmentName: string,
    mode: ReplenishmentMode = ReplenishmentMode.SUGGEST
  ): Promise<CreateRequisitionResult> {
    if (suggestions.length === 0) {
      return {
        success: false,
        error: 'No suggestions selected'
      }
    }

    // Validate all suggestions are for the same location
    const locationSuggestions = suggestions.filter(s => s.locationId === locationId)
    if (locationSuggestions.length !== suggestions.length) {
      return {
        success: false,
        error: 'All suggestions must be for the same location'
      }
    }

    // Determine source location (Main Warehouse)
    const sourceLocationId = stockAvailabilityService.getMainWarehouseId()

    // Build requisition items
    const items: StoreRequisitionItem[] = await Promise.all(
      suggestions.map(async (suggestion, index) => {
        // Check availability at source
        const availability = await stockAvailabilityService.checkStockAvailability(
          suggestion.productId,
          suggestion.suggestedQty,
          sourceLocationId,
          locationId
        )

        const fulfillment = stockAvailabilityService.calculateFulfillment(
          availability,
          suggestion.locationType
        )

        return {
          id: `sri-rep-${Date.now()}-${index + 1}`,
          productId: suggestion.productId,
          productCode: suggestion.productCode,
          productName: suggestion.productName,
          categoryId: suggestion.categoryName,
          categoryName: suggestion.categoryName,
          unit: suggestion.unit,
          requestedQty: suggestion.suggestedQty,
          approvedQty: mode === ReplenishmentMode.AUTO_APPROVE ? suggestion.suggestedQty : 0,
          issuedQty: 0,
          unitCost: suggestion.estimatedUnitCost,
          totalCost: suggestion.estimatedTotalCost,
          sourceAvailableQty: availability.availableQty,
          fulfillment,
          approvalStatus: (mode === ReplenishmentMode.AUTO_APPROVE ? 'approved' : 'pending') as ApprovalStatus,
          notes: `Auto-generated from PAR replenishment. Current stock: ${suggestion.currentStock}, PAR level: ${suggestion.parLevel}`
        }
      })
    )

    // Calculate totals
    const totalItems = items.length
    const totalQuantity = items.reduce((sum, i) => sum + i.requestedQty, 0)
    const estimatedValue = items.reduce((sum, i) => sum + i.totalCost, 0)

    // Determine initial status based on mode
    let status: SRStatus
    switch (mode) {
      case ReplenishmentMode.AUTO_APPROVE:
        status = SRStatus.Approved
        break
      case ReplenishmentMode.AUTO_DRAFT:
        status = SRStatus.Submitted
        break
      default:
        status = SRStatus.Draft
    }

    // Create requisition
    const requisition: StoreRequisition = {
      id: `sr-rep-${Date.now()}`,
      refNo: getNextDocumentNumber('SR'),
      requestDate: new Date(),
      requiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status,
      workflowType: SRWorkflowType.MAIN_STORE,
      sourceLocationId,
      sourceLocationCode: 'WH-001',
      sourceLocationName: 'Main Warehouse',
      sourceLocationType: InventoryLocationType.INVENTORY,
      destinationLocationId: locationId,
      destinationLocationCode: this.getLocationCode(locationId),
      destinationLocationName: this.getLocationName(locationId),
      destinationLocationType: InventoryLocationType.INVENTORY,
      requestedBy: requestorName,
      requestorId,
      departmentId,
      departmentName,
      items,
      totalItems,
      totalQuantity,
      estimatedValue: { amount: estimatedValue, currency: 'USD' },
      generatedDocuments: [],
      description: 'Auto-generated from PAR-based stock replenishment',
      notes: `Generated on ${new Date().toISOString()}. Mode: ${mode}`,
      createdAt: new Date(),
      createdBy: requestorId,
      approvedAt: mode === ReplenishmentMode.AUTO_APPROVE ? new Date() : undefined,
      approvedBy: mode === ReplenishmentMode.AUTO_APPROVE ? 'System (Auto-Approve)' : undefined
    }

    return {
      success: true,
      requisition
    }
  }

  /**
   * Get current stock level for a location/product
   */
  private getCurrentStock(locationId: string, productId: string): number {
    return mockCurrentStock[locationId]?.[productId] || 0
  }

  /**
   * Get location name
   */
  private getLocationName(locationId: string): string {
    const names: Record<string, string> = {
      'loc-003': 'Central Kitchen',
      'loc-004': 'Main Warehouse',
      'loc-006': 'Corporate Office'
    }
    return names[locationId] || locationId
  }

  /**
   * Get location code
   */
  private getLocationCode(locationId: string): string {
    const codes: Record<string, string> = {
      'loc-003': 'CK-001',
      'loc-004': 'WH-001',
      'loc-006': 'CORP-001'
    }
    return codes[locationId] || locationId
  }

  /**
   * Get PAR configuration for a location/product
   */
  getPARConfig(locationId: string, productId: string): PARConfig | undefined {
    return mockPARConfigs.find(
      p => p.locationId === locationId && p.productId === productId
    )
  }

  /**
   * Get all PAR configurations for a location
   */
  getLocationPARConfigs(locationId: string): PARConfig[] {
    return mockPARConfigs.filter(p => p.locationId === locationId && p.isActive)
  }

  /**
   * Check if any items need replenishment at a location
   */
  async hasReplenishmentNeeds(locationId: string): Promise<boolean> {
    const result = await this.getReplenishmentSuggestions({ locationId })
    return result.suggestions.length > 0
  }

  /**
   * Get count of items needing replenishment by urgency
   */
  async getReplenishmentCounts(locationId: string): Promise<{
    critical: number
    warning: number
    low: number
    total: number
  }> {
    const result = await this.getReplenishmentSuggestions({ locationId })
    return {
      critical: result.summary.criticalCount,
      warning: result.summary.warningCount,
      low: result.summary.lowCount,
      total: result.summary.totalItems
    }
  }
}

// Export singleton instance
export const replenishmentService = new ReplenishmentService()
