/**
 * POS Integration - Complete Mock Data
 *
 * Comprehensive mock data for all POS integration features including:
 * - Transactions with approval workflow
 * - Location mappings
 * - Fractional variants
 * - System configuration
 * - Dashboard metrics
 * - Reports data
 */

import type {
  POSTransaction,
  POSTransactionLineItem,
  PendingTransaction,
  POSMapping,
  POSItem,
  POSIntegrationConfig,
  FractionalVariant,
  POSDashboardMetrics,
  TransactionStatistics,
  InventoryImpactPreview,
  TransactionAuditLog,
  TransactionError
} from '@/lib/types/pos-integration'
import { ErrorCategory } from '@/lib/types/pos-integration'

// Re-export mappings from existing file
export {
  mockPOSMappings,
  mockUnmappedPOSItems,
  mockMappedPOSItems,
  mockRecipeSearchResults,
  mockMappingPreviews,
  getMappingByPOSItemId,
  getMappingsByRecipeId,
  getUnmappedPOSItems,
  getMappedPOSItems,
  searchRecipes,
  getMappingPreview,
  getAllPOSMappings,
  getActiveMappings,
  getInactiveMappings
} from './pos-mappings'

// ====== LOCATION MAPPINGS ======

export interface POSLocationMapping {
  id: string
  locationId: string
  locationName: string
  locationCode: string
  locationType: 'restaurant' | 'bar' | 'room_service' | 'banquet' | 'pool' | 'cafe'
  posOutletId: string | null
  posOutletName: string | null
  posSystemId: string
  posSystemName: string
  syncEnabled: boolean
  syncFrequency: number // minutes
  lastSyncAt: string | null
  syncStatus: 'synced' | 'pending' | 'error' | 'never'
  transactionCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const mockLocationMappings: POSLocationMapping[] = [
  {
    id: 'loc-map-001',
    locationId: 'loc-001',
    locationName: 'Main Restaurant',
    locationCode: 'MAIN-REST',
    locationType: 'restaurant',
    posOutletId: 'POS-OUT-001',
    posOutletName: 'Main Dining - POS Terminal 1',
    posSystemId: 'comanche-001',
    posSystemName: 'Comanche POS',
    syncEnabled: true,
    syncFrequency: 15,
    lastSyncAt: '2025-01-15T14:30:00Z',
    syncStatus: 'synced',
    transactionCount: 1245,
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z'
  },
  {
    id: 'loc-map-002',
    locationId: 'loc-002',
    locationName: 'Pool Bar',
    locationCode: 'POOL-BAR',
    locationType: 'bar',
    posOutletId: 'POS-OUT-002',
    posOutletName: 'Pool Bar - Mobile POS',
    posSystemId: 'comanche-001',
    posSystemName: 'Comanche POS',
    syncEnabled: true,
    syncFrequency: 15,
    lastSyncAt: '2025-01-15T14:25:00Z',
    syncStatus: 'synced',
    transactionCount: 856,
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2025-01-15T14:25:00Z'
  },
  {
    id: 'loc-map-003',
    locationId: 'loc-003',
    locationName: 'Room Service',
    locationCode: 'ROOM-SVC',
    locationType: 'room_service',
    posOutletId: 'POS-OUT-003',
    posOutletName: 'Room Service Terminal',
    posSystemId: 'comanche-001',
    posSystemName: 'Comanche POS',
    syncEnabled: true,
    syncFrequency: 30,
    lastSyncAt: '2025-01-15T14:00:00Z',
    syncStatus: 'synced',
    transactionCount: 432,
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2025-01-15T14:00:00Z'
  },
  {
    id: 'loc-map-004',
    locationId: 'loc-004',
    locationName: 'Banquet Hall',
    locationCode: 'BANQUET',
    locationType: 'banquet',
    posOutletId: null,
    posOutletName: null,
    posSystemId: 'comanche-001',
    posSystemName: 'Comanche POS',
    syncEnabled: false,
    syncFrequency: 60,
    lastSyncAt: null,
    syncStatus: 'never',
    transactionCount: 0,
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z'
  },
  {
    id: 'loc-map-005',
    locationId: 'loc-005',
    locationName: 'Lobby Café',
    locationCode: 'LOBBY-CAFE',
    locationType: 'cafe',
    posOutletId: 'POS-OUT-005',
    posOutletName: 'Lobby Café Terminal',
    posSystemId: 'comanche-001',
    posSystemName: 'Comanche POS',
    syncEnabled: true,
    syncFrequency: 15,
    lastSyncAt: '2025-01-15T14:20:00Z',
    syncStatus: 'error',
    transactionCount: 678,
    isActive: true,
    createdAt: '2024-07-15T00:00:00Z',
    updatedAt: '2025-01-15T14:20:00Z'
  }
]

// ====== FRACTIONAL VARIANTS ======

export const mockFractionalVariants: FractionalVariant[] = [
  {
    id: 'fv-001',
    baseRecipeId: 'recipe-001',
    baseRecipeName: 'Margherita Pizza',
    totalYield: 8,
    yieldUnit: 'slices',
    variants: [
      {
        posItemId: 'POS-SLICE-MARG',
        posItemName: 'Pizza Slice - Margherita',
        fractionalUnit: '1/8',
        deductionAmount: 0.125,
        price: { amount: 4.50, currency: 'USD' }
      },
      {
        posItemId: 'POS-HALF-MARG',
        posItemName: 'Half Pizza - Margherita',
        fractionalUnit: '1/2',
        deductionAmount: 0.5,
        price: { amount: 12.00, currency: 'USD' }
      }
    ],
    roundingRule: 'up',
    isActive: true,
    createdAt: new Date('2024-10-01T00:00:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2024-10-15T00:00:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'fv-002',
    baseRecipeId: 'recipe-004',
    baseRecipeName: 'Pepperoni Pizza',
    totalYield: 8,
    yieldUnit: 'slices',
    variants: [
      {
        posItemId: 'POS-SLICE-PEPP',
        posItemName: 'Pizza Slice - Pepperoni',
        fractionalUnit: '1/8',
        deductionAmount: 0.125,
        price: { amount: 5.00, currency: 'USD' }
      }
    ],
    roundingRule: 'up',
    isActive: true,
    createdAt: new Date('2024-10-01T00:00:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2024-10-15T00:00:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'fv-003',
    baseRecipeId: 'recipe-010',
    baseRecipeName: 'Chocolate Cake',
    totalYield: 12,
    yieldUnit: 'slices',
    variants: [
      {
        posItemId: 'POS-SLICE-CHOC',
        posItemName: 'Cake Slice - Chocolate',
        fractionalUnit: '1/12',
        deductionAmount: 0.0833,
        price: { amount: 6.50, currency: 'USD' }
      },
      {
        posItemId: 'POS-QUARTER-CHOC',
        posItemName: 'Quarter Cake - Chocolate',
        fractionalUnit: '1/4',
        deductionAmount: 0.25,
        price: { amount: 18.00, currency: 'USD' }
      }
    ],
    roundingRule: 'up',
    isActive: true,
    createdAt: new Date('2024-10-05T00:00:00Z'),
    createdBy: 'user-002',
    updatedAt: new Date('2024-10-20T00:00:00Z'),
    updatedBy: 'user-002'
  },
  {
    id: 'fv-004',
    baseRecipeId: 'recipe-020',
    baseRecipeName: 'House Wine (Bottle)',
    totalYield: 6,
    yieldUnit: 'glasses',
    variants: [
      {
        posItemId: 'POS-WINE-GLASS',
        posItemName: 'House Wine - Glass',
        fractionalUnit: '1/6',
        deductionAmount: 0.1667,
        price: { amount: 8.00, currency: 'USD' }
      },
      {
        posItemId: 'POS-WINE-CARAFE',
        posItemName: 'House Wine - Carafe',
        fractionalUnit: '1/2',
        deductionAmount: 0.5,
        price: { amount: 22.00, currency: 'USD' }
      }
    ],
    roundingRule: 'nearest',
    isActive: true,
    createdAt: new Date('2024-11-01T00:00:00Z'),
    createdBy: 'user-003',
    updatedAt: new Date('2024-11-10T00:00:00Z'),
    updatedBy: 'user-003'
  }
]

// ====== POS TRANSACTIONS ======

export const mockPOSTransactions: POSTransaction[] = [
  {
    id: 'txn-001',
    transactionId: 'TXN-2025-0001',
    externalId: 'COM-TXN-78901',
    date: '2025-01-15T10:30:00Z',
    status: 'success',
    locationId: 'loc-001',
    location: { id: 'loc-001', name: 'Main Restaurant' },
    posSystem: { name: 'Comanche POS', version: '4.2.1' },
    totalAmount: { amount: 156.50, currency: 'USD' },
    itemCount: 8,
    processedAt: '2025-01-15T10:31:00Z',
    processedBy: { id: 'system', name: 'Auto Process' },
    createdAt: new Date('2025-01-15T10:30:00Z'),
    createdBy: 'system',
    updatedAt: new Date('2025-01-15T10:31:00Z'),
    updatedBy: 'system'
  },
  {
    id: 'txn-002',
    transactionId: 'TXN-2025-0002',
    externalId: 'COM-TXN-78902',
    date: '2025-01-15T11:15:00Z',
    status: 'success',
    locationId: 'loc-002',
    location: { id: 'loc-002', name: 'Pool Bar' },
    posSystem: { name: 'Comanche POS', version: '4.2.1' },
    totalAmount: { amount: 89.00, currency: 'USD' },
    itemCount: 5,
    processedAt: '2025-01-15T11:16:00Z',
    processedBy: { id: 'system', name: 'Auto Process' },
    createdAt: new Date('2025-01-15T11:15:00Z'),
    createdBy: 'system',
    updatedAt: new Date('2025-01-15T11:16:00Z'),
    updatedBy: 'system'
  },
  {
    id: 'txn-003',
    transactionId: 'TXN-2025-0003',
    externalId: 'COM-TXN-78903',
    date: '2025-01-15T12:00:00Z',
    status: 'pending_approval',
    locationId: 'loc-001',
    location: { id: 'loc-001', name: 'Main Restaurant' },
    posSystem: { name: 'Comanche POS', version: '4.2.1' },
    totalAmount: { amount: 1250.00, currency: 'USD' },
    itemCount: 45,
    notes: 'Large banquet order - requires manager approval',
    createdAt: new Date('2025-01-15T12:00:00Z'),
    createdBy: 'system',
    updatedAt: new Date('2025-01-15T12:00:00Z'),
    updatedBy: 'system'
  },
  {
    id: 'txn-004',
    transactionId: 'TXN-2025-0004',
    externalId: 'COM-TXN-78904',
    date: '2025-01-15T12:30:00Z',
    status: 'failed',
    locationId: 'loc-003',
    location: { id: 'loc-003', name: 'Room Service' },
    posSystem: { name: 'Comanche POS', version: '4.2.1' },
    totalAmount: { amount: 45.50, currency: 'USD' },
    itemCount: 3,
    notes: 'Failed due to unmapped items',
    createdAt: new Date('2025-01-15T12:30:00Z'),
    createdBy: 'system',
    updatedAt: new Date('2025-01-15T12:30:00Z'),
    updatedBy: 'system'
  },
  {
    id: 'txn-005',
    transactionId: 'TXN-2025-0005',
    externalId: 'COM-TXN-78905',
    date: '2025-01-15T13:00:00Z',
    status: 'pending_approval',
    locationId: 'loc-002',
    location: { id: 'loc-002', name: 'Pool Bar' },
    posSystem: { name: 'Comanche POS', version: '4.2.1' },
    totalAmount: { amount: 520.00, currency: 'USD' },
    itemCount: 25,
    notes: 'High value transaction - approval required',
    createdAt: new Date('2025-01-15T13:00:00Z'),
    createdBy: 'system',
    updatedAt: new Date('2025-01-15T13:00:00Z'),
    updatedBy: 'system'
  },
  {
    id: 'txn-006',
    transactionId: 'TXN-2025-0006',
    externalId: 'COM-TXN-78906',
    date: '2025-01-15T13:30:00Z',
    status: 'processing',
    locationId: 'loc-001',
    location: { id: 'loc-001', name: 'Main Restaurant' },
    posSystem: { name: 'Comanche POS', version: '4.2.1' },
    totalAmount: { amount: 78.25, currency: 'USD' },
    itemCount: 4,
    createdAt: new Date('2025-01-15T13:30:00Z'),
    createdBy: 'system',
    updatedAt: new Date('2025-01-15T13:30:00Z'),
    updatedBy: 'system'
  },
  {
    id: 'txn-007',
    transactionId: 'TXN-2025-0007',
    externalId: 'COM-TXN-78907',
    date: '2025-01-14T18:45:00Z',
    status: 'success',
    locationId: 'loc-001',
    location: { id: 'loc-001', name: 'Main Restaurant' },
    posSystem: { name: 'Comanche POS', version: '4.2.1' },
    totalAmount: { amount: 342.75, currency: 'USD' },
    itemCount: 15,
    processedAt: '2025-01-14T18:46:00Z',
    processedBy: { id: 'system', name: 'Auto Process' },
    createdAt: new Date('2025-01-14T18:45:00Z'),
    createdBy: 'system',
    updatedAt: new Date('2025-01-14T18:46:00Z'),
    updatedBy: 'system'
  },
  {
    id: 'txn-008',
    transactionId: 'TXN-2025-0008',
    externalId: 'COM-TXN-78908',
    date: '2025-01-14T19:30:00Z',
    status: 'manually_resolved',
    locationId: 'loc-003',
    location: { id: 'loc-003', name: 'Room Service' },
    posSystem: { name: 'Comanche POS', version: '4.2.1' },
    totalAmount: { amount: 67.00, currency: 'USD' },
    itemCount: 4,
    processedAt: '2025-01-14T20:15:00Z',
    processedBy: { id: 'user-001', name: 'John Smith' },
    notes: 'Manually resolved after mapping correction',
    createdAt: new Date('2025-01-14T19:30:00Z'),
    createdBy: 'system',
    updatedAt: new Date('2025-01-14T20:15:00Z'),
    updatedBy: 'user-001'
  }
]

// ====== TRANSACTION LINE ITEMS ======

export const mockTransactionLineItems: Record<string, POSTransactionLineItem[]> = {
  'txn-001': [
    {
      id: 'line-001-1',
      transactionId: 'txn-001',
      posItemId: 'pos-item-101',
      posItemName: 'Margherita Pizza',
      category: 'Main Course',
      quantity: 2,
      unitPrice: { amount: 15.00, currency: 'USD' },
      totalPrice: { amount: 30.00, currency: 'USD' },
      mappedRecipe: { id: 'recipe-001', name: 'Margherita Pizza', category: 'Pizza' },
      inventoryDeduction: {
        ingredients: [
          { id: 'ing-001', name: 'Pizza Dough', quantity: 800, unit: 'g', location: 'Main Kitchen', cost: { amount: 4.80, currency: 'USD' } },
          { id: 'ing-002', name: 'Tomato Sauce', quantity: 400, unit: 'ml', location: 'Main Kitchen', cost: { amount: 2.40, currency: 'USD' } },
          { id: 'ing-003', name: 'Mozzarella Cheese', quantity: 600, unit: 'g', location: 'Main Kitchen', cost: { amount: 9.00, currency: 'USD' } }
        ]
      }
    },
    {
      id: 'line-001-2',
      transactionId: 'txn-001',
      posItemId: 'pos-item-102',
      posItemName: 'House Salad',
      category: 'Appetizer',
      quantity: 3,
      unitPrice: { amount: 8.50, currency: 'USD' },
      totalPrice: { amount: 25.50, currency: 'USD' },
      mappedRecipe: { id: 'recipe-002', name: 'House Salad', category: 'Salad' }
    },
    {
      id: 'line-001-3',
      transactionId: 'txn-001',
      posItemId: 'pos-item-107',
      posItemName: 'Iced Tea',
      category: 'Beverage',
      quantity: 4,
      unitPrice: { amount: 4.50, currency: 'USD' },
      totalPrice: { amount: 18.00, currency: 'USD' },
      mappedRecipe: { id: 'recipe-007', name: 'Iced Tea', category: 'Beverages' }
    }
  ],
  'txn-004': [
    {
      id: 'line-004-1',
      transactionId: 'txn-004',
      posItemId: 'pos-item-999',
      posItemName: 'Seasonal Special',
      category: 'Specials',
      quantity: 1,
      unitPrice: { amount: 18.99, currency: 'USD' },
      totalPrice: { amount: 18.99, currency: 'USD' }
      // No mappedRecipe - this is the unmapped item causing failure
    },
    {
      id: 'line-004-2',
      transactionId: 'txn-004',
      posItemId: 'pos-item-107',
      posItemName: 'Iced Tea',
      category: 'Beverage',
      quantity: 2,
      unitPrice: { amount: 4.50, currency: 'USD' },
      totalPrice: { amount: 9.00, currency: 'USD' },
      mappedRecipe: { id: 'recipe-007', name: 'Iced Tea', category: 'Beverages' }
    }
  ]
}

// ====== PENDING TRANSACTIONS ======

export const mockPendingTransactions: PendingTransaction[] = [
  {
    ...mockPOSTransactions[2], // txn-003
    status: 'pending_approval',
    requester: { id: 'system', name: 'POS System', email: 'pos@system.local' },
    inventoryImpact: 'high',
    lineItems: [
      {
        id: 'line-003-1',
        transactionId: 'txn-003',
        posItemId: 'pos-item-101',
        posItemName: 'Margherita Pizza',
        category: 'Main Course',
        quantity: 15,
        unitPrice: { amount: 15.00, currency: 'USD' },
        totalPrice: { amount: 225.00, currency: 'USD' },
        mappedRecipe: { id: 'recipe-001', name: 'Margherita Pizza', category: 'Pizza' }
      },
      {
        id: 'line-003-2',
        transactionId: 'txn-003',
        posItemId: 'pos-item-104',
        posItemName: 'Pepperoni Pizza',
        category: 'Main Course',
        quantity: 10,
        unitPrice: { amount: 17.00, currency: 'USD' },
        totalPrice: { amount: 170.00, currency: 'USD' },
        mappedRecipe: { id: 'recipe-004', name: 'Pepperoni Pizza', category: 'Pizza' }
      }
    ],
    approvalNotes: [
      {
        id: 'note-001',
        user: 'System',
        timestamp: '2025-01-15T12:00:00Z',
        action: 'requested_info',
        comment: 'Large order exceeds auto-approval threshold of $500'
      }
    ]
  },
  {
    ...mockPOSTransactions[4], // txn-005
    status: 'pending_approval',
    requester: { id: 'system', name: 'POS System', email: 'pos@system.local' },
    inventoryImpact: 'medium',
    lineItems: [
      {
        id: 'line-005-1',
        transactionId: 'txn-005',
        posItemId: 'POS-WINE-GLASS',
        posItemName: 'House Wine - Glass',
        category: 'Beverage',
        quantity: 20,
        unitPrice: { amount: 8.00, currency: 'USD' },
        totalPrice: { amount: 160.00, currency: 'USD' },
        mappedRecipe: { id: 'recipe-020', name: 'House Wine (Bottle)', category: 'Beverages' }
      }
    ]
  }
]

// ====== SYSTEM CONFIGURATION ======

export const mockPOSConfig: POSIntegrationConfig = {
  id: 'config-001',
  posSystem: 'comanche',
  apiEndpoint: 'https://pos.hotel.local/api/v2',
  syncEnabled: true,
  syncFrequency: 15,
  processingMode: 'approval',
  autoApproveThreshold: 500,
  requireApproval: true,
  emailNotifications: true,
  notificationRecipients: ['manager@hotel.local', 'inventory@hotel.local'],
  dataRetentionDays: 365,
  connectionStatus: 'connected',
  lastSyncAt: '2025-01-15T14:30:00Z',
  lastConnectionTest: '2025-01-15T14:00:00Z',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  createdBy: 'admin',
  updatedAt: new Date('2025-01-15T14:30:00Z'),
  updatedBy: 'admin'
}

// ====== DASHBOARD METRICS ======

export const mockDashboardMetrics: POSDashboardMetrics = {
  systemStatus: 'connected',
  alerts: {
    unmappedItems: 4,
    failedTransactions: 2,
    pendingApprovals: 3,
    fractionalVariants: 4
  },
  recentActivity: mockPOSTransactions.slice(0, 5),
  syncStatus: {
    lastSyncAt: '2025-01-15T14:30:00Z',
    nextSyncAt: '2025-01-15T14:45:00Z',
    syncFrequency: '15 minutes'
  }
}

// ====== TRANSACTION STATISTICS ======

export const mockTransactionStats: TransactionStatistics = {
  period: {
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-01-15T23:59:59Z'
  },
  totalTransactions: 1856,
  successfulTransactions: 1789,
  failedTransactions: 23,
  pendingApprovals: 44,
  totalValue: { amount: 87456.50, currency: 'USD' },
  averageTransactionValue: { amount: 47.12, currency: 'USD' },
  processingAccuracy: 96.4,
  averageProcessingTime: 1.2
}

// ====== INVENTORY IMPACT PREVIEW ======

export const mockInventoryImpactPreview: InventoryImpactPreview = {
  affectedItems: [
    {
      ingredient: 'Mozzarella Cheese',
      ingredientId: 'ing-003',
      currentStock: 5000,
      deductionAmount: 600,
      resultingStock: 4400,
      unit: 'g',
      stockStatus: 'sufficient',
      reorderPoint: 2000,
      location: 'Main Kitchen'
    },
    {
      ingredient: 'Pizza Dough',
      ingredientId: 'ing-001',
      currentStock: 3000,
      deductionAmount: 800,
      resultingStock: 2200,
      unit: 'g',
      stockStatus: 'low',
      reorderPoint: 2500,
      location: 'Main Kitchen'
    },
    {
      ingredient: 'Fresh Basil',
      ingredientId: 'ing-004',
      currentStock: 150,
      deductionAmount: 40,
      resultingStock: 110,
      unit: 'g',
      stockStatus: 'critical',
      reorderPoint: 200,
      location: 'Main Kitchen'
    }
  ],
  warnings: [
    {
      type: 'low_stock',
      severity: 'warning',
      message: 'Pizza Dough will fall below reorder point after this transaction',
      affectedIngredients: ['Pizza Dough']
    },
    {
      type: 'critical_stock',
      severity: 'critical',
      message: 'Fresh Basil is already below reorder point',
      affectedIngredients: ['Fresh Basil']
    }
  ],
  summary: {
    totalIngredients: 3,
    totalDeductedValue: { amount: 17.00, currency: 'USD' },
    affectedLocations: ['Main Kitchen']
  }
}

// ====== AUDIT LOGS ======

export const mockAuditLogs: TransactionAuditLog[] = [
  {
    id: 'audit-001',
    transactionId: 'txn-001',
    timestamp: '2025-01-15T10:30:00Z',
    action: 'created',
    details: 'Transaction received from Comanche POS'
  },
  {
    id: 'audit-002',
    transactionId: 'txn-001',
    timestamp: '2025-01-15T10:30:30Z',
    action: 'processed',
    details: 'Auto-approved: value below threshold'
  },
  {
    id: 'audit-003',
    transactionId: 'txn-003',
    timestamp: '2025-01-15T12:00:00Z',
    action: 'created',
    details: 'Transaction received from Comanche POS'
  },
  {
    id: 'audit-004',
    transactionId: 'txn-003',
    timestamp: '2025-01-15T12:00:30Z',
    user: { id: 'system', name: 'System' },
    action: 'created',
    details: 'Sent to approval queue: value exceeds $500 threshold'
  },
  {
    id: 'audit-005',
    transactionId: 'txn-004',
    timestamp: '2025-01-15T12:30:00Z',
    action: 'created',
    details: 'Transaction received from Comanche POS'
  },
  {
    id: 'audit-006',
    transactionId: 'txn-004',
    timestamp: '2025-01-15T12:30:30Z',
    action: 'failed',
    details: 'Processing failed: 1 unmapped item(s)'
  }
]

// ====== TRANSACTION ERRORS ======

export const mockTransactionErrors: Record<string, TransactionError> = {
  'txn-004': {
    category: ErrorCategory.MAPPING_ERROR,
    code: 'ERR_UNMAPPED_ITEM',
    message: 'Transaction contains unmapped POS items',
    severity: 'high',
    occurredAt: '2025-01-15T12:30:30Z',
    technicalDetails: {
      requestId: 'req-78904',
      endpoint: '/api/pos/transactions/process',
      raw: { unmappedItems: ['pos-item-999'] }
    }
  }
}

// ====== REPORTS DATA ======

export interface GrossProfitReportItem {
  category: string
  revenue: number
  cogs: number
  grossProfit: number
  marginPercentage: number
  transactionCount: number
}

export const mockGrossProfitReport: GrossProfitReportItem[] = [
  { category: 'Main Course', revenue: 45678.00, cogs: 18271.20, grossProfit: 27406.80, marginPercentage: 60.0, transactionCount: 892 },
  { category: 'Appetizer', revenue: 12345.00, cogs: 4320.75, grossProfit: 8024.25, marginPercentage: 65.0, transactionCount: 456 },
  { category: 'Beverage', revenue: 18920.00, cogs: 5676.00, grossProfit: 13244.00, marginPercentage: 70.0, transactionCount: 1234 },
  { category: 'Dessert', revenue: 8765.00, cogs: 2629.50, grossProfit: 6135.50, marginPercentage: 70.0, transactionCount: 234 },
  { category: 'Side Dish', revenue: 5432.00, cogs: 1629.60, grossProfit: 3802.40, marginPercentage: 70.0, transactionCount: 567 }
]

export interface ConsumptionAnalysisItem {
  ingredient: string
  theoreticalUsage: number
  actualUsage: number
  variance: number
  variancePercentage: number
  unit: string
  cost: number
}

export const mockConsumptionAnalysis: ConsumptionAnalysisItem[] = [
  { ingredient: 'Mozzarella Cheese', theoreticalUsage: 45000, actualUsage: 47250, variance: 2250, variancePercentage: 5.0, unit: 'g', cost: 33.75 },
  { ingredient: 'Pizza Dough', theoreticalUsage: 60000, actualUsage: 61800, variance: 1800, variancePercentage: 3.0, unit: 'g', cost: 10.80 },
  { ingredient: 'Tomato Sauce', theoreticalUsage: 30000, actualUsage: 31500, variance: 1500, variancePercentage: 5.0, unit: 'ml', cost: 9.00 },
  { ingredient: 'Fresh Basil', theoreticalUsage: 3000, actualUsage: 3600, variance: 600, variancePercentage: 20.0, unit: 'g', cost: 48.00 },
  { ingredient: 'Chicken Breast', theoreticalUsage: 25000, actualUsage: 25500, variance: 500, variancePercentage: 2.0, unit: 'g', cost: 15.00 }
]

// ====== UTILITY FUNCTIONS ======

export function getTransactionById(id: string): POSTransaction | undefined {
  return mockPOSTransactions.find(t => t.id === id)
}

export function getTransactionsByStatus(status: POSTransaction['status']): POSTransaction[] {
  return mockPOSTransactions.filter(t => t.status === status)
}

export function getLocationMappingById(id: string): POSLocationMapping | undefined {
  return mockLocationMappings.find(l => l.id === id)
}

export function getFractionalVariantById(id: string): FractionalVariant | undefined {
  return mockFractionalVariants.find(v => v.id === id)
}

export function getTransactionLineItems(transactionId: string): POSTransactionLineItem[] {
  return mockTransactionLineItems[transactionId] || []
}

export function getPendingTransactions(): PendingTransaction[] {
  return mockPendingTransactions
}

export function getFailedTransactions(): POSTransaction[] {
  return mockPOSTransactions.filter(t => t.status === 'failed')
}

export function getMappedLocations(): POSLocationMapping[] {
  return mockLocationMappings.filter(l => l.posOutletId !== null)
}

export function getUnmappedLocations(): POSLocationMapping[] {
  return mockLocationMappings.filter(l => l.posOutletId === null)
}
