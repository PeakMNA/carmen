import { describe, it, expect } from 'vitest'
import { getSCStatusLabel } from '@/lib/services/sales-consumption-service'
import type { SCStatus } from '@/lib/types/sales-consumption'
import { mockSalesConsumptions } from '@/lib/mock-data'

const ALL_STATUSES: SCStatus[] = ['draft', 'posted', 'posted_with_exceptions', 'blocked', 'voided']

describe('SCStatusBadge label mapping (via getSCStatusLabel)', () => {
  const expected: Record<SCStatus, string> = {
    draft: 'Draft',
    posted: 'Posted',
    posted_with_exceptions: 'Posted with Exceptions',
    blocked: 'Blocked',
    voided: 'Voided',
  }

  ALL_STATUSES.forEach((status) => {
    it(`maps ${status} to "${expected[status]}"`, () => {
      expect(getSCStatusLabel(status)).toBe(expected[status])
    })
  })
})

describe('mockSalesConsumptions shape', () => {
  it('contains 3 items', () => {
    expect(mockSalesConsumptions).toHaveLength(3)
  })

  it('each item has required fields for SCList rendering', () => {
    for (const sc of mockSalesConsumptions) {
      expect(sc.id).toBeDefined()
      expect(sc.docNumber).toBeDefined()
      expect(sc.businessDate).toBeDefined()
      expect(sc.shiftId).toBeDefined()
      expect(sc.status).toBeDefined()
      expect(typeof sc.transactionCount).toBe('number')
      expect(typeof sc.postedLineCount).toBe('number')
      expect(typeof sc.pendingLineCount).toBe('number')
      expect(typeof sc.totalCostPosted.amount).toBe('number')
    }
  })

  it('sc-003 is blocked with 12 pending lines', () => {
    const sc003 = mockSalesConsumptions.find((sc) => sc.id === 'sc-003')
    expect(sc003?.status).toBe('blocked')
    expect(sc003?.pendingLineCount).toBe(12)
  })
})
