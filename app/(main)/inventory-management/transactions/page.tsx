"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, RefreshCw, ArrowRightLeft, BarChart3, List } from "lucide-react"
import { useUser } from "@/lib/context/simple-user-context"
import {
  generateMockTransactionHistory,
  getAvailableLocations,
  getAvailableCategories
} from "@/lib/mock-data/transactions"
import {
  TransactionSummaryCards,
  TransactionFilters,
  TransactionTable,
  TransactionAnalytics
} from "./components"
import {
  TransactionFilterParams,
  TransactionHistoryData
} from "./types"

export default function TransactionsPage() {
  const router = useRouter()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("transactions")
  const [data, setData] = useState<TransactionHistoryData | null>(null)

  // Filter state
  const [filters, setFilters] = useState<TransactionFilterParams>({
    dateRange: { from: undefined, to: undefined },
    transactionTypes: [],
    referenceTypes: [],
    locations: [],
    categories: [],
    searchTerm: ''
  })

  // Get available locations filtered by user permissions
  const availableLocations = useMemo(() => {
    const allLocations = getAvailableLocations()

    if (user?.role === 'System Administrator') {
      return allLocations
    }

    if (user?.availableLocations) {
      const userLocationIds = user.availableLocations.map(l => l.id)
      return allLocations.filter(loc => userLocationIds.includes(loc.id))
    }

    return allLocations
  }, [user])

  const availableCategories = useMemo(() => getAvailableCategories(), [])

  // Load data with filters
  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      // Apply location filtering based on user permissions
      const effectiveFilters = { ...filters }

      if (user?.role !== 'System Administrator' && user?.availableLocations) {
        const userLocationIds = user.availableLocations.map(l => l.id)

        // If no locations selected, use user's available locations
        if (effectiveFilters.locations.length === 0) {
          effectiveFilters.locations = userLocationIds
        } else {
          // Filter to only include user's available locations
          effectiveFilters.locations = effectiveFilters.locations.filter(
            loc => userLocationIds.includes(loc)
          )
        }
      }

      const result = generateMockTransactionHistory(effectiveFilters)
      setData(result)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [filters, user])

  const handleRefresh = () => {
    setIsLoading(true)
    // Re-trigger the effect by updating a dependency
    setFilters(prev => ({ ...prev }))
  }

  const handleExport = () => {
    if (!data) return

    // Generate CSV content
    const headers = [
      'Date',
      'Time',
      'Reference',
      'Reference Type',
      'Product Code',
      'Product Name',
      'Category',
      'Location',
      'Transaction Type',
      'Qty In',
      'Qty Out',
      'Unit Cost',
      'Total Value',
      'Balance Before',
      'Balance After',
      'User'
    ]

    const rows = data.records.map(record => [
      record.date,
      record.time,
      record.reference,
      record.referenceType,
      record.productCode,
      record.productName,
      record.categoryName,
      record.locationName,
      record.transactionType,
      record.quantityIn,
      record.quantityOut,
      record.unitCost,
      record.totalValue,
      record.balanceBefore,
      record.balanceAfter,
      record.createdByName
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `inventory-transactions-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/inventory-management')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Inventory Transactions</h1>
            </div>
            <p className="text-muted-foreground">
              View and analyze all inventory movements across locations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isLoading || !data?.records.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <TransactionSummaryCards
        summary={data?.summary || {
          totalTransactions: 0,
          totalInQuantity: 0,
          totalOutQuantity: 0,
          netQuantityChange: 0,
          totalInValue: 0,
          totalOutValue: 0,
          netValueChange: 0,
          adjustmentCount: 0,
          adjustmentValue: 0
        }}
        isLoading={isLoading}
      />

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableLocations={availableLocations}
        availableCategories={availableCategories}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions" className="gap-2">
            <List className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionTable
            records={data?.records || []}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <TransactionAnalytics
            analytics={data?.analytics || {
              trendData: [],
              byTransactionType: [],
              byLocation: [],
              byReferenceType: [],
              byCategory: []
            }}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
