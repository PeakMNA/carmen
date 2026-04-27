import { describe, it, expect } from 'vitest'
import { mockSalesConsumptions, mockSCLines } from '@/lib/mock-data'
import { getSCExceptionSummary, getExceptionCodeLabel } from '@/lib/services/sales-consumption-service'

describe('SC detail page data', () => {
  it('finds sc-001 in mockSalesConsumptions with pendingLineCount === 3', () => {
    const sc = mockSalesConsumptions.find((s) => s.id === 'sc-001')
    expect(sc).toBeDefined()
    expect(sc?.pendingLineCount).toBe(3)
  })

  it('getExceptionCodeLabel returns correct label for UNMAPPED_ITEM', () => {
    expect(getExceptionCodeLabel('UNMAPPED_ITEM')).toBe('Unmapped Item')
  })

  it('getSCExceptionSummary returns correct counts per exception code for sc-001 lines', () => {
    const sc001Lines = mockSCLines.filter((l) => l.scId === 'sc-001')
    const summary = getSCExceptionSummary(sc001Lines)
    expect(summary['UNMAPPED_ITEM']).toBe(1)
    expect(summary['MODIFIER_UNMAPPED']).toBe(1)
    expect(summary['ZERO_COST_INGREDIENT']).toBe(1)
    expect(Object.keys(summary)).toHaveLength(3)
  })
})
