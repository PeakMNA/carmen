"use client"

import { useState, useEffect, useCallback, Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Settings,
  FileText,
  Map,
  BarChart,
  ChevronLeft,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

// Import components
import { POSDashboard } from './components/pos-dashboard'
import { POSMappingTab } from './components/pos-mapping-tab'
import { POSTransactionsTab } from './components/pos-transactions-tab'
import { POSConfigTab } from './components/pos-config-tab'
import { POSReportsTab } from './components/pos-reports-tab'

// Import types
import type { POSMapping, POSIntegrationConfig } from '@/lib/types/pos-integration'

// Import mock data
import {
  mockPOSMappings,
  mockUnmappedPOSItems,
  mockRecipeSearchResults,
  mockLocationMappings,
  mockFractionalVariants,
  mockPOSTransactions,
  mockPendingTransactions,
  mockTransactionLineItems,
  mockTransactionErrors,
  mockInventoryImpactPreview,
  mockPOSConfig,
  mockDashboardMetrics,
  mockTransactionStats,
  mockGrossProfitReport,
  mockConsumptionAnalysis
} from '@/lib/mock-data/pos-integration'

function POSIntegrationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'dashboard')

  // State for data (in real app, this would come from API/store)
  const [mappings, setMappings] = useState<POSMapping[]>(mockPOSMappings)
  const [config, setConfig] = useState<POSIntegrationConfig>(mockPOSConfig)

  // Sync tab state with URL query param
  useEffect(() => {
    if (tabParam && ['dashboard', 'mapping', 'transactions', 'config', 'reports'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    router.push(`/system-administration/system-integration/pos?tab=${value}`, { scroll: false })
  }, [router])

  // Handler functions
  const handleSync = useCallback(() => {
    toast({
      title: 'Sync Started',
      description: 'Synchronizing with POS system...'
    })
    // Simulate sync
    setTimeout(() => {
      toast({
        title: 'Sync Complete',
        description: 'Successfully synchronized 45 transactions.'
      })
    }, 2000)
  }, [toast])

  const handleCreateMapping = useCallback((mapping: Partial<POSMapping>) => {
    const newMapping: POSMapping = {
      id: `mapping-${Date.now()}`,
      posItemId: mapping.posItemId || '',
      posItemName: mapping.posItemName || '',
      posItemCategory: mapping.posItemCategory || '',
      posOutletId: mapping.posOutletId || '',
      posOutletName: mapping.posOutletName || '',
      locationId: mapping.locationId || '',
      locationName: mapping.locationName || '',
      recipeId: mapping.recipeId || '',
      recipeName: mapping.recipeName || '',
      recipeCategory: mapping.recipeCategory || '',
      portionSize: mapping.portionSize || 1,
      unit: mapping.unit || 'serving',
      unitPrice: mapping.unitPrice || { amount: 0, currency: 'USD' },
      isActive: true,
      mappedBy: { id: 'user-001', name: 'Current User' },
      mappedAt: new Date().toISOString(),
      createdAt: new Date(),
      createdBy: 'user-001',
      updatedAt: new Date(),
      updatedBy: 'user-001'
    }
    setMappings(prev => [...prev, newMapping])
    toast({
      title: 'Mapping Created',
      description: `${mapping.posItemName} has been mapped to ${mapping.recipeName}.`
    })
  }, [toast])

  const handleUpdateMapping = useCallback((id: string, updates: Partial<POSMapping>) => {
    setMappings(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m))
    toast({
      title: 'Mapping Updated',
      description: 'The mapping has been updated successfully.'
    })
  }, [toast])

  const handleDeleteMapping = useCallback((id: string) => {
    setMappings(prev => prev.filter(m => m.id !== id))
    toast({
      title: 'Mapping Deleted',
      description: 'The mapping has been removed.'
    })
  }, [toast])

  const handleSyncPOSItems = useCallback(() => {
    toast({
      title: 'Syncing POS Items',
      description: 'Fetching latest items from POS system...'
    })
    setTimeout(() => {
      toast({
        title: 'Sync Complete',
        description: 'Found 2 new items, 0 updated.'
      })
    }, 1500)
  }, [toast])

  const handleApproveTransaction = useCallback((id: string, notes?: string) => {
    toast({
      title: 'Transaction Approved',
      description: `Transaction ${id} has been approved and processed.`
    })
  }, [toast])

  const handleRejectTransaction = useCallback((id: string, reason: string) => {
    toast({
      title: 'Transaction Rejected',
      description: `Transaction ${id} has been rejected.`,
      variant: 'destructive'
    })
  }, [toast])

  const handleRetryTransaction = useCallback((id: string) => {
    toast({
      title: 'Retrying Transaction',
      description: `Attempting to reprocess transaction ${id}...`
    })
  }, [toast])

  const handleBulkApprove = useCallback((ids: string[]) => {
    toast({
      title: 'Bulk Approval',
      description: `${ids.length} transactions approved and processed.`
    })
  }, [toast])

  const handleUpdateConfig = useCallback((updates: Partial<POSIntegrationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates, updatedAt: new Date() }))
    toast({
      title: 'Configuration Saved',
      description: 'Your POS integration settings have been updated.'
    })
  }, [toast])

  const handleTestConnection = useCallback(async () => {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500))
    return true
  }, [])

  const handleResetConfig = useCallback(() => {
    setConfig(mockPOSConfig)
    toast({
      title: 'Configuration Reset',
      description: 'POS integration settings have been reset to defaults.',
      variant: 'destructive'
    })
  }, [toast])

  const handleExportReport = useCallback((reportType: string, format: 'csv' | 'pdf' | 'excel') => {
    toast({
      title: 'Export Started',
      description: `Generating ${reportType} report in ${format.toUpperCase()} format...`
    })
  }, [toast])

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
              <Link href="/system-administration/system-integration">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">POS Integration</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Configure and manage point-of-sale system integrations
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="mapping" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            Mapping
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <POSDashboard
            metrics={mockDashboardMetrics}
            statistics={mockTransactionStats}
            onNavigateToTab={handleTabChange}
            onSync={handleSync}
          />
        </TabsContent>

        {/* Mapping Tab */}
        <TabsContent value="mapping">
          <POSMappingTab
            mappings={mappings}
            unmappedItems={mockUnmappedPOSItems}
            locationMappings={mockLocationMappings}
            fractionalVariants={mockFractionalVariants}
            recipeSearchResults={mockRecipeSearchResults}
            onCreateMapping={handleCreateMapping}
            onUpdateMapping={handleUpdateMapping}
            onDeleteMapping={handleDeleteMapping}
            onSyncPOSItems={handleSyncPOSItems}
          />
        </TabsContent>

        {/* Transactions Tab */}
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

        {/* Configuration Tab */}
        <TabsContent value="config">
          <POSConfigTab
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onTestConnection={handleTestConnection}
            onResetConfig={handleResetConfig}
          />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <POSReportsTab
            grossProfitReport={mockGrossProfitReport}
            consumptionAnalysis={mockConsumptionAnalysis}
            period={mockTransactionStats.period}
            onExportReport={handleExportReport}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function POSIntegrationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <POSIntegrationContent />
    </Suspense>
  )
}
