/**
 * Stock Replenishment Mock Data
 *
 * Mock data for stock replenishment module, including items below par level
 * and helper functions for PAR-level calculations.
 *
 * Note: Stock Replenishment now creates Store Requisitions (SR) directly.
 * See lib/mock-data/store-requisitions.ts for SR mock data.
 */

import { mockProductLocationAssignments, mockInventoryLocations } from './inventory-locations'
import { InventoryLocationType } from '../types/location-management'

// ====== TYPES ======

export type TransferUrgency = 'critical' | 'warning' | 'low'

export interface TransferItem {
  id: string
  productId: string
  productCode: string
  productName: string
  categoryName: string
  unit: string
  locationId: string
  locationName: string
  currentStock: number
  parLevel: number
  reorderPoint: number
  minimumLevel: number
  recommendedQty: number  // parLevel - currentStock
  urgency: TransferUrgency
  // Source location availability (populated when source is selected)
  sourceLocationId?: string
  sourceLocationName?: string
  sourceAvailable?: number
}

// ====== HELPER FUNCTIONS ======

/**
 * Calculate urgency based on current stock vs par level thresholds
 */
function calculateUrgency(currentStock: number, parLevel: number, reorderPoint?: number, minLevel?: number): TransferUrgency {
  const minimumLevel = minLevel || parLevel * 0.3
  const reorder = reorderPoint || parLevel * 0.4

  if (currentStock <= minimumLevel) {
    return 'critical'
  } else if (currentStock <= reorder) {
    return 'warning'
  } else {
    return 'low'
  }
}

/**
 * Get items below par level for a specific location
 * This is the main function for the replenishment dashboard
 */
export function getItemsBelowParLevel(locationId: string): TransferItem[] {
  const location = mockInventoryLocations.find(loc => loc.id === locationId)
  if (!location) return []

  const productAssignments = mockProductLocationAssignments.filter(
    pa => pa.locationId === locationId && pa.isActive && pa.isStocked
  )

  const itemsBelowPar: TransferItem[] = []

  for (const pa of productAssignments) {
    const currentStock = pa.currentQuantity || 0
    const parLevel = pa.parLevel || 0
    const reorderPoint = pa.reorderPoint || parLevel * 0.4
    const minimumLevel = pa.minQuantity || parLevel * 0.3

    // Only include items below par level
    if (currentStock < parLevel && parLevel > 0) {
      const recommendedQty = parLevel - currentStock
      const urgency = calculateUrgency(currentStock, parLevel, reorderPoint, minimumLevel)

      itemsBelowPar.push({
        id: pa.id,
        productId: pa.productId,
        productCode: pa.productCode,
        productName: pa.productName,
        categoryName: pa.categoryName,
        unit: pa.baseUnit,
        locationId: pa.locationId,
        locationName: location.name,
        currentStock,
        parLevel,
        reorderPoint,
        minimumLevel,
        recommendedQty,
        urgency
      })
    }
  }

  // Sort by urgency (critical first, then warning, then low)
  const urgencyOrder: Record<TransferUrgency, number> = {
    'critical': 0,
    'warning': 1,
    'low': 2
  }

  return itemsBelowPar.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
}

/**
 * Get items grouped by urgency
 */
export function getItemsBelowParLevelGrouped(locationId: string): {
  critical: TransferItem[]
  warning: TransferItem[]
  low: TransferItem[]
} {
  const items = getItemsBelowParLevel(locationId)

  return {
    critical: items.filter(item => item.urgency === 'critical'),
    warning: items.filter(item => item.urgency === 'warning'),
    low: items.filter(item => item.urgency === 'low')
  }
}

/**
 * Get available quantity of an item at a source location
 */
export function getSourceAvailability(productId: string, sourceLocationId: string): number {
  const assignment = mockProductLocationAssignments.find(
    pa => pa.productId === productId && pa.locationId === sourceLocationId && pa.isActive
  )
  return assignment?.currentQuantity || 0
}

/**
 * Get all inventory locations that can be used as source
 * (locations that have inventory enabled)
 */
export function getSourceLocations(): Array<{ id: string; code: string; name: string }> {
  return mockInventoryLocations
    .filter(loc => loc.status === 'active' && loc.type === InventoryLocationType.INVENTORY)
    .map(loc => ({
      id: loc.id,
      code: loc.code,
      name: loc.name
    }))
}

/**
 * Enrich replenishment items with source availability
 */
export function enrichItemsWithSourceAvailability(
  items: TransferItem[],
  sourceLocationId: string
): TransferItem[] {
  const sourceLocation = mockInventoryLocations.find(loc => loc.id === sourceLocationId)

  return items.map(item => ({
    ...item,
    sourceLocationId,
    sourceLocationName: sourceLocation?.name || 'Unknown',
    sourceAvailable: getSourceAvailability(item.productId, sourceLocationId)
  }))
}


/**
 * Get items below par level for multiple locations, grouped by location
 * This is used when displaying items across user's assigned locations
 */
export function getItemsBelowParLevelByLocations(locationIds: string[]): {
  locationId: string
  locationName: string
  locationType?: string
  items: TransferItem[]
  summary: {
    critical: number
    warning: number
    low: number
    total: number
  }
}[] {
  const result: {
    locationId: string
    locationName: string
    locationType?: string
    items: TransferItem[]
    summary: {
      critical: number
      warning: number
      low: number
      total: number
    }
  }[] = []

  for (const locationId of locationIds) {
    const location = mockInventoryLocations.find(loc => loc.id === locationId)
    if (!location) continue

    const items = getItemsBelowParLevel(locationId)

    if (items.length > 0 || location.type === InventoryLocationType.INVENTORY) {
      result.push({
        locationId: location.id,
        locationName: location.name,
        locationType: location.type,
        items,
        summary: {
          critical: items.filter(i => i.urgency === 'critical').length,
          warning: items.filter(i => i.urgency === 'warning').length,
          low: items.filter(i => i.urgency === 'low').length,
          total: items.length
        }
      })
    }
  }

  // Sort by total items below par (highest first)
  return result.sort((a, b) => b.summary.total - a.summary.total)
}

/**
 * Get replenishment summary for a location (PAR-level based)
 */
export function getReplenishmentSummary(locationId: string): {
  totalItemsBelowPar: number
  criticalCount: number
  warningCount: number
  lowCount: number
} {
  const grouped = getItemsBelowParLevelGrouped(locationId)

  return {
    totalItemsBelowPar: grouped.critical.length + grouped.warning.length + grouped.low.length,
    criticalCount: grouped.critical.length,
    warningCount: grouped.warning.length,
    lowCount: grouped.low.length
  }
}
