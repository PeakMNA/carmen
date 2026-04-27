import { NextResponse } from 'next/server'

export async function POST() {
  // Stub: in production this would trigger the POS sync job
  return NextResponse.json({
    success: true,
    message: 'POS sync triggered',
    triggeredAt: new Date().toISOString(),
  })
}
