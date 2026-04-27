import type { SalesConsumption, SalesConsumptionLine, SCStatus, ExceptionCode } from '@/lib/types/sales-consumption'
import { EXCEPTION_CODE_LABELS } from '@/lib/types/sales-consumption'

const SC_STATUS_LABELS: Record<SCStatus, string> = {
  draft: 'Draft',
  posted: 'Posted',
  posted_with_exceptions: 'Posted with Exceptions',
  blocked: 'Blocked',
  voided: 'Voided',
}

export function buildSCDocNumber(
  locationCode: string,
  shiftId: string,
  businessDate: string,
  seq: number
): string {
  const datePart = businessDate.replace(/-/g, '')
  const seqPart = String(seq).padStart(3, '0')
  return `SC-${datePart}-${locationCode}-${shiftId}-${seqPart}`
}

export function getSCStatusLabel(status: SCStatus): string {
  return SC_STATUS_LABELS[status]
}

export function getSCLineStatusLabel(status: SalesConsumptionLine['status']): string {
  const labels: Record<SalesConsumptionLine['status'], string> = {
    posted: 'Posted',
    pending: 'Pending',
    reversed: 'Reversed',
  }
  return labels[status]
}

export function getExceptionCodeLabel(code: ExceptionCode): string {
  return EXCEPTION_CODE_LABELS[code]
}

export function groupSCLinesByStatus(lines: SalesConsumptionLine[]): {
  posted: SalesConsumptionLine[]
  pending: SalesConsumptionLine[]
  reversed: SalesConsumptionLine[]
} {
  return {
    posted: lines.filter(l => l.status === 'posted'),
    pending: lines.filter(l => l.status === 'pending'),
    reversed: lines.filter(l => l.status === 'reversed'),
  }
}

export function canVoidSC(sc: SalesConsumption): boolean {
  return sc.status !== 'voided' && sc.status !== 'draft'
}

export function getSCExceptionSummary(lines: SalesConsumptionLine[]): Record<string, number> {
  const pending = lines.filter(l => l.status === 'pending')
  return pending.reduce((acc, line) => {
    const code = line.exceptionCode ?? 'UNKNOWN'
    acc[code] = (acc[code] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
}
