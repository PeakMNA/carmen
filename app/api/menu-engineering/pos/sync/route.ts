import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.redirect(
    new URL('/api/pos/sync', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
    308
  )
}

export async function GET() {
  return NextResponse.redirect(
    new URL('/api/pos/sync', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
    308
  )
}
