import { 
  StockCardData, 
  Product, 
  StockSummary, 
  LocationStock, 
  LotInformation, 
  MovementRecord, 
  ValuationRecord 
} from "@/app/(main)/inventory-management/stock-overview/stock-card/types"

// Helper function to generate a date string within the last 30 days
const getRandomRecentDate = (daysAgo = 30) => {
  const now = new Date()
  const randomDays = Math.floor(Math.random() * daysAgo)
  const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000)
  return {
    dateString: date.toISOString().split('T')[0],
    timeString: date.toTimeString().split(' ')[0].substring(0, 5),
    dateObject: date
  }
}

// Generate mock stock card data
export function generateMockStockCardData(productId: string): StockCardData {
  // Product data
  const products: Record<string, Product> = {
    "prod1": {
      id: "prod1",
      name: "Fresh Tomatoes",
      code: "P-1001",
      category: "Produce",
      unit: "kg",
      status: "Active",
      description: "Fresh, ripe tomatoes sourced from local farms",
      lastUpdated: "2023-10-15",
      createdAt: "2022-05-10",
      createdBy: "john.doe",
      barcode: "8901234567890",
      alternateUnit: "case",
      conversionFactor: 10,
      minimumStock: 50,
      maximumStock: 200,
      reorderPoint: 75,
      reorderQuantity: 100,
      leadTime: 2,
      shelfLife: 7,
      storageRequirements: "Refrigerated, 4-10°C",
      tags: ["Produce", "Vegetable", "Perishable"]
    },
    "prod2": {
      id: "prod2",
      name: "Onions",
      code: "P-1002",
      category: "Produce",
      unit: "kg",
      status: "Active",
      description: "Yellow onions, medium-sized",
      lastUpdated: "2023-09-28",
      createdAt: "2022-05-10",
      createdBy: "john.doe",
      barcode: "8901234567891",
      alternateUnit: "bag",
      conversionFactor: 25,
      minimumStock: 40,
      maximumStock: 150,
      reorderPoint: 60,
      reorderQuantity: 75,
      leadTime: 3,
      shelfLife: 30,
      storageRequirements: "Cool, dry place",
      tags: ["Produce", "Vegetable"]
    },
    "prod3": {
      id: "prod3",
      name: "Chicken Breast",
      code: "M-2001",
      category: "Meat",
      unit: "kg",
      status: "Active",
      description: "Boneless, skinless chicken breast",
      lastUpdated: "2023-10-12",
      createdAt: "2022-06-15",
      createdBy: "jane.smith",
      barcode: "8901234567892",
      minimumStock: 30,
      maximumStock: 100,
      reorderPoint: 40,
      reorderQuantity: 50,
      leadTime: 1,
      shelfLife: 5,
      storageRequirements: "Frozen, -18°C",
      tags: ["Meat", "Protein", "Frozen"]
    },
    "unknown": {
      id: "unknown",
      name: "Rice",
      code: "DG-4001",
      category: "Dry Goods",
      unit: "kg",
      status: "Active",
      description: "Long grain white rice",
      lastUpdated: "2023-10-05",
      createdAt: "2022-04-20",
      createdBy: "mike.wilson",
      barcode: "8901234567893",
      alternateUnit: "bag",
      conversionFactor: 25,
      minimumStock: 100,
      maximumStock: 500,
      reorderPoint: 150,
      reorderQuantity: 200,
      leadTime: 5,
      shelfLife: 365,
      storageRequirements: "Cool, dry place",
      tags: ["Dry Goods", "Staple"]
    }
  }
  
  // Get product or default to unknown
  const product = products[productId] || products["unknown"]
  
  // Locations
  const locations = [
    { id: "loc1", name: "Main Warehouse" },
    { id: "loc2", name: "Secondary Warehouse" },
    { id: "loc3", name: "Main Kitchen" },
    { id: "loc4", name: "Prep Area" }
  ]
  
  // Generate location stocks
  const locationStocks: LocationStock[] = []
  let totalStock = 0
  let totalValue = 0
  
  locations.forEach((location, index) => {
    if (index < 3) { // Only use 3 locations for this product
      const quantity = Math.floor(Math.random() * 100) + 20
      const value = quantity * (Math.random() * 5 + 2) // Random unit cost between 2 and 7
      
      totalStock += quantity
      totalValue += value
      
      const { dateString } = getRandomRecentDate(15)
      
      locationStocks.push({
        locationId: location.id,
        locationName: location.name,
        quantity,
        value,
        lastMovementDate: dateString
      })
    }
  })
  
  // Sort locations by quantity (descending)
  locationStocks.sort((a, b) => b.quantity - a.quantity)
  
  // Generate lot information
  const lotInformation: LotInformation[] = []
  const lotStatuses: ("Available" | "Reserved" | "Expired" | "Quarantine")[] = [
    "Available", "Available", "Available", "Reserved", "Expired", "Quarantine"
  ]
  
  for (let i = 0; i < 5; i++) {
    const { dateString: receivedDate, dateObject } = getRandomRecentDate(60)
    
    // Generate expiry date (30-90 days after received date)
    const expiryDate = new Date(dateObject)
    expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 60) + 30)
    
    const quantity = Math.floor(Math.random() * 50) + 10
    const unitCost = Math.random() * 3 + 2 // Random unit cost between 2 and 5
    const value = quantity * unitCost
    
    const locationIndex = Math.floor(Math.random() * locationStocks.length)
    const status = lotStatuses[Math.floor(Math.random() * lotStatuses.length)]
    
    lotInformation.push({
      lotNumber: `LOT-${receivedDate.replace(/-/g, '')}${i + 1}`,
      expiryDate: expiryDate.toISOString().split('T')[0],
      receivedDate,
      quantity,
      unitCost,
      value,
      locationId: locationStocks[locationIndex].locationId,
      locationName: locationStocks[locationIndex].locationName,
      status
    })
  }
  
  // Sort lots by expiry date (ascending)
  lotInformation.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
  
  // Generate movement records - only IN and OUT transaction types
  const movements: MovementRecord[] = []
  const transactionTypes: ("IN" | "OUT")[] = ["IN", "OUT"]
  const referenceTypes = ["GRN", "SO", "ADJ", "TRF", "PO", "WO", "SR"]
  const reasons = {
    "IN": ["Purchase Receipt", "Return from Customer", "Transfer In", "Adjustment In", "Physical Count Increase"],
    "OUT": ["Sales Issue", "Transfer Out", "Consumption", "Wastage", "Physical Count Decrease", "Expiry", "Damage"]
  }
  const users = ["john.doe", "jane.smith", "mike.wilson", "sarah.johnson"]

  let runningQuantity = totalStock
  let runningValue = totalValue

  for (let i = 0; i < 20; i++) {
    const { dateString, timeString } = getRandomRecentDate()
    const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
    const referenceType = referenceTypes[Math.floor(Math.random() * referenceTypes.length)]
    const locationIndex = Math.floor(Math.random() * locationStocks.length)
    const reason = reasons[transactionType][Math.floor(Math.random() * reasons[transactionType].length)]
    const user = users[Math.floor(Math.random() * users.length)]

    // Generate quantities and values
    let quantityChange = 0

    if (transactionType === "IN") {
      quantityChange = Math.floor(Math.random() * 30) + 5
    } else {
      // OUT transaction
      quantityChange = -(Math.floor(Math.random() * 20) + 5)
    }
    
    const unitCost = Math.random() * 3 + 2 // Random unit cost between 2 and 5
    const valueChange = quantityChange * unitCost
    
    const quantityBefore = runningQuantity - quantityChange
    const valueBefore = runningValue - valueChange
    
    runningQuantity = quantityBefore
    runningValue = valueBefore
    
    movements.push({
      id: `mov-${i + 1}`,
      date: dateString,
      time: timeString,
      reference: `${referenceType}-${Math.floor(10000 + Math.random() * 90000)}`,
      referenceType,
      locationId: locationStocks[locationIndex].locationId,
      locationName: locationStocks[locationIndex].locationName,
      transactionType,
      reason,
      lotNumber: i % 3 === 0 ? lotInformation[Math.floor(Math.random() * lotInformation.length)].lotNumber : undefined,
      quantityBefore,
      quantityAfter: runningQuantity,
      quantityChange,
      unitCost,
      valueBefore,
      valueAfter: runningValue,
      valueChange,
      username: user
    })
  }
  
  // Sort movements by date and time (newest first)
  movements.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateB.getTime() - dateA.getTime()
  })
  
  // Generate valuation records
  const valuation: ValuationRecord[] = []
  
  let valRunningQuantity = 0
  let valRunningValue = 0
  
  for (let i = 0; i < 15; i++) {
    const { dateString } = getRandomRecentDate(90) // Last 90 days
    const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
    const referenceType = referenceTypes[Math.floor(Math.random() * referenceTypes.length)]

    let quantity = 0

    if (transactionType === "IN") {
      quantity = Math.floor(Math.random() * 50) + 10
    } else {
      // OUT transaction
      quantity = -(Math.floor(Math.random() * 30) + 5)
    }
    
    const unitCost = Math.random() * 3 + 2 // Random unit cost between 2 and 5
    const value = quantity * unitCost
    
    valRunningQuantity += quantity
    valRunningValue += value
    
    valuation.push({
      date: dateString,
      reference: `${referenceType}-${Math.floor(10000 + Math.random() * 90000)}`,
      transactionType,
      quantity,
      unitCost,
      value,
      runningQuantity: valRunningQuantity,
      runningValue: valRunningValue,
      runningAverageCost: valRunningQuantity > 0 ? valRunningValue / valRunningQuantity : 0
    })
  }
  
  // Sort valuation by date (oldest first)
  valuation.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Create summary
  const summary: StockSummary = {
    currentStock: totalStock,
    currentValue: totalValue,
    averageCost: totalStock > 0 ? totalValue / totalStock : 0,
    lastMovementDate: movements.length > 0 ? movements[0].date : "N/A",
    lastMovementType: movements.length > 0 ? movements[0].transactionType : "N/A",
    locationCount: locationStocks.length,
    primaryLocation: locationStocks.length > 0 ? locationStocks[0].locationName : "N/A",
    totalIn: movements.filter(m => m.transactionType === "IN").reduce((sum, m) => sum + m.quantityChange, 0),
    totalOut: Math.abs(movements.filter(m => m.transactionType === "OUT").reduce((sum, m) => sum + m.quantityChange, 0)),
    netChange: movements.reduce((sum, m) => sum + m.quantityChange, 0)
  }
  
  return {
    product,
    summary,
    locationStocks,
    lotInformation,
    movements,
    valuation
  }
}
