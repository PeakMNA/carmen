'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { POSDashboard } from '../components/pos-dashboard'
import {
  mockDashboardMetrics,
  mockTransactionStats,
} from '@/lib/mock-data/pos-integration'

export default function POSOperatePage() {
  const { toast } = useToast()

  const handleSync = useCallback(() => {
    toast({ title: 'Sync Started', description: 'Synchronizing with POS system...' })
    setTimeout(() => {
      toast({ title: 'Sync Complete', description: 'Successfully synchronized 45 transactions.' })
    }, 2000)
  }, [toast])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sync Health</h2>
        <Button variant="outline" asChild>
          <Link href="/system-administration/system-integration/pos/operate/exceptions">
            <AlertTriangle className="mr-2 h-4 w-4" />
            View Exception Queue
          </Link>
        </Button>
      </div>

      <POSDashboard
        metrics={mockDashboardMetrics}
        statistics={mockTransactionStats}
        onNavigateToTab={() => {}}
        onSync={handleSync}
      />
    </div>
  )
}
