import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Sales import has been removed. Use POS Integration → Setup → Connections to configure data ingestion.',
      moved: false,
    },
    { status: 410 }
  )
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Sales import has been removed. Use POS Integration → Setup → Connections to configure data ingestion.',
      moved: false,
    },
    { status: 410 }
  )
}
