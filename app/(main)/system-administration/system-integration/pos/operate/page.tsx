'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { mockSCLines } from '@/lib/mock-data/sales-consumption'
import { EXCEPTION_CODE_SEVERITY } from '@/lib/types/sales-consumption'
import { mockPosConnections, mockDashboardMetrics } from '@/lib/mock-data/pos-integration'

const POS_BASE = '/system-administration/system-integration/pos'

const POS_MODEL_LABELS: Record<string, string> = {
  square: 'Square',
  toast: 'Toast',
  lightspeed: 'Lightspeed',
  micros: 'Micros',
  generic_csv: 'Generic CSV',
  generic_xml: 'Generic XML',
}

const CONNECTOR_MODE_LABELS: Record<string, string> = {
  api: 'API',
  file_import: 'File Import',
  webhook: 'Webhook',
}

function ConnectionStatusDot({ status }: { status: string }) {
  if (status === 'active') return <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
  if (status === 'paused') return <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
  return <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
}

export default function POSOperatePage() {
  const { toast } = useToast()

  const handleSync = useCallback(() => {
    toast({ title: 'Sync Started', description: 'Synchronizing with POS system...' })
    setTimeout(() => {
      toast({ title: 'Sync Complete', description: 'Successfully synchronized 45 transactions.' })
    }, 2000)
  }, [toast])

  const pendingLines = mockSCLines.filter(l => l.status === 'pending')

  const bySeverity = pendingLines.reduce<Record<string, number>>((acc, line) => {
    const sev = line.exceptionCode ? EXCEPTION_CODE_SEVERITY[line.exceptionCode] : 'operational'
    acc[sev] = (acc[sev] ?? 0) + 1
    return acc
  }, {})

  const lastSyncAt = mockDashboardMetrics.syncStatus.lastSyncAt

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Sync Health</h2>

      {/* Exception Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Exception Queue</CardTitle>
              <CardDescription className="mt-0.5">
                POS lines that need attention before inventory can update
              </CardDescription>
            </div>
            <Button asChild>
              <Link href={`${POS_BASE}/operate/exceptions`}>
                Resolve now
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingLines.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              No pending exceptions — all clear.
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-600">{pendingLines.length}</span>
                <span className="text-sm text-muted-foreground">pending</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(bySeverity).map(([sev, count]) => (
                  <Badge key={sev} variant="secondary" className="capitalize">
                    {count} {sev}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connections */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Connections</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`${POS_BASE}/setup`}>Manage</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {mockPosConnections.map(conn => (
              <div key={conn.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <ConnectionStatusDot status={conn.status} />
                  <div>
                    <p className="text-sm font-medium">
                      {POS_MODEL_LABELS[conn.posModel] ?? conn.posModel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {CONNECTOR_MODE_LABELS[conn.mode] ?? conn.mode} · {conn.locationId}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {conn.lastSyncAt
                    ? formatDistanceToNow(new Date(conn.lastSyncAt), { addSuffix: true })
                    : 'Never synced'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Sync */}
      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
        <div className="text-sm">
          <span className="text-muted-foreground">Last sync: </span>
          <span className="font-medium">
            {formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })}
          </span>
          <span className="ml-4 text-muted-foreground">
            Every {mockDashboardMetrics.syncStatus.syncFrequency}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleSync}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Sync Now
        </Button>
      </div>
    </div>
  )
}
