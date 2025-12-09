/**
 * Physical Count Mock Data
 *
 * Comprehensive mock data for physical counts, including different statuses,
 * types, and item states to support the physical count UI prototype.
 */

import {
  PhysicalCount,
  PhysicalCountItem,
  PhysicalCountType,
  PhysicalCountStatus,
  ItemCountStatus,
  VarianceReason,
  PhysicalCountSummary,
  PhysicalCountDashboardStats,
  CountTeamMember,
  CountZone
} from '@/app/(main)/inventory-management/physical-count-management/types'

// ====== PHYSICAL COUNT ITEMS ======

const createPhysicalCountItems = (
  countId: string,
  count: number,
  options: {
    countedRatio?: number
    varianceRatio?: number
    prefix?: string
  } = {}
): PhysicalCountItem[] => {
  const { countedRatio = 0, varianceRatio = 0.1, prefix = 'PC' } = options

  const categories = ['Grains & Cereals', 'Oils & Fats', 'Spices', 'Stocks & Sauces', 'Pasta & Noodles', 'Beverages', 'Dairy', 'Frozen Foods', 'Dry Goods', 'Canned Goods']
  const units = ['kg', 'L', 'pcs', 'bags', 'bottles', 'packs', 'boxes', 'tins', 'cases', 'cartons']
  const locations = ['Main Store A1', 'Main Store A2', 'Main Store B1', 'Cold Storage B1', 'Cold Storage B2', 'Dry Storage C1', 'Dry Storage C2', 'Kitchen Prep D1', 'Bar Storage E1', 'Receiving Area F1']
  const binLocations = ['A-01-01', 'A-01-02', 'A-02-01', 'B-01-01', 'B-01-02', 'B-02-01', 'C-01-01', 'C-01-02', 'D-01-01', 'E-01-01']
  const varianceReasons: VarianceReason[] = ['damage', 'theft', 'spoilage', 'measurement-error', 'system-error', 'receiving-error', 'issue-error', 'unknown']

  const itemNames = [
    'Basmati Rice Premium', 'Olive Oil Extra Virgin', 'Black Pepper Ground',
    'Chicken Stock Powder', 'Pasta Penne', 'Jasmine Rice', 'Vegetable Oil',
    'Paprika Sweet', 'Beef Stock Cubes', 'Spaghetti', 'Coconut Milk',
    'Garlic Powder', 'Fish Sauce', 'Soy Sauce Dark', 'Tomato Paste',
    'Flour All Purpose', 'Sugar White', 'Salt Sea', 'Cumin Ground',
    'Turmeric Powder', 'Coriander Seeds', 'Cardamom Pods', 'Bay Leaves',
    'Thyme Dried', 'Oregano Dried', 'Basil Dried', 'Rosemary Dried',
    'Sesame Oil', 'Rice Vinegar', 'Worcestershire Sauce', 'Honey Pure',
    'Maple Syrup', 'Vanilla Extract', 'Cocoa Powder', 'Baking Powder',
    'Yeast Active Dry', 'Cornstarch', 'Breadcrumbs', 'Panko', 'Quinoa'
  ]

  const items: PhysicalCountItem[] = []

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

    const unitCost = Number((Math.random() * 50 + 5).toFixed(2))
    const varianceValue = Number((variance * unitCost).toFixed(2))

    let status: ItemCountStatus = 'pending'
    if (isCounted) {
      if (hasVariance) {
        status = Math.random() > 0.5 ? 'variance' : 'approved'
      } else {
        status = 'counted'
      }
    }

    items.push({
      id: `${prefix}-item-${String(i + 1).padStart(3, '0')}`,
      countId,
      itemId: `item-${String(i + 1).padStart(3, '0')}`,
      itemCode: `INV-${String(1000 + i)}`,
      itemName: itemNames[i % itemNames.length],
      category: categories[i % categories.length],
      unit: units[i % units.length],
      location: locations[i % locations.length],
      binLocation: binLocations[i % binLocations.length],
      systemQuantity: systemQty,
      countedQuantity: countedQty,
      recountQuantity: null,
      finalQuantity: countedQty,
      variance,
      variancePercent,
      varianceValue,
      status,
      varianceReason: hasVariance ? varianceReasons[Math.floor(Math.random() * varianceReasons.length)] : null,
      countedBy: isCounted ? ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'James Wilson'][Math.floor(Math.random() * 5)] : null,
      countedAt: isCounted ? new Date(Date.now() - Math.random() * 86400000 * 3) : null,
      recountedBy: null,
      recountedAt: null,
      approvedBy: status === 'approved' ? 'Supervisor Admin' : null,
      approvedAt: status === 'approved' ? new Date(Date.now() - Math.random() * 86400000) : null,
      unitCost,
      notes: hasVariance ? 'Variance noted during count - requires review' : '',
      batchNumber: Math.random() > 0.5 ? `BTH-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}` : null,
      expiryDate: Math.random() > 0.3 ? new Date(Date.now() + Math.random() * 86400000 * 365) : null,
      lastCountDate: new Date(Date.now() - Math.random() * 86400000 * 90)
    })
  }

  return items
}

// ====== TEAM MEMBERS ======

export const mockCountTeamMembers: CountTeamMember[] = [
  { id: 'user-001', name: 'John Smith', email: 'john.smith@hotel.com', role: 'supervisor', department: 'Inventory', assignedZone: null, itemsCounted: 450, isActive: true },
  { id: 'user-002', name: 'Sarah Johnson', email: 'sarah.johnson@hotel.com', role: 'counter', department: 'Kitchen', assignedZone: 'Zone A', itemsCounted: 320, isActive: true },
  { id: 'user-003', name: 'Mike Chen', email: 'mike.chen@hotel.com', role: 'counter', department: 'Bar', assignedZone: 'Zone B', itemsCounted: 280, isActive: true },
  { id: 'user-004', name: 'Emily Davis', email: 'emily.davis@hotel.com', role: 'counter', department: 'Pastry', assignedZone: 'Zone C', itemsCounted: 195, isActive: true },
  { id: 'user-005', name: 'James Wilson', email: 'james.wilson@hotel.com', role: 'verifier', department: 'Finance', assignedZone: null, itemsCounted: 150, isActive: true },
  { id: 'user-006', name: 'Lisa Brown', email: 'lisa.brown@hotel.com', role: 'supervisor', department: 'Operations', assignedZone: null, itemsCounted: 380, isActive: true }
]

// ====== COUNT ZONES ======

export const mockCountZones: CountZone[] = [
  { id: 'zone-a', name: 'Zone A - Main Kitchen', locationId: 'loc-main-kitchen', description: 'Main kitchen storage and prep areas', itemCount: 150, assignedCounters: ['user-002'], status: 'not-started' },
  { id: 'zone-b', name: 'Zone B - Cold Storage', locationId: 'loc-cold-storage', description: 'Refrigerated and frozen storage', itemCount: 80, assignedCounters: ['user-003'], status: 'not-started' },
  { id: 'zone-c', name: 'Zone C - Dry Storage', locationId: 'loc-dry-storage', description: 'Dry goods and non-perishables', itemCount: 200, assignedCounters: ['user-004'], status: 'not-started' },
  { id: 'zone-d', name: 'Zone D - Bar & Beverage', locationId: 'loc-bar', description: 'Bar supplies and beverages', itemCount: 120, assignedCounters: ['user-003'], status: 'not-started' },
  { id: 'zone-e', name: 'Zone E - Receiving', locationId: 'loc-receiving', description: 'Receiving dock and staging area', itemCount: 50, assignedCounters: ['user-002'], status: 'not-started' }
]

// ====== PHYSICAL COUNTS ======

export const mockPhysicalCounts: PhysicalCount[] = [
  // Draft counts
  {
    id: 'pc-001',
    countNumber: 'PC-241201-0001',
    countType: 'full' as PhysicalCountType,
    status: 'draft' as PhysicalCountStatus,
    priority: 'high',
    locationId: 'loc-main-kitchen',
    locationName: 'Main Kitchen',
    departmentId: 'dept-kitchen',
    departmentName: 'Kitchen Operations',
    zone: 'All Zones',
    supervisorId: 'user-001',
    supervisorName: 'John Smith',
    counters: [
      { id: 'user-002', name: 'Sarah Johnson', role: 'primary' },
      { id: 'user-003', name: 'Mike Chen', role: 'secondary' },
      { id: 'user-005', name: 'James Wilson', role: 'verifier' }
    ],
    scheduledDate: new Date(Date.now() + 86400000 * 7),
    startedAt: null,
    completedAt: null,
    finalizedAt: null,
    dueDate: new Date(Date.now() + 86400000 * 10),
    items: createPhysicalCountItems('pc-001', 150, { countedRatio: 0, prefix: 'PC001' }),
    totalItems: 150,
    countedItems: 0,
    pendingItems: 150,
    varianceItems: 0,
    approvedItems: 0,
    recountItems: 0,
    accuracy: 0,
    totalSystemValue: 45000.00,
    totalCountedValue: 0,
    varianceValue: 0,
    variancePercent: 0,
    requiresApproval: true,
    approvalThreshold: 5,
    isFinalized: false,
    adjustmentPosted: false,
    adjustmentId: null,
    description: 'End of Month Full Physical Count',
    instructions: 'Complete count of all items in Main Kitchen storage areas. Ensure all items are counted by EOD.',
    notes: 'Scheduled for month-end inventory',
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000),
    finalizedBy: null
  },

  // Planning status
  {
    id: 'pc-002',
    countNumber: 'PC-241201-0002',
    countType: 'cycle' as PhysicalCountType,
    status: 'planning' as PhysicalCountStatus,
    priority: 'medium',
    locationId: 'loc-dry-storage',
    locationName: 'Dry Storage',
    departmentId: 'dept-storage',
    departmentName: 'Storage & Logistics',
    zone: 'Zone C',
    supervisorId: 'user-006',
    supervisorName: 'Lisa Brown',
    counters: [
      { id: 'user-004', name: 'Emily Davis', role: 'primary' }
    ],
    scheduledDate: new Date(Date.now() + 86400000 * 3),
    startedAt: null,
    completedAt: null,
    finalizedAt: null,
    dueDate: new Date(Date.now() + 86400000 * 5),
    items: createPhysicalCountItems('pc-002', 50, { countedRatio: 0, prefix: 'PC002' }),
    totalItems: 50,
    countedItems: 0,
    pendingItems: 50,
    varianceItems: 0,
    approvedItems: 0,
    recountItems: 0,
    accuracy: 0,
    totalSystemValue: 12500.00,
    totalCountedValue: 0,
    varianceValue: 0,
    variancePercent: 0,
    requiresApproval: true,
    approvalThreshold: 3,
    isFinalized: false,
    adjustmentPosted: false,
    adjustmentId: null,
    description: 'Weekly Cycle Count - Dry Goods',
    instructions: 'Count all items in Dry Storage Zone C. Focus on high-turnover items.',
    notes: 'Part of weekly cycle count rotation',
    createdBy: 'Inventory Manager',
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 43200000),
    finalizedBy: null
  },

  // Pending counts
  {
    id: 'pc-003',
    countNumber: 'PC-241201-0003',
    countType: 'partial' as PhysicalCountType,
    status: 'pending' as PhysicalCountStatus,
    priority: 'critical',
    locationId: 'loc-wine-cellar',
    locationName: 'Wine Cellar',
    departmentId: 'dept-beverage',
    departmentName: 'Beverage & Bar',
    zone: 'Wine Storage',
    supervisorId: 'user-001',
    supervisorName: 'John Smith',
    counters: [
      { id: 'user-003', name: 'Mike Chen', role: 'primary' },
      { id: 'user-005', name: 'James Wilson', role: 'verifier' }
    ],
    scheduledDate: new Date(Date.now()),
    startedAt: null,
    completedAt: null,
    finalizedAt: null,
    dueDate: new Date(Date.now() + 86400000 * 2),
    items: createPhysicalCountItems('pc-003', 80, { countedRatio: 0, prefix: 'PC003' }),
    totalItems: 80,
    countedItems: 0,
    pendingItems: 80,
    varianceItems: 0,
    approvedItems: 0,
    recountItems: 0,
    accuracy: 0,
    totalSystemValue: 85000.00,
    totalCountedValue: 0,
    varianceValue: 0,
    variancePercent: 0,
    requiresApproval: true,
    approvalThreshold: 2,
    isFinalized: false,
    adjustmentPosted: false,
    adjustmentId: null,
    description: 'High-Value Wine Inventory Count',
    instructions: 'Verify all wine inventory. Check vintage labels and condition. Report any damage immediately.',
    notes: 'Critical - high-value items require careful verification',
    createdBy: 'Finance Controller',
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000),
    finalizedBy: null
  },
  {
    id: 'pc-004',
    countNumber: 'PC-241201-0004',
    countType: 'cycle' as PhysicalCountType,
    status: 'pending' as PhysicalCountStatus,
    priority: 'high',
    locationId: 'loc-cold-storage',
    locationName: 'Cold Storage',
    departmentId: 'dept-storage',
    departmentName: 'Storage & Logistics',
    zone: 'Zone B',
    supervisorId: 'user-006',
    supervisorName: 'Lisa Brown',
    counters: [
      { id: 'user-002', name: 'Sarah Johnson', role: 'primary' },
      { id: 'user-004', name: 'Emily Davis', role: 'secondary' }
    ],
    scheduledDate: new Date(Date.now() + 86400000),
    startedAt: null,
    completedAt: null,
    finalizedAt: null,
    dueDate: new Date(Date.now() + 86400000 * 3),
    items: createPhysicalCountItems('pc-004', 65, { countedRatio: 0, prefix: 'PC004' }),
    totalItems: 65,
    countedItems: 0,
    pendingItems: 65,
    varianceItems: 0,
    approvedItems: 0,
    recountItems: 0,
    accuracy: 0,
    totalSystemValue: 28000.00,
    totalCountedValue: 0,
    varianceValue: 0,
    variancePercent: 0,
    requiresApproval: true,
    approvalThreshold: 3,
    isFinalized: false,
    adjustmentPosted: false,
    adjustmentId: null,
    description: 'Cold Storage Weekly Count',
    instructions: 'Count all refrigerated and frozen items. Check expiry dates and condition.',
    notes: 'Perishable items - check temperature compliance',
    createdBy: 'Inventory Manager',
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000),
    finalizedBy: null
  },

  // In-progress counts
  {
    id: 'pc-005',
    countNumber: 'PC-241130-0001',
    countType: 'full' as PhysicalCountType,
    status: 'in-progress' as PhysicalCountStatus,
    priority: 'high',
    locationId: 'loc-main-kitchen',
    locationName: 'Main Kitchen',
    departmentId: 'dept-kitchen',
    departmentName: 'Kitchen Operations',
    zone: 'Zone A',
    supervisorId: 'user-001',
    supervisorName: 'John Smith',
    counters: [
      { id: 'user-002', name: 'Sarah Johnson', role: 'primary' },
      { id: 'user-003', name: 'Mike Chen', role: 'secondary' }
    ],
    scheduledDate: new Date(Date.now() - 86400000),
    startedAt: new Date(Date.now() - 43200000),
    completedAt: null,
    finalizedAt: null,
    dueDate: new Date(Date.now() + 86400000),
    items: createPhysicalCountItems('pc-005', 120, { countedRatio: 0.65, varianceRatio: 0.12, prefix: 'PC005' }),
    totalItems: 120,
    countedItems: 78,
    pendingItems: 42,
    varianceItems: 9,
    approvedItems: 5,
    recountItems: 2,
    accuracy: 88.46,
    totalSystemValue: 35000.00,
    totalCountedValue: 22750.00,
    varianceValue: 850.00,
    variancePercent: 2.43,
    requiresApproval: true,
    approvalThreshold: 5,
    isFinalized: false,
    adjustmentPosted: false,
    adjustmentId: null,
    description: 'Kitchen Inventory Count - In Progress',
    instructions: 'Complete count of all kitchen inventory. Verify quantities and condition.',
    notes: '65% complete - continuing tomorrow',
    createdBy: 'Inventory Manager',
    createdAt: new Date(Date.now() - 86400000 * 4),
    updatedAt: new Date(Date.now() - 3600000),
    finalizedBy: null
  },
  {
    id: 'pc-006',
    countNumber: 'PC-241130-0002',
    countType: 'cycle' as PhysicalCountType,
    status: 'in-progress' as PhysicalCountStatus,
    priority: 'medium',
    locationId: 'loc-bar',
    locationName: 'Main Bar',
    departmentId: 'dept-beverage',
    departmentName: 'Beverage & Bar',
    zone: 'Zone D',
    supervisorId: 'user-006',
    supervisorName: 'Lisa Brown',
    counters: [
      { id: 'user-003', name: 'Mike Chen', role: 'primary' }
    ],
    scheduledDate: new Date(Date.now() - 172800000),
    startedAt: new Date(Date.now() - 86400000),
    completedAt: null,
    finalizedAt: null,
    dueDate: new Date(Date.now() + 86400000 * 2),
    items: createPhysicalCountItems('pc-006', 45, { countedRatio: 0.4, varianceRatio: 0.15, prefix: 'PC006' }),
    totalItems: 45,
    countedItems: 18,
    pendingItems: 27,
    varianceItems: 3,
    approvedItems: 1,
    recountItems: 1,
    accuracy: 83.33,
    totalSystemValue: 22000.00,
    totalCountedValue: 8800.00,
    varianceValue: 420.00,
    variancePercent: 1.91,
    requiresApproval: true,
    approvalThreshold: 3,
    isFinalized: false,
    adjustmentPosted: false,
    adjustmentId: null,
    description: 'Bar Spirits Cycle Count',
    instructions: 'Count all spirits, mixers, and bar supplies.',
    notes: '40% complete - paused for service',
    createdBy: 'Bar Manager',
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 7200000),
    finalizedBy: null
  },
  {
    id: 'pc-007',
    countNumber: 'PC-241129-0001',
    countType: 'partial' as PhysicalCountType,
    status: 'in-progress' as PhysicalCountStatus,
    priority: 'critical',
    locationId: 'loc-receiving',
    locationName: 'Receiving Dock',
    departmentId: 'dept-storage',
    departmentName: 'Storage & Logistics',
    zone: 'Zone E',
    supervisorId: 'user-001',
    supervisorName: 'John Smith',
    counters: [
      { id: 'user-002', name: 'Sarah Johnson', role: 'primary' },
      { id: 'user-005', name: 'James Wilson', role: 'verifier' }
    ],
    scheduledDate: new Date(Date.now() - 259200000),
    startedAt: new Date(Date.now() - 172800000),
    completedAt: null,
    finalizedAt: null,
    dueDate: new Date(Date.now()),
    items: createPhysicalCountItems('pc-007', 35, { countedRatio: 0.85, varianceRatio: 0.2, prefix: 'PC007' }),
    totalItems: 35,
    countedItems: 30,
    pendingItems: 5,
    varianceItems: 6,
    approvedItems: 4,
    recountItems: 2,
    accuracy: 80.00,
    totalSystemValue: 15000.00,
    totalCountedValue: 12750.00,
    varianceValue: 680.00,
    variancePercent: 4.53,
    requiresApproval: true,
    approvalThreshold: 3,
    isFinalized: false,
    adjustmentPosted: false,
    adjustmentId: null,
    description: 'Receiving Area Variance Investigation',
    instructions: 'Verify items in receiving area. Focus on recent deliveries.',
    notes: 'Critical - investigating receiving discrepancies',
    createdBy: 'Loss Prevention',
    createdAt: new Date(Date.now() - 86400000 * 6),
    updatedAt: new Date(Date.now() - 21600000),
    finalizedBy: null
  },

  // Completed counts
  {
    id: 'pc-008',
    countNumber: 'PC-241125-0001',
    countType: 'full' as PhysicalCountType,
    status: 'completed' as PhysicalCountStatus,
    priority: 'high',
    locationId: 'loc-dry-storage',
    locationName: 'Dry Storage',
    departmentId: 'dept-storage',
    departmentName: 'Storage & Logistics',
    zone: 'All Zones',
    supervisorId: 'user-006',
    supervisorName: 'Lisa Brown',
    counters: [
      { id: 'user-004', name: 'Emily Davis', role: 'primary' },
      { id: 'user-002', name: 'Sarah Johnson', role: 'secondary' }
    ],
    scheduledDate: new Date(Date.now() - 86400000 * 10),
    startedAt: new Date(Date.now() - 86400000 * 9),
    completedAt: new Date(Date.now() - 86400000 * 7),
    finalizedAt: null,
    dueDate: new Date(Date.now() - 86400000 * 7),
    items: createPhysicalCountItems('pc-008', 180, { countedRatio: 1, varianceRatio: 0.08, prefix: 'PC008' }),
    totalItems: 180,
    countedItems: 180,
    pendingItems: 0,
    varianceItems: 14,
    approvedItems: 180,
    recountItems: 0,
    accuracy: 92.22,
    totalSystemValue: 52000.00,
    totalCountedValue: 51200.00,
    varianceValue: 800.00,
    variancePercent: 1.54,
    requiresApproval: true,
    approvalThreshold: 5,
    isFinalized: false,
    adjustmentPosted: false,
    adjustmentId: null,
    description: 'Dry Storage Full Count - November',
    instructions: 'Complete inventory count of all dry storage items.',
    notes: 'Completed on schedule. Minor variances approved.',
    createdBy: 'Inventory Manager',
    createdAt: new Date(Date.now() - 86400000 * 14),
    updatedAt: new Date(Date.now() - 86400000 * 7),
    finalizedBy: null
  },
  {
    id: 'pc-009',
    countNumber: 'PC-241120-0001',
    countType: 'cycle' as PhysicalCountType,
    status: 'completed' as PhysicalCountStatus,
    priority: 'medium',
    locationId: 'loc-pastry',
    locationName: 'Pastry Kitchen',
    departmentId: 'dept-pastry',
    departmentName: 'Pastry & Bakery',
    zone: 'Pastry Storage',
    supervisorId: 'user-001',
    supervisorName: 'John Smith',
    counters: [
      { id: 'user-004', name: 'Emily Davis', role: 'primary' }
    ],
    scheduledDate: new Date(Date.now() - 86400000 * 15),
    startedAt: new Date(Date.now() - 86400000 * 14),
    completedAt: new Date(Date.now() - 86400000 * 13),
    finalizedAt: null,
    dueDate: new Date(Date.now() - 86400000 * 12),
    items: createPhysicalCountItems('pc-009', 60, { countedRatio: 1, varianceRatio: 0.05, prefix: 'PC009' }),
    totalItems: 60,
    countedItems: 60,
    pendingItems: 0,
    varianceItems: 3,
    approvedItems: 60,
    recountItems: 0,
    accuracy: 95.00,
    totalSystemValue: 18000.00,
    totalCountedValue: 17850.00,
    varianceValue: 150.00,
    variancePercent: 0.83,
    requiresApproval: false,
    approvalThreshold: 5,
    isFinalized: false,
    adjustmentPosted: false,
    adjustmentId: null,
    description: 'Pastry Weekly Cycle Count',
    instructions: 'Count all baking ingredients and supplies.',
    notes: 'Completed - minimal variance within threshold.',
    createdBy: 'Pastry Chef',
    createdAt: new Date(Date.now() - 86400000 * 18),
    updatedAt: new Date(Date.now() - 86400000 * 13),
    finalizedBy: null
  },

  // Finalized counts
  {
    id: 'pc-010',
    countNumber: 'PC-241115-0001',
    countType: 'annual' as PhysicalCountType,
    status: 'finalized' as PhysicalCountStatus,
    priority: 'critical',
    locationId: 'loc-warehouse',
    locationName: 'Central Warehouse',
    departmentId: 'dept-storage',
    departmentName: 'Storage & Logistics',
    zone: 'Zone A',
    supervisorId: 'user-001',
    supervisorName: 'John Smith',
    counters: [
      { id: 'user-002', name: 'Sarah Johnson', role: 'primary' },
      { id: 'user-003', name: 'Mike Chen', role: 'primary' },
      { id: 'user-004', name: 'Emily Davis', role: 'primary' },
      { id: 'user-005', name: 'James Wilson', role: 'verifier' }
    ],
    scheduledDate: new Date(Date.now() - 86400000 * 20),
    startedAt: new Date(Date.now() - 86400000 * 19),
    completedAt: new Date(Date.now() - 86400000 * 17),
    finalizedAt: new Date(Date.now() - 86400000 * 15),
    dueDate: new Date(Date.now() - 86400000 * 15),
    items: createPhysicalCountItems('pc-010', 500, { countedRatio: 1, varianceRatio: 0.06, prefix: 'PC010' }),
    totalItems: 500,
    countedItems: 500,
    pendingItems: 0,
    varianceItems: 30,
    approvedItems: 500,
    recountItems: 0,
    accuracy: 94.00,
    totalSystemValue: 185000.00,
    totalCountedValue: 182500.00,
    varianceValue: 2500.00,
    variancePercent: 1.35,
    requiresApproval: true,
    approvalThreshold: 3,
    isFinalized: true,
    adjustmentPosted: true,
    adjustmentId: 'ADJ-241117-0001',
    description: 'Annual Physical Inventory Count 2024',
    instructions: 'Complete annual physical inventory count for financial year-end.',
    notes: 'Annual count finalized. Adjustments posted to system.',
    createdBy: 'Finance Controller',
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000 * 15),
    finalizedBy: 'CFO'
  },

  // On-hold count
  {
    id: 'pc-011',
    countNumber: 'PC-241128-0001',
    countType: 'partial' as PhysicalCountType,
    status: 'on-hold' as PhysicalCountStatus,
    priority: 'high',
    locationId: 'loc-banquet',
    locationName: 'Banquet Kitchen',
    departmentId: 'dept-banquet',
    departmentName: 'Banquet Operations',
    zone: 'Banquet Storage',
    supervisorId: 'user-006',
    supervisorName: 'Lisa Brown',
    counters: [
      { id: 'user-002', name: 'Sarah Johnson', role: 'primary' }
    ],
    scheduledDate: new Date(Date.now() - 86400000 * 8),
    startedAt: new Date(Date.now() - 86400000 * 6),
    completedAt: null,
    finalizedAt: null,
    dueDate: new Date(Date.now() + 86400000 * 5),
    items: createPhysicalCountItems('pc-011', 40, { countedRatio: 0.3, varianceRatio: 0.1, prefix: 'PC011' }),
    totalItems: 40,
    countedItems: 12,
    pendingItems: 28,
    varianceItems: 1,
    approvedItems: 1,
    recountItems: 0,
    accuracy: 91.67,
    totalSystemValue: 12000.00,
    totalCountedValue: 3600.00,
    varianceValue: 45.00,
    variancePercent: 0.38,
    requiresApproval: true,
    approvalThreshold: 5,
    isFinalized: false,
    adjustmentPosted: false,
    adjustmentId: null,
    description: 'Banquet Storage Count - On Hold',
    instructions: 'Count all banquet event supplies and equipment.',
    notes: 'On hold - large event setup in progress',
    createdBy: 'Banquet Manager',
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 4),
    finalizedBy: null
  },

  // Cancelled count
  {
    id: 'pc-012',
    countNumber: 'PC-241122-0001',
    countType: 'cycle' as PhysicalCountType,
    status: 'cancelled' as PhysicalCountStatus,
    priority: 'low',
    locationId: 'loc-maintenance',
    locationName: 'Maintenance Store',
    departmentId: 'dept-engineering',
    departmentName: 'Engineering',
    zone: 'Maintenance Storage',
    supervisorId: 'user-001',
    supervisorName: 'John Smith',
    counters: [],
    scheduledDate: new Date(Date.now() - 86400000 * 12),
    startedAt: null,
    completedAt: null,
    finalizedAt: null,
    dueDate: new Date(Date.now() - 86400000 * 10),
    items: createPhysicalCountItems('pc-012', 30, { countedRatio: 0, prefix: 'PC012' }),
    totalItems: 30,
    countedItems: 0,
    pendingItems: 30,
    varianceItems: 0,
    approvedItems: 0,
    recountItems: 0,
    accuracy: 0,
    totalSystemValue: 8500.00,
    totalCountedValue: 0,
    varianceValue: 0,
    variancePercent: 0,
    requiresApproval: false,
    approvalThreshold: 5,
    isFinalized: false,
    adjustmentPosted: false,
    adjustmentId: null,
    description: 'Maintenance Store Count - Cancelled',
    instructions: 'Count all maintenance supplies and spare parts.',
    notes: 'Cancelled - rescheduled for next quarter',
    createdBy: 'Chief Engineer',
    createdAt: new Date(Date.now() - 86400000 * 20),
    updatedAt: new Date(Date.now() - 86400000 * 12),
    finalizedBy: null
  }
]

// ====== SUMMARY HELPERS ======

export const getPhysicalCountSummary = (counts: PhysicalCount[] = mockPhysicalCounts): PhysicalCountSummary => {
  return {
    total: counts.length,
    draft: counts.filter(c => c.status === 'draft').length,
    planning: counts.filter(c => c.status === 'planning').length,
    pending: counts.filter(c => c.status === 'pending').length,
    inProgress: counts.filter(c => c.status === 'in-progress').length,
    completed: counts.filter(c => c.status === 'completed').length,
    finalized: counts.filter(c => c.status === 'finalized').length,
    cancelled: counts.filter(c => c.status === 'cancelled').length,
    onHold: counts.filter(c => c.status === 'on-hold').length
  }
}

export const getPhysicalCountById = (id: string): PhysicalCount | undefined => {
  return mockPhysicalCounts.find(count => count.id === id)
}

export const getPhysicalCountsByStatus = (status: PhysicalCountStatus): PhysicalCount[] => {
  return mockPhysicalCounts.filter(count => count.status === status)
}

export const getPhysicalCountsByType = (type: PhysicalCountType): PhysicalCount[] => {
  return mockPhysicalCounts.filter(count => count.countType === type)
}

export const getPhysicalCountsBySupervisor = (supervisorId: string): PhysicalCount[] => {
  return mockPhysicalCounts.filter(count => count.supervisorId === supervisorId)
}

export const getActivePhysicalCounts = (): PhysicalCount[] => {
  return mockPhysicalCounts.filter(count =>
    count.status === 'pending' || count.status === 'in-progress' || count.status === 'planning'
  )
}

export const getOverduePhysicalCounts = (): PhysicalCount[] => {
  const now = new Date()
  return mockPhysicalCounts.filter(count =>
    count.dueDate &&
    count.dueDate < now &&
    count.status !== 'completed' &&
    count.status !== 'finalized' &&
    count.status !== 'cancelled'
  )
}

export const getPendingApprovalCounts = (): PhysicalCount[] => {
  return mockPhysicalCounts.filter(count =>
    count.status === 'completed' && !count.isFinalized && count.requiresApproval
  )
}

// ====== DASHBOARD STATS ======

export const getPhysicalCountDashboardStats = (): PhysicalCountDashboardStats => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const completedCounts = mockPhysicalCounts.filter(c => c.status === 'completed' || c.status === 'finalized')
  const activeCounts = mockPhysicalCounts.filter(c =>
    c.status === 'pending' || c.status === 'in-progress' || c.status === 'planning'
  )

  const completedThisMonth = completedCounts.filter(c =>
    c.completedAt && c.completedAt >= startOfMonth
  ).length

  const pendingApproval = mockPhysicalCounts.filter(c =>
    c.status === 'completed' && !c.isFinalized && c.requiresApproval
  ).length

  const overdue = mockPhysicalCounts.filter(c =>
    c.dueDate &&
    c.dueDate < now &&
    c.status !== 'completed' &&
    c.status !== 'finalized' &&
    c.status !== 'cancelled'
  )

  const totalVariance = mockPhysicalCounts.reduce((sum, c) => sum + c.varianceValue, 0)
  const avgAccuracy = completedCounts.length > 0
    ? completedCounts.reduce((sum, c) => sum + c.accuracy, 0) / completedCounts.length
    : 0

  const itemsCounted = mockPhysicalCounts.reduce((sum, c) => sum + c.countedItems, 0)
  const varianceItems = mockPhysicalCounts.reduce((sum, c) => sum + c.varianceItems, 0)

  // Count by type
  const countsByType = ['full', 'cycle', 'annual', 'perpetual', 'partial'].map(type => {
    const typeCounts = mockPhysicalCounts.filter(c => c.countType === type)
    const typeCompleted = typeCounts.filter(c => c.status === 'completed' || c.status === 'finalized')
    return {
      type: type as PhysicalCountType,
      count: typeCounts.length,
      accuracy: typeCompleted.length > 0
        ? typeCompleted.reduce((sum, c) => sum + c.accuracy, 0) / typeCompleted.length
        : 0
    }
  }).filter(t => t.count > 0)

  // Count by location
  const locationMap = new Map<string, { count: number; varianceValue: number }>()
  mockPhysicalCounts.forEach(c => {
    const existing = locationMap.get(c.locationName) || { count: 0, varianceValue: 0 }
    locationMap.set(c.locationName, {
      count: existing.count + 1,
      varianceValue: existing.varianceValue + c.varianceValue
    })
  })
  const countsByLocation = Array.from(locationMap.entries()).map(([location, data]) => ({
    location,
    count: data.count,
    varianceValue: data.varianceValue
  }))

  return {
    totalCounts: mockPhysicalCounts.length,
    activeCounts: activeCounts.length,
    completedThisMonth,
    pendingApproval,
    overdueCounts: overdue.length,
    totalVarianceValue: Number(totalVariance.toFixed(2)),
    averageAccuracy: Number(avgAccuracy.toFixed(2)),
    itemsCounted,
    varianceItemsCount: varianceItems,
    countsByType,
    countsByLocation
  }
}
