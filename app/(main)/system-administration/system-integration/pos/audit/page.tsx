'use client'

import { useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { POSTransactionsTab } from '../components/pos-transactions-tab'
import {
  mockPOSTransactions,
  mockPendingTransactions,
  mockTransactionLineItems,
  mockTransactionErrors,
  mockInventoryImpactPreview,
} from '@/lib/mock-data/pos-integration'

interface SyncEvent {
  id: string
  timestamp: string
  connectionName: string
  mode: string
  transactionsFetched: number
  transactionsNew: number
  errors: number
  durationMs: number
}

const mockSyncEvents: SyncEvent[] = [
  {
    id: 'evt-001',
    timestamp: '2026-04-27T08:30:00Z',
    connectionName: 'Square – Main Location',
    mode: 'api',
    transactionsFetched: 45,
    transactionsNew: 12,
    errors: 0,
    durationMs: 1240,
  },
  {
    id: 'evt-002',
    timestamp: '2026-04-27T08:15:00Z',
    connectionName: 'Toast – Rooftop Bar',
    mode: 'webhook',
    transactionsFetched: 8,
    transactionsNew: 8,
    errors: 1,
    durationMs: 380,
  },
  {
    id: 'evt-003',
    timestamp: '2026-04-26T22:00:00Z',
    connectionName: 'Square – Main Location',
    mode: 'api',
    transactionsFetched: 112,
    transactionsNew: 0,
    errors: 0,
    durationMs: 2100,
  },
  {
    id: 'evt-004',
    timestamp: '2026-04-26T06:00:00Z',
    connectionName: 'Generic CSV – Kitchen POS',
    mode: 'file_import',
    transactionsFetched: 0,
    transactionsNew: 0,
    errors: 3,
    durationMs: 510,
  },
]

export default function POSAuditPage() {
  const { toast } = useToast()

  const handleApproveTransaction = useCallback((id: string) => {
    toast({ title: 'Transaction Approved', description: `Transaction ${id} has been approved and processed.` })
  }, [toast])

  const handleRejectTransaction = useCallback((id: string) => {
    toast({ title: 'Transaction Rejected', description: `Transaction ${id} has been rejected.`, variant: 'destructive' })
  }, [toast])

  const handleRetryTransaction = useCallback((id: string) => {
    toast({ title: 'Retrying Transaction', description: `Attempting to reprocess transaction ${id}...` })
  }, [toast])

  const handleBulkApprove = useCallback((ids: string[]) => {
    toast({ title: 'Bulk Approval', description: `${ids.length} transactions approved and processed.` })
  }, [toast])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Audit Log</h2>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Raw Transactions</TabsTrigger>
          <TabsTrigger value="sync-events">Sync Events</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <POSTransactionsTab
            transactions={mockPOSTransactions}
            pendingTransactions={mockPendingTransactions}
            transactionLineItems={mockTransactionLineItems}
            transactionErrors={mockTransactionErrors}
            inventoryImpactPreview={mockInventoryImpactPreview}
            onApproveTransaction={handleApproveTransaction}
            onRejectTransaction={handleRejectTransaction}
            onRetryTransaction={handleRetryTransaction}
            onBulkApprove={handleBulkApprove}
          />
        </TabsContent>

        <TabsContent value="sync-events">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Connection</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead className="text-right">Fetched</TableHead>
                <TableHead className="text-right">New</TableHead>
                <TableHead className="text-right">Errors</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSyncEvents.map(evt => (
                <TableRow key={evt.id}>
                  <TableCell className="text-muted-foreground">
                    {new Date(evt.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{evt.connectionName}</TableCell>
                  <TableCell className="capitalize">{evt.mode.replace('_', ' ')}</TableCell>
                  <TableCell className="text-right">{evt.transactionsFetched}</TableCell>
                  <TableCell className="text-right">{evt.transactionsNew}</TableCell>
                  <TableCell className="text-right">
                    {evt.errors > 0 ? (
                      <Badge variant="destructive">{evt.errors}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {evt.durationMs.toLocaleString()} ms
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}
