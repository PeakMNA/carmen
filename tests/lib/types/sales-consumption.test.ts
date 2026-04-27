import { describe, it, expect } from 'vitest'
import type {
  SalesConsumption,
  SalesConsumptionLine,
  SCStatus,
  SCLineStatus,
  ExceptionCode,
} from '@/lib/types/sales-consumption'
import { EXCEPTION_CODE_LABELS } from '@/lib/types/sales-consumption'

describe('SalesConsumption types', () => {
  it('SalesConsumption has required fields', () => {
    const sc: SalesConsumption = {
      id: 'sc-001',
      docNumber: 'SC-20260127-MAIN-LUNCH-001',
      locationId: 'loc-1',
      businessDate: '2026-01-27',
      shiftId: 'shift-lunch',
      status: 'posted',
      sourceConnectionIds: ['conn-1'],
      transactionCount: 10,
      postedLineCount: 8,
      pendingLineCount: 2,
      totalCostPosted: { amount: 100, currency: 'USD' },
      totalRevenue: { amount: 400, currency: 'USD' },
      postedBy: 'system',
      createdAt: '2026-01-27T15:00:00Z',
      updatedAt: '2026-01-27T15:05:00Z',
    }
    expect(sc.status).toBe('posted')
    expect(sc.postedBy).toBe('system')
  })

  it('SalesConsumptionLine has exception fields when pending', () => {
    const line: SalesConsumptionLine = {
      id: 'scl-001',
      scId: 'sc-001',
      posTransactionId: 'pos-txn-001',
      posItemId: 'item-99',
      posItemName: 'Oat Milk Latte',
      qtyConsumed: 0,
      unitOfMeasure: '',
      unitCost: 0,
      extendedCost: 0,
      currency: 'USD',
      status: 'pending',
      exceptionCode: 'UNMAPPED_ITEM',
      createdAt: '2026-01-27T15:00:00Z',
    }
    expect(line.exceptionCode).toBe('UNMAPPED_ITEM')
  })

  it('EXCEPTION_CODE_LABELS covers all 12 codes', () => {
    expect(Object.keys(EXCEPTION_CODE_LABELS)).toHaveLength(12)
    expect(EXCEPTION_CODE_LABELS['UNMAPPED_ITEM']).toBe('Unmapped Item')
  })
})
