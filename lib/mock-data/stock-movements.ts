import { BalanceReportParams } from "@/app/(main)/inventory-management/stock-overview/inventory-balance/types"

export interface MovementRecord {
  id: string
  date: string
  time: string
  reference: string
  referenceType: 'GRN' | 'SO' | 'ADJ' | 'TRF' | 'PO' | 'WO' | 'SR'
  locationId: string
  locationName: string
  productId: string
  productCode: string
  productName: string
  transactionType: 'IN' | 'OUT'
  reason: string
  lotNumber?: string
  quantityBefore: number
  quantityAfter: number
  quantityChange: number
  unitCost: number
  valueBefore: number
  valueAfter: number
  valueChange: number
  username: string
}

export interface MovementHistoryData {
  records: MovementRecord[]
  summary: {
    totalIn: number
    totalOut: number
    netChange: number
    totalValueIn: number
    totalValueOut: number
    netValueChange: number
    transactionCount: number
  }
}

// Helper function to generate a date string within the last 30 days
const getRandomRecentDate = () => {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 30)
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return {
    dateString: date.toISOString().split('T')[0],
    timeString: date.toTimeString().split(' ')[0].substring(0, 5)
  }
}

// Generate mock movement history data
export const generateMockMovementHistory = (params: BalanceReportParams): MovementHistoryData => {
  const records: MovementRecord[] = []
  
  // Reference types and their descriptions
  const referenceTypes = {
    'GRN': 'Goods Received Note',
    'SO': 'Sales Order',
    'ADJ': 'Inventory Adjustment',
    'TRF': 'Transfer',
    'PO': 'Purchase Order',
    'WO': 'Write Off',
    'SR': 'Store Requisition'
  }
  
  // Transaction reasons - only IN and OUT types
  const reasons = {
    'IN': ['Purchase Receipt', 'Return from Customer', 'Transfer In', 'Adjustment In', 'Physical Count Increase'],
    'OUT': ['Sales Issue', 'Transfer Out', 'Consumption', 'Wastage', 'Physical Count Decrease', 'Expiry', 'Damage']
  }
  
  // Users
  const users = ['john.doe', 'jane.smith', 'mike.wilson', 'sarah.johnson']
  
  // Products from mock data
  const products = [
    { id: 'prod1', code: 'P-1001', name: 'Fresh Tomatoes', cost: 2.5 },
    { id: 'prod2', code: 'P-1002', name: 'Onions', cost: 1.8 },
    { id: 'prod3', code: 'P-1003', name: 'Potatoes', cost: 1.2 },
    { id: 'prod4', code: 'M-2001', name: 'Chicken Breast', cost: 8.5 },
    { id: 'prod5', code: 'M-2002', name: 'Ground Beef', cost: 12.75 },
    { id: 'prod6', code: 'D-3001', name: 'Milk', cost: 1.95 },
    { id: 'prod7', code: 'D-3002', name: 'Cheese', cost: 15.8 },
    { id: 'prod8', code: 'DG-4001', name: 'Rice', cost: 2.25 },
    { id: 'prod9', code: 'DG-4002', name: 'Pasta', cost: 1.85 },
    { id: 'prod10', code: 'DG-4003', name: 'Flour', cost: 1.35 }
  ]
  
  // Locations
  const locations = [
    { id: 'loc1', name: 'Main Warehouse' },
    { id: 'loc2', name: 'Secondary Warehouse' },
    { id: 'loc3', name: 'Main Kitchen' }
  ]
  
  // Generate 50 random movement records - only IN and OUT transaction types
  for (let i = 0; i < 50; i++) {
    const { dateString, timeString } = getRandomRecentDate()
    const transactionType = ['IN', 'OUT'][Math.floor(Math.random() * 2)] as 'IN' | 'OUT'
    const referenceType = Object.keys(referenceTypes)[Math.floor(Math.random() * Object.keys(referenceTypes).length)] as 'GRN' | 'SO' | 'ADJ' | 'TRF' | 'PO' | 'WO' | 'SR'
    const product = products[Math.floor(Math.random() * products.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    const reason = reasons[transactionType][Math.floor(Math.random() * reasons[transactionType].length)]
    const user = users[Math.floor(Math.random() * users.length)]

    // Generate quantities and values
    const quantityBefore = Math.floor(Math.random() * 1000)
    let quantityChange = 0

    if (transactionType === 'IN') {
      quantityChange = Math.floor(Math.random() * 100) + 1
    } else {
      // OUT transaction
      quantityChange = -Math.floor(Math.random() * Math.min(100, quantityBefore)) - 1
    }
    
    const quantityAfter = quantityBefore + quantityChange
    const valueBefore = quantityBefore * product.cost
    const valueChange = quantityChange * product.cost
    const valueAfter = valueBefore + valueChange
    
    // Create the record
    records.push({
      id: `mov-${i + 1}`,
      date: dateString,
      time: timeString,
      reference: `${referenceType}-${Math.floor(10000 + Math.random() * 90000)}`,
      referenceType,
      locationId: location.id,
      locationName: location.name,
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      transactionType,
      reason,
      lotNumber: Math.random() > 0.5 ? `LOT-${dateString.replace(/-/g, '')}` : undefined,
      quantityBefore,
      quantityAfter,
      quantityChange,
      unitCost: product.cost,
      valueBefore,
      valueAfter,
      valueChange,
      username: user
    })
  }
  
  // Sort records by date and time (newest first)
  records.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateB.getTime() - dateA.getTime()
  })
  
  // Calculate summary - only IN and OUT transaction types
  const summary = records.reduce((acc, record) => {
    if (record.transactionType === 'IN') {
      acc.totalIn += record.quantityChange
      acc.totalValueIn += record.valueChange
    } else {
      // OUT transaction
      acc.totalOut += Math.abs(record.quantityChange)
      acc.totalValueOut += Math.abs(record.valueChange)
    }

    acc.netChange += record.quantityChange
    acc.netValueChange += record.valueChange
    acc.transactionCount++

    return acc
  }, {
    totalIn: 0,
    totalOut: 0,
    netChange: 0,
    totalValueIn: 0,
    totalValueOut: 0,
    netValueChange: 0,
    transactionCount: 0
  })
  
  return {
    records,
    summary
  }
}
