import { describe, it, expect } from 'vitest'
import {
  aggregateSCCostByPOSItem,
  computeGrossMargin,
  classifyMenuItemPerformance,
} from '@/lib/services/menu-engineering-data-source'
import type { SalesConsumptionLine } from '@/lib/types/sales-consumption'

const mockLines: SalesConsumptionLine[] = [
  { id: 'l1', scId: 'sc1', posTransactionId: 'p1', posItemId: 'item-A',
    posItemName: 'Americano', qtyConsumed: 0.018, unitOfMeasure: 'kg',
    unitCost: 45, extendedCost: 0.81, currency: 'USD', status: 'posted',
    createdAt: '2026-01-27T00:00:00Z' },
  { id: 'l2', scId: 'sc1', posTransactionId: 'p2', posItemId: 'item-A',
    posItemName: 'Americano', qtyConsumed: 0.002, unitOfMeasure: 'kg',
    unitCost: 10, extendedCost: 0.02, currency: 'USD', status: 'posted',
    createdAt: '2026-01-27T00:00:00Z' },
  { id: 'l3', scId: 'sc1', posTransactionId: 'p3', posItemId: 'item-B',
    posItemName: 'Latte', qtyConsumed: 0.2, unitOfMeasure: 'L',
    unitCost: 2, extendedCost: 0.40, currency: 'USD', status: 'posted',
    createdAt: '2026-01-27T00:00:00Z' },
]

describe('aggregateSCCostByPOSItem', () => {
  it('sums extended cost per POS item', () => {
    const result = aggregateSCCostByPOSItem(mockLines)
    expect(result['item-A']).toBeCloseTo(0.83)
    expect(result['item-B']).toBeCloseTo(0.40)
  })

  it('ignores pending lines', () => {
    const withPending: SalesConsumptionLine[] = [
      ...mockLines,
      { id: 'l4', scId: 'sc1', posTransactionId: 'p4', posItemId: 'item-C',
        posItemName: 'Pending Item', qtyConsumed: 0, unitOfMeasure: '', unitCost: 0,
        extendedCost: 0, currency: 'USD', status: 'pending',
        exceptionCode: 'UNMAPPED_ITEM', createdAt: '2026-01-27T00:00:00Z' },
    ]
    const result = aggregateSCCostByPOSItem(withPending)
    expect(result['item-C']).toBeUndefined()
  })
})

describe('computeGrossMargin', () => {
  it('calculates gross margin percentage', () => {
    expect(computeGrossMargin(5.00, 1.50)).toBeCloseTo(0.70)
  })

  it('returns 0 when revenue is 0', () => {
    expect(computeGrossMargin(0, 1.00)).toBe(0)
  })
})

describe('classifyMenuItemPerformance', () => {
  it('classifies star (high margin, high volume)', () => {
    expect(classifyMenuItemPerformance(0.8, 0.6, 100, 50)).toBe('star')
  })

  it('classifies plowhorse (low margin, high volume)', () => {
    expect(classifyMenuItemPerformance(0.4, 0.6, 100, 50)).toBe('plowhorse')
  })

  it('classifies puzzle (high margin, low volume)', () => {
    expect(classifyMenuItemPerformance(0.8, 0.6, 20, 50)).toBe('puzzle')
  })

  it('classifies dog (low margin, low volume)', () => {
    expect(classifyMenuItemPerformance(0.4, 0.6, 20, 50)).toBe('dog')
  })
})
