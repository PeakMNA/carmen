import { describe, it, expect } from 'vitest'
import { TransactionType } from '@/lib/types/inventory'

describe('TransactionType', () => {
  it('includes SALES_CONSUMPTION', () => {
    expect(TransactionType.SALES_CONSUMPTION).toBe('SALES_CONSUMPTION')
  })
})
