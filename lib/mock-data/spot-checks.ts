/**
 * Spot Check Mock Data
 *
 * Comprehensive mock data for spot checks, including different statuses,
 * types, and item states to support the spot check UI prototype.
 *
 * Transaction Code Format: SC-YYMM-NNNN
 * - SC: Spot Check prefix
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number (e.g., 001, 002, etc.)
 * Example: SC-2410-001 = Spot Check #001 from October 2024
 */

import {
  SpotCheck,
  SpotCheckItem,
  SpotCheckType,
  SpotCheckStatus,
  ItemCheckStatus,
  ItemCondition,
  SpotCheckSummary
} from '@/app/(main)/inventory-management/spot-check/types'

// ====== SPOT CHECK ITEMS ======

const createSpotCheckItems = (
  count: number,
  options: {
    countedRatio?: number
    varianceRatio?: number
    prefix?: string
  } = {}
): SpotCheckItem[] => {
  const { countedRatio = 0, varianceRatio = 0.1, prefix = 'SC' } = options

  const categories = ['Grains & Cereals', 'Oils & Fats', 'Spices', 'Stocks & Sauces', 'Pasta & Noodles', 'Beverages', 'Dairy', 'Frozen Foods']
  const units = ['kg', 'L', 'pcs', 'bags', 'bottles', 'packs', 'boxes', 'tins']
  const locations = ['Main Store A1', 'Main Store A2', 'Cold Storage B1', 'Dry Storage C1', 'Kitchen Prep D1', 'Bar Storage E1']
  const conditions: ItemCondition[] = ['good', 'damaged', 'expired', 'missing']

  const items: SpotCheckItem[] = []

  for (let i = 0; i < count; i++) {
    const isCounted = Math.random() < countedRatio
    const hasVariance = isCounted && Math.random() < varianceRatio
    const systemQty = Math.floor(Math.random() * 100) + 10
    const countedQty = isCounted
      ? hasVariance
        ? systemQty + Math.floor((Math.random() - 0.5) * 20)
        : systemQty
      : null

    const variance = countedQty !== null ? countedQty - systemQty : 0
    const variancePercent = countedQty !== null && systemQty > 0
      ? Number(((variance / systemQty) * 100).toFixed(2))
      : 0

    const condition: ItemCondition = isCounted
      ? hasVariance && Math.random() > 0.7
        ? conditions[Math.floor(Math.random() * conditions.length)]
        : 'good'
      : 'good'

    let status: ItemCheckStatus = 'pending'
    if (isCounted) {
      status = hasVariance ? 'variance' : 'counted'
    }

    items.push({
      id: `${prefix}-item-${String(i + 1).padStart(3, '0')}`,
      itemId: `item-${String(i + 1).padStart(3, '0')}`,
      itemCode: `INV-${String(1000 + i).substring(1)}`,
      itemName: [
        'Basmati Rice Premium', 'Olive Oil Extra Virgin', 'Black Pepper Ground',
        'Chicken Stock Powder', 'Pasta Penne', 'Jasmine Rice', 'Vegetable Oil',
        'Paprika Sweet', 'Beef Stock Cubes', 'Spaghetti', 'Coconut Milk',
        'Garlic Powder', 'Fish Sauce', 'Soy Sauce Dark', 'Tomato Paste',
        'Flour All Purpose', 'Sugar White', 'Salt Sea', 'Cumin Ground',
        'Turmeric Powder', 'Coriander Seeds', 'Cardamom Pods', 'Bay Leaves',
        'Thyme Dried', 'Oregano Dried', 'Basil Dried', 'Rosemary Dried'
      ][i % 27],
      category: categories[i % categories.length],
      unit: units[i % units.length],
      location: locations[i % locations.length],
      systemQuantity: systemQty,
      countedQuantity: countedQty,
      variance,
      variancePercent,
      condition,
      status,
      countedBy: isCounted ? ['John Smith', 'Sarah Johnson', 'Mike Chen'][Math.floor(Math.random() * 3)] : null,
      countedAt: isCounted ? new Date(Date.now() - Math.random() * 86400000 * 3) : null,
      notes: hasVariance ? 'Variance noted during count' : '',
      value: Number((systemQty * (Math.random() * 50 + 10)).toFixed(2)),
      lastCountDate: new Date(Date.now() - Math.random() * 86400000 * 30)
    })
  }

  return items
}

// ====== SPOT CHECKS ======

export const mockSpotChecks: SpotCheck[] = [
  // Draft spot checks
  {
    id: 'sc-001',
    checkNumber: 'SC-2410-001',
    checkType: 'random' as SpotCheckType,
    status: 'draft' as SpotCheckStatus,
    priority: 'medium',
    locationId: 'loc-main-kitchen',
    locationName: 'Main Kitchen',
    departmentId: 'dept-kitchen',
    departmentName: 'Kitchen Operations',
    assignedTo: 'user-001',
    assignedToName: 'John Smith',
    scheduledDate: new Date(Date.now() + 86400000 * 2),
    startedAt: null,
    completedAt: null,
    dueDate: new Date(Date.now() + 86400000 * 5),
    items: createSpotCheckItems(15, { countedRatio: 0, prefix: 'SC001' }),
    totalItems: 15,
    countedItems: 0,
    matchedItems: 0,
    varianceItems: 0,
    accuracy: 0,
    totalValue: 2450.00,
    varianceValue: 0,
    reason: 'Regular monthly random check',
    notes: 'Focus on high-turnover items',
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'sc-002',
    checkNumber: 'SC-2410-002',
    checkType: 'targeted' as SpotCheckType,
    status: 'draft' as SpotCheckStatus,
    priority: 'high',
    locationId: 'loc-cold-storage',
    locationName: 'Cold Storage',
    departmentId: 'dept-storage',
    departmentName: 'Storage & Logistics',
    assignedTo: 'user-002',
    assignedToName: 'Sarah Johnson',
    scheduledDate: new Date(Date.now() + 86400000 * 1),
    startedAt: null,
    completedAt: null,
    dueDate: new Date(Date.now() + 86400000 * 3),
    items: createSpotCheckItems(8, { countedRatio: 0, prefix: 'SC002' }),
    totalItems: 8,
    countedItems: 0,
    matchedItems: 0,
    varianceItems: 0,
    accuracy: 0,
    totalValue: 4200.00,
    varianceValue: 0,
    reason: 'Reported variance investigation',
    notes: 'Check items flagged by variance report',
    createdBy: 'Inventory Manager',
    createdAt: new Date(Date.now() - 43200000),
    updatedAt: new Date(Date.now() - 43200000)
  },

  // Pending spot checks
  {
    id: 'sc-003',
    checkNumber: 'SC-2410-003',
    checkType: 'high-value' as SpotCheckType,
    status: 'pending' as SpotCheckStatus,
    priority: 'critical',
    locationId: 'loc-wine-cellar',
    locationName: 'Wine Cellar',
    departmentId: 'dept-beverage',
    departmentName: 'Beverage & Bar',
    assignedTo: 'user-003',
    assignedToName: 'Mike Chen',
    scheduledDate: new Date(Date.now()),
    startedAt: null,
    completedAt: null,
    dueDate: new Date(Date.now() + 86400000 * 2),
    items: createSpotCheckItems(12, { countedRatio: 0, prefix: 'SC003' }),
    totalItems: 12,
    countedItems: 0,
    matchedItems: 0,
    varianceItems: 0,
    accuracy: 0,
    totalValue: 15800.00,
    varianceValue: 0,
    reason: 'High-value item verification',
    notes: 'Premium wines and spirits - handle with care',
    createdBy: 'Finance Controller',
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'sc-004',
    checkNumber: 'SC-2410-004',
    checkType: 'variance-based' as SpotCheckType,
    status: 'pending' as SpotCheckStatus,
    priority: 'high',
    locationId: 'loc-dry-storage',
    locationName: 'Dry Storage',
    departmentId: 'dept-storage',
    departmentName: 'Storage & Logistics',
    assignedTo: 'user-001',
    assignedToName: 'John Smith',
    scheduledDate: new Date(Date.now() + 86400000),
    startedAt: null,
    completedAt: null,
    dueDate: new Date(Date.now() + 86400000 * 4),
    items: createSpotCheckItems(20, { countedRatio: 0, prefix: 'SC004' }),
    totalItems: 20,
    countedItems: 0,
    matchedItems: 0,
    varianceItems: 0,
    accuracy: 0,
    totalValue: 3800.00,
    varianceValue: 0,
    reason: 'Items with historical variance > 5%',
    notes: 'Auto-generated from variance analysis',
    createdBy: 'System',
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 172800000)
  },

  // In-progress spot checks
  {
    id: 'sc-005',
    checkNumber: 'SC-2410-005',
    checkType: 'cycle-count' as SpotCheckType,
    status: 'in-progress' as SpotCheckStatus,
    priority: 'medium',
    locationId: 'loc-main-kitchen',
    locationName: 'Main Kitchen',
    departmentId: 'dept-kitchen',
    departmentName: 'Kitchen Operations',
    assignedTo: 'user-002',
    assignedToName: 'Sarah Johnson',
    scheduledDate: new Date(Date.now() - 86400000),
    startedAt: new Date(Date.now() - 43200000),
    completedAt: null,
    dueDate: new Date(Date.now() + 86400000),
    items: createSpotCheckItems(25, { countedRatio: 0.6, varianceRatio: 0.15, prefix: 'SC005' }),
    totalItems: 25,
    countedItems: 15,
    matchedItems: 13,
    varianceItems: 2,
    accuracy: 86.67,
    totalValue: 5600.00,
    varianceValue: 245.00,
    reason: 'Weekly cycle count - Zone A',
    notes: 'In progress - 60% complete',
    createdBy: 'Inventory Manager',
    createdAt: new Date(Date.now() - 345600000),
    updatedAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'sc-006',
    checkNumber: 'SC-2410-006',
    checkType: 'random' as SpotCheckType,
    status: 'in-progress' as SpotCheckStatus,
    priority: 'low',
    locationId: 'loc-pastry',
    locationName: 'Pastry Kitchen',
    departmentId: 'dept-pastry',
    departmentName: 'Pastry & Bakery',
    assignedTo: 'user-004',
    assignedToName: 'Emily Davis',
    scheduledDate: new Date(Date.now() - 172800000),
    startedAt: new Date(Date.now() - 86400000),
    completedAt: null,
    dueDate: new Date(Date.now() + 172800000),
    items: createSpotCheckItems(18, { countedRatio: 0.33, varianceRatio: 0.1, prefix: 'SC006' }),
    totalItems: 18,
    countedItems: 6,
    matchedItems: 5,
    varianceItems: 1,
    accuracy: 83.33,
    totalValue: 2100.00,
    varianceValue: 85.00,
    reason: 'Random spot check - bakery supplies',
    notes: 'Counter paused - will resume tomorrow',
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 432000000),
    updatedAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'sc-007',
    checkNumber: 'SC-2410-007',
    checkType: 'targeted' as SpotCheckType,
    status: 'in-progress' as SpotCheckStatus,
    priority: 'critical',
    locationId: 'loc-bar',
    locationName: 'Main Bar',
    departmentId: 'dept-beverage',
    departmentName: 'Beverage & Bar',
    assignedTo: 'user-003',
    assignedToName: 'Mike Chen',
    scheduledDate: new Date(Date.now() - 43200000),
    startedAt: new Date(Date.now() - 21600000),
    completedAt: null,
    dueDate: new Date(Date.now() + 43200000),
    items: createSpotCheckItems(10, { countedRatio: 0.8, varianceRatio: 0.25, prefix: 'SC007' }),
    totalItems: 10,
    countedItems: 8,
    matchedItems: 6,
    varianceItems: 2,
    accuracy: 75.00,
    totalValue: 8500.00,
    varianceValue: 620.00,
    reason: 'Discrepancy investigation - spirits',
    notes: 'Critical - possible shrinkage detected',
    createdBy: 'Loss Prevention',
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 7200000)
  },

  // Completed spot checks
  {
    id: 'sc-008',
    checkNumber: 'SC-2410-008',
    checkType: 'cycle-count' as SpotCheckType,
    status: 'completed' as SpotCheckStatus,
    priority: 'medium',
    locationId: 'loc-main-kitchen',
    locationName: 'Main Kitchen',
    departmentId: 'dept-kitchen',
    departmentName: 'Kitchen Operations',
    assignedTo: 'user-001',
    assignedToName: 'John Smith',
    scheduledDate: new Date(Date.now() - 604800000),
    startedAt: new Date(Date.now() - 518400000),
    completedAt: new Date(Date.now() - 432000000),
    dueDate: new Date(Date.now() - 432000000),
    items: createSpotCheckItems(30, { countedRatio: 1, varianceRatio: 0.1, prefix: 'SC008' }),
    totalItems: 30,
    countedItems: 30,
    matchedItems: 27,
    varianceItems: 3,
    accuracy: 90.00,
    totalValue: 7200.00,
    varianceValue: 180.00,
    reason: 'Weekly cycle count - Zone B',
    notes: 'Completed on schedule. Minor variances documented.',
    createdBy: 'Inventory Manager',
    createdAt: new Date(Date.now() - 691200000),
    updatedAt: new Date(Date.now() - 432000000)
  },
  {
    id: 'sc-009',
    checkNumber: 'SC-2410-009',
    checkType: 'high-value' as SpotCheckType,
    status: 'completed' as SpotCheckStatus,
    priority: 'critical',
    locationId: 'loc-wine-cellar',
    locationName: 'Wine Cellar',
    departmentId: 'dept-beverage',
    departmentName: 'Beverage & Bar',
    assignedTo: 'user-003',
    assignedToName: 'Mike Chen',
    scheduledDate: new Date(Date.now() - 1209600000),
    startedAt: new Date(Date.now() - 1123200000),
    completedAt: new Date(Date.now() - 1036800000),
    dueDate: new Date(Date.now() - 1036800000),
    items: createSpotCheckItems(15, { countedRatio: 1, varianceRatio: 0.05, prefix: 'SC009' }),
    totalItems: 15,
    countedItems: 15,
    matchedItems: 14,
    varianceItems: 1,
    accuracy: 93.33,
    totalValue: 28500.00,
    varianceValue: 350.00,
    reason: 'Monthly high-value verification',
    notes: 'One bottle missing - investigation complete.',
    createdBy: 'Finance Controller',
    createdAt: new Date(Date.now() - 1296000000),
    updatedAt: new Date(Date.now() - 1036800000)
  },
  {
    id: 'sc-010',
    checkNumber: 'SC-2410-010',
    checkType: 'random' as SpotCheckType,
    status: 'completed' as SpotCheckStatus,
    priority: 'low',
    locationId: 'loc-dry-storage',
    locationName: 'Dry Storage',
    departmentId: 'dept-storage',
    departmentName: 'Storage & Logistics',
    assignedTo: 'user-002',
    assignedToName: 'Sarah Johnson',
    scheduledDate: new Date(Date.now() - 1814400000),
    startedAt: new Date(Date.now() - 1728000000),
    completedAt: new Date(Date.now() - 1641600000),
    dueDate: new Date(Date.now() - 1555200000),
    items: createSpotCheckItems(22, { countedRatio: 1, varianceRatio: 0.08, prefix: 'SC010' }),
    totalItems: 22,
    countedItems: 22,
    matchedItems: 20,
    varianceItems: 2,
    accuracy: 90.91,
    totalValue: 4100.00,
    varianceValue: 125.00,
    reason: 'Quarterly random audit',
    notes: 'All variances within acceptable range.',
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 1900800000),
    updatedAt: new Date(Date.now() - 1641600000)
  },

  // On-hold spot check
  {
    id: 'sc-011',
    checkNumber: 'SC-2410-011',
    checkType: 'targeted' as SpotCheckType,
    status: 'on-hold' as SpotCheckStatus,
    priority: 'high',
    locationId: 'loc-receiving',
    locationName: 'Receiving Dock',
    departmentId: 'dept-storage',
    departmentName: 'Storage & Logistics',
    assignedTo: 'user-001',
    assignedToName: 'John Smith',
    scheduledDate: new Date(Date.now() - 259200000),
    startedAt: new Date(Date.now() - 172800000),
    completedAt: null,
    dueDate: new Date(Date.now() + 432000000),
    items: createSpotCheckItems(14, { countedRatio: 0.35, varianceRatio: 0.2, prefix: 'SC011' }),
    totalItems: 14,
    countedItems: 5,
    matchedItems: 4,
    varianceItems: 1,
    accuracy: 80.00,
    totalValue: 3200.00,
    varianceValue: 150.00,
    reason: 'Receiving area verification',
    notes: 'On hold - awaiting delivery completion',
    createdBy: 'Receiving Supervisor',
    createdAt: new Date(Date.now() - 345600000),
    updatedAt: new Date(Date.now() - 86400000)
  },

  // Cancelled spot check
  {
    id: 'sc-012',
    checkNumber: 'SC-2410-012',
    checkType: 'variance-based' as SpotCheckType,
    status: 'cancelled' as SpotCheckStatus,
    priority: 'medium',
    locationId: 'loc-banquet',
    locationName: 'Banquet Kitchen',
    departmentId: 'dept-banquet',
    departmentName: 'Banquet Operations',
    assignedTo: 'user-004',
    assignedToName: 'Emily Davis',
    scheduledDate: new Date(Date.now() - 432000000),
    startedAt: null,
    completedAt: null,
    dueDate: new Date(Date.now() - 259200000),
    items: createSpotCheckItems(16, { countedRatio: 0, prefix: 'SC012' }),
    totalItems: 16,
    countedItems: 0,
    matchedItems: 0,
    varianceItems: 0,
    accuracy: 0,
    totalValue: 2800.00,
    varianceValue: 0,
    reason: 'Variance follow-up cancelled',
    notes: 'Cancelled - variance resolved via GRN correction',
    createdBy: 'Inventory Manager',
    createdAt: new Date(Date.now() - 518400000),
    updatedAt: new Date(Date.now() - 432000000)
  }
]

// ====== SUMMARY HELPERS ======

export const getSpotCheckSummary = (checks: SpotCheck[] = mockSpotChecks): SpotCheckSummary => {
  return {
    total: checks.length,
    draft: checks.filter(c => c.status === 'draft').length,
    pending: checks.filter(c => c.status === 'pending').length,
    inProgress: checks.filter(c => c.status === 'in-progress').length,
    completed: checks.filter(c => c.status === 'completed').length,
    cancelled: checks.filter(c => c.status === 'cancelled').length,
    onHold: checks.filter(c => c.status === 'on-hold').length
  }
}

export const getSpotCheckById = (id: string): SpotCheck | undefined => {
  return mockSpotChecks.find(check => check.id === id)
}

export const getSpotChecksByStatus = (status: SpotCheckStatus): SpotCheck[] => {
  return mockSpotChecks.filter(check => check.status === status)
}

export const getSpotChecksByType = (type: SpotCheckType): SpotCheck[] => {
  return mockSpotChecks.filter(check => check.checkType === type)
}

export const getSpotChecksByAssignee = (assigneeId: string): SpotCheck[] => {
  return mockSpotChecks.filter(check => check.assignedTo === assigneeId)
}

export const getActiveSpotChecks = (): SpotCheck[] => {
  return mockSpotChecks.filter(check =>
    check.status === 'pending' || check.status === 'in-progress'
  )
}

export const getOverdueSpotChecks = (): SpotCheck[] => {
  const now = new Date()
  return mockSpotChecks.filter(check =>
    check.dueDate &&
    check.dueDate < now &&
    check.status !== 'completed' &&
    check.status !== 'cancelled'
  )
}

// ====== DASHBOARD STATS ======

export interface SpotCheckDashboardStats {
  totalChecks: number
  activeChecks: number
  completedToday: number
  overdueChecks: number
  totalVarianceValue: number
  averageAccuracy: number
  itemsCounted: number
  varianceItemsCount: number
}

export const getSpotCheckDashboardStats = (): SpotCheckDashboardStats => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const completedChecks = mockSpotChecks.filter(c => c.status === 'completed')
  const activeChecks = mockSpotChecks.filter(c =>
    c.status === 'pending' || c.status === 'in-progress'
  )

  const completedToday = completedChecks.filter(c =>
    c.completedAt && c.completedAt >= today
  ).length

  const overdue = mockSpotChecks.filter(c =>
    c.dueDate &&
    c.dueDate < new Date() &&
    c.status !== 'completed' &&
    c.status !== 'cancelled'
  )

  const totalVariance = mockSpotChecks.reduce((sum, c) => sum + c.varianceValue, 0)
  const avgAccuracy = completedChecks.length > 0
    ? completedChecks.reduce((sum, c) => sum + c.accuracy, 0) / completedChecks.length
    : 0

  const itemsCounted = mockSpotChecks.reduce((sum, c) => sum + c.countedItems, 0)
  const varianceItems = mockSpotChecks.reduce((sum, c) => sum + c.varianceItems, 0)

  return {
    totalChecks: mockSpotChecks.length,
    activeChecks: activeChecks.length,
    completedToday,
    overdueChecks: overdue.length,
    totalVarianceValue: totalVariance,
    averageAccuracy: Number(avgAccuracy.toFixed(2)),
    itemsCounted,
    varianceItemsCount: varianceItems
  }
}
