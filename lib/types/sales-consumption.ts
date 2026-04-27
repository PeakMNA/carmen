import type { Money } from './common'

export type SCStatus =
  | 'draft'
  | 'posted'
  | 'posted_with_exceptions'
  | 'blocked'
  | 'voided'

export type SCLineStatus = 'posted' | 'pending' | 'reversed'

export type ExceptionCode =
  | 'UNMAPPED_ITEM'
  | 'MISSING_RECIPE'
  | 'ZERO_COST_INGREDIENT'
  | 'LOCATION_UNMAPPED'
  | 'FRACTIONAL_MISSING_VARIANT'
  | 'MODIFIER_UNMAPPED'
  | 'CURRENCY_MISMATCH'
  | 'VOID_AFTER_POST'
  | 'REFUND_PARTIAL'
  | 'TAX_ONLY_ITEM'
  | 'COMP_OR_DISCOUNT'
  | 'STALE_TRANSACTION'

export interface SalesConsumption {
  id: string
  docNumber: string
  locationId: string
  businessDate: string
  shiftId: string
  status: SCStatus
  sourceConnectionIds: string[]
  transactionCount: number
  postedLineCount: number
  pendingLineCount: number
  totalCostPosted: Money
  totalRevenue: Money
  parentSCId?: string
  voidedAt?: string
  voidedBy?: string
  voidReason?: string
  postedAt?: string
  postedBy: 'system' | string
  createdAt: string
  updatedAt: string
}

export interface SalesConsumptionLine {
  id: string
  scId: string
  posTransactionId: string
  posItemId: string
  posItemName: string
  recipeId?: string
  recipeName?: string
  ingredientProductId?: string
  ingredientProductName?: string
  qtyConsumed: number
  unitOfMeasure: string
  unitCost: number
  extendedCost: number
  currency: string
  status: SCLineStatus
  exceptionCode?: ExceptionCode
  exceptionDetail?: string
  reversesLineId?: string
  inventoryTransactionId?: string
  createdAt: string
}

export const EXCEPTION_CODE_LABELS: Record<ExceptionCode, string> = {
  UNMAPPED_ITEM: 'Unmapped Item',
  MISSING_RECIPE: 'Missing Recipe',
  ZERO_COST_INGREDIENT: 'Zero Cost Ingredient',
  LOCATION_UNMAPPED: 'Location Unmapped',
  FRACTIONAL_MISSING_VARIANT: 'Fractional Variant Missing',
  MODIFIER_UNMAPPED: 'Modifier Unmapped',
  CURRENCY_MISMATCH: 'Currency Mismatch',
  VOID_AFTER_POST: 'Void After Post',
  REFUND_PARTIAL: 'Partial Refund',
  TAX_ONLY_ITEM: 'Tax/Service Charge',
  COMP_OR_DISCOUNT: 'Comp / Full Discount',
  STALE_TRANSACTION: 'Stale Transaction',
}
