/**
 * Inventory Mock Data
 *
 * Centralized mock data for inventory items, stock levels, counts, and adjustments.
 *
 * Transaction Code Format: PREFIX-YYMM-NNNN
 * - PREFIX: Document type identifier (TXN = Transaction, PO = Purchase Order, REQ = Requisition)
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number (e.g., 001, 002, etc.)
 * Example: TXN-2410-001 = Transaction #001 from October 2024
 */

import {
  InventoryItem,
  InventoryTransaction
} from '../types'

import {
  StockBalance,
  PhysicalCount,
  PhysicalCountItem,
  CountItem,
  CostingMethod,
  TransactionType
} from '../types/inventory'

// ====== INVENTORY ITEMS ======

export const mockInventoryItems: InventoryItem[] = [
  {
    id: "item-001",
    itemCode: "GR-BSM-001",
    itemName: "Basmati Rice",
    description: "Premium Long Grain Basmati Rice - 25kg bag",
    categoryId: "cat-grains",
    baseUnitId: "unit-bags",
    costingMethod: CostingMethod.FIFO,
    isActive: true,
    isSerialized: false,
    minimumQuantity: 10,
    maximumQuantity: 100,
    reorderPoint: 15,
    reorderQuantity: 30,
    leadTime: 5,
    lastPurchaseDate: new Date('2024-08-15'),
    lastPurchasePrice: { amount: 45.00, currency: 'USD' }
  },
  {
    id: "item-002",
    itemCode: "OIL-EV-002",
    itemName: "Olive Oil Extra Virgin",
    description: "Extra Virgin Olive Oil - 5L container",
    categoryId: "cat-oils",
    baseUnitId: "unit-bottles",
    costingMethod: CostingMethod.PERIODIC_AVERAGE,
    isActive: true,
    isSerialized: false,
    minimumQuantity: 5,
    maximumQuantity: 50,
    reorderPoint: 10,
    reorderQuantity: 20,
    leadTime: 7,
    lastPurchaseDate: new Date('2024-08-10'),
    lastPurchasePrice: { amount: 28.50, currency: 'USD' }
  },
  {
    id: "item-003",
    itemCode: "SP-BP-003",
    itemName: "Black Pepper Ground",
    description: "Ground Black Pepper - 1kg pack",
    categoryId: "cat-spices",
    baseUnitId: "unit-packs",
    costingMethod: CostingMethod.FIFO,
    isActive: true,
    isSerialized: false,
    minimumQuantity: 3,
    maximumQuantity: 30,
    reorderPoint: 8,
    reorderQuantity: 15,
    leadTime: 3,
    lastPurchaseDate: new Date('2024-08-12'),
    lastPurchasePrice: { amount: 15.75, currency: 'USD' }
  },
  {
    id: "item-004",
    itemCode: "ST-CH-004",
    itemName: "Chicken Stock Powder",
    description: "Professional Kitchen Chicken Stock Powder - 2.5kg tin",
    categoryId: "cat-stocks",
    baseUnitId: "unit-tins",
    costingMethod: CostingMethod.PERIODIC_AVERAGE,
    isActive: true,
    isSerialized: false,
    minimumQuantity: 2,
    maximumQuantity: 20,
    reorderPoint: 5,
    reorderQuantity: 10,
    leadTime: 4,
    lastPurchaseDate: new Date('2024-08-08'),
    lastPurchasePrice: { amount: 22.40, currency: 'USD' }
  },
  {
    id: "item-005",
    itemCode: "PA-PEN-005",
    itemName: "Pasta Penne",
    description: "Durum Wheat Penne Pasta - 5kg bag",
    categoryId: "cat-pasta",
    baseUnitId: "unit-bags",
    costingMethod: CostingMethod.FIFO,
    isActive: true,
    isSerialized: false,
    minimumQuantity: 8,
    maximumQuantity: 50,
    reorderPoint: 12,
    reorderQuantity: 25,
    leadTime: 6,
    lastPurchaseDate: new Date('2024-08-14'),
    lastPurchasePrice: { amount: 18.90, currency: 'USD' }
  }
];

// ====== STOCK BALANCES ======

export const mockStockBalances: StockBalance[] = [
  {
    id: "stock-001",
    itemId: "item-001",
    locationId: "dry-store",
    quantityOnHand: 45,
    quantityReserved: 5,
    quantityAvailable: 40,
    averageCost: { amount: 44.50, currency: 'USD' },
    totalValue: { amount: 2002.50, currency: 'USD' },
    lastMovementDate: new Date('2024-08-15'),
    lastCountDate: new Date('2024-08-01')
  },
  {
    id: "stock-002",
    itemId: "item-002",
    locationId: "dry-store",
    quantityOnHand: 28,
    quantityReserved: 3,
    quantityAvailable: 25,
    averageCost: { amount: 28.25, currency: 'USD' },
    totalValue: { amount: 791.00, currency: 'USD' },
    lastMovementDate: new Date('2024-08-14'),
    lastCountDate: new Date('2024-08-01')
  },
  {
    id: "stock-003",
    itemId: "item-003",
    locationId: "dry-store",
    quantityOnHand: 22,
    quantityReserved: 2,
    quantityAvailable: 20,
    averageCost: { amount: 15.60, currency: 'USD' },
    totalValue: { amount: 343.20, currency: 'USD' },
    lastMovementDate: new Date('2024-08-13'),
    lastCountDate: new Date('2024-08-01')
  }
];

// ====== INVENTORY TRANSACTIONS ======

export const mockInventoryTransactions: InventoryTransaction[] = [
  {
    id: "txn-001",
    transactionId: "TXN-2410-001",
    itemId: "item-001",
    locationId: "dry-store",
    transactionType: TransactionType.RECEIVE,
    quantity: 30,
    unitCost: { amount: 45.00, currency: 'USD' },
    totalCost: { amount: 1350.00, currency: 'USD' },
    balanceAfter: 45,
    transactionDate: new Date('2024-08-15'),
    referenceNo: "PO-2410-125",
    referenceType: "Purchase Order",
    userId: "user-warehouse-001",
    notes: "Received from ABC Suppliers"
  },
  {
    id: "txn-002",
    transactionId: "TXN-2410-002",
    itemId: "item-001",
    locationId: "dry-store",
    transactionType: TransactionType.ISSUE,
    quantity: -5,
    unitCost: { amount: 44.50, currency: 'USD' },
    totalCost: { amount: -222.50, currency: 'USD' },
    balanceAfter: 40,
    transactionDate: new Date('2024-08-16'),
    referenceNo: "REQ-2410-089",
    referenceType: "Kitchen Requisition",
    userId: "user-chef-001",
    notes: "Issued to Main Kitchen"
  }
];

// ====== PHYSICAL COUNTS ======

export const mockPhysicalCounts: PhysicalCount[] = [
  {
    id: "count-001",
    countNumber: "PC-2024-08-001",
    countDate: new Date('2024-08-01'),
    countType: 'cycle',
    status: 'completed',
    locationId: "dry-store",
    departmentId: "procurement",
    countedBy: ["user-warehouse-001"],
    supervisedBy: "user-manager-001",
    startTime: new Date('2024-08-01T09:00:00'),
    endTime: new Date('2024-08-01T15:30:00'),
    totalItems: 25,
    itemsCounted: 25,
    discrepanciesFound: 3,
    totalVarianceValue: { amount: 125.50, currency: 'USD' },
    notes: "Monthly cycle count - Dry storage area",
    isFinalized: true,
    finalizedBy: "user-manager-001",
    finalizedAt: new Date('2024-08-01T16:00:00'),
    createdAt: new Date('2024-08-01'),
    createdBy: "user-warehouse-001",
    updatedAt: new Date('2024-08-01'),
    updatedBy: "user-manager-001"
  },
  {
    id: "count-002",
    countNumber: "PC-2024-08-002",
    countDate: new Date('2024-08-15'),
    countType: 'spot',
    status: 'in_progress',
    locationId: "main-kitchen",
    departmentId: "fb",
    countedBy: ["user-chef-001"],
    startTime: new Date('2024-08-15T14:00:00'),
    totalItems: 8,
    itemsCounted: 5,
    discrepanciesFound: 1,
    totalVarianceValue: { amount: 25.00, currency: 'USD' },
    notes: "Spot check on high-value spices",
    isFinalized: false,
    createdAt: new Date('2024-08-15'),
    createdBy: "user-chef-001",
    updatedAt: new Date('2024-08-15'),
    updatedBy: "user-chef-001"
  }
];

// ====== PHYSICAL COUNT ITEMS ======

export const mockPhysicalCountItems: PhysicalCountItem[] = [
  {
    id: "count-item-001",
    countId: "count-001",
    itemId: "item-001",
    expectedQuantity: 50,
    countedQuantity: 45,
    variance: -5,
    varianceValue: { amount: -222.50, currency: 'USD' },
    reasonCode: "DAMAGED",
    comments: "Found 5 bags with damaged packaging",
    countedBy: "user-warehouse-001",
    countedAt: new Date('2024-08-01T10:30:00'),
    isRecounted: false,
    status: 'variance'
  },
  {
    id: "count-item-002",
    countId: "count-001",
    itemId: "item-002",
    expectedQuantity: 30,
    countedQuantity: 30,
    variance: 0,
    varianceValue: { amount: 0, currency: 'USD' },
    countedBy: "user-warehouse-001",
    countedAt: new Date('2024-08-01T11:00:00'),
    isRecounted: false,
    status: 'counted'
  },
  {
    id: "count-item-003",
    countId: "count-001",
    itemId: "item-003",
    expectedQuantity: 20,
    countedQuantity: 22,
    variance: 2,
    varianceValue: { amount: 31.20, currency: 'USD' },
    comments: "Found additional stock in back corner",
    countedBy: "user-warehouse-001",
    countedAt: new Date('2024-08-01T11:15:00'),
    isRecounted: false,
    status: 'variance'
  }
];

// ====== LEGACY COUNT ITEMS (for compatibility) ======

export const itemsToCount: CountItem[] = [
  {
    id: "1",
    name: "Basmati Rice",
    sku: "GR-BSM-001",
    description: "Premium Long Grain Basmati Rice - 25kg bag",
    expectedQuantity: 50,
    unit: "bags"
  },
  {
    id: "2",
    name: "Olive Oil Extra Virgin",
    sku: "OIL-EV-002",
    description: "Extra Virgin Olive Oil - 5L container",
    expectedQuantity: 30,
    unit: "bottles"
  },
  {
    id: "3",
    name: "Black Pepper Ground",
    sku: "SP-BP-003",
    description: "Ground Black Pepper - 1kg pack",
    expectedQuantity: 25,
    unit: "packs"
  },
  {
    id: "4",
    name: "Chicken Stock Powder",
    sku: "ST-CH-004",
    description: "Professional Kitchen Chicken Stock Powder - 2.5kg tin",
    expectedQuantity: 15,
    unit: "tins"
  },
  {
    id: "5",
    name: "Pasta Penne",
    sku: "PA-PEN-005",
    description: "Durum Wheat Penne Pasta - 5kg bag",
    expectedQuantity: 40,
    unit: "bags"
  },
  {
    id: "6",
    name: "Tomato Paste",
    sku: "SC-TP-006",
    description: "Double Concentrated Tomato Paste - 3kg tin",
    expectedQuantity: 35,
    unit: "tins"
  },
  {
    id: "7",
    name: "Garlic Powder",
    sku: "SP-GP-007",
    description: "Pure Garlic Powder - 500g container",
    expectedQuantity: 20,
    unit: "containers"
  },
  {
    id: "8",
    name: "Vegetable Oil",
    sku: "OIL-VG-008",
    description: "Refined Vegetable Oil - 20L container",
    expectedQuantity: 25,
    unit: "containers"
  },
  {
    id: "9",
    name: "Table Salt",
    sku: "SP-ST-009",
    description: "Fine Table Salt - 2kg pack",
    expectedQuantity: 45,
    unit: "packs"
  },
  {
    id: "10",
    name: "Sugar White",
    sku: "SG-WH-010",
    description: "Fine White Sugar - 10kg bag",
    expectedQuantity: 30,
    unit: "bags"
  }
];

// ====== STORE LOCATIONS (Legacy) ======

export const storeLocations = [
  { id: '1', name: 'Main Kitchen Store' },
  { id: '2', name: 'Dry Store' },
  { id: '3', name: 'Cold Room' },
  { id: '4', name: 'Linen Room' },
  { id: '5', name: 'Equipment Store' },
];

// ====== UTILITY FUNCTIONS ======

/**
 * Get inventory item by ID
 */
export const getMockInventoryItemById = (id: string): InventoryItem | undefined => {
  return mockInventoryItems.find(item => item.id === id);
};

/**
 * Get inventory item by code
 */
export const getMockInventoryItemByCode = (code: string): InventoryItem | undefined => {
  return mockInventoryItems.find(item => item.itemCode === code);
};

/**
 * Get stock balance for item at location
 */
export const getMockStockBalance = (itemId: string, locationId: string): StockBalance | undefined => {
  return mockStockBalances.find(stock => stock.itemId === itemId && stock.locationId === locationId);
};

/**
 * Get all transactions for an item
 */
export const getMockTransactionsForItem = (itemId: string): InventoryTransaction[] => {
  return mockInventoryTransactions.filter(txn => txn.itemId === itemId);
};

/**
 * Get physical count items for a count
 */
export const getMockPhysicalCountItems = (countId: string): PhysicalCountItem[] => {
  return mockPhysicalCountItems.filter(item => item.countId === countId);
};

/**
 * Get active physical counts
 */
export const getActivePhysicalCounts = (): PhysicalCount[] => {
  return mockPhysicalCounts.filter(count => 
    count.status === 'in_progress' || count.status === 'planning'
  );
};

/**
 * Legacy alias for backward compatibility
 */
export const mockCounts = mockPhysicalCounts;

/**
 * Get low stock items
 */
export const getLowStockItems = (): (InventoryItem & { currentStock: number })[] => {
  return mockInventoryItems
    .map(item => {
      const stock = mockStockBalances.find(s => s.itemId === item.id);
      return {
        ...item,
        currentStock: stock?.quantityAvailable || 0
      };
    })
    .filter(item => 
      item.reorderPoint && item.currentStock <= item.reorderPoint
    );
};

/**
 * Get inventory items by location (legacy compatibility)
 */
export const getProductsByLocation = (locationId: string): InventoryItem[] => {
  return mockInventoryItems; // For now, return all items since we don't filter by location yet
};

/**
 * Get products by department (legacy compatibility)
 */
export const getProductsByDepartment = (department: string) => {
  return mockInventoryProducts; // For now, return all products since we don't filter by department yet
};

/**
 * Legacy Product type mapping (for backward compatibility)
 */
export const mockInventoryProducts = mockInventoryItems.map(item => ({
  id: item.id,
  code: item.itemCode,
  name: item.itemName,
  category: 'General', // Default category
  subcategory: 'Standard', // Default subcategory
  uom: 'unit', // Default unit
  packSize: 1,
  minStock: item.minimumQuantity || 0,
  maxStock: item.maximumQuantity || 100,
  reorderPoint: item.reorderPoint || 0,
  currentStock: 50, // Default stock level
  value: item.lastPurchasePrice?.amount || 0,
  locationId: 'main-store', // Default location
  status: item.isActive ? 'active' : 'inactive' as const
}));
