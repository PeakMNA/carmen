import { describe, it, expect } from 'vitest'
import {
  buildSCDocNumber,
  getSCStatusLabel,
  getSCLineStatusLabel,
  getExceptionCodeLabel,
  groupSCLinesByStatus,
  canVoidSC,
  getSCExceptionSummary,
} from '@/lib/services/sales-consumption-service'
import type { SalesConsumption, SalesConsumptionLine } from '@/lib/types/sales-consumption'

describe('buildSCDocNumber', () => {
  it('formats correctly', () => {
    expect(buildSCDocNumber('MAIN', 'shift-lunch', '2026-01-27', 1))
      .toBe('SC-20260127-MAIN-shift-lunch-001')
  })

  it('pads sequence number', () => {
    expect(buildSCDocNumber('OUTLET2', 'all_day', '2026-01-27', 12))
      .toBe('SC-20260127-OUTLET2-all_day-012')
  })
})

describe('getSCStatusLabel', () => {
  it('maps all statuses to human labels', () => {
    expect(getSCStatusLabel('posted')).toBe('Posted')
    expect(getSCStatusLabel('posted_with_exceptions')).toBe('Posted with Exceptions')
    expect(getSCStatusLabel('blocked')).toBe('Blocked')
    expect(getSCStatusLabel('draft')).toBe('Draft')
    expect(getSCStatusLabel('voided')).toBe('Voided')
  })
})

describe('getExceptionCodeLabel', () => {
  it('returns human-readable label', () => {
    expect(getExceptionCodeLabel('UNMAPPED_ITEM')).toBe('Unmapped Item')
    expect(getExceptionCodeLabel('MODIFIER_UNMAPPED')).toBe('Modifier Unmapped')
  })
})

describe('groupSCLinesByStatus', () => {
  const lines: SalesConsumptionLine[] = [
    { id: '1', scId: 'sc-1', posTransactionId: 'p1', posItemId: 'i1', posItemName: 'A',
      qtyConsumed: 1, unitOfMeasure: 'kg', unitCost: 1, extendedCost: 1,
      currency: 'USD', status: 'posted', createdAt: '2026-01-27T00:00:00Z' },
    { id: '2', scId: 'sc-1', posTransactionId: 'p2', posItemId: 'i2', posItemName: 'B',
      qtyConsumed: 0, unitOfMeasure: '', unitCost: 0, extendedCost: 0,
      currency: 'USD', status: 'pending', exceptionCode: 'UNMAPPED_ITEM',
      createdAt: '2026-01-27T00:00:00Z' },
  ]

  it('groups by status', () => {
    const grouped = groupSCLinesByStatus(lines)
    expect(grouped.posted).toHaveLength(1)
    expect(grouped.pending).toHaveLength(1)
    expect(grouped.reversed).toHaveLength(0)
  })
})

describe('canVoidSC', () => {
  const baseSC = (status: SalesConsumption['status']): SalesConsumption => ({
    id: 'sc-1', docNumber: 'SC-001', locationId: 'loc-1',
    businessDate: '2026-01-27', shiftId: 'shift-lunch', status,
    sourceConnectionIds: [], transactionCount: 0, postedLineCount: 0,
    pendingLineCount: 0,
    totalCostPosted: { amount: 0, currency: 'USD' },
    totalRevenue: { amount: 0, currency: 'USD' },
    postedBy: 'system', createdAt: '2026-01-27T00:00:00Z',
    updatedAt: '2026-01-27T00:00:00Z',
  })

  it('allows void for posted status', () => {
    expect(canVoidSC(baseSC('posted'))).toBe(true)
  })

  it('allows void for posted_with_exceptions status', () => {
    expect(canVoidSC(baseSC('posted_with_exceptions'))).toBe(true)
  })

  it('disallows void for already voided', () => {
    expect(canVoidSC(baseSC('voided'))).toBe(false)
  })

  it('disallows void for draft', () => {
    expect(canVoidSC(baseSC('draft'))).toBe(false)
  })
})

describe('getSCExceptionSummary', () => {
  it('counts exceptions by code', () => {
    const lines: SalesConsumptionLine[] = [
      { id: '1', scId: 'sc-1', posTransactionId: 'p1', posItemId: 'i1', posItemName: 'A',
        qtyConsumed: 0, unitOfMeasure: '', unitCost: 0, extendedCost: 0,
        currency: 'USD', status: 'pending', exceptionCode: 'UNMAPPED_ITEM',
        createdAt: '2026-01-27T00:00:00Z' },
      { id: '2', scId: 'sc-1', posTransactionId: 'p2', posItemId: 'i2', posItemName: 'B',
        qtyConsumed: 0, unitOfMeasure: '', unitCost: 0, extendedCost: 0,
        currency: 'USD', status: 'pending', exceptionCode: 'UNMAPPED_ITEM',
        createdAt: '2026-01-27T00:00:00Z' },
      { id: '3', scId: 'sc-1', posTransactionId: 'p3', posItemId: 'i3', posItemName: 'C',
        qtyConsumed: 1, unitOfMeasure: 'kg', unitCost: 1, extendedCost: 1,
        currency: 'USD', status: 'posted', createdAt: '2026-01-27T00:00:00Z' },
    ]
    const summary = getSCExceptionSummary(lines)
    expect(summary['UNMAPPED_ITEM']).toBe(2)
    expect(summary['MODIFIER_UNMAPPED']).toBeUndefined()
  })
})
