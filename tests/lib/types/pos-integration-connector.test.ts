import { describe, it, expect } from 'vitest'
import type { ConnectorMode, PosConnection } from '@/lib/types/pos-integration'
import { POS_MODEL_CONNECTOR_MODES } from '@/lib/types/pos-integration'

describe('PosConnection types', () => {
  it('supports api connector mode', () => {
    const conn: PosConnection = {
      id: 'conn-1',
      posModel: 'square',
      mode: 'api',
      syncSchedule: '*/15 * * * *',
      locationId: 'loc-1',
      status: 'active',
    }
    expect(conn.mode).toBe('api')
  })

  it('supports file_import connector mode', () => {
    const conn: PosConnection = {
      id: 'conn-2',
      posModel: 'generic_csv',
      mode: 'file_import',
      syncSchedule: '0 0 * * *',
      locationId: 'loc-2',
      status: 'active',
    }
    expect(conn.mode).toBe('file_import')
  })

  it('POS_MODEL_CONNECTOR_MODES lists valid modes per model', () => {
    expect(POS_MODEL_CONNECTOR_MODES['square']).toContain('api')
    expect(POS_MODEL_CONNECTOR_MODES['generic_csv']).toContain('file_import')
    expect(POS_MODEL_CONNECTOR_MODES['micros']).not.toContain('api')
  })
})
