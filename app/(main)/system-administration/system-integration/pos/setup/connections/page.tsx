'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import type { PosConnection } from '@/lib/types/pos-integration'
import { mockPosConnections } from '@/lib/mock-data/pos-integration'

const STATUS_BADGE_VARIANT: Record<PosConnection['status'], 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  paused: 'secondary',
  error: 'destructive',
}

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

export default function POSConnectionsPage() {
  const { toast } = useToast()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Connections</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Configure POS system connectors</p>
        </div>
        <Button asChild>
          <Link href="/system-administration/system-integration/pos/setup/connections/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Connection
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>POS Model</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Sync</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPosConnections.map((conn) => (
            <TableRow key={conn.id}>
              <TableCell className="font-medium">
                {POS_MODEL_LABELS[conn.posModel] ?? conn.posModel}
              </TableCell>
              <TableCell>{CONNECTOR_MODE_LABELS[conn.mode] ?? conn.mode}</TableCell>
              <TableCell>{conn.locationId}</TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE_VARIANT[conn.status]} className="capitalize">
                  {conn.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {conn.lastSyncAt
                  ? new Date(conn.lastSyncAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
