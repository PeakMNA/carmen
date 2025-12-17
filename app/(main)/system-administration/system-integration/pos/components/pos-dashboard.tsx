"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Activity,
  Link2,
  Link2Off,
  TrendingUp,
  ArrowRight
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { POSDashboardMetrics, TransactionStatistics } from "@/lib/types/pos-integration"
import { formatNumber } from "@/lib/utils/formatters"

interface POSDashboardProps {
  metrics: POSDashboardMetrics
  statistics: TransactionStatistics
  onNavigateToTab: (tab: string) => void
  onSync: () => void
}

export function POSDashboard({ metrics, statistics, onNavigateToTab, onSync }: POSDashboardProps) {
  const connectionStatusConfig = useMemo(() => {
    switch (metrics.systemStatus) {
      case 'connected':
        return { icon: CheckCircle2, label: 'Connected', color: 'text-green-600', bg: 'bg-green-50' }
      case 'disconnected':
        return { icon: Link2Off, label: 'Disconnected', color: 'text-gray-500', bg: 'bg-gray-50' }
      case 'error':
        return { icon: XCircle, label: 'Error', color: 'text-red-600', bg: 'bg-red-50' }
      default:
        return { icon: Activity, label: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-50' }
    }
  }, [metrics.systemStatus])

  const StatusIcon = connectionStatusConfig.icon

  return (
    <div className="space-y-6">
      {/* System Status Banner */}
      <Card className={connectionStatusConfig.bg}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${connectionStatusConfig.bg}`}>
                <StatusIcon className={`h-6 w-6 ${connectionStatusConfig.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">POS System Status</h3>
                <p className="text-sm text-muted-foreground">
                  {metrics.systemStatus === 'connected'
                    ? `Last synced ${formatDistanceToNow(new Date(metrics.syncStatus.lastSyncAt), { addSuffix: true })}`
                    : 'Unable to connect to POS system'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={metrics.systemStatus === 'connected' ? 'default' : 'destructive'}>
                {connectionStatusConfig.label}
              </Badge>
              <Button variant="outline" size="sm" onClick={onSync}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigateToTab('mapping')}
        >
          <CardHeader className="pb-2">
            <CardDescription>Unmapped Items</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {metrics.alerts.unmappedItems}
              {metrics.alerts.unmappedItems > 0 && (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              POS items without recipe mapping
            </p>
            <Button variant="link" className="p-0 h-auto mt-2" size="sm">
              View unmapped <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigateToTab('transactions')}
        >
          <CardHeader className="pb-2">
            <CardDescription>Pending Approvals</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {metrics.alerts.pendingApprovals}
              {metrics.alerts.pendingApprovals > 0 && (
                <Clock className="h-5 w-5 text-blue-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Transactions awaiting approval
            </p>
            <Button variant="link" className="p-0 h-auto mt-2" size="sm">
              Review pending <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigateToTab('transactions')}
        >
          <CardHeader className="pb-2">
            <CardDescription>Failed Transactions</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {metrics.alerts.failedTransactions}
              {metrics.alerts.failedTransactions > 0 && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Transactions requiring attention
            </p>
            <Button variant="link" className="p-0 h-auto mt-2" size="sm">
              View failed <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigateToTab('mapping')}
        >
          <CardHeader className="pb-2">
            <CardDescription>Fractional Variants</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {metrics.alerts.fractionalVariants}
              <Link2 className="h-5 w-5 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Active fractional mappings
            </p>
            <Button variant="link" className="p-0 h-auto mt-2" size="sm">
              Manage variants <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transaction Statistics
            </CardTitle>
            <CardDescription>
              Period: {new Date(statistics.period.startDate).toLocaleDateString()} - {new Date(statistics.period.endDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{formatNumber(statistics.totalTransactions)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${formatNumber(statistics.totalValue.amount)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{statistics.processingAccuracy}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                <p className="text-2xl font-bold">${formatNumber(statistics.averageTransactionValue.amount)}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Successful: {formatNumber(statistics.successfulTransactions)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Failed: {formatNumber(statistics.failedTransactions)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Pending: {formatNumber(statistics.pendingApprovals)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest POS transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentActivity.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.status === 'success' ? 'bg-green-500' :
                      transaction.status === 'failed' ? 'bg-red-500' :
                      transaction.status === 'pending_approval' ? 'bg-amber-500' :
                      transaction.status === 'processing' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{transaction.transactionId}</p>
                      <p className="text-xs text-muted-foreground">{transaction.location.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${formatNumber(transaction.totalAmount.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle>Synchronization Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="text-lg font-medium">
                {new Date(metrics.syncStatus.lastSyncAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Sync</p>
              <p className="text-lg font-medium">
                {new Date(metrics.syncStatus.nextSyncAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sync Frequency</p>
              <p className="text-lg font-medium">{metrics.syncStatus.syncFrequency}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
