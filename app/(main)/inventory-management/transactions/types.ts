// Transaction Record Types for Inventory Transactions Page

export type ReferenceType = 'GRN' | 'SO' | 'ADJ' | 'TRF' | 'PO' | 'WO' | 'SR' | 'PC' | 'WR'
export type TransactionType = 'IN' | 'OUT'

export interface TransactionRecord {
  id: string
  date: string
  time: string
  reference: string
  referenceType: ReferenceType
  locationId: string
  locationName: string
  productId: string
  productCode: string
  productName: string
  categoryId: string
  categoryName: string
  transactionType: TransactionType
  reason: string
  lotNumber?: string
  quantityIn: number
  quantityOut: number
  netQuantity: number
  unitCost: number
  totalValue: number
  balanceBefore: number
  balanceAfter: number
  createdBy: string
  createdByName: string
}

export interface TransactionSummary {
  totalTransactions: number
  totalInQuantity: number
  totalOutQuantity: number
  netQuantityChange: number
  totalInValue: number
  totalOutValue: number
  netValueChange: number
  adjustmentCount: number
  adjustmentValue: number
}

export interface TransactionFilterParams {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  transactionTypes: TransactionType[]
  referenceTypes: ReferenceType[]
  locations: string[]
  categories: string[]
  searchTerm: string
}

export interface TransactionAnalytics {
  trendData: Array<{
    date: string
    inbound: number
    outbound: number
    adjustment: number
    inValue: number
    outValue: number
  }>
  byTransactionType: Array<{
    type: string
    count: number
    value: number
    color: string
  }>
  byLocation: Array<{
    location: string
    locationId: string
    inCount: number
    outCount: number
    netValue: number
  }>
  byReferenceType: Array<{
    referenceType: ReferenceType
    label: string
    count: number
    value: number
  }>
  byCategory: Array<{
    category: string
    categoryId: string
    count: number
    value: number
  }>
}

export interface TransactionHistoryData {
  records: TransactionRecord[]
  summary: TransactionSummary
  analytics: TransactionAnalytics
}

// Reference type labels and colors
export const referenceTypeConfig: Record<ReferenceType, { label: string; color: string }> = {
  'GRN': { label: 'Goods Received Note', color: 'bg-green-100 text-green-800' },
  'SO': { label: 'Sales Order', color: 'bg-blue-100 text-blue-800' },
  'ADJ': { label: 'Adjustment', color: 'bg-amber-100 text-amber-800' },
  'TRF': { label: 'Transfer', color: 'bg-purple-100 text-purple-800' },
  'PO': { label: 'Purchase Order', color: 'bg-cyan-100 text-cyan-800' },
  'WO': { label: 'Write Off', color: 'bg-red-100 text-red-800' },
  'SR': { label: 'Store Requisition', color: 'bg-orange-100 text-orange-800' },
  'PC': { label: 'Physical Count', color: 'bg-indigo-100 text-indigo-800' },
  'WR': { label: 'Wastage Report', color: 'bg-rose-100 text-rose-800' }
}

// Transaction type labels and colors
export const transactionTypeConfig: Record<TransactionType, { label: string; color: string; bgColor: string }> = {
  'IN': { label: 'Inbound', color: 'text-green-600', bgColor: 'bg-green-100 text-green-800' },
  'OUT': { label: 'Outbound', color: 'text-red-600', bgColor: 'bg-red-100 text-red-800' }
}
