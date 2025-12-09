import {
  TransactionRecord,
  TransactionSummary,
  TransactionAnalytics,
  TransactionHistoryData,
  TransactionFilterParams,
  ReferenceType,
  TransactionType
} from "@/app/(main)/inventory-management/transactions/types"

// Products with categories
const products = [
  { id: 'prod-001', code: 'PRD-1001', name: 'Fresh Tomatoes', categoryId: 'cat-1', category: 'Produce', cost: 2.50 },
  { id: 'prod-002', code: 'PRD-1002', name: 'Onions', categoryId: 'cat-1', category: 'Produce', cost: 1.80 },
  { id: 'prod-003', code: 'PRD-1003', name: 'Potatoes', categoryId: 'cat-1', category: 'Produce', cost: 1.20 },
  { id: 'prod-004', code: 'PRD-1004', name: 'Lettuce', categoryId: 'cat-1', category: 'Produce', cost: 2.25 },
  { id: 'prod-005', code: 'PRD-1005', name: 'Carrots', categoryId: 'cat-1', category: 'Produce', cost: 1.50 },
  { id: 'prod-006', code: 'MET-2001', name: 'Chicken Breast', categoryId: 'cat-2', category: 'Meat', cost: 8.50 },
  { id: 'prod-007', code: 'MET-2002', name: 'Ground Beef', categoryId: 'cat-2', category: 'Meat', cost: 12.75 },
  { id: 'prod-008', code: 'MET-2003', name: 'Pork Loin', categoryId: 'cat-2', category: 'Meat', cost: 9.80 },
  { id: 'prod-009', code: 'MET-2004', name: 'Lamb Chops', categoryId: 'cat-2', category: 'Meat', cost: 18.50 },
  { id: 'prod-010', code: 'SEA-3001', name: 'Salmon Fillet', categoryId: 'cat-3', category: 'Seafood', cost: 22.00 },
  { id: 'prod-011', code: 'SEA-3002', name: 'Shrimp', categoryId: 'cat-3', category: 'Seafood', cost: 18.75 },
  { id: 'prod-012', code: 'SEA-3003', name: 'Sea Bass', categoryId: 'cat-3', category: 'Seafood', cost: 24.50 },
  { id: 'prod-013', code: 'DRY-4001', name: 'Milk', categoryId: 'cat-4', category: 'Dairy', cost: 1.95 },
  { id: 'prod-014', code: 'DRY-4002', name: 'Cheese Block', categoryId: 'cat-4', category: 'Dairy', cost: 15.80 },
  { id: 'prod-015', code: 'DRY-4003', name: 'Butter', categoryId: 'cat-4', category: 'Dairy', cost: 4.50 },
  { id: 'prod-016', code: 'DRY-4004', name: 'Heavy Cream', categoryId: 'cat-4', category: 'Dairy', cost: 5.25 },
  { id: 'prod-017', code: 'DRG-5001', name: 'Rice (Jasmine)', categoryId: 'cat-5', category: 'Dry Goods', cost: 2.25 },
  { id: 'prod-018', code: 'DRG-5002', name: 'Pasta (Penne)', categoryId: 'cat-5', category: 'Dry Goods', cost: 1.85 },
  { id: 'prod-019', code: 'DRG-5003', name: 'All-Purpose Flour', categoryId: 'cat-5', category: 'Dry Goods', cost: 1.35 },
  { id: 'prod-020', code: 'DRG-5004', name: 'Sugar', categoryId: 'cat-5', category: 'Dry Goods', cost: 1.15 },
  { id: 'prod-021', code: 'BEV-6001', name: 'Orange Juice', categoryId: 'cat-6', category: 'Beverages', cost: 3.50 },
  { id: 'prod-022', code: 'BEV-6002', name: 'Coffee Beans', categoryId: 'cat-6', category: 'Beverages', cost: 14.00 },
  { id: 'prod-023', code: 'BEV-6003', name: 'Tea (Assorted)', categoryId: 'cat-6', category: 'Beverages', cost: 8.50 },
  { id: 'prod-024', code: 'SPI-7001', name: 'Vodka Premium', categoryId: 'cat-7', category: 'Spirits', cost: 32.00 },
  { id: 'prod-025', code: 'SPI-7002', name: 'Whiskey Single Malt', categoryId: 'cat-7', category: 'Spirits', cost: 65.00 },
  { id: 'prod-026', code: 'WIN-8001', name: 'Red Wine (House)', categoryId: 'cat-8', category: 'Wines', cost: 18.00 },
  { id: 'prod-027', code: 'WIN-8002', name: 'White Wine (House)', categoryId: 'cat-8', category: 'Wines', cost: 16.00 },
  { id: 'prod-028', code: 'SPC-9001', name: 'Olive Oil', categoryId: 'cat-9', category: 'Condiments', cost: 12.50 },
  { id: 'prod-029', code: 'SPC-9002', name: 'Soy Sauce', categoryId: 'cat-9', category: 'Condiments', cost: 4.25 },
  { id: 'prod-030', code: 'SPC-9003', name: 'Balsamic Vinegar', categoryId: 'cat-9', category: 'Condiments', cost: 9.75 }
]

// Locations matching permission-roles.ts
const locations = [
  { id: 'loc-001', name: 'Main Hotel' },
  { id: 'loc-002', name: 'Main Restaurant' },
  { id: 'loc-003', name: 'Central Kitchen' },
  { id: 'loc-004', name: 'Main Warehouse' },
  { id: 'loc-005', name: 'Branch Restaurant' }
]

// Users
const users = [
  { id: 'user-001', name: 'John Doe' },
  { id: 'user-002', name: 'Jane Smith' },
  { id: 'user-003', name: 'Mike Wilson' },
  { id: 'user-004', name: 'Sarah Johnson' },
  { id: 'user-005', name: 'Tom Brown' },
  { id: 'user-006', name: 'Emily Davis' }
]

// Transaction reasons by type
const reasons: Record<TransactionType, string[]> = {
  'IN': ['Purchase Receipt', 'Return from Outlet', 'Transfer In', 'Production Output', 'Opening Stock', 'Physical Count Adjustment', 'System Correction'],
  'OUT': ['Sales Issue', 'Transfer Out', 'Kitchen Consumption', 'Wastage', 'Breakage', 'Damage Write-off', 'Expiry Adjustment', 'Quality Rejection']
}

// Reference types by transaction type
const referenceTypesByTransaction: Record<TransactionType, ReferenceType[]> = {
  'IN': ['GRN', 'TRF', 'PO', 'PC', 'ADJ'],
  'OUT': ['SO', 'TRF', 'SR', 'WO', 'WR', 'ADJ', 'PC']
}

// Helper function to generate a date string within a range
const getRandomDate = (daysBack: number = 30) => {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * daysBack)
  const hoursAgo = Math.floor(Math.random() * 24)
  const minutesAgo = Math.floor(Math.random() * 60)
  const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000))
  return {
    dateString: date.toISOString().split('T')[0],
    timeString: date.toTimeString().split(' ')[0].substring(0, 5)
  }
}

// Generate a single random transaction
const generateRandomTransaction = (index: number): TransactionRecord => {
  const { dateString, timeString } = getRandomDate(30)

  // Weighted transaction types (balanced IN/OUT)
  const typeRandom = Math.random()
  let transactionType: TransactionType
  if (typeRandom < 0.45) {
    transactionType = 'IN'
  } else {
    transactionType = 'OUT'
  }

  const possibleRefTypes = referenceTypesByTransaction[transactionType]
  const referenceType = possibleRefTypes[Math.floor(Math.random() * possibleRefTypes.length)]
  const product = products[Math.floor(Math.random() * products.length)]
  const location = locations[Math.floor(Math.random() * locations.length)]
  const reason = reasons[transactionType][Math.floor(Math.random() * reasons[transactionType].length)]
  const user = users[Math.floor(Math.random() * users.length)]

  // Generate quantities
  const balanceBefore = Math.floor(Math.random() * 500) + 50
  let quantityIn = 0
  let quantityOut = 0

  if (transactionType === 'IN') {
    quantityIn = Math.floor(Math.random() * 100) + 10
  } else {
    quantityOut = Math.floor(Math.random() * Math.min(80, balanceBefore)) + 5
  }

  const netQuantity = quantityIn - quantityOut
  const balanceAfter = balanceBefore + netQuantity
  const totalValue = Math.abs(netQuantity) * product.cost

  return {
    id: `txn-${String(index).padStart(5, '0')}`,
    date: dateString,
    time: timeString,
    reference: `${referenceType}-${Math.floor(10000 + Math.random() * 90000)}`,
    referenceType,
    locationId: location.id,
    locationName: location.name,
    productId: product.id,
    productCode: product.code,
    productName: product.name,
    categoryId: product.categoryId,
    categoryName: product.category,
    transactionType,
    reason,
    lotNumber: Math.random() > 0.6 ? `LOT-${dateString.replace(/-/g, '')}-${Math.floor(Math.random() * 100)}` : undefined,
    quantityIn,
    quantityOut,
    netQuantity,
    unitCost: product.cost,
    totalValue,
    balanceBefore,
    balanceAfter,
    createdBy: user.id,
    createdByName: user.name
  }
}

// Calculate summary from records
const calculateSummary = (records: TransactionRecord[]): TransactionSummary => {
  return records.reduce((acc, record) => {
    acc.totalTransactions++
    acc.totalInQuantity += record.quantityIn
    acc.totalOutQuantity += record.quantityOut
    acc.netQuantityChange += record.netQuantity

    if (record.transactionType === 'IN') {
      acc.totalInValue += record.totalValue
    } else {
      acc.totalOutValue += record.totalValue
    }

    // Track adjustments by reference type (ADJ)
    if (record.referenceType === 'ADJ') {
      acc.adjustmentCount++
      acc.adjustmentValue += record.netQuantity >= 0 ? record.totalValue : -record.totalValue
    }

    acc.netValueChange = acc.totalInValue - acc.totalOutValue + acc.adjustmentValue

    return acc
  }, {
    totalTransactions: 0,
    totalInQuantity: 0,
    totalOutQuantity: 0,
    netQuantityChange: 0,
    totalInValue: 0,
    totalOutValue: 0,
    netValueChange: 0,
    adjustmentCount: 0,
    adjustmentValue: 0
  } as TransactionSummary)
}

// Calculate analytics from records
const calculateAnalytics = (records: TransactionRecord[]): TransactionAnalytics => {
  // Trend data by date
  const trendMap = new Map<string, { inbound: number; outbound: number; adjustment: number; inValue: number; outValue: number }>()

  records.forEach(record => {
    const existing = trendMap.get(record.date) || { inbound: 0, outbound: 0, adjustment: 0, inValue: 0, outValue: 0 }

    if (record.transactionType === 'IN') {
      existing.inbound += record.quantityIn
      existing.inValue += record.totalValue
    } else {
      existing.outbound += record.quantityOut
      existing.outValue += record.totalValue
    }

    // Track adjustments by reference type (ADJ)
    if (record.referenceType === 'ADJ') {
      existing.adjustment += Math.abs(record.netQuantity)
    }

    trendMap.set(record.date, existing)
  })

  const trendData = Array.from(trendMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // By transaction type
  const typeMap = new Map<TransactionType, { count: number; value: number }>()
  records.forEach(record => {
    const existing = typeMap.get(record.transactionType) || { count: 0, value: 0 }
    existing.count++
    existing.value += record.totalValue
    typeMap.set(record.transactionType, existing)
  })

  const typeColors: Record<TransactionType, string> = {
    'IN': '#22c55e',
    'OUT': '#ef4444'
  }

  const byTransactionType = Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    ...data,
    color: typeColors[type]
  }))

  // By location
  const locationMap = new Map<string, { locationId: string; inCount: number; outCount: number; netValue: number }>()
  records.forEach(record => {
    const existing = locationMap.get(record.locationName) || { locationId: record.locationId, inCount: 0, outCount: 0, netValue: 0 }

    if (record.transactionType === 'IN') {
      existing.inCount++
      existing.netValue += record.totalValue
    } else if (record.transactionType === 'OUT') {
      existing.outCount++
      existing.netValue -= record.totalValue
    }

    locationMap.set(record.locationName, existing)
  })

  const byLocation = Array.from(locationMap.entries()).map(([location, data]) => ({
    location,
    ...data
  }))

  // By reference type
  const refTypeLabels: Record<ReferenceType, string> = {
    'GRN': 'Goods Received',
    'SO': 'Sales Order',
    'ADJ': 'Adjustment',
    'TRF': 'Transfer',
    'PO': 'Purchase Order',
    'WO': 'Write Off',
    'SR': 'Store Requisition',
    'PC': 'Physical Count',
    'WR': 'Wastage Report'
  }

  const refTypeMap = new Map<ReferenceType, { count: number; value: number }>()
  records.forEach(record => {
    const existing = refTypeMap.get(record.referenceType) || { count: 0, value: 0 }
    existing.count++
    existing.value += record.totalValue
    refTypeMap.set(record.referenceType, existing)
  })

  const byReferenceType = Array.from(refTypeMap.entries()).map(([referenceType, data]) => ({
    referenceType,
    label: refTypeLabels[referenceType],
    ...data
  }))

  // By category
  const categoryMap = new Map<string, { categoryId: string; count: number; value: number }>()
  records.forEach(record => {
    const existing = categoryMap.get(record.categoryName) || { categoryId: record.categoryId, count: 0, value: 0 }
    existing.count++
    existing.value += record.totalValue
    categoryMap.set(record.categoryName, existing)
  })

  const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    ...data
  })).sort((a, b) => b.value - a.value)

  return {
    trendData,
    byTransactionType,
    byLocation,
    byReferenceType,
    byCategory
  }
}

// Filter records based on params
const filterRecords = (records: TransactionRecord[], params: TransactionFilterParams): TransactionRecord[] => {
  return records.filter(record => {
    // Date range filter
    if (params.dateRange.from) {
      const recordDate = new Date(record.date)
      if (recordDate < params.dateRange.from) return false
    }
    if (params.dateRange.to) {
      const recordDate = new Date(record.date)
      if (recordDate > params.dateRange.to) return false
    }

    // Transaction type filter
    if (params.transactionTypes.length > 0 && !params.transactionTypes.includes(record.transactionType)) {
      return false
    }

    // Reference type filter
    if (params.referenceTypes.length > 0 && !params.referenceTypes.includes(record.referenceType)) {
      return false
    }

    // Location filter
    if (params.locations.length > 0 && !params.locations.includes(record.locationId)) {
      return false
    }

    // Category filter
    if (params.categories.length > 0 && !params.categories.includes(record.categoryId)) {
      return false
    }

    // Search filter
    if (params.searchTerm) {
      const search = params.searchTerm.toLowerCase()
      const matchesSearch =
        record.productName.toLowerCase().includes(search) ||
        record.productCode.toLowerCase().includes(search) ||
        record.reference.toLowerCase().includes(search) ||
        record.locationName.toLowerCase().includes(search) ||
        record.categoryName.toLowerCase().includes(search) ||
        record.createdByName.toLowerCase().includes(search)

      if (!matchesSearch) return false
    }

    return true
  })
}

// Generate mock transaction history data - cached for performance
let cachedRecords: TransactionRecord[] | null = null

export const generateMockTransactionHistory = (
  params?: TransactionFilterParams,
  count: number = 250
): TransactionHistoryData => {
  // Generate records once and cache them
  if (!cachedRecords) {
    cachedRecords = []
    for (let i = 0; i < count; i++) {
      cachedRecords.push(generateRandomTransaction(i + 1))
    }
    // Sort by date/time descending (newest first)
    cachedRecords.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })
  }

  // Apply filters if provided
  let filteredRecords = cachedRecords
  if (params) {
    filteredRecords = filterRecords(cachedRecords, params)
  }

  const summary = calculateSummary(filteredRecords)
  const analytics = calculateAnalytics(filteredRecords)

  return {
    records: filteredRecords,
    summary,
    analytics
  }
}

// Export available locations for filters
export const getAvailableLocations = () => locations

// Export available categories for filters
export const getAvailableCategories = () => {
  const uniqueCategories = new Map<string, string>()
  products.forEach(p => uniqueCategories.set(p.categoryId, p.category))
  return Array.from(uniqueCategories.entries()).map(([id, name]) => ({ id, name }))
}

// Export all reference types
export const getAllReferenceTypes = (): ReferenceType[] => ['GRN', 'SO', 'ADJ', 'TRF', 'PO', 'WO', 'SR', 'PC', 'WR']

// Export all transaction types
export const getAllTransactionTypes = (): TransactionType[] => ['IN', 'OUT']
