/**
 * Stock Replenishment Mock Data
 *
 * Mock data for stock replenishment module, including items below par level,
 * transfer requests (transfers), and helper functions.
 *
 * Transaction Code Format: TRF-YYMM-NNNN
 * - TRF: Transfer prefix (used for all stock transfers/replenishments)
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number (e.g., 001, 002, etc.)
 * Example: TRF-2410-001 = Transfer #001 from October 2024
 */

import { mockProductLocationAssignments, mockInventoryLocations } from './inventory-locations'
import { InventoryLocationType } from '../types/location-management'

// ====== TYPES ======

export type TransferUrgency = 'critical' | 'warning' | 'low'
export type TransferStatus = 'draft' | 'pending' | 'approved' | 'in_transit' | 'completed' | 'rejected'
export type TransferPriority = 'standard' | 'urgent' | 'emergency'

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

export interface TransferRequest {
  id: string
  requestNumber: string
  status: TransferStatus
  priority: TransferPriority
  // Requestor info
  requestorId: string
  requestorName: string
  departmentId: string
  departmentName: string
  requestDate: string
  requiredByDate?: string
  // Locations
  fromLocationId: string
  fromLocationName: string
  toLocationId: string
  toLocationName: string
  // Items
  items: TransferRequestItem[]
  // Totals
  totalItems: number
  totalQuantity: number
  estimatedValue: number
  // Notes
  notes?: string
  // Audit
  createdAt: string
  createdBy: string
  approvedAt?: string
  approvedBy?: string
}

export interface TransferRequestItem {
  id: string
  productId: string
  productCode: string
  productName: string
  categoryName: string
  unit: string
  currentStock: number
  parLevel: number
  recommendedQty: number
  requestedQty: number
  sourceAvailable: number
  unitCost: number
  totalCost: number
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

// ====== MOCK REPLENISHMENT REQUESTS ======
// Transaction codes use format: TRF-YYMM-NNNN (e.g., TRF-2410-001 = October 2024, Request #001)

export const mockTransferRequests: TransferRequest[] = [
  {
    id: 'rep-001',
    requestNumber: 'TRF-2410-001', // Transfer #001, October 2024
    status: 'completed',
    priority: 'standard',
    requestorId: 'user-chef-001',
    requestorName: 'Chef Maria Rodriguez',
    departmentId: 'dept-003',
    departmentName: 'Kitchen',
    requestDate: '2024-10-15',
    requiredByDate: '2024-10-17',
    fromLocationId: 'loc-004',
    fromLocationName: 'Main Warehouse',
    toLocationId: 'loc-003',
    toLocationName: 'Central Kitchen',
    items: [
      {
        id: 'rep-001-item-001',
        productId: 'prod-001',
        productCode: 'RICE-JAS-01',
        productName: 'Jasmine Rice Premium',
        categoryName: 'Rice & Grains',
        unit: 'kg',
        currentStock: 40,
        parLevel: 100,
        recommendedQty: 60,
        requestedQty: 50,
        sourceAvailable: 650,
        unitCost: 2.50,
        totalCost: 125.00
      }
    ],
    totalItems: 1,
    totalQuantity: 50,
    estimatedValue: 125.00,
    notes: 'Regular weekly replenishment',
    createdAt: '2024-10-15T09:30:00Z',
    createdBy: 'user-chef-001',
    approvedAt: '2024-10-15T10:00:00Z',
    approvedBy: 'user-warehouse-001'
  },
  {
    id: 'rep-002',
    requestNumber: 'TRF-2410-002',
    status: 'pending',
    priority: 'urgent',
    requestorId: 'user-chef-001',
    requestorName: 'Chef Maria Rodriguez',
    departmentId: 'dept-003',
    departmentName: 'Kitchen',
    requestDate: '2024-10-20',
    requiredByDate: '2024-10-21',
    fromLocationId: 'loc-004',
    fromLocationName: 'Main Warehouse',
    toLocationId: 'loc-003',
    toLocationName: 'Central Kitchen',
    items: [
      {
        id: 'rep-002-item-001',
        productId: 'prod-002',
        productCode: 'CHKN-BRST-01',
        productName: 'Chicken Breast Fresh',
        categoryName: 'Poultry',
        unit: 'kg',
        currentStock: 15,
        parLevel: 50,
        recommendedQty: 35,
        requestedQty: 35,
        sourceAvailable: 120,
        unitCost: 8.50,
        totalCost: 297.50
      },
      {
        id: 'rep-002-item-002',
        productId: 'prod-003',
        productCode: 'BEEF-TND-01',
        productName: 'Beef Tenderloin',
        categoryName: 'Beef',
        unit: 'kg',
        currentStock: 5,
        parLevel: 25,
        recommendedQty: 20,
        requestedQty: 20,
        sourceAvailable: 80,
        unitCost: 32.00,
        totalCost: 640.00
      }
    ],
    totalItems: 2,
    totalQuantity: 55,
    estimatedValue: 937.50,
    notes: 'Urgent - Low stock on proteins for weekend banquet',
    createdAt: '2024-10-20T14:00:00Z',
    createdBy: 'user-chef-001'
  },
  {
    id: 'rep-003',
    requestNumber: 'TRF-2410-003',
    status: 'draft',
    priority: 'standard',
    requestorId: 'user-bar-001',
    requestorName: 'James Wilson',
    departmentId: 'dept-fnb',
    departmentName: 'Food & Beverage',
    requestDate: '2024-10-21',
    fromLocationId: 'loc-004',
    fromLocationName: 'Main Warehouse',
    toLocationId: 'loc-003',
    toLocationName: 'Restaurant Bar Direct',
    items: [
      {
        id: 'rep-003-item-001',
        productId: 'prod-010',
        productCode: 'WINE-RED-01',
        productName: 'House Red Wine',
        categoryName: 'Beverages',
        unit: 'bottle',
        currentStock: 4,
        parLevel: 12,
        recommendedQty: 8,
        requestedQty: 8,
        sourceAvailable: 48,
        unitCost: 18.00,
        totalCost: 144.00
      }
    ],
    totalItems: 1,
    totalQuantity: 8,
    estimatedValue: 144.00,
    createdAt: '2024-10-21T08:00:00Z',
    createdBy: 'user-bar-001'
  }
]

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
 * Get transfer requests for a location
 */
export function getTransferRequestsByLocation(toLocationId: string): TransferRequest[] {
  return mockTransferRequests.filter(req => req.toLocationId === toLocationId)
}

/**
 * Get transfer requests by status
 */
export function getTransferRequestsByStatus(status: TransferStatus): TransferRequest[] {
  return mockTransferRequests.filter(req => req.status === status)
}

/**
 * Get all transfer requests
 */
export function getAllTransferRequests(): TransferRequest[] {
  return mockTransferRequests
}

/**
 * Get replenishment summary for a location
 */
export function getTransferSummary(locationId: string): {
  totalItemsBelowPar: number
  criticalCount: number
  warningCount: number
  lowCount: number
  pendingRequests: number
  lastTransferDate: string | null
} {
  const grouped = getItemsBelowParLevelGrouped(locationId)
  const requests = getTransferRequestsByLocation(locationId)
  const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'approved' || r.status === 'in_transit')
  const completedRequests = requests.filter(r => r.status === 'completed').sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return {
    totalItemsBelowPar: grouped.critical.length + grouped.warning.length + grouped.low.length,
    criticalCount: grouped.critical.length,
    warningCount: grouped.warning.length,
    lowCount: grouped.low.length,
    pendingRequests: pendingRequests.length,
    lastTransferDate: completedRequests[0]?.createdAt || null
  }
}
