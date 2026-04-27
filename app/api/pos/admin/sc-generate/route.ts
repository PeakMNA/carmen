import { NextResponse } from 'next/server'
import { buildSCDocNumber } from '@/lib/services/sales-consumption-service'

export async function POST(request: Request) {
  const body = await request.json()
  const { locationId, shiftId, businessDate } = body as {
    locationId: string
    shiftId: string
    businessDate: string
  }

  if (!locationId || !shiftId || !businessDate) {
    return NextResponse.json({ error: 'locationId, shiftId, and businessDate are required' }, { status: 400 })
  }

  const docNumber = buildSCDocNumber(
    locationId.toUpperCase().slice(0, 6),
    shiftId.toUpperCase(),
    businessDate,
    1
  )

  return NextResponse.json({
    success: true,
    docNumber,
    locationId,
    shiftId,
    businessDate,
    status: 'draft',
    message: 'SC generation triggered (stub)',
  })
}
