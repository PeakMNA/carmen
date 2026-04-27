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
  mockSyncEvents,
} from '@/lib/mock-data/pos-integration'

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
                  <TableCell className="capitalize">{evt.mode.replace(/_/g, ' ')}</TableCell>
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
