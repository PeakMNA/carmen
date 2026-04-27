'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { POSDashboard } from '../components/pos-dashboard'
import {
  mockDashboardMetrics,
  mockTransactionStats,
} from '@/lib/mock-data/pos-integration'

const POS_BASE = '/system-administration/system-integration/pos'

const TAB_ROUTE_MAP: Record<string, string> = {
  mapping: `${POS_BASE}/setup`,
  transactions: `${POS_BASE}/audit`,
  dashboard: `${POS_BASE}/operate`,
  config: `${POS_BASE}/setup`,
}

export default function POSOperatePage() {
  const { toast } = useToast()
  const router = useRouter()

  const handleSync = useCallback(() => {
    toast({ title: 'Sync Started', description: 'Synchronizing with POS system...' })
    setTimeout(() => {
      toast({ title: 'Sync Complete', description: 'Successfully synchronized 45 transactions.' })
    }, 2000)
  }, [toast])

  const handleNavigateToTab = useCallback((tab: string) => {
    const route = TAB_ROUTE_MAP[tab] ?? `${POS_BASE}/operate`
    router.push(route)
  }, [router])

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
        onNavigateToTab={handleNavigateToTab}
        onSync={handleSync}
      />
    </div>
  )
}
