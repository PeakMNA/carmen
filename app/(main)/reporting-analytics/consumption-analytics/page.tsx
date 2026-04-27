import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import EnhancedConsumptionDashboard from './components/enhanced-consumption-dashboard'

// Loading component
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-muted animate-pulse rounded w-80" />
          <div className="h-4 bg-muted animate-pulse rounded w-96" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 bg-muted animate-pulse rounded w-48" />
          <div className="h-9 bg-muted animate-pulse rounded w-40" />
          <div className="h-9 bg-muted animate-pulse rounded w-32" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      
      <div className="h-96 bg-muted animate-pulse rounded-lg" />
    </div>
  )
}

export default function ConsumptionAnalyticsPage() {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
          <Link href="/reporting-analytics">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Analytics</span>
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground">
          <Link href="/reporting-analytics" className="hover:text-foreground">Analytics</Link>
          <span className="mx-2">/</span>
          <span>Consumption Analytics</span>
        </div>
      </div>

      {/* Main Dashboard */}
      <Suspense fallback={<DashboardSkeleton />}>
        <EnhancedConsumptionDashboard />
      </Suspense>
    </div>
  )
}